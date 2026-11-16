"use client";

import { useEffect, useState } from "react";
import type { EnglishFeedback } from "@/lib/english/feedback";
import { getScenario } from "@/lib/english/scenarios";
import { speakEnglish } from "@/lib/english/speakClient";
import { CONTINUE_LABEL, REPLAY_LABEL } from "@/lib/english/a11y";
import { HearPhrase } from "./HearPhrase";
import { primaryBtn, secondaryBtn } from "./EnShell";
import { SpeakTake } from "./SpeakTake";

type Props = {
  scenarioId: string;
  lessonId: string;
  onDone: (feedback: EnglishFeedback | null) => void;
};

export function ScenarioRunner({ scenarioId, lessonId, onDone }: Props) {
  const scenario = getScenario(scenarioId);
  const [step, setStep] = useState(0);
  const [showVi, setShowVi] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/english/status")
      .then((res) => (res.ok ? res.json() : { ai: false }))
      .then((data: { ai?: boolean }) => {
        if (!cancelled) setAiReady(Boolean(data.ai));
      })
      .catch(() => {
        if (!cancelled) setAiReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!scenario) {
    return <p>Không tìm thấy tình huống này.</p>;
  }

  const current = scenario.steps[step];
  const last = step >= scenario.steps.length - 1;

  async function askTeacher() {
    setAiError(null);
    setAiNote(null);
    try {
      const res = await fetch("/api/english/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expected: current.en,
          scenario: scenarioId,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; correctionVi?: string; message?: string };
      if (!res.ok || !data.ok || !data.correctionVi) {
        setAiError(data.message || "Giáo viên AI chưa trả lời được.");
        return;
      }
      setAiNote(data.correctionVi);
    } catch {
      setAiError("Giáo viên AI chưa trả lời được.");
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-base">{scenario.introVi}</p>
      <p className="quiet-label text-[var(--en-navy)]">
        Câu {step + 1} / {scenario.steps.length}
      </p>
      <div className="en-panel p-4">
        <HearPhrase text={current.en} size="display" />
        <p className="mt-2 text-base">Bấm từng từ để nghe.</p>
      </div>
      {showVi ? <p className="text-lg">{current.vi}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button type="button" className={secondaryBtn} onClick={() => void speakEnglish(current.en, true)}>
          {REPLAY_LABEL}
        </button>
        <button type="button" className={secondaryBtn} onClick={() => setShowVi((value) => !value)}>
          {showVi ? "Ẩn tiếng Việt" : "Dịch"}
        </button>
        <button type="button" className={secondaryBtn} onClick={() => setShowSuggestion(true)}>
          Câu gợi ý
        </button>
        {aiReady ? (
          <button type="button" className={secondaryBtn} onClick={() => void askTeacher()}>
            Xin một góp ý
          </button>
        ) : null}
      </div>
      {showSuggestion ? (
        <p>
          Câu gợi ý: <HearPhrase text={scenario.suggestedEn} /> — {scenario.suggestedVi}
        </p>
      ) : null}
      {aiNote ? <p role="status">{aiNote}</p> : null}
      {aiError ? <p role="status">{aiError}</p> : null}
      {!aiReady ? <p>Giáo viên AI chưa được kết nối. Bạn vẫn nói theo câu mẫu.</p> : null}

      {current.who === "learner" ? (
        <SpeakTake
          expected={current.en}
          lessonId={lessonId}
          score
          onContinue={(feedback) => {
            if (last) onDone(feedback);
            else {
              setStep((value) => value + 1);
              setShowVi(false);
              setAiNote(null);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className={primaryBtn}
          onClick={() => {
            if (last) onDone(null);
            else setStep((value) => value + 1);
          }}
        >
          {last ? "Kết thúc" : CONTINUE_LABEL}
        </button>
      )}
      {step > 0 ? (
        <button type="button" className={secondaryBtn} onClick={() => setStep((value) => value - 1)}>
          Câu trước
        </button>
      ) : null}
    </div>
  );
}
