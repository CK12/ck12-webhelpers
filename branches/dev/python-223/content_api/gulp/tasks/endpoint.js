var gulp     = require('gulp'),
    fs       = require('fs'),
    config   = require('../config'),
    endpoint = require('../endpoints.config'),
    dest     = require('../utils/dest');

gulp.task('endpoint', function(cb) {
    var env = dest.isBuild() ? 'production' : 'development';

    fs.writeFile(config.src.js + 'endpoint.config.json', JSON.stringify(endpoint[env]), cb);
});
