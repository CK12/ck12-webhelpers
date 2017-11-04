function initMap() { 

// Set size parameters 
mapWidth = 3190; 
mapHeight = 2777; 
holder = document.getElementById('holder'); 
boxWidth = holder.getElementWidth();
boxHeight = holder.getElementHeight();
canvasWidth = boxWidth; 
canvasHeight = boxHeight; 
aspectRatio = boxWidth/boxHeight; 
zoomFactor = 5; 

// Create Raphael canvas for map 
paper = Raphael(document.getElementById('holder'), '100%', '100%');

// Define view center position 
rootx = 1747; 
rooty = 100; 

xorig = rootx-boxWidth/2; 
yorig = rooty; 
} 

function snapGrid() { 

var xint = Math.round(mapWidth/15) + 1; 
var yint = Math.round(mapHeight/15) + 1; 

var xgrid = new Array(); 
var ygrid = new Array(); 

for (var i = 0; i < xint; i++) xgrid[i] = i*15; 
for (var i = 0; i < yint; i++) ygrid[i] = i*15; 

for (var i = 0; i < nnodes; i++) { 
    nx[i] = Raphael.snapTo(xgrid,nx[i],7.5); 
    ny[i] = Raphael.snapTo(ygrid,ny[i],7.5); 
} 
} 

function defPos() { 

nnodes = 67; 
njunc = 2; 

nx[0]=2176;
ny[0]=1703;
nx[1]=2656;
ny[1]=1315;
nx[2]=1358;
ny[2]=1081;
nx[3]=528;
ny[3]=1362;
nx[4]=1977;
ny[4]=2104;
nx[5]=699;
ny[5]=1362;
nx[6]=610;
ny[6]=1232;
nx[7]=2273;
ny[7]=861;
nx[8]=1684;
ny[8]=2194;
nx[9]=855;
ny[9]=1355;
nx[10]=1574;
ny[10]=328;
nx[11]=1832;
ny[11]=1578;
nx[12]=1749;
ny[12]=419;
nx[13]=1176;
ny[13]=763;
nx[14]=2176;
ny[14]=1586;
nx[15]=1325;
ny[15]=1238;
nx[16]=1271;
ny[16]=2046;
nx[17]=1003;
ny[17]=1080;
nx[18]=995;
ny[18]=1362;
nx[19]=2806;
ny[19]=1439;
nx[20]=1906;
ny[20]=328;
nx[21]=1584;
ny[21]=2053;
nx[22]=1271;
ny[22]=2187;
nx[23]=2357;
ny[23]=1153;
nx[24]=200;
ny[24]=1362;
nx[25]=2990;
ny[25]=1440;
nx[26]=2656;
ny[26]=1440;
nx[27]=1906;
ny[27]=420;
nx[28]=2376;
ny[28]=1439;
nx[29]=2021;
ny[29]=1585;
nx[30]=1574;
ny[30]=419;
nx[31]=2176;
ny[31]=1433;
nx[32]=1747;
ny[32]=100;
nx[33]=1176;
ny[33]=970;
nx[34]=1747;
ny[34]=207;
nx[35]=1972;
ny[35]=1312;
nx[36]=2176;
ny[36]=1311;
nx[37]=2197;
ny[37]=972;
nx[38]=2273;
ny[38]=762;
nx[39]=1176;
ny[39]=865;
nx[40]=1977;
ny[40]=2006;
nx[41]=2357;
ny[41]=1051;
nx[42]=2357;
ny[42]=965;
nx[43]=528;
ny[43]=1568;
nx[44]=370;
ny[44]=1355;
nx[45]=1749;
ny[45]=514;
nx[46]=1190;
ny[46]=1913;
nx[47]=2487;
ny[47]=1586;
nx[48]=2523;
ny[48]=1432;
nx[49]=1975;
ny[49]=2559;
nx[50]=2321;
ny[50]=1579;
nx[51]=1975;
ny[51]=2677;
nx[52]=1483;
ny[52]=2187;
nx[53]=1977;
ny[53]=2217;
nx[54]=1977;
ny[54]=1908;
nx[55]=1584;
ny[55]=1914;
nx[56]=1747;
ny[56]=328;
nx[57]=1975;
ny[57]=2450;
nx[58]=1975;
ny[58]=2334;
nx[59]=1574;
ny[59]=512;
nx[60]=1159;
ny[60]=1234;
nx[61]=528;
ny[61]=1466;
nx[62]=1799;
ny[62]=2044;
nx[63]=1159;
ny[63]=1355;
nx[64]=1832;
ny[64]=1690;
nx[65]=1749;
ny[65]=601;
nx[66]=1584;
ny[66]=1229;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[14]; 
members[1]=[66, 35, 36, 48, 19, 23, 25, 26, 28]; 
members[2]=[33, 66, 17]; 
members[3]=[5, 6, 9, 44, 18, 24, 61]; 
members[4]=[40, 53]; 
members[5]=[3, 6, 9, 44, 18, 24]; 
members[6]=[3, 5, 9, 44, 15, 17, 18, 24, 60]; 
members[7]=[42, 37, 38]; 
members[8]=[52, 21]; 
members[9]=[3, 5, 6, 44, 18, 24]; 
members[10]=[56, 34, 20, 30]; 
members[11]=[64, 14, 47, 50, 29, 31]; 
members[12]=[56, 45]; 
members[13]=[65, 38, 39]; 
members[14]=[0, 11, 47, 50, 29, 31]; 
members[15]=[17, 60, 6]; 
members[16]=[21, 62, 22, 55]; 
members[17]=[33, 2, 6, 66, 15, 60]; 
members[18]=[3, 5, 6, 9, 44, 24]; 
members[19]=[1, 48, 25, 26, 28]; 
members[20]=[56, 34, 27, 10]; 
members[21]=[8, 16, 52, 55, 62]; 
members[22]=[16]; 
members[23]=[1, 66, 35, 36, 41]; 
members[24]=[3, 5, 6, 9, 44, 18]; 
members[25]=[1, 48, 19, 26, 28]; 
members[26]=[1, 48, 19, 25, 28]; 
members[27]=[65, 20]; 
members[28]=[1, 48, 19, 25, 26]; 
members[29]=[11, 14, 47, 50, 31]; 
members[30]=[10, 59]; 
members[31]=[36, 11, 14, 47, 50, 29]; 
members[32]=[34]; 
members[33]=[17, 2, 66, 39]; 
members[34]=[56, 32, 10, 20]; 
members[35]=[1, 66, 36, 23]; 
members[36]=[1, 66, 35, 23, 31]; 
members[37]=[42, 7]; 
members[38]=[65, 13, 7]; 
members[39]=[33, 13]; 
members[40]=[4, 54]; 
members[41]=[42, 23]; 
members[42]=[41, 37, 7]; 
members[43]=[61]; 
members[44]=[3, 5, 6, 9, 18, 24]; 
members[45]=[65, 12]; 
members[46]=[66, 54, 55]; 
members[47]=[11, 14, 50, 29, 31]; 
members[48]=[1, 19, 25, 26, 28]; 
members[49]=[57, 51]; 
members[50]=[11, 14, 47, 29, 31]; 
members[51]=[49]; 
members[52]=[8, 21]; 
members[53]=[58, 4]; 
members[54]=[40, 66, 46, 55]; 
members[55]=[66, 46, 16, 21, 54, 62]; 
members[56]=[20, 34, 12, 10]; 
members[57]=[49, 58]; 
members[58]=[57, 53]; 
members[59]=[65, 30]; 
members[60]=[17, 15, 6, 63]; 
members[61]=[3, 43]; 
members[62]=[16, 21, 55]; 
members[63]=[60]; 
members[64]=[11]; 
members[65]=[59, 38, 13, 45, 27]; 
members[66]=[1, 35, 36, 33, 55, 2, 46, 17, 54, 23]; 

return members[i]; 
} 

