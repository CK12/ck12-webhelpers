/**
 * Copyright 2007-2011 CK-12 Foundation
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
 * $ID$
 */
define('flxweb.modality_views', ['jquery', 'underscore', 'backbone', 'flxweb.modality_models','modalityAssign/modality.assign.lib', 'common/models/assignment.quick.notification.model',
        'flxweb.models.artifact', 'flxweb.share.views','flxweb.tooltip.view', 'common/utils/modality', 'flxweb.concepts.model',
        'common/views/assignment.quick.notification.view', 'common/views/modal.view', 'common/views/footer.view', 'common/utils/date', 'common/utils/lms','ltiBridge','flxweb.global', 'jquery-ui', 'flxweb.settings', 'jquery.isotope'
    ],

    function ($, _, Backbone, mod_models, modalitylib,QuickAssignmentNotificationModel, Artifact, ShareViews, AssignTooltip , modalityUtil, ConceptsModule, QuickAssignmentNotificationView, ModalView, FooterView, date, lmsUtil, ltiBridge) {
        'use strict';

        var ModalityArtifactView, ModalityGroupView, ModalityFiltersView, ModalitiesView, ModalitiesRouter, 
        ModalityDetailsView, ModalityConceptView, ModalityAddToLibraryView,
            ModalityArtifact = mod_models.ModalityArtifact,
            ModalityArtifactCollection = mod_models.ModalityArtifactCollection,
            ModalityGroups = mod_models.ModalityGroups;
	if (window.lmsContext === 'lti-app'){
	    var assignTooltip = new AssignTooltip({
                parent: $('.assign-to-lms')                       
            });
	} else{
            var assignTooltip = new AssignTooltip({
                parent: $('.modality-info')                       
            });
        }
        //Views
        ModalityConceptView = Backbone.View.extend({
            'el': $('#concept_list_container'),
            'events': {
                'click .js-concept_button': 'ScrollList',
                'click .js-concept-close-icon': 'dropDownClose',
                'click .active a': 'activeElement'
            },
            'initialize': function () {
                var self = this;
                this.ConceptsCollection = new ConceptsModule.ConceptsCollection();
                this.ConceptsCollection.url = this.ConceptsCollection.url.replace('topic', $('#concept_list').attr('data-encodedID'));
		// Check for app context
		if ( window.lmsContext ==="lti-app"){
	            var LTIBridge = new ltiBridge();
		}
                $('#concept_list_container').removeClass('hide').hide(); // to maintain uniformity
                $('#artifact_dropdown').off('click.dropdown').on('click.dropdown', function () {
                    var This = $(this);
                    if (This.hasClass('js-disabled')) {
                        return false;
                    }
                    if ($('#concept_list') instanceof $ && $('#concept_list').length && $('#concept_list').is(':empty')) {
                        This.addClass('js-disabled');
                        self.ConceptsCollection.fetch({
                            success: function (collection, response) {
                                //once the concepts are fetched,
                                //update the view by calling render
                                self.render(response.response);
                                //handler to close the view when clicked outside the concept dropdown
                                $(document).on('click.concepts', function (e) {
                                    if ($(self.el).has(e.target).length || 'artifact_dropdown' === e.target.id || $(e.target).parents('#artifact_dropdown').length || $(e.target).hasClass('annotator-cancel')) {
                                        return; // do not return false
                                    }
                                    if ($('#concept_list_container').is(':visible')) {
                                        $('#artifact_dropdown').trigger('click');
                                    }
                                });
                            },
                            error: function () {}
                        });
                    } else {
                        $('#concept_list_container').slideToggle('slow', function () {
                            This.toggleClass('dropdown_open').children('i').toggleClass('icon-arrow3-down').toggleClass('icon-arrow3-up');
                            $('.concept_descriptions a').add('.concept_descriptions').css('max-width', $('#concept_list').width() - 45 + 'px');
                            $(window).scrollTop(0);
                        });
                    }
                });

                $('.assign_to_class').off('click').on('click', function () {
                    if (window.ck12_signed_in) {
                        modalitylib.init();
                    } else{
                        $.flxweb.alertToSignin();
                        return false;
                    }
                });

	            $('.assign_to_lms').off('click').on('click', function () {
			if ( window.lmsContext === 'lti-app'){
				console.log("This is LTI context");
				var data = lmsUtil.getAssignmentDetails();
				console.log(data);
				LTIBridge.onAssignAction(data);
		        }
	            });
                $('.assign-info-img').off('click').on('click', function (e) {
                	assignTooltip.open(e);    	
                });
                this.handleMenuRole();
                this.revealCollectionContextSensetiveButtons();
            	
            },
            'showAssignTooltip': function(){
               	var userId = $('header').attr("data-user");          	
            	if(userId && localStorage.getItem("assignTooltip-"+userId)){
            		$('#reveal-overlay').remove();
            	}else{
            		//handling case for non-sign-in user 
            		if(localStorage.getItem("assignTooltip-"+userId)){
            			$('#reveal-overlay').remove();
            			return;
            		}
            		assignTooltip.open();
            		$('#reveal-overlay').show();
                    try {
                        localStorage.setItem("assignTooltip-"+userId ,"true");
                    } catch (err) {
                        console.log("Not allowed to access localStorage.");
                    }
            	}
            },
            'handleMenuRole' : function(){
                var isTeacher = window.flxweb_roles ? window.flxweb_roles.indexOf("teacher") !== -1 : $.cookie("flxweb_role") === "teacher";
	           	if(!isTeacher){
	           		$('#reveal-overlay').remove();
                }else{
                	$(".assign-to-class").removeClass("hide"); 
				/*if ( assignTooltip ) {
	                	    this.showAssignTooltip();
				}*/
                }
            },
            'revealCollectionContextSensetiveButtons' : function(){
                $(".customize-practice").removeClass("hide");
                $(".create-question").removeClass("hide");
            },
            'render': function (concepts) {
                $('#concept_list_count').text(concepts.total + ' CONCEPTS');
                var index, concept, self,
                    html = '';
                concepts = concepts.results;
                for (index = 0; index < concepts.length; index++) {
                    concept = concepts[index];
                    html += ModalityConceptView.template({
                        'conceptURL': $('.topic_title:eq(0)').attr('href') + (concept.handle || ''),
                        'conceptName': concept.name || ''
                    });
                }
                concept = $('#concept_list');
                concept.html(html).children().filter(function () {
                    return this.title === $('#artifact_title').find('span[itemprop="name"]').text().trim();
                }).addClass('active');
                self = this;
                $('#concept_list_container').slideDown('slow', function () {
                    concept.find('a').add('.concept_descriptions').css('max-width', concept.width() - 45 + 'px');
                    $('#artifact_dropdown').removeClass('js-disabled').toggleClass('dropdown_open').children('i').toggleClass('icon-arrow3-down').toggleClass('icon-arrow3-up');
                    if ($('#concept_list_container').is(':visible') && $(window).width() < 767) {
                        $(window).scrollTop(0);
                    }
                    self.setDropDownScroll();
                });
                return this;
            },
            'setDropDownScroll': function () {
                var concept, scroll, top, self;
                self = this;
                concept = $('#concept_list');
                concept.css('top', '0px');
                scroll = Math.floor(concept.find('.active').index() / 10);
                if (scroll) {
                    top = concept.offset().top - concept.parent().offset().top - 4;
                    top -= concept.parent().innerHeight() * scroll;
                    if(scroll !== -1){
                    	concept.css('top', top + 'px');
                    }
                    $('.js-concept_button').addClass('js-disabled');
                    setTimeout(function () {
                        self.checkForActiveButton();
                        $('.js-concept_button').removeClass('js-disabled');
                    }, 800);
                } else {
                    self.checkForActiveButton();
                }
            },
            'checkForActiveButton': function (top) {
                var concept = $('#concept_list');
                top = Math.round(top || (concept.offset().top - concept.parent().offset().top - 4));
                if ((concept.parent().innerHeight() - top) >= concept.height()) {
                    $('#bottom_button').removeClass('active');
                    $('#concept_line').removeClass('bottom');
                } else {
                    $('#bottom_button').addClass('active');
                    $('#concept_line').addClass('bottom');
                }
                if (0 === top) {
                    $('#top_button').removeClass('active');
                    $('#concept_line').removeClass('top');
                } else {
                    $('#top_button').addClass('active');
                    $('#concept_line').addClass('top');
                }
            },
            'ScrollList': function (e) {
                var top, This, concept, self, conceptListHeight;
                This = $(e.currentTarget);
                if ($('.js-concept_button').hasClass('js-disabled') || !(This.hasClass('active'))) {
                    return false;
                }
                concept = $('#concept_list');
                conceptListHeight = concept.parent().innerHeight();
                top = concept.offset().top - concept.parent().offset().top - 4;
                top += This.hasClass('bottom_button') ? (-conceptListHeight) : conceptListHeight;
                This.addClass('js-disabled');
                concept.css('top', top + 'px');
                self = this;
                setTimeout(function () {
                    self.checkForActiveButton();
                    This.removeClass('js-disabled');
                }, 800);
            },
            'dropDownClose': function () {
                $('#artifact_dropdown').trigger('click');
            },
            'activeElement': function () {
                return false;
            }
           
        }, {
            'template': _.template($('#conceptDropdownTemplate').html(), null, {
                'variable': 'data'
            })
        });

        ModalityArtifactView = Backbone.View.extend({
            'tagName': 'li',
            'events': {
                'mouseover': 'onHoverIn',
                'mouseout': 'onHoverOut',
                'click .modality_info_wrapper': 'onClick'
            },

            'fetch': function (options) {
                this.trigger('fetching');
                Backbone.Model.prototype.fetch.call(this, options);
            },

            'render': function () {
                this.$el.html(ModalityArtifactView.template(this.model.toJSON()));
                //set size
                //this.$el.addClass('modality').addClass('size_'+this.model.get('size')).addClass('type_'+this.model.get('artifactType'));
                this.$el.addClass('modality').addClass('size_med').addClass('type_' + this.model.get('artifactType'));
                //add weights
                var modality = this.model.get('modality');
                if (modality !== undefined) {
                    this.$el
                        .data('weight_teacher', modality.weight_teacher)
                        .data('weight_student', modality.weight_student)
                        .data('weight_popularity', this.model.get('popularity'))
                        .data('details_url', this.model.get('details_url'));
                }
                this.share_menu = this.$('.share_menu');
                return this;
            },
            'onHoverIn': function () {
                this.$el.addClass('active');
            },
            'onHoverOut': function () {
                this.$el.removeClass('active');
            },
            'onClick': function () {
                // ADS tracks 'click' in a particular modality from concept page
                var payload = {};
                payload.artifactID = this.model.get('artifactID');
                payload.memberID = ads_userid;
                payload.context_eid = this.model.get('conceptNode');
                payload.modality_type = this.model.get('artifactType');
                payload.user_role = flxweb_role;
                $.flxweb.logADS('fbs_modality', payload);

                //$.flxweb.logADS('modality','clicked',1,[this.model.get('artifactID'),this.model.get('artifactRevisionID'),ads_userid],[this.model.get('artifactType'),this.model.get('conceptNode'),flxweb_role]);
                window.location.href = this.$el.data('details_url');
            }
        }, {
            'template': _.template($('#tmpl_modality').html(), null, {
                'variable': 'data'
            })
        });

        ModalityGroupView = Backbone.View.extend({
            'tagName': 'li',

            'initialize': function () {},
            'render': function () {
                this.$el.append(ModalityGroupView.template(this.model.toJSON()));
                this.$el.addClass('modality_group');
                return this;
            }
        }, {
            'template': _.template($('#tmpl_modality_filter').html(), null, {
                'variable': 'data'
            })
        });

        ModalityFiltersView = Backbone.View.extend({
            'el': $('#modality_filters_list'),
            'initialize': function () {},
            'render': function () {
                var context = this,
                    isResize = true,
                    resizeTimeout = 0,
                    menu = $('.mdoalityfilterdropmenuwrap').remove();

                context.$el.html('');
                if (!this.model.length) {
                    $('.modalities_top_container').addClass('show-for-small');
                    $('.modality-actions-all-mod-link').addClass('hide-important');
                    return;
                }
                this.model.sortBy(function (g) {
                    return g.get('sequence');
                }).forEach(function (modality_group) {
                    context.$el.append(new ModalityGroupView({
                        'model': modality_group
                    }).render().el);
                });
                context.$el.append(menu);
                $(window).off('resize.ModalityFiltersView').on('resize.ModalityFiltersView', function () {
                    if (isResize) {
                        isResize = false;
                        setTimeout(function () {
                            // for concept list dropdown

                            if ($('#artifact_dropdown').length > 0) {
                                $('#concept_list_container').css('top', $('#artifact_dropdown').offset().top - $('#concept_list_container').parent().offset().top + 38 + 'px');
                            }
                            $('.concept_descriptions a').add('.concept_descriptions').css('max-width', $('#concept_list').width() - 45 + 'px');
                            if ($('#concept_list_container').is(':visible') && $(window).width() < 767) {
                                $(window).scrollTop(0);
                            }

                            // for modality filters
                            var totalVisible, totalAvailable, extraModalities, extraModalitiesHTML;
                            $('#modality_filters_list').children('.modality_group').removeClass('hide');
                            $('.mdoalityfilterdropmenuwrap').addClass('hide').removeClass('dropdown_active');
                            totalVisible = Math.round($('#modality_filters_list').width() / $('#modality_filters_list').find('.modality_group:eq(0)').width());
                            totalAvailable = $('#modality_filters_list').children('.modality_group').length;
                            if (totalAvailable <= totalVisible) {
                                isResize = true;
                                return false;
                            }
                            totalVisible -= 2;
                            extraModalities = $('#modality_filters_list').children('.modality_group').eq(totalVisible).nextAll('.modality_group');
                            extraModalitiesHTML = '';
                            extraModalities.each(function () {
                                extraModalitiesHTML += this.outerHTML;
                            });
                            extraModalities.addClass('hide');
                            $('#more-concept-count').text(extraModalities.length);
                            $('#modality_extra_filter_list').empty().append(extraModalitiesHTML);
                            $('.mdoalityfilterdropmenuwrap').removeClass('hide').off('click.concept').on('click.concept', function () {
                                $(this).toggleClass('dropdown_active');
                            });
                            isResize = true;
                            resizeTimeout = 500; // is zero if triggered manually
                        }, resizeTimeout); // allow for resize to complete
                    }
                });
                resizeTimeout = 0;
                $('#modality_filters_list').children('.modality_group').addClass('hide');
                $(window).trigger('resize');
                $('.content-wrap').addClass('no-padding');
                $('.js-modality-label').each(function () {
                    if ($(this).text().match('All')) {
                        $(this).text('All');
                    }
                });
                $('.js-modality-icon').each(function () {
                    $(this).addClass(modalityUtil.getModalityIcon($(this).next().find('.js-modality-label').text()));
                });
                return this;
            }
        });

        ModalitiesView = Backbone.View.extend({
            'el': $('#modalities_container'),

            'modality_artifacts': null,
            'modality_groups': null,
            'modality_filters_view': null,
            'modality_assign_notification': null,
            'modality_grid_view': null,
            'selected_filter': null,

            'initialize': function (options) {
                var context = this;
                this.modality_data = options.modality_data;
                this.domain = this.modality_data.domain;
                this.modality_groups = new mod_models.ModalityGroups(options.modality_data.modality_groups);
                this.difficulty = this.modality_data.difficulty || '';
                this.by = this.modality_data.by || '';

                this.modality_filters_view = new ModalityFiltersView({
                    model: this.modality_groups
                });
                this.modality_filters_view.render();

                var referrer = "MODALITY";
                if(options.artifact.artifactType === "asmtpractice" || options.artifact.artifactType === "asmtquiz" ){
                    referrer = "PRACTICE_MODALITY";
                }

                var conceptNode = options.artifact.conceptNode ? options.artifact.conceptNode : options.artifact.domain.encodedID;
                this.modality_assign_notification = new QuickAssignmentNotificationView({
                   model: new QuickAssignmentNotificationModel(options.artifact.artifactID, conceptNode),
                   referrer : referrer
                });

                if (this.modality_data.artifacts && this.modality_data.artifacts.length) {
                    this.modality_artifacts = new ModalityArtifactCollection(this.modality_data.artifacts);
                } else {
                    this.modality_artifacts = new ModalityArtifactCollection(null, {
                        'concept_handle': this.domain.handle
                    });
                    this.modality_artifacts.bind('add', this.onModalityAdd, this);
                    this.modality_artifacts.fetch({
                        'data': {
                            'difficulty': this.difficulty,
                            'by': this.by
                        },
                        'remove': false,
                        'add': true,
                        'success': this.modalityFetchSuccess
                    });
                }
                this.modality_groups = new ModalityGroups(this.modality_data.modality_groups);

                this.modality_artifacts.each(function (artifact) {
                    context.addArtifact(artifact);
                });

                this.isotope();

                this.filter(this.modality_groups.at(0));

                $(window).off('resize.ModalitiesView').on('resize.ModalitiesView', function () {
                    context.refresh();
                });
                this.$('#modalities_list').isotope({
                    'sortBy': 'weight-student'
                });
                //difficulty levels tooltip.
                this.$el.off('click.difficulty').on('click.difficulty', '.level_tooltip', function () {
                    $(this).find('.tooltip-top_header').removeClass('hide');
                });
                this.$el.off('click.tooltip').on('click.tooltip', '.tooltip-top_header .btn_close', function () {
                    $(this).parent().parent().addClass('hide');
                    return false;
                });
                $($('.lnk_modality_filter').get(0)).addClass('selected');
            },
            'isotope': function () {
                var _this = this;
                this.$('#modalities_list').isotope({
                    'itemSelector': '.modality',
                    'layoutMode': 'masonry',
                    'masonry': {
                        'columnWidth': Math.floor((this.$('#modalities_list').width()) / 6)
                    },
                    'hiddenClass': 'hide',
                    'animationOptions': {
                        duration: 400,
                        easing: 'linear',
                        queue: false
                    },
                    'getSortData': {
                        'weight-teacher': function (elem) {
                            return $(elem).data('weight_teacher');
                        },
                        'weight-student': function (elem) {
                            return $(elem).data(_this.modality_data.use_weight);
                        },
                        'weight-popularity': function (elem) {
                            return $(elem).data('weight_popularity');
                        }
                    }
                });
            },
            'refresh': function () {
                this.$('#modalities_list').isotope('reLayout');
                this.modality_filters_view.render();
                //set active state for selected filter
                $('.lnk_modality_filter.selected').removeClass('selected');
                $('.lnk_modality_filter.group_' + this.selected_filter).addClass('selected');
            },
            'addArtifact': function (artifact) {
                var modalityArtifactView, ctx, size_points, el;
                ctx = this;
                size_points = 0;

                //set the modality box size
                if (artifact.get('artifactType') === 'lesson' && !ctx.largest_placed) {
                    artifact.set('size', 'xlarge');
                    ctx.largest_placed = true;
                }

                if (!artifact.get('size')) {
                    if (artifact.get('coverImageThumbLarge')) {
                        size_points += 1;
                    }
                    if (artifact.get('summary')) {
                        size_points += 1;
                        if (artifact.get('summary').length < 100) {
                            size_points -= 1;
                        }
                        if (artifact.get('summary').length > 200) {
                            size_points += 1;
                        }
                    }

                    switch (size_points) {
                    case 2:
                        artifact.set('size', ModalityArtifact.MODALITY_SIZE_LARGE);
                        break;
                    case 1:
                        artifact.set('size', ModalityArtifact.MODALITY_SIZE_MEDIUM);
                        break;
                    case 0:
                        artifact.set('size', ModalityArtifact.MODALITY_SIZE_SMALL);
                        break;
                    default:
                        artifact.set('size', ModalityArtifact.MODALITY_SIZE_SMALL);
                        break;
                    }
                }

                //render the modality box
                modalityArtifactView = new ModalityArtifactView({
                    'model': artifact
                });
                el = modalityArtifactView.render().el;
                this.$('#modalities_list').isotope('insert', $(el));
            },

            'filter': function (modality_group) {
                if (modality_group) {
                    var types, filter_selector, i, len;
                    this.selected_filter = modality_group.get('group_classname');
                    this.$('.js_selected_filter_label').text(modality_group.get('display_text'));
                    this.$('.js_selected_filter_count').text('(' + modality_group.get('count') + ')');
                    types = modality_group.get('artifact_types');
                    filter_selector = '';
                    for (i = 0, len = types.length; i < len; i += 1) {
                        if (types[i] === '__ALL__') {
                            break;
                        }
                        filter_selector += '.type_' + types[i] + ',';
                    }
                    this.$('#modalities_list').isotope({
                        'filter': filter_selector
                    });
                }
                //set active state for selected filter
                $('.lnk_modality_filter.selected').removeClass('selected');
                $('.lnk_modality_filter.group_' + this.selected_filter).addClass('selected');
            },

            'filter_by_name': function (modality_group_name) {
                var modality_group = this.modality_groups.find(
                    function (f) {
                        return f.get('group_classname') === modality_group_name;
                    });
                if (modality_group) {
                    this.filter(modality_group);
                    return true;
                }
                return false;
            },
            'onModalityAdd': function (item /*, collection, options*/ ) {
                if (item.get('modality_group')) {
                    this.addArtifact(item);
                }
            },
            'modalityFetchSuccess': function () {
                $('.js_loading').remove();
            }
        });


        ModalitiesRouter = Backbone.Router.extend({
            'modality_view': null,

            'routes': {
                '*path': 'filter'
            },

            'initialize': function (options) {
                this.modality_data = options.modality_data;
                this.modality_view = new ModalitiesView({
                    'modality_data': options.modality_data
                });
                this.current = 'all';
            },

            'filter': function (path) {
                var selected_type_label = null,
                    selected_level_label = null;
                //Bug 12712: Back button issue with concept page routes and IE.
                if (path === '') {
                    path = 'all';
                }
                /* If the filter is successful, update the visuals,
                 * otherwise reset the hash to the last thing that made
                 * sense. */
                if (this.modality_view.filter_by_name(path)) {
                    this.current = path;
                } else {
                    window.location.hash = this.current;
                }

                //update modality types dropdown
                //show previously hidden item
                $('.modality_types_list .hide').removeClass('hide');
                //hide the current selection from the list
                selected_type_label = $('.modality_types_list .' + this.current + ' a').html();
                if (!selected_type_label) {
                    selected_type_label = 'All Types (0)';
                }
                selected_level_label = this.modality_data.difficulty || 'All levels';
                $('.selected_modality_type').html(selected_type_label);
                $('#modality_breadcrumbs').html(_.template($('#tmpl_modality_filter_selection').html(), {
                    'selected_level': selected_level_label,
                    'selected_type': selected_type_label
                }, {
                    'variable': 'data'
                }));
            }
        });

        ModalityAddToLibraryView = Backbone.View.extend({
            'el': $('#add_to_library'),
            'events': {
                'click': 'addModality'
            },
            'initialize': function () {},
            'addModality': function () {
                if (!this.$el.hasClass('already_in_library') && !this.$el.hasClass('clickedForLibrary')) {
                    if (window.ck12_signed_in) {
                    	this.$el.addClass('clickedForLibrary');
                        var params = {
                            'objectID': js_modality_data.artifact.artifactRevisionID,
                            'objectType': 'artifactRevision'
                        };
                        $.ajax({
                            url: '/flx/add/mylib/object',
                            data: params,
                            cache: false,
                            dataType: 'json',
                            success: function (response) {
                                if (response.responseHeader.status === 0) {
                                    $('#add_to_library').addClass('already_in_library').attr('title', 'Already in Library');
                                    ModalView.alert('This resource has been added to your Library.');
                                } else {
                                    ModalView.alert('This resource is not added to your Library. Please try again later');
                                }
                                $('#add_to_library').removeClass('clickedForLibrary');
                            },
                            error: function () {
                                ModalView.alert('This resource is not added to your Library. Please try again later');
                                $('#add_to_library').removeClass('clickedForLibrary');
                            }
                        });
                    } else {
                        $.flxweb.alertToSignin();
                        return false;
                    }
                }
            }
        });

        ModalityDetailsView = Backbone.View.extend({
            'el': $('#modalities_container'),

            'events': {
                'click .js_block_toggle': 'block_toggle',
                'click .js_block_show': 'block_show',
            },

            'modality_groups': null,
            'artifact': null,
            'domain': null,
            'modality_filters_view': null,

            'block_toggle': function (e) {
                var target, toggle, container;
                target = e.currentTarget;
                toggle = $($(target).data('toggle'));
                container = $($(target).data('container'));

                toggle.find('.show').toggleClass('hide').end()
                    .find('.noshow').toggleClass('hide').end()
                    .find('.tip').toggleClass('up');

                if (container.is(':hidden')) {
                    container.slideDown('slow');
                } else {
                    container.hide('slow');
                }
            },
            'block_show': function (e) {
                var target, toggle, container, new_position;
                target = e.currentTarget;
                toggle = $($(target).data('toggle'));
                container = $($(target).data('container'));

                toggle.find('.show').addClass('hide').end()
                    .find('.noshow').removeClass('hide').end()
                    .find('.tip').addClass('up');
                container.slideDown('slow');
                new_position = toggle.offset();
                window.scrollTo(new_position.left, new_position.top);
            },
            'launchFullscreen': function (element) {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            },
            'scaleSimulation': function () {
                var scale;
                if ($('.interactive-sim-container').length) {
                    if ($('body').width() < 768) {
                        scale = $('body').width() / 1000 - 0.02;
                        $('.interactive-sim-container').find('iframe').css({
                            '-webkit-transform': 'scale(' + scale + ')',
                            '-ms-transform': 'scale(' + scale + ')',
                            'transform': 'scale(' + scale + ')'
                        });
                    } else if ($('body').width() > 767 && $('body').width() < 1024) {
                        $('.interactive-sim-container').find('iframe').css({
                            '-webkit-transform': 'scale(0.755)',
                            '-ms-transform': 'scale(0.755)',
                            'transform': 'scale(0.755)'
                        });
                    } else {
                        $('.interactive-sim-container').find('iframe').css({
                            '-webkit-transform': 'scale(0.99)',
                            '-ms-transform': 'scale(0.99)',
                            'transform': 'scale(0.99)'
                        });
                    }
                }
            },
            'verifyFullScreenSupport': function () {
                var $body = $('body')[0];
                if (!($body.requestFullscreen || $body.mozRequestFullScreen || $body.webkitRequestFullscreen || $body.msRequestFullscreen)) {
                    $('.js-view-fullscreen').parent().addClass('hide');
                }
            },
            'initializeShare': function () {
                var self = this,
                    regx = /http[s]{0,1}:\/\//g,
                    shareImageUrl = self.artifact.get('coverImageThumbLarge') || '/media/images/thumb_dflt_lesson_lg.png',
                    shareContext,
                    payload = {
                        artifactID: self.artifact.get('artifactID'),
                        memberID: ads_userid,
                        page: 'modality_details'
                    };
                if (!regx.test(shareImageUrl)) {
                    shareImageUrl = window.location.protocol + '//' + window.location.host + shareImageUrl;
                }
                shareContext = self.artifact.get('artifactType') === 'simulation' ? 'Share this Simulation' : 'Share this Resource';
                FooterView.initShare({
                    'shareImage': shareImageUrl,
                    'shareUrl': window.location.href,
                    'shareTitle': self.artifact.get('title'),
                    'context': shareContext,
                    'payload': payload,
                    '_ck12': true
                });
            },
           'initialize': function (options) {
                var active_modality, active_group, payload, referrer, context, $simContainer, self = this;
                
                //this.verifyFullScreenSupport();
                this.scaleSimulation();
                this.modality_groups = new mod_models.ModalityGroups(options.modality_groups);
                this.artifact = new Artifact(options.artifact);
                this.domain = options.domain;

                $('.js_local_date').each(function () {
                    this.innerHTML = date.getTimeInUserTimeZone($(this).data('date') || '');
                });

                //set active modality group
                active_modality = this.artifact.get('modality');
                active_group = this.modality_groups.find(function (group) {
                    var artifact_types = group.get('artifact_types');
                    if (_.contains(artifact_types, (active_modality)?active_modality.artifact_type:'')) {
                        return group;
                    }
                });
                if (active_group) {
                    active_group.set('active', true);
                }

                this.modality_filters_view = new ModalityFiltersView({
                    model: this.modality_groups
                });
                this.modality_filters_view.render();

                var referrer = "MODALITY";
                if(options.artifact.artifactType === "asmtpractice" || options.artifact.artifactType === "asmtquiz"){
                    referrer = "PRACTICE_MODALITY";
                }

                var conceptNode = options.artifact.conceptNode ? options.artifact.conceptNode : options.artifact.domain?options.artifact.domain.encodedID:null;
                this.modality_assign_notification = new QuickAssignmentNotificationView({
                   model: new QuickAssignmentNotificationModel(options.artifact.artifactID, conceptNode),
                   referrer : referrer
                });

                new ModalityConceptView();
                new ModalityAddToLibraryView();

                //Share div
                //(toggle the share div when the group share dialog opens/closes)
                $(document).off('flxweb.share.view.open').on('flxweb.share.view.open', function () {
                    $('#shareDiv').removeClass('dropdown').css({
                        'overflow': 'visible'
                    });
                });

                $(document).off('flxweb.share.view.close').on('flxweb.share.view.close', function () {
                    $('#shareDiv').addClass('dropdown').css({
                        'overflow': 'hidden'
                    });
                });
                
                $(document).off('click.closeMore').on('click.closeMore', function(e){
                	if(!($(e.target).hasClass('mdoalityfilterdropmenuwrap') || $(e.target).parents('li:first').hasClass('mdoalityfilterdropmenuwrap'))){
                        $('.mdoalityfilterdropmenuwrap').removeClass('dropdown_active');
                    }
                });
                
                //Group Sharing
                $('.js-shareGroupLink').each(function () {
                    new ShareViews.GroupsShareView({
                        link: $(this),
                        objectID: $(this).data('artifactid')
                    });
                });

                //ADS logging
                payload = {};
                payload.artifactID = this.artifact.get('artifactID');
                payload.memberID = window.ads_userid;
                payload.context_eid = this.domain.encodedID;
                payload.modality_type = this.artifact.get('artifactType');
                payload.user_role = flxweb_role;
                referrer = $.flxweb.queryParam('referrer');
                if (referrer) {
                    payload.referrer = $.flxweb.queryParam('referrer');
                }
                if (window.js_collection_data && window.js_collection_data.collection && window.js_collection_data.collection.descendantCollection) {
                    payload.collectionHandle = window.js_collection_data.collection.handle;
                    payload.conceptCollectionAbsoluteHandle = window.js_collection_data.collection.descendantCollection.absoluteHandle;
                    payload.collectionCreatorID = window.js_collection_data.collection.creatorID;
                }
                $.flxweb.logADS('fbs_modality', payload);


                //$.flxweb.logADS(
                //  'modality','visited',1,
                //[this.artifact.get('artifactID'),this.artifact.get('artifactRevisionID'),window.ads_userid],
                //[this.artifact.get('artifactType'), this.domain.encodedID, window.flxweb_role]
                //);
                if ($('.interactive-sim-container').length) {
                    if ($('#maintenanceWrapper').length) {
                        $('#maintenanceWrapper').after($('.interactive-sim-container'));
                    } else {
                        $('body').find('.header-space').after($('.interactive-sim-container'));
                    }
                    $('.content-wrap').addClass('hide');
                    $simContainer = $('.interactive-sim');
                    $simContainer.css('height', $simContainer.find('iframe:first-of-type')[0].getBoundingClientRect().height);
                    context = this;
                    $('body').off('click.interactive').on('click.interactive', '.js-close-fullscreen', function () {
                        $('.interactive-sim-container').remove();
                        if ($('.group_simulations').length) {
                            window.location.href = $('.group_simulations').prop('href');
                        } else {
                            window.location.href = $('.group_mind_map').prop('href');
                        }
                    });
                    /*$('body').off('click.fullscreen').on('click.fullscreen', '.js-view-fullscreen', function() {
                        context.launchFullscreen($('.interactive-sim-container').find('iframe')[0]);
                    });*/
                    $('.js-view-fullscreen').attr('href', $('.interactive-sim-container').find('iframe').attr('src'));
                    $(window).off('resize.sim').on('resize.sim', function () {
                        var iframeHeight;
                        context.scaleSimulation();
                        iframeHeight = $simContainer.find('iframe:first-of-type')[0].getBoundingClientRect().height;
                        $simContainer.css('height', iframeHeight);
                    });
                }
                this.initializeShare();
            }
        });
      
        return {
            ModalityArtifactView: ModalityArtifactView,
            ModalityGroupView: ModalityGroupView,
            ModalityFiltersView: ModalityFiltersView,
            ModalitiesView: ModalitiesView,
            ModalitiesRouter: ModalitiesRouter,
            ModalityDetailsView: ModalityDetailsView,
            ModalityConceptView: ModalityConceptView
        };

    });
