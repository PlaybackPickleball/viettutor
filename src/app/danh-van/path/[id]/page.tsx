import { notFound } from "next/navigation";
import { PathLessonClient } from "@/components/phonics/path/PathLessonClient";
import { getPathLesson } from "@/lib/phonics/learningPath";

type Props = { params: Promise<{ id: string }> };

export default async function PathLessonPage({ params }: Props) {
  const { id } = await params;
  const lesson = getPathLesson(id);
  if (!lesson) notFound();
  return <PathLessonClient lesson={lesson} />;
}
