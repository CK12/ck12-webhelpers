
define([
    'jquery',
    'underscore',
    'common/utils/utils',
    'schools/config/SchoolConfig'
], function($, _, utils, SchoolConfig){
    'use strict';
    var __schoolCache = {},
        __statescache = {},
        ck12ajax = utils.ck12ajax,
        _df = utils.deferredFunction,
        APIS = {
            "SCHOOLS_BY_STATE": utils.getApiUrl("flx/get/school/artifacts"),
            "STATES" :  utils.getApiUrl('flx/get/school/counts'), //
            "UPDATE_SCHOOL_NAME":  utils.getApiUrl("flx/update/school"),
            "REMOVE_FLEX_BOOK_FROM_SCHOOL": utils.getApiUrl('flx/delete/school/artifacts'),
            "ADD_FLEX_BOOK_FROM_SCHOOL": utils.getApiUrl('flx/add/school/artifacts'),
            "GET_SCHOOL_CLAIM" : utils.getApiUrl('flx/get/school/claim'),
            "PROFANE_URL"      : utils.getApiUrl('flx/sanitize')
        },
        CACHE_SETTINGS = {
            "SCHOOLS_BY_STATE": {
                namespace:"schools",
                region: "daily"
            },
            "STATES": {
                namespace:"schools",
                region: "daily"            
            }
        },
        UPDATE_CACHE_SETTINGS =  {
            "UPDATE_SCHOOL_NAME" : {
                namespace:"schools",
                region: "daily",
                key: APIS.SCHOOLS_BY_STATE
            }, 
            "REMOVE_FLEX_BOOK_FROM_SCHOOL": {
                namespace:"schools",
                region: "daily",
                key: APIS.SCHOOLS_BY_STATE
            }, 
            "ADD_FLEX_BOOK_FROM_SCHOOL" :{
                namespace:"schools",
                region: "daily",
                key: APIS.SCHOOLS_BY_STATE
            }
        },
        schoolServices = {

            getSchoolsForState : _df(function(_d, options){
                ck12ajax({
                    url: APIS.SCHOOLS_BY_STATE,
                    data: options,
                    localCache: CACHE_SETTINGS.SCHOOLS_BY_STATE
                }).done(function(json){
                    var schools = json.response.schoolArtifacts || [];
                    if(schools.length){
                        _d.resolve(json.response);
                    } else {
                        _d.reject("There are no schools for state: " + options.state);
                    }
                }).fail(function(){
                    _d.reject("Failed to fetch schools for state: " + options.state);
                });
            }),
            getStates : _.once(_df(function(_d, options){
                ck12ajax({
                    url: APIS.STATES,
                    data: options,
                    cache: true,
                    localCache: CACHE_SETTINGS.STATES
                }).done(function(json){
                    _d.resolve(json.response.schoolCounts || {});
                }).fail(function(){
                    _d.reject("Could not load list of states");
                });
            })),
            getLocation: utils.getLocation,

            addAFlexBook : _df(function(_d, options, onCompleteData){
                console.log(options);
                UPDATE_CACHE_SETTINGS.ADD_FLEX_BOOK_FROM_SCHOOL.data = onCompleteData
                ck12ajax({
                    url: APIS.ADD_FLEX_BOOK_FROM_SCHOOL,
                    method : 'POST',
                    updateCache : UPDATE_CACHE_SETTINGS.ADD_FLEX_BOOK_FROM_SCHOOL,
                    data:options
                }).done(function(json){
                    _d.resolve(json.response.schoolArtifacts || {});
                }).fail(function(err){
                    _d.reject(err);
                });
            }),
            deleteAFlexBook : _df(function (_d, options, onCompleteData) {
                console.log(options)
                UPDATE_CACHE_SETTINGS.REMOVE_FLEX_BOOK_FROM_SCHOOL.data  = onCompleteData
                ck12ajax({
                    url: APIS.REMOVE_FLEX_BOOK_FROM_SCHOOL,
                    updateCache : UPDATE_CACHE_SETTINGS.REMOVE_FLEX_BOOK_FROM_SCHOOL,
                    method : 'POST',
                    data:options
                }).done(function(json){
                    _d.resolve(json.response.schoolArtifacts.artifacts || []);
                }).fail(function(err){
                    _d.reject(err);
                });


            }),
            updateSchoolName: _df(function (_d, options, onCompleteData) {
                console.log(options)
                console.log(onCompleteData)
                UPDATE_CACHE_SETTINGS.UPDATE_SCHOOL_NAME.data = onCompleteData
                ck12ajax({
                    url: APIS.UPDATE_SCHOOL_NAME,
                    updateCache : UPDATE_CACHE_SETTINGS.UPDATE_SCHOOL_NAME,
                    method : 'POST',
                    data:options
                }).done(function(json){
                    _d.resolve(json.response.school || {});
                }).fail(function(err){
                    _d.reject(err);
                });
            }),
            profaneText: _df(function(_d, options){
                ck12ajax({
                    url: APIS.PROFANE_URL,
                    method : 'GET',
                    data:options
                }).done(function(json){
                    _d.resolve(json.response || {});
                }).fail(function(err){
                    _d.reject(err);
                });
            }),
            getSchoolClaimStatus : _df(function(_d, options){
                ck12ajax({
                    url: APIS.GET_SCHOOL_CLAIM,
                    method : 'GET',
                    data:options
                }).done(function(json){
                    _d.resolve(json.response.schoolClaim || {});
                }).fail(function(err){
                    _d.reject(err);
                });
            })
        };

    schoolServices.getStates(SchoolConfig.stateCountRequestParams);
    schoolServices.getLocation();
    return schoolServices;
});
