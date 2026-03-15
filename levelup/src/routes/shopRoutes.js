// src/routes/shopRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const requireAuth = require('../middleware/requireAuth');
const { xpForDifficulty } = require('../services/progressService');

// Helper: get a user's total earned XP and spent XP → spendable balance
async function getXpBalance(userId) {
  const [earned] = await pool.execute(
    `SELECT COALESCE(SUM(
       CASE q.difficulty
         WHEN 'easy'   THEN 10
         WHEN 'medium' THEN 20
         WHEN 'hard'   THEN 30
         ELSE 0 END
     ), 0) AS total
     FROM quest_logs l
     JOIN quests q ON q.id = l.quest_id
     WHERE l.user_id = ?`,
    [userId]
  );
  const [spent] = await pool.execute(
    'SELECT xp_spent FROM users WHERE id = ?',
    [userId]
  );
  const totalEarned = Number(earned[0].total);
  const totalSpent  = Number(spent[0]?.xp_spent ?? 0);
  return { totalEarned, totalSpent, balance: totalEarned - totalSpent };
}

// ─── GET /shop ────────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;

    const { totalEarned, balance } = await getXpBalance(userId);

    // All shop items + whether this user owns each one
    const [items] = await pool.execute(
      `SELECT s.*,
              (ui.id IS NOT NULL) AS owned
       FROM shop_items s
       LEFT JOIN user_inventory ui
         ON ui.item_id = s.id AND ui.user_id = ?
       ORDER BY s.category, s.cost_xp`,
      [userId]
    );

    // Group by category for the view
    const grouped = {};
    for (const item of items) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }

    res.render('shop', {
      grouped,
      balance,
      totalEarned,
      flash: req.query.flash || null,
      flashType: req.query.flashType || 'info'
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /shop/:id/buy ───────────────────────────────────────────────────────
router.post('/:id/buy', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const itemId = Number(req.params.id);

    // Get item
    const [items] = await pool.execute(
      'SELECT * FROM shop_items WHERE id = ?',
      [itemId]
    );
    if (!items.length) return res.status(404).send('Item not found');
    const item = items[0];

    // Check not already owned
    const [owned] = await pool.execute(
      'SELECT id FROM user_inventory WHERE user_id = ? AND item_id = ?',
      [userId, itemId]
    );
    if (owned.length) {
      return res.redirect('/shop?flash=You+already+own+that+item.&flashType=info');
    }

    // Check balance
    const { balance } = await getXpBalance(userId);
    if (balance < item.cost_xp) {
      return res.redirect(`/shop?flash=Not+enough+XP!+You+need+${item.cost_xp}+XP.&flashType=danger`);
    }

    // Deduct XP + add to inventory in a transaction
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute(
        'UPDATE users SET xp_spent = xp_spent + ? WHERE id = ?',
        [item.cost_xp, userId]
      );
      await conn.execute(
        'INSERT INTO user_inventory (user_id, item_id) VALUES (?,?)',
        [userId, itemId]
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    res.redirect(`/shop?flash=Purchased+${encodeURIComponent(item.name)}!+Go+to+your+avatar+to+equip+it.&flashType=success`);
  } catch (err) {
    next(err);
  }
});

module.exports = { router, getXpBalance };