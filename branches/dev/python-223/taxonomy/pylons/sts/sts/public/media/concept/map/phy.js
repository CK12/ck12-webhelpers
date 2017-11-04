window.onload = function() { 

mapWidth = 3044; 
mapHeight = 2341; 

boxWidth = 900; 
boxHeight = 600; 
aspectRatio = boxWidth/boxHeight; 
zoomFactor = 5; 

var paper = Raphael(document.getElementById('holder'), 900, 600); 

canvasWidth = boxWidth; 
canvasHeight = boxHeight; 

rootx = 1180; 
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
var nx0=1155;
var ny0=1947;
var t=paper.text(nx0,ny0,'Electric Current').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.730.C.1#Electric Current"});
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

var nx1=2106;
var ny1=1924;
var t=paper.text(nx1,ny1,'Flow Rate').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.858.C.1#Flow Rate"});
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

var nx2=1700;
var ny2=1927;
var t=paper.text(nx2,ny2,'Yield').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.816.C.1#Yield"});
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

var nx3=1232;
var ny3=1843;
var t=paper.text(nx3,ny3,'Electric Flux').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.712.C.1#Electric Flux"});
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

var nx4=2382;
var ny4=1750;
var t=paper.text(nx4,ny4,'Quantum Mechanics').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.910.C.1#Quantum Mechanics"});
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

var nx5=1244;
var ny5=896;
var t=paper.text(nx5,ny5,"Newton's Laws").attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.210.C.1#Newton's Laws"});
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

var nx6=1565;
var ny6=1755;
var t=paper.text(nx6,ny6,'Magnetic Fields').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.720.C.1#Magnetic Fields"});
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

var nx7=1244;
var ny7=792;
var t=paper.text(nx7,ny7,'Linear Motion').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.200.C.1#Linear Motion"});
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

var nx8=1180;
var ny8=100;
var t=paper.text(nx8,ny8,'Physics').attr({fill:"white","font-size": 24});
var tBox=t.getBBox(); 
var bt8=ny8-(tBox.height/2+10);
var bb8=ny8+(tBox.height/2+10);
var bl8=nx8-(tBox.width/2+10);
var br8=nx8+(tBox.width/2+10);
var b8=paper.rect(bl8, bt8, br8-bl8, bb8-bt8, 10).attr({stroke:"#7cbf00","stroke-width": "4"});

var nx9=623;
var ny9=2037;
var t=paper.text(nx9,ny9,'First Law of\nThermodynamics').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.632.C.1#First Law of Thermodynamics"});
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

var nx10=914;
var ny10=2025;
var t=paper.text(nx10,ny10,'Convection').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.644.C.1#Convection"});
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

var nx11=2108;
var ny11=2186;
var t=paper.text(nx11,ny11,'Conservation of Energy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.864.C.1#Conservation of Energy"});
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

var nx12=1441;
var ny12=2044;
var t=paper.text(nx12,ny12,"Faraday's Law\nof Induction").attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.760.C.1#Faraday's Law of Induction"});
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

var nx13=625;
var ny13=2241;
var t=paper.text(nx13,ny13,'Third Law of\nThermodynamics').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.636.C.1#Third Law of Thermodynamics"});
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

var nx14=623;
var ny14=2137;
var t=paper.text(nx14,ny14,'Second Law of\nThermodynamics').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.634.C.1#Second Law of Thermodynamics"});
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

var nx15=1369;
var ny15=571;
var t=paper.text(nx15,ny15,'Potential Energy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.510.C.1#Potential Energy"});
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

var nx16=1567;
var ny16=1845;
var t=paper.text(nx16,ny16,'Magnetic Flux').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.722.C.1#Magnetic Flux"});
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

var nx17=779;
var ny17=443;
var t=paper.text(nx17,ny17,'1-D Motion').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.120.C.1#1-D Motion"});
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

var nx18=779;
var ny18=533;
var t=paper.text(nx18,ny18,'Vectors and 2-D\nMotion').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.130.C.1#Vectors and 2-D Motion"});
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

var nx19=549;
var ny19=1463;
var t=paper.text(nx19,ny19,'Reflection').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.462.C.1#Reflection"});
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

var nx20=2108;
var ny20=2095;
var t=paper.text(nx20,ny20,'Conservation of Momentum').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.862.C.1#Conservation of Momentum"});
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

var nx21=554;
var ny21=903;
var t=paper.text(nx21,ny21,'Pendulums').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.420.C.1#Pendulums"});
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

var nx22=801;
var ny22=2025;
var t=paper.text(nx22,ny22,'Conduction').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.642.C.1#Conduction"});
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

var nx23=1675;
var ny23=571;
var t=paper.text(nx23,ny23,'Kinetic Energy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.520.C.1#Kinetic Energy"});
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

var nx24=1244;
var ny24=1019;
var t=paper.text(nx24,ny24,"Newton's 2nd Law:\nForce and Acceleration").attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.214.C.1#Newton's 2nd Law: Force and Acceleration"});
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

var nx25=1180;
var ny25=296;
var t=paper.text(nx25,ny25,'Units of Measurement').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.110.C.1#Units of Measurement"});
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

var nx26=200;
var ny26=1461;
var t=paper.text(nx26,ny26,'Sound in Mediums').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.452.C.1#Sound in Mediums"});
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

var nx27=1981;
var ny27=1633;
var t=paper.text(nx27,ny27,'Continuum Mechanics').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt27=ny27-(tBox.height/2+10);
var bb27=ny27+(tBox.height/2+10);
var bl27=nx27-(tBox.width/2+10);
var br27=nx27+(tBox.width/2+10);
var b27=paper.rect(bl27, bt27, br27-bl27, bb27-bt27, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx28=1244;
var ny28=1185;
var t=paper.text(nx28,ny28,'Elastic Collisions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.230.C.1#Elastic Collisions"});
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

var nx29=1567;
var ny29=1949;
var t=paper.text(nx29,ny29,'Magnetic Forces').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.750.C.1#Magnetic Forces"});
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

var nx30=307;
var ny30=903;
var t=paper.text(nx30,ny30,'Spring-Mass\nSystems').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.410.C.1#Spring-Mass Systems"});
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

var nx31=1921;
var ny31=1926;
var t=paper.text(nx31,ny31,"Hooke's Law").attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.818.C.1#Hooke's Law"});
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

var nx32=623;
var ny32=1935;
var t=paper.text(nx32,ny32,'Zeroth Law of\nThermodynamics').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.630.C.1#Zeroth Law of Thermodynamics"});
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

var nx33=871;
var ny33=1103;
var t=paper.text(nx33,ny33,'Angular Momentum').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.330.C.1#Angular Momentum"});
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

var nx34=1675;
var ny34=1350;
var t=paper.text(nx34,ny34,'Work and Power').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.550.C.1#Work and Power"});
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

var nx35=1919;
var ny35=1846;
var t=paper.text(nx35,ny35,'Elasticity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.814.C.1#Elasticity"});
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

var nx36=1762;
var ny36=1471;
var t=paper.text(nx36,ny36,'Machines').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.554.C.1#Machines"});
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

var nx37=437;
var ny37=999;
var t=paper.text(nx37,ny37,'Waves and\nVibrations').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt37=ny37-(tBox.height/2+10);
var bb37=ny37+(tBox.height/2+10);
var bl37=nx37-(tBox.width/2+10);
var br37=nx37+(tBox.width/2+10);
var b37=paper.rect(bl37, bt37, br37-bl37, bb37-bt37, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx38=1180;
var ny38=198;
var t=paper.text(nx38,ny38,'Classical Mechanics').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt38=ny38-(tBox.height/2+10);
var bb38=ny38+(tBox.height/2+10);
var bl38=nx38-(tBox.width/2+10);
var br38=nx38+(tBox.width/2+10);
var b38=paper.rect(bl38, bt38, br38-bl38, bb38-bt38, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx39=662;
var ny39=1462;
var t=paper.text(nx39,ny39,'Refraction').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.464.C.1#Refraction"});
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

var nx40=662;
var ny40=1337;
var t=paper.text(nx40,ny40,'Light').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.460.C.1#Light"});
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

var nx41=1308;
var ny41=2037;
var t=paper.text(nx41,ny41,'Capacitance').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.742.C.1#Capacitance"});
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

var nx42=2844;
var ny42=1945;
var t=paper.text(nx42,ny42,'Subatomic\nParticles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.952.C.1#Subatomic Particles"});
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

var nx43=1810;
var ny43=1748;
var t=paper.text(nx43,ny43,'Solid Mechanics').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.810.C.1#Solid Mechanics"});
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

var nx44=2498;
var ny44=1937;
var t=paper.text(nx44,ny44,'Ion Radiation').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.942.C.1#Ion Radiation"});
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

var nx45=436;
var ny45=1550;
var t=paper.text(nx45,ny45,'Doppler Effect').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.472.C.1#Doppler Effect"});
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

var nx46=1230;
var ny46=2124;
var t=paper.text(nx46,ny46,"Kirchhoff's Laws").attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.744.C.1#Kirchhoff's Laws"});
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

var nx47=871;
var ny47=1197;
var t=paper.text(nx47,ny47,'Conservation of\nAngular Momentum').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.332.C.1#Conservation of Angular Momentum"});
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

var nx48=1244;
var ny48=1278;
var t=paper.text(nx48,ny48,'Inelastic Collisions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.240.C.1#Inelastic Collisions"});
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

var nx49=1527;
var ny49=443;
var t=paper.text(nx49,ny49,'Energy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.500.C.1#Energy"});
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

var nx50=766;
var ny50=1725;
var t=paper.text(nx50,ny50,'Temperature').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.610.C.1#Temperature"});
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

var nx51=2615;
var ny51=1937;
var t=paper.text(nx51,ny51,'Fusion').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.960.C.1#Fusion"});
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

var nx52=779;
var ny52=792;
var t=paper.text(nx52,ny52,'Circular Motion').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.300.C.1#Circular Motion"});
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

var nx53=1308;
var ny53=1949;
var t=paper.text(nx53,ny53,'Electric Potential').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.740.C.1#Electric Potential"});
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

var nx54=327;
var ny54=1461;
var t=paper.text(nx54,ny54,'Resonance').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.454.C.1#Resonance"});
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

var nx55=1558;
var ny55=1473;
var t=paper.text(nx55,ny55,'Work-Energy Theorem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.552.C.1#Work-Energy Theorem"});
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

var nx56=1230;
var ny56=2220;
var t=paper.text(nx56,ny56,'DC Circuits').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.746.C.1#DC Circuits"});
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

var nx57=695;
var ny57=1194;
var t=paper.text(nx57,ny57,'Planetary\nMotion').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.322.C.1#Planetary Motion"});
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

var nx58=1232;
var ny58=1754;
var t=paper.text(nx58,ny58,'Electric Fields').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.710.C.1#Electric Fields"});
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

var nx59=2524;
var ny59=1750;
var t=paper.text(nx59,ny59,'Relativity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.920.C.1#Relativity"});
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

var nx60=438;
var ny60=1462;
var t=paper.text(nx60,ny60,'Interference').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.470.C.1#Interference"});
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

var nx61=1028;
var ny61=2026;
var t=paper.text(nx61,ny61,'Radiation').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.646.C.1#Radiation"});
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

var nx62=1413;
var ny62=1640;
var t=paper.text(nx62,ny62,'Electricity and\nMagnetism').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt62=ny62-(tBox.height/2+10);
var bb62=ny62+(tBox.height/2+10);
var bl62=nx62-(tBox.width/2+10);
var br62=nx62+(tBox.width/2+10);
var b62=paper.rect(bl62, bt62, br62-bl62, bb62-bt62, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx63=1441;
var ny63=2156;
var t=paper.text(nx63,ny63,'Electromagnetic Waves').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.770.C.1#Electromagnetic Waves"});
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

var nx64=1584;
var ny64=685;
var t=paper.text(nx64,ny64,'Efficiency').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.540.C.1#Efficiency"});
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

var nx65=1155;
var ny65=2037;
var t=paper.text(nx65,ny65,'Resistance').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.732.C.1#Resistance"});
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

var nx66=1813;
var ny66=1927;
var t=paper.text(nx66,ny66,'Stress-Strain').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.820.C.1#Stress-Strain"});
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

var nx67=2108;
var ny67=2009;
var t=paper.text(nx67,ny67,'Conservation of Mass').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.860.C.1#Conservation of Mass"});
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

var nx68=1092;
var ny68=1284;
var t=paper.text(nx68,ny68,'Conservation of\nLinear Momentum').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.222.C.1#Conservation of Linear Momentum"});
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

var nx69=766;
var ny69=1816;
var t=paper.text(nx69,ny69,'Heat').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.620.C.1#Heat"});
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

var nx70=777;
var ny70=1463;
var t=paper.text(nx70,ny70,'Diffraction').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.466.C.1#Diffraction"});
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

var nx71=2498;
var ny71=1853;
var t=paper.text(nx71,ny71,'Radioactivity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.940.C.1#Radioactivity"});
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

var nx72=1371;
var ny72=1185;
var t=paper.text(nx72,ny72,'Friction').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.250.C.1#Friction"});
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

var nx73=1092;
var ny73=1185;
var t=paper.text(nx73,ny73,'Linear Momentum').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.220.C.1#Linear Momentum"});
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

var nx74=2175;
var ny74=1847;
var t=paper.text(nx74,ny74,'Viscosity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.854.C.1#Viscosity"});
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

var nx75=2524;
var ny75=1634;
var t=paper.text(nx75,ny75,'Modern Physics').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt75=ny75-(tBox.height/2+10);
var bb75=ny75+(tBox.height/2+10);
var bl75=nx75-(tBox.width/2+10);
var br75=nx75+(tBox.width/2+10);
var b75=paper.rect(bl75, bt75, br75-bl75, bb75-bt75, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx76=2728;
var ny76=1937;
var t=paper.text(nx76,ny76,'Fission').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.962.C.1#Fission"});
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

var nx77=1418;
var ny77=1021;
var t=paper.text(nx77,ny77,"Newton's 3rd Law:\nAction and Reaction").attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.216.C.1#Newton's 3rd Law: Action and Reaction"});
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

var nx78=2035;
var ny78=1847;
var t=paper.text(nx78,ny78,'Pressure').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.852.C.1#Pressure"});
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

var nx79=435;
var ny79=785;
var t=paper.text(nx79,ny79,'Harmonic Motion').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.400.C.1#Harmonic Motion"});
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

var nx80=1700;
var ny80=1846;
var t=paper.text(nx80,ny80,'Plasticity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.812.C.1#Plasticity"});
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

var nx81=307;
var ny81=993;
var t=paper.text(nx81,ny81,'Damping').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.412.C.1#Damping"});
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

var nx82=893;
var ny82=1462;
var t=paper.text(nx82,ny82,'Dispersion').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.468.C.1#Dispersion"});
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

var nx83=2175;
var ny83=1752;
var t=paper.text(nx83,ny83,'Fluid Mechanics').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.850.C.1#Fluid Mechanics"});
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

var nx84=779;
var ny84=894;
var t=paper.text(nx84,ny84,'Center of Gravity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.302.C.1#Center of Gravity"});
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

var nx85=437;
var ny85=1201;
var t=paper.text(nx85,ny85,'Transverse and\nLongitudinal Waves').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.440.C.1#Transverse and Longitudinal Waves"});
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

var nx86=2290;
var ny86=1846;
var t=paper.text(nx86,ny86,'Bouyancy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.856.C.1#Bouyancy"});
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

var nx87=1450;
var ny87=691;
var t=paper.text(nx87,ny87,'Conservation\nof Energy').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.530.C.1#Conservation of Energy"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt87=ny87-(tBox.height/2+10);
var bb87=ny87+(tBox.height/2+10);
var bl87=nx87-(tBox.width/2+10);
var br87=nx87+(tBox.width/2+10);
var b87=paper.rect(bl87, bt87, br87-bl87, bb87-bt87, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx88=914;
var ny88=1926;
var t=paper.text(nx88,ny88,'Heat Transfer').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.640.C.1#Heat Transfer"});
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

var nx89=779;
var ny89=635;
var t=paper.text(nx89,ny89,'Coordinate System and\nReference Frames').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.140.C.1#Coordinate System and Reference Frames"});
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

var nx90=2654;
var ny90=1750;
var t=paper.text(nx90,ny90,'Partical Physics').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.930.C.1#Partical Physics"});
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

var nx91=764;
var ny91=1634;
var t=paper.text(nx91,ny91,'Thermodynamics').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt91=ny91-(tBox.height/2+10);
var bb91=ny91+(tBox.height/2+10);
var bl91=nx91-(tBox.width/2+10);
var br91=nx91+(tBox.width/2+10);
var b91=paper.rect(bl91, bt91, br91-bl91, bb91-bt91, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx92=437;
var ny92=1101;
var t=paper.text(nx92,ny92,'Wave Motion').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.430.C.1#Wave Motion"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "white"}); 
}); 
var tBox=t.getBBox(); 
var bt92=ny92-(tBox.height/2+10);
var bb92=ny92+(tBox.height/2+10);
var bl92=nx92-(tBox.width/2+10);
var br92=nx92+(tBox.width/2+10);
var b92=paper.rect(bl92, bt92, br92-bl92, bb92-bt92, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx93=281;
var ny93=1336;
var t=paper.text(nx93,ny93,'Sound').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.450.C.1#Sound"});
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

var nx94=1074;
var ny94=1018;
var t=paper.text(nx94,ny94,"Newton's 1st Law:\nIntertia").attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.212.C.1#Newton's 1st Law: Intertia"});
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

var nx95=2844;
var ny95=1853;
var t=paper.text(nx95,ny95,'Nuclear Structure').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.950.C.1#Nuclear Structure"});
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

var nx96=779;
var ny96=992;
var t=paper.text(nx96,ny96,'Rotational Mechanics').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.310.C.1#Rotational Mechanics"});
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

var nx97=695;
var ny97=1103;
var t=paper.text(nx97,ny97,'The Law of Gravity').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.PHY.320.C.1#The Law of Gravity"});
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

bb98=1949
bt98=1949
bl98=1441
br98=1441
nx98=1441
ny98=1949

bb99=1847
bt99=1847
bl99=2106
br99=2106
nx99=2106
ny99=1847

bb100=1472
bt100=1472
bl100=1673
br100=1673
nx100=1673
ny100=1472

bb101=1083
bt101=1083
bl101=1244
br101=1244
nx101=1244
ny101=1083

bb102=1846
bt102=1846
bl102=1813
br102=1813
nx102=1813
ny102=1846

bb103=903
bt103=903
bl103=437
br103=437
nx103=437
ny103=903

bb104=1853
bt104=1853
bl104=2671
br104=2671
nx104=2671
ny104=1853

bb105=571
bt105=571
bl105=1531
br105=1531
nx105=1531
ny105=571

bb106=2038
bt106=2038
bl106=1230
br106=1230
nx106=1230
ny106=2038

s='M '+nx0+' '+bb0+' L '+nx0+' '+bt65; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx1+' '+bb1+' L '+nx1+' '+bt67; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb3+(bt0-bb3)/2; 
s='M '+1155+' '+mid+' L '+1308+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx3+' '+bb3+' L '+nx3+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx53+' '+mid+' L '+nx53+' '+bt53;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx0+' '+mid+' L '+nx0+' '+bt0;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb5+(bt94-bb5)/2; 
s='M '+1074+' '+mid+' L '+1418+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx5+' '+bb5+' L '+nx5+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx94+' '+mid+' L '+nx94+' '+bt94;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx77+' '+mid+' L '+nx77+' '+bt77;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx24+' '+mid+' L '+nx24+' '+bt24;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx6+' '+bb6+' L '+nx6+' '+bt16; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx7+' '+bb7+' L '+nx7+' '+bt5; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx8+' '+bb8+' L '+nx8+' '+bt38; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx9+' '+bb9+' L '+nx9+' '+bt14; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx12+' '+bb12+' L '+nx12+' '+bt63; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx14+' '+bb14+' L '+nx14+' '+bt13; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br15+' '+571+' L '+1531+' '+571; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx16+' '+bb16+' L '+nx16+' '+bt29; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx17+' '+bb17+' L '+nx17+' '+bt18; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx18+' '+bb18+' L '+nx18+' '+bt89; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx20+' '+bb20+' L '+nx20+' '+bt11; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+437+' '+903+' L '+bl21+' '+903; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx23+' '+bb23+' L '+nx23+' '+bt34; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1531+' '+571+' L '+bl23+' '+571; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx24+' '+bb24+' L '+nx24+' '+1083; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1244-1244,1,0,0); 
h.translate(1244,1083); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1244+' '+1083+' L '+1244+' '+1083; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb25+(bt17-bb25)/2; 
s='M '+779+' '+mid+' L '+1527+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx25+' '+bb25+' L '+nx25+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx49+' '+mid+' L '+nx49+' '+bt49;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx17+' '+mid+' L '+nx17+' '+bt17;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb27+(bt43-bb27)/2; 
s='M '+1810+' '+mid+' L '+2175+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx27+' '+bb27+' L '+nx27+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx43+' '+mid+' L '+nx43+' '+bt43;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx83+' '+mid+' L '+nx83+' '+bt83;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx28+' '+bb28+' L '+nx28+' '+bt48; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1441+' '+1949+' L '+bl29+' '+1949; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx30+' '+bb30+' L '+nx30+' '+bt81; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br30+' '+903+' L '+437+' '+903; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx32+' '+bb32+' L '+nx32+' '+bt9; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx33+' '+bb33+' L '+nx33+' '+bt47; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb34+(bt36-bb34)/2; 
s='M '+1558+' '+mid+' L '+1762+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx34+' '+bb34+' L '+nx34+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx55+' '+mid+' L '+nx55+' '+bt55;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx36+' '+mid+' L '+nx36+' '+bt36;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx35+' '+bb35+' L '+nx35+' '+bt31; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1813+' '+1846+' L '+bl35+' '+1846; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1673+' '+1472+' L '+bl36+' '+1472; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx37+' '+bb37+' L '+nx37+' '+bt92; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx38+' '+bb38+' L '+nx38+' '+bt25; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb40+(bt60-bb40)/2; 
s='M '+438+' '+mid+' L '+893+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx40+' '+bb40+' L '+nx40+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx82+' '+mid+' L '+nx82+' '+bt82;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx70+' '+mid+' L '+nx70+' '+bt70;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx39+' '+mid+' L '+nx39+' '+bt39;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx19+' '+mid+' L '+nx19+' '+bt19;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx60+' '+mid+' L '+nx60+' '+bt60;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1230+' '+2038+' L '+bl41+' '+2038; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb43+(bt35-bb43)/2; 
s='M '+1700+' '+mid+' L '+1919+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx43+' '+bb43+' L '+nx43+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx80+' '+mid+' L '+nx80+' '+bt80;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx35+' '+mid+' L '+nx35+' '+bt35;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx46+' '+bb46+' L '+nx46+' '+bt56; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb49+(bt23-bb49)/2; 
s='M '+1369+' '+mid+' L '+1675+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx49+' '+bb49+' L '+nx49+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx15+' '+mid+' L '+nx15+' '+bt15;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx23+' '+mid+' L '+nx23+' '+bt23;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx50+' '+bb50+' L '+nx50+' '+bt69; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx52+' '+bb52+' L '+nx52+' '+bt84; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx53+' '+bb53+' L '+nx53+' '+bt41; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br53+' '+1949+' L '+1441+' '+1949; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br55+' '+1472+' L '+1673+' '+1472; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx58+' '+bb58+' L '+nx58+' '+bt3; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx60+' '+bb60+' L '+nx60+' '+bt45; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb62+(bt58-bb62)/2; 
s='M '+1232+' '+mid+' L '+1565+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx62+' '+bb62+' L '+nx62+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx58+' '+mid+' L '+nx58+' '+bt58;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx6+' '+mid+' L '+nx6+' '+bt6;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br65+' '+2038+' L '+1230+' '+2038; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx67+' '+bb67+' L '+nx67+' '+bt20; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb69+(bt88-bb69)/2; 
s='M '+623+' '+mid+' L '+914+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx69+' '+bb69+' L '+nx69+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx88+' '+mid+' L '+nx88+' '+bt88;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx32+' '+mid+' L '+nx32+' '+bt32;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx71+' '+bb71+' L '+nx71+' '+bt44; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br71+' '+1853+' L '+2671+' '+1853; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx73+' '+bb73+' L '+nx73+' '+bt68; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2106+' '+1847+' L '+bl74+' '+1847; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb75+(bt90-bb75)/2; 
s='M '+2382+' '+mid+' L '+2654+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx75+' '+bb75+' L '+nx75+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx59+' '+mid+' L '+nx59+' '+bt59;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx4+' '+mid+' L '+nx4+' '+bt4;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx90+' '+mid+' L '+nx90+' '+bt90;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx77+' '+bb77+' L '+nx77+' '+1083; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1418-1244,1,0,0); 
h.translate(1244,1083); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1244+' '+1083+' L '+1418+' '+1083; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br78+' '+1847+' L '+2106+' '+1847; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb79+(bt30-bb79)/2; 
s='M '+307+' '+mid+' L '+554+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx79+' '+bb79+' L '+nx79+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx21+' '+mid+' L '+nx21+' '+bt21;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx30+' '+mid+' L '+nx30+' '+bt30;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx80+' '+bb80+' L '+nx80+' '+bt2; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br80+' '+1846+' L '+1813+' '+1846; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb83+(bt86-bb83)/2; 
s='M '+2035+' '+mid+' L '+2290+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx83+' '+bb83+' L '+nx83+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx74+' '+mid+' L '+nx74+' '+bt74;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx78+' '+mid+' L '+nx78+' '+bt78;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx86+' '+mid+' L '+nx86+' '+bt86;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx84+' '+bb84+' L '+nx84+' '+bt96; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb85+(bt93-bb85)/2; 
s='M '+281+' '+mid+' L '+662+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx85+' '+bb85+' L '+nx85+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx93+' '+mid+' L '+nx93+' '+bt93;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx40+' '+mid+' L '+nx40+' '+bt40;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb88+(bt22-bb88)/2; 
s='M '+801+' '+mid+' L '+1028+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx88+' '+bb88+' L '+nx88+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx10+' '+mid+' L '+nx10+' '+bt10;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx22+' '+mid+' L '+nx22+' '+bt22;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx61+' '+mid+' L '+nx61+' '+bt61;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb89+(bt79-bb89)/2; 
s='M '+435+' '+mid+' L '+1244+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx89+' '+bb89+' L '+nx89+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx7+' '+mid+' L '+nx7+' '+bt7;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx52+' '+mid+' L '+nx52+' '+bt52;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx79+' '+mid+' L '+nx79+' '+bt79;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb90+(bt95-bb90)/2; 
s='M '+2498+' '+mid+' L '+2844+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx90+' '+bb90+' L '+nx90+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx71+' '+mid+' L '+nx71+' '+bt71;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx95+' '+mid+' L '+nx95+' '+bt95;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx91+' '+bb91+' L '+nx91+' '+bt50; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx92+' '+bb92+' L '+nx92+' '+bt85; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb93+(bt54-bb93)/2; 
s='M '+200+' '+mid+' L '+438+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx93+' '+bb93+' L '+nx93+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx26+' '+mid+' L '+nx26+' '+bt26;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx54+' '+mid+' L '+nx54+' '+bt54;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx60+' '+mid+' L '+nx60+' '+bt60;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx94+' '+bb94+' L '+nx94+' '+1083; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1244-1074,1,0,0); 
h.translate(1074,1083); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1074+' '+1083+' L '+1244+' '+1083; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx95+' '+bb95+' L '+nx95+' '+bt42; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2671+' '+1853+' L '+bl95+' '+1853; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb96+(bt33-bb96)/2; 
s='M '+695+' '+mid+' L '+871+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx96+' '+bb96+' L '+nx96+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx97+' '+mid+' L '+nx97+' '+bt97;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx33+' '+mid+' L '+nx33+' '+bt33;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx97+' '+bb97+' L '+nx97+' '+bt57; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx98+' '+bb98+' L '+nx98+' '+bt12; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx99+' '+bb99+' L '+nx99+' '+bt1; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb55+(bt27-bb55)/2; 
s='M '+764+' '+mid+' L '+2524+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx100+' '+bb100+' L '+nx100+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx91+' '+mid+' L '+nx91+' '+bt91;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx75+' '+mid+' L '+nx75+' '+bt75;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx62+' '+mid+' L '+nx62+' '+bt62;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx27+' '+mid+' L '+nx27+' '+bt27;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb101+(bt28-bb101)/2; 
s='M '+1092+' '+mid+' L '+1675+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx101+' '+bb101+' L '+nx101+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx73+' '+mid+' L '+nx73+' '+bt73;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx72+' '+mid+' L '+nx72+' '+bt72;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx28+' '+mid+' L '+nx28+' '+bt28;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx34+' '+mid+' L '+nx34+' '+bt34;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx102+' '+bb102+' L '+nx102+' '+bt66; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx103+' '+bb103+' L '+nx103+' '+bt37; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb104+(bt76-bb104)/2; 
s='M '+2615+' '+mid+' L '+2728+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx104+' '+bb104+' L '+nx104+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx51+' '+mid+' L '+nx51+' '+bt51;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx76+' '+mid+' L '+nx76+' '+bt76;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb105+(bt64-bb105)/2; 
s='M '+1450+' '+mid+' L '+1584+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx105+' '+bb105+' L '+nx105+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx87+' '+mid+' L '+nx87+' '+bt87;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx64+' '+mid+' L '+nx64+' '+bt64;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx106+' '+bb106+' L '+nx106+' '+bt46; 
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