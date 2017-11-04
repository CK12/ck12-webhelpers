window.scrollToTop=false;
function resize(options){
    //70 margin to adjust top and bottom space
    iframeMAXHeight = $(window).height() - 70;
    var height = (options && options.height)? options.height: "350";
    height = height + 40;
    if (height > iframeMAXHeight){
        height = iframeMAXHeight;
    }
    $('.cboxIframe').css('height', height +'px');
    $('#cboxWrapper').css({'height': (height+67) +'px', 'width' : '100%'});
    $('#cboxContent').css({'height': (height + 10) +'px', 'width': '97%'});
    $('#cboxLoadedContent').css({'height': (height+10) +'px', 'width': '100%'} );
    $('#colorbox').css({'height': (height+10) +'px', 'width' : ($(window).width() -40 ) + 'px', 'left': '10px'});
    $('#cboxMiddleLeft, #cboxMiddleRight').css('height', (height + 10) +'px');
    $('#cboxTopCenter, #cboxBottomCenter').css('width', '97%');
    $('#colorbox').css("top", ( ( $(window).height() - $('#colorbox').height() ) / 2+$(window).scrollTop() ) - 20 + 'px');
    if(window.scrollToTop){
        $(window).scrollTop(0)
        $('#colorbox').css("top", 0 + 'px');
    }
}