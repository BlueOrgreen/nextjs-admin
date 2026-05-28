# 腾讯云轻量服务器部署指南

目标环境：

| 项目 | 值 |
|------|-----|
| 服务器 | 腾讯云轻量，Ubuntu |
| 公网 IP | `43.139.140.110` |
| 管理后台 | `https://www.admin.chenchar.com` |
| API 网关 | `https://api.chenchar.com` |
| 部署根目录 | `/home/yunfan`（`yunfan` 用户家目录） |
| 编排目录 | `/home/yunfan/my-firstnest`（与 `web-nest` 同级） |

## 1. DNS（DNSPod）

在 `chenchar.com` 解析中添加 **A 记录**（均指向 `43.139.140.110`）：

| 主机记录 | 记录类型 | 记录值 |
|----------|----------|--------|
| `www.admin` | A | `43.139.140.110` |
| `api` | A | `43.139.140.110` |

生效后本地可检查：

```bash
dig +short www.admin.chenchar.com
dig +short api.chenchar.com
```

## 2. 服务器目录结构

以 **`yunfan` 用户**登录后，在家目录下拉取代码（无需 `sudo` 创建目录）：

```bash
cd ~   # /home/yunfan

git clone https://github.com/BlueOrgreen/ai-nest-learning.git my-firstnest
git clone https://github.com/BlueOrgreen/nextjs-admin.git web-nest
```

最终布局：

```text
/home/yunfan/
├── my-firstnest/    # docker compose 入口（在此执行 compose 命令）
├── web-nest/        # 前端源码（由 compose 构建）
└── ...              # 你的其他文件保持不变
```

`docker-compose.yml` 默认 `WEB_NEST_PATH=../web-nest`，即相对于 `my-firstnest` 的同级目录，与上述结构一致。

## 3. 安装 Docker（Ubuntu）

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker "$USER"
newgrp docker
```

验证：`docker --version` 与 `docker compose version`。

## 4. 环境变量

```bash
cd ~/my-firstnest
cp .env.example .env
```

编辑 `.env`（示例）：

```env
MYSQL_ROOT_PASSWORD=<强密码>
MYSQL_DATABASE=app_database
# 与 web-nest jwt.ts 默认一致即可（网关签发、前端 middleware 校验）
JWT_SECRET=my-firstnest-secret-2026

# 与 ../web-nest 等价；显式写绝对路径也可以
WEB_NEST_PATH=/home/yunfan/web-nest

