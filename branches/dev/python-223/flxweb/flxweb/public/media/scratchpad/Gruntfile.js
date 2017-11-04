module.exports = function( grunt ) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON( 'package.json' ),
    build: {
      all: {
        dest: 'dist/scratchpad.js',
        minimum: [ 'core' ]
      }
    },
    jshint: {
      all: {
        src: [ 'js/**/*.js', 'Gruntfile.js', 'build/tasks/*' ],
        options: {
            jshintrc: true
        }
      },
      dist: {
        src: 'dist/scratchpad.js'
      }
    },
    uglify: {
      all: {
        files: {
          'dist/scratchpad.min.js': [ 'dist/scratchpad.js' ]
        },
        options: {
          preserveComments: false,
          sourceMap: 'dist/scratchpad.min.js.map',
          sourceMappingURL: 'scratchpad.min.js.map',
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
    cssmin: {
      main : {
        files : {
          'dist/main.css' : ['css/main.css']
        }  
      }
    },
    exec: {
      //docs : 'doxx --source ./js/ --target ./docs --title scratchpad' 
      docs : './build/run_jsdoc.sh',
      css_cp : 'cp -r ./css/cur dist/',
      appendSpectrum : 'cat js/vendor/spectrum/spectrum.js >> dist/scratchpad.js'
    }
  });

  // Load grunt tasks from NPM packages
  require( 'load-grunt-tasks' )( grunt );

  // Integrate specific tasks
  grunt.loadTasks( 'build/tasks' );

  grunt.loadNpmTasks('grunt-exec');


  // minify the css and cp the files to dist dir
  grunt.registerTask( 'cssminify', [ 'cssmin:main', 'exec:css_cp' ] );

  // Short list as a high frequency watch task
  grunt.registerTask( 'dev', [ 'build:*:*', 'setVersion', 'cssminify', 'exec:appendSpectrum'] );

  // production grunt
  grunt.registerTask( 'production' , ['dev', 'uglify', 'removeSourceMappingURL'] );

  // Default grunt
  grunt.registerTask( 'default', [ 'dev', 'uglify' ] );

};
