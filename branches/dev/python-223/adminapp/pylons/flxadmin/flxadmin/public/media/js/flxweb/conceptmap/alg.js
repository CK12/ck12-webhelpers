function initMap() { 

// Set size parameters 
mapWidth = 2186; 
mapHeight = 3851; 
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
rootx = 896; 
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

nnodes = 90; 
njunc = 3; 

nx[0]=786;
ny[0]=2253;
nx[1]=257;
ny[1]=1998;
nx[2]=1128;
ny[2]=2250;
nx[3]=1211;
ny[3]=3492;
nx[4]=1521;
ny[4]=3122;
nx[5]=1658;
ny[5]=2767;
nx[6]=446;
ny[6]=459;
nx[7]=392;
ny[7]=1866;
nx[8]=1848;
ny[8]=2769;
nx[9]=446;
ny[9]=1448;
nx[10]=446;
ny[10]=1063;
nx[11]=896;
ny[11]=100;
nx[12]=750;
ny[12]=1058;
nx[13]=1530;
ny[13]=1229;
nx[14]=1073;
ny[14]=3232;
nx[15]=1320;
ny[15]=710;
nx[16]=1986;
ny[16]=2902;
nx[17]=685;
ny[17]=2005;
nx[18]=344;
ny[18]=609;
nx[19]=1304;
ny[19]=2857;
nx[20]=1025;
ny[20]=1999;
nx[21]=1364;
ny[21]=3258;
nx[22]=551;
ny[22]=721;
nx[23]=1302;
ny[23]=2973;
nx[24]=446;
ny[24]=354;
nx[25]=390;
ny[25]=1750;
nx[26]=1658;
ny[26]=2643;
nx[27]=1302;
ny[27]=2375;
nx[28]=1322;
ny[28]=360;
nx[29]=749;
ny[29]=941;
nx[30]=1302;
ny[30]=2741;
nx[31]=1685;
ny[31]=3259;
nx[32]=342;
ny[32]=720;
nx[33]=446;
ny[33]=937;
nx[34]=530;
ny[34]=2005;
nx[35]=920;
ny[35]=3366;
nx[36]=392;
ny[36]=1998;
nx[37]=861;
ny[37]=2005;
nx[38]=392;
ny[38]=2120;
nx[39]=1302;
ny[39]=2631;
nx[40]=750;
ny[40]=1183;
nx[41]=1211;
ny[41]=3751;
nx[42]=1522;
ny[42]=710;
nx[43]=1521;
ny[43]=3258;
nx[44]=1709;
ny[44]=2902;
nx[45]=1322;
ny[45]=254;
nx[46]=592;
ny[46]=2449;
nx[47]=1320;
ny[47]=582;
nx[48]=791;
ny[48]=2451;
nx[49]=1530;
ny[49]=1118;
nx[50]=1174;
ny[50]=710;
nx[51]=589;
ny[51]=2251;
nx[52]=1848;
ny[52]=2902;
nx[53]=520;
ny[53]=1582;
nx[54]=446;
ny[54]=250;
nx[55]=1447;
ny[55]=877;
nx[56]=686;
ny[56]=2117;
nx[57]=1986;
ny[57]=3022;
nx[58]=1073;
ny[58]=3121;
nx[59]=1369;
ny[59]=1014;
nx[60]=1986;
ny[60]=3143;
nx[61]=446;
ny[61]=1188;
nx[62]=200;
ny[62]=1069;
nx[63]=831;
ny[63]=1445;
nx[64]=200;
ny[64]=939;
nx[65]=550;
ny[65]=610;
nx[66]=1213;
ny[66]=1999;
nx[67]=1302;
ny[67]=2502;
nx[68]=1302;
ny[68]=2250;
nx[69]=1027;
ny[69]=2117;
nx[70]=1530;
ny[70]=1345;
nx[71]=750;
ny[71]=1312;
nx[72]=1484;
ny[72]=2767;
nx[73]=542;
ny[73]=1311;
nx[74]=1073;
ny[74]=3367;
nx[75]=951;
ny[75]=1866;
nx[76]=1320;
ny[76]=470;
nx[77]=1211;
ny[77]=3623;
nx[78]=1530;
ny[78]=1009;
nx[79]=347;
ny[79]=1311;
nx[80]=360;
ny[80]=1582;
nx[81]=1104;
ny[81]=2627;
nx[82]=676;
ny[82]=1454;
nx[83]=951;
ny[83]=1752;
nx[84]=833;
ny[84]=1553;
nx[85]=1211;
ny[85]=3368;
nx[86]=1214;
ny[86]=2122;
nx[87]=446;
ny[87]=1372;
nx[88]=689;
ny[88]=2326;
nx[89]=447;
ny[89]=794;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[88, 56, 51]; 
members[1]=[17, 34, 36, 7]; 
members[2]=[68, 86]; 
members[3]=[77, 85]; 
members[4]=[43, 21, 23, 58, 31]; 
members[5]=[72, 8, 26]; 
members[6]=[24, 65, 18]; 
members[7]=[1, 34, 36, 17, 25]; 
members[8]=[5, 72, 44, 16, 52, 26]; 
members[9]=[80, 53, 87]; 
members[10]=[33, 61]; 
members[11]=[45, 54]; 
members[12]=[40, 29]; 
members[13]=[49, 70]; 
members[14]=[58, 74, 35, 85]; 
members[15]=[66, 42, 50, 55, 47]; 
members[16]=[8, 57, 44, 52]; 
members[17]=[1, 34, 36, 37, 7, 75, 66, 20, 56]; 
members[18]=[32, 65, 6]; 
members[19]=[30, 23]; 
members[20]=[66, 69, 75, 17, 37]; 
members[21]=[43, 4, 31]; 
members[22]=[89, 65]; 
members[23]=[58, 19, 4]; 
members[24]=[54, 6]; 
members[25]=[82, 83, 7]; 
members[26]=[67, 5, 81, 72, 39, 8]; 
members[27]=[67, 68]; 
members[28]=[76, 45]; 
members[29]=[64, 89, 12, 33]; 
members[30]=[19, 39]; 
members[31]=[43, 4, 21]; 
members[32]=[89, 18]; 
members[33]=[64, 89, 10, 29]; 
members[34]=[17, 36, 1, 7]; 
members[35]=[74, 85, 14]; 
members[36]=[1, 34, 38, 7, 17]; 
members[37]=[17, 66, 75, 20]; 
members[38]=[36]; 
members[39]=[81, 26, 67, 30]; 
members[40]=[12, 71]; 
members[41]=[77]; 
members[42]=[15, 50, 47]; 
members[43]=[4, 21, 31]; 
members[44]=[8, 16, 52]; 
members[45]=[11, 28, 54]; 
members[46]=[88, 48]; 
members[47]=[42, 76, 50, 15]; 
members[48]=[88, 46]; 
members[49]=[13, 78]; 
members[50]=[42, 15, 47]; 
members[51]=[88, 56, 0]; 
members[52]=[8, 16, 44]; 
members[53]=[80, 9]; 
members[54]=[24, 11, 45]; 
members[55]=[66, 59, 78, 15]; 
members[56]=[0, 17, 51]; 
members[57]=[16, 60]; 
members[58]=[4, 14, 23]; 
members[59]=[78, 55]; 
members[60]=[57]; 
members[61]=[73, 10, 79]; 
members[62]=[64]; 
members[63]=[82, 84, 71]; 
members[64]=[89, 29, 62, 33]; 
members[65]=[18, 6, 22]; 
members[66]=[37, 75, 15, 17, 20, 86, 55]; 
members[67]=[81, 26, 27, 39]; 
members[68]=[2, 27, 86]; 
members[69]=[20]; 
members[70]=[13]; 
members[71]=[40, 82, 63]; 
members[72]=[8, 26, 5]; 
members[73]=[79, 61, 87]; 
members[74]=[35, 85, 14]; 
members[75]=[66, 37, 17, 83, 20]; 
members[76]=[28, 47]; 
members[77]=[41, 3]; 
members[78]=[49, 59, 55]; 
members[79]=[73, 61, 87]; 
members[80]=[9, 53]; 
members[81]=[26, 67, 39]; 
members[82]=[25, 83, 63, 71]; 
members[83]=[25, 82, 75]; 
members[84]=[63]; 
members[85]=[35, 74, 3, 14]; 
members[86]=[2, 68, 66]; 
members[87]=[9, 79, 73]; 
members[88]=[48, 0, 51, 46]; 
members[89]=[64, 33, 32, 22, 29]; 

return members[i]; 
} 

