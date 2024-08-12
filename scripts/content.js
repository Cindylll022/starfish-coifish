// Get the text content of the entire document
const textContent = document.body.textContent || document.body.innerText;
console.log(textContent)
// Send the text content to the background script
chrome.runtime.sendMessage({ textContent: textContent });
