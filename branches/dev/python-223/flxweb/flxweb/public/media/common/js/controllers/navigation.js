define([
    'jquery',
    'common/views/navigation.view',
    'common/controllers/search'
],function ($, view, search) {
    'use strict';

    function Navigation() {

        function init() {
            view.init();
            search.init({
                'element': $('.search-input'),
                'onSelect': function (options) {
                    window.location.href = '/search/?q=' + (encodeURIComponent(options.searchString) || '') + '&referrer=top_nav&autoComplete=' + (options.autoComplete || 'false');
                }
            });
        }

        this.init = init;
    }

    return new Navigation();
});
