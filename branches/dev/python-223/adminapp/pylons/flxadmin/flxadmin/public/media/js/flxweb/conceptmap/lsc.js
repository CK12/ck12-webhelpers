function initMap() { 

// Set size parameters 
mapWidth = 3728; 
mapHeight = 2792; 
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
rootx = 1509; 
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

nnodes = 109; 
njunc = 8; 

nx[0]=2078;
ny[0]=2526;
nx[1]=1931;
ny[1]=2526;
nx[2]=1409;
ny[2]=1384;
nx[3]=496;
ny[3]=2262;
nx[4]=1570;
ny[4]=529;
nx[5]=955;
ny[5]=2611;
nx[6]=2191;
ny[6]=1172;
nx[7]=2236;
ny[7]=2514;
nx[8]=1965;
ny[8]=1286;
nx[9]=1325;
ny[9]=1033;
nx[10]=2441;
ny[10]=1295;
nx[11]=663;
ny[11]=1294;
nx[12]=798;
ny[12]=1144;
nx[13]=1509;
ny[13]=199;
nx[14]=738;
ny[14]=1514;
nx[15]=596;
ny[15]=933;
nx[16]=1340;
ny[16]=2114;
nx[17]=1333;
ny[17]=1488;
nx[18]=2646;
ny[18]=2508;
nx[19]=3528;
ny[19]=2541;
nx[20]=200;
ny[20]=2370;
nx[21]=591;
ny[21]=1615;
nx[22]=2270;
ny[22]=1287;
nx[23]=1610;
ny[23]=404;
nx[24]=2810;
ny[24]=2509;
nx[25]=200;
ny[25]=2478;
nx[26]=1532;
ny[26]=1782;
nx[27]=1209;
ny[27]=530;
nx[28]=945;
ny[28]=815;
nx[29]=1488;
ny[29]=1033;
nx[30]=1464;
ny[30]=1998;
nx[31]=929;
ny[31]=1511;
nx[32]=1390;
ny[32]=301;
nx[33]=798;
ny[33]=1037;
nx[34]=1904;
ny[34]=1061;
nx[35]=1491;
ny[35]=1257;
nx[36]=3357;
ny[36]=2539;
nx[37]=2041;
ny[37]=949;
nx[38]=1405;
ny[38]=933;
nx[39]=1333;
ny[39]=1679;
nx[40]=2494;
ny[40]=2509;
nx[41]=929;
ny[41]=1714;
nx[42]=929;
ny[42]=1404;
nx[43]=1261;
ny[43]=2606;
nx[44]=596;
ny[44]=1032;
nx[45]=2003;
ny[45]=2402;
nx[46]=934;
ny[46]=1151;
nx[47]=929;
ny[47]=1299;
nx[48]=3149;
ny[48]=2539;
nx[49]=449;
ny[49]=1130;
nx[50]=1752;
ny[50]=2522;
nx[51]=3252;
ny[51]=2692;
nx[52]=1146;
ny[52]=1782;
nx[53]=2962;
ny[53]=2626;
nx[54]=1340;
ny[54]=1897;
nx[55]=2110;
ny[55]=1294;
nx[56]=676;
ny[56]=1143;
nx[57]=744;
ny[57]=2263;
nx[58]=1274;
ny[58]=1782;
nx[59]=818;
ny[59]=2611;
nx[60]=1333;
ny[60]=1582;
nx[61]=1807;
ny[61]=726;
nx[62]=591;
ny[62]=1514;
nx[63]=1509;
ny[63]=100;
nx[64]=1327;
ny[64]=1256;
nx[65]=1390;
ny[65]=522;
nx[66]=1218;
ny[66]=1996;
nx[67]=1403;
ny[67]=1782;
nx[68]=1686;
ny[68]=943;
nx[69]=1858;
ny[69]=949;
nx[70]=1390;
ny[70]=404;
nx[71]=2364;
ny[71]=2394;
nx[72]=1407;
ny[72]=1153;
nx[73]=449;
ny[73]=1031;
nx[74]=1334;
ny[74]=2402;
nx[75]=2236;
ny[75]=2638;
nx[76]=945;
ny[76]=720;
nx[77]=1686;
ny[77]=847;
nx[78]=1931;
ny[78]=2647;
nx[79]=1340;
ny[79]=1997;
nx[80]=2810;
ny[80]=2394;
nx[81]=955;
ny[81]=2497;
nx[82]=1661;
ny[82]=2396;
nx[83]=929;
ny[83]=1612;
nx[84]=2003;
ny[84]=2263;
nx[85]=2962;
ny[85]=2516;
nx[86]=1610;
ny[86]=302;
nx[87]=1567;
ny[87]=2521;
nx[88]=955;
ny[88]=2395;
nx[89]=2191;
ny[89]=1063;
nx[90]=2041;
ny[90]=1062;
nx[91]=1664;
ny[91]=2677;
nx[92]=1261;
ny[92]=2511;
nx[93]=1950;
ny[93]=847;
nx[94]=2364;
ny[94]=2508;
nx[95]=663;
ny[95]=1398;
nx[96]=200;
ny[96]=2262;
nx[97]=1403;
ny[97]=2520;
nx[98]=1075;
ny[98]=2613;
nx[99]=1484;
ny[99]=1489;
nx[100]=3357;
ny[100]=2401;
nx[101]=798;
ny[101]=1207;
nx[102]=1405;
ny[102]=1084;
nx[103]=1341;
ny[103]=1833;
nx[104]=1665;
ny[104]=2588;
nx[105]=3251;
ny[105]=2607;
nx[106]=1408;
ny[106]=1312;
nx[107]=1390;
ny[107]=596;
nx[108]=1340;
ny[108]=2045;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[1, 45]; 
members[1]=[0, 45, 78]; 
members[2]=[17, 106, 99]; 
members[3]=[16, 57, 84, 96]; 
members[4]=[27, 65, 107, 70]; 
members[5]=[81, 98, 59]; 
members[6]=[8, 10, 22, 55, 89]; 
members[7]=[40, 75, 94, 71]; 
members[8]=[10, 22, 6, 55]; 
members[9]=[38, 102, 29]; 
members[10]=[8, 22, 6, 55]; 
members[11]=[47, 101, 95]; 
members[12]=[56, 33, 101, 46]; 
members[13]=[32, 86, 63]; 
members[14]=[62, 95]; 
members[15]=[33, 38, 73, 44, 28]; 
members[16]=[96, 3, 108, 84, 57]; 
members[17]=[2, 99, 60]; 
members[18]=[80, 24, 85]; 
members[19]=[48, 36, 100]; 
members[20]=[96, 25]; 
members[21]=[62]; 
members[22]=[8, 10, 6, 55]; 
members[23]=[86]; 
members[24]=[80, 18, 85]; 
members[25]=[20]; 
members[26]=[67, 39, 103, 52, 58]; 
members[27]=[65, 107, 4, 70]; 
members[28]=[76, 38, 15]; 
members[29]=[9, 38, 102]; 
members[30]=[66, 108, 54, 79]; 
members[31]=[42, 83]; 
members[32]=[86, 13, 70]; 
members[33]=[12, 44, 46, 15, 73, 56]; 
members[34]=[89, 90, 37]; 
members[35]=[72, 64, 106]; 
members[36]=[48, 105, 19, 100]; 
members[37]=[34, 89, 90, 93, 69]; 
members[38]=[9, 28, 29, 15]; 
members[39]=[67, 52, 58, 60, 26]; 
members[40]=[7, 94, 71]; 
members[41]=[83]; 
members[42]=[47, 31]; 
members[43]=[92]; 
members[44]=[33, 73, 15]; 
members[45]=[0, 1, 100, 71, 74, 80, 82, 84, 88]; 
members[46]=[56, 33, 12, 101]; 
members[47]=[42, 11, 101]; 
members[48]=[105, 19, 100, 36]; 
members[49]=[73]; 
members[50]=[104, 82, 87]; 
members[51]=[105]; 
members[52]=[67, 39, 103, 26, 58]; 
members[53]=[85]; 
members[54]=[66, 103, 30, 79]; 
members[55]=[8, 10, 22, 6]; 
members[56]=[33, 12, 101, 46]; 
members[57]=[16, 3, 84, 96]; 
members[58]=[67, 39, 103, 52, 26]; 
members[59]=[81, 98, 5]; 
members[60]=[17, 39]; 
members[61]=[107, 76, 93, 77]; 
members[62]=[14, 21, 95]; 
members[63]=[13]; 
members[64]=[72, 106, 35]; 
members[65]=[27, 107, 4, 70]; 
members[66]=[108, 30, 54, 79]; 
members[67]=[39, 103, 52, 26, 58]; 
members[68]=[77]; 
members[69]=[37, 93]; 
members[70]=[32, 65, 27, 4]; 
members[71]=[100, 40, 74, 7, 45, 80, 82, 84, 88, 94]; 
members[72]=[64, 35, 102]; 
members[73]=[49, 44, 33, 15]; 
members[74]=[97, 100, 71, 45, 80, 82, 84, 88, 92]; 
members[75]=[7]; 
members[76]=[107, 28, 61]; 
members[77]=[68, 61, 93]; 
members[78]=[1]; 
members[79]=[66, 108, 30, 54]; 
members[80]=[100, 71, 74, 45, 88, 18, 82, 84, 85, 24]; 
members[81]=[88, 98, 59, 5]; 
members[82]=[100, 71, 74, 45, 80, 50, 84, 87, 88]; 
members[83]=[41, 31]; 
members[84]=[96, 16, 3, 100, 71, 74, 45, 80, 82, 88, 57]; 
members[85]=[80, 24, 18, 53]; 
members[86]=[32, 13, 23]; 
members[87]=[104, 82, 50]; 
members[88]=[100, 71, 74, 45, 80, 81, 82, 84]; 
members[89]=[90, 34, 37, 6]; 
members[90]=[89, 34, 37]; 
members[91]=[104]; 
members[92]=[97, 74, 43]; 
members[93]=[61, 77, 69, 37]; 
members[94]=[40, 7, 71]; 
members[95]=[11, 14, 62]; 
members[96]=[84, 3, 16, 20, 57]; 
members[97]=[74, 92]; 
members[98]=[81, 59, 5]; 
members[99]=[17, 2]; 
members[100]=[80, 36, 71, 74, 45, 48, 82, 19, 84, 88]; 
members[101]=[11, 12, 46, 47, 56]; 
members[102]=[72, 9, 29]; 
members[103]=[67, 52, 54, 26, 58]; 
members[104]=[50, 91, 87]; 
members[105]=[48, 51, 36]; 
members[106]=[64, 2, 35]; 
members[107]=[65, 4, 76, 27, 61]; 
members[108]=[16, 66, 30, 79]; 

return members[i]; 
} 

