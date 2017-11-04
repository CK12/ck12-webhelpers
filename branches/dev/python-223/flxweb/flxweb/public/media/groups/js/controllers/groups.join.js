define(['groups/services/ck12.groups','common/views/modal.view'], function (groupsService,ModalView) {
    'use strict';

    function groupsJoinController() {

        function joinGroupCallback(result) {
        	var modalMessage;
            if (result) {
                if ('error' === result) {
                    console.log('Sorry, we could not join you to the group at this time. Please try again later.');
                } else if (result.hasOwnProperty('message')) {
                    if (result.message.match('does not match')) {
                    	modalMessage = 'Sorry, the group you are trying to join does not exist.';
                    } else if (result.message.match('Already in the group')) {
                    	modalMessage = 'You are already a member of this group.';
                    } else {
                    	modalMessage = 'Sorry, we could not join you to the group at this time. Please try again later.';
                    }
                	ModalView.alert(modalMessage, modalMessageCallback);
                	return false;
                } else if (result.result && result.groupID) {
                    try {
                        if (result.hasOwnProperty('qa') && result.qa.hasOwnProperty('enableQA') && result.qa.enableQA) {
                            location.href = '/group-discussions/' + result.groupID;
                        } else {
                            location.href = '/group/' + result.groupID;
                        }
                    } catch (e) {
                        location.href = '/group/' + result.groupID;
                    }
                    return;
                }
            }
            location.href = '/my/groups/';
        }

        function modalMessageCallback() {
        	location.href = '/my/groups/';
        }

        function load() {
            var accessCode = location.href.split('accessCode=')[1];
            if(typeof(accessCode) !== 'undefined' && accessCode.split('&')[0]) {
                accessCode = {
                    'accessCode': accessCode
                };
                groupsService.joinGroup(joinGroupCallback, accessCode);
            } else {
            	ModalView.alert('Sorry, the group link you are trying to access is incorrect. Did you misspell it?', modalMessageCallback);
            }
        }

        this.load = load;
    }

    return new groupsJoinController();
});