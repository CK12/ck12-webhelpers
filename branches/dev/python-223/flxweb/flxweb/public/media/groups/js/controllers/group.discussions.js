define([
        'groups/views/group.discussions.view',
        'groups/controllers/group.info'
    ],
    function (
        groupDiscussionsView,
        groupInfoController) {

        'use strict';

        function groupDiscussionsController() {

            var pageContainer, groupID;

            function loadDiscussions(group) {
                //groupID = id.groupID;
                groupDiscussionsView.render({groupInfo:group});
            }

            function load(container) {
                // This is the function that should invoke PeerHelp's loading mechanism
                pageContainer = container;
                groupInfoController.load(container, loadDiscussions, false, true);
            }

            this.load = load;

        }

        return new groupDiscussionsController();
    });
