/* global tinymce:true */

(function () {
    'use strict';
    tinymce.create('tinymce.plugins.ck12spellcheckerPlugin', {

        init: function (ed, url) {

            if (ed.settings.ck12_plugins_url) {
                url = ed.settings.ck12_plugins_url + 'ck12spellchecker';
            }

            ed.addCommand('mceSpellChecker', function(){
                ed.windowManager.alert('Please press "Ctrl + Right click" to correct any spelling errors.');
            });

            if (ed && (ed.plugins.contextmenu || ed.plugins.ck12contextmenu) ) {
                ed.addMenuItem('spellCheckerCM', {
                    text: 'Spell Checker',
                    context: 'insert',
                    cmd: 'mceSpellChecker',
                    ui: true
                });
            }

        }
    });

    // Register plugin
    tinymce.PluginManager.add('ck12spellchecker', tinymce.plugins.ck12spellcheckerPlugin);
})();