(function () {

    const SKIN_PALETTES = {
      default:   { body: '#f5c5a3', shadow: '#d4956a', outline: '#8b5e3c' },
      skin_tan:  { body: '#c68642', shadow: '#a0612a', outline: '#6b3a18' },
      skin_dark: { body: '#8d5524', shadow: '#6b3a18', outline: '#3d1c08' },
      skin_pale: { body: '#fde8d8', shadow: '#e8c4a8', outline: '#c49a78' },
    };
  
    function p(ctx, x, y, w, h, colour, s) {
      ctx.fillStyle = colour;
      ctx.fillRect(x * s, y * s, w * s, h * s);
    }
  
    function drawBase(ctx, skinKey, s) {
      const sk = SKIN_PALETTES[skinKey] || SKIN_PALETTES.default;
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
        p(ctx, 15, 15,  2,  1, '#ffffff', s);
      }
    }
  
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
        p(ctx, 12,  3,  1,  1, '#fde68a', s);
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
      }
    }
  
    function drawAccessoryBehind(ctx, key, s) {
      if (key !== 'accessory_cape') return;
      p(ctx,  8, 13,  2, 15, '#7c3aed', s);
      p(ctx, 22, 13,  2, 15, '#7c3aed', s);
      p(ctx,  8, 27, 16,  2, '#6d28d9', s);
      p(ctx, 10, 13, 12, 14, '#8b5cf6', s);
      p(ctx, 10, 14,  1, 13, '#a78bfa', s);
    }
  
    function drawAccessoryFront(ctx, key, s) {
      if (!key || key === 'accessory_cape') return;
      if (key === 'accessory_shield') {
        p(ctx,  3, 13,  5,  9, '#92400e', s);
        p(ctx,  3, 13,  1,  9, '#b45309', s);
        p(ctx,  3, 13,  5,  1, '#b45309', s);
        p(ctx,  4, 16,  4,  1, '#d97706', s);
        p(ctx,  5, 14,  2,  6, '#d97706', s);
        p(ctx,  5, 16,  2,  2, '#fbbf24', s);
      } else if (key === 'accessory_staff') {
        p(ctx, 25,  4,  2, 24, '#78350f', s);
        p(ctx, 27,  4,  1, 20, '#92400e', s);
        p(ctx, 23,  0,  6,  6, '#4c1d95', s);
        p(ctx, 24,  0,  4,  5, '#7c3aed', s);
        p(ctx, 24,  0,  2,  2, '#a78bfa', s);
        p(ctx, 25,  0,  1,  1, '#ddd6fe', s);
        p(ctx, 22,  3,  1,  1, '#e879f9', s);
        p(ctx, 29,  2,  1,  1, '#38bdf8', s);
      }
    }
  
    window.drawAvatar = function (canvas, equipped, scale) {
      scale = Math.round(scale) || 4;
      equipped = equipped || {};
      canvas.width  = 32 * scale;
      canvas.height = 32 * scale;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAccessoryBehind(ctx, equipped.accessory, scale);
      drawBase(ctx,            equipped.skin,      scale);
      drawOutfit(ctx,          equipped.outfit,    scale);
      drawHat(ctx,             equipped.hat,       scale);
      drawAccessoryFront(ctx,  equipped.accessory, scale);
    };
  
    // ── Auto-init: runs after the script tag loads ──────────────────────────────
    // No inline scripts needed — reads equipped data from data attributes
    document.addEventListener('DOMContentLoaded', function () {
  
      // Main avatar (avatar page)
      const mainCanvas = document.getElementById('main-avatar');
      if (mainCanvas) {
        try {
          const equipped = JSON.parse(mainCanvas.dataset.equipped || '{}');
          drawAvatar(mainCanvas, equipped, 6);
        } catch (e) { console.error('Avatar render error:', e); }
      }
  
      // Inventory previews (avatar page)
      document.querySelectorAll('.inv-canvas').forEach(function (canvas) {
        const itemKey = canvas.dataset.item;
        if (!itemKey) return;
        const cat = itemKey.split('_')[0];
        const preview = {};
        preview[cat] = itemKey;
        drawAvatar(canvas, preview, 2);
      });
  
      // Shop item previews (shop page)
      document.querySelectorAll('.item-preview-canvas').forEach(function (canvas) {
        const itemKey = canvas.dataset.item;
        if (!itemKey) return;
        const cat = itemKey.split('_')[0];
        const preview = {};
        preview[cat] = itemKey;
        drawAvatar(canvas, preview, 2);
      });
  
    });
  
  })();