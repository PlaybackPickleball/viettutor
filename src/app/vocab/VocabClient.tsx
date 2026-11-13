"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { speakVietnamese } from "@/lib/audio";
import { loadVocab, removeVocabItem, type SavedVocabItem } from "@/lib/vocab/store";

export function VocabClient() {
  const [items, setItems] = useState<SavedVocabItem[]>([]);

  useEffect(() => {
    setItems(loadVocab());
  }, []);

  return (
    <div className="studio-shell scene-wash animate-riseIn">
      <BrandMark />
      <h1 className="mt-6 font-display text-3xl text-ink">Saved vocabulary</h1>
      <p className="mt-2 text-ink/60">Words and phrases you saved from Scan & Read.</p>

      {items.length === 0 ? (
        <div className="ami-card mt-6 px-4 py-6 text-sm text-ink/55">
          No saved words yet. Scan text, tap a word, then Save.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="ami-card px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl text-ink" lang="vi">
                    {item.expression}
                  </p>
                  <p className="text-ink/60">{item.meaningEn}</p>
                  {item.originalSentence ? (
                    <p className="mt-2 text-xs text-ink/45" lang="vi">
                      From: {item.originalSentence}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="circle-btn"
                  aria-label="Listen"
                  onClick={() => void speakVietnamese(item.expression)}
                >
                  ♪
                </button>
              </div>
              <button
                type="button"
                className="mt-3 text-sm text-coral"
                onClick={() => setItems(removeVocabItem(item.id))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <Link href="/scan" className="teacher-btn-primary mt-8 w-full text-center">
        Scan & Read
      </Link>
      <Link href="/" className="teacher-btn-secondary mt-3 w-full text-center">
        Home
      </Link>
    </div>
  );
}
