-- 003_welcome_bonus.sql
-- Adds bonus_xp column to store one-time welcome credits
ALTER TABLE users ADD COLUMN bonus_xp INT NOT NULL DEFAULT 0;