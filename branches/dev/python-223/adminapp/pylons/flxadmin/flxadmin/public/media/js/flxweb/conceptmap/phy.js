function initMap() { 

// Set size parameters 
mapWidth = 3045; 
mapHeight = 2382; 
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
rootx = 1180; 
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

nnodes = 107; 
njunc = 9; 

nx[0]=1155;
ny[0]=1947;
nx[1]=2109;
ny[1]=1973;
nx[2]=1701;
ny[2]=1991;
nx[3]=1232;
ny[3]=1843;
nx[4]=2382;
ny[4]=1750;
nx[5]=1244;
ny[5]=896;
nx[6]=1565;
ny[6]=1755;
nx[7]=1244;
ny[7]=792;
nx[8]=1180;
ny[8]=100;
nx[9]=623;
ny[9]=2037;
nx[10]=914;
ny[10]=2025;
nx[11]=2111;
ny[11]=2235;
nx[12]=1445;
ny[12]=2098;
nx[13]=625;
ny[13]=2241;
nx[14]=623;
ny[14]=2137;
nx[15]=1369;
ny[15]=571;
nx[16]=1567;
ny[16]=1845;
nx[17]=779;
ny[17]=443;
nx[18]=779;
ny[18]=533;
nx[19]=549;
ny[19]=1491;
nx[20]=2111;
ny[20]=2144;
nx[21]=554;
ny[21]=903;
nx[22]=801;
ny[22]=2025;
nx[23]=1675;
ny[23]=571;
nx[24]=1244;
ny[24]=1019;
nx[25]=1180;
ny[25]=296;
nx[26]=200;
ny[26]=1489;
nx[27]=1981;
ny[27]=1633;
nx[28]=1244;
ny[28]=1185;
nx[29]=1568;
ny[29]=1948;
nx[30]=307;
ny[30]=903;
nx[31]=1920;
ny[31]=1993;
nx[32]=623;
ny[32]=1935;
nx[33]=871;
ny[33]=1103;
nx[34]=1675;
ny[34]=1308;
nx[35]=1919;
ny[35]=1846;
nx[36]=1762;
ny[36]=1429;
nx[37]=437;
ny[37]=1036;
nx[38]=1180;
ny[38]=198;
nx[39]=662;
ny[39]=1490;
nx[40]=662;
ny[40]=1365;
nx[41]=1308;
ny[41]=2052;
nx[42]=2845;
ny[42]=2014;
nx[43]=1810;
ny[43]=1748;
nx[44]=2498;
ny[44]=2006;
nx[45]=436;
ny[45]=1578;
nx[46]=1232;
ny[46]=2186;
nx[47]=871;
ny[47]=1197;
nx[48]=1244;
ny[48]=1278;
nx[49]=1527;
ny[49]=443;
nx[50]=766;
ny[50]=1725;
nx[51]=2616;
ny[51]=2007;
nx[52]=779;
ny[52]=792;
nx[53]=1308;
ny[53]=1949;
nx[54]=327;
ny[54]=1489;
nx[55]=1558;
ny[55]=1431;
nx[56]=1232;
ny[56]=2282;
nx[57]=695;
ny[57]=1194;
nx[58]=1232;
ny[58]=1754;
nx[59]=2524;
ny[59]=1750;
nx[60]=438;
ny[60]=1490;
nx[61]=1028;
ny[61]=2026;
nx[62]=1413;
ny[62]=1640;
nx[63]=1445;
ny[63]=2210;
nx[64]=1585;
ny[64]=730;
nx[65]=1155;
ny[65]=2052;
nx[66]=1810;
ny[66]=1992;
nx[67]=2111;
ny[67]=2058;
nx[68]=1092;
ny[68]=1284;
nx[69]=766;
ny[69]=1816;
nx[70]=777;
ny[70]=1491;
nx[71]=2498;
ny[71]=1853;
nx[72]=1371;
ny[72]=1185;
nx[73]=1092;
ny[73]=1185;
nx[74]=2175;
ny[74]=1847;
nx[75]=2524;
ny[75]=1634;
nx[76]=2731;
ny[76]=2006;
nx[77]=1418;
ny[77]=1021;
nx[78]=2035;
ny[78]=1847;
nx[79]=435;
ny[79]=785;
nx[80]=1700;
ny[80]=1846;
nx[81]=304;
ny[81]=1027;
nx[82]=893;
ny[82]=1490;
nx[83]=2175;
ny[83]=1752;
nx[84]=779;
ny[84]=894;
nx[85]=437;
ny[85]=1238;
nx[86]=2290;
ny[86]=1846;
nx[87]=1451;
ny[87]=736;
nx[88]=914;
ny[88]=1926;
nx[89]=779;
ny[89]=635;
nx[90]=2654;
ny[90]=1750;
nx[91]=764;
ny[91]=1634;
nx[92]=437;
ny[92]=1138;
nx[93]=281;
ny[93]=1364;
nx[94]=1074;
ny[94]=1018;
nx[95]=2844;
ny[95]=1853;
nx[96]=779;
ny[96]=992;
nx[97]=695;
ny[97]=1103;
nx[98]=1445;
ny[98]=2000;
nx[99]=2107;
ny[99]=1902;
nx[100]=1673;
ny[100]=1495;
nx[101]=1244;
ny[101]=1083;
nx[102]=1811;
ny[102]=1903;
nx[103]=437;
ny[103]=961;
nx[104]=2673;
ny[104]=1909;
nx[105]=1530;
ny[105]=631;
nx[106]=1232;
ny[106]=2111;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[65, 3, 53]; 
members[1]=[99, 67]; 
members[2]=[80, 102]; 
members[3]=[0, 58, 53]; 
members[4]=[59, 90, 75]; 
members[5]=[24, 77, 94, 7]; 
members[6]=[16, 58, 62]; 
members[7]=[89, 79, 52, 5]; 
members[8]=[38]; 
members[9]=[32, 14]; 
members[10]=[88, 61, 22]; 
members[11]=[20]; 
members[12]=[98, 63]; 
members[13]=[14]; 
members[14]=[9, 13]; 
members[15]=[23, 105, 49]; 
members[16]=[29, 6]; 
members[17]=[25, 18, 49]; 
members[18]=[89, 17]; 
members[19]=[70, 39, 40, 82, 60]; 
members[20]=[67, 11]; 
members[21]=[79, 30, 103]; 
members[22]=[88, 10, 61]; 
members[23]=[105, 34, 15, 49]; 
members[24]=[77, 101, 94, 5]; 
members[25]=[49, 38, 17]; 
members[26]=[60, 93, 54]; 
members[27]=[43, 100, 75, 83, 91, 62]; 
members[28]=[34, 101, 72, 73, 48]; 
members[29]=[16, 98]; 
members[30]=[81, 79, 21, 103]; 
members[31]=[35, 102]; 
members[32]=[88, 9, 69]; 
members[33]=[96, 97, 47]; 
members[34]=[36, 101, 72, 105, 55, 73, 23, 28]; 
members[35]=[80, 43, 102, 31]; 
members[36]=[34, 100, 55]; 
members[37]=[92, 103]; 
members[38]=[8, 25]; 
members[39]=[70, 40, 82, 19, 60]; 
members[40]=[70, 39, 82, 19, 85, 60, 93]; 
members[41]=[106, 98, 53]; 
members[42]=[104, 95]; 
members[43]=[80, 27, 83, 35]; 
members[44]=[104, 71]; 
members[45]=[60]; 
members[46]=[56, 106]; 
members[47]=[33]; 
members[48]=[28]; 
members[49]=[25, 23, 17, 15]; 
members[50]=[91, 69]; 
members[51]=[104, 76]; 
members[52]=[89, 79, 84, 7]; 
members[53]=[0, 41, 98, 3]; 
members[54]=[26, 60, 93]; 
members[55]=[36, 34, 100]; 
members[56]=[46]; 
members[57]=[97]; 
members[58]=[3, 6, 62]; 
members[59]=[90, 75, 4]; 
members[60]=[70, 39, 40, 45, 82, 19, 54, 26, 93]; 
members[61]=[88, 10, 22]; 
members[62]=[27, 100, 6, 75, 58, 91]; 
members[63]=[12]; 
members[64]=[105, 87]; 
members[65]=[0, 106]; 
members[66]=[102]; 
members[67]=[1, 20]; 
members[68]=[73]; 
members[69]=[88, 32, 50]; 
members[70]=[39, 40, 82, 19, 60]; 
members[71]=[104, 90, 95, 44]; 
members[72]=[73, 34, 28, 101]; 
members[73]=[34, 68, 101, 72, 28]; 
members[74]=[83, 99, 86, 78]; 
members[75]=[59, 100, 27, 4, 90, 91, 62]; 
members[76]=[104, 51]; 
members[77]=[24, 101, 94, 5]; 
members[78]=[83, 99, 86, 74]; 
members[79]=[7, 52, 21, 89, 30]; 
members[80]=[35, 2, 43, 102]; 
members[81]=[30, 103]; 
members[82]=[70, 39, 40, 19, 60]; 
members[83]=[74, 43, 78, 86, 27]; 
members[84]=[96, 52]; 
members[85]=[40, 92, 93]; 
members[86]=[74, 83, 78]; 
members[87]=[64, 105]; 
members[88]=[32, 69, 10, 22, 61]; 
members[89]=[18, 79, 52, 7]; 
members[90]=[4, 71, 75, 59, 95]; 
members[91]=[100, 75, 50, 27, 62]; 
members[92]=[85, 37]; 
members[93]=[40, 85, 54, 26, 60]; 
members[94]=[24, 77, 101, 5]; 
members[95]=[104, 42, 90, 71]; 
members[96]=[97, 84, 33]; 
members[97]=[96, 57, 33]; 
members[98]=[41, 12, 29, 53]; 
members[99]=[1, 74, 78]; 
members[100]=[91, 75, 55, 36, 27, 62]; 
members[101]=[34, 72, 73, 77, 24, 28, 94]; 
members[102]=[66, 35, 2, 80, 31]; 
members[103]=[81, 37, 30, 21]; 
members[104]=[71, 76, 42, 44, 51, 95]; 
members[105]=[64, 34, 87, 15, 23]; 
members[106]=[41, 46, 65]; 

return members[i]; 
} 

