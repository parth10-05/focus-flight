const { AndroidConfig, withAndroidManifest, withInfoPlist } = require("@expo/config-plugins");

function withNotifications(config) {
  const withIos = withInfoPlist(config, (configResult) => {
    if (!configResult.modResults.NSUserNotificationUsageDescription) {
      configResult.modResults.NSUserNotificationUsageDescription =
        "AeroFocus uses notifications to remind you before a mission ends.";
    }
    return configResult;
  });

  return withAndroidManifest(withIos, (configResult) => {
    const manifest = configResult.modResults;
    AndroidConfig.Permissions.addPermission(manifest, "android.permission.POST_NOTIFICATIONS");
    return configResult;
  });
}

module.exports = withNotifications;
