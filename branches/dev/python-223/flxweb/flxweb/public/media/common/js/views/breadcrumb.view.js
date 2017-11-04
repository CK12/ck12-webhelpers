define([
    'jquery',
    'underscore'
],function ($, _){

    'use strict';

    function breadCrumbView() {

        var template = _.template('<a class="breadcrumb" href="<%= data.href %>" title="<%= data.title %>"><%= data.title %></a><i class="icon-arrow3_right"></i>', null, {'variable': 'data'}),
            breadCrumb = '';

        function creatBreadCrumb(options) {
            $.each(options, function(key, value){
                breadCrumb = breadCrumb + template({
                    'href': value,
                    'title': _.escape(key.replace(/^_/, ''))
                });
            });
            $('#breadcrumbWrapper').removeClass('hide').append(breadCrumb).find('.breadcrumb:last-of-type').removeAttr('href');
        }
        function init(options) {
            creatBreadCrumb(options);
        }

        this.init = init;
    }

    return new breadCrumbView();
});