function drawMap(sfac) { 

var t; 
var rect; 
var tbox; 

paper.clear(); 

paper.setStart(); 
t=paper.text(nx[0],ny[0],'Electric Current').attr({fill:"#666666","font-size": 14*sfac[0]});
tBox=t.getBBox(); 
bt[0]=ny[0]-(tBox.height/2+10*sfac[0]);
bb[0]=ny[0]+(tBox.height/2+10*sfac[0]);
bl[0]=nx[0]-(tBox.width/2+10*sfac[0]);
br[0]=nx[0]+(tBox.width/2+10*sfac[0]);
rect=paper.rect(bl[0], bt[0], br[0]-bl[0], bb[0]-bt[0], 10*sfac[0]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[0]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[1],ny[1],'Flow Rate').attr({fill:"#666666","font-size": 14*sfac[1]});
tBox=t.getBBox(); 
bt[1]=ny[1]-(tBox.height/2+10*sfac[1]);
bb[1]=ny[1]+(tBox.height/2+10*sfac[1]);
bl[1]=nx[1]-(tBox.width/2+10*sfac[1]);
br[1]=nx[1]+(tBox.width/2+10*sfac[1]);
rect=paper.rect(bl[1], bt[1], br[1]-bl[1], bb[1]-bt[1], 10*sfac[1]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[1]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[2],ny[2],'Yield').attr({fill:"#666666","font-size": 14*sfac[2]});
tBox=t.getBBox(); 
bt[2]=ny[2]-(tBox.height/2+10*sfac[2]);
bb[2]=ny[2]+(tBox.height/2+10*sfac[2]);
bl[2]=nx[2]-(tBox.width/2+10*sfac[2]);
br[2]=nx[2]+(tBox.width/2+10*sfac[2]);
rect=paper.rect(bl[2], bt[2], br[2]-bl[2], bb[2]-bt[2], 10*sfac[2]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[2]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[3],ny[3],'Electric Flux').attr({fill:"#666666","font-size": 14*sfac[3]});
tBox=t.getBBox(); 
bt[3]=ny[3]-(tBox.height/2+10*sfac[3]);
bb[3]=ny[3]+(tBox.height/2+10*sfac[3]);
bl[3]=nx[3]-(tBox.width/2+10*sfac[3]);
br[3]=nx[3]+(tBox.width/2+10*sfac[3]);
rect=paper.rect(bl[3], bt[3], br[3]-bl[3], bb[3]-bt[3], 10*sfac[3]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[3]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[4],ny[4],'Quantum Mechanics').attr({fill:"#666666","font-size": 14*sfac[4]});
tBox=t.getBBox(); 
bt[4]=ny[4]-(tBox.height/2+10*sfac[4]);
bb[4]=ny[4]+(tBox.height/2+10*sfac[4]);
bl[4]=nx[4]-(tBox.width/2+10*sfac[4]);
br[4]=nx[4]+(tBox.width/2+10*sfac[4]);
rect=paper.rect(bl[4], bt[4], br[4]-bl[4], bb[4]-bt[4], 10*sfac[4]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[4]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[5],ny[5]-10,"Newton's Laws").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[5]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Momentum/#Newton's Laws", target: "_top"});
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
t=paper.text(nx[6],ny[6],'Magnetic Fields').attr({fill:"#666666","font-size": 14*sfac[6]});
tBox=t.getBBox(); 
bt[6]=ny[6]-(tBox.height/2+10*sfac[6]);
bb[6]=ny[6]+(tBox.height/2+10*sfac[6]);
bl[6]=nx[6]-(tBox.width/2+10*sfac[6]);
br[6]=nx[6]+(tBox.width/2+10*sfac[6]);
rect=paper.rect(bl[6], bt[6], br[6]-bl[6], bb[6]-bt[6], 10*sfac[6]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[6]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[7],ny[7],'Linear Motion').attr({fill:"#666666","font-size": 14*sfac[7]});
tBox=t.getBBox(); 
bt[7]=ny[7]-(tBox.height/2+10*sfac[7]);
bb[7]=ny[7]+(tBox.height/2+10*sfac[7]);
bl[7]=nx[7]-(tBox.width/2+10*sfac[7]);
br[7]=nx[7]+(tBox.width/2+10*sfac[7]);
rect=paper.rect(bl[7], bt[7], br[7]-bl[7], bb[7]-bt[7], 10*sfac[7]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[7]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[8],ny[8],'Physics').attr({fill:"#000000","font-size": 24*sfac[8]});
tBox=t.getBBox(); 
bt[8]=ny[8]-(tBox.height/2+10*sfac[8]);
bb[8]=ny[8]+(tBox.height/2+10*sfac[8]);
bl[8]=nx[8]-(tBox.width/2+10*sfac[8]);
br[8]=nx[8]+(tBox.width/2+10*sfac[8]);
rect=paper.rect(bl[8], bt[8], br[8]-bl[8], bb[8]-bt[8], 10*sfac[8]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[8]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[9],ny[9],'First Law of\nThermodynamics').attr({fill:"#666666","font-size": 14*sfac[9]});
tBox=t.getBBox(); 
bt[9]=ny[9]-(tBox.height/2+10*sfac[9]);
bb[9]=ny[9]+(tBox.height/2+10*sfac[9]);
bl[9]=nx[9]-(tBox.width/2+10*sfac[9]);
br[9]=nx[9]+(tBox.width/2+10*sfac[9]);
rect=paper.rect(bl[9], bt[9], br[9]-bl[9], bb[9]-bt[9], 10*sfac[9]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[9]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[10],ny[10],'Convection').attr({fill:"#666666","font-size": 14*sfac[10]});
tBox=t.getBBox(); 
bt[10]=ny[10]-(tBox.height/2+10*sfac[10]);
bb[10]=ny[10]+(tBox.height/2+10*sfac[10]);
bl[10]=nx[10]-(tBox.width/2+10*sfac[10]);
br[10]=nx[10]+(tBox.width/2+10*sfac[10]);
rect=paper.rect(bl[10], bt[10], br[10]-bl[10], bb[10]-bt[10], 10*sfac[10]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[10]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[11],ny[11],'Conservation of Energy').attr({fill:"#666666","font-size": 14*sfac[11]});
tBox=t.getBBox(); 
bt[11]=ny[11]-(tBox.height/2+10*sfac[11]);
bb[11]=ny[11]+(tBox.height/2+10*sfac[11]);
bl[11]=nx[11]-(tBox.width/2+10*sfac[11]);
br[11]=nx[11]+(tBox.width/2+10*sfac[11]);
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[11]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[12],ny[12],"Faraday's Law\nof Induction").attr({fill:"#666666","font-size": 14*sfac[12]});
tBox=t.getBBox(); 
bt[12]=ny[12]-(tBox.height/2+10*sfac[12]);
bb[12]=ny[12]+(tBox.height/2+10*sfac[12]);
bl[12]=nx[12]-(tBox.width/2+10*sfac[12]);
br[12]=nx[12]+(tBox.width/2+10*sfac[12]);
rect=paper.rect(bl[12], bt[12], br[12]-bl[12], bb[12]-bt[12], 10*sfac[12]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[12]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[13],ny[13],'Third Law of\nThermodynamics').attr({fill:"#666666","font-size": 14*sfac[13]});
tBox=t.getBBox(); 
bt[13]=ny[13]-(tBox.height/2+10*sfac[13]);
bb[13]=ny[13]+(tBox.height/2+10*sfac[13]);
bl[13]=nx[13]-(tBox.width/2+10*sfac[13]);
br[13]=nx[13]+(tBox.width/2+10*sfac[13]);
rect=paper.rect(bl[13], bt[13], br[13]-bl[13], bb[13]-bt[13], 10*sfac[13]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[13]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[14],ny[14],'Second Law of\nThermodynamics').attr({fill:"#666666","font-size": 14*sfac[14]});
tBox=t.getBBox(); 
bt[14]=ny[14]-(tBox.height/2+10*sfac[14]);
bb[14]=ny[14]+(tBox.height/2+10*sfac[14]);
bl[14]=nx[14]-(tBox.width/2+10*sfac[14]);
br[14]=nx[14]+(tBox.width/2+10*sfac[14]);
rect=paper.rect(bl[14], bt[14], br[14]-bl[14], bb[14]-bt[14], 10*sfac[14]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[14]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[15],ny[15],'Potential Energy').attr({fill:"#666666","font-size": 14*sfac[15]});
tBox=t.getBBox(); 
bt[15]=ny[15]-(tBox.height/2+10*sfac[15]);
bb[15]=ny[15]+(tBox.height/2+10*sfac[15]);
bl[15]=nx[15]-(tBox.width/2+10*sfac[15]);
br[15]=nx[15]+(tBox.width/2+10*sfac[15]);
rect=paper.rect(bl[15], bt[15], br[15]-bl[15], bb[15]-bt[15], 10*sfac[15]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[15]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[16],ny[16],'Magnetic Flux').attr({fill:"#666666","font-size": 14*sfac[16]});
tBox=t.getBBox(); 
bt[16]=ny[16]-(tBox.height/2+10*sfac[16]);
bb[16]=ny[16]+(tBox.height/2+10*sfac[16]);
bl[16]=nx[16]-(tBox.width/2+10*sfac[16]);
br[16]=nx[16]+(tBox.width/2+10*sfac[16]);
rect=paper.rect(bl[16], bt[16], br[16]-bl[16], bb[16]-bt[16], 10*sfac[16]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[16]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[17],ny[17]-10,'1-D Motion').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[17]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Using-the-kinematic-Equations/#1-D Motion", target: "_top"});
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
t=paper.text(nx[18],ny[18]-10,'Vectors and 2-D\nMotion').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[18]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphing-Motion/#Vectors and 2-D Motion", target: "_top"});
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
t=paper.text(nx[19],ny[19]-10,'Reflection').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[19]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Generators-and-Motors/#Reflection", target: "_top"});
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
t=paper.text(nx[20],ny[20],'Conservation of Momentum').attr({fill:"#666666","font-size": 14*sfac[20]});
tBox=t.getBBox(); 
bt[20]=ny[20]-(tBox.height/2+10*sfac[20]);
bb[20]=ny[20]+(tBox.height/2+10*sfac[20]);
bl[20]=nx[20]-(tBox.width/2+10*sfac[20]);
br[20]=nx[20]+(tBox.width/2+10*sfac[20]);
rect=paper.rect(bl[20], bt[20], br[20]-bl[20], bb[20]-bt[20], 10*sfac[20]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[20]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[21],ny[21],'Pendulums').attr({fill:"#666666","font-size": 14*sfac[21]});
tBox=t.getBBox(); 
bt[21]=ny[21]-(tBox.height/2+10*sfac[21]);
bb[21]=ny[21]+(tBox.height/2+10*sfac[21]);
bl[21]=nx[21]-(tBox.width/2+10*sfac[21]);
br[21]=nx[21]+(tBox.width/2+10*sfac[21]);
rect=paper.rect(bl[21], bt[21], br[21]-bl[21], bb[21]-bt[21], 10*sfac[21]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[21]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[22],ny[22],'Conduction').attr({fill:"#666666","font-size": 14*sfac[22]});
tBox=t.getBBox(); 
bt[22]=ny[22]-(tBox.height/2+10*sfac[22]);
bb[22]=ny[22]+(tBox.height/2+10*sfac[22]);
bl[22]=nx[22]-(tBox.width/2+10*sfac[22]);
br[22]=nx[22]+(tBox.width/2+10*sfac[22]);
rect=paper.rect(bl[22], bt[22], br[22]-bl[22], bb[22]-bt[22], 10*sfac[22]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[22]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[23],ny[23],'Kinetic Energy').attr({fill:"#666666","font-size": 14*sfac[23]});
tBox=t.getBBox(); 
bt[23]=ny[23]-(tBox.height/2+10*sfac[23]);
bb[23]=ny[23]+(tBox.height/2+10*sfac[23]);
bl[23]=nx[23]-(tBox.width/2+10*sfac[23]);
br[23]=nx[23]+(tBox.width/2+10*sfac[23]);
rect=paper.rect(bl[23], bt[23], br[23]-bl[23], bb[23]-bt[23], 10*sfac[23]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[23]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[24],ny[24],"Newton's 2nd Law:\nForce and Acceleration").attr({fill:"#666666","font-size": 14*sfac[24]});
tBox=t.getBBox(); 
bt[24]=ny[24]-(tBox.height/2+10*sfac[24]);
bb[24]=ny[24]+(tBox.height/2+10*sfac[24]);
bl[24]=nx[24]-(tBox.width/2+10*sfac[24]);
br[24]=nx[24]+(tBox.width/2+10*sfac[24]);
rect=paper.rect(bl[24], bt[24], br[24]-bl[24], bb[24]-bt[24], 10*sfac[24]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[24]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[25],ny[25]-10,'Units of Measurement').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[25]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Vectors/#Units of Measurement", target: "_top"});
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
t=paper.text(nx[26],ny[26],'Sound in Mediums').attr({fill:"#666666","font-size": 14*sfac[26]});
tBox=t.getBBox(); 
bt[26]=ny[26]-(tBox.height/2+10*sfac[26]);
bb[26]=ny[26]+(tBox.height/2+10*sfac[26]);
bl[26]=nx[26]-(tBox.width/2+10*sfac[26]);
br[26]=nx[26]+(tBox.width/2+10*sfac[26]);
rect=paper.rect(bl[26], bt[26], br[26]-bl[26], bb[26]-bt[26], 10*sfac[26]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[26]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[27],ny[27],'Continuum Mechanics').attr({fill:"#666666","font-size": 14*sfac[27]});
tBox=t.getBBox(); 
bt[27]=ny[27]-(tBox.height/2+10*sfac[27]);
bb[27]=ny[27]+(tBox.height/2+10*sfac[27]);
bl[27]=nx[27]-(tBox.width/2+10*sfac[27]);
br[27]=nx[27]+(tBox.width/2+10*sfac[27]);
rect=paper.rect(bl[27], bt[27], br[27]-bl[27], bb[27]-bt[27], 10*sfac[27]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[27]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[28],ny[28]-10,'Elastic Collisions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[28]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Energy-Problem-Solving/#Elastic Collisions", target: "_top"});
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
t=paper.text(nx[29],ny[29],'Magnetic Forces').attr({fill:"#666666","font-size": 14*sfac[29]});
tBox=t.getBBox(); 
bt[29]=ny[29]-(tBox.height/2+10*sfac[29]);
bb[29]=ny[29]+(tBox.height/2+10*sfac[29]);
bl[29]=nx[29]-(tBox.width/2+10*sfac[29]);
br[29]=nx[29]+(tBox.width/2+10*sfac[29]);
rect=paper.rect(bl[29], bt[29], br[29]-bl[29], bb[29]-bt[29], 10*sfac[29]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[29]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[30],ny[30]-10,'Spring-Mass\nSystems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[30]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/E/#Spring-Mass Systems", target: "_top"});
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
t=paper.text(nx[31],ny[31],"Hooke's Law").attr({fill:"#666666","font-size": 14*sfac[31]});
tBox=t.getBBox(); 
bt[31]=ny[31]-(tBox.height/2+10*sfac[31]);
bb[31]=ny[31]+(tBox.height/2+10*sfac[31]);
bl[31]=nx[31]-(tBox.width/2+10*sfac[31]);
br[31]=nx[31]+(tBox.width/2+10*sfac[31]);
rect=paper.rect(bl[31], bt[31], br[31]-bl[31], bb[31]-bt[31], 10*sfac[31]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[31]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[32],ny[32],'Zeroth Law of\nThermodynamics').attr({fill:"#666666","font-size": 14*sfac[32]});
tBox=t.getBBox(); 
bt[32]=ny[32]-(tBox.height/2+10*sfac[32]);
bb[32]=ny[32]+(tBox.height/2+10*sfac[32]);
bl[32]=nx[32]-(tBox.width/2+10*sfac[32]);
br[32]=nx[32]+(tBox.width/2+10*sfac[32]);
rect=paper.rect(bl[32], bt[32], br[32]-bl[32], bb[32]-bt[32], 10*sfac[32]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[32]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[33],ny[33]-10,'Angular Momentum').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[33]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Speed-of-Light/#Angular Momentum", target: "_top"});
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
t=paper.text(nx[34],ny[34],'Work and Power').attr({fill:"#666666","font-size": 14*sfac[34]});
tBox=t.getBBox(); 
bt[34]=ny[34]-(tBox.height/2+10*sfac[34]);
bb[34]=ny[34]+(tBox.height/2+10*sfac[34]);
bl[34]=nx[34]-(tBox.width/2+10*sfac[34]);
br[34]=nx[34]+(tBox.width/2+10*sfac[34]);
rect=paper.rect(bl[34], bt[34], br[34]-bl[34], bb[34]-bt[34], 10*sfac[34]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[34]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[35],ny[35],'Elasticity').attr({fill:"#666666","font-size": 14*sfac[35]});
tBox=t.getBBox(); 
bt[35]=ny[35]-(tBox.height/2+10*sfac[35]);
bb[35]=ny[35]+(tBox.height/2+10*sfac[35]);
bl[35]=nx[35]-(tBox.width/2+10*sfac[35]);
br[35]=nx[35]+(tBox.width/2+10*sfac[35]);
rect=paper.rect(bl[35], bt[35], br[35]-bl[35], bb[35]-bt[35], 10*sfac[35]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[35]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[36],ny[36],'Machines').attr({fill:"#666666","font-size": 14*sfac[36]});
tBox=t.getBBox(); 
bt[36]=ny[36]-(tBox.height/2+10*sfac[36]);
bb[36]=ny[36]+(tBox.height/2+10*sfac[36]);
bl[36]=nx[36]-(tBox.width/2+10*sfac[36]);
br[36]=nx[36]+(tBox.width/2+10*sfac[36]);
rect=paper.rect(bl[36], bt[36], br[36]-bl[36], bb[36]-bt[36], 10*sfac[36]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[36]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[37],ny[37],'Waves and\nVibrations').attr({fill:"#666666","font-size": 14*sfac[37]});
tBox=t.getBBox(); 
bt[37]=ny[37]-(tBox.height/2+10*sfac[37]);
bb[37]=ny[37]+(tBox.height/2+10*sfac[37]);
bl[37]=nx[37]-(tBox.width/2+10*sfac[37]);
br[37]=nx[37]+(tBox.width/2+10*sfac[37]);
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[37]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[38],ny[38]-10,'Classical Mechanics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[38]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Metric-Units/#Classical Mechanics", target: "_top"});
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
t=paper.text(nx[39],ny[39],'Refraction').attr({fill:"#666666","font-size": 14*sfac[39]});
tBox=t.getBBox(); 
bt[39]=ny[39]-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[40],ny[40]-10,'Light').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[40]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inductance/#Light", target: "_top"});
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
t=paper.text(nx[41],ny[41],'Capacitance').attr({fill:"#666666","font-size": 14*sfac[41]});
tBox=t.getBBox(); 
bt[41]=ny[41]-(tBox.height/2+10*sfac[41]);
bb[41]=ny[41]+(tBox.height/2+10*sfac[41]);
bl[41]=nx[41]-(tBox.width/2+10*sfac[41]);
br[41]=nx[41]+(tBox.width/2+10*sfac[41]);
rect=paper.rect(bl[41], bt[41], br[41]-bl[41], bb[41]-bt[41], 10*sfac[41]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[41]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[42],ny[42],'Subatomic\nParticles').attr({fill:"#666666","font-size": 14*sfac[42]});
tBox=t.getBBox(); 
bt[42]=ny[42]-(tBox.height/2+10*sfac[42]);
bb[42]=ny[42]+(tBox.height/2+10*sfac[42]);
bl[42]=nx[42]-(tBox.width/2+10*sfac[42]);
br[42]=nx[42]+(tBox.width/2+10*sfac[42]);
rect=paper.rect(bl[42], bt[42], br[42]-bl[42], bb[42]-bt[42], 10*sfac[42]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[42]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[43],ny[43],'Solid Mechanics').attr({fill:"#666666","font-size": 14*sfac[43]});
tBox=t.getBBox(); 
bt[43]=ny[43]-(tBox.height/2+10*sfac[43]);
bb[43]=ny[43]+(tBox.height/2+10*sfac[43]);
bl[43]=nx[43]-(tBox.width/2+10*sfac[43]);
br[43]=nx[43]+(tBox.width/2+10*sfac[43]);
rect=paper.rect(bl[43], bt[43], br[43]-bl[43], bb[43]-bt[43], 10*sfac[43]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[43]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[44],ny[44],'Ion Radiation').attr({fill:"#666666","font-size": 14*sfac[44]});
tBox=t.getBBox(); 
bt[44]=ny[44]-(tBox.height/2+10*sfac[44]);
bb[44]=ny[44]+(tBox.height/2+10*sfac[44]);
bl[44]=nx[44]-(tBox.width/2+10*sfac[44]);
br[44]=nx[44]+(tBox.width/2+10*sfac[44]);
rect=paper.rect(bl[44], bt[44], br[44]-bl[44], bb[44]-bt[44], 10*sfac[44]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[44]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[45],ny[45],'Doppler Effect').attr({fill:"#666666","font-size": 14*sfac[45]});
tBox=t.getBBox(); 
bt[45]=ny[45]-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[45]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[46],ny[46],"Kirchhoff's Laws").attr({fill:"#666666","font-size": 14*sfac[46]});
tBox=t.getBBox(); 
bt[46]=ny[46]-(tBox.height/2+10*sfac[46]);
bb[46]=ny[46]+(tBox.height/2+10*sfac[46]);
bl[46]=nx[46]-(tBox.width/2+10*sfac[46]);
br[46]=nx[46]+(tBox.width/2+10*sfac[46]);
rect=paper.rect(bl[46], bt[46], br[46]-bl[46], bb[46]-bt[46], 10*sfac[46]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[46]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[47],ny[47],'Conservation of\nAngular Momentum').attr({fill:"#666666","font-size": 14*sfac[47]});
tBox=t.getBBox(); 
bt[47]=ny[47]-(tBox.height/2+10*sfac[47]);
bb[47]=ny[47]+(tBox.height/2+10*sfac[47]);
bl[47]=nx[47]-(tBox.width/2+10*sfac[47]);
br[47]=nx[47]+(tBox.width/2+10*sfac[47]);
rect=paper.rect(bl[47], bt[47], br[47]-bl[47], bb[47]-bt[47], 10*sfac[47]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[47]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[48],ny[48]-10,'Inelastic Collisions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[48]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Heat-Engine/#Inelastic Collisions", target: "_top"});
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
t=paper.text(nx[49],ny[49]-10,'Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[49]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Time-Dilation/#Energy", target: "_top"});
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
t=paper.text(nx[50],ny[50],'Temperature').attr({fill:"#666666","font-size": 14*sfac[50]});
tBox=t.getBBox(); 
bt[50]=ny[50]-(tBox.height/2+10*sfac[50]);
bb[50]=ny[50]+(tBox.height/2+10*sfac[50]);
bl[50]=nx[50]-(tBox.width/2+10*sfac[50]);
br[50]=nx[50]+(tBox.width/2+10*sfac[50]);
rect=paper.rect(bl[50], bt[50], br[50]-bl[50], bb[50]-bt[50], 10*sfac[50]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[50]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[51],ny[51],'Fusion').attr({fill:"#666666","font-size": 14*sfac[51]});
tBox=t.getBBox(); 
bt[51]=ny[51]-(tBox.height/2+10*sfac[51]);
bb[51]=ny[51]+(tBox.height/2+10*sfac[51]);
bl[51]=nx[51]-(tBox.width/2+10*sfac[51]);
br[51]=nx[51]+(tBox.width/2+10*sfac[51]);
rect=paper.rect(bl[51], bt[51], br[51]-bl[51], bb[51]-bt[51], 10*sfac[51]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[51]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[52],ny[52],'Circular Motion').attr({fill:"#666666","font-size": 14*sfac[52]});
tBox=t.getBBox(); 
bt[52]=ny[52]-(tBox.height/2+10*sfac[52]);
bb[52]=ny[52]+(tBox.height/2+10*sfac[52]);
bl[52]=nx[52]-(tBox.width/2+10*sfac[52]);
br[52]=nx[52]+(tBox.width/2+10*sfac[52]);
rect=paper.rect(bl[52], bt[52], br[52]-bl[52], bb[52]-bt[52], 10*sfac[52]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[52]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[53],ny[53],'Electric Potential').attr({fill:"#666666","font-size": 14*sfac[53]});
tBox=t.getBBox(); 
bt[53]=ny[53]-(tBox.height/2+10*sfac[53]);
bb[53]=ny[53]+(tBox.height/2+10*sfac[53]);
bl[53]=nx[53]-(tBox.width/2+10*sfac[53]);
br[53]=nx[53]+(tBox.width/2+10*sfac[53]);
rect=paper.rect(bl[53], bt[53], br[53]-bl[53], bb[53]-bt[53], 10*sfac[53]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[53]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[54],ny[54],'Resonance').attr({fill:"#666666","font-size": 14*sfac[54]});
tBox=t.getBBox(); 
bt[54]=ny[54]-(tBox.height/2+10*sfac[54]);
bb[54]=ny[54]+(tBox.height/2+10*sfac[54]);
bl[54]=nx[54]-(tBox.width/2+10*sfac[54]);
br[54]=nx[54]+(tBox.width/2+10*sfac[54]);
rect=paper.rect(bl[54], bt[54], br[54]-bl[54], bb[54]-bt[54], 10*sfac[54]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[54]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[55],ny[55],'Work-Energy Theorem').attr({fill:"#666666","font-size": 14*sfac[55]});
tBox=t.getBBox(); 
bt[55]=ny[55]-(tBox.height/2+10*sfac[55]);
bb[55]=ny[55]+(tBox.height/2+10*sfac[55]);
bl[55]=nx[55]-(tBox.width/2+10*sfac[55]);
br[55]=nx[55]+(tBox.width/2+10*sfac[55]);
rect=paper.rect(bl[55], bt[55], br[55]-bl[55], bb[55]-bt[55], 10*sfac[55]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[55]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[56],ny[56],'DC Circuits').attr({fill:"#666666","font-size": 14*sfac[56]});
tBox=t.getBBox(); 
bt[56]=ny[56]-(tBox.height/2+10*sfac[56]);
bb[56]=ny[56]+(tBox.height/2+10*sfac[56]);
bl[56]=nx[56]-(tBox.width/2+10*sfac[56]);
br[56]=nx[56]+(tBox.width/2+10*sfac[56]);
rect=paper.rect(bl[56], bt[56], br[56]-bl[56], bb[56]-bt[56], 10*sfac[56]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[56]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[57],ny[57]-10,'Planetary\nMotion').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[57]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Sound-in-a-Tube/#Planetary Motion", target: "_top"});
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
t=paper.text(nx[58],ny[58],'Electric Fields').attr({fill:"#666666","font-size": 14*sfac[58]});
tBox=t.getBBox(); 
bt[58]=ny[58]-(tBox.height/2+10*sfac[58]);
bb[58]=ny[58]+(tBox.height/2+10*sfac[58]);
bl[58]=nx[58]-(tBox.width/2+10*sfac[58]);
br[58]=nx[58]+(tBox.width/2+10*sfac[58]);
rect=paper.rect(bl[58], bt[58], br[58]-bl[58], bb[58]-bt[58], 10*sfac[58]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[58]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[59],ny[59],'Relativity').attr({fill:"#666666","font-size": 14*sfac[59]});
tBox=t.getBBox(); 
bt[59]=ny[59]-(tBox.height/2+10*sfac[59]);
bb[59]=ny[59]+(tBox.height/2+10*sfac[59]);
bl[59]=nx[59]-(tBox.width/2+10*sfac[59]);
br[59]=nx[59]+(tBox.width/2+10*sfac[59]);
rect=paper.rect(bl[59], bt[59], br[59]-bl[59], bb[59]-bt[59], 10*sfac[59]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[59]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[60],ny[60],'Interference').attr({fill:"#666666","font-size": 14*sfac[60]});
tBox=t.getBBox(); 
bt[60]=ny[60]-(tBox.height/2+10*sfac[60]);
bb[60]=ny[60]+(tBox.height/2+10*sfac[60]);
bl[60]=nx[60]-(tBox.width/2+10*sfac[60]);
br[60]=nx[60]+(tBox.width/2+10*sfac[60]);
rect=paper.rect(bl[60], bt[60], br[60]-bl[60], bb[60]-bt[60], 10*sfac[60]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[60]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[61],ny[61],'Radiation').attr({fill:"#666666","font-size": 14*sfac[61]});
tBox=t.getBBox(); 
bt[61]=ny[61]-(tBox.height/2+10*sfac[61]);
bb[61]=ny[61]+(tBox.height/2+10*sfac[61]);
bl[61]=nx[61]-(tBox.width/2+10*sfac[61]);
br[61]=nx[61]+(tBox.width/2+10*sfac[61]);
rect=paper.rect(bl[61], bt[61], br[61]-bl[61], bb[61]-bt[61], 10*sfac[61]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[61]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[62],ny[62],'Electricity and\nMagnetism').attr({fill:"#666666","font-size": 14*sfac[62]});
tBox=t.getBBox(); 
bt[62]=ny[62]-(tBox.height/2+10*sfac[62]);
bb[62]=ny[62]+(tBox.height/2+10*sfac[62]);
bl[62]=nx[62]-(tBox.width/2+10*sfac[62]);
br[62]=nx[62]+(tBox.width/2+10*sfac[62]);
rect=paper.rect(bl[62], bt[62], br[62]-bl[62], bb[62]-bt[62], 10*sfac[62]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[62]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[63],ny[63],'Electromagnetic Waves').attr({fill:"#666666","font-size": 14*sfac[63]});
tBox=t.getBBox(); 
bt[63]=ny[63]-(tBox.height/2+10*sfac[63]);
bb[63]=ny[63]+(tBox.height/2+10*sfac[63]);
bl[63]=nx[63]-(tBox.width/2+10*sfac[63]);
br[63]=nx[63]+(tBox.width/2+10*sfac[63]);
rect=paper.rect(bl[63], bt[63], br[63]-bl[63], bb[63]-bt[63], 10*sfac[63]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[63]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[64],ny[64],'Efficiency').attr({fill:"#666666","font-size": 14*sfac[64]});
tBox=t.getBBox(); 
bt[64]=ny[64]-(tBox.height/2+10*sfac[64]);
bb[64]=ny[64]+(tBox.height/2+10*sfac[64]);
bl[64]=nx[64]-(tBox.width/2+10*sfac[64]);
br[64]=nx[64]+(tBox.width/2+10*sfac[64]);
rect=paper.rect(bl[64], bt[64], br[64]-bl[64], bb[64]-bt[64], 10*sfac[64]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[64]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[65],ny[65],'Resistance').attr({fill:"#666666","font-size": 14*sfac[65]});
tBox=t.getBBox(); 
bt[65]=ny[65]-(tBox.height/2+10*sfac[65]);
bb[65]=ny[65]+(tBox.height/2+10*sfac[65]);
bl[65]=nx[65]-(tBox.width/2+10*sfac[65]);
br[65]=nx[65]+(tBox.width/2+10*sfac[65]);
rect=paper.rect(bl[65], bt[65], br[65]-bl[65], bb[65]-bt[65], 10*sfac[65]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[65]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[66],ny[66],'Stress-Strain').attr({fill:"#666666","font-size": 14*sfac[66]});
tBox=t.getBBox(); 
bt[66]=ny[66]-(tBox.height/2+10*sfac[66]);
bb[66]=ny[66]+(tBox.height/2+10*sfac[66]);
bl[66]=nx[66]-(tBox.width/2+10*sfac[66]);
br[66]=nx[66]+(tBox.width/2+10*sfac[66]);
rect=paper.rect(bl[66], bt[66], br[66]-bl[66], bb[66]-bt[66], 10*sfac[66]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[66]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[67],ny[67],'Conservation of Mass').attr({fill:"#666666","font-size": 14*sfac[67]});
tBox=t.getBBox(); 
bt[67]=ny[67]-(tBox.height/2+10*sfac[67]);
bb[67]=ny[67]+(tBox.height/2+10*sfac[67]);
bl[67]=nx[67]-(tBox.width/2+10*sfac[67]);
br[67]=nx[67]+(tBox.width/2+10*sfac[67]);
rect=paper.rect(bl[67], bt[67], br[67]-bl[67], bb[67]-bt[67], 10*sfac[67]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[67]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[68],ny[68],'Conservation of\nLinear Momentum').attr({fill:"#666666","font-size": 14*sfac[68]});
tBox=t.getBBox(); 
bt[68]=ny[68]-(tBox.height/2+10*sfac[68]);
bb[68]=ny[68]+(tBox.height/2+10*sfac[68]);
bl[68]=nx[68]-(tBox.width/2+10*sfac[68]);
br[68]=nx[68]+(tBox.width/2+10*sfac[68]);
rect=paper.rect(bl[68], bt[68], br[68]-bl[68], bb[68]-bt[68], 10*sfac[68]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[68]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[69],ny[69],'Heat').attr({fill:"#666666","font-size": 14*sfac[69]});
tBox=t.getBBox(); 
bt[69]=ny[69]-(tBox.height/2+10*sfac[69]);
bb[69]=ny[69]+(tBox.height/2+10*sfac[69]);
bl[69]=nx[69]-(tBox.width/2+10*sfac[69]);
br[69]=nx[69]+(tBox.width/2+10*sfac[69]);
rect=paper.rect(bl[69], bt[69], br[69]-bl[69], bb[69]-bt[69], 10*sfac[69]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[69]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[70],ny[70],'Diffraction').attr({fill:"#666666","font-size": 14*sfac[70]});
tBox=t.getBBox(); 
bt[70]=ny[70]-(tBox.height/2+10*sfac[70]);
bb[70]=ny[70]+(tBox.height/2+10*sfac[70]);
bl[70]=nx[70]-(tBox.width/2+10*sfac[70]);
br[70]=nx[70]+(tBox.width/2+10*sfac[70]);
rect=paper.rect(bl[70], bt[70], br[70]-bl[70], bb[70]-bt[70], 10*sfac[70]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[70]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[71],ny[71],'Radioactivity').attr({fill:"#666666","font-size": 14*sfac[71]});
tBox=t.getBBox(); 
bt[71]=ny[71]-(tBox.height/2+10*sfac[71]);
bb[71]=ny[71]+(tBox.height/2+10*sfac[71]);
bl[71]=nx[71]-(tBox.width/2+10*sfac[71]);
br[71]=nx[71]+(tBox.width/2+10*sfac[71]);
rect=paper.rect(bl[71], bt[71], br[71]-bl[71], bb[71]-bt[71], 10*sfac[71]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[71]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[72],ny[72],'Friction').attr({fill:"#666666","font-size": 14*sfac[72]});
tBox=t.getBBox(); 
bt[72]=ny[72]-(tBox.height/2+10*sfac[72]);
bb[72]=ny[72]+(tBox.height/2+10*sfac[72]);
bl[72]=nx[72]-(tBox.width/2+10*sfac[72]);
br[72]=nx[72]+(tBox.width/2+10*sfac[72]);
rect=paper.rect(bl[72], bt[72], br[72]-bl[72], bb[72]-bt[72], 10*sfac[72]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[72]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[73],ny[73],'Linear Momentum').attr({fill:"#666666","font-size": 14*sfac[73]});
tBox=t.getBBox(); 
bt[73]=ny[73]-(tBox.height/2+10*sfac[73]);
bb[73]=ny[73]+(tBox.height/2+10*sfac[73]);
bl[73]=nx[73]-(tBox.width/2+10*sfac[73]);
br[73]=nx[73]+(tBox.width/2+10*sfac[73]);
rect=paper.rect(bl[73], bt[73], br[73]-bl[73], bb[73]-bt[73], 10*sfac[73]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[73]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[74],ny[74],'Viscosity').attr({fill:"#666666","font-size": 14*sfac[74]});
tBox=t.getBBox(); 
bt[74]=ny[74]-(tBox.height/2+10*sfac[74]);
bb[74]=ny[74]+(tBox.height/2+10*sfac[74]);
bl[74]=nx[74]-(tBox.width/2+10*sfac[74]);
br[74]=nx[74]+(tBox.width/2+10*sfac[74]);
rect=paper.rect(bl[74], bt[74], br[74]-bl[74], bb[74]-bt[74], 10*sfac[74]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[74]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[75],ny[75],'Modern Physics').attr({fill:"#666666","font-size": 14*sfac[75]});
tBox=t.getBBox(); 
bt[75]=ny[75]-(tBox.height/2+10*sfac[75]);
bb[75]=ny[75]+(tBox.height/2+10*sfac[75]);
bl[75]=nx[75]-(tBox.width/2+10*sfac[75]);
br[75]=nx[75]+(tBox.width/2+10*sfac[75]);
rect=paper.rect(bl[75], bt[75], br[75]-bl[75], bb[75]-bt[75], 10*sfac[75]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[75]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[76],ny[76],'Fission').attr({fill:"#666666","font-size": 14*sfac[76]});
tBox=t.getBBox(); 
bt[76]=ny[76]-(tBox.height/2+10*sfac[76]);
bb[76]=ny[76]+(tBox.height/2+10*sfac[76]);
bl[76]=nx[76]-(tBox.width/2+10*sfac[76]);
br[76]=nx[76]+(tBox.width/2+10*sfac[76]);
rect=paper.rect(bl[76], bt[76], br[76]-bl[76], bb[76]-bt[76], 10*sfac[76]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[76]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[77],ny[77],"Newton's 3rd Law:\nAction and Reaction").attr({fill:"#666666","font-size": 14*sfac[77]});
tBox=t.getBBox(); 
bt[77]=ny[77]-(tBox.height/2+10*sfac[77]);
bb[77]=ny[77]+(tBox.height/2+10*sfac[77]);
bl[77]=nx[77]-(tBox.width/2+10*sfac[77]);
br[77]=nx[77]+(tBox.width/2+10*sfac[77]);
rect=paper.rect(bl[77], bt[77], br[77]-bl[77], bb[77]-bt[77], 10*sfac[77]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[77]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[78],ny[78],'Pressure').attr({fill:"#666666","font-size": 14*sfac[78]});
tBox=t.getBBox(); 
bt[78]=ny[78]-(tBox.height/2+10*sfac[78]);
bb[78]=ny[78]+(tBox.height/2+10*sfac[78]);
bl[78]=nx[78]-(tBox.width/2+10*sfac[78]);
br[78]=nx[78]+(tBox.width/2+10*sfac[78]);
rect=paper.rect(bl[78], bt[78], br[78]-bl[78], bb[78]-bt[78], 10*sfac[78]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[78]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[79],ny[79]-10,'Harmonic Motion').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[79]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Electro-Magnetism-Problems-Beta/#Harmonic Motion", target: "_top"});
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
t=paper.text(nx[80],ny[80],'Plasticity').attr({fill:"#666666","font-size": 14*sfac[80]});
tBox=t.getBBox(); 
bt[80]=ny[80]-(tBox.height/2+10*sfac[80]);
bb[80]=ny[80]+(tBox.height/2+10*sfac[80]);
bl[80]=nx[80]-(tBox.width/2+10*sfac[80]);
br[80]=nx[80]+(tBox.width/2+10*sfac[80]);
rect=paper.rect(bl[80], bt[80], br[80]-bl[80], bb[80]-bt[80], 10*sfac[80]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[80]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[81],ny[81],'Damping').attr({fill:"#666666","font-size": 14*sfac[81]});
tBox=t.getBBox(); 
bt[81]=ny[81]-(tBox.height/2+10*sfac[81]);
bb[81]=ny[81]+(tBox.height/2+10*sfac[81]);
bl[81]=nx[81]-(tBox.width/2+10*sfac[81]);
br[81]=nx[81]+(tBox.width/2+10*sfac[81]);
rect=paper.rect(bl[81], bt[81], br[81]-bl[81], bb[81]-bt[81], 10*sfac[81]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[81]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[82],ny[82],'Dispersion').attr({fill:"#666666","font-size": 14*sfac[82]});
tBox=t.getBBox(); 
bt[82]=ny[82]-(tBox.height/2+10*sfac[82]);
bb[82]=ny[82]+(tBox.height/2+10*sfac[82]);
bl[82]=nx[82]-(tBox.width/2+10*sfac[82]);
br[82]=nx[82]+(tBox.width/2+10*sfac[82]);
rect=paper.rect(bl[82], bt[82], br[82]-bl[82], bb[82]-bt[82], 10*sfac[82]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[82]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[83],ny[83],'Fluid Mechanics').attr({fill:"#666666","font-size": 14*sfac[83]});
tBox=t.getBBox(); 
bt[83]=ny[83]-(tBox.height/2+10*sfac[83]);
bb[83]=ny[83]+(tBox.height/2+10*sfac[83]);
bl[83]=nx[83]-(tBox.width/2+10*sfac[83]);
br[83]=nx[83]+(tBox.width/2+10*sfac[83]);
rect=paper.rect(bl[83], bt[83], br[83]-bl[83], bb[83]-bt[83], 10*sfac[83]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[83]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[84],ny[84],'Center of Gravity').attr({fill:"#666666","font-size": 14*sfac[84]});
tBox=t.getBBox(); 
bt[84]=ny[84]-(tBox.height/2+10*sfac[84]);
bb[84]=ny[84]+(tBox.height/2+10*sfac[84]);
bl[84]=nx[84]-(tBox.width/2+10*sfac[84]);
br[84]=nx[84]+(tBox.width/2+10*sfac[84]);
rect=paper.rect(bl[84], bt[84], br[84]-bl[84], bb[84]-bt[84], 10*sfac[84]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[84]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[85],ny[85]-10,'Transverse and\nLongitudinal Waves').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[85]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Resistor-Circuits/#Transverse and Longitudinal Waves", target: "_top"});
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
t=paper.text(nx[86],ny[86],'Bouyancy').attr({fill:"#666666","font-size": 14*sfac[86]});
tBox=t.getBBox(); 
bt[86]=ny[86]-(tBox.height/2+10*sfac[86]);
bb[86]=ny[86]+(tBox.height/2+10*sfac[86]);
bl[86]=nx[86]-(tBox.width/2+10*sfac[86]);
br[86]=nx[86]+(tBox.width/2+10*sfac[86]);
rect=paper.rect(bl[86], bt[86], br[86]-bl[86], bb[86]-bt[86], 10*sfac[86]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[86]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[87],ny[87],'Conservation\nof Energy').attr({fill:"#666666","font-size": 14*sfac[87]});
tBox=t.getBBox(); 
bt[87]=ny[87]-(tBox.height/2+10*sfac[87]);
bb[87]=ny[87]+(tBox.height/2+10*sfac[87]);
bl[87]=nx[87]-(tBox.width/2+10*sfac[87]);
br[87]=nx[87]+(tBox.width/2+10*sfac[87]);
rect=paper.rect(bl[87], bt[87], br[87]-bl[87], bb[87]-bt[87], 10*sfac[87]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[87]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[88],ny[88],'Heat Transfer').attr({fill:"#666666","font-size": 14*sfac[88]});
tBox=t.getBBox(); 
bt[88]=ny[88]-(tBox.height/2+10*sfac[88]);
bb[88]=ny[88]+(tBox.height/2+10*sfac[88]);
bl[88]=nx[88]-(tBox.width/2+10*sfac[88]);
br[88]=nx[88]+(tBox.width/2+10*sfac[88]);
rect=paper.rect(bl[88], bt[88], br[88]-bl[88], bb[88]-bt[88], 10*sfac[88]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[88]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[89],ny[89]-10,'Coordinate System and\nReference Frames').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[89]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Pressure-and-Force/#Coordinate System and Reference Frames", target: "_top"});
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
t=paper.text(nx[90],ny[90],'Partical Physics').attr({fill:"#666666","font-size": 14*sfac[90]});
tBox=t.getBBox(); 
bt[90]=ny[90]-(tBox.height/2+10*sfac[90]);
bb[90]=ny[90]+(tBox.height/2+10*sfac[90]);
bl[90]=nx[90]-(tBox.width/2+10*sfac[90]);
br[90]=nx[90]+(tBox.width/2+10*sfac[90]);
rect=paper.rect(bl[90], bt[90], br[90]-bl[90], bb[90]-bt[90], 10*sfac[90]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[90]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[91],ny[91],'Thermodynamics').attr({fill:"#666666","font-size": 14*sfac[91]});
tBox=t.getBBox(); 
bt[91]=ny[91]-(tBox.height/2+10*sfac[91]);
bb[91]=ny[91]+(tBox.height/2+10*sfac[91]);
bl[91]=nx[91]-(tBox.width/2+10*sfac[91]);
br[91]=nx[91]+(tBox.width/2+10*sfac[91]);
rect=paper.rect(bl[91], bt[91], br[91]-bl[91], bb[91]-bt[91], 10*sfac[91]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[91]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[92],ny[92]-10,'Wave Motion').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[92]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Voltage-and-Current/#Wave Motion", target: "_top"});
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
t=paper.text(nx[93],ny[93]-10,'Sound').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[93]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Magnetic-Fields/#Sound", target: "_top"});
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
t=paper.text(nx[94],ny[94]-10,"Newton's 1st Law:\nIntertia").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[94]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Impulse/#Newton's 1st Law: Intertia", target: "_top"});
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
t=paper.text(nx[95],ny[95],'Nuclear Structure').attr({fill:"#666666","font-size": 14*sfac[95]});
tBox=t.getBBox(); 
bt[95]=ny[95]-(tBox.height/2+10*sfac[95]);
bb[95]=ny[95]+(tBox.height/2+10*sfac[95]);
bl[95]=nx[95]-(tBox.width/2+10*sfac[95]);
br[95]=nx[95]+(tBox.width/2+10*sfac[95]);
rect=paper.rect(bl[95], bt[95], br[95]-bl[95], bb[95]-bt[95], 10*sfac[95]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[95]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[96],ny[96]-10,'Rotational Mechanics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[96]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Wave-Equation/#Rotational Mechanics", target: "_top"});
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
t=paper.text(nx[97],ny[97]-10,'The Law of Gravity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[97]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Sound/#The Law of Gravity", target: "_top"});
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

bb[98]= ny[98]; 
bt[98]= ny[98]; 
bl[98]= nx[98]; 
br[98]= nx[98]; 

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
s1='M '+nx[0]+' '+bb[0]+' L '+nx[0]+' '+bt[65]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[0,65] ; 

paper.setStart(); 
s1='M '+nx[1]+' '+bb[1]+' L '+nx[1]+' '+bt[67]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[1,67] ; 

paper.setStart(); 
mid=bb[3]+(bt[0]-bb[3])/2; 
hleft = nx[53]; 
hright = nx[3]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[3]+' '+bb[3]+' L '+nx[3]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[53]+' '+mid+' L '+nx[53]+' '+bt[53];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[3,53]; 

paper.setStart(); 
mid=bb[3]+(bt[0]-bb[3])/2; 
hleft = nx[0]; 
hright = nx[3]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[0]+' '+mid+' L '+nx[0]+' '+bt[0];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[3,0]; 

paper.setStart(); 
mid=bb[5]+(bt[94]-bb[5])/2; 
hleft = nx[94]; 
hright = nx[5]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[5]+' '+bb[5]+' L '+nx[5]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[94]+' '+mid+' L '+nx[94]+' '+bt[94];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[5,94]; 

paper.setStart(); 
mid=bb[5]+(bt[94]-bb[5])/2; 
hleft = nx[77]; 
hright = nx[5]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[77]+' '+mid+' L '+nx[77]+' '+bt[77];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[5,77]; 

paper.setStart(); 
mid=bb[5]+(bt[94]-bb[5])/2; 
s3='M '+nx[24]+' '+mid+' L '+nx[24]+' '+bt[24];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[5,24]; 

paper.setStart(); 
s1='M '+nx[6]+' '+bb[6]+' L '+nx[6]+' '+bt[16]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[6,16] ; 

paper.setStart(); 
s1='M '+nx[7]+' '+bb[7]+' L '+nx[7]+' '+bt[5]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[7,5] ; 

paper.setStart(); 
s1='M '+nx[8]+' '+bb[8]+' L '+nx[8]+' '+bt[38]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[8,38] ; 

paper.setStart(); 
s1='M '+nx[9]+' '+bb[9]+' L '+nx[9]+' '+bt[14]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[9,14] ; 

paper.setStart(); 
s1='M '+nx[12]+' '+bb[12]+' L '+nx[12]+' '+bt[63]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[12,63] ; 

paper.setStart(); 
s1='M '+nx[14]+' '+bb[14]+' L '+nx[14]+' '+bt[13]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[14,13] ; 

paper.setStart(); 
s1='M '+nx[15]+' '+bb[15]+' L '+nx[15]+' '+ny[105]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[15],nx[105])+' '+ny[105]+' L '+Math.max(nx[15],nx[105])+' '+ny[105]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[15,105]; 

paper.setStart(); 
s1='M '+nx[16]+' '+bb[16]+' L '+nx[16]+' '+bt[29]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[16,29] ; 

paper.setStart(); 
s1='M '+nx[17]+' '+bb[17]+' L '+nx[17]+' '+bt[18]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[17,18] ; 

paper.setStart(); 
s1='M '+nx[18]+' '+bb[18]+' L '+nx[18]+' '+bt[89]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[18,89] ; 

paper.setStart(); 
s1='M '+nx[20]+' '+bb[20]+' L '+nx[20]+' '+bt[11]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[20,11] ; 

paper.setStart(); 
s1='M '+nx[21]+' '+bb[21]+' L '+nx[21]+' '+ny[103]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[21],nx[103])+' '+ny[103]+' L '+Math.max(nx[21],nx[103])+' '+ny[103]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[21,103]; 

paper.setStart(); 
s1='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+bt[34]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[23,34] ; 

paper.setStart(); 
s1='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+ny[105]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[23],nx[105])+' '+ny[105]+' L '+Math.max(nx[23],nx[105])+' '+ny[105]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[23,105]; 

paper.setStart(); 
s1='M '+nx[24]+' '+bb[24]+' L '+nx[24]+' '+ny[101]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[24],nx[101])+' '+ny[101]+' L '+Math.max(nx[24],nx[101])+' '+ny[101]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[24,101]; 

paper.setStart(); 
mid=bb[25]+(bt[17]-bb[25])/2; 
hleft = nx[49]; 
hright = nx[25]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[25]+' '+bb[25]+' L '+nx[25]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[49]+' '+mid+' L '+nx[49]+' '+bt[49];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[25,49]; 

paper.setStart(); 
mid=bb[25]+(bt[17]-bb[25])/2; 
hleft = nx[17]; 
hright = nx[25]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[17]+' '+mid+' L '+nx[17]+' '+bt[17];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[25,17]; 

paper.setStart(); 
mid=bb[27]+(bt[43]-bb[27])/2; 
hleft = nx[43]; 
hright = nx[27]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[27]+' '+bb[27]+' L '+nx[27]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[43]+' '+mid+' L '+nx[43]+' '+bt[43];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[27,43]; 

paper.setStart(); 
mid=bb[27]+(bt[43]-bb[27])/2; 
hleft = nx[83]; 
hright = nx[27]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[83]+' '+mid+' L '+nx[83]+' '+bt[83];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[27,83]; 

paper.setStart(); 
s1='M '+nx[28]+' '+bb[28]+' L '+nx[28]+' '+bt[48]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[28,48] ; 

paper.setStart(); 
s1='M '+nx[29]+' '+bb[29]+' L '+nx[29]+' '+ny[98]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[29],nx[98])+' '+ny[98]+' L '+Math.max(nx[29],nx[98])+' '+ny[98]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[29,98]; 

