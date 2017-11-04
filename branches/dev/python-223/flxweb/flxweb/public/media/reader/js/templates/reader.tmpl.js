define([
    'underscore',
    'text!reader/templates/reader.dialog.html',
    'text!reader/templates/reader.dialog2.html'
], function (_, readerDialog, readerDialog2) {
    'use strict';
    return {
        'READER_DIALOG': readerDialog,
        'READER_DIALOG2': readerDialog2
    };
});
