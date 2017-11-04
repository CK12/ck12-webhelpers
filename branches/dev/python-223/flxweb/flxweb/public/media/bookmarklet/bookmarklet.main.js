(function () {

    'use strict';

    var scriptElement = document.getElementById('ck-12-bookmarklet-script'),
        iframeElement = document.getElementById('ck-12-bookmarklet');
    function receiveMessage(event) {
        try {
            if (event.data) {
                if (JSON.parse(event.data).hasOwnProperty('close') && JSON.parse(event.data).close) {
                    var element = document.getElementById('ck-12-bookmarklet-script');
                    if(element) {
                        element.parentNode.removeChild(element);
                    }
                    element = document.getElementById('ck-12-bookmarklet');
                    if(element) {
                        element.parentNode.removeChild(element);
                    }
                }
            }

        } catch (e) {
            console.log(e);
        }
    }

    if (iframeElement) {
        if(scriptElement) {
            scriptElement.parentNode.removeChild(scriptElement);
        }
        iframeElement.parentNode.removeChild(iframeElement);
    }
    var host = scriptElement.src.split('/media')[0];
    var frame = document.createElement('iframe');
    frame.id = 'ck-12-bookmarklet';
    frame.height = window.innerHeight;
    frame.width = 290;
    frame.src = host + '/bookmarklet/?url=' + location.href + '&title=' + document.title + '&type=' + window.pageType;
    frame.style.position = 'absolute';
    frame.style.right = 0;
    frame.style.top = 0;
    frame.style.zIndex = 99999999999;
    frame.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.4)';
    frame.style.border = '1px solid #C0C0C0';
    frame.style.borderRadius = '5px';
    frame.style.backgroundColor = '#FFFFFF';
    document.body.appendChild(frame);
    window.scrollTo(0, 0);
    window.addEventListener('message', receiveMessage, false);
}());

/*
javascript: (function() {
    var app = document.createElement('script');
    app.type = 'text/javascript';
    app.async = true;
    app.id = 'ck-12-bookmarklet-script';
    app.src = 'https://lilyserver.ck12.org/media/bookmarklet/bookmarklet.main.js';
    document.body.appendChild(app);
})();
*/