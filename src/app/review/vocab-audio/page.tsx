import { Suspense } from "react";
import { VocabAudioReviewClient } from "./VocabAudioReviewClient";

export const metadata = {
  title: "Vocabulary audio review — ÁMi Lingua",
  description:
    "Review First-100 vocabulary clips (male 10 + female 90) before enabling them for learners.",
};

export default function VocabAudioReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="studio-shell">
          <p className="text-ink/50">Loading vocabulary audio review…</p>
        </div>
      }
    >
      <VocabAudioReviewClient />
    </Suspense>
  );
}
