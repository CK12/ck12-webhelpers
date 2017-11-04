'use strict';

var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    config = require('../config'),
    notifier = require('../utils/notifier'),
    packages = require('../utils/packages'),
    plumber = require('gulp-plumber'),
    browserify = require('browserify'),
    browserSync = require('browser-sync'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    gutil = require('gulp-util'),
    to5ify = require('6to5ify'),
    sourcemaps = require('gulp-sourcemaps'),
    dest     = require('../utils/dest'),
    uglify = require('gulp-uglify');

gulp.task('scripts:json', function() {
    var shims = packages.browserifyShims(),
        isNotBuild = !dest.isBuild(),
        bundler = browserify([config.src.js + 'json/json.js'], {
                    basedir: config.src.js  + 'json/',
                    debug: isNotBuild
                }).transform('browserify-shim');

    for (var lib in shims) {
        if (shims.hasOwnProperty(lib) && lib === 'oboe') {
            bundler.require(lib);
        }
    }

    bundler
        .transform(to5ify)
        .bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe( plumber(notifier.error()) )
        .pipe(source('json.js'))
        .pipe(buffer())
        .pipe( gulpif(isNotBuild, sourcemaps.init({loadMaps: true}) ))
        .pipe(uglify())
        .pipe( gulpif(isNotBuild,sourcemaps.write('./')) )
        .pipe(gulp.dest( dest.get('js') ))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(notifier.success('Json done.'));
});
