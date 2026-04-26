// src/routes/authRoutes.js

const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiters');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// --- Register -------------------------

router.get('/register', (req, res) => {
  res.render('register', { errors: [], values: {} });
});

router.post(
  '/register',
  registerLimiter,
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3–50 characters.'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const values = { username: req.body.username, email: req.body.email };

      if (!errors.isEmpty()) {
        return res.status(400).render('register', { errors: errors.array(), values });
      }

      const { username, email, password } = req.body;
      const password_hash = await bcrypt.hash(password, 12);

      const [result] = await pool.execute(
        // Give every new user 500 bonus XP right after signing up
        'INSERT INTO users (username, email, password_hash, bonus_xp) VALUES (?,?,?,?)',
        [username, email, password_hash, 500]
      );

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.userId = result.insertId;
        req.session.username = username;
        // Flag tells the dashboard to show the welcome popup once
        res.redirect('/?welcome=1');
      });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(400).render('register', {
          errors: [{ msg: 'Username or email already in use.' }],
          values: { username: req.body.username, email: req.body.email }
        });
      }
      next(err);
    }
  }
);

// --- Login -------------------------

router.get('/login', (req, res) => {
  res.render('login', { error: null, values: {} });
});

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const [rows] = await pool.execute(
      'SELECT id, username, password_hash FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];

    const ok = user ? await bcrypt.compare(password, user.password_hash) : false;

    // Audit log - does not leak whether the email exists
    await pool.execute(
      'INSERT INTO login_audit (user_id, email_attempted, success, ip_address) VALUES (?,?,?,?)',
      [user ? user.id : null, email || '(empty)', ok ? 1 : 0, req.ip]
    );

    if (!ok) {
      return res.status(401).render('login', {
        error: 'Invalid email or password.',
        values: { email }
      });
    }

    // Regenerate session ID on login to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect('/');
    });
  } catch (err) {
    next(err);
  }
});

// --- Logout -------------------------

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('levelup.sid');
    res.redirect('/auth/login');
  });
});

// --- Security Page -------------------------
 
router.get('/security', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;
 
    // Last 10 login attempts for this user
    const [loginHistory] = await pool.execute(
      `SELECT email_attempted, success, ip_address, created_at
       FROM login_audit
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );
 
    // Previous successful login (index 1 = the one before the current session)
    const [successLogins] = await pool.execute(
      `SELECT ip_address, created_at
       FROM login_audit
       WHERE user_id = ? AND success = 1
       ORDER BY created_at DESC
       LIMIT 2`,
      [userId]
    );
 
    // Failed attempts in last 24 hours
    const [failedRecent] = await pool.execute(
      `SELECT COUNT(*) AS count
       FROM login_audit
       WHERE user_id = ? AND success = 0
         AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      [userId]
    );
 
    // Account info
    const [userInfo] = await pool.execute(
      'SELECT username, email, created_at FROM users WHERE id = ?',
      [userId]
    );
 
    res.render('security', {
      loginHistory,
      lastLogin: successLogins[1] || successLogins[0] || null,
      failedLast24h: Number(failedRecent[0].count),
      user: userInfo[0],
      flash: req.query.flash || null,
      flashType: req.query.flashType || 'info'
    });
  } catch (err) {
    next(err);
  }
});
 
// --- Account Deletion -------------------------
 
router.post('/delete-account', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const password = String(req.body.password || '');
 
    // Require password confirmation - never delete without verifying identity
    const [rows] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );
 
    if (!rows.length) return res.status(404).send('User not found');
 
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) {
      return res.redirect('/auth/security?flash=Incorrect+password.+Account+not+deleted.&flashType=danger');
    }
 
    // Delete user - CASCADE in schema handles all related data:
    // quests, quest_logs, user_inventory, login_audit all deleted automatically
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
 
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('levelup.sid');
      res.redirect('/auth/register');
    });
  } catch (err) {
    next(err);
  }
});
 
module.exports = router;