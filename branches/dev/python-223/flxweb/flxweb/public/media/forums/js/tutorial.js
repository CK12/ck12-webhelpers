define(['jquery', 'hammer', 'forums/templates/templates'], function($, Hammer, TMP){
    'use strict';

    var tutorialNS           = 'tutorial__modal',
        $tutorialModal       = $('.' + tutorialNS);

    var currentSlide = 0;
    var groupID = null;
    function show($el) {
        // if($('.tutorial__modal').css('animation-name') !== 'none'){

        // }
        return $el.removeClass('hide');
    }
    var Template = TMP.Tutorial;

    function hide($el) {
        return $el.addClass('hide');
    }

    function hideTutorial(){
        if($('.tutorial__modal').hasClass('fall-down')){
            $('.tutorial__modal').removeClass('fall-down');
            setTimeout(function(){
                resetModal();
                hide( $tutorialModal );
            }, 500);
        }else{
            resetModal();
            hide($tutorialModal );
        }
        $('#forums-main').css('display','block');
    }
    function resetModal(){
        currentSlide = 1;
        showSlideByNum();
        $('.slides-container').addClass('hide');
        $('.tutorial__modal__slide-0').show();
        $('.tutorial__modal__top-row').addClass('hide');
        $('.tutorial__modal__bottom-row').css({'display':'none'});

        $('.tutorial__modal__bottom-row__next__button').removeClass('hide');
        $('.tutorial__modal__bottom-row__end__button').addClass('hide');
        $('html, body').off('touchmove');
    }
    function showSlideByNum(){
        var left = (currentSlide-1)*100;
        if(currentSlide > 3){
            currentSlide = 3;
        }else if(currentSlide < 1){
            currentSlide = 1;
        }else if(currentSlide === 3){
            $('.tutorial__modal__bottom-row__next__button').addClass('hide');
            $('.tutorial__modal__bottom-row__end__button').removeClass('hide');
            $('.tutorial__modal__top-row__end__button').addClass('hide');
            $('.tutorial__modal__top-row__done__button').removeClass('hide');
        }

        if(currentSlide !== 3){
            $('.tutorial__modal__bottom-row__next__button').removeClass('hide');
            $('.tutorial__modal__bottom-row__end__button').addClass('hide');
            $('.tutorial__modal__top-row__end__button').removeClass('hide');
            $('.tutorial__modal__top-row__done__button').addClass('hide');
        }

        if(left >= 0 && left <=200){
            $('.slides-container').css('left', '-'+left+'%');
            $('.tutorial__modal__bottom-row__dots').children().removeClass('tutorial__modal__bottom-row__dot--active');
            $('.tutorial__modal__bottom-row__dots').children().eq(currentSlide-1).addClass('tutorial__modal__bottom-row__dot--active');
        }
    }

    function bind(){

        $('.tutorial__modal__bottom-row__skip__text').off('click').on('click', skipTutorial);

        $('.tutorial__modal__bottom-row__next__button').off('click').on('click', function(){
            ++currentSlide;
            var _screen_no = currentSlide < 3 ? currentSlide :  3;
            if (window.dexterjs){
                window.dexterjs.logEvent('FBS_ACTION', {
                    screen_name: 'forum_tutorial',
                    action_type: 'button',
                    action_name: 'screen_' + _screen_no,
                    memberID: window.ads_userid,
                    groupID: groupID
                });
            }
            showSlideByNum();
        });

        $('.tutorial__modal__bottom-row__dots').off('click').on('click', function(e){
            var current = $(e.target).attr('data-slide');
            currentSlide = parseInt(current)-1;
            if (window.dexterjs){
                window.dexterjs.logEvent('FBS_ACTION', {
                    screen_name: 'forum_tutorial',
                    action_type: 'dot',
                    action_name: 'screen_' + currentSlide,
                    memberID: window.ads_userid,
                    groupID: groupID
                });
            }
            showSlideByNum();
        });

        function skipTutorial(){
            if (window.dexterjs){
                window.dexterjs.logEvent('FBS_ACTION', {
                    screen_name: 'forum_tutorial',
                    action_type: 'link',
                    action_name: 'skip_tour',
                    memberID: window.ads_userid,
                    groupID: groupID
                });
            }

            hideTutorial();
        }

        $('.cancel-tour').off('click').on('click', skipTutorial);
        $('.tutorial__modal__top-row__end__button').off('click').on('click', hideTutorial);
        $('.tutorial__modal__top-row__done__button').off('click').on('click', hideTutorial);
        $('.start-tour').off('click').on('click', function(){
            if (window.dexterjs){
                window.dexterjs.logEvent('FBS_ACTION', {
                    screen_name: 'forum_tutorial',
                    action_type: 'button',
                    action_name: 'take_tour',
                    memberID: window.ads_userid,
                    groupID: groupID
                });
            }

            currentSlide++;
            $('.slides-container').removeClass('hide');
            $('.tutorial__modal__slide-0').hide();
            $('.tutorial__modal__top-row').removeClass('hide');
            if(window.innerWidth <= 767){
                $('.tutorial__modal__bottom-row').css({'display':'block'});
            }else{
                $('.tutorial__modal__bottom-row').css({'display':'flex'});
            }
            $('.tutorial__modal__bottom-row').removeClass('hide');

        });
        $('.tutorial__modal__bottom-row__end__button').off('click').on('click', hideTutorial);
        var drag = 'left';
        Hammer('.slides-container').off('dragleft.drag').on('dragleft.drag',function(){
            drag = 'left';
        });
        Hammer('.slides-container').off('dragright.drag').on('dragright.drag',function(){
            drag = 'right';
        });
        Hammer('.slides-container').off('release.drag').on('release.drag',function(){
            if(drag === 'left'){
                currentSlide++;
                var _screen_no = currentSlide < 3 ? currentSlide :  3;
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_ACTION', {
                        screen_name: 'forum_tutorial',
                        action_type: 'click',
                        action_name: 'screen_' + _screen_no,
                        memberID: window.ads_userid,
                        groupID: groupID
                    });
                }

                showSlideByNum();
            }else{
                currentSlide--;
                //var _screen_no = currentSlide > 1 ? currentSlide :  0;
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_ACTION', {
                        screen_name: 'forum_tutorial',
                        action_type: 'click',
                        action_name: 'screen_' + _screen_no,
                        memberID: window.ads_userid,
                        groupID: groupID
                    });
                }

                showSlideByNum();
            }
        });
    }
    function showTour(currentGroupID){
        if($('.tutorial__modal').find('tutorial__modal__top-row').length === 0){
            $('.tutorial__modal').html(Template);
        }
        currentSlide = 0;
        groupID = currentGroupID;
        $(window).scrollTop(0);
        // $('body').css('overflow-y', 'hidden');
        // $('html, body').on('touchmove', function(e){
        //     e.preventDefault();
        // });
        $('#forums-main').css('display','none');
        show( $tutorialModal );
        setTimeout(function(){
            $('.tutorial__modal').addClass('fall-down');
        }, 0);
        bind();
    }
    function init(currentGroupID, user){
        user.done(function(userData){
            if(userData.isLoggedIn()){
                userData.getAppData('forums').done(function(data){
                    var newForumData = {
                        tutorialShown:true
                    };
                    if(data.responseHeader.status === 0){
                        if(!data.response.userdata.tutorialShown){
                            showTour(currentGroupID);
                            userData.setAppData('forums',newForumData);
                        }
                    }else if(data.responseHeader.status === 6006){
                        showTour(currentGroupID);
                        userData.setAppData('forums',newForumData);
                    }
                });
            }else{
                if(!$.cookie('forum_tour_seen')) {
                    showTour(currentGroupID);
                    $.cookie('forum_tour_seen', true, { expires: 365, path: '/' });
                }
            }
        });
    }
    return {
        init: init,
        show: showTour
    };
});
