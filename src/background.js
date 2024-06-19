chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
      chrome.tabCapture.capture({audio: true}, function(stream) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          const tabId = tabs[0].id;
          chrome.scripting.executeScript({
            target: {tabId: tabId},
            func: processAudioStream,
            args: [stream]
          });
        });
      });
    }
  });
  
  function processAudioStream(stream) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
  
    // Placeholder for actual audio processing logic
    source.connect(audioContext.destination);
  }
  