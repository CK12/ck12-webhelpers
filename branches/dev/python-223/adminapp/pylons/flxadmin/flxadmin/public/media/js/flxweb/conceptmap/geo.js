function initMap() { 

// Set size parameters 
mapWidth = 2896; 
mapHeight = 3131; 
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
rootx = 1591; 
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

nnodes = 95; 
njunc = 9; 

nx[0]=2602;
ny[0]=2431;
nx[1]=2508;
ny[1]=2672;
nx[2]=1161;
ny[2]=1993;
nx[3]=1174;
ny[3]=1161;
nx[4]=404;
ny[4]=1433;
nx[5]=653;
ny[5]=1432;
nx[6]=819;
ny[6]=1872;
nx[7]=1174;
ny[7]=1430;
nx[8]=2517;
ny[8]=3031;
nx[9]=1611;
ny[9]=2239;
nx[10]=1981;
ny[10]=1365;
nx[11]=1420;
ny[11]=2232;
nx[12]=1780;
ny[12]=440;
nx[13]=1591;
ny[13]=100;
nx[14]=1161;
ny[14]=1866;
nx[15]=1263;
ny[15]=2232;
nx[16]=2272;
ny[16]=2431;
nx[17]=1868;
ny[17]=1034;
nx[18]=2656;
ny[18]=1919;
nx[19]=416;
ny[19]=1159;
nx[20]=1780;
ny[20]=701;
nx[21]=2015;
ny[21]=1917;
nx[22]=1342;
ny[22]=1988;
nx[23]=1467;
ny[23]=439;
nx[24]=1675;
ny[24]=1162;
nx[25]=2166;
ny[25]=1366;
nx[26]=2347;
ny[26]=2196;
nx[27]=631;
ny[27]=1160;
nx[28]=2345;
ny[28]=1919;
nx[29]=751;
ny[29]=1546;
nx[30]=1868;
ny[30]=897;
nx[31]=1955;
ny[31]=1488;
nx[32]=2411;
ny[32]=1489;
nx[33]=986;
ny[33]=1865;
nx[34]=2174;
ny[34]=1918;
nx[35]=636;
ny[35]=1983;
nx[36]=1487;
ny[36]=1281;
nx[37]=416;
ny[37]=1032;
nx[38]=1174;
ny[38]=1038;
nx[39]=416;
ny[39]=1835;
nx[40]=2515;
ny[40]=2930;
nx[41]=2092;
ny[41]=2432;
nx[42]=2602;
ny[42]=2549;
nx[43]=2094;
ny[43]=2550;
nx[44]=1641;
ny[44]=440;
nx[45]=902;
ny[45]=1740;
nx[46]=1270;
ny[46]=556;
nx[47]=200;
ny[47]=1158;
nx[48]=1016;
ny[48]=1279;
nx[49]=1371;
ny[49]=328;
nx[50]=852;
ny[50]=1279;
nx[51]=2502;
ny[51]=1920;
nx[52]=2658;
ny[52]=2029;
nx[53]=1351;
ny[53]=2367;
nx[54]=1331;
ny[54]=1279;
nx[55]=2257;
ny[55]=1623;
nx[56]=2166;
ny[56]=1496;
nx[57]=2422;
ny[57]=2786;
nx[58]=1368;
ny[58]=703;
nx[59]=2272;
ny[59]=2551;
nx[60]=406;
ny[60]=1537;
nx[61]=1467;
ny[61]=557;
nx[62]=526;
ny[62]=1314;
nx[63]=1342;
ny[63]=2099;
nx[64]=2345;
ny[64]=1785;
nx[65]=1174;
ny[65]=1280;
nx[66]=416;
ny[66]=1732;
nx[67]=963;
ny[67]=1992;
nx[68]=2596;
ny[68]=2788;
nx[69]=559;
ny[69]=1541;
nx[70]=1780;
ny[70]=551;
nx[71]=1938;
ny[71]=441;
nx[72]=2440;
ny[72]=2430;
nx[73]=1780;
ny[73]=330;
nx[74]=1272;
ny[74]=440;
nx[75]=2080;
ny[75]=1626;
nx[76]=813;
ny[76]=897;
nx[77]=2063;
ny[77]=1162;
nx[78]=636;
ny[78]=1865;
nx[79]=1804;
ny[79]=1364;
nx[80]=2347;
ny[80]=2302;
nx[81]=1182;
ny[81]=2366;
nx[82]=1591;
ny[82]=199;
nx[83]=1674;
ny[83]=1361;
nx[84]=2696;
ny[84]=2678;
nx[85]=1102;
ny[85]=2232;
nx[86]=1867;
ny[86]=1222;
nx[87]=1780;
ny[87]=628;
nx[88]=2344;
ny[88]=1699;
nx[89]=528;
ny[89]=1231;
nx[90]=2345;
ny[90]=2098;
nx[91]=1174;
ny[91]=1352;
nx[92]=2514;
ny[92]=2845;
nx[93]=1369;
ny[93]=625;
nx[94]=654;
ny[94]=1605;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[16, 72, 41, 42, 80]; 
members[1]=[84, 57, 42, 68]; 
members[2]=[67, 22, 14]; 
members[3]=[65, 36, 38, 48, 50, 54]; 
members[4]=[60, 5, 62]; 
members[5]=[4, 69, 62, 29]; 
members[6]=[33, 14, 78, 45]; 
members[7]=[91]; 
members[8]=[40]; 
members[9]=[11, 15, 85, 63]; 
members[10]=[25, 86, 79]; 
members[11]=[9, 15, 85, 63]; 
members[12]=[73, 44, 70, 71]; 
members[13]=[82]; 
members[14]=[33, 2, 67, 6, 45, 78, 22]; 
members[15]=[9, 11, 81, 53, 85, 63]; 
members[16]=[0, 72, 41, 80, 59]; 
members[17]=[24, 77, 30]; 
members[18]=[64, 34, 51, 52, 21, 28]; 
members[19]=[27, 89, 37, 47]; 
members[20]=[87]; 
members[21]=[64, 34, 18, 51, 90, 28]; 
members[22]=[2, 67, 14, 63]; 
members[23]=[49, 74, 61]; 
members[24]=[17, 83, 77, 86]; 
members[25]=[32, 10, 79, 86, 56, 31]; 
members[26]=[80, 90]; 
members[27]=[89, 19, 37, 47]; 
members[28]=[64, 34, 18, 51, 21, 90]; 
members[29]=[5, 94, 69]; 
members[30]=[17, 58, 76]; 
members[31]=[32, 25, 56]; 
members[32]=[88, 25, 56, 31]; 
members[33]=[14, 78, 45, 6]; 
members[34]=[64, 18, 51, 21, 90, 28]; 
members[35]=[78]; 
members[36]=[65, 3, 48, 50, 54, 91]; 
members[37]=[38, 76, 47, 19, 27]; 
members[38]=[3, 76, 37]; 
members[39]=[66]; 
members[40]=[8, 92]; 
members[41]=[0, 16, 72, 43, 80]; 
members[42]=[0, 1, 84]; 
members[43]=[41]; 
members[44]=[73, 71, 12, 87]; 
members[45]=[33, 66, 6, 14, 78, 94]; 
members[46]=[74, 93]; 
members[47]=[27, 19, 37]; 
members[48]=[65, 3, 36, 50, 54, 91]; 
members[49]=[74, 82, 73, 23]; 
members[50]=[65, 3, 36, 48, 54, 91]; 
members[51]=[64, 34, 18, 21, 28]; 
members[52]=[90, 18]; 
members[53]=[81, 15]; 
members[54]=[65, 3, 36, 48, 50, 91]; 
members[55]=[88, 56, 75]; 
members[56]=[32, 75, 55, 25, 31]; 
members[57]=[68, 1, 92]; 
members[58]=[76, 93, 30]; 
members[59]=[16]; 
members[60]=[4]; 
members[61]=[93, 23]; 
members[62]=[89, 4, 5]; 
members[63]=[9, 11, 15, 85, 22]; 
members[64]=[34, 18, 51, 21, 88, 28]; 
members[65]=[3, 36, 48, 50, 54, 91]; 
members[66]=[45, 94, 39]; 
members[67]=[2, 22, 14]; 
members[68]=[1, 92, 57]; 
members[69]=[29, 5, 94]; 
members[70]=[12, 87]; 
members[71]=[73, 12, 44, 87]; 
members[72]=[80, 0, 41, 16]; 
members[73]=[71, 12, 44, 49, 82]; 
members[74]=[49, 46, 23]; 
members[75]=[56, 55]; 
members[76]=[58, 30, 37, 38]; 
members[77]=[24, 17, 86]; 
members[78]=[33, 35, 6, 45, 14]; 
members[79]=[25, 10, 86]; 
members[80]=[0, 72, 41, 16, 26]; 
members[81]=[53, 15]; 
members[82]=[49, 13, 73]; 
members[83]=[24, 86]; 
members[84]=[1, 42]; 
members[85]=[11, 9, 15, 63]; 
members[86]=[10, 77, 79, 83, 24, 25]; 
members[87]=[44, 71, 20, 70]; 
members[88]=[64, 32, 55]; 
members[89]=[27, 19, 62]; 
members[90]=[34, 52, 21, 26, 28]; 
members[91]=[65, 36, 7, 48, 50, 54]; 
members[92]=[40, 57, 68]; 
members[93]=[58, 46, 61]; 
members[94]=[66, 69, 45, 29]; 

return members[i]; 
} 

