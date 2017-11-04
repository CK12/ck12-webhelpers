define([
    'common/views/search.view'
],function (view) {
    'use strict';

    function Search() {

        function init(options) {
            view.init(options);
        }

        this.init = init;
    }

    return new Search();
});
