'use strict';

var cover = require('browserify-istanbul'),
    to5ify = require('6to5ify');

var coverOptions = {
  ignore: ['**/*.spec.js'],
  defaultIgnore: true
};

module.exports = function(karma){
  karma.set({
    basePath: '',
    frameworks: ['browserify', 'mocha'],
    files: [
        'test/**/*.spec.js'
    ],
    browserify: {
        debug: true,
        configure: function(bundle) {
            bundle.on('prebundle', function() {
                bundle
                    .transform(to5ify)
                    .transform(cover(coverOptions));
            });
        }
    },
    reporters: ['coverage', 'spec'],
    coverageReporter: {
      type: 'text'
    },
    preprocessors: {
        'test/**/*.spec.js': ['coverage', 'browserify']
    },
    browsers: ['PhantomJS'],
    colors: true,
    singleRun: false
  });
};