paper.setStart(); 
s1='M '+nx[30]+' '+bb[30]+' L '+nx[30]+' '+bt[81]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[30,81] ; 

paper.setStart(); 
s1='M '+nx[30]+' '+bb[30]+' L '+nx[30]+' '+ny[103]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[30],nx[103])+' '+ny[103]+' L '+Math.max(nx[30],nx[103])+' '+ny[103]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[30,103]; 

paper.setStart(); 
s1='M '+nx[32]+' '+bb[32]+' L '+nx[32]+' '+bt[9]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[32,9] ; 

paper.setStart(); 
s1='M '+nx[33]+' '+bb[33]+' L '+nx[33]+' '+bt[47]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[33,47] ; 

paper.setStart(); 
mid=bb[34]+(bt[36]-bb[34])/2; 
hleft = nx[55]; 
hright = nx[34]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[34]+' '+bb[34]+' L '+nx[34]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[55]+' '+mid+' L '+nx[55]+' '+bt[55];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[34,55]; 

paper.setStart(); 
mid=bb[34]+(bt[36]-bb[34])/2; 
hleft = nx[36]; 
hright = nx[34]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[36]+' '+mid+' L '+nx[36]+' '+bt[36];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[34,36]; 

paper.setStart(); 
s1='M '+nx[35]+' '+bb[35]+' L '+nx[35]+' '+bt[31]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[35,31] ; 

