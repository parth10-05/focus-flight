# AeroFocus Mobile (apps/mobile)

## Prerequisites

- Node.js 20.x
- pnpm (workspace uses pnpm)
- Expo CLI
- EAS CLI
- Android Studio + Android SDK (platform-tools)

## Setup

1. Copy `.env.example` to `.env` inside `apps/mobile`.
2. Install dependencies from the repository root:

```bash
npx pnpm@10.28.0 install
```

## Local Development

Use one of the following workflows:

### Expo Go (limited)

```bash
npx expo start --go
```

- Fastest loop for JS/UI work.
- Native modules are limited in Expo Go.
- Features depending on custom native code (for example app blocker service) need a development build.

### Native run on physical Android device (full features)

```bash
npx expo run:android --device
```

- Full native capability.
- Installs and launches directly on a connected phone.
- Requires USB debugging enabled on the phone.

## Prebuild

Run prebuild after any native module or config-plugin change:

```bash
npx expo prebuild
```

## EAS Build

EAS profiles are defined in [eas.json](eas.json).

```bash
# Development client
npx eas build --platform android --profile development

# Internal preview
npx eas build --platform android --profile preview

# Production APK
npx eas build --platform android --profile production
```

### Install APK on phone

1. Run one of the Android EAS build commands above.
2. Open the build URL shown in terminal after build completion.
3. Download the `.apk` on the phone and install it.
4. If Android blocks install, allow install from unknown sources for your browser/files app, then retry.

This project is configured as Android-only.

## Platform Notes

### Android Accessibility Service

- Android app blocking uses an accessibility service and usage access permission.
- Users must manually enable required permissions in system settings.
- See module notes in [modules/app-blocker/ANDROID_MANIFEST_ADDITIONS.md](modules/app-blocker/ANDROID_MANIFEST_ADDITIONS.md).

## Known Limitations

- RLS is not yet enabled for current backend tables (inherits the same gap documented at repo level).
- `flights.user_id` filtering is not yet enabled in mobile realtime flight queries.
- Until ownership filters are in place, flight sync should be treated as non-final behavior for multi-user hardening.
