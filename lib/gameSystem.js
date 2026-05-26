/* ── LEVEL SYSTEM ── */

// XP required to reach each level
const LEVEL_XP = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];

export function getLevel(xp) {
  let level = 0;
  for (let i = 0; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) level = i;
  }
  return level;
}

export function getXPForLevel(level) {
  return LEVEL_XP[level] ?? LEVEL_XP[LEVEL_XP.length - 1];
}

export function getXPProgress(xp) {
  const level      = getLevel(xp);
  const current    = LEVEL_XP[level]    ?? 0;
  const next       = LEVEL_XP[level + 1] ?? current + 1000;
  const progress   = xp - current;
  const needed     = next - current;
  const pct        = Math.min(Math.round((progress / needed) * 100), 100);
  return { level, current, next, progress, needed, pct };
}

/* ── STREAK SYSTEM ── */

export function calcStreak(habitsData) {
  const today = new Date();
  let streak  = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day  = d.toISOString().slice(0, 10);
    const done = Object.keys(habitsData).filter(k =>
      k.endsWith(`_${day}`) && habitsData[k]
    ).length;

    if (done >= 3) {
      streak++;
    } else if (i > 0) {
      break; // streak broken
    }
    // If today (i=0) has 0, streak starts from 0 but don't break
  }
  return streak;
}

/* ── ACHIEVEMENT DEFINITIONS ── */

export const ACHIEVEMENTS = [
  {
    id: "first_task",
    icon: "✅",
    nameKey: "firstTask",
    descKey: "firstTaskDesc",
    check: (s) => s.tasksCompleted >= 1,
  },
  {
    id: "tasks_10",
    icon: "📋",
    nameKey: "tasks10",
    descKey: "tasks10Desc",
    check: (s) => s.tasksCompleted >= 10,
  },
  {
    id: "tasks_50",
    icon: "🏆",
    nameKey: "tasks50",
    descKey: "tasks50Desc",
    check: (s) => s.tasksCompleted >= 50,
  },
  {
    id: "streak_3",
    icon: "🔥",
    nameKey: "streak3",
    descKey: "streak3Desc",
    check: (s) => s.streak >= 3,
  },
  {
    id: "streak_7",
    icon: "⚡",
    nameKey: "streak7",
    descKey: "streak7Desc",
    check: (s) => s.streak >= 7,
  },
  {
    id: "streak_30",
    icon: "👑",
    nameKey: "streak30",
    descKey: "streak30Desc",
    check: (s) => s.streak >= 30,
  },
  {
    id: "perfect_day",
    icon: "💯",
    nameKey: "perfectDay",
    descKey: "perfectDayDesc",
    check: (s) => s.perfectDays >= 1,
  },
  {
    id: "level_5",
    icon: "🌟",
    nameKey: "level5",
    descKey: "level5Desc",
    check: (s) => s.level >= 5,
  },
  {
    id: "level_10",
    icon: "🚀",
    nameKey: "level10",
    descKey: "level10Desc",
    check: (s) => s.level >= 10,
  },
  {
    id: "habit_week",
    icon: "🎯",
    nameKey: "habitWeek",
    descKey: "habitWeekDesc",
    check: (s) => s.streak >= 7,
  },
];

/* ── CHECK NEW ACHIEVEMENTS ── */

export function checkNewAchievements(stats, unlockedIds) {
  return ACHIEVEMENTS.filter(a =>
    !unlockedIds.includes(a.id) && a.check(stats)
  );
}

/* ── XP REWARDS ── */

export const XP = {
  TASK_DONE:    10,
  HABIT_DONE:   15,
  PERFECT_DAY:  50,
};

/* ── XP PENALTIES ── */

export const PENALTY = {
  MISSED_DAY:   20,  // 0 habits done yesterday
  LOW_HABITS:   10,  // 1–2 habits done yesterday
};
