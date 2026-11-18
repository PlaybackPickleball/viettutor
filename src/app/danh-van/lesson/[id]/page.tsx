import { notFound } from "next/navigation";
import { PhonicsLessonClient } from "@/components/phonics/PhonicsLessonClient";
import { getPhonicsLesson } from "@/lib/phonics";

type Props = { params: Promise<{ id: string }> };

export default async function PhonicsLessonPage({ params }: Props) {
  const { id } = await params;
  const lesson = getPhonicsLesson(id);
  if (!lesson) notFound();
  return <PhonicsLessonClient lesson={lesson} />;
}
