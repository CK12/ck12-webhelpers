var grunt = require('grunt');

grunt.initConfig({
    watch: {
        files: ['scss/**/*.scss', 'js/plugins/**/*.scss'],
        tasks: ['sass', 'postcss'],
        options: {
            livereload: true
        }
    },
    sass: {
        options: {
            sourceMap: true
        },
        dist: {
            files: {
                'css/annotator.css': 'scss/main.scss'
            }
        }
    },
    postcss: {
        options: {
            map: {
                inline: false,
                annotation: 'css/'
            },

            processors: [
                require('autoprefixer')({browsers: 'last 2 versions'}),
                require('cssnano')({ zindex: false })
            ]
        },
        dist: {
            src: 'css/annotator.css'
        }
    },
    uglify: {
        annotator: {
            options:{
                beautify: true,
                mangle: false,
                enclose: {
                    'window': 'window'
                },
                sourceMap: true
            },
            files: {
                '../lib/annotator/annotator.lib.js': [
                    // --- Main --- node_modules/annotator/dev.html used for load order
                    'node_modules/annotator/lib/util.js',
                    'node_modules/annotator/lib/console.js',
                    'node_modules/annotator/lib/class.js',
                    'node_modules/annotator/lib/range.js',
                    'node_modules/annotator/lib/annotator.js',
                    'node_modules/annotator/lib/widget.js',
                    'node_modules/annotator/lib/editor.js',
                    'node_modules/annotator/lib/viewer.js',
                    'node_modules/annotator/lib/notification.js',
                    'node_modules/annotator/lib/xpath.js',

                    // --- Native Plugins --- node_modules/annotator/dev.html used for load order
                    'node_modules/annotator/lib/plugin/store.js',
                    // 'node_modules/annotator/lib/plugin/permissions.js',
                    // 'node_modules/annotator/lib/plugin/annotateitpermissions.js',
                    // 'node_modules/annotator/lib/plugin/auth.js',
                    // 'node_modules/annotator/lib/plugin/tags.js',
                    // 'node_modules/annotator/lib/plugin/unsupported.js',
                    // 'node_modules/annotator/lib/plugin/filter.js',
                    // 'node_modules/annotator/lib/plugin/markdown.js',
                    // 'node_modules/annotator/lib/plugin/kitchensink.js'
                ]
            }
        }
    },
    submake: {
        annotator: {
            projects: {
                'node_modules/annotator': 'develop' // Runs as `make develop`
            }
        }
    }
});

grunt.loadNpmTasks('grunt-sass');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-postcss');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-submake');


// Installs node_modules for annotator
grunt.registerTask('setupAnnotator', 'Install annotator dependencies', function() {
    var exec = require('child_process').exec;
    var cb   = this.async();

    exec('npm install', {
        cwd: './node_modules/annotator'
    }, function(err, stdout, stderr) {
        console.log(err, stdout, stderr);
        console.log('Finished installing annotator dependencies');
        cb();
    });
});

grunt.registerTask('buildLib', 'Builds annotator lib in /lib dir', ['setupAnnotator', 'submake:annotator', 'uglify:annotator']);
grunt.registerTask('build', ['sass', 'postcss']);
grunt.registerTask('default', ['watch']);