function drawMap(sfac) { 

var t; 
var rect; 
var tbox; 

paper.clear(); 

paper.setStart(); 
t=paper.text(nx[0],ny[0]-10,'Exploring Similar\nSolids').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[0]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exploring-Similar-Solids/#Exploring Similar Solids", target: "_top"});
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
t=paper.text(nx[1],ny[1]-10,'Exploring Symmetry').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[1]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exploring-Symmetry/#Exploring Symmetry", target: "_top"});
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
t=paper.text(nx[2],ny[2],'Extension: Laws of\nSines and Cosines').attr({fill:"#666666","font-size": 14*sfac[2]});
tBox=t.getBBox(); 
bt[2]=ny[2]-(tBox.height/2+10*sfac[2]);
bb[2]=ny[2]+(tBox.height/2+10*sfac[2]);
bl[2]=nx[2]-(tBox.width/2+10*sfac[2]);
br[2]=nx[2]+(tBox.width/2+10*sfac[2]);
rect=paper.rect(bl[2], bt[2], br[2]-bl[2], bb[2]-bt[2], 10*sfac[2]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[2]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[3],ny[3],'Relationships\nwith Triangles').attr({fill:"#666666","font-size": 14*sfac[3]});
tBox=t.getBBox(); 
bt[3]=ny[3]-(tBox.height/2+10*sfac[3]);
bb[3]=ny[3]+(tBox.height/2+10*sfac[3]);
bl[3]=nx[3]-(tBox.width/2+10*sfac[3]);
br[3]=nx[3]+(tBox.width/2+10*sfac[3]);
rect=paper.rect(bl[3], bt[3], br[3]-bl[3], bb[3]-bt[3], 10*sfac[3]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[3]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[4],ny[4]-10,'Ratios and\nProportions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[4]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ratios-and-Proportions---Similarity/#Ratios and Proportions", target: "_top"});
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
t=paper.text(nx[5],ny[5],'Similar Polygons').attr({fill:"#666666","font-size": 14*sfac[5]});
tBox=t.getBBox(); 
bt[5]=ny[5]-(tBox.height/2+10*sfac[5]);
bb[5]=ny[5]+(tBox.height/2+10*sfac[5]);
bl[5]=nx[5]-(tBox.width/2+10*sfac[5]);
br[5]=nx[5]+(tBox.width/2+10*sfac[5]);
rect=paper.rect(bl[5], bt[5], br[5]-bl[5], bb[5]-bt[5], 10*sfac[5]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[5]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[6],ny[6]-10,'Using SImilar Right\nTriangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[6]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Using-Similar-Right-Triangles/#Using SImilar Right Triangles", target: "_top"});
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
t=paper.text(nx[7],ny[7],'Extension:\nIndirect Proof').attr({fill:"#666666","font-size": 14*sfac[7]});
tBox=t.getBBox(); 
bt[7]=ny[7]-(tBox.height/2+10*sfac[7]);
bb[7]=ny[7]+(tBox.height/2+10*sfac[7]);
bl[7]=nx[7]-(tBox.width/2+10*sfac[7]);
br[7]=nx[7]+(tBox.width/2+10*sfac[7]);
rect=paper.rect(bl[7], bt[7], br[7]-bl[7], bb[7]-bt[7], 10*sfac[7]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[7]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[8],ny[8],'Extension: Tesselations').attr({fill:"#666666","font-size": 14*sfac[8]});
tBox=t.getBBox(); 
bt[8]=ny[8]-(tBox.height/2+10*sfac[8]);
bb[8]=ny[8]+(tBox.height/2+10*sfac[8]);
bl[8]=nx[8]-(tBox.width/2+10*sfac[8]);
br[8]=nx[8]+(tBox.width/2+10*sfac[8]);
rect=paper.rect(bl[8], bt[8], br[8]-bl[8], bb[8]-bt[8], 10*sfac[8]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[8]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[9],ny[9],'Extension: Writing and Graphing\nthe Equations of Circles').attr({fill:"#666666","font-size": 14*sfac[9]});
tBox=t.getBBox(); 
bt[9]=ny[9]-(tBox.height/2+10*sfac[9]);
bb[9]=ny[9]+(tBox.height/2+10*sfac[9]);
bl[9]=nx[9]-(tBox.width/2+10*sfac[9]);
br[9]=nx[9]+(tBox.width/2+10*sfac[9]);
rect=paper.rect(bl[9], bt[9], br[9]-bl[9], bb[9]-bt[9], 10*sfac[9]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[9]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[10],ny[10]-10,'Parallel and Perpendicular\nLines in the Coordinate Plane').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[10]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-of-Perpendicular-Lines/#Parallel and Perpendicular Lines in the Coordinate Plane", target: "_top"});
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
t=paper.text(nx[11],ny[11],'Inscribed Angles').attr({fill:"#666666","font-size": 14*sfac[11]});
tBox=t.getBBox(); 
bt[11]=ny[11]-(tBox.height/2+10*sfac[11]);
bb[11]=ny[11]+(tBox.height/2+10*sfac[11]);
bl[11]=nx[11]-(tBox.width/2+10*sfac[11]);
br[11]=nx[11]+(tBox.width/2+10*sfac[11]);
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[11]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[12],ny[12]-10,'Conditional\nStatements').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[12]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Conditional-Statements/#Conditional Statements", target: "_top"});
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
t=paper.text(nx[13],ny[13],'Geometry').attr({fill:"#000000","font-size": 24*sfac[13]});
tBox=t.getBBox(); 
bt[13]=ny[13]-(tBox.height/2+10*sfac[13]);
bb[13]=ny[13]+(tBox.height/2+10*sfac[13]);
bl[13]=nx[13]-(tBox.width/2+10*sfac[13]);
br[13]=nx[13]+(tBox.width/2+10*sfac[13]);
rect=paper.rect(bl[13], bt[13], br[13]-bl[13], bb[13]-bt[13], 10*sfac[13]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[13]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[14],ny[14]-10,'Tangent, Sine, Cosine').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[14]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Tangent,-Sine-and-Cosine/#Tangent, Sine, Cosine", target: "_top"});
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
t=paper.text(nx[15],ny[15]-10,'Properties of Chords').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[15]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-of-Chords/#Properties of Chords", target: "_top"});
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
t=paper.text(nx[16],ny[16]-10,'Surface Area of\nPyramids and Cones').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[16]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Surface-Area-of-Pyramids-and-Cones/#Surface Area of Pyramids and Cones", target: "_top"});
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
t=paper.text(nx[17],ny[17]-10,'Lines and Angles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[17]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Lines-and-Angles/#Lines and Angles", target: "_top"});
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
t=paper.text(nx[18],ny[18]-10,'Circumference and\nArc Length').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[18]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Circumference-and-Arc-Length/#Circumference and Arc Length", target: "_top"});
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
t=paper.text(nx[19],ny[19]-10,'Triangle Congruence\nUsing ASA, AAS and HL').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[19]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Triangle-Congruence-Using-ASA,-AAS,-and-HL/#Triangle Congruence Using ASA, AAS and HL", target: "_top"});
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
t=paper.text(nx[20],ny[20]-10,'Proofs About Angle\nPairs and Segments').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[20]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Proofs-about-Angle-Pairs-and-Segments/#Proofs About Angle Pairs and Segments", target: "_top"});
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
t=paper.text(nx[21],ny[21]-10,'Triangles and\nParallelograms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[21]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Triangles-and-Parallelograms/#Triangles and Parallelograms", target: "_top"});
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
t=paper.text(nx[22],ny[22],'Circles').attr({fill:"#666666","font-size": 14*sfac[22]});
tBox=t.getBBox(); 
bt[22]=ny[22]-(tBox.height/2+10*sfac[22]);
bb[22]=ny[22]+(tBox.height/2+10*sfac[22]);
bl[22]=nx[22]-(tBox.width/2+10*sfac[22]);
br[22]=nx[22]+(tBox.width/2+10*sfac[22]);
rect=paper.rect(bl[22], bt[22], br[22]-bl[22], bb[22]-bt[22], 10*sfac[22]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[22]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[23],ny[23]-10,'Angles and\nMeasurement').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[23]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angles-and-Measurement/#Angles and Measurement", target: "_top"});
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
t=paper.text(nx[24],ny[24]-10,'Properties of\nParallel Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[24]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-of-Parallel-Lines/#Properties of Parallel Lines", target: "_top"});
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
t=paper.text(nx[25],ny[25],'Polygons and\nQuadrilaterals').attr({fill:"#666666","font-size": 14*sfac[25]});
tBox=t.getBBox(); 
bt[25]=ny[25]-(tBox.height/2+10*sfac[25]);
bb[25]=ny[25]+(tBox.height/2+10*sfac[25]);
bl[25]=nx[25]-(tBox.width/2+10*sfac[25]);
br[25]=nx[25]+(tBox.width/2+10*sfac[25]);
rect=paper.rect(bl[25], bt[25], br[25]-bl[25], bb[25]-bt[25], 10*sfac[25]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[25]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[26],ny[26],'Surface Area\nand Volume').attr({fill:"#666666","font-size": 14*sfac[26]});
tBox=t.getBBox(); 
bt[26]=ny[26]-(tBox.height/2+10*sfac[26]);
bb[26]=ny[26]+(tBox.height/2+10*sfac[26]);
bl[26]=nx[26]-(tBox.width/2+10*sfac[26]);
br[26]=nx[26]+(tBox.width/2+10*sfac[26]);
rect=paper.rect(bl[26], bt[26], br[26]-bl[26], bb[26]-bt[26], 10*sfac[26]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[26]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[27],ny[27]-10,'Triangle Congruence\nUsing SSS and SAS').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[27]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Triangle-Congruence-using-SSS-and-SAS/#Triangle Congruence Using SSS and SAS", target: "_top"});
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
t=paper.text(nx[28],ny[28]-10,'Area and Perimeter\nof Regular Polygons').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[28]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Regular-Polygons/#Area and Perimeter of Regular Polygons", target: "_top"});
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
t=paper.text(nx[29],ny[29]-10,'Similarity by SSS\nand SAS').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[29]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Similarity-by-SSS-and-SAS/#Similarity by SSS and SAS", target: "_top"});
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
t=paper.text(nx[30],ny[30],'Parallel and\nPerpendicular Lines').attr({fill:"#666666","font-size": 14*sfac[30]});
tBox=t.getBBox(); 
bt[30]=ny[30]-(tBox.height/2+10*sfac[30]);
bb[30]=ny[30]+(tBox.height/2+10*sfac[30]);
bl[30]=nx[30]-(tBox.width/2+10*sfac[30]);
br[30]=nx[30]+(tBox.width/2+10*sfac[30]);
rect=paper.rect(bl[30], bt[30], br[30]-bl[30], bb[30]-bt[30], 10*sfac[30]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[30]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[31],ny[31]-10,'Angles in Polygons').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[31]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angles-in-Polygons/#Angles in Polygons", target: "_top"});
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
t=paper.text(nx[32],ny[32]-10,'Trapezoids and Kites').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[32]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Trapezoids-and-Kites/#Trapezoids and Kites", target: "_top"});
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
t=paper.text(nx[33],ny[33]-10,'Special Right Triangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[33]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Special-Right-Triangles---Right-Triangle-Trigonometry/#Special Right Triangles", target: "_top"});
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
t=paper.text(nx[34],ny[34]-10,'Trapezoids, Rhombi,\nand Kites').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[34]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Trapezoids,-Rhombi,-and-Kites/#Trapezoids, Rhombi, and Kites", target: "_top"});
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
t=paper.text(nx[35],ny[35],'Converse of Pythagorean\nTheorem').attr({fill:"#666666","font-size": 14*sfac[35]});
tBox=t.getBBox(); 
bt[35]=ny[35]-(tBox.height/2+10*sfac[35]);
bb[35]=ny[35]+(tBox.height/2+10*sfac[35]);
bl[35]=nx[35]-(tBox.width/2+10*sfac[35]);
br[35]=nx[35]+(tBox.width/2+10*sfac[35]);
rect=paper.rect(bl[35], bt[35], br[35]-bl[35], bb[35]-bt[35], 10*sfac[35]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[35]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[36],ny[36]-10,'Inequalities in\nTriangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[36]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inequalities-in-Triangles/#Inequalities in Triangles", target: "_top"});
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
t=paper.text(nx[37],ny[37],'Congruent Figures').attr({fill:"#666666","font-size": 14*sfac[37]});
tBox=t.getBBox(); 
bt[37]=ny[37]-(tBox.height/2+10*sfac[37]);
bb[37]=ny[37]+(tBox.height/2+10*sfac[37]);
bl[37]=nx[37]-(tBox.width/2+10*sfac[37]);
br[37]=nx[37]+(tBox.width/2+10*sfac[37]);
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[37]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[38],ny[38]-10,'Triangle Sums').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[38]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Triangle-Sums/#Triangle Sums", target: "_top"});
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
t=paper.text(nx[39],ny[39],'Extension: Self-Similarity').attr({fill:"#666666","font-size": 14*sfac[39]});
tBox=t.getBBox(); 
bt[39]=ny[39]-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[40],ny[40]-10,'Composition of\nTransformations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[40]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Composition-of-Transformations/#Composition of Transformations", target: "_top"});
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
t=paper.text(nx[41],ny[41]-10,'Surface Area of\nPrisms and Cylinders').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[41]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Surface-Area-of-Prisms-and-Cylinders/#Surface Area of Prisms and Cylinders", target: "_top"});
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
t=paper.text(nx[42],ny[42],'Rigid Transformations').attr({fill:"#666666","font-size": 14*sfac[42]});
tBox=t.getBBox(); 
bt[42]=ny[42]-(tBox.height/2+10*sfac[42]);
bb[42]=ny[42]+(tBox.height/2+10*sfac[42]);
bl[42]=nx[42]-(tBox.width/2+10*sfac[42]);
br[42]=nx[42]+(tBox.width/2+10*sfac[42]);
rect=paper.rect(bl[42], bt[42], br[42]-bl[42], bb[42]-bt[42], 10*sfac[42]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[42]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[43],ny[43]-10,'Volume of Prisms\nand Cylinders').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[43]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Volume-of-Prisms-and-Cylinders/#Volume of Prisms and Cylinders", target: "_top"});
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
t=paper.text(nx[44],ny[44]-10,'Inductive\nReasoning').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[44]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inductive-Reasoning/#Inductive Reasoning", target: "_top"});
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
t=paper.text(nx[45],ny[45],'Right Angle\nTrigonometry').attr({fill:"#666666","font-size": 14*sfac[45]});
tBox=t.getBBox(); 
bt[45]=ny[45]-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[45]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[46],ny[46]-10,'Midpoints and\nBisectors').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[46]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Midpoints-and-Bisectors/#Midpoints and Bisectors", target: "_top"});
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
t=paper.text(nx[47],ny[47]-10,'Isosceles and Equilateral\nTriangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[47]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Isosceles-and-Equilateral-Triangles/#Isosceles and Equilateral Triangles", target: "_top"});
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
t=paper.text(nx[48],ny[48]-10,'Perpendicular Bisectors\nin Triangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[48]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Perpendicular-Bisectors-in-Triangles/#Perpendicular Bisectors in Triangles", target: "_top"});
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
t=paper.text(nx[49],ny[49]-10,'Points, Lines,\nand Planes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[49]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Points,-Lines,-and-Planes/#Points, Lines, and Planes", target: "_top"});
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
t=paper.text(nx[50],ny[50]-10,'Midsegments of\na Triangle').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[50]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Midsegments-of-a-Triangle/#Midsegments of a Triangle", target: "_top"});
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
t=paper.text(nx[51],ny[51],'Area of Similar\nPolygons').attr({fill:"#666666","font-size": 14*sfac[51]});
tBox=t.getBBox(); 
bt[51]=ny[51]-(tBox.height/2+10*sfac[51]);
bb[51]=ny[51]+(tBox.height/2+10*sfac[51]);
bl[51]=nx[51]-(tBox.width/2+10*sfac[51]);
br[51]=nx[51]+(tBox.width/2+10*sfac[51]);
rect=paper.rect(bl[51], bt[51], br[51]-bl[51], bb[51]-bt[51], 10*sfac[51]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[51]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[52],ny[52]-10,'Area of Circles\nand Sectors').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[52]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Areas-of-Circles-and-Sectors/#Area of Circles and Sectors", target: "_top"});
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
t=paper.text(nx[53],ny[53]-10,'Segments of Chords,\nSecants, Tangents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[53]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Segments-of-Chords,-Secants,-and-Tangents/#Segments of Chords, Secants, Tangents", target: "_top"});
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
t=paper.text(nx[54],ny[54]-10,'Medians and Altitudes\nin Triangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[54]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Medians-and-Altitudes-in-Triangles/#Medians and Altitudes in Triangles", target: "_top"});
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
t=paper.text(nx[55],ny[55]-10,'Rectangles, Rhombuses\nand Squares').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[55]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Rectangles,-Rhombuses-and-Squares/#Rectangles, Rhombuses and Squares", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[55]=ny[55]-10-(tBox.height/2+10*sfac[55]);
bb[55]=ny[55]-10+(tBox.height/2+10*sfac[55]);
bl[55]=nx[55]-(tBox.width/2+10*sfac[55]);
br[55]=nx[55]+(tBox.width/2+10*sfac[55]);
var nwidth = br[55]-bl[55]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[55] = bl[55] - delta; 
    br[55] = br[55] + delta; 
} 
bb[55] = bb[55]+20; 
rect=paper.rect(bl[55], bt[55], br[55]-bl[55], bb[55]-bt[55], 10*sfac[55]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[55]-42,bb[55]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[55]-18,bb[55]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[55]+5,bb[55]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[55]+25,bb[55]-25,20,20); 
t.toFront(); 
b[55]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[56],ny[56]-10,'Properties of\nParallelograms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[56]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-of-Parallelograms/#Properties of Parallelograms", target: "_top"});
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
t=paper.text(nx[57],ny[57]-10,'Reflections').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[57]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reflections/#Reflections", target: "_top"});
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
t=paper.text(nx[58],ny[58],'Classifying\nPolygons').attr({fill:"#666666","font-size": 14*sfac[58]});
tBox=t.getBBox(); 
bt[58]=ny[58]-(tBox.height/2+10*sfac[58]);
bb[58]=ny[58]+(tBox.height/2+10*sfac[58]);
bl[58]=nx[58]-(tBox.width/2+10*sfac[58]);
br[58]=nx[58]+(tBox.width/2+10*sfac[58]);
rect=paper.rect(bl[58], bt[58], br[58]-bl[58], bb[58]-bt[58], 10*sfac[58]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[58]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[59],ny[59]-10,'Volume of Pyramids\nand Cones').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[59]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Volume-of-Pyramids-and-Cones/#Volume of Pyramids and Cones", target: "_top"});
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
t=paper.text(nx[60],ny[60]-10,'Proportionality\nRelationships').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[60]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Proportionality-Relationships/#Proportionality Relationships", target: "_top"});
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
t=paper.text(nx[61],ny[61]-10,'Angle Pairs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[61]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angle-Pairs/#Angle Pairs", target: "_top"});
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
t=paper.text(nx[62],ny[62],'Similarity').attr({fill:"#666666","font-size": 14*sfac[62]});
tBox=t.getBBox(); 
bt[62]=ny[62]-(tBox.height/2+10*sfac[62]);
bb[62]=ny[62]+(tBox.height/2+10*sfac[62]);
bl[62]=nx[62]-(tBox.width/2+10*sfac[62]);
br[62]=nx[62]+(tBox.width/2+10*sfac[62]);
rect=paper.rect(bl[62], bt[62], br[62]-bl[62], bb[62]-bt[62], 10*sfac[62]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[62]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[63],ny[63]-10,'Parts of Circles\nand Tangent Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[63]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Parts-of-Circles-&-Tangent-Lines/#Parts of Circles and Tangent Lines", target: "_top"});
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
t=paper.text(nx[64],ny[64],'Perimeter\nand Area').attr({fill:"#666666","font-size": 14*sfac[64]});
tBox=t.getBBox(); 
bt[64]=ny[64]-(tBox.height/2+10*sfac[64]);
bb[64]=ny[64]+(tBox.height/2+10*sfac[64]);
bl[64]=nx[64]-(tBox.width/2+10*sfac[64]);
br[64]=nx[64]+(tBox.width/2+10*sfac[64]);
rect=paper.rect(bl[64], bt[64], br[64]-bl[64], bb[64]-bt[64], 10*sfac[64]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[64]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[65],ny[65]-10,'Angle Bisectors\nin Triangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[65]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angle-Bisectors-in-Triangles/#Angle Bisectors in Triangles", target: "_top"});
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
t=paper.text(nx[66],ny[66]-10,'Similarity Transformations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[66]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Similarity-Transformations/#Similarity Transformations", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[66]=ny[66]-10-(tBox.height/2+10*sfac[66]);
bb[66]=ny[66]-10+(tBox.height/2+10*sfac[66]);
bl[66]=nx[66]-(tBox.width/2+10*sfac[66]);
br[66]=nx[66]+(tBox.width/2+10*sfac[66]);
var nwidth = br[66]-bl[66]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[66] = bl[66] - delta; 
    br[66] = br[66] + delta; 
} 
bb[66] = bb[66]+20; 
rect=paper.rect(bl[66], bt[66], br[66]-bl[66], bb[66]-bt[66], 10*sfac[66]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[66]-42,bb[66]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[66]-18,bb[66]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[66]+5,bb[66]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[66]+25,bb[66]-25,20,20); 
t.toFront(); 
b[66]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[67],ny[67],'Inverse Trigonometric\nRatios').attr({fill:"#666666","font-size": 14*sfac[67]});
tBox=t.getBBox(); 
bt[67]=ny[67]-(tBox.height/2+10*sfac[67]);
bb[67]=ny[67]+(tBox.height/2+10*sfac[67]);
bl[67]=nx[67]-(tBox.width/2+10*sfac[67]);
br[67]=nx[67]+(tBox.width/2+10*sfac[67]);
rect=paper.rect(bl[67], bt[67], br[67]-bl[67], bb[67]-bt[67], 10*sfac[67]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[67]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[68],ny[68]-10,'Rotations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[68]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Rotations/#Rotations", target: "_top"});
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
t=paper.text(nx[69],ny[69]-10,'Similarity by AA').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[69]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Similarity-by-AA/#Similarity by AA", target: "_top"});
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
t=paper.text(nx[70],ny[70],'Deductive\nReasoning').attr({fill:"#666666","font-size": 14*sfac[70]});
tBox=t.getBBox(); 
bt[70]=ny[70]-(tBox.height/2+10*sfac[70]);
bb[70]=ny[70]+(tBox.height/2+10*sfac[70]);
bl[70]=nx[70]-(tBox.width/2+10*sfac[70]);
br[70]=nx[70]+(tBox.width/2+10*sfac[70]);
rect=paper.rect(bl[70], bt[70], br[70]-bl[70], bb[70]-bt[70], 10*sfac[70]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[70]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[71],ny[71]-10,'Algebraic and\nCongruence Properties').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[71]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Algebraic-and-Congruence-Properties/#Algebraic and Congruence Properties", target: "_top"});
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
t=paper.text(nx[72],ny[72]-10,'Surface Area and\nVolume of Spheres').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[72]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Surface-Area-and-Volume-of-Spheres/#Surface Area and Volume of Spheres", target: "_top"});
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
t=paper.text(nx[73],ny[73],'Reasoning\nand Proof').attr({fill:"#666666","font-size": 14*sfac[73]});
tBox=t.getBBox(); 
bt[73]=ny[73]-(tBox.height/2+10*sfac[73]);
bb[73]=ny[73]+(tBox.height/2+10*sfac[73]);
bl[73]=nx[73]-(tBox.width/2+10*sfac[73]);
br[73]=nx[73]+(tBox.width/2+10*sfac[73]);
rect=paper.rect(bl[73], bt[73], br[73]-bl[73], bb[73]-bt[73], 10*sfac[73]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[73]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[74],ny[74]-10,'Segments and\nDistance').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[74]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Segments-and-Distance/#Segments and Distance", target: "_top"});
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
t=paper.text(nx[75],ny[75]-10,'Proving Quadrilaterals\nare Parallelograms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[75]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Proving-Quadrilaterals-are-Parallelograms/#Proving Quadrilaterals are Parallelograms", target: "_top"});
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
t=paper.text(nx[76],ny[76],'Triangles and\nCongruence').attr({fill:"#666666","font-size": 14*sfac[76]});
tBox=t.getBBox(); 
bt[76]=ny[76]-(tBox.height/2+10*sfac[76]);
bb[76]=ny[76]+(tBox.height/2+10*sfac[76]);
bl[76]=nx[76]-(tBox.width/2+10*sfac[76]);
br[76]=nx[76]+(tBox.width/2+10*sfac[76]);
rect=paper.rect(bl[76], bt[76], br[76]-bl[76], bb[76]-bt[76], 10*sfac[76]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[76]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[77],ny[77]-10,'Properties of\nPerpendicular Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[77]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-of-Perpendicular-Lines/#Properties of Perpendicular Lines", target: "_top"});
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
t=paper.text(nx[78],ny[78],'The Pythagorean Theorem').attr({fill:"#666666","font-size": 14*sfac[78]});
tBox=t.getBBox(); 
bt[78]=ny[78]-(tBox.height/2+10*sfac[78]);
bb[78]=ny[78]+(tBox.height/2+10*sfac[78]);
bl[78]=nx[78]-(tBox.width/2+10*sfac[78]);
br[78]=nx[78]+(tBox.width/2+10*sfac[78]);
rect=paper.rect(bl[78], bt[78], br[78]-bl[78], bb[78]-bt[78], 10*sfac[78]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[78]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[79],ny[79],'The Distance\nFormula').attr({fill:"#666666","font-size": 14*sfac[79]});
tBox=t.getBBox(); 
bt[79]=ny[79]-(tBox.height/2+10*sfac[79]);
bb[79]=ny[79]+(tBox.height/2+10*sfac[79]);
bl[79]=nx[79]-(tBox.width/2+10*sfac[79]);
br[79]=nx[79]+(tBox.width/2+10*sfac[79]);
rect=paper.rect(bl[79], bt[79], br[79]-bl[79], bb[79]-bt[79], 10*sfac[79]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[79]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[80],ny[80]-10,'Exploring Solids').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[80]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exploring-Solids/#Exploring Solids", target: "_top"});
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
t=paper.text(nx[81],ny[81]-10,'Angles of Chords,\nSecants, Tangents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[81]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angles-of-Chords,-Secants,-and-Tangents/#Angles of Chords, Secants, Tangents", target: "_top"});
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
t=paper.text(nx[82],ny[82],'Basics of\nGeometry').attr({fill:"#666666","font-size": 14*sfac[82]});
tBox=t.getBBox(); 
bt[82]=ny[82]-(tBox.height/2+10*sfac[82]);
bb[82]=ny[82]+(tBox.height/2+10*sfac[82]);
bl[82]=nx[82]-(tBox.width/2+10*sfac[82]);
br[82]=nx[82]+(tBox.width/2+10*sfac[82]);
rect=paper.rect(bl[82], bt[82], br[82]-bl[82], bb[82]-bt[82], 10*sfac[82]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[82]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[83],ny[83]-10,'Proving Lines\nParallel').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[83]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Proving-Lines-Parallel/#Proving Lines Parallel", target: "_top"});
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
t=paper.text(nx[84],ny[84]-10,'Translations and\nVectors').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[84]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Translations-and-Vectors/#Translations and Vectors", target: "_top"});
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
t=paper.text(nx[85],ny[85]-10,'Properties of Arcs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[85]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-of-Arcs/#Properties of Arcs", target: "_top"});
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

bb[86]= ny[86]; 
bt[86]= ny[86]; 
bl[86]= nx[86]; 
br[86]= nx[86]; 

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

bb[90]= ny[90]; 
bt[90]= ny[90]; 
bl[90]= nx[90]; 
br[90]= nx[90]; 

bb[91]= ny[91]; 
bt[91]= ny[91]; 
bl[91]= nx[91]; 
br[91]= nx[91]; 

bb[92]= ny[92]; 
bt[92]= ny[92]; 
bl[92]= nx[92]; 
br[92]= nx[92]; 

bb[93]= ny[93]; 
bt[93]= ny[93]; 
bl[93]= nx[93]; 
br[93]= nx[93]; 

bb[94]= ny[94]; 
bt[94]= ny[94]; 
bl[94]= nx[94]; 
br[94]= nx[94]; 

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
s1='M '+nx[0]+' '+bb[0]+' L '+nx[0]+' '+bt[42]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[0,42] ; 

paper.setStart(); 
mid=bb[1]+(bt[57]-bb[1])/2; 
hleft = nx[68]; 
hright = nx[1]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[1]+' '+bb[1]+' L '+nx[1]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[68]+' '+mid+' L '+nx[68]+' '+bt[68];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[1,68]; 

paper.setStart(); 
mid=bb[1]+(bt[57]-bb[1])/2; 
hleft = nx[57]; 
hright = nx[1]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[57]+' '+mid+' L '+nx[57]+' '+bt[57];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[1,57]; 

paper.setStart(); 
mid=bb[3]+(bt[48]-bb[3])/2; 
hleft = nx[36]; 
hright = nx[3]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[3]+' '+bb[3]+' L '+nx[3]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[36]+' '+mid+' L '+nx[36]+' '+bt[36];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[3,36]; 

paper.setStart(); 
mid=bb[3]+(bt[48]-bb[3])/2; 
hleft = nx[50]; 
hright = nx[3]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[50]+' '+mid+' L '+nx[50]+' '+bt[50];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[3,50]; 

paper.setStart(); 
mid=bb[3]+(bt[48]-bb[3])/2; 
s3='M '+nx[65]+' '+mid+' L '+nx[65]+' '+bt[65];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[3,65]; 

paper.setStart(); 
mid=bb[3]+(bt[48]-bb[3])/2; 
s3='M '+nx[54]+' '+mid+' L '+nx[54]+' '+bt[54];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[3,54]; 

paper.setStart(); 
mid=bb[3]+(bt[48]-bb[3])/2; 
s3='M '+nx[48]+' '+mid+' L '+nx[48]+' '+bt[48];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[3,48]; 

paper.setStart(); 
s1='M '+nx[4]+' '+bb[4]+' L '+nx[4]+' '+bt[60]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[4,60] ; 

paper.setStart(); 
mid=bb[5]+(bt[69]-bb[5])/2; 
hleft = nx[69]; 
hright = nx[5]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[5]+' '+bb[5]+' L '+nx[5]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[69]+' '+mid+' L '+nx[69]+' '+bt[69];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[5,69]; 

paper.setStart(); 
mid=bb[5]+(bt[69]-bb[5])/2; 
hleft = nx[29]; 
hright = nx[5]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[29]+' '+mid+' L '+nx[29]+' '+bt[29];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[5,29]; 

paper.setStart(); 
s1='M '+nx[12]+' '+bb[12]+' L '+nx[12]+' '+bt[70]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[12,70] ; 

paper.setStart(); 
s1='M '+nx[13]+' '+bb[13]+' L '+nx[13]+' '+bt[82]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[13,82] ; 

paper.setStart(); 
mid=bb[14]+(bt[22]-bb[14])/2; 
hleft = nx[67]; 
hright = nx[14]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[14]+' '+bb[14]+' L '+nx[14]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[67]+' '+mid+' L '+nx[67]+' '+bt[67];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[14,67]; 

paper.setStart(); 
mid=bb[14]+(bt[22]-bb[14])/2; 
hleft = nx[22]; 
hright = nx[14]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[22]+' '+mid+' L '+nx[22]+' '+bt[22];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[14,22]; 

paper.setStart(); 
mid=bb[14]+(bt[22]-bb[14])/2; 
s3='M '+nx[2]+' '+mid+' L '+nx[2]+' '+bt[2];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[14,2]; 

paper.setStart(); 
mid=bb[15]+(bt[81]-bb[15])/2; 
hleft = nx[81]; 
hright = nx[15]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[15]+' '+bb[15]+' L '+nx[15]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[81]+' '+mid+' L '+nx[81]+' '+bt[81];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[15,81]; 

paper.setStart(); 
mid=bb[15]+(bt[81]-bb[15])/2; 
hleft = nx[53]; 
hright = nx[15]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[53]+' '+mid+' L '+nx[53]+' '+bt[53];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[15,53]; 

paper.setStart(); 
s1='M '+nx[16]+' '+bb[16]+' L '+nx[16]+' '+bt[59]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[16,59] ; 

paper.setStart(); 
mid=bb[17]+(bt[24]-bb[17])/2; 
hleft = nx[77]; 
hright = nx[17]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[17]+' '+bb[17]+' L '+nx[17]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[77]+' '+mid+' L '+nx[77]+' '+bt[77];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[17,77]; 

paper.setStart(); 
mid=bb[17]+(bt[24]-bb[17])/2; 
hleft = nx[24]; 
hright = nx[17]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[24]+' '+mid+' L '+nx[24]+' '+bt[24];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[17,24]; 

paper.setStart(); 
s1='M '+nx[18]+' '+bb[18]+' L '+nx[18]+' '+bt[52]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[18,52] ; 

paper.setStart(); 
s1='M '+nx[19]+' '+bb[19]+' L '+nx[19]+' '+ny[89]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[19],nx[89])+' '+ny[89]+' L '+Math.max(nx[19],nx[89])+' '+ny[89]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[19,89]; 

paper.setStart(); 
s1='M '+nx[21]+' '+bb[21]+' L '+nx[21]+' '+ny[90]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[21],nx[90])+' '+ny[90]+' L '+Math.max(nx[21],nx[90])+' '+ny[90]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[21,90]; 

paper.setStart(); 
s1='M '+nx[22]+' '+bb[22]+' L '+nx[22]+' '+bt[63]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[22,63] ; 

paper.setStart(); 
s1='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+bt[61]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[23,61] ; 

paper.setStart(); 
s1='M '+nx[24]+' '+bb[24]+' L '+nx[24]+' '+bt[83]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[24,83] ; 

paper.setStart(); 
s1='M '+nx[24]+' '+bb[24]+' L '+nx[24]+' '+ny[86]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[24],nx[86])+' '+ny[86]+' L '+Math.max(nx[24],nx[86])+' '+ny[86]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[24,86]; 

paper.setStart(); 
mid=bb[25]+(bt[31]-bb[25])/2; 
hleft = nx[31]; 
hright = nx[25]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[25]+' '+bb[25]+' L '+nx[25]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[31]+' '+mid+' L '+nx[31]+' '+bt[31];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[25,31]; 

paper.setStart(); 
mid=bb[25]+(bt[31]-bb[25])/2; 
hleft = nx[32]; 
hright = nx[25]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[32]+' '+mid+' L '+nx[32]+' '+bt[32];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[25,32]; 

paper.setStart(); 
mid=bb[25]+(bt[31]-bb[25])/2; 
s3='M '+nx[56]+' '+mid+' L '+nx[56]+' '+bt[56];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[25,56]; 

paper.setStart(); 
s1='M '+nx[26]+' '+bb[26]+' L '+nx[26]+' '+bt[80]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[26,80] ; 

paper.setStart(); 
s1='M '+nx[27]+' '+bb[27]+' L '+nx[27]+' '+ny[89]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[27],nx[89])+' '+ny[89]+' L '+Math.max(nx[27],nx[89])+' '+ny[89]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[27,89]; 

paper.setStart(); 
s1='M '+nx[28]+' '+bb[28]+' L '+nx[28]+' '+ny[90]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[28],nx[90])+' '+ny[90]+' L '+Math.max(nx[28],nx[90])+' '+ny[90]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[28,90]; 

paper.setStart(); 
s1='M '+nx[29]+' '+bb[29]+' L '+nx[29]+' '+ny[94]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[29],nx[94])+' '+ny[94]+' L '+Math.max(nx[29],nx[94])+' '+ny[94]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[29,94]; 

paper.setStart(); 
s1='M '+nx[30]+' '+bb[30]+' L '+nx[30]+' '+bt[17]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[30,17] ; 

paper.setStart(); 
s1='M '+nx[32]+' '+bb[32]+' L '+nx[32]+' '+ny[88]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[32],nx[88])+' '+ny[88]+' L '+Math.max(nx[32],nx[88])+' '+ny[88]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[32,88]; 

paper.setStart(); 
s1='M '+nx[34]+' '+bb[34]+' L '+nx[34]+' '+ny[90]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[34],nx[90])+' '+ny[90]+' L '+Math.max(nx[34],nx[90])+' '+ny[90]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[34,90]; 

paper.setStart(); 
s1='M '+nx[36]+' '+bb[36]+' L '+nx[36]+' '+ny[91]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[36],nx[91])+' '+ny[91]+' L '+Math.max(nx[36],nx[91])+' '+ny[91]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[36,91]; 

paper.setStart(); 
mid=bb[37]+(bt[47]-bb[37])/2; 
hleft = nx[47]; 
hright = nx[37]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[37]+' '+bb[37]+' L '+nx[37]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[47]+' '+mid+' L '+nx[47]+' '+bt[47];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[37,47]; 

paper.setStart(); 
mid=bb[37]+(bt[47]-bb[37])/2; 
s3='M '+nx[19]+' '+mid+' L '+nx[19]+' '+bt[19];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[37,19]; 

paper.setStart(); 
mid=bb[37]+(bt[47]-bb[37])/2; 
hleft = nx[27]; 
hright = nx[37]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[27]+' '+mid+' L '+nx[27]+' '+bt[27];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[37,27]; 

paper.setStart(); 
s1='M '+nx[38]+' '+bb[38]+' L '+nx[38]+' '+bt[3]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[38,3] ; 

paper.setStart(); 
s1='M '+nx[40]+' '+bb[40]+' L '+nx[40]+' '+bt[8]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[40,8] ; 

paper.setStart(); 
s1='M '+nx[41]+' '+bb[41]+' L '+nx[41]+' '+bt[43]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[41,43] ; 

paper.setStart(); 
mid=bb[42]+(bt[1]-bb[42])/2; 
hleft = nx[84]; 
hright = nx[42]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[42]+' '+bb[42]+' L '+nx[42]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[84]+' '+mid+' L '+nx[84]+' '+bt[84];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[42,84]; 

paper.setStart(); 
mid=bb[42]+(bt[1]-bb[42])/2; 
hleft = nx[1]; 
hright = nx[42]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[1]+' '+mid+' L '+nx[1]+' '+bt[1];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[42,1]; 

paper.setStart(); 
s1='M '+nx[44]+' '+bb[44]+' L '+nx[44]+' '+ny[87]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[44],nx[87])+' '+ny[87]+' L '+Math.max(nx[44],nx[87])+' '+ny[87]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[44,87]; 

paper.setStart(); 
mid=bb[45]+(bt[33]-bb[45])/2; 
s2='M '+nx[45]+' '+bb[45]+' L '+nx[45]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[6]+' '+mid+' L '+nx[6]+' '+bt[6];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[45,6]; 

paper.setStart(); 
mid=bb[45]+(bt[33]-bb[45])/2; 
hleft = nx[78]; 
hright = nx[45]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[78]+' '+mid+' L '+nx[78]+' '+bt[78];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[49]=paper.setFinish(); 
lineNodes[49]=[45,78]; 

paper.setStart(); 
mid=bb[45]+(bt[33]-bb[45])/2; 
s3='M '+nx[33]+' '+mid+' L '+nx[33]+' '+bt[33];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[45,33]; 

paper.setStart(); 
mid=bb[45]+(bt[33]-bb[45])/2; 
hleft = nx[14]; 
hright = nx[45]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[14]+' '+mid+' L '+nx[14]+' '+bt[14];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[45,14]; 

paper.setStart(); 
s1='M '+nx[46]+' '+bb[46]+' L '+nx[46]+' '+ny[93]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[46],nx[93])+' '+ny[93]+' L '+Math.max(nx[46],nx[93])+' '+ny[93]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[46,93]; 

paper.setStart(); 
s1='M '+nx[48]+' '+bb[48]+' L '+nx[48]+' '+ny[91]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[48],nx[91])+' '+ny[91]+' L '+Math.max(nx[48],nx[91])+' '+ny[91]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[48,91]; 

paper.setStart(); 
mid=bb[49]+(bt[23]-bb[49])/2; 
hleft = nx[74]; 
hright = nx[49]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[49]+' '+bb[49]+' L '+nx[49]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[74]+' '+mid+' L '+nx[74]+' '+bt[74];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[49,74]; 

paper.setStart(); 
mid=bb[49]+(bt[23]-bb[49])/2; 
hleft = nx[23]; 
hright = nx[49]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[23]+' '+mid+' L '+nx[23]+' '+bt[23];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[49,23]; 

paper.setStart(); 
s1='M '+nx[50]+' '+bb[50]+' L '+nx[50]+' '+ny[91]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[50],nx[91])+' '+ny[91]+' L '+Math.max(nx[50],nx[91])+' '+ny[91]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[50,91]; 

paper.setStart(); 
s1='M '+nx[52]+' '+bb[52]+' L '+nx[52]+' '+ny[90]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[52],nx[90])+' '+ny[90]+' L '+Math.max(nx[52],nx[90])+' '+ny[90]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[52,90]; 

paper.setStart(); 
s1='M '+nx[54]+' '+bb[54]+' L '+nx[54]+' '+ny[91]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[54],nx[91])+' '+ny[91]+' L '+Math.max(nx[54],nx[91])+' '+ny[91]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[54,91]; 

paper.setStart(); 
s1='M '+nx[55]+' '+bb[55]+' L '+nx[55]+' '+ny[88]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[55],nx[88])+' '+ny[88]+' L '+Math.max(nx[55],nx[88])+' '+ny[88]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[55,88]; 

