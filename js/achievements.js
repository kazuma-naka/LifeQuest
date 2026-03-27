// Phase3
document.addEventListener('DOMContentLoaded', function () {
  const achievementItems = document.querySelectorAll('.achievement-item');

  achievementItems.forEach(item => {
    item.addEventListener('click', function () {
      if (item.classList.contains('locked')) {
        alert('🔒 Locked — keep completing habits to unlock this badge!');
      } else if (item.classList.contains('in-progress')) {
        alert('⚡ In progress — you’re almost there! Keep tracking your habits!');
      } else if (item.classList.contains('unlocked')) {
        alert('✅ Unlocked! Great job on your consistent progress!');
      }
    });
  });
});
