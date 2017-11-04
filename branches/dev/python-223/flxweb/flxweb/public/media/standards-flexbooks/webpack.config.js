/* global process, module, __dirname */
var webpack = require('webpack');
var path = require('path');
var externals = /^[^.]/;
var filename = 'standards-flexbooks.js';


if (process.argv.indexOf('--includeDeps') !== -1) {
    externals = null;
    filename = 'standards-flexbooks-withdeps.js';
}

module.exports = {
    entry: {
        'standards-flexbooks': ['./src/css/standards-flexbooks.css', './src/initializer']
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js',
        libraryTarget: 'var',
        library: 'StandardsFlexbooks',
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
            include: path.join(__dirname,'/src/css')
        },
        {
            test: /\.(png|jpg|)$/,
            loader: 'url-loader?limit=120000'
        },
        {
            test:/\.(png|jpg|)$/,
            loader: 'image-webpack-loader',
            options:{
                optipng: {
                    optimizationLevel: 7
                },
                pngquant: {
                    quality: '65-90',
                    speed: 4
                }
            }
        }]
    }
};