function drawMap(sfac) { 

var t; 
var rect; 
var tbox; 

paper.clear(); 

paper.setStart(); 
t=paper.text(nx[0],ny[0]-10,'Solving Linear\nSystems by\nElimination').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[0]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Solving-Linear-Systems-by-Elimination/#Solving Linear Systems by Elimination", target: "_top"});
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
t=paper.text(nx[1],ny[1]-10,'Using\nInequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[1]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Using-Inequalities/#Using Inequalities", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[1]=ny[1]-10-(tBox.height/2+10*sfac[1]);
bb[1]=ny[1]-10+(tBox.height/2+10*sfac[1]);
bl[1]=nx[1]-(tBox.width/2+10*sfac[1]);
br[1]=nx[1]+(tBox.width/2+10*sfac[1]);
var nwidth = br[1]-bl[1]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[1] = bl[1] - delta; 
    br[1] = br[1] + delta; 
} 
bb[1] = bb[1]+20; 
rect=paper.rect(bl[1], bt[1], br[1]-bl[1], bb[1]-bt[1], 10*sfac[1]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[1]-42,bb[1]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[1]-18,bb[1]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[1]+5,bb[1]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[1]+25,bb[1]-25,20,20); 
t.toFront(); 
b[1]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[2],ny[2]-10,'Quadratic Equations\nby Graphing').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[2]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Quadratic-Equations-by-Graphing/#Quadratic Equations by Graphing", target: "_top"});
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
t=paper.text(nx[3],ny[3]-10,'Multiplying and\nDividing Rational\nExpressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[3]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multiplying-and-Dividing-Rational-Expressions/#Multiplying and Dividing Rational Expressions", target: "_top"});
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
t=paper.text(nx[4],ny[4]-10,'Polynomial Equations\nin Factored Form').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[4]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Polynomial-Equations-in-Factored-Form/#Polynomial Equations in Factored Form", target: "_top"});
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
t=paper.text(nx[5],ny[5]-10,'Exponent Propertiies\nInvolving Quotients').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[5]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exponent-Properties-Involving-Quotients/#Exponent Propertiies Involving Quotients", target: "_top"});
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
t=paper.text(nx[6],ny[6],'Order of\nOperations').attr({fill:"#666666","font-size": 14*sfac[6]});
tBox=t.getBBox(); 
bt[6]=ny[6]-(tBox.height/2+10*sfac[6]);
bb[6]=ny[6]+(tBox.height/2+10*sfac[6]);
bl[6]=nx[6]-(tBox.width/2+10*sfac[6]);
br[6]=nx[6]+(tBox.width/2+10*sfac[6]);
rect=paper.rect(bl[6], bt[6], br[6]-bl[6], bb[6]-bt[6], 10*sfac[6]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[6]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[7],ny[7]-10,'Solving\nInequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[7]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Solving-Inequalities/#Solving Inequalities", target: "_top"});
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
t=paper.text(nx[8],ny[8]-10,'Zero, Negative,\nand Fractional Exponents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[8]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Zero,-Negative,-and-Fractional-Exponents/#Zero, Negative, and Fractional Exponents", target: "_top"});
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
t=paper.text(nx[9],ny[9]-10,'Graphs Using\nSlope-Intercept Form').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[9]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-Using-Slope-Intercept-Form/#Graphs Using Slope-Intercept Form", target: "_top"});
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
t=paper.text(nx[10],ny[10],'The Coordinate\nPlane').attr({fill:"#666666","font-size": 14*sfac[10]});
tBox=t.getBBox(); 
bt[10]=ny[10]-(tBox.height/2+10*sfac[10]);
bb[10]=ny[10]+(tBox.height/2+10*sfac[10]);
bl[10]=nx[10]-(tBox.width/2+10*sfac[10]);
br[10]=nx[10]+(tBox.width/2+10*sfac[10]);
rect=paper.rect(bl[10], bt[10], br[10]-bl[10], bb[10]-bt[10], 10*sfac[10]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[10]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[11],ny[11],'Algebra I').attr({fill:"#000000","font-size": 24*sfac[11]});
tBox=t.getBBox(); 
bt[11]=ny[11]-(tBox.height/2+10*sfac[11]);
bb[11]=ny[11]+(tBox.height/2+10*sfac[11]);
bl[11]=nx[11]-(tBox.width/2+10*sfac[11]);
br[11]=nx[11]+(tBox.width/2+10*sfac[11]);
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[11]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[12],ny[12]-10,'One-Step\nEquations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[12]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/One-Step-Equations/#One-Step Equations", target: "_top"});
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
t=paper.text(nx[13],ny[13]-10,'The Pythagorean Theorem\nand Its Converse').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[13]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Pythagorean-Theorem-and-Its-Converse/#The Pythagorean Theorem and Its Converse", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[13]=ny[13]-10-(tBox.height/2+10*sfac[13]);
bb[13]=ny[13]-10+(tBox.height/2+10*sfac[13]);
bl[13]=nx[13]-(tBox.width/2+10*sfac[13]);
br[13]=nx[13]+(tBox.width/2+10*sfac[13]);
var nwidth = br[13]-bl[13]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[13] = bl[13] - delta; 
    br[13] = br[13] + delta; 
} 
bb[13] = bb[13]+20; 
rect=paper.rect(bl[13], bt[13], br[13]-bl[13], bb[13]-bt[13], 10*sfac[13]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[13]-42,bb[13]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[13]-18,bb[13]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[13]+5,bb[13]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[13]+25,bb[13]-25,20,20); 
t.toFront(); 
b[13]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[14],ny[14]-10,'Inverse Variation\nModels').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[14]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inverse-Variation-Models/#Inverse Variation Models", target: "_top"});
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
t=paper.text(nx[15],ny[15]-10,'Square Roots and\nReal Numbers').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[15]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Square-Roots-and-Real-Numbers/#Square Roots and Real Numbers", target: "_top"});
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
t=paper.text(nx[16],ny[16],'Exponential\nFunctions').attr({fill:"#666666","font-size": 14*sfac[16]});
tBox=t.getBBox(); 
bt[16]=ny[16]-(tBox.height/2+10*sfac[16]);
bb[16]=ny[16]+(tBox.height/2+10*sfac[16]);
bl[16]=nx[16]-(tBox.width/2+10*sfac[16]);
br[16]=nx[16]+(tBox.width/2+10*sfac[16]);
rect=paper.rect(bl[16], bt[16], br[16]-bl[16], bb[16]-bt[16], 10*sfac[16]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[16]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[17],ny[17],'Solving Systems of\nEquations and \nInequalities').attr({fill:"#666666","font-size": 14*sfac[17]});
tBox=t.getBBox(); 
bt[17]=ny[17]-(tBox.height/2+10*sfac[17]);
bb[17]=ny[17]+(tBox.height/2+10*sfac[17]);
bl[17]=nx[17]-(tBox.width/2+10*sfac[17]);
br[17]=nx[17]+(tBox.width/2+10*sfac[17]);
rect=paper.rect(bl[17], bt[17], br[17]-bl[17], bb[17]-bt[17], 10*sfac[17]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[17]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[18],ny[18]-10,'Patterns and\nEquations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[18]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Patterns-and-Equations/#Patterns and Equations", target: "_top"});
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
t=paper.text(nx[19],ny[19]-10,'Multiplication of\nPolynomials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[19]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multiplication-of-Polynomials/#Multiplication of Polynomials", target: "_top"});
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
t=paper.text(nx[20],ny[20]-10,'Fitting a Line\nto Data').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[20]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Fitting-a-Line-to-Data/#Fitting a Line to Data", target: "_top"});
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
t=paper.text(nx[21],ny[21]-10,'Factoring Quadratic\nExpressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[21]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Factoring-Quadratic-Expressions/#Factoring Quadratic Expressions", target: "_top"});
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
t=paper.text(nx[22],ny[22]-10,'Functions as\nGraphs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[22]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Functions-as-Graphs/#Functions as Graphs", target: "_top"});
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
t=paper.text(nx[23],ny[23]-10,'Special Products\nof Polynomials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[23]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Special-Products-of-Polynomials/#Special Products of Polynomials", target: "_top"});
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
t=paper.text(nx[24],ny[24]-10,'Variable Expressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[24]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Variable-Expressions/#Variable Expressions", target: "_top"});
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
t=paper.text(nx[25],ny[25],'Linear\nInequalities').attr({fill:"#666666","font-size": 14*sfac[25]});
tBox=t.getBBox(); 
bt[25]=ny[25]-(tBox.height/2+10*sfac[25]);
bb[25]=ny[25]+(tBox.height/2+10*sfac[25]);
bl[25]=nx[25]-(tBox.width/2+10*sfac[25]);
br[25]=nx[25]+(tBox.width/2+10*sfac[25]);
rect=paper.rect(bl[25], bt[25], br[25]-bl[25], bb[25]-bt[25], 10*sfac[25]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[25]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[26],ny[26],'Exponential\nFunctions').attr({fill:"#666666","font-size": 14*sfac[26]});
tBox=t.getBBox(); 
bt[26]=ny[26]-(tBox.height/2+10*sfac[26]);
bb[26]=ny[26]+(tBox.height/2+10*sfac[26]);
bl[26]=nx[26]-(tBox.width/2+10*sfac[26]);
br[26]=nx[26]+(tBox.width/2+10*sfac[26]);
rect=paper.rect(bl[26], bt[26], br[26]-bl[26], bb[26]-bt[26], 10*sfac[26]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[26]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[27],ny[27]-10,'Solving Quadratic\nEquations by\nCompleting the Square').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[27]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Solving-Quadratic-Equations-by-Completing-the-Square/#Solving Quadratic Equations by Completing the Square", target: "_top"});
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
t=paper.text(nx[28],ny[28]-10,'Integers and\nRational Numbers').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[28]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Integers-and-Rational-Numbers/#Integers and Rational Numbers", target: "_top"});
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
t=paper.text(nx[29],ny[29],'Equations of\nLines').attr({fill:"#666666","font-size": 14*sfac[29]});
tBox=t.getBBox(); 
bt[29]=ny[29]-(tBox.height/2+10*sfac[29]);
bb[29]=ny[29]+(tBox.height/2+10*sfac[29]);
bl[29]=nx[29]-(tBox.width/2+10*sfac[29]);
br[29]=nx[29]+(tBox.width/2+10*sfac[29]);
rect=paper.rect(bl[29], bt[29], br[29]-bl[29], bb[29]-bt[29], 10*sfac[29]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[29]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[30],ny[30]-10,'Addition and\nSubtraction of\nPolynomials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[30]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Polynomials/#Addition and Subtraction of Polynomials", target: "_top"});
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
t=paper.text(nx[31],ny[31]-10,'Factoring Polynomials\nCompletely').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[31]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Factoring-Polynomials-Completely/#Factoring Polynomials Completely", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[31]=ny[31]-10-(tBox.height/2+10*sfac[31]);
bb[31]=ny[31]-10+(tBox.height/2+10*sfac[31]);
bl[31]=nx[31]-(tBox.width/2+10*sfac[31]);
br[31]=nx[31]+(tBox.width/2+10*sfac[31]);
var nwidth = br[31]-bl[31]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[31] = bl[31] - delta; 
    br[31] = br[31] + delta; 
} 
bb[31] = bb[31]+20; 
rect=paper.rect(bl[31], bt[31], br[31]-bl[31], bb[31]-bt[31], 10*sfac[31]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[31]-42,bb[31]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[31]-18,bb[31]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[31]+5,bb[31]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[31]+25,bb[31]-25,20,20); 
t.toFront(); 
b[31]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[32],ny[32]-10,'Equations and\nInequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[32]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Equations-and-Inequalities/#Equations and Inequalities", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[32]=ny[32]-10-(tBox.height/2+10*sfac[32]);
bb[32]=ny[32]-10+(tBox.height/2+10*sfac[32]);
bl[32]=nx[32]-(tBox.width/2+10*sfac[32]);
br[32]=nx[32]+(tBox.width/2+10*sfac[32]);
var nwidth = br[32]-bl[32]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[32] = bl[32] - delta; 
    br[32] = br[32] + delta; 
} 
bb[32] = bb[32]+20; 
rect=paper.rect(bl[32], bt[32], br[32]-bl[32], bb[32]-bt[32], 10*sfac[32]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[32]-42,bb[32]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[32]-18,bb[32]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[32]+5,bb[32]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[32]+25,bb[32]-25,20,20); 
t.toFront(); 
b[32]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[33],ny[33],'Graphs of Equations\nand Functions').attr({fill:"#666666","font-size": 14*sfac[33]});
tBox=t.getBBox(); 
bt[33]=ny[33]-(tBox.height/2+10*sfac[33]);
bb[33]=ny[33]+(tBox.height/2+10*sfac[33]);
bl[33]=nx[33]-(tBox.width/2+10*sfac[33]);
br[33]=nx[33]+(tBox.width/2+10*sfac[33]);
rect=paper.rect(bl[33], bt[33], br[33]-bl[33], bb[33]-bt[33], 10*sfac[33]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[33]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[34],ny[34]-10,'Absolute Value\nEquations and\nInequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[34]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Absolute-Value-Equations-and-Inequalities/#Absolute Value Equations and Inequalities", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[34]=ny[34]-10-(tBox.height/2+10*sfac[34]);
bb[34]=ny[34]-10+(tBox.height/2+10*sfac[34]);
bl[34]=nx[34]-(tBox.width/2+10*sfac[34]);
br[34]=nx[34]+(tBox.width/2+10*sfac[34]);
var nwidth = br[34]-bl[34]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[34] = bl[34] - delta; 
    br[34] = br[34] + delta; 
} 
bb[34] = bb[34]+20; 
rect=paper.rect(bl[34], bt[34], br[34]-bl[34], bb[34]-bt[34], 10*sfac[34]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[34]-42,bb[34]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[34]-18,bb[34]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[34]+5,bb[34]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[34]+25,bb[34]-25,20,20); 
t.toFront(); 
b[34]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[35],ny[35]-10,'Graphs of\nRational Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[35]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-of-Rational-Functions/#Graphs of Rational Functions", target: "_top"});
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
t=paper.text(nx[36],ny[36]-10,'Compound\nInequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[36]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Compound-Inequalities/#Compound Inequalities", target: "_top"});
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
t=paper.text(nx[37],ny[37]-10,'Equations of\nParallel and\nPerpendicular Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[37]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Equations-of-Parallel-and-Perpendicular-Lines/#Equations of Parallel and Perpendicular Lines", target: "_top"});
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
t=paper.text(nx[38],ny[38]-10,'Linear Inequalities\nin Two Variables').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[38]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear-Inequalities-in-Two-Variables/#Linear Inequalities in Two Variables", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[38]=ny[38]-10-(tBox.height/2+10*sfac[38]);
bb[38]=ny[38]-10+(tBox.height/2+10*sfac[38]);
bl[38]=nx[38]-(tBox.width/2+10*sfac[38]);
br[38]=nx[38]+(tBox.width/2+10*sfac[38]);
var nwidth = br[38]-bl[38]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[38] = bl[38] - delta; 
    br[38] = br[38] + delta; 
} 
bb[38] = bb[38]+20; 
rect=paper.rect(bl[38], bt[38], br[38]-bl[38], bb[38]-bt[38], 10*sfac[38]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[38]-42,bb[38]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[38]-18,bb[38]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[38]+5,bb[38]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[38]+25,bb[38]-25,20,20); 
t.toFront(); 
b[38]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[39],ny[39],'Polynomials').attr({fill:"#666666","font-size": 14*sfac[39]});
tBox=t.getBBox(); 
bt[39]=ny[39]-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[40],ny[40]-10,'Two-Step\nEquations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[40]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Two-Step-Equations/#Two-Step Equations", target: "_top"});
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
t=paper.text(nx[41],ny[41]-10,'Solutions of\nRational Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[41]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Solutions-of-Rational-Equations/#Solutions of Rational Equations", target: "_top"});
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
t=paper.text(nx[42],ny[42]-10,'Problem Solving Strategies:\nGuess and Check, Work Backward').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[42]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Problem-Solving-Strategies:-Guess-and-Check,-Work-Backward/#Problem Solving Strategies: Guess and Check, Work Backward", target: "_top"});
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
t=paper.text(nx[43],ny[43]-10,'Factoring\nSpecial Products').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[43]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Factoring-Special-Products/#Factoring Special Products", target: "_top"});
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
t=paper.text(nx[44],ny[44]-10,'Scientific\nNotation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[44]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Scientific-Notation---Exponential-Functions/#Scientific Notation", target: "_top"});
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
t=paper.text(nx[45],ny[45],'Real Numbers').attr({fill:"#666666","font-size": 14*sfac[45]});
tBox=t.getBBox(); 
bt[45]=ny[45]-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[45]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[46],ny[46]-10,'Special Types of\nLinear Systems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[46]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Special-Types-of-Linear-Systems/#Special Types of Linear Systems", target: "_top"});
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
t=paper.text(nx[47],ny[47]-10,'Multiplying and Dividing\nRational Numbers').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[47]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multiplying-and-Dividing-Rational-Numbers/#Multiplying and Dividing Rational Numbers", target: "_top"});
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
t=paper.text(nx[48],ny[48]-10,'Systems of\nLinear Inequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[48]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Systems-of-Linear-Inequalities/#Systems of Linear Inequalities", target: "_top"});
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
t=paper.text(nx[49],ny[49]-10,'Radical\nEquations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[49]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Radical-Equations/#Radical Equations", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[49]=ny[49]-10-(tBox.height/2+10*sfac[49]);
bb[49]=ny[49]-10+(tBox.height/2+10*sfac[49]);
bl[49]=nx[49]-(tBox.width/2+10*sfac[49]);
br[49]=nx[49]+(tBox.width/2+10*sfac[49]);
var nwidth = br[49]-bl[49]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[49] = bl[49] - delta; 
    br[49] = br[49] + delta; 
} 
bb[49] = bb[49]+20; 
rect=paper.rect(bl[49], bt[49], br[49]-bl[49], bb[49]-bt[49], 10*sfac[49]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[49]-42,bb[49]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[49]-18,bb[49]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[49]+5,bb[49]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[49]+25,bb[49]-25,20,20); 
t.toFront(); 
b[49]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[50],ny[50]-10,'The Distributive\nProperty').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[50]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Distributive-Property/#The Distributive Property", target: "_top"});
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
t=paper.text(nx[51],ny[51]-10,'Solving Linear\nSystems by\nSubstitution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[51]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Solving-Linear-Systems-by-Substitution/#Solving Linear Systems by Substitution", target: "_top"});
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
t=paper.text(nx[52],ny[52]-10,'Geometric\nSequences').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[52]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Geometric-Sequences/#Geometric Sequences", target: "_top"});
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
t=paper.text(nx[53],ny[53]-10,'Linear Function\nGraphs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[53]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear-Function-Graphs/#Linear Function Graphs", target: "_top"});
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
t=paper.text(nx[54],ny[54],'Equations and\nFunctions').attr({fill:"#666666","font-size": 14*sfac[54]});
tBox=t.getBBox(); 
bt[54]=ny[54]-(tBox.height/2+10*sfac[54]);
bb[54]=ny[54]+(tBox.height/2+10*sfac[54]);
bl[54]=nx[54]-(tBox.width/2+10*sfac[54]);
br[54]=nx[54]+(tBox.width/2+10*sfac[54]);
rect=paper.rect(bl[54], bt[54], br[54]-bl[54], bb[54]-bt[54], 10*sfac[54]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[54]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[55],ny[55],'Algebra and Geometry\nConnections').attr({fill:"#666666","font-size": 14*sfac[55]});
tBox=t.getBBox(); 
bt[55]=ny[55]-(tBox.height/2+10*sfac[55]);
bb[55]=ny[55]+(tBox.height/2+10*sfac[55]);
bl[55]=nx[55]-(tBox.width/2+10*sfac[55]);
br[55]=nx[55]+(tBox.width/2+10*sfac[55]);
rect=paper.rect(bl[55], bt[55], br[55]-bl[55], bb[55]-bt[55], 10*sfac[55]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[55]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[56],ny[56]-10,'Linear Systems\nby Graphing').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[56]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear-Systems-by-Graphing/#Linear Systems by Graphing", target: "_top"});
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
t=paper.text(nx[57],ny[57]-10,'Applications of\nExponential Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[57]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Applications-of-Exponential-Functions/#Applications of Exponential Functions", target: "_top"});
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
t=paper.text(nx[58],ny[58],'Rational Equations\nand Functions').attr({fill:"#666666","font-size": 14*sfac[58]});
tBox=t.getBBox(); 
bt[58]=ny[58]-(tBox.height/2+10*sfac[58]);
bb[58]=ny[58]+(tBox.height/2+10*sfac[58]);
bl[58]=nx[58]-(tBox.width/2+10*sfac[58]);
br[58]=nx[58]+(tBox.width/2+10*sfac[58]);
rect=paper.rect(bl[58], bt[58], br[58]-bl[58], bb[58]-bt[58], 10*sfac[58]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[58]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[59],ny[59]-10,'Graphs of\nSquare Root\nFunctions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[59]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-of-Square-Root-Functions/#Graphs of Square Root Functions", target: "_top"});
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
t=paper.text(nx[60],ny[60]-10,'Linear, Exponential,\nand Quadratic Models').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[60]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear,-Exponential-and-Quadratic-Models/#Linear, Exponential, and Quadratic Models", target: "_top"});
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
t=paper.text(nx[61],ny[61]-10,'Graphs of\nLinear Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[61]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-of-Linear-Equations/#Graphs of Linear Equations", target: "_top"});
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
t=paper.text(nx[62],ny[62]-10,'Problem-Solving\nStrategies:\nMake a Table and Look\nfor a Pattern').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[62]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Problem-Solving-Strategies:-Make-a-Table-and-Look-for-a-Pattern/#Problem-Solving Strategies: Make a Table and Look for a Pattern", target: "_top"});
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
t=paper.text(nx[63],ny[63]-10,'Ratios and\nProportions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[63]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ratios-and-Proportions---Equations-of-Lines/#Ratios and Proportions", target: "_top"});
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
t=paper.text(nx[64],ny[64]-10,'Problem-Solving\nPlan').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[64]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Problem-Solving-Plan/#Problem-Solving Plan", target: "_top"});
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

paper.setStart(); 
t=paper.text(nx[65],ny[65]-10,'Functions as Rules\nand Tables').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[65]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Functions-as-Rules-and-Tables/#Functions as Rules and Tables", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[65]=ny[65]-10-(tBox.height/2+10*sfac[65]);
bb[65]=ny[65]-10+(tBox.height/2+10*sfac[65]);
bl[65]=nx[65]-(tBox.width/2+10*sfac[65]);
br[65]=nx[65]+(tBox.width/2+10*sfac[65]);
var nwidth = br[65]-bl[65]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[65] = bl[65] - delta; 
    br[65] = br[65] + delta; 
} 
bb[65] = bb[65]+20; 
rect=paper.rect(bl[65], bt[65], br[65]-bl[65], bb[65]-bt[65], 10*sfac[65]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[65]-42,bb[65]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[65]-18,bb[65]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[65]+5,bb[65]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[65]+25,bb[65]-25,20,20); 
t.toFront(); 
b[65]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[66],ny[66],'Quadratic Equations and\nQuadratic Functions').attr({fill:"#666666","font-size": 14*sfac[66]});
tBox=t.getBBox(); 
bt[66]=ny[66]-(tBox.height/2+10*sfac[66]);
bb[66]=ny[66]+(tBox.height/2+10*sfac[66]);
bl[66]=nx[66]-(tBox.width/2+10*sfac[66]);
br[66]=nx[66]+(tBox.width/2+10*sfac[66]);
rect=paper.rect(bl[66], bt[66], br[66]-bl[66], bb[66]-bt[66], 10*sfac[66]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[66]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[67],ny[67]-10,'Solving Quadratic\nEquations by the\nQuadratic Formula').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[67]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Solving-Quadratic-Equations-by-the-Quadratic-Formula/#Solving Quadratic Equations by the Quadratic Formula", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[67]=ny[67]-10-(tBox.height/2+10*sfac[67]);
bb[67]=ny[67]-10+(tBox.height/2+10*sfac[67]);
bl[67]=nx[67]-(tBox.width/2+10*sfac[67]);
br[67]=nx[67]+(tBox.width/2+10*sfac[67]);
var nwidth = br[67]-bl[67]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[67] = bl[67] - delta; 
    br[67] = br[67] + delta; 
} 
bb[67] = bb[67]+20; 
rect=paper.rect(bl[67], bt[67], br[67]-bl[67], bb[67]-bt[67], 10*sfac[67]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[67]-42,bb[67]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[67]-18,bb[67]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[67]+5,bb[67]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[67]+25,bb[67]-25,20,20); 
t.toFront(); 
b[67]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[68],ny[68]-10,'Quadratic Equations\nby Square Roots').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[68]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Quadratic-Equations-by-Square-Roots/#Quadratic Equations by Square Roots", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[68]=ny[68]-10-(tBox.height/2+10*sfac[68]);
bb[68]=ny[68]-10+(tBox.height/2+10*sfac[68]);
bl[68]=nx[68]-(tBox.width/2+10*sfac[68]);
br[68]=nx[68]+(tBox.width/2+10*sfac[68]);
var nwidth = br[68]-bl[68]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[68] = bl[68] - delta; 
    br[68] = br[68] + delta; 
} 
bb[68] = bb[68]+20; 
rect=paper.rect(bl[68], bt[68], br[68]-bl[68], bb[68]-bt[68], 10*sfac[68]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[68]-42,bb[68]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[68]-18,bb[68]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[68]+5,bb[68]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[68]+25,bb[68]-25,20,20); 
t.toFront(); 
b[68]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[69],ny[69]-10,'Predicting With\nLinear Models').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[69]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Predicting-with-Linear-Models/#Predicting With Linear Models", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[69]=ny[69]-10-(tBox.height/2+10*sfac[69]);
bb[69]=ny[69]-10+(tBox.height/2+10*sfac[69]);
bl[69]=nx[69]-(tBox.width/2+10*sfac[69]);
br[69]=nx[69]+(tBox.width/2+10*sfac[69]);
var nwidth = br[69]-bl[69]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[69] = bl[69] - delta; 
    br[69] = br[69] + delta; 
} 
bb[69] = bb[69]+20; 
rect=paper.rect(bl[69], bt[69], br[69]-bl[69], bb[69]-bt[69], 10*sfac[69]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[69]-42,bb[69]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[69]-18,bb[69]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[69]+5,bb[69]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[69]+25,bb[69]-25,20,20); 
t.toFront(); 
b[69]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[70],ny[70]-10,'Distance and\nMidpoint Formulas').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[70]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Distance-and-Midpoint-Formulas/#Distance and Midpoint Formulas", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[70]=ny[70]-10-(tBox.height/2+10*sfac[70]);
bb[70]=ny[70]-10+(tBox.height/2+10*sfac[70]);
bl[70]=nx[70]-(tBox.width/2+10*sfac[70]);
br[70]=nx[70]+(tBox.width/2+10*sfac[70]);
var nwidth = br[70]-bl[70]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[70] = bl[70] - delta; 
    br[70] = br[70] + delta; 
} 
bb[70] = bb[70]+20; 
rect=paper.rect(bl[70], bt[70], br[70]-bl[70], bb[70]-bt[70], 10*sfac[70]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[70]-42,bb[70]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[70]-18,bb[70]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[70]+5,bb[70]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[70]+25,bb[70]-25,20,20); 
t.toFront(); 
b[70]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[71],ny[71]-10,'Multi-Step\nEquations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[71]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multi-Step-Equations/#Multi-Step Equations", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[71]=ny[71]-10-(tBox.height/2+10*sfac[71]);
bb[71]=ny[71]-10+(tBox.height/2+10*sfac[71]);
bl[71]=nx[71]-(tBox.width/2+10*sfac[71]);
br[71]=nx[71]+(tBox.width/2+10*sfac[71]);
var nwidth = br[71]-bl[71]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[71] = bl[71] - delta; 
    br[71] = br[71] + delta; 
} 
bb[71] = bb[71]+20; 
rect=paper.rect(bl[71], bt[71], br[71]-bl[71], bb[71]-bt[71], 10*sfac[71]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[71]-42,bb[71]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[71]-18,bb[71]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[71]+5,bb[71]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[71]+25,bb[71]-25,20,20); 
t.toFront(); 
b[71]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[72],ny[72]-10,'Exponent Properties\nInvolving Products').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[72]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exponent-Properties-Involving-Products/#Exponent Properties Involving Products", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[72]=ny[72]-10-(tBox.height/2+10*sfac[72]);
bb[72]=ny[72]-10+(tBox.height/2+10*sfac[72]);
bl[72]=nx[72]-(tBox.width/2+10*sfac[72]);
br[72]=nx[72]+(tBox.width/2+10*sfac[72]);
var nwidth = br[72]-bl[72]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[72] = bl[72] - delta; 
    br[72] = br[72] + delta; 
} 
bb[72] = bb[72]+20; 
rect=paper.rect(bl[72], bt[72], br[72]-bl[72], bb[72]-bt[72], 10*sfac[72]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[72]-42,bb[72]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[72]-18,bb[72]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[72]+5,bb[72]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[72]+25,bb[72]-25,20,20); 
t.toFront(); 
b[72]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[73],ny[73]-10,'Slope and\nRate of Change').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[73]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Slope-and-Rate-of-Change/#Slope and Rate of Change", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[73]=ny[73]-10-(tBox.height/2+10*sfac[73]);
bb[73]=ny[73]-10+(tBox.height/2+10*sfac[73]);
bl[73]=nx[73]-(tBox.width/2+10*sfac[73]);
br[73]=nx[73]+(tBox.width/2+10*sfac[73]);
var nwidth = br[73]-bl[73]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[73] = bl[73] - delta; 
    br[73] = br[73] + delta; 
} 
bb[73] = bb[73]+20; 
rect=paper.rect(bl[73], bt[73], br[73]-bl[73], bb[73]-bt[73], 10*sfac[73]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[73]-42,bb[73]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[73]-18,bb[73]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[73]+5,bb[73]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[73]+25,bb[73]-25,20,20); 
t.toFront(); 
b[73]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[74],ny[74]-10,'Division of\nPolynomials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[74]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Division-of-Polynomials/#Division of Polynomials", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[74]=ny[74]-10-(tBox.height/2+10*sfac[74]);
bb[74]=ny[74]-10+(tBox.height/2+10*sfac[74]);
bl[74]=nx[74]-(tBox.width/2+10*sfac[74]);
br[74]=nx[74]+(tBox.width/2+10*sfac[74]);
var nwidth = br[74]-bl[74]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[74] = bl[74] - delta; 
    br[74] = br[74] + delta; 
} 
bb[74] = bb[74]+20; 
rect=paper.rect(bl[74], bt[74], br[74]-bl[74], bb[74]-bt[74], 10*sfac[74]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[74]-42,bb[74]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[74]-18,bb[74]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[74]+5,bb[74]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[74]+25,bb[74]-25,20,20); 
t.toFront(); 
b[74]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[75],ny[75]-10,'Forms of\nLinear Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[75]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Forms-of-Linear-Equations/#Forms of Linear Equations", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[75]=ny[75]-10-(tBox.height/2+10*sfac[75]);
bb[75]=ny[75]-10+(tBox.height/2+10*sfac[75]);
bl[75]=nx[75]-(tBox.width/2+10*sfac[75]);
br[75]=nx[75]+(tBox.width/2+10*sfac[75]);
var nwidth = br[75]-bl[75]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[75] = bl[75] - delta; 
    br[75] = br[75] + delta; 
} 
bb[75] = bb[75]+20; 
rect=paper.rect(bl[75], bt[75], br[75]-bl[75], bb[75]-bt[75], 10*sfac[75]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[75]-42,bb[75]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[75]-18,bb[75]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[75]+5,bb[75]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[75]+25,bb[75]-25,20,20); 
t.toFront(); 
b[75]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[76],ny[76],'Adding and Subtracting\nRational Numbers').attr({fill:"#666666","font-size": 14*sfac[76]});
tBox=t.getBBox(); 
bt[76]=ny[76]-(tBox.height/2+10*sfac[76]);
bb[76]=ny[76]+(tBox.height/2+10*sfac[76]);
bl[76]=nx[76]-(tBox.width/2+10*sfac[76]);
br[76]=nx[76]+(tBox.width/2+10*sfac[76]);
rect=paper.rect(bl[76], bt[76], br[76]-bl[76], bb[76]-bt[76], 10*sfac[76]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[76]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[77],ny[77]-10,'Adding and\nSubtracting\nRational Expressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[77]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Adding-and-Subtracting-Rational-Expressions/#Adding and Subtracting Rational Expressions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[77]=ny[77]-10-(tBox.height/2+10*sfac[77]);
bb[77]=ny[77]-10+(tBox.height/2+10*sfac[77]);
bl[77]=nx[77]-(tBox.width/2+10*sfac[77]);
br[77]=nx[77]+(tBox.width/2+10*sfac[77]);
var nwidth = br[77]-bl[77]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[77] = bl[77] - delta; 
    br[77] = br[77] + delta; 
} 
bb[77] = bb[77]+20; 
rect=paper.rect(bl[77], bt[77], br[77]-bl[77], bb[77]-bt[77], 10*sfac[77]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[77]-42,bb[77]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[77]-18,bb[77]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[77]+5,bb[77]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[77]+25,bb[77]-25,20,20); 
t.toFront(); 
b[77]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[78],ny[78]-10,'Radical\nExpressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[78]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Radical-Expressions/#Radical Expressions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[78]=ny[78]-10-(tBox.height/2+10*sfac[78]);
bb[78]=ny[78]-10+(tBox.height/2+10*sfac[78]);
bl[78]=nx[78]-(tBox.width/2+10*sfac[78]);
br[78]=nx[78]+(tBox.width/2+10*sfac[78]);
var nwidth = br[78]-bl[78]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[78] = bl[78] - delta; 
    br[78] = br[78] + delta; 
} 
bb[78] = bb[78]+20; 
rect=paper.rect(bl[78], bt[78], br[78]-bl[78], bb[78]-bt[78], 10*sfac[78]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[78]-42,bb[78]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[78]-18,bb[78]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[78]+5,bb[78]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[78]+25,bb[78]-25,20,20); 
t.toFront(); 
b[78]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[79],ny[79]-10,'Graphing Using\nIntercepts').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[79]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphing-Using-Intercepts/#Graphing Using Intercepts", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[79]=ny[79]-10-(tBox.height/2+10*sfac[79]);
bb[79]=ny[79]-10+(tBox.height/2+10*sfac[79]);
bl[79]=nx[79]-(tBox.width/2+10*sfac[79]);
br[79]=nx[79]+(tBox.width/2+10*sfac[79]);
var nwidth = br[79]-bl[79]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[79] = bl[79] - delta; 
    br[79] = br[79] + delta; 
} 
bb[79] = bb[79]+20; 
rect=paper.rect(bl[79], bt[79], br[79]-bl[79], bb[79]-bt[79], 10*sfac[79]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[79]-42,bb[79]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[79]-18,bb[79]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[79]+5,bb[79]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[79]+25,bb[79]-25,20,20); 
t.toFront(); 
b[79]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[80],ny[80]-10,'Direction Variation\nModels').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[80]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Direct-Variation-Models/#Direction Variation Models", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[80]=ny[80]-10-(tBox.height/2+10*sfac[80]);
bb[80]=ny[80]-10+(tBox.height/2+10*sfac[80]);
bl[80]=nx[80]-(tBox.width/2+10*sfac[80]);
br[80]=nx[80]+(tBox.width/2+10*sfac[80]);
var nwidth = br[80]-bl[80]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[80] = bl[80] - delta; 
    br[80] = br[80] + delta; 
} 
bb[80] = bb[80]+20; 
rect=paper.rect(bl[80], bt[80], br[80]-bl[80], bb[80]-bt[80], 10*sfac[80]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[80]-42,bb[80]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[80]-18,bb[80]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[80]+5,bb[80]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[80]+25,bb[80]-25,20,20); 
t.toFront(); 
b[80]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[81],ny[81]-10,'The Discriminant').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[81]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Discriminant/#The Discriminant", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[81]=ny[81]-10-(tBox.height/2+10*sfac[81]);
bb[81]=ny[81]-10+(tBox.height/2+10*sfac[81]);
bl[81]=nx[81]-(tBox.width/2+10*sfac[81]);
br[81]=nx[81]+(tBox.width/2+10*sfac[81]);
var nwidth = br[81]-bl[81]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[81] = bl[81] - delta; 
    br[81] = br[81] + delta; 
} 
bb[81] = bb[81]+20; 
rect=paper.rect(bl[81], bt[81], br[81]-bl[81], bb[81]-bt[81], 10*sfac[81]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[81]-42,bb[81]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[81]-18,bb[81]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[81]+5,bb[81]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[81]+25,bb[81]-25,20,20); 
t.toFront(); 
b[81]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[82],ny[82]-10,'Equations with\nVariables on\nBoth Sides').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[82]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Equations-with-Variables-on-Both-Sides/#Equations with Variables on Both Sides", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[82]=ny[82]-10-(tBox.height/2+10*sfac[82]);
bb[82]=ny[82]-10+(tBox.height/2+10*sfac[82]);
bl[82]=nx[82]-(tBox.width/2+10*sfac[82]);
br[82]=nx[82]+(tBox.width/2+10*sfac[82]);
var nwidth = br[82]-bl[82]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[82] = bl[82] - delta; 
    br[82] = br[82] + delta; 
} 
bb[82] = bb[82]+20; 
rect=paper.rect(bl[82], bt[82], br[82]-bl[82], bb[82]-bt[82], 10*sfac[82]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[82]-42,bb[82]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[82]-18,bb[82]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[82]+5,bb[82]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[82]+25,bb[82]-25,20,20); 
t.toFront(); 
b[82]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[83],ny[83],'Writing Linear\nEquations').attr({fill:"#666666","font-size": 14*sfac[83]});
tBox=t.getBBox(); 
bt[83]=ny[83]-(tBox.height/2+10*sfac[83]);
bb[83]=ny[83]+(tBox.height/2+10*sfac[83]);
bl[83]=nx[83]-(tBox.width/2+10*sfac[83]);
br[83]=nx[83]+(tBox.width/2+10*sfac[83]);
rect=paper.rect(bl[83], bt[83], br[83]-bl[83], bb[83]-bt[83], 10*sfac[83]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[83]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[84],ny[84]-10,'Percent\nProblems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[84]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Percent-Problems/#Percent Problems", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[84]=ny[84]-10-(tBox.height/2+10*sfac[84]);
bb[84]=ny[84]-10+(tBox.height/2+10*sfac[84]);
bl[84]=nx[84]-(tBox.width/2+10*sfac[84]);
br[84]=nx[84]+(tBox.width/2+10*sfac[84]);
var nwidth = br[84]-bl[84]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[84] = bl[84] - delta; 
    br[84] = br[84] + delta; 
} 
bb[84] = bb[84]+20; 
rect=paper.rect(bl[84], bt[84], br[84]-bl[84], bb[84]-bt[84], 10*sfac[84]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[84]-42,bb[84]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[84]-18,bb[84]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[84]+5,bb[84]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[84]+25,bb[84]-25,20,20); 
t.toFront(); 
b[84]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[85],ny[85]-10,'Rational\nExpressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[85]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Rational-Expressions/#Rational Expressions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[85]=ny[85]-10-(tBox.height/2+10*sfac[85]);
bb[85]=ny[85]-10+(tBox.height/2+10*sfac[85]);
bl[85]=nx[85]-(tBox.width/2+10*sfac[85]);
br[85]=nx[85]+(tBox.width/2+10*sfac[85]);
var nwidth = br[85]-bl[85]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[85] = bl[85] - delta; 
    br[85] = br[85] + delta; 
} 
bb[85] = bb[85]+20; 
rect=paper.rect(bl[85], bt[85], br[85]-bl[85], bb[85]-bt[85], 10*sfac[85]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[85]-42,bb[85]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[85]-18,bb[85]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[85]+5,bb[85]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[85]+25,bb[85]-25,20,20); 
t.toFront(); 
b[85]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[86],ny[86]-10,'Graphs of Quadratic\nFunctions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[86]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-of-Quadratic-Functions/#Graphs of Quadratic Functions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[86]=ny[86]-10-(tBox.height/2+10*sfac[86]);
bb[86]=ny[86]-10+(tBox.height/2+10*sfac[86]);
bl[86]=nx[86]-(tBox.width/2+10*sfac[86]);
br[86]=nx[86]+(tBox.width/2+10*sfac[86]);
var nwidth = br[86]-bl[86]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[86] = bl[86] - delta; 
    br[86] = br[86] + delta; 
} 
bb[86] = bb[86]+20; 
rect=paper.rect(bl[86], bt[86], br[86]-bl[86], bb[86]-bt[86], 10*sfac[86]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[86]-42,bb[86]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[86]-18,bb[86]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[86]+5,bb[86]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[86]+25,bb[86]-25,20,20); 
t.toFront(); 
b[86]=paper.setFinish(); 

