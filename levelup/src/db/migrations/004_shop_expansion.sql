-- 004_shop_expansion.sql
-- Expands shop with new slots and items to make it feel like a real shop with a more diverse selection

-- Adding weapon and offhand as new categories
-- Modified the ENUM to include these new values
ALTER TABLE shop_items
  MODIFY COLUMN category ENUM('skin','hat','outfit','accessory','weapon','offhand') NOT NULL;

-- Move shield from accessory to offhand
UPDATE shop_items SET category = 'offhand', item_key = 'offhand_shield'
  WHERE item_key = 'accessory_shield';

-- Move staff from accessory to weapon category
UPDATE shop_items SET category = 'weapon', item_key = 'weapon_staff'
  WHERE item_key = 'accessory_staff';

-- Insert all new items to expand the selection
INSERT INTO shop_items (name, description, category, cost_xp, item_key) VALUES

-- ─── New Hats ----------------------------
('Straw Hat',         'The iconic straw hat of a legendary pirate captain.',     'hat', 150, 'hat_straw'),
('Ninja Headband',    'Engraved with a village symbol. Follow your ninja way.',  'hat', 120, 'hat_ninja'),
('Soul Reaper Cap',   'A dark cap worn by Soul Society officers.',                'hat', 120, 'hat_reaper'),
('Pirate Captain Hat','A tricorn hat for those who sail the seas.',               'hat',  80, 'hat_pirate'),
('Viking Helmet',     'Horned iron helmet of a feared northern warrior.',         'hat',  90, 'hat_viking'),

-- --- New Outfits ---------------------------------
('Crew Vest',         'A weathered vest worn by a legendary pirate crew.',        'outfit', 150, 'outfit_crewvest'),
('Flak Jacket',       'Standard-issue jacket worn by elite ninja.',               'outfit', 130, 'outfit_flak'),
('Shihakusho',        'Black robes of a Soul Reaper. Flows in battle.',           'outfit', 140, 'outfit_shihakusho'),
('Pirate Coat',       'A long red captain coat that commands respect.',            'outfit', 100, 'outfit_piratecoat'),

-- --- Weapons (right hand) -----------------------------------
('Iron Sword',        'A reliable one-handed sword. Simple but effective.',       'weapon',  40, 'weapon_sword'),
('Battle Axe',        'Heavy axe favoured by warriors who mean business.',        'weapon',  80, 'weapon_axe'),
('Magic Wand',        'Channels arcane energy. Good for beginners.',              'weapon',  60, 'weapon_wand'),
('Wado Ichimonji',    'A legendary white katana. One of three swords of a master.', 'weapon', 150, 'weapon_wado'),
('Kunai',             'Standard throwing blade. Quick and precise.',              'weapon', 100, 'weapon_kunai'),
('Zanpakuto',         'A Soul Reaper blade bonded to its wielder.',               'weapon', 140, 'weapon_zanpakuto'),

-- --- Offhand (left hand) -----------------------------------------
('Tower Shield',      'A massive shield offering maximum protection.',            'offhand',  70, 'offhand_tower'),
('Jolly Roger Shield','A shield bearing the mark of a legendary pirate crew.',   'offhand', 130, 'offhand_jolly'),
('Chakra Scroll',     'A ninja scroll sealed with chakra techniques.',            'offhand', 100, 'offhand_scroll'),
('Soul Society Badge','An official badge from the Soul Society.',                 'offhand', 110, 'offhand_badge'),
('Enchanted Orb',     'A floating orb of magical energy. Lights the way.',       'offhand',  75, 'offhand_orb'),

-- ---New Accessory (back/cape slot) ----------------------------
('Dragon Wings',      'Legendary wings rumoured to be from an ancient dragon.',   'accessory', 120, 'accessory_wings');