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
/* globals tinymce:true, tinyMCE:true, $:true */
/* eslint camelcase:0 */

define('flxweb.editor.tinymce', [
        'jquery',
        'flxweb.utils.cookie',
        'jquery-ui',
        'flxweb.global',
        'flxweb.settings'
    ],
    function ($, cookie) {
        'use strict';
        // tinyMce save button calls respective save click to save artifact.
        function mceBtnSaveArtifact() {
            if ($('#js_savechapter').length > 0) {
                $('#js_savechapter').click();
            } else if ($('.js_save_artifact').length > 0) {
                $('.js_save_artifact').click();
            }
        }

        var pasteCount = 0;
        var showPasteWarning = true;
        function triggerPasteNotification() {
            if (showPasteWarning){
                if ($('.noty_bar').size() === 0) {
                    if (pasteCount) {
                        pasteCount++;
                    } else {
                        pasteCount = 1;
                    }
                    if (pasteCount && pasteCount % 2) {
                        $.flxweb.notify('It looks like you are trying to paste material from an external source. <br />  Some content may not be supported, so we recommend pasting in small amounts and saving often.', 'success', 15);
                    }
                }
                showPasteWarning = false;
            }
        }

        //if ( !cookie.hasItem('mceVersion') ){ cookie.setItem('mceVersion', 4, Infinity, '/'); }
        if ( cookie.hasItem('mceVersion') ){ cookie.setItem('mceVersion', '', 'Thu, 01 Jan 1970 00:00:00 GMT', '/'); }

        var oldVersion     = cookie.getItem('mceVersion') === '3',
            scriptsUrl     = oldVersion ? $.flxweb.settings.tinymce.script_url : $.flxweb.settings.tinymce.script4_url,
            defaultPlugins = oldVersion ? $.flxweb.settings.tinymce.default_plugins : $.flxweb.settings.tinymce.default_plugins4,
            CK12Plugins    = oldVersion ? $.flxweb.settings.tinymce.ck12_plugins : $.flxweb.settings.tinymce.ck12_plugins4,
            CK12PluginsUrl = oldVersion ? $.flxweb.settings.tinymce.ck12_plugins_url : $.flxweb.settings.tinymce.ck12_plugins4_url,
            theme          = oldVersion ? 'advanced' : 'ck12modern',
            skin           = oldVersion ? 'default' : 'ck12lightgray',
            // Use editor_plugin or plugin.min for minified ck12 plugin files.
            // This field is only used when gzip is disabled. If you need to use minified non-ck12 plugin files edit: flxweb.editor.tinymce.preinit
            pluginFileName = oldVersion ? 'editor_plugin_src' : 'plugin';


        //TODO: Externalize tinyMCE config
        // In order to preserve the order of attributes in img tag wrt Rosetta 2.0,
        // We are orderding the attributes in math images by re order the img attributes postion in 'extended_valid_elements' manually.
        var TINYMCE_CONFIG = {
            script_url: scriptsUrl,
            // script_url : webroot_url + 'media/lib/tinymce/jscripts/tiny_mce/tiny_mce.js',

            plugins: defaultPlugins + ', ' + CK12Plugins,
            contextmenu: 'copy, paste, cut, |, link, unlink, elementboxCM, validatorErrorInfoCM, validatorRemoveFormattingCM, validatorRemoveElementCM, validatorRevalidateCM, |, embedObjectEditCM, embedObjectDeleteCM, ck12imageEditCM, ck12imageDeleteCM, mathEditorSelectCM, mathEditorEditCM, mathEditorCopyCM, tablepropsCM, deletetableCM, rowCM, columnCM, |, formats, numlistCM, spellCheckerCM',
            ck12_plugins_url: CK12PluginsUrl,
            mathJax_url: '//d3lkjnwva6z405.cloudfront.net/mathjax-min-2.6-20160201/MathJax.js',
            theme: theme,
            skin: skin,
            toolbar_items_size: 'small',
            toolbar1: 'bold,italic,underline,strikethrough,|,subscript, superscript, |, ck12textcolor, ck12highlight, styleselect,|,bullist,numlist,ck12definitionlist,|,ck12outdent,ck12indent,blockquote,',
            toolbar2: 'link,unlink,pagebreak,|,ck12table,matheditor,charmap,image,ck12embed,elementbox,hr,|,undo,redo,|,fullscreen,code',
            toolbar3: '',
            buttons3: '',
            buttons4: '',
            block_formats: 'Section 1=h3;Section 2=h4;Section 3=h5;Paragraph=p;Preformatted=pre;Item=dt;Description=dd',
            menubar: false,

            theme_advanced_buttons1: 'bold,italic,underline,strikethrough,|,sub, sup,|,ck12textcolor,ck12highlight,formatselect,|,bullist,numlist,ck12definitionlist,|,ck12outdent,ck12indent,blockquote,|,link,unlink,pagebreak',
            theme_advanced_buttons2: 'table,matheditor,charmap,image,ck12embed,elementbox,hr,|,undo,redo,|,fullscreen,code',
            theme_advanced_buttons3: '',
            theme_advanced_buttons4: '',
            theme_advanced_toolbar_location: 'top',
            theme_advanced_toolbar_align: 'left',
            theme_advanced_blockformats: 'Section 1=h3,Section 2=h4,Section 3=h5,Paragraph=p,Preformatted=pre,Item=dt,Description=dd',
            theme_advanced_resizing: false,

            save_onsavecallback: mceBtnSaveArtifact,
            save_oncancelcallback: function () {},
            default_math_type: 'inline',
            extended_valid_elements: 'img[src|id|class|title|alt|longdesc|width|data-ck12embed*],' +
                'td,th,tr,tbody,thead,' +
                'table[id|class|title|summary|border<0?1],' +
                'tr[class],td[class],' +
                'strong/b,em/i,' +
                'br[abbr|axis|headers|scope|halign|valign|id|class|title],' +
                'span[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup|style|data-mathmethod|data-contenteditable|data-edithtml|contenteditable],' +
                'ins[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup|cite|datetime],' +
                'del[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup|cite|datetime],' +
                'blockquote,pre,' +
                'hr[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'address[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'dt[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'dd[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'dl,li[style|id],ul[id|class|style|start|type],ol[id|class|style|start|type],' +
                'h1[id],h2[id],h3[id],h4[id],h5[id],' +
                'p[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'iframe[id|class|title|src|name|frameborder|height|width|longdesc],' +
                'div[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup|itemprop|itemscope|itemtype],' +
                'link[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup|charset|href|hreflang|type|rel|rev|media],' +
                'meta[itemprop|lang|dir|id|http-equiv|name|content|scheme],' +
                'small[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'big[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'tt[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'sup,sub,' +
                'q[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'acronym[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'abbr[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'cite[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'var[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'kbd[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'samp[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'code[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'dfn[abbr|axis|headers|scope|halign|valign|id|class|title|lang|dir|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                'a[id|title|class|href|target],' + 'data-edithtml,' +
                'pre[id|class],' +
                'blockquote[id|class],' + 
                'nobr',

            invalid_elements: 'button,legend,fieldset,textarea,option,select,input,label,form,area,map,object,bdo,body,noscript,script,style,base,title,head,html,center',

            valid_children: '+td[a|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|br|span|img|p|div|ul|ol|dl|pre|hr|blockquote|address],-td[h1|h2|h3|h4|h5|h6|menu|dir|center|noframes|isindex|table|form|applet|b],' +
                '+th[a|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|br|span|img|p|div|ul|ol|dl|pre|hr|blockquote|address],-th[menu|dir|center|noframes|isindex|form|applet],' +
                '+h1[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+h2[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+h3[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+h4[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+h5[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+small[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+big[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+b[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+i[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+tt[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+sup[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+sub[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+q[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+acronym[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+abbr[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+cite[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+var[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+kbd[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+samp[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+code[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+strong[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+em[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+span[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],-span[b]' +
                '+a[br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+ins[p|h1|h2|h3|h4|h5|div|iframe|ul|ol|dl|pre|hr|blockquote|address|fieldset|table|form|meta|a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|noscript|ins|del|script],' +
                '+del[p|h1|h2|h3|h4|h5|div|iframe|ul|ol|dl|pre|hr|blockquote|address|fieldset|table|form|meta|a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|noscript|ins|del|script],' +
                '+blockquote[a|br|span|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button],-blockquote[|bdo|map|object|iframe|table|img]' +
                '+pre[tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|br|span|bdo|map|ins|del|script|input|select|textarea|label|button],' +
                '+address[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+dt[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+dd[p|h1|h2|h3|h4|h5|div|iframe|ul|ol|dl|pre|hr|blockquote|address|fieldset|table|form|meta|a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script|noscript],' +
                '+dl[dd|dt],' +
                '+li[p|h1|h2|h3|h4|h5|div|iframe|ul|ol|dl|pre|hr|blockquote|address|fieldset|table|form|meta|a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script|noscript],' +
                '+ul[li],' +
                '+ol[li],' +
                '+p[a|iframe|br|span|bdo|map|object|img|tt|i|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],-p[b]' +
                '+iframe[p|h1|h2|h3|h4|h5|div|iframe|ul|ol|dl|pre|hr|blockquote|address|fieldset|table|form|meta|a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script|noscript],' +
                '+div[p|h1|h2|h3|h4|h5|div|iframe|ul|ol|dl|pre|hr|blockquote|address|fieldset|table|form|meta|a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script|noscript],-div[center|b],' +
                '+dfn[a|iframe|br|span|bdo|map|object|img|tt|i|b|big|small|em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym|sub|sup|input|select|textarea|label|button|ins|del|script],' +
                '+table[tr|tbody|thead|caption],-table[tfoot],' +
                '-body[b|center]',
            content_css: $.flxweb.settings.url_media + '/css/rosetta.css, ' + $.flxweb.settings.url_media + '/css/editor.css',
            setup: tmceSetup,
            relative_urls: false,
            convert_urls: false,

            //content encoding
            entity_encoding : 'utf-8',

            //Element Box classes
            element_box_class: 'x-ck12-element-box',
            element_box_header_class: 'x-ck12-element-box-header',
            element_box_body_class: 'x-ck12-element-box-body',

            //Image classes
            image_class_inline: 'x-ck12-img-inline',
            image_class_thumbnail: 'x-ck12-img-thumbnail',
            image_class_postcard: 'x-ck12-img-postcard',
            image_class_fullpage: 'x-ck12-img-fullpage',
            image_class_float: 'x-ck12-float',
            image_class_nofloat: 'x-ck12-nofloat',

            paste_text_linebreaktype: 'p',
            paste_data_images: true,
            paste_remove_styles_if_webkit: false,

            paste_preprocess: function (hl, o) {
                triggerPasteNotification();
                tinyMCE.activeEditor.execCommand('mcePreProcess', false, o);
            },
            paste_postprocess: function (hl, o) {
                tinyMCE.activeEditor.execCommand('mcePostProcess', false, o);
            },
            //Minimum content size to ask for break down the content to multiple artifacts.
            warn_large_content_min_size: 500, //In kilobytes

            autoresize_min_height: '150px',
            autoresize_max_height: '500px',
            object_resizing: false,

            browser_spellcheck: true,
            gecko_spellcheck: true,

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
            textcolor_rows: 5,
            textcolor_cols: 8,
            style_formats: [
                {title : 'Section 1'   , block : 'h3'},
                {title : 'Section 2'   , block : 'h4'},
                {title : 'Section 3'   , block : 'h5'},
                {title : 'Paragraph'   , block : 'p'},
                {title : 'Preformatted', block : 'pre'},
                {title : 'Item'        , cmd: 'ck12DefinitionItem'},
                {title : 'Description' , cmd: 'ck12DefinitionDescription'}
            ],
            link_assume_external_targets: true
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

        function tmceSetup(ed) {
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

            if (oldVersion) {
                ed.onInit.add(function (ed) {
                    addMathJaxScript(ed);
                    // edit xhtml button is shown to admin only.
                    if (!isEditAllowed) {
                        $('.mce_code').addClass('hide');
                    }
                    if (tinymce.isIE) {
                        tinymce.dom.Event.add(ed.getBody(), 'dragenter', function (e) {
                            return tinymce.dom.Event.cancel(e);
                        });
                    } else {
                        tinymce.dom.Event.add(ed.getBody().parentNode, 'drop', function (e) {
                            tinymce.dom.Event.cancel(e);
                            tinymce.dom.Event.stop(e);
                        });
                    }
                    if (ed.editorId) {
                        var editor_elm = $('#' + ed.editorId);
                        if (editor_elm.size()) {
                            $.flxweb.events.triggerEvent(editor_elm, 'flxweb.editor.tinymce.on_init', {
                                'editor': ed
                            });
                        }
                    }

                    tinymce.activeEditor.windowManager.onClose.add(function(){
                        tinymce.activeEditor.selection.collapse(true);
                    });
                });

                ed.onPostRender.add(function(ed,cm){
                    window.setTimeout(function(){
                        if(ed.contentWindow && ed.contentWindow.MathJax){
                        	var QUEUE = ed.contentWindow.MathJax.Hub.queue;
                            QUEUE.Push(function () {
                                var valUpdate = $("<div>"+ed.getContent()+"</div>");
                                $("div[id^='MathJax']",valUpdate).remove();
                                ed.setContent($(valUpdate).html());
                                ed.selection.collapse(true);
                                ed.focus();
                            });
                        }
                    },3000);
                });

            } else {

                ed.on('init', function (args) {
                    addMathJaxScript(ed);
                    // edit xhtml button is shown to admin only.
                    if (!isEditAllowed) {
                        $('.mce-i-code').parent().parent().addClass('hide');
                    }
                    if (tinymce.isIE) {
                        tinymce.dom.Event.bind(ed.getBody(), 'dragenter', function (e) {
                            return tinymce.dom.Event.cancel(e);
                        });
                    } else {
                        tinymce.dom.Event.bind(ed.getBody().parentNode, 'drop', function (e) {
                            tinymce.dom.Event.cancel(e);
                            e.stopPropagation();
                            //tinymce.dom.Event.stop(e);
                        });
                    }
                    if (ed.id) {
                        var editor_elm = $('#' + ed.id);
                        if (editor_elm.size()) {
                            $.flxweb.events.triggerEvent(editor_elm, 'flxweb.editor.tinymce.on_init', {
                                'editor': ed
                            });
                        }
                    }

                    // Fix right border missing on content
                    ed.contentAreaContainer.style.borderWidth = '1px 1px 0 0';
                });

               ed.on('PostRender', function(args){
                    window.setTimeout(function(){
                        if(ed.contentWindow && ed.contentWindow.MathJax){
                        	var QUEUE = ed.contentWindow.MathJax.Hub.queue;
                            QUEUE.Push(function () {
                                var valUpdate = $("<div>"+ed.getContent()+"</div>");
                                $("div[id^='MathJax']",valUpdate).remove();
                                valUpdate.find('div, p').each(function () {
                                    var _t = $(this);
                                    _t.html((_t.html() || '').trim());
                                });
                                $('div:empty, p:empty', valUpdate).remove();
                                $.each((valUpdate.find('.x-ck12-mathEditor')), function () {
                                    $(this).prop('contenteditable', false);
                                });
                                ed.setContent($(valUpdate).html());
                                ed.selection.collapse(true);
                            });
                        }
                    }, 3000);
                });
            }
        }

        //jquery outerHTML plugin
        jQuery.fn.outerHTML = function (s) {
            return s ? this.before(s).remove() : jQuery('<p></p>').append(this.eq(0).clone()).html();
        };

        function addMathJaxScript(ed){
            var enableMathJax = true;
            if (enableMathJax) {
                var script = document.createElement('script');

                script.id = 'mathLoader';
                script.type = 'text/javascript';
                script.src = '//d3lkjnwva6z405.cloudfront.net/mathjax-min-2.6-20160201/MathJax.js';
                var config = 'MathJax.Hub.Config({' +
                    'extensions: ["tex2jax.js","TeX/AMSmath.js","TeX/AMSsymbols.js"],' +
                    'tex2jax: {' +
                        'inlineMath: [["@$","@$"]],' +
                        'displayMath: [["@$$","@$$"]],' +
                    '},' +
                    'showMathMenu: false,' +
                    'jax: ["input/TeX","output/HTML-CSS"],' +
                    'messageStyle: "none",' +
                    'TeX: {' +
                        'extensions: ["cancel.js", "color.js", "autoload-all.js"]' +
                    '},' +
                    '"HTML-CSS": {' +
                        'scale: 85' +
                    '}' +
                '});';

                if (window.opera) {
                    script.innerHTML = config;
                } else {
                    script.text = config;
                }

                ed.dom.add(ed.dom.doc.head, 'script', {}, script );
            }
        }

        function replaceEditorWithContent(editor, content) {
            var editor_id = editor.id;
            var editor_container = $('#' + editor_id).parent();
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
            if (active_editor.id) {
                tmceAccept(active_editor);
            }
            $('.ck12-editor-discard', element).remove();
            var content = $(element).outerHTML();
            var tinymce_template = $('#ck12_template_tinymce').html();
            var tmce_box = $(tinymce_template);
            $('.editor_content', tmce_box).val(content);
            $(element).before(tmce_box);
            var tmce = $('.editor_content', tmce_box).tinymce(TINYMCE_CONFIG);
            $('.btn_apply', tmce_box).click(function () {
                tmceAccept(tmce.tinymce());
                return false;
            });
            $('.btn_cancel', tmce_box).click(function () {
                tmceCancel(tmce.tinymce());
                return false;
            });
            $(element).remove();
        }

        function tmceInitSection(headingElement) {
            //TODO: Document, refactor
            //close active editor
            var active_editor = $('#artifact_content .ck12_tinymce_container .editor_content').tinymce();
            if (active_editor.id) {
                tmceAccept(active_editor);
            }
            var elementSet = [];
            var headingTag = $(headingElement).get(0).nodeName;
            var currentElement = $(headingElement);
            do {
                elementSet.push(currentElement);
                currentElement = currentElement.next();
            } while (currentElement.get(0) && currentElement.get(0).nodeName !== headingTag);
            var content = '';
            $(elementSet).each(function () {
                $('.ck12-editor-discard', this).remove();
                content += $(this).outerHTML();
            });
            var tinymce_template = $('#ck12_template_tinymce').html();
            var tmce_box = $(tinymce_template);
            $('.editor_content', tmce_box).val(content);

            $(headingElement).before(tmce_box);
            var tmce = $('.editor_content', tmce_box).tinymce(TINYMCE_CONFIG);
            $('.btn_apply', tmce_box).click(function () {
                tmceAccept(tmce.tinymce());
                return false;
            });
            $('.btn_cancel', tmce_box).click(function () {
                tmceCancel(tmce.tinymce());
                return false;
            });
            $(elementSet).each(function () {
                $(this).remove();
            });
        }

        function tmceInitQuestion(element) {
            $(element).tinymce(TINYMCE_EX_QUESTION_EDITOR_CONFIG);
        }

        function saveAllOpenEditors() {
            if (window.tinyMCE) {
                $('.editor_content').each(function () {
                    var tmce = $(this).tinymce();
                    if (tmce) {
                        tmceAccept(tmce);
                    }
                });
            }
        }

        $.extend(true, $.flxweb, {
            'editor': {
                'tinymce': {
                    'events': {
                        'CONTENT_CHANGED': 'CONTENT_CHANGED',
                        'DATA_IMAGE': 'DATA_IMAGE'
                    },
                    'init': tmceInit,
                    'initSection': tmceInitSection,
                    'initQuestion': tmceInitQuestion,
                    'saveAllOpenEditors': saveAllOpenEditors,
                    'config': TINYMCE_CONFIG
                }
            }
        });
    });
