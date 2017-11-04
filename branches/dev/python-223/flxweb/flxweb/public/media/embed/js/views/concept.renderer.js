define(['jquery', 'underscore', 'modality/services/services', 'embed/templates/embed.templates', 'common/utils/modality', 'common/utils/url'],
    function ($, _, MS, TMPL, modalityUtil, URL) {
        'use strict';

        var _postMessage;
        if (window.parent !== window && typeof window.parent.postMessage === 'function') {
            _postMessage = function (message) {
                try {
                    window.parent.postMessage(message, window.parent.location.origin);
                } catch (e) {
                    //
                }
            };
        } else {
            _postMessage = function () {};
        }

        function ConceptEmbedView(controller) {
            //TODO: This view is not self-complete. It relies heavily on the reference to it's controller.
            //Need to improve upon this.

            var applied_filter = null,
                isResize = true,
                resizeTimeout = 0,
                filterTemplate = _.template(TMPL.MODALITY_FILTERS, null, {
                    variable: 'data'
                });

            function cleanupFilters() {
                $('.filters_list').find('li.modality_group').each(function () {
                    $(this).off().remove();
                });
            }

            function applyFilter(group_name) {
                var group = _.find(controller.modality_groups, function (grp) {
                    return grp.group_classname === group_name;
                });
                applied_filter = group_name;
                controller.active_filter = group;
                $('.lnk_modality_filter').removeClass('selected');
                $('.lnk_modality_filter.group_' + group_name).addClass('selected');
                if (controller._modality_cache[group_name]) {
                    controller.Renderer.renderModalities(controller._modality_cache[group_name]);
                    _postMessage('{"message":"modalityFilterApplied"}');
                } else {
                    MS.getModalities(controller.domain_handle, {
                        modalities: controller.active_filter.artifact_types.join(','),
                        pageSize: controller.active_filter.count,
                        collectionHandle: controller.collection_handle,
                        conceptCollectionHandle: controller.concept_collection_handle_long,
                        collectionCreatorID: controller.creator
                    }).done(function (data) {
                        controller._modality_cache[group_name] = data.modalities;
                        controller.Renderer.renderModalities(data.modalities);
                        _postMessage('{"message":"modalityFilterApplied"}');
                    }).fail(function () {
                        console.log('Could not load modalities');
                    });
                }
            }

            function logFilterADS() {
                if (window._ck12) {
                    window._ck12.logEvent('FBS_MODALITY_FILTER ', {
                        'memberID': window.ads_userid,
                        'context_eid': controller.encodedId,
                        'modalityGroup': controller.active_filter.group_name.toLowerCase().replace(' ', '_'),
                        'referrer': 'concept_details'
                    });
                }
            }

            function bindEvents() {
                $('#modality_filters_list').off('click.modality').on('click.modality', '.modality_group', function () {
                    applyFilter($(this).find('.lnk_modality_filter').data('groupname'));
                    logFilterADS();
                    return false;
                });

                $('.mdoalityfilterdropmenuwrap').removeClass('hide').off('click.concept').on('click.concept', function () {
                    $(this).toggleClass('dropdown_active');
                });

                $(document).off('click.more-filter').on('click.more-filter', function (e) {
                    if (!($(e.target).hasClass('mdoalityfilterdropmenuwrap') || $(e.target).parents('li:first').hasClass('mdoalityfilterdropmenuwrap'))) {
                        $('.mdoalityfilterdropmenuwrap').removeClass('dropdown_active');
                    }
                });

                $(window).off('resize.filters').on('resize.filters', function () {
                    if (isResize) {
                        isResize = false;
                        setTimeout(function () {
                            // for modality filters
                            var totalVisible, extraModalities, extraModalitiesHTML;
                            $('#modality_filters_list').children('.modality_group').removeClass('hide');
                            $('.mdoalityfilterdropmenuwrap').addClass('hide').removeClass('dropdown_active');
                            totalVisible = Math.round($('#modality_filters_list').width() / $('#modality_filters_list').find('.modality_group:eq(0)').width());
                            if ($('#modality_filters_list').children('.modality_group').length <= totalVisible) {
                                isResize = true;
                                return false;
                            }
                            totalVisible -= 2;
                            $('#modality_filters_list').children('.modality_group.hide-small:hidden').each(function () {
                                if ($(this).index() <= totalVisible) {
                                    totalVisible++;
                                }
                            });
                            extraModalities = $('#modality_filters_list').children('.modality_group').eq(totalVisible).nextAll('.modality_group').not('.hide-small:hidden');
                            extraModalitiesHTML = '';
                            extraModalities.each(function () {
                                extraModalitiesHTML += this.outerHTML;
                            });
                            extraModalities.addClass('hide');
                            $('#more-concept-count').text(extraModalities.length);
                            $('#modality_extra_filter_list').empty().append(extraModalitiesHTML);
                            $('.mdoalityfilterdropmenuwrap').removeClass('hide');
                            isResize = true;
                            resizeTimeout = 500; // is zero if triggered manually
                        }, resizeTimeout); // allow for resize to complete
                    }
                });
            }

            function renderFilters() {
                cleanupFilters();
                var _filters_list, menu, isModality, sorted_groups, types, total_count;
                isModality = true;
                sorted_groups = _(controller.modality_groups).sortBy(function (g) {
                    return g.sequence;
                });
                _filters_list = $('.filters_list');
                _.each(sorted_groups, function (modality_group) {
                    if (_.contains(controller.requested_filters, modality_group.group_classname)) {
                        //calculate group count
                        types = modality_group.artifact_types;
                        total_count = 0;
                        _.each(controller.modality_count, function (counts, mtype) {
                            if (_.contains(types, mtype)) {
                                _.each(counts, function (count) {
                                    total_count += count;
                                });
                            }
                        });
                        //add modality group to the list
                        if (total_count) {
                            modality_group.count = total_count;
                            modality_group.modalityIcon = modalityUtil.getModalityIcon(modality_group.display_text || '');
                            _filters_list.append(filterTemplate(modality_group));
                            isModality = true;

                            if (!applied_filter) {
                                //do not reapply filter if it's already applied...
                                if (controller.active_filter) {
                                    if (modality_group.group_classname === controller.active_filter) {
                                        applyFilter(modality_group.group_classname);
                                    }
                                } else {
                                    applyFilter(modality_group.group_classname);
                                }
                            }
                        }
                    }
                });
                menu = $('.mdoalityfilterdropmenuwrap').remove();
                _filters_list.append(menu);
                if (!applied_filter) {
                    applyFilter(_.find(sorted_groups, function (group) {
                        return group.sequence && group.count;
                    }).group_classname); // if no filter is applied, default to first with count
                }
                $('#more-concept-count').text($('#modality_extra_filter_list').children().length);
                bindEvents();
                resizeTimeout = 0;
                $('#modality_filters_list').children('.modality_group').addClass('hide');
                $(window).trigger('resize');
                return isModality;
            }

            function renderConcept(domain) {
                var link,
                    conceptLink;
                if (controller.collection_handle && controller.concept_collection_absolute_handle) {
                    conceptLink = '/c/' + controller.collection_handle + '/' + controller.concept_collection_absolute_handle;
                } else {
                    conceptLink = '/' + controller.branch_handle + '/' + controller.domain_handle + '/';
                }
                $('#lnk_ext').attr('href', conceptLink);
                link = '<a class="icon-open_new_window icon-new-window hide" href="'+ conceptLink +'" target="_blank"></a>';
                // When in lms context set the target to lms-context-override
                // to render href without the lms context
                if (window.lmsContext === "lti-app"){
                    link = link.replace("_blank","lms-context-override");
                }
                $('.modality_title h2').html(( _.escape(controller.concept_collection_title || domain.name) || '') + link);
                if (domain.description) {
                    $('.artifact_description').text(domain.description).removeClass('hide');
                }
                if (!(renderFilters())) {
                    $('#modalities_error').text('There are no modalities avaliable for this concept.').removeClass('hide');
                    $('.filters_container').addClass('hide');
                }
            }

            function cleanupModalities() {
                $('.modality_list').find('li').each(function () {
                    $(this).off().remove();
                });
            }

            function renderInteractiveUrl(type, _modailty) {
                var embedUrl = new URL(window.location.href);
                embedUrl = embedUrl.updateHashParams({
                    'selectedFilter': (type === 'plix' ? 'interactive' : 'simulations')
                });
                _modailty.find('a').each(function(){
                    $(this).attr('href', $(this).attr('href') + '?returnUrl=' + encodeURIComponent(embedUrl.href));
                });
            }

            function renderModalities(modalities) {
                cleanupModalities();
                controller.filter_level = '';
                var _m;
                _.each(modalities, function (modality) {
                    modality = controller.processModality(modality);
                    if (modality) {
                        _m = $(controller.modalityTemplate(modality));
                        if(modality.artifactType === 'plix' || modality.artifactType === 'simulationint') {
                            renderInteractiveUrl(modality.artifactType, _m);
                        }
                        _m.off('click.concept').on('click.concept', function (e) {
                            if(!$(e.target).closest('.has_link_url').length) {
                                window.location = $(this).find('a').attr('href');
                            }
                        });
                        $('.modality_list').append(_m);
                    }
                });
            }

            function noConcept() {
                try {
                    alert('Sorry, the concept you are trying to view does not exist. Please make sure this link is valid.');
                } catch (e) {
                    // for "prevent additional dialogues" in FF.
                    console.log('Sorry, the concept you are trying to view does not exist. Please make sure this link is valid.');
                }
            }

            this.renderFilters = renderFilters;
            this.renderConcept = renderConcept;
            this.renderModalities = renderModalities;
            this.cleanupFilters = cleanupFilters;
            this.cleanupModalities = cleanupModalities;
            this.applyFilter = applyFilter;
            this.noConcept = noConcept;
        }

        return ConceptEmbedView;
    });
