const themeSelect = document.getElementById('theme-select');
const saveButton = document.getElementById('save-button');
const statusDiv = document.getElementById('status');

// Load saved settings
function loadOptions() {
    chrome.storage.sync.get({
        theme: 'light' // Default value
    }, (items) => {
        themeSelect.value = items.theme;
    });
}

// Save settings
function saveOptions() {
    const theme = themeSelect.value;
    chrome.storage.sync.set({
        theme: theme
    }, () => {
        // Update status to let user know options were saved.
        statusDiv.textContent = 'Options saved.';
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 1500);
    });
}

document.addEventListener('DOMContentLoaded', loadOptions);
saveButton.addEventListener('click', saveOptions);