function drawMap(sfac) { 

var t; 
var rect; 
var tbox; 

paper.clear(); 

paper.setStart(); 
t=paper.text(nx[0],ny[0],'The Excretory\nSystem').attr({fill:"#666666","font-size": 14*sfac[0]});
tBox=t.getBBox(); 
bt[0]=ny[0]-(tBox.height/2+10*sfac[0]);
bb[0]=ny[0]+(tBox.height/2+10*sfac[0]);
bl[0]=nx[0]-(tBox.width/2+10*sfac[0]);
br[0]=nx[0]+(tBox.width/2+10*sfac[0]);
rect=paper.rect(bl[0], bt[0], br[0]-bl[0], bb[0]-bt[0], 10*sfac[0]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[0]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[1],ny[1]-10,'The Respiratory\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[1]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Respiratory-System---Respiratory-and-Excretory-Systems/#The Respiratory System", target: "_top"});
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
t=paper.text(nx[2],ny[2],'Plants').attr({fill:"#666666","font-size": 14*sfac[2]});
tBox=t.getBBox(); 
bt[2]=ny[2]-(tBox.height/2+10*sfac[2]);
bb[2]=ny[2]+(tBox.height/2+10*sfac[2]);
bl[2]=nx[2]-(tBox.width/2+10*sfac[2]);
br[2]=nx[2]+(tBox.width/2+10*sfac[2]);
rect=paper.rect(bl[2], bt[2], br[2]-bl[2], bb[2]-bt[2], 10*sfac[2]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[2]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[3],ny[3]-10,'Birds').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[3]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Birds---Birds-and-Mammals/#Birds", target: "_top"});
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
t=paper.text(nx[4],ny[4]-10,'Classification of Living\nThings').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[4]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Classification-of-Living-Things/#Classification of Living Things", target: "_top"});
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
t=paper.text(nx[5],ny[5]-10,'The Skeletal\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[5]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Skeletal-System---Skin,-Bones,-and-Muscles/#The Skeletal System", target: "_top"});
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
t=paper.text(nx[6],ny[6],'Environmental Problems').attr({fill:"#666666","font-size": 14*sfac[6]});
tBox=t.getBBox(); 
bt[6]=ny[6]-(tBox.height/2+10*sfac[6]);
bb[6]=ny[6]+(tBox.height/2+10*sfac[6]);
bl[6]=nx[6]-(tBox.width/2+10*sfac[6]);
br[6]=nx[6]+(tBox.width/2+10*sfac[6]);
rect=paper.rect(bl[6], bt[6], br[6]-bl[6], bb[6]-bt[6], 10*sfac[6]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[6]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[7],ny[7]-10,'The Nervous\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[7]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Nervous-System---Controlling-the-Body/#The Nervous System", target: "_top"});
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
t=paper.text(nx[8],ny[8]-10,'Air Pollution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[8]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Air-Pollution---Environmental-Problems/#Air Pollution", target: "_top"});
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
t=paper.text(nx[9],ny[9]-10,'Bacteria').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[9]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Bacteria/#Bacteria", target: "_top"});
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
t=paper.text(nx[10],ny[10]-10,'Habitat Destruction and\nExtinction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[10]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Habitat-Destruction-and-Extinction/#Habitat Destruction and Extinction", target: "_top"});
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
t=paper.text(nx[11],ny[11],'Genetics').attr({fill:"#666666","font-size": 14*sfac[11]});
tBox=t.getBBox(); 
bt[11]=ny[11]-(tBox.height/2+10*sfac[11]);
bb[11]=ny[11]+(tBox.height/2+10*sfac[11]);
bl[11]=nx[11]-(tBox.width/2+10*sfac[11]);
br[11]=nx[11]+(tBox.width/2+10*sfac[11]);
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[11]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[12],ny[12]-10,'Reproduction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[12]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reproduction/#Reproduction", target: "_top"});
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
t=paper.text(nx[13],ny[13],'Studying The Life Sciences').attr({fill:"#666666","font-size": 14*sfac[13]});
tBox=t.getBBox(); 
bt[13]=ny[13]-(tBox.height/2+10*sfac[13]);
bb[13]=ny[13]+(tBox.height/2+10*sfac[13]);
bl[13]=nx[13]-(tBox.width/2+10*sfac[13]);
br[13]=nx[13]+(tBox.width/2+10*sfac[13]);
rect=paper.rect(bl[13], bt[13], br[13]-bl[13], bb[13]-bt[13], 10*sfac[13]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[13]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[14],ny[14]-10,'Human Genetics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[14]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Human-Genetics/#Human Genetics", target: "_top"});
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
t=paper.text(nx[15],ny[15],'Cell Functions').attr({fill:"#666666","font-size": 14*sfac[15]});
tBox=t.getBBox(); 
bt[15]=ny[15]-(tBox.height/2+10*sfac[15]);
bb[15]=ny[15]+(tBox.height/2+10*sfac[15]);
bl[15]=nx[15]-(tBox.width/2+10*sfac[15]);
br[15]=nx[15]+(tBox.width/2+10*sfac[15]);
rect=paper.rect(bl[15], bt[15], br[15]-bl[15], bb[15]-bt[15], 10*sfac[15]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[15]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[16],ny[16],'Birds and Mammals').attr({fill:"#666666","font-size": 14*sfac[16]});
tBox=t.getBBox(); 
bt[16]=ny[16]-(tBox.height/2+10*sfac[16]);
bb[16]=ny[16]+(tBox.height/2+10*sfac[16]);
bl[16]=nx[16]-(tBox.width/2+10*sfac[16]);
br[16]=nx[16]+(tBox.width/2+10*sfac[16]);
rect=paper.rect(bl[16], bt[16], br[16]-bl[16], bb[16]-bt[16], 10*sfac[16]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[16]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[17],ny[17],'Seedless Plants').attr({fill:"#666666","font-size": 14*sfac[17]});
tBox=t.getBBox(); 
bt[17]=ny[17]-(tBox.height/2+10*sfac[17]);
bb[17]=ny[17]+(tBox.height/2+10*sfac[17]);
bl[17]=nx[17]-(tBox.width/2+10*sfac[17]);
br[17]=nx[17]+(tBox.width/2+10*sfac[17]);
rect=paper.rect(bl[17], bt[17], br[17]-bl[17], bb[17]-bt[17], 10*sfac[17]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[17]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[18],ny[18],'Infections Diseases').attr({fill:"#666666","font-size": 14*sfac[18]});
tBox=t.getBBox(); 
bt[18]=ny[18]-(tBox.height/2+10*sfac[18]);
bb[18]=ny[18]+(tBox.height/2+10*sfac[18]);
bl[18]=nx[18]-(tBox.width/2+10*sfac[18]);
br[18]=nx[18]+(tBox.width/2+10*sfac[18]);
rect=paper.rect(bl[18], bt[18], br[18]-bl[18], bb[18]-bt[18], 10*sfac[18]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[18]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[19],ny[19]-10,'Reproduction and\nLife Stages').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[19]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reproduction-and-Life-Stages/#Reproduction and Life Stages", target: "_top"});
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
t=paper.text(nx[20],ny[20]-10,'Understanding Animal\nBehavior').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[20]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Understanding-Animal-Behavior/#Understanding Animal Behavior", target: "_top"});
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
t=paper.text(nx[21],ny[21]-10,'Genetic Advances').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[21]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Genetic-Advances/#Genetic Advances", target: "_top"});
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
t=paper.text(nx[22],ny[22]-10,'Natural Resources').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[22]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Natural-Resources/#Natural Resources", target: "_top"});
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
t=paper.text(nx[23],ny[23]-10,'Safety in Scientific Research').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[23]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Safety-in-Scientific-Research/#Safety in Scientific Research", target: "_top"});
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
t=paper.text(nx[24],ny[24],'Noninfectous Diseases').attr({fill:"#666666","font-size": 14*sfac[24]});
tBox=t.getBBox(); 
bt[24]=ny[24]-(tBox.height/2+10*sfac[24]);
bb[24]=ny[24]+(tBox.height/2+10*sfac[24]);
bl[24]=nx[24]-(tBox.width/2+10*sfac[24]);
br[24]=nx[24]+(tBox.width/2+10*sfac[24]);
rect=paper.rect(bl[24], bt[24], br[24]-bl[24], bb[24]-bt[24], 10*sfac[24]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[24]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[25],ny[25]-10,'Types of Animal Behavior').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[25]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Types-of-Animal-Behavior/#Types of Animal Behavior", target: "_top"});
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
t=paper.text(nx[26],ny[26]-10,'Insects').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[26]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Insects/#Insects", target: "_top"});
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
t=paper.text(nx[27],ny[27]-10,'Characteristics of Living\nOrganisms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[27]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Characteristics-of-Living-Organisms/#Characteristics of Living Organisms", target: "_top"});
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
t=paper.text(nx[28],ny[28]-10,'Cell Structures').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[28]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cell-Structures---Cells-and-Their-Structures/#Cell Structures", target: "_top"});
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
t=paper.text(nx[29],ny[29]-10,'Archaea').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[29]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Archaea/#Archaea", target: "_top"});
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
t=paper.text(nx[30],ny[30]-10,'Reptiles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[30]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reptiles---Fishes,-Amphibians,-and-Reptiles/#Reptiles", target: "_top"});
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
t=paper.text(nx[31],ny[31]-10,'Evidence of Evolution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[31]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Evidence-of-Evolution/#Evidence of Evolution", target: "_top"});
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
t=paper.text(nx[32],ny[32]-10,'What Are the Life Sciences?').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[32]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/What-Are-the-Life-Sciences?/#What Are the Life Sciences?", target: "_top"});
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
t=paper.text(nx[33],ny[33],'Cell Division, Reproduction,\nand DNA').attr({fill:"#666666","font-size": 14*sfac[33]});
tBox=t.getBBox(); 
bt[33]=ny[33]-(tBox.height/2+10*sfac[33]);
bb[33]=ny[33]+(tBox.height/2+10*sfac[33]);
bl[33]=nx[33]-(tBox.width/2+10*sfac[33]);
br[33]=nx[33]+(tBox.width/2+10*sfac[33]);
rect=paper.rect(bl[33], bt[33], br[33]-bl[33], bb[33]-bt[33], 10*sfac[33]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[33]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[34],ny[34]-10,'Flow of Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[34]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Flow-of-Energy/#Flow of Energy", target: "_top"});
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
t=paper.text(nx[35],ny[35]-10,'Fungi').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[35]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Fungi/#Fungi", target: "_top"});
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
t=paper.text(nx[36],ny[36]-10,'Female Reproductive\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[36]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Female-Reproductive-System---Reproductive-Systems-and-Life-Stages/#Female Reproductive System", target: "_top"});
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
t=paper.text(nx[37],ny[37],'Ecosystem Dynamics').attr({fill:"#666666","font-size": 14*sfac[37]});
tBox=t.getBBox(); 
bt[37]=ny[37]-(tBox.height/2+10*sfac[37]);
bb[37]=ny[37]+(tBox.height/2+10*sfac[37]);
bl[37]=nx[37]-(tBox.width/2+10*sfac[37]);
br[37]=nx[37]+(tBox.width/2+10*sfac[37]);
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[37]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[38],ny[38],'Prokaryotes').attr({fill:"#666666","font-size": 14*sfac[38]});
tBox=t.getBBox(); 
bt[38]=ny[38]-(tBox.height/2+10*sfac[38]);
bb[38]=ny[38]+(tBox.height/2+10*sfac[38]);
bl[38]=nx[38]-(tBox.width/2+10*sfac[38]);
br[38]=nx[38]+(tBox.width/2+10*sfac[38]);
rect=paper.rect(bl[38], bt[38], br[38]-bl[38], bb[38]-bt[38], 10*sfac[38]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[38]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[39],ny[39],'Other Invertebrates').attr({fill:"#666666","font-size": 14*sfac[39]});
tBox=t.getBBox(); 
bt[39]=ny[39]-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[40],ny[40]-10,'Other Senses').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[40]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Other-Senses/#Other Senses", target: "_top"});
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
t=paper.text(nx[41],ny[41]-10,'History of Life on Earth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[41]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/History-of-Life-on-Earth/#History of Life on Earth", target: "_top"});
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
t=paper.text(nx[42],ny[42]-10,'Evolution by Natural\nSelection').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[42]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Evolution-by-Natural-Selection/#Evolution by Natural Selection", target: "_top"});
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
t=paper.text(nx[43],ny[43]-10,'Choosing Healthy Foods').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[43]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Choosing-Healthy-Foods/#Choosing Healthy Foods", target: "_top"});
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
t=paper.text(nx[44],ny[44]-10,'Transport').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[44]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Transport/#Transport", target: "_top"});
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
t=paper.text(nx[45],ny[45],'Respiratory and Excretory\nSystems').attr({fill:"#666666","font-size": 14*sfac[45]});
tBox=t.getBBox(); 
bt[45]=ny[45]-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[45]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[46],ny[46]-10,'RNA, DNA, and\nProtein Synthesis').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[46]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/DNA,-RNA,-and-Protein-Synthesis/#RNA, DNA, and Protein Synthesis", target: "_top"});
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
t=paper.text(nx[47],ny[47],'Evolution').attr({fill:"#666666","font-size": 14*sfac[47]});
tBox=t.getBBox(); 
bt[47]=ny[47]-(tBox.height/2+10*sfac[47]);
bb[47]=ny[47]+(tBox.height/2+10*sfac[47]);
bl[47]=nx[47]-(tBox.width/2+10*sfac[47]);
br[47]=nx[47]+(tBox.width/2+10*sfac[47]);
rect=paper.rect(bl[47], bt[47], br[47]-bl[47], bb[47]-bt[47], 10*sfac[47]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[47]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[48],ny[48]-10,'Male Reproductive\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[48]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Male-Reproductive-System---Reproductive-Systems-and-Life-Stages/#Male Reproductive System", target: "_top"});
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
t=paper.text(nx[49],ny[49]-10,'Cellular Respiration').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[49]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cellular-Respiration/#Cellular Respiration", target: "_top"});
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
t=paper.text(nx[50],ny[50]-10,'Blood').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[50]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Blood/#Blood", target: "_top"});
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
t=paper.text(nx[51],ny[51]-10,'Reproductive System\nHealth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[51]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reproductive-System-Health/#Reproductive System Health", target: "_top"});
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
t=paper.text(nx[52],ny[52]-10,'Mollusks').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[52]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mollusks/#Mollusks", target: "_top"});
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
t=paper.text(nx[53],ny[53],'Immune System Defenses').attr({fill:"#666666","font-size": 14*sfac[53]});
tBox=t.getBBox(); 
bt[53]=ny[53]-(tBox.height/2+10*sfac[53]);
bb[53]=ny[53]+(tBox.height/2+10*sfac[53]);
bl[53]=nx[53]-(tBox.width/2+10*sfac[53]);
br[53]=nx[53]+(tBox.width/2+10*sfac[53]);
rect=paper.rect(bl[53], bt[53], br[53]-bl[53], bb[53]-bt[53], 10*sfac[53]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[53]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[54],ny[54],'Fishes, Amphibians, and Reptiles').attr({fill:"#666666","font-size": 14*sfac[54]});
tBox=t.getBBox(); 
bt[54]=ny[54]-(tBox.height/2+10*sfac[54]);
bb[54]=ny[54]+(tBox.height/2+10*sfac[54]);
bl[54]=nx[54]-(tBox.width/2+10*sfac[54]);
br[54]=nx[54]+(tBox.width/2+10*sfac[54]);
rect=paper.rect(bl[54], bt[54], br[54]-bl[54], bb[54]-bt[54], 10*sfac[54]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[54]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[55],ny[55]-10,'Water Pollution and\nWaste').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[55]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Water-Pollution-and-Waste/#Water Pollution and Waste", target: "_top"});
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
t=paper.text(nx[56],ny[56]-10,'Cell Division').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[56]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cell-Division/#Cell Division", target: "_top"});
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
t=paper.text(nx[57],ny[57]-10,'Mammals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[57]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mammals/#Mammals", target: "_top"});
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
t=paper.text(nx[58],ny[58]-10,'Echinoderms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[58]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Echinoderms/#Echinoderms", target: "_top"});
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
t=paper.text(nx[59],ny[59]-10,'The Integumentary\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[59]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Integumentary-System---Skin,-Bones,-and-Muscles/#The Integumentary System", target: "_top"});
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
t=paper.text(nx[60],ny[60]-10,'Seed Plants').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[60]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Seed-Plants/#Seed Plants", target: "_top"});
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
t=paper.text(nx[61],ny[61],'From Populations to the\nBiosphere').attr({fill:"#666666","font-size": 14*sfac[61]});
tBox=t.getBBox(); 
bt[61]=ny[61]-(tBox.height/2+10*sfac[61]);
bb[61]=ny[61]+(tBox.height/2+10*sfac[61]);
bl[61]=nx[61]-(tBox.width/2+10*sfac[61]);
br[61]=nx[61]+(tBox.width/2+10*sfac[61]);
rect=paper.rect(bl[61], bt[61], br[61]-bl[61], bb[61]-bt[61], 10*sfac[61]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[61]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[62],ny[62]-10,'Modern Genetics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[62]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Modern-Genetics/#Modern Genetics", target: "_top"});
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
t=paper.text(nx[63],ny[63],'Life Science').attr({fill:"#000000","font-size": 24*sfac[63]});
tBox=t.getBBox(); 
bt[63]=ny[63]-(tBox.height/2+10*sfac[63]);
bb[63]=ny[63]+(tBox.height/2+10*sfac[63]);
bl[63]=nx[63]-(tBox.width/2+10*sfac[63]);
br[63]=nx[63]+(tBox.width/2+10*sfac[63]);
rect=paper.rect(bl[63], bt[63], br[63]-bl[63], bb[63]-bt[63], 10*sfac[63]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[63]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[64],ny[64]-10,'Protists').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[64]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Protists/#Protists", target: "_top"});
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
t=paper.text(nx[65],ny[65]-10,'Chemicals of Life').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[65]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Chemicals-of-Life/#Chemicals of Life", target: "_top"});
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
t=paper.text(nx[66],ny[66]-10,'Fishes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[66]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Fishes/#Fishes", target: "_top"});
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
t=paper.text(nx[67],ny[67]-10,'Anthropods').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[67]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Arthropods/#Anthropods", target: "_top"});
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
t=paper.text(nx[68],ny[68]-10,'Communities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[68]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Communities/#Communities", target: "_top"});
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
t=paper.text(nx[69],ny[69]-10,'Biomes and Biospheres').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[69]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Biomes-and-the-Biosphere/#Biomes and Biospheres", target: "_top"});
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
t=paper.text(nx[70],ny[70],'What is a Living Organism?').attr({fill:"#666666","font-size": 14*sfac[70]});
tBox=t.getBBox(); 
bt[70]=ny[70]-(tBox.height/2+10*sfac[70]);
bb[70]=ny[70]+(tBox.height/2+10*sfac[70]);
bl[70]=nx[70]-(tBox.width/2+10*sfac[70]);
br[70]=nx[70]+(tBox.width/2+10*sfac[70]);
rect=paper.rect(bl[70], bt[70], br[70]-bl[70], bb[70]-bt[70], 10*sfac[70]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[70]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[71],ny[71],'Controlling the Body').attr({fill:"#666666","font-size": 14*sfac[71]});
tBox=t.getBBox(); 
bt[71]=ny[71]-(tBox.height/2+10*sfac[71]);
bb[71]=ny[71]+(tBox.height/2+10*sfac[71]);
bl[71]=nx[71]-(tBox.width/2+10*sfac[71]);
br[71]=nx[71]+(tBox.width/2+10*sfac[71]);
rect=paper.rect(bl[71], bt[71], br[71]-bl[71], bb[71]-bt[71], 10*sfac[71]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[71]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[72],ny[72],'Protists and Fungi').attr({fill:"#666666","font-size": 14*sfac[72]});
tBox=t.getBBox(); 
bt[72]=ny[72]-(tBox.height/2+10*sfac[72]);
bb[72]=ny[72]+(tBox.height/2+10*sfac[72]);
bl[72]=nx[72]-(tBox.width/2+10*sfac[72]);
br[72]=nx[72]+(tBox.width/2+10*sfac[72]);
rect=paper.rect(bl[72], bt[72], br[72]-bl[72], bb[72]-bt[72], 10*sfac[72]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[72]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[73],ny[73]-10,'Photosynthesis').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[73]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Photosynthesis/#Photosynthesis", target: "_top"});
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
t=paper.text(nx[74],ny[74],'Food and the Digestive\nSystem').attr({fill:"#666666","font-size": 14*sfac[74]});
tBox=t.getBBox(); 
bt[74]=ny[74]-(tBox.height/2+10*sfac[74]);
bb[74]=ny[74]+(tBox.height/2+10*sfac[74]);
bl[74]=nx[74]-(tBox.width/2+10*sfac[74]);
br[74]=nx[74]+(tBox.width/2+10*sfac[74]);
rect=paper.rect(bl[74], bt[74], br[74]-bl[74], bb[74]-bt[74], 10*sfac[74]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[74]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[75],ny[75]-10,'Health of the Nervous\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[75]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Health-of-the-Nervous-System/#Health of the Nervous System", target: "_top"});
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
t=paper.text(nx[76],ny[76],'Cells and their Structures').attr({fill:"#666666","font-size": 14*sfac[76]});
tBox=t.getBBox(); 
bt[76]=ny[76]-(tBox.height/2+10*sfac[76]);
bb[76]=ny[76]+(tBox.height/2+10*sfac[76]);
bl[76]=nx[76]-(tBox.width/2+10*sfac[76]);
br[76]=nx[76]+(tBox.width/2+10*sfac[76]);
rect=paper.rect(bl[76], bt[76], br[76]-bl[76], bb[76]-bt[76], 10*sfac[76]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[76]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[77],ny[77]-10,'Populations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[77]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Populations/#Populations", target: "_top"});
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
t=paper.text(nx[78],ny[78]-10,'Health of the Respiratory\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[78]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Health-of-the-Respiratory-System/#Health of the Respiratory System", target: "_top"});
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
t=paper.text(nx[79],ny[79]-10,'Amphibians').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[79]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Amphibians---Fishes,-Amphibians,-and-Reptiles/#Amphibians", target: "_top"});
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
t=paper.text(nx[80],ny[80],"Disease and the Body's Defense").attr({fill:"#666666","font-size": 14*sfac[80]});
tBox=t.getBBox(); 
bt[80]=ny[80]-(tBox.height/2+10*sfac[80]);
bb[80]=ny[80]+(tBox.height/2+10*sfac[80]);
bl[80]=nx[80]-(tBox.width/2+10*sfac[80]);
br[80]=nx[80]+(tBox.width/2+10*sfac[80]);
rect=paper.rect(bl[80], bt[80], br[80]-bl[80], bb[80]-bt[80], 10*sfac[80]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[80]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[81],ny[81]-10,'Organization of Your\nBody').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[81]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Organization-of-Your-Body/#Organization of Your Body", target: "_top"});
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
t=paper.text(nx[82],ny[82],'Cardiovascular System').attr({fill:"#666666","font-size": 14*sfac[82]});
tBox=t.getBBox(); 
bt[82]=ny[82]-(tBox.height/2+10*sfac[82]);
bb[82]=ny[82]+(tBox.height/2+10*sfac[82]);
bl[82]=nx[82]-(tBox.width/2+10*sfac[82]);
br[82]=nx[82]+(tBox.width/2+10*sfac[82]);
rect=paper.rect(bl[82], bt[82], br[82]-bl[82], bb[82]-bt[82], 10*sfac[82]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[82]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[83],ny[83],'Macroevolution').attr({fill:"#666666","font-size": 14*sfac[83]});
tBox=t.getBBox(); 
bt[83]=ny[83]-(tBox.height/2+10*sfac[83]);
bb[83]=ny[83]+(tBox.height/2+10*sfac[83]);
bl[83]=nx[83]-(tBox.width/2+10*sfac[83]);
br[83]=nx[83]+(tBox.width/2+10*sfac[83]);
rect=paper.rect(bl[83], bt[83], br[83]-bl[83], bb[83]-bt[83], 10*sfac[83]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[83]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[84],ny[84]-10,'Primates and Humans').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[84]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Primates-and-Humans/#Primates and Humans", target: "_top"});
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
t=paper.text(nx[85],ny[85],'First Two Lines\nof Defense').attr({fill:"#666666","font-size": 14*sfac[85]});
tBox=t.getBBox(); 
bt[85]=ny[85]-(tBox.height/2+10*sfac[85]);
bb[85]=ny[85]+(tBox.height/2+10*sfac[85]);
bl[85]=nx[85]-(tBox.width/2+10*sfac[85]);
br[85]=nx[85]+(tBox.width/2+10*sfac[85]);
rect=paper.rect(bl[85], bt[85], br[85]-bl[85], bb[85]-bt[85], 10*sfac[85]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[85]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[86],ny[86]-10,'Tools of Science').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[86]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Tools-of-Science/#Tools of Science", target: "_top"});
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

paper.setStart(); 
t=paper.text(nx[87],ny[87]-10,'Heart and Blood\nVessels').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[87]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Heart-and-Blood-Vessels/#Heart and Blood Vessels", target: "_top"});
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
t=paper.text(nx[88],ny[88],'Skin, Bones, and Muscles').attr({fill:"#666666","font-size": 14*sfac[88]});
tBox=t.getBBox(); 
bt[88]=ny[88]-(tBox.height/2+10*sfac[88]);
bb[88]=ny[88]+(tBox.height/2+10*sfac[88]);
bl[88]=nx[88]-(tBox.width/2+10*sfac[88]);
br[88]=nx[88]+(tBox.width/2+10*sfac[88]);
rect=paper.rect(bl[88], bt[88], br[88]-bl[88], bb[88]-bt[88], 10*sfac[88]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[88]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[89],ny[89]-10,'Ecosystem Change').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[89]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ecosystem-Change/#Ecosystem Change", target: "_top"});
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
t=paper.text(nx[90],ny[90]-10,'Cycles of Matter').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[90]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cycles-of-Matter/#Cycles of Matter", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[90]=ny[90]-10-(tBox.height/2+10*sfac[90]);
bb[90]=ny[90]-10+(tBox.height/2+10*sfac[90]);
bl[90]=nx[90]-(tBox.width/2+10*sfac[90]);
br[90]=nx[90]+(tBox.width/2+10*sfac[90]);
var nwidth = br[90]-bl[90]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[90] = bl[90] - delta; 
    br[90] = br[90] + delta; 
} 
bb[90] = bb[90]+20; 
rect=paper.rect(bl[90], bt[90], br[90]-bl[90], bb[90]-bt[90], 10*sfac[90]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[90]-42,bb[90]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[90]-18,bb[90]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[90]+5,bb[90]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[90]+25,bb[90]-25,20,20); 
t.toFront(); 
b[90]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[91],ny[91]-10,'Health of the Cardiovascular\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[91]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Health-of-the-Cardiovascular-System/#Health of the Cardiovascular System", target: "_top"});
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
t=paper.text(nx[92],ny[92],'Food and Nutrients').attr({fill:"#666666","font-size": 14*sfac[92]});
tBox=t.getBBox(); 
bt[92]=ny[92]-(tBox.height/2+10*sfac[92]);
bb[92]=ny[92]+(tBox.height/2+10*sfac[92]);
bl[92]=nx[92]-(tBox.width/2+10*sfac[92]);
br[92]=nx[92]+(tBox.width/2+10*sfac[92]);
rect=paper.rect(bl[92], bt[92], br[92]-bl[92], bb[92]-bt[92], 10*sfac[92]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[92]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[93],ny[93]-10,'Ecosystems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[93]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ecosystems---From-Populations-to-the-Biosphere/#Ecosystems", target: "_top"});
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
t=paper.text(nx[94],ny[94]-10,'Eyes and Vision').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[94]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Eyes-and-Vision/#Eyes and Vision", target: "_top"});
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
t=paper.text(nx[95],ny[95]-10,'Gregor Mendel and the\nFoundations of Genetics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[95]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Gregor-Mendel-and-the-Foundations-of-Genetics/#Gregor Mendel and the Foundations of Genetics", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[95]=ny[95]-10-(tBox.height/2+10*sfac[95]);
bb[95]=ny[95]-10+(tBox.height/2+10*sfac[95]);
bl[95]=nx[95]-(tBox.width/2+10*sfac[95]);
br[95]=nx[95]+(tBox.width/2+10*sfac[95]);
var nwidth = br[95]-bl[95]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[95] = bl[95] - delta; 
    br[95] = br[95] + delta; 
} 
bb[95] = bb[95]+20; 
rect=paper.rect(bl[95], bt[95], br[95]-bl[95], bb[95]-bt[95], 10*sfac[95]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[95]-42,bb[95]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[95]-18,bb[95]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[95]+5,bb[95]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[95]+25,bb[95]-25,20,20); 
t.toFront(); 
b[95]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[96],ny[96],'Behavior of Animals').attr({fill:"#666666","font-size": 14*sfac[96]});
tBox=t.getBBox(); 
bt[96]=ny[96]-(tBox.height/2+10*sfac[96]);
bb[96]=ny[96]+(tBox.height/2+10*sfac[96]);
bl[96]=nx[96]-(tBox.width/2+10*sfac[96]);
br[96]=nx[96]+(tBox.width/2+10*sfac[96]);
rect=paper.rect(bl[96], bt[96], br[96]-bl[96], bb[96]-bt[96], 10*sfac[96]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[96]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[97],ny[97]-10,'The Digestive\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[97]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Digestive-System---Food-and-the-Digestive-System/#The Digestive System", target: "_top"});
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
t=paper.text(nx[98],ny[98]-10,'The Muscular\nSystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[98]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Muscular-System---Skin,-Bones,-and-Muscles/#The Muscular System", target: "_top"});
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

paper.setStart(); 
t=paper.text(nx[99],ny[99]-10,'Plant Responses').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[99]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Plant-Responses/#Plant Responses", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[99]=ny[99]-10-(tBox.height/2+10*sfac[99]);
bb[99]=ny[99]-10+(tBox.height/2+10*sfac[99]);
bl[99]=nx[99]-(tBox.width/2+10*sfac[99]);
br[99]=nx[99]+(tBox.width/2+10*sfac[99]);
var nwidth = br[99]-bl[99]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[99] = bl[99] - delta; 
    br[99] = br[99] + delta; 
} 
bb[99] = bb[99]+20; 
rect=paper.rect(bl[99], bt[99], br[99]-bl[99], bb[99]-bt[99], 10*sfac[99]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[99]-42,bb[99]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[99]-18,bb[99]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[99]+5,bb[99]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[99]+25,bb[99]-25,20,20); 
t.toFront(); 
b[99]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[100],ny[100],'Reproductive Systems and\nLife Stages').attr({fill:"#666666","font-size": 14*sfac[100]});
tBox=t.getBBox(); 
bt[100]=ny[100]-(tBox.height/2+10*sfac[100]);
bb[100]=ny[100]+(tBox.height/2+10*sfac[100]);
bl[100]=nx[100]-(tBox.width/2+10*sfac[100]);
br[100]=nx[100]+(tBox.width/2+10*sfac[100]);
rect=paper.rect(bl[100], bt[100], br[100]-bl[100], bb[100]-bt[100], 10*sfac[100]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[100]=paper.setFinish(); 

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

bb[104]= ny[104]; 
bt[104]= ny[104]; 
bl[104]= nx[104]; 
br[104]= nx[104]; 

bb[105]= ny[105]; 
bt[105]= ny[105]; 
bl[105]= nx[105]; 
br[105]= nx[105]; 

bb[106]= ny[106]; 
bt[106]= ny[106]; 
bl[106]= nx[106]; 
br[106]= nx[106]; 

bb[107]= ny[107]; 
bt[107]= ny[107]; 
bl[107]= nx[107]; 
br[107]= nx[107]; 

bb[108]= ny[108]; 
bt[108]= ny[108]; 
bl[108]= nx[108]; 
br[108]= nx[108]; 

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
b[99].click(function() {recenter(99);}); 
b[100].click(function() {recenter(100);}); 
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
b[99].hover(function() {nodeHover(99);}, function() {nodeUnhover(99);}); 
b[100].hover(function() {nodeHover(100);}, function() {nodeUnhover(100);}); 
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
s1='M '+nx[1]+' '+bb[1]+' L '+nx[1]+' '+bt[78]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[1,78] ; 

paper.setStart(); 
mid=bb[2]+(bt[17]-bb[2])/2; 
hleft = nx[99]; 
hright = nx[2]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[2]+' '+bb[2]+' L '+nx[2]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[99]+' '+mid+' L '+nx[99]+' '+bt[99];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[2,99]; 

paper.setStart(); 
mid=bb[2]+(bt[17]-bb[2])/2; 
hleft = nx[17]; 
hright = nx[2]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[17]+' '+mid+' L '+nx[17]+' '+bt[17];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[2,17]; 

paper.setStart(); 
s1='M '+nx[4]+' '+bb[4]+' L '+nx[4]+' '+ny[107]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[4],nx[107])+' '+ny[107]+' L '+Math.max(nx[4],nx[107])+' '+ny[107]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[4,107]; 

paper.setStart(); 
mid=bb[6]+(bt[8]-bb[6])/2; 
hleft = nx[10]; 
hright = nx[6]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[6]+' '+bb[6]+' L '+nx[6]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[10]+' '+mid+' L '+nx[10]+' '+bt[10];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[6,10]; 

paper.setStart(); 
mid=bb[6]+(bt[8]-bb[6])/2; 
s3='M '+nx[55]+' '+mid+' L '+nx[55]+' '+bt[55];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[6,55]; 

paper.setStart(); 
mid=bb[6]+(bt[8]-bb[6])/2; 
hleft = nx[8]; 
hright = nx[6]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[8]+' '+mid+' L '+nx[8]+' '+bt[8];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[6,8]; 

paper.setStart(); 
mid=bb[6]+(bt[8]-bb[6])/2; 
s3='M '+nx[22]+' '+mid+' L '+nx[22]+' '+bt[22];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[6,22]; 

paper.setStart(); 
s1='M '+nx[7]+' '+bb[7]+' L '+nx[7]+' '+bt[75]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[7,75] ; 

paper.setStart(); 
s1='M '+nx[9]+' '+bb[9]+' L '+nx[9]+' '+ny[102]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[9],nx[102])+' '+ny[102]+' L '+Math.max(nx[9],nx[102])+' '+ny[102]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[9,102]; 

paper.setStart(); 
s1='M '+nx[11]+' '+bb[11]+' L '+nx[11]+' '+bt[95]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[11,95] ; 

paper.setStart(); 
s1='M '+nx[12]+' '+bb[12]+' L '+nx[12]+' '+ny[101]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[12],nx[101])+' '+ny[101]+' L '+Math.max(nx[12],nx[101])+' '+ny[101]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[12,101]; 

paper.setStart(); 
mid=bb[13]+(bt[32]-bb[13])/2; 
hleft = nx[86]; 
hright = nx[13]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[13]+' '+bb[13]+' L '+nx[13]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[86]+' '+mid+' L '+nx[86]+' '+bt[86];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[13,86]; 

paper.setStart(); 
mid=bb[13]+(bt[32]-bb[13])/2; 
hleft = nx[32]; 
hright = nx[13]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[32]+' '+mid+' L '+nx[32]+' '+bt[32];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[13,32]; 

paper.setStart(); 
mid=bb[15]+(bt[73]-bb[15])/2; 
s2='M '+nx[15]+' '+bb[15]+' L '+nx[15]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[44]+' '+mid+' L '+nx[44]+' '+bt[44];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[15,44]; 

paper.setStart(); 
mid=bb[15]+(bt[73]-bb[15])/2; 
hleft = nx[33]; 
hright = nx[15]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[33]+' '+mid+' L '+nx[33]+' '+bt[33];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[15,33]; 

paper.setStart(); 
mid=bb[15]+(bt[73]-bb[15])/2; 
hleft = nx[73]; 
hright = nx[15]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[73]+' '+mid+' L '+nx[73]+' '+bt[73];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[15,73]; 

paper.setStart(); 
mid=bb[16]+(bt[96]-bb[16])/2; 
s2='M '+nx[16]+' '+bb[16]+' L '+nx[16]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[57]+' '+mid+' L '+nx[57]+' '+bt[57];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[16,57]; 

paper.setStart(); 
mid=bb[16]+(bt[96]-bb[16])/2; 
s3='M '+nx[3]+' '+mid+' L '+nx[3]+' '+bt[3];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[16,3]; 

paper.setStart(); 
mid=bb[16]+(bt[96]-bb[16])/2; 
hleft = nx[96]; 
hright = nx[16]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[96]+' '+mid+' L '+nx[96]+' '+bt[96];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[16,96]; 

paper.setStart(); 
mid=bb[16]+(bt[96]-bb[16])/2; 
hleft = nx[84]; 
hright = nx[16]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[84]+' '+mid+' L '+nx[84]+' '+bt[84];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[16,84]; 

paper.setStart(); 
s1='M '+nx[17]+' '+bb[17]+' L '+nx[17]+' '+bt[60]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[17,60] ; 

paper.setStart(); 
s1='M '+nx[20]+' '+bb[20]+' L '+nx[20]+' '+bt[25]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[20,25] ; 

paper.setStart(); 
s1='M '+nx[26]+' '+bb[26]+' L '+nx[26]+' '+ny[103]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[26],nx[103])+' '+ny[103]+' L '+Math.max(nx[26],nx[103])+' '+ny[103]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[26,103]; 

paper.setStart(); 
s1='M '+nx[27]+' '+bb[27]+' L '+nx[27]+' '+ny[107]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[27],nx[107])+' '+ny[107]+' L '+Math.max(nx[27],nx[107])+' '+ny[107]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[27,107]; 

paper.setStart(); 
mid=bb[28]+(bt[15]-bb[28])/2; 
hleft = nx[38]; 
hright = nx[28]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[28]+' '+bb[28]+' L '+nx[28]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[38]+' '+mid+' L '+nx[38]+' '+bt[38];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[28,38]; 

paper.setStart(); 
mid=bb[28]+(bt[15]-bb[28])/2; 
hleft = nx[15]; 
hright = nx[28]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[15]+' '+mid+' L '+nx[15]+' '+bt[15];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[28,15]; 

paper.setStart(); 
s1='M '+nx[29]+' '+bb[29]+' L '+nx[29]+' '+ny[102]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[29],nx[102])+' '+ny[102]+' L '+Math.max(nx[29],nx[102])+' '+ny[102]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[29,102]; 

paper.setStart(); 
s1='M '+nx[30]+' '+bb[30]+' L '+nx[30]+' '+ny[108]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[30],nx[108])+' '+ny[108]+' L '+Math.max(nx[30],nx[108])+' '+ny[108]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[30,108]; 

paper.setStart(); 
s1='M '+nx[31]+' '+bb[31]+' L '+nx[31]+' '+bt[83]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[31,83] ; 

paper.setStart(); 
s1='M '+nx[32]+' '+bb[32]+' L '+nx[32]+' '+bt[70]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[32,70] ; 

paper.setStart(); 
mid=bb[33]+(bt[56]-bb[33])/2; 
s2='M '+nx[33]+' '+bb[33]+' L '+nx[33]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[12]+' '+mid+' L '+nx[12]+' '+bt[12];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[33,12]; 

paper.setStart(); 
mid=bb[33]+(bt[56]-bb[33])/2; 
hleft = nx[56]; 
hright = nx[33]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[56]+' '+mid+' L '+nx[56]+' '+bt[56];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[33,56]; 

paper.setStart(); 
mid=bb[33]+(bt[56]-bb[33])/2; 
hleft = nx[46]; 
hright = nx[33]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[46]+' '+mid+' L '+nx[46]+' '+bt[46];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[33,46]; 

paper.setStart(); 
s1='M '+nx[35]+' '+bb[35]+' L '+nx[35]+' '+ny[106]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[35],nx[106])+' '+ny[106]+' L '+Math.max(nx[35],nx[106])+' '+ny[106]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[35,106]; 

paper.setStart(); 
s1='M '+nx[36]+' '+bb[36]+' L '+nx[36]+' '+ny[105]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[36],nx[105])+' '+ny[105]+' L '+Math.max(nx[36],nx[105])+' '+ny[105]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[36,105]; 

paper.setStart(); 
mid=bb[37]+(bt[34]-bb[37])/2; 
s2='M '+nx[37]+' '+bb[37]+' L '+nx[37]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[90]+' '+mid+' L '+nx[90]+' '+bt[90];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[37,90]; 

paper.setStart(); 
mid=bb[37]+(bt[34]-bb[37])/2; 
hleft = nx[89]; 
hright = nx[37]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[89]+' '+mid+' L '+nx[89]+' '+bt[89];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[37,89]; 

paper.setStart(); 
mid=bb[37]+(bt[34]-bb[37])/2; 
hleft = nx[34]; 
hright = nx[37]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[34]+' '+mid+' L '+nx[34]+' '+bt[34];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[37,34]; 

paper.setStart(); 
mid=bb[38]+(bt[29]-bb[38])/2; 
hleft = nx[9]; 
hright = nx[38]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[38]+' '+bb[38]+' L '+nx[38]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[9]+' '+mid+' L '+nx[9]+' '+bt[9];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[38,9]; 

paper.setStart(); 
mid=bb[38]+(bt[29]-bb[38])/2; 
hleft = nx[29]; 
hright = nx[38]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[29]+' '+mid+' L '+nx[29]+' '+bt[29];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[38,29]; 

paper.setStart(); 
mid=bb[39]+(bt[26]-bb[39])/2; 
hleft = nx[52]; 
hright = nx[39]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[39]+' '+bb[39]+' L '+nx[39]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[52]+' '+mid+' L '+nx[52]+' '+bt[52];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[39,52]; 

paper.setStart(); 
mid=bb[39]+(bt[26]-bb[39])/2; 
s3='M '+nx[67]+' '+mid+' L '+nx[67]+' '+bt[67];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[39,67]; 

paper.setStart(); 
mid=bb[39]+(bt[26]-bb[39])/2; 
s3='M '+nx[58]+' '+mid+' L '+nx[58]+' '+bt[58];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[39,58]; 

paper.setStart(); 
mid=bb[39]+(bt[26]-bb[39])/2; 
hleft = nx[26]; 
hright = nx[39]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[26]+' '+mid+' L '+nx[26]+' '+bt[26];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[39,26]; 

paper.setStart(); 
s1='M '+nx[42]+' '+bb[42]+' L '+nx[42]+' '+bt[31]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[42,31] ; 

paper.setStart(); 
mid=bb[45]+(bt[0]-bb[45])/2; 
hleft = nx[1]; 
hright = nx[45]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[45]+' '+bb[45]+' L '+nx[45]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[1]+' '+mid+' L '+nx[1]+' '+bt[1];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[45,1]; 

paper.setStart(); 
mid=bb[45]+(bt[0]-bb[45])/2; 
hleft = nx[0]; 
hright = nx[45]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[0]+' '+mid+' L '+nx[0]+' '+bt[0];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[45,0]; 

paper.setStart(); 
s1='M '+nx[46]+' '+bb[46]+' L '+nx[46]+' '+ny[101]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[46],nx[101])+' '+ny[101]+' L '+Math.max(nx[46],nx[101])+' '+ny[101]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[46,101]; 

paper.setStart(); 
s1='M '+nx[47]+' '+bb[47]+' L '+nx[47]+' '+bt[42]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[49]=paper.setFinish(); 
lineNodes[49]=[47,42] ; 

paper.setStart(); 
s1='M '+nx[48]+' '+bb[48]+' L '+nx[48]+' '+ny[105]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[48],nx[105])+' '+ny[105]+' L '+Math.max(nx[48],nx[105])+' '+ny[105]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[48,105]; 

paper.setStart(); 
s1='M '+nx[50]+' '+bb[50]+' L '+nx[50]+' '+ny[104]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[50],nx[104])+' '+ny[104]+' L '+Math.max(nx[50],nx[104])+' '+ny[104]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[50,104]; 

paper.setStart(); 
s1='M '+nx[52]+' '+bb[52]+' L '+nx[52]+' '+ny[103]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[52],nx[103])+' '+ny[103]+' L '+Math.max(nx[52],nx[103])+' '+ny[103]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[52,103]; 

paper.setStart(); 
mid=bb[54]+(bt[66]-bb[54])/2; 
s2='M '+nx[54]+' '+bb[54]+' L '+nx[54]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[79]+' '+mid+' L '+nx[79]+' '+bt[79];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[54,79]; 

paper.setStart(); 
mid=bb[54]+(bt[66]-bb[54])/2; 
hleft = nx[30]; 
hright = nx[54]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[30]+' '+mid+' L '+nx[30]+' '+bt[30];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[54,30]; 

paper.setStart(); 
mid=bb[54]+(bt[66]-bb[54])/2; 
hleft = nx[66]; 
hright = nx[54]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[66]+' '+mid+' L '+nx[66]+' '+bt[66];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[54,66]; 

paper.setStart(); 
s1='M '+nx[56]+' '+bb[56]+' L '+nx[56]+' '+ny[101]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[56],nx[101])+' '+ny[101]+' L '+Math.max(nx[56],nx[101])+' '+ny[101]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[56,101]; 

paper.setStart(); 
s1='M '+nx[58]+' '+bb[58]+' L '+nx[58]+' '+ny[103]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[58],nx[103])+' '+ny[103]+' L '+Math.max(nx[58],nx[103])+' '+ny[103]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[58,103]; 

paper.setStart(); 
s1='M '+nx[60]+' '+bb[60]+' L '+nx[60]+' '+bt[39]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[60,39] ; 

paper.setStart(); 
mid=bb[61]+(bt[77]-bb[61])/2; 
hleft = nx[93]; 
hright = nx[61]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[61]+' '+bb[61]+' L '+nx[61]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[93]+' '+mid+' L '+nx[93]+' '+bt[93];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[61,93]; 

paper.setStart(); 
mid=bb[61]+(bt[77]-bb[61])/2; 
hleft = nx[77]; 
hright = nx[61]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[77]+' '+mid+' L '+nx[77]+' '+bt[77];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[61,77]; 

paper.setStart(); 
s1='M '+nx[62]+' '+bb[62]+' L '+nx[62]+' '+bt[21]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[62,21] ; 

paper.setStart(); 
s1='M '+nx[63]+' '+bb[63]+' L '+nx[63]+' '+bt[13]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[63,13] ; 

paper.setStart(); 
s1='M '+nx[64]+' '+bb[64]+' L '+nx[64]+' '+ny[106]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[64],nx[106])+' '+ny[106]+' L '+Math.max(nx[64],nx[106])+' '+ny[106]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[64,106]; 

paper.setStart(); 
s1='M '+nx[65]+' '+bb[65]+' L '+nx[65]+' '+ny[107]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[65],nx[107])+' '+ny[107]+' L '+Math.max(nx[65],nx[107])+' '+ny[107]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[65,107]; 

paper.setStart(); 
s1='M '+nx[66]+' '+bb[66]+' L '+nx[66]+' '+ny[108]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[66],nx[108])+' '+ny[108]+' L '+Math.max(nx[66],nx[108])+' '+ny[108]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[66,108]; 

paper.setStart(); 
s1='M '+nx[67]+' '+bb[67]+' L '+nx[67]+' '+ny[103]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[67],nx[103])+' '+ny[103]+' L '+Math.max(nx[67],nx[103])+' '+ny[103]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[67,103]; 

paper.setStart(); 
mid=bb[70]+(bt[65]-bb[70])/2; 
hleft = nx[27]; 
hright = nx[70]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[70]+' '+bb[70]+' L '+nx[70]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[27]+' '+mid+' L '+nx[27]+' '+bt[27];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[70,27]; 

paper.setStart(); 
mid=bb[70]+(bt[65]-bb[70])/2; 
s3='M '+nx[65]+' '+mid+' L '+nx[65]+' '+bt[65];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[70,65]; 

paper.setStart(); 
mid=bb[70]+(bt[65]-bb[70])/2; 
hleft = nx[4]; 
hright = nx[70]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[4]+' '+mid+' L '+nx[4]+' '+bt[4];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[69]=paper.setFinish(); 
lineNodes[69]=[70,4]; 

paper.setStart(); 
mid=bb[71]+(bt[94]-bb[71])/2; 
hleft = nx[40]; 
hright = nx[71]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[71]+' '+bb[71]+' L '+nx[71]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[40]+' '+mid+' L '+nx[40]+' '+bt[40];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[70]=paper.setFinish(); 
lineNodes[70]=[71,40]; 

paper.setStart(); 
mid=bb[71]+(bt[94]-bb[71])/2; 
s3='M '+nx[94]+' '+mid+' L '+nx[94]+' '+bt[94];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[71]=paper.setFinish(); 
lineNodes[71]=[71,94]; 

paper.setStart(); 
mid=bb[71]+(bt[94]-bb[71])/2; 
hleft = nx[7]; 
hright = nx[71]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[7]+' '+mid+' L '+nx[7]+' '+bt[7];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[72]=paper.setFinish(); 
lineNodes[72]=[71,7]; 

paper.setStart(); 
mid=bb[72]+(bt[64]-bb[72])/2; 
hleft = nx[35]; 
hright = nx[72]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[72]+' '+bb[72]+' L '+nx[72]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[35]+' '+mid+' L '+nx[35]+' '+bt[35];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[73]=paper.setFinish(); 
lineNodes[73]=[72,35]; 

paper.setStart(); 
mid=bb[72]+(bt[64]-bb[72])/2; 
hleft = nx[64]; 
hright = nx[72]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[64]+' '+mid+' L '+nx[64]+' '+bt[64];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[74]=paper.setFinish(); 
lineNodes[74]=[72,64]; 

paper.setStart(); 
s1='M '+nx[73]+' '+bb[73]+' L '+nx[73]+' '+bt[49]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[75]=paper.setFinish(); 
lineNodes[75]=[73,49] ; 

paper.setStart(); 
mid=bb[74]+(bt[92]-bb[74])/2; 
hleft = nx[92]; 
hright = nx[74]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[74]+' '+bb[74]+' L '+nx[74]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[92]+' '+mid+' L '+nx[92]+' '+bt[92];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[76]=paper.setFinish(); 
lineNodes[76]=[74,92]; 

paper.setStart(); 
mid=bb[74]+(bt[92]-bb[74])/2; 
hleft = nx[97]; 
hright = nx[74]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[97]+' '+mid+' L '+nx[97]+' '+bt[97];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[77]=paper.setFinish(); 
lineNodes[77]=[74,97]; 

paper.setStart(); 
s1='M '+nx[76]+' '+bb[76]+' L '+nx[76]+' '+bt[28]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[78]=paper.setFinish(); 
lineNodes[78]=[76,28] ; 

paper.setStart(); 
s1='M '+nx[77]+' '+bb[77]+' L '+nx[77]+' '+bt[68]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[79]=paper.setFinish(); 
lineNodes[79]=[77,68] ; 

paper.setStart(); 
s1='M '+nx[79]+' '+bb[79]+' L '+nx[79]+' '+ny[108]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[79],nx[108])+' '+ny[108]+' L '+Math.max(nx[79],nx[108])+' '+ny[108]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[80]=paper.setFinish(); 
lineNodes[80]=[79,108]; 

paper.setStart(); 
mid=bb[80]+(bt[18]-bb[80])/2; 
hleft = nx[85]; 
hright = nx[80]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[80]+' '+bb[80]+' L '+nx[80]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[85]+' '+mid+' L '+nx[85]+' '+bt[85];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[81]=paper.setFinish(); 
lineNodes[81]=[80,85]; 

paper.setStart(); 
mid=bb[80]+(bt[18]-bb[80])/2; 
hleft = nx[18]; 
hright = nx[80]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[18]+' '+mid+' L '+nx[18]+' '+bt[18];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[82]=paper.setFinish(); 
lineNodes[82]=[80,18]; 

paper.setStart(); 
mid=bb[80]+(bt[18]-bb[80])/2; 
s3='M '+nx[24]+' '+mid+' L '+nx[24]+' '+bt[24];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[83]=paper.setFinish(); 
lineNodes[83]=[80,24]; 

paper.setStart(); 
mid=bb[81]+(bt[5]-bb[81])/2; 
hleft = nx[98]; 
hright = nx[81]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[81]+' '+bb[81]+' L '+nx[81]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[98]+' '+mid+' L '+nx[98]+' '+bt[98];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[84]=paper.setFinish(); 
lineNodes[84]=[81,98]; 

paper.setStart(); 
mid=bb[81]+(bt[5]-bb[81])/2; 
hleft = nx[59]; 
hright = nx[81]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[59]+' '+mid+' L '+nx[59]+' '+bt[59];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[85]=paper.setFinish(); 
lineNodes[85]=[81,59]; 

paper.setStart(); 
mid=bb[81]+(bt[5]-bb[81])/2; 
s3='M '+nx[5]+' '+mid+' L '+nx[5]+' '+bt[5];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[86]=paper.setFinish(); 
lineNodes[86]=[81,5]; 

paper.setStart(); 
mid=bb[82]+(bt[87]-bb[82])/2; 
hleft = nx[50]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[82]+' '+bb[82]+' L '+nx[82]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[50]+' '+mid+' L '+nx[50]+' '+bt[50];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[87]=paper.setFinish(); 
lineNodes[87]=[82,50]; 

paper.setStart(); 
mid=bb[82]+(bt[87]-bb[82])/2; 
hleft = nx[87]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[87]+' '+mid+' L '+nx[87]+' '+bt[87];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[88]=paper.setFinish(); 
lineNodes[88]=[82,87]; 

paper.setStart(); 
s1='M '+nx[83]+' '+bb[83]+' L '+nx[83]+' '+bt[41]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[89]=paper.setFinish(); 
lineNodes[89]=[83,41] ; 

paper.setStart(); 
mid=bb[84]+(bt[80]-bb[84])/2; 
s2='M '+nx[84]+' '+bb[84]+' L '+nx[84]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[71]+' '+mid+' L '+nx[71]+' '+bt[71];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[90]=paper.setFinish(); 
lineNodes[90]=[84,71]; 

paper.setStart(); 
mid=bb[84]+(bt[80]-bb[84])/2; 
hleft = nx[88]; 
hright = nx[84]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[88]+' '+mid+' L '+nx[88]+' '+bt[88];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[91]=paper.setFinish(); 
lineNodes[91]=[84,88]; 

paper.setStart(); 
mid=bb[84]+(bt[80]-bb[84])/2; 
s3='M '+nx[74]+' '+mid+' L '+nx[74]+' '+bt[74];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[92]=paper.setFinish(); 
lineNodes[92]=[84,74]; 

paper.setStart(); 
mid=bb[84]+(bt[80]-bb[84])/2; 
hleft = nx[100]; 
hright = nx[84]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[100]+' '+mid+' L '+nx[100]+' '+bt[100];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[93]=paper.setFinish(); 
lineNodes[93]=[84,100]; 

paper.setStart(); 
mid=bb[84]+(bt[80]-bb[84])/2; 
s3='M '+nx[80]+' '+mid+' L '+nx[80]+' '+bt[80];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[94]=paper.setFinish(); 
lineNodes[94]=[84,80]; 

paper.setStart(); 
mid=bb[84]+(bt[80]-bb[84])/2; 
s3='M '+nx[45]+' '+mid+' L '+nx[45]+' '+bt[45];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[95]=paper.setFinish(); 
lineNodes[95]=[84,45]; 

paper.setStart(); 
mid=bb[84]+(bt[80]-bb[84])/2; 
s3='M '+nx[82]+' '+mid+' L '+nx[82]+' '+bt[82];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[96]=paper.setFinish(); 
lineNodes[96]=[84,82]; 

paper.setStart(); 
s1='M '+nx[85]+' '+bb[85]+' L '+nx[85]+' '+bt[53]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[97]=paper.setFinish(); 
lineNodes[97]=[85,53] ; 

paper.setStart(); 
s1='M '+nx[86]+' '+bb[86]+' L '+nx[86]+' '+bt[23]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[98]=paper.setFinish(); 
lineNodes[98]=[86,23] ; 

paper.setStart(); 
s1='M '+nx[87]+' '+bb[87]+' L '+nx[87]+' '+ny[104]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[87],nx[104])+' '+ny[104]+' L '+Math.max(nx[87],nx[104])+' '+ny[104]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[99]=paper.setFinish(); 
lineNodes[99]=[87,104]; 

