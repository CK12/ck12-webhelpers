'use strict';

var gulp   = require('gulp'),
    karma  = require('karma');

var karmaTask = function(done) {
  karma.server.start({
    configFile: process.cwd() + '/karma.config.js',
    singleRun: true
  }, done);
};

gulp.task('test', karmaTask);

module.exports = karmaTask;