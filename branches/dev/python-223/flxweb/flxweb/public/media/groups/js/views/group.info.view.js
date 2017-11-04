define(['jquery', 'common/utils/utils','common/views/modal.view'], function ($, util, ModalView) {
    'use strict';

    var groupInfoController,hashParam;
    require(['groups/controllers/group.info'], function (controller) {
        groupInfoController = controller;
    });

    var groupRosterController;
    require(['groups/controllers/group.roster'], function (controller) {
        groupRosterController = controller;
    });

    function groupInfoView() {

        var editElement, saveInProgress, editValue, groupID, qaEnabled, rosterGroup;

        function initRoster(group, elementID, view){
            var initView = view || 'menu';
            var group = group || rosterGroup;
            Roster.init({
              elm: document.getElementById(elementID),
              group: group,
              initView:'menu'
            });
        }

        function updateGroupDetails(group) {
            if ('error' === group) {
                console.log('Sorry, we were not able to save the group details right now. Please try again after some time.');
                group = '';
            } else if (group.response.hasOwnProperty('message')) {
                if (group.response.message.toLowerCase().match('already existing group') || group.response.message.toLowerCase().match('already exists')) {
                    if ($('#side-reveal-icon').is(':visible')) {
                    	ModalView.alert('You already created a group with that name. Enter a unique name so you can tell them apart.');
                    } else {
                        $('#group-edit-wrong-error').removeClass('hide');
                    }
                }
                group = '';
                saveInProgress = false;
                return false;
            }
            if ($('#side-reveal-icon').is(':visible')) {
                $('#group-name').text($('#group-name-edit-small').val());
                var description = $('#group-description-edit-small').val();
                $('#group-description').text(description || '');
                if (description) {
                    $('#no-description-conatiner').addClass('hide');
                    $('#description-container').removeClass('hide');
                } else {
                    $('#description-container').addClass('hide');
                    $('#no-description-conatiner').removeClass('hide');
                }
                $('#group-image')[0].src = $('#group-image-edit-small')[0].src;
                $('#group-image').attr('data-resourcerevisionid', $('#group-image-edit-small').attr('data-resourcerevisionid'));
                $('#group-info-cancel-small').trigger('click');
            } else {
                if (editElement) {
                    editElement.addClass('hide');
                    if(editElement.find("#group-name-edit").length){
                        editElement = editElement.prev();
                        editElement.children(':eq(0)').text(editValue);
                        editElement.removeClass('hide');
                    }else{
                        // editElement = editElement.prev();
                        $('#description-container').children(':eq(0)').text(editValue);
                        $('#description-container').removeClass('hide');
                    }
                    editElement = '';
                    if (!$('#group-description').text() && $('.group-title-edit:visible').length === 0) {
                        $('#no-description-conatiner').removeClass('hide');
                        $('#description-container').addClass('hide');
                    }else{
                    	 $('#no-description-conatiner').addClass('hide');
                    }
                    if($(".group-activity .side-nav").hasClass("compressed-view")){
                        addNewMockUI();
                    }
                }
            }
            saveInProgress = false;
        }
		function addNewMockUI(){
			var groupActivityOffset = $(".group-activity").offset(),
			reportViewContainerOffset = $("#report-view-container-normal-view").parent().offset(),
			marginLeftForIcons = 40,
			topPos = groupActivityOffset.top - reportViewContainerOffset.top - $("#report-view-container-normal-view")[0].clientTop,
			leftPos = groupActivityOffset.left - reportViewContainerOffset.left + marginLeftForIcons;

			if(topPos < 0){
				topPos = 0;
			}

			//Adding new css position and transition for report view container
			setTimeout(function(){
				$("#report-view-container-normal-view").parent().css({
					"top":topPos
				});
			},200)

		}
        function saveGroupDetails() {
            var group, groupName, groupDescription, groupImage, groupType;
            if ($('#side-reveal-icon').is(':visible')) {
                groupName = $('#group-name-edit-small').val();
                groupDescription = $('#group-description-edit-small').val();
            } else {
                groupName = $('#group-name-edit').val();
                groupDescription = $('#group-description-edit').val();
            }
            groupImage = $('.js-group-image-main:visible').attr('data-resourcerevisionid');
            groupName = $.trim(groupName);
            groupType = $('#group-assignments-link').length ? 'class' : 'study';
            group = {
                'groupID': groupID.groupID,
                'newGroupName': groupName,
                'newGroupDesc': groupDescription,
                'resourceRevisionID': groupImage,
                'groupType': groupType
            };
            groupInfoController.updateGroup(updateGroupDetails, group);
        }

        function bindEvents() {

            var userRole = $('[data-user-role]').attr('data-user-role') || null;

            // Action reserved for teachers and admins.
            if (userRole && userRole.toLowerCase() === 'teacher' || userRole.toLowerCase() === 'administrator'){
                $('.js-members-add-students-btn').on('click', function(){
                    groupRosterController.launchRoster(rosterGroup, 'rosterApp',' menu');
                });
            }

            $('.side-nav li').off('click.nav').on('click.nav', function () {
                if (window.innerWidth < 768) {
                    qaEnabled = $('#group-discussions-link').attr('data-enable-qa');
                    if($(this).hasClass('group-discussion-link') && qaEnabled === 'false') {
                        return false;
                    } else {
                        location.href = $(this).find('a').attr('href');
                    }
                }
            });

            $('#no-description-link').off('click.groups').on('click.groups', function () {
                var element = $(this).parent(),position = $(".group-activity").offset().top - $('.groups-container').offset().top;
               // element.addClass('hide');
                $(".group-title-edit").css({
                	"top":position
                });
                $(".group-title-edit").removeClass('hide');
                $(".group-title-edit").children(':eq(0)').children().val('');
                $('.js-group-description-field:visible').focus();

                return false;
            });

            $('.js-group-detail-edit').off('click.groups').on('click.groups', function () {
            	$('.js-group-detail-cancel').trigger("click");
            	var forTitle = false;
                if ($('#side-reveal-icon').is(':visible')) {
                    $('.js-large-edit').addClass('hide-small');
                    $('.js-small-edit').removeClass('hide-important');
                    $('#group-name-edit-small').val($('#group-name').text());
                    $('#group-description-edit-small').val($('#group-description').text());
                    $('#group-image-edit-small')[0].src = $('#group-image')[0].src;
                    $('#group-image-edit-small').attr('data-resourcerevisionid', $('#group-image').attr('data-resourcerevisionid'));
                } else {
                    var child, element;
                    element = $(this).parent();
                   // element.addClass('hide');
                    if ('description-container' === element.attr('id')) {
                        child = ':eq(0)';
                    } else {
                        child = ':eq(1)';
                        forTitle = true;
                    }
                    if(forTitle){
                    	element.addClass('hide');
                    	element = element.next();
                    }else{
                        var position = $(".group-activity").offset().top - $('.groups-container').offset().top;
                        // element.addClass('hide');
                         $(".group-title-edit").css({
                         	"top":position
                         });
                        element =  $(".group-title-edit");
                    }

                    element.removeClass('hide');
                    element.children(child).children().val('');
                    if (element.children(child).children().hasClass('js-group-description-field')) {
                        $('.js-group-description-field:visible').focus();
                    } else {
                        $('.js-group-name-field:visible').focus();
                    }
                    element.children(child).children().val($(this).prev().text());
                    $('.js-edit-group-error').addClass('hide');
                    return false;
                }
            });

            $('.js-group-detail-cancel').off('click.groups').on('click.groups', function () {
                if (!saveInProgress) {
                    editElement = $(this).parent().parent();
                    editElement.addClass('hide');
                    $('.js-group-detail-edit').parent().removeClass('hide');
                    if (!$('#group-description').text() && 'description-save' === $(this).prev()[0].id) {
                        $('#description-container').addClass('hide');
                        $('#no-description-conatiner').removeClass('hide');
                    }
                    editElement = '';
                }
                return false;
            });

            $('.js-group-detail-save').off('click.groups').on('click.groups', function () {
                if (!saveInProgress) {
                    saveInProgress = true;
                    editElement = $(this).parent().parent();
                    if ('description-save' === this.id) {
                        editValue = $.trim($('#group-description-edit').val());
                    } else {
                        editValue = $.trim($('#group-name-edit').val());
                    }
                    if (editValue || 'description-save' === this.id) {
                        saveGroupDetails();
                    } else {
                        $('#group-edit-empty-error').removeClass('hide');
                        saveInProgress = false;
                    }
                }
                return false;
            });

            $('#group-name-edit').off('keypress.groups').on('keypress.groups', function () {
                $('.js-edit-group-error').addClass('hide');
            }).off('change.groups').on('change.groups', function () {
                $('.js-edit-group-error').addClass('hide');
            });

            $('#image-edit-link').off('click.groups').on('click.groups', function () {
                $('.add-border').removeClass('add-border');
                loadImageForEdit();
            });

            $('#save-edit-image').off('click.groups').on('click.groups', function () {
                editElement = $('.add-border').find('img');
                if (editElement.length) {
                    $('#group-image').attr('src', editElement.attr('src'));
                    $('#group-image').attr('data-resourcerevisionid', editElement[0].id);
                }
                editElement = '';
                saveGroupDetails();
                $('#editImageModal').find('.close-reveal-modal').trigger('click');
            });

            $('#cancel-edit-image').off('click.groups').on('click.groups', function () {
                $('#editImageModal').find('.close-reveal-modal').trigger('click');
            });

            $('ul.side-nav li a').off('click.home-links').on('click.home-links', function (event) {
                if (window.innerWidth > 767) {
                    if ($(this).parent().hasClass('active')) {
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }
                }
            });
            $('#getAppLink').off('click.groups').on('click.groups', function () {
                $('#appLinks').toggleClass('hide');
            });
            $('body').off('navigateBack.group-menu').on('navigateBack.group-menu', function () {
            	$('#app-link-mobile').addClass("hide-important");
                if ($('#group-info-container').hasClass('hide-content')) {
                    $('#group-info-container').removeClass('hide-content');
                    $('#group-info-container').parent().height($('#group-info-container').height() + 30);
                    $('#group-details-container .group-menu-button a').html('Back to Page');
                    $('#group-details-container>div:gt(0)').toggleClass('hide-content');
                    $('.content-wrap').toggleClass('show-title');
                } else {
                    location.href = '/my/groups/';
                }
            });

            $('#group-info-cancel-small').off('click.groups').on('click.groups', function () {
                $('.js-large-edit').removeClass('hide-small');
                $('.js-small-edit').addClass('hide-important');
            });

            $('#group-info-save-small').off('click.groups').on('click.groups', function () {
                if ($.trim($('#group-name-edit-small').val()).length) {
                    saveGroupDetails();
                } else {
                	ModalView.alert('Enter a name for your group. For example: Math Geeks Unite!');
                }
            });
            $('#group-edit-image-small').off('click.groups').on('click.groups', function () {
                $('#editImageModal').foundation('reveal', 'open');
                loadImageForEdit();
                $('.js-image-edit-border').parent().removeClass('add-border').children().removeClass('group-image-select');
                $('.js-image-edit-border').filter(function () {
                    return $(this).prop('src') === $('#group-image-edit-small')[0].src;
                }).parent().addClass('add-border').children().eq(1).addClass('group-image-select');
            });
        }
        function urlResolver(groupInfo){
        	var hashParam = window.location.hash.substr(1).replace('/',''),
        		addMember = (hashParam === "add_members" && groupInfo.groupType !== 'study') ? true :false;
        	return {
        		addMember : addMember
        	}

        }
        function renderUIForHashparam(){
        	if(hashParam.addMember){
			 // group.roster controller makes an call to check for students.
			 // Delaying this trigger slightly to allow for that call to complete.
			 // This will inlcude the add existing students option if applicable.
			 window.setTimeout(function(){
        		   $('.js-members-add-students-btn').trigger('click');
			 }, 1000);
        	}
        }
        function loadImageForEdit() {
            groupInfoController.getAllGroupImages().done(function (groupImages) {
                require(['text!groups/templates/group.edit.image.html'], function(imageTemplate) {
                    var imageHTML;
                    if (groupImages instanceof Array && groupImages.length) {
                        $('#image-select').empty();
                        $('.js-group-image-edit > edit-image-border-wrapper').remove();
                        $('.js-group-image-edit').empty();
                        for (var index = 0; index < groupImages.length; index++) {
                            imageHTML = imageTemplate;
                            imageHTML = imageHTML.replace(/@@src@@/g, groupImages[index].uri || '');
                            imageHTML = imageHTML.replace(/@@alt@@/g, groupImages[index].originalName.replace(/\..+/g, '').replace(/_/g, ' ') || '');
                            imageHTML = imageHTML.replace(/@@resourceRevisionID@@/g, groupImages[index].resourceRevisionID || '');
                            $('.js-group-image-edit').append(imageHTML);
                        }
                    }
                    //handler for group image selection
                    $('.js-image-edit-border').off('click.groups').on('click.groups', function () {
                        $('.js-image-edit-border').parent().removeClass('add-border');
                        $(this).parent().addClass('add-border');
                        $('.image-container span').removeClass('group-image-select');
                        $(this).parent().children().eq(1).addClass('group-image-select');
                        $('#group-image-edit-small')[0].src = $(this)[0].src;
                        $('#group-image-edit-small').attr('data-resourcerevisionid', this.id);
                        $('.edit-image-close-icon:visible').trigger('click');
                    });
                });
            });
        }

        function render(pageContainer, groupImages, groupInfo, callBack, hideDetailsHeader, returnGroupDetails) {
            $('.content-wrap').addClass('no-padding');
            qaEnabled = groupInfo.enableQA;
            util.ajaxStart();
            require(['text!groups/templates/group.info.html'], function (pageTemplate) {
            	if(window.location.href.indexOf('group-assignments') == -1) {
            		pageTemplate = pageTemplate.replace('@@hide@@', " hide");
            		pageTemplate = pageTemplate.replace('@@hide-important@@', "hide-important");
            		pageTemplate = pageTemplate.replace('@@web-hide-important@@', "hide-important");
                 }
                 else {
	                pageTemplate = pageTemplate.replace('@@hide-important@@', "");
                 	pageTemplate = pageTemplate.replace("@@hide@@", "");
                 }

            	if(navigator.userAgent.indexOf("Android")>-1){
            		pageTemplate = pageTemplate.replace(/@@link-to-mobile-app@@/g, "https://play.google.com/store/apps/details?id=org.ck12.app.practice");
            	}
            	else if(navigator.userAgent.indexOf("Mac OS")>-1){
					pageTemplate = pageTemplate.replace(/@@link-to-mobile-app@@/g, "https://itunes.apple.com/us/app/ck-12/id909343639?ls=1&mt=8");
				}
		// Store group type
		pageTemplate = pageTemplate.replace('@@groupType@@', groupInfo.groupType.toLowerCase());

                pageContainer.innerHTML = pageTemplate;
                var groupDescription, isGropupLeader, ck12PeerHelpClientID, phFilters, $groupDiscussionLink = $('#group-discussions-link');
                groupID = groupInfo.id;
                isGropupLeader = false;

                $('#group-home-link').attr('href', '/group/' + groupID);
                $('#group-assignments-link').attr('href', '/group-assignments/' + groupID);
                $('#group-reports-link').attr('href', '/group-reports/' + groupID + '/');
                $('#group-resources-link').attr('href', '/group-resources/' + groupID);
                $('#group-members-link').attr('href', '/group-members/' + groupID);
                $('#group-settings-link').attr('href', '/group-settings/' + groupID);
                if(groupInfo.enableQA === false) {
                    $groupDiscussionLink.removeAttr('href').parent().addClass('QAdisabled');
                } else {
                    $groupDiscussionLink.attr('href', '/group-discussions/' + groupID).parent().removeClass('QAdisabled');
                }
                $groupDiscussionLink.attr({
                    'data-allow-anonymous': groupInfo.allowAnonymous,
                    'data-enable-qa': groupInfo.enableQA
                });

                $('#group-members-count').html(groupInfo.membersCount || '0');
                $('#group-resources-count').html(groupInfo.resourcesCount || '0');
                $('#group-assignments-count').html(groupInfo.assignmentsCount || '0');

                // Get PeerHelp post count (group discussions post count)
                ck12PeerHelpClientID = 24839961;
                phFilters = {
                    groupIDs: [groupID]
                };
                phFilters = JSON.stringify(phFilters);
                if (!window.PeerHelp) {
                    $.ajax({
                        type: 'GET',
                        url: '/peerhelp/api/get/posts?clientID=' + ck12PeerHelpClientID + '&filters=' + phFilters,
                        cache: false,
                        success: function (data) {
                            if (data.response.total !== undefined) {
                                $('#group-discussions-count').html(data.response.total);
                            }
                        },
                        error: function () {
                            $('#group-discussions-count').html(0);
                            console.log('error in Q&A GET');
                        }
                    });
                }

                if (!hideDetailsHeader) {
                    $('#group-name').text(groupInfo.name || '');
                    $('#group-name').attr('data-access-code', groupInfo.accessCode || '');
                    $('#group-name-edit').val(groupInfo.name || '');
                }

                groupDescription = groupInfo.description;
                if (groupDescription) {
                    $('#group-description').text(groupDescription);
                    $('#group-description-edit').val(groupDescription);
                } else {
                    $('#description-container').addClass('hide');
                    if (groupInfo.creator && $(pageContainer).attr('data-user') === groupInfo.creator.authID.toString()) {
                        $('#no-description-conatiner').removeClass('hide');
                    }
                }

                if (groupInfo.creator && $(pageContainer).attr('data-user') === groupInfo.creator.authID.toString()) {
                    $('.js-group-detail-edit').removeClass('hide');
                    isGropupLeader = true;
                } else {
                    $('#image-edit-link').remove();
                    $('.qa-setting-tooltip').remove();
                }

                if (groupInfo.resource) {
                    $('#group-image').attr('src', groupInfo.resource.uri || '');
                    $('#group-image').attr('data-resourcerevisionid', groupInfo.resource.id || '');
                }

                if ('class' !== groupInfo.groupType) {
                    $('.only-for-class').remove();
                }

                groupID = {
                    'groupID': groupID
                };
                if (returnGroupDetails) {
                    callBack(groupInfo, isGropupLeader);
                } else {
                    callBack(groupID);
                }

                rosterGroup = {
                    id: groupInfo.id,
                    accessCode: groupInfo.accessCode,
                    name: groupInfo.name
                }
                bindEvents();
                hashParam = urlResolver(groupInfo);
                renderUIForHashparam()
            });
        }

        function updateStudyTrackCount(count) {
          if (typeof count === 'number' && count > 0) {
            var assignment = $('#group-assignments-count').text();
            $('#group-assignments-count').text(assignment + ' / '+ count);
            $('#group-assignments-count').width('auto');
            //now pad it a bit
            var width = $('#group-assignments-count').width();
            $('#group-assignments-count').width(width + 12);
          }
        }

        this.render = render;
        this.updateStudyTrackCount = updateStudyTrackCount;
    }
    return new groupInfoView();
});
