"use client";

import { COMBINED_DIACRITICS } from "@/lib/tones/diacritics";

/** Compact helper for adult beginners typing Vietnamese diacritics on mobile/desktop. */
const INSERTS = [
  "ă",
  "â",
  "ê",
  "ô",
  "ơ",
  "ư",
  "đ",
  "á",
  "à",
  "ả",
  "ã",
  "ạ",
  "é",
  "è",
  "ế",
  "ề",
  "ó",
  "ò",
  "ố",
  "ồ",
  "ớ",
  "ờ",
  "ú",
  "ù",
  "ứ",
  "ừ",
] as const;

/** Combined vowel + tone marks (ắ ầ ế ộ ớ ữ) — teaching / typing set. */
const COMBINED = COMBINED_DIACRITICS.map((c) => c.letter);

type Props = {
  onInsert: (ch: string) => void;
  disabled?: boolean;
};

function Key({
  ch,
  disabled,
  onInsert,
}: {
  ch: string;
  disabled?: boolean;
  onInsert: (ch: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      lang="vi"
      className="min-w-[2rem] rounded-lg bg-paper px-2 py-1 font-hand text-lg text-ink ring-1 ring-[#e8d9c8] transition hover:bg-coral/10 disabled:opacity-40"
      onClick={() => onInsert(ch)}
    >
      {ch}
    </button>
  );
}

export function ViDiacriticHelper({ onInsert, disabled }: Props) {
  return (
    <div className="mt-2">
      <p className="text-[11px] text-ink/40">Vietnamese helper — tap to insert</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {INSERTS.map((ch) => (
          <Key key={ch} ch={ch} disabled={disabled} onInsert={onInsert} />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-ink/40">Combined diacritics</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {COMBINED.map((ch) => (
          <Key key={`combined-${ch}`} ch={ch} disabled={disabled} onInsert={onInsert} />
        ))}
      </div>
    </div>
  );
}