paper.setStart(); 
s1='M '+nx[88]+' '+bb[88]+' L '+nx[88]+' '+bt[81]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[100]=paper.setFinish(); 
lineNodes[100]=[88,81] ; 

paper.setStart(); 
s1='M '+nx[89]+' '+bb[89]+' L '+nx[89]+' '+bt[6]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[101]=paper.setFinish(); 
lineNodes[101]=[89,6] ; 

paper.setStart(); 
s1='M '+nx[92]+' '+bb[92]+' L '+nx[92]+' '+bt[43]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[102]=paper.setFinish(); 
lineNodes[102]=[92,43] ; 

paper.setStart(); 
mid=bb[93]+(bt[37]-bb[93])/2; 
hleft = nx[69]; 
hright = nx[93]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[93]+' '+bb[93]+' L '+nx[93]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[69]+' '+mid+' L '+nx[69]+' '+bt[69];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[103]=paper.setFinish(); 
lineNodes[103]=[93,69]; 

paper.setStart(); 
mid=bb[93]+(bt[37]-bb[93])/2; 
hleft = nx[37]; 
hright = nx[93]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[37]+' '+mid+' L '+nx[37]+' '+bt[37];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[104]=paper.setFinish(); 
lineNodes[104]=[93,37]; 

paper.setStart(); 
mid=bb[95]+(bt[14]-bb[95])/2; 
hleft = nx[62]; 
hright = nx[95]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[95]+' '+bb[95]+' L '+nx[95]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[62]+' '+mid+' L '+nx[62]+' '+bt[62];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[105]=paper.setFinish(); 
lineNodes[105]=[95,62]; 

