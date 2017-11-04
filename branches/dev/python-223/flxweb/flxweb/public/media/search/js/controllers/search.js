define(['jquery',
        'search/services/ck12.search',
        'common/utils/url',
        'common/utils/modality',
        'search/utils/search.util',
        'common/utils/utils'
    ],
    function ($, service, URL, modality, searchUtil, util) {
        'use strict';

        function loadViewEssentials() {
            var _d = $.Deferred();
            try {
                require(['search/views/search.view'], function (view) {
                    _d.resolve(view);
                });
            } catch (e) {
                _d.reject();
            }
            return _d.promise();
        }

        function checkSearchResult(input, result) {
            if (input.hasOwnProperty('response')) {
                result = input.response;
                if (result.hasOwnProperty('message') || !result.hasOwnProperty('Artifacts')) {
                    result = '';
                } else {
                    result = result.Artifacts;
                }
                if (input.response.hasOwnProperty('specialMatches') && input.response.specialMatches.length) {
                    result.specialMatches = input.response.specialMatches[0];
                    result.total++;
                }
            } else {
                result = '';
            }
            return result;
        }

        function getModalityGroupForSpecialSearch(query) {
            var modalityGroups = [],
                modalityTemp, queryIndex = -1,
                index, temp;
            query = (query || '').toString();
            queryIndex = query.indexOf('type:');
            if (queryIndex !== -1) {
                modalityTemp = query.slice(queryIndex);
                query = query.slice(0, queryIndex);
                if (modalityTemp.indexOf(';') !== -1) {
                    modalityTemp = modalityTemp.split(';');
                } else if (modalityTemp.indexOf(',') !== -1) {
                    modalityTemp = modalityTemp.split(',');
                } else {
                    modalityTemp = modalityTemp.split(' ');
                }
                for (index = 0; index < modalityTemp.length; index++) {
                    modalityTemp[index] = modalityTemp[index].trim();
                    if (modalityTemp[index].indexOf('type:') !== -1) {
                        temp = modalityTemp[index].replace('type:', '');
                        if (modalityGroups.indexOf(temp) === -1) {
                            modalityGroups.push(temp);
                        }
                    } else {
                        query += modalityTemp[index] + ' ';
                    }
                }
            }
            return {
                'modalityGroups': modalityGroups,
                'query': query.trim()
            };
        }

        function isSpecialSearchForModality(query) {
            query = (query || '').toString();
            if (query.indexOf('type:') !== -1) {
                return true;
            }
            return false;
        }

        function processSource(query) {
            var queryIndex, sourceTemp = [],
                index, source = '',
                temp;
            query = (query || '').toString();
            queryIndex = query.indexOf('&source=');
            if (queryIndex !== -1) {
                sourceTemp = query.slice(queryIndex);
                sourceTemp = sourceTemp.split('&source=');
                for (index = 0; index < sourceTemp.length; index++) {
                    temp = sourceTemp[index].split('&')[0];
                    if (temp) {
                        source = temp;
                        break;
                    }
                }
            }
            return source;
        }

        function modalitySearchGroup(query) {
            var queryIndex, index, temp,
                modalityTemp = [],
                modalityGroups = [];
            query = (query || '').toString();
            queryIndex = query.indexOf('&type=');
            if (queryIndex !== -1) {
                modalityTemp = query.slice(queryIndex);
                modalityTemp = modalityTemp.split('&type=');
                for (index = 0; index < modalityTemp.length; index++) {
                    temp = modalityTemp[index].split('&')[0];
                    if (temp) {
                        modalityGroups.push(temp);
                    }
                }
            }
            return modalityGroups;
        }

        function removeDuplicateItems(query, delimiter) {
            try {
                query = (query || '').toString();
                delimiter = (delimiter || ',').toString();
                var queryArray, index, queryIndex;
                queryArray = query.split(delimiter);
                for (index = 0; index < queryArray.length; index++) {
                    if (queryArray[index] === "") {
                        queryArray.splice(index, 1);
                        index--;
                        continue;
                    }
                    queryIndex = queryArray.lastIndexOf(queryArray[index]);
                    while (index !== queryIndex) {
                        queryArray.splice(queryIndex, 1);
                        queryIndex = queryArray.lastIndexOf(queryArray[index]);
                    }
                }
                query = queryArray.join(delimiter);
                return query;
            } catch (e) {
                console.log(e);
                return query;
            }
        }

        function excludeBlockedModalities(modalityType) {
            try {
                var index,
                    blockedModalities = searchUtil.getModalityBlockTypes();
                modalityType = modalityType.split(',');
                for (index = 0; index < modalityType.length; index++) {
                    if (-1 !== blockedModalities.indexOf(modalityType[index])) {
                        modalityType.splice(index, 1);
                        index--;
                    }
                }
                return modalityType.join(',');
            } catch (e) {
                return '';
            }
        }

        function getAllModalityTypes(tempParams) {
            var index,
                modalityType = 'domain,';
            for (index = 0; index < tempParams.modalityMapping.mapping.length; index++) {
                modalityType += modality.getModalitiesFromGroup(tempParams.modalityMapping.mapping[index]);
                modalityType += ',';
            }
            modalityType = modalityType.split(',');
            modalityType.pop();
            modalityType = modalityType.join(',');
            return modalityType;
        }

        function getModalityGroups(tempParams) {
            var index, modalityIndex,
                modalityType = '';
            try {
                if (tempParams.searchModalityGroups instanceof Array) {
                    if ((0 === tempParams.searchModalityGroups.length) || (-1 !== tempParams.searchModalityGroups.indexOf('all'))) {
                        // there are no modality or artifact types specified, so include all
                        modalityType += 'lesson,section,' + tempParams.searchableBookTypes.join(','); // all artifact types
                        modalityType += ',' + getAllModalityTypes(tempParams); // all modality types
                    } else {
                        // check for modality types
                        tempParams.searchType = [];
                        for (index = 0; index < tempParams.searchModalityGroups.length; index++) {
                            modalityIndex = tempParams.modalityMapping.value.indexOf(tempParams.searchModalityGroups[index]);
                            if (-1 !== modalityIndex) {
                                modalityType += modality.getModalitiesFromGroup(tempParams.modalityMapping.mapping[modalityIndex]) + ',';
                                tempParams.searchType.push(tempParams.searchModalityGroups[index]);
                            }
                        }
                        // check for artifact types
                        for (index = 0; index < tempParams.searchModalityGroups.length; index++) {
                            if (-1 !== tempParams.searchableBookTypes.indexOf(tempParams.searchModalityGroups[index])) {
                                modalityType += tempParams.searchModalityGroups[index] + ',';
                                tempParams.searchType.push(tempParams.searchModalityGroups[index]);
                            }
                        }
                        // check for concept
                        for (index = 0; index < tempParams.searchModalityGroups.length; index++) {
                            if ('concept' === tempParams.searchModalityGroups[index]) {
                                modalityType += 'domain' + ',';
                                tempParams.searchType.push('concept');
                                break;
                            }
                        }
                        modalityType = modalityType.split(',');
                        modalityType.pop();
                        modalityType = modalityType.join(',');
                        if (!modalityType) {
                            // specified type does not match any CK-12 supported type, default to all
                            tempParams.searchType = '';
                            modalityType += 'lesson,section,' + tempParams.searchableBookTypes.join(','); // all artifact types
                            modalityType += ',' + getAllModalityTypes(tempParams); // all modality types
                        }
                    }
                } else {
                    modalityType = '';
                }
            } catch (e) {
                console.log(e);
                modalityType = '';
            }
            modalityType = removeDuplicateItems(modalityType, ',');
            modalityType = excludeBlockedModalities(modalityType);
            return modalityType;
        }

        function isSpecialSearch(query, isGradeParam, isSubjectParam) {
            query = (query || '').toString();
            var index, specialSearchFields,
                isSpecial = false;
            try {
                specialSearchFields = searchUtil.getSpecialSearchFields();
                for (index = 0; index < specialSearchFields.value.length; index++) {
                    if (query.indexOf(specialSearchFields.value[index]) !== -1) {
                        if (('grade:' === specialSearchFields.value[index] && isGradeParam) || ('subject:' === specialSearchFields.value[index] && isSubjectParam)) {
                            query = query.replace(specialSearchFields.value[index], '');
                        } else {
                            query = query.replace(specialSearchFields.value[index], specialSearchFields.mapping[index]);
                            isSpecial = 'author:' === specialSearchFields.value[index] ? 'author' : true;
                        }
                    }
                }
                return {
                    'query': query,
                    'isSpecialSearch': isSpecial
                };
            } catch (e) {
                return false;
            }
        }

        function processFilterParams(query, key, value) {

            var queryIndex, index,
                filterTemp = [],
                params = '',
                filterGroup = [];
            query = (query || '').toString();
            queryIndex = query.indexOf(key);
            if (queryIndex !== -1) {
                filterTemp = query.slice(queryIndex);
                filterTemp = filterTemp.split(key);
                for (index = 0; index < filterTemp.length; index++) {
                    if (filterTemp[index].split('&')[0]) {
                        params += value + filterTemp[index].split('&')[0] + ';';
                        filterGroup.push(filterTemp[index].split('&')[0]);
                    }
                }
            }
            params = params.split(';');
            params.pop();
            params = params.join(';');
            return {
                'query': params,
                'filter': filterGroup
            };

        }

        function searchHitADS(tempParams, href) {
            var payload = {
                'searchTerm': tempParams.url.search_params.q || '',
                'myLibrary': 'my' === tempParams.url.search_params.source ? 'true' : 'false',
                'modalities': tempParams.searchType || ['all'],
                'clickedLink': href,
                'source': tempParams.source || 'ck12',
                'resultsCount': tempParams.total.toString()
            };
            if (window._ck12) {
                _ck12.logEvent('FBS_SEARCH_HIT', payload);
            }
        }

        function searchADS(total, tempParams, retry) {
            var payload = {
                'searchTerm': tempParams.url.search_params.q || '',
                'referrer': tempParams.url.search_params.referrer || 'search',
                'autoComplete': tempParams.url.search_params.autoComplete || 'false',
                'myLibrary': 'my' === tempParams.url.search_params.source ? 'true' : 'false',
                'modalities': tempParams.searchType || ['all'],
                'grades': tempParams.grade || ['all'],
                'subject': tempParams.subject || ['all'],
                'source': tempParams.source || 'ck12',
                'resultsCount': total.toString()
            };
            if (retry) {
                payload.retry = retry;
            }
            if (window._ck12) {
                _ck12.logEvent('FBS_SEARCH', payload);
            }
        }

        function pushSearchState(options) {
            if (!(options.popState)) {
                if (history.pushState) {
                    history.pushState({}, document.title, options.href);
                } else {
                    if (location.href.match(/\?/)) {
                        location.href = location.href.split('?')[0] + '#' + options.href.split('?')[1];
                    } else {
                        location.hash = options.href.split('?')[1];
                    }
                }
            }
        }
        
        function addCount (counter, filter, preprocess, key) {
            var index, idx = 0;
            counter.forEach(function (item) {
                index = filter[key || "value"].indexOf( preprocess ? preprocess(item[0]) : item[0]);
                if (index !== -1) {
                    if (!filter.count) {
                        filter.count = [];
                    }
                    if (filter.count[index]) { // Revisiting an already sorted item
                        filter.count[index] += item[1];
                    } else {
                        filter.count[idx] = item[1];
                        moveItems(filter.value, index, idx);
                        moveItems(filter.label, index, idx);
                        idx += 1;
                    }
                }
            });

            function moveItems (array, index1, index2) {
                var temp = array.splice(index1, 1);
                if (index2 > index1) {
                    index2 -= 1;
                }
                array.splice(index2, 0, temp[0]);
            }
        }
        
        function addCounts (filters, groups) {
            for (var type in filters) {
                switch (type) {
                case 'typeStr':
                    addCount(filters[type], groups.allTypeGroups, getModalityType, "label");
                    break;
                case 'gradeLevels.ext':
                    addCount(filters[type], groups.allGradeFilters);
                    break;
                case 'subjects.ext':
                    for (var sub in groups.allSubjectFilters) {
                        addCount(filters[type], groups.allSubjectFilters[sub], hyphenCase);
                    }
                    break;
                }
            }
            
            function getModalityType (type) {
                return modality.getModalityType(type);
            }
            
            function hyphenCase (txt) {
                return txt.replace(/\s+/g, '-');
            }
        }

        var SearchController = function () {

            var _c = this,
                tempParams = {};

            this.processURL = function (options, hideSpinner) {
                var temp, searchTypes, searchTerm, url, searchURL,
                    isGradeParam = false,
                    isSubjectParam = false,
                    _d = $.Deferred(),
                    searchParams = {},
                    defaults = {
                        'onload': false,
                        'href': '',
                        'originalSearchString': ''
                    };
                options = $.extend(defaults, options);
                url = options.href ? new URL(options.href) : new URL();
                if (url.hash && $.isEmptyObject(url.search_params)) {
                    options.href = url.href.replace('#', '?');
                    url = new URL(options.href);
                }

                searchParams.pageNum = url.search_params.pageNum || 1;
                searchParams.sort = url.search_params.sort;
                searchParams.specialSearch = false;
                searchParams.includeSpecialMatches = !options.filter;
                searchParams.filters = '';
                searchTerm = url.search_params.q || '';

                tempParams.searchString = (options.originalSearchString || searchTerm).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                tempParams.isSuggestion = false;
                tempParams.pageSize = 10;
                tempParams.pagesToShow = 5;
                tempParams.searchType = '';
                tempParams.url = url;
                tempParams.mode = url.search_params.mode || 'list';
                tempParams.origin = url.search_params.origin;
                tempParams.types = url.search_params.type;
                tempParams.grade = url.search_params.grade;
                tempParams.subject = url.search_params.subject;
                tempParams.source = url.search_params.source;
                tempParams.pageNum = searchParams.pageNum;
                tempParams.searchModalityGroups = [];
                if (options.onload) {
                    tempParams.only_has_exercises = false;
                    tempParams.allTypeGroups = searchUtil.getSearchTypeGroups();
                    tempParams.allCountryFilters = searchUtil.getCountryFields();
                    tempParams.allGradeFilters = searchUtil.getGradeFields();
                    tempParams.allSubjectFilters = searchUtil.getSubjectFields();
                    tempParams.modalityMapping = searchUtil.getModalityMapping();
                    tempParams.searchableBookTypes = searchUtil.getSearchableBookTypes();
                }
                if (tempParams.types) {
                    temp = modalitySearchGroup(url.search);
                    if (-1 === temp.indexOf('all')) {
                        tempParams.searchModalityGroups = temp;
                    }
                } else if (isSpecialSearchForModality(searchTerm)) {
                    temp = getModalityGroupForSpecialSearch(searchTerm);
                    searchTerm = temp.query;
                    tempParams.searchModalityGroups = temp.modalityGroups;
                }
                searchTypes = getModalityGroups(tempParams);  // fills tempParams.searchTypes
                if (options.filter) {
                    tempParams.searchModalityGroups = [];
                    searchTypes = getModalityGroups(tempParams);  // include all search types
                }
                if (!searchTypes) {
                    alert('Sorry, we were not able to search for this query. Please try a different query or try again later.');
                    return false;
                }
                if (searchParams.sort && (-1 === searchUtil.getSortOptions().value.indexOf(searchParams.sort))) {
                    // check whether sort specified is supported by CK-12
                    searchParams.sort = undefined;
                }

                if (tempParams.source) {
                    temp = processSource(url.search);
                    tempParams.source = temp;
                    if ('my' === temp) {
                        searchURL = 'searchMy';
                    } else {
                        searchURL = 'search';
                        if ('community' === temp) {
                            searchParams.communityContributed = true;
                        } else {
                            searchParams.ck12only = true;
                            tempParams.source = 'ck12';
                        }
                    }
                } else {
                    searchURL = 'search';
                    searchParams.ck12only = true;
                    tempParams.source = 'ck12';
                }

                if (tempParams.grade) {
                    isGradeParam = true;
                    temp = processFilterParams(url.search, '&grade=', 'gradeLevels.ext,');
                    searchParams.filters += temp.query + ';';
                    tempParams.grade = temp.filter;
                }

                if (tempParams.subject) {
                    isSubjectParam = true;
                    temp = processFilterParams(url.search, '&subject=', 'subjects.ext,');
                    searchParams.filters += temp.query.replace(/\-/g, ' ') + ';';
                    tempParams.subject = temp.filter;
                }

                searchParams.filters = searchParams.filters.split(';');
                searchParams.filters.pop();
                searchParams.filters = searchParams.filters.join(';');

                searchParams.filters = options.filter || searchParams.filters || tempParams.searchModalityGroups.length !== 0; // if no filters present send parameter as false
                temp = isSpecialSearch(searchTerm, isGradeParam, isSubjectParam);
                searchTerm = temp.query;
                if ('author' === temp.isSpecialSearch) {
                    searchParams.specialSearch = true;
                } else {
                    searchParams.specialSearch = temp.isSpecialSearch;
                }
                searchParams.pageSize = options.filter ? 0 : tempParams.pageSize;
                tempParams.searchTerm = (options.originalSearchString || searchTerm);
                tempParams.specialSearch = searchParams.specialSearch;
                searchTerm = unescape(encodeURIComponent(searchTerm)); // to convert unicode characters to UTF-8 characters [Bug #35305]
                if (!hideSpinner) {
                    util.showSpinner();
                }
                service.search(searchTerm, searchParams, searchTypes, searchURL).done(function (result) {
                    result = checkSearchResult(result);
                    if (result) {
                        tempParams.total = result.total;
                        _d.resolve(result);
                    } else {
                        alert('Sorry, we were not able to search for this query. Please try again later or contact our customer support.');
                        _d.reject();
                    }
                }).fail(function () {
                    alert('Sorry, we were not able to search for this query. Please try again later or contact our customer support.');
                    _d.reject();
                }).always(function() {
                    if (!hideSpinner) {
                        util.hideSpinner();
                    }
                });
                return _d.promise();
            };

            this.init = function (container) {
                util.ajaxStart();
                this.processURL({
                    'onload': true
                }).done(function (result) {
                    var href, source, originalSource;
                    searchADS(result.total, tempParams);
                 // When no source is specified, search in all available source if the results are zero
                    if (!result.total && !tempParams.url.search_params.source) {
                        href = tempParams.url.pathname + tempParams.url.search;
                        originalSource = tempParams.source;
                        source = tempParams.source === 'ck12' ? 'community' : 'ck12';
                        result = this.searchInAllSource(href, source);
                    }
                    $.when(loadViewEssentials(), result)
                    .done(function (view, result) {
                        if (!result.total && originalSource) {
                            tempParams.source = originalSource;
                        }
                        _c.view = new view(_c);
                        if (_c.checkForSuggestion({
                            'result': result,
                            'container': container
                        })
                        ) {
                            if ($.isEmptyObject(result.filters)) {
                                _c.view.init(container, result, tempParams);
                                this.getResultsCount().done(_c.view.renderFilters);
                            } else {
                                addCounts(result.filters, tempParams);
                                _c.view.init(container, result, tempParams);
                            }
                            util.ajaxStop();
                        }
                    } .bind(this));
                } .bind(this));
            };

            this.searchInAllSource = function (href, source) {
                var _d = $.Deferred();
                
                this.processURL({
                    'href': href + '&source=' + source
                })
                .then(function (results) {
                    if (!results.total) {
                        switch (source) {
                        case 'ck12':
                            this.searchInAllSource(href, 'community').then(_d.resolve, _d.reject);
                        case 'community':
                            if ($('header').data('user')) {
                                this.searchInAllSource(href, 'my').then(_d.resolve, _d.reject);
                            } else {
                                _d.resolve(results); // "User is not logged in!"
                            }
                            break;
                        case 'my': 
                            _d.resolve(results);
                            break;
                        default: // case 'ck12'
                            this.searchInAllSource(href, 'ck12').then(_d.resolve, _d.reject);
                        }
                    } else {
                        _d.resolve(results);
                    }
                } .bind(this), _d.reject);
                
                return _d.promise();
            };
           
            /**
            * This method checks to see if we there are any search results, if not
            * it looks for suggestions returned in the API and makes another API call 
            * to get the results for suggestion.
            */ 
            this.checkForSuggestion = function (options) {
                var searchString, result = options.result;
                // check for actual results OR specialMatches in API response.
                // if we have something, no need to perform another API search based 
                // on the suggestions. 
                if ( (result.result instanceof Array && result.result.length) || (result.specialMatches && result.specialMatches.length)) {
                    return true;
                }
                searchString = tempParams.searchString.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
                // make sure we have the suggestions from API, before we proceed to another call
                if (!result.suggestions ||
                    !result.suggestions[searchString] ||
                    !(result.suggestions[searchString] instanceof Array) ||
                    searchString === result.suggestions[searchString][0]) {

                    return true;
                }
                //finally if reached here, we need to make new search API call with suggested search string
                this.processURL({
                    'href': tempParams.url.href.replace('q=' + searchString, 'q=' + result.suggestions[searchString][0]),
                    'originalSearchString': searchString
                }).done(function (suggestionResult) {
                    tempParams.suggestedTerm = result.suggestions[searchString][0];
                    tempParams.originalTerm = searchString;
                    if (options.hasOwnProperty('container')) {
                        if ($.isEmptyObject(result.filters)) {
                            _c.view.init(options.container, suggestionResult, tempParams);
                            this.getResultsCount().done(_c.view.renderFilters);
                        } else {
                            addCounts(result.filters, tempParams);
                            _c.view.init(options.container, suggestionResult, tempParams);
                        }
                        util.ajaxStop();
                    } else if (options.hasOwnProperty('promise') && options.promise.resolve instanceof Function) {
                        options.promise.resolve(suggestionResult, tempParams);
                    }
                } .bind(this));
                return false;
            };

            this.loadResults = function (options) {
                tempParams.suggestedTerm = '';
                tempParams.originalTerm = '';
                var _d = $.Deferred(),
                    retry = 'true';
                this.processURL({
                    'href': options.href
                }).done(function (result) {
                    searchADS(result.total, tempParams, retry);
                    pushSearchState(options);
                    if (_c.checkForSuggestion({
                            'result': result,
                            'promise': _d
                        })) {
                        delete tempParams.suggestedTerm;
                        _d.resolve(result, tempParams);
                    }
                }).fail(function () {
                    _d.reject();
                });
                return _d.promise();
            };

            this.processURLForSpecialSearch = function (query) {
                query = (query || '').toString();
                var index, specialSearchFields;
                try {
                    specialSearchFields = searchUtil.getSpecialSearchFields();
                    for (index = 0; index < specialSearchFields.mapping.length; index++) {
                        if (query.indexOf(specialSearchFields.mapping[index]) !== -1) {
                            query = query.replace(specialSearchFields.mapping[index], specialSearchFields.value[index]);
                        }
                    }
                    return encodeURIComponent(query);
                    // return escape(query);
                } catch (e) {
                    alert('Sorry, we were not able to search for this query. Please try again later or contact our customer support.');
                    return false;
                }
            };

            this.processModalityGroups = function (artifact) {
                var modalityType, modalityLabel, index, index2,
                    modalityGroups = {};
                modalityGroups.label = [];
                modalityGroups.value = [];
                modalityGroups.sequence = [];
                modalityGroups.icon = [];
                if (artifact.modalityCount) {
                    artifact = artifact.modalityCount;
                    for (modalityType in artifact) {
                        if (artifact.hasOwnProperty(modalityType)) {
                            modalityLabel = modality.getModalityType(modalityType).toLowerCase();
                            if (-1 === modalityGroups.label.indexOf(modalityLabel)) {
                                modalityGroups.label.push(modalityLabel);
                                modalityGroups.value.push(modality.getModalityClassName(modalityType));
                                modalityGroups.sequence.push(parseInt(modality.getModalitySequence(modalityType), 10));
                                modalityGroups.icon.push(modality.getModalityIcon(modalityLabel));
                            }
                        }
                    }
                    for (index = 0; index < modalityGroups.sequence.length; index++) {
                        for (index2 = index; index2 < modalityGroups.sequence.length; index2++) {
                            if (modalityGroups.sequence[index] > modalityGroups.sequence[index2]) {
                                modalityType = modalityGroups.sequence[index];
                                modalityGroups.sequence[index] = modalityGroups.sequence[index2];
                                modalityGroups.sequence[index2] = modalityType;

                                modalityType = modalityGroups.label[index];
                                modalityGroups.label[index] = modalityGroups.label[index2];
                                modalityGroups.label[index2] = modalityType;

                                modalityType = modalityGroups.value[index];
                                modalityGroups.value[index] = modalityGroups.value[index2];
                                modalityGroups.value[index2] = modalityType;

                                modalityType = modalityGroups.icon[index];
                                modalityGroups.icon[index] = modalityGroups.icon[index2];
                                modalityGroups.icon[index2] = modalityType;
                            }
                        }
                    }
                }
                return modalityGroups;
            };

            this.getModalityIcon = function (artifactType) {
                try {
                    var icon = {};
                    icon.display = modality.getModalityType(artifactType);
                    icon.icon = modality.getModalityIcon(icon.display);
                    return icon;
                } catch (e) {
                    return '';
                }

            };

            this.getModalityCoverImage = function (artifactType) {
                try {
                    var coverImage = modality.getDefaultThumb(artifactType);
                    return coverImage ? '/media/images/' + coverImage : '';
                } catch (e) {
                    return '';
                }

            };

            this.getNextResults = function (options) {
                var _d = $.Deferred();
                tempParams = JSON.parse(JSON.stringify(tempParams));
                this.processURL(options).done(function (result) {
                    _d.resolve(result, tempParams);
                });
                return _d.promise();
            };

            this.searchOriginalTerm = function (options) {
                tempParams.suggestedTerm = '';
                tempParams.originalTerm = '';
                var _d = $.Deferred(),
                    href = new URL(tempParams.url.href).updateSearchParams(options);
                href = href.pathname + href.search;
                this.processURL({
                    'href': href
                }).done(function (result) {
                    pushSearchState({
                        'href': href
                    });
                    _d.resolve(result, tempParams);
                });
                return _d.promise();
            };

            this.searchHitADS = function (href) {
                searchHitADS(tempParams, href);
            };
            
            this.getResultsCount = function (options) {
                var _d = $.Deferred(),
                    defaults = {
                        onload: true,
                        filter: true
                    },
                    hideSpinner = true;
                options = $.extend(true, defaults, options);
                this.processURL(options, hideSpinner).done(function (result) {
                    addCounts(result.filters, tempParams);
                    _d.resolve(tempParams);
                });
                return _d.promise();
            }
            
            this.addCounts = addCounts

        };
        return new SearchController();
    });
