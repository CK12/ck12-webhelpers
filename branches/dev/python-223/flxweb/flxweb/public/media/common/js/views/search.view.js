define( function (require) {
    'use strict';

    var $ = require('jquery');

    function SearchView() {

        var searchElement, selectFunction, searchArtifactTypes;

        function fnFormatResult(displayLabel, currentValue) {
            var pattern = new RegExp(currentValue, 'gi');
            return displayLabel.replace(pattern, '<strong>$&<\/strong>');
        }

        function renderSearchResults(request, response, cache) {

            var searchService = require('common/services/ck12.search');

            request.term = (request.term || '').trim();
            if (request.term) {
                request.query = request.term;
                var query = request.term;
                delete request.term;
                if (cache.hasOwnProperty(query)) {
                    response(cache[query].response.hits);
                    return;
                }
                searchService.initAutoComplete(query, $(searchElement).filter(':visible').siblings('.js-loading-icon'), searchArtifactTypes).done(function (data) {
                    if (data.hasOwnProperty('response') && data.response.hasOwnProperty('hits')) {
                        var i, index, len, results = data.response.hits;
                        if (results instanceof Array && results.length) {
                            for (i = 0; i < results.length; i++) {
                                //results[i].value = fnFormatResult(results[i].title, query);
                                results[i].value = fnFormatResult(results[i].title.replace(/</gi, '&lt;').replace(/>/gi, '&gt;'), query);
                                if (results[i].title.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                                    continue;
                                }
                                else if (results[i].cctitles && (len = results[i].cctitles.length)) {
                                    for (index = 0; index < len; index++) {
                                        if (results[i].cctitles[index].toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                                            results[i].value = fnFormatResult(results[i].cctitles[index].replace(/</gi, '&lt;').replace(/>/gi, '&gt;'), query);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        cache[query] = data;
                        response(data.response.hits);
                    } else {
                        console.log('error in searching for hints.');
                    }
                }).fail(function () {
                    console.log('error in searching for hints.');
                });
            }
        }

        /*function pageName() {
            if (window.pageType) {
                if (window.pageType.toLowerCase().indexOf('group') !== -1) {
                    return 'my_groups';
                }
                switch (window.pageType) {
                case 'Student Home':
                    return 'student_landing';
                case 'Home':
                    return 'student_landing';
                case 'Teacher Home':
                    return 'teacher_landing';
                case 'Dashboard':
                    return 'my_dashboard';
                case 'Bookmarks':
                    return 'my_bookmark';
                case 'My Contents':
                    return 'my_content';
                case 'My Quizzes':
                    return 'my_content';
                case 'Search':
                    return 'search';
                default:
                    return 'top_nav';
                }
            }
            return 'top_nav';
        }*/

        function bindAutocomplete() {
            var inited = $(searchElement).data('inited');
            if (!inited) {
                require('jquery-ui');
                var cache = {};
                $(searchElement).autocomplete({
                    source: function (request, response) {
                        renderSearchResults(request, response, cache);
                    },
                    select: function (event, ui) {
                        // function to execute after selecting result
                        var options = {
                            'searchString': ui.item.value,
                            'autoComplete': true
                        };
                        selectFunction(options);
                    },
                    focus: function (event, ui) {
                        var index, len;
                        ui.item.value = ui.item.title; //default
                        if (ui.item.title.toLowerCase().indexOf($(this).val().toLowerCase()) >= 0) {
                            //skip nothing to do
                        } else if (ui.item.cctitles && (len = ui.item.cctitles.length)) {
                            for (index = 0; index < len; index++) {
                                if (ui.item.cctitles[index].toLowerCase().indexOf($(this).val().toLowerCase()) >= 0) {
                                    ui.item.value = ui.item.cctitles[index];
                                    break;
                                }
                            }
                        }
                        $('.li-focus').removeClass('li-focus');
                        $('.li-active-class').removeClass('li-active-class');
                        $('.ui-state-focus').parent('li').addClass('li-focus');
                        $('.ui-state-focus').add('.ui-state-hover').parent('li').addClass('li-active-class');
                    },
                    delay: 500
                });
                $(searchElement).data('inited',true);
                if ($(searchElement).data()) {
                    var modality = require('common/utils/modality');
                    $.each($(searchElement), function (index, item) {
                        var autoCompeleteItem = $(item).data('ui-autocomplete') || $(item).data('autocomplete');
                        autoCompeleteItem._renderItem = function (ul, item) {
                            $(ul).addClass($(searchElement).data('autocompleteclass') || '');
                            var artifactType, term, regEx = new RegExp('^' + this.term);
                            term = item.label.replace(regEx, '<span style="font-weight:bold;color:Blue;">' + this.term + '</span>');
                            artifactType = 'book' === item.type || 'tebook' === item.type ? 'icon-book' : modality.getModalityIcon(modality.getModalityType(item.type));
                            return $('<li class="autocomplete-list"></li>')
                                .data('item.autocomplete', item)
                                .append('<a class="autocomplete-link ' + artifactType + '">' + term + '</a>')
                                .appendTo(ul);
                        };
                    });
                }
            }
        }

        function searchHandler() {
            var options, searchString = ($(searchElement).filter(':visible').val() || '').trim();
            if (!$('.ui-autocomplete').find('.li-active-class').length) {
                options = {
                    'searchString': searchString,
                    'autoComplete': false
                };
                selectFunction(options);
            }
        }

        function bindEvents() {
            $('.js-search-content').off('click.search').on('click.search', searchHandler);
            bindAutocomplete();
            $(searchElement).off('keyup.search').on('keyup.search', function (e) {
                if (e.keyCode === 13) {
                    searchHandler();
                }
            }).off('click.search').on('click.search', function () {
                $('.ui-autocomplete').find('.li-active-class').removeClass('li-active-class');
            });
            $('body').off('mouseover.autosuggest').on('mouseover.autosuggest', '.autocomplete-list:not(.autocomplete-list__conceptmap)', function() {
                $('.autocomplete-list').removeClass('li-active-class');
                $(this).addClass('li-active-class').parent().css('display', 'block');
            });
            $('body').off('click.autosuggest').on('click.autosuggest', '.autocomplete-list:not(.autocomplete-list__conceptmap)', function(e) {
                if (!$(e.target).closest('.ui-autocomplete').length) {
                    $('.ui-autocomplete').css('display', 'none');
                } else if($(e.target).closest('.autocomplete-list').length) {
                    var options = {
                        'searchString': $(this).find('a').text(),
                        'autoComplete': true
                    };
                    selectFunction(options);
                }
            });
        }

        function init(options) {
            searchElement = options.hasOwnProperty('element') && options.element instanceof $ ? options.element : $('');
            selectFunction = options.hasOwnProperty('onSelect') && options.onSelect instanceof Function ? options.onSelect : $.noop;
            searchArtifactTypes = options.hasOwnProperty('artifactTypes') && (typeof options.artifactTypes === 'string' || options.artifactTypes instanceof String) ? options.artifactTypes : '';
            $(searchElement).filter(':visible').val('');
            bindEvents(searchElement);
        }

        this.init = init;

    }

    return new SearchView();
});
