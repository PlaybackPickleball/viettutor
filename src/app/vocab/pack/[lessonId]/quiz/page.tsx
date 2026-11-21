import { VocabQuizClient } from "@/components/vocabulary/mastery/VocabQuizClient";

type Props = { params: Promise<{ lessonId: string }> };

export default async function VocabLessonQuizPage({ params }: Props) {
  const { lessonId } = await params;
  return <VocabQuizClient lessonId={lessonId} />;
}
