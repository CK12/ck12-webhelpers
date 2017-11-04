define(['jquery', 'ck12annotator/config'], function($, config){
     // custom addBack has been added since .addBack is not supported in JQuery v1.7.1
    function addBack(selector) {
        return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
    }


    var COLOR_CLASSES = Object.keys(config.colors).join(' ');

    function changeHighlightTo(highlightClass){
        this
            .removeClass(COLOR_CLASSES)
            .addClass(highlightClass);

        return this;
    }

    $.fn.extend({
        changeHighlightTo: changeHighlightTo,
        addBack: addBack
    });
});