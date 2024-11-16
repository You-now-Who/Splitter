document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 Popup loaded');

  const enableButton = document.getElementById('enable');
  const disableButton = document.getElementById('disable');

  enableButton.addEventListener('click', () => {
    console.log('🟢 Enable button clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        { target: { tabId: tabs[0].id }, files: ['content.js'] },
        () => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'enableVocalIsolation' }, (response) => {
            console.log(response?.status === 'enabled' ? '✅ Vocal Isolation Enabled' : '❌ Failed to enable');
          });
        }
      );
    });
  });

  disableButton.addEventListener('click', () => {
    console.log('🔴 Disable button clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'disableVocalIsolation' }, (response) => {
        console.log(response?.status === 'disabled' ? '❌ Vocal Isolation Disabled' : '❌ Failed to disable');
      });
    });
  });
});
