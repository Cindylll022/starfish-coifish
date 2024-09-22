(function() {
  // encapsulated code

  // get the text content of the entire document
  const textContent = document.body.textContent || document.body.innerText;
  console.log(textContent)
  // send the text content to background script
  chrome.runtime.sendMessage({ textContent: textContent });
})();
