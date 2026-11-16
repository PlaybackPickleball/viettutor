"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import { browserStore, loadCourse, type ExperienceId } from "@/lib/experience/store";
import { WelcomeScreen } from "./WelcomeScreen";

export function HomeSwitch() {
  const router = useRouter();
  const [mode, setMode] = useState<"loading" | "welcome" | "vi">("loading");

  useEffect(() => {
    const { record } = loadCourse(browserStore());
    if (!record) {
      setMode("welcome");
      return;
    }
    if (record.active === "vi_to_en") {
      router.replace("/en");
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
          if (id === "en_to_vi") setMode("vi");
          else router.push("/en/onboarding");
        }}
      />
    );
  }
  return <DashboardClient />;
}
