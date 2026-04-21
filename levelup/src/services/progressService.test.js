// src/services/progressService.test.js

const {
    xpForDifficulty,
    levelFromXp,
    streakFromDays,
    xpToNextLevel
  } = require('./progressService');
  
  // --- xpForDifficulty -------------------------
  
  describe('xpForDifficulty', () => {
    test('returns 10 for easy', () => {
      expect(xpForDifficulty('easy')).toBe(10);
    });
  
    test('returns 20 for medium', () => {
      expect(xpForDifficulty('medium')).toBe(20);
    });
  
    test('returns 30 for hard', () => {
      expect(xpForDifficulty('hard')).toBe(30);
    });
  
    test('returns 0 for unknown difficulty', () => {
      expect(xpForDifficulty('legendary')).toBe(0);
    });
  
    test('returns 0 for undefined', () => {
      expect(xpForDifficulty(undefined)).toBe(0);
    });
  
    test('returns 0 for empty string', () => {
      expect(xpForDifficulty('')).toBe(0);
    });
  });
  
  // --- levelFromXp -------------------------
  
  describe('levelFromXp', () => {
    test('starts at level 1 with 0 XP', () => {
      expect(levelFromXp(0)).toBe(1);
    });
  
    test('stays level 1 at 99 XP', () => {
      expect(levelFromXp(99)).toBe(1);
    });
  
    test('reaches level 2 at exactly 100 XP', () => {
      expect(levelFromXp(100)).toBe(2);
    });
  
    test('reaches level 2 at 199 XP', () => {
      expect(levelFromXp(199)).toBe(2);
    });
  
    test('reaches level 3 at 200 XP', () => {
      expect(levelFromXp(200)).toBe(3);
    });
  
    test('handles large XP values correctly', () => {
      expect(levelFromXp(1000)).toBe(11);
    });
  
    test('welcome bonus of 500 XP gives level 6', () => {
      expect(levelFromXp(500)).toBe(6);
    });
  });
  
  // --- xpToNextLevel -------------------------
  
  describe('xpToNextLevel', () => {
    test('needs 100 XP from 0', () => {
      expect(xpToNextLevel(0)).toBe(100);
    });
  
    test('needs 1 XP at 99', () => {
      expect(xpToNextLevel(99)).toBe(1);
    });
  
    test('needs 100 XP at exactly 100 (just levelled up)', () => {
      expect(xpToNextLevel(100)).toBe(100);
    });
  
    test('needs 50 XP at 50', () => {
      expect(xpToNextLevel(50)).toBe(50);
    });
  
    test('needs 50 XP at 150', () => {
      expect(xpToNextLevel(150)).toBe(50);
    });
  });
  
  // --- streakFromDays -------------------------
  
  describe('streakFromDays', () => {
    // Helper to get a date string N days ago from today
    function daysAgo(n) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - n);
      return d.toISOString().slice(0, 10);
    }
  
    test('returns 0 for empty array', () => {
      expect(streakFromDays([])).toBe(0);
    });
  
    test('returns 1 if only today is completed', () => {
      expect(streakFromDays([daysAgo(0)])).toBe(1);
    });
  
    test('returns 1 if only yesterday is completed (grace period)', () => {
      expect(streakFromDays([daysAgo(1)])).toBe(1);
    });
  
    test('returns 0 if last completion was 2 days ago', () => {
      expect(streakFromDays([daysAgo(2)])).toBe(0);
    });
  
    test('returns 3 for today + last 2 days', () => {
      const days = [daysAgo(0), daysAgo(1), daysAgo(2)];
      expect(streakFromDays(days)).toBe(3);
    });
  
    test('returns 3 for yesterday + 2 days ago + 3 days ago (not completed today yet)', () => {
      const days = [daysAgo(1), daysAgo(2), daysAgo(3)];
      expect(streakFromDays(days)).toBe(3);
    });
  
    test('streak breaks if there is a gap', () => {
      // Today + 2 days ago (missing yesterday = gap)
      const days = [daysAgo(0), daysAgo(2)];
      expect(streakFromDays(days)).toBe(1);
    });
  
    test('handles unsorted input correctly', () => {
      const days = [daysAgo(2), daysAgo(0), daysAgo(1)];
      expect(streakFromDays(days)).toBe(3);
    });
  
    test('handles duplicate dates without inflating streak', () => {
      const days = [daysAgo(0), daysAgo(0), daysAgo(1)];
      expect(streakFromDays(days)).toBe(2);
    });
  
    test('long streak of 7 days', () => {
      const days = [0,1,2,3,4,5,6].map(daysAgo);
      expect(streakFromDays(days)).toBe(7);
    });
  });