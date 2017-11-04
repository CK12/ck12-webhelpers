function initMap() { 

// Set size parameters 
mapWidth = 3748; 
mapHeight = 3729; 
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
rootx = 1327; 
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

nnodes = 104; 
njunc = 5; 

nx[0]=842;
ny[0]=2062;
nx[1]=3043;
ny[1]=3532;
nx[2]=1924;
ny[2]=2555;
nx[3]=1395;
ny[3]=1266;
nx[4]=1827;
ny[4]=2325;
nx[5]=924;
ny[5]=1540;
nx[6]=2085;
ny[6]=3532;
nx[7]=1674;
ny[7]=538;
nx[8]=924;
ny[8]=1641;
nx[9]=369;
ny[9]=1153;
nx[10]=2220;
ny[10]=3533;
nx[11]=1743;
ny[11]=3412;
nx[12]=1395;
ny[12]=1379;
nx[13]=2508;
ny[13]=3524;
nx[14]=1740;
ny[14]=2554;
nx[15]=1034;
ny[15]=1373;
nx[16]=920;
ny[16]=644;
nx[17]=922;
ny[17]=1263;
nx[18]=1841;
ny[18]=2089;
nx[19]=1965;
ny[19]=2207;
nx[20]=1397;
ny[20]=1153;
nx[21]=1760;
ny[21]=1140;
nx[22]=1305;
ny[22]=2201;
nx[23]=2676;
ny[23]=3524;
nx[24]=996;
ny[24]=2061;
nx[25]=840;
ny[25]=2394;
nx[26]=1673;
ny[26]=1886;
nx[27]=1712;
ny[27]=2211;
nx[28]=924;
ny[28]=1964;
nx[29]=1305;
ny[29]=2088;
nx[30]=1378;
ny[30]=1619;
nx[31]=2143;
ny[31]=2834;
nx[32]=2085;
ny[32]=3043;
nx[33]=2143;
ny[33]=2537;
nx[34]=1572;
ny[34]=1743;
nx[35]=792;
ny[35]=1371;
nx[36]=1575;
ny[36]=656;
nx[37]=840;
ny[37]=2284;
nx[38]=1327;
ny[38]=288;
nx[39]=1327;
ny[39]=100;
nx[40]=924;
ny[40]=1741;
nx[41]=1778;
ny[41]=654;
nx[42]=2676;
ny[42]=3412;
nx[43]=924;
ny[43]=1855;
nx[44]=2860;
ny[44]=3532;
nx[45]=1510;
ny[45]=1504;
nx[46]=742;
ny[46]=650;
nx[47]=3208;
ny[47]=3532;
nx[48]=1126;
ny[48]=2200;
nx[49]=1827;
ny[49]=2427;
nx[50]=2143;
ny[50]=2431;
nx[51]=842;
ny[51]=2169;
nx[52]=920;
ny[52]=892;
nx[53]=1670;
ny[53]=1252;
nx[54]=552;
ny[54]=1391;
nx[55]=2151;
ny[55]=3411;
nx[56]=1447;
ny[56]=3532;
nx[57]=2331;
ny[57]=3042;
nx[58]=920;
ny[58]=993;
nx[59]=1672;
ny[59]=787;
nx[60]=1305;
ny[60]=1973;
nx[61]=1668;
ny[61]=1625;
nx[62]=2143;
ny[62]=2927;
nx[63]=1510;
ny[63]=1619;
nx[64]=920;
ny[64]=794;
nx[65]=2209;
ny[65]=3043;
nx[66]=1965;
ny[66]=3043;
nx[67]=1672;
ny[67]=894;
nx[68]=2143;
ny[68]=2735;
nx[69]=2348;
ny[69]=3533;
nx[70]=1662;
ny[70]=3523;
nx[71]=1175;
ny[71]=3404;
nx[72]=1574;
ny[72]=1021;
nx[73]=3548;
ny[73]=3531;
nx[74]=1814;
ny[74]=3530;
nx[75]=2151;
ny[75]=3285;
nx[76]=906;
ny[76]=2501;
nx[77]=1767;
ny[77]=1743;
nx[78]=369;
ny[78]=1284;
nx[79]=1489;
ny[79]=2202;
nx[80]=3378;
ny[80]=3531;
nx[81]=920;
ny[81]=531;
nx[82]=1859;
ny[82]=1259;
nx[83]=3292;
ny[83]=3411;
nx[84]=2143;
ny[84]=2325;
nx[85]=1447;
ny[85]=3412;
nx[86]=1327;
ny[86]=189;
nx[87]=1304;
ny[87]=1498;
nx[88]=1760;
ny[88]=1030;
nx[89]=552;
ny[89]=1285;
nx[90]=920;
ny[90]=1153;
nx[91]=2151;
ny[91]=3182;
nx[92]=2676;
ny[92]=3629;
nx[93]=761;
ny[93]=2501;
nx[94]=2143;
ny[94]=2633;
nx[95]=1099;
ny[95]=638;
nx[96]=200;
ny[96]=1279;
nx[97]=1948;
ny[97]=3531;
nx[98]=1327;
ny[98]=403;
nx[99]=2151;
ny[99]=3108;
nx[100]=920;
ny[100]=714;
nx[101]=1672;
ny[101]=715;
nx[102]=1673;
ny[102]=1807;
nx[103]=923;
ny[103]=1440;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[24, 51, 28]; 
members[1]=[80, 73, 83, 47]; 
members[2]=[49, 14]; 
members[3]=[20, 12]; 
members[4]=[49, 19, 84]; 
members[5]=[8, 103]; 
members[6]=[97, 10, 69, 55]; 
members[7]=[41, 98, 36, 81]; 
members[8]=[40, 5]; 
members[9]=[96, 78, 20, 89, 58, 90]; 
members[10]=[97, 69, 6, 55]; 
members[11]=[70, 71, 74, 75, 83, 85, 55, 42]; 
members[12]=[3, 45, 87]; 
members[13]=[42, 44, 23]; 
members[14]=[49, 2]; 
members[15]=[17, 35, 103]; 
members[16]=[81, 100, 46, 95]; 
members[17]=[90, 35, 15]; 
members[18]=[19, 27, 60, 29]; 
members[19]=[4, 18, 27, 84]; 
members[20]=[9, 58, 3, 90]; 
members[21]=[88, 82, 53]; 
members[22]=[48, 29, 79]; 
members[23]=[44, 42, 92, 13]; 
members[24]=[0, 28]; 
members[25]=[76, 93, 37]; 
members[26]=[102]; 
members[27]=[19, 18]; 
members[28]=[24, 0, 43, 60]; 
members[29]=[79, 48, 18, 22, 60]; 
members[30]=[61, 45, 63]; 
members[31]=[68, 62]; 
members[32]=[65, 66, 99, 57, 62]; 
members[33]=[50, 94]; 
members[34]=[61, 102, 77]; 
members[35]=[17, 15, 103]; 
members[36]=[41, 101, 7]; 
members[37]=[25, 51]; 
members[38]=[98, 86]; 
members[39]=[86]; 
members[40]=[8, 43]; 
members[41]=[36, 101, 7]; 
members[42]=[11, 71, 75, 44, 13, 83, 85, 23, 55]; 
members[43]=[40, 28, 60]; 
members[44]=[42, 13, 23]; 
members[45]=[12, 87, 61, 30, 63]; 
members[46]=[16, 81, 100, 95]; 
members[47]=[80, 73, 83, 1]; 
members[48]=[29, 22, 79]; 
members[49]=[2, 4, 14]; 
members[50]=[33, 84]; 
members[51]=[0, 37]; 
members[52]=[64, 58]; 
members[53]=[82, 21]; 
members[54]=[89]; 
members[55]=[97, 11, 69, 6, 71, 42, 75, 83, 85, 10]; 
members[56]=[85]; 
members[57]=[32, 65, 66, 99, 62]; 
members[58]=[9, 90, 20, 52]; 
members[59]=[67, 101]; 
members[60]=[43, 18, 87, 28, 29]; 
members[61]=[34, 77, 45, 30, 63]; 
members[62]=[32, 65, 66, 57, 31]; 
members[63]=[61, 45, 30]; 
members[64]=[100, 52]; 
members[65]=[32, 66, 99, 57, 62]; 
members[66]=[32, 65, 99, 57, 62]; 
members[67]=[72, 88, 59]; 
members[68]=[94, 31]; 
members[69]=[97, 10, 6, 55]; 
members[70]=[74, 11]; 
members[71]=[11, 42, 75, 83, 85, 55]; 
members[72]=[88, 67]; 
members[73]=[80, 83, 47, 1]; 
members[74]=[11, 70]; 
members[75]=[71, 42, 11, 83, 85, 55, 91]; 
members[76]=[25, 93]; 
members[77]=[34, 61, 102]; 
members[78]=[96, 9, 89]; 
members[79]=[48, 29, 22]; 
members[80]=[73, 83, 47, 1]; 
members[81]=[98, 7, 46, 16, 95]; 
members[82]=[21, 53]; 
members[83]=[1, 11, 71, 73, 42, 75, 47, 80, 85, 55]; 
members[84]=[4, 50, 19]; 
members[85]=[11, 71, 42, 75, 83, 55, 56]; 
members[86]=[38, 39]; 
members[87]=[12, 60, 45]; 
members[88]=[72, 67, 21]; 
members[89]=[96, 9, 78, 54]; 
members[90]=[17, 58, 20, 9]; 
members[91]=[99, 75]; 
members[92]=[23]; 
members[93]=[25, 76]; 
members[94]=[33, 68]; 
members[95]=[16, 81, 100, 46]; 
members[96]=[9, 78, 89]; 
members[97]=[10, 69, 6, 55]; 
members[98]=[81, 38, 7]; 
members[99]=[32, 65, 66, 57, 91]; 
members[100]=[64, 16, 46, 95]; 
members[101]=[41, 59, 36]; 
members[102]=[26, 34, 77]; 
members[103]=[35, 5, 15]; 

return members[i]; 
} 

