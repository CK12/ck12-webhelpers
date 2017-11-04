// Global variables
var paper;
var navpaper;
var canvasWidth, canvasHeight;
var mapWidth, mapHeight;
var boxWidth, boxHeight;
var aspectRatio;
var xorig, yorig;
var xStart, yStart;
var zoomLevel;
var navLevel;

var nnodes;
var njunc;
var nlines;
var nx = new Array();
var ny = new Array();
var bt = new Array();
var bb = new Array();
var bl = new Array();
var br = new Array();
var b  = new Array();
var t  = new Array();
var lines = new Array();
var lineNodes = new Array();
var nodeDisp = new Array();

// Set 3 different zoom levels: 
// larger number is a more zoomed out view (nodes are smaller)
// For minZoomLevel (zoomed out), a value <=0 sets zoom level to whole map
var maxZoomLevel = 1200; // zoom in
var midZoomLevel = 3000; // default view
var minZoomLevel = -1; //5000; // zoom out

Element.prototype.getElementWidth = function() {
    if (typeof this.clip !== "undefined") {
        return this.clip.width;
    } else {
        if (this.style.pixelWidth) {
            return this.style.pixelWidth;
        } else {
            return this.offsetWidth;
        }
    }
    return 980;
};

Element.prototype.getElementHeight = function() {
    if (typeof this.clip !== "undefined") {
        return this.clip.height;
    } else {
        if (this.style.pixelHeight) {
            return this.style.pixelHeight;
        } else {
            return this.offsetHeight;
        }
    }
    return 600;
};

// Find x,y position of cursor
function cursorXY(event) {
    if (event && (event.clientX || event.clientY)) { /* Mozilla */
	x = event.clientX + window.scrollX;
	y = event.clientY + window.scrollY;
    } 
    else { /* IE */
	x = window.event.clientX + document.documentElement.scrollLeft
	       + document.body.scrollLeft;
	y = window.event.clientY + document.documentElement.scrollTop
	       + document.body.scrollTop;
    }
    
    return {x: x, y: y};
}


// Set Canvas width,height,and origin based on input zoomStep
function setCanvas(zoomStep) {
    canvasWidth = canvasWidth + zoomStep;
    canvasHeight = canvasHeight + zoomStep/aspectRatio;
    xorig = xorig - zoomStep/2;
    yorig = yorig - (zoomStep/aspectRatio)/2;
}


// Set zoomStep based on current vs. desired zoomLevel
function setZoom() {
    var zoomStep; 
    //var minZoomLevel = 5000;
    //var maxZoomLevel = 1500;
    //var midZoomLevel = 3000;

    if (zoomLevel == 1 && minZoomLevel <= 0) {
     	if (mapWidth/mapHeight < aspectRatio) {
	    zoomStep = mapHeight - canvasHeight;
	    zoomStep = zoomStep*aspectRatio;
    	    setCanvas(zoomStep);
    	} else {
	    zoomStep = mapWidth - canvasWidth;
    	    setCanvas(zoomStep);
    	}
    } else if (zoomLevel == 1 && minZoomLevel > 0) {
	zoomStep = minZoomLevel - canvasWidth;
	setCanvas(zoomStep);
    } else if (zoomLevel == 2) {
	zoomStep = midZoomLevel - canvasWidth;
	setCanvas(zoomStep);
    } else if (zoomLevel == 3) {
	zoomStep = maxZoomLevel - canvasWidth;
	setCanvas(zoomStep);
    }

    drawNavLevel();
    paper.setViewBox(xorig,yorig,canvasWidth,canvasHeight,true);
}


// Event handler for zooming
function mapZoom(delta) {
    if (delta < 0 && zoomLevel > 1) {
	zoomLevel = zoomLevel - 1;
	setZoom();
    } else if (delta > 0 && zoomLevel < 3) { 
	zoomLevel = zoomLevel + 1;
	setZoom();
    }
}

 
// Event handler for scroll wheel
function wheel(event){
    var delta = 0;
    
    if (!event) /* For IE. */
	event = window.event;

    /* Get mousewheel movement */
    if (event.wheelDelta) { /* IE/Opera. */
	delta = event.wheelDelta/120;
    } else if (event.detail) { /* Mozilla */
	delta = -event.detail/3;
    }
    // Do zoom if delta is not zero
    if (delta){
	mapZoom(delta);
    }
    // Prevent default action on scroll
    if (event.preventDefault) { /* Mozilla */
	event.preventDefault();
    }
    else {  
	event.returnValue = false; /* IE */
    }
}

