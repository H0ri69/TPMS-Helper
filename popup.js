document.addEventListener('DOMContentLoaded', () => {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  const fillBtn = document.getElementById('fillBtn');
  const textValueInput = document.getElementById('textValue');
  const statusDiv = document.getElementById('status');

  // Load saved text value from local storage if available
  if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
    browserAPI.storage.local.get(['defaultText'], (res) => {
      if (res && res.defaultText) {
        textValueInput.value = res.defaultText;
      }
    });
  }

  // Save changes to input value
  textValueInput.addEventListener('input', () => {
    const textVal = textValueInput.value;
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      browserAPI.storage.local.set({ defaultText: textVal });
    }
  });

  fillBtn.addEventListener('click', async () => {
    const textValue = textValueInput.value.trim() || 'Passed';
    statusDiv.className = 'status';
    statusDiv.style.display = 'none';

    try {
      // Query active tab
      const tabs = await new Promise((resolve) => {
        if (browserAPI.tabs && browserAPI.tabs.query) {
          browserAPI.tabs.query({ active: true, currentWindow: true }, resolve);
        } else {
          resolve([]);
        }
      });

      if (!tabs || tabs.length === 0) {
        showStatus('Error: No active tab found', 'error');
        return;
      }

      const activeTab = tabs[0];

      // Send message to content script
      browserAPI.tabs.sendMessage(activeTab.id, { action: 'FILL_FORM', textValue }, (response) => {
        if (browserAPI.runtime.lastError) {
          // If script is not injected yet, inject script programmatically
          if (browserAPI.scripting && browserAPI.scripting.executeScript) {
            browserAPI.scripting.executeScript({
              target: { tabId: activeTab.id },
              files: ['content.js']
            }).then(() => {
              // Retry sending message
              browserAPI.tabs.sendMessage(activeTab.id, { action: 'FILL_FORM', textValue }, (res) => {
                handleResponse(res);
              });
            }).catch(err => {
              showStatus('Could not inject script: ' + err.message, 'error');
            });
          } else {
            showStatus('Please refresh the page and try again.', 'error');
          }
        } else {
          handleResponse(response);
        }
      });

    } catch (err) {
      showStatus('Failed to send fill command: ' + err.message, 'error');
    }
  });

  function handleResponse(response) {
    if (response && response.success) {
      const textMsg = `${response.textCount} text box(es) filled`;
      const switchMsg = `${response.switchCount} switch(es)/checkbox(es) checked`;
      showStatus(`✓ Success! ${textMsg}, ${switchMsg}.`, 'success');
    } else {
      showStatus('✓ Form fill script executed.', 'success');
    }
  }

  function showStatus(msg, type) {
    statusDiv.textContent = msg;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
  }
});
