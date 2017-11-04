function initMap() { 

// Set size parameters 
mapWidth = 4099; 
mapHeight = 5975; 
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
rootx = 1861; 
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

nnodes = 240; 
njunc = 12; 

nx[0]=1684;
ny[0]=4915;
nx[1]=606;
ny[1]=1926;
nx[2]=1217;
ny[2]=3884;
nx[3]=2671;
ny[3]=4047;
nx[4]=3160;
ny[4]=4785;
nx[5]=1942;
ny[5]=5702;
nx[6]=503;
ny[6]=5243;
nx[7]=3616;
ny[7]=2234;
nx[8]=3609;
ny[8]=1781;
nx[9]=3028;
ny[9]=1781;
nx[10]=2241;
ny[10]=647;
nx[11]=2880;
ny[11]=5317;
nx[12]=3627;
ny[12]=646;
nx[13]=932;
ny[13]=1899;
nx[14]=503;
ny[14]=5349;
nx[15]=1926;
ny[15]=971;
nx[16]=1217;
ny[16]=3652;
nx[17]=3520;
ny[17]=880;
nx[18]=2561;
ny[18]=3751;
nx[19]=2575;
ny[19]=1628;
nx[20]=3146;
ny[20]=3623;
nx[21]=2242;
ny[21]=745;
nx[22]=645;
ny[22]=459;
nx[23]=3629;
ny[23]=2919;
nx[24]=2698;
ny[24]=1408;
nx[25]=1533;
ny[25]=3626;
nx[26]=2716;
ny[26]=4537;
nx[27]=1205;
ny[27]=1901;
nx[28]=3147;
ny[28]=3731;
nx[29]=1429;
ny[29]=5808;
nx[30]=389;
ny[30]=791;
nx[31]=2324;
ny[31]=5528;
nx[32]=1766;
ny[32]=5709;
nx[33]=382;
ny[33]=1926;
nx[34]=3490;
ny[34]=3381;
nx[35]=879;
ny[35]=1094;
nx[36]=1217;
ny[36]=1361;
nx[37]=2214;
ny[37]=3854;
nx[38]=3761;
ny[38]=1244;
nx[39]=3161;
ny[39]=4895;
nx[40]=1013;
ny[40]=5288;
nx[41]=2637;
ny[41]=3409;
nx[42]=2736;
ny[42]=3751;
nx[43]=1563;
ny[43]=2852;
nx[44]=2878;
ny[44]=5115;
nx[45]=3899;
ny[45]=3627;
nx[46]=3613;
ny[46]=2007;
nx[47]=1305;
ny[47]=4125;
nx[48]=997;
ny[48]=1366;
nx[49]=3298;
ny[49]=3949;
nx[50]=1838;
ny[50]=3626;
nx[51]=1537;
ny[51]=5383;
nx[52]=2209;
ny[52]=3406;
nx[53]=3487;
ny[53]=3490;
nx[54]=863;
ny[54]=787;
nx[55]=2246;
ny[55]=1303;
nx[56]=1308;
ny[56]=5488;
nx[57]=2945;
ny[57]=4559;
nx[58]=1924;
ny[58]=860;
nx[59]=2014;
ny[59]=5850;
nx[60]=2321;
ny[60]=5316;
nx[61]=2324;
ny[61]=5423;
nx[62]=3802;
ny[62]=3386;
nx[63]=2948;
ny[63]=4666;
nx[64]=2771;
ny[64]=1211;
nx[65]=1926;
ny[65]=1074;
nx[66]=1205;
ny[66]=1779;
nx[67]=1389;
ny[67]=4767;
nx[68]=1537;
ny[68]=5490;
nx[69]=1562;
ny[69]=2271;
nx[70]=2949;
ny[70]=4786;
nx[71]=503;
ny[71]=5571;
nx[72]=2986;
ny[72]=251;
nx[73]=2824;
ny[73]=1518;
nx[74]=606;
ny[74]=1811;
nx[75]=3225;
ny[75]=4055;
nx[76]=1217;
ny[76]=4511;
nx[77]=2993;
ny[77]=4059;
nx[78]=3067;
ny[78]=5010;
nx[79]=2325;
ny[79]=5637;
nx[80]=1878;
ny[80]=5388;
nx[81]=3803;
ny[81]=3501;
nx[82]=1134;
ny[82]=4124;
nx[83]=3630;
ny[83]=751;
nx[84]=2574;
ny[84]=1519;
nx[85]=606;
ny[85]=2171;
nx[86]=3620;
ny[86]=2563;
nx[87]=3606;
ny[87]=1676;
nx[88]=2243;
ny[88]=853;
nx[89]=3617;
ny[89]=2344;
nx[90]=606;
ny[90]=2050;
nx[91]=1217;
ny[91]=4397;
nx[92]=2247;
ny[92]=1437;
nx[93]=3384;
ny[93]=4056;
nx[94]=1076;
ny[94]=3323;
nx[95]=1537;
ny[95]=5154;
nx[96]=2704;
ny[96]=1825;
nx[97]=2609;
ny[97]=1206;
nx[98]=1073;
ny[98]=3220;
nx[99]=646;
ny[99]=557;
nx[100]=2396;
ny[100]=1542;
nx[101]=2877;
ny[101]=5012;
nx[102]=2244;
ny[102]=966;
nx[103]=2705;
ny[103]=1934;
nx[104]=906;
ny[104]=3646;
nx[105]=1216;
ny[105]=4285;
nx[106]=1564;
ny[106]=2383;
nx[107]=3145;
ny[107]=3408;
nx[108]=1016;
ny[108]=5400;
nx[109]=2084;
ny[109]=5702;
nx[110]=3436;
ny[110]=5013;
nx[111]=913;
ny[111]=5506;
nx[112]=832;
ny[112]=5624;
nx[113]=3626;
ny[113]=2798;
nx[114]=2638;
ny[114]=3523;
nx[115]=2325;
ny[115]=5875;
nx[116]=1766;
ny[116]=5594;
nx[117]=3147;
ny[117]=3836;
nx[118]=3114;
ny[118]=1658;
nx[119]=645;
ny[119]=252;
nx[120]=1079;
ny[120]=3527;
nx[121]=3187;
ny[121]=1955;
nx[122]=1577;
ny[122]=4773;
nx[123]=1563;
ny[123]=2604;
nx[124]=2561;
ny[124]=3867;
nx[125]=3620;
ny[125]=2457;
nx[126]=1563;
ny[126]=2496;
nx[127]=1051;
ny[127]=4772;
nx[128]=3827;
ny[128]=3948;
nx[129]=3487;
ny[129]=3596;
nx[130]=2005;
ny[130]=5590;
nx[131]=906;
ny[131]=3765;
nx[132]=2470;
ny[132]=1205;
nx[133]=2752;
ny[133]=4787;
nx[134]=1102;
ny[134]=5504;
nx[135]=2943;
ny[135]=4442;
nx[136]=1537;
ny[136]=5273;
nx[137]=2686;
ny[137]=1077;
nx[138]=3489;
ny[138]=3270;
nx[139]=1493;
ny[139]=4905;
nx[140]=1731;
ny[140]=3767;
nx[141]=3758;
ny[141]=1121;
nx[142]=2993;
ny[142]=3948;
nx[143]=3827;
ny[143]=3834;
nx[144]=2804;
ny[144]=4306;
nx[145]=3372;
ny[145]=1433;
nx[146]=1861;
ny[146]=100;
nx[147]=2686;
ny[147]=970;
nx[148]=2210;
ny[148]=3628;
nx[149]=3738;
ny[149]=3626;
nx[150]=2428;
ny[150]=3254;
nx[151]=2716;
ny[151]=4435;
nx[152]=2639;
ny[152]=3629;
nx[153]=3623;
ny[153]=2671;
nx[154]=1689;
ny[154]=3407;
nx[155]=1763;
ny[155]=5487;
nx[156]=1296;
ny[156]=3997;
nx[157]=3373;
ny[157]=1543;
nx[158]=1961;
ny[158]=3767;
nx[159]=2005;
ny[159]=5488;
nx[160]=3046;
ny[160]=1955;
nx[161]=2209;
ny[161]=3517;
nx[162]=1217;
ny[162]=3770;
nx[163]=3187;
ny[163]=1781;
nx[164]=565;
ny[164]=793;
nx[165]=3612;
ny[165]=1897;
nx[166]=2549;
ny[166]=4180;
nx[167]=3801;
ny[167]=3278;
nx[168]=1563;
ny[168]=3070;
nx[169]=2217;
ny[169]=4082;
nx[170]=777;
ny[170]=1367;
nx[171]=1217;
ny[171]=4773;
nx[172]=3755;
ny[172]=1000;
nx[173]=2803;
ny[173]=4181;
nx[174]=3754;
ny[174]=879;
nx[175]=1392;
ny[175]=2268;
nx[176]=2325;
ny[176]=5751;
nx[177]=1076;
ny[177]=3420;
nx[178]=990;
ny[178]=5623;
nx[179]=1689;
ny[179]=3512;
nx[180]=503;
ny[180]=5459;
nx[181]=200;
ny[181]=796;
nx[182]=502;
ny[182]=5149;
nx[183]=1484;
ny[183]=2147;
nx[184]=2827;
ny[184]=1626;
nx[185]=653;
ny[185]=3224;
nx[186]=3145;
ny[186]=3509;
nx[187]=2213;
ny[187]=3746;
nx[188]=772;
ny[188]=913;
nx[189]=860;
ny[189]=680;
nx[190]=1217;
ny[190]=4626;
nx[191]=2245;
ny[191]=1186;
nx[192]=1537;
ny[192]=5618;
nx[193]=2214;
ny[193]=3961;
nx[194]=1142;
ny[194]=3996;
nx[195]=3635;
ny[195]=3149;
nx[196]=384;
ny[196]=1809;
nx[197]=2879;
ny[197]=5213;
nx[198]=1132;
ny[198]=2042;
nx[199]=904;
ny[199]=3884;
nx[200]=1483;
ny[200]=2044;
nx[201]=3487;
ny[201]=3712;
nx[202]=1560;
ny[202]=2965;
nx[203]=1205;
ny[203]=1676;
nx[204]=1289;
ny[204]=2044;
nx[205]=654;
ny[205]=3338;
nx[206]=2244;
ny[206]=1071;
nx[207]=1308;
ny[207]=5384;
nx[208]=645;
ny[208]=350;
nx[209]=389;
ny[209]=679;
nx[210]=3616;
ny[210]=2117;
nx[211]=503;
ny[211]=1683;
nx[212]=910;
ny[212]=4765;
nx[213]=2395;
ny[213]=1437;
nx[214]=2056;
ny[214]=1437;
nx[215]=556;
ny[215]=1367;
nx[216]=982;
ny[216]=909;
nx[217]=1477;
ny[217]=1903;
nx[218]=3741;
ny[218]=3720;
nx[219]=2683;
ny[219]=849;
nx[220]=905;
ny[220]=4004;
nx[221]=880;
ny[221]=1210;
nx[222]=3762;
ny[222]=1367;
nx[223]=999;
ny[223]=2043;
nx[224]=2946;
ny[224]=1208;
nx[225]=1563;
ny[225]=2724;
nx[226]=3256;
ny[226]=5012;
nx[227]=3632;
ny[227]=3033;
nx[228]=1217;
ny[228]=4986;
nx[229]=1429;
ny[229]=5711;
nx[230]=2703;
ny[230]=1729;
nx[231]=2696;
ny[231]=1291;
nx[232]=3826;
ny[232]=3672;
nx[233]=1219;
ny[233]=4047;
nx[234]=1216;
ny[234]=4196;
nx[235]=2012;
ny[235]=5771;
nx[236]=880;
ny[236]=1466;
nx[237]=3115;
ny[237]=1859;
nx[238]=878;
ny[238]=1000;
nx[239]=2669;
ny[239]=3957;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[122, 139, 228]; 
members[1]=[90, 74]; 
members[2]=[194, 156, 162]; 
members[3]=[173, 166, 239]; 
members[4]=[63, 133, 70, 39]; 
members[5]=[130, 235, 109]; 
members[6]=[182, 14]; 
members[7]=[89, 210]; 
members[8]=[165, 87]; 
members[9]=[163, 237, 118]; 
members[10]=[72, 12, 21]; 
members[11]=[197]; 
members[12]=[72, 10, 83]; 
members[13]=[217, 66, 27]; 
members[14]=[180, 6]; 
members[15]=[65, 58]; 
members[16]=[120, 162, 104]; 
members[17]=[83, 174]; 
members[18]=[152, 124, 42]; 
members[19]=[84, 230]; 
members[20]=[186, 28]; 
members[21]=[88, 58, 219, 10]; 
members[22]=[208, 99]; 
members[23]=[113, 227]; 
members[24]=[73, 84, 231]; 
members[25]=[50, 179]; 
members[26]=[151]; 
members[27]=[66, 198, 200, 204, 13, 217, 223]; 
members[28]=[20, 117]; 
members[29]=[229]; 
members[30]=[209, 164, 181]; 
members[31]=[61, 79]; 
members[32]=[116]; 
members[33]=[196]; 
members[34]=[138, 53]; 
members[35]=[221, 238]; 
members[36]=[170, 236, 48, 215, 221]; 
members[37]=[193, 187]; 
members[38]=[145, 141, 222]; 
members[39]=[226, 4, 101, 78, 110]; 
members[40]=[136, 60, 108, 95]; 
members[41]=[107, 114, 52, 150, 154]; 
members[42]=[152, 18, 239]; 
members[43]=[225, 202]; 
members[44]=[197, 101]; 
members[45]=[232, 81, 149]; 
members[46]=[210, 165]; 
members[47]=[233, 234, 82]; 
members[48]=[36, 170, 236, 215, 221]; 
members[49]=[75, 93, 142, 117]; 
members[50]=[25, 179, 140, 158]; 
members[51]=[136, 80, 68, 207]; 
members[52]=[161, 41, 107, 150, 154]; 
members[53]=[129, 34]; 
members[54]=[216, 188, 189]; 
members[55]=[92, 213, 214, 191]; 
members[56]=[229, 207]; 
members[57]=[135, 63]; 
members[58]=[88, 219, 21, 15]; 
members[59]=[235]; 
members[60]=[136, 40, 61, 95]; 
members[61]=[60, 31]; 
members[62]=[81, 167]; 
members[63]=[57, 4, 133, 70]; 
members[64]=[224, 132, 97, 137, 231]; 
members[65]=[15]; 
members[66]=[217, 27, 13, 203]; 
members[67]=[228, 171, 212, 122, 190, 127]; 
members[68]=[192, 51]; 
members[69]=[106, 175, 183]; 
members[70]=[4, 133, 63]; 
members[71]=[180]; 
members[72]=[10, 12, 146, 119]; 
members[73]=[184, 24, 84]; 
members[74]=[1, 211, 196]; 
members[75]=[49, 93]; 
members[76]=[91, 190]; 
members[77]=[142]; 
members[78]=[226, 101, 110, 39]; 
members[79]=[176, 31]; 
members[80]=[136, 207, 51, 155, 159]; 
members[81]=[45, 62, 149]; 
members[82]=[233, 234, 47]; 
members[83]=[17, 12, 174]; 
members[84]=[24, 73, 19]; 
members[85]=[90]; 
members[86]=[153, 125]; 
members[87]=[8, 157, 118]; 
members[88]=[58, 219, 21, 102]; 
members[89]=[125, 7]; 
members[90]=[1, 85]; 
members[91]=[105, 76]; 
members[92]=[213, 214, 55]; 
members[93]=[49, 75]; 
members[94]=[177, 98]; 
members[95]=[228, 136, 40, 182, 60]; 
members[96]=[230, 103]; 
members[97]=[64, 224, 132, 137, 231]; 
members[98]=[168, 185, 150, 94]; 
members[99]=[209, 189, 22]; 
members[100]=[213]; 
members[101]=[226, 39, 44, 78, 110]; 
members[102]=[88, 206]; 
members[103]=[96]; 
members[104]=[120, 16, 131]; 
members[105]=[234, 91]; 
members[106]=[69, 126]; 
members[107]=[41, 52, 150, 186, 154]; 
members[108]=[40, 134, 111]; 
members[109]=[130, 235, 5]; 
members[110]=[226, 78, 101, 39]; 
members[111]=[112, 178, 108, 134]; 
members[112]=[178, 111]; 
members[113]=[153, 23]; 
members[114]=[152, 41]; 
members[115]=[176]; 
members[116]=[32, 155]; 
members[117]=[49, 28, 142]; 
members[118]=[9, 163, 157, 87]; 
members[119]=[208, 72, 146]; 
members[120]=[16, 104, 177]; 
members[121]=[160, 237]; 
members[122]=[0, 67, 139, 212, 171, 190, 127]; 
members[123]=[225, 126]; 
members[124]=[18, 239]; 
members[125]=[89, 86]; 
members[126]=[106, 123]; 
members[127]=[67, 228, 171, 212, 122, 190]; 
members[128]=[143]; 
members[129]=[201, 53]; 
members[130]=[159, 109, 5]; 
members[131]=[104, 199]; 
members[132]=[64, 224, 97, 137, 231]; 
members[133]=[4, 70, 63]; 
members[134]=[108, 111]; 
members[135]=[144, 57, 151]; 
members[136]=[207, 80, 40, 51, 60, 95]; 
members[137]=[64, 97, 132, 224, 145, 147]; 
members[138]=[34, 195, 167]; 
members[139]=[0, 122, 228]; 
members[140]=[50, 158]; 
members[141]=[172, 38]; 
members[142]=[49, 77, 117]; 
members[143]=[128, 232]; 
members[144]=[135, 173, 151]; 
members[145]=[38, 137, 147, 157, 222]; 
members[146]=[72, 119]; 
members[147]=[145, 219, 137]; 
members[148]=[161, 187]; 
members[149]=[232, 81, 218, 45]; 
members[150]=[98, 168, 41, 107, 52, 185, 154]; 
members[151]=[144, 26, 135]; 
members[152]=[18, 114, 42]; 
members[153]=[113, 86]; 
members[154]=[41, 107, 179, 52, 150]; 
members[155]=[80, 116, 159]; 
members[156]=[233, 2, 194]; 
members[157]=[145, 118, 87]; 
members[158]=[50, 140]; 
members[159]=[80, 130, 155]; 
members[160]=[121, 237]; 
members[161]=[52, 148]; 
members[162]=[16, 2]; 
members[163]=[9, 237, 118]; 
members[164]=[209, 181, 30]; 
members[165]=[8, 46]; 
members[166]=[3, 173]; 
members[167]=[138, 195, 62]; 
members[168]=[185, 98, 202, 150]; 
members[169]=[193]; 
members[170]=[36, 236, 48, 215, 221]; 
members[171]=[67, 228, 212, 122, 190, 127]; 
members[172]=[141, 174]; 
members[173]=[144, 3, 166]; 
members[174]=[17, 83, 172]; 
members[175]=[69, 183]; 
members[176]=[115, 79]; 
members[177]=[120, 94]; 
members[178]=[112, 111]; 
members[179]=[25, 50, 154]; 
members[180]=[14, 71]; 
members[181]=[209, 164, 30]; 
members[182]=[228, 6, 95]; 
members[183]=[200, 69, 175]; 
members[184]=[73, 230]; 
members[185]=[168, 98, 205, 150]; 
members[186]=[107, 20]; 
members[187]=[148, 37]; 
members[188]=[216, 54, 238]; 
members[189]=[209, 99, 54]; 
members[190]=[67, 171, 76, 212, 122, 127]; 
members[191]=[206, 55]; 
members[192]=[68, 229]; 
members[193]=[169, 37]; 
members[194]=[233, 2, 156]; 
members[195]=[138, 227, 167]; 
members[196]=[33, 74, 211]; 
members[197]=[11, 44]; 
members[198]=[200, 27, 204, 223]; 
members[199]=[131, 220]; 
members[200]=[198, 204, 183, 27, 223]; 
members[201]=[129]; 
members[202]=[168, 43]; 
members[203]=[66, 236, 211]; 
members[204]=[200, 27, 198, 223]; 
members[205]=[185]; 
members[206]=[102, 191]; 
members[207]=[56, 136, 51, 80]; 
members[208]=[22, 119]; 
members[209]=[99, 164, 181, 189, 30]; 
members[210]=[46, 7]; 
members[211]=[236, 74, 203, 196]; 
members[212]=[67, 228, 171, 122, 190, 127]; 
members[213]=[92, 100, 214, 55]; 
members[214]=[92, 213, 55]; 
members[215]=[36, 170, 236, 48, 221]; 
members[216]=[188, 54, 238]; 
members[217]=[66, 27, 13]; 
members[218]=[232, 149]; 
members[219]=[88, 58, 147, 21]; 
members[220]=[199]; 
members[221]=[35, 36, 170, 48, 215]; 
members[222]=[145, 38]; 
members[223]=[200, 27, 204, 198]; 
members[224]=[64, 132, 97, 137, 231]; 
members[225]=[123, 43]; 
members[226]=[78, 101, 110, 39]; 
members[227]=[195, 23]; 
members[228]=[0, 67, 139, 212, 171, 182, 95, 127]; 
members[229]=[56, 192, 29]; 
members[230]=[96, 184, 19]; 
members[231]=[64, 97, 132, 224, 24]; 
members[232]=[149, 218, 45, 143]; 
members[233]=[82, 156, 194, 47]; 
members[234]=[105, 82, 47]; 
members[235]=[59, 109, 5]; 
members[236]=[36, 170, 203, 48, 211, 215]; 
members[237]=[160, 121, 163, 9]; 
members[238]=[216, 35, 188]; 
members[239]=[42, 3, 124]; 

return members[i]; 
} 