CORS_ORIGINS=https://www.admin.chenchar.com,http://localhost:3000
USER_SERVICE_URL=http://user-service:3001
ORDER_SERVICE_URL=http://order-service:3002
```

## 5. HTTPS 证书

Nginx 容器会把宿主机目录 **`~/my-firstnest/nginx/ssl/`** 只读挂载到容器内 **`/etc/nginx/ssl/`**（见 `docker-compose.yml`）。  
`nginx/conf.d/*.conf` 里写死了下列文件名，**必须完全一致**（区分大小写）：

```text
/home/yunfan/my-firstnest/nginx/ssl/
├── www.admin.chenchar.com.fullchain.pem   # 管理后台：证书（含链）
├── www.admin.chenchar.com.key             # 管理后台：私钥
├── api.chenchar.com.fullchain.pem         # API 网关：证书（含链）
└── api.chenchar.com.key                   # API 网关：私钥
```

对应关系：

| 域名 | conf 文件 | 证书路径（容器内） |
|------|-----------|-------------------|
| `www.admin.chenchar.com` | `nginx/conf.d/www.admin.chenchar.com.conf` | `/etc/nginx/ssl/www.admin.chenchar.com.fullchain.pem` |
| `api.chenchar.com` | `nginx/conf.d/api.chenchar.com.conf` | `/etc/nginx/ssl/api.chenchar.com.fullchain.pem` |

缺少任一文件时，`docker compose up` 后 **nginx 会启动失败**；四个文件都就位后再执行第 6 节。

### 5.1 在腾讯云申请并下载（推荐）

两个子域名各申请一张证书（免费 DV 即可）：

1. 打开 [SSL 证书控制台](https://console.cloud.tencent.com/ssl) → **申请免费证书**（或「我的证书」→ 申请）。
2. 证书类型选 **域名型（DV）**，绑定域名分别填：
   - `www.admin.chenchar.com`
   - `api.chenchar.com`
3. 按控制台完成 **DNS 验证**（在 DNSPod 为证书提示的主机记录添加 TXT；与业务 A 记录不冲突）。
4. 签发后，在证书列表 → **下载** → 格式选 **Nginx**。
5. 解压后每个域名通常得到类似文件（名称因批次略有不同）：
   - `xxx.chenchar.com_bundle.crt` 或 `fullchain.pem` → 证书链
   - `xxx.chenchar.com.key` → 私钥

### 5.2 在服务器上创建目录

SSH 登录服务器（`yunfan` 用户）：

```bash
mkdir -p ~/my-firstnest/nginx/ssl
chmod 755 ~/my-firstnest/nginx/ssl
```

### 5.3 方式 A：Mac 上用 `scp` 上传（最直观）

在 **Mac 本机**打开终端，进入你解压后的证书目录（把 `yunfan@43.139.140.110` 换成你的用户与 IP）：

```bash
# 管理后台
scp www.admin.chenchar.com_bundle.crt yunfan@43.139.140.110:~/my-firstnest/nginx/ssl/www.admin.chenchar.com.fullchain.pem
scp www.admin.chenchar.com.key       yunfan@43.139.140.110:~/my-firstnest/nginx/ssl/www.admin.chenchar.com.key

# API 网关
scp api.chenchar.com_bundle.crt      yunfan@43.139.140.110:~/my-firstnest/nginx/ssl/api.chenchar.com.fullchain.pem
scp api.chenchar.com.key             yunfan@43.139.140.110:~/my-firstnest/nginx/ssl/api.chenchar.com.key
```

若下载包里的证书文件名是 `fullchain.pem` / `privkey.pem`，只需在 `scp` 时把**本地文件名**换成实际名称，**远程文件名**仍用上表四个目标名。

### 5.4 方式 B：在服务器上直接改名（证书已传到家目录）

若已用 FTP / 面板把 zip 传到服务器，例如解压后在 `~/Downloads/ssl/`：

```bash
cd ~/my-firstnest/nginx/ssl

# 按你解压后的实际文件名修改 cp 的源路径
cp ~/Downloads/ssl/www.admin.chenchar.com_nginx/www.admin.chenchar.com_bundle.crt ./www.admin.chenchar.com.fullchain.pem
cp ~/Downloads/ssl/www.admin.chenchar.com_nginx/www.admin.chenchar.com.key   ./www.admin.chenchar.com.key
cp ~/Downloads/ssl/api.chenchar.com_nginx/api.chenchar.com_bundle.crt         ./api.chenchar.com.fullchain.pem
cp ~/Downloads/ssl/api.chenchar.com_nginx/api.chenchar.com.key               ./api.chenchar.com.key
```

也可用 `nano` 粘贴内容新建文件（Mac 终端：**Control+O** 保存，**Control+X** 退出，不要用 Command）：

```bash
nano ~/my-firstnest/nginx/ssl/www.admin.chenchar.com.fullchain.pem
# 粘贴 fullchain / bundle 全文 → Control+O → Enter → Control+X
nano ~/my-firstnest/nginx/ssl/www.admin.chenchar.com.key
# 粘贴私钥全文（含 BEGIN/END 行）→ 同样保存退出
# api 两个文件同理
```

### 5.5 权限与校验

在服务器执行：

```bash
cd ~/my-firstnest/nginx/ssl

# 私钥仅本人可读
chmod 600 *.key
chmod 644 *.pem

# 应列出 4 个文件
ls -la

# 检查证书与私钥是否配对（各执行一次，输出需含 "OK")
openssl x509 -noout -modulus -in www.admin.chenchar.com.fullchain.pem | openssl md5
openssl rsa  -noout -modulus -in www.admin.chenchar.com.key              | openssl md5
openssl x509 -noout -modulus -in api.chenchar.com.fullchain.pem | openssl md5
openssl rsa  -noout -modulus -in api.chenchar.com.key              | openssl md5
```

同一域名下，两条 `openssl md5` 的哈希值必须相同。

### 5.6 让 Nginx 加载证书

证书就位后启动或重载：

```bash
cd ~/my-firstnest
docker compose up -d
# 若已在运行，仅重建 nginx：
docker compose up -d nginx
docker compose logs nginx
```

无报错时，浏览器访问 `https://www.admin.chenchar.com` 与 `https://api.chenchar.com/docs` 应显示有效 HTTPS。

### 5.7 证书续期后替换

1. 在腾讯云下载新 Nginx 包，按 **5.3 / 5.4** 覆盖 `nginx/ssl/` 中同名四个文件。  
2. `docker compose up -d nginx` 或 `docker compose restart nginx`。  
3. 用浏览器或 `curl -vI https://api.chenchar.com` 确认新证书生效。

### 5.8 可选：Let's Encrypt（Certbot）

需域名已解析到本机且防火墙放行 **80**。首次可先 `docker compose up` 仅 HTTP，再用 certbot 签发，将生成的 `fullchain.pem` / `privkey.pem` **重命名**为上一节四个文件名后放入 `nginx/ssl/`。

```bash
sudo apt-get install -y certbot
# 签发后复制/重命名到 ~/my-firstnest/nginx/ssl/，再 docker compose up -d nginx
```

## 6. 构建并启动

```bash
cd ~/my-firstnest
docker compose up -d --build
docker compose ps
docker compose logs -f nginx gateway web-nest
```

## 7. 验收

| 检查项 | 地址 |
|--------|------|
| 管理后台 | https://www.admin.chenchar.com |
| 网关文档 | https://api.chenchar.com/docs |
| 登录 | 使用已有账号；浏览器 Network 中 API 应指向 `api.chenchar.com` |

## 8. 常用运维

```bash
# 更新前端后
cd ~/web-nest && git pull
cd ~/my-firstnest && docker compose up -d --build web-nest

# 查看日志
docker compose logs -f web-nest gateway

# 停止
docker compose down
```

## 9. 防火墙

轻量应用服务器控制台 → 防火墙：放行 **80**、**443**（以及 SSH **22**）。

## 10. 故障排查

| 现象 | 可能原因 |
|------|----------|
| 502 Bad Gateway | `web-nest` / `gateway` 容器未启动，`docker compose ps` 检查 |
| CORS 错误 | `CORS_ORIGINS` 未包含 `https://www.admin.chenchar.com` |
| API 404 | 网关未代理对应路径；确认 `USER_SERVICE_URL` / `ORDER_SERVICE_URL` 为 Docker 服务名 |
| 证书错误 | `nginx/ssl` 文件名与 `nginx/conf.d/*.conf` 中路径不一致 |

本地构建前端镜像（可选）：

```bash
cd ~/web-nest
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.chenchar.com \
  --build-arg NEXT_PUBLIC_ORDER_API_BASE_URL=https://api.chenchar.com \
  --build-arg NEXT_PUBLIC_ORDER_SERVICE_BASE_URL=https://api.chenchar.com \
  --build-arg NEXT_PUBLIC_USER_API_BASE_URL=https://api.chenchar.com \
  -t web-nest:prod .
```