function drawMap(sfac) { 

var t; 
var rect; 
var tbox; 

paper.clear(); 

paper.setStart(); 
t=paper.text(nx[0],ny[0]-10,'Protein Synthesis').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[0]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Protein-Synthesis/#Protein Synthesis", target: "_top"});
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
t=paper.text(nx[1],ny[1]-10,'Male Reproductive\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[1]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Male-Reproductive-System---Reproduction-and-Human-Development/#Male Reproductive System", target: "_top"});
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
t=paper.text(nx[2],ny[2]-10,'Plant Adaptations and\nResponses').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[2]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Plant-Adaptations-and-Responses/#Plant Adaptations and Responses", target: "_top"});
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
t=paper.text(nx[3],ny[3]-10,'Earth Forms and Life\nBegins').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[3]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Earth-Forms-and-Life-Begins/#Earth Forms and Life Begins", target: "_top"});
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
t=paper.text(nx[4],ny[4]-10,'Plant Tissues and\nGrowth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[4]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Plant-Tissues-and-Growth/#Plant Tissues and Growth", target: "_top"});
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
t=paper.text(nx[5],ny[5],'Gregor Mendel and\nGenetics').attr({fill:"#666666","font-size": 14*sfac[5]});
tBox=t.getBBox(); 
bt[5]=ny[5]-(tBox.height/2+10*sfac[5]);
bb[5]=ny[5]+(tBox.height/2+10*sfac[5]);
bl[5]=nx[5]-(tBox.width/2+10*sfac[5]);
br[5]=nx[5]+(tBox.width/2+10*sfac[5]);
rect=paper.rect(bl[5], bt[5], br[5]-bl[5], bb[5]-bt[5], 10*sfac[5]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[5]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[6],ny[6]-10,'The Respiratory\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[6]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Respiratory-System---The-Circulatory,-Respiratory,-Digestive,-and-Excretory-Systems/#The Respiratory System", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[6]=ny[6]-10-(tBox.height/2+10*sfac[6]);
bb[6]=ny[6]-10+(tBox.height/2+10*sfac[6]);
bl[6]=nx[6]-(tBox.width/2+10*sfac[6]);
br[6]=nx[6]+(tBox.width/2+10*sfac[6]);
var nwidth = br[6]-bl[6]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[6] = bl[6] - delta; 
    br[6] = br[6] + delta; 
} 
bb[6] = bb[6]+20; 
rect=paper.rect(bl[6], bt[6], br[6]-bl[6], bb[6]-bt[6], 10*sfac[6]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[6]-42,bb[6]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[6]-18,bb[6]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[6]+5,bb[6]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[6]+25,bb[6]-25,20,20); 
t.toFront(); 
b[6]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[7],ny[7],'The Principles of\nEcology').attr({fill:"#666666","font-size": 14*sfac[7]});
tBox=t.getBBox(); 
bt[7]=ny[7]-(tBox.height/2+10*sfac[7]);
bb[7]=ny[7]+(tBox.height/2+10*sfac[7]);
bl[7]=nx[7]-(tBox.width/2+10*sfac[7]);
br[7]=nx[7]+(tBox.width/2+10*sfac[7]);
rect=paper.rect(bl[7], bt[7], br[7]-bl[7], bb[7]-bt[7], 10*sfac[7]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[7]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[8],ny[8],"Mendel's Investigations").attr({fill:"#666666","font-size": 14*sfac[8]});
tBox=t.getBBox(); 
bt[8]=ny[8]-(tBox.height/2+10*sfac[8]);
bb[8]=ny[8]+(tBox.height/2+10*sfac[8]);
bl[8]=nx[8]-(tBox.width/2+10*sfac[8]);
br[8]=nx[8]+(tBox.width/2+10*sfac[8]);
rect=paper.rect(bl[8], bt[8], br[8]-bl[8], bb[8]-bt[8], 10*sfac[8]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[8]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[9],ny[9]-10,'Photosynthesis and Cellular\nRespiration').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[9]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Science-I:-The-Scientific-Method/#Photosynthesis and Cellular Respiration", target: "_top"});
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
t=paper.text(nx[10],ny[10]-10,'The Digestive\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[10]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Digestive-System---The-Circulatory,-Respiratory,-Digestive,-and-Excretory-Systems/#The Digestive System", target: "_top"});
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
t=paper.text(nx[11],ny[11],'The Nervous and Endocrine\nSystems').attr({fill:"#666666","font-size": 14*sfac[11]});
tBox=t.getBBox(); 
bt[11]=ny[11]-(tBox.height/2+10*sfac[11]);
bb[11]=ny[11]+(tBox.height/2+10*sfac[11]);
bl[11]=nx[11]-(tBox.width/2+10*sfac[11]);
br[11]=nx[11]+(tBox.width/2+10*sfac[11]);
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[11]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[12],ny[12]-10,'The Evolution of Multicellular\nLife').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[12]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Evolution-of-Multicellular-Life/#The Evolution of Multicellular Life", target: "_top"});
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
t=paper.text(nx[13],ny[13]-10,'Nonspecific Disease').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[13]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Nonspecific-Defenses/#Nonspecific Disease", target: "_top"});
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
t=paper.text(nx[14],ny[14]-10,'Variation in Plant Life\nCycles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[14]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Variation-in-Plant-Life-Cycles/#Variation in Plant Life Cycles", target: "_top"});
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
t=paper.text(nx[15],ny[15]-10,'Reproduction and\nMeiosis').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[15]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reproduction-and-Meiosis/#Reproduction and Meiosis", target: "_top"});
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
t=paper.text(nx[16],ny[16]-10,'Biochemical Reactions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[16]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Biochemical-Reactions/#Biochemical Reactions", target: "_top"});
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
t=paper.text(nx[17],ny[17]-10,'Cell Division and the\nCell Cycle').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[17]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cell-Division-and-the-Cell-Cycle/#Cell Division and the Cell Cycle", target: "_top"});
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
t=paper.text(nx[18],ny[18],'Plant Evolution and\nClassification').attr({fill:"#666666","font-size": 14*sfac[18]});
tBox=t.getBBox(); 
bt[18]=ny[18]-(tBox.height/2+10*sfac[18]);
bb[18]=ny[18]+(tBox.height/2+10*sfac[18]);
bl[18]=nx[18]-(tBox.width/2+10*sfac[18]);
br[18]=nx[18]+(tBox.width/2+10*sfac[18]);
rect=paper.rect(bl[18], bt[18], br[18]-bl[18], bb[18]-bt[18], 10*sfac[18]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[18]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[19],ny[19],'Plant Biology').attr({fill:"#666666","font-size": 14*sfac[19]});
tBox=t.getBBox(); 
bt[19]=ny[19]-(tBox.height/2+10*sfac[19]);
bb[19]=ny[19]+(tBox.height/2+10*sfac[19]);
bl[19]=nx[19]-(tBox.width/2+10*sfac[19]);
br[19]=nx[19]+(tBox.width/2+10*sfac[19]);
rect=paper.rect(bl[19], bt[19], br[19]-bl[19], bb[19]-bt[19], 10*sfac[19]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[19]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[20],ny[20],'Life: From the First\nOrganism Onward').attr({fill:"#666666","font-size": 14*sfac[20]});
tBox=t.getBBox(); 
bt[20]=ny[20]-(tBox.height/2+10*sfac[20]);
bb[20]=ny[20]+(tBox.height/2+10*sfac[20]);
bl[20]=nx[20]-(tBox.width/2+10*sfac[20]);
br[20]=nx[20]+(tBox.width/2+10*sfac[20]);
rect=paper.rect(bl[20], bt[20], br[20]-bl[20], bb[20]-bt[20], 10*sfac[20]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[20]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[21],ny[21]-10,'Human Population\nGrowth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[21]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Human-Population-Growth/#Human Population Growth", target: "_top"});
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
t=paper.text(nx[22],ny[22],'Microevolution and the\nGenetics of Populations').attr({fill:"#666666","font-size": 14*sfac[22]});
tBox=t.getBBox(); 
bt[22]=ny[22]-(tBox.height/2+10*sfac[22]);
bb[22]=ny[22]+(tBox.height/2+10*sfac[22]);
bl[22]=nx[22]-(tBox.width/2+10*sfac[22]);
br[22]=nx[22]+(tBox.width/2+10*sfac[22]);
rect=paper.rect(bl[22], bt[22], br[22]-bl[22], bb[22]-bt[22], 10*sfac[22]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[22]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[23],ny[23]-10,'The Immune Response').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[23]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Immune-Response/#The Immune Response", target: "_top"});
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
t=paper.text(nx[24],ny[24]-10,'Mutation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[24]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mutation/#Mutation", target: "_top"});
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
t=paper.text(nx[25],ny[25]-10,'Human Chromosomes\nand Genes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[25]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Human-Chromosomes-and-Genes/#Human Chromosomes and Genes", target: "_top"});
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
t=paper.text(nx[26],ny[26]-10,'Protists, Fungi, and\nHuman Disease').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[26]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Protists,-Fungi,-and-Human-Disease/#Protists, Fungi, and Human Disease", target: "_top"});
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
t=paper.text(nx[27],ny[27]-10,'Four Types of Modern\nPlants').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[27]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Four-Types-of-Modern-Plants/#Four Types of Modern Plants", target: "_top"});
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
t=paper.text(nx[28],ny[28]-10,'DNA and RNA').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[28]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/DNA-and-RNA/#DNA and RNA", target: "_top"});
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
t=paper.text(nx[29],ny[29]-10,'Darwin and the Theory\nof Evolution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[29]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Darwin-and-the-Theory-of-Evolution/#Darwin and the Theory of Evolution", target: "_top"});
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
t=paper.text(nx[30],ny[30]-10,'Prokaryotes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[30]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Prokaryotes/#Prokaryotes", target: "_top"});
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
t=paper.text(nx[31],ny[31],'From Fishes to Birds').attr({fill:"#666666","font-size": 14*sfac[31]});
tBox=t.getBBox(); 
bt[31]=ny[31]-(tBox.height/2+10*sfac[31]);
bb[31]=ny[31]+(tBox.height/2+10*sfac[31]);
bl[31]=nx[31]-(tBox.width/2+10*sfac[31]);
br[31]=nx[31]+(tBox.width/2+10*sfac[31]);
rect=paper.rect(bl[31], bt[31], br[31]-bl[31], bb[31]-bt[31], 10*sfac[31]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[31]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[32],ny[32],'Amphibians').attr({fill:"#666666","font-size": 14*sfac[32]});
tBox=t.getBBox(); 
bt[32]=ny[32]-(tBox.height/2+10*sfac[32]);
bb[32]=ny[32]+(tBox.height/2+10*sfac[32]);
bl[32]=nx[32]-(tBox.width/2+10*sfac[32]);
br[32]=nx[32]+(tBox.width/2+10*sfac[32]);
rect=paper.rect(bl[32], bt[32], br[32]-bl[32], bb[32]-bt[32], 10*sfac[32]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[32]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[33],ny[33]-10,'Mollusks and Annelids').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[33]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mollusks-and-Annelids/#Mollusks and Annelids", target: "_top"});
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
t=paper.text(nx[34],ny[34]-10,'Types of Protists').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[34]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Types-of-Protists/#Types of Protists", target: "_top"});
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
t=paper.text(nx[35],ny[35]-10,'Chromosomes and Mitosis').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[35]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Chromosomes-and-Mitosis/#Chromosomes and Mitosis", target: "_top"});
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
t=paper.text(nx[36],ny[36]-10,'The Science of\nEcology').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[36]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Science-of-Ecology/#The Science of Ecology", target: "_top"});
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
t=paper.text(nx[37],ny[37],'Human Genetics and\nBiotechnology').attr({fill:"#666666","font-size": 14*sfac[37]});
tBox=t.getBBox(); 
bt[37]=ny[37]-(tBox.height/2+10*sfac[37]);
bb[37]=ny[37]+(tBox.height/2+10*sfac[37]);
bl[37]=nx[37]-(tBox.width/2+10*sfac[37]);
br[37]=nx[37]+(tBox.width/2+10*sfac[37]);
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[37]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[38],ny[38]-10,'Science and the Natural\nWorld').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[38]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Science-and-the-Natural-World/#Science and the Natural World", target: "_top"});
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
t=paper.text(nx[39],ny[39],'Biology').attr({fill:"#000000","font-size": 24*sfac[39]});
tBox=t.getBBox(); 
bt[39]=ny[39]-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[40],ny[40]-10,'Mendelian Inheritance').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[40]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mendelian-Inheritance/#Mendelian Inheritance", target: "_top"});
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
t=paper.text(nx[41],ny[41]-10,'Recycling Matter').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[41]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Recycling-Matter/#Recycling Matter", target: "_top"});
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
t=paper.text(nx[42],ny[42],'The Immune System\nand Disease').attr({fill:"#666666","font-size": 14*sfac[42]});
tBox=t.getBBox(); 
bt[42]=ny[42]-(tBox.height/2+10*sfac[42]);
bb[42]=ny[42]+(tBox.height/2+10*sfac[42]);
bl[42]=nx[42]-(tBox.width/2+10*sfac[42]);
br[42]=nx[42]+(tBox.width/2+10*sfac[42]);
rect=paper.rect(bl[42], bt[42], br[42]-bl[42], bb[42]-bt[42], 10*sfac[42]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[42]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[43],ny[43]-10,'Molecular Genetics: From\nRNA to Proteins').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[43]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Chemistry-III:-Acids-and-Bases/#Molecular Genetics: From RNA to Proteins", target: "_top"});
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
t=paper.text(nx[44],ny[44]-10,'Environmental Problems\nand Human Health').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[44]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Environmental-Problems-and-Human-Health/#Environmental Problems and Human Health", target: "_top"});
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
t=paper.text(nx[45],ny[45],'Microorganisms: Prokaryotes\nand Viruses').attr({fill:"#666666","font-size": 14*sfac[45]});
tBox=t.getBBox(); 
bt[45]=ny[45]-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[45]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[46],ny[46]-10,'Matter and Organic\nCompounds').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[46]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Matter-and-Organic-Compounds/#Matter and Organic Compounds", target: "_top"});
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
t=paper.text(nx[47],ny[47]-10,'Female Reproductive\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[47]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Female-Reproductive-System---Reproduction-and-Human-Development/#Female Reproductive System", target: "_top"});
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
t=paper.text(nx[48],ny[48]-10,'Evidence for Evolution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[48]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Evidence-for-Evolution/#Evidence for Evolution", target: "_top"});
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
t=paper.text(nx[49],ny[49]-10,'Plant Organs: Roots,\nStems, and Leaves').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[49]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Plant-Organs:-Roots,-Stems,-and-Leaves/#Plant Organs: Roots, Stems, and Leaves", target: "_top"});
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
t=paper.text(nx[50],ny[50]-10,'Sponges, Cnidarians, Flatworms\nand Roundworms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[50]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Sponges,-Cnidarians,-Flatworms,-and-Roundworms/#Sponges, Cnidarians, Flatworms and Roundworms", target: "_top"});
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
t=paper.text(nx[51],ny[51]-10,'Regulation of Gene\nExpression').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[51]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Regulation-of-Gene-Expression/#Regulation of Gene Expression", target: "_top"});
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
t=paper.text(nx[52],ny[52]-10,'Cell Structures').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[52]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cell-Structures---Cellular-Structure-and-Function/#Cell Structures", target: "_top"});
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
t=paper.text(nx[53],ny[53]-10,'The Biodiversity Crisis').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[53]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Biodiversity-Crisis/#The Biodiversity Crisis", target: "_top"});
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
t=paper.text(nx[54],ny[54]-10,'Anerobic Respiration').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[54]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Anaerobic-Respiration/#Anerobic Respiration", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[54]=ny[54]-10-(tBox.height/2+10*sfac[54]);
bb[54]=ny[54]-10+(tBox.height/2+10*sfac[54]);
bl[54]=nx[54]-(tBox.width/2+10*sfac[54]);
br[54]=nx[54]+(tBox.width/2+10*sfac[54]);
var nwidth = br[54]-bl[54]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[54] = bl[54] - delta; 
    br[54] = br[54] + delta; 
} 
bb[54] = bb[54]+20; 
rect=paper.rect(bl[54], bt[54], br[54]-bl[54], bb[54]-bt[54], 10*sfac[54]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[54]-42,bb[54]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[54]-18,bb[54]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[54]+5,bb[54]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[54]+25,bb[54]-25,20,20); 
t.toFront(); 
b[54]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[55],ny[55],'The Circulatory, Respiratory,\nDigestive, and Excretory Systems').attr({fill:"#666666","font-size": 14*sfac[55]});
tBox=t.getBBox(); 
bt[55]=ny[55]-(tBox.height/2+10*sfac[55]);
bb[55]=ny[55]+(tBox.height/2+10*sfac[55]);
bl[55]=nx[55]-(tBox.width/2+10*sfac[55]);
br[55]=nx[55]+(tBox.width/2+10*sfac[55]);
rect=paper.rect(bl[55], bt[55], br[55]-bl[55], bb[55]-bt[55], 10*sfac[55]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[55]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[56],ny[56]-10,'Overview of Animal\nBehavior').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[56]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Overview-of-Animal-Behavior/#Overview of Animal Behavior", target: "_top"});
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
t=paper.text(nx[57],ny[57],'Birds').attr({fill:"#666666","font-size": 14*sfac[57]});
tBox=t.getBBox(); 
bt[57]=ny[57]-(tBox.height/2+10*sfac[57]);
bb[57]=ny[57]+(tBox.height/2+10*sfac[57]);
bl[57]=nx[57]-(tBox.width/2+10*sfac[57]);
br[57]=nx[57]+(tBox.width/2+10*sfac[57]);
rect=paper.rect(bl[57], bt[57], br[57]-bl[57], bb[57]-bt[57], 10*sfac[57]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[57]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[58],ny[58]-10,'Cell Transport and\nHomeostasis').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[58]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cell-Transport-and-Homeostasis/#Cell Transport and Homeostasis", target: "_top"});
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
t=paper.text(nx[59],ny[59]-10,'Biomes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[59]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Biomes/#Biomes", target: "_top"});
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
t=paper.text(nx[60],ny[60],'The Theory of Evolution').attr({fill:"#666666","font-size": 14*sfac[60]});
tBox=t.getBBox(); 
bt[60]=ny[60]-(tBox.height/2+10*sfac[60]);
bb[60]=ny[60]+(tBox.height/2+10*sfac[60]);
bl[60]=nx[60]-(tBox.width/2+10*sfac[60]);
br[60]=nx[60]+(tBox.width/2+10*sfac[60]);
rect=paper.rect(bl[60], bt[60], br[60]-bl[60], bb[60]-bt[60], 10*sfac[60]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[60]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[61],ny[61],'Eukaryotes: Protists\nand Fungi').attr({fill:"#666666","font-size": 14*sfac[61]});
tBox=t.getBBox(); 
bt[61]=ny[61]-(tBox.height/2+10*sfac[61]);
bb[61]=ny[61]+(tBox.height/2+10*sfac[61]);
bl[61]=nx[61]-(tBox.width/2+10*sfac[61]);
br[61]=nx[61]+(tBox.width/2+10*sfac[61]);
rect=paper.rect(bl[61], bt[61], br[61]-bl[61], bb[61]-bt[61], 10*sfac[61]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[61]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[62],ny[62],'Overview of Vertebrates').attr({fill:"#666666","font-size": 14*sfac[62]});
tBox=t.getBBox(); 
bt[62]=ny[62]-(tBox.height/2+10*sfac[62]);
bb[62]=ny[62]+(tBox.height/2+10*sfac[62]);
bl[62]=nx[62]-(tBox.width/2+10*sfac[62]);
br[62]=nx[62]+(tBox.width/2+10*sfac[62]);
rect=paper.rect(bl[62], bt[62], br[62]-bl[62], bb[62]-bt[62], 10*sfac[62]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[62]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[63],ny[63]-10,'Viruses').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[63]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Viruses/#Viruses", target: "_top"});
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
t=paper.text(nx[64],ny[64],'Cellular Structure and\nFunction').attr({fill:"#666666","font-size": 14*sfac[64]});
tBox=t.getBBox(); 
bt[64]=ny[64]-(tBox.height/2+10*sfac[64]);
bb[64]=ny[64]+(tBox.height/2+10*sfac[64]);
bl[64]=nx[64]-(tBox.width/2+10*sfac[64]);
br[64]=nx[64]+(tBox.width/2+10*sfac[64]);
rect=paper.rect(bl[64], bt[64], br[64]-bl[64], bb[64]-bt[64], 10*sfac[64]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[64]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[65],ny[65],'Reptiles').attr({fill:"#666666","font-size": 14*sfac[65]});
tBox=t.getBBox(); 
bt[65]=ny[65]-(tBox.height/2+10*sfac[65]);
bb[65]=ny[65]+(tBox.height/2+10*sfac[65]);
bl[65]=nx[65]-(tBox.width/2+10*sfac[65]);
br[65]=nx[65]+(tBox.width/2+10*sfac[65]);
rect=paper.rect(bl[65], bt[65], br[65]-bl[65], bb[65]-bt[65], 10*sfac[65]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[65]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[66],ny[66],'Fish').attr({fill:"#666666","font-size": 14*sfac[66]});
tBox=t.getBBox(); 
bt[66]=ny[66]-(tBox.height/2+10*sfac[66]);
bb[66]=ny[66]+(tBox.height/2+10*sfac[66]);
bl[66]=nx[66]-(tBox.width/2+10*sfac[66]);
br[66]=nx[66]+(tBox.width/2+10*sfac[66]);
rect=paper.rect(bl[66], bt[66], br[66]-bl[66], bb[66]-bt[66], 10*sfac[66]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[66]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[67],ny[67],'Communities and\nPopulations').attr({fill:"#666666","font-size": 14*sfac[67]});
tBox=t.getBBox(); 
bt[67]=ny[67]-(tBox.height/2+10*sfac[67]);
bb[67]=ny[67]+(tBox.height/2+10*sfac[67]);
bl[67]=nx[67]-(tBox.width/2+10*sfac[67]);
br[67]=nx[67]+(tBox.width/2+10*sfac[67]);
rect=paper.rect(bl[67], bt[67], br[67]-bl[67], bb[67]-bt[67], 10*sfac[67]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[67]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[68],ny[68],'Enchinoderms and Invertebrate\nChordates').attr({fill:"#666666","font-size": 14*sfac[68]});
tBox=t.getBBox(); 
bt[68]=ny[68]-(tBox.height/2+10*sfac[68]);
bb[68]=ny[68]+(tBox.height/2+10*sfac[68]);
bl[68]=nx[68]-(tBox.width/2+10*sfac[68]);
br[68]=nx[68]+(tBox.width/2+10*sfac[68]);
rect=paper.rect(bl[68], bt[68], br[68]-bl[68], bb[68]-bt[68], 10*sfac[68]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[68]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[69],ny[69]-10,'The Excretory\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[69]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Excretory-System---The-Circulatory,-Respiratory,-Digestive,-and-Excretory-Systems/#The Excretory System", target: "_top"});
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
t=paper.text(nx[70],ny[70]-10,'The Nervous System').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[70]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Nervous-System---The-Nervous-and-Endocrine-Systems/#The Nervous System", target: "_top"});
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
t=paper.text(nx[71],ny[71]-10,'Reproduction in Mammals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[71]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reproduction-in-Mammals/#Reproduction in Mammals", target: "_top"});
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
t=paper.text(nx[72],ny[72]-10,'Community Interactions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[72]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Community-Interactions/#Community Interactions", target: "_top"});
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
t=paper.text(nx[73],ny[73]-10,'Sexually Transmitted\nInfections').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[73]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Sexually-Transmitted-Infections/#Sexually Transmitted Infections", target: "_top"});
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
t=paper.text(nx[74],ny[74]-10,'The Endocrine\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[74]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Endocrine-System/#The Endocrine System", target: "_top"});
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
t=paper.text(nx[75],ny[75]-10,'Mammalian Traits').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[75]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mammalian-Traits/#Mammalian Traits", target: "_top"});
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
t=paper.text(nx[76],ny[76]-10,'Biotechnology').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[76]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Biotechnology/#Biotechnology", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[76]=ny[76]-10-(tBox.height/2+10*sfac[76]);
bb[76]=ny[76]-10+(tBox.height/2+10*sfac[76]);
bl[76]=nx[76]-(tBox.width/2+10*sfac[76]);
br[76]=nx[76]+(tBox.width/2+10*sfac[76]);
var nwidth = br[76]-bl[76]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[76] = bl[76] - delta; 
    br[76] = br[76] + delta; 
} 
bb[76] = bb[76]+20; 
rect=paper.rect(bl[76], bt[76], br[76]-bl[76], bb[76]-bt[76], 10*sfac[76]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[76]-42,bb[76]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[76]-18,bb[76]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[76]+5,bb[76]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[76]+25,bb[76]-25,20,20); 
t.toFront(); 
b[76]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[77],ny[77]-10,'Ecology of Fungi').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[77]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ecology-of-Fungi/#Ecology of Fungi", target: "_top"});
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
t=paper.text(nx[78],ny[78]-10,'Photosynthesis: Sugar\nas Food').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[78]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Photosynthesis:-Sugar-as-Food/#Photosynthesis: Sugar as Food", target: "_top"});
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
t=paper.text(nx[79],ny[79],'Macroevolution and the\nOrigin of Species').attr({fill:"#666666","font-size": 14*sfac[79]});
tBox=t.getBBox(); 
bt[79]=ny[79]-(tBox.height/2+10*sfac[79]);
bb[79]=ny[79]+(tBox.height/2+10*sfac[79]);
bl[79]=nx[79]-(tBox.width/2+10*sfac[79]);
br[79]=nx[79]+(tBox.width/2+10*sfac[79]);
rect=paper.rect(bl[79], bt[79], br[79]-bl[79], bb[79]-bt[79], 10*sfac[79]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[79]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[80],ny[80]-10,'From Fertilization to\nOld Age').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[80]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/From-Fertilization-to-Old-Age/#From Fertilization to Old Age", target: "_top"});
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
t=paper.text(nx[81],ny[81],'The Chemistry of Life').attr({fill:"#666666","font-size": 14*sfac[81]});
tBox=t.getBBox(); 
bt[81]=ny[81]-(tBox.height/2+10*sfac[81]);
bb[81]=ny[81]+(tBox.height/2+10*sfac[81]);
bl[81]=nx[81]-(tBox.width/2+10*sfac[81]);
br[81]=nx[81]+(tBox.width/2+10*sfac[81]);
rect=paper.rect(bl[81], bt[81], br[81]-bl[81], bb[81]-bt[81], 10*sfac[81]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[81]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[82],ny[82]-10,'Natural Resources and\nClimate Change').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[82]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Natural-Resources-and-Climate-Change/#Natural Resources and Climate Change", target: "_top"});
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
t=paper.text(nx[83],ny[83]-10,'Reproduction and\nHuman Development').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[83]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Nervous-System-VII:-Disorders/#Reproduction and Human Development", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[83]=ny[83]-10-(tBox.height/2+10*sfac[83]);
bb[83]=ny[83]-10+(tBox.height/2+10*sfac[83]);
bl[83]=nx[83]-(tBox.width/2+10*sfac[83]);
br[83]=nx[83]+(tBox.width/2+10*sfac[83]);
var nwidth = br[83]-bl[83]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[83] = bl[83] - delta; 
    br[83] = br[83] + delta; 
} 
bb[83] = bb[83]+20; 
rect=paper.rect(bl[83], bt[83], br[83]-bl[83], bb[83]-bt[83], 10*sfac[83]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[83]-42,bb[83]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[83]-18,bb[83]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[83]+5,bb[83]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[83]+25,bb[83]-25,20,20); 
t.toFront(); 
b[83]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[84],ny[84],'From Sponges to\nInvertebrate Chordates').attr({fill:"#666666","font-size": 14*sfac[84]});
tBox=t.getBBox(); 
bt[84]=ny[84]-(tBox.height/2+10*sfac[84]);
bb[84]=ny[84]+(tBox.height/2+10*sfac[84]);
bl[84]=nx[84]-(tBox.width/2+10*sfac[84]);
br[84]=nx[84]+(tBox.width/2+10*sfac[84]);
rect=paper.rect(bl[84], bt[84], br[84]-bl[84], bb[84]-bt[84], 10*sfac[84]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[84]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[85],ny[85]-10,'Evolution and Classification\nof Mammals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[85]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Evolution-and-Classification-of-Mammals/#Evolution and Classification of Mammals", target: "_top"});
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
t=paper.text(nx[86],ny[86],'What is Biology?').attr({fill:"#666666","font-size": 14*sfac[86]});
tBox=t.getBBox(); 
bt[86]=ny[86]-(tBox.height/2+10*sfac[86]);
bb[86]=ny[86]+(tBox.height/2+10*sfac[86]);
bl[86]=nx[86]-(tBox.width/2+10*sfac[86]);
br[86]=nx[86]+(tBox.width/2+10*sfac[86]);
rect=paper.rect(bl[86], bt[86], br[86]-bl[86], bb[86]-bt[86], 10*sfac[86]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[86]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[87],ny[87]-10,'Classification').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[87]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Classification/#Classification", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[87]=ny[87]-10-(tBox.height/2+10*sfac[87]);
bb[87]=ny[87]-10+(tBox.height/2+10*sfac[87]);
bl[87]=nx[87]-(tBox.width/2+10*sfac[87]);
br[87]=nx[87]+(tBox.width/2+10*sfac[87]);
var nwidth = br[87]-bl[87]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[87] = bl[87] - delta; 
    br[87] = br[87] + delta; 
} 
bb[87] = bb[87]+20; 
rect=paper.rect(bl[87], bt[87], br[87]-bl[87], bb[87]-bt[87], 10*sfac[87]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[87]-42,bb[87]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[87]-18,bb[87]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[87]+5,bb[87]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[87]+25,bb[87]-25,20,20); 
t.toFront(); 
b[87]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[88],ny[88]-10,'Characteristics of\nPopulations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[88]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Characteristics-of-Populations/#Characteristics of Populations", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[88]=ny[88]-10-(tBox.height/2+10*sfac[88]);
bb[88]=ny[88]-10+(tBox.height/2+10*sfac[88]);
bl[88]=nx[88]-(tBox.width/2+10*sfac[88]);
br[88]=nx[88]+(tBox.width/2+10*sfac[88]);
var nwidth = br[88]-bl[88]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[88] = bl[88] - delta; 
    br[88] = br[88] + delta; 
} 
bb[88] = bb[88]+20; 
rect=paper.rect(bl[88], bt[88], br[88]-bl[88], bb[88]-bt[88], 10*sfac[88]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[88]-42,bb[88]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[88]-18,bb[88]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[88]+5,bb[88]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[88]+25,bb[88]-25,20,20); 
t.toFront(); 
b[88]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[89],ny[89]-10,'Powering the Cell:\nCellular Respiration').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[89]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Powering-the-Cell:-Cellular-Respiration/#Powering the Cell: Cellular Respiration", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[89]=ny[89]-10-(tBox.height/2+10*sfac[89]);
bb[89]=ny[89]-10+(tBox.height/2+10*sfac[89]);
bl[89]=nx[89]-(tBox.width/2+10*sfac[89]);
br[89]=nx[89]+(tBox.width/2+10*sfac[89]);
var nwidth = br[89]-bl[89]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[89] = bl[89] - delta; 
    br[89] = br[89] + delta; 
} 
bb[89] = bb[89]+20; 
rect=paper.rect(bl[89], bt[89], br[89]-bl[89], bb[89]-bt[89], 10*sfac[89]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[89]-42,bb[89]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[89]-18,bb[89]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[89]+5,bb[89]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[89]+25,bb[89]-25,20,20); 
t.toFront(); 
b[89]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[90],ny[90],'The Cell Cycle, Mitosis\nand Meiosis').attr({fill:"#666666","font-size": 14*sfac[90]});
tBox=t.getBBox(); 
bt[90]=ny[90]-(tBox.height/2+10*sfac[90]);
bb[90]=ny[90]+(tBox.height/2+10*sfac[90]);
bl[90]=nx[90]-(tBox.width/2+10*sfac[90]);
br[90]=nx[90]+(tBox.width/2+10*sfac[90]);
rect=paper.rect(bl[90], bt[90], br[90]-bl[90], bb[90]-bt[90], 10*sfac[90]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[90]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[91],ny[91]-10,'Mammals and Animal\nBehavior').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[91]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Plants-VI:-Tissues/#Mammals and Animal Behavior", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[91]=ny[91]-10-(tBox.height/2+10*sfac[91]);
bb[91]=ny[91]-10+(tBox.height/2+10*sfac[91]);
bl[91]=nx[91]-(tBox.width/2+10*sfac[91]);
br[91]=nx[91]+(tBox.width/2+10*sfac[91]);
var nwidth = br[91]-bl[91]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[91] = bl[91] - delta; 
    br[91] = br[91] + delta; 
} 
bb[91] = bb[91]+20; 
rect=paper.rect(bl[91], bt[91], br[91]-bl[91], bb[91]-bt[91], 10*sfac[91]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[91]-42,bb[91]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[91]-18,bb[91]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[91]+5,bb[91]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[91]+25,bb[91]-25,20,20); 
t.toFront(); 
b[91]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[92],ny[92]-10,'Immune System\nDiseases').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[92]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Immune-System-Diseases/#Immune System Diseases", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[92]=ny[92]-10-(tBox.height/2+10*sfac[92]);
bb[92]=ny[92]-10+(tBox.height/2+10*sfac[92]);
bl[92]=nx[92]-(tBox.width/2+10*sfac[92]);
br[92]=nx[92]+(tBox.width/2+10*sfac[92]);
var nwidth = br[92]-bl[92]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[92] = bl[92] - delta; 
    br[92] = br[92] + delta; 
} 
bb[92] = bb[92]+20; 
rect=paper.rect(bl[92], bt[92], br[92]-bl[92], bb[92]-bt[92], 10*sfac[92]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[92]-42,bb[92]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[92]-18,bb[92]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[92]+5,bb[92]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[92]+25,bb[92]-25,20,20); 
t.toFront(); 
b[92]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[93],ny[93]-10,'Human Inheritance').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[93]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Human-Inheritance/#Human Inheritance", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[93]=ny[93]-10-(tBox.height/2+10*sfac[93]);
bb[93]=ny[93]-10+(tBox.height/2+10*sfac[93]);
bl[93]=nx[93]-(tBox.width/2+10*sfac[93]);
br[93]=nx[93]+(tBox.width/2+10*sfac[93]);
var nwidth = br[93]-bl[93]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[93] = bl[93] - delta; 
    br[93] = br[93] + delta; 
} 
bb[93] = bb[93]+20; 
rect=paper.rect(bl[93], bt[93], br[93]-bl[93], bb[93]-bt[93], 10*sfac[93]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[93]-42,bb[93]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[93]-18,bb[93]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[93]+5,bb[93]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[93]+25,bb[93]-25,20,20); 
t.toFront(); 
b[93]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[94],ny[94]-10,'Anthropods and Insects').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[94]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Arthropods-and-Insects/#Anthropods and Insects", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[94]=ny[94]-10-(tBox.height/2+10*sfac[94]);
bb[94]=ny[94]-10+(tBox.height/2+10*sfac[94]);
bl[94]=nx[94]-(tBox.width/2+10*sfac[94]);
br[94]=nx[94]+(tBox.width/2+10*sfac[94]);
var nwidth = br[94]-bl[94]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[94] = bl[94] - delta; 
    br[94] = br[94] + delta; 
} 
bb[94] = bb[94]+20; 
rect=paper.rect(bl[94], bt[94], br[94]-bl[94], bb[94]-bt[94], 10*sfac[94]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[94]-42,bb[94]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[94]-18,bb[94]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[94]+5,bb[94]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[94]+25,bb[94]-25,20,20); 
t.toFront(); 
b[94]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[95],ny[95],'Water, Acids, Bases').attr({fill:"#666666","font-size": 14*sfac[95]});
tBox=t.getBBox(); 
bt[95]=ny[95]-(tBox.height/2+10*sfac[95]);
bb[95]=ny[95]+(tBox.height/2+10*sfac[95]);
bl[95]=nx[95]-(tBox.width/2+10*sfac[95]);
br[95]=nx[95]+(tBox.width/2+10*sfac[95]);
rect=paper.rect(bl[95], bt[95], br[95]-bl[95], bb[95]-bt[95], 10*sfac[95]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[95]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[96],ny[96]-10,'Energy for Life').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[96]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Energy-for-Life/#Energy for Life", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[96]=ny[96]-10-(tBox.height/2+10*sfac[96]);
bb[96]=ny[96]-10+(tBox.height/2+10*sfac[96]);
bl[96]=nx[96]-(tBox.width/2+10*sfac[96]);
br[96]=nx[96]+(tBox.width/2+10*sfac[96]);
var nwidth = br[96]-bl[96]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[96] = bl[96] - delta; 
    br[96] = br[96] + delta; 
} 
bb[96] = bb[96]+20; 
rect=paper.rect(bl[96], bt[96], br[96]-bl[96], bb[96]-bt[96], 10*sfac[96]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[96]-42,bb[96]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[96]-18,bb[96]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[96]+5,bb[96]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[96]+25,bb[96]-25,20,20); 
t.toFront(); 
b[96]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[97],ny[97]-10,'The Circulatory\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[97]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Circulatory-System/#The Circulatory System", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[97]=ny[97]-10-(tBox.height/2+10*sfac[97]);
bb[97]=ny[97]-10+(tBox.height/2+10*sfac[97]);
bl[97]=nx[97]-(tBox.width/2+10*sfac[97]);
br[97]=nx[97]+(tBox.width/2+10*sfac[97]);
var nwidth = br[97]-bl[97]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[97] = bl[97] - delta; 
    br[97] = br[97] + delta; 
} 
bb[97] = bb[97]+20; 
rect=paper.rect(bl[97], bt[97], br[97]-bl[97], bb[97]-bt[97], 10*sfac[97]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[97]-42,bb[97]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[97]-18,bb[97]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[97]+5,bb[97]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[97]+25,bb[97]-25,20,20); 
t.toFront(); 
b[97]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[98],ny[98]-10,'Biology: The Study of\nLife').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[98]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Biology:-The-Study-of-Life/#Biology: The Study of Life", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[98]=ny[98]-10-(tBox.height/2+10*sfac[98]);
bb[98]=ny[98]-10+(tBox.height/2+10*sfac[98]);
bl[98]=nx[98]-(tBox.width/2+10*sfac[98]);
br[98]=nx[98]+(tBox.width/2+10*sfac[98]);
var nwidth = br[98]-bl[98]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[98] = bl[98] - delta; 
    br[98] = br[98] + delta; 
} 
bb[98] = bb[98]+20; 
rect=paper.rect(bl[98], bt[98], br[98]-bl[98], bb[98]-bt[98], 10*sfac[98]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[98]-42,bb[98]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[98]-18,bb[98]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[98]+5,bb[98]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[98]+25,bb[98]-25,20,20); 
t.toFront(); 
b[98]=paper.setFinish(); 