function drawMap(sfac) { 

var rect; 
var tbox; 

paper.clear(); 

t[0]=paper.text(nx[0],ny[0],'Reflection and Refraction\nof Waves').attr({fill:"#666666","font-size": 14*sfac[0]});
tBox=t[0].getBBox(); 
bt[0]=ny[0]-(tBox.height/2+10*sfac[0]);
bb[0]=ny[0]+(tBox.height/2+10*sfac[0]);
bl[0]=nx[0]-(tBox.width/2+10*sfac[0]);
br[0]=nx[0]+(tBox.width/2+10*sfac[0]);
paper.setStart(); 
rect=paper.rect(bl[0], bt[0], br[0]-bl[0], bb[0]-bt[0], 10*sfac[0]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[0]=paper.setFinish(); 

t[1]=paper.text(nx[1],ny[1],'Velocity-Time Graph for\nUniform Accleration').attr({fill:"#666666","font-size": 14*sfac[1]});
tBox=t[1].getBBox(); 
bt[1]=ny[1]-(tBox.height/2+10*sfac[1]);
bb[1]=ny[1]+(tBox.height/2+10*sfac[1]);
bl[1]=nx[1]-(tBox.width/2+10*sfac[1]);
br[1]=nx[1]+(tBox.width/2+10*sfac[1]);
paper.setStart(); 
rect=paper.rect(bl[1], bt[1], br[1]-bl[1], bb[1]-bt[1], 10*sfac[1]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[1]=paper.setFinish(); 

t[2]=paper.text(nx[2],ny[2],'Energy in Simple Harmonic\nMotion').attr({fill:"#666666","font-size": 14*sfac[2]});
tBox=t[2].getBBox(); 
bt[2]=ny[2]-(tBox.height/2+10*sfac[2]);
bb[2]=ny[2]+(tBox.height/2+10*sfac[2]);
bl[2]=nx[2]-(tBox.width/2+10*sfac[2]);
br[2]=nx[2]+(tBox.width/2+10*sfac[2]);
paper.setStart(); 
rect=paper.rect(bl[2], bt[2], br[2]-bl[2], bb[2]-bt[2], 10*sfac[2]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[2]=paper.setFinish(); 

t[3]=paper.text(nx[3],ny[3]-10,'Conservation of Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[3]});
t[3].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Conservation-of-Energy/#Conservation of Energy", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Conservation-of-Energy/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Conservation-of-Energy/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Conservation-of-Energy/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[3], bt[3], br[3]-bl[3], bb[3]-bt[3], 10*sfac[3]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[3]=paper.setFinish(); 
t[3].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[4]=paper.text(nx[4],ny[4],'Change of State').attr({fill:"#666666","font-size": 14*sfac[4]});
tBox=t[4].getBBox(); 
bt[4]=ny[4]-(tBox.height/2+10*sfac[4]);
bb[4]=ny[4]+(tBox.height/2+10*sfac[4]);
bl[4]=nx[4]-(tBox.width/2+10*sfac[4]);
br[4]=nx[4]+(tBox.width/2+10*sfac[4]);
paper.setStart(); 
rect=paper.rect(bl[4], bt[4], br[4]-bl[4], bb[4]-bt[4], 10*sfac[4]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[4]=paper.setFinish(); 

t[5]=paper.text(nx[5],ny[5],'Convex Lenses').attr({fill:"#666666","font-size": 14*sfac[5]});
tBox=t[5].getBBox(); 
bt[5]=ny[5]-(tBox.height/2+10*sfac[5]);
bb[5]=ny[5]+(tBox.height/2+10*sfac[5]);
bl[5]=nx[5]-(tBox.width/2+10*sfac[5]);
br[5]=nx[5]+(tBox.width/2+10*sfac[5]);
paper.setStart(); 
rect=paper.rect(bl[5], bt[5], br[5]-bl[5], bb[5]-bt[5], 10*sfac[5]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[5]=paper.setFinish(); 

t[6]=paper.text(nx[6],ny[6]-10,'Sound Waves').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[6]});
t[6].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Sound-in-a-Tube/#Sound Waves", target: "_top",title:"Click to jump to concept"});
}); 
t[6].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[6].getBBox(); 
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
yicon = bb[6]-25; 
xicon2 = nx[6]+-40; 
xicon3 = nx[6]+-10; 
xicon4 = nx[6]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Sound-in-a-Tube/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Sound-in-a-Tube/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[6], bt[6], br[6]-bl[6], bb[6]-bt[6], 10*sfac[6]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[6]=paper.setFinish(); 
t[6].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[7]=paper.text(nx[7],ny[7],'Matter Waves').attr({fill:"#666666","font-size": 14*sfac[7]});
tBox=t[7].getBBox(); 
bt[7]=ny[7]-(tBox.height/2+10*sfac[7]);
bb[7]=ny[7]+(tBox.height/2+10*sfac[7]);
bl[7]=nx[7]-(tBox.width/2+10*sfac[7]);
br[7]=nx[7]+(tBox.width/2+10*sfac[7]);
paper.setStart(); 
rect=paper.rect(bl[7], bt[7], br[7]-bl[7], bb[7]-bt[7], 10*sfac[7]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[7]=paper.setFinish(); 

t[8]=paper.text(nx[8],ny[8],'Reception of Electomagnetic Waves').attr({fill:"#666666","font-size": 14*sfac[8]});
tBox=t[8].getBBox(); 
bt[8]=ny[8]-(tBox.height/2+10*sfac[8]);
bb[8]=ny[8]+(tBox.height/2+10*sfac[8]);
bl[8]=nx[8]-(tBox.width/2+10*sfac[8]);
br[8]=nx[8]+(tBox.width/2+10*sfac[8]);
paper.setStart(); 
rect=paper.rect(bl[8], bt[8], br[8]-bl[8], bb[8]-bt[8], 10*sfac[8]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[8]=paper.setFinish(); 

t[9]=paper.text(nx[9],ny[9],'Alternating Current').attr({fill:"#666666","font-size": 14*sfac[9]});
tBox=t[9].getBBox(); 
bt[9]=ny[9]-(tBox.height/2+10*sfac[9]);
bb[9]=ny[9]+(tBox.height/2+10*sfac[9]);
bl[9]=nx[9]-(tBox.width/2+10*sfac[9]);
br[9]=nx[9]+(tBox.width/2+10*sfac[9]);
paper.setStart(); 
rect=paper.rect(bl[9], bt[9], br[9]-bl[9], bb[9]-bt[9], 10*sfac[9]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[9]=paper.setFinish(); 

t[10]=paper.text(nx[10],ny[10]-10,'Static Electricity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[10]});
t[10].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Electrostatics/#Static Electricity", target: "_top",title:"Click to jump to concept"});
}); 
t[10].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[10].getBBox(); 
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
yicon = bb[10]-25; 
xicon2 = nx[10]+-40; 
xicon3 = nx[10]+-10; 
xicon4 = nx[10]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Electrostatics/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Electrostatics/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Electrostatics/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[10], bt[10], br[10]-bl[10], bb[10]-bt[10], 10*sfac[10]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[10]=paper.setFinish(); 
t[10].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[11]=paper.text(nx[11],ny[11]-10,'Bouyancy and Flotation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[11]});
t[11].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Buoyancy/#Bouyancy and Flotation", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Buoyancy/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Buoyancy/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Buoyancy/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[11]=paper.setFinish(); 
t[11].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[12]=paper.text(nx[12],ny[12]-10,'Magnetic Fields').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[12]});
t[12].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Magnetic-Fields/#Magnetic Fields", target: "_top",title:"Click to jump to concept"});
}); 
t[12].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[12].getBBox(); 
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
yicon = bb[12]-25; 
xicon2 = nx[12]+-40; 
xicon3 = nx[12]+-10; 
xicon4 = nx[12]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Magnetic-Fields/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Magnetic-Fields/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Magnetic-Fields/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[12], bt[12], br[12]-bl[12], bb[12]-bt[12], 10*sfac[12]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[12]=paper.setFinish(); 
t[12].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[13]=paper.text(nx[13],ny[13]-10,"Newton's First Law of Motion").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[13]});
t[13].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/First-Law/#Newton's First Law of Motion", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/First-Law/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/First-Law/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/First-Law/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[13], bt[13], br[13]-bl[13], bb[13]-bt[13], 10*sfac[13]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[13]=paper.setFinish(); 
t[13].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[14]=paper.text(nx[14],ny[14],'The Pitch and Loudness\nof Sound Waves').attr({fill:"#666666","font-size": 14*sfac[14]});
tBox=t[14].getBBox(); 
bt[14]=ny[14]-(tBox.height/2+10*sfac[14]);
bb[14]=ny[14]+(tBox.height/2+10*sfac[14]);
bl[14]=nx[14]-(tBox.width/2+10*sfac[14]);
br[14]=nx[14]+(tBox.width/2+10*sfac[14]);
paper.setStart(); 
rect=paper.rect(bl[14], bt[14], br[14]-bl[14], bb[14]-bt[14], 10*sfac[14]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[14]=paper.setFinish(); 

t[15]=paper.text(nx[15],ny[15]-10,"Coulomb's Law").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[15]});
t[15].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Coulombs-Law/#Coulomb's Law", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Coulombs-Law/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Coulombs-Law/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Coulombs-Law/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[15], bt[15], br[15]-bl[15], bb[15]-bt[15], 10*sfac[15]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[15]=paper.setFinish(); 
t[15].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[16]=paper.text(nx[16],ny[16],'Simple Harmonic Motion').attr({fill:"#666666","font-size": 14*sfac[16]});
tBox=t[16].getBBox(); 
bt[16]=ny[16]-(tBox.height/2+10*sfac[16]);
bb[16]=ny[16]+(tBox.height/2+10*sfac[16]);
bl[16]=nx[16]-(tBox.width/2+10*sfac[16]);
br[16]=nx[16]+(tBox.width/2+10*sfac[16]);
paper.setStart(); 
rect=paper.rect(bl[16], bt[16], br[16]-bl[16], bb[16]-bt[16], 10*sfac[16]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[16]=paper.setFinish(); 

t[17]=paper.text(nx[17],ny[17],'Magnetic Fields Around\nPermanent Magnets').attr({fill:"#666666","font-size": 14*sfac[17]});
tBox=t[17].getBBox(); 
bt[17]=ny[17]-(tBox.height/2+10*sfac[17]);
bb[17]=ny[17]+(tBox.height/2+10*sfac[17]);
bl[17]=nx[17]-(tBox.width/2+10*sfac[17]);
br[17]=nx[17]+(tBox.width/2+10*sfac[17]);
paper.setStart(); 
rect=paper.rect(bl[17], bt[17], br[17]-bl[17], bb[17]-bt[17], 10*sfac[17]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[17]=paper.setFinish(); 

t[18]=paper.text(nx[18],ny[18]-10,'Potential Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[18]});
t[18].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Potential-Energy/#Potential Energy", target: "_top",title:"Click to jump to concept"});
}); 
t[18].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[18].getBBox(); 
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
yicon = bb[18]-25; 
xicon2 = nx[18]+-40; 
xicon3 = nx[18]+-10; 
xicon4 = nx[18]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Potential-Energy/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Potential-Energy/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[18], bt[18], br[18]-bl[18], bb[18]-bt[18], 10*sfac[18]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[18]=paper.setFinish(); 
t[18].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[19]=paper.text(nx[19],ny[19]-10,'Voltage Drop in Series Circuits').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[19]});
t[19].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Resistors-in-Series/#Voltage Drop in Series Circuits", target: "_top",title:"Click to jump to concept"});
}); 
t[19].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[19].getBBox(); 
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
yicon = bb[19]-25; 
xicon2 = nx[19]+-40; 
xicon3 = nx[19]+-10; 
xicon4 = nx[19]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Resistors-in-Series/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Resistors-in-Series/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Resistors-in-Series/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[19], bt[19], br[19]-bl[19], bb[19]-bt[19], 10*sfac[19]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[19]=paper.setFinish(); 
t[19].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[20]=paper.text(nx[20],ny[20],'Center of Mass').attr({fill:"#666666","font-size": 14*sfac[20]});
tBox=t[20].getBBox(); 
bt[20]=ny[20]-(tBox.height/2+10*sfac[20]);
bb[20]=ny[20]+(tBox.height/2+10*sfac[20]);
bl[20]=nx[20]-(tBox.width/2+10*sfac[20]);
br[20]=nx[20]+(tBox.width/2+10*sfac[20]);
paper.setStart(); 
rect=paper.rect(bl[20], bt[20], br[20]-bl[20], bb[20]-bt[20], 10*sfac[20]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[20]=paper.setFinish(); 

t[21]=paper.text(nx[21],ny[21],'Tranferring Electrons').attr({fill:"#666666","font-size": 14*sfac[21]});
tBox=t[21].getBBox(); 
bt[21]=ny[21]-(tBox.height/2+10*sfac[21]);
bb[21]=ny[21]+(tBox.height/2+10*sfac[21]);
bl[21]=nx[21]-(tBox.width/2+10*sfac[21]);
br[21]=nx[21]+(tBox.width/2+10*sfac[21]);
paper.setStart(); 
rect=paper.rect(bl[21], bt[21], br[21]-bl[21], bb[21]-bt[21], 10*sfac[21]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[21]=paper.setFinish(); 

t[22]=paper.text(nx[22],ny[22]-10,'Metric Units').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[22]});
t[22].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Metric-Units/#Metric Units", target: "_top",title:"Click to jump to concept"});
}); 
t[22].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[22].getBBox(); 
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
yicon = bb[22]-25; 
xicon2 = nx[22]+-40; 
xicon3 = nx[22]+-10; 
xicon4 = nx[22]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Metric-Units/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Metric-Units/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Metric-Units/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[22], bt[22], br[22]-bl[22], bb[22]-bt[22], 10*sfac[22]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[22]=paper.setFinish(); 
t[22].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[23]=paper.text(nx[23],ny[23],'The Bohr Model').attr({fill:"#666666","font-size": 14*sfac[23]});
tBox=t[23].getBBox(); 
bt[23]=ny[23]-(tBox.height/2+10*sfac[23]);
bb[23]=ny[23]+(tBox.height/2+10*sfac[23]);
bl[23]=nx[23]-(tBox.width/2+10*sfac[23]);
br[23]=nx[23]+(tBox.width/2+10*sfac[23]);
paper.setStart(); 
rect=paper.rect(bl[23], bt[23], br[23]-bl[23], bb[23]-bt[23], 10*sfac[23]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[23]=paper.setFinish(); 

t[24]=paper.text(nx[24],ny[24],'Series and Parallel Circuits').attr({fill:"#666666","font-size": 14*sfac[24]});
tBox=t[24].getBBox(); 
bt[24]=ny[24]-(tBox.height/2+10*sfac[24]);
bb[24]=ny[24]+(tBox.height/2+10*sfac[24]);
bl[24]=nx[24]-(tBox.width/2+10*sfac[24]);
br[24]=nx[24]+(tBox.width/2+10*sfac[24]);
paper.setStart(); 
rect=paper.rect(bl[24], bt[24], br[24]-bl[24], bb[24]-bt[24], 10*sfac[24]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[24]=paper.setFinish(); 

t[25]=paper.text(nx[25],ny[25],"Newton's Third Law and Momentum").attr({fill:"#666666","font-size": 14*sfac[25]});
tBox=t[25].getBBox(); 
bt[25]=ny[25]-(tBox.height/2+10*sfac[25]);
bb[25]=ny[25]+(tBox.height/2+10*sfac[25]);
bl[25]=nx[25]-(tBox.width/2+10*sfac[25]);
br[25]=nx[25]+(tBox.width/2+10*sfac[25]);
paper.setStart(); 
rect=paper.rect(bl[25], bt[25], br[25]-bl[25], bb[25]-bt[25], 10*sfac[25]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[25]=paper.setFinish(); 

t[26]=paper.text(nx[26],ny[26]-10,'Temperature Scales').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[26]});
t[26].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Temperature/#Temperature Scales", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Temperature/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[26], bt[26], br[26]-bl[26], bb[26]-bt[26], 10*sfac[26]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[26]=paper.setFinish(); 
t[26].toFront(); 
exicon.toFront(); 

t[27]=paper.text(nx[27],ny[27]-10,"Newton's Second Law of Motion").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[27]});
t[27].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Second-Law/#Newton's Second Law of Motion", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Second-Law/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Second-Law/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Second-Law/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[27], bt[27], br[27]-bl[27], bb[27]-bt[27], 10*sfac[27]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[27]=paper.setFinish(); 
t[27].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[28]=paper.text(nx[28],ny[28]-10,'Moment of Inertia').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[28]});
t[28].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Moment-of-Inertia/#Moment of Inertia", target: "_top",title:"Click to jump to concept"});
}); 
t[28].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[28].getBBox(); 
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
yicon = bb[28]-25; 
xicon2 = nx[28]+-40; 
xicon3 = nx[28]+-10; 
xicon4 = nx[28]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Moment-of-Inertia/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Moment-of-Inertia/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Moment-of-Inertia/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[28], bt[28], br[28]-bl[28], bb[28]-bt[28], 10*sfac[28]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[28]=paper.setFinish(); 
t[28].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[29]=paper.text(nx[29],ny[29]-10,'Total Internal Reflection').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[29]});
t[29].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Total-Internal-Reflection/#Total Internal Reflection", target: "_top",title:"Click to jump to concept"});
}); 
t[29].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[29].getBBox(); 
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
yicon = bb[29]-25; 
xicon2 = nx[29]+-40; 
xicon3 = nx[29]+-10; 
xicon4 = nx[29]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Total-Internal-Reflection/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Total-Internal-Reflection/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Total-Internal-Reflection/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[29], bt[29], br[29]-bl[29], bb[29]-bt[29], 10*sfac[29]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[29]=paper.setFinish(); 
t[29].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[30]=paper.text(nx[30],ny[30],'Vector Dot Products').attr({fill:"#666666","font-size": 14*sfac[30]});
tBox=t[30].getBBox(); 
bt[30]=ny[30]-(tBox.height/2+10*sfac[30]);
bb[30]=ny[30]+(tBox.height/2+10*sfac[30]);
bl[30]=nx[30]-(tBox.width/2+10*sfac[30]);
br[30]=nx[30]+(tBox.width/2+10*sfac[30]);
paper.setStart(); 
rect=paper.rect(bl[30], bt[30], br[30]-bl[30], bb[30]-bt[30], 10*sfac[30]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[30]=paper.setFinish(); 

t[31]=paper.text(nx[31],ny[31],'Interference Patterns').attr({fill:"#666666","font-size": 14*sfac[31]});
tBox=t[31].getBBox(); 
bt[31]=ny[31]-(tBox.height/2+10*sfac[31]);
bb[31]=ny[31]+(tBox.height/2+10*sfac[31]);
bl[31]=nx[31]-(tBox.width/2+10*sfac[31]);
br[31]=nx[31]+(tBox.width/2+10*sfac[31]);
paper.setStart(); 
rect=paper.rect(bl[31], bt[31], br[31]-bl[31], bb[31]-bt[31], 10*sfac[31]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[31]=paper.setFinish(); 

t[32]=paper.text(nx[32],ny[32],'Spherical Mirrors and\nAberration').attr({fill:"#666666","font-size": 14*sfac[32]});
tBox=t[32].getBBox(); 
bt[32]=ny[32]-(tBox.height/2+10*sfac[32]);
bb[32]=ny[32]+(tBox.height/2+10*sfac[32]);
bl[32]=nx[32]-(tBox.width/2+10*sfac[32]);
br[32]=nx[32]+(tBox.width/2+10*sfac[32]);
paper.setStart(); 
rect=paper.rect(bl[32], bt[32], br[32]-bl[32], bb[32]-bt[32], 10*sfac[32]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[32]=paper.setFinish(); 

t[33]=paper.text(nx[33],ny[33],'Velocity from a Position-Time\nGraph').attr({fill:"#666666","font-size": 14*sfac[33]});
tBox=t[33].getBBox(); 
bt[33]=ny[33]-(tBox.height/2+10*sfac[33]);
bb[33]=ny[33]+(tBox.height/2+10*sfac[33]);
bl[33]=nx[33]-(tBox.width/2+10*sfac[33]);
br[33]=nx[33]+(tBox.width/2+10*sfac[33]);
paper.setStart(); 
rect=paper.rect(bl[33], bt[33], br[33]-bl[33], bb[33]-bt[33], 10*sfac[33]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[33]=paper.setFinish(); 

t[34]=paper.text(nx[34],ny[34],'Quarks').attr({fill:"#666666","font-size": 14*sfac[34]});
tBox=t[34].getBBox(); 
bt[34]=ny[34]-(tBox.height/2+10*sfac[34]);
bb[34]=ny[34]+(tBox.height/2+10*sfac[34]);
bl[34]=nx[34]-(tBox.width/2+10*sfac[34]);
br[34]=nx[34]+(tBox.width/2+10*sfac[34]);
paper.setStart(); 
rect=paper.rect(bl[34], bt[34], br[34]-bl[34], bb[34]-bt[34], 10*sfac[34]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[34]=paper.setFinish(); 

t[35]=paper.text(nx[35],ny[35]-10,'Velocity as the derivative\nof Displacement').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[35]});
t[35].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Velocity-and-Acceleration/#Velocity as the derivative of Displacement", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Velocity-and-Acceleration/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Velocity-and-Acceleration/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Velocity-and-Acceleration/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[35], bt[35], br[35]-bl[35], bb[35]-bt[35], 10*sfac[35]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[35]=paper.setFinish(); 
t[35].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[36]=paper.text(nx[36],ny[36],'Acceleration Due to Gravity').attr({fill:"#666666","font-size": 14*sfac[36]});
tBox=t[36].getBBox(); 
bt[36]=ny[36]-(tBox.height/2+10*sfac[36]);
bb[36]=ny[36]+(tBox.height/2+10*sfac[36]);
bl[36]=nx[36]-(tBox.width/2+10*sfac[36]);
br[36]=nx[36]+(tBox.width/2+10*sfac[36]);
paper.setStart(); 
rect=paper.rect(bl[36], bt[36], br[36]-bl[36], bb[36]-bt[36], 10*sfac[36]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[36]=paper.setFinish(); 

t[37]=paper.text(nx[37],ny[37],'Power').attr({fill:"#666666","font-size": 14*sfac[37]});
tBox=t[37].getBBox(); 
bt[37]=ny[37]-(tBox.height/2+10*sfac[37]);
bb[37]=ny[37]+(tBox.height/2+10*sfac[37]);
bl[37]=nx[37]-(tBox.width/2+10*sfac[37]);
br[37]=nx[37]+(tBox.width/2+10*sfac[37]);
paper.setStart(); 
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[37]=paper.setFinish(); 

t[38]=paper.text(nx[38],ny[38]-10,'The Force on a Current Carrying\nWire in a Magnetic Field').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[38]});
t[38].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Current-and-Magnetism/#The Force on a Current Carrying Wire in a Magnetic Field", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Current-and-Magnetism/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Current-and-Magnetism/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Current-and-Magnetism/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[38], bt[38], br[38]-bl[38], bb[38]-bt[38], 10*sfac[38]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[38]=paper.setFinish(); 
t[38].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[39]=paper.text(nx[39],ny[39],'States of Matter').attr({fill:"#666666","font-size": 14*sfac[39]});
tBox=t[39].getBBox(); 
bt[39]=ny[39]-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
paper.setStart(); 
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 

t[40]=paper.text(nx[40],ny[40],'Wave form Energy').attr({fill:"#666666","font-size": 14*sfac[40]});
tBox=t[40].getBBox(); 
bt[40]=ny[40]-(tBox.height/2+10*sfac[40]);
bb[40]=ny[40]+(tBox.height/2+10*sfac[40]);
bl[40]=nx[40]-(tBox.width/2+10*sfac[40]);
br[40]=nx[40]+(tBox.width/2+10*sfac[40]);
paper.setStart(); 
rect=paper.rect(bl[40], bt[40], br[40]-bl[40], bb[40]-bt[40], 10*sfac[40]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[40]=paper.setFinish(); 

t[41]=paper.text(nx[41],ny[41],'Energy').attr({fill:"#666666","font-size": 14*sfac[41]});
tBox=t[41].getBBox(); 
bt[41]=ny[41]-(tBox.height/2+10*sfac[41]);
bb[41]=ny[41]+(tBox.height/2+10*sfac[41]);
bl[41]=nx[41]-(tBox.width/2+10*sfac[41]);
br[41]=nx[41]+(tBox.width/2+10*sfac[41]);
paper.setStart(); 
rect=paper.rect(bl[41], bt[41], br[41]-bl[41], bb[41]-bt[41], 10*sfac[41]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[41]=paper.setFinish(); 

t[42]=paper.text(nx[42],ny[42]-10,'Kinetic Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[42]});
t[42].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Kinetic-Energy/#Kinetic Energy", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Kinetic-Energy/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Kinetic-Energy/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[42], bt[42], br[42]-bl[42], bb[42]-bt[42], 10*sfac[42]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[42]=paper.setFinish(); 
t[42].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[43]=paper.text(nx[43],ny[43],'The Addition of Non-perpendicular\nVectors').attr({fill:"#666666","font-size": 14*sfac[43]});
tBox=t[43].getBBox(); 
bt[43]=ny[43]-(tBox.height/2+10*sfac[43]);
bb[43]=ny[43]+(tBox.height/2+10*sfac[43]);
bl[43]=nx[43]-(tBox.width/2+10*sfac[43]);
br[43]=nx[43]+(tBox.width/2+10*sfac[43]);
paper.setStart(); 
rect=paper.rect(bl[43], bt[43], br[43]-bl[43], bb[43]-bt[43], 10*sfac[43]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[43]=paper.setFinish(); 

t[44]=paper.text(nx[44],ny[44],'Surface Tension').attr({fill:"#666666","font-size": 14*sfac[44]});
tBox=t[44].getBBox(); 
bt[44]=ny[44]-(tBox.height/2+10*sfac[44]);
bb[44]=ny[44]+(tBox.height/2+10*sfac[44]);
bl[44]=nx[44]-(tBox.width/2+10*sfac[44]);
br[44]=nx[44]+(tBox.width/2+10*sfac[44]);
paper.setStart(); 
rect=paper.rect(bl[44], bt[44], br[44]-bl[44], bb[44]-bt[44], 10*sfac[44]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[44]=paper.setFinish(); 

t[45]=paper.text(nx[45],ny[45],'Binding Energy').attr({fill:"#666666","font-size": 14*sfac[45]});
tBox=t[45].getBBox(); 
bt[45]=ny[45]-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
paper.setStart(); 
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[45]=paper.setFinish(); 

t[46]=paper.text(nx[46],ny[46],'Radiation from Incandescent Bodies').attr({fill:"#666666","font-size": 14*sfac[46]});
tBox=t[46].getBBox(); 
bt[46]=ny[46]-(tBox.height/2+10*sfac[46]);
bb[46]=ny[46]+(tBox.height/2+10*sfac[46]);
bl[46]=nx[46]-(tBox.width/2+10*sfac[46]);
br[46]=nx[46]+(tBox.width/2+10*sfac[46]);
paper.setStart(); 
rect=paper.rect(bl[46], bt[46], br[46]-bl[46], bb[46]-bt[46], 10*sfac[46]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[46]=paper.setFinish(); 

t[47]=paper.text(nx[47],ny[47],'Damped Oscillations').attr({fill:"#666666","font-size": 14*sfac[47]});
tBox=t[47].getBBox(); 
bt[47]=ny[47]-(tBox.height/2+10*sfac[47]);
bb[47]=ny[47]+(tBox.height/2+10*sfac[47]);
bl[47]=nx[47]-(tBox.width/2+10*sfac[47]);
br[47]=nx[47]+(tBox.width/2+10*sfac[47]);
paper.setStart(); 
rect=paper.rect(bl[47], bt[47], br[47]-bl[47], bb[47]-bt[47], 10*sfac[47]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[47]=paper.setFinish(); 

t[48]=paper.text(nx[48],ny[48],'Displacement During Uniform\nAcceleration').attr({fill:"#666666","font-size": 14*sfac[48]});
tBox=t[48].getBBox(); 
bt[48]=ny[48]-(tBox.height/2+10*sfac[48]);
bb[48]=ny[48]+(tBox.height/2+10*sfac[48]);
bl[48]=nx[48]-(tBox.width/2+10*sfac[48]);
br[48]=nx[48]+(tBox.width/2+10*sfac[48]);
paper.setStart(); 
rect=paper.rect(bl[48], bt[48], br[48]-bl[48], bb[48]-bt[48], 10*sfac[48]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[48]=paper.setFinish(); 

t[49]=paper.text(nx[49],ny[49]-10,'Angular Momentum').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[49]});
t[49].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angular-Momentum/#Angular Momentum", target: "_top",title:"Click to jump to concept"});
}); 
t[49].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[49].getBBox(); 
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
yicon = bb[49]-25; 
xicon2 = nx[49]+-40; 
xicon3 = nx[49]+-10; 
xicon4 = nx[49]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angular-Momentum/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angular-Momentum/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[49], bt[49], br[49]-bl[49], bb[49]-bt[49], 10*sfac[49]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[49]=paper.setFinish(); 
t[49].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[50]=paper.text(nx[50],ny[50],"Newton's Third Law and Momentum").attr({fill:"#666666","font-size": 14*sfac[50]});
tBox=t[50].getBBox(); 
bt[50]=ny[50]-(tBox.height/2+10*sfac[50]);
bb[50]=ny[50]+(tBox.height/2+10*sfac[50]);
bl[50]=nx[50]-(tBox.width/2+10*sfac[50]);
br[50]=nx[50]+(tBox.width/2+10*sfac[50]);
paper.setStart(); 
rect=paper.rect(bl[50], bt[50], br[50]-bl[50], bb[50]-bt[50], 10*sfac[50]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[50]=paper.setFinish(); 

t[51]=paper.text(nx[51],ny[51]-10,'Refraction of Light').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[51]});
t[51].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Refraction/#Refraction of Light", target: "_top",title:"Click to jump to concept"});
}); 
t[51].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[51].getBBox(); 
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
yicon = bb[51]-25; 
xicon2 = nx[51]+-40; 
xicon3 = nx[51]+-10; 
xicon4 = nx[51]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Refraction/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Refraction/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Refraction/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[51], bt[51], br[51]-bl[51], bb[51]-bt[51], 10*sfac[51]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[51]=paper.setFinish(); 
t[51].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[52]=paper.text(nx[52],ny[52],'Work, Power, and Simple Machines').attr({fill:"#666666","font-size": 14*sfac[52]});
tBox=t[52].getBBox(); 
bt[52]=ny[52]-(tBox.height/2+10*sfac[52]);
bb[52]=ny[52]+(tBox.height/2+10*sfac[52]);
bl[52]=nx[52]-(tBox.width/2+10*sfac[52]);
br[52]=nx[52]+(tBox.width/2+10*sfac[52]);
paper.setStart(); 
rect=paper.rect(bl[52], bt[52], br[52]-bl[52], bb[52]-bt[52], 10*sfac[52]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[52]=paper.setFinish(); 

t[53]=paper.text(nx[53],ny[53],'Particle Physics').attr({fill:"#666666","font-size": 14*sfac[53]});
tBox=t[53].getBBox(); 
bt[53]=ny[53]-(tBox.height/2+10*sfac[53]);
bb[53]=ny[53]+(tBox.height/2+10*sfac[53]);
bl[53]=nx[53]-(tBox.width/2+10*sfac[53]);
br[53]=nx[53]+(tBox.width/2+10*sfac[53]);
paper.setStart(); 
rect=paper.rect(bl[53], bt[53], br[53]-bl[53], bb[53]-bt[53], 10*sfac[53]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[53]=paper.setFinish(); 

t[54]=paper.text(nx[54],ny[54]-10,'Distance and Displacement').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[54]});
t[54].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Position-and-Displacement/#Distance and Displacement", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Position-and-Displacement/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Position-and-Displacement/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Position-and-Displacement/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[54], bt[54], br[54]-bl[54], bb[54]-bt[54], 10*sfac[54]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[54]=paper.setFinish(); 
t[54].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[55]=paper.text(nx[55],ny[55],'The Electric Field Between\nParallel Plates').attr({fill:"#666666","font-size": 14*sfac[55]});
tBox=t[55].getBBox(); 
bt[55]=ny[55]-(tBox.height/2+10*sfac[55]);
bb[55]=ny[55]+(tBox.height/2+10*sfac[55]);
bl[55]=nx[55]-(tBox.width/2+10*sfac[55]);
br[55]=nx[55]+(tBox.width/2+10*sfac[55]);
paper.setStart(); 
rect=paper.rect(bl[55], bt[55], br[55]-bl[55], bb[55]-bt[55], 10*sfac[55]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[55]=paper.setFinish(); 

t[56]=paper.text(nx[56],ny[56],'The Law of Reflection').attr({fill:"#666666","font-size": 14*sfac[56]});
tBox=t[56].getBBox(); 
bt[56]=ny[56]-(tBox.height/2+10*sfac[56]);
bb[56]=ny[56]+(tBox.height/2+10*sfac[56]);
bl[56]=nx[56]-(tBox.width/2+10*sfac[56]);
br[56]=nx[56]+(tBox.width/2+10*sfac[56]);
paper.setStart(); 
rect=paper.rect(bl[56], bt[56], br[56]-bl[56], bb[56]-bt[56], 10*sfac[56]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[56]=paper.setFinish(); 

t[57]=paper.text(nx[57],ny[57],'First Law of Thermodynamics').attr({fill:"#666666","font-size": 14*sfac[57]});
tBox=t[57].getBBox(); 
bt[57]=ny[57]-(tBox.height/2+10*sfac[57]);
bb[57]=ny[57]+(tBox.height/2+10*sfac[57]);
bl[57]=nx[57]-(tBox.width/2+10*sfac[57]);
br[57]=nx[57]+(tBox.width/2+10*sfac[57]);
paper.setStart(); 
rect=paper.rect(bl[57], bt[57], br[57]-bl[57], bb[57]-bt[57], 10*sfac[57]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[57]=paper.setFinish(); 

t[58]=paper.text(nx[58],ny[58],'Conductors, Insulators,\nSemiconductors').attr({fill:"#666666","font-size": 14*sfac[58]});
tBox=t[58].getBBox(); 
bt[58]=ny[58]-(tBox.height/2+10*sfac[58]);
bb[58]=ny[58]+(tBox.height/2+10*sfac[58]);
bl[58]=nx[58]-(tBox.width/2+10*sfac[58]);
br[58]=nx[58]+(tBox.width/2+10*sfac[58]);
paper.setStart(); 
rect=paper.rect(bl[58], bt[58], br[58]-bl[58], bb[58]-bt[58], 10*sfac[58]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[58]=paper.setFinish(); 

t[59]=paper.text(nx[59],ny[59],'The Lens Equation').attr({fill:"#666666","font-size": 14*sfac[59]});
tBox=t[59].getBBox(); 
bt[59]=ny[59]-(tBox.height/2+10*sfac[59]);
bb[59]=ny[59]+(tBox.height/2+10*sfac[59]);
bl[59]=nx[59]-(tBox.width/2+10*sfac[59]);
br[59]=nx[59]+(tBox.width/2+10*sfac[59]);
paper.setStart(); 
rect=paper.rect(bl[59], bt[59], br[59]-bl[59], bb[59]-bt[59], 10*sfac[59]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[59]=paper.setFinish(); 

t[60]=paper.text(nx[60],ny[60],'Diffraction and Interference\nof Light').attr({fill:"#666666","font-size": 14*sfac[60]});
tBox=t[60].getBBox(); 
bt[60]=ny[60]-(tBox.height/2+10*sfac[60]);
bb[60]=ny[60]+(tBox.height/2+10*sfac[60]);
bl[60]=nx[60]-(tBox.width/2+10*sfac[60]);
br[60]=nx[60]+(tBox.width/2+10*sfac[60]);
paper.setStart(); 
rect=paper.rect(bl[60], bt[60], br[60]-bl[60], bb[60]-bt[60], 10*sfac[60]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[60]=paper.setFinish(); 

t[61]=paper.text(nx[61],ny[61]-10,'Diffraction of Light').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[61]});
t[61].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Diffraction/#Diffraction of Light", target: "_top",title:"Click to jump to concept"});
}); 
t[61].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[61].getBBox(); 
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
yicon = bb[61]-25; 
xicon2 = nx[61]+-40; 
xicon3 = nx[61]+-10; 
xicon4 = nx[61]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Diffraction/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Diffraction/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Diffraction/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[61], bt[61], br[61]-bl[61], bb[61]-bt[61], 10*sfac[61]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[61]=paper.setFinish(); 
t[61].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[62]=paper.text(nx[62],ny[62]-10,'Radioactive Decay').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[62]});
t[62].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Radiation/#Radioactive Decay", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Radiation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Radiation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Radiation/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[62], bt[62], br[62]-bl[62], bb[62]-bt[62], 10*sfac[62]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[62]=paper.setFinish(); 
t[62].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[63]=paper.text(nx[63],ny[63],'Second Law of Thermodynamics').attr({fill:"#666666","font-size": 14*sfac[63]});
tBox=t[63].getBBox(); 
bt[63]=ny[63]-(tBox.height/2+10*sfac[63]);
bb[63]=ny[63]+(tBox.height/2+10*sfac[63]);
bl[63]=nx[63]-(tBox.width/2+10*sfac[63]);
br[63]=nx[63]+(tBox.width/2+10*sfac[63]);
paper.setStart(); 
rect=paper.rect(bl[63], bt[63], br[63]-bl[63], bb[63]-bt[63], 10*sfac[63]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[63]=paper.setFinish(); 

t[64]=paper.text(nx[64],ny[64],'Diagramming Electric\nCircuits').attr({fill:"#666666","font-size": 14*sfac[64]});
tBox=t[64].getBBox(); 
bt[64]=ny[64]-(tBox.height/2+10*sfac[64]);
bb[64]=ny[64]+(tBox.height/2+10*sfac[64]);
bl[64]=nx[64]-(tBox.width/2+10*sfac[64]);
br[64]=nx[64]+(tBox.width/2+10*sfac[64]);
paper.setStart(); 
rect=paper.rect(bl[64], bt[64], br[64]-bl[64], bb[64]-bt[64], 10*sfac[64]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[64]=paper.setFinish(); 

t[65]=paper.text(nx[65],ny[65],'Charging by Induction').attr({fill:"#666666","font-size": 14*sfac[65]});
tBox=t[65].getBBox(); 
bt[65]=ny[65]-(tBox.height/2+10*sfac[65]);
bb[65]=ny[65]+(tBox.height/2+10*sfac[65]);
bl[65]=nx[65]-(tBox.width/2+10*sfac[65]);
br[65]=nx[65]+(tBox.width/2+10*sfac[65]);
paper.setStart(); 
rect=paper.rect(bl[65], bt[65], br[65]-bl[65], bb[65]-bt[65], 10*sfac[65]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[65]=paper.setFinish(); 

t[66]=paper.text(nx[66],ny[66]-10,'What is Force?').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[66]});
t[66].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Types-of-Forces/#What is Force?", target: "_top",title:"Click to jump to concept"});
}); 
t[66].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[66].getBBox(); 
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
yicon = bb[66]-25; 
xicon2 = nx[66]+-40; 
xicon3 = nx[66]+-10; 
xicon4 = nx[66]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Forces/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Forces/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Forces/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[66], bt[66], br[66]-bl[66], bb[66]-bt[66], 10*sfac[66]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[66]=paper.setFinish(); 
t[66].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[67]=paper.text(nx[67],ny[67],'Transmitted Waves').attr({fill:"#666666","font-size": 14*sfac[67]});
tBox=t[67].getBBox(); 
bt[67]=ny[67]-(tBox.height/2+10*sfac[67]);
bb[67]=ny[67]+(tBox.height/2+10*sfac[67]);
bl[67]=nx[67]-(tBox.width/2+10*sfac[67]);
br[67]=nx[67]+(tBox.width/2+10*sfac[67]);
paper.setStart(); 
rect=paper.rect(bl[67], bt[67], br[67]-bl[67], bb[67]-bt[67], 10*sfac[67]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[67]=paper.setFinish(); 

t[68]=paper.text(nx[68],ny[68],"Snell's Law").attr({fill:"#666666","font-size": 14*sfac[68]});
tBox=t[68].getBBox(); 
bt[68]=ny[68]-(tBox.height/2+10*sfac[68]);
bb[68]=ny[68]+(tBox.height/2+10*sfac[68]);
bl[68]=nx[68]-(tBox.width/2+10*sfac[68]);
br[68]=nx[68]+(tBox.width/2+10*sfac[68]);
paper.setStart(); 
rect=paper.rect(bl[68], bt[68], br[68]-bl[68], bb[68]-bt[68], 10*sfac[68]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[68]=paper.setFinish(); 

t[69]=paper.text(nx[69],ny[69],'Vector Forces').attr({fill:"#666666","font-size": 14*sfac[69]});
tBox=t[69].getBBox(); 
bt[69]=ny[69]-(tBox.height/2+10*sfac[69]);
bb[69]=ny[69]+(tBox.height/2+10*sfac[69]);
bl[69]=nx[69]-(tBox.width/2+10*sfac[69]);
br[69]=nx[69]+(tBox.width/2+10*sfac[69]);
paper.setStart(); 
rect=paper.rect(bl[69], bt[69], br[69]-bl[69], bb[69]-bt[69], 10*sfac[69]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[69]=paper.setFinish(); 

t[70]=paper.text(nx[70],ny[70],'Conservation in Energy Transfer').attr({fill:"#666666","font-size": 14*sfac[70]});
tBox=t[70].getBBox(); 
bt[70]=ny[70]-(tBox.height/2+10*sfac[70]);
bb[70]=ny[70]+(tBox.height/2+10*sfac[70]);
bl[70]=nx[70]-(tBox.width/2+10*sfac[70]);
br[70]=nx[70]+(tBox.width/2+10*sfac[70]);
paper.setStart(); 
rect=paper.rect(bl[70], bt[70], br[70]-bl[70], bb[70]-bt[70], 10*sfac[70]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[70]=paper.setFinish(); 

t[71]=paper.text(nx[71],ny[71],'Resonance with Sound Waves').attr({fill:"#666666","font-size": 14*sfac[71]});
tBox=t[71].getBBox(); 
bt[71]=ny[71]-(tBox.height/2+10*sfac[71]);
bb[71]=ny[71]+(tBox.height/2+10*sfac[71]);
bl[71]=nx[71]-(tBox.width/2+10*sfac[71]);
br[71]=nx[71]+(tBox.width/2+10*sfac[71]);
paper.setStart(); 
rect=paper.rect(bl[71], bt[71], br[71]-bl[71], bb[71]-bt[71], 10*sfac[71]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[71]=paper.setFinish(); 

t[72]=paper.text(nx[72],ny[72],'Electricity and Magnetism').attr({fill:"#666666","font-size": 14*sfac[72]});
tBox=t[72].getBBox(); 
bt[72]=ny[72]-(tBox.height/2+10*sfac[72]);
bb[72]=ny[72]+(tBox.height/2+10*sfac[72]);
bl[72]=nx[72]-(tBox.width/2+10*sfac[72]);
br[72]=nx[72]+(tBox.width/2+10*sfac[72]);
paper.setStart(); 
rect=paper.rect(bl[72], bt[72], br[72]-bl[72], bb[72]-bt[72], 10*sfac[72]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[72]=paper.setFinish(); 

t[73]=paper.text(nx[73],ny[73],'Parallel Circuits').attr({fill:"#666666","font-size": 14*sfac[73]});
tBox=t[73].getBBox(); 
bt[73]=ny[73]-(tBox.height/2+10*sfac[73]);
bb[73]=ny[73]+(tBox.height/2+10*sfac[73]);
bl[73]=nx[73]-(tBox.width/2+10*sfac[73]);
br[73]=nx[73]+(tBox.width/2+10*sfac[73]);
paper.setStart(); 
rect=paper.rect(bl[73], bt[73], br[73]-bl[73], bb[73]-bt[73], 10*sfac[73]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[73]=paper.setFinish(); 

t[74]=paper.text(nx[74],ny[74],'Velocity-Time Graph for\nConstant Velocity').attr({fill:"#666666","font-size": 14*sfac[74]});
tBox=t[74].getBBox(); 
bt[74]=ny[74]-(tBox.height/2+10*sfac[74]);
bb[74]=ny[74]+(tBox.height/2+10*sfac[74]);
bl[74]=nx[74]-(tBox.width/2+10*sfac[74]);
br[74]=nx[74]+(tBox.width/2+10*sfac[74]);
paper.setStart(); 
rect=paper.rect(bl[74], bt[74], br[74]-bl[74], bb[74]-bt[74], 10*sfac[74]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[74]=paper.setFinish(); 

t[75]=paper.text(nx[75],ny[75]-10,'Yo-Yo Type Problems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[75]});
t[75].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Yo-Yo-Type-Problems/#Yo-Yo Type Problems", target: "_top",title:"Click to jump to concept"});
}); 
t[75].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[75].getBBox(); 
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
yicon = bb[75]-25; 
xicon2 = nx[75]+-40; 
xicon3 = nx[75]+-10; 
xicon4 = nx[75]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Yo-Yo-Type-Problems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Yo-Yo-Type-Problems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[75], bt[75], br[75]-bl[75], bb[75]-bt[75], 10*sfac[75]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[75]=paper.setFinish(); 
t[75].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[76]=paper.text(nx[76],ny[76]-10,'Types of Waves').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[76]});
t[76].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Types-of-Waves/#Types of Waves", target: "_top",title:"Click to jump to concept"});
}); 
t[76].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[76].getBBox(); 
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
yicon = bb[76]-25; 
xicon2 = nx[76]+-40; 
xicon3 = nx[76]+-10; 
xicon4 = nx[76]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Waves/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Waves/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[76], bt[76], br[76]-bl[76], bb[76]-bt[76], 10*sfac[76]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[76]=paper.setFinish(); 
t[76].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[77]=paper.text(nx[77],ny[77]-10,"Newton's 2nd Law for Rotation").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[77]});
t[77].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Newtons-Second-Law-for-Rotation/#Newton's 2nd Law for Rotation", target: "_top",title:"Click to jump to concept"});
}); 
t[77].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[77].getBBox(); 
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
yicon = bb[77]-25; 
xicon2 = nx[77]+-40; 
xicon3 = nx[77]+-10; 
xicon4 = nx[77]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Newtons-Second-Law-for-Rotation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Newtons-Second-Law-for-Rotation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[77], bt[77], br[77]-bl[77], bb[77]-bt[77], 10*sfac[77]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[77]=paper.setFinish(); 
t[77].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[78]=paper.text(nx[78],ny[78],'Evaporation and Condensation').attr({fill:"#666666","font-size": 14*sfac[78]});
tBox=t[78].getBBox(); 
bt[78]=ny[78]-(tBox.height/2+10*sfac[78]);
bb[78]=ny[78]+(tBox.height/2+10*sfac[78]);
bl[78]=nx[78]-(tBox.width/2+10*sfac[78]);
br[78]=nx[78]+(tBox.width/2+10*sfac[78]);
paper.setStart(); 
rect=paper.rect(bl[78], bt[78], br[78]-bl[78], bb[78]-bt[78], 10*sfac[78]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[78]=paper.setFinish(); 

t[79]=paper.text(nx[79],ny[79],'Single Slit Diffraction').attr({fill:"#666666","font-size": 14*sfac[79]});
tBox=t[79].getBBox(); 
bt[79]=ny[79]-(tBox.height/2+10*sfac[79]);
bb[79]=ny[79]+(tBox.height/2+10*sfac[79]);
bl[79]=nx[79]-(tBox.width/2+10*sfac[79]);
br[79]=nx[79]+(tBox.width/2+10*sfac[79]);
paper.setStart(); 
rect=paper.rect(bl[79], bt[79], br[79]-bl[79], bb[79]-bt[79], 10*sfac[79]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[79]=paper.setFinish(); 

t[80]=paper.text(nx[80],ny[80]-10,'Mirrors and Lenses').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[80]});
t[80].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mirrors/#Mirrors and Lenses", target: "_top",title:"Click to jump to concept"});
}); 
t[80].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[80].getBBox(); 
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
yicon = bb[80]-25; 
xicon2 = nx[80]+-40; 
xicon3 = nx[80]+-10; 
xicon4 = nx[80]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mirrors/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mirrors/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mirrors/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[80], bt[80], br[80]-bl[80], bb[80]-bt[80], 10*sfac[80]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[80]=paper.setFinish(); 
t[80].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[81]=paper.text(nx[81],ny[81],'Nuclear Equations').attr({fill:"#666666","font-size": 14*sfac[81]});
tBox=t[81].getBBox(); 
bt[81]=ny[81]-(tBox.height/2+10*sfac[81]);
bb[81]=ny[81]+(tBox.height/2+10*sfac[81]);
bl[81]=nx[81]-(tBox.width/2+10*sfac[81]);
br[81]=nx[81]+(tBox.width/2+10*sfac[81]);
paper.setStart(); 
rect=paper.rect(bl[81], bt[81], br[81]-bl[81], bb[81]-bt[81], 10*sfac[81]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[81]=paper.setFinish(); 

t[82]=paper.text(nx[82],ny[82],'Driven Oscillations').attr({fill:"#666666","font-size": 14*sfac[82]});
tBox=t[82].getBBox(); 
bt[82]=ny[82]-(tBox.height/2+10*sfac[82]);
bb[82]=ny[82]+(tBox.height/2+10*sfac[82]);
bl[82]=nx[82]-(tBox.width/2+10*sfac[82]);
br[82]=nx[82]+(tBox.width/2+10*sfac[82]);
paper.setStart(); 
rect=paper.rect(bl[82], bt[82], br[82]-bl[82], bb[82]-bt[82], 10*sfac[82]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[82]=paper.setFinish(); 

t[83]=paper.text(nx[83],ny[83],'Properties of Magnets').attr({fill:"#666666","font-size": 14*sfac[83]});
tBox=t[83].getBBox(); 
bt[83]=ny[83]-(tBox.height/2+10*sfac[83]);
bb[83]=ny[83]+(tBox.height/2+10*sfac[83]);
bl[83]=nx[83]-(tBox.width/2+10*sfac[83]);
br[83]=nx[83]+(tBox.width/2+10*sfac[83]);
paper.setStart(); 
rect=paper.rect(bl[83], bt[83], br[83]-bl[83], bb[83]-bt[83], 10*sfac[83]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[83]=paper.setFinish(); 

t[84]=paper.text(nx[84],ny[84],'Series Circuits').attr({fill:"#666666","font-size": 14*sfac[84]});
tBox=t[84].getBBox(); 
bt[84]=ny[84]-(tBox.height/2+10*sfac[84]);
bb[84]=ny[84]+(tBox.height/2+10*sfac[84]);
bl[84]=nx[84]-(tBox.width/2+10*sfac[84]);
br[84]=nx[84]+(tBox.width/2+10*sfac[84]);
paper.setStart(); 
rect=paper.rect(bl[84], bt[84], br[84]-bl[84], bb[84]-bt[84], 10*sfac[84]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[84]=paper.setFinish(); 

t[85]=paper.text(nx[85],ny[85],'Accleration-Time Graph for\nUniform Accleration').attr({fill:"#666666","font-size": 14*sfac[85]});
tBox=t[85].getBBox(); 
bt[85]=ny[85]-(tBox.height/2+10*sfac[85]);
bb[85]=ny[85]+(tBox.height/2+10*sfac[85]);
bl[85]=nx[85]-(tBox.width/2+10*sfac[85]);
br[85]=nx[85]+(tBox.width/2+10*sfac[85]);
paper.setStart(); 
rect=paper.rect(bl[85], bt[85], br[85]-bl[85], bb[85]-bt[85], 10*sfac[85]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[85]=paper.setFinish(); 

t[86]=paper.text(nx[86],ny[86],'Introduction to the Atom').attr({fill:"#666666","font-size": 14*sfac[86]});
tBox=t[86].getBBox(); 
bt[86]=ny[86]-(tBox.height/2+10*sfac[86]);
bb[86]=ny[86]+(tBox.height/2+10*sfac[86]);
bl[86]=nx[86]-(tBox.width/2+10*sfac[86]);
br[86]=nx[86]+(tBox.width/2+10*sfac[86]);
paper.setStart(); 
rect=paper.rect(bl[86], bt[86], br[86]-bl[86], bb[86]-bt[86], 10*sfac[86]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[86]=paper.setFinish(); 

t[87]=paper.text(nx[87],ny[87],'Production of Electromagnetic Waves').attr({fill:"#666666","font-size": 14*sfac[87]});
tBox=t[87].getBBox(); 
bt[87]=ny[87]-(tBox.height/2+10*sfac[87]);
bb[87]=ny[87]+(tBox.height/2+10*sfac[87]);
bl[87]=nx[87]-(tBox.width/2+10*sfac[87]);
br[87]=nx[87]+(tBox.width/2+10*sfac[87]);
paper.setStart(); 
rect=paper.rect(bl[87], bt[87], br[87]-bl[87], bb[87]-bt[87], 10*sfac[87]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[87]=paper.setFinish(); 

t[88]=paper.text(nx[88],ny[88],'The Electric Field').attr({fill:"#666666","font-size": 14*sfac[88]});
tBox=t[88].getBBox(); 
bt[88]=ny[88]-(tBox.height/2+10*sfac[88]);
bb[88]=ny[88]+(tBox.height/2+10*sfac[88]);
bl[88]=nx[88]-(tBox.width/2+10*sfac[88]);
br[88]=nx[88]+(tBox.width/2+10*sfac[88]);
paper.setStart(); 
rect=paper.rect(bl[88], bt[88], br[88]-bl[88], bb[88]-bt[88], 10*sfac[88]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[88]=paper.setFinish(); 

t[89]=paper.text(nx[89],ny[89],'Particles and Waves').attr({fill:"#666666","font-size": 14*sfac[89]});
tBox=t[89].getBBox(); 
bt[89]=ny[89]-(tBox.height/2+10*sfac[89]);
bb[89]=ny[89]+(tBox.height/2+10*sfac[89]);
bl[89]=nx[89]-(tBox.width/2+10*sfac[89]);
br[89]=nx[89]+(tBox.width/2+10*sfac[89]);
paper.setStart(); 
rect=paper.rect(bl[89], bt[89], br[89]-bl[89], bb[89]-bt[89], 10*sfac[89]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[89]=paper.setFinish(); 

t[90]=paper.text(nx[90],ny[90],'Position-Time Graph for\nUniform Accleration').attr({fill:"#666666","font-size": 14*sfac[90]});
tBox=t[90].getBBox(); 
bt[90]=ny[90]-(tBox.height/2+10*sfac[90]);
bb[90]=ny[90]+(tBox.height/2+10*sfac[90]);
bl[90]=nx[90]-(tBox.width/2+10*sfac[90]);
br[90]=nx[90]+(tBox.width/2+10*sfac[90]);
paper.setStart(); 
rect=paper.rect(bl[90], bt[90], br[90]-bl[90], bb[90]-bt[90], 10*sfac[90]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[90]=paper.setFinish(); 

t[91]=paper.text(nx[91],ny[91]-10,'Waves and Energy Transfer').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[91]});
t[91].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Wave-Equation/#Waves and Energy Transfer", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Wave-Equation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Wave-Equation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Wave-Equation/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[91], bt[91], br[91]-bl[91], bb[91]-bt[91], 10*sfac[91]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[91]=paper.setFinish(); 
t[91].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[92]=paper.text(nx[92],ny[92],'Sharing of Charge').attr({fill:"#666666","font-size": 14*sfac[92]});
tBox=t[92].getBBox(); 
bt[92]=ny[92]-(tBox.height/2+10*sfac[92]);
bb[92]=ny[92]+(tBox.height/2+10*sfac[92]);
bl[92]=nx[92]-(tBox.width/2+10*sfac[92]);
br[92]=nx[92]+(tBox.width/2+10*sfac[92]);
paper.setStart(); 
rect=paper.rect(bl[92], bt[92], br[92]-bl[92], bb[92]-bt[92], 10*sfac[92]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[92]=paper.setFinish(); 

t[93]=paper.text(nx[93],ny[93]-10,'Rolling objects').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[93]});
t[93].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Rolling-Objects/#Rolling objects", target: "_top",title:"Click to jump to concept"});
}); 
t[93].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[93].getBBox(); 
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
yicon = bb[93]-25; 
xicon2 = nx[93]+-40; 
xicon3 = nx[93]+-10; 
xicon4 = nx[93]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Rolling-Objects/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Rolling-Objects/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Rolling-Objects/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[93], bt[93], br[93]-bl[93], bb[93]-bt[93], 10*sfac[93]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[93]=paper.setFinish(); 
t[93].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[94]=paper.text(nx[94],ny[94]-10,'Angular Speed').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[94]});
t[94].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angular-Speed/#Angular Speed", target: "_top",title:"Click to jump to concept"});
}); 
t[94].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[94].getBBox(); 
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
yicon = bb[94]-25; 
xicon2 = nx[94]+-40; 
xicon3 = nx[94]+-10; 
xicon4 = nx[94]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angular-Speed/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angular-Speed/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angular-Speed/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[94], bt[94], br[94]-bl[94], bb[94]-bt[94], 10*sfac[94]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[94]=paper.setFinish(); 
t[94].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[95]=paper.text(nx[95],ny[95]-10,'The Nature of Light').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[95]});
t[95].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Speed-of-Light/#The Nature of Light", target: "_top",title:"Click to jump to concept"});
}); 
t[95].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[95].getBBox(); 
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
yicon = bb[95]-25; 
xicon2 = nx[95]+-40; 
xicon3 = nx[95]+-10; 
xicon4 = nx[95]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Speed-of-Light/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Speed-of-Light/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[95], bt[95], br[95]-bl[95], bb[95]-bt[95], 10*sfac[95]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[95]=paper.setFinish(); 
t[95].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[96]=paper.text(nx[96],ny[96]-10,'Series and Parallel Circuits').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[96]});
t[96].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Resistor-Circuits/#Series and Parallel Circuits", target: "_top",title:"Click to jump to concept"});
}); 
t[96].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[96].getBBox(); 
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
yicon = bb[96]-25; 
xicon2 = nx[96]+-40; 
xicon3 = nx[96]+-10; 
xicon4 = nx[96]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Resistor-Circuits/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Resistor-Circuits/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Resistor-Circuits/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[96], bt[96], br[96]-bl[96], bb[96]-bt[96], 10*sfac[96]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[96]=paper.setFinish(); 
t[96].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[97]=paper.text(nx[97],ny[97]-10,"Ohm's Law").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[97]});
t[97].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ohms-Law/#Ohm's Law", target: "_top",title:"Click to jump to concept"});
}); 
t[97].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[97].getBBox(); 
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
yicon = bb[97]-25; 
xicon2 = nx[97]+-40; 
xicon3 = nx[97]+-10; 
xicon4 = nx[97]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Ohms-Law/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Ohms-Law/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Ohms-Law/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[97], bt[97], br[97]-bl[97], bb[97]-bt[97], 10*sfac[97]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[97]=paper.setFinish(); 
t[97].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[98]=paper.text(nx[98],ny[98]-10,'Uniform Circular Motion').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[98]});
t[98].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Circular-Motion/#Uniform Circular Motion", target: "_top",title:"Click to jump to concept"});
}); 
t[98].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[98].getBBox(); 
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
yicon = bb[98]-25; 
xicon2 = nx[98]+-40; 
xicon3 = nx[98]+-10; 
xicon4 = nx[98]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Circular-Motion/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Circular-Motion/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Circular-Motion/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[98], bt[98], br[98]-bl[98], bb[98]-bt[98], 10*sfac[98]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[98]=paper.setFinish(); 
t[98].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[99]=paper.text(nx[99],ny[99]-10,'Unit Conversions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[99]});
t[99].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Unit-Conversions/#Unit Conversions", target: "_top",title:"Click to jump to concept"});
}); 
t[99].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[99].getBBox(); 
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
yicon = bb[99]-25; 
xicon2 = nx[99]+-40; 
xicon3 = nx[99]+-10; 
xicon4 = nx[99]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Unit-Conversions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Unit-Conversions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Unit-Conversions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[99], bt[99], br[99]-bl[99], bb[99]-bt[99], 10*sfac[99]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[99]=paper.setFinish(); 
t[99].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[100]=paper.text(nx[100],ny[100]-10,'Capacitor Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[100]});
t[100].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Capacitor-Energy/#Capacitor Energy", target: "_top",title:"Click to jump to concept"});
}); 
t[100].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[100].getBBox(); 
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
yicon = bb[100]-25; 
xicon2 = nx[100]+-40; 
xicon3 = nx[100]+-10; 
xicon4 = nx[100]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Capacitor-Energy/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Capacitor-Energy/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[100], bt[100], br[100]-bl[100], bb[100]-bt[100], 10*sfac[100]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[100]=paper.setFinish(); 
t[100].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[101]=paper.text(nx[101],ny[101],'Liquids').attr({fill:"#666666","font-size": 14*sfac[101]});
tBox=t[101].getBBox(); 
bt[101]=ny[101]-(tBox.height/2+10*sfac[101]);
bb[101]=ny[101]+(tBox.height/2+10*sfac[101]);
bl[101]=nx[101]-(tBox.width/2+10*sfac[101]);
br[101]=nx[101]+(tBox.width/2+10*sfac[101]);
paper.setStart(); 
rect=paper.rect(bl[101], bt[101], br[101]-bl[101], bb[101]-bt[101], 10*sfac[101]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[101]=paper.setFinish(); 

t[102]=paper.text(nx[102],ny[102]-10,'Description of an Electric Field').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[102]});
t[102].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Electric-Fields/#Description of an Electric Field", target: "_top",title:"Click to jump to concept"});
}); 
t[102].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[102].getBBox(); 
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
yicon = bb[102]-25; 
xicon2 = nx[102]+-40; 
xicon3 = nx[102]+-10; 
xicon4 = nx[102]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Electric-Fields/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Electric-Fields/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Electric-Fields/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[102], bt[102], br[102]-bl[102], bb[102]-bt[102], 10*sfac[102]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[102]=paper.setFinish(); 
t[102].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[103]=paper.text(nx[103],ny[103]-10,'Ammeters and Voltmeters').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[103]});
t[103].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Internal-Resistance/#Ammeters and Voltmeters", target: "_top",title:"Click to jump to concept"});
}); 
t[103].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[103].getBBox(); 
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
yicon = bb[103]-25; 
xicon2 = nx[103]+-40; 
xicon3 = nx[103]+-10; 
xicon4 = nx[103]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Internal-Resistance/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Internal-Resistance/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Internal-Resistance/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[103], bt[103], br[103]-bl[103], bb[103]-bt[103], 10*sfac[103]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[103]=paper.setFinish(); 
t[103].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[104]=paper.text(nx[104],ny[104]-10,'Universal Gravitation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[104]});
t[104].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Universal-Law-of-Gravity/#Universal Gravitation", target: "_top",title:"Click to jump to concept"});
}); 
t[104].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[104].getBBox(); 
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
yicon = bb[104]-25; 
xicon2 = nx[104]+-40; 
xicon3 = nx[104]+-10; 
xicon4 = nx[104]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Universal-Law-of-Gravity/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Universal-Law-of-Gravity/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[104], bt[104], br[104]-bl[104], bb[104]-bt[104], 10*sfac[104]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[104]=paper.setFinish(); 
t[104].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[105]=paper.text(nx[105],ny[105],'Waves').attr({fill:"#666666","font-size": 14*sfac[105]});
tBox=t[105].getBBox(); 
bt[105]=ny[105]-(tBox.height/2+10*sfac[105]);
bb[105]=ny[105]+(tBox.height/2+10*sfac[105]);
bl[105]=nx[105]-(tBox.width/2+10*sfac[105]);
br[105]=nx[105]+(tBox.width/2+10*sfac[105]);
paper.setStart(); 
rect=paper.rect(bl[105], bt[105], br[105]-bl[105], bb[105]-bt[105], 10*sfac[105]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[105]=paper.setFinish(); 

t[106]=paper.text(nx[106],ny[106],'Vector Addition in\nTwo Dimensions').attr({fill:"#666666","font-size": 14*sfac[106]});
tBox=t[106].getBBox(); 
bt[106]=ny[106]-(tBox.height/2+10*sfac[106]);
bb[106]=ny[106]+(tBox.height/2+10*sfac[106]);
bl[106]=nx[106]-(tBox.width/2+10*sfac[106]);
br[106]=nx[106]+(tBox.width/2+10*sfac[106]);
paper.setStart(); 
rect=paper.rect(bl[106], bt[106], br[106]-bl[106], bb[106]-bt[106], 10*sfac[106]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[106]=paper.setFinish(); 

t[107]=paper.text(nx[107],ny[107],'Rotational Mechanics').attr({fill:"#666666","font-size": 14*sfac[107]});
tBox=t[107].getBBox(); 
bt[107]=ny[107]-(tBox.height/2+10*sfac[107]);
bb[107]=ny[107]+(tBox.height/2+10*sfac[107]);
bl[107]=nx[107]-(tBox.width/2+10*sfac[107]);
br[107]=nx[107]+(tBox.width/2+10*sfac[107]);
paper.setStart(); 
rect=paper.rect(bl[107], bt[107], br[107]-bl[107], bb[107]-bt[107], 10*sfac[107]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[107]=paper.setFinish(); 

t[108]=paper.text(nx[108],ny[108]-10,'Electromagnetic Radiation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[108]});
t[108].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Electromagnetic-Spectrum/#Electromagnetic Radiation", target: "_top",title:"Click to jump to concept"});
}); 
t[108].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[108].getBBox(); 
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
yicon = bb[108]-25; 
xicon2 = nx[108]+-40; 
xicon3 = nx[108]+-10; 
xicon4 = nx[108]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Electromagnetic-Spectrum/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Electromagnetic-Spectrum/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Electromagnetic-Spectrum/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[108], bt[108], br[108]-bl[108], bb[108]-bt[108], 10*sfac[108]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[108]=paper.setFinish(); 
t[108].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[109]=paper.text(nx[109],ny[109],'Concave Lenses').attr({fill:"#666666","font-size": 14*sfac[109]});
tBox=t[109].getBBox(); 
bt[109]=ny[109]-(tBox.height/2+10*sfac[109]);
bb[109]=ny[109]+(tBox.height/2+10*sfac[109]);
bl[109]=nx[109]-(tBox.width/2+10*sfac[109]);
br[109]=nx[109]+(tBox.width/2+10*sfac[109]);
paper.setStart(); 
rect=paper.rect(bl[109], bt[109], br[109]-bl[109], bb[109]-bt[109], 10*sfac[109]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[109]=paper.setFinish(); 

t[110]=paper.text(nx[110],ny[110]-10,'Thermal Expansion of Matter').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[110]});
t[110].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Gas-Pressure/#Thermal Expansion of Matter", target: "_top",title:"Click to jump to concept"});
}); 
t[110].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[110].getBBox(); 
bt[110]=ny[110]-10-(tBox.height/2+10*sfac[110]);
bb[110]=ny[110]-10+(tBox.height/2+10*sfac[110]);
bl[110]=nx[110]-(tBox.width/2+10*sfac[110]);
br[110]=nx[110]+(tBox.width/2+10*sfac[110]);
var nwidth = br[110]-bl[110]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[110] = bl[110] - delta; 
    br[110] = br[110] + delta; 
} 
bb[110] = bb[110]+20; 
yicon = bb[110]-25; 
xicon2 = nx[110]+-40; 
xicon3 = nx[110]+-10; 
xicon4 = nx[110]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Gas-Pressure/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Gas-Pressure/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Gas-Pressure/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[110], bt[110], br[110]-bl[110], bb[110]-bt[110], 10*sfac[110]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[110]=paper.setFinish(); 
t[110].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[111]=paper.text(nx[111],ny[111],'Relativity').attr({fill:"#666666","font-size": 14*sfac[111]});
tBox=t[111].getBBox(); 
bt[111]=ny[111]-(tBox.height/2+10*sfac[111]);
bb[111]=ny[111]+(tBox.height/2+10*sfac[111]);
bl[111]=nx[111]-(tBox.width/2+10*sfac[111]);
br[111]=nx[111]+(tBox.width/2+10*sfac[111]);
paper.setStart(); 
rect=paper.rect(bl[111], bt[111], br[111]-bl[111], bb[111]-bt[111], 10*sfac[111]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[111]=paper.setFinish(); 

t[112]=paper.text(nx[112],ny[112]-10,'Time Dilation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[112]});
t[112].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Time-Dilation/#Time Dilation", target: "_top",title:"Click to jump to concept"});
}); 
t[112].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[112].getBBox(); 
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
yicon = bb[112]-25; 
xicon2 = nx[112]+-40; 
xicon3 = nx[112]+-10; 
xicon4 = nx[112]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Time-Dilation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Time-Dilation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Time-Dilation/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[112], bt[112], br[112]-bl[112], bb[112]-bt[112], 10*sfac[112]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[112]=paper.setFinish(); 
t[112].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[113]=paper.text(nx[113],ny[113],'Evolution of the Model\nof the Atom').attr({fill:"#666666","font-size": 14*sfac[113]});
tBox=t[113].getBBox(); 
bt[113]=ny[113]-(tBox.height/2+10*sfac[113]);
bb[113]=ny[113]+(tBox.height/2+10*sfac[113]);
bl[113]=nx[113]-(tBox.width/2+10*sfac[113]);
br[113]=nx[113]+(tBox.width/2+10*sfac[113]);
paper.setStart(); 
rect=paper.rect(bl[113], bt[113], br[113]-bl[113], bb[113]-bt[113], 10*sfac[113]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[113]=paper.setFinish(); 

t[114]=paper.text(nx[114],ny[114]-10,'Energy Problem Solving').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[114]});
t[114].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Energy-Problem-Solving/#Energy Problem Solving", target: "_top",title:"Click to jump to concept"});
}); 
t[114].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[114].getBBox(); 
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
yicon = bb[114]-25; 
xicon2 = nx[114]+-40; 
xicon3 = nx[114]+-10; 
xicon4 = nx[114]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Energy-Problem-Solving/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Energy-Problem-Solving/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Energy-Problem-Solving/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[114], bt[114], br[114]-bl[114], bb[114]-bt[114], 10*sfac[114]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[114]=paper.setFinish(); 
t[114].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[115]=paper.text(nx[115],ny[115],'Diffraction Gratings').attr({fill:"#666666","font-size": 14*sfac[115]});
tBox=t[115].getBBox(); 
bt[115]=ny[115]-(tBox.height/2+10*sfac[115]);
bb[115]=ny[115]+(tBox.height/2+10*sfac[115]);
bl[115]=nx[115]-(tBox.width/2+10*sfac[115]);
br[115]=nx[115]+(tBox.width/2+10*sfac[115]);
paper.setStart(); 
rect=paper.rect(bl[115], bt[115], br[115]-bl[115], bb[115]-bt[115], 10*sfac[115]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[115]=paper.setFinish(); 

t[116]=paper.text(nx[116],ny[116],'Concave Mirrors').attr({fill:"#666666","font-size": 14*sfac[116]});
tBox=t[116].getBBox(); 
bt[116]=ny[116]-(tBox.height/2+10*sfac[116]);
bb[116]=ny[116]+(tBox.height/2+10*sfac[116]);
bl[116]=nx[116]-(tBox.width/2+10*sfac[116]);
br[116]=nx[116]+(tBox.width/2+10*sfac[116]);
paper.setStart(); 
rect=paper.rect(bl[116], bt[116], br[116]-bl[116], bb[116]-bt[116], 10*sfac[116]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[116]=paper.setFinish(); 

t[117]=paper.text(nx[117],ny[117]-10,'Rotational Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[117]});
t[117].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Rolling-Energy-Problems/#Rotational Energy", target: "_top",title:"Click to jump to concept"});
}); 
t[117].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[117].getBBox(); 
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
yicon = bb[117]-25; 
xicon2 = nx[117]+-40; 
xicon3 = nx[117]+-10; 
xicon4 = nx[117]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Rolling-Energy-Problems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Rolling-Energy-Problems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[117], bt[117], br[117]-bl[117], bb[117]-bt[117], 10*sfac[117]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[117]=paper.setFinish(); 
t[117].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[118]=paper.text(nx[118],ny[118]-10,'Electric Generators').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[118]});
t[118].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Generators-and-Motors/#Electric Generators", target: "_top",title:"Click to jump to concept"});
}); 
t[118].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[118].getBBox(); 
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
yicon = bb[118]-25; 
xicon2 = nx[118]+-40; 
xicon3 = nx[118]+-10; 
xicon4 = nx[118]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Generators-and-Motors/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Generators-and-Motors/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[118], bt[118], br[118]-bl[118], bb[118]-bt[118], 10*sfac[118]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[118]=paper.setFinish(); 
t[118].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[119]=paper.text(nx[119],ny[119],'Motion and Force').attr({fill:"#666666","font-size": 14*sfac[119]});
tBox=t[119].getBBox(); 
bt[119]=ny[119]-(tBox.height/2+10*sfac[119]);
bb[119]=ny[119]+(tBox.height/2+10*sfac[119]);
bl[119]=nx[119]-(tBox.width/2+10*sfac[119]);
br[119]=nx[119]+(tBox.width/2+10*sfac[119]);
paper.setStart(); 
rect=paper.rect(bl[119], bt[119], br[119]-bl[119], bb[119]-bt[119], 10*sfac[119]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[119]=paper.setFinish(); 

t[120]=paper.text(nx[120],ny[120]-10,'Centripetal Force Problems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[120]});
t[120].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Centripetal-Force-Problems/#Centripetal Force Problems", target: "_top",title:"Click to jump to concept"});
}); 
t[120].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[120].getBBox(); 
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
yicon = bb[120]-25; 
xicon2 = nx[120]+-40; 
xicon3 = nx[120]+-10; 
xicon4 = nx[120]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Centripetal-Force-Problems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Centripetal-Force-Problems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Centripetal-Force-Problems/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[120], bt[120], br[120]-bl[120], bb[120]-bt[120], 10*sfac[120]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[120]=paper.setFinish(); 
t[120].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[121]=paper.text(nx[121],ny[121],'Transformers').attr({fill:"#666666","font-size": 14*sfac[121]});
tBox=t[121].getBBox(); 
bt[121]=ny[121]-(tBox.height/2+10*sfac[121]);
bb[121]=ny[121]+(tBox.height/2+10*sfac[121]);
bl[121]=nx[121]-(tBox.width/2+10*sfac[121]);
br[121]=nx[121]+(tBox.width/2+10*sfac[121]);
paper.setStart(); 
rect=paper.rect(bl[121], bt[121], br[121]-bl[121], bb[121]-bt[121], 10*sfac[121]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[121]=paper.setFinish(); 

t[122]=paper.text(nx[122],ny[122]-10,'Diffraction and Interference\nof Waves').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[122]});
t[122].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Beat-Frequencies/#Diffraction and Interference of Waves", target: "_top",title:"Click to jump to concept"});
}); 
t[122].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[122].getBBox(); 
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
yicon = bb[122]-25; 
xicon2 = nx[122]+-40; 
xicon3 = nx[122]+-10; 
xicon4 = nx[122]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Beat-Frequencies/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Beat-Frequencies/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Beat-Frequencies/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[122], bt[122], br[122]-bl[122], bb[122]-bt[122], 10*sfac[122]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[122]=paper.setFinish(); 
t[122].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[123]=paper.text(nx[123],ny[123],'The Equilibrant').attr({fill:"#666666","font-size": 14*sfac[123]});
tBox=t[123].getBBox(); 
bt[123]=ny[123]-(tBox.height/2+10*sfac[123]);
bb[123]=ny[123]+(tBox.height/2+10*sfac[123]);
bl[123]=nx[123]-(tBox.width/2+10*sfac[123]);
br[123]=nx[123]+(tBox.width/2+10*sfac[123]);
paper.setStart(); 
rect=paper.rect(bl[123], bt[123], br[123]-bl[123], bb[123]-bt[123], 10*sfac[123]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[123]=paper.setFinish(); 

t[124]=paper.text(nx[124],ny[124]-10,'Work and Change in\nPotential Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[124]});
t[124].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Work/#Work and Change in Potential Energy", target: "_top",title:"Click to jump to concept"});
}); 
t[124].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[124].getBBox(); 
bt[124]=ny[124]-10-(tBox.height/2+10*sfac[124]);
bb[124]=ny[124]-10+(tBox.height/2+10*sfac[124]);
bl[124]=nx[124]-(tBox.width/2+10*sfac[124]);
br[124]=nx[124]+(tBox.width/2+10*sfac[124]);
var nwidth = br[124]-bl[124]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[124] = bl[124] - delta; 
    br[124] = br[124] + delta; 
} 
bb[124] = bb[124]+20; 
yicon = bb[124]-25; 
xicon2 = nx[124]+-40; 
xicon3 = nx[124]+-10; 
xicon4 = nx[124]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Work/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Work/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Work/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[124], bt[124], br[124]-bl[124], bb[124]-bt[124], 10*sfac[124]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[124]=paper.setFinish(); 
t[124].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[125]=paper.text(nx[125],ny[125],'The Atom').attr({fill:"#666666","font-size": 14*sfac[125]});
tBox=t[125].getBBox(); 
bt[125]=ny[125]-(tBox.height/2+10*sfac[125]);
bb[125]=ny[125]+(tBox.height/2+10*sfac[125]);
bl[125]=nx[125]-(tBox.width/2+10*sfac[125]);
br[125]=nx[125]+(tBox.width/2+10*sfac[125]);
paper.setStart(); 
rect=paper.rect(bl[125], bt[125], br[125]-bl[125], bb[125]-bt[125], 10*sfac[125]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[125]=paper.setFinish(); 

t[126]=paper.text(nx[126],ny[126],'Independence of Vectors\nQuantities').attr({fill:"#666666","font-size": 14*sfac[126]});
tBox=t[126].getBBox(); 
bt[126]=ny[126]-(tBox.height/2+10*sfac[126]);
bb[126]=ny[126]+(tBox.height/2+10*sfac[126]);
bl[126]=nx[126]-(tBox.width/2+10*sfac[126]);
br[126]=nx[126]+(tBox.width/2+10*sfac[126]);
paper.setStart(); 
rect=paper.rect(bl[126], bt[126], br[126]-bl[126], bb[126]-bt[126], 10*sfac[126]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[126]=paper.setFinish(); 

t[127]=paper.text(nx[127],ny[127],'Wave Speed in a\nMedium').attr({fill:"#666666","font-size": 14*sfac[127]});
tBox=t[127].getBBox(); 
bt[127]=ny[127]-(tBox.height/2+10*sfac[127]);
bb[127]=ny[127]+(tBox.height/2+10*sfac[127]);
bl[127]=nx[127]-(tBox.width/2+10*sfac[127]);
br[127]=nx[127]+(tBox.width/2+10*sfac[127]);
paper.setStart(); 
rect=paper.rect(bl[127], bt[127], br[127]-bl[127], bb[127]-bt[127], 10*sfac[127]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[127]=paper.setFinish(); 

t[128]=paper.text(nx[128],ny[128],'Nuclear Reactors').attr({fill:"#666666","font-size": 14*sfac[128]});
tBox=t[128].getBBox(); 
bt[128]=ny[128]-(tBox.height/2+10*sfac[128]);
bb[128]=ny[128]+(tBox.height/2+10*sfac[128]);
bl[128]=nx[128]-(tBox.width/2+10*sfac[128]);
br[128]=nx[128]+(tBox.width/2+10*sfac[128]);
paper.setStart(); 
rect=paper.rect(bl[128], bt[128], br[128]-bl[128], bb[128]-bt[128], 10*sfac[128]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[128]=paper.setFinish(); 

t[129]=paper.text(nx[129],ny[129],'Standard Model of Particle Physics').attr({fill:"#666666","font-size": 14*sfac[129]});
tBox=t[129].getBBox(); 
bt[129]=ny[129]-(tBox.height/2+10*sfac[129]);
bb[129]=ny[129]+(tBox.height/2+10*sfac[129]);
bl[129]=nx[129]-(tBox.width/2+10*sfac[129]);
br[129]=nx[129]+(tBox.width/2+10*sfac[129]);
paper.setStart(); 
rect=paper.rect(bl[129], bt[129], br[129]-bl[129], bb[129]-bt[129], 10*sfac[129]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[129]=paper.setFinish(); 

t[130]=paper.text(nx[130],ny[130]-10,'Lenses').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[130]});
t[130].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Lens/#Lenses", target: "_top",title:"Click to jump to concept"});
}); 
t[130].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[130].getBBox(); 
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
yicon = bb[130]-25; 
xicon2 = nx[130]+-40; 
xicon3 = nx[130]+-10; 
xicon4 = nx[130]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Lens/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Lens/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Lens/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[130], bt[130], br[130]-bl[130], bb[130]-bt[130], 10*sfac[130]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[130]=paper.setFinish(); 
t[130].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[131]=paper.text(nx[131],ny[131]-10,'Gravity and Space Problems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[131]});
t[131].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Gravity-and-Space-Problems/#Gravity and Space Problems", target: "_top",title:"Click to jump to concept"});
}); 
t[131].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[131].getBBox(); 
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
yicon = bb[131]-25; 
xicon2 = nx[131]+-40; 
xicon3 = nx[131]+-10; 
xicon4 = nx[131]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Gravity-and-Space-Problems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Gravity-and-Space-Problems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Gravity-and-Space-Problems/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[131], bt[131], br[131]-bl[131], bb[131]-bt[131], 10*sfac[131]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[131]=paper.setFinish(); 
t[131].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[132]=paper.text(nx[132],ny[132],'The Ampere').attr({fill:"#666666","font-size": 14*sfac[132]});
tBox=t[132].getBBox(); 
bt[132]=ny[132]-(tBox.height/2+10*sfac[132]);
bb[132]=ny[132]+(tBox.height/2+10*sfac[132]);
bl[132]=nx[132]-(tBox.width/2+10*sfac[132]);
br[132]=nx[132]+(tBox.width/2+10*sfac[132]);
paper.setStart(); 
rect=paper.rect(bl[132], bt[132], br[132]-bl[132], bb[132]-bt[132], 10*sfac[132]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[132]=paper.setFinish(); 

t[133]=paper.text(nx[133],ny[133]-10,'Specific Heat').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[133]});
t[133].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Specific-Heat-and-Phase-Change/#Specific Heat", target: "_top",title:"Click to jump to concept"});
}); 
t[133].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[133].getBBox(); 
bt[133]=ny[133]-10-(tBox.height/2+10*sfac[133]);
bb[133]=ny[133]-10+(tBox.height/2+10*sfac[133]);
bl[133]=nx[133]-(tBox.width/2+10*sfac[133]);
br[133]=nx[133]+(tBox.width/2+10*sfac[133]);
var nwidth = br[133]-bl[133]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[133] = bl[133] - delta; 
    br[133] = br[133] + delta; 
} 
bb[133] = bb[133]+20; 
yicon = bb[133]-25; 
xicon2 = nx[133]+-40; 
xicon3 = nx[133]+-10; 
xicon4 = nx[133]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Specific-Heat-and-Phase-Change/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Specific-Heat-and-Phase-Change/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Specific-Heat-and-Phase-Change/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[133], bt[133], br[133]-bl[133], bb[133]-bt[133], 10*sfac[133]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[133]=paper.setFinish(); 
t[133].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[134]=paper.text(nx[134],ny[134]-10,'Light and Color').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[134]});
t[134].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Color/#Light and Color", target: "_top",title:"Click to jump to concept"});
}); 
t[134].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[134].getBBox(); 
bt[134]=ny[134]-10-(tBox.height/2+10*sfac[134]);
bb[134]=ny[134]-10+(tBox.height/2+10*sfac[134]);
bl[134]=nx[134]-(tBox.width/2+10*sfac[134]);
br[134]=nx[134]+(tBox.width/2+10*sfac[134]);
var nwidth = br[134]-bl[134]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[134] = bl[134] - delta; 
    br[134] = br[134] + delta; 
} 
bb[134] = bb[134]+20; 
yicon = bb[134]-25; 
xicon2 = nx[134]+-40; 
xicon3 = nx[134]+-10; 
xicon4 = nx[134]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Color/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Color/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[134], bt[134], br[134]-bl[134], bb[134]-bt[134], 10*sfac[134]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[134]=paper.setFinish(); 
t[134].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[135]=paper.text(nx[135],ny[135],'Heat Transfer (Conduction, Convection,\nand Radiation)').attr({fill:"#666666","font-size": 14*sfac[135]});
tBox=t[135].getBBox(); 
bt[135]=ny[135]-(tBox.height/2+10*sfac[135]);
bb[135]=ny[135]+(tBox.height/2+10*sfac[135]);
bl[135]=nx[135]-(tBox.width/2+10*sfac[135]);
br[135]=nx[135]+(tBox.width/2+10*sfac[135]);
paper.setStart(); 
rect=paper.rect(bl[135], bt[135], br[135]-bl[135], bb[135]-bt[135], 10*sfac[135]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[135]=paper.setFinish(); 

t[136]=paper.text(nx[136],ny[136],'Reflection and Refraction').attr({fill:"#666666","font-size": 14*sfac[136]});
tBox=t[136].getBBox(); 
bt[136]=ny[136]-(tBox.height/2+10*sfac[136]);
bb[136]=ny[136]+(tBox.height/2+10*sfac[136]);
bl[136]=nx[136]-(tBox.width/2+10*sfac[136]);
br[136]=nx[136]+(tBox.width/2+10*sfac[136]);
paper.setStart(); 
rect=paper.rect(bl[136], bt[136], br[136]-bl[136], bb[136]-bt[136], 10*sfac[136]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[136]=paper.setFinish(); 

t[137]=paper.text(nx[137],ny[137],'Current in Electric Circuits').attr({fill:"#666666","font-size": 14*sfac[137]});
tBox=t[137].getBBox(); 
bt[137]=ny[137]-(tBox.height/2+10*sfac[137]);
bb[137]=ny[137]+(tBox.height/2+10*sfac[137]);
bl[137]=nx[137]-(tBox.width/2+10*sfac[137]);
br[137]=nx[137]+(tBox.width/2+10*sfac[137]);
paper.setStart(); 
rect=paper.rect(bl[137], bt[137], br[137]-bl[137], bb[137]-bt[137], 10*sfac[137]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[137]=paper.setFinish(); 

t[138]=paper.text(nx[138],ny[138],'Nuclear Particles').attr({fill:"#666666","font-size": 14*sfac[138]});
tBox=t[138].getBBox(); 
bt[138]=ny[138]-(tBox.height/2+10*sfac[138]);
bb[138]=ny[138]+(tBox.height/2+10*sfac[138]);
bl[138]=nx[138]-(tBox.width/2+10*sfac[138]);
br[138]=nx[138]+(tBox.width/2+10*sfac[138]);
paper.setStart(); 
rect=paper.rect(bl[138], bt[138], br[138]-bl[138], bb[138]-bt[138], 10*sfac[138]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[138]=paper.setFinish(); 

t[139]=paper.text(nx[139],ny[139]-10,'Standing Waves').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[139]});
t[139].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Standing-Waves/#Standing Waves", target: "_top",title:"Click to jump to concept"});
}); 
t[139].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[139].getBBox(); 
bt[139]=ny[139]-10-(tBox.height/2+10*sfac[139]);
bb[139]=ny[139]-10+(tBox.height/2+10*sfac[139]);
bl[139]=nx[139]-(tBox.width/2+10*sfac[139]);
br[139]=nx[139]+(tBox.width/2+10*sfac[139]);
var nwidth = br[139]-bl[139]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[139] = bl[139] - delta; 
    br[139] = br[139] + delta; 
} 
bb[139] = bb[139]+20; 
yicon = bb[139]-25; 
xicon2 = nx[139]+-40; 
xicon3 = nx[139]+-10; 
xicon4 = nx[139]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Standing-Waves/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Standing-Waves/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Standing-Waves/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[139], bt[139], br[139]-bl[139], bb[139]-bt[139], 10*sfac[139]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[139]=paper.setFinish(); 
t[139].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[140]=paper.text(nx[140],ny[140],'Law of Conservation of\nMomentum').attr({fill:"#666666","font-size": 14*sfac[140]});
tBox=t[140].getBBox(); 
bt[140]=ny[140]-(tBox.height/2+10*sfac[140]);
bb[140]=ny[140]+(tBox.height/2+10*sfac[140]);
bl[140]=nx[140]-(tBox.width/2+10*sfac[140]);
br[140]=nx[140]+(tBox.width/2+10*sfac[140]);
paper.setStart(); 
rect=paper.rect(bl[140], bt[140], br[140]-bl[140], bb[140]-bt[140], 10*sfac[140]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[140]=paper.setFinish(); 

t[141]=paper.text(nx[141],ny[141]-10,'The Force on a Single\nCharged Particle').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[141]});
t[141].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Lorentz-Force/#The Force on a Single Charged Particle", target: "_top",title:"Click to jump to concept"});
}); 
t[141].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[141].getBBox(); 
bt[141]=ny[141]-10-(tBox.height/2+10*sfac[141]);
bb[141]=ny[141]-10+(tBox.height/2+10*sfac[141]);
bl[141]=nx[141]-(tBox.width/2+10*sfac[141]);
br[141]=nx[141]+(tBox.width/2+10*sfac[141]);
var nwidth = br[141]-bl[141]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[141] = bl[141] - delta; 
    br[141] = br[141] + delta; 
} 
bb[141] = bb[141]+20; 
yicon = bb[141]-25; 
xicon2 = nx[141]+-40; 
xicon3 = nx[141]+-10; 
xicon4 = nx[141]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Lorentz-Force/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Lorentz-Force/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Lorentz-Force/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[141], bt[141], br[141]-bl[141], bb[141]-bt[141], 10*sfac[141]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[141]=paper.setFinish(); 
t[141].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[142]=paper.text(nx[142],ny[142]-10,'Torque').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[142]});
t[142].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Torque/#Torque", target: "_top",title:"Click to jump to concept"});
}); 
t[142].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[142].getBBox(); 
bt[142]=ny[142]-10-(tBox.height/2+10*sfac[142]);
bb[142]=ny[142]-10+(tBox.height/2+10*sfac[142]);
bl[142]=nx[142]-(tBox.width/2+10*sfac[142]);
br[142]=nx[142]+(tBox.width/2+10*sfac[142]);
var nwidth = br[142]-bl[142]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[142] = bl[142] - delta; 
    br[142] = br[142] + delta; 
} 
bb[142] = bb[142]+20; 
yicon = bb[142]-25; 
xicon2 = nx[142]+-40; 
xicon3 = nx[142]+-10; 
xicon4 = nx[142]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Torque/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Torque/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Torque/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[142], bt[142], br[142]-bl[142], bb[142]-bt[142], 10*sfac[142]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[142]=paper.setFinish(); 
t[142].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[143]=paper.text(nx[143],ny[143],'Fission and Fusion').attr({fill:"#666666","font-size": 14*sfac[143]});
tBox=t[143].getBBox(); 
bt[143]=ny[143]-(tBox.height/2+10*sfac[143]);
bb[143]=ny[143]+(tBox.height/2+10*sfac[143]);
bl[143]=nx[143]-(tBox.width/2+10*sfac[143]);
br[143]=nx[143]+(tBox.width/2+10*sfac[143]);
paper.setStart(); 
rect=paper.rect(bl[143], bt[143], br[143]-bl[143], bb[143]-bt[143], 10*sfac[143]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[143]=paper.setFinish(); 

t[144]=paper.text(nx[144],ny[144],'Thermal Energy and\nTemperature').attr({fill:"#666666","font-size": 14*sfac[144]});
tBox=t[144].getBBox(); 
bt[144]=ny[144]-(tBox.height/2+10*sfac[144]);
bb[144]=ny[144]+(tBox.height/2+10*sfac[144]);
bl[144]=nx[144]-(tBox.width/2+10*sfac[144]);
br[144]=nx[144]+(tBox.width/2+10*sfac[144]);
paper.setStart(); 
rect=paper.rect(bl[144], bt[144], br[144]-bl[144], bb[144]-bt[144], 10*sfac[144]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[144]=paper.setFinish(); 

t[145]=paper.text(nx[145],ny[145]-10,'Electromagnetic Induction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[145]});
t[145].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inductance/#Electromagnetic Induction", target: "_top",title:"Click to jump to concept"});
}); 
t[145].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[145].getBBox(); 
bt[145]=ny[145]-10-(tBox.height/2+10*sfac[145]);
bb[145]=ny[145]-10+(tBox.height/2+10*sfac[145]);
bl[145]=nx[145]-(tBox.width/2+10*sfac[145]);
br[145]=nx[145]+(tBox.width/2+10*sfac[145]);
var nwidth = br[145]-bl[145]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[145] = bl[145] - delta; 
    br[145] = br[145] + delta; 
} 
bb[145] = bb[145]+20; 
yicon = bb[145]-25; 
xicon2 = nx[145]+-40; 
xicon3 = nx[145]+-10; 
xicon4 = nx[145]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inductance/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inductance/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inductance/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[145], bt[145], br[145]-bl[145], bb[145]-bt[145], 10*sfac[145]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[145]=paper.setFinish(); 
t[145].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[146]=paper.text(nx[146],ny[146],'Physics').attr({fill:"#000000","font-size": 24*sfac[146]});
tBox=t[146].getBBox(); 
bt[146]=ny[146]-(tBox.height/2+10*sfac[146]);
bb[146]=ny[146]+(tBox.height/2+10*sfac[146]);
bl[146]=nx[146]-(tBox.width/2+10*sfac[146]);
br[146]=nx[146]+(tBox.width/2+10*sfac[146]);
paper.setStart(); 
rect=paper.rect(bl[146], bt[146], br[146]-bl[146], bb[146]-bt[146], 10*sfac[146]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[146]=paper.setFinish(); 

t[147]=paper.text(nx[147],ny[147],'Description of Electric\nCurrent').attr({fill:"#666666","font-size": 14*sfac[147]});
tBox=t[147].getBBox(); 
bt[147]=ny[147]-(tBox.height/2+10*sfac[147]);
bb[147]=ny[147]+(tBox.height/2+10*sfac[147]);
bl[147]=nx[147]-(tBox.width/2+10*sfac[147]);
br[147]=nx[147]+(tBox.width/2+10*sfac[147]);
paper.setStart(); 
rect=paper.rect(bl[147], bt[147], br[147]-bl[147], bb[147]-bt[147], 10*sfac[147]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[147]=paper.setFinish(); 

t[148]=paper.text(nx[148],ny[148],'Work and Direction of Force').attr({fill:"#666666","font-size": 14*sfac[148]});
tBox=t[148].getBBox(); 
bt[148]=ny[148]-(tBox.height/2+10*sfac[148]);
bb[148]=ny[148]+(tBox.height/2+10*sfac[148]);
bl[148]=nx[148]-(tBox.width/2+10*sfac[148]);
br[148]=nx[148]+(tBox.width/2+10*sfac[148]);
paper.setStart(); 
rect=paper.rect(bl[148], bt[148], br[148]-bl[148], bb[148]-bt[148], 10*sfac[148]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[148]=paper.setFinish(); 

t[149]=paper.text(nx[149],ny[149]-10,'Half-Life').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[149]});
t[149].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Half-Life/#Half-Life", target: "_top",title:"Click to jump to concept"});
}); 
t[149].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[149].getBBox(); 
bt[149]=ny[149]-10-(tBox.height/2+10*sfac[149]);
bb[149]=ny[149]-10+(tBox.height/2+10*sfac[149]);
bl[149]=nx[149]-(tBox.width/2+10*sfac[149]);
br[149]=nx[149]+(tBox.width/2+10*sfac[149]);
var nwidth = br[149]-bl[149]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[149] = bl[149] - delta; 
    br[149] = br[149] + delta; 
} 
bb[149] = bb[149]+20; 
yicon = bb[149]-25; 
xicon2 = nx[149]+-40; 
xicon3 = nx[149]+-10; 
xicon4 = nx[149]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Half-Life/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Half-Life/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[149], bt[149], br[149]-bl[149], bb[149]-bt[149], 10*sfac[149]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[149]=paper.setFinish(); 
t[149].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[150]=paper.text(nx[150],ny[150],'Momentum, Work, Power, and Energy').attr({fill:"#666666","font-size": 14*sfac[150]});
tBox=t[150].getBBox(); 
bt[150]=ny[150]-(tBox.height/2+10*sfac[150]);
bb[150]=ny[150]+(tBox.height/2+10*sfac[150]);
bl[150]=nx[150]-(tBox.width/2+10*sfac[150]);
br[150]=nx[150]+(tBox.width/2+10*sfac[150]);
paper.setStart(); 
rect=paper.rect(bl[150], bt[150], br[150]-bl[150], bb[150]-bt[150], 10*sfac[150]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[150]=paper.setFinish(); 

t[151]=paper.text(nx[151],ny[151],'Thermometry').attr({fill:"#666666","font-size": 14*sfac[151]});
tBox=t[151].getBBox(); 
bt[151]=ny[151]-(tBox.height/2+10*sfac[151]);
bb[151]=ny[151]+(tBox.height/2+10*sfac[151]);
bl[151]=nx[151]-(tBox.width/2+10*sfac[151]);
br[151]=nx[151]+(tBox.width/2+10*sfac[151]);
paper.setStart(); 
rect=paper.rect(bl[151], bt[151], br[151]-bl[151], bb[151]-bt[151], 10*sfac[151]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[151]=paper.setFinish(); 

t[152]=paper.text(nx[152],ny[152]-10,'Energy and Momentum Problems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[152]});
t[152].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Energy-and-Momentum-Problems/#Energy and Momentum Problems", target: "_top",title:"Click to jump to concept"});
}); 
t[152].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[152].getBBox(); 
bt[152]=ny[152]-10-(tBox.height/2+10*sfac[152]);
bb[152]=ny[152]-10+(tBox.height/2+10*sfac[152]);
bl[152]=nx[152]-(tBox.width/2+10*sfac[152]);
br[152]=nx[152]+(tBox.width/2+10*sfac[152]);
var nwidth = br[152]-bl[152]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[152] = bl[152] - delta; 
    br[152] = br[152] + delta; 
} 
bb[152] = bb[152]+20; 
yicon = bb[152]-25; 
xicon2 = nx[152]+-40; 
xicon3 = nx[152]+-10; 
xicon4 = nx[152]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Energy-and-Momentum-Problems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Energy-and-Momentum-Problems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[152], bt[152], br[152]-bl[152], bb[152]-bt[152], 10*sfac[152]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[152]=paper.setFinish(); 
t[152].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[153]=paper.text(nx[153],ny[153],'Sub-Atomic Particles').attr({fill:"#666666","font-size": 14*sfac[153]});
tBox=t[153].getBBox(); 
bt[153]=ny[153]-(tBox.height/2+10*sfac[153]);
bb[153]=ny[153]+(tBox.height/2+10*sfac[153]);
bl[153]=nx[153]-(tBox.width/2+10*sfac[153]);
br[153]=nx[153]+(tBox.width/2+10*sfac[153]);
paper.setStart(); 
rect=paper.rect(bl[153], bt[153], br[153]-bl[153], bb[153]-bt[153], 10*sfac[153]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[153]=paper.setFinish(); 

t[154]=paper.text(nx[154],ny[154]-10,'Momentum and Its Conservation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[154]});
t[154].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Momentum/#Momentum and Its Conservation", target: "_top",title:"Click to jump to concept"});
}); 
t[154].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[154].getBBox(); 
bt[154]=ny[154]-10-(tBox.height/2+10*sfac[154]);
bb[154]=ny[154]-10+(tBox.height/2+10*sfac[154]);
bl[154]=nx[154]-(tBox.width/2+10*sfac[154]);
br[154]=nx[154]+(tBox.width/2+10*sfac[154]);
var nwidth = br[154]-bl[154]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[154] = bl[154] - delta; 
    br[154] = br[154] + delta; 
} 
bb[154] = bb[154]+20; 
yicon = bb[154]-25; 
xicon2 = nx[154]+-40; 
xicon3 = nx[154]+-10; 
xicon4 = nx[154]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Momentum/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Momentum/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Momentum/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[154], bt[154], br[154]-bl[154], bb[154]-bt[154], 10*sfac[154]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[154]=paper.setFinish(); 
t[154].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[155]=paper.text(nx[155],ny[155],'Plane Mirrors').attr({fill:"#666666","font-size": 14*sfac[155]});
tBox=t[155].getBBox(); 
bt[155]=ny[155]-(tBox.height/2+10*sfac[155]);
bb[155]=ny[155]+(tBox.height/2+10*sfac[155]);
bl[155]=nx[155]-(tBox.width/2+10*sfac[155]);
br[155]=nx[155]+(tBox.width/2+10*sfac[155]);
paper.setStart(); 
rect=paper.rect(bl[155], bt[155], br[155]-bl[155], bb[155]-bt[155], 10*sfac[155]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[155]=paper.setFinish(); 

t[156]=paper.text(nx[156],ny[156]-10,'Pendulum').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[156]});
t[156].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Pendulum/#Pendulum", target: "_top",title:"Click to jump to concept"});
}); 
t[156].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[156].getBBox(); 
bt[156]=ny[156]-10-(tBox.height/2+10*sfac[156]);
bb[156]=ny[156]-10+(tBox.height/2+10*sfac[156]);
bl[156]=nx[156]-(tBox.width/2+10*sfac[156]);
br[156]=nx[156]+(tBox.width/2+10*sfac[156]);
var nwidth = br[156]-bl[156]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[156] = bl[156] - delta; 
    br[156] = br[156] + delta; 
} 
bb[156] = bb[156]+20; 
yicon = bb[156]-25; 
xicon2 = nx[156]+-40; 
xicon3 = nx[156]+-10; 
xicon4 = nx[156]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Pendulum/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Pendulum/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Pendulum/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[156], bt[156], br[156]-bl[156], bb[156]-bt[156], 10*sfac[156]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[156]=paper.setFinish(); 
t[156].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[157]=paper.text(nx[157],ny[157],'Induced EMF').attr({fill:"#666666","font-size": 14*sfac[157]});
tBox=t[157].getBBox(); 
bt[157]=ny[157]-(tBox.height/2+10*sfac[157]);
bb[157]=ny[157]+(tBox.height/2+10*sfac[157]);
bl[157]=nx[157]-(tBox.width/2+10*sfac[157]);
br[157]=nx[157]+(tBox.width/2+10*sfac[157]);
paper.setStart(); 
rect=paper.rect(bl[157], bt[157], br[157]-bl[157], bb[157]-bt[157], 10*sfac[157]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[157]=paper.setFinish(); 

t[158]=paper.text(nx[158],ny[158],'Law of Conservation of\nMomentum').attr({fill:"#666666","font-size": 14*sfac[158]});
tBox=t[158].getBBox(); 
bt[158]=ny[158]-(tBox.height/2+10*sfac[158]);
bb[158]=ny[158]+(tBox.height/2+10*sfac[158]);
bl[158]=nx[158]-(tBox.width/2+10*sfac[158]);
br[158]=nx[158]+(tBox.width/2+10*sfac[158]);
paper.setStart(); 
rect=paper.rect(bl[158], bt[158], br[158]-bl[158], bb[158]-bt[158], 10*sfac[158]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[158]=paper.setFinish(); 

t[159]=paper.text(nx[159],ny[159],'Real and Virtual Images').attr({fill:"#666666","font-size": 14*sfac[159]});
tBox=t[159].getBBox(); 
bt[159]=ny[159]-(tBox.height/2+10*sfac[159]);
bb[159]=ny[159]+(tBox.height/2+10*sfac[159]);
bl[159]=nx[159]-(tBox.width/2+10*sfac[159]);
br[159]=nx[159]+(tBox.width/2+10*sfac[159]);
paper.setStart(); 
rect=paper.rect(bl[159], bt[159], br[159]-bl[159], bb[159]-bt[159], 10*sfac[159]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[159]=paper.setFinish(); 

t[160]=paper.text(nx[160],ny[160],'Self-Inductance').attr({fill:"#666666","font-size": 14*sfac[160]});
tBox=t[160].getBBox(); 
bt[160]=ny[160]-(tBox.height/2+10*sfac[160]);
bb[160]=ny[160]+(tBox.height/2+10*sfac[160]);
bl[160]=nx[160]-(tBox.width/2+10*sfac[160]);
br[160]=nx[160]+(tBox.width/2+10*sfac[160]);
paper.setStart(); 
rect=paper.rect(bl[160], bt[160], br[160]-bl[160], bb[160]-bt[160], 10*sfac[160]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[160]=paper.setFinish(); 

t[161]=paper.text(nx[161],ny[161],'Definition of Work').attr({fill:"#666666","font-size": 14*sfac[161]});
tBox=t[161].getBBox(); 
bt[161]=ny[161]-(tBox.height/2+10*sfac[161]);
bb[161]=ny[161]+(tBox.height/2+10*sfac[161]);
bl[161]=nx[161]-(tBox.width/2+10*sfac[161]);
br[161]=nx[161]+(tBox.width/2+10*sfac[161]);
paper.setStart(); 
rect=paper.rect(bl[161], bt[161], br[161]-bl[161], bb[161]-bt[161], 10*sfac[161]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[161]=paper.setFinish(); 

t[162]=paper.text(nx[162],ny[162]-10,'Simple Harmonic Motion').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[162]});
t[162].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Period-and-Frequency/#Simple Harmonic Motion", target: "_top",title:"Click to jump to concept"});
}); 
t[162].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[162].getBBox(); 
bt[162]=ny[162]-10-(tBox.height/2+10*sfac[162]);
bb[162]=ny[162]-10+(tBox.height/2+10*sfac[162]);
bl[162]=nx[162]-(tBox.width/2+10*sfac[162]);
br[162]=nx[162]+(tBox.width/2+10*sfac[162]);
var nwidth = br[162]-bl[162]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[162] = bl[162] - delta; 
    br[162] = br[162] + delta; 
} 
bb[162] = bb[162]+20; 
yicon = bb[162]-25; 
xicon2 = nx[162]+-40; 
xicon3 = nx[162]+-10; 
xicon4 = nx[162]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Period-and-Frequency/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Period-and-Frequency/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Period-and-Frequency/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[162], bt[162], br[162]-bl[162], bb[162]-bt[162], 10*sfac[162]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[162]=paper.setFinish(); 
t[162].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[163]=paper.text(nx[163],ny[163],"Lenz's Law").attr({fill:"#666666","font-size": 14*sfac[163]});
tBox=t[163].getBBox(); 
bt[163]=ny[163]-(tBox.height/2+10*sfac[163]);
bb[163]=ny[163]+(tBox.height/2+10*sfac[163]);
bl[163]=nx[163]-(tBox.width/2+10*sfac[163]);
br[163]=nx[163]+(tBox.width/2+10*sfac[163]);
paper.setStart(); 
rect=paper.rect(bl[163], bt[163], br[163]-bl[163], bb[163]-bt[163], 10*sfac[163]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[163]=paper.setFinish(); 

t[164]=paper.text(nx[164],ny[164],'Vector Cross Products').attr({fill:"#666666","font-size": 14*sfac[164]});
tBox=t[164].getBBox(); 
bt[164]=ny[164]-(tBox.height/2+10*sfac[164]);
bb[164]=ny[164]+(tBox.height/2+10*sfac[164]);
bl[164]=nx[164]-(tBox.width/2+10*sfac[164]);
br[164]=nx[164]+(tBox.width/2+10*sfac[164]);
paper.setStart(); 
rect=paper.rect(bl[164], bt[164], br[164]-bl[164], bb[164]-bt[164], 10*sfac[164]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[164]=paper.setFinish(); 

t[165]=paper.text(nx[165],ny[165],'Quantum Theory').attr({fill:"#666666","font-size": 14*sfac[165]});
tBox=t[165].getBBox(); 
bt[165]=ny[165]-(tBox.height/2+10*sfac[165]);
bb[165]=ny[165]+(tBox.height/2+10*sfac[165]);
bl[165]=nx[165]-(tBox.width/2+10*sfac[165]);
br[165]=nx[165]+(tBox.width/2+10*sfac[165]);
paper.setStart(); 
rect=paper.rect(bl[165], bt[165], br[165]-bl[165], bb[165]-bt[165], 10*sfac[165]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[165]=paper.setFinish(); 

t[166]=paper.text(nx[166],ny[166],'Energy Lost in Collisions').attr({fill:"#666666","font-size": 14*sfac[166]});
tBox=t[166].getBBox(); 
bt[166]=ny[166]-(tBox.height/2+10*sfac[166]);
bb[166]=ny[166]+(tBox.height/2+10*sfac[166]);
bl[166]=nx[166]-(tBox.width/2+10*sfac[166]);
br[166]=nx[166]+(tBox.width/2+10*sfac[166]);
paper.setStart(); 
rect=paper.rect(bl[166], bt[166], br[166]-bl[166], bb[166]-bt[166], 10*sfac[166]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[166]=paper.setFinish(); 

t[167]=paper.text(nx[167],ny[167],'Isotopes').attr({fill:"#666666","font-size": 14*sfac[167]});
tBox=t[167].getBBox(); 
bt[167]=ny[167]-(tBox.height/2+10*sfac[167]);
bb[167]=ny[167]+(tBox.height/2+10*sfac[167]);
bl[167]=nx[167]-(tBox.width/2+10*sfac[167]);
br[167]=nx[167]+(tBox.width/2+10*sfac[167]);
paper.setStart(); 
rect=paper.rect(bl[167], bt[167], br[167]-bl[167], bb[167]-bt[167], 10*sfac[167]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[167]=paper.setFinish(); 

t[168]=paper.text(nx[168],ny[168],'Motion in Two Dimensions').attr({fill:"#666666","font-size": 14*sfac[168]});
tBox=t[168].getBBox(); 
bt[168]=ny[168]-(tBox.height/2+10*sfac[168]);
bb[168]=ny[168]+(tBox.height/2+10*sfac[168]);
bl[168]=nx[168]-(tBox.width/2+10*sfac[168]);
br[168]=nx[168]+(tBox.width/2+10*sfac[168]);
paper.setStart(); 
rect=paper.rect(bl[168], bt[168], br[168]-bl[168], bb[168]-bt[168], 10*sfac[168]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[168]=paper.setFinish(); 

t[169]=paper.text(nx[169],ny[169],'Mechanical Advantage').attr({fill:"#666666","font-size": 14*sfac[169]});
tBox=t[169].getBBox(); 
bt[169]=ny[169]-(tBox.height/2+10*sfac[169]);
bb[169]=ny[169]+(tBox.height/2+10*sfac[169]);
bl[169]=nx[169]-(tBox.width/2+10*sfac[169]);
br[169]=nx[169]+(tBox.width/2+10*sfac[169]);
paper.setStart(); 
rect=paper.rect(bl[169], bt[169], br[169]-bl[169], bb[169]-bt[169], 10*sfac[169]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[169]=paper.setFinish(); 

t[170]=paper.text(nx[170],ny[170],'Final Velocity After Uniform\nAcceleration').attr({fill:"#666666","font-size": 14*sfac[170]});
tBox=t[170].getBBox(); 
bt[170]=ny[170]-(tBox.height/2+10*sfac[170]);
bb[170]=ny[170]+(tBox.height/2+10*sfac[170]);
bl[170]=nx[170]-(tBox.width/2+10*sfac[170]);
br[170]=nx[170]+(tBox.width/2+10*sfac[170]);
paper.setStart(); 
rect=paper.rect(bl[170], bt[170], br[170]-bl[170], bb[170]-bt[170], 10*sfac[170]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[170]=paper.setFinish(); 

t[171]=paper.text(nx[171],ny[171],'The Behavior of Waves\nat a Boundary').attr({fill:"#666666","font-size": 14*sfac[171]});
tBox=t[171].getBBox(); 
bt[171]=ny[171]-(tBox.height/2+10*sfac[171]);
bb[171]=ny[171]+(tBox.height/2+10*sfac[171]);
bl[171]=nx[171]-(tBox.width/2+10*sfac[171]);
br[171]=nx[171]+(tBox.width/2+10*sfac[171]);
paper.setStart(); 
rect=paper.rect(bl[171], bt[171], br[171]-bl[171], bb[171]-bt[171], 10*sfac[171]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[171]=paper.setFinish(); 

t[172]=paper.text(nx[172],ny[172],'Magnetic Field Around a Coil').attr({fill:"#666666","font-size": 14*sfac[172]});
tBox=t[172].getBBox(); 
bt[172]=ny[172]-(tBox.height/2+10*sfac[172]);
bb[172]=ny[172]+(tBox.height/2+10*sfac[172]);
bl[172]=nx[172]-(tBox.width/2+10*sfac[172]);
br[172]=nx[172]+(tBox.width/2+10*sfac[172]);
paper.setStart(); 
rect=paper.rect(bl[172], bt[172], br[172]-bl[172], bb[172]-bt[172], 10*sfac[172]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[172]=paper.setFinish(); 

t[173]=paper.text(nx[173],ny[173]-10,'Kinetic Theory').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[173]});
t[173].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Heat-Engine/#Kinetic Theory", target: "_top",title:"Click to jump to concept"});
}); 
t[173].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[173].getBBox(); 
bt[173]=ny[173]-10-(tBox.height/2+10*sfac[173]);
bb[173]=ny[173]-10+(tBox.height/2+10*sfac[173]);
bl[173]=nx[173]-(tBox.width/2+10*sfac[173]);
br[173]=nx[173]+(tBox.width/2+10*sfac[173]);
var nwidth = br[173]-bl[173]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[173] = bl[173] - delta; 
    br[173] = br[173] + delta; 
} 
bb[173] = bb[173]+20; 
yicon = bb[173]-25; 
xicon2 = nx[173]+-40; 
xicon3 = nx[173]+-10; 
xicon4 = nx[173]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Heat-Engine/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Heat-Engine/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Heat-Engine/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[173], bt[173], br[173]-bl[173], bb[173]-bt[173], 10*sfac[173]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[173]=paper.setFinish(); 
t[173].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[174]=paper.text(nx[174],ny[174],'Electromagnetism').attr({fill:"#666666","font-size": 14*sfac[174]});
tBox=t[174].getBBox(); 
bt[174]=ny[174]-(tBox.height/2+10*sfac[174]);
bb[174]=ny[174]+(tBox.height/2+10*sfac[174]);
bl[174]=nx[174]-(tBox.width/2+10*sfac[174]);
br[174]=nx[174]+(tBox.width/2+10*sfac[174]);
paper.setStart(); 
rect=paper.rect(bl[174], bt[174], br[174]-bl[174], bb[174]-bt[174], 10*sfac[174]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[174]=paper.setFinish(); 

t[175]=paper.text(nx[175],ny[175],'Free Fall').attr({fill:"#666666","font-size": 14*sfac[175]});
tBox=t[175].getBBox(); 
bt[175]=ny[175]-(tBox.height/2+10*sfac[175]);
bb[175]=ny[175]+(tBox.height/2+10*sfac[175]);
bl[175]=nx[175]-(tBox.width/2+10*sfac[175]);
br[175]=nx[175]+(tBox.width/2+10*sfac[175]);
paper.setStart(); 
rect=paper.rect(bl[175], bt[175], br[175]-bl[175], bb[175]-bt[175], 10*sfac[175]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[175]=paper.setFinish(); 

t[176]=paper.text(nx[176],ny[176],'Double Slit Diffraction').attr({fill:"#666666","font-size": 14*sfac[176]});
tBox=t[176].getBBox(); 
bt[176]=ny[176]-(tBox.height/2+10*sfac[176]);
bb[176]=ny[176]+(tBox.height/2+10*sfac[176]);
bl[176]=nx[176]-(tBox.width/2+10*sfac[176]);
br[176]=nx[176]+(tBox.width/2+10*sfac[176]);
paper.setStart(); 
rect=paper.rect(bl[176], bt[176], br[176]-bl[176], bb[176]-bt[176], 10*sfac[176]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[176]=paper.setFinish(); 

t[177]=paper.text(nx[177],ny[177]-10,'Centripetal Acceleration').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[177]});
t[177].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Centripetal-Accerlation/#Centripetal Acceleration", target: "_top",title:"Click to jump to concept"});
}); 
t[177].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[177].getBBox(); 
bt[177]=ny[177]-10-(tBox.height/2+10*sfac[177]);
bb[177]=ny[177]-10+(tBox.height/2+10*sfac[177]);
bl[177]=nx[177]-(tBox.width/2+10*sfac[177]);
br[177]=nx[177]+(tBox.width/2+10*sfac[177]);
var nwidth = br[177]-bl[177]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[177] = bl[177] - delta; 
    br[177] = br[177] + delta; 
} 
bb[177] = bb[177]+20; 
yicon = bb[177]-25; 
xicon2 = nx[177]+-40; 
xicon3 = nx[177]+-10; 
xicon4 = nx[177]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Centripetal-Accerlation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Centripetal-Accerlation/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[177], bt[177], br[177]-bl[177], bb[177]-bt[177], 10*sfac[177]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[177]=paper.setFinish(); 
t[177].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[178]=paper.text(nx[178],ny[178]-10,'Length Contraction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[178]});
t[178].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Length-Contraction/#Length Contraction", target: "_top",title:"Click to jump to concept"});
}); 
t[178].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[178].getBBox(); 
bt[178]=ny[178]-10-(tBox.height/2+10*sfac[178]);
bb[178]=ny[178]-10+(tBox.height/2+10*sfac[178]);
bl[178]=nx[178]-(tBox.width/2+10*sfac[178]);
br[178]=nx[178]+(tBox.width/2+10*sfac[178]);
var nwidth = br[178]-bl[178]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[178] = bl[178] - delta; 
    br[178] = br[178] + delta; 
} 
bb[178] = bb[178]+20; 
yicon = bb[178]-25; 
xicon2 = nx[178]+-40; 
xicon3 = nx[178]+-10; 
xicon4 = nx[178]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Length-Contraction/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Length-Contraction/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Length-Contraction/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[178], bt[178], br[178]-bl[178], bb[178]-bt[178], 10*sfac[178]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[178]=paper.setFinish(); 
t[178].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[179]=paper.text(nx[179],ny[179]-10,'Impulse and Change in Momentum').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[179]});
t[179].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Impulse/#Impulse and Change in Momentum", target: "_top",title:"Click to jump to concept"});
}); 
t[179].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[179].getBBox(); 
bt[179]=ny[179]-10-(tBox.height/2+10*sfac[179]);
bb[179]=ny[179]-10+(tBox.height/2+10*sfac[179]);
bl[179]=nx[179]-(tBox.width/2+10*sfac[179]);
br[179]=nx[179]+(tBox.width/2+10*sfac[179]);
var nwidth = br[179]-bl[179]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[179] = bl[179] - delta; 
    br[179] = br[179] + delta; 
} 
bb[179] = bb[179]+20; 
yicon = bb[179]-25; 
xicon2 = nx[179]+-40; 
xicon3 = nx[179]+-10; 
xicon4 = nx[179]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Impulse/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Impulse/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Impulse/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[179], bt[179], br[179]-bl[179], bb[179]-bt[179], 10*sfac[179]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[179]=paper.setFinish(); 
t[179].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[180]=paper.text(nx[180],ny[180]-10,'The Dopper Effect').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[180]});
t[180].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Doppler-Effect/#The Dopper Effect", target: "_top",title:"Click to jump to concept"});
}); 
t[180].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[180].getBBox(); 
bt[180]=ny[180]-10-(tBox.height/2+10*sfac[180]);
bb[180]=ny[180]-10+(tBox.height/2+10*sfac[180]);
bl[180]=nx[180]-(tBox.width/2+10*sfac[180]);
br[180]=nx[180]+(tBox.width/2+10*sfac[180]);
var nwidth = br[180]-bl[180]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[180] = bl[180] - delta; 
    br[180] = br[180] + delta; 
} 
bb[180] = bb[180]+20; 
yicon = bb[180]-25; 
xicon2 = nx[180]+-40; 
xicon3 = nx[180]+-10; 
xicon4 = nx[180]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Doppler-Effect/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Doppler-Effect/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Doppler-Effect/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[180], bt[180], br[180]-bl[180], bb[180]-bt[180], 10*sfac[180]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[180]=paper.setFinish(); 
t[180].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[181]=paper.text(nx[181],ny[181],'Vector Addition Graphical\nMethod').attr({fill:"#666666","font-size": 14*sfac[181]});
tBox=t[181].getBBox(); 
bt[181]=ny[181]-(tBox.height/2+10*sfac[181]);
bb[181]=ny[181]+(tBox.height/2+10*sfac[181]);
bl[181]=nx[181]-(tBox.width/2+10*sfac[181]);
br[181]=nx[181]+(tBox.width/2+10*sfac[181]);
paper.setStart(); 
rect=paper.rect(bl[181], bt[181], br[181]-bl[181], bb[181]-bt[181], 10*sfac[181]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[181]=paper.setFinish(); 

t[182]=paper.text(nx[182],ny[182]-10,'Sound').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[182]});
t[182].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Sound/#Sound", target: "_top",title:"Click to jump to concept"});
}); 
t[182].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[182].getBBox(); 
bt[182]=ny[182]-10-(tBox.height/2+10*sfac[182]);
bb[182]=ny[182]-10+(tBox.height/2+10*sfac[182]);
bl[182]=nx[182]-(tBox.width/2+10*sfac[182]);
br[182]=nx[182]+(tBox.width/2+10*sfac[182]);
var nwidth = br[182]-bl[182]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[182] = bl[182] - delta; 
    br[182] = br[182] + delta; 
} 
bb[182] = bb[182]+20; 
yicon = bb[182]-25; 
xicon2 = nx[182]+-40; 
xicon3 = nx[182]+-10; 
xicon4 = nx[182]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Sound/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Sound/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Sound/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[182], bt[182], br[182]-bl[182], bb[182]-bt[182], 10*sfac[182]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[182]=paper.setFinish(); 
t[182].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[183]=paper.text(nx[183],ny[183]-10,'Free Body Diagram Problems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[183]});
t[183].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Problem-Solving-1/#Free Body Diagram Problems", target: "_top",title:"Click to jump to concept"});
}); 
t[183].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[183].getBBox(); 
bt[183]=ny[183]-10-(tBox.height/2+10*sfac[183]);
bb[183]=ny[183]-10+(tBox.height/2+10*sfac[183]);
bl[183]=nx[183]-(tBox.width/2+10*sfac[183]);
br[183]=nx[183]+(tBox.width/2+10*sfac[183]);
var nwidth = br[183]-bl[183]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[183] = bl[183] - delta; 
    br[183] = br[183] + delta; 
} 
bb[183] = bb[183]+20; 
yicon = bb[183]-25; 
xicon2 = nx[183]+-40; 
xicon3 = nx[183]+-10; 
xicon4 = nx[183]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Problem-Solving-1/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Problem-Solving-1/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Problem-Solving-1/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[183], bt[183], br[183]-bl[183], bb[183]-bt[183], 10*sfac[183]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[183]=paper.setFinish(); 
t[183].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[184]=paper.text(nx[184],ny[184]-10,'Voltage Drop in Parallel Circuits').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[184]});
t[184].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Resistors-in-Parallel/#Voltage Drop in Parallel Circuits", target: "_top",title:"Click to jump to concept"});
}); 
t[184].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[184].getBBox(); 
bt[184]=ny[184]-10-(tBox.height/2+10*sfac[184]);
bb[184]=ny[184]-10+(tBox.height/2+10*sfac[184]);
bl[184]=nx[184]-(tBox.width/2+10*sfac[184]);
br[184]=nx[184]+(tBox.width/2+10*sfac[184]);
var nwidth = br[184]-bl[184]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[184] = bl[184] - delta; 
    br[184] = br[184] + delta; 
} 
bb[184] = bb[184]+20; 
yicon = bb[184]-25; 
xicon2 = nx[184]+-40; 
xicon3 = nx[184]+-10; 
xicon4 = nx[184]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Resistors-in-Parallel/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Resistors-in-Parallel/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Resistors-in-Parallel/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[184], bt[184], br[184]-bl[184], bb[184]-bt[184], 10*sfac[184]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[184]=paper.setFinish(); 
t[184].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[185]=paper.text(nx[185],ny[185]-10,'Projectile Motion').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[185]});
t[185].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Projectile-Motion-Concepts/#Projectile Motion", target: "_top",title:"Click to jump to concept"});
}); 
t[185].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[185].getBBox(); 
bt[185]=ny[185]-10-(tBox.height/2+10*sfac[185]);
bb[185]=ny[185]-10+(tBox.height/2+10*sfac[185]);
bl[185]=nx[185]-(tBox.width/2+10*sfac[185]);
br[185]=nx[185]+(tBox.width/2+10*sfac[185]);
var nwidth = br[185]-bl[185]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[185] = bl[185] - delta; 
    br[185] = br[185] + delta; 
} 
bb[185] = bb[185]+20; 
yicon = bb[185]-25; 
xicon2 = nx[185]+-40; 
xicon3 = nx[185]+-10; 
xicon4 = nx[185]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Projectile-Motion-Concepts/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Projectile-Motion-Concepts/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[185], bt[185], br[185]-bl[185], bb[185]-bt[185], 10*sfac[185]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[185]=paper.setFinish(); 
t[185].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[186]=paper.text(nx[186],ny[186]-10,'Kinematics of Rotation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[186]});
t[186].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Kinematics-of-Rotation/#Kinematics of Rotation", target: "_top",title:"Click to jump to concept"});
}); 
t[186].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[186].getBBox(); 
bt[186]=ny[186]-10-(tBox.height/2+10*sfac[186]);
bb[186]=ny[186]-10+(tBox.height/2+10*sfac[186]);
bl[186]=nx[186]-(tBox.width/2+10*sfac[186]);
br[186]=nx[186]+(tBox.width/2+10*sfac[186]);
var nwidth = br[186]-bl[186]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[186] = bl[186] - delta; 
    br[186] = br[186] + delta; 
} 
bb[186] = bb[186]+20; 
yicon = bb[186]-25; 
xicon2 = nx[186]+-40; 
xicon3 = nx[186]+-10; 
xicon4 = nx[186]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Kinematics-of-Rotation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Kinematics-of-Rotation/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[186], bt[186], br[186]-bl[186], bb[186]-bt[186], 10*sfac[186]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[186]=paper.setFinish(); 
t[186].toFront(); 
vidicon.toFront(); 
atticon.toFront(); 

