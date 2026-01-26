const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Completely disable expo-router
config.resolver.alias = {
  'expo-router': false,
};

module.exports = config;
