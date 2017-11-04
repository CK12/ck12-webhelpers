const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const promise = require('es6-promise');


module.exports = (function(options){
    options.isProduction = true;

    var webpackConfig = {
        devtool: 'source-map',
        entry: './jsx/main.jsx',
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'roster.js',
            libraryTarget: 'var',
            library: 'Roster'
        },

        module:{
            loaders: [
                {
                    test: /\.js(x)?$/,
                    loader: 'babel',
                    exclude:/node_modules/,
                    query: {
                        presets: ['es2015','react'],
                        plugins: ['transform-runtime'],
                        cacheDirectory:true
                    }
                }
            ]
        },
        externals:{
            'react': 'React'
        },
        resolve: {
            extensions: ['','.js','.jsx']
        }
    };

    if(options.isProduction){
        webpackConfig.module.loaders.push({
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract(['css','sass', 'autoprefixer'])
        });
        if(!webpackConfig.plugins){
            webpackConfig.plugins = [];
        }
        webpackConfig.plugins.push(
            new ExtractTextPlugin('css/roster.css',{
                allChunk: true
            })
        );
        webpackConfig.plugins.push(
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('production')
                }
            })
        );
    }else{
        webpackConfig.module.loaders.push({
            test: /\.scss$/,
            loader:'style!css!autoprefixer!sass'
        });
    }

    return webpackConfig;
})({});
