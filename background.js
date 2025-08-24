// Listener for when an alarm fires (timer ends naturally)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "unlockTimer") {
    console.log("Timer finished. Unlocking tabs.");
    unlockAndClear(false); // Timer ended naturally, so don't show the message
  }
});

// Listener for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    const duration = parseInt(request.duration, 10);
    if (isNaN(duration) || duration <= 0) return;

    console.log(`Starting timer for ${duration} minutes.`);
    const unlockTime = Date.now() + duration * 60 * 1000;
    
    chrome.storage.local.set({ lockUntil: unlockTime });
    chrome.alarms.create("unlockTimer", { delayInMinutes: duration });

    // Send lock message and the new toast message to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if(tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "lock" });
        // --- NEW: Send message to show the starting toast ---
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: "showToast", 
          message: "Choose Harder Right Over Easier Wrongs" 
        });
      }
    });
  } else if (request.action === "stopTimer") {
    console.log("Timer stopped by user.");
    unlockAndClear(true); // User stopped it manually, so show the notification
  }
});

/**
 * Helper function to unlock tabs and clear timer data.
 * @param {boolean} showNotification - Whether to show the custom notification.
 */
function unlockAndClear(showNotification) {
  // Clear the alarm and stored data
  chrome.alarms.clear("unlockTimer");
  chrome.storage.local.remove('lockUntil');
  
  // Find all LeetCode problem tabs and send them the unlock message
  chrome.tabs.query({ url: "https://leetcode.com/problems/*" }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: "unlock" });
    });
  });

  // Create the notification if requested
  if (showNotification) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png', 
      title: 'Timer Stopped!',
      // --- UPDATED: The new message for stopping the timer ---
      message: 'YEH Programmer Banega Reh'
    });
  }
}