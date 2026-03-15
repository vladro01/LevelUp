-- 002_shop.sql
-- Run this after 001_init.sql

-- Track XP spent in the shop (so spendable XP = earned - spent)
ALTER TABLE users ADD COLUMN xp_spent INT NOT NULL DEFAULT 0;

-- Master list of shop items (seeded below)
CREATE TABLE IF NOT EXISTS shop_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL,
  description VARCHAR(200) NOT NULL DEFAULT '',
  category    ENUM('skin','hat','outfit','accessory') NOT NULL,
  cost_xp     INT          NOT NULL,
  item_key    VARCHAR(50)  NOT NULL UNIQUE  -- used by canvas renderer
);

-- What each user owns + what they have equipped
CREATE TABLE IF NOT EXISTS user_inventory (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  item_id     INT NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_equipped  TINYINT(1) NOT NULL DEFAULT 0,

  UNIQUE KEY uniq_user_item (user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES shop_items(id) ON DELETE CASCADE
);

-- ─── Seed shop items ──────────────────────────────────────────────────────────
INSERT INTO shop_items (name, description, category, cost_xp, item_key) VALUES

-- Skin tones (cheapest — encourages first purchase)
('Tan Skin',   'Warm tan skin tone.',       'skin', 20, 'skin_tan'),
('Dark Skin',  'Rich dark skin tone.',       'skin', 20, 'skin_dark'),
('Pale Skin',  'Cool pale skin tone.',       'skin', 20, 'skin_pale'),

-- Hats
('Wizard Hat', 'A tall pointy hat for the scholarly adventurer.', 'hat', 30, 'hat_wizard'),
('Knight Helm','A sturdy iron helmet.',                           'hat', 50, 'hat_knight'),
('Crown',      'Fit for royalty. Rare and expensive.',            'hat',100, 'hat_crown'),

-- Outfits
('Blue Robe',  'A flowing robe for mages.',     'outfit',  40, 'outfit_robe'),
('Red Armour', 'Plate armour for warriors.',    'outfit',  60, 'outfit_armour'),
('Gold Cloak', 'A legendary golden cloak.',     'outfit', 120, 'outfit_cloak'),

-- Accessories
('Shield',       'A trusty wooden shield.',     'accessory', 35, 'accessory_shield'),
('Magic Staff',  'Crackles with arcane energy.','accessory', 45, 'accessory_staff'),
('Cape',         'A dramatic flowing cape.',    'accessory', 80, 'accessory_cape');