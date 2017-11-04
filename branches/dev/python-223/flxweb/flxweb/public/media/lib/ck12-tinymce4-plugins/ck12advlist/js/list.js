var ListDialog = {
    update: function () {
        'use strict';

        var f = document.forms[0],
            ed = top.tinymce.activeEditor,
            ol,
            start;

        ol = ed.dom.getParent(ed.selection.getNode(), 'OL');

        start = f.start.value.replace(/(^\s*)|(\s*$)/g, '');

        // Close popup if there is no start or type
        if (!start) {
            ed.undoManager.undo();
            ed.windowManager.close();
            return;
        }
        if (!this.validateNumber(start)) {
            ed.windowManager.alert('Please enter number as start index of ordered list.');
            return;
        }
        // Create new anchor elements
        if (ol) {
            ed.dom.setAttribs(ol, {
                'start': start,
                'style': 'margin-left:' + ((start.length - 1) * 7) + 'px'
            });
        }

        ed.windowManager.close();
    },

    validateNumber: function (number) {
        'use strict';
        number = parseInt(number);
        return !Number.isNaN(number) && number > 0;
    }

};

(function init() {
    'use strict';

    var ed   = top.tinymce.activeEditor,
        ol   = ed.dom.getParent(ed.selection.getNode(), 'OL'),
        form,
        startIndex,
        input;

    if (ol){
        document.addEventListener('DOMContentLoaded', function() {
            form = document.forms[0];
            startIndex = ol.getAttribute('start') || 1;
            input = form.querySelector('input#start');
            input.value = startIndex;
        });
    }
})();