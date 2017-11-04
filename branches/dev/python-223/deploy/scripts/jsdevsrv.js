var webpack = require('webpack');
var webpackDevServer = require('webpack-dev-server');
var commandLineArgs = require('command-line-args');
var opn = require('opn');


var cli = commandLineArgs([
  {name: 'module', alias: 'm', type: String, defaultOption: true},
  {name: 'backendServer', alias: 's', 'type': String, defaultValue: 'frodo'},
  {name: 'port', alias: 'p', type: Number, defaultValue: 8080}
]);

var options = cli.parse();

if (options.module){
    var port = '' + options.port;
    //get the webpack configuration
    //TODO: figure out a better way to require the config
    var config = require('../../flxweb/flxweb/public/media/' + options.module + '/js/webpack.config.js');

    //proxy setup
    //TODO: figure out a way to somehow include this in webpack config
    var backend = 'https://' + options.backendServer + '.ck12.org';
    var proxyConfig = ['flx','auth','dexter','assessment','peerhelp','taxonomy']
        .map(function(path){ return '/' + path + '*'; })
        .reduce(function(memo, path){
            memo[ path ] = {target: backend, secure: false};
            memo[ '/api/' + path ] = {target: backend, secure: false};
            return memo;
        }, {});

    proxyConfig['/media*.hot-update.js*'] = {
        target: 'http://localhost:' + port,
        rewrite: function(req){
            console.log(req.url);
            req.url = req.url.replace('/media/' + options.module +'/', '');
        }
    };
    //Configure hot module replacement
    //add HotModuleReplacementPlugin
    if (!config.plugins){
        config.plugins = [];
    }
    config.plugins.push(new webpack.HotModuleReplacementPlugin());

    //add inline mode support for all entries
    //TODO: handle case where there's only a single entry
    var entries = Object.keys(config.entry);
    entries.forEach(function(entry){
        config.entry[entry].unshift(
          'webpack-dev-server/client?http://localhost:'+ port +'/',
          'webpack/hot/only-dev-server'
        );
    });

    var compiler = webpack(config);
    var server = new webpackDevServer(compiler, {
        contentBase: './flxweb/flxweb/public',
        stats: { colors: true },
        proxy: proxyConfig,
        hot: true
    });
    server.listen(port);
    opn('http://localhost:'+ port +'/media/' + options.module + '/');
} else {
    console.log('Please specify the name of the module');
    console.log(cli.getUsage());
}
