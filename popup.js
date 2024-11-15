document.getElementById('enable').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Check if content.js is ready by executing a simple script in the page
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: checkContentScriptReady
      }, (result) => {
        if (result && result[0].result) {
          // Content script is ready, now send the message to enable vocal isolation
          chrome.runtime.sendMessage({ action: 'enableVocalIsolation' }, (response) => {
            console.log(response.status);  // Should log 'success' if content script handled the action
            alert('Vocal Isolation Enabled!');
          });
        } else {
          console.error('Content script is not ready.');
          alert('Content script is not ready.');
        }
      });
    });
  });
  
  // Function to check if content.js is injected and ready
  function checkContentScriptReady() {
    // We return a boolean indicating whether the content script is ready
    return typeof chrome.runtime.onMessage !== 'undefined';
  }
  