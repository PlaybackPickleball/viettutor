import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";

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
    <div className="en-ui studio-shell scene-wash">
      <a href="#en-main" className="sr-only focus:not-sr-only">
        Tới nội dung
      </a>
      <header className="mb-5 flex items-start justify-between gap-3">
        <BrandMark href="/en" />
        <div className="flex flex-col items-end gap-2">
          <Link href={backHref} className={`${secondaryBtn} px-4`}>
            {backLabel}
          </Link>
          <Link href="/settings" className="text-sm font-medium text-ink/70 underline decoration-[#e0d0bc] underline-offset-4">
            Cài đặt
          </Link>
        </div>
      </header>
      <main id="en-main">
        <h1 className="font-display text-4xl leading-tight text-[var(--en-navy)]">{title}</h1>
        <div className="mt-5">{children}</div>
      </main>
    </div>
  );
}