function drawMap(sfac) { 

var t; 
var rect; 
var tbox; 

paper.clear(); 

paper.setStart(); 
t=paper.text(nx[0],ny[0]-10,'Trigonometric\nSubstitutions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[0]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Trigonometric-Substitutions/#Trigonometric Substitutions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[0]=ny[0]-10-(tBox.height/2+10*sfac[0]);
bb[0]=ny[0]-10+(tBox.height/2+10*sfac[0]);
bl[0]=nx[0]-(tBox.width/2+10*sfac[0]);
br[0]=nx[0]+(tBox.width/2+10*sfac[0]);
var nwidth = br[0]-bl[0]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[0] = bl[0] - delta; 
    br[0] = br[0] + delta; 
} 
bb[0] = bb[0]+20; 
rect=paper.rect(bl[0], bt[0], br[0]-bl[0], bb[0]-bt[0], 10*sfac[0]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[0]-42,bb[0]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[0]-18,bb[0]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[0]+5,bb[0]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[0]+25,bb[0]-25,20,20); 
t.toFront(); 
b[0]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[1],ny[1],'Applications of\nDefinte Integrals').attr({fill:"#666666","font-size": 14*sfac[1]});
tBox=t.getBBox(); 
bt[1]=ny[1]-(tBox.height/2+10*sfac[1]);
bb[1]=ny[1]+(tBox.height/2+10*sfac[1]);
bl[1]=nx[1]-(tBox.width/2+10*sfac[1]);
br[1]=nx[1]+(tBox.width/2+10*sfac[1]);
rect=paper.rect(bl[1], bt[1], br[1]-bl[1], bb[1]-bt[1], 10*sfac[1]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[1]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[2],ny[2]-10,'Derivatives of\nTrigonometric Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[2]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Derivatives-of-Trigonometric-Functions/#Derivatives of Trigonometric Functions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[2]=ny[2]-10-(tBox.height/2+10*sfac[2]);
bb[2]=ny[2]-10+(tBox.height/2+10*sfac[2]);
bl[2]=nx[2]-(tBox.width/2+10*sfac[2]);
br[2]=nx[2]+(tBox.width/2+10*sfac[2]);
var nwidth = br[2]-bl[2]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[2] = bl[2] - delta; 
    br[2] = br[2] + delta; 
} 
bb[2] = bb[2]+20; 
rect=paper.rect(bl[2], bt[2], br[2]-bl[2], bb[2]-bt[2], 10*sfac[2]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[2]-42,bb[2]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[2]-18,bb[2]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[2]+5,bb[2]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[2]+25,bb[2]-25,20,20); 
t.toFront(); 
b[2]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[3],ny[3]-10,'The First Derivative\nTest').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[3]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-First-Derivative-Test/#The First Derivative Test", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[3]=ny[3]-10-(tBox.height/2+10*sfac[3]);
bb[3]=ny[3]-10+(tBox.height/2+10*sfac[3]);
bl[3]=nx[3]-(tBox.width/2+10*sfac[3]);
br[3]=nx[3]+(tBox.width/2+10*sfac[3]);
var nwidth = br[3]-bl[3]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[3] = bl[3] - delta; 
    br[3] = br[3] + delta; 
} 
bb[3] = bb[3]+20; 
rect=paper.rect(bl[3], bt[3], br[3]-bl[3], bb[3]-bt[3], 10*sfac[3]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[3]-42,bb[3]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[3]-18,bb[3]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[3]+5,bb[3]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[3]+25,bb[3]-25,20,20); 
t.toFront(); 
b[3]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[4],ny[4]-10,'Infinite Series').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[4]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Infinite-Series/#Infinite Series", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[4]=ny[4]-10-(tBox.height/2+10*sfac[4]);
bb[4]=ny[4]-10+(tBox.height/2+10*sfac[4]);
bl[4]=nx[4]-(tBox.width/2+10*sfac[4]);
br[4]=nx[4]+(tBox.width/2+10*sfac[4]);
var nwidth = br[4]-bl[4]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[4] = bl[4] - delta; 
    br[4] = br[4] + delta; 
} 
bb[4] = bb[4]+20; 
rect=paper.rect(bl[4], bt[4], br[4]-bl[4], bb[4]-bt[4], 10*sfac[4]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[4]-42,bb[4]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[4]-18,bb[4]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[4]+5,bb[4]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[4]+25,bb[4]-25,20,20); 
t.toFront(); 
b[4]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[5],ny[5]-10,'Analyzing the Graph\nof a Function').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[5]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Analyzing-the-Graph-of-a-Function/#Analyzing the Graph of a Function", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[5]=ny[5]-10-(tBox.height/2+10*sfac[5]);
bb[5]=ny[5]-10+(tBox.height/2+10*sfac[5]);
bl[5]=nx[5]-(tBox.width/2+10*sfac[5]);
br[5]=nx[5]+(tBox.width/2+10*sfac[5]);
var nwidth = br[5]-bl[5]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[5] = bl[5] - delta; 
    br[5] = br[5] + delta; 
} 
bb[5] = bb[5]+20; 
rect=paper.rect(bl[5], bt[5], br[5]-bl[5], bb[5]-bt[5], 10*sfac[5]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[5]-42,bb[5]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[5]-18,bb[5]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[5]+5,bb[5]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[5]+25,bb[5]-25,20,20); 
t.toFront(); 
b[5]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[6],ny[6],'Applications of\nDerivatives').attr({fill:"#666666","font-size": 14*sfac[6]});
tBox=t.getBBox(); 
bt[6]=ny[6]-(tBox.height/2+10*sfac[6]);
bb[6]=ny[6]+(tBox.height/2+10*sfac[6]);
bl[6]=nx[6]-(tBox.width/2+10*sfac[6]);
br[6]=nx[6]+(tBox.width/2+10*sfac[6]);
rect=paper.rect(bl[6], bt[6], br[6]-bl[6], bb[6]-bt[6], 10*sfac[6]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[6]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[7],ny[7]-10,'Indefinite Integrals\nCalculus').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[7]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Indefinite-Integrals-Calculus/#Indefinite Integrals Calculus", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[7]=ny[7]-10-(tBox.height/2+10*sfac[7]);
bb[7]=ny[7]-10+(tBox.height/2+10*sfac[7]);
bl[7]=nx[7]-(tBox.width/2+10*sfac[7]);
br[7]=nx[7]+(tBox.width/2+10*sfac[7]);
var nwidth = br[7]-bl[7]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[7] = bl[7] - delta; 
    br[7] = br[7] + delta; 
} 
bb[7] = bb[7]+20; 
rect=paper.rect(bl[7], bt[7], br[7]-bl[7], bb[7]-bt[7], 10*sfac[7]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[7]-42,bb[7]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[7]-18,bb[7]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[7]+5,bb[7]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[7]+25,bb[7]-25,20,20); 
t.toFront(); 
b[7]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[8],ny[8]-10,'Differentiation and Integration\nof Logarithmic and Exponential\nFunctions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[8]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Differentiation-and-Integration-of-Logarithmic-and-Exponential-Functions/#Differentiation and Integration of Logarithmic and Exponential Functions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[8]=ny[8]-10-(tBox.height/2+10*sfac[8]);
bb[8]=ny[8]-10+(tBox.height/2+10*sfac[8]);
bl[8]=nx[8]-(tBox.width/2+10*sfac[8]);
br[8]=nx[8]+(tBox.width/2+10*sfac[8]);
var nwidth = br[8]-bl[8]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[8] = bl[8] - delta; 
    br[8] = br[8] + delta; 
} 
bb[8] = bb[8]+20; 
rect=paper.rect(bl[8], bt[8], br[8]-bl[8], bb[8]-bt[8], 10*sfac[8]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[8]-42,bb[8]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[8]-18,bb[8]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[8]+5,bb[8]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[8]+25,bb[8]-25,20,20); 
t.toFront(); 
b[8]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[9],ny[9]-10,'Limits at Inifinity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[9]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Limits-at-Infinity/#Limits at Inifinity", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[9]=ny[9]-10-(tBox.height/2+10*sfac[9]);
bb[9]=ny[9]-10+(tBox.height/2+10*sfac[9]);
bl[9]=nx[9]-(tBox.width/2+10*sfac[9]);
br[9]=nx[9]+(tBox.width/2+10*sfac[9]);
var nwidth = br[9]-bl[9]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[9] = bl[9] - delta; 
    br[9] = br[9] + delta; 
} 
bb[9] = bb[9]+20; 
rect=paper.rect(bl[9], bt[9], br[9]-bl[9], bb[9]-bt[9], 10*sfac[9]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[9]-42,bb[9]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[9]-18,bb[9]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[9]+5,bb[9]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[9]+25,bb[9]-25,20,20); 
t.toFront(); 
b[9]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[10],ny[10]-10,'Equations and Graphs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[10]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Equations-and-Graphs/#Equations and Graphs", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[10]=ny[10]-10-(tBox.height/2+10*sfac[10]);
bb[10]=ny[10]-10+(tBox.height/2+10*sfac[10]);
bl[10]=nx[10]-(tBox.width/2+10*sfac[10]);
br[10]=nx[10]+(tBox.width/2+10*sfac[10]);
var nwidth = br[10]-bl[10]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[10] = bl[10] - delta; 
    br[10] = br[10] + delta; 
} 
bb[10] = bb[10]+20; 
rect=paper.rect(bl[10], bt[10], br[10]-bl[10], bb[10]-bt[10], 10*sfac[10]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[10]-42,bb[10]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[10]-18,bb[10]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[10]+5,bb[10]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[10]+25,bb[10]-25,20,20); 
t.toFront(); 
b[10]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[11],ny[11]-10,'Integration by Substitution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[11]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Integration-by-Substitution---Integration-Techniques/#Integration by Substitution", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[11]=ny[11]-10-(tBox.height/2+10*sfac[11]);
bb[11]=ny[11]-10+(tBox.height/2+10*sfac[11]);
bl[11]=nx[11]-(tBox.width/2+10*sfac[11]);
br[11]=nx[11]+(tBox.width/2+10*sfac[11]);
var nwidth = br[11]-bl[11]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[11] = bl[11] - delta; 
    br[11] = br[11] + delta; 
} 
bb[11] = bb[11]+20; 
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[11]-42,bb[11]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[11]-18,bb[11]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[11]+5,bb[11]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[11]+25,bb[11]-25,20,20); 
t.toFront(); 
b[11]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[12],ny[12]-10,'Evaluating Limits').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[12]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Evaluating-Limits/#Evaluating Limits", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[12]=ny[12]-10-(tBox.height/2+10*sfac[12]);
bb[12]=ny[12]-10+(tBox.height/2+10*sfac[12]);
bl[12]=nx[12]-(tBox.width/2+10*sfac[12]);
br[12]=nx[12]+(tBox.width/2+10*sfac[12]);
var nwidth = br[12]-bl[12]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[12] = bl[12] - delta; 
    br[12] = br[12] + delta; 
} 
bb[12] = bb[12]+20; 
rect=paper.rect(bl[12], bt[12], br[12]-bl[12], bb[12]-bt[12], 10*sfac[12]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[12]-42,bb[12]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[12]-18,bb[12]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[12]+5,bb[12]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[12]+25,bb[12]-25,20,20); 
t.toFront(); 
b[12]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[13],ny[13],'Derivatives').attr({fill:"#666666","font-size": 14*sfac[13]});
tBox=t.getBBox(); 
bt[13]=ny[13]-(tBox.height/2+10*sfac[13]);
bb[13]=ny[13]+(tBox.height/2+10*sfac[13]);
bl[13]=nx[13]-(tBox.width/2+10*sfac[13]);
br[13]=nx[13]+(tBox.width/2+10*sfac[13]);
rect=paper.rect(bl[13], bt[13], br[13]-bl[13], bb[13]-bt[13], 10*sfac[13]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[13]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[14],ny[14]-10,'Trigonometric\nIntegrals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[14]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Trigonometric-Integrals/#Trigonometric Integrals", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[14]=ny[14]-10-(tBox.height/2+10*sfac[14]);
bb[14]=ny[14]-10+(tBox.height/2+10*sfac[14]);
bl[14]=nx[14]-(tBox.width/2+10*sfac[14]);
br[14]=nx[14]+(tBox.width/2+10*sfac[14]);
var nwidth = br[14]-bl[14]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[14] = bl[14] - delta; 
    br[14] = br[14] + delta; 
} 
bb[14] = bb[14]+20; 
rect=paper.rect(bl[14], bt[14], br[14]-bl[14], bb[14]-bt[14], 10*sfac[14]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[14]-42,bb[14]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[14]-18,bb[14]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[14]+5,bb[14]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[14]+25,bb[14]-25,20,20); 
t.toFront(); 
b[14]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[15],ny[15]-10,"Linearization and\nNewton's Method").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[15]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linearization-and-Newton’s-Method/#Linearization and Newton's Method", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[15]=ny[15]-10-(tBox.height/2+10*sfac[15]);
bb[15]=ny[15]-10+(tBox.height/2+10*sfac[15]);
bl[15]=nx[15]-(tBox.width/2+10*sfac[15]);
br[15]=nx[15]+(tBox.width/2+10*sfac[15]);
var nwidth = br[15]-bl[15]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[15] = bl[15] - delta; 
    br[15] = br[15] + delta; 
} 
bb[15] = bb[15]+20; 
rect=paper.rect(bl[15], bt[15], br[15]-bl[15], bb[15]-bt[15], 10*sfac[15]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[15]-42,bb[15]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[15]-18,bb[15]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[15]+5,bb[15]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[15]+25,bb[15]-25,20,20); 
t.toFront(); 
b[15]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[16],ny[16]-10,'Inverse Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[16]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inverse-Functions/#Inverse Functions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[16]=ny[16]-10-(tBox.height/2+10*sfac[16]);
bb[16]=ny[16]-10+(tBox.height/2+10*sfac[16]);
bl[16]=nx[16]-(tBox.width/2+10*sfac[16]);
br[16]=nx[16]+(tBox.width/2+10*sfac[16]);
var nwidth = br[16]-bl[16]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[16] = bl[16] - delta; 
    br[16] = br[16] + delta; 
} 
bb[16] = bb[16]+20; 
rect=paper.rect(bl[16], bt[16], br[16]-bl[16], bb[16]-bt[16], 10*sfac[16]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[16]-42,bb[16]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[16]-18,bb[16]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[16]+5,bb[16]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[16]+25,bb[16]-25,20,20); 
t.toFront(); 
b[16]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[17],ny[17]-10,'Techniques of\nDifferentiation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[17]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Techniques-of-Differentiation/#Techniques of Differentiation", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[17]=ny[17]-10-(tBox.height/2+10*sfac[17]);
bb[17]=ny[17]-10+(tBox.height/2+10*sfac[17]);
bl[17]=nx[17]-(tBox.width/2+10*sfac[17]);
br[17]=nx[17]+(tBox.width/2+10*sfac[17]);
var nwidth = br[17]-bl[17]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[17] = bl[17] - delta; 
    br[17] = br[17] + delta; 
} 
bb[17] = bb[17]+20; 
rect=paper.rect(bl[17], bt[17], br[17]-bl[17], bb[17]-bt[17], 10*sfac[17]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[17]-42,bb[17]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[17]-18,bb[17]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[17]+5,bb[17]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[17]+25,bb[17]-25,20,20); 
t.toFront(); 
b[17]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[18],ny[18]-10,'Approximation\nErrors').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[18]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Approximation-Errors/#Approximation Errors", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[18]=ny[18]-10-(tBox.height/2+10*sfac[18]);
bb[18]=ny[18]-10+(tBox.height/2+10*sfac[18]);
bl[18]=nx[18]-(tBox.width/2+10*sfac[18]);
br[18]=nx[18]+(tBox.width/2+10*sfac[18]);
var nwidth = br[18]-bl[18]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[18] = bl[18] - delta; 
    br[18] = br[18] + delta; 
} 
bb[18] = bb[18]+20; 
rect=paper.rect(bl[18], bt[18], br[18]-bl[18], bb[18]-bt[18], 10*sfac[18]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[18]-42,bb[18]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[18]-18,bb[18]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[18]+5,bb[18]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[18]+25,bb[18]-25,20,20); 
t.toFront(); 
b[18]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[19],ny[19]-10,'Area of a Surface\nRevolution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[19]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-of-a-Surface-of-Revolution/#Area of a Surface Revolution", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[19]=ny[19]-10-(tBox.height/2+10*sfac[19]);
bb[19]=ny[19]-10+(tBox.height/2+10*sfac[19]);
bl[19]=nx[19]-(tBox.width/2+10*sfac[19]);
br[19]=nx[19]+(tBox.width/2+10*sfac[19]);
var nwidth = br[19]-bl[19]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[19] = bl[19] - delta; 
    br[19] = br[19] + delta; 
} 
bb[19] = bb[19]+20; 
rect=paper.rect(bl[19], bt[19], br[19]-bl[19], bb[19]-bt[19], 10*sfac[19]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[19]-42,bb[19]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[19]-18,bb[19]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[19]+5,bb[19]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[19]+25,bb[19]-25,20,20); 
t.toFront(); 
b[19]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[20],ny[20]-10,'The Calculus').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[20]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Calculus/#The Calculus", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[20]=ny[20]-10-(tBox.height/2+10*sfac[20]);
bb[20]=ny[20]-10+(tBox.height/2+10*sfac[20]);
bl[20]=nx[20]-(tBox.width/2+10*sfac[20]);
br[20]=nx[20]+(tBox.width/2+10*sfac[20]);
var nwidth = br[20]-bl[20]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[20] = bl[20] - delta; 
    br[20] = br[20] + delta; 
} 
bb[20] = bb[20]+20; 
rect=paper.rect(bl[20], bt[20], br[20]-bl[20], bb[20]-bt[20], 10*sfac[20]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[20]-42,bb[20]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[20]-18,bb[20]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[20]+5,bb[20]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[20]+25,bb[20]-25,20,20); 
t.toFront(); 
b[20]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[21],ny[21]-10,'Exponential and\nLogarithmic Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[21]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exponential-and-Logarithmic-Functions/#Exponential and Logarithmic Functions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[21]=ny[21]-10-(tBox.height/2+10*sfac[21]);
bb[21]=ny[21]-10+(tBox.height/2+10*sfac[21]);
bl[21]=nx[21]-(tBox.width/2+10*sfac[21]);
br[21]=nx[21]+(tBox.width/2+10*sfac[21]);
var nwidth = br[21]-bl[21]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[21] = bl[21] - delta; 
    br[21] = br[21] + delta; 
} 
bb[21] = bb[21]+20; 
rect=paper.rect(bl[21], bt[21], br[21]-bl[21], bb[21]-bt[21], 10*sfac[21]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[21]-42,bb[21]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[21]-18,bb[21]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[21]+5,bb[21]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[21]+25,bb[21]-25,20,20); 
t.toFront(); 
b[21]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[22],ny[22]-10,'Derivatives and Integrals Involving\nInverse Trigonometric Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[22]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Derivatives-and-Integrals-Involving-Inverse-Trigonometric-Functions/#Derivatives and Integrals Involving Inverse Trigonometric Functions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[22]=ny[22]-10-(tBox.height/2+10*sfac[22]);
bb[22]=ny[22]-10+(tBox.height/2+10*sfac[22]);
bl[22]=nx[22]-(tBox.width/2+10*sfac[22]);
br[22]=nx[22]+(tBox.width/2+10*sfac[22]);
var nwidth = br[22]-bl[22]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[22] = bl[22] - delta; 
    br[22] = br[22] + delta; 
} 
bb[22] = bb[22]+20; 
rect=paper.rect(bl[22], bt[22], br[22]-bl[22], bb[22]-bt[22], 10*sfac[22]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[22]-42,bb[22]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[22]-18,bb[22]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[22]+5,bb[22]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[22]+25,bb[22]-25,20,20); 
t.toFront(); 
b[22]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[23],ny[23]-10,'Evaluating Definite\nIntegrals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[23]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Evaluating-Definite-Integrals/#Evaluating Definite Integrals", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[23]=ny[23]-10-(tBox.height/2+10*sfac[23]);
bb[23]=ny[23]-10+(tBox.height/2+10*sfac[23]);
bl[23]=nx[23]-(tBox.width/2+10*sfac[23]);
br[23]=nx[23]+(tBox.width/2+10*sfac[23]);
var nwidth = br[23]-bl[23]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[23] = bl[23] - delta; 
    br[23] = br[23] + delta; 
} 
bb[23] = bb[23]+20; 
rect=paper.rect(bl[23], bt[23], br[23]-bl[23], bb[23]-bt[23], 10*sfac[23]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[23]-42,bb[23]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[23]-18,bb[23]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[23]+5,bb[23]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[23]+25,bb[23]-25,20,20); 
t.toFront(); 
b[23]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[24],ny[24]-10,'Extrema and The Mean\nValue Theorem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[24]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Extrema-and-the-Mean-Value-Theorem/#Extrema and The Mean Value Theorem", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[24]=ny[24]-10-(tBox.height/2+10*sfac[24]);
bb[24]=ny[24]-10+(tBox.height/2+10*sfac[24]);
bl[24]=nx[24]-(tBox.width/2+10*sfac[24]);
br[24]=nx[24]+(tBox.width/2+10*sfac[24]);
var nwidth = br[24]-bl[24]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[24] = bl[24] - delta; 
    br[24] = br[24] + delta; 
} 
bb[24] = bb[24]+20; 
rect=paper.rect(bl[24], bt[24], br[24]-bl[24], bb[24]-bt[24], 10*sfac[24]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[24]-42,bb[24]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[24]-18,bb[24]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[24]+5,bb[24]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[24]+25,bb[24]-25,20,20); 
t.toFront(); 
b[24]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[25],ny[25]-10,'Applications from Physics,\nEngineering, and Statistics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[25]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Applications-from-Physics,-Engineering,-and-Statistics/#Applications from Physics, Engineering, and Statistics", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[25]=ny[25]-10-(tBox.height/2+10*sfac[25]);
bb[25]=ny[25]-10+(tBox.height/2+10*sfac[25]);
bl[25]=nx[25]-(tBox.width/2+10*sfac[25]);
br[25]=nx[25]+(tBox.width/2+10*sfac[25]);
var nwidth = br[25]-bl[25]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[25] = bl[25] - delta; 
    br[25] = br[25] + delta; 
} 
bb[25] = bb[25]+20; 
rect=paper.rect(bl[25], bt[25], br[25]-bl[25], bb[25]-bt[25], 10*sfac[25]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[25]-42,bb[25]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[25]-18,bb[25]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[25]+5,bb[25]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[25]+25,bb[25]-25,20,20); 
t.toFront(); 
b[25]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[26],ny[26]-10,'The Length of\na Plane Curve').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[26]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Length-of-a-Plane-Curve/#The Length of a Plane Curve", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[26]=ny[26]-10-(tBox.height/2+10*sfac[26]);
bb[26]=ny[26]-10+(tBox.height/2+10*sfac[26]);
bl[26]=nx[26]-(tBox.width/2+10*sfac[26]);
br[26]=nx[26]+(tBox.width/2+10*sfac[26]);
var nwidth = br[26]-bl[26]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[26] = bl[26] - delta; 
    br[26] = br[26] + delta; 
} 
bb[26] = bb[26]+20; 
rect=paper.rect(bl[26], bt[26], br[26]-bl[26], bb[26]-bt[26], 10*sfac[26]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[26]-42,bb[26]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[26]-18,bb[26]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[26]+5,bb[26]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[26]+25,bb[26]-25,20,20); 
t.toFront(); 
b[26]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[27],ny[27]-10,'Continuity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[27]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Continuity/#Continuity", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[27]=ny[27]-10-(tBox.height/2+10*sfac[27]);
bb[27]=ny[27]-10+(tBox.height/2+10*sfac[27]);
bl[27]=nx[27]-(tBox.width/2+10*sfac[27]);
br[27]=nx[27]+(tBox.width/2+10*sfac[27]);
var nwidth = br[27]-bl[27]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[27] = bl[27] - delta; 
    br[27] = br[27] + delta; 
} 
bb[27] = bb[27]+20; 
rect=paper.rect(bl[27], bt[27], br[27]-bl[27], bb[27]-bt[27], 10*sfac[27]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[27]-42,bb[27]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[27]-18,bb[27]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[27]+5,bb[27]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[27]+25,bb[27]-25,20,20); 
t.toFront(); 
b[27]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[28],ny[28]-10,'Area Between Two\nCurves').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[28]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-Between-Two-Curves/#Area Between Two Curves", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[28]=ny[28]-10-(tBox.height/2+10*sfac[28]);
bb[28]=ny[28]-10+(tBox.height/2+10*sfac[28]);
bl[28]=nx[28]-(tBox.width/2+10*sfac[28]);
br[28]=nx[28]+(tBox.width/2+10*sfac[28]);
var nwidth = br[28]-bl[28]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[28] = bl[28] - delta; 
    br[28] = br[28] + delta; 
} 
bb[28] = bb[28]+20; 
rect=paper.rect(bl[28], bt[28], br[28]-bl[28], bb[28]-bt[28], 10*sfac[28]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[28]-42,bb[28]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[28]-18,bb[28]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[28]+5,bb[28]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[28]+25,bb[28]-25,20,20); 
t.toFront(); 
b[28]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[29],ny[29]-10,'Integration by Partial\nFractions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[29]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Integration-by-Partial-Fractions/#Integration by Partial Fractions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[29]=ny[29]-10-(tBox.height/2+10*sfac[29]);
bb[29]=ny[29]-10+(tBox.height/2+10*sfac[29]);
bl[29]=nx[29]-(tBox.width/2+10*sfac[29]);
br[29]=nx[29]+(tBox.width/2+10*sfac[29]);
var nwidth = br[29]-bl[29]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[29] = bl[29] - delta; 
    br[29] = br[29] + delta; 
} 
bb[29] = bb[29]+20; 
rect=paper.rect(bl[29], bt[29], br[29]-bl[29], bb[29]-bt[29], 10*sfac[29]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[29]-42,bb[29]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[29]-18,bb[29]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[29]+5,bb[29]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[29]+25,bb[29]-25,20,20); 
t.toFront(); 
b[29]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[30],ny[30]-10,'Relations and Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[30]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Relations-and-Functions/#Relations and Functions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[30]=ny[30]-10-(tBox.height/2+10*sfac[30]);
bb[30]=ny[30]-10+(tBox.height/2+10*sfac[30]);
bl[30]=nx[30]-(tBox.width/2+10*sfac[30]);
br[30]=nx[30]+(tBox.width/2+10*sfac[30]);
var nwidth = br[30]-bl[30]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[30] = bl[30] - delta; 
    br[30] = br[30] + delta; 
} 
bb[30] = bb[30]+20; 
rect=paper.rect(bl[30], bt[30], br[30]-bl[30], bb[30]-bt[30], 10*sfac[30]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[30]-42,bb[30]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[30]-18,bb[30]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[30]+5,bb[30]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[30]+25,bb[30]-25,20,20); 
t.toFront(); 
b[30]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[31],ny[31],'Integration Techniques').attr({fill:"#666666","font-size": 14*sfac[31]});
tBox=t.getBBox(); 
bt[31]=ny[31]-(tBox.height/2+10*sfac[31]);
bb[31]=ny[31]+(tBox.height/2+10*sfac[31]);
bl[31]=nx[31]-(tBox.width/2+10*sfac[31]);
br[31]=nx[31]+(tBox.width/2+10*sfac[31]);
rect=paper.rect(bl[31], bt[31], br[31]-bl[31], bb[31]-bt[31], 10*sfac[31]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[31]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[32],ny[32],'Calculus').attr({fill:"#000000","font-size": 24*sfac[32]});
tBox=t.getBBox(); 
bt[32]=ny[32]-(tBox.height/2+10*sfac[32]);
bb[32]=ny[32]+(tBox.height/2+10*sfac[32]);
bl[32]=nx[32]-(tBox.width/2+10*sfac[32]);
br[32]=nx[32]+(tBox.width/2+10*sfac[32]);
rect=paper.rect(bl[32], bt[32], br[32]-bl[32], bb[32]-bt[32], 10*sfac[32]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[32]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[33],ny[33]-10,'The Derivative').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[33]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Derivative/#The Derivative", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[33]=ny[33]-10-(tBox.height/2+10*sfac[33]);
bb[33]=ny[33]-10+(tBox.height/2+10*sfac[33]);
bl[33]=nx[33]-(tBox.width/2+10*sfac[33]);
br[33]=nx[33]+(tBox.width/2+10*sfac[33]);
var nwidth = br[33]-bl[33]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[33] = bl[33] - delta; 
    br[33] = br[33] + delta; 
} 
bb[33] = bb[33]+20; 
rect=paper.rect(bl[33], bt[33], br[33]-bl[33], bb[33]-bt[33], 10*sfac[33]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[33]-42,bb[33]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[33]-18,bb[33]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[33]+5,bb[33]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[33]+25,bb[33]-25,20,20); 
t.toFront(); 
b[33]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[34],ny[34],'Functions, Limits, and\nContinuity').attr({fill:"#666666","font-size": 14*sfac[34]});
tBox=t.getBBox(); 
bt[34]=ny[34]-(tBox.height/2+10*sfac[34]);
bb[34]=ny[34]+(tBox.height/2+10*sfac[34]);
bl[34]=nx[34]-(tBox.width/2+10*sfac[34]);
br[34]=nx[34]+(tBox.width/2+10*sfac[34]);
rect=paper.rect(bl[34], bt[34], br[34]-bl[34], bb[34]-bt[34], 10*sfac[34]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[34]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[35],ny[35]-10,'Numerical Integration').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[35]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Numerical-Integration/#Numerical Integration", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[35]=ny[35]-10-(tBox.height/2+10*sfac[35]);
bb[35]=ny[35]-10+(tBox.height/2+10*sfac[35]);
bl[35]=nx[35]-(tBox.width/2+10*sfac[35]);
br[35]=nx[35]+(tBox.width/2+10*sfac[35]);
var nwidth = br[35]-bl[35]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[35] = bl[35] - delta; 
    br[35] = br[35] + delta; 
} 
bb[35] = bb[35]+20; 
rect=paper.rect(bl[35], bt[35], br[35]-bl[35], bb[35]-bt[35], 10*sfac[35]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[35]-42,bb[35]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[35]-18,bb[35]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[35]+5,bb[35]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[35]+25,bb[35]-25,20,20); 
t.toFront(); 
b[35]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[36],ny[36]-10,'Integration by Substitution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[36]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Integration-by-Substitution---Integration/#Integration by Substitution", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[36]=ny[36]-10-(tBox.height/2+10*sfac[36]);
bb[36]=ny[36]-10+(tBox.height/2+10*sfac[36]);
bl[36]=nx[36]-(tBox.width/2+10*sfac[36]);
br[36]=nx[36]+(tBox.width/2+10*sfac[36]);
var nwidth = br[36]-bl[36]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[36] = bl[36] - delta; 
    br[36] = br[36] + delta; 
} 
bb[36] = bb[36]+20; 
rect=paper.rect(bl[36], bt[36], br[36]-bl[36], bb[36]-bt[36], 10*sfac[36]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[36]-42,bb[36]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[36]-18,bb[36]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[36]+5,bb[36]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[36]+25,bb[36]-25,20,20); 
t.toFront(); 
b[36]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[37],ny[37]-10,'The Initial Value\nProblem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[37]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Initial-Value-Problem/#The Initial Value Problem", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[37]=ny[37]-10-(tBox.height/2+10*sfac[37]);
bb[37]=ny[37]-10+(tBox.height/2+10*sfac[37]);
bl[37]=nx[37]-(tBox.width/2+10*sfac[37]);
br[37]=nx[37]+(tBox.width/2+10*sfac[37]);
var nwidth = br[37]-bl[37]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[37] = bl[37] - delta; 
    br[37] = br[37] + delta; 
} 
bb[37] = bb[37]+20; 
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[37]-42,bb[37]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[37]-18,bb[37]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[37]+5,bb[37]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[37]+25,bb[37]-25,20,20); 
t.toFront(); 
b[37]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[38],ny[38],'Integration').attr({fill:"#666666","font-size": 14*sfac[38]});
tBox=t.getBBox(); 
bt[38]=ny[38]-(tBox.height/2+10*sfac[38]);
bb[38]=ny[38]+(tBox.height/2+10*sfac[38]);
bl[38]=nx[38]-(tBox.width/2+10*sfac[38]);
br[38]=nx[38]+(tBox.width/2+10*sfac[38]);
rect=paper.rect(bl[38], bt[38], br[38]-bl[38], bb[38]-bt[38], 10*sfac[38]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[38]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[39],ny[39]-10,'Tangent Lines and\nRate of Change').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[39]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Tangent-Lines-and-Rates-of-Change/#Tangent Lines and Rate of Change", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[39]=ny[39]-10-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]-10+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
var nwidth = br[39]-bl[39]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[39] = bl[39] - delta; 
    br[39] = br[39] + delta; 
} 
bb[39] = bb[39]+20; 
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[39]-42,bb[39]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[39]-18,bb[39]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[39]+5,bb[39]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[39]+25,bb[39]-25,20,20); 
t.toFront(); 
b[39]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[40],ny[40]-10,'Sequences').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[40]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Sequences/#Sequences", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[40]=ny[40]-10-(tBox.height/2+10*sfac[40]);
bb[40]=ny[40]-10+(tBox.height/2+10*sfac[40]);
bl[40]=nx[40]-(tBox.width/2+10*sfac[40]);
br[40]=nx[40]+(tBox.width/2+10*sfac[40]);
var nwidth = br[40]-bl[40]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[40] = bl[40] - delta; 
    br[40] = br[40] + delta; 
} 
bb[40] = bb[40]+20; 
rect=paper.rect(bl[40], bt[40], br[40]-bl[40], bb[40]-bt[40], 10*sfac[40]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[40]-42,bb[40]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[40]-18,bb[40]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[40]+5,bb[40]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[40]+25,bb[40]-25,20,20); 
t.toFront(); 
b[40]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[41],ny[41]-10,'Definite Integrals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[41]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Definite-Integrals/#Definite Integrals", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[41]=ny[41]-10-(tBox.height/2+10*sfac[41]);
bb[41]=ny[41]-10+(tBox.height/2+10*sfac[41]);
bl[41]=nx[41]-(tBox.width/2+10*sfac[41]);
br[41]=nx[41]+(tBox.width/2+10*sfac[41]);
var nwidth = br[41]-bl[41]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[41] = bl[41] - delta; 
    br[41] = br[41] + delta; 
} 
bb[41] = bb[41]+20; 
rect=paper.rect(bl[41], bt[41], br[41]-bl[41], bb[41]-bt[41], 10*sfac[41]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[41]-42,bb[41]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[41]-18,bb[41]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[41]+5,bb[41]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[41]+25,bb[41]-25,20,20); 
t.toFront(); 
b[41]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[42],ny[42]-10,'The Area Problem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[42]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Area-Problem/#The Area Problem", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[42]=ny[42]-10-(tBox.height/2+10*sfac[42]);
bb[42]=ny[42]-10+(tBox.height/2+10*sfac[42]);
bl[42]=nx[42]-(tBox.width/2+10*sfac[42]);
br[42]=nx[42]+(tBox.width/2+10*sfac[42]);
var nwidth = br[42]-bl[42]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[42] = bl[42] - delta; 
    br[42] = br[42] + delta; 
} 
bb[42] = bb[42]+20; 
rect=paper.rect(bl[42], bt[42], br[42]-bl[42], bb[42]-bt[42], 10*sfac[42]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[42]-42,bb[42]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[42]-18,bb[42]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[42]+5,bb[42]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[42]+25,bb[42]-25,20,20); 
t.toFront(); 
b[42]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[43],ny[43]-10,'Optimization').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[43]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Optimization/#Optimization", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[43]=ny[43]-10-(tBox.height/2+10*sfac[43]);
bb[43]=ny[43]-10+(tBox.height/2+10*sfac[43]);
bl[43]=nx[43]-(tBox.width/2+10*sfac[43]);
br[43]=nx[43]+(tBox.width/2+10*sfac[43]);
var nwidth = br[43]-bl[43]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[43] = bl[43] - delta; 
    br[43] = br[43] + delta; 
} 
bb[43] = bb[43]+20; 
rect=paper.rect(bl[43], bt[43], br[43]-bl[43], bb[43]-bt[43], 10*sfac[43]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[43]-42,bb[43]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[43]-18,bb[43]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[43]+5,bb[43]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[43]+25,bb[43]-25,20,20); 
t.toFront(); 
b[43]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[44],ny[44]-10,'Related Rates').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[44]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Related-Rates/#Related Rates", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[44]=ny[44]-10-(tBox.height/2+10*sfac[44]);
bb[44]=ny[44]-10+(tBox.height/2+10*sfac[44]);
bl[44]=nx[44]-(tBox.width/2+10*sfac[44]);
br[44]=nx[44]+(tBox.width/2+10*sfac[44]);
var nwidth = br[44]-bl[44]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[44] = bl[44] - delta; 
    br[44] = br[44] + delta; 
} 
bb[44] = bb[44]+20; 
rect=paper.rect(bl[44], bt[44], br[44]-bl[44], bb[44]-bt[44], 10*sfac[44]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[44]-42,bb[44]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[44]-18,bb[44]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[44]+5,bb[44]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[44]+25,bb[44]-25,20,20); 
t.toFront(); 
b[44]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[45],ny[45]-10,'Infinite Limits').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[45]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Infinite-Limits/#Infinite Limits", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[45]=ny[45]-10-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]-10+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
var nwidth = br[45]-bl[45]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[45] = bl[45] - delta; 
    br[45] = br[45] + delta; 
} 
bb[45] = bb[45]+20; 
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[45]-42,bb[45]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[45]-18,bb[45]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[45]+5,bb[45]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[45]+25,bb[45]-25,20,20); 
t.toFront(); 
b[45]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[46],ny[46]-10,'The Fundametal Theorem\nof Calculus').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[46]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Fundamental-Theorem-of-Calculus/#The Fundametal Theorem of Calculus", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[46]=ny[46]-10-(tBox.height/2+10*sfac[46]);
bb[46]=ny[46]-10+(tBox.height/2+10*sfac[46]);
bl[46]=nx[46]-(tBox.width/2+10*sfac[46]);
br[46]=nx[46]+(tBox.width/2+10*sfac[46]);
var nwidth = br[46]-bl[46]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[46] = bl[46] - delta; 
    br[46] = br[46] + delta; 
} 
bb[46] = bb[46]+20; 
rect=paper.rect(bl[46], bt[46], br[46]-bl[46], bb[46]-bt[46], 10*sfac[46]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[46]-42,bb[46]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[46]-18,bb[46]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[46]+5,bb[46]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[46]+25,bb[46]-25,20,20); 
t.toFront(); 
b[46]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[47],ny[47]-10,'Ordinary Differential\nEquations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[47]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ordinary-Differential-Equations/#Ordinary Differential Equations", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[47]=ny[47]-10-(tBox.height/2+10*sfac[47]);
bb[47]=ny[47]-10+(tBox.height/2+10*sfac[47]);
bl[47]=nx[47]-(tBox.width/2+10*sfac[47]);
br[47]=nx[47]+(tBox.width/2+10*sfac[47]);
var nwidth = br[47]-bl[47]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[47] = bl[47] - delta; 
    br[47] = br[47] + delta; 
} 
bb[47] = bb[47]+20; 
rect=paper.rect(bl[47], bt[47], br[47]-bl[47], bb[47]-bt[47], 10*sfac[47]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[47]-42,bb[47]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[47]-18,bb[47]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[47]+5,bb[47]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[47]+25,bb[47]-25,20,20); 
t.toFront(); 
b[47]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[48],ny[48]-10,'Volumes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[48]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Volumes/#Volumes", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[48]=ny[48]-10-(tBox.height/2+10*sfac[48]);
bb[48]=ny[48]-10+(tBox.height/2+10*sfac[48]);
bl[48]=nx[48]-(tBox.width/2+10*sfac[48]);
br[48]=nx[48]+(tBox.width/2+10*sfac[48]);
var nwidth = br[48]-bl[48]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[48] = bl[48] - delta; 
    br[48] = br[48] + delta; 
} 
bb[48] = bb[48]+20; 
rect=paper.rect(bl[48], bt[48], br[48]-bl[48], bb[48]-bt[48], 10*sfac[48]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[48]-42,bb[48]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[48]-18,bb[48]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[48]+5,bb[48]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[48]+25,bb[48]-25,20,20); 
t.toFront(); 
b[48]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[49],ny[49],'Taylor and Maclaurin\nSeries').attr({fill:"#666666","font-size": 14*sfac[49]});
tBox=t.getBBox(); 
bt[49]=ny[49]-(tBox.height/2+10*sfac[49]);
bb[49]=ny[49]+(tBox.height/2+10*sfac[49]);
bl[49]=nx[49]-(tBox.width/2+10*sfac[49]);
br[49]=nx[49]+(tBox.width/2+10*sfac[49]);
rect=paper.rect(bl[49], bt[49], br[49]-bl[49], bb[49]-bt[49], 10*sfac[49]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[49]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[50],ny[50]-10,'Improper Integrals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[50]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Improper-Integrals/#Improper Integrals", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[50]=ny[50]-10-(tBox.height/2+10*sfac[50]);
bb[50]=ny[50]-10+(tBox.height/2+10*sfac[50]);
bl[50]=nx[50]-(tBox.width/2+10*sfac[50]);
br[50]=nx[50]+(tBox.width/2+10*sfac[50]);
var nwidth = br[50]-bl[50]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[50] = bl[50] - delta; 
    br[50] = br[50] + delta; 
} 
bb[50] = bb[50]+20; 
rect=paper.rect(bl[50], bt[50], br[50]-bl[50], bb[50]-bt[50], 10*sfac[50]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[50]-42,bb[50]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[50]-18,bb[50]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[50]+5,bb[50]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[50]+25,bb[50]-25,20,20); 
t.toFront(); 
b[50]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[51],ny[51]-10,'Calculations with Series').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[51]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Calculations-with-Series/#Calculations with Series", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[51]=ny[51]-10-(tBox.height/2+10*sfac[51]);
bb[51]=ny[51]-10+(tBox.height/2+10*sfac[51]);
bl[51]=nx[51]-(tBox.width/2+10*sfac[51]);
br[51]=nx[51]+(tBox.width/2+10*sfac[51]);
var nwidth = br[51]-bl[51]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[51] = bl[51] - delta; 
    br[51] = br[51] + delta; 
} 
bb[51] = bb[51]+20; 
rect=paper.rect(bl[51], bt[51], br[51]-bl[51], bb[51]-bt[51], 10*sfac[51]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[51]-42,bb[51]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[51]-18,bb[51]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[51]+5,bb[51]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[51]+25,bb[51]-25,20,20); 
t.toFront(); 
b[51]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[52],ny[52]-10,'Exponential Growth\nand Decay').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[52]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exponential-Growth-and-Decay/#Exponential Growth and Decay", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[52]=ny[52]-10-(tBox.height/2+10*sfac[52]);
bb[52]=ny[52]-10+(tBox.height/2+10*sfac[52]);
bl[52]=nx[52]-(tBox.width/2+10*sfac[52]);
br[52]=nx[52]+(tBox.width/2+10*sfac[52]);
var nwidth = br[52]-bl[52]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[52] = bl[52] - delta; 
    br[52] = br[52] + delta; 
} 
bb[52] = bb[52]+20; 
rect=paper.rect(bl[52], bt[52], br[52]-bl[52], bb[52]-bt[52], 10*sfac[52]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[52]-42,bb[52]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[52]-18,bb[52]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[52]+5,bb[52]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[52]+25,bb[52]-25,20,20); 
t.toFront(); 
b[52]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[53],ny[53]-10,'Series Without Negative\nTerms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[53]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Series-Without-Negative-Terms/#Series Without Negative Terms", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[53]=ny[53]-10-(tBox.height/2+10*sfac[53]);
bb[53]=ny[53]-10+(tBox.height/2+10*sfac[53]);
bl[53]=nx[53]-(tBox.width/2+10*sfac[53]);
br[53]=nx[53]+(tBox.width/2+10*sfac[53]);
var nwidth = br[53]-bl[53]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[53] = bl[53] - delta; 
    br[53] = br[53] + delta; 
} 
bb[53] = bb[53]+20; 
rect=paper.rect(bl[53], bt[53], br[53]-bl[53], bb[53]-bt[53], 10*sfac[53]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[53]-42,bb[53]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[53]-18,bb[53]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[53]+5,bb[53]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[53]+25,bb[53]-25,20,20); 
t.toFront(); 
b[53]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[54],ny[54],'Infinite Series').attr({fill:"#666666","font-size": 14*sfac[54]});
tBox=t.getBBox(); 
bt[54]=ny[54]-(tBox.height/2+10*sfac[54]);
bb[54]=ny[54]+(tBox.height/2+10*sfac[54]);
bl[54]=nx[54]-(tBox.width/2+10*sfac[54]);
br[54]=nx[54]+(tBox.width/2+10*sfac[54]);
rect=paper.rect(bl[54], bt[54], br[54]-bl[54], bb[54]-bt[54], 10*sfac[54]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[54]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[55],ny[55],'Transcendental\nFunctions').attr({fill:"#666666","font-size": 14*sfac[55]});
tBox=t.getBBox(); 
bt[55]=ny[55]-(tBox.height/2+10*sfac[55]);
bb[55]=ny[55]+(tBox.height/2+10*sfac[55]);
bl[55]=nx[55]-(tBox.width/2+10*sfac[55]);
br[55]=nx[55]+(tBox.width/2+10*sfac[55]);
rect=paper.rect(bl[55], bt[55], br[55]-bl[55], bb[55]-bt[55], 10*sfac[55]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[55]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[56],ny[56]-10,'Finding Limits').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[56]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Finding-Limits/#Finding Limits", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[56]=ny[56]-10-(tBox.height/2+10*sfac[56]);
bb[56]=ny[56]-10+(tBox.height/2+10*sfac[56]);
bl[56]=nx[56]-(tBox.width/2+10*sfac[56]);
br[56]=nx[56]+(tBox.width/2+10*sfac[56]);
var nwidth = br[56]-bl[56]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[56] = bl[56] - delta; 
    br[56] = br[56] + delta; 
} 
bb[56] = bb[56]+20; 
rect=paper.rect(bl[56], bt[56], br[56]-bl[56], bb[56]-bt[56], 10*sfac[56]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[56]-42,bb[56]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[56]-18,bb[56]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[56]+5,bb[56]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[56]+25,bb[56]-25,20,20); 
t.toFront(); 
b[56]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[57],ny[57]-10,'Power Series').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[57]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Power-Series/#Power Series", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[57]=ny[57]-10-(tBox.height/2+10*sfac[57]);
bb[57]=ny[57]-10+(tBox.height/2+10*sfac[57]);
bl[57]=nx[57]-(tBox.width/2+10*sfac[57]);
br[57]=nx[57]+(tBox.width/2+10*sfac[57]);
var nwidth = br[57]-bl[57]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[57] = bl[57] - delta; 
    br[57] = br[57] + delta; 
} 
bb[57] = bb[57]+20; 
rect=paper.rect(bl[57], bt[57], br[57]-bl[57], bb[57]-bt[57], 10*sfac[57]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[57]-42,bb[57]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[57]-18,bb[57]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[57]+5,bb[57]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[57]+25,bb[57]-25,20,20); 
t.toFront(); 
b[57]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[58],ny[58]-10,'Series With Odd or Even\nNegative Terms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[58]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Series-With-Odd-or-Even-Negative-Terms/#Series With Odd or Even Negative Terms", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[58]=ny[58]-10-(tBox.height/2+10*sfac[58]);
bb[58]=ny[58]-10+(tBox.height/2+10*sfac[58]);
bl[58]=nx[58]-(tBox.width/2+10*sfac[58]);
br[58]=nx[58]+(tBox.width/2+10*sfac[58]);
var nwidth = br[58]-bl[58]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[58] = bl[58] - delta; 
    br[58] = br[58] + delta; 
} 
bb[58] = bb[58]+20; 
rect=paper.rect(bl[58], bt[58], br[58]-bl[58], bb[58]-bt[58], 10*sfac[58]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[58]-42,bb[58]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[58]-18,bb[58]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[58]+5,bb[58]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[58]+25,bb[58]-25,20,20); 
t.toFront(); 
b[58]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[59],ny[59]-10,'Models and Data').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[59]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Models-and-Data/#Models and Data", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[59]=ny[59]-10-(tBox.height/2+10*sfac[59]);
bb[59]=ny[59]-10+(tBox.height/2+10*sfac[59]);
bl[59]=nx[59]-(tBox.width/2+10*sfac[59]);
br[59]=nx[59]+(tBox.width/2+10*sfac[59]);
var nwidth = br[59]-bl[59]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[59] = bl[59] - delta; 
    br[59] = br[59] + delta; 
} 
bb[59] = bb[59]+20; 
rect=paper.rect(bl[59], bt[59], br[59]-bl[59], bb[59]-bt[59], 10*sfac[59]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[59]-42,bb[59]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[59]-18,bb[59]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[59]+5,bb[59]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[59]+25,bb[59]-25,20,20); 
t.toFront(); 
b[59]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[60],ny[60]-10,'The Chain Rule').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[60]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Chain-Rule/#The Chain Rule", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[60]=ny[60]-10-(tBox.height/2+10*sfac[60]);
bb[60]=ny[60]-10+(tBox.height/2+10*sfac[60]);
bl[60]=nx[60]-(tBox.width/2+10*sfac[60]);
br[60]=nx[60]+(tBox.width/2+10*sfac[60]);
var nwidth = br[60]-bl[60]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[60] = bl[60] - delta; 
    br[60] = br[60] + delta; 
} 
bb[60] = bb[60]+20; 
rect=paper.rect(bl[60], bt[60], br[60]-bl[60], bb[60]-bt[60], 10*sfac[60]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[60]-42,bb[60]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[60]-18,bb[60]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[60]+5,bb[60]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[60]+25,bb[60]-25,20,20); 
t.toFront(); 
b[60]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[61],ny[61]-10,'The Second Derivative\nTest').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[61]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Second-Derivative-Test/#The Second Derivative Test", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[61]=ny[61]-10-(tBox.height/2+10*sfac[61]);
bb[61]=ny[61]-10+(tBox.height/2+10*sfac[61]);
bl[61]=nx[61]-(tBox.width/2+10*sfac[61]);
br[61]=nx[61]+(tBox.width/2+10*sfac[61]);
var nwidth = br[61]-bl[61]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[61] = bl[61] - delta; 
    br[61] = br[61] + delta; 
} 
bb[61] = bb[61]+20; 
rect=paper.rect(bl[61], bt[61], br[61]-bl[61], bb[61]-bt[61], 10*sfac[61]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[61]-42,bb[61]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[61]-18,bb[61]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[61]+5,bb[61]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[61]+25,bb[61]-25,20,20); 
t.toFront(); 
b[61]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[62],ny[62]-10,"L'Hospital's Rule").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[62]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/L’Hospital’s-Rule/#L'Hospital's Rule", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[62]=ny[62]-10-(tBox.height/2+10*sfac[62]);
bb[62]=ny[62]-10+(tBox.height/2+10*sfac[62]);
bl[62]=nx[62]-(tBox.width/2+10*sfac[62]);
br[62]=nx[62]+(tBox.width/2+10*sfac[62]);
var nwidth = br[62]-bl[62]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[62] = bl[62] - delta; 
    br[62] = br[62] + delta; 
} 
bb[62] = bb[62]+20; 
rect=paper.rect(bl[62], bt[62], br[62]-bl[62], bb[62]-bt[62], 10*sfac[62]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[62]-42,bb[62]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[62]-18,bb[62]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[62]+5,bb[62]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[62]+25,bb[62]-25,20,20); 
t.toFront(); 
b[62]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[63],ny[63]-10,'Implicit Differentiation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[63]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Implicit-Differentiation/#Implicit Differentiation", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[63]=ny[63]-10-(tBox.height/2+10*sfac[63]);
bb[63]=ny[63]-10+(tBox.height/2+10*sfac[63]);
bl[63]=nx[63]-(tBox.width/2+10*sfac[63]);
br[63]=nx[63]+(tBox.width/2+10*sfac[63]);
var nwidth = br[63]-bl[63]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[63] = bl[63] - delta; 
    br[63] = br[63] + delta; 
} 
bb[63] = bb[63]+20; 
rect=paper.rect(bl[63], bt[63], br[63]-bl[63], bb[63]-bt[63], 10*sfac[63]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[63]-42,bb[63]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[63]-18,bb[63]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[63]+5,bb[63]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[63]+25,bb[63]-25,20,20); 
t.toFront(); 
b[63]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[64],ny[64]-10,'Integration by Parts').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[64]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Integration-By-Parts/#Integration by Parts", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[64]=ny[64]-10-(tBox.height/2+10*sfac[64]);
bb[64]=ny[64]-10+(tBox.height/2+10*sfac[64]);
bl[64]=nx[64]-(tBox.width/2+10*sfac[64]);
br[64]=nx[64]+(tBox.width/2+10*sfac[64]);
var nwidth = br[64]-bl[64]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[64] = bl[64] - delta; 
    br[64] = br[64] + delta; 
} 
bb[64] = bb[64]+20; 
rect=paper.rect(bl[64], bt[64], br[64]-bl[64], bb[64]-bt[64], 10*sfac[64]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[64]-42,bb[64]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[64]-18,bb[64]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[64]+5,bb[64]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[64]+25,bb[64]-25,20,20); 
t.toFront(); 
b[64]=paper.setFinish(); 

