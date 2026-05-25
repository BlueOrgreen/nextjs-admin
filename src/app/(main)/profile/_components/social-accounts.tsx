"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";

type ContactAccount = {
  platform: string;
  id: string;
};

type SocialAccountsProps = {
  accounts: readonly ContactAccount[];
};

export function SocialAccounts({ accounts }: SocialAccountsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(account: ContactAccount) {
    try {
      await navigator.clipboard.writeText(account.id);
      setCopiedId(account.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <section aria-labelledby="contact-heading" className="space-y-3">
      <h2 id="contact-heading" className="text-sm font-medium text-foreground">
        联系方式
      </h2>
      <ul className="space-y-2">
        {accounts.map((account) => {
          const isCopied = copiedId === account.id;

          return (
            <li key={account.platform}>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border"
                  aria-hidden
                >
                  <MessageCircle className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {account.platform}
                  </p>
                  <p className="truncate font-mono text-sm font-medium text-foreground">
                    {account.id}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "shrink-0 text-muted-foreground",
                    isCopied && "text-foreground",
                  )}
                  onClick={() => handleCopy(account)}
                  aria-label={
                    isCopied
                      ? `已复制 ${account.platform}`
                      : `复制 ${account.platform}`
                  }
                >
                  {isCopied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
