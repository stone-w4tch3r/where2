// Background script that manages extension state

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Where2 Map Overlay extension installed");

  // Initialize extension state
  chrome.storage.local.set({
    overlayEnabled: true,
    mapFound: false,
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "MAP_FOUND") {
    // Update badge to indicate maps were found
    chrome.action.setBadgeText({
      text: "✓",
      tabId: sender.tab?.id,
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#4285f4",
      tabId: sender.tab?.id,
    });

    // Update storage
    chrome.storage.local.set({ mapFound: true });
    sendResponse({ status: "acknowledged" });
  }

  if (message.type === "MAP_NOT_FOUND") {
    // Update badge to indicate no maps were found
    chrome.action.setBadgeText({
      text: "✗",
      tabId: sender.tab?.id,
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#f44336",
      tabId: sender.tab?.id,
    });

    // Update storage
    chrome.storage.local.set({ mapFound: false });
    sendResponse({ status: "acknowledged" });
  }

  // Return true to indicate that sendResponse will be called asynchronously
  return true;
});
