const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

console.log('dev js');
module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
});