bb[99]= ny[99]; 
bt[99]= ny[99]; 
bl[99]= nx[99]; 
br[99]= nx[99]; 

bb[100]= ny[100]; 
bt[100]= ny[100]; 
bl[100]= nx[100]; 
br[100]= nx[100]; 

bb[101]= ny[101]; 
bt[101]= ny[101]; 
bl[101]= nx[101]; 
br[101]= nx[101]; 

bb[102]= ny[102]; 
bt[102]= ny[102]; 
bl[102]= nx[102]; 
br[102]= nx[102]; 

bb[103]= ny[103]; 
bt[103]= ny[103]; 
bl[103]= nx[103]; 
br[103]= nx[103]; 

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
b[87].click(function() {recenter(87);}); 
b[88].click(function() {recenter(88);}); 
b[89].click(function() {recenter(89);}); 
b[90].click(function() {recenter(90);}); 
b[91].click(function() {recenter(91);}); 
b[92].click(function() {recenter(92);}); 
b[93].click(function() {recenter(93);}); 
b[94].click(function() {recenter(94);}); 
b[95].click(function() {recenter(95);}); 
b[96].click(function() {recenter(96);}); 
b[97].click(function() {recenter(97);}); 
b[98].click(function() {recenter(98);}); 
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
b[87].hover(function() {nodeHover(87);}, function() {nodeUnhover(87);}); 
b[88].hover(function() {nodeHover(88);}, function() {nodeUnhover(88);}); 
b[89].hover(function() {nodeHover(89);}, function() {nodeUnhover(89);}); 
b[90].hover(function() {nodeHover(90);}, function() {nodeUnhover(90);}); 
b[91].hover(function() {nodeHover(91);}, function() {nodeUnhover(91);}); 
b[92].hover(function() {nodeHover(92);}, function() {nodeUnhover(92);}); 
b[93].hover(function() {nodeHover(93);}, function() {nodeUnhover(93);}); 
b[94].hover(function() {nodeHover(94);}, function() {nodeUnhover(94);}); 
b[95].hover(function() {nodeHover(95);}, function() {nodeUnhover(95);}); 
b[96].hover(function() {nodeHover(96);}, function() {nodeUnhover(96);}); 
b[97].hover(function() {nodeHover(97);}, function() {nodeUnhover(97);}); 
b[98].hover(function() {nodeHover(98);}, function() {nodeUnhover(98);}); 
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
s1='M '+nx[0]+' '+bb[0]+' L '+nx[0]+' '+bt[51]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[0,51] ; 

