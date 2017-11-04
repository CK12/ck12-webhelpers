define(['groups/views/group.info.view',
    'groups/services/ck12.groups',
    'common/views/modal.view',
    'groups/controllers/group.roster'
], function (groupInfoView,
    groupsService,
    ModalView,
    groupRosterController) {

    'use strict';

    function groupInfoController() {

        var pageContainer, pageCallBack,
            groupDetails = '',
            errorShown = false,
            hideDetailsHeader = false,
            returnGroupDetails = false;

        function checkForCountStudyTrack(studytrack) {
          if ('error' === studytrack) {
              if (!errorShown) {
                  errorShown = true;
                  console.log("Sorry, we could not load your studytrack count. Please try again after some time.");
              }
              groupDetails = '';
          } else {
              groupInfoView.updateStudyTrackCount(studytrack.response.count);
          }
        }

        function checkForInfo(group) {
            if ('error' === group) {
                if (!errorShown) {
                    errorShown = true;
                    console.log("Sorry, we could not load your group's details right now. Please try again after some time.");
                }
                groupDetails = '';
            } else if (0 !== group.responseHeader.status) {
                if (group.response.message.match('does not exist') || group.response.message.match("doesn't exist")) {
                    if (!errorShown) {
                        errorShown = true;
                        ModalView.alert('Sorry, the group you are trying to access does not exist.');
                        location.href = '/my/groups';
                    }
                    groupDetails = '';
                } else {
                    if (group.response.message.match('not a member')){
                        require(['groups/views/group.non.member.view'], function (groupNonMemberView) {
                                groupNonMemberView.render(document.body);
                        });
                        return false;
                    }
                    if (!errorShown) {
                        errorShown = true;
                        ModalView.alert("Sorry, we could not load your group's details right now. Please try again after some time.");
                    }
                    groupDetails = '';
                }
            } else if (group && group.response && group.response.group.groupType === 'public-forum') {
                if (!errorShown) {
                    errorShown = true;
                    ModalView.alert('Sorry, the group you are trying to access does not exist.');
                    location.href = '/my/groups';
                }
                groupDetails = '';
            } else {
                group = group.response.group;
                groupInfoView.render(pageContainer, groupDetails, group, pageCallBack, hideDetailsHeader, returnGroupDetails);
                groupRosterController.load(group);
            }
            groupsService.countStudyTrack(checkForCountStudyTrack);
        }

        function checkForImages(images) {
            if ('error' === images) {
                if (!errorShown) {
                    errorShown = true;
                    console.log('Sorry, we could not load the images for groups.');
                }
                images = '';
            } else if (0 !== images.responseHeader.status) {
                if (!errorShown) {
                    errorShown = true;
                    ModalView.alert('Sorry, we could not load the images for groups.');
                }
                images = '';
            } else {
                images = images.response.resources;
                if (groupDetails) {
                    groupInfoView.render(pageContainer, images, groupDetails, pageCallBack, hideDetailsHeader, returnGroupDetails);
                } else {
                    groupDetails = images;
                }
            }
        }

        function load(container, callBack, hideHeader, returnDetails) {
            var groupID, questionID, matches;
            if(window.location.search.indexOf('quizHandle=') !== -1){
            	$('#group-assignments').addClass('hide');
            }
            if (hideHeader) {
                hideDetailsHeader = hideHeader;
            }
            if (returnDetails) {
                returnGroupDetails = returnDetails;
            }
            pageContainer = container;
            pageCallBack = callBack;
            if (location.pathname.indexOf('/group-discussions/') !== -1) {
                matches = location.pathname.match(/\/group-discussions\/(\d+)(\/question\/([^\/\s]*))?/);
                groupID = matches[1];
                questionID = matches[3];
            } else {
                groupID = location.pathname.split('/');
                groupID = groupID[groupID.length - 1] || groupID[groupID.length - 2];
            }
            //TODO: Shishir use the questionID as needed
            groupID = {
                'groupID': groupID
            };
            groupsService.getGroupInfo(checkForInfo, groupID);
        }

        function updateGroup(callback, group) {
            groupsService.updateGroup(callback, group);
        }

        function getAllGroupImages() {
            return groupsService.getImages();
        }

        this.load = load;
        this.updateGroup = updateGroup;
        this.getAllGroupImages = getAllGroupImages;

    }

    return new groupInfoController();
});
