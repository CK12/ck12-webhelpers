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
 *
 * $Id: flxweb.details.flexbook.js 12422 2011-08-19 22:51:58Z ravi $
 */
(function($) {

    //TODO: Externalize tinyMCE config
    // In order to preserve the order of attributes in img tag wrt Rosetta 2.0, 
    // We are orderding the attributes in math images by re order the img attributes postion in 'extended_valid_elements' manually.
    var TINYMCE_CONFIG = {
        script_url : $.flxweb.settings.tinymce.script_url,
//        script_url : webroot_url + 'media/lib/tinymce/jscripts/tiny_mce/tiny_mce.js',
        plugins : 'save, inlinepopups, advlist, advimage, paste, contextmenu, fullscreen,'+ $.flxweb.settings.tinymce.ck12_plugins,
        ck12_plugins_url : $.flxweb.settings.tinymce.ck12_plugins_url,
        theme : 'advanced',
        theme_advanced_buttons1 : 'bold,italic,underline,strikethrough,|,sub, sup,|,ck12textcolor,ck12highlight,formatselect,|,bullist,numlist,|,outdent,indent,blockquote,|,link,unlink,|,table,mathimage,charmap,image,ck12embed,elementbox',
        theme_advanced_buttons2 : 'undo,redo,|,fullscreen',
        theme_advanced_buttons3 : '',
        theme_advanced_buttons4 : '',
        theme_advanced_toolbar_location : 'top',
        theme_advanced_toolbar_align : 'left',
        theme_advanced_blockformats : 'Section 1=h3,Section 2=h4,Section 3=h5,Paragraph=p,Preformatted=pre',
        theme_advanced_resizing : false,
        save_onsavecallback : function(){},
        save_oncancelcallback : function(){},
        extended_valid_elements : "iframe[src|width|height|name|align|frameborder],img[src|alt|class|id|title|hspace|vspace|width|height|longdesc|align|onmouseover|onmouseout|name|data-ck12embed*],div[class|id|title|itemprop|itemscope=|itemtype],meta[http-equiv|name|scheme|itemprop|content]",
        content_css : webroot_url + 'media/css/rosetta.css, ' + webroot_url + 'media/css/editor.css',
        setup : tmceSetup,
        relative_urls :false,
        convert_urls : false,
        paste_text_linebreaktype :"p",
        advlist_number_styles : [
                {title : 'Default', styles : {listStyleType : ''}},
                {title : 'Lower Alpha', styles : {listStyleType : 'lower-alpha'}},
                {title : 'Upper Alpha', styles : {listStyleType : 'upper-alpha'}},
                {title : 'Lower Roman', styles : {listStyleType : 'lower-roman'}},
                {title : 'Upper Roman', styles : {listStyleType : 'upper-roman'}}
                ],
        advlist_bullet_styles: [
                {title : 'Default', styles : {listStyleType : ''}}
                ],
        //Element Box classes
        element_box_class : 'x-ck12-element-box',
        element_box_header_class : 'x-ck12-element-box-header',
        element_box_body_class : 'x-ck12-element-box-body',
        
        //Image classes
        image_class_inline: "x-ck12-img-inline",
        image_class_thumbnail: "x-ck12-img-thumbnail",
        image_class_postcard: "x-ck12-img-postcard",
        image_class_fullpage: "x-ck12-img-fullpage",
        image_class_float: "x-ck12-float",	
        image_class_nofloat: "x-ck12-nofloat",

        //Minimum content size to ask for break down the content to multiple artifacts.
        warn_large_content_min_size: 500,  //In kilobytes 

        paste_preprocess : function(hl, o) {
                        var content = o.content;
                        o.content = "&nbsp;";
                        tinyMCE.activeEditor.execCommand('mcePreProcess',false,content);
        },
        autoresize_min_height: '150px',
        autoresize_max_height: '500px'
    };
    
    var TINYMCE_EX_QUESTION_EDITOR_CONFIG = {
        script_url : $.flxweb.settings.tinymce.script_url,
//        script_url : webroot_url + 'media/lib/tinymce/jscripts/tiny_mce/tiny_mce.js',
        plugins : 'save, inlinepopups, advlist, advimage, paste, contextmenu,'+ $.flxweb.settings.tinymce.create_exercise_plugins,
        ck12_plugins_url : $.flxweb.settings.tinymce.ck12_plugins_url,
        theme : 'advanced',
        theme_advanced_buttons1 : 'bold,italic,underline,strikethrough,ck12textcolor,ck12highlight,|,undo,redo,|,bullist,numlist,|,outdent,indent,blockquote,|,link,unlink,|,mathimage,charmap,image',
        theme_advanced_buttons2 : '',
        theme_advanced_buttons3 : '',
        theme_advanced_buttons4 : '',
        theme_advanced_toolbar_location : 'top',
        theme_advanced_toolbar_align : 'left',
        theme_advanced_resizing : false,
        content_css : webroot_url + 'media/css/rosetta.css, ' + webroot_url + 'media/css/editor.css',
        width : '768',
        body_class : "exeditor",
        setup : tmceSetup,
        relative_urls :false,
        convert_urls : false,
        paste_text_linebreaktype :"p",
        advlist_number_styles : [
                {title : 'Default', styles : {listStyleType : ''}},
                {title : 'Lower Alpha', styles : {listStyleType : 'lower-alpha'}},
                {title : 'Upper Alpha', styles : {listStyleType : 'upper-alpha'}},
                {title : 'Lower Roman', styles : {listStyleType : 'lower-roman'}},
                {title : 'Upper Roman', styles : {listStyleType : 'upper-roman'}}
                ],
        advlist_bullet_styles: [
                {title : 'Default', styles : {listStyleType : ''}}
                ],
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

    function loadExternalPlugin(ed, plugin_name) {
        tinymce.PluginManager.load(plugin_name, $.flxweb.settings.tinymce.ck12_plugins_url + plugin_name + '/editor_plugin.js');
    }

    function tmceSetup(ed){
        // Load external tinymce plugins dynamically before initialize
        var plugins = TINYMCE_CONFIG.plugins.split(',');
        var plugin = null;
        for (var i = 0; i < plugins.length; i++){
            plugin = plugins[i];
            plugin = plugin.replace(/\s+/g,'');
            if (plugin.indexOf('-') == '0'){
                plugin = plugin.replace('-','');
                loadExternalPlugin(ed, plugin);
            }
        }
        
        ed.onInit.add(function(ed) {
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
                    $.flxweb.events.triggerEvent(editor_elm,'flxweb.editor.tinymce.on_init', {
                        'editor': ed
                    });
                }
            }
        });
    }
    
    //jquery outerHTML plugin
    jQuery.fn.outerHTML = function(s) {
        return (s) ? this.before(s).remove() : jQuery("<p></p>").append(this.eq(0).clone()).html();
    }
    function replaceEditorWithContent(editor, content) {
        var editor_id = editor.editorId;
        var editor_container = $("#" + editor_id).parent();
        editor_container.replaceWith(content);
    }

    function tmceCancel(editor) {
        replaceEditorWithContent(editor, editor.startContent);
        $(document).trigger($.flxweb.editor.tinymce.events.CONTENT_CHANGED);
        //FIXME: cancelling does not really change the content. use a different event.
    }

    function tmceAccept(editor) {
        replaceEditorWithContent(editor, editor.getContent());
        $(document).trigger($.flxweb.editor.tinymce.events.CONTENT_CHANGED);
    }

    function tmceInit(element) {
        //close active editor
        var active_editor = $('#artifact_content .ck12_tinymce_container .editor_content').tinymce();
        if(active_editor.editorId) {
            tmceAccept(active_editor);
        }
        $('.ck12-editor-discard', element).remove();
        var content = $(element).outerHTML();
        var tinymce_template = $('#ck12_template_tinymce').html();
        var tmce_box = $(tinymce_template);
        $('.editor_content', tmce_box).val(content);
        $(element).before(tmce_box);
        var tmce = $('.editor_content', tmce_box).tinymce(TINYMCE_CONFIG);
        $('.btn_apply', tmce_box).click(function() { tmceAccept(tmce.tinymce());
            return false;
        });
        $('.btn_cancel', tmce_box).click(function() { tmceCancel(tmce.tinymce());
            return false;
        });
        $(element).remove();
    }

    function tmceInitSection(headingElement) {
        //TODO: Document, refactor
        //close active editor
        var active_editor = $('#artifact_content .ck12_tinymce_container .editor_content').tinymce();
        if(active_editor.editorId) {
            tmceAccept(active_editor);
        }
        var elementSet = [];
        var headingTag = $(headingElement).get(0).nodeName;
        var currentElement = $(headingElement);
        do {
            elementSet.push(currentElement)
            currentElement = currentElement.next();
        } while( currentElement.get(0) && currentElement.get(0).nodeName != headingTag );
        var content = '';
        $(elementSet).each(function() {
            $('.ck12-editor-discard', this).remove();
            content += $(this).outerHTML();
        });
        var tinymce_template = $('#ck12_template_tinymce').html();
        var tmce_box = $(tinymce_template);
        $('.editor_content', tmce_box).val(content);

        $(headingElement).before(tmce_box);
        var tmce = $('.editor_content', tmce_box).tinymce(TINYMCE_CONFIG);
        $('.btn_apply', tmce_box).click(function() { tmceAccept(tmce.tinymce());
            return false;
        });
        $('.btn_cancel', tmce_box).click(function() { tmceCancel(tmce.tinymce());
            return false;
        });
        $(elementSet).each(function() {
            $(this).remove()
        });
    }

    function tmceInitQuestion(element) {
        var tmce = $(element).tinymce(TINYMCE_EX_QUESTION_EDITOR_CONFIG);
    }
    
    function saveAllOpenEditors(){
        if (window.tinyMCE){
            $('.editor_content').each(function(){
                var tmce = $(this).tinymce();
                if (tmce){
                    tmceAccept(tmce);
                }
            });
        }
    }
    
    function domready() {
        //Events
        $.extend(true, $.flxweb, {
            'editor' : {
                'tinymce' : {
                    'events' : {
                        'CONTENT_CHANGED' : 'CONTENT_CHANGED'
                    },
                    'init' : tmceInit,
                    'initSection' : tmceInitSection,
                    'initQuestion' : tmceInitQuestion,
                    'saveAllOpenEditors' : saveAllOpenEditors,
                    'config' : TINYMCE_CONFIG
                }
            }
        });
        //close all open editors before save
        $(document).bind('flxweb.editor.save_start', saveAllOpenEditors);
    }


    $(document).ready(domready);
})(jQuery);
