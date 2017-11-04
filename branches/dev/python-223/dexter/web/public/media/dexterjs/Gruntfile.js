module.exports = function (grunt) {
    'use strict';

    var serveStatic = require('serve-static');

    function readOptionalJSON(filepath) {
        var data = {};
        try {
            data = grunt.file.readJSON(filepath);
        } catch (e) {}
        return data;
    }

    var srcHintOptions = readOptionalJSON('src/.jshintrc');

    // The concatenated file won't pass onevar
    // But our modules can
    delete srcHintOptions.onevar;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        build: {
            all: {
                dest: 'dist/dexterjs.js',
                minimum: [
                    'core'
                ]
            }
        },
        jshint: {
            all: {
                src: [
                    'js/**/*.js', 'Gruntfile.js', 'build/tasks/*'
                ],
                options: {
                    jshintrc: true
                }
            },
            dist: {
                src: 'dist/dexterjs.js',
                options: srcHintOptions
            }
        },
        uglify: {
            all: {
                files: {
                    'dist/dexterjs.min.js': ['dist/dexterjs.js']
                },
                options: {
                    preserveComments: false,
                    sourceMap: 'dist/dexterjs.min.js.map',
                    sourceMappingURL: 'dexterjs.min.js.map',
                    report: 'min',
                    beautify: {
                        ascii_only: true
                    },
                    compress: {
                        hoist_funs: false,
                        loops: false,
                        unused: false
                    }
                }
            }
        },
        exec: {
            docs: './node_modules/mr-doc/bin/mr-doc -s ./js/ -o ./docs -i utils -n "dexterjs" '
        },
        /*mrdoc: {
            all: {
                src: 'js',
                target: 'docs',
                options: {
                    'title':'dexterjs'
                }
            }
        },*/
        watch: {
            scripts: {
                files: ['js/**/*.js'],
                tasks: ['default'],
                options: {
                    spawn: false
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 80,
                    hostname: '*',
                    base: '.',
                    keepalive: true,
                    debug: true,
                    middleware: function () {
                        var proxy = require('grunt-connect-proxy/lib/utils')
                            .proxyRequest;
                        return [
                            // Include the proxy first
                            proxy,
                            // Serve static files.
                            serveStatic('.')
                        ];
                    }
                },
                proxies: [{
                    context: ['/dexter'],
                    host: 'gamma.ck12.org',
                    port: 80,
                    https: false,
                    debug: false
                }]
            }
        }

    });

    // Load grunt tasks from NPM packages
    require('load-grunt-tasks')(grunt);

    // Integrate specific tasks
    grunt.loadTasks('build/tasks');

    grunt.loadNpmTasks('grunt-exec');

    // Short list as a high frequency watch task
    grunt.registerTask('dev', ['build:*:*', 'setVersion']);

    // production grunt
    grunt.registerTask('production', ['dev', 'uglify', 'removeSourceMappingURL']);

    // Default grunt
    grunt.registerTask('default', ['dev', 'uglify']);

    //dev server
    grunt.registerTask('serve', ['configureProxies:server', 'connect:server']);

};
