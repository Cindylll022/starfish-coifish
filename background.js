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
  const CHUNK_SIZE = 1000;  // Adjust chunk size as needed
  const chunks = textContent.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g'));

  chunks.forEach(chunk => {
    fetch('http://localhost:3000/simplify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: chunk })
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`Network response was not ok: ${response.statusText}. Response body: ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Simplified Text received:', data.simplified_text);
      chrome.storage.local.set({ summary: data.simplified_text });
    })
    .catch(error => {
      console.error('Error during API call:', error);
    });
  });
}

// Add a listener to handle the message from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.textContent) {
    callGeminiAPI(message.textContent);
  }
});
