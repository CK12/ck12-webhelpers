window.onload = function() { 

mapWidth = 3747; 
mapHeight = 3659; 

boxWidth = 900; 
boxHeight = 600; 
aspectRatio = boxWidth/boxHeight; 
zoomFactor = 5; 

var paper = Raphael(document.getElementById('holder'), 900, 600); 

canvasWidth = boxWidth; 
canvasHeight = boxHeight; 

rootx = 1327; 
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
var nx0=841;
var ny0=1992;
var t=paper.text(nx0,ny0,'Protein Synthesis').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.228.C.1#Protein Synthesis"});
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

var nx1=3042;
var ny1=3462;
var t=paper.text(nx1,ny1,'Male Reproductive\nSystem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.927.C.1#Male Reproductive System"});
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

var nx2=1923;
var ny2=2485;
var t=paper.text(nx2,ny2,'Plant Adaptations and\nResponses').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.581.C.1#Plant Adaptations and Responses"});
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

var nx3=1826;
var ny3=2255;
var t=paper.text(nx3,ny3,'Plant Tissues and\nGrowth').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.553.C.1#Plant Tissues and Growth"});
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

var nx4=1395;
var ny4=1266;
var t=paper.text(nx4,ny4,'Earth Forms and Life\nBegins').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.290.C.1#Earth Forms and Life Begins"});
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

var nx5=2084;
var ny5=3462;
var t=paper.text(nx5,ny5,'The Respiratory\nSystem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.836.C.1#The Respiratory System"});
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

var nx6=923;
var ny6=1470;
var t=paper.text(nx6,ny6,'Gregor Mendel and\nGenetics').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt6=ny6-(tBox.height/2+10);
var bb6=ny6+(tBox.height/2+10);
var bl6=nx6-(tBox.width/2+10);
var br6=nx6+(tBox.width/2+10);
var b6=paper.rect(bl6, bt6, br6-bl6, bb6-bt6, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx7=1674;
var ny7=538;
var t=paper.text(nx7,ny7,'The Principles of\nEcology').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt7=ny7-(tBox.height/2+10);
var bb7=ny7+(tBox.height/2+10);
var bl7=nx7-(tBox.width/2+10);
var br7=nx7+(tBox.width/2+10);
var b7=paper.rect(bl7, bt7, br7-bl7, bb7-bt7, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx8=923;
var ny8=1571;
var t=paper.text(nx8,ny8,"Mendel's Investigations").attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.188.C.1#Mendel's Investigations"});
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

var nx9=2219;
var ny9=3463;
var t=paper.text(nx9,ny9,'The Digestive\nSystem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.849.C.1#The Digestive System"});
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

var nx10=369;
var ny10=1153;
var t=paper.text(nx10,ny10,'Photosynthesis and Cellular\nRespiration').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt10=ny10-(tBox.height/2+10);
var bb10=ny10+(tBox.height/2+10);
var bl10=nx10-(tBox.width/2+10);
var br10=nx10+(tBox.width/2+10);
var b10=paper.rect(bl10, bt10, br10-bl10, bb10-bt10, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx11=1395;
var ny11=1379;
var t=paper.text(nx11,ny11,'The Evolution of Multicellular\nLife').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.304.C.1#The Evolution of Multicellular Life"});
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

var nx12=1742;
var ny12=3342;
var t=paper.text(nx12,ny12,'The Nervous and Endocrine\nSystems').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt12=ny12-(tBox.height/2+10);
var bb12=ny12+(tBox.height/2+10);
var bl12=nx12-(tBox.width/2+10);
var br12=nx12+(tBox.width/2+10);
var b12=paper.rect(bl12, bt12, br12-bl12, bb12-bt12, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx13=1739;
var ny13=2484;
var t=paper.text(nx13,ny13,'Variation in Plant Life\nCycles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.575.C.1#Variation in Plant Life Cycles"});
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

var nx14=2507;
var ny14=3454;
var t=paper.text(nx14,ny14,'Nonspecific Disease').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.882.C.1#Nonspecific Disease"});
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

var nx15=920;
var ny15=644;
var t=paper.text(nx15,ny15,'Biochemical Reactions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.055.C.1#Biochemical Reactions"});
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

var nx16=1034;
var ny16=1373;
var t=paper.text(nx16,ny16,'Reproduction and\nMeiosis').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.175.C.1#Reproduction and Meiosis"});
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

var nx17=1840;
var ny17=2019;
var t=paper.text(nx17,ny17,'Plant Evolution and\nClassification').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt17=ny17-(tBox.height/2+10);
var bb17=ny17+(tBox.height/2+10);
var bl17=nx17-(tBox.width/2+10);
var br17=nx17+(tBox.width/2+10);
var b17=paper.rect(bl17, bt17, br17-bl17, bb17-bt17, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx18=922;
var ny18=1263;
var t=paper.text(nx18,ny18,'Cell Division and the\nCell Cycle').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.155.C.1#Cell Division and the Cell Cycle"});
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

var nx19=1964;
var ny19=2137;
var t=paper.text(nx19,ny19,'Plant Biology').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt19=ny19-(tBox.height/2+10);
var bb19=ny19+(tBox.height/2+10);
var bl19=nx19-(tBox.width/2+10);
var br19=nx19+(tBox.width/2+10);
var b19=paper.rect(bl19, bt19, br19-bl19, bb19-bt19, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx20=1304;
var ny20=2131;
var t=paper.text(nx20,ny20,'Microevolution and the\nGenetics of Populations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.XXX.C.1#Microevolution and the Genetics of Populations"});
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

var nx21=1762;
var ny21=1097;
var t=paper.text(nx21,ny21,'Human Population\nGrowth').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.433.C.1#Human Population Growth"});
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

var nx22=1397;
var ny22=1153;
var t=paper.text(nx22,ny22,'Life: From the First\nOrganism Onward').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt22=ny22-(tBox.height/2+10);
var bb22=ny22+(tBox.height/2+10);
var bl22=nx22-(tBox.width/2+10);
var br22=nx22+(tBox.width/2+10);
var b22=paper.rect(bl22, bt22, br22-bl22, bb22-bt22, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx23=995;
var ny23=1991;
var t=paper.text(nx23,ny23,'Mutation').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.236.C.1#Mutation"});
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

var nx24=2675;
var ny24=3454;
var t=paper.text(nx24,ny24,'The Immune Response').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.890.C.1#The Immune Response"});
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

var nx25=839;
var ny25=2324;
var t=paper.text(nx25,ny25,'Human Chromosomes\nand Genes').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.255.C.1#Human Chromosomes and Genes"});
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

var nx26=1670;
var ny26=1845;
var t=paper.text(nx26,ny26,'Protists, Fungi, and\nHuman Disease').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.523.C.1#Protists, Fungi, and Human Disease"});
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

var nx27=1711;
var ny27=2141;
var t=paper.text(nx27,ny27,'Four Types of Modern\nPlants').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.530.C.1#Four Types of Modern Plants"});
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

var nx28=1378;
var ny28=1619;
var t=paper.text(nx28,ny28,'Prokaryotes').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.470.C.1#Prokaryotes"});
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

var nx29=1304;
var ny29=2018;
var t=paper.text(nx29,ny29,'Darwin and the Theory\nof Evolution').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.319.C.1#Darwin and the Theory of Evolution"});
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

var nx30=923;
var ny30=1894;
var t=paper.text(nx30,ny30,'DNA and RNA').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.220.C.1#DNA and RNA"});
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

var nx31=2084;
var ny31=2973;
var t=paper.text(nx31,ny31,'Amphibians').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.672.C.1#Amphibians"});
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

var nx32=2142;
var ny32=2764;
var t=paper.text(nx32,ny32,'From Fishes to Birds').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt32=ny32-(tBox.height/2+10);
var bb32=ny32+(tBox.height/2+10);
var bl32=nx32-(tBox.width/2+10);
var br32=nx32+(tBox.width/2+10);
var b32=paper.rect(bl32, bt32, br32-bl32, bb32-bt32, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx33=2142;
var ny33=2467;
var t=paper.text(nx33,ny33,'Mollusks and Annelids').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.610.C.1#Mollusks and Annelids"});
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

var nx34=1575;
var ny34=656;
var t=paper.text(nx34,ny34,'The Science of\nEcology').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.361.C.1#The Science of Ecology"});
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

var nx35=792;
var ny35=1371;
var t=paper.text(nx35,ny35,'Chromosomes and Mitosis').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.164.C.1#Chromosomes and Mitosis"});
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

var nx36=1572;
var ny36=1743;
var t=paper.text(nx36,ny36,'Types of Protists').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.503.C.1#Types of Protists"});
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

var nx37=1327;
var ny37=288;
var t=paper.text(nx37,ny37,'Science and the Natural\nWorld').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.001.C.1#Science and the Natural World"});
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

var nx38=839;
var ny38=2214;
var t=paper.text(nx38,ny38,'Human Genetics and\nBiotechnology').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt38=ny38-(tBox.height/2+10);
var bb38=ny38+(tBox.height/2+10);
var bl38=nx38-(tBox.width/2+10);
var br38=nx38+(tBox.width/2+10);
var b38=paper.rect(bl38, bt38, br38-bl38, bb38-bt38, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx39=1327;
var ny39=100;
var t=paper.text(nx39,ny39,'Biology').attr({fill:"white","font-size": 24});
var tBox=t.getBBox(); 
var bt39=ny39-(tBox.height/2+10);
var bb39=ny39+(tBox.height/2+10);
var bl39=nx39-(tBox.width/2+10);
var br39=nx39+(tBox.width/2+10);
var b39=paper.rect(bl39, bt39, br39-bl39, bb39-bt39, 10).attr({stroke:"#7cbf00","stroke-width": "4"});

var nx40=923;
var ny40=1671;
var t=paper.text(nx40,ny40,'Mendelian Inheritance').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.203.C.1#Mendelian Inheritance"});
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

var nx41=2859;
var ny41=3462;
var t=paper.text(nx41,ny41,'Environmental Problems\nand Human Health').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.917.C.1#Environmental Problems and Human Health"});
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

var nx42=923;
var ny42=1785;
var t=paper.text(nx42,ny42,'Molecular Genetics: From\nRNA to Proteins').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.219.C.1#Molecular Genetics: From RNA to Proteins"});
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

var nx43=2675;
var ny43=3342;
var t=paper.text(nx43,ny43,'The Immune System\nand Disease').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt43=ny43-(tBox.height/2+10);
var bb43=ny43+(tBox.height/2+10);
var bl43=nx43-(tBox.width/2+10);
var br43=nx43+(tBox.width/2+10);
var b43=paper.rect(bl43, bt43, br43-bl43, bb43-bt43, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx44=1778;
var ny44=654;
var t=paper.text(nx44,ny44,'Recycling Matter').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.378.C.1#Recycling Matter"});
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

var nx45=1510;
var ny45=1504;
var t=paper.text(nx45,ny45,'Microorganisms: Prokaryotes\nand Viruses').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt45=ny45-(tBox.height/2+10);
var bb45=ny45+(tBox.height/2+10);
var bl45=nx45-(tBox.width/2+10);
var br45=nx45+(tBox.width/2+10);
var b45=paper.rect(bl45, bt45, br45-bl45, bb45-bt45, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx46=742;
var ny46=650;
var t=paper.text(nx46,ny46,'Matter and Organic\nCompounds').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.035.C.1#Matter and Organic Compounds"});
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

var nx47=3207;
var ny47=3462;
var t=paper.text(nx47,ny47,'Female Reproductive\nSystem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.942.C.1#Female Reproductive System"});
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

var nx48=1826;
var ny48=2357;
var t=paper.text(nx48,ny48,'Plant Organs: Roots,\nStems, and Leaves').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.562.C.1#Plant Organs: Roots, Stems, and Leaves"});
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

var nx49=1125;
var ny49=2130;
var t=paper.text(nx49,ny49,'Evidence for Evolution').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.331.C.1#Evidence for Evolution"});
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

var nx50=2142;
var ny50=2361;
var t=paper.text(nx50,ny50,'Sponges, Cnidarians, Flatworms\nand Roundworms').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.592.C.1#Sponges, Cnidarians, Flatworms and Roundworms"});
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

var nx51=841;
var ny51=2099;
var t=paper.text(nx51,ny51,'Regulation of Gene\nExpression').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.245.C.1#Regulation of Gene Expression"});
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

var nx52=920;
var ny52=892;
var t=paper.text(nx52,ny52,'Cell Structures').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.078.C.1#Cell Structures"});
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

var nx53=1446;
var ny53=3462;
var t=paper.text(nx53,ny53,'Overview of Animal\nBehavior').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.761.C.1#Overview of Animal Behavior"});
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

var nx54=2150;
var ny54=3341;
var t=paper.text(nx54,ny54,'The Circulatory, Respiratory,\nDigestive, and Excretory Systems').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt54=ny54-(tBox.height/2+10);
var bb54=ny54+(tBox.height/2+10);
var bl54=nx54-(tBox.width/2+10);
var br54=nx54+(tBox.width/2+10);
var b54=paper.rect(bl54, bt54, br54-bl54, bb54-bt54, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx55=552;
var ny55=1391;
var t=paper.text(nx55,ny55,'Anerobic Respiration').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.147.C.1#Anerobic Respiration"});
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

var nx56=1672;
var ny56=1209;
var t=paper.text(nx56,ny56,'The Biodiversity Crisis').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.441.C.1#The Biodiversity Crisis"});
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

var nx57=920;
var ny57=993;
var t=paper.text(nx57,ny57,'Cell Transport and\nHomeostasis').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.102.C.1#Cell Transport and Homeostasis"});
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

var nx58=2330;
var ny58=2972;
var t=paper.text(nx58,ny58,'Birds').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.703.C.1#Birds"});
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

var nx59=1668;
var ny59=1625;
var t=paper.text(nx59,ny59,'Eukaryotes: Protists\nand Fungi').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt59=ny59-(tBox.height/2+10);
var bb59=ny59+(tBox.height/2+10);
var bl59=nx59-(tBox.width/2+10);
var br59=nx59+(tBox.width/2+10);
var b59=paper.rect(bl59, bt59, br59-bl59, bb59-bt59, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx60=1304;
var ny60=1903;
var t=paper.text(nx60,ny60,'The Theory of Evolution').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.318.C.1#The Theory of Evolution"});
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

var nx61=1674;
var ny61=744;
var t=paper.text(nx61,ny61,'Biomes').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.387.C.1#Biomes"});
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

var nx62=1510;
var ny62=1619;
var t=paper.text(nx62,ny62,'Viruses').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.490.C.1#Viruses"});
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

var nx63=2142;
var ny63=2857;
var t=paper.text(nx63,ny63,'Overview of Vertebrates').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.643.C.1#Overview of Vertebrates"});
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

var nx64=920;
var ny64=794;
var t=paper.text(nx64,ny64,'Cellular Structure and\nFunction').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt64=ny64-(tBox.height/2+10);
var bb64=ny64+(tBox.height/2+10);
var bl64=nx64-(tBox.width/2+10);
var br64=nx64+(tBox.width/2+10);
var b64=paper.rect(bl64, bt64, br64-bl64, bb64-bt64, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx65=1964;
var ny65=2973;
var t=paper.text(nx65,ny65,'Fish').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.653.C.1#Fish"});
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

var nx66=2208;
var ny66=2973;
var t=paper.text(nx66,ny66,'Reptiles').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.687.C.1#Reptiles"});
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

var nx67=1674;
var ny67=851;
var t=paper.text(nx67,ny67,'Communities and\nPopulations').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt67=ny67-(tBox.height/2+10);
var bb67=ny67+(tBox.height/2+10);
var bl67=nx67-(tBox.width/2+10);
var br67=nx67+(tBox.width/2+10);
var b67=paper.rect(bl67, bt67, br67-bl67, bb67-bt67, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx68=2142;
var ny68=2665;
var t=paper.text(nx68,ny68,'Enchinoderms and Invertebrate\nChordates').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.XXX.C.1#Enchinoderms and Invertebrate Chordates"});
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

var nx69=2347;
var ny69=3463;
var t=paper.text(nx69,ny69,'The Excretory\nSystem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.873.C.1#The Excretory System"});
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

var nx70=1174;
var ny70=3334;
var t=paper.text(nx70,ny70,'Reproduction in Mammals').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.734.C.1#Reproduction in Mammals"});
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

var nx71=1661;
var ny71=3453;
var t=paper.text(nx71,ny71,'The Nervous System').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.779.C.1#The Nervous System"});
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

var nx72=1576;
var ny72=978;
var t=paper.text(nx72,ny72,'Community Interactions').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.403.C.1#Community Interactions"});
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

var nx73=3547;
var ny73=3461;
var t=paper.text(nx73,ny73,'Sexually Transmitted\nInfections').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.987.C.1#Sexually Transmitted Infections"});
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

var nx74=1813;
var ny74=3460;
var t=paper.text(nx74,ny74,'The Endocrine\nSystem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.803.C.1#The Endocrine System"});
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

var nx75=905;
var ny75=2431;
var t=paper.text(nx75,ny75,'Biotechnology').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.279.C.1#Biotechnology"});
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

var nx76=2150;
var ny76=3215;
var t=paper.text(nx76,ny76,'Mammalian Traits').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.723.C.1#Mammalian Traits"});
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

var nx77=1767;
var ny77=1743;
var t=paper.text(nx77,ny77,'Ecology of Fungi').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.515.C.1#Ecology of Fungi"});
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

var nx78=3377;
var ny78=3461;
var t=paper.text(nx78,ny78,'From Fertilization to\nOld Age').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.962.C.1#From Fertilization to Old Age"});
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

var nx79=1488;
var ny79=2132;
var t=paper.text(nx79,ny79,'Macroevolution and the\nOrigin of Species').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.XXX.C.1#Macroevolution and the Origin of Species"});
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

var nx80=369;
var ny80=1284;
var t=paper.text(nx80,ny80,'Photosynthesis: Sugar\nas Food').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.125.C.1#Photosynthesis: Sugar as Food"});
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

var nx81=1446;
var ny81=3342;
var t=paper.text(nx81,ny81,'Evolution and Classification\nof Mammals').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.746.C.1#Evolution and Classification of Mammals"});
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

var nx82=2142;
var ny82=2255;
var t=paper.text(nx82,ny82,'From Sponges to\nInvertebrate Chordates').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt82=ny82-(tBox.height/2+10);
var bb82=ny82+(tBox.height/2+10);
var bl82=nx82-(tBox.width/2+10);
var br82=nx82+(tBox.width/2+10);
var b82=paper.rect(bl82, bt82, br82-bl82, bb82-bt82, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx83=3291;
var ny83=3341;
var t=paper.text(nx83,ny83,'Reproduction and\nHuman Development').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt83=ny83-(tBox.height/2+10);
var bb83=ny83+(tBox.height/2+10);
var bl83=nx83-(tBox.width/2+10);
var br83=nx83+(tBox.width/2+10);
var b83=paper.rect(bl83, bt83, br83-bl83, bb83-bt83, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx84=1861;
var ny84=1216;
var t=paper.text(nx84,ny84,'Natural Resources and\nClimate Change').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.453.C.1#Natural Resources and Climate Change"});
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

var nx85=920;
var ny85=531;
var t=paper.text(nx85,ny85,'The Chemistry of Life').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt85=ny85-(tBox.height/2+10);
var bb85=ny85+(tBox.height/2+10);
var bl85=nx85-(tBox.width/2+10);
var br85=nx85+(tBox.width/2+10);
var b85=paper.rect(bl85, bt85, br85-bl85, bb85-bt85, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx86=1762;
var ny86=987;
var t=paper.text(nx86,ny86,'Characteristics of\nPopulations').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.420.C.1#Characteristics of Populations"});
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

var nx87=1304;
var ny87=1498;
var t=paper.text(nx87,ny87,'Classification').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.313.C.1#Classification"});
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

var nx88=1327;
var ny88=189;
var t=paper.text(nx88,ny88,'What is Biology?').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt88=ny88-(tBox.height/2+10);
var bb88=ny88+(tBox.height/2+10);
var bl88=nx88-(tBox.width/2+10);
var br88=nx88+(tBox.width/2+10);
var b88=paper.rect(bl88, bt88, br88-bl88, bb88-bt88, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx89=920;
var ny89=1153;
var t=paper.text(nx89,ny89,'The Cell Cycle, Mitosis\nand Meiosis').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt89=ny89-(tBox.height/2+10);
var bb89=ny89+(tBox.height/2+10);
var bl89=nx89-(tBox.width/2+10);
var br89=nx89+(tBox.width/2+10);
var b89=paper.rect(bl89, bt89, br89-bl89, bb89-bt89, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx90=552;
var ny90=1285;
var t=paper.text(nx90,ny90,'Powering the Cell:\nCellular Respiration').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.133.C.1#Powering the Cell: Cellular Respiration"});
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

var nx91=2150;
var ny91=3112;
var t=paper.text(nx91,ny91,'Mammals and Animal\nBehavior').attr({fill:"#bf5600","font-size": 14});
var tBox=t.getBBox(); 
var bt91=ny91-(tBox.height/2+10);
var bb91=ny91+(tBox.height/2+10);
var bl91=nx91-(tBox.width/2+10);
var br91=nx91+(tBox.width/2+10);
var b91=paper.rect(bl91, bt91, br91-bl91, bb91-bt91, 10).attr({stroke:"#bf5600","stroke-width": "2"});

var nx92=2675;
var ny92=3559;
var t=paper.text(nx92,ny92,'Immune System\nDiseases').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.908.C.1#Immune System Diseases"});
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

var nx93=760;
var ny93=2431;
var t=paper.text(nx93,ny93,'Human Inheritance').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.264.C.1#Human Inheritance"});
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

var nx94=2142;
var ny94=2563;
var t=paper.text(nx94,ny94,'Anthropods and Insects').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.620.C.1#Anthropods and Insects"});
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

var nx95=1099;
var ny95=638;
var t=paper.text(nx95,ny95,'Water, Acids, Bases').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.XXX.C.1#Water, Acids, Bases"});
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

var nx96=1327;
var ny96=403;
var t=paper.text(nx96,ny96,'Biology: The Study of\nLife').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.012.C.1#Biology: The Study of Life"});
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

var nx97=1947;
var ny97=3461;
var t=paper.text(nx97,ny97,'The Circulatory\nSystem').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.819.C.1#The Circulatory System"});
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

var nx98=200;
var ny98=1279;
var t=paper.text(nx98,ny98,'Energy for Life').attr({fill:"white", cursor: "pointer", "font-size": 14});
t.mouseover(function (event) { 
    this.attr({fill: "#6D7B8D", cursor: "pointer", href: "/concept/SCI.BIO.113.C.1#Energy for Life"});
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

bb99=714
bt99=714
bl99=920
br99=920
nx99=920
ny99=714

bb100=3038
bt100=3038
bl100=2150
br100=2150
nx100=2150
ny100=3038

bb101=655
bt101=655
bl101=1674
br101=1674
nx101=1674
ny101=655

bb102=1744
bt102=1744
bl102=1670
br102=1670
nx102=1670
ny102=1744

bb103=1372
bt103=1372
bl103=923
br103=923
nx103=923
ny103=1372

s='M '+nx0+' '+bb0+' L '+nx0+' '+bt51; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx3+' '+bb3+' L '+nx3+' '+bt48; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx4+' '+bb4+' L '+nx4+' '+bt11; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx6+' '+bb6+' L '+nx6+' '+bt8; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb7+(bt44-bb7)/2; 
s='M '+1575+' '+mid+' L '+1778+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx7+' '+bb7+' L '+nx7+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx44+' '+mid+' L '+nx44+' '+bt44;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx34+' '+mid+' L '+nx34+' '+bt34;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx8+' '+bb8+' L '+nx8+' '+bt40; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb10+(bt98-bb10)/2; 
s='M '+200+' '+mid+' L '+552+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx10+' '+bb10+' L '+nx10+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx80+' '+mid+' L '+nx80+' '+bt80;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx98+' '+mid+' L '+nx98+' '+bt98;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx90+' '+mid+' L '+nx90+' '+bt90;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb11+(bt87-bb11)/2; 
s='M '+1304+' '+mid+' L '+1510+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx11+' '+bb11+' L '+nx11+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx45+' '+mid+' L '+nx45+' '+bt45;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx87+' '+mid+' L '+nx87+' '+bt87;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb12+(bt71-bb12)/2; 
s='M '+1661+' '+mid+' L '+1813+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx12+' '+bb12+' L '+nx12+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx71+' '+mid+' L '+nx71+' '+bt71;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx74+' '+mid+' L '+nx74+' '+bt74;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx15+' '+bb15+' L '+nx15+' '+714; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(920-920,1,0,0); 
h.translate(920,714); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+920+' '+714+' L '+920+' '+714; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+923+' '+1372+' L '+bl16+' '+1372; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb17+(bt19-bb17)/2; 
s='M '+1711+' '+mid+' L '+1964+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx17+' '+bb17+' L '+nx17+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx27+' '+mid+' L '+nx27+' '+bt27;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx19+' '+mid+' L '+nx19+' '+bt19;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb18+(bt35-bb18)/2; 
s='M '+792+' '+mid+' L '+1034+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx18+' '+bb18+' L '+nx18+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx16+' '+mid+' L '+nx16+' '+bt16;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx35+' '+mid+' L '+nx35+' '+bt35;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb19+(bt3-bb19)/2; 
s='M '+1826+' '+mid+' L '+2142+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx19+' '+bb19+' L '+nx19+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx82+' '+mid+' L '+nx82+' '+bt82;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx3+' '+mid+' L '+nx3+' '+bt3;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb21+(bt56-bb21)/2; 
s='M '+1672+' '+mid+' L '+1861+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx21+' '+bb21+' L '+nx21+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx84+' '+mid+' L '+nx84+' '+bt84;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx56+' '+mid+' L '+nx56+' '+bt56;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx22+' '+bb22+' L '+nx22+' '+bt4; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx24+' '+bb24+' L '+nx24+' '+bt92; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb25+(bt75-bb25)/2; 
s='M '+760+' '+mid+' L '+905+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx25+' '+bb25+' L '+nx25+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx93+' '+mid+' L '+nx93+' '+bt93;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx75+' '+mid+' L '+nx75+' '+bt75;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb29+(bt49-bb29)/2; 
s='M '+1125+' '+mid+' L '+1488+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx29+' '+bb29+' L '+nx29+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx49+' '+mid+' L '+nx49+' '+bt49;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx79+' '+mid+' L '+nx79+' '+bt79;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx20+' '+mid+' L '+nx20+' '+bt20;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb30+(bt23-bb30)/2; 
s='M '+841+' '+mid+' L '+995+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx30+' '+bb30+' L '+nx30+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx23+' '+mid+' L '+nx23+' '+bt23;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx0+' '+mid+' L '+nx0+' '+bt0;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx31+' '+bb31+' L '+nx31+' '+3038; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(2150-2084,1,0,0); 
h.translate(2084,3038); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2084+' '+3038+' L '+2150+' '+3038; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx32+' '+bb32+' L '+nx32+' '+bt63; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx33+' '+bb33+' L '+nx33+' '+bt94; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br34+' '+655+' L '+1674+' '+655; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br35+' '+1372+' L '+923+' '+1372; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+br36+' '+1744+' L '+1670+' '+1744; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx37+' '+bb37+' L '+nx37+' '+bt96; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx38+' '+bb38+' L '+nx38+' '+bt25; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx39+' '+bb39+' L '+nx39+' '+bt88; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx40+' '+bb40+' L '+nx40+' '+bt42; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb42+(bt30-bb42)/2; 
s='M '+923+' '+mid+' L '+1304+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx42+' '+bb42+' L '+nx42+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx60+' '+mid+' L '+nx60+' '+bt60;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx30+' '+mid+' L '+nx30+' '+bt30;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb43+(bt24-bb43)/2; 
s='M '+2507+' '+mid+' L '+2859+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx43+' '+bb43+' L '+nx43+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx14+' '+mid+' L '+nx14+' '+bt14;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx24+' '+mid+' L '+nx24+' '+bt24;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx41+' '+mid+' L '+nx41+' '+bt41;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1674+' '+655+' L '+bl44+' '+655; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb45+(bt28-bb45)/2; 
s='M '+1378+' '+mid+' L '+1668+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx45+' '+bb45+' L '+nx45+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx62+' '+mid+' L '+nx62+' '+bt62;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx28+' '+mid+' L '+nx28+' '+bt28;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx59+' '+mid+' L '+nx59+' '+bt59;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx46+' '+bb46+' L '+nx46+' '+714; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(920-742,1,0,0); 
h.translate(742,714); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+742+' '+714+' L '+920+' '+714; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb48+(bt13-bb48)/2; 
s='M '+1739+' '+mid+' L '+1923+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx48+' '+bb48+' L '+nx48+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx2+' '+mid+' L '+nx2+' '+bt2;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx13+' '+mid+' L '+nx13+' '+bt13;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx50+' '+bb50+' L '+nx50+' '+bt33; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx51+' '+bb51+' L '+nx51+' '+bt38; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx52+' '+bb52+' L '+nx52+' '+bt57; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb54+(bt97-bb54)/2; 
s='M '+1947+' '+mid+' L '+2347+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx54+' '+bb54+' L '+nx54+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx5+' '+mid+' L '+nx5+' '+bt5;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx9+' '+mid+' L '+nx9+' '+bt9;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx97+' '+mid+' L '+nx97+' '+bt97;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx69+' '+mid+' L '+nx69+' '+bt69;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb57+(bt89-bb57)/2; 
s='M '+369+' '+mid+' L '+1397+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx57+' '+bb57+' L '+nx57+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx22+' '+mid+' L '+nx22+' '+bt22;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx10+' '+mid+' L '+nx10+' '+bt10;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx89+' '+mid+' L '+nx89+' '+bt89;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx58+' '+bb58+' L '+nx58+' '+3038; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(2330-2150,1,0,0); 
h.translate(2150,3038); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2150+' '+3038+' L '+2330+' '+3038; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb59+(bt36-bb59)/2; 
s='M '+1572+' '+mid+' L '+1767+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx59+' '+bb59+' L '+nx59+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx77+' '+mid+' L '+nx77+' '+bt77;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx36+' '+mid+' L '+nx36+' '+bt36;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb60+(bt29-bb60)/2; 
s='M '+1304+' '+mid+' L '+1840+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx60+' '+bb60+' L '+nx60+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx17+' '+mid+' L '+nx17+' '+bt17;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx29+' '+mid+' L '+nx29+' '+bt29;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx61+' '+bb61+' L '+nx61+' '+bt67; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb63+(bt58-bb63)/2; 
s='M '+1964+' '+mid+' L '+2330+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx63+' '+bb63+' L '+nx63+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx66+' '+mid+' L '+nx66+' '+bt66;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx65+' '+mid+' L '+nx65+' '+bt65;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx31+' '+mid+' L '+nx31+' '+bt31;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx58+' '+mid+' L '+nx58+' '+bt58;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx64+' '+bb64+' L '+nx64+' '+bt52; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx65+' '+bb65+' L '+nx65+' '+3038; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(2150-1964,1,0,0); 
h.translate(1964,3038); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1964+' '+3038+' L '+2150+' '+3038; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx66+' '+bb66+' L '+nx66+' '+3038; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(2208-2150,1,0,0); 
h.translate(2150,3038); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+2150+' '+3038+' L '+2208+' '+3038; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb67+(bt72-bb67)/2; 
s='M '+1576+' '+mid+' L '+1762+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx67+' '+bb67+' L '+nx67+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx72+' '+mid+' L '+nx72+' '+bt72;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx86+' '+mid+' L '+nx86+' '+bt86;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx68+' '+bb68+' L '+nx68+' '+bt32; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb76+(bt70-bb76)/2; 
s='M '+1174+' '+mid+' L '+3291+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx76+' '+bb76+' L '+nx76+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx43+' '+mid+' L '+nx43+' '+bt43;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx83+' '+mid+' L '+nx83+' '+bt83;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx54+' '+mid+' L '+nx54+' '+bt54;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx70+' '+mid+' L '+nx70+' '+bt70;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx81+' '+mid+' L '+nx81+' '+bt81;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx12+' '+mid+' L '+nx12+' '+bt12;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+1670+' '+1744+' L '+bl77+' '+1744; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx81+' '+bb81+' L '+nx81+' '+bt53; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx82+' '+bb82+' L '+nx82+' '+bt50; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb83+(bt78-bb83)/2; 
s='M '+3042+' '+mid+' L '+3547+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx83+' '+bb83+' L '+nx83+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx73+' '+mid+' L '+nx73+' '+bt73;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx78+' '+mid+' L '+nx78+' '+bt78;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx1+' '+mid+' L '+nx1+' '+bt1;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx47+' '+mid+' L '+nx47+' '+bt47;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb85+(bt95-bb85)/2; 
s='M '+742+' '+mid+' L '+1099+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx85+' '+bb85+' L '+nx85+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx15+' '+mid+' L '+nx15+' '+bt15;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx46+' '+mid+' L '+nx46+' '+bt46;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx95+' '+mid+' L '+nx95+' '+bt95;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx86+' '+bb86+' L '+nx86+' '+bt21; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx87+' '+bb87+' L '+nx87+' '+bt60; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx88+' '+bb88+' L '+nx88+' '+bt37; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx89+' '+bb89+' L '+nx89+' '+bt18; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx90+' '+bb90+' L '+nx90+' '+bt55; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx91+' '+bb91+' L '+nx91+' '+bt76; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx94+' '+bb94+' L '+nx94+' '+bt68; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx95+' '+bb95+' L '+nx95+' '+714; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
h=paper.path("M 0 0 L 1 0"); 
h.scale(1099-920,1,0,0); 
h.translate(920,714); 
h.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+920+' '+714+' L '+1099+' '+714; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 

var mid=bb96+(bt85-bb96)/2; 
s='M '+920+' '+mid+' L '+1674+' '+mid; 
h=paper.path(s); 
h.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx96+' '+bb96+' L '+nx96+' '+mid; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx85+' '+mid+' L '+nx85+' '+bt85;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 
s='M '+nx7+' '+mid+' L '+nx7+' '+bt7;
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx99+' '+bb99+' L '+nx99+' '+bt64; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx100+' '+bb100+' L '+nx100+' '+bt91; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx101+' '+bb101+' L '+nx101+' '+bt61; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx102+' '+bb102+' L '+nx102+' '+bt26; 
v=paper.path(s); 
v.attr({stroke:"white", "stroke-width": "3"}); 

s='M '+nx103+' '+bb103+' L '+nx103+' '+bt6; 
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