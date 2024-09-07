const terms = [
  "Terms of Service", "TOS", "Privacy Policy", "Terms and Conditions", 
  "User Agreements", "Terms of Use"];

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
  // Fetch the tab details to get the URL and other information
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && !tab.url.startsWith('chrome://')) {
      chrome.scripting.executeScript({
        target: { tabId: activeInfo.tabId },
        files: ['scripts/content.js']
      }).then(() => {
        console.log("Content script injected");
      }).catch((error) => {
        console.error("Error injecting content script: ", error);
      });
    } else {
      console.log("Ignored chrome:// URL");
    }
  });
});

function callGeminiAPI(textContent) {
  fetch('https://your-api.vercel.app/api/gemini', {  // Replace with your deployed API URL
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
     'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      text: textContent, // Full text content to be processed
      client_id: 'your-client-id',
      client_secret: 'your-client-secret',
      redirect_uri: 'your-redirect-uri',
      code: 'authorization-code'  // Adjust based on your OAuth2 flow
    }),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Summary received:', data);
    chrome.storage.local.set({ summary: data.summary });
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

// Add a listener to handle the message from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.textContent) {
    callGeminiAPI(message.textContent);
  }
});