paper.setStart(); 
s1='M '+nx[35]+' '+bb[35]+' L '+nx[35]+' '+ny[102]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[35],nx[102])+' '+ny[102]+' L '+Math.max(nx[35],nx[102])+' '+ny[102]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[35,102]; 

paper.setStart(); 
s1='M '+nx[36]+' '+bb[36]+' L '+nx[36]+' '+ny[100]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[36],nx[100])+' '+ny[100]+' L '+Math.max(nx[36],nx[100])+' '+ny[100]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[36,100]; 

paper.setStart(); 
s1='M '+nx[37]+' '+bb[37]+' L '+nx[37]+' '+bt[92]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[37,92] ; 

paper.setStart(); 
s1='M '+nx[38]+' '+bb[38]+' L '+nx[38]+' '+bt[25]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[38,25] ; 

paper.setStart(); 
mid=bb[40]+(bt[60]-bb[40])/2; 
hleft = nx[82]; 
hright = nx[40]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[40]+' '+bb[40]+' L '+nx[40]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[82]+' '+mid+' L '+nx[82]+' '+bt[82];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[40,82]; 

paper.setStart(); 
mid=bb[40]+(bt[60]-bb[40])/2; 
s3='M '+nx[70]+' '+mid+' L '+nx[70]+' '+bt[70];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[40,70]; 

