import { GoogleGenerativeAI } from 'https://cdn.jsdelivr.net/node_modules/@google/generative-ai@latest/dist/index.mjs';

const fetch = require('node-fetch');  // Add this if not already included

// Initialize Google Generative AI client
const apiKey = 'AIzaSyDwBcepibESpnizbmmzxXnY_wczDcX66sI';  // Make sure to replace with your actual API key
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
  return model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: textContent }],
      }
    ],
    generationConfig: {
      maxOutputTokens: 200,  // Adjust as needed
      temperature: 0.5,     // Adjust as needed for more or less creativity
      stopSequences: ['\n'],  // Define stop sequences if needed
    },
  });
}

// Add a listener to handle the message from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.textContent) {
    callGeminiAPI(message.textContent)
      .then(result => {
        console.log('Summary received:', result.response.text());
        chrome.storage.local.set({ summary: result.response.text() });
      })
      .catch(error => {
        console.error('Error during API call:', error);
      });
  }
});

