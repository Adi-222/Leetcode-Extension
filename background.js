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

    // Send lock message and toast message to all LeetCode tabs
    chrome.tabs.query({ url: "https://leetcode.com/problems/*" }, function(tabs) {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: "lock" });
        chrome.tabs.sendMessage(tab.id, { 
          action: "showToast", 
          message: "Choose Harder Right over Easier Wrongs" 
        });
      });
    });

    // Add dynamic declarativeNetRequest rules to block Solutions and Editorial
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1, 2],
      addRules: [
        {
          id: 1,
          priority: 1,
          action: { type: "redirect", redirect: { extensionPath: "/blocked.html" } },
          condition: { urlFilter: "leetcode.com/problems/*/solutions", resourceTypes: ["main_frame"] }
        },
        {
          id: 2,
          priority: 1,
          action: { type: "redirect", redirect: { extensionPath: "/blocked.html" } },
          condition: { urlFilter: "leetcode.com/problems/*/editorial", resourceTypes: ["main_frame"] }
        }
      ]
    });

  } else if (request.action === "stopTimer") {
    unlockAndClear(true);

  } else if (request.action === "getAiHint") {
    // --- Handle AI Hint Request ---
    getAiHint(request.userInput)
      .then(hint => sendResponse({ hint: hint }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // async response
  } else if (request.action === "getSuggestions") {
    // --- Handle Practice Suggestions Request ---
    getPracticeSuggestions(request.username)
      .then(suggestions => sendResponse({ suggestions: suggestions }))
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
  
  // Remove dynamic blocking rules
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2]
  });
  
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

/**
 * --- Function to get practice suggestions from LeetCode + Gemini ---
 * @param {string} username - The LeetCode username.
 * @returns {Promise<string>} The AI-generated suggestions.
 */
async function getPracticeSuggestions(username) {
  try {
    // 1. Fetch recent AC submissions from LeetCode GraphQL
    const query = `
      query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          title
        }
      }
    `;
    
    const leetcodeRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        variables: { username: username, limit: 15 }
      })
    });
    
    if (!leetcodeRes.ok) {
      throw new Error(`LeetCode API request failed with status ${leetcodeRes.status}`);
    }
    
    const leetcodeData = await leetcodeRes.json();
    const submissions = leetcodeData.data?.recentAcSubmissionList;
    
    if (!submissions || submissions.length === 0) {
      return "No recently solved questions found for this user, or the profile is private.";
    }
    
    const solvedTitles = submissions.map(sub => sub.title).join(', ');
    
    // 2. Call Gemini API for suggestions
    const prompt = `The user "${username}" has recently solved these LeetCode questions: ${solvedTitles}. Based on these, suggest 3 questions they should practice to solidify these concepts, and 2 questions they should revise. Give a brief reason for each. Please format your response nicely for a small extension window.`;
    
    return await getAiHint(prompt);
    
  } catch (error) {
    console.error("Error getting practice suggestions:", error);
    throw new Error(error.message || "Failed to get suggestions.");
  }
}
