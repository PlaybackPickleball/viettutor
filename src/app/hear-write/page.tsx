import { Suspense } from "react";
import { HearWriteClient } from "./HearWriteClient";

export default function HearWritePage() {
  return (
    <Suspense
      fallback={
        <div className="studio-shell scene-wash">
          <p className="mt-10 text-ink/50">Loading…</p>
        </div>
      }
    >
      <HearWriteClient />
    </Suspense>
  );
}
