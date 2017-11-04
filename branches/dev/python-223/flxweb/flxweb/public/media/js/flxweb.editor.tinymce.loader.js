define('flxweb.editor.tinymce.loader', ['flxweb.utils.cookie', 'jquery', 'flxweb.settings'], function(cookie, $){
    var oldVersion  = cookie.getItem('mceVersion') === '3',
        tinymcePath = oldVersion ? 'media/lib/tinymce/jscripts/tiny_mce' : 'media/lib/tinymce4/js/tinymce',
        isGzipped   = $.flxweb.settings.tinymce.use_gzip,
        deferred    = $.Deferred(),
        suffix,
        modules;

    // Load all non-ck12 plugins with their source version
    // ck12 plugins are handled in flxweb.editor.tinymce.js
    if(oldVersion){
        suffix  = isGzipped ? '' : '_src';
        modules = isGzipped ? ['tinymce3-jquery'] : ['tinymce3'];
    } else {
        suffix  = isGzipped ? '.min' : '';
        modules = isGzipped ? ['tinymce-jquery'] : ['tinymce'];
    }

    // This is important: It will load the tinymce.js used by the respective tinymce.jquery.js file and used to set the load path for *ALL* plugins, as well as the tinymce script tag itself.
    window.tinyMCEPreInit = {
        base: $.flxweb.settings.webroot_url + tinymcePath,
        suffix: suffix
    };

    require(modules, function() {
        deferred.resolve();
    });

    return deferred.promise();
});
