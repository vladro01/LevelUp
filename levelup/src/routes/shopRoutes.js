// src/routes/shopRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Helper: get a user's total earned XP, bonus XP, spent XP => spendable balance
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

  const [userRow] = await pool.execute(
    'SELECT xp_spent, bonus_xp FROM users WHERE id = ?',
    [userId]
  );

  const totalEarned = Number(earned[0].total) + Number(userRow[0]?.bonus_xp ?? 0);
  const totalSpent  = Number(userRow[0]?.xp_spent ?? 0);
  return { totalEarned, totalSpent, balance: totalEarned - totalSpent };
}

// --- GET /shop -------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { totalEarned, balance } = await getXpBalance(userId);

    const [items] = await pool.execute(
      `SELECT s.*,
              (ui.id IS NOT NULL) AS owned
       FROM shop_items s
       LEFT JOIN user_inventory ui
         ON ui.item_id = s.id AND ui.user_id = ?
       ORDER BY s.category, s.cost_xp`,
      [userId]
    );

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

// --- POST /shop/:id/buy -------------------------------------
router.post('/:id/buy', async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const itemId = Number(req.params.id);

    const [items] = await pool.execute(
      'SELECT * FROM shop_items WHERE id = ?',
      [itemId]
    );
    if (!items.length) return res.status(404).send('Item not found');
    const item = items[0];

    const [owned] = await pool.execute(
      'SELECT id FROM user_inventory WHERE user_id = ? AND item_id = ?',
      [userId, itemId]
    );
    if (owned.length) {
      return res.redirect('/shop?flash=You+already+own+that+item.&flashType=info');
    }

    const { balance } = await getXpBalance(userId);
    if (balance < item.cost_xp) {
      return res.redirect(`/shop?flash=Not+enough+XP!+You+need+${item.cost_xp}+XP.&flashType=danger`);
    }

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