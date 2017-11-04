define([
    'jquery',
    'cache/cdn_cache',
    'load_wait',
    'study-guides/app/vendor',
    'jquery-ui'
],
function ($, CDNCache) {
    /**
     * @namespace ajax
     */
    var callbacks = $.Callbacks('unique stopOnFalse'),
        specialAgent = (/SpecialAgent/i).test(window.navigator.userAgent)
        STANDARDS = {},
        STANDARDS_LABELS = [],
        API = {
            'STUDY_GUIDES': '/flx/browse/minimal/studyguide/{{branchCode}}.?format=json&termAsPrefix=true&ck12only=true&pageNum={{pageNum}}&pageSize={{pageSize}}&termTypes=domainIDs',
            'STANDARDS': '/flx/get/branch/standards?set=CCSS&branch={{branchCode}}&format=json&nocache=true',
            'SEARCH': "/flx/search/direct/modality/minimal/studyguide/{{searchStr}}?pageNum={{pageNum}}&specialSearch=false&filters=false&ck12only=true&pageSize={{pageSize}}&includeEIDs=1&format=json",
            'SUGGEST': "/flx/search/hints/studyguide/title/{{title}}?pageSize=10"
        };
    
    String.prototype.toHyphenCase = function () { return this.toLowerCase().replace(/\s+/g, '-') };
    String.prototype.toCapitalCase = function () { return this.toLowerCase().replace(/\b\w/g, function (m) { return m.toUpperCase() }) };
    
    
    var main = document.querySelector('main'),
        coverHtml,
        backUrl,
        b,
        scrollX=0,
        thumbnailCollection,
        searchClick,
        scrollContainer,
        sideNav,
        conceptsArray = [],
        backClick,
        isHistory = false,
        replaceHistory = true,
        $window = $(window),
        windowWidth = window.innerWidth,
        availWidth = windowWidth - 40;
    
    var subjects = ["Math", "Science"],
        mathsBranchOrder = ["Arithmetic","Measurement","Algebra","Geometry","Probability","Statistics","Trigonometry","Analysis","Calculus"],
        sciBranchOrder = ["Earth Science","Life Science","Physical Science","Biology","Chemistry","Physics"],
        elMathBranchOrder = ["Elementary Math Grade 1","Elementary Math Grade 2","Elementary Math Grade 3","Elementary Math Grade 4","Elementary Math Grade 5"],
        allBranchOrder = [].concat(mathsBranchOrder, sciBranchOrder, elMathBranchOrder),
        mathsBranchCode = ["MAT.ARI","MAT.MEA","MAT.ALG","MAT.GEO","MAT.PRB","MAT.STA","MAT.TRG","MAT.ALY","MAT.CAL"],
        sciBranchCode = ["SCI.ESC","SCI.LSC","SCI.PSC","SCI.BIO","SCI.CHE","SCI.PHY"],
        elMathBranchCode = ["MAT.EM1","MAT.EM2","MAT.EM3","MAT.EM4","MAT.EM5"],
        allBranchCode = [].concat(mathsBranchCode, sciBranchCode, elMathBranchCode),
        myBranchCode = [],
        uriParts = parseUri(window.location.href),
        currentBranchCode = uriParts['directory'].match(/\/([^\/]+)\/$/)[1],
        currentBranchName,
        currentSubjectName,
        defaultMathBranch = "MAT.CAL", defaultMathBranchIdx = mathsBranchCode.indexOf(defaultMathBranch),
        defaultSciBranch = "SCI.CHE", defaultSciBranchIdx = sciBranchCode.indexOf(defaultSciBranch),
        defaultElMathBranch = "MAT.EM1", defaultElMathBranchIdx = 0,
        $searchResultWrapper,
        $searchResultCont,
        eleMathTab,
        allStandards = { },
        stdCB = $.Callbacks('unique stopOnFalse'),
        pageNum = 1,
        pageSize,
        loadMore = true,
        loadingMargin = 100;

    pageSize = specialAgent ? 300 : Math.floor((window.innerHeight * window.innerWidth) / (300 * 300));
    pageSize = pageSize < 5 ? 5 : pageSize;
    
    if (currentBranchCode === 'study-guides') {
        currentBranchCode = uriParts['queryKey']['subject'];
    }
    if (currentBranchCode) {
        currentBranchCode = getBranchCode(currentBranchCode);
        myBranchCode.push(currentBranchCode);
        currentBranchName =    getBranch(currentBranchCode),
        currentSubjectName = getSubjectName(currentBranchCode);
        setPageTitle(currentBranchName, currentSubjectName);
    }
    
    var responseText = main.innerHTML;
    
//    require(['text!study-guides/html/cover.html'], function(responseText){
        coverHtml = responseText.replace(/@@apihost@@/g, apihost) .
        replace(/@@back@@/g, encodeURIComponent('//' + browsehost + '/study-guides/'));
        main.innerHTML = coverHtml;
        
        Loader.gradually(80, 5);
        
        backClick = document.getElementsByClassName('back-button')[0];
        if(uriParts["queryKey"]["backUrl"]){
            backClick.href = goBack();
        } else{
            backClick.style.display = "none";
        }
        
        searchClick = document.getElementsByClassName('search-field')[0];
        searchClick.addEventListener('click',doNothing,false);
        searchClick.addEventListener('touchstart',doNothing,false);
        searchClick.addEventListener('keyup',searchItem,false);

//        document.getElementsByClassName('search-icon')[0].addEventListener('click',expandSearch,false);
//        document.getElementsByClassName('close-search')[0].addEventListener('click',collapseSearch,false);
        
        document.getElementsByClassName('left-scroll')[0].addEventListener('click',scrollLeft,false);
        document.getElementsByClassName('right-scroll')[0].addEventListener('click',scrollRight,false);
        
        scrollContainer = document.getElementsByClassName('main-container')[0];
        
        $searchResultWrapper = $("#searchResultWrapper");
        $searchResultCont = $("#searchResultContainer");
        
        window.addEventListener("popstate", function(){
            var URLKeys = parseUri(window.location.href),
                branchCode = URLKeys['directory'].match(/\/([^\/]+)\/$/)[1];
            if(branchCode){
                isHistory = true;
                branchCode = getBranchCode(branchCode);
                showCurrentBranch(branchCode);
                showMyBranches();
            }
        });
        
        handleActions();
//      setBranch();
        document.getElementsByClassName('close-modal')[0].addEventListener('click',closeIframe,false);
        
        loadBranches();
//      if (currentBranchCode && isNotElementary(currentBranchCode)) {
//          showCurrentBranch(currentBranchCode);
//      }
//    });
    
    function handleActions () {
        
        // Double tap causes iPad to scroll page.
        $('body').on('dblclick.scroll', function (event) {
            event.preventDefault();
            event.stopPropagation();
        });
        
        var listenToScroll = true,
            loadingGif = $('.loading-gif'),
            searchField = $(".search-field"),
            searchResults = $('#searchResultWrapper');
        
        if (!specialAgent)
        $window.on('scroll.loadMore', function () {
            var scrollElement = window.document.scrollingElement || window.document.body;
                scrollHeight = scrollElement.scrollHeight,
                scrolledHeight = window.innerHeight + scrollElement.scrollTop;
                toScroll = Math.max(0, scrollHeight - scrolledHeight);
            if (listenToScroll && loadMore && toScroll < 500) {
                listenToScroll = false;
                loadingGif.removeClass('hide');
                pageNum += 1;
                if (searchResults.is(':visible')) {
                    getSearchResult(searchField.val().trim(), callback);
                } else {
                    load(callback);
                }
            }
        })
        
        .on('resize.nav', function () {
            availWidth = window.innerWidth - 40;
            showArrow(myBranchCode.length, $('.branch-scroll').offset().left);
        });
        
        function callback () {
            listenToScroll = true;
            loadingGif.addClass('hide');
        }
        
        $.widget('custom.autosuggest', $.ui.autocomplete, {
            _resizeMenu: function () {
                this.menu.element.outerWidth( searchClick.clientWidth );
            },
            _renderItem: function (ul, item) {
                return $('<li class="suggestion ui-menu-item">')
                        .append('<a class="sugg-link">' + item.label + '</a>')
                        .appendTo(ul);
            }
        });
        var widget = $(searchClick).autosuggest({
            delay: 300,
            source: function (input, suggest) {
                var result, pattern;
                cdn(API.SUGGEST.replace(/{{title}}/g, input.term)).then(function (resp) {
                    if (resp.responseHeader.status === 0) {
                        pattern = new RegExp(input.term, 'gi'),
                        result = resp.response.hits.map(function (hit) {
                            return {
                                label: hit.title.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(pattern, '<span class="highlight">$&<\/span>'),
                                value: hit.title
                            }
                        });
                        suggest(result);
                    } else {
                        suggest([]);
                    }
                }, function () {
                    suggest([]);
                });
            },
            select: function (ev, ui) {
                $searchResultWrapper.removeClass("hide");
                loadingGif.removeClass('hide');
                $(".focused").removeClass("focused");
                $(scrollContainer).addClass("hide");
                $(".search-field").blur();
                $searchResultCont.empty();
                loadMore = true;
                pageNum = 1;
                getSearchResult(ui.item.value, function () {
                    loadingGif.addClass('hide');
                });
            }
        });
        
        $('.close-search').on('click.clear', function () {
            $('#searchResultWrapper').addClass('hide');
            $('.search-field').val('')
            $('#main-container').removeClass('hide');
            $(this).addClass('hide');
            refreshBranch();
            if (history && history.pushState) {
                var pageUrl =  window.location.pathname + window.location.search;
                pageUrlNoSearch = pageUrl.replace(/[\&\?]search=[^\&]*/, '');
                if (pageUrl !== pageUrlNoSearch) {
                    history.pushState({}, document.title, pageUrlNoSearch);
                }
            }
        });
    }
    
    function isNotElementary (code) {
        return elMathBranchCode.indexOf(code) === -1;
    }
    
    function loadBranches () {
        var my_branches;
        
        my_branches = myBranchCode = ['MAT.ALG', 'MAT.GEO', 'SCI.ESC', 'SCI.BIO', 'SCI.PHY'];

        if (my_branches && my_branches.join()) {
            my_branches = my_branches.filter(function (item) {
                return isNotElementary(item);
            });
//          if (my_branches.indexOf(currentBranchCode) !== -1) {
//              my_branches.splice(my_branches.indexOf(currentBranchCode), 1);
//          }
//          myBranchCode = myBranchCode.concat(my_branches);
            setBranch(my_branches);
            showArrow(myBranchCode.length, 0);
            
            Loader.gradually(100, 2);
            if (!currentBranchCode) {
                currentBranchCode = my_branches[0];
            }
            showCurrentBranch(currentBranchCode);
        } else {
            Loader.set(100);
        }
    }
    
    function cdn (url) {
        var _d, cdnCache;
        
        _d = $.Deferred();
        cdnCache = new CDNCache({
            'url': url,
            'dataType': 'json',
            'success': _d.resolve,
            'error': _d.reject
        });
        cdnCache
            .setExpirationAge(specialAgent ? 'weekly' : 'daily')
            .fetch();
        return _d.promise();
    }
    
    function load (callback) {
        var branchCode = currentBranchCode,
            promises = [],
            xhr;
        if(isNotElementary(branchCode)){
            xhr = cdn(API.STUDY_GUIDES.replace(/{{branchCode}}/g, branchCode).replace(/{{pageNum}}/g, pageNum).replace(/{{pageSize}}/g, pageSize));
            promises.push(xhr);
            if (allStandards[branchCode]) {
                promises.push( [allStandards[branchCode]] );
            } else {
                xhr = cdn(API.STANDARDS.replace(/{{branchCode}}/g, branchCode));
                promises.push(xhr);
            }
            $.when.apply($, promises).done(function (response1, response2) {
                var responseData = response1[0],
                    subject = branchCode.substr(0, 3);
                createSimCards(responseData, subject, branchCode, response2[0]);
                $(".branch-name[data-branchcode='"+branchCode+"']").removeClass("disabled");
                if (!allStandards[branchCode]) {
                    allStandards[branchCode] = response2[0];
                }
                loadMore = (responseData.response.limit + responseData.response.offset) < responseData.response.total;
                if ($.isFunction(callback)) callback();
            });
        } else {
            if ($.isFunction(callback)) callback();
        }
    }
    
    function getSubjectName(branchCode){
        var i;
        for(i=0;i<subjects.length;i++){
            if(subjects[i].toUpperCase().indexOf(branchCode.slice(0,branchCode.indexOf('.')))>-1){
                return subjects[i];
            }
        }
        return "Math";
    }
    
    function setPageTitle(branch, subject){
        if(branch && subject){
            document.title = branch + " | "+ subject +" | CK-12 Study Guides";
        }
    }
    
    function showCurrentBranch(currentBranchCode){
        slideToBranch(currentBranchCode);
        if(currentBranchCode){
            var subjectName = getSubjectName(currentBranchCode), 
                branchName = getBranch(currentBranchCode);
            setPageTitle(branchName, subjectName);
            $('.my-branches-row').removeClass('hide');
            document.querySelector('[data-branchcode="'+currentBranchCode+'"]').click();
        }
    }
    
    function checkIncomingUrl(){
        var queryString=[],conceptsPassed=[];
        if (queryString.length == 0) {
            if (window.location.search.split('?').length > 1) {
                var params = window.location.search.split('?')[1].split('&');
                for (var i = 0; i < params.length; i++) {
                    var key = params[i].split('=')[0];
                    var value = params[i].split('=')[1];
                    queryString[key] = value;
                }
            }
        }
        if (queryString["backUrl"] != null) {
            backUrl = queryString["backUrl"];
            $(".back-button").removeClass("hide");
            document.getElementsByClassName('back-button')[0].href = backUrl;
        }
        if (queryString["s"] != null) {
            if (queryString["s"].toLowerCase() == "science") {
                document.getElementsByClassName('science')[0].click();
            }
        }
        if (queryString["b"] != null) {
            b = queryString["b"];
            var fullBranch = b.split("%20");
            b = fullBranch[0];
            for (var j = 1; j < fullBranch.length; j++) {
                b += " "+fullBranch[j];
            }
            for(var arrayLength = 0; arrayLength<mathsBranchArray.length; arrayLength++){
                var branch = mathsBranchArray[arrayLength];
                if(b.toLowerCase() == branch.toLowerCase()){
                    document.getElementsByClassName('maths-branch')[0].childNodes[arrayLength].click();
                }
            }
            for(var arrayLength = 0; arrayLength<scienceBranchArray.length; arrayLength++){
                var branch = scienceBranchArray[arrayLength];
                if(b.toLowerCase() == branch.toLowerCase()){
                    document.getElementsByClassName('science')[0].click();
                    document.getElementsByClassName('science-branch')[0].childNodes[arrayLength].click();
                }
            }
        }
        
        if(window.innerWidth < 1280){
            $(".right-scroll").removeClass("no-display");
        }
        
    }
    
    function createSimCards(data,subject,branchCode,std){
        var arr = [];
        if(-1 === branchCode.indexOf("MAT.EM")){
            arr = data["response"][branchCode+"."] ;
        }else{
            arr = data["response"][branchCode] ;
        }
        for(var simCount = 0; simCount<arr.length; simCount++){
            createIthCard(data,subject,simCount,branchCode,std);
        }
    }
    function showConcepts(e){
        e.currentTarget.parentElement.parentElement.parentElement.childNodes[2].classList.add('hide-back');
        e.currentTarget.parentElement.parentElement.parentElement.childNodes[1].classList.remove('hide-back');
    }
    
    function showStandards(e){
        e.currentTarget.parentElement.parentElement.parentElement.childNodes[1].classList.add('hide-back');
        e.currentTarget.parentElement.parentElement.parentElement.childNodes[2].classList.remove('hide-back');
    }
    
    var lastSimStdShowed,lastSimStd;
    function showStdDesc(e){
        e.preventDefault();
        e.stopPropagation();
        if(lastSimStdShowed){
            lastSimStdShowed.classList.add('hide');
            lastSimStd.style.fontWeight = 'normal';
        }
        
        lastSimStdShowed = e.currentTarget.parentElement.parentElement.childNodes[3];
        lastSimStdShowed.classList.remove('hide');
        lastSimStdShowed.innerHTML = e.currentTarget.refValue;
        
        lastSimStd = e.currentTarget;
        lastSimStd.style.fontWeight = 'bold';
    }
    function hideStdDesc(e){
        e.preventDefault();
        e.stopPropagation();
        if(lastSimStdShowed){
            lastSimStdShowed.classList.add('hide');
            lastSimStd.style.fontWeight = 'normal';
        }
    }
    function showCovers(e){
        var  isTabType ;
        
        e.preventDefault();
        e.stopPropagation();
        for(var i=0;i<2;i++){
            e.currentTarget.parentElement.parentElement.childNodes[i].childNodes[0].childNodes[0].classList.remove('sim-covers-focused');
        }
        e.currentTarget.childNodes[0].classList.add('sim-covers-focused');
        
        if(e.target.innerHTML.indexOf('STANDARDS') > -1){
            isTabType = "standards" ;
            e.currentTarget.parentElement.parentElement.parentElement.childNodes[1].classList.add('hide-back');
            e.currentTarget.parentElement.parentElement.parentElement.childNodes[2].classList.remove('hide-back');
        }else if(e.target.innerHTML.indexOf('CONCEPTS') > -1){
            isTabType = "concept" ;
            e.currentTarget.parentElement.parentElement.parentElement.childNodes[2].classList.add('hide-back');
            e.currentTarget.parentElement.parentElement.parentElement.childNodes[1].classList.remove('hide-back');
        }
    }
    function createIthCard(data,subject,simCount,branchCode,standards){
        var branchCodeClass = branchCode,
            elMath = true;
        if(-1 === branchCode.indexOf("MAT.EM")){
            branchCodeClass = branchCode+".";
            elMath = false;
        }
        
        var conceptCounter,
            foundationGrid = data["response"][branchCodeClass][simCount].foundationGrid,
            internalTagGrid = data["response"][branchCodeClass][simCount].internalTagGrid,
            useForOnboarding = internalTagGrid[0] && internalTagGrid[0].indexOf('plix-onboarding') !== -1,
            conceptBranch,
            standardConcepts,
            standardDesc,
            standardIds = [],
            standardLabels = [],
            conceptIds = [],
            card = document.createElement("a"),
            id,
            artifactID = data["response"][branchCodeClass][simCount].id;
        
        thumbnailCollection = document.querySelector('.my-branches-row');
        $(card).addClass("thumbnail-view "+branchCodeClass+ " thumbnail-view"+simCount);
        id = branchCode.substring(4,7);
        card.setAttribute("id",id+"-"+simCount);
        thumbnailCollection.appendChild(card);
        var cardImageDiv = document.createElement("div"),
            cardImageInnerDiv = document.createElement("div");
        $(cardImageDiv).addClass("tile-image");
        $(cardImageInnerDiv).addClass("inner-div");
        var cardImage = document.createElement("img");
        cardImage.setAttribute("src", '/media/study-guides/assets/images/loader.gif');
        $(cardImage).addClass("image-element");
        cardImageDiv.appendChild(cardImageInnerDiv);
        cardImageInnerDiv.appendChild(cardImage);
        card.appendChild(cardImageDiv);
        // Use coverImageSatelliteUrl when available instead of coverImage
        var imgSrc;
        if (data["response"][branchCodeClass][simCount].coverImageSatelliteUrl) {
            imgSrc = data["response"][branchCodeClass][simCount].coverImageSatelliteUrl;
        } else if (data["response"][branchCodeClass][simCount].coverImage) {
            imgSrc = '//' + window.apihost + '/' + data["response"][branchCodeClass][simCount].coverImage;
        }
        if (imgSrc) {
            cardImage.setAttribute("src", imgSrc.replace(/(COVER_PAGE)/g, '$1_THUMB_POSTCARD_TINY'));
        } else {
            if (subject === "MAT") {
                cardImage.setAttribute("src", '/media/study-guides/assets/images/math.png');
            } else {
                cardImage.setAttribute("src", '/media/study-guides/assets/images/science.png');
            }
        }
        var cardImageName = document.createElement("div");
        cardImageName.classList.add('tile-image-name');
        card.appendChild(cardImageName);

        var simName = document.createElement("h2"),
            title = data["response"][branchCodeClass][simCount].title,
            domainName = data["response"][branchCodeClass][simCount].domain.name;
        
/*        if(title){
            title = title.split(":");
            title = title[1] || title[0];
        }*/
        simName.classList.add('sim-title');
        cardImageName.appendChild(simName);
        if (domainName !== title) {
            simName.innerHTML = domainName + ": " + title;
            cardImage.setAttribute("alt", domainName + ": " + title + " thumbnail");
            card.setAttribute("title", domainName + ": " + title);
        } else {
            simName.innerHTML = title;
            cardImage.setAttribute("alt", title + " thumbnail");
            card.setAttribute("title", title);
        }
        
        var simTitleEllipsis = document.createElement("span");
        $(simTitleEllipsis).addClass("sim-title-ellipsis");
        cardImageName.appendChild(simTitleEllipsis);
        simTitleEllipsis.innerHTML = "...";
        
        var simDesc = document.createElement("div");
        $(simDesc).addClass("sim-desc");
        card.appendChild(simDesc);
        simDesc.addEventListener('click',hideStdDesc,false);
        
        // editing
        
        var simCovers = document.createElement("div");
        simCovers.classList.add('sim-covers-desc');
        simDesc.appendChild(simCovers);
        
        var simConceptsCover = document.createElement("div");
        simConceptsCover.classList.add('sim-covers');
        simCovers.appendChild(simConceptsCover);

        var simConcepts = document.createElement("div");
        simConcepts.classList.add('sim-covers-concepts');
        simConcepts.classList.add('dxtrack-user-action');
        simConceptsCover.appendChild(simConcepts);
        simConcepts.innerHTML = "<span class='sim-info sim-covers-focused'>CONCEPTS</span>";
        simConcepts.addEventListener('click',showCovers,false);
        var dexterAttr = document.createAttribute("data-dx-desc");
        dexterAttr.value = "study_guides_browse_concepts_tab";
        simConcepts.setAttributeNode(dexterAttr);
        var aIDAttr = document.createAttribute("data-dx-artifactID");
        aIDAttr.value = ""+artifactID;
        simConcepts.setAttributeNode(aIDAttr);
        
        var simStandardsCover = document.createElement("div");
        simStandardsCover.classList.add('sim-covers');
        simCovers.appendChild(simStandardsCover);
        
        var simStandards = document.createElement("div");
        simStandards.classList.add('sim-covers-standards');
        simStandards.classList.add('dxtrack-user-action');
        simStandardsCover.appendChild(simStandards);
        simStandards.innerHTML = "<span class='sim-info'>STANDARDS</span>";
        simStandards.addEventListener('click',showCovers,false);
        dexterAttr = document.createAttribute("data-dx-desc");
        dexterAttr.value = "study_guides_browse_standards_tab";
        simStandards.setAttributeNode(dexterAttr);
        aIDAttr = document.createAttribute("data-dx-artifactID");
        aIDAttr.value = ""+artifactID;
        simStandards.setAttributeNode(aIDAttr);
        
        var simConceptsTags = document.createElement("div");
        simConceptsTags.classList.add('sim-covers-tags');
        simDesc.appendChild(simConceptsTags);

        var simStandardsTags = document.createElement("div");
        simStandardsTags.classList.add('sim-covers-tags');
        simStandardsTags.classList.add('sim-covers-tags-s');
        simDesc.appendChild(simStandardsTags);

        var simStdDescView = document.createElement("div");
        simStdDescView.classList.add('sim-std-desc-view');
        simStdDescView.classList.add('hide');
        simDesc.appendChild(simStdDescView);
        
        // editing ends
        
        var simConceptsCont = document.createElement("div");
        $(simConceptsCont).addClass("sim-concept-container hide");
        simDesc.appendChild(simConceptsCont);
/*        
        var simConceptEllipsis = document.createElement("span");
        $(simConceptEllipsis).addClass('sim-concept-ellipsis');
        simConceptsCont.appendChild(simConceptEllipsis);
        simConceptEllipsis.innerHTML = "...";
        
        var simConceptEllipsis = document.createElement("span");
        $(simConceptEllipsis).addClass('sim-concept-ellipsis');
        simConceptsTags.appendChild(simConceptEllipsis);
        simConceptEllipsis.innerHTML = "...";
*/        
        if(standards){
            standardConcepts = standards.response.concepts;
            standardDesc = standards.response.standards;
        }
        for(conceptCounter = 0; conceptCounter < foundationGrid.length; conceptCounter++){
            var simConceptName = document.createElement("a");
            var conceptName = foundationGrid[conceptCounter][1],
                conceptId = foundationGrid[conceptCounter][2],
                stds;
            if(-1 !== conceptId.indexOf(branchCode)){
                
                if(simConceptsTags.lastChild && 'A' === simConceptsTags.lastChild.nodeName){
                    var simConceptSeperator = document.createElement("span");
                    simConceptsTags.appendChild(simConceptSeperator);
                    simConceptSeperator.innerHTML = ",";
                }
                simConceptsTags.appendChild(simConceptName);
                simConceptName.setAttribute("title", conceptName);
                simConceptName.setAttribute("class", "dxtrack-user-action");
                simConceptName.setAttribute("data-dx-desc", "study_guides_browse_concept_click");
                simConceptName.setAttribute("data-dx-artifactID", artifactID);
                simConceptName.innerHTML = " "+conceptName;
                conceptBranch = getBranch(foundationGrid[conceptCounter][2]);
                conceptIds.push(conceptId);
                // editing 
                stds = standardConcepts[conceptId] && standardConcepts[conceptId].standards || [] ;
                stds.forEach(function(sId){
                    if(-1 === standardIds.indexOf(sId)){
                        standardIds.push(sId);
                    }
                });
                if(standardIds.length>0){
                    for(var simStandardCount = 0; simStandardCount<standardIds.length; simStandardCount++){
                        var stdId = standardIds[simStandardCount] ,
                            stdLabel = standardDesc[stdId].label,
                            simStandardName = document.createElement("a");
                        if(-1 === standardLabels.indexOf(stdLabel)){
                            
                            
                            if(standardLabels.length){
                                simStandardName.innerHTML = " "+stdLabel;
                                
                                var simStandardSeperator = document.createElement("span");
                                simStandardsTags.appendChild(simStandardSeperator);
                                simStandardSeperator.innerHTML = ",";
                            }
                            else{
                                simStandardName.innerHTML = " "+stdLabel;
                            }
                            simStandardName.setAttribute("class", "dxtrack-user-action");
                            simStandardName.setAttribute("data-dx-desc", "study_guides_browse_standard_click");
                            simStandardName.setAttribute("data-dx-artifactID", artifactID);
                            simStandardsTags.appendChild(simStandardName);
                            simStandardName.refValue = standardDesc[stdId].description;
                            
                            simStandardName.addEventListener('click',showStdDesc,false);
                            
                            STANDARDS_LABELS.push(stdLabel.toLocaleLowerCase());
                            standardLabels.push(stdLabel);
                        }
                    }
                }
                else{
                    simStandardsCover.classList.add('hide-back');
                }
                simStandardsTags.classList.add('hide-back');
                // editing
                if (conceptBranch) {
                    simConceptName.setAttribute("href", "//" + window.apihost + "/" +conceptBranch.toLowerCase().replace(/\s+/g, '-')+"/"+foundationGrid[conceptCounter][3]+"/");
                    simConceptName.setAttribute("data-embed-href", "//" + window.apihost + "/embed/?referrer=concept_details#module=concept&handle="+foundationGrid[conceptCounter][3]+"&branch="+conceptBranch.toLowerCase()+"&nochrome=true&filters=text,multimedia");
                    simConceptName.addEventListener('click',openConceptIframe,false);
                }
            }
            
        }
        conceptIds.sort(function(a,b){
            var c;
            a = parseFloat(a,10);
            b = parseFloat(b,10);
            c = (a<b)?-1:1;
            return c;
        });
        var lastIndexOfHypen = data["response"][branchCodeClass][simCount].handle.lastIndexOf("-") + 1,
        handleLength = data["response"][branchCodeClass][simCount].handle.length,
        questionId = data["response"][branchCodeClass][simCount].handle.substring(lastIndexOfHypen,handleLength),
        perma = data.response[branchCodeClass][simCount].perma,
        domain = data.response[branchCodeClass][simCount].domain.handle;
        
        var uriComponents = parseUri(window.location.href);
        var queryKey = uriComponents.queryKey,
            secondaryParam = "";
        if(Object.keys(queryKey).length !== 0){
            for(key in queryKey){
                if(queryKey.hasOwnProperty(key) && key !== "subject"){
                    secondaryParam = secondaryParam + "&"+key+"="+queryKey[key];
                }
            }
            secondaryParam = secondaryParam.replace(/&/, '?');
        }
        
        if (useForOnboarding) {
            $(card).addClass('js-for-onboarding');
        }
        
        var itemUrl = getModalityUrl(data.response[branchCodeClass][simCount]);
        var href = "//" + window.apihost + itemUrl;
        card.setAttribute("href", href);
        
        showEllipsis(card);
    }
    
    function showEllipsis(childNode){
        var simTitleCont = childNode.getElementsByClassName("tile-image-name");
            simTitle = childNode.getElementsByClassName("sim-title");
            simTitleEllipsis = childNode.getElementsByClassName("sim-title-ellipsis"),
            simConcept = childNode.getElementsByClassName("sim-desc")[0].childNodes[1];
//          simConceptEllipsis = childNode.getElementsByClassName("sim-concept-ellipsis");
        
        $(simTitle).removeClass("ellipsis-height");
//      $(simConcept).removeClass("ellipsis-height");
        if(simTitle[0].clientHeight > 64){
            $(simTitleEllipsis).removeClass("hide");
            $(simTitle).addClass("ellipsis-height");
        }
        else{
            $(simTitleEllipsis).addClass("hide");
        }
/*      if(simConcept.clientHeight > 68){
            $(simConceptEllipsis).removeClass("hide");
            $(simConcept).addClass("ellipsis-height");
        }
        else{
            $(simConceptEllipsis).addClass("hide");
        }*/
    }
    
    function getBranch (conceptId) {
        var id = conceptId.substring(0,7),
            index,
            branch;
        
        index = allBranchCode.indexOf(id);
        branch = allBranchOrder[index];
        
        return branch;
    }
    
    var mathsBranchArray=[],scienceBranchArray=[],branchName,branchCode,mathsFirstBranch=true,scienceFirstBranch=true;
    function setBranchName(data,subject,conceptName){
        var presentBranch=false;
        for(var eidsConceptCount = 0; eidsConceptCount<data["response"][subject].length; eidsConceptCount++){
            if(conceptName == data["response"][subject][eidsConceptCount]["domain"].name){
                branchName = data["response"][subject][eidsConceptCount]["domain"]["branchInfo"].name;
                branchCode = data["response"][subject][eidsConceptCount]["domain"]["branchInfo"].branch;
            }
        }
        
        if(subject == "MAT."){
            for(var arrayLength = 0; arrayLength<mathsBranchArray.length; arrayLength++){
                if(mathsBranchArray[arrayLength]==branchName){
                    presentBranch = true;
                }
            }
            if(mathsFirstBranch || !presentBranch){
                mathsBranchArray.push(branchName);
                mathsFirstBranch = false;
            }
        }
        else{
            for(var arrayLength = 0; arrayLength<scienceBranchArray.length; arrayLength++){
                if(scienceBranchArray[arrayLength]==branchName){
                    presentBranch = true;
                }
            }
            if(scienceFirstBranch || !presentBranch){
                scienceBranchArray.push(branchName);
                scienceFirstBranch = false;
            }
        }
    }
    
    function setBranch (branchCode) {
        var href, arrayLength = 0, branchName, branch,
            branchCode = branchCode || myBranchCode;
            for( ; arrayLength < branchCode.length; arrayLength += 1) {
                if (!isNotElementary(branchCode[arrayLength])) continue;
                branch = getBranchName( branchCode[arrayLength] );
                branchName = document.createElement("a");
                href = getHref(branchCode[arrayLength]);
                branchName.setAttribute("href", href);
                $(branchName).addClass('branch-name not-loaded');
                branchName.setAttribute("data-branchCode", branchCode[arrayLength]);
                branchName.innerHTML = branch;
                branchName.setAttribute("title", branchName.innerHTML);
                document.querySelector('.interested-branches').appendChild(branchName);
                branchName.addEventListener('click',showBranch,false);
            }
    }
    
    var lastFocusedBranch;
    function showBranch(e){
        var subject,
            index,
            cardContainer,
            allChildNode = [],
            childNode,
            thumbnail,
            childCounter,
            simTitleCont,
            simTitle,
            simTitleEllipsis,
            URIComponents,
            searchPara = "",
            searchPath,
            branch,
            callback,
            noPlix,
            queryKey;
        
        e.preventDefault();
        e.stopPropagation();
        
        branch = $(e.currentTarget);
        
        if(branch.hasClass("disabled") || branch.hasClass("focused-branch")){
            return true;
        }
        currentBranchCode = e.currentTarget.getAttribute("data-branchCode");
        if (history && history.pushState && !isHistory) {
            URIComponents = parseUri(window.location.href);
            searchPath = URIComponents.directory;
            queryKey = URIComponents.queryKey;
            if (/\/study-guides\/$/.test(searchPath)) {
                searchPath += getBranchName(currentBranchCode).toHyphenCase() + '/';
            } else {
                searchPath = searchPath.replace(/\/[^\/]+\/$/, '/' + getBranchName(currentBranchCode).toHyphenCase() + '/');
            }
            if(Object.keys(queryKey).length !== 0){
                for(key in queryKey){
                    if(queryKey.hasOwnProperty(key)){
                        if(searchPara !== ""){
                            searchPara = searchPara + "&";
                        }
                        if(key !== "subject"){
                            searchPara = searchPara + key + "=" + queryKey[key];
                        }
                        else{
                            searchPara = searchPara + key + "=" + getBranchName(currentBranchCode).toHyphenCase();
                        }
                    }
                }
                searchPara = '?' + searchPara;
            }
            searchPara = searchPath + URIComponents.file + searchPara;
            if (searchPara !== (window.location.pathname + window.location.search)) {
                if(replaceHistory){
                    history.replaceState({}, document.title, searchPara);
                } else{
                    history.pushState({}, document.title, searchPara);
                }
            }
        }
        replaceHistory = false;
        isHistory = false;
        loadMore = true;
        pageNum = 1;
        
        Wait.defer();
        
        noPlix = $('.no-plix').detach();
        cardContainer = $('.my-branches-row').empty();
        
        load(function () {
            noPlix.toggleClass('hide', !cardContainer.is(':empty'))
            .appendTo(cardContainer);
            Wait.hide();
        });
        if(lastFocusedBranch && lastFocusedBranch.length){
            lastFocusedBranch.removeClass('focused-branch');
            lastFocusedBranch.html(lastFocusedBranch.text());
        }
        branch.addClass("focused-branch");
        lastFocusedBranch = branch;
        branch.html("<h1>"+branch.text()+"</h1>");
        setPageTitle(getBranch(currentBranchCode), getSubjectName(currentBranchCode));
    }
    
    function refreshBranch () {
        var noPlix,
            cardContainer;
            
        loadMore = true;
        pageNum = 1;
        Wait.defer();
        
        noPlix = $('.no-plix').detach();
        cardContainer = $('.my-branches-row').empty();
        
        load(function () {
            noPlix.toggleClass('hide', !cardContainer.is(':empty'))
            .appendTo(cardContainer);
            Wait.hide();
        });
    }
    
    function openConceptIframe(e){
        e.stopPropagation();
        e.preventDefault();
        $(".main-container").addClass("no-scroll freeze");
        openIframe(e);
    }
    
    function openIframe(e){
        $(".modal-window").removeClass("hide");
        document.getElementsByClassName('i-frame')[0].setAttribute("src",e.currentTarget.getAttribute("data-embed-href"));
    }

    function closeIframe(){
        $(".modal-window").addClass("hide");
        $(".main-container").removeClass("no-scroll freeze");
        document.getElementsByClassName('i-frame')[0].setAttribute("src","");
    }
    function showAllStandardsOrConcepts(str){
        str = str.toLocaleLowerCase();
        var std = false,
            nodes = $(".sim-desc"),
            label,
            totalLabels = STANDARDS_LABELS.length;

        for(label = 0; label < totalLabels ; label += 1){
            if(-1 !== STANDARDS_LABELS[label].indexOf(str)){
                std = true;
                break;
            }
        }
        if(std){
            // show standards tab
            nodes.each(function(){
                var noStd = true;
                $(this).children().each(function(index){
                    if(0 === index){
                        $(this).children().each(function(i){
                            if(0 === i){
                                if($(this).next(0).hasClass("hide-back")){
                                    noStd = true;
                                }else{
                                    noStd = false;
                                }
                                if(!noStd){
                                    $(this).find(".sim-info").removeClass("sim-covers-focused");    
                                }
                            }else if(1 === i){
                                if(!noStd){
                                    $(this).find(".sim-info").addClass("sim-covers-focused");
                                }
                            }
                        });
                    }else if(1 === index){
                        if(!noStd){
                            $(this).addClass("hide-back");    
                        }
                        
                    }else if(2 === index){
                        if(!noStd){
                            $(this).removeClass("hide-back");
                        }
                        
                    }
                });
            });
        }else{
            // show concepts tab
            nodes.each(function(){
                $(this).children().each(function(index){
                    if(0 === index){
                        $(this).children().each(function(i){
                            if(0 === i){
                                $(this).find(".sim-info").addClass("sim-covers-focused");
                            }else if(1 === i){
                                $(this).find(".sim-info").removeClass("sim-covers-focused");
                            }
                        });
                    }else if(1 === index){
                        $(this).removeClass("hide-back");
                    }else if(2 === index){
                        $(this).addClass("hide-back");
                    }
                });
            });
        }
    }
    function searchItem(e){
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code === 13) { //Enter keycode
            $searchResultCont.empty();
            if($(".search-field").val().trim()){
                $searchResultWrapper.removeClass("hide");
                $(scrollContainer).addClass("hide");
                $(".focused").removeClass("focused");
                $(".search-field").blur();
                getSearchResult($(".search-field").val().trim());
            }
        }
    }
    
    function scrollLeft(e){
        e.stopPropagation();
        scrollX = scrollX + 145;
        scrollX = Math.min(scrollX, 0);
        $(".left-scroll").removeClass("no-display");
        if(scrollX === 0){
            $(".left-scroll").addClass("no-display");
        }
        document.getElementsByClassName('branch-scroll')[0].style.left = scrollX+"px";
        $(".right-scroll").removeClass("no-display");
    }

    function scrollRight(e){
        var arrayLength, diff;
        
        e.stopPropagation();
        arrayLength = myBranchCode.length;
        diff = (arrayLength * 145) - Math.abs(scrollX) - availWidth;
        diff = Math.min(145, diff);
        scrollX = scrollX - diff;
        $(".left-scroll").removeClass("no-display");
        document.getElementsByClassName('branch-scroll')[0].style.left = scrollX+"px";
        showArrow(arrayLength,scrollX)
    }
    
    function scroll(e){
        var header = document.getElementsByTagName('header')[0];
        var headerText = document.getElementsByClassName('exploration-series')[0];
        if(e.target.scrollTop>60){
            $(header).addClass('minimised');
            headerText.innerHTML = "Exploration Series<span class='extend'></span>Physics Simulations";
            
            if(window.innerWidth<600){
                headerText.innerHTML = "Exploration Series<span class='extend'></span>Physics..";
            }
        }
        else{
            $(header).removeClass('minimised');
            headerText.innerHTML = "Exploration Series";
        }
    }
    
    function searchInConcepts(){
        var currentBranchItems = document.getElementsByClassName(currentBranchCode+"."),
            noOfConcepts,
            conceptCounter,
            string;
        for(var simCount = 0; simCount<currentBranchItems.length; simCount++){
            string = "";
            noOfConcepts = currentBranchItems[simCount].getElementsByTagName('a').length;
            for(conceptCounter = 0; conceptCounter < noOfConcepts; conceptCounter++){
                string = string + " " +currentBranchItems[simCount].getElementsByTagName('a')[conceptCounter].text;
            }
            string = string + " " + currentBranchItems[simCount].getElementsByClassName('sim-title')[0].innerHTML;
            var item = searchClick.value.toLowerCase();
            var result = new RegExp(item,"i");
            result = string.match(result);
            if(result && result.input == string){
                showSearched(simCount);
            }
        }
    }
    
    function hideAll(){
        var subject,
            index,
            allChildNode,
            card,
            childCounter;
        
        card = document.querySelector('.my-branches-row'),
        allChildNode = card.childNodes;
        for(childCounter = 0; childCounter < allChildNode.length; childCounter++){
            childNode = allChildNode[childCounter];
            $(childNode).addClass("hide");
        }
        searchInConcepts();
    }
    
    function showSearched(simCount,index){
        var id = currentBranchCode.substring(4,7);
        $("#"+id+"-"+simCount).removeClass('hide');
    }
    
    
    function showMyBranches (event){
        handleSearchContainer();
        $(".search-field","nav").val("");
        $('.my-branches').addClass('focused');
        $('.my-plix').removeClass('focused');
        $('.my-plix-row').addClass('hide');
        $('.my-branches-row, .branch-view-holder').removeClass('hide');
        if (event) {
            showCurrentBranch(myBranchCode[0]);
        }
    }
    
    
    function doNothing(e){
        e.stopPropagation();
    }

    /*function expandSearch(e){
        e.stopPropagation();
        $(searchClick).addClass('open-search');
        setTimeout(function(){
            $(".close-search").removeClass("hide");
        },300);
        $('.search-icon').addClass('hide');
        searchClick.focus();
    }
    function collapseSearch(e){
        $(searchClick).removeClass('open-search');
        $(searchClick).val("");
        $(".close-search").addClass("hide");
        $('.search-icon').removeClass('hide');
        searchClick.blur();
    }*/
    function goBack(){
        var encodedBackURL = uriParts['queryKey']['backUrl'],
            backUrl = decodeURIComponent(encodedBackURL);
        while(backUrl !== encodedBackURL){
            encodedBackURL = backUrl;
            backUrl = decodeURIComponent(encodedBackURL);
        }
        return backUrl;
    }
    
    // parseUri 1.2.2
    // (c) Steven Levithan <stevenlevithan.com>
    // MIT License

    function parseUri (str) {
        var options = {
            strictMode: false,
            key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
            q:   {
                name:   "queryKey",
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }
        };
        var o   = options,
            m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
            uri = {},
            i   = 14;

        while (i--) uri[o.key[i]] = m[i] || "";

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if ($1) uri[o.q.name][$1] = $2;
        });

        return uri;
    };
    
    function getBranchName(branchCode,requireSpace){
        var codeIndex,
            branchName;
        
        codeIndex = allBranchCode.indexOf(branchCode);
        branchName = allBranchOrder[codeIndex].toLowerCase();
        
        return requireSpace ? branchName.replace(" ", "-") : branchName;
    }
    
    function getBranchCode(branchName){
        var codeIndex,
            branchCode;
        
        if (branchName.indexOf(".") === -1) {
            branchName = changeCase(branchName);
            codeIndex = allBranchOrder.indexOf(branchName);
            branchCode = allBranchCode[codeIndex];
            return branchCode;
        } else {
            return branchName;
        }
    }
    
    function changeCase(branchName){
        var firstName,
            lastName
            branchName = branchName.charAt(0).toUpperCase() + branchName.slice(1);
        if(branchName.indexOf("-") > -1){
            firstName = branchName.split("-")[0];
            lastName = branchName.split("-")[1];
            lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
            return (firstName+" "+lastName);
        }
        return branchName;
    }
    
    function slideToBranch(currentBranchCode){
        var branchCodeIndex,
        branchPos,
        widthRemain,
        shiftToLeft,
        arrayLength;
        
        branchCodeIndex = myBranchCode.indexOf(currentBranchCode);
        arrayLength = myBranchCode.length;
        branchPos = (branchCodeIndex+1)*145; 
        widthRemain = availWidth - branchPos;
        if(widthRemain < 0){
            shiftToLeft = Math.floor(widthRemain/145); 
            scrollX = (shiftToLeft)*145;
            document.getElementsByClassName("branch-scroll")[0].style.left =  (scrollX)+"px";
            $(".left-scroll").removeClass("no-display");
        }
        else{
            document.getElementsByClassName("branch-scroll")[0].style.left =  (0)+"px";
            $(".left-scroll").addClass("no-display");
            scrollX = 0;
        }
        showArrow(arrayLength,scrollX);
    }
    
    function showArrow(arrayLength,scrollX){
        if(availWidth + Math.abs(scrollX) < arrayLength * 145){
            $(".right-scroll").removeClass("no-display");
        }
        else{
            $(".right-scroll").addClass("no-display");
        }
    }
    
    function getHref(currentBranchCode){
        var uriComponents = parseUri(window.location.href),
            pathname = uriComponents.directory,
            queryKey = uriComponents.queryKey,
            searchParam = "?",
            href;

        if (/\/study-guides\/$/.test(pathname)) {
            pathname += getBranchName(currentBranchCode).toHyphenCase() + '/';
        } else {
            pathname = pathname.replace(/\/[^\/]+\/$/, '/' + getBranchName(currentBranchCode).toHyphenCase() + '/');
        }
        pathname += uriComponents.file;
        if(Object.keys(queryKey).length !== 0){
            for(key in queryKey){
                if(queryKey.hasOwnProperty(key) && key !== "subject"){
                    searchParam = searchParam + "&" + key+"="+queryKey[key];
                }
            }
        }
        href = pathname+searchParam;
        return href;
    }
    function getSearchResult(searchStr, callback){
        var protocol = window.location.protocol,
            host = window.apihost,
            url = API.SEARCH.replace(/{{searchStr}}/g, searchStr).replace(/{{pageNum}}/g, pageNum).replace(/{{pageSize}}/g, pageSize);
        cdn(url).done(function(searchedData){
            renderSearchedData(searchedData);
            showAllStandardsOrConcepts(searchStr);
            $('.close-search').removeClass('hide');
            loadMore = (searchedData.response.Artifacts.limit + searchedData.response.Artifacts.offset) < searchedData.response.Artifacts.total;
            if ($.isFunction(callback)) callback();
            if (history && history.pushState) {
                var pageUrl =  window.location.pathname + window.location.search;
                if (pageUrl.indexOf('search=') !== -1) {
                    pageUrl = pageUrl.replace(/search=[^\&]*/, 'search=' + encodeURIComponent(searchStr));
                } else {
                    pageUrl += pageUrl.indexOf('?') === -1 ? '?search=' + encodeURIComponent(searchStr) : '&search=' + encodeURIComponent(searchStr);
                }
                history.pushState({}, document.title, pageUrl);
            }
        });
    }
    function renderSearchedData(searchedData){
        var studyGuides,
            key,
            backUrl,
            uriComponents,
            queryKey,
            lastIndexOfHypen,
            currentPlix,
            card,
            imgSrc,
            simDesc,
            simTitleCont,
            simTitleEllipsis,
            simTitle,
            simConceptsCont,
            simConceptEllipsis,
            simConcepts,
            simConceptsTags,
            simConceptName,
            conceptBranch,
            conceptName,
            subject,
            simConceptSeperator,
            branchEid,
            branchName,
            standardIds,
            stds,
            standards,
            conceptId;
        studyGuides = searchedData.response.Artifacts ? searchedData.response.Artifacts.result : [];
        if(studyGuides.length > 0){
            for(key in studyGuides){
                standardIds = [];
                    
                $("#noResult").addClass("hide");
                $searchResultCont.removeClass("hide");
                currentPlix = studyGuides[key];
                // [Bug 57367] : Check if domain info exists before using the information to build the sim card
                if(currentPlix["domain"] === null || currentPlix["domain"] === "" || typeof currentPlix["domain"] === "undefined")
                {   
                    console.log("Skipping: Result item does not contain 'domain' information, which is used to build the Sim Card");
                    console.log(currentPlix);
                    continue;
                }
                conceptId = currentPlix.domain["encodedID"] ;
                card = document.createElement("a"),
                searchResultCont = document.getElementsByClassName('search-result-container')[0];
                
                cardImageDiv = document.createElement("div");
                $(cardImageDiv).addClass("tile-image");
                cardImageInnerDiv = document.createElement("div");
                $(cardImageInnerDiv).addClass("inner-div");
                cardImage = document.createElement("img");
                $(cardImage).addClass("image-element");
                cardImageInnerDiv.appendChild(cardImage);
                cardImageDiv.appendChild(cardImageInnerDiv);
                $(card).addClass("thumbnail-view");
                searchResultCont.appendChild(card);
                card.appendChild(cardImageDiv);
                imgSrc = currentPlix.coverImage;
                if(!imgSrc){
                    subject = conceptId.substr(0, 4);
                    if(subject=="MAT."){
                        imgSrc = "/media/study-guides/assets/images/math.png";
                    }
                    else{
                        imgSrc = "/media/study-guides/assets/images/science.png";
                    }
                } else {
                    imgSrc = imgSrc.replace(/(COVER_PAGE)/g, '$1_THUMB_POSTCARD_TINY')
                }
                cardImage.setAttribute("src", imgSrc);
                branchEid = conceptId.substring(0,7);
                conceptBranch = getBranchName(branchEid,true);
                
                var cardImageName = document.createElement("div");
                cardImageName.classList.add('tile-image-name');
                card.appendChild(cardImageName);
                
                var simTitleEllipsis = document.createElement("span");
                $(simTitleEllipsis).addClass("sim-title-ellipsis");
                cardImageName.appendChild(simTitleEllipsis);
                simTitleEllipsis.innerHTML = "...";
                
                var simName = document.createElement("h2");
                simName.classList.add('sim-title');
                simName.innerHTML = currentPlix.title +" ("+toTitleCase(conceptBranch)+")";
                cardImageName.appendChild(simName);
                
                var simDesc = document.createElement("div");
                $(simDesc).addClass("sim-desc");
                card.appendChild(simDesc);
                simDesc.addEventListener('click',hideStdDesc,false);
                
                var simCovers = document.createElement("div");
                simCovers.classList.add('sim-covers-desc');
                simDesc.appendChild(simCovers);
                
                var simConceptsCover = document.createElement("div");
                simConceptsCover.classList.add('sim-covers');
                simCovers.appendChild(simConceptsCover);

                var simConcepts = document.createElement("div");
                simConcepts.classList.add('sim-covers-concepts');
                simConceptsCover.appendChild(simConcepts);
                simConcepts.innerHTML = "<span class='sim-info sim-covers-focused'>CONCEPTS</span>";
                simConcepts.addEventListener('click',showCovers,false);
                
                var simStandardsCover = document.createElement("div");
                simStandardsCover.classList.add('sim-covers');
                simCovers.appendChild(simStandardsCover);
                
                var simStandards = document.createElement("div");
                simStandards.classList.add('sim-covers-standards');
                simStandardsCover.appendChild(simStandards);
                simStandards.innerHTML = "<span class='sim-info'>STANDARDS</span>";
                simStandards.addEventListener('click',showCovers,false);
                
                var simConceptsTags = document.createElement("div");
                simConceptsTags.classList.add('sim-covers-tags');
                simDesc.appendChild(simConceptsTags);
/*                
                simConceptEllipsis = document.createElement("span");
                $(simConceptEllipsis).addClass('sim-concept-ellipsis');
                simConceptsTags.appendChild(simConceptEllipsis);
                simConceptEllipsis.innerHTML = "...";
*/                
                var simStandardsTags = document.createElement("div");
                simStandardsTags.classList.add('sim-covers-tags');
                simStandardsTags.classList.add('sim-covers-tags-s');
                simDesc.appendChild(simStandardsTags);

                var simStdDescView = document.createElement("div");
                simStdDescView.classList.add('sim-std-desc-view');
                simStdDescView.classList.add('hide');
                simDesc.appendChild(simStdDescView);
                
                simConceptName = document.createElement("a");
                simConceptsTags.appendChild(simConceptName);
                conceptName = currentPlix.domain["name"];
                simConceptName.innerHTML = " "+conceptName;
                
                standards = STANDARDS[branchEid];
                if(standards){
                    standardConcepts = standards.response.concepts;
                    standardDesc = standards.response.standards;
                    stds = standardConcepts[conceptId] && standardConcepts[conceptId].standards || [] ;
                    stds.forEach(function(sId){
                        if(-1 === standardIds.indexOf(sId)){
                            standardIds.push(sId);
                        }
                    });
                }
                
                if(standardIds.length>0){
                    for(var simStandardCount = 0; simStandardCount<standardIds.length; simStandardCount++){
                        var stdId = standardIds[simStandardCount] ,
                            simStandardName = document.createElement("a");
                        simStandardsTags.appendChild(simStandardName);
                        
                        if(simStandardCount<(standardIds.length-1)){
                            simStandardName.innerHTML = " "+standardDesc[stdId].label;
                            
                            var simStandardSeperator = document.createElement("span");
                            simStandardsTags.appendChild(simStandardSeperator);
                            simStandardSeperator.innerHTML = ",";
                        }
                        else{
                            simStandardName.innerHTML = " "+standardDesc[stdId].label;
                        }
                        simStandardName.refValue = standardDesc[stdId].description;
                        
                        simStandardName.addEventListener('click',showStdDesc,false);
                    }
                }
                else{
                    simStandardsCover.classList.add('hide-back');
                }
                simStandardsTags.classList.add('hide-back');
                
                simConceptName.setAttribute("href", "//" + window.apihost + "/" +conceptBranch.toLowerCase().replace(/\s+/g, '-')+"/"+currentPlix.domain["handle"]+"/");
                simConceptName.setAttribute("data-embed-href", "//" + window.apihost + "/embed/#module=concept&handle="+currentPlix.domain["handle"]+"&branch="+conceptBranch.toLowerCase()+"&filters=&nochrome=true");
                simConceptName.addEventListener('click',openConceptIframe,false);
                
                lastIndexOfHypen = currentPlix.handle.lastIndexOf("-") + 1,
                handleLength = currentPlix.handle.length,
                questionId = currentPlix.handle.substring(lastIndexOfHypen,handleLength);
                
                uriComponents = parseUri(window.location.href);
                queryKey = uriComponents.queryKey,
                secondaryParam = "";
                if(Object.keys(queryKey).length !== 0){
                    for(key in queryKey){
                        if(queryKey.hasOwnProperty(key) && key !== "subject"){
                            secondaryParam = secondaryParam + "&"+key+"="+queryKey[key];
                        }
                    }
                    secondaryParam = secondaryParam.replace(/&/, '?');
                }
                backUrl = encodeURIComponent("//"+window.browsehost+"/study-guides/"+getBranchName(branchEid).toHyphenCase()+"/index.html" + secondaryParam);
                //card.setAttribute("href","//" + window.apihost + "/" + getBranchName(branchEid).toHyphenCase() + "/" + currentPlix.domain.handle + '/studyguide/' + currentPlix.handle + "/?referrer=studyguide_browse");
                var itemUrl = getModalityUrl(currentPlix, branchEid);
                var href = "//" + window.apihost + itemUrl;
                card.setAttribute("href", href);
                showEllipsis(card);
            }
        }
        else{
            $("#noResult").removeClass("hide");
            $searchResultCont.addClass("hide");
        }
    }

    function getModalityUrl(modality, branchCode) {
        var itemUrl = "/" + modality.domain.branchInfo.handle.toLowerCase() + "/" + modality.domain.handle + '/studyguide/' + modality.handle + "/?referrer=studyguide_browse";
        if (modality.collections) {
            for (var i = 0; i < modality.collections.length; i++) {
                if ("type" in modality)
                {
                    var itemCollectionUrl = "/c/" + modality.collections[i].collectionHandle + "/" + modality.collections[i].conceptCollectionAbsoluteHandle + 
                    "/" + modality.type.name + "/" + modality.handle + "/?referrer=studyguide_browse";
                }
                else
                {
                    var itemCollectionUrl = "/c/" + modality.collections[i].collectionHandle + "/" + modality.collections[i].conceptCollectionAbsoluteHandle + 
                    "/" + modality.artifactType + "/" + modality.handle + "/?referrer=studyguide_browse";
                }

                if (typeof branchCode != "undefined"){
                    if (getBranchName(branchCode).toHyphenCase() == modality.collections[i].collectionHandle) {
                        return itemCollectionUrl;
                    }                    
                }
                else if (getBranchName(currentBranchCode).toHyphenCase() == modality.collections[i].collectionHandle) {
                    return itemCollectionUrl;
                } else if (i == 0) {
                    itemUrl = itemCollectionUrl;
                }
            }
        }
        return itemUrl;
    }
    
    function toTitleCase(str){
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
    
    function handleSearchContainer(){
        $searchResultWrapper.addClass("hide");
        $(scrollContainer).removeClass("hide");
        $searchResultCont.empty();
    }
    
});
