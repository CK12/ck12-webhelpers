define([
    'jquery',
    'common/views/modal.view',
    'clipboard'
], function($,ModalView, Clipboard){
    'use strict';

    /**
     * Selects the text of the element
     * @param el_id: id of the element
     */
    function selectText(el_id){
        try {
            var f = document.getElementById(el_id);
            f.focus();
            f.setSelectionRange(0, f.value.length);
        } catch (e) {
            console.log("Could not select text: " + e); 
        }
    }

    function onCopySuccess(){
        $('#copy_success_text').fadeIn("fast", function(){
            $('#copy_success_text').fadeOut("slow");
        });
    }

    function onCopyFailure(){
        $('#copyBtn').removeClass('turquoise');
        $('#copyBtn').addClass('grey disabled');
        $('#copy_failure_text').fadeIn("fast");
    }

    function bindClipboardEvents(clipboard){
        clipboard.on('success', function(e) {
            onCopySuccess();
            //e.clearSelection();
        });

        clipboard.on('error', function(e) {
            onCopyFailure();
        });

    }

    /**
     * We are using clipboard.js to handle the copy to clipboard.
     * Note: The tool does not allow for auto copy to clipboard.
     * see : https://github.com/zenorocha/clipboard.js/issues/127
     */
    function clipboardAlertModal(options){ 
        var resourceModal = new ModalView({
		'showOnOpen':true,
                'width': '540px',
		'headerPartial': options.headerPartial,
		'contentPartial': options.contentPartial,
                'onopen': function(){
                    selectText(options.el_id);
                    var clipboard = new Clipboard('.js-clipboard-copy');
                    // Bind any success and error handlers you want
                    bindClipboardEvents(clipboard);
                }
	});
        resourceModal.addClass('modal-uikit-alert modal-uikit-confirm');
    }
    return clipboardAlertModal;
});
