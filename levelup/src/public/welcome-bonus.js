/*
 * welcome-bonus.js
 * Shows a one-time welcome popup when a new user registers.
 * Reads the trigger from a data attribute 
 */

document.addEventListener('DOMContentLoaded', function () {
    const trigger = document.getElementById('welcome-bonus-trigger');
    if (!trigger || trigger.dataset.show !== 'true') return;
  
    // Build the overlay
    const overlay = document.createElement('div');
    overlay.className = 'wb-overlay';
    overlay.innerHTML = `
      <div class="wb-modal">
        <div class="wb-icon">🎉</div>
        <h2 class="wb-title">Welcome to LevelUp!</h2>
        <p class="wb-subtitle">Here's a gift to start your journey</p>
        <div class="wb-reward">
          <span class="wb-xp-badge">+500 XP</span>
          <p class="wb-reward-text">Use your XP in the shop to customise your character!</p>
        </div>
        <button class="wb-btn" id="wb-close">Start Your Journey ⚡</button>
      </div>
    `;
  
    document.body.appendChild(overlay);
  
    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('wb-visible');
    });
  
    // Close on button click or clicking outside modal
    function close() {
      overlay.classList.remove('wb-visible');
      overlay.classList.add('wb-hiding');
      setTimeout(() => overlay.remove(), 300);
    }
  
    document.getElementById('wb-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
  });