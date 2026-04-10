import { Platform } from "react-native";

import AppBlocker from "../modules/app-blocker";

const ANDROID_PACKAGE_LOOKUP: Record<string, string> = {
  youtube: "com.google.android.youtube",
  "youtube.com": "com.google.android.youtube",
  instagram: "com.instagram.android",
  "instagram.com": "com.instagram.android",
  tiktok: "com.zhiliaoapp.musically",
  "tiktok.com": "com.zhiliaoapp.musically",
  twitter: "com.twitter.android",
  "twitter.com": "com.twitter.android",
  x: "com.twitter.android",
  "x.com": "com.twitter.android",
  reddit: "com.reddit.frontpage",
  "reddit.com": "com.reddit.frontpage",
  facebook: "com.facebook.katana",
  "facebook.com": "com.facebook.katana"
};

function normalizeEntry(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function resolveAndroidPackages(domains: string[]): string[] {
  const resolved = domains.flatMap((raw) => {
    const normalized = normalizeEntry(raw);
    if (!normalized) {
      return [];
    }

    const mapped = ANDROID_PACKAGE_LOOKUP[normalized];
    if (mapped) {
      return [mapped];
    }

    const hostOnly = normalized.split("/")[0];
    const hostMapped = ANDROID_PACKAGE_LOOKUP[hostOnly];
    if (hostMapped) {
      return [hostMapped];
    }

    return [raw.trim()];
  });

  return Array.from(new Set(resolved.filter((value) => value.length > 0)));
}

export async function ensurePermission(): Promise<boolean> {
  const hasPermission = await AppBlocker.hasPermission();
  if (hasPermission) {
    return true;
  }

  return AppBlocker.requestPermission();
}

export async function activateBlocking(domains: string[]): Promise<void> {
  const cleaned = domains.map((entry) => entry.trim()).filter((entry) => entry.length > 0);

  if (Platform.OS === "ios") {
    await AppBlocker.startBlocking(cleaned);
    return;
  }

  const resolvedList = resolveAndroidPackages(cleaned);
  await AppBlocker.startBlocking(resolvedList);
}

export async function deactivateBlocking(): Promise<void> {
  await AppBlocker.stopBlocking();
}
