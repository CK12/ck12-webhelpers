function initMap() { 

// Set size parameters 
mapWidth = 4026; 
mapHeight = 5009; 
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
rootx = 1569; 
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

nnodes = 138; 
njunc = 5; 

nx[0]=1765;
ny[0]=418;
nx[1]=2580;
ny[1]=3982;
nx[2]=1745;
ny[2]=3322;
nx[3]=417;
ny[3]=4244;
nx[4]=2316;
ny[4]=2972;
nx[5]=1020;
ny[5]=3969;
nx[6]=2241;
ny[6]=4817;
nx[7]=1649;
ny[7]=3857;
nx[8]=1359;
ny[8]=217;
nx[9]=1958;
ny[9]=3758;
nx[10]=3826;
ny[10]=4140;
nx[11]=1765;
ny[11]=1374;
nx[12]=1955;
ny[12]=2239;
nx[13]=1671;
ny[13]=4315;
nx[14]=2112;
ny[14]=2597;
nx[15]=3826;
ny[15]=3944;
nx[16]=2203;
ny[16]=3328;
nx[17]=2425;
ny[17]=3869;
nx[18]=1958;
ny[18]=3864;
nx[19]=1765;
ny[19]=515;
nx[20]=1998;
ny[20]=4526;
nx[21]=274;
ny[21]=3722;
nx[22]=200;
ny[22]=3838;
nx[23]=1958;
ny[23]=4090;
nx[24]=1955;
ny[24]=1995;
nx[25]=1610;
ny[25]=3069;
nx[26]=1955;
ny[26]=2454;
nx[27]=1765;
ny[27]=1032;
nx[28]=2969;
ny[28]=3756;
nx[29]=2219;
ny[29]=2863;
nx[30]=2203;
ny[30]=3451;
nx[31]=1718;
ny[31]=1630;
nx[32]=2241;
ny[32]=4724;
nx[33]=2125;
ny[33]=2971;
nx[34]=2726;
ny[34]=3628;
nx[35]=1955;
ny[35]=1507;
nx[36]=1958;
ny[36]=3977;
nx[37]=2118;
ny[37]=4201;
nx[38]=1568;
ny[38]=3976;
nx[39]=1745;
ny[39]=3224;
nx[40]=2969;
ny[40]=3959;
nx[41]=3308;
ny[41]=3848;
nx[42]=603;
ny[42]=3747;
nx[43]=1548;
ny[43]=320;
nx[44]=2969;
ny[44]=4064;
nx[45]=2425;
ny[45]=3756;
nx[46]=603;
ny[46]=3845;
nx[47]=1018;
ny[47]=3634;
nx[48]=603;
ny[48]=3634;
nx[49]=1359;
ny[49]=320;
nx[50]=1765;
ny[50]=613;
nx[51]=1308;
ny[51]=3856;
nx[52]=1603;
ny[52]=1507;
nx[53]=524;
ny[53]=3949;
nx[54]=3308;
ny[54]=3757;
nx[55]=3826;
ny[55]=3848;
nx[56]=1497;
ny[56]=1629;
nx[57]=3099;
ny[57]=4065;
nx[58]=2580;
ny[58]=4086;
nx[59]=274;
ny[59]=3627;
nx[60]=2243;
ny[60]=4430;
nx[61]=1872;
ny[61]=4307;
nx[62]=1698;
ny[62]=2757;
nx[63]=1548;
ny[63]=518;
nx[64]=2376;
ny[64]=3459;
nx[65]=1020;
ny[65]=3860;
nx[66]=1167;
ny[66]=4103;
nx[67]=1586;
ny[67]=2600;
nx[68]=1955;
ny[68]=2121;
nx[69]=1765;
ny[69]=1141;
nx[70]=1784;
ny[70]=4201;
nx[71]=1799;
ny[71]=3069;
nx[72]=1718;
ny[72]=1736;
nx[73]=1765;
ny[73]=219;
nx[74]=3400;
ny[74]=3947;
nx[75]=2787;
ny[75]=4070;
nx[76]=2241;
ny[76]=4909;
nx[77]=1807;
ny[77]=2598;
nx[78]=2322;
ny[78]=2599;
nx[79]=1955;
ny[79]=1871;
nx[80]=1765;
ny[80]=316;
nx[81]=2105;
ny[81]=3758;
nx[82]=3400;
ny[82]=4049;
nx[83]=2251;
ny[83]=3763;
nx[84]=2425;
ny[84]=3984;
nx[85]=3826;
ny[85]=4040;
nx[86]=1765;
ny[86]=924;
nx[87]=3826;
ny[87]=3750;
nx[88]=1018;
ny[88]=3748;
nx[89]=668;
ny[89]=4052;
nx[90]=1698;
ny[90]=2957;
nx[91]=1998;
ny[91]=4633;
nx[92]=2243;
ny[92]=4635;
nx[93]=3231;
ny[93]=3946;
nx[94]=3400;
ny[94]=4155;
nx[95]=865;
ny[95]=4108;
nx[96]=1765;
ny[96]=1251;
nx[97]=2276;
ny[97]=3983;
nx[98]=1020;
ny[98]=4109;
nx[99]=3236;
ny[99]=4155;
nx[100]=1955;
ny[100]=2346;
nx[101]=1359;
ny[101]=421;
nx[102]=2316;
ny[102]=3092;
nx[103]=1359;
ny[103]=516;
nx[104]=668;
ny[104]=3950;
nx[105]=3826;
ny[105]=4244;
nx[106]=1664;
ny[106]=3442;
nx[107]=1955;
ny[107]=1629;
nx[108]=1414;
ny[108]=3976;
nx[109]=2243;
ny[109]=4527;
nx[110]=1484;
ny[110]=3633;
nx[111]=1359;
ny[111]=612;
nx[112]=1484;
ny[112]=3856;
nx[113]=1698;
ny[113]=2860;
nx[114]=3596;
ny[114]=4156;
nx[115]=2219;
ny[115]=2759;
nx[116]=1742;
ny[116]=3984;
nx[117]=2064;
ny[117]=3450;
nx[118]=335;
ny[118]=3838;
nx[119]=1998;
ny[119]=4427;
nx[120]=524;
ny[120]=4052;
nx[121]=2203;
ny[121]=3223;
nx[122]=2118;
ny[122]=4308;
nx[123]=1765;
ny[123]=816;
nx[124]=1569;
ny[124]=100;
nx[125]=1269;
ny[125]=3981;
nx[126]=1827;
ny[126]=3449;
nx[127]=1172;
ny[127]=319;
nx[128]=1765;
ny[128]=709;
nx[129]=1548;
ny[129]=423;
nx[130]=1484;
ny[130]=3746;
nx[131]=2969;
ny[131]=3858;
nx[132]=1955;
ny[132]=1728;
nx[133]=1697;
ny[133]=2673;
nx[134]=415;
ny[134]=4128;
nx[135]=1977;
ny[135]=3008;
nx[136]=2219;
ny[136]=2672;
nx[137]=1956;
ny[137]=3510;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[80, 19]; 
members[1]=[17, 58, 84, 97]; 
members[2]=[106, 126, 39]; 
members[3]=[134]; 
members[4]=[33, 29, 102, 135]; 
members[5]=[65, 98, 66, 95]; 
members[6]=[32, 76]; 
members[7]=[112, 130, 51]; 
members[8]=[73, 43, 49, 124, 127]; 
members[9]=[34, 45, 81, 18, 83, 54, 87, 28]; 
members[10]=[105, 85]; 
members[11]=[96, 35, 52]; 
members[12]=[68, 100]; 
members[13]=[70, 61]; 
members[14]=[67, 136, 77, 78, 26]; 
members[15]=[85, 55]; 
members[16]=[64, 121, 117, 30]; 
members[17]=[97, 84, 45, 1]; 
members[18]=[9, 36]; 
members[19]=[0, 50]; 
members[20]=[91, 119]; 
members[21]=[59, 22, 118, 134]; 
members[22]=[21, 118, 134]; 
members[23]=[36, 37, 70]; 
members[24]=[68, 79]; 
members[25]=[90, 71, 135]; 
members[26]=[67, 100, 77, 78, 14]; 
members[27]=[69, 86]; 
members[28]=[34, 131, 9, 45, 81, 83, 54, 87]; 
members[29]=[33, 115, 4, 135]; 
members[30]=[16, 64, 117]; 
members[31]=[72, 56, 52]; 
members[32]=[92, 6]; 
members[33]=[4, 29, 135]; 
members[34]=[9, 45, 110, 47, 48, 81, 83, 54, 87, 137, 59, 28]; 
members[35]=[11, 107, 52]; 
members[36]=[18, 23]; 
members[37]=[122, 70, 23]; 
members[38]=[112, 116, 108, 125]; 
members[39]=[121, 2, 135]; 
members[40]=[57, 75, 44, 131]; 
members[41]=[74, 93, 54]; 
members[42]=[48, 46]; 
members[43]=[8, 129, 49, 127]; 
members[44]=[40, 57, 75]; 
members[45]=[34, 81, 9, 17, 83, 54, 87, 28]; 
members[46]=[104, 42, 53]; 
members[47]=[34, 137, 110, 48, 88, 59]; 
members[48]=[34, 137, 42, 110, 47, 59]; 
members[49]=[8, 43, 101, 127]; 
members[50]=[128, 19]; 
members[51]=[112, 130, 7]; 
members[52]=[56, 35, 11, 31]; 
members[53]=[120, 104, 46]; 
members[54]=[34, 41, 87, 45, 81, 83, 9, 28]; 
members[55]=[87, 15]; 
members[56]=[52, 31]; 
members[57]=[40, 75, 44]; 
members[58]=[1]; 
members[59]=[34, 137, 110, 47, 48, 21]; 
members[60]=[122, 109, 119]; 
members[61]=[13, 70]; 
members[62]=[113, 133]; 
members[63]=[129]; 
members[64]=[16, 117, 30]; 
members[65]=[88, 5]; 
members[66]=[98, 5, 95]; 
members[67]=[133, 77, 78, 14, 26]; 
members[68]=[24, 12]; 
members[69]=[96, 27]; 
members[70]=[37, 23, 13, 61]; 
members[71]=[25, 90, 135]; 
members[72]=[31]; 
members[73]=[80, 124, 8]; 
members[74]=[41, 82, 93]; 
members[75]=[40, 57, 44]; 
members[76]=[6]; 
members[77]=[67, 133, 78, 14, 26]; 
members[78]=[67, 136, 77, 14, 26]; 
members[79]=[24, 132]; 
members[80]=[0, 73]; 
members[81]=[34, 9, 45, 83, 54, 87, 28]; 
members[82]=[114, 99, 74, 94]; 
members[83]=[34, 9, 45, 81, 54, 87, 28]; 
members[84]=[17, 1, 97]; 
members[85]=[10, 15]; 
members[86]=[123, 27]; 
members[87]=[34, 9, 45, 81, 83, 54, 55, 28]; 
members[88]=[65, 47]; 
members[89]=[104]; 
members[90]=[25, 71, 113, 135]; 
members[91]=[20]; 
members[92]=[32, 109]; 
members[93]=[41, 74]; 
members[94]=[82, 99, 114]; 
members[95]=[98, 66, 5]; 
members[96]=[11, 69]; 
members[97]=[17, 84, 1]; 
members[98]=[66, 5, 95]; 
members[99]=[82, 114, 94]; 
members[100]=[26, 12]; 
members[101]=[49, 103]; 
members[102]=[4]; 
members[103]=[101, 111]; 
members[104]=[89, 53, 46]; 
members[105]=[10]; 
members[106]=[2, 126]; 
members[107]=[35, 132]; 
members[108]=[112, 116, 125, 38]; 
members[109]=[60, 92]; 
members[110]=[130, 137, 34, 47, 48, 59]; 
members[111]=[103]; 
members[112]=[130, 38, 7, 108, 51, 116, 125]; 
members[113]=[90, 62]; 
members[114]=[82, 99, 94]; 
members[115]=[136, 29]; 
members[116]=[112, 108, 125, 38]; 
members[117]=[16, 137, 30, 64]; 
members[118]=[22, 21, 134]; 
members[119]=[60, 122, 20]; 
members[120]=[53, 134]; 
members[121]=[16, 39, 135]; 
members[122]=[60, 37, 119]; 
members[123]=[128, 86]; 
members[124]=[8, 73]; 
members[125]=[112, 116, 108, 38]; 
members[126]=[137, 2, 106]; 
members[127]=[8, 49, 43]; 
members[128]=[50, 123]; 
members[129]=[43, 63]; 
members[130]=[112, 51, 110, 7]; 
members[131]=[40, 28]; 
members[132]=[107, 79]; 
members[133]=[67, 62, 77]; 
members[134]=[3, 118, 21, 22, 120]; 
members[135]=[33, 71, 4, 39, 25, 121, 90, 29]; 
members[136]=[115, 78, 14]; 
members[137]=[34, 110, 47, 48, 117, 59, 126]; 

return members[i]; 
} 