paper.setStart(); 
s1='M '+nx[3]+' '+bb[3]+' L '+nx[3]+' '+bt[12]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[3,12] ; 

paper.setStart(); 
s1='M '+nx[4]+' '+bb[4]+' L '+nx[4]+' '+bt[49]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[4,49] ; 

paper.setStart(); 
s1='M '+nx[5]+' '+bb[5]+' L '+nx[5]+' '+bt[8]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[5,8] ; 

paper.setStart(); 
mid=bb[7]+(bt[41]-bb[7])/2; 
hleft = nx[41]; 
hright = nx[7]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[7]+' '+bb[7]+' L '+nx[7]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[41]+' '+mid+' L '+nx[41]+' '+bt[41];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[7,41]; 

paper.setStart(); 
mid=bb[7]+(bt[41]-bb[7])/2; 
hleft = nx[36]; 
hright = nx[7]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[36]+' '+mid+' L '+nx[36]+' '+bt[36];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[7,36]; 

paper.setStart(); 
s1='M '+nx[8]+' '+bb[8]+' L '+nx[8]+' '+bt[40]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[8,40] ; 

paper.setStart(); 
mid=bb[9]+(bt[96]-bb[9])/2; 
s2='M '+nx[9]+' '+bb[9]+' L '+nx[9]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[78]+' '+mid+' L '+nx[78]+' '+bt[78];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[9,78]; 

