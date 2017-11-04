/* globals $:false */

define([
    'conceptmap/search/search.service',
    'conceptmap/search/search.helpers',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.shortnames',
    'conceptmap/graph/graph.helpers'
], function(SearchService, searchHelpers, elements, data, animation,shortnames, helpers){
    'use strict';

    function create(args){
        var $searchElement = args.$searchElement,
            $searchForm    = args.$searchForm,
            $searchIcon    = args.$searchIcon,
            $loadingIcon   = $searchForm.find('.concept__search-loading-icon');

        var selectedConcept,
            prevConcept,
            prevKey;

        var SEARCH_DELAY = 250;

        var currentResults,
            currentSearchTitles;

        currentResults = currentSearchTitles = [];

        var isSearching = false;

        /////////////
        // Methods //
        /////////////

        function updateSearchTitles(results){
            currentSearchTitles = results.map(function(item){
                return item.name.toLowerCase();
            });
        }

        function getTitles(){
            var currentVal = $searchElement.val();
            return {
                currentVal: currentVal,
                currentSearchText: searchHelpers.lowerCase(currentVal),
                currentTitle: searchHelpers.lowerCase(
                    searchHelpers.getConceptTitle(selectedConcept)
                ),
                prevTitle: searchHelpers.lowerCase(
                    searchHelpers.getConceptTitle(prevConcept)
                )
            };
        }

        function isNewSearch(a){
            if(!a.currentSearchText){ return false; }
            return a.currentSearchText !== a.currentTitle && searchHelpers.contains(currentSearchTitles, a.currentSearchText);
        }

        function isSameSearch(a, ui){
            if(ui && ui.item && ui.item.value){
                return a.prevTitle === ui.item.value.toLowerCase();
            }
            if(!a.prevTitle || !a.currentSearchText){ return false; }
            return a.prevTitle === a.currentSearchText;
        }

        function setPrevConcept(concept) {
            concept = searchHelpers.syncApiData(
                searchHelpers.getConcept(concept)
            );
            prevConcept = concept;
            return concept;
        }

        function setSelectedConcept(concept){
            selectedConcept = concept;
        }

        function isCurrentlySearching(){
            return isSearching;
        }

        function setPrevKey(key) {
            prevKey = key;
        }

        function getPrevKey(){
            return prevKey;
        }

        function getCurrentResults(){
            return currentResults;
        }

        function getCurrentSearchTitles() {
            return currentSearchTitles;
        }

        ////////////
        // States //
        ////////////

        function disableSearch(){
            $searchIcon.off('click');
            $searchElement.attr('disabled', 'disabled');
        }

        function enableSearch(){
            $searchIcon.on('click', iconClick);
            $searchElement.attr('disabled', null);
        }

        function closeAutocomplete() {
            if(!elements.$contentWrapper.hasClass('zeroState')){
                $searchElement.autocomplete('close');
            }
        }

        function hideLoader(){
            $loadingIcon.addClass('hide');
        }

        function showLoader(){
            $loadingIcon.removeClass('hide');
        }

        ////////////
        // Events //
        ////////////

        function iconClick(){
            $searchElement.trigger('keyup.search', {search: true});
        }

        //////////
        // Data //
        //////////

        function renderSearchResults(request, response, cache) {
            var query = (request.term || '').trim();
            if (query) {
                if (cache.hasOwnProperty(query)) {
                    return handleData(cache[query], response);
                }

                isSearching = true;
                showLoader();

                SearchService.initAutoComplete(query)
                    .done(function (_data) {
                        handleData(_data, response, {
                            cache: cache,
                            query: query
                        });
                    }).fail(function () {
                        console.log('error in searching for hints.');
                    }).complete(function () {
                        hideLoader();
                        isSearching = false;
                    });
            }
        }

        function removeEmptyHits(results){
            if(!(results instanceof Array)){ results = []; }
            return results.filter(function(result){
                var dataResult = data.subjects[result.encodedID],
                    related = helpers.getRelated(dataResult);

                return dataResult && related && related.length;
            });
        }

        function handleData(_data, response, args){
            var hits = _data.response.Artifacts.result;
            currentResults = removeEmptyHits(hits);
            updateSearchTitles(currentResults);
            if(!currentResults.length){ return; }
            if(args) { args.cache[args.query] = _data; }
            response(currentResults);
            isSearching = false;
        }

        //////////////////
        // Autocomplete //
        //////////////////

        function bindAutocomplete() {
            var cache = {};

            $searchElement.autocomplete({
                source: function (request, response) {
                    renderSearchResults(request, response, cache);
                },
                search: function(){
                    isSearching = true;
                },
                select: args.onSelect,
                focus: function (event, ui) {
                    selectedConcept = ui;
                    ui.item.value = ui.item.term;
                    $('.li-focus').removeClass('li-focus');
                    $('.li-active-class').removeClass('li-active-class');
                    $('.ui-state-focus').parent('li').addClass('li-focus');
                    $('.ui-state-focus').add('.ui-state-hover').parent('li').addClass('li-active-class');
                },
                open: function(event, ui){
                    $(this).attr('data-is-open', true);
                },
                close: function(event, ui){
                    $(this).attr('data-is-open', false);
                },
                delay: SEARCH_DELAY
            });

            if ($searchElement.data()) {
                $.each($searchElement, function (index, item) {
                    var autoCompleteItem = $(item).data('ui-autocomplete') || $(item).data('autocomplete');

                    autoCompleteItem._renderItem = function (ul, item) {
                        var escapedTerm = searchHelpers.escapeSpecialCharacters(this.term),
                            pattern     = new RegExp('(\\b' + escapedTerm + '|^' + escapedTerm + ')', 'i'),
                            term, branchName, branch;

                        ul.addClass($searchElement.data('autocompleteclass') || '');
                        term = item.name.replace(pattern, '<span style="font-weight:bold;">' + searchHelpers.capitalize(this.term) + '</span>');
                        branchName = shortnames[item.branch] ? shortnames[item.branch].name : item.branch;
                        branch = '<span class="autocomplete-branch"> - ' + branchName + '</span>';

                        return $('<li class="autocomplete-list autocomplete-list__conceptmap"></li>')
                            .data('item.autocomplete', item)
                            .append('<a class="autocomplete-link">' + decodeURIComponent(term) + branch + '</a>')
                            .appendTo(ul);
                    };

                    autoCompleteItem._resizeMenu = function() {
                        var ul = this.menu.element;
                        ul.outerWidth( $searchElement.outerWidth() );
                    };

                });
            }
        }

        function bindEvents(){
            $searchElement.on('keyup.search', args.onKeyUpSearch);

            $searchElement.on('click.search', function () {
                $('.ui-autocomplete').find('.li-active-class').removeClass('li-active-class');
            });

            $searchIcon.on('click', iconClick);
        }


        (function init() {
            $searchElement.filter(':visible').val('');
            bindEvents();
            bindAutocomplete();
        })();

        return {
            isSearching: isCurrentlySearching,
            isSameSearch: isSameSearch,
            isNewSearch: isNewSearch,
            getTitles: getTitles,

            close: closeAutocomplete,

            enable: enableSearch,
            disable: disableSearch,

            setConcept: setPrevConcept,
            setSelectedConcept: setSelectedConcept,
            setKey: setPrevKey,
            getKey: getPrevKey,

            getCurrentResults: getCurrentResults,
            getCurrentSearchTitles: getCurrentSearchTitles,

            delay: SEARCH_DELAY
        };
    }

    return {
        create: create
    };
});
