define(['jquery', 'common/utils/utils'], function ($, util) {
    'use strict';

    function groupWrongLinkView() {

        var returnLink = null;

        function bindEvents() {
            $('#wrong-link-back').off('click.groups').on('click.groups', function () {
                $('.close-reveal-modal').trigger('click');
                if (returnLink && $('#' + returnLink).length) {
                    location.href = $('#' + returnLink)[0].href;
                } else {
                    location.href = $('#group-home-link')[0].href;
                }
            });
        }

        function render(container, groupType, backLink) {
            util.ajaxStart();
            require(['text!groups/templates/group.wrong.link.' + groupType + '.modal.html'], function (template) {
                $(container).append(template);
                if (backLink) {
                    returnLink = backLink;
                }
                $('#wrongModalLink').trigger('click');
                util.ajaxStop();
                bindEvents();
            });
        }

        this.render = render;

    }
    return new groupWrongLinkView();
});