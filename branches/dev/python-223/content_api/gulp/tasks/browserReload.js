'use strict';

var gulp        = require('gulp'),
    browserSync = require('browser-sync');

gulp.task('browserReload', function() {
    browserSync.reload();
});