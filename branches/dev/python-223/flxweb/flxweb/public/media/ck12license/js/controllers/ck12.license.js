/* global isProfileUpdated, triggerProfileBuilder */
define([
    'ck12license/services/ck12.license'
], function (ck12LicenseService) {
    'use strict';

    var ck12LicenseView;

    function licenseController() {

        function loadCK12License(container) {
            ck12LicenseView.render(container);
        }

        function load(container, licenseView) {
            ck12LicenseView = licenseView;
            loadCK12License(container);
        }

        function updateMemberInformation(callback, member) {
            ck12LicenseService.updateMemberInformation(callback, member);
        }

        function showProfileBuilder(){
            if (!isProfileUpdated){
                //call to trigger profile builder function which is in master template
                triggerProfileBuilder();
            }
        }

        this.load = load;
        this.updateMemberInformation = updateMemberInformation;
        this.showProfileBuilder = showProfileBuilder;
    }
    return new licenseController();
});