paper.setStart(); 
mid=bb[95]+(bt[14]-bb[95])/2; 
hleft = nx[14]; 
hright = nx[95]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[14]+' '+mid+' L '+nx[14]+' '+bt[14];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[106]=paper.setFinish(); 
lineNodes[106]=[95,14]; 

paper.setStart(); 
s1='M '+nx[96]+' '+bb[96]+' L '+nx[96]+' '+bt[20]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[107]=paper.setFinish(); 
lineNodes[107]=[96,20] ; 

paper.setStart(); 
mid=bb[100]+(bt[48]-bb[100])/2; 
s2='M '+nx[100]+' '+bb[100]+' L '+nx[100]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[36]+' '+mid+' L '+nx[36]+' '+bt[36];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[108]=paper.setFinish(); 
lineNodes[108]=[100,36]; 

paper.setStart(); 
mid=bb[100]+(bt[48]-bb[100])/2; 
hleft = nx[19]; 
hright = nx[100]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[19]+' '+mid+' L '+nx[19]+' '+bt[19];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[109]=paper.setFinish(); 
lineNodes[109]=[100,19]; 

paper.setStart(); 
mid=bb[100]+(bt[48]-bb[100])/2; 
hleft = nx[48]; 
hright = nx[100]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[48]+' '+mid+' L '+nx[48]+' '+bt[48];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[110]=paper.setFinish(); 
lineNodes[110]=[100,48]; 