function drawMap(sfac) { 

var t; 
var rect; 
var tbox; 

paper.clear(); 

paper.setStart(); 
t=paper.text(nx[0],ny[0]-10,'Properties and Changes\nof Matter').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[0]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-and-Changes-of-Matter/#Properties and Changes of Matter", target: "_top"});
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
t=paper.text(nx[1],ny[1]-10,'Entropy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[1]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Entropy/#Entropy", target: "_top"});
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
t=paper.text(nx[2],ny[2]-10,'Chemical Reactions\nand Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[2]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Chemical-Reactions-and-Equations/#Chemical Reactions and Equations", target: "_top"});
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
t=paper.text(nx[3],ny[3]-10,'Stoichiometry Involving\nGases').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[3]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Stoichiometry-Involving-Gases/#Stoichiometry Involving Gases", target: "_top"});
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
t=paper.text(nx[4],ny[4]-10,'Electronic and Molecular\nGeometry').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[4]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Electronic-and-Molecular-Geometry/#Electronic and Molecular Geometry", target: "_top"});
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
t=paper.text(nx[5],ny[5]-10,'Ionic, Metallic, and Network\nCondensed Phases').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[5]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ionic,-Metallic,-and-Network-Condensed-Phases/#Ionic, Metallic, and Network Condensed Phases", target: "_top"});
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
t=paper.text(nx[6],ny[6]-10,'Titration').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[6]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Titration/#Titration", target: "_top"});
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
t=paper.text(nx[7],ny[7]-10,'Colligative Properties').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[7]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Colligative-Properties/#Colligative Properties", target: "_top"});
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
t=paper.text(nx[8],ny[8],'Measurement in Chemistry').attr({fill:"#666666","font-size": 14*sfac[8]});
tBox=t.getBBox(); 
bt[8]=ny[8]-(tBox.height/2+10*sfac[8]);
bb[8]=ny[8]+(tBox.height/2+10*sfac[8]);
bl[8]=nx[8]-(tBox.width/2+10*sfac[8]);
br[8]=nx[8]+(tBox.width/2+10*sfac[8]);
rect=paper.rect(bl[8], bt[8], br[8]-bl[8], bb[8]-bt[8], 10*sfac[8]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[8]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[9],ny[9]-10,'Rate of Reactions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[9]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Rate-of-Reactions/#Rate of Reactions", target: "_top"});
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
t=paper.text(nx[10],ny[10]-10,'Functional Groups').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[10]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Functional-Groups/#Functional Groups", target: "_top"});
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
t=paper.text(nx[11],ny[11]-10,'The Bohr Model of\nthe Atom').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[11]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Bohr-Model-of-the-Atom/#The Bohr Model of the Atom", target: "_top"});
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
t=paper.text(nx[12],ny[12],'Chemical Periodicity').attr({fill:"#666666","font-size": 14*sfac[12]});
tBox=t.getBBox(); 
bt[12]=ny[12]-(tBox.height/2+10*sfac[12]);
bb[12]=ny[12]+(tBox.height/2+10*sfac[12]);
bl[12]=nx[12]-(tBox.width/2+10*sfac[12]);
br[12]=nx[12]+(tBox.width/2+10*sfac[12]);
rect=paper.rect(bl[12], bt[12], br[12]-bl[12], bb[12]-bt[12], 10*sfac[12]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[12]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[13],ny[13]-10,'The Effects of Applying Stress\nto Reactions at Equilibrium').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[13]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Effects-of-Applying-Stress-to-Reactions-at-Equilibrium/#The Effects of Applying Stress to Reactions at Equilibrium", target: "_top"});
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
t=paper.text(nx[14],ny[14]-10,'Periodic Trends in\nElectronegativity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[14]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Periodic-Trends-in-Electronegativity/#Periodic Trends in Electronegativity", target: "_top"});
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
t=paper.text(nx[15],ny[15]-10,'Hydrocarbons').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[15]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Hydrocarbons/#Hydrocarbons", target: "_top"});
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
t=paper.text(nx[16],ny[16]-10,'Determining Formula and\nMolar Masses').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[16]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Determining-Formula-and-Molar-Masses/#Determining Formula and Molar Masses", target: "_top"});
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
t=paper.text(nx[17],ny[17]-10,'Energy Change in\nReactions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[17]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Energy-Change-in-Reactions/#Energy Change in Reactions", target: "_top"});
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
t=paper.text(nx[18],ny[18]-10,'Factors that Affect\nReaction Rates').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[18]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Factors-That-Affect-Reaction-Rates/#Factors that Affect Reaction Rates", target: "_top"});
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
t=paper.text(nx[19],ny[19]-10,'Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[19]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Energy/#Energy", target: "_top"});
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
t=paper.text(nx[20],ny[20],'Br\xf8nsted-Lowry Acids and Bases').attr({fill:"#666666","font-size": 14*sfac[20]});
tBox=t.getBBox(); 
bt[20]=ny[20]-(tBox.height/2+10*sfac[20]);
bb[20]=ny[20]+(tBox.height/2+10*sfac[20]);
bl[20]=nx[20]-(tBox.width/2+10*sfac[20]);
br[20]=nx[20]+(tBox.width/2+10*sfac[20]);
rect=paper.rect(bl[20], bt[20], br[20]-bl[20], bb[20]-bt[20], 10*sfac[20]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[20]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[21],ny[21]-10,'Stoichiometric Calculations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[21]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Stoichiometric-Calculations/#Stoichiometric Calculations", target: "_top"});
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
t=paper.text(nx[22],ny[22]-10,'Limiting Reactant').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[22]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Limiting-Reactant/#Limiting Reactant", target: "_top"});
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
t=paper.text(nx[23],ny[23],'Chemical Equilibrium').attr({fill:"#666666","font-size": 14*sfac[23]});
tBox=t.getBBox(); 
bt[23]=ny[23]-(tBox.height/2+10*sfac[23]);
bb[23]=ny[23]+(tBox.height/2+10*sfac[23]);
bl[23]=nx[23]-(tBox.width/2+10*sfac[23]);
br[23]=nx[23]+(tBox.width/2+10*sfac[23]);
rect=paper.rect(bl[23], bt[23], br[23]-bl[23], bb[23]-bt[23], 10*sfac[23]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[23]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[24],ny[24]-10,"Mendeleev's Periodic\nTable").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[24]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mendeleev’s-Periodic-Table/#Mendeleev's Periodic Table", target: "_top"});
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
t=paper.text(nx[25],ny[25]-10,'Writing Ionic Formulas').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[25]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Writing-Ionic-Formulas/#Writing Ionic Formulas", target: "_top"});
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
t=paper.text(nx[26],ny[26]-10,'Periodic Trends in\nAtomic Size').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[26]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Periodic-Trends-in-Atomic-Size/#Periodic Trends in Atomic Size", target: "_top"});
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
t=paper.text(nx[27],ny[27],'The Bohr Model of\nthe Atom').attr({fill:"#666666","font-size": 14*sfac[27]});
tBox=t.getBBox(); 
bt[27]=ny[27]-(tBox.height/2+10*sfac[27]);
bb[27]=ny[27]+(tBox.height/2+10*sfac[27]);
bl[27]=nx[27]-(tBox.width/2+10*sfac[27]);
br[27]=nx[27]+(tBox.width/2+10*sfac[27]);
rect=paper.rect(bl[27], bt[27], br[27]-bl[27], bb[27]-bt[27], 10*sfac[27]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[27]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[28],ny[28],'Electrochemistry').attr({fill:"#666666","font-size": 14*sfac[28]});
tBox=t.getBBox(); 
bt[28]=ny[28]-(tBox.height/2+10*sfac[28]);
bb[28]=ny[28]+(tBox.height/2+10*sfac[28]);
bl[28]=nx[28]-(tBox.width/2+10*sfac[28]);
br[28]=nx[28]+(tBox.width/2+10*sfac[28]);
rect=paper.rect(bl[28], bt[28], br[28]-bl[28], bb[28]-bt[28], 10*sfac[28]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[28]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[29],ny[29]-10,'The Covalent Bond').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[29]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Covalent-Bond/#The Covalent Bond", target: "_top"});
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
t=paper.text(nx[30],ny[30]-10,'Percent Composition').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[30]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Percent-Composition/#Percent Composition", target: "_top"});
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
t=paper.text(nx[31],ny[31]-10,'Characteristics of Matter').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[31]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Characteristics-of-Matter/#Characteristics of Matter", target: "_top"});
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
t=paper.text(nx[32],ny[32]-10,'Neutralization').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[32]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Neutralization/#Neutralization", target: "_top"});
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
t=paper.text(nx[33],ny[33]-10,'Covalent Formulas and\nNomenclature').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[33]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Covalent-Formulas-and-Nomenclature/#Covalent Formulas and Nomenclature", target: "_top"});
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
t=paper.text(nx[34],ny[34],'Chemical Kinetics').attr({fill:"#666666","font-size": 14*sfac[34]});
tBox=t.getBBox(); 
bt[34]=ny[34]-(tBox.height/2+10*sfac[34]);
bb[34]=ny[34]+(tBox.height/2+10*sfac[34]);
bl[34]=nx[34]-(tBox.width/2+10*sfac[34]);
br[34]=nx[34]+(tBox.width/2+10*sfac[34]);
rect=paper.rect(bl[34], bt[34], br[34]-bl[34], bb[34]-bt[34], 10*sfac[34]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[34]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[35],ny[35],'The Electron Configuration\nof Atoms').attr({fill:"#666666","font-size": 14*sfac[35]});
tBox=t.getBBox(); 
bt[35]=ny[35]-(tBox.height/2+10*sfac[35]);
bb[35]=ny[35]+(tBox.height/2+10*sfac[35]);
bl[35]=nx[35]-(tBox.width/2+10*sfac[35]);
br[35]=nx[35]+(tBox.width/2+10*sfac[35]);
rect=paper.rect(bl[35], bt[35], br[35]-bl[35], bb[35]-bt[35], 10*sfac[35]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[35]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[36],ny[36]-10,'Multi-Step Reaction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[36]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multi-step-Reaction/#Multi-Step Reaction", target: "_top"});
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
t=paper.text(nx[37],ny[37],'Acids and Bases').attr({fill:"#666666","font-size": 14*sfac[37]});
tBox=t.getBBox(); 
bt[37]=ny[37]-(tBox.height/2+10*sfac[37]);
bb[37]=ny[37]+(tBox.height/2+10*sfac[37]);
bl[37]=nx[37]-(tBox.width/2+10*sfac[37]);
br[37]=nx[37]+(tBox.width/2+10*sfac[37]);
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[37]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[38],ny[38]-10,'Separating Mixtures').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[38]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Separating-Mixtures/#Separating Mixtures", target: "_top"});
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
t=paper.text(nx[39],ny[39],'Chemical Reactions').attr({fill:"#666666","font-size": 14*sfac[39]});
tBox=t.getBBox(); 
bt[39]=ny[39]-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[40],ny[40]-10,'Oxidation-Reduction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[40]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Oxidation-–-Reduction/#Oxidation-Reduction", target: "_top"});
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
t=paper.text(nx[41],ny[41]-10,'Discovery of Radioactivity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[41]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Discovery-of-Radioactivity/#Discovery of Radioactivity", target: "_top"});
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
t=paper.text(nx[42],ny[42]-10,'The Three States\nof Matter').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[42]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Three-States-of-Matter/#The Three States of Matter", target: "_top"});
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
t=paper.text(nx[43],ny[43]-10,'Significant Figures').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[43]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Significant-Figures/#Significant Figures", target: "_top"});
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
t=paper.text(nx[44],ny[44]-10,'Electrolysis').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[44]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Electrolysis/#Electrolysis", target: "_top"});
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
t=paper.text(nx[45],ny[45],'Thermochemistry').attr({fill:"#666666","font-size": 14*sfac[45]});
tBox=t.getBBox(); 
bt[45]=ny[45]-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[45]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[46],ny[46]-10,'Gases').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[46]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Gases/#Gases", target: "_top"});
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
t=paper.text(nx[47],ny[47],'Condensed Phases:\nSolids and Liquids').attr({fill:"#666666","font-size": 14*sfac[47]});
tBox=t.getBBox(); 
bt[47]=ny[47]-(tBox.height/2+10*sfac[47]);
bb[47]=ny[47]+(tBox.height/2+10*sfac[47]);
bl[47]=nx[47]-(tBox.width/2+10*sfac[47]);
br[47]=nx[47]+(tBox.width/2+10*sfac[47]);
rect=paper.rect(bl[47], bt[47], br[47]-bl[47], bb[47]-bt[47], 10*sfac[47]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[47]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[48],ny[48],'The Behavior of\nGases').attr({fill:"#666666","font-size": 14*sfac[48]});
tBox=t.getBBox(); 
bt[48]=ny[48]-(tBox.height/2+10*sfac[48]);
bb[48]=ny[48]+(tBox.height/2+10*sfac[48]);
bl[48]=nx[48]-(tBox.width/2+10*sfac[48]);
br[48]=nx[48]+(tBox.width/2+10*sfac[48]);
rect=paper.rect(bl[48], bt[48], br[48]-bl[48], bb[48]-bt[48], 10*sfac[48]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[48]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[49],ny[49]-10,'Measurement Sytems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[49]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Measurement-Systems/#Measurement Sytems", target: "_top"});
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
t=paper.text(nx[50],ny[50],'The Atomic Theory').attr({fill:"#666666","font-size": 14*sfac[50]});
tBox=t.getBBox(); 
bt[50]=ny[50]-(tBox.height/2+10*sfac[50]);
bb[50]=ny[50]+(tBox.height/2+10*sfac[50]);
bl[50]=nx[50]-(tBox.width/2+10*sfac[50]);
br[50]=nx[50]+(tBox.width/2+10*sfac[50]);
rect=paper.rect(bl[50], bt[50], br[50]-bl[50], bb[50]-bt[50], 10*sfac[50]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[50]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[51],ny[51]-10,'Measuring Concentration').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[51]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Measuring-Concentration/#Measuring Concentration", target: "_top"});
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
t=paper.text(nx[52],ny[52],'The Quantum Mechanical\nModel of the Atom').attr({fill:"#666666","font-size": 14*sfac[52]});
tBox=t.getBBox(); 
bt[52]=ny[52]-(tBox.height/2+10*sfac[52]);
bb[52]=ny[52]+(tBox.height/2+10*sfac[52]);
bl[52]=nx[52]-(tBox.width/2+10*sfac[52]);
br[52]=nx[52]+(tBox.width/2+10*sfac[52]);
rect=paper.rect(bl[52], bt[52], br[52]-bl[52], bb[52]-bt[52], 10*sfac[52]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[52]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[53],ny[53]-10,'Gases and Pressure').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[53]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Gases-and-Pressure/#Gases and Pressure", target: "_top"});
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
t=paper.text(nx[54],ny[54],'Nuclear Chemistry').attr({fill:"#666666","font-size": 14*sfac[54]});
tBox=t.getBBox(); 
bt[54]=ny[54]-(tBox.height/2+10*sfac[54]);
bb[54]=ny[54]+(tBox.height/2+10*sfac[54]);
bl[54]=nx[54]-(tBox.width/2+10*sfac[54]);
br[54]=nx[54]+(tBox.width/2+10*sfac[54]);
rect=paper.rect(bl[54], bt[54], br[54]-bl[54], bb[54]-bt[54], 10*sfac[54]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[54]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[55],ny[55]-10,'Carbon, a Unique Element').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[55]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Carbon,-A-Unique-Element/#Carbon, a Unique Element", target: "_top"});
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
t=paper.text(nx[56],ny[56]-10,'The Dual Nature of Light').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[56]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Dual-Nature-of-Light/#The Dual Nature of Light", target: "_top"});
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
t=paper.text(nx[57],ny[57]-10,'Galvanic Cells').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[57]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Galvanic-Cells/#Galvanic Cells", target: "_top"});
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
t=paper.text(nx[58],ny[58],'Gibbs Free Energy').attr({fill:"#666666","font-size": 14*sfac[58]});
tBox=t.getBBox(); 
bt[58]=ny[58]-(tBox.height/2+10*sfac[58]);
bb[58]=ny[58]+(tBox.height/2+10*sfac[58]);
bl[58]=nx[58]-(tBox.width/2+10*sfac[58]);
br[58]=nx[58]+(tBox.width/2+10*sfac[58]);
rect=paper.rect(bl[58], bt[58], br[58]-bl[58], bb[58]-bt[58], 10*sfac[58]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[58]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[59],ny[59],'Stoichiometry').attr({fill:"#666666","font-size": 14*sfac[59]});
tBox=t.getBBox(); 
bt[59]=ny[59]-(tBox.height/2+10*sfac[59]);
bb[59]=ny[59]+(tBox.height/2+10*sfac[59]);
bl[59]=nx[59]-(tBox.width/2+10*sfac[59]);
br[59]=nx[59]+(tBox.width/2+10*sfac[59]);
rect=paper.rect(bl[59], bt[59], br[59]-bl[59], bb[59]-bt[59], 10*sfac[59]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[59]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[60],ny[60]-10,'The pH Concept').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[60]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-pH-Concept/#The pH Concept", target: "_top"});
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
t=paper.text(nx[61],ny[61]-10,'Slightly Soluble Salts').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[61]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Slightly-Soluble-Salts/#Slightly Soluble Salts", target: "_top"});
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
t=paper.text(nx[62],ny[62],'Ionic Bonds and\nFormulas').attr({fill:"#666666","font-size": 14*sfac[62]});
tBox=t.getBBox(); 
bt[62]=ny[62]-(tBox.height/2+10*sfac[62]);
bb[62]=ny[62]+(tBox.height/2+10*sfac[62]);
bl[62]=nx[62]-(tBox.width/2+10*sfac[62]);
br[62]=nx[62]+(tBox.width/2+10*sfac[62]);
rect=paper.rect(bl[62], bt[62], br[62]-bl[62], bb[62]-bt[62], 10*sfac[62]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[62]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[63],ny[63]-10,'Scientific Notation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[63]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Scientific-Notation---Measurement-in-Chemistry/#Scientific Notation", target: "_top"});
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
t=paper.text(nx[64],ny[64]-10,'Empirical and Molecular\nFormulas').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[64]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Empirical-and-Molecular-Formulas/#Empirical and Molecular Formulas", target: "_top"});
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
t=paper.text(nx[65],ny[65]-10,'Intermolecular Forces\nof Attraction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[65]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Intermolecular-Forces-of-Attraction/#Intermolecular Forces of Attraction", target: "_top"});
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
t=paper.text(nx[66],ny[66]-10,'Phase Diagrams').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[66]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Phase-Diagrams/#Phase Diagrams", target: "_top"});
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
t=paper.text(nx[67],ny[67]-10,'Periodic Trends in\nIonic Size').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[67]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Periodic-Trends-in-Ionic-Size/#Periodic Trends in Ionic Size", target: "_top"});
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
t=paper.text(nx[68],ny[68]-10,'Families and Periods of\nthe Periodic Table').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[68]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Families-and-Periods-of-the-Periodic-Table/#Families and Periods of the Periodic Table", target: "_top"});
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
t=paper.text(nx[69],ny[69]-10,'The Nature of Light').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[69]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Nature-of-Light/#The Nature of Light", target: "_top"});
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
t=paper.text(nx[70],ny[70]-10,'Equilibrium Constant').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[70]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Equilibrium-Constant/#Equilibrium Constant", target: "_top"});
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
t=paper.text(nx[71],ny[71]-10,'Naming Ionic Compounds').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[71]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Naming-Ionic-Compounds/#Naming Ionic Compounds", target: "_top"});
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
t=paper.text(nx[72],ny[72]-10,'Quantum Numbers, Orbitals,\nand Probability Patterns').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[72]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Quantum-Numbers,-Orbitals,-and-Probability-Patterns/#Quantum Numbers, Orbitals, and Probability Patterns", target: "_top"});
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
t=paper.text(nx[73],ny[73],'Matter and Energy').attr({fill:"#666666","font-size": 14*sfac[73]});
tBox=t.getBBox(); 
bt[73]=ny[73]-(tBox.height/2+10*sfac[73]);
bb[73]=ny[73]+(tBox.height/2+10*sfac[73]);
bl[73]=nx[73]-(tBox.width/2+10*sfac[73]);
br[73]=nx[73]+(tBox.width/2+10*sfac[73]);
rect=paper.rect(bl[73], bt[73], br[73]-bl[73], bb[73]-bt[73], 10*sfac[73]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[73]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[74],ny[74]-10,'Nuclear Force').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[74]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Nuclear-Force/#Nuclear Force", target: "_top"});
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
t=paper.text(nx[75],ny[75]-10,'Balancing Redox Equations Using\nthe Oxidation Number Method').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[75]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Balancing-Redox-Equations-Using-the-Oxidation-Number-Method/#Balancing Redox Equations Using the Oxidation Number Method", target: "_top"});
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
t=paper.text(nx[76],ny[76],'Buffers').attr({fill:"#666666","font-size": 14*sfac[76]});
tBox=t.getBBox(); 
bt[76]=ny[76]-(tBox.height/2+10*sfac[76]);
bb[76]=ny[76]+(tBox.height/2+10*sfac[76]);
bl[76]=nx[76]-(tBox.width/2+10*sfac[76]);
br[76]=nx[76]+(tBox.width/2+10*sfac[76]);
rect=paper.rect(bl[76], bt[76], br[76]-bl[76], bb[76]-bt[76], 10*sfac[76]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[76]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[77],ny[77]-10,'Periodic Trends in\nIonization Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[77]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Periodic-Trends-in-Ionization-Energy/#Periodic Trends in Ionization Energy", target: "_top"});
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
t=paper.text(nx[78],ny[78]-10,'Periodic Trends in\nElectron Affinity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[78]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Periodic-Trends-in-Electron-Affinity/#Periodic Trends in Electron Affinity", target: "_top"});
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
t=paper.text(nx[79],ny[79],'Electron Configuration and\nthe Periodic Table').attr({fill:"#666666","font-size": 14*sfac[79]});
tBox=t.getBBox(); 
bt[79]=ny[79]-(tBox.height/2+10*sfac[79]);
bb[79]=ny[79]+(tBox.height/2+10*sfac[79]);
bl[79]=nx[79]-(tBox.width/2+10*sfac[79]);
br[79]=nx[79]+(tBox.width/2+10*sfac[79]);
rect=paper.rect(bl[79], bt[79], br[79]-bl[79], bb[79]-bt[79], 10*sfac[79]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[79]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[80],ny[80]-10,'What is Matter?').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[80]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/What-is-Matter?/#What is Matter?", target: "_top"});
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
t=paper.text(nx[81],ny[81]-10,'Collision Theory').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[81]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Collision-Theory/#Collision Theory", target: "_top"});
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
t=paper.text(nx[82],ny[82]-10,'Nuclear Disintigration').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[82]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Nuclear-Disintegration/#Nuclear Disintigration", target: "_top"});
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
t=paper.text(nx[83],ny[83]-10,'Potential Energy\nDiagrams').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[83]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Potential-Energy-Diagrams/#Potential Energy Diagrams", target: "_top"});
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
t=paper.text(nx[84],ny[84]-10,'Spontaneous Process').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[84]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Spontaneous-Processes/#Spontaneous Process", target: "_top"});
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
t=paper.text(nx[85],ny[85]-10,'Aromatics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[85]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Aromatics/#Aromatics", target: "_top"});
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
t=paper.text(nx[86],ny[86]-10,'Atomic Structure').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[86]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Atomic-Structure/#Atomic Structure", target: "_top"});
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
t=paper.text(nx[87],ny[87],'Organic Chemistry').attr({fill:"#666666","font-size": 14*sfac[87]});
tBox=t.getBBox(); 
bt[87]=ny[87]-(tBox.height/2+10*sfac[87]);
bb[87]=ny[87]+(tBox.height/2+10*sfac[87]);
bl[87]=nx[87]-(tBox.width/2+10*sfac[87]);
br[87]=nx[87]+(tBox.width/2+10*sfac[87]);
rect=paper.rect(bl[87], bt[87], br[87]-bl[87], bb[87]-bt[87], 10*sfac[87]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[87]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[88],ny[88]-10,'Properties of Solids\nand Liquids').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[88]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-of-Solids-and-Liquids/#Properties of Solids and Liquids", target: "_top"});
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
t=paper.text(nx[89],ny[89]-10,'Universal Gas Law').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[89]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Universal-Gas-Law/#Universal Gas Law", target: "_top"});
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
t=paper.text(nx[90],ny[90]-10,'Ionic Compounds').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[90]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ionic-Compounds/#Ionic Compounds", target: "_top"});
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
t=paper.text(nx[91],ny[91]-10,'Lewis Acids and Bases').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[91]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Lewis-Acids-and-Bases/#Lewis Acids and Bases", target: "_top"});
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
t=paper.text(nx[92],ny[92],'Neutralization').attr({fill:"#666666","font-size": 14*sfac[92]});
tBox=t.getBBox(); 
bt[92]=ny[92]-(tBox.height/2+10*sfac[92]);
bb[92]=ny[92]+(tBox.height/2+10*sfac[92]);
bl[92]=nx[92]-(tBox.width/2+10*sfac[92]);
br[92]=nx[92]+(tBox.width/2+10*sfac[92]);
rect=paper.rect(bl[92], bt[92], br[92]-bl[92], bb[92]-bt[92], 10*sfac[92]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[92]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[93],ny[93]-10,'Nuclear Notation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[93]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Nuclear-Notation/#Nuclear Notation", target: "_top"});
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
t=paper.text(nx[94],ny[94]-10,'Radiation Around Us').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[94]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Radiation-Around-Us/#Radiation Around Us", target: "_top"});
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
t=paper.text(nx[95],ny[95]-10,'Vapor Pressure and\nBoiling').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[95]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Vapor-Pressure-and-Boiling/#Vapor Pressure and Boiling", target: "_top"});
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
t=paper.text(nx[96],ny[96]-10,'Atoms and Electromagnetic\nSpectra').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[96]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Atoms-and-Electromagnetic-Spectra/#Atoms and Electromagnetic Spectra", target: "_top"});
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
t=paper.text(nx[97],ny[97]-10,'Enthalpy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[97]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Enthalpy/#Enthalpy", target: "_top"});
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
t=paper.text(nx[98],ny[98]-10,'Heat and Changes\nof State').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[98]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Heat-and-Changes-of-State/#Heat and Changes of State", target: "_top"});
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
t=paper.text(nx[99],ny[99]-10,'Nuclear Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[99]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Nuclear-Equations/#Nuclear Equations", target: "_top"});
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
t=paper.text(nx[100],ny[100]-10,'The Periodic Table').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[100]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Periodic-Table/#The Periodic Table", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[100]=ny[100]-10-(tBox.height/2+10*sfac[100]);
bb[100]=ny[100]-10+(tBox.height/2+10*sfac[100]);
bl[100]=nx[100]-(tBox.width/2+10*sfac[100]);
br[100]=nx[100]+(tBox.width/2+10*sfac[100]);
var nwidth = br[100]-bl[100]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[100] = bl[100] - delta; 
    br[100] = br[100] + delta; 
} 
bb[100] = bb[100]+20; 
rect=paper.rect(bl[100], bt[100], br[100]-bl[100], bb[100]-bt[100], 10*sfac[100]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[100]-42,bb[100]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[100]-18,bb[100]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[100]+5,bb[100]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[100]+25,bb[100]-25,20,20); 
t.toFront(); 
b[100]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[101],ny[101]-10,'The SI System of\nMeasurement').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[101]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-SI-System-of-Measurement/#The SI System of Measurement", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[101]=ny[101]-10-(tBox.height/2+10*sfac[101]);
bb[101]=ny[101]-10+(tBox.height/2+10*sfac[101]);
bl[101]=nx[101]-(tBox.width/2+10*sfac[101]);
br[101]=nx[101]+(tBox.width/2+10*sfac[101]);
var nwidth = br[101]-bl[101]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[101] = bl[101] - delta; 
    br[101] = br[101] + delta; 
} 
bb[101] = bb[101]+20; 
rect=paper.rect(bl[101], bt[101], br[101]-bl[101], bb[101]-bt[101], 10*sfac[101]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[101]-42,bb[101]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[101]-18,bb[101]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[101]+5,bb[101]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[101]+25,bb[101]-25,20,20); 
t.toFront(); 
b[101]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[102],ny[102]-10,'The Geometrical Arrangement\nof Electrons and Molecular Shape').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[102]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Geometrical-Arrangement-of-Electrons-and-Molecular-Shape/#The Geometrical Arrangement of Electrons and Molecular Shape", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[102]=ny[102]-10-(tBox.height/2+10*sfac[102]);
bb[102]=ny[102]-10+(tBox.height/2+10*sfac[102]);
bl[102]=nx[102]-(tBox.width/2+10*sfac[102]);
br[102]=nx[102]+(tBox.width/2+10*sfac[102]);
var nwidth = br[102]-bl[102]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[102] = bl[102] - delta; 
    br[102] = br[102] + delta; 
} 
bb[102] = bb[102]+20; 
rect=paper.rect(bl[102], bt[102], br[102]-bl[102], bb[102]-bt[102], 10*sfac[102]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[102]-42,bb[102]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[102]-18,bb[102]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[102]+5,bb[102]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[102]+25,bb[102]-25,20,20); 
t.toFront(); 
b[102]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[103],ny[103]-10,'Evaluating Measurements').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[103]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Evaluating-Measurements/#Evaluating Measurements", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[103]=ny[103]-10-(tBox.height/2+10*sfac[103]);
bb[103]=ny[103]-10+(tBox.height/2+10*sfac[103]);
bl[103]=nx[103]-(tBox.width/2+10*sfac[103]);
br[103]=nx[103]+(tBox.width/2+10*sfac[103]);
var nwidth = br[103]-bl[103]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[103] = bl[103] - delta; 
    br[103] = br[103] + delta; 
} 
bb[103] = bb[103]+20; 
rect=paper.rect(bl[103], bt[103], br[103]-bl[103], bb[103]-bt[103], 10*sfac[103]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[103]-42,bb[103]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[103]-18,bb[103]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[103]+5,bb[103]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[103]+25,bb[103]-25,20,20); 
t.toFront(); 
b[103]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[104],ny[104]-10,'Gas Laws').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[104]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Gas-Laws/#Gas Laws", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[104]=ny[104]-10-(tBox.height/2+10*sfac[104]);
bb[104]=ny[104]-10+(tBox.height/2+10*sfac[104]);
bl[104]=nx[104]-(tBox.width/2+10*sfac[104]);
br[104]=nx[104]+(tBox.width/2+10*sfac[104]);
var nwidth = br[104]-bl[104]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[104] = bl[104] - delta; 
    br[104] = br[104] + delta; 
} 
bb[104] = bb[104]+20; 
rect=paper.rect(bl[104], bt[104], br[104]-bl[104], bb[104]-bt[104], 10*sfac[104]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[104]-42,bb[104]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[104]-18,bb[104]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[104]+5,bb[104]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[104]+25,bb[104]-25,20,20); 
t.toFront(); 
b[104]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[105],ny[105]-10,'Biochemical Molecules').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[105]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Biochemical-Molecules/#Biochemical Molecules", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[105]=ny[105]-10-(tBox.height/2+10*sfac[105]);
bb[105]=ny[105]-10+(tBox.height/2+10*sfac[105]);
bl[105]=nx[105]-(tBox.width/2+10*sfac[105]);
br[105]=nx[105]+(tBox.width/2+10*sfac[105]);
var nwidth = br[105]-bl[105]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[105] = bl[105] - delta; 
    br[105] = br[105] + delta; 
} 
bb[105] = bb[105]+20; 
rect=paper.rect(bl[105], bt[105], br[105]-bl[105], bb[105]-bt[105], 10*sfac[105]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[105]-42,bb[105]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[105]-18,bb[105]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[105]+5,bb[105]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[105]+25,bb[105]-25,20,20); 
t.toFront(); 
b[105]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[106],ny[106]-10,'Types of Reactions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[106]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Types-of-Reactions/#Types of Reactions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[106]=ny[106]-10-(tBox.height/2+10*sfac[106]);
bb[106]=ny[106]-10+(tBox.height/2+10*sfac[106]);
bl[106]=nx[106]-(tBox.width/2+10*sfac[106]);
br[106]=nx[106]+(tBox.width/2+10*sfac[106]);
var nwidth = br[106]-bl[106]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[106] = bl[106] - delta; 
    br[106] = br[106] + delta; 
} 
bb[106] = bb[106]+20; 
rect=paper.rect(bl[106], bt[106], br[106]-bl[106], bb[106]-bt[106], 10*sfac[106]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[106]-42,bb[106]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[106]-18,bb[106]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[106]+5,bb[106]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[106]+25,bb[106]-25,20,20); 
t.toFront(); 
b[106]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[107],ny[107]-10,'Electron Arrangement').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[107]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Electron-Arrangement/#Electron Arrangement", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[107]=ny[107]-10-(tBox.height/2+10*sfac[107]);
bb[107]=ny[107]-10+(tBox.height/2+10*sfac[107]);
bl[107]=nx[107]-(tBox.width/2+10*sfac[107]);
br[107]=nx[107]+(tBox.width/2+10*sfac[107]);
var nwidth = br[107]-bl[107]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[107] = bl[107] - delta; 
    br[107] = br[107] + delta; 
} 
bb[107] = bb[107]+20; 
rect=paper.rect(bl[107], bt[107], br[107]-bl[107], bb[107]-bt[107], 10*sfac[107]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[107]-42,bb[107]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[107]-18,bb[107]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[107]+5,bb[107]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[107]+25,bb[107]-25,20,20); 
t.toFront(); 
b[107]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[108],ny[108]-10,'Solubility Graphs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[108]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Solubility-Graphs/#Solubility Graphs", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[108]=ny[108]-10-(tBox.height/2+10*sfac[108]);
bb[108]=ny[108]-10+(tBox.height/2+10*sfac[108]);
bl[108]=nx[108]-(tBox.width/2+10*sfac[108]);
br[108]=nx[108]+(tBox.width/2+10*sfac[108]);
var nwidth = br[108]-bl[108]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[108] = bl[108] - delta; 
    br[108] = br[108] + delta; 
} 
bb[108] = bb[108]+20; 
rect=paper.rect(bl[108], bt[108], br[108]-bl[108], bb[108]-bt[108], 10*sfac[108]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[108]-42,bb[108]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[108]-18,bb[108]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[108]+5,bb[108]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[108]+25,bb[108]-25,20,20); 
t.toFront(); 
b[108]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[109],ny[109]-10,'Strengths of Acids and Bases').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[109]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Strength-of-Acids-and-Bases/#Strengths of Acids and Bases", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[109]=ny[109]-10-(tBox.height/2+10*sfac[109]);
bb[109]=ny[109]-10+(tBox.height/2+10*sfac[109]);
bl[109]=nx[109]-(tBox.width/2+10*sfac[109]);
br[109]=nx[109]+(tBox.width/2+10*sfac[109]);
var nwidth = br[109]-bl[109]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[109] = bl[109] - delta; 
    br[109] = br[109] + delta; 
} 
bb[109] = bb[109]+20; 
rect=paper.rect(bl[109], bt[109], br[109]-bl[109], bb[109]-bt[109], 10*sfac[109]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[109]-42,bb[109]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[109]-18,bb[109]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[109]+5,bb[109]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[109]+25,bb[109]-25,20,20); 
t.toFront(); 
b[109]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[110],ny[110],'Solutions and Their\nBehavior').attr({fill:"#666666","font-size": 14*sfac[110]});
tBox=t.getBBox(); 
bt[110]=ny[110]-(tBox.height/2+10*sfac[110]);
bb[110]=ny[110]+(tBox.height/2+10*sfac[110]);
bl[110]=nx[110]-(tBox.width/2+10*sfac[110]);
br[110]=nx[110]+(tBox.width/2+10*sfac[110]);
rect=paper.rect(bl[110], bt[110], br[110]-bl[110], bb[110]-bt[110], 10*sfac[110]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[110]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[111],ny[111]-10,'Graphing').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[111]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphing/#Graphing", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[111]=ny[111]-10-(tBox.height/2+10*sfac[111]);
bb[111]=ny[111]-10+(tBox.height/2+10*sfac[111]);
bl[111]=nx[111]-(tBox.width/2+10*sfac[111]);
br[111]=nx[111]+(tBox.width/2+10*sfac[111]);
var nwidth = br[111]-bl[111]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[111] = bl[111] - delta; 
    br[111] = br[111] + delta; 
} 
bb[111] = bb[111]+20; 
rect=paper.rect(bl[111], bt[111], br[111]-bl[111], bb[111]-bt[111], 10*sfac[111]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[111]-42,bb[111]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[111]-18,bb[111]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[111]+5,bb[111]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[111]+25,bb[111]-25,20,20); 
t.toFront(); 
b[111]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[112],ny[112]-10,'Solution Formation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[112]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Solution-Formation/#Solution Formation", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[112]=ny[112]-10-(tBox.height/2+10*sfac[112]);
bb[112]=ny[112]-10+(tBox.height/2+10*sfac[112]);
bl[112]=nx[112]-(tBox.width/2+10*sfac[112]);
br[112]=nx[112]+(tBox.width/2+10*sfac[112]);
var nwidth = br[112]-bl[112]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[112] = bl[112] - delta; 
    br[112] = br[112] + delta; 
} 
bb[112] = bb[112]+20; 
rect=paper.rect(bl[112], bt[112], br[112]-bl[112], bb[112]-bt[112], 10*sfac[112]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[112]-42,bb[112]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[112]-18,bb[112]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[112]+5,bb[112]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[112]+25,bb[112]-25,20,20); 
t.toFront(); 
b[112]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[113],ny[113]-10,'Ions and Ion Formation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[113]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ions-and-Ion-Formation/#Ions and Ion Formation", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[113]=ny[113]-10-(tBox.height/2+10*sfac[113]);
bb[113]=ny[113]-10+(tBox.height/2+10*sfac[113]);
bl[113]=nx[113]-(tBox.width/2+10*sfac[113]);
br[113]=nx[113]+(tBox.width/2+10*sfac[113]);
var nwidth = br[113]-bl[113]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[113] = bl[113] - delta; 
    br[113] = br[113] + delta; 
} 
bb[113] = bb[113]+20; 
rect=paper.rect(bl[113], bt[113], br[113]-bl[113], bb[113]-bt[113], 10*sfac[113]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[113]-42,bb[113]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[113]-18,bb[113]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[113]+5,bb[113]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[113]+25,bb[113]-25,20,20); 
t.toFront(); 
b[113]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[114],ny[114]-10,'Applications of Nuclear Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[114]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Applications-of-Nuclear-Energy/#Applications of Nuclear Energy", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[114]=ny[114]-10-(tBox.height/2+10*sfac[114]);
bb[114]=ny[114]-10+(tBox.height/2+10*sfac[114]);
bl[114]=nx[114]-(tBox.width/2+10*sfac[114]);
br[114]=nx[114]+(tBox.width/2+10*sfac[114]);
var nwidth = br[114]-bl[114]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[114] = bl[114] - delta; 
    br[114] = br[114] + delta; 
} 
bb[114] = bb[114]+20; 
rect=paper.rect(bl[114], bt[114], br[114]-bl[114], bb[114]-bt[114], 10*sfac[114]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[114]-42,bb[114]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[114]-18,bb[114]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[114]+5,bb[114]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[114]+25,bb[114]-25,20,20); 
t.toFront(); 
b[114]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[115],ny[115],'Covalent Bonds\nand Formulas').attr({fill:"#666666","font-size": 14*sfac[115]});
tBox=t.getBBox(); 
bt[115]=ny[115]-(tBox.height/2+10*sfac[115]);
bb[115]=ny[115]+(tBox.height/2+10*sfac[115]);
bl[115]=nx[115]-(tBox.width/2+10*sfac[115]);
br[115]=nx[115]+(tBox.width/2+10*sfac[115]);
rect=paper.rect(bl[115], bt[115], br[115]-bl[115], bb[115]-bt[115], 10*sfac[115]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[115]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[116],ny[116]-10,'Reactions Between Ions\nin Solutions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[116]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reactions-Between-Ions-in-Solutions/#Reactions Between Ions in Solutions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[116]=ny[116]-10-(tBox.height/2+10*sfac[116]);
bb[116]=ny[116]-10+(tBox.height/2+10*sfac[116]);
bl[116]=nx[116]-(tBox.width/2+10*sfac[116]);
br[116]=nx[116]+(tBox.width/2+10*sfac[116]);
var nwidth = br[116]-bl[116]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[116] = bl[116] - delta; 
    br[116] = br[116] + delta; 
} 
bb[116] = bb[116]+20; 
rect=paper.rect(bl[116], bt[116], br[116]-bl[116], bb[116]-bt[116], 10*sfac[116]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[116]-42,bb[116]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[116]-18,bb[116]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[116]+5,bb[116]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[116]+25,bb[116]-25,20,20); 
t.toFront(); 
b[116]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[117],ny[117]-10,'The Mole').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[117]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Mole/#The Mole", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[117]=ny[117]-10-(tBox.height/2+10*sfac[117]);
bb[117]=ny[117]-10+(tBox.height/2+10*sfac[117]);
bl[117]=nx[117]-(tBox.width/2+10*sfac[117]);
br[117]=nx[117]+(tBox.width/2+10*sfac[117]);
var nwidth = br[117]-bl[117]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[117] = bl[117] - delta; 
    br[117] = br[117] + delta; 
} 
bb[117] = bb[117]+20; 
rect=paper.rect(bl[117], bt[117], br[117]-bl[117], bb[117]-bt[117], 10*sfac[117]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[117]-42,bb[117]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[117]-18,bb[117]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[117]+5,bb[117]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[117]+25,bb[117]-25,20,20); 
t.toFront(); 
b[117]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[118],ny[118]-10,'Percent Yield').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[118]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Percent-Yield/#Percent Yield", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[118]=ny[118]-10-(tBox.height/2+10*sfac[118]);
bb[118]=ny[118]-10+(tBox.height/2+10*sfac[118]);
bl[118]=nx[118]-(tBox.width/2+10*sfac[118]);
br[118]=nx[118]+(tBox.width/2+10*sfac[118]);
var nwidth = br[118]-bl[118]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[118] = bl[118] - delta; 
    br[118] = br[118] + delta; 
} 
bb[118] = bb[118]+20; 
rect=paper.rect(bl[118], bt[118], br[118]-bl[118], bb[118]-bt[118], 10*sfac[118]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[118]-42,bb[118]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[118]-18,bb[118]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[118]+5,bb[118]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[118]+25,bb[118]-25,20,20); 
t.toFront(); 
b[118]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[119],ny[119]-10,'Arrhenius Acids and Bases').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[119]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Arrhenius-Acids-and-Bases/#Arrhenius Acids and Bases", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[119]=ny[119]-10-(tBox.height/2+10*sfac[119]);
bb[119]=ny[119]-10+(tBox.height/2+10*sfac[119]);
bl[119]=nx[119]-(tBox.width/2+10*sfac[119]);
br[119]=nx[119]+(tBox.width/2+10*sfac[119]);
var nwidth = br[119]-bl[119]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[119] = bl[119] - delta; 
    br[119] = br[119] + delta; 
} 
bb[119] = bb[119]+20; 
rect=paper.rect(bl[119], bt[119], br[119]-bl[119], bb[119]-bt[119], 10*sfac[119]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[119]-42,bb[119]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[119]-18,bb[119]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[119]+5,bb[119]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[119]+25,bb[119]-25,20,20); 
t.toFront(); 
b[119]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[120],ny[120]-10,'Molar Volume').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[120]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Molar-Volume/#Molar Volume", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[120]=ny[120]-10-(tBox.height/2+10*sfac[120]);
bb[120]=ny[120]-10+(tBox.height/2+10*sfac[120]);
bl[120]=nx[120]-(tBox.width/2+10*sfac[120]);
br[120]=nx[120]+(tBox.width/2+10*sfac[120]);
var nwidth = br[120]-bl[120]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[120] = bl[120] - delta; 
    br[120] = br[120] + delta; 
} 
bb[120] = bb[120]+20; 
rect=paper.rect(bl[120], bt[120], br[120]-bl[120], bb[120]-bt[120], 10*sfac[120]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[120]-42,bb[120]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[120]-18,bb[120]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[120]+5,bb[120]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[120]+25,bb[120]-25,20,20); 
t.toFront(); 
b[120]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[121],ny[121],'The Mole Concept').attr({fill:"#666666","font-size": 14*sfac[121]});
tBox=t.getBBox(); 
bt[121]=ny[121]-(tBox.height/2+10*sfac[121]);
bb[121]=ny[121]+(tBox.height/2+10*sfac[121]);
bl[121]=nx[121]-(tBox.width/2+10*sfac[121]);
br[121]=nx[121]+(tBox.width/2+10*sfac[121]);
rect=paper.rect(bl[121], bt[121], br[121]-bl[121], bb[121]-bt[121], 10*sfac[121]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[121]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[122],ny[122]-10,'Properties of Acids\nand Bases').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[122]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-of-Acids-and-Bases/#Properties of Acids and Bases", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[122]=ny[122]-10-(tBox.height/2+10*sfac[122]);
bb[122]=ny[122]-10+(tBox.height/2+10*sfac[122]);
bl[122]=nx[122]-(tBox.width/2+10*sfac[122]);
br[122]=nx[122]+(tBox.width/2+10*sfac[122]);
var nwidth = br[122]-bl[122]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[122] = bl[122] - delta; 
    br[122] = br[122] + delta; 
} 
bb[122] = bb[122]+20; 
rect=paper.rect(bl[122], bt[122], br[122]-bl[122], bb[122]-bt[122], 10*sfac[122]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[122]-42,bb[122]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[122]-18,bb[122]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[122]+5,bb[122]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[122]+25,bb[122]-25,20,20); 
t.toFront(); 
b[122]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[123],ny[123]-10,'Further Understanding\nof the Atom').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[123]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Further-Understanding-of-the-Atom/#Further Understanding of the Atom", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[123]=ny[123]-10-(tBox.height/2+10*sfac[123]);
bb[123]=ny[123]-10+(tBox.height/2+10*sfac[123]);
bl[123]=nx[123]-(tBox.width/2+10*sfac[123]);
br[123]=nx[123]+(tBox.width/2+10*sfac[123]);
var nwidth = br[123]-bl[123]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[123] = bl[123] - delta; 
    br[123] = br[123] + delta; 
} 
bb[123] = bb[123]+20; 
rect=paper.rect(bl[123], bt[123], br[123]-bl[123], bb[123]-bt[123], 10*sfac[123]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[123]-42,bb[123]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[123]-18,bb[123]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[123]+5,bb[123]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[123]+25,bb[123]-25,20,20); 
t.toFront(); 
b[123]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[124],ny[124],'Chemistry').attr({fill:"#000000","font-size": 24*sfac[124]});
tBox=t.getBBox(); 
bt[124]=ny[124]-(tBox.height/2+10*sfac[124]);
bb[124]=ny[124]+(tBox.height/2+10*sfac[124]);
bl[124]=nx[124]-(tBox.width/2+10*sfac[124]);
br[124]=nx[124]+(tBox.width/2+10*sfac[124]);
rect=paper.rect(bl[124], bt[124], br[124]-bl[124], bb[124]-bt[124], 10*sfac[124]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[124]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[125],ny[125]-10,'Factors Affecting\nSolubility').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[125]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Factors-Affecting-Solubility/#Factors Affecting Solubility", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[125]=ny[125]-10-(tBox.height/2+10*sfac[125]);
bb[125]=ny[125]-10+(tBox.height/2+10*sfac[125]);
bl[125]=nx[125]-(tBox.width/2+10*sfac[125]);
br[125]=nx[125]+(tBox.width/2+10*sfac[125]);
var nwidth = br[125]-bl[125]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[125] = bl[125] - delta; 
    br[125] = br[125] + delta; 
} 
bb[125] = bb[125]+20; 
rect=paper.rect(bl[125], bt[125], br[125]-bl[125], bb[125]-bt[125], 10*sfac[125]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[125]-42,bb[125]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[125]-18,bb[125]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[125]+5,bb[125]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[125]+25,bb[125]-25,20,20); 
t.toFront(); 
b[125]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[126],ny[126]-10,'Balancing Chemical\nEquations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[126]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Balancing-Chemical-Equations/#Balancing Chemical Equations", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[126]=ny[126]-10-(tBox.height/2+10*sfac[126]);
bb[126]=ny[126]-10+(tBox.height/2+10*sfac[126]);
bl[126]=nx[126]-(tBox.width/2+10*sfac[126]);
br[126]=nx[126]+(tBox.width/2+10*sfac[126]);
var nwidth = br[126]-bl[126]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[126] = bl[126] - delta; 
    br[126] = br[126] + delta; 
} 
bb[126] = bb[126]+20; 
rect=paper.rect(bl[126], bt[126], br[126]-bl[126], bb[126]-bt[126], 10*sfac[126]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[126]-42,bb[126]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[126]-18,bb[126]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[126]+5,bb[126]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[126]+25,bb[126]-25,20,20); 
t.toFront(); 
b[126]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[127],ny[127]-10,'Making Observations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[127]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Making-Observations/#Making Observations", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[127]=ny[127]-10-(tBox.height/2+10*sfac[127]);
bb[127]=ny[127]-10+(tBox.height/2+10*sfac[127]);
bl[127]=nx[127]-(tBox.width/2+10*sfac[127]);
br[127]=nx[127]+(tBox.width/2+10*sfac[127]);
var nwidth = br[127]-bl[127]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[127] = bl[127] - delta; 
    br[127] = br[127] + delta; 
} 
bb[127] = bb[127]+20; 
rect=paper.rect(bl[127], bt[127], br[127]-bl[127], bb[127]-bt[127], 10*sfac[127]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[127]-42,bb[127]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[127]-18,bb[127]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[127]+5,bb[127]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[127]+25,bb[127]-25,20,20); 
t.toFront(); 
b[127]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[128],ny[128]-10,'The Atomic Theory').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[128]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Atomic-Theory/#The Atomic Theory", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[128]=ny[128]-10-(tBox.height/2+10*sfac[128]);
bb[128]=ny[128]-10+(tBox.height/2+10*sfac[128]);
bl[128]=nx[128]-(tBox.width/2+10*sfac[128]);
br[128]=nx[128]+(tBox.width/2+10*sfac[128]);
var nwidth = br[128]-bl[128]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[128] = bl[128] - delta; 
    br[128] = br[128] + delta; 
} 
bb[128] = bb[128]+20; 
rect=paper.rect(bl[128], bt[128], br[128]-bl[128], bb[128]-bt[128], 10*sfac[128]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[128]-42,bb[128]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[128]-18,bb[128]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[128]+5,bb[128]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[128]+25,bb[128]-25,20,20); 
t.toFront(); 
b[128]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[129],ny[129]-10,'Using Algebra in\nChemistry').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[129]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Using-Algebra-in-Chemistry/#Using Algebra in Chemistry", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[129]=ny[129]-10-(tBox.height/2+10*sfac[129]);
bb[129]=ny[129]-10+(tBox.height/2+10*sfac[129]);
bl[129]=nx[129]-(tBox.width/2+10*sfac[129]);
br[129]=nx[129]+(tBox.width/2+10*sfac[129]);
var nwidth = br[129]-bl[129]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[129] = bl[129] - delta; 
    br[129] = br[129] + delta; 
} 
bb[129] = bb[129]+20; 
rect=paper.rect(bl[129], bt[129], br[129]-bl[129], bb[129]-bt[129], 10*sfac[129]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[129]-42,bb[129]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[129]-18,bb[129]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[129]+5,bb[129]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[129]+25,bb[129]-25,20,20); 
t.toFront(); 
b[129]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[130],ny[130]-10,'Properties of Solutions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[130]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-of-Solutions/#Properties of Solutions", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[130]=ny[130]-10-(tBox.height/2+10*sfac[130]);
bb[130]=ny[130]-10+(tBox.height/2+10*sfac[130]);
bl[130]=nx[130]-(tBox.width/2+10*sfac[130]);
br[130]=nx[130]+(tBox.width/2+10*sfac[130]);
var nwidth = br[130]-bl[130]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[130] = bl[130] - delta; 
    br[130] = br[130] + delta; 
} 
bb[130] = bb[130]+20; 
rect=paper.rect(bl[130], bt[130], br[130]-bl[130], bb[130]-bt[130], 10*sfac[130]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[130]-42,bb[130]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[130]-18,bb[130]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[130]+5,bb[130]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[130]+25,bb[130]-25,20,20); 
t.toFront(); 
b[130]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[131],ny[131]-10,'Origin of the Term\nOxidation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[131]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Origin-of-the-Term-Oxidation/#Origin of the Term Oxidation", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[131]=ny[131]-10-(tBox.height/2+10*sfac[131]);
bb[131]=ny[131]-10+(tBox.height/2+10*sfac[131]);
bl[131]=nx[131]-(tBox.width/2+10*sfac[131]);
br[131]=nx[131]+(tBox.width/2+10*sfac[131]);
var nwidth = br[131]-bl[131]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[131] = bl[131] - delta; 
    br[131] = br[131] + delta; 
} 
bb[131] = bb[131]+20; 
rect=paper.rect(bl[131], bt[131], br[131]-bl[131], bb[131]-bt[131], 10*sfac[131]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[131]-42,bb[131]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[131]-18,bb[131]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[131]+5,bb[131]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[131]+25,bb[131]-25,20,20); 
t.toFront(); 
b[131]=paper.setFinish(); 

