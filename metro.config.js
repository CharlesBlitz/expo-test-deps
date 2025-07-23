const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo Go optimizations for SDK 53
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg');

// Optimized for Expo Go performance
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enhanced resolver platforms for SDK 53
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// New Arch support
config.resolver.unstable_enablePackageExports = true;

module.exports = config;