// src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { xpForDifficulty, levelFromXp, streakFromDays, xpToNextLevel } = require('../services/progressService');

router.get('/', async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.render('dashboard', {
        progress: null,
        dueQuests: [],
        completedToday: [],
        showWelcomeBonus: false
      });
    }

    const userId = req.session.userId;
    const today = new Date().toISOString().slice(0, 10);

    // Active quests NOT yet completed today
    const [dueQuests] = await pool.execute(
      `SELECT q.id, q.title, q.difficulty
       FROM quests q
       WHERE q.user_id = ?
         AND q.is_active = 1
         AND q.id NOT IN (
           SELECT quest_id FROM quest_logs
           WHERE user_id = ? AND performed_on = ?
         )
       ORDER BY q.difficulty DESC, q.title ASC`,
      [userId, userId, today]
    );

    // Completed today
    const [completedToday] = await pool.execute(
      `SELECT q.title, q.difficulty
       FROM quest_logs l
       JOIN quests q ON q.id = l.quest_id
       WHERE l.user_id = ? AND l.performed_on = ?
       ORDER BY l.created_at DESC`,
      [userId, today]
    );

    // All-time completions for XP + streak
    const [allRows] = await pool.execute(
      `SELECT q.difficulty, l.performed_on
       FROM quest_logs l
       JOIN quests q ON q.id = l.quest_id
       WHERE l.user_id = ?`,
      [userId]
    );

    // Fetch bonus_xp for this user
    const [userRow] = await pool.execute(
      'SELECT bonus_xp FROM users WHERE id = ?',
      [userId]
    );
    const bonusXp = Number(userRow[0]?.bonus_xp ?? 0);

    // Total XP = earned from quests + welcome bonus
    const earnedXp = allRows.reduce((sum, r) => sum + xpForDifficulty(r.difficulty), 0);
    const totalXp = earnedXp + bonusXp;
    const level = levelFromXp(totalXp);
    const xpUntilNext = xpToNextLevel(totalXp);

    const uniqueDays = [...new Set(
      allRows.map(r => r.performed_on.toISOString().slice(0, 10))
    )].sort();
    const streak = streakFromDays(uniqueDays);

    const showWelcomeBonus = req.query.welcome === '1';

    res.render('dashboard', {
      dueQuests,
      completedToday,
      showWelcomeBonus,
      progress: { totalXp, level, streak, xpUntilNext }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;