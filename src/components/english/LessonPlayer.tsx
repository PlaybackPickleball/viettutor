"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { browserStore } from "@/lib/experience/store";
import { CONTINUE_LABEL, REPLAY_LABEL, SLOW_LABEL } from "@/lib/english/a11y";
import { combineCorrect, displayOrder } from "@/lib/english/buildLesson";
import { getEnglishLesson } from "@/lib/english/curriculum";
import type { EnglishFeedback } from "@/lib/english/feedback";
import { clearStage, loadEnglishProgress, recordAttempt, saveEnglishProgress, upsertReview } from "@/lib/english/progress";
import { getScenario } from "@/lib/english/scenarios";
import { speakEnglish } from "@/lib/english/speakClient";
import type { LessonStage } from "@/lib/english/lessonTypes";
import { EnShell, primaryBtn, secondaryBtn } from "./EnShell";
import { ScenarioRunner } from "./ScenarioRunner";
import { SpeakTake } from "./SpeakTake";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const lesson = getEnglishLesson(lessonId);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [showIpa, setShowIpa] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  useEffect(() => {
    if (!lesson) return;
    const track = loadEnglishProgress(browserStore()).lessons[lesson.id];
    if (track && !track.completed) {
      setIndex(Math.min(track.stageIndex, lesson.stages.length - 1));
    }
  }, [lesson]);

  const stage = lesson?.stages[index];
  const chipSeed = stage?.id ?? lessonId;
  const bank = useMemo(() => {
    if (!stage || stage.kind !== "combine") return [];
    return displayOrder(stage.tokens, chipSeed);
  }, [stage, chipSeed]);

  if (!lesson || !stage) {
    return (
      <EnShell title="Không thấy bài này">
        <Link href="/en/lessons" className={primaryBtn}>
          Danh sách bài
        </Link>
      </EnShell>
    );
  }

  const currentLesson = lesson;
  const currentStage = stage;
  const previous = currentLesson.day > 1 ? `/en/lesson/d${String(currentLesson.day - 1).padStart(2, "0")}` : null;

  function persist(feedback: EnglishFeedback | null, stageToClear: LessonStage) {
    const store = browserStore();
    let progress = loadEnglishProgress(store);
    const spoken =
      stageToClear.kind === "scenario"
        ? scenarioPhrase(stageToClear.scenarioId)
        : spokenPhrase(stageToClear);
    if (
      feedback &&
      spoken &&
      (stageToClear.kind === "pronounce" || stageToClear.kind === "converse" || stageToClear.kind === "scenario")
    ) {
      progress = recordAttempt(progress, {
        lessonId: currentLesson.id,
        phrase: spoken.en,
        source: feedback.source,
        category: feedback.category,
        failed: feedback.failed,
        phonemeScoringAvailable: feedback.phonemeScoringAvailable,
        observationVi: feedback.observationVi,
        recognizedText: feedback.recognizedText,
      });
      const missed = feedback.failed || feedback.category === "needs_practice" || feedback.category === "fairly_good";
      if (missed) {
        progress = upsertReview(
          progress,
          {
            en: spoken.en,
            vi: spoken.vi,
            lessonId: currentLesson.id,
            category: feedback.category === "fairly_good" ? "fairly_good" : "needs_practice",
          },
          todayKey(),
        );
      }
    }
    progress = clearStage(progress, currentLesson.id, stageToClear.id, index, currentLesson.stages.length);
    saveEnglishProgress(progress, store);
  }

  function rememberMiss(en: string, vi: string) {
    const store = browserStore();
    const progress = upsertReview(
      loadEnglishProgress(store),
      { en, vi, lessonId: currentLesson.id, category: "needs_practice" },
      todayKey(),
    );
    saveEnglishProgress(progress, store);
  }

  function goNext(feedback: EnglishFeedback | null) {
    persist(feedback, currentStage);
    setPicked(null);
    setChips([]);
    setShowIpa(false);
    setSpeechError(null);
    if (index < currentLesson.stages.length - 1) setIndex(index + 1);
    else setFinished(true);
  }

  async function replay(text: string, slow = false) {
    setSpeechError(null);
    try {
      await speakEnglish(text, slow);
    } catch {
      setSpeechError("Máy này chưa đọc được tiếng Anh. Bạn vẫn đi tiếp được.");
    }
  }

  const modelText = modelOf(stage);

  return (
    <EnShell title={lesson.titleVi}>
      <p className="text-base">
        Ngày {lesson.day} / 30 · {lesson.titleEn}
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-base">
        {lesson.objectives.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-base">
        Bước {index + 1} / {lesson.stages.length}
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {previous ? (
          <Link href={previous} className={secondaryBtn}>
            Bài trước
          </Link>
        ) : null}
        <Link href="/en/lessons" className={secondaryBtn}>
          Tất cả các bài
        </Link>
      </div>

      <section className="mt-6 space-y-4" aria-live="polite">
        <h2 className="en-instruction">{stage.instruction}</h2>
        {modelText ? (
          <p className="font-display text-4xl leading-tight" lang="en">
            {modelText}
          </p>
        ) : null}
        {"vi" in stage && stage.vi ? <p className="text-xl">{stage.vi}</p> : null}
        {"ipa" in stage && stage.ipa ? (
          <div>
            <button type="button" className={secondaryBtn} onClick={() => setShowIpa((value) => !value)}>
              {showIpa ? "Ẩn phiên âm" : "Hiện phiên âm"}
            </button>
            {showIpa ? <p className="mt-2 text-lg">/{stage.ipa}/</p> : null}
          </div>
        ) : null}
        {"coach" in stage && stage.coach ? <p className="text-base">{stage.coach}</p> : null}
        {modelText ? (
          <div className="flex flex-wrap gap-3">
            <button type="button" className={secondaryBtn} onClick={() => void replay(modelText, false)}>
              {REPLAY_LABEL}
            </button>
            <button type="button" className={secondaryBtn} onClick={() => void replay(modelText, true)}>
              {SLOW_LABEL}
            </button>
          </div>
        ) : null}
        {speechError ? <p>{speechError}</p> : null}

        {stage.kind === "listen" || stage.kind === "review" ? (
          <div className="space-y-3">
            {stage.kind === "review"
              ? stage.items.map((item) => (
                  <button
                    key={item.en}
                    type="button"
                    className={`${secondaryBtn} w-full justify-between`}
                    onClick={() => void replay(item.en, true)}
                  >
                    <span lang="en">{item.en}</span>
                    <span>{item.vi}</span>
                  </button>
                ))
              : null}
            <button type="button" className={primaryBtn} onClick={() => goNext(null)}>
              {CONTINUE_LABEL}
            </button>
          </div>
        ) : null}

        {stage.kind === "recognize" || stage.kind === "understand" ? (
          <ChoiceStep
            choices={stage.choices}
            answerId={stage.answerId}
            picked={picked}
            onPick={setPicked}
            onContinue={() => {
              if (picked && picked !== stage.answerId) {
                const phrase = stage.kind === "recognize" ? stage.en : stage.instruction;
                rememberMiss(phrase, stage.choices.find((choice) => choice.id === stage.answerId)?.label ?? phrase);
              }
              goNext(null);
            }}
          />
        ) : null}

        {stage.kind === "combine" ? (
          <CombineStep
            bank={bank}
            tokens={stage.tokens}
            chips={chips}
            setChips={setChips}
            onContinue={() => {
              if (!combineCorrect(stage.tokens, chips)) rememberMiss(stage.tokens.join(" "), stage.vi);
              goNext(null);
            }}
          />
        ) : null}

        {stage.kind === "converse" ? (
          <div className="space-y-3">
            {stage.lines.map((line) => (
              <p key={`${line.who}-${line.en}`}>
                <span className="font-semibold">{line.who === "teacher" ? "Giáo viên" : "Bạn"}: </span>
                <span lang="en">{line.en}</span>
                <span> — {line.vi}</span>
              </p>
            ))}
            <SpeakTake
              key={stage.id}
              expected={stage.lines.find((line) => line.who === "learner")?.en ?? stage.lines[0].en}
              lessonId={lesson.id}
              score
              onContinue={(feedback) => goNext(feedback)}
            />
          </div>
        ) : null}

        {stage.kind === "repeat" || stage.kind === "pronounce" ? (
          <SpeakTake
            key={stage.id}
            expected={stage.en}
            lessonId={lesson.id}
            score={stage.kind === "pronounce"}
            onContinue={(feedback) => goNext(feedback)}
          />
        ) : null}

        {stage.kind === "scenario" ? (
          <ScenarioRunner
            scenarioId={stage.scenarioId}
            lessonId={lesson.id}
            onDone={(feedback) => goNext(feedback)}
          />
        ) : null}

        {stage.kind === "summary" ? <SummaryStep phrases={stage.phrases} onContinue={() => goNext(null)} /> : null}
      </section>
      <p className="mt-8 text-base">{lesson.completionVi}</p>
      {finished ? (
        <Link href="/en" className={`${primaryBtn} mt-4`}>
          Về trang học
        </Link>
      ) : null}
    </EnShell>
  );
}

