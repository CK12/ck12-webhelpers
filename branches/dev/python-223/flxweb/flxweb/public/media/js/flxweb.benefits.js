define(['jquery', 'fn/foundation/foundation.cookie'], function ($) {
    'use strict';

    function BenefitsLanding() {
        var arrivalElement, currentElement, arrived = false;

        function reloadImage(self) {
            var destination = $(self).parents('li:first').data('magellan-arrival');
            destination = $('[data-magellan-destination="' + destination + '"]').siblings(':last').find('img:visible');
            if (destination.length) {
                destination.prop('src', (destination.prop('src') || destination.data('src')).split('?')[0] + '?' + (new Date().getTime()));
            }
        }

        function loadImage() {
            this.removeAttribute('src');
            this.src = $(this).data('src');
            this.removeAttribute('data-src');
        }

        function changeRole(role) {
            var element;
            try {
                if ($('body').hasClass('side-bar-active')) {
                    $('#side-reveal-icon').trigger('click');
                }
                role = role || 'student';
                if ('teacher' === role) {
                    element = $('.js-teacher');
                } else {
                    element = $('.js-student');
                }
                $('.js-common').removeClass('hide');
            } catch (e) {
                role = 'student';
                element = $('.js-student').add('.js-common');
            }
            element.removeClass('hide');
            element = element.filter('img[data-src]').length ? element.filter('img[data-src]') : element.filter('img');
            element.each(loadImage);
            return role;
        }

        function scrollToDestination(self) {
            var destination;
            if ($(self.hash).offset().top > $(document).height() - $(window).height()) {
                destination = $(document).height() - $(window).height();
            } else {
                destination = $(self.hash).offset().top;
            }
            $('html,body').animate({
                scrollTop: destination
            }, (self.time || 1000), 'swing', function () {
                location.hash = self.hash;
            });
        }

        function bindEvents() {
            $('.js-switch').off('click.switch').on('click.switch', function () {
                $('.js-teacher').add('.js-student').addClass('hide');
                var role = changeRole($(this).data('switch'));
                $.cookie('flxweb_role', role);
            });
            $('[data-magellan-arrival]').off('arrival.reload').on('arrival.reload', function () {
                currentElement = this;
                if (!arrived) {
                    arrived = true;
                    setTimeout(function () {
                        if (arrivalElement !== $(currentElement).data('magellan-arrival')) {
                            arrivalElement = $(currentElement).data('magellan-arrival');
                            reloadImage($(currentElement).children());
                        }
                        arrived = false;
                    }, 10);
                }
            });
            $('.js-link').off('click.link').on('click.link', function (e) {
                if (!this.hash) {
                    return;
                }
                if ($('body').hasClass('side-bar-active')) {
                    var self = this;
                    $('#side-reveal-icon').trigger('click');
                    $('.js-link').removeClass('active');
                    $(self).addClass('active');
                    setTimeout(function () {
                        scrollToDestination(self);
                    }, 500);
                } else if ($('#side-reveal-icon').is(':hidden')) { // navigation shows
                    e.preventDefault();
                    scrollToDestination(this);
                }
            });
        }

        this.init = function () {
            arrivalElement = 'header_' + (location.hash || '#dashboard').split('#')[1];
            $('.js-sign-in').attr('data-return', '/my/dashboard');
            try {
                changeRole(($.cookie('flxweb_role') || '').toLowerCase());
            } catch (e) {
                console.log('Couldn\'t read cookie. Defaulting to student view');
                changeRole();
            }
            scrollToDestination({
                'hash': location.hash || '#dashboard',
                'time': 1
            });
            bindEvents();
        };

    }

    return new BenefitsLanding();

});