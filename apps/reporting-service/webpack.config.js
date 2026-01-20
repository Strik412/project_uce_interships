const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');

module.exports = composePlugins(withNx(), (config) => {
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    '@app/shared': path.resolve(__dirname, '../../libs/shared/src'),
    '@shared': path.resolve(__dirname, '../../libs/shared')
  };
  return config;
});