t[187]=paper.text(nx[187],ny[187]-10,'Work Energy Theorem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[187]});
t[187].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Power-and-Efficiency/#Work Energy Theorem", target: "_top",title:"Click to jump to concept"});
}); 
t[187].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[187].getBBox(); 
bt[187]=ny[187]-10-(tBox.height/2+10*sfac[187]);
bb[187]=ny[187]-10+(tBox.height/2+10*sfac[187]);
bl[187]=nx[187]-(tBox.width/2+10*sfac[187]);
br[187]=nx[187]+(tBox.width/2+10*sfac[187]);
var nwidth = br[187]-bl[187]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[187] = bl[187] - delta; 
    br[187] = br[187] + delta; 
} 
bb[187] = bb[187]+20; 
yicon = bb[187]-25; 
xicon2 = nx[187]+-40; 
xicon3 = nx[187]+-10; 
xicon4 = nx[187]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Power-and-Efficiency/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Power-and-Efficiency/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[187], bt[187], br[187]-bl[187], bb[187]-bt[187], 10*sfac[187]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[187]=paper.setFinish(); 
t[187].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[188]=paper.text(nx[188],ny[188]-10,'Instantaneous Speed\nand Velocity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[188]});
t[188].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Relative-Velocity/#Instantaneous Speed and Velocity", target: "_top",title:"Click to jump to concept"});
}); 
t[188].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[188].getBBox(); 
bt[188]=ny[188]-10-(tBox.height/2+10*sfac[188]);
bb[188]=ny[188]-10+(tBox.height/2+10*sfac[188]);
bl[188]=nx[188]-(tBox.width/2+10*sfac[188]);
br[188]=nx[188]+(tBox.width/2+10*sfac[188]);
var nwidth = br[188]-bl[188]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[188] = bl[188] - delta; 
    br[188] = br[188] + delta; 
} 
bb[188] = bb[188]+20; 
yicon = bb[188]-25; 
xicon2 = nx[188]+-40; 
xicon3 = nx[188]+-10; 
xicon4 = nx[188]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Relative-Velocity/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Relative-Velocity/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[188], bt[188], br[188]-bl[188], bb[188]-bt[188], 10*sfac[188]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[188]=paper.setFinish(); 
t[188].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[189]=paper.text(nx[189],ny[189]-10,'Motion in a Straight Line').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[189]});
t[189].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Using-the-kinematic-Equations/#Motion in a Straight Line", target: "_top",title:"Click to jump to concept"});
}); 
t[189].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[189].getBBox(); 
bt[189]=ny[189]-10-(tBox.height/2+10*sfac[189]);
bb[189]=ny[189]-10+(tBox.height/2+10*sfac[189]);
bl[189]=nx[189]-(tBox.width/2+10*sfac[189]);
br[189]=nx[189]+(tBox.width/2+10*sfac[189]);
var nwidth = br[189]-bl[189]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[189] = bl[189] - delta; 
    br[189] = br[189] + delta; 
} 
bb[189] = bb[189]+20; 
yicon = bb[189]-25; 
xicon2 = nx[189]+-40; 
xicon3 = nx[189]+-10; 
xicon4 = nx[189]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Using-the-kinematic-Equations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Using-the-kinematic-Equations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Using-the-kinematic-Equations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[189], bt[189], br[189]-bl[189], bb[189]-bt[189], 10*sfac[189]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[189]=paper.setFinish(); 
t[189].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[190]=paper.text(nx[190],ny[190],'Wave Characteristics').attr({fill:"#666666","font-size": 14*sfac[190]});
tBox=t[190].getBBox(); 
bt[190]=ny[190]-(tBox.height/2+10*sfac[190]);
bb[190]=ny[190]+(tBox.height/2+10*sfac[190]);
bl[190]=nx[190]-(tBox.width/2+10*sfac[190]);
br[190]=nx[190]+(tBox.width/2+10*sfac[190]);
paper.setStart(); 
rect=paper.rect(bl[190], bt[190], br[190]-bl[190], bb[190]-bt[190], 10*sfac[190]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[190]=paper.setFinish(); 

t[191]=paper.text(nx[191],ny[191]-10,'Work and the Electric Field').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[191]});
t[191].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Voltage/#Work and the Electric Field", target: "_top",title:"Click to jump to concept"});
}); 
t[191].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[191].getBBox(); 
bt[191]=ny[191]-10-(tBox.height/2+10*sfac[191]);
bb[191]=ny[191]-10+(tBox.height/2+10*sfac[191]);
bl[191]=nx[191]-(tBox.width/2+10*sfac[191]);
br[191]=nx[191]+(tBox.width/2+10*sfac[191]);
var nwidth = br[191]-bl[191]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[191] = bl[191] - delta; 
    br[191] = br[191] + delta; 
} 
bb[191] = bb[191]+20; 
yicon = bb[191]-25; 
xicon2 = nx[191]+-40; 
xicon3 = nx[191]+-10; 
xicon4 = nx[191]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Voltage/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Voltage/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[191], bt[191], br[191]-bl[191], bb[191]-bt[191], 10*sfac[191]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[191]=paper.setFinish(); 
t[191].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[192]=paper.text(nx[192],ny[192],'Index of Refraction and the\nSpeed of Light').attr({fill:"#666666","font-size": 14*sfac[192]});
tBox=t[192].getBBox(); 
bt[192]=ny[192]-(tBox.height/2+10*sfac[192]);
bb[192]=ny[192]+(tBox.height/2+10*sfac[192]);
bl[192]=nx[192]-(tBox.width/2+10*sfac[192]);
br[192]=nx[192]+(tBox.width/2+10*sfac[192]);
paper.setStart(); 
rect=paper.rect(bl[192], bt[192], br[192]-bl[192], bb[192]-bt[192], 10*sfac[192]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[192]=paper.setFinish(); 

t[193]=paper.text(nx[193],ny[193]-10,'Simple Machines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[193]});
t[193].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mechanical-Advantage/#Simple Machines", target: "_top",title:"Click to jump to concept"});
}); 
t[193].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[193].getBBox(); 
bt[193]=ny[193]-10-(tBox.height/2+10*sfac[193]);
bb[193]=ny[193]-10+(tBox.height/2+10*sfac[193]);
bl[193]=nx[193]-(tBox.width/2+10*sfac[193]);
br[193]=nx[193]+(tBox.width/2+10*sfac[193]);
var nwidth = br[193]-bl[193]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[193] = bl[193] - delta; 
    br[193] = br[193] + delta; 
} 
bb[193] = bb[193]+20; 
yicon = bb[193]-25; 
xicon2 = nx[193]+-40; 
xicon3 = nx[193]+-10; 
xicon4 = nx[193]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mechanical-Advantage/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mechanical-Advantage/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[193], bt[193], br[193]-bl[193], bb[193]-bt[193], 10*sfac[193]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[193]=paper.setFinish(); 
t[193].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[194]=paper.text(nx[194],ny[194]-10,'Springs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[194]});
t[194].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Springs/#Springs", target: "_top",title:"Click to jump to concept"});
}); 
t[194].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[194].getBBox(); 
bt[194]=ny[194]-10-(tBox.height/2+10*sfac[194]);
bb[194]=ny[194]-10+(tBox.height/2+10*sfac[194]);
bl[194]=nx[194]-(tBox.width/2+10*sfac[194]);
br[194]=nx[194]+(tBox.width/2+10*sfac[194]);
var nwidth = br[194]-bl[194]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[194] = bl[194] - delta; 
    br[194] = br[194] + delta; 
} 
bb[194] = bb[194]+20; 
yicon = bb[194]-25; 
xicon2 = nx[194]+-40; 
xicon3 = nx[194]+-10; 
xicon4 = nx[194]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Springs/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Springs/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Springs/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[194], bt[194], br[194]-bl[194], bb[194]-bt[194], 10*sfac[194]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[194]=paper.setFinish(); 
t[194].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[195]=paper.text(nx[195],ny[195],'The Nucleus').attr({fill:"#666666","font-size": 14*sfac[195]});
tBox=t[195].getBBox(); 
bt[195]=ny[195]-(tBox.height/2+10*sfac[195]);
bb[195]=ny[195]+(tBox.height/2+10*sfac[195]);
bl[195]=nx[195]-(tBox.width/2+10*sfac[195]);
br[195]=nx[195]+(tBox.width/2+10*sfac[195]);
paper.setStart(); 
rect=paper.rect(bl[195], bt[195], br[195]-bl[195], bb[195]-bt[195], 10*sfac[195]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[195]=paper.setFinish(); 

t[196]=paper.text(nx[196],ny[196],'Position-Time Graph for\nConstant Velocity').attr({fill:"#666666","font-size": 14*sfac[196]});
tBox=t[196].getBBox(); 
bt[196]=ny[196]-(tBox.height/2+10*sfac[196]);
bb[196]=ny[196]+(tBox.height/2+10*sfac[196]);
bl[196]=nx[196]-(tBox.width/2+10*sfac[196]);
br[196]=nx[196]+(tBox.width/2+10*sfac[196]);
paper.setStart(); 
rect=paper.rect(bl[196], bt[196], br[196]-bl[196], bb[196]-bt[196], 10*sfac[196]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[196]=paper.setFinish(); 

t[197]=paper.text(nx[197],ny[197]-10,'Pressure').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[197]});
t[197].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Pressure-in-Fluids/#Pressure", target: "_top",title:"Click to jump to concept"});
}); 
t[197].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[197].getBBox(); 
bt[197]=ny[197]-10-(tBox.height/2+10*sfac[197]);
bb[197]=ny[197]-10+(tBox.height/2+10*sfac[197]);
bl[197]=nx[197]-(tBox.width/2+10*sfac[197]);
br[197]=nx[197]+(tBox.width/2+10*sfac[197]);
var nwidth = br[197]-bl[197]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[197] = bl[197] - delta; 
    br[197] = br[197] + delta; 
} 
bb[197] = bb[197]+20; 
yicon = bb[197]-25; 
xicon2 = nx[197]+-40; 
xicon3 = nx[197]+-10; 
xicon4 = nx[197]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Pressure-in-Fluids/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Pressure-in-Fluids/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Pressure-in-Fluids/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[197], bt[197], br[197]-bl[197], bb[197]-bt[197], 10*sfac[197]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[197]=paper.setFinish(); 
t[197].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[198]=paper.text(nx[198],ny[198],'Mass vs Weight').attr({fill:"#666666","font-size": 14*sfac[198]});
tBox=t[198].getBBox(); 
bt[198]=ny[198]-(tBox.height/2+10*sfac[198]);
bb[198]=ny[198]+(tBox.height/2+10*sfac[198]);
bl[198]=nx[198]-(tBox.width/2+10*sfac[198]);
br[198]=nx[198]+(tBox.width/2+10*sfac[198]);
paper.setStart(); 
rect=paper.rect(bl[198], bt[198], br[198]-bl[198], bb[198]-bt[198], 10*sfac[198]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[198]=paper.setFinish(); 

t[199]=paper.text(nx[199],ny[199],"Kepler's Laws of Planetary\nMotion").attr({fill:"#666666","font-size": 14*sfac[199]});
tBox=t[199].getBBox(); 
bt[199]=ny[199]-(tBox.height/2+10*sfac[199]);
bb[199]=ny[199]+(tBox.height/2+10*sfac[199]);
bl[199]=nx[199]-(tBox.width/2+10*sfac[199]);
br[199]=nx[199]+(tBox.width/2+10*sfac[199]);
paper.setStart(); 
rect=paper.rect(bl[199], bt[199], br[199]-bl[199], bb[199]-bt[199], 10*sfac[199]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[199]=paper.setFinish(); 

t[200]=paper.text(nx[200],ny[200]-10,'Net Force and Acceleration').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[200]});
t[200].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Free-Body-Diagrams/#Net Force and Acceleration", target: "_top",title:"Click to jump to concept"});
}); 
t[200].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[200].getBBox(); 
bt[200]=ny[200]-10-(tBox.height/2+10*sfac[200]);
bb[200]=ny[200]-10+(tBox.height/2+10*sfac[200]);
bl[200]=nx[200]-(tBox.width/2+10*sfac[200]);
br[200]=nx[200]+(tBox.width/2+10*sfac[200]);
var nwidth = br[200]-bl[200]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[200] = bl[200] - delta; 
    br[200] = br[200] + delta; 
} 
bb[200] = bb[200]+20; 
yicon = bb[200]-25; 
xicon2 = nx[200]+-40; 
xicon3 = nx[200]+-10; 
xicon4 = nx[200]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Free-Body-Diagrams/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Free-Body-Diagrams/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Free-Body-Diagrams/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[200], bt[200], br[200]-bl[200], bb[200]-bt[200], 10*sfac[200]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[200]=paper.setFinish(); 
t[200].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[201]=paper.text(nx[201],ny[201],"Feynman's Diagrams").attr({fill:"#666666","font-size": 14*sfac[201]});
tBox=t[201].getBBox(); 
bt[201]=ny[201]-(tBox.height/2+10*sfac[201]);
bb[201]=ny[201]+(tBox.height/2+10*sfac[201]);
bl[201]=nx[201]-(tBox.width/2+10*sfac[201]);
br[201]=nx[201]+(tBox.width/2+10*sfac[201]);
paper.setStart(); 
rect=paper.rect(bl[201], bt[201], br[201]-bl[201], bb[201]-bt[201], 10*sfac[201]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[201]=paper.setFinish(); 

t[202]=paper.text(nx[202],ny[202],'Motion in Two Dimensions').attr({fill:"#666666","font-size": 14*sfac[202]});
tBox=t[202].getBBox(); 
bt[202]=ny[202]-(tBox.height/2+10*sfac[202]);
bb[202]=ny[202]+(tBox.height/2+10*sfac[202]);
bl[202]=nx[202]-(tBox.width/2+10*sfac[202]);
br[202]=nx[202]+(tBox.width/2+10*sfac[202]);
paper.setStart(); 
rect=paper.rect(bl[202], bt[202], br[202]-bl[202], bb[202]-bt[202], 10*sfac[202]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[202]=paper.setFinish(); 

t[203]=paper.text(nx[203],ny[203]-10,'Forces').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[203]});
t[203].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Pressure-and-Force/#Forces", target: "_top",title:"Click to jump to concept"});
}); 
t[203].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[203].getBBox(); 
bt[203]=ny[203]-10-(tBox.height/2+10*sfac[203]);
bb[203]=ny[203]-10+(tBox.height/2+10*sfac[203]);
bl[203]=nx[203]-(tBox.width/2+10*sfac[203]);
br[203]=nx[203]+(tBox.width/2+10*sfac[203]);
var nwidth = br[203]-bl[203]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[203] = bl[203] - delta; 
    br[203] = br[203] + delta; 
} 
bb[203] = bb[203]+20; 
yicon = bb[203]-25; 
xicon2 = nx[203]+-40; 
xicon3 = nx[203]+-10; 
xicon4 = nx[203]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Pressure-and-Force/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Pressure-and-Force/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Pressure-and-Force/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[203], bt[203], br[203]-bl[203], bb[203]-bt[203], 10*sfac[203]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[203]=paper.setFinish(); 
t[203].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[204]=paper.text(nx[204],ny[204]-10,'The Force of Friction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[204]});
t[204].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Friction/#The Force of Friction", target: "_top",title:"Click to jump to concept"});
}); 
t[204].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[204].getBBox(); 
bt[204]=ny[204]-10-(tBox.height/2+10*sfac[204]);
bb[204]=ny[204]-10+(tBox.height/2+10*sfac[204]);
bl[204]=nx[204]-(tBox.width/2+10*sfac[204]);
br[204]=nx[204]+(tBox.width/2+10*sfac[204]);
var nwidth = br[204]-bl[204]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[204] = bl[204] - delta; 
    br[204] = br[204] + delta; 
} 
bb[204] = bb[204]+20; 
yicon = bb[204]-25; 
xicon2 = nx[204]+-40; 
xicon3 = nx[204]+-10; 
xicon4 = nx[204]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Friction/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Friction/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Friction/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[204], bt[204], br[204]-bl[204], bb[204]-bt[204], 10*sfac[204]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[204]=paper.setFinish(); 
t[204].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[205]=paper.text(nx[205],ny[205]-10,'Projectile Motion Problem Solving').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[205]});
t[205].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Projectile-Motion-Problem-Solving/#Projectile Motion Problem Solving", target: "_top",title:"Click to jump to concept"});
}); 
t[205].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[205].getBBox(); 
bt[205]=ny[205]-10-(tBox.height/2+10*sfac[205]);
bb[205]=ny[205]-10+(tBox.height/2+10*sfac[205]);
bl[205]=nx[205]-(tBox.width/2+10*sfac[205]);
br[205]=nx[205]+(tBox.width/2+10*sfac[205]);
var nwidth = br[205]-bl[205]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[205] = bl[205] - delta; 
    br[205] = br[205] + delta; 
} 
bb[205] = bb[205]+20; 
yicon = bb[205]-25; 
xicon2 = nx[205]+-40; 
xicon3 = nx[205]+-10; 
xicon4 = nx[205]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Projectile-Motion-Problem-Solving/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Projectile-Motion-Problem-Solving/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Projectile-Motion-Problem-Solving/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[205], bt[205], br[205]-bl[205], bb[205]-bt[205], 10*sfac[205]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[205]=paper.setFinish(); 
t[205].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[206]=paper.text(nx[206],ny[206],'Electric Field Intensity').attr({fill:"#666666","font-size": 14*sfac[206]});
tBox=t[206].getBBox(); 
bt[206]=ny[206]-(tBox.height/2+10*sfac[206]);
bb[206]=ny[206]+(tBox.height/2+10*sfac[206]);
bl[206]=nx[206]-(tBox.width/2+10*sfac[206]);
br[206]=nx[206]+(tBox.width/2+10*sfac[206]);
paper.setStart(); 
rect=paper.rect(bl[206], bt[206], br[206]-bl[206], bb[206]-bt[206], 10*sfac[206]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[206]=paper.setFinish(); 

t[207]=paper.text(nx[207],ny[207],'Diffuse and Regular Reflection').attr({fill:"#666666","font-size": 14*sfac[207]});
tBox=t[207].getBBox(); 
bt[207]=ny[207]-(tBox.height/2+10*sfac[207]);
bb[207]=ny[207]+(tBox.height/2+10*sfac[207]);
bl[207]=nx[207]-(tBox.width/2+10*sfac[207]);
br[207]=nx[207]+(tBox.width/2+10*sfac[207]);
paper.setStart(); 
rect=paper.rect(bl[207], bt[207], br[207]-bl[207], bb[207]-bt[207], 10*sfac[207]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[207]=paper.setFinish(); 

t[208]=paper.text(nx[208],ny[208],'Vector and Scalar\nQuantities').attr({fill:"#666666","font-size": 14*sfac[208]});
tBox=t[208].getBBox(); 
bt[208]=ny[208]-(tBox.height/2+10*sfac[208]);
bb[208]=ny[208]+(tBox.height/2+10*sfac[208]);
bl[208]=nx[208]-(tBox.width/2+10*sfac[208]);
br[208]=nx[208]+(tBox.width/2+10*sfac[208]);
paper.setStart(); 
rect=paper.rect(bl[208], bt[208], br[208]-bl[208], bb[208]-bt[208], 10*sfac[208]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[208]=paper.setFinish(); 

t[209]=paper.text(nx[209],ny[209]-10,'Vector Addition Math').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[209]});
t[209].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Vectors/#Vector Addition Math", target: "_top",title:"Click to jump to concept"});
}); 
t[209].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[209].getBBox(); 
bt[209]=ny[209]-10-(tBox.height/2+10*sfac[209]);
bb[209]=ny[209]-10+(tBox.height/2+10*sfac[209]);
bl[209]=nx[209]-(tBox.width/2+10*sfac[209]);
br[209]=nx[209]+(tBox.width/2+10*sfac[209]);
var nwidth = br[209]-bl[209]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[209] = bl[209] - delta; 
    br[209] = br[209] + delta; 
} 
bb[209] = bb[209]+20; 
yicon = bb[209]-25; 
xicon2 = nx[209]+-40; 
xicon3 = nx[209]+-10; 
xicon4 = nx[209]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Vectors/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Vectors/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[209], bt[209], br[209]-bl[209], bb[209]-bt[209], 10*sfac[209]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[209]=paper.setFinish(); 
t[209].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[210]=paper.text(nx[210],ny[210],'Photoelectric Effect').attr({fill:"#666666","font-size": 14*sfac[210]});
tBox=t[210].getBBox(); 
bt[210]=ny[210]-(tBox.height/2+10*sfac[210]);
bb[210]=ny[210]+(tBox.height/2+10*sfac[210]);
bl[210]=nx[210]-(tBox.width/2+10*sfac[210]);
br[210]=nx[210]+(tBox.width/2+10*sfac[210]);
paper.setStart(); 
rect=paper.rect(bl[210], bt[210], br[210]-bl[210], bb[210]-bt[210], 10*sfac[210]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[210]=paper.setFinish(); 

t[211]=paper.text(nx[211],ny[211]-10,'Graphical Analysis of Straight\nLine Motion').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[211]});
t[211].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphing-Motion/#Graphical Analysis of Straight Line Motion", target: "_top",title:"Click to jump to concept"});
}); 
t[211].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[211].getBBox(); 
bt[211]=ny[211]-10-(tBox.height/2+10*sfac[211]);
bb[211]=ny[211]-10+(tBox.height/2+10*sfac[211]);
bl[211]=nx[211]-(tBox.width/2+10*sfac[211]);
br[211]=nx[211]+(tBox.width/2+10*sfac[211]);
var nwidth = br[211]-bl[211]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[211] = bl[211] - delta; 
    br[211] = br[211] + delta; 
} 
bb[211] = bb[211]+20; 
yicon = bb[211]-25; 
xicon2 = nx[211]+-40; 
xicon3 = nx[211]+-10; 
xicon4 = nx[211]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphing-Motion/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphing-Motion/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphing-Motion/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[211], bt[211], br[211]-bl[211], bb[211]-bt[211], 10*sfac[211]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[211]=paper.setFinish(); 
t[211].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[212]=paper.text(nx[212],ny[212],'Wave Amplitude').attr({fill:"#666666","font-size": 14*sfac[212]});
tBox=t[212].getBBox(); 
bt[212]=ny[212]-(tBox.height/2+10*sfac[212]);
bb[212]=ny[212]+(tBox.height/2+10*sfac[212]);
bl[212]=nx[212]-(tBox.width/2+10*sfac[212]);
br[212]=nx[212]+(tBox.width/2+10*sfac[212]);
paper.setStart(); 
rect=paper.rect(bl[212], bt[212], br[212]-bl[212], bb[212]-bt[212], 10*sfac[212]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[212]=paper.setFinish(); 

t[213]=paper.text(nx[213],ny[213]-10,'Storing Charges').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[213]});
t[213].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Capacitors/#Storing Charges", target: "_top",title:"Click to jump to concept"});
}); 
t[213].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[213].getBBox(); 
bt[213]=ny[213]-10-(tBox.height/2+10*sfac[213]);
bb[213]=ny[213]-10+(tBox.height/2+10*sfac[213]);
bl[213]=nx[213]-(tBox.width/2+10*sfac[213]);
br[213]=nx[213]+(tBox.width/2+10*sfac[213]);
var nwidth = br[213]-bl[213]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[213] = bl[213] - delta; 
    br[213] = br[213] + delta; 
} 
bb[213] = bb[213]+20; 
yicon = bb[213]-25; 
xicon2 = nx[213]+-40; 
xicon3 = nx[213]+-10; 
xicon4 = nx[213]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Capacitors/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Capacitors/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[213], bt[213], br[213]-bl[213], bb[213]-bt[213], 10*sfac[213]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[213]=paper.setFinish(); 
t[213].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[214]=paper.text(nx[214],ny[214],"Millikan's Oil Drop Experiment").attr({fill:"#666666","font-size": 14*sfac[214]});
tBox=t[214].getBBox(); 
bt[214]=ny[214]-(tBox.height/2+10*sfac[214]);
bb[214]=ny[214]+(tBox.height/2+10*sfac[214]);
bl[214]=nx[214]-(tBox.width/2+10*sfac[214]);
br[214]=nx[214]+(tBox.width/2+10*sfac[214]);
paper.setStart(); 
rect=paper.rect(bl[214], bt[214], br[214]-bl[214], bb[214]-bt[214], 10*sfac[214]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[214]=paper.setFinish(); 

t[215]=paper.text(nx[215],ny[215],'Acceleration as the derivative\nof Velocity').attr({fill:"#666666","font-size": 14*sfac[215]});
tBox=t[215].getBBox(); 
bt[215]=ny[215]-(tBox.height/2+10*sfac[215]);
bb[215]=ny[215]+(tBox.height/2+10*sfac[215]);
bl[215]=nx[215]-(tBox.width/2+10*sfac[215]);
br[215]=nx[215]+(tBox.width/2+10*sfac[215]);
paper.setStart(); 
rect=paper.rect(bl[215], bt[215], br[215]-bl[215], bb[215]-bt[215], 10*sfac[215]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[215]=paper.setFinish(); 

t[216]=paper.text(nx[216],ny[216]-10,'Average Speed and Velocity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[216]});
t[216].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Average-Velocity/#Average Speed and Velocity", target: "_top",title:"Click to jump to concept"});
}); 
t[216].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[216].getBBox(); 
bt[216]=ny[216]-10-(tBox.height/2+10*sfac[216]);
bb[216]=ny[216]-10+(tBox.height/2+10*sfac[216]);
bl[216]=nx[216]-(tBox.width/2+10*sfac[216]);
br[216]=nx[216]+(tBox.width/2+10*sfac[216]);
var nwidth = br[216]-bl[216]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[216] = bl[216] - delta; 
    br[216] = br[216] + delta; 
} 
bb[216] = bb[216]+20; 
yicon = bb[216]-25; 
xicon2 = nx[216]+-40; 
xicon3 = nx[216]+-10; 
xicon4 = nx[216]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Average-Velocity/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Average-Velocity/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Average-Velocity/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[216], bt[216], br[216]-bl[216], bb[216]-bt[216], 10*sfac[216]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[216]=paper.setFinish(); 
t[216].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[217]=paper.text(nx[217],ny[217]-10,"Newton's Third Law of Motion").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[217]});
t[217].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Newtons-Third-Law/#Newton's Third Law of Motion", target: "_top",title:"Click to jump to concept"});
}); 
t[217].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[217].getBBox(); 
bt[217]=ny[217]-10-(tBox.height/2+10*sfac[217]);
bb[217]=ny[217]-10+(tBox.height/2+10*sfac[217]);
bl[217]=nx[217]-(tBox.width/2+10*sfac[217]);
br[217]=nx[217]+(tBox.width/2+10*sfac[217]);
var nwidth = br[217]-bl[217]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[217] = bl[217] - delta; 
    br[217] = br[217] + delta; 
} 
bb[217] = bb[217]+20; 
yicon = bb[217]-25; 
xicon2 = nx[217]+-40; 
xicon3 = nx[217]+-10; 
xicon4 = nx[217]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Newtons-Third-Law/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Newtons-Third-Law/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Newtons-Third-Law/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[217], bt[217], br[217]-bl[217], bb[217]-bt[217], 10*sfac[217]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[217]=paper.setFinish(); 
t[217].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[218]=paper.text(nx[218],ny[218]-10,'Carbon Dating').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[218]});
t[218].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Carbon-Dating/#Carbon Dating", target: "_top",title:"Click to jump to concept"});
}); 
t[218].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[218].getBBox(); 
bt[218]=ny[218]-10-(tBox.height/2+10*sfac[218]);
bb[218]=ny[218]-10+(tBox.height/2+10*sfac[218]);
bl[218]=nx[218]-(tBox.width/2+10*sfac[218]);
br[218]=nx[218]+(tBox.width/2+10*sfac[218]);
var nwidth = br[218]-bl[218]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[218] = bl[218] - delta; 
    br[218] = br[218] + delta; 
} 
bb[218] = bb[218]+20; 
yicon = bb[218]-25; 
xicon2 = nx[218]+-40; 
xicon3 = nx[218]+-10; 
xicon4 = nx[218]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Carbon-Dating/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Carbon-Dating/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[218], bt[218], br[218]-bl[218], bb[218]-bt[218], 10*sfac[218]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[218]=paper.setFinish(); 
t[218].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[219]=paper.text(nx[219],ny[219]-10,'Electric Currents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[219]});
t[219].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Voltage-and-Current/#Electric Currents", target: "_top",title:"Click to jump to concept"});
}); 
t[219].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[219].getBBox(); 
bt[219]=ny[219]-10-(tBox.height/2+10*sfac[219]);
bb[219]=ny[219]-10+(tBox.height/2+10*sfac[219]);
bl[219]=nx[219]-(tBox.width/2+10*sfac[219]);
br[219]=nx[219]+(tBox.width/2+10*sfac[219]);
var nwidth = br[219]-bl[219]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[219] = bl[219] - delta; 
    br[219] = br[219] + delta; 
} 
bb[219] = bb[219]+20; 
yicon = bb[219]-25; 
xicon2 = nx[219]+-40; 
xicon3 = nx[219]+-10; 
xicon4 = nx[219]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Voltage-and-Current/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Voltage-and-Current/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Voltage-and-Current/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[219], bt[219], br[219]-bl[219], bb[219]-bt[219], 10*sfac[219]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[219]=paper.setFinish(); 
t[219].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[220]=paper.text(nx[220],ny[220],"Einstein's Concept of Gravity").attr({fill:"#666666","font-size": 14*sfac[220]});
tBox=t[220].getBBox(); 
bt[220]=ny[220]-(tBox.height/2+10*sfac[220]);
bb[220]=ny[220]+(tBox.height/2+10*sfac[220]);
bl[220]=nx[220]-(tBox.width/2+10*sfac[220]);
br[220]=nx[220]+(tBox.width/2+10*sfac[220]);
paper.setStart(); 
rect=paper.rect(bl[220], bt[220], br[220]-bl[220], bb[220]-bt[220], 10*sfac[220]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[220]=paper.setFinish(); 

t[221]=paper.text(nx[221],ny[221],'Acceleration').attr({fill:"#666666","font-size": 14*sfac[221]});
tBox=t[221].getBBox(); 
bt[221]=ny[221]-(tBox.height/2+10*sfac[221]);
bb[221]=ny[221]+(tBox.height/2+10*sfac[221]);
bl[221]=nx[221]-(tBox.width/2+10*sfac[221]);
br[221]=nx[221]+(tBox.width/2+10*sfac[221]);
paper.setStart(); 
rect=paper.rect(bl[221], bt[221], br[221]-bl[221], bb[221]-bt[221], 10*sfac[221]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[221]=paper.setFinish(); 

t[222]=paper.text(nx[222],ny[222],'Electric Motors').attr({fill:"#666666","font-size": 14*sfac[222]});
tBox=t[222].getBBox(); 
bt[222]=ny[222]-(tBox.height/2+10*sfac[222]);
bb[222]=ny[222]+(tBox.height/2+10*sfac[222]);
bl[222]=nx[222]-(tBox.width/2+10*sfac[222]);
br[222]=nx[222]+(tBox.width/2+10*sfac[222]);
paper.setStart(); 
rect=paper.rect(bl[222], bt[222], br[222]-bl[222], bb[222]-bt[222], 10*sfac[222]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[222]=paper.setFinish(); 

t[223]=paper.text(nx[223],ny[223],'Units of Force').attr({fill:"#666666","font-size": 14*sfac[223]});
tBox=t[223].getBBox(); 
bt[223]=ny[223]-(tBox.height/2+10*sfac[223]);
bb[223]=ny[223]+(tBox.height/2+10*sfac[223]);
bl[223]=nx[223]-(tBox.width/2+10*sfac[223]);
br[223]=nx[223]+(tBox.width/2+10*sfac[223]);
paper.setStart(); 
rect=paper.rect(bl[223], bt[223], br[223]-bl[223], bb[223]-bt[223], 10*sfac[223]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[223]=paper.setFinish(); 

t[224]=paper.text(nx[224],ny[224],'The Kilowatt-Hour').attr({fill:"#666666","font-size": 14*sfac[224]});
tBox=t[224].getBBox(); 
bt[224]=ny[224]-(tBox.height/2+10*sfac[224]);
bb[224]=ny[224]+(tBox.height/2+10*sfac[224]);
bl[224]=nx[224]-(tBox.width/2+10*sfac[224]);
br[224]=nx[224]+(tBox.width/2+10*sfac[224]);
paper.setStart(); 
rect=paper.rect(bl[224], bt[224], br[224]-bl[224], bb[224]-bt[224], 10*sfac[224]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[224]=paper.setFinish(); 

t[225]=paper.text(nx[225],ny[225],'Perpendicular Components\nof Vectors').attr({fill:"#666666","font-size": 14*sfac[225]});
tBox=t[225].getBBox(); 
bt[225]=ny[225]-(tBox.height/2+10*sfac[225]);
bb[225]=ny[225]+(tBox.height/2+10*sfac[225]);
bl[225]=nx[225]-(tBox.width/2+10*sfac[225]);
br[225]=nx[225]+(tBox.width/2+10*sfac[225]);
paper.setStart(); 
rect=paper.rect(bl[225], bt[225], br[225]-bl[225], bb[225]-bt[225], 10*sfac[225]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[225]=paper.setFinish(); 

t[226]=paper.text(nx[226],ny[226],'Solids').attr({fill:"#666666","font-size": 14*sfac[226]});
tBox=t[226].getBBox(); 
bt[226]=ny[226]-(tBox.height/2+10*sfac[226]);
bb[226]=ny[226]+(tBox.height/2+10*sfac[226]);
bl[226]=nx[226]-(tBox.width/2+10*sfac[226]);
br[226]=nx[226]+(tBox.width/2+10*sfac[226]);
paper.setStart(); 
rect=paper.rect(bl[226], bt[226], br[226]-bl[226], bb[226]-bt[226], 10*sfac[226]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[226]=paper.setFinish(); 

t[227]=paper.text(nx[227],ny[227],'The Quantum Mechanical Model').attr({fill:"#666666","font-size": 14*sfac[227]});
tBox=t[227].getBBox(); 
bt[227]=ny[227]-(tBox.height/2+10*sfac[227]);
bb[227]=ny[227]+(tBox.height/2+10*sfac[227]);
bl[227]=nx[227]-(tBox.width/2+10*sfac[227]);
br[227]=nx[227]+(tBox.width/2+10*sfac[227]);
paper.setStart(); 
rect=paper.rect(bl[227], bt[227], br[227]-bl[227], bb[227]-bt[227], 10*sfac[227]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[227]=paper.setFinish(); 

bb[228]= ny[228]; 
bt[228]= ny[228]; 
bl[228]= nx[228]; 
br[228]= nx[228]; 

bb[229]= ny[229]; 
bt[229]= ny[229]; 
bl[229]= nx[229]; 
br[229]= nx[229]; 

bb[230]= ny[230]; 
bt[230]= ny[230]; 
bl[230]= nx[230]; 
br[230]= nx[230]; 

bb[231]= ny[231]; 
bt[231]= ny[231]; 
bl[231]= nx[231]; 
br[231]= nx[231]; 

bb[232]= ny[232]; 
bt[232]= ny[232]; 
bl[232]= nx[232]; 
br[232]= nx[232]; 

bb[233]= ny[233]; 
bt[233]= ny[233]; 
bl[233]= nx[233]; 
br[233]= nx[233]; 

bb[234]= ny[234]; 
bt[234]= ny[234]; 
bl[234]= nx[234]; 
br[234]= nx[234]; 

bb[235]= ny[235]; 
bt[235]= ny[235]; 
bl[235]= nx[235]; 
br[235]= nx[235]; 

bb[236]= ny[236]; 
bt[236]= ny[236]; 
bl[236]= nx[236]; 
br[236]= nx[236]; 

bb[237]= ny[237]; 
bt[237]= ny[237]; 
bl[237]= nx[237]; 
br[237]= nx[237]; 

bb[238]= ny[238]; 
bt[238]= ny[238]; 
bl[238]= nx[238]; 
br[238]= nx[238]; 

bb[239]= ny[239]; 
bt[239]= ny[239]; 
bl[239]= nx[239]; 
br[239]= nx[239]; 

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
b[133].click(function() {recenter(133);}); 
b[134].click(function() {recenter(134);}); 
b[135].click(function() {recenter(135);}); 
b[136].click(function() {recenter(136);}); 
b[137].click(function() {recenter(137);}); 
b[138].click(function() {recenter(138);}); 
b[139].click(function() {recenter(139);}); 
b[140].click(function() {recenter(140);}); 
b[141].click(function() {recenter(141);}); 
b[142].click(function() {recenter(142);}); 
b[143].click(function() {recenter(143);}); 
b[144].click(function() {recenter(144);}); 
b[145].click(function() {recenter(145);}); 
b[146].click(function() {recenter(146);}); 
b[147].click(function() {recenter(147);}); 
b[148].click(function() {recenter(148);}); 
b[149].click(function() {recenter(149);}); 
b[150].click(function() {recenter(150);}); 
b[151].click(function() {recenter(151);}); 
b[152].click(function() {recenter(152);}); 
b[153].click(function() {recenter(153);}); 
b[154].click(function() {recenter(154);}); 
b[155].click(function() {recenter(155);}); 
b[156].click(function() {recenter(156);}); 
b[157].click(function() {recenter(157);}); 
b[158].click(function() {recenter(158);}); 
b[159].click(function() {recenter(159);}); 
b[160].click(function() {recenter(160);}); 
b[161].click(function() {recenter(161);}); 
b[162].click(function() {recenter(162);}); 
b[163].click(function() {recenter(163);}); 
b[164].click(function() {recenter(164);}); 
b[165].click(function() {recenter(165);}); 
b[166].click(function() {recenter(166);}); 
b[167].click(function() {recenter(167);}); 
b[168].click(function() {recenter(168);}); 
b[169].click(function() {recenter(169);}); 
b[170].click(function() {recenter(170);}); 
b[171].click(function() {recenter(171);}); 
b[172].click(function() {recenter(172);}); 
b[173].click(function() {recenter(173);}); 
b[174].click(function() {recenter(174);}); 
b[175].click(function() {recenter(175);}); 
b[176].click(function() {recenter(176);}); 
b[177].click(function() {recenter(177);}); 
b[178].click(function() {recenter(178);}); 
b[179].click(function() {recenter(179);}); 
b[180].click(function() {recenter(180);}); 
b[181].click(function() {recenter(181);}); 
b[182].click(function() {recenter(182);}); 
b[183].click(function() {recenter(183);}); 
b[184].click(function() {recenter(184);}); 
b[185].click(function() {recenter(185);}); 
b[186].click(function() {recenter(186);}); 
b[187].click(function() {recenter(187);}); 
b[188].click(function() {recenter(188);}); 
b[189].click(function() {recenter(189);}); 
b[190].click(function() {recenter(190);}); 
b[191].click(function() {recenter(191);}); 
b[192].click(function() {recenter(192);}); 
b[193].click(function() {recenter(193);}); 
b[194].click(function() {recenter(194);}); 
b[195].click(function() {recenter(195);}); 
b[196].click(function() {recenter(196);}); 
b[197].click(function() {recenter(197);}); 
b[198].click(function() {recenter(198);}); 
b[199].click(function() {recenter(199);}); 
b[200].click(function() {recenter(200);}); 
b[201].click(function() {recenter(201);}); 
b[202].click(function() {recenter(202);}); 
b[203].click(function() {recenter(203);}); 
b[204].click(function() {recenter(204);}); 
b[205].click(function() {recenter(205);}); 
b[206].click(function() {recenter(206);}); 
b[207].click(function() {recenter(207);}); 
b[208].click(function() {recenter(208);}); 
b[209].click(function() {recenter(209);}); 
b[210].click(function() {recenter(210);}); 
b[211].click(function() {recenter(211);}); 
b[212].click(function() {recenter(212);}); 
b[213].click(function() {recenter(213);}); 
b[214].click(function() {recenter(214);}); 
b[215].click(function() {recenter(215);}); 
b[216].click(function() {recenter(216);}); 
b[217].click(function() {recenter(217);}); 
b[218].click(function() {recenter(218);}); 
b[219].click(function() {recenter(219);}); 
b[220].click(function() {recenter(220);}); 
b[221].click(function() {recenter(221);}); 
b[222].click(function() {recenter(222);}); 
b[223].click(function() {recenter(223);}); 
b[224].click(function() {recenter(224);}); 
b[225].click(function() {recenter(225);}); 
b[226].click(function() {recenter(226);}); 
b[227].click(function() {recenter(227);}); 
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
b[133].hover(function() {nodeHover(133);}, function() {nodeUnhover(133);}); 
b[134].hover(function() {nodeHover(134);}, function() {nodeUnhover(134);}); 
b[135].hover(function() {nodeHover(135);}, function() {nodeUnhover(135);}); 
b[136].hover(function() {nodeHover(136);}, function() {nodeUnhover(136);}); 
b[137].hover(function() {nodeHover(137);}, function() {nodeUnhover(137);}); 
b[138].hover(function() {nodeHover(138);}, function() {nodeUnhover(138);}); 
b[139].hover(function() {nodeHover(139);}, function() {nodeUnhover(139);}); 
b[140].hover(function() {nodeHover(140);}, function() {nodeUnhover(140);}); 
b[141].hover(function() {nodeHover(141);}, function() {nodeUnhover(141);}); 
b[142].hover(function() {nodeHover(142);}, function() {nodeUnhover(142);}); 
b[143].hover(function() {nodeHover(143);}, function() {nodeUnhover(143);}); 
b[144].hover(function() {nodeHover(144);}, function() {nodeUnhover(144);}); 
b[145].hover(function() {nodeHover(145);}, function() {nodeUnhover(145);}); 
b[146].hover(function() {nodeHover(146);}, function() {nodeUnhover(146);}); 
b[147].hover(function() {nodeHover(147);}, function() {nodeUnhover(147);}); 
b[148].hover(function() {nodeHover(148);}, function() {nodeUnhover(148);}); 
b[149].hover(function() {nodeHover(149);}, function() {nodeUnhover(149);}); 
b[150].hover(function() {nodeHover(150);}, function() {nodeUnhover(150);}); 
b[151].hover(function() {nodeHover(151);}, function() {nodeUnhover(151);}); 
b[152].hover(function() {nodeHover(152);}, function() {nodeUnhover(152);}); 
b[153].hover(function() {nodeHover(153);}, function() {nodeUnhover(153);}); 
b[154].hover(function() {nodeHover(154);}, function() {nodeUnhover(154);}); 
b[155].hover(function() {nodeHover(155);}, function() {nodeUnhover(155);}); 
b[156].hover(function() {nodeHover(156);}, function() {nodeUnhover(156);}); 
b[157].hover(function() {nodeHover(157);}, function() {nodeUnhover(157);}); 
b[158].hover(function() {nodeHover(158);}, function() {nodeUnhover(158);}); 
b[159].hover(function() {nodeHover(159);}, function() {nodeUnhover(159);}); 
b[160].hover(function() {nodeHover(160);}, function() {nodeUnhover(160);}); 
b[161].hover(function() {nodeHover(161);}, function() {nodeUnhover(161);}); 
b[162].hover(function() {nodeHover(162);}, function() {nodeUnhover(162);}); 
b[163].hover(function() {nodeHover(163);}, function() {nodeUnhover(163);}); 
b[164].hover(function() {nodeHover(164);}, function() {nodeUnhover(164);}); 
b[165].hover(function() {nodeHover(165);}, function() {nodeUnhover(165);}); 
b[166].hover(function() {nodeHover(166);}, function() {nodeUnhover(166);}); 
b[167].hover(function() {nodeHover(167);}, function() {nodeUnhover(167);}); 
b[168].hover(function() {nodeHover(168);}, function() {nodeUnhover(168);}); 
b[169].hover(function() {nodeHover(169);}, function() {nodeUnhover(169);}); 
b[170].hover(function() {nodeHover(170);}, function() {nodeUnhover(170);}); 
b[171].hover(function() {nodeHover(171);}, function() {nodeUnhover(171);}); 
b[172].hover(function() {nodeHover(172);}, function() {nodeUnhover(172);}); 
b[173].hover(function() {nodeHover(173);}, function() {nodeUnhover(173);}); 
b[174].hover(function() {nodeHover(174);}, function() {nodeUnhover(174);}); 
b[175].hover(function() {nodeHover(175);}, function() {nodeUnhover(175);}); 
b[176].hover(function() {nodeHover(176);}, function() {nodeUnhover(176);}); 
b[177].hover(function() {nodeHover(177);}, function() {nodeUnhover(177);}); 
b[178].hover(function() {nodeHover(178);}, function() {nodeUnhover(178);}); 
b[179].hover(function() {nodeHover(179);}, function() {nodeUnhover(179);}); 
b[180].hover(function() {nodeHover(180);}, function() {nodeUnhover(180);}); 
b[181].hover(function() {nodeHover(181);}, function() {nodeUnhover(181);}); 
b[182].hover(function() {nodeHover(182);}, function() {nodeUnhover(182);}); 
b[183].hover(function() {nodeHover(183);}, function() {nodeUnhover(183);}); 
b[184].hover(function() {nodeHover(184);}, function() {nodeUnhover(184);}); 
b[185].hover(function() {nodeHover(185);}, function() {nodeUnhover(185);}); 
b[186].hover(function() {nodeHover(186);}, function() {nodeUnhover(186);}); 
b[187].hover(function() {nodeHover(187);}, function() {nodeUnhover(187);}); 
b[188].hover(function() {nodeHover(188);}, function() {nodeUnhover(188);}); 
b[189].hover(function() {nodeHover(189);}, function() {nodeUnhover(189);}); 
b[190].hover(function() {nodeHover(190);}, function() {nodeUnhover(190);}); 
b[191].hover(function() {nodeHover(191);}, function() {nodeUnhover(191);}); 
b[192].hover(function() {nodeHover(192);}, function() {nodeUnhover(192);}); 
b[193].hover(function() {nodeHover(193);}, function() {nodeUnhover(193);}); 
b[194].hover(function() {nodeHover(194);}, function() {nodeUnhover(194);}); 
b[195].hover(function() {nodeHover(195);}, function() {nodeUnhover(195);}); 
b[196].hover(function() {nodeHover(196);}, function() {nodeUnhover(196);}); 
b[197].hover(function() {nodeHover(197);}, function() {nodeUnhover(197);}); 
b[198].hover(function() {nodeHover(198);}, function() {nodeUnhover(198);}); 
b[199].hover(function() {nodeHover(199);}, function() {nodeUnhover(199);}); 
b[200].hover(function() {nodeHover(200);}, function() {nodeUnhover(200);}); 
b[201].hover(function() {nodeHover(201);}, function() {nodeUnhover(201);}); 
b[202].hover(function() {nodeHover(202);}, function() {nodeUnhover(202);}); 
b[203].hover(function() {nodeHover(203);}, function() {nodeUnhover(203);}); 
b[204].hover(function() {nodeHover(204);}, function() {nodeUnhover(204);}); 
b[205].hover(function() {nodeHover(205);}, function() {nodeUnhover(205);}); 
b[206].hover(function() {nodeHover(206);}, function() {nodeUnhover(206);}); 
b[207].hover(function() {nodeHover(207);}, function() {nodeUnhover(207);}); 
b[208].hover(function() {nodeHover(208);}, function() {nodeUnhover(208);}); 
b[209].hover(function() {nodeHover(209);}, function() {nodeUnhover(209);}); 
b[210].hover(function() {nodeHover(210);}, function() {nodeUnhover(210);}); 
b[211].hover(function() {nodeHover(211);}, function() {nodeUnhover(211);}); 
b[212].hover(function() {nodeHover(212);}, function() {nodeUnhover(212);}); 
b[213].hover(function() {nodeHover(213);}, function() {nodeUnhover(213);}); 
b[214].hover(function() {nodeHover(214);}, function() {nodeUnhover(214);}); 
b[215].hover(function() {nodeHover(215);}, function() {nodeUnhover(215);}); 
b[216].hover(function() {nodeHover(216);}, function() {nodeUnhover(216);}); 
b[217].hover(function() {nodeHover(217);}, function() {nodeUnhover(217);}); 
b[218].hover(function() {nodeHover(218);}, function() {nodeUnhover(218);}); 
b[219].hover(function() {nodeHover(219);}, function() {nodeUnhover(219);}); 
b[220].hover(function() {nodeHover(220);}, function() {nodeUnhover(220);}); 
b[221].hover(function() {nodeHover(221);}, function() {nodeUnhover(221);}); 
b[222].hover(function() {nodeHover(222);}, function() {nodeUnhover(222);}); 
b[223].hover(function() {nodeHover(223);}, function() {nodeUnhover(223);}); 
b[224].hover(function() {nodeHover(224);}, function() {nodeUnhover(224);}); 
b[225].hover(function() {nodeHover(225);}, function() {nodeUnhover(225);}); 
b[226].hover(function() {nodeHover(226);}, function() {nodeUnhover(226);}); 
b[227].hover(function() {nodeHover(227);}, function() {nodeUnhover(227);}); 
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
s1='M '+nx[0]+' '+bb[0]+' L '+nx[0]+' '+ny[228]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[0,228]; 

paper.setStart(); 
s1='M '+nx[1]+' '+bb[1]+' L '+nx[1]+' '+bt[90]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[1,90] ; 

paper.setStart(); 
mid=bb[2]+(bt[194]-bb[2])/2; 
hleft = nx[156]; 
hright = nx[2]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[2]+' '+bb[2]+' L '+nx[2]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[156]+' '+mid+' L '+nx[156]+' '+bt[156];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[2,156]; 

paper.setStart(); 
mid=bb[2]+(bt[194]-bb[2])/2; 
hleft = nx[194]; 
hright = nx[2]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[194]+' '+mid+' L '+nx[194]+' '+bt[194];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[2,194]; 

paper.setStart(); 
mid=bb[3]+(bt[166]-bb[3])/2; 
hleft = nx[173]; 
hright = nx[3]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[3]+' '+bb[3]+' L '+nx[3]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[173]+' '+mid+' L '+nx[173]+' '+bt[173];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[3,173]; 

paper.setStart(); 
mid=bb[3]+(bt[166]-bb[3])/2; 
hleft = nx[166]; 
hright = nx[3]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[166]+' '+mid+' L '+nx[166]+' '+bt[166];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[3,166]; 

paper.setStart(); 
s1='M '+nx[4]+' '+bb[4]+' L '+nx[4]+' '+bt[39]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[4,39] ; 

paper.setStart(); 
s1='M '+nx[5]+' '+bb[5]+' L '+nx[5]+' '+ny[235]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[5]+' '+ny[235]+' L '+nx[109]+' '+ny[235]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[5,235]; 

paper.setStart(); 
s1='M '+nx[6]+' '+bb[6]+' L '+nx[6]+' '+bt[14]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[6,14] ; 

paper.setStart(); 
s1='M '+nx[7]+' '+bb[7]+' L '+nx[7]+' '+bt[89]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[7,89] ; 

paper.setStart(); 
s1='M '+nx[8]+' '+bb[8]+' L '+nx[8]+' '+bt[165]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[8,165] ; 

paper.setStart(); 
s1='M '+nx[9]+' '+bb[9]+' L '+nx[9]+' '+ny[237]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[9]+' '+ny[237]+' L '+nx[163]+' '+ny[237]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[9,237]; 

paper.setStart(); 
s1='M '+nx[10]+' '+bb[10]+' L '+nx[10]+' '+bt[21]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[10,21] ; 

paper.setStart(); 
s1='M '+nx[12]+' '+bb[12]+' L '+nx[12]+' '+bt[83]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[12,83] ; 

paper.setStart(); 
s1='M '+nx[14]+' '+bb[14]+' L '+nx[14]+' '+bt[180]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[14,180] ; 

paper.setStart(); 
s1='M '+nx[15]+' '+bb[15]+' L '+nx[15]+' '+bt[65]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[15,65] ; 

paper.setStart(); 
s1='M '+nx[16]+' '+bb[16]+' L '+nx[16]+' '+bt[162]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[16,162] ; 

paper.setStart(); 
s1='M '+nx[18]+' '+bb[18]+' L '+nx[18]+' '+bt[124]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[18,124] ; 

paper.setStart(); 
s1='M '+nx[19]+' '+bb[19]+' L '+nx[19]+' '+ny[230]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[19]+' '+ny[230]+' L '+nx[184]+' '+ny[230]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[19,230]; 

paper.setStart(); 
s1='M '+nx[20]+' '+bb[20]+' L '+nx[20]+' '+bt[28]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[20,28] ; 

paper.setStart(); 
mid=bb[21]+(bt[219]-bb[21])/2; 
hleft = nx[219]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[21]+' '+bb[21]+' L '+nx[21]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[219]+' '+mid+' L '+nx[219]+' '+bt[219];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[21,219]; 

paper.setStart(); 
mid=bb[21]+(bt[219]-bb[21])/2; 
s3='M '+nx[88]+' '+mid+' L '+nx[88]+' '+bt[88];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[21,88]; 

paper.setStart(); 
mid=bb[21]+(bt[219]-bb[21])/2; 
hleft = nx[58]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[58]+' '+mid+' L '+nx[58]+' '+bt[58];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[21,58]; 

paper.setStart(); 
s1='M '+nx[22]+' '+bb[22]+' L '+nx[22]+' '+bt[99]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[22,99] ; 

paper.setStart(); 
s1='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+bt[227]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[23,227] ; 

paper.setStart(); 
mid=bb[24]+(bt[73]-bb[24])/2; 
hleft = nx[84]; 
hright = nx[24]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[24]+' '+bb[24]+' L '+nx[24]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[84]+' '+mid+' L '+nx[84]+' '+bt[84];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[24,84]; 

paper.setStart(); 
mid=bb[24]+(bt[73]-bb[24])/2; 
hleft = nx[73]; 
hright = nx[24]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[73]+' '+mid+' L '+nx[73]+' '+bt[73];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[24,73]; 

paper.setStart(); 
mid=bb[217]+(bt[198]-bb[217])/2; 
s2='M '+nx[27]+' '+bb[27]+' L '+nx[27]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[198]+' '+mid+' L '+nx[198]+' '+bt[198];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[27,198]; 

paper.setStart(); 
mid=bb[217]+(bt[198]-bb[217])/2; 
hleft = nx[200]; 
hright = nx[27]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[200]+' '+mid+' L '+nx[200]+' '+bt[200];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[27,200]; 

paper.setStart(); 
mid=bb[217]+(bt[198]-bb[217])/2; 
hleft = nx[223]; 
hright = nx[27]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[223]+' '+mid+' L '+nx[223]+' '+bt[223];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[27,223]; 

paper.setStart(); 
mid=bb[217]+(bt[198]-bb[217])/2; 
s3='M '+nx[204]+' '+mid+' L '+nx[204]+' '+bt[204];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[27,204]; 

paper.setStart(); 
s1='M '+nx[28]+' '+bb[28]+' L '+nx[28]+' '+bt[117]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[28,117] ; 

paper.setStart(); 
s1='M '+nx[31]+' '+bb[31]+' L '+nx[31]+' '+bt[79]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[31,79] ; 

paper.setStart(); 
s1='M '+nx[34]+' '+bb[34]+' L '+nx[34]+' '+bt[53]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[34,53] ; 

paper.setStart(); 
s1='M '+nx[35]+' '+bb[35]+' L '+nx[35]+' '+bt[221]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[35,221] ; 

paper.setStart(); 
s1='M '+nx[36]+' '+bb[36]+' L '+nx[36]+' '+ny[236]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[36,236]; 

paper.setStart(); 
s1='M '+nx[37]+' '+bb[37]+' L '+nx[37]+' '+bt[193]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[37,193] ; 

paper.setStart(); 
mid=bb[38]+(bt[222]-bb[38])/2; 
hleft = nx[145]; 
hright = nx[38]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[38]+' '+bb[38]+' L '+nx[38]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[145]+' '+mid+' L '+nx[145]+' '+bt[145];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[38,145]; 

paper.setStart(); 
mid=bb[38]+(bt[222]-bb[38])/2; 
hleft = nx[222]; 
hright = nx[38]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[222]+' '+mid+' L '+nx[222]+' '+bt[222];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[38,222]; 

paper.setStart(); 
mid=bb[39]+(bt[78]-bb[39])/2; 
hleft = nx[101]; 
hright = nx[39]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[39]+' '+bb[39]+' L '+nx[39]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[101]+' '+mid+' L '+nx[101]+' '+bt[101];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[39,101]; 

paper.setStart(); 
mid=bb[39]+(bt[78]-bb[39])/2; 
hleft = nx[110]; 
hright = nx[39]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[110]+' '+mid+' L '+nx[110]+' '+bt[110];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[39,110]; 

paper.setStart(); 
mid=bb[39]+(bt[78]-bb[39])/2; 
s3='M '+nx[78]+' '+mid+' L '+nx[78]+' '+bt[78];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[39,78]; 

paper.setStart(); 
mid=bb[39]+(bt[78]-bb[39])/2; 
s3='M '+nx[226]+' '+mid+' L '+nx[226]+' '+bt[226];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[39,226]; 

paper.setStart(); 
s1='M '+nx[40]+' '+bb[40]+' L '+nx[40]+' '+bt[108]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[40,108] ; 

paper.setStart(); 
s1='M '+nx[41]+' '+bb[41]+' L '+nx[41]+' '+bt[114]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[41,114] ; 

paper.setStart(); 
s1='M '+nx[42]+' '+bb[42]+' L '+nx[42]+' '+ny[239]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[42,239]; 

paper.setStart(); 
s1='M '+nx[43]+' '+bb[43]+' L '+nx[43]+' '+bt[202]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[43,202] ; 

paper.setStart(); 
s1='M '+nx[44]+' '+bb[44]+' L '+nx[44]+' '+bt[197]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[44,197] ; 

paper.setStart(); 
s1='M '+nx[45]+' '+bb[45]+' L '+nx[45]+' '+ny[232]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[45,232]; 

paper.setStart(); 
s1='M '+nx[46]+' '+bb[46]+' L '+nx[46]+' '+bt[210]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[49]=paper.setFinish(); 
lineNodes[49]=[46,210] ; 

paper.setStart(); 
s1='M '+nx[47]+' '+bb[47]+' L '+nx[47]+' '+ny[234]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[47,234]; 

paper.setStart(); 
s1='M '+nx[48]+' '+bb[48]+' L '+nx[48]+' '+ny[236]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[48,236]; 

paper.setStart(); 
mid=bb[49]+(bt[75]-bb[49])/2; 
hleft = nx[93]; 
hright = nx[49]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[49]+' '+bb[49]+' L '+nx[49]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[93]+' '+mid+' L '+nx[93]+' '+bt[93];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[49,93]; 

paper.setStart(); 
mid=bb[49]+(bt[75]-bb[49])/2; 
hleft = nx[75]; 
hright = nx[49]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[75]+' '+mid+' L '+nx[75]+' '+bt[75];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[49,75]; 

paper.setStart(); 
mid=bb[50]+(bt[158]-bb[50])/2; 
hleft = nx[140]; 
hright = nx[50]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[50]+' '+bb[50]+' L '+nx[50]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[140]+' '+mid+' L '+nx[140]+' '+bt[140];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[50,140]; 

paper.setStart(); 
mid=bb[50]+(bt[158]-bb[50])/2; 
hleft = nx[158]; 
hright = nx[50]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[158]+' '+mid+' L '+nx[158]+' '+bt[158];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[50,158]; 

paper.setStart(); 
s1='M '+nx[51]+' '+bb[51]+' L '+nx[51]+' '+bt[68]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[51,68] ; 

paper.setStart(); 
s1='M '+nx[52]+' '+bb[52]+' L '+nx[52]+' '+bt[161]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[52,161] ; 

paper.setStart(); 
s1='M '+nx[53]+' '+bb[53]+' L '+nx[53]+' '+bt[129]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[53,129] ; 

paper.setStart(); 
mid=bb[54]+(bt[216]-bb[54])/2; 
hleft = nx[188]; 
hright = nx[54]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[54]+' '+bb[54]+' L '+nx[54]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[188]+' '+mid+' L '+nx[188]+' '+bt[188];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[54,188]; 

paper.setStart(); 
mid=bb[54]+(bt[216]-bb[54])/2; 
hleft = nx[216]; 
hright = nx[54]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[216]+' '+mid+' L '+nx[216]+' '+bt[216];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[54,216]; 

paper.setStart(); 
mid=bb[55]+(bt[213]-bb[55])/2; 
hleft = nx[214]; 
hright = nx[55]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[55]+' '+bb[55]+' L '+nx[55]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[214]+' '+mid+' L '+nx[214]+' '+bt[214];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[55,214]; 

paper.setStart(); 
mid=bb[55]+(bt[213]-bb[55])/2; 
s3='M '+nx[92]+' '+mid+' L '+nx[92]+' '+bt[92];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[55,92]; 

paper.setStart(); 
mid=bb[55]+(bt[213]-bb[55])/2; 
hleft = nx[213]; 
hright = nx[55]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[213]+' '+mid+' L '+nx[213]+' '+bt[213];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[55,213]; 

paper.setStart(); 
s1='M '+nx[56]+' '+bb[56]+' L '+nx[56]+' '+ny[229]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[56]+' '+ny[229]+' L '+nx[192]+' '+ny[229]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[56,229]; 

paper.setStart(); 
s1='M '+nx[57]+' '+bb[57]+' L '+nx[57]+' '+bt[63]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[57,63] ; 

paper.setStart(); 
s1='M '+nx[58]+' '+bb[58]+' L '+nx[58]+' '+bt[15]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[58,15] ; 

paper.setStart(); 
s1='M '+nx[60]+' '+bb[60]+' L '+nx[60]+' '+bt[61]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[60,61] ; 

paper.setStart(); 
s1='M '+nx[61]+' '+bb[61]+' L '+nx[61]+' '+bt[31]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[61,31] ; 

paper.setStart(); 
s1='M '+nx[62]+' '+bb[62]+' L '+nx[62]+' '+bt[81]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[69]=paper.setFinish(); 
lineNodes[69]=[62,81] ; 

paper.setStart(); 
mid=bb[63]+(bt[4]-bb[63])/2; 
hleft = nx[133]; 
hright = nx[63]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[63]+' '+bb[63]+' L '+nx[63]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[133]+' '+mid+' L '+nx[133]+' '+bt[133];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[70]=paper.setFinish(); 
lineNodes[70]=[63,133]; 

paper.setStart(); 
mid=bb[63]+(bt[4]-bb[63])/2; 
s3='M '+nx[70]+' '+mid+' L '+nx[70]+' '+bt[70];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[71]=paper.setFinish(); 
lineNodes[71]=[63,70]; 

paper.setStart(); 
mid=bb[63]+(bt[4]-bb[63])/2; 
hleft = nx[4]; 
hright = nx[63]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[4]+' '+mid+' L '+nx[4]+' '+bt[4];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[72]=paper.setFinish(); 
lineNodes[72]=[63,4]; 

paper.setStart(); 
s1='M '+nx[64]+' '+bb[64]+' L '+nx[64]+' '+ny[231]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[73]=paper.setFinish(); 
lineNodes[73]=[64,231]; 

paper.setStart(); 
mid=bb[66]+(bt[13]-bb[66])/2; 
s2='M '+nx[66]+' '+bb[66]+' L '+nx[66]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[27]+' '+mid+' L '+nx[27]+' '+bt[27];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[74]=paper.setFinish(); 
lineNodes[74]=[66,27]; 

paper.setStart(); 
mid=bb[66]+(bt[13]-bb[66])/2; 
hleft = nx[13]; 
hright = nx[66]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[13]+' '+mid+' L '+nx[13]+' '+bt[13];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[75]=paper.setFinish(); 
lineNodes[75]=[66,13]; 

paper.setStart(); 
mid=bb[66]+(bt[13]-bb[66])/2; 
hleft = nx[217]; 
hright = nx[66]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[217]+' '+mid+' L '+nx[217]+' '+bt[217];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[76]=paper.setFinish(); 
lineNodes[76]=[66,217]; 

paper.setStart(); 
s1='M '+nx[67]+' '+bb[67]+' L '+nx[67]+' '+ny[228]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[77]=paper.setFinish(); 
lineNodes[77]=[67,228]; 

paper.setStart(); 
s1='M '+nx[68]+' '+bb[68]+' L '+nx[68]+' '+bt[192]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[78]=paper.setFinish(); 
lineNodes[78]=[68,192] ; 

paper.setStart(); 
s1='M '+nx[69]+' '+bb[69]+' L '+nx[69]+' '+bt[106]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[79]=paper.setFinish(); 
lineNodes[79]=[69,106] ; 

paper.setStart(); 
mid=bb[72]+(bt[12]-bb[72])/2; 
hleft = nx[12]; 
hright = nx[72]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[72]+' '+bb[72]+' L '+nx[72]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[12]+' '+mid+' L '+nx[12]+' '+bt[12];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[80]=paper.setFinish(); 
lineNodes[80]=[72,12]; 

paper.setStart(); 
mid=bb[72]+(bt[12]-bb[72])/2; 
hleft = nx[10]; 
hright = nx[72]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[10]+' '+mid+' L '+nx[10]+' '+bt[10];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[81]=paper.setFinish(); 
lineNodes[81]=[72,10]; 

paper.setStart(); 
s1='M '+nx[73]+' '+bb[73]+' L '+nx[73]+' '+bt[184]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[82]=paper.setFinish(); 
lineNodes[82]=[73,184] ; 

paper.setStart(); 
s1='M '+nx[74]+' '+bb[74]+' L '+nx[74]+' '+bt[1]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[83]=paper.setFinish(); 
lineNodes[83]=[74,1] ; 

paper.setStart(); 
s1='M '+nx[76]+' '+bb[76]+' L '+nx[76]+' '+bt[190]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[84]=paper.setFinish(); 
lineNodes[84]=[76,190] ; 

paper.setStart(); 
s1='M '+nx[79]+' '+bb[79]+' L '+nx[79]+' '+bt[176]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[85]=paper.setFinish(); 
lineNodes[85]=[79,176] ; 

paper.setStart(); 
mid=bb[80]+(bt[155]-bb[80])/2; 
hleft = nx[159]; 
hright = nx[80]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[80]+' '+bb[80]+' L '+nx[80]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[159]+' '+mid+' L '+nx[159]+' '+bt[159];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[86]=paper.setFinish(); 
lineNodes[86]=[80,159]; 

paper.setStart(); 
mid=bb[80]+(bt[155]-bb[80])/2; 
hleft = nx[155]; 
hright = nx[80]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[155]+' '+mid+' L '+nx[155]+' '+bt[155];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[87]=paper.setFinish(); 
lineNodes[87]=[80,155]; 

paper.setStart(); 
mid=bb[81]+(bt[149]-bb[81])/2; 
hleft = nx[45]; 
hright = nx[81]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[81]+' '+bb[81]+' L '+nx[81]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[45]+' '+mid+' L '+nx[45]+' '+bt[45];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[88]=paper.setFinish(); 
lineNodes[88]=[81,45]; 

paper.setStart(); 
mid=bb[81]+(bt[149]-bb[81])/2; 
hleft = nx[149]; 
hright = nx[81]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[149]+' '+mid+' L '+nx[149]+' '+bt[149];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[89]=paper.setFinish(); 
lineNodes[89]=[81,149]; 

paper.setStart(); 
s1='M '+nx[82]+' '+bb[82]+' L '+nx[82]+' '+ny[234]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[82]+' '+ny[234]+' L '+nx[47]+' '+ny[234]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[90]=paper.setFinish(); 
lineNodes[90]=[82,234]; 

paper.setStart(); 
mid=bb[83]+(bt[174]-bb[83])/2; 
hleft = nx[174]; 
hright = nx[83]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[83]+' '+bb[83]+' L '+nx[83]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[174]+' '+mid+' L '+nx[174]+' '+bt[174];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[91]=paper.setFinish(); 
lineNodes[91]=[83,174]; 

paper.setStart(); 
mid=bb[83]+(bt[174]-bb[83])/2; 
hleft = nx[17]; 
hright = nx[83]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[17]+' '+mid+' L '+nx[17]+' '+bt[17];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[92]=paper.setFinish(); 
lineNodes[92]=[83,17]; 

paper.setStart(); 
s1='M '+nx[84]+' '+bb[84]+' L '+nx[84]+' '+bt[19]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[93]=paper.setFinish(); 
lineNodes[93]=[84,19] ; 

paper.setStart(); 
s1='M '+nx[86]+' '+bb[86]+' L '+nx[86]+' '+bt[153]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[94]=paper.setFinish(); 
lineNodes[94]=[86,153] ; 

paper.setStart(); 
s1='M '+nx[87]+' '+bb[87]+' L '+nx[87]+' '+bt[8]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[95]=paper.setFinish(); 
lineNodes[95]=[87,8] ; 

paper.setStart(); 
s1='M '+nx[88]+' '+bb[88]+' L '+nx[88]+' '+bt[102]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[96]=paper.setFinish(); 
lineNodes[96]=[88,102] ; 

paper.setStart(); 
s1='M '+nx[89]+' '+bb[89]+' L '+nx[89]+' '+bt[125]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[97]=paper.setFinish(); 
lineNodes[97]=[89,125] ; 

paper.setStart(); 
s1='M '+nx[90]+' '+bb[90]+' L '+nx[90]+' '+bt[85]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[98]=paper.setFinish(); 
lineNodes[98]=[90,85] ; 

paper.setStart(); 
s1='M '+nx[91]+' '+bb[91]+' L '+nx[91]+' '+bt[76]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[99]=paper.setFinish(); 
lineNodes[99]=[91,76] ; 

paper.setStart(); 
s1='M '+nx[94]+' '+bb[94]+' L '+nx[94]+' '+bt[177]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[100]=paper.setFinish(); 
lineNodes[100]=[94,177] ; 

paper.setStart(); 
mid=bb[95]+(bt[136]-bb[95])/2; 
hleft = nx[60]; 
hright = nx[95]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[95]+' '+bb[95]+' L '+nx[95]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[60]+' '+mid+' L '+nx[60]+' '+bt[60];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[101]=paper.setFinish(); 
lineNodes[101]=[95,60]; 

paper.setStart(); 
mid=bb[95]+(bt[136]-bb[95])/2; 
s3='M '+nx[136]+' '+mid+' L '+nx[136]+' '+bt[136];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[102]=paper.setFinish(); 
lineNodes[102]=[95,136]; 

paper.setStart(); 
mid=bb[95]+(bt[136]-bb[95])/2; 
hleft = nx[40]; 
hright = nx[95]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[40]+' '+mid+' L '+nx[40]+' '+bt[40];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[103]=paper.setFinish(); 
lineNodes[103]=[95,40]; 

paper.setStart(); 
s1='M '+nx[96]+' '+bb[96]+' L '+nx[96]+' '+bt[103]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[104]=paper.setFinish(); 
lineNodes[104]=[96,103] ; 

paper.setStart(); 
s1='M '+nx[97]+' '+bb[97]+' L '+nx[97]+' '+ny[231]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[105]=paper.setFinish(); 
lineNodes[105]=[97,231]; 

paper.setStart(); 
s1='M '+nx[98]+' '+bb[98]+' L '+nx[98]+' '+bt[94]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[106]=paper.setFinish(); 
lineNodes[106]=[98,94] ; 

paper.setStart(); 
mid=bb[99]+(bt[209]-bb[99])/2; 
hleft = nx[189]; 
hright = nx[99]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[99]+' '+bb[99]+' L '+nx[99]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[189]+' '+mid+' L '+nx[189]+' '+bt[189];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[107]=paper.setFinish(); 
lineNodes[107]=[99,189]; 

paper.setStart(); 
mid=bb[99]+(bt[209]-bb[99])/2; 
hleft = nx[209]; 
hright = nx[99]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[209]+' '+mid+' L '+nx[209]+' '+bt[209];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[108]=paper.setFinish(); 
lineNodes[108]=[99,209]; 

paper.setStart(); 
s1='M '+nx[101]+' '+bb[101]+' L '+nx[101]+' '+bt[44]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[109]=paper.setFinish(); 
lineNodes[109]=[101,44] ; 

paper.setStart(); 
s1='M '+nx[102]+' '+bb[102]+' L '+nx[102]+' '+bt[206]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[110]=paper.setFinish(); 
lineNodes[110]=[102,206] ; 

paper.setStart(); 
s1='M '+nx[104]+' '+bb[104]+' L '+nx[104]+' '+bt[131]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[111]=paper.setFinish(); 
lineNodes[111]=[104,131] ; 

paper.setStart(); 
s1='M '+nx[105]+' '+bb[105]+' L '+nx[105]+' '+bt[91]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[112]=paper.setFinish(); 
lineNodes[112]=[105,91] ; 

paper.setStart(); 
s1='M '+nx[106]+' '+bb[106]+' L '+nx[106]+' '+bt[126]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[113]=paper.setFinish(); 
lineNodes[113]=[106,126] ; 

paper.setStart(); 
s1='M '+nx[107]+' '+bb[107]+' L '+nx[107]+' '+bt[186]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[114]=paper.setFinish(); 
lineNodes[114]=[107,186] ; 

paper.setStart(); 
mid=bb[108]+(bt[134]-bb[108])/2; 
hleft = nx[134]; 
hright = nx[108]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[108]+' '+bb[108]+' L '+nx[108]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[134]+' '+mid+' L '+nx[134]+' '+bt[134];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[115]=paper.setFinish(); 
lineNodes[115]=[108,134]; 

paper.setStart(); 
mid=bb[108]+(bt[134]-bb[108])/2; 
hleft = nx[111]; 
hright = nx[108]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[111]+' '+mid+' L '+nx[111]+' '+bt[111];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[116]=paper.setFinish(); 
lineNodes[116]=[108,111]; 

paper.setStart(); 
s1='M '+nx[109]+' '+bb[109]+' L '+nx[109]+' '+ny[235]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[117]=paper.setFinish(); 
lineNodes[117]=[109,235]; 

paper.setStart(); 
mid=bb[111]+(bt[178]-bb[111])/2; 
hleft = nx[112]; 
hright = nx[111]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[111]+' '+bb[111]+' L '+nx[111]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[112]+' '+mid+' L '+nx[112]+' '+bt[112];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[118]=paper.setFinish(); 
lineNodes[118]=[111,112]; 

paper.setStart(); 
mid=bb[111]+(bt[178]-bb[111])/2; 
hleft = nx[178]; 
hright = nx[111]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[178]+' '+mid+' L '+nx[178]+' '+bt[178];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[119]=paper.setFinish(); 
lineNodes[119]=[111,178]; 

paper.setStart(); 
s1='M '+nx[113]+' '+bb[113]+' L '+nx[113]+' '+bt[23]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[120]=paper.setFinish(); 
lineNodes[120]=[113,23] ; 

paper.setStart(); 
s1='M '+nx[114]+' '+bb[114]+' L '+nx[114]+' '+bt[152]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[121]=paper.setFinish(); 
lineNodes[121]=[114,152] ; 

paper.setStart(); 
s1='M '+nx[116]+' '+bb[116]+' L '+nx[116]+' '+bt[32]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[122]=paper.setFinish(); 
lineNodes[122]=[116,32] ; 

paper.setStart(); 
mid=bb[117]+(bt[142]-bb[117])/2; 
hleft = nx[142]; 
hright = nx[117]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[117]+' '+bb[117]+' L '+nx[117]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[142]+' '+mid+' L '+nx[142]+' '+bt[142];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[123]=paper.setFinish(); 
lineNodes[123]=[117,142]; 

paper.setStart(); 
mid=bb[117]+(bt[142]-bb[117])/2; 
hleft = nx[49]; 
hright = nx[117]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[49]+' '+mid+' L '+nx[49]+' '+bt[49];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[124]=paper.setFinish(); 
lineNodes[124]=[117,49]; 

paper.setStart(); 
mid=bb[118]+(bt[9]-bb[118])/2; 
hleft = nx[163]; 
hright = nx[118]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[118]+' '+bb[118]+' L '+nx[118]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[163]+' '+mid+' L '+nx[163]+' '+bt[163];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[125]=paper.setFinish(); 
lineNodes[125]=[118,163]; 

paper.setStart(); 
mid=bb[118]+(bt[9]-bb[118])/2; 
hleft = nx[9]; 
hright = nx[118]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[9]+' '+mid+' L '+nx[9]+' '+bt[9];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[126]=paper.setFinish(); 
lineNodes[126]=[118,9]; 

paper.setStart(); 
s1='M '+nx[119]+' '+bb[119]+' L '+nx[119]+' '+bt[208]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[127]=paper.setFinish(); 
lineNodes[127]=[119,208] ; 

paper.setStart(); 
mid=bb[120]+(bt[104]-bb[120])/2; 
hleft = nx[16]; 
hright = nx[120]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[120]+' '+bb[120]+' L '+nx[120]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[16]+' '+mid+' L '+nx[16]+' '+bt[16];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[128]=paper.setFinish(); 
lineNodes[128]=[120,16]; 

paper.setStart(); 
mid=bb[120]+(bt[104]-bb[120])/2; 
hleft = nx[104]; 
hright = nx[120]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[104]+' '+mid+' L '+nx[104]+' '+bt[104];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[129]=paper.setFinish(); 
lineNodes[129]=[120,104]; 

paper.setStart(); 
mid=bb[122]+(bt[139]-bb[122])/2; 
hleft = nx[0]; 
hright = nx[122]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[122]+' '+bb[122]+' L '+nx[122]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[0]+' '+mid+' L '+nx[0]+' '+bt[0];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[130]=paper.setFinish(); 
lineNodes[130]=[122,0]; 

paper.setStart(); 
mid=bb[122]+(bt[139]-bb[122])/2; 
hleft = nx[139]; 
hright = nx[122]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[139]+' '+mid+' L '+nx[139]+' '+bt[139];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[131]=paper.setFinish(); 
lineNodes[131]=[122,139]; 

paper.setStart(); 
s1='M '+nx[123]+' '+bb[123]+' L '+nx[123]+' '+bt[225]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[132]=paper.setFinish(); 
lineNodes[132]=[123,225] ; 

paper.setStart(); 
s1='M '+nx[124]+' '+bb[124]+' L '+nx[124]+' '+ny[239]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[124]+' '+ny[239]+' L '+nx[42]+' '+ny[239]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[133]=paper.setFinish(); 
lineNodes[133]=[124,239]; 

paper.setStart(); 
s1='M '+nx[125]+' '+bb[125]+' L '+nx[125]+' '+bt[86]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[134]=paper.setFinish(); 
lineNodes[134]=[125,86] ; 

paper.setStart(); 
s1='M '+nx[126]+' '+bb[126]+' L '+nx[126]+' '+bt[123]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[135]=paper.setFinish(); 
lineNodes[135]=[126,123] ; 

paper.setStart(); 
s1='M '+nx[127]+' '+bb[127]+' L '+nx[127]+' '+ny[228]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[136]=paper.setFinish(); 
lineNodes[136]=[127,228]; 

paper.setStart(); 
s1='M '+nx[129]+' '+bb[129]+' L '+nx[129]+' '+bt[201]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[137]=paper.setFinish(); 
lineNodes[137]=[129,201] ; 

paper.setStart(); 
mid=bb[130]+(bt[5]-bb[130])/2; 
hleft = nx[109]; 
hright = nx[130]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[130]+' '+bb[130]+' L '+nx[130]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[109]+' '+mid+' L '+nx[109]+' '+bt[109];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[138]=paper.setFinish(); 
lineNodes[138]=[130,109]; 

paper.setStart(); 
mid=bb[130]+(bt[5]-bb[130])/2; 
hleft = nx[5]; 
hright = nx[130]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[5]+' '+mid+' L '+nx[5]+' '+bt[5];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[139]=paper.setFinish(); 
lineNodes[139]=[130,5]; 

paper.setStart(); 
s1='M '+nx[131]+' '+bb[131]+' L '+nx[131]+' '+bt[199]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[140]=paper.setFinish(); 
lineNodes[140]=[131,199] ; 

paper.setStart(); 
s1='M '+nx[132]+' '+bb[132]+' L '+nx[132]+' '+ny[231]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[132]+' '+ny[231]+' L '+nx[224]+' '+ny[231]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[141]=paper.setFinish(); 
lineNodes[141]=[132,231]; 

paper.setStart(); 
s1='M '+nx[135]+' '+bb[135]+' L '+nx[135]+' '+bt[57]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[142]=paper.setFinish(); 
lineNodes[142]=[135,57] ; 

paper.setStart(); 
mid=bb[136]+(bt[51]-bb[136])/2; 
hleft = nx[80]; 
hright = nx[136]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[136]+' '+bb[136]+' L '+nx[136]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[80]+' '+mid+' L '+nx[80]+' '+bt[80];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[143]=paper.setFinish(); 
lineNodes[143]=[136,80]; 

paper.setStart(); 
mid=bb[136]+(bt[51]-bb[136])/2; 
hleft = nx[207]; 
hright = nx[136]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[207]+' '+mid+' L '+nx[207]+' '+bt[207];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[144]=paper.setFinish(); 
lineNodes[144]=[136,207]; 

paper.setStart(); 
mid=bb[136]+(bt[51]-bb[136])/2; 
s3='M '+nx[51]+' '+mid+' L '+nx[51]+' '+bt[51];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[145]=paper.setFinish(); 
lineNodes[145]=[136,51]; 

paper.setStart(); 
mid=bb[137]+(bt[132]-bb[137])/2; 
s2='M '+nx[137]+' '+bb[137]+' L '+nx[137]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[64]+' '+mid+' L '+nx[64]+' '+bt[64];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[146]=paper.setFinish(); 
lineNodes[146]=[137,64]; 

paper.setStart(); 
mid=bb[137]+(bt[132]-bb[137])/2; 
hleft = nx[132]; 
hright = nx[137]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[132]+' '+mid+' L '+nx[132]+' '+bt[132];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[147]=paper.setFinish(); 
lineNodes[147]=[137,132]; 

paper.setStart(); 
mid=bb[137]+(bt[132]-bb[137])/2; 
s3='M '+nx[97]+' '+mid+' L '+nx[97]+' '+bt[97];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[148]=paper.setFinish(); 
lineNodes[148]=[137,97]; 

paper.setStart(); 
mid=bb[137]+(bt[132]-bb[137])/2; 
hleft = nx[224]; 
hright = nx[137]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[224]+' '+mid+' L '+nx[224]+' '+bt[224];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[149]=paper.setFinish(); 
lineNodes[149]=[137,224]; 

paper.setStart(); 
s1='M '+nx[138]+' '+bb[138]+' L '+nx[138]+' '+bt[34]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[150]=paper.setFinish(); 
lineNodes[150]=[138,34] ; 

paper.setStart(); 
s1='M '+nx[139]+' '+bb[139]+' L '+nx[139]+' '+ny[228]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[151]=paper.setFinish(); 
lineNodes[151]=[139,228]; 

paper.setStart(); 
s1='M '+nx[141]+' '+bb[141]+' L '+nx[141]+' '+bt[38]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[152]=paper.setFinish(); 
lineNodes[152]=[141,38] ; 

paper.setStart(); 
s1='M '+nx[142]+' '+bb[142]+' L '+nx[142]+' '+bt[77]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[153]=paper.setFinish(); 
lineNodes[153]=[142,77] ; 

paper.setStart(); 
s1='M '+nx[143]+' '+bb[143]+' L '+nx[143]+' '+bt[128]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[154]=paper.setFinish(); 
lineNodes[154]=[143,128] ; 

paper.setStart(); 
mid=bb[144]+(bt[151]-bb[144])/2; 
hleft = nx[151]; 
hright = nx[144]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[144]+' '+bb[144]+' L '+nx[144]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[151]+' '+mid+' L '+nx[151]+' '+bt[151];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[155]=paper.setFinish(); 
lineNodes[155]=[144,151]; 

paper.setStart(); 
mid=bb[144]+(bt[151]-bb[144])/2; 
hleft = nx[135]; 
hright = nx[144]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[135]+' '+mid+' L '+nx[135]+' '+bt[135];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[156]=paper.setFinish(); 
lineNodes[156]=[144,135]; 

paper.setStart(); 
s1='M '+nx[145]+' '+bb[145]+' L '+nx[145]+' '+bt[157]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[157]=paper.setFinish(); 
lineNodes[157]=[145,157] ; 

paper.setStart(); 
mid=bb[146]+(bt[72]-bb[146])/2; 
hleft = nx[119]; 
hright = nx[146]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[146]+' '+bb[146]+' L '+nx[146]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[119]+' '+mid+' L '+nx[119]+' '+bt[119];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[158]=paper.setFinish(); 
lineNodes[158]=[146,119]; 

paper.setStart(); 
mid=bb[146]+(bt[72]-bb[146])/2; 
hleft = nx[72]; 
hright = nx[146]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[72]+' '+mid+' L '+nx[72]+' '+bt[72];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[159]=paper.setFinish(); 
lineNodes[159]=[146,72]; 

paper.setStart(); 
mid=bb[147]+(bt[137]-bb[147])/2; 
hleft = nx[145]; 
hright = nx[147]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[147]+' '+bb[147]+' L '+nx[147]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[145]+' '+mid+' L '+nx[145]+' '+bt[145];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[160]=paper.setFinish(); 
lineNodes[160]=[147,145]; 

paper.setStart(); 
mid=bb[147]+(bt[137]-bb[147])/2; 
hleft = nx[137]; 
hright = nx[147]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[137]+' '+mid+' L '+nx[137]+' '+bt[137];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[161]=paper.setFinish(); 
lineNodes[161]=[147,137]; 

paper.setStart(); 
s1='M '+nx[148]+' '+bb[148]+' L '+nx[148]+' '+bt[187]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[162]=paper.setFinish(); 
lineNodes[162]=[148,187] ; 

paper.setStart(); 
s1='M '+nx[149]+' '+bb[149]+' L '+nx[149]+' '+bt[218]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[163]=paper.setFinish(); 
lineNodes[163]=[149,218] ; 

paper.setStart(); 
s1='M '+nx[149]+' '+bb[149]+' L '+nx[149]+' '+ny[232]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[149]+' '+ny[232]+' L '+nx[45]+' '+ny[232]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[164]=paper.setFinish(); 
lineNodes[164]=[149,232]; 

paper.setStart(); 
mid=bb[150]+(bt[52]-bb[150])/2; 
hleft = nx[107]; 
hright = nx[150]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[150]+' '+bb[150]+' L '+nx[150]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[107]+' '+mid+' L '+nx[107]+' '+bt[107];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[165]=paper.setFinish(); 
lineNodes[165]=[150,107]; 

paper.setStart(); 
mid=bb[150]+(bt[52]-bb[150])/2; 
hleft = nx[154]; 
hright = nx[150]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[154]+' '+mid+' L '+nx[154]+' '+bt[154];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[166]=paper.setFinish(); 
lineNodes[166]=[150,154]; 

paper.setStart(); 
mid=bb[150]+(bt[52]-bb[150])/2; 
s3='M '+nx[41]+' '+mid+' L '+nx[41]+' '+bt[41];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[167]=paper.setFinish(); 
lineNodes[167]=[150,41]; 

paper.setStart(); 
mid=bb[150]+(bt[52]-bb[150])/2; 
s3='M '+nx[52]+' '+mid+' L '+nx[52]+' '+bt[52];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[168]=paper.setFinish(); 
lineNodes[168]=[150,52]; 

paper.setStart(); 
s1='M '+nx[151]+' '+bb[151]+' L '+nx[151]+' '+bt[26]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[169]=paper.setFinish(); 
lineNodes[169]=[151,26] ; 

paper.setStart(); 
mid=bb[152]+(bt[42]-bb[152])/2; 
hleft = nx[18]; 
hright = nx[152]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[152]+' '+bb[152]+' L '+nx[152]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[18]+' '+mid+' L '+nx[18]+' '+bt[18];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[170]=paper.setFinish(); 
lineNodes[170]=[152,18]; 

paper.setStart(); 
mid=bb[152]+(bt[42]-bb[152])/2; 
hleft = nx[42]; 
hright = nx[152]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[42]+' '+mid+' L '+nx[42]+' '+bt[42];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[171]=paper.setFinish(); 
lineNodes[171]=[152,42]; 

paper.setStart(); 
s1='M '+nx[153]+' '+bb[153]+' L '+nx[153]+' '+bt[113]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[172]=paper.setFinish(); 
lineNodes[172]=[153,113] ; 

paper.setStart(); 
s1='M '+nx[154]+' '+bb[154]+' L '+nx[154]+' '+bt[179]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[173]=paper.setFinish(); 
lineNodes[173]=[154,179] ; 

paper.setStart(); 
s1='M '+nx[155]+' '+bb[155]+' L '+nx[155]+' '+bt[116]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[174]=paper.setFinish(); 
lineNodes[174]=[155,116] ; 

paper.setStart(); 
s1='M '+nx[156]+' '+bb[156]+' L '+nx[156]+' '+ny[233]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[175]=paper.setFinish(); 
lineNodes[175]=[156,233]; 

paper.setStart(); 
mid=bb[157]+(bt[118]-bb[157])/2; 
hleft = nx[118]; 
hright = nx[157]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[157]+' '+bb[157]+' L '+nx[157]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[118]+' '+mid+' L '+nx[118]+' '+bt[118];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[176]=paper.setFinish(); 
lineNodes[176]=[157,118]; 

paper.setStart(); 
mid=bb[157]+(bt[118]-bb[157])/2; 
hleft = nx[87]; 
hright = nx[157]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[87]+' '+mid+' L '+nx[87]+' '+bt[87];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[177]=paper.setFinish(); 
lineNodes[177]=[157,87]; 

paper.setStart(); 
s1='M '+nx[159]+' '+bb[159]+' L '+nx[159]+' '+bt[130]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[178]=paper.setFinish(); 
lineNodes[178]=[159,130] ; 

paper.setStart(); 
s1='M '+nx[161]+' '+bb[161]+' L '+nx[161]+' '+bt[148]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[179]=paper.setFinish(); 
lineNodes[179]=[161,148] ; 

paper.setStart(); 
s1='M '+nx[162]+' '+bb[162]+' L '+nx[162]+' '+bt[2]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[180]=paper.setFinish(); 
lineNodes[180]=[162,2] ; 

paper.setStart(); 
s1='M '+nx[163]+' '+bb[163]+' L '+nx[163]+' '+ny[237]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[181]=paper.setFinish(); 
lineNodes[181]=[163,237]; 

paper.setStart(); 
s1='M '+nx[165]+' '+bb[165]+' L '+nx[165]+' '+bt[46]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[182]=paper.setFinish(); 
lineNodes[182]=[165,46] ; 

paper.setStart(); 
s1='M '+nx[167]+' '+bb[167]+' L '+nx[167]+' '+bt[62]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[183]=paper.setFinish(); 
lineNodes[183]=[167,62] ; 

paper.setStart(); 
mid=bb[168]+(bt[98]-bb[168])/2; 
s2='M '+nx[168]+' '+bb[168]+' L '+nx[168]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[98]+' '+mid+' L '+nx[98]+' '+bt[98];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[184]=paper.setFinish(); 
lineNodes[184]=[168,98]; 

paper.setStart(); 
mid=bb[168]+(bt[98]-bb[168])/2; 
hleft = nx[185]; 
hright = nx[168]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[185]+' '+mid+' L '+nx[185]+' '+bt[185];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[185]=paper.setFinish(); 
lineNodes[185]=[168,185]; 

paper.setStart(); 
mid=bb[168]+(bt[98]-bb[168])/2; 
hleft = nx[150]; 
hright = nx[168]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[150]+' '+mid+' L '+nx[150]+' '+bt[150];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[186]=paper.setFinish(); 
lineNodes[186]=[168,150]; 

paper.setStart(); 
s1='M '+nx[170]+' '+bb[170]+' L '+nx[170]+' '+ny[236]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[187]=paper.setFinish(); 
lineNodes[187]=[170,236]; 

paper.setStart(); 
s1='M '+nx[171]+' '+bb[171]+' L '+nx[171]+' '+ny[228]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[188]=paper.setFinish(); 
lineNodes[188]=[171,228]; 

paper.setStart(); 
s1='M '+nx[172]+' '+bb[172]+' L '+nx[172]+' '+bt[141]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[189]=paper.setFinish(); 
lineNodes[189]=[172,141] ; 

paper.setStart(); 
s1='M '+nx[173]+' '+bb[173]+' L '+nx[173]+' '+bt[144]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[190]=paper.setFinish(); 
lineNodes[190]=[173,144] ; 

paper.setStart(); 
s1='M '+nx[174]+' '+bb[174]+' L '+nx[174]+' '+bt[172]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[191]=paper.setFinish(); 
lineNodes[191]=[174,172] ; 

paper.setStart(); 
s1='M '+nx[176]+' '+bb[176]+' L '+nx[176]+' '+bt[115]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[192]=paper.setFinish(); 
lineNodes[192]=[176,115] ; 

paper.setStart(); 
s1='M '+nx[177]+' '+bb[177]+' L '+nx[177]+' '+bt[120]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[193]=paper.setFinish(); 
lineNodes[193]=[177,120] ; 

paper.setStart(); 
mid=bb[179]+(bt[25]-bb[179])/2; 
hleft = nx[50]; 
hright = nx[179]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[179]+' '+bb[179]+' L '+nx[179]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[50]+' '+mid+' L '+nx[50]+' '+bt[50];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[194]=paper.setFinish(); 
lineNodes[194]=[179,50]; 

paper.setStart(); 
mid=bb[179]+(bt[25]-bb[179])/2; 
hleft = nx[25]; 
hright = nx[179]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[25]+' '+mid+' L '+nx[25]+' '+bt[25];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[195]=paper.setFinish(); 
lineNodes[195]=[179,25]; 

paper.setStart(); 
s1='M '+nx[180]+' '+bb[180]+' L '+nx[180]+' '+bt[71]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[196]=paper.setFinish(); 
lineNodes[196]=[180,71] ; 

paper.setStart(); 
s1='M '+nx[182]+' '+bb[182]+' L '+nx[182]+' '+bt[6]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[197]=paper.setFinish(); 
lineNodes[197]=[182,6] ; 

paper.setStart(); 
mid=bb[183]+(bt[175]-bb[183])/2; 
hleft = nx[69]; 
hright = nx[183]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[183]+' '+bb[183]+' L '+nx[183]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[69]+' '+mid+' L '+nx[69]+' '+bt[69];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[198]=paper.setFinish(); 
lineNodes[198]=[183,69]; 

paper.setStart(); 
mid=bb[183]+(bt[175]-bb[183])/2; 
hleft = nx[175]; 
hright = nx[183]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[175]+' '+mid+' L '+nx[175]+' '+bt[175];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[199]=paper.setFinish(); 
lineNodes[199]=[183,175]; 

paper.setStart(); 
s1='M '+nx[184]+' '+bb[184]+' L '+nx[184]+' '+ny[230]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[200]=paper.setFinish(); 
lineNodes[200]=[184,230]; 

paper.setStart(); 
s1='M '+nx[185]+' '+bb[185]+' L '+nx[185]+' '+bt[205]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[201]=paper.setFinish(); 
lineNodes[201]=[185,205] ; 

paper.setStart(); 
s1='M '+nx[186]+' '+bb[186]+' L '+nx[186]+' '+bt[20]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[202]=paper.setFinish(); 
lineNodes[202]=[186,20] ; 

paper.setStart(); 
s1='M '+nx[187]+' '+bb[187]+' L '+nx[187]+' '+bt[37]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[203]=paper.setFinish(); 
lineNodes[203]=[187,37] ; 

paper.setStart(); 
s1='M '+nx[188]+' '+bb[188]+' L '+nx[188]+' '+ny[238]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[188]+' '+ny[238]+' L '+nx[216]+' '+ny[238]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[204]=paper.setFinish(); 
lineNodes[204]=[188,238]; 

paper.setStart(); 
s1='M '+nx[189]+' '+bb[189]+' L '+nx[189]+' '+bt[54]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[205]=paper.setFinish(); 
lineNodes[205]=[189,54] ; 

paper.setStart(); 
mid=bb[190]+(bt[212]-bb[190])/2; 
hleft = nx[122]; 
hright = nx[190]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[190]+' '+bb[190]+' L '+nx[190]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[122]+' '+mid+' L '+nx[122]+' '+bt[122];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[206]=paper.setFinish(); 
lineNodes[206]=[190,122]; 

paper.setStart(); 
mid=bb[190]+(bt[212]-bb[190])/2; 
s3='M '+nx[67]+' '+mid+' L '+nx[67]+' '+bt[67];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[207]=paper.setFinish(); 
lineNodes[207]=[190,67]; 

paper.setStart(); 
mid=bb[190]+(bt[212]-bb[190])/2; 
hleft = nx[212]; 
hright = nx[190]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[212]+' '+mid+' L '+nx[212]+' '+bt[212];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[208]=paper.setFinish(); 
lineNodes[208]=[190,212]; 

paper.setStart(); 
mid=bb[190]+(bt[212]-bb[190])/2; 
s3='M '+nx[127]+' '+mid+' L '+nx[127]+' '+bt[127];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[209]=paper.setFinish(); 
lineNodes[209]=[190,127]; 

paper.setStart(); 
mid=bb[190]+(bt[212]-bb[190])/2; 
s3='M '+nx[171]+' '+mid+' L '+nx[171]+' '+bt[171];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[210]=paper.setFinish(); 
lineNodes[210]=[190,171]; 

paper.setStart(); 
s1='M '+nx[191]+' '+bb[191]+' L '+nx[191]+' '+bt[55]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[211]=paper.setFinish(); 
lineNodes[211]=[191,55] ; 

paper.setStart(); 
s1='M '+nx[192]+' '+bb[192]+' L '+nx[192]+' '+ny[229]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[212]=paper.setFinish(); 
lineNodes[212]=[192,229]; 

paper.setStart(); 
s1='M '+nx[193]+' '+bb[193]+' L '+nx[193]+' '+bt[169]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[213]=paper.setFinish(); 
lineNodes[213]=[193,169] ; 

paper.setStart(); 
s1='M '+nx[194]+' '+bb[194]+' L '+nx[194]+' '+ny[233]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[194]+' '+ny[233]+' L '+nx[156]+' '+ny[233]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[214]=paper.setFinish(); 
lineNodes[214]=[194,233]; 

paper.setStart(); 
mid=bb[195]+(bt[138]-bb[195])/2; 
hleft = nx[167]; 
hright = nx[195]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[195]+' '+bb[195]+' L '+nx[195]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[167]+' '+mid+' L '+nx[167]+' '+bt[167];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[215]=paper.setFinish(); 
lineNodes[215]=[195,167]; 

paper.setStart(); 
mid=bb[195]+(bt[138]-bb[195])/2; 
hleft = nx[138]; 
hright = nx[195]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[138]+' '+mid+' L '+nx[138]+' '+bt[138];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[216]=paper.setFinish(); 
lineNodes[216]=[195,138]; 

paper.setStart(); 
s1='M '+nx[196]+' '+bb[196]+' L '+nx[196]+' '+bt[33]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[217]=paper.setFinish(); 
lineNodes[217]=[196,33] ; 

paper.setStart(); 
s1='M '+nx[197]+' '+bb[197]+' L '+nx[197]+' '+bt[11]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[218]=paper.setFinish(); 
lineNodes[218]=[197,11] ; 

paper.setStart(); 
s1='M '+nx[199]+' '+bb[199]+' L '+nx[199]+' '+bt[220]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[219]=paper.setFinish(); 
lineNodes[219]=[199,220] ; 

paper.setStart(); 
s1='M '+nx[200]+' '+bb[200]+' L '+nx[200]+' '+bt[183]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[220]=paper.setFinish(); 
lineNodes[220]=[200,183] ; 

paper.setStart(); 
s1='M '+nx[202]+' '+bb[202]+' L '+nx[202]+' '+bt[168]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[221]=paper.setFinish(); 
lineNodes[221]=[202,168] ; 

paper.setStart(); 
s1='M '+nx[203]+' '+bb[203]+' L '+nx[203]+' '+bt[66]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[222]=paper.setFinish(); 
lineNodes[222]=[203,66] ; 

paper.setStart(); 
s1='M '+nx[206]+' '+bb[206]+' L '+nx[206]+' '+bt[191]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[223]=paper.setFinish(); 
lineNodes[223]=[206,191] ; 

paper.setStart(); 
s1='M '+nx[207]+' '+bb[207]+' L '+nx[207]+' '+bt[56]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[224]=paper.setFinish(); 
lineNodes[224]=[207,56] ; 

paper.setStart(); 
s1='M '+nx[208]+' '+bb[208]+' L '+nx[208]+' '+bt[22]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[225]=paper.setFinish(); 
lineNodes[225]=[208,22] ; 

paper.setStart(); 
mid=bb[209]+(bt[30]-bb[209])/2; 
hleft = nx[181]; 
hright = nx[209]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[209]+' '+bb[209]+' L '+nx[209]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[181]+' '+mid+' L '+nx[181]+' '+bt[181];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[226]=paper.setFinish(); 
lineNodes[226]=[209,181]; 

paper.setStart(); 
mid=bb[209]+(bt[30]-bb[209])/2; 
hleft = nx[164]; 
hright = nx[209]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[164]+' '+mid+' L '+nx[164]+' '+bt[164];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[227]=paper.setFinish(); 
lineNodes[227]=[209,164]; 

paper.setStart(); 
mid=bb[209]+(bt[30]-bb[209])/2; 
s3='M '+nx[30]+' '+mid+' L '+nx[30]+' '+bt[30];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[228]=paper.setFinish(); 
lineNodes[228]=[209,30]; 

paper.setStart(); 
s1='M '+nx[210]+' '+bb[210]+' L '+nx[210]+' '+bt[7]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[229]=paper.setFinish(); 
lineNodes[229]=[210,7] ; 

paper.setStart(); 
mid=bb[211]+(bt[196]-bb[211])/2; 
hleft = nx[196]; 
hright = nx[211]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[211]+' '+bb[211]+' L '+nx[211]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[196]+' '+mid+' L '+nx[196]+' '+bt[196];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[230]=paper.setFinish(); 
lineNodes[230]=[211,196]; 

paper.setStart(); 
mid=bb[211]+(bt[196]-bb[211])/2; 
hleft = nx[74]; 
hright = nx[211]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[74]+' '+mid+' L '+nx[74]+' '+bt[74];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[231]=paper.setFinish(); 
lineNodes[231]=[211,74]; 

paper.setStart(); 
s1='M '+nx[212]+' '+bb[212]+' L '+nx[212]+' '+ny[228]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[212]+' '+ny[228]+' L '+nx[0]+' '+ny[228]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[232]=paper.setFinish(); 
lineNodes[232]=[212,228]; 

paper.setStart(); 
s1='M '+nx[213]+' '+bb[213]+' L '+nx[213]+' '+bt[100]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[233]=paper.setFinish(); 
lineNodes[233]=[213,100] ; 

paper.setStart(); 
s1='M '+nx[215]+' '+bb[215]+' L '+nx[215]+' '+ny[236]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[215]+' '+ny[236]+' L '+nx[36]+' '+ny[236]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[234]=paper.setFinish(); 
lineNodes[234]=[215,236]; 

paper.setStart(); 
s1='M '+nx[216]+' '+bb[216]+' L '+nx[216]+' '+ny[238]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[235]=paper.setFinish(); 
lineNodes[235]=[216,238]; 

paper.setStart(); 
s1='M '+nx[219]+' '+bb[219]+' L '+nx[219]+' '+bt[147]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[236]=paper.setFinish(); 
lineNodes[236]=[219,147] ; 

paper.setStart(); 
mid=bb[221]+(bt[36]-bb[221])/2; 
s2='M '+nx[221]+' '+bb[221]+' L '+nx[221]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[48]+' '+mid+' L '+nx[48]+' '+bt[48];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[237]=paper.setFinish(); 
lineNodes[237]=[221,48]; 

paper.setStart(); 
mid=bb[221]+(bt[36]-bb[221])/2; 
hleft = nx[36]; 
hright = nx[221]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[36]+' '+mid+' L '+nx[36]+' '+bt[36];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[238]=paper.setFinish(); 
lineNodes[238]=[221,36]; 

paper.setStart(); 
mid=bb[221]+(bt[36]-bb[221])/2; 
s3='M '+nx[170]+' '+mid+' L '+nx[170]+' '+bt[170];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[239]=paper.setFinish(); 
lineNodes[239]=[221,170]; 

paper.setStart(); 
mid=bb[221]+(bt[36]-bb[221])/2; 
hleft = nx[215]; 
hright = nx[221]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[215]+' '+mid+' L '+nx[215]+' '+bt[215];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[240]=paper.setFinish(); 
lineNodes[240]=[221,215]; 

paper.setStart(); 
s1='M '+nx[224]+' '+bb[224]+' L '+nx[224]+' '+ny[231]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[241]=paper.setFinish(); 
lineNodes[241]=[224,231]; 

paper.setStart(); 
s1='M '+nx[225]+' '+bb[225]+' L '+nx[225]+' '+bt[43]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[242]=paper.setFinish(); 
lineNodes[242]=[225,43] ; 

paper.setStart(); 
s1='M '+nx[227]+' '+bb[227]+' L '+nx[227]+' '+bt[195]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[243]=paper.setFinish(); 
lineNodes[243]=[227,195] ; 

paper.setStart(); 
mid=bb[228]+(bt[182]-bb[228])/2; 
hleft = nx[95]; 
hright = nx[228]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[228]+' '+bb[228]+' L '+nx[228]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[95]+' '+mid+' L '+nx[95]+' '+bt[95];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[244]=paper.setFinish(); 
lineNodes[244]=[228,95]; 

paper.setStart(); 
mid=bb[228]+(bt[182]-bb[228])/2; 
hleft = nx[182]; 
hright = nx[228]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[182]+' '+mid+' L '+nx[182]+' '+bt[182];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[245]=paper.setFinish(); 
lineNodes[245]=[228,182]; 

paper.setStart(); 
s1='M '+nx[229]+' '+bb[229]+' L '+nx[229]+' '+bt[29]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[246]=paper.setFinish(); 
lineNodes[246]=[229,29] ; 

paper.setStart(); 
s1='M '+nx[230]+' '+bb[230]+' L '+nx[230]+' '+bt[96]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[247]=paper.setFinish(); 
lineNodes[247]=[230,96] ; 

paper.setStart(); 
s1='M '+nx[231]+' '+bb[231]+' L '+nx[231]+' '+bt[24]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[248]=paper.setFinish(); 
lineNodes[248]=[231,24] ; 

paper.setStart(); 
s1='M '+nx[232]+' '+bb[232]+' L '+nx[232]+' '+bt[143]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[249]=paper.setFinish(); 
lineNodes[249]=[232,143] ; 

paper.setStart(); 
mid=bb[233]+(bt[82]-bb[233])/2; 
hleft = nx[47]; 
hright = nx[233]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[233]+' '+bb[233]+' L '+nx[233]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[47]+' '+mid+' L '+nx[47]+' '+bt[47];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[250]=paper.setFinish(); 
lineNodes[250]=[233,47]; 

paper.setStart(); 
mid=bb[233]+(bt[82]-bb[233])/2; 
hleft = nx[82]; 
hright = nx[233]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[82]+' '+mid+' L '+nx[82]+' '+bt[82];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[251]=paper.setFinish(); 
lineNodes[251]=[233,82]; 

paper.setStart(); 
s1='M '+nx[234]+' '+bb[234]+' L '+nx[234]+' '+bt[105]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[252]=paper.setFinish(); 
lineNodes[252]=[234,105] ; 

paper.setStart(); 
s1='M '+nx[235]+' '+bb[235]+' L '+nx[235]+' '+bt[59]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[253]=paper.setFinish(); 
lineNodes[253]=[235,59] ; 

paper.setStart(); 
mid=bb[236]+(bt[203]-bb[236])/2; 
hleft = nx[203]; 
hright = nx[236]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[236]+' '+bb[236]+' L '+nx[236]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[203]+' '+mid+' L '+nx[203]+' '+bt[203];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[254]=paper.setFinish(); 
lineNodes[254]=[236,203]; 

paper.setStart(); 
mid=bb[236]+(bt[203]-bb[236])/2; 
hleft = nx[211]; 
hright = nx[236]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[211]+' '+mid+' L '+nx[211]+' '+bt[211];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[255]=paper.setFinish(); 
lineNodes[255]=[236,211]; 

paper.setStart(); 
mid=bb[237]+(bt[121]-bb[237])/2; 
hleft = nx[160]; 
hright = nx[237]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[237]+' '+bb[237]+' L '+nx[237]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[160]+' '+mid+' L '+nx[160]+' '+bt[160];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[256]=paper.setFinish(); 
lineNodes[256]=[237,160]; 

paper.setStart(); 
mid=bb[237]+(bt[121]-bb[237])/2; 
hleft = nx[121]; 
hright = nx[237]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[121]+' '+mid+' L '+nx[121]+' '+bt[121];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[257]=paper.setFinish(); 
lineNodes[257]=[237,121]; 

paper.setStart(); 
s1='M '+nx[238]+' '+bb[238]+' L '+nx[238]+' '+bt[35]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[258]=paper.setFinish(); 
lineNodes[258]=[238,35] ; 

paper.setStart(); 
s1='M '+nx[239]+' '+bb[239]+' L '+nx[239]+' '+bt[3]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[259]=paper.setFinish(); 
lineNodes[259]=[239,3] ; 

nlines = 260;
}