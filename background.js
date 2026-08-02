// Background service worker / script for Firefox Extension
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onInstalled.addListener(() => {
  console.log('Firefox Auto Form & Switch Filler Extension installed successfully.');
});