function scenarioPhrase(scenarioId: string): { en: string; vi: string } | null {
  const line = getScenario(scenarioId)?.steps.filter((step) => step.who === "learner").at(-1);
  return line ? { en: line.en, vi: line.vi } : null;
}

function spokenPhrase(stage: LessonStage): { en: string; vi: string } | null {
  if (stage.kind === "converse") {
    const line = stage.lines.find((item) => item.who === "learner") ?? stage.lines[0];
    return line ? { en: line.en, vi: line.vi } : null;
  }
  if (stage.kind === "listen" || stage.kind === "repeat" || stage.kind === "pronounce") {
    return { en: stage.en, vi: stage.vi };
  }
  return null;
}

function modelOf(stage: LessonStage): string | null {
  if ("en" in stage && stage.en) return stage.en;
  if (stage.kind === "combine") return stage.tokens.join(" ");
  if (stage.kind === "recognize") return stage.en;
  return null;
}

function ChoiceStep({
  choices,
  answerId,
  picked,
  onPick,
  onContinue,
}: {
  choices: { id: string; label: string }[];
  answerId: string;
  picked: string | null;
  onPick: (id: string) => void;
  onContinue: () => void;
}) {
  const correct = picked === answerId;
  return (
    <div className="space-y-3">
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          className={picked === choice.id ? primaryBtn : secondaryBtn}
          aria-pressed={picked === choice.id}
          onClick={() => onPick(choice.id)}
        >
          {choice.label}
        </button>
      ))}
      {picked && !correct ? <p>Chưa phải ý đó. Chọn lại, hoặc đi tiếp và ôn sau.</p> : null}
      {correct ? <p>Đúng rồi.</p> : null}
      {picked ? (
        <button type="button" className={primaryBtn} onClick={onContinue}>
          {CONTINUE_LABEL}
        </button>
      ) : null}
    </div>
  );
}

