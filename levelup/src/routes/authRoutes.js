// src/routes/authRoutes.js

const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// ─── Register ────────────────────────────────────────────────────────────────

router.get('/register', (req, res) => {
  res.render('register', { errors: [], values: {} });
});

router.post(
  '/register',
  registerLimiter,
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3–50 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.'),
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
        'INSERT INTO users (username, email, password_hash) VALUES (?,?,?)',
        [username, email, password_hash]
      );

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.userId = result.insertId;
        req.session.username = username;
        res.redirect('/');
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

// ─── Login ────────────────────────────────────────────────────────────────────

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

    // Audit log — does not leak whether the email exists
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

    // FIX: Regenerate session ID on login to prevent session fixation attacks
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

// ─── Logout ───────────────────────────────────────────────────────────────────

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('levelup.sid');
    res.redirect('/auth/login');
  });
});

module.exports = router;