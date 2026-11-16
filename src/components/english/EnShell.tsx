import Link from "next/link";
import type { ReactNode } from "react";

export const primaryBtn = "en-btn en-btn-primary";
export const secondaryBtn = "en-btn en-btn-secondary";

export function EnShell({
  title,
  children,
  backHref = "/en",
  backLabel = "Về trang học",
}: {
  title: string;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="en-ui studio-shell">
      <a href="#en-main" className="sr-only focus:not-sr-only">
        Tới nội dung
      </a>
      <header className="mb-5 flex items-center justify-between gap-3">
        <Link href={backHref} className={`${secondaryBtn} px-4`}>
          {backLabel}
        </Link>
        <Link href="/settings" className="text-base font-semibold underline decoration-2 underline-offset-4">
          Cài đặt
        </Link>
      </header>
      <main id="en-main">
        <h1 className="font-display text-3xl leading-tight text-[var(--en-navy)]">{title}</h1>
        <div className="mt-5">{children}</div>
      </main>
    </div>
  );
}
