/**
 * Copyright 2007-2011 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Nachiket Karve
 * Modified by John Leung
 */
(function($) {

    $.flxweb = {
        settings : {
            "tinymce" : {
                "use_gzip": false,
                "script_url": "/flxadmin/media/js/lib/tinymce/jscripts/tiny_mce/tiny_mce.js",
                "script4_url": "/flxadmin/media/js/lib/tinymce4/js/tinymce/tinymce.min.js",

                "default_plugins": "pagebreak, xhtmlxtras, autolink, save, inlinepopups, lists, advlist, advimage, advlink, paste, contextmenu, fullscreen",
                "default_plugins4": "autolink, code, fullpage, hr, insertdatetime, nonbreaking, paste, preview, save, searchreplace, tabfocus, visualblocks, visualchars, wordcount",

                "ck12_plugins": "-matheditor, -ck12image, -ck12rosetta, -ck12paste, -ck12embed, -elementbox, -ck12autoresize, -ck12table, -ck12indent, -ck12definitionlist, -ck12link",
                "ck12_plugins4": "-ck12advlist, -ck12contextmenu, -ck12charmap, -ck12fullscreen, -matheditor, -ck12rosetta, -ck12pagebreak, -ck12paste, -ck12embed, -elementbox, -ck12autoresize, -ck12table, -ck12indent, -ck12definitionlist, -ck12link, -ck12color, -ck12image, -ck12alignment, -ck12eventmanager",

                "create_exercise_plugins": "-mathimage, -matheditor, -ck12image, -ck12rosetta, -ck12paste, -ck12embed, -ck12autoresize, -ck12table, -ck12indent, -ck12spellchecker",

                "ck12_plugins_url": "/flxadmin/media/js/lib/ck12-tinymce-plugins/",
                "ck12_plugins4_url": "/flxadmin/media/js/lib/ck12-tinymce4-plugins/"
            },
            "math_preview_endpoint" : "/preview/math",
            "math_endpoint" : "/flx/math/",
            "render_resource_perma_endpoint" : "/flx/show",
            "resource_upload_endpoint" : "/ajax/resource/upload/",
            "embedded_object_create_endpoint" : "/ajax/create/embeddedobject/",
            "embedded_object_get_endpoint" : "/ajax/get/embeddedobject/"
        }
    };

    if(!CK12Config.cookie.hasItem('mceVersion')){
        CK12Config.cookie.setItem('mceVersion', 4, Infinity, '/');
    }


    var oldVersion     = CK12Config.isOldTinyMCE(),
        scriptsUrl     = oldVersion ? $.flxweb.settings.tinymce.script_url : $.flxweb.settings.tinymce.script4_url,
        defaultPlugins = oldVersion ? $.flxweb.settings.tinymce.default_plugins : $.flxweb.settings.tinymce.default_plugins4,
        CK12Plugins    = oldVersion ? $.flxweb.settings.tinymce.ck12_plugins : $.flxweb.settings.tinymce.ck12_plugins4,
        CK12PluginsUrl = oldVersion ? $.flxweb.settings.tinymce.ck12_plugins_url : $.flxweb.settings.tinymce.ck12_plugins4_url,
        theme          = oldVersion ? 'advanced' : 'ck12modern',
        themeUrl       = oldVersion ? '/flxadmin/media/js/lib/tinymce/jscripts/tiny_mce/themes/' + theme + '/editor_template.js' : '/flxadmin/media/js/lib/tinymce4/js/tinymce/themes/' + theme + '/theme.min.js',
        skin           = oldVersion ? 'default' : 'ck12lightgray',
        skinUrl        = oldVersion ? '/flxadmin/media/js/lib/tinymce/jscripts/tiny_mce/themes/' + theme + '/skins/' + skin + '/' : '/flxadmin/media/js/lib/tinymce4/js/tinymce/skins/' + skin + '/',
        // Use editor_plugin or plugin.min for minified ck12 plugin files.
        // This field is only used when gzip is disabled. If you need to use minified non-ck12 plugin files edit: flxweb.editor.tinymce.preinit
        pluginFileName = oldVersion ? 'editor_plugin_src' : 'plugin';


    var btns_base = 'bold,italic,underline,strikethrough,|,sub,sup,|,ck12textcolor,ck12highlight,\
	                 formatselect,|,bullist,numlist,ck12definitionlist,\
                     |,outdent,indent,blockquote,\
                     |,link,unlink,pagebreak,|,table,matheditor,charmap,image,media,elementbox,hr,|,undo,redo,|,fullscreen,|,save,',
        btns_more = 'ck12embed,elementbox';


    var TINYMCE_CONFIG = { // these settings extends into tinymce.settings
        script_url: scriptsUrl,
        // these get called in ck12 (external) plugins
        ck12_plugins_url: CK12PluginsUrl,
        content_css : Defaults.tmce_content_css,

        relative_urls: false,
        convert_urls: false,

        plugins : defaultPlugins + ', ' + CK12Plugins,
        theme: theme,
        theme_url: themeUrl,
        skin: skin,
        skin_url: skinUrl,

        // TinyMCE4
        toolbar_items_size: 'small',
        toolbar1: 'bold,italic,underline,strikethrough,|,subscript, superscript, |, ck12textcolor, ck12highlight,styleselect,|,bullist,numlist,ck12definitionlist,|,ck12outdent,ck12indent,blockquote,',
        toolbar2: 'link,unlink,pagebreak,|,ck12table,matheditor,charmap,image,ck12embed,elementbox,hr,|,undo,redo,|,fullscreen,|,save,code',
        toolbar3: '',
        buttons3: '',
        buttons4: '',
        block_formats: 'Section 1=h3;Section 2=h4;Section 3=h5;Paragraph=p;Preformatted=pre;Item=dt;Description=dd',
        menubar: false,
        textcolor_map: [
            '000000', 'black',
            '000080', 'navy',
            '0000FF', 'blue',
            '008000', 'green',
            '008080', 'teal',
            '00FF00', 'lime',
            '00FFFF', 'aqua',
            '800000', 'maroon',
            '800080', 'purple',
            '808000', 'olive',
            '808080', 'grey',
            'C0C0C0', 'silver',
            'FF0000', 'red',
            'FF00FF', 'fuchsia',
            'FFFF00', 'yellow',
            'FFFFFF', 'white',
            'FFA500', 'orange',
            'FF8C00', 'darkorange'
        ],
        contextmenu: 'copy, paste, cut, |, link, unlink, elementboxCM, validatorErrorInfoCM, validatorRemoveFormattingCM, validatorRemoveElementCM, validatorRevalidateCM, |, tablepropsCM, deletetableCM, rowCM, columnCM, embedObjectEditCM, embedObjectDeleteCM, ck12imageEditCM, ck12imageDeleteCM, mathEditorSelectCM, mathEditorEditCM, mathEditorCopyCM, |, formats, numlistCM, ck12alignmentCM, spellCheckerCM',
        link_assume_external_targets: true,
        style_formats: [
            {title : 'Section 1'   , block : 'h3'},
            {title : 'Section 2'   , block : 'h4'},
            {title : 'Section 3'   , block : 'h5'},
            {title : 'Paragraph'   , block : 'p'},
            {title : 'Preformatted', block : 'pre'},
            {title : 'Item'        , cmd: 'ck12DefinitionItem'},
            {title : 'Description' , cmd: 'ck12DefinitionDescription'}
        ],
        // End TinyMCE4

        theme_advanced_buttons1 : btns_base,
        theme_advanced_buttons2 : '',
        theme_advanced_buttons3 : '',
        theme_advanced_buttons4 : '',
        theme_advanced_toolbar_location : 'top',
        theme_advanced_toolbar_align : 'left',
        theme_advanced_resizing : false,
        save_onsavecallback : function(){},
        save_oncancelcallback:function(){},
        setup : tmceSetup,
        paste_text_linebreaktype :"p",

        //Image classes
        image_class_inline: "x-ck12-img-inline",
        image_class_thumbnail: "x-ck12-img-thumbnail",
        image_class_postcard: "x-ck12-img-postcard",
        image_class_fullpage: "x-ck12-img-fullpage",
        image_class_float: "x-ck12-float",
        image_class_nofloat: "x-ck12-nofloat",

        paste_preprocess : function(hl, o) {
            var content = o.content;
            o.content = "&nbsp;";
            tinyMCE.activeEditor.execCommand('mcePreProcess',false,content);
        },
        autoresize_min_height: '150px',
        autoresize_max_height: '500px'
    };

    TINYMCE_CONFIG.advlist_number_styles = !oldVersion  ?
    // New
    'default,lower-alpha,upper-alpha,lower-roman,upper-roman' :
    // Old
    [{
        title: 'Default',
        styles: {
            listStyleType: ''
        }
    }, {
        title: 'Lower Alpha',
        styles: {
            listStyleType: 'lower-alpha'
        }
    }, {
        title: 'Upper Alpha',
        styles: {
            listStyleType: 'upper-alpha'
        }
    }, {
        title: 'Lower Roman',
        styles: {
            listStyleType: 'lower-roman'
        }
    }, {
        title: 'Upper Roman',
        styles: {
            listStyleType: 'upper-roman'
        }
    }];

    TINYMCE_CONFIG.advlist_bullet_styles = !oldVersion ?
    // New
    'default' :
    // Old
    [{
        title: 'Default',
        styles: {
            listStyleType: ''
        }
    }];

    function loadExternalPlugin(ed, pluginName) {
        tinymce.PluginManager.load(pluginName, CK12PluginsUrl + pluginName + '/' + pluginFileName + '.js');
    }

    function tmceSetup(ed){
        // Load external tinymce plugins dynamically before initialize
        var plugins, plugin, i;
        plugins = TINYMCE_CONFIG.plugins.split(',');
        plugin = null;
        for (i = 0; i < plugins.length; i++) {
            plugin = plugins[i];
            plugin = plugin.replace(/\s+/g, '');
            if (plugin.indexOf('-') === 0) {
                plugin = plugin.replace('-', '');
                loadExternalPlugin(ed, plugin);
            }
        }

        if(oldVersion){
            ed.onInit.add(function(ed) {
            	var enableMathJax = true;
    	        if (enableMathJax) {
    	        	var script = document.createElement("script");
    	            script.id = "mathLoader";
    	            script.type = "text/javascript";
    	            script.src = "//d3lkjnwva6z405.cloudfront.net/mathjax-min-2.6-20160201/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
    	            var config = 'MathJax.Hub.Config({' +
    	            	'styles: {'+
    	                    '"#MathJax_MSIE_Frame": {'+
    	                            '"position": "static",'+
    	                            '"height": "0",'+
    	                            '"overflow": "hidden",'+
    	                            '"visibility": "hidden",'+
    	                            '"display": "none"'+
    	                    '}'+
    	               '},'+
    	               'extensions: ["tex2jax.js","TeX/AMSmath.js","TeX/AMSsymbols.js"],' +
    	               'tex2jax: {'+
    	                          'inlineMath: [["@$","@$"]],'+
    	                          'displayMath: [["@$$","@$$"]],'+
    	                        '},'+
    	                        'showMathMenu: false ,'+
    	               'jax: ["input/TeX","output/HTML-CSS"],' +
    	               'messageStyle: "none"' +
    	            '});'+
    	            'function refreshMath(){' +
    	            	'MathJax.Hub.Queue(["Typeset", MathJax.Hub]);' +
    	        	'};';

    		    	if (window.opera) {
    	                script.innerHTML = config;
    		    	}
    		    	else {
    	                script.text = config;
    	            }
    	            //$(tinyMCE.activeEditor.contentDocument.head).append(script);
    	            //tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.doc.head,'script',{},script );
    		    	ed.dom.add(ed.dom.doc.head,'script',{},script );
    	        }
                if (tinymce.isIE) {
                    tinymce.dom.Event.add(ed.getBody(), "dragenter", function(e) {
                        return tinymce.dom.Event.cancel(e);
                    });
                } else {
                    tinymce.dom.Event.add(ed.getBody().parentNode, "drop", function(e) {
                        tinymce.dom.Event.cancel(e);
                        tinymce.dom.Event.stop(e);
                    });
                }
                if (ed.editorId){
                    editor_elm = $("#"+ed.editorId);
                    if (editor_elm.size()){
                        // $(editor_elm).trigger('flxweb.editor.tinymce.on_init', {
                        //     'editor': ed
                        // });
                    }
                }
            });
        } else {



            ed.on('init', function() {
                var enableMathJax = true;
                if (enableMathJax) {
                    var script = document.createElement("script");
                    script.id = "mathLoader";
                    script.type = "text/javascript";
                    script.src = "//d3lkjnwva6z405.cloudfront.net/mathjax-min-2.6-20160201/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
                    var config = 'MathJax.Hub.Config({' +
                        'styles: {'+
                            '"#MathJax_MSIE_Frame": {'+
                                    '"position": "static",'+
                                    '"height": "0",'+
                                    '"overflow": "hidden",'+
                                    '"visibility": "hidden",'+
                                    '"display": "none"'+
                            '}'+
                       '},'+
                       'extensions: ["tex2jax.js","TeX/AMSmath.js","TeX/AMSsymbols.js"],' +
                       'tex2jax: {'+
                                  'inlineMath: [["@$","@$"]],'+
                                  'displayMath: [["@$$","@$$"]],'+
                                '},'+
                                'showMathMenu: false ,'+
                       'jax: ["input/TeX","output/HTML-CSS"],' +
                       'messageStyle: "none"' +
                    '});'+
                    'function refreshMath(){' +
                        'MathJax.Hub.Queue(["Typeset", MathJax.Hub]);' +
                    '};';

                    if (window.opera) {
                        script.innerHTML = config;
                    }
                    else {
                        script.text = config;
                    }
                    //$(tinyMCE.activeEditor.contentDocument.head).append(script);
                    //tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.doc.head,'script',{},script );
                    ed.dom.add(ed.dom.doc.head,'script',{},script );
                }
                if (tinymce.isIE) {
                    tinymce.dom.Event.bind(ed.getBody(), "dragenter", function(e) {
                        return tinymce.dom.Event.cancel(e);
                    });
                } else {
                    tinymce.dom.Event.bind(ed.getBody().parentNode, "drop", function(e) {
                        tinymce.dom.Event.cancel(e);
                        // tinymce.dom.Event.stop(e);
                    });
                }
                if (ed.editorId){
                    editor_elm = $("#"+ed.editorId);
                    if (editor_elm.size()){
                        // $(editor_elm).trigger('flxweb.editor.tinymce.on_init', {
                        //     'editor': ed
                        // });
                    }
                }
            });
        }

    }
    //jquery outerHTML plugin
    jQuery.fn.outerHTML = function(s) {
        return (s) ? this.before(s).remove() : jQuery("<p></p>").append(this.eq(0).clone()).html();
    }

    Fns.initTMCE = function(element, cfg_style) {
        var extra_cfg = cfg_style ==='question'? {
            body_class : "exeditor"
        }:{ // eg. artifacts. NOTE: these configurations have not been tested
            theme_advanced_buttons1: btns_base+','+btns_more,

            //Element Box classes
            element_box_class : 'x-ck12-element-box',
            element_box_header_class : 'x-ck12-element-box-header',
            element_box_body_class : 'x-ck12-element-box-body',
            //Minimum content kB to ask for break down the content to multiple artifacts.
            warn_large_content_min_size: 500,
            theme_advanced_blockformats:
            'Section 1=h3,Section 2=h4,Section 3=h5,Paragraph=p,Preformatted=pre',
            // In order to preserve the order of attributes in img tag wrt Rosetta 2.0,
            // We are orderding the attributes in math images by re order the
            // img attributes postion in 'extended_valid_elements' manually.
            extended_valid_elements: 'iframe[src|width|height|name|align|frameborder],\
img[src|alt|class|id|title|hspace|vspace|width|height|longdesc|align|onmouseover|onmouseout|name|data-ck12embed*],\
div[class|id|title|itemprop|itemscope=|itemtype],\
meta[http-equiv|name|scheme|itemprop|content],\
span[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup|varid|vartext|data-contenteditable|readonly|tex|edithtml|style|data-mce-style|data-aid|data-index|data-mathmethod|data-edithtml|contenteditable|mathmethod],\
nobr'
        };

        var extra_cfg = cfg_style === 'concept' ? {
            body_class : "exeditor",
            theme_advanced_buttons1: btns_base+','+btns_more+',code',
        }:{ // eg. artifacts. NOTE: these configurations have not been tested
            theme_advanced_buttons1: btns_base+','+btns_more+',code',
            toolbar2: TINYMCE_CONFIG.toolbar2 += ',code',

            //Element Box classes
            element_box_class : 'x-ck12-element-box',
            element_box_header_class : 'x-ck12-element-box-header',
            element_box_body_class : 'x-ck12-element-box-body',
            //Minimum content kB to ask for break down the content to multiple artifacts.
            warn_large_content_min_size: 500,
            theme_advanced_blockformats:
            'Section 1=h3,Section 2=h4,Section 3=h5,Paragraph=p,Preformatted=pre',
            // In order to preserve the order of attributes in img tag wrt Rosetta 2.0,
            // We are orderding the attributes in math images by re order the
            // img attributes postion in 'extended_valid_elements' manually.
            extended_valid_elements: 'iframe[src|width|height|name|align|frameborder],\
img[src|alt|class|id|title|hspace|vspace|width|height|longdesc|align|onmouseover|onmouseout|name|data-ck12embed*],\
div[class|id|title|itemprop|itemscope=|itemtype],\
meta[http-equiv|name|scheme|itemprop|content],\
span[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup|varid|vartext|data-contenteditable|readonly|tex|edithtml|style|data-mce-style|data-aid|data-index|data-mathmethod|data-edithtml|contenteditable|mathmethod],\
nobr'
        };
        $(element).tinymce($.extend({}, TINYMCE_CONFIG, extra_cfg));
    }
})(jQuery);