bb[87]= ny[87]; 
bt[87]= ny[87]; 
bl[87]= nx[87]; 
br[87]= nx[87]; 

bb[88]= ny[88]; 
bt[88]= ny[88]; 
bl[88]= nx[88]; 
br[88]= nx[88]; 

bb[89]= ny[89]; 
bt[89]= ny[89]; 
bl[89]= nx[89]; 
br[89]= nx[89]; 

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
b[65].click(function() {recenter(65);}); 
b[66].click(function() {recenter(66);}); 
b[67].click(function() {recenter(67);}); 
b[68].click(function() {recenter(68);}); 
b[69].click(function() {recenter(69);}); 
b[70].click(function() {recenter(70);}); 
b[71].click(function() {recenter(71);}); 
b[72].click(function() {recenter(72);}); 
b[73].click(function() {recenter(73);}); 
b[74].click(function() {recenter(74);}); 
b[75].click(function() {recenter(75);}); 
b[76].click(function() {recenter(76);}); 
b[77].click(function() {recenter(77);}); 
b[78].click(function() {recenter(78);}); 
b[79].click(function() {recenter(79);}); 
b[80].click(function() {recenter(80);}); 
b[81].click(function() {recenter(81);}); 
b[82].click(function() {recenter(82);}); 
b[83].click(function() {recenter(83);}); 
b[84].click(function() {recenter(84);}); 
b[85].click(function() {recenter(85);}); 
b[86].click(function() {recenter(86);}); 
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
b[65].hover(function() {nodeHover(65);}, function() {nodeUnhover(65);}); 
b[66].hover(function() {nodeHover(66);}, function() {nodeUnhover(66);}); 
b[67].hover(function() {nodeHover(67);}, function() {nodeUnhover(67);}); 
b[68].hover(function() {nodeHover(68);}, function() {nodeUnhover(68);}); 
b[69].hover(function() {nodeHover(69);}, function() {nodeUnhover(69);}); 
b[70].hover(function() {nodeHover(70);}, function() {nodeUnhover(70);}); 
b[71].hover(function() {nodeHover(71);}, function() {nodeUnhover(71);}); 
b[72].hover(function() {nodeHover(72);}, function() {nodeUnhover(72);}); 
b[73].hover(function() {nodeHover(73);}, function() {nodeUnhover(73);}); 
b[74].hover(function() {nodeHover(74);}, function() {nodeUnhover(74);}); 
b[75].hover(function() {nodeHover(75);}, function() {nodeUnhover(75);}); 
b[76].hover(function() {nodeHover(76);}, function() {nodeUnhover(76);}); 
b[77].hover(function() {nodeHover(77);}, function() {nodeUnhover(77);}); 
b[78].hover(function() {nodeHover(78);}, function() {nodeUnhover(78);}); 
b[79].hover(function() {nodeHover(79);}, function() {nodeUnhover(79);}); 
b[80].hover(function() {nodeHover(80);}, function() {nodeUnhover(80);}); 
b[81].hover(function() {nodeHover(81);}, function() {nodeUnhover(81);}); 
b[82].hover(function() {nodeHover(82);}, function() {nodeUnhover(82);}); 
b[83].hover(function() {nodeHover(83);}, function() {nodeUnhover(83);}); 
b[84].hover(function() {nodeHover(84);}, function() {nodeUnhover(84);}); 
b[85].hover(function() {nodeHover(85);}, function() {nodeUnhover(85);}); 
b[86].hover(function() {nodeHover(86);}, function() {nodeUnhover(86);}); 
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
s1='M '+nx[0]+' '+bb[0]+' L '+nx[0]+' '+ny[88]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[0],nx[88])+' '+ny[88]+' L '+Math.max(nx[0],nx[88])+' '+ny[88]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[0,88]; 

