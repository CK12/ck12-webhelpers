define(['jquery', 'underscore', 'backbone', 'standard/templates/standard.templates', 'hammer'],
    function ($, _, Backbone, TMPL) {
        'use strict';

        function standardView(controller) {

            var standardType, listIndex, standardsCount = 0,
                standardSetView, standardDetailView, standardMainView, standardListView, standardDetailViewMobile, renderNodes = true;

            standardDetailView = Backbone.View.extend({
                'events': {
                    //'click .js_concept_link': 'showNewspaper'
                },
                'initialize': function () {
                    if (this.model.hasOwnProperty('children') && this.model.children instanceof Array) {
                        var index, children, html = '';
                        this.$el.before(standardDetailView.titleTemplate(this.model));
                        children = this.model.children || '';
                        if (children instanceof Array && 'Cluster' === children[0].sourceLevel) {
                            children = children[0].children || '';
                        }
                        for (index = 0; index < children.length; index++) {
                            html += standardDetailView.detailTemplate({
                                'model': children[index],
                                'view': 'large'
                            });
                        }
                        this.$el.html(html);
                    }
                },
                'convertToSlug': function (text) {
                    return text
                        .toLowerCase()
                        .replace(/ +/g, '-');
                },
                'showNewspaper': function (e) {
                    var This, handle, branchHandle;
                    This = $(e.currentTarget);
                    handle = This.attr('data-handle');
                    branchHandle = this.convertToSlug(This.attr('data-branchHandle'));
                    if (!branchHandle || !handle) {
                        return;
                    }
                    controller.showNewsPaper('/embed/#module=concept&amp;handle=' + handle + '&amp;branch=' + branchHandle + '&amp;nochrome=true');
                }
            }, {
                'detailTemplate': _.template(TMPL.domainDetails, null, {
                    'variable': 'data'
                }),
                'titleTemplate': _.template(TMPL.domainDetailTitle, null, {
                    'variable': 'data'
                })
            });

            standardDetailViewMobile = Backbone.View.extend({
                'events': {
                    //'click .js_concept_link': 'showNewspaper'
                },
                'initialize': function () {
                    if (this.model.hasOwnProperty('children') && this.model.children instanceof Array) {
                        var index, children, html = this.$el.html() || '';
                        children = this.model.children || '';
                        if (children instanceof Array && 'Cluster' === children[0].sourceLevel) {
                            children = children[0].children || '';
                        }
                        for (index = 0; index < children.length; index++) {
                            html += '<div class="left mobile-standards-individual-page js-mobile-standards-individual-page">';
                            html += standardDetailViewMobile.titleTemplate(this.model);
                            html += standardDetailViewMobile.detailTemplate({
                                'model': children[index],
                                'view': 'small'
                            });
                            html += '</div>';
                            standardsCount++;
                        }
                        this.$el.html(html);
                    }
                },
                'showNewspaper': function (e) {
                    var This, handle, branchHandle;
                    This = $(e.currentTarget);
                    handle = This.attr('data-handle');
                    branchHandle = This.attr('data-branchHandle');
                    if (!branchHandle || !handle) {
                        return;
                    }
                    window.location = '/' + branchHandle + '/' + handle;
                }
            }, {
                'detailTemplate': _.template(TMPL.domainDetails, null, {
                    'variable': 'data'
                }),
                'titleTemplate': _.template(TMPL.domainDetailTitle, null, {
                    'variable': 'data'
                })
            });

            standardListView = Backbone.View.extend({
                'isSwipe': false,
                'events': {
                    'click .js_domain_list': 'loadDetails',
                    'click .js_node_nav': 'navigateNode'
                },
                'initialize': function () {
                    if (this.model) {
                        this.$el.eq(0).append(standardListView.titleTemplate({
                            'model': this.model,
                            'view': 'large'
                        }));
                        this.$el.eq(1).append(standardListView.titleTemplate({
                            'model': this.model,
                            'view': 'small'
                        }));
                        if (this.model.hasOwnProperty('children') && this.model.children instanceof Array) {
                            var index, url, html = '',
                                htmlForMobile = '';
                            url = encodeURIComponent($('#sets').find('.selected-set').children(':eq(0)').text().trim().replace(/\s/g, '-'));
                            for (index = 0; index < this.model.children.length; index++) {
                                html += standardListView.listTemplate({
                                    'model': this.model.children[index],
                                    'isCurrentNode': listIndex === index,
                                    'view': 'large',
                                    'url': '/' + standardType.toLowerCase() + '/' + url.toLowerCase() + '/'
                                });
                                htmlForMobile += standardListView.listTemplate({
                                    'model': this.model.children[index],
                                    'isCurrentNode': listIndex === index,
                                    'view': 'small',
                                    'url': '/' + standardType.toLowerCase() + '/' + url.toLowerCase() + '/'
                                });
                                new standardDetailViewMobile({
                                    'model': this.model.children[index],
                                    'el': $('#mobile-standard-details')
                                });
                            }
                            $('#mobile-standard-details').css({
                                'width': (standardsCount * 100) + '%'
                            });
                            $('.js-mobile-standards-individual-page').css({
                                'width': (100 / standardsCount) + '%'
                            });
                            this.bindEventsForMobile();
                            this.$el.eq(0).append(html);
                            this.$el.eq(1).append(htmlForMobile);
                            $('.sets-wrapper .list-item').next('ul').hide();
                            $('.sets-wrapper .list-item.selected-node').next('ul').show();
                            new standardDetailView({
                                'model': this.model.children[listIndex],
                                'el': $('#standard-details')
                            });
                            bindEventsForLeftMenu();
                        }
                    }
                    this.updateURLandTitle();
                },
                'bindEventsForMobile': function () {
                    var drag, self = this;

                    Hammer('.js-mobile-standards-individual-page').off('dragleft.drag').on('dragleft.drag', function () {
                        drag = 'left';
                        //swipeLeft();
                    });

                    Hammer('.js-mobile-standards-individual-page').off('dragright.drag').on('dragright.drag', function () {
                        drag = 'right';
                        //swipeRight();
                    });

                    Hammer('.js-mobile-standards-individual-page').off('release.drag').on('release.drag', function () {
                        if (drag === 'left') {
                            self.swipeLeft(this);
                            self.checkForDomain($(this).children(':eq(1)')[0].id, 'left');
                        } else if (drag === 'right') {
                            self.swipeRight(this);
                            self.checkForDomain($(this).children(':eq(1)')[0].id, 'right');
                        }
                        drag = undefined;
                    });
                },
                'checkForDomain': function (id, drag) {
                    id = id.replace('small', 'large');
                    if ('left' === drag && $('#' + id).index() === $('#' + id).siblings().length) {
                        this.isSwipe = true;
                        id = id.replace(/__/g, '_');
                        $('#' + id).parents('li').next().children(':eq(0)').trigger('click');
                    } else if ('right' === drag && 0 === $('#' + id).index()) {
                        this.isSwipe = true;
                        id = id.replace(/__/g, '_');
                        $('#' + id).parents('li').prev().children(':eq(0)').trigger('click');
                    }
                },
                'swipeLeft': function (context) {
                    var index, size;
                    index = $(context).index();
                    size = $('#mobile-standard-details .js-mobile-standards-individual-page').length;
                    if (index < (size - 1)) {
                        $('#mobile-standard-details').css({
                            'left': -((index + 1) * 100) + '%',
                            'height': $('.js-mobile-standards-individual-page:nth-child(' + (index + 2) + ')').height() + 'px'
                        });
                    }
                },
                'swipeRight': function (context) {
                    var index = $(context).index();
                    if (index > 0) {
                        $('#mobile-standard-details').css({
                            'left': -((index - 1) * 100) + '%',
                            'height': $('.js-mobile-standards-individual-page:nth-child(' + index + ')').height() + 'px'
                        });
                    }
                },
                'loadDetails': function (e) {
                    var This = $(e.currentTarget);
                    if (This.hasClass('selected-node')) {
                        return false;
                    }
                    if ($('#side-reveal-icon').is(':visible')) {
                        $('[data-id="' + This.attr('data-id') + '"]').addClass('selected-node').next().show().parent().addClass('selected-node-wrapper').siblings('.selected-node-wrapper').removeClass('selected-node-wrapper').children('.selected-node').removeClass('selected-node').next().hide();
                    } else {
                        $('[data-id="' + This.attr('data-id') + '"]').addClass('selected-node').next().show('slow').parent().addClass('selected-node-wrapper').siblings('.selected-node-wrapper').removeClass('selected-node-wrapper').children('.selected-node').removeClass('selected-node').next().hide('slow');
                    }
                    if (!this.isSwipe) {
                        $('.js-mobile-standards-details').addClass('hide-important');
                        $('.js-mobile-sets-container').removeClass('hide-important');
                    }
                    this.isSwipe = false;
                    listIndex = This.parent().index() - 1;
                    $('#standard-details').prev().remove();
                    new standardDetailView({
                        'model': this.model.children[listIndex],
                        'el': $('#standard-details')
                    });
                    this.updateURLandTitle(This);
                    window.scrollTo(0, 40);
                    return false;
                },
                'navigateNode': function (e) {
                    var This = e.currentTarget.id.split('_');
                    This.pop();
                    This = This.join('__');
                    if (!$('#' + This + '__large').length) {
                        this.isSwipe = true;
                        $(e.currentTarget).parent().prev().trigger('click');
                    }
                    This = $('#' + This + '__large');
                    $("html, body").animate({ scrollTop: This.offset().top - 120 + 'px' });
                },
                'updateURLandTitle': function (This) {
                    This = This || $('#sets').find('.selected-node');
                    var set, type;
                    set = $('#sets').find('.selected-set').children(':eq(0)').text().trim();
                    type = 'ccss' === standardType.toLowerCase() ? 'Common Core Math' : 'Next Generation Science Standards';
                    document.title = This.text().trim() + ' | ' + set + ' | ' + type + ' | CK-12 Foundation';
                    $('.page-title').text(set);
                    controller.updateURL(This.find('a').attr('href'));
                }
            }, {
                'listTemplate': _.template(TMPL.domainList, null, {
                    'variable': 'data'
                }),
                'titleTemplate': _.template(TMPL.domainTitle, null, {
                    'variable': 'data'
                })
            });

            standardMainView = Backbone.View.extend({
                'renderNodes': function (nodesCollection, setsCollection) {
                    try {
                        var nodesModel, currentIndex;
                        nodesModel = nodesCollection.at(0).toJSON();
                        if (nodesModel.hasOwnProperty('response') && !(nodesModel.response.hasOwnProperty('message'))) {
                            $('#standard-content').html(standardMainView.template({
                                'type': standardType
                            }));
                            new standardListView({
                                'model': nodesModel.response.standards[0],
                                'el': $('.js-sets')
                            });
                            $('.reveal-modal').foundation('reveal', 'close');
                            $('.reveal-modal-bg').remove();
                            $('#setsForMobile .js_node_nav').off('click.standards').on('click.standards', function () {
                                currentIndex = $.inArray(this, $('#setsForMobile .js_node_nav'));
                                $('#mobile-standard-details').css({
                                    'left': -(currentIndex * 100) + '%'
                                });
                                $('.js-mobile-sets-container').addClass('hide-important');
                                $('.js-mobile-standards-details').removeClass('hide-important');
                                $('#mobile-standard-details').css({
                                    'height': $('.js-mobile-standards-individual-page:nth-child(' + (currentIndex + 1) + ')').height() + 'px'
                                });
                            });
                            $('.back-icon').off('click.back').on('click.back', function () {
                                if ($('.js-mobile-standards-details') && !$('.js-mobile-standards-details').hasClass('hide-important')) {
                                    $('.js-mobile-sets-container').removeClass('hide-important');
                                    $('.js-mobile-standards-details').addClass('hide-important');
                                } else {
                                    window.history.back();
                                }
                            });
                        } else {
                            console.log('Sorry, we could not load the Standards right now. Please try again or contact our customer support.');
                        }
                        new standardSetView({
                            'model': setsCollection.at(0).toJSON().response.standards,
                            'el': $('.js-sets-dropdown')
                        });
                    } catch (e) {
                        console.log('Sorry, we could not load the Standards right now. Please try again or contact our customer support.');
                    }
                    renderNodes = true;
                }
            }, {
                'template': _.template(TMPL.standardMain, null, {
                    'variable': 'data'
                })
            });

            standardSetView = Backbone.View.extend({
                'events': {
                    'click li a': 'loadSets'
                },
                'initialize': function () {
                    var index, url, html = '';
                    for (index = 0; index < this.model.length; index++) {
                        url = '/' + standardType.toLowerCase() + '/' + (encodeURIComponent(this.model[index].description.trim().replace(/\s/g, '-')) + '/' + encodeURIComponent(this.model[index].children[0].description.trim().replace(/\s/g, '-')));
                        html += standardSetView.template({
                            'model': this.model[index],
                            'url': url.toLowerCase(),
                            'dataId': $('.js-mobile-sets-dropdown').attr('data-id')
                        });
                    }
                    this.$el.html(html);
                    $('.back-icon').off('click.back').on('click.back', function () {
                        if ($('.js-mobile-standards-details').length && !$('.js-mobile-standards-details').hasClass('hide-important')) {
                            $('.js-mobile-sets-container').removeClass('hide-important');
                            $('.js-mobile-standards-details').addClass('hide-important');
                        } else {
                            window.history.back();
                        }
                    });
                    $('#setsDropdownsmall').css({
                        'height': $(document).outerHeight() - $('header').outerHeight()
                    });
                    bindEventsForLeftMenu();
                },
                'loadSets': function (e) {
                    if (renderNodes) {
                        renderNodes = false;
                        listIndex = 0;
                        controller.getChildren($(e.currentTarget).closest('li')[0].id.replace(/\_/g, '.'), new standardMainView().renderNodes);
                        return false;
                    }
                }
            }, {
                'template': _.template(TMPL.standardSets, null, {
                    'variable': 'data'
                })
            });
            
            function bindEventsForLeftMenu () {
                resizeLeftmenu();
                $(window).off('resize.menu').on('resize.menu', function () {
                    resizeLeftmenu();
                    rePositionLeftMenu();
                });
                $(window).off('scroll.menu').on('scroll.menu', function () {
                    rePositionLeftMenu();
                });
            }
            
            function rePositionLeftMenu() {
                var $menu = $('.standrads-left-nav'),
                    pos = $(document).height() - ($(window).height() + $('footer').outerHeight()),
                    posright;
                if ($menu.length) {
                    if($(window).scrollTop() < pos || $(window).scrollTop() == 0) {
                        $menu.removeClass('absolute');
                    } else {
                        $menu.addClass('absolute');
                    }
                }
            }

            function resizeLeftmenu () {
                var height;
                height = $(window).height() - $('.standrds-details').offset().top -$('.js-standards-header-wrapper').outerHeight() - 40;
                $('#sets').css('max-height', height + 'px');
            }

            function swipeLeftHomeView() {
                var index, $pagination, length;
                $pagination = $('.pagination');
                index = $pagination.find('.option-button.active').index();
                length = $pagination.find('.option-button').length - 1;
                if (index < length) {
                    index = index + 1;
                    $('.js-mobile-individual-page-wrapper').css('left', -(index * 100) + '%');
                    $pagination.find('.option-button').removeClass('active');
                    $pagination.find('.option-button:eq(' + index + ')').addClass('active');
                } else if (index === length) {
                    $('.js-mobile-info-container').addClass('hide-important');
                    $('.js-mobile-sets-container').removeClass('hide-important');
                }
            }

            function swipeRightHomeView() {
                var index, $pagination;
                $pagination = $('.pagination');
                index = $pagination.find('.option-button.active').index();
                if (index > 0) {
                    index = index - 1;
                    $('.js-mobile-individual-page-wrapper').css('left', -(index * 100) + '%');
                    $pagination.find('.option-button').removeClass('active');
                    $pagination.find('.option-button:eq(' + index + ')').addClass('active');
                }
            }

            function bindEventsForMobileHomeView() {
                var drag;

                $('.js-mobile-skip').off('click.skip').on('click.skip', function () {
                    $('.js-mobile-info-container').addClass('hide-important');
                    $('.js-mobile-sets-container').removeClass('hide-important');
                });
                $('#browser-start-small').off('click').on('click', function () {
                    $('#sets').children(':eq(0)').trigger('click');
                });
                Hammer('.js-mobile-individual-page-wrapper').off('dragleft.drag').on('dragleft.drag', function () {
                    drag = 'left';
                });

                Hammer('.js-mobile-individual-page-wrapper').off('dragright.drag').on('dragright.drag', function () {
                    drag = 'right';
                });

                Hammer('.js-mobile-individual-page-wrapper').off('release.drag').on('release.drag', function () {
                    if (drag === 'left') {
                        swipeLeftHomeView();
                    } else if (drag === 'right') {
                        swipeRightHomeView();
                    }
                    drag = undefined;
                });

                $('.option-button').off('click.drag').on('click.drag', function () {
                    $('.js-mobile-individual-page-wrapper').css('left', -($(this).index() * 100) + '%');
                    $('.pagination').find('.option-button').removeClass('active');
                    $(this).addClass('active');
                });
            }

            function init(_standardType, setsCollection) {
                standardType = _standardType;
                var standardInfoTemplate, setModel;
                standardInfoTemplate = _.template(TMPL['info' + standardType.toLowerCase()], null, {
                    'variable': 'data'
                });
                $('#standard-content').html(standardInfoTemplate());
                $('#browse-start').off('click.standard').on('click.standard', function () {
                    $('#sets').children(':eq(0)').find('a').trigger('click');
                });
                setModel = setsCollection.at(0).toJSON();
                if (setModel.hasOwnProperty('response') && !(setModel.response.hasOwnProperty('message'))) {
                    new standardSetView({
                        'model': setModel.response.standards,
                        'el': $('.js-sets')
                    });
                } else {
                    console.log('Sorry, we could not load the Standards right now. Please try again or contact our customer support.');
                }
                bindEventsForMobileHomeView();
                if ('true' === $.cookie('flxStandardsView' + standardType)) {
                    $('.js-mobile-skip').trigger('click');
                }
                $.cookie('flxStandardsView' + standardType, 'true', {
                    path: '/'
                });
            }

            function loadMobileView() {
                var standardMobileTemplate = _.template(TMPL.standardMobile, null, {
                    'variable': 'data'
                });
                $('#standard-content').html(standardMobileTemplate());
                $('.js-math-standards').off('click.standard').on('click.standard', function () {
                    window.location = '/ccss/';
                });
                $('.js-science-standards').off('click.standard').on('click.standard', function () {
                    window.location = '/ngss/';
                });
                $('.back-icon').off('click.back').on('click.back', function () {
                    window.history.back();
                });
            }

            function loadSets(_standardType, domain, setsCollection, nodesCollection) {
                standardType = _standardType;
                var nodesModel, index;
                try {
                    nodesModel = nodesCollection.at(0).toJSON().response.standards[0].children;
                    for (index = 0; index < nodesModel.length; index++) {
                        if (domain === nodesModel[index].description.toLowerCase()) {
                            listIndex = index;
                            break;
                        }
                    }
                    if (!(listIndex || 0 === listIndex)) {
                        console.log('The url you entered does not match with a standard. Please contact our customer support for more information.');
                        return;
                    }
                    new standardMainView().renderNodes(nodesCollection, setsCollection);
                } catch (e) {
                    console.log('Sorry, we could not load the Standards right now. Please try again or contact our customer support.');
                }
            }

            this.init = init;
            this.loadMobileView = loadMobileView;
            this.loadSets = loadSets;
        }

        return standardView;
    });