// Start event handler for panning 
function panStart(event) {
    // Find starting position of cursor
    var pos = cursorXY(event);
    xStart = pos.x;
    yStart = pos.y;

    // Check for move and mouseup for panMove and panStop
    if (document.addEventListener) { /* Mozilla */
    	document.addEventListener("mousemove", panMove, true);
	document.addEventListener("mouseup",   panStop, true);
	event.preventDefault();
    }
    else { /* IE */
	document.attachEvent("onmousemove", panMove);
	document.attachEvent("onmouseup",   panStop);
	window.event.cancelBubble = true;
	window.event.returnValue = false;
    }
}

// Pan map 
function panMove(event) {
    var dx, dy;

    // Get current cursor position
    var pos = cursorXY(event);

    // Determine viewBox parameters
    dx = xStart-pos.x;
    dy = yStart-pos.y;
    xorig = xorig + dx*(canvasWidth/boxWidth);
    yorig = yorig + dy*(canvasWidth/boxWidth);

    paper.setViewBox(xorig,yorig,canvasWidth,canvasHeight,true);

    // Update position of cursor
    xStart = pos.x;
    yStart = pos.y;

    // Prevent default behavior
    if (event.preventDefault) /* Mozilla */
	event.preventDefault();
    else { /* IE */
	window.event.cancelBubble = true;
	window.event.returnValue = false;
    }
}

// Stop event handler for panning
function panStop(event) {
    if (document.removeEventListener) {
	document.removeEventListener("mousemove", panMove,   true);
	document.removeEventListener("mouseup",   panStop, true);
    }
    else {
	document.detachEvent("onmousemove", panMove);
	document.detachEvent("onmouseup",   panStop);
    }
}


//function scaleNodes(i,sfac) {
//    var imembers = family(i);
//    
//    // Assign scaling to everyone in current family (if not already assigned)
//    for (var j=0; j<imembers.length; j++) {
//	if (sfac[imembers[j]] == 2) {
//	    sfac[imembers[j]] = sfac[i]*.9;
//	    sfac[imembers[j]] = Math.max(sfac[imembers[j]],0.25);
//	}
//    }
//    // Call function again if there are still unassigned members
//    for (var j=0; j<imembers.length; j++) {
//	var jmembers = family(imembers[j]);
//	for (var k=0; k<=jmembers.length; k++) {
//	    if (sfac[jmembers[k]] == 2) {
//   		sfac = scaleNodes(imembers[j],sfac);
//		break;
//	    }
//	}
//    }
//
//    return sfac;
//}


//function shiftNodes(i,sfac) {
//    var maxdy = 0; 
//    var maxdx = 0;
//    var imembers = family(i);
//
//    for (var j=0; j<nnodes; j++) {
//	if (ny[j] > bb[i]) ny[j] = ny[j] - (ny[j]-ny[i])*Math.atan((ny[j]-ny[i])/50)*0.3;
//	if (ny[j] < bt[i]) ny[j] = ny[j] + (ny[i]-ny[j])*Math.atan((ny[i]-ny[j])/50)*0.3;
//	
//	if (nx[j] > br[i]) nx[j] = nx[j] - (nx[j]-nx[i])*Math.atan((nx[j]-nx[i])/500)*0.25;
//	if (nx[j] < bl[i]) nx[j] = nx[j] + (nx[i]-nx[j])*Math.atan((nx[i]-nx[j])/500)*0.25;
//
//	//if (ny[j] > bb[i]) ny[j] = ny[j] - ((ny[j]-ny[i])/1.5)*Math.atan((ny[j]-ny[i])/600)*0.7;
//	//if (ny[j] < bt[i]) ny[j] = ny[j] + ((ny[i]-ny[j])/1.5)*Math.atan((ny[i]-ny[j])/600)*0.7;
//	
//	//if (nx[j] > br[i]) nx[j] = nx[j] - ((nx[j]-nx[i])/1.5)*Math.atan((nx[j]-nx[i])/600)*0.5;
//	//if (nx[j] < bl[i]) nx[j] = nx[j] + ((nx[i]-nx[j])/1.5)*Math.atan((nx[i]-nx[j])/600)*0.5;
//    }
//
//    //snapGrid();
//}


//function fisheye(inode) {
//    var sfac = new Array();
//
//    // Initialize sfac array 
//    for (var i = 0; i < nnodes; i++) sfac[i] = 2;
//    
//    // Call function recursively to scale node sizes
//    sfac[inode] = 1.0;
//    sfac = scaleNodes(inode,sfac);
//
//    // Shift nodes to compress map
//    shiftNodes(inode,sfac);
//
//    // Redraw map
//    drawMap(sfac);
//}

