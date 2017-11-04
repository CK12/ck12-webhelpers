/**
 * Copyright 2007-2011 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Ravi Gidwani
 *
 * $Id: flxweb.landing.new.js 12422 2011-08-19 22:51:58Z ravi $
 */
define(
    ['jquery', 'underscore',
        'common/utils/utils',
        'common/controllers/search',
        'js/flxweb.load.my.subjects',
        'jquery.appdownload', 'jquery-ui', 'jquery.autocomplete','hammer','jquery.simple-text-rotator',
    ],
    function ($, _, util, search, loadMySubjects) {
        'use strict';

        var mapInitialized = false,
            latitude = 40.98,
            longitude = -99.19;

        function addSmartBanner() {
            if ($.smartbanner) {
                $.smartbanner({
                    title: 'CK-12',
                    author : "CK-12 Foundation",
                    daysHidden: 2,
                    daysReminder: 2,
                    icon: "/media/images/logo_120.png",
                    iOSUniversalApp: true,
                    appendToSelector: $('.content-wrap-landing')
                });
            }
        }

        function navigateTestimonial(index, direction) {
            var count, $next, $prev, $current, $last;
            $current = $('.js-individual-testimonial:nth-child(' + (index % 3 + 1) + ')');
            count = $('.js-individual-testimonial').length;
            $('.no-transition').removeClass('no-transition');
            $next = $current.next();
            $prev = $current.prev();
            if (!$next.length) {
                $next = $('.js-individual-testimonial:nth-child(1)');
            }
            if (!$prev.length) {
                $prev = $('.js-individual-testimonial:nth-child(' + count + ')');
            }
            if (direction === 'left') {
                $next.addClass('no-transition');
            } else {
                $prev.addClass('no-transition');
            }
            $current.css('left', "0%");
            $next.css('left', (100/count) + '%');
            $prev.css('left', -(100/count) + '%');
            $('.js-individual-testimonial.active').removeClass('active');
            $current.addClass('active');
            $('.fadeIn').removeClass('fadeIn');
            $current.find('.student-testimonial-text').addClass('fadeIn');
            $current.find('img').addClass($current.attr('data-class'));
            $('.js-option-button.active').removeClass('active');
            $('.js-option-button:nth-child(' + (index + 1) + ')').addClass('active');
        }

        function bindevents() {
            var drag, index,
            firstTime = true;

            $('.js-scroll-top').off('click.icon-arrow_down').on('click.icon-arrow_down', function () {
                $('html, body').animate({
                    scrollTop: '1'
                });
            });
            $('body').off('click.app').on('click.app', function(e) {
                if (!$(e.target).parents('.dropdown').length) {
                    $('.f-dropdown.open').removeClass('open').css('display', 'none');
                } else if (!$(e.target).parents('.dropdown').prev().hasClass('open')) {
                    $('.f-dropdown.open').removeClass('open').css('display', 'none');
                }
            });

            Hammer('.js-student-testimonials-wrapper').off('dragleft.drag').on('dragleft.drag', function () {
                drag = 'left';
            });
            Hammer('.js-student-testimonials-wrapper').off('dragright.drag').on('dragright.drag', function () {
                drag = 'right';
            });
            Hammer('.js-student-testimonials-wrapper').off('release.drag').on('release.drag', function () {
                index = $('.js-individual-testimonial.active').index();
                if (drag === 'left') {
                    drag = undefined;
                    if ((index + 2) <= $('.js-individual-testimonial').length) {
                        navigateTestimonial(index + 1, 'left');
                    } else {
                        navigateTestimonial(0, 'left');
                    }
                } else if (drag === 'right') {
                    drag = undefined;
                    if (index > 0) {
                        navigateTestimonial(index - 1, 'right');
                    } else {
                        navigateTestimonial($('.js-individual-testimonial').length - 1, 'right');
                    }
                }
            });
            $('.js-right-navigate').off('click.navigate').on('click.navigate', function() {
                index = $('.js-individual-testimonial.active').index();
                if ((index + 2) <= $('.js-individual-testimonial').length) {
                    navigateTestimonial(index + 1, 'left');
                } else {
                    navigateTestimonial(0, 'left');
                }
            });
            $('.js-left-navigate').off('click.navigate').on('click.navigate', function() {
                index = $('.js-individual-testimonial.active').index();
                if (index > 0) {
                    navigateTestimonial(index - 1, 'right');
                } else {
                    navigateTestimonial($('.js-individual-testimonial').length - 1, 'right');
                }
            });
            $('.js-option-button').off('click.navigate').on('click.navigate', function() {
                var destIndex, sourceIndex;
                sourceIndex = $('.js-option-button.active').index();
                destIndex = $(this).index();
                if (destIndex === sourceIndex + 1) {
                    navigateTestimonial(sourceIndex + 1, 'left');
                } else if (destIndex === sourceIndex - 1) {
                    navigateTestimonial(sourceIndex - 1, 'right');
                } else if (destIndex === sourceIndex + 2) {
                    navigateTestimonial(2, 'right');
                } else if (destIndex === sourceIndex - 2) {
                    navigateTestimonial(0, 'left');
                }
            });

            $(document).off('scroll.testimonial').on('scroll.testimonial', function() {
                var scrollTop, top, height, $active;
                if (firstTime && window.pageType === 'Student Home') {
                    top = $('.js-student-testimonials-wrapper').offset().top;
                    height = $('.js-student-testimonials-wrapper').height();
                    scrollTop = $(window).scrollTop();
                    if (top > scrollTop && top < (scrollTop + $(window).height() - height)) {
                        $active = $('.js-individual-testimonial.active');
                        $active.find('img').addClass($active.attr('data-class'));
                        $active.find('.student-testimonial-text').addClass('fadeIn');
                        firstTime = false;
                    } else {
                        $('.fadeIn').removeClass('fadeIn');
                    }
                }
            });
            $('.js-expand-more').off('click.expand').on('click.expand', function() {
                var height, $container, $this = $(this);
                $container = $('.student-testimonials-container');
                $this.addClass('hide');
                $this.parents('.js-student-testimonial-text-wrapper').css('height', $(this).siblings('.student-testimonial-text').outerHeight());
                $this.siblings('.js-blur-testimonial-text').css('opacity', '0');
                $('.js-student-testimonials').addClass('expand');
            });

            $('.js-jumpstart-banner-wrapper').off('click.jumpstart').on('click.jumpstart', function() {
            	window.location.href = "https://www.ck12.org/certified/";
            });

            $('.ck-12-mission-getStarted').off('click.getStartedSigninPopUp').on('click.getStartedSigninPopUp', function() {
                $('#top_nav_signin').trigger('click');
            });

            $('#overviewVideoModal').one('open', function () {
                var ifhtml = '';
                if ('Teacher Home' === window.pageType){
                    ifhtml = '<iframe width="640" height="480" frameborder="0" allowfullscreen="" src="//www.youtube.com/embed/gNlTpg9FKCo?rel=0" type="text/html" class="youtube-player"></iframe>';
                } else {
                    ifhtml = '<iframe width="640" height="480" frameborder="0" allowfullscreen="" src="//www.youtube.com/embed/NvpeBG97Zh8?rel=0" type="text/html" class="youtube-player"></iframe>';
                }
                $('.flex-video').append(ifhtml);
            });
        }

        function bindEventsforEpisd() {
            $('#episd-video-link').off('click.episd').on('click.episd', function () {
                $('.episd-row').addClass('expand');
            });
            $('.close-video-icon').off('click.episd').on('click.episd', function () {
            	$('.episd-row').removeClass('expand');
                var $tutorialVideo = $('.episd-video-iframe'),
                iframe = $tutorialVideo[0].contentWindow;
                iframe.postMessage(JSON.stringify({
                    event: 'command',
                    func: 'pauseVideo',
                    args: ''
                }), 'https://www.youtube.com');
            });
        }

        function showCbseBanner() {
            util.getLocation().done(function(data){
                if (data.country_long === 'india') {
                    $('.show-for-india').removeClass('hide-banner hide-important');
                }
            });
        }

        function domReady() {
            var ua = navigator.userAgent;
            var animationType = 'flipUp';
            if (ua.indexOf('Trident') !== -1
                || ua.indexOf('MSIE') !== -1
                //|| ( (ua.indexOf('Safari') !== -1) && (ua.indexOf('Edge') === -1) )
            ){
                animationType = 'none';
            }
        	$(".rotate").textrotator({
      	        animation: animationType,
      	        separator: ", ",
      	        speed: 5000,
      	        conceptEid: {
              	  "Exponential Decay." : "SCI.CHE.613",
            	  "Parabolas." : "SCI.PHY.350",
            	  "Angles." : "SCI.PHY.346",
            	  "Average Rate of Change." : "SCI.PHY.123",
            	  "Period and Frequency." : "SCI.PHY.171.1",
            	  "Pendulum." : "SCI.PHY.171.2",
            	  "Vectors." : "SCI.PHY.112",
            	  "Vector Addition." : "SCI.PHY.113",
            	  "Radioactive Decay as a Measure of Age." : "SCI.ESC.714.2"
              }
      	    });
            showCbseBanner();

            loadMySubjects();
            // load android app message
            addSmartBanner();
            //fire dexter FBS_VIEW
            var payload = {};
            var referrer;
            if ('Teacher Home' === window.pageType) {
                referrer = 'teacher_landing';
                payload['page_type'] = 'teacher';
            } else {
                referrer = 'student_landing';
                payload['page_type'] = 'student';
            }
            payload['page'] = 'landing';
            if (window._ck12) {
                window._ck12.logEvent('fbs_view', payload);
            }
            $('.js-sign-in').attr('data-return', '/my/dashboard');
            bindevents();
            $(window).trigger('resize.placeholder');
            bindEventsforEpisd();
        }
        $(document).ready(domReady);

    });
