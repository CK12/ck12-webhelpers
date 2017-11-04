define([
    'common/views/modal.view'
], function(ModalView){
    ModalView.confirm = function (callback, contentMsg, headerMsg, elem) {
        var confirmModal = new ModalView({
            'showOnOpen': true,
            'contentPartial': contentMsg,
            'headerPartial': headerMsg,
            'buttons': [
                {
                    'text': 'Leave this page',
                    'onclick': function () {
                        callback(elem);
                        this.close();
                    },
                    'className': 'link-button'
                },
                {
                    'text': 'Stay on this page',
                    'onclick': function () {
                        this.close();
                    },
                    'className': 'button tangerine'
                }
            ]
        });
        confirmModal.addClass('modal-uikit-alert modal-uikit-confirm editor-modal');
        return confirmModal;
    };

    return ModalView;
});