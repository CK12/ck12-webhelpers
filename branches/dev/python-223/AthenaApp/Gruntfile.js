module.exports = function(grunt) {
    var globalConfig = {
        'timestamp': grunt.option("timestamp") || (+new Date())
    };

    grunt.initConfig({
        //variables
        globalConfig: globalConfig,
        build_dir : 'build',
        media_ts : 'media-<%= globalConfig.timestamp %>',
        media_dest : '<%= build_dir %>/<%= media_ts %>',
        media_url : '<%= grunt.config.url_cdn %><%= media_ts %>',
        apache_apps_dir : "/opt/2.0/deploy/components/apache2/apps/",
        apache_app_name : '17_athenaapp.conf',
        
        //read package.json
        pkg : grunt.file.readJSON('package.json'),
        
        //build configurations
        config : {
            dev : {
                options : {
                    variables : {
                        "generateSourceMaps" : true,
                        "gtm_ID": "GTM-WVB47G",
                        "url_cdn" : ""
                    }
                }
            },
            test : {
                options : {
                    variables : {
                        "generateSourceMaps" : true,
                        "gtm_ID": "GTM-WVB47G",
                        "url_cdn" : ""
                    }
                }
            },
            production : {
                options : {
                    variables : {
                        "generateSourceMaps" : false,
                        "gtm_ID": "GTM-NFJ3V2",
                        "url_cdn" : ""
                    }
                }
            }
        },
        
        //qunit configurations
        qunit : {
            files : ['test/**/*.html']
        },
        
        jshint : {
            all : [
                'Gruntfile.js', 
                'public/media/athenaapp/require.config.js', 
                'public/media/athenaapp/**/**.js', 
                '!public/media/athenaapp/js/athena-labs/**.js' 
            ],
            options : {
                // options here to override JSHint defaults
                globals : {
                    jQuery : true,
                    console : true,
                    module : true,
                    document : true
                }
            }
        },
        
        //watchers
        watch : {
            files : ['<%= jshint.files %>'],
            tasks : ['jshint']
        },
        
        //r.js optimizer configurations
        requirejs : {
            compile : {
                options : {
                    baseUrl : "public/media",
                    mainConfigFile : "public/media/require.config.js",
                    findNestedDependencies : true,
                    optimize: "none",
                    //generateSourceMaps : grunt.config.get('generateSourceMaps'),
                    //removeCombined : true,
                    modules: [
                    {
                        name : 'athenaapp/main',
                        include: ['_main']
                    }
                    ],
                    dir : "<%= media_dest %>",
		    paths: {'ltiBridge':'../../../flxweb/flxweb/public/media/lmsbridge/dist/ltiBridge.bundle'},
                    fileExclusionRegExp: /^\.|^r\.js|node_modules\/*\/*.js|node_modules\/*/,
                    preserveLicenseComments: false,
                    optimizeCss: 'standard'
                }
            }
        },

        uglify: {
            // uglify the 'main.js' file
            main: { 
                files: {
                    "build/media-<%= globalConfig.timestamp %>/athenaapp/js/main.min.js": [ "build/media-<%= globalConfig.timestamp %>/athenaapp/js/main.js" ]
                },
                options: {
                    preserveComments: false,
                    sourceMap: "build/media-<%= globalConfig.timestamp %>/athenaapp/js/main.js",
                    sourceMappingURL: "main.min.map",
                    report: "min",
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
        
        //cleanup
        clean : {
            'build':['build'],
            'apache_app': {
                expand: true,
                cwd : '<%= apache_apps_dir %>',
                src: '<%= apache_app_name %>-1',
                options: {
                    force: true
                }
            }
        },
        
        //post-build file modifications
        'string-replace': {
            index: {
                files: {
                    '<%= build_dir %>/index.html': 'public/index.html'
                },
                options: {
                    replacements : [{
                        pattern: /media\//ig,
                        replacement: "<%= media_url %>/"
                    }, {
                        pattern: /GTM-[^'|^"]+/g,
                        replacement: "<%= grunt.config.get('gtm_ID') %>"
                    }, {
                        pattern: /athenaapp\/js\/main/g,
                        replacement: "athenaapp/js/main.min"
                    }]
                }
            },
            mainjs: {
                files: [{"<%= media_dest %>/athenaapp/js/main.js":"<%= media_dest %>/athenaapp/js/main.js"}],
                options: {
                    replacements: [{
                       pattern: /\/athenaapp\/media-?\d*\//g,
                        replacement: "<%= media_url %>/"
                    }, {
                       pattern: /\/lmspractice\/media-?\d*\//g,
                       replacement: "<%= media_url %>/"
                    }]
                }
            },
            templates: {
                files: [{"<%= media_dest %>/practiceapp/js/*.html":"<%= media_dest %>/practiceapp/js/templates/*.html"}],
                options: {
                    replacements: [{
                        pattern: /\/lmspractice\/media-?\d*\//g,
                        replacement: "<%= media_url %>/"
                    }]
                }
            },
            apache_app_build: {
                files: [{'<%= apache_apps_dir %><%= apache_app_name %>-1':'<%= apache_apps_dir %>/<%= apache_app_name %>'}],
                options: {
                    replacements: [{
                        pattern: /\/public\//g,
                        replacement: "/build/"
                    }]
                }
            },
            apache_app_pre_build: {
                files: [{'<%= apache_apps_dir %><%= apache_app_name %>-1': '<%= apache_apps_dir %>/<%= apache_app_name %>'}],
                options:{
                    replacements: [{
                        pattern: /\/build\//g,
                        replacement: "/public/"
                    }]
                }
            }
        },
        
        symlink: {
            options: {
               overwrite: true 
            },
            media_ts : {
                'src' : 'public/media',
                'dest' : '<%= media_dest %>'
            },
            media: {
                'src' : 'public/media',
                'dest' : '<%= build_dir %>/media'
            },
            media_build: {
                "src" : "<%= media_dest %>",
                "dest" : "<%= build_dir %>/media"
            }
        },
        
        copy : {
            apache_app : {
                files : [{'<%= apache_apps_dir %><%= apache_app_name %>': '<%= apache_apps_dir %>/<%= apache_app_name %>-1'}],
                options: {
                    forceOverwrite: true
                }
            },
            lmsbridge: {
                files: [
                    {
                        expand: true,
                        cwd: '../flxweb/flxweb/public/media/lmsbridge/dist/',
                        src:['**'],
                        dest: '<%= media_dest %>/lmsbridge/dist/'
                    },
                    {
                        expand: true,
                        cwd: '../flxweb/flxweb/public/media/lmsbridge/dist/',
                        src:['**'],
                        dest: 'public/media/lmsbridge/dist/'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-config');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-symlink');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('test', ['jshint', 'qunit']);
    
    grunt.registerTask('apache_pre_build', ['clean:apache_app','string-replace:apache_app_pre_build','copy:apache_app','clean:apache_app']);
    grunt.registerTask('apache_post_build', ['clean:apache_app','string-replace:apache_app_build','copy:apache_app','clean:apache_app']);
    
    grunt.registerTask('cleanup', ['clean:build', 'apache_pre_build']);
    
    grunt.registerTask('build_dev', ['cleanup', 'string-replace:index', 'symlink:media', 'symlink:media_ts', 'string-replace:mainjs', 'apache_post_build']);
    grunt.registerTask('build', ['cleanup', 'requirejs', 'copy:lmsbridge', 'string-replace:index', 'string-replace:mainjs', 'apache_post_build', 'uglify:main', 'symlink:media_build']);

    grunt.registerTask('dev', ['config:dev', 'build_dev']);
    grunt.registerTask('qa', ['config:test', 'build']);
    grunt.registerTask('production', ['config:production', 'build']);

    grunt.registerTask('default', ["jshint", "qa"]);
}; 
