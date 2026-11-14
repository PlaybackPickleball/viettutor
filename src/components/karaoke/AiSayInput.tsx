"use client";

import { useEffect, useState } from "react";
import { speakVietnamese, stopSpeaking } from "@/lib/audio";

type Props = {
  /** Prefill when the parent sets a tapped lyric word. */
  seedText?: string;
  /** Optional quick-pick words from the active lyric line. */
  suggestions?: string[];
  onSpeakingChange?: (busy: boolean) => void;
};

/**
 * Type (or pick) a Vietnamese word/phrase and have AI say or repeat it.
 */
export function AiSayInput({ seedText, suggestions = [], onSpeakingChange }: Props) {
  const [text, setText] = useState(seedText?.trim() || "");
  const [busy, setBusy] = useState(false);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (seedText?.trim()) setText(seedText.trim());
  }, [seedText]);

  async function say(opts?: { slow?: boolean; repeat?: boolean }) {
    const phrase = (opts?.repeat ? lastSpoken : text)?.trim();
    if (!phrase) {
      setError("Type a word or phrase first.");
      return;
    }
    setError(null);
    setBusy(true);
    onSpeakingChange?.(true);
    stopSpeaking();
    try {
      await speakVietnamese(phrase, { slow: opts?.slow });
      setLastSpoken(phrase);
      if (!opts?.repeat) setText(phrase);
    } catch {
      setError("Could not play AI voice — try again.");
    } finally {
      setBusy(false);
      onSpeakingChange?.(false);
    }
  }

  const uniqueSuggestions = [...new Set(suggestions.map((s) => s.trim()).filter(Boolean))].slice(
    0,
    12,
  );

  return (
    <div className="rounded-2xl bg-soft/50 px-3 py-3">
      <p className="quiet-label">Ask AI to say a word</p>
      <form
        className="mt-2 flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void say();
        }}
      >
        <label className="sr-only" htmlFor="ami-say-word">
          Vietnamese word or phrase
        </label>
        <input
          id="ami-say-word"
          type="text"
          lang="vi"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a word… e.g. mưa"
          className="w-full rounded-xl border border-ink/10 bg-paper px-3 py-2.5 text-lg text-ink outline-none ring-coral/30 focus:ring-2"
          autoComplete="off"
          spellCheck={false}
        />
        {uniqueSuggestions.length ? (
          <div className="flex flex-wrap gap-1.5">
            {uniqueSuggestions.map((w) => (
              <button
                key={w}
                type="button"
                className="rounded-lg bg-paper px-2 py-1 text-sm text-ink/80 ring-1 ring-ink/10 hover:bg-coral/10"
                lang="vi"
                onClick={() => {
                  setText(w);
                  void (async () => {
                    setBusy(true);
                    onSpeakingChange?.(true);
                    stopSpeaking();
                    try {
                      await speakVietnamese(w);
                      setLastSpoken(w);
                    } catch {
                      setError("Could not play AI voice — try again.");
                    } finally {
                      setBusy(false);
                      onSpeakingChange?.(false);
                    }
                  })();
                }}
              >
                {w}
              </button>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="teacher-btn-primary flex-1 py-2 text-sm"
            disabled={busy || !text.trim()}
          >
            {busy ? "Speaking…" : "Say word (AI)"}
          </button>
          <button
            type="button"
            className="teacher-btn-secondary flex-1 py-2 text-sm"
            disabled={busy || !text.trim()}
            onClick={() => void say({ slow: true })}
          >
            Say slowly
          </button>
          <button
            type="button"
            className="teacher-btn-secondary py-2 text-sm"
            disabled={busy || !lastSpoken}
            onClick={() => void say({ repeat: true })}
          >
            Repeat
          </button>
        </div>
      </form>
      {error ? <p className="mt-2 text-xs text-coral">{error}</p> : null}
      {lastSpoken && !error ? (
        <p className="mt-2 text-xs text-ink/45" lang="vi">
          Last: {lastSpoken}
        </p>
      ) : null}
    </div>
  );
}
