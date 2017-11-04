define(['jquery', 'annotator'], function($){

    var __indexOf = [].indexOf || function(item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item) { return i; }
        }
        return -1;
    };

    Annotator.Plugin.Store.prototype.updateAnnotation = function(annotation, data) {
        if (__indexOf.call(this.annotations, annotation) < 0) {
            console.error(Annotator._t('Trying to update unregistered annotation!'));
        } else {
            $.extend(annotation, data);
        }
        this.publish('annotationCreatedInServer', [annotation]);
        return $(annotation.highlights).data('annotation', annotation);
    };
});