define([
    'require',
    'jquery',
    'ck12annotator/helpers',
    'ck12annotator/overrides/jquery',
    'ck12annotator/overrides/annotator-override',
    'ck12annotator/plugins/ck12annotation/ck12annotation',
    'ck12annotator/plugins/ck12store/ck12store'
], function(require, $, helpers){
    var dfd = $.Deferred();

    if( helpers.isTouchDevice() ){
        require(['ck12annotator/plugins/touch/annotator.touch'], dfd.resolve)
    } else {
        dfd.resolve();
    }

    return dfd.promise();
});