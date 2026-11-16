import { EnglishKaraoke } from "@/components/english/EnglishKaraoke";

export default async function EnglishKaraokePage({
  params,
}: {
  params: Promise<{ songId: string }>;
}) {
  const { songId } = await params;
  return <EnglishKaraoke songId={songId} />;
}