paper.setStart(); 
s1='M '+nx[3]+' '+bb[3]+' L '+nx[3]+' '+bt[77]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[3,77] ; 

paper.setStart(); 
mid=bb[4]+(bt[21]-bb[4])/2; 
s2='M '+nx[4]+' '+bb[4]+' L '+nx[4]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[43]+' '+mid+' L '+nx[43]+' '+bt[43];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[4,43]; 

paper.setStart(); 
mid=bb[4]+(bt[21]-bb[4])/2; 
hleft = nx[31]; 
hright = nx[4]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[31]+' '+mid+' L '+nx[31]+' '+bt[31];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[4,31]; 

paper.setStart(); 
mid=bb[4]+(bt[21]-bb[4])/2; 
hleft = nx[21]; 
hright = nx[4]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[21]+' '+mid+' L '+nx[21]+' '+bt[21];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[4,21]; 

paper.setStart(); 
mid=bb[6]+(bt[18]-bb[6])/2; 
hleft = nx[65]; 
hright = nx[6]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[6]+' '+bb[6]+' L '+nx[6]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[65]+' '+mid+' L '+nx[65]+' '+bt[65];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[6,65]; 

paper.setStart(); 
mid=bb[6]+(bt[18]-bb[6])/2; 
hleft = nx[18]; 
hright = nx[6]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[18]+' '+mid+' L '+nx[18]+' '+bt[18];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[6,18]; 

