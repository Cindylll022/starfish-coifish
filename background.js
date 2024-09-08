function extractPrivacyPolicy(text) {
  let cleanedText = text.replace(/<script.*?>.*?<\/script>/gs, '');

  // Remove JavaScript function blocks, window/document variables, and inline scripts
  cleanedText = cleanedText.replace(/(function.*?\{.*?\})/gs, '');    // Remove function blocks
  cleanedText = cleanedText.replace(/window\..*?;/g, '');             // Remove window.* expressions
  cleanedText = cleanedText.replace(/document\..*?;/g, '');           // Remove document.* expressions
  cleanedText = cleanedText.replace(/try\s*{[^}]*}\s*catch\s*\([^\)]*\)\s*{[^}]*}/gs, ''); // Remove try-catch blocks
  cleanedText = cleanedText.replace(/var\s+\w+\s*=\s*.*?;/g, '');     // Remove var declarations
  cleanedText = cleanedText.replace(/const\s+\w+\s*=\s*.*?;/g, '');   // Remove const declarations
  cleanedText = cleanedText.replace(/let\s+\w+\s*=\s*.*?;/g, '');     // Remove let declarations

  // Remove any incomplete leftover fragments (e.g., `window.Fusion =;`, isolated brackets)
  cleanedText = cleanedText.replace(/window\.\w+\s*=\s*;?/g, '');     // Remove incomplete window.* expressions
  cleanedText = cleanedText.replace(/\([^)]*\)\s*;?/g, '');           // Remove isolated function calls like `()`

  // Remove leftover characters like `{}();` or loose parentheses and brackets
  cleanedText = cleanedText.replace(/[{}();]+/g, '');

  return cleanedText;
}

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
    const text = extractPrivacyPolicy(message.textContent);
    console.log("Cleaned text:", text);

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
    callServer(text)
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

function splitText(text, maxLength) {
  let chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }
  return chunks;
}

function callServer(textContent) {
  fetch('http://localhost:3000/simplify', {  // Your backend server URL
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: textContent })
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
    console.log('Simplified Text received:', data.summary);
    chrome.storage.local.set({ summary: data.summary });
  })
  .catch(error => {
    console.error('Error during API call:', error);
  });
}


