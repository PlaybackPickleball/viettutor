import { notFound } from "next/navigation";
import { ToneLessonClient } from "@/components/tones/ToneLessonClient";
import { getToneCard, TONE_IDS } from "@/lib/tones";

type Props = { params: Promise<{ toneId: string }> };

export function generateStaticParams() {
  return TONE_IDS.map((toneId) => ({ toneId }));
}

export async function generateMetadata({ params }: Props) {
  const { toneId } = await params;
  const card = getToneCard(toneId);
  if (!card) return { title: "Tone · ÁMi Lingua" };
  return {
    title: `${card.nameVi} · ${card.written} · Dấu Thanh · ÁMi Lingua`,
    description: card.meaningEn,
  };
}

export default async function ToneLessonPage({ params }: Props) {
  const { toneId } = await params;
  if (!getToneCard(toneId)) notFound();
  return <ToneLessonClient toneId={toneId} />;
}
