"use client";

import { useRouter } from "next/navigation";
import { browserStore, setActiveCourse, type ExperienceId } from "@/lib/experience/store";
import { loadEnglishProgress } from "@/lib/english/progress";
import { BrandMark } from "@/components/BrandMark";
import { ArrowRight, OutlineBook, OutlineLotus } from "./FoundationsMark";
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
    <div className="en-ui studio-shell scene-wash">
      <main id="en-main" className="flex flex-col items-center">
        <BrandMark size="lg" href={undefined} tagline={null} />
        <h1 className="mt-6 text-center font-display text-5xl font-semibold leading-none text-[var(--en-navy)]">Welcome</h1>
        <p className="en-welcome-vi">Chào mừng</p>
        <p className="en-instruction mt-5 text-center">What do you want to learn?</p>
        <p className="mt-2 text-center text-lg">Bạn muốn học gì? Chọn một. Đổi sau không xóa tiến độ.</p>
        <div className="mt-6 w-full space-y-4 text-left">
          <article className="en-choice-card">
            <OutlineLotus />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[1.7rem] leading-tight">Learn Vietnamese</h2>
              <p className="text-lg font-semibold">For English Speakers</p>
              <p className="mt-1 text-base leading-snug text-[var(--en-leaf)]">
                Hear, say, and write Southern Vietnamese at your own pace.
              </p>
              <button type="button" className={`${primaryBtn} mt-4 w-full`} onClick={() => choose("en_to_vi")}>
                Start Learning Vietnamese
                <ArrowRight />
              </button>
            </div>
          </article>
          <article className="en-choice-card">
            <OutlineBook />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[1.7rem] leading-tight">Học Tiếng Anh</h2>
              <p className="text-lg font-semibold">Dành cho người Việt</p>
              <p className="mt-1 text-base leading-snug text-[var(--en-leaf)]">
                Học tiếng Anh từ đầu. Nghe, nói và luyện tập cùng giáo viên AI.
              </p>
              <button type="button" className={`${primaryBtn} mt-4 w-full`} onClick={() => choose("vi_to_en")}>
                Bắt đầu học tiếng Anh
                <ArrowRight />
              </button>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
