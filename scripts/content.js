(function() {
  // Encapsulated code

  // Get the text content of the entire document
  const textContent = document.body.textContent || document.body.innerText;

  // Send the text content to the background script
  chrome.runtime.sendMessage({ textContent: textContent });
})();
