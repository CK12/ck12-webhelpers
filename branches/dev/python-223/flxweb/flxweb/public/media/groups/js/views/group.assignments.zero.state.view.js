define(['jquery', 'common/utils/utils'], function ($, util) {

    'use strict';

    var groupAssignmentsController;
    require(['groups/controllers/group.assignments'], function (controller) {
        groupAssignmentsController = controller;
    });

    function groupAssignmentsZeroStateView() {


        function bindEventsMember() {
            $('.group-assignment-zero-container').off('click.subject').on('click.subject', '.js-node-wrapper', function () {
                var url = $(this).find('.js-node-name').text().toLowerCase();
                url = url.replace(/[\s]/g, '-');
                location.href = webroot_url + url;
            });
        }

        function bindEventsLeader() {

            $('#create-assignment').off('click.assignment').on('click.assignment', function () {
                groupAssignmentsController.editAssignment('#group-assignments');
            });

        }

        function renderBranches(subjects, id) {
            require(['text!groups/templates/subject.row.html'], function (subjectTemplate) {
                var index, name,
                    template = '';
                for (index = 0; index < subjects.length; index++) {
                    template += subjectTemplate;
                    template = template.replace(/@@small@@/g, 12);
                    template = template.replace(/@@large@@/g, 4);
                    name = subjects[index].name || '';
                    template = template.replace(/@@title@@/g, name);
                    name = name.toLowerCase().replace(/[\s]+/g, '-');
                    template = template.replace(/@@icon@@/g, name);
                    template = template.replace(/@@encodedID@@/g, (subjects[index].subjectID || '') + '.' + (subjects[index].shortname || ''));
                }
                $('.branches-' + id).append(template);
                util.ajaxStop();
            });
        }

        function checkQueryParam () {
            var queries = function () {
                var query_string = {};
                var query = window.location.search.substring(1);
                var vars = query.split("&");
                for (var i=0;i<vars.length;i++) {
                    var pair = vars[i].split("=");
                    if (typeof query_string[pair[0]] === "undefined") {
                        query_string[pair[0]] = decodeURIComponent(pair[1]);
                    } else if (typeof query_string[pair[0]] === "string") {
                        var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                        query_string[pair[0]] = arr;
                    } else {
                        query_string[pair[0]].push(decodeURIComponent(pair[1]));
                    }
                }
                return query_string;
            }();

            if (queries.quizHandle || queries.hasOwnProperty('pageType')) {
                $('#create-assignment').trigger('click', [{quizHandle: queries.quizHandle}]);
            }
        }
        
        function render() {
            if (!$('#group-assignments-link').length) {
                groupAssignmentsController.wrongLink('class');
                return;
            }
            $('#group-assignments-link').addClass('cursor-default').parent().addClass('active');
            $('#group-assignments-count').addClass('group-count-black');
            if ($('#image-edit-link').length) {
                require(['text!groups/templates/group.assignment.zero.state.leader.html'], function (pageTemplate) {
                    $('#group-details-container').append(pageTemplate);
                    util.ajaxStop();
                    bindEventsLeader();
                    checkQueryParam();
                });
            } else {
                require(['text!groups/templates/group.assignment.zero.state.member.html'], function (pageTemplate) {
                    $('#group-details-container').append(pageTemplate);
                    groupAssignmentsController.getBranches('mat');
                    groupAssignmentsController.getBranches('sci');
                    groupAssignmentsController.getBranches('ela');
                    bindEventsMember();
                });
            }
        }

        this.render = render;
        this.renderBranches = renderBranches;

    }
    return new groupAssignmentsZeroStateView();
});
