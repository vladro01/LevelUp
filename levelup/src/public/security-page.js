/*
 * security-page.js
 * This handles the delete account confirmation toggle.
 * It's an external file so therefore no inline scripts making it CSP compliant.
 */
document.addEventListener('DOMContentLoaded', function () {
    const deleteBtn    = document.getElementById('delete-account-btn');
    const confirmBox   = document.getElementById('delete-confirm');
    const cancelBtn    = document.getElementById('cancel-delete');
  
    if (!deleteBtn || !confirmBox) return;
  
    deleteBtn.addEventListener('click', function () {
      confirmBox.style.display = 'block';
      deleteBtn.style.display  = 'none';
      confirmBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  
    cancelBtn.addEventListener('click', function () {
      confirmBox.style.display = 'none';
      deleteBtn.style.display  = 'inline-block';
    });
  });