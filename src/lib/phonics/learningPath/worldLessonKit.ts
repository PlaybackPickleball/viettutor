import {
  buildSyllable,
  listenChoose,
  missingComponent,
  readWithoutHelp,
  resetExerciseIds,
  reviewChallenge,
  soundMatch,
  speakCompare,
  toneDetective,
} from "./exerciseBuilders";
import { getSyllable } from "./syllables";
import type { LearningLesson, PathExercise } from "./types";

const STAR = { two: 0.7, three: 0.9 } as const;

export type LessonFocus =
  | "listen"
  | "build"
  | "tone"
  | "read"
  | "speak"
  | "mixed"
  | "challenge";

export type WorldLessonSpec = {
  titleEn: string;
  titleVi: string;
  summaryEn: string;
  introduces: string[];
  review: string[];
  targets: string[];
  focus: LessonFocus;
};

function choicesFromTargets(ids: string[]) {
  return ids.map((id) => {
    const s = getSyllable(id);
    if (!s) throw new Error(`Unknown syllable ${id}`);
    return {
      id: s.written,
      label: s.written,
      glossEn: s.vocab?.glossEn,
    };
  });
}

function buildExercises(lessonKey: string, spec: WorldLessonSpec): PathExercise[] {
  const primary = getSyllable(spec.targets[0]);
  if (!primary) throw new Error(`Missing primary syllable ${spec.targets[0]}`);
  const second = getSyllable(spec.targets[1] ?? spec.targets[0])!;
  const third = getSyllable(spec.targets[2] ?? spec.targets[0])!;
  const skills = [...new Set([...spec.introduces, ...spec.review, "listen-discriminate"])];
  const opts = choicesFromTargets(spec.targets.slice(0, Math.min(4, spec.targets.length)));

  switch (spec.focus) {
    case "listen":
      return [
        listenChoose({
          lessonKey,
          promptEn: `Listen — which form?`,
          audio: primary.written,
          choices: opts,
          correctId: primary.written,
          hintEn: `Match the audio to ${primary.written}.`,
          skillIds: skills,
        }),
        soundMatch({
          lessonKey,
          promptEn: "Match sound to writing.",
          audio: second.written,
          choices: opts,
          correctId: second.written,
          hintEn: `That was ${second.written}.`,
          skillIds: skills,
        }),
        listenChoose({
          lessonKey,
          promptEn: "One more listen.",
          audio: third.written,
          choices: opts,
          correctId: third.written,
          hintEn: `Listen again for ${third.written}.`,
          skillIds: skills,
        }),
        speakCompare({
          lessonKey,
          written: primary.written,
          glossEn: primary.vocab?.glossEn,
          promptEn: `Speak ${primary.written} — compare by ear.`,
          skillIds: [...skills, "speak-compare"],
        }),
      ];
    case "build":
      return [
        buildSyllable({
          lessonKey,
          syllableId: primary.id,
          promptEn: `Build ${primary.written}.`,
          skillIds: [...skills, "build-open-cv"],
        }),
        buildSyllable({
          lessonKey,
          syllableId: second.id,
          promptEn: `Build ${second.written}.`,
          skillIds: [...skills, "build-open-cv"],
        }),
        missingComponent({
          lessonKey,
          syllableId: primary.id,
          missingKind: primary.sequence[0]?.kind === "tone" ? "tone" : "initial",
          choices: [
            {
              id: primary.sequence[0]!.display,
              label: primary.sequence[0]!.display,
              glossEn: primary.sequence[0]!.glossEn,
            },
            {
              id: second.sequence[0]!.display === primary.sequence[0]!.display
                ? `${second.written}-alt`
                : second.sequence[0]!.display,
              label:
                second.sequence[0]!.display === primary.sequence[0]!.display
                  ? second.written
                  : second.sequence[0]!.display,
              glossEn: second.vocab?.glossEn,
            },
            { id: "a-distractor", label: "a", glossEn: "open ah vowel" },
          ],
          correctId: primary.sequence[0]!.display,
          promptEn: `What’s the first piece of ${primary.written}?`,
          hintEn: `Start with ${primary.sequence[0]!.utterance}.`,
          skillIds: skills,
        }),
        speakCompare({
          lessonKey,
          written: primary.written,
          glossEn: primary.vocab?.glossEn,
          promptEn: `Speak ${primary.written}.`,
          skillIds: [...skills, "speak-compare"],
        }),
      ];
    case "tone":
      return [
        toneDetective({
          lessonKey,
          promptEn: "Which written form matches the tone?",
          audio: primary.written,
          choices: opts,
          correctId: primary.written,
          hintEn: `Tone focus on ${primary.written}.`,
          skillIds: skills,
        }),
        buildSyllable({
          lessonKey,
          syllableId: primary.id,
          promptEn: `Build ${primary.written} with its tone.`,
          skillIds: [...skills, "build-open-cv"],
        }),
        listenChoose({
          lessonKey,
          promptEn: "Pick the form you hear.",
          audio: second.written,
          choices: opts,
          correctId: second.written,
          hintEn: `That was ${second.written}.`,
          skillIds: skills,
        }),
        speakCompare({
          lessonKey,
          written: primary.written,
          glossEn: primary.vocab?.glossEn,
          promptEn: `Speak ${primary.written}.`,
          skillIds: [...skills, "speak-compare"],
        }),
      ];
    case "read":
      return [
        readWithoutHelp({
          lessonKey,
          written: primary.written,
          glossEn: primary.vocab?.glossEn ?? primary.written,
          skillIds: [...skills, "read-familiar"],
        }),
        readWithoutHelp({
          lessonKey,
          written: second.written,
          glossEn: second.vocab?.glossEn ?? second.written,
          skillIds: [...skills, "read-familiar"],
        }),
        readWithoutHelp({
          lessonKey,
          written: third.written,
          glossEn: third.vocab?.glossEn ?? third.written,
          skillIds: [...skills, "read-familiar"],
        }),
        speakCompare({
          lessonKey,
          written: primary.written,
          glossEn: primary.vocab?.glossEn,
          promptEn: `Read aloud ${primary.written}.`,
          skillIds: [...skills, "speak-compare"],
        }),
      ];
    case "speak":
      return [
        speakCompare({
          lessonKey,
          written: primary.written,
          glossEn: primary.vocab?.glossEn,
          promptEn: `Speak ${primary.written}.`,
          skillIds: [...skills, "speak-compare"],
        }),
        speakCompare({
          lessonKey,
          written: second.written,
          glossEn: second.vocab?.glossEn,
          promptEn: `Speak ${second.written}.`,
          skillIds: [...skills, "speak-compare"],
        }),
        listenChoose({
          lessonKey,
          promptEn: "Confirm what you practiced.",
          audio: primary.written,
          choices: opts,
          correctId: primary.written,
          hintEn: `That was ${primary.written}.`,
          skillIds: skills,
        }),
        readWithoutHelp({
          lessonKey,
          written: third.written,
          glossEn: third.vocab?.glossEn ?? third.written,
          skillIds: [...skills, "read-familiar"],
        }),
      ];
    case "challenge":
      return [
        reviewChallenge({
          lessonKey,
          promptEn: "Challenge — identify the form.",
          audio: primary.written,
          choices: opts,
          correctId: primary.written,
          hintEn: `Answer is ${primary.written}.`,
          skillIds: skills,
        }),
        reviewChallenge({
          lessonKey,
          promptEn: "Challenge — next form.",
          audio: second.written,
          choices: opts,
          correctId: second.written,
          hintEn: `Answer is ${second.written}.`,
          skillIds: skills,
        }),
        buildSyllable({
          lessonKey,
          syllableId: primary.id,
          promptEn: `Rebuild ${primary.written}.`,
          skillIds: [...skills, "build-open-cv"],
        }),
        speakCompare({
          lessonKey,
          written: third.written,
          glossEn: third.vocab?.glossEn,
          promptEn: `Final speak — ${third.written}.`,
          skillIds: [...skills, "speak-compare"],
        }),
      ];
    case "mixed":
    default:
      return [
        buildSyllable({
          lessonKey,
          syllableId: primary.id,
          promptEn: `Build ${primary.written}.`,
          skillIds: [...skills, "build-open-cv"],
        }),
        listenChoose({
          lessonKey,
          promptEn: "Listen and choose.",
          audio: second.written,
          choices: opts,
          correctId: second.written,
          hintEn: `That was ${second.written}.`,
          skillIds: skills,
        }),
        readWithoutHelp({
          lessonKey,
          written: third.written,
          glossEn: third.vocab?.glossEn ?? third.written,
          skillIds: [...skills, "read-familiar"],
        }),
        speakCompare({
          lessonKey,
          written: primary.written,
          glossEn: primary.vocab?.glossEn,
          promptEn: `Speak ${primary.written}.`,
          skillIds: [...skills, "speak-compare"],
        }),
        reviewChallenge({
          lessonKey,
          promptEn: "Quick review.",
          audio: primary.written,
          choices: opts,
          correctId: primary.written,
          hintEn: `Still ${primary.written}.`,
          skillIds: skills,
        }),
      ];
  }
}

