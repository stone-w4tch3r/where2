// Popup script that updates the UI and sends commands to the content script

document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("status") as HTMLDivElement;
  const toggleButton = document.getElementById(
    "toggleBtn",
  ) as HTMLButtonElement;

  // Get current state from storage
  chrome.storage.local.get(["overlayEnabled", "mapFound"], (result) => {
    updateUI(result.overlayEnabled, result.mapFound);
  });

  // Update UI based on state
  function updateUI(overlayEnabled: boolean, mapFound: boolean): void {
    if (mapFound) {
      statusElement.textContent = "Maps found on page";
      statusElement.style.backgroundColor = "#e6f4ea";
      toggleButton.textContent = overlayEnabled
        ? "Disable Overlay"
        : "Enable Overlay";
    } else {
      statusElement.textContent = "No maps detected on this page";
      statusElement.style.backgroundColor = "#fce8e6";
      toggleButton.disabled = true;
    }
  }

  // Toggle overlay when button is clicked
  toggleButton.addEventListener("click", () => {
    chrome.storage.local.get(["overlayEnabled"], (result) => {
      const newState = !result.overlayEnabled;

      // Update storage
      chrome.storage.local.set({ overlayEnabled: newState });

      // Send message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: newState ? "ENABLE_OVERLAY" : "DISABLE_OVERLAY",
          });
        }
      });

      // Update UI
      toggleButton.textContent = newState
        ? "Disable Overlay"
        : "Enable Overlay";
    });
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes) => {
    let overlayEnabled: boolean | undefined;
    let mapFound: boolean | undefined;

    if (changes.overlayEnabled) {
      overlayEnabled = changes.overlayEnabled.newValue;
    }

    if (changes.mapFound) {
      mapFound = changes.mapFound.newValue;
    }

    // Get current values for any that didn't change
    chrome.storage.local.get(["overlayEnabled", "mapFound"], (result) => {
      updateUI(
        overlayEnabled !== undefined ? overlayEnabled : result.overlayEnabled,
        mapFound !== undefined ? mapFound : result.mapFound,
      );
    });
  });
});
