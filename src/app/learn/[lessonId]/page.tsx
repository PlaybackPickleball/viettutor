import { notFound } from "next/navigation";
import { JourneyLessonClient } from "@/components/journey/JourneyLessonClient";
import { getJourneyPlayableLesson } from "@/lib/journey";

type Props = { params: Promise<{ lessonId: string }> };

export default async function JourneyLessonPage({ params }: Props) {
  const { lessonId } = await params;
  const lesson = getJourneyPlayableLesson(lessonId);
  if (!lesson) notFound();
  return <JourneyLessonClient lesson={lesson} />;
}