bb[65]= ny[65]; 
bt[65]= ny[65]; 
bl[65]= nx[65]; 
br[65]= nx[65]; 

bb[66]= ny[66]; 
bt[66]= ny[66]; 
bl[66]= nx[66]; 
br[66]= nx[66]; 

drawLines(); 
boxClick(); 
boxHover(); 
} 

function boxClick() { 

b[0].click(function() {recenter(0);}); 
b[1].click(function() {recenter(1);}); 
b[2].click(function() {recenter(2);}); 
b[3].click(function() {recenter(3);}); 
b[4].click(function() {recenter(4);}); 
b[5].click(function() {recenter(5);}); 
b[6].click(function() {recenter(6);}); 
b[7].click(function() {recenter(7);}); 
b[8].click(function() {recenter(8);}); 
b[9].click(function() {recenter(9);}); 
b[10].click(function() {recenter(10);}); 
b[11].click(function() {recenter(11);}); 
b[12].click(function() {recenter(12);}); 
b[13].click(function() {recenter(13);}); 
b[14].click(function() {recenter(14);}); 
b[15].click(function() {recenter(15);}); 
b[16].click(function() {recenter(16);}); 
b[17].click(function() {recenter(17);}); 
b[18].click(function() {recenter(18);}); 
b[19].click(function() {recenter(19);}); 
b[20].click(function() {recenter(20);}); 
b[21].click(function() {recenter(21);}); 
b[22].click(function() {recenter(22);}); 
b[23].click(function() {recenter(23);}); 
b[24].click(function() {recenter(24);}); 
b[25].click(function() {recenter(25);}); 
b[26].click(function() {recenter(26);}); 
b[27].click(function() {recenter(27);}); 
b[28].click(function() {recenter(28);}); 
b[29].click(function() {recenter(29);}); 
b[30].click(function() {recenter(30);}); 
b[31].click(function() {recenter(31);}); 
b[32].click(function() {recenter(32);}); 
b[33].click(function() {recenter(33);}); 
b[34].click(function() {recenter(34);}); 
b[35].click(function() {recenter(35);}); 
b[36].click(function() {recenter(36);}); 
b[37].click(function() {recenter(37);}); 
b[38].click(function() {recenter(38);}); 
b[39].click(function() {recenter(39);}); 
b[40].click(function() {recenter(40);}); 
b[41].click(function() {recenter(41);}); 
b[42].click(function() {recenter(42);}); 
b[43].click(function() {recenter(43);}); 
b[44].click(function() {recenter(44);}); 
b[45].click(function() {recenter(45);}); 
b[46].click(function() {recenter(46);}); 
b[47].click(function() {recenter(47);}); 
b[48].click(function() {recenter(48);}); 
b[49].click(function() {recenter(49);}); 
b[50].click(function() {recenter(50);}); 
b[51].click(function() {recenter(51);}); 
b[52].click(function() {recenter(52);}); 
b[53].click(function() {recenter(53);}); 
b[54].click(function() {recenter(54);}); 
b[55].click(function() {recenter(55);}); 
b[56].click(function() {recenter(56);}); 
b[57].click(function() {recenter(57);}); 
b[58].click(function() {recenter(58);}); 
b[59].click(function() {recenter(59);}); 
b[60].click(function() {recenter(60);}); 
b[61].click(function() {recenter(61);}); 
b[62].click(function() {recenter(62);}); 
b[63].click(function() {recenter(63);}); 
b[64].click(function() {recenter(64);}); 
} 

