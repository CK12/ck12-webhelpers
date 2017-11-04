define(['jquery',
        'bookmarklet/views/bookmarklet.views',
        'bookmarklet/services/ck12.bookmarklet',
        'common/utils/url',
        'jquery-ui'
    ],
    function ($, views, service, URL) {
        'use strict';

        var activeView,
            self,
            initContainer,
            isIframeSupport;
        function checkBookmarkletResult(result) {
            if (result.hasOwnProperty('response')) {
                result = result.response;
                if (result.hasOwnProperty('message')) {
                    result = '';
                }
            } else {
                result = '';
            }
            return result;
        }

        function checkSaveResourceResult(result) {
            if (result.hasOwnProperty('response')) {
                result = result.response;
                if (result.hasOwnProperty('message')) {
                    if(result.message.match('already exists')) {
                        result = 'A resource with this title already exist. Please give a unique name.';
                    } else {
                        result = 'Something went wrong while saving the resource. Please try after sometime.'
                    }
                }
            } else {
                result = '';
            }
            return result;
        }

        function checkCreateEmbedResult(result) {
            if (result.hasOwnProperty('response')) {
                result = result.response;
                if (result.hasOwnProperty('message')) {
                    if(result.message.match('blacklisted')) {
                        result = "Can't add this resource. The Provider is Blacklisted.";
                    } else if(result.message.match(/unknown provider/i)){
                        result = "Please provide a valid embed code.";
                    } else {
                        result = 'Something went wrong while saving the resource. Please try after sometime.'
                    }
                }
            } else {
                result = '';
            }
            return result;
        }
        
        function switchView(View){
            if (activeView){
                activeView.remove();
            }
            activeView = new View({
                'el': initContainer,
                'controller': self
            });
        }

        function loadView() {
            if (window.ck12_signed_in) {
                switchView(views.resourceView);
            } else {
                switchView(views.loginView);
            }
        }

        var BookmarkletController = function () {

            this.init = function (container) {
                var pageType,
                    url = new URL(location.href),
                    urlInfo;
                self = this;
                initContainer = container;
                pageType = url.search_params.type || '';
                url = url.href.split('?url=')[1].split('&title')[0];
                url = new URL(url);
                if (url.hash) {
                    url = url.href.replace('#', '?');
                    url = new URL(url);
                }
                if (url.host.match('ck12.org')) {
                    switchView(views.ck12View);
                    if ('Modality Details' === pageType) {
                        $('#add-library-msg').removeClass('hide');
                    }
                } else {
                    service.validateURL({
                        'url': url.href
                    }).done(function (result) {
                        result = checkBookmarkletResult(result);
                        urlInfo = result.url_info;
                        if(result && result.url_info.valid) {
                            self.urlOptions = {
                                    'isEmbedSupport': urlInfo.embeded.embededSupport,
                                    'embedResponse': urlInfo.embeded.embededResponse,
                                    'iframeResponse': urlInfo.iframe.iframeResponse,
                                    'isIframeSupport': urlInfo.iframe.isIframeSupport,
                                    'embedUrl': urlInfo.url
                            };
                            loadView();
                        } else {
                            console.log('something is not right');
                            switchView(views.invalidView);
                        }
                    }).fail(function () {
                        console.log('something is not right');
                        switchView(views.invalidView);
                    });
                }
                if (window._ck12) {
                    _ck12.logEvent('FBS_BKMKLT_LAUNCH', {'memberID': ads_userid});
                }
            };
            this.getSearchConcepts = function(query) {
                var _d = $.Deferred();
                service.searchConcepts(query).done(function(result) {
                    _d.resolve(checkBookmarkletResult(result));
                }).fail(function() {
                    _d.reject();
                });
                return _d.promise();
            }
            this.getSearchTags = function(query) {
                var _d = $.Deferred();
                service.searchTags(query).done(function(result) {
                    _d.resolve(checkBookmarkletResult(result));
                }).fail(function() {
                    _d.reject();
                });
                return _d.promise();
            }
            this.saveResourceData = function(options, type) {
                var _d = $.Deferred();
                service.saveResource(options, type).done(function(result) {
                    result = checkSaveResourceResult(result);
                    if(typeof(result) === 'object') {
                        _d.resolve(result);
                    } else {
                        _d.reject(result);
                    }
                }).fail(function() {
                    _d.reject();
                });
                return _d.promise();
            }
            this.createEmbeddedObject = function(options) {
                var _d = $.Deferred();
                service.createEmbedObject(options).done(function(result) {
                    result = checkCreateEmbedResult(result);
                    if(typeof(result) === 'object') {
                        _d.resolve(result);
                    } else {
                        _d.reject(result);
                    }
                }).fail(function() {
                    _d.reject();
                });
                return _d.promise();
            }
        };
        return BookmarkletController;
    });