"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { browserStore, loadCourse } from "@/lib/experience/store";
import { continueTarget, loadEnglishProgress } from "@/lib/english/progress";

function SingIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18V6l10-2v12"
        stroke={active ? "#e07a4a" : "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18" r="2.5" stroke={active ? "#e07a4a" : "currentColor"} strokeWidth="1.8" />
      <circle cx="17" cy="16" r="2.5" stroke={active ? "#e07a4a" : "currentColor"} strokeWidth="1.8" />
    </svg>
  );
}

export function BottomNav() {
  const path = usePathname();
  const [englishLearn, setEnglishLearn] = useState("/en/lesson/d01");
  const [course, setCourse] = useState<"loading" | "en_to_vi" | "vi_to_en" | null>("loading");

  useEffect(() => {
    const record = loadCourse(browserStore()).record;
    setCourse(record?.active ?? null);
    const next = continueTarget(loadEnglishProgress(browserStore()));
    setEnglishLearn(`/en/lesson/${next.lessonId}`);
  }, [path]);

  if (
    path.startsWith("/welcome") ||
    path.startsWith("/en/onboarding") ||
    (course === null && path === "/")
  ) {
    return null;
  }

  const english = path.startsWith("/en") || course === "vi_to_en";
  const items = english
    ? [
        { href: "/en", label: "Trang chủ", icon: HomeIcon, match: (p: string) => p === "/en" },
        {
          href: englishLearn,
          label: "Học",
          icon: LearnIcon,
          match: (p: string) => p.startsWith("/en/lesson"),
        },
        {
          href: "/en/scan",
          label: "Quét",
          icon: ScanIcon,
          match: (p: string) => p.startsWith("/en/scan"),
        },
        {
          href: "/en/sing",
          label: "Hát",
          icon: SingIcon,
          match: (p: string) => p.startsWith("/en/sing"),
        },
        {
          href: "/en/write",
          label: "Viết",
          icon: WriteIcon,
          match: (p: string) => p.startsWith("/en/write"),
        },
      ]
    : [
        { href: "/", label: "Home", icon: HomeIcon, match: (p: string) => p === "/" },
        {
          href: "/learn",
          label: "Learn",
          icon: LearnIcon,
          match: (p: string) =>
            p.startsWith("/learn") ||
            p.startsWith("/danh-van") ||
            p.startsWith("/dau-thanh") ||
            p.startsWith("/tones") ||
            p.startsWith("/studio"),
        },
        {
          href: "/practice",
          label: "Practice",
          icon: PracticeIcon,
          match: (p: string) =>
            p.startsWith("/practice") || p.startsWith("/hear-write") || p.startsWith("/scan"),
        },
        {
          href: "/sing",
          label: "Karaoke",
          icon: SingIcon,
          match: (p: string) => p.startsWith("/sing"),
        },
        {
          href: "/profile",
          label: "Profile",
          icon: ProgressIcon,
          match: (p: string) => p.startsWith("/profile") || p.startsWith("/progress") || p.startsWith("/settings"),
        },
      ] as const;

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e8d9c8] bg-paper/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {items.map((item) => {
          const active = item.match(path);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-w-[3.5rem] flex-col items-center gap-1 rounded-xl px-1.5 py-1.5 text-[10px] sm:min-w-[4.25rem] sm:px-2 sm:text-[11px] ${
                active ? "text-coral" : "text-ink/45 hover:text-ink/70"
              }`}
            >
              <Icon active={active} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke={active ? "#e07a4a" : "currentColor"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LearnIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6.5C8 5 12 5 12 5s4 0 8 1.5V18s-4-1-8-1-8 1-8 1V6.5Z"
        stroke={active ? "#e07a4a" : "currentColor"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 5v12" stroke={active ? "#e07a4a" : "currentColor"} strokeWidth="1.8" />
    </svg>
  );
}

function PracticeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v4M12 16v4M4 12h4M16 12h4"
        stroke={active ? "#e07a4a" : "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3.2" stroke={active ? "#e07a4a" : "currentColor"} strokeWidth="1.8" />
    </svg>
  );
}

function ScanIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3"
        stroke={active ? "#e07a4a" : "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M3 12h18" stroke={active ? "#e07a4a" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function WriteIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke={active ? "#e07a4a" : "currentColor"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13.5 6.5 17.5 10.5" stroke={active ? "#e07a4a" : "currentColor"} strokeWidth="1.8" />
    </svg>
  );
}

function ProgressIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19V10M10 19V5M16 19v-7M22 19H2"
        stroke={active ? "#e07a4a" : "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