export function makeWorldPack(
  worldId: string,
  worldOrder: number,
  titleEn: string,
  titleVi: string,
  summaryEn: string,
  badgeId: string,
  specs: WorldLessonSpec[],
): { world: import("./types").LearningWorld; lessons: LearningLesson[] } {
  if (specs.length !== 12) {
    throw new Error(`${worldId} needs exactly 12 lessons, got ${specs.length}`);
  }
  resetExerciseIds();
  const lessons: LearningLesson[] = specs.map((spec, i) => {
    const order = i + 1;
    const id = `${worldId}-l${String(order).padStart(2, "0")}`;
    const lessonKey = `${worldId}l${String(order).padStart(2, "0")}`;
    return {
      id,
      worldId,
      order,
      titleEn: spec.titleEn,
      titleVi: spec.titleVi,
      summaryEn: spec.summaryEn,
      durationMin: order === 12 || spec.focus === "challenge" ? 4 : 3,
      playable: true,
      prerequisiteSkillIds: spec.review,
      introducesSkillIds: spec.introduces,
      reviewSkillIds: spec.review,
      targetSyllableIds: spec.targets,
      exercises: buildExercises(lessonKey, spec),
      starThresholds: STAR,
    };
  });
  return {
    world: {
      id: worldId,
      order: worldOrder,
      titleEn,
      titleVi,
      summaryEn,
      playable: true,
      badgeId,
      lessonIds: lessons.map((l) => l.id),
    },
    lessons,
  };
}
