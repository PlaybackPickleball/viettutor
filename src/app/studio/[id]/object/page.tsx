import { notFound } from "next/navigation";
import { getLetter } from "@/lib/letters";
import { ObjectClient } from "./ObjectClient";

type Props = { params: Promise<{ id: string }> };

export default async function ObjectPage({ params }: Props) {
  const { id } = await params;
  const letter = getLetter(id);
  if (!letter) notFound();
  return <ObjectClient letter={letter} />;
}
