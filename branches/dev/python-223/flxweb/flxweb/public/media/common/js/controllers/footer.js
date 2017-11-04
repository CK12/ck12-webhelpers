define([
    'jquery',
    'common/views/footer.view' 
],function($, view) {
    'use strict';
    function Footer() {

        function init(){
            view.init();
        }

        function load(container){
            view.load(container);
        }

        this.load = load;
        this.init = init;
    }

    return new Footer();
});
