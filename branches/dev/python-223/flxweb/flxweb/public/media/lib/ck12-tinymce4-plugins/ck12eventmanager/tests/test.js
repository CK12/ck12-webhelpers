(function() {
    'use strict';
    /* globals test:true, tinymce:true, editor: true, equal:true, ok:true, Utils:true, QUnit:true, module:true, $:true */

    module('tinymce.plugins.ck12EventManager', {
        setupModule: function() {
            QUnit.stop();

            tinymce.init({
                selector: 'textarea',
                add_unload_trigger: false,
                disable_nodechange: false,
                skin: false,
                plugins: 'elementbox, ck12eventmanager',
                menubar: 'format',

                init_instance_callback: function(ed) {
                    window.editor = ed;
                    QUnit.start();
                }
            });
        }
    });

    test('Adds the default event listeners', function() {
        ok( editor.hasEventListeners('disable') );
        ok( editor.hasEventListeners('enable') );
        ok( editor.hasEventListeners('hide') );
        ok( editor.hasEventListeners('show') );
        ok( editor.hasEventListeners('active') );
        ok( editor.hasEventListeners('inactive') );
    });

    test('Uses parameters correctly to fire default events for toolbar buttons', function(){
        var boldButton   = Utils.getButtonByName('bold', false),
            italicButton = Utils.getButtonByName('italic', false);

        editor.fire('disable', { buttons: ['bold', 'italic'] });
        ok( boldButton.disabled() );
        ok( italicButton.disabled() );

        editor.fire('enable', { button: 'italic' });
        ok( boldButton.disabled() );
        ok( !italicButton.disabled() );
    });

    test('Uses parameters correctly to fire default events for menu items', function(){
        $('.mce-menubtn[role="menuitem"]').click(); // Force DOM menu creation

        var $menu           = $('.mce-floatpanel'),
            $boldMenuItem   = $menu.find('.mce-i-bold').parent(),
            $italicMenuItem = $menu.find('.mce-i-italic').parent();

        editor.fire('disable', { menu: ['bold', 'italic'] });
        ok( $boldMenuItem.hasClass('mce-disabled') );
        ok( $italicMenuItem.hasClass('mce-disabled') );

        editor.fire('enable', { menu: 'italic' });
        ok( $boldMenuItem.hasClass('mce-disabled') );
        ok( !$italicMenuItem.hasClass('mce-disabled') );
    });

})();