paper.setStart(); 
t=paper.text(nx[132],ny[132]-10,'Valence Electrons').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[132]});
t.mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Valence-Electrons/#Valence Electrons", target: "_top"});
}); 
t.mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t.getBBox(); 
bt[132]=ny[132]-10-(tBox.height/2+10*sfac[132]);
bb[132]=ny[132]-10+(tBox.height/2+10*sfac[132]);
bl[132]=nx[132]-(tBox.width/2+10*sfac[132]);
br[132]=nx[132]+(tBox.width/2+10*sfac[132]);
var nwidth = br[132]-bl[132]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[132] = bl[132] - delta; 
    br[132] = br[132] + delta; 
} 
bb[132] = bb[132]+20; 
rect=paper.rect(bl[132], bt[132], br[132]-bl[132], bb[132]-bt[132], 10*sfac[132]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
paper.image('/media/js/conceptmap/icons/video.png',nx[132]-42,bb[132]-25,20,20); 
paper.image('/media/js/conceptmap/icons/chalkboard.png',nx[132]-18,bb[132]-25,20,20); 
paper.image('/media/js/conceptmap/icons/book.png',nx[132]+5,bb[132]-25,20,20); 
paper.image('/media/js/conceptmap/icons/exercise.png',nx[132]+25,bb[132]-25,20,20); 
t.toFront(); 
b[132]=paper.setFinish(); 

bb[133]= ny[133]; 
bt[133]= ny[133]; 
bl[133]= nx[133]; 
br[133]= nx[133]; 

bb[134]= ny[134]; 
bt[134]= ny[134]; 
bl[134]= nx[134]; 
br[134]= nx[134]; 

bb[135]= ny[135]; 
bt[135]= ny[135]; 
bl[135]= nx[135]; 
br[135]= nx[135]; 

bb[136]= ny[136]; 
bt[136]= ny[136]; 
bl[136]= nx[136]; 
br[136]= nx[136]; 

bb[137]= ny[137]; 
bt[137]= ny[137]; 
bl[137]= nx[137]; 
br[137]= nx[137]; 

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
b[101].click(function() {recenter(101);}); 
b[102].click(function() {recenter(102);}); 
b[103].click(function() {recenter(103);}); 
b[104].click(function() {recenter(104);}); 
b[105].click(function() {recenter(105);}); 
b[106].click(function() {recenter(106);}); 
b[107].click(function() {recenter(107);}); 
b[108].click(function() {recenter(108);}); 
b[109].click(function() {recenter(109);}); 
b[110].click(function() {recenter(110);}); 
b[111].click(function() {recenter(111);}); 
b[112].click(function() {recenter(112);}); 
b[113].click(function() {recenter(113);}); 
b[114].click(function() {recenter(114);}); 
b[115].click(function() {recenter(115);}); 
b[116].click(function() {recenter(116);}); 
b[117].click(function() {recenter(117);}); 
b[118].click(function() {recenter(118);}); 
b[119].click(function() {recenter(119);}); 
b[120].click(function() {recenter(120);}); 
b[121].click(function() {recenter(121);}); 
b[122].click(function() {recenter(122);}); 
b[123].click(function() {recenter(123);}); 
b[124].click(function() {recenter(124);}); 
b[125].click(function() {recenter(125);}); 
b[126].click(function() {recenter(126);}); 
b[127].click(function() {recenter(127);}); 
b[128].click(function() {recenter(128);}); 
b[129].click(function() {recenter(129);}); 
b[130].click(function() {recenter(130);}); 
b[131].click(function() {recenter(131);}); 
b[132].click(function() {recenter(132);}); 
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
b[101].hover(function() {nodeHover(101);}, function() {nodeUnhover(101);}); 
b[102].hover(function() {nodeHover(102);}, function() {nodeUnhover(102);}); 
b[103].hover(function() {nodeHover(103);}, function() {nodeUnhover(103);}); 
b[104].hover(function() {nodeHover(104);}, function() {nodeUnhover(104);}); 
b[105].hover(function() {nodeHover(105);}, function() {nodeUnhover(105);}); 
b[106].hover(function() {nodeHover(106);}, function() {nodeUnhover(106);}); 
b[107].hover(function() {nodeHover(107);}, function() {nodeUnhover(107);}); 
b[108].hover(function() {nodeHover(108);}, function() {nodeUnhover(108);}); 
b[109].hover(function() {nodeHover(109);}, function() {nodeUnhover(109);}); 
b[110].hover(function() {nodeHover(110);}, function() {nodeUnhover(110);}); 
b[111].hover(function() {nodeHover(111);}, function() {nodeUnhover(111);}); 
b[112].hover(function() {nodeHover(112);}, function() {nodeUnhover(112);}); 
b[113].hover(function() {nodeHover(113);}, function() {nodeUnhover(113);}); 
b[114].hover(function() {nodeHover(114);}, function() {nodeUnhover(114);}); 
b[115].hover(function() {nodeHover(115);}, function() {nodeUnhover(115);}); 
b[116].hover(function() {nodeHover(116);}, function() {nodeUnhover(116);}); 
b[117].hover(function() {nodeHover(117);}, function() {nodeUnhover(117);}); 
b[118].hover(function() {nodeHover(118);}, function() {nodeUnhover(118);}); 
b[119].hover(function() {nodeHover(119);}, function() {nodeUnhover(119);}); 
b[120].hover(function() {nodeHover(120);}, function() {nodeUnhover(120);}); 
b[121].hover(function() {nodeHover(121);}, function() {nodeUnhover(121);}); 
b[122].hover(function() {nodeHover(122);}, function() {nodeUnhover(122);}); 
b[123].hover(function() {nodeHover(123);}, function() {nodeUnhover(123);}); 
b[124].hover(function() {nodeHover(124);}, function() {nodeUnhover(124);}); 
b[125].hover(function() {nodeHover(125);}, function() {nodeUnhover(125);}); 
b[126].hover(function() {nodeHover(126);}, function() {nodeUnhover(126);}); 
b[127].hover(function() {nodeHover(127);}, function() {nodeUnhover(127);}); 
b[128].hover(function() {nodeHover(128);}, function() {nodeUnhover(128);}); 
b[129].hover(function() {nodeHover(129);}, function() {nodeUnhover(129);}); 
b[130].hover(function() {nodeHover(130);}, function() {nodeUnhover(130);}); 
b[131].hover(function() {nodeHover(131);}, function() {nodeUnhover(131);}); 
b[132].hover(function() {nodeHover(132);}, function() {nodeUnhover(132);}); 
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
s1='M '+nx[0]+' '+bb[0]+' L '+nx[0]+' '+bt[19]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[0,19] ; 

paper.setStart(); 
s1='M '+nx[1]+' '+bb[1]+' L '+nx[1]+' '+bt[58]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[1,58] ; 

paper.setStart(); 
mid=bb[2]+(bt[106]-bb[2])/2; 
hleft = nx[126]; 
hright = nx[2]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[2]+' '+bb[2]+' L '+nx[2]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[126]+' '+mid+' L '+nx[126]+' '+bt[126];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[2,126]; 

paper.setStart(); 
mid=bb[2]+(bt[106]-bb[2])/2; 
hleft = nx[106]; 
hright = nx[2]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[106]+' '+mid+' L '+nx[106]+' '+bt[106];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[2,106]; 

paper.setStart(); 
s1='M '+nx[4]+' '+bb[4]+' L '+nx[4]+' '+bt[102]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[4,102] ; 

paper.setStart(); 
mid=bb[5]+(bt[66]-bb[5])/2; 
hleft = nx[95]; 
hright = nx[5]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[5]+' '+bb[5]+' L '+nx[5]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[95]+' '+mid+' L '+nx[95]+' '+bt[95];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[5,95]; 

paper.setStart(); 
mid=bb[5]+(bt[66]-bb[5])/2; 
s3='M '+nx[98]+' '+mid+' L '+nx[98]+' '+bt[98];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[5,98]; 

paper.setStart(); 
mid=bb[5]+(bt[66]-bb[5])/2; 
hleft = nx[66]; 
hright = nx[5]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[66]+' '+mid+' L '+nx[66]+' '+bt[66];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[5,66]; 

paper.setStart(); 
s1='M '+nx[6]+' '+bb[6]+' L '+nx[6]+' '+bt[76]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[6,76] ; 

paper.setStart(); 
mid=bb[8]+(bt[127]-bb[8])/2; 
hleft = nx[127]; 
hright = nx[8]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[8]+' '+bb[8]+' L '+nx[8]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[127]+' '+mid+' L '+nx[127]+' '+bt[127];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[8,127]; 

paper.setStart(); 
mid=bb[8]+(bt[127]-bb[8])/2; 
hleft = nx[43]; 
hright = nx[8]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[43]+' '+mid+' L '+nx[43]+' '+bt[43];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[8,43]; 

paper.setStart(); 
mid=bb[8]+(bt[127]-bb[8])/2; 
s3='M '+nx[49]+' '+mid+' L '+nx[49]+' '+bt[49];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[8,49]; 

paper.setStart(); 
s1='M '+nx[9]+' '+bb[9]+' L '+nx[9]+' '+bt[18]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[9,18] ; 

paper.setStart(); 
s1='M '+nx[10]+' '+bb[10]+' L '+nx[10]+' '+bt[105]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[10,105] ; 

paper.setStart(); 
mid=bb[11]+(bt[52]-bb[11])/2; 
hleft = nx[35]; 
hright = nx[11]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[11]+' '+bb[11]+' L '+nx[11]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[35]+' '+mid+' L '+nx[35]+' '+bt[35];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[11,35]; 

paper.setStart(); 
mid=bb[11]+(bt[52]-bb[11])/2; 
hleft = nx[52]; 
hright = nx[11]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[52]+' '+mid+' L '+nx[52]+' '+bt[52];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[11,52]; 

paper.setStart(); 
s1='M '+nx[12]+' '+bb[12]+' L '+nx[12]+' '+bt[100]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[12,100] ; 

paper.setStart(); 
s1='M '+nx[14]+' '+bb[14]+' L '+nx[14]+' '+ny[136]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[14],nx[136])+' '+ny[136]+' L '+Math.max(nx[14],nx[136])+' '+ny[136]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[14,136]; 

