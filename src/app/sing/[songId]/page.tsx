import { SingPlayerClient } from "./SingPlayerClient";

export default async function SingSongPage({
  params,
}: {
  params: Promise<{ songId: string }>;
}) {
  const { songId } = await params;
  return <SingPlayerClient songId={songId} />;
}
