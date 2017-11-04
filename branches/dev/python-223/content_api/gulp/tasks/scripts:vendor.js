'use strict';

var gulp = require('gulp'),
    config = require('../config'),
    notifier = require('../utils/notifier'),
    packages = require('../utils/packages'),
    plumber = require('gulp-plumber'),
    browserify = require('browserify'),
    bowerResolve = require('bower-resolve'),
    source = require('vinyl-source-stream'),
    streamify  = require('gulp-streamify'),
    gutil = require('gulp-util'),
    dest     = require('../utils/dest'),
    uglify = require('gulp-uglify');

gulp.task('scripts:vendor', function() {
    var shims = packages.browserifyShims(),
        bundler = browserify().transform('browserify-shim');

    for (var lib in shims) {
        if (shims.hasOwnProperty(lib)) {
            bundler.require(lib);
        }
    }

    bundler.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(plumber(notifier.error()))
        .pipe(source('vendor.js'))
        // .pipe(gulp.dest(config.src.scripts))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest( dest.get('js') ))
        .pipe(notifier.success('Vendor scripts done.'));
});