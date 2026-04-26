/*
 * avatar-renderer.js
 * This js file draws a layered pixel-art character onto a <canvas>.
 *
 * Slots: skin, hat, outfit, accessory (for back), weapon (right arm ), offhand (left arm)
 * Feature: weapon + offhand can both be equipped at the same time.
 *
 * drawAvatar(canvas, equipped, scale)
 *   canvas   - HTMLCanvasElement
 *   equipped - { skin, hat, outfit, accessory, weapon, offhand }
 *   scale    - pixels per logical unit (canvas = 32*scale square)
 */

(function () {

  // --- Skin palettes --------------------------------------
  const SKIN = {
    default:   { body: '#f5c5a3', shadow: '#d4956a', outline: '#8b5e3c' },
    skin_tan:  { body: '#c68642', shadow: '#a0612a', outline: '#6b3a18' },
    skin_dark: { body: '#8d5524', shadow: '#6b3a18', outline: '#3d1c08' },
    skin_pale: { body: '#fde8d8', shadow: '#e8c4a8', outline: '#c49a78' },
  };

  // --- Draw helper ----------------------------------------------
  function p(ctx, x, y, w, h, colour, s) {
    ctx.fillStyle = colour;
    ctx.fillRect(x * s, y * s, w * s, h * s);
  }

  // --- Base character ----------------------------------------
  function drawBase(ctx, skinKey, s) {
    const sk = SKIN[skinKey] || SKIN.default;
    p(ctx, 11, 26,  4, 2, '#3d2b1f', s);
    p(ctx, 17, 26,  4, 2, '#3d2b1f', s);
    p(ctx, 11, 22,  4, 4, sk.shadow, s);
    p(ctx, 17, 22,  4, 4, sk.shadow, s);
    p(ctx, 10, 14, 12,  8, sk.body, s);
    p(ctx,  7, 14,  3,  7, sk.body, s);
    p(ctx, 22, 14,  3,  7, sk.body, s);
    p(ctx,  7, 21,  3,  2, sk.shadow, s);
    p(ctx, 22, 21,  3,  2, sk.shadow, s);
    p(ctx, 14, 11,  4,  3, sk.body, s);
    p(ctx, 10,  4, 12,  9, sk.body, s);
    p(ctx,  9,  6,  1,  3, sk.shadow, s);
    p(ctx, 22,  6,  1,  3, sk.shadow, s);
    p(ctx, 13,  7,  2,  2, '#1a1a2e', s);
    p(ctx, 17,  7,  2,  2, '#1a1a2e', s);
    p(ctx, 13,  7,  1,  1, '#ffffff', s);
    p(ctx, 17,  7,  1,  1, '#ffffff', s);
    p(ctx, 13,  6,  2,  1, sk.outline, s);
    p(ctx, 17,  6,  2,  1, sk.outline, s);
    p(ctx, 15, 10,  2,  1, sk.shadow, s);
    p(ctx, 13, 12,  2,  1, sk.outline, s);
    p(ctx, 17, 12,  2,  1, sk.outline, s);
    p(ctx, 10,  3, 12,  1, sk.outline, s);
    p(ctx, 10, 13, 12,  1, sk.outline, s);
    p(ctx,  9,  4,  1,  9, sk.outline, s);
    p(ctx, 22,  4,  1,  9, sk.outline, s);
  }

  // --- Outfits ------------------------------------------------------
  function drawOutfit(ctx, key, s) {
    if (!key) return;
    if (key === 'outfit_robe') {
      p(ctx, 10, 14, 12,  8, '#3b82f6', s);
      p(ctx,  7, 14,  3,  7, '#2563eb', s);
      p(ctx, 22, 14,  3,  7, '#2563eb', s);
      p(ctx,  9, 22, 14,  6, '#1d4ed8', s);
      p(ctx, 10, 22, 12,  1, '#93c5fd', s);
      p(ctx, 15, 15,  2,  6, '#93c5fd', s);
      p(ctx, 10, 20, 12,  1, '#1e3a8a', s);
    } else if (key === 'outfit_armour') {
      p(ctx, 10, 14, 12,  8, '#dc2626', s);
      p(ctx,  7, 14,  3,  7, '#b91c1c', s);
      p(ctx, 22, 14,  3,  7, '#b91c1c', s);
      p(ctx, 11, 22,  4,  6, '#991b1b', s);
      p(ctx, 17, 22,  4,  6, '#991b1b', s);
      p(ctx, 13, 15,  6,  4, '#ef4444', s);
      p(ctx, 13, 15,  1,  4, '#fca5a5', s);
      p(ctx,  7, 13,  4,  3, '#dc2626', s);
      p(ctx, 21, 13,  4,  3, '#dc2626', s);
      p(ctx,  7, 13,  1,  3, '#fca5a5', s);
      p(ctx, 24, 13,  1,  3, '#fca5a5', s);
    } else if (key === 'outfit_cloak') {
      p(ctx, 10, 14, 12,  8, '#d97706', s);
      p(ctx,  7, 13,  3, 10, '#92400e', s);
      p(ctx, 22, 13,  3, 10, '#92400e', s);
      p(ctx, 10, 22, 12,  6, '#78350f', s);
      p(ctx, 10, 14,  1,  8, '#fbbf24', s);
      p(ctx, 21, 14,  1,  8, '#fbbf24', s);
      p(ctx, 10, 22, 12,  1, '#fbbf24', s);
      p(ctx, 15, 15,  2,  2, '#fef3c7', s);
    } else if (key === 'outfit_crewvest') {
      p(ctx, 10, 14, 12,  8, '#1e40af', s);
      p(ctx,  7, 14,  3,  7, '#1d4ed8', s);
      p(ctx, 22, 14,  3,  7, '#1d4ed8', s);
      p(ctx, 11, 22,  4,  6, '#1e3a8a', s);
      p(ctx, 17, 22,  4,  6, '#1e3a8a', s);
      p(ctx, 13, 14,  6,  8, '#ffffff', s); 
      p(ctx, 14, 15,  4,  5, '#e0f2fe', s);
      p(ctx, 15, 19,  2,  2, '#fbbf24', s); // belt buckle
      p(ctx, 10, 20, 12,  1, '#78350f', s); // belt
    } else if (key === 'outfit_flak') {
      p(ctx, 10, 14, 12,  8, '#4d7c0f', s);
      p(ctx,  7, 14,  3,  7, '#3f6212', s);
      p(ctx, 22, 14,  3,  7, '#3f6212', s);
      p(ctx, 11, 22,  4,  6, '#365314', s);
      p(ctx, 17, 22,  4,  6, '#365314', s);
      p(ctx, 12, 14,  8,  2, '#65a30d', s); // collar
      p(ctx, 13, 16,  3,  4, '#3f6212', s); // pocket L
      p(ctx, 16, 16,  3,  4, '#3f6212', s); // pocket R
      p(ctx, 13, 16,  3,  1, '#84cc16', s); // pocket top L
      p(ctx, 16, 16,  3,  1, '#84cc16', s); // pocket top R
    } else if (key === 'outfit_shihakusho') {
      p(ctx, 10, 14, 12,  8, '#1c1917', s);
      p(ctx,  7, 14,  3,  7, '#0c0a09', s);
      p(ctx, 22, 14,  3,  7, '#0c0a09', s);
      p(ctx,  9, 22, 14,  6, '#1c1917', s);
      p(ctx, 10, 14,  1,  8, '#44403c', s); // left edge highlight
      p(ctx, 21, 14,  1,  8, '#44403c', s);
      p(ctx, 14, 14,  4,  8, '#292524', s); // centre fold
      p(ctx, 10, 20, 12,  2, '#57534e', s);
      p(ctx, 14, 20,  4,  2, '#dc2626', s); // red sash detail
    } else if (key === 'outfit_piratecoat') {
      p(ctx, 10, 14, 12,  8, '#7f1d1d', s);
      p(ctx,  6, 13,  4, 12, '#991b1b', s); // left flap
      p(ctx, 22, 13,  4, 12, '#991b1b', s); // right flap
      p(ctx,  9, 22, 14,  6, '#7f1d1d', s);
      p(ctx, 10, 14,  1,  8, '#fca5a5', s); // left trim
      p(ctx, 21, 14,  1,  8, '#fca5a5', s);
      p(ctx, 10, 22, 12,  1, '#fca5a5', s); // hem trim
      p(ctx, 14, 14,  4,  6, '#fef2f2', s); // white shirt underneath
      p(ctx, 15, 19,  2,  2, '#d97706', s); // gold button
    }
  }

  // --- Hats --------------------------------------
  function drawHat(ctx, key, s) {
    if (!key) return;
    if (key === 'hat_wizard') {
      p(ctx, 15,  0,  2,  2, '#7c3aed', s);
      p(ctx, 13,  1,  6,  2, '#6d28d9', s);
      p(ctx, 11,  2,  9,  2, '#5b21b6', s);
      p(ctx,  9,  3, 14,  2, '#4c1d95', s);
      p(ctx,  9,  3,  1,  2, '#7c3aed', s);
      p(ctx, 15,  1,  2,  1, '#fef08a', s);
      p(ctx, 14,  2,  1,  1, '#fef08a', s);
      p(ctx, 16,  2,  1,  1, '#fef08a', s);
    } else if (key === 'hat_knight') {
      p(ctx,  9,  1, 14,  3, '#6b7280', s);
      p(ctx,  8,  3, 16,  4, '#6b7280', s);
      p(ctx,  8,  6, 16,  2, '#4b5563', s);
      p(ctx,  9,  1,  2,  3, '#9ca3af', s);
      p(ctx,  9,  1, 14,  1, '#9ca3af', s);
      p(ctx, 11,  7,  3,  1, '#1f2937', s);
      p(ctx, 18,  7,  3,  1, '#1f2937', s);
      p(ctx,  8,  4,  2,  5, '#6b7280', s);
      p(ctx, 22,  4,  2,  5, '#6b7280', s);
    } else if (key === 'hat_crown') {
      p(ctx, 10,  5, 12,  3, '#d97706', s);
      p(ctx, 11,  2,  2,  4, '#f59e0b', s);
      p(ctx, 15,  1,  2,  5, '#f59e0b', s);
      p(ctx, 19,  2,  2,  4, '#f59e0b', s);
      p(ctx, 10,  5, 12,  1, '#fbbf24', s);
      p(ctx, 15,  6,  2,  2, '#ef4444', s);
      p(ctx, 11,  6,  2,  2, '#3b82f6', s);
      p(ctx, 19,  6,  2,  2, '#22c55e', s);
      p(ctx, 15,  6,  1,  1, '#fecaca', s);
      p(ctx, 11,  6,  1,  1, '#bfdbfe', s);
      p(ctx, 19,  6,  1,  1, '#bbf7d0', s);
    } else if (key === 'hat_straw') {
      p(ctx,  7,  5, 18,  2, '#d97706', s); 
      p(ctx,  7,  5, 18,  1, '#fbbf24', s);
      p(ctx, 11,  2, 10,  4, '#b45309', s); // dome
      p(ctx, 11,  2, 10,  1, '#d97706', s); // dome top
      p(ctx, 12,  3,  8,  1, '#fbbf24', s); // dome highlight
      p(ctx, 10,  6, 12,  1, '#92400e', s); // shadow under brim
      p(ctx, 11,  5, 10,  1, '#dc2626', s);
    } else if (key === 'hat_ninja') {
      p(ctx,  9,  5, 14,  3, '#6b7280', s); // metal plate
      p(ctx,  9,  5, 14,  1, '#9ca3af', s); // plate shine
      p(ctx, 14,  6,  4,  1, '#d1d5db', s); // leaf symbol
      p(ctx, 15,  5,  2,  3, '#9ca3af', s); // symbol detail
      p(ctx,  8,  5,  2,  3, '#1c1917', s); // cloth left
      p(ctx, 22,  5,  2,  3, '#1c1917', s); // cloth right
      p(ctx,  8,  7,  2,  1, '#44403c', s); // knot L
      p(ctx, 22,  7,  2,  1, '#44403c', s); // knot R
    } else if (key === 'hat_reaper') {
      p(ctx, 10,  3, 12,  5, '#1c1917', s); // cap body
      p(ctx,  9,  7, 14,  1, '#0c0a09', s); // brim
      p(ctx, 10,  3, 12,  1, '#44403c', s); // top highlight
      p(ctx, 10,  3,  2,  5, '#292524', s); // left panel
    } else if (key === 'hat_pirate') {
      p(ctx, 10,  2, 12,  6, '#1c1917', s); // hat body
      p(ctx,  8,  6, 16,  2, '#0c0a09', s); // brim
      p(ctx, 10,  2, 12,  1, '#44403c', s); // top edge
      p(ctx,  8,  6, 16,  1, '#44403c', s); // brim top
      p(ctx, 14,  3,  4,  1, '#fbbf24', s); // gold trim centre
      p(ctx, 14,  4,  4,  1, '#d97706', s);
      // skull
      p(ctx, 15,  4,  2,  2, '#f5f5f4', s);
      p(ctx, 15,  5,  1,  1, '#1c1917', s);
      p(ctx, 16,  5,  1,  1, '#1c1917', s);
    } else if (key === 'hat_viking') {
      p(ctx, 10,  3, 12,  5, '#6b7280', s); // helm
      p(ctx,  9,  6, 14,  2, '#4b5563', s); // cheek guards
      p(ctx, 10,  3, 12,  1, '#9ca3af', s); // shine
      // Horns
      p(ctx,  8,  1,  3,  4, '#f5f5f4', s); // left horn
      p(ctx,  9,  0,  1,  2, '#e7e5e4', s);
      p(ctx, 21,  1,  3,  4, '#f5f5f4', s); // right horn
      p(ctx, 21,  0,  1,  2, '#e7e5e4', s);
      p(ctx, 11,  7,  3,  1, '#1f2937', s); // visor slit L
      p(ctx, 18,  7,  3,  1, '#1f2937', s); // visor slit R
    }
  }

  // --- Accessory behind (back/cape) --------------------------------------
  function drawAccessoryBehind(ctx, key, s) {
    if (key === 'accessory_cape') {
      p(ctx,  8, 13,  2, 15, '#7c3aed', s);
      p(ctx, 22, 13,  2, 15, '#7c3aed', s);
      p(ctx,  8, 27, 16,  2, '#6d28d9', s);
      p(ctx, 10, 13, 12, 14, '#8b5cf6', s);
      p(ctx, 10, 14,  1, 13, '#a78bfa', s);
    } else if (key === 'accessory_wings') {
      // Dragon wings
      p(ctx,  2, 10,  8, 12, '#7f1d1d', s); // left wing
      p(ctx,  2, 10,  2, 12, '#dc2626', s); // left wing edge
      p(ctx,  3, 10,  6,  1, '#ef4444', s); // top edge L
      p(ctx, 22, 10,  8, 12, '#7f1d1d', s); // right wing
      p(ctx, 28, 10,  2, 12, '#dc2626', s); // right wing edge
      p(ctx, 23, 10,  6,  1, '#ef4444', s); // top edge R
      p(ctx,  4, 13,  4,  6, '#991b1b', s); // membrane L
      p(ctx, 24, 13,  4,  6, '#991b1b', s); // membrane R
    }
  }

  // --- Offhand (left hand) --------------------------------------
  function drawOffhand(ctx, key, s) {
    if (!key) return;
    if (key === 'offhand_shield' || key === 'accessory_shield') {
      p(ctx,  2, 13,  6,  9, '#92400e', s);
      p(ctx,  2, 13,  1,  9, '#b45309', s);
      p(ctx,  2, 13,  6,  1, '#b45309', s);
      p(ctx,  3, 16,  4,  1, '#d97706', s);
      p(ctx,  4, 14,  2,  6, '#d97706', s);
      p(ctx,  4, 16,  2,  2, '#fbbf24', s);
    } else if (key === 'offhand_tower') {
      p(ctx,  2, 11,  6, 13, '#6b7280', s);
      p(ctx,  2, 11,  1, 13, '#9ca3af', s);
      p(ctx,  2, 11,  6,  1, '#9ca3af', s);
      p(ctx,  2, 23,  6,  1, '#4b5563', s);
      // Cross design
      p(ctx,  4, 12,  2, 11, '#4b5563', s);
      p(ctx,  3, 17,  4,  2, '#4b5563', s);
      p(ctx,  4, 17,  2,  2, '#d97706', s); 
    } else if (key === 'offhand_jolly') {
      p(ctx,  2, 12,  6, 10, '#1c1917', s);
      p(ctx,  2, 12,  1, 10, '#44403c', s);
      p(ctx,  2, 12,  6,  1, '#44403c', s);
      // Skull on shield
      p(ctx,  3, 14,  4,  3, '#f5f5f4', s);
      p(ctx,  3, 15,  1,  1, '#1c1917', s); // left eye
      p(ctx,  5, 15,  1,  1, '#1c1917', s); // right eye
      // Crossbones
      p(ctx,  2, 18,  6,  1, '#f5f5f4', s);
      p(ctx,  2, 17,  1,  3, '#f5f5f4', s);
      p(ctx,  7, 17,  1,  3, '#f5f5f4', s);
    } else if (key === 'offhand_scroll') {
      p(ctx,  3, 12,  4, 12, '#fef3c7', s);
      p(ctx,  3, 12,  4,  1, '#d97706', s); // top cap
      p(ctx,  3, 23,  4,  1, '#d97706', s); // bottom cap
      p(ctx,  3, 12,  1, 12, '#fde68a', s); // left edge
      // Chakra symbol
      p(ctx,  4, 15,  2,  2, '#3b82f6', s);
      p(ctx,  4, 18,  2,  2, '#ef4444', s);
      p(ctx,  4, 21,  2,  1, '#22c55e', s);
    } else if (key === 'offhand_badge') {
      p(ctx,  3, 14,  5,  7, '#6b7280', s);
      p(ctx,  3, 14,  5,  1, '#9ca3af', s);
      p(ctx,  3, 14,  1,  7, '#9ca3af', s);
      // Number on badge
      p(ctx,  4, 16,  3,  4, '#d1d5db', s);
      p(ctx,  5, 16,  1,  4, '#1f2937', s);
      p(ctx,  4, 18,  3,  1, '#1f2937', s);
    } else if (key === 'offhand_orb') {
      // Enchanted floating orb
      p(ctx,  2, 14,  6,  6, '#312e81', s); // glow bg
      p(ctx,  3, 14,  4,  5, '#4f46e5', s); // orb body
      p(ctx,  3, 14,  2,  2, '#818cf8', s); // shine
      p(ctx,  3, 14,  1,  1, '#c7d2fe', s); // bright spot
      // Sparkles
      p(ctx,  2, 13,  1,  1, '#e879f9', s);
      p(ctx,  8, 15,  1,  1, '#38bdf8', s);
      p(ctx,  2, 20,  1,  1, '#fbbf24', s);
    }
  }

  // --- Weapon (right hand) --------------------------------------
  function drawWeapon(ctx, key, s) {
    if (!key) return;
    if (key === 'weapon_staff' || key === 'accessory_staff') {
      // Magic staff
      p(ctx, 25,  4,  2, 24, '#78350f', s);
      p(ctx, 27,  4,  1, 20, '#92400e', s);
      p(ctx, 23,  0,  6,  6, '#4c1d95', s);
      p(ctx, 24,  0,  4,  5, '#7c3aed', s);
      p(ctx, 24,  0,  2,  2, '#a78bfa', s);
      p(ctx, 25,  0,  1,  1, '#ddd6fe', s);
      p(ctx, 22,  3,  1,  1, '#e879f9', s);
      p(ctx, 29,  2,  1,  1, '#38bdf8', s);
    } else if (key === 'weapon_sword') {
      // Iron sword
      p(ctx, 25,  5,  2, 20, '#9ca3af', s); // blade
      p(ctx, 25,  5,  1, 18, '#d1d5db', s); // blade shine
      p(ctx, 25,  3,  2,  2, '#e5e7eb', s); // tip
      p(ctx, 23, 22,  6,  2, '#6b7280', s); // crossguard
      p(ctx, 25, 24,  2,  4, '#78350f', s); // handle
      p(ctx, 25, 28,  2,  1, '#d97706', s); // pommel
    } else if (key === 'weapon_axe') {
      // Battle axe
      p(ctx, 26,  8,  2, 18, '#78350f', s); // handle
      p(ctx, 22,  5,  6,  8, '#6b7280', s); // axe head
      p(ctx, 22,  5,  2,  8, '#9ca3af', s); // blade edge
      p(ctx, 22,  5,  6,  1, '#9ca3af', s); // top
      p(ctx, 22, 12,  6,  1, '#4b5563', s); // bottom
      p(ctx, 26, 26,  2,  2, '#92400e', s); // base
    } else if (key === 'weapon_wand') {
      // Magic wand 
      p(ctx, 26,  6,  1, 22, '#78350f', s); // wand stick
      // Star tip
      p(ctx, 25,  3,  3,  1, '#fbbf24', s);
      p(ctx, 26,  2,  1,  3, '#fbbf24', s);
      p(ctx, 25,  4,  1,  1, '#fef08a', s);
      p(ctx, 27,  4,  1,  1, '#fef08a', s);
    } else if (key === 'weapon_wado') {
      // Katana
      p(ctx, 26,  2,  1, 22, '#f5f5f4', s); // white blade
      p(ctx, 25,  2,  1, 20, '#e7e5e4', s); // blade back
      p(ctx, 26,  2,  1,  1, '#d1d5db', s); // tip
      p(ctx, 24, 22,  4,  1, '#d97706', s); // gold tsuba
      p(ctx, 25, 23,  2,  5, '#1c1917', s); // black handle
      p(ctx, 25, 23,  1,  5, '#292524', s); // handle wrap
      p(ctx, 25, 28,  2,  1, '#d97706', s); 
    } else if (key === 'weapon_kunai') {
      // Kunai 
      p(ctx, 26,  5,  2, 14, '#6b7280', s); // blade
      p(ctx, 26,  3,  2,  2, '#9ca3af', s); // tip
      p(ctx, 25,  3,  1,  2, '#d1d5db', s); // shine
      p(ctx, 25, 18,  4,  1, '#4b5563', s); // collar
      p(ctx, 26, 19,  2,  5, '#1c1917', s); // handle
      // Ring at bottom
      p(ctx, 24, 24,  5,  1, '#6b7280', s);
      p(ctx, 24, 24,  1,  3, '#6b7280', s);
      p(ctx, 28, 24,  1,  3, '#6b7280', s);
      p(ctx, 24, 26,  5,  1, '#6b7280', s);
    } else if (key === 'weapon_zanpakuto') {
      // Another sword
      p(ctx, 25,  3,  2, 21, '#9ca3af', s); // blade
      p(ctx, 25,  3,  1, 19, '#d1d5db', s); // shine
      p(ctx, 25,  2,  2,  1, '#e5e7eb', s); // tip
      p(ctx, 23, 23,  6,  2, '#4b5563', s); // tsuba (guard)
      p(ctx, 24, 23,  1,  2, '#6b7280', s); // tsuba detail
      p(ctx, 25, 25,  2,  5, '#292524', s); // handle
      p(ctx, 25, 25,  1,  4, '#1c1917', s); // handle wrap
      p(ctx, 26, 26,  1,  1, '#d97706', s); // handle detail
      p(ctx, 26, 28,  1,  1, '#d97706', s);
      p(ctx, 25, 30,  2,  1, '#6b7280', s); // pommel
    }
  }

  // --- Public API --------------------------------------
  window.drawAvatar = function (canvas, equipped, scale) {
    scale = Math.round(scale) || 4;
    equipped = equipped || {};

    // Resize canvas buffer to match scale
    canvas.width  = 32 * scale;
    canvas.height = 32 * scale;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Layer order: back accessories => base => outfit => hat => offhand => weapon
    drawAccessoryBehind(ctx, equipped.accessory, scale);
    drawBase(ctx,            equipped.skin,      scale);
    drawOutfit(ctx,          equipped.outfit,    scale);
    drawHat(ctx,             equipped.hat,       scale);
    drawOffhand(ctx,         equipped.offhand,   scale);
    drawWeapon(ctx,          equipped.weapon,    scale);
  };

})();