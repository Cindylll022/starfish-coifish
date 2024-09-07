document.addEventListener("DOMContentLoaded", () => {
  // retrieves and checks the termsDetected from local chrome storage
  chrome.storage.local.get(['termsDetected', 'summary'], (result) => {
    const messageElement = document.getElementById('message');
    const summaryElement = document.getElementById('summary');
    //updates message element with result.termDetected boolean result
    if (result.termsDetected) {
      messageElement.textContent = "Terms detected";
    } else {
      messageElement.textContent = "No terms detected.";
    }

    if (result.summary){
      summaryElement.textContent = result.summary;
    }else{
      summaryElement.textContent = "No simplified text available.";
    }
  });
});
