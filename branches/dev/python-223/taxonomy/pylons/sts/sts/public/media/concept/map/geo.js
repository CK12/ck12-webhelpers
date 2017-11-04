window.onload = function() { 

mapWidth = 2895; 
mapHeight = 2883; 

boxWidth = 900; 
boxHeight = 600; 
aspectRatio = boxWidth/boxHeight; 
zoomFactor = 5; 

var paper = Raphael(document.getElementById('holder'), 900, 600); 

canvasWidth = boxWidth; 
canvasHeight = boxHeight; 

rootx = 1591; 
rooty = 100; 

xorig = rootx-boxWidth/2; 
yorig = rooty; 

zoomInitial = 500; 
xorig = xorig-zoomInitial/2; 
yorig = yorig-(zoomInitial/aspectRatio)/2; 
canvasWidth = canvasWidth + zoomInitial; 
canvasHeight = canvasHeight + zoomInitial/aspectRatio; 
paper.setViewBox(xorig,yorig,canvasWidth,canvasHeight); 

// Navigation buttons
var navpaper = Raphael(document.getElementById('navholder'), 100, 150); 

plusbutton = navpaper.rect(50,50,40,40,10).attr({stroke:"#7cbf00",fill:"none","stroke-width": "2"});
plussign = navpaper.text(70,70,"+").attr({"font-size":32,"stroke":"#7cbf00","fill":"#7cbf00"});
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
    handle(delta);
    paper.setViewBox(xorig,yorig,canvasWidth,canvasHeight,true);
}); 
plussign.click(function() {
    delta = 1;
    handle(delta);
    paper.setViewBox(xorig,yorig,canvasWidth,canvasHeight,true);
}); 



