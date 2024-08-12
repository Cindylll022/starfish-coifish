// background.js
const terms = ["Terms of Service", "TOS", "Privacy Policy", "Terms and Conditions", "User Agreements"];

// Function to check if any of the terms appear in the text content of the document
function containsTerms(text, terms) {
  return terms.some(term => text.includes(term));
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.textContent) {
    const textContent = message.textContent;
    console.log("message sent")
    

    if (containsTerms(textContent, terms)) {
      chrome.storage.local.set({ termsDetected: true }, () => {
        console.log('Terms detected and stored');
        // Set a badge to alert the user
        chrome.action.setBadgeText({ text: 'Terms Detected!' });
        chrome.action.setBadgeBackgroundColor({ color: '#82CAFF' });
      });
    } else {
      chrome.storage.local.set({ termsDetected: false }, () => {
        console.log('No terms detected');
        chrome.action.setBadgeText({ text: '' }); // Clear the badge
      });
    }
  }
});
