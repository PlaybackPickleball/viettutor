import {
  buildSyllable,
  hearSound,
  listenChoose,
  listenType,
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

/**
 * Core Hear → Recognize → (focus middle) → Say → Recall for generated worlds.
 */
function buildExercises(lessonKey: string, spec: WorldLessonSpec): PathExercise[] {
  const primary = getSyllable(spec.targets[0]);
  if (!primary) throw new Error(`Missing primary syllable ${spec.targets[0]}`);
  const second = getSyllable(spec.targets[1] ?? spec.targets[0])!;
  const third = getSyllable(spec.targets[2] ?? spec.targets[0])!;
  const skills = [...new Set([...spec.introduces, ...spec.review, "listen-discriminate"])];
  const opts = choicesFromTargets(spec.targets.slice(0, Math.min(4, spec.targets.length)));

  const hear = hearSound({
    lessonKey,
    promptEn: `Hear ${primary.written}.`,
    audio: primary.written,
    written: primary.written,
    glossEn: primary.vocab?.glossEn,
    skillIds: skills,
  });
  const recognize = listenChoose({
    lessonKey,
    promptEn: `Recognize — which form did you hear?`,
    audio: primary.written,
    choices: opts,
    correctId: primary.written,
    hintEn: `Match the audio to ${primary.written}.`,
    skillIds: skills,
  });
  const say = speakCompare({
    lessonKey,
    written: primary.written,
    glossEn: primary.vocab?.glossEn,
    promptEn: `Say ${primary.written} — Deepgram match when configured (not a score).`,
    skillIds: [...skills, "speak-compare"],
  });
  const recall = listenType({
    lessonKey,
    promptEn: `Recall — type what you hear (no peeking).`,
    audio: primary.written,
    written: primary.written,
    glossEn: primary.vocab?.glossEn,
    skillIds: skills,
  });

  let middle: PathExercise[] = [];
  switch (spec.focus) {
    case "listen":
      middle = [
        listenChoose({
          lessonKey,
          promptEn: `Listen — which form?`,
          audio: second.written,
          choices: opts,
          correctId: second.written,
          hintEn: `Match the audio to ${second.written}.`,
          skillIds: skills,
        }),
        soundMatch({
          lessonKey,
          promptEn: "Match sound to writing.",
          audio: third.written,
          choices: opts,
          correctId: third.written,
          hintEn: `That was ${third.written}.`,
          skillIds: skills,
        }),
      ];
      break;
    case "build":
      middle = [
        buildSyllable({
          lessonKey,
          syllableId: primary.id,
          promptEn: `Build ${primary.written}.`,
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
              id:
                second.sequence[0]!.display === primary.sequence[0]!.display
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
      ];
      break;
    case "tone":
      middle = [
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
      ];
      break;
    case "read":
      middle = [
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
      ];
      break;
    case "speak":
      middle = [
        speakCompare({
          lessonKey,
          written: second.written,
          glossEn: second.vocab?.glossEn,
          promptEn: `Also say ${second.written}.`,
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
      ];
      break;
    case "challenge":
      middle = [
        reviewChallenge({
          lessonKey,
          promptEn: "Challenge — identify the form.",
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
      ];
      break;
    case "mixed":
    default:
      middle = [
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
      ];
      break;
  }

  return [hear, recognize, ...middle, say, recall];
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
