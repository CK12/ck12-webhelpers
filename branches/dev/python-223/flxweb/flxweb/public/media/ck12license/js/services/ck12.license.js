define(['common/utils/utils'], function (util) {
    'use strict';

    function ck12LicenseService() {

        function updateMemberInformation(callback, member) {
            util.ajax({
                url: '/profile/update/profileInformation/',
                data: member,
                type: 'POST',
                isPageDisable: true,
                isShowLoading: true,
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

        this.updateMemberInformation = updateMemberInformation;
    }
    return new ck12LicenseService();

});
