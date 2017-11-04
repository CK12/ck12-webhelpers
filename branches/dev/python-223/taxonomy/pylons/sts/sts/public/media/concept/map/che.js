window.onload = function() { 

mapWidth = 4026; 
mapHeight = 4941; 

boxWidth = 900; 
boxHeight = 600; 
aspectRatio = boxWidth/boxHeight; 
zoomFactor = 5; 

var paper = Raphael(document.getElementById('holder'), 900, 600); 

canvasWidth = boxWidth; 
canvasHeight = boxHeight; 

rootx = 1569; 
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
var nx0=1765;
var ny0=418;
var t=paper.text(nx0,ny0,'Properties and Changes\nof Matter').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.050.C.1#Properties and Changes of Matter"});
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

var nx1=2580;
var ny1=3914;
var t=paper.text(nx1,ny1,'Entropy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.833.C.1#Entropy"});
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

var nx2=1745;
var ny2=3276;
var t=paper.text(nx2,ny2,'Chemical Reactions\nand Equations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.453.C.1#Chemical Reactions and Equations"});
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

var nx3=418;
var ny3=4097;
var t=paper.text(nx3,ny3,'Stoichiometry Involving\nGases').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.563.C.1#Stoichiometry Involving Gases"});
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

var nx4=2316;
var ny4=2926;
var t=paper.text(nx4,ny4,'Electronic and Molecular\nGeometry').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.383.C.1#Electronic and Molecular Geometry"});
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

var nx5=1020;
var ny5=3901;
var t=paper.text(nx5,ny5,'Ionic, Metallic, and Network\nCondensed Phases').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.583.C.1#Ionic, Metallic, and Network Condensed Phases"});
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

var nx6=2241;
var ny6=4749;
var t=paper.text(nx6,ny6,'Titration').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.786.C.1#Titration"});
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

var nx7=1649;
var ny7=3789;
var t=paper.text(nx7,ny7,'Colligative Properties').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.637.C.1#Colligative Properties"});
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

var nx8=1375;
var ny8=216;
var t=paper.text(nx8,ny8,'Measurement in Chemistry').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt8=ny8-(tBox.height/2+10);
var bb8=ny8+(tBox.height/2+10);
var bl8=nx8-(tBox.width/2+10);
var br8=nx8+(tBox.width/2+10);
var b8=paper.rect(bl8, bt8, br8-bl8, bb8-bt8, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx9=1958;
var ny9=3690;
var t=paper.text(nx9,ny9,'Rate of Reactions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.657.C.1#Rate of Reactions"});
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

var nx10=3826;
var ny10=4072;
var t=paper.text(nx10,ny10,'Functional Groups').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.961.C.1#Functional Groups"});
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

var nx11=1765;
var ny11=1374;
var t=paper.text(nx11,ny11,'The Bohr Model of\nthe Atom').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.135.C.1#The Bohr Model of the Atom"});
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

var nx12=1955;
var ny12=2239;
var t=paper.text(nx12,ny12,'Chemical Periodicity').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt12=ny12-(tBox.height/2+10);
var bb12=ny12+(tBox.height/2+10);
var bl12=nx12-(tBox.width/2+10);
var br12=nx12+(tBox.width/2+10);
var b12=paper.rect(bl12, bt12, br12-bl12, bb12-bt12, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx13=1671;
var ny13=4247;
var t=paper.text(nx13,ny13,'The Effects of Applying Stress\nto Reactions at Equilibrium').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.701.C.1#The Effects of Applying Stress to Reactions at Equilibrium"});
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

var nx14=2112;
var ny14=2597;
var t=paper.text(nx14,ny14,'Periodic Trends in\nElectronegativity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.303.C.1#Periodic Trends in Electronegativity"});
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

var nx15=3826;
var ny15=3876;
var t=paper.text(nx15,ny15,'Hydrocarbons').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.947.C.1#Hydrocarbons"});
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

var nx16=2203;
var ny16=3282;
var t=paper.text(nx16,ny16,'Determining Formula and\nMolar Masses').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.412.C.1#Determining Formula and Molar Masses"});
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

var nx17=2425;
var ny17=3801;
var t=paper.text(nx17,ny17,'Energy Change in\nReactions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.821.C.1#Energy Change in Reactions"});
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

var nx18=1958;
var ny18=3796;
var t=paper.text(nx18,ny18,'Factors that Affect\nReaction Rates').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.671.C.1#Factors that Affect Reaction Rates"});
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

var nx19=1765;
var ny19=515;
var t=paper.text(nx19,ny19,'Energy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.054.C.1#Energy"});
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

var nx20=1998;
var ny20=4458;
var t=paper.text(nx20,ny20,'Br\xf8nsted-Lowry Acids and Bases').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.755.C.1#Brønsted-Lowry Acids and Bases"});
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

var nx21=274;
var ny21=3654;
var t=paper.text(nx21,ny21,'Stoichiometric Calculations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.495.C.1#Stoichiometric Calculations"});
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

var nx22=200;
var ny22=3770;
var t=paper.text(nx22,ny22,'Limiting Reactant').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.501.C.1#Limiting Reactant"});
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

var nx23=1958;
var ny23=4022;
var t=paper.text(nx23,ny23,'Chemical Equilibrium').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt23=ny23-(tBox.height/2+10);
var bb23=ny23+(tBox.height/2+10);
var bl23=nx23-(tBox.width/2+10);
var br23=nx23+(tBox.width/2+10);
var b23=paper.rect(bl23, bt23, br23-bl23, bb23-bt23, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx24=1955;
var ny24=1995;
var t=paper.text(nx24,ny24,"Mendeleev's Periodic\nTable").attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.249.C.1#Mendeleev's Periodic Table"});
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

var nx25=1610;
var ny25=3023;
var t=paper.text(nx25,ny25,'Writing Ionic Formulas').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.338.C.1#Writing Ionic Formulas"});
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

var nx26=1955;
var ny26=2454;
var t=paper.text(nx26,ny26,'Periodic Trends in\nAtomic Size').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.292.C.1#Periodic Trends in Atomic Size"});
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

var nx27=1765;
var ny27=1032;
var t=paper.text(nx27,ny27,'The Bohr Model of\nthe Atom').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt27=ny27-(tBox.height/2+10);
var bb27=ny27+(tBox.height/2+10);
var bl27=nx27-(tBox.width/2+10);
var br27=nx27+(tBox.width/2+10);
var b27=paper.rect(bl27, bt27, br27-bl27, bb27-bt27, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx28=2969;
var ny28=3688;
var t=paper.text(nx28,ny28,'Electrochemistry').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt28=ny28-(tBox.height/2+10);
var bb28=ny28+(tBox.height/2+10);
var bl28=nx28-(tBox.width/2+10);
var br28=nx28+(tBox.width/2+10);
var b28=paper.rect(bl28, bt28, br28-bl28, bb28-bt28, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx29=2219;
var ny29=2817;
var t=paper.text(nx29,ny29,'The Covalent Bond').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.370.C.1#The Covalent Bond"});
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

var nx30=2203;
var ny30=3405;
var t=paper.text(nx30,ny30,'Percent Composition').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.419.C.1#Percent Composition"});
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

var nx31=1718;
var ny31=1630;
var t=paper.text(nx31,ny31,'Characteristics of Matter').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.171.C.1#Characteristics of Matter"});
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

var nx32=2241;
var ny32=4656;
var t=paper.text(nx32,ny32,'Neutralization').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.782.C.1#Neutralization"});
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

var nx33=2125;
var ny33=2925;
var t=paper.text(nx33,ny33,'Covalent Formulas and\nNomenclature').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.381.C.1#Covalent Formulas and Nomenclature"});
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

var nx34=2726;
var ny34=3560;
var t=paper.text(nx34,ny34,'Chemical Kinetics').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt34=ny34-(tBox.height/2+10);
var bb34=ny34+(tBox.height/2+10);
var bl34=nx34-(tBox.width/2+10);
var br34=nx34+(tBox.width/2+10);
var b34=paper.rect(bl34, bt34, br34-bl34, bb34-bt34, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx35=1955;
var ny35=1507;
var t=paper.text(nx35,ny35,'The Electron Configuration\nof Atoms').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt35=ny35-(tBox.height/2+10);
var bb35=ny35+(tBox.height/2+10);
var bl35=nx35-(tBox.width/2+10);
var br35=nx35+(tBox.width/2+10);
var b35=paper.rect(bl35, bt35, br35-bl35, bb35-bt35, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx36=1958;
var ny36=3909;
var t=paper.text(nx36,ny36,'Multi-Step Reaction').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.688.C.1#Multi-Step Reaction"});
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

var nx37=2118;
var ny37=4133;
var t=paper.text(nx37,ny37,'Acids and Bases').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt37=ny37-(tBox.height/2+10);
var bb37=ny37+(tBox.height/2+10);
var bl37=nx37-(tBox.width/2+10);
var br37=nx37+(tBox.width/2+10);
var b37=paper.rect(bl37, bt37, br37-bl37, bb37-bt37, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx38=1568;
var ny38=3908;
var t=paper.text(nx38,ny38,'Separating Mixtures').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.642.C.1#Separating Mixtures"});
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

var nx39=1745;
var ny39=3178;
var t=paper.text(nx39,ny39,'Chemical Reactions').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt39=ny39-(tBox.height/2+10);
var bb39=ny39+(tBox.height/2+10);
var bl39=nx39-(tBox.width/2+10);
var br39=nx39+(tBox.width/2+10);
var b39=paper.rect(bl39, bt39, br39-bl39, bb39-bt39, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx40=2969;
var ny40=3891;
var t=paper.text(nx40,ny40,'Oxidation-Reduction').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.865.C.1#Oxidation-Reduction"});
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

var nx41=3308;
var ny41=3780;
var t=paper.text(nx41,ny41,'Discovery of Radioactivity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.903.C.1#Discovery of Radioactivity"});
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

var nx42=603;
var ny42=3679;
var t=paper.text(nx42,ny42,'The Three States\nof Matter').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.534.C.1#The Three States of Matter"});
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

var nx43=1544;
var ny43=317;
var t=paper.text(nx43,ny43,'Significant Figures').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.013.C.1#Significant Figures"});
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

var nx44=2969;
var ny44=3996;
var t=paper.text(nx44,ny44,'Electrolysis').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.872.C.1#Electrolysis"});
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

var nx45=2425;
var ny45=3688;
var t=paper.text(nx45,ny45,'Thermochemistry').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt45=ny45-(tBox.height/2+10);
var bb45=ny45+(tBox.height/2+10);
var bl45=nx45-(tBox.width/2+10);
var br45=nx45+(tBox.width/2+10);
var b45=paper.rect(bl45, bt45, br45-bl45, bb45-bt45, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx46=603;
var ny46=3777;
var t=paper.text(nx46,ny46,'Gases').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.540.C.1#Gases"});
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

var nx47=1018;
var ny47=3566;
var t=paper.text(nx47,ny47,'Condensed Phases:\nSolids and Liquids').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt47=ny47-(tBox.height/2+10);
var bb47=ny47+(tBox.height/2+10);
var bl47=nx47-(tBox.width/2+10);
var br47=nx47+(tBox.width/2+10);
var b47=paper.rect(bl47, bt47, br47-bl47, bb47-bt47, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx48=603;
var ny48=3566;
var t=paper.text(nx48,ny48,'The Behavior of\nGases').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt48=ny48-(tBox.height/2+10);
var bb48=ny48+(tBox.height/2+10);
var bl48=nx48-(tBox.width/2+10);
var br48=nx48+(tBox.width/2+10);
var b48=paper.rect(bl48, bt48, br48-bl48, bb48-bt48, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx49=1375;
var ny49=319;
var t=paper.text(nx49,ny49,'Measurement Sytems').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.004.C.1#Measurement Sytems"});
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

var nx50=1765;
var ny50=613;
var t=paper.text(nx50,ny50,'The Atomic Theory').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt50=ny50-(tBox.height/2+10);
var bb50=ny50+(tBox.height/2+10);
var bl50=nx50-(tBox.width/2+10);
var br50=nx50+(tBox.width/2+10);
var b50=paper.rect(bl50, bt50, br50-bl50, bb50-bt50, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx51=1308;
var ny51=3788;
var t=paper.text(nx51,ny51,'Measuring Concentration').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.625.C.1#Measuring Concentration"});
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

var nx52=1603;
var ny52=1507;
var t=paper.text(nx52,ny52,'The Quantum Mechanical\nModel of the Atom').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt52=ny52-(tBox.height/2+10);
var bb52=ny52+(tBox.height/2+10);
var bl52=nx52-(tBox.width/2+10);
var br52=nx52+(tBox.width/2+10);
var b52=paper.rect(bl52, bt52, br52-bl52, bb52-bt52, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx53=524;
var ny53=3881;
var t=paper.text(nx53,ny53,'Gases and Pressure').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.544.C.1#Gases and Pressure"});
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

var nx54=3308;
var ny54=3689;
var t=paper.text(nx54,ny54,'Nuclear Chemistry').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt54=ny54-(tBox.height/2+10);
var bb54=ny54+(tBox.height/2+10);
var bl54=nx54-(tBox.width/2+10);
var br54=nx54+(tBox.width/2+10);
var b54=paper.rect(bl54, bt54, br54-bl54, bb54-bt54, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx55=3826;
var ny55=3780;
var t=paper.text(nx55,ny55,'Carbon, a Unique Element').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.944.C.1#Carbon, a Unique Element"});
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

var nx56=1497;
var ny56=1629;
var t=paper.text(nx56,ny56,'The Dual Nature of Light').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.166.C.1#The Dual Nature of Light"});
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

var nx57=3099;
var ny57=3997;
var t=paper.text(nx57,ny57,'Galvanic Cells').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.878.C.1#Galvanic Cells"});
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

var nx58=2580;
var ny58=4018;
var t=paper.text(nx58,ny58,'Gibbs Free Energy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.840.C.1#Gibbs Free Energy"});
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

var nx59=274;
var ny59=3559;
var t=paper.text(nx59,ny59,'Stoichiometry').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt59=ny59-(tBox.height/2+10);
var bb59=ny59+(tBox.height/2+10);
var bl59=nx59-(tBox.width/2+10);
var br59=nx59+(tBox.width/2+10);
var b59=paper.rect(bl59, bt59, br59-bl59, bb59-bt59, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx60=2243;
var ny60=4362;
var t=paper.text(nx60,ny60,'The pH Concept').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.747.C.1#The pH Concept"});
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

var nx61=1872;
var ny61=4239;
var t=paper.text(nx61,ny61,'Slightly Soluble Salts').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.717.C.1#Slightly Soluble Salts"});
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

var nx62=1698;
var ny62=2711;
var t=paper.text(nx62,ny62,'Ionic Bonds and\nFormulas').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt62=ny62-(tBox.height/2+10);
var bb62=ny62+(tBox.height/2+10);
var bl62=nx62-(tBox.width/2+10);
var br62=nx62+(tBox.width/2+10);
var b62=paper.rect(bl62, bt62, br62-bl62, bb62-bt62, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx63=1544;
var ny63=515;
var t=paper.text(nx63,ny63,'Scientific Notation').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.023.C.1#Scientific Notation"});
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

var nx64=2375;
var ny64=3413;
var t=paper.text(nx64,ny64,'Empirical and Molecular\nFormulas').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.422.C.1#Empirical and Molecular Formulas"});
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

var nx65=1020;
var ny65=3792;
var t=paper.text(nx65,ny65,'Intermolecular Forces\nof Attraction').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.579.C.1#Intermolecular Forces of Attraction"});
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

var nx66=1167;
var ny66=4035;
var t=paper.text(nx66,ny66,'Phase Diagrams').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.600.C.1#Phase Diagrams"});
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

var nx67=1586;
var ny67=2600;
var t=paper.text(nx67,ny67,'Periodic Trends in\nIonic Size').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.297.C.1#Periodic Trends in Ionic Size"});
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

var nx68=1955;
var ny68=2121;
var t=paper.text(nx68,ny68,'Families and Periods of\nthe Periodic Table').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.252.C.1#Families and Periods of the Periodic Table"});
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

var nx69=1765;
var ny69=1141;
var t=paper.text(nx69,ny69,'The Nature of Light').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.127.C.1#The Nature of Light"});
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

var nx70=1784;
var ny70=4133;
var t=paper.text(nx70,ny70,'Equilibrium Constant').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.698.C.1#Equilibrium Constant"});
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

var nx71=1799;
var ny71=3023;
var t=paper.text(nx71,ny71,'Naming Ionic Compounds').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.345.C.1#Naming Ionic Compounds"});
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

var nx72=1718;
var ny72=1736;
var t=paper.text(nx72,ny72,'Quantum Numbers, Orbitals,\nand Probability Patterns').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.176.C.1#Quantum Numbers, Orbitals, and Probability Patterns"});
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

var nx73=1765;
var ny73=219;
var t=paper.text(nx73,ny73,'Matter and Energy').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt73=ny73-(tBox.height/2+10);
var bb73=ny73+(tBox.height/2+10);
var bl73=nx73-(tBox.width/2+10);
var br73=nx73+(tBox.width/2+10);
var b73=paper.rect(bl73, bt73, br73-bl73, bb73-bt73, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx74=3400;
var ny74=3879;
var t=paper.text(nx74,ny74,'Nuclear Force').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.908.C.1#Nuclear Force"});
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

var nx75=2787;
var ny75=4002;
var t=paper.text(nx75,ny75,'Balancing Redox Equations Using\nthe Oxidation Number Method').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.869.C.1#Balancing Redox Equations Using the Oxidation Number Method"});
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

var nx76=2241;
var ny76=4841;
var t=paper.text(nx76,ny76,'Buffers').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.791.C.1#Buffers"});
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

var nx77=1807;
var ny77=2598;
var t=paper.text(nx77,ny77,'Periodic Trends in\nIonization Energy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.300.C.1#Periodic Trends in Ionization Energy"});
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

var nx78=2322;
var ny78=2599;
var t=paper.text(nx78,ny78,'Periodic Trends in\nElectron Affinity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.306.C.1#Periodic Trends in Electron Affinity"});
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

var nx79=1955;
var ny79=1871;
var t=paper.text(nx79,ny79,'Electron Configuration and\nthe Periodic Table').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt79=ny79-(tBox.height/2+10);
var bb79=ny79+(tBox.height/2+10);
var bl79=nx79-(tBox.width/2+10);
var br79=nx79+(tBox.width/2+10);
var b79=paper.rect(bl79, bt79, br79-bl79, bb79-bt79, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx80=1765;
var ny80=316;
var t=paper.text(nx80,ny80,'What is Matter?').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.044.C.1#What is Matter?"});
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

var nx81=2105;
var ny81=3690;
var t=paper.text(nx81,ny81,'Collision Theory').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.661.C.1#Collision Theory"});
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

var nx82=3400;
var ny82=3981;
var t=paper.text(nx82,ny82,'Nuclear Disintigration').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.912.C.1#Nuclear Disintigration"});
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

var nx83=2251;
var ny83=3695;
var t=paper.text(nx83,ny83,'Potential Energy\nDiagrams').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.666.C.1#Potential Energy Diagrams"});
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

var nx84=2425;
var ny84=3916;
var t=paper.text(nx84,ny84,'Spontaneous Process').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.829.C.1#Spontaneous Process"});
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

var nx85=3826;
var ny85=3972;
var t=paper.text(nx85,ny85,'Aromatics').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.957.C.1#Aromatics"});
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

var nx86=1765;
var ny86=924;
var t=paper.text(nx86,ny86,'Atomic Structure').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.094.C.1#Atomic Structure"});
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

var nx87=3826;
var ny87=3682;
var t=paper.text(nx87,ny87,'Organic Chemistry').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt87=ny87-(tBox.height/2+10);
var bb87=ny87+(tBox.height/2+10);
var bl87=nx87-(tBox.width/2+10);
var br87=nx87+(tBox.width/2+10);
var b87=paper.rect(bl87, bt87, br87-bl87, bb87-bt87, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx88=1018;
var ny88=3680;
var t=paper.text(nx88,ny88,'Properties of Solids\nand Liquids').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.575.C.1#Properties of Solids and Liquids"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt88=ny88-(tBox.height/2+10);
var bb88=ny88+(tBox.height/2+10);
var bl88=nx88-(tBox.width/2+10);
var br88=nx88+(tBox.width/2+10);
var b88=paper.rect(bl88, bt88, br88-bl88, bb88-bt88, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx89=668;
var ny89=3984;
var t=paper.text(nx89,ny89,'Universal Gas Law').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.554.C.1#Universal Gas Law"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt89=ny89-(tBox.height/2+10);
var bb89=ny89+(tBox.height/2+10);
var bl89=nx89-(tBox.width/2+10);
var br89=nx89+(tBox.width/2+10);
var b89=paper.rect(bl89, bt89, br89-bl89, bb89-bt89, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx90=1698;
var ny90=2911;
var t=paper.text(nx90,ny90,'Ionic Compounds').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.335.C.1#Ionic Compounds"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt90=ny90-(tBox.height/2+10);
var bb90=ny90+(tBox.height/2+10);
var bl90=nx90-(tBox.width/2+10);
var br90=nx90+(tBox.width/2+10);
var b90=paper.rect(bl90, bt90, br90-bl90, bb90-bt90, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx91=1998;
var ny91=4565;
var t=paper.text(nx91,ny91,'Lewis Acids and Bases').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.759.C.1#Lewis Acids and Bases"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt91=ny91-(tBox.height/2+10);
var bb91=ny91+(tBox.height/2+10);
var bl91=nx91-(tBox.width/2+10);
var br91=nx91+(tBox.width/2+10);
var b91=paper.rect(bl91, bt91, br91-bl91, bb91-bt91, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx92=2243;
var ny92=4567;
var t=paper.text(nx92,ny92,'Neutralization').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt92=ny92-(tBox.height/2+10);
var bb92=ny92+(tBox.height/2+10);
var bl92=nx92-(tBox.width/2+10);
var br92=nx92+(tBox.width/2+10);
var b92=paper.rect(bl92, bt92, br92-bl92, bb92-bt92, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx93=3231;
var ny93=3878;
var t=paper.text(nx93,ny93,'Nuclear Notation').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.906.C.1#Nuclear Notation"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt93=ny93-(tBox.height/2+10);
var bb93=ny93+(tBox.height/2+10);
var bl93=nx93-(tBox.width/2+10);
var br93=nx93+(tBox.width/2+10);
var b93=paper.rect(bl93, bt93, br93-bl93, bb93-bt93, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx94=3400;
var ny94=4087;
var t=paper.text(nx94,ny94,'Radiation Around Us').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.923.C.1#Radiation Around Us"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt94=ny94-(tBox.height/2+10);
var bb94=ny94+(tBox.height/2+10);
var bl94=nx94-(tBox.width/2+10);
var br94=nx94+(tBox.width/2+10);
var b94=paper.rect(bl94, bt94, br94-bl94, bb94-bt94, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx95=865;
var ny95=4040;
var t=paper.text(nx95,ny95,'Vapor Pressure and\nBoiling').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.588.C.1#Vapor Pressure and Boiling"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt95=ny95-(tBox.height/2+10);
var bb95=ny95+(tBox.height/2+10);
var bl95=nx95-(tBox.width/2+10);
var br95=nx95+(tBox.width/2+10);
var b95=paper.rect(bl95, bt95, br95-bl95, bb95-bt95, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx96=1765;
var ny96=1251;
var t=paper.text(nx96,ny96,'Atoms and Electromagnetic\nSpectra').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.131.C.1#Atoms and Electromagnetic Spectra"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt96=ny96-(tBox.height/2+10);
var bb96=ny96+(tBox.height/2+10);
var bl96=nx96-(tBox.width/2+10);
var br96=nx96+(tBox.width/2+10);
var b96=paper.rect(bl96, bt96, br96-bl96, bb96-bt96, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx97=2276;
var ny97=3915;
var t=paper.text(nx97,ny97,'Enthalpy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.825.C.1#Enthalpy"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt97=ny97-(tBox.height/2+10);
var bb97=ny97+(tBox.height/2+10);
var bl97=nx97-(tBox.width/2+10);
var br97=nx97+(tBox.width/2+10);
var b97=paper.rect(bl97, bt97, br97-bl97, bb97-bt97, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx98=1020;
var ny98=4041;
var t=paper.text(nx98,ny98,'Heat and Changes\nof State').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.594.C.1#Heat and Changes of State"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt98=ny98-(tBox.height/2+10);
var bb98=ny98+(tBox.height/2+10);
var bl98=nx98-(tBox.width/2+10);
var br98=nx98+(tBox.width/2+10);
var b98=paper.rect(bl98, bt98, br98-bl98, bb98-bt98, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx99=3236;
var ny99=4087;
var t=paper.text(nx99,ny99,'Nuclear Equations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.919.C.1#Nuclear Equations"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt99=ny99-(tBox.height/2+10);
var bb99=ny99+(tBox.height/2+10);
var bl99=nx99-(tBox.width/2+10);
var br99=nx99+(tBox.width/2+10);
var b99=paper.rect(bl99, bt99, br99-bl99, bb99-bt99, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx100=1955;
var ny100=2346;
var t=paper.text(nx100,ny100,'The Periodic Table').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.289.C.1#The Periodic Table"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt100=ny100-(tBox.height/2+10);
var bb100=ny100+(tBox.height/2+10);
var bl100=nx100-(tBox.width/2+10);
var br100=nx100+(tBox.width/2+10);
var b100=paper.rect(bl100, bt100, br100-bl100, bb100-bt100, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx101=1375;
var ny101=420;
var t=paper.text(nx101,ny101,'The SI System of\nMeasurement').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.007.C.1#The SI System of Measurement"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt101=ny101-(tBox.height/2+10);
var bb101=ny101+(tBox.height/2+10);
var bl101=nx101-(tBox.width/2+10);
var br101=nx101+(tBox.width/2+10);
var b101=paper.rect(bl101, bt101, br101-bl101, bb101-bt101, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx102=2316;
var ny102=3046;
var t=paper.text(nx102,ny102,'The Geometrical Arrangement\nof Electrons and Molecular Shape').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.394.C.1#The Geometrical Arrangement of Electrons and Molecular Shape"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt102=ny102-(tBox.height/2+10);
var bb102=ny102+(tBox.height/2+10);
var bl102=nx102-(tBox.width/2+10);
var br102=nx102+(tBox.width/2+10);
var b102=paper.rect(bl102, bt102, br102-bl102, bb102-bt102, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx103=1375;
var ny103=515;
var t=paper.text(nx103,ny103,'Evaluating Measurements').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.028.C.1#Evaluating Measurements"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt103=ny103-(tBox.height/2+10);
var bb103=ny103+(tBox.height/2+10);
var bl103=nx103-(tBox.width/2+10);
var br103=nx103+(tBox.width/2+10);
var b103=paper.rect(bl103, bt103, br103-bl103, bb103-bt103, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx104=668;
var ny104=3882;
var t=paper.text(nx104,ny104,'Gas Laws').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.548.C.1#Gas Laws"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt104=ny104-(tBox.height/2+10);
var bb104=ny104+(tBox.height/2+10);
var bl104=nx104-(tBox.width/2+10);
var br104=nx104+(tBox.width/2+10);
var b104=paper.rect(bl104, bt104, br104-bl104, bb104-bt104, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx105=3826;
var ny105=4176;
var t=paper.text(nx105,ny105,'Biochemical Molecules').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.976.C.1#Biochemical Molecules"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt105=ny105-(tBox.height/2+10);
var bb105=ny105+(tBox.height/2+10);
var bl105=nx105-(tBox.width/2+10);
var br105=nx105+(tBox.width/2+10);
var b105=paper.rect(bl105, bt105, br105-bl105, bb105-bt105, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx106=1664;
var ny106=3396;
var t=paper.text(nx106,ny106,'Types of Reactions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.458.C.1#Types of Reactions"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt106=ny106-(tBox.height/2+10);
var bb106=ny106+(tBox.height/2+10);
var bl106=nx106-(tBox.width/2+10);
var br106=nx106+(tBox.width/2+10);
var b106=paper.rect(bl106, bt106, br106-bl106, bb106-bt106, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx107=1955;
var ny107=1629;
var t=paper.text(nx107,ny107,'Electron Arrangement').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.210.C.1#Electron Arrangement"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt107=ny107-(tBox.height/2+10);
var bb107=ny107+(tBox.height/2+10);
var bl107=nx107-(tBox.width/2+10);
var br107=nx107+(tBox.width/2+10);
var b107=paper.rect(bl107, bt107, br107-bl107, bb107-bt107, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx108=1414;
var ny108=3908;
var t=paper.text(nx108,ny108,'Solubility Graphs').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.634.C.1#Solubility Graphs"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt108=ny108-(tBox.height/2+10);
var bb108=ny108+(tBox.height/2+10);
var bl108=nx108-(tBox.width/2+10);
var br108=nx108+(tBox.width/2+10);
var b108=paper.rect(bl108, bt108, br108-bl108, bb108-bt108, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx109=2243;
var ny109=4459;
var t=paper.text(nx109,ny109,'Strengths of Acids and Bases').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.750.C.1#Strengths of Acids and Bases"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt109=ny109-(tBox.height/2+10);
var bb109=ny109+(tBox.height/2+10);
var bl109=nx109-(tBox.width/2+10);
var br109=nx109+(tBox.width/2+10);
var b109=paper.rect(bl109, bt109, br109-bl109, bb109-bt109, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx110=1484;
var ny110=3565;
var t=paper.text(nx110,ny110,'Solutions and Their\nBehavior').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt110=ny110-(tBox.height/2+10);
var bb110=ny110+(tBox.height/2+10);
var bl110=nx110-(tBox.width/2+10);
var br110=nx110+(tBox.width/2+10);
var b110=paper.rect(bl110, bt110, br110-bl110, bb110-bt110, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx111=1375;
var ny111=611;
var t=paper.text(nx111,ny111,'Graphing').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.031.C.1#Graphing"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt111=ny111-(tBox.height/2+10);
var bb111=ny111+(tBox.height/2+10);
var bl111=nx111-(tBox.width/2+10);
var br111=nx111+(tBox.width/2+10);
var b111=paper.rect(bl111, bt111, br111-bl111, bb111-bt111, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx112=1484;
var ny112=3788;
var t=paper.text(nx112,ny112,'Solution Formation').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.620.C.1#Solution Formation"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt112=ny112-(tBox.height/2+10);
var bb112=ny112+(tBox.height/2+10);
var bl112=nx112-(tBox.width/2+10);
var br112=nx112+(tBox.width/2+10);
var b112=paper.rect(bl112, bt112, br112-bl112, bb112-bt112, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx113=1698;
var ny113=2814;
var t=paper.text(nx113,ny113,'Ions and Ion Formation').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.329.C.1#Ions and Ion Formation"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt113=ny113-(tBox.height/2+10);
var bb113=ny113+(tBox.height/2+10);
var bl113=nx113-(tBox.width/2+10);
var br113=nx113+(tBox.width/2+10);
var b113=paper.rect(bl113, bt113, br113-bl113, bb113-bt113, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx114=3596;
var ny114=4088;
var t=paper.text(nx114,ny114,'Applications of Nuclear Energy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.929.C.1#Applications of Nuclear Energy"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt114=ny114-(tBox.height/2+10);
var bb114=ny114+(tBox.height/2+10);
var bl114=nx114-(tBox.width/2+10);
var br114=nx114+(tBox.width/2+10);
var b114=paper.rect(bl114, bt114, br114-bl114, bb114-bt114, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx115=2219;
var ny115=2713;
var t=paper.text(nx115,ny115,'Covalent Bonds\nand Formulas').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt115=ny115-(tBox.height/2+10);
var bb115=ny115+(tBox.height/2+10);
var bl115=nx115-(tBox.width/2+10);
var br115=nx115+(tBox.width/2+10);
var b115=paper.rect(bl115, bt115, br115-bl115, bb115-bt115, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx116=1742;
var ny116=3916;
var t=paper.text(nx116,ny116,'Reactions Between Ions\nin Solutions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.646.C.1#Reactions Between Ions in Solutions"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt116=ny116-(tBox.height/2+10);
var bb116=ny116+(tBox.height/2+10);
var bl116=nx116-(tBox.width/2+10);
var br116=nx116+(tBox.width/2+10);
var b116=paper.rect(bl116, bt116, br116-bl116, bb116-bt116, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx117=2064;
var ny117=3404;
var t=paper.text(nx117,ny117,'The Mole').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.415.C.1#The Mole"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt117=ny117-(tBox.height/2+10);
var bb117=ny117+(tBox.height/2+10);
var bl117=nx117-(tBox.width/2+10);
var br117=nx117+(tBox.width/2+10);
var b117=paper.rect(bl117, bt117, br117-bl117, bb117-bt117, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx118=335;
var ny118=3770;
var t=paper.text(nx118,ny118,'Percent Yield').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.504.C.1#Percent Yield"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt118=ny118-(tBox.height/2+10);
var bb118=ny118+(tBox.height/2+10);
var bl118=nx118-(tBox.width/2+10);
var br118=nx118+(tBox.width/2+10);
var b118=paper.rect(bl118, bt118, br118-bl118, bb118-bt118, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx119=1998;
var ny119=4359;
var t=paper.text(nx119,ny119,'Arrhenius Acids and Bases').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.744.C.1#Arrhenius Acids and Bases"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt119=ny119-(tBox.height/2+10);
var bb119=ny119+(tBox.height/2+10);
var bl119=nx119-(tBox.width/2+10);
var br119=nx119+(tBox.width/2+10);
var b119=paper.rect(bl119, bt119, br119-bl119, bb119-bt119, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx120=524;
var ny120=3984;
var t=paper.text(nx120,ny120,'Molar Volume').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.559.C.1#Molar Volume"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt120=ny120-(tBox.height/2+10);
var bb120=ny120+(tBox.height/2+10);
var bl120=nx120-(tBox.width/2+10);
var br120=nx120+(tBox.width/2+10);
var b120=paper.rect(bl120, bt120, br120-bl120, bb120-bt120, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx121=2203;
var ny121=3177;
var t=paper.text(nx121,ny121,'The Mole Concept').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt121=ny121-(tBox.height/2+10);
var bb121=ny121+(tBox.height/2+10);
var bl121=nx121-(tBox.width/2+10);
var br121=nx121+(tBox.width/2+10);
var b121=paper.rect(bl121, bt121, br121-bl121, bb121-bt121, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx122=2118;
var ny122=4240;
var t=paper.text(nx122,ny122,'Properties of Acids\nand Bases').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.739.C.1#Properties of Acids and Bases"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt122=ny122-(tBox.height/2+10);
var bb122=ny122+(tBox.height/2+10);
var bl122=nx122-(tBox.width/2+10);
var br122=nx122+(tBox.width/2+10);
var b122=paper.rect(bl122, bt122, br122-bl122, bb122-bt122, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx123=1765;
var ny123=816;
var t=paper.text(nx123,ny123,'Further Understanding\nof the Atom').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.090.C.1#Further Understanding of the Atom"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt123=ny123-(tBox.height/2+10);
var bb123=ny123+(tBox.height/2+10);
var bl123=nx123-(tBox.width/2+10);
var br123=nx123+(tBox.width/2+10);
var b123=paper.rect(bl123, bt123, br123-bl123, bb123-bt123, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx124=1569;
var ny124=100;
var t=paper.text(nx124,ny124,'Chemistry').attr({fill:"white","font-size": 24});
var tBox=t.getBBox(); 
var bt124=ny124-(tBox.height/2+10);
var bb124=ny124+(tBox.height/2+10);
var bl124=nx124-(tBox.width/2+10);
var br124=nx124+(tBox.width/2+10);
var b124=paper.rect(bl124, bt124, br124-bl124, bb124-bt124, 10).attr({stroke:"#7cbf00","stroke-width": "4"});

var nx125=1269;
var ny125=3913;
var t=paper.text(nx125,ny125,'Factors Affecting\nSolubility').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.630.C.1#Factors Affecting Solubility"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt125=ny125-(tBox.height/2+10);
var bb125=ny125+(tBox.height/2+10);
var bl125=nx125-(tBox.width/2+10);
var br125=nx125+(tBox.width/2+10);
var b125=paper.rect(bl125, bt125, br125-bl125, bb125-bt125, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx126=1827;
var ny126=3403;
var t=paper.text(nx126,ny126,'Balancing Chemical\nEquations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.455.C.1#Balancing Chemical Equations"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt126=ny126-(tBox.height/2+10);
var bb126=ny126+(tBox.height/2+10);
var bl126=nx126-(tBox.width/2+10);
var br126=nx126+(tBox.width/2+10);
var b126=paper.rect(bl126, bt126, br126-bl126, bb126-bt126, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx127=1203;
var ny127=317;
var t=paper.text(nx127,ny127,'Making Observations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.001.C.1#Making Observations"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt127=ny127-(tBox.height/2+10);
var bb127=ny127+(tBox.height/2+10);
var bl127=nx127-(tBox.width/2+10);
var br127=nx127+(tBox.width/2+10);
var b127=paper.rect(bl127, bt127, br127-bl127, bb127-bt127, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx128=1765;
var ny128=709;
var t=paper.text(nx128,ny128,'The Atomic Theory').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.086.C.1#The Atomic Theory"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt128=ny128-(tBox.height/2+10);
var bb128=ny128+(tBox.height/2+10);
var bl128=nx128-(tBox.width/2+10);
var br128=nx128+(tBox.width/2+10);
var b128=paper.rect(bl128, bt128, br128-bl128, bb128-bt128, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx129=1544;
var ny129=420;
var t=paper.text(nx129,ny129,'Using Algebra in\nChemistry').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.019.C.1#Using Algebra in Chemistry"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt129=ny129-(tBox.height/2+10);
var bb129=ny129+(tBox.height/2+10);
var bl129=nx129-(tBox.width/2+10);
var br129=nx129+(tBox.width/2+10);
var b129=paper.rect(bl129, bt129, br129-bl129, bb129-bt129, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx130=1484;
var ny130=3678;
var t=paper.text(nx130,ny130,'Properties of Solutions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.616.C.1#Properties of Solutions"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt130=ny130-(tBox.height/2+10);
var bb130=ny130+(tBox.height/2+10);
var bl130=nx130-(tBox.width/2+10);
var br130=nx130+(tBox.width/2+10);
var b130=paper.rect(bl130, bt130, br130-bl130, bb130-bt130, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx131=2969;
var ny131=3790;
var t=paper.text(nx131,ny131,'Origin of the Term\nOxidation').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.863.C.1#Origin of the Term Oxidation"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt131=ny131-(tBox.height/2+10);
var bb131=ny131+(tBox.height/2+10);
var bl131=nx131-(tBox.width/2+10);
var br131=nx131+(tBox.width/2+10);
var b131=paper.rect(bl131, bt131, br131-bl131, bb131-bt131, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx132=1955;
var ny132=1728;
var t=paper.text(nx132,ny132,'Valence Electrons').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.CHE.215.C.1#Valence Electrons"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt132=ny132-(tBox.height/2+10);
var bb132=ny132+(tBox.height/2+10);
var bl132=nx132-(tBox.width/2+10);
var br132=nx132+(tBox.width/2+10);
var b132=paper.rect(bl132, bt132, br132-bl132, bb132-bt132, 10).attr({stroke:"#bf5600","stroke-width": "2"});

bb133=2599
bt133=2599
bl133=1698
br133=1698
nx133=1698
ny133=2599

bb134=3984
bt134=3984
bl134=416
br134=416
nx134=416
ny134=3984

bb135=2962
bt135=2962
bl135=1977
br135=1977
nx135=1977
ny135=2962

bb136=2598
bt136=2598
bl136=2219
br136=2219
nx136=2219
ny136=2598

bb137=3404
bt137=3404
bl137=1955
br137=1955
nx137=1955
ny137=3404

s='M '+nx0+' '+bb0+' L '+nx0+' '+bt19; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx1+' '+bb1+' L '+nx1+' '+bt58; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb2+(bt106-bb2)/2; 
s='M '+1664+' '+mid+' L '+1827+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx2+' '+bb2+' L '+nx2+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx126+' '+mid+' L '+nx126+' '+bt126;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx106+' '+mid+' L '+nx106+' '+bt106;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx4+' '+bb4+' L '+nx4+' '+bt102; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb5+(bt66-bb5)/2; 
s='M '+865+' '+mid+' L '+1167+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx5+' '+bb5+' L '+nx5+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx95+' '+mid+' L '+nx95+' '+bt95;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx98+' '+mid+' L '+nx98+' '+bt98;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx66+' '+mid+' L '+nx66+' '+bt66;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx6+' '+bb6+' L '+nx6+' '+bt76; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb8+(bt43-bb8)/2; 
s='M '+1203+' '+mid+' L '+1544+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx8+' '+bb8+' L '+nx8+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx127+' '+mid+' L '+nx127+' '+bt127;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx43+' '+mid+' L '+nx43+' '+bt43;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx49+' '+mid+' L '+nx49+' '+bt49;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx9+' '+bb9+' L '+nx9+' '+bt18; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx10+' '+bb10+' L '+nx10+' '+bt105; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb11+(bt52-bb11)/2; 
s='M '+1603+' '+mid+' L '+1955+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx11+' '+bb11+' L '+nx11+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx35+' '+mid+' L '+nx35+' '+bt35;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx52+' '+mid+' L '+nx52+' '+bt52;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx12+' '+bb12+' L '+nx12+' '+bt100; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br14+' '+2598+' L '+2219+' '+2598; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx15+' '+bb15+' L '+nx15+' '+bt85; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb16+(bt117-bb16)/2; 
s='M '+2064+' '+mid+' L '+2375+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx16+' '+bb16+' L '+nx16+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx117+' '+mid+' L '+nx117+' '+bt117;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx30+' '+mid+' L '+nx30+' '+bt30;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx64+' '+mid+' L '+nx64+' '+bt64;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb17+(bt1-bb17)/2; 
s='M '+2276+' '+mid+' L '+2580+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx17+' '+bb17+' L '+nx17+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx97+' '+mid+' L '+nx97+' '+bt97;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx84+' '+mid+' L '+nx84+' '+bt84;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx1+' '+mid+' L '+nx1+' '+bt1;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx18+' '+bb18+' L '+nx18+' '+bt36; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx19+' '+bb19+' L '+nx19+' '+bt50; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx20+' '+bb20+' L '+nx20+' '+bt91; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb21+(bt22-bb21)/2; 
s='M '+200+' '+mid+' L '+416+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx21+' '+bb21+' L '+nx21+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx118+' '+mid+' L '+nx118+' '+bt118;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx22+' '+mid+' L '+nx22+' '+bt22;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx134+' '+mid+' L '+nx134+' '+bt134;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb23+(bt70-bb23)/2; 
s='M '+1784+' '+mid+' L '+2118+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx23+' '+bb23+' L '+nx23+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx37+' '+mid+' L '+nx37+' '+bt37;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx70+' '+mid+' L '+nx70+' '+bt70;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx24+' '+bb24+' L '+nx24+' '+bt68; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb26+(bt14-bb26)/2; 
s='M '+1586+' '+mid+' L '+2322+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx26+' '+bb26+' L '+nx26+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx77+' '+mid+' L '+nx77+' '+bt77;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx67+' '+mid+' L '+nx67+' '+bt67;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx14+' '+mid+' L '+nx14+' '+bt14;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx78+' '+mid+' L '+nx78+' '+bt78;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx27+' '+bb27+' L '+nx27+' '+bt69; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx28+' '+bb28+' L '+nx28+' '+bt131; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb29+(bt33-bb29)/2; 
s='M '+1977+' '+mid+' L '+2316+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx29+' '+bb29+' L '+nx29+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx135+' '+mid+' L '+nx135+' '+bt135;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx4+' '+mid+' L '+nx4+' '+bt4;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx33+' '+mid+' L '+nx33+' '+bt33;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx31+' '+bb31+' L '+nx31+' '+bt72; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx32+' '+bb32+' L '+nx32+' '+bt6; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb34+(bt87-bb34)/2; 
s='M '+1958+' '+mid+' L '+3826+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx34+' '+bb34+' L '+nx34+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx81+' '+mid+' L '+nx81+' '+bt81;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx9+' '+mid+' L '+nx9+' '+bt9;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx83+' '+mid+' L '+nx83+' '+bt83;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx28+' '+mid+' L '+nx28+' '+bt28;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx87+' '+mid+' L '+nx87+' '+bt87;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx54+' '+mid+' L '+nx54+' '+bt54;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx45+' '+mid+' L '+nx45+' '+bt45;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx35+' '+bb35+' L '+nx35+' '+bt107; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx36+' '+bb36+' L '+nx36+' '+bt23; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx37+' '+bb37+' L '+nx37+' '+bt122; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx39+' '+bb39+' L '+nx39+' '+bt2; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb40+(bt44-bb40)/2; 
s='M '+2787+' '+mid+' L '+3099+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx40+' '+bb40+' L '+nx40+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx44+' '+mid+' L '+nx44+' '+bt44;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx75+' '+mid+' L '+nx75+' '+bt75;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx57+' '+mid+' L '+nx57+' '+bt57;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb41+(bt93-bb41)/2; 
s='M '+3231+' '+mid+' L '+3400+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx41+' '+bb41+' L '+nx41+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx93+' '+mid+' L '+nx93+' '+bt93;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx74+' '+mid+' L '+nx74+' '+bt74;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx42+' '+bb42+' L '+nx42+' '+bt46; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx43+' '+bb43+' L '+nx43+' '+bt129; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx45+' '+bb45+' L '+nx45+' '+bt17; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb46+(bt53-bb46)/2; 
s='M '+524+' '+mid+' L '+668+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx46+' '+bb46+' L '+nx46+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx53+' '+mid+' L '+nx53+' '+bt53;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx104+' '+mid+' L '+nx104+' '+bt104;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx47+' '+bb47+' L '+nx47+' '+bt88; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx48+' '+bb48+' L '+nx48+' '+bt42; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx49+' '+bb49+' L '+nx49+' '+bt101; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx50+' '+bb50+' L '+nx50+' '+bt128; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb52+(bt56-bb52)/2; 
s='M '+1497+' '+mid+' L '+1718+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx52+' '+bb52+' L '+nx52+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx31+' '+mid+' L '+nx31+' '+bt31;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx56+' '+mid+' L '+nx56+' '+bt56;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx53+' '+bb53+' L '+nx53+' '+bt120; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx54+' '+bb54+' L '+nx54+' '+bt41; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx55+' '+bb55+' L '+nx55+' '+bt15; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx59+' '+bb59+' L '+nx59+' '+bt21; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx60+' '+bb60+' L '+nx60+' '+bt109; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx62+' '+bb62+' L '+nx62+' '+bt113; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx65+' '+bb65+' L '+nx65+' '+bt5; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br67+' '+2599+' L '+1698+' '+2599; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx68+' '+bb68+' L '+nx68+' '+bt12; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx69+' '+bb69+' L '+nx69+' '+bt96; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb70+(bt61-bb70)/2; 
s='M '+1671+' '+mid+' L '+1872+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx70+' '+bb70+' L '+nx70+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx13+' '+mid+' L '+nx13+' '+bt13;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx61+' '+mid+' L '+nx61+' '+bt61;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx73+' '+bb73+' L '+nx73+' '+bt80; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx74+' '+bb74+' L '+nx74+' '+bt82; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1698+' '+2599+' L '+bl77+' '+2599; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2219+' '+2598+' L '+bl78+' '+2598; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx79+' '+bb79+' L '+nx79+' '+bt24; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx80+' '+bb80+' L '+nx80+' '+bt0; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb82+(bt94-bb82)/2; 
s='M '+3236+' '+mid+' L '+3596+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx82+' '+bb82+' L '+nx82+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx114+' '+mid+' L '+nx114+' '+bt114;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx99+' '+mid+' L '+nx99+' '+bt99;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx94+' '+mid+' L '+nx94+' '+bt94;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx85+' '+bb85+' L '+nx85+' '+bt10; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx86+' '+bb86+' L '+nx86+' '+bt27; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx87+' '+bb87+' L '+nx87+' '+bt55; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx88+' '+bb88+' L '+nx88+' '+bt65; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb90+(bt135-bb90)/2; 
s='M '+1610+' '+mid+' L '+1977+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx90+' '+bb90+' L '+nx90+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx25+' '+mid+' L '+nx25+' '+bt25;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx135+' '+mid+' L '+nx135+' '+bt135;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx71+' '+mid+' L '+nx71+' '+bt71;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx92+' '+bb92+' L '+nx92+' '+bt32; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx96+' '+bb96+' L '+nx96+' '+bt11; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx100+' '+bb100+' L '+nx100+' '+bt26; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx101+' '+bb101+' L '+nx101+' '+bt103; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx103+' '+bb103+' L '+nx103+' '+bt111; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx104+' '+bb104+' L '+nx104+' '+bt89; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx107+' '+bb107+' L '+nx107+' '+bt132; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx109+' '+bb109+' L '+nx109+' '+bt92; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx110+' '+bb110+' L '+nx110+' '+bt130; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb7+(bt108-bb7)/2; 
s='M '+1269+' '+mid+' L '+1742+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx112+' '+bb112+' L '+nx112+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx38+' '+mid+' L '+nx38+' '+bt38;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx108+' '+mid+' L '+nx108+' '+bt108;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx125+' '+mid+' L '+nx125+' '+bt125;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx116+' '+mid+' L '+nx116+' '+bt116;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx113+' '+bb113+' L '+nx113+' '+bt90; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx115+' '+bb115+' L '+nx115+' '+bt29; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1955+' '+3404+' L '+bl117+' '+3404; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx119+' '+bb119+' L '+nx119+' '+bt20; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+416+' '+3984+' L '+bl120+' '+3984; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx121+' '+bb121+' L '+nx121+' '+bt16; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb122+(bt119-bb122)/2; 
s='M '+1998+' '+mid+' L '+2243+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx122+' '+bb122+' L '+nx122+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx119+' '+mid+' L '+nx119+' '+bt119;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx60+' '+mid+' L '+nx60+' '+bt60;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx123+' '+bb123+' L '+nx123+' '+bt86; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb124+(bt8-bb124)/2; 
s='M '+1375+' '+mid+' L '+1765+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx124+' '+bb124+' L '+nx124+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx73+' '+mid+' L '+nx73+' '+bt73;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx8+' '+mid+' L '+nx8+' '+bt8;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br126+' '+3404+' L '+1955+' '+3404; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx128+' '+bb128+' L '+nx128+' '+bt123; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx129+' '+bb129+' L '+nx129+' '+bt63; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb130+(bt112-bb130)/2; 
s='M '+1308+' '+mid+' L '+1649+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx130+' '+bb130+' L '+nx130+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx7+' '+mid+' L '+nx7+' '+bt7;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx51+' '+mid+' L '+nx51+' '+bt51;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx112+' '+mid+' L '+nx112+' '+bt112;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx131+' '+bb131+' L '+nx131+' '+bt40; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx132+' '+bb132+' L '+nx132+' '+bt79; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx133+' '+bb133+' L '+nx133+' '+bt62; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx134+' '+bb134+' L '+nx134+' '+bt3; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb71+(bt121-bb71)/2; 
s='M '+1745+' '+mid+' L '+2203+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx135+' '+bb135+' L '+nx135+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx121+' '+mid+' L '+nx121+' '+bt121;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx39+' '+mid+' L '+nx39+' '+bt39;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx136+' '+bb136+' L '+nx136+' '+bt115; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb64+(bt59-bb64)/2; 
s='M '+274+' '+mid+' L '+2726+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx137+' '+bb137+' L '+nx137+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx110+' '+mid+' L '+nx110+' '+bt110;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx59+' '+mid+' L '+nx59+' '+bt59;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx48+' '+mid+' L '+nx48+' '+bt48;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx47+' '+mid+' L '+nx47+' '+bt47;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx34+' '+mid+' L '+nx34+' '+bt34;
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