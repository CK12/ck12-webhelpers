define(['jquery', 'common/utils/utils', 'hammer'], function ($, util) {
    'use strict';

    function groupResourcesView() {
        var drag;

        function swipeLeft() {
            var index, $pagination, length;
            $pagination = $('.pagination');
            index = $pagination.find('.option-button.active').index();
            length = $pagination.find('.option-button').length;
            if (index < (length - 1)) {
                index = index + 1;
                $('.groups-home-page-mobile-wrapper').css('left', -(index * 100) + '%');
                $pagination.find('.option-button').removeClass('active');
                $pagination.find('.option-button:eq(' + index + ')').addClass('active');
            }
        }

        function swipeRight() {
            var index, $pagination;
            $pagination = $('.pagination');
            index = $pagination.find('.option-button.active').index();
            if (index > 0) {
                index = index - 1;
                $('.groups-home-page-mobile-wrapper').css('left', -(index * 100) + '%');
                $pagination.find('.option-button').removeClass('active');
                $pagination.find('.option-button:eq(' + index + ')').addClass('active');
            }
        }

        function bindEvents() {
            Hammer('.groups-home-page-mobile-wrapper').off('dragleft.drag').on('dragleft.drag', function () {
                drag = 'left';
                //swipeLeft();
            });

            Hammer('.groups-home-page-mobile-wrapper').off('dragright.drag').on('dragright.drag', function () {
                drag = 'right';
                //swipeRight();
            });

            Hammer('.groups-home-page-mobile-wrapper').off('release.drag').on('release.drag', function () {
                if (drag === 'left') {
                    drag = undefined;
                    swipeLeft();
                } else if (drag === 'right') {
                    drag = undefined;
                    swipeRight();
                }
            });

            $('.option-button').off('click.drag').on('click.drag', function () {
                var index = $(this).index();
                $('.groups-home-page-mobile-wrapper').css('left', -(index * 100) + '%');
                $('.pagination').find('.option-button').removeClass('active');
                $(this).addClass('active');
            });
        }

        function render(groupID) {
            require(['text!groups/templates/group.resources.zero.state.html'], function (pageTemplate) {
                if ($('#group-assignments-link').length && $('#image-edit-link').length) {
                    pageTemplate = pageTemplate.replace(/@@onlyForClass@@/, 'class-tip');
                    pageTemplate = pageTemplate.replace(/@@groupID@@/, groupID);
                } else {
                    pageTemplate = pageTemplate.replace(/@@onlyForClass@@/, 'hide');
                    pageTemplate = pageTemplate.replace(/@@groupID@@/, '');
                }
                $('#group-resources-link').addClass('cursor-default').parent().addClass('active');
                $('#group-resources-count').addClass('group-count-black');
                $('#group-details-container').append(pageTemplate);
                $(document).foundation();
                util.ajaxStop();
                bindEvents();
            });
        }

        this.render = render;

    }
    return new groupResourcesView();
});