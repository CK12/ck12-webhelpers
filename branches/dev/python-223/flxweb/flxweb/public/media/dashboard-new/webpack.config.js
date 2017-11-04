const webpack = require('webpack');
const path    = require('path');
const merge   = require('lodash/merge');

const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';

var config = {
    bail: !isDevelopment, // Do not tolerate errors on production https://webpack.github.io/docs/configuration.html#bail
    resolve: {
        // Set alias to run relative to root
        root: path.resolve(__dirname),

        // Set alias for commonly used paths
        alias: {
            // Styles
            scss: 'scss',
            media: path.resolve(__dirname, '..'),
            // Javascript
            actions: 'js/actions',
            components: 'js/components',
            containers: 'js/containers',
            externals: 'js/externals',
            reducers: 'js/reducers',
            routes: 'js/routes',
            selectors: 'js/selectors',
            services: 'js/services',
            sources: 'js/sources',
            store: 'js/store',
            utils: 'js/utils',
            // Fonts
            fonts: 'fonts',
            // Images
            images: 'images'
        },

        // Valid extensions
        extensions: ['', '.js', '.jsx', '.scss']
    },
    context: path.resolve(__dirname),

    // Main entry point for app
    entry: {
        dashboard: [
            './js/dashboard'
        ],
        vendor: [
            'react',
            'react-dom',
            'react-router',
            'react-router-redux',
            'react-onclickoutside',
            'redux',
            'redux-form',
            'redux-immutable-state-invariant',
            'moment',
            'ck12-ajax'
            // Don't add lodash as a vendor. Babel extracts only the used lodash methods to keep file size down
        ],
        fonts: [
            './fonts/font.scss'
        ],
        globals: [
            './scss/globals/globals.scss'
        ],
        lib: [
            './scss/lib/ui-kit-dashboard.lib.scss',
            './scss/lib/foundation.lib.scss'
        ]
    },

    // Output bundle to /dist
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        chunkFilename: '[id].js'
    },

    // Plugins
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new ExtractTextPlugin('[name].css'),
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')
    ],

    // Modules used for compiling code on the fly
    module: {
        loaders: [
            {
                test: /\.js[x]?$/,
                exclude: /node_modules/,
                loaders: [
                    'react-hot',
                    'babel-loader' +
                        '?presets[]=es2015,presets[]=react' +
                        ',plugins[]=transform-decorators-legacy' +
                        ',plugins[]=transform-object-rest-spread' +
                        ',plugins[]=lodash'
                ]
            },

            // For stylesheets ---
            // 1. Load in sass file with sourcemaps
            // 2. Resolve relative paths in url() statements
            // 3. Run it through PostCSS (See postcss method for plugins used)
            // 4. Run through CSS loader with module support
            // 5. Use style loader to put in DOM
            {
                test: /\.scss$/,
                exclude: /(\.lib|globals|font)\.scss$/, // Exclude lib, globals, and font files
                loader: ExtractTextPlugin.extract('style', [
                    'css?modules&importLoaders=1&sourceMap&localIdentName=[path][name]__[local]___[hash:base64:5]', // modules to use as CSS modules - importLoaders is for postcss
                    'postcss',
                    'resolve-url',
                    'sass?sourceMap'
                ].join('!'))
            },
            {
                 // For importing libraries we do not want to use CSS modules
                 // as they will be locally scoped by default
                test: /(\.lib|globals|font)\.scss$/,
                loader: ExtractTextPlugin.extract('style', [
                    'css',
                    'postcss',
                    'resolve-url',
                    'sass'
                ].join('!'))
            },
            {
                test: /.*\.(gif|png|jpe?g|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack'
                ]
            },
            // Font Definition
            {
                test: /dashboard\.(eot|svg|ttf|woff|woff2)\?.*$/,
                loader: 'file?name=fonts/[name].[ext]'
            }
        ]
    },
    postcss: function () {
        return [autoprefixer({ browsers: ['last 2 versions'] })];
    },
    imageWebpackLoader: {
        pngquant: {
            quality: '65-90',
            speed: 4
        },
        svgo: {
            plugins: [{
                removeViewBox: false
            }, {
                removeEmptyAttrs: false
            }]
        }
    }
};

// For creating source maps
if(isDevelopment){
    config.devtool           = 'eval';
    config.output.pathinfo   = true;
    config.output.publicPath = 'http://localhost:8080/'; // Fix font decoding: http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809

    // Only use dev config when not building
    try {
        // Override config with dev settings
        var devConfig = require('./dev.webpack.config.js');
        config = merge({}, config, {module: {loaders: null}},  devConfig);
    } catch(e){}

} else {
    // Only generate sourcemaps for localized CSS modules and main dashboard app
    config.plugins.push(
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map',
            exclude: [
                'vendor.js',
                /fonts\.(css|js)$/,
                /globals\.(css|js)$/,
                /lib\.(css|js)$/
            ]
        })
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