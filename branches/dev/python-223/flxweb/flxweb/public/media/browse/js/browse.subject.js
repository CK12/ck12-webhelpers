/* global ads_userid */
define(['jquery', 'underscore', 'common/utils/utils', 'common/views/footer.view', 'text!browse/templates/browse.branch.html'], function ($, _, Util, FooterView, branchTemplate) {
    'use strict';

    function browse() {

        function getBranches(subject) {
            var _d = $.Deferred();
            Util.ajax({
                url: Util.getApiUrl('taxonomy/get/info/branches/' + subject),
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function (data) {
                    _d.resolve(data.response);
                },
                error: function() {
                    _d.reject('Failed');
                }
            });
            return _d.promise();
        }

        function renderBranches(subject) {
            var template;
            $('.subject-name').parent().removeClass('hide');
            getBranches(subject).done(function(data) {
                template = _.template(branchTemplate, null, {
                    'variable': 'data'
                });
                template = template(data.branches);
                $('#browse_contentwrap').append(template);
            }).fail(function() {

            });
        }

        function render() {
            var template, subject, elaBranches;
            elaBranches = [{
                'name': 'Writing'
            }, {
                'name': 'Spelling'
            }];
            if (location.href.indexOf('math') != -1) {
                subject = 'MAT';
                $('.subject-name, title, .page-title').text('Math');
                renderBranches(subject);
            } else if (location.href.indexOf('science') != -1) {
                subject = 'SCI';
                $('.subject-name, title, .page-title').text('Science');
                renderBranches(subject);
            }else if (location.href.indexOf('english') != -1) {
                $('.subject-name, title, .page-title').text('English');
                $('.subject-name').parent().removeClass('hide');
                template = _.template(branchTemplate, null, {
                    'variable': 'data'
                });
                template = template(elaBranches);
                $('#browse_contentwrap').append(template);
            }
            initializeShare();
        }

        function initializeShare() {
            FooterView.initShare({
                'shareImage': window.location.protocol + '//' + window.location.host + '/media/common/images/logo_ck12.png',
                'shareUrl': window.location.href,
                'shareTitle': 'Subjects',
                'context': 'Share Subjects',
                'payload': {
                    'memberID': ads_userid,
                    'page': 'browse'
                },
                'userSignedIn': window.ck12_signed_in || false,
                '_ck12': true
            });
        }

        this.render = render;

    }

    return new browse();
});