paper.setStart(); 
mid=bb[40]+(bt[60]-bb[40])/2; 
s3='M '+nx[39]+' '+mid+' L '+nx[39]+' '+bt[39];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[40,39]; 

paper.setStart(); 
mid=bb[40]+(bt[60]-bb[40])/2; 
s3='M '+nx[19]+' '+mid+' L '+nx[19]+' '+bt[19];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[40,19]; 

paper.setStart(); 
mid=bb[40]+(bt[60]-bb[40])/2; 
hleft = nx[60]; 
hright = nx[40]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[60]+' '+mid+' L '+nx[60]+' '+bt[60];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[40,60]; 

paper.setStart(); 
s1='M '+nx[41]+' '+bb[41]+' L '+nx[41]+' '+ny[106]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[41],nx[106])+' '+ny[106]+' L '+Math.max(nx[41],nx[106])+' '+ny[106]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[41,106]; 

paper.setStart(); 
mid=bb[43]+(bt[35]-bb[43])/2; 
hleft = nx[80]; 
hright = nx[43]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[43]+' '+bb[43]+' L '+nx[43]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[80]+' '+mid+' L '+nx[80]+' '+bt[80];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[43,80]; 

paper.setStart(); 
mid=bb[43]+(bt[35]-bb[43])/2; 
hleft = nx[35]; 
hright = nx[43]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[35]+' '+mid+' L '+nx[35]+' '+bt[35];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[43,35]; 