minusbutton = navpaper.rect(50,100,40,40,10).attr({stroke:"#7cbf00",fill:"none","stroke-width": "2"});
minussign = navpaper.text(70,117,"-").attr({"font-size":40,"stroke":"#7cbf00","fill":"#7cbf00"});
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
    handle(delta);
    paper.setViewBox(xorig,yorig,canvasWidth,canvasHeight,true);
}); 
minussign.click(function() {
    delta = -1;
    handle(delta);
    paper.setViewBox(xorig,yorig,canvasWidth,canvasHeight,true);
});
var nx0=638;
var ny0=1739;
var t=paper.text(nx0,ny0,'The Pythagorean Theorem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.583.C.1#The Pythagorean Theorem"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt0=ny0-(tBox.height/2+10);
var bb0=ny0+(tBox.height/2+10);
var bl0=nx0-(tBox.width/2+10);
var br0=nx0+(tBox.width/2+10);
var b0=paper.rect(bl0, bt0, br0-bl0, bb0-bt0, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx1=1163;
var ny1=1867;
var t=paper.text(nx1,ny1,'Extension: Laws of\nSines and Cosines').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.609.C.1#Extension: Laws of Sines and Cosines"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt1=ny1-(tBox.height/2+10);
var bb1=ny1+(tBox.height/2+10);
var bl1=nx1-(tBox.width/2+10);
var br1=nx1+(tBox.width/2+10);
var b1=paper.rect(bl1, bt1, br1-bl1, bb1-bt1, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx2=1368;
var ny2=671;
var t=paper.text(nx2,ny2,'Classifying\nPolygons').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.030.C.1#Classifying Polygons"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt2=ny2-(tBox.height/2+10);
var bb2=ny2+(tBox.height/2+10);
var bl2=nx2-(tBox.width/2+10);
var br2=nx2+(tBox.width/2+10);
var b2=paper.rect(bl2, bt2, br2-bl2, bb2-bt2, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx3=2508;
var ny3=2679;
var t=paper.text(nx3,ny3,'Composition of\nTransformations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.933.C.1#Composition of Transformations"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt3=ny3-(tBox.height/2+10);
var bb3=ny3+(tBox.height/2+10);
var bl3=nx3-(tBox.width/2+10);
var br3=nx3+(tBox.width/2+10);
var b3=paper.rect(bl3, bt3, br3-bl3, bb3-bt3, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx4=2091;
var ny4=2237;
var t=paper.text(nx4,ny4,'Surface Area of\nPrisms and Cylinders').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.838.C.1#Surface Area of Prisms and Cylinders"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt4=ny4-(tBox.height/2+10);
var bb4=ny4+(tBox.height/2+10);
var bl4=nx4-(tBox.width/2+10);
var br4=nx4+(tBox.width/2+10);
var b4=paper.rect(bl4, bt4, br4-bl4, bb4-bt4, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx5=1422;
var ny5=2106;
var t=paper.text(nx5,ny5,'Inscribed Angles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.678.C.1#Inscribed Angles"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt5=ny5-(tBox.height/2+10);
var bb5=ny5+(tBox.height/2+10);
var bl5=nx5-(tBox.width/2+10);
var br5=nx5+(tBox.width/2+10);
var b5=paper.rect(bl5, bt5, br5-bl5, bb5-bt5, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx6=416;
var ny6=1127;
var t=paper.text(nx6,ny6,'Triangle Congruence\nUsing ASA, AAS and HL').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.265.C.1#Triangle Congruence Using ASA, AAS and HL"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt6=ny6-(tBox.height/2+10);
var bb6=ny6+(tBox.height/2+10);
var bl6=nx6-(tBox.width/2+10);
var br6=nx6+(tBox.width/2+10);
var b6=paper.rect(bl6, bt6, br6-bl6, bb6-bt6, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx7=1104;
var ny7=2106;
var t=paper.text(nx7,ny7,'Properties of Arcs').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.672.C.1#Properties of Arcs"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt7=ny7-(tBox.height/2+10);
var bb7=ny7+(tBox.height/2+10);
var bl7=nx7-(tBox.width/2+10);
var br7=nx7+(tBox.width/2+10);
var b7=paper.rect(bl7, bt7, br7-bl7, bb7-bt7, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx8=2016;
var ny8=1805;
var t=paper.text(nx8,ny8,'Triangles and\nParallelograms').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.751.C.1#Triangles and Parallelograms"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt8=ny8-(tBox.height/2+10);
var bb8=ny8+(tBox.height/2+10);
var bl8=nx8-(tBox.width/2+10);
var br8=nx8+(tBox.width/2+10);
var b8=paper.rect(bl8, bt8, br8-bl8, bb8-bt8, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx9=1272;
var ny9=440;
var t=paper.text(nx9,ny9,'Segments and\nDistance').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.006.C.1#Segments and Distance"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt9=ny9-(tBox.height/2+10);
var bb9=ny9+(tBox.height/2+10);
var bl9=nx9-(tBox.width/2+10);
var br9=nx9+(tBox.width/2+10);
var b9=paper.rect(bl9, bt9, br9-bl9, bb9-bt9, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx10=1467;
var ny10=557;
var t=paper.text(nx10,ny10,'Angle Pairs').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.025.C.1#Angle Pairs"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt10=ny10-(tBox.height/2+10);
var bb10=ny10+(tBox.height/2+10);
var bl10=nx10-(tBox.width/2+10);
var br10=nx10+(tBox.width/2+10);
var b10=paper.rect(bl10, bt10, br10-bl10, bb10-bt10, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx11=1675;
var ny11=1130;
var t=paper.text(nx11,ny11,'Properties of\nParallel Lines').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.173.C.1#Properties of Parallel Lines"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt11=ny11-(tBox.height/2+10);
var bb11=ny11+(tBox.height/2+10);
var bl11=nx11-(tBox.width/2+10);
var br11=nx11+(tBox.width/2+10);
var b11=paper.rect(bl11, bt11, br11-bl11, bb11-bt11, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx12=405;
var ny12=1352;
var t=paper.text(nx12,ny12,'Ratios and\nProportions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.501.C.1#Ratios and Proportions"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt12=ny12-(tBox.height/2+10);
var bb12=ny12+(tBox.height/2+10);
var bl12=nx12-(tBox.width/2+10);
var br12=nx12+(tBox.width/2+10);
var b12=paper.rect(bl12, bt12, br12-bl12, bb12-bt12, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx13=2258;
var ny13=1511;
var t=paper.text(nx13,ny13,'Rectangles, Rhombuses\nand Squares').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.431.C.1#Rectangles, Rhombuses and Squares"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt13=ny13-(tBox.height/2+10);
var bb13=ny13+(tBox.height/2+10);
var bl13=nx13-(tBox.width/2+10);
var br13=nx13+(tBox.width/2+10);
var b13=paper.rect(bl13, bt13, br13-bl13, bb13-bt13, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx14=560;
var ny14=1460;
var t=paper.text(nx14,ny14,'Similarity by AA').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.508.C.1#Similarity by AA"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt14=ny14-(tBox.height/2+10);
var bb14=ny14+(tBox.height/2+10);
var bl14=nx14-(tBox.width/2+10);
var br14=nx14+(tBox.width/2+10);
var b14=paper.rect(bl14, bt14, br14-bl14, bb14-bt14, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx15=752;
var ny15=1460;
var t=paper.text(nx15,ny15,'Similarity by SSS\nand SAS').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.511.C.1#Similarity by SSS and SAS"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt15=ny15-(tBox.height/2+10);
var bb15=ny15+(tBox.height/2+10);
var bl15=nx15-(tBox.width/2+10);
var br15=nx15+(tBox.width/2+10);
var b15=paper.rect(bl15, bt15, br15-bl15, bb15-bt15, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx16=1641;
var ny16=440;
var t=paper.text(nx16,ny16,'Inductive\nReasoning').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.086.C.1#Inductive Reasoning"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt16=ny16-(tBox.height/2+10);
var bb16=ny16+(tBox.height/2+10);
var bl16=nx16-(tBox.width/2+10);
var br16=nx16+(tBox.width/2+10);
var b16=paper.rect(bl16, bt16, br16-bl16, bb16-bt16, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx17=1780;
var ny17=440;
var t=paper.text(nx17,ny17,'Conditional\nStatements').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.090.C.1#Conditional Statements"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt17=ny17-(tBox.height/2+10);
var bb17=ny17+(tBox.height/2+10);
var bl17=nx17-(tBox.width/2+10);
var br17=nx17+(tBox.width/2+10);
var b17=paper.rect(bl17, bt17, br17-bl17, bb17-bt17, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx18=1780;
var ny18=551;
var t=paper.text(nx18,ny18,'Deductive\nReasoning').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.094.C.1#Deductive Reasoning"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt18=ny18-(tBox.height/2+10);
var bb18=ny18+(tBox.height/2+10);
var bl18=nx18-(tBox.width/2+10);
var br18=nx18+(tBox.width/2+10);
var b18=paper.rect(bl18, bt18, br18-bl18, bb18-bt18, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx19=2601;
var ny19=2354;
var t=paper.text(nx19,ny19,'Rigid Transformations').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt19=ny19-(tBox.height/2+10);
var bb19=ny19+(tBox.height/2+10);
var bl19=nx19-(tBox.width/2+10);
var br19=nx19+(tBox.width/2+10);
var b19=paper.rect(bl19, bt19, br19-bl19, bb19-bt19, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx20=1938;
var ny20=441;
var t=paper.text(nx20,ny20,'Algebraic and\nCongruence Properties').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.101.C.1#Algebraic and Congruence Properties"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt20=ny20-(tBox.height/2+10);
var bb20=ny20+(tBox.height/2+10);
var bl20=nx20-(tBox.width/2+10);
var br20=nx20+(tBox.width/2+10);
var b20=paper.rect(bl20, bt20, br20-bl20, bb20-bt20, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx21=965;
var ny21=1866;
var t=paper.text(nx21,ny21,'Inverse Trigonometric\nRatios').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.605.C.1#Inverse Trigonometric Ratios"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt21=ny21-(tBox.height/2+10);
var bb21=ny21+(tBox.height/2+10);
var bl21=nx21-(tBox.width/2+10);
var br21=nx21+(tBox.width/2+10);
var b21=paper.rect(bl21, bt21, br21-bl21, bb21-bt21, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx22=1868;
var ny22=865;
var t=paper.text(nx22,ny22,'Parallel and\nPerpendicular Lines').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt22=ny22-(tBox.height/2+10);
var bb22=ny22+(tBox.height/2+10);
var bl22=nx22-(tBox.width/2+10);
var br22=nx22+(tBox.width/2+10);
var b22=paper.rect(bl22, bt22, br22-bl22, bb22-bt22, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx23=631;
var ny23=1128;
var t=paper.text(nx23,ny23,'Triangle Congruence\nUsing SSS and SAS').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.261.C.1#Triangle Congruence Using SSS and SAS"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt23=ny23-(tBox.height/2+10);
var bb23=ny23+(tBox.height/2+10);
var bl23=nx23-(tBox.width/2+10);
var br23=nx23+(tBox.width/2+10);
var b23=paper.rect(bl23, bt23, br23-bl23, bb23-bt23, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx24=1675;
var ny24=1252;
var t=paper.text(nx24,ny24,'Proving Lines\nParallel').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.178.C.1#Proving Lines Parallel"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt24=ny24-(tBox.height/2+10);
var bb24=ny24+(tBox.height/2+10);
var bl24=nx24-(tBox.width/2+10);
var br24=nx24+(tBox.width/2+10);
var b24=paper.rect(bl24, bt24, br24-bl24, bb24-bt24, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx25=416;
var ny25=1000;
var t=paper.text(nx25,ny25,'Congruent Figures').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO256]..C.1#Congruent Figures"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt25=ny25-(tBox.height/2+10);
var bb25=ny25+(tBox.height/2+10);
var bl25=nx25-(tBox.width/2+10);
var br25=nx25+(tBox.width/2+10);
var b25=paper.rect(bl25, bt25, br25-bl25, bb25-bt25, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx26=1591;
var ny26=100;
var t=paper.text(nx26,ny26,'Geometry').attr({fill:"white","font-size": 24});
var tBox=t.getBBox(); 
var bt26=ny26-(tBox.height/2+10);
var bb26=ny26+(tBox.height/2+10);
var bl26=nx26-(tBox.width/2+10);
var br26=nx26+(tBox.width/2+10);
var b26=paper.rect(bl26, bt26, br26-bl26, bb26-bt26, 10).attr({stroke:"#7cbf00","stroke-width": "4"});

var nx27=1174;
var ny27=1129;
var t=paper.text(nx27,ny27,'Relationships\nwith Triangles').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt27=ny27-(tBox.height/2+10);
var bb27=ny27+(tBox.height/2+10);
var bl27=nx27-(tBox.width/2+10);
var br27=nx27+(tBox.width/2+10);
var b27=paper.rect(bl27, bt27, br27-bl27, bb27-bt27, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx28=2346;
var ny28=1807;
var t=paper.text(nx28,ny28,'Area and Perimeter\nof Regular Polygons').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.772.C.1#Area and Perimeter of Regular Polygons"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt28=ny28-(tBox.height/2+10);
var bb28=ny28+(tBox.height/2+10);
var bl28=nx28-(tBox.width/2+10);
var br28=nx28+(tBox.width/2+10);
var b28=paper.rect(bl28, bt28, br28-bl28, bb28-bt28, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx29=2081;
var ny29=1514;
var t=paper.text(nx29,ny29,'Proving Quadrilaterals\nare Parallelograms').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.427.C.1#Proving Quadrilaterals are Parallelograms"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt29=ny29-(tBox.height/2+10);
var bb29=ny29+(tBox.height/2+10);
var bl29=nx29-(tBox.width/2+10);
var br29=nx29+(tBox.width/2+10);
var b29=paper.rect(bl29, bt29, br29-bl29, bb29-bt29, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx30=2346;
var ny30=2107;
var t=paper.text(nx30,ny30,'Exploring Solids').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.832.C.1#Exploring Solids"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt30=ny30-(tBox.height/2+10);
var bb30=ny30+(tBox.height/2+10);
var bl30=nx30-(tBox.width/2+10);
var br30=nx30+(tBox.width/2+10);
var b30=paper.rect(bl30, bt30, br30-bl30, bb30-bt30, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx31=1344;
var ny31=1862;
var t=paper.text(nx31,ny31,'Circles').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt31=ny31-(tBox.height/2+10);
var bb31=ny31+(tBox.height/2+10);
var bl31=nx31-(tBox.width/2+10);
var br31=nx31+(tBox.width/2+10);
var b31=paper.rect(bl31, bt31, br31-bl31, bb31-bt31, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx32=904;
var ny32=1614;
var t=paper.text(nx32,ny32,'Right Angle\nTrigonometry').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt32=ny32-(tBox.height/2+10);
var bb32=ny32+(tBox.height/2+10);
var bl32=nx32-(tBox.width/2+10);
var br32=nx32+(tBox.width/2+10);
var b32=paper.rect(bl32, bt32, br32-bl32, bb32-bt32, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx33=1265;
var ny33=2106;
var t=paper.text(nx33,ny33,'Properties of Chords').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.675.C.1#Properties of Chords"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt33=ny33-(tBox.height/2+10);
var bb33=ny33+(tBox.height/2+10);
var bl33=nx33-(tBox.width/2+10);
var br33=nx33+(tBox.width/2+10);
var b33=paper.rect(bl33, bt33, br33-bl33, bb33-bt33, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx34=2508;
var ny34=2783;
var t=paper.text(nx34,ny34,'Extension: Tesselations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.937.C.1#Extension: Tesselations"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt34=ny34-(tBox.height/2+10);
var bb34=ny34+(tBox.height/2+10);
var bl34=nx34-(tBox.width/2+10);
var br34=nx34+(tBox.width/2+10);
var b34=paper.rect(bl34, bt34, br34-bl34, bb34-bt34, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx35=988;
var ny35=1739;
var t=paper.text(nx35,ny35,'Special Right Triangles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.596.C.1#Special Right Triangles"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt35=ny35-(tBox.height/2+10);
var bb35=ny35+(tBox.height/2+10);
var bl35=nx35-(tBox.width/2+10);
var br35=nx35+(tBox.width/2+10);
var b35=paper.rect(bl35, bt35, br35-bl35, bb35-bt35, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx36=1371;
var ny36=328;
var t=paper.text(nx36,ny36,'Points, Lines,\nand Planes').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.002.C.1#Points, Lines, and Planes"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt36=ny36-(tBox.height/2+10);
var bb36=ny36+(tBox.height/2+10);
var bl36=nx36-(tBox.width/2+10);
var br36=nx36+(tBox.width/2+10);
var b36=paper.rect(bl36, bt36, br36-bl36, bb36-bt36, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx37=2601;
var ny37=2236;
var t=paper.text(nx37,ny37,'Exploring Similar\nSolids').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.859.C.1#Exploring Similar Solids"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt37=ny37-(tBox.height/2+10);
var bb37=ny37+(tBox.height/2+10);
var bl37=nx37-(tBox.width/2+10);
var br37=nx37+(tBox.width/2+10);
var b37=paper.rect(bl37, bt37, br37-bl37, bb37-bt37, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx38=2439;
var ny38=2235;
var t=paper.text(nx38,ny38,'Surface Area and\nVolume of Spheres').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.855.C.1#Surface Area and Volume of Spheres"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt38=ny38-(tBox.height/2+10);
var bb38=ny38+(tBox.height/2+10);
var bl38=nx38-(tBox.width/2+10);
var br38=nx38+(tBox.width/2+10);
var b38=paper.rect(bl38, bt38, br38-bl38, bb38-bt38, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx39=2346;
var ny39=1673;
var t=paper.text(nx39,ny39,'Perimeter\nand Area').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt39=ny39-(tBox.height/2+10);
var bb39=ny39+(tBox.height/2+10);
var bl39=nx39-(tBox.width/2+10);
var br39=nx39+(tBox.width/2+10);
var b39=paper.rect(bl39, bt39, br39-bl39, bb39-bt39, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx40=527;
var ny40=1233;
var t=paper.text(nx40,ny40,'Similarity').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt40=ny40-(tBox.height/2+10);
var bb40=ny40+(tBox.height/2+10);
var bl40=nx40-(tBox.width/2+10);
var br40=nx40+(tBox.width/2+10);
var b40=paper.rect(bl40, bt40, br40-bl40, bb40-bt40, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx41=200;
var ny41=1126;
var t=paper.text(nx41,ny41,'Isosceles and Equilateral\nTriangles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.271.C.1#Isosceles and Equilateral Triangles"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt41=ny41-(tBox.height/2+10);
var bb41=ny41+(tBox.height/2+10);
var bl41=nx41-(tBox.width/2+10);
var br41=nx41+(tBox.width/2+10);
var b41=paper.rect(bl41, bt41, br41-bl41, bb41-bt41, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx42=2595;
var ny42=2593;
var t=paper.text(nx42,ny42,'Rotations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.929.C.1#Rotations"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt42=ny42-(tBox.height/2+10);
var bb42=ny42+(tBox.height/2+10);
var bl42=nx42-(tBox.width/2+10);
var br42=nx42+(tBox.width/2+10);
var b42=paper.rect(bl42, bt42, br42-bl42, bb42-bt42, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx43=1613;
var ny43=2113;
var t=paper.text(nx43,ny43,'Extension: Writing and Graphing\nthe Equations of Circles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.688.C.1#Extension: Writing and Graphing the Equations of Circles"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt43=ny43-(tBox.height/2+10);
var bb43=ny43+(tBox.height/2+10);
var bl43=nx43-(tBox.width/2+10);
var br43=nx43+(tBox.width/2+10);
var b43=paper.rect(bl43, bt43, br43-bl43, bb43-bt43, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx44=2167;
var ny44=1384;
var t=paper.text(nx44,ny44,'Properties of\nParallelograms').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.423.C.1#Properties of Parallelograms"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt44=ny44-(tBox.height/2+10);
var bb44=ny44+(tBox.height/2+10);
var bl44=nx44-(tBox.width/2+10);
var br44=nx44+(tBox.width/2+10);
var b44=paper.rect(bl44, bt44, br44-bl44, bb44-bt44, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx45=1331;
var ny45=1247;
var t=paper.text(nx45,ny45,'Medians and Altitudes\nin Triangles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.348.C.1#Medians and Altitudes in Triangles"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt45=ny45-(tBox.height/2+10);
var bb45=ny45+(tBox.height/2+10);
var bl45=nx45-(tBox.width/2+10);
var br45=nx45+(tBox.width/2+10);
var b45=paper.rect(bl45, bt45, br45-bl45, bb45-bt45, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx46=1174;
var ny46=1248;
var t=paper.text(nx46,ny46,'Angle Bisectors\nin Triangles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.344.C.1#Angle Bisectors in Triangles"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt46=ny46-(tBox.height/2+10);
var bb46=ny46+(tBox.height/2+10);
var bl46=nx46-(tBox.width/2+10);
var br46=nx46+(tBox.width/2+10);
var b46=paper.rect(bl46, bt46, br46-bl46, bb46-bt46, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx47=1353;
var ny47=2241;
var t=paper.text(nx47,ny47,'Segments of Chords,\nSecants, Tangents').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.684.C.1#Segments of Chords, Secants, Tangents"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt47=ny47-(tBox.height/2+10);
var bb47=ny47+(tBox.height/2+10);
var bl47=nx47-(tBox.width/2+10);
var br47=nx47+(tBox.width/2+10);
var b47=paper.rect(bl47, bt47, br47-bl47, bb47-bt47, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx48=2175;
var ny48=1806;
var t=paper.text(nx48,ny48,'Trapezoids, Rhombi,\nand Kites').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.756.C.1#Trapezoids, Rhombi, and Kites"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt48=ny48-(tBox.height/2+10);
var bb48=ny48+(tBox.height/2+10);
var bl48=nx48-(tBox.width/2+10);
var br48=nx48+(tBox.width/2+10);
var b48=paper.rect(bl48, bt48, br48-bl48, bb48-bt48, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx49=2093;
var ny49=2355;
var t=paper.text(nx49,ny49,'Volume of Prisms\nand Cylinders').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.847.C.1#Volume of Prisms and Cylinders"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt49=ny49-(tBox.height/2+10);
var bb49=ny49+(tBox.height/2+10);
var bl49=nx49-(tBox.width/2+10);
var br49=nx49+(tBox.width/2+10);
var b49=paper.rect(bl49, bt49, br49-bl49, bb49-bt49, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx50=638;
var ny50=1857;
var t=paper.text(nx50,ny50,'Converse of Pythagorean\nTheorem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.590.C.1#Converse of Pythagorean Theorem"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt50=ny50-(tBox.height/2+10);
var bb50=ny50+(tBox.height/2+10);
var bl50=nx50-(tBox.width/2+10);
var br50=nx50+(tBox.width/2+10);
var b50=paper.rect(bl50, bt50, br50-bl50, bb50-bt50, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx51=2167;
var ny51=1254;
var t=paper.text(nx51,ny51,'Polygons and\nQuadrilaterals').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt51=ny51-(tBox.height/2+10);
var bb51=ny51+(tBox.height/2+10);
var bl51=nx51-(tBox.width/2+10);
var br51=nx51+(tBox.width/2+10);
var b51=paper.rect(bl51, bt51, br51-bl51, bb51-bt51, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx52=1174;
var ny52=1006;
var t=paper.text(nx52,ny52,'Triangle Sums').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.252.C.1#Triangle Sums"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt52=ny52-(tBox.height/2+10);
var bb52=ny52+(tBox.height/2+10);
var bl52=nx52-(tBox.width/2+10);
var br52=nx52+(tBox.width/2+10);
var b52=paper.rect(bl52, bt52, br52-bl52, bb52-bt52, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx53=852;
var ny53=1247;
var t=paper.text(nx53,ny53,'Midsegments of\na Triangle').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.336.C.1#Midsegments of a Triangle"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt53=ny53-(tBox.height/2+10);
var bb53=ny53+(tBox.height/2+10);
var bl53=nx53-(tBox.width/2+10);
var br53=nx53+(tBox.width/2+10);
var b53=paper.rect(bl53, bt53, br53-bl53, bb53-bt53, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx54=2421;
var ny54=2591;
var t=paper.text(nx54,ny54,'Reflections').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.925.C.1#Reflections"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt54=ny54-(tBox.height/2+10);
var bb54=ny54+(tBox.height/2+10);
var bl54=nx54-(tBox.width/2+10);
var br54=nx54+(tBox.width/2+10);
var b54=paper.rect(bl54, bt54, br54-bl54, bb54-bt54, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx55=1467;
var ny55=439;
var t=paper.text(nx55,ny55,'Angles and\nMeasurement').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.011.C.1#Angles and Measurement"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt55=ny55-(tBox.height/2+10);
var bb55=ny55+(tBox.height/2+10);
var bl55=nx55-(tBox.width/2+10);
var br55=nx55+(tBox.width/2+10);
var b55=paper.rect(bl55, bt55, br55-bl55, bb55-bt55, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx56=654;
var ny56=1351;
var t=paper.text(nx56,ny56,'Similar Polygons').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.505.C.1#Similar Polygons"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt56=ny56-(tBox.height/2+10);
var bb56=ny56+(tBox.height/2+10);
var bl56=nx56-(tBox.width/2+10);
var br56=nx56+(tBox.width/2+10);
var b56=paper.rect(bl56, bt56, br56-bl56, bb56-bt56, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx57=1184;
var ny57=2240;
var t=paper.text(nx57,ny57,'Angles of Chords,\nSecants, Tangents').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.681.C.1#Angles of Chords, Secants, Tangents"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt57=ny57-(tBox.height/2+10);
var bb57=ny57+(tBox.height/2+10);
var bl57=nx57-(tBox.width/2+10);
var br57=nx57+(tBox.width/2+10);
var b57=paper.rect(bl57, bt57, br57-bl57, bb57-bt57, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx58=2271;
var ny58=2236;
var t=paper.text(nx58,ny58,'Surface Area of\nPyramids and Cones').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.843.C.1#Surface Area of Pyramids and Cones"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt58=ny58-(tBox.height/2+10);
var bb58=ny58+(tBox.height/2+10);
var bl58=nx58-(tBox.width/2+10);
var br58=nx58+(tBox.width/2+10);
var b58=paper.rect(bl58, bt58, br58-bl58, bb58-bt58, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx59=418;
var ny59=1606;
var t=paper.text(nx59,ny59,'Similarity Transformations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.518.C.1#Similarity Transformations"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt59=ny59-(tBox.height/2+10);
var bb59=ny59+(tBox.height/2+10);
var bl59=nx59-(tBox.width/2+10);
var br59=nx59+(tBox.width/2+10);
var b59=paper.rect(bl59, bt59, br59-bl59, bb59-bt59, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx60=1270;
var ny60=556;
var t=paper.text(nx60,ny60,'Midpoints and\nBisectors').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.018.C.1#Midpoints and Bisectors"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt60=ny60-(tBox.height/2+10);
var bb60=ny60+(tBox.height/2+10);
var bl60=nx60-(tBox.width/2+10);
var br60=nx60+(tBox.width/2+10);
var b60=paper.rect(bl60, bt60, br60-bl60, bb60-bt60, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx61=813;
var ny61=865;
var t=paper.text(nx61,ny61,'Triangles and\nCongruence').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt61=ny61-(tBox.height/2+10);
var bb61=ny61+(tBox.height/2+10);
var bl61=nx61-(tBox.width/2+10);
var br61=nx61+(tBox.width/2+10);
var b61=paper.rect(bl61, bt61, br61-bl61, bb61-bt61, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx62=1982;
var ny62=1253;
var t=paper.text(nx62,ny62,'Parallel and Perpendicular\nLines in the Coordinate Plane').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.183.C.1#Parallel and Perpendicular Lines in the Coordinate Plane"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt62=ny62-(tBox.height/2+10);
var bb62=ny62+(tBox.height/2+10);
var bl62=nx62-(tBox.width/2+10);
var br62=nx62+(tBox.width/2+10);
var b62=paper.rect(bl62, bt62, br62-bl62, bb62-bt62, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx63=821;
var ny63=1746;
var t=paper.text(nx63,ny63,'Using SImilar Right\nTriangles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.593.C.1#Using SImilar Right Triangles"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt63=ny63-(tBox.height/2+10);
var bb63=ny63+(tBox.height/2+10);
var bl63=nx63-(tBox.width/2+10);
var br63=nx63+(tBox.width/2+10);
var b63=paper.rect(bl63, bt63, br63-bl63, bb63-bt63, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx64=2271;
var ny64=2356;
var t=paper.text(nx64,ny64,'Volume of Pyramids\nand Cones').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.852.C.1#Volume of Pyramids and Cones"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt64=ny64-(tBox.height/2+10);
var bb64=ny64+(tBox.height/2+10);
var bl64=nx64-(tBox.width/2+10);
var br64=nx64+(tBox.width/2+10);
var b64=paper.rect(bl64, bt64, br64-bl64, bb64-bt64, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx65=1780;
var ny65=701;
var t=paper.text(nx65,ny65,'Proofs About Angle\nPairs and Segments').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.106.C.1#Proofs About Angle Pairs and Segments"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt65=ny65-(tBox.height/2+10);
var bb65=ny65+(tBox.height/2+10);
var bl65=nx65-(tBox.width/2+10);
var br65=nx65+(tBox.width/2+10);
var b65=paper.rect(bl65, bt65, br65-bl65, bb65-bt65, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx66=2695;
var ny66=2483;
var t=paper.text(nx66,ny66,'Translations and\nVectors').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.921.C.1#Translations and Vectors"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt66=ny66-(tBox.height/2+10);
var bb66=ny66+(tBox.height/2+10);
var bl66=nx66-(tBox.width/2+10);
var br66=nx66+(tBox.width/2+10);
var b66=paper.rect(bl66, bt66, br66-bl66, bb66-bt66, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx67=1778;
var ny67=330;
var t=paper.text(nx67,ny67,'Reasoning\nand Proof').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt67=ny67-(tBox.height/2+10);
var bb67=ny67+(tBox.height/2+10);
var bl67=nx67-(tBox.width/2+10);
var br67=nx67+(tBox.width/2+10);
var b67=paper.rect(bl67, bt67, br67-bl67, bb67-bt67, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx68=1591;
var ny68=199;
var t=paper.text(nx68,ny68,'Basics of\nGeometry').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt68=ny68-(tBox.height/2+10);
var bb68=ny68+(tBox.height/2+10);
var bl68=nx68-(tBox.width/2+10);
var br68=nx68+(tBox.width/2+10);
var b68=paper.rect(bl68, bt68, br68-bl68, bb68-bt68, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx69=1868;
var ny69=1002;
var t=paper.text(nx69,ny69,'Lines and Angles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.168.C.1#Lines and Angles"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt69=ny69-(tBox.height/2+10);
var bb69=ny69+(tBox.height/2+10);
var bl69=nx69-(tBox.width/2+10);
var br69=nx69+(tBox.width/2+10);
var b69=paper.rect(bl69, bt69, br69-bl69, bb69-bt69, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx70=2346;
var ny70=2001;
var t=paper.text(nx70,ny70,'Surface Area\nand Volume').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt70=ny70-(tBox.height/2+10);
var bb70=ny70+(tBox.height/2+10);
var bl70=nx70-(tBox.width/2+10);
var br70=nx70+(tBox.width/2+10);
var b70=paper.rect(bl70, bt70, br70-bl70, bb70-bt70, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx71=407;
var ny71=1456;
var t=paper.text(nx71,ny71,'Proportionality\nRelationships').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.514.C.1#Proportionality Relationships"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt71=ny71-(tBox.height/2+10);
var bb71=ny71+(tBox.height/2+10);
var bl71=nx71-(tBox.width/2+10);
var br71=nx71+(tBox.width/2+10);
var b71=paper.rect(bl71, bt71, br71-bl71, bb71-bt71, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx72=1487;
var ny72=1249;
var t=paper.text(nx72,ny72,'Inequalities in\nTriangles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.352.C.1#Inequalities in Triangles"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt72=ny72-(tBox.height/2+10);
var bb72=ny72+(tBox.height/2+10);
var bl72=nx72-(tBox.width/2+10);
var br72=nx72+(tBox.width/2+10);
var b72=paper.rect(bl72, bt72, br72-bl72, bb72-bt72, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx73=1956;
var ny73=1376;
var t=paper.text(nx73,ny73,'Angles in Polygons').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.419.C.1#Angles in Polygons"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt73=ny73-(tBox.height/2+10);
var bb73=ny73+(tBox.height/2+10);
var bl73=nx73-(tBox.width/2+10);
var br73=nx73+(tBox.width/2+10);
var b73=paper.rect(bl73, bt73, br73-bl73, bb73-bt73, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx74=418;
var ny74=1709;
var t=paper.text(nx74,ny74,'Extension: Self-Similarity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.521.C.1#Extension: Self-Similarity"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt74=ny74-(tBox.height/2+10);
var bb74=ny74+(tBox.height/2+10);
var bl74=nx74-(tBox.width/2+10);
var br74=nx74+(tBox.width/2+10);
var b74=paper.rect(bl74, bt74, br74-bl74, bb74-bt74, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx75=1016;
var ny75=1247;
var t=paper.text(nx75,ny75,'Perpendicular Bisectors\nin Triangles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.340.C.1#Perpendicular Bisectors in Triangles"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt75=ny75-(tBox.height/2+10);
var bb75=ny75+(tBox.height/2+10);
var bl75=nx75-(tBox.width/2+10);
var br75=nx75+(tBox.width/2+10);
var b75=paper.rect(bl75, bt75, br75-bl75, bb75-bt75, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx76=1163;
var ny76=1740;
var t=paper.text(nx76,ny76,'Tangent, Sine, Cosine').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.599.C.1#Tangent, Sine, Cosine"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt76=ny76-(tBox.height/2+10);
var bb76=ny76+(tBox.height/2+10);
var bl76=nx76-(tBox.width/2+10);
var br76=nx76+(tBox.width/2+10);
var b76=paper.rect(bl76, bt76, br76-bl76, bb76-bt76, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx77=1805;
var ny77=1252;
var t=paper.text(nx77,ny77,'The Distance\nFormula').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.192.C.1#The Distance Formula"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt77=ny77-(tBox.height/2+10);
var bb77=ny77+(tBox.height/2+10);
var bl77=nx77-(tBox.width/2+10);
var br77=nx77+(tBox.width/2+10);
var b77=paper.rect(bl77, bt77, br77-bl77, bb77-bt77, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx78=2503;
var ny78=1808;
var t=paper.text(nx78,ny78,'Area of Similar\nPolygons').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.760.C.1#Area of Similar Polygons"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt78=ny78-(tBox.height/2+10);
var bb78=ny78+(tBox.height/2+10);
var bl78=nx78-(tBox.width/2+10);
var br78=nx78+(tBox.width/2+10);
var b78=paper.rect(bl78, bt78, br78-bl78, bb78-bt78, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx79=2507;
var ny79=2477;
var t=paper.text(nx79,ny79,'Exploring Symmetry').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.917.C.1#Exploring Symmetry"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt79=ny79-(tBox.height/2+10);
var bb79=ny79+(tBox.height/2+10);
var bl79=nx79-(tBox.width/2+10);
var br79=nx79+(tBox.width/2+10);
var b79=paper.rect(bl79, bt79, br79-bl79, bb79-bt79, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx80=2659;
var ny80=1917;
var t=paper.text(nx80,ny80,'Area of Circles\nand Sectors').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.768.C.1#Area of Circles and Sectors"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt80=ny80-(tBox.height/2+10);
var bb80=ny80+(tBox.height/2+10);
var bl80=nx80-(tBox.width/2+10);
var br80=nx80+(tBox.width/2+10);
var b80=paper.rect(bl80, bt80, br80-bl80, bb80-bt80, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx81=2063;
var ny81=1130;
var t=paper.text(nx81,ny81,'Properties of\nPerpendicular Lines').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.183.C.1#Properties of Perpendicular Lines"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt81=ny81-(tBox.height/2+10);
var bb81=ny81+(tBox.height/2+10);
var bl81=nx81-(tBox.width/2+10);
var br81=nx81+(tBox.width/2+10);
var b81=paper.rect(bl81, bt81, br81-bl81, bb81-bt81, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx82=1344;
var ny82=1973;
var t=paper.text(nx82,ny82,'Parts of Circles\nand Tangent Lines').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.667.C.1#Parts of Circles and Tangent Lines"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt82=ny82-(tBox.height/2+10);
var bb82=ny82+(tBox.height/2+10);
var bl82=nx82-(tBox.width/2+10);
var br82=nx82+(tBox.width/2+10);
var b82=paper.rect(bl82, bt82, br82-bl82, bb82-bt82, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx83=1174;
var ny83=1398;
var t=paper.text(nx83,ny83,'Extension:\nIndirect Proof').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.356.C.1#Extension: Indirect Proof"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt83=ny83-(tBox.height/2+10);
var bb83=ny83+(tBox.height/2+10);
var bl83=nx83-(tBox.width/2+10);
var br83=nx83+(tBox.width/2+10);
var b83=paper.rect(bl83, bt83, br83-bl83, bb83-bt83, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx84=2412;
var ny84=1377;
var t=paper.text(nx84,ny84,'Trapezoids and Kites').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.435.C.1#Trapezoids and Kites"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt84=ny84-(tBox.height/2+10);
var bb84=ny84+(tBox.height/2+10);
var bl84=nx84-(tBox.width/2+10);
var br84=nx84+(tBox.width/2+10);
var b84=paper.rect(bl84, bt84, br84-bl84, bb84-bt84, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx85=2657;
var ny85=1807;
var t=paper.text(nx85,ny85,'Circumference and\nArc Length').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.GEO.764.C.1#Circumference and Arc Length"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt85=ny85-(tBox.height/2+10);
var bb85=ny85+(tBox.height/2+10);
var bl85=nx85-(tBox.width/2+10);
var br85=nx85+(tBox.width/2+10);
var b85=paper.rect(bl85, bt85, br85-bl85, bb85-bt85, 10).attr({stroke:"#bf5600","stroke-width": "2"});

bb86=1917
bt86=1917
bl86=2346
br86=2346
nx86=2346
ny86=1917

bb87=1320
bt87=1320
bl87=1174
br87=1174
nx87=1174
ny87=1320

bb88=1130
bt88=1130
bl88=1868
br88=1868
nx88=1868
ny88=1130

bb89=1461
bt89=1461
bl89=655
br89=655
nx89=655
ny89=1461

bb90=628
bt90=628
bl90=1780
br90=1780
nx90=1780
ny90=628

bb91=2592
bt91=2592
bl91=2508
br91=2508
nx91=2508
ny91=2592

bb92=1594
bt92=1594
bl92=2346
br92=2346
nx92=2346
ny92=1594

bb93=557
bt93=557
bl93=1368
br93=1368
nx93=1368
ny93=557

bb94=1127
bt94=1127
bl94=527
br94=527
nx94=527
ny94=1127

s='M '+nx0+' '+bb0+' L '+nx0+' '+bt50; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb65+(bt22-bb65)/2; 
s='M '+813+' '+mid+' L '+1868+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx2+' '+bb2+' L '+nx2+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx61+' '+mid+' L '+nx61+' '+bt61;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx22+' '+mid+' L '+nx22+' '+bt22;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx3+' '+bb3+' L '+nx3+' '+bt34; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx4+' '+bb4+' L '+nx4+' '+bt49; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br6+' '+1127+' L '+527+' '+1127; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx8+' '+bb8+' L '+nx8+' '+1917; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(2346-2016,1,0,0); 
h.translate(2016,1917); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2016+' '+1917+' L '+2346+' '+1917; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx9+' '+bb9+' L '+nx9+' '+bt60; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1368+' '+557+' L '+bl10+' '+557; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx11+' '+bb11+' L '+nx11+' '+bt24; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br11+' '+1130+' L '+1868+' '+1130; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx12+' '+bb12+' L '+nx12+' '+bt71; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx13+' '+bb13+' L '+nx13+' '+1594; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(2346-2258,1,0,0); 
h.translate(2258,1594); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2258+' '+1594+' L '+2346+' '+1594; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br14+' '+1461+' L '+655+' '+1461; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+655+' '+1461+' L '+bl15+' '+1461; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx16+' '+bb16+' L '+nx16+' '+628; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1780-1641,1,0,0); 
h.translate(1641,628); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1641+' '+628+' L '+1780+' '+628; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx17+' '+bb17+' L '+nx17+' '+bt18; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx18+' '+bb18+' L '+nx18+' '+628; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1780-1780,1,0,0); 
h.translate(1780,628); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1780+' '+628+' L '+1780+' '+628; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb19+(bt79-bb19)/2; 
s='M '+2507+' '+mid+' L '+2695+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx19+' '+bb19+' L '+nx19+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx79+' '+mid+' L '+nx79+' '+bt79;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx66+' '+mid+' L '+nx66+' '+bt66;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx20+' '+bb20+' L '+nx20+' '+628; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1938-1780,1,0,0); 
h.translate(1780,628); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1780+' '+628+' L '+1938+' '+628; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx22+' '+bb22+' L '+nx22+' '+bt69; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+527+' '+1127+' L '+bl23+' '+1127; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb25+(bt41-bb25)/2; 
s='M '+200+' '+mid+' L '+631+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx25+' '+bb25+' L '+nx25+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx23+' '+mid+' L '+nx23+' '+bt23;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx41+' '+mid+' L '+nx41+' '+bt41;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx6+' '+mid+' L '+nx6+' '+bt6;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx26+' '+bb26+' L '+nx26+' '+bt68; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb27+(bt75-bb27)/2; 
s='M '+852+' '+mid+' L '+1487+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx27+' '+bb27+' L '+nx27+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx53+' '+mid+' L '+nx53+' '+bt53;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx72+' '+mid+' L '+nx72+' '+bt72;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx45+' '+mid+' L '+nx45+' '+bt45;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx46+' '+mid+' L '+nx46+' '+bt46;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx75+' '+mid+' L '+nx75+' '+bt75;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx28+' '+bb28+' L '+nx28+' '+1917; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(2346-2346,1,0,0); 
h.translate(2346,1917); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2346+' '+1917+' L '+2346+' '+1917; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb30+(bt38-bb30)/2; 
s='M '+2091+' '+mid+' L '+2601+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx30+' '+bb30+' L '+nx30+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx38+' '+mid+' L '+nx38+' '+bt38;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx4+' '+mid+' L '+nx4+' '+bt4;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx58+' '+mid+' L '+nx58+' '+bt58;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx37+' '+mid+' L '+nx37+' '+bt37;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx31+' '+bb31+' L '+nx31+' '+bt82; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb32+(bt0-bb32)/2; 
s='M '+638+' '+mid+' L '+1163+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx32+' '+bb32+' L '+nx32+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx76+' '+mid+' L '+nx76+' '+bt76;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx35+' '+mid+' L '+nx35+' '+bt35;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx0+' '+mid+' L '+nx0+' '+bt0;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx63+' '+mid+' L '+nx63+' '+bt63;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb33+(bt57-bb33)/2; 
s='M '+1184+' '+mid+' L '+1353+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx33+' '+bb33+' L '+nx33+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx47+' '+mid+' L '+nx47+' '+bt47;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx57+' '+mid+' L '+nx57+' '+bt57;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb36+(bt55-bb36)/2; 
s='M '+1272+' '+mid+' L '+1467+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx36+' '+bb36+' L '+nx36+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx9+' '+mid+' L '+nx9+' '+bt9;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx55+' '+mid+' L '+nx55+' '+bt55;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx37+' '+bb37+' L '+nx37+' '+bt19; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb39+(bt8-bb39)/2; 
s='M '+2016+' '+mid+' L '+2657+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx39+' '+bb39+' L '+nx39+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx48+' '+mid+' L '+nx48+' '+bt48;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx8+' '+mid+' L '+nx8+' '+bt8;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx85+' '+mid+' L '+nx85+' '+bt85;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx28+' '+mid+' L '+nx28+' '+bt28;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx78+' '+mid+' L '+nx78+' '+bt78;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb40+(bt56-bb40)/2; 
s='M '+405+' '+mid+' L '+654+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx40+' '+bb40+' L '+nx40+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx12+' '+mid+' L '+nx12+' '+bt12;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx56+' '+mid+' L '+nx56+' '+bt56;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2508+' '+2592+' L '+bl42+' '+2592; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb44+(bt13-bb44)/2; 
s='M '+2081+' '+mid+' L '+2258+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx44+' '+bb44+' L '+nx44+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx13+' '+mid+' L '+nx13+' '+bt13;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx29+' '+mid+' L '+nx29+' '+bt29;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx45+' '+bb45+' L '+nx45+' '+1320; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1331-1174,1,0,0); 
h.translate(1174,1320); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1174+' '+1320+' L '+1331+' '+1320; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx46+' '+bb46+' L '+nx46+' '+1320; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1174-1174,1,0,0); 
h.translate(1174,1320); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1174+' '+1320+' L '+1174+' '+1320; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx48+' '+bb48+' L '+nx48+' '+1917; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(2346-2175,1,0,0); 
h.translate(2175,1917); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2175+' '+1917+' L '+2346+' '+1917; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb51+(bt73-bb51)/2; 
s='M '+1956+' '+mid+' L '+2412+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx51+' '+bb51+' L '+nx51+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx84+' '+mid+' L '+nx84+' '+bt84;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx73+' '+mid+' L '+nx73+' '+bt73;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx44+' '+mid+' L '+nx44+' '+bt44;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx52+' '+bb52+' L '+nx52+' '+bt27; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx53+' '+bb53+' L '+nx53+' '+1320; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1174-852,1,0,0); 
h.translate(852,1320); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+852+' '+1320+' L '+1174+' '+1320; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br54+' '+2592+' L '+2508+' '+2592; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx55+' '+bb55+' L '+nx55+' '+bt10; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb56+(bt14-bb56)/2; 
s='M '+560+' '+mid+' L '+752+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx56+' '+bb56+' L '+nx56+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx15+' '+mid+' L '+nx15+' '+bt15;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx14+' '+mid+' L '+nx14+' '+bt14;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx58+' '+bb58+' L '+nx58+' '+bt64; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx59+' '+bb59+' L '+nx59+' '+bt74; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br60+' '+557+' L '+1368+' '+557; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb61+(bt25-bb61)/2; 
s='M '+416+' '+mid+' L '+1174+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx61+' '+bb61+' L '+nx61+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx25+' '+mid+' L '+nx25+' '+bt25;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx52+' '+mid+' L '+nx52+' '+bt52;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb67+(bt17-bb67)/2; 
s='M '+1641+' '+mid+' L '+1938+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx67+' '+bb67+' L '+nx67+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx20+' '+mid+' L '+nx20+' '+bt20;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx16+' '+mid+' L '+nx16+' '+bt16;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx17+' '+mid+' L '+nx17+' '+bt17;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb68+(bt36-bb68)/2; 
s='M '+1371+' '+mid+' L '+1778+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx68+' '+bb68+' L '+nx68+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx67+' '+mid+' L '+nx67+' '+bt67;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx36+' '+mid+' L '+nx36+' '+bt36;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb69+(bt11-bb69)/2; 
s='M '+1675+' '+mid+' L '+2063+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx69+' '+bb69+' L '+nx69+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx81+' '+mid+' L '+nx81+' '+bt81;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx11+' '+mid+' L '+nx11+' '+bt11;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx70+' '+bb70+' L '+nx70+' '+bt30; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx72+' '+bb72+' L '+nx72+' '+1320; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1487-1174,1,0,0); 
h.translate(1174,1320); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1174+' '+1320+' L '+1487+' '+1320; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx75+' '+bb75+' L '+nx75+' '+1320; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1174-1016,1,0,0); 
h.translate(1016,1320); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1016+' '+1320+' L '+1174+' '+1320; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb76+(bt31-bb76)/2; 
s='M '+965+' '+mid+' L '+1344+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx76+' '+bb76+' L '+nx76+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx21+' '+mid+' L '+nx21+' '+bt21;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx1+' '+mid+' L '+nx1+' '+bt1;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx31+' '+mid+' L '+nx31+' '+bt31;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb79+(bt54-bb79)/2; 
s='M '+2421+' '+mid+' L '+2595+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx79+' '+bb79+' L '+nx79+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx54+' '+mid+' L '+nx54+' '+bt54;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx42+' '+mid+' L '+nx42+' '+bt42;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2346+' '+1917+' L '+bl80+' '+1917; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1868+' '+1130+' L '+bl81+' '+1130; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb82+(bt7-bb82)/2; 
s='M '+1104+' '+mid+' L '+1613+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx82+' '+bb82+' L '+nx82+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx5+' '+mid+' L '+nx5+' '+bt5;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx33+' '+mid+' L '+nx33+' '+bt33;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx7+' '+mid+' L '+nx7+' '+bt7;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx43+' '+mid+' L '+nx43+' '+bt43;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx84+' '+bb84+' L '+nx84+' '+1594; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(2412-2346,1,0,0); 
h.translate(2346,1594); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2346+' '+1594+' L '+2412+' '+1594; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx85+' '+bb85+' L '+nx85+' '+bt80; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx86+' '+bb86+' L '+nx86+' '+bt70; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx87+' '+bb87+' L '+nx87+' '+bt83; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb88+(bt77-bb88)/2; 
s='M '+1805+' '+mid+' L '+2167+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx88+' '+bb88+' L '+nx88+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx62+' '+mid+' L '+nx62+' '+bt62;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx77+' '+mid+' L '+nx77+' '+bt77;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx51+' '+mid+' L '+nx51+' '+bt51;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb89+(bt59-bb89)/2; 
s='M '+418+' '+mid+' L '+904+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx89+' '+bb89+' L '+nx89+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx59+' '+mid+' L '+nx59+' '+bt59;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx32+' '+mid+' L '+nx32+' '+bt32;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx90+' '+bb90+' L '+nx90+' '+bt65; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx91+' '+bb91+' L '+nx91+' '+bt3; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx92+' '+bb92+' L '+nx92+' '+bt39; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx93+' '+bb93+' L '+nx93+' '+bt2; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx94+' '+bb94+' L '+nx94+' '+bt40; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

function handle(delta) {
	if (delta < 0) {
	    if (canvasWidth <= mapWidth || canvasHeight <= mapHeight) {
	    	zoomStep = canvasWidth/zoomFactor;
	    	canvasWidth = canvasWidth + zoomStep;
	    	canvasHeight = canvasHeight + zoomStep/aspectRatio;
	    	xorig = xorig - zoomStep/2;
	    	yorig = yorig - (zoomStep/aspectRatio)/2;
 	    }
	} else {
	    if (canvasWidth >= 700) {
	        zoomStep = canvasWidth/zoomFactor;
	    	canvasWidth = canvasWidth - zoomStep;
	    	canvasHeight = canvasHeight - zoomStep/aspectRatio;
	    	xorig = xorig + zoomStep/2;
            	yorig = yorig + (zoomStep/aspectRatio)/2;
	    }
	}
}
 
/* Event handler for mouse wheel event. */
function wheel(event){
        var delta = 0;
        if (!event) /* For IE. */
                event = window.event;

	/* Get cursor position first */
	if (event.pageX || event.pageY) 	{
		posx = event.pageX;
		posy = event.pageY;
	}
	else if (event.clientX || event.clientY) 	{
		posx = event.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		posy = event.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}

	/* Get mousewheel movement */
        if (event.wheelDelta) { /* IE/Opera. */
                delta = event.wheelDelta/120;
        } else if (event.detail) { /** Mozilla case. */
                /** In Mozilla, sign of delta is different than in IE.
                 * Also, delta is multiple of 3.
                 */
                delta = -event.detail/3;
        }
        /** If delta is nonzero, handle it.
         * Basically, delta is now positive if wheel was scrolled up,
         * and negative, if wheel was scrolled down.
         */
        if (delta){
                handle(delta);
		paper.setViewBox(xorig,yorig,canvasWidth,canvasHeight,true);
	}
        /** Prevent default actions caused by mouse wheel.
         * That might be ugly, but we handle scrolls somehow
         * anyway, so don't bother here..
         */
        if (event.preventDefault)
                event.preventDefault();
	event.returnValue = false;
}


// Determine browser and version.

function Browser() {

  var ua, s, i;

  this.isIE    = false;
  this.isNS    = false;
  this.version = null;

  ua = navigator.userAgent;

  s = "MSIE";
  if ((i = ua.indexOf(s)) >= 0) {
    this.isIE = true;
    this.version = parseFloat(ua.substr(i + s.length));
    return;
  }

  s = "Netscape6/";
  if ((i = ua.indexOf(s)) >= 0) {
    this.isNS = true;
    this.version = parseFloat(ua.substr(i + s.length));
    return;
  }

  // Treat any other "Gecko" browser as NS 6.1.

  s = "Gecko";
  if ((i = ua.indexOf(s)) >= 0) {
    this.isNS = true;
    this.version = 6.1;
    return;
  }
}

var browser = new Browser();

// Global object to hold drag information.

var dragObj = new Object();
//dragObj.zIndex = 0;


function dragStart(event, id) {

  var el;
  var x, y;

  // If an element id was given, find it. Otherwise use the element being
  // clicked on.

  if (id)
    dragObj.elNode = document.getElementById(id);
  else {
    if (browser.isIE)
      dragObj.elNode = window.event.srcElement;
    if (browser.isNS)
      dragObj.elNode = event.target;

    // If this is a text node, use its parent element.

    if (dragObj.elNode.nodeType == 3)
      dragObj.elNode = dragObj.elNode.parentNode;
  }

  // Get cursor position with respect to the page.

  if (browser.isIE) {
    x = window.event.clientX + document.documentElement.scrollLeft
      + document.body.scrollLeft;
    y = window.event.clientY + document.documentElement.scrollTop
      + document.body.scrollTop;
  }
  if (browser.isNS) {
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;
  }

  // Save starting positions of cursor and element.

  dragObj.cursorStartX = x;
  dragObj.cursorStartY = y;
  //dragObj.elStartLeft  = parseInt(dragObj.elNode.style.left, 10);
  //dragObj.elStartTop   = parseInt(dragObj.elNode.style.top,  10);

  //if (isNaN(dragObj.elStartLeft)) dragObj.elStartLeft = 0;
  //if (isNaN(dragObj.elStartTop))  dragObj.elStartTop  = 0;

  // Update element's z-index.

  //  dragObj.elNode.style.zIndex = ++dragObj.zIndex;

  // Capture mousemove and mouseup events on the page.

  if (browser.isIE) {
    document.attachEvent("onmousemove", dragGo);
    document.attachEvent("onmouseup",   dragStop);
    window.event.cancelBubble = true;
    window.event.returnValue = false;
  }
  if (browser.isNS) {
    document.addEventListener("mousemove", dragGo,   true);
    document.addEventListener("mouseup",   dragStop, true);
    event.preventDefault();
  }
}

function dragGo(event) {

  var x, y;
  var dx, dy;

  // Get cursor position with respect to the page.

  if (browser.isIE) {
    x = window.event.clientX + document.documentElement.scrollLeft
      + document.body.scrollLeft;
    y = window.event.clientY + document.documentElement.scrollTop
      + document.body.scrollTop;
  }
  if (browser.isNS) {
      x = event.clientX + window.scrollX;
      y = event.clientY + window.scrollY;
  }

  // Move drag element by the same amount the cursor has moved.

  //dragObj.elNode.style.left = (dragObj.elStartLeft + x - dragObj.cursorStartX) + "px";
  //dragObj.elNode.style.top  = (dragObj.elStartTop  + y - dragObj.cursorStartY) + "px";
  
  dx = dragObj.cursorStartX-x;
  dy = dragObj.cursorStartY-y;
  xorig = xorig + dx*(canvasWidth/boxWidth);
  yorig = yorig + dy*(canvasWidth/boxWidth);
  paper.setViewBox(xorig,yorig,canvasWidth,canvasHeight,true);

  if (browser.isIE) {
    window.event.cancelBubble = true;
    window.event.returnValue = false;
  }
  if (browser.isNS)
    event.preventDefault();

  dragObj.cursorStartX = x;
  dragObj.cursorStartY = y;
}

function dragStop(event) {

  // Stop capturing mousemove and mouseup events.

  if (browser.isIE) {
    document.detachEvent("onmousemove", dragGo);
    document.detachEvent("onmouseup",   dragStop);
  }
  if (browser.isNS) {
    document.removeEventListener("mousemove", dragGo,   true);
    document.removeEventListener("mouseup",   dragStop, true);
  }
}


/* Initialization code. */
var elem = document.getElementById ("holder");
if (elem.addEventListener) {
	elem.addEventListener('DOMMouseScroll', wheel, false);
        elem.addEventListener('mousedown', dragStart, false);
}
elem.onmousewheel = wheel;
elem.onmousedown = dragStart;

}