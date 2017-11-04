var gulp = require('gulp'),
    cache = require('gulp-cache');

gulp.task('clear', function (done) {
  return cache.clearAll(done);
});