function initMap() { 

// Set size parameters 
mapWidth = 2820; 
mapHeight = 4705; 
var holder = document.getElementById('holder'); 
boxWidth = holder.getElementWidth();
boxHeight = holder.getElementHeight();
canvasWidth = boxWidth; 
canvasHeight = boxHeight; 
aspectRatio = boxWidth/boxHeight; 
zoomFactor = 5; 

// Create Raphael canvas for map 
paper = Raphael(document.getElementById('holder'), '100%', '100%');

// Define view center position 
rootx = 749; 
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

nnodes = 99; 
njunc = 7; 

nx[0]=1653;
ny[0]=4008;
nx[1]=2620;
ny[1]=4356;
nx[2]=850;
ny[2]=1486;
nx[3]=969;
ny[3]=2042;
nx[4]=632;
ny[4]=3634;
nx[5]=616;
ny[5]=707;
nx[6]=769;
ny[6]=1928;
nx[7]=1862;
ny[7]=4366;
nx[8]=2328;
ny[8]=3874;
nx[9]=573;
ny[9]=4141;
nx[10]=1208;
ny[10]=2432;
nx[11]=1253;
ny[11]=529;
nx[12]=1862;
ny[12]=4242;
nx[13]=616;
ny[13]=502;
nx[14]=2620;
ny[14]=4004;
nx[15]=2620;
ny[15]=4235;
nx[16]=1079;
ny[16]=3913;
nx[17]=2085;
ny[17]=4008;
nx[18]=878;
ny[18]=3030;
nx[19]=616;
ny[19]=604;
nx[20]=878;
ny[20]=3903;
nx[21]=878;
ny[21]=3745;
nx[22]=2328;
ny[22]=4001;
nx[23]=1090;
ny[23]=682;
nx[24]=297;
ny[24]=774;
nx[25]=1862;
ny[25]=4120;
nx[26]=878;
ny[26]=2583;
nx[27]=969;
ny[27]=1929;
nx[28]=2328;
ny[28]=4123;
nx[29]=2620;
ny[29]=4119;
nx[30]=240;
ny[30]=3908;
nx[31]=1262;
ny[31]=3916;
nx[32]=1776;
ny[32]=4493;
nx[33]=749;
ny[33]=394;
nx[34]=1036;
ny[34]=2431;
nx[35]=292;
ny[35]=298;
nx[36]=2328;
ny[36]=4386;
nx[37]=2620;
ny[37]=4605;
nx[38]=430;
ny[38]=3629;
nx[39]=297;
ny[39]=671;
nx[40]=1476;
ny[40]=531;
nx[41]=1088;
ny[41]=867;
nx[42]=749;
ny[42]=503;
nx[43]=878;
ny[43]=2920;
nx[44]=1383;
ny[44]=1027;
nx[45]=200;
ny[45]=532;
nx[46]=677;
ny[46]=3903;
nx[47]=1377;
ny[47]=773;
nx[48]=1862;
ny[48]=3867;
nx[49]=997;
ny[49]=2249;
nx[50]=749;
ny[50]=303;
nx[51]=1594;
ny[51]=690;
nx[52]=1352;
ny[52]=415;
nx[53]=1376;
ny[53]=689;
nx[54]=461;
ny[54]=4015;
nx[55]=907;
ny[55]=507;
nx[56]=1352;
ny[56]=305;
nx[57]=878;
ny[57]=3629;
nx[58]=772;
ny[58]=2250;
nx[59]=709;
ny[59]=2430;
nx[60]=515;
ny[60]=2431;
nx[61]=2620;
ny[61]=3879;
nx[62]=355;
ny[62]=4141;
nx[63]=616;
ny[63]=809;
nx[64]=1090;
ny[64]=778;
nx[65]=390;
ny[65]=532;
nx[66]=1189;
ny[66]=1924;
nx[67]=590;
ny[67]=1928;
nx[68]=2620;
ny[68]=4476;
nx[69]=850;
ny[69]=1691;
nx[70]=878;
ny[70]=3261;
nx[71]=850;
ny[71]=1803;
nx[72]=878;
ny[72]=2810;
nx[73]=1383;
ny[73]=1344;
nx[74]=850;
ny[74]=1579;
nx[75]=878;
ny[75]=3516;
nx[76]=749;
ny[76]=100;
nx[77]=878;
ny[77]=3390;
nx[78]=878;
ny[78]=3150;
nx[79]=2328;
ny[79]=3727;
nx[80]=2328;
ny[80]=3624;
nx[81]=878;
ny[81]=2431;
nx[82]=460;
ny[82]=3908;
nx[83]=1862;
ny[83]=4010;
nx[84]=1383;
ny[84]=1249;
nx[85]=1383;
ny[85]=1149;
nx[86]=1431;
ny[86]=3917;
nx[87]=1974;
ny[87]=4501;
nx[88]=1377;
ny[88]=863;
nx[89]=2328;
ny[89]=4255;
nx[90]=290;
ny[90]=409;
nx[91]=878;
ny[91]=2699;
nx[92]=1377;
ny[92]=942;
nx[93]=876;
ny[93]=2113;
nx[94]=297;
ny[94]=593;
nx[95]=850;
ny[95]=1415;
nx[96]=878;
ny[96]=2321;
nx[97]=1375;
ny[97]=589;
nx[98]=879;
ny[98]=2493;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[48, 83, 17]; 
members[1]=[68, 15]; 
members[2]=[74, 95]; 
members[3]=[27, 93]; 
members[4]=[80, 57, 75, 38]; 
members[5]=[19, 63]; 
members[6]=[66, 67, 71, 27, 93]; 
members[7]=[32, 12, 87]; 
members[8]=[48, 61, 22, 79]; 
members[9]=[62, 54]; 
members[10]=[96, 98, 34, 81, 59, 60]; 
members[11]=[40, 97, 52]; 
members[12]=[25, 7]; 
members[13]=[33, 42, 19, 55]; 
members[14]=[29, 61]; 
members[15]=[1, 29]; 
members[16]=[46, 82, 20, 21, 86, 30, 31]; 
members[17]=[48, 0, 83]; 
members[18]=[43, 78]; 
members[19]=[5, 13]; 
members[20]=[46, 16, 82, 21, 86, 30, 31]; 
members[21]=[46, 16, 82, 20, 86, 57, 30, 31]; 
members[22]=[8, 28]; 
members[23]=[64, 97, 51, 53]; 
members[24]=[39, 95]; 
members[25]=[83, 12]; 
members[26]=[98, 91]; 
members[27]=[66, 67, 6, 71, 3]; 
members[28]=[89, 22]; 
members[29]=[14, 15]; 
members[30]=[46, 16, 82, 20, 21, 86, 31]; 
members[31]=[46, 16, 82, 20, 21, 86, 30]; 
members[32]=[87, 7]; 
members[33]=[42, 50, 13, 55]; 
members[34]=[96, 98, 10, 81, 59, 60]; 
members[35]=[56, 90, 76, 50]; 
members[36]=[89]; 
members[37]=[68]; 
members[38]=[80, 57, 75, 4]; 
members[39]=[24, 94]; 
members[40]=[97, 11, 52]; 
members[41]=[64, 92]; 
members[42]=[33, 13, 55]; 
members[43]=[72, 18]; 
members[44]=[92, 85]; 
members[45]=[65, 90, 94]; 
members[46]=[16, 82, 20, 21, 86, 30, 31]; 
members[47]=[88, 53]; 
members[48]=[0, 8, 79, 17, 83, 61]; 
members[49]=[96, 58, 93]; 
members[50]=[56, 33, 35, 76]; 
members[51]=[97, 92, 53, 23]; 
members[52]=[40, 56, 11]; 
members[53]=[23, 97, 51, 47]; 
members[54]=[9, 82, 62]; 
members[55]=[33, 42, 13]; 
members[56]=[76, 50, 35, 52]; 
members[57]=[4, 38, 75, 80, 21]; 
members[58]=[96, 49, 93]; 
members[59]=[96, 98, 10, 34, 81, 60]; 
members[60]=[96, 98, 10, 34, 81, 59]; 
members[61]=[48, 8, 14, 79]; 
members[62]=[9, 54]; 
members[63]=[5, 95]; 
members[64]=[41, 23]; 
members[65]=[90, 45, 94]; 
members[66]=[67, 6, 71, 27, 93]; 
members[67]=[66, 6, 71, 27, 93]; 
members[68]=[1, 37]; 
members[69]=[74, 71]; 
members[70]=[77, 78]; 
members[71]=[66, 67, 69, 6, 27]; 
members[72]=[91, 43]; 
members[73]=[84, 95]; 
members[74]=[2, 69]; 
members[75]=[4, 38, 77, 80, 57]; 
members[76]=[56, 50, 35]; 
members[77]=[75, 70]; 
members[78]=[18, 70]; 
members[79]=[48, 8, 61, 80]; 
members[80]=[4, 38, 75, 79, 57]; 
members[81]=[96, 98, 10, 34, 59, 60]; 
members[82]=[54, 46, 16, 20, 21, 86, 30, 31]; 
members[83]=[48, 25, 0, 17]; 
members[84]=[73, 85]; 
members[85]=[44, 84]; 
members[86]=[46, 16, 82, 20, 21, 30, 31]; 
members[87]=[32, 7]; 
members[88]=[92, 47]; 
members[89]=[28, 36]; 
members[90]=[65, 35, 45]; 
members[91]=[72, 26]; 
members[92]=[41, 51, 44, 88]; 
members[93]=[66, 3, 6, 49, 67, 58]; 
members[94]=[65, 45, 39]; 
members[95]=[24, 73, 2, 63]; 
members[96]=[34, 49, 10, 81, 58, 59, 60]; 
members[97]=[40, 11, 51, 53, 23]; 
members[98]=[34, 10, 81, 26, 59, 60]; 

return members[i]; 
} 

