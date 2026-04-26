document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.item-preview-canvas').forEach(function (canvas) {
      const itemKey  = canvas.dataset.item;
      const category = canvas.dataset.category;
      if (!itemKey || !category) return;
      const equipped = {};
      equipped[category] = itemKey;
      drawAvatar(canvas, equipped, 2);
    });
  });