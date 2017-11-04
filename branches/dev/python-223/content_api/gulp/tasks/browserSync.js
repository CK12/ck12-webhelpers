'use strict';

var gulp        = require('gulp'),
    config      = require('../config'),
    browserSync = require('browser-sync');

gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: config.dist.path
        }
    });
});