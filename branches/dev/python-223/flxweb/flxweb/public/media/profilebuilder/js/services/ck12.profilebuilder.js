define(['common/utils/utils'], function (util) {
    'use strict';

    function profileBuilderService() {
        var profileBuilderURL = {
            'profileURL': '/profile/update/profileInformation/' // flxweb api call, do not add /api at beginning
        };

        function getProfileInformation(callback, container) {
            util.ajax({
                url: profileBuilderURL.profileURL,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback) {
                        callback(result.response.result, container);
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error', container);
                    }
                }
            });
        }

        function saveUserProfile(callback, member) {
            util.ajax({
                url: profileBuilderURL.profileURL,
                isPageDisable: true,
                isShowLoading: true,
                data: member,
                type: "POST",
                success: function (result) {
                    if (callback) {
                        callback(result);
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error');
                    }
                }
            });
        }

        this.getProfileInformation = getProfileInformation;
        this.saveUserProfile = saveUserProfile;
    }
    return new profileBuilderService();

});
