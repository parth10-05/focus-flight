const DEFAULT_WEB_APP_URL = 'http://localhost:5173';

function parseEnv(content) {
  const result = {};
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    result[key] = value;
  }

  return result;
}

async function resolveWebAppUrl() {
  const normalizeWebAppUrl = (value) => {
    const raw = (value || '').trim();
    if (!raw) {
      return DEFAULT_WEB_APP_URL;
    }

    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return withProtocol.replace(/\/+$/, '');
  };

  try {
    const envUrl = chrome.runtime.getURL('.env');
    const response = await fetch(envUrl, { cache: 'no-store' });

    if (!response.ok) {
      return normalizeWebAppUrl(DEFAULT_WEB_APP_URL);
    }

    const envText = await response.text();
    const env = parseEnv(envText);
    return normalizeWebAppUrl(env.EXT_WEB_APP_URL || env.WEB_APP_URL || DEFAULT_WEB_APP_URL);
  } catch {
    return normalizeWebAppUrl(DEFAULT_WEB_APP_URL);
  }
}

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
    void resolveWebAppUrl().then((webAppUrl) => {
      chrome.storage.local.get(['activeFlight'], (result) => {
        const activeFlightId = result.activeFlight?.id;
        const targetPath = activeFlightId ? `/flight/${activeFlightId}` : '/preflight';
        chrome.tabs.create({ url: `${webAppUrl}${targetPath}` });
      });
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
