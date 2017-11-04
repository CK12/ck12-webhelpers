define(['jquery', 'underscore'], function ($, _) {
    'use strict';

    var groupReportsController;
    require(['groups/controllers/group.reports'], function (controller) {
        groupReportsController = controller;
    });

    function groupReportsConceptView() {

        var pageTemplate;

        function bindEvents() {
            //Event Binding
            $('a#member-name').add('a#assignment-name').off('click').on('click', function(){
                var memberID = $(this).data('member-id');
                location.hash = 'assignment/' + memberID;
                $(window).trigger('popstate.reports');
                return false;
            });
            $('.js-concept-list-name').off('click.report').on('click.report', function() {
                var $this = $(this),
                    embedViewSrc = '/embed/#module=concept&amp;handle=' + $this.data('handle') + '&amp;branch=' + $this.data('branch') + '&amp;nochrome=true';
                groupReportsController.showNewsPaperForReport(embedViewSrc);
            });
        }

        function overrideLeftNavigation(){
            $('ul.side-nav li a')
                .off('click.home-links')
                .css({'color': '#00ABA4', 'cursor': 'pointer'});
            $('ul.side-nav li a i').css({'color': '#b8d543', 'cursor': 'pointer'});
        }

        function render(member, conceptInfo, conceptListHtml) {
            require([
              'text!groups/templates/reports/group.reports.header.html',
              'text!groups/templates/reports/group.reports.concept.html'], function (homeTemplate, pageTempl) {
                pageTemplate = pageTempl;
                var memberHeaderHTML = $(homeTemplate).find('#single-concept-view-header').html(),
                    paramsString;
                memberHeaderHTML = memberHeaderHTML.replace(/@@username@@/g, member.name);
                memberHeaderHTML = memberHeaderHTML.replace(/@@userAuthID@@/g, member.id);
                memberHeaderHTML = memberHeaderHTML.replace(/@@userID@@/g, member.id);
                memberHeaderHTML = memberHeaderHTML.replace(/@@assignmentID@@/g, conceptInfo.assignmentID);
                memberHeaderHTML = memberHeaderHTML.replace(/@@assignmentName@@/g, conceptInfo.assignmentName);
                memberHeaderHTML = memberHeaderHTML.replace(/@@conceptName@@/g, _.escape( conceptInfo.conceptCollectionTitle || conceptInfo.conceptName ));

                if(conceptInfo.conceptType === 'asmtquiz') {
                    paramsString = 'quiz/' + conceptInfo.conceptHandle + '/user:' + encodeURIComponent(conceptInfo.realm) + '?testOwnerID=3&attemptPageReferrer=my_groups';
                } else {
                    paramsString = 'practice/'+(conceptInfo.practiceHandle || conceptInfo.conceptHandle)+'&testOwnerID=3&eids=' + conceptInfo.encodedID + '&attemptPageReferrer=my_groups';
                }
                if (conceptInfo.studentID){
                    paramsString += '&studentID=' + conceptInfo.studentID;
                }
                if (conceptInfo.groupID){
                    paramsString += '&groupID=' + conceptInfo.groupID;
                }

                if(conceptInfo.oldReport){
                	paramsString += '&oldReport=true';
                }

                if(conceptInfo.assignmentID){
                    paramsString += '&assignmentId=' + conceptInfo.assignmentID;
                }

                memberHeaderHTML = memberHeaderHTML.replace(/@@params@@/g, paramsString);
                if (! groupReportsController.isGroupLeader()){
                    memberHeaderHTML = memberHeaderHTML.replace(/@@padding-class@@/g, '');
                }else{
                    memberHeaderHTML = memberHeaderHTML.replace(/@@padding-class@@/g, 'columns');
                }
                $('#group-details-container .activity-header').siblings().filter(':not(.activity-header-edit)').remove();
                $('#group-details-container .activity-header-wrapper').siblings().remove();
                $('#group-details-container .activity-header-wrapper').append(memberHeaderHTML);
                $('.quiz-header-details').append(conceptListHtml).find('.quiz-concept-list').removeClass('hide');
                $('#assignment-name').text($('#assignment-name')[0].title);
                if (!groupReportsController.isGroupLeader()){
                    $('.member-image').addClass('hide');
                    $('#member-name-text').removeClass('hide');
                    $('#member-name').addClass('hide');
                }else{
                    paramsString += '&isGroupOwner=true';
                }
                if(conceptInfo.conceptType === 'asmtquiz') {
                    $('.concept-header-details').addClass('hide');
                    $('.quiz-header-details').removeClass('hide');
                } else {
                    $('.concept-header-details').removeClass('hide');
                    $('.quiz-header-details').addClass('hide');
                }

                if (conceptInfo.collectionHandle) {
                    paramsString += '&collectionHandle=' + conceptInfo.collectionHandle;
                }

                overrideLeftNavigation();
                $('#group-reports-link').addClass('cursor-default').parent().addClass('active');
                $('#group-reports-count').addClass('group-count-black');
                //renderAssignments(member.id, assignments, memberConceptScores);
                var conceptHTML = $(pageTemplate).find('#member-non-zero-body-container-template').html();
                conceptHTML = conceptHTML.replace(/@@params@@/g, paramsString);
                $('#group-details-container').append(conceptHTML);
                bindEvents();
            });
        }

        function renderconceptList(conceptArray) {
            var conceptListTemplate = '';
            $.each(conceptArray, function(index, conceptList){
                conceptListTemplate += '<li class="concept-list-name"><a class="js-concept-list-name" data-handle="' + conceptList.handle + '" data-branch="' + conceptList.branchInfo.handle + '">' + _.escape(conceptList.name) + '</a></li>';
            });
            return conceptListTemplate;
        }

        window.assessmentFrameListener = {};
        window.assessmentFrameListener.resize = function(options){
            var height = (options && options.height)? options.height: "350";
            height = height + 50;
            $("#assessmentFrame").animate({"height": height},"slow");
        };

        window.assessmentFrameListener.setParentURL = function (url){
            window.location.href = url;
        };

        window.assessmentFrameListener.getParentURL = function (){
            return window.location.href;
        };

        this.render = render;
        this.renderconceptList = renderconceptList;

    }
    return new groupReportsConceptView();
});
