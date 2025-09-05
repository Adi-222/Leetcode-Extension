/**
 * LeetCode Focus Tool - Content Script (Definitive Version with Toast & Testcase Block)
 */

// --- CONFIGURATION ---
const TARGET_SELECTORS = {
  solutionsTab: '#solutions_tab',
  editorialTab: '#editorial_tab',
  beakerButton: 'div[data-e2e-locator="solution-button"]'
};

// --- NEW: Function to create and show a toast message ---
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;

  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = '#2c3e50';
  toast.style.color = 'white';
  toast.style.padding = '12px 25px';
  toast.style.borderRadius = '8px';
  toast.style.zIndex = '9999';
  toast.style.fontSize = '16px';
  toast.style.fontWeight = '500';
  toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.5s ease';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
  }, 100);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
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
  hideTestcaseSection();
}

function findAndEnableAll() {
  console.log("LeetCode Focus: Enabling buttons...");
  Object.values(TARGET_SELECTORS).forEach(selector => {
    const element = document.querySelector(selector);
    if (element) enableElement(element);
  });
  unhideTestcaseSection();
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

// --- HIDE / UNHIDE TESTCASE SECTION ---
function hideTestcaseSection() {
  const testcaseTabbar = document.querySelector('#testcase_tabbar_outer');
  if (!testcaseTabbar) return;

  const tabset = testcaseTabbar.closest('.flexlayout__tabset');
  if (!tabset || tabset.dataset.hidden) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'white';
  overlay.style.zIndex = '9999';
  overlay.style.pointerEvents = 'none';
  overlay.classList.add('testcase-overlay');

  tabset.style.position = 'relative'; // ensure overlay covers correctly
  tabset.appendChild(overlay);
  tabset.dataset.hidden = 'true';
}

function unhideTestcaseSection() {
  const overlay = document.querySelector('.testcase-overlay');
  if (overlay) {
    overlay.remove();
    const tabset = overlay.closest('.flexlayout__tabset');
    if (tabset) delete tabset.dataset.hidden;
  }
}


function unhideTestcaseSection() {
  const testcaseSection = document.querySelector('#3aa681c2-9c1d-bb86-1de9-f2e03dcbc7b6');
  if (testcaseSection && testcaseSection.dataset.hidden) {
    const overlay = testcaseSection.querySelector('.testcase-overlay');
    if (overlay) overlay.remove();
    delete testcaseSection.dataset.hidden;
  }
}

// --- BROWSER EVENT LISTENERS ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "lock") {
    findAndDisableAll();
  } else if (request.action === "unlock") {
    findAndEnableAll();
  } else if (request.action === "showToast") {
    showToast(request.message);
  }
});

// --- INIT ON PAGE LOAD ---
chrome.storage.local.get('lockUntil', (data) => {
  if (data.lockUntil && Date.now() < data.lockUntil) {
    window.addEventListener('load', findAndDisableAll);
  }
});
