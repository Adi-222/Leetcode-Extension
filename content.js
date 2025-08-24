/**
 * LeetCode Focus Tool - Content Script (Definitive Version with Toast)
 */

// --- CONFIGURATION ---
const TARGET_SELECTORS = {
  solutionsTab: '#solutions_tab',
  editorialTab: '#editorial_tab',
  beakerButton: 'div[data-e2e-locator="solution-button"]'
};


// --- NEW: Function to create and show a toast message ---
/**
 * Injects a temporary, styled message onto the page.
 * @param {string} message The text to display in the toast.
 */
function showToast(message) {
  // Create the toast element
  const toast = document.createElement('div');
  toast.textContent = message;

  // Style the toast
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = '#2c3e50'; // Dark, modern background
  toast.style.color = 'white';
  toast.style.padding = '12px 25px';
  toast.style.borderRadius = '8px';
  toast.style.zIndex = '9999';
  toast.style.fontSize = '16px';
  toast.style.fontWeight = '500';
  toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.5s ease';

  // Add it to the page
  document.body.appendChild(toast);

  // Fade it in, then set a timer to fade it out and remove it
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 100); // Short delay to allow CSS transition to work

  setTimeout(() => {
    toast.style.opacity = '0';
    // Remove the element from the DOM after the fade-out transition completes
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000); // Keep the toast on screen for 3 seconds
}


// --- CORE LOGIC (Disabling/Enabling buttons) ---

function disableElement(element) {
  if (!element) return;
  const parentButton = element.closest('.flexlayout__tab_button, div[data-e2e-locator="solution-button"]');
  if (parentButton && !parentButton.dataset.focusLocked) {
    parentButton.style.pointerEvents = 'none';
    parentButton.style.opacity = '0.4';
    parentButton.style.cursor = 'not-allowed';
    parentButton.dataset.focusLocked = 'true';
  }
}

function enableElement(element) {
  if (!element) return;
  const parentButton = element.closest('.flexlayout__tab_button, div[data-e2e-locator="solution-button"]');
  if (parentButton && parentButton.dataset.focusLocked) {
    parentButton.style.pointerEvents = '';
    parentButton.style.opacity = '';
    parentButton.style.cursor = '';
    delete parentButton.dataset.focusLocked;
  }
}

function findAndDisableAll() {
  console.log("LeetCode Focus: Disabling buttons...");
  Object.values(TARGET_SELECTORS).forEach(selector => {
    waitForElement(selector, disableElement);
  });
}

function findAndEnableAll() {
  console.log("LeetCode Focus: Enabling buttons...");
  Object.values(TARGET_SELECTORS).forEach(selector => {
    const element = document.querySelector(selector);
    if (element) enableElement(element);
  });
}

function waitForElement(selector, callback) {
  let attempts = 0;
  const maxAttempts = 30;
  const interval = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(interval);
      callback(element);
    } else {
      attempts++;
      if (attempts > maxAttempts) clearInterval(interval);
    }
  }, 500);
}


// --- BROWSER EVENT LISTENERS ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "lock") {
    findAndDisableAll();
  } else if (request.action === "unlock") {
    findAndEnableAll();
  } else if (request.action === "showToast") {
    // --- NEW: Listen for the toast message request ---
    showToast(request.message);
  }
});

// Check if the lock should be active when the page first loads.
chrome.storage.local.get('lockUntil', (data) => {
  if (data.lockUntil && Date.now() < data.lockUntil) {
    window.addEventListener('load', findAndDisableAll);
  }
});