function boxHover() { 

b[0].hover(function() {nodeHover(0);}, function() {nodeUnhover(0);}); 
b[1].hover(function() {nodeHover(1);}, function() {nodeUnhover(1);}); 
b[2].hover(function() {nodeHover(2);}, function() {nodeUnhover(2);}); 
b[3].hover(function() {nodeHover(3);}, function() {nodeUnhover(3);}); 
b[4].hover(function() {nodeHover(4);}, function() {nodeUnhover(4);}); 
b[5].hover(function() {nodeHover(5);}, function() {nodeUnhover(5);}); 
b[6].hover(function() {nodeHover(6);}, function() {nodeUnhover(6);}); 
b[7].hover(function() {nodeHover(7);}, function() {nodeUnhover(7);}); 
b[8].hover(function() {nodeHover(8);}, function() {nodeUnhover(8);}); 
b[9].hover(function() {nodeHover(9);}, function() {nodeUnhover(9);}); 
b[10].hover(function() {nodeHover(10);}, function() {nodeUnhover(10);}); 
b[11].hover(function() {nodeHover(11);}, function() {nodeUnhover(11);}); 
b[12].hover(function() {nodeHover(12);}, function() {nodeUnhover(12);}); 
b[13].hover(function() {nodeHover(13);}, function() {nodeUnhover(13);}); 
b[14].hover(function() {nodeHover(14);}, function() {nodeUnhover(14);}); 
b[15].hover(function() {nodeHover(15);}, function() {nodeUnhover(15);}); 
b[16].hover(function() {nodeHover(16);}, function() {nodeUnhover(16);}); 
b[17].hover(function() {nodeHover(17);}, function() {nodeUnhover(17);}); 
b[18].hover(function() {nodeHover(18);}, function() {nodeUnhover(18);}); 
b[19].hover(function() {nodeHover(19);}, function() {nodeUnhover(19);}); 
b[20].hover(function() {nodeHover(20);}, function() {nodeUnhover(20);}); 
b[21].hover(function() {nodeHover(21);}, function() {nodeUnhover(21);}); 
b[22].hover(function() {nodeHover(22);}, function() {nodeUnhover(22);}); 
b[23].hover(function() {nodeHover(23);}, function() {nodeUnhover(23);}); 
b[24].hover(function() {nodeHover(24);}, function() {nodeUnhover(24);}); 
b[25].hover(function() {nodeHover(25);}, function() {nodeUnhover(25);}); 
b[26].hover(function() {nodeHover(26);}, function() {nodeUnhover(26);}); 
b[27].hover(function() {nodeHover(27);}, function() {nodeUnhover(27);}); 
b[28].hover(function() {nodeHover(28);}, function() {nodeUnhover(28);}); 
b[29].hover(function() {nodeHover(29);}, function() {nodeUnhover(29);}); 
b[30].hover(function() {nodeHover(30);}, function() {nodeUnhover(30);}); 
b[31].hover(function() {nodeHover(31);}, function() {nodeUnhover(31);}); 
b[32].hover(function() {nodeHover(32);}, function() {nodeUnhover(32);}); 
b[33].hover(function() {nodeHover(33);}, function() {nodeUnhover(33);}); 
b[34].hover(function() {nodeHover(34);}, function() {nodeUnhover(34);}); 
b[35].hover(function() {nodeHover(35);}, function() {nodeUnhover(35);}); 
b[36].hover(function() {nodeHover(36);}, function() {nodeUnhover(36);}); 
b[37].hover(function() {nodeHover(37);}, function() {nodeUnhover(37);}); 
b[38].hover(function() {nodeHover(38);}, function() {nodeUnhover(38);}); 
b[39].hover(function() {nodeHover(39);}, function() {nodeUnhover(39);}); 
b[40].hover(function() {nodeHover(40);}, function() {nodeUnhover(40);}); 
b[41].hover(function() {nodeHover(41);}, function() {nodeUnhover(41);}); 
b[42].hover(function() {nodeHover(42);}, function() {nodeUnhover(42);}); 
b[43].hover(function() {nodeHover(43);}, function() {nodeUnhover(43);}); 
b[44].hover(function() {nodeHover(44);}, function() {nodeUnhover(44);}); 
b[45].hover(function() {nodeHover(45);}, function() {nodeUnhover(45);}); 
b[46].hover(function() {nodeHover(46);}, function() {nodeUnhover(46);}); 
b[47].hover(function() {nodeHover(47);}, function() {nodeUnhover(47);}); 
b[48].hover(function() {nodeHover(48);}, function() {nodeUnhover(48);}); 
b[49].hover(function() {nodeHover(49);}, function() {nodeUnhover(49);}); 
b[50].hover(function() {nodeHover(50);}, function() {nodeUnhover(50);}); 
b[51].hover(function() {nodeHover(51);}, function() {nodeUnhover(51);}); 
b[52].hover(function() {nodeHover(52);}, function() {nodeUnhover(52);}); 
b[53].hover(function() {nodeHover(53);}, function() {nodeUnhover(53);}); 
b[54].hover(function() {nodeHover(54);}, function() {nodeUnhover(54);}); 
b[55].hover(function() {nodeHover(55);}, function() {nodeUnhover(55);}); 
b[56].hover(function() {nodeHover(56);}, function() {nodeUnhover(56);}); 
b[57].hover(function() {nodeHover(57);}, function() {nodeUnhover(57);}); 
b[58].hover(function() {nodeHover(58);}, function() {nodeUnhover(58);}); 
b[59].hover(function() {nodeHover(59);}, function() {nodeUnhover(59);}); 
b[60].hover(function() {nodeHover(60);}, function() {nodeUnhover(60);}); 
b[61].hover(function() {nodeHover(61);}, function() {nodeUnhover(61);}); 
b[62].hover(function() {nodeHover(62);}, function() {nodeUnhover(62);}); 
b[63].hover(function() {nodeHover(63);}, function() {nodeUnhover(63);}); 
b[64].hover(function() {nodeHover(64);}, function() {nodeUnhover(64);}); 
} 

