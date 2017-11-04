var webpack = require('webpack');

var externals = /^[^.]/;
var filename = 'ck12-practice-widget.js';


if (process.argv.indexOf('--includeDeps') !== -1) {
    externals = null;
    filename = 'ck12-practice-widget-withdeps.js';
}

module.exports = {
    entry: {
        'ck12-practice-widget': ['./src/initializer']
    },
    output: {
        path: __dirname + '/dist',
        filename: filename,
        libraryTarget: 'umd',
        pathInfo: true,
        publicPath: 'http://localhost:8080/'
    },
    externals: externals,
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ],
    devtool: 'source-map',
    module: {
        loaders: [{
            test: /\.js[x]?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'react'],
                plugins: ['transform-runtime']
            }
        },
        {
            test: /\.css$/,
            loaders: ['style', 'css'],
            include: __dirname + '/src/css'
        }, 
        {
	        test: /\.(png|jpg|)$/,
	        loader: 'url-loader?limit=100000'
        }]
    }
};