paper.setStart(); 
mid=bb[7]+(bt[1]-bb[7])/2; 
s2='M '+nx[7]+' '+bb[7]+' L '+nx[7]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[36]+' '+mid+' L '+nx[36]+' '+bt[36];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[7,36]; 

paper.setStart(); 
mid=bb[7]+(bt[1]-bb[7])/2; 
s3='M '+nx[34]+' '+mid+' L '+nx[34]+' '+bt[34];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[7,34]; 

paper.setStart(); 
mid=bb[7]+(bt[1]-bb[7])/2; 
hleft = nx[17]; 
hright = nx[7]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[17]+' '+mid+' L '+nx[17]+' '+bt[17];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[7,17]; 

paper.setStart(); 
mid=bb[7]+(bt[1]-bb[7])/2; 
hleft = nx[1]; 
hright = nx[7]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[1]+' '+mid+' L '+nx[1]+' '+bt[1];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[7,1]; 

paper.setStart(); 
mid=bb[8]+(bt[52]-bb[8])/2; 
hleft = nx[44]; 
hright = nx[8]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[8]+' '+bb[8]+' L '+nx[8]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[44]+' '+mid+' L '+nx[44]+' '+bt[44];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[8,44]; 

paper.setStart(); 
mid=bb[8]+(bt[52]-bb[8])/2; 
hleft = nx[16]; 
hright = nx[8]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[16]+' '+mid+' L '+nx[16]+' '+bt[16];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[8,16]; 