paper.setStart(); 
s1='M '+nx[15]+' '+bb[15]+' L '+nx[15]+' '+bt[85]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[15,85] ; 

paper.setStart(); 
mid=bb[16]+(bt[117]-bb[16])/2; 
hleft = nx[117]; 
hright = nx[16]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[16]+' '+bb[16]+' L '+nx[16]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[117]+' '+mid+' L '+nx[117]+' '+bt[117];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[16,117]; 

paper.setStart(); 
mid=bb[16]+(bt[117]-bb[16])/2; 
s3='M '+nx[30]+' '+mid+' L '+nx[30]+' '+bt[30];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[16,30]; 

paper.setStart(); 
mid=bb[16]+(bt[117]-bb[16])/2; 
hleft = nx[64]; 
hright = nx[16]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[64]+' '+mid+' L '+nx[64]+' '+bt[64];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[16,64]; 

paper.setStart(); 
mid=bb[17]+(bt[1]-bb[17])/2; 
hleft = nx[97]; 
hright = nx[17]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[17]+' '+bb[17]+' L '+nx[17]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[97]+' '+mid+' L '+nx[97]+' '+bt[97];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[17,97]; 

paper.setStart(); 
mid=bb[17]+(bt[1]-bb[17])/2; 
s3='M '+nx[84]+' '+mid+' L '+nx[84]+' '+bt[84];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[17,84]; 

