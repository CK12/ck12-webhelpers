var gulp = require('gulp'),
    env = require('gulp-env'),
    argv = require('yargs').argv,
    config = require('../config'),
    runSequence = require('run-sequence'),
    notifier = require('../utils/notifier'),
    packages = require('../utils/packages'),
    plumber = require('gulp-plumber');

gulp.task('build', function(){
    runSequence(
        'clear',
        'bump',
        'updateApache',
        'endpoint',
        'sprites',
        ['html', 'styles', 'images'],
        ['scripts', 'scripts:vendor', 'scripts:partner', 'scripts:json']
    );
});

