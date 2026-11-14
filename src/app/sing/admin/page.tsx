import { Suspense } from "react";
import { SingAdminClient } from "./SingAdminClient";

export default function SingAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="studio-shell">
          <p className="text-ink/50">Loading admin…</p>
        </div>
      }
    >
      <SingAdminClient />
    </Suspense>
  );
}
