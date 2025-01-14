let observer;

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('enableBlocking', function (data) {
        const enableBlocking = data.enableBlocking !== false;
        if (enableBlocking) {
            initializeBlocking();
        }
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'toggleBlocking') {
            if (request.enabled) {
                initializeBlocking();
            } else {
                removeBlocking();
            }
        }
    });
});

function initializeBlocking() {
    const style = document.createElement('style');
    style.textContent = `
    .hidden-panel {
        display: none !important;
    }
    .focus-message {
        display: none !important;
        padding: 10px;
        margin-top: 10px;
        background-color: #fff3cd;
        border: 1px solid #ffeeba;
        border-radius: 5px;
        color: #856404;
        text-align: center;
    }
    .focus-message-visible {
        display: block !important;
    }
    `;
    style.id = 'panelBlockerStyle';
    document.head.appendChild(style);

    applyHidingLogic();

    if (observer) {
        observer.disconnect();
    }
    observer = new MutationObserver(applyHidingLogic);
    observer.observe(document.body, { childList: true, subtree: true });
}

function removeBlocking() {
    const style = document.getElementById('panelBlockerStyle');
    if (style) {
        style.remove();
    }
    const hiddenPanels = document.querySelectorAll('.hidden-panel');
    hiddenPanels.forEach(panel => panel.classList.remove('hidden-panel'));
    const messages = document.querySelectorAll('.focus-message');
    messages.forEach(message => {
        message.classList.remove('focus-message-visible');
        message.style.display = 'none'; // Ensure the message is hidden
    });
    if (observer) {
        observer.disconnect();
    }
}

function applyHidingLogic() {
    const url = window.location.href;
    const homepageIdToHide = 'contents';
    const videoPageIdToHide = 'related';
    const searchPageUrlPattern = 'https://www.youtube.com/results?search_query=';
    const videoPageUrlPattern = 'https://www.youtube.com/watch?v=';

    if (url === 'https://www.youtube.com/') {
        toggleElementVisibility(homepageIdToHide, true);
    } else if (url.startsWith(searchPageUrlPattern)) {
        toggleElementVisibility(homepageIdToHide, false);
    } else if (url.startsWith(videoPageUrlPattern)) {
        toggleElementVisibility(videoPageIdToHide, true);
    } else {
        toggleElementVisibility(homepageIdToHide, false);
        toggleElementVisibility(videoPageIdToHide, false);
    }
}

function toggleElementVisibility(elementId, hide) {
    const panel = document.getElementById(elementId);
    if (panel) {
        let message = document.getElementById(`${elementId}-focus-message`);
        if (!message) {
            message = document.createElement('div');
            message.id = `${elementId}-focus-message`;
            message.className = 'focus-message';
            message.textContent = "Focus mode: YouTube suggestions removed so you can take over your life.";
            panel.parentNode.insertBefore(message, panel);
        }
        panel.classList.toggle('hidden-panel', hide);
        message.classList.toggle('focus-message-visible', hide);
        message.style.display = hide ? 'block' : 'none'; // Fallback inline style
    }
}