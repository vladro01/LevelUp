// src/routes/avatarRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const requireAuth = require('../middleware/requireAuth');
const { getXpBalance } = require('./shopRoutes');

// ─── GET /avatar ──────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;

    // Everything the user owns, with equip status
    const [inventory] = await pool.execute(
      `SELECT ui.id AS inv_id, ui.is_equipped, ui.item_id,
              s.name, s.category, s.item_key, s.cost_xp, s.description
       FROM user_inventory ui
       JOIN shop_items s ON s.id = ui.item_id
       WHERE ui.user_id = ?
       ORDER BY s.category, s.cost_xp`,
      [userId]
    );

    // Build equipped map: category → item_key (only one per category)
    const equipped = {};
    for (const inv of inventory) {
      if (inv.is_equipped) equipped[inv.category] = inv.item_key;
    }

    const { balance } = await getXpBalance(userId);

    res.render('avatar', {
      inventory,
      equipped,
      balance,
      flash: req.query.flash || null,
      flashType: req.query.flashType || 'info'
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /avatar/equip/:invId ────────────────────────────────────────────────
router.post('/equip/:invId', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const invId  = Number(req.params.invId);

    // Get this inventory row + its category
    const [rows] = await pool.execute(
      `SELECT ui.id, ui.is_equipped, ui.user_id, s.category, s.name
       FROM user_inventory ui
       JOIN shop_items s ON s.id = ui.item_id
       WHERE ui.id = ?`,
      [invId]
    );
    if (!rows.length || rows[0].user_id !== userId) {
      return res.status(404).send('Item not found');
    }

    const inv = rows[0];
    const alreadyEquipped = inv.is_equipped;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (alreadyEquipped) {
        // Unequip
        await conn.execute(
          'UPDATE user_inventory SET is_equipped = 0 WHERE id = ? AND user_id = ?',
          [invId, userId]
        );
      } else {
        // Unequip any other item in same category first
        await conn.execute(
          `UPDATE user_inventory ui
           JOIN shop_items s ON s.id = ui.item_id
           SET ui.is_equipped = 0
           WHERE ui.user_id = ? AND s.category = ?`,
          [userId, inv.category]
        );
        // Equip this one
        await conn.execute(
          'UPDATE user_inventory SET is_equipped = 1 WHERE id = ? AND user_id = ?',
          [invId, userId]
        );
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    const action = alreadyEquipped ? 'unequipped' : 'equipped';
    res.redirect(`/avatar?flash=${encodeURIComponent(inv.name)}+${action}.&flashType=success`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;