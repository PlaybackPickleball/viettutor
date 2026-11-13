import { Suspense } from "react";
import { ReadClient } from "./ReadClient";

export default function ReadPage() {
  return (
    <Suspense
      fallback={
        <div className="studio-shell">
          <p className="text-ink/50">Loading…</p>
        </div>
      }
    >
      <ReadClient />
    </Suspense>
  );
}
