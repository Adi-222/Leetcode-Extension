// Get references to the HTML elements
const startView = document.getElementById('start-view');
const timerView = document.getElementById('timer-view');
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const durationInput = document.getElementById('duration');

let countdownInterval;

// Function to format time from milliseconds to MM:SS
function formatTime(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Function to update the countdown display
function updateTimerView(lockUntil) {
  startView.style.display = 'none';
  timerView.style.display = 'block';

  // Clear any existing interval to prevent duplicates
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const remainingTime = lockUntil - Date.now();
    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      showStartView(); // Switch back to the start view when timer ends
    } else {
      timerDisplay.textContent = formatTime(remainingTime);
    }
  }, 1000);
}

// Function to show the initial "start timer" screen
function showStartView() {
  timerView.style.display = 'none';
  startView.style.display = 'block';
  if (countdownInterval) clearInterval(countdownInterval);
}

// Add event listeners for the buttons
startBtn.addEventListener('click', () => {
  const duration = durationInput.value;
  chrome.runtime.sendMessage({ action: "startTimer", duration: duration });
  window.close();
});

stopBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "stopTimer" });
  window.close();
});

// Main logic: Check the state when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('lockUntil', (data) => {
    if (data.lockUntil && Date.now() < data.lockUntil) {
      // If a timer is active, show the countdown
      updateTimerView(data.lockUntil);
    } else {
      // Otherwise, show the start screen
      showStartView();
    }
  });
});