paper.setStart(); 
mid=bb[8]+(bt[52]-bb[8])/2; 
s3='M '+nx[52]+' '+mid+' L '+nx[52]+' '+bt[52];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[8,52]; 

paper.setStart(); 
mid=bb[9]+(bt[53]-bb[9])/2; 
hleft = nx[80]; 
hright = nx[9]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[9]+' '+bb[9]+' L '+nx[9]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[80]+' '+mid+' L '+nx[80]+' '+bt[80];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[9,80]; 

paper.setStart(); 
mid=bb[9]+(bt[53]-bb[9])/2; 
hleft = nx[53]; 
hright = nx[9]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[53]+' '+mid+' L '+nx[53]+' '+bt[53];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[9,53]; 

paper.setStart(); 
s1='M '+nx[10]+' '+bb[10]+' L '+nx[10]+' '+bt[61]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[10,61] ; 

paper.setStart(); 
mid=bb[11]+(bt[54]-bb[11])/2; 
hleft = nx[54]; 
hright = nx[11]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[11]+' '+bb[11]+' L '+nx[11]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[54]+' '+mid+' L '+nx[54]+' '+bt[54];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[11,54]; 

paper.setStart(); 
mid=bb[11]+(bt[54]-bb[11])/2; 
hleft = nx[45]; 
hright = nx[11]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[45]+' '+mid+' L '+nx[45]+' '+bt[45];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[11,45]; 

