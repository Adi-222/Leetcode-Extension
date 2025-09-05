// --- Load API Key from config.js ---
importScripts('config.js'); // Make sure config.js has: const GEMINI_API_KEY = "your-real-key";
const API_KEY = GEMINI_API_KEY;

// --- Gemini API URL ---
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

console.log("Loaded API key:", API_KEY);

// Listener for when an alarm fires (timer ends naturally)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "unlockTimer") {
    unlockAndClear(false);
  }
});

// Listener for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    const duration = parseInt(request.duration, 10);
    if (isNaN(duration) || duration <= 0) return;

    const now = Date.now();
    const unlockTime = now + duration * 60 * 1000;
    
    // Store both the start time and unlock time
    chrome.storage.local.set({ lockUntil: unlockTime, startTime: now });
    chrome.alarms.create("unlockTimer", { delayInMinutes: duration });

    // Send lock message and toast message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "lock" });
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: "showToast", 
          message: "Choose Harder Right over Easier Wrongs" 
        });
      }
    });

  } else if (request.action === "stopTimer") {
    unlockAndClear(true);

  } else if (request.action === "getAiHint") {
    // --- Handle AI Hint Request ---
    getAiHint(request.userInput)
      .then(hint => sendResponse({ hint: hint }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // async response
  }
});


/**
 * Helper function to unlock tabs and clear timer data.
 */
function unlockAndClear(showNotification) {
  chrome.alarms.clear("unlockTimer");
  // Keep startTime in storage for the 20-min rule, but remove lockUntil
  chrome.storage.local.remove('lockUntil');
  
  chrome.tabs.query({ url: "https://leetcode.com/problems/*" }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: "unlock" });
    });
  });

  if (showNotification) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png', 
      title: 'Timer Stopped!',
      message: 'YEH Programmer Banega Reh'
    });
  }
}


/**
 * --- Function to call Gemini API ---
 * @param {string} prompt - The user's code or approach.
 * @returns {Promise<string>} The AI-generated hint.
 */
async function getAiHint(prompt) {
  try {
    console.log("Calling Gemini API at:", API_URL);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    console.log("Response status:", response.status);
    console.log("API Key being used:", API_KEY);
console.log("API URL:", API_URL);


    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error body:", errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini API raw response:", data);

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response text.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, there was an error contacting the AI coach.";
  }
}
