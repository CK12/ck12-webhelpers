/* global Hammer */
define(['jquery', 'text!common/templates/walkthrough.html', 'hammer'],
function($, htmlResponse) {
    function AdaptiveWalkthrough() {
        var optionsWt = {},
            adaptive = true;

        function updatePagination() {
            var hammer = $('#imgNavigation').hammer();
            hammer.off('dragleft dragright swipeleft swiperight').on('dragleft dragright swipeleft swiperight', function(ev) {
                if (Hammer.utils.isVertical(ev.gesture.direction)) {
                    return;
                }
                ev.gesture.preventDefault();
                switch (ev.type) {
                    case 'dragright':
                    case 'dragleft':
                        break;
                    case 'swipeleft':
                        var current = $(this).find('.current'),
                            prev = $(current).prev(),
                            next = $(current).next(),
                            index,
                            position;
                        $(this).find('.current').removeClass('current');
                        if (next.length > 0) {
                            position = $(next).attr('data-position');
                            index = $('.' + position).index();
                            $('.imgCarousal').css('left', -index * 100 + '%');
                            $(next).addClass('current');
                            addWalkthroughSlideIndex(index +1);

                        } else {
                            $(prev).next().addClass('current');
                            return false;
                        }
                        if ($('#imgNavigationDots').find('.current').index() + 1 === $('#imgNavigationDots').find('.dots').length) {
                            $('.right-arrow').addClass('hide');
                        } else {
                            $('.right-arrow').removeClass('hide');
                            $('.left-arrow').removeClass('hide');
                        }

                        break;
                    case 'swiperight':
                        $(this).find('.current').removeClass('current');
                        if (prev.length > 0) {
                            position = $(prev).attr('data-position');
                            index = $('.' + position).index();
                            $('.imgCarousal').css('left', -index * 100 + '%');
                            $(prev).addClass('current');
                            addWalkthroughSlideIndex(index +1);
                        } else {
                            $(next).prev().addClass('current');
                            return false;
                        }
                        if ($('#imgNavigationDots').find('.current').index() === 0) {
                            $('.left-arrow').addClass('hide');
                        } else {
                            $('.left-arrow').removeClass('hide');
                            $('.right-arrow').removeClass('hide');
                        }
                        break;
                }
            });

        }
        function addWalkthroughSlideIndex(index){
            $('.right-arrow').attr('data-dx-desc','walkthrough right slide '+index);
            $('.left-arrow').attr('data-dx-desc','walkthrough left slide '+index);
            $('#startPractice').attr('data-dx-walkthrough_slide',index);
        }
        function bindEvents() {
            $('.dots').off('click').on('click', function() {
                var position = $(this).attr('data-position'),
                    index = $('.' + position).index();
                if ($(this).next().index() === -1) {
                    $('.right-arrow').addClass('hide');
                    $('.left-arrow').removeClass('hide');
                } else if ($(this).prev().index() === -1) {
                    $('.left-arrow').addClass('hide');
                    $('.right-arrow').removeClass('hide');
                } else {
                    $('.left-arrow').removeClass('hide');
                    $('.right-arrow').removeClass('hide');
                }
                $('.imgCarousal').css('left', -index * 100 + '%');
                $('.dots').removeClass('current');
                $(this).addClass('current');
                addWalkthroughSlideIndex(index +1);

            });
            $('.right-arrow').off('click').on('click', function() {
                var container = $(this).parents('.walkthrough-page').parent(),
                    position = $(container).find('.current').next().attr('data-position'),
                    index = $('.' + position).index();
                if (position === $('#imgNavigationDots').find('.dots').last().attr('data-position')) {
                    $('.right-arrow').addClass('hide');
                } else {
                    $('.left-arrow').removeClass('hide');
                    $('.right-arrow').removeClass('hide');
                }
                $('.imgCarousal').css('left', -index * 100 + '%');
                $('.current').removeClass('current');
                $('.' + position).addClass('current');
                addWalkthroughSlideIndex(index +1);
            });
            $('.left-arrow').off('click').on('click', function() {
                var container = $(this).parents('.walkthrough-page').parent(),
                    position = $(container).find('.current').prev().attr('data-position'),
                    index = $('.' + position).index();

                if (position === $('#imgNavigationDots').find('.dots').first().attr('data-position')) {
                    $('.left-arrow').addClass('hide');
                } else {
                    $('.left-arrow').removeClass('hide');
                    $('.right-arrow').removeClass('hide');
                }
                $('.imgCarousal').css('left', -index * 100 + '%');
                $('.dots').removeClass('current');
                $('.' + position).addClass('current');
                addWalkthroughSlideIndex(index +1);
            });
            $('.close-walkthrough').off('click').on('click', function() {
                //optionsWt && optionsWt.exit && optionsWt.exit();
                $('#walkthrough').addClass('hide');
                $('#assignment-full-page').removeClass('hide');
                $('.current').removeClass('current');
                $('#imgNavigationDots').find('.dots').eq(0).addClass('current');
                $('.imgCarousal').css('left','0px');
                $('.left-arrow ').addClass('hide');
                $('.right-arrow ').removeClass('hide');
            });
            $('#startPractice').off('click').on('click', function() {
                optionsWt && optionsWt.success && optionsWt.success();
                $(optionsWt.container).addClass('hide');
            });
            $('body').off('click.tooltip').on('click.tooltip', function(e) {
                var target = e.target;

                if($(target).closest('.tooltip-message').length === 0 && !/toolwrap|tooltip-message/.test(target.className)){
                    $('.tooltip-message').addClass('hide');
                }
            });
            $('.toolwrap').off('click.renderMesage').on('click.renderMesage', function() {
                var message = $(this).data('toolwrap'),
                    position = $(this).data('position'),
                    tooltip = $(this).next('.tooltip-message'),
                    target = $(this),
                    left = 0,
                    top = 0,
                    tooltipPointer = null;
                $('.tooltip-message').addClass('hide');
                if(tooltip.hasClass('active')){
                    tooltip.removeClass('active');
                    tooltip.addClass('hide');
                }else{
                    tooltip.removeClass('hide');
                    tooltip.addClass('active');
                }
                if (!tooltip.hasClass('tooltip-message')) {
                    target.after('<div class="tooltip-message ' + position + '">' + message + '<div class="tool-pointer"></div></div>');
                    tooltip = $(this).next('.tooltip-message');
                    tooltip.addClass('active');
                }
                tooltipPointer = tooltip.find('.tool-pointer');

                left = target.position().left;

                if(target.hasClass('on-top')){
                    tooltip.addClass('on-top');
                    top = target.position().top - tooltip.outerHeight(true) - 20;
                }else{
                    top = target.position().top + target.height();
                    tooltip.removeClass('on-top');
                }


                if(left + tooltip.width() > $('.embed-img').width()){
                    left = target.position().left + target.width() - tooltip.width();
                }

                tooltip.css('left', left + 'px');
                tooltip.css('top', top + 'px');

                tooltipPointer.css('left', target.position().left + (target.width()/2) - (tooltip.position().left + 9) + 'px'); //9 is the half of pointer width
            });
        }
        function buildHtml(container, context) {
            var imgCont,
                dotsNav,
                user;
            if (context) {
                user = [{
                    'dataposition': 'position-1',
                    'imgpath': '/media/common/images/edmodo1.png',
                    'heading': '',
                    'description': '',
                    'tooltip': [{
                        'number': '1',
                        'left': '9%',
                        'top': '9%',
                        'message': 'Students need to answer 10 questions correctly to complete the concept.',
                        'position': 'bottom'
                    }, {
                        'number': '2',
                        'left': '77%',
                        'top': '37%',
                        'message': 'Question difficulties adapt to meet students where they are.',
                        'position': 'bottom'
                    }]
                }, {
                    'dataposition': 'position-2',
                    'imgpath': '/media/common/images/edmodo_2.png',
                    'heading': '',
                    'description': '',
                    'tooltip': [{
                        'number': '1',
                        'left': '10%',
                        'top': '9%',
                        'message': 'Student achievements are front and center.',
                        'position': 'bottom'
                    }, {
                        'number': '2',
                        'left': '11%',
                        'top': '44%',
                        'message': 'Progress is measured one correct question at a time. For example, 70% means 7 questions were answered correctly. ',
                        'position': 'bottom'
                    },{
                        'number': '3',
                        'left': '89%',
                        'top': '79%',
                        'message': 'Track performance across all questions and see a break down of each type.',
                        'position': 'bottom',
                        'tooltip-position' : 'top'
                    }]
                }, {
                    'dataposition': 'position-3',
                    'imgpath': '/media/common/images/edmodo_3.png',
                    'heading': '',
                    'description': '',
                    'tooltip': [{
                        'number': '1',
                        'left': '11%',
                        'top': '34%',
                        'message': 'Quizzes you create in CK-12 are now available on Edmodo.',
                        'position': 'bottom'
                    }, {
                        'number': '2',
                        'left': '17%',
                        'top': '48%',
                        'message': 'Create a custom quiz in seconds.',
                        'position': 'bottom'
                    },{
                        'number': '3',
                        'left': '83%',
                        'top': '48%',
                        'message': 'Select, reorder, add your own questions and more.',
                        'position': 'bottom'
                    }]

                }];
            } else {
                user = [{
                    'dataposition': 'position-1',
                    'imgpath': '/media/common/images/student2-and-teacher1.png',
                    'heading': 'ADAPTIVE QUESTIONS',
                    'description': 'Question difficulties adapt to meet students where they are.'
                }, {
                    'dataposition': 'position-2',
                    'imgpath': '/media/common/images/student1-and-teacher2.png',
                    'heading': 'INITIAL PRACTICE GOAL',
                    'description': 'Students need to answer 10 questions correctly to complete each concept.'
                }, {
                    'dataposition': 'position-3',
                    'imgpath': '/media/common/images/teacher3.png',
                    'heading': 'ENCOURAGEMENT AND MOTIVATION',
                    'description': 'Student achivements are front and center.'
                }, {
                    'dataposition': 'position-4',
                    'imgpath': '/media/common/images/teacher4.png',
                    'heading': 'PERCENTAGE-BASED REPORTING',
                    'description': 'Progress is measured one question at a time. <br> For example 70% means 7 questions were answered correctly.'
                }];
            }
            $('.imgCarousal').css('width', user.length * 100 + '%');
            $('.embed-img').css('width', 100 / user.length + '%');
            for (var i = 0; i < user.length; i++) {
                imgCont = $('#imgCont').html();
                dotsNav = $('#dotsCont').html();
                var tooltip;
                imgCont = imgCont.replace(/@@dataposition@@/, user[i].dataposition);
                imgCont = imgCont.replace('@@dataindex@@', user[i].dataposition);
                //imgCont = imgCont.attr("@@path@@",user[i].imgpath);
                imgCont = imgCont.replace('@@heading@@', user[i].heading);
                imgCont = imgCont.replace('@@description@@', user[i].description);
                imgCont = imgCont.replace('@@id@@', 'img_cont' + i);
                $('.imgCarousal').append(imgCont);
                $($(container).find('#img_cont' + i)).find('.img-walkthrough').attr('src',user[i].imgpath);
                if (user[i].tooltip) {
                    tooltip = user[i].tooltip;
                    for (var j = 0; j < tooltip.length; j++) {
                        $('#' + 'img_cont' + i).append('<div class="toolwrap" data-position ="' + tooltip[j].position + '" data-toolwrap=" ' + tooltip[j].message + '" id= "img_' + j+ '" style="left: ' + tooltip[j].left + '; top :' + tooltip[j].top+ '">' + tooltip[j].number + '</div>');
                        if(tooltip[j]['tooltip-position'] && tooltip[j]['tooltip-position'] === 'top'){
                            $('#' + 'img_cont' + i).find('.toolwrap:last').addClass('on-top');
                        }
                    }
                }
                dotsNav = dotsNav.replace(/@@dataposition@@/g, user[i].dataposition);
                dotsNav = dotsNav.replace('@@dataindex@@', user[i].dataposition);
                $(container).find('#imgNavigationDots').append(dotsNav);
            }
            if(context){
                $('.walkthrough-header').find('h3').html('Here\'s what you need to know about CK-12 Practice.');
                $('.heading-flow').html('Tap the numbers to learn more.');
            }
            $($(container).find('#imgNavigationDots').children()[0]).addClass('current');
        }
        function setCookie() {
            $.cookie('walkthrough', 'walkthrough', { expires: 182 , path : '/' });
        }
        function init(options) {
            var container = options.container;
            var context = options.context;
            if (adaptive) {
                $('body').addClass('adaptiveWalkthrough');
                $(options.container).append(htmlResponse);
                buildHtml(container, context);
                updatePagination();
                bindEvents();

                if(!$.cookie('walkthrough')){
                    setCookie();
                    $('#walkthrough').removeClass('hide');
                    return true;
                }else{
                    $('#walkthrough').addClass('hide');
                    return false;
                }
            }

        }
        this.init = init;

    }
    return new AdaptiveWalkthrough();
}
);
