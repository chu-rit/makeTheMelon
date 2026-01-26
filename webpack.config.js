const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Disable static rendering
  config.resolve.alias = {
    ...config.resolve.alias,
    'expo-router': false,
  };
  
  return config;
};
