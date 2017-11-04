/* globals $:false */

define([
    'conceptmap/search/search.factory',
    'conceptmap/search/search.helpers',
    'conceptmap/graph/graph.initializer',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.notification',
    'conceptmap/graph/graph.logger',
    'conceptmap/graph/graph.shortnames',
    'conceptmap/graph/graph.helpers',
    'conceptmap/filter'
], function(SearchFactory, searchHelpers, initializer, elements, data, animation, notification, logger, shortnames, helpers, filter){
    'use strict';

    var $searchElement = $('#concept__search__input'),
        $searchForm    = $searchElement.parent('form#concept__search'),
        $searchIcon    = $searchForm.find('.concept__search-icon');

    var autocomplete;

    function exitZeroState(eid){
        elements.trendingSvg.selectAll('g.node')
            .call(animation.effects.fadeOut, 500)
            .attr('class', 'hide');

        elements.svg
            .attr('class', '');

        elements.trendingSvg
            .attr('opacity', 0)
            .transition().duration(500)
            .attr('class', 'hide');

        initializer.exitZeroState(eid);
    }

    function onKeyUpSearch(e, param) {
        var key = e.keyCode || e.which;
        // Enter press
        if(key === 13 || (param && param.search)) {
            var titles = autocomplete.getTitles();
            if(autocomplete.isSearching()){ return notificationRetrievingConcepts(); }

            if (autocomplete.isSameSearch(titles)){
                // Avoids showing a notification after loading a new map
                if(!searchHelpers.isArrowKey(autocomplete.getKey())){
                    notificationSameConcept(titles);
                }
            } else if (autocomplete.isNewSearch(titles)) {
                var selectedConcept = autocomplete.getCurrentResults().filter(function(result){
                    return result.name.toLowerCase() === titles.currentSearchText;
                })[0];

                autocomplete.setSelectedConcept(selectedConcept);

                onValidSelect(selectedConcept);
            } else {
                if(titles.currentSearchText) {
                    notificationInvalidConcept(titles);
                }
            }
        }
        autocomplete.setKey(key);
    }

    function onValidSelect(concept){
        var concept = autocomplete.setConcept(concept),
            eid     = concept.encodedID;

        if(elements.$contentWrapper.hasClass('zeroState')){
            exitZeroState(eid);
            logger.search(eid, 'landing_page');
        } else {
            initializer.init(eid);
            logger.search(eid, 'main_screen');
        }

        $searchElement.val('');
        autocomplete.close();
    }

    function onSelect(event, ui) {
        var titles = autocomplete.getTitles();
        if( autocomplete.isSameSearch(titles, ui) ){ return notificationSameConcept(); }

        // Unbind search as enter presses will return false positives in some cases
        $searchElement.off('keyup.search');

        onValidSelect(ui);

        // Rebind search
        setTimeout(function(){
            $searchElement.on('keyup.search', onKeyUpSearch);
        }, 100);
        return false;
    }

///////////////////
// Notifications //
///////////////////

    function notificationInvalidConcept(a){
        var bodyTextLine1, bodyTextLine2;

        bodyTextLine1 = 'We couldn\'t find any matches';

        if(a.currentVal.trim()){
            bodyTextLine1 += ' for "' + a.currentVal + '"';
        }
        bodyTextLine2 = 'Try a different search term';

        autocomplete.close();

        notification.create({
            body: '<p>' + bodyTextLine1 + '.</p>' +
                  '<p>' + bodyTextLine2 + '.</p>'
        });
    }

    function notificationSameConcept(a){
        a = a || {};
        var bodyTextLine1 = 'You are currently on ';

        bodyTextLine1 += (a.currentVal && a.currentVal.trim()) ? '"' + a.currentVal + '"' : 'this concept';

        autocomplete.close();

        notification.create({
            body: '<p>' + bodyTextLine1 + '.</p>'
        });
    }

    function notificationRetrievingConcepts(){
        notification.create({
            body: '<p>Loading...</p>',
            duration: autocomplete.delay
        });
    }

//////////
// Init //
//////////

    (function init() {
        autocomplete = SearchFactory.create({
            $searchElement: $searchElement,
            $searchForm: $searchForm,
            $searchIcon: $searchIcon,

            onKeyUpSearch: onKeyUpSearch,
            onSelect: onSelect
        });
    })();

    return {
        disable: autocomplete.disable,
        enable: autocomplete.enable,
        setConcept: autocomplete.setConcept
    };
});
