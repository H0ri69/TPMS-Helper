/**
 * Firefox Extension - Content Script for Auto Form & Switch Filler
 * Specially designed to handle standard inputs as well as Vue / iView custom reactive inputs & switches.
 */

(function () {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  /**
   * Dispatches input/change events with native property setters
   * so Vue/React/Angular reactive state bindings (v-model) update properly.
   */
  function setNativeInputValue(element, value) {
    if (!element) return;

    try {
      element.focus();
      const prototype = element.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;

      const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

      if (valueSetter && valueSetter !== Object.getOwnPropertyDescriptor(element, 'value')?.set) {
        valueSetter.call(element, value);
      } else {
        element.value = value;
      }

      // Dispatch comprehensive events for Vue/React framework listeners (v-model)
      element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
    } catch (e) {
      console.error('Error setting input value:', e);
      element.value = value;
    }
  }

  /**
   * Fills all text boxes and textareas with specified text.
   */
  function fillTextBoxes(textValue = 'Passed') {
    let count = 0;

    // Selector for standard text inputs and custom framework inputs like iView (.ivu-input)
    const selectors = [
      'input[type="text"]',
      'input[type="search"]',
      'input[type="email"]',
      'input[type="url"]',
      'input[type="tel"]',
      'input[type="number"]',
      'input:not([type])',
      'textarea',
      '.ivu-input',
      '[addinname="TextInput"] input',
      'div.i-input input'
    ].join(', ');

    const inputs = document.querySelectorAll(selectors);

    inputs.forEach((input) => {
      // Ignore hidden, disabled, or read-only inputs
      if (input.type === 'hidden' || input.disabled || input.readOnly) return;

      // Ignore zero-sized hidden elements
      const style = window.getComputedStyle(input);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      setNativeInputValue(input, textValue);
      count++;
    });

    return count;
  }

  /**
   * Checks all standard checkboxes AND custom framework switches (like iView ivu-switch).
   */
  function checkCheckboxesAndSwitches() {
    let count = 0;
    const processedElements = new Set();

    // 1. Standard Checkboxes (<input type="checkbox">)
    const standardCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    standardCheckboxes.forEach((cb) => {
      if (cb.disabled || processedElements.has(cb)) return;
      processedElements.add(cb);
      if (!cb.checked) {
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
        cb.dispatchEvent(new Event('click', { bubbles: true }));
        count++;
      }
    });

    // 2. Custom Switches (iView / View UI `.ivu-switch`, `[addinname="Switch"]`, `.el-switch`, `.ant-switch`, `[role="switch"]`)
    const switchCandidates = document.querySelectorAll(
      '.ivu-switch, [addinname="Switch"], [role="switch"], .el-switch, .ant-switch, .ivu-checkbox-wrapper'
    );

    switchCandidates.forEach((cand) => {
      let target = cand;
      // If candidate is a wrapper (e.g. section[addinname="Switch"]), find inner switch
      if (!cand.classList.contains('ivu-switch') &&
          !cand.classList.contains('el-switch') &&
          !cand.classList.contains('ant-switch') &&
          !cand.classList.contains('ivu-checkbox-wrapper') &&
          cand.getAttribute('role') !== 'switch') {
        const inner = cand.querySelector('.ivu-switch, [role="switch"], .el-switch, .ant-switch');
        if (inner) target = inner;
      }

      if (processedElements.has(target)) return;
      processedElements.add(target);

      // Check if it's already checked/active
      const hiddenInput = target.querySelector('input[type="hidden"]');
      const isChecked = target.classList.contains('ivu-switch-checked') ||
                        target.classList.contains('is-checked') ||
                        target.classList.contains('ant-switch-checked') ||
                        target.classList.contains('ivu-checkbox-checked') ||
                        target.getAttribute('aria-checked') === 'true' ||
                        (hiddenInput && (hiddenInput.value === 'true' || hiddenInput.value === '1'));

      if (!isChecked) {
        // Trigger click event to toggle Vue state
        target.click();
        if (hiddenInput) {
          hiddenInput.value = 'true';
          hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        count++;
      }
    });

    return count;
  }

  /**
   * Main fill action
   */
  function executeFill(textValue) {
    const textCount = fillTextBoxes(textValue);
    const switchCount = checkCheckboxesAndSwitches();
    return { textCount, switchCount };
  }

  // Listen for messages from popup or background script
  if (browserAPI && browserAPI.runtime && browserAPI.runtime.onMessage) {
    browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'FILL_FORM') {
        const result = executeFill(message.textValue || 'Passed');
        sendResponse({ success: true, ...result });
      } else if (message.action === 'PING') {
        sendResponse({ status: 'READY' });
      }
      return true;
    });
  }

  // Load saved default text and auto-run if enabled
  try {
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      browserAPI.storage.local.get(['autoFillOnLoad', 'defaultText'], (res) => {
        if (res && res.autoFillOnLoad) {
          setTimeout(() => {
            executeFill(res.defaultText || 'Passed');
          }, 500);
        }
      });
    }
  } catch (err) {
    // Storage access might be restricted on some pages
  }

  // Global Keyboard Shortcut: Press backtick (`) to trigger auto fill
  window.addEventListener('keydown', (e) => {
    // Check if key is backtick / Backquote (` key)
    if (e.key === '`' || e.code === 'Backquote') {
      // Fetch user's configured default text from storage, or use 'Passed'
      let savedText = 'Passed';
      try {
        if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
          browserAPI.storage.local.get(['defaultText'], (res) => {
            if (res && res.defaultText) {
              savedText = res.defaultText;
            }
            executeFill(savedText);
          });
          return;
        }
      } catch (err) {
        // Fallback if storage access is blocked
      }
      executeFill(savedText);
    }
  });

  // Expose global function on window for direct devtools usage if needed
  window.__autoFillFormAndSwitches = executeFill;
})();
