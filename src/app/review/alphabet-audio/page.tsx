import { Suspense } from "react";
import { AlphabetAudioReviewClient } from "./AlphabetAudioReviewClient";

export const metadata = {
  title: "Alphabet audio review — ÁMi Lingua",
  description:
    "Review ElevenLabs 29-letter alphabet splits before enabling them in the studio.",
};

export default function AlphabetAudioReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="studio-shell">
          <p className="text-ink/50">Loading alphabet audio review…</p>
        </div>
      }
    >
      <AlphabetAudioReviewClient />
    </Suspense>
  );
}
