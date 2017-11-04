define([], function(){
    var tutorialNS           = 'tutorial__modal',
        $tutorialModal       = $('.' + tutorialNS),
        $tutorialModalArrow  = $tutorialModal.find('.' + tutorialNS + '__arrow'),
        $tutorialModalExit   = $tutorialModal.find('.' + tutorialNS + '__exit'),
        $slideBG             = $tutorialModal.find('.' + tutorialNS + '__transition-bg'),
        $tutorialModalSlides = $tutorialModal.find('.' + tutorialNS + '__slide'),
        $slides              = $tutorialModalSlides.children('div[data-slide]');

    var bottomRowClass = tutorialNS + '__bottom-row',
        dotClass       = bottomRowClass + '__dot',
        dotActiveClass = dotClass + '--active',
        slideTransitionClass = tutorialNS + '__transition-bg--transitioning',
        $bottomRow     = $('.' + bottomRowClass);

    var SLIDE_DURATION = 500;

    return {
        elements: {
            $exit : $tutorialModalExit,
            $bottomRow: $bottomRow,
            $dots : $bottomRow.find('.' + dotClass),
            $next : $bottomRow.find('.' + bottomRowClass + '__next__button'),
            $start: $bottomRow.find('.' + bottomRowClass + '__start__button'),
            $end  : $bottomRow.find('.' + bottomRowClass + '__end__button'),

            icon: {
                $navTips: $('i.nav__tips'),
                $editor: $('i.icon-blog')
            },

            $tutorialModal: $tutorialModal,
            $tutorialModalArrow: $tutorialModalArrow,
            $tutorialModalSlides: $tutorialModalSlides,
            $slideBG: $slideBG,
            $slides: $slides
        },

        classes: {
            tutorialActive: tutorialNS + '--active',
            bottomRow: bottomRowClass,
            dot: dotClass,
            dotActive: dotActiveClass,
            slideActive: tutorialNS + '__slide--active',
            slideTransition: slideTransitionClass,
            highlight: 'slide-highlighted'
        },

        slideDuration: SLIDE_DURATION,
        anchors: null,
        tutorialNode: null
    };
});