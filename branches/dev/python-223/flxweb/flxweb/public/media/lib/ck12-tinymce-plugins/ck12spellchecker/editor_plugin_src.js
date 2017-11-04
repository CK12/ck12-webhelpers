(function () {

    tinymce.create('tinymce.plugins.ck12spellcheckerPlugin', {

        init: function (ed, url) {

            if (ed.settings.ck12_plugins_url) {
                url = ed.settings.ck12_plugins_url + 'ck12spellchecker';
            }
            
            ed.addCommand('mceSpellChecker', function(){
                ed.windowManager.alert('Please press "Ctrl + Right click" to correct any spelling errors.');
            });

            ed.onContextMenu.add(function(ed, event){
            	var selectedElement = tinyMCE.activeEditor.dom.select('span.x-ck12-mathEditor.selectedElement');
				if(selectedElement.length == 0){
					var menu = ed.plugins.contextmenu._menu;
					if(menu){
						menu.add({title : 'Spell Checker', cmd : 'mceSpellChecker'});
					}
				}
            });

        }
    });

    // Register plugin
    tinymce.PluginManager.add('ck12spellchecker', tinymce.plugins.ck12spellcheckerPlugin);
})();