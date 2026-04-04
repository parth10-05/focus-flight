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

function wireActions(activeFlightId, webAppUrl) {
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      const target = activeFlightId ? `/flight/${activeFlightId}` : '/preflight';
      chrome.tabs.create({ url: `${webAppUrl}${target}` });
    });
  }

  if (abortBtn) {
    abortBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'CLEAR_SESSION' }, () => {
        chrome.tabs.create({ url: `${webAppUrl}/preflight` });
      });
    });
  }
}

async function initializeBlockedPage() {
  const webAppUrl = await resolveWebAppUrl();

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
    wireActions(null, webAppUrl);
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
  wireActions(flight.id || null, webAppUrl);
  });
}

void initializeBlockedPage();
