# AeroFocus Mobile (apps/mobile)

## Prerequisites

- Node.js 20.x
- pnpm (workspace uses pnpm)
- Expo CLI
- EAS CLI

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

### Native run (full features)

```bash
npx expo run:ios
npx expo run:android
```

- Full native capability.
- Requires native project generation via prebuild.

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
npx eas build --platform ios --profile development

# Internal preview
npx eas build --platform android --profile preview
npx eas build --platform ios --profile preview

# Store-ready production
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

## Platform Notes

### iOS FamilyControls

- App/category blocking on iOS requires FamilyControls-related entitlements.
- Entitlements require Apple approval and can take time.
- Plan for a fallback UX while approval is pending.

### Android Accessibility Service

- Android app blocking uses an accessibility service and usage access permission.
- Users must manually enable required permissions in system settings.
- See module notes in [modules/app-blocker/ANDROID_MANIFEST_ADDITIONS.md](modules/app-blocker/ANDROID_MANIFEST_ADDITIONS.md).

## Known Limitations

- RLS is not yet enabled for current backend tables (inherits the same gap documented at repo level).
- `flights.user_id` filtering is not yet enabled in mobile realtime flight queries.
- Until ownership filters are in place, flight sync should be treated as non-final behavior for multi-user hardening.
