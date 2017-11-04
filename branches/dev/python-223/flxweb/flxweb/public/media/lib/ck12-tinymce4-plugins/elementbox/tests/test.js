(function() {
    'use strict';
    /* globals test:true, tinymce:true, editor: true, equal:true, ok:true, Utils:true, QUnit:true, module:true, $:true */

    module('tinymce.plugins.elementBox', {
        setupModule: function() {
            QUnit.stop();

            tinymce.init({
                selector: 'textarea',
                add_unload_trigger: false,
                disable_nodechange: false,
                skin: false,
                plugins: 'ck12rosetta, elementbox, contextmenu',
                contextmenu: 'elementboxCM',

                element_box_class: 'x-ck12-element-box',
                element_box_header_class: 'x-ck12-element-box-header',
                element_box_body_class: 'x-ck12-element-box-body',

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

    var tableElementBox     = '<table class="x-ck12-element-box-placeholder"><tbody><tr class="x-ck12-element-box-header"><td class="x-ck12-editor-header-td-element-box">head</td></tr><tr class="x-ck12-element-box-body"><td class="x-ck12-editor-body-td-element-box">body</td></tr></tbody></table>',
        tableElementBoxNoHead = '<table class="x-ck12-element-box-placeholder"><tbody><tr class="x-ck12-element-box-body"><td class="x-ck12-editor-body-td-element-box">body</td></tr></tbody></table>',
        tableElementBoxNoBody = '<table class="x-ck12-element-box-placeholder"><tbody><tr class="x-ck12-element-box-header"><td class="x-ck12-editor-header-td-element-box">head</td></tr></tbody></table>',
        processedElementBox = createDivElementBox('head', 'body'),
        blankElementBox     = createDivElementBox(),
        testStr             = '<p>test element</p>';

    function cleanHtml(html) {
        return Utils.cleanHtml(html).replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');
    }

    function resetContent() {
        editor.setContent('');
    }

    function createDivElementBox (headContent, bodyContent) {
        var _headContent = headContent || '&nbsp;',
            _bodyContent = bodyContent || '&nbsp;';

        return '<div class="x-ck12-element-box"><div class="x-ck12-element-box-header">'+_headContent+'</div><div class="x-ck12-element-box-body">'+_bodyContent+'</div></div>';

    }

    test('Preprocessing correctly changes the structure of an elementbox', function(){
        editor.setContent(tableElementBox);
        equal(
            cleanHtml(editor.getContent()), processedElementBox
        );
    });

    test('If there is no element body or head, add it in as an empty element', function(){
        editor.setContent(tableElementBoxNoHead);
        equal(
            cleanHtml(editor.getContent()),
            createDivElementBox(null, 'body')
        );
        editor.setContent(tableElementBoxNoBody);
        equal(
            cleanHtml(editor.getContent()),
            createDivElementBox('head')
        );
    });

    test('Adds correct table structure when inserting an element box and a div structure otherwise', function() {
        editor.execCommand('mceAddElementBox');

        equal(
            cleanHtml(editor.getContent()), blankElementBox
        );

        // Headless browser will not have the same attributes and html
        ok(
            editor.getContent( {format : 'raw'} ).toString().includes('x-ck12-element-box-placeholder')
        );
    });

    test('Properly deletes an element box when selected', function() {
        editor.execCommand('mceAddElementBox');
        editor.setContent(testStr +  editor.getContent());

        equal(
            cleanHtml(editor.getContent()),
            testStr + blankElementBox
        );

        editor.selection.select( editor.dom.select('p')[0] );
        editor.execCommand('mceDeleteElementBox');

        equal(
            cleanHtml(editor.getContent()),
            testStr + blankElementBox
        );

        editor.selection.select( editor.dom.select('table.x-ck12-element-box-placeholder')[0] );
        editor.execCommand('mceDeleteElementBox');

        equal( cleanHtml(editor.getContent()), testStr);
    });

    test('Properly deletes an element box when the td header is selected', function() {
        editor.execCommand('mceAddElementBox');
        editor.setContent(testStr +  editor.getContent());

        editor.selection.select( editor.dom.select('td.x-ck12-editor-header-td-element-box')[0] );
        editor.execCommand('mceDeleteElementBox');

        equal( cleanHtml(editor.getContent()), testStr);
    });

    test('Properly deletes an element box when the td body is selected', function() {
        editor.execCommand('mceAddElementBox');
        editor.setContent(testStr +  editor.getContent());

        editor.selection.select( editor.dom.select('td.x-ck12-editor-body-td-element-box')[0] );
        editor.execCommand('mceDeleteElementBox');

        equal( cleanHtml(editor.getContent()), testStr);
    });

    test('Adds the Elementbox buttons to the menubar and toolbar', function(){
        equal( editor.buttons.elementbox.cmd, 'mceAddElementBox');
        equal( editor.menuItems.elementboxCM.cmd, 'mceDeleteElementBox');
    });

    test('Properly disables and hides the context menu when an element box is not selected', function(){
        var $contextMenuElementBox;

        editor.execCommand('mceAddElementBox');
        editor.setContent(testStr +  editor.getContent());

        editor.selection.select( editor.dom.select('td.x-ck12-editor-body-td-element-box')[0] );
        editor.fire('contextmenu');

        $contextMenuElementBox = $('.mce-i-elementBoxDelete').parent();

        ok( !$contextMenuElementBox.hasClass('mce-disabled') );
        ok( $contextMenuElementBox.is(':visible') );

        editor.selection.select( editor.dom.select('p')[0] );
        editor.fire('contextmenu');

        ok( $contextMenuElementBox.hasClass('mce-disabled') );
        ok( !$contextMenuElementBox.is(':visible') );
    });

})();