paper.setStart(); 
s1='M '+nx[46]+' '+bb[46]+' L '+nx[46]+' '+bt[56]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[46,56] ; 

paper.setStart(); 
mid=bb[49]+(bt[23]-bb[49])/2; 
hleft = nx[15]; 
hright = nx[49]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[49]+' '+bb[49]+' L '+nx[49]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[15]+' '+mid+' L '+nx[15]+' '+bt[15];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[49,15]; 

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
lines[49]=paper.setFinish(); 
lineNodes[49]=[49,23]; 

paper.setStart(); 
s1='M '+nx[50]+' '+bb[50]+' L '+nx[50]+' '+bt[69]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[50,69] ; 

paper.setStart(); 
s1='M '+nx[52]+' '+bb[52]+' L '+nx[52]+' '+bt[84]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[52,84] ; 

paper.setStart(); 
s1='M '+nx[53]+' '+bb[53]+' L '+nx[53]+' '+bt[41]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[53,41] ; 

paper.setStart(); 
s1='M '+nx[53]+' '+bb[53]+' L '+nx[53]+' '+ny[98]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[53],nx[98])+' '+ny[98]+' L '+Math.max(nx[53],nx[98])+' '+ny[98]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[53,98]; 

paper.setStart(); 
s1='M '+nx[55]+' '+bb[55]+' L '+nx[55]+' '+ny[100]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[55],nx[100])+' '+ny[100]+' L '+Math.max(nx[55],nx[100])+' '+ny[100]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[55,100]; 

