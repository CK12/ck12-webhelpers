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
define(['jquery',
    'underscore',
    'modality/services/services',
    'common/utils/url',
    'common/utils/user'
    /*,
    'js/flxweb.retrolation.widget'
    */
], function ($, _, ES, URL, User) {
    'use strict';
    //Curried templates. Yummy :)
    function loadViewEssentials(view_mode) {
        var _d = $.Deferred();
        try {
            if (view_mode === 'embed') {
                require(['embed/templates/embed.templates', 'embed/views/concept.renderer'], function (templates, renderer) {
                    _d.resolve({
                        'TMPL': templates,
                        'renderer': renderer
                    });
                });
            } else {
                require(['modality/templates/modality.templates', 'modality/views/concept.renderer'], function (templates, renderer) {
                    _d.resolve({
                        'TMPL': templates,
                        'renderer': renderer
                    });
                });
            }
        } catch (e) {
            _d.reject('Could not load renderer and templates');
        }
        return _d.promise();
    }

    var ConceptController = function (params, loader) {

        var _c = this,
            user = new User();

        this.modality_groups = null;
        this.modality_types = null;
        this.student_modality_types = null;
        this.requested_filters = null;
        this.modality_count = null;
        this.domain_handle = null;
        this.branch_handle = null;
        this.collection_handle = null;
        this.creator = null;
        this.concept_collection_absolute_handle = null;
        this.concept_collection_title = null;
        this._domain = null;
        this._modality_cache = {};
        this.el = null;
        this.Renderer = null;
        this.TMPL = null;
        this.modalityTemplate = null;
        this.filterTemplate = null;
        this.filter_level = null;
        this.filter_by = null;
        this.count_by_level = null;
        this.view_mode = null;
        this.referrer = null;
        this.userId = $('header').attr('data-user');
        this.concept_image = null;
        this.onlyAllLevel = false;
        this.fullViewArtifacts = ['asmtpracticeint', 'plix', 'simulationint'];

        this.cleanup = function () {
            _c.Renderer.cleanupFilters();
            _c.Renderer.cleanupModalities();
            $('#embed_container').html('');
        };

        this.getModalityGroupByType = function (modality_type) {
            return _.find(this.modality_groups, function (grp) {
                return _.contains(grp.artifact_types, modality_type);
            });
        };

        this.getModalityGroupByName = function (group_name) {
            return _.find(this.modality_groups, function (grp) {
                return grp.group_classname === group_name;
            });
        };

        this.getScores = function (perma) {
            var _d = $.Deferred();
            ES.getScores(perma).done(function (result) {
                _d.resolve(result);
            }).fail(console.log);
            return _d.promise();
        };

        this.getAdaptiveScores = function (perma,collectionHandle) {
            var _d = $.Deferred();
            ES.getAdaptiveScores(perma,collectionHandle).done(function (result) {
                _d.resolve(result);
            }).fail(console.log);
            return _d.promise();
        };


        this.getModalities = function (group_name) {
            var modality_type,
                _modality_cache = _c._modality_cache,
                _d = $.Deferred(),
                _modalities = _c.getModalityGroupByName(group_name).artifact_types;
            if (user.is_student()) {
                if ('all' === group_name) {
                    _modalities = _c.student_modality_types;
                } else {
                    _modalities = _.filter(_modalities, function (t) {
                        return _.contains(_c.student_modality_types, t);
                    });
                }
            } else if ('all' === group_name) {
                _modalities = [];
                for (modality_type in _c.modality_types) {
                    if (_c.modality_types.hasOwnProperty(modality_type)) {
                        _modalities.push(_c.modality_types[modality_type].artifact_type);
                    }
                }
            }
            if (_modality_cache[group_name]) {
                _d.resolve(_modality_cache[group_name]);
            } else {
            	window.ADAPTIVE_TEST_PROMISE = window.ADAPTIVE_TEST_PROMISE ? window.ADAPTIVE_TEST_PROMISE :ES.getAdaptiveScoresForEM({
                    'perma': 'practice/' + _c.domain_handle + '-Practice',
                    'perma_encodedID': 'practice/encodedid/' + _c.encodedId,
                    'eid': _c.encodedId,
                    'modality': _c.modality_count || {},
                    'collectionHandle':this.collection_handle || null
                });
                var modalitiesPromise = ES.getModalities(_c.domain_handle, {
                    'modalities': _modalities.join(','),
                    'pageSize': _c.getModalityGroupByName(group_name).count,
                    'ownedBy': _c.filter_by || '',
                    'level': _c.filter_level || '',
                    'conceptCollectionHandle': _c.concept_collection_handle_long,
                    'collectionCreatorID': _c.creator
                });
                $.when(modalitiesPromise, window.ADAPTIVE_TEST_PROMISE ).done(function (data, practice) {
                    if ((data instanceof Array) && data[0]){
                        data = data[0];
                    }
                    if (data && data.modalities instanceof Array) {
                        var modality, group, modality_group_name, i, l, j, artifactExistsInCache = false;
                        _c.concept_image = data.previewImageUrl;
                        if (group_name === 'all') {
                            //populate modality cache
                            for (i = 0, l = data.modalities.length; i < l; i++) {
                                modality = data.modalities[i];
                                group = _c.getModalityGroupByType(modality.artifactType);
                                if (group) {
                                    modality_group_name = group.group_classname;
                                    if (!_modality_cache[modality_group_name]) {
                                        _modality_cache[modality_group_name] = [];
                                        _modality_cache[modality_group_name].push(modality);
                                    } else {
                                        for (j = 0; j < _modality_cache[modality_group_name].length; j++) {
                                            if (modality.artifactID === _modality_cache[modality_group_name][j].artifactID) {
                                                artifactExistsInCache = true;
                                            }
                                        }
                                        if (!artifactExistsInCache) {
                                            _modality_cache[modality_group_name].push(modality);
                                        }
                                    }
                                }
                            }
                        }

                        if (practice && typeof practice === 'object') { //if practice is available then add it as practice to asmtpractice modality and based on practice key in modality we will change EM practice tile as per story #87342396 
                            for (i = 0, l = data.modalities.length; i < l; i++) {
                                if (data.modalities[i].artifactType === 'asmtpractice') {
                                    data.modalities[i].practice = practice;
                                    break;
                                }
                            }
                        }

                        _modality_cache[group_name] = data.modalities;
                        _d.resolve(data.modalities);
                    }
                    _modality_cache[group_name] = data.modalities;
                    _d.resolve(data.modalities);
                    $('#concept-loading-icon').addClass('hide').removeClass('show');
                }).fail(function () {
                    _d.reject('Could not load modalities');
                    $('#concept-loading-icon').addClass('hide').removeClass('show');
                });
            }
            return _d.promise();
        };

        this.processModalityCounts = function () {
            var count_by_level = {
                    'basic': 0,
                    'at grade': 0,
                    'advanced': 0
                },
                total_count = 0;
            _.each(this.modality_count, function (v, k) {
                var skip = false;

                if (!_c.modality_types.hasOwnProperty(k)) {
                    skip = true;
                }
                if (user.is_student()) {
                    if (!_.contains(_c.student_modality_types, k)) {
                        skip = true;
                    }
                }
                if (skip) {
                    delete _c.modality_count[k];
                } else {
                    _.each(v, function (count, level) {
                        count_by_level[level] += count;
                        total_count += count;
                    });
                }
            });
            _c.count_by_level = count_by_level;
            return total_count;
        };

        this.processModality = function (modality, levelCheck) {
            var modality_embed_url,
                modality_type = this.modality_types[modality.artifactType],
                modality_group = this.getModalityGroupByType(modality.artifactType),
                modality_url = '/',
                user_realm = null;
            // if modality type does not belong to any modality group
            if (!modality_type) {
                return '';
            }
            // if difficulty level of modality is not same as current filter level
            if (levelCheck && _c.filter_level && modality.level !== _c.filter_level.replace('+', ' ')) {
                return '';
            }
            if (_c.collection_handle)
            {
                modality_url += 'c/' + 
                            ((_c.creator != 3) ? 'user:' + _c.creator + '/' : '') + 
                            this.collection_handle + '/' + 
                            this.concept_collection_absolute_handle + '/' + 
                            modality.artifactType + '/';
            }
            else
            {
                modality_url += this.branch_handle + '/' + this.domain_handle + '/' + modality.artifactType + '/'; 
            }
            if (modality.realm) {
                user_realm = /:(.*)/.exec(modality.realm);
                if (user_realm.length >= 2) {
                    modality.realm = modality.realm.replace(user_realm[1], escape(user_realm[1]));
                }
                modality_url += modality.realm + '/';
            }
            modality_url += encodeURIComponent(modality.handle) + '/';
            modality_embed_url = new URL('/embed/').updateHashParams({
                'module': 'modality',
                'handle': modality.handle,
                'mtype': modality.artifactType,
                'context': this.domain_handle,
                'branch': this.branch_handle,
                'collectionHandle': this.collection_handle || '',
                'conceptCollectionHandle': this.concept_collection_handle_long || '',
                'conceptCollectionAbsoluteHandle': this.concept_collection_absolute_handle || '',
                'collectionCreatorID': this.creator,
                'filters': this.requested_filters.join(','),
                'view_mode': this.view_mode || '',
                'referrer':this.referrer || '',
                'nochrome': true
            }).url();
            modality.modality_group = modality_group;
            //BUG 31079: Don't use the full size cover image. It is HUGE in file size. 
            if (modality.coverImageSatelliteUrl || modality.coverImage) {
                if (modality.coverImageSatelliteUrl) {
                    modality.thumbnail_img = modality.coverImageSatelliteUrl.replace(/COVER_PAGE/g, 'COVER_PAGE_THUMB_POSTCARD_TINY').replace(/IMAGE/g, 'IMAGE_THUMB_POSTCARD_TINY');
                } else if(modality.coverImage.match('/flx/show/default') != null){
            		modality.thumbnail_img = modality.coverImage.replace('/flx/show/default/', '/flx/show/THUMB_POSTCARD/');
            	}
            	else {
            		modality.thumbnail_img = modality.coverImage.replace('/flx/show/', '/flx/show/THUMB_POSTCARD/');
            	}
            }
            modality.modality_display_label = modality_type.display_label;
            modality.details_url = modality_url;
            //[Bug 57185] Adding collection params...
            if(modality.artifactType === "asmtpractice"){
            	var collectionParams = "";
            	if(this.collection_handle){
            		collectionParams += "&collectionHandle=" + this.collection_handle;
                }
                if(this.concept_collection_handle_long){
                	collectionParams += "&conceptCollectionHandle=" + this.concept_collection_handle_long;
                }
                if(this.creator){
                	collectionParams += "&collectionCreatorID=" + this.creator;
                }
                modality.collectionParams = collectionParams;
            }
            modality.data_state = 'conceptLevel=' + _c.filter_level + '&conceptSource=' + _c.filter_by;
            modality.embed_url = (-1 === this.fullViewArtifacts.indexOf(modality.artifactType)) ? modality_embed_url : modality_url;
            if (modality.artifactType === 'plix') {
                // Removing summary since it can have html formatting and math
                modality.summary = modality.domain.name + ' Interactive';
            }
            return modality;
        };

        this.loadConcept = function (isReload, collectionData) {
            var url;
            //Step 1: first get the counts for each level and decide which level to show.
            //we want at-grade as the default level, if not go basic, else advanced
            ES.getModalities(_c.domain_handle, {
                'pageSize': 1,
                'ownedBy': _c.filter_by || '',
                'conceptCollectionHandle': _c.concept_collection_handle_long,
                'collectionCreatorID': _c.creator

            }).done(function (domain, collectionHandle, responseData) {
                if (domain) {
                    // Verify if we are going to display modalities for requested collection
                    /*if ((collectionHandle &&
                            collectionHandle.toLowerCase() !== _c.collection_handle) ||
                        // fallback if collectionHandle is not present
                        (domain.hasOwnProperty('branchInfo') && 
                        (domain.branchInfo.handle || '').toLowerCase() !== _c.branch_handle)
                    ) {
                        window.location = '/' + (domain.branchInfo.handle || '').toLowerCase() + '/' + _c.domain_handle;
                        return false;
                    }*/
                    _c.encodedId = domain.encodedID;
                    //Step 2:  Find out the modality counts by level
                    _c.modality_count = domain.modalityCount;
                    var count,
                        zeroLevelCount = 0,
                        totalLevelCount = 0,
                        total_count = _c.processModalityCounts();
                    if (!total_count) {
                        if (_c.view_mode) { // embed view
                            $('#modality_filters_list').add('.modality_list').remove();
                            $('#modalities_error').removeClass('hide').text('There are no CK-12 modalities for this concept.');
                        } else { // newspaper page
                            if (isReload) { // to prevent infinite loop in case count is zero for ck12 as well as community
                                _c.Renderer.renderConcept(domain);
                            } else {
                                _c.filter_by = 'ck12' === _c.filter_by ? 'community' : 'ck12';
                                _c.loadConcept(true, collectionData);
                            }
                        }
                        if(!collectionData) return false;
                    }
                    if (_c.encodedId.match('UGC')) {
                        $('.filters_container .filters_wrapper').addClass('hide');
                    }
                    if (!_c.filter_level) {
                        if (_c.count_by_level['at grade']) {
                            _c.filter_level = 'at+grade';
                            _c.getModalityGroupByName('all').count = _c.count_by_level['at grade'];
                        } else if (_c.count_by_level.basic) {
                            _c.filter_level = 'basic';
                            _c.getModalityGroupByName('all').count = _c.count_by_level.basic;
                        } else {
                            _c.filter_level = 'advanced';
                            _c.getModalityGroupByName('all').count = _c.count_by_level.advanced;
                        }
                    } else {
                        if ('all' === _c.filter_level) {
                            _c.filter_level = '';
                            _c.getModalityGroupByName('all').count = total_count;
                        } else {
                            _c.getModalityGroupByName('all').count = _c.count_by_level[_c.filter_level.replace('+', ' ')];
                        }
                    }
                    for (count in _c.count_by_level) {
                        if (_c.count_by_level.hasOwnProperty(count) && !(isNaN(_c.count_by_level[count]))) {
                            totalLevelCount++;
                            if (0 === _c.count_by_level[count]) {
                                zeroLevelCount++;
                            }
                        }
                    }
                    if (zeroLevelCount >= (totalLevelCount - 1)) {
                        _c.filter_level = '';
                        _c.getModalityGroupByName('all').count = total_count;
                        _c.onlyAllLevel = true;
                    }

                    if (collectionData)
                    {
                        domain.collectionInfo = 
                            {
                                collectionTitle: collectionData.title,
                                collectionHandle: collectionData.handle,
                                conceptCollectionTitle: collectionData.descendantCollection.title,
                                canonical: "https://www.ck12.org/" + _c.collection_handle + "/" + _c.domain_handle
                            }
                            if ('nextDescendantCollection' in collectionData)
                            {
                                domain.collectionInfo['nextHref'] = "../" + collectionData.nextDescendantCollection.absoluteHandle
                                domain.collectionInfo['nextTitle'] = "Next: " + collectionData.nextDescendantCollection.title
                            }
                            if ('previousDescendantCollection' in collectionData)
                            {
                                domain.collectionInfo['prevHref'] = "../" + collectionData.previousDescendantCollection.absoluteHandle
                                domain.collectionInfo['prevTitle'] = "Previous: " + collectionData.previousDescendantCollection.title
                            }
                            var link = document.createElement('link');
                            link.rel = 'canonical'
                            link.href = domain.collectionInfo.canonical;
                            document.head.appendChild(link);
                            console.log("Canonical url: " + document.querySelector("link[rel='canonical']").href)
                    }
                    //Step 3: Once we know what level to get, make the API calls to get the modalities, Render them
                    _c.Renderer.renderConcept(domain);

                    //Step 4: pass the concept details to the RetrolationWidget
                    /*
                    new RetrolationWidget({
                        eid: domain.encodedID,
                        containerSelector: '.concept-info-banner .retrolation'
                    });
                    */
                } 
                // Check if its a migrated/renamed concept
                else if (responseData && responseData.responseHeader && responseData.responseHeader.status === 2063) {
                    if (responseData.response.redirectedConcept) {
                        url = new URL();
                        url.updateHashParams({
                            'handle': responseData.response.redirectedConcept.handle,
                            'branch': responseData.response.redirectedConcept.branchInfo.handle
                        });
                        window.location = url.url();
                    } else {
                        _c.Renderer.noConcept();
                    }
                } else {
                    _c.Renderer.noConcept();
                }
            });
        };

        this.getConcepts = function (topic) {
            var _d = $.Deferred();
            ES.getConcepts(topic, {
                'pageSize': 100
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function () {
                _d.reject('Could not load concepts');
            });
            return _d.promise();

        };

        this.setActiveFilter = function (filter) {
            if (_.find(_c.modality_groups, function (g) {
                    return g.group_classname === filter;
                })) {
                _c.active_filter = filter;
            }
        };

        this.loadAndRenderModalities = function(params, url, modalityConfig, essentials, collectionData)
        {
            if (collectionData === undefined) collectionData = false;
            if ($(window).width() < 768) {
                        var practiceModality = modalityConfig.modalities.asmtpractice;
                        practiceModality.weight_student = 0;
                        practiceModality.weight_teacher = 0;
                    }
                    _c.TMPL = essentials.TMPL;
                    _c.Renderer = new essentials.renderer(_c);

                    _c.modality_groups = modalityConfig.modality_groups;

                    if ('embed' === params.view_mode) {
                        if (url.hash_params.selectedFilter) {
                            _c.setActiveFilter(url.hash_params.selectedFilter);
                        }
                    } else {
                        if (url.hash && url.hash.length > 1) {
                            _c.setActiveFilter(url.hash.substr(1));
                        }
                    }

                    if (_c.requested_filters === '__ALL__') {
                        _c.requested_filters = _.map(_c.modality_groups, function (g) {
                            return -1 === (params.exclude || '').indexOf(g.group_classname) ? g.group_classname : '';
                        });
                    }
                    _c.modality_types = modalityConfig.modalities;
                    _c.student_modality_types = [];
                    _.each(_c.modality_types, function (t) {
                        if (t.student_show) {
                            _c.student_modality_types.push(t.artifact_type);
                        }
                    });
                    $(_c.el).html(_c.TMPL.CONCEPT_MAIN);
                    //Don't load featured modalities for embed OR elementary math pages
                    if (collectionData) {
                        // if collection data is available
                    		var collectionHandle = collectionData.handle;
                            _c.domain_handle = ('taxonomyComposistionsInfo' in collectionData.descendantCollection) ? collectionData.descendantCollection.taxonomyComposistionsInfo[0].branches[0].concepts[0].handle.toLowerCase() : collectionData.descendantCollection.absoluteHandle;
                            _c.concept_collection_title = collectionData.descendantCollection.title || '';
                            _c.concept_collection_handle_long = collectionData.descendantCollection.handle.toLowerCase();
                            _c.creator = collectionData.creatorID || collectionData.collectionCreatorID || _c.creator;
                            _c.branch_handle = ('taxonomyComposistionsInfo' in collectionData.descendantCollection) ? collectionData.descendantCollection.taxonomyComposistionsInfo[0].branches[0].handle.toLowerCase() : collectionData.handle;
                            if (!_c.view_mode && window.location.pathname.indexOf('/elementary-math-grade') === -1  && window.location.pathname.indexOf('/spelling/') === -1) {
                                ES.getFeatured(_c.domain_handle ,_c.concept_collection_handle_long, _c.creator).done(function (response) {
                                    $('#featured-loading-icon').removeClass('hide');
                                    _c.Renderer.renderFeatured(response.Artifacts || '',collectionHandle);
                                }).fail(console.log);
                            } else {
                                $('#featured_content').parents('.featured_content').addClass('hide');
                            }
                            _c.loadConcept(false, collectionData);
                        
                    }
                    else
                    // if collection data is not avaialble
                    {
                        if (!_c.view_mode && window.location.pathname.indexOf('/elementary-math-grade') === -1  && window.location.pathname.indexOf('/spelling/') === -1) {
                            ES.getFeatured(_c.domain_handle).done(function (response) {
                                $('#featured-loading-icon').removeClass('hide');
                                _c.Renderer.renderFeatured(response.Artifacts || '');
                            }).fail(console.log);
                        } else {
                            $('#featured_content').parents('.featured_content').addClass('hide');
                        }
                        _c.loadConcept();
                    }
                    _c.modalityTemplate = _.template(_c.TMPL.MODALITY, null, {
                        variable: 'data'
                    });
                    _c.filterTemplate = _.template(_c.TMPL.MODALITY_FILTERS, null, {
                        variable: 'data'
                    });
        }
        /**
         * Initialization
         */
        this.init = function (params) {
            var _filters,
                url = new URL();
            if (params.view_mode === 'embed') {
                this.view_mode = 'embed';
                this.filter_by = 'ck12';
            } else {
                this.filter_by = url.search_params.by || 'ck12';
            }
            this.filter_level = url.search_params.difficulty || '';
            this.referrer = url.hash_params.referrer || '';

            this.domain_handle = params.handle;
            this.branch_handle = params.branch ? params.branch.toLowerCase().replace(/[\s]+/g, '-') : '';
            this.collection_handle = params.collectionHandle ? params.collectionHandle.toLowerCase() : '';
            this.creator = params.creator || params.collectionCreatorID ? params.creator || params.collectionCreatorID : '3';
            //this.concept_collection_absolute_handle = params.conceptCollectionAbsoluteHandle || '';
            if (params.conceptCollectionAbsoluteHandle && params.conceptCollectionAbsoluteHandle.length > 0) {
                this.concept_collection_absolute_handle = params.conceptCollectionAbsoluteHandle;
            } else if (params.handle && params.handle.length > 0) {
                this.concept_collection_absolute_handle = params.handle;
            } else {
                this.concept_collection_absolute_handle = '';
            }
            this.concept_collection_title = params.conceptCollectionTitle || '';

            this.el = params.el || $('#embed_container');
            _filters = params.filters;
            if (_filters) {
                _filters = _filters.split(',');
                this.requested_filters = _.map(_filters, function (f) {
                    return -1 === (params.exclude || '').indexOf($.trim(f)) ? $.trim(f) : '';
                });
            } else {
                this.requested_filters = '__ALL__';
            }
            if (_c.collection_handle && _c.concept_collection_absolute_handle) 
            {
                // collectionHandle is available
                
                $.when(ES.getModalityConfig(), loadViewEssentials(params.view_mode), ES.getCollectionDescendantInfo(_c.collection_handle, _c.concept_collection_absolute_handle, _c.creator, {}))
                    .done(function (modalityConfig, essentials, collectionData) {
                        _c.loadAndRenderModalities(params, url, modalityConfig, essentials, collectionData);
                    })
                    .fail(function()
                    {
                        $('#modality_main').html('<center><h3>Oops! could not find any content for this concept.</h3></center>');
                    })
            }
            else
            {
                //load groups config
                $.when(ES.getModalityConfig(), loadViewEssentials(params.view_mode))
                    .done(function (modalityConfig, essentials) {
                        _c.loadAndRenderModalities(params, url, modalityConfig, essentials);
                    });
            }

        };

        this.hashchange = function () {
            var url = new URL(),
                hash = null;
            if (url.hash && url.hash.length > 1) {
                hash = url.hash.substr(1);
                if (_.find(_c.modality_groups, function (g) {
                        return g.group_classname === hash;
                    })) {
                    _c.Renderer.applyFilter(hash);
                }
            }
        };

        this.getModalityInfo = function (type, artifactID) {
            var _d = $.Deferred();
            ES.getModalityInfo(type, artifactID).done(function (data) {
                _d.resolve(data[type]);
            }).fail(function (data) {
                _d.reject(data);
            });
            return _d.promise();
        };

        this.destroy = function () {
            _c.cleanup();
        };

    };
    return ConceptController;
});