paper.setStart(); 
mid=bb[101]+(bt[11]-bb[101])/2; 
hleft = nx[47]; 
hright = nx[101]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[101]+' '+bb[101]+' L '+nx[101]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[47]+' '+mid+' L '+nx[47]+' '+bt[47];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[111]=paper.setFinish(); 
lineNodes[111]=[101,47]; 

paper.setStart(); 
mid=bb[101]+(bt[11]-bb[101])/2; 
hleft = nx[11]; 
hright = nx[101]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[11]+' '+mid+' L '+nx[11]+' '+bt[11];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[112]=paper.setFinish(); 
lineNodes[112]=[101,11]; 

paper.setStart(); 
s1='M '+nx[102]+' '+bb[102]+' L '+nx[102]+' '+bt[72]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[113]=paper.setFinish(); 
lineNodes[113]=[102,72] ; 

paper.setStart(); 
s1='M '+nx[103]+' '+bb[103]+' L '+nx[103]+' '+bt[54]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[114]=paper.setFinish(); 
lineNodes[114]=[103,54] ; 

paper.setStart(); 
s1='M '+nx[104]+' '+bb[104]+' L '+nx[104]+' '+bt[91]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[115]=paper.setFinish(); 
lineNodes[115]=[104,91] ; 

paper.setStart(); 
s1='M '+nx[105]+' '+bb[105]+' L '+nx[105]+' '+bt[51]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[116]=paper.setFinish(); 
lineNodes[116]=[105,51] ; 

paper.setStart(); 
s1='M '+nx[106]+' '+bb[106]+' L '+nx[106]+' '+bt[2]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[117]=paper.setFinish(); 
lineNodes[117]=[106,2] ; 

paper.setStart(); 
mid=bb[107]+(bt[76]-bb[107])/2; 
hleft = nx[76]; 
hright = nx[107]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[107]+' '+bb[107]+' L '+nx[107]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[76]+' '+mid+' L '+nx[76]+' '+bt[76];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[118]=paper.setFinish(); 
lineNodes[118]=[107,76]; 

paper.setStart(); 
mid=bb[107]+(bt[76]-bb[107])/2; 
hleft = nx[61]; 
hright = nx[107]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[61]+' '+mid+' L '+nx[61]+' '+bt[61];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[119]=paper.setFinish(); 
lineNodes[119]=[107,61]; 

paper.setStart(); 
s1='M '+nx[108]+' '+bb[108]+' L '+nx[108]+' '+bt[16]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[120]=paper.setFinish(); 
lineNodes[120]=[108,16] ; 

nlines = 121;
}