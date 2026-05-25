import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";
import Image from "next/image";
import { ProfileWorks } from "./_components/profile-works";
import { ProfileSkillStacks } from "./_components/skill-stack";
import { SocialAccounts } from "./_components/social-accounts";
import { CONTACT_ACCOUNTS, PROFILE, WORK_LINKS } from "./_lib/profile-content";

export const metadata: Metadata = {
  title: "个人资料",
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <Breadcrumb pageName="个人资料" />

      <Card className="gap-0 overflow-hidden p-0">
        <div
          className="relative h-36 sm:h-44 md:h-52"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.94_0.03_280)_0%,oklch(0.97_0.01_280)_45%,oklch(0.96_0.02_300)_100%)] dark:bg-[linear-gradient(135deg,oklch(0.28_0.04_280)_0%,oklch(0.22_0.02_280)_55%,oklch(0.24_0.03_300)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,oklch(0.55_0.12_280/0.18),transparent)]" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
        </div>

        <CardContent className="px-5 pb-8 pt-0 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
            <div className="-mt-14 sm:-mt-16">
              <div className="relative size-24 overflow-hidden rounded-full ring-4 ring-card shadow-md sm:size-28">
                <Image
                  src={PROFILE.avatar}
                  alt={`${PROFILE.name} 的头像`}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover object-center"
                  priority
                />
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2 sm:pb-1">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                  {PROFILE.name}
                </h1>
                <p className="text-sm text-muted-foreground">{PROFILE.role}</p>
              </div>
              <Badge variant="secondary" className="font-normal">
                云帆后台 · 产品体验
              </Badge>
            </div>
          </div>

          <Separator className="my-7 sm:my-8" />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,280px)] lg:gap-10">
            <section aria-labelledby="about-heading" className="space-y-4">
              <h2
                id="about-heading"
                className="text-sm font-medium text-foreground"
              >
                关于我
              </h2>
              <p className="max-w-prose text-sm leading-7 text-muted-foreground">
                {PROFILE.bio}
              </p>
              <ProfileWorks links={WORK_LINKS} />
            </section>

            <aside className="space-y-8 lg:border-l lg:border-border lg:pl-10">
              <ProfileSkillStacks
                frontend={PROFILE.frontendStack}
                backend={PROFILE.backendStack}
              />
              <SocialAccounts accounts={CONTACT_ACCOUNTS} />
            </aside>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
