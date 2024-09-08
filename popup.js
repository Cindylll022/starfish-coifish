document.addEventListener("DOMContentLoaded", () => {
  // retrieves and checks the termsDetected from local chrome storage
  chrome.storage.local.get(['termsDetected'], (result) => {
    const messageElement = document.getElementById('message');
    //updates message element with result.termDetected boolean result
    if (result.termsDetected) {
      messageElement.textContent = "Terms detected";
    } else {
      messageElement.textContent = "No terms detected.";
    }
  });
  chrome.storage.local.get('summary', (data) => {
    if (data.summary) {
      document.getElementById('result').innerText = data.summary;
    } else {
      document.getElementById('result').innerText = 'No summary available';
    }
  });
});
