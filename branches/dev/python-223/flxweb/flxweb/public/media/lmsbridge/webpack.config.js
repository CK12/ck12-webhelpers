var path = require('path');
var webpack = require('webpack');

module.exports = {
  context: path.resolve(__dirname,'.'),
  entry: {
    ltiBridge:['./src/ltiBridge.js'],
    lmsBridge:['./src/lmsBridge.js']
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'CK12LmsBridge',
    libraryTarget:'umd'
  },
  resolve: {
    modules: ['lmstest','node_modules'],
    alias: {
      modalView: path.resolve(__dirname,'../common/js/views/modal.view.js'),
      lmsBridge: path.resolve(__dirname,'./src/lmsBridge'),
      urlHelper: path.resolve(__dirname,'../common/js/utils/url.js'),
      embedHelper: path.resolve(__dirname,'../embed/js/utils/embed.helper.js'),
      common: path.resolve(__dirname,'../common/js')
    }
  },
    resolveLoader:{
        alias: {
	    // Support text! for modal view
	    'text': path.resolve(__dirname,'./node_modules/text-loader')
        }
   },
  externals: {
    "jquery": {
      amd: "jquery",
      root: "jquery"
    },
    "backbone": {
      amd: "backbone",
      root: "backbone"
    },
    "underscore": {
      amd: "underscore",
      root: "underscore"
    }
  },
  module:{
    rules: [{
        test: /\.js$/,
	include: path.resolve(__dirname,'./src'),
        exclude: /(node_modules|test|common|practiceapp|lib|embed)/,
        use: {
          loader: 'babel-loader',
          options:{
            babelrc: false,
            plugins: ['transform-runtime','add-module-exports'],
            presets: [
                require.resolve('babel-preset-env')
            ]
          }
        }
      }]
  },
  stats: {
    colors: true
  }
};
