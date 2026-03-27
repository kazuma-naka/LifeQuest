// Phase3
document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.habits-form form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const sleep = document.getElementById('sleep').value.trim();
    const water = document.getElementById('water').value.trim();
    const meals = document.getElementById('meals').value;

    let error = '';
    if (sleep === '' || sleep < 0 || sleep > 24) {
      error = 'Please enter valid sleep hours (0-24)';
    } else if (water === '' || water < 0 || water > 5000) {
      error = 'Please enter valid water (0-5000 ml)';
    } else if (meals === '') {
      error = 'Please select number of healthy meals';
    }

    if (error) {
      alert(error);
      return;
    }
    alert('✅ Habits logged successfully!');
    form.reset();
  });
});
