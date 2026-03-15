const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const MySQLStoreFactory = require('express-mysql-session');
const csurf = require('@dr.pogodin/csurf');

const { nodeEnv, sessionSecret, db } = require('./config/env');

const app = express();

if (nodeEnv === 'production') app.set('trust proxy', 1);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.database
});

app.use(session({
  name: 'levelup.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: nodeEnv === 'production',
    maxAge: 1000 * 60 * 60 * 6
  }
}));

app.use(csurf());

app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.username = req.session.username || null;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/',       require('./routes/dashboardRoutes'));
app.use('/auth',   require('./routes/authRoutes'));
app.use('/quests', require('./routes/questRoutes'));
app.use('/shop',   require('./routes/shopRoutes').router);
app.use('/avatar', require('./routes/avatarRoutes'));

// ─── Error handlers ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') return res.status(403).send('Invalid CSRF token');
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error');
});

module.exports = app;