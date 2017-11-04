'use strict';

var gulp         = require('gulp'),
    gulpif       = require('gulp-if'),
    config       = require('../config'),
    notifier     = require('../utils/notifier'),
    browserSync  = require('browser-sync'),
    plumber      = require('gulp-plumber'),
    sass         = require('gulp-sass'),
    dest         = require('../utils/dest'),
    minifyCss    = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer');

gulp.task('styles', function() {
    var isBuild = dest.isBuild();

    gulp.src([config.src.styles + '**/*.scss'])
        .pipe(plumber(notifier.error()))
        .pipe(sass())
        .pipe(autoprefixer('last 2 versions'))
        .pipe( gulpif(isBuild, minifyCss()) )
        .pipe(gulp.dest( dest.get('styles') ))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(notifier.success('Styles done.'));
});