paper.setStart(); 
mid=bb[56]+(bt[55]-bb[56])/2; 
hleft = nx[75]; 
hright = nx[56]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[56]+' '+bb[56]+' L '+nx[56]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[75]+' '+mid+' L '+nx[75]+' '+bt[75];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[56,75]; 

paper.setStart(); 
mid=bb[56]+(bt[55]-bb[56])/2; 
hleft = nx[55]; 
hright = nx[56]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[55]+' '+mid+' L '+nx[55]+' '+bt[55];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[56,55]; 

paper.setStart(); 
s1='M '+nx[57]+' '+bb[57]+' L '+nx[57]+' '+ny[92]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[57],nx[92])+' '+ny[92]+' L '+Math.max(nx[57],nx[92])+' '+ny[92]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[57,92]; 

paper.setStart(); 
mid=bb[58]+(bt[30]-bb[58])/2; 
hleft = nx[76]; 
hright = nx[58]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[58]+' '+bb[58]+' L '+nx[58]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[76]+' '+mid+' L '+nx[76]+' '+bt[76];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[58,76]; 

paper.setStart(); 
mid=bb[58]+(bt[30]-bb[58])/2; 
hleft = nx[30]; 
hright = nx[58]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[30]+' '+mid+' L '+nx[30]+' '+bt[30];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[58,30]; 

