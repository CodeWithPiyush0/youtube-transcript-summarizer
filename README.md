# YouTube Transcript Summarizer (Chrome Extension)

A Chrome Extension that enhances YouTube by extracting transcripts and making it easy to summarize them using our preferred AI platform.

---

## Folder Structure

```
youtube-transcript-summarizer/
├── manifest.json
├── content.js
├── popup/
│   ├── popup.html
│   └── popup.js
├── icons/
│   └── icon128.png
├── README.md
```

---

## Features

### Transcript Sidebar
- Automatically fetches the full transcript (if available) for YouTube videos.
- Displays it in a collapsible **sidebar** on the right-hand side of the video page.

### Summarize Button
- A **"Summarize with AI"** popup appears below the YouTube video player.
- On first use:
  - Lets the user select a preferred AI platform: **ChatGPT**, **Gemini**, or **Claude**.
  - Lets the user define a custom summary prompt (e.g., `Summarize this video:`).
  - Stores these preferences using `chrome.storage.local`.

- On subsequent uses:
  - Automatically **copies** the transcript along with the prompt to the clipboard.
  - Opens the chosen AI platform in a **new tab**.
  - The user can paste (Ctrl+V or Cmd+V) to summarize the video.

---

## Limitation

Due to Chrome's extension security restrictions, the extension **cannot auto-paste** the transcript and prompt directly into AI platforms.

> Instead, the extension **copies the content to clipboard**. Users must manually paste it (Ctrl+V or Cmd+V) once the new tab opens.

---

## Tech Stack

- HTML, CSS, JavaScript 
- Chrome Extensions APIs:
  - `content_scripts`
  - `chrome.storage.local`
  - `chrome.tabs`

---

## How to Install & Use

1. **Clone the repository**  
   ```bash
   git clone https://github.com/CodeWithPiyush0/youtube-transcript-summarizer.git
   ```

2. **Load the extension in Chrome**  
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer Mode**
   - Click **Load unpacked**
   - Select the `youtube-transcript-summarizer/` folder

3. **Use the extension**  
   - Open any YouTube video with a transcript.
   - A **sidebar** will appear with the transcript.
   - Below the video, click **"Summarize with AI"**
   - Your selected AI tool will open in a new tab.
   - Paste (Ctrl+V or Cmd+V) the copied transcript and prompt to get a summary.

---