paper.setStart(); 
mid=bb[9]+(bt[96]-bb[9])/2; 
hleft = nx[96]; 
hright = nx[9]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[96]+' '+mid+' L '+nx[96]+' '+bt[96];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[9,96]; 

paper.setStart(); 
mid=bb[9]+(bt[96]-bb[9])/2; 
hleft = nx[89]; 
hright = nx[9]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[89]+' '+mid+' L '+nx[89]+' '+bt[89];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[9,89]; 

paper.setStart(); 
mid=bb[11]+(bt[70]-bb[11])/2; 
hleft = nx[70]; 
hright = nx[11]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[11]+' '+bb[11]+' L '+nx[11]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[70]+' '+mid+' L '+nx[70]+' '+bt[70];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[11,70]; 

paper.setStart(); 
mid=bb[11]+(bt[70]-bb[11])/2; 
hleft = nx[74]; 
hright = nx[11]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[74]+' '+mid+' L '+nx[74]+' '+bt[74];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[11,74]; 

paper.setStart(); 
mid=bb[12]+(bt[87]-bb[12])/2; 
hleft = nx[45]; 
hright = nx[12]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[12]+' '+bb[12]+' L '+nx[12]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[45]+' '+mid+' L '+nx[45]+' '+bt[45];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[12,45]; 

