document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('enableBlocking', function (data) {
        const enableBlocking = data.enableBlocking !== false;
        if (enableBlocking) {

            // Create a style element
            const style = document.createElement('style');
            style.textContent = `
        .hidden-panel {
            display: none !important;
        }   
         `;

            document.head.appendChild(style);

            // Observe URL changes and reapply hiding logic
            const observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === 'childList') {
                        // Reapply panel hiding logic
                        applyHidingLogic();
                    }
                });
            });
            const config = {childList: true, subtree: true};
            observer.observe(document.body, config);
            // Initial application of the hiding logic
            applyHidingLogic();
        }
    });
});

function applyHidingLogic() {
    const url = window.location.href;
    // IDs and CSS class
    const homepageIdToHide = 'contents'; // ID to hide on the homepage
    const videoPageIdToHide = 'related'; // ID to hide on the video page
    const searchPageUrlPattern = 'https://www.youtube.com/results?search_query=';
    const videoPageUrlPattern = 'https://www.youtube.com/watch?v=';
    if (url === 'https://www.youtube.com/') {
        toggleElementVisibility(homepageIdToHide, true);
    } else if (url.startsWith(searchPageUrlPattern)) {
        toggleElementVisibility(homepageIdToHide, false);
    } else if (url.startsWith(videoPageUrlPattern)) {
        toggleElementVisibility(videoPageIdToHide, true); // Use toggleElementVisibility for consistency
    } else {
        toggleElementVisibility(homepageIdToHide, false);
        toggleElementVisibility(videoPageIdToHide, false);
    }
}


function toggleElementVisibility(elementId, hide) {
    const targetNode = document.querySelector('body'); // or a more specific parent node
    const observerConfig = {childList: true, subtree: true};

    const callback = function (mutationList, observerInstance) {
        const panel = document.getElementById(elementId);
        if (panel) {
            if (hide) {
                if (!panel.classList.contains('hidden-panel')) {
                    panel.classList.add('hidden-panel');
                    console.log(`Hid panel with ID: ${elementId}`);
                    displayNotification(`Panel with ID: ${elementId} was hidden by your extension. Keep focusing!`);
                }
            } else {
                if (panel.classList.contains('hidden-panel')) {
                    panel.classList.remove('hidden-panel');
                    console.log(`Made panel visible with ID: ${elementId}`);
                }
            }
            observerInstance.disconnect(); // Stop observing once the desired state is achieved
        }
    };

    const observer = new MutationObserver(callback);
    if (targetNode) {
        observer.observe(targetNode, observerConfig);
    } else {
        console.error("Target node not found.");
    }
}

function handleElementRemoval(elementId, parentSelector) {
    const targetNode = document.getElementById(parentSelector);
    const observerConfig = {childList: true, subtree: true};
    const callback = function (mutationList, observer) {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                const panel = document.getElementById(elementId);
                if (panel) {
                    panel.remove();
                    console.log(`Removed panel with ID: ${elementId}`);
                    displayNotification(`Panel with ID: ${elementId} was hidden by your extension. Keep focusing!`);
                    observer.disconnect(); // Stop observing once the panel is removed
                }
            }
        }
    };
    const observer = new MutationObserver(callback);
    if (targetNode) {
        observer.observe(targetNode, observerConfig);
    } else {
        console.error("Target node not found.");
    }
}


function displayNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = '#f0ad4e';
    notification.style.color = '#fff';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    notification.style.zIndex = '9999';
    document.body.appendChild(notification);
    // Remove notification after 3 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}