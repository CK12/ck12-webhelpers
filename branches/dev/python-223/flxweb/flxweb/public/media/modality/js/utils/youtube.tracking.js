define([
    'jquery'
], function($){

    var reYT = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    var ytThumbTmpl = 'https://img.youtube.com/vi/__YTID__/hqdefault.jpg ';
    var clickTrackerTmpl = [
        '<div class="youtubeclicktracker dxtrack-user-action hide-for-small" style="position:relative" ',
        'data-dx-desc="FBS_YOUTUBE_CLICK" data-dx-videoid="__YTID__" >',
        '<img style="border:1px solid #333" src="__YTTHUMB__" width="100%" />',
        '<div class="playbutton button icon-play" style="',
        'position: absolute; top: 50%; left: 50%;',
        'font-size: 40px; margin-left: -20px; margin-top: -40px;',
        'background:red; border-top: red; border-bottom: red; border-radius: 10px',
        '"></div>',
        '</div>'
    ].join('');
    var ytTrackerSelector = '.youtubeclicktracker';

    function swapYoutubeEmbeds(){
        //remove any existing tracking thumbnails (if there are existing tracking thumbnails, something is wrong)
        [].slice.call(document.querySelectorAll(ytTrackerSelector)).forEach(function(elm){
            console.log('removed existing youtube tracking thumbnail');
            elm.parentNode.removeChild(elm);
        });

        var arr = [].slice.call(document.querySelectorAll('[itemprop=video]'));
        var ytv = arr.filter(function(div){
            var frame = div.querySelector('iframe');
            return frame && (frame.src.indexOf('youtube') !== -1);
        });



        ytv.forEach(function(ytDiv){
            var frame = ytDiv.querySelector('iframe');
            var frameSrc = '' + frame.src;
            var frameContainer = ytDiv.querySelector('.flex-video');
            if (!frameContainer){
                //because on some instances don't have the flex-video wrapper.
                frameContainer = $(frame).wrap('<div class="flex-video">').parent().get(0);
            }
            var match = reYT.exec(unescape(frameSrc));
            var ytThumb = '';
            var ytID;
            if (match){
                ytID = match[1];
                ytThumb = ytThumbTmpl.replace('__YTID__', ytID);
            }
            var trackerElmStr = clickTrackerTmpl
                .replace('__YTID__', ytID)
                .replace('__YTTHUMB__', ytThumb);
            var tmp = document.createElement('div');
            tmp.innerHTML = trackerElmStr;
            var trackerDiv = tmp.querySelector('div');
            try {
                ytDiv.insertBefore(trackerDiv, frameContainer);
                frameContainer.classList.add('show-for-small');
            } catch(e){
                console.log('A video was not processed due to an exception.');
            }



        });
    }

    //TODO: above function requires the /flx/show embeds to be first renderred
    // on the page.need to find a way to achieve the same without having to
    // render the /flx/show iframes. That may require the /flx/show endpoint
    // to respect ?autoplay=1 parameter.


    function swapYoutubeThumbWithEmbed(thumbElm){
        var ytDiv = thumbElm.parentElement;
        var frame = ytDiv.querySelector('iframe');
        var frameContainer = ytDiv.querySelector('.flex-video');
        ytDiv.removeChild(thumbElm);
        frameContainer.classList.remove('show-for-small');
        var frameDom = frame.contentDocument;
        var ytframe = frameDom.querySelector('iframe');
        ytframe.src = ytframe.src + '&autoplay=1';
    }

    function registerTrackingListener(){
        $(document).on('click', ytTrackerSelector, function(){
            swapYoutubeThumbWithEmbed($(this).get(0));
        });
    }

    function init(){
        swapYoutubeEmbeds();
        registerTrackingListener();
    }

    return {
        init: init,
        swapYoutubeEmbeds: swapYoutubeEmbeds,
        swapYoutubeThumbWithEmbed: swapYoutubeThumbWithEmbed,
        registerTrackingListener: registerTrackingListener
    };

});
