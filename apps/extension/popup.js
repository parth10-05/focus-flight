const WEB_APP_URL = 'http://localhost:5173';

const elapsedDisplay = document.getElementById('elapsed-display');
const statusDisplay = document.getElementById('status-display');
const quickFlightBtn = document.getElementById('quick-flight-btn');

function setQuickFlightButtonLabel(hasActiveFlight) {
  if (!quickFlightBtn) {
    return;
  }

  quickFlightBtn.textContent = hasActiveFlight ? 'OPEN ACTIVE FLIGHT' : 'BEGIN QUICK FLIGHT';
}

if (quickFlightBtn) {
  quickFlightBtn.addEventListener('click', () => {
    chrome.storage.local.get(['activeFlight'], (result) => {
      const activeFlightId = result.activeFlight?.id;
      const targetPath = activeFlightId ? `/flight/${activeFlightId}` : '/preflight';
      chrome.tabs.create({ url: `${WEB_APP_URL}${targetPath}` });
    });
  });
}

chrome.storage.local.get(['activeFlight'], (result) => {
  const flight = result.activeFlight;
  setQuickFlightButtonLabel(Boolean(flight?.id));

  if (!flight) {
    if (statusDisplay) {
      statusDisplay.textContent = 'No active flight';
    }
    if (elapsedDisplay) {
      elapsedDisplay.textContent = '00:00:00';
    }
    return;
  }

  function updateTimer() {
    const startMs = new Date(flight.start_time).getTime();
    if (Number.isNaN(startMs)) {
      if (elapsedDisplay) {
        elapsedDisplay.textContent = '00:00:00';
      }
      return;
    }

    const elapsedS = Math.floor((Date.now() - startMs) / 1000);
    const h = String(Math.floor(elapsedS / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsedS % 3600) / 60)).padStart(2, '0');
    const s = String(elapsedS % 60).padStart(2, '0');

    if (elapsedDisplay) {
      elapsedDisplay.textContent = `${h}:${m}:${s}`;
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);

  if (statusDisplay) {
    statusDisplay.textContent = `${flight.origin} → ${flight.destination}`;
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes.activeFlight) {
    return;
  }

  setQuickFlightButtonLabel(Boolean(changes.activeFlight.newValue?.id));
});
