import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  BookOpen,
  Layers,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { WorkLink, WorkLinkKind } from "../_lib/profile-content";

const WORK_ICON_CONFIG: Record<
  WorkLinkKind,
  { Icon: LucideIcon; iconClass: string; tileClass: string }
> = {
  blog: {
    Icon: BookOpen,
    iconClass: "text-primary",
    tileClass: "bg-primary/10 ring-primary/20",
  },
  npm: {
    Icon: Package,
    iconClass: "text-[#CB3837]",
    tileClass: "bg-[#CB3837]/10 ring-[#CB3837]/20",
  },
};

function getWorkIcon(link: WorkLink) {
  if (link.id === "fe-runtime") {
    return {
      Icon: Layers,
      iconClass: "text-primary",
      tileClass: "bg-primary/10 ring-primary/20",
    };
  }

  if (link.id === "dev-scripts") {
    return {
      Icon: Package,
      iconClass: "text-amber-600 dark:text-amber-500",
      tileClass: "bg-amber-500/10 ring-amber-500/25",
    };
  }

  return WORK_ICON_CONFIG[link.kind];
}

type ProfileWorksProps = {
  links: readonly WorkLink[];
};

export function ProfileWorks({ links }: ProfileWorksProps) {
  return (
    <div className="space-y-3 pt-2">
      <h3 className="text-sm font-medium text-foreground">作品与开源</h3>
      <ul className="grid gap-2.5 sm:grid-cols-1">
        {links.map((link) => {
          const { Icon, iconClass, tileClass } = getWorkIcon(link);

          return (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3 transition-colors",
                  "hover:border-primary/25 hover:bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg ring-1",
                    tileClass,
                  )}
                  aria-hidden
                >
                  <Icon className={cn("size-[1.125rem]", iconClass)} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground group-hover:text-primary">
                    {link.title}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">
                    {link.description}
                  </span>
                </span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:text-primary group-hover:opacity-100"
                  aria-hidden
                />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
