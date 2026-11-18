"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import {
  browserStore,
  hasVietnameseProgress,
  loadCourse,
  type ExperienceId,
} from "@/lib/experience/store";
import {
  isViOnboardingComplete,
  markViOnboardingSkippedForReturner,
} from "@/lib/viOnboarding";
import { WelcomeScreen } from "./WelcomeScreen";

export function HomeSwitch() {
  const router = useRouter();
  const [mode, setMode] = useState<"loading" | "welcome" | "vi">("loading");

  useEffect(() => {
    const store = browserStore();
    const { record } = loadCourse(store);
    if (!record) {
      setMode("welcome");
      return;
    }
    if (record.active === "vi_to_en") {
      router.replace("/en");
      return;
    }
    if (!isViOnboardingComplete()) {
      if (hasVietnameseProgress(store)) {
        markViOnboardingSkippedForReturner();
        setMode("vi");
        return;
      }
      router.replace("/onboarding");
      return;
    }
    setMode("vi");
  }, [router]);

  if (mode === "loading") {
    return (
      <div className="studio-shell">
        <p className="text-ink/70">Opening your place…</p>
      </div>
    );
  }
  if (mode === "welcome") {
    return (
      <WelcomeScreen
        onSelect={(id: ExperienceId) => {
          if (id === "en_to_vi") {
            const store = browserStore();
            if (hasVietnameseProgress(store) || isViOnboardingComplete()) {
              if (!isViOnboardingComplete()) markViOnboardingSkippedForReturner();
              router.push("/");
              return;
            }
            router.push("/onboarding");
            return;
          }
          router.push("/en/onboarding");
        }}
      />
    );
  }
  return <DashboardClient />;
}
