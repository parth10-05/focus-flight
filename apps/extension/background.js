const POLL_INTERVAL_MS = 15000;

let pollIntervalId = null;
let supabaseConfig = null;
let configLoadPromise = null;

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

async function loadSupabaseConfig() {
  try {
    const envUrl = chrome.runtime.getURL('.env');
    const response = await fetch(envUrl, { cache: 'no-store' });

    if (!response.ok) {
      console.error('[AeroFocus] Failed to load extension .env file');
      return null;
    }

    const envText = await response.text();
    const env = parseEnv(envText);

    const url = env.EXT_SUPABASE_URL || env.SUPABASE_URL;
    const anonKey = env.EXT_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.error('[AeroFocus] Missing EXT_SUPABASE_URL / EXT_SUPABASE_ANON_KEY in extension .env');
      return null;
    }

    return {
      url,
      anonKey
    };
  } catch (error) {
    console.error('[AeroFocus] Unable to read extension .env file', error);
    return null;
  }
}

async function ensureSupabaseConfig() {
  if (supabaseConfig) {
    return supabaseConfig;
  }

  if (!configLoadPromise) {
    configLoadPromise = loadSupabaseConfig()
      .then((config) => {
        supabaseConfig = config;
        return config;
      })
      .finally(() => {
        configLoadPromise = null;
      });
  }

  return configLoadPromise;
}

function isSessionLike(value) {
  return Boolean(value && typeof value === 'object' && value.access_token);
}

function getFlightRemainingSeconds(flight) {
  const durationSec = Number(flight?.duration || 0);
  const startMs = new Date(flight?.start_time || '').getTime();

  if (durationSec <= 0 || Number.isNaN(startMs)) {
    return null;
  }

  const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
  return durationSec - elapsedSec;
}

function isFlightExpired(flight) {
  const remainingSec = getFlightRemainingSeconds(flight);
  return remainingSec !== null && remainingSec <= 0;
}

function buildFlightsPollUrl(configUrl) {
  const query = new URLSearchParams({
    status: 'eq.active',
    select: '*,blocked_sites(*)',
    order: 'start_time.desc',
    limit: '1'
  });

  return `${configUrl}/rest/v1/flights?${query.toString()}`;
}

async function clearAllRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existing.map((rule) => rule.id);

  if (removeIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeIds,
      addRules: []
    });
  }
}

async function completeExpiredFlight(flight, configUrl, headers) {
  const flightId = flight?.id;

  if (!flightId) {
    return false;
  }

  try {
    const patchHeaders = {
      ...headers,
      Prefer: 'return=representation'
    };

    const updateResponse = await fetch(
      `${configUrl}/rest/v1/flights?id=eq.${encodeURIComponent(flightId)}&status=eq.active`,
      {
        method: 'PATCH',
        headers: patchHeaders,
        body: JSON.stringify({
          status: 'completed',
          end_time: new Date().toISOString()
        })
      }
    );

    if (!updateResponse.ok) {
      console.warn('[AeroFocus] Failed to complete expired flight:', updateResponse.status, await updateResponse.text());
      return false;
    }

    const updatedRows = await updateResponse.json();
    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      return true;
    }

    const sessionCheckResponse = await fetch(
      `${configUrl}/rest/v1/sessions_log?flight_id=eq.${encodeURIComponent(flightId)}&select=id&limit=1`,
      { headers }
    );

    if (!sessionCheckResponse.ok) {
      console.warn('[AeroFocus] Failed to verify session log for expired flight');
      return true;
    }

    const existingSessionLogs = await sessionCheckResponse.json();
    if (Array.isArray(existingSessionLogs) && existingSessionLogs.length > 0) {
      return true;
    }

    const startMs = new Date(flight.start_time || '').getTime();
    const actualDurationMinutes = Number.isNaN(startMs)
      ? Math.max(0, Math.round(Number(flight.duration || 0) / 60))
      : Math.max(0, Math.round((Date.now() - startMs) / 60000));

    const sessionInsertResponse = await fetch(`${configUrl}/rest/v1/sessions_log`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        flight_id: flightId,
        actual_duration: actualDurationMinutes
      })
    });

    if (!sessionInsertResponse.ok) {
      console.warn('[AeroFocus] Failed to create session log for expired flight:', sessionInsertResponse.status, await sessionInsertResponse.text());
    }

    return true;
  } catch (error) {
    console.warn('[AeroFocus] Error completing expired flight:', error);
    return false;
  }
}

async function updateBlockingRules(domains) {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existingRules.map((rule) => rule.id);

  const addRules = domains
    .filter((domain) => typeof domain === 'string' && domain.trim().length > 0)
    .map((domain, index) => {
      const cleanDomain = domain
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .trim();

      return {
        id: index + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { extensionPath: '/blocked.html' }
        },
        condition: {
          urlFilter: `||${cleanDomain}^`,
          resourceTypes: ['main_frame']
        }
      };
    });

  console.log('[AeroFocus] Setting rules:', JSON.stringify(addRules, null, 2));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules
  });

  const newRules = await chrome.declarativeNetRequest.getDynamicRules();
  console.log('[AeroFocus] Active rules after update:', newRules.length);
}

function stopPolling() {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
}

async function handleSessionExpired() {
  console.warn('[AeroFocus] 401 - clearing session, stopping poll');
  await chrome.storage.local.remove(['supabaseSession', 'activeFlight']);
  stopPolling();
  await clearAllRules();
  console.log('[AeroFocus] Session expired — polling stopped');
}