function drawMap(sfac) { 

var rect; 
var tbox; 

paper.clear(); 

t[0]=paper.text(nx[0],ny[0],'The Uniform Distribution').attr({fill:"#666666","font-size": 14*sfac[0]});
tBox=t[0].getBBox(); 
bt[0]=ny[0]-(tBox.height/2+10*sfac[0]);
bb[0]=ny[0]+(tBox.height/2+10*sfac[0]);
bl[0]=nx[0]-(tBox.width/2+10*sfac[0]);
br[0]=nx[0]+(tBox.width/2+10*sfac[0]);
paper.setStart(); 
rect=paper.rect(bl[0], bt[0], br[0]-bl[0], bb[0]-bt[0], 10*sfac[0]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[0]=paper.setFinish(); 

t[1]=paper.text(nx[1],ny[1],'The Central Limit\nTheorem').attr({fill:"#666666","font-size": 14*sfac[1]});
tBox=t[1].getBBox(); 
bt[1]=ny[1]-(tBox.height/2+10*sfac[1]);
bb[1]=ny[1]+(tBox.height/2+10*sfac[1]);
bl[1]=nx[1]-(tBox.width/2+10*sfac[1]);
br[1]=nx[1]+(tBox.width/2+10*sfac[1]);
paper.setStart(); 
rect=paper.rect(bl[1], bt[1], br[1]-bl[1], bb[1]-bt[1], 10*sfac[1]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[1]=paper.setFinish(); 

t[2]=paper.text(nx[2],ny[2]-10,'Computing Probabilities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[2]});
t[2].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Probability-of-Compound-Events/#Computing Probabilities", target: "_top",title:"Click to jump to concept"});
}); 
t[2].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[2].getBBox(); 
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
yicon = bb[2]-25; 
xicon2 = nx[2]+-40; 
xicon3 = nx[2]+-10; 
xicon4 = nx[2]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Probability-of-Compound-Events/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[2], bt[2], br[2]-bl[2], bb[2]-bt[2], 10*sfac[2]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[2]=paper.setFinish(); 
t[2].toFront(); 
exicon.toFront(); 

t[3]=paper.text(nx[3],ny[3]-10,'General Addition Rule\nfor Probability').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[3]});
t[3].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mutually-Inclusive-Events/#General Addition Rule for Probability", target: "_top",title:"Click to jump to concept"});
}); 
t[3].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[3].getBBox(); 
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
yicon = bb[3]-25; 
xicon2 = nx[3]+-40; 
xicon3 = nx[3]+-10; 
xicon4 = nx[3]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mutually-Inclusive-Events/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mutually-Inclusive-Events/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mutually-Inclusive-Events/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[3], bt[3], br[3]-bl[3], bb[3]-bt[3], 10*sfac[3]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[3]=paper.setFinish(); 
t[3].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[4]=paper.text(nx[4],ny[4]-10,'Probability Frequency\nFunction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[4]});
t[4].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Probability-Distribution/#Probability Frequency Function", target: "_top",title:"Click to jump to concept"});
}); 
t[4].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[4].getBBox(); 
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
yicon = bb[4]-25; 
xicon2 = nx[4]+-40; 
xicon3 = nx[4]+-10; 
xicon4 = nx[4]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Probability-Distribution/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Probability-Distribution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Probability-Distribution/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[4], bt[4], br[4]-bl[4], bb[4]-bt[4], 10*sfac[4]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[4]=paper.setFinish(); 
t[4].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[5]=paper.text(nx[5],ny[5],'Operations with Sets').attr({fill:"#666666","font-size": 14*sfac[5]});
tBox=t[5].getBBox(); 
bt[5]=ny[5]-(tBox.height/2+10*sfac[5]);
bb[5]=ny[5]+(tBox.height/2+10*sfac[5]);
bl[5]=nx[5]-(tBox.width/2+10*sfac[5]);
br[5]=nx[5]+(tBox.width/2+10*sfac[5]);
paper.setStart(); 
rect=paper.rect(bl[5], bt[5], br[5]-bl[5], bb[5]-bt[5], 10*sfac[5]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[5]=paper.setFinish(); 

t[6]=paper.text(nx[6],ny[6],'Complement Rule for\nProbability').attr({fill:"#666666","font-size": 14*sfac[6]});
tBox=t[6].getBBox(); 
bt[6]=ny[6]-(tBox.height/2+10*sfac[6]);
bb[6]=ny[6]+(tBox.height/2+10*sfac[6]);
bl[6]=nx[6]-(tBox.width/2+10*sfac[6]);
br[6]=nx[6]+(tBox.width/2+10*sfac[6]);
paper.setStart(); 
rect=paper.rect(bl[6], bt[6], br[6]-bl[6], bb[6]-bt[6], 10*sfac[6]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[6]=paper.setFinish(); 

t[7]=paper.text(nx[7],ny[7]-10,'Computing Probabilities for\nAny Normal Distribution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[7]});
t[7].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Empirical-Rule/#Computing Probabilities for Any Normal Distribution", target: "_top",title:"Click to jump to concept"});
}); 
t[7].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[7].getBBox(); 
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
yicon = bb[7]-25; 
xicon2 = nx[7]+-40; 
xicon3 = nx[7]+-10; 
xicon4 = nx[7]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Empirical-Rule/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Empirical-Rule/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[7], bt[7], br[7]-bl[7], bb[7]-bt[7], 10*sfac[7]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[7]=paper.setFinish(); 
t[7].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[8]=paper.text(nx[8],ny[8],'Expected Value').attr({fill:"#666666","font-size": 14*sfac[8]});
tBox=t[8].getBBox(); 
bt[8]=ny[8]-(tBox.height/2+10*sfac[8]);
bb[8]=ny[8]+(tBox.height/2+10*sfac[8]);
bl[8]=nx[8]-(tBox.width/2+10*sfac[8]);
br[8]=nx[8]+(tBox.width/2+10*sfac[8]);
paper.setStart(); 
rect=paper.rect(bl[8], bt[8], br[8]-bl[8], bb[8]-bt[8], 10*sfac[8]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[8]=paper.setFinish(); 

t[9]=paper.text(nx[9],ny[9]-10,'Binomial Distributions with\nTechnology, binomcdf').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[9]});
t[9].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Binomcdf-Function/#Binomial Distributions with Technology, binomcdf", target: "_top",title:"Click to jump to concept"});
}); 
t[9].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[9].getBBox(); 
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
yicon = bb[9]-25; 
xicon2 = nx[9]+-40; 
xicon3 = nx[9]+-10; 
xicon4 = nx[9]+20; 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Binomcdf-Function/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[9], bt[9], br[9]-bl[9], bb[9]-bt[9], 10*sfac[9]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[9]=paper.setFinish(); 
t[9].toFront(); 
atticon.toFront(); 

