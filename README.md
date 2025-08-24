

# LeetCode Focus - A Chrome Extension for Distraction-Free Problem Solving


An essential tool for anyone looking to build true problem-solving discipline on LeetCode. This extension helps you resist the temptation to peek at the solutions or editorial too early, creating a focused environment where you can truly grapple with challenges.

<br>

![Extension Screenshot](https://via.placeholder.com/700x400.png?text=Replace+this+with+a+screenshot+of+your+extension+in+action!)
*A preview of the Focus Mode timer and the disabled solution buttons on LeetCode.*

## The Problem It Solves

Every LeetCode user knows the struggle: you're stuck on a problem, and the "Solutions" and "Editorial" tabs are just one click away. While helpful, looking at the solution too soon robs you of a crucial learning opportunity. This extension acts as a self-imposed barrier, enforcing the focus you need to grow as a problem solver.

## ✨ Core Features

*   **🚫 Focus Mode:** Disables the "Solutions" tab, the "Editorial" tab, and the official "Solution" beaker icon, making them completely unclickable.
*   **⏱️ Customizable Timer:** Use the clean popup UI to set a lock duration. The buttons will remain disabled until the timer expires.
*   **Visual Countdown:** When a timer is active, the popup displays a clear, large countdown, showing you exactly how much focus time is left.
*   **Manual Override:** You can stop the timer at any point from the popup if you need to access the solutions.
*   ** motivational Messages:**
    *   When you start a timer, a toast message appears on the page: **"Choose Harder Right over Easier Wrongs"**.
    *   If you end the timer manually, a system notification appears: **"YEH Programmer Banega Reh"**.

## 🚀 Installation

Since this extension is not yet on the Chrome Web Store, you can install it manually in developer mode.

1.  **Download the Code:** Clone or download this repository as a ZIP file and unzip it to a permanent folder on your computer.
2.  **Open Chrome Extensions:** Open Google Chrome and navigate to `chrome://extensions`.
3.  **Enable Developer Mode:** In the top-right corner of the extensions page, turn on the **"Developer mode"** toggle.
4.  **Load the Extension:** Click the **"Load unpacked"** button that appears on the top-left.
5.  **Select the Folder:** In the file dialog that opens, navigate to and select the `LeetCode-Focus-Extension` folder (the one containing `manifest.json`).
6.  That's it! The extension icon will appear in your Chrome toolbar. Pin it for easy access.

## 💻 How to Use

1.  Navigate to any problem page on LeetCode (e.g., `https://leetcode.com/problems/two-sum/`).
2.  Click the **LeetCode Focus** icon in your toolbar.
3.  In the popup, enter your desired focus duration in minutes.
4.  Click **"Start Timer"**.
5.  A motivational toast will appear, and the solution buttons on the page will turn gray and become unclickable.
6.  To stop early, click the extension icon again and press **"Stop & Unlock"**.

## 🛠️ Tech Stack

*   **HTML5, CSS3, Vanilla JavaScript (ES6)**
*   **Chrome Extension APIs (Manifest V3)**
    *   `chrome.storage` for persisting the timer state.
    *   `chrome.alarms` for reliable background timers.
    *   `chrome.notifications` for system messages.
    *   `chrome.tabs` for script communication.

## 🛣️ Future Roadmap

This is just the beginning! The next major phase is to transform this tool from a simple blocker into a smart study partner.

*   **Phase 2: AI-Powered Hints:** Integrate the Gemini API to provide Socratic-style hints and feedback on your code *without* giving away the solution. This will turn the extension into a personal LeetCode coach.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

### **Instructions for GitHub**

1.  **Create a new file** in your `LeetCode-Focus-Extension` folder.
2.  Name the file `README.md`.
3.  **Copy and paste** the text above into this new file.
4.  **(Recommended)** Create another file named `LICENSE` (no extension) and paste the [MIT License text](https://opensource.org/licenses/MIT) into it.
5.  Take some screenshots of your extension working and replace the placeholder image link at the top. You can upload the images directly to your GitHub repository and then reference them.
