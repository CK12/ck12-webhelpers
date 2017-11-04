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

gulp.task('scripts:partner', function() {
    var externals = [],
        isNotBuild = !dest.isBuild();

    packages.bower().forEach(function (lib) {
        externals.push(lib);
    });

  browserify([config.src.js + 'partner/partner.js'], {
        basedir: config.src.js  + 'partner/',
        debug: isNotBuild
    })
    .external(externals)
    .transform(to5ify)
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe( plumber(notifier.error()) )
    .pipe(source('partner.js'))
    .pipe(buffer())
    .pipe( gulpif(isNotBuild, sourcemaps.init({loadMaps: true})) )
    .pipe(uglify())
    .pipe( gulpif(isNotBuild,sourcemaps.write('./')) )
    .pipe(gulp.dest( dest.get('js') ))
    .pipe(browserSync.reload({
        stream: true
    }))
    .pipe(notifier.success('Scripts done.'));
});
