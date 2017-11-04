const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');

const isDevelopment = process.env.NODE_ENV === 'development';

var config = {
    devtool: 'source-map',
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'standardSelections.js',
        libraryTarget: 'var',
        library: 'StandardSelections'
    },

    module:{
        loaders: [
            {
                test: /\.js(x)?$/,
                loader: 'babel',
                exclude:/node_modules/,
                query: {
                    presets: ['es2015','react'],
                    plugins: ['transform-runtime', 'transform-object-rest-spread'],
                    cacheDirectory:true
                }
            }, //babel
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(['css','sass', 'postcss'])
            } // extract css
        ]
    },
    plugins: [
        new ExtractTextPlugin('css/standardSelections.css',{
            allChunk: true
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(isDevelopment?'development': 'production')
            }
        })

    ],
    postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ],
    externals:{
        'react': 'React'
    },
    resolve: {
        extensions: ['','.js','.jsx']
    }
};

module.exports = config;
