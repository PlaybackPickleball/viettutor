import { LessonPlayer } from "@/components/english/LessonPlayer";

export default async function EnglishLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LessonPlayer lessonId={id} />;
}