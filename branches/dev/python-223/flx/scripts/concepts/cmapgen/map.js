function initMap() { 

// Set size parameters 
mapWidth = 1793; 
mapHeight = 2252; 
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
rootx = 357; 
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

nnodes = 45; 
njunc = 2; 

nx[0]=494;
ny[0]=1139;
nx[1]=1580;
ny[1]=1253;
nx[2]=1176;
ny[2]=1706;
nx[3]=1340;
ny[3]=1640;
nx[4]=1088;
ny[4]=1838;
nx[5]=1091;
ny[5]=1117;
nx[6]=421;
ny[6]=994;
nx[7]=347;
ny[7]=744;
nx[8]=648;
ny[8]=1847;
nx[9]=1185;
ny[9]=2151;
nx[10]=1092;
ny[10]=1958;
nx[11]=1464;
ny[11]=1521;
nx[12]=590;
ny[12]=583;
nx[13]=746;
ny[13]=1713;
nx[14]=200;
ny[14]=426;
nx[15]=1339;
ny[15]=1253;
nx[16]=990;
ny[16]=2152;
nx[17]=517;
ny[17]=423;
nx[18]=777;
ny[18]=1145;
nx[19]=1188;
ny[19]=1260;
nx[20]=1461;
ny[20]=1364;
nx[21]=437;
ny[21]=581;
nx[22]=840;
ny[22]=1303;
nx[23]=268;
ny[23]=995;
nx[24]=1458;
ny[24]=1253;
nx[25]=1266;
ny[25]=968;
nx[26]=1366;
ny[26]=2151;
nx[27]=357;
ny[27]=420;
nx[28]=637;
ny[28]=979;
nx[29]=425;
ny[29]=1299;
nx[30]=357;
ny[30]=267;
nx[31]=1272;
ny[31]=1838;
nx[32]=357;
ny[32]=100;
nx[33]=1277;
ny[33]=1959;
nx[34]=1003;
ny[34]=1247;
nx[35]=1593;
ny[35]=1642;
nx[36]=1464;
ny[36]=1641;
nx[37]=708;
ny[37]=1315;
nx[38]=357;
ny[38]=173;
nx[39]=567;
ny[39]=1295;
nx[40]=514;
ny[40]=746;
nx[41]=840;
ny[41]=1848;
nx[42]=1458;
ny[42]=1119;
nx[43]=1185;
ny[43]=2036;
nx[44]=1047;
ny[44]=1438;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[18, 28, 29, 39]; 
members[1]=[24, 42, 15]; 
members[2]=[44, 4, 13, 31]; 
members[3]=[35, 11, 36]; 
members[4]=[10, 2, 31]; 
members[5]=[25, 34, 19, 42]; 
members[6]=[40, 25, 28, 23]; 
members[7]=[40, 21]; 
members[8]=[41, 13]; 
members[9]=[16, 26, 43]; 
members[10]=[43, 4]; 
members[11]=[3, 36, 44, 35, 20]; 
members[12]=[17, 21]; 
members[13]=[8, 41, 2, 44]; 
members[14]=[17, 27, 30]; 
members[15]=[24, 1, 42]; 
members[16]=[9, 26, 43]; 
members[17]=[12, 14, 21, 27, 30]; 
members[18]=[0, 28, 37, 22]; 
members[19]=[34, 5]; 
members[20]=[24, 11, 44]; 
members[21]=[40, 17, 12, 7]; 
members[22]=[18, 44, 37]; 
members[23]=[40, 25, 28, 6]; 
members[24]=[1, 42, 20, 15]; 
members[25]=[5, 6, 40, 42, 23, 28]; 
members[26]=[16, 9, 43]; 
members[27]=[17, 14, 30]; 
members[28]=[0, 6, 40, 18, 23, 25]; 
members[29]=[0, 39]; 
members[30]=[17, 27, 38, 14]; 
members[31]=[33, 2, 4]; 
members[32]=[38]; 
members[33]=[43, 31]; 
members[34]=[19, 5]; 
members[35]=[3, 11, 36]; 
members[36]=[3, 35, 11]; 
members[37]=[18, 22]; 
members[38]=[32, 30]; 
members[39]=[0, 29]; 
members[40]=[6, 7, 21, 23, 25, 28]; 
members[41]=[8, 13]; 
members[42]=[1, 5, 15, 24, 25]; 
members[43]=[33, 9, 10, 16, 26]; 
members[44]=[2, 11, 13, 20, 22]; 

return members[i]; 
} 

