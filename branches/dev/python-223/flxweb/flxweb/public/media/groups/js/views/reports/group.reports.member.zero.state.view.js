define(['jquery'], function ($) {

    'use strict';

    var groupReports;
    require(['groups/controllers/group.reports'], function (controller) {
        groupReports = controller;
    });

    function groupReportsMemberZeroView() {

        function bindEvents() {
            $('#create-reports').off('click.reports').on('click.reports', groupReports.editReport);
        }

        function render() {
            console.log("in reports member zero state render");
            require([
              'text!groups/templates/reports/group.reports.header.html',
              'text!groups/templates/reports/group.reports.member.zero.state.html'
              ], function (homeTemplate, pageTemplate) {
                //$('#group-details-container').html($(homeTemplate).find('#member-zero-header').html());
                $('#group-details-container .activity-header-wrapper').siblings().remove();
                $('#group-reports-link').addClass('cursor-default').parent().addClass('active');
                $('#group-reports-count').addClass('group-count-black');
                $('#group-details-container').append(pageTemplate);
                bindEvents();
            });
        }

        this.render = render;

    }
    return new groupReportsMemberZeroView();
});