paper.setStart(); 
mid=bb[12]+(bt[87]-bb[12])/2; 
hleft = nx[87]; 
hright = nx[12]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[87]+' '+mid+' L '+nx[87]+' '+bt[87];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[12,87]; 

paper.setStart(); 
s1='M '+nx[15]+' '+bb[15]+' L '+nx[15]+' '+ny[103]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[15],nx[103])+' '+ny[103]+' L '+Math.max(nx[15],nx[103])+' '+ny[103]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[15,103]; 

paper.setStart(); 
s1='M '+nx[16]+' '+bb[16]+' L '+nx[16]+' '+ny[100]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[16],nx[100])+' '+ny[100]+' L '+Math.max(nx[16],nx[100])+' '+ny[100]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[16,100]; 

paper.setStart(); 
mid=bb[17]+(bt[35]-bb[17])/2; 
hleft = nx[15]; 
hright = nx[17]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[17]+' '+bb[17]+' L '+nx[17]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[15]+' '+mid+' L '+nx[15]+' '+bt[15];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[17,15]; 

paper.setStart(); 
mid=bb[17]+(bt[35]-bb[17])/2; 
hleft = nx[35]; 
hright = nx[17]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[35]+' '+mid+' L '+nx[35]+' '+bt[35];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[17,35]; 

paper.setStart(); 
mid=bb[18]+(bt[19]-bb[18])/2; 
hleft = nx[27]; 
hright = nx[18]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[18]+' '+bb[18]+' L '+nx[18]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[27]+' '+mid+' L '+nx[27]+' '+bt[27];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[18,27]; 

paper.setStart(); 
mid=bb[18]+(bt[19]-bb[18])/2; 
hleft = nx[19]; 
hright = nx[18]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[19]+' '+mid+' L '+nx[19]+' '+bt[19];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[18,19]; 

paper.setStart(); 
mid=bb[19]+(bt[4]-bb[19])/2; 
hleft = nx[84]; 
hright = nx[19]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[19]+' '+bb[19]+' L '+nx[19]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[84]+' '+mid+' L '+nx[84]+' '+bt[84];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[19,84]; 

paper.setStart(); 
mid=bb[19]+(bt[4]-bb[19])/2; 
hleft = nx[4]; 
hright = nx[19]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[4]+' '+mid+' L '+nx[4]+' '+bt[4];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[19,4]; 

paper.setStart(); 
s1='M '+nx[20]+' '+bb[20]+' L '+nx[20]+' '+bt[3]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[20,3] ; 

paper.setStart(); 
mid=bb[21]+(bt[53]-bb[21])/2; 
hleft = nx[82]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[21]+' '+bb[21]+' L '+nx[21]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[82]+' '+mid+' L '+nx[82]+' '+bt[82];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[21,82]; 

paper.setStart(); 
mid=bb[21]+(bt[53]-bb[21])/2; 
hleft = nx[53]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[53]+' '+mid+' L '+nx[53]+' '+bt[53];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[21,53]; 

paper.setStart(); 
s1='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+bt[92]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[23,92] ; 

paper.setStart(); 
mid=bb[25]+(bt[76]-bb[25])/2; 
hleft = nx[93]; 
hright = nx[25]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[25]+' '+bb[25]+' L '+nx[25]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[93]+' '+mid+' L '+nx[93]+' '+bt[93];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[25,93]; 

paper.setStart(); 
mid=bb[25]+(bt[76]-bb[25])/2; 
hleft = nx[76]; 
hright = nx[25]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[76]+' '+mid+' L '+nx[76]+' '+bt[76];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[25,76]; 

paper.setStart(); 
mid=bb[28]+(bt[24]-bb[28])/2; 
hleft = nx[24]; 
hright = nx[28]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[28]+' '+bb[28]+' L '+nx[28]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[24]+' '+mid+' L '+nx[24]+' '+bt[24];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[28,24]; 

paper.setStart(); 
mid=bb[28]+(bt[24]-bb[28])/2; 
hleft = nx[0]; 
hright = nx[28]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[0]+' '+mid+' L '+nx[0]+' '+bt[0];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[28,0]; 

paper.setStart(); 
mid=bb[29]+(bt[48]-bb[29])/2; 
hleft = nx[48]; 
hright = nx[29]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[29]+' '+bb[29]+' L '+nx[29]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[48]+' '+mid+' L '+nx[48]+' '+bt[48];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[29,48]; 

