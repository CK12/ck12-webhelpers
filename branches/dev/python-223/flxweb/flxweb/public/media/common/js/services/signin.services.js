define(['common/utils/utils'], function (util) {
    'use strict';

    function signInService() {
        function signIn(callback, signInData) {
            util.ajax({
                url: util.getApiUrl('auth/login/member', true),
                data: signInData,
                dataType : 'json',
                method: 'POST',
                type: 'POST', // $.ajax requires 'type' for post method
                isPageDisable: true,
                isShowLoading: true,
                xhrFields:{
                    withCredentials: true
                },
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

        this.signIn = signIn;
    }

    return new signInService();
});
