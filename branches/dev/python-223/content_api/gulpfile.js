/* global require:false __dirname:false */
'use strict';
process.env.DISABLE_NOTIFIER = true;

var gulp = require('gulp'),
    config = require('./gulp/config'),
    requireDir = require('require-dir');

requireDir('./gulp/tasks', { recurse: true });

/**
 * Default Tasks
 */

gulp.task('default', ['browserSync'], function() {
    gulp.watch(config.src.styles + '**/*.scss', ['styles']);
    gulp.watch([config.src.js + 'widget/**/*.js'], ['scripts', 'test']);
    gulp.watch([config.src.js + 'partner/**/*.js'], ['scripts:partner']);
    gulp.watch([config.src.js + 'json/**/*.js'], ['scripts:json']);
    gulp.watch([config.src.js + 'sharedGlobal/**/*.js'], ['scripts', 'scripts:json']);
    gulp.watch([config.test.path + '**/*.js'], ['test']);
    gulp.watch(config.src.path + '**/*.html', ['html', 'browserReload']);
    gulp.watch(['bower.json'], ['scripts:vendor']);
});