t[10]=paper.text(nx[10],ny[10],'Transmission Errors').attr({fill:"#666666","font-size": 14*sfac[10]});
tBox=t[10].getBBox(); 
bt[10]=ny[10]-(tBox.height/2+10*sfac[10]);
bb[10]=ny[10]+(tBox.height/2+10*sfac[10]);
bl[10]=nx[10]-(tBox.width/2+10*sfac[10]);
br[10]=nx[10]+(tBox.width/2+10*sfac[10]);
paper.setStart(); 
rect=paper.rect(bl[10], bt[10], br[10]-bl[10], bb[10]-bt[10], 10*sfac[10]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[10]=paper.setFinish(); 

t[11]=paper.text(nx[11],ny[11],'Product Rule for Counting').attr({fill:"#666666","font-size": 14*sfac[11]});
tBox=t[11].getBBox(); 
bt[11]=ny[11]-(tBox.height/2+10*sfac[11]);
bb[11]=ny[11]+(tBox.height/2+10*sfac[11]);
bl[11]=nx[11]-(tBox.width/2+10*sfac[11]);
br[11]=nx[11]+(tBox.width/2+10*sfac[11]);
paper.setStart(); 
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[11]=paper.setFinish(); 

t[12]=paper.text(nx[12],ny[12],'Computing Probabilities for the\nStandard Normal Distribution').attr({fill:"#666666","font-size": 14*sfac[12]});
tBox=t[12].getBBox(); 
bt[12]=ny[12]-(tBox.height/2+10*sfac[12]);
bb[12]=ny[12]+(tBox.height/2+10*sfac[12]);
bl[12]=nx[12]-(tBox.width/2+10*sfac[12]);
br[12]=nx[12]+(tBox.width/2+10*sfac[12]);
paper.setStart(); 
rect=paper.rect(bl[12], bt[12], br[12]-bl[12], bb[12]-bt[12], 10*sfac[12]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[12]=paper.setFinish(); 

t[13]=paper.text(nx[13],ny[13],'Subsets').attr({fill:"#666666","font-size": 14*sfac[13]});
tBox=t[13].getBBox(); 
bt[13]=ny[13]-(tBox.height/2+10*sfac[13]);
bb[13]=ny[13]+(tBox.height/2+10*sfac[13]);
bl[13]=nx[13]-(tBox.width/2+10*sfac[13]);
br[13]=nx[13]+(tBox.width/2+10*sfac[13]);
paper.setStart(); 
rect=paper.rect(bl[13], bt[13], br[13]-bl[13], bb[13]-bt[13], 10*sfac[13]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[13]=paper.setFinish(); 

t[14]=paper.text(nx[14],ny[14],'Describing a Probability\nDistribution').attr({fill:"#666666","font-size": 14*sfac[14]});
tBox=t[14].getBBox(); 
bt[14]=ny[14]-(tBox.height/2+10*sfac[14]);
bb[14]=ny[14]+(tBox.height/2+10*sfac[14]);
bl[14]=nx[14]-(tBox.width/2+10*sfac[14]);
br[14]=nx[14]+(tBox.width/2+10*sfac[14]);
paper.setStart(); 
rect=paper.rect(bl[14], bt[14], br[14]-bl[14], bb[14]-bt[14], 10*sfac[14]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[14]=paper.setFinish(); 

t[15]=paper.text(nx[15],ny[15],'The Weak Law of\nLarge Numbers').attr({fill:"#666666","font-size": 14*sfac[15]});
tBox=t[15].getBBox(); 
bt[15]=ny[15]-(tBox.height/2+10*sfac[15]);
bb[15]=ny[15]+(tBox.height/2+10*sfac[15]);
bl[15]=nx[15]-(tBox.width/2+10*sfac[15]);
br[15]=nx[15]+(tBox.width/2+10*sfac[15]);
paper.setStart(); 
rect=paper.rect(bl[15], bt[15], br[15]-bl[15], bb[15]-bt[15], 10*sfac[15]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[15]=paper.setFinish(); 

t[16]=paper.text(nx[16],ny[16],'The Negative Binomial\nDistribution').attr({fill:"#666666","font-size": 14*sfac[16]});
tBox=t[16].getBBox(); 
bt[16]=ny[16]-(tBox.height/2+10*sfac[16]);
bb[16]=ny[16]+(tBox.height/2+10*sfac[16]);
bl[16]=nx[16]-(tBox.width/2+10*sfac[16]);
br[16]=nx[16]+(tBox.width/2+10*sfac[16]);
paper.setStart(); 
rect=paper.rect(bl[16], bt[16], br[16]-bl[16], bb[16]-bt[16], 10*sfac[16]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[16]=paper.setFinish(); 

t[17]=paper.text(nx[17],ny[17]-10,'The Exponential Distribution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[17]});
t[17].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exponential-Distributions/#The Exponential Distribution", target: "_top",title:"Click to jump to concept"});
}); 
t[17].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[17].getBBox(); 
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
yicon = bb[17]-25; 
xicon2 = nx[17]+-40; 
xicon3 = nx[17]+-10; 
xicon4 = nx[17]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Distributions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Distributions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[17], bt[17], br[17]-bl[17], bb[17]-bt[17], 10*sfac[17]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[17]=paper.setFinish(); 
t[17].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[18]=paper.text(nx[18],ny[18],'Partitions and the Law of\nTotal Probability').attr({fill:"#666666","font-size": 14*sfac[18]});
tBox=t[18].getBBox(); 
bt[18]=ny[18]-(tBox.height/2+10*sfac[18]);
bb[18]=ny[18]+(tBox.height/2+10*sfac[18]);
bl[18]=nx[18]-(tBox.width/2+10*sfac[18]);
br[18]=nx[18]+(tBox.width/2+10*sfac[18]);
paper.setStart(); 
rect=paper.rect(bl[18], bt[18], br[18]-bl[18], bb[18]-bt[18], 10*sfac[18]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[18]=paper.setFinish(); 

t[19]=paper.text(nx[19],ny[19],'Special Sets, Empty Set,\nUniversal Set').attr({fill:"#666666","font-size": 14*sfac[19]});
tBox=t[19].getBBox(); 
bt[19]=ny[19]-(tBox.height/2+10*sfac[19]);
bb[19]=ny[19]+(tBox.height/2+10*sfac[19]);
bl[19]=nx[19]-(tBox.width/2+10*sfac[19]);
br[19]=nx[19]+(tBox.width/2+10*sfac[19]);
paper.setStart(); 
rect=paper.rect(bl[19], bt[19], br[19]-bl[19], bb[19]-bt[19], 10*sfac[19]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[19]=paper.setFinish(); 

t[20]=paper.text(nx[20],ny[20],'The Geometric Distribution').attr({fill:"#666666","font-size": 14*sfac[20]});
tBox=t[20].getBBox(); 
bt[20]=ny[20]-(tBox.height/2+10*sfac[20]);
bb[20]=ny[20]+(tBox.height/2+10*sfac[20]);
bl[20]=nx[20]-(tBox.width/2+10*sfac[20]);
br[20]=nx[20]+(tBox.width/2+10*sfac[20]);
paper.setStart(); 
rect=paper.rect(bl[20], bt[20], br[20]-bl[20], bb[20]-bt[20], 10*sfac[20]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[20]=paper.setFinish(); 

t[21]=paper.text(nx[21],ny[21],'Types of Distribution of Discrete\nRandom Variables').attr({fill:"#666666","font-size": 14*sfac[21]});
tBox=t[21].getBBox(); 
bt[21]=ny[21]-(tBox.height/2+10*sfac[21]);
bb[21]=ny[21]+(tBox.height/2+10*sfac[21]);
bl[21]=nx[21]-(tBox.width/2+10*sfac[21]);
br[21]=nx[21]+(tBox.width/2+10*sfac[21]);
paper.setStart(); 
rect=paper.rect(bl[21], bt[21], br[21]-bl[21], bb[21]-bt[21], 10*sfac[21]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[21]=paper.setFinish(); 

t[22]=paper.text(nx[22],ny[22],'Expected Value for Discrete\nRandom Variables').attr({fill:"#666666","font-size": 14*sfac[22]});
tBox=t[22].getBBox(); 
bt[22]=ny[22]-(tBox.height/2+10*sfac[22]);
bb[22]=ny[22]+(tBox.height/2+10*sfac[22]);
bl[22]=nx[22]-(tBox.width/2+10*sfac[22]);
br[22]=nx[22]+(tBox.width/2+10*sfac[22]);
paper.setStart(); 
rect=paper.rect(bl[22], bt[22], br[22]-bl[22], bb[22]-bt[22], 10*sfac[22]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[22]=paper.setFinish(); 

t[23]=paper.text(nx[23],ny[23]-10,'Permutations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[23]});
t[23].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Probability-and-Permutations/#Permutations", target: "_top",title:"Click to jump to concept"});
}); 
t[23].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[23].getBBox(); 
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
yicon = bb[23]-25; 
xicon2 = nx[23]+-40; 
xicon3 = nx[23]+-10; 
xicon4 = nx[23]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Probability-and-Permutations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Probability-and-Permutations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[23], bt[23], br[23]-bl[23], bb[23]-bt[23], 10*sfac[23]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[23]=paper.setFinish(); 
t[23].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[24]=paper.text(nx[24],ny[24],'Applications of\nProbability').attr({fill:"#666666","font-size": 14*sfac[24]});
tBox=t[24].getBBox(); 
bt[24]=ny[24]-(tBox.height/2+10*sfac[24]);
bb[24]=ny[24]+(tBox.height/2+10*sfac[24]);
bl[24]=nx[24]-(tBox.width/2+10*sfac[24]);
br[24]=nx[24]+(tBox.width/2+10*sfac[24]);
paper.setStart(); 
rect=paper.rect(bl[24], bt[24], br[24]-bl[24], bb[24]-bt[24], 10*sfac[24]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[24]=paper.setFinish(); 

t[25]=paper.text(nx[25],ny[25],'Properties of the\nNormal Distribution').attr({fill:"#666666","font-size": 14*sfac[25]});
tBox=t[25].getBBox(); 
bt[25]=ny[25]-(tBox.height/2+10*sfac[25]);
bb[25]=ny[25]+(tBox.height/2+10*sfac[25]);
bl[25]=nx[25]-(tBox.width/2+10*sfac[25]);
br[25]=nx[25]+(tBox.width/2+10*sfac[25]);
paper.setStart(); 
rect=paper.rect(bl[25], bt[25], br[25]-bl[25], bb[25]-bt[25], 10*sfac[25]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[25]=paper.setFinish(); 

t[26]=paper.text(nx[26],ny[26],'Conditional Probability and\nIndependence').attr({fill:"#666666","font-size": 14*sfac[26]});
tBox=t[26].getBBox(); 
bt[26]=ny[26]-(tBox.height/2+10*sfac[26]);
bb[26]=ny[26]+(tBox.height/2+10*sfac[26]);
bl[26]=nx[26]-(tBox.width/2+10*sfac[26]);
br[26]=nx[26]+(tBox.width/2+10*sfac[26]);
paper.setStart(); 
rect=paper.rect(bl[26], bt[26], br[26]-bl[26], bb[26]-bt[26], 10*sfac[26]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[26]=paper.setFinish(); 

t[27]=paper.text(nx[27],ny[27]-10,'Addition Rule of Probability\nfor Mutually Exclusive Events').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[27]});
t[27].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mutually-Exclusive-Events/#Addition Rule of Probability for Mutually Exclusive Events", target: "_top",title:"Click to jump to concept"});
}); 
t[27].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[27].getBBox(); 
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
yicon = bb[27]-25; 
xicon2 = nx[27]+-40; 
xicon3 = nx[27]+-10; 
xicon4 = nx[27]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mutually-Exclusive-Events/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mutually-Exclusive-Events/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[27], bt[27], br[27]-bl[27], bb[27]-bt[27], 10*sfac[27]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[27]=paper.setFinish(); 
t[27].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[28]=paper.text(nx[28],ny[28],'Expected Value for Continuous\nRandom Variables').attr({fill:"#666666","font-size": 14*sfac[28]});
tBox=t[28].getBBox(); 
bt[28]=ny[28]-(tBox.height/2+10*sfac[28]);
bb[28]=ny[28]+(tBox.height/2+10*sfac[28]);
bl[28]=nx[28]-(tBox.width/2+10*sfac[28]);
br[28]=nx[28]+(tBox.width/2+10*sfac[28]);
paper.setStart(); 
rect=paper.rect(bl[28], bt[28], br[28]-bl[28], bb[28]-bt[28], 10*sfac[28]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[28]=paper.setFinish(); 

t[29]=paper.text(nx[29],ny[29],'The Chebyshev\nInequality').attr({fill:"#666666","font-size": 14*sfac[29]});
tBox=t[29].getBBox(); 
bt[29]=ny[29]-(tBox.height/2+10*sfac[29]);
bb[29]=ny[29]+(tBox.height/2+10*sfac[29]);
bl[29]=nx[29]-(tBox.width/2+10*sfac[29]);
br[29]=nx[29]+(tBox.width/2+10*sfac[29]);
paper.setStart(); 
rect=paper.rect(bl[29], bt[29], br[29]-bl[29], bb[29]-bt[29], 10*sfac[29]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[29]=paper.setFinish(); 

t[30]=paper.text(nx[30],ny[30],'Joint Distribution of Two\nRandom Variables').attr({fill:"#666666","font-size": 14*sfac[30]});
tBox=t[30].getBBox(); 
bt[30]=ny[30]-(tBox.height/2+10*sfac[30]);
bb[30]=ny[30]+(tBox.height/2+10*sfac[30]);
bl[30]=nx[30]-(tBox.width/2+10*sfac[30]);
br[30]=nx[30]+(tBox.width/2+10*sfac[30]);
paper.setStart(); 
rect=paper.rect(bl[30], bt[30], br[30]-bl[30], bb[30]-bt[30], 10*sfac[30]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[30]=paper.setFinish(); 

t[31]=paper.text(nx[31],ny[31],'The Hypergeometric\nDistribution').attr({fill:"#666666","font-size": 14*sfac[31]});
tBox=t[31].getBBox(); 
bt[31]=ny[31]-(tBox.height/2+10*sfac[31]);
bb[31]=ny[31]+(tBox.height/2+10*sfac[31]);
bl[31]=nx[31]-(tBox.width/2+10*sfac[31]);
br[31]=nx[31]+(tBox.width/2+10*sfac[31]);
paper.setStart(); 
rect=paper.rect(bl[31], bt[31], br[31]-bl[31], bb[31]-bt[31], 10*sfac[31]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[31]=paper.setFinish(); 

t[32]=paper.text(nx[32],ny[32],'Linear Interpolation\nof Normal Distributions').attr({fill:"#666666","font-size": 14*sfac[32]});
tBox=t[32].getBBox(); 
bt[32]=ny[32]-(tBox.height/2+10*sfac[32]);
bb[32]=ny[32]+(tBox.height/2+10*sfac[32]);
bl[32]=nx[32]-(tBox.width/2+10*sfac[32]);
br[32]=nx[32]+(tBox.width/2+10*sfac[32]);
paper.setStart(); 
rect=paper.rect(bl[32], bt[32], br[32]-bl[32], bb[32]-bt[32], 10*sfac[32]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[32]=paper.setFinish(); 

t[33]=paper.text(nx[33],ny[33],'Sets').attr({fill:"#666666","font-size": 14*sfac[33]});
tBox=t[33].getBBox(); 
bt[33]=ny[33]-(tBox.height/2+10*sfac[33]);
bb[33]=ny[33]+(tBox.height/2+10*sfac[33]);
bl[33]=nx[33]-(tBox.width/2+10*sfac[33]);
br[33]=nx[33]+(tBox.width/2+10*sfac[33]);
paper.setStart(); 
rect=paper.rect(bl[33], bt[33], br[33]-bl[33], bb[33]-bt[33], 10*sfac[33]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[33]=paper.setFinish(); 

t[34]=paper.text(nx[34],ny[34],'Birthday Problems').attr({fill:"#666666","font-size": 14*sfac[34]});
tBox=t[34].getBBox(); 
bt[34]=ny[34]-(tBox.height/2+10*sfac[34]);
bb[34]=ny[34]+(tBox.height/2+10*sfac[34]);
bl[34]=nx[34]-(tBox.width/2+10*sfac[34]);
br[34]=nx[34]+(tBox.width/2+10*sfac[34]);
paper.setStart(); 
rect=paper.rect(bl[34], bt[34], br[34]-bl[34], bb[34]-bt[34], 10*sfac[34]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[34]=paper.setFinish(); 

t[35]=paper.text(nx[35],ny[35]-10,'Introduction to Probability\nand Its Applications').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[35]});
t[35].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Theoretical-and-Experimental-Probability/#Introduction to Probability and Its Applications", target: "_top",title:"Click to jump to concept"});
}); 
t[35].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[35].getBBox(); 
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
yicon = bb[35]-25; 
xicon2 = nx[35]+-40; 
xicon3 = nx[35]+-10; 
xicon4 = nx[35]+20; 
paper.setStart(); 
rect=paper.rect(bl[35], bt[35], br[35]-bl[35], bb[35]-bt[35], 10*sfac[35]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[35]=paper.setFinish(); 
t[35].toFront(); 

t[36]=paper.text(nx[36],ny[36],'Conditional Expectation').attr({fill:"#666666","font-size": 14*sfac[36]});
tBox=t[36].getBBox(); 
bt[36]=ny[36]-(tBox.height/2+10*sfac[36]);
bb[36]=ny[36]+(tBox.height/2+10*sfac[36]);
bl[36]=nx[36]-(tBox.width/2+10*sfac[36]);
br[36]=nx[36]+(tBox.width/2+10*sfac[36]);
paper.setStart(); 
rect=paper.rect(bl[36], bt[36], br[36]-bl[36], bb[36]-bt[36], 10*sfac[36]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[36]=paper.setFinish(); 

t[37]=paper.text(nx[37],ny[37],'Comparison of Inequalities\nand Laws').attr({fill:"#666666","font-size": 14*sfac[37]});
tBox=t[37].getBBox(); 
bt[37]=ny[37]-(tBox.height/2+10*sfac[37]);
bb[37]=ny[37]+(tBox.height/2+10*sfac[37]);
bl[37]=nx[37]-(tBox.width/2+10*sfac[37]);
br[37]=nx[37]+(tBox.width/2+10*sfac[37]);
paper.setStart(); 
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[37]=paper.setFinish(); 

t[38]=paper.text(nx[38],ny[38]-10,'Random Variables').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[38]});
t[38].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Discrete-Random-Variables/#Random Variables", target: "_top",title:"Click to jump to concept"});
}); 
t[38].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[38].getBBox(); 
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
yicon = bb[38]-25; 
xicon2 = nx[38]+-40; 
xicon3 = nx[38]+-10; 
xicon4 = nx[38]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Discrete-Random-Variables/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Discrete-Random-Variables/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Discrete-Random-Variables/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[38], bt[38], br[38]-bl[38], bb[38]-bt[38], 10*sfac[38]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[38]=paper.setFinish(); 
t[38].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[39]=paper.text(nx[39],ny[39],'How Probability is\nApplied').attr({fill:"#666666","font-size": 14*sfac[39]});
tBox=t[39].getBBox(); 
bt[39]=ny[39]-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
paper.setStart(); 
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 

t[40]=paper.text(nx[40],ny[40],'Sum Rule for Counting').attr({fill:"#666666","font-size": 14*sfac[40]});
tBox=t[40].getBBox(); 
bt[40]=ny[40]-(tBox.height/2+10*sfac[40]);
bb[40]=ny[40]+(tBox.height/2+10*sfac[40]);
bl[40]=nx[40]-(tBox.width/2+10*sfac[40]);
br[40]=nx[40]+(tBox.width/2+10*sfac[40]);
paper.setStart(); 
rect=paper.rect(bl[40], bt[40], br[40]-bl[40], bb[40]-bt[40], 10*sfac[40]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[40]=paper.setFinish(); 

t[41]=paper.text(nx[41],ny[41]-10,'Permutations with Repetitions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[41]});
t[41].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Permutations-with-Repetition/#Permutations with Repetitions", target: "_top",title:"Click to jump to concept"});
}); 
t[41].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[41].getBBox(); 
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
yicon = bb[41]-25; 
xicon2 = nx[41]+-40; 
xicon3 = nx[41]+-10; 
xicon4 = nx[41]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Permutations-with-Repetition/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Permutations-with-Repetition/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[41], bt[41], br[41]-bl[41], bb[41]-bt[41], 10*sfac[41]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[41]=paper.setFinish(); 
t[41].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[42]=paper.text(nx[42],ny[42]-10,'Venn Diagrams').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[42]});
t[42].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Venn-Diagrams/#Venn Diagrams", target: "_top",title:"Click to jump to concept"});
}); 
t[42].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[42].getBBox(); 
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
yicon = bb[42]-25; 
xicon2 = nx[42]+-40; 
xicon3 = nx[42]+-10; 
xicon4 = nx[42]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Venn-Diagrams/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Venn-Diagrams/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[42], bt[42], br[42]-bl[42], bb[42]-bt[42], 10*sfac[42]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[42]=paper.setFinish(); 
t[42].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[43]=paper.text(nx[43],ny[43],'Switching Conditions').attr({fill:"#666666","font-size": 14*sfac[43]});
tBox=t[43].getBBox(); 
bt[43]=ny[43]-(tBox.height/2+10*sfac[43]);
bb[43]=ny[43]+(tBox.height/2+10*sfac[43]);
bl[43]=nx[43]-(tBox.width/2+10*sfac[43]);
br[43]=nx[43]+(tBox.width/2+10*sfac[43]);
paper.setStart(); 
rect=paper.rect(bl[43], bt[43], br[43]-bl[43], bb[43]-bt[43], 10*sfac[43]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[43]=paper.setFinish(); 

t[44]=paper.text(nx[44],ny[44]-10,'Comparing Permutations\nand Combinations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[44]});
t[44].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Permutations-and-Combinations-Compared/#Comparing Permutations and Combinations", target: "_top",title:"Click to jump to concept"});
}); 
t[44].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[44].getBBox(); 
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
yicon = bb[44]-25; 
xicon2 = nx[44]+-40; 
xicon3 = nx[44]+-10; 
xicon4 = nx[44]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Permutations-and-Combinations-Compared/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Permutations-and-Combinations-Compared/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Permutations-and-Combinations-Compared/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[44], bt[44], br[44]-bl[44], bb[44]-bt[44], 10*sfac[44]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[44]=paper.setFinish(); 
t[44].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[45]=paper.text(nx[45],ny[45],'Subjective Probability').attr({fill:"#666666","font-size": 14*sfac[45]});
tBox=t[45].getBBox(); 
bt[45]=ny[45]-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
paper.setStart(); 
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[45]=paper.setFinish(); 

t[46]=paper.text(nx[46],ny[46],'The Poisson Distribution').attr({fill:"#666666","font-size": 14*sfac[46]});
tBox=t[46].getBBox(); 
bt[46]=ny[46]-(tBox.height/2+10*sfac[46]);
bb[46]=ny[46]+(tBox.height/2+10*sfac[46]);
bl[46]=nx[46]-(tBox.width/2+10*sfac[46]);
br[46]=nx[46]+(tBox.width/2+10*sfac[46]);
paper.setStart(); 
rect=paper.rect(bl[46], bt[46], br[46]-bl[46], bb[46]-bt[46], 10*sfac[46]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[46]=paper.setFinish(); 

t[47]=paper.text(nx[47],ny[47]-10,'Use the Formula for Combinations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[47]});
t[47].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Combinations/#Use the Formula for Combinations", target: "_top",title:"Click to jump to concept"});
}); 
t[47].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[47].getBBox(); 
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
yicon = bb[47]-25; 
xicon2 = nx[47]+-40; 
xicon3 = nx[47]+-10; 
xicon4 = nx[47]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Combinations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Combinations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Combinations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[47], bt[47], br[47]-bl[47], bb[47]-bt[47], 10*sfac[47]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[47]=paper.setFinish(); 
t[47].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[48]=paper.text(nx[48],ny[48],'Types of Distribution of Continuous\nRandom Variables').attr({fill:"#666666","font-size": 14*sfac[48]});
tBox=t[48].getBBox(); 
bt[48]=ny[48]-(tBox.height/2+10*sfac[48]);
bb[48]=ny[48]+(tBox.height/2+10*sfac[48]);
bl[48]=nx[48]-(tBox.width/2+10*sfac[48]);
br[48]=nx[48]+(tBox.width/2+10*sfac[48]);
paper.setStart(); 
rect=paper.rect(bl[48], bt[48], br[48]-bl[48], bb[48]-bt[48], 10*sfac[48]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[48]=paper.setFinish(); 

t[49]=paper.text(nx[49],ny[49],'Problems Involving Coin\nTossing').attr({fill:"#666666","font-size": 14*sfac[49]});
tBox=t[49].getBBox(); 
bt[49]=ny[49]-(tBox.height/2+10*sfac[49]);
bb[49]=ny[49]+(tBox.height/2+10*sfac[49]);
bl[49]=nx[49]-(tBox.width/2+10*sfac[49]);
br[49]=nx[49]+(tBox.width/2+10*sfac[49]);
paper.setStart(); 
rect=paper.rect(bl[49], bt[49], br[49]-bl[49], bb[49]-bt[49], 10*sfac[49]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[49]=paper.setFinish(); 

t[50]=paper.text(nx[50],ny[50],'Set Theory').attr({fill:"#666666","font-size": 14*sfac[50]});
tBox=t[50].getBBox(); 
bt[50]=ny[50]-(tBox.height/2+10*sfac[50]);
bb[50]=ny[50]+(tBox.height/2+10*sfac[50]);
bl[50]=nx[50]-(tBox.width/2+10*sfac[50]);
br[50]=nx[50]+(tBox.width/2+10*sfac[50]);
paper.setStart(); 
rect=paper.rect(bl[50], bt[50], br[50]-bl[50], bb[50]-bt[50], 10*sfac[50]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[50]=paper.setFinish(); 

t[51]=paper.text(nx[51],ny[51],'Partitions').attr({fill:"#666666","font-size": 14*sfac[51]});
tBox=t[51].getBBox(); 
bt[51]=ny[51]-(tBox.height/2+10*sfac[51]);
bb[51]=ny[51]+(tBox.height/2+10*sfac[51]);
bl[51]=nx[51]-(tBox.width/2+10*sfac[51]);
br[51]=nx[51]+(tBox.width/2+10*sfac[51]);
paper.setStart(); 
rect=paper.rect(bl[51], bt[51], br[51]-bl[51], bb[51]-bt[51], 10*sfac[51]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[51]=paper.setFinish(); 

t[52]=paper.text(nx[52],ny[52],'Counting Principles').attr({fill:"#666666","font-size": 14*sfac[52]});
tBox=t[52].getBBox(); 
bt[52]=ny[52]-(tBox.height/2+10*sfac[52]);
bb[52]=ny[52]+(tBox.height/2+10*sfac[52]);
bl[52]=nx[52]-(tBox.width/2+10*sfac[52]);
br[52]=nx[52]+(tBox.width/2+10*sfac[52]);
paper.setStart(); 
rect=paper.rect(bl[52], bt[52], br[52]-bl[52], bb[52]-bt[52], 10*sfac[52]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[52]=paper.setFinish(); 

t[53]=paper.text(nx[53],ny[53]-10,'Combinations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[53]});
t[53].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Probability-and-Combinations/#Combinations", target: "_top",title:"Click to jump to concept"});
}); 
t[53].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[53].getBBox(); 
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
yicon = bb[53]-25; 
xicon2 = nx[53]+-40; 
xicon3 = nx[53]+-10; 
xicon4 = nx[53]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Probability-and-Combinations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Probability-and-Combinations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[53], bt[53], br[53]-bl[53], bb[53]-bt[53], 10*sfac[53]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[53]=paper.setFinish(); 
t[53].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[54]=paper.text(nx[54],ny[54]-10,'Definition of a Binomial Distribution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[54]});
t[54].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Binomial-Distributions-and-Probability/#Definition of a Binomial Distribution", target: "_top",title:"Click to jump to concept"});
}); 
t[54].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[54].getBBox(); 
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
yicon = bb[54]-25; 
xicon2 = nx[54]+-40; 
xicon3 = nx[54]+-10; 
xicon4 = nx[54]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Binomial-Distributions-and-Probability/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Binomial-Distributions-and-Probability/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[54], bt[54], br[54]-bl[54], bb[54]-bt[54], 10*sfac[54]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[54]=paper.setFinish(); 
t[54].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[55]=paper.text(nx[55],ny[55],'Sample Spaces and\nEvents').attr({fill:"#666666","font-size": 14*sfac[55]});
tBox=t[55].getBBox(); 
bt[55]=ny[55]-(tBox.height/2+10*sfac[55]);
bb[55]=ny[55]+(tBox.height/2+10*sfac[55]);
bl[55]=nx[55]-(tBox.width/2+10*sfac[55]);
br[55]=nx[55]+(tBox.width/2+10*sfac[55]);
paper.setStart(); 
rect=paper.rect(bl[55], bt[55], br[55]-bl[55], bb[55]-bt[55], 10*sfac[55]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[55]=paper.setFinish(); 

t[56]=paper.text(nx[56],ny[56],'Counting Techniques').attr({fill:"#666666","font-size": 14*sfac[56]});
tBox=t[56].getBBox(); 
bt[56]=ny[56]-(tBox.height/2+10*sfac[56]);
bb[56]=ny[56]+(tBox.height/2+10*sfac[56]);
bl[56]=nx[56]-(tBox.width/2+10*sfac[56]);
br[56]=nx[56]+(tBox.width/2+10*sfac[56]);
paper.setStart(); 
rect=paper.rect(bl[56], bt[56], br[56]-bl[56], bb[56]-bt[56], 10*sfac[56]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[56]=paper.setFinish(); 

t[57]=paper.text(nx[57],ny[57],'Cumulative Distribution Function\nof a Random Variable').attr({fill:"#666666","font-size": 14*sfac[57]});
tBox=t[57].getBBox(); 
bt[57]=ny[57]-(tBox.height/2+10*sfac[57]);
bb[57]=ny[57]+(tBox.height/2+10*sfac[57]);
bl[57]=nx[57]-(tBox.width/2+10*sfac[57]);
br[57]=nx[57]+(tBox.width/2+10*sfac[57]);
paper.setStart(); 
rect=paper.rect(bl[57], bt[57], br[57]-bl[57], bb[57]-bt[57], 10*sfac[57]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[57]=paper.setFinish(); 

t[58]=paper.text(nx[58],ny[58],'Problems Using Dice').attr({fill:"#666666","font-size": 14*sfac[58]});
tBox=t[58].getBBox(); 
bt[58]=ny[58]-(tBox.height/2+10*sfac[58]);
bb[58]=ny[58]+(tBox.height/2+10*sfac[58]);
bl[58]=nx[58]-(tBox.width/2+10*sfac[58]);
br[58]=nx[58]+(tBox.width/2+10*sfac[58]);
paper.setStart(); 
rect=paper.rect(bl[58], bt[58], br[58]-bl[58], bb[58]-bt[58], 10*sfac[58]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[58]=paper.setFinish(); 

t[59]=paper.text(nx[59],ny[59],'Geometric Probability').attr({fill:"#666666","font-size": 14*sfac[59]});
tBox=t[59].getBBox(); 
bt[59]=ny[59]-(tBox.height/2+10*sfac[59]);
bb[59]=ny[59]+(tBox.height/2+10*sfac[59]);
bl[59]=nx[59]-(tBox.width/2+10*sfac[59]);
br[59]=nx[59]+(tBox.width/2+10*sfac[59]);
paper.setStart(); 
rect=paper.rect(bl[59], bt[59], br[59]-bl[59], bb[59]-bt[59], 10*sfac[59]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[59]=paper.setFinish(); 

t[60]=paper.text(nx[60],ny[60],'Problems Involving Cards').attr({fill:"#666666","font-size": 14*sfac[60]});
tBox=t[60].getBBox(); 
bt[60]=ny[60]-(tBox.height/2+10*sfac[60]);
bb[60]=ny[60]+(tBox.height/2+10*sfac[60]);
bl[60]=nx[60]-(tBox.width/2+10*sfac[60]);
br[60]=nx[60]+(tBox.width/2+10*sfac[60]);
paper.setStart(); 
rect=paper.rect(bl[60], bt[60], br[60]-bl[60], bb[60]-bt[60], 10*sfac[60]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[60]=paper.setFinish(); 

t[61]=paper.text(nx[61],ny[61],'Laws of Large Numbers').attr({fill:"#666666","font-size": 14*sfac[61]});
tBox=t[61].getBBox(); 
bt[61]=ny[61]-(tBox.height/2+10*sfac[61]);
bb[61]=ny[61]+(tBox.height/2+10*sfac[61]);
bl[61]=nx[61]-(tBox.width/2+10*sfac[61]);
br[61]=nx[61]+(tBox.width/2+10*sfac[61]);
paper.setStart(); 
rect=paper.rect(bl[61], bt[61], br[61]-bl[61], bb[61]-bt[61], 10*sfac[61]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[61]=paper.setFinish(); 

t[62]=paper.text(nx[62],ny[62]-10,'Binomial Distributions with\nTechnology, binompdf').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[62]});
t[62].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Binompdf-Function/#Binomial Distributions with Technology, binompdf", target: "_top",title:"Click to jump to concept"});
}); 
t[62].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[62].getBBox(); 
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
yicon = bb[62]-25; 
xicon2 = nx[62]+-40; 
xicon3 = nx[62]+-10; 
xicon4 = nx[62]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Binompdf-Function/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Binompdf-Function/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[62], bt[62], br[62]-bl[62], bb[62]-bt[62], 10*sfac[62]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[62]=paper.setFinish(); 
t[62].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[63]=paper.text(nx[63],ny[63],'Properties of Set\nOperations').attr({fill:"#666666","font-size": 14*sfac[63]});
tBox=t[63].getBBox(); 
bt[63]=ny[63]-(tBox.height/2+10*sfac[63]);
bb[63]=ny[63]+(tBox.height/2+10*sfac[63]);
bl[63]=nx[63]-(tBox.width/2+10*sfac[63]);
br[63]=nx[63]+(tBox.width/2+10*sfac[63]);
paper.setStart(); 
rect=paper.rect(bl[63], bt[63], br[63]-bl[63], bb[63]-bt[63], 10*sfac[63]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[63]=paper.setFinish(); 

t[64]=paper.text(nx[64],ny[64]-10,'Use Technology for\nPermutation Problems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[64]});
t[64].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Permutation-Problems/#Use Technology for Permutation Problems", target: "_top",title:"Click to jump to concept"});
}); 
t[64].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[64].getBBox(); 
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
yicon = bb[64]-25; 
xicon2 = nx[64]+-40; 
xicon3 = nx[64]+-10; 
xicon4 = nx[64]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Permutation-Problems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[64], bt[64], br[64]-bl[64], bb[64]-bt[64], 10*sfac[64]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[64]=paper.setFinish(); 
t[64].toFront(); 
exicon.toFront(); 

t[65]=paper.text(nx[65],ny[65],'Empirical Probability').attr({fill:"#666666","font-size": 14*sfac[65]});
tBox=t[65].getBBox(); 
bt[65]=ny[65]-(tBox.height/2+10*sfac[65]);
bb[65]=ny[65]+(tBox.height/2+10*sfac[65]);
bl[65]=nx[65]-(tBox.width/2+10*sfac[65]);
br[65]=nx[65]+(tBox.width/2+10*sfac[65]);
paper.setStart(); 
rect=paper.rect(bl[65], bt[65], br[65]-bl[65], bb[65]-bt[65], 10*sfac[65]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[65]=paper.setFinish(); 

t[66]=paper.text(nx[66],ny[66],'Inequality for Probabilities').attr({fill:"#666666","font-size": 14*sfac[66]});
tBox=t[66].getBBox(); 
bt[66]=ny[66]-(tBox.height/2+10*sfac[66]);
bb[66]=ny[66]+(tBox.height/2+10*sfac[66]);
bl[66]=nx[66]-(tBox.width/2+10*sfac[66]);
br[66]=nx[66]+(tBox.width/2+10*sfac[66]);
paper.setStart(); 
rect=paper.rect(bl[66], bt[66], br[66]-bl[66], bb[66]-bt[66], 10*sfac[66]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[66]=paper.setFinish(); 

t[67]=paper.text(nx[67],ny[67],'Multiplication Rule for\nProbability').attr({fill:"#666666","font-size": 14*sfac[67]});
tBox=t[67].getBBox(); 
bt[67]=ny[67]-(tBox.height/2+10*sfac[67]);
bb[67]=ny[67]+(tBox.height/2+10*sfac[67]);
bl[67]=nx[67]-(tBox.width/2+10*sfac[67]);
br[67]=nx[67]+(tBox.width/2+10*sfac[67]);
paper.setStart(); 
rect=paper.rect(bl[67], bt[67], br[67]-bl[67], bb[67]-bt[67], 10*sfac[67]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[67]=paper.setFinish(); 

t[68]=paper.text(nx[68],ny[68],'The Strong Law of\nLarge Numbers').attr({fill:"#666666","font-size": 14*sfac[68]});
tBox=t[68].getBBox(); 
bt[68]=ny[68]-(tBox.height/2+10*sfac[68]);
bb[68]=ny[68]+(tBox.height/2+10*sfac[68]);
bl[68]=nx[68]-(tBox.width/2+10*sfac[68]);
br[68]=nx[68]+(tBox.width/2+10*sfac[68]);
paper.setStart(); 
rect=paper.rect(bl[68], bt[68], br[68]-bl[68], bb[68]-bt[68], 10*sfac[68]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[68]=paper.setFinish(); 

t[69]=paper.text(nx[69],ny[69]-10,'General Principles for\nComputing Probabilities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[69]});
t[69].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Tree-Diagrams/#General Principles for Computing Probabilities", target: "_top",title:"Click to jump to concept"});
}); 
t[69].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[69].getBBox(); 
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
yicon = bb[69]-25; 
xicon2 = nx[69]+-40; 
xicon3 = nx[69]+-10; 
xicon4 = nx[69]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tree-Diagrams/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tree-Diagrams/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tree-Diagrams/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[69], bt[69], br[69]-bl[69], bb[69]-bt[69], 10*sfac[69]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[69]=paper.setFinish(); 
t[69].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[70]=paper.text(nx[70],ny[70],'Independent Events').attr({fill:"#666666","font-size": 14*sfac[70]});
tBox=t[70].getBBox(); 
bt[70]=ny[70]-(tBox.height/2+10*sfac[70]);
bb[70]=ny[70]+(tBox.height/2+10*sfac[70]);
bl[70]=nx[70]-(tBox.width/2+10*sfac[70]);
br[70]=nx[70]+(tBox.width/2+10*sfac[70]);
paper.setStart(); 
rect=paper.rect(bl[70], bt[70], br[70]-bl[70], bb[70]-bt[70], 10*sfac[70]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[70]=paper.setFinish(); 

t[71]=paper.text(nx[71],ny[71],'Counting Events').attr({fill:"#666666","font-size": 14*sfac[71]});
tBox=t[71].getBBox(); 
bt[71]=ny[71]-(tBox.height/2+10*sfac[71]);
bb[71]=ny[71]+(tBox.height/2+10*sfac[71]);
bl[71]=nx[71]-(tBox.width/2+10*sfac[71]);
br[71]=nx[71]+(tBox.width/2+10*sfac[71]);
paper.setStart(); 
rect=paper.rect(bl[71], bt[71], br[71]-bl[71], bb[71]-bt[71], 10*sfac[71]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[71]=paper.setFinish(); 

t[72]=paper.text(nx[72],ny[72],'Multiplication Theorem\nfor Conditional Probability').attr({fill:"#666666","font-size": 14*sfac[72]});
tBox=t[72].getBBox(); 
bt[72]=ny[72]-(tBox.height/2+10*sfac[72]);
bb[72]=ny[72]+(tBox.height/2+10*sfac[72]);
bl[72]=nx[72]-(tBox.width/2+10*sfac[72]);
br[72]=nx[72]+(tBox.width/2+10*sfac[72]);
paper.setStart(); 
rect=paper.rect(bl[72], bt[72], br[72]-bl[72], bb[72]-bt[72], 10*sfac[72]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[72]=paper.setFinish(); 

t[73]=paper.text(nx[73],ny[73],"Pascal's Triangle").attr({fill:"#666666","font-size": 14*sfac[73]});
tBox=t[73].getBBox(); 
bt[73]=ny[73]-(tBox.height/2+10*sfac[73]);
bb[73]=ny[73]+(tBox.height/2+10*sfac[73]);
bl[73]=nx[73]-(tBox.width/2+10*sfac[73]);
br[73]=nx[73]+(tBox.width/2+10*sfac[73]);
paper.setStart(); 
rect=paper.rect(bl[73], bt[73], br[73]-bl[73], bb[73]-bt[73], 10*sfac[73]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[73]=paper.setFinish(); 

t[74]=paper.text(nx[74],ny[74],'Numerical Computations').attr({fill:"#666666","font-size": 14*sfac[74]});
tBox=t[74].getBBox(); 
bt[74]=ny[74]-(tBox.height/2+10*sfac[74]);
bb[74]=ny[74]+(tBox.height/2+10*sfac[74]);
bl[74]=nx[74]-(tBox.width/2+10*sfac[74]);
br[74]=nx[74]+(tBox.width/2+10*sfac[74]);
paper.setStart(); 
rect=paper.rect(bl[74], bt[74], br[74]-bl[74], bb[74]-bt[74], 10*sfac[74]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[74]=paper.setFinish(); 

t[75]=paper.text(nx[75],ny[75],'Discrete Random Variables').attr({fill:"#666666","font-size": 14*sfac[75]});
tBox=t[75].getBBox(); 
bt[75]=ny[75]-(tBox.height/2+10*sfac[75]);
bb[75]=ny[75]+(tBox.height/2+10*sfac[75]);
bl[75]=nx[75]-(tBox.width/2+10*sfac[75]);
br[75]=nx[75]+(tBox.width/2+10*sfac[75]);
paper.setStart(); 
rect=paper.rect(bl[75], bt[75], br[75]-bl[75], bb[75]-bt[75], 10*sfac[75]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[75]=paper.setFinish(); 

t[76]=paper.text(nx[76],ny[76],'Probability').attr({fill:"#000000","font-size": 24*sfac[76]});
tBox=t[76].getBBox(); 
bt[76]=ny[76]-(tBox.height/2+10*sfac[76]);
bb[76]=ny[76]+(tBox.height/2+10*sfac[76]);
bl[76]=nx[76]-(tBox.width/2+10*sfac[76]);
br[76]=nx[76]+(tBox.width/2+10*sfac[76]);
paper.setStart(); 
rect=paper.rect(bl[76], bt[76], br[76]-bl[76], bb[76]-bt[76], 10*sfac[76]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[76]=paper.setFinish(); 

t[77]=paper.text(nx[77],ny[77],'Discrete Random Variables\nand Continuous Random Variables').attr({fill:"#666666","font-size": 14*sfac[77]});
tBox=t[77].getBBox(); 
bt[77]=ny[77]-(tBox.height/2+10*sfac[77]);
bb[77]=ny[77]+(tBox.height/2+10*sfac[77]);
bl[77]=nx[77]-(tBox.width/2+10*sfac[77]);
br[77]=nx[77]+(tBox.width/2+10*sfac[77]);
paper.setStart(); 
rect=paper.rect(bl[77], bt[77], br[77]-bl[77], bb[77]-bt[77], 10*sfac[77]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[77]=paper.setFinish(); 

t[78]=paper.text(nx[78],ny[78],"Bayes' Formula for\nConditional Probability").attr({fill:"#666666","font-size": 14*sfac[78]});
tBox=t[78].getBBox(); 
bt[78]=ny[78]-(tBox.height/2+10*sfac[78]);
bb[78]=ny[78]+(tBox.height/2+10*sfac[78]);
bl[78]=nx[78]-(tBox.width/2+10*sfac[78]);
br[78]=nx[78]+(tBox.width/2+10*sfac[78]);
paper.setStart(); 
rect=paper.rect(bl[78], bt[78], br[78]-bl[78], bb[78]-bt[78], 10*sfac[78]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[78]=paper.setFinish(); 

t[79]=paper.text(nx[79],ny[79],'Cumulative Distribution Function\nof a Continuous Random Variable').attr({fill:"#666666","font-size": 14*sfac[79]});
tBox=t[79].getBBox(); 
bt[79]=ny[79]-(tBox.height/2+10*sfac[79]);
bb[79]=ny[79]+(tBox.height/2+10*sfac[79]);
bl[79]=nx[79]-(tBox.width/2+10*sfac[79]);
br[79]=nx[79]+(tBox.width/2+10*sfac[79]);
paper.setStart(); 
rect=paper.rect(bl[79], bt[79], br[79]-bl[79], bb[79]-bt[79], 10*sfac[79]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[79]=paper.setFinish(); 

t[80]=paper.text(nx[80],ny[80],'Continuous Random Variables').attr({fill:"#666666","font-size": 14*sfac[80]});
tBox=t[80].getBBox(); 
bt[80]=ny[80]-(tBox.height/2+10*sfac[80]);
bb[80]=ny[80]+(tBox.height/2+10*sfac[80]);
bl[80]=nx[80]-(tBox.width/2+10*sfac[80]);
br[80]=nx[80]+(tBox.width/2+10*sfac[80]);
paper.setStart(); 
rect=paper.rect(bl[80], bt[80], br[80]-bl[80], bb[80]-bt[80], 10*sfac[80]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[80]=paper.setFinish(); 

t[81]=paper.text(nx[81],ny[81],'Quality Control').attr({fill:"#666666","font-size": 14*sfac[81]});
tBox=t[81].getBBox(); 
bt[81]=ny[81]-(tBox.height/2+10*sfac[81]);
bb[81]=ny[81]+(tBox.height/2+10*sfac[81]);
bl[81]=nx[81]-(tBox.width/2+10*sfac[81]);
br[81]=nx[81]+(tBox.width/2+10*sfac[81]);
paper.setStart(); 
rect=paper.rect(bl[81], bt[81], br[81]-bl[81], bb[81]-bt[81], 10*sfac[81]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[81]=paper.setFinish(); 

t[82]=paper.text(nx[82],ny[82],'The Bernoulli Random Variable\nand the Binomial Distribution').attr({fill:"#666666","font-size": 14*sfac[82]});
tBox=t[82].getBBox(); 
bt[82]=ny[82]-(tBox.height/2+10*sfac[82]);
bb[82]=ny[82]+(tBox.height/2+10*sfac[82]);
bl[82]=nx[82]-(tBox.width/2+10*sfac[82]);
br[82]=nx[82]+(tBox.width/2+10*sfac[82]);
paper.setStart(); 
rect=paper.rect(bl[82], bt[82], br[82]-bl[82], bb[82]-bt[82], 10*sfac[82]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[82]=paper.setFinish(); 

t[83]=paper.text(nx[83],ny[83],'The Normal Distribution').attr({fill:"#666666","font-size": 14*sfac[83]});
tBox=t[83].getBBox(); 
bt[83]=ny[83]-(tBox.height/2+10*sfac[83]);
bb[83]=ny[83]+(tBox.height/2+10*sfac[83]);
bl[83]=nx[83]-(tBox.width/2+10*sfac[83]);
br[83]=nx[83]+(tBox.width/2+10*sfac[83]);
paper.setStart(); 
rect=paper.rect(bl[83], bt[83], br[83]-bl[83], bb[83]-bt[83], 10*sfac[83]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[83]=paper.setFinish(); 

t[84]=paper.text(nx[84],ny[84],'Binomial Coefficients').attr({fill:"#666666","font-size": 14*sfac[84]});
tBox=t[84].getBBox(); 
bt[84]=ny[84]-(tBox.height/2+10*sfac[84]);
bb[84]=ny[84]+(tBox.height/2+10*sfac[84]);
bl[84]=nx[84]-(tBox.width/2+10*sfac[84]);
br[84]=nx[84]+(tBox.width/2+10*sfac[84]);
paper.setStart(); 
rect=paper.rect(bl[84], bt[84], br[84]-bl[84], bb[84]-bt[84], 10*sfac[84]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[84]=paper.setFinish(); 

t[85]=paper.text(nx[85],ny[85],'Challenging Counting\nProblems').attr({fill:"#666666","font-size": 14*sfac[85]});
tBox=t[85].getBBox(); 
bt[85]=ny[85]-(tBox.height/2+10*sfac[85]);
bb[85]=ny[85]+(tBox.height/2+10*sfac[85]);
bl[85]=nx[85]-(tBox.width/2+10*sfac[85]);
br[85]=nx[85]+(tBox.width/2+10*sfac[85]);
paper.setStart(); 
rect=paper.rect(bl[85], bt[85], br[85]-bl[85], bb[85]-bt[85], 10*sfac[85]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[85]=paper.setFinish(); 

t[86]=paper.text(nx[86],ny[86]-10,'The Multinomial\nDistribution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[86]});
t[86].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multinomial-Distributions/#The Multinomial Distribution", target: "_top",title:"Click to jump to concept"});
}); 
t[86].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[86].getBBox(); 
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
yicon = bb[86]-25; 
xicon2 = nx[86]+-40; 
xicon3 = nx[86]+-10; 
xicon4 = nx[86]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multinomial-Distributions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multinomial-Distributions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[86], bt[86], br[86]-bl[86], bb[86]-bt[86], 10*sfac[86]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[86]=paper.setFinish(); 
t[86].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[87]=paper.text(nx[87],ny[87],'The Normal Approximation of\nthe Binomial Distribution').attr({fill:"#666666","font-size": 14*sfac[87]});
tBox=t[87].getBBox(); 
bt[87]=ny[87]-(tBox.height/2+10*sfac[87]);
bb[87]=ny[87]+(tBox.height/2+10*sfac[87]);
bl[87]=nx[87]-(tBox.width/2+10*sfac[87]);
br[87]=nx[87]+(tBox.width/2+10*sfac[87]);
paper.setStart(); 
rect=paper.rect(bl[87], bt[87], br[87]-bl[87], bb[87]-bt[87], 10*sfac[87]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[87]=paper.setFinish(); 

t[88]=paper.text(nx[88],ny[88]-10,'Use Technology for Combination Problems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[88]});
t[88].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Combination-Problems/#Use Technology for Combination Problems", target: "_top",title:"Click to jump to concept"});
}); 
t[88].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[88].getBBox(); 
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
yicon = bb[88]-25; 
xicon2 = nx[88]+-40; 
xicon3 = nx[88]+-10; 
xicon4 = nx[88]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Combination-Problems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[88], bt[88], br[88]-bl[88], bb[88]-bt[88], 10*sfac[88]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[88]=paper.setFinish(); 
t[88].toFront(); 
exicon.toFront(); 

t[89]=paper.text(nx[89],ny[89],'Expectation of a Multiple\nor Sum of Random Variables').attr({fill:"#666666","font-size": 14*sfac[89]});
tBox=t[89].getBBox(); 
bt[89]=ny[89]-(tBox.height/2+10*sfac[89]);
bb[89]=ny[89]+(tBox.height/2+10*sfac[89]);
bl[89]=nx[89]-(tBox.width/2+10*sfac[89]);
br[89]=nx[89]+(tBox.width/2+10*sfac[89]);
paper.setStart(); 
rect=paper.rect(bl[89], bt[89], br[89]-bl[89], bb[89]-bt[89], 10*sfac[89]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[89]=paper.setFinish(); 

t[90]=paper.text(nx[90],ny[90],'Measurement of Probability').attr({fill:"#666666","font-size": 14*sfac[90]});
tBox=t[90].getBBox(); 
bt[90]=ny[90]-(tBox.height/2+10*sfac[90]);
bb[90]=ny[90]+(tBox.height/2+10*sfac[90]);
bl[90]=nx[90]-(tBox.width/2+10*sfac[90]);
br[90]=nx[90]+(tBox.width/2+10*sfac[90]);
paper.setStart(); 
rect=paper.rect(bl[90], bt[90], br[90]-bl[90], bb[90]-bt[90], 10*sfac[90]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[90]=paper.setFinish(); 

t[91]=paper.text(nx[91],ny[91]-10,'Conditional Probability').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[91]});
t[91].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Conditional-Probability/#Conditional Probability", target: "_top",title:"Click to jump to concept"});
}); 
t[91].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[91].getBBox(); 
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
yicon = bb[91]-25; 
xicon2 = nx[91]+-40; 
xicon3 = nx[91]+-10; 
xicon4 = nx[91]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Conditional-Probability/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Conditional-Probability/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Conditional-Probability/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[91], bt[91], br[91]-bl[91], bb[91]-bt[91], 10*sfac[91]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[91]=paper.setFinish(); 
t[91].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

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

bb[95]= ny[95]; 
bt[95]= ny[95]; 
bl[95]= nx[95]; 
br[95]= nx[95]; 

bb[96]= ny[96]; 
bt[96]= ny[96]; 
bl[96]= nx[96]; 
br[96]= nx[96]; 

bb[97]= ny[97]; 
bt[97]= ny[97]; 
bl[97]= nx[97]; 
br[97]= nx[97]; 

bb[98]= ny[98]; 
bt[98]= ny[98]; 
bl[98]= nx[98]; 
br[98]= nx[98]; 

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
paper.setStart(); 
s1='M '+nx[1]+' '+bb[1]+' L '+nx[1]+' '+bt[68]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[1,68] ; 

paper.setStart(); 
s1='M '+nx[2]+' '+bb[2]+' L '+nx[2]+' '+bt[74]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[2,74] ; 

paper.setStart(); 
s1='M '+nx[3]+' '+bb[3]+' L '+nx[3]+' '+ny[93]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[3,93]; 

paper.setStart(); 
s1='M '+nx[5]+' '+bb[5]+' L '+nx[5]+' '+bt[63]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[5,63] ; 

paper.setStart(); 
s1='M '+nx[6]+' '+bb[6]+' L '+nx[6]+' '+ny[93]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[6,93]; 

paper.setStart(); 
mid=bb[7]+(bt[32]-bb[7])/2; 
hleft = nx[87]; 
hright = nx[7]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[7]+' '+bb[7]+' L '+nx[7]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[87]+' '+mid+' L '+nx[87]+' '+bt[87];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[7,87]; 

paper.setStart(); 
mid=bb[7]+(bt[32]-bb[7])/2; 
hleft = nx[32]; 
hright = nx[7]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[32]+' '+mid+' L '+nx[32]+' '+bt[32];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[7,32]; 

paper.setStart(); 
s1='M '+nx[8]+' '+bb[8]+' L '+nx[8]+' '+bt[22]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[8,22] ; 

paper.setStart(); 
s1='M '+nx[10]+' '+bb[10]+' L '+nx[10]+' '+ny[98]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[10,98]; 

paper.setStart(); 
s1='M '+nx[11]+' '+bb[11]+' L '+nx[11]+' '+ny[97]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[11]+' '+ny[97]+' L '+nx[40]+' '+ny[97]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[11,97]; 

paper.setStart(); 
s1='M '+nx[12]+' '+bb[12]+' L '+nx[12]+' '+bt[7]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[12,7] ; 

paper.setStart(); 
s1='M '+nx[13]+' '+bb[13]+' L '+nx[13]+' '+bt[19]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[13,19] ; 

paper.setStart(); 
s1='M '+nx[14]+' '+bb[14]+' L '+nx[14]+' '+bt[29]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[14,29] ; 

paper.setStart(); 
s1='M '+nx[15]+' '+bb[15]+' L '+nx[15]+' '+bt[1]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[15,1] ; 

paper.setStart(); 
s1='M '+nx[18]+' '+bb[18]+' L '+nx[18]+' '+bt[78]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[18,78] ; 

paper.setStart(); 
s1='M '+nx[19]+' '+bb[19]+' L '+nx[19]+' '+bt[5]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[19,5] ; 

paper.setStart(); 
mid=bb[21]+(bt[46]-bb[21])/2; 
s2='M '+nx[21]+' '+bb[21]+' L '+nx[21]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[82]+' '+mid+' L '+nx[82]+' '+bt[82];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[21,82]; 

paper.setStart(); 
mid=bb[21]+(bt[46]-bb[21])/2; 
s3='M '+nx[20]+' '+mid+' L '+nx[20]+' '+bt[20];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[21,20]; 

paper.setStart(); 
mid=bb[21]+(bt[46]-bb[21])/2; 
hleft = nx[86]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[86]+' '+mid+' L '+nx[86]+' '+bt[86];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[21,86]; 

paper.setStart(); 
mid=bb[21]+(bt[46]-bb[21])/2; 
s3='M '+nx[46]+' '+mid+' L '+nx[46]+' '+bt[46];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[21,46]; 

paper.setStart(); 
mid=bb[21]+(bt[46]-bb[21])/2; 
hleft = nx[30]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[30]+' '+mid+' L '+nx[30]+' '+bt[30];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[21,30]; 

paper.setStart(); 
mid=bb[21]+(bt[46]-bb[21])/2; 
s3='M '+nx[31]+' '+mid+' L '+nx[31]+' '+bt[31];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[21,31]; 

paper.setStart(); 
mid=bb[21]+(bt[46]-bb[21])/2; 
s3='M '+nx[16]+' '+mid+' L '+nx[16]+' '+bt[16];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[21,16]; 

paper.setStart(); 
s1='M '+nx[22]+' '+bb[22]+' L '+nx[22]+' '+bt[28]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[22,28] ; 

paper.setStart(); 
s1='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+bt[64]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[23,64] ; 

paper.setStart(); 
s1='M '+nx[24]+' '+bb[24]+' L '+nx[24]+' '+ny[95]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[24]+' '+ny[95]+' L '+nx[73]+' '+ny[95]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[24,95]; 

paper.setStart(); 
s1='M '+nx[25]+' '+bb[25]+' L '+nx[25]+' '+bt[12]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[25,12] ; 

paper.setStart(); 
s1='M '+nx[26]+' '+bb[26]+' L '+nx[26]+' '+bt[91]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[26,91] ; 

paper.setStart(); 
s1='M '+nx[27]+' '+bb[27]+' L '+nx[27]+' '+bt[3]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[27,3] ; 

paper.setStart(); 
s1='M '+nx[28]+' '+bb[28]+' L '+nx[28]+' '+bt[89]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[28,89] ; 

paper.setStart(); 
s1='M '+nx[29]+' '+bb[29]+' L '+nx[29]+' '+bt[15]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[29,15] ; 

paper.setStart(); 
mid=bb[33]+(bt[13]-bb[33])/2; 
hleft = nx[55]; 
hright = nx[33]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[33]+' '+bb[33]+' L '+nx[33]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[55]+' '+mid+' L '+nx[55]+' '+bt[55];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[33,55]; 

paper.setStart(); 
mid=bb[33]+(bt[13]-bb[33])/2; 
s3='M '+nx[42]+' '+mid+' L '+nx[42]+' '+bt[42];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[33,42]; 

paper.setStart(); 
mid=bb[33]+(bt[13]-bb[33])/2; 
hleft = nx[13]; 
hright = nx[33]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[13]+' '+mid+' L '+nx[13]+' '+bt[13];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[33,13]; 

paper.setStart(); 
s1='M '+nx[34]+' '+bb[34]+' L '+nx[34]+' '+ny[98]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[34,98]; 

paper.setStart(); 
s1='M '+nx[35]+' '+bb[35]+' L '+nx[35]+' '+bt[90]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[35,90] ; 

paper.setStart(); 
s1='M '+nx[39]+' '+bb[39]+' L '+nx[39]+' '+bt[24]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[39,24] ; 

paper.setStart(); 
s1='M '+nx[40]+' '+bb[40]+' L '+nx[40]+' '+ny[97]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[40,97]; 

paper.setStart(); 
s1='M '+nx[41]+' '+bb[41]+' L '+nx[41]+' '+ny[92]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[41]+' '+ny[92]+' L '+nx[51]+' '+ny[92]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[41,92]; 

paper.setStart(); 
s1='M '+nx[43]+' '+bb[43]+' L '+nx[43]+' '+bt[18]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[43,18] ; 

paper.setStart(); 
s1='M '+nx[44]+' '+bb[44]+' L '+nx[44]+' '+bt[85]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[44,85] ; 

paper.setStart(); 
s1='M '+nx[45]+' '+bb[45]+' L '+nx[45]+' '+ny[94]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[45]+' '+ny[94]+' L '+nx[65]+' '+ny[94]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[45,94]; 

paper.setStart(); 
s1='M '+nx[47]+' '+bb[47]+' L '+nx[47]+' '+bt[88]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[47,88] ; 

paper.setStart(); 
mid=bb[48]+(bt[17]-bb[48])/2; 
hleft = nx[0]; 
hright = nx[48]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[48]+' '+bb[48]+' L '+nx[48]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[0]+' '+mid+' L '+nx[0]+' '+bt[0];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[48,0]; 

paper.setStart(); 
mid=bb[48]+(bt[17]-bb[48])/2; 
s3='M '+nx[83]+' '+mid+' L '+nx[83]+' '+bt[83];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[48,83]; 

paper.setStart(); 
mid=bb[48]+(bt[17]-bb[48])/2; 
hleft = nx[17]; 
hright = nx[48]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[17]+' '+mid+' L '+nx[17]+' '+bt[17];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[48,17]; 

paper.setStart(); 
s1='M '+nx[49]+' '+bb[49]+' L '+nx[49]+' '+ny[96]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[49,96]; 

paper.setStart(); 
s1='M '+nx[50]+' '+bb[50]+' L '+nx[50]+' '+bt[33]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[50,33] ; 

paper.setStart(); 
s1='M '+nx[51]+' '+bb[51]+' L '+nx[51]+' '+ny[92]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[51,92]; 

paper.setStart(); 
mid=bb[52]+(bt[11]-bb[52])/2; 
hleft = nx[40]; 
hright = nx[52]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[52]+' '+bb[52]+' L '+nx[52]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[40]+' '+mid+' L '+nx[40]+' '+bt[40];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[49]=paper.setFinish(); 
lineNodes[49]=[52,40]; 

paper.setStart(); 
mid=bb[52]+(bt[11]-bb[52])/2; 
hleft = nx[11]; 
hright = nx[52]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[11]+' '+mid+' L '+nx[11]+' '+bt[11];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[52,11]; 

paper.setStart(); 
s1='M '+nx[53]+' '+bb[53]+' L '+nx[53]+' '+bt[47]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[53,47] ; 

paper.setStart(); 
mid=bb[54]+(bt[9]-bb[54])/2; 
hleft = nx[62]; 
hright = nx[54]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[54]+' '+bb[54]+' L '+nx[54]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[62]+' '+mid+' L '+nx[62]+' '+bt[62];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[54,62]; 

paper.setStart(); 
mid=bb[54]+(bt[9]-bb[54])/2; 
hleft = nx[9]; 
hright = nx[54]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[9]+' '+mid+' L '+nx[9]+' '+bt[9];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[54,9]; 

paper.setStart(); 
s1='M '+nx[56]+' '+bb[56]+' L '+nx[56]+' '+bt[52]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[56,52] ; 

paper.setStart(); 
s1='M '+nx[57]+' '+bb[57]+' L '+nx[57]+' '+bt[21]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[57,21] ; 

paper.setStart(); 
s1='M '+nx[58]+' '+bb[58]+' L '+nx[58]+' '+ny[96]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[58]+' '+ny[96]+' L '+nx[49]+' '+ny[96]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[58,96]; 

paper.setStart(); 
s1='M '+nx[59]+' '+bb[59]+' L '+nx[59]+' '+ny[98]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[59,98]; 

paper.setStart(); 
s1='M '+nx[60]+' '+bb[60]+' L '+nx[60]+' '+ny[98]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[60]+' '+ny[98]+' L '+nx[10]+' '+ny[98]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[60,98]; 

paper.setStart(); 
s1='M '+nx[61]+' '+bb[61]+' L '+nx[61]+' '+bt[14]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[61,14] ; 

paper.setStart(); 
s1='M '+nx[63]+' '+bb[63]+' L '+nx[63]+' '+ny[95]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[63,95]; 

paper.setStart(); 
s1='M '+nx[64]+' '+bb[64]+' L '+nx[64]+' '+bt[41]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[64,41] ; 

paper.setStart(); 
s1='M '+nx[65]+' '+bb[65]+' L '+nx[65]+' '+ny[94]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[65,94]; 

paper.setStart(); 
s1='M '+nx[66]+' '+bb[66]+' L '+nx[66]+' '+ny[93]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[66,93]; 

paper.setStart(); 
s1='M '+nx[67]+' '+bb[67]+' L '+nx[67]+' '+ny[93]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[67]+' '+ny[93]+' L '+nx[66]+' '+ny[93]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[67,93]; 

paper.setStart(); 
s1='M '+nx[68]+' '+bb[68]+' L '+nx[68]+' '+bt[37]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[68,37] ; 

paper.setStart(); 
s1='M '+nx[69]+' '+bb[69]+' L '+nx[69]+' '+bt[71]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[69,71] ; 

paper.setStart(); 
s1='M '+nx[70]+' '+bb[70]+' L '+nx[70]+' '+bt[77]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[70,77] ; 

paper.setStart(); 
mid=bb[71]+(bt[66]-bb[71])/2; 
hleft = nx[67]; 
hright = nx[71]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[71]+' '+bb[71]+' L '+nx[71]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[67]+' '+mid+' L '+nx[67]+' '+bt[67];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[71,67]; 

paper.setStart(); 
mid=bb[71]+(bt[66]-bb[71])/2; 
s3='M '+nx[6]+' '+mid+' L '+nx[6]+' '+bt[6];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[69]=paper.setFinish(); 
lineNodes[69]=[71,6]; 

paper.setStart(); 
mid=bb[71]+(bt[66]-bb[71])/2; 
hleft = nx[66]; 
hright = nx[71]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[66]+' '+mid+' L '+nx[66]+' '+bt[66];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[70]=paper.setFinish(); 
lineNodes[70]=[71,66]; 

paper.setStart(); 
mid=bb[71]+(bt[66]-bb[71])/2; 
s3='M '+nx[27]+' '+mid+' L '+nx[27]+' '+bt[27];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[71]=paper.setFinish(); 
lineNodes[71]=[71,27]; 

paper.setStart(); 
s1='M '+nx[72]+' '+bb[72]+' L '+nx[72]+' '+bt[43]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[72]=paper.setFinish(); 
lineNodes[72]=[72,43] ; 

paper.setStart(); 
s1='M '+nx[73]+' '+bb[73]+' L '+nx[73]+' '+ny[95]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[73]=paper.setFinish(); 
lineNodes[73]=[73,95]; 

paper.setStart(); 
s1='M '+nx[74]+' '+bb[74]+' L '+nx[74]+' '+bt[69]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[74]=paper.setFinish(); 
lineNodes[74]=[74,69] ; 

paper.setStart(); 
mid=bb[75]+(bt[80]-bb[75])/2; 
s2='M '+nx[75]+' '+bb[75]+' L '+nx[75]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[57]+' '+mid+' L '+nx[57]+' '+bt[57];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[75]=paper.setFinish(); 
lineNodes[75]=[75,57]; 

paper.setStart(); 
mid=bb[75]+(bt[80]-bb[75])/2; 
s3='M '+nx[4]+' '+mid+' L '+nx[4]+' '+bt[4];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[76]=paper.setFinish(); 
lineNodes[76]=[75,4]; 

paper.setStart(); 
mid=bb[75]+(bt[80]-bb[75])/2; 
hleft = nx[38]; 
hright = nx[75]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[38]+' '+mid+' L '+nx[38]+' '+bt[38];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[77]=paper.setFinish(); 
lineNodes[77]=[75,38]; 

paper.setStart(); 
mid=bb[75]+(bt[80]-bb[75])/2; 
hleft = nx[80]; 
hright = nx[75]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[80]+' '+mid+' L '+nx[80]+' '+bt[80];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[78]=paper.setFinish(); 
lineNodes[78]=[75,80]; 

paper.setStart(); 
mid=bb[76]+(bt[35]-bb[76])/2; 
hleft = nx[35]; 
hright = nx[76]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[76]+' '+bb[76]+' L '+nx[76]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[35]+' '+mid+' L '+nx[35]+' '+bt[35];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[79]=paper.setFinish(); 
lineNodes[79]=[76,35]; 

paper.setStart(); 
mid=bb[76]+(bt[35]-bb[76])/2; 
s3='M '+nx[50]+' '+mid+' L '+nx[50]+' '+bt[50];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[80]=paper.setFinish(); 
lineNodes[80]=[76,50]; 

paper.setStart(); 
mid=bb[76]+(bt[35]-bb[76])/2; 
hleft = nx[56]; 
hright = nx[76]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[56]+' '+mid+' L '+nx[56]+' '+bt[56];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[81]=paper.setFinish(); 
lineNodes[81]=[76,56]; 

paper.setStart(); 
s1='M '+nx[77]+' '+bb[77]+' L '+nx[77]+' '+bt[75]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[82]=paper.setFinish(); 
lineNodes[82]=[77,75] ; 

paper.setStart(); 
s1='M '+nx[78]+' '+bb[78]+' L '+nx[78]+' '+bt[70]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[83]=paper.setFinish(); 
lineNodes[83]=[78,70] ; 

paper.setStart(); 
mid=bb[79]+(bt[48]-bb[79])/2; 
hleft = nx[48]; 
hright = nx[79]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[79]+' '+bb[79]+' L '+nx[79]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[48]+' '+mid+' L '+nx[48]+' '+bt[48];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[84]=paper.setFinish(); 
lineNodes[84]=[79,48]; 

paper.setStart(); 
mid=bb[79]+(bt[48]-bb[79])/2; 
s3='M '+nx[8]+' '+mid+' L '+nx[8]+' '+bt[8];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[85]=paper.setFinish(); 
lineNodes[85]=[79,8]; 

paper.setStart(); 
mid=bb[79]+(bt[48]-bb[79])/2; 
hleft = nx[61]; 
hright = nx[79]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[61]+' '+mid+' L '+nx[61]+' '+bt[61];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[86]=paper.setFinish(); 
lineNodes[86]=[79,61]; 

paper.setStart(); 
s1='M '+nx[80]+' '+bb[80]+' L '+nx[80]+' '+bt[79]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[87]=paper.setFinish(); 
lineNodes[87]=[80,79] ; 

paper.setStart(); 
s1='M '+nx[81]+' '+bb[81]+' L '+nx[81]+' '+ny[98]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[88]=paper.setFinish(); 
lineNodes[88]=[81,98]; 

paper.setStart(); 
s1='M '+nx[82]+' '+bb[82]+' L '+nx[82]+' '+bt[54]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[89]=paper.setFinish(); 
lineNodes[89]=[82,54] ; 

paper.setStart(); 
s1='M '+nx[83]+' '+bb[83]+' L '+nx[83]+' '+bt[25]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[90]=paper.setFinish(); 
lineNodes[90]=[83,25] ; 

paper.setStart(); 
s1='M '+nx[84]+' '+bb[84]+' L '+nx[84]+' '+bt[73]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[91]=paper.setFinish(); 
lineNodes[91]=[84,73] ; 

paper.setStart(); 
s1='M '+nx[85]+' '+bb[85]+' L '+nx[85]+' '+bt[84]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[92]=paper.setFinish(); 
lineNodes[92]=[85,84] ; 

paper.setStart(); 
s1='M '+nx[88]+' '+bb[88]+' L '+nx[88]+' '+ny[92]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[93]=paper.setFinish(); 
lineNodes[93]=[88,92]; 

paper.setStart(); 
s1='M '+nx[89]+' '+bb[89]+' L '+nx[89]+' '+bt[36]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[94]=paper.setFinish(); 
lineNodes[94]=[89,36] ; 

paper.setStart(); 
mid=bb[90]+(bt[45]-bb[90])/2; 
hleft = nx[65]; 
hright = nx[90]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[90]+' '+bb[90]+' L '+nx[90]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[65]+' '+mid+' L '+nx[65]+' '+bt[65];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[95]=paper.setFinish(); 
lineNodes[95]=[90,65]; 

paper.setStart(); 
mid=bb[90]+(bt[45]-bb[90])/2; 
hleft = nx[45]; 
hright = nx[90]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[45]+' '+mid+' L '+nx[45]+' '+bt[45];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[96]=paper.setFinish(); 
lineNodes[96]=[90,45]; 

paper.setStart(); 
s1='M '+nx[91]+' '+bb[91]+' L '+nx[91]+' '+bt[72]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[97]=paper.setFinish(); 
lineNodes[97]=[91,72] ; 

paper.setStart(); 
s1='M '+nx[92]+' '+bb[92]+' L '+nx[92]+' '+bt[44]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[98]=paper.setFinish(); 
lineNodes[98]=[92,44] ; 

paper.setStart(); 
mid=bb[93]+(bt[49]-bb[93])/2; 
hleft = nx[49]; 
hright = nx[93]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[93]+' '+bb[93]+' L '+nx[93]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[49]+' '+mid+' L '+nx[49]+' '+bt[49];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[99]=paper.setFinish(); 
lineNodes[99]=[93,49]; 

paper.setStart(); 
mid=bb[93]+(bt[49]-bb[93])/2; 
hleft = nx[58]; 
hright = nx[93]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[58]+' '+mid+' L '+nx[58]+' '+bt[58];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[100]=paper.setFinish(); 
lineNodes[100]=[93,58]; 

paper.setStart(); 
s1='M '+nx[94]+' '+bb[94]+' L '+nx[94]+' '+bt[39]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[101]=paper.setFinish(); 
lineNodes[101]=[94,39] ; 

paper.setStart(); 
s1='M '+nx[95]+' '+bb[95]+' L '+nx[95]+' '+bt[2]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[102]=paper.setFinish(); 
lineNodes[102]=[95,2] ; 

paper.setStart(); 
mid=bb[96]+(bt[59]-bb[96])/2; 
hleft = nx[10]; 
hright = nx[96]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[96]+' '+bb[96]+' L '+nx[96]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[10]+' '+mid+' L '+nx[10]+' '+bt[10];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[103]=paper.setFinish(); 
lineNodes[103]=[96,10]; 

paper.setStart(); 
mid=bb[96]+(bt[59]-bb[96])/2; 
hleft = nx[60]; 
hright = nx[96]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[60]+' '+mid+' L '+nx[60]+' '+bt[60];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[104]=paper.setFinish(); 
lineNodes[104]=[96,60]; 

paper.setStart(); 
mid=bb[96]+(bt[59]-bb[96])/2; 
s3='M '+nx[59]+' '+mid+' L '+nx[59]+' '+bt[59];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[105]=paper.setFinish(); 
lineNodes[105]=[96,59]; 

paper.setStart(); 
mid=bb[96]+(bt[59]-bb[96])/2; 
s3='M '+nx[81]+' '+mid+' L '+nx[81]+' '+bt[81];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[106]=paper.setFinish(); 
lineNodes[106]=[96,81]; 

paper.setStart(); 
mid=bb[96]+(bt[59]-bb[96])/2; 
s3='M '+nx[34]+' '+mid+' L '+nx[34]+' '+bt[34];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[107]=paper.setFinish(); 
lineNodes[107]=[96,34]; 

paper.setStart(); 
mid=bb[97]+(bt[23]-bb[97])/2; 
hleft = nx[51]; 
hright = nx[97]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[97]+' '+bb[97]+' L '+nx[97]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[51]+' '+mid+' L '+nx[51]+' '+bt[51];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[108]=paper.setFinish(); 
lineNodes[108]=[97,51]; 

paper.setStart(); 
mid=bb[97]+(bt[23]-bb[97])/2; 
s3='M '+nx[53]+' '+mid+' L '+nx[53]+' '+bt[53];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[109]=paper.setFinish(); 
lineNodes[109]=[97,53]; 

paper.setStart(); 
mid=bb[97]+(bt[23]-bb[97])/2; 
hleft = nx[23]; 
hright = nx[97]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[23]+' '+mid+' L '+nx[23]+' '+bt[23];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[110]=paper.setFinish(); 
lineNodes[110]=[97,23]; 

paper.setStart(); 
s1='M '+nx[98]+' '+bb[98]+' L '+nx[98]+' '+bt[26]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[111]=paper.setFinish(); 
lineNodes[111]=[98,26] ; 

nlines = 112;
}