# ⚡ LevelUp

> A gamified, privacy-first habit tracking web app - Final Year Project, By Vlad Rotari - 33830924, Goldsmiths University of London. Live link for app: https://levelup-production-e32e.up.railway.app 

LevelUp turns your daily habits into RPG-style quests. Complete these quests to earn XP or experience, build streaks, level up your character, and spend your earned XP in a shop to customise your pixel-art avatar. This app was built with security and privacy as core design constraints, as I noticed not that many apps in 2026 are heavily security focused.

---

## 📸 Screenshots

> Dashboard, Quest Management, Shop, Avatar Customisation, Security Page, Login/Sign Up features can be seen in the /screenshots folder

---

## ✨ Core Features

- **Quest system** - You can create, edit, pause, and delete daily habits with Easy / Medium / Hard difficulty for your quests.
- **XP & levelling** - Earn 10 / 20 / 30 XP per quest, leveling up every 100 XP
- **Streak tracking** - Consecutive daily completion tracking with a grace period allocated
- **Shop** - 30+ items across 6 categories: skin tones, hats, outfits, weapons on the right hand , offhand as the left hand, and accessories
- **Pixel-art avatar** - Canvas-rendered character
- **Welcome bonus** - 500 XP gifted on registration with an animated popup
- **Progress logs** - 28-day bar chart along with a full completion history table
- **Security dashboard** - Includes the last login IP, failed attempt tracking, and full login audit log
- **Account deletion** - Full data wipe with password confirmation

---

## 🏗️ Architecture

```
Browser => Nginx (reverse proxy) => Node.js/Express => MySQL
```

**Stack:**
- **Runtime:** Node.js 20 + Express 5
- **Templating:** EJS 
- **Database:** MySQL 8
- **Sessions:** express-session + MySQL session store
- **Security:** Helmet.js, CSRF protection, bcrypt, express-rate-limit
- **Containerisation:** Docker + Docker Compose

**Project structure:**
```
src/
  config/         env.js - validates all required environment variables
  db/
    migrations/   001_init.sql to 004_shop_expansion.sql
    pool.js       mysql2 connection pool
  middleware/     requireAuth.js, rateLimiters.js
  routes/         authRoutes, dashboardRoutes, questRoutes, shopRoutes, avatarRoutes
  services/       progressService.js - XP, level, streak logic
  views/          EJS templates
  public/         CSS, avatar-renderer.js, JS modules
  app.js          Express setup
  server.js       HTTP server entry point
```

---

## 🚀 Running Locally (Docker - Recommended)

This is the easiest way to run LevelUp. Docker handles Node.js, MySQL, and all migrations automatically.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

**1. Clone the repository**
```bash
git clone "https://github.com/vladro01/LevelUp.git"
cd levelup
```

**2. Create your own .env file from the example file ".env.example"**

Open `.env` and fill in:
```
NODE_ENV=development
PORT=8000
SESSION_SECRET=replace-with-a-long-random-string
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=any-password-you-choose
DB_NAME=levelup
```

> To generate a secure SESSION_SECRET, run:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" `

**3. Start the application**
```bash
docker compose up --build
```

Docker will automatically:
- Pull MySQL 8
- Build the Node.js app image
- Run all 4 database migrations
- Start the app on port 8000

**4. Open in browser**
```
http://localhost:8000
```

**5. Register an account** 

### Docker commands reference
```bash
docker compose up           # Start (after the first build)
docker compose up --build   # Starts and rebuilds if any changes
docker compose down         # Stop
```

---

## 🔧 Running Locally (Manual - without Docker)

### Prerequisites
- Node.js 20+
- MySQL 5.7 or 8.x running locally

### Steps

**1. Clone and install**
```bash
git clone "https://github.com/vladro01/LevelUp.git"
cd levelup
npm install
```

**2. Create database and run migrations**
```bash
mysql -u root -p
```
```sql
CREATE DATABASE levelup;
EXIT;
```
```bash
mysql -u root -p levelup < src/db/migrations/001_init.sql

mysql -u root -p levelup < src/db/migrations/002_shop.sql

mysql -u root -p levelup < src/db/migrations/003_welcome_bonus.sql

mysql -u root -p levelup < src/db/migrations/004_shop_expansion.sql
```

**3. Configure environment**
```bash
copy .env.example and fill out the .env
```

Edit `.env`:
```
NODE_ENV=development
PORT=8000
SESSION_SECRET=your-long-random-secret
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=levelup
```

**4. Start the development server**
```bash
npm run dev
```

Visit `http://localhost:8000`

---

## 🧪 Running Tests

```bash
npm test
```

Tests cover all core app logic in `progressService.js`:
- `xpForDifficulty` - XP values for each difficulty
- `levelFromXp` - level calculation from total XP
- `xpToNextLevel` - progress to the next level
- `streakFromDays` - streak logic including grace period and gap detection

**Expected output:** 21 tests passing with 100% coverage across all files.

---

## 🔐 Security Features

LevelUp was built with security as a baseline design constraint:

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt (cost factor 12) |
| Session fixation prevention | `req.session.regenerate()` on login + register |
| CSRF protection | `@dr.pogodin/csurf` on all state-changing routes |
| Rate limiting | 10 login attempts / 15 min · 5 registrations / hour per IP |
| SQL injection prevention | Parameterised queries only, no string concatenation |
| XSS mitigation | Helmet.js headers + EJS output escaping |
| Ownership checks | Every quest/log/inventory mutation verifies `user_id` server-side |
| Audit logging | All login attempts (success/failure) logged with IP and timestamp |
| Least privilege | App DB user, not root in production |
| Secure cookies | `HttpOnly`, `SameSite`, `Secure` (in production) |
| CSP compliance | All JS in external files, no inline scripts |

---

## ⚙️ Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Port to run on | `8000` |
| `SESSION_SECRET` | Secret for session signing | Long random string |
| `DB_HOST` | MySQL host | `127.0.0.1` or `db` (Docker) |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | your password |
| `DB_NAME` | Database name | `levelup` |

---

## 📊 Database Schema

```
users          - id, username, email, password_hash, bonus_xp, xp_spent, created_at
login_audit    - id, user_id, email_attempted, success, ip_address, created_at
quests         - id, user_id, title, difficulty, is_active, created_at
quest_logs     - id, user_id, quest_id, performed_on, status, notes, created_at
sessions       - session_id, expires, data
shop_items     - id, name, description, category, cost_xp, item_key
user_inventory - id, user_id, item_id, purchased_at, is_equipped
```

---

## 🎮 Test Credentials

After running the app fresh, register any account, and  you will receive 500 XP, which will allow you to purchase items in the shop right away.

**Suggested test flow:**
1. Register at `/auth/register`
2. Create a quest at `/quests`
3. Complete the quest from the dashboard
4. Visit `/shop` and purchase an item with your XP
5. Visit `/avatar` and equip it
6. Check `/auth/security` to see your login history

---

## ⚠️ Known Limitations

- **No email verification** - accounts are created without email confirmation
- **No password reset** - users cannot recover a forgotten password
- **No push notifications** - reminder system (FR7) not implemented in MVP
- **No weather integration** - optional weather API (FR8) not implemented


---

## 🗂️ Dependencies

**Production:**
```
express, ejs, mysql2, express-session, express-mysql-session,
bcrypt, helmet, @dr.pogodin/csurf, express-rate-limit,
express-validator, dotenv
```

**Development:**
```
nodemon, jest, supertest
```
