define([
    'jquery',
    'text!common/templates/olympics.overlay.html',
    'text!common/templates/olympics.banner.html'
], function($, overlayTemplate, bannerTemplate){

    var overlayCookieName='ck12olympics';
    var bannerElement = $(bannerTemplate);
    var overlayElement = $(overlayTemplate).addClass('hide-important');
    var closeBtn = overlayElement.find('.overlay-close');
    var ctaBtn = overlayElement.find('.overlay-message .button');

    function init(){
        //add the banner in header
        $('.mid-header-banner').append(bannerElement);
        $('body').append(overlayElement);

        //handle banner click
        bannerElement.on('click touchend', function(){
            window.location.href='https://www.ck12info.org/about/olympics/';
        });
        //handle close button click
        closeBtn.on('click touchend', function(e){
            e.preventDefault();
            //set the cookie
            $.cookie(overlayCookieName,'visited', {path:'/'});
            hideOverlay();
        });

        //on click of CTA, set cookie
        ctaBtn.on('click touchend', function(){
            //set the cookie
            $.cookie(overlayCookieName,'visited', {path:'/'});
        });

        //if cookie doesn't exist, show overlay
        if (document.cookie.indexOf(overlayCookieName) === -1){
            showOverlay();
        }
    }

    function showOverlay(){
        overlayElement.removeClass('hide-important');
    }

    function hideOverlay(){
        overlayElement.addClass('hide-important');
    }

    init();

});
