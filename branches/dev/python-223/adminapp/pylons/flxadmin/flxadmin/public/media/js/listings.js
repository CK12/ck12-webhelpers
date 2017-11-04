Listings = function(args){
  args = $.extend({
    sort: ',asc', // sortby, sortOrder
    defaultSortOrder: 'asc',
    filtersSep: ';',  // filters params separator
    searchSep: ';',  // search params separator
    idsStrSep: ',',  // separator for parsing and ids in search input
    enableMultipleIdsFilter: false, // set true if API supports id filters, and
      // want to enable multiple ids parsing on searchAll input
    searchFilters: [], // query strs for search via filters, Ie, the left side
      // of the comma for the filters query, eg. ['email'] -> filters=email,<val>
      // html ids are expected to be <vals>-filter, eg. id='email-filter',
      // html class are expected to include 'search-filer'
    ajaxRoot: '', // eg. CK12.admUrl('artifacts_list')
    formAjax: '', // url for selected item's form, eg. CK12.admUrl('user/profile/')
    updateUrlOnAjax: true, // revisit this
    actionFns: [],  // action generation functions
    addMailtos: false,  // if emails will be made mailto's
    centerPaginationToList: false, //true not good UX since it jumps around
    postLoad: null, // function to call after results loaded
    extraStyling: null, // function to apply extra styling
    updateHeaders: null, // function to update listing headers (once)
    viewmode: '', // 'pane' or 'full', but don't define it here
    isOverlay: false,
    updateFilterParamsFromUrl: false,
    updateSearchParamsFromUrl: false
  }, args);
  var wrapId = args.isOverlay? 'cboxContent' : '';

  onReady = function(){
    $('.sortable').parent().addClass('sorthead');

    if (location.search){
      var urlSearchParams = $.deparam(decodeURIComponent(location.search).slice(1,));
      if ("filters" in urlSearchParams)
      {
        var filters = urlSearchParams["filters"];
        if(typeof filters!="undefined" && filters.length > 0){
          filters = filters.split(";").join("&");
          filters = filters.split(",").join("=");
          filters = $.deparam(filters);
          for (var key in filters){
            if($("#"+String(key)).is(":checkbox") && String(filters[key]).toLowerCase()== "true" ) $("#"+String(key)).prop("checked", true);
          }
        }
      }
    }

    var
    wrap = wrapId? '#'+wrapId : '',
    params = $.deparam.querystring(args.params),
    idsStrSepPP = args.idsStrSep+' ',  // separator for pretty printing filter ids
    idsStrSepRE = new RegExp(args.idsStrSep+'\\s*'), // separator regex for parsing ids
    panesSel = wrap+' #panes',
    leftpaneSel = wrap+' #leftpane',
    theadSel = leftpaneSel+' .thead',
    tbodySel = leftpaneSel+' .tbody',
    rowsSel = tbodySel+' .tr',
    changemodeSel = wrap+' #viewmodes .changemode',
    $table = $(wrap+' .table'),
    $tbody = $(tbodySel),
    $filters = $(wrap+' .filter'),
    $searchAll = $(wrap+' #search'),
    $searchbys = $(wrap+' .searchby'),
    $searchboxes = $(wrap+' #search,'+wrap+' .searchby,'+wrap+' .search-filter'),
    $searchicon = $(wrap+' #admin_search_icon'),
    $resultmsg = $(wrap+' #resultmsg'),
    $sortheads = $(wrap+' .sorthead'),
    $sortindicators = $(wrap+' .sort-indicator'),
    $pagination = $(wrap+' #pagination'),
    $clearactions = $(wrap+' #clearactions'),
    $searchErrdiv = $('<div class="error"></div>'),
    $filterErrdiv = $(' <div class="error">Filters do not apply for Id search</div>'),
    $autorefresh = $(wrap+' #autorefresh'),
    $disableListOnEmptySearch = $(wrap+' #disableListOnEmptySearch'),
    $leftpane = $(wrap+' #leftpane'),
    $rightpane = $(wrap+' #rightpane'),
    $viewmodes = $(wrap+' #viewmodes'),
    selectedId = null,
    detailsWidth = 0,

    ajaxUrl = function(_params){
    // Returns ajax url for _params or params
      return $.param.querystring(args.ajaxRoot, _params||params);
    },

    updateWinUrl = function(_params){
    // Updates browser url
      if (args.updateUrlOnAjax && history && history.pushState){
        var isSearchInParams = true;
        if (!("search" in params)){ isSearchInParams = false; params.search = ""; }
        history.pushState(_params||params, '', 
          $.param.querystring(window.location.toString(), _params||params));
        if(!isSearchInParams) delete params.search;
      } 
    },

    updateParams = function(_params){
    // Update params variable by parsing DOM elms and from _params.
    // Currently _params overwrites params parsed from DOM 
      var 
        idsFilter = constructIDsFilterParam(),
        searchFilter = constructSearchFiltersParam();

      // from DOM elms
      params.filters = constructFiltersParam(idsFilter, searchFilter);
      params.search = constructSearchbyParam();
      params.searchAll = constructSearchAllParam(idsFilter);

      params.viewmode = $viewmodes.data('mode');

      // from extending _params
      $.extend(params, _params);
      if (!params.search) delete params.search; // api returns all if search is empty
      return params;
    },

    updateResult = function(urlOrParams, callback){
    // Updates result listing via ajax call.
    // urlOrParams is used for updating params, done via updateParams(),
    // If it's an url (not utilizing this yet), params is updated by $.deparam,  
    // else if it's a params var, call updateParams()
      var 
        isUrl = typeof(urlOrParams) == 'string',
        _params = isUrl? params : updateParams(urlOrParams),
        url = isUrl? urlOrParams : ajaxUrl(_params),
        hasSearchFilters = constructSearchFiltersParam().length,
        emptySearches = !params.searchAll && !params.search && !hasSearchFilters;
        
      updateWinUrl();
      
      if ($disableListOnEmptySearch.is(':checked') && emptySearches){
        updateList('', '');
        updateResultMsg(0);
        return;
      }
      $.ajax({url: url,
        success: function(data) {
          var
            $data = $($.trim(data)),
            $list = $data.filter('.tr'),
            $pagi = $data.filter('.pagination');

          updateList($list, $pagi);
          updateResultMsg($list.length);
          if (!args.isOverlay) closeViewer($list);
          if (callback) callback();
          indicateSort();
          updateResultLinks();
          if (args.postLoad) args.postLoad(url, _params);
          styleResult();
          if (args.extraStyling) args.extraStyling();
          if (!args.isOverlay) setWidth();
          highlightSelected();
        }
      });
    },

    updateList = function($list, $pagi){
      $tbody.html($list);
      $pagination.html($pagi);
      $table.toggleClass('hide', $list.length===0);
    },

    updateResultLinks = function(){
      $.each(args.actionFns, function(i, f){ f(); }); // insert action links

      if (args.addMailtos){
        $(rowsSel).each(function(i, row){
          var 
            $elm = $(row).find('.mailto'),
            txt = $elm.text();
          $elm.html(Fns.htmla('mailto:'+txt, txt));
        });
      }
    },

    styleResult = function(){
      if (args.centerPaginationToList){
        $pagination.width($table.width());
      }
    },

    indicateSort = function($sortcol, sortorder){
      var sort = params.sort || args.sort;
      if (sort){
        var
          sortby = sort.split(',')[0],
          $paneSortcol = $(theadSel+' .paneview').find('#'+sortby.replace('.','\\.')).parent(),
          $fullSortcol = $(theadSel+' .fullview').find('#'+sortby.replace('.','\\.')).parent(),
          sortorder = sort.split(',')[1],
          iPane = $paneSortcol.index() + 1,
          iFull = $fullSortcol.index() + 1;
          
        $sortindicators.addClass('hide');
        $paneSortcol.find('.sort-indicator').removeClass('asc desc hide').addClass(sortorder);
        $fullSortcol.find('.sort-indicator').removeClass('asc desc hide').addClass(sortorder);
        $(rowsSel+'.paneview .td:nth-child('+iPane+')').addClass('sorted');
        $(rowsSel+':not(.paneview) .td:nth-child('+iFull+')').addClass('sorted');
      }
    },

    newSortOrder = function(order){
      return order=='asc'? 'desc' : 'asc'; 
    },

    isFiltering = function(){
      return _.reduce($filters, function(mem, elm){
        return mem || ($(elm).find('option:selected').val()
                    != $(elm).find('option:first').val());
        }, false);
    },

    updateResultMsg = function(nRows){
      var 
        resultMsg = '',
        queryMsg  = '',
        queryMsg_filters = '',
        queryMsg_searches = '',
        searchtxt = $searchAll.val(),
        filters = params.filters? params.filters.split(args.filtersSep) : [],
        filtering = isFiltering(),
        clear_actions = '',
        needComma = false,
        hasSearchbys = false,
        idSearched = Number(searchtxt) || (constructIDsFilterParam() && searchtxt);

      // filter msg
      if (filtering){
        $filters.find('option:selected').each(function(i, sel){
          var txt = sel.text;
          if (txt != 'All' && txt != 'None' && !txt.match(/---+/)){
            queryMsg_filters += needComma? ', '+txt : txt;
            needComma = true;
          }
        });
      }
      // search msg
      $searchbys.each(function(i, elm){
        var 
          $elm = $(elm),
          txt = $elm.val()? $.trim($elm.val()) : '',
          label = $elm.parent().find('label').text(),
          displaytxt = label+' '+txt;
        if (txt) {
          queryMsg_searches += hasSearchbys? ', '+ displaytxt: displaytxt;
          hasSearchbys = true;
        }
      });
      // error msgs
      if (hasSearchbys && searchtxt){
        var 
          label = $searchbys.parent().find('label').text() || 'field specific',
          searchbyMsg = $searchbys.length==1? label : 'field specific';
        $searchErrdiv.text('Search does not apply for '+searchbyMsg+' search');
        $searchErrdiv.show();
      }
      else if (searchtxt){
        if (idSearched && !hasSearchbys){ 
          queryMsg_searches = 'Id '+ idSearched;
          if (filters.length && !args.enableMultipleIdsFilter){
            $filterErrdiv.show();
          }
        }else{
          queryMsg_searches = searchtxt;
          $filterErrdiv.hide();
        }
      }
      if (!hasSearchbys || !searchtxt) $searchErrdiv.hide();
      if (hasSearchbys || !idSearched || !filters.length) $filterErrdiv.hide();

      // resultMsg logic
      if ((queryMsg_searches || filtering) && nRows > 0){
        resultMsg = 'Showing results for ';
      }else if ((queryMsg_searches || filtering) && nRows < 1){
        resultMsg = 'No results for ';
      }else if (nRows < 1){
        resultMsg = 'No results found';
      }

      // queryMsg logic
      if (idSearched && !args.enableMultipleIdsFilter){ 
        queryMsg = queryMsg_searches;
      }else if (queryMsg_searches && filtering){
        queryMsg = queryMsg_searches +', filtering '+ queryMsg_filters;
      }else{
        queryMsg = queryMsg_searches + queryMsg_filters;
      }

      // clear actions
      if (filtering) {
        clear_actions += "<div class='clearaction clearfilters'>[x] Clear Filters</div>";
      }
      if (queryMsg_searches || hasSearches()) {
        var es = (searchtxt && hasSearchbys)? 'es' : '';
        clear_actions += "<div class='clearaction clearsearch'>[x] Clear Search"+es+"</div>";
      }

      $resultmsg.text(resultMsg+queryMsg);
      $clearactions.html(clear_actions);
    },

    hasSearches = function(){
      return _.any($searchboxes, function(elm){
        return $.trim($(elm).val());
      });
    },

    initErrDivs = function(){
      var
        searchOffset = $searchAll.offset(),
        filterOffset = $(wrap+' #filters').offset();
        
      if (searchOffset) $searchAll.before($searchErrdiv.css({
        position: 'absolute', top: 0, left: searchOffset.left-77
      }).hide());
      if (filterOffset) $('#filters').before($filterErrdiv.css({
        position: 'relative', top: 0, left: filterOffset.left-30
      }).hide());
    },

    constructFiltersParam = function(idsFilterStr, searchFilterStr){
    // Returns filters param str from filters selected and ids/searchFilterStr
      var filters = [], filtersStr = '';
      
      $filters.each(function(i, elm){
        var 
          className = $(elm).context.className,
          filterStr = $(elm).children('option:selected').val(),
          filterValPair = filterStr && filterStr.split(',');

        if($(elm).is(":checkbox")) 
        {
          var filterStr = $(elm).val(),
          filterStrParam = filterStr.split(',')[0]; 
          if($(elm).is(":checked"))
          {
            var filterStr = filterStrParam + "," + "True";
          }
          else
          {
            var filterStr = filterStrParam + "," + "False";
          }
          var filterValPair = filterStr && filterStr.split(',');
        }

        if (className.indexOf('multisel') < 0 && filterValPair.length > 1 && filterValPair[1] != ''){
          filters.push(filterStr);
        }
        /*
          Multi select drop-down events
        */
        else if(className.indexOf('multisel') >= 0){
          // If the selected option is a heading then deselect it and select the sibling options
    	  $(".multisel optgroup option[value*='selSiblings']").click(function(e){
    	    $(this).removeAttr('selected').siblings().attr('selected','selected');
    	  });
    	  // If 'All' is selected then deselect each optgroup heading and select the sibling options
    	  $($('.multisel').children()[0]).off("click").on("click",function(){
    		  $(".multisel optgroup option:not([value*='selSiblings'])").attr('selected','selected');
    	  });
    	  
       	  // Append th selected options value into filters
    	  $(this).find("option:selected").each(function(){
    		  filters.push($(this).val());
    	  });
        }

      });
      
      if (idsFilterStr)    filters.push(idsFilterStr);
      if (searchFilterStr) filters.push(searchFilterStr);
      return filters.join(args.filtersSep);
    },

    constructSearchbyParam = function(){
    // Returns param string for all searchby input vals
      var searchbys = [];
      $searchbys.each(function(i, elm){
        var 
          $elm = $(elm),
          id = $elm.attr('id'),
          val = $elm.val()? $.trim($elm.val()) : '';
        if (val) searchbys.push(id+','+val);
      });
      return searchbys.join(args.searchSep);
    },

    constructSearchAllParam = function(idsFilter){
    // Returns main search input str if not isIDsFilter
      if (idsFilter) return '';
      else return $searchAll.val()? $.trim($searchAll.val()) : '';
    },

    constructIDsFilterParam = function(){
    // Returns IDs filter params str from main search input
      if (!args.enableMultipleIdsFilter) return '';
      var 
        searchVal = $.trim($searchAll.val()),
        ids = searchVal? searchVal.split(idsStrSepRE) : [],
        idsFilters = _.map(ids, function(id){
          return 'id,'+id;
        }),
        isIDsFilter = _.reduce(ids, function(mem, id){
          return mem && Number(id);
        }, true);
      return isIDsFilter? idsFilters.join(args.filtersSep) : '';
    },

    constructSearchFiltersParam = function(){
    // Returns filter params str from search input (API does search via filters)
      var filterStrs = [];
      $(args.searchFilters).each(function(i, q){
        var searchStr = $.trim($(wrap+' #'+q+'-filter').val());
        if (searchStr)
          filterStrs.push(q +','+ searchStr);
      })
      return filterStrs.join(args.filtersSep);
    },

    updateSearchAndFilterInputs = function(){
    // Update search input(s)' text on initial page load
      var 
        searchbyParams = params.search? params.search.split(args.searchSep):[],
        filterParams = params.filters? params.filters.split(args.filtersSep):[],
        idParams = _.filter(filterParams, function(a_comma_b){
            var pair = a_comma_b.split(',');
            return pair.length > 1 && pair[0]=='id' && pair[1]; 
        }),
        ids = _.map(idParams, function(a_comma_b){
            return a_comma_b.split(',')[1];
        }),
        idsStr = ids.join(idsStrSepPP);

      // update searchby's and search filters
      $.each(searchbyParams, function(i, a_comma_b){
        var 
          elmId = a_comma_b.split(',')[0],
          val = a_comma_b.split(',')[1],
          filterElm = $('#'+elmId+'-filter'), 
          $elm = filterElm.length? filterElm : $('#'+elmId); 
        $elm.val(val);
      });

      // update filters
      $.each(filterParams, function(i, a_comma_b){
        var $found = $('option[value="'+a_comma_b+'"]');
        if ($found.size())
          $found.attr('selected', 'selected')
      });
      // update main search (IDs filter search takes precedence over params.searchAll)
      $searchAll.val(idsStr || params.searchAll);
    },

    clearSearchInputs = function(_params){
      $searchboxes.each(function(i, elm){
        $(elm).val('');
      });
    },

    closeViewer = function(rows){
      // Close viewer if no rows passed or if none of rows passed is selected
      var close = !rows || !_.any(rows, function(row){ 
        return $(row).find('.viewtrigger').data('id')==selectedId;
      });
      if (close){
        $rightpane.html('');
        selectedId = null;
        $('.td').removeClass('active');
      }
    },

    highlightSelected = function(id){
      id = id || selectedId;
      if (!id) return;
      var row = _.find($(rowsSel), function(row){
        return $(row).find('.viewtrigger').data('id')==id;
      });
      $('.td').removeClass('active');
      $(row).children().addClass('active');
    },

    setViewMode = function(mode, init){
      var oldmode = $viewmodes.data('mode');
      if (init){
        $(changemodeSel+'.'+mode).addClass('active');
      } else{
        $(changemodeSel).toggleClass('active');
        $rightpane.toggleClass('hide', mode=='full');
        if (mode != oldmode) $(leftpaneSel+' .tr').toggleClass('hide');
      }
      if (mode != oldmode){
        $viewmodes.data('mode', mode);
        setWidth();
      }
    },

    setWidth = function(){
      var viewmode = $viewmodes.data('mode'),
      maxLeftWd = viewmode=='pane'? 450 : '';
      $leftpane.css('max-width', maxLeftWd);

      detailsWidth = Math.max($rightpane.width(), detailsWidth);
      var extra = 60, //some artifacts like id 1100497 on gamma expands wider
      // once loaded, setWidth() after it loads didn't help, so using extra here.
      leftWd = (viewmode=='full' || !args.viewmode)? $leftpane.width() : 
        _.reduce($(theadSel+' .tr.paneview .td'), function(mem, td){
          return mem + $(td).width();
        }, 0)+extra, 
      totWd = leftWd + detailsWidth + extra,
      maxFullViewWd = 1250,
      maxWd = (totWd > maxFullViewWd) && viewmode!='pane'? maxFullViewWd: totWd;
        
      // set real width if actual width is > preset width (when a single word is too long)
      if (leftWd > $leftpane.width()) 
        $leftpane.css('max-width', leftWd);
      $(panesSel).width(maxWd);
    },

    submitForm = function(e, name, val){
      if (Fns.set_question_options)
        Fns.set_question_options();
      var url = args.formAjax+selectedId,
      xtraParam = (name && val)? '&'+name+'='+encodeURIComponent(val) : '',
      data = $("#mainform").serialize()+'&viewmode=pane'+xtraParam;

      $.post(url, data, function(d){
        updateResult();
        $rightpane.html(d);
      });
      e.preventDefault();
    },

    onPageLoad = function(){
      if (args.updateHeaders) args.updateHeaders();
      initErrDivs();
      if (args.updateFilterParamsFromUrl) params.filters = $.deparam(location.search.slice(1,))["filters"];
      if (args.updateSearchParamsFromUrl) params.search = $.deparam(location.search.slice(1,))["search"];
      updateSearchAndFilterInputs();
      setViewMode(args.viewmode || 'full', true);
      updateResult({sort: args.sort});
    };
    onPageLoad();
    window.updateListingsResult = updateResult;


    // Handlers

    // Auto Refresh page
    $autorefresh.change(function(){
      Fns.updateResult = updateResult;
      var interval = Number($(this).val());
      if (Poll) clearInterval(Poll);
      if (interval) Poll = setInterval("Fns.updateResult()", interval);
    });

    // Sort handlers
    $sortheads.click(function(){
      var
        _sortby = params.sort.split(',')[0],
        _sortOrder = params.sort.split(',')[1],
        $sortcol = $(this),
        sortby = $sortcol.children().attr('id'),
        sortOrder = sortby==_sortby? newSortOrder(_sortOrder) : args.defaultSortOrder;
      updateResult({sort: sortby+','+sortOrder});
    });

    // Filter change handlers
    $filters.change(function(event){
      // Give some time to reflect the change of selection(selected options) and then proceed
      setTimeout(function () {
    	  updateResult({page: 1});
      }, 1);
    });

    // Search enter handlers
    $searchboxes.keyup(function(e){
      if (Fns.isEnterKey(e)) 
        updateResult({page: 1});
    }); 

    $searchicon.click(function(){
      updateResult({page: 1});
    });

    $disableListOnEmptySearch.change(function(){
      if (!params.searchAll && !params.search)
        updateResult({page: 1});
    });

    // Pagination handlers
    $pagination.on('click', wrap+' .pager_link', function(){
      updateResult({page: $(this).text()});
      $rightpane.html('');
      return false;
    });
      
    // Clear Filter/Search handlers
    $clearactions
    .on('click', wrap+' .clearsearch', function(){
      delete params.search;
      clearSearchInputs();
      updateResult({page: 1});
    })
    .on('click', wrap+' .clearfilters', function(){
      var updateResults = false;
      $filters.each(function(i, elm){
        var fval = $(elm).find('option:first').val();
        $(elm).val(fval); // filters.change() calls updateResult()
        updateResults = true;
      });
      if (updateResults){
          updateResult({page: 1});
      }
        
    });

    // Pane view handlers
    if (!args.isOverlay){
      $('#content')

      // Select Item
      .on('click', 'a.paneview', function(e){
        var $this = $(this),
        parent = $this.parent(),
        dataDiv = parent.data('id')? parent : $this.parentsUntil('.td.viewtrigger').parent();

        $('.td').removeClass('active');
        closeViewer();
        selectedId = dataDiv.data('id');
        $.get($this.attr('href'), function(data){
          if ($viewmodes.data('mode') != 'pane') setViewMode('pane');
          $rightpane.html(data);
          setWidth();
          highlightSelected();
        });
        e.preventDefault();
      })

      // Cancel 
      .on('click', '.cancelbtn', function(){
        closeViewer();
      })

      // Form ajax actions
      .on('click', '#mainform .actionitem', function(){
        updateResult();
      })

      // Select View mode
      .on('click', changemodeSel, function(e){
        var $this = $(this);

        if ($this.hasClass('active')) return false;
        setViewMode($this.data('viewmode'));
      });

      // Form submit 
      if (args.formAjax){
        $('#content')
        .on('click', '.primaryaction', function(e){ 
          var btn = $(this);
          submitForm(e, btn.attr('name'), btn.val());
        })
        .on('submit', '#mainform', function(e){ 
          if ($(this).hasClass('clickonly')) return false;
          submitForm(e); 
        });
      }
    };
  }

  args.isOverlay? $.elementReady(wrapId, onReady) : $(document).ready(onReady);
};