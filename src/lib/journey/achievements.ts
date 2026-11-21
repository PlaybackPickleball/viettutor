/**
 * Journey achievements — derived from honest stores only (no invented scores).
 */

import {
  BADGE_LABELS,
  loadPathProgress,
  type PathProgressState,
} from "@/lib/phonics/learningPath";
import { loadProgress, practiceStreak, type ProgressState } from "@/lib/progress";
import { JOURNEY_UNITS } from "./catalog";
import {
  isJourneyLessonComplete,
  isJourneyUnitUnlocked,
  journeyHomeStats,
  loadJourneyProgress,
  type JourneyProgressState,
} from "./progress";
import {
  isKaraokeHookTouched,
  listKaraokeCurriculumHooks,
} from "./karaokeCurriculum";

export type JourneyAchievement = {
  id: string;
  titleEn: string;
  blurb: string;
  earned: boolean;
  /** Optional link when earned or to chase. */
  href?: string;
};

function unitLiveComplete(
  unitId: string,
  journey: JourneyProgressState,
  alphabet: ProgressState,
  path: PathProgressState,
): boolean {
  const unit = JOURNEY_UNITS.find((u) => u.id === unitId);
  if (!unit) return false;
  const live = unit.lessons.filter((l) => l.kind === "live");
  if (live.length === 0) return false;
  return live.every((l) => isJourneyLessonComplete(l, journey, alphabet, path));
}

export function listJourneyAchievements(
  journey = loadJourneyProgress(),
  alphabet: ProgressState = loadProgress(),
  path: PathProgressState = loadPathProgress(),
): JourneyAchievement[] {
  const hooks = listKaraokeCurriculumHooks();
  const hooksTouched = hooks.filter((h) => isKaraokeHookTouched(h.songId)).length;
  const streak = journeyHomeStats().streakDays;
  const alphabetStreak = practiceStreak(alphabet);

  const items: JourneyAchievement[] = [
    {
      id: "first-step",
      titleEn: "First step",
      blurb: "Finish your first Discover lesson.",
      earned: isJourneyLessonComplete(
        JOURNEY_UNITS[0]!.lessons.find((l) => l.id === "u1-l01")!,
        journey,
        alphabet,
        path,
      ),
      href: "/learn/u1-l01",
    },
    {
      id: "unit1-discover",
      titleEn: "Discover complete",
      blurb: "Finish every live lesson in Unit 1.",
      earned: unitLiveComplete("u1", journey, alphabet, path),
      href: "/learn",
    },
    {
      id: "unit2-tones",
      titleEn: "Six tones",
      blurb: "Finish Unit 2 — Southern tones first.",
      earned: unitLiveComplete("u2", journey, alphabet, path),
      href: "/learn",
    },
    {
      id: "foundations-badge",
      titleEn: "Foundations badge",
      blurb: BADGE_LABELS["badge-w0"] ?? "Complete Foundations on the path.",
      earned: path.badges.includes("badge-w0"),
      href: "/danh-van",
    },
    {
      id: "karaoke-first",
      titleEn: "First karaoke stamp",
      blurb: "Complete any mode on a curriculum karaoke song.",
      earned: hooksTouched >= 1,
      href: hooks[0]?.href ?? "/sing",
    },
    {
      id: "karaoke-set",
      titleEn: "Song set",
      blurb: "Touch every licensed curriculum karaoke hook.",
      earned: hooks.length > 0 && hooksTouched >= hooks.length,
      href: "/sing",
    },
    {
      id: "streak-3",
      titleEn: "3-day streak",
      blurb: "Practice on three days in a row (device clock).",
      earned: Math.max(streak, alphabetStreak, path.streakDays) >= 3,
      href: "/",
    },
    {
      id: "streak-7",
      titleEn: "7-day streak",
      blurb: "A full week of practice days.",
      earned: Math.max(streak, alphabetStreak, path.streakDays) >= 7,
      href: "/",
    },
  ];

  // Surface path world badges honestly (already earned only adds signal).
  for (const badgeId of path.badges) {
    if (badgeId === "badge-w0") continue;
    const label = BADGE_LABELS[badgeId];
    if (!label) continue;
    items.push({
      id: `path-${badgeId}`,
      titleEn: label,
      blurb: "Earned on the Đánh Vần learning path.",
      earned: true,
      href: "/danh-van",
    });
  }

  return items;
}

export function achievementCounts(
  journey = loadJourneyProgress(),
  alphabet: ProgressState = loadProgress(),
  path: PathProgressState = loadPathProgress(),
) {
  const all = listJourneyAchievements(journey, alphabet, path);
  const earned = all.filter((a) => a.earned).length;
  return { earned, total: all.length };
}

/** Units unlocked / complete for Profile analytics. */
export function journeyUnitAnalytics(
  journey = loadJourneyProgress(),
  alphabet: ProgressState = loadProgress(),
  path: PathProgressState = loadPathProgress(),
) {
  let unlocked = 0;
  let complete = 0;
  let liveDone = 0;
  let liveTotal = 0;
  for (const unit of JOURNEY_UNITS) {
    const live = unit.lessons.filter((l) => l.kind === "live");
    liveTotal += live.length;
    liveDone += live.filter((l) => isJourneyLessonComplete(l, journey, alphabet, path)).length;
    if (isJourneyUnitUnlocked(unit.id, journey, alphabet, path)) unlocked += 1;
    if (live.length > 0 && live.every((l) => isJourneyLessonComplete(l, journey, alphabet, path))) {
      complete += 1;
    }
  }
  const hooks = listKaraokeCurriculumHooks();
  const hooksTouched = hooks.filter((h) => isKaraokeHookTouched(h.songId)).length;
  const ach = achievementCounts(journey, alphabet, path);
  return {
    unitsUnlocked: unlocked,
    unitsComplete: complete,
    unitsTotal: JOURNEY_UNITS.length,
    liveLessonsComplete: liveDone,
    liveLessonsTotal: liveTotal,
    karaokeHooksTouched: hooksTouched,
    karaokeHooksTotal: hooks.length,
    achievementsEarned: ach.earned,
    achievementsTotal: ach.total,
    note: "Counts come from lessons finished and Sing mode stamps — not accuracy %.",
  };
}
