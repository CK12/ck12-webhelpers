/* global module */
module.exports = function(grunt) {
    'use strict';

    var dateFormat = require('dateformat');
    var globalConfig = {};

    var modulesToIgnore = [
        '^tinymce$',
        '^tinymce4',
        '^ck12-tinymce-plugins$',
        '^ck12-tinymce4-plugins',
        'scratchpad',
        'node_modules',
        'matheditor',
        'dashboard-new',
        'collections',
        'alignedSearch',
        'autoStdAlignment',
        'practice-widget',
        'related-concepts',
        'lmsbridge',
        '^flexbook',
        'college-flexbooks',
        'standards-flexbooks'
    ];

    var oldjs_ignore_regex = new RegExp(modulesToIgnore.join('|'));
    var js_ignore_regex = new RegExp(['ignore_js_folder'].concat(modulesToIgnore).join('|'));

    function getTimestamp(){
        var ts = grunt.option('timestamp');
        ts = ts?ts:dateFormat(new Date(),'yyyymmddhhMM');
        //set the option, so that it is available for concurrent tasks
        grunt.option('timestamp',ts);
        return ts;
    }

    function getModulesConfig(){
        var cfg = grunt.option('modulesConfig');
        return cfg?cfg:'';
    }

    function getJSTestServer(){
        var server = grunt.option('biscuitServer');
        return server?server:'';
    }

    function getJSTestReportDest(){
        var dest = grunt.option('biscuitReportPath');
        return dest?dest:'/tmp/biscuit-report.xml';
    }

    function devIni2FlxwebSettings(){
        var devIniContents = grunt.file.read('flxweb/development.ini',{
                encoding: 'utf-8'
            }),
            findReplaceRegex = {
                API_PREFIX: /^flx_core_api_server = (http[s]?:\/\/.*?)$/m,
                CDN_HOSTNAME: /^static_cdn_locations = \/\/(.*?)[,\s$]/m,
                CDN_ENABLED: /^cdn_enabled = (.*?)$/m,
                MEDIA_PATH: /^url_media = (.*?)$/m,
                AUTH_COOKIE: /^ck12_login_cookie = (.*?)$/m,
                TAXONOMY_SERVER: /^taxonomy_api_server = (http[s]?:\/\/.*?)$/m,
                CDN_API_CACHE: /^cdn_api_cache = (.*?)$/m,
                CDN_API_VERSION: /^cdn_api_version = (.*?)$/m
            },
            match,
            out = {
                replacements: [] //holds configured regex replacements for string-replace task
            };
        Object.keys(findReplaceRegex).forEach(function(key){
            var re = findReplaceRegex[key],pattern,replacement;
            match = re.exec(devIniContents);
            if (match){
                out[key] = match[1];
            } else {
                out[key] = '__' + key + '__';
            }
            pattern = new RegExp('(var ' + key + ' = \')(.*)?(\';)','m');
            replacement ='$1<%= globalConfig.flxwebSettings.' + key + ' %>$3';

            out.replacements.push({
                pattern: pattern,
                replacement: replacement
            });
        });
        console.log(out);
        return out;
    }

    globalConfig.timestamp = getTimestamp();
    globalConfig.modulesConfig = getModulesConfig();
    globalConfig.jsTestServer = getJSTestServer();
    globalConfig.jsTestReportDest= getJSTestReportDest();

    grunt.initConfig({
        //variables
        globalConfig: globalConfig,
        media_dir: 'flxweb/flxweb/public/media/',
        media_build : 'build-<%= globalConfig.timestamp %>',
        media_build_dir: '<%= media_dir %><%= media_build %>',
        media_modules_config : '<%= globalConfig.modulesConfig || media_dir + \'build.modules.json\' %>',
        babel: {
        		options: {
        			sourceMap: true,
        			presets: ['es2015']
        		},
        		// dist: {
        		// 	files: {
        		// 		'dist/app.js': 'src/app.js'
        		// 	}
        		// }
	       },

        //concurrent task execution for 'minify' task
        concurrent: {
            target1: {
                tasks: ['clean:media_build','rename:oldjs'],
                options: {
                    logConcurrentOutput: true
                }
            },
            target2: {
                tasks: [
                    'ck12-media-build:main',
                    'ck12-media-build:oldjs',
                    'exec:collections-build',
                    'exec:flexbook-build'
                ],
                options: {
                    logConcurrentOutput: true
                }
            },
            target3: {
                tasks: ['rename:oldjs-reverse','uglify'],
                options: {
                    logConcurrentOutput: true
                }
            },
            target4: {
		        tasks: [
                    'copy:tinymce3',
                    'copy:tinymce4',
                    'copy:dashboard-new',
                    'copy:collections',
                    'copy:autoStdAlignment',
                    'copy:alignedSearch',
                    'copy:practice-widget',
                    'copy:reader',
                    'copy:related-concepts',
                    'copy:flexbook'
                ],
                options: {
                    logConcurrentOutput: true
                }
            },
            target5: {
                tasks: ['exec:scratchpad-build'],
                options: {
                    logConcurrentOutput: true
                }
            },
            target6: {
                tasks: ['exec:roster-build'],
                options: {
                    logConcurrentOutput: true
                }
            },
            target7: {
                tasks: ['exec:standardSelections-build'],
                options: {
                    logConcurrentOutput: true
                }
            },
            target8: {
                tasks: ['exec:lmsbridge-build'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        //read package.json
        pkg : grunt.file.readJSON('package.json'),

        jshint : {
            all : ['Gruntfile.js',
                '<%= media_dir %>require.config.js',
                '<%= media_dir %>/**/**.js',
                '!<%= media_dir %>/**/**.min.js',
                '!<%= media_dir %>/build*/**/**',
                '!<%= media_dir %>/js/**/**',
                '!<%= media_dir %>/lib/**/**'
                //'<%= media_dir %>athenaapp/**/**.js',
                //'!<%= media_dir %>athenaapp/js/athena-labs/**/**.js'
            ],
            options : {
                jshintrc: true
            }
        },
        'ck12-media-build': {
            'oldjs': {
                requireConfig : {
                    appDir: '<%= media_dir %>ignore_js_folder/',
                    baseUrl: './',
                    mainConfigFile: '<%= media_dir %>ignore_js_folder/main.js',
                    dir: '<%= media_build_dir %>/js/',
                    modules: '<%= media_dir %>ignore_js_folder/build.modules.json',
                    findNestedDependencies : false,
                    keepBuildDir: true,
                    fileExclusionRegExp: oldjs_ignore_regex,
                    paths: {
                        'flxweb.settings':'empty:'
                    }
                }
            },
            'main' : {
                requireConfig : {
                    appDir: '<%= media_dir %>',
                    baseUrl : './',
                    mainConfigFile : '<%= media_dir %>require.config.js',
                    dir : '<%= media_build_dir %>',
                    keepBuildDir: true,
                    fileExclusionRegExp: js_ignore_regex,
                    modules : '<%= media_modules_config %>',
                    paths: {
                        'flxweb.settings': 'empty:'
                    }
                }

            }
        },

        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= media_dir %>',
                    src: ['**/**.js(x)?'],
                    dest: '<%= media_dir %>',
                    ext: '.js'
                }]
            }
        },

        exec : {
            'scratchpad-build' : 'deploy/scripts/grunt/scratchpad-build.sh <%= media_dir %> <%= media_build_dir %>',
            'roster-build': 'deploy/scripts/roster-build.sh <%= media_build_dir %>',
            'standardSelections-build': 'deploy/scripts/standardSelections-build.sh <%= media_build_dir %>',
            'flexbook-build': 'cd <%= media_dir %>flexbook; yarn && yarn build -p',
            'collections-build': 'cd <%= media_dir %>collections; npm install && npm run build',
            'lmsbridge-build': 'deploy/scripts/lmsbridge-build.sh <%= media_dir %> <%= media_build_dir %>',
            'college-fb-build':'cd <%= media_dir %>/college-flexbooks; npm install; npm run build',
            'standards-fb-build':'cd <%= media_dir %>/standards-flexbooks; npm install; npm run build'
        },

        clean: {
            'media_build': ['<%= media_dir %>/build-*']
        },

        rename : {
            'oldjs': {
                src: '<%= media_dir %>js',
                dest: '<%= media_dir %>ignore_js_folder',
                options: {
                    ignore: true
                }
            },
            'oldjs-reverse': {
                src: '<%= media_dir %>ignore_js_folder',
                dest: '<%= media_dir %>js'
            }
        },

        subgrunt: {
            lmspractice: {
                'lmspractice' : 'jshint'
            }
        },

        uglify: {
            media: {
                options: {
                    mangle: true,
                    preserveComments: 'some'
                    //sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= media_build_dir %>',
                    src: [
                        '**/**.js',
                        '!**/**.min.js',
                        '!**/vendor/**',
                        '!**/lib/**',
                        '!**/athena-labs/**',
                        '!**/build.modules.js',
                        '!**/study-guides/**',
                        '!**/roster/**',
                        '!**/standardSelections/**',
                        '!**/collections/**',
                        '!**/lmsbridge/**',
                        '!**/college-flexbooks/**',
                        '!**/standards-flexbooks/**'
                    ],
                    dest: '<%= media_build_dir %>'
                }]
            }
        },
        'string-replace': {
            'flxweb_dev_ini_media': {
                files: [{'flxweb/development.ini':'flxweb/development.ini'}],
                options:{
                    replacements:[{'pattern':/(url_media\s=\s\/media).*/,'replacement':'$1/<%= media_build %>'}]
                }
            },
            'auth_dev_ini_media': {
                files: [{'flx/pylons/auth/development.ini':'flx/pylons/auth/development.ini'}],
                options:{
                    replacements:[{'pattern':/(url_media\s=.*\/media).*/,'replacement':'$1/<%= media_build %>'}]
                }
            },
            'flxweb.settings': {
                files: [
                    {'<%= media_build_dir %>/js/flxweb.settings.js':'<%= media_dir %>js/flxweb.settings.js'}
                ],
                options: {
                    replacements: '<%= globalConfig.flxwebSettings.replacements %>'
                }
            },
            'modalityAssign.config': {
                files: [
                    {'<%= media_build_dir %>/modalityAssign/modality.config.js':'<%= media_build_dir %>/modalityAssign/modality.config.js'}
                ],
                options: {
                    replacements: [{'pattern':/(\/media\/)/g,'replacement':'$1<%= media_build %>/'}]
                }
            }
        },
        'symlink': {
            'auth_media': {
                'src': '<%= media_build_dir %>',
                'dest': 'flx/pylons/auth/auth/public/media/<%= media_build %>'
            }
        },
        imagemin: {
            options: {                       // Target options
                optimizationLevel: 3
            },
            dynamic: {
                files: [{
                    expand: true,                     // Enable dynamic expansion
                    cwd: '<%= media_dir %>/',         // Src matches are relative to this path
                    src: [
                        '**/*.{png,jpg,gif}',
                        '!common/vendor/**',
                        '!lib/**',
                        '!build-*/**'
                    ],                                // Actual patterns to match
                    dest: '<%= media_build_dir %>/'   // Destination path prefix
                }]
            }
        },
        copy : {
            tinymce3 : {
                files : [
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/lib/ck12-tinymce-plugins/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/lib/ck12-tinymce-plugins/'
                    },

                    {
                        expand: true,
                        cwd: '<%= media_dir %>/lib/tinymce/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/lib/tinymce/'
                    }
                ]
            },
            tinymce4 : {
                files : [
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/lib/ck12-tinymce4-plugins/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/lib/ck12-tinymce4-plugins/'
                    },
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/lib/tinymce4/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/lib/tinymce4/'
                    }
                ]
            },
            'dashboard-new': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/dashboard-new/dist/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/dashboard-new/dist/'
                    }
                ]
            },
            'collections': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/collections/js/dist/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/collections/js/dist/'
                    },
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/collections/css/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/collections/css/'
                    }
                ]
            },
            'practice-widget': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/practice-widget/dist/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/practice-widget/dist/'
                    }
                ]
            },
            'reader': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/reader/images',
                        src:['**'],
                        dest: '<%= media_build_dir %>/reader/images/'
                    }
                ]
            },
            'related-concepts': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/related-concepts/dist/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/related-concepts/dist/'
                    }
                ]
            },
            'youtube-tracking': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= media_dir%>/modality/js/utils/',
                        src: ['youtube.tracking.js'],
                        dest: '<%= media_build_dir%>/modality/js/utils'
                    }
                ]
            },
            'plix-dressing': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= media_dir%>/modality/js/utils/',
                        src: ['plix.dressing.js'],
                        dest: '<%= media_build_dir%>/modality/js/utils'
                    }
                ]
            },
            'autoStdAlignment': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/autoStdAlignment/dist/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/autoStdAlignment/dist/'
                    },
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/autoStdAlignment/css/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/autoStdAlignment/css/'
                    },
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/autoStdAlignment/images/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/autoStdAlignment/images/'
                    }
                ]
            },
            'alignedSearch': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/alignedSearch/dist/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/alignedSearch/dist/'
                    },
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/alignedSearch/css/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/alignedSearch/css/'
                    }
                ]
            },
            'lmsbridge': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/lmsbridge/',
                        src:['**'],
                        dest: '<%= media_build_dir %>/lmsbridge/'
                    }
                ]
            },
            'flexbook': {
                files: [
                    {
                        expand: true,
                        cwd: '<%= media_dir%>/flexbook/js/dist/',
                        src: ['**'],
                        dest: '<%= media_build_dir%>/flexbook/js/dist/'
                    },
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/flexbook/css',
                        src: ['**'],
                        dest: '<%= media_build_dir %>/flexbook/css'
                    }
                    ,
                    {
                        expand: true,
                        cwd: '<%= media_dir %>/flexbook/images',
                        src: ['**'],
                        dest: '<%= media_build_dir %>/flexbook/images'
                    }
                ]
            },
            'college-flexbooks': {
                files: [{
                    expand: true,
                    cwd: '<%= media_dir %>/college-flexbooks/dist/',
                    src: ['**'],
                    dest: '<%= media_build_dir %>/college-flexbooks/dist/'
                }]
            },
            'standards-flexbooks': {
                files: [{
                    expand: true,
                    cwd: '<%= media_dir %>/standards-flexbooks/dist/',
                    src: ['**'],
                    dest: '<%= media_build_dir %>/standards-flexbooks/dist/'
                }]
            }
        },
        mocha : {
            options: {
                reporter: 'Spec',
                log: true
            },
            test: {
                src: ['<%= media_dir %>/biscuit/index.html']
            },
            remote: {
                options: {
                    reporter:'XUnit',
                    urls: ['<%= globalConfig.jsTestServer %>/media/biscuit/index.html']
                },
                dest : '<%= globalConfig.jsTestReportDest %>'
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            target: [
                '<%= media_dir %>/common/js/**/**.js'
            ]
        },
        watch: {
            babel: {
                files: ['<%= media_dir %>/**/*.jsx'],
                tasks: ['babel'],
                options: {
                    spawn : false
                }
            }
        },
        'npm-command': {
            study_guides: {
                options: {
                    cwd: '<%= media_build_dir %>/study-guides/'
                }
            }
        },
        run_grunt: {
            study_guides: {
                src: '<%= media_build_dir %>/study-guides/Gruntfile.js'
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.loadTasks('deploy/scripts/grunt');

    grunt.registerTask('read_devini_settings', function(){
        globalConfig.flxwebSettings = devIni2FlxwebSettings();
    });

    // grunt.registerTask('minify',['concurrent:target1','copy:youtube-tracking', 'concurrent:target2','concurrent:target3', 'concurrent:target4', 'concurrent:target5']);
    //Webpack module needs to be bundled before flxweb media build
    grunt.registerTask('webpack-require', ['concurrent:target8']);
    grunt.registerTask('study-guides-build', ['npm-command:study_guides', 'run_grunt:study_guides']);
    grunt.registerTask('minify-concurrent', ['concurrent:target1', 'copy:youtube-tracking', 'copy:plix-dressing','copy:lmsbridge','concurrent:target2','concurrent:target3', 'concurrent:target4', 'concurrent:target5','concurrent:target6', 'concurrent:target7','exec:college-fb-build','copy:college-flexbooks','exec:standards-fb-build','copy:standards-flexbooks']);
    grunt.registerTask('minify',['webpack-require','minify-concurrent', 'study-guides-build']);

    grunt.registerTask('update_media_settings', ['string-replace:flxweb_dev_ini_media','string-replace:auth_dev_ini_media','read_devini_settings','string-replace:flxweb.settings','string-replace:modalityAssign.config']);

    grunt.registerTask('build', ['minify', 'symlink:auth_media', 'update_media_settings']);

    grunt.registerTask('test', ['mocha:test']);

    grunt.registerTask('test-remote', ['mocha:remote']);

    grunt.registerTask('default', ['build']);

};
