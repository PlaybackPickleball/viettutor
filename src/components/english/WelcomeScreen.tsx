"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import {
  browserStore,
  hasVietnameseProgress,
  setActiveCourse,
  type ExperienceId,
} from "@/lib/experience/store";
import { loadEnglishProgress } from "@/lib/english/progress";
import {
  isViOnboardingComplete,
  markViOnboardingSkippedForReturner,
} from "@/lib/viOnboarding";

export function WelcomeScreen({ onSelect }: { onSelect?: (id: ExperienceId) => void }) {
  const router = useRouter();
  const [returningVi, setReturningVi] = useState(false);

  useEffect(() => {
    try {
      setReturningVi(hasVietnameseProgress(browserStore()) || isViOnboardingComplete());
    } catch {
      setReturningVi(false);
    }
  }, []);

  function choose(id: ExperienceId) {
    const store = browserStore();
    setActiveCourse(store, id);
    if (onSelect) {
      onSelect(id);
      return;
    }
    if (id === "en_to_vi") {
      if (returningVi) {
        if (!isViOnboardingComplete()) markViOnboardingSkippedForReturner();
        router.push("/");
        return;
      }
      router.push("/onboarding");
      return;
    }
    const ready = loadEnglishProgress(store).onboardingCompleted;
    router.push(ready ? "/en" : "/en/onboarding");
  }

  return (
    <div className="studio-shell scene-wash relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-10 h-56 w-56 animate-welcomeGlow rounded-full bg-coral/15 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-40 h-64 w-64 animate-welcomeGlowSlow rounded-full bg-[rgba(90,140,120,0.16)] blur-2xl"
      />

      <main className="relative z-[1] flex flex-1 flex-col justify-center pb-10 pt-8">
        <div className="animate-riseIn">
          <BrandMark href="" size="lg" />
        </div>

        <p className="mt-8 max-w-sm font-display text-2xl leading-snug text-ink/80 animate-riseIn [animation-delay:80ms] sm:text-3xl">
          Southern Vietnamese you can hear, say, and write — or English for Vietnamese speakers.
        </p>
        <p
          className="mt-3 text-sm text-ink/50 animate-riseIn [animation-delay:140ms]"
          lang="vi"
        >
          Chọn một đường. Đổi sau không xóa tiến độ.
        </p>

        <div
          className="mt-10 flex flex-col gap-3 animate-riseIn [animation-delay:200ms]"
          role="group"
          aria-label="Choose a learning path"
        >
          <button
            type="button"
            className="teacher-btn-primary w-full justify-between px-5 py-4 text-left"
            onClick={() => choose("en_to_vi")}
          >
            <span className="flex flex-col items-start gap-0.5">
              <span className="font-display text-xl leading-none">
                {returningVi ? "Continue Vietnamese" : "Learn Vietnamese"}
              </span>
              <span className="text-sm font-normal text-paper/85">For English speakers</span>
            </span>
            <span aria-hidden className="text-lg opacity-80">
              →
            </span>
          </button>
          {returningVi ? (
            <p className="px-1 text-xs text-ink/45">
              Progress on this device — skip setup and jump back in.
            </p>
          ) : null}

          <button
            type="button"
            className="teacher-btn-secondary w-full justify-between px-5 py-4 text-left"
            onClick={() => choose("vi_to_en")}
          >
            <span className="flex flex-col items-start gap-0.5">
              <span className="font-display text-xl leading-none text-ink" lang="vi">
                Học Tiếng Anh
              </span>
              <span className="text-sm font-normal text-ink/55">Dành cho người Việt</span>
            </span>
            <span aria-hidden className="text-lg text-ink/45">
              →
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