function CombineStep({
  bank,
  tokens,
  chips,
  setChips,
  onContinue,
}: {
  bank: string[];
  tokens: string[];
  chips: string[];
  setChips: (next: string[]) => void;
  onContinue: () => void;
}) {
  const used = new Map<string, number>();
  for (const chip of chips) used.set(chip, (used.get(chip) ?? 0) + 1);
  const correct = chips.length === tokens.length && combineCorrect(tokens, chips);
  return (
    <div className="space-y-3">
      <p className="min-h-14 rounded-2xl border-2 border-[#1b2a4a] px-4 py-3 text-xl" lang="en">
        {chips.join(" ") || "…"}
      </p>
      <div className="flex flex-wrap gap-3">
        {bank.map((token, index) => {
          const seenBefore = bank.slice(0, index).filter((item) => item === token).length;
          const taken = (used.get(token) ?? 0) > seenBefore;
          return (
            <button
              key={`${token}-${index}`}
              type="button"
              className={secondaryBtn}
              disabled={taken}
              onClick={() => setChips([...chips, token])}
            >
              {token}
            </button>
          );
        })}
      </div>
      <button type="button" className={secondaryBtn} onClick={() => setChips(chips.slice(0, -1))} disabled={chips.length === 0}>
        Xóa
      </button>
      {chips.length === tokens.length && !correct ? <p>Thứ tự chưa đúng. Xóa bớt rồi ghép lại, hoặc đi tiếp.</p> : null}
      {correct ? <p>Câu đã đủ.</p> : null}
      {chips.length > 0 ? (
        <button type="button" className={primaryBtn} onClick={onContinue}>
          {CONTINUE_LABEL}
        </button>
      ) : null}
    </div>
  );
}

function SummaryStep({ phrases, onContinue }: { phrases: string[]; onContinue: () => void }) {
  const rows = useMemo(() => {
    const attempts = loadEnglishProgress(browserStore()).attempts;
    return phrases.map((phrase) => {
      const latest = [...attempts].reverse().find((item) => item.phrase === phrase);
      if (!latest || latest.failed || !latest.category) return { phrase, label: "Chưa chấm được" };
      if (latest.category === "needs_practice") return { phrase, label: "Cần luyện thêm" };
      if (latest.category === "fairly_good") return { phrase, label: "Khá tốt" };
      return { phrase, label: "Rất tốt" };
    });
  }, [phrases]);

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.phrase} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[#1b2a4a] px-4 py-3">
            <span lang="en">{row.phrase}</span>
            <span>{row.label}</span>
          </li>
        ))}
      </ul>
      <p>Không có điểm trung bình.</p>
      <button type="button" className={primaryBtn} onClick={onContinue}>
        Hoàn thành
      </button>
    </div>
  );
}
