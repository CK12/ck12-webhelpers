({
    appDir: ".",
    dir: "build",
    optimizeCss: "standard",
    optimizeAllPluginResources: true,
    preserveLicenseComments: false,
    baseUrl: ".",
    //Ignore the old js folder, as it has its own build script and require config
    fileExclusionRegExp: /ignore_js_folder|matheditor/,
    modules : [
    //First set up the common build layer.
        {
            //module names are relative to baseUrl
            name : 'main',
            //List common dependencies here. Only need to list
            //top level dependencies, "include" will find
            //nested dependencies.
            include : ['main', '__main']
        }, {
            name : 'auth/flx.global',
            exclude : ['main']
        }, {
            name : 'embed/templates/embed.templates',
            exclude : ['jquery', 'jquery-ui']
        }, {
            name : 'modality/templates/modality.templates',
            exclude : ['jquery', 'jquery-ui']
        }, {
            name : 'modality/views/concept.renderer',
            exclude : ['jquery']
        }, {
            name : 'embed/views/concept.renderer',
            exclude : ['jquery']
        }, {
            name : 'dashboard/templates/dashboard.templates'
        }, {
            name : 'groups/templates/groups.templates'
        }, {
            name : 'account/templates/accounts.templates'
        }, {
            name : 'standard/templates/standard.templates'
        }
    ],
    paths:{
        // Do not include flxweb.settings.js in main.js - it should be loaded on-demand, separately
        'js/flxweb.settings':'empty:'
    } 
})
