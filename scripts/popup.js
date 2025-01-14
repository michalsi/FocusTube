document.addEventListener('DOMContentLoaded', function () {
    const enableBlockingCheckbox = document.getElementById('enableBlocking');

    chrome.storage.local.get('enableBlocking', function (data) {
        enableBlockingCheckbox.checked = data.enableBlocking !== false;
    });

    enableBlockingCheckbox.addEventListener('change', function () {
        const isEnabled = enableBlockingCheckbox.checked;
        chrome.storage.local.set({ enableBlocking: isEnabled }, function () {

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBlocking', enabled: isEnabled });
            });
        });
    });
});