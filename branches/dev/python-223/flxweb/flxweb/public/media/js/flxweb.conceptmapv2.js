define('flxweb.conceptmapv2', ['jquery', 'flxweb.conceptmaptree'], function($) {
    var st;
    $.fn.conceptMap = function(options) {

        //$(this).empty();
        var labelType, useGradients, nativeTextSupport, animate, ua = navigator.userAgent, iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i), typeOfCanvas = typeof HTMLCanvasElement, nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'), textSupport = nativeCanvasSupport && ( typeof document.createElement('canvas').getContext('2d').fillText == 'function'), Log, spaceTreeConfig, modalityObject, configuration, isAndroid = ua.match(/Android/i);

        //I'm setting this based on the fact that ExCanvas provides text support for IE
        //and that as of today iPhone/iPad current text support is lame
        labelType = (!nativeCanvasSupport || (textSupport && !iStuff)) ? 'Native' : 'HTML';
        nativeTextSupport = labelType == 'Native';
        useGradients = nativeCanvasSupport;
        animate = !(iStuff || !nativeCanvasSupport);

        Log = {
            "elem" : false,
            "write" : function(text) {
                if (!this.elem) {
                    this.elem = document.getElementById('log');
                }
                this.elem.innerHTML = text;
                this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
            }
        };

        function getDescendants(node) {
            st.nodeExpanded = true;

            /**
             * Success handler for get descendants call
             * @param data
             */
            function getDescendantsSuccessHandler(data) {
                //st.addSubtree(data.response.term,'animate',onComplete);

                $('canvas').hide();
                st.addSubtree(data.response.term, 'animate', {
                    onComplete : function() {
                        st.onClick(node.id, {
                            Move : {
                                enable : false
                            }
                        });
                        $('canvas').show();
                    }
                });

                //st.onClick(node.id,{Move: {enable: false}});
                node.children = data.response.term.children.length;
            }

            if (node.anySubnode()) {
                st.onClick(node.id, {
                    Move : {
                        enable : false
                    }
                });
            } else if (node.hasChildren && node.children === 0) {
                //alert('proxy php and the logic here '+node.encodedID);

                $.ajax({
                    'url' : configuration.url.GET_DESCENDENTS.replace("@@ENCODED_ID@@", node.encodedID),
                    'type' : 'GET',
                    'dataType' : 'json',
                    'success' : getDescendantsSuccessHandler
                });
            }
        }

        function onCreateLabel(label, node) {
            var className, hasChildren, style;

            className = label.className;
            hasChildren = node.anySubnode() ? true : false;

            label.id = node.id;

            //console.log(node.data.status);
            className = className + ((node.data.status) ? (' ' + node.data.status) : (' not_start level' + node._depth));
            className = (node.data.type) ? className + ' ' + node.data.type : className;

            label.className = className;

            //label.innerHTML = node.name;
            label.onclick = function() {
                if (node._depth > 0) {
                    if (node.expanded && node.expanded === true) {
                        collapseNode(node);
                        getDescendants(node.getParents()[0]);
                    } else {
                        var parentNode = node.getParents()[0];
                        var siblingNodes = parentNode.getSubnodes();
                        var siblingNode;
                        for (var i = 0; i < siblingNodes.length; i++) {
                            siblingNode = siblingNodes[i];
                            if (siblingNode._depth === node._depth) {
                                if (siblingNode.expanded === true) {
                                    collapseNode(siblingNode);
                                    break;
                                }
                            }
                        }
                        node.expanded = true;
                        getDescendants(node);
                    }
                }
            };

            //set label styles
            style = label.style;
            style.width = 99 + 'px';
            style.height = 60 + 'px';
            style.cursor = 'pointer';
            style.color = '#010101';
            style.fontSize = '9px';
            style.textAlign = 'center';
        }

        function collapseNode(node) {
            node.expanded = false;
            var subnode;
            var subnodes = node.getSubnodes();
            for (var i = 0; i < subnodes.length; i++) {
                subnode = subnodes[i];
                if (subnode._depth === node._depth + 1) {
                    if (subnode.expanded === true) {
                        subnode.expanded = false;
                        break;
                    }
                }
            }
        }

        function showModal(e, node) {
            var canvasLeft, canvasRight, canvasHeight, canvasWidth, modalWidth, modalHeight;
            if(e)
                e.stopPropagation();
            else
                window.event.cancelBubble = true;

            renderModality(node, modalityObject);

            canvasLeft = $('canvas').offset().left;
            canvasRight = $('canvas').offset().top;
            canvasHeight = $('canvas').height();
            canvasWidth = $('canvas').width();
            modalWidth = $('#modalityModal').width();
            modalHeight = $('#modalityModal').height();

            $('#modalityModal').css({
                'left' : 0 + $(window).width() / 2 - modalWidth / 2,
                //'top': 0 + $(window).height()/2 - modalHeight/2,
                'top' : 0 + e ? e.pageY : window.event.clientY - modalHeight/2,
                'display' : 'block'
            });

            $('.overlay').css({
                'height' : $(document).height(),
                'width' : $(document).width(),
                'display' : 'block'
            });
        }

        /**
         * This function binds onclick event on info icons
         * @param arrowContainer
         * @param node
         */
        function bindArrowEvent(arrowContainer, node) {
            arrowContainer.onclick = function(e) {
                showModal(e, node);
            };
        }

        /**
         * This method is called right before plotting a node.
         * It's useful for changing an individual node style properties before plotting it.
         * The data properties prefixed with a dollar sign will override the global node style properties.
         * @param node
         */
        function onBeforePlotNode(node) {
            var count;

            //add some color to the nodes in the path between the
            //root node and the selected node.
            if (node.selected) {
                node.data.$color = "#ff7";
            } else {
                delete node.data.$color;
                //if the node belongs to the last plotted level
                if (!node.anySubnode("exist")) {
                    //count children number
                    count = 0;
                    node.eachSubnode(function(n) {
                        count++;
                    });
                    //assign a node color based on
                    //how many children it has
                    node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
                }
            }
        }

        /**
         * This method is called right before plotting an edge.
         * It's useful for changing an individual edge style properties before plotting it.
         * Edge data proprties prefixed with a dollar sign will override the Edge global style properties.
         */
        function onBeforePlotLine(adj) {
            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                adj.data.$color = "#eed";
                adj.data.$lineWidth = 3;
            } else {
                delete adj.data.$color;
                delete adj.data.$lineWidth;
            }
        }

        /**
         * This function is used to init data and create space tree along with creating new space tree instance
         */
        function init(options) {
            var url;

            //loadConfiguration(options, function() {
            configuration = new Configuration(options);
            $.extend(options, {
                "onCreateLabel" : onCreateLabel,
                "bindArrowEvent" : bindArrowEvent,
                "onBeforePlotNode" : onBeforePlotNode,
                "onBeforePlotLine" : onBeforePlotLine
            });

            spaceTreeConfig = new SpaceTreeConfig(options);

            url = configuration.url.GET_DESCENDENTS;
            url = url.replace("@@ENCODED_ID@@", options.subject + '.' + options.branch);

            $.getJSON(url, getTreeDetails);

            //});

        }

        /**
         * This function is for placing and initializing pan and zoom controls
         */
        function initializePanZoomControls() {
            var controlsMarkup = '';
            //loadTemplate(configuration.templates.PAN_ZOOM_CONTROLS);

            controlsMarkup += '<div class="controls">';
            controlsMarkup += '<div class="CompassControls" id="compass" title="">';
            controlsMarkup += '<div panType="up" class="panUp" title="Pan up" ></div>';
            controlsMarkup += '<div panType="left" class="panLeft" title="Pan left" ></div>';
            controlsMarkup += '<div panType="right" class="panRight" title="Pan right" ></div>';
            controlsMarkup += '<div panType="down" class="panDown" title="Pan down" ></div>';
            
            controlsMarkup += '<div panType="center" class="panCenter" title="Reset" ></div>';
            
            controlsMarkup += '</div>';
            
            /*if($.browser.msie && $.browser.version === '8.0') {
                $.noop;
            }
            else {*/
                controlsMarkup += '<div class="zoom zoomIn" zoomType="in" >';
                controlsMarkup += '<div class="zoomInImageContainer">';
                controlsMarkup += '</div>';
                controlsMarkup += '<div class="zoomInImageAfter" title="Zoom In"></div>';
                controlsMarkup += '</div>';
                
                controlsMarkup += '<div class="zoomLevelPlaceholder" >';
                controlsMarkup += '<div class="zoomLevelPlaceholderImageContainer">';
                controlsMarkup += '</div>';
                controlsMarkup += '</div>';

                controlsMarkup += '<div class="zoom zoomOut" zoomType="out" >';
                controlsMarkup += '<div class="zoomOutImageContainer">';
                controlsMarkup += '</div>';
                controlsMarkup += '<div class="zoomOutImageAfter" title="Zoom Out"></div>';
                controlsMarkup += '</div>';

                controlsMarkup += '<div class="zoomLevelMark" >';
                controlsMarkup += '<div class="zoomLevelMarkImageContainer" title="Drag to zoom">';
                controlsMarkup += '</div>';
                controlsMarkup += '</div>';
           /* }*/
            
            controlsMarkup += '</div>';
            controlsMarkup += '<div class="help_icon"></div>';
            controlsMarkup += '<div class="holder_contaner_overlay">';
            controlsMarkup += '<div class="CompassControlsMapInfo">';
            controlsMarkup += '<div class="CompassControls" title=""></div>';
            controlsMarkup += '<div class="CompassControlsInfo">Use navigation control for panning the map.</div>';
            var style = "";
            /*if($.browser.msie && $.browser.version === '8.0') {
                style = 'style="visibility:hidden"';
            }*/
            controlsMarkup += '<div class="CompassZoom" ' + style + '></div>';
            controlsMarkup += '<div class="CompassZoomInfoArrow" ' + style + '></div>';
            controlsMarkup += '<div class="CompassZoomInfo" ' + style + '>Use Zoom Controls for zooming in and out of the map.</div>';
            controlsMarkup += '<div class="CompassFolder"></div>';
            controlsMarkup += '<div class="CompassFolderInfo">Click on a map node to show sub-nodes (leaf). If a node (leaf) has modalities, the modalities icon at the top right corner will represent it.</div>';        
            //controlsMarkup += '<div class="help_close close_button">Close</div>';
            controlsMarkup += '<div class="closeModal help_close"></div>';
            controlsMarkup += '</div>';
            controlsMarkup += '</div>';

            $("#" + options.container).append(controlsMarkup);
            $(".controls").show();

            controls = new Controls();
            controls.init();
        }

        /**
         * This is handler for touch event
         * @param e
         */
        function touchXY(e) {
            if (!e) {
                e = event;
            }
            //e.preventDefault();
        }

        /**
         * This is handler for pinch and zoom event
         * @param e
         * @param $target
         * @param data
         */
        function hammerPinchhandler() {
            var image, scale, dist1, dist2, diff, startPosition, endPosition, isTouchDevice = !!('ontouchstart' in window) || !!('onmsgesturechange' in window);

            if (!isTouchDevice) {
                return;
            }

            image = $('#holder-canvas,#holder-label div');

            image.hammer();

            $('#holder-canvas,#holder-label div').unbind('transformstart').bind('transformstart', function(e) {
                dist1 = Math.sqrt((e.originalEvent.touches[0].pageX - e.originalEvent.touches[1].pageX) * (e.originalEvent.touches[0].pageX - e.originalEvent.touches[1].pageX) + (e.originalEvent.touches[0].pageY - e.originalEvent.touches[1].pageY) * (e.originalEvent.touches[0].pageY - e.originalEvent.touches[1].pageY));
            });

            $('#holder-canvas,#holder-label div').unbind('transform').bind('transform', function(e) {
                dist2 = Math.sqrt((e.originalEvent.touches[0].pageX - e.originalEvent.touches[1].pageX) * (e.originalEvent.touches[0].pageX - e.originalEvent.touches[1].pageX) + (e.originalEvent.touches[0].pageY - e.originalEvent.touches[1].pageY) * (e.originalEvent.touches[0].pageY - e.originalEvent.touches[1].pageY));
            });

            $('#holder-canvas,#holder-label div').unbind('transformend').bind('transformend', function(e) {
                if (dist1 > dist2) {
                    diff = dist1 - dist2;
                    scale = (diff / dist1);
                } else {
                    diff = dist2 - dist1;
                    scale = (diff + dist1) / dist1;
                }
                zoom(scale);
            });

            $('#holder-canvas,#holder-label div').unbind('dragstart').bind('dragstart', function(e) {
                startPosition = {
                    "x" : e.originalEvent.touches[0].pageX,
                    "y" : e.originalEvent.touches[0].pageY
                };
            });

            $('#holder-canvas,#holder-label div').unbind('drag').bind('drag', function(e) {
                var currentPos = {
                    x : e.originalEvent.touches[0].pageX,
                    y : e.originalEvent.touches[0].pageY
                }, sx = st.canvas.scaleOffsetX, sy = st.canvas.scaleOffsetY, x = currentPos.x - startPosition.x, y = currentPos.y - startPosition.y;
                startPosition = currentPos;
                st.canvas.translate(x * 1 / sx, y * 1 / sy);
            });

            $('#holder-canvas,#holder-label div').on("doubletap", function(e) {
                e.stopImmediatePropagation();
                var scroll;
                if (!$(this).hasClass("modified")) {
                    //$(".zoomIn").trigger("click");
                    $(this).addClass("modified");
                    scroll = 7;
                } else {
                    //$(".zoomOut").trigger("click");
                    $(this).removeClass("modified");
                    scroll = -7;
                }

                var ZOOM_SCALE = 50;

                var context = st.canvas;
                var ans = 0, val = ZOOM_SCALE / 1000;

                ans = 1 + scroll * val;

                if (context.scaleOffsetX < 0.5 && scroll < 0) {
                    //alert('zoom-out level reached');
                } else if (context.scaleOffsetX > 1.5 && scroll > 0) {
                    //alert('zoom-in level reached');
                } else {
                    context.scale(ans, ans);
                }

            });
        }

        function zoom(scale) {
            var ZOOM_SCALE = 100, scroll, vector, val, ans;

            if (!ZOOM_SCALE) {
                return;
            }

            scroll = scale;
            vector = (scale > 1) ? 1 : -1;
            val = ZOOM_SCALE / 1000;
            ans = scroll * val;
            ans = (vector > 0) ? (1 + ans) : (1 - ans);
            if (st.canvas.scaleOffsetX < 0.5 && vector < 0) {
                //console.log('zoom-out level reached');
            } else if (st.canvas.scaleOffsetX > 1.5 && vector > 0) {
                //console.log('zoom-in level reached');
            } else {
                st.canvas.scale(ans, ans, true);
            }
        }

        function bindEvents() {
            var can;

            can = document.getElementById("holder-canvas");
            //can.addEventListener("touchmove", touchXY, false);

            st.onClick(st.root, {
                Move : {
                    enable : false
                }
            });

            //hammerPinchhandler();

            initializePanZoomControls();

            $("body").off("click").on("click", function(e) {
                var ele = e.target;

                if (!($(ele).hasClass("expand") || $(ele).parents(".modalWindow").length !== 0)) {
                    $("#modalityModal,.overlay").css("display", "none");
                }
            });

            $('.toolTip').unbind('click.toolInfo').bind('click.toolInfo', function(e) {
                var offset = $(this).offset();
                $('.toolInfo').css({
                    top : (offset.y - 20) + 'px',
                    left : (offset.x - 50) + 'px'
                }).show();
                return false;
            });

            $(".modalWindow").off("click", ".closeModal").on("click", ".closeModal", function() {
                $("#modalityModal,.overlay").css("display", "none");
            });
            
            if(isAndroid){
            	applyZoom();
            	// Detect whether device supports orientationchange event, otherwise fall back to
        		// the resize event.
        		var supportsOrientationChange = "onorientationchange" in window,
        		    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

        		window.addEventListener(orientationEvent, function() {
        		    //alert('window.orientation: ' + window.orientation + " screen.width: " + screen.width);
        			$("body").css("zoom", "");
        			setTimeout(applyZoom,1000);
        		}, false);
        	}
        }
        
        function applyZoom(){
        	var windowWidth = $(window).width(),
        		bodyWidth = $("body").width(),
        		zoomLevel = windowWidth/bodyWidth,
        		instructionWidth = $(".CompassControlsMapInfo").width()+30;
        	
        	zoomLevel = (windowWidth<768)? zoomLevel: ((instructionWidth > windowWidth)?  windowWidth/instructionWidth: "");
        	$("body").css("zoom", zoomLevel);
        }

        function filterModality(node){
            var children = [],
                i = 0;
            
            if(node.children && node.children.length !== 0){
                for(i=0;i<node.children.length;i++){
                    if(filterModality(node.children[i])){
                        var filteredNode = filterModality(node.children[i]);
                        if (filteredNode) { 
                            children.push(filteredNode);
                        }
                    }
                }
            }
            else{
                if(node.modalityCount === 0 && node.descendantModalityCount === 0){
                    return false;
                }
            }
            
            node.children = children;
            return node;
        }
        
        function getTreeDetails(json) {
            if ( typeof json.response.term !== 'undefined') {
                $("#" + options.container).empty();
                //Create a new ST instance
                st = new $jit.ST(spaceTreeConfig);
                modalityObject = loadxml();
                
                var details = json.response.term;
                details = filterModality(details);
                
                st.loadJSON(details);

                //compute node positions and layout
                st.compute();

                //optional: make a translation of the tree
                st.geom.translate(new $jit.Complex(-200, 0), "current");

                if($.browser.msie && $.browser.version === '8.0') {
                    $.noop;
                }else {
                    st.canvas.scale(0.6, 0.6);
                }
                

                st.canvas.translate(0, -200);

                bindEvents();
            } else {
                alert(json.response.message);
            }
        }

        function changeHandler() {
            if (this.checked) {
                top.disabled = bottom.disabled = right.disabled = left.disabled = true;
                st.switchPosition(this.value, "animate", {
                    onComplete : function() {
                        top.disabled = bottom.disabled = right.disabled = left.disabled = false;
                    }
                });
            }
        }

        /**
         * This function reads the xml file and creates a js object out of it.
         * Which lists all the modalities names and the items coming under it in key:value pairs
         * @returns modalityConfig
         */
        function loadxml() {
            var modalityConfig = [], category, arr = [];

            $.ajax({
                'url' : configuration.url.MODALITY_CONFIG_XML,
                'type' : 'GET',
                'dataType' : 'xml',
                'async' : false,
                'success' : function(data) {
                    $(data).find('ModalityGroups').find('artifact_types').each(function() {
                        var modalityConfigObj = {};
                        $(this).siblings().children('name').each(function() {

                            if ($(this).text() === 'display_text') {
                                //$(this).siblings('value').text()
                                //category = $(this).siblings('value').text();

                                modalityConfigObj.displayText = $(this).siblings('value').text();

                                // modalityConfig[category] = undefined;

                            }
                            if ($(this).text() === 'group_classname') {
                                modalityConfigObj.groupClassname = $(this).siblings('value').text();
                            }

                        });

                        arr = [];

                        $(this).find('type').each(function() {
                            //console.log($(this));
                            arr.push($(this).text());
                        });

                        modalityConfigObj.modalities = arr;

                        modalityConfig.push(modalityConfigObj);
                    });
                }
            });

            return modalityConfig;
        }

        /*function loadTemplate(url){
         var markup;

         $.ajax({
         "url": url,
         "type": "GET",
         "async": false,
         "success": function(data){
         markup = data;
         }
         });

         return markup;
         }*/

        function renderModality(data, modalityObjectArray) {
            var markup = '', //loadTemplate(configuration.templates.MODALITY_MODAL),
            obj, key, count, theModalityObject, theModalityObjectArray = [], modalities, lihtml, currentModality, selector, listItemMarkup = '', //oadTemplate(configuration.templates.LIST_ITEM_MODAL),
            tempListItem;

            markup += '<div id="modalityModal" class="modalWindow">';
            markup += '<a class="closeModal"></a>';
            markup += '<div class="modalHeader">';
            markup += '@@TERM_NAME@@';
            markup += '</div>';
            markup += '<ul id="modality_filters_list">';
            markup += '</ul>';
            markup += '</div>';
            markup += '<div class="overlay"></div>';

            listItemMarkup += '<li class="modality_group">';
            listItemMarkup += '<a href="@@MODALITY_URL@@" class="lnk_modality_filter group_@@MODALITY_CATEGORY@@">';
            listItemMarkup += '<span class="imgwrap"></span>';
            listItemMarkup += '<span>(@@MODALITY_TEXT@@)</span>';
            listItemMarkup += '<span class="group_label">@@GROUP_LABEL@@</span>';
            listItemMarkup += '<!--  <span class="bottomborderhider"> </span> -->';
            listItemMarkup += '</a>';
            listItemMarkup += '</li>';

            markup = markup.replace(/@@TERM_NAME@@/, data.name.toUpperCase());
            $("#modalityModal").remove();
            $(".overlay").remove();
            $("body").append(markup);

            $(".modalWindow").off("click", ".closeModal").on("click", ".closeModal", function() {
                $("#modalityModal,.overlay").css("display", "none");
            });

            if (!data.modalityDetails) {
                obj = {};

                for (key in data.modalityCount) {
                    count = 0;

                    if (data.modalityCount.hasOwnProperty(key)) {
                        obj[key] = 0;
                        subObj = data.modalityCount[key];

                        for (var subkey in subObj) {
                            count += subObj[subkey];
                            obj[key] = count;
                        }
                    }
                }

                data.modalityDetails = obj;
            }

            totatModality = 0;

            lihtml = '';

            for (var i = 0; i < modalityObjectArray.length; i++) {
                //if(modalityObject.hasOwnProperty(key)){
                modalities = modalityObjectArray[i].modalities;

                theModalityObject = {};

                theModalityObject.displayText = modalityObjectArray[i].displayText;
                theModalityObject.groupClassname = modalityObjectArray[i].groupClassname;
                theModalityObject.count = 0;

                for (var j = 0; j < modalities.length; j++) {
                    currentModality = modalities[j];

                    if (data.modalityDetails.hasOwnProperty(currentModality)) {
                        theModalityObject.count += data.modalityDetails[currentModality];
                    }

                }
                if (theModalityObject.count > 0) {
                    theModalityObjectArray.push(theModalityObject);

                    totatModality += theModalityObject.count;
                    tempListItem = listItemMarkup;

                    tempListItem = tempListItem.replace("@@MODALITY_CATEGORY@@", theModalityObject.groupClassname);
                    tempListItem = tempListItem.replace("@@MODALITY_TEXT@@", theModalityObject.count);
                    tempListItem = tempListItem.replace("@@MODALITY_URL@@", configuration.url.MODALITY_BASE_URL + '#' + theModalityObject.groupClassname);

                    tempListItem = tempListItem.replace("@@HANDLE_NAME@@", data.handle);
                    tempListItem = tempListItem.replace("@@GROUP_LABEL@@", theModalityObject.displayText);

                    lihtml += tempListItem;

                }

            }

            selector = $("#modality_filters_list", "#modalityModal");
            selector.html(lihtml);

            tempListItem = listItemMarkup;

            tempListItem = tempListItem.replace("@@MODALITY_CATEGORY@@", "all");
            tempListItem = tempListItem.replace("@@MODALITY_TEXT@@", totatModality);
            tempListItem = tempListItem.replace("@@MODALITY_URL@@", configuration.url.MODALITY_BASE_URL);
            tempListItem = tempListItem.replace("@@HANDLE_NAME@@", data.handle);
            tempListItem = tempListItem.replace("@@GROUP_LABEL@@", "All Modalities");

            lihtml = tempListItem;

            selector.prepend(lihtml);
        }

        function loadConfiguration(options, callback) {

            var script = document.createElement('script');
            script.type = 'text/javascript';

            if (script.readyState) {
                script.onreadystatechange = function() {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null;

                        loadDependencies(options, callback);
                    }
                };
            } else {
                script.onload = function() {
                    loadDependencies(options, callback);
                };
            }

            script.src = 'js/conceptMapConfiguration.js';

            document.getElementsByTagName("head")[0].appendChild(script);

        }

        function loadDependencies(options, callback) {

            var dependencies = [], jsdependencies, i, linkMarkup = '<link rel="stylesheet" type="text/css" media="screen" href="@@SRC@@">';

            configuration = new Configuration(options);
            dependencies = configuration.cssDependencies;
            jsdependencies = configuration.jsDependencies;

            for ( i = 0; i < dependencies.length; i++) {
                if (dependencies[i].type === "CSS") {
                    $("head").append(linkMarkup.replace("@@SRC@@", dependencies[i].path));
                }
            }

            loadJs({
                'resources' : jsdependencies,
                'callback' : callback
            });
        }

        function loadJs(args) {

            var x = args.resourceNumber || 0;

            if (args.resourceNumber === args.resources.length) {
                args.callback();
                return;
            }

            var script = document.createElement('script');
            script.type = 'text/javascript';

            if (script.readyState) {
                script.onreadystatechange = function() {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null;
                        loadJs({
                            resources : args.resources,
                            resourceNumber : x + 1,
                            callback : args.callback
                        });
                    }
                };
            } else {
                script.onload = function() {
                    loadJs({
                        resources : args.resources,
                        resourceNumber : x + 1,
                        callback : args.callback
                    });
                };
            }

            script.src = args.resources[x].path;

            document.getElementsByTagName("head")[0].appendChild(script);

        }


        $.extend(options, {
            'container' : $(this).attr("id")
        });

        init(options);
    };

    function Configuration(options) {

        function init(options) {
            var config = {
                "url" : getUrlConfig()
            };
            config.url.MODALITY_BASE_URL = config.url.MODALITY_BASE_URL.replace('@@BRANCH_NAME@@', options.branch_handle); 
            return config;
        }

        function getUrlConfig() {
            var urlConfig = {
                'GET_DESCENDENTS' : '/flx/get/info/browseTerm/descendants/@@ENCODED_ID@@/1?format=json&pageSize=100',
               // 'GET_DESCENDENTS': '/temp/test.json',
                'MODALITY_CONFIG_XML' : '/download/modality_configuration',
                //'MODALITY_CONFIG_XML': 'xml/modality_configuration.xml',
                'MODALITY_BASE_URL' : '/@@BRANCH_NAME@@/@@HANDLE_NAME@@'
            };

            return urlConfig;
        }

        return init(options);
    }

    function Controls() {
        var context = null, STEP_SIZE = ($.browser.msie && $.browser.version === '8.0')? 50: 200, zoomMarkerSize = 135, ZOOM_SCALE = 50;

        function init() {
            bindEvents();
        }

        function bindEvents() {
            var compass = $("#compass");

            $(".panUp,.panLeft,.panRight,.panDown,.panCenter", compass).off("click.pan").on("click.pan", handlePan);
            $(".zoom", ".controls").off("click.zoom").on("click.zoom", handleZoom);
            $('div.help_icon').off('click.help').on('click.help', function() {
                $('.holder_contaner_overlay').show();
            });
            $('div.help_close').off('click.help').on('click.help', function() {
                $('.holder_contaner_overlay').hide();
                $('div.level1:last .hierarchy').remove();
            });
        }

        function handlePan(e) {
            context = st.canvas;

            var panType = $(this).attr("panType"), x = 0, y = 0;
            
            switch(panType) {
                case "left":
                    x = STEP_SIZE;
                    break;
                case "right":
                    x = -STEP_SIZE;
                    break;
                case "up":
                    y = STEP_SIZE;
                    break;
                case "down":
                    y = -STEP_SIZE;
                    break;
                case "center"   :
                    if($.browser.msie && $.browser.version === '8.0') {
                        //$.noop;
                        st.canvas.scale(1/context.scaleOffsetX ,1/context.scaleOffsetY);
                    }
                    else {
                        st.canvas.scale(0.6/context.scaleOffsetX ,0.6/context.scaleOffsetY);
                    }
                    x = - context.translateOffsetX/context.scaleOffsetX;
                    y = - (context.translateOffsetY/context.scaleOffsetY + 200);
                    break;
            }
            context.translate(x, y);
        }

        function handleZoom(e) {
            var IS_IE8 = ($.browser.msie && $.browser.version === '8.0')? true: false,
                SCALE_DOWN_LIMIT = (IS_IE8)? 1: 0.5;
            
            e.preventDefault();
            context = st.canvas;

            var zoomType = $(this).attr("zoomType"), ans = 0, val = ZOOM_SCALE / 1000, scroll, top = parseInt($(".zoomLevelMark").css("top"), 10);

            switch(zoomType) {
                case "in":
                    scroll = (IS_IE8)? 1: 7;
                    top = top - zoomMarkerSize / (ZOOM_SCALE);
                    break;
                case "out":
                    top = top + zoomMarkerSize / (ZOOM_SCALE);
                    scroll = (IS_IE8)? -1: -7;
                    break;
            }

            ans = 1 + scroll * val;

            if (context.scaleOffsetX < SCALE_DOWN_LIMIT && scroll < 0) {
                //alert('zoom-out level reached');
            } else if (context.scaleOffsetX > 1.5 && scroll > 0) {
                //alert('zoom-in level reached');
            } else {
                if (top > 115 || top < -23) {
                    return;
                }
                context.scale(ans, ans);
                $(".zoomLevelMark").css("top", top);
            }
        }


        this.init = init;
    }

    function SpaceTreeConfig(options) {
        function init(options) {
            return {
                constrained : true,
                levelsToShow : 1,
                injectInto : options.container, //id of viz container element
                duration : 50, //set duration for the animation
                transition : $jit.Trans.Quart.easeInOut, //set animation transition type
                levelDistance : 80, //set distance between node and its children
                width1 : 1000,
                type : '2D',
                orientation : "top",
                subtreeOffset : 150,
                siblingOffset : 40,
                indent : 10,
                multitree : false,
                align : "center",
                //offsetY:-300,
                "Navigation" : getNavigationConfig(), //enable panning
                "Node" : getNodeConfig(), //set node and edge styles set overridable=true for styling individual
                "Edge" : getEdgeConfig(), //nodes or edges
                "Tips" : getTipsConfig(), //enable tips
                "onCreateLabel" : options.onCreateLabel, //This method is called on DOM label creation.
                "bindArrowEvent" : options.bindArrowEvent, //Use this method to add event handlers and styles to your node.
                "onBeforePlotNode" : options.onBeforePlotNode,
                "onBeforePlotLine" : options.onBeforePlotLine,
                "Events" : getEventsConfig()
            };
        }

        function getEventsConfig() {
            var eventConfig = {
                enable : true,
                enableForEdges : true,
                onMouseEnter : function(node, eventInfo, e) {
                    /*$('div.node').removeClass('hover');
                    $('#'+node.id).addClass('hover');
                    $('#'+node.id+' .expand').addClass('hover');*/
                    //var className = document.getElementById(node.id).className;
                    //className = className + ' hover';
                    //console.log(className);
                    //document.getElementById(node.id).className = className;
                },
                onMouseLeave : function(node, eventInfo, e) {
                    /*$('#'+node.id).removeClass('hover');
                    $('#'+node.id+' .expand').removeClass('hover');*/
                    //console.log(node.getSubnodes())
                    //var className = document.getElementById(node.id).className;
                    //className = className.replace(/ hover/g,'');
                    //className = className.split(' ');
                    //className.pop();
                    //className = className.join(' ');
                    //console.log(className)
                    //document.getElementById(node.id).className = className;
                },
                onClick : function(node, eventInfo, e) {
                }
            };

            return eventConfig;
        }

        function getNavigationConfig() {
            var navigationConfig = {
                enable : true,
                panning : true,
                zooming : 50
            };

            return navigationConfig;
        }

        function getNodeConfig() {
            var nodeConfig = {
                height : 85,
                width : 110,
                type : 'rectangle',
                color : '#fff',
                overridable : false
            };

            return nodeConfig;
        }

        function getEdgeConfig() {
            var edgeConfig = {
                type : 'quadratic:end',
                dim : 30,
                lineWidth : 2,
                color : '#cca',
                overridable : true
            };

            return edgeConfig;
        }

        function getTipsConfig() {
            var tipsConfig = {
                enable : false,
                type : 'HTML',
                offsetX : 10,
                offsetY : 10,
                onShow : function(tip, node) {
                    //console.log(node);
                    tip.innerHTML = "<b>" + node.name + "</b>" + (node.data.status === 'complete' ? ': Completed' : (node.data.status === 'incomplete' ? ': Alert' : ''));
                }
            };

            return tipsConfig;
        }
        return init(options);
    }

});