function drawLines() { 

var mid; 
var s1; 
var s2; 
var s3; 
var v1; 
var v2; 
var hleft; 
var hright; 
var h; 
var lines = []; 
var lineNodes = []; 

paper.setStart(); 
mid=bb[1]+(bt[48]-bb[1])/2; 
s2='M '+nx[1]+' '+bb[1]+' L '+nx[1]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[26]+' '+mid+' L '+nx[26]+' '+bt[26];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[1,26]; 

paper.setStart(); 
mid=bb[1]+(bt[48]-bb[1])/2; 
hleft = nx[25]; 
hright = nx[1]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[25]+' '+mid+' L '+nx[25]+' '+bt[25];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[1,25]; 

paper.setStart(); 
mid=bb[1]+(bt[48]-bb[1])/2; 
hleft = nx[28]; 
hright = nx[1]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[28]+' '+mid+' L '+nx[28]+' '+bt[28];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[1,28]; 

paper.setStart(); 
mid=bb[1]+(bt[48]-bb[1])/2; 
s3='M '+nx[19]+' '+mid+' L '+nx[19]+' '+bt[19];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[1,19]; 

paper.setStart(); 
mid=bb[1]+(bt[48]-bb[1])/2; 
s3='M '+nx[48]+' '+mid+' L '+nx[48]+' '+bt[48];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[1,48]; 

paper.setStart(); 
s1='M '+nx[3]+' '+bb[3]+' L '+nx[3]+' '+bt[61]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[3,61] ; 

paper.setStart(); 
s1='M '+nx[4]+' '+bb[4]+' L '+nx[4]+' '+bt[53]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[4,53] ; 

paper.setStart(); 
mid=bb[6]+(bt[9]-bb[6])/2; 
hleft = nx[24]; 
hright = nx[6]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[6]+' '+bb[6]+' L '+nx[6]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[24]+' '+mid+' L '+nx[24]+' '+bt[24];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[6,24]; 

paper.setStart(); 
mid=bb[6]+(bt[9]-bb[6])/2; 
s3='M '+nx[5]+' '+mid+' L '+nx[5]+' '+bt[5];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[6,5]; 

paper.setStart(); 
mid=bb[6]+(bt[9]-bb[6])/2; 
s3='M '+nx[3]+' '+mid+' L '+nx[3]+' '+bt[3];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[6,3]; 

paper.setStart(); 
mid=bb[6]+(bt[9]-bb[6])/2; 
hleft = nx[18]; 
hright = nx[6]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[18]+' '+mid+' L '+nx[18]+' '+bt[18];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[6,18]; 

paper.setStart(); 
mid=bb[6]+(bt[9]-bb[6])/2; 
s3='M '+nx[44]+' '+mid+' L '+nx[44]+' '+bt[44];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[6,44]; 

paper.setStart(); 
mid=bb[6]+(bt[9]-bb[6])/2; 
s3='M '+nx[9]+' '+mid+' L '+nx[9]+' '+bt[9];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[6,9]; 

paper.setStart(); 
mid=bb[7]+(bt[42]-bb[7])/2; 
hleft = nx[42]; 
hright = nx[7]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[7]+' '+bb[7]+' L '+nx[7]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[42]+' '+mid+' L '+nx[42]+' '+bt[42];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[7,42]; 

paper.setStart(); 
mid=bb[7]+(bt[42]-bb[7])/2; 
hleft = nx[37]; 
hright = nx[7]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[37]+' '+mid+' L '+nx[37]+' '+bt[37];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[7,37]; 

paper.setStart(); 
s1='M '+nx[10]+' '+bb[10]+' L '+nx[10]+' '+bt[30]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[10,30] ; 

paper.setStart(); 
s1='M '+nx[11]+' '+bb[11]+' L '+nx[11]+' '+bt[64]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[11,64] ; 

paper.setStart(); 
s1='M '+nx[12]+' '+bb[12]+' L '+nx[12]+' '+bt[45]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[12,45] ; 

paper.setStart(); 
s1='M '+nx[13]+' '+bb[13]+' L '+nx[13]+' '+bt[39]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[13,39] ; 

paper.setStart(); 
s1='M '+nx[14]+' '+bb[14]+' L '+nx[14]+' '+bt[0]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[14,0] ; 

paper.setStart(); 
s1='M '+nx[16]+' '+bb[16]+' L '+nx[16]+' '+bt[22]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[16,22] ; 

paper.setStart(); 
mid=bb[17]+(bt[6]-bb[17])/2; 
hleft = nx[6]; 
hright = nx[17]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[17]+' '+bb[17]+' L '+nx[17]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[6]+' '+mid+' L '+nx[6]+' '+bt[6];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[17,6]; 

paper.setStart(); 
mid=bb[17]+(bt[6]-bb[17])/2; 
s3='M '+nx[60]+' '+mid+' L '+nx[60]+' '+bt[60];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[17,60]; 

paper.setStart(); 
mid=bb[17]+(bt[6]-bb[17])/2; 
hleft = nx[15]; 
hright = nx[17]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[15]+' '+mid+' L '+nx[15]+' '+bt[15];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[17,15]; 

paper.setStart(); 
s1='M '+nx[20]+' '+bb[20]+' L '+nx[20]+' '+bt[27]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[20,27] ; 

paper.setStart(); 
mid=bb[21]+(bt[52]-bb[21])/2; 
hleft = nx[52]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[21]+' '+bb[21]+' L '+nx[21]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[52]+' '+mid+' L '+nx[52]+' '+bt[52];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[21,52]; 

paper.setStart(); 
mid=bb[21]+(bt[52]-bb[21])/2; 
hleft = nx[8]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[8]+' '+mid+' L '+nx[8]+' '+bt[8];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[21,8]; 

paper.setStart(); 
mid=bb[23]+(bt[66]-bb[23])/2; 
s2='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[35]+' '+mid+' L '+nx[35]+' '+bt[35];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[23,35]; 

paper.setStart(); 
mid=bb[23]+(bt[66]-bb[23])/2; 
hleft = nx[1]; 
hright = nx[23]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[1]+' '+mid+' L '+nx[1]+' '+bt[1];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[23,1]; 

paper.setStart(); 
mid=bb[23]+(bt[66]-bb[23])/2; 
s3='M '+nx[36]+' '+mid+' L '+nx[36]+' '+bt[36];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[23,36]; 

paper.setStart(); 
mid=bb[23]+(bt[66]-bb[23])/2; 
hleft = nx[66]; 
hright = nx[23]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[66]+' '+mid+' L '+nx[66]+' '+bt[66];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[23,66]; 

paper.setStart(); 
s1='M '+nx[27]+' '+bb[27]+' L '+nx[27]+' '+ny[65]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[27],nx[65])+' '+ny[65]+' L '+Math.max(nx[27],nx[65])+' '+ny[65]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[27,65]; 

