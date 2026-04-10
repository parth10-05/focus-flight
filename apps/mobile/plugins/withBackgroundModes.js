const { withInfoPlist } = require("@expo/config-plugins");

function withBackgroundModes(config) {
  // iOS requires UIBackgroundModes fetch; Android needs no plugin changes here.
  return withInfoPlist(config, (configResult) => {
    const existing = configResult.modResults.UIBackgroundModes || [];
    const list = Array.isArray(existing) ? existing : [existing];

    if (!list.includes("fetch")) {
      list.push("fetch");
    }

    configResult.modResults.UIBackgroundModes = list;
    return configResult;
  });
}

module.exports = withBackgroundModes;