paper.setStart(); 
mid=bb[17]+(bt[1]-bb[17])/2; 
hleft = nx[1]; 
hright = nx[17]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[1]+' '+mid+' L '+nx[1]+' '+bt[1];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[17,1]; 

paper.setStart(); 
s1='M '+nx[18]+' '+bb[18]+' L '+nx[18]+' '+bt[36]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[18,36] ; 

paper.setStart(); 
s1='M '+nx[19]+' '+bb[19]+' L '+nx[19]+' '+bt[50]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[19,50] ; 

paper.setStart(); 
s1='M '+nx[20]+' '+bb[20]+' L '+nx[20]+' '+bt[91]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[20,91] ; 

paper.setStart(); 
mid=bb[21]+(bt[22]-bb[21])/2; 
s2='M '+nx[21]+' '+bb[21]+' L '+nx[21]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[118]+' '+mid+' L '+nx[118]+' '+bt[118];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[21,118]; 

paper.setStart(); 
mid=bb[21]+(bt[22]-bb[21])/2; 
hleft = nx[22]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[22]+' '+mid+' L '+nx[22]+' '+bt[22];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[21,22]; 

paper.setStart(); 
mid=bb[21]+(bt[22]-bb[21])/2; 
hleft = nx[134]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[134]+' '+mid+' L '+nx[134]+' '+bt[134];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[21,134]; 