paper.setStart(); 
s1='M '+nx[30]+' '+bb[30]+' L '+nx[30]+' '+bt[59]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[30,59] ; 

paper.setStart(); 
mid=bb[28]+(bt[11]-bb[28])/2; 
hleft = nx[47]; 
hright = nx[31]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[31]+' '+bb[31]+' L '+nx[31]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[47]+' '+mid+' L '+nx[47]+' '+bt[47];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[31,47]; 

paper.setStart(); 
mid=bb[28]+(bt[11]-bb[28])/2; 
s3='M '+nx[14]+' '+mid+' L '+nx[14]+' '+bt[14];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[31,14]; 

paper.setStart(); 
mid=bb[28]+(bt[11]-bb[28])/2; 
s3='M '+nx[50]+' '+mid+' L '+nx[50]+' '+bt[50];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[31,50]; 

paper.setStart(); 
mid=bb[28]+(bt[11]-bb[28])/2; 
hleft = nx[11]; 
hright = nx[31]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[11]+' '+mid+' L '+nx[11]+' '+bt[11];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[31,11]; 

paper.setStart(); 
mid=bb[28]+(bt[11]-bb[28])/2; 
s3='M '+nx[29]+' '+mid+' L '+nx[29]+' '+bt[29];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[31,29]; 

