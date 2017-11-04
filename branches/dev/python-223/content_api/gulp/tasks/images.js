'use strict';

var gulp     = require('gulp'),
    config   = require('../config'),
    notifier = require('../utils/notifier'),
    imagemin = require('gulp-imagemin'),
    dest     = require('../utils/dest'),
    cache    = require('gulp-cache');

gulp.task('images', function() {
    gulp.src(config.src.images + '*.{png,jpg,gif}')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest( dest.get('images') ))
        .pipe(notifier.success('Images done.'));
});
