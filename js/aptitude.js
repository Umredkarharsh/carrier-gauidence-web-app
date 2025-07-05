import {
  auth,
  db,
  doc,
  setDoc,
  onAuthStateChanged
} from './firebase.js';

// Sample Questions
const questions = [
  {
    question: "What comes next in the series: 2, 4, 8, 16, ...?",
    options: ["18", "20", "32", "24"],
    answer: "32"
  },
  {
    question: "If ALL PENS are BOOKS and some BOOKS are TABLES, which is true?",
    options: [
      "All TABLES are PENS",
      "Some PENS are TABLES",
      "Some TABLES are BOOKS",
      "No PEN is a TABLE"
    ],
    answer: "Some TABLES are BOOKS"
  },
  {
    question: "Solve: 15 ÷ (3 + 2) = ?",
    options: ["5", "3", "15", "10"],
    answer: "3"
  },
  {
    question: "If a square has side 5cm, what is its area?",
    options: ["10cm²", "25cm²", "20cm²", "5cm²"],
    answer: "25cm²"
  },
  {
    question: "Choose the word that doesn't belong:",
    options: ["Carrot", "Beetroot", "Potato", "Apple"],
    answer: "Apple"
  },
  {
    question: "Which number is odd?",
    options: ["10", "20", "17", "4"],
    answer: "17"
  },
  {
    question: "Which is heavier?",
    options: ["1 kg iron", "1 kg cotton", "Equal", "Depends on volume"],
    answer: "Equal"
  },
  {
    question: "Which organ pumps blood?",
    options: ["Lungs", "Brain", "Liver", "Heart"],
    answer: "Heart"
  },
  {
    question: "What is the capital of Maharashtra?",
    options: ["Bhopal", "Nagpur", "Mumbai", "Pune"],
    answer: "Mumbai"
  },
  {
    question: "5 squared equals?",
    options: ["10", "25", "30", "5"],
    answer: "25"
  }
];

// DOM Elements
const questionsContainer = document.getElementById('questionsContainer');
const form = document.getElementById('aptitudeForm');
const progressText = document.getElementById('progress');
const timerEl = document.getElementById('timer');

// Render Questions
function renderQuestions() {
  questions.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question';
    div.innerHTML = `
      <h4>Q${index + 1}. ${q.question}</h4>
      ${q.options.map(option => `
        <label>
          <input type="radio" name="q${index}" value="${option}">
          ${option}
        </label>
      `).join('')}
    `;
    questionsContainer.appendChild(div);
  });
  progressText.textContent = `Total Questions: ${questions.length}`;
}

// Timer Functionality
let timeLeft = 20 * 60; // 20 minutes in seconds
let timerInterval;

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitTest();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Visual warning when time is running low
  if (timeLeft <= 300) { // 5 minutes left
    timerEl.style.color = '#e74c3c';
  }
}

// Test Submission
async function submitTest() {
  clearInterval(timerInterval);
  
  // Calculate score
  let score = 0;
  questions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    if (selected && selected.value === q.answer) {
      score++;
    }
  });

  // Save results if user is authenticated
  const user = auth.currentUser;
  if (user) {
    try {
      await setDoc(doc(db, "aptitude_results", user.uid), {
        score,
        total: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        timestamp: new Date()
      });
      window.location.href = `test-results.html?score=${score}`;
    } catch (err) {
      console.error("Error saving result:", err);
      alert("Error saving your results. Please try again.");
    }
  } else {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
  }
}

// Event Listeners
form.addEventListener('submit', (e) => {
  e.preventDefault();
  submitTest();
});

// Initialize Test
function initTest() {
  renderQuestions();
  startTimer();
}

// Check auth state before starting test
onAuthStateChanged(auth, (user) => {
  if (user) {
    initTest();
  } else {
    window.location.href = "login.html";
  }
});