paper.setStart(); 
s1='M '+nx[12]+' '+bb[12]+' L '+nx[12]+' '+bt[40]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[12,40] ; 

paper.setStart(); 
s1='M '+nx[13]+' '+bb[13]+' L '+nx[13]+' '+bt[70]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[13,70] ; 

paper.setStart(); 
mid=bb[14]+(bt[35]-bb[14])/2; 
s2='M '+nx[14]+' '+bb[14]+' L '+nx[14]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[74]+' '+mid+' L '+nx[74]+' '+bt[74];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[14,74]; 

paper.setStart(); 
mid=bb[14]+(bt[35]-bb[14])/2; 
hleft = nx[85]; 
hright = nx[14]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[85]+' '+mid+' L '+nx[85]+' '+bt[85];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[14,85]; 

paper.setStart(); 
mid=bb[14]+(bt[35]-bb[14])/2; 
hleft = nx[35]; 
hright = nx[14]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[35]+' '+mid+' L '+nx[35]+' '+bt[35];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[14,35]; 

paper.setStart(); 
mid=bb[15]+(bt[55]-bb[15])/2; 
hleft = nx[66]; 
hright = nx[15]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[15]+' '+bb[15]+' L '+nx[15]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[66]+' '+mid+' L '+nx[66]+' '+bt[66];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[15,66]; 

paper.setStart(); 
mid=bb[15]+(bt[55]-bb[15])/2; 
hleft = nx[55]; 
hright = nx[15]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[55]+' '+mid+' L '+nx[55]+' '+bt[55];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[15,55]; 

paper.setStart(); 
s1='M '+nx[16]+' '+bb[16]+' L '+nx[16]+' '+bt[57]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[16,57] ; 

paper.setStart(); 
s1='M '+nx[17]+' '+bb[17]+' L '+nx[17]+' '+bt[56]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[17,56] ; 

paper.setStart(); 
s1='M '+nx[18]+' '+bb[18]+' L '+nx[18]+' '+bt[32]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[18,32] ; 

paper.setStart(); 
s1='M '+nx[19]+' '+bb[19]+' L '+nx[19]+' '+bt[23]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[19,23] ; 

paper.setStart(); 
s1='M '+nx[20]+' '+bb[20]+' L '+nx[20]+' '+bt[69]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[20,69] ; 

paper.setStart(); 
s1='M '+nx[22]+' '+bb[22]+' L '+nx[22]+' '+ny[89]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[22],nx[89])+' '+ny[89]+' L '+Math.max(nx[22],nx[89])+' '+ny[89]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[22,89]; 

paper.setStart(); 
mid=bb[23]+(bt[58]-bb[23])/2; 
hleft = nx[58]; 
hright = nx[23]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[58]+' '+mid+' L '+nx[58]+' '+bt[58];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[23,58]; 

paper.setStart(); 
mid=bb[23]+(bt[58]-bb[23])/2; 
hleft = nx[4]; 
hright = nx[23]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[4]+' '+mid+' L '+nx[4]+' '+bt[4];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[23,4]; 

paper.setStart(); 
s1='M '+nx[24]+' '+bb[24]+' L '+nx[24]+' '+bt[6]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[24,6] ; 

paper.setStart(); 
s1='M '+nx[25]+' '+bb[25]+' L '+nx[25]+' '+bt[7]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[25,7] ; 

paper.setStart(); 
mid=bb[26]+(bt[5]-bb[26])/2; 
hleft = nx[72]; 
hright = nx[26]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[26]+' '+bb[26]+' L '+nx[26]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[72]+' '+mid+' L '+nx[72]+' '+bt[72];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[26,72]; 

paper.setStart(); 
mid=bb[26]+(bt[5]-bb[26])/2; 
s3='M '+nx[5]+' '+mid+' L '+nx[5]+' '+bt[5];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[26,5]; 

paper.setStart(); 
mid=bb[26]+(bt[5]-bb[26])/2; 
hleft = nx[8]; 
hright = nx[26]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[8]+' '+mid+' L '+nx[8]+' '+bt[8];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[26,8]; 

paper.setStart(); 
s1='M '+nx[27]+' '+bb[27]+' L '+nx[27]+' '+bt[67]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[27,67] ; 

paper.setStart(); 
s1='M '+nx[28]+' '+bb[28]+' L '+nx[28]+' '+bt[76]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[28,76] ; 

paper.setStart(); 
s1='M '+nx[29]+' '+bb[29]+' L '+nx[29]+' '+bt[12]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[29,12] ; 

paper.setStart(); 
s1='M '+nx[30]+' '+bb[30]+' L '+nx[30]+' '+bt[19]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[30,19] ; 

paper.setStart(); 
s1='M '+nx[32]+' '+bb[32]+' L '+nx[32]+' '+ny[89]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[32],nx[89])+' '+ny[89]+' L '+Math.max(nx[32],nx[89])+' '+ny[89]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[32,89]; 

paper.setStart(); 
s1='M '+nx[33]+' '+bb[33]+' L '+nx[33]+' '+bt[10]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[33,10] ; 

paper.setStart(); 
s1='M '+nx[36]+' '+bb[36]+' L '+nx[36]+' '+bt[38]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[36,38] ; 

paper.setStart(); 
s1='M '+nx[39]+' '+bb[39]+' L '+nx[39]+' '+bt[30]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[39,30] ; 

paper.setStart(); 
s1='M '+nx[40]+' '+bb[40]+' L '+nx[40]+' '+bt[71]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[40,71] ; 

paper.setStart(); 
s1='M '+nx[45]+' '+bb[45]+' L '+nx[45]+' '+bt[28]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[45,28] ; 

paper.setStart(); 
mid=bb[47]+(bt[50]-bb[47])/2; 
s2='M '+nx[47]+' '+bb[47]+' L '+nx[47]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[15]+' '+mid+' L '+nx[15]+' '+bt[15];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[49]=paper.setFinish(); 
lineNodes[49]=[47,15]; 

paper.setStart(); 
mid=bb[47]+(bt[50]-bb[47])/2; 
hleft = nx[42]; 
hright = nx[47]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[42]+' '+mid+' L '+nx[42]+' '+bt[42];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[47,42]; 

paper.setStart(); 
mid=bb[47]+(bt[50]-bb[47])/2; 
hleft = nx[50]; 
hright = nx[47]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[50]+' '+mid+' L '+nx[50]+' '+bt[50];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[47,50]; 

paper.setStart(); 
s1='M '+nx[49]+' '+bb[49]+' L '+nx[49]+' '+bt[13]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[49,13] ; 

paper.setStart(); 
s1='M '+nx[51]+' '+bb[51]+' L '+nx[51]+' '+ny[88]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[51],nx[88])+' '+ny[88]+' L '+Math.max(nx[51],nx[88])+' '+ny[88]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[51,88]; 

paper.setStart(); 
s1='M '+nx[54]+' '+bb[54]+' L '+nx[54]+' '+bt[24]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[54,24] ; 

paper.setStart(); 
mid=bb[55]+(bt[78]-bb[55])/2; 
hleft = nx[78]; 
hright = nx[55]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[55]+' '+bb[55]+' L '+nx[55]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[78]+' '+mid+' L '+nx[78]+' '+bt[78];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[55,78]; 

paper.setStart(); 
mid=bb[55]+(bt[78]-bb[55])/2; 
hleft = nx[59]; 
hright = nx[55]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[59]+' '+mid+' L '+nx[59]+' '+bt[59];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[55,59]; 

