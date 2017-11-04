
var gulp     = require('gulp'),
    config   = require('../config'),
    notifier = require('../utils/notifier'),
    sprity   = require('sprity'),
    imagemin = require('gulp-imagemin'),
    dest     = require('../utils/dest'),
    gulpif = require('gulp-if');


gulp.task('sprites', function (cb) {
  return sprity.src({
            src: config.src.images + 'sprites/*.{png,jpg}',
            name: 'sprites',
            style: config.src.styles + '_sprites-config.scss',
            cssPath: '../images',
            processor: 'sass',
            margin: 0
    })
    .pipe(imagemin())
    .pipe(gulpif('*.png', gulp.dest(dest.get('images')) ))
    .pipe(gulpif('*.scss', gulp.dest(config.src.styles) ));
});