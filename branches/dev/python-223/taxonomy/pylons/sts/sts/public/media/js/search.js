function SearchView() {

    var searchElement,
    	selectedConcept;

    function fnFormatResult(displayLabel, currentValue) {
        var newLabel, pattern;
        pattern = new RegExp(currentValue, 'gi');
        newLabel = displayLabel.replace(pattern, '<strong>$&<\/strong>');
        return newLabel;
    }

    function renderSearchResults(request, response, cache) {
        request.term = (request.term || '').trim();
        if (request.term) {
            request.query = request.term;
            var query = request.term;
            delete request.term;
            if (cache.hasOwnProperty(query)) {
                response(JSON.parse(cache[query]).response.hits);
                return;
            }
            graph.searchService.initAutoComplete(query, $(searchElement).filter(':visible').siblings('.js-loading-icon')).done(function (data) {
                var i, results = JSON.parse(data).response.hits;
                if (results instanceof Array && results.length) {
                    for (i = 0; i < results.length; i++) {
                        results[i].value = fnFormatResult(results[i].title, query);
                    }
                }
                cache[query] = data;
                response(JSON.parse(data).response.hits);
            }).fail(function () {
                console.log('error in searching for hints.');
            });
        }
    }

    function bindAutocomplete() {
        var cache = {},
        	eId;
        $(searchElement).autocomplete({
            source: function (request, response) {
                renderSearchResults(request, response, cache);
            },
            select: function (event, ui) {
            	showGraph(ui);
            },
            focus: function (event, ui) {
            	selecetedConcept = ui;
                ui.item.value = ui.item.title;
                $('.li-focus').removeClass('li-focus');
                $('.li-active-class').removeClass('li-active-class');
                $('.ui-state-focus').parent('li').addClass('li-focus');
                $('.ui-state-focus').add('.ui-state-hover').parent('li').addClass('li-active-class');
            },
            delay: 500
        });
        if ($(searchElement).data()) {
            $.each($(searchElement), function (index, item) {
                var autoCompeleteItem = $(item).data('ui-autocomplete') || $(item).data('autocomplete');
                autoCompeleteItem._renderItem = function (ul, item) {
                    $(ul).addClass($(searchElement).data('autocompleteclass') || '');
                    var artifactType, term, regEx = new RegExp('^' + this.term);
                    term = item.encoded_title.replace(regEx, '<span style="font-weight:bold;color:Blue;">' + this.term + '</span>');
                    return $('<li class="autocomplete-list"></li>')
                        .data('item.autocomplete', item)
                        .append('<a class="autocomplete-link">' + decodeURIComponent(term) + '</a>')
                        .appendTo(ul);
                };
            });
        }
    }

    function bindEvents() {
        $(searchElement).off('keyup.search').on('keyup.search', function (e,ui) {
            if (e.keyCode === 13) {
            	showGraph(selectedConcept);
            }
        }).off('click.search').on('click.search', function () {
            $('.ui-autocomplete').find('.li-active-class').removeClass('li-active-class');
        });
        bindAutocomplete();
    }
    
    function showGraph(selectedConcept){
    	console.log(selectedConcept);
    	var eId = selectedConcept.item.encodedID;
    	$("body").addClass("graph-available");
    	$("#load-image").removeClass("hide");
    	setTimeout(function(){
    		graph.init(eId);
    		graph.update();
    	},500)
    }

    function init(element) {
        searchElement = element;
        $(searchElement).filter(':visible').val('');
        bindEvents(searchElement);
    }


    this.init = init;
}
