export const PROFILE = {
  name: "云帆",
  role: "全栈工程师",
  avatar: "/images/user/user-03.png",
  bio: "专注于产品界面设计与用户体验优化，擅长从业务目标出发，将复杂的信息结构整理成清晰、易用且具有视觉层次的产品界面。参与过中后台系统、数据看板、小程序、网页开发等项目，关注系统、交互细节以及团队协作效率的持续提升。",
  frontendStack: ["React", "Next.js", "Tailwind CSS", "Zustand"],
  backendStack: ["NestJS", "MySQL", "Linux", "TypeORM"],
} as const;

export const CONTACT_ACCOUNTS = [
  {
    platform: "微信",
    id: "CYF8683",
  },
] as const;

export type WorkLinkKind = "blog" | "npm";

export type WorkLink = {
  id: string;
  title: string;
  description: string;
  href: string;
  kind: WorkLinkKind;
};

export const WORK_LINKS: readonly WorkLink[] = [
  {
    id: "blog",
    title: "个人技术博客",
    description: "www.blog.chenchar.com",
    href: "https://www.blog.chenchar.com/",
    kind: "blog",
  },
  {
    id: "fe-runtime",
    title: "微前端运行时工具库",
    description: "@fan-scripts/fe-runtime",
    href: "https://www.npmjs.com/package/@fan-scripts/fe-runtime",
    kind: "npm",
  },
  {
    id: "dev-scripts",
    title: "npm 工具库",
    description: "@fan-scripts/dev-scripts",
    href: "https://www.npmjs.com/package/@fan-scripts/dev-scripts",
    kind: "npm",
  },
];
