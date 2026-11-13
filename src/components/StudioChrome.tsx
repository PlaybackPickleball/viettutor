import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "./BrandMark";

type Step = "hear" | "say" | "write" | "object";

const STEPS: { id: Step; label: string }[] = [
  { id: "hear", label: "Hear" },
  { id: "say", label: "Say" },
  { id: "write", label: "Write" },
  { id: "object", label: "Link" },
];

type Props = {
  letterId: string;
  grapheme: string;
  step: Step;
  children: ReactNode;
  caption?: string;
};

export function StudioChrome({ letterId, grapheme, step, children, caption }: Props) {
  return (
    <div className="studio-shell animate-riseIn">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <BrandMark />
          <p className="quiet-label mt-3">One sound · {grapheme}</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-ink/10 bg-paper/60 px-3 py-1.5 text-sm text-ink/70 hover:bg-soft"
        >
          Dashboard
        </Link>
      </header>

      <nav aria-label="Lesson steps" className="mb-8 flex gap-1">
        {STEPS.map((s) => {
          const active = s.id === step;
          return (
            <Link
              key={s.id}
              href={`/studio/${letterId}/${s.id}`}
              className={`flex-1 rounded-xl py-2 text-center text-sm transition ${
                active
                  ? "bg-ink text-paper"
                  : "bg-paper/50 text-ink/45 hover:bg-soft hover:text-ink/70"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      {caption ? (
        <p className="mb-6 text-lg text-ink/75">{caption}</p>
      ) : null}

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