paper.setStart(); 
mid=bb[23]+(bt[70]-bb[23])/2; 
hleft = nx[37]; 
hright = nx[23]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[37]+' '+mid+' L '+nx[37]+' '+bt[37];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[23,37]; 

paper.setStart(); 
mid=bb[23]+(bt[70]-bb[23])/2; 
hleft = nx[70]; 
hright = nx[23]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[70]+' '+mid+' L '+nx[70]+' '+bt[70];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[23,70]; 

paper.setStart(); 
s1='M '+nx[24]+' '+bb[24]+' L '+nx[24]+' '+bt[68]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[24,68] ; 

paper.setStart(); 
mid=bb[26]+(bt[14]-bb[26])/2; 
s2='M '+nx[26]+' '+bb[26]+' L '+nx[26]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[77]+' '+mid+' L '+nx[77]+' '+bt[77];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[26,77]; 

paper.setStart(); 
mid=bb[26]+(bt[14]-bb[26])/2; 
hleft = nx[67]; 
hright = nx[26]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[67]+' '+mid+' L '+nx[67]+' '+bt[67];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[26,67]; 

paper.setStart(); 
mid=bb[26]+(bt[14]-bb[26])/2; 
s3='M '+nx[14]+' '+mid+' L '+nx[14]+' '+bt[14];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[26,14]; 

