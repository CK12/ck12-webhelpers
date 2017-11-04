/* globals dexterjs:false */
/* eslint camelcase:0 */

define([
    'jquery'
], function($){
    'use strict';

    if(window.dexterjs){
        dexterjs.set('config', {
            mixins: {
                memberID: window.ads_userid ? window.ads_userid : 2
            }
        });
    }

    function log(eventName, params){
        if(!window.dexterjs){ return; }
        dexterjs.logEvent(eventName, params);
    }

    function logEID(eventName, eid, params){
        if(typeof params !== 'object') { params = {}; }
        log(eventName, $.extend({
            context_eid: eid
        }, params));
    }

    function logAction(screenName, actionType, actionName){
        log('FBS_ACTION', {
            screen_name: screenName,
            action_type: actionType,
            action_name: actionName
        });
    }

/////////////
// Actions //
/////////////

    function tutorial(actionType, actionName){
        logAction('concept_map_tutorial', actionType, actionName);
    }

    function mainScreen(actionType, actionName){
        logAction('concept_map_main_screen', actionType, actionName);
    }

//////////
// Node //
//////////

    function nodeClick(eid, referrer){
        var params = {};
        if(referrer){ params.referrer = referrer; }
        logEID('FBS_CMAP_NODE', eid, params);
    }

    function nodeDetailsClick(eid){
        logEID('FBS_CMAP_NODE_INFO', eid);
    }

////////////
// Search //
////////////

    function search(eid, referrer){
        logEID('FBS_CMAP_SEARCH', eid, {
            referrer: referrer
        });
    }

    return {
        tutorial: tutorial,
        mainScreen: mainScreen,
        nodeClick: nodeClick,
        nodeDetailsClick: nodeDetailsClick,
        search: search
    };
});