function drawMap(sfac) { 

var rect; 
var tbox; 

paper.clear(); 

t[0]=paper.text(nx[0],ny[0],'Decimal\nAddition').attr({fill:"#666666","font-size": 14*sfac[0]});
tBox=t[0].getBBox(); 
bt[0]=ny[0]-(tBox.height/2+10*sfac[0]);
bb[0]=ny[0]+(tBox.height/2+10*sfac[0]);
bl[0]=nx[0]-(tBox.width/2+10*sfac[0]);
br[0]=nx[0]+(tBox.width/2+10*sfac[0]);
paper.setStart(); 
rect=paper.rect(bl[0], bt[0], br[0]-bl[0], bb[0]-bt[0], 10*sfac[0]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[0]=paper.setFinish(); 

t[1]=paper.text(nx[1],ny[1],'Estimating\nFractions').attr({fill:"#666666","font-size": 14*sfac[1]});
tBox=t[1].getBBox(); 
bt[1]=ny[1]-(tBox.height/2+10*sfac[1]);
bb[1]=ny[1]+(tBox.height/2+10*sfac[1]);
bl[1]=nx[1]-(tBox.width/2+10*sfac[1]);
br[1]=nx[1]+(tBox.width/2+10*sfac[1]);
paper.setStart(); 
rect=paper.rect(bl[1], bt[1], br[1]-bl[1], bb[1]-bt[1], 10*sfac[1]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[1]=paper.setFinish(); 

t[2]=paper.text(nx[2],ny[2],'Percents').attr({fill:"#666666","font-size": 14*sfac[2]});
tBox=t[2].getBBox(); 
bt[2]=ny[2]-(tBox.height/2+10*sfac[2]);
bb[2]=ny[2]+(tBox.height/2+10*sfac[2]);
bl[2]=nx[2]-(tBox.width/2+10*sfac[2]);
br[2]=nx[2]+(tBox.width/2+10*sfac[2]);
paper.setStart(); 
rect=paper.rect(bl[2], bt[2], br[2]-bl[2], bb[2]-bt[2], 10*sfac[2]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[2]=paper.setFinish(); 

t[3]=paper.text(nx[3],ny[3],'Ratios').attr({fill:"#666666","font-size": 14*sfac[3]});
tBox=t[3].getBBox(); 
bt[3]=ny[3]-(tBox.height/2+10*sfac[3]);
bb[3]=ny[3]+(tBox.height/2+10*sfac[3]);
bl[3]=nx[3]-(tBox.width/2+10*sfac[3]);
br[3]=nx[3]+(tBox.width/2+10*sfac[3]);
paper.setStart(); 
rect=paper.rect(bl[3], bt[3], br[3]-bl[3], bb[3]-bt[3], 10*sfac[3]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[3]=paper.setFinish(); 

t[4]=paper.text(nx[4],ny[4],'Converting a\nDecimal to\na Percent').attr({fill:"#666666","font-size": 14*sfac[4]});
tBox=t[4].getBBox(); 
bt[4]=ny[4]-(tBox.height/2+10*sfac[4]);
bb[4]=ny[4]+(tBox.height/2+10*sfac[4]);
bl[4]=nx[4]-(tBox.width/2+10*sfac[4]);
br[4]=nx[4]+(tBox.width/2+10*sfac[4]);
paper.setStart(); 
rect=paper.rect(bl[4], bt[4], br[4]-bl[4], bb[4]-bt[4], 10*sfac[4]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[4]=paper.setFinish(); 

t[5]=paper.text(nx[5],ny[5]-10,'Forms of\nFractions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[5]});
t[5].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-of-Rational-Numbers/#Forms of Fractions", target: "_top",title:"Click to jump to concept"});
}); 
t[5].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[5].getBBox(); 
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
yicon = bb[5]-25; 
xicon2 = nx[5]+-40; 
xicon3 = nx[5]+-10; 
xicon4 = nx[5]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Properties-of-Rational-Numbers/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Properties-of-Rational-Numbers/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Properties-of-Rational-Numbers/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[5], bt[5], br[5]-bl[5], bb[5]-bt[5], 10*sfac[5]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[5]=paper.setFinish(); 
t[5].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[6]=paper.text(nx[6],ny[6],'Least\nCommon\nMultiple').attr({fill:"#666666","font-size": 14*sfac[6]});
tBox=t[6].getBBox(); 
bt[6]=ny[6]-(tBox.height/2+10*sfac[6]);
bb[6]=ny[6]+(tBox.height/2+10*sfac[6]);
bl[6]=nx[6]-(tBox.width/2+10*sfac[6]);
br[6]=nx[6]+(tBox.width/2+10*sfac[6]);
paper.setStart(); 
rect=paper.rect(bl[6], bt[6], br[6]-bl[6], bb[6]-bt[6], 10*sfac[6]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[6]=paper.setFinish(); 

t[7]=paper.text(nx[7],ny[7],'Prime and\nComposite\nNumbers').attr({fill:"#666666","font-size": 14*sfac[7]});
tBox=t[7].getBBox(); 
bt[7]=ny[7]-(tBox.height/2+10*sfac[7]);
bb[7]=ny[7]+(tBox.height/2+10*sfac[7]);
bl[7]=nx[7]-(tBox.width/2+10*sfac[7]);
br[7]=nx[7]+(tBox.width/2+10*sfac[7]);
paper.setStart(); 
rect=paper.rect(bl[7], bt[7], br[7]-bl[7], bb[7]-bt[7], 10*sfac[7]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[7]=paper.setFinish(); 

t[8]=paper.text(nx[8],ny[8],'Converting Fractions\nto Decimals').attr({fill:"#666666","font-size": 14*sfac[8]});
tBox=t[8].getBBox(); 
bt[8]=ny[8]-(tBox.height/2+10*sfac[8]);
bb[8]=ny[8]+(tBox.height/2+10*sfac[8]);
bl[8]=nx[8]-(tBox.width/2+10*sfac[8]);
br[8]=nx[8]+(tBox.width/2+10*sfac[8]);
paper.setStart(); 
rect=paper.rect(bl[8], bt[8], br[8]-bl[8], bb[8]-bt[8], 10*sfac[8]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[8]=paper.setFinish(); 

t[9]=paper.text(nx[9],ny[9]-10,'Finding the Percent\nEquation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[9]});
t[9].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Finding-the-percent-equation./#Finding the Percent Equation", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Finding-the-percent-equation./#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[9], bt[9], br[9]-bl[9], bb[9]-bt[9], 10*sfac[9]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[9]=paper.setFinish(); 
t[9].toFront(); 
vidicon.toFront(); 

t[10]=paper.text(nx[10],ny[10],'Converting a\nPercent to\na Decimal').attr({fill:"#666666","font-size": 14*sfac[10]});
tBox=t[10].getBBox(); 
bt[10]=ny[10]-(tBox.height/2+10*sfac[10]);
bb[10]=ny[10]+(tBox.height/2+10*sfac[10]);
bl[10]=nx[10]-(tBox.width/2+10*sfac[10]);
br[10]=nx[10]+(tBox.width/2+10*sfac[10]);
paper.setStart(); 
rect=paper.rect(bl[10], bt[10], br[10]-bl[10], bb[10]-bt[10], 10*sfac[10]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[10]=paper.setFinish(); 

t[11]=paper.text(nx[11],ny[11]-10,'Ratios,\nRates,\nProportions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[11]});
t[11].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Solving-Equations-with-Ratios-and-Proportions/#Ratios, Rates, Proportions", target: "_top",title:"Click to jump to concept"});
}); 
t[11].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[11].getBBox(); 
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
yicon = bb[11]-25; 
xicon2 = nx[11]+-40; 
xicon3 = nx[11]+-10; 
xicon4 = nx[11]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Solving-Equations-with-Ratios-and-Proportions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Solving-Equations-with-Ratios-and-Proportions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Solving-Equations-with-Ratios-and-Proportions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[11]=paper.setFinish(); 
t[11].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[12]=paper.text(nx[12],ny[12],'Whole Number\nExponents').attr({fill:"#666666","font-size": 14*sfac[12]});
tBox=t[12].getBBox(); 
bt[12]=ny[12]-(tBox.height/2+10*sfac[12]);
bb[12]=ny[12]+(tBox.height/2+10*sfac[12]);
bl[12]=nx[12]-(tBox.width/2+10*sfac[12]);
br[12]=nx[12]+(tBox.width/2+10*sfac[12]);
paper.setStart(); 
rect=paper.rect(bl[12], bt[12], br[12]-bl[12], bb[12]-bt[12], 10*sfac[12]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[12]=paper.setFinish(); 

t[13]=paper.text(nx[13],ny[13]-10,'Comparison and\nConversion of Numbers').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[13]});
t[13].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Classifying-and-Ordering-Real-Numbers/#Comparison and Conversion of Numbers", target: "_top",title:"Click to jump to concept"});
}); 
t[13].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[13].getBBox(); 
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
yicon = bb[13]-25; 
xicon2 = nx[13]+-40; 
xicon3 = nx[13]+-10; 
xicon4 = nx[13]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Classifying-and-Ordering-Real-Numbers/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Classifying-and-Ordering-Real-Numbers/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Classifying-and-Ordering-Real-Numbers/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[13], bt[13], br[13]-bl[13], bb[13]-bt[13], 10*sfac[13]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[13]=paper.setFinish(); 
t[13].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[14]=paper.text(nx[14],ny[14],'Estimation and\nRounding').attr({fill:"#666666","font-size": 14*sfac[14]});
tBox=t[14].getBBox(); 
bt[14]=ny[14]-(tBox.height/2+10*sfac[14]);
bb[14]=ny[14]+(tBox.height/2+10*sfac[14]);
bl[14]=nx[14]-(tBox.width/2+10*sfac[14]);
br[14]=nx[14]+(tBox.width/2+10*sfac[14]);
paper.setStart(); 
rect=paper.rect(bl[14], bt[14], br[14]-bl[14], bb[14]-bt[14], 10*sfac[14]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[14]=paper.setFinish(); 

t[15]=paper.text(nx[15],ny[15]-10,'Fraction\nSubtraction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[15]});
t[15].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Subtracting-Rational-Numbers/#Fraction Subtraction", target: "_top",title:"Click to jump to concept"});
}); 
t[15].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[15].getBBox(); 
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
yicon = bb[15]-25; 
xicon2 = nx[15]+-40; 
xicon3 = nx[15]+-10; 
xicon4 = nx[15]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Subtracting-Rational-Numbers/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Subtracting-Rational-Numbers/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Subtracting-Rational-Numbers/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[15], bt[15], br[15]-bl[15], bb[15]-bt[15], 10*sfac[15]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[15]=paper.setFinish(); 
t[15].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[16]=paper.text(nx[16],ny[16]-10,'Convert between Decimals,\nFractions, and Percentages').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[16]});
t[16].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Percentages/#Convert between Decimals, Fractions, and Percentages", target: "_top",title:"Click to jump to concept"});
}); 
t[16].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[16].getBBox(); 
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
yicon = bb[16]-25; 
xicon2 = nx[16]+-40; 
xicon3 = nx[16]+-10; 
xicon4 = nx[16]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Percentages/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Percentages/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[16], bt[16], br[16]-bl[16], bb[16]-bt[16], 10*sfac[16]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[16]=paper.setFinish(); 
t[16].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[17]=paper.text(nx[17],ny[17],'Whole Number\nMultiplication').attr({fill:"#666666","font-size": 14*sfac[17]});
tBox=t[17].getBBox(); 
bt[17]=ny[17]-(tBox.height/2+10*sfac[17]);
bb[17]=ny[17]+(tBox.height/2+10*sfac[17]);
bl[17]=nx[17]-(tBox.width/2+10*sfac[17]);
br[17]=nx[17]+(tBox.width/2+10*sfac[17]);
paper.setStart(); 
rect=paper.rect(bl[17], bt[17], br[17]-bl[17], bb[17]-bt[17], 10*sfac[17]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[17]=paper.setFinish(); 

t[18]=paper.text(nx[18],ny[18],'Decimal\nMultiplication').attr({fill:"#666666","font-size": 14*sfac[18]});
tBox=t[18].getBBox(); 
bt[18]=ny[18]-(tBox.height/2+10*sfac[18]);
bb[18]=ny[18]+(tBox.height/2+10*sfac[18]);
bl[18]=nx[18]-(tBox.width/2+10*sfac[18]);
br[18]=nx[18]+(tBox.width/2+10*sfac[18]);
paper.setStart(); 
rect=paper.rect(bl[18], bt[18], br[18]-bl[18], bb[18]-bt[18], 10*sfac[18]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[18]=paper.setFinish(); 

t[19]=paper.text(nx[19],ny[19],'Proper Fractions,\nImproper Fractions,\nMixed Numbers').attr({fill:"#666666","font-size": 14*sfac[19]});
tBox=t[19].getBBox(); 
bt[19]=ny[19]-(tBox.height/2+10*sfac[19]);
bb[19]=ny[19]+(tBox.height/2+10*sfac[19]);
bl[19]=nx[19]-(tBox.width/2+10*sfac[19]);
br[19]=nx[19]+(tBox.width/2+10*sfac[19]);
paper.setStart(); 
rect=paper.rect(bl[19], bt[19], br[19]-bl[19], bb[19]-bt[19], 10*sfac[19]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[19]=paper.setFinish(); 

t[20]=paper.text(nx[20],ny[20]-10,'Fraction\nDivision').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[20]});
t[20].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Dividing-with-Rational-Numbers/#Fraction Division", target: "_top",title:"Click to jump to concept"});
}); 
t[20].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[20].getBBox(); 
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
yicon = bb[20]-25; 
xicon2 = nx[20]+-40; 
xicon3 = nx[20]+-10; 
xicon4 = nx[20]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Dividing-with-Rational-Numbers/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Dividing-with-Rational-Numbers/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Dividing-with-Rational-Numbers/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[20], bt[20], br[20]-bl[20], bb[20]-bt[20], 10*sfac[20]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[20]=paper.setFinish(); 
t[20].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[21]=paper.text(nx[21],ny[21],'Whole Number\nDivision').attr({fill:"#666666","font-size": 14*sfac[21]});
tBox=t[21].getBBox(); 
bt[21]=ny[21]-(tBox.height/2+10*sfac[21]);
bb[21]=ny[21]+(tBox.height/2+10*sfac[21]);
bl[21]=nx[21]-(tBox.width/2+10*sfac[21]);
br[21]=nx[21]+(tBox.width/2+10*sfac[21]);
paper.setStart(); 
rect=paper.rect(bl[21], bt[21], br[21]-bl[21], bb[21]-bt[21], 10*sfac[21]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[21]=paper.setFinish(); 

t[22]=paper.text(nx[22],ny[22],'Decimal\nDivision').attr({fill:"#666666","font-size": 14*sfac[22]});
tBox=t[22].getBBox(); 
bt[22]=ny[22]-(tBox.height/2+10*sfac[22]);
bb[22]=ny[22]+(tBox.height/2+10*sfac[22]);
bl[22]=nx[22]-(tBox.width/2+10*sfac[22]);
br[22]=nx[22]+(tBox.width/2+10*sfac[22]);
paper.setStart(); 
rect=paper.rect(bl[22], bt[22], br[22]-bl[22], bb[22]-bt[22], 10*sfac[22]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[22]=paper.setFinish(); 

t[23]=paper.text(nx[23],ny[23],'Greatest\nCommon\nFactor').attr({fill:"#666666","font-size": 14*sfac[23]});
tBox=t[23].getBBox(); 
bt[23]=ny[23]-(tBox.height/2+10*sfac[23]);
bb[23]=ny[23]+(tBox.height/2+10*sfac[23]);
bl[23]=nx[23]-(tBox.width/2+10*sfac[23]);
br[23]=nx[23]+(tBox.width/2+10*sfac[23]);
paper.setStart(); 
rect=paper.rect(bl[23], bt[23], br[23]-bl[23], bb[23]-bt[23], 10*sfac[23]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[23]=paper.setFinish(); 

t[24]=paper.text(nx[24],ny[24]-10,'Fraction\nMultiplication').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[24]});
t[24].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multiplying-Rational-Numbers/#Fraction Multiplication", target: "_top",title:"Click to jump to concept"});
}); 
t[24].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[24].getBBox(); 
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
yicon = bb[24]-25; 
xicon2 = nx[24]+-40; 
xicon3 = nx[24]+-10; 
xicon4 = nx[24]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplying-Rational-Numbers/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplying-Rational-Numbers/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplying-Rational-Numbers/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[24], bt[24], br[24]-bl[24], bb[24]-bt[24], 10*sfac[24]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[24]=paper.setFinish(); 
t[24].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[25]=paper.text(nx[25],ny[25]-10,'Fractions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[25]});
t[25].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Using-Reciprocals-to-Solve-Real-World-Problems/#Fractions", target: "_top",title:"Click to jump to concept"});
}); 
t[25].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[25].getBBox(); 
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
yicon = bb[25]-25; 
xicon2 = nx[25]+-40; 
xicon3 = nx[25]+-10; 
xicon4 = nx[25]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Using-Reciprocals-to-Solve-Real-World-Problems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Using-Reciprocals-to-Solve-Real-World-Problems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[25], bt[25], br[25]-bl[25], bb[25]-bt[25], 10*sfac[25]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[25]=paper.setFinish(); 
t[25].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[26]=paper.text(nx[26],ny[26]-10,'Finding the Percent\nof Change').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[26]});
t[26].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Percent-of-Change/#Finding the Percent of Change", target: "_top",title:"Click to jump to concept"});
}); 
t[26].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[26].getBBox(); 
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
yicon = bb[26]-25; 
xicon2 = nx[26]+-40; 
xicon3 = nx[26]+-10; 
xicon4 = nx[26]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Percent-of-Change/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Percent-of-Change/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[26], bt[26], br[26]-bl[26], bb[26]-bt[26], 10*sfac[26]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[26]=paper.setFinish(); 
t[26].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[27]=paper.text(nx[27],ny[27],'Whole Number\nSubtraction').attr({fill:"#666666","font-size": 14*sfac[27]});
tBox=t[27].getBBox(); 
bt[27]=ny[27]-(tBox.height/2+10*sfac[27]);
bb[27]=ny[27]+(tBox.height/2+10*sfac[27]);
bl[27]=nx[27]-(tBox.width/2+10*sfac[27]);
br[27]=nx[27]+(tBox.width/2+10*sfac[27]);
paper.setStart(); 
rect=paper.rect(bl[27], bt[27], br[27]-bl[27], bb[27]-bt[27], 10*sfac[27]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[27]=paper.setFinish(); 

t[28]=paper.text(nx[28],ny[28],'Decimals').attr({fill:"#666666","font-size": 14*sfac[28]});
tBox=t[28].getBBox(); 
bt[28]=ny[28]-(tBox.height/2+10*sfac[28]);
bb[28]=ny[28]+(tBox.height/2+10*sfac[28]);
bl[28]=nx[28]-(tBox.width/2+10*sfac[28]);
br[28]=nx[28]+(tBox.width/2+10*sfac[28]);
paper.setStart(); 
rect=paper.rect(bl[28], bt[28], br[28]-bl[28], bb[28]-bt[28], 10*sfac[28]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[28]=paper.setFinish(); 

t[29]=paper.text(nx[29],ny[29],'Decimal\nEstimating and\nRounding').attr({fill:"#666666","font-size": 14*sfac[29]});
tBox=t[29].getBBox(); 
bt[29]=ny[29]-(tBox.height/2+10*sfac[29]);
bb[29]=ny[29]+(tBox.height/2+10*sfac[29]);
bl[29]=nx[29]-(tBox.width/2+10*sfac[29]);
br[29]=nx[29]+(tBox.width/2+10*sfac[29]);
paper.setStart(); 
rect=paper.rect(bl[29], bt[29], br[29]-bl[29], bb[29]-bt[29], 10*sfac[29]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[29]=paper.setFinish(); 

t[30]=paper.text(nx[30],ny[30]-10,'Whole Number\nAddition').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[30]});
t[30].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Addition-of-Integers/#Whole Number Addition", target: "_top",title:"Click to jump to concept"});
}); 
t[30].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[30].getBBox(); 
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
yicon = bb[30]-25; 
xicon2 = nx[30]+-40; 
xicon3 = nx[30]+-10; 
xicon4 = nx[30]+20; 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Addition-of-Integers/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[30], bt[30], br[30]-bl[30], bb[30]-bt[30], 10*sfac[30]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[30]=paper.setFinish(); 
t[30].toFront(); 
atticon.toFront(); 