paper.setStart(); 
s1='M '+nx[61]+' '+bb[61]+' L '+nx[61]+' '+ny[93]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[61],nx[93])+' '+ny[93]+' L '+Math.max(nx[61],nx[93])+' '+ny[93]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[61,93]; 

paper.setStart(); 
mid=bb[62]+(bt[5]-bb[62])/2; 
hleft = nx[5]; 
hright = nx[62]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[62]+' '+bb[62]+' L '+nx[62]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[5]+' '+mid+' L '+nx[5]+' '+bt[5];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[62,5]; 

paper.setStart(); 
mid=bb[62]+(bt[5]-bb[62])/2; 
hleft = nx[4]; 
hright = nx[62]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[4]+' '+mid+' L '+nx[4]+' '+bt[4];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[62,4]; 

paper.setStart(); 
mid=bb[63]+(bt[85]-bb[63])/2; 
hleft = nx[9]; 
hright = nx[63]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[63]+' '+bb[63]+' L '+nx[63]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[9]+' '+mid+' L '+nx[9]+' '+bt[9];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[63,9]; 

paper.setStart(); 
mid=bb[63]+(bt[85]-bb[63])/2; 
s3='M '+nx[15]+' '+mid+' L '+nx[15]+' '+bt[15];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[69]=paper.setFinish(); 
lineNodes[69]=[63,15]; 

