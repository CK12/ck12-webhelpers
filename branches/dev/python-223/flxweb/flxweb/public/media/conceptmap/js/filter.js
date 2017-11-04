/* globals $:false */

define([
    'exports',
    'conceptmap/graph/graph.initializer',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.notification',
    'conceptmap/graph/graph.logger',
    'conceptmap/graph/graph.transitions',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.ui'

], function(exports, initializer, data, notification, logger, transition, events, helpers, ui){
    'use strict';

    var filterClass       = 'filter',
        filterActiveClass = filterClass + '--is-active',
        filterButtonClass = filterClass + '__button';

    var $filter       = $('.' + filterClass + ':not(.mock)'),
        $filterButton = $filter.find('.' + filterButtonClass),
        $filterHolder = $filter.find('.' + filterClass + '__holder'),
        $radios       = $filter.find('input[type="radio"]'),
        filterButtonClasses = ['all', 'math', 'science'];

    var $prevRadio = $radios.first();

    var showTooltip = false;

/////////////
// States  //
/////////////

    function close(){
        setTimeout(function(){
            $filter.removeClass(filterActiveClass);
        }, 500);
    }

    function open(){
        $filter.addClass(filterActiveClass);
    }

    function disable(){
        $radios.attr('disabled', 'disabled');
    }

    function enable(){
        $radios.attr('disabled', null);
    }

    // Does not trigger change event. Use for changing UI only.
    function setFilter($radio){
        var cssClass = $radio.data('css-class');

        if(!$filterButton.hasClass(cssClass)){
            $filterButton.removeClass(filterButtonClasses.join(' '));
            $filterButton.addClass(cssClass);
        }

        $radio.prop('checked', true);
    }

    function previousState(){
        setFilter($prevRadio);
    }


/////////////
// Getters //
/////////////

    function currentFilter(){
        return $radios.filter(':checked');
    }

    function getFilterValue(){
        return currentFilter().val();
    }

    function getPreviousFilterValue(){
        return $prevRadio.val();
    }


//////////////
// Bindings //
//////////////

    $radios.on('change', function(){
        var $radio = $(this),
            nucleus = helpers.getCurrentNucleus();

        setFilter($radio);
        ui.disable();

        if (data.groups.length === 1) {
            transition.softRevert(nucleus, nucleus.index, function(){
                initializer.init(nucleus.EID);
                ui.enable();
            });
        } else {
            // Revert nodes and then transition using new filter
            transition.softRevert(nucleus, nucleus.index, function(){
                transition.expand(nucleus, nucleus.index, helpers.extend(
                    { isSameNucleus: true },
                    helpers.getData()
                ));
                ui.enable();
            });
        }

        logger.mainScreen('button', 'connection_' + $radio.data('css-class'));
        $prevRadio = $radio;
    });

    $filterButton.on('click', function(){
        $filter.toggleClass(filterActiveClass);
    });

//////////
// Init //
//////////

    function init(params){
        var $radio;

        if(params.filter && filterButtonClasses.indexOf(params.filter.toLowerCase()) > -1 ){
            $radio = $radios.filter(function(){
                return this.value.toLowerCase() === params.filter.toLowerCase();
            });

            if($radio.length){
                setFilter($radio);
            }
        }

        if(showTooltip) {
            var showEvent = new CustomEvent('showInitialFilterTooltip');
            document.dispatchEvent(showEvent);
            showTooltip = false;
        }

    }

    function set(arg){
        if(helpers.isEID(arg)){
            arg = helpers.getBranch(arg);
        }

        init({
            filter: arg
        });
    }

//////////
// Misc //
//////////

    function changeSubject(){
        var filterType = currentFilter().data('css-class'),
            otherType  = filterButtonClasses.filter(function(className){
                return className !== filterType && className !== 'all';
            })[0],
            $radio;

        open();
        $radio = $radios.filter('[data-css-class="' + otherType + '"]');
        $radio.trigger('change');
    }

//////////////
// Exports  //
//////////////

    exports.init = init;
    exports.set = set;
    exports.open = open;
    exports.close = close;
    exports.disable = disable;
    exports.enable = enable;
    exports.previousState = previousState;
    exports.currentValue = getFilterValue;
    exports.previousValue = getPreviousFilterValue;
    exports.changeSubject = changeSubject;
    exports.$filterHolder = $filterHolder;
});

