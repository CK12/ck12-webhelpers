var ListDialog = {

    preInit: function () {
        'use strict';

        var url;
        if (url = tinyMCEPopup.getParam('external_link_list_url')) {
            document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(url) + '"></script>');
        }
    },

    init: function () {
        'use strict';

        tinyMCEPopup.resizeToInnerSize();
    },

    update: function () {
        'use strict';

        var f = document.forms[0],
            ed = tinyMCEPopup.editor,
            e, start = 1; //,type = 1; 
        start = f.start.value.replace(/(^\s*)|(\s*$)/g, '');
        //var type =  f.type.value.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
        tinyMCEPopup.restoreSelection();

        e = ed.dom.getParent(ed.selection.getNode(), 'OL');

        // Close popup if there is no start or type
        if (!start) {
            tinyMCEPopup.execCommand('mceEndUndoLevel');
            tinyMCEPopup.close();
            return;
        }
        if (!this.validateNumber(start)) {
            tinyMCE.activeEditor.windowManager.alert('Please enter number as start index of ordered list.');
            return;
        }
        // Create new anchor elements
        if (e) {
            ed.dom.setAttribs(e, {
                'start': start,
                'style': 'margin-left:' + ((start.length - 1) * 7) + 'px'
                    //'type' : type
            });
        }

        tinyMCEPopup.execCommand('mceEndUndoLevel');
        tinyMCEPopup.close();
    },

    validateNumber: function (number) {
        'use strict';

        // Check if string is a whole number(digits only).
        var isWhole_re = /^\s*\d+\s*$/;
        return String(number).search(isWhole_re) !== -1;

    }

};

ListDialog.preInit();
tinyMCEPopup.onInit.add(ListDialog.init, ListDialog);