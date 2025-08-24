// --- PASTE YOUR GEMINI API KEY HERE ---
importScripts('config.js'); // This loads the config.js file
const API_KEY = GEMINI_API_KEY; // Use the key from the config file

// The rest of the file stays the same
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

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
      if(tabs[0]) {
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
    // --- NEW: Handle AI Hint Request ---
    getAiHint(request.userInput)
      .then(hint => sendResponse({ hint: hint }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indicates that the response will be sent asynchronously
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
 * --- NEW: Function to call Gemini API ---
 * @param {string} userInput - The user's code or approach.
 * @returns {Promise<string>} The AI-generated hint.
 */
async function getAiHint(userInput) {
  // This is the "system prompt" that instructs the AI on how to behave.
  const systemPrompt = `You are a world-class programming coach for someone practicing on LeetCode. Your goal is to guide the user to the solution, not to give it away. Analyze the user's code or approach.
  DO:
  - Identify logical flaws or bugs.
  - Ask Socratic questions to guide their thinking. (e.g., "What happens in your code if the input array is empty?")
  - Suggest a high-level approach or a different data structure to consider.
  - Point out inefficiencies (e.g., "This is an O(n^2) approach. Can you think of a way to do it in O(n)?").
  - Provide feedback on coding style and readability.
  
  DO NOT:
  - Provide the complete, corrected code solution.
  - Write more than a few lines of example code.
  - Give away the core trick of the problem.

  Only if the user's input explicitly includes the phrase "give final solution", you may then provide the complete, corrected code.
  
  Here is the user's input:`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userInput}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    // Extract the text from the Gemini response
    const hint = data.candidates[0].content.parts[0].text;
    return hint.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, there was an error contacting the AI coach. Please check your API key and network connection.";
  }
}