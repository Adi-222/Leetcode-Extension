// Get references to all views and buttons
const startView = document.getElementById('start-view');
const timerView = document.getElementById('timer-view');
const aiView = document.getElementById('ai-view');

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const aiHelpBtn = document.getElementById('aiHelpBtn');
const backBtn = document.getElementById('backBtn');
const getHintBtn = document.getElementById('getHintBtn');

const timerDisplay = document.getElementById('timer-display');
const durationInput = document.getElementById('duration');
const userInput = document.getElementById('userInput');
const aiResponse = document.getElementById('aiResponse');

let countdownInterval;
const TWENTY_MINUTES_MS = 1 * 60 * 1000;

// --- View Switching Logic ---
function showView(view) {
  startView.style.display = 'none';
  timerView.style.display = 'none';
  aiView.style.display = 'none';
  view.style.display = 'flex';
}

// --- Timer Logic ---
function updateTimerView(lockUntil, startTime) {
  showView(timerView);
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const remainingTime = lockUntil - Date.now();
    const elapsedTime = Date.now() - startTime;

    // Enable/disable AI button based on elapsed time
    if (elapsedTime >= TWENTY_MINUTES_MS) {
      aiHelpBtn.disabled = false;
      aiHelpBtn.textContent = 'Get AI Help';
    } else {
      aiHelpBtn.disabled = true;
      const remainingMinutes = Math.ceil((TWENTY_MINUTES_MS - elapsedTime) / 60000);
      aiHelpBtn.textContent = `AI Help unlocks in ${remainingMinutes} min`;
    }

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      showView(startView);
    } else {
      timerDisplay.textContent = formatTime(remainingTime);
    }
  }, 1000);
}

function formatTime(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// --- Event Listeners ---
startBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "startTimer", duration: durationInput.value });
  window.close();
});

stopBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "stopTimer" });
  window.close();
});

aiHelpBtn.addEventListener('click', () => {
  showView(aiView);
});

backBtn.addEventListener('click', () => {
  // Go back to the timer view
  chrome.storage.local.get(['lockUntil', 'startTime'], (data) => {
    if (data.lockUntil && Date.now() < data.lockUntil) {
      updateTimerView(data.lockUntil, data.startTime);
    } else {
      showView(startView);
    }
  });
});

getHintBtn.addEventListener('click', () => {
  const text = userInput.value;
  if (!text.trim()) {
    aiResponse.textContent = "Please enter your code or approach first.";
    return;
  }

  aiResponse.textContent = "Thinking...";
  getHintBtn.disabled = true;

  chrome.runtime.sendMessage({ action: "getAiHint", userInput: text }, (response) => {
    if (response.error) {
      aiResponse.textContent = response.error;
    } else {
      aiResponse.textContent = response.hint;
    }
    getHintBtn.disabled = false;
  });
});

// --- Main logic on popup open ---
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['lockUntil', 'startTime'], (data) => {
    if (data.lockUntil && Date.now() < data.lockUntil) {
      updateTimerView(data.lockUntil, data.startTime);
    } else {
      showView(startView);
    }
  });
});