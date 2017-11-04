/*global tinymce:true */

tinymce.PluginManager.add('ck12alignment', function(editor) {
    'use strict';

    function isImage(node){
        return (editor.events.ck12image.isImage(node) || editor.events.ck12image.isInlineImage(node));
    }

    function isEmbeddedObject(node){
        return editor.events.ck12embed.isEmbeddedObject(node);
    }

    var contextMenu = {
        postRender: function() {
            var ctrl = this;

            function handleDisable () {
                var selection     = editor.selection,
                    el            = selection.getNode() || editor.getBody(),
                    disabledState = !isImage(el) && !isEmbeddedObject(el);

                ctrl.disabled( !disabledState );
                ctrl.visible( disabledState );
            }

            function bindListener () {
                editor.on('contextmenu', handleDisable);
            }

            if (editor.initialized) {
                bindListener();
            } else {
                editor.on('init', bindListener);
            }
        }
    };

    function cmd(command) {
        return function() {
            editor.execCommand(command);
        };
    }

    editor.addMenuItem('ck12alignmentCM', {
        text: 'Alignment',
        context: 'insert',
        prependToContext: true,
        menu: [
            {text: 'Left', icon: 'alignleft',  onclick: cmd('JustifyLeft')},
            {text: 'Center', icon: 'aligncenter',  onclick: cmd('JustifyCenter')},
            {text: 'Right', icon: 'alignright',  onclick: cmd('JustifyRight')},
            {text: 'Justify', icon: 'alignjustify',  onclick: cmd('JustifyFull')}
        ],
        onPostRender: function(){
            contextMenu.postRender.call(this, editor);
        }
    });

});