paper.setStart(); 
s1='M '+nx[58]+' '+bb[58]+' L '+nx[58]+' '+bt[3]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[58,3] ; 

paper.setStart(); 
s1='M '+nx[60]+' '+bb[60]+' L '+nx[60]+' '+bt[45]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[60,45] ; 

paper.setStart(); 
mid=bb[62]+(bt[58]-bb[62])/2; 
hleft = nx[58]; 
hright = nx[62]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[62]+' '+bb[62]+' L '+nx[62]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[58]+' '+mid+' L '+nx[58]+' '+bt[58];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[62,58]; 

paper.setStart(); 
mid=bb[62]+(bt[58]-bb[62])/2; 
hleft = nx[6]; 
hright = nx[62]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[6]+' '+mid+' L '+nx[6]+' '+bt[6];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[62,6]; 

paper.setStart(); 
s1='M '+nx[65]+' '+bb[65]+' L '+nx[65]+' '+ny[106]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[65],nx[106])+' '+ny[106]+' L '+Math.max(nx[65],nx[106])+' '+ny[106]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[65,106]; 

paper.setStart(); 
s1='M '+nx[67]+' '+bb[67]+' L '+nx[67]+' '+bt[20]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[67,20] ; 

paper.setStart(); 
mid=bb[69]+(bt[88]-bb[69])/2; 
hleft = nx[88]; 
hright = nx[69]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[69]+' '+bb[69]+' L '+nx[69]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[88]+' '+mid+' L '+nx[88]+' '+bt[88];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[69,88]; 

paper.setStart(); 
mid=bb[69]+(bt[88]-bb[69])/2; 
hleft = nx[32]; 
hright = nx[69]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[32]+' '+mid+' L '+nx[32]+' '+bt[32];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[69,32]; 

paper.setStart(); 
s1='M '+nx[71]+' '+bb[71]+' L '+nx[71]+' '+bt[44]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[71,44] ; 

paper.setStart(); 
s1='M '+nx[71]+' '+bb[71]+' L '+nx[71]+' '+ny[104]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[71],nx[104])+' '+ny[104]+' L '+Math.max(nx[71],nx[104])+' '+ny[104]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[71,104]; 

paper.setStart(); 
s1='M '+nx[73]+' '+bb[73]+' L '+nx[73]+' '+bt[68]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[73,68] ; 

paper.setStart(); 
s1='M '+nx[74]+' '+bb[74]+' L '+nx[74]+' '+ny[99]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[74],nx[99])+' '+ny[99]+' L '+Math.max(nx[74],nx[99])+' '+ny[99]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[74,99]; 

paper.setStart(); 
mid=bb[75]+(bt[90]-bb[75])/2; 
s2='M '+nx[75]+' '+bb[75]+' L '+nx[75]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[59]+' '+mid+' L '+nx[59]+' '+bt[59];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[75,59]; 

paper.setStart(); 
mid=bb[75]+(bt[90]-bb[75])/2; 
hleft = nx[4]; 
hright = nx[75]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[4]+' '+mid+' L '+nx[4]+' '+bt[4];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[75,4]; 

paper.setStart(); 
mid=bb[75]+(bt[90]-bb[75])/2; 
hleft = nx[90]; 
hright = nx[75]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[90]+' '+mid+' L '+nx[90]+' '+bt[90];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[69]=paper.setFinish(); 
lineNodes[69]=[75,90]; 

paper.setStart(); 
s1='M '+nx[77]+' '+bb[77]+' L '+nx[77]+' '+ny[101]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[77],nx[101])+' '+ny[101]+' L '+Math.max(nx[77],nx[101])+' '+ny[101]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[70]=paper.setFinish(); 
lineNodes[70]=[77,101]; 

paper.setStart(); 
s1='M '+nx[78]+' '+bb[78]+' L '+nx[78]+' '+ny[99]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[78],nx[99])+' '+ny[99]+' L '+Math.max(nx[78],nx[99])+' '+ny[99]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[71]=paper.setFinish(); 
lineNodes[71]=[78,99]; 

paper.setStart(); 
mid=bb[79]+(bt[30]-bb[79])/2; 
hleft = nx[21]; 
hright = nx[79]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[79]+' '+bb[79]+' L '+nx[79]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[21]+' '+mid+' L '+nx[21]+' '+bt[21];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[72]=paper.setFinish(); 
lineNodes[72]=[79,21]; 

paper.setStart(); 
mid=bb[79]+(bt[30]-bb[79])/2; 
hleft = nx[30]; 
hright = nx[79]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[30]+' '+mid+' L '+nx[30]+' '+bt[30];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[73]=paper.setFinish(); 
lineNodes[73]=[79,30]; 

paper.setStart(); 
s1='M '+nx[80]+' '+bb[80]+' L '+nx[80]+' '+bt[2]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[74]=paper.setFinish(); 
lineNodes[74]=[80,2] ; 

paper.setStart(); 
s1='M '+nx[80]+' '+bb[80]+' L '+nx[80]+' '+ny[102]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[80],nx[102])+' '+ny[102]+' L '+Math.max(nx[80],nx[102])+' '+ny[102]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[75]=paper.setFinish(); 
lineNodes[75]=[80,102]; 

paper.setStart(); 
mid=bb[83]+(bt[86]-bb[83])/2; 
s2='M '+nx[83]+' '+bb[83]+' L '+nx[83]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[74]+' '+mid+' L '+nx[74]+' '+bt[74];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[76]=paper.setFinish(); 
lineNodes[76]=[83,74]; 

paper.setStart(); 
mid=bb[83]+(bt[86]-bb[83])/2; 
hleft = nx[78]; 
hright = nx[83]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[78]+' '+mid+' L '+nx[78]+' '+bt[78];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[77]=paper.setFinish(); 
lineNodes[77]=[83,78]; 

paper.setStart(); 
mid=bb[83]+(bt[86]-bb[83])/2; 
hleft = nx[86]; 
hright = nx[83]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[86]+' '+mid+' L '+nx[86]+' '+bt[86];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[78]=paper.setFinish(); 
lineNodes[78]=[83,86]; 

paper.setStart(); 
s1='M '+nx[84]+' '+bb[84]+' L '+nx[84]+' '+bt[96]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[79]=paper.setFinish(); 
lineNodes[79]=[84,96] ; 

