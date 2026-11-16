"use client";

import { useRouter } from "next/navigation";
import { browserStore, setActiveCourse, type ExperienceId } from "@/lib/experience/store";
import { loadEnglishProgress } from "@/lib/english/progress";
import { primaryBtn } from "./EnShell";

export function WelcomeScreen({ onSelect }: { onSelect?: (id: ExperienceId) => void }) {
  const router = useRouter();

  function choose(id: ExperienceId) {
    const store = browserStore();
    setActiveCourse(store, id);
    if (onSelect) {
      onSelect(id);
      return;
    }
    if (id === "en_to_vi") {
      router.push("/");
      return;
    }
    const ready = loadEnglishProgress(store).onboardingCompleted;
    router.push(ready ? "/en" : "/en/onboarding");
  }

  return (
    <div className="en-ui studio-shell">
      <main id="en-main">
        <p className="text-base font-semibold tracking-wide">ÁMi Lingua</p>
        <p className="mt-3 font-display text-3xl leading-tight text-[var(--en-navy)]">
          Welcome
          <span className="mt-1 block">Chào mừng</span>
        </p>
        <h1 className="en-instruction mt-4">What do you want to learn?</h1>
        <p className="mt-2 text-lg">Bạn muốn học gì? Chọn một. Đổi sau không xóa tiến độ.</p>
        <div className="mt-6 space-y-4">
          <article className="rounded-[1.5rem] border-2 border-[#1b2a4a] bg-[#fffaf3] p-5">
            <h2 className="font-display text-3xl">Learn Vietnamese</h2>
            <p className="mt-1 text-lg">For English Speakers</p>
            <p className="mt-3 text-base">Hear, say, and write Southern Vietnamese. Your current path stays as it is.</p>
            <button type="button" className={`${primaryBtn} mt-5 w-full`} onClick={() => choose("en_to_vi")}>
              Start Learning Vietnamese
            </button>
          </article>
          <article className="rounded-[1.5rem] border-2 border-[#115e59] bg-[#fffaf3] p-5">
            <h2 className="font-display text-3xl">Học Tiếng Anh</h2>
            <p className="mt-1 text-lg">Dành cho người Việt</p>
            <p className="mt-3 text-lg">Học tiếng Anh từ đầu. Nghe, nói và luyện tập cùng giáo viên AI.</p>
            <button type="button" className={`${primaryBtn} mt-5 w-full`} onClick={() => choose("vi_to_en")}>
              Bắt đầu học tiếng Anh
            </button>
          </article>
        </div>
      </main>
    </div>
  );
}