paper.setStart(); 
mid=bb[56]+(bt[51]-bb[56])/2; 
hleft = nx[0]; 
hright = nx[56]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[56]+' '+bb[56]+' L '+nx[56]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[0]+' '+mid+' L '+nx[0]+' '+bt[0];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[56,0]; 

paper.setStart(); 
mid=bb[56]+(bt[51]-bb[56])/2; 
hleft = nx[51]; 
hright = nx[56]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[51]+' '+mid+' L '+nx[51]+' '+bt[51];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[56,51]; 

paper.setStart(); 
s1='M '+nx[57]+' '+bb[57]+' L '+nx[57]+' '+bt[60]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[57,60] ; 

paper.setStart(); 
s1='M '+nx[58]+' '+bb[58]+' L '+nx[58]+' '+bt[14]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[58,14] ; 

paper.setStart(); 
mid=bb[61]+(bt[73]-bb[61])/2; 
hleft = nx[79]; 
hright = nx[61]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[61]+' '+bb[61]+' L '+nx[61]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[79]+' '+mid+' L '+nx[79]+' '+bt[79];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[61,79]; 

paper.setStart(); 
mid=bb[61]+(bt[73]-bb[61])/2; 
hleft = nx[73]; 
hright = nx[61]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[73]+' '+mid+' L '+nx[73]+' '+bt[73];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[61,73]; 

paper.setStart(); 
s1='M '+nx[63]+' '+bb[63]+' L '+nx[63]+' '+bt[84]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[63,84] ; 

paper.setStart(); 
s1='M '+nx[64]+' '+bb[64]+' L '+nx[64]+' '+bt[62]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[64,62] ; 

paper.setStart(); 
s1='M '+nx[65]+' '+bb[65]+' L '+nx[65]+' '+bt[22]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[65,22] ; 

paper.setStart(); 
s1='M '+nx[66]+' '+bb[66]+' L '+nx[66]+' '+bt[86]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[66,86] ; 

paper.setStart(); 
mid=bb[67]+(bt[81]-bb[67])/2; 
hleft = nx[26]; 
hright = nx[67]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[67]+' '+bb[67]+' L '+nx[67]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[26]+' '+mid+' L '+nx[26]+' '+bt[26];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[67,26]; 

paper.setStart(); 
mid=bb[67]+(bt[81]-bb[67])/2; 
hleft = nx[81]; 
hright = nx[67]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[81]+' '+mid+' L '+nx[81]+' '+bt[81];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[67,81]; 

paper.setStart(); 
mid=bb[67]+(bt[81]-bb[67])/2; 
s3='M '+nx[39]+' '+mid+' L '+nx[39]+' '+bt[39];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[69]=paper.setFinish(); 
lineNodes[69]=[67,39]; 

paper.setStart(); 
s1='M '+nx[68]+' '+bb[68]+' L '+nx[68]+' '+bt[27]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[70]=paper.setFinish(); 
lineNodes[70]=[68,27] ; 

paper.setStart(); 
mid=bb[71]+(bt[63]-bb[71])/2; 
hleft = nx[82]; 
hright = nx[71]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[71]+' '+bb[71]+' L '+nx[71]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[82]+' '+mid+' L '+nx[82]+' '+bt[82];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[71]=paper.setFinish(); 
lineNodes[71]=[71,82]; 

paper.setStart(); 
mid=bb[71]+(bt[63]-bb[71])/2; 
hleft = nx[63]; 
hright = nx[71]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[63]+' '+mid+' L '+nx[63]+' '+bt[63];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[72]=paper.setFinish(); 
lineNodes[72]=[71,63]; 

paper.setStart(); 
s1='M '+nx[73]+' '+bb[73]+' L '+nx[73]+' '+ny[87]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[73],nx[87])+' '+ny[87]+' L '+Math.max(nx[73],nx[87])+' '+ny[87]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[73]=paper.setFinish(); 
lineNodes[73]=[73,87]; 

paper.setStart(); 
mid=bb[75]+(bt[20]-bb[75])/2; 
hleft = nx[17]; 
hright = nx[75]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[75]+' '+bb[75]+' L '+nx[75]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[17]+' '+mid+' L '+nx[17]+' '+bt[17];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[74]=paper.setFinish(); 
lineNodes[74]=[75,17]; 

paper.setStart(); 
mid=bb[75]+(bt[20]-bb[75])/2; 
hleft = nx[66]; 
hright = nx[75]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[66]+' '+mid+' L '+nx[66]+' '+bt[66];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[75]=paper.setFinish(); 
lineNodes[75]=[75,66]; 

paper.setStart(); 
mid=bb[75]+(bt[20]-bb[75])/2; 
s3='M '+nx[37]+' '+mid+' L '+nx[37]+' '+bt[37];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[76]=paper.setFinish(); 
lineNodes[76]=[75,37]; 

paper.setStart(); 
mid=bb[75]+(bt[20]-bb[75])/2; 
s3='M '+nx[20]+' '+mid+' L '+nx[20]+' '+bt[20];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[77]=paper.setFinish(); 
lineNodes[77]=[75,20]; 

paper.setStart(); 
s1='M '+nx[76]+' '+bb[76]+' L '+nx[76]+' '+bt[47]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[78]=paper.setFinish(); 
lineNodes[78]=[76,47] ; 

paper.setStart(); 
s1='M '+nx[77]+' '+bb[77]+' L '+nx[77]+' '+bt[41]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[79]=paper.setFinish(); 
lineNodes[79]=[77,41] ; 

paper.setStart(); 
s1='M '+nx[78]+' '+bb[78]+' L '+nx[78]+' '+bt[49]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[80]=paper.setFinish(); 
lineNodes[80]=[78,49] ; 

paper.setStart(); 
s1='M '+nx[79]+' '+bb[79]+' L '+nx[79]+' '+ny[87]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[79],nx[87])+' '+ny[87]+' L '+Math.max(nx[79],nx[87])+' '+ny[87]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[81]=paper.setFinish(); 
lineNodes[81]=[79,87]; 

paper.setStart(); 
mid=bb[53]+(bt[25]-bb[53])/2; 
hleft = nx[25]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[82]+' '+bb[82]+' L '+nx[82]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[25]+' '+mid+' L '+nx[25]+' '+bt[25];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[82]=paper.setFinish(); 
lineNodes[82]=[82,25]; 

paper.setStart(); 
mid=bb[53]+(bt[25]-bb[53])/2; 
hleft = nx[83]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[83]+' '+mid+' L '+nx[83]+' '+bt[83];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[83]=paper.setFinish(); 
lineNodes[83]=[82,83]; 

paper.setStart(); 
s1='M '+nx[83]+' '+bb[83]+' L '+nx[83]+' '+bt[75]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[84]=paper.setFinish(); 
lineNodes[84]=[83,75] ; 

paper.setStart(); 
s1='M '+nx[85]+' '+bb[85]+' L '+nx[85]+' '+bt[3]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[85]=paper.setFinish(); 
lineNodes[85]=[85,3] ; 

paper.setStart(); 
mid=bb[86]+(bt[68]-bb[86])/2; 
hleft = nx[2]; 
hright = nx[86]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[86]+' '+bb[86]+' L '+nx[86]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[2]+' '+mid+' L '+nx[2]+' '+bt[2];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[86]=paper.setFinish(); 
lineNodes[86]=[86,2]; 

paper.setStart(); 
mid=bb[86]+(bt[68]-bb[86])/2; 
hleft = nx[68]; 
hright = nx[86]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[68]+' '+mid+' L '+nx[68]+' '+bt[68];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[87]=paper.setFinish(); 
lineNodes[87]=[86,68]; 

paper.setStart(); 
s1='M '+nx[87]+' '+bb[87]+' L '+nx[87]+' '+bt[9]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[88]=paper.setFinish(); 
lineNodes[88]=[87,9] ; 

paper.setStart(); 
mid=bb[88]+(bt[46]-bb[88])/2; 
hleft = nx[48]; 
hright = nx[88]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[88]+' '+bb[88]+' L '+nx[88]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[48]+' '+mid+' L '+nx[48]+' '+bt[48];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[89]=paper.setFinish(); 
lineNodes[89]=[88,48]; 

paper.setStart(); 
mid=bb[88]+(bt[46]-bb[88])/2; 
hleft = nx[46]; 
hright = nx[88]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[46]+' '+mid+' L '+nx[46]+' '+bt[46];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[90]=paper.setFinish(); 
lineNodes[90]=[88,46]; 

paper.setStart(); 
mid=bb[89]+(bt[33]-bb[89])/2; 
hleft = nx[64]; 
hright = nx[89]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[89]+' '+bb[89]+' L '+nx[89]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[64]+' '+mid+' L '+nx[64]+' '+bt[64];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[91]=paper.setFinish(); 
lineNodes[91]=[89,64]; 

paper.setStart(); 
mid=bb[89]+(bt[33]-bb[89])/2; 
hleft = nx[29]; 
hright = nx[89]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[29]+' '+mid+' L '+nx[29]+' '+bt[29];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[92]=paper.setFinish(); 
lineNodes[92]=[89,29]; 

paper.setStart(); 
mid=bb[89]+(bt[33]-bb[89])/2; 
s3='M '+nx[33]+' '+mid+' L '+nx[33]+' '+bt[33];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[93]=paper.setFinish(); 
lineNodes[93]=[89,33]; 

nlines = 94;
}