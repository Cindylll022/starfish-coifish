const terms = [
  "Terms of Service", "TOS", "Privacy Policy", "Terms and Conditions", 
  "User Agreements"];

// Function to check if any of the terms appear in the text content
function containsTerms(text, terms) {
  return terms.some(term => text.toLowerCase().includes(term.toLowerCase()));
}

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.textContent) {
    const text = message.textContent;
    console.log("Message received");

    if (containsTerms(text, terms)) {
      chrome.storage.local.set({ termsDetected: true }, () => {
        console.log('Terms detected and stored');
        chrome.action.setBadgeText({ text: '!' });
        chrome.action.setBadgeBackgroundColor({ color: '#FFD900' });
      });
    } else {
      chrome.storage.local.set({ termsDetected: false }, () => {
        console.log('No terms detected');
        chrome.action.setBadgeText({ text: '' }); // Clear the badge
      });
    }
  }
});

// Listener for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.scripting.executeScript({
    target: {tabId: activeInfo.tabId},
    files: ['scripts/content.js']
  }).then(() => {
    console.log("Content script injected");
  }).catch((error) => {
    console.error("Error injecting content script: ", error);
  });
});
