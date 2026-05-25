import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  ExternalLink,
  GitBranch,
  Layers,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { WorkLink, WorkSecondaryLink } from "../_lib/profile-content";

function SecondaryLinkIcon({ type }: { type: WorkSecondaryLink["type"] }) {
  if (type === "npm") {
    return <Package className="size-3.5 shrink-0 text-[#CB3837]" aria-hidden />;
  }

  return <ExternalLink className="size-3.5 shrink-0" aria-hidden />;
}

function WorkSecondaryLinks({
  links,
}: {
  links: readonly WorkSecondaryLink[];
}) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-border/80 px-3 py-2">
      {links.map((item) => (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <SecondaryLinkIcon type={item.type} />
          {item.label}
        </a>
      ))}
    </div>
  );
}

type WorkIconConfig = {
  Icon: LucideIcon;
  iconClass: string;
  tileClass: string;
};

function getWorkIcon(link: WorkLink): WorkIconConfig {
  if (link.id === "blog") {
    return {
      Icon: BookOpen,
      iconClass: "text-primary",
      tileClass: "bg-primary/10 ring-primary/20",
    };
  }

  if (link.id === "fan-mf-lib") {
    return {
      Icon: Layers,
      iconClass: "text-primary",
      tileClass: "bg-primary/10 ring-primary/20",
    };
  }

  if (link.id === "fan-scripts") {
    return {
      Icon: Package,
      iconClass: "text-amber-600 dark:text-amber-500",
      tileClass: "bg-amber-500/10 ring-amber-500/25",
    };
  }

  return {
    Icon: GitBranch,
    iconClass: "text-foreground",
    tileClass: "bg-muted ring-border",
  };
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
              <div
                className={cn(
                  "rounded-lg border border-border bg-muted/30 transition-colors",
                  "hover:border-primary/25 hover:bg-muted/50",
                )}
              >
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-3 py-3"
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
                    <span className="mt-0.5 flex items-center gap-1.5 truncate font-mono text-xs text-muted-foreground">
                      <Code2 className="size-3 shrink-0 opacity-70" aria-hidden />
                      {link.description}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:text-primary group-hover:opacity-100"
                    aria-hidden
                  />
                </a>
                {link.secondaryLinks?.length ? (
                  <WorkSecondaryLinks links={link.secondaryLinks} />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
