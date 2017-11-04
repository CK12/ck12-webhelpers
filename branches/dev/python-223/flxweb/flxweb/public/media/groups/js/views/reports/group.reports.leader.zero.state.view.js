define(['jquery'], function ($) {

    'use strict';

    var groupReports;
    require(['groups/controllers/group.reports'], function (controller) {
        groupReports = controller;
    });

    function groupReportsLeaderZeroView() {

        function bindEvents() {
            $('#create-reports').off('click.reports').on('click.reports', groupReports.editReport);
            $('#create-assignment').off('click.assignment').on('click.assignment', function(){
                groupReports.editAssignment('#group-reports');
                if(window.assessmentFrameListener) {
                    window.assessmentFrameListener.setParentURL = false;
                }
            });
        }

        function render() {
            console.log("in reports zero state render");
            require([
              'text!groups/templates/reports/group.reports.header.html',
              'text!groups/templates/reports/group.reports.leader.zero.state.html'
              ], function (homeTemplate, pageTemplate) {
                //$('#group-details-container').html($(homeTemplate).find('#leader-zero-header').html());
                $('#group-details-container .activity-header-wrapper').siblings().remove();
                $('#group-reports-link').addClass('cursor-default').parent().addClass('active');
                $('#group-reports-count').addClass('group-count-black');
                $('#group-details-container').append(pageTemplate);
                bindEvents();
            });
        }

        this.render = render;

    }
    return new groupReportsLeaderZeroView();
});