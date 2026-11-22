"use client";

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

type Props = {
  onInsert: (ch: string) => void;
  disabled?: boolean;
};

export function ViDiacriticHelper({ onInsert, disabled }: Props) {
  return (
    <div className="mt-2">
      <p className="text-[11px] text-ink/40">Vietnamese helper — tap to insert</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {INSERTS.map((ch) => (
          <button
            key={ch}
            type="button"
            disabled={disabled}
            lang="vi"
            className="min-w-[2rem] rounded-lg bg-paper px-2 py-1 font-hand text-lg text-ink ring-1 ring-[#e8d9c8] transition hover:bg-coral/10 disabled:opacity-40"
            onClick={() => onInsert(ch)}
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}