paper.setStart(); 
mid=bb[63]+(bt[85]-bb[63])/2; 
s3='M '+nx[11]+' '+mid+' L '+nx[11]+' '+bt[11];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[70]=paper.setFinish(); 
lineNodes[70]=[63,11]; 

paper.setStart(); 
mid=bb[63]+(bt[85]-bb[63])/2; 
hleft = nx[85]; 
hright = nx[63]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[85]+' '+mid+' L '+nx[85]+' '+bt[85];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[71]=paper.setFinish(); 
lineNodes[71]=[63,85]; 

paper.setStart(); 
mid=bb[64]+(bt[21]-bb[64])/2; 
s2='M '+nx[64]+' '+bb[64]+' L '+nx[64]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[51]+' '+mid+' L '+nx[51]+' '+bt[51];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[72]=paper.setFinish(); 
lineNodes[72]=[64,51]; 

paper.setStart(); 
mid=bb[64]+(bt[21]-bb[64])/2; 
hleft = nx[21]; 
hright = nx[64]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[21]+' '+mid+' L '+nx[21]+' '+bt[21];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[73]=paper.setFinish(); 
lineNodes[73]=[64,21]; 

paper.setStart(); 
mid=bb[64]+(bt[21]-bb[64])/2; 
s3='M '+nx[28]+' '+mid+' L '+nx[28]+' '+bt[28];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[74]=paper.setFinish(); 
lineNodes[74]=[64,28]; 

