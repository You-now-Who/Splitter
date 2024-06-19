document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('start').addEventListener('click', () => {
      chrome.runtime.sendMessage({action: 'start'});
    });
  });
  