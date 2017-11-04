module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass:{
            options: {
                sourceMap: false
            },
            dist: {
                files: {
                    'css/forums.css': 'scss/forums.scss'
                }
            }
        },
        watch:{
            css:{
                files: 'scss/*.scss',
                tasks: ['sass']
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['sass']);
    grunt.registerTask('dev', ['sass', 'watch']);

};
