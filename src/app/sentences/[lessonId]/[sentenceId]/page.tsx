import { SentenceFlowClient } from "@/components/sentences/SentenceFlowClient";

type Props = { params: Promise<{ lessonId: string; sentenceId: string }> };

export default async function SentenceFlowPage({ params }: Props) {
  const { lessonId, sentenceId } = await params;
  return <SentenceFlowClient lessonId={lessonId} sentenceId={sentenceId} />;
}
