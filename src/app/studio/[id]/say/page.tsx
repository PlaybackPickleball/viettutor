import { notFound } from "next/navigation";
import { getLetter } from "@/lib/letters";
import { SayClient } from "./SayClient";

type Props = { params: Promise<{ id: string }> };

export default async function SayPage({ params }: Props) {
  const { id } = await params;
  const letter = getLetter(id);
  if (!letter) notFound();
  return <SayClient letter={letter} />;
}
