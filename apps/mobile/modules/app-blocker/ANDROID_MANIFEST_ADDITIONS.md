# AndroidManifest.xml Additions for AppBlocker Module

Add the following entries manually in your AndroidManifest.xml.

## Permissions

```xml
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
<uses-permission
  android:name="android.permission.PACKAGE_USAGE_STATS"
  tools:ignore="ProtectedPermissions" />
```

## Accessibility Service Declaration

```xml
<service
  android:name="com.aerofocus.appblocker.AppBlockerAccessibilityService"
  android:enabled="true"
  android:exported="false"
  android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
  <intent-filter>
    <action android:name="android.accessibilityservice.AccessibilityService" />
  </intent-filter>
  <meta-data
    android:name="android.accessibilityservice"
    android:resource="@xml/accessibility_service_config" />
</service>
```

## Blocked Activity Declaration

```xml
<activity
  android:name="com.aerofocus.appblocker.BlockedActivity"
  android:exported="false"
  android:excludeFromRecents="true"
  android:theme="@style/Theme.AppCompat.NoActionBar" />
```

## Important Notes

- Ensure your app's package and source set wiring can resolve the classes above.
- Class paths may need adjustment based on your final module packaging approach.
- Add `xmlns:tools="http://schemas.android.com/tools"` to the `<manifest>` tag if not already present.
