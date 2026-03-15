// src/routes/questRoutes.js

const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// List quests
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [quests] = await pool.execute(
      'SELECT id, title, difficulty, is_active FROM quests WHERE user_id = ? ORDER BY created_at DESC',
      [req.session.userId]
    );
    res.render('quests', { quests, errors: [], values: {}, query: req.query });
  } catch (err) {
    next(err);
  }
});

// Create quest
router.post(
  '/',
  requireAuth,
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3–120 characters.'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty.'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const values = { title: req.body.title, difficulty: req.body.difficulty };

      if (!errors.isEmpty()) {
        const [quests] = await pool.execute(
          'SELECT id, title, difficulty, is_active FROM quests WHERE user_id = ? ORDER BY created_at DESC',
          [req.session.userId]
        );
        return res.status(400).render('quests', { quests, errors: errors.array(), values, query: req.query });
      }

      await pool.execute(
        'INSERT INTO quests (user_id, title, difficulty) VALUES (?,?,?)',
        [req.session.userId, req.body.title, req.body.difficulty]
      );

      res.redirect('/quests?created=1');
    } catch (err) {
      next(err);
    }
  }
);

// Complete quest
router.post('/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const questId = Number(req.params.id);
    const userId = req.session.userId;
    const today = new Date().toISOString().slice(0, 10);

    const [qrows] = await pool.execute(
      'SELECT id FROM quests WHERE id = ? AND user_id = ? AND is_active = 1',
      [questId, userId]
    );
    if (qrows.length === 0) return res.status(404).send('Quest not found');

    try {
      await pool.execute(
        'INSERT INTO quest_logs (user_id, quest_id, performed_on, status, notes) VALUES (?,?,?,?,?)',
        [userId, questId, today, 'completed', '']
      );
    } catch (e) {
      if (e.code !== 'ER_DUP_ENTRY') throw e;
    }

    res.redirect('/?completed=1');
  } catch (err) {
    next(err);
  }
});

// Edit quest (GET)
router.get('/:id/edit', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, difficulty, is_active FROM quests WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    if (rows.length === 0) return res.status(404).send('Quest not found');
    res.render('quest-edit', { quest: rows[0], errors: [] });
  } catch (err) {
    next(err);
  }
});

// Edit quest (POST)
router.post(
  '/:id/edit',
  requireAuth,
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3–120 characters.'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty.'),
  async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM quests WHERE id = ? AND user_id = ?',
        [req.params.id, req.session.userId]
      );
      if (rows.length === 0) return res.status(404).send('Quest not found');

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('quest-edit', {
          quest: { id: req.params.id, title: req.body.title, difficulty: req.body.difficulty },
          errors: errors.array()
        });
      }

      await pool.execute(
        'UPDATE quests SET title = ?, difficulty = ? WHERE id = ? AND user_id = ?',
        [req.body.title, req.body.difficulty, req.params.id, req.session.userId]
      );

      res.redirect('/quests?updated=1');
    } catch (err) {
      next(err);
    }
  }
);

// Toggle pause/resume
router.post('/:id/toggle', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, is_active FROM quests WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    if (rows.length === 0) return res.status(404).send('Quest not found');

    const newState = rows[0].is_active ? 0 : 1;
    await pool.execute(
      'UPDATE quests SET is_active = ? WHERE id = ? AND user_id = ?',
      [newState, req.params.id, req.session.userId]
    );

    res.redirect('/quests?toggled=1');
  } catch (err) {
    next(err);
  }
});

// Delete quest
router.post('/:id/delete', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id FROM quests WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    if (rows.length === 0) return res.status(404).send('Quest not found');

    await pool.execute(
      'DELETE FROM quests WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );

    res.redirect('/quests?deleted=1');
  } catch (err) {
    next(err);
  }
});

// Quest logs view
router.get('/logs', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;

    const [logs] = await pool.execute(
      `SELECT l.performed_on, l.status, l.notes, l.created_at,
              q.title, q.difficulty
       FROM quest_logs l
       JOIN quests q ON q.id = l.quest_id
       WHERE l.user_id = ?
       ORDER BY l.performed_on DESC, l.created_at DESC
       LIMIT 50`,
      [userId]
    );

    const [weekly] = await pool.execute(
      `SELECT l.performed_on, COUNT(*) AS count,
              SUM(CASE q.difficulty WHEN 'easy' THEN 10 WHEN 'medium' THEN 20 WHEN 'hard' THEN 30 ELSE 0 END) AS xp_earned
       FROM quest_logs l
       JOIN quests q ON q.id = l.quest_id
       WHERE l.user_id = ?
         AND l.performed_on >= DATE_SUB(CURDATE(), INTERVAL 28 DAY)
       GROUP BY l.performed_on
       ORDER BY l.performed_on ASC`,
      [userId]
    );

    res.render('logs', { logs, weekly });
  } catch (err) {
    next(err);
  }
});

module.exports = router;