var gulp = require('gulp'),
    bump  = require('gulp-bump'),
    argv = require('yargs').argv,
    fs = require('fs'),
    env = require('gulp-env'),
    config = require('../config');

gulp.task('bump', function(callback){
    var bumpVer;

    if(argv.version){
        bumpVer = { version: argv.version };
    } else {
        bumpVer = argv.type ? {type: argv.type} : {type:'patch'}
    }

    var stream = gulp.src([ config.root.path + 'bower.json', config.root.path + 'package.json'])
        .pipe(bump(
            bumpVer
        ))
        .pipe(gulp.dest('./'));

    stream.on('end', function() {

        callback(
            env({
                vars: {
                    contentApiVersion: JSON.parse(fs.readFileSync(config.root.path + 'package.json')).version
                }
            })
        );

    });
});