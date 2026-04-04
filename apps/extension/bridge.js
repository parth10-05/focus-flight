window.addEventListener('message', (event) => {
  if (event.source !== window) {
    return;
  }

  const data = event.data;
  if (!data || data.source !== 'AEROFOCUS_WEB_BRIDGE') {
    return;
  }

  chrome.runtime.sendMessage(
    {
      source: 'WEB_PAGE_BRIDGE',
      type: data.type,
      payload: data.payload
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[AeroFocus] Bridge forward failed:', chrome.runtime.lastError.message);
        return;
      }

      console.log('[AeroFocus] Bridge forward response:', response);
    }
  );
});
