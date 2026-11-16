"use client";

import { useEffect, useState } from "react";
import { browserStore } from "@/lib/experience/store";
import { dueReviews, loadEnglishProgress, saveEnglishProgress, scheduleReview, type ReviewItem } from "@/lib/english/progress";
import { speakEnglish } from "@/lib/english/speakClient";
import { REPLAY_LABEL, SLOW_LABEL } from "@/lib/english/a11y";
import { HearPhrase } from "./HearPhrase";
import { EnShell, primaryBtn, secondaryBtn } from "./EnShell";

export function ReviewList() {
  const [items, setItems] = useState<ReviewItem[]>([]);

  function reload() {
    const progress = loadEnglishProgress(browserStore());
    setItems(dueReviews(progress, new Date().toISOString().slice(0, 10)));
  }

  useEffect(() => {
    reload();
  }, []);

  function grade(item: ReviewItem, category: "very_good" | "needs_practice") {
    const store = browserStore();
    const progress = loadEnglishProgress(store);
    const today = new Date().toISOString().slice(0, 10);
    const next = scheduleReview(item, category, today);
    saveEnglishProgress(
      { ...progress, review: progress.review.map((row) => (row.id === item.id ? next : row)) },
      store,
    );
    reload();
  }

  return (
    <EnShell title="Ôn từ vựng">
      {items.length === 0 ? (
        <p className="text-lg">Hôm nay chưa có mục đến hạn. Khi một câu chưa rõ, nó sẽ vào đây.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="en-panel p-4">
              <HearPhrase text={item.en} size="display" />
              <p className="mt-2 text-base">Bấm từng từ để nghe.</p>
              <p className="mt-1 text-lg">{item.vi}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" className={secondaryBtn} onClick={() => void speakEnglish(item.en, false)}>
                  {REPLAY_LABEL}
                </button>
                <button type="button" className={secondaryBtn} onClick={() => void speakEnglish(item.en, true)}>
                  {SLOW_LABEL}
                </button>
                <button type="button" className={primaryBtn} onClick={() => grade(item, "very_good")}>
                  Nhớ rồi
                </button>
                <button type="button" className={secondaryBtn} onClick={() => grade(item, "needs_practice")}>
                  Cần ôn
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </EnShell>
  );
}
