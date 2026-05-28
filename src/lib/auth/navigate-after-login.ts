const FALLBACK_MS = 2000;

type RouterLike = Pick<{ replace: (href: string) => void }, "replace">;

/** Resolve post-login path from ?redirect= (must be same-origin path). */
export function getPostLoginPath(): string {
  if (typeof window === "undefined") return "/";

  const redirect = new URLSearchParams(window.location.search).get("redirect");
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("/auth")) {
    return redirect;
  }
  return "/";
}

/**
 * Soft-navigate first; if still on /auth after FALLBACK_MS, force a full load.
 * Fixes intermittent stuck loading when App Router client navigation stalls.
 */
export function navigateAfterLogin(router: RouterLike, targetPath = "/"): void {
  router.replace(targetPath);

  window.setTimeout(() => {
    if (window.location.pathname.startsWith("/auth")) {
      window.location.assign(targetPath);
    }
  }, FALLBACK_MS);
}
