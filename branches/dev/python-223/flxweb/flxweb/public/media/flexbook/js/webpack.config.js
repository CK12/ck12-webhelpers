//const path = require('path');
const webpack = require('webpack');
const merge   = require('lodash/merge');

const isDevelopment = process.env.NODE_ENV === 'development';

var query = {
  bypassOnDebug: true,
  optipng: {
    optimizationLevel: 7
  },
  gifsicle: {
    interlaced: true
  }
};

var config = {
  bail: !isDevelopment,
  context: __dirname + '',
  entry: {
    flexbook: ['./flexbook']
  },
  output: {
    path: __dirname + '/dist',
    filename: 'flexbook.js',
    libraryTarget: 'var',
    library: 'FlexBook'
  },
  //debug: true,
  devtool: 'source-map',
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // })
  ],
  module: {
    loaders: [
      { test: /\.js[x]?$/,
        exclude: /node_modules/,
        loaders: [
          'react-hot-loader/webpack',
          'babel-loader?cacheDirectory'
        ]
      },
      {
        test: /\.(svg|ttf|woff|)$/,
        loader: 'url-loader?limit=8192'
      },
      // {
      //   test: /\.(jpe?g|png|gif|svg)$/i,
      //   loaders: [
      //     'file?hash=sha512&digest=hex&name=[hash].[ext]',
      //     `image-webpack?${JSON.stringify(query)}`
      //   ]
      // },
      {
        test: /\.(png|jpg|jpeg|gif)(\?.*)?$/,
        loaders: [
          'file',
          'image-webpack?' + JSON.stringify({
            bypassOnDebug:true,
            progressive: true,
            optipng: {
              optimizationLevel: 7
            },
            gifsicle: {
              interlaced: true
            },
            pngquant: {
              quality: '65-90',
              speed: 4
            },
            svgo: {
              removeUnknownsAndDefaults: false,
              cleanupIDs: false
            }
          })
        ]
      },
    ]
  },
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/book\/.*$/, to: '/index.html' },
        { from: /^\/user:.*$/, to: '/index.html' }
      ]
    }
  }
};


if(isDevelopment){
  config.devtool           = 'source-map';
  config.output.pathinfo   = true;
  config.output.publicPath = 'http://localhost:8080/'; // Fix font decoding: http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809

  // Only use dev config when not building
  try {
    // Override config with dev settings
    var devConfig = require('./dev.webpack.config.js');
    config = merge({}, config, {module: {loaders: null}},  devConfig);
  } catch(e){
    //theres no dev configuration do nothing
  }

} else {
  // Only generate sourcemaps for localized CSS modules and main dashboard app
  config.plugins.push(
    // new webpack.SourceMapDevToolPlugin({
    //   filename: '[file].map',
    //   exclude: [
    //     'vendor.js',
    //     /fonts\.(css|js)$/,
    //     /globals\.(css|js)$/,
    //     /lib\.(css|js)$/
    //   ]
    // })
  );

  // Note: by default, React will be in development mode.
  // To use React in production mode, set the environment variable NODE_ENV to production
  // This also removes minified warning from redux
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  );
}

module.exports = config;
