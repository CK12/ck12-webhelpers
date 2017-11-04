'use strict';

var gulp     = require('gulp'),
    replace  = require('gulp-replace'),
    config   = require('../config'),
    dest     = require('../utils/dest');

gulp.task('html', function() {
    if(dest.isBuild()){
        gulp.src(config.src.path + '/widget.html')
            // replace google tag manager
            .pipe(replace(/GTM-WVB47G/g, 'GTM-NFJ3V2'))
            .pipe(gulp.dest( dest.get() ));

        gulp.src(config.src.path + '/demo.html')
            .pipe(gulp.dest( dest.get() ));
    } else {
        gulp.src(config.src.path + '/*.html')
            .pipe(gulp.dest(config.dist.path));
    }
});