function setGen(i,gen) {
    var imembers = family(i);
    
    // Assign gen number to family (if not already assigned)
    for (var j=0; j<imembers.length; j++) {
	if (gen[imembers[j]] == 900) {
	    gen[imembers[j]] = gen[i]-1;
	}
    }
    // Call function again if there are still unassigned members
    for (var j=0; j<imembers.length; j++) {
	var jmembers = family(imembers[j]);
	for (var k=0; k<=jmembers.length; k++) {
	    if (gen[jmembers[k]] == 900) {
   		gen = setGen(imembers[j],gen);
		break;
	    }
	}
    }

    return gen;
}


function localDraw(inode) {
    // Initialization
    var gen = new Array();
    resetMap();
    for (var i = 0; i < nlines; i++) {
	lines[i].attr({opacity:0.1});
    }    

    // Set gen array to 900 except inode value to 100
    for (var i = 0; i < nnodes; i++) gen[i] = 900;

    // call setGen function to decrement by 1 each generation away
    gen[inode] = 100;
    gen = setGen(inode,gen);

    // if generation number within threshold, then add node to display list
    var nshow = 0;
    nodeDisp = [];
    for (var i = 0; i < nnodes; i++) {
	if (gen[i] >= 99) {
	    nodeDisp[nshow] = i;
	    nshow = nshow + 1;
	}
    }

    // if an element in nodeDisp array is a junction, include its children too
    for (var i = (nnodes-njunc); i < nnodes; i++) {
    	if (jQuery.inArray(i,nodeDisp) !=-1) {
    	    nodeDisp.push.apply(nodeDisp,family(i));
	}
    }

    // un-hide connector lines that are required for displayed nodes
    for (var i = 0; i < nlines; i++) {
    	if (jQuery.inArray(lineNodes[i][0],nodeDisp)!=-1 & jQuery.inArray(lineNodes[i][1],nodeDisp)!=-1) {
    	    lines[i].attr({opacity:1.0});
	}
    }
    // hide nodes not in display list
    // some weird raphaeljs issue requires hiding action to happen last; otherwise above stuff won't happen
    for (var i = 0; i < (nnodes-njunc-1); i++) {
	if (jQuery.inArray(i,nodeDisp)==-1) {
	    t[i].attr({opacity:0.2});
	    b[i].attr({opacity:0.2});
	}
    }
}


function resetMap() {
    // Set node x,y pos to default
    defPos();

    // Set size factor for nodes to 1
    var sfac = new Array();
    for (var i = 0; i < nnodes; i++) sfac[i] = 1;

    // Include all nodes in display list
    for (var i = 0; i < nnodes; i++) nodeDisp[i] = i;

    // Draw map
    drawMap(sfac);
}

// Recenter map on cursor location
function recenter(inode) {
    // Fisheye view centered on inode
    //resetMap();
    //fisheye(inode);    

    // Set center of view
    //canvasWidth = boxWidth + 200;
    //canvasHeight = boxHeight + 200/aspectRatio;
    xorig = nx[inode]-canvasWidth/2;
    yorig = ny[inode]-canvasHeight/2;
    paper.setViewBox(xorig,yorig,canvasWidth,canvasHeight);

    // Draw limited generations only
    localDraw(inode);
}

// Function handler for node hover
function nodeHover(inode) {
    b[inode].attr({cursor:"pointer",title:"Click to localize view"});
    if (jQuery.inArray(inode,nodeDisp)==-1) b[inode].attr({opacity:0.5});
}

// Function handler for node unhover
function nodeUnhover(inode) {
    if (jQuery.inArray(inode,nodeDisp)==-1) b[inode].attr({opacity:0.2});
}


