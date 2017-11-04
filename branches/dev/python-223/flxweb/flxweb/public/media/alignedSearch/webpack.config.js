var path  =  require('path');
var webpack  =  require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var DEV  =  process.env.NODE_ENV !== 'production';
var BUILD_GLOBALS =  {
  '__DEV__':DEV,
  'process.env.NODE_ENV' : JSON.stringify(process.env.NODE_ENV || 'development')
};

module.exports =  {
	context: __dirname,
	entry  : {
	  app : './init',
	  vendor : ['react', 'react-dom', 'react-redux', 'react-router',
	'react-router-redux', 'redux','redux-logger', 'history', 'react-slick']
	},
	output : {
	  path : __dirname + '/dist',
	  filename : 'alignedSearch.js',
	  publicPath: '/dist',
	  libraryTarget : 'umd'
	},
	resolve: {
	  extensions: ['', '.json', '.webpack.js', '.js', '.jsx']
	},
	module:{
	  loaders : [
	    {
	      test : /\.jsx?$/,
	      exclude : /node_modules/,
	      loaders:  ['babel-loader']
	    },
	    {
        test : /\.css$/,
        exclude : /node_modules/,
        loader:   ExtractTextPlugin.extract('css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'),
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg|gif)$/,
        loader: 'url-loader?limit=100000'
      }
	],
	preLoaders : (DEV ?[
      {
        test : /\.jsx?$/,
        exclude : /node_modules/,
        loaders : []
      }
]: [])
	},
	plugins: [
	  new webpack.optimize.OccurenceOrderPlugin(),
	  new webpack.DefinePlugin(BUILD_GLOBALS),
	  new ExtractTextPlugin('styles.css'),
	  new webpack.optimize.CommonsChunkPlugin('vendor','vendor.bundle.js')
	].concat(DEV ? [
	] :
	  [
	  new webpack.optimize.DedupePlugin(),
	  new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
	  new webpack.optimize.AggressiveMergingPlugin()
	]),
	devtool: DEV ? '#inline-source-map' : false,
  cache: DEV

};
