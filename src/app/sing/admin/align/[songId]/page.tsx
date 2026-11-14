import { Suspense } from "react";
import { AlignAdminClient } from "./AlignAdminClient";

export default async function AlignAdminPage({
  params,
}: {
  params: Promise<{ songId: string }>;
}) {
  const { songId } = await params;
  return (
    <Suspense
      fallback={
        <div className="studio-shell">
          <p className="text-ink/50">Loading alignment…</p>
        </div>
      }
    >
      <AlignAdminClient songId={songId} />
    </Suspense>
  );
}
