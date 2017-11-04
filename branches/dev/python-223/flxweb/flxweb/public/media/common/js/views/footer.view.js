/* global ads_userid */
define(['jquery', 'common/views/share.via.email.view', 'common/utils/user', 'common/views/shareplane.view'],
    function ($, ShareEmailView, User) {

        'use strict';

        var userDetails = {
            'user_email': '',
            'loggedin': false
        };

        function adjustSharePosition() {
            var $sharePlane = $('#sharePlaneWrapper').find('.js-share-plane');
            if ($sharePlane.length) {
                if (window.innerWidth > 1200) {
                    if ($sharePlane.hasClass('absolute')) {
                        $sharePlane.css('right', '-70px');
                    } else {
                        $sharePlane.css('right', $sharePlane.parent().offset().left - 70);
                    }
                } else {
                    $sharePlane.css('right', '10px');
                }
            }
        }

        function footerView() {
            function rePositionPlane() {
                var $sharePlane = $('#sharePlaneWrapper').find('.js-share-plane'),
                    pos = $(document).height() - ($(window).height() + $('footer').outerHeight());

                if ($sharePlane.length) {
                    if ($(window).scrollTop() < pos && window.innerWidth > 1200) {
                        $sharePlane.removeClass('absolute');
                    } else {
                        $sharePlane.addClass('absolute');
                    }
                    adjustSharePosition();
                }
            }

            function bindShareEvents() {
                var $sharePlane = $('#sharePlaneWrapper').find('.js-share-plane');
                $(window).off('resize.share').on('resize.share', rePositionPlane);

                $(window).off('scroll.share').on('scroll.share', function () {
                    if (!$sharePlane.hasClass('flying')) {
                        rePositionPlane();
                    }
                });
            }

            function bindEvents() {
                $('#myModal').one('open', function () {
                    var ifhtml = '<iframe width="640" height="480" frameborder="0" allowfullscreen="" src="//www.youtube.com/embed/jbN-fPQnBeQ?rel=0" type="text/html" class="youtube-player"></iframe>';
                    $('.flex-video').append(ifhtml);
                });
                $('.footer-share-email-link').off('click.footer').on('click.footer', function () {
                    ShareEmailView.open({
                        'shareTitle': 'Learn About CK-12 Foundation',
                        'shareUrl': window.location.href,
                        'shareBody': 'Hi: <br/> I thought you\'d like to know about CK-12.<br/>CK-12 Foundation is a non-profit organization that provides free access to high-quality, educational resources to students and teachers worldwide.<br/>Go to <a target="_blank" href="http://www.ck12.org?utm_medium=email&utm_campaign=shares&utm_source=home">www.ck12.org</a> for math and science practice, videos, readings, flashcards and much more.<br/><br/>Thanks!',
                        'userSignedIn': window.ck12_signed_in || false,
                        'context': 'Share CK-12 Foundation',
                        'payload': {
                            'memberID': ads_userid
                        },
                        'userEmail': userDetails.user_email || '',
                        '_ck12': true
                    });
                    if (window.innerWidth < 768) {
                        window.scrollTo(0, 0);
                    }
                });
                if($('#back_to_top_page')){
                    $('#back_to_top_page').off('click').on('click',function(e){
                        e.preventDefault();
                        window.scrollTo(0, 0);
                    });
                }
            }

            function fetchUserInfo() {
                if (!(window.ck12_signed_in)) {
                    var user = new User();
                    user.deleteUserInfo();
                    return false;
                }
                else{
                    User.getUser().then(function(user) {
                        if(window.ck12_signed_in) {
                            userDetails = {
                                'user_email': user.userInfoDetail.email || '',
                                'loggedin': true
                            };
                        }
                    });
                }
            }

            function shareCloseCallback() {
                if (window.innerWidth < 768) {
                    $('#sharePlaneWrapper').find('.js-share-plane').removeClass('absolute');
                }
                rePositionPlane();
            }

            function initShare(shareData) {
                User.getUser().then(function(user) {
                    if(user.isLoggedIn()) {
                        userDetails = {
                            'user_email': user.userInfoDetail.email || '',
                            'loggedin': true
                        };
                    }
                    if (shareData) {
                        shareData.userEmail = userDetails.user_email || '';
                        shareData.userSignedIn = window.ck12_signed_in || false;
                        var options = {
                            'shareData': shareData,
                            'planeContainerId': 'sharePlaneWrapper',
                            'shareCloseCallback': shareCloseCallback
                        };
                        window.loadSharePlane(options);
                        $('.share-plane-container').removeClass('hide');
                        bindShareEvents();
                        rePositionPlane();
                    }
                });
            }

            function init() {
                var date = new Date();
                $('.copy-right-year').html('&copy; CK-12 Foundation ' + date.getFullYear());
                bindEvents();
                fetchUserInfo();
            }

            this.init = init;
            this.initShare = initShare;
        }
        return new footerView();
    });
