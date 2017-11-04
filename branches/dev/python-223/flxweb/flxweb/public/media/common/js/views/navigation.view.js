/* global _ck12 */
define([
    'jquery',
    'notification/views/notification.view',
    'common/views/footer.view',
    'common/utils/user',
    'common/utils/browser.sniffer'
],
function ($, NotificationView, FooterView, User) {
    'use strict';

    function NavigationView() {

        //var noScrollHeaderHeight = 50;
        var notifications = null,
            overlayRemoveDate = '12/30/2015';

        function displayMessage(data) {
            var $browserDetect = $('#browserDetect');
            if (data === 'olderVersion') {
                $('#browserVersion').html('You are using an older version of browser that CK-12 no longer supports. Please <a href="http://browsehappy.com" target="_blank">upgrade to the latest </a> version for a better experience.');
            } else {
                $('#browserVersion').text('Please turn off compatibility mode of your browser for a better experience.');
            }
            $browserDetect.removeClass('hide');
            $browserDetect.find('a:last').off('click.close').on('click.close', function () {
                $browserDetect.addClass('hide');
            });
        }

        function detectBrowser() {
            if (window.BrowserDetect.browser === 'Explorer') {
                // For explorer greater than ie7 'Trident' will present in userAgent and is constant for a version irrespective of compatibility mode
                // for ie 8 Trident: 4
                // for ie 9 Trident: 5
                // for ie 10 Trident: 6
                $('html').addClass('ie');
                if (window.BrowserDetect.trident < 7) { // for IE 8 precedence is given for older version than that of compatibility mode
                    displayMessage('olderVersion');
                } else if ((window.BrowserDetect.version - window.BrowserDetect.trident) < 4) {
                    displayMessage('compatibiltyMode');
                } else if (window.BrowserDetect.version < 11) {
                    displayMessage('olderVersion');
                }
            }
        }

        function initNotifications() {
            //init user notifications, only if user is signed in
            User.getUser().then(function(user) {
                if (user.isLoggedIn()) {
                    var container = $(document);
                    if (container.size()) {
                        notifications = new NotificationView({
                            el: container
                        });
                    }
                }
            });
        }

        function showNavigation() {
            $('body').addClass('side-bar-active nav-visible-body').css('height', $(window).height());
            $('#top-bar-left-section').parent().addClass('nav-visible-section').css('height', $(window).height());
            $('footer').addClass('hide-important');
        }

        function hideNavigation() {
            setTimeout(function () {
                $('body').removeClass('side-bar-active nav-visible-body').css('height', 'auto');
                $('.side-bar-expanded').removeClass('expanded');
                $('footer').removeClass('hide-important');
                $('#top-bar-left-section').parent().removeClass('nav-visible-section');
            }, 500);
        }

        function toggleNavigation() {
            if ($('body').hasClass('side-bar-active')) {
                hideNavigation();
            } else {
                showNavigation();
            }
        }

        function showNotificationPopup() {
            hideNavigation();
            notifications.showPopup();
        }

        function customizeZendesk() {
            if ($('#zenbox_overlay').is(':Visible')) {
                var offset, height, top;
                offset = $('#zenbox_tab').offset().top;
                height = $('#zenbox_body').height();
                top = offset - height;
                $('#zenbox_container').css('top', top);
            }
        }

        function bindEvents() {
            $('#zenbox_tab').off('click.customize').on('click.customize', function () {
                if ($(window).width() < 768) {
                    setTimeout(customizeZendesk, 1000);
                }
            });

            window.addEventListener('orientationchange', function () {
                if ($('body').hasClass('side-bar-active')) {
                    $('#top-bar-left-section').parent().css('height', $(window).height());
                    $('body').css('height', $(window).height());
                }
            }, false);

            $('#search').off('click.search').on('click.search', function () {
                $('#searchContainer').removeClass('hide-important');
                $('.search-input:visible').focus();
                $('.top-bar').removeClass('expanded');
            });

            $('#searchClose').off('click.closeSearch').on('click.closeSearch', function () {
                $('#searchContainer').addClass('hide-important');
            });

            $('#side-reveal-icon').off('click.side-bar-reveal').on('click.side-bar-reveal', toggleNavigation);
            //event listener on window, so that other apps like peerhelp can show/hide side navigation
            $(window).off('toggle.small.navigation').on('toggle.small.navigation', toggleNavigation);
            //event listener to hide the navigation bar. Needed in screens like Peerhelp in forums and groups
            $(window).off('hide.small.navigation').on('hide.small.navigation',function() {
                $('body > header').addClass('hide-title-bar');
                $('#maintenanceWrapper').addClass('hide');
            });
            $(window).off('show.small.navigation').on('show.small.navigation',function() {
                $('body > header').removeClass('hide-title-bar');
                $('#maintenanceWrapper').removeClass('hide');
            });
            $('.back-icon').off('click.group-menu').on('click.group-menu', function () {
                $('body').trigger('navigateBack');
            });

            $('#notification_sidebar').off('click.notification_sidebar').on('click.notification_sidebar', showNotificationPopup);

            $(window).off('resize.menu').on('resize.menu', function () {
                if (window.innerWidth > 767) {
                    if ($('body').hasClass('side-bar-active')) {
                        $('#side-reveal-icon').trigger('click');
                    }
                    $('#top-bar-left-section').parent().css('height', 'auto');
                } else {
                    if ($('#zenbox_overlay').is(':visible')) {
                        $('#zenbox_close').trigger('click');
                    }
                }
            });
            $('.standards-link').off('click.standards').on('click.standards', function (ev) {
                if ($('#standardsDropdown').hasClass('open')) {
                    $('#standardsDropdown').removeClass('open').css({
                        left: '-99999px'
                    });
                    ev.stopPropagation();
                }
            });
            $('.js-feature-link').off('click.feature').on('click.feature', function () {
                if (window._ck12) {
                    var payload = {
                        'feature': this.href.split('#')[1]
                    };
                    _ck12.logEvent('FBS_FEATURE_NAV', payload);
                }
            });
            $('#top_nav_usermenu').off('click.user').on('click.user', function () {
                var self = this,
                    right = $(window).width() - $('.js_profile_image').offset().left;
                setTimeout(function () {
                    if (right < 125) {
                        $('#userdropmenu').addClass('left-auto').css('right', '-webkit-calc(100% - ' + right + 'px)').css('right', 'calc(100% - ' + right + 'px)');
                    } else {
                        $('#userdropmenu').removeClass('left-auto');
                    }
                    if ($('#userdropmenu').hasClass('open')) {
                        $(self).addClass('dropdown_open');
                    } else {
                        $(self).removeClass('dropdown_open');
                    }
                }, 0);
            });

            $(document).off('click.user').on('click.user', function (e) {
                var $userDropMenu = $('#userdropmenu');
                if ($userDropMenu.hasClass('open') && 'userdropmenu' !== $(e.target).data('dropdown') && 0 === $(e.target).closest('#userdropmenu').length && 0 === $(e.target).closest('#top_nav_usermenu').length) {
                $('#userdropmenu').prev().trigger('click');
                } else {
                    if($userDropMenu.siblings('#top_nav_usermenu').length !== 0) {
                        $userDropMenu.siblings('#top_nav_usermenu').removeClass('dropdown_open');
                    }
                }
            });

            $('a[href*=\'account/signout\']').on('click', function(){
                window.localStorage.removeItem('practice_app_config');	// To clear SC user details
                window.localStorage.removeItem('userResponse');
                window.localStorage.removeItem('referenceSC');
                //delete the localStorage keys with pattern *collabBooks*
                Object.keys(localStorage).forEach(function(key){
                    if (/collabBooks/.test(key)) {
                        localStorage.removeItem(key);
                    }
                });
            });

        }

        function initOverlay() {
            var _dexter_action_name = 'christmas_banner';
            var _dexter_screen_name = 'FBS_PAGE_WITH_BANNER';
            if (window.pageType){
                _dexter_screen_name = window.pageType;
                if (window.pageSubType){
                    _dexter_screen_name = _dexter_screen_name + '_' + window.pageSubType;
                }
            }
            if ((new Date() - new Date(overlayRemoveDate)) > 0) {
                $('.js-header-overlay').parent().add('#overlay-container').remove();
                $('.overlay-notify-header').parent().remove();
                return;
            }
            if (undefined === window.orientation) { // do not change, inequality with undefined ONLY is what this is supposed to be {to detect device vs desktop}
                $('.notify-holder').addClass('hide');
                $('.js-header-overlay').fadeIn(1000);
                $('.js-overlay-close').off('click.overlay').on('click.overlay', function () {
                    window.dexterjs.logEvent('FBS_ACTION', {
                        screen_name: _dexter_screen_name,
                        action_type: 'overlay_close',
                        action_name: _dexter_action_name
                    });
                    $('#overlay-container').fadeOut(1000, function () {
                        $('.js-header-overlay').fadeIn(1000);
                    });
                });
                $('.js-header-overlay').off('click.overlay').on('click.overlay', function () {
                    $(this).fadeOut(1000, function () {
                        $('#overlay-container').fadeIn(1000);
                    });
                    window.dexterjs.logEvent('FBS_ACTION', {
                        screen_name: _dexter_screen_name,
                        action_type: 'overlay_open',
                        action_name: _dexter_action_name
                    });

                });
            }
        }


        function init() {
            detectBrowser();
            if ('teacher' === ($.cookie('flxweb_role') || '').toLowerCase()) {
                $('.js-search-large').prop('placeholder', 'Search for free STEM teaching resources');
            }
            bindEvents();
            $(window).scrollTop($(window).scrollTop() + 1);
            initNotifications();
            initOverlay();
            FooterView.init();
        }

        this.init = init;
    }

    return new NavigationView();
});
