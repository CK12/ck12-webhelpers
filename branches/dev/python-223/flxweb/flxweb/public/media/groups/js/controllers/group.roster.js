/*
*  Roster controller for groups
* 
*/
define(['groups/services/ck12.groups','groups/utils/roster.tooltip.manager'],
    function (groupsService, rosterTooltipMGR) {

        'use strict';

        function groupRosterController() {

            var hasExistingStudents, rosterGroup = {};

            // Check to see if the group leader has existing students.
            // If there are existing students we set hasExistingStudents to true.
            // If not set hasExistingStudents to false.
            function checkForAddedStudents(results) {
		if ('error' === results.response || (0 !== results.responseHeader.status)) {
		    console.error("There was a problem fetching existing students.");
		    hasExistingStudents = false;
		} else {
		    console.log("Results for check for added students");
		    hasExistingStudents = ( results.response && results.response.students && results.response.students.length > 0) ? true : false;
		    var userRole = '';
		    var userID = '';
		    try {
			    userRole = $('.groups-container').data('user-role').toLowerCase();
			    userID = $('.groups-container').data('user');
		    } catch(e){
			    console.error("Could not get user-role");
		    }
		    if (hasExistingStudents && userID && userID === rosterGroup.creatorID && userRole && userRole !=='student') {
			    rosterTooltipMGR.bindEvents('add-members-tooltip-once');
			    if (rosterTooltipMGR.checkForTooltip('add-members-tooltip-once', true)) {
				    $('.add-members-tooltip-once').removeClass('hide-important');
			    }
		    }
		}
            }

            // Save group info for later calls to roster
            function saveGroupInfo(groupInfo) {
                if (groupInfo) {
                    rosterGroup.id = groupInfo.id;
                    rosterGroup.accessCode = groupInfo.accessCode;
                    rosterGroup.name = groupInfo.name;
                    rosterGroup.creatorID = groupInfo.creator.id;
                }
            }

            // Wrapper around Roster.init()
            // call this to launch the modal
            // Check the hasExistingStudnts flag:
            // true - We show all three menu options (menu)
            // false - We only show invite and create (menu2)
            function launchRoster(group, elementID, view) {
                var initView = !hasExistingStudents ? 'menu2': (view || 'menu');
                group = group || rosterGroup;
                Roster.init({
                    elm: document.getElementById(elementID),
                    group: group,
                    initView: initView
                });
            }

            // Makes the updateMember API call
            function updateMember(callback, memberID, propertiesObj) {
                groupsService.updateMember(callback, memberID, propertiesObj);
            }

            function load(groupDetails) {
		rosterTooltipMGR.run();
                saveGroupInfo(groupDetails);
		groupsService.getMyStudents(checkForAddedStudents, groupDetails.id);
            }

            this.launchRoster = launchRoster;
            this.updateMember = updateMember;
            this.load = load;

        }

        return new groupRosterController();
    });
