module.exports = function ( grunt ) {

  var fs = require('fs');
  var path = require('path');
  var rVersion = /version":.*"(.*)"/;
  var rJs = /\.js$/;

  grunt.registerTask('setVersion', 
    'write the version from the package.json into the compiled files', 
    function() {
      var packageFileContents = fs.readFileSync('package.json', {flag:'r', encoding:'utf-8'});
      var version = packageFileContents.match(rVersion)[1];
      var compiledFiles = [];
      fs.readdirSync('dist').forEach(function (file) {
        if ( file.match(rJs) ) {
          compiledFiles.push(path.join('dist', file));    
        }   
      });
      for ( var i=0; i<compiledFiles.length; ++i ) {
        (function(i){
          var contents = null;
          var data = fs.readFileSync(compiledFiles[i], {flag:'r', encoding:'utf-8'});
          contents = data.replace(/##VERSION##/, version);
          fs.writeFileSync(compiledFiles[i], contents);
        })(i);
      }
    }
  );

};
