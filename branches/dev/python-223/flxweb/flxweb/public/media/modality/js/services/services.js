/**
 * Copyright 2007-2013 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Nachiket Karve
 *
 * $Id$
 */
define(['require','jquery', 'common/utils/utils','modality/templates/modality.templates', 'cache/cdn_cache'],
    function (require, $, util, ModalityTemplates, CDNCache) {
        'use strict';
        var API = {
                'MODALITIES': util.getApiUrl('flx/get/minimal/modalities/'),
                'COLLECTIION_DESCENDENTS': util.getApiUrl('taxonomy/collection/'),
                'GROUPS_CONFIG': '/ajax_modality_config/',
                'MODALITY': util.getApiUrl('flx/get/perma/modality/info/'),
                'MODALITY_PERMA': util.getApiUrl('flx/get/perma/modality/'),
                'CONCEPTS': util.getApiUrl('flx/browse/modality/artifact/'),
                'MODALITYINFO': util.getApiUrl('flx/get/info/'),
                'PRACTICE_SCORE': '/assessment/api/get/summary/testScores/my/test/',
                'QUIZ_INFO': '/assessment/api/get/info/test/',
                'COPY_QUIZ': '/assessment/api/copy/test/',
                'ADAPTIVE_PRACTICE_SCORE': '/assessment/api/get/info/test/',
                'PERMA': util.getApiUrl('flx/get/perma/'),
                'FEATURED_CONTENT': util.getApiUrl('flx/get/featured/modalities/lesson,lecture,asmtpractice,enrichment,simulationint,simulation,PLIX/')
                    //                                    'FEATURED_CONTENT': '/media/modality/js/services/featured'
            },
            services = {
                getModalities: function (handle, options) {
                    var api = API.MODALITIES,
                        defaults = {
                            'pageSize': 20,
                            'pageNum': 0,
                            'ownedBy': 'ck12',
                            'modalities': null,
                            'level': null
                        },
                        _d = $.Deferred();

                    options = $.extend(defaults, options);

                    if (options.level) {
                        var _lvl = (options.level === 'at+grade') ? 'at grade' : options.level;
                        api += _lvl + '/';
                    }

                    if (options.modalities === '__ALL__') {
                        options.modalities = null;
                    }

                    if (options.collectionHandle === ''|| options.collectionHandle === undefined) 
                    // no collectionHandle
                    {
                        delete options.collectionHandle;
                    }
                    
                    api += handle;
                    
                    var ajaxOptions = {
                        url: api,
                        data: options,
                        dataType: 'json',
                        isShowLoading: true,
                        loadingElement: '#concept-loading-icon',
                        success: function (data) {
                            _d.resolve(data.response.domain, data.response.collectionHandle, data);
                        },
                        error: function () {
                            console.log('Something is not right.');
                            _d.reject('Something is not right.');
                        },
                        cache: true
                    };

                    if (!options.ownedBy || options.ownedBy !== 'ck12' ) {
                        util.ajax(ajaxOptions);
                    } else {
                        var cdnCache = new CDNCache(ajaxOptions);
                        cdnCache
                            .setExpirationAge('daily')
                            .fetch();
                    }
                    return _d.promise();                   
                },
                getFeatured: function (eID, conceptCollectionHandle, collectionCreatorID) {
                    var _d = $.Deferred();
                    var api;
                    if (conceptCollectionHandle === '' || conceptCollectionHandle === undefined)
                        api = API.FEATURED_CONTENT + eID
                    else
                        api = API.FEATURED_CONTENT + eID + '?conceptCollectionHandle=' + conceptCollectionHandle + '&collectionCreatorID=' + collectionCreatorID
                    //util.ajax({
                    var cdnCache = new CDNCache({
                        'url': api,
                        'dataType': 'json',
                        'isShowLoading': true,
                        'loadingElement': '#featured-loading-icon',
                        'success': function (data) {
                            _d.resolve(data.response);
                        },
                        'error': function () {
                            _d.reject('Failed to load featured content');
                        }
                    });
                    cdnCache
                        .setExpirationAge('daily')
                        .fetch();
                    return _d.promise();
                },
                getScores: function (perma) {
                    var _d = $.Deferred();
                    util.ajax({
                        'url': API.PRACTICE_SCORE + perma,
                        'dataType': 'json',
                        'data': {
                            'includeHighest': true,
                            'includeLatest': true,
                            'checkFreeAttempts': true
                        },
                        'success': function (data) {
                            _d.resolve(data.response);
                        },
                        'error': function () {
                            _d.reject('Failed to load featured content');
                        }
                    });
                    return _d.promise();
                },
                getQuizInfo: function (perma, minimal) {
                    var _d = $.Deferred();
                    perma = perma.replace(/(^\/asmtquiz)|(asmtquiz)/,'quiz');
                    var url = API.QUIZ_INFO + perma + ((minimal === true) ? '?minimal=True' : '');
                    util.ajax({
                        'url': url,
                        'dataType': 'json',
                        'success': function (data) {
                            _d.resolve(data.response);
                        },
                        'error': function () {
                            _d.reject('Failed to load custom quiz info');
                        }
                    });
                    return _d.promise();
                },
                getAdaptiveScores: function (perma, collectionHandle) {
                    var _d = $.Deferred();
                    var options = {
                            'adaptive': true,
                            'checkUserLogin': true,
                            'checkFreeAttempts': true,
                            'spacedSchedule':true
                    };
                    if(collectionHandle){
                    	options['collectionHandle'] = collectionHandle;
                    }
                    util.ajax({
                        'url': API.ADAPTIVE_PRACTICE_SCORE + perma,
                        'dataType': 'json',
                        'cache': false,
                        'data': options,
                        'success': function (data) {
                            _d.resolve(data.response);
                        },
                        'error': function () {
                            _d.reject('Failed to load featured content');
                        }
                    });
                    return _d.promise();
                },
                getAdaptiveScoresForEM: function (settings) {
                    var _d = $.Deferred();
                    var options = {
                            'adaptive': true,
                            'checkUserLogin': true,
                            'checkFreeAttempts': true,
                            'spacedSchedule':true
                    };
                    if(settings && settings.collectionHandle){
                    	options['collectionHandle'] = settings.collectionHandle;
                    }
                    if(settings && settings.eid){
                        settings.perma = settings.perma_encodedID;
                    }
                    if (settings.perma && settings.modality.hasOwnProperty('asmtpractice')) { //this call should only be made for elementary math practice tile
                        util.ajax({
                            'url': API.ADAPTIVE_PRACTICE_SCORE + settings.perma,
                            'dataType': 'json',
                            'cache': false,
                            'data': options,
                            'success': function (data) {
                                if (data.responseHeader.status === 0) {
                                    _d.resolve(data.response);
                                } else {
                                    _d.resolve('elementary math practice not available');
                                }
                            },
                            'error': function () {
                                _d.resolve('elementary math practice not available');
                            }
                        });
                    } else {
                        _d.resolve('elementary math practice not available');
                    }

                    return _d.promise();
                },
                getModalityConfig: function () {
                    var _d = $.Deferred();
                    var modalityConfigJSON = ModalityTemplates.MODALITY_CONFIG;
                    var modalityConfig = JSON.parse(modalityConfigJSON);
                    return _d.resolve(modalityConfig);
                },
                getModality: function (mtype, mhandle, chandle, realm, options) {
                    var api = API.MODALITY,
                        _d = $.Deferred();

                    if (!chandle){
                        api = API.PERMA;
                    }


                    api += mtype + '/' + mhandle;

                    if (realm) {
                        api += '/' + realm;
                    }
                    if (chandle){
                        api += '/' + chandle;
                    }
                    console.log(api);
                    util.ajax({
                        url: api,
                        dataType: 'json',
                        data: options,
                        isPageDisable: true,
                        isShowLoading: true,
                        success: function (data) {
                            var result = null;
                            console.log(data);
                            if (chandle){
                                if (data.response.hasOwnProperty('domain')){
                                    result = data.response.domain[mtype];
                                }
                            } else {
                                if (data.response.hasOwnProperty(mtype)){
                                    result = data.response[mtype];
                                }
                            }
                            if (result) {
                                _d.resolve(result);
                            } else {
                                console.log('Error fetching modality info');
                                _d.reject('Error fetching modality info');
                            }
                        },
                        error: function () {
                            console.log('Error fetching modality info');
                            _d.reject('Error fetching modality info');
                        }
                    });
                    return _d.promise();
                },
                getModalityXHTML: function (mtype, mhandle, realm, eid, rev) {
                    var api,
                        _d = $.Deferred();

                    if (mtype === 'section'){
                        api = API.PERMA;
                    } else {
                        api = API.MODALITY_PERMA;
                    }

                    api +=  mtype + '/' + mhandle;

                    if (realm) {
                        api += '/' + realm;
                    }

                    if (eid && mtype !== 'section'){
                        api +=  '/' + eid;
                    }
                    util.ajax({
                        url: api,
                        data: {
                            'extension': 'version:' + rev,
                            'format': 'html'
                        },
                        dataType: 'html',
                        isPageDisable: true,
                        isShowLoading: true,
                        success: function (data) {
                            _d.resolve(data);
                        },
                        error: function () {
                            _d.reject('Error fetching xhtml');
                        }
                    });
                    return _d.promise();
                },
                getConcepts: function (topic, options) {
                    var _d = $.Deferred();
                    //util.ajax({
                    var cdnCache = new CDNCache({
                        cache: true,
                        url: API.CONCEPTS + topic + '/all',
                        dataType: 'json',
                        data: options,
                        isShowLoading: true,
                        loadingElement: '#concept-dropdown-loading',
                        success: function (data) {
                            _d.resolve(data.response);
                        },
                        error: function () {
                            console.log('Something is not right.');
                            _d.reject('Something is not right.');
                        },
                        localCache: {
                            region: 'daily',
                            key: 'conceptData' + topic,
                            namespace: 'newspaper',
                            validatedata: function (data) {
                                try {
                                    return (data.responseHeader.status === 0);
                                } catch (e) {
                                    console.log(e);
                                    return false;
                                }
                            }
                        }
                    });
                    cdnCache
                        .setExpirationAge('monthly')
                        .fetch();
                    return _d.promise();
                },
                getModalityInfo: function (type, artifactID) {
                    var _d = $.Deferred();

                    type = type || 'read';
                    artifactID = artifactID || '';

                    util.ajax({
                        'url': API.MODALITYINFO + type + '/' + artifactID,
                        'dataType': 'json',
                        'isPageDisable': true,
                        'isShowLoading': true,
                        'success': function (data) {
                            _d.resolve(data.response);
                        },
                        'error': function () {
                            _d.reject('Failed to get modality info');
                        }
                    });
                    return _d.promise();
                },
                copyTest: function (settings) {
                    util.ajax({
                        'url': API.COPY_QUIZ + settings.testId,
                        'type': 'POST',
                        'data': settings.data,
                        'success': function (response) {
                            if (response.responseHeader.status === 0) {
                                settings.success && settings.success(response.response);
                            } else {
                                settings.error && settings.error(response.response);
                            }
                        }
                    });
                },
                getCollectionDescendantInfo: function (collectionHandle, conceptCollectionHandle, collectionCreatorID, options) {
                    var api = API.COLLECTIION_DESCENDENTS,
                        defaults = {
                            'includeTaxonomyComposistionsInfo': true,
                            'ownedBy': 'ck12',
                            considerCollectionDescendantsWithEncodedIDForTraversal: true
                        },
                        _d = $.Deferred();

                    options = $.extend(defaults, options);
                    if (options.ownedBy === 'all') {
                        options.ownedBy = '';
                    }

                    if(!collectionCreatorID) collectionCreatorID = '3'
                    
                    api += "collectionHandle=" + collectionHandle ;
                    api += "&collectionCreatorID=" + collectionCreatorID ;
                    api += "/descendant/absoluteCollectionDescendantHandle=" + conceptCollectionHandle ;
                    
                    var ajaxOptions = {
                        url: api,
                        data: options,
                        dataType: 'json',
                        isShowLoading: true,
                        loadingElement: '#concept-loading-icon',
                        success: function (data) {
                            _d.resolve(data.response.collection);
                        },
                        error: function () {
                            console.log('Something is not right.');
                            _d.reject('Something is not right.');
                        },
                        cache: true
                    };

                    if (!options.ownedBy || options.ownedBy !== 'ck12' ) {
                        util.ajax(ajaxOptions);
                    } else {
                        var cdnCache = new CDNCache(ajaxOptions);
                        cdnCache
                            .setExpirationAge('daily')
                            .fetch();
                    }
                    return _d.promise();
                }

            };
        return services;
    });
