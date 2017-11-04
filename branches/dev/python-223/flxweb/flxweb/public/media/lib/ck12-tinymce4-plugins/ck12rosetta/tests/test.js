(function() {
    'use strict';
    /* globals test:true, tinymce:true, editor: true, equal:true, Utils:true, QUnit:true, module:true, ok:true */

    module("tinymce.plugins.ck12rosetta", {
        setupModule: function() {
            QUnit.stop();

            tinymce.init({
                selector: 'textarea',
                add_unload_trigger: false,
                skin: false,
                plugins: 'advlist, anchor, autolink, autoresize, charmap, code, ' +
                     'contextmenu, directionality, emoticons, fullpage, fullscreen, ' +
                     'hr, image, importcss, insertdatetime, layer, legacyoutput, link, lists, media, ' +
                     'nonbreaking, noneditable, pagebreak, paste, preview, print, save, searchreplace, ' +
                     'spellchecker, tabfocus, table, template, textcolor, visualblocks, visualchars, wordcount,' +
                     // $.flxweb.settings.tinymce.ck12_plugins,
                     '-matheditor, -ck12rosetta, -ck12definitionlist, -elementbox, -ck12eventmanager',

                toolbar1: 'bold,italic,underline,strikethrough,|,subscript, superscript, indent|,ck12textcolor,ck12highlight,formatselect,|,bullist,numlist,ck12definitionlist,|,ck12outdent,ck12indent,blockquote,|,link,unlink,pagebreak',
                toolbar2: 'table,matheditor,charmap,image,ck12embed,elementbox,hr,|,undo,redo,|,fullscreen,|,save,code',
                init_instance_callback: function(ed) {
                    window.editor = ed;
                    QUnit.start();
                }
            });
        },
        teardown: function() {
            resetContent();
        }
    });

    function cleanHtml(html) {
        return Utils.cleanHtml(html).replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');
    }

    function resetContent() {
        editor.setContent('');
    }

    function createTag(tagName){
        return '<'+tagName+'> Test Tag </'+tagName+'>';
    }

    test('Tags disable the correct buttons when selected', function() {
        var h1   = createTag('h1'),
            h2   = createTag('h2'),
            h3   = createTag('h3'),
            h4   = createTag('h4'),
            h5   = createTag('h5'),
            h6   = createTag('h6'),
            p    = createTag('p'),
            pre  = createTag('pre'),
            bq   = createTag('blockquote'),
            boldButton            = Utils.getButtonByName('bold'),
            italicButton          = Utils.getButtonByName('italic'),
            linkButton            = Utils.getButtonByName('link'),
            strikethroughButton   = Utils.getButtonByName('strikethrough'),
            underlineButton       = Utils.getButtonByName('underline'),
            subscriptButton       = Utils.getButtonByName('subscript'),
            superscriptButton     = Utils.getButtonByName('superscript'),
            blockquoteButton      = Utils.getButtonByName('blockquote');

        function buttonTest(opposite) {
            var test = boldButton.disabled() && italicButton.disabled() && linkButton.disabled() && strikethroughButton.disabled() && underlineButton.disabled() && subscriptButton.disabled() && superscriptButton.disabled();
            return opposite ? !test : test;
        }

        editor.setContent(h1 + h2 + h3 + p + pre + bq+ h4 + h5 + h6);

        editor.selection.setCursorLocation( editor.dom.select('h1')[0] );
        editor.nodeChanged();
        ok( buttonTest() );

        //Sanity check
        editor.selection.setCursorLocation( editor.dom.select('p')[0] );
        editor.nodeChanged();
        ok( buttonTest(true) );
        ok( !blockquoteButton.disabled() );

        editor.selection.setCursorLocation( editor.dom.select('h2')[0] );
        editor.nodeChanged();
        ok( buttonTest() );

        editor.selection.setCursorLocation( editor.dom.select('h3')[0] );
        editor.nodeChanged();
        ok( buttonTest() );

        editor.selection.setCursorLocation( editor.dom.select('h4')[0] );
        editor.nodeChanged();
        ok( buttonTest() );

        editor.selection.setCursorLocation( editor.dom.select('h5')[0] );
        editor.nodeChanged();
        ok( buttonTest() );

        editor.selection.setCursorLocation( editor.dom.select('h6')[0] );
        editor.nodeChanged();
        ok( buttonTest() );

        editor.selection.setCursorLocation( editor.dom.select('pre')[0] );
        editor.nodeChanged();
        ok( blockquoteButton.disabled() );
    });

})();
