import { Suspense } from "react";
import { ReviewClient } from "./ReviewClient";

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="studio-shell">
          <p className="text-ink/50">Loading…</p>
        </div>
      }
    >
      <ReviewClient />
    </Suspense>
  );
}