t[31]=paper.text(nx[31],ny[31],'Converting a\nFraction to\na Percent').attr({fill:"#666666","font-size": 14*sfac[31]});
tBox=t[31].getBBox(); 
bt[31]=ny[31]-(tBox.height/2+10*sfac[31]);
bb[31]=ny[31]+(tBox.height/2+10*sfac[31]);
bl[31]=nx[31]-(tBox.width/2+10*sfac[31]);
br[31]=nx[31]+(tBox.width/2+10*sfac[31]);
paper.setStart(); 
rect=paper.rect(bl[31], bt[31], br[31]-bl[31], bb[31]-bt[31], 10*sfac[31]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[31]=paper.setFinish(); 

t[32]=paper.text(nx[32],ny[32],'Arithmetic').attr({fill:"#000000","font-size": 24*sfac[32]});
tBox=t[32].getBBox(); 
bt[32]=ny[32]-(tBox.height/2+10*sfac[32]);
bb[32]=ny[32]+(tBox.height/2+10*sfac[32]);
bl[32]=nx[32]-(tBox.width/2+10*sfac[32]);
br[32]=nx[32]+(tBox.width/2+10*sfac[32]);
paper.setStart(); 
rect=paper.rect(bl[32], bt[32], br[32]-bl[32], bb[32]-bt[32], 10*sfac[32]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[32]=paper.setFinish(); 

t[33]=paper.text(nx[33],ny[33],'Converting a\nPercent to\na Fraction').attr({fill:"#666666","font-size": 14*sfac[33]});
tBox=t[33].getBBox(); 
bt[33]=ny[33]-(tBox.height/2+10*sfac[33]);
bb[33]=ny[33]+(tBox.height/2+10*sfac[33]);
bl[33]=nx[33]-(tBox.width/2+10*sfac[33]);
br[33]=nx[33]+(tBox.width/2+10*sfac[33]);
paper.setStart(); 
rect=paper.rect(bl[33], bt[33], br[33]-bl[33], bb[33]-bt[33], 10*sfac[33]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[33]=paper.setFinish(); 

t[34]=paper.text(nx[34],ny[34],'Equivalent Fractions').attr({fill:"#666666","font-size": 14*sfac[34]});
tBox=t[34].getBBox(); 
bt[34]=ny[34]-(tBox.height/2+10*sfac[34]);
bb[34]=ny[34]+(tBox.height/2+10*sfac[34]);
bl[34]=nx[34]-(tBox.width/2+10*sfac[34]);
br[34]=nx[34]+(tBox.width/2+10*sfac[34]);
paper.setStart(); 
rect=paper.rect(bl[34], bt[34], br[34]-bl[34], bb[34]-bt[34], 10*sfac[34]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[34]=paper.setFinish(); 

t[35]=paper.text(nx[35],ny[35],'Proportions').attr({fill:"#666666","font-size": 14*sfac[35]});
tBox=t[35].getBBox(); 
bt[35]=ny[35]-(tBox.height/2+10*sfac[35]);
bb[35]=ny[35]+(tBox.height/2+10*sfac[35]);
bl[35]=nx[35]-(tBox.width/2+10*sfac[35]);
br[35]=nx[35]+(tBox.width/2+10*sfac[35]);
paper.setStart(); 
rect=paper.rect(bl[35], bt[35], br[35]-bl[35], bb[35]-bt[35], 10*sfac[35]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[35]=paper.setFinish(); 

t[36]=paper.text(nx[36],ny[36],'Rates').attr({fill:"#666666","font-size": 14*sfac[36]});
tBox=t[36].getBBox(); 
bt[36]=ny[36]-(tBox.height/2+10*sfac[36]);
bb[36]=ny[36]+(tBox.height/2+10*sfac[36]);
bl[36]=nx[36]-(tBox.width/2+10*sfac[36]);
br[36]=nx[36]+(tBox.width/2+10*sfac[36]);
paper.setStart(); 
rect=paper.rect(bl[36], bt[36], br[36]-bl[36], bb[36]-bt[36], 10*sfac[36]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[36]=paper.setFinish(); 

t[37]=paper.text(nx[37],ny[37],'Scientific\nNotation with\nWhole Number\nExponents').attr({fill:"#666666","font-size": 14*sfac[37]});
tBox=t[37].getBBox(); 
bt[37]=ny[37]-(tBox.height/2+10*sfac[37]);
bb[37]=ny[37]+(tBox.height/2+10*sfac[37]);
bl[37]=nx[37]-(tBox.width/2+10*sfac[37]);
br[37]=nx[37]+(tBox.width/2+10*sfac[37]);
paper.setStart(); 
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[37]=paper.setFinish(); 

t[38]=paper.text(nx[38],ny[38],'Whole Numbers').attr({fill:"#666666","font-size": 14*sfac[38]});
tBox=t[38].getBBox(); 
bt[38]=ny[38]-(tBox.height/2+10*sfac[38]);
bb[38]=ny[38]+(tBox.height/2+10*sfac[38]);
bl[38]=nx[38]-(tBox.width/2+10*sfac[38]);
br[38]=nx[38]+(tBox.width/2+10*sfac[38]);
paper.setStart(); 
rect=paper.rect(bl[38], bt[38], br[38]-bl[38], bb[38]-bt[38], 10*sfac[38]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[38]=paper.setFinish(); 

t[39]=paper.text(nx[39],ny[39],'Decimal\nSubtraction').attr({fill:"#666666","font-size": 14*sfac[39]});
tBox=t[39].getBBox(); 
bt[39]=ny[39]-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
paper.setStart(); 
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 

t[40]=paper.text(nx[40],ny[40],'Factors,\nMultiples,\nDivisibility').attr({fill:"#666666","font-size": 14*sfac[40]});
tBox=t[40].getBBox(); 
bt[40]=ny[40]-(tBox.height/2+10*sfac[40]);
bb[40]=ny[40]+(tBox.height/2+10*sfac[40]);
bl[40]=nx[40]-(tBox.width/2+10*sfac[40]);
br[40]=nx[40]+(tBox.width/2+10*sfac[40]);
paper.setStart(); 
rect=paper.rect(bl[40], bt[40], br[40]-bl[40], bb[40]-bt[40], 10*sfac[40]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[40]=paper.setFinish(); 

t[41]=paper.text(nx[41],ny[41],'Converting Decimals\nto Fractions').attr({fill:"#666666","font-size": 14*sfac[41]});
tBox=t[41].getBBox(); 
bt[41]=ny[41]-(tBox.height/2+10*sfac[41]);
bb[41]=ny[41]+(tBox.height/2+10*sfac[41]);
bl[41]=nx[41]-(tBox.width/2+10*sfac[41]);
br[41]=nx[41]+(tBox.width/2+10*sfac[41]);
paper.setStart(); 
rect=paper.rect(bl[41], bt[41], br[41]-bl[41], bb[41]-bt[41], 10*sfac[41]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[41]=paper.setFinish(); 

t[42]=paper.text(nx[42],ny[42]-10,'Fraction\nAddition').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[42]});
t[42].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Adding-Rational-Numbers/#Fraction Addition", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Adding-Rational-Numbers/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Adding-Rational-Numbers/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Adding-Rational-Numbers/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[42], bt[42], br[42]-bl[42], bb[42]-bt[42], 10*sfac[42]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[42]=paper.setFinish(); 
t[42].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

bb[43]= ny[43]; 
bt[43]= ny[43]; 
bl[43]= nx[43]; 
br[43]= nx[43]; 

bb[44]= ny[44]; 
bt[44]= ny[44]; 
bl[44]= nx[44]; 
br[44]= nx[44]; 

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
mid=bb[0]+(bt[39]-bb[0])/2; 
hleft = nx[39]; 
hright = nx[0]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[0]+' '+bb[0]+' L '+nx[0]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[39]+' '+mid+' L '+nx[39]+' '+bt[39];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[0,39]; 

paper.setStart(); 
mid=bb[0]+(bt[39]-bb[0])/2; 
hleft = nx[29]; 
hright = nx[0]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[29]+' '+mid+' L '+nx[29]+' '+bt[29];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[0,29]; 

paper.setStart(); 
mid=bb[2]+(bt[4]-bb[2])/2; 
hleft = nx[31]; 
hright = nx[2]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[2]+' '+bb[2]+' L '+nx[2]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[31]+' '+mid+' L '+nx[31]+' '+bt[31];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[2,31]; 

paper.setStart(); 
mid=bb[2]+(bt[4]-bb[2])/2; 
hleft = nx[4]; 
hright = nx[2]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[4]+' '+mid+' L '+nx[4]+' '+bt[4];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[2,4]; 

paper.setStart(); 
s1='M '+nx[4]+' '+bb[4]+' L '+nx[4]+' '+bt[10]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[4,10] ; 

paper.setStart(); 
mid=bb[5]+(bt[34]-bb[5])/2; 
hleft = nx[34]; 
hright = nx[5]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[5]+' '+bb[5]+' L '+nx[5]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[34]+' '+mid+' L '+nx[34]+' '+bt[34];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[5,34]; 

paper.setStart(); 
mid=bb[5]+(bt[34]-bb[5])/2; 
hleft = nx[19]; 
hright = nx[5]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[19]+' '+mid+' L '+nx[19]+' '+bt[19];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[5,19]; 

paper.setStart(); 
s1='M '+nx[10]+' '+bb[10]+' L '+nx[10]+' '+ny[43]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[10]+' '+ny[43]+' L '+nx[33]+' '+ny[43]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[10,43]; 

paper.setStart(); 
mid=bb[11]+(bt[3]-bb[11])/2; 
s2='M '+nx[11]+' '+bb[11]+' L '+nx[11]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[36]+' '+mid+' L '+nx[36]+' '+bt[36];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[11,36]; 

paper.setStart(); 
mid=bb[11]+(bt[3]-bb[11])/2; 
hleft = nx[35]; 
hright = nx[11]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[35]+' '+mid+' L '+nx[35]+' '+bt[35];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[11,35]; 

paper.setStart(); 
mid=bb[11]+(bt[3]-bb[11])/2; 
hleft = nx[3]; 
hright = nx[11]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[3]+' '+mid+' L '+nx[3]+' '+bt[3];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[11,3]; 

paper.setStart(); 
mid=bb[13]+(bt[8]-bb[13])/2; 
hleft = nx[8]; 
hright = nx[13]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[13]+' '+bb[13]+' L '+nx[13]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[8]+' '+mid+' L '+nx[8]+' '+bt[8];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[13,8]; 

paper.setStart(); 
mid=bb[13]+(bt[8]-bb[13])/2; 
hleft = nx[41]; 
hright = nx[13]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[41]+' '+mid+' L '+nx[41]+' '+bt[41];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[13,41]; 

paper.setStart(); 
mid=bb[17]+(bt[21]-bb[17])/2; 
hleft = nx[12]; 
hright = nx[17]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[17]+' '+bb[17]+' L '+nx[17]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[12]+' '+mid+' L '+nx[12]+' '+bt[12];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[17,12]; 

paper.setStart(); 
mid=bb[17]+(bt[21]-bb[17])/2; 
hleft = nx[21]; 
hright = nx[17]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[21]+' '+mid+' L '+nx[21]+' '+bt[21];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[17,21]; 

paper.setStart(); 
mid=bb[18]+(bt[22]-bb[18])/2; 
hleft = nx[22]; 
hright = nx[18]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[18]+' '+bb[18]+' L '+nx[18]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[22]+' '+mid+' L '+nx[22]+' '+bt[22];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[18,22]; 

paper.setStart(); 
mid=bb[18]+(bt[22]-bb[18])/2; 
hleft = nx[37]; 
hright = nx[18]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[37]+' '+mid+' L '+nx[37]+' '+bt[37];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[18,37]; 

paper.setStart(); 
s1='M '+nx[20]+' '+bb[20]+' L '+nx[20]+' '+bt[11]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[20,11] ; 

paper.setStart(); 
s1='M '+nx[20]+' '+bb[20]+' L '+nx[20]+' '+ny[44]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[20,44]; 

paper.setStart(); 
mid=bb[21]+(bt[7]-bb[21])/2; 
hleft = nx[40]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[21]+' '+bb[21]+' L '+nx[21]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[40]+' '+mid+' L '+nx[40]+' '+bt[40];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[21,40]; 

paper.setStart(); 
mid=bb[21]+(bt[7]-bb[21])/2; 
hleft = nx[7]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[7]+' '+mid+' L '+nx[7]+' '+bt[7];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[21,7]; 

paper.setStart(); 
s1='M '+nx[22]+' '+bb[22]+' L '+nx[22]+' '+ny[44]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[22]+' '+ny[44]+' L '+nx[20]+' '+ny[44]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[22,44]; 

paper.setStart(); 
s1='M '+nx[24]+' '+bb[24]+' L '+nx[24]+' '+bt[20]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[24,20] ; 

paper.setStart(); 
mid=bb[25]+(bt[5]-bb[25])/2; 
hleft = nx[42]; 
hright = nx[25]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[25]+' '+bb[25]+' L '+nx[25]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[42]+' '+mid+' L '+nx[42]+' '+bt[42];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[25,42]; 

paper.setStart(); 
mid=bb[25]+(bt[5]-bb[25])/2; 
hleft = nx[5]; 
hright = nx[25]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[5]+' '+mid+' L '+nx[5]+' '+bt[5];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[25,5]; 

paper.setStart(); 
mid=bb[28]+(bt[0]-bb[28])/2; 
hleft = nx[0]; 
hright = nx[28]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[28]+' '+bb[28]+' L '+nx[28]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[0]+' '+mid+' L '+nx[0]+' '+bt[0];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[28,0]; 

paper.setStart(); 
mid=bb[28]+(bt[0]-bb[28])/2; 
hleft = nx[18]; 
hright = nx[28]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[18]+' '+mid+' L '+nx[18]+' '+bt[18];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[28,18]; 

paper.setStart(); 
mid=bb[30]+(bt[27]-bb[30])/2; 
hleft = nx[17]; 
hright = nx[30]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[30]+' '+bb[30]+' L '+nx[30]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[17]+' '+mid+' L '+nx[17]+' '+bt[17];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[30,17]; 

paper.setStart(); 
mid=bb[30]+(bt[27]-bb[30])/2; 
s3='M '+nx[27]+' '+mid+' L '+nx[27]+' '+bt[27];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[30,27]; 

paper.setStart(); 
mid=bb[30]+(bt[27]-bb[30])/2; 
hleft = nx[14]; 
hright = nx[30]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[14]+' '+mid+' L '+nx[14]+' '+bt[14];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[30,14]; 

paper.setStart(); 
s1='M '+nx[31]+' '+bb[31]+' L '+nx[31]+' '+bt[33]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[31,33] ; 

paper.setStart(); 
s1='M '+nx[32]+' '+bb[32]+' L '+nx[32]+' '+bt[38]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[32,38] ; 

paper.setStart(); 
s1='M '+nx[33]+' '+bb[33]+' L '+nx[33]+' '+ny[43]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[33,43]; 

paper.setStart(); 
s1='M '+nx[38]+' '+bb[38]+' L '+nx[38]+' '+bt[30]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[38,30] ; 

paper.setStart(); 
mid=bb[40]+(bt[25]-bb[40])/2; 
hleft = nx[23]; 
hright = nx[40]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[40]+' '+bb[40]+' L '+nx[40]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[23]+' '+mid+' L '+nx[23]+' '+bt[23];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[40,23]; 

paper.setStart(); 
mid=bb[40]+(bt[25]-bb[40])/2; 
hleft = nx[25]; 
hright = nx[40]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[25]+' '+mid+' L '+nx[25]+' '+bt[25];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[40,25]; 

paper.setStart(); 
mid=bb[40]+(bt[25]-bb[40])/2; 
s3='M '+nx[28]+' '+mid+' L '+nx[28]+' '+bt[28];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[40,28]; 

paper.setStart(); 
mid=bb[40]+(bt[25]-bb[40])/2; 
s3='M '+nx[6]+' '+mid+' L '+nx[6]+' '+bt[6];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[40,6]; 

paper.setStart(); 
mid=bb[42]+(bt[24]-bb[42])/2; 
hleft = nx[15]; 
hright = nx[42]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[42]+' '+bb[42]+' L '+nx[42]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[15]+' '+mid+' L '+nx[15]+' '+bt[15];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[42,15]; 

paper.setStart(); 
mid=bb[42]+(bt[24]-bb[42])/2; 
hleft = nx[1]; 
hright = nx[42]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[1]+' '+mid+' L '+nx[1]+' '+bt[1];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[42,1]; 

paper.setStart(); 
mid=bb[42]+(bt[24]-bb[42])/2; 
s3='M '+nx[24]+' '+mid+' L '+nx[24]+' '+bt[24];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[42,24]; 

paper.setStart(); 
mid=bb[43]+(bt[26]-bb[43])/2; 
s2='M '+nx[43]+' '+bb[43]+' L '+nx[43]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[9]+' '+mid+' L '+nx[9]+' '+bt[9];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[43,9]; 

paper.setStart(); 
mid=bb[43]+(bt[26]-bb[43])/2; 
hleft = nx[26]; 
hright = nx[43]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[26]+' '+mid+' L '+nx[26]+' '+bt[26];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[43,26]; 

paper.setStart(); 
mid=bb[43]+(bt[26]-bb[43])/2; 
hleft = nx[16]; 
hright = nx[43]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[16]+' '+mid+' L '+nx[16]+' '+bt[16];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[43,16]; 

paper.setStart(); 
mid=bb[44]+(bt[2]-bb[44])/2; 
hleft = nx[13]; 
hright = nx[44]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[44]+' '+bb[44]+' L '+nx[44]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[13]+' '+mid+' L '+nx[13]+' '+bt[13];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[44,13]; 

paper.setStart(); 
mid=bb[44]+(bt[2]-bb[44])/2; 
hleft = nx[2]; 
hright = nx[44]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[2]+' '+mid+' L '+nx[2]+' '+bt[2];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[44,2]; 

nlines = 46;
}