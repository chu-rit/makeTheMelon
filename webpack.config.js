const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Disable static rendering
  config.resolve.alias = {
    ...config.resolve.alias,
    'expo-router': false,
  };
  
  // _expo 폴더 없이 바로 빌드되도록 설정
  config.output.publicPath = '';
  config.output.path = config.output.path.replace('/_expo', '');
  
  return config;
};