async function incrementDistractions(flightId, accessToken) {
  try {
    const config = await ensureSupabaseConfig();
    if (!config) {
      return;
    }

    const sessionCheckResponse = await fetch(
      `${config.url}/rest/v1/sessions_log?flight_id=eq.${encodeURIComponent(flightId)}&select=id&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: config.anonKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (sessionCheckResponse.status === 401) {
      await handleSessionExpired();
      return;
    }

    if (sessionCheckResponse.ok) {
      const existingRows = await sessionCheckResponse.json();
      if (!Array.isArray(existingRows) || existingRows.length === 0) {
        const sessionInsertResponse = await fetch(`${config.url}/rest/v1/sessions_log`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            apikey: config.anonKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            flight_id: flightId,
            actual_duration: null,
            distractions_blocked_count: 0
          })
        });

        if (sessionInsertResponse.status === 401) {
          await handleSessionExpired();
          return;
        }
      }
    }

    const response = await fetch(`${config.url}/rest/v1/rpc/increment_distractions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: config.anonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ flight_id: flightId })
    });

    if (response.status === 401) {
      await handleSessionExpired();
    }
  } catch (error) {
    console.warn('[AeroFocus] Poll error:', error);
  }
}

async function poll() {
  try {
    const config = await ensureSupabaseConfig();
    if (!config) {
      return;
    }

    const result = await chrome.storage.local.get('supabaseSession');
    const session = isSessionLike(result.supabaseSession) ? result.supabaseSession : null;
    const headers = {
      apikey: config.anonKey,
      'Content-Type': 'application/json'
    };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    } else {
      console.log('[AeroFocus] No session, polling with anon key only');
    }

    const flightsUrl = buildFlightsPollUrl(config.url);
    const response = await fetch(flightsUrl, { headers });

    if (response.status === 401) {
      if (session?.access_token) {
        await handleSessionExpired();
      } else {
        console.warn('[AeroFocus] Poll received 401 without session');
      }
      return;
    }

    if (!response.ok) {
      console.warn('[AeroFocus] Poll error:', response.status, await response.text());
      return;
    }

    const flights = await response.json();

    if (Array.isArray(flights) && flights.length > 0) {
      const flight = flights[0];

      if (isFlightExpired(flight)) {
        const completed = await completeExpiredFlight(flight, config.url, headers);

        if (completed) {
          await chrome.storage.local.remove('activeFlight');
          await clearAllRules();
          console.log('[AeroFocus] Expired flight auto-completed and rules cleared');
          return;
        }
      }

      const domains = (flight.blocked_sites || []).map((site) => site.domain);

      await chrome.storage.local.set({ activeFlight: flight });
      await updateBlockingRules(domains);
      console.log('[AeroFocus] Active flight found, blocking:', domains);
    } else {
      await chrome.storage.local.remove('activeFlight');
      await clearAllRules();
      console.log('[AeroFocus] No active flight, rules cleared');
    }
  } catch (error) {
    console.warn('[AeroFocus] Poll error:', error);
  }
}

function startPolling() {
  if (pollIntervalId) {
    return;
  }

  void poll();
  pollIntervalId = setInterval(() => {
    void poll();
  }, POLL_INTERVAL_MS);
  console.log('[AeroFocus] Polling started');
}

chrome.runtime.onInstalled.addListener(startPolling);
chrome.runtime.onStartup.addListener(startPolling);

function handleBridgeMessage(message, sendResponse) {
  console.log('[AeroFocus] Message from web app:', message?.type);

  if (message?.type === 'SET_SESSION') {
    chrome.storage.local.set({ supabaseSession: message.payload }, () => {
      console.log('[AeroFocus] Session stored, starting poll immediately');
      startPolling();
      void poll();
      sendResponse({ ok: true });
    });
    return true;
  }

  if (message?.type === 'CLEAR_SESSION') {
    void chrome.storage.local.remove(['supabaseSession', 'activeFlight']);
    stopPolling();
    void clearAllRules();
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === 'CHECK_FLIGHT_EXPIRY') {
    void poll();
    sendResponse({ ok: true });
    return true;
  }

  sendResponse({ ok: false, reason: 'unknown message type' });
  return false;
}

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  return handleBridgeMessage(message, sendResponse);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.source !== 'WEB_PAGE_BRIDGE' && message?.type !== 'CLEAR_SESSION') {
    return false;
  }

  return handleBridgeMessage(message, sendResponse);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') {
    return;
  }

  if (changes.supabaseSession) {
    if (changes.supabaseSession.newValue) {
      console.log('[AeroFocus] Session written - starting poll immediately');
      startPolling();
      void poll();
    } else {
      console.log('[AeroFocus] Session cleared - stopping poll and clearing rules');
      stopPolling();
      void clearAllRules();
      void chrome.storage.local.remove('activeFlight');
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') {
    return;
  }

  const blockedUrl = chrome.runtime.getURL('blocked.html');
  if (!tab.url || !tab.url.startsWith(blockedUrl)) {
    return;
  }

  void chrome.storage.local
    .get(['supabaseSession', 'activeFlight'])
    .then(({ supabaseSession, activeFlight }) => {
      if (!supabaseSession?.access_token || !activeFlight?.id) {
        return;
      }

      void incrementDistractions(activeFlight.id, supabaseSession.access_token);
    });
});
