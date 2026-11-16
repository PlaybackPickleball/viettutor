"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserStore,
  loadCourse,
  setActiveCourse,
  setTextSize,
  type ExperienceId,
  type TextSize,
} from "@/lib/experience/store";
import { loadEnglishProgress } from "@/lib/english/progress";
import { EnShell, primaryBtn, secondaryBtn } from "./EnShell";

export function SettingsPanel() {
  const router = useRouter();
  const [active, setActive] = useState<ExperienceId | null>(null);
  const [textSize, setSize] = useState<TextSize>("standard");

  useEffect(() => {
    const record = loadCourse(browserStore()).record;
    setActive(record?.active ?? null);
    setSize(record?.textSize ?? "standard");
  }, []);

  function applySize(next: TextSize) {
    const size = setTextSize(browserStore(), next);
    setSize(size);
    document.documentElement.dataset.textSize = size;
  }

  function switchCourse(id: ExperienceId) {
    const store = browserStore();
    setActiveCourse(store, id);
    setActive(id);
    document.documentElement.lang = id === "vi_to_en" ? "vi" : "en";
    if (id === "en_to_vi") {
      router.push("/");
      return;
    }
    const ready = loadEnglishProgress(store).onboardingCompleted;
    router.push(ready ? "/en" : "/en/onboarding");
  }

  return (
    <EnShell title="Cài đặt" backHref={active === "vi_to_en" ? "/en" : "/"} backLabel="Quay lại">
      <section className="space-y-3">
        <h2 className="en-instruction">Switch Language / Đổi khóa học</h2>
        <p>Đổi khóa học không xóa tiến độ của khóa kia.</p>
        <button type="button" className={active === "en_to_vi" ? primaryBtn : secondaryBtn} onClick={() => switchCourse("en_to_vi")}>
          Learn Vietnamese
        </button>
        <button type="button" className={active === "vi_to_en" ? primaryBtn : secondaryBtn} onClick={() => switchCourse("vi_to_en")}>
          Học Tiếng Anh
        </button>
      </section>
      <section className="mt-8 space-y-3">
        <h2 className="en-instruction">Chữ lớn / Large Text</h2>
        <button type="button" className={textSize === "standard" ? primaryBtn : secondaryBtn} onClick={() => applySize("standard")}>
          Chuẩn / Standard
        </button>
        <button type="button" className={textSize === "large" ? primaryBtn : secondaryBtn} onClick={() => applySize("large")}>
          Chữ lớn / Large
        </button>
      </section>
    </EnShell>
  );
}
