document.addEventListener('DOMContentLoaded', function () {
    const enableBlockingCheckbox = document.getElementById('enableBlocking');
    // Load the current setting
    chrome.storage.local.get('enableBlocking', function (data) {
        enableBlockingCheckbox.checked = data.enableBlocking !== false; // Default to true if undefined
    });
    // Save the setting when the checkbox is changed
    enableBlockingCheckbox.addEventListener('change', function () {
        chrome.storage.local.set({ enableBlocking: enableBlockingCheckbox.checked });
    });
});