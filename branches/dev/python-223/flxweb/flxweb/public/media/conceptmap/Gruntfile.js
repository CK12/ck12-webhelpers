var grunt = require('grunt');

grunt.initConfig({
    watch: {
        files: 'scss/**/*.scss',
        tasks: ['sass', 'postcss'],
        options: {
            atBegin: true,
            livereload: true
        }
    },
    sass: {
        options: {
            sourceMap: true
        },
        dist: {
            files: {
                'css/main.css': 'scss/main.scss',
                'css/svg.css': 'scss/svg-shared.scss'
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
            src: 'css/main.css'
        }
    }
});

grunt.loadNpmTasks('grunt-sass');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-postcss');

grunt.registerTask('default', ['watch']);
