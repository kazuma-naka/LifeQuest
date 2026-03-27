
// ── DOM References ──────────────────────────────────────────────
const form         = document.getElementById('journal-form');
const moodSelect   = document.getElementById('mood');
const reflection   = document.getElementById('reflection');
const learnedInput = document.getElementById('learned');
const charCounter  = document.getElementById('char-counter');
const formMsg      = document.getElementById('form-message');
const entryList    = document.getElementById('entry-list');

// ── 1. Character counter (keyup event) ─────────────────────────
// Issue #47: event handling — keyup
reflection.addEventListener('keyup', function () {
  const len = reflection.value.length;
  charCounter.textContent = len + ' / 500';
  charCounter.style.color = len > 450 ? '#ef4444' : 'var(--muted)';
});

// ── 2. Submit button hover effect (mouseover / mouseout) ────────
// Issue #47: event handling — mouseover/mouseout
const submitBtn = document.querySelector('#journal-form button[type="submit"]');
submitBtn.addEventListener('mouseover', function () {
  this.style.transform = 'translateY(-2px)';
});
submitBtn.addEventListener('mouseout', function () {
  this.style.transform = '';
});

// ── 3. Form validation & submission ────────────────────────────
// Issue #46: form validation + DOM manipulation
form.addEventListener('submit', function (e) {
  e.preventDefault(); // prevent default browser submit (optional requirement)

  // Clear previous errors
  clearError(moodSelect);
  clearError(reflection);

  let valid = true;

  // Validate: mood required
  if (!moodSelect.value) {
    showError(moodSelect, 'Please select your mood.');
    valid = false;
  }

  // Validate: reflection required, min 10 chars
  const text = reflection.value.trim();
  if (!text) {
    showError(reflection, 'Please write something in your reflection.');
    valid = false;
  } else if (text.length < 10) {
    showError(reflection, 'Please write at least 10 characters.');
    valid = false;
  }

  if (!valid) {
    showMessage('Please fix the errors above.', 'error');
    return;
  }

  // ── Save entry to page (DOM manipulation) ──────────────────
  // Issue #46: dynamic entry preview — createElement + appendChild
  const item = document.createElement('div');
  item.className = 'entry-item';
  item.innerHTML =
    '<strong>' + moodSelect.value + '</strong> — ' +
    '<span>' + escapeHTML(text) + '</span>' +
    (learnedInput.value.trim()
      ? '<p><em>💡 ' + escapeHTML(learnedInput.value.trim()) + '</em></p>'
      : '');

  // Issue #49: setTimeout — fade in new entry
  item.style.opacity = '0';
  entryList.appendChild(item);
  setTimeout(function () {
    item.style.transition = 'opacity 0.4s';
    item.style.opacity = '1';
  }, 10);

  showMessage('Entry saved! ✨', 'success');
  form.reset();
  charCounter.textContent = '0 / 500';
});

// ── Helper: show inline field error ────────────────────────────
function showError(field, msg) {
  field.classList.add('field-error');
  const span = document.createElement('span');
  span.className = 'error-msg';
  span.textContent = msg;
  field.insertAdjacentElement('afterend', span);
}

function clearError(field) {
  field.classList.remove('field-error');
  const existing = field.parentElement.querySelector('.error-msg');
  if (existing) existing.remove();
}

// ── Helper: form-level message, auto-hide after 4s ─────────────
// Issue #49: setTimeout
function showMessage(text, type) {
  formMsg.textContent = text;
  formMsg.className = 'form-message ' + type;
  formMsg.hidden = false;
  setTimeout(function () { formMsg.hidden = true; }, 4000);
}

// ── Helper: sanitize user text before inserting into DOM ───────
function escapeHTML(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}