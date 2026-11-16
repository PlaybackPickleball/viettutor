"use client";

import { useState } from "react";
import { speakEnglish, speakableEnglish } from "@/lib/english/speakClient";

function Speaker() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10v4h3l5 4V6L7 10H4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M16.5 9.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Each English word is a button that speaks that word. */
export function HearPhrase({
  text,
  size = "body",
  slow = false,
}: {
  text: string;
  size?: "body" | "display";
  slow?: boolean;
}) {
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const parts = text.split(/(\s+)/);

  async function play(shown: string) {
    const spoken = speakableEnglish(shown);
    if (!spoken) return;
    setError(false);
    setSpeaking(shown);
    try {
      await speakEnglish(spoken, slow);
    } catch {
      setError(true);
    } finally {
      setSpeaking((current) => (current === shown ? null : current));
    }
  }

  return (
    <span className={size === "display" ? "en-hear-row en-hear-row-display" : "en-hear-row"}>
      {parts.map((part, index) =>
        part.trim() === "" ? (
          <span key={index}>{part}</span>
        ) : (
          <button
            key={`${part}-${index}`}
            type="button"
            lang="en"
            className="en-hear"
            data-speaking={speaking === part ? "true" : "false"}
            aria-label={`Nghe ${speakableEnglish(part)}`}
            onClick={() => void play(part)}
          >
            {part}
            <Speaker />
          </button>
        ),
      )}
      {error ? <span className="en-hear-error">Chưa nghe được. Thử lại.</span> : null}
    </span>
  );
}
