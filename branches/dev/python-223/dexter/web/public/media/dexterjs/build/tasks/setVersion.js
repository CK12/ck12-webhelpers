module.exports = function ( grunt ) {

    var fs = require("fs");
    var path = require("path");
    var rVersion = /version":.*"(.*)"/;
    var rJs = /\.js$/;

    grunt.registerTask("setVersion", 
        "write the version from the package.json into the compiled dexterjs files", 
        function() {
            var packageFileContents = fs.readFileSync("package.json", {flag:"r", encoding:"utf-8"});
            var version = packageFileContents.match(rVersion)[1];
            var dexterjsCompiledFiles = [];
            fs.readdirSync("dist").forEach(function (file) {
                if ( file.match(rJs) ) {
                    dexterjsCompiledFiles.push(path.join("dist", file));    
                }   
            });
            for (var i=0; i<dexterjsCompiledFiles.length; i++) {
                (function(i){
                    var contents = null;
                    var data = fs.readFileSync(dexterjsCompiledFiles[i], {flag:"r", encoding:"utf-8"});
                    contents = data.replace(/##VERSION##/, version);
                    fs.writeFileSync(dexterjsCompiledFiles[i], contents);
                })(i);
            }
        }
    );

};