paper.setStart(); 
mid=bb[26]+(bt[14]-bb[26])/2; 
hleft = nx[78]; 
hright = nx[26]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[78]+' '+mid+' L '+nx[78]+' '+bt[78];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[26,78]; 

paper.setStart(); 
s1='M '+nx[27]+' '+bb[27]+' L '+nx[27]+' '+bt[69]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[27,69] ; 

paper.setStart(); 
s1='M '+nx[28]+' '+bb[28]+' L '+nx[28]+' '+bt[131]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[28,131] ; 

paper.setStart(); 
mid=bb[29]+(bt[33]-bb[29])/2; 
hleft = nx[135]; 
hright = nx[29]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[29]+' '+bb[29]+' L '+nx[29]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[135]+' '+mid+' L '+nx[135]+' '+bt[135];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[29,135]; 

paper.setStart(); 
mid=bb[29]+(bt[33]-bb[29])/2; 
hleft = nx[4]; 
hright = nx[29]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[4]+' '+mid+' L '+nx[4]+' '+bt[4];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[29,4]; 

paper.setStart(); 
mid=bb[29]+(bt[33]-bb[29])/2; 
s3='M '+nx[33]+' '+mid+' L '+nx[33]+' '+bt[33];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[29,33]; 

paper.setStart(); 
s1='M '+nx[31]+' '+bb[31]+' L '+nx[31]+' '+bt[72]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[31,72] ; 

paper.setStart(); 
s1='M '+nx[32]+' '+bb[32]+' L '+nx[32]+' '+bt[6]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[32,6] ; 

paper.setStart(); 
mid=bb[34]+(bt[87]-bb[34])/2; 
s2='M '+nx[34]+' '+bb[34]+' L '+nx[34]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[81]+' '+mid+' L '+nx[81]+' '+bt[81];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[34,81]; 

paper.setStart(); 
mid=bb[34]+(bt[87]-bb[34])/2; 
hleft = nx[9]; 
hright = nx[34]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[9]+' '+mid+' L '+nx[9]+' '+bt[9];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[34,9]; 

paper.setStart(); 
mid=bb[34]+(bt[87]-bb[34])/2; 
s3='M '+nx[83]+' '+mid+' L '+nx[83]+' '+bt[83];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[34,83]; 

paper.setStart(); 
mid=bb[34]+(bt[87]-bb[34])/2; 
s3='M '+nx[28]+' '+mid+' L '+nx[28]+' '+bt[28];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[34,28]; 

paper.setStart(); 
mid=bb[34]+(bt[87]-bb[34])/2; 
hleft = nx[87]; 
hright = nx[34]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[87]+' '+mid+' L '+nx[87]+' '+bt[87];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[49]=paper.setFinish(); 
lineNodes[49]=[34,87]; 

paper.setStart(); 
mid=bb[34]+(bt[87]-bb[34])/2; 
s3='M '+nx[54]+' '+mid+' L '+nx[54]+' '+bt[54];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[34,54]; 

paper.setStart(); 
mid=bb[34]+(bt[87]-bb[34])/2; 
s3='M '+nx[45]+' '+mid+' L '+nx[45]+' '+bt[45];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[34,45]; 

paper.setStart(); 
s1='M '+nx[35]+' '+bb[35]+' L '+nx[35]+' '+bt[107]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[35,107] ; 

paper.setStart(); 
s1='M '+nx[36]+' '+bb[36]+' L '+nx[36]+' '+bt[23]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[36,23] ; 

paper.setStart(); 
s1='M '+nx[37]+' '+bb[37]+' L '+nx[37]+' '+bt[122]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[37,122] ; 

paper.setStart(); 
s1='M '+nx[39]+' '+bb[39]+' L '+nx[39]+' '+bt[2]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[39,2] ; 

paper.setStart(); 
mid=bb[40]+(bt[44]-bb[40])/2; 
s2='M '+nx[40]+' '+bb[40]+' L '+nx[40]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[44]+' '+mid+' L '+nx[44]+' '+bt[44];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[40,44]; 

paper.setStart(); 
mid=bb[40]+(bt[44]-bb[40])/2; 
hleft = nx[75]; 
hright = nx[40]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[75]+' '+mid+' L '+nx[75]+' '+bt[75];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[40,75]; 

paper.setStart(); 
mid=bb[40]+(bt[44]-bb[40])/2; 
hleft = nx[57]; 
hright = nx[40]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[57]+' '+mid+' L '+nx[57]+' '+bt[57];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[40,57]; 

paper.setStart(); 
mid=bb[41]+(bt[93]-bb[41])/2; 
hleft = nx[93]; 
hright = nx[41]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[41]+' '+bb[41]+' L '+nx[41]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[93]+' '+mid+' L '+nx[93]+' '+bt[93];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[41,93]; 

paper.setStart(); 
mid=bb[41]+(bt[93]-bb[41])/2; 
hleft = nx[74]; 
hright = nx[41]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[74]+' '+mid+' L '+nx[74]+' '+bt[74];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[41,74]; 

paper.setStart(); 
s1='M '+nx[42]+' '+bb[42]+' L '+nx[42]+' '+bt[46]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[42,46] ; 

paper.setStart(); 
s1='M '+nx[43]+' '+bb[43]+' L '+nx[43]+' '+bt[129]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[43,129] ; 

paper.setStart(); 
s1='M '+nx[45]+' '+bb[45]+' L '+nx[45]+' '+bt[17]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[45,17] ; 

paper.setStart(); 
mid=bb[46]+(bt[53]-bb[46])/2; 
hleft = nx[53]; 
hright = nx[46]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[46]+' '+bb[46]+' L '+nx[46]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[53]+' '+mid+' L '+nx[53]+' '+bt[53];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[46,53]; 

paper.setStart(); 
mid=bb[46]+(bt[53]-bb[46])/2; 
hleft = nx[104]; 
hright = nx[46]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[104]+' '+mid+' L '+nx[104]+' '+bt[104];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[46,104]; 

paper.setStart(); 
s1='M '+nx[47]+' '+bb[47]+' L '+nx[47]+' '+bt[88]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[47,88] ; 

paper.setStart(); 
s1='M '+nx[48]+' '+bb[48]+' L '+nx[48]+' '+bt[42]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[48,42] ; 

paper.setStart(); 
s1='M '+nx[49]+' '+bb[49]+' L '+nx[49]+' '+bt[101]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[49,101] ; 

paper.setStart(); 
s1='M '+nx[50]+' '+bb[50]+' L '+nx[50]+' '+bt[128]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[69]=paper.setFinish(); 
lineNodes[69]=[50,128] ; 

paper.setStart(); 
mid=bb[52]+(bt[56]-bb[52])/2; 
hleft = nx[31]; 
hright = nx[52]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[52]+' '+bb[52]+' L '+nx[52]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[31]+' '+mid+' L '+nx[31]+' '+bt[31];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[70]=paper.setFinish(); 
lineNodes[70]=[52,31]; 

paper.setStart(); 
mid=bb[52]+(bt[56]-bb[52])/2; 
hleft = nx[56]; 
hright = nx[52]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[56]+' '+mid+' L '+nx[56]+' '+bt[56];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[71]=paper.setFinish(); 
lineNodes[71]=[52,56]; 

paper.setStart(); 
s1='M '+nx[53]+' '+bb[53]+' L '+nx[53]+' '+bt[120]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[72]=paper.setFinish(); 
lineNodes[72]=[53,120] ; 

paper.setStart(); 
s1='M '+nx[54]+' '+bb[54]+' L '+nx[54]+' '+bt[41]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[73]=paper.setFinish(); 
lineNodes[73]=[54,41] ; 

paper.setStart(); 
s1='M '+nx[55]+' '+bb[55]+' L '+nx[55]+' '+bt[15]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[74]=paper.setFinish(); 
lineNodes[74]=[55,15] ; 

paper.setStart(); 
s1='M '+nx[59]+' '+bb[59]+' L '+nx[59]+' '+bt[21]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[75]=paper.setFinish(); 
lineNodes[75]=[59,21] ; 

paper.setStart(); 
s1='M '+nx[60]+' '+bb[60]+' L '+nx[60]+' '+bt[109]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[76]=paper.setFinish(); 
lineNodes[76]=[60,109] ; 

paper.setStart(); 
s1='M '+nx[62]+' '+bb[62]+' L '+nx[62]+' '+bt[113]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[77]=paper.setFinish(); 
lineNodes[77]=[62,113] ; 

paper.setStart(); 
s1='M '+nx[65]+' '+bb[65]+' L '+nx[65]+' '+bt[5]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[78]=paper.setFinish(); 
lineNodes[78]=[65,5] ; 

paper.setStart(); 
s1='M '+nx[67]+' '+bb[67]+' L '+nx[67]+' '+ny[133]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[67],nx[133])+' '+ny[133]+' L '+Math.max(nx[67],nx[133])+' '+ny[133]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[79]=paper.setFinish(); 
lineNodes[79]=[67,133]; 

paper.setStart(); 
s1='M '+nx[68]+' '+bb[68]+' L '+nx[68]+' '+bt[12]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[80]=paper.setFinish(); 
lineNodes[80]=[68,12] ; 

paper.setStart(); 
s1='M '+nx[69]+' '+bb[69]+' L '+nx[69]+' '+bt[96]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[81]=paper.setFinish(); 
lineNodes[81]=[69,96] ; 

paper.setStart(); 
mid=bb[70]+(bt[61]-bb[70])/2; 
hleft = nx[13]; 
hright = nx[70]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[70]+' '+bb[70]+' L '+nx[70]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[13]+' '+mid+' L '+nx[13]+' '+bt[13];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[82]=paper.setFinish(); 
lineNodes[82]=[70,13]; 

paper.setStart(); 
mid=bb[70]+(bt[61]-bb[70])/2; 
hleft = nx[61]; 
hright = nx[70]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[61]+' '+mid+' L '+nx[61]+' '+bt[61];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[83]=paper.setFinish(); 
lineNodes[83]=[70,61]; 

paper.setStart(); 
s1='M '+nx[73]+' '+bb[73]+' L '+nx[73]+' '+bt[80]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[84]=paper.setFinish(); 
lineNodes[84]=[73,80] ; 

paper.setStart(); 
s1='M '+nx[74]+' '+bb[74]+' L '+nx[74]+' '+bt[82]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[85]=paper.setFinish(); 
lineNodes[85]=[74,82] ; 

paper.setStart(); 
s1='M '+nx[77]+' '+bb[77]+' L '+nx[77]+' '+ny[133]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[77],nx[133])+' '+ny[133]+' L '+Math.max(nx[77],nx[133])+' '+ny[133]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[86]=paper.setFinish(); 
lineNodes[86]=[77,133]; 

paper.setStart(); 
s1='M '+nx[78]+' '+bb[78]+' L '+nx[78]+' '+ny[136]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[78],nx[136])+' '+ny[136]+' L '+Math.max(nx[78],nx[136])+' '+ny[136]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[87]=paper.setFinish(); 
lineNodes[87]=[78,136]; 

paper.setStart(); 
s1='M '+nx[79]+' '+bb[79]+' L '+nx[79]+' '+bt[24]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[88]=paper.setFinish(); 
lineNodes[88]=[79,24] ; 

paper.setStart(); 
s1='M '+nx[80]+' '+bb[80]+' L '+nx[80]+' '+bt[0]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[89]=paper.setFinish(); 
lineNodes[89]=[80,0] ; 