paper.setStart(); 
s1='M '+nx[32]+' '+bb[32]+' L '+nx[32]+' '+bt[34]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[32,34] ; 

paper.setStart(); 
mid=bb[33]+(bt[17]-bb[33])/2; 
s2='M '+nx[33]+' '+bb[33]+' L '+nx[33]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[2]+' '+mid+' L '+nx[2]+' '+bt[2];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[33,2]; 

paper.setStart(); 
mid=bb[33]+(bt[17]-bb[33])/2; 
hleft = nx[66]; 
hright = nx[33]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[66]+' '+mid+' L '+nx[66]+' '+bt[66];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[33,66]; 

paper.setStart(); 
mid=bb[33]+(bt[17]-bb[33])/2; 
hleft = nx[17]; 
hright = nx[33]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[17]+' '+mid+' L '+nx[17]+' '+bt[17];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[33,17]; 

paper.setStart(); 
mid=bb[34]+(bt[56]-bb[34])/2; 
hleft = nx[10]; 
hright = nx[34]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[34]+' '+bb[34]+' L '+nx[34]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[10]+' '+mid+' L '+nx[10]+' '+bt[10];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[34,10]; 

paper.setStart(); 
mid=bb[34]+(bt[56]-bb[34])/2; 
hleft = nx[20]; 
hright = nx[34]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[20]+' '+mid+' L '+nx[20]+' '+bt[20];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[34,20]; 

