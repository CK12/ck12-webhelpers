module.exports = function(grunt) {
    var globalConfig = {
        'timestamp': ''+ Number(new Date())
    };

    grunt.initConfig({
        //variables
        globalConfig: globalConfig,
        build_dir : 'build',
        lti_config: 'lti_config',
        media_ts : 'media-<%= globalConfig.timestamp %>',
        media_dest : '<%= build_dir %>/<%= media_ts %>',
        media_url : '<%= grunt.config.get("url_cdn") %>/lmspractice/<%= media_ts %>',
        apache_apps_dir : "../deploy/components/apache2/apps/",
        apache_apps_1404_dir : "../deploy/components/apache2/apps_1404/",
        apache_app_name : '16_lmspractice-ui',
        
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
                        "url_cdn" : "https://d2myb2756xv9wf.cloudfront.net"
                    }
                }
            },
            production : {
                options : {
                    variables : {
                        "generateSourceMaps" : false,
                        "gtm_ID": "GTM-NFJ3V2",
                        "url_cdn" : "https://d1mgzmvrdgdhkc.cloudfront.net"
                    }
                }
            }
        },
        
        //qunit configurations
        qunit : {
            files : ['test/**/*.html']
        },
        
        jshint : {
            all : ['Gruntfile.js', 'ui/media/require.config.js', 'ui/media/practiceapp/**/**.js'],
            options : {
                // options here to override JSHint defaults
                globals : {
                    jQuery : true,
                    console : true,
                    module : true,
                    require: true,
                    define: true,
                    window: true,
                    document : true,
                    //_:true
                },
                undef: true, // complain about undeclared variables
                unused: true, // complain about unused variables
                bitwise: true, // no bitwise operators (because & is just not same as &&)
                curly: true, // ifs, fors and whiles must have curly braces around them
                eqeqeq: true, //force triple equals
                immed: true, // (function(){})() instead of function(){}()
                //indent: 4, //complain on bad indents
                latedef: true, //define variables before they are used
                newcap: true // Constructors must start with Capital Letter
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
                    fileExclusionRegExp: /^(?:tinymce4)$|^react-.*|^dashboard-new.*|^roster.*|^alignedSearch.*|^autoStdAlignment.*|^standardSelections.*|^practice-widget.*|^college-flexbooks.*|^collections.*|^flexbook.*|^lmsbridge.*|^related-concepts.*/,
                    baseUrl : "ui/media",
                    mainConfigFile : "ui/media/require.config.js",
                    findNestedDependencies : true,
                    generateSourceMaps : grunt.config.get('generateSourceMaps'),
                    removeCombined : true,
                    modules: [
                        { 
                          name : 'practiceapp/main'
                        },
                        {
                            name: 'practiceapp/partner-main'
                        }
                    ],
		    paths: {'ltiBridge':'../../../flxweb/flxweb/public/media/lmsbridge/dist/ltiBridge.bundle'},
                    dir : "<%= media_dest %>"
                }
            },
            "compile-app" : {
                options : {
                    baseUrl : "ui/media",
                    mainConfigFile : "ui/media/require.config.js",
                    findNestedDependencies : true,
                    generateSourceMaps : grunt.config.get('generateSourceMaps'),
                    removeCombined : true,
                    name : 'practiceapp/app-main',
                    dir : "<%= media_dest %>"
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
            },
            'apache_app_1404': {
                expand: true,
                cwd : '<%= apache_apps_1404_dir %>',
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
                    '<%= build_dir %>/index.html': 'ui/index.html',
                    '<%= build_dir %>/index-app.html': 'ui/index-app.html',
                    '<%= build_dir %>/launcher.html': 'ui/launcher.html',
                },
                options: {
                    replacements : [{
                        pattern: /\/lmspractice\/media\//ig,
                        replacement: "<%= media_url %>/"
                    },
                    {
                        pattern: /GTM-[^'|^"]+/g,
                        replacement: "<%= grunt.config.get('gtm_ID') %>"
                    }]
                }
            },
            mainjs: {
                files: [
                    {"<%= media_dest %>/practiceapp/js/main.js":"<%= media_dest %>/practiceapp/js/main.js"}, 
                    {"<%= media_dest %>/practiceapp/js/app-main.js":"<%= media_dest %>/practiceapp/js/app-main.js"},
                    {"<%= media_dest %>/practiceapp/js/partner-main.js":"<%= media_dest %>/practiceapp/js/partner-main.js"}
                ],
                options: {
                    replacements: [{
                        pattern: /\/lmspractice\/media-?\d*\//g,
                        replacement: "<%= media_url %>/"
                    }]
                }
            },
            templates: {
                files: [{"<%= media_dest %>/practiceapp/js/":"<%= media_dest %>/practiceapp/js/templates/*.html"}],
                options: {
                    replacements: [{
                        pattern: /\/lmspractice\/media-?\d*\//g,
                        replacement: "<%= media_url %>/"
                    }]
                }
            },
            apache_app_build: {
                files: [{'<%= apache_apps_dir %><%= apache_app_name %>-1':'<%= apache_apps_dir %>/<%= apache_app_name %>'},
			{'<%= apache_apps_1404_dir %><%= apache_app_name %>-1':'<%= apache_apps_1404_dir %>/<%= apache_app_name %>'}],
                options: {
                    replacements: [{
                        pattern: /\/ui\//g,
                        replacement: "/build/"
                    }]
                }
            },
            apache_app_pre_build: {
                files: [{'<%= apache_apps_dir %><%= apache_app_name %>-1': '<%= apache_apps_dir %>/<%= apache_app_name %>'},
			{'<%= apache_apps_1404_dir %><%= apache_app_name %>-1':'<%= apache_apps_1404_dir %>/<%= apache_app_name %>'}],
                options:{
                    replacements: [{
                        pattern: /\/build\//g,
                        replacement: "/ui/"
                    }]
                }
            }
        },
        
        symlink: {
            options: {
                overwrite: true 
            },
            media_ts : {
                'src' : 'ui/media',
                'dest' : '<%= media_dest %>'
            },
            media: {
                'src' : 'ui/media',
                'dest' : '<%= build_dir %>/media'
            },
            lti_config: {
                'src' : 'ui/lti_config',
                'dest': '<%= build_dir %>/<%= lti_config %>'
            }
        },
        
        copy : {
            apache_app : {
                files : [{'<%= apache_apps_dir %><%= apache_app_name %>': '<%= apache_apps_dir %>/<%= apache_app_name %>-1'},
			{'<%= apache_apps_1404_dir %><%= apache_app_name %>':'<%= apache_apps_1404_dir %>/<%= apache_app_name %>-1'}],
                options: {
                    forceOverwrite: true
                }
            },
            cookie_file: {
                files:[{'<%= build_dir %>/cookie.html':'ui/cookie.html'}]
            },
            lti_config: {
                files:[{'<%= build_dir %>/lti_config/ltiApp.xml':'ui/lti_config/ltiApp.xml'}]
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
                        dest: 'ui/media/lmsbridge/dist/'
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

    grunt.registerTask('test', ['jshint', 'qunit']);
    
    grunt.registerTask('apache_pre_build', ['clean:apache_app','clean:apache_app_1404','string-replace:apache_app_pre_build','copy:apache_app','clean:apache_app','clean:apache_app_1404']);
    grunt.registerTask('apache_post_build', ['clean:apache_app','clean:apache_app_1404','string-replace:apache_app_build','copy:apache_app','clean:apache_app','clean:apache_app_1404']);
    
    grunt.registerTask('cleanup', ['clean:build', 'apache_pre_build']);
    
    grunt.registerTask('build_dev', ['cleanup', 'string-replace:index', 'symlink:media', 'symlink:media_ts', 'symlink:lti_config', 'string-replace:mainjs', 'apache_post_build']);
    grunt.registerTask('build', ['cleanup', 'requirejs:compile','copy:lmsbridge', 'string-replace:index', 'string-replace:mainjs', 'string-replace:templates', 'copy:cookie_file', 'copy:lti_config', 'apache_post_build']);
    grunt.registerTask('build-app', ['cleanup', 'requirejs:compile-app', 'string-replace:index', 'string-replace:mainjs', 'string-replace:templates']);

    grunt.registerTask('dev', ['config:dev', 'build_dev']);
    grunt.registerTask('qa', ['config:test', 'build']);
    grunt.registerTask('qa-app', ['config:test', 'build-app']);
    grunt.registerTask('production', ['config:production', 'build']);

    grunt.registerTask('default', ['dev']);
}; 
