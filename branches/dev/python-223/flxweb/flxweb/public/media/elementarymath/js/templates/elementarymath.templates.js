define([
    'text!elementarymath/templates/browse.main.html',
    'text!elementarymath/templates/browse.topicList.html',
    'text!elementarymath/templates/browse.conceptTrack.html',
    'text!elementarymath/templates/browse.conceptTrackSmall.html',
    'text!elementarymath/templates/browse.conceptTrackList.html',
    'text!elementarymath/templates/browse.conceptTrackListSmall.html'
], function (main, topicList, conceptTrack, conceptTrackSmall, conceptTrackList, conceptTrackListSmall) {
    'use strict';
    return {
        'main': main,
        'topicList': topicList,
        'conceptTrack': conceptTrack,
        'conceptTrackSmall': conceptTrackSmall,
        'conceptTrackList': conceptTrackList,
        'conceptTrackListSmall': conceptTrackListSmall
    };
});
