window.onload = function() { 

mapWidth = 3190; 
mapHeight = 2777; 

boxWidth = 900; 
boxHeight = 600; 
aspectRatio = boxWidth/boxHeight; 
zoomFactor = 5; 

var paper = Raphael(document.getElementById('holder'), 900, 600); 

canvasWidth = boxWidth; 
canvasHeight = boxHeight; 

rootx = 1747; 
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
var nx0=2176;
var ny0=1703;
var t=paper.text(nx0,ny0,'Trigonometric\nSubstitutions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.770.C.1#Trigonometric Substitutions"});
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

var nx1=2656;
var ny1=1315;
var t=paper.text(nx1,ny1,'Applications of\nDefinte Integrals').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt1=ny1-(tBox.height/2+10);
var bb1=ny1+(tBox.height/2+10);
var bl1=nx1-(tBox.width/2+10);
var br1=nx1+(tBox.width/2+10);
var b1=paper.rect(bl1, bt1, br1-bl1, bb1-bt1, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx2=1358;
var ny2=1081;
var t=paper.text(nx2,ny2,'Derivatives of\nTrigonometric Functions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.157.C.1#Derivatives of Trigonometric Functions"});
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

var nx3=528;
var ny3=1362;
var t=paper.text(nx3,ny3,'The First Derivative\nTest').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.295.C.1#The First Derivative Test"});
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

var nx4=1977;
var ny4=2104;
var t=paper.text(nx4,ny4,'Infinite Series').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.885.C.1#Infinite Series"});
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

var nx5=699;
var ny5=1362;
var t=paper.text(nx5,ny5,'Analyzing the Graph\nof a Function').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.340.C.1#Analyzing the Graph of a Function"});
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

var nx6=610;
var ny6=1232;
var t=paper.text(nx6,ny6,'Applications of\nDerivatives').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt6=ny6-(tBox.height/2+10);
var bb6=ny6+(tBox.height/2+10);
var bl6=nx6-(tBox.width/2+10);
var br6=nx6+(tBox.width/2+10);
var b6=paper.rect(bl6, bt6, br6-bl6, bb6-bt6, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx7=2273;
var ny7=861;
var t=paper.text(nx7,ny7,'Indefinite Integrals\nCalculus').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.385.C.1#Indefinite Integrals Calculus"});
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

var nx8=1684;
var ny8=2194;
var t=paper.text(nx8,ny8,'Differentiation and Integration\nof Logarithmic and Exponential\nFunctions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.649.C.1#Differentiation and Integration of Logarithmic and Exponential Functions"});
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

var nx9=855;
var ny9=1355;
var t=paper.text(nx9,ny9,'Limits at Inifinity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.325.C.1#Limits at Inifinity"});
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

var nx10=1574;
var ny10=328;
var t=paper.text(nx10,ny10,'Equations and Graphs').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.015.C.1#Equations and Graphs"});
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

var nx11=1832;
var ny11=1578;
var t=paper.text(nx11,ny11,'Integration by Substitution').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt11=ny11-(tBox.height/2+10);
var bb11=ny11+(tBox.height/2+10);
var bl11=nx11-(tBox.width/2+10);
var br11=nx11+(tBox.width/2+10);
var b11=paper.rect(bl11, bt11, br11-bl11, bb11-bt11, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx12=1749;
var ny12=419;
var t=paper.text(nx12,ny12,'Evaluating Limits').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.090.C.1#Evaluating Limits"});
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

var nx13=1176;
var ny13=763;
var t=paper.text(nx13,ny13,'Derivatives').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt13=ny13-(tBox.height/2+10);
var bb13=ny13+(tBox.height/2+10);
var bl13=nx13-(tBox.width/2+10);
var br13=nx13+(tBox.width/2+10);
var b13=paper.rect(bl13, bt13, br13-bl13, bb13-bt13, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx14=2176;
var ny14=1586;
var t=paper.text(nx14,ny14,'Trigonometric\nIntegrals').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.766.C.1#Trigonometric Integrals"});
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

var nx15=1325;
var ny15=1238;
var t=paper.text(nx15,ny15,"Linearization and\nNewton's Method").attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.181.C.1#Linearization and Newton's Method"});
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

var nx16=1271;
var ny16=2046;
var t=paper.text(nx16,ny16,'Inverse Functions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.633.C.1#Inverse Functions"});
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

var nx17=1003;
var ny17=1080;
var t=paper.text(nx17,ny17,'Techniques of\nDifferentiation').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.149.C.1#Techniques of Differentiation"});
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

var nx18=995;
var ny18=1362;
var t=paper.text(nx18,ny18,'Approximation\nErrors').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.370.C.1#Approximation Errors"});
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

var nx19=2806;
var ny19=1439;
var t=paper.text(nx19,ny19,'Area of a Surface\nRevolution').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.544.C.1#Area of a Surface Revolution"});
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

var nx20=1906;
var ny20=328;
var t=paper.text(nx20,ny20,'The Calculus').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.060.C.1#The Calculus"});
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

var nx21=1584;
var ny21=2053;
var t=paper.text(nx21,ny21,'Exponential and\nLogarithmic Functions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.641.C.1#Exponential and Logarithmic Functions"});
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

var nx22=1271;
var ny22=2187;
var t=paper.text(nx22,ny22,'Derivatives and Integrals Involving\nInverse Trigonometric Functions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.665.C.1#Derivatives and Integrals Involving Inverse Trigonometric Functions"});
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

var nx23=2357;
var ny23=1153;
var t=paper.text(nx23,ny23,'Evaluating Definite\nIntegrals').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.425.C.1#Evaluating Definite Integrals"});
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

var nx24=200;
var ny24=1362;
var t=paper.text(nx24,ny24,'Extrema and The Mean\nValue Theorem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.280.C.1#Extrema and The Mean Value Theorem"});
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

var nx25=2990;
var ny25=1440;
var t=paper.text(nx25,ny25,'Applications from Physics,\nEngineering, and Statistics').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.555.C.1#Applications from Physics, Engineering, and Statistics"});
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

var nx26=2656;
var ny26=1440;
var t=paper.text(nx26,ny26,'The Length of\na Plane Curve').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.533.C.1#The Length of a Plane Curve"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt26=ny26-(tBox.height/2+10);
var bb26=ny26+(tBox.height/2+10);
var bl26=nx26-(tBox.width/2+10);
var br26=nx26+(tBox.width/2+10);
var b26=paper.rect(bl26, bt26, br26-bl26, bb26-bt26, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx27=1906;
var ny27=420;
var t=paper.text(nx27,ny27,'Continuity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.105.C.1#Continuity"});
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

var nx28=2376;
var ny28=1439;
var t=paper.text(nx28,ny28,'Area Between Two\nCurves').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.511.C.1#Area Between Two Curves"});
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

var nx29=2021;
var ny29=1585;
var t=paper.text(nx29,ny29,'Integration by Partial\nFractions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.762.C.1#Integration by Partial Fractions"});
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

var nx30=1574;
var ny30=419;
var t=paper.text(nx30,ny30,'Relations and Functions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.030.C.1#Relations and Functions"});
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

var nx31=2176;
var ny31=1433;
var t=paper.text(nx31,ny31,'Integration Techniques').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt31=ny31-(tBox.height/2+10);
var bb31=ny31+(tBox.height/2+10);
var bl31=nx31-(tBox.width/2+10);
var br31=nx31+(tBox.width/2+10);
var b31=paper.rect(bl31, bt31, br31-bl31, bb31-bt31, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx32=1747;
var ny32=100;
var t=paper.text(nx32,ny32,'Calculus').attr({fill:"white","font-size": 24});
var tBox=t.getBBox(); 
var bt32=ny32-(tBox.height/2+10);
var bb32=ny32+(tBox.height/2+10);
var bl32=nx32-(tBox.width/2+10);
var br32=nx32+(tBox.width/2+10);
var b32=paper.rect(bl32, bt32, br32-bl32, bb32-bt32, 10).attr({stroke:"#7cbf00","stroke-width": "4"});

var nx33=1176;
var ny33=970;
var t=paper.text(nx33,ny33,'The Derivative').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.141.C.1#The Derivative"});
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

var nx34=1747;
var ny34=207;
var t=paper.text(nx34,ny34,'Functions, Limits, and\nContinuity').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt34=ny34-(tBox.height/2+10);
var bb34=ny34+(tBox.height/2+10);
var bl34=nx34-(tBox.width/2+10);
var br34=nx34+(tBox.width/2+10);
var b34=paper.rect(bl34, bt34, br34-bl34, bb34-bt34, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx35=1972;
var ny35=1312;
var t=paper.text(nx35,ny35,'Numerical Integration').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.455.C.1#Numerical Integration"});
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

var nx36=2176;
var ny36=1311;
var t=paper.text(nx36,ny36,'Integration by Substitution').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt36=ny36-(tBox.height/2+10);
var bb36=ny36+(tBox.height/2+10);
var bl36=nx36-(tBox.width/2+10);
var br36=nx36+(tBox.width/2+10);
var b36=paper.rect(bl36, bt36, br36-bl36, bb36-bt36, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx37=2197;
var ny37=972;
var t=paper.text(nx37,ny37,'The Initial Value\nProblem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.395.C.1#The Initial Value Problem"});
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

var nx38=2273;
var ny38=762;
var t=paper.text(nx38,ny38,'Integration').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt38=ny38-(tBox.height/2+10);
var bb38=ny38+(tBox.height/2+10);
var bl38=nx38-(tBox.width/2+10);
var br38=nx38+(tBox.width/2+10);
var b38=paper.rect(bl38, bt38, br38-bl38, bb38-bt38, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx39=1176;
var ny39=865;
var t=paper.text(nx39,ny39,'Tangent Lines and\nRate of Change').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.133.C.1#Tangent Lines and Rate of Change"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt39=ny39-(tBox.height/2+10);
var bb39=ny39+(tBox.height/2+10);
var bl39=nx39-(tBox.width/2+10);
var br39=nx39+(tBox.width/2+10);
var b39=paper.rect(bl39, bt39, br39-bl39, bb39-bt39, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx40=1977;
var ny40=2006;
var t=paper.text(nx40,ny40,'Sequences').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.877.C.1#Sequences"});
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

var nx41=2357;
var ny41=1051;
var t=paper.text(nx41,ny41,'Definite Integrals').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.415.C.1#Definite Integrals"});
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

var nx42=2357;
var ny42=965;
var t=paper.text(nx42,ny42,'The Area Problem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.405.C.1#The Area Problem"});
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

var nx43=528;
var ny43=1568;
var t=paper.text(nx43,ny43,'Optimization').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.355.C.1#Optimization"});
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

var nx44=370;
var ny44=1355;
var t=paper.text(nx44,ny44,'Related Rates').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.265.C.1#Related Rates"});
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

var nx45=1749;
var ny45=514;
var t=paper.text(nx45,ny45,'Infinite Limits').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.120.C.1#Infinite Limits"});
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

var nx46=1190;
var ny46=1913;
var t=paper.text(nx46,ny46,'The Fundametal Theorem\nof Calculus').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.435.C.1#The Fundametal Theorem of Calculus"});
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

var nx47=2487;
var ny47=1586;
var t=paper.text(nx47,ny47,'Ordinary Differential\nEquations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.779.C.1#Ordinary Differential Equations"});
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

var nx48=2523;
var ny48=1432;
var t=paper.text(nx48,ny48,'Volumes').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.522.C.1#Volumes"});
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

var nx49=1975;
var ny49=2559;
var t=paper.text(nx49,ny49,'Taylor and Maclaurin\nSeries').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.916.C.1#Taylor and Maclaurin Series"});
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

var nx50=2321;
var ny50=1579;
var t=paper.text(nx50,ny50,'Improper Integrals').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.774.C.1#Improper Integrals"});
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

var nx51=1975;
var ny51=2677;
var t=paper.text(nx51,ny51,'Calculations with Series').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.925.C.1#Calculations with Series"});
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

var nx52=1483;
var ny52=2187;
var t=paper.text(nx52,ny52,'Exponential Growth\nand Decay').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.657.C.1#Exponential Growth and Decay"});
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

var nx53=1977;
var ny53=2217;
var t=paper.text(nx53,ny53,'Series Without Negative\nTerms').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.896.C.1#Series Without Negative Terms"});
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

var nx54=1977;
var ny54=1908;
var t=paper.text(nx54,ny54,'Infinite Series').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt54=ny54-(tBox.height/2+10);
var bb54=ny54+(tBox.height/2+10);
var bl54=nx54-(tBox.width/2+10);
var br54=nx54+(tBox.width/2+10);
var b54=paper.rect(bl54, bt54, br54-bl54, bb54-bt54, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx55=1584;
var ny55=1914;
var t=paper.text(nx55,ny55,'Transcendental\nFunctions').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt55=ny55-(tBox.height/2+10);
var bb55=ny55+(tBox.height/2+10);
var bl55=nx55-(tBox.width/2+10);
var br55=nx55+(tBox.width/2+10);
var b55=paper.rect(bl55, bt55, br55-bl55, bb55-bt55, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx56=1747;
var ny56=328;
var t=paper.text(nx56,ny56,'Finding Limits').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.075.C.1#Finding Limits"});
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

var nx57=1975;
var ny57=2450;
var t=paper.text(nx57,ny57,'Power Series').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.910.C.1#Power Series"});
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

var nx58=1975;
var ny58=2334;
var t=paper.text(nx58,ny58,'Series With Odd or Even\nNegative Terms').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.903.C.1#Series With Odd or Even Negative Terms"});
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

var nx59=1574;
var ny59=512;
var t=paper.text(nx59,ny59,'Models and Data').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.045.C.1#Models and Data"});
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

var nx60=1159;
var ny60=1234;
var t=paper.text(nx60,ny60,'The Chain Rule').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.165.C.1#The Chain Rule"});
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

var nx61=528;
var ny61=1466;
var t=paper.text(nx61,ny61,'The Second Derivative\nTest').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.310.C.1#The Second Derivative Test"});
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

var nx62=1799;
var ny62=2044;
var t=paper.text(nx62,ny62,"L'Hospital's Rule").attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.673.C.1#L'Hospital's Rule"});
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

var nx63=1159;
var ny63=1355;
var t=paper.text(nx63,ny63,'Implicit Differentiation').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.173.C.1#Implicit Differentiation"});
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

var nx64=1832;
var ny64=1690;
var t=paper.text(nx64,ny64,'Integration by Parts').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/MAT.CAL.758.C.1#Integration by Parts"});
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

bb65=601
bt65=601
bl65=1749
br65=1749
nx65=1749
ny65=601

bb66=1229
bt66=1229
bl66=1584
br66=1584
nx66=1584
ny66=1229

var mid=bb1+(bt48-bb1)/2; 
s='M '+2376+' '+mid+' L '+2990+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx1+' '+bb1+' L '+nx1+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx26+' '+mid+' L '+nx26+' '+bt26;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx25+' '+mid+' L '+nx25+' '+bt25;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx28+' '+mid+' L '+nx28+' '+bt28;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx19+' '+mid+' L '+nx19+' '+bt19;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx48+' '+mid+' L '+nx48+' '+bt48;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx3+' '+bb3+' L '+nx3+' '+bt61; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx4+' '+bb4+' L '+nx4+' '+bt53; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb6+(bt9-bb6)/2; 
s='M '+200+' '+mid+' L '+995+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx6+' '+bb6+' L '+nx6+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx24+' '+mid+' L '+nx24+' '+bt24;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx5+' '+mid+' L '+nx5+' '+bt5;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx3+' '+mid+' L '+nx3+' '+bt3;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx18+' '+mid+' L '+nx18+' '+bt18;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx44+' '+mid+' L '+nx44+' '+bt44;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx9+' '+mid+' L '+nx9+' '+bt9;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb7+(bt42-bb7)/2; 
s='M '+2197+' '+mid+' L '+2357+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx7+' '+bb7+' L '+nx7+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx42+' '+mid+' L '+nx42+' '+bt42;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx37+' '+mid+' L '+nx37+' '+bt37;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx10+' '+bb10+' L '+nx10+' '+bt30; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx11+' '+bb11+' L '+nx11+' '+bt64; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx12+' '+bb12+' L '+nx12+' '+bt45; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx13+' '+bb13+' L '+nx13+' '+bt39; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx14+' '+bb14+' L '+nx14+' '+bt0; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx16+' '+bb16+' L '+nx16+' '+bt22; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb17+(bt6-bb17)/2; 
s='M '+610+' '+mid+' L '+1325+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx17+' '+bb17+' L '+nx17+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx6+' '+mid+' L '+nx6+' '+bt6;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx60+' '+mid+' L '+nx60+' '+bt60;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx15+' '+mid+' L '+nx15+' '+bt15;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx20+' '+bb20+' L '+nx20+' '+bt27; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb21+(bt52-bb21)/2; 
s='M '+1483+' '+mid+' L '+1684+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx21+' '+bb21+' L '+nx21+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx52+' '+mid+' L '+nx52+' '+bt52;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx8+' '+mid+' L '+nx8+' '+bt8;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb23+(bt66-bb23)/2; 
s='M '+1584+' '+mid+' L '+2656+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx23+' '+bb23+' L '+nx23+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx35+' '+mid+' L '+nx35+' '+bt35;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx1+' '+mid+' L '+nx1+' '+bt1;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx36+' '+mid+' L '+nx36+' '+bt36;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx66+' '+mid+' L '+nx66+' '+bt66;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx27+' '+bb27+' L '+nx27+' '+601; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1906-1749,1,0,0); 
h.translate(1749,601); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1749+' '+601+' L '+1906+' '+601; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx30+' '+bb30+' L '+nx30+' '+bt59; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb28+(bt11-bb28)/2; 
s='M '+1832+' '+mid+' L '+2487+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx31+' '+bb31+' L '+nx31+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx47+' '+mid+' L '+nx47+' '+bt47;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx14+' '+mid+' L '+nx14+' '+bt14;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx50+' '+mid+' L '+nx50+' '+bt50;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx11+' '+mid+' L '+nx11+' '+bt11;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx29+' '+mid+' L '+nx29+' '+bt29;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx32+' '+bb32+' L '+nx32+' '+bt34; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb33+(bt17-bb33)/2; 
s='M '+1003+' '+mid+' L '+1584+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx33+' '+bb33+' L '+nx33+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx2+' '+mid+' L '+nx2+' '+bt2;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx66+' '+mid+' L '+nx66+' '+bt66;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx17+' '+mid+' L '+nx17+' '+bt17;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb34+(bt56-bb34)/2; 
s='M '+1574+' '+mid+' L '+1906+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx34+' '+bb34+' L '+nx34+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx10+' '+mid+' L '+nx10+' '+bt10;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx20+' '+mid+' L '+nx20+' '+bt20;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx56+' '+mid+' L '+nx56+' '+bt56;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx36+' '+bb36+' L '+nx36+' '+bt31; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx38+' '+bb38+' L '+nx38+' '+bt7; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx39+' '+bb39+' L '+nx39+' '+bt33; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx40+' '+bb40+' L '+nx40+' '+bt4; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx41+' '+bb41+' L '+nx41+' '+bt23; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx42+' '+bb42+' L '+nx42+' '+bt41; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx45+' '+bb45+' L '+nx45+' '+601; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1749-1749,1,0,0); 
h.translate(1749,601); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1749+' '+601+' L '+1749+' '+601; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx49+' '+bb49+' L '+nx49+' '+bt51; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx53+' '+bb53+' L '+nx53+' '+bt58; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx54+' '+bb54+' L '+nx54+' '+bt40; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb55+(bt62-bb55)/2; 
s='M '+1271+' '+mid+' L '+1799+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx55+' '+bb55+' L '+nx55+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx16+' '+mid+' L '+nx16+' '+bt16;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx62+' '+mid+' L '+nx62+' '+bt62;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx21+' '+mid+' L '+nx21+' '+bt21;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx56+' '+bb56+' L '+nx56+' '+bt12; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx57+' '+bb57+' L '+nx57+' '+bt49; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx58+' '+bb58+' L '+nx58+' '+bt57; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx59+' '+bb59+' L '+nx59+' '+601; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1749-1574,1,0,0); 
h.translate(1574,601); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1574+' '+601+' L '+1749+' '+601; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx60+' '+bb60+' L '+nx60+' '+bt63; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx61+' '+bb61+' L '+nx61+' '+bt43; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb65+(bt38-bb65)/2; 
s='M '+1176+' '+mid+' L '+2273+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx65+' '+bb65+' L '+nx65+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx13+' '+mid+' L '+nx13+' '+bt13;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx38+' '+mid+' L '+nx38+' '+bt38;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb64+(bt54-bb64)/2; 
s='M '+1190+' '+mid+' L '+1977+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx66+' '+bb66+' L '+nx66+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx55+' '+mid+' L '+nx55+' '+bt55;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx46+' '+mid+' L '+nx46+' '+bt46;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx54+' '+mid+' L '+nx54+' '+bt54;
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