paper.setStart(); 
mid=bb[64]+(bt[21]-bb[64])/2; 
hleft = nx[18]; 
hright = nx[64]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[18]+' '+mid+' L '+nx[18]+' '+bt[18];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[75]=paper.setFinish(); 
lineNodes[75]=[64,18]; 

paper.setStart(); 
mid=bb[64]+(bt[21]-bb[64])/2; 
s3='M '+nx[34]+' '+mid+' L '+nx[34]+' '+bt[34];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[76]=paper.setFinish(); 
lineNodes[76]=[64,34]; 

paper.setStart(); 
s1='M '+nx[65]+' '+bb[65]+' L '+nx[65]+' '+ny[91]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[65],nx[91])+' '+ny[91]+' L '+Math.max(nx[65],nx[91])+' '+ny[91]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[77]=paper.setFinish(); 
lineNodes[77]=[65,91]; 

paper.setStart(); 
s1='M '+nx[66]+' '+bb[66]+' L '+nx[66]+' '+bt[39]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[78]=paper.setFinish(); 
lineNodes[78]=[66,39] ; 

paper.setStart(); 
s1='M '+nx[68]+' '+bb[68]+' L '+nx[68]+' '+ny[92]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[68],nx[92])+' '+ny[92]+' L '+Math.max(nx[68],nx[92])+' '+ny[92]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[79]=paper.setFinish(); 
lineNodes[79]=[68,92]; 

