console.log('Popup.js loaded');

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('translateBtn').addEventListener('click', function() {
    console.log('Translate button clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'translate' });
    });
  });
});
