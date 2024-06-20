// In your service worker (background.js in your case)
chrome.action.onClicked.addListener((tab) => {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup/popup.html"),
        type: "popup",
        focused: true,
        width: 400,
        height: 600,
    });
});