paper.setStart(); 
s1='M '+nx[69]+' '+bb[69]+' L '+nx[69]+' '+ny[94]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[69],nx[94])+' '+ny[94]+' L '+Math.max(nx[69],nx[94])+' '+ny[94]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[80]=paper.setFinish(); 
lineNodes[80]=[69,94]; 

paper.setStart(); 
s1='M '+nx[70]+' '+bb[70]+' L '+nx[70]+' '+ny[87]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[70],nx[87])+' '+ny[87]+' L '+Math.max(nx[70],nx[87])+' '+ny[87]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[81]=paper.setFinish(); 
lineNodes[81]=[70,87]; 

paper.setStart(); 
s1='M '+nx[71]+' '+bb[71]+' L '+nx[71]+' '+ny[87]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[71],nx[87])+' '+ny[87]+' L '+Math.max(nx[71],nx[87])+' '+ny[87]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[82]=paper.setFinish(); 
lineNodes[82]=[71,87]; 

paper.setStart(); 
mid=bb[73]+(bt[44]-bb[73])/2; 
s2='M '+nx[73]+' '+bb[73]+' L '+nx[73]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[12]+' '+mid+' L '+nx[12]+' '+bt[12];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[83]=paper.setFinish(); 
lineNodes[83]=[73,12]; 

