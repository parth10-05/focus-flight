const WEB_APP_URL = 'http://localhost:5173';

const blockedDomainEl = document.getElementById('blocked-domain');
const remainingTimeEl = document.getElementById('remaining-time');
const returnBtn = document.getElementById('return-flight-btn');
const abortBtn = document.getElementById('abort-flight-btn');

function formatDuration(seconds) {
  const safe = Math.max(0, seconds);
  const h = String(Math.floor(safe / 3600)).padStart(2, '0');
  const m = String(Math.floor((safe % 3600) / 60)).padStart(2, '0');
  const s = String(safe % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function getCurrentBlockedHost() {
  try {
    const currentUrl = new URL(window.location.href);
    const original = currentUrl.searchParams.get('url') || currentUrl.searchParams.get('redirect');
    if (original) {
      return new URL(original).hostname;
    }
  } catch {
    return 'blocked destination';
  }
  return 'blocked destination';
}

function wireActions(activeFlightId) {
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      const target = activeFlightId ? `/flight/${activeFlightId}` : '/preflight';
      chrome.tabs.create({ url: `${WEB_APP_URL}${target}` });
    });
  }

  if (abortBtn) {
    abortBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'CLEAR_SESSION' }, () => {
        chrome.tabs.create({ url: `${WEB_APP_URL}/preflight` });
      });
    });
  }
}

chrome.storage.local.get(['activeFlight'], (result) => {
  const flight = result.activeFlight;
  const blockedHost = getCurrentBlockedHost();

  if (blockedDomainEl) {
    blockedDomainEl.textContent = blockedHost.toUpperCase();
  }

  if (!flight || !flight.start_time) {
    if (remainingTimeEl) {
      remainingTimeEl.textContent = '00:00:00';
    }
    wireActions(null);
    return;
  }

  function updateRemaining() {
    const startMs = new Date(flight.start_time).getTime();
    const durationSec = Number(flight.duration || 0);

    if (Number.isNaN(startMs) || durationSec <= 0) {
      if (remainingTimeEl) {
        remainingTimeEl.textContent = '00:00:00';
      }
      return;
    }

    const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
    const remainingSec = durationSec - elapsedSec;

    if (remainingTimeEl) {
      remainingTimeEl.textContent = formatDuration(remainingSec);
    }
  }

  updateRemaining();
  setInterval(updateRemaining, 1000);
  wireActions(flight.id || null);
});
