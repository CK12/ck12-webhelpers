'use strict';

var gulp = require('gulp'),
    fs = require('fs');

gulp.task('updateApache', function(){
    var appsPath      = '/opt/2.0/deploy/components/apache2/apps/08_content_api',
        apps1404Path  = '/opt/2.0/deploy/components/apache2/apps_1404/08_content_api';

    var appsFile      = fs.readFileSync(appsPath, 'utf-8'),
        apps1404File  = fs.readFileSync(apps1404Path, 'utf-8');

    appsFile     = appsFile.replace(/\d{1,2}\.\d{1,2}\.\d{1,2}/g, process.env.contentApiVersion);
    apps1404File = apps1404File.replace(/\d{1,2}\.\d{1,2}\.\d{1,2}/g, process.env.contentApiVersion);

    fs.writeFileSync(appsPath, appsFile, 'utf-8');
    fs.writeFileSync(apps1404Path, apps1404File, 'utf-8');

    console.log('Apache configs updated to ', process.env.contentApiVersion);
});