paper.setStart(); 
mid=bb[73]+(bt[44]-bb[73])/2; 
hleft = nx[71]; 
hright = nx[73]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[71]+' '+mid+' L '+nx[71]+' '+bt[71];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[84]=paper.setFinish(); 
lineNodes[84]=[73,71]; 

paper.setStart(); 
mid=bb[73]+(bt[44]-bb[73])/2; 
hleft = nx[44]; 
hright = nx[73]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[44]+' '+mid+' L '+nx[44]+' '+bt[44];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[85]=paper.setFinish(); 
lineNodes[85]=[73,44]; 

paper.setStart(); 
s1='M '+nx[74]+' '+bb[74]+' L '+nx[74]+' '+bt[46]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[86]=paper.setFinish(); 
lineNodes[86]=[74,46] ; 

paper.setStart(); 
mid=bb[76]+(bt[37]-bb[76])/2; 
hleft = nx[38]; 
hright = nx[76]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[76]+' '+bb[76]+' L '+nx[76]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[38]+' '+mid+' L '+nx[38]+' '+bt[38];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[87]=paper.setFinish(); 
lineNodes[87]=[76,38]; 

paper.setStart(); 
mid=bb[76]+(bt[37]-bb[76])/2; 
hleft = nx[37]; 
hright = nx[76]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[37]+' '+mid+' L '+nx[37]+' '+bt[37];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[88]=paper.setFinish(); 
lineNodes[88]=[76,37]; 

paper.setStart(); 
s1='M '+nx[77]+' '+bb[77]+' L '+nx[77]+' '+ny[86]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[77],nx[86])+' '+ny[86]+' L '+Math.max(nx[77],nx[86])+' '+ny[86]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[89]=paper.setFinish(); 
lineNodes[89]=[77,86]; 

paper.setStart(); 
s1='M '+nx[78]+' '+bb[78]+' L '+nx[78]+' '+bt[35]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[90]=paper.setFinish(); 
lineNodes[90]=[78,35] ; 

paper.setStart(); 
mid=bb[80]+(bt[72]-bb[80])/2; 
hleft = nx[0]; 
hright = nx[80]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[80]+' '+bb[80]+' L '+nx[80]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[0]+' '+mid+' L '+nx[0]+' '+bt[0];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[91]=paper.setFinish(); 
lineNodes[91]=[80,0]; 

paper.setStart(); 
mid=bb[80]+(bt[72]-bb[80])/2; 
s3='M '+nx[16]+' '+mid+' L '+nx[16]+' '+bt[16];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[92]=paper.setFinish(); 
lineNodes[92]=[80,16]; 

paper.setStart(); 
mid=bb[80]+(bt[72]-bb[80])/2; 
s3='M '+nx[72]+' '+mid+' L '+nx[72]+' '+bt[72];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[93]=paper.setFinish(); 
lineNodes[93]=[80,72]; 

paper.setStart(); 
mid=bb[80]+(bt[72]-bb[80])/2; 
hleft = nx[41]; 
hright = nx[80]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[41]+' '+mid+' L '+nx[41]+' '+bt[41];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[94]=paper.setFinish(); 
lineNodes[94]=[80,41]; 

paper.setStart(); 
mid=bb[82]+(bt[49]-bb[82])/2; 
hleft = nx[49]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[82]+' '+bb[82]+' L '+nx[82]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[49]+' '+mid+' L '+nx[49]+' '+bt[49];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[95]=paper.setFinish(); 
lineNodes[95]=[82,49]; 

paper.setStart(); 
mid=bb[82]+(bt[49]-bb[82])/2; 
hleft = nx[73]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[73]+' '+mid+' L '+nx[73]+' '+bt[73];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[96]=paper.setFinish(); 
lineNodes[96]=[82,73]; 

paper.setStart(); 
mid=bb[86]+(bt[79]-bb[86])/2; 
hleft = nx[79]; 
hright = nx[86]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[86]+' '+bb[86]+' L '+nx[86]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[79]+' '+mid+' L '+nx[79]+' '+bt[79];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[97]=paper.setFinish(); 
lineNodes[97]=[86,79]; 

paper.setStart(); 
mid=bb[86]+(bt[79]-bb[86])/2; 
hleft = nx[25]; 
hright = nx[86]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[25]+' '+mid+' L '+nx[25]+' '+bt[25];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[98]=paper.setFinish(); 
lineNodes[98]=[86,25]; 

paper.setStart(); 
mid=bb[86]+(bt[79]-bb[86])/2; 
s3='M '+nx[10]+' '+mid+' L '+nx[10]+' '+bt[10];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[99]=paper.setFinish(); 
lineNodes[99]=[86,10]; 

paper.setStart(); 
s1='M '+nx[87]+' '+bb[87]+' L '+nx[87]+' '+bt[20]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[100]=paper.setFinish(); 
lineNodes[100]=[87,20] ; 

paper.setStart(); 
s1='M '+nx[88]+' '+bb[88]+' L '+nx[88]+' '+bt[64]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[101]=paper.setFinish(); 
lineNodes[101]=[88,64] ; 

paper.setStart(); 
s1='M '+nx[89]+' '+bb[89]+' L '+nx[89]+' '+bt[62]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[102]=paper.setFinish(); 
lineNodes[102]=[89,62] ; 

paper.setStart(); 
s1='M '+nx[90]+' '+bb[90]+' L '+nx[90]+' '+bt[26]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[103]=paper.setFinish(); 
lineNodes[103]=[90,26] ; 

paper.setStart(); 
s1='M '+nx[91]+' '+bb[91]+' L '+nx[91]+' '+bt[7]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[104]=paper.setFinish(); 
lineNodes[104]=[91,7] ; 

paper.setStart(); 
s1='M '+nx[92]+' '+bb[92]+' L '+nx[92]+' '+bt[40]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[105]=paper.setFinish(); 
lineNodes[105]=[92,40] ; 

paper.setStart(); 
s1='M '+nx[93]+' '+bb[93]+' L '+nx[93]+' '+bt[58]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[106]=paper.setFinish(); 
lineNodes[106]=[93,58] ; 

paper.setStart(); 
mid=bb[94]+(bt[66]-bb[94])/2; 
hleft = nx[66]; 
hright = nx[94]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[94]+' '+bb[94]+' L '+nx[94]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[66]+' '+mid+' L '+nx[66]+' '+bt[66];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[107]=paper.setFinish(); 
lineNodes[107]=[94,66]; 

paper.setStart(); 
mid=bb[94]+(bt[66]-bb[94])/2; 
hleft = nx[45]; 
hright = nx[94]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[45]+' '+mid+' L '+nx[45]+' '+bt[45];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[108]=paper.setFinish(); 
lineNodes[108]=[94,45]; 

nlines = 109;
}