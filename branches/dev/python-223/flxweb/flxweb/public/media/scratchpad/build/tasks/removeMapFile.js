module.exports = function ( grunt ) {

    var fs = require( "fs" );
    var rMap = /\/\/#.sourceMappingURL=.*map/;
    var minFilePath = "./dist/scratchpad.min.js";

    grunt.registerTask("removeSourceMappingURL", "delete the map file reference in the minified code", function () {
        var fileData = fs.readFileSync(minFilePath, {
            encoding: "utf-8",
            flag: "r"
        });
        fs.writeFileSync( minFilePath, fileData.replace(rMap, "") );
    });

};
