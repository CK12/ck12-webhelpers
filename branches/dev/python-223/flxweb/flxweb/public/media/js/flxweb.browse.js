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
 * This file originally written by Ravi Gidwani
 *
 * $Id$
 */
define(['jquery', 'common/views/footer.view', 'common/utils/utils', 'ltiBridge', 'jquery-ui', 'jquery.isotope'],
    function ($, FooterView, util, ltiBridge) {
        'use strict';

        function initLayout() {
            if (typeof $('.js_browse_section').isotope === "function") {
                $('.js_browse_section').isotope({
                    itemSelector: '.browsetitles',
                    layoutMode: 'masonry',
                    transformsEnabled: false
                },
                function () {
                    this.removeClass('hide');
                });
            }
        }

        function reLayout() {
            if (typeof $('.js_browse_section').isotope === "function") {
                $('.js_browse_section').isotope('reLayout');
            }
        }

        function showCbseBanner() {
            util.getLocation().done(function(data){
                if (data.country_long === 'india') {
                    $('.show-for-india').removeClass('hide-important');
                }
            });
        }

        function displayMiddleSchoolSubjects() {
            if ($('.js_mshs_tab[data-show="ms"]').hasClass('hide-important')) {
                $('.ms-drop').addClass('hide');
                $('.hs-drop').removeClass('hide');
                $('.js_mshs_tab[data-show="hs"]').addClass('active').siblings().removeClass('active');
                $('.mshs-browse').children().addClass('hide');
                $('.mshs-browse').children('[data-mshs = hs]').removeClass('hide');
                $('.mshs-browse').children('[data-mshs = both]').removeClass('hide');
                $('#no-flexbooks').addClass('hide');
                if (!($("#spanish_books").find(".mshs-browse").children('[data-mshs="hs"]').length || $("#spanish_books").find(".mshs-browse").children('[data-mshs="both"]').length)) {
                    $('.js-spanish-heading-wrapper').addClass('hide');
                } else {
                    $('.js-spanish-heading-wrapper').removeClass('hide');
                }
            } else {
                $('.ms-drop').removeClass('hide');
                $('.hs-drop').addClass('hide');
                $('.js_mshs_tab[data-show="ms"]').addClass('active').siblings().removeClass('active');
                $('.mshs-browse').children().addClass('hide');
                $('.mshs-browse').children('[data-mshs = ms]').removeClass('hide');
                $('.mshs-browse').children('[data-mshs = both]').removeClass('hide');
                $('#no-flexbooks').addClass('hide');
                if (!($("#spanish_books").find(".mshs-browse").children('[data-mshs="ms"]').length || $("#spanish_books").find(".mshs-browse").children('[data-mshs="both"]').length)) {
                    $('.js-spanish-heading-wrapper').addClass('hide');
                } else {
                    $('.js-spanish-heading-wrapper').removeClass('hide');
                }
            }
        }
        
        function checkLevel3Concepts(callback){
        	$('#concept-list-container .level-3-concept-container .level3-list').each(function(index){
                var $this = $(this);
                if($.trim($this.html()) == ""){
                	$this.closest('.level-3-concept-container').remove();
                }
            });
        	checkLevel2Concepts();
        }

        function checkLevel2Concepts(){
        	$('#concept-list-container .level-2-concept-container.level2_parent').each(function(index){
                var $this = $(this);
                if($this.find('.level-3-concept-container').length == 0){
                	$this.remove();
                }
            });
        	checkLevel1Concepts();
        }
        
        function checkLevel1Concepts(){
        	$('#concept-list-container .concept-container').each(function(index){
                var $this = $(this);
                if($this.find('.level-2-concept-container').length == 0){
                	$this.remove();
                }
            });
        }

        function browse_domReady() {
            initLayout();
            showCbseBanner();
            $(window).resize(reLayout);
            if(window.location.href.indexOf('toggle')!=-1 && window.location.href.indexOf('physics')!=-1) {
            	$('.expand-all').addClass('expand-all-bottom');
            	$('.list-concepts').addClass('list-concepts-bottom');
            }
            
            checkLevel3Concepts();
            
            $('#level-help-ms, #level-help-hs').off('click.level-help').on('click.level-help', function () {
                $('#level-tooltip-container').toggleClass('hide');
            });
            $('.level-tooltip-close').off('click.tooltip-close').on('click.tooltip-close', function () {
                $('#level-tooltip-container').addClass('hide');
            });
            $('.js-announce').off('click.announce').on('click.announce', function (e) {
		// Open these modalities in a new window
		var _href = $(this).data('target');
		if (window.lmsContext === 'lti-app' && /simulationint|plix/.test(_href) !== -1){
		    e.preventDefault();
		    // For simulations add query-param lmsContext=true
		    if (e.currentTarget.hasAttribute('class','js-mtype-simulation')) {
		        _href = _href + "&lmsContext=true";
		    }
		    var other_window = window.open(_href,'lms-context-ref');
		    // List for postmessage from other window
		    // to receive info needed to create the assignment
		    // for lms using bridge 
		    try {
			window.addEventListener('message', function(event) {
			    console.log("Received post message");
			    if (event.origin !== window.origin && event.origin.slice(-8) !== window.origin.slice(-8)) {
				    return;
			    }
			    var LTIBridge = new ltiBridge();
			    LTIBridge.onAssignAction(JSON.parse(event.data));
			    other_window.close();
			});
		    } catch(e) {
			console.log("Error on create assignment via postmessage:" + String(e));
		    }
		} else {
		    window.location = $(this).data('target');
		    return false;
		}
            });

            $('.level-1-concept').off('click.conceptslist').on('click.conceptslist', function () {
            	var $this = $(this),
            	    imageArrow = $this.find('i');
            	$this.toggleClass('hide-child-concepts show-child-concepts');
            	$this.siblings('.show-lists').toggleClass('indent-concepts');
            	if($this.siblings('.show-lists').hasClass('indent-concepts')) {
            		if($('#concept-list-container .hide-child-concepts').length == 0){
            			$('.expand-all').html('<i class="icon-minus expand-icon"></i>Collapse All');
            		}
            		$this.siblings('.show-lists').slideDown(250);
            	} else {
            		$this.siblings('.show-lists').slideUp(250);
            		if($('#concept-list-container .show-child-concepts').length == 0){
            			$(".expand-all").html('<i class="icon-plus expand-icon"></i>Expand All');
            		}
            	}
            	$this.toggleClass('clicked');
            });
            
            
            $('.level-2-concept-container.level2_parent .level-2-concept-name').off('click.showLevel2').on('click.showLevel2', function () {
            	var $this = $(this),
            	    level2_list = $this.siblings('.level2-list');
            	$this.toggleClass('hide-child-concepts show-child-concepts');
            	level2_list.toggleClass('indent-concepts');
            	$this.toggleClass('clicked');
            	if(level2_list.hasClass('indent-concepts')) {
            		$this.closest('.level-2-concept-container').addClass('level2-list-visible');
            		if($('#concept-list-container .hide-child-concepts').length == 0){
            			$('.expand-all').html('<i class="icon-minus expand-icon"></i>Collapse All');
            		}
            		level2_list.slideDown(250);
            	} else {
            		$this.closest('.level-2-concept-container').removeClass('level2-list-visible');
            		level2_list.slideUp(250);
            	}
            });
            
            $('.level-3-concept-container.l3hasChild .level-two-title').off('click.showLevel3').on('click.showLevel3', function (e) {
            	var $this = $(this),
            	    level3_list = $this.siblings('.level3-list');
            	$this.toggleClass('hide-child-concepts show-child-concepts');
            	$this.toggleClass('clicked');
            	level3_list.toggleClass('indent-concepts');
            	if(level3_list.hasClass('indent-concepts')) {
            		level3_list.addClass('level3-list-visible');
            		if($('#concept-list-container .hide-child-concepts').length == 0){
            			$('.expand-all').html('<i class="icon-minus expand-icon"></i>Collapse All');
            		}
            		level3_list.slideDown(250);
            	} else {
            		level3_list.removeClass('level3-list-visible');
            		level3_list.slideUp(250);
            	}
            	e.stopPropagation();
            });
                       
            $('#expand-all-concepts').off('click.expand-all').on('click.expand-all', function () {
            	var i, level2_list,
            	    text = $(this).html(),
                    level2_concepts = $('#concept-list-outer-container').find('.hide-l2-concepts'),
                    level2_parents = $('.level-2-concept-container.level2_parent'),
                    level3_parents = $('.level-3-concept-container.l3hasChild');
            	if(text.indexOf('Expand All') != -1){
            		$('.expand-all').html('<i class="icon-minus expand-icon"></i>Collapse All');
            		$('.level-1-concept').removeClass('hide-child-concepts').addClass('show-child-concepts clicked');
                	level2_concepts.addClass('indent-concepts').slideDown(1000);
            		for(i=0;i<level2_parents.length;i++){
            			level2_list = $(level2_parents[i]).find('.level2-list');
            			if(!level2_list.hasClass('indent-concepts')){
            				$(level2_parents[i]).addClass('level2-list-visible').find('.level-2-concept-name').addClass('show-child-concepts clicked').removeClass('hide-child-concepts');
            				level2_list.addClass('indent-concepts').slideDown(2000);
            			}
            		}
            		for(i=0;i<level3_parents.length;i++){
            			var level3_list = $(level3_parents[i]).find('.level3-list')
            			if(!level3_list.hasClass('indent-concepts')){
            				$(level3_parents[i]).find('.level-two-title').addClass('show-child-concepts clicked').removeClass('hide-child-concepts');
            				level3_list.addClass('indent-concepts level3-list-visible').slideDown(3000);
            			}
            		}
            		
            	}
            	else {
           		    $(".expand-all").html('<i class="icon-plus expand-icon"></i>Expand All');
           		    $('.level-1-concept').addClass('hide-child-concepts').removeClass('show-child-concepts clicked');
           		    level2_concepts.removeClass('indent-concepts').slideUp(250);
                	for(i=0;i<level2_parents.length;i++){
            			level2_list = $(level2_parents[i]).find('.level2-list');
            			if(level2_list.hasClass('indent-concepts')){
            				$(level2_parents[i]).removeClass('level2-list-visible').find('.level-2-concept-name').removeClass('show-child-concepts clicked').addClass('hide-child-concepts');
            				level2_list.removeClass('indent-concepts').slideUp(250);
            			}
            		}
                	for(i=0;i<level3_parents.length;i++){
            			var level3_list = $(level3_parents[i]).find('.level3-list')
            			if(level3_list.hasClass('indent-concepts')){
            				$(level3_parents[i]).find('.level-two-title').removeClass('show-child-concepts clicked').addClass('hide-child-concepts');
                    		level3_list.removeClass('indent-concepts level3-list-visible').slideUp(250);
            			}
            		}
            	}
            });
            
            if(window.location.hash === '#view_books') {
                $('.browsebuttonswrap').addClass('hide-important');
            } else {
                $('.browsebuttonswrap').removeClass('hide-important');
            }

            function filterDropdown(tabval, othertab) {
                $('.mshs-browse').children('[data-level = None]').addClass('hide');
                $('#grade-filter-dropdown-' + tabval).children('[data-difficulty = "all levels"]').addClass('hide');
                if ($('.mshs-browse').children('[data-mshs =' + tabval + ']').length || $('.mshs-browse').children('[data-mshs = both]').length) {
                    var currentlevel, droplevel,
                        dropdownOptions = $('#grade-filter-dropdown-' + tabval).find('li');
                    for (droplevel = 0; droplevel < dropdownOptions.length; droplevel++) {
                        currentlevel = $(dropdownOptions[droplevel]).data('difficulty');
                        if (currentlevel !== 'all levels' && $('.mshs-browse').children('[data-mshs =' + tabval + '][data-level = "' + currentlevel + '"]').length === 0 && $('.mshs-browse').children('[data-mshs = both][data-level = "' + currentlevel + '"]').length === 0) {
                            $(dropdownOptions[droplevel]).addClass('hide');
                        }
                    }
                    if ($(dropdownOptions).not('.hide').length === 1) {
                        $('.' + tabval + '-drop .grade-filter-label').html($(dropdownOptions).not('.hide').text());
                        $('.' + tabval + '-drop .grade-filter-label').attr('data-level', $(dropdownOptions).not('.hide').text());
                    }
                } else {
                    $('.mshs-tabs-container').children('[data-show = ' + tabval + ']').addClass('hide-important');
                    $('.mshs-tabs-container').children('[data-show = ' + othertab + ']').addClass('full-width active');
                    $('.mshs-browse').find('[data-mshs =' + othertab + ']').removeClass('hide');
                    $('.' + tabval + '-drop').addClass('hide');
                    $('.' + othertab + '-drop').removeClass('hide');
                }
            }
            filterDropdown('ms', 'hs');
            filterDropdown('hs', 'ms');

            $('#browse_tabs').tabs({
                'cookie': {
                    name: 'browser-tab',
                    expires: 1
                },
                'create': function () {
                    $('#browse_tabs').find('ul').removeClass('hide');
                    $('#browse_tabs').find('.contentarea').removeClass('hide');
                    //select which tab to focus based on the counts
                    var bCookie = $.cookie('browser-tab');
                    $('#browse_tabs .ui-tabs-nav a').each(function (index) {
                        var count = $(this).data('count');
                        if (count > 0 && bCookie === '0') {
                            $('#browse_tabs').tabs('option', 'selected', index);
                            return false;
                        }
                    });
                    reLayout();
                    setTimeout(function () {
                        if (window.location.hash === '#view_books' && location.href.indexOf('lang=spanish') !== -1) {
                            $("[data-lang='spanish']").trigger('click');
                        }
                    }, 200);
                },
                'activate': function () {
                    reLayout();
                    if (!$("#spanish_books").find(".mshs-browse").children(':visible').length) {
                        $('.js-spanish-heading-wrapper').addClass('hide');
                    } else {
                        $('.js-spanish-heading-wrapper').removeClass('hide');
                    }
                }
            });
            if ($('.browseheader').find('.branch-name').attr('data-title').split('/')[0].trim() === 'Math') {
                $('.js_mshs_tab').off('click.mshstab').on('click.mshstab', function () {
                    $('.' + $(this).data('show') + '-drop').removeClass('hide');
                    $('.' + $(this).data('hide') + '-drop').addClass('hide');
                    var gradeLevel = $('.grade-filter-label:visible').attr('data-level');
                    if (gradeLevel) {
                        gradeLevel = gradeLevel.toLowerCase();
                    } else {
                        gradeLevel = 'all levels';
                    }
                    $(this).addClass('active').siblings().removeClass('active');
                    $('.mshs-browse').children().addClass('hide');
                    if (gradeLevel === 'all levels') {
                        $('.mshs-browse').children('[data-mshs= ' + $(this).data('show') + ']').removeClass('hide');
                        $('.mshs-browse').children('[data-mshs =both]').removeClass('hide');
                    } else {
                        $('.mshs-browse').children('[data-mshs= ' + $(this).data('show') + '][data-level ="' + gradeLevel + '"]').removeClass('hide');
                        $('.mshs-browse').children('[data-mshs= both][data-level ="' + gradeLevel + '"]').removeClass('hide');
                    }
                    if (!$('.mshs-browse').children(':visible').length) {
                        $('#no-flexbooks').removeClass('hide');
                    } else {
                        $('#no-flexbooks').addClass('hide');
                    }
                    if (!$("#spanish_books").find(".mshs-browse").children(':visible').length) {
                        $('.js-spanish-heading-wrapper').addClass('hide');
                    } else {
                        $('.js-spanish-heading-wrapper').removeClass('hide');
                    }
                });
                $('.grade-filter-dropdown').find('li').off('click.gradeFilter').on('click.gradeFilter', function () {
                    console.log("!!");
                    if ($('.grade-filter-dropdown.open').find('li').not('.hide').length > 1) {
                        $('#no-flexbooks').addClass('hide');
                        var level, selectedTab, previousSelection;
                        level = $(this).data('difficulty');
                        selectedTab = $('.mshs-tabs-container').find('.js_mshs_tab.active').data('show');
                        previousSelection = $('.grades-drop-container').find('div.grade-filter-container[data-dropdown = "grade-filter-dropdown-' + selectedTab + '"]').find('.grade-filter-label').attr('data-level').toLowerCase();
                        $(this).parent().find('li[data-difficulty = "' + previousSelection + '"]').removeClass('hide');
                        $(this).addClass('hide');
                        $('.mshs-browse').children('[data-mshs =' + selectedTab + ']').addClass('hide');
                        $('.mshs-browse').children('[data-mshs =both]').addClass('hide');
                        if (level === 'all levels') {
                            $('.mshs-browse').children('[data-mshs =' + selectedTab + ']').removeClass('hide');
                            $('.mshs-browse').children('[data-mshs =both]').removeClass('hide');
                        } else {
                            $('.mshs-browse').children('[data-mshs =' + selectedTab + '][data-level ="' + level + '"]').removeClass('hide');
                            $('.mshs-browse').children('[data-mshs = both][data-level ="' + level + '"]').removeClass('hide');
                        }
                        $('.grade-filter-label:visible').html($(this).children().attr('data-title'));
                        $('.grade-filter-label:visible').attr('data-level',$(this).children().attr('data-title'));
                        $(this).addClass('hide');
                        $('.grade-filter-dropdown').css({
                            'top': '111px',
                            'left': '-99999px'
                        });
                        $('.grade-filter-dropdown').removeClass('open');
                        if (!$('.mshs-browse').children(':visible').length) {
                            $('#no-flexbooks').removeClass('hide');
                        } else {
                            $('#no-flexbooks').addClass('hide');
                        }
                        if (!$("#spanish_books").find(".mshs-browse").children(':visible').length) {
                            $('.js-spanish-heading-wrapper').addClass('hide');
                        } else {
                            $('.js-spanish-heading-wrapper').removeClass('hide');
                        }
                    } else {
                        $('.grade-filter-dropdown').css({
                            'top': '111px',
                            'left': '-99999px'
                        });
                        $('.grade-filter-dropdown').removeClass('open');
                    }
                });
            }

            //language filter dropdown. Can be on science and math
            $('.language-filter-dropdown').find('li').off('click.languageFilter').on('click.languageFilter', function () {
                var language;
                $('#no-flexbooks').addClass('hide');
                language = $(this).data('lang');
                $('.language-filter-label').html($(this).children().html());
                $('.language-filter-dropdown').css({
                    'top': '111px',
                    'left': '-99999px'
                }).removeClass('open');
                $('.js-language-filter-level').removeClass('hide');
                $(this).addClass('hide');
                if (language === 'spanish') {
                    $('.spanish-books-wrapper').removeClass('hide');
                    $('.non-spanish-books-wrapper').addClass('hide');
                } else if (language === 'english') {
                    $('.spanish-books-wrapper').addClass('hide');
                    $('.non-spanish-books-wrapper').removeClass('hide');
                } else {
                    $('.spanish-books-wrapper').removeClass('hide');
                    $('.non-spanish-books-wrapper').removeClass('hide');
                }
                if (!$("#spanish_books").find(".mshs-browse").children(':visible').length) {
                    $('.js-spanish-heading-wrapper').addClass('hide');
                } else {
                    $('.js-spanish-heading-wrapper').removeClass('hide');
                }
                if (!$('.browsetitles:visible').length) {
                    $('#no-flexbooks').removeClass('hide');
                }
            });



            if (location.href.indexOf('tab=hs') !== -1) {
                $('[data-show="hs"]').trigger('click');
            }

            $.cookie('browseview', 'listview', {
                path: '/',
                expires: 365
            });
            $('.browse-buttons button').click(function (ev) {
                var view = $(ev.currentTarget).data('view');
                if (view) {
                    window.location.href = view;
                }
            });
            $('body').on('notificationClose', reLayout);
            $('body').off('click.tooltip').on('click.tooltip', function (e) {
                if (!($(e.target).parents('.language-tooltip-container').length || $(e.target).parents('.language-help').length)) {
                    $('.language-tooltip-container').addClass('hide');
                }
                if (!($(e.target).parents('.level-tooltip-container').length || $(e.target).parents('.level-help').length)) {
                    $('.level-tooltip-container').addClass('hide');
                }
            });
            $('.js-browse-tab').off('click.browse').on('click.browse', function() {
                if($(this).hasClass('tabs-concept')) {
                    $('.browsebuttonswrap').removeClass('hide-important');
                } else {
                    $('.browsebuttonswrap').addClass('hide-important');
                }
            });
            setTimeout(function () {
                window.scrollTo(0, 1);
            }, 50);
            initializeShare();
            document.addEventListener('shareClose', function (e) {
                window.setTimeout(function(){
                    reLayout();
                }, 100);
            });
            if ($('.browseheader').find('.branch-name').attr('data-title').split('/')[0].trim() === 'Math') {
                displayMiddleSchoolSubjects();
            }
        }
        function initializeShare() {
            var branchName = $('.branch-name').data('branch'),
                shareImageUrl = '/media/images/branch_images/' + branchName.toLowerCase().replace(/\s/g, '-').replace(/\./g, '') + '.png',
                payload = {
                    memberID : ads_userid,
                    page : 'browse'
                };
            shareImageUrl = window.location.protocol + '//' + window.location.host + shareImageUrl;
            FooterView.initShare({
                'shareImage': shareImageUrl,
                'shareUrl': window.location.href,
                'shareTitle': branchName,
                'context': 'Share this Subject',
                'payload': payload,
                '_ck12': true
            });
        }

        return {
            'init': browse_domReady
        };

    });
