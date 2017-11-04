/**
 * Copyright 2007-2011 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Chetan Agrawal
 *
 * $id$
 */

define( 'cache/cdn_cache', [
    'jquery',
    'underscore',
    'common/utils/user',
    'flxweb.settings'
], function($, _, userInfoModel ) {
    'use strict';

    var cdn_cache_endpoint = $.flxweb.settings.cdn_api_cache;

    /*
     *  Initialize with JQuery based AJAX arguments
     */
    function CDNCache(args) {
        this.custom_headers = {};
        this.cacheUserInfoEnabled = false;
        this.withCredentials = true;
        this.expirationAge = 'daily'; //default: cache expires daily
        this.checkCDNCookie();

        this.args = {};
        _.extend(this.args, args);
        return this;
    }

    /**
    * Make sure we have the cookie that is part of the CDN passed cookies.
    * This allows us to invalidate the entire CDN API cache by changing the value
    * of this cookie.
    */
    CDNCache.prototype.checkCDNCookie = function() {
        var cookieName = 'cdnAPIver';
        var cdnAPIVersion = $.flxweb.settings.cdn_api_version;
        var cdnAPIVersionCookie = $.cookie(cookieName);
        var date = new Date();
        var minutes = 24 * 60; // 24 hours
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        if ( !cdnAPIVersionCookie || (cdnAPIVersionCookie != cdnAPIVersion) ) {
            $.cookie(cookieName,cdnAPIVersion, {path:'/',domain:'ck12.org','expires':date});
        }
    };

    CDNCache.prototype.addCustomHeader = function(key, value) {
        this.custom_headers[key] = value;
        return this;
    };

    // cache user info
    CDNCache.prototype.cacheUserInfo = function(val) {
        this.cacheUserInfoEnabled = val;
        return this;
    };

    /* cache for the given age, refer to the map below
    {
        'nocache' : 0,
        'quarter-hourly' : 60 * 15,
        'hourly' : 3600,
        'daily' : 3600 * 24,
        'weekly' : 3600 * 24 * 7,
        'biweekly' : 3600 * 24 * 14,
        'monthly' : 3600 * 24 * 30,
        'yearly' : 3600 * 24 * 365
    }
    */
    CDNCache.prototype.setExpirationAge = function(val) {
        this.expirationAge = val;
        return this;
    };


    //TODO: add a feature to cache upto a specified date/time
    //Problem: the parameter is passed in the query string which is cached on CDN
    //          hence we should add a header for expirationDate instead of query params
    //
    // // cache upto a specified time,
    // // EX : `Sat, 30 Jun 2012 23:59:59 GMT`
    // // RFC 2616 HTTP Protocol, Full Date ( http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1 )
    // CDNCache.prototype.setExpirationDate = function(val) {
    //     this.expirationDate = val;
    //     return this;
    // };

    CDNCache.prototype.useSecureCookies = function(val) {
        this.withCredentials = val;
        return this;
    };

    //maybe instantiate the user key or add it as a seperate value
    CDNCache.prototype.fetch = function() {
        if ( !this.args.url ) {
            //TODO : error handling
            return;
        }

        this.ajax_url = window.location.protocol + '//' + cdn_cache_endpoint + this.args.url;

        this.query_params = _.extend({}, this.args.data);
        _.extend(this.query_params, { 'expirationAge' : this.expirationAge });


        //user info population
        var _deferredUser;
        if(this.cacheUserInfoEnabled === true ) {
            // Add the /my/ prefix to the API endpoint
            this.ajax_url = this.ajax_url.replace(/(\/flx\/|\/auth\/|\/assessment\/api\/)/, '/my\$1');
            var user = new userInfoModel();
            _deferredUser = user.fetch();
        } else {
            _deferredUser = $.Deferred().resolve({}).promise();
        }

        var _c = this; //context
        $.when( _deferredUser )
        .done( function( userInfo ) {
            // populating user id header
            if( userInfo && userInfo.id ) {
                console.log('[CDNCache]: setting the user id cache header' + userInfo.id);
                _.extend(_c.query_params, { 'user' : userInfo.id });
            }

            // backing this up for direct call
            var backupArgs = _.extend( {},_c.args);
            _.extend(_c.args, {
                url: _c.ajax_url,
                error: function(){
                    console.log('[CDNCache]: Error calling the CDN, falling back to direct server call');
                    $.ajax(backupArgs);
                },
                xhrFields: {
                    withCredentials: _c.withCredentials
                },
                headers: _c.custom_headers,
                data: _c.query_params,
                cache: true
            });

            // this check is to support IE 9
            // IE 9 doesnt handle CORS effectively with XDomainRequests
            if ($.support.cors) {
                $.ajax( _c.args);
            } else {
                $.ajax(backupArgs);
            }
        })
        .fail( function() {
            // there is a case where the deferred object doesnt resolve or reject. (Eg. when user is not authorized)
            // in that case this snippet shall not execute
            console.log('[CDNCache]: could not fetch all the data required to perform the call, aborting');
        });
    };

    return CDNCache;
});
