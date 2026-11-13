import { notFound } from "next/navigation";
import { getLetter } from "@/lib/letters";
import { HearClient } from "./HearClient";

type Props = { params: Promise<{ id: string }> };

export default async function HearPage({ params }: Props) {
  const { id } = await params;
  const letter = getLetter(id);
  if (!letter) notFound();
  return <HearClient letter={letter} />;
}
