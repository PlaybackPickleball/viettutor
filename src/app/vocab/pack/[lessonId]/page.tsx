import { VocabLessonClient } from "@/components/vocabulary/VocabLessonClient";

export default async function VocabPackLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return <VocabLessonClient lessonId={lessonId} />;
}