paper.setStart(); 
mid=bb[29]+(bt[48]-bb[29])/2; 
hleft = nx[79]; 
hright = nx[29]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[79]+' '+mid+' L '+nx[79]+' '+bt[79];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[29,79]; 

paper.setStart(); 
mid=bb[29]+(bt[48]-bb[29])/2; 
s3='M '+nx[22]+' '+mid+' L '+nx[22]+' '+bt[22];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[29,22]; 

paper.setStart(); 
s1='M '+nx[31]+' '+bb[31]+' L '+nx[31]+' '+bt[62]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[31,62] ; 

paper.setStart(); 
s1='M '+nx[32]+' '+bb[32]+' L '+nx[32]+' '+ny[99]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[32],nx[99])+' '+ny[99]+' L '+Math.max(nx[32],nx[99])+' '+ny[99]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[32,99]; 

paper.setStart(); 
s1='M '+nx[33]+' '+bb[33]+' L '+nx[33]+' '+bt[94]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[33,94] ; 

paper.setStart(); 
s1='M '+nx[34]+' '+bb[34]+' L '+nx[34]+' '+ny[102]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[34],nx[102])+' '+ny[102]+' L '+Math.max(nx[34],nx[102])+' '+ny[102]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[34,102]; 

paper.setStart(); 
s1='M '+nx[35]+' '+bb[35]+' L '+nx[35]+' '+ny[103]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[35],nx[103])+' '+ny[103]+' L '+Math.max(nx[35],nx[103])+' '+ny[103]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[35,103]; 

paper.setStart(); 
s1='M '+nx[36]+' '+bb[36]+' L '+nx[36]+' '+ny[101]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[36],nx[101])+' '+ny[101]+' L '+Math.max(nx[36],nx[101])+' '+ny[101]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[36,101]; 

paper.setStart(); 
s1='M '+nx[37]+' '+bb[37]+' L '+nx[37]+' '+bt[25]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[37,25] ; 

paper.setStart(); 
s1='M '+nx[38]+' '+bb[38]+' L '+nx[38]+' '+bt[98]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[38,98] ; 

paper.setStart(); 
s1='M '+nx[39]+' '+bb[39]+' L '+nx[39]+' '+bt[86]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[39,86] ; 

paper.setStart(); 
s1='M '+nx[40]+' '+bb[40]+' L '+nx[40]+' '+bt[43]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[40,43] ; 

paper.setStart(); 
s1='M '+nx[41]+' '+bb[41]+' L '+nx[41]+' '+ny[101]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[41],nx[101])+' '+ny[101]+' L '+Math.max(nx[41],nx[101])+' '+ny[101]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[41,101]; 

paper.setStart(); 
mid=bb[42]+(bt[23]-bb[42])/2; 
hleft = nx[13]; 
hright = nx[42]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[42]+' '+bb[42]+' L '+nx[42]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[13]+' '+mid+' L '+nx[13]+' '+bt[13];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[42,13]; 

paper.setStart(); 
mid=bb[42]+(bt[23]-bb[42])/2; 
s3='M '+nx[23]+' '+mid+' L '+nx[23]+' '+bt[23];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[42,23]; 

paper.setStart(); 
mid=bb[42]+(bt[23]-bb[42])/2; 
hleft = nx[44]; 
hright = nx[42]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[44]+' '+mid+' L '+nx[44]+' '+bt[44];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[42,44]; 

paper.setStart(); 
mid=bb[43]+(bt[28]-bb[43])/2; 
hleft = nx[60]; 
hright = nx[43]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[43]+' '+bb[43]+' L '+nx[43]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[60]+' '+mid+' L '+nx[60]+' '+bt[60];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[43,60]; 

paper.setStart(); 
mid=bb[43]+(bt[28]-bb[43])/2; 
hleft = nx[28]; 
hright = nx[43]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[28]+' '+mid+' L '+nx[28]+' '+bt[28];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[43,28]; 

paper.setStart(); 
mid=bb[45]+(bt[30]-bb[45])/2; 
s2='M '+nx[45]+' '+bb[45]+' L '+nx[45]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[63]+' '+mid+' L '+nx[63]+' '+bt[63];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[49]=paper.setFinish(); 
lineNodes[49]=[45,63]; 

paper.setStart(); 
mid=bb[45]+(bt[30]-bb[45])/2; 
hleft = nx[30]; 
hright = nx[45]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[30]+' '+mid+' L '+nx[30]+' '+bt[30];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[45,30]; 

paper.setStart(); 
mid=bb[45]+(bt[30]-bb[45])/2; 
hleft = nx[61]; 
hright = nx[45]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[61]+' '+mid+' L '+nx[61]+' '+bt[61];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[45,61]; 

paper.setStart(); 
s1='M '+nx[46]+' '+bb[46]+' L '+nx[46]+' '+ny[100]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[46],nx[100])+' '+ny[100]+' L '+Math.max(nx[46],nx[100])+' '+ny[100]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[46,100]; 

paper.setStart(); 
mid=bb[49]+(bt[14]-bb[49])/2; 
hleft = nx[2]; 
hright = nx[49]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[49]+' '+bb[49]+' L '+nx[49]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[2]+' '+mid+' L '+nx[2]+' '+bt[2];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[49,2]; 

paper.setStart(); 
mid=bb[49]+(bt[14]-bb[49])/2; 
hleft = nx[14]; 
hright = nx[49]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[14]+' '+mid+' L '+nx[14]+' '+bt[14];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[49,14]; 

paper.setStart(); 
s1='M '+nx[50]+' '+bb[50]+' L '+nx[50]+' '+bt[33]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[50,33] ; 

paper.setStart(); 
s1='M '+nx[51]+' '+bb[51]+' L '+nx[51]+' '+bt[37]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[51,37] ; 

paper.setStart(); 
s1='M '+nx[52]+' '+bb[52]+' L '+nx[52]+' '+bt[58]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[52,58] ; 

paper.setStart(); 
mid=bb[55]+(bt[97]-bb[55])/2; 
s2='M '+nx[55]+' '+bb[55]+' L '+nx[55]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[6]+' '+mid+' L '+nx[6]+' '+bt[6];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[55,6]; 

paper.setStart(); 
mid=bb[55]+(bt[97]-bb[55])/2; 
s3='M '+nx[10]+' '+mid+' L '+nx[10]+' '+bt[10];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[55,10]; 

paper.setStart(); 
mid=bb[55]+(bt[97]-bb[55])/2; 
hleft = nx[97]; 
hright = nx[55]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[97]+' '+mid+' L '+nx[97]+' '+bt[97];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[55,97]; 

paper.setStart(); 
mid=bb[55]+(bt[97]-bb[55])/2; 
hleft = nx[69]; 
hright = nx[55]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[69]+' '+mid+' L '+nx[69]+' '+bt[69];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[55,69]; 

paper.setStart(); 
s1='M '+nx[57]+' '+bb[57]+' L '+nx[57]+' '+ny[99]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[57],nx[99])+' '+ny[99]+' L '+Math.max(nx[57],nx[99])+' '+ny[99]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[57,99]; 

paper.setStart(); 
mid=bb[58]+(bt[90]-bb[58])/2; 
hleft = nx[20]; 
hright = nx[58]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[58]+' '+bb[58]+' L '+nx[58]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[20]+' '+mid+' L '+nx[20]+' '+bt[20];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[58,20]; 

paper.setStart(); 
mid=bb[58]+(bt[90]-bb[58])/2; 
hleft = nx[9]; 
hright = nx[58]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[9]+' '+mid+' L '+nx[9]+' '+bt[9];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[58,9]; 

paper.setStart(); 
mid=bb[58]+(bt[90]-bb[58])/2; 
s3='M '+nx[90]+' '+mid+' L '+nx[90]+' '+bt[90];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[58,90]; 

paper.setStart(); 
s1='M '+nx[59]+' '+bb[59]+' L '+nx[59]+' '+bt[67]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[59,67] ; 

paper.setStart(); 
mid=bb[60]+(bt[29]-bb[60])/2; 
hleft = nx[18]; 
hright = nx[60]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[60]+' '+bb[60]+' L '+nx[60]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[18]+' '+mid+' L '+nx[18]+' '+bt[18];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[60,18]; 

paper.setStart(); 
mid=bb[60]+(bt[29]-bb[60])/2; 
hleft = nx[29]; 
hright = nx[60]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[29]+' '+mid+' L '+nx[29]+' '+bt[29];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[60,29]; 

paper.setStart(); 
mid=bb[61]+(bt[34]-bb[61])/2; 
hleft = nx[77]; 
hright = nx[61]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[61]+' '+bb[61]+' L '+nx[61]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[77]+' '+mid+' L '+nx[77]+' '+bt[77];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[69]=paper.setFinish(); 
lineNodes[69]=[61,77]; 

paper.setStart(); 
mid=bb[61]+(bt[34]-bb[61])/2; 
hleft = nx[34]; 
hright = nx[61]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[34]+' '+mid+' L '+nx[34]+' '+bt[34];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[70]=paper.setFinish(); 
lineNodes[70]=[61,34]; 

paper.setStart(); 
mid=bb[62]+(bt[57]-bb[62])/2; 
s2='M '+nx[62]+' '+bb[62]+' L '+nx[62]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[65]+' '+mid+' L '+nx[65]+' '+bt[65];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[71]=paper.setFinish(); 
lineNodes[71]=[62,65]; 

paper.setStart(); 
mid=bb[62]+(bt[57]-bb[62])/2; 
hleft = nx[66]; 
hright = nx[62]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[66]+' '+mid+' L '+nx[66]+' '+bt[66];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[72]=paper.setFinish(); 
lineNodes[72]=[62,66]; 

paper.setStart(); 
mid=bb[62]+(bt[57]-bb[62])/2; 
s3='M '+nx[32]+' '+mid+' L '+nx[32]+' '+bt[32];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[73]=paper.setFinish(); 
lineNodes[73]=[62,32]; 

