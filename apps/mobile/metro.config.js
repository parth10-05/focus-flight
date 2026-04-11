const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const pnpmStoreRoot = path.resolve('C:/p/vs');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot, pnpmStoreRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
