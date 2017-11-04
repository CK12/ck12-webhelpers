/* global ads_userid, _ck12 */
define([
    'jquery',
    'underscore',
    'backbone',
    'bookmarklet/templates/bookmarklet.templates',
    'common/utils/user',
    'common/utils/url',
    'common/utils/utils',
    'common/views/modal.view'
],
function ($, _, Backbone, Templates, User, URL, Util, ModalView) {
    'use strict';

    var BookmarkletResourceView,
        userDetails,
        url,
        urlOptions,
        _c;

    BookmarkletResourceView = Backbone.View.extend({
        'template_resource_view': _.template(Templates.BOOKMARKLET_RESOURCE_VIEW, null, {
            'variable': 'data'
        }),
        'events': {
            'click.bookmarklet .js-close-bookmarklet': 'close',
            'click.bookmarklet #save-resource': 'createEmbedResource',
            'click.bookmarklet .js-remove-tag': 'removeTag',
            'focus.bookmarklet #resource-title': 'checkOnFocus',
            'keypress.bookmarklet #search-tag-input': 'formTags',
            'click.bookmarklet #show-embed-code': 'showEmbedCode',
            'hover.bookmarklet #embed-help-icon': 'showEmbedHelp'
        },
        'initialize': function(options) {
            var user = new User();
            _c = this;
            _c.controller = options.controller;
            urlOptions = _c.controller.urlOptions;
            user.fetch({
                'success': function(model, userInfo) {
                    userDetails = {
                        'userImage': userInfo.userImage ? userInfo.userImage : '',
                        'firstName': userInfo.firstName.replace(/(?:^|\s)\w/g, _c.camelCase),
                        'lastName': userInfo.lastName.replace(/(?:^|\s)\w/g, _c.camelCase)
                    };
                    _c.user = userInfo;
                    _c.render();
                }
            });
        },
        'encodeURL':function(url){
            var tmp_href = url.split('?');
            if (tmp_href.length > 1){
                var params = tmp_href[1];
                url = tmp_href[0] + '?' + encodeURIComponent(params);
            }
            return url;
        },
        'render': function() {
            _c.$el.html(_c.template_resource_view(userDetails));
            var $signOutLink = $('#sign-out'),
                href = $signOutLink.prop('href'),
                returnToUrl = href + '?returnTo=' + encodeURIComponent(window.location.href);
            url = new URL(window.location.href);
            $signOutLink.prop('href', returnToUrl);
            _c.getResourceTitle();
            if(urlOptions.isEmbedSupport) {
                $('#embed-code').val(urlOptions.embedResponse.html);
            } else if(urlOptions.isIframeSupport){
                $('#embed-code').val(urlOptions.iframeResponse.html);
            } else {
                $('#embed-code').val('');
            }
            _c.bindAutoCompleteEvents();
        },
        'camelCase': function (match) {
            return match.toUpperCase();
        },
        'close': function () {
            if (window.parent && window.parent.postMessage) {
                try {
                    window.parent.postMessage(JSON.stringify({
                        'close': true
                    }), '*');
                } catch (e) {
                    console.log(e);
                }
            }
        },
        'createEmbedResource': function() {
            var authorList = '{"author":["'+$.trim($('.user-fullname').text())+'"]}',
                embedOptions,
                type,
                embed_url = urlOptions.embedUrl,
                xhtmlContent = $.trim($('#embed-code').val()),
                $resourceTitle = $('#resource-title');
            if(_c.checkForTitle()) {
                return;
            }
            if(!Util.validateResourceTitle($resourceTitle.val(), 'resource', $resourceTitle)) {
                return false;
            }
            if(urlOptions.isEmbedSupport) {
                type = 'lecture';
            }else if(urlOptions.isIframeSupport) {
                type = 'lesson';
            }else {
                if(xhtmlContent) {
                    type = 'lesson';
                }else {
                    type = 'web';
                    xhtmlContent = '<p><a target="_blank" href="' + _c.encodeURL(embed_url) + '">' + embed_url.replace(/&/g, '&amp;'); + '</a></p>';
                    _c.saveResource(xhtmlContent, type, embed_url);
                    return;
                }
            }
            if(xhtmlContent) {
                embedOptions = {
                    code: xhtmlContent,
                    authors: authorList,
                    license: ''
                };
                _c.controller.createEmbeddedObject(embedOptions).done(function(result) {
                    if(!(result === '')) {
                        xhtmlContent = result.iframe + '<div><span>Source: </span><a href="' + embed_url + '"target="_blank">' + embed_url + '</a></div>';
                        _c.saveResource(xhtmlContent, type, embed_url, result);
                    }
                }).fail(function(msg) {
                    ModalView.alert(msg);
                });
            } else {
                ModalView.alert('Please enter embed code for the resource.');
            }
        },
        'saveResource': function(xhtmlContent, type, resourceUrl, result) {
            var tagList = [],
                conceptEids = [],
                options = {},
                tagInput = $('#search-tag-input').val(),
                coverImage = result ? result.thumbnail : '';
            if(type === 'lesson') {
                xhtmlContent = '<body><div class="x-ck12-objectives"></div><div class="x-ck12-data-concept">' + xhtmlContent + '</div><div class="x-ck12-data-vocabulary"></div></body>';
            }
            $('#tag-list-container').find('.tag-label').each(function() {
                tagList.push('"' + $(this).text() + '"');
            });
            $('#concept-list-container').find('.tag-label').each(function() {
                conceptEids.push($(this).data('encodedid'));
            });
            if(!tagList.length && !($.trim(tagInput) === '')) {
                tagList.push('"' + tagInput + '"');
            }
            conceptEids = conceptEids.toString();
            options = {
                'title': $.trim($('#resource-title').val()),
                'authors': '{"author":["'+$.trim($('.user-fullname').text())+'"]}',
                'autoSplitLesson': true,
                'cover image uri': coverImage || '',
                'cover image path':'',
                'cover image description':'',
                'cover image name': '',
                'summary': '',
                'xhtml': xhtmlContent,
                'labels': tagList.length ? '{ "labels": [' + tagList.toString() + ']}' : '',
                'domainEIDs': conceptEids || ''
            };
            _c.controller.saveResourceData(options, type).done(function(result) {
                if(!(result === '')) {
                    $('#resource-edit-box').addClass('hide');
                    $('#resouce-saved-message').removeClass('hide');
                    $('#viewOnCk12').attr('href', 'http://' + url.hostname + '/my/library/');
                    _c.saveResourceADS(conceptEids, resourceUrl);
                }
            }).fail(function(msg) {
                ModalView.alert(msg);
            });
        },
        'checkForTitle': function() {
            var $resourceTitle = $('#resource-title'),
                isTitleEmpty = true;
            if(!$resourceTitle.hasClass('error')) {
                if($.trim($resourceTitle.val()) === '') {
                    $resourceTitle.addClass('error');
                    $resourceTitle.val('Enter a Title');
                } else {
                    $resourceTitle.removeClass('error');
                    isTitleEmpty = false;
                }
            }
            return isTitleEmpty;
        },
        'checkOnFocus': function() {
            var $resourceTitle = $('#resource-title');
            if($resourceTitle.hasClass('error')) {
                $resourceTitle.val('');
                $resourceTitle.removeClass('error');
            }
        },
        'getResourceTitle': function() {
            var titleArray,
                resourceTitle = url.search_params.title || '';
            if(resourceTitle === '' && url.href.match('&title=')) {
                titleArray = url.href.split('&title=');
                resourceTitle = titleArray[titleArray.length-1].split('&type=')[0] || '';
            }
            $('#resource-title').val(resourceTitle);
        },
        'bindAutoCompleteEvents': function() {
            var cacheConcept = {},
                cacheTag = {},
                $conceptSearchInput = $('#search-concept-input');
            $conceptSearchInput.autocomplete({
                source: function(request, response) {
                    _c.renderSearchResults(this, request, response, cacheConcept);
                },
                select: function(event, ui) {
                    _c.formLabels($(this), ui);
                    return false;
                },
                appendTo: $('#autocomplete-search-container'),
                position: {
                    using:  function(position) {
                        $(this)[0].style.top = position.top + 10 + 'px';
                    }
                },
                delay: 500
            });
            $('#search-tag-input').autocomplete({
                source: function(request, response) {
                    _c.renderSearchResults(this, request, response, cacheTag);
                },
                select: function(event, ui) {
                    _c.formLabels($(this), ui);
                    return false;
                },
                appendTo: $('#autocomplete-tag-container'),
                position: {
                    using:  function(position) {
                        $(this)[0].style.top = position.top + 10 + 'px';
                    }
                },
                delay: 500
            });
            if($conceptSearchInput.data()) {
                $.each($conceptSearchInput, function(index, item) {
                    var autoCompeleteItem, $item = $(item);
                    autoCompeleteItem = $item.data('ui-autocomplete') || $item.data('autocomplete');
                    autoCompeleteItem._renderItem = function(ul, item) {
                        return $('<li></li>')
                        .data('item.autocomplete', item)
                        .append('<a title="' + item.label + '">' + item.label + '</a>')
                        .appendTo(ul);
                    };
                });
            }
        },
        'renderSearchResults': function(elem, request, response, cache) {
            var query, results;
            request.term = $.trim(request.term);
            if (request.term) {
                request.query = request.term;
                query = request.term;
                delete request.term;
                if (cache.hasOwnProperty(query)) {
                    response(cache[query]);
                    return;
                }
                if(elem.element.hasClass('autocomplete-concept-search')) {
                    _c.controller.getSearchConcepts(query).done(function(data) {
                        results = data.conceptNodes;
                        var i;
                        if (results instanceof Array) {
                            for (i = 0; i < results.length; i++) {
                                results[i].value = results[i].name + ' (' + results[i].branch.name + ')';
                            }
                        }
                        cache[query] = data.conceptNodes;
                        response(data.conceptNodes);
                    }).fail(function() {

                    });
                } else {
                    _c.controller.getSearchTags(query).done(function(data) {
                        results = data.labels.slice(0, 5);
                        var i;
                        if (results instanceof Array) {
                            for (i = 0; i < results.length; i++) {
                                results[i].value = results[i].term;
                            }
                        }
                        cache[query] = results;
                        response(results);
                    }).fail(function() {

                    });
                }
            }
        },
        'removeTag': function(e) {
            $(e.target).closest('.tag-wrapper').remove();
        },
        'formLabels': function(elem, ui) {
            var eId,
                tagLabel,
                labelType,
                isLabelDuplicate = false;
            if(ui.item) {
                eId = ui.item.encodedID;
                tagLabel = ui.item.label;
                labelType =  'concept';
            } else {
                eId = '';
                tagLabel = ui;
                labelType = 'folder';
            }
            elem.parent().siblings('.automplete-data-lists').find('.tag-label').each(function() {
                if($(this).text() === tagLabel) {
                    ModalView.alert('You have already added this ' + labelType + '.');
                    isLabelDuplicate = true;
                }
            });
            if(!isLabelDuplicate) {
                elem.parent().siblings('.automplete-data-lists').append('<div class="tag-wrapper left"><span class="tag-label left" data-encodedid="' + eId + '">' + tagLabel + '</span><a class="left close-bookmarklet close-tag js-remove-tag"><i class="close-icon"></i></a></div>');
                elem.val('');
            }
        },
        'formTags': function(e) {
            var $this = $(e.target),
                tags,
                autoUl = $this.parent().siblings('.ui-autocomplete');
            if(13 === (e.keyCode || e.which)) {
                if($.trim($this.val()) === '') {
                    return;
                } else {
                    tags = $this.val();
                    _c.formLabels($this, tags);
                    if(autoUl.is(':visible')) {
                        autoUl.hide();
                    }
                }
            }
        },
        'saveResourceADS': function(conceptEids, resourceUrl) {
            var payload = {
                'memberID': ads_userid,
                'context_eid': conceptEids || '',
                'url': resourceUrl
            };
            if (window._ck12) {
                _ck12.logEvent('FBS_BKMKLT_CREATE', payload);
            }
        },
        'showEmbedCode': function(e) {
            var $this = $(e.target);
            if($this.closest('#embed-help-icon').length) {
                return false;
            }
            $this.closest('#show-embed-code').parent().toggleClass('embed-open');
        },
        'showEmbedHelp': function() {
            $('.embed-help-tooltip').toggleClass('hide');
        }
    });
    return BookmarkletResourceView;
});