paper.setStart(); 
mid=bb[62]+(bt[57]-bb[62])/2; 
hleft = nx[57]; 
hright = nx[62]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[57]+' '+mid+' L '+nx[57]+' '+bt[57];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[74]=paper.setFinish(); 
lineNodes[74]=[62,57]; 

paper.setStart(); 
s1='M '+nx[64]+' '+bb[64]+' L '+nx[64]+' '+bt[52]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[75]=paper.setFinish(); 
lineNodes[75]=[64,52] ; 

paper.setStart(); 
s1='M '+nx[65]+' '+bb[65]+' L '+nx[65]+' '+ny[99]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[65],nx[99])+' '+ny[99]+' L '+Math.max(nx[65],nx[99])+' '+ny[99]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[76]=paper.setFinish(); 
lineNodes[76]=[65,99]; 

paper.setStart(); 
s1='M '+nx[66]+' '+bb[66]+' L '+nx[66]+' '+ny[99]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[66],nx[99])+' '+ny[99]+' L '+Math.max(nx[66],nx[99])+' '+ny[99]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[77]=paper.setFinish(); 
lineNodes[77]=[66,99]; 

paper.setStart(); 
mid=bb[67]+(bt[72]-bb[67])/2; 
hleft = nx[72]; 
hright = nx[67]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[67]+' '+bb[67]+' L '+nx[67]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[72]+' '+mid+' L '+nx[72]+' '+bt[72];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[78]=paper.setFinish(); 
lineNodes[78]=[67,72]; 

paper.setStart(); 
mid=bb[67]+(bt[72]-bb[67])/2; 
hleft = nx[88]; 
hright = nx[67]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[88]+' '+mid+' L '+nx[88]+' '+bt[88];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[79]=paper.setFinish(); 
lineNodes[79]=[67,88]; 

paper.setStart(); 
s1='M '+nx[68]+' '+bb[68]+' L '+nx[68]+' '+bt[31]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[80]=paper.setFinish(); 
lineNodes[80]=[68,31] ; 

paper.setStart(); 
mid=bb[75]+(bt[71]-bb[75])/2; 
s2='M '+nx[75]+' '+bb[75]+' L '+nx[75]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[42]+' '+mid+' L '+nx[42]+' '+bt[42];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[81]=paper.setFinish(); 
lineNodes[81]=[75,42]; 

paper.setStart(); 
mid=bb[75]+(bt[71]-bb[75])/2; 
hleft = nx[83]; 
hright = nx[75]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[83]+' '+mid+' L '+nx[83]+' '+bt[83];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[82]=paper.setFinish(); 
lineNodes[82]=[75,83]; 

paper.setStart(); 
mid=bb[75]+(bt[71]-bb[75])/2; 
s3='M '+nx[55]+' '+mid+' L '+nx[55]+' '+bt[55];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[83]=paper.setFinish(); 
lineNodes[83]=[75,55]; 

paper.setStart(); 
mid=bb[75]+(bt[71]-bb[75])/2; 
hleft = nx[71]; 
hright = nx[75]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[71]+' '+mid+' L '+nx[71]+' '+bt[71];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[84]=paper.setFinish(); 
lineNodes[84]=[75,71]; 

paper.setStart(); 
mid=bb[75]+(bt[71]-bb[75])/2; 
s3='M '+nx[85]+' '+mid+' L '+nx[85]+' '+bt[85];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[85]=paper.setFinish(); 
lineNodes[85]=[75,85]; 

paper.setStart(); 
mid=bb[75]+(bt[71]-bb[75])/2; 
s3='M '+nx[11]+' '+mid+' L '+nx[11]+' '+bt[11];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[86]=paper.setFinish(); 
lineNodes[86]=[75,11]; 

paper.setStart(); 
s1='M '+nx[77]+' '+bb[77]+' L '+nx[77]+' '+ny[102]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[77],nx[102])+' '+ny[102]+' L '+Math.max(nx[77],nx[102])+' '+ny[102]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[87]=paper.setFinish(); 
lineNodes[87]=[77,102]; 

paper.setStart(); 
mid=bb[81]+(bt[95]-bb[81])/2; 
s2='M '+nx[81]+' '+bb[81]+' L '+nx[81]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[16]+' '+mid+' L '+nx[16]+' '+bt[16];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[88]=paper.setFinish(); 
lineNodes[88]=[81,16]; 

paper.setStart(); 
mid=bb[81]+(bt[95]-bb[81])/2; 
hleft = nx[46]; 
hright = nx[81]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[46]+' '+mid+' L '+nx[46]+' '+bt[46];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[89]=paper.setFinish(); 
lineNodes[89]=[81,46]; 

paper.setStart(); 
mid=bb[81]+(bt[95]-bb[81])/2; 
hleft = nx[95]; 
hright = nx[81]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[95]+' '+mid+' L '+nx[95]+' '+bt[95];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[90]=paper.setFinish(); 
lineNodes[90]=[81,95]; 

paper.setStart(); 
mid=bb[83]+(bt[80]-bb[83])/2; 
hleft = nx[73]; 
hright = nx[83]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[83]+' '+bb[83]+' L '+nx[83]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[73]+' '+mid+' L '+nx[73]+' '+bt[73];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[91]=paper.setFinish(); 
lineNodes[91]=[83,73]; 

paper.setStart(); 
mid=bb[83]+(bt[80]-bb[83])/2; 
s3='M '+nx[80]+' '+mid+' L '+nx[80]+' '+bt[80];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[92]=paper.setFinish(); 
lineNodes[92]=[83,80]; 

paper.setStart(); 
mid=bb[83]+(bt[80]-bb[83])/2; 
hleft = nx[1]; 
hright = nx[83]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[1]+' '+mid+' L '+nx[1]+' '+bt[1];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[93]=paper.setFinish(); 
lineNodes[93]=[83,1]; 

paper.setStart(); 
mid=bb[83]+(bt[80]-bb[83])/2; 
s3='M '+nx[47]+' '+mid+' L '+nx[47]+' '+bt[47];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[94]=paper.setFinish(); 
lineNodes[94]=[83,47]; 

paper.setStart(); 
s1='M '+nx[84]+' '+bb[84]+' L '+nx[84]+' '+bt[50]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[95]=paper.setFinish(); 
lineNodes[95]=[84,50] ; 

paper.setStart(); 
s1='M '+nx[85]+' '+bb[85]+' L '+nx[85]+' '+bt[56]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[96]=paper.setFinish(); 
lineNodes[96]=[85,56] ; 

paper.setStart(); 
s1='M '+nx[86]+' '+bb[86]+' L '+nx[86]+' '+bt[38]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[97]=paper.setFinish(); 
lineNodes[97]=[86,38] ; 

paper.setStart(); 
s1='M '+nx[87]+' '+bb[87]+' L '+nx[87]+' '+bt[60]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[98]=paper.setFinish(); 
lineNodes[98]=[87,60] ; 

paper.setStart(); 
s1='M '+nx[88]+' '+bb[88]+' L '+nx[88]+' '+bt[21]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[99]=paper.setFinish(); 
lineNodes[99]=[88,21] ; 

paper.setStart(); 
s1='M '+nx[89]+' '+bb[89]+' L '+nx[89]+' '+bt[54]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[100]=paper.setFinish(); 
lineNodes[100]=[89,54] ; 

paper.setStart(); 
s1='M '+nx[90]+' '+bb[90]+' L '+nx[90]+' '+bt[17]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[101]=paper.setFinish(); 
lineNodes[101]=[90,17] ; 

paper.setStart(); 
s1='M '+nx[91]+' '+bb[91]+' L '+nx[91]+' '+bt[75]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[102]=paper.setFinish(); 
lineNodes[102]=[91,75] ; 

paper.setStart(); 
s1='M '+nx[94]+' '+bb[94]+' L '+nx[94]+' '+bt[68]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[103]=paper.setFinish(); 
lineNodes[103]=[94,68] ; 

paper.setStart(); 
s1='M '+nx[95]+' '+bb[95]+' L '+nx[95]+' '+ny[100]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[95],nx[100])+' '+ny[100]+' L '+Math.max(nx[95],nx[100])+' '+ny[100]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[104]=paper.setFinish(); 
lineNodes[104]=[95,100]; 

paper.setStart(); 
mid=bb[98]+(bt[81]-bb[98])/2; 
hleft = nx[81]; 
hright = nx[98]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[98]+' '+bb[98]+' L '+nx[98]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[81]+' '+mid+' L '+nx[81]+' '+bt[81];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[105]=paper.setFinish(); 
lineNodes[105]=[98,81]; 

paper.setStart(); 
mid=bb[98]+(bt[81]-bb[98])/2; 
hleft = nx[7]; 
hright = nx[98]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[7]+' '+mid+' L '+nx[7]+' '+bt[7];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[106]=paper.setFinish(); 
lineNodes[106]=[98,7]; 

paper.setStart(); 
s1='M '+nx[99]+' '+bb[99]+' L '+nx[99]+' '+bt[91]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[107]=paper.setFinish(); 
lineNodes[107]=[99,91] ; 

paper.setStart(); 
s1='M '+nx[100]+' '+bb[100]+' L '+nx[100]+' '+bt[64]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[108]=paper.setFinish(); 
lineNodes[108]=[100,64] ; 

paper.setStart(); 
s1='M '+nx[101]+' '+bb[101]+' L '+nx[101]+' '+bt[59]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[109]=paper.setFinish(); 
lineNodes[109]=[101,59] ; 

paper.setStart(); 
s1='M '+nx[102]+' '+bb[102]+' L '+nx[102]+' '+bt[26]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[110]=paper.setFinish(); 
lineNodes[110]=[102,26] ; 

paper.setStart(); 
s1='M '+nx[103]+' '+bb[103]+' L '+nx[103]+' '+bt[5]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[111]=paper.setFinish(); 
lineNodes[111]=[103,5] ; 

nlines = 112;
}