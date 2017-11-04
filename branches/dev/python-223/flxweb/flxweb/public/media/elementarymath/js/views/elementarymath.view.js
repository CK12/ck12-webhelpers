/* global Hammer, ads_userid */
define(['jquery', 'underscore', 'backbone', 'elementarymath/templates/elementarymath.templates', 'common/views/modal.view', 'common/views/footer.view', 'hammer'],
    function ($, _, Backbone, TMPL, ModalView, FooterView) {
        'use strict';

        function BrowseView(controller) {
            var browseMainView, TopicListView, conceptTrackView, conceptTrackViewSmall, trackListView, trackListViewSmall;

            function logHeaderADSEvent(color) {
                try {
                    var payload = {};
                    payload.memberID = controller.memberID;
                    payload.page = 'browse_header';
                    payload.context_eid = (color || '').replace(/\_/g, '.');
                    controller.logADSEvent(payload);
                } catch (e) {
                    console.log(e);
                }
            }

            function updateNavigationArrows(color) {
                var index, length,
                    payload = {};
                $('.js-navigate-icon-wrapper').css('top', ($(window).height() / 2) - 100 + 'px');
                index = parseInt($(controller.ownContentContainer).attr('data-index'), 10);
                length = $('.js-topic-details-container').length;
                if (index < (length - 1)) {
                    $('.js-right-navigate').removeClass('hide');
                } else {
                    $('.js-right-navigate').addClass('hide');
                }
                if (index > 0) {
                    $('.js-left-navigate').removeClass('hide');
                } else {
                    $('.js-left-navigate').addClass('hide');
                }
                if (color) {
                    try {
                        payload.memberID = controller.memberID;
                        payload.page = 'browse_topic';
                        payload.context_eid = (color || '').replace(/\_/g, '.');
                        payload.referral_action = 'arrow_click';
                        controller.logADSEvent(payload);
                    } catch (e) {
                        console.log(e);
                    }
                }
            }

            function navigateRight() {
                var index, length, color;
                $('.js-active-topic-container').removeClass('js-active-topic-container');
                $('.js-concept-track-wrapper').removeClass('active').filter(':first-child').addClass('active');
                index = parseInt($(controller.ownContentContainer).attr('data-index'), 10);
                length = $('.js-topic-details-container').length;
                if (index < length) {
                    index = index + 1;
                    color = $(controller.ownContentContainer).children(':eq(' + index + ')').find('.topic-header').attr('data-color');
                    $(controller.ownContentContainer).attr('data-index', index).css('left', '-' + (index * 100) + '%');
                    $('.js-topic-details-container').eq(index).addClass('js-active-topic-container');
                    $('.topic-header').attr('data-class', color);
                    updateNavigationArrows(color);
                }
            }

            function navigateLeft() {
                var index, color;
                $('.js-active-topic-container').removeClass('js-active-topic-container');
                $('.js-concept-track-wrapper').removeClass('active').filter(':first-child').addClass('active');
                index = parseInt($(controller.ownContentContainer).attr('data-index'), 10);
                if (index > 0) {
                    index = index - 1;
                    color = $(controller.ownContentContainer).children(':eq(' + index + ')').find('.topic-header').attr('data-color');
                    $(controller.ownContentContainer).attr('data-index', index).css('left', '-' + (index * 100) + '%');
                    $('.js-topic-details-container').eq(index).addClass('js-active-topic-container');
                    $('.topic-header').attr('data-class', color);
                    updateNavigationArrows(color);
                }
            }

            function hideModel () {
                $('.topic-details-wrapper').css('top', '-' + $('.topic-details-wrapper').height() + 'px');
                $('.topic-details-wrapper').addClass('hide');
                $(controller.ownContentContainer).css('left', '0%').removeClass('expanded');
                $('body').removeClass('full-view');
            }

            trackListView = Backbone.View.extend({
                'events': {
                    'click .js-concept-track-parent': 'showTrackDetails'
                },
                'initialize': function () {
                    try {
                        var index, html = '';
                        for (index = 0; index < this.model.length; index++) {
                            this.model[index].collectionHandle = this.options.collectionHandle;
                            html += trackListView.template(this.model[index]);
                        }
                        this.el.innerHTML = html;
                    } catch (e) {
                        console.log('Could not render concept tracks');
                        console.log(e);
                    }
                    return this;
                },
                'showTrackDetails': function (e) {
                    var sourceHeight, targetHeight, sourceTop, top, targetTop, newHeight, newTop, $currentTarget, scrollTo;
                    $currentTarget = $(e.currentTarget);
                    targetHeight = $currentTarget.siblings('.js-concept-list-container').height();
                    sourceTop = $currentTarget.offset().top;
                    top = $('.js-active-topic-container .js-concept-track-wrapper:first-child').offset().top;
                    sourceHeight = $currentTarget.outerHeight();
                    newHeight = (targetHeight - sourceHeight) / 2;
                    newTop = sourceTop - newHeight;
                    if (newTop < top) {
                        targetTop = sourceTop - top;
                    } else {
                        targetTop = newHeight;
                    }
                    $currentTarget.siblings('.js-concept-list-container').css('top', '-' + targetTop + 'px').parent().addClass('active').siblings().removeClass('active');
                    scrollTo = sourceTop - ($(window).height() / 2) + (sourceHeight / 2);
                    if (scrollTo > 0) {
                        $(window).scrollTop(scrollTo);
                    }
                    logHeaderADSEvent($currentTarget.data('eid'));
                }
            }, {
                'template': _.template(TMPL.conceptTrackList, null, {
                    'variable': 'data'
                })
            });

            trackListViewSmall = Backbone.View.extend({
                'events': {
                    'click .js-concept-track-parent-small': 'showTrackDetails'
                },
                'initialize': function () {
                    try {
                        var index, html = '';
                        for (index = 0; index < this.model.length; index++) {
                            html += trackListViewSmall.template(this.model[index]);
                        }
                        this.el.innerHTML = html;
                    } catch (e) {
                        console.log('Could not render concept tracks');
                        console.log(e);
                    }
                    return this;
                },
                'showTrackDetails': function (e) {
                    var length, $trackListContainer, $trackList, $currentTarget;
                    $currentTarget = $(e.currentTarget);
                    $trackListContainer = $currentTarget.parents('.js-trackListContainer-small');
                    $trackList = $trackListContainer.find('.js-concept-track-wrapper-small');
                    length = $trackList.length;
                    $trackList.css('width', 100 / length + '%');
                    $trackListContainer.addClass('expanded').css({
                        'width': length * 100 + '%',
                        'left': '-' + $(e.currentTarget).parent().index() * 100 + '%'
                    }).attr('data-index', $(e.currentTarget).parent().index());
                    this.bindEvents();
                    setTimeout(function () {
                        $(controller.ownContentContainerSmall).addClass('expanded');
                    }, 1000);
                    logHeaderADSEvent($currentTarget.data('eid'));
                },
                'swipeLeft': function (e) {
                    var index, length, $target;
                    $target = $(e.currentTarget);
                    length = $target.find('.js-concept-track-wrapper-small').length;
                    index = parseInt($target.attr('data-index'), 10);
                    if (index < (length - 1)) {
                        index = index + 1;
                        $target.attr('data-index', index).css('left', -(index * 100) + '%');
                    }
                },
                'swipeRight': function (e) {
                    var index, $target;
                    $target = $(e.currentTarget);
                    index = parseInt($target.attr('data-index'), 10);
                    if (index > 0) {
                        index = index - 1;
                        $target.attr('data-index', index).css('left', -(index * 100) + '%');
                    }
                },
                'bindEvents': function () {
                    var self = this;
                    Hammer('.js-trackListContainer-small.expanded').off('dragleft.drag').on('dragleft.drag', function () {
                        self.drag = 'left';
                    });

                    Hammer('.js-trackListContainer-small.expanded').off('dragright.drag').on('dragright.drag', function () {
                        self.drag = 'right';
                    });

                    Hammer('.js-trackListContainer-small.expanded').off('release.drag').on('release.drag', function (e) {
                        if ($(e.currentTarget).hasClass('js-trackListContainer-small')) {
                            if (self.drag === 'left') {
                                self.swipeLeft(e);
                            } else if (self.drag === 'right') {
                                self.swipeRight(e);
                            }
                            self.drag = undefined;
                            e.stopPropagation();
                        }
                    });
                }
            }, {
                'template': _.template(TMPL.conceptTrackListSmall, null, {
                    'variable': 'data'
                })
            });

            conceptTrackView = Backbone.View.extend({
                'initialize': function () {
                    var className;
                    try {
                        className = this.model.get('previewEID').split('.');
                        className.length = 3;
                        className = className.join('_');
                        this.$el.append(conceptTrackView.template({
                            'name': this.model.escape('title'),
                            'class': className
                        }));
                        new trackListView({
                            'el': this.$('.js-trackListContainer:last'),
                            'model': this.model.get('contains'),
                            'collectionHandle': this.model.collection.collectionHandle
                        });
                    } catch (e) {
                        console.log('Could not load concpet tracks');
                        console.log(e);
                    }
                    this.bindEvents();
                    return this;
                },
                'bindEvents': function () {
                    var self = this;
                    $('.js-topic-close').off('click.close').on('click.close', function () {
                        self.hideTopicDetails();
                    });
                },
                'hideTopicDetails': function () {
                    $('.topic-details-wrapper').animate({
                        top: '-' + $('.topic-details-wrapper').height() + 'px'
                    }, 500, function () {
                        $('.topic-details-wrapper').addClass('hide');
                        $(controller.ownContentContainer).css('left', '0%').removeClass('expanded');
                        $('body').removeClass('full-view');
                    });
                }
            }, {
                'template': _.template(TMPL.conceptTrack, null, {
                    'variable': 'data'
                })
            });

            conceptTrackViewSmall = Backbone.View.extend({
                'events': {
                    'click .js-topic-close': 'hideTopicDetails'
                },
                'initialize': function () {
                    var className;
                    try {
                        className = this.model.get('contains')[0].contains[0].encodedID.split('.');
                        className.length = 3;
                        className = className.join('_');
                        this.$el.append(conceptTrackViewSmall.template({
                            'name': this.model.escape('name'),
                            'class': className
                        }));
                        new trackListViewSmall({
                            'el': this.$('.js-trackListContainer-small:last'),
                            'model': this.model.get('contains')
                        });
                    } catch (e) {
                        console.log('Could not load concpet tracks');
                        console.log(e);
                    }
                    return this;
                },
                'hideTopicDetails': function () {
                    $('.topic-details-wrapper').addClass('hide');
                    $('body').removeClass('full-view');
                }
            }, {
                'template': _.template(TMPL.conceptTrackSmall, null, {
                    'variable': 'data'
                })
            });

            TopicListView = Backbone.View.extend({
                'drag': undefined,
                'events': {
                    'click .js-topic-wrapper': 'showTopicDetails'
                },
                'initialize': function () {
                    _.bindAll(this, 'swipeLeft', 'swipeRight', 'bindEvents');
                    try {
                        var index, model, html = '';
                        controller.ownContentContainer.innerHTML = '';
                        controller.ownContentContainerSmall.innerHTML = '';
                        for (index = 0; index < this.model.length; index++) {
                            model = this.model.at(index);
                            html += TopicListView.template(model);
                            new conceptTrackView({
                                'el': controller.ownContentContainer,
                                'model': model,
                                'collectionHandle': this.model.collectionHandle
                            });
                            new conceptTrackViewSmall({
                                'el': controller.ownContentContainerSmall,
                                'model': model,
                                'collectionHandle': this.model.collectionHandle
                            });
                        }
                        this.el.innerHTML = html;
                        this.bindEvents();
                    } catch (e) {
                        console.log('Could not render topics');
                        console.log(e);
                    }
                },
                'showTopicDetails': function (e) {
                    var $topicWrapper, count, index, color,
                        payload = {};
                    $topicWrapper = $('.topic-details-wrapper');
                    $('body').addClass('full-view');
                    $topicWrapper.removeClass('hide');
                    index = $(e.currentTarget).parents('.left').index();
                    color = $(controller.ownContentContainer).children(':eq(' + index + ')').find('.topic-header').attr('data-color');
                    if ($(window).width() > 767) {
                        $('.js-active-topic-container').removeClass('js-active-topic-container');
                        $('.js-concept-track-wrapper').removeClass('active').filter(':first-child').addClass('active');
                        $topicWrapper.css('top', '-' + $topicWrapper.height() + 'px').animate({
                            top: '0px'
                        }, 500);
                        count = $('.js-topic-details-container').length;
                        $(controller.ownContentContainer).css({
                            'width': count * 100 + '%',
                            'left': '-' + index * 100 + '%'
                        }).attr('data-index', index).children().eq(index).removeClass('hide').addClass('js-active-topic-container');
                        $('.js-topic-details-container').css('width', 100 / count + '%');
                        setTimeout(function () {
                            $(controller.ownContentContainer).addClass('expanded');
                        }, 1000);
                        $('.topic-header').attr('data-class', color);
                        updateNavigationArrows();
                    } else {
                        $('.title-area .name').addClass('hide-small');
                        $('.back-icon').removeClass('hide-one hidden');
                        $('#side-reveal-icon').addClass('topic-view');
                        $('.page-title').text($(e.currentTarget).find('.topic-name a').text());
                        $('header').addClass('topic-selected').attr('data-class', $(controller.ownContentContainerSmall).children(':eq(' + index + ')').attr('data-color'));
                        count = $('.js-topic-details-wrapper-small').length;
                        $(controller.ownContentContainerSmall).css({
                            'width': count * 100 + '%',
                            'left': '-' + index * 100 + '%'
                        }).attr('data-index', index);
                        setTimeout(function () {
                            $('body').addClass('expanded');
                        }, 1000);
                        $('.js-topic-details-wrapper-small').css('width', 100 / count + '%');
                        $topicWrapper.css('top', '-' + $topicWrapper.height() + 'px').animate({
                            top: $('header').outerHeight() + 'px'
                        }, 500);
                    }
                    $(window).scrollTop(0, 0);
                    try {
                        payload.memberID = controller.memberID;
                        payload.page = 'browse_topic';
                        payload.context_eid = color.replace(/\_/g, '.');
                        payload.referral_action = 'tile_click';
                        controller.logADSEvent(payload);
                    } catch (error) {
                        console.log(error);
                    }
                    $(window).off('resize.topic').on('resize.topic', function () {
                        if ($(window).width() > 767) {
                            if ($('body').hasClass('expanded')) {
                                $('.js-trackListContainer-small.expanded').css({
                                    'left': '0%',
                                    'width': '100%'
                                }).removeClass('expanded').find('.js-concept-track-wrapper-small').css('width', '100%');
                                $(controller.ownContentContainerSmall).removeClass('expanded');
                                $('.topic-details-wrapper').css('top', '-' + $('.topic-details-wrapper').height() + 'px');
                                $('.topic-details-wrapper').addClass('hide');
                                $('body').removeClass('full-view expanded');
                                $('#side-reveal-icon').removeClass('topic-view');
                                $('.title-area .name').removeClass('hide-small');
                                $('.page-title').removeClass('hide-small').text('Browse');
                                $('.back-icon').addClass('hide-one hidden');
                                $('header').removeClass('topic-selected').removeAttr('data-class');
                            }
                        } else {
                            if (!$('body').hasClass('expanded')) {
                                $('.topic-details-wrapper').css('top', '-' + $('.topic-details-wrapper').height() + 'px');
                                $('.topic-details-wrapper').addClass('hide');
                                $(controller.ownContentContainer).css('left', '0%').removeClass('expanded');
                                $('body').removeClass('full-view');
                            }
                        }
                    });
                },
                'swipeLeft': function () {
                    var index, length;
                    length = $('.js-topic-details-wrapper-small').length;
                    index = parseInt($(controller.ownContentContainerSmall).attr('data-index'), 10);
                    if (index < (length - 1)) {
                        index = index + 1;
                        $(controller.ownContentContainerSmall).attr('data-index', index).css('left', -(index * 100) + '%');
                        $('.page-title').text($($('.topic-details-wrapper-small')[index]).data('topic-name'));
                        $('header').attr('data-class', $(controller.ownContentContainerSmall).children(':eq(' + index + ')').attr('data-color'));
                    }
                },
                'swipeRight': function () {
                    var index = parseInt($(controller.ownContentContainerSmall).attr('data-index'), 10);
                    if (index >= 1) {
                        index = index - 1;
                        $(controller.ownContentContainerSmall).attr('data-index', index).css('left', -(index * 100) + '%');
                        $('.page-title').text($($('.topic-details-wrapper-small')[index]).data('topic-name'));
                        $('header').attr('data-class', $(controller.ownContentContainerSmall).children(':eq(' + index + ')').attr('data-color'));
                    }
                },
                'bindEvents': function () {
                    var self = this;
                    Hammer('.js-own-content-small').off('dragleft.drag').on('dragleft.drag', function () {
                        self.drag = 'left';
                    });
                    Hammer('.js-own-content-small').off('dragright.drag').on('dragright.drag', function () {
                        self.drag = 'right';
                    });
                    Hammer('.js-own-content-small').off('release.drag').on('release.drag', function (e) {
                        if ($(e.currentTarget).hasClass('js-own-content-small')) {
                            if (self.drag === 'left') {
                                self.swipeLeft();
                            } else if (self.drag === 'right') {
                                self.swipeRight();
                            }
                            self.drag = undefined;
                        }
                    });
                    Hammer('#owncontent').off('dragleft.drag').on('dragleft.drag', function () {
                        self.drag = 'left';
                    });
                    Hammer('#owncontent').off('dragright.drag').on('dragright.drag', function () {
                        self.drag = 'right';
                    });
                    Hammer('#owncontent').off('release.drag').on('release.drag', function () {
                        if (self.drag === 'left' && !$('.js-right-navigate').hasClass('hide')) {
                            navigateRight();
                        } else if (self.drag === 'right' && !$('.js-left-navigate').hasClass('hide')) {
                            navigateLeft();
                        }
                        self.drag = undefined;
                    });
                    $('.back-icon').off('click.back').on('click.back', function () {
                        if ($('.js-trackListContainer-small').hasClass('expanded')) {
                            $('.js-trackListContainer-small.expanded').css({
                                'left': '0%',
                                'width': '100%'
                            }).removeClass('expanded').find('.js-concept-track-wrapper-small').css('width', '100%');
                            $(controller.ownContentContainerSmall).removeClass('expanded');
                        } else {
                            $('.topic-details-wrapper').animate({
                                top: '-' + $('.topic-details-wrapper').height() + 'px'
                            }, 500, function () {
                                $('.topic-details-wrapper').addClass('hide');
                                $('body').removeClass('full-view expanded');
                                $('#side-reveal-icon').removeClass('topic-view');
                                $('.title-area .name').removeClass('hide-small');
                                $('.page-title').removeClass('hide-small').text('Browse');
                                $('.back-icon').addClass('hide-one hidden');
                                $('header').removeClass('topic-selected').removeAttr('data-class');
                            });
                        }
                    });
                }
            }, {
                'template': _.template(TMPL.topicList, null, {
                    'variable': 'data'
                })
            });

            browseMainView = Backbone.View.extend({
                'events': {
                    'click .js-grade': 'changeGrade'
                },
                'render': function () {
                    new TopicListView({
                        'el': $('#topic-container'),
                        'model': this.model
                    });
                    $('.topic-details-wrapper').addClass('hide');
                    hideModel();
                    this.initializeShare();
                },
                'initialize': function () {
                    this.el.innerHTML = browseMainView.template({
                        'eid': controller.eid
                    });
                    $('.js-grade[data-grade="' + (controller.grade || $.cookie('flxwebgrade') || 1) + '"]').find('a').addClass('selected');
                    this.render();
                },
                'changeGrade': function (e) {
                    var context = $(e.currentTarget),
                        self = this;
                    controller.getBrowseTerm({
                        'eID': context.parent().data('eid') + context.data('grade'),
                        'grade': context.data('grade'),
                        'clicked': true
                    }).done(function (result) {
                        if (!result) {
                            ModalView.alert('Sorry, we could not load this page right now. Please contact our customer support for more information.');
                            return false;
                        }
                        $.cookie('flxwebgrade', context.data('grade'), {
                            path: '/'
                        });
                        context.find('a').addClass('selected').end().siblings().find('a').removeClass('selected');
                        self.render();
                    }).fail(function () {
                        ModalView.alert('Sorry, we could not load this page right now. Please contact our customer support for more information.');
                    });
                    return false;
                },
                'initializeShare': function() {
                    var branchName = $('.branch-name').data('branch'),
                        shareImageUrl = '/media/images/branch_images/' + branchName.toLowerCase().replace(/\s/g, '-').replace(/\./g, '') + '.png',
                        payload = {
                            memberID : ads_userid,
                            page : 'elementary_math'
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
            }, {
                'template': _.template(TMPL.main, null, {
                    'variable': 'data'
                })
            });
            this.init = function (result) {
                if (!result) {
                    ModalView.alert('Sorry, we could not load this page right now. Please contact our customer support for more information.');
                    return false;
                }
                new browseMainView({
                    'el': controller.container,
                    'model': result
                });
                $('.js-right-navigate').off('click.navigate').on('click.navigate', navigateRight);
                $('.js-left-navigate').off('click.navigate').on('click.navigate', navigateLeft);
            };
        }

        return BrowseView;
    });
