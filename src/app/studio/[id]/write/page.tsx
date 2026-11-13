import { notFound } from "next/navigation";
import { getLetter } from "@/lib/letters";
import { WriteClient } from "./WriteClient";

type Props = { params: Promise<{ id: string }> };

export default async function WritePage({ params }: Props) {
  const { id } = await params;
  const letter = getLetter(id);
  if (!letter) notFound();
  return <WriteClient letter={letter} />;
}
