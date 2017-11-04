var config = require('./webpack.config');

config.entry = {
    /*'usage': './src/usage',*/
    'initializer': './src/initializer'
};

config.output= {
    path: __dirname + '/dist',
    filename: '[name].js',
    libraryTarget: 'umd'
};

config.externals = null;

module.exports = config;
