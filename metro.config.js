
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolver o problema do WASM no web
config.resolver.assetExts.push('wasm');

module.exports = config;
