const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/',
  },
};
