let currentTranscript = '';
let isExtensionActive = false;


function createSidebar() {
    const sidebar = document.createElement("div");
    sidebar.id = "transcript-sidebar";
    sidebar.style.cssText = `
        position: fixed;
        top: 60px;
        right: 0;
        width: 350px;
        height: calc(100% - 60px);
        background-color: #212121;
        border: 2px solid #3f3f3f;
        padding: 20px;
        overflow-y: auto;
        z-index: 9999;
        box-shadow: -2px 0 10px rgba(0,0,0,0.3);
        color: #fff;
    `;
    sidebar.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h2 style="margin: 0; color: #fff;">Video Transcript</h2>
            <button id="close-btn" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">✕</button>
        </div>
        <div style="margin-bottom: 15px;">
            <button id="copy-transcript-btn" style="background: #2f2f2f; color: white; border: 1px solid #3f3f3f; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                📋 Copy Transcript
            </button>
        </div>
        <div id="transcript-content" style="color: #e0e0e0;">
            <p>Loading transcript...</p>
        </div>
    `;
    document.body.appendChild(sidebar);
    document.getElementById('close-btn').onclick = () => sidebar.style.display = 'none';
    document.getElementById('copy-transcript-btn').onclick = copyTranscriptToClipboard;
    addSummarizeButton();
}

async function findAndClickTranscriptButton() {
    console.log('Looking for transcript button...');
    const moreButton = document.querySelector('button.ytp-button[aria-label="More actions"]');
    if (moreButton) {
        moreButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const possibleButtons = [
        'button[aria-label*="transcript" i]',
        '[role="button"][aria-label*="transcript" i]',
        'ytd-menu-item-renderer:not([hidden])[aria-label*="transcript" i]'
    ];
    for (const selector of possibleButtons) {
        const button = document.querySelector(selector);
        if (button) {
            console.log('Found transcript button!');
            button.click();
            return true;
        }
    }
    return false;
}

function extractTranscriptText() {
    console.log('Extracting transcript...');
    const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
    if (segments.length > 0) {
        const text = Array.from(segments)
            .map(segment => {
                const textElement = segment.querySelector('#text-container') || segment;
                return textElement.textContent.trim();
            })
            .filter(text => text)
            .join('\n');

        console.log('Found transcript:', text.substring(0, 100) + '...');
        return text;
    }
    return null;
}

function displayTranscript(text) {
    const contentDiv = document.getElementById('transcript-content');
    if (!text) {
        contentDiv.innerHTML = `
            <div style="text-align: center; color: #e0e0e0;">
                <p>😕 No transcript available.</p>
                <p>Make sure the video has closed captions enabled.</p>
                <button onclick="window.location.reload()" style="background: #3ea6ff; color: #0f0f0f; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    🔄 Retry
                </button>
            </div>
        `;
        return;
    }
    currentTranscript = text;
    const paragraphs = text.split('\n')
        .map(para => `<p style="margin-bottom: 10px; line-height: 1.4;">${para}</p>`)
        .join('');
    
    contentDiv.innerHTML = paragraphs;
}

async function copyTranscriptToClipboard() {
    if (!currentTranscript) {
        alert('No transcript available to copy');
        return;
    }
    try {
        await navigator.clipboard.writeText(currentTranscript);
        const btn = document.getElementById('copy-transcript-btn');
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = '📋 Copy Transcript', 2000);
    } catch (err) {
        alert('Failed to copy transcript');
    }
}

function addSummarizeButton() {
    const existingButton = document.getElementById('summarize-button-container');
    if (existingButton) existingButton.remove();
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'summarize-button-container';
    buttonContainer.style.cssText = `
        position: sticky;
        top: 0;
        z-index: 999;
        padding: 10px;
        background: #212121;
        border-bottom: 1px solid #3f3f3f;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
    `;
    const summarizeButton = document.createElement('button');
    summarizeButton.innerHTML = '🤖 Summarize with AI';
    summarizeButton.style.cssText = `
        background: #3ea6ff;
        color: #0f0f0f;
        border: none;
        padding: 12px 24px;
        border-radius: 18px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
        transition: all 0.2s;
    `;
    summarizeButton.onmouseover = () => {
        summarizeButton.style.backgroundColor = '#65b5ff';
        summarizeButton.style.transform = 'scale(1.02)';
    };
    summarizeButton.onmouseout = () => {
        summarizeButton.style.backgroundColor = '#3ea6ff';
        summarizeButton.style.transform = 'scale(1)';
    };
    summarizeButton.onclick = showAISelectionPopup;
    buttonContainer.appendChild(summarizeButton);
    const player = document.querySelector('#above-the-fold');
    if (player) {
        player.after(buttonContainer);
    }
}

async function showAISelectionPopup() {
    if (!currentTranscript) {
        alert('Please wait for the transcript to load first.');
        return;
    }
    const existingPopup = document.getElementById('ai-selection-popup');
    if (existingPopup) existingPopup.remove();
    const savedPreferences = await chrome.storage.local.get(['selectedAI', 'customPrompt']);
    const popup = document.createElement('div');
    popup.id = 'ai-selection-popup';
    popup.style.cssText = `
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #212121;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        width: 300px;
        color: #fff;
        border: 1px solid #3f3f3f;
    `;
    popup.innerHTML = `
        <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 15px 0; color: #fff; font-size: 16px;">Choose AI Platform</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <label class="ai-option" style="display: flex; align-items: center; padding: 10px; border: 1px solid #3f3f3f; border-radius: 8px; cursor: pointer; background: #2f2f2f;">
                    <input type="radio" name="ai-platform" value="chatgpt" ${savedPreferences.selectedAI === 'chatgpt' ? 'checked' : ''} style="margin-right: 10px;">
                    <div>
                        <div style="font-weight: bold; color: #fff;">ChatGPT</div>
                        <div style="font-size: 12px; color: #aaa;">chat.openai.com</div>
                    </div>
                </label>
                <label class="ai-option" style="display: flex; align-items: center; padding: 10px; border: 1px solid #3f3f3f; border-radius: 8px; cursor: pointer; background: #2f2f2f;">
                    <input type="radio" name="ai-platform" value="gemini" ${savedPreferences.selectedAI === 'gemini' ? 'checked' : ''} style="margin-right: 10px;">
                    <div>
                        <div style="font-weight: bold; color: #fff;">Google Gemini</div>
                        <div style="font-size: 12px; color: #aaa;">gemini.google.com</div>
                    </div>
                </label>
                <label class="ai-option" style="display: flex; align-items: center; padding: 10px; border: 1px solid #3f3f3f; border-radius: 8px; cursor: pointer; background: #2f2f2f;">
                    <input type="radio" name="ai-platform" value="claude" ${savedPreferences.selectedAI === 'claude' ? 'checked' : ''} style="margin-right: 10px;">
                    <div>
                        <div style="font-weight: bold; color: #fff;">Claude AI</div>
                        <div style="font-size: 12px; color: #aaa;">claude.ai</div>
                    </div>
                </label>
            </div>
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #fff;">Custom Prompt (Optional)</label>
            <textarea id="custom-prompt" placeholder="Enter custom prompt..." style="
                width: 100%;
                padding: 8px;
                background: #2f2f2f;
                color: #fff;
                border: 1px solid #3f3f3f;
                border-radius: 6px;
                height: 60px;
                resize: vertical;
                box-sizing: border-box;
                font-family: inherit;
            ">${savedPreferences.customPrompt || ''}</textarea>
        </div>
        <div style="display: flex; gap: 10px;">
            <button id="cancel-ai" style="
                flex: 1;
                padding: 8px;
                background: #2f2f2f;
                color: #fff;
                border: 1px solid #3f3f3f;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
            ">Cancel</button>
            <button id="confirm-ai" style="
                flex: 1;
                padding: 8px;
                background: #3ea6ff;
                color: #0f0f0f;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
            ">Continue</button>
        </div>
    `;

    const buttonContainer = document.getElementById('summarize-button-container');
    buttonContainer.appendChild(popup);
    if (savedPreferences.selectedAI) {
        const selectedOption = popup.querySelector(`input[value="${savedPreferences.selectedAI}"]`).closest('.ai-option');
        selectedOption.style.backgroundColor = '#3f3f3f';
        selectedOption.style.borderColor = '#3ea6ff';
    }
    document.getElementById('cancel-ai').onclick = () => popup.remove();
    document.getElementById('confirm-ai').onclick = handleSummarizeClick;
    const options = popup.querySelectorAll('.ai-option');
    options.forEach(option => {
        option.addEventListener('mouseover', () => {
            option.style.backgroundColor = '#3f3f3f';
        });
        option.addEventListener('mouseout', () => {
            if (!option.querySelector('input').checked) {
                option.style.backgroundColor = '#2f2f2f';
            }
        });
        option.querySelector('input').addEventListener('change', () => {
            options.forEach(opt => {
                opt.style.backgroundColor = '#2f2f2f';
                opt.style.borderColor = '#3f3f3f';
            });
            if (option.querySelector('input').checked) {
                option.style.backgroundColor = '#3f3f3f';
                option.style.borderColor = '#3ea6ff';
            }
        });
    });
}

async function handleSummarizeClick() {
    const popup = document.getElementById('ai-selection-popup');
    const selectedPlatform = popup.querySelector('input[name="ai-platform"]:checked')?.value;
    if (!selectedPlatform) {
        alert('Please select an AI platform');
        return;
    }
    const customPrompt = popup.querySelector('#custom-prompt').value.trim();
    try {
        await chrome.storage.local.set({
            selectedAI: selectedPlatform,
            customPrompt: customPrompt || 'Please summarize this video transcript:'
        });
        const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent || 'YouTube Video';
        const now = new Date();
        const formattedDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');
        const fullText = `Title: ${videoTitle}\nCurrent Date and Time : ${formattedDate}\nCurrent User's Login: CodeWithPiyush0\n\n${customPrompt || 'Please summarize this video transcript:'}\n\n${currentTranscript}`;
        await navigator.clipboard.writeText(fullText);
        const urls = {
            'chatgpt': 'https://chat.openai.com/',
            'gemini': 'https://gemini.google.com/',
            'claude': 'https://claude.ai/'
        };
        window.open(urls[selectedPlatform], '_blank');
        popup.remove();
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #2f2f2f;
            color: #fff;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            border: 1px solid #3f3f3f;
        `;
        successMsg.textContent = 'Transcript copied! Ready to paste in the AI platform.';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function loadTranscript() {
    console.log('Starting transcript extraction...');
    createSidebar();
    try {
        const buttonFound = await findAndClickTranscriptButton();
        if (!buttonFound) {
            displayTranscript(null);
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const transcriptText = extractTranscriptText();
        displayTranscript(transcriptText);
    } catch (error) {
        console.error('Error loading transcript:', error);
        displayTranscript(null);
    }
}

function startExtension() {
    if (window.location.href.includes('youtube.com/watch') && !isExtensionActive) {
        isExtensionActive = true;
        setTimeout(() => loadTranscript(), 2000);
    }
}

function cleanupExtension() {
    const sidebar = document.getElementById('transcript-sidebar');
    if (sidebar) sidebar.remove();
    const summarizeBtn = document.getElementById('summarize-button-container');
    if (summarizeBtn) summarizeBtn.remove();
    isExtensionActive = false;
    currentTranscript = '';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startExtension);
} else {
    startExtension();
}

let currentUrl = window.location.href;
setInterval(() => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        cleanupExtension();
        startExtension();
    }
}, 1000);