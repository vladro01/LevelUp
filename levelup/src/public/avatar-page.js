document.addEventListener('DOMContentLoaded', function () {
    const mainCanvas = document.getElementById('main-avatar');
    if (mainCanvas) {
      try {
        const equipped = JSON.parse(
          mainCanvas.dataset.equipped.replace(/&quot;/g, '"')
        );
        drawAvatar(mainCanvas, equipped, 6);
      } catch (e) {
        console.error('Avatar render error:', e);
      }
    }
  
    document.querySelectorAll('.inv-canvas').forEach(function (canvas) {
      const itemKey  = canvas.dataset.item;
      const category = canvas.dataset.category;
      if (!itemKey || !category) return;
      const preview = {};
      preview[category] = itemKey;
      drawAvatar(canvas, preview, 2);
    });
  });