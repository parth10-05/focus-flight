const { AndroidConfig, withAndroidManifest } = require("@expo/config-plugins");

function withNotifications(config) {
  return withAndroidManifest(config, (configResult) => {
    const manifest = configResult.modResults;
    AndroidConfig.Permissions.addPermission(manifest, "android.permission.POST_NOTIFICATIONS");
    return configResult;
  });
}

module.exports = withNotifications;
