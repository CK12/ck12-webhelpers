module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      target: {
        files: {
          'app/<%= pkg.name %>.min.js': ['lib/**/*.js', 'js/**/*.js']
        }
      },
      vendor: {
        files: {
          'app/vendor.js': 'vendor/**/*.js'
        }
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1,
      },
      target: {
        files: {
          'app/<%= pkg.name %>.min.css': 'css/**/*.css'
        }
      }
    },
    concat: {
      target: {
        files: {
          'app/vendor.js': 'vendor/**/*.js',
          'app/<%= pkg.name %>.min.js': ['lib/**/*.js', 'js/**/*.js'],
          'app/<%= pkg.name %>.min.css': 'css/**/*.css'
        }
      }
    }
  });

  // Load the plugins.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  
  // Default task(s).
  grunt.registerTask('dev', ['concat:target']);
  grunt.registerTask('default', ['uglify:target', 'uglify:vendor', 'cssmin:target']);

};