define([
    'jquery',
    'conceptmap/graph/graph.helpers'
], function($, helpers){
    var activeClass = 'is-active';

    var $suggest     = $('.conceptmap-nav__middle__editor-suggest'),
        $suggestIcon = $suggest.find('i.icon-help_icon'),
        $infoSlide   = $suggest.find('.conceptmap-nav__middle__editor-suggest__info-slide');

    $suggestIcon.on('click', function(){
        $suggest.addClass(activeClass);
        // Issues with zIndex on Safari on touch devices. Just do not show overlay on touch devices
        if(!helpers.isTouchDevice){
            helpers.showOverlay();
        }
    });

    $infoSlide.find('button').on('click', function(){
        $suggest.removeClass(activeClass);

        if(!helpers.isTouchDevice){
            helpers.hideOverlay();
        }
    });

});