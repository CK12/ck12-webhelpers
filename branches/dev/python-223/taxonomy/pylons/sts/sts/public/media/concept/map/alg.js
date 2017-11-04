window.onload = function() { 

mapWidth = 2199; 
mapHeight = 3753; 

boxWidth = 900; 
boxHeight = 600; 
aspectRatio = boxWidth/boxHeight; 
zoomFactor = 5; 

var paper = Raphael(document.getElementById('holder'), 900, 600); 

canvasWidth = boxWidth; 
canvasHeight = boxHeight; 

rootx = 896; 
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
var nx0=799;
var ny0=2155;
var t=paper.text(nx0,ny0,'Solving Linear\nSystems by\nElimination').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.510.C.1#Solving Linear Systems by Elimination"});
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

var nx1=270;
var ny1=1900;
var t=paper.text(nx1,ny1,'Using\nInequalities').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.423.C.1#Using Inequalities"});
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

var nx2=1141;
var ny2=2152;
var t=paper.text(nx2,ny2,'Quadratic Equations\nby Graphing').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.755.C.1#Quadratic Equations by Graphing"});
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

var nx3=1224;
var ny3=3394;
var t=paper.text(nx3,ny3,'Multiplying and\nDividing Rational\nExpressions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.931.C.1#Multiplying and Dividing Rational Expressions"});
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

var nx4=1534;
var ny4=3024;
var t=paper.text(nx4,ny4,'Polynomial Equations\nin Factored Form').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.677.C.1#Polynomial Equations in Factored Form"});
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

var nx5=1671;
var ny5=2669;
var t=paper.text(nx5,ny5,'Exponent Propertiies\nInvolving Quotients').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.587.C.1#Exponent Propertiies Involving Quotients"});
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

var nx6=446;
var ny6=459;
var t=paper.text(nx6,ny6,'Order of\nOperations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.005.C.1#Order of Operations"});
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

var nx7=405;
var ny7=1768;
var t=paper.text(nx7,ny7,'Solving\nInequalities').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.418.C.1#Solving Inequalities"});
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

var nx8=1861;
var ny8=2671;
var t=paper.text(nx8,ny8,'Zero, Negative,\nand Fractional Exponents').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.590.C.1#Zero, Negative, and Fractional Exponents"});
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

var nx9=447;
var ny9=1345;
var t=paper.text(nx9,ny9,'Graphs Using\nSlope-Intercept Form').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.269.C.1#Graphs Using Slope-Intercept Form"});
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

var nx10=446;
var ny10=985;
var t=paper.text(nx10,ny10,'The Coordinate\nPlane').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.251.C.1#The Coordinate Plane"});
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

var nx11=896;
var ny11=100;
var t=paper.text(nx11,ny11,'Algebra I').attr({fill:"white","font-size": 24});
var tBox=t.getBBox(); 
var bt11=ny11-(tBox.height/2+10);
var bb11=ny11+(tBox.height/2+10);
var bl11=nx11-(tBox.width/2+10);
var br11=nx11+(tBox.width/2+10);
var b11=paper.rect(bl11, bt11, br11-bl11, bb11-bt11, 10).attr({stroke:"#7cbf00","stroke-width": "4"});

var nx12=750;
var ny12=980;
var t=paper.text(nx12,ny12,'One-Step\nEquations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.169.C.1#One-Step Equations"});
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

var nx13=1530;
var ny13=1229;
var t=paper.text(nx13,ny13,'The Pythagorean Theorem\nand Its Converse').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.848.C.1#The Pythagorean Theorem and Its Converse"});
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

var nx14=1086;
var ny14=3134;
var t=paper.text(nx14,ny14,'Inverse Variation\nModels').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.915.C.1#Inverse Variation Models"});
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

var nx15=1320;
var ny15=710;
var t=paper.text(nx15,ny15,'Square Roots and\nReal Numbers').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.107.C.1#Square Roots and Real Numbers"});
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

var nx16=1999;
var ny16=2804;
var t=paper.text(nx16,ny16,'Exponential\nFunctions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.602.C.1#Exponential Functions"});
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

var nx17=698;
var ny17=1907;
var t=paper.text(nx17,ny17,'Solving Systems of\nEquations and \nInequalities').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt17=ny17-(tBox.height/2+10);
var bb17=ny17+(tBox.height/2+10);
var bl17=nx17-(tBox.width/2+10);
var br17=nx17+(tBox.width/2+10);
var b17=paper.rect(bl17, bt17, br17-bl17, bb17-bt17, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx18=344;
var ny18=609;
var t=paper.text(nx18,ny18,'Patterns and\nEquations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.010.C.1#Patterns and Equations"});
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

var nx19=1317;
var ny19=2759;
var t=paper.text(nx19,ny19,'Multiplication of\nPolynomials').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.671.C.1#Multiplication of Polynomials"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt19=ny19-(tBox.height/2+10);
var bb19=ny19+(tBox.height/2+10);
var bl19=nx19-(tBox.width/2+10);
var br19=nx19+(tBox.width/2+10);
var b19=paper.rect(bl19, bt19, br19-bl19, bb19-bt19, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx20=1038;
var ny20=1901;
var t=paper.text(nx20,ny20,'Fitting a Line\nto Data').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.347.C.1#Fitting a Line to Data"});
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

var nx21=1377;
var ny21=3160;
var t=paper.text(nx21,ny21,'Factoring Quadratic\nExpressions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.681.C.1#Factoring Quadratic Expressions"});
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

var nx22=551;
var ny22=721;
var t=paper.text(nx22,ny22,'Functions as\nGraphs').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.023.C.1#Functions as Graphs"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt22=ny22-(tBox.height/2+10);
var bb22=ny22+(tBox.height/2+10);
var bl22=nx22-(tBox.width/2+10);
var br22=nx22+(tBox.width/2+10);
var b22=paper.rect(bl22, bt22, br22-bl22, bb22-bt22, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx23=1315;
var ny23=2875;
var t=paper.text(nx23,ny23,'Special Products\nof Polynomials').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.674.C.1#Special Products of Polynomials"});
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

var nx24=446;
var ny24=354;
var t=paper.text(nx24,ny24,'Variable Expressions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.002.C.1#Variable Expressions"});
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

var nx25=403;
var ny25=1652;
var t=paper.text(nx25,ny25,'Linear\nInequalities').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt25=ny25-(tBox.height/2+10);
var bb25=ny25+(tBox.height/2+10);
var bl25=nx25-(tBox.width/2+10);
var br25=nx25+(tBox.width/2+10);
var b25=paper.rect(bl25, bt25, br25-bl25, bb25-bt25, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx26=1671;
var ny26=2545;
var t=paper.text(nx26,ny26,'Exponential\nFunctions').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt26=ny26-(tBox.height/2+10);
var bb26=ny26+(tBox.height/2+10);
var bl26=nx26-(tBox.width/2+10);
var br26=nx26+(tBox.width/2+10);
var b26=paper.rect(bl26, bt26, br26-bl26, bb26-bt26, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx27=1315;
var ny27=2277;
var t=paper.text(nx27,ny27,'Solving Quadratic\nEquations by\nCompleting the Square').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.762.C.1#Solving Quadratic Equations by Completing the Square"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt27=ny27-(tBox.height/2+10);
var bb27=ny27+(tBox.height/2+10);
var bl27=nx27-(tBox.width/2+10);
var br27=nx27+(tBox.width/2+10);
var b27=paper.rect(bl27, bt27, br27-bl27, bb27-bt27, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx28=1322;
var ny28=360;
var t=paper.text(nx28,ny28,'Integers and\nRational Numbers').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.085.C.1#Integers and Rational Numbers"});
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

var nx29=749;
var ny29=863;
var t=paper.text(nx29,ny29,'Equations of\nLines').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt29=ny29-(tBox.height/2+10);
var bb29=ny29+(tBox.height/2+10);
var bl29=nx29-(tBox.width/2+10);
var br29=nx29+(tBox.width/2+10);
var b29=paper.rect(bl29, bt29, br29-bl29, bb29-bt29, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx30=1315;
var ny30=2643;
var t=paper.text(nx30,ny30,'Addition and\nSubtraction of\nPolynomials').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.666.C.1#Addition and Subtraction of Polynomials"});
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

var nx31=1698;
var ny31=3161;
var t=paper.text(nx31,ny31,'Factoring Polynomials\nCompletely').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.691.C.1#Factoring Polynomials Completely"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt31=ny31-(tBox.height/2+10);
var bb31=ny31+(tBox.height/2+10);
var bl31=nx31-(tBox.width/2+10);
var br31=nx31+(tBox.width/2+10);
var b31=paper.rect(bl31, bt31, br31-bl31, bb31-bt31, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx32=342;
var ny32=720;
var t=paper.text(nx32,ny32,'Equations and\nInequalities').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.014.C.1#Equations and Inequalities"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt32=ny32-(tBox.height/2+10);
var bb32=ny32+(tBox.height/2+10);
var bl32=nx32-(tBox.width/2+10);
var br32=nx32+(tBox.width/2+10);
var b32=paper.rect(bl32, bt32, br32-bl32, bb32-bt32, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx33=446;
var ny33=859;
var t=paper.text(nx33,ny33,'Graphs of Equations\nand Functions').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt33=ny33-(tBox.height/2+10);
var bb33=ny33+(tBox.height/2+10);
var bl33=nx33-(tBox.width/2+10);
var br33=nx33+(tBox.width/2+10);
var b33=paper.rect(bl33, bt33, br33-bl33, bb33-bt33, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx34=543;
var ny34=1907;
var t=paper.text(nx34,ny34,'Absolute Value\nEquations and\nInequalities').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.430.C.1#Absolute Value Equations and Inequalities"});
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

var nx35=933;
var ny35=3268;
var t=paper.text(nx35,ny35,'Graphs of\nRational Functions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.919.C.1#Graphs of Rational Functions"});
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

var nx36=405;
var ny36=1900;
var t=paper.text(nx36,ny36,'Compound\nInequalities').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.426.C.1#Compound Inequalities"});
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

var nx37=874;
var ny37=1907;
var t=paper.text(nx37,ny37,'Equations of\nParallel and\nPerpendicular Lines').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.343.C.1#Equations of Parallel and Perpendicular Lines"});
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

var nx38=405;
var ny38=2022;
var t=paper.text(nx38,ny38,'Linear Inequalities\nin Two Variables').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.438.C.1#Linear Inequalities in Two Variables"});
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

var nx39=1315;
var ny39=2533;
var t=paper.text(nx39,ny39,'Polynomials').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt39=ny39-(tBox.height/2+10);
var bb39=ny39+(tBox.height/2+10);
var bl39=nx39-(tBox.width/2+10);
var br39=nx39+(tBox.width/2+10);
var b39=paper.rect(bl39, bt39, br39-bl39, bb39-bt39, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx40=750;
var ny40=1105;
var t=paper.text(nx40,ny40,'Two-Step\nEquations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.172.C.1#Two-Step Equations"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt40=ny40-(tBox.height/2+10);
var bb40=ny40+(tBox.height/2+10);
var bl40=nx40-(tBox.width/2+10);
var br40=nx40+(tBox.width/2+10);
var b40=paper.rect(bl40, bt40, br40-bl40, bb40-bt40, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx41=1224;
var ny41=3653;
var t=paper.text(nx41,ny41,'Solutions of\nRational Equations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.941.C.1#Solutions of Rational Equations"});
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

var nx42=1522;
var ny42=710;
var t=paper.text(nx42,ny42,'Problem Solving Strategies:\nGuess and Check, Work Backward').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.112.C.1#Problem Solving Strategies: Guess and Check, Work Backward"});
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

var nx43=1534;
var ny43=3160;
var t=paper.text(nx43,ny43,'Factoring\nSpecial Products').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.687.C.1#Factoring Special Products"});
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

var nx44=1722;
var ny44=2804;
var t=paper.text(nx44,ny44,'Scientific\nNotation').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.595.C.1#Scientific Notation"});
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

var nx45=1322;
var ny45=254;
var t=paper.text(nx45,ny45,'Real Numbers').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt45=ny45-(tBox.height/2+10);
var bb45=ny45+(tBox.height/2+10);
var bl45=nx45-(tBox.width/2+10);
var br45=nx45+(tBox.width/2+10);
var b45=paper.rect(bl45, bt45, br45-bl45, bb45-bt45, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx46=624;
var ny46=2295;
var t=paper.text(nx46,ny46,'Special Types of\nLinear Systems').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.517.C.1#Special Types of Linear Systems"});
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

var nx47=1320;
var ny47=582;
var t=paper.text(nx47,ny47,'Multiplying and Dividing\nRational Numbers').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.097.C.1#Multiplying and Dividing Rational Numbers"});
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

var nx48=783;
var ny48=2295;
var t=paper.text(nx48,ny48,'Systems of\nLinear Inequalities').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.521.C.1#Systems of Linear Inequalities"});
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

var nx49=1530;
var ny49=1118;
var t=paper.text(nx49,ny49,'Radical\nEquations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.844.C.1#Radical Equations"});
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

var nx50=1174;
var ny50=710;
var t=paper.text(nx50,ny50,'The Distributive\nProperty').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.104.C.1#The Distributive Property"});
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

var nx51=602;
var ny51=2153;
var t=paper.text(nx51,ny51,'Solving Linear\nSystems by\nSubstitution').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.506.C.1#Solving Linear Systems by Substitution"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt51=ny51-(tBox.height/2+10);
var bb51=ny51+(tBox.height/2+10);
var bl51=nx51-(tBox.width/2+10);
var br51=nx51+(tBox.width/2+10);
var b51=paper.rect(bl51, bt51, br51-bl51, bb51-bt51, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx52=1861;
var ny52=2804;
var t=paper.text(nx52,ny52,'Geometric\nSequences').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.599.C.1#Geometric Sequences"});
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

var nx53=521;
var ny53=1479;
var t=paper.text(nx53,ny53,'Linear Function\nGraphs').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.276.C.1#Linear Function Graphs"});
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

var nx54=446;
var ny54=250;
var t=paper.text(nx54,ny54,'Equations and\nFunctions').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt54=ny54-(tBox.height/2+10);
var bb54=ny54+(tBox.height/2+10);
var bl54=nx54-(tBox.width/2+10);
var br54=nx54+(tBox.width/2+10);
var b54=paper.rect(bl54, bt54, br54-bl54, bb54-bt54, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx55=1447;
var ny55=877;
var t=paper.text(nx55,ny55,'Algebra and Geometry\nConnections').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt55=ny55-(tBox.height/2+10);
var bb55=ny55+(tBox.height/2+10);
var bl55=nx55-(tBox.width/2+10);
var br55=nx55+(tBox.width/2+10);
var b55=paper.rect(bl55, bt55, br55-bl55, bb55-bt55, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx56=699;
var ny56=2019;
var t=paper.text(nx56,ny56,'Linear Systems\nby Graphing').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.502.C.1#Linear Systems by Graphing"});
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

var nx57=1999;
var ny57=2924;
var t=paper.text(nx57,ny57,'Applications of\nExponential Functions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.605.C.1#Applications of Exponential Functions"});
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

var nx58=1086;
var ny58=3023;
var t=paper.text(nx58,ny58,'Rational Equations\nand Functions').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt58=ny58-(tBox.height/2+10);
var bb58=ny58+(tBox.height/2+10);
var bl58=nx58-(tBox.width/2+10);
var br58=nx58+(tBox.width/2+10);
var b58=paper.rect(bl58, bt58, br58-bl58, bb58-bt58, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx59=1369;
var ny59=1014;
var t=paper.text(nx59,ny59,'Graphs of\nSquare Root\nFunctions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.834.C.1#Graphs of Square Root Functions"});
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

var nx60=1999;
var ny60=3045;
var t=paper.text(nx60,ny60,'Linear, Exponential,\nand Quadratic Models').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.773.C.1#Linear, Exponential, and Quadratic Models"});
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

var nx61=446;
var ny61=1110;
var t=paper.text(nx61,ny61,'Graphs of\nLinear Equations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.257.C.1#Graphs of Linear Equations"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt61=ny61-(tBox.height/2+10);
var bb61=ny61+(tBox.height/2+10);
var bl61=nx61-(tBox.width/2+10);
var br61=nx61+(tBox.width/2+10);
var b61=paper.rect(bl61, bt61, br61-bl61, bb61-bt61, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx62=200;
var ny62=991;
var t=paper.text(nx62,ny62,'Problem-Solving\nStrategies:\nMake a Table and Look\nfor a Pattern').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.032.C.1#Problem-Solving Strategies: Make a Table and Look for a Pattern"});
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

var nx63=831;
var ny63=1367;
var t=paper.text(nx63,ny63,'Ratios and\nProportions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.184.C.1#Ratios and Proportions"});
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

var nx64=200;
var ny64=861;
var t=paper.text(nx64,ny64,'Problem-Solving\nPlan').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.027.C.1#Problem-Solving Plan"});
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

var nx65=550;
var ny65=610;
var t=paper.text(nx65,ny65,'Functions as Rules\nand Tables').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.018.C.1#Functions as Rules and Tables"});
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

var nx66=1226;
var ny66=1901;
var t=paper.text(nx66,ny66,'Quadratic Equations and\nQuadratic Functions').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt66=ny66-(tBox.height/2+10);
var bb66=ny66+(tBox.height/2+10);
var bl66=nx66-(tBox.width/2+10);
var br66=nx66+(tBox.width/2+10);
var b66=paper.rect(bl66, bt66, br66-bl66, bb66-bt66, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx67=1315;
var ny67=2404;
var t=paper.text(nx67,ny67,'Solving Quadratic\nEquations by the\nQuadratic Formula').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.766.C.1#Solving Quadratic Equations by the Quadratic Formula"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt67=ny67-(tBox.height/2+10);
var bb67=ny67+(tBox.height/2+10);
var bl67=nx67-(tBox.width/2+10);
var br67=nx67+(tBox.width/2+10);
var b67=paper.rect(bl67, bt67, br67-bl67, bb67-bt67, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx68=1315;
var ny68=2152;
var t=paper.text(nx68,ny68,'Quadratic Equations\nby Square Roots').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.759.C.1#Quadratic Equations by Square Roots"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt68=ny68-(tBox.height/2+10);
var bb68=ny68+(tBox.height/2+10);
var bl68=nx68-(tBox.width/2+10);
var br68=nx68+(tBox.width/2+10);
var b68=paper.rect(bl68, bt68, br68-bl68, bb68-bt68, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx69=1040;
var ny69=2019;
var t=paper.text(nx69,ny69,'Predicting With\nLinear Models').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.352.C.1#Predicting With Linear Models"});
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

var nx70=1530;
var ny70=1345;
var t=paper.text(nx70,ny70,'Distance and\nMidpoint Formulas').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.852.C.1#Distance and Midpoint Formulas"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt70=ny70-(tBox.height/2+10);
var bb70=ny70+(tBox.height/2+10);
var bl70=nx70-(tBox.width/2+10);
var br70=nx70+(tBox.width/2+10);
var b70=paper.rect(bl70, bt70, br70-bl70, bb70-bt70, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx71=750;
var ny71=1234;
var t=paper.text(nx71,ny71,'Multi-Step\nEquations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.175.C.1#Multi-Step Equations"});
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

var nx72=1497;
var ny72=2669;
var t=paper.text(nx72,ny72,'Exponent Properties\nInvolving Products').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.584.C.1#Exponent Properties Involving Products"});
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

var nx73=542;
var ny73=1233;
var t=paper.text(nx73,ny73,'Slope and\nRate of Change').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.264.C.1#Slope and Rate of Change"});
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

var nx74=1086;
var ny74=3269;
var t=paper.text(nx74,ny74,'Division of\nPolynomials').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.923.C.1#Division of Polynomials"});
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

var nx75=964;
var ny75=1768;
var t=paper.text(nx75,ny75,'Forms of\nLinear Equations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.336.C.1#Forms of Linear Equations"});
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

var nx76=1320;
var ny76=470;
var t=paper.text(nx76,ny76,'Adding and Subtracting\nRational Numbers').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.092.C.1#Adding and Subtracting Rational Numbers"});
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

var nx77=1224;
var ny77=3525;
var t=paper.text(nx77,ny77,'Adding and\nSubtracting\nRational Expressions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.937.C.1#Adding and Subtracting Rational Expressions"});
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

var nx78=1530;
var ny78=1009;
var t=paper.text(nx78,ny78,'Radical\nExpressions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.838.C.1#Radical Expressions"});
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

var nx79=347;
var ny79=1233;
var t=paper.text(nx79,ny79,'Graphing Using\nIntercepts').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.261.C.1#Graphing Using Intercepts"});
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

var nx80=361;
var ny80=1479;
var t=paper.text(nx80,ny80,'Direction Variation\nModels').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.272.C.1#Direction Variation Models"});
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

var nx81=1117;
var ny81=2529;
var t=paper.text(nx81,ny81,'The Discriminant').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.770.C.1#The Discriminant"});
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

var nx82=676;
var ny82=1376;
var t=paper.text(nx82,ny82,'Equations with\nVariables on\nBoth Sides').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.181.C.1#Equations with Variables on Both Sides"});
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

var nx83=964;
var ny83=1654;
var t=paper.text(nx83,ny83,'Writing Linear\nEquations').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt83=ny83-(tBox.height/2+10);
var bb83=ny83+(tBox.height/2+10);
var bl83=nx83-(tBox.width/2+10);
var br83=nx83+(tBox.width/2+10);
var b83=paper.rect(bl83, bt83, br83-bl83, bb83-bt83, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx84=833;
var ny84=1475;
var t=paper.text(nx84,ny84,'Percent\nProblems').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.189.C.1#Percent Problems"});
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

var nx85=1224;
var ny85=3270;
var t=paper.text(nx85,ny85,'Rational\nExpressions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.927.C.1#Rational Expressions"});
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

var nx86=1227;
var ny86=2024;
var t=paper.text(nx86,ny86,'Graphs of Quadratic\nFunctions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.ALG.750.C.1#Graphs of Quadratic Functions"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt86=ny86-(tBox.height/2+10);
var bb86=ny86+(tBox.height/2+10);
var bl86=nx86-(tBox.width/2+10);
var br86=nx86+(tBox.width/2+10);
var b86=paper.rect(bl86, bt86, br86-bl86, bb86-bt86, 10).attr({stroke:"#bf5600","stroke-width": "2"});

bb87=1234
bt87=1234
bl87=447
br87=447
nx87=447
ny87=1234

bb88=2154
bt88=2154
bl88=702
br88=702
nx88=702
ny88=2154

bb89=721
bt89=721
bl89=446
br89=446
nx89=446
ny89=721

s='M '+702+' '+2154+' L '+bl0+' '+2154; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx3+' '+bb3+' L '+nx3+' '+bt77; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb4+(bt21-bb4)/2; 
s='M '+1377+' '+mid+' L '+1698+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx4+' '+bb4+' L '+nx4+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx31+' '+mid+' L '+nx31+' '+bt31;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx43+' '+mid+' L '+nx43+' '+bt43;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx21+' '+mid+' L '+nx21+' '+bt21;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb6+(bt18-bb6)/2; 
s='M '+344+' '+mid+' L '+550+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx6+' '+bb6+' L '+nx6+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx18+' '+mid+' L '+nx18+' '+bt18;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx65+' '+mid+' L '+nx65+' '+bt65;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb7+(bt1-bb7)/2; 
s='M '+270+' '+mid+' L '+698+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx7+' '+bb7+' L '+nx7+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx34+' '+mid+' L '+nx34+' '+bt34;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx17+' '+mid+' L '+nx17+' '+bt17;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx36+' '+mid+' L '+nx36+' '+bt36;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx1+' '+mid+' L '+nx1+' '+bt1;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb8+(bt52-bb8)/2; 
s='M '+1722+' '+mid+' L '+1999+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx8+' '+bb8+' L '+nx8+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx16+' '+mid+' L '+nx16+' '+bt16;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx44+' '+mid+' L '+nx44+' '+bt44;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx52+' '+mid+' L '+nx52+' '+bt52;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb9+(bt80-bb9)/2; 
s='M '+361+' '+mid+' L '+521+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx9+' '+bb9+' L '+nx9+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx53+' '+mid+' L '+nx53+' '+bt53;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx80+' '+mid+' L '+nx80+' '+bt80;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx10+' '+bb10+' L '+nx10+' '+bt61; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb11+(bt54-bb11)/2; 
s='M '+446+' '+mid+' L '+1322+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx11+' '+bb11+' L '+nx11+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx54+' '+mid+' L '+nx54+' '+bt54;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx45+' '+mid+' L '+nx45+' '+bt45;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx12+' '+bb12+' L '+nx12+' '+bt40; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx13+' '+bb13+' L '+nx13+' '+bt70; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb14+(bt35-bb14)/2; 
s='M '+933+' '+mid+' L '+1224+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx14+' '+bb14+' L '+nx14+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx35+' '+mid+' L '+nx35+' '+bt35;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx85+' '+mid+' L '+nx85+' '+bt85;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx74+' '+mid+' L '+nx74+' '+bt74;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb15+(bt55-bb15)/2; 
s='M '+1226+' '+mid+' L '+1447+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx15+' '+bb15+' L '+nx15+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx66+' '+mid+' L '+nx66+' '+bt66;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx55+' '+mid+' L '+nx55+' '+bt55;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx16+' '+bb16+' L '+nx16+' '+bt57; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx17+' '+bb17+' L '+nx17+' '+bt56; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx18+' '+bb18+' L '+nx18+' '+bt32; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx19+' '+bb19+' L '+nx19+' '+bt23; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx20+' '+bb20+' L '+nx20+' '+bt69; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+446+' '+721+' L '+bl22+' '+721; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb23+(bt58-bb23)/2; 
s='M '+1086+' '+mid+' L '+1534+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx23+' '+bb23+' L '+nx23+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx4+' '+mid+' L '+nx4+' '+bt4;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx58+' '+mid+' L '+nx58+' '+bt58;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx24+' '+bb24+' L '+nx24+' '+bt6; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx25+' '+bb25+' L '+nx25+' '+bt7; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb26+(bt72-bb26)/2; 
s='M '+1497+' '+mid+' L '+1861+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx26+' '+bb26+' L '+nx26+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx5+' '+mid+' L '+nx5+' '+bt5;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx72+' '+mid+' L '+nx72+' '+bt72;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx8+' '+mid+' L '+nx8+' '+bt8;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx27+' '+bb27+' L '+nx27+' '+bt67; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx28+' '+bb28+' L '+nx28+' '+bt76; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx29+' '+bb29+' L '+nx29+' '+bt12; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx30+' '+bb30+' L '+nx30+' '+bt19; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br32+' '+721+' L '+446+' '+721; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx33+' '+bb33+' L '+nx33+' '+bt10; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx36+' '+bb36+' L '+nx36+' '+bt38; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx39+' '+bb39+' L '+nx39+' '+bt30; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx40+' '+bb40+' L '+nx40+' '+bt71; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx45+' '+bb45+' L '+nx45+' '+bt28; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb47+(bt42-bb47)/2; 
s='M '+1174+' '+mid+' L '+1522+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx47+' '+bb47+' L '+nx47+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx15+' '+mid+' L '+nx15+' '+bt15;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx50+' '+mid+' L '+nx50+' '+bt50;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx42+' '+mid+' L '+nx42+' '+bt42;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx49+' '+bb49+' L '+nx49+' '+bt13; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br51+' '+2154+' L '+702+' '+2154; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx54+' '+bb54+' L '+nx54+' '+bt24; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb55+(bt78-bb55)/2; 
s='M '+1369+' '+mid+' L '+1530+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx55+' '+bb55+' L '+nx55+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx59+' '+mid+' L '+nx59+' '+bt59;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx78+' '+mid+' L '+nx78+' '+bt78;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb56+(bt51-bb56)/2; 
s='M '+602+' '+mid+' L '+799+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx56+' '+bb56+' L '+nx56+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx0+' '+mid+' L '+nx0+' '+bt0;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx51+' '+mid+' L '+nx51+' '+bt51;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx57+' '+bb57+' L '+nx57+' '+bt60; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx58+' '+bb58+' L '+nx58+' '+bt14; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb61+(bt73-bb61)/2; 
s='M '+347+' '+mid+' L '+542+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx61+' '+bb61+' L '+nx61+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx79+' '+mid+' L '+nx79+' '+bt79;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx73+' '+mid+' L '+nx73+' '+bt73;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx63+' '+bb63+' L '+nx63+' '+bt84; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx64+' '+bb64+' L '+nx64+' '+bt62; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx65+' '+bb65+' L '+nx65+' '+bt22; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx66+' '+bb66+' L '+nx66+' '+bt86; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb67+(bt81-bb67)/2; 
s='M '+1117+' '+mid+' L '+1671+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx67+' '+bb67+' L '+nx67+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx39+' '+mid+' L '+nx39+' '+bt39;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx26+' '+mid+' L '+nx26+' '+bt26;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx81+' '+mid+' L '+nx81+' '+bt81;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx68+' '+bb68+' L '+nx68+' '+bt27; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb71+(bt63-bb71)/2; 
s='M '+676+' '+mid+' L '+831+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx71+' '+bb71+' L '+nx71+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx63+' '+mid+' L '+nx63+' '+bt63;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx82+' '+mid+' L '+nx82+' '+bt82;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+447+' '+1234+' L '+bl73+' '+1234; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb75+(bt66-bb75)/2; 
s='M '+698+' '+mid+' L '+1226+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx75+' '+bb75+' L '+nx75+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx17+' '+mid+' L '+nx17+' '+bt17;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx20+' '+mid+' L '+nx20+' '+bt20;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx66+' '+mid+' L '+nx66+' '+bt66;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx37+' '+mid+' L '+nx37+' '+bt37;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx76+' '+bb76+' L '+nx76+' '+bt47; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx77+' '+bb77+' L '+nx77+' '+bt41; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx78+' '+bb78+' L '+nx78+' '+bt49; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br79+' '+1234+' L '+447+' '+1234; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb53+(bt25-bb53)/2; 
s='M '+403+' '+mid+' L '+964+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx82+' '+bb82+' L '+nx82+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx25+' '+mid+' L '+nx25+' '+bt25;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx83+' '+mid+' L '+nx83+' '+bt83;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx83+' '+bb83+' L '+nx83+' '+bt75; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx85+' '+bb85+' L '+nx85+' '+bt3; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb86+(bt68-bb86)/2; 
s='M '+1141+' '+mid+' L '+1315+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx86+' '+bb86+' L '+nx86+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx2+' '+mid+' L '+nx2+' '+bt2;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx68+' '+mid+' L '+nx68+' '+bt68;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx87+' '+bb87+' L '+nx87+' '+bt9; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb88+(bt46-bb88)/2; 
s='M '+624+' '+mid+' L '+783+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx88+' '+bb88+' L '+nx88+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx48+' '+mid+' L '+nx48+' '+bt48;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx46+' '+mid+' L '+nx46+' '+bt46;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb89+(bt33-bb89)/2; 
s='M '+200+' '+mid+' L '+749+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx89+' '+bb89+' L '+nx89+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx64+' '+mid+' L '+nx64+' '+bt64;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx29+' '+mid+' L '+nx29+' '+bt29;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx33+' '+mid+' L '+nx33+' '+bt33;
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