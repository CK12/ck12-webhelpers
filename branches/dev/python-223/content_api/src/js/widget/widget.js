'use strict';

var eid        = require('./api/eidWrapper'),
    recommend  = require('./api/recommendationWrapper'),
    widgetData = require('./shared/widget.data');

// Add listener to iframe window
window.addEventListener('message', function(event) {
    if(!event.data.ck12) { return; }

    widgetData.eventSource        = event.source;
    widgetData.eventSourceUrl     = event.data.sourceUrl;
    widgetData.eventOrigin        = event.origin;
    widgetData.xhtml              = event.data.xhtml;
    widgetData.userConfig         = event.data.userConfig;
    widgetData.mainData.widgetNum = event.data.widgetNum;

    widgetData.userConfig.conceptName ? recommend.get() : eid.post();
}, false);


