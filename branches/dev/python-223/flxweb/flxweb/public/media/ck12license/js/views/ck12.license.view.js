define(['jquery','fn/foundation/foundation.reveal'], function ($) {
    'use strict';

    var licenseController;

    require(['ck12license/controllers/ck12.license'], function (controller) {
        licenseController = controller;
    });

    function ck12LicenseView() {
        function renderLicenseInformation() {
            require(['text!ck12license/templates/ck12.license.content.html'], function (licenseContent) {
                $('#license-content').html(licenseContent);
                bindEvents();
            });
        }

        function render(container) {
            require(['text!ck12license/templates/ck12.license.container.html'], function (pageTemplate) {
                $('#'+container).html(pageTemplate);
                $('#licenseModal').foundation('reveal', 'open');
                renderLicenseInformation();
            });
        }

        function bindEvents() {
            $('#continue_btn').off('click.accept').on('click.accept', updateProfile);
            function continueCallback() {
                $('.close-reveal-modal', '#licenseModal').trigger('click');
                $('.reveal-modal-bg').css({'display':'none'});
                licenseController.showProfileBuilder();
            }

            function updateProfile(e) {
                e.preventDefault();
                var member = {
                    'isLicenseAccepted':true
                };
                licenseController.updateMemberInformation(continueCallback, member);
            }

        }
        this.render = render;
    }
    return new ck12LicenseView();
});
