var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, './build');
var APP_DIR = path.resolve(__dirname, './src');

const config = {
   mode: "development",
   entry: {
     main: APP_DIR + '/index.js'
   },
   output: {
     filename: 'bundle.js',
     path: BUILD_DIR,
   },
   module: {
    rules: [
     {
       test: /\.(js)?$/,
       exclude: /node_modules/,
       use: [{
         loader: "babel-loader",
         options: {
           cacheDirectory: true,
           presets: ['env'] // Transpiles ES2015+
         }
       }]
     }
    ],
  }
};

module.exports = config;