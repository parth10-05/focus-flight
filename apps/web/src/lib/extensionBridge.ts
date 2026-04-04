export const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID ?? "";

declare const chrome: {
  runtime?: {
    sendMessage?: (
      extensionId: string,
      message: Record<string, unknown>,
      callback?: (response?: unknown) => void
    ) => void;
    lastError?: { message?: string };
  };
};

export function sendToExtension(message: Record<string, unknown>): void {
  let sentViaRuntime = false;

  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage && EXTENSION_ID) {
    sentViaRuntime = true;
    chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
      if (chrome.runtime?.lastError) {
        console.warn("[AeroFocus] Extension msg failed:", chrome.runtime.lastError.message);
        return;
      }

      console.log("[AeroFocus] Extension response:", response);
    });
  }

  // Fallback for normal web-page context via extension content script relay.
  window.postMessage(
    {
      source: "AEROFOCUS_WEB_BRIDGE",
      type: message.type,
      payload: message.payload
    },
    window.location.origin
  );

  if (!sentViaRuntime) {
    console.log("[AeroFocus] Sent message via window bridge fallback");
  }
}
