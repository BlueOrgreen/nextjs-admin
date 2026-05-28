# 腾讯云轻量服务器部署指南

目标环境：

| 项目 | 值 |
|------|-----|
| 服务器 | 腾讯云轻量，Ubuntu |
| 公网 IP | `43.139.140.110` |
| 管理后台 | `https://www.admin.chenchar.com` |
| API 网关 | `https://api.chenchar.com` |
| 编排目录 | 服务器上的 `my-firstnest`（与 `web-nest` 同级） |

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

```bash
sudo mkdir -p /opt/yunfan
sudo chown "$USER":"$USER" /opt/yunfan
cd /opt/yunfan

git clone <your-my-firstnest-repo-url> my-firstnest
git clone <your-web-nest-repo-url> web-nest
```

最终布局：

```text
/opt/yunfan/
├── my-firstnest/    # docker compose 入口
└── web-nest/        # 前端源码（由 compose 构建）
```

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
cd /opt/yunfan/my-firstnest
cp .env.example .env
```

编辑 `.env`（示例）：

```env
MYSQL_ROOT_PASSWORD=<强密码>
MYSQL_DATABASE=app_database
JWT_SECRET=<随机长字符串>

WEB_NEST_PATH=/opt/yunfan/web-nest

CORS_ORIGINS=https://www.admin.chenchar.com,http://localhost:3000
USER_SERVICE_URL=http://user-service:3001
ORDER_SERVICE_URL=http://order-service:3002
```

## 5. HTTPS 证书

将证书放入 `my-firstnest/nginx/ssl/`（与 compose 挂载路径一致）：

```text
nginx/ssl/
├── www.admin.chenchar.com.fullchain.pem
├── www.admin.chenchar.com.key
├── api.chenchar.com.fullchain.pem
└── api.chenchar.com.key
```

可使用 [腾讯云 SSL 证书](https://console.cloud.tencent.com/ssl) 申请免费证书后下载 Nginx 格式，或使用 Certbot（需先临时开放 80 端口）：

```bash
sudo apt-get install -y certbot
# 首次部署可先用仅 HTTP 的 compose 启动，再按 certbot 文档签发后替换 ssl 目录文件
```

## 6. 构建并启动

```bash
cd /opt/yunfan/my-firstnest
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
cd /opt/yunfan/web-nest && git pull
cd /opt/yunfan/my-firstnest && docker compose up -d --build web-nest

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
cd /opt/yunfan/web-nest
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.chenchar.com \
  --build-arg NEXT_PUBLIC_ORDER_API_BASE_URL=https://api.chenchar.com \
  --build-arg NEXT_PUBLIC_ORDER_SERVICE_BASE_URL=https://api.chenchar.com \
  --build-arg NEXT_PUBLIC_USER_API_BASE_URL=https://api.chenchar.com \
  -t web-nest:prod .
```
