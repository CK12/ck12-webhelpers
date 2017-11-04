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

tinymce.PluginManager.add('ck12advlist', function(editor) {
	var olMenuItems, ulMenuItems, url, lastStyles = {};

	if(editor.settings.ck12_plugins_url){
        url = editor.settings.ck12_plugins_url + 'ck12advlist';
    }

	function buildMenuItems(listName, styleValues) {
		var items = [];

		tinymce.each(styleValues.split(/[ ,]/), function(styleValue) {
			items.push({
				text: styleValue.replace(/\-/g, ' ').replace(/\b\w/g, function(chr) {
					return chr.toUpperCase();
				}),
				data: styleValue == 'default' ? '' : styleValue
			});
		});

		return items;
	}

	olMenuItems = buildMenuItems('OL', editor.getParam(
		"advlist_number_styles",
		"default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman"
	));

	ulMenuItems = buildMenuItems('UL', editor.getParam("advlist_bullet_styles", "default,circle,disc,square"));

	function applyListFormat(listName, styleValue) {
		editor.undoManager.transact(function() {
			var list, dom = editor.dom, sel = editor.selection, child, html, node, command, nodeSelection;

            node = sel.getNode();

 			// Check for existing list element
			list = dom.getParent(node, 'ol,ul');

			// Switch/add list type if needed
			if (!list || list.nodeName != listName || styleValue === false) {
                command = listName == 'UL' ? 'InsertUnorderedList' : 'InsertOrderedList';

                nodeSelection = dom.select('dl', list);
                if ( nodeSelection.length ) {
                    // Bug 42198 -
                    // Since definition lists are not considered part of a text block by default
                    // they do not properly toggle between number and bulleted lists.
                    // Here we temporarily switch the DL elements to P to properly mock them
                    // as a text block, execute the list change, and then revert them back to DLs.
                    nodeSelection = changeElementsTo(nodeSelection, 'p');
                    editor.execCommand(command);
                    changeElementsTo(nodeSelection, 'dl');
                } else {
                    editor.execCommand(command);
                }


			}

			// Set style
			styleValue = styleValue === false ? lastStyles[listName] : styleValue;
			lastStyles[listName] = styleValue;

            //list = dom.getParent(node, 'ol,ul');
			list = dom.getParent(sel.getNode(), 'ol,ul');
			if (list) {
				dom.setStyle(list, 'listStyleType', styleValue ? styleValue : null);
				list.removeAttribute('data-mce-style');
			}

			if(list){
                for (var i = list.childNodes.length - 1; i >= 0; i--) {
                    child = list.childNodes[i].firstChild;
                    if (child && child.tagName === 'SPAN' && !child.className) {
                        html = child.innerHTML;
                        child.parentNode.insertAdjacentHTML('afterbegin', html);
                        dom.remove(child);
					}
				}
			}

            editor.focus();
		});
	}

    function changeElementsTo(els, type){
        var newElList = [];

        els.forEach(function(el){
            newElList.push( editor.dom.rename(el, type) );
        });

        return newElList;
    }

	function updateSelection(e) {
		var listStyleType = editor.dom.getStyle(editor.dom.getParent(editor.selection.getNode(), 'ol,ul'), 'listStyleType') || '';

		e.control.items().each(function(ctrl) {
			ctrl.active(ctrl.settings.data === listStyleType);
		});
	}


	// Register commands
    editor.addCommand('mceChangeStartOfList', function() {
      var se = editor.selection;
        // No selection and not in link
        if (se.isCollapsed() && !editor.dom.getParent(se.getNode(), 'OL')) { return; }
        editor.undoManager.add();
        editor.windowManager.open({
        	title: 'Edit Start of the List',
            file: url + '/listedit.htm',
            width: 310 + parseInt(editor.getLang('advlink.link_delta_width', 0)),
            height: 115 + parseInt(editor.getLang('advlink.link_delta_height', 0)),
            inline: true

        }, {
            plugin_url: url
        });
	});

    var contextMenu = {
        postRender: function(editor) {
            var ctrl = this;

            function handleDisable () {
                var selection, el, ol, disabledState;

                selection     = editor.selection,
                el            = selection.getNode() || editor.getBody(),
                ol            = editor.dom.getParent(el, 'ol'),
                disabledState = !!(ol && el.nodeName === 'LI');

                ctrl.disabled( !disabledState );
                ctrl.visible( disabledState );
            }

            function bindListener () {
                editor.on('contextmenu:postrender', handleDisable);
            }

            if (editor.initialized) {
                bindListener();
            } else {
                editor.on('init', bindListener);
            }
        }
    };


    editor.addMenuItem('numlistCM', {
        icon: 'numlist',
        text: 'Edit Start of List',
        onPostRender: function(){
            contextMenu.postRender.call(this, editor);
        },
        cmd: 'mceChangeStartOfList',
        context: 'insert',
        prependToContext: true
    });

	editor.addButton('numlist', {
		type: 'splitbutton',
		tooltip: 'Add/Edit Numbered list',
		menu: olMenuItems,
		onshow: updateSelection,
		onselect: function(e) {
			applyListFormat('OL', e.control.settings.data);
		},
		onclick: function() {
			applyListFormat('OL', false);
		}
	});

	editor.addButton('bullist', {
		type: 'splitbutton',
		tooltip: 'Add/Edit Bulleted list',
		menu: ulMenuItems,
		onshow: updateSelection,
		onselect: function(e) {
			applyListFormat('UL', e.control.settings.data);
		},
		onclick: function() {
			applyListFormat('UL', false);
		}
	});
});