/* global _ck12, Hammer */
define([
    'jquery',
    'underscore',
    'flxweb.settings',
    'common/utils/utils',
    'text!carousel/templates/carousel.wrapper.html',
    'common/utils/user',
    'hammer'
], function ($, _, settings, Util, carouselWrapper, User) {
    'use strict';

    function carousel() {

        var autoRotate, drag, pageType;
        var maxCount = 3;

        function swipeADS(description) {
            var payload = {
                'desc': description,
                'referrer': pageType
            };
            if (window._ck12) {
                _ck12.logEvent('FBS_USER_ACTION', payload);
            }
        }

        function leftNavigation($this) {
            var navIndex, index, $carouselSlider, $slider, $nav, sliderCount;
            $carouselSlider = $('.js-carousel-slider');
            $slider = $('.js-slider');
            $nav = $('.js-nav');
            sliderCount = $slider.length - 2;
            if ($this.hasClass('active')) {
                $('.js-carousel-direction').removeClass('active');
                index = $('.js-slider.active').index();
                $carouselSlider.css({
                    'transition-duration': '0.5s',
                    'margin-left': '-' + (index+1)*100 + '%'
                });
                $slider.removeClass('active');
                $('.js-slider:nth-child('+(index+2)+')').addClass('active');
                navIndex = $('.js-nav.active').index();
                $nav.removeClass('active');
                $('.js-nav:nth-child('+(navIndex+2)+')').addClass('active');
                if (navIndex === (sliderCount - 1)) {
                    $nav.removeClass('active');
                    $('.js-nav:nth-child(1)').addClass('active');
                    setTimeout(function() {
                        $carouselSlider.css({
                            'transition-duration': '0s',
                            'margin-left': '-100%'
                        });
                        $slider.removeClass('active');
                        $('.js-slider:nth-child(2)').addClass('active');
                    }, 500);
                }
                setTimeout(function() {
                    $('.js-carousel-direction').addClass('active');
                }, 500);
            }
        }

        function rightNavigation($this) {
            var navIndex, index, $carouselSlider, $slider, $nav, sliderCount;
            $carouselSlider = $('.js-carousel-slider');
            $slider = $('.js-slider');
            $nav = $('.js-nav');
            sliderCount = $slider.length - 2;
            if ($this.hasClass('active')) {
                $('.js-carousel-direction').removeClass('active');
                index = $('.js-slider.active').index();
                $carouselSlider.css({
                    'transition-duration': '0.5s',
                    'margin-left': '-' + (index-1)*100 + '%'
                });
                $slider.removeClass('active');
                $('.js-slider:nth-child('+(index)+ ')').addClass('active');
                navIndex = $('.js-nav.active').index();
                $nav.removeClass('active');
                $('.js-nav:nth-child('+(navIndex)+ ')').addClass('active');
                if (navIndex === 0) {
                    $nav.removeClass('active');
                    $('.js-nav:nth-child(' + sliderCount + ')').addClass('active');
                    setTimeout(function() {
                        $carouselSlider.css({
                            'transition-duration': '0s',
                            'margin-left': '-' + (sliderCount * 100) + '%'
                        });
                        $slider.removeClass('active');
                        $('.js-slider:nth-child(' + (sliderCount + 1) + ')').addClass('active');
                    }, 500);
                }
                setTimeout(function() {
                    $('.js-carousel-direction').addClass('active');
                }, 500);
            }
        }

        function clickNavigation($this) {
            var navIndex, $carouselSlider, $slider, $nav;
            $carouselSlider = $('.js-carousel-slider');
            $slider = $('.js-slider');
            $nav = $('.js-nav');
            navIndex = $this.index();
            $nav.removeClass('active');
            $this.addClass('active');
            $carouselSlider.css({
                'transition-duration': '0.5s',
                'margin-left': '-' + (navIndex+1)*100 + '%'
            });
            $slider.removeClass('active');
            $('.js-slider:nth-child('+(navIndex+2)+')').addClass('active');

        }

        function autoRotatation() {
            clearInterval(autoRotate);
            autoRotate = setInterval(function() {
                leftNavigation($('.js-carousel-right'));
            }, 7000);
        }

        function bindEvents() {

            $('.js-carousel-right').off('click.right').on('click.right', function() {
                leftNavigation($(this));
                autoRotatation();
            });
            $('.js-carousel-left').off('click.right').on('click.right', function() {
                rightNavigation($(this));
                autoRotatation();
            });
            $('.js-nav').off('click.nav').on('click.nav', function() {
                clickNavigation($(this));
                autoRotatation();
            });
            Hammer('.js-slider').off('dragleft.drag').on('dragleft.drag', function () {
                drag = 'left';
            });
            Hammer('.js-slider').off('dragright.drag').on('dragright.drag', function () {
                drag = 'right';
            });
            Hammer('.js-slider').off('release.drag').on('release.drag', function () {
                if (drag === 'left') {
                    drag = undefined;
                    leftNavigation($('.js-carousel-right'));
                    swipeADS('carousel_nav_next');
                    autoRotatation();
                } else if (drag === 'right') {
                    drag = undefined;
                    rightNavigation($('.js-carousel-left'));
                    swipeADS('carousel_nav_previous');
                    autoRotatation();
                }
            });
            $('.start-exploring').off('click.scroll').on('click.scroll', function() {
                $('body,html').animate({
                    scrollTop: $('.start-browsing-row').offset().top - $('header').height()
                });
            });

            $('.carousel-toggle-btn-container.close').off('click').on('click', hideCarousel);
            $('.carousel-toggle-btn-container.open').off('click').on('click', function(){
                window.location.href='https://www.ck12info.org/about/back-to-school/';
            });
        }
        function hideCarousel(){
            $('.carousel-main-wrapper').addClass('hide');
            $('.carousel-wrapper').addClass('hide');
            $('.scroll-down-container').addClass('hide');
            $('.carousel-toggle-btn-container.close').addClass('hide');
            $('.carousel-toggle-btn-container.open').removeClass('hide');
            $('.ck-12-mission-wrapper.top').addClass('hide');
            //$('.ck-12-mission-wrapper.bottom').removeClass('hide');
        }
        function showCarousel(){
            $('.carousel-main-wrapper').removeClass('hide');
            $('.carousel-wrapper').removeClass('hide');
            $('.scroll-down-container').removeClass('hide');
            $('.carousel-toggle-btn-container.close').removeClass('hide');
            $('.carousel-toggle-btn-container.open').addClass('hide');
            //$('.ck-12-mission-wrapper.bottom').addClass('hide');
            $('.ck-12-mission-wrapper.top').removeClass('hide');
        }
        function displayCarousel(sliderTemplate, navigationTemplate) {
            var count;
            sliderTemplate = _.template(sliderTemplate, null, {
                'variable': 'data'
            });
            sliderTemplate = sliderTemplate({
                'url_media': settings.url_media
            });
            navigationTemplate = _.template(navigationTemplate, null, {
                'variable': 'data'
            });
            navigationTemplate = navigationTemplate({
                'url_media': settings.url_media
            });
            carouselWrapper = _.template(carouselWrapper, null, {
                'variable': 'data'
            });
            carouselWrapper = carouselWrapper({
                'pageType': pageType,
                'url_media': settings.url_media
            });
            $('.carousel-main-wrapper').html(carouselWrapper);
            $('.js-carousel-slider').html(sliderTemplate);
            $('.js-carousel-nav').html(navigationTemplate);
            count = $('.js-slider').length;
            $('.js-carousel-slider').css('width', (count * 100) + '%');
            $('.js-slider').css('width', (100 / count) + '%');
            bindEvents();
            autoRotatation();
        }

        function hideforReturningUsers(){
            User.getUser().done(function(userData){
                if(userData.isLoggedIn()){
                    userData.getAppData('carousel').done(function(data){
                        if(data.responseHeader.status === 6006){ //new user
                            userData.setAppData('carousel', {
                                carouselSeenCount: 1
                            });
                        }else if(data.responseHeader.status === 0){
                            var count = data.response.userdata.carouselSeenCount;
                            if( count <= maxCount){
                                userData.setAppData('carousel', {
                                    carouselSeenCount: ++count
                                });
                            }else{
                                hideCarousel();
                            }
                        }
                    });
                }else{
                    var count = $.cookie('carousel_seen_count');
                    if(!count){
                        $.cookie('carousel_seen_count', 1, { expires: 365, path: '/' });
                    }else if(count <= maxCount){
                        $.cookie('carousel_seen_count', ++count, { expires: 365, path: '/' });
                    }else{
                        hideCarousel();
                    }
                }
            });
        }

        function teacherCarousel() {
            require([
                'text!carousel/templates/teacher/teacher.slider.html',
                'text!carousel/templates/teacher/teacher.navigation.html'
            ],function(sliderTemplate, navigationTemplate) {
                pageType = 'teacher_landing';
                displayCarousel(sliderTemplate, navigationTemplate);
                // hideforReturningUsers();
            });
        }

        function studentCarousel() {
            require([
                'text!carousel/templates/student/student.slider.html',
                'text!carousel/templates/student/student.navigation.html'
            ],function(sliderTemplate, navigationTemplate) {
                pageType = 'student_landing';
                displayCarousel(sliderTemplate, navigationTemplate);
                // hideforReturningUsers();
            });
        }

        this.teacherCarousel = teacherCarousel;
        this.studentCarousel = studentCarousel;

    }

    return new carousel();
});