paper.setStart(); 
mid=bb[34]+(bt[56]-bb[34])/2; 
s3='M '+nx[56]+' '+mid+' L '+nx[56]+' '+bt[56];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[34,56]; 

paper.setStart(); 
s1='M '+nx[36]+' '+bb[36]+' L '+nx[36]+' '+bt[31]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[36,31] ; 

paper.setStart(); 
s1='M '+nx[38]+' '+bb[38]+' L '+nx[38]+' '+bt[7]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[38,7] ; 

paper.setStart(); 
s1='M '+nx[39]+' '+bb[39]+' L '+nx[39]+' '+bt[33]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[39,33] ; 

paper.setStart(); 
s1='M '+nx[40]+' '+bb[40]+' L '+nx[40]+' '+bt[4]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[40,4] ; 

paper.setStart(); 
s1='M '+nx[41]+' '+bb[41]+' L '+nx[41]+' '+bt[23]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[49]=paper.setFinish(); 
lineNodes[49]=[41,23] ; 

paper.setStart(); 
s1='M '+nx[42]+' '+bb[42]+' L '+nx[42]+' '+bt[41]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[42,41] ; 

paper.setStart(); 
s1='M '+nx[45]+' '+bb[45]+' L '+nx[45]+' '+ny[65]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[45],nx[65])+' '+ny[65]+' L '+Math.max(nx[45],nx[65])+' '+ny[65]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[45,65]; 

paper.setStart(); 
s1='M '+nx[49]+' '+bb[49]+' L '+nx[49]+' '+bt[51]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[49,51] ; 

paper.setStart(); 
s1='M '+nx[53]+' '+bb[53]+' L '+nx[53]+' '+bt[58]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[53,58] ; 

paper.setStart(); 
s1='M '+nx[54]+' '+bb[54]+' L '+nx[54]+' '+bt[40]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[54,40] ; 

paper.setStart(); 
mid=bb[55]+(bt[62]-bb[55])/2; 
hleft = nx[16]; 
hright = nx[55]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[55]+' '+bb[55]+' L '+nx[55]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[16]+' '+mid+' L '+nx[16]+' '+bt[16];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[55,16]; 

paper.setStart(); 
mid=bb[55]+(bt[62]-bb[55])/2; 
hleft = nx[62]; 
hright = nx[55]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[62]+' '+mid+' L '+nx[62]+' '+bt[62];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[55,62]; 

paper.setStart(); 
mid=bb[55]+(bt[62]-bb[55])/2; 
s3='M '+nx[21]+' '+mid+' L '+nx[21]+' '+bt[21];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[55,21]; 

paper.setStart(); 
s1='M '+nx[56]+' '+bb[56]+' L '+nx[56]+' '+bt[12]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[56,12] ; 

paper.setStart(); 
s1='M '+nx[57]+' '+bb[57]+' L '+nx[57]+' '+bt[49]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[57,49] ; 

paper.setStart(); 
s1='M '+nx[58]+' '+bb[58]+' L '+nx[58]+' '+bt[57]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[58,57] ; 

paper.setStart(); 
s1='M '+nx[59]+' '+bb[59]+' L '+nx[59]+' '+ny[65]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[59],nx[65])+' '+ny[65]+' L '+Math.max(nx[59],nx[65])+' '+ny[65]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[59,65]; 

paper.setStart(); 
s1='M '+nx[60]+' '+bb[60]+' L '+nx[60]+' '+bt[63]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[60,63] ; 

paper.setStart(); 
s1='M '+nx[61]+' '+bb[61]+' L '+nx[61]+' '+bt[43]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[61,43] ; 

paper.setStart(); 
mid=bb[65]+(bt[38]-bb[65])/2; 
hleft = nx[13]; 
hright = nx[65]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[65]+' '+bb[65]+' L '+nx[65]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[13]+' '+mid+' L '+nx[13]+' '+bt[13];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[65,13]; 

paper.setStart(); 
mid=bb[65]+(bt[38]-bb[65])/2; 
hleft = nx[38]; 
hright = nx[65]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[38]+' '+mid+' L '+nx[38]+' '+bt[38];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[65,38]; 

paper.setStart(); 
mid=bb[64]+(bt[54]-bb[64])/2; 
s2='M '+nx[66]+' '+bb[66]+' L '+nx[66]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[55]+' '+mid+' L '+nx[55]+' '+bt[55];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[66,55]; 

paper.setStart(); 
mid=bb[64]+(bt[54]-bb[64])/2; 
hleft = nx[46]; 
hright = nx[66]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[46]+' '+mid+' L '+nx[46]+' '+bt[46];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[66,46]; 

paper.setStart(); 
mid=bb[64]+(bt[54]-bb[64])/2; 
hleft = nx[54]; 
hright = nx[66]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[54]+' '+mid+' L '+nx[54]+' '+bt[54];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[66,54]; 

nlines = 69;
}