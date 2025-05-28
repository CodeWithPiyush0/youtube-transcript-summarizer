document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['selectedAI', 'customPrompt'], (result) => {
        if (result.selectedAI) {
            document.querySelector(`input[value="${result.selectedAI}"]`).checked = true;
        }
        if (result.customPrompt) {
            document.getElementById('default-prompt').value = result.customPrompt;
        }
    });
    document.getElementById('save-settings').addEventListener('click', () => {
        const selectedAI = document.querySelector('input[name="ai-platform"]:checked')?.value;
        const customPrompt = document.getElementById('default-prompt').value.trim();

        if (!selectedAI) {
            alert('Please select an AI platform');
            return;
        }
        chrome.storage.local.set({
            selectedAI: selectedAI,
            customPrompt: customPrompt || 'Please summarize this YouTube video transcript:'
        }, () => {
            const saveBtn = document.getElementById('save-settings');
            saveBtn.textContent = 'Saved!';
            saveBtn.style.background = '#4CAF50';
            setTimeout(() => {
                saveBtn.textContent = 'Save Settings';
                saveBtn.style.background = '#2196F3';
            }, 1500);
        });
    });
    const options = document.querySelectorAll('.ai-option');
    options.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        radio.addEventListener('change', () => {
            options.forEach(opt => opt.style.borderColor = '#eee');
            if (radio.checked) {
                option.style.borderColor = '#2196F3';
            }
        });
    });
});