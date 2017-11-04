    /**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('ck12contextmenu', function(editor) {
    'use strict';
    var menu,
        contextmenuNeverUseNative = editor.settings.contextmenu_never_use_native,
        pluginOverride,
        contextMenuItems = {
        'copypaste': {
            'Copy': null,
            'Paste': null,
            'Cut': null
        },

        'ck12link': {
            'Insert/Edit link': 'link',
            'Unlink': 'unlink'
        },

        'elementbox': {
            'Delete Element Box': null
        },

        'ck12validator': {
            'View Error Info': null,
            'Remove Formatting': null,
            'Remove Element': null,
            'Revalidate': null
        },

        'ck12table': {
            'Table properties': null,
            'Delete table': null,
            'Row': null,
            'Insert row before': null,
            'Insert row after': null,
            'Delete row': null,
            'Cut row': null,
            'Copy row': null,
            'Paste row before': null,
            'Paste row after': null,
            'Column': null,
            'Insert column before': null,
            'Insert column after': null,
            'Delete column': null
        },

        'ck12embed': {
            'Edit Embedded': null,
            'Delete Embedded': null
        },

        'ck12image': {
            'Insert/Edit Image': 'insert',
            'Delete Image': 'delete'
        },

        'matheditor': {
            'Select': null,
            'Edit': null,
            'Copy equation': null
        },

        'alignment': {
            'Formats': null,
            'Left': null,
            'Center': null,
            'Right': null,
            'Justify': null
        },

        'ck12spellchecker': {
            'Spell Checker': null
        }
    };

    var validatorText = Object.keys(contextMenuItems.ck12validator);

    function createContextMenu () {
        var items = [],
            contextmenu = editor.settings.contextmenu || 'link image inserttable | cell row column deletetable';

        tinymce.each(contextmenu.split(/[ ,]/), function(name) {
            var item = editor.menuItems[name];

            if (name === '|') {
                item = {text: name};
            }

            if (item) {
                item.shortcut = ''; // Hide shortcuts
                items.push(item);
            }
        });

        for (var i = 0; i < items.length; i++) {
            if (items[i].text === '|') {
                if (i === 0 || i === items.length - 1) {
                    items.splice(i, 1);
                }
            }
        }
        menu = new tinymce.ui.Menu({
            items: items,
            context: 'contextmenu',
            classes: 'contextmenu',
            onhide: function(){
                if (!menu.visible() && pluginOverride) {
                    resetMenuItems();
                    pluginOverride = null;
                }
            },
            preRender: function(){
                // Force 'postRender' to determine which menu items should show initially
                menu.show().hide();
                editor.nodeChanged();
            }
        });

        editor.on('remove', function() {
            menu.remove();
            menu = null;
        });
        return menu.renderTo().show();
    }

    function handlePluginOverride() {
        var menuItems = menu._items,
            type      = 'enable' in pluginOverride ? 'enable' : 'disable',
            ctrl;

        var plugins      = pluginOverride[type],
            filteredText = getAffectedPluginsText(plugins);

        for(var item in menuItems){
            if(menuItems.hasOwnProperty(item) && item !== 'length'){
                ctrl = menuItems[item];
                changeState(ctrl, type, filteredText);
            }
        }
    }

    function getAffectedPluginsText(plugins){
        var mapping = plugins.map(function(plugin) {
            plugin = plugin.split(':');

            var currentPlugin  = contextMenuItems[plugin[0]],
                pluginTextKeys = Object.keys(currentPlugin);

            // No children defined, assume whole plugin is affected
            if(plugin.length === 1){
                return pluginTextKeys;
            }

            return pluginTextKeys.filter(function(text){
                return plugin.indexOf(currentPlugin[text]) > -1;
            });
        });

        // Flatten array
        return Array.prototype.concat.apply([], mapping);
    }

    function changeState(ctrl, type, filteredText){
        var state = type !== 'enable',
            text  = ctrl.settings.text;

        // Shortcircuit if validator
        if (validatorText.indexOf(text) > -1){ return; }

        if (filteredText.indexOf(text) > -1) {
            ctrl.disabled(state);
            ctrl.visible(!state);
        } else {
            ctrl.disabled(!state);
            ctrl.visible(state);
        }
    }

    function resetMenuItems() {
        var menuItems = menu._items,
            ctrl;

        for(var item in menuItems){
            if(menuItems.hasOwnProperty(item) && item !== 'length'){
                ctrl = menuItems[item];
                ctrl.disabled(false);
                ctrl.visible(true);
            }
        }
    }

    editor.on('contextmenu', function(e) {
        var doc = editor.getDoc(),
            // Save current rng as rendering contextmenu will change selection
            currentRng = editor.selection.getRng();

        // Block TinyMCE menu on ctrlKey
        if (e.ctrlKey && !contextmenuNeverUseNative) {
            return;
        }

        e.preventDefault();

        /**
         * WebKit/Blink on Mac has the odd behavior of selecting the target word or line this causes
         * issues when for example inserting images see: #7022
         */
        if (tinymce.Env.mac && tinymce.Env.webkit) {
            if (e.button === 2 && doc.caretRangeFromPoint) {
                editor.selection.setRng(doc.caretRangeFromPoint(e.x, e.y));
            }
        }
        // Render menu
        if (!menu) {
            createContextMenu();
        } else {
            menu.show();
        }

        // Reselect embedded or images on right click
        editor.fire('contextmenu:reselect', {
            range: currentRng
        });

        // Force contextmenu redraw for listeners on postrender
        // This must be after the menu is 'rendered'
        editor.fire('contextmenu:postrender');

        if (pluginOverride) { handlePluginOverride(e); }

        // Position menu
        setPos( determinePos(e) );
    });

    editor.on('contextmenu:override', function(data){
        if (data.enable || data.disable){ pluginOverride = data; }
    });

    editor.on('contextmenu:hide', function() {
        if (!menu) { return; }
        menu.hide();
    });

    function determinePos(e){
        var pos = {x: e.pageX, y: e.pageY};

        if (!editor.inline || editor.inline !== 'hybrid') {
            pos = tinymce.DOM.getPos(editor.getContentAreaContainer());
            pos.x = pos.x += e.clientX;
            pos.y = pos.y += e.clientY;
        }

        return pos;
    }

    function setPos(pos){
        menu.moveTo(pos.x, pos.y);
        menu.resizeToContent();

        var edPos   = tinymce.DOM.getPos(editor.getContainer()),
            menuPos = menu.$el.offset();

        // Force contextmenu within top constraints of the editor
        // if menu.moveTo sets it out of bounds of editor
        if(menuPos.top < edPos.y) {
            menu.$el.offset({
                left: menuPos.left,
                top: edPos.y
            });
        }
    }
});
