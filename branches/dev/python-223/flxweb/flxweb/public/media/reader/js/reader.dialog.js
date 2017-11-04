define(['jquery', 'reader/views/reader.dialog.view','flxweb.settings'],
    function ($, ReaderDialogView,Settings) {
        'use strict';
        var readerDialogView;
        var data = {};

        function createStyleSheet() {
            var styleElem = document.createElement('link');
            $(styleElem).attr({
                'rel': 'stylesheet',
                'href': Settings.url_media + '/reader/css/reader.dialog.css'
            });
            $('head').append($(styleElem));
        }

        function init(options) {
            if (!options || !options.artifactRevisionID) {
                console.error('artifactRevisionID parameter is required');
            } else {
                data = options;
                initializeModal();
            }
        }

        function initializeModal() {
            if (!readerDialogView) {
                createStyleSheet();
                readerDialogView = new ReaderDialogView({
                    data: data
                });
            }
            readerDialogView.revealModal();
        }
        return {
            'init': init
        };
    });
