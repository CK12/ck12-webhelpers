
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
    'common/utils/user',
    'embed/templates/embed.templates'
    /*,
    'js/flxweb.retrolation.widget'
    */
], function ($, _, ES, URL, User, TMPL) {
    'use strict';


    function renderInteractiveUrl(type, _modailty) {
        var embedUrl = new URL(window.location.href);
        embedUrl = embedUrl.updateHashParams({
            'selectedFilter': (type === 'plix' ? 'interactive' : 'simulations')
        });
        _modailty.find('a').each(function(){
            $(this).attr('href', $(this).attr('href') + '?returnUrl=' + encodeURIComponent(embedUrl.href));
        });
    }

    var ConceptController = function (params, loader) {

        var _c = this,
            user = new User();

        this.modality_groups = null;
        this.modality_types = null;
        this.student_modality_types = null;
        this.requested_filters = [];
        this.modality_count = null;
        this.domain_handle = null;
        this.branch_handle = null;
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
        this.userId = $('header').attr('data-user');
        this.concept_image = null;
        this.onlyAllLevel = false;
        this.fullViewArtifacts = ['asmtpracticeint', 'plix', 'simulationint'];

        this.cleanup = function () {
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



        this.processModality = function (modality, levelCheck) {
            if(!modality.domain || !modality.domain.handle || !modality.domain.branchInfo || !modality.domain.branchInfo.handle){
                return '';
            }
            var modality_embed_url,
                modality_type = this.modality_types[modality.artifactType],
                modality_group = this.getModalityGroupByType(modality.artifactType),
                modality_url = '/',
                user_realm = null,
                domain_handle = modality.domain.handle.toLowerCase(),
                branch_handle = modality.domain.branchInfo.handle.toLowerCase();
            // if modality type does not belong to any modality group
            if (!modality_type) {
                return '';
            }
            // if difficulty level of modality is not same as current filter level
            if (levelCheck && _c.filter_level && modality.level !== _c.filter_level.replace('+', ' ')) {
                return '';
            }
            modality_url += branch_handle + '/' + domain_handle + '/' + modality.artifactType + '/';
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
                'context': domain_handle,
                'branch': branch_handle,
                'filters': this.requested_filters.join(','),
                'view_mode': this.view_mode || '',
                'nochrome': true
            }).url();
            modality.modality_group = modality_group;
            //BUG 31079: Don't use the full size cover image. It is HUGE in file size.
            if (modality.coverImageSatelliteUrl) {
                modality.thumbnail_img = modality.coverImageSatelliteUrl.replace(/COVER_PAGE/g, 'COVER_PAGE_THUMB_POSTCARD_TINY').replace(/IMAGE/g, 'IMAGE_THUMB_POSTCARD_TINY');
            } else if (modality.coverImage) {
                modality.thumbnail_img = modality.coverImage.replace('/flx/show/', '/flx/show/THUMB_POSTCARD/');
            }
            modality.modality_display_label = modality_type.display_label;
            modality.details_url = modality_url;
            modality.data_state = 'conceptLevel=' + _c.filter_level + '&conceptSource=' + _c.filter_by;
            modality.embed_url = (-1 === this.fullViewArtifacts.indexOf(modality.artifactType)) ? modality_embed_url : modality_url;
            if (modality.artifactType === 'plix') {
                // Removing summary since it can have html formatting and math
                modality.summary = modality.domain.name + ' Interactive';
            }
            if (!modality.domain){
                modality.domain = {};
            }
            return modality;
        };

        /**
         * Initialization
         */
        this.init = function (params) {
            var _c = this;
            $('body').addClass('nochrome').addClass('embed-launcher');
            var returnURL = params.returnURL;
            console.log(params);
            //load groups config
            ES.getModalityConfig().done(function (modalityConfig) {
                _c.modality_groups = modalityConfig.modality_groups;
                _c.modality_types = modalityConfig.modalities;
                _c.getModalityInfo('artifact', params.artifactID)
                    .done(function(artifactInfo){
                        var modality = _c.processModality(artifactInfo);
                        if (returnURL){
                            modality.embed_url = (new URL(modality.embed_url))
                                                    .updateSearchParams({
                                                        backUrl: returnURL
                                                    })
                                                    .url();
                        }

                        var modalityTemplate = _.template(TMPL.MODALITY_LAUNCHER, null, {
                            variable: 'data'
                        });
                        if (modality) {
                            var _m = $(modalityTemplate(modality));
                            // if(modality.artifactType === 'plix' || modality.artifactType === 'simulationint') {
                            //     renderInteractiveUrl(modality.artifactType, _m);
                            // }
                            // _m.off('click.concept').on('click.concept', function (e) {
                            //     if(!$(e.target).closest('.has_link_url').length) {
                            //         window.location = $(this).find('a').attr('href');
                            //     }
                            // });
                            _m.removeClass('hide-small');
                            $('#embed_container').append(_m);
                        }
                        $("#embed_container .new-spinner").remove();
                    });
            });
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