paper.setStart(); 
mid=bb[82]+(bt[94]-bb[82])/2; 
hleft = nx[114]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[82]+' '+bb[82]+' L '+nx[82]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[114]+' '+mid+' L '+nx[114]+' '+bt[114];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[90]=paper.setFinish(); 
lineNodes[90]=[82,114]; 

paper.setStart(); 
mid=bb[82]+(bt[94]-bb[82])/2; 
hleft = nx[99]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[99]+' '+mid+' L '+nx[99]+' '+bt[99];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[91]=paper.setFinish(); 
lineNodes[91]=[82,99]; 

paper.setStart(); 
mid=bb[82]+(bt[94]-bb[82])/2; 
s3='M '+nx[94]+' '+mid+' L '+nx[94]+' '+bt[94];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[92]=paper.setFinish(); 
lineNodes[92]=[82,94]; 

paper.setStart(); 
s1='M '+nx[85]+' '+bb[85]+' L '+nx[85]+' '+bt[10]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[93]=paper.setFinish(); 
lineNodes[93]=[85,10] ; 

paper.setStart(); 
s1='M '+nx[86]+' '+bb[86]+' L '+nx[86]+' '+bt[27]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[94]=paper.setFinish(); 
lineNodes[94]=[86,27] ; 

paper.setStart(); 
s1='M '+nx[87]+' '+bb[87]+' L '+nx[87]+' '+bt[55]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[95]=paper.setFinish(); 
lineNodes[95]=[87,55] ; 

paper.setStart(); 
s1='M '+nx[88]+' '+bb[88]+' L '+nx[88]+' '+bt[65]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[96]=paper.setFinish(); 
lineNodes[96]=[88,65] ; 

paper.setStart(); 
mid=bb[90]+(bt[135]-bb[90])/2; 
hleft = nx[25]; 
hright = nx[90]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[90]+' '+bb[90]+' L '+nx[90]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[25]+' '+mid+' L '+nx[25]+' '+bt[25];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[97]=paper.setFinish(); 
lineNodes[97]=[90,25]; 

paper.setStart(); 
mid=bb[90]+(bt[135]-bb[90])/2; 
hleft = nx[135]; 
hright = nx[90]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[135]+' '+mid+' L '+nx[135]+' '+bt[135];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[98]=paper.setFinish(); 
lineNodes[98]=[90,135]; 

paper.setStart(); 
mid=bb[90]+(bt[135]-bb[90])/2; 
s3='M '+nx[71]+' '+mid+' L '+nx[71]+' '+bt[71];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[99]=paper.setFinish(); 
lineNodes[99]=[90,71]; 

paper.setStart(); 
s1='M '+nx[92]+' '+bb[92]+' L '+nx[92]+' '+bt[32]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[100]=paper.setFinish(); 
lineNodes[100]=[92,32] ; 

paper.setStart(); 
s1='M '+nx[96]+' '+bb[96]+' L '+nx[96]+' '+bt[11]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[101]=paper.setFinish(); 
lineNodes[101]=[96,11] ; 

paper.setStart(); 
s1='M '+nx[100]+' '+bb[100]+' L '+nx[100]+' '+bt[26]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[102]=paper.setFinish(); 
lineNodes[102]=[100,26] ; 

paper.setStart(); 
s1='M '+nx[101]+' '+bb[101]+' L '+nx[101]+' '+bt[103]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[103]=paper.setFinish(); 
lineNodes[103]=[101,103] ; 

paper.setStart(); 
s1='M '+nx[103]+' '+bb[103]+' L '+nx[103]+' '+bt[111]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[104]=paper.setFinish(); 
lineNodes[104]=[103,111] ; 

paper.setStart(); 
s1='M '+nx[104]+' '+bb[104]+' L '+nx[104]+' '+bt[89]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[105]=paper.setFinish(); 
lineNodes[105]=[104,89] ; 

paper.setStart(); 
s1='M '+nx[107]+' '+bb[107]+' L '+nx[107]+' '+bt[132]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[106]=paper.setFinish(); 
lineNodes[106]=[107,132] ; 

paper.setStart(); 
s1='M '+nx[109]+' '+bb[109]+' L '+nx[109]+' '+bt[92]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[107]=paper.setFinish(); 
lineNodes[107]=[109,92] ; 

paper.setStart(); 
s1='M '+nx[110]+' '+bb[110]+' L '+nx[110]+' '+bt[130]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[108]=paper.setFinish(); 
lineNodes[108]=[110,130] ; 

paper.setStart(); 
mid=bb[7]+(bt[108]-bb[7])/2; 
s2='M '+nx[112]+' '+bb[112]+' L '+nx[112]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[38]+' '+mid+' L '+nx[38]+' '+bt[38];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[109]=paper.setFinish(); 
lineNodes[109]=[112,38]; 

paper.setStart(); 
mid=bb[7]+(bt[108]-bb[7])/2; 
s3='M '+nx[108]+' '+mid+' L '+nx[108]+' '+bt[108];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[110]=paper.setFinish(); 
lineNodes[110]=[112,108]; 

paper.setStart(); 
mid=bb[7]+(bt[108]-bb[7])/2; 
hleft = nx[125]; 
hright = nx[112]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[125]+' '+mid+' L '+nx[125]+' '+bt[125];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[111]=paper.setFinish(); 
lineNodes[111]=[112,125]; 

paper.setStart(); 
mid=bb[7]+(bt[108]-bb[7])/2; 
hleft = nx[116]; 
hright = nx[112]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[116]+' '+mid+' L '+nx[116]+' '+bt[116];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[112]=paper.setFinish(); 
lineNodes[112]=[112,116]; 

paper.setStart(); 
s1='M '+nx[113]+' '+bb[113]+' L '+nx[113]+' '+bt[90]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[113]=paper.setFinish(); 
lineNodes[113]=[113,90] ; 

paper.setStart(); 
s1='M '+nx[115]+' '+bb[115]+' L '+nx[115]+' '+bt[29]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[114]=paper.setFinish(); 
lineNodes[114]=[115,29] ; 

paper.setStart(); 
s1='M '+nx[117]+' '+bb[117]+' L '+nx[117]+' '+ny[137]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[117],nx[137])+' '+ny[137]+' L '+Math.max(nx[117],nx[137])+' '+ny[137]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[115]=paper.setFinish(); 
lineNodes[115]=[117,137]; 

paper.setStart(); 
s1='M '+nx[119]+' '+bb[119]+' L '+nx[119]+' '+bt[20]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[116]=paper.setFinish(); 
lineNodes[116]=[119,20] ; 

paper.setStart(); 
s1='M '+nx[120]+' '+bb[120]+' L '+nx[120]+' '+ny[134]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[120],nx[134])+' '+ny[134]+' L '+Math.max(nx[120],nx[134])+' '+ny[134]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[117]=paper.setFinish(); 
lineNodes[117]=[120,134]; 

paper.setStart(); 
s1='M '+nx[121]+' '+bb[121]+' L '+nx[121]+' '+bt[16]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[118]=paper.setFinish(); 
lineNodes[118]=[121,16] ; 

paper.setStart(); 
mid=bb[122]+(bt[119]-bb[122])/2; 
hleft = nx[119]; 
hright = nx[122]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[122]+' '+bb[122]+' L '+nx[122]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[119]+' '+mid+' L '+nx[119]+' '+bt[119];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[119]=paper.setFinish(); 
lineNodes[119]=[122,119]; 

paper.setStart(); 
mid=bb[122]+(bt[119]-bb[122])/2; 
hleft = nx[60]; 
hright = nx[122]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[60]+' '+mid+' L '+nx[60]+' '+bt[60];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[120]=paper.setFinish(); 
lineNodes[120]=[122,60]; 

paper.setStart(); 
s1='M '+nx[123]+' '+bb[123]+' L '+nx[123]+' '+bt[86]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[121]=paper.setFinish(); 
lineNodes[121]=[123,86] ; 

paper.setStart(); 
mid=bb[124]+(bt[8]-bb[124])/2; 
hleft = nx[73]; 
hright = nx[124]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[124]+' '+bb[124]+' L '+nx[124]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[73]+' '+mid+' L '+nx[73]+' '+bt[73];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[122]=paper.setFinish(); 
lineNodes[122]=[124,73]; 

paper.setStart(); 
mid=bb[124]+(bt[8]-bb[124])/2; 
hleft = nx[8]; 
hright = nx[124]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[8]+' '+mid+' L '+nx[8]+' '+bt[8];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[123]=paper.setFinish(); 
lineNodes[123]=[124,8]; 

paper.setStart(); 
s1='M '+nx[126]+' '+bb[126]+' L '+nx[126]+' '+ny[137]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+Math.min(nx[126],nx[137])+' '+ny[137]+' L '+Math.max(nx[126],nx[137])+' '+ny[137]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[124]=paper.setFinish(); 
lineNodes[124]=[126,137]; 

paper.setStart(); 
s1='M '+nx[128]+' '+bb[128]+' L '+nx[128]+' '+bt[123]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[125]=paper.setFinish(); 
lineNodes[125]=[128,123] ; 

paper.setStart(); 
s1='M '+nx[129]+' '+bb[129]+' L '+nx[129]+' '+bt[63]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[126]=paper.setFinish(); 
lineNodes[126]=[129,63] ; 

paper.setStart(); 
mid=bb[130]+(bt[112]-bb[130])/2; 
hleft = nx[7]; 
hright = nx[130]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[130]+' '+bb[130]+' L '+nx[130]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[7]+' '+mid+' L '+nx[7]+' '+bt[7];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[127]=paper.setFinish(); 
lineNodes[127]=[130,7]; 

paper.setStart(); 
mid=bb[130]+(bt[112]-bb[130])/2; 
hleft = nx[51]; 
hright = nx[130]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[51]+' '+mid+' L '+nx[51]+' '+bt[51];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[128]=paper.setFinish(); 
lineNodes[128]=[130,51]; 

paper.setStart(); 
mid=bb[130]+(bt[112]-bb[130])/2; 
s3='M '+nx[112]+' '+mid+' L '+nx[112]+' '+bt[112];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[129]=paper.setFinish(); 
lineNodes[129]=[130,112]; 

paper.setStart(); 
s1='M '+nx[131]+' '+bb[131]+' L '+nx[131]+' '+bt[40]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[130]=paper.setFinish(); 
lineNodes[130]=[131,40] ; 

paper.setStart(); 
s1='M '+nx[132]+' '+bb[132]+' L '+nx[132]+' '+bt[79]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[131]=paper.setFinish(); 
lineNodes[131]=[132,79] ; 

paper.setStart(); 
s1='M '+nx[133]+' '+bb[133]+' L '+nx[133]+' '+bt[62]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[132]=paper.setFinish(); 
lineNodes[132]=[133,62] ; 

paper.setStart(); 
s1='M '+nx[134]+' '+bb[134]+' L '+nx[134]+' '+bt[3]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[133]=paper.setFinish(); 
lineNodes[133]=[134,3] ; 

paper.setStart(); 
mid=bb[71]+(bt[121]-bb[71])/2; 
hleft = nx[121]; 
hright = nx[135]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[135]+' '+bb[135]+' L '+nx[135]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[121]+' '+mid+' L '+nx[121]+' '+bt[121];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[134]=paper.setFinish(); 
lineNodes[134]=[135,121]; 

paper.setStart(); 
mid=bb[71]+(bt[121]-bb[71])/2; 
hleft = nx[39]; 
hright = nx[135]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[39]+' '+mid+' L '+nx[39]+' '+bt[39];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[135]=paper.setFinish(); 
lineNodes[135]=[135,39]; 

paper.setStart(); 
s1='M '+nx[136]+' '+bb[136]+' L '+nx[136]+' '+bt[115]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[136]=paper.setFinish(); 
lineNodes[136]=[136,115] ; 

paper.setStart(); 
mid=bb[137]+(bt[59]-bb[137])/2; 
s2='M '+nx[137]+' '+bb[137]+' L '+nx[137]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[110]+' '+mid+' L '+nx[110]+' '+bt[110];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[137]=paper.setFinish(); 
lineNodes[137]=[137,110]; 

paper.setStart(); 
mid=bb[137]+(bt[59]-bb[137])/2; 
hleft = nx[59]; 
hright = nx[137]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[59]+' '+mid+' L '+nx[59]+' '+bt[59];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[138]=paper.setFinish(); 
lineNodes[138]=[137,59]; 

paper.setStart(); 
mid=bb[137]+(bt[59]-bb[137])/2; 
s3='M '+nx[48]+' '+mid+' L '+nx[48]+' '+bt[48];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[139]=paper.setFinish(); 
lineNodes[139]=[137,48]; 

paper.setStart(); 
mid=bb[137]+(bt[59]-bb[137])/2; 
s3='M '+nx[47]+' '+mid+' L '+nx[47]+' '+bt[47];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[140]=paper.setFinish(); 
lineNodes[140]=[137,47]; 

paper.setStart(); 
mid=bb[137]+(bt[59]-bb[137])/2; 
hleft = nx[34]; 
hright = nx[137]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[34]+' '+mid+' L '+nx[34]+' '+bt[34];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[141]=paper.setFinish(); 
lineNodes[141]=[137,34]; 

nlines = 142;
}