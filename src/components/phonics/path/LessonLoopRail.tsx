"use client";

import {
  LOOP_PHASES,
  LOOP_PHASE_LABEL,
  completedLoopPhases,
  exerciseLoopPhase,
  type LearningLesson,
} from "@/lib/phonics/learningPath";

type Props = {
  lesson: LearningLesson;
  currentIndex: number;
};

export function LessonLoopRail({ lesson, currentIndex }: Props) {
  const reached = completedLoopPhases(lesson, currentIndex);
  const current = lesson.exercises[currentIndex]
    ? exerciseLoopPhase(lesson.exercises[currentIndex]!)
    : null;

  return (
    <ol
      className="mb-4 flex flex-wrap items-center gap-1.5"
      aria-label="Hear, Recognize, Say, Recall progress"
    >
      {LOOP_PHASES.map((phase, i) => {
        const active = current === phase;
        const done = reached.has(phase) && !active;
        return (
          <li key={phase} className="flex items-center gap-1.5">
            {i > 0 ? (
              <span className="text-ink/25" aria-hidden>
                →
              </span>
            ) : null}
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                active
                  ? "bg-coral text-white"
                  : done
                    ? "bg-coral/15 text-coral"
                    : "bg-ink/8 text-ink/45"
              }`}
            >
              {LOOP_PHASE_LABEL[phase]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
