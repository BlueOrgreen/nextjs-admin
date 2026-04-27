import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "主菜单",
    items: [
      {
        title: "仪表盘",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "电商概览",
            url: "/",
          },
        ],
      },
      {
        title: "日历",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
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
        title: "表格",
        url: "/tables",
        icon: Icons.Table,
        items: [
          {
            title: "表格列表",
            url: "/tables",
          },
        ],
      },
      {
        title: "页面",
        icon: Icons.Alphabet,
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
    label: "其他",
    items: [
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
