({
    appDir: ".",
    dir: "../build/js",
    optimizeCss: "standard",
    preserveLicenseComments: false,
    baseUrl: ".",
    mainConfigFile: 'main.js',
    fileExclusionRegExp: /matheditor/,
    modules: [
        //First set up the common build layer.
        {
            //module names are relative to baseUrl
            name: 'main',
            //List common dependencies here. Only need to list
            //top level dependencies, "include" will find
            //nested dependencies.
            include: ['main']
        },

        //Now set up a build layer for each page, but exclude
        //the common one. "exclude" will exclude nested
        //the nested, built dependencies from "common". Any
        //"exclude" that includes built modules should be
        //listed before the build layer that wants to exclude it.
        {
            //module names are relative to baseUrl/paths config
            name: 'main-details',
            exclude: ['main']
        },
        {
            name: 'main-editor',
            exclude: ['main']
        },
        {
            //module names are relative to baseUrl/paths config
            name: 'main-library',
            exclude: ['main']
        },
        {
            name: 'main-editor-flexbook',
            exclude: ['main', 'main-editor']
        },
        {
            name: 'flxweb.modalities',
            exclude: ['main']
        },
        {
            name: 'flxweb.details.modality.exercise',
            exclude: ['main']
        },
        {
            name: 'flxweb.details.modality.read',
            exclude: ['main']
        }
    ],
    paths:{
        'flxweb.settings':'empty:'
    } 
})
