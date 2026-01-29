// Quiz Game Logic

// Seven colors for the game
const colors = {
  red: '#FF0000',
  blue: '#0000FF',
  green: '#008000',
  yellow: '#FFD700',
  purple: '#800080',
  orange: '#FF8C00',
  pink: '#FF69B4'
};

const colorNames = Object.keys(colors);

// Dark colors (good for text on light background)
const darkColors = ['red', 'blue', 'green', 'purple', 'orange'];

// Light colors (good for background with dark text)
const lightColors = ['yellow', 'pink'];

// Additional light backgrounds
const lightBackgrounds = {
  lightblue: '#ADD8E6',
  lightgreen: '#90EE90',
  lightyellow: '#FFFFE0',
  lightpink: '#FFB6C1',
  lightorange: '#FFE4B5'
};

// Game state
let currentRound = 0;
let score = 0;
let correctAnswer = '';
let gameActive = false;

// DOM elements
const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const resultScreen = document.getElementById('result-screen');
const statsSection = document.getElementById('stats-section');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const currentRoundDisplay = document.getElementById('current-round');
const currentScoreDisplay = document.getElementById('current-score');
const colorCard = document.getElementById('color-card');
const colorText = document.getElementById('color-text');
const optionsContainer = document.getElementById('options');

const finalScoreDisplay = document.getElementById('final-score');
const accuracyDisplay = document.getElementById('accuracy');
const encouragementMessage = document.getElementById('encouragement-message');

const displayScore = document.getElementById('display-score');
const displayAccuracy = document.getElementById('display-accuracy');
const feedbackMessage = document.getElementById('feedback-message');

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// Start game
function startGame() {
  currentRound = 0;
  score = 0;
  gameActive = true;
  
  startScreen.classList.add('hidden');
  playScreen.classList.remove('hidden');
  resultScreen.classList.add('hidden');
  
  nextRound();
}

// Restart game
function restartGame() {
  startGame();
}

// Generate next round
function nextRound() {
  if (currentRound >= 20) {
    endGame();
    return;
  }
  
  currentRound++;
  currentRoundDisplay.textContent = currentRound;
  currentScoreDisplay.textContent = score;
  
  // Determine difficulty based on round
  let backgroundColor, textColor, textWord;
  
  if (currentRound <= 2) {
    // Rounds 1-2: White background, dark text color matches word
    backgroundColor = '#FFFFFF';
    textWord = getRandomColor();
    textColor = colors[textWord];
  } else if (currentRound <= 7) {
    // Rounds 3-7: Light background, dark text color matches word
    textWord = getRandomColor();
    textColor = colors[textWord];
    
    // Use light background colors
    const lightBgKeys = Object.keys(lightBackgrounds);
    const randomBgKey = lightBgKeys[Math.floor(Math.random() * lightBgKeys.length)];
    backgroundColor = lightBackgrounds[randomBgKey];
    
  } else {
    // Rounds 8-20: Light background, any dark text color, any word
    textWord = getRandomColor();
    
    // Get a dark color for text (easier to read)
    const darkColorName = darkColors[Math.floor(Math.random() * darkColors.length)];
    textColor = colors[darkColorName];
    
    // Get light background
    const lightBgKeys = Object.keys(lightBackgrounds);
    const randomBgKey = lightBgKeys[Math.floor(Math.random() * lightBgKeys.length)];
    backgroundColor = lightBackgrounds[randomBgKey];
  }
  
  // Set correct answer (what the TEXT says)
  correctAnswer = textWord;
  
  // Update display
  colorCard.style.backgroundColor = backgroundColor;
  colorText.style.color = textColor;
  colorText.textContent = textWord.toUpperCase();
  
  // Generate options
  generateOptions();
}

// Get random color name
function getRandomColor() {
  return colorNames[Math.floor(Math.random() * colorNames.length)];
}

// Generate three options including the correct answer
function generateOptions() {
  optionsContainer.innerHTML = '';
  
  // Create options array with correct answer
  const options = [correctAnswer];
  
  // Add two more random options (different from correct answer)
  while (options.length < 3) {
    const randomColor = getRandomColor();
    if (!options.includes(randomColor)) {
      options.push(randomColor);
    }
  }
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  
  // Create buttons
  options.forEach(colorName => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.textContent = colorName.toUpperCase();
    button.addEventListener('click', () => selectOption(colorName, button));
    optionsContainer.appendChild(button);
  });
}

// Handle option selection
function selectOption(selectedColor, button) {
  if (!gameActive) return;
  
  // Disable all buttons
  const allButtons = document.querySelectorAll('.option-btn');
  allButtons.forEach(btn => btn.disabled = true);
  
  // Check if correct
  if (selectedColor === correctAnswer) {
    score++;
    button.classList.add('correct');
    currentScoreDisplay.textContent = score;
  } else {
    button.classList.add('wrong');
    // Highlight correct answer
    allButtons.forEach(btn => {
      if (btn.textContent.toLowerCase() === correctAnswer) {
        btn.classList.add('correct');
      }
    });
  }
  
  // Wait 1 second before next round
  setTimeout(() => {
    nextRound();
  }, 1000);
}

function endGame() {
  gameActive = false;
  
  playScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  
  // Calculate accuracy
  const accuracy = Math.round((score / 20) * 100);
  
  // Update result displays
  finalScoreDisplay.textContent = score;
  accuracyDisplay.textContent = accuracy;
  
  // Generate encouragement message
  const message = getEncouragementMessage(accuracy);
  encouragementMessage.textContent = message;
  
  // Show stats section
  statsSection.classList.remove('hidden');
  displayScore.textContent = score;
  displayAccuracy.textContent = accuracy + '%';
  
  // Generate feedback
  const feedback = getFeedbackMessage(accuracy);
  feedbackMessage.textContent = feedback;
}


function getEncouragementMessage(accuracy) {
  if (accuracy === 100) {
    return 'Perfect Score! You have incredible focus and attention to detail!';
  } else if (accuracy >= 90) {
    return 'Outstanding! Your cognitive flexibility is impressive!';
  } else if (accuracy >= 80) {
    return 'Great job! You showed excellent concentration!';
  } else if (accuracy >= 70) {
    return 'Well done! You\'re getting better at managing distractions!';
  } else if (accuracy >= 60) {
    return 'Good effort! Keep practicing to improve your focus!';
  } else if (accuracy >= 50) {
    return 'Nice try! This game is tricky, but you\'re learning!';
  } else {
    return 'Every attempt makes you stronger! Try again and you\'ll improve!';
  }
}

// Get detailed feedback message
function getFeedbackMessage(accuracy) {
  if (accuracy >= 90) {
    return 'Your ability to ignore visual distractions and focus on the task is exceptional. This skill is valuable in many real-world situations!';
  } else if (accuracy >= 75) {
    return 'You demonstrated strong cognitive control. With a bit more practice, you\'ll master this challenge completely!';
  } else if (accuracy >= 60) {
    return 'You\'re making progress! The Stroop Effect shows how our brain processes information. Keep training your focus!';
  } else {
    return 'This game tests a challenging aspect of cognition. Don\'t worry - most people find it difficult at first. Practice will help you improve significantly!';
  }
}