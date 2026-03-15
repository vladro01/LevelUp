// src/services/progressService.js

const XP_BY_DIFFICULTY = { easy: 10, medium: 20, hard: 30 };

function xpForDifficulty(difficulty) {
  return XP_BY_DIFFICULTY[difficulty] ?? 0;
}

function levelFromXp(totalXp) {
  return 1 + Math.floor(totalXp / 100);
}

/**
 * Calculate current streak from an array of unique YYYY-MM-DD completion days.
 *
 * FIX: The old version broke if today had no completion yet (streak reset to 0
 * even with a long run). We now also accept "yesterday" as the streak start,
 * so a user who hasn't completed anything yet today keeps their streak intact
 * until midnight.
 */
function streakFromDays(days) {
  if (!days.length) return 0;

  const daySet = new Set(days);

  // Helper: get YYYY-MM-DD for a Date object
  const fmt = (d) => d.toISOString().slice(0, 10);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Streak can start from today OR yesterday (grace for mid-day users)
  const startKey = daySet.has(fmt(today)) ? fmt(today) : fmt(yesterday);
  if (!daySet.has(startKey)) return 0;

  let streak = 0;
  const cursor = new Date(startKey);

  while (daySet.has(fmt(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/**
 * XP needed to reach the next level.
 * Each level requires 100 XP â€” returns how many more XP until level-up.
 */
function xpToNextLevel(totalXp) {
  return 100 - (totalXp % 100);
}

module.exports = { xpForDifficulty, levelFromXp, streakFromDays, xpToNextLevel };