paper.setStart(); 
mid=bb[85]+(bt[93]-bb[85])/2; 
hleft = nx[93]; 
hright = nx[85]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[85]+' '+bb[85]+' L '+nx[85]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[93]+' '+mid+' L '+nx[93]+' '+bt[93];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[80]=paper.setFinish(); 
lineNodes[80]=[85,93]; 

paper.setStart(); 
mid=bb[85]+(bt[93]-bb[85])/2; 
hleft = nx[40]; 
hright = nx[85]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[40]+' '+mid+' L '+nx[40]+' '+bt[40];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[81]=paper.setFinish(); 
lineNodes[81]=[85,40]; 

paper.setStart(); 
mid=bb[88]+(bt[22]-bb[88])/2; 
s2='M '+nx[88]+' '+bb[88]+' L '+nx[88]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[10]+' '+mid+' L '+nx[10]+' '+bt[10];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[82]=paper.setFinish(); 
lineNodes[82]=[88,10]; 

paper.setStart(); 
mid=bb[88]+(bt[22]-bb[88])/2; 
hleft = nx[22]; 
hright = nx[88]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[22]+' '+mid+' L '+nx[22]+' '+bt[22];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[83]=paper.setFinish(); 
lineNodes[83]=[88,22]; 

paper.setStart(); 
mid=bb[88]+(bt[22]-bb[88])/2; 
hleft = nx[61]; 
hright = nx[88]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[61]+' '+mid+' L '+nx[61]+' '+bt[61];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[84]=paper.setFinish(); 
lineNodes[84]=[88,61]; 

paper.setStart(); 
mid=bb[89]+(bt[79]-bb[89])/2; 
hleft = nx[7]; 
hright = nx[89]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[89]+' '+bb[89]+' L '+nx[89]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[7]+' '+mid+' L '+nx[7]+' '+bt[7];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[85]=paper.setFinish(); 
lineNodes[85]=[89,7]; 

paper.setStart(); 
mid=bb[89]+(bt[79]-bb[89])/2; 
s3='M '+nx[52]+' '+mid+' L '+nx[52]+' '+bt[52];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[86]=paper.setFinish(); 
lineNodes[86]=[89,52]; 

paper.setStart(); 
mid=bb[89]+(bt[79]-bb[89])/2; 
hleft = nx[79]; 
hright = nx[89]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[79]+' '+mid+' L '+nx[79]+' '+bt[79];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[87]=paper.setFinish(); 
lineNodes[87]=[89,79]; 

paper.setStart(); 
mid=bb[90]+(bt[95]-bb[90])/2; 
hleft = nx[71]; 
hright = nx[90]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[90]+' '+bb[90]+' L '+nx[90]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[71]+' '+mid+' L '+nx[71]+' '+bt[71];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[88]=paper.setFinish(); 
lineNodes[88]=[90,71]; 

paper.setStart(); 
mid=bb[90]+(bt[95]-bb[90])/2; 
hleft = nx[95]; 
hright = nx[90]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[95]+' '+mid+' L '+nx[95]+' '+bt[95];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[89]=paper.setFinish(); 
lineNodes[89]=[90,95]; 

paper.setStart(); 
s1='M '+nx[91]+' '+bb[91]+' L '+nx[91]+' '+bt[50]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[90]=paper.setFinish(); 
lineNodes[90]=[91,50] ; 

paper.setStart(); 
s1='M '+nx[92]+' '+bb[92]+' L '+nx[92]+' '+bt[85]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[91]=paper.setFinish(); 
lineNodes[91]=[92,85] ; 

paper.setStart(); 
mid=bb[93]+(bt[54]-bb[93])/2; 
hleft = nx[26]; 
hright = nx[93]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[93]+' '+bb[93]+' L '+nx[93]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[26]+' '+mid+' L '+nx[26]+' '+bt[26];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[92]=paper.setFinish(); 
lineNodes[92]=[93,26]; 

paper.setStart(); 
mid=bb[93]+(bt[54]-bb[93])/2; 
s3='M '+nx[54]+' '+mid+' L '+nx[54]+' '+bt[54];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[93]=paper.setFinish(); 
lineNodes[93]=[93,54]; 

paper.setStart(); 
mid=bb[93]+(bt[54]-bb[93])/2; 
hleft = nx[60]; 
hright = nx[93]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[60]+' '+mid+' L '+nx[60]+' '+bt[60];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[94]=paper.setFinish(); 
lineNodes[94]=[93,60]; 

paper.setStart(); 
s1='M '+nx[94]+' '+bb[94]+' L '+nx[94]+' '+ny[101]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[94],nx[101])+' '+ny[101]+' L '+Math.max(nx[94],nx[101])+' '+ny[101]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[95]=paper.setFinish(); 
lineNodes[95]=[94,101]; 

paper.setStart(); 
s1='M '+nx[95]+' '+bb[95]+' L '+nx[95]+' '+bt[42]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[96]=paper.setFinish(); 
lineNodes[96]=[95,42] ; 

paper.setStart(); 
s1='M '+nx[95]+' '+bb[95]+' L '+nx[95]+' '+ny[104]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[95],nx[104])+' '+ny[104]+' L '+Math.max(nx[95],nx[104])+' '+ny[104]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[97]=paper.setFinish(); 
lineNodes[97]=[95,104]; 

paper.setStart(); 
mid=bb[96]+(bt[33]-bb[96])/2; 
hleft = nx[97]; 
hright = nx[96]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[96]+' '+bb[96]+' L '+nx[96]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[97]+' '+mid+' L '+nx[97]+' '+bt[97];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[98]=paper.setFinish(); 
lineNodes[98]=[96,97]; 

paper.setStart(); 
mid=bb[96]+(bt[33]-bb[96])/2; 
hleft = nx[33]; 
hright = nx[96]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[33]+' '+mid+' L '+nx[33]+' '+bt[33];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[99]=paper.setFinish(); 
lineNodes[99]=[96,33]; 

paper.setStart(); 
s1='M '+nx[97]+' '+bb[97]+' L '+nx[97]+' '+bt[57]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[100]=paper.setFinish(); 
lineNodes[100]=[97,57] ; 

paper.setStart(); 
s1='M '+nx[98]+' '+bb[98]+' L '+nx[98]+' '+bt[12]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[101]=paper.setFinish(); 
lineNodes[101]=[98,12] ; 

paper.setStart(); 
s1='M '+nx[99]+' '+bb[99]+' L '+nx[99]+' '+bt[1]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[102]=paper.setFinish(); 
lineNodes[102]=[99,1] ; 

paper.setStart(); 
mid=bb[100]+(bt[27]-bb[100])/2; 
hleft = nx[91]; 
hright = nx[100]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[100]+' '+bb[100]+' L '+nx[100]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[91]+' '+mid+' L '+nx[91]+' '+bt[91];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[103]=paper.setFinish(); 
lineNodes[103]=[100,91]; 

paper.setStart(); 
mid=bb[100]+(bt[27]-bb[100])/2; 
hleft = nx[75]; 
hright = nx[100]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[75]+' '+mid+' L '+nx[75]+' '+bt[75];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[104]=paper.setFinish(); 
lineNodes[104]=[100,75]; 

paper.setStart(); 
mid=bb[100]+(bt[27]-bb[100])/2; 
s3='M '+nx[62]+' '+mid+' L '+nx[62]+' '+bt[62];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[105]=paper.setFinish(); 
lineNodes[105]=[100,62]; 

paper.setStart(); 
mid=bb[100]+(bt[27]-bb[100])/2; 
s3='M '+nx[27]+' '+mid+' L '+nx[27]+' '+bt[27];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[106]=paper.setFinish(); 
lineNodes[106]=[100,27]; 

paper.setStart(); 
mid=bb[101]+(bt[28]-bb[101])/2; 
hleft = nx[73]; 
hright = nx[101]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[101]+' '+bb[101]+' L '+nx[101]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[73]+' '+mid+' L '+nx[73]+' '+bt[73];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[107]=paper.setFinish(); 
lineNodes[107]=[101,73]; 

paper.setStart(); 
mid=bb[101]+(bt[28]-bb[101])/2; 
s3='M '+nx[72]+' '+mid+' L '+nx[72]+' '+bt[72];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[108]=paper.setFinish(); 
lineNodes[108]=[101,72]; 

paper.setStart(); 
mid=bb[101]+(bt[28]-bb[101])/2; 
s3='M '+nx[28]+' '+mid+' L '+nx[28]+' '+bt[28];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[109]=paper.setFinish(); 
lineNodes[109]=[101,28]; 

paper.setStart(); 
mid=bb[101]+(bt[28]-bb[101])/2; 
hleft = nx[34]; 
hright = nx[101]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[34]+' '+mid+' L '+nx[34]+' '+bt[34];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[110]=paper.setFinish(); 
lineNodes[110]=[101,34]; 

paper.setStart(); 
s1='M '+nx[102]+' '+bb[102]+' L '+nx[102]+' '+bt[66]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[111]=paper.setFinish(); 
lineNodes[111]=[102,66] ; 

paper.setStart(); 
s1='M '+nx[103]+' '+bb[103]+' L '+nx[103]+' '+bt[37]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[112]=paper.setFinish(); 
lineNodes[112]=[103,37] ; 

paper.setStart(); 
mid=bb[104]+(bt[76]-bb[104])/2; 
hleft = nx[51]; 
hright = nx[104]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[104]+' '+bb[104]+' L '+nx[104]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[51]+' '+mid+' L '+nx[51]+' '+bt[51];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[113]=paper.setFinish(); 
lineNodes[113]=[104,51]; 

paper.setStart(); 
mid=bb[104]+(bt[76]-bb[104])/2; 
hleft = nx[76]; 
hright = nx[104]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[76]+' '+mid+' L '+nx[76]+' '+bt[76];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[114]=paper.setFinish(); 
lineNodes[114]=[104,76]; 

paper.setStart(); 
mid=bb[105]+(bt[64]-bb[105])/2; 
hleft = nx[87]; 
hright = nx[105]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[105]+' '+bb[105]+' L '+nx[105]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[87]+' '+mid+' L '+nx[87]+' '+bt[87];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[115]=paper.setFinish(); 
lineNodes[115]=[105,87]; 

paper.setStart(); 
mid=bb[105]+(bt[64]-bb[105])/2; 
hleft = nx[64]; 
hright = nx[105]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[64]+' '+mid+' L '+nx[64]+' '+bt[64];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[116]=paper.setFinish(); 
lineNodes[116]=[105,64]; 

paper.setStart(); 
s1='M '+nx[106]+' '+bb[106]+' L '+nx[106]+' '+bt[46]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[117]=paper.setFinish(); 
lineNodes[117]=[106,46] ; 

nlines = 118;
}