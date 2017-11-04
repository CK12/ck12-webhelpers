/* globals $:false */

define([
    'conceptmap/search/search.factory',
    'conceptmap/search/search.helpers',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.notification',
    'conceptmap/graph/graph.logger',
    'conceptmap/graph/graph.shortnames',
    'conceptmap/editor/editor.elements',
    'conceptmap/editor/editor.element.manager',
    'conceptmap/editor/editor.session.manager',
    'conceptmap/editor/editor.state.manager'
], function(SearchFactory, searchHelpers, helpers, animation, notification, logger, shortnames, editorElements, editorElementManager, editorSessionManager){
    'use strict';

    var $searchElement = $('#concept__search__input__editor'),
        $searchForm    = $searchElement.parent('form#concept__search__editor'),
        $searchIcon    = $searchForm.find('.concept__search-icon');

    var autocomplete;

////////////
// Events //
////////////

    function onKeyUpSearch(e, param) {
        var key = e.keyCode || e.which;
        // Enter press
        if(key === 13 || (param && param.search)) {
            if(!autocomplete.isSearching() && $searchElement.attr('data-is-open') === 'false'){
                return $searchElement.autocomplete('search');
            }

            var titles           = autocomplete.getTitles(),
                eids             = editorSessionManager.snapshot.getEIDs(),
                _selectedConcept = autocomplete.getCurrentResults().filter(function(result){
                    return result.name.toLowerCase() === titles.currentSearchText;
                }),
                currentNames     = helpers.getData('editor').dataset.groups[0].nodes.map(function(node){
                    return node.name.toLowerCase();
                });

            if(_selectedConcept.length){
                var concept = searchHelpers.syncApiData(
                    searchHelpers.getConcept(_selectedConcept[0])
                );
            }

            if(autocomplete.isSearching()){ return notificationRetrievingConcepts(); }

            if (autocomplete.isNewSearch(titles)) {
                if(concept && currentNames.indexOf(titles.currentSearchText) > -1){
                    notificationDuplicateNode(concept);
                } else if (_selectedConcept.length){
                    var selectedConcept = _selectedConcept[0];
                    autocomplete.setSelectedConcept(selectedConcept);
                    onValidSelect(selectedConcept);
                }
            } else {
                if(concept && eids.indexOf(concept.encodedID > -1)){
                    notificationDuplicateNode(concept);
                } else if(titles.currentSearchText) {
                    notificationInvalidConcept(titles);
                }
            }
        }
        autocomplete.setKey(key);
    }


    function onValidSelect(concept, eids){
        var _concept = autocomplete.setConcept(concept),
            eid      = _concept.encodedID;

        var eids = eids || editorSessionManager.snapshot.getEIDs();
        if(eids.indexOf(eid) > -1){
            return notificationDuplicateNode(_concept);
        }

        logger.search(eid, 'editor_screen');

        var element = editorElementManager.add(eid);
        editorSessionManager.add(element);

        onClose();
    }

    function onSelect(event, ui) {
        // Unbind search as enter presses will return false positives in some cases
        $searchElement.off('keyup.search');

        onValidSelect(ui);

        // Rebind search
        setTimeout(function(){
            $searchElement.on('keyup.search', onKeyUpSearch);
        }, 100);
        return false;
    }

    function onClose() {
        autocomplete.close();
        editorElements.search.call(animation.effects.fadeOutCompletely);
        $searchElement.val('');
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

    function notificationDuplicateNode(a){
        var branchName = shortnames[a.branch] ? shortnames[a.branch].name : a.branch;

        var bodyTextLine1 = '"' + a.title + ' - ' + branchName + '"' +
            ' is already on your map';

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

        editorElements.search
            .select('i.icon-close2').on('click', onClose);

        $searchElement.on('click', autocomplete.close);
    })();

    return {
        disable: autocomplete.disable,
        enable: autocomplete.enable,
        setConcept: autocomplete.setConcept,
        close: onClose
    };
});
