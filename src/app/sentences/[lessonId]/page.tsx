import { SentenceLessonClient } from "@/components/sentences/SentenceLessonClient";

type Props = { params: Promise<{ lessonId: string }> };

export default async function SentenceLessonPage({ params }: Props) {
  const { lessonId } = await params;
  return <SentenceLessonClient lessonId={lessonId} />;
}