// Navigation buttons for zooming (using additional Raphael canvas)
function navbuttons() {
    navpaper = Raphael(document.getElementById('navholder'), 100, 200); 

    // Draw zoom-in button and attach event handlers
    plusbutton = navpaper.rect(50,50,26,26,5).attr({stroke:"#7cbf00",fill:"none","stroke-width": "2"});
    plussign = navpaper.text(63,63,"+").attr({"font-size":32,"stroke":"#7cbf00","fill":"#7cbf00"});
    plusbutton.mouseover(function (event) { 
	    this.attr({fill: "#6D7B8D", cursor: "pointer"});
    }); 
    plusbutton.mouseout(function (event) { 
	    this.attr({fill: "none"}); 
    }); 
    plussign.mouseover(function (event) { 
	    this.attr({cursor: "pointer"});
	    plusbutton.attr({fill: "#6D7B8D"});
    }); 
    plussign.mouseout(function (event) { 
	    plusbutton.attr({fill: "none"}); 
    }); 
    plusbutton.click(function() {
	    delta = 1;
	    mapZoom(delta);
    }); 
    plussign.click(function() {
	    delta = 1;
	    mapZoom(delta);
    }); 

    // Draw zoom-out button and attach event handlers
    minusbutton = navpaper.rect(50,118,26,26,5).attr({stroke:"#7cbf00",fill:"none","stroke-width": "2"});
    minussign = navpaper.text(63,128,"-").attr({"font-size":40,"stroke":"#7cbf00","fill":"#7cbf00"});
    minusbutton.mouseover(function (event) { 
	    this.attr({fill: "#6D7B8D", cursor: "pointer"});
    }); 
    minusbutton.mouseout(function (event) { 
	    this.attr({fill: "none"}); 
    }); 
    minussign.mouseover(function (event) { 
	    this.attr({cursor: "pointer"});
	    minusbutton.attr({fill: "#6D7B8D"});
    }); 
    minussign.mouseout(function (event) { 
	    minusbutton.attr({fill: "none"}); 
    }); 
    minusbutton.click(function() {
	    delta = -1;
	    mapZoom(delta);
    }); 
    minussign.click(function() {
	    delta = -1;
	    mapZoom(delta);
    });
 
    // Add level indicator bars and add event handlers
    // Level 3
    navlevel3=navpaper.rect(51,85,24,5);
    navlevel3.attr({fill:"#C0C0C0","stroke":"#C0C0C0"});
    navlevel3.mouseover(function (event) {
	    this.attr({cursor: "pointer","fill":"#736F6E","stroke":"#736F6E"});
    });
    navlevel3.mouseout(function (event) { 
	    this.attr({fill: "#C0C0C0","stroke":"#C0C0C0"}); 
    }); 
    navlevel3.click(function() {
	    zoomLevel = 3;
	    setZoom();
    });
    
    // Level 2
    navlevel2=navpaper.rect(54,95,18,5);
    navlevel2.attr({fill:"#C0C0C0","stroke":"#C0C0C0"});
    navlevel2.mouseover(function (event) {
	    this.attr({cursor: "pointer","fill":"#736F6E","stroke":"#736F6E"});
    });
    navlevel2.mouseout(function (event) { 
	    this.attr({fill: "#C0C0C0","stroke":"#C0C0C0"}); 
    }); 
    navlevel2.click(function() {
	    zoomLevel = 2;
	    setZoom();
    });

    // Level 1
    navlevel1=navpaper.rect(57,105,12,5);
    navlevel1.attr({fill:"#C0C0C0","stroke":"#C0C0C0"});
    navlevel1.mouseover(function (event) {
	    this.attr({cursor: "pointer","fill":"#736F6E","stroke":"#736F6E"});
    });
    navlevel1.mouseout(function (event) { 
	    this.attr({fill: "#C0C0C0","stroke":"#C0C0C0"}); 
    }); 
    navlevel1.click(function() {
	    zoomLevel = 1;
	    setZoom();
    });

    // Draw button to un-hide all nodes
    unhideicon = navpaper.image('/media/js/conceptmap/icons/eye.png',48,150,30,30);
    unhideicon.attr({title:"Click to unhide all nodes"});
    unhideicon.mouseover(function (event) { 
	    this.attr({cursor: "pointer"});
	}); 
    unhideicon.click(function() {
	    resetMap();
	}); 
}

// Draw zoom level position indicator on navigation bar
function drawNavLevel() {
    var xrect;
    var yrect;
    var barwidth;

    if (zoomLevel == 3) {
	yrect = 85;
	xrect = 51;
	barwidth = 24;
    }
    if (zoomLevel == 2) {
	yrect = 95;
	xrect = 54;
	barwidth = 18;
    }
    if (zoomLevel == 1) {
	yrect = 105;
	xrect = 57;
	barwidth = 12;
    }

    if (navLevel) navLevel.remove();
    navLevel = navpaper.rect(xrect,yrect,barwidth,5);
    navLevel.attr({fill:"#7cbf00","stroke":"#7cbf00"});
}

// Initialize everything
window.onload = function() {
    // Initialize canvas
    initMap();

    // Draw map and navigation
    resetMap();
    navbuttons();

    // Set initial zoom
    zoomLevel = 2;
    setZoom();

    // Initialize event handlers
     var elem = document.getElementById ('holder');
     if (elem.addEventListener) { /* Mozilla */
    	elem.addEventListener('DOMMouseScroll', wheel, false);
	elem.addEventListener('mousedown', panStart, false);
	//elem.addEventListener('dblclick', recenter, false); 
     } /* IE */
    elem.onmousewheel = wheel;
    elem.onmousedown = panStart;
    //elem.ondblclick = recenter;
}
