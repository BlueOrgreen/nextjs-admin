import * as Icons from "../icons";

interface NavItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  hidden?: boolean;
  items?: NavItem[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_DATA: NavSection[] = [
  {
    label: "主菜单",
    items: [
      {
        title: "仪表盘",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "数据看版",
            url: "/",
          },
        ],
      },
      {
        title: "订单管理",
        icon: Icons.Alphabet,
        items: [
          {
            title: "订单",
            url: "/orders",
          },
          {
            title: "商品",
            url: "/products",
          },
        ],
      },
      {
        title: "个人资料",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "表单",
        icon: Icons.Alphabet,
        hidden: true,
        items: [
          {
            title: "表单元素",
            url: "/forms/form-elements",
          },
          {
            title: "表单布局",
            url: "/forms/form-layout",
          },
        ],
      },
      {
        title: "页面",
        icon: Icons.Alphabet,
        hidden: true,
        items: [
          {
            title: "设置",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
  {
    label: "系统",
    items: [
      {
        title: "日历",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "图表",
        icon: Icons.PieChart,
        items: [
          {
            title: "基础图表",
            url: "/charts/basic-chart",
          },
        ],
      },
      {
        title: "表格",
        url: "/tables",
        icon: Icons.Table,
        // hidden: true,
        items: [
          {
            title: "表格列表",
            url: "/tables",
          },
        ],
      },
      
      {
        title: "界面元素",
        icon: Icons.FourCircle,
        items: [
          {
            title: "提示框",
            url: "/ui-elements/alerts",
          },
          {
            title: "按钮",
            url: "/ui-elements/buttons",
          },
        ],
      },
      {
        title: "身份认证",
        icon: Icons.Authentication,
        hidden: true,
        items: [
          {
            title: "登录",
            url: "/auth/sign-in",
          },
        ],
      },
    ],
  },
];
