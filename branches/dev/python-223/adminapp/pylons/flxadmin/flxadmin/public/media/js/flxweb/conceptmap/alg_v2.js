function initMap() { 

// Set size parameters 
mapWidth = 4473; 
mapHeight = 8366; 
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
rootx = 2284; 
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

nnodes = 227; 
njunc = 21; 

nx[0]=2511;
ny[0]=5020;
nx[1]=1674;
ny[1]=1338;
nx[2]=2061;
ny[2]=6496;
nx[3]=3958;
ny[3]=7389;
nx[4]=1681;
ny[4]=2154;
nx[5]=1600;
ny[5]=4081;
nx[6]=3563;
ny[6]=7540;
nx[7]=1477;
ny[7]=3729;
nx[8]=3956;
ny[8]=7272;
nx[9]=748;
ny[9]=4300;
nx[10]=2295;
ny[10]=408;
nx[11]=3244;
ny[11]=5699;
nx[12]=3362;
ny[12]=2953;
nx[13]=3360;
ny[13]=2849;
nx[14]=3597;
ny[14]=6234;
nx[15]=1503;
ny[15]=4802;
nx[16]=2768;
ny[16]=6407;
nx[17]=1821;
ny[17]=2839;
nx[18]=2114;
ny[18]=6109;
nx[19]=2531;
ny[19]=5832;
nx[20]=2904;
ny[20]=901;
nx[21]=2162;
ny[21]=2230;
nx[22]=2993;
ny[22]=7535;
nx[23]=3190;
ny[23]=8158;
nx[24]=1248;
ny[24]=2370;
nx[25]=1303;
ny[25]=4795;
nx[26]=2396;
ny[26]=284;
nx[27]=3265;
ny[27]=6810;
nx[28]=1600;
ny[28]=3978;
nx[29]=2605;
ny[29]=6093;
nx[30]=3599;
ny[30]=6318;
nx[31]=2991;
ny[31]=1357;
nx[32]=2892;
ny[32]=5329;
nx[33]=2064;
ny[33]=847;
nx[34]=200;
ny[34]=4649;
nx[35]=1818;
ny[35]=3277;
nx[36]=1603;
ny[36]=2371;
nx[37]=3256;
ny[37]=3661;
nx[38]=2015;
ny[38]=4926;
nx[39]=3794;
ny[39]=7648;
nx[40]=314;
ny[40]=4794;
nx[41]=1596;
ny[41]=3518;
nx[42]=2991;
ny[42]=7647;
nx[43]=3124;
ny[43]=1703;
nx[44]=3292;
ny[44]=5998;
nx[45]=2366;
ny[45]=2105;
nx[46]=2528;
ny[46]=5712;
nx[47]=2062;
ny[47]=666;
nx[48]=2046;
ny[48]=2720;
nx[49]=1596;
ny[49]=3627;
nx[50]=2442;
ny[50]=7728;
nx[51]=3027;
ny[51]=5698;
nx[52]=2467;
ny[52]=2849;
nx[53]=2295;
ny[53]=508;
nx[54]=3218;
ny[54]=6427;
nx[55]=2227;
ny[55]=6372;
nx[56]=2492;
ny[56]=511;
nx[57]=3478;
ny[57]=6120;
nx[58]=1821;
ny[58]=3086;
nx[59]=2444;
ny[59]=7521;
nx[60]=3266;
ny[60]=7029;
nx[61]=2860;
ny[61]=1705;
nx[62]=3467;
ny[62]=6692;
nx[63]=3135;
ny[63]=2962;
nx[64]=2291;
ny[64]=4411;
nx[65]=3022;
ny[65]=1010;
nx[66]=2063;
ny[66]=756;
nx[67]=1895;
ny[67]=2608;
nx[68]=3365;
ny[68]=3049;
nx[69]=3914;
ny[69]=7905;
nx[70]=2548;
ny[70]=7838;
nx[71]=2362;
ny[71]=5021;
nx[72]=2231;
ny[72]=5996;
nx[73]=2903;
ny[73]=773;
nx[74]=3140;
ny[74]=5580;
nx[75]=2291;
ny[75]=4701;
nx[76]=2362;
ny[76]=4908;
nx[77]=3126;
ny[77]=6552;
nx[78]=3264;
ny[78]=6696;
nx[79]=3007;
ny[79]=2156;
nx[80]=2681;
ny[80]=4409;
nx[81]=1598;
ny[81]=3871;
nx[82]=2761;
ny[82]=6091;
nx[83]=2284;
ny[83]=100;
nx[84]=2556;
ny[84]=1006;
nx[85]=1821;
ny[85]=2987;
nx[86]=2658;
ny[86]=769;
nx[87]=2830;
ny[87]=2625;
nx[88]=2671;
ny[88]=1127;
nx[89]=1681;
ny[89]=2254;
nx[90]=1680;
ny[90]=1954;
nx[91]=2442;
ny[91]=4544;
nx[92]=2632;
ny[92]=4550;
nx[93]=2139;
ny[93]=4548;
nx[94]=2444;
ny[94]=7405;
nx[95]=2770;
ny[95]=7634;
nx[96]=2447;
ny[96]=897;
nx[97]=2765;
ny[97]=665;
nx[98]=3880;
ny[98]=7537;
nx[99]=1104;
ny[99]=4794;
nx[100]=1643;
ny[100]=2839;
nx[101]=2879;
ny[101]=4917;
nx[102]=2067;
ny[102]=1143;
nx[103]=2771;
ny[103]=7729;
nx[104]=3507;
ny[104]=3658;
nx[105]=2558;
ny[105]=2232;
nx[106]=2993;
ny[106]=1453;
nx[107]=1726;
ny[107]=2725;
nx[108]=3318;
ny[108]=8266;
nx[109]=1104;
ny[109]=4653;
nx[110]=1665;
ny[110]=4797;
nx[111]=2063;
ny[111]=945;
nx[112]=1932;
ny[112]=2368;
nx[113]=3175;
ny[113]=7530;
nx[114]=1680;
ny[114]=1805;
nx[115]=476;
ny[115]=4796;
nx[116]=1745;
ny[116]=4652;
nx[117]=3379;
ny[117]=3412;
nx[118]=2784;
ny[118]=5721;
nx[119]=4072;
ny[119]=7535;
nx[120]=3566;
ny[120]=7659;
nx[121]=2669;
ny[121]=5463;
nx[122]=1720;
ny[122]=3733;
nx[123]=2046;
ny[123]=2840;
nx[124]=2483;
ny[124]=4286;
nx[125]=2791;
ny[125]=1008;
nx[126]=2948;
ny[126]=2849;
nx[127]=751;
ny[127]=4507;
nx[128]=3064;
ny[128]=8264;
nx[129]=2379;
ny[129]=6496;
nx[130]=3113;
ny[130]=6218;
nx[131]=1819;
ny[131]=3186;
nx[132]=2887;
ny[132]=5111;
nx[133]=2114;
ny[133]=6256;
nx[134]=1422;
ny[134]=2370;
nx[135]=2066;
ny[135]=1044;
nx[136]=2787;
ny[136]=5829;
nx[137]=2680;
ny[137]=5990;
nx[138]=2763;
ny[138]=6199;
nx[139]=2757;
ny[139]=2966;
nx[140]=3386;
ny[140]=6239;
nx[141]=3106;
ny[141]=1561;
nx[142]=2354;
ny[142]=6113;
nx[143]=1596;
ny[143]=3403;
nx[144]=2227;
ny[144]=6496;
nx[145]=1804;
ny[145]=1568;
nx[146]=3002;
ny[146]=1953;
nx[147]=2834;
ny[147]=2739;
nx[148]=3001;
ny[148]=1845;
nx[149]=3266;
ny[149]=6919;
nx[150]=1539;
ny[150]=1569;
nx[151]=2039;
ny[151]=3407;
nx[152]=3087;
ny[152]=7398;
nx[153]=2770;
ny[153]=7536;
nx[154]=3010;
ny[154]=2252;
nx[155]=2527;
ny[155]=5588;
nx[156]=3801;
ny[156]=7773;
nx[157]=2366;
ny[157]=2231;
nx[158]=3040;
ny[158]=6696;
nx[159]=1993;
ny[159]=4544;
nx[160]=1832;
ny[160]=4806;
nx[161]=2217;
ny[161]=5024;
nx[162]=2948;
ny[162]=2957;
nx[163]=638;
ny[163]=4796;
nx[164]=2783;
ny[164]=5593;
nx[165]=3375;
ny[165]=3282;
nx[166]=2325;
ny[166]=7837;
nx[167]=1920;
ny[167]=1809;
nx[168]=1481;
ny[168]=1805;
nx[169]=2774;
ny[169]=7272;
nx[170]=3370;
ny[170]=3155;
nx[171]=2885;
ny[171]=5013;
nx[172]=2286;
ny[172]=179;
nx[173]=3383;
ny[173]=3534;
nx[174]=3974;
ny[174]=7649;
nx[175]=3216;
ny[175]=6336;
nx[176]=2291;
ny[176]=4549;
nx[177]=2695;
ny[177]=2849;
nx[178]=751;
ny[178]=4648;
nx[179]=1768;
ny[179]=2367;
nx[180]=2323;
ny[180]=1000;
nx[181]=3137;
ny[181]=5468;
nx[182]=2529;
ny[182]=6497;
nx[183]=1680;
ny[183]=1701;
nx[184]=2120;
ny[184]=509;
nx[185]=2013;
ny[185]=4808;
nx[186]=2884;
ny[186]=1563;
nx[187]=3352;
ny[187]=7535;
nx[188]=4273;
ny[188]=7538;
nx[189]=878;
ny[189]=4792;
nx[190]=748;
ny[190]=4400;
nx[191]=3190;
ny[191]=8048;
nx[192]=2812;
ny[192]=6693;
nx[193]=2766;
ny[193]=6301;
nx[194]=1856;
ny[194]=6503;
nx[195]=3019;
ny[195]=6336;
nx[196]=3111;
ny[196]=6109;
nx[197]=2768;
ny[197]=6527;
nx[198]=2890;
ny[198]=5210;
nx[199]=3269;
ny[199]=7157;
nx[200]=4016;
ny[200]=7769;
nx[201]=2184;
ny[201]=289;
nx[202]=1672;
ny[202]=1439;
nx[203]=2111;
ny[203]=2369;
nx[204]=475;
ny[204]=4652;
nx[205]=2444;
ny[205]=7628;
nx[206]=3189;
ny[206]=7969;
nx[207]=1827;
ny[207]=4163;
nx[208]=1680;
ny[208]=1641;
nx[209]=2291;
ny[209]=4630;
nx[210]=2228;
ny[210]=6198;
nx[211]=1680;
ny[211]=1873;
nx[212]=3913;
ny[212]=7835;
nx[213]=2993;
ny[213]=1623;
nx[214]=3125;
ny[214]=6485;
nx[215]=1821;
ny[215]=2922;
nx[216]=1597;
ny[216]=3789;
nx[217]=2355;
ny[217]=1199;
nx[218]=3894;
ny[218]=7700;
nx[219]=2614;
ny[219]=4775;
nx[220]=2671;
ny[220]=1067;
nx[221]=2295;
ny[221]=568;
nx[222]=3000;
ny[222]=1776;
nx[223]=2680;
ny[223]=5895;
nx[224]=2293;
ny[224]=340;
nx[225]=2366;
ny[225]=2021;
nx[226]=2390;
ny[226]=2434;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[161, 76, 71]; 
members[1]=[217, 202, 31]; 
members[2]=[129, 194, 144, 182, 55]; 
members[3]=[98, 6, 8, 119, 188]; 
members[4]=[89, 90, 225]; 
members[5]=[28, 207]; 
members[6]=[98, 3, 119, 120, 188]; 
members[7]=[216, 49, 122]; 
members[8]=[169, 3, 199]; 
members[9]=[124, 190, 207]; 
members[10]=[56, 184, 224, 53]; 
members[11]=[51, 74]; 
members[12]=[68, 13]; 
members[13]=[12, 177, 147, 52, 126]; 
members[14]=[57, 140, 30]; 
members[15]=[160, 185, 116, 110]; 
members[16]=[193, 197]; 
members[17]=[107, 100, 215]; 
members[18]=[72, 210, 133, 142]; 
members[19]=[46, 223]; 
members[20]=[96, 65, 125, 86]; 
members[21]=[105, 45, 157]; 
members[22]=[42, 113, 152, 153, 187]; 
members[23]=[128, 108, 191]; 
members[24]=[226, 36, 134, 203, 112, 179, 89]; 
members[25]=[99, 109, 189]; 
members[26]=[224, 201, 172]; 
members[27]=[149, 78]; 
members[28]=[81, 5]; 
members[29]=[137, 82]; 
members[30]=[14]; 
members[31]=[217, 106, 1]; 
members[32]=[121, 181, 198]; 
members[33]=[66, 111]; 
members[34]=[204, 109, 178, 116, 127]; 
members[35]=[143, 131, 151]; 
members[36]=[226, 134, 203, 112, 179, 24, 89]; 
members[37]=[104, 219, 173]; 
members[38]=[185]; 
members[39]=[218, 98, 174]; 
members[40]=[115, 163, 204]; 
members[41]=[49, 143]; 
members[42]=[22]; 
members[43]=[213, 222, 61]; 
members[44]=[196, 72, 137, 57, 223]; 
members[45]=[105, 225, 157, 21]; 
members[46]=[19, 155]; 
members[47]=[97, 66, 221]; 
members[48]=[107, 67, 123]; 
members[49]=[41, 122, 7]; 
members[50]=[70, 166, 205]; 
members[51]=[74, 11]; 
members[52]=[177, 147, 13, 126]; 
members[53]=[56, 184, 10, 221]; 
members[54]=[214, 175]; 
members[55]=[129, 2, 194, 144, 210, 182]; 
members[56]=[184, 10, 221, 53]; 
members[57]=[44, 140, 196, 14]; 
members[58]=[131, 85]; 
members[59]=[205, 94]; 
members[60]=[149, 199]; 
members[61]=[43, 213, 222]; 
members[62]=[192, 78, 77, 158]; 
members[63]=[162, 139, 126]; 
members[64]=[80, 92, 176, 91, 124, 93, 159]; 
members[65]=[20, 220, 125]; 
members[66]=[33, 47]; 
members[67]=[48, 226, 107, 87]; 
members[68]=[170, 12]; 
members[69]=[212, 206]; 
members[70]=[50, 166, 206]; 
members[71]=[0, 161, 76]; 
members[72]=[137, 44, 142, 18, 223]; 
members[73]=[97, 86]; 
members[74]=[51, 11, 181]; 
members[75]=[209, 219]; 
members[76]=[0, 161, 101, 71, 219]; 
members[77]=[192, 78, 158, 214, 62]; 
members[78]=[192, 77, 158, 27, 62]; 
members[79]=[225, 154, 146]; 
members[80]=[64, 124]; 
members[81]=[216, 28]; 
members[82]=[137, 138, 29]; 
members[83]=[172]; 
members[84]=[96, 180, 220]; 
members[85]=[58, 215]; 
members[86]=[96, 97, 20, 73]; 
members[87]=[67, 226, 147]; 
members[88]=[217, 220]; 
members[89]=[36, 134, 203, 112, 179, 24, 4]; 
members[90]=[225, 211, 4]; 
members[91]=[64, 176, 209, 92, 93, 159]; 
members[92]=[64, 176, 209, 91, 93, 159]; 
members[93]=[64, 176, 209, 91, 92, 159]; 
members[94]=[152, 169, 59]; 
members[95]=[153, 103]; 
members[96]=[84, 180, 86, 20]; 
members[97]=[73, 47, 221, 86]; 
members[98]=[3, 6, 39, 174, 119, 188]; 
members[99]=[25, 109, 189]; 
members[100]=[17, 107, 215]; 
members[101]=[171, 76, 219]; 
members[102]=[217, 135]; 
members[103]=[95]; 
members[104]=[173, 37]; 
members[105]=[21, 45, 157]; 
members[106]=[186, 141, 31]; 
members[107]=[17, 67, 100, 48]; 
members[108]=[128, 23]; 
members[109]=[34, 99, 204, 178, 116, 25, 189, 127]; 
members[110]=[160, 185, 116, 15]; 
members[111]=[33, 135]; 
members[112]=[226, 36, 134, 203, 179, 24, 89]; 
members[113]=[152, 187, 22, 153]; 
members[114]=[168, 211, 167, 183]; 
members[115]=[40, 163, 204]; 
members[116]=[160, 34, 204, 109, 110, 15, 178, 185, 127]; 
members[117]=[173, 165]; 
members[118]=[136, 164]; 
members[119]=[98, 3, 188, 6]; 
members[120]=[6]; 
members[121]=[32, 155, 164, 181]; 
members[122]=[216, 49, 7]; 
members[123]=[48, 215]; 
members[124]=[64, 80, 9, 207]; 
members[125]=[20, 220, 65]; 
members[126]=[162, 139, 13, 177, 147, 52, 63]; 
members[127]=[34, 204, 109, 178, 116, 190]; 
members[128]=[108, 23]; 
members[129]=[2, 194, 144, 182, 55]; 
members[130]=[195, 196, 175]; 
members[131]=[58, 35]; 
members[132]=[171, 198]; 
members[133]=[210, 18]; 
members[134]=[226, 36, 203, 112, 179, 24, 89]; 
members[135]=[102, 111]; 
members[136]=[118, 223]; 
members[137]=[72, 44, 82, 29, 223]; 
members[138]=[193, 82]; 
members[139]=[162, 126, 63]; 
members[140]=[57, 14]; 
members[141]=[106, 186, 213]; 
members[142]=[72, 210, 18]; 
members[143]=[41, 35, 151]; 
members[144]=[129, 2, 194, 182, 55]; 
members[145]=[208, 202, 150]; 
members[146]=[225, 148, 79]; 
members[147]=[13, 177, 52, 87, 126]; 
members[148]=[146, 222]; 
members[149]=[27, 60]; 
members[150]=[208, 145, 202]; 
members[151]=[35, 143, 207]; 
members[152]=[169, 113, 22, 153, 187, 94]; 
members[153]=[113, 22, 152, 187, 95]; 
members[154]=[226, 79]; 
members[155]=[121, 164, 46]; 
members[156]=[200, 218, 212]; 
members[157]=[105, 21, 45]; 
members[158]=[192, 78, 77, 62]; 
members[159]=[64, 176, 209, 91, 92, 93]; 
members[160]=[185, 116, 110, 15]; 
members[161]=[0, 76, 71]; 
members[162]=[139, 126, 63]; 
members[163]=[40, 115, 204]; 
members[164]=[121, 155, 118]; 
members[165]=[170, 117]; 
members[166]=[50, 70, 206]; 
members[167]=[168, 114, 211, 183]; 
members[168]=[114, 211, 167, 183]; 
members[169]=[152, 8, 94, 199]; 
members[170]=[68, 165]; 
members[171]=[132, 101]; 
members[172]=[201, 26, 83]; 
members[173]=[104, 37, 117]; 
members[174]=[218, 98, 39]; 
members[175]=[130, 195, 54]; 
members[176]=[64, 209, 91, 92, 93, 159]; 
members[177]=[147, 52, 13, 126]; 
members[178]=[34, 204, 109, 116, 127]; 
members[179]=[226, 36, 134, 203, 112, 24, 89]; 
members[180]=[96, 220, 84]; 
members[181]=[32, 121, 74]; 
members[182]=[129, 2, 194, 144, 55]; 
members[183]=[168, 208, 114, 167]; 
members[184]=[56, 10, 221, 53]; 
members[185]=[160, 38, 110, 15, 116]; 
members[186]=[106, 213, 141]; 
members[187]=[152, 113, 22, 153]; 
members[188]=[98, 3, 6, 119]; 
members[189]=[25, 99, 109]; 
members[190]=[9, 127]; 
members[191]=[206, 23]; 
members[192]=[78, 77, 62, 158]; 
members[193]=[16, 138]; 
members[194]=[129, 2, 144, 182, 55]; 
members[195]=[130, 214, 175]; 
members[196]=[57, 130, 44]; 
members[197]=[16]; 
members[198]=[32, 132]; 
members[199]=[8, 169, 60]; 
members[200]=[156, 218, 212]; 
members[201]=[224, 26, 172]; 
members[202]=[145, 150, 1]; 
members[203]=[226, 36, 134, 112, 179, 24, 89]; 
members[204]=[34, 163, 40, 109, 178, 115, 116, 127]; 
members[205]=[50, 59]; 
members[206]=[166, 70, 69, 191]; 
members[207]=[9, 151, 124, 5]; 
members[208]=[145, 150, 183]; 
members[209]=[75, 176, 91, 92, 93, 159]; 
members[210]=[18, 133, 142, 55]; 
members[211]=[168, 90, 114, 167]; 
members[212]=[200, 156, 69]; 
members[213]=[43, 186, 61, 141]; 
members[214]=[195, 77, 54]; 
members[215]=[17, 123, 100, 85]; 
members[216]=[81, 122, 7]; 
members[217]=[88, 1, 102, 31]; 
members[218]=[200, 156, 174, 39]; 
members[219]=[75, 76, 101, 37]; 
members[220]=[65, 180, 88, 84, 125]; 
members[221]=[97, 47, 184, 53, 56]; 
members[222]=[43, 148, 61]; 
members[223]=[72, 137, 44, 136, 19]; 
members[224]=[201, 10, 26]; 
members[225]=[4, 45, 79, 146, 90]; 
members[226]=[67, 36, 134, 203, 112, 179, 87, 24, 154]; 

return members[i]; 
} 

function drawMap(sfac) { 

var rect; 
var tbox; 

paper.clear(); 

t[0]=paper.text(nx[0],ny[0]-10,'Linear Programming').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[0]});
t[0].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear-Programming/#Linear Programming", target: "_top",title:"Click to jump to concept"});
}); 
t[0].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[0].getBBox(); 
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
yicon = bb[0]-25; 
xicon2 = nx[0]+-40; 
xicon3 = nx[0]+-10; 
xicon4 = nx[0]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Programming/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Programming/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Programming/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[0], bt[0], br[0]-bl[0], bb[0]-bt[0], 10*sfac[0]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[0]=paper.setFinish(); 
t[0].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[1]=paper.text(nx[1],ny[1],'Linear Equations').attr({fill:"#666666","font-size": 14*sfac[1]});
tBox=t[1].getBBox(); 
bt[1]=ny[1]-(tBox.height/2+10*sfac[1]);
bb[1]=ny[1]+(tBox.height/2+10*sfac[1]);
bl[1]=nx[1]-(tBox.width/2+10*sfac[1]);
br[1]=nx[1]+(tBox.width/2+10*sfac[1]);
paper.setStart(); 
rect=paper.rect(bl[1], bt[1], br[1]-bl[1], bb[1]-bt[1], 10*sfac[1]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[1]=paper.setFinish(); 

t[2]=paper.text(nx[2],ny[2],'Fractional Equations').attr({fill:"#666666","font-size": 14*sfac[2]});
tBox=t[2].getBBox(); 
bt[2]=ny[2]-(tBox.height/2+10*sfac[2]);
bb[2]=ny[2]+(tBox.height/2+10*sfac[2]);
bl[2]=nx[2]-(tBox.width/2+10*sfac[2]);
br[2]=nx[2]+(tBox.width/2+10*sfac[2]);
paper.setStart(); 
rect=paper.rect(bl[2], bt[2], br[2]-bl[2], bb[2]-bt[2], 10*sfac[2]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[2]=paper.setFinish(); 

t[3]=paper.text(nx[3],ny[3],'Exponent Properties with\nVariable Expressions').attr({fill:"#666666","font-size": 14*sfac[3]});
tBox=t[3].getBBox(); 
bt[3]=ny[3]-(tBox.height/2+10*sfac[3]);
bb[3]=ny[3]+(tBox.height/2+10*sfac[3]);
bl[3]=nx[3]-(tBox.width/2+10*sfac[3]);
br[3]=nx[3]+(tBox.width/2+10*sfac[3]);
paper.setStart(); 
rect=paper.rect(bl[3], bt[3], br[3]-bl[3], bb[3]-bt[3], 10*sfac[3]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[3]=paper.setFinish(); 

t[4]=paper.text(nx[4],ny[4]-10,'Problem-Solving Applications\nusing Linear Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[4]});
t[4].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Applications-of-One-Step-Equations/#Problem-Solving Applications using Linear Equations", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Applications-of-One-Step-Equations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-of-One-Step-Equations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[4], bt[4], br[4]-bl[4], bb[4]-bt[4], 10*sfac[4]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[4]=paper.setFinish(); 
t[4].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[5]=paper.text(nx[5],ny[5]-10,'Solve Real-World Problems that\nhave Linear Relationships').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[5]});
t[5].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Problem-Solving-with-Linear-Graphs/#Solve Real-World Problems that have Linear Relationships", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Problem-Solving-with-Linear-Graphs/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Problem-Solving-with-Linear-Graphs/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Problem-Solving-with-Linear-Graphs/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[5], bt[5], br[5]-bl[5], bb[5]-bt[5], 10*sfac[5]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[5]=paper.setFinish(); 
t[5].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[6]=paper.text(nx[6],ny[6]-10,'Scientific Notation with\nInteger Exponents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[6]});
t[6].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Scientific-Notation/#Scientific Notation with Integer Exponents", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Scientific-Notation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Scientific-Notation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[6], bt[6], br[6]-bl[6], bb[6]-bt[6], 10*sfac[6]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[6]=paper.setFinish(); 
t[6].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[7]=paper.text(nx[7],ny[7]-10,'Finding Intercepts by Substituting').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[7]});
t[7].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Intercepts-by-Substitution/#Finding Intercepts by Substituting", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Intercepts-by-Substitution/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Intercepts-by-Substitution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Intercepts-by-Substitution/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[7], bt[7], br[7]-bl[7], bb[7]-bt[7], 10*sfac[7]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[7]=paper.setFinish(); 
t[7].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[8]=paper.text(nx[8],ny[8],'Exponential Properties\nand Functions').attr({fill:"#666666","font-size": 14*sfac[8]});
tBox=t[8].getBBox(); 
bt[8]=ny[8]-(tBox.height/2+10*sfac[8]);
bb[8]=ny[8]+(tBox.height/2+10*sfac[8]);
bl[8]=nx[8]-(tBox.width/2+10*sfac[8]);
br[8]=nx[8]+(tBox.width/2+10*sfac[8]);
paper.setStart(); 
rect=paper.rect(bl[8], bt[8], br[8]-bl[8], bb[8]-bt[8], 10*sfac[8]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[8]=paper.setFinish(); 

t[9]=paper.text(nx[9],ny[9]-10,'The Slope of a Line').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[9]});
t[9].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Slope/#The Slope of a Line", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Slope/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Slope/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Slope/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[9], bt[9], br[9]-bl[9], bb[9]-bt[9], 10*sfac[9]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[9]=paper.setFinish(); 
t[9].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[10]=paper.text(nx[10],ny[10]-10,'Order of Operations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[10]});
t[10].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/PEMDAS/#Order of Operations", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/PEMDAS/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/PEMDAS/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/PEMDAS/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[10], bt[10], br[10]-bl[10], bb[10]-bt[10], 10*sfac[10]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[10]=paper.setFinish(); 
t[10].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[11]=paper.text(nx[11],ny[11]-10,'Fractional Exponents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[11]});
t[11].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Fractional-Exponents/#Fractional Exponents", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Fractional-Exponents/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Fractional-Exponents/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Fractional-Exponents/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[11]=paper.setFinish(); 
t[11].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[12]=paper.text(nx[12],ny[12]-10,'Monomials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[12]});
t[12].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Monomial-Factors-of-Polynomials/#Monomials", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Monomial-Factors-of-Polynomials/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Monomial-Factors-of-Polynomials/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Monomial-Factors-of-Polynomials/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[12], bt[12], br[12]-bl[12], bb[12]-bt[12], 10*sfac[12]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[12]=paper.setFinish(); 
t[12].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[13]=paper.text(nx[13],ny[13]-10,'Factoring').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[13]});
t[13].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Factoring-Completely/#Factoring", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Factoring-Completely/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Factoring-Completely/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Factoring-Completely/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[13], bt[13], br[13]-bl[13], bb[13]-bt[13], 10*sfac[13]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[13]=paper.setFinish(); 
t[13].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[14]=paper.text(nx[14],ny[14]-10,'The Distance Formula').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[14]});
t[14].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Distance-Formula/#The Distance Formula", target: "_top",title:"Click to jump to concept"});
}); 
t[14].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[14].getBBox(); 
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
yicon = bb[14]-25; 
xicon2 = nx[14]+-40; 
xicon3 = nx[14]+-10; 
xicon4 = nx[14]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Distance-Formula/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Distance-Formula/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Distance-Formula/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[14], bt[14], br[14]-bl[14], bb[14]-bt[14], 10*sfac[14]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[14]=paper.setFinish(); 
t[14].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[15]=paper.text(nx[15],ny[15]-10,'Line Equations from a\nSlope and a Point').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[15]});
t[15].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Write-an-Equation-Given-the-Slope-and-a-Point/#Line Equations from a Slope and a Point", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Write-an-Equation-Given-the-Slope-and-a-Point/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Write-an-Equation-Given-the-Slope-and-a-Point/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Write-an-Equation-Given-the-Slope-and-a-Point/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[15], bt[15], br[15]-bl[15], bb[15]-bt[15], 10*sfac[15]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[15]=paper.setFinish(); 
t[15].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[16]=paper.text(nx[16],ny[16]-10,'Graphs of Inverse\nVariation Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[16]});
t[16].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-of-Rational-Functions/#Graphs of Inverse Variation Functions", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Rational-Functions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Rational-Functions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Rational-Functions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[16], bt[16], br[16]-bl[16], bb[16]-bt[16], 10*sfac[16]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[16]=paper.setFinish(); 
t[16].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[17]=paper.text(nx[17],ny[17]-10,'Writing a Function Rule').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[17]});
t[17].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Functions-that-Describe-Situations/#Writing a Function Rule", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Functions-that-Describe-Situations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[17], bt[17], br[17]-bl[17], bb[17]-bt[17], 10*sfac[17]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[17]=paper.setFinish(); 
t[17].toFront(); 
exicon.toFront(); 

t[18]=paper.text(nx[18],ny[18],'Open Sentences Involving\nFractions or Percents').attr({fill:"#666666","font-size": 14*sfac[18]});
tBox=t[18].getBBox(); 
bt[18]=ny[18]-(tBox.height/2+10*sfac[18]);
bb[18]=ny[18]+(tBox.height/2+10*sfac[18]);
bl[18]=nx[18]-(tBox.width/2+10*sfac[18]);
br[18]=nx[18]+(tBox.width/2+10*sfac[18]);
paper.setStart(); 
rect=paper.rect(bl[18], bt[18], br[18]-bl[18], bb[18]-bt[18], 10*sfac[18]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[18]=paper.setFinish(); 

t[19]=paper.text(nx[19],ny[19]-10,'Division of Rational Expressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[19]});
t[19].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Division-of-Rational-Expressions/#Division of Rational Expressions", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Division-of-Rational-Expressions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Division-of-Rational-Expressions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Division-of-Rational-Expressions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[19], bt[19], br[19]-bl[19], bb[19]-bt[19], 10*sfac[19]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[19]=paper.setFinish(); 
t[19].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[20]=paper.text(nx[20],ny[20],'Opposites and Absolute\nValues').attr({fill:"#666666","font-size": 14*sfac[20]});
tBox=t[20].getBBox(); 
bt[20]=ny[20]-(tBox.height/2+10*sfac[20]);
bb[20]=ny[20]+(tBox.height/2+10*sfac[20]);
bl[20]=nx[20]-(tBox.width/2+10*sfac[20]);
br[20]=nx[20]+(tBox.width/2+10*sfac[20]);
paper.setStart(); 
rect=paper.rect(bl[20], bt[20], br[20]-bl[20], bb[20]-bt[20], 10*sfac[20]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[20]=paper.setFinish(); 

t[21]=paper.text(nx[21],ny[21]-10,'Solving Absolute Value\nEquations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[21]});
t[21].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Absolute-Value-Equations/#Solving Absolute Value Equations", target: "_top",title:"Click to jump to concept"});
}); 
t[21].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[21].getBBox(); 
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
yicon = bb[21]-25; 
xicon2 = nx[21]+-40; 
xicon3 = nx[21]+-10; 
xicon4 = nx[21]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Absolute-Value-Equations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Absolute-Value-Equations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[21], bt[21], br[21]-bl[21], bb[21]-bt[21], 10*sfac[21]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[21]=paper.setFinish(); 
t[21].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[22]=paper.text(nx[22],ny[22],'Quadratic Functions and\nEquations').attr({fill:"#666666","font-size": 14*sfac[22]});
tBox=t[22].getBBox(); 
bt[22]=ny[22]-(tBox.height/2+10*sfac[22]);
bb[22]=ny[22]+(tBox.height/2+10*sfac[22]);
bl[22]=nx[22]-(tBox.width/2+10*sfac[22]);
br[22]=nx[22]+(tBox.width/2+10*sfac[22]);
paper.setStart(); 
rect=paper.rect(bl[22], bt[22], br[22]-bl[22], bb[22]-bt[22], 10*sfac[22]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[22]=paper.setFinish(); 

t[23]=paper.text(nx[23],ny[23]-10,'Choice of a Function\nModel').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[23]});
t[23].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Applications-of-Function-Models/#Choice of a Function Model", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-of-Function-Models/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-of-Function-Models/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[23], bt[23], br[23]-bl[23], bb[23]-bt[23], 10*sfac[23]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[23]=paper.setFinish(); 
t[23].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[24]=paper.text(nx[24],ny[24]-10,'Make a Table; Look\nfor a Pattern').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[24]});
t[24].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Trends-in-Data/#Make a Table; Look for a Pattern", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Trends-in-Data/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Trends-in-Data/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[24], bt[24], br[24]-bl[24], bb[24]-bt[24], 10*sfac[24]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[24]=paper.setFinish(); 
t[24].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[25]=paper.text(nx[25],ny[25]-10,'Families of Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[25]});
t[25].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Families-of-Lines/#Families of Lines", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Families-of-Lines/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Families-of-Lines/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[25], bt[25], br[25]-bl[25], bb[25]-bt[25], 10*sfac[25]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[25]=paper.setFinish(); 
t[25].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[26]=paper.text(nx[26],ny[26],'Sets and Symbols').attr({fill:"#666666","font-size": 14*sfac[26]});
tBox=t[26].getBBox(); 
bt[26]=ny[26]-(tBox.height/2+10*sfac[26]);
bb[26]=ny[26]+(tBox.height/2+10*sfac[26]);
bl[26]=nx[26]-(tBox.width/2+10*sfac[26]);
br[26]=nx[26]+(tBox.width/2+10*sfac[26]);
paper.setStart(); 
rect=paper.rect(bl[26], bt[26], br[26]-bl[26], bb[26]-bt[26], 10*sfac[26]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[26]=paper.setFinish(); 

t[27]=paper.text(nx[27],ny[27]-10,'Sums and Differences of Radicals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[27]});
t[27].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Radicals/#Sums and Differences of Radicals", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Radicals/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Radicals/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Radicals/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[27], bt[27], br[27]-bl[27], bb[27]-bt[27], 10*sfac[27]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[27]=paper.setFinish(); 
t[27].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[28]=paper.text(nx[28],ny[28]-10,'Analyze Linear Graphs to Answer\nReal-World Problems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[28]});
t[28].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Applications-of-Linear-Graphs/#Analyze Linear Graphs to Answer Real-World Problems", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Applications-of-Linear-Graphs/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-of-Linear-Graphs/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[28], bt[28], br[28]-bl[28], bb[28]-bt[28], 10*sfac[28]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[28]=paper.setFinish(); 
t[28].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[29]=paper.text(nx[29],ny[29]-10,'Ratio and Proportion').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[29]});
t[29].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Rational-Equations-Using-Proportions/#Ratio and Proportion", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Rational-Equations-Using-Proportions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Rational-Equations-Using-Proportions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[29], bt[29], br[29]-bl[29], bb[29]-bt[29], 10*sfac[29]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[29]=paper.setFinish(); 
t[29].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[30]=paper.text(nx[30],ny[30]-10,'The Distance Formula').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[30]});
t[30].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Distance-Formula/#The Distance Formula", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Distance-Formula/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Distance-Formula/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Distance-Formula/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[30], bt[30], br[30]-bl[30], bb[30]-bt[30], 10*sfac[30]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[30]=paper.setFinish(); 
t[30].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[31]=paper.text(nx[31],ny[31],'Linear Inequalities').attr({fill:"#666666","font-size": 14*sfac[31]});
tBox=t[31].getBBox(); 
bt[31]=ny[31]-(tBox.height/2+10*sfac[31]);
bb[31]=ny[31]+(tBox.height/2+10*sfac[31]);
bl[31]=nx[31]-(tBox.width/2+10*sfac[31]);
br[31]=nx[31]+(tBox.width/2+10*sfac[31]);
paper.setStart(); 
rect=paper.rect(bl[31], bt[31], br[31]-bl[31], bb[31]-bt[31], 10*sfac[31]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[31]=paper.setFinish(); 

t[32]=paper.text(nx[32],ny[32]-10,'Dividing Polynomials-Rational\nExpressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[32]});
t[32].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Excluded-Values-for-Rational-Expressions/#Dividing Polynomials-Rational Expressions", target: "_top",title:"Click to jump to concept"});
}); 
t[32].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[32].getBBox(); 
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
yicon = bb[32]-25; 
xicon2 = nx[32]+-40; 
xicon3 = nx[32]+-10; 
xicon4 = nx[32]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Excluded-Values-for-Rational-Expressions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Excluded-Values-for-Rational-Expressions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Excluded-Values-for-Rational-Expressions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[32], bt[32], br[32]-bl[32], bb[32]-bt[32], 10*sfac[32]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[32]=paper.setFinish(); 
t[32].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[33]=paper.text(nx[33],ny[33]-10,'Evaluating Expressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[33]});
t[33].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Expressions-with-One-or-More-Variables/#Evaluating Expressions", target: "_top",title:"Click to jump to concept"});
}); 
t[33].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[33].getBBox(); 
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
yicon = bb[33]-25; 
xicon2 = nx[33]+-40; 
xicon3 = nx[33]+-10; 
xicon4 = nx[33]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Expressions-with-One-or-More-Variables/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Expressions-with-One-or-More-Variables/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Expressions-with-One-or-More-Variables/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[33], bt[33], br[33]-bl[33], bb[33]-bt[33], 10*sfac[33]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[33]=paper.setFinish(); 
t[33].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[34]=paper.text(nx[34],ny[34]-10,'Graph Lines Using\nSlope-Intercept Form').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[34]});
t[34].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-Using-Slope-Intercept-Form/#Graph Lines Using Slope-Intercept Form", target: "_top",title:"Click to jump to concept"});
}); 
t[34].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[34].getBBox(); 
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
yicon = bb[34]-25; 
xicon2 = nx[34]+-40; 
xicon3 = nx[34]+-10; 
xicon4 = nx[34]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-Using-Slope-Intercept-Form/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-Using-Slope-Intercept-Form/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-Using-Slope-Intercept-Form/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[34], bt[34], br[34]-bl[34], bb[34]-bt[34], 10*sfac[34]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[34]=paper.setFinish(); 
t[34].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[35]=paper.text(nx[35],ny[35]-10,'Rewrite Equations as Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[35]});
t[35].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Function-Notation-and-Linear-Functions/#Rewrite Equations as Functions", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Function-Notation-and-Linear-Functions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Function-Notation-and-Linear-Functions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Function-Notation-and-Linear-Functions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[35], bt[35], br[35]-bl[35], bb[35]-bt[35], 10*sfac[35]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[35]=paper.setFinish(); 
t[35].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[36]=paper.text(nx[36],ny[36]-10,'Scale and Indirect\nMeasurement').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[36]});
t[36].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Scale-and-Indirect-Measurement-Applications/#Scale and Indirect Measurement", target: "_top",title:"Click to jump to concept"});
}); 
t[36].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[36].getBBox(); 
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
yicon = bb[36]-25; 
xicon2 = nx[36]+-40; 
xicon3 = nx[36]+-10; 
xicon4 = nx[36]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Scale-and-Indirect-Measurement-Applications/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Scale-and-Indirect-Measurement-Applications/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[36], bt[36], br[36]-bl[36], bb[36]-bt[36], 10*sfac[36]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[36]=paper.setFinish(); 
t[36].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[37]=paper.text(nx[37],ny[37]-10,'Solving Polynomial Equations\nby Factoring').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[37]});
t[37].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Zero-Product-Principle/#Solving Polynomial Equations by Factoring", target: "_top",title:"Click to jump to concept"});
}); 
t[37].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[37].getBBox(); 
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
yicon = bb[37]-25; 
xicon2 = nx[37]+-40; 
xicon3 = nx[37]+-10; 
xicon4 = nx[37]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Zero-Product-Principle/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Zero-Product-Principle/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Zero-Product-Principle/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[37]=paper.setFinish(); 
t[37].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[38]=paper.text(nx[38],ny[38]-10,'Use Linear Modeling Tools to\nSolve Real-World Problems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[38]});
t[38].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Problem-Solving-with-Linear-Models/#Use Linear Modeling Tools to Solve Real-World Problems", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Problem-Solving-with-Linear-Models/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[38], bt[38], br[38]-bl[38], bb[38]-bt[38], 10*sfac[38]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[38]=paper.setFinish(); 
t[38].toFront(); 
vidicon.toFront(); 

t[39]=paper.text(nx[39],ny[39]-10,'Exponential Growth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[39]});
t[39].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exponential-Growth/#Exponential Growth", target: "_top",title:"Click to jump to concept"});
}); 
t[39].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[39].getBBox(); 
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
yicon = bb[39]-25; 
xicon2 = nx[39]+-40; 
xicon3 = nx[39]+-10; 
xicon4 = nx[39]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Growth/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Growth/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Growth/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 
t[39].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[40]=paper.text(nx[40],ny[40],'Standard Form\nof Linear Equations').attr({fill:"#666666","font-size": 14*sfac[40]});
tBox=t[40].getBBox(); 
bt[40]=ny[40]-(tBox.height/2+10*sfac[40]);
bb[40]=ny[40]+(tBox.height/2+10*sfac[40]);
bl[40]=nx[40]-(tBox.width/2+10*sfac[40]);
br[40]=nx[40]+(tBox.width/2+10*sfac[40]);
paper.setStart(); 
rect=paper.rect(bl[40], bt[40], br[40]-bl[40], bb[40]-bt[40], 10*sfac[40]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[40]=paper.setFinish(); 

t[41]=paper.text(nx[41],ny[41]-10,'Graph Linear Equations\nUsing Coordinate Pairs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[41]});
t[41].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-of-Linear-Equations/#Graph Linear Equations Using Coordinate Pairs", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Linear-Equations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Linear-Equations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Linear-Equations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[41], bt[41], br[41]-bl[41], bb[41]-bt[41], 10*sfac[41]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[41]=paper.setFinish(); 
t[41].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[42]=paper.text(nx[42],ny[42]-10,'Using Graphs to Solve\nQuadratic Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[42]});
t[42].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Use-Graphs-to-Solve-Quadratic-Equations/#Using Graphs to Solve Quadratic Equations", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Use-Graphs-to-Solve-Quadratic-Equations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Use-Graphs-to-Solve-Quadratic-Equations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Use-Graphs-to-Solve-Quadratic-Equations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[42], bt[42], br[42]-bl[42], bb[42]-bt[42], 10*sfac[42]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[42]=paper.setFinish(); 
t[42].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[43]=paper.text(nx[43],ny[43]-10,'One-Step Inequalities Transformed\nby Addition/Subtraction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[43]});
t[43].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inequalities-with-Addition-and-Subtraction/#One-Step Inequalities Transformed by Addition/Subtraction", target: "_top",title:"Click to jump to concept"});
}); 
t[43].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[43].getBBox(); 
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
yicon = bb[43]-25; 
xicon2 = nx[43]+-40; 
xicon3 = nx[43]+-10; 
xicon4 = nx[43]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inequalities-with-Addition-and-Subtraction/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inequalities-with-Addition-and-Subtraction/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inequalities-with-Addition-and-Subtraction/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[43], bt[43], br[43]-bl[43], bb[43]-bt[43], 10*sfac[43]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[43]=paper.setFinish(); 
t[43].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[44]=paper.text(nx[44],ny[44]-10,'Irrational Numbers\nand Radicals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[44]});
t[44].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Square-Roots-and-Irrational-Numbers/#Irrational Numbers and Radicals", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Square-Roots-and-Irrational-Numbers/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Square-Roots-and-Irrational-Numbers/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Square-Roots-and-Irrational-Numbers/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[44], bt[44], br[44]-bl[44], bb[44]-bt[44], 10*sfac[44]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[44]=paper.setFinish(); 
t[44].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[45]=paper.text(nx[45],ny[45],'Absolute-Value Equations\nand Inequalities').attr({fill:"#666666","font-size": 14*sfac[45]});
tBox=t[45].getBBox(); 
bt[45]=ny[45]-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
paper.setStart(); 
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[45]=paper.setFinish(); 

t[46]=paper.text(nx[46],ny[46]-10,'Multiplication of Rational\nExpressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[46]});
t[46].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multiplication-of-Rational-Expressions/#Multiplication of Rational Expressions", target: "_top",title:"Click to jump to concept"});
}); 
t[46].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[46].getBBox(); 
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
yicon = bb[46]-25; 
xicon2 = nx[46]+-40; 
xicon3 = nx[46]+-10; 
xicon4 = nx[46]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplication-of-Rational-Expressions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplication-of-Rational-Expressions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplication-of-Rational-Expressions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[46], bt[46], br[46]-bl[46], bb[46]-bt[46], 10*sfac[46]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[46]=paper.setFinish(); 
t[46].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[47]=paper.text(nx[47],ny[47],'Definition of Variable').attr({fill:"#666666","font-size": 14*sfac[47]});
tBox=t[47].getBBox(); 
bt[47]=ny[47]-(tBox.height/2+10*sfac[47]);
bb[47]=ny[47]+(tBox.height/2+10*sfac[47]);
bl[47]=nx[47]-(tBox.width/2+10*sfac[47]);
br[47]=nx[47]+(tBox.width/2+10*sfac[47]);
paper.setStart(); 
rect=paper.rect(bl[47], bt[47], br[47]-bl[47], bb[47]-bt[47], 10*sfac[47]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[47]=paper.setFinish(); 

t[48]=paper.text(nx[48],ny[48]-10,'The Coordinate Plane').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[48]});
t[48].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-in-the-Coordinate-Plane/#The Coordinate Plane", target: "_top",title:"Click to jump to concept"});
}); 
t[48].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[48].getBBox(); 
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
yicon = bb[48]-25; 
xicon2 = nx[48]+-40; 
xicon3 = nx[48]+-10; 
xicon4 = nx[48]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-in-the-Coordinate-Plane/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-in-the-Coordinate-Plane/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-in-the-Coordinate-Plane/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[48], bt[48], br[48]-bl[48], bb[48]-bt[48], 10*sfac[48]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[48]=paper.setFinish(); 
t[48].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[49]=paper.text(nx[49],ny[49]-10,'Graphing Horizontal and Vertical\nLinear Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[49]});
t[49].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Horizontal-and-Vertical-Line-Graphs/#Graphing Horizontal and Vertical Linear Equations", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Horizontal-and-Vertical-Line-Graphs/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Horizontal-and-Vertical-Line-Graphs/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[49], bt[49], br[49]-bl[49], bb[49]-bt[49], 10*sfac[49]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[49]=paper.setFinish(); 
t[49].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[50]=paper.text(nx[50],ny[50],'The Discriminant').attr({fill:"#666666","font-size": 14*sfac[50]});
tBox=t[50].getBBox(); 
bt[50]=ny[50]-(tBox.height/2+10*sfac[50]);
bb[50]=ny[50]+(tBox.height/2+10*sfac[50]);
bl[50]=nx[50]-(tBox.width/2+10*sfac[50]);
br[50]=nx[50]+(tBox.width/2+10*sfac[50]);
paper.setStart(); 
rect=paper.rect(bl[50], bt[50], br[50]-bl[50], bb[50]-bt[50], 10*sfac[50]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[50]=paper.setFinish(); 

t[51]=paper.text(nx[51],ny[51]-10,'Zero and Negative Exponents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[51]});
t[51].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Zero-and-Negative-Exponents/#Zero and Negative Exponents", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Zero-and-Negative-Exponents/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Zero-and-Negative-Exponents/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Zero-and-Negative-Exponents/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[51], bt[51], br[51]-bl[51], bb[51]-bt[51], 10*sfac[51]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[51]=paper.setFinish(); 
t[51].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[52]=paper.text(nx[52],ny[52]-10,'Rewriting Polynomials in\nStandard Form').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[52]});
t[52].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Polynomials-in-Standard-Form/#Rewriting Polynomials in Standard Form", target: "_top",title:"Click to jump to concept"});
}); 
t[52].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[52].getBBox(); 
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
yicon = bb[52]-25; 
xicon2 = nx[52]+-40; 
xicon3 = nx[52]+-10; 
xicon4 = nx[52]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Polynomials-in-Standard-Form/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Polynomials-in-Standard-Form/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Polynomials-in-Standard-Form/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[52], bt[52], br[52]-bl[52], bb[52]-bt[52], 10*sfac[52]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[52]=paper.setFinish(); 
t[52].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[53]=paper.text(nx[53],ny[53],'Exponents').attr({fill:"#666666","font-size": 14*sfac[53]});
tBox=t[53].getBBox(); 
bt[53]=ny[53]-(tBox.height/2+10*sfac[53]);
bb[53]=ny[53]+(tBox.height/2+10*sfac[53]);
bl[53]=nx[53]-(tBox.width/2+10*sfac[53]);
br[53]=nx[53]+(tBox.width/2+10*sfac[53]);
paper.setStart(); 
rect=paper.rect(bl[53], bt[53], br[53]-bl[53], bb[53]-bt[53], 10*sfac[53]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[53]=paper.setFinish(); 

t[54]=paper.text(nx[54],ny[54],'Irrational Square Roots').attr({fill:"#666666","font-size": 14*sfac[54]});
tBox=t[54].getBBox(); 
bt[54]=ny[54]-(tBox.height/2+10*sfac[54]);
bb[54]=ny[54]+(tBox.height/2+10*sfac[54]);
bl[54]=nx[54]-(tBox.width/2+10*sfac[54]);
br[54]=nx[54]+(tBox.width/2+10*sfac[54]);
paper.setStart(); 
rect=paper.rect(bl[54], bt[54], br[54]-bl[54], bb[54]-bt[54], 10*sfac[54]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[54]=paper.setFinish(); 

t[55]=paper.text(nx[55],ny[55],'Rational Expressions in\nEquations and Problems').attr({fill:"#666666","font-size": 14*sfac[55]});
tBox=t[55].getBBox(); 
bt[55]=ny[55]-(tBox.height/2+10*sfac[55]);
bb[55]=ny[55]+(tBox.height/2+10*sfac[55]);
bl[55]=nx[55]-(tBox.width/2+10*sfac[55]);
br[55]=nx[55]+(tBox.width/2+10*sfac[55]);
paper.setStart(); 
rect=paper.rect(bl[55], bt[55], br[55]-bl[55], bb[55]-bt[55], 10*sfac[55]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[55]=paper.setFinish(); 

t[56]=paper.text(nx[56],ny[56]-10,'PEMDAS with Graphing Calculator').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[56]});
t[56].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Calculator-Use-with-Algebra-Expressions/#PEMDAS with Graphing Calculator", target: "_top",title:"Click to jump to concept"});
}); 
t[56].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[56].getBBox(); 
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
yicon = bb[56]-25; 
xicon2 = nx[56]+-40; 
xicon3 = nx[56]+-10; 
xicon4 = nx[56]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Calculator-Use-with-Algebra-Expressions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Calculator-Use-with-Algebra-Expressions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[56], bt[56], br[56]-bl[56], bb[56]-bt[56], 10*sfac[56]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[56]=paper.setFinish(); 
t[56].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[57]=paper.text(nx[57],ny[57]-10,'The Pythagorean Theorem\nfrom an Algebraic Perspective').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[57]});
t[57].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Pythagorean-Theorem-and-its-Converse/#The Pythagorean Theorem from an Algebraic Perspective", target: "_top",title:"Click to jump to concept"});
}); 
t[57].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[57].getBBox(); 
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
yicon = bb[57]-25; 
xicon2 = nx[57]+-40; 
xicon3 = nx[57]+-10; 
xicon4 = nx[57]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Pythagorean-Theorem-and-its-Converse/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Pythagorean-Theorem-and-its-Converse/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Pythagorean-Theorem-and-its-Converse/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[57], bt[57], br[57]-bl[57], bb[57]-bt[57], 10*sfac[57]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[57]=paper.setFinish(); 
t[57].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[58]=paper.text(nx[58],ny[58]-10,'Determine Whether a Graph\nRepresents a Function').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[58]});
t[58].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Vertical-Line-Test/#Determine Whether a Graph Represents a Function", target: "_top",title:"Click to jump to concept"});
}); 
t[58].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[58].getBBox(); 
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
yicon = bb[58]-25; 
xicon2 = nx[58]+-40; 
xicon3 = nx[58]+-10; 
xicon4 = nx[58]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Vertical-Line-Test/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Vertical-Line-Test/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Vertical-Line-Test/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[58], bt[58], br[58]-bl[58], bb[58]-bt[58], 10*sfac[58]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[58]=paper.setFinish(); 
t[58].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[59]=paper.text(nx[59],ny[59]-10,'Solving Quadratic Equations by\nCompleting the Square').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[59]});
t[59].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Completing-the-Square/#Solving Quadratic Equations by Completing the Square", target: "_top",title:"Click to jump to concept"});
}); 
t[59].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[59].getBBox(); 
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
yicon = bb[59]-25; 
xicon2 = nx[59]+-40; 
xicon3 = nx[59]+-10; 
xicon4 = nx[59]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Completing-the-Square/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Completing-the-Square/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Completing-the-Square/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[59], bt[59], br[59]-bl[59], bb[59]-bt[59], 10*sfac[59]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[59]=paper.setFinish(); 
t[59].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[60]=paper.text(nx[60],ny[60]-10,'Graphing Radical Functions\nand Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[60]});
t[60].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-of-Square-Root-Functions/#Graphing Radical Functions and Equations", target: "_top",title:"Click to jump to concept"});
}); 
t[60].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[60].getBBox(); 
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
yicon = bb[60]-25; 
xicon2 = nx[60]+-40; 
xicon3 = nx[60]+-10; 
xicon4 = nx[60]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Square-Root-Functions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Square-Root-Functions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Square-Root-Functions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[60], bt[60], br[60]-bl[60], bb[60]-bt[60], 10*sfac[60]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[60]=paper.setFinish(); 
t[60].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[61]=paper.text(nx[61],ny[61]-10,'One-Step Inequalities Transformed\nby Addition/Subtraction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[61]});
t[61].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inequalities-with-Addition-and-Subtraction/#One-Step Inequalities Transformed by Addition/Subtraction", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Inequalities-with-Addition-and-Subtraction/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inequalities-with-Addition-and-Subtraction/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inequalities-with-Addition-and-Subtraction/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[61], bt[61], br[61]-bl[61], bb[61]-bt[61], 10*sfac[61]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[61]=paper.setFinish(); 
t[61].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[62]=paper.text(nx[62],ny[62],'nth Roots').attr({fill:"#666666","font-size": 14*sfac[62]});
tBox=t[62].getBBox(); 
bt[62]=ny[62]-(tBox.height/2+10*sfac[62]);
bb[62]=ny[62]+(tBox.height/2+10*sfac[62]);
bl[62]=nx[62]-(tBox.width/2+10*sfac[62]);
br[62]=nx[62]+(tBox.width/2+10*sfac[62]);
paper.setStart(); 
rect=paper.rect(bl[62], bt[62], br[62]-bl[62], bb[62]-bt[62], 10*sfac[62]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[62]=paper.setFinish(); 

t[63]=paper.text(nx[63],ny[63],'Multiplying Binomials\nMentally').attr({fill:"#666666","font-size": 14*sfac[63]});
tBox=t[63].getBBox(); 
bt[63]=ny[63]-(tBox.height/2+10*sfac[63]);
bb[63]=ny[63]+(tBox.height/2+10*sfac[63]);
bl[63]=nx[63]-(tBox.width/2+10*sfac[63]);
br[63]=nx[63]+(tBox.width/2+10*sfac[63]);
paper.setStart(); 
rect=paper.rect(bl[63], bt[63], br[63]-bl[63], bb[63]-bt[63], 10*sfac[63]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[63]=paper.setFinish(); 

t[64]=paper.text(nx[64],ny[64],'Systems of Linear Equations\nin Two Variables').attr({fill:"#666666","font-size": 14*sfac[64]});
tBox=t[64].getBBox(); 
bt[64]=ny[64]-(tBox.height/2+10*sfac[64]);
bb[64]=ny[64]+(tBox.height/2+10*sfac[64]);
bl[64]=nx[64]-(tBox.width/2+10*sfac[64]);
br[64]=nx[64]+(tBox.width/2+10*sfac[64]);
paper.setStart(); 
rect=paper.rect(bl[64], bt[64], br[64]-bl[64], bb[64]-bt[64], 10*sfac[64]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[64]=paper.setFinish(); 

t[65]=paper.text(nx[65],ny[65]-10,'Absolute Value and Distance\non a Number Line').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[65]});
t[65].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Absolute-Value/#Absolute Value and Distance on a Number Line", target: "_top",title:"Click to jump to concept"});
}); 
t[65].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[65].getBBox(); 
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
yicon = bb[65]-25; 
xicon2 = nx[65]+-40; 
xicon3 = nx[65]+-10; 
xicon4 = nx[65]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Absolute-Value/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[65], bt[65], br[65]-bl[65], bb[65]-bt[65], 10*sfac[65]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[65]=paper.setFinish(); 
t[65].toFront(); 
exicon.toFront(); 

t[66]=paper.text(nx[66],ny[66],'Mathematical Expressions').attr({fill:"#666666","font-size": 14*sfac[66]});
tBox=t[66].getBBox(); 
bt[66]=ny[66]-(tBox.height/2+10*sfac[66]);
bb[66]=ny[66]+(tBox.height/2+10*sfac[66]);
bl[66]=nx[66]-(tBox.width/2+10*sfac[66]);
br[66]=nx[66]+(tBox.width/2+10*sfac[66]);
paper.setStart(); 
rect=paper.rect(bl[66], bt[66], br[66]-bl[66], bb[66]-bt[66], 10*sfac[66]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[66]=paper.setFinish(); 

t[67]=paper.text(nx[67],ny[67],'Graphs and Functions').attr({fill:"#666666","font-size": 14*sfac[67]});
tBox=t[67].getBBox(); 
bt[67]=ny[67]-(tBox.height/2+10*sfac[67]);
bb[67]=ny[67]+(tBox.height/2+10*sfac[67]);
bl[67]=nx[67]-(tBox.width/2+10*sfac[67]);
br[67]=nx[67]+(tBox.width/2+10*sfac[67]);
paper.setStart(); 
rect=paper.rect(bl[67], bt[67], br[67]-bl[67], bb[67]-bt[67], 10*sfac[67]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[67]=paper.setFinish(); 

t[68]=paper.text(nx[68],ny[68]-10,'Special Products of \nPolynomials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[68]});
t[68].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Special-Products-of-Polynomials/#Special Products of  Polynomials", target: "_top",title:"Click to jump to concept"});
}); 
t[68].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[68].getBBox(); 
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
yicon = bb[68]-25; 
xicon2 = nx[68]+-40; 
xicon3 = nx[68]+-10; 
xicon4 = nx[68]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Special-Products-of-Polynomials/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Special-Products-of-Polynomials/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Special-Products-of-Polynomials/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[68], bt[68], br[68]-bl[68], bb[68]-bt[68], 10*sfac[68]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[68]=paper.setFinish(); 
t[68].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[69]=paper.text(nx[69],ny[69],'Logarithms').attr({fill:"#666666","font-size": 14*sfac[69]});
tBox=t[69].getBBox(); 
bt[69]=ny[69]-(tBox.height/2+10*sfac[69]);
bb[69]=ny[69]+(tBox.height/2+10*sfac[69]);
bl[69]=nx[69]-(tBox.width/2+10*sfac[69]);
br[69]=nx[69]+(tBox.width/2+10*sfac[69]);
paper.setStart(); 
rect=paper.rect(bl[69], bt[69], br[69]-bl[69], bb[69]-bt[69], 10*sfac[69]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[69]=paper.setFinish(); 

t[70]=paper.text(nx[70],ny[70]-10,'Choose a Method for Solving\nQuadratic Problems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[70]});
t[70].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Comparing-Methods-for-Solving-Quadratics/#Choose a Method for Solving Quadratic Problems", target: "_top",title:"Click to jump to concept"});
}); 
t[70].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[70].getBBox(); 
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
yicon = bb[70]-25; 
xicon2 = nx[70]+-40; 
xicon3 = nx[70]+-10; 
xicon4 = nx[70]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Comparing-Methods-for-Solving-Quadratics/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Comparing-Methods-for-Solving-Quadratics/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[70], bt[70], br[70]-bl[70], bb[70]-bt[70], 10*sfac[70]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[70]=paper.setFinish(); 
t[70].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[71]=paper.text(nx[71],ny[71],'Digit Problems').attr({fill:"#666666","font-size": 14*sfac[71]});
tBox=t[71].getBBox(); 
bt[71]=ny[71]-(tBox.height/2+10*sfac[71]);
bb[71]=ny[71]+(tBox.height/2+10*sfac[71]);
bl[71]=nx[71]-(tBox.width/2+10*sfac[71]);
br[71]=nx[71]+(tBox.width/2+10*sfac[71]);
paper.setStart(); 
rect=paper.rect(bl[71], bt[71], br[71]-bl[71], bb[71]-bt[71], 10*sfac[71]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[71]=paper.setFinish(); 

t[72]=paper.text(nx[72],ny[72],'Rational Expressions in\nOpen Sentences').attr({fill:"#666666","font-size": 14*sfac[72]});
tBox=t[72].getBBox(); 
bt[72]=ny[72]-(tBox.height/2+10*sfac[72]);
bb[72]=ny[72]+(tBox.height/2+10*sfac[72]);
bl[72]=nx[72]-(tBox.width/2+10*sfac[72]);
br[72]=nx[72]+(tBox.width/2+10*sfac[72]);
paper.setStart(); 
rect=paper.rect(bl[72], bt[72], br[72]-bl[72], bb[72]-bt[72], 10*sfac[72]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[72]=paper.setFinish(); 

t[73]=paper.text(nx[73],ny[73]-10,'Real-World Problems\nUsing Multiplication').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[73]});
t[73].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mixed-Numbers-in-Applications/#Real-World Problems Using Multiplication", target: "_top",title:"Click to jump to concept"});
}); 
t[73].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[73].getBBox(); 
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
yicon = bb[73]-25; 
xicon2 = nx[73]+-40; 
xicon3 = nx[73]+-10; 
xicon4 = nx[73]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mixed-Numbers-in-Applications/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mixed-Numbers-in-Applications/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[73], bt[73], br[73]-bl[73], bb[73]-bt[73], 10*sfac[73]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[73]=paper.setFinish(); 
t[73].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[74]=paper.text(nx[74],ny[74],'Zero, Negative, and\nFractional Exponents').attr({fill:"#666666","font-size": 14*sfac[74]});
tBox=t[74].getBBox(); 
bt[74]=ny[74]-(tBox.height/2+10*sfac[74]);
bb[74]=ny[74]+(tBox.height/2+10*sfac[74]);
bl[74]=nx[74]-(tBox.width/2+10*sfac[74]);
br[74]=nx[74]+(tBox.width/2+10*sfac[74]);
paper.setStart(); 
rect=paper.rect(bl[74], bt[74], br[74]-bl[74], bb[74]-bt[74], 10*sfac[74]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[74]=paper.setFinish(); 

t[75]=paper.text(nx[75],ny[75],'Systems of Linear Equations\nin Three Variables').attr({fill:"#666666","font-size": 14*sfac[75]});
tBox=t[75].getBBox(); 
bt[75]=ny[75]-(tBox.height/2+10*sfac[75]);
bb[75]=ny[75]+(tBox.height/2+10*sfac[75]);
bl[75]=nx[75]-(tBox.width/2+10*sfac[75]);
br[75]=nx[75]+(tBox.width/2+10*sfac[75]);
paper.setStart(); 
rect=paper.rect(bl[75], bt[75], br[75]-bl[75], bb[75]-bt[75], 10*sfac[75]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[75]=paper.setFinish(); 

t[76]=paper.text(nx[76],ny[76]-10,'Problem-Solving Applications\nInvolving Systems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[76]});
t[76].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mixture-Problems/#Problem-Solving Applications Involving Systems", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Mixture-Problems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[76], bt[76], br[76]-bl[76], bb[76]-bt[76], 10*sfac[76]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[76]=paper.setFinish(); 
t[76].toFront(); 
exicon.toFront(); 

t[77]=paper.text(nx[77],ny[77]-10,'Working with Radicals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[77]});
t[77].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Expressions-with-Radicals/#Working with Radicals", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Expressions-with-Radicals/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[77], bt[77], br[77]-bl[77], bb[77]-bt[77], 10*sfac[77]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[77]=paper.setFinish(); 
t[77].toFront(); 
exicon.toFront(); 

t[78]=paper.text(nx[78],ny[78],'Sums and Products of\nExpressions Containing Radicals').attr({fill:"#666666","font-size": 14*sfac[78]});
tBox=t[78].getBBox(); 
bt[78]=ny[78]-(tBox.height/2+10*sfac[78]);
bb[78]=ny[78]+(tBox.height/2+10*sfac[78]);
bl[78]=nx[78]-(tBox.width/2+10*sfac[78]);
br[78]=nx[78]+(tBox.width/2+10*sfac[78]);
paper.setStart(); 
rect=paper.rect(bl[78], bt[78], br[78]-bl[78], bb[78]-bt[78], 10*sfac[78]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[78]=paper.setFinish(); 

t[79]=paper.text(nx[79],ny[79],'Union and Intersection\nof Sets').attr({fill:"#666666","font-size": 14*sfac[79]});
tBox=t[79].getBBox(); 
bt[79]=ny[79]-(tBox.height/2+10*sfac[79]);
bb[79]=ny[79]+(tBox.height/2+10*sfac[79]);
bl[79]=nx[79]-(tBox.width/2+10*sfac[79]);
br[79]=nx[79]+(tBox.width/2+10*sfac[79]);
paper.setStart(); 
rect=paper.rect(bl[79], bt[79], br[79]-bl[79], bb[79]-bt[79], 10*sfac[79]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[79]=paper.setFinish(); 

t[80]=paper.text(nx[80],ny[80],'Graphs of Systems of Linear\nInequalities in Two Variables').attr({fill:"#666666","font-size": 14*sfac[80]});
tBox=t[80].getBBox(); 
bt[80]=ny[80]-(tBox.height/2+10*sfac[80]);
bb[80]=ny[80]+(tBox.height/2+10*sfac[80]);
bl[80]=nx[80]-(tBox.width/2+10*sfac[80]);
br[80]=nx[80]+(tBox.width/2+10*sfac[80]);
paper.setStart(); 
rect=paper.rect(bl[80], bt[80], br[80]-bl[80], bb[80]-bt[80], 10*sfac[80]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[80]=paper.setFinish(); 

t[81]=paper.text(nx[81],ny[81]-10,'Make and Analyze Graphs\nof Linear Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[81]});
t[81].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-of-Linear-Functions/#Make and Analyze Graphs of Linear Functions", target: "_top",title:"Click to jump to concept"});
}); 
t[81].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[81].getBBox(); 
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
yicon = bb[81]-25; 
xicon2 = nx[81]+-40; 
xicon3 = nx[81]+-10; 
xicon4 = nx[81]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Linear-Functions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Linear-Functions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Linear-Functions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[81], bt[81], br[81]-bl[81], bb[81]-bt[81], 10*sfac[81]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[81]=paper.setFinish(); 
t[81].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[82]=paper.text(nx[82],ny[82]-10,'Direct Variation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[82]});
t[82].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Direct-Variation/#Direct Variation", target: "_top",title:"Click to jump to concept"});
}); 
t[82].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[82].getBBox(); 
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
yicon = bb[82]-25; 
xicon2 = nx[82]+-40; 
xicon3 = nx[82]+-10; 
xicon4 = nx[82]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Direct-Variation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Direct-Variation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Direct-Variation/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[82], bt[82], br[82]-bl[82], bb[82]-bt[82], 10*sfac[82]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[82]=paper.setFinish(); 
t[82].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[83]=paper.text(nx[83],ny[83],'Algebra').attr({fill:"#000000","font-size": 24*sfac[83]});
tBox=t[83].getBBox(); 
bt[83]=ny[83]-(tBox.height/2+10*sfac[83]);
bb[83]=ny[83]+(tBox.height/2+10*sfac[83]);
bl[83]=nx[83]-(tBox.width/2+10*sfac[83]);
br[83]=nx[83]+(tBox.width/2+10*sfac[83]);
paper.setStart(); 
rect=paper.rect(bl[83], bt[83], br[83]-bl[83], bb[83]-bt[83], 10*sfac[83]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[83]=paper.setFinish(); 

t[84]=paper.text(nx[84],ny[84]-10,'Identifying When to Use the\nDistributive Property').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[84]});
t[84].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/When-to-Use-the-Distributive-Property/#Identifying When to Use the Distributive Property", target: "_top",title:"Click to jump to concept"});
}); 
t[84].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[84].getBBox(); 
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
yicon = bb[84]-25; 
xicon2 = nx[84]+-40; 
xicon3 = nx[84]+-10; 
xicon4 = nx[84]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/When-to-Use-the-Distributive-Property/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/When-to-Use-the-Distributive-Property/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[84], bt[84], br[84]-bl[84], bb[84]-bt[84], 10*sfac[84]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[84]=paper.setFinish(); 
t[84].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[85]=paper.text(nx[85],ny[85],'Relations and Functions').attr({fill:"#666666","font-size": 14*sfac[85]});
tBox=t[85].getBBox(); 
bt[85]=ny[85]-(tBox.height/2+10*sfac[85]);
bb[85]=ny[85]+(tBox.height/2+10*sfac[85]);
bl[85]=nx[85]-(tBox.width/2+10*sfac[85]);
br[85]=nx[85]+(tBox.width/2+10*sfac[85]);
paper.setStart(); 
rect=paper.rect(bl[85], bt[85], br[85]-bl[85], bb[85]-bt[85], 10*sfac[85]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[85]=paper.setFinish(); 

t[86]=paper.text(nx[86],ny[86],'Axioms for Real Numbers').attr({fill:"#666666","font-size": 14*sfac[86]});
tBox=t[86].getBBox(); 
bt[86]=ny[86]-(tBox.height/2+10*sfac[86]);
bb[86]=ny[86]+(tBox.height/2+10*sfac[86]);
bl[86]=nx[86]-(tBox.width/2+10*sfac[86]);
br[86]=nx[86]+(tBox.width/2+10*sfac[86]);
paper.setStart(); 
rect=paper.rect(bl[86], bt[86], br[86]-bl[86], bb[86]-bt[86], 10*sfac[86]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[86]=paper.setFinish(); 

t[87]=paper.text(nx[87],ny[87],'Polynomials and Factoring').attr({fill:"#666666","font-size": 14*sfac[87]});
tBox=t[87].getBBox(); 
bt[87]=ny[87]-(tBox.height/2+10*sfac[87]);
bb[87]=ny[87]+(tBox.height/2+10*sfac[87]);
bl[87]=nx[87]-(tBox.width/2+10*sfac[87]);
br[87]=nx[87]+(tBox.width/2+10*sfac[87]);
paper.setStart(); 
rect=paper.rect(bl[87], bt[87], br[87]-bl[87], bb[87]-bt[87], 10*sfac[87]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[87]=paper.setFinish(); 

t[88]=paper.text(nx[88],ny[88],'Operations with Real\nNumbers').attr({fill:"#666666","font-size": 14*sfac[88]});
tBox=t[88].getBBox(); 
bt[88]=ny[88]-(tBox.height/2+10*sfac[88]);
bb[88]=ny[88]+(tBox.height/2+10*sfac[88]);
bl[88]=nx[88]-(tBox.width/2+10*sfac[88]);
br[88]=nx[88]+(tBox.width/2+10*sfac[88]);
paper.setStart(); 
rect=paper.rect(bl[88], bt[88], br[88]-bl[88], bb[88]-bt[88], 10*sfac[88]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[88]=paper.setFinish(); 

t[89]=paper.text(nx[89],ny[89]-10,'Step-by-Step Strategy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[89]});
t[89].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Problem-Solving-Models/#Step-by-Step Strategy", target: "_top",title:"Click to jump to concept"});
}); 
t[89].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[89].getBBox(); 
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
yicon = bb[89]-25; 
xicon2 = nx[89]+-40; 
xicon3 = nx[89]+-10; 
xicon4 = nx[89]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Problem-Solving-Models/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Problem-Solving-Models/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[89], bt[89], br[89]-bl[89], bb[89]-bt[89], 10*sfac[89]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[89]=paper.setFinish(); 
t[89].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[90]=paper.text(nx[90],ny[90]-10,'Equations with Variables\non Both Sides').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[90]});
t[90].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Equations-with-Variables-on-Both-Sides/#Equations with Variables on Both Sides", target: "_top",title:"Click to jump to concept"});
}); 
t[90].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[90].getBBox(); 
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
yicon = bb[90]-25; 
xicon2 = nx[90]+-40; 
xicon3 = nx[90]+-10; 
xicon4 = nx[90]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Equations-with-Variables-on-Both-Sides/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Equations-with-Variables-on-Both-Sides/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Equations-with-Variables-on-Both-Sides/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[90], bt[90], br[90]-bl[90], bb[90]-bt[90], 10*sfac[90]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[90]=paper.setFinish(); 
t[90].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[91]=paper.text(nx[91],ny[91]-10,'2-Variable Systems\nUsing Substitution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[91]});
t[91].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Systems-Using-Substitution/#2-Variable Systems Using Substitution", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Systems-Using-Substitution/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Systems-Using-Substitution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Systems-Using-Substitution/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[91], bt[91], br[91]-bl[91], bb[91]-bt[91], 10*sfac[91]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[91]=paper.setFinish(); 
t[91].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[92]=paper.text(nx[92],ny[92]-10,'Consistent and Inconsistent\n2-Variable Systems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[92]});
t[92].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Consistent-and-Inconsistent-Linear-Systems/#Consistent and Inconsistent 2-Variable Systems", target: "_top",title:"Click to jump to concept"});
}); 
t[92].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[92].getBBox(); 
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
yicon = bb[92]-25; 
xicon2 = nx[92]+-40; 
xicon3 = nx[92]+-10; 
xicon4 = nx[92]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Consistent-and-Inconsistent-Linear-Systems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Consistent-and-Inconsistent-Linear-Systems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Consistent-and-Inconsistent-Linear-Systems/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[92], bt[92], br[92]-bl[92], bb[92]-bt[92], 10*sfac[92]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[92]=paper.setFinish(); 
t[92].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[93]=paper.text(nx[93],ny[93]-10,'2-Variable Systems\nUsing Addition\nor Subtraction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[93]});
t[93].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear-Systems-with-Addition-or-Subtraction/#2-Variable Systems Using Addition or Subtraction", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Linear-Systems-with-Addition-or-Subtraction/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Systems-with-Addition-or-Subtraction/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Systems-with-Addition-or-Subtraction/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[93], bt[93], br[93]-bl[93], bb[93]-bt[93], 10*sfac[93]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[93]=paper.setFinish(); 
t[93].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[94]=paper.text(nx[94],ny[94]-10,'Solving Quadratic Equations by\nFinding Square Roots').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[94]});
t[94].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Use-Square-Roots-to-Solve-Quadratic-Equations/#Solving Quadratic Equations by Finding Square Roots", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Use-Square-Roots-to-Solve-Quadratic-Equations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Use-Square-Roots-to-Solve-Quadratic-Equations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Use-Square-Roots-to-Solve-Quadratic-Equations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[94], bt[94], br[94]-bl[94], bb[94]-bt[94], 10*sfac[94]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[94]=paper.setFinish(); 
t[94].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[95]=paper.text(nx[95],ny[95]-10,'Vertical Shifts in Parabolic Graphs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[95]});
t[95].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Vertical-Shifts-of-Quadratic-Functions/#Vertical Shifts in Parabolic Graphs", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Vertical-Shifts-of-Quadratic-Functions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Vertical-Shifts-of-Quadratic-Functions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Vertical-Shifts-of-Quadratic-Functions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[95], bt[95], br[95]-bl[95], bb[95]-bt[95], 10*sfac[95]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[95]=paper.setFinish(); 
t[95].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[96]=paper.text(nx[96],ny[96],'The Distributive Property').attr({fill:"#666666","font-size": 14*sfac[96]});
tBox=t[96].getBBox(); 
bt[96]=ny[96]-(tBox.height/2+10*sfac[96]);
bb[96]=ny[96]+(tBox.height/2+10*sfac[96]);
bl[96]=nx[96]-(tBox.width/2+10*sfac[96]);
br[96]=nx[96]+(tBox.width/2+10*sfac[96]);
paper.setStart(); 
rect=paper.rect(bl[96], bt[96], br[96]-bl[96], bb[96]-bt[96], 10*sfac[96]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[96]=paper.setFinish(); 

t[97]=paper.text(nx[97],ny[97],'Working with Real\nNumbers').attr({fill:"#666666","font-size": 14*sfac[97]});
tBox=t[97].getBBox(); 
bt[97]=ny[97]-(tBox.height/2+10*sfac[97]);
bb[97]=ny[97]+(tBox.height/2+10*sfac[97]);
bl[97]=nx[97]-(tBox.width/2+10*sfac[97]);
br[97]=nx[97]+(tBox.width/2+10*sfac[97]);
paper.setStart(); 
rect=paper.rect(bl[97], bt[97], br[97]-bl[97], bb[97]-bt[97], 10*sfac[97]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[97]=paper.setFinish(); 

t[98]=paper.text(nx[98],ny[98],'Exponential Growth\nand Decay').attr({fill:"#666666","font-size": 14*sfac[98]});
tBox=t[98].getBBox(); 
bt[98]=ny[98]-(tBox.height/2+10*sfac[98]);
bb[98]=ny[98]+(tBox.height/2+10*sfac[98]);
bl[98]=nx[98]-(tBox.width/2+10*sfac[98]);
br[98]=nx[98]+(tBox.width/2+10*sfac[98]);
paper.setStart(); 
rect=paper.rect(bl[98], bt[98], br[98]-bl[98], bb[98]-bt[98], 10*sfac[98]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[98]=paper.setFinish(); 

t[99]=paper.text(nx[99],ny[99]-10,'Equations of Perpendicular Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[99]});
t[99].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Equations-of-Perpendicular-Lines/#Equations of Perpendicular Lines", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Equations-of-Perpendicular-Lines/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Equations-of-Perpendicular-Lines/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Equations-of-Perpendicular-Lines/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[99], bt[99], br[99]-bl[99], bb[99]-bt[99], 10*sfac[99]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[99]=paper.setFinish(); 
t[99].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[100]=paper.text(nx[100],ny[100]-10,'Domain and Range\nof a Function').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[100]});
t[100].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Domain-and-Range-of-a-Function/#Domain and Range of a Function", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Domain-and-Range-of-a-Function/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Domain-and-Range-of-a-Function/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Domain-and-Range-of-a-Function/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[100], bt[100], br[100]-bl[100], bb[100]-bt[100], 10*sfac[100]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[100]=paper.setFinish(); 
t[100].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[101]=paper.text(nx[101],ny[101],'Rational Expressions').attr({fill:"#666666","font-size": 14*sfac[101]});
tBox=t[101].getBBox(); 
bt[101]=ny[101]-(tBox.height/2+10*sfac[101]);
bb[101]=ny[101]+(tBox.height/2+10*sfac[101]);
bl[101]=nx[101]-(tBox.width/2+10*sfac[101]);
br[101]=nx[101]+(tBox.width/2+10*sfac[101]);
paper.setStart(); 
rect=paper.rect(bl[101], bt[101], br[101]-bl[101], bb[101]-bt[101], 10*sfac[101]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[101]=paper.setFinish(); 

t[102]=paper.text(nx[102],ny[102]-10,'Mathematical Sentences').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[102]});
t[102].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Variable-Expressions/#Mathematical Sentences", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Variable-Expressions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Variable-Expressions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[102], bt[102], br[102]-bl[102], bb[102]-bt[102], 10*sfac[102]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[102]=paper.setFinish(); 
t[102].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[103]=paper.text(nx[103],ny[103],'Use Vertex Form of Quadratics').attr({fill:"#666666","font-size": 14*sfac[103]});
tBox=t[103].getBBox(); 
bt[103]=ny[103]-(tBox.height/2+10*sfac[103]);
bb[103]=ny[103]+(tBox.height/2+10*sfac[103]);
bl[103]=nx[103]-(tBox.width/2+10*sfac[103]);
br[103]=nx[103]+(tBox.width/2+10*sfac[103]);
paper.setStart(); 
rect=paper.rect(bl[103], bt[103], br[103]-bl[103], bb[103]-bt[103], 10*sfac[103]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[103]=paper.setFinish(); 

t[104]=paper.text(nx[104],ny[104],'Solving Problems by Factoring').attr({fill:"#666666","font-size": 14*sfac[104]});
tBox=t[104].getBBox(); 
bt[104]=ny[104]-(tBox.height/2+10*sfac[104]);
bb[104]=ny[104]+(tBox.height/2+10*sfac[104]);
bl[104]=nx[104]-(tBox.width/2+10*sfac[104]);
br[104]=nx[104]+(tBox.width/2+10*sfac[104]);
paper.setStart(); 
rect=paper.rect(bl[104], bt[104], br[104]-bl[104], bb[104]-bt[104], 10*sfac[104]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[104]=paper.setFinish(); 

t[105]=paper.text(nx[105],ny[105]-10,'Solving Absolute Value\nInequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[105]});
t[105].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Absolute-Value-Inequalities/#Solving Absolute Value Inequalities", target: "_top",title:"Click to jump to concept"});
}); 
t[105].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[105].getBBox(); 
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
yicon = bb[105]-25; 
xicon2 = nx[105]+-40; 
xicon3 = nx[105]+-10; 
xicon4 = nx[105]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Absolute-Value-Inequalities/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Absolute-Value-Inequalities/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Absolute-Value-Inequalities/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[105], bt[105], br[105]-bl[105], bb[105]-bt[105], 10*sfac[105]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[105]=paper.setFinish(); 
t[105].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[106]=paper.text(nx[106],ny[106],'Properties of Order').attr({fill:"#666666","font-size": 14*sfac[106]});
tBox=t[106].getBBox(); 
bt[106]=ny[106]-(tBox.height/2+10*sfac[106]);
bb[106]=ny[106]+(tBox.height/2+10*sfac[106]);
bl[106]=nx[106]-(tBox.width/2+10*sfac[106]);
br[106]=nx[106]+(tBox.width/2+10*sfac[106]);
paper.setStart(); 
rect=paper.rect(bl[106], bt[106], br[106]-bl[106], bb[106]-bt[106], 10*sfac[106]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[106]=paper.setFinish(); 

t[107]=paper.text(nx[107],ny[107]-10,'Ordered Pairs and\nFunctions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[107]});
t[107].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Function-Notation/#Ordered Pairs and Functions", target: "_top",title:"Click to jump to concept"});
}); 
t[107].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[107].getBBox(); 
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
yicon = bb[107]-25; 
xicon2 = nx[107]+-40; 
xicon3 = nx[107]+-10; 
xicon4 = nx[107]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Function-Notation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Function-Notation/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[107], bt[107], br[107]-bl[107], bb[107]-bt[107], 10*sfac[107]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[107]=paper.setFinish(); 
t[107].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[108]=paper.text(nx[108],ny[108],'Identification of Exponential\nModels').attr({fill:"#666666","font-size": 14*sfac[108]});
tBox=t[108].getBBox(); 
bt[108]=ny[108]-(tBox.height/2+10*sfac[108]);
bb[108]=ny[108]+(tBox.height/2+10*sfac[108]);
bl[108]=nx[108]-(tBox.width/2+10*sfac[108]);
br[108]=nx[108]+(tBox.width/2+10*sfac[108]);
paper.setStart(); 
rect=paper.rect(bl[108], bt[108], br[108]-bl[108], bb[108]-bt[108], 10*sfac[108]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[108]=paper.setFinish(); 

t[109]=paper.text(nx[109],ny[109],'Comparing Equations of Parallel\nand Perpendicular Lines').attr({fill:"#666666","font-size": 14*sfac[109]});
tBox=t[109].getBBox(); 
bt[109]=ny[109]-(tBox.height/2+10*sfac[109]);
bb[109]=ny[109]+(tBox.height/2+10*sfac[109]);
bl[109]=nx[109]-(tBox.width/2+10*sfac[109]);
br[109]=nx[109]+(tBox.width/2+10*sfac[109]);
paper.setStart(); 
rect=paper.rect(bl[109], bt[109], br[109]-bl[109], bb[109]-bt[109], 10*sfac[109]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[109]=paper.setFinish(); 

t[110]=paper.text(nx[110],ny[110]-10,'Line Equations from\nTwo Points').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[110]});
t[110].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Write-an-Equation-Given-Two-Points/#Line Equations from Two Points", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Write-an-Equation-Given-Two-Points/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Write-an-Equation-Given-Two-Points/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Write-an-Equation-Given-Two-Points/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[110], bt[110], br[110]-bl[110], bb[110]-bt[110], 10*sfac[110]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[110]=paper.setFinish(); 
t[110].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[111]=paper.text(nx[111],ny[111]-10,'Translate into Algebraic\nExpressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[111]});
t[111].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Patterns-and-Expressions/#Translate into Algebraic Expressions", target: "_top",title:"Click to jump to concept"});
}); 
t[111].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[111].getBBox(); 
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
yicon = bb[111]-25; 
xicon2 = nx[111]+-40; 
xicon3 = nx[111]+-10; 
xicon4 = nx[111]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Patterns-and-Expressions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Patterns-and-Expressions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[111], bt[111], br[111]-bl[111], bb[111]-bt[111], 10*sfac[111]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[111]=paper.setFinish(); 
t[111].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[112]=paper.text(nx[112],ny[112]-10,'Dimensional Analysis').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[112]});
t[112].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Dimensional-Analysis/#Dimensional Analysis", target: "_top",title:"Click to jump to concept"});
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
paper.setStart(); 
rect=paper.rect(bl[112], bt[112], br[112]-bl[112], bb[112]-bt[112], 10*sfac[112]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[112]=paper.setFinish(); 
t[112].toFront(); 

t[113]=paper.text(nx[113],ny[113],'Quadratic Inequalities').attr({fill:"#666666","font-size": 14*sfac[113]});
tBox=t[113].getBBox(); 
bt[113]=ny[113]-(tBox.height/2+10*sfac[113]);
bb[113]=ny[113]+(tBox.height/2+10*sfac[113]);
bl[113]=nx[113]-(tBox.width/2+10*sfac[113]);
br[113]=nx[113]+(tBox.width/2+10*sfac[113]);
paper.setStart(); 
rect=paper.rect(bl[113], bt[113], br[113]-bl[113], bb[113]-bt[113], 10*sfac[113]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[113]=paper.setFinish(); 

t[114]=paper.text(nx[114],ny[114]-10,'Solving Multi-Step Equations\nby Combining Like Terms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[114]});
t[114].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multi-Step-Equations-with-Like-Terms/#Solving Multi-Step Equations by Combining Like Terms", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Multi-Step-Equations-with-Like-Terms/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multi-Step-Equations-with-Like-Terms/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multi-Step-Equations-with-Like-Terms/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[114], bt[114], br[114]-bl[114], bb[114]-bt[114], 10*sfac[114]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[114]=paper.setFinish(); 
t[114].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[115]=paper.text(nx[115],ny[115],'Slope-Intercept Form\nof Linear Equations').attr({fill:"#666666","font-size": 14*sfac[115]});
tBox=t[115].getBBox(); 
bt[115]=ny[115]-(tBox.height/2+10*sfac[115]);
bb[115]=ny[115]+(tBox.height/2+10*sfac[115]);
bl[115]=nx[115]-(tBox.width/2+10*sfac[115]);
br[115]=nx[115]+(tBox.width/2+10*sfac[115]);
paper.setStart(); 
rect=paper.rect(bl[115], bt[115], br[115]-bl[115], bb[115]-bt[115], 10*sfac[115]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[115]=paper.setFinish(); 

t[116]=paper.text(nx[116],ny[116],'Determining the Equation\nof a Line').attr({fill:"#666666","font-size": 14*sfac[116]});
tBox=t[116].getBBox(); 
bt[116]=ny[116]-(tBox.height/2+10*sfac[116]);
bb[116]=ny[116]+(tBox.height/2+10*sfac[116]);
bl[116]=nx[116]-(tBox.width/2+10*sfac[116]);
br[116]=nx[116]+(tBox.width/2+10*sfac[116]);
paper.setStart(); 
rect=paper.rect(bl[116], bt[116], br[116]-bl[116], bb[116]-bt[116], 10*sfac[116]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[116]=paper.setFinish(); 

t[117]=paper.text(nx[117],ny[117]-10,'Quadratic Trinomials of\nthe\nform ax^2 + bx +c').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[117]});
t[117].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Factoring-by-Grouping/#Quadratic Trinomials of the form ax^2 + bx +c", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Factoring-by-Grouping/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Factoring-by-Grouping/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Factoring-by-Grouping/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[117], bt[117], br[117]-bl[117], bb[117]-bt[117], 10*sfac[117]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[117]=paper.setFinish(); 
t[117].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[118]=paper.text(nx[118],ny[118],'Sums and Differences of\nRational Expressions\nwith Unequal Denominators').attr({fill:"#666666","font-size": 14*sfac[118]});
tBox=t[118].getBBox(); 
bt[118]=ny[118]-(tBox.height/2+10*sfac[118]);
bb[118]=ny[118]+(tBox.height/2+10*sfac[118]);
bl[118]=nx[118]-(tBox.width/2+10*sfac[118]);
br[118]=nx[118]+(tBox.width/2+10*sfac[118]);
paper.setStart(); 
rect=paper.rect(bl[118], bt[118], br[118]-bl[118], bb[118]-bt[118], 10*sfac[118]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[118]=paper.setFinish(); 

t[119]=paper.text(nx[119],ny[119]-10,'Exponential Properties\nInvolving Products').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[119]});
t[119].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exponential-Properties-Involving-Products/#Exponential Properties Involving Products", target: "_top",title:"Click to jump to concept"});
}); 
t[119].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[119].getBBox(); 
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
yicon = bb[119]-25; 
xicon2 = nx[119]+-40; 
xicon3 = nx[119]+-10; 
xicon4 = nx[119]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Properties-Involving-Products/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Properties-Involving-Products/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Properties-Involving-Products/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[119], bt[119], br[119]-bl[119], bb[119]-bt[119], 10*sfac[119]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[119]=paper.setFinish(); 
t[119].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[120]=paper.text(nx[120],ny[120]-10,'Evaluating Scientific Notation\nwith a Calculator').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[120]});
t[120].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Scientific-Notation-with-a-Calculator/#Evaluating Scientific Notation with a Calculator", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Scientific-Notation-with-a-Calculator/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Scientific-Notation-with-a-Calculator/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[120], bt[120], br[120]-bl[120], bb[120]-bt[120], 10*sfac[120]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[120]=paper.setFinish(); 
t[120].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[121]=paper.text(nx[121],ny[121],'Operations with Rational\nExpressions').attr({fill:"#666666","font-size": 14*sfac[121]});
tBox=t[121].getBBox(); 
bt[121]=ny[121]-(tBox.height/2+10*sfac[121]);
bb[121]=ny[121]+(tBox.height/2+10*sfac[121]);
bl[121]=nx[121]-(tBox.width/2+10*sfac[121]);
br[121]=nx[121]+(tBox.width/2+10*sfac[121]);
paper.setStart(); 
rect=paper.rect(bl[121], bt[121], br[121]-bl[121], bb[121]-bt[121], 10*sfac[121]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[121]=paper.setFinish(); 

t[122]=paper.text(nx[122],ny[122]-10,'Finding Intercepts Using the\nCover-Up Method').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[122]});
t[122].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Intercepts-and-the-Cover-Up-Method/#Finding Intercepts Using the Cover-Up Method", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Intercepts-and-the-Cover-Up-Method/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Intercepts-and-the-Cover-Up-Method/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[122], bt[122], br[122]-bl[122], bb[122]-bt[122], 10*sfac[122]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[122]=paper.setFinish(); 
t[122].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[123]=paper.text(nx[123],ny[123]-10,'How Graphs Represent Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[123]});
t[123].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Functions-on-a-Cartesian-Plane/#How Graphs Represent Functions", target: "_top",title:"Click to jump to concept"});
}); 
t[123].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[123].getBBox(); 
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
yicon = bb[123]-25; 
xicon2 = nx[123]+-40; 
xicon3 = nx[123]+-10; 
xicon4 = nx[123]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Functions-on-a-Cartesian-Plane/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Functions-on-a-Cartesian-Plane/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Functions-on-a-Cartesian-Plane/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[123], bt[123], br[123]-bl[123], bb[123]-bt[123], 10*sfac[123]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[123]=paper.setFinish(); 
t[123].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[124]=paper.text(nx[124],ny[124],'Systems of Equations\nand Inequalities').attr({fill:"#666666","font-size": 14*sfac[124]});
tBox=t[124].getBBox(); 
bt[124]=ny[124]-(tBox.height/2+10*sfac[124]);
bb[124]=ny[124]+(tBox.height/2+10*sfac[124]);
bl[124]=nx[124]-(tBox.width/2+10*sfac[124]);
br[124]=nx[124]+(tBox.width/2+10*sfac[124]);
paper.setStart(); 
rect=paper.rect(bl[124], bt[124], br[124]-bl[124], bb[124]-bt[124], 10*sfac[124]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[124]=paper.setFinish(); 

t[125]=paper.text(nx[125],ny[125]-10,'Absolute Value and the Additive\nInverse Property').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[125]});
t[125].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Additive-Inverses-and-Absolute-Values/#Absolute Value and the Additive Inverse Property", target: "_top",title:"Click to jump to concept"});
}); 
t[125].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[125].getBBox(); 
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
yicon = bb[125]-25; 
xicon2 = nx[125]+-40; 
xicon3 = nx[125]+-10; 
xicon4 = nx[125]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Additive-Inverses-and-Absolute-Values/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Additive-Inverses-and-Absolute-Values/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Additive-Inverses-and-Absolute-Values/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[125], bt[125], br[125]-bl[125], bb[125]-bt[125], 10*sfac[125]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[125]=paper.setFinish(); 
t[125].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[126]=paper.text(nx[126],ny[126]-10,'Multiplying Monomials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[126]});
t[126].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multiplication-of-Polynomials-by-Binomials/#Multiplying Monomials", target: "_top",title:"Click to jump to concept"});
}); 
t[126].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[126].getBBox(); 
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
yicon = bb[126]-25; 
xicon2 = nx[126]+-40; 
xicon3 = nx[126]+-10; 
xicon4 = nx[126]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplication-of-Polynomials-by-Binomials/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplication-of-Polynomials-by-Binomials/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplication-of-Polynomials-by-Binomials/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[126], bt[126], br[126]-bl[126], bb[126]-bt[126], 10*sfac[126]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[126]=paper.setFinish(); 
t[126].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[127]=paper.text(nx[127],ny[127]-10,'The Slope-Intercept Form\nof a Linear Equation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[127]});
t[127].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Slope-Intercept-Form/#The Slope-Intercept Form of a Linear Equation", target: "_top",title:"Click to jump to concept"});
}); 
t[127].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[127].getBBox(); 
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
yicon = bb[127]-25; 
xicon2 = nx[127]+-40; 
xicon3 = nx[127]+-10; 
xicon4 = nx[127]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Slope-Intercept-Form/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Slope-Intercept-Form/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Slope-Intercept-Form/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[127], bt[127], br[127]-bl[127], bb[127]-bt[127], 10*sfac[127]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[127]=paper.setFinish(); 
t[127].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[128]=paper.text(nx[128],ny[128],'Identification of Quadratic\nModels').attr({fill:"#666666","font-size": 14*sfac[128]});
tBox=t[128].getBBox(); 
bt[128]=ny[128]-(tBox.height/2+10*sfac[128]);
bb[128]=ny[128]+(tBox.height/2+10*sfac[128]);
bl[128]=nx[128]-(tBox.width/2+10*sfac[128]);
br[128]=nx[128]+(tBox.width/2+10*sfac[128]);
paper.setStart(); 
rect=paper.rect(bl[128], bt[128], br[128]-bl[128], bb[128]-bt[128], 10*sfac[128]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[128]=paper.setFinish(); 

t[129]=paper.text(nx[129],ny[129],'Work Problems').attr({fill:"#666666","font-size": 14*sfac[129]});
tBox=t[129].getBBox(); 
bt[129]=ny[129]-(tBox.height/2+10*sfac[129]);
bb[129]=ny[129]+(tBox.height/2+10*sfac[129]);
bl[129]=nx[129]-(tBox.width/2+10*sfac[129]);
br[129]=nx[129]+(tBox.width/2+10*sfac[129]);
paper.setStart(); 
rect=paper.rect(bl[129], bt[129], br[129]-bl[129], bb[129]-bt[129], 10*sfac[129]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[129]=paper.setFinish(); 

t[130]=paper.text(nx[130],ny[130],'Properties of Rational\nNumbers versus Irrational Numbers').attr({fill:"#666666","font-size": 14*sfac[130]});
tBox=t[130].getBBox(); 
bt[130]=ny[130]-(tBox.height/2+10*sfac[130]);
bb[130]=ny[130]+(tBox.height/2+10*sfac[130]);
bl[130]=nx[130]-(tBox.width/2+10*sfac[130]);
br[130]=nx[130]+(tBox.width/2+10*sfac[130]);
paper.setStart(); 
rect=paper.rect(bl[130], bt[130], br[130]-bl[130], bb[130]-bt[130], 10*sfac[130]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[130]=paper.setFinish(); 

t[131]=paper.text(nx[131],ny[131],'Solving Open Sentences\nin Two Variables').attr({fill:"#666666","font-size": 14*sfac[131]});
tBox=t[131].getBBox(); 
bt[131]=ny[131]-(tBox.height/2+10*sfac[131]);
bb[131]=ny[131]+(tBox.height/2+10*sfac[131]);
bl[131]=nx[131]-(tBox.width/2+10*sfac[131]);
br[131]=nx[131]+(tBox.width/2+10*sfac[131]);
paper.setStart(); 
rect=paper.rect(bl[131], bt[131], br[131]-bl[131], bb[131]-bt[131], 10*sfac[131]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[131]=paper.setFinish(); 

t[132]=paper.text(nx[132],ny[132],'Dividing Monomials').attr({fill:"#666666","font-size": 14*sfac[132]});
tBox=t[132].getBBox(); 
bt[132]=ny[132]-(tBox.height/2+10*sfac[132]);
bb[132]=ny[132]+(tBox.height/2+10*sfac[132]);
bl[132]=nx[132]-(tBox.width/2+10*sfac[132]);
br[132]=nx[132]+(tBox.width/2+10*sfac[132]);
paper.setStart(); 
rect=paper.rect(bl[132], bt[132], br[132]-bl[132], bb[132]-bt[132], 10*sfac[132]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[132]=paper.setFinish(); 

t[133]=paper.text(nx[133],ny[133],'Percent Problems').attr({fill:"#666666","font-size": 14*sfac[133]});
tBox=t[133].getBBox(); 
bt[133]=ny[133]-(tBox.height/2+10*sfac[133]);
bb[133]=ny[133]+(tBox.height/2+10*sfac[133]);
bl[133]=nx[133]-(tBox.width/2+10*sfac[133]);
br[133]=nx[133]+(tBox.width/2+10*sfac[133]);
paper.setStart(); 
rect=paper.rect(bl[133], bt[133], br[133]-bl[133], bb[133]-bt[133], 10*sfac[133]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[133]=paper.setFinish(); 

t[134]=paper.text(nx[134],ny[134]-10,'Guess and Check;\nWorking Backwards').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[134]});
t[134].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Guess-and-Check-Work-Backward/#Guess and Check; Working Backwards", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Guess-and-Check-Work-Backward/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Guess-and-Check-Work-Backward/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[134], bt[134], br[134]-bl[134], bb[134]-bt[134], 10*sfac[134]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[134]=paper.setFinish(); 
t[134].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[135]=paper.text(nx[135],ny[135]-10,'Describe Patterns with\nAlgebraic Expressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[135]});
t[135].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Words-that-Describe-Patterns/#Describe Patterns with Algebraic Expressions", target: "_top",title:"Click to jump to concept"});
}); 
t[135].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[135].getBBox(); 
bt[135]=ny[135]-10-(tBox.height/2+10*sfac[135]);
bb[135]=ny[135]-10+(tBox.height/2+10*sfac[135]);
bl[135]=nx[135]-(tBox.width/2+10*sfac[135]);
br[135]=nx[135]+(tBox.width/2+10*sfac[135]);
var nwidth = br[135]-bl[135]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[135] = bl[135] - delta; 
    br[135] = br[135] + delta; 
} 
bb[135] = bb[135]+20; 
yicon = bb[135]-25; 
xicon2 = nx[135]+-40; 
xicon3 = nx[135]+-10; 
xicon4 = nx[135]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Words-that-Describe-Patterns/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Words-that-Describe-Patterns/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[135], bt[135], br[135]-bl[135], bb[135]-bt[135], 10*sfac[135]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[135]=paper.setFinish(); 
t[135].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[136]=paper.text(nx[136],ny[136],'Complex Fractions').attr({fill:"#666666","font-size": 14*sfac[136]});
tBox=t[136].getBBox(); 
bt[136]=ny[136]-(tBox.height/2+10*sfac[136]);
bb[136]=ny[136]+(tBox.height/2+10*sfac[136]);
bl[136]=nx[136]-(tBox.width/2+10*sfac[136]);
br[136]=nx[136]+(tBox.width/2+10*sfac[136]);
paper.setStart(); 
rect=paper.rect(bl[136], bt[136], br[136]-bl[136], bb[136]-bt[136], 10*sfac[136]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[136]=paper.setFinish(); 

t[137]=paper.text(nx[137],ny[137],'Ratio, Proportion, and\nVariation').attr({fill:"#666666","font-size": 14*sfac[137]});
tBox=t[137].getBBox(); 
bt[137]=ny[137]-(tBox.height/2+10*sfac[137]);
bb[137]=ny[137]+(tBox.height/2+10*sfac[137]);
bl[137]=nx[137]-(tBox.width/2+10*sfac[137]);
br[137]=nx[137]+(tBox.width/2+10*sfac[137]);
paper.setStart(); 
rect=paper.rect(bl[137], bt[137], br[137]-bl[137], bb[137]-bt[137], 10*sfac[137]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[137]=paper.setFinish(); 

t[138]=paper.text(nx[138],ny[138]-10,'Real-World Problems\nUsing Direct Variation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[138]});
t[138].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Applications-Using-Direct-Variation/#Real-World Problems Using Direct Variation", target: "_top",title:"Click to jump to concept"});
}); 
t[138].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[138].getBBox(); 
bt[138]=ny[138]-10-(tBox.height/2+10*sfac[138]);
bb[138]=ny[138]-10+(tBox.height/2+10*sfac[138]);
bl[138]=nx[138]-(tBox.width/2+10*sfac[138]);
br[138]=nx[138]+(tBox.width/2+10*sfac[138]);
var nwidth = br[138]-bl[138]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[138] = bl[138] - delta; 
    br[138] = br[138] + delta; 
} 
bb[138] = bb[138]+20; 
yicon = bb[138]-25; 
xicon2 = nx[138]+-40; 
xicon3 = nx[138]+-10; 
xicon4 = nx[138]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-Using-Direct-Variation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-Using-Direct-Variation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[138], bt[138], br[138]-bl[138], bb[138]-bt[138], 10*sfac[138]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[138]=paper.setFinish(); 
t[138].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[139]=paper.text(nx[139],ny[139],'Multiplying a Polynomial\nby a Monomial').attr({fill:"#666666","font-size": 14*sfac[139]});
tBox=t[139].getBBox(); 
bt[139]=ny[139]-(tBox.height/2+10*sfac[139]);
bb[139]=ny[139]+(tBox.height/2+10*sfac[139]);
bl[139]=nx[139]-(tBox.width/2+10*sfac[139]);
br[139]=nx[139]+(tBox.width/2+10*sfac[139]);
paper.setStart(); 
rect=paper.rect(bl[139], bt[139], br[139]-bl[139], bb[139]-bt[139], 10*sfac[139]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[139]=paper.setFinish(); 

t[140]=paper.text(nx[140],ny[140],'Solving Equations Using\nthe Pythagorean Theorem').attr({fill:"#666666","font-size": 14*sfac[140]});
tBox=t[140].getBBox(); 
bt[140]=ny[140]-(tBox.height/2+10*sfac[140]);
bb[140]=ny[140]+(tBox.height/2+10*sfac[140]);
bl[140]=nx[140]-(tBox.width/2+10*sfac[140]);
br[140]=nx[140]+(tBox.width/2+10*sfac[140]);
paper.setStart(); 
rect=paper.rect(bl[140], bt[140], br[140]-bl[140], bb[140]-bt[140], 10*sfac[140]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[140]=paper.setFinish(); 

t[141]=paper.text(nx[141],ny[141]-10,'Graphing Linear Inequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[141]});
t[141].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inequality-Expressions/#Graphing Linear Inequalities", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inequality-Expressions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inequality-Expressions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[141], bt[141], br[141]-bl[141], bb[141]-bt[141], 10*sfac[141]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[141]=paper.setFinish(); 
t[141].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[142]=paper.text(nx[142],ny[142],'Open Sentences Involving\nWhole-Number Denominators').attr({fill:"#666666","font-size": 14*sfac[142]});
tBox=t[142].getBBox(); 
bt[142]=ny[142]-(tBox.height/2+10*sfac[142]);
bb[142]=ny[142]+(tBox.height/2+10*sfac[142]);
bl[142]=nx[142]-(tBox.width/2+10*sfac[142]);
br[142]=nx[142]+(tBox.width/2+10*sfac[142]);
paper.setStart(); 
rect=paper.rect(bl[142], bt[142], br[142]-bl[142], bb[142]-bt[142], 10*sfac[142]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[142]=paper.setFinish(); 

t[143]=paper.text(nx[143],ny[143],'The Graph of a Linear\nEquation in Two Variables').attr({fill:"#666666","font-size": 14*sfac[143]});
tBox=t[143].getBBox(); 
bt[143]=ny[143]-(tBox.height/2+10*sfac[143]);
bb[143]=ny[143]+(tBox.height/2+10*sfac[143]);
bl[143]=nx[143]-(tBox.width/2+10*sfac[143]);
br[143]=nx[143]+(tBox.width/2+10*sfac[143]);
paper.setStart(); 
rect=paper.rect(bl[143], bt[143], br[143]-bl[143], bb[143]-bt[143], 10*sfac[143]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[143]=paper.setFinish(); 

t[144]=paper.text(nx[144],ny[144],'Number Problems').attr({fill:"#666666","font-size": 14*sfac[144]});
tBox=t[144].getBBox(); 
bt[144]=ny[144]-(tBox.height/2+10*sfac[144]);
bb[144]=ny[144]+(tBox.height/2+10*sfac[144]);
bl[144]=nx[144]-(tBox.width/2+10*sfac[144]);
br[144]=nx[144]+(tBox.width/2+10*sfac[144]);
paper.setStart(); 
rect=paper.rect(bl[144], bt[144], br[144]-bl[144], bb[144]-bt[144], 10*sfac[144]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[144]=paper.setFinish(); 

t[145]=paper.text(nx[145],ny[145]-10,'One-Step Equations Transformed\nby Addition/Subtraction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[145]});
t[145].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/One-Step-Equations-and-Inverse-Operations/#One-Step Equations Transformed by Addition/Subtraction", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/One-Step-Equations-and-Inverse-Operations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/One-Step-Equations-and-Inverse-Operations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/One-Step-Equations-and-Inverse-Operations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[145], bt[145], br[145]-bl[145], bb[145]-bt[145], 10*sfac[145]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[145]=paper.setFinish(); 
t[145].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[146]=paper.text(nx[146],ny[146]-10,'Compound Inequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[146]});
t[146].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Compound-Inequalities/#Compound Inequalities", target: "_top",title:"Click to jump to concept"});
}); 
t[146].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[146].getBBox(); 
bt[146]=ny[146]-10-(tBox.height/2+10*sfac[146]);
bb[146]=ny[146]-10+(tBox.height/2+10*sfac[146]);
bl[146]=nx[146]-(tBox.width/2+10*sfac[146]);
br[146]=nx[146]+(tBox.width/2+10*sfac[146]);
var nwidth = br[146]-bl[146]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[146] = bl[146] - delta; 
    br[146] = br[146] + delta; 
} 
bb[146] = bb[146]+20; 
yicon = bb[146]-25; 
xicon2 = nx[146]+-40; 
xicon3 = nx[146]+-10; 
xicon4 = nx[146]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Compound-Inequalities/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Compound-Inequalities/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Compound-Inequalities/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[146], bt[146], br[146]-bl[146], bb[146]-bt[146], 10*sfac[146]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[146]=paper.setFinish(); 
t[146].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[147]=paper.text(nx[147],ny[147]-10,'Operations with Polynomials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[147]});
t[147].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Polynomials/#Operations with Polynomials", target: "_top",title:"Click to jump to concept"});
}); 
t[147].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[147].getBBox(); 
bt[147]=ny[147]-10-(tBox.height/2+10*sfac[147]);
bb[147]=ny[147]-10+(tBox.height/2+10*sfac[147]);
bl[147]=nx[147]-(tBox.width/2+10*sfac[147]);
br[147]=nx[147]+(tBox.width/2+10*sfac[147]);
var nwidth = br[147]-bl[147]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[147] = bl[147] - delta; 
    br[147] = br[147] + delta; 
} 
bb[147] = bb[147]+20; 
yicon = bb[147]-25; 
xicon2 = nx[147]+-40; 
xicon3 = nx[147]+-10; 
xicon4 = nx[147]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Polynomials/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Polynomials/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Polynomials/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[147], bt[147], br[147]-bl[147], bb[147]-bt[147], 10*sfac[147]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[147]=paper.setFinish(); 
t[147].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[148]=paper.text(nx[148],ny[148]-10,'Multi-Step Inequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[148]});
t[148].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multi-Step-Inequalities/#Multi-Step Inequalities", target: "_top",title:"Click to jump to concept"});
}); 
t[148].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[148].getBBox(); 
bt[148]=ny[148]-10-(tBox.height/2+10*sfac[148]);
bb[148]=ny[148]-10+(tBox.height/2+10*sfac[148]);
bl[148]=nx[148]-(tBox.width/2+10*sfac[148]);
br[148]=nx[148]+(tBox.width/2+10*sfac[148]);
var nwidth = br[148]-bl[148]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[148] = bl[148] - delta; 
    br[148] = br[148] + delta; 
} 
bb[148] = bb[148]+20; 
yicon = bb[148]-25; 
xicon2 = nx[148]+-40; 
xicon3 = nx[148]+-10; 
xicon4 = nx[148]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multi-Step-Inequalities/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multi-Step-Inequalities/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multi-Step-Inequalities/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[148], bt[148], br[148]-bl[148], bb[148]-bt[148], 10*sfac[148]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[148]=paper.setFinish(); 
t[148].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[149]=paper.text(nx[149],ny[149]-10,'Equations Involving Radicals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[149]});
t[149].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Radical-Equations/#Equations Involving Radicals", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Radical-Equations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Radical-Equations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Radical-Equations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[149], bt[149], br[149]-bl[149], bb[149]-bt[149], 10*sfac[149]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[149]=paper.setFinish(); 
t[149].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[150]=paper.text(nx[150],ny[150]-10,'One-Step Equations Transformed\nby Addition/Subtraction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[150]});
t[150].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/One-Step-Equations-and-Inverse-Operations/#One-Step Equations Transformed by Addition/Subtraction", target: "_top",title:"Click to jump to concept"});
}); 
t[150].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[150].getBBox(); 
bt[150]=ny[150]-10-(tBox.height/2+10*sfac[150]);
bb[150]=ny[150]-10+(tBox.height/2+10*sfac[150]);
bl[150]=nx[150]-(tBox.width/2+10*sfac[150]);
br[150]=nx[150]+(tBox.width/2+10*sfac[150]);
var nwidth = br[150]-bl[150]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[150] = bl[150] - delta; 
    br[150] = br[150] + delta; 
} 
bb[150] = bb[150]+20; 
yicon = bb[150]-25; 
xicon2 = nx[150]+-40; 
xicon3 = nx[150]+-10; 
xicon4 = nx[150]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/One-Step-Equations-and-Inverse-Operations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/One-Step-Equations-and-Inverse-Operations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/One-Step-Equations-and-Inverse-Operations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[150], bt[150], br[150]-bl[150], bb[150]-bt[150], 10*sfac[150]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[150]=paper.setFinish(); 
t[150].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[151]=paper.text(nx[151],ny[151]-10,'The Graph of a Linear\nInequality in Two Variables').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[151]});
t[151].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear-Inequalities-in-Two-Variables/#The Graph of a Linear Inequality in Two Variables", target: "_top",title:"Click to jump to concept"});
}); 
t[151].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[151].getBBox(); 
bt[151]=ny[151]-10-(tBox.height/2+10*sfac[151]);
bb[151]=ny[151]-10+(tBox.height/2+10*sfac[151]);
bl[151]=nx[151]-(tBox.width/2+10*sfac[151]);
br[151]=nx[151]+(tBox.width/2+10*sfac[151]);
var nwidth = br[151]-bl[151]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[151] = bl[151] - delta; 
    br[151] = br[151] + delta; 
} 
bb[151] = bb[151]+20; 
yicon = bb[151]-25; 
xicon2 = nx[151]+-40; 
xicon3 = nx[151]+-10; 
xicon4 = nx[151]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Inequalities-in-Two-Variables/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Inequalities-in-Two-Variables/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Inequalities-in-Two-Variables/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[151], bt[151], br[151]-bl[151], bb[151]-bt[151], 10*sfac[151]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[151]=paper.setFinish(); 
t[151].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[152]=paper.text(nx[152],ny[152],'Graphing Quadratic and Other\nPolynomial Functions and Equations').attr({fill:"#666666","font-size": 14*sfac[152]});
tBox=t[152].getBBox(); 
bt[152]=ny[152]-(tBox.height/2+10*sfac[152]);
bb[152]=ny[152]+(tBox.height/2+10*sfac[152]);
bl[152]=nx[152]-(tBox.width/2+10*sfac[152]);
br[152]=nx[152]+(tBox.width/2+10*sfac[152]);
paper.setStart(); 
rect=paper.rect(bl[152], bt[152], br[152]-bl[152], bb[152]-bt[152], 10*sfac[152]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[152]=paper.setFinish(); 

t[153]=paper.text(nx[153],ny[153]-10,'Parabola, Domain and Range').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[153]});
t[153].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Quadratic-Functions-and-Their-Graphs/#Parabola, Domain and Range", target: "_top",title:"Click to jump to concept"});
}); 
t[153].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[153].getBBox(); 
bt[153]=ny[153]-10-(tBox.height/2+10*sfac[153]);
bb[153]=ny[153]-10+(tBox.height/2+10*sfac[153]);
bl[153]=nx[153]-(tBox.width/2+10*sfac[153]);
br[153]=nx[153]+(tBox.width/2+10*sfac[153]);
var nwidth = br[153]-bl[153]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[153] = bl[153] - delta; 
    br[153] = br[153] + delta; 
} 
bb[153] = bb[153]+20; 
yicon = bb[153]-25; 
xicon2 = nx[153]+-40; 
xicon3 = nx[153]+-10; 
xicon4 = nx[153]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Quadratic-Functions-and-Their-Graphs/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Quadratic-Functions-and-Their-Graphs/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Quadratic-Functions-and-Their-Graphs/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[153], bt[153], br[153]-bl[153], bb[153]-bt[153], 10*sfac[153]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[153]=paper.setFinish(); 
t[153].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[154]=paper.text(nx[154],ny[154]-10,'Problem-Solving Applications\nUsing Inequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[154]});
t[154].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Applications-with-Inequalities/#Problem-Solving Applications Using Inequalities", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-with-Inequalities/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[154], bt[154], br[154]-bl[154], bb[154]-bt[154], 10*sfac[154]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[154]=paper.setFinish(); 
t[154].toFront(); 
exicon.toFront(); 

t[155]=paper.text(nx[155],ny[155],'Products and Quotients\nof Rational Expressions').attr({fill:"#666666","font-size": 14*sfac[155]});
tBox=t[155].getBBox(); 
bt[155]=ny[155]-(tBox.height/2+10*sfac[155]);
bb[155]=ny[155]+(tBox.height/2+10*sfac[155]);
bl[155]=nx[155]-(tBox.width/2+10*sfac[155]);
br[155]=nx[155]+(tBox.width/2+10*sfac[155]);
paper.setStart(); 
rect=paper.rect(bl[155], bt[155], br[155]-bl[155], bb[155]-bt[155], 10*sfac[155]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[155]=paper.setFinish(); 

t[156]=paper.text(nx[156],ny[156]-10,'Geometric Sequences and\nExponential Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[156]});
t[156].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Geometric-Sequences-and-Exponential-Functions/#Geometric Sequences and Exponential Functions", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Geometric-Sequences-and-Exponential-Functions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Geometric-Sequences-and-Exponential-Functions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Geometric-Sequences-and-Exponential-Functions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[156], bt[156], br[156]-bl[156], bb[156]-bt[156], 10*sfac[156]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[156]=paper.setFinish(); 
t[156].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[157]=paper.text(nx[157],ny[157]-10,'Graphing Absolute Value\nEquations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[157]});
t[157].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-of-Absolute-Value-Equations/#Graphing Absolute Value Equations", target: "_top",title:"Click to jump to concept"});
}); 
t[157].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[157].getBBox(); 
bt[157]=ny[157]-10-(tBox.height/2+10*sfac[157]);
bb[157]=ny[157]-10+(tBox.height/2+10*sfac[157]);
bl[157]=nx[157]-(tBox.width/2+10*sfac[157]);
br[157]=nx[157]+(tBox.width/2+10*sfac[157]);
var nwidth = br[157]-bl[157]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[157] = bl[157] - delta; 
    br[157] = br[157] + delta; 
} 
bb[157] = bb[157]+20; 
yicon = bb[157]-25; 
xicon2 = nx[157]+-40; 
xicon3 = nx[157]+-10; 
xicon4 = nx[157]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Absolute-Value-Equations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Absolute-Value-Equations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[157], bt[157], br[157]-bl[157], bb[157]-bt[157], 10*sfac[157]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[157]=paper.setFinish(); 
t[157].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[158]=paper.text(nx[158],ny[158]-10,'Products and Quotients\nof Square Roots').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[158]});
t[158].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multiplication-and-Division-of-Radicals/#Products and Quotients of Square Roots", target: "_top",title:"Click to jump to concept"});
}); 
t[158].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[158].getBBox(); 
bt[158]=ny[158]-10-(tBox.height/2+10*sfac[158]);
bb[158]=ny[158]-10+(tBox.height/2+10*sfac[158]);
bl[158]=nx[158]-(tBox.width/2+10*sfac[158]);
br[158]=nx[158]+(tBox.width/2+10*sfac[158]);
var nwidth = br[158]-bl[158]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[158] = bl[158] - delta; 
    br[158] = br[158] + delta; 
} 
bb[158] = bb[158]+20; 
yicon = bb[158]-25; 
xicon2 = nx[158]+-40; 
xicon3 = nx[158]+-10; 
xicon4 = nx[158]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplication-and-Division-of-Radicals/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplication-and-Division-of-Radicals/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplication-and-Division-of-Radicals/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[158], bt[158], br[158]-bl[158], bb[158]-bt[158], 10*sfac[158]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[158]=paper.setFinish(); 
t[158].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[159]=paper.text(nx[159],ny[159]-10,'2-Variable Systems\nUsing Graphs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[159]});
t[159].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-of-Linear-Systems/#2-Variable Systems Using Graphs", target: "_top",title:"Click to jump to concept"});
}); 
t[159].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[159].getBBox(); 
bt[159]=ny[159]-10-(tBox.height/2+10*sfac[159]);
bb[159]=ny[159]-10+(tBox.height/2+10*sfac[159]);
bl[159]=nx[159]-(tBox.width/2+10*sfac[159]);
br[159]=nx[159]+(tBox.width/2+10*sfac[159]);
var nwidth = br[159]-bl[159]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[159] = bl[159] - delta; 
    br[159] = br[159] + delta; 
} 
bb[159] = bb[159]+20; 
yicon = bb[159]-25; 
xicon2 = nx[159]+-40; 
xicon3 = nx[159]+-10; 
xicon4 = nx[159]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Linear-Systems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Linear-Systems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-of-Linear-Systems/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[159], bt[159], br[159]-bl[159], bb[159]-bt[159], 10*sfac[159]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[159]=paper.setFinish(); 
t[159].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[160]=paper.text(nx[160],ny[160]-10,'Fitting a Line to Data\nPoints').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[160]});
t[160].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Fitting-Lines-to-Data/#Fitting a Line to Data Points", target: "_top",title:"Click to jump to concept"});
}); 
t[160].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[160].getBBox(); 
bt[160]=ny[160]-10-(tBox.height/2+10*sfac[160]);
bb[160]=ny[160]-10+(tBox.height/2+10*sfac[160]);
bl[160]=nx[160]-(tBox.width/2+10*sfac[160]);
br[160]=nx[160]+(tBox.width/2+10*sfac[160]);
var nwidth = br[160]-bl[160]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[160] = bl[160] - delta; 
    br[160] = br[160] + delta; 
} 
bb[160] = bb[160]+20; 
yicon = bb[160]-25; 
xicon2 = nx[160]+-40; 
xicon3 = nx[160]+-10; 
xicon4 = nx[160]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Fitting-Lines-to-Data/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Fitting-Lines-to-Data/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Fitting-Lines-to-Data/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[160], bt[160], br[160]-bl[160], bb[160]-bt[160], 10*sfac[160]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[160]=paper.setFinish(); 
t[160].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[161]=paper.text(nx[161],ny[161],'Wind/Water Current\nProblems').attr({fill:"#666666","font-size": 14*sfac[161]});
tBox=t[161].getBBox(); 
bt[161]=ny[161]-(tBox.height/2+10*sfac[161]);
bb[161]=ny[161]+(tBox.height/2+10*sfac[161]);
bl[161]=nx[161]-(tBox.width/2+10*sfac[161]);
br[161]=nx[161]+(tBox.width/2+10*sfac[161]);
paper.setStart(); 
rect=paper.rect(bl[161], bt[161], br[161]-bl[161], bb[161]-bt[161], 10*sfac[161]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[161]=paper.setFinish(); 

t[162]=paper.text(nx[162],ny[162],'Multiplying Polynomials').attr({fill:"#666666","font-size": 14*sfac[162]});
tBox=t[162].getBBox(); 
bt[162]=ny[162]-(tBox.height/2+10*sfac[162]);
bb[162]=ny[162]+(tBox.height/2+10*sfac[162]);
bl[162]=nx[162]-(tBox.width/2+10*sfac[162]);
br[162]=nx[162]+(tBox.width/2+10*sfac[162]);
paper.setStart(); 
rect=paper.rect(bl[162], bt[162], br[162]-bl[162], bb[162]-bt[162], 10*sfac[162]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[162]=paper.setFinish(); 

t[163]=paper.text(nx[163],ny[163]-10,'Point-Slope Form\nof Linear Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[163]});
t[163].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear-Equations-in-Point-Slope-Form/#Point-Slope Form of Linear Equations", target: "_top",title:"Click to jump to concept"});
}); 
t[163].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[163].getBBox(); 
bt[163]=ny[163]-10-(tBox.height/2+10*sfac[163]);
bb[163]=ny[163]-10+(tBox.height/2+10*sfac[163]);
bl[163]=nx[163]-(tBox.width/2+10*sfac[163]);
br[163]=nx[163]+(tBox.width/2+10*sfac[163]);
var nwidth = br[163]-bl[163]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[163] = bl[163] - delta; 
    br[163] = br[163] + delta; 
} 
bb[163] = bb[163]+20; 
yicon = bb[163]-25; 
xicon2 = nx[163]+-40; 
xicon3 = nx[163]+-10; 
xicon4 = nx[163]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Equations-in-Point-Slope-Form/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Equations-in-Point-Slope-Form/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[163], bt[163], br[163]-bl[163], bb[163]-bt[163], 10*sfac[163]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[163]=paper.setFinish(); 
t[163].toFront(); 
vidicon.toFront(); 
atticon.toFront(); 

t[164]=paper.text(nx[164],ny[164]-10,'Sums and Differences of\nRational Expressions\nwith Equal Denominators').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[164]});
t[164].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Rational-Expressions/#Sums and Differences of Rational Expressions with Equal Denominators", target: "_top",title:"Click to jump to concept"});
}); 
t[164].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[164].getBBox(); 
bt[164]=ny[164]-10-(tBox.height/2+10*sfac[164]);
bb[164]=ny[164]-10+(tBox.height/2+10*sfac[164]);
bl[164]=nx[164]-(tBox.width/2+10*sfac[164]);
br[164]=nx[164]+(tBox.width/2+10*sfac[164]);
var nwidth = br[164]-bl[164]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[164] = bl[164] - delta; 
    br[164] = br[164] + delta; 
} 
bb[164] = bb[164]+20; 
yicon = bb[164]-25; 
xicon2 = nx[164]+-40; 
xicon3 = nx[164]+-10; 
xicon4 = nx[164]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Rational-Expressions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Rational-Expressions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Addition-and-Subtraction-of-Rational-Expressions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[164], bt[164], br[164]-bl[164], bb[164]-bt[164], 10*sfac[164]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[164]=paper.setFinish(); 
t[164].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[165]=paper.text(nx[165],ny[165]-10,'Quadratic Trinomials of\nthe\nform x^2 + bx +c').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[165]});
t[165].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Factorization-of-Quadratic-Expressions/#Quadratic Trinomials of the form x^2 + bx +c", target: "_top",title:"Click to jump to concept"});
}); 
t[165].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[165].getBBox(); 
bt[165]=ny[165]-10-(tBox.height/2+10*sfac[165]);
bb[165]=ny[165]-10+(tBox.height/2+10*sfac[165]);
bl[165]=nx[165]-(tBox.width/2+10*sfac[165]);
br[165]=nx[165]+(tBox.width/2+10*sfac[165]);
var nwidth = br[165]-bl[165]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[165] = bl[165] - delta; 
    br[165] = br[165] + delta; 
} 
bb[165] = bb[165]+20; 
yicon = bb[165]-25; 
xicon2 = nx[165]+-40; 
xicon3 = nx[165]+-10; 
xicon4 = nx[165]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Factorization-of-Quadratic-Expressions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Factorization-of-Quadratic-Expressions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Factorization-of-Quadratic-Expressions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[165], bt[165], br[165]-bl[165], bb[165]-bt[165], 10*sfac[165]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[165]=paper.setFinish(); 
t[165].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[166]=paper.text(nx[166],ny[166],'Using Quadratic Equations to\nSolve Problems').attr({fill:"#666666","font-size": 14*sfac[166]});
tBox=t[166].getBBox(); 
bt[166]=ny[166]-(tBox.height/2+10*sfac[166]);
bb[166]=ny[166]+(tBox.height/2+10*sfac[166]);
bl[166]=nx[166]-(tBox.width/2+10*sfac[166]);
br[166]=nx[166]+(tBox.width/2+10*sfac[166]);
paper.setStart(); 
rect=paper.rect(bl[166], bt[166], br[166]-bl[166], bb[166]-bt[166], 10*sfac[166]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[166]=paper.setFinish(); 

t[167]=paper.text(nx[167],ny[167]-10,'Solving Multi-Step Equations by\nUsing the Distributive Property').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[167]});
t[167].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Distributive-Property-for-Multi-Step-Equations/#Solving Multi-Step Equations by Using the Distributive Property", target: "_top",title:"Click to jump to concept"});
}); 
t[167].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[167].getBBox(); 
bt[167]=ny[167]-10-(tBox.height/2+10*sfac[167]);
bb[167]=ny[167]-10+(tBox.height/2+10*sfac[167]);
bl[167]=nx[167]-(tBox.width/2+10*sfac[167]);
br[167]=nx[167]+(tBox.width/2+10*sfac[167]);
var nwidth = br[167]-bl[167]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[167] = bl[167] - delta; 
    br[167] = br[167] + delta; 
} 
bb[167] = bb[167]+20; 
yicon = bb[167]-25; 
xicon2 = nx[167]+-40; 
xicon3 = nx[167]+-10; 
xicon4 = nx[167]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distributive-Property-for-Multi-Step-Equations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distributive-Property-for-Multi-Step-Equations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distributive-Property-for-Multi-Step-Equations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[167], bt[167], br[167]-bl[167], bb[167]-bt[167], 10*sfac[167]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[167]=paper.setFinish(); 
t[167].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[168]=paper.text(nx[168],ny[168]-10,'Two-Step Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[168]});
t[168].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Two-Step-Equations-and-Properties-of-Equality/#Two-Step Equations", target: "_top",title:"Click to jump to concept"});
}); 
t[168].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[168].getBBox(); 
bt[168]=ny[168]-10-(tBox.height/2+10*sfac[168]);
bb[168]=ny[168]-10+(tBox.height/2+10*sfac[168]);
bl[168]=nx[168]-(tBox.width/2+10*sfac[168]);
br[168]=nx[168]+(tBox.width/2+10*sfac[168]);
var nwidth = br[168]-bl[168]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[168] = bl[168] - delta; 
    br[168] = br[168] + delta; 
} 
bb[168] = bb[168]+20; 
yicon = bb[168]-25; 
xicon2 = nx[168]+-40; 
xicon3 = nx[168]+-10; 
xicon4 = nx[168]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Two-Step-Equations-and-Properties-of-Equality/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Two-Step-Equations-and-Properties-of-Equality/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[168], bt[168], br[168]-bl[168], bb[168]-bt[168], 10*sfac[168]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[168]=paper.setFinish(); 
t[168].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[169]=paper.text(nx[169],ny[169]-10,'Quadratic Equations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[169]});
t[169].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Discriminant/#Quadratic Equations", target: "_top",title:"Click to jump to concept"});
}); 
t[169].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[169].getBBox(); 
bt[169]=ny[169]-10-(tBox.height/2+10*sfac[169]);
bb[169]=ny[169]-10+(tBox.height/2+10*sfac[169]);
bl[169]=nx[169]-(tBox.width/2+10*sfac[169]);
br[169]=nx[169]+(tBox.width/2+10*sfac[169]);
var nwidth = br[169]-bl[169]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[169] = bl[169] - delta; 
    br[169] = br[169] + delta; 
} 
bb[169] = bb[169]+20; 
yicon = bb[169]-25; 
xicon2 = nx[169]+-40; 
xicon3 = nx[169]+-10; 
xicon4 = nx[169]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Discriminant/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Discriminant/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Discriminant/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[169], bt[169], br[169]-bl[169], bb[169]-bt[169], 10*sfac[169]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[169]=paper.setFinish(); 
t[169].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[170]=paper.text(nx[170],ny[170]-10,'Using Special Products to Factor\nPolynomials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[170]});
t[170].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Factor-Polynomials-Using-Special-Products/#Using Special Products to Factor Polynomials", target: "_top",title:"Click to jump to concept"});
}); 
t[170].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[170].getBBox(); 
bt[170]=ny[170]-10-(tBox.height/2+10*sfac[170]);
bb[170]=ny[170]-10+(tBox.height/2+10*sfac[170]);
bl[170]=nx[170]-(tBox.width/2+10*sfac[170]);
br[170]=nx[170]+(tBox.width/2+10*sfac[170]);
var nwidth = br[170]-bl[170]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[170] = bl[170] - delta; 
    br[170] = br[170] + delta; 
} 
bb[170] = bb[170]+20; 
yicon = bb[170]-25; 
xicon2 = nx[170]+-40; 
xicon3 = nx[170]+-10; 
xicon4 = nx[170]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Factor-Polynomials-Using-Special-Products/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Factor-Polynomials-Using-Special-Products/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Factor-Polynomials-Using-Special-Products/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[170], bt[170], br[170]-bl[170], bb[170]-bt[170], 10*sfac[170]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[170]=paper.setFinish(); 
t[170].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[171]=paper.text(nx[171],ny[171],'Polynomials and Rational\nExpressions').attr({fill:"#666666","font-size": 14*sfac[171]});
tBox=t[171].getBBox(); 
bt[171]=ny[171]-(tBox.height/2+10*sfac[171]);
bb[171]=ny[171]+(tBox.height/2+10*sfac[171]);
bl[171]=nx[171]-(tBox.width/2+10*sfac[171]);
br[171]=nx[171]+(tBox.width/2+10*sfac[171]);
paper.setStart(); 
rect=paper.rect(bl[171], bt[171], br[171]-bl[171], bb[171]-bt[171], 10*sfac[171]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[171]=paper.setFinish(); 

t[172]=paper.text(nx[172],ny[172],'Real Numbers').attr({fill:"#666666","font-size": 14*sfac[172]});
tBox=t[172].getBBox(); 
bt[172]=ny[172]-(tBox.height/2+10*sfac[172]);
bb[172]=ny[172]+(tBox.height/2+10*sfac[172]);
bl[172]=nx[172]-(tBox.width/2+10*sfac[172]);
br[172]=nx[172]+(tBox.width/2+10*sfac[172]);
paper.setStart(); 
rect=paper.rect(bl[172], bt[172], br[172]-bl[172], bb[172]-bt[172], 10*sfac[172]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[172]=paper.setFinish(); 

t[173]=paper.text(nx[173],ny[173],'Applications of Factoring').attr({fill:"#666666","font-size": 14*sfac[173]});
tBox=t[173].getBBox(); 
bt[173]=ny[173]-(tBox.height/2+10*sfac[173]);
bb[173]=ny[173]+(tBox.height/2+10*sfac[173]);
bl[173]=nx[173]-(tBox.width/2+10*sfac[173]);
br[173]=nx[173]+(tBox.width/2+10*sfac[173]);
paper.setStart(); 
rect=paper.rect(bl[173], bt[173], br[173]-bl[173], bb[173]-bt[173], 10*sfac[173]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[173]=paper.setFinish(); 

t[174]=paper.text(nx[174],ny[174]-10,'Exponential Decay').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[174]});
t[174].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exponential-Decay/#Exponential Decay", target: "_top",title:"Click to jump to concept"});
}); 
t[174].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[174].getBBox(); 
bt[174]=ny[174]-10-(tBox.height/2+10*sfac[174]);
bb[174]=ny[174]-10+(tBox.height/2+10*sfac[174]);
bl[174]=nx[174]-(tBox.width/2+10*sfac[174]);
br[174]=nx[174]+(tBox.width/2+10*sfac[174]);
var nwidth = br[174]-bl[174]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[174] = bl[174] - delta; 
    br[174] = br[174] + delta; 
} 
bb[174] = bb[174]+20; 
yicon = bb[174]-25; 
xicon2 = nx[174]+-40; 
xicon3 = nx[174]+-10; 
xicon4 = nx[174]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Decay/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Decay/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Decay/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[174], bt[174], br[174]-bl[174], bb[174]-bt[174], 10*sfac[174]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[174]=paper.setFinish(); 
t[174].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[175]=paper.text(nx[175],ny[175],'Rational Square Roots').attr({fill:"#666666","font-size": 14*sfac[175]});
tBox=t[175].getBBox(); 
bt[175]=ny[175]-(tBox.height/2+10*sfac[175]);
bb[175]=ny[175]+(tBox.height/2+10*sfac[175]);
bl[175]=nx[175]-(tBox.width/2+10*sfac[175]);
br[175]=nx[175]+(tBox.width/2+10*sfac[175]);
paper.setStart(); 
rect=paper.rect(bl[175], bt[175], br[175]-bl[175], bb[175]-bt[175], 10*sfac[175]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[175]=paper.setFinish(); 

t[176]=paper.text(nx[176],ny[176]-10,'2-Variable Systems\nUsing Linear\nCombinations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[176]});
t[176].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear-Systems-with-Multiplication/#2-Variable Systems Using Linear Combinations", target: "_top",title:"Click to jump to concept"});
}); 
t[176].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[176].getBBox(); 
bt[176]=ny[176]-10-(tBox.height/2+10*sfac[176]);
bb[176]=ny[176]-10+(tBox.height/2+10*sfac[176]);
bl[176]=nx[176]-(tBox.width/2+10*sfac[176]);
br[176]=nx[176]+(tBox.width/2+10*sfac[176]);
var nwidth = br[176]-bl[176]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[176] = bl[176] - delta; 
    br[176] = br[176] + delta; 
} 
bb[176] = bb[176]+20; 
yicon = bb[176]-25; 
xicon2 = nx[176]+-40; 
xicon3 = nx[176]+-10; 
xicon4 = nx[176]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Systems-with-Multiplication/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Systems-with-Multiplication/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Systems-with-Multiplication/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[176], bt[176], br[176]-bl[176], bb[176]-bt[176], 10*sfac[176]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[176]=paper.setFinish(); 
t[176].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[177]=paper.text(nx[177],ny[177]-10,'Addition and Subtraction\nof Polynomials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[177]});
t[177].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Multiplication-of-Monomials-by-Polynomials/#Addition and Subtraction of Polynomials", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Multiplication-of-Monomials-by-Polynomials/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Multiplication-of-Monomials-by-Polynomials/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[177], bt[177], br[177]-bl[177], bb[177]-bt[177], 10*sfac[177]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[177]=paper.setFinish(); 
t[177].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[178]=paper.text(nx[178],ny[178]-10,'Express a Linear Function in\nSlope-Intercept Form').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[178]});
t[178].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Write-a-Function-in-Slope-Intercept-Form/#Express a Linear Function in Slope-Intercept Form", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Write-a-Function-in-Slope-Intercept-Form/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Write-a-Function-in-Slope-Intercept-Form/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Write-a-Function-in-Slope-Intercept-Form/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[178], bt[178], br[178]-bl[178], bb[178]-bt[178], 10*sfac[178]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[178]=paper.setFinish(); 
t[178].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[179]=paper.text(nx[179],ny[179]-10,'Use of\nFormulas').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[179]});
t[179].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Formulas-for-Problem-Solving/#Use of Formulas", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Formulas-for-Problem-Solving/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Formulas-for-Problem-Solving/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[179], bt[179], br[179]-bl[179], bb[179]-bt[179], 10*sfac[179]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[179]=paper.setFinish(); 
t[179].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[180]=paper.text(nx[180],ny[180]-10,'Applying the Distributive Property').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[180]});
t[180].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Expressions-and-the-Distributive-Property/#Applying the Distributive Property", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Expressions-and-the-Distributive-Property/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Expressions-and-the-Distributive-Property/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Expressions-and-the-Distributive-Property/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[180], bt[180], br[180]-bl[180], bb[180]-bt[180], 10*sfac[180]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[180]=paper.setFinish(); 
t[180].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[181]=paper.text(nx[181],ny[181],'Simplifying Rational\nExpressions').attr({fill:"#666666","font-size": 14*sfac[181]});
tBox=t[181].getBBox(); 
bt[181]=ny[181]-(tBox.height/2+10*sfac[181]);
bb[181]=ny[181]+(tBox.height/2+10*sfac[181]);
bl[181]=nx[181]-(tBox.width/2+10*sfac[181]);
br[181]=nx[181]+(tBox.width/2+10*sfac[181]);
paper.setStart(); 
rect=paper.rect(bl[181], bt[181], br[181]-bl[181], bb[181]-bt[181], 10*sfac[181]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[181]=paper.setFinish(); 

t[182]=paper.text(nx[182],ny[182],'Motion Problems').attr({fill:"#666666","font-size": 14*sfac[182]});
tBox=t[182].getBBox(); 
bt[182]=ny[182]-(tBox.height/2+10*sfac[182]);
bb[182]=ny[182]+(tBox.height/2+10*sfac[182]);
bl[182]=nx[182]-(tBox.width/2+10*sfac[182]);
br[182]=nx[182]+(tBox.width/2+10*sfac[182]);
paper.setStart(); 
rect=paper.rect(bl[182], bt[182], br[182]-bl[182], bb[182]-bt[182], 10*sfac[182]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[182]=paper.setFinish(); 

t[183]=paper.text(nx[183],ny[183],'Multi-Step Equations').attr({fill:"#666666","font-size": 14*sfac[183]});
tBox=t[183].getBBox(); 
bt[183]=ny[183]-(tBox.height/2+10*sfac[183]);
bb[183]=ny[183]+(tBox.height/2+10*sfac[183]);
bl[183]=nx[183]-(tBox.width/2+10*sfac[183]);
br[183]=nx[183]+(tBox.width/2+10*sfac[183]);
paper.setStart(); 
rect=paper.rect(bl[183], bt[183], br[183]-bl[183], bb[183]-bt[183], 10*sfac[183]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[183]=paper.setFinish(); 

t[184]=paper.text(nx[184],ny[184]-10,'PEMDAS and Fraction Bars').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[184]});
t[184].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Algebra-Expressions-with-Fraction-Bars/#PEMDAS and Fraction Bars", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Algebra-Expressions-with-Fraction-Bars/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Algebra-Expressions-with-Fraction-Bars/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[184], bt[184], br[184]-bl[184], bb[184]-bt[184], 10*sfac[184]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[184]=paper.setFinish(); 
t[184].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[185]=paper.text(nx[185],ny[185]-10,'Predicting with Linear\nModels').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[185]});
t[185].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear-Interpolation-and-Extrapolation/#Predicting with Linear Models", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Linear-Interpolation-and-Extrapolation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Interpolation-and-Extrapolation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[185], bt[185], br[185]-bl[185], bb[185]-bt[185], 10*sfac[185]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[185]=paper.setFinish(); 
t[185].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[186]=paper.text(nx[186],ny[186]-10,'Tests of Solution Sets\nfor Linear Inequalities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[186]});
t[186].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inequalities-that-Describe-Patterns/#Tests of Solution Sets for Linear Inequalities", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Inequalities-that-Describe-Patterns/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inequalities-that-Describe-Patterns/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inequalities-that-Describe-Patterns/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[186], bt[186], br[186]-bl[186], bb[186]-bt[186], 10*sfac[186]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[186]=paper.setFinish(); 
t[186].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[187]=paper.text(nx[187],ny[187],'Polynomial Functions').attr({fill:"#666666","font-size": 14*sfac[187]});
tBox=t[187].getBBox(); 
bt[187]=ny[187]-(tBox.height/2+10*sfac[187]);
bb[187]=ny[187]+(tBox.height/2+10*sfac[187]);
bl[187]=nx[187]-(tBox.width/2+10*sfac[187]);
br[187]=nx[187]+(tBox.width/2+10*sfac[187]);
paper.setStart(); 
rect=paper.rect(bl[187], bt[187], br[187]-bl[187], bb[187]-bt[187], 10*sfac[187]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[187]=paper.setFinish(); 

t[188]=paper.text(nx[188],ny[188]-10,'Exponential Properties\nInvolving Quotients').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[188]});
t[188].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exponential-Properties-Involving-Quotients/#Exponential Properties Involving Quotients", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Exponential-Properties-Involving-Quotients/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Properties-Involving-Quotients/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exponential-Properties-Involving-Quotients/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[188], bt[188], br[188]-bl[188], bb[188]-bt[188], 10*sfac[188]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[188]=paper.setFinish(); 
t[188].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[189]=paper.text(nx[189],ny[189]-10,'Equations of Parallel Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[189]});
t[189].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Equations-of-Parallel-Lines/#Equations of Parallel Lines", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Equations-of-Parallel-Lines/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Equations-of-Parallel-Lines/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Equations-of-Parallel-Lines/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[189], bt[189], br[189]-bl[189], bb[189]-bt[189], 10*sfac[189]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[189]=paper.setFinish(); 
t[189].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[190]=paper.text(nx[190],ny[190]-10,'Graph Lines Using Slope-Intercept\nForm').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[190]});
t[190].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Graphs-Using-Slope-Intercept-Form/#Graph Lines Using Slope-Intercept Form", target: "_top",title:"Click to jump to concept"});
}); 
t[190].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[190].getBBox(); 
bt[190]=ny[190]-10-(tBox.height/2+10*sfac[190]);
bb[190]=ny[190]-10+(tBox.height/2+10*sfac[190]);
bl[190]=nx[190]-(tBox.width/2+10*sfac[190]);
br[190]=nx[190]+(tBox.width/2+10*sfac[190]);
var nwidth = br[190]-bl[190]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[190] = bl[190] - delta; 
    br[190] = br[190] + delta; 
} 
bb[190] = bb[190]+20; 
yicon = bb[190]-25; 
xicon2 = nx[190]+-40; 
xicon3 = nx[190]+-10; 
xicon4 = nx[190]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-Using-Slope-Intercept-Form/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-Using-Slope-Intercept-Form/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Graphs-Using-Slope-Intercept-Form/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[190], bt[190], br[190]-bl[190], bb[190]-bt[190], 10*sfac[190]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[190]=paper.setFinish(); 
t[190].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[191]=paper.text(nx[191],ny[191]-10,'Linear, Quadratic, and\nExponential Models').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[191]});
t[191].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear-Exponential-and-Quadratic-Models/#Linear, Quadratic, and Exponential Models", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Linear-Exponential-and-Quadratic-Models/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Exponential-and-Quadratic-Models/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Exponential-and-Quadratic-Models/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[191], bt[191], br[191]-bl[191], bb[191]-bt[191], 10*sfac[191]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[191]=paper.setFinish(); 
t[191].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[192]=paper.text(nx[192],ny[192]-10,'Simplifying Radical Expressions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[192]});
t[192].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Radical-Expressions/#Simplifying Radical Expressions", target: "_top",title:"Click to jump to concept"});
}); 
t[192].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[192].getBBox(); 
bt[192]=ny[192]-10-(tBox.height/2+10*sfac[192]);
bb[192]=ny[192]-10+(tBox.height/2+10*sfac[192]);
bl[192]=nx[192]-(tBox.width/2+10*sfac[192]);
br[192]=nx[192]+(tBox.width/2+10*sfac[192]);
var nwidth = br[192]-bl[192]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[192] = bl[192] - delta; 
    br[192] = br[192] + delta; 
} 
bb[192] = bb[192]+20; 
yicon = bb[192]-25; 
xicon2 = nx[192]+-40; 
xicon3 = nx[192]+-10; 
xicon4 = nx[192]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Radical-Expressions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Radical-Expressions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Radical-Expressions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[192], bt[192], br[192]-bl[192], bb[192]-bt[192], 10*sfac[192]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[192]=paper.setFinish(); 
t[192].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[193]=paper.text(nx[193],ny[193]-10,'Inverse Variation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[193]});
t[193].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inverse-Variation-Models/#Inverse Variation", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Inverse-Variation-Models/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inverse-Variation-Models/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inverse-Variation-Models/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[193], bt[193], br[193]-bl[193], bb[193]-bt[193], 10*sfac[193]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[193]=paper.setFinish(); 
t[193].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[194]=paper.text(nx[194],ny[194]-10,'Solving Rational Equations by\nClearing Denominators').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[194]});
t[194].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Clearing-Denominators-in-Rational-Equations/#Solving Rational Equations by Clearing Denominators", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Clearing-Denominators-in-Rational-Equations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Clearing-Denominators-in-Rational-Equations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[194], bt[194], br[194]-bl[194], bb[194]-bt[194], 10*sfac[194]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[194]=paper.setFinish(); 
t[194].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[195]=paper.text(nx[195],ny[195],'Decimals and Fractions').attr({fill:"#666666","font-size": 14*sfac[195]});
tBox=t[195].getBBox(); 
bt[195]=ny[195]-(tBox.height/2+10*sfac[195]);
bb[195]=ny[195]+(tBox.height/2+10*sfac[195]);
bl[195]=nx[195]-(tBox.width/2+10*sfac[195]);
br[195]=nx[195]+(tBox.width/2+10*sfac[195]);
paper.setStart(); 
rect=paper.rect(bl[195], bt[195], br[195]-bl[195], bb[195]-bt[195], 10*sfac[195]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[195]=paper.setFinish(); 

t[196]=paper.text(nx[196],ny[196],'Rational versus Irrational\nNumbers').attr({fill:"#666666","font-size": 14*sfac[196]});
tBox=t[196].getBBox(); 
bt[196]=ny[196]-(tBox.height/2+10*sfac[196]);
bb[196]=ny[196]+(tBox.height/2+10*sfac[196]);
bl[196]=nx[196]-(tBox.width/2+10*sfac[196]);
br[196]=nx[196]+(tBox.width/2+10*sfac[196]);
paper.setStart(); 
rect=paper.rect(bl[196], bt[196], br[196]-bl[196], bb[196]-bt[196], 10*sfac[196]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[196]=paper.setFinish(); 

t[197]=paper.text(nx[197],ny[197],'Joint and Combined\nVariation').attr({fill:"#666666","font-size": 14*sfac[197]});
tBox=t[197].getBBox(); 
bt[197]=ny[197]-(tBox.height/2+10*sfac[197]);
bb[197]=ny[197]+(tBox.height/2+10*sfac[197]);
bl[197]=nx[197]-(tBox.width/2+10*sfac[197]);
br[197]=nx[197]+(tBox.width/2+10*sfac[197]);
paper.setStart(); 
rect=paper.rect(bl[197], bt[197], br[197]-bl[197], bb[197]-bt[197], 10*sfac[197]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[197]=paper.setFinish(); 

t[198]=paper.text(nx[198],ny[198]-10,'Dividing a Polynomial\nby a Monomial').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[198]});
t[198].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Division-of-Polynomials/#Dividing a Polynomial by a Monomial", target: "_top",title:"Click to jump to concept"});
}); 
t[198].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[198].getBBox(); 
bt[198]=ny[198]-10-(tBox.height/2+10*sfac[198]);
bb[198]=ny[198]-10+(tBox.height/2+10*sfac[198]);
bl[198]=nx[198]-(tBox.width/2+10*sfac[198]);
br[198]=nx[198]+(tBox.width/2+10*sfac[198]);
var nwidth = br[198]-bl[198]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[198] = bl[198] - delta; 
    br[198] = br[198] + delta; 
} 
bb[198] = bb[198]+20; 
yicon = bb[198]-25; 
xicon2 = nx[198]+-40; 
xicon3 = nx[198]+-10; 
xicon4 = nx[198]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Division-of-Polynomials/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Division-of-Polynomials/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Division-of-Polynomials/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[198], bt[198], br[198]-bl[198], bb[198]-bt[198], 10*sfac[198]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[198]=paper.setFinish(); 
t[198].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[199]=paper.text(nx[199],ny[199],'Quadratic and Exponential\nEquations and Functions').attr({fill:"#666666","font-size": 14*sfac[199]});
tBox=t[199].getBBox(); 
bt[199]=ny[199]-(tBox.height/2+10*sfac[199]);
bb[199]=ny[199]+(tBox.height/2+10*sfac[199]);
bl[199]=nx[199]-(tBox.width/2+10*sfac[199]);
br[199]=nx[199]+(tBox.width/2+10*sfac[199]);
paper.setStart(); 
rect=paper.rect(bl[199], bt[199], br[199]-bl[199], bb[199]-bt[199], 10*sfac[199]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[199]=paper.setFinish(); 

t[200]=paper.text(nx[200],ny[200]-10,'Real-World Problems with\nExponential Functions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[200]});
t[200].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Applications-of-Exponential-Functions/#Real-World Problems with Exponential Functions", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Applications-of-Exponential-Functions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-of-Exponential-Functions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-of-Exponential-Functions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[200], bt[200], br[200]-bl[200], bb[200]-bt[200], 10*sfac[200]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[200]=paper.setFinish(); 
t[200].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[201]=paper.text(nx[201],ny[201],'Number Lines').attr({fill:"#666666","font-size": 14*sfac[201]});
tBox=t[201].getBBox(); 
bt[201]=ny[201]-(tBox.height/2+10*sfac[201]);
bb[201]=ny[201]+(tBox.height/2+10*sfac[201]);
bl[201]=nx[201]-(tBox.width/2+10*sfac[201]);
br[201]=nx[201]+(tBox.width/2+10*sfac[201]);
paper.setStart(); 
rect=paper.rect(bl[201], bt[201], br[201]-bl[201], bb[201]-bt[201], 10*sfac[201]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[201]=paper.setFinish(); 

t[202]=paper.text(nx[202],ny[202]-10,'Properties of Equality').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[202]});
t[202].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Equations-that-Describe-Patterns/#Properties of Equality", target: "_top",title:"Click to jump to concept"});
}); 
t[202].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[202].getBBox(); 
bt[202]=ny[202]-10-(tBox.height/2+10*sfac[202]);
bb[202]=ny[202]-10+(tBox.height/2+10*sfac[202]);
bl[202]=nx[202]-(tBox.width/2+10*sfac[202]);
br[202]=nx[202]+(tBox.width/2+10*sfac[202]);
var nwidth = br[202]-bl[202]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[202] = bl[202] - delta; 
    br[202] = br[202] + delta; 
} 
bb[202] = bb[202]+20; 
yicon = bb[202]-25; 
xicon2 = nx[202]+-40; 
xicon3 = nx[202]+-10; 
xicon4 = nx[202]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Equations-that-Describe-Patterns/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Equations-that-Describe-Patterns/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Equations-that-Describe-Patterns/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[202], bt[202], br[202]-bl[202], bb[202]-bt[202], 10*sfac[202]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[202]=paper.setFinish(); 
t[202].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[203]=paper.text(nx[203],ny[203]-10,'Use of Linear\nModels').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[203]});
t[203].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Applications-Using-Linear-Models/#Use of Linear Models", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-Using-Linear-Models/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[203], bt[203], br[203]-bl[203], bb[203]-bt[203], 10*sfac[203]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[203]=paper.setFinish(); 
t[203].toFront(); 
exicon.toFront(); 

t[204]=paper.text(nx[204],ny[204]-10,'Converting from Standard to\nSlope-Intercept to Point-Slope Form').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[204]});
t[204].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Standard-Form-of-Linear-Equations/#Converting from Standard to Slope-Intercept to Point-Slope Form", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Standard-Form-of-Linear-Equations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Standard-Form-of-Linear-Equations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Standard-Form-of-Linear-Equations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[204], bt[204], br[204]-bl[204], bb[204]-bt[204], 10*sfac[204]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[204]=paper.setFinish(); 
t[204].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[205]=paper.text(nx[205],ny[205]-10,'Solving Quadratic Equations by\nUsing the Quadratic Formula').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[205]});
t[205].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Quadratic-Formula/#Solving Quadratic Equations by Using the Quadratic Formula", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Quadratic-Formula/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Quadratic-Formula/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Quadratic-Formula/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[205], bt[205], br[205]-bl[205], bb[205]-bt[205], 10*sfac[205]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[205]=paper.setFinish(); 
t[205].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

bb[206]= ny[206]; 
bt[206]= ny[206]; 
bl[206]= nx[206]; 
br[206]= nx[206]; 

bb[207]= ny[207]; 
bt[207]= ny[207]; 
bl[207]= nx[207]; 
br[207]= nx[207]; 

bb[208]= ny[208]; 
bt[208]= ny[208]; 
bl[208]= nx[208]; 
br[208]= nx[208]; 

bb[209]= ny[209]; 
bt[209]= ny[209]; 
bl[209]= nx[209]; 
br[209]= nx[209]; 

bb[210]= ny[210]; 
bt[210]= ny[210]; 
bl[210]= nx[210]; 
br[210]= nx[210]; 

bb[211]= ny[211]; 
bt[211]= ny[211]; 
bl[211]= nx[211]; 
br[211]= nx[211]; 

bb[212]= ny[212]; 
bt[212]= ny[212]; 
bl[212]= nx[212]; 
br[212]= nx[212]; 

bb[213]= ny[213]; 
bt[213]= ny[213]; 
bl[213]= nx[213]; 
br[213]= nx[213]; 

bb[214]= ny[214]; 
bt[214]= ny[214]; 
bl[214]= nx[214]; 
br[214]= nx[214]; 

bb[215]= ny[215]; 
bt[215]= ny[215]; 
bl[215]= nx[215]; 
br[215]= nx[215]; 

bb[216]= ny[216]; 
bt[216]= ny[216]; 
bl[216]= nx[216]; 
br[216]= nx[216]; 

bb[217]= ny[217]; 
bt[217]= ny[217]; 
bl[217]= nx[217]; 
br[217]= nx[217]; 

bb[218]= ny[218]; 
bt[218]= ny[218]; 
bl[218]= nx[218]; 
br[218]= nx[218]; 

bb[219]= ny[219]; 
bt[219]= ny[219]; 
bl[219]= nx[219]; 
br[219]= nx[219]; 

bb[220]= ny[220]; 
bt[220]= ny[220]; 
bl[220]= nx[220]; 
br[220]= nx[220]; 

bb[221]= ny[221]; 
bt[221]= ny[221]; 
bl[221]= nx[221]; 
br[221]= nx[221]; 

bb[222]= ny[222]; 
bt[222]= ny[222]; 
bl[222]= nx[222]; 
br[222]= nx[222]; 

bb[223]= ny[223]; 
bt[223]= ny[223]; 
bl[223]= nx[223]; 
br[223]= nx[223]; 

bb[224]= ny[224]; 
bt[224]= ny[224]; 
bl[224]= nx[224]; 
br[224]= nx[224]; 

bb[225]= ny[225]; 
bt[225]= ny[225]; 
bl[225]= nx[225]; 
br[225]= nx[225]; 

bb[226]= ny[226]; 
bt[226]= ny[226]; 
bl[226]= nx[226]; 
br[226]= nx[226]; 

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
s1='M '+nx[1]+' '+bb[1]+' L '+nx[1]+' '+bt[202]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[1,202] ; 

paper.setStart(); 
mid=bb[3]+(bt[119]-bb[3])/2; 
hleft = nx[188]; 
hright = nx[3]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[3]+' '+bb[3]+' L '+nx[3]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[188]+' '+mid+' L '+nx[188]+' '+bt[188];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[3,188]; 

paper.setStart(); 
mid=bb[3]+(bt[119]-bb[3])/2; 
hleft = nx[6]; 
hright = nx[3]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[6]+' '+mid+' L '+nx[6]+' '+bt[6];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[3,6]; 

paper.setStart(); 
mid=bb[3]+(bt[119]-bb[3])/2; 
s3='M '+nx[119]+' '+mid+' L '+nx[119]+' '+bt[119];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[3,119]; 

paper.setStart(); 
mid=bb[3]+(bt[119]-bb[3])/2; 
s3='M '+nx[98]+' '+mid+' L '+nx[98]+' '+bt[98];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[3,98]; 

paper.setStart(); 
s1='M '+nx[4]+' '+bb[4]+' L '+nx[4]+' '+bt[89]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[4,89] ; 

paper.setStart(); 
s1='M '+nx[5]+' '+bb[5]+' L '+nx[5]+' '+ny[207]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[5]+' '+ny[207]+' L '+nx[151]+' '+ny[207]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[5,207]; 

paper.setStart(); 
s1='M '+nx[6]+' '+bb[6]+' L '+nx[6]+' '+bt[120]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[6,120] ; 

paper.setStart(); 
s1='M '+nx[7]+' '+bb[7]+' L '+nx[7]+' '+ny[216]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[7]+' '+ny[216]+' L '+nx[122]+' '+ny[216]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[7,216]; 

paper.setStart(); 
s1='M '+nx[8]+' '+bb[8]+' L '+nx[8]+' '+bt[3]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[8,3] ; 

paper.setStart(); 
s1='M '+nx[9]+' '+bb[9]+' L '+nx[9]+' '+bt[190]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[9,190] ; 

paper.setStart(); 
mid=bb[10]+(bt[53]-bb[10])/2; 
hleft = nx[56]; 
hright = nx[10]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[10]+' '+bb[10]+' L '+nx[10]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[56]+' '+mid+' L '+nx[56]+' '+bt[56];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[10,56]; 

paper.setStart(); 
mid=bb[10]+(bt[53]-bb[10])/2; 
s3='M '+nx[53]+' '+mid+' L '+nx[53]+' '+bt[53];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[10,53]; 

paper.setStart(); 
mid=bb[10]+(bt[53]-bb[10])/2; 
hleft = nx[184]; 
hright = nx[10]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[184]+' '+mid+' L '+nx[184]+' '+bt[184];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[10,184]; 

paper.setStart(); 
s1='M '+nx[12]+' '+bb[12]+' L '+nx[12]+' '+bt[68]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[12,68] ; 

paper.setStart(); 
s1='M '+nx[13]+' '+bb[13]+' L '+nx[13]+' '+bt[12]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[13,12] ; 

paper.setStart(); 
s1='M '+nx[14]+' '+bb[14]+' L '+nx[14]+' '+bt[30]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[14,30] ; 

paper.setStart(); 
s1='M '+nx[16]+' '+bb[16]+' L '+nx[16]+' '+bt[197]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[16,197] ; 

paper.setStart(); 
s1='M '+nx[17]+' '+bb[17]+' L '+nx[17]+' '+ny[215]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[17,215]; 

paper.setStart(); 
s1='M '+nx[18]+' '+bb[18]+' L '+nx[18]+' '+bt[133]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[18,133] ; 

paper.setStart(); 
s1='M '+nx[18]+' '+bb[18]+' L '+nx[18]+' '+ny[210]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[18]+' '+ny[210]+' L '+nx[142]+' '+ny[210]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[18,210]; 

paper.setStart(); 
s1='M '+nx[19]+' '+bb[19]+' L '+nx[19]+' '+ny[223]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[19]+' '+ny[223]+' L '+nx[136]+' '+ny[223]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[19,223]; 

paper.setStart(); 
mid=bb[20]+(bt[125]-bb[20])/2; 
hleft = nx[125]; 
hright = nx[20]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[20]+' '+bb[20]+' L '+nx[20]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[125]+' '+mid+' L '+nx[125]+' '+bt[125];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[20,125]; 

paper.setStart(); 
mid=bb[20]+(bt[125]-bb[20])/2; 
hleft = nx[65]; 
hright = nx[20]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[65]+' '+mid+' L '+nx[65]+' '+bt[65];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[20,65]; 

paper.setStart(); 
s1='M '+nx[22]+' '+bb[22]+' L '+nx[22]+' '+bt[42]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[22,42] ; 

paper.setStart(); 
mid=bb[23]+(bt[128]-bb[23])/2; 
hleft = nx[108]; 
hright = nx[23]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[108]+' '+mid+' L '+nx[108]+' '+bt[108];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[23,108]; 

paper.setStart(); 
mid=bb[23]+(bt[128]-bb[23])/2; 
hleft = nx[128]; 
hright = nx[23]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[128]+' '+mid+' L '+nx[128]+' '+bt[128];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[23,128]; 

paper.setStart(); 
s1='M '+nx[24]+' '+bb[24]+' L '+nx[24]+' '+ny[226]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[24]+' '+ny[226]+' L '+nx[154]+' '+ny[226]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[24,226]; 

paper.setStart(); 
s1='M '+nx[26]+' '+bb[26]+' L '+nx[26]+' '+ny[224]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[26,224]; 

paper.setStart(); 
s1='M '+nx[27]+' '+bb[27]+' L '+nx[27]+' '+bt[149]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[27,149] ; 

paper.setStart(); 
s1='M '+nx[28]+' '+bb[28]+' L '+nx[28]+' '+bt[5]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[28,5] ; 

paper.setStart(); 
s1='M '+nx[31]+' '+bb[31]+' L '+nx[31]+' '+bt[106]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[31,106] ; 

paper.setStart(); 
mid=bb[32]+(bt[121]-bb[32])/2; 
hleft = nx[181]; 
hright = nx[32]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[32]+' '+bb[32]+' L '+nx[32]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[181]+' '+mid+' L '+nx[181]+' '+bt[181];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[32,181]; 

paper.setStart(); 
mid=bb[32]+(bt[121]-bb[32])/2; 
hleft = nx[121]; 
hright = nx[32]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[121]+' '+mid+' L '+nx[121]+' '+bt[121];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[32,121]; 

paper.setStart(); 
s1='M '+nx[33]+' '+bb[33]+' L '+nx[33]+' '+bt[111]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[33,111] ; 

paper.setStart(); 
mid=bb[35]+(bt[143]-bb[35])/2; 
hleft = nx[151]; 
hright = nx[35]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[35]+' '+bb[35]+' L '+nx[35]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[151]+' '+mid+' L '+nx[151]+' '+bt[151];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[35,151]; 

paper.setStart(); 
mid=bb[35]+(bt[143]-bb[35])/2; 
hleft = nx[143]; 
hright = nx[35]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[143]+' '+mid+' L '+nx[143]+' '+bt[143];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[35,143]; 

paper.setStart(); 
s1='M '+nx[36]+' '+bb[36]+' L '+nx[36]+' '+ny[226]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[36,226]; 

paper.setStart(); 
s1='M '+nx[37]+' '+bb[37]+' L '+nx[37]+' '+ny[219]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[37,219]; 

paper.setStart(); 
s1='M '+nx[39]+' '+bb[39]+' L '+nx[39]+' '+ny[218]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[39]+' '+ny[218]+' L '+nx[174]+' '+ny[218]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[39,218]; 

paper.setStart(); 
s1='M '+nx[41]+' '+bb[41]+' L '+nx[41]+' '+bt[49]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[41,49] ; 

paper.setStart(); 
s1='M '+nx[43]+' '+bb[43]+' L '+nx[43]+' '+ny[222]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[43,222]; 

paper.setStart(); 
mid=bb[44]+(bt[196]-bb[44])/2; 
hleft = nx[57]; 
hright = nx[44]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[44]+' '+bb[44]+' L '+nx[44]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[57]+' '+mid+' L '+nx[57]+' '+bt[57];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[44,57]; 

paper.setStart(); 
mid=bb[44]+(bt[196]-bb[44])/2; 
hleft = nx[196]; 
hright = nx[44]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[196]+' '+mid+' L '+nx[196]+' '+bt[196];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[44,196]; 

paper.setStart(); 
mid=bb[45]+(bt[21]-bb[45])/2; 
hleft = nx[105]; 
hright = nx[45]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[45]+' '+bb[45]+' L '+nx[45]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[105]+' '+mid+' L '+nx[105]+' '+bt[105];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[45,105]; 

paper.setStart(); 
mid=bb[45]+(bt[21]-bb[45])/2; 
s3='M '+nx[157]+' '+mid+' L '+nx[157]+' '+bt[157];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[45,157]; 

paper.setStart(); 
mid=bb[45]+(bt[21]-bb[45])/2; 
hleft = nx[21]; 
hright = nx[45]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[21]+' '+mid+' L '+nx[21]+' '+bt[21];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[45,21]; 

paper.setStart(); 
s1='M '+nx[46]+' '+bb[46]+' L '+nx[46]+' '+bt[19]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[46,19] ; 

paper.setStart(); 
s1='M '+nx[47]+' '+bb[47]+' L '+nx[47]+' '+bt[66]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[47,66] ; 

paper.setStart(); 
s1='M '+nx[48]+' '+bb[48]+' L '+nx[48]+' '+bt[123]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[49]=paper.setFinish(); 
lineNodes[49]=[48,123] ; 

paper.setStart(); 
mid=bb[49]+(bt[7]-bb[49])/2; 
hleft = nx[7]; 
hright = nx[49]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[49]+' '+bb[49]+' L '+nx[49]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[7]+' '+mid+' L '+nx[7]+' '+bt[7];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[49,7]; 

paper.setStart(); 
mid=bb[49]+(bt[7]-bb[49])/2; 
hleft = nx[122]; 
hright = nx[49]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[122]+' '+mid+' L '+nx[122]+' '+bt[122];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[49,122]; 

paper.setStart(); 
mid=bb[50]+(bt[166]-bb[50])/2; 
hleft = nx[166]; 
hright = nx[50]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[50]+' '+bb[50]+' L '+nx[50]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[166]+' '+mid+' L '+nx[166]+' '+bt[166];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[50,166]; 

paper.setStart(); 
mid=bb[50]+(bt[166]-bb[50])/2; 
hleft = nx[70]; 
hright = nx[50]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[70]+' '+mid+' L '+nx[70]+' '+bt[70];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[50,70]; 

paper.setStart(); 
s1='M '+nx[53]+' '+bb[53]+' L '+nx[53]+' '+ny[221]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[53,221]; 

paper.setStart(); 
s1='M '+nx[54]+' '+bb[54]+' L '+nx[54]+' '+ny[214]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[54,214]; 

paper.setStart(); 
mid=bb[55]+(bt[129]-bb[55])/2; 
s2='M '+nx[55]+' '+bb[55]+' L '+nx[55]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[2]+' '+mid+' L '+nx[2]+' '+bt[2];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[55,2]; 

paper.setStart(); 
mid=bb[55]+(bt[129]-bb[55])/2; 
hleft = nx[194]; 
hright = nx[55]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[194]+' '+mid+' L '+nx[194]+' '+bt[194];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[55,194]; 

paper.setStart(); 
mid=bb[55]+(bt[129]-bb[55])/2; 
s3='M '+nx[144]+' '+mid+' L '+nx[144]+' '+bt[144];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[55,144]; 

paper.setStart(); 
mid=bb[55]+(bt[129]-bb[55])/2; 
hleft = nx[182]; 
hright = nx[55]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[182]+' '+mid+' L '+nx[182]+' '+bt[182];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[55,182]; 

paper.setStart(); 
mid=bb[55]+(bt[129]-bb[55])/2; 
s3='M '+nx[129]+' '+mid+' L '+nx[129]+' '+bt[129];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[55,129]; 

paper.setStart(); 
s1='M '+nx[56]+' '+bb[56]+' L '+nx[56]+' '+ny[221]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[56,221]; 

paper.setStart(); 
mid=bb[57]+(bt[14]-bb[57])/2; 
hleft = nx[14]; 
hright = nx[57]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[57]+' '+bb[57]+' L '+nx[57]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[14]+' '+mid+' L '+nx[14]+' '+bt[14];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[57,14]; 

paper.setStart(); 
mid=bb[57]+(bt[14]-bb[57])/2; 
hleft = nx[140]; 
hright = nx[57]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[140]+' '+mid+' L '+nx[140]+' '+bt[140];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[57,140]; 

paper.setStart(); 
s1='M '+nx[58]+' '+bb[58]+' L '+nx[58]+' '+bt[131]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[58,131] ; 

paper.setStart(); 
s1='M '+nx[59]+' '+bb[59]+' L '+nx[59]+' '+bt[205]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[59,205] ; 

paper.setStart(); 
s1='M '+nx[60]+' '+bb[60]+' L '+nx[60]+' '+bt[199]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[60,199] ; 

paper.setStart(); 
s1='M '+nx[61]+' '+bb[61]+' L '+nx[61]+' '+ny[222]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[61]+' '+ny[222]+' L '+nx[43]+' '+ny[222]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[61,222]; 

paper.setStart(); 
mid=bb[64]+(bt[159]-bb[64])/2; 
s2='M '+nx[64]+' '+bb[64]+' L '+nx[64]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[91]+' '+mid+' L '+nx[91]+' '+bt[91];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[64,91]; 

paper.setStart(); 
mid=bb[64]+(bt[159]-bb[64])/2; 
hleft = nx[92]; 
hright = nx[64]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[92]+' '+mid+' L '+nx[92]+' '+bt[92];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[69]=paper.setFinish(); 
lineNodes[69]=[64,92]; 

paper.setStart(); 
mid=bb[64]+(bt[159]-bb[64])/2; 
s3='M '+nx[176]+' '+mid+' L '+nx[176]+' '+bt[176];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[70]=paper.setFinish(); 
lineNodes[70]=[64,176]; 

paper.setStart(); 
mid=bb[64]+(bt[159]-bb[64])/2; 
hleft = nx[159]; 
hright = nx[64]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[159]+' '+mid+' L '+nx[159]+' '+bt[159];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[71]=paper.setFinish(); 
lineNodes[71]=[64,159]; 

paper.setStart(); 
mid=bb[64]+(bt[159]-bb[64])/2; 
s3='M '+nx[93]+' '+mid+' L '+nx[93]+' '+bt[93];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[72]=paper.setFinish(); 
lineNodes[72]=[64,93]; 

paper.setStart(); 
s1='M '+nx[65]+' '+bb[65]+' L '+nx[65]+' '+ny[220]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[73]=paper.setFinish(); 
lineNodes[73]=[65,220]; 

paper.setStart(); 
s1='M '+nx[66]+' '+bb[66]+' L '+nx[66]+' '+bt[33]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[74]=paper.setFinish(); 
lineNodes[74]=[66,33] ; 

paper.setStart(); 
mid=bb[67]+(bt[48]-bb[67])/2; 
hleft = nx[107]; 
hright = nx[67]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[67]+' '+bb[67]+' L '+nx[67]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[107]+' '+mid+' L '+nx[107]+' '+bt[107];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[75]=paper.setFinish(); 
lineNodes[75]=[67,107]; 

paper.setStart(); 
mid=bb[67]+(bt[48]-bb[67])/2; 
hleft = nx[48]; 
hright = nx[67]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[48]+' '+mid+' L '+nx[48]+' '+bt[48];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[76]=paper.setFinish(); 
lineNodes[76]=[67,48]; 

paper.setStart(); 
s1='M '+nx[68]+' '+bb[68]+' L '+nx[68]+' '+bt[170]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[77]=paper.setFinish(); 
lineNodes[77]=[68,170] ; 

paper.setStart(); 
s1='M '+nx[69]+' '+bb[69]+' L '+nx[69]+' '+ny[206]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[78]=paper.setFinish(); 
lineNodes[78]=[69,206]; 

paper.setStart(); 
s1='M '+nx[70]+' '+bb[70]+' L '+nx[70]+' '+ny[206]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[79]=paper.setFinish(); 
lineNodes[79]=[70,206]; 

paper.setStart(); 
mid=bb[72]+(bt[18]-bb[72])/2; 
hleft = nx[18]; 
hright = nx[72]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[72]+' '+bb[72]+' L '+nx[72]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[18]+' '+mid+' L '+nx[18]+' '+bt[18];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[80]=paper.setFinish(); 
lineNodes[80]=[72,18]; 

paper.setStart(); 
mid=bb[72]+(bt[18]-bb[72])/2; 
hleft = nx[142]; 
hright = nx[72]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[142]+' '+mid+' L '+nx[142]+' '+bt[142];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[81]=paper.setFinish(); 
lineNodes[81]=[72,142]; 

paper.setStart(); 
mid=bb[74]+(bt[51]-bb[74])/2; 
hleft = nx[11]; 
hright = nx[74]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[74]+' '+bb[74]+' L '+nx[74]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[11]+' '+mid+' L '+nx[11]+' '+bt[11];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[82]=paper.setFinish(); 
lineNodes[82]=[74,11]; 

paper.setStart(); 
mid=bb[74]+(bt[51]-bb[74])/2; 
hleft = nx[51]; 
hright = nx[74]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[51]+' '+mid+' L '+nx[51]+' '+bt[51];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[83]=paper.setFinish(); 
lineNodes[83]=[74,51]; 

paper.setStart(); 
s1='M '+nx[75]+' '+bb[75]+' L '+nx[75]+' '+ny[219]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[75]+' '+ny[219]+' L '+nx[37]+' '+ny[219]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[84]=paper.setFinish(); 
lineNodes[84]=[75,219]; 

paper.setStart(); 
mid=bb[76]+(bt[0]-bb[76])/2; 
hleft = nx[0]; 
hright = nx[76]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[76]+' '+bb[76]+' L '+nx[76]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[0]+' '+mid+' L '+nx[0]+' '+bt[0];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[85]=paper.setFinish(); 
lineNodes[85]=[76,0]; 

paper.setStart(); 
mid=bb[76]+(bt[0]-bb[76])/2; 
s3='M '+nx[71]+' '+mid+' L '+nx[71]+' '+bt[71];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[86]=paper.setFinish(); 
lineNodes[86]=[76,71]; 

paper.setStart(); 
mid=bb[76]+(bt[0]-bb[76])/2; 
hleft = nx[161]; 
hright = nx[76]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[161]+' '+mid+' L '+nx[161]+' '+bt[161];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[87]=paper.setFinish(); 
lineNodes[87]=[76,161]; 

paper.setStart(); 
mid=bb[77]+(bt[62]-bb[77])/2; 
hleft = nx[62]; 
hright = nx[77]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[77]+' '+bb[77]+' L '+nx[77]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[62]+' '+mid+' L '+nx[62]+' '+bt[62];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[88]=paper.setFinish(); 
lineNodes[88]=[77,62]; 

paper.setStart(); 
mid=bb[77]+(bt[62]-bb[77])/2; 
hleft = nx[192]; 
hright = nx[77]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[192]+' '+mid+' L '+nx[192]+' '+bt[192];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[89]=paper.setFinish(); 
lineNodes[89]=[77,192]; 

paper.setStart(); 
mid=bb[77]+(bt[62]-bb[77])/2; 
s3='M '+nx[78]+' '+mid+' L '+nx[78]+' '+bt[78];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[90]=paper.setFinish(); 
lineNodes[90]=[77,78]; 

paper.setStart(); 
mid=bb[77]+(bt[62]-bb[77])/2; 
s3='M '+nx[158]+' '+mid+' L '+nx[158]+' '+bt[158];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[91]=paper.setFinish(); 
lineNodes[91]=[77,158]; 

paper.setStart(); 
s1='M '+nx[78]+' '+bb[78]+' L '+nx[78]+' '+bt[27]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[92]=paper.setFinish(); 
lineNodes[92]=[78,27] ; 

paper.setStart(); 
s1='M '+nx[79]+' '+bb[79]+' L '+nx[79]+' '+bt[154]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[93]=paper.setFinish(); 
lineNodes[93]=[79,154] ; 

paper.setStart(); 
s1='M '+nx[81]+' '+bb[81]+' L '+nx[81]+' '+bt[28]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[94]=paper.setFinish(); 
lineNodes[94]=[81,28] ; 

paper.setStart(); 
s1='M '+nx[82]+' '+bb[82]+' L '+nx[82]+' '+bt[138]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[95]=paper.setFinish(); 
lineNodes[95]=[82,138] ; 

paper.setStart(); 
s1='M '+nx[83]+' '+bb[83]+' L '+nx[83]+' '+bt[172]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[96]=paper.setFinish(); 
lineNodes[96]=[83,172] ; 

paper.setStart(); 
s1='M '+nx[84]+' '+bb[84]+' L '+nx[84]+' '+ny[220]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[97]=paper.setFinish(); 
lineNodes[97]=[84,220]; 

paper.setStart(); 
s1='M '+nx[85]+' '+bb[85]+' L '+nx[85]+' '+bt[58]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[98]=paper.setFinish(); 
lineNodes[98]=[85,58] ; 

paper.setStart(); 
mid=bb[73]+(bt[96]-bb[73])/2; 
hleft = nx[96]; 
hright = nx[86]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[86]+' '+bb[86]+' L '+nx[86]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[96]+' '+mid+' L '+nx[96]+' '+bt[96];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[99]=paper.setFinish(); 
lineNodes[99]=[86,96]; 

paper.setStart(); 
mid=bb[73]+(bt[96]-bb[73])/2; 
hleft = nx[20]; 
hright = nx[86]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[20]+' '+mid+' L '+nx[20]+' '+bt[20];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[100]=paper.setFinish(); 
lineNodes[100]=[86,20]; 

paper.setStart(); 
s1='M '+nx[87]+' '+bb[87]+' L '+nx[87]+' '+bt[147]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[101]=paper.setFinish(); 
lineNodes[101]=[87,147] ; 

paper.setStart(); 
s1='M '+nx[88]+' '+bb[88]+' L '+nx[88]+' '+ny[217]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[102]=paper.setFinish(); 
lineNodes[102]=[88,217]; 

paper.setStart(); 
mid=bb[89]+(bt[179]-bb[89])/2; 
s2='M '+nx[89]+' '+bb[89]+' L '+nx[89]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[36]+' '+mid+' L '+nx[36]+' '+bt[36];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[103]=paper.setFinish(); 
lineNodes[103]=[89,36]; 

paper.setStart(); 
mid=bb[89]+(bt[179]-bb[89])/2; 
s3='M '+nx[134]+' '+mid+' L '+nx[134]+' '+bt[134];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[104]=paper.setFinish(); 
lineNodes[104]=[89,134]; 

paper.setStart(); 
mid=bb[89]+(bt[179]-bb[89])/2; 
s3='M '+nx[112]+' '+mid+' L '+nx[112]+' '+bt[112];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[105]=paper.setFinish(); 
lineNodes[105]=[89,112]; 

paper.setStart(); 
mid=bb[89]+(bt[179]-bb[89])/2; 
s3='M '+nx[179]+' '+mid+' L '+nx[179]+' '+bt[179];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[106]=paper.setFinish(); 
lineNodes[106]=[89,179]; 

paper.setStart(); 
mid=bb[89]+(bt[179]-bb[89])/2; 
hleft = nx[203]; 
hright = nx[89]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[203]+' '+mid+' L '+nx[203]+' '+bt[203];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[107]=paper.setFinish(); 
lineNodes[107]=[89,203]; 

paper.setStart(); 
mid=bb[89]+(bt[179]-bb[89])/2; 
hleft = nx[24]; 
hright = nx[89]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[24]+' '+mid+' L '+nx[24]+' '+bt[24];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[108]=paper.setFinish(); 
lineNodes[108]=[89,24]; 

paper.setStart(); 
s1='M '+nx[90]+' '+bb[90]+' L '+nx[90]+' '+bt[4]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[109]=paper.setFinish(); 
lineNodes[109]=[90,4] ; 

paper.setStart(); 
s1='M '+nx[90]+' '+bb[90]+' L '+nx[90]+' '+ny[225]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[90]+' '+ny[225]+' L '+nx[146]+' '+ny[225]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[110]=paper.setFinish(); 
lineNodes[110]=[90,225]; 

paper.setStart(); 
s1='M '+nx[91]+' '+bb[91]+' L '+nx[91]+' '+ny[209]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[111]=paper.setFinish(); 
lineNodes[111]=[91,209]; 

paper.setStart(); 
s1='M '+nx[92]+' '+bb[92]+' L '+nx[92]+' '+ny[209]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[112]=paper.setFinish(); 
lineNodes[112]=[92,209]; 

paper.setStart(); 
s1='M '+nx[93]+' '+bb[93]+' L '+nx[93]+' '+ny[209]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[113]=paper.setFinish(); 
lineNodes[113]=[93,209]; 

paper.setStart(); 
s1='M '+nx[94]+' '+bb[94]+' L '+nx[94]+' '+bt[59]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[114]=paper.setFinish(); 
lineNodes[114]=[94,59] ; 

paper.setStart(); 
s1='M '+nx[95]+' '+bb[95]+' L '+nx[95]+' '+bt[103]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[115]=paper.setFinish(); 
lineNodes[115]=[95,103] ; 

paper.setStart(); 
mid=bb[96]+(bt[180]-bb[96])/2; 
hleft = nx[180]; 
hright = nx[96]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[96]+' '+bb[96]+' L '+nx[96]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[180]+' '+mid+' L '+nx[180]+' '+bt[180];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[116]=paper.setFinish(); 
lineNodes[116]=[96,180]; 

paper.setStart(); 
mid=bb[96]+(bt[180]-bb[96])/2; 
hleft = nx[84]; 
hright = nx[96]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[84]+' '+mid+' L '+nx[84]+' '+bt[84];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[117]=paper.setFinish(); 
lineNodes[117]=[96,84]; 

paper.setStart(); 
mid=bb[97]+(bt[86]-bb[97])/2; 
hleft = nx[73]; 
hright = nx[97]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[97]+' '+bb[97]+' L '+nx[97]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[73]+' '+mid+' L '+nx[73]+' '+bt[73];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[118]=paper.setFinish(); 
lineNodes[118]=[97,73]; 

paper.setStart(); 
mid=bb[97]+(bt[86]-bb[97])/2; 
hleft = nx[86]; 
hright = nx[97]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[86]+' '+mid+' L '+nx[86]+' '+bt[86];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[119]=paper.setFinish(); 
lineNodes[119]=[97,86]; 

paper.setStart(); 
mid=bb[98]+(bt[39]-bb[98])/2; 
hleft = nx[174]; 
hright = nx[98]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[98]+' '+bb[98]+' L '+nx[98]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[174]+' '+mid+' L '+nx[174]+' '+bt[174];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[120]=paper.setFinish(); 
lineNodes[120]=[98,174]; 

paper.setStart(); 
mid=bb[98]+(bt[39]-bb[98])/2; 
hleft = nx[39]; 
hright = nx[98]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[39]+' '+mid+' L '+nx[39]+' '+bt[39];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[121]=paper.setFinish(); 
lineNodes[121]=[98,39]; 

paper.setStart(); 
s1='M '+nx[100]+' '+bb[100]+' L '+nx[100]+' '+ny[215]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[100]+' '+ny[215]+' L '+nx[123]+' '+ny[215]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[122]=paper.setFinish(); 
lineNodes[122]=[100,215]; 

paper.setStart(); 
s1='M '+nx[101]+' '+bb[101]+' L '+nx[101]+' '+bt[171]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[123]=paper.setFinish(); 
lineNodes[123]=[101,171] ; 

paper.setStart(); 
s1='M '+nx[102]+' '+bb[102]+' L '+nx[102]+' '+ny[217]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[102]+' '+ny[217]+' L '+nx[88]+' '+ny[217]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[124]=paper.setFinish(); 
lineNodes[124]=[102,217]; 

paper.setStart(); 
mid=bb[106]+(bt[141]-bb[106])/2; 
hleft = nx[141]; 
hright = nx[106]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[106]+' '+bb[106]+' L '+nx[106]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[141]+' '+mid+' L '+nx[141]+' '+bt[141];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[125]=paper.setFinish(); 
lineNodes[125]=[106,141]; 

paper.setStart(); 
mid=bb[106]+(bt[141]-bb[106])/2; 
hleft = nx[186]; 
hright = nx[106]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[186]+' '+mid+' L '+nx[186]+' '+bt[186];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[126]=paper.setFinish(); 
lineNodes[126]=[106,186]; 

paper.setStart(); 
mid=bb[107]+(bt[17]-bb[107])/2; 
hleft = nx[100]; 
hright = nx[107]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[107]+' '+bb[107]+' L '+nx[107]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[100]+' '+mid+' L '+nx[100]+' '+bt[100];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[127]=paper.setFinish(); 
lineNodes[127]=[107,100]; 

paper.setStart(); 
mid=bb[107]+(bt[17]-bb[107])/2; 
hleft = nx[17]; 
hright = nx[107]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[17]+' '+mid+' L '+nx[17]+' '+bt[17];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[128]=paper.setFinish(); 
lineNodes[128]=[107,17]; 

paper.setStart(); 
mid=bb[109]+(bt[189]-bb[109])/2; 
s2='M '+nx[109]+' '+bb[109]+' L '+nx[109]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[99]+' '+mid+' L '+nx[99]+' '+bt[99];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[129]=paper.setFinish(); 
lineNodes[129]=[109,99]; 

paper.setStart(); 
mid=bb[109]+(bt[189]-bb[109])/2; 
hleft = nx[189]; 
hright = nx[109]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[189]+' '+mid+' L '+nx[189]+' '+bt[189];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[130]=paper.setFinish(); 
lineNodes[130]=[109,189]; 

paper.setStart(); 
mid=bb[109]+(bt[189]-bb[109])/2; 
hleft = nx[25]; 
hright = nx[109]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[25]+' '+mid+' L '+nx[25]+' '+bt[25];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[131]=paper.setFinish(); 
lineNodes[131]=[109,25]; 

paper.setStart(); 
s1='M '+nx[111]+' '+bb[111]+' L '+nx[111]+' '+bt[135]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[132]=paper.setFinish(); 
lineNodes[132]=[111,135] ; 

paper.setStart(); 
s1='M '+nx[112]+' '+bb[112]+' L '+nx[112]+' '+ny[226]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[133]=paper.setFinish(); 
lineNodes[133]=[112,226]; 

paper.setStart(); 
s1='M '+nx[114]+' '+bb[114]+' L '+nx[114]+' '+ny[211]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[134]=paper.setFinish(); 
lineNodes[134]=[114,211]; 

paper.setStart(); 
mid=bb[116]+(bt[110]-bb[116])/2; 
s2='M '+nx[116]+' '+bb[116]+' L '+nx[116]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[160]+' '+mid+' L '+nx[160]+' '+bt[160];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[135]=paper.setFinish(); 
lineNodes[135]=[116,160]; 

paper.setStart(); 
mid=bb[116]+(bt[110]-bb[116])/2; 
hleft = nx[15]; 
hright = nx[116]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[15]+' '+mid+' L '+nx[15]+' '+bt[15];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[136]=paper.setFinish(); 
lineNodes[136]=[116,15]; 

paper.setStart(); 
mid=bb[116]+(bt[110]-bb[116])/2; 
s3='M '+nx[110]+' '+mid+' L '+nx[110]+' '+bt[110];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[137]=paper.setFinish(); 
lineNodes[137]=[116,110]; 

paper.setStart(); 
mid=bb[116]+(bt[110]-bb[116])/2; 
hleft = nx[185]; 
hright = nx[116]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[185]+' '+mid+' L '+nx[185]+' '+bt[185];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[138]=paper.setFinish(); 
lineNodes[138]=[116,185]; 

paper.setStart(); 
s1='M '+nx[117]+' '+bb[117]+' L '+nx[117]+' '+bt[173]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[139]=paper.setFinish(); 
lineNodes[139]=[117,173] ; 

paper.setStart(); 
s1='M '+nx[118]+' '+bb[118]+' L '+nx[118]+' '+bt[136]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[140]=paper.setFinish(); 
lineNodes[140]=[118,136] ; 

paper.setStart(); 
mid=bb[121]+(bt[155]-bb[121])/2; 
hleft = nx[164]; 
hright = nx[121]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[121]+' '+bb[121]+' L '+nx[121]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[164]+' '+mid+' L '+nx[164]+' '+bt[164];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[141]=paper.setFinish(); 
lineNodes[141]=[121,164]; 

paper.setStart(); 
mid=bb[121]+(bt[155]-bb[121])/2; 
hleft = nx[155]; 
hright = nx[121]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[155]+' '+mid+' L '+nx[155]+' '+bt[155];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[142]=paper.setFinish(); 
lineNodes[142]=[121,155]; 

paper.setStart(); 
s1='M '+nx[122]+' '+bb[122]+' L '+nx[122]+' '+ny[216]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[143]=paper.setFinish(); 
lineNodes[143]=[122,216]; 

paper.setStart(); 
s1='M '+nx[123]+' '+bb[123]+' L '+nx[123]+' '+ny[215]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[144]=paper.setFinish(); 
lineNodes[144]=[123,215]; 

paper.setStart(); 
mid=bb[124]+(bt[80]-bb[124])/2; 
hleft = nx[64]; 
hright = nx[124]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[124]+' '+bb[124]+' L '+nx[124]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[64]+' '+mid+' L '+nx[64]+' '+bt[64];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[145]=paper.setFinish(); 
lineNodes[145]=[124,64]; 

paper.setStart(); 
mid=bb[124]+(bt[80]-bb[124])/2; 
hleft = nx[80]; 
hright = nx[124]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[80]+' '+mid+' L '+nx[80]+' '+bt[80];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[146]=paper.setFinish(); 
lineNodes[146]=[124,80]; 

paper.setStart(); 
s1='M '+nx[125]+' '+bb[125]+' L '+nx[125]+' '+ny[220]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[147]=paper.setFinish(); 
lineNodes[147]=[125,220]; 

paper.setStart(); 
mid=bb[126]+(bt[162]-bb[126])/2; 
hleft = nx[63]; 
hright = nx[126]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[126]+' '+bb[126]+' L '+nx[126]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[63]+' '+mid+' L '+nx[63]+' '+bt[63];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[148]=paper.setFinish(); 
lineNodes[148]=[126,63]; 

paper.setStart(); 
mid=bb[126]+(bt[162]-bb[126])/2; 
s3='M '+nx[162]+' '+mid+' L '+nx[162]+' '+bt[162];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[149]=paper.setFinish(); 
lineNodes[149]=[126,162]; 

paper.setStart(); 
mid=bb[126]+(bt[162]-bb[126])/2; 
hleft = nx[139]; 
hright = nx[126]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[139]+' '+mid+' L '+nx[139]+' '+bt[139];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[150]=paper.setFinish(); 
lineNodes[150]=[126,139]; 

paper.setStart(); 
mid=bb[127]+(bt[178]-bb[127])/2; 
hleft = nx[34]; 
hright = nx[127]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[127]+' '+bb[127]+' L '+nx[127]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[34]+' '+mid+' L '+nx[34]+' '+bt[34];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[151]=paper.setFinish(); 
lineNodes[151]=[127,34]; 

paper.setStart(); 
mid=bb[127]+(bt[178]-bb[127])/2; 
hleft = nx[116]; 
hright = nx[127]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[116]+' '+mid+' L '+nx[116]+' '+bt[116];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[152]=paper.setFinish(); 
lineNodes[152]=[127,116]; 

paper.setStart(); 
mid=bb[127]+(bt[178]-bb[127])/2; 
s3='M '+nx[204]+' '+mid+' L '+nx[204]+' '+bt[204];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[153]=paper.setFinish(); 
lineNodes[153]=[127,204]; 

paper.setStart(); 
mid=bb[127]+(bt[178]-bb[127])/2; 
s3='M '+nx[109]+' '+mid+' L '+nx[109]+' '+bt[109];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[154]=paper.setFinish(); 
lineNodes[154]=[127,109]; 

paper.setStart(); 
mid=bb[127]+(bt[178]-bb[127])/2; 
s3='M '+nx[178]+' '+mid+' L '+nx[178]+' '+bt[178];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[155]=paper.setFinish(); 
lineNodes[155]=[127,178]; 

paper.setStart(); 
mid=bb[130]+(bt[175]-bb[130])/2; 
hleft = nx[195]; 
hright = nx[130]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[130]+' '+bb[130]+' L '+nx[130]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[195]+' '+mid+' L '+nx[195]+' '+bt[195];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[156]=paper.setFinish(); 
lineNodes[156]=[130,195]; 

paper.setStart(); 
mid=bb[130]+(bt[175]-bb[130])/2; 
hleft = nx[175]; 
hright = nx[130]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[175]+' '+mid+' L '+nx[175]+' '+bt[175];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[157]=paper.setFinish(); 
lineNodes[157]=[130,175]; 

paper.setStart(); 
s1='M '+nx[131]+' '+bb[131]+' L '+nx[131]+' '+bt[35]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[158]=paper.setFinish(); 
lineNodes[158]=[131,35] ; 

paper.setStart(); 
s1='M '+nx[132]+' '+bb[132]+' L '+nx[132]+' '+bt[198]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[159]=paper.setFinish(); 
lineNodes[159]=[132,198] ; 

paper.setStart(); 
s1='M '+nx[134]+' '+bb[134]+' L '+nx[134]+' '+ny[226]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[160]=paper.setFinish(); 
lineNodes[160]=[134,226]; 

paper.setStart(); 
s1='M '+nx[135]+' '+bb[135]+' L '+nx[135]+' '+bt[102]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[161]=paper.setFinish(); 
lineNodes[161]=[135,102] ; 

paper.setStart(); 
s1='M '+nx[136]+' '+bb[136]+' L '+nx[136]+' '+ny[223]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[162]=paper.setFinish(); 
lineNodes[162]=[136,223]; 

paper.setStart(); 
mid=bb[137]+(bt[82]-bb[137])/2; 
hleft = nx[29]; 
hright = nx[137]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[137]+' '+bb[137]+' L '+nx[137]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[29]+' '+mid+' L '+nx[29]+' '+bt[29];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[163]=paper.setFinish(); 
lineNodes[163]=[137,29]; 

paper.setStart(); 
mid=bb[137]+(bt[82]-bb[137])/2; 
hleft = nx[82]; 
hright = nx[137]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[82]+' '+mid+' L '+nx[82]+' '+bt[82];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[164]=paper.setFinish(); 
lineNodes[164]=[137,82]; 

paper.setStart(); 
s1='M '+nx[138]+' '+bb[138]+' L '+nx[138]+' '+bt[193]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[165]=paper.setFinish(); 
lineNodes[165]=[138,193] ; 

paper.setStart(); 
s1='M '+nx[141]+' '+bb[141]+' L '+nx[141]+' '+ny[213]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[166]=paper.setFinish(); 
lineNodes[166]=[141,213]; 

paper.setStart(); 
s1='M '+nx[142]+' '+bb[142]+' L '+nx[142]+' '+ny[210]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[167]=paper.setFinish(); 
lineNodes[167]=[142,210]; 

paper.setStart(); 
s1='M '+nx[143]+' '+bb[143]+' L '+nx[143]+' '+bt[41]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[168]=paper.setFinish(); 
lineNodes[168]=[143,41] ; 

paper.setStart(); 
s1='M '+nx[145]+' '+bb[145]+' L '+nx[145]+' '+ny[208]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[169]=paper.setFinish(); 
lineNodes[169]=[145,208]; 

paper.setStart(); 
s1='M '+nx[146]+' '+bb[146]+' L '+nx[146]+' '+bt[79]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[170]=paper.setFinish(); 
lineNodes[170]=[146,79] ; 

paper.setStart(); 
s1='M '+nx[146]+' '+bb[146]+' L '+nx[146]+' '+ny[225]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[171]=paper.setFinish(); 
lineNodes[171]=[146,225]; 

paper.setStart(); 
mid=bb[147]+(bt[177]-bb[147])/2; 
s2='M '+nx[147]+' '+bb[147]+' L '+nx[147]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[126]+' '+mid+' L '+nx[126]+' '+bt[126];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[172]=paper.setFinish(); 
lineNodes[172]=[147,126]; 

paper.setStart(); 
mid=bb[147]+(bt[177]-bb[147])/2; 
hleft = nx[13]; 
hright = nx[147]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[13]+' '+mid+' L '+nx[13]+' '+bt[13];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[173]=paper.setFinish(); 
lineNodes[173]=[147,13]; 

paper.setStart(); 
mid=bb[147]+(bt[177]-bb[147])/2; 
hleft = nx[52]; 
hright = nx[147]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[52]+' '+mid+' L '+nx[52]+' '+bt[52];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[174]=paper.setFinish(); 
lineNodes[174]=[147,52]; 

paper.setStart(); 
mid=bb[147]+(bt[177]-bb[147])/2; 
s3='M '+nx[177]+' '+mid+' L '+nx[177]+' '+bt[177];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[175]=paper.setFinish(); 
lineNodes[175]=[147,177]; 

paper.setStart(); 
s1='M '+nx[148]+' '+bb[148]+' L '+nx[148]+' '+bt[146]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[176]=paper.setFinish(); 
lineNodes[176]=[148,146] ; 

paper.setStart(); 
s1='M '+nx[149]+' '+bb[149]+' L '+nx[149]+' '+bt[60]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[177]=paper.setFinish(); 
lineNodes[177]=[149,60] ; 

paper.setStart(); 
s1='M '+nx[150]+' '+bb[150]+' L '+nx[150]+' '+ny[208]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[150]+' '+ny[208]+' L '+nx[145]+' '+ny[208]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[178]=paper.setFinish(); 
lineNodes[178]=[150,208]; 

paper.setStart(); 
s1='M '+nx[151]+' '+bb[151]+' L '+nx[151]+' '+ny[207]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[179]=paper.setFinish(); 
lineNodes[179]=[151,207]; 

paper.setStart(); 
mid=bb[152]+(bt[113]-bb[152])/2; 
s2='M '+nx[152]+' '+bb[152]+' L '+nx[152]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[22]+' '+mid+' L '+nx[22]+' '+bt[22];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[180]=paper.setFinish(); 
lineNodes[180]=[152,22]; 

paper.setStart(); 
mid=bb[152]+(bt[113]-bb[152])/2; 
s3='M '+nx[113]+' '+mid+' L '+nx[113]+' '+bt[113];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[181]=paper.setFinish(); 
lineNodes[181]=[152,113]; 

paper.setStart(); 
mid=bb[152]+(bt[113]-bb[152])/2; 
hleft = nx[153]; 
hright = nx[152]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[153]+' '+mid+' L '+nx[153]+' '+bt[153];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[182]=paper.setFinish(); 
lineNodes[182]=[152,153]; 

paper.setStart(); 
mid=bb[152]+(bt[113]-bb[152])/2; 
hleft = nx[187]; 
hright = nx[152]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[187]+' '+mid+' L '+nx[187]+' '+bt[187];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[183]=paper.setFinish(); 
lineNodes[183]=[152,187]; 

paper.setStart(); 
s1='M '+nx[153]+' '+bb[153]+' L '+nx[153]+' '+bt[95]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[184]=paper.setFinish(); 
lineNodes[184]=[153,95] ; 

paper.setStart(); 
s1='M '+nx[154]+' '+bb[154]+' L '+nx[154]+' '+ny[226]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[185]=paper.setFinish(); 
lineNodes[185]=[154,226]; 

paper.setStart(); 
s1='M '+nx[155]+' '+bb[155]+' L '+nx[155]+' '+bt[46]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[186]=paper.setFinish(); 
lineNodes[186]=[155,46] ; 

paper.setStart(); 
s1='M '+nx[156]+' '+bb[156]+' L '+nx[156]+' '+ny[212]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[156]+' '+ny[212]+' L '+nx[200]+' '+ny[212]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[187]=paper.setFinish(); 
lineNodes[187]=[156,212]; 

paper.setStart(); 
s1='M '+nx[159]+' '+bb[159]+' L '+nx[159]+' '+ny[209]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[159]+' '+ny[209]+' L '+nx[92]+' '+ny[209]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[188]=paper.setFinish(); 
lineNodes[188]=[159,209]; 

paper.setStart(); 
s1='M '+nx[164]+' '+bb[164]+' L '+nx[164]+' '+bt[118]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[189]=paper.setFinish(); 
lineNodes[189]=[164,118] ; 

paper.setStart(); 
s1='M '+nx[165]+' '+bb[165]+' L '+nx[165]+' '+bt[117]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[190]=paper.setFinish(); 
lineNodes[190]=[165,117] ; 

paper.setStart(); 
s1='M '+nx[166]+' '+bb[166]+' L '+nx[166]+' '+ny[206]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[166]+' '+ny[206]+' L '+nx[69]+' '+ny[206]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[191]=paper.setFinish(); 
lineNodes[191]=[166,206]; 

paper.setStart(); 
s1='M '+nx[167]+' '+bb[167]+' L '+nx[167]+' '+ny[211]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[192]=paper.setFinish(); 
lineNodes[192]=[167,211]; 

paper.setStart(); 
s1='M '+nx[168]+' '+bb[168]+' L '+nx[168]+' '+ny[211]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[168]+' '+ny[211]+' L '+nx[167]+' '+ny[211]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[193]=paper.setFinish(); 
lineNodes[193]=[168,211]; 

paper.setStart(); 
mid=bb[169]+(bt[152]-bb[169])/2; 
hleft = nx[152]; 
hright = nx[169]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[169]+' '+bb[169]+' L '+nx[169]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[152]+' '+mid+' L '+nx[152]+' '+bt[152];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[194]=paper.setFinish(); 
lineNodes[194]=[169,152]; 

paper.setStart(); 
mid=bb[169]+(bt[152]-bb[169])/2; 
hleft = nx[94]; 
hright = nx[169]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[94]+' '+mid+' L '+nx[94]+' '+bt[94];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[195]=paper.setFinish(); 
lineNodes[195]=[169,94]; 

paper.setStart(); 
s1='M '+nx[170]+' '+bb[170]+' L '+nx[170]+' '+bt[165]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[196]=paper.setFinish(); 
lineNodes[196]=[170,165] ; 

paper.setStart(); 
s1='M '+nx[171]+' '+bb[171]+' L '+nx[171]+' '+bt[132]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[197]=paper.setFinish(); 
lineNodes[197]=[171,132] ; 

paper.setStart(); 
mid=bb[172]+(bt[26]-bb[172])/2; 
hleft = nx[201]; 
hright = nx[172]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[172]+' '+bb[172]+' L '+nx[172]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[201]+' '+mid+' L '+nx[201]+' '+bt[201];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[198]=paper.setFinish(); 
lineNodes[198]=[172,201]; 

paper.setStart(); 
mid=bb[172]+(bt[26]-bb[172])/2; 
hleft = nx[26]; 
hright = nx[172]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[26]+' '+mid+' L '+nx[26]+' '+bt[26];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[199]=paper.setFinish(); 
lineNodes[199]=[172,26]; 

paper.setStart(); 
mid=bb[173]+(bt[104]-bb[173])/2; 
hleft = nx[37]; 
hright = nx[173]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[173]+' '+bb[173]+' L '+nx[173]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[37]+' '+mid+' L '+nx[37]+' '+bt[37];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[200]=paper.setFinish(); 
lineNodes[200]=[173,37]; 

paper.setStart(); 
mid=bb[173]+(bt[104]-bb[173])/2; 
hleft = nx[104]; 
hright = nx[173]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[104]+' '+mid+' L '+nx[104]+' '+bt[104];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[201]=paper.setFinish(); 
lineNodes[201]=[173,104]; 

paper.setStart(); 
s1='M '+nx[174]+' '+bb[174]+' L '+nx[174]+' '+ny[218]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[202]=paper.setFinish(); 
lineNodes[202]=[174,218]; 

paper.setStart(); 
s1='M '+nx[175]+' '+bb[175]+' L '+nx[175]+' '+bt[54]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[203]=paper.setFinish(); 
lineNodes[203]=[175,54] ; 

paper.setStart(); 
s1='M '+nx[176]+' '+bb[176]+' L '+nx[176]+' '+ny[209]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[204]=paper.setFinish(); 
lineNodes[204]=[176,209]; 

paper.setStart(); 
s1='M '+nx[179]+' '+bb[179]+' L '+nx[179]+' '+ny[226]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[205]=paper.setFinish(); 
lineNodes[205]=[179,226]; 

paper.setStart(); 
s1='M '+nx[180]+' '+bb[180]+' L '+nx[180]+' '+ny[220]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[180]+' '+ny[220]+' L '+nx[65]+' '+ny[220]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[206]=paper.setFinish(); 
lineNodes[206]=[180,220]; 

paper.setStart(); 
s1='M '+nx[181]+' '+bb[181]+' L '+nx[181]+' '+bt[74]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[207]=paper.setFinish(); 
lineNodes[207]=[181,74] ; 

paper.setStart(); 
mid=bb[183]+(bt[114]-bb[183])/2; 
hleft = nx[168]; 
hright = nx[183]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[183]+' '+bb[183]+' L '+nx[183]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[168]+' '+mid+' L '+nx[168]+' '+bt[168];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[208]=paper.setFinish(); 
lineNodes[208]=[183,168]; 

paper.setStart(); 
mid=bb[183]+(bt[114]-bb[183])/2; 
hleft = nx[167]; 
hright = nx[183]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[167]+' '+mid+' L '+nx[167]+' '+bt[167];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[209]=paper.setFinish(); 
lineNodes[209]=[183,167]; 

paper.setStart(); 
mid=bb[183]+(bt[114]-bb[183])/2; 
s3='M '+nx[114]+' '+mid+' L '+nx[114]+' '+bt[114];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[210]=paper.setFinish(); 
lineNodes[210]=[183,114]; 

paper.setStart(); 
s1='M '+nx[184]+' '+bb[184]+' L '+nx[184]+' '+ny[221]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[184]+' '+ny[221]+' L '+nx[56]+' '+ny[221]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[211]=paper.setFinish(); 
lineNodes[211]=[184,221]; 

paper.setStart(); 
s1='M '+nx[185]+' '+bb[185]+' L '+nx[185]+' '+bt[38]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[212]=paper.setFinish(); 
lineNodes[212]=[185,38] ; 

paper.setStart(); 
s1='M '+nx[186]+' '+bb[186]+' L '+nx[186]+' '+ny[213]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[186]+' '+ny[213]+' L '+nx[141]+' '+ny[213]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[213]=paper.setFinish(); 
lineNodes[213]=[186,213]; 

paper.setStart(); 
s1='M '+nx[190]+' '+bb[190]+' L '+nx[190]+' '+bt[127]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[214]=paper.setFinish(); 
lineNodes[214]=[190,127] ; 

paper.setStart(); 
s1='M '+nx[191]+' '+bb[191]+' L '+nx[191]+' '+bt[23]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[215]=paper.setFinish(); 
lineNodes[215]=[191,23] ; 

paper.setStart(); 
s1='M '+nx[193]+' '+bb[193]+' L '+nx[193]+' '+bt[16]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[216]=paper.setFinish(); 
lineNodes[216]=[193,16] ; 

paper.setStart(); 
s1='M '+nx[195]+' '+bb[195]+' L '+nx[195]+' '+ny[214]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[195]+' '+ny[214]+' L '+nx[54]+' '+ny[214]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[217]=paper.setFinish(); 
lineNodes[217]=[195,214]; 

paper.setStart(); 
s1='M '+nx[196]+' '+bb[196]+' L '+nx[196]+' '+bt[130]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[218]=paper.setFinish(); 
lineNodes[218]=[196,130] ; 

paper.setStart(); 
s1='M '+nx[198]+' '+bb[198]+' L '+nx[198]+' '+bt[32]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[219]=paper.setFinish(); 
lineNodes[219]=[198,32] ; 

paper.setStart(); 
mid=bb[199]+(bt[8]-bb[199])/2; 
hleft = nx[169]; 
hright = nx[199]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[199]+' '+bb[199]+' L '+nx[199]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[169]+' '+mid+' L '+nx[169]+' '+bt[169];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[220]=paper.setFinish(); 
lineNodes[220]=[199,169]; 

paper.setStart(); 
mid=bb[199]+(bt[8]-bb[199])/2; 
hleft = nx[8]; 
hright = nx[199]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[8]+' '+mid+' L '+nx[8]+' '+bt[8];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[221]=paper.setFinish(); 
lineNodes[221]=[199,8]; 

paper.setStart(); 
s1='M '+nx[200]+' '+bb[200]+' L '+nx[200]+' '+ny[212]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[222]=paper.setFinish(); 
lineNodes[222]=[200,212]; 

paper.setStart(); 
s1='M '+nx[201]+' '+bb[201]+' L '+nx[201]+' '+ny[224]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[201]+' '+ny[224]+' L '+nx[26]+' '+ny[224]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[223]=paper.setFinish(); 
lineNodes[223]=[201,224]; 

paper.setStart(); 
mid=bb[202]+(bt[145]-bb[202])/2; 
hleft = nx[145]; 
hright = nx[202]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[202]+' '+bb[202]+' L '+nx[202]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[145]+' '+mid+' L '+nx[145]+' '+bt[145];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[224]=paper.setFinish(); 
lineNodes[224]=[202,145]; 

paper.setStart(); 
mid=bb[202]+(bt[145]-bb[202])/2; 
hleft = nx[150]; 
hright = nx[202]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[150]+' '+mid+' L '+nx[150]+' '+bt[150];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[225]=paper.setFinish(); 
lineNodes[225]=[202,150]; 

paper.setStart(); 
s1='M '+nx[203]+' '+bb[203]+' L '+nx[203]+' '+ny[226]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[226]=paper.setFinish(); 
lineNodes[226]=[203,226]; 

paper.setStart(); 
mid=bb[204]+(bt[40]-bb[204])/2; 
hleft = nx[40]; 
hright = nx[204]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[204]+' '+bb[204]+' L '+nx[204]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[40]+' '+mid+' L '+nx[40]+' '+bt[40];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[227]=paper.setFinish(); 
lineNodes[227]=[204,40]; 

paper.setStart(); 
mid=bb[204]+(bt[40]-bb[204])/2; 
hleft = nx[163]; 
hright = nx[204]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[163]+' '+mid+' L '+nx[163]+' '+bt[163];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[228]=paper.setFinish(); 
lineNodes[228]=[204,163]; 

paper.setStart(); 
mid=bb[204]+(bt[40]-bb[204])/2; 
s3='M '+nx[115]+' '+mid+' L '+nx[115]+' '+bt[115];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[229]=paper.setFinish(); 
lineNodes[229]=[204,115]; 

paper.setStart(); 
s1='M '+nx[205]+' '+bb[205]+' L '+nx[205]+' '+bt[50]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[230]=paper.setFinish(); 
lineNodes[230]=[205,50] ; 

paper.setStart(); 
s1='M '+nx[206]+' '+bb[206]+' L '+nx[206]+' '+bt[191]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[231]=paper.setFinish(); 
lineNodes[231]=[206,191] ; 

paper.setStart(); 
mid=bb[207]+(bt[124]-bb[207])/2; 
hleft = nx[124]; 
hright = nx[207]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[207]+' '+bb[207]+' L '+nx[207]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[124]+' '+mid+' L '+nx[124]+' '+bt[124];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[232]=paper.setFinish(); 
lineNodes[232]=[207,124]; 

paper.setStart(); 
mid=bb[207]+(bt[124]-bb[207])/2; 
hleft = nx[9]; 
hright = nx[207]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[9]+' '+mid+' L '+nx[9]+' '+bt[9];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[233]=paper.setFinish(); 
lineNodes[233]=[207,9]; 

paper.setStart(); 
s1='M '+nx[208]+' '+bb[208]+' L '+nx[208]+' '+bt[183]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[234]=paper.setFinish(); 
lineNodes[234]=[208,183] ; 

paper.setStart(); 
s1='M '+nx[209]+' '+bb[209]+' L '+nx[209]+' '+bt[75]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[235]=paper.setFinish(); 
lineNodes[235]=[209,75] ; 

paper.setStart(); 
s1='M '+nx[210]+' '+bb[210]+' L '+nx[210]+' '+bt[55]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[236]=paper.setFinish(); 
lineNodes[236]=[210,55] ; 

paper.setStart(); 
s1='M '+nx[211]+' '+bb[211]+' L '+nx[211]+' '+bt[90]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[237]=paper.setFinish(); 
lineNodes[237]=[211,90] ; 

paper.setStart(); 
s1='M '+nx[212]+' '+bb[212]+' L '+nx[212]+' '+bt[69]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[238]=paper.setFinish(); 
lineNodes[238]=[212,69] ; 

paper.setStart(); 
mid=bb[213]+(bt[43]-bb[213])/2; 
hleft = nx[43]; 
hright = nx[213]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[213]+' '+bb[213]+' L '+nx[213]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[43]+' '+mid+' L '+nx[43]+' '+bt[43];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[239]=paper.setFinish(); 
lineNodes[239]=[213,43]; 

paper.setStart(); 
mid=bb[213]+(bt[43]-bb[213])/2; 
hleft = nx[61]; 
hright = nx[213]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[61]+' '+mid+' L '+nx[61]+' '+bt[61];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[240]=paper.setFinish(); 
lineNodes[240]=[213,61]; 

paper.setStart(); 
s1='M '+nx[214]+' '+bb[214]+' L '+nx[214]+' '+bt[77]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[241]=paper.setFinish(); 
lineNodes[241]=[214,77] ; 

paper.setStart(); 
s1='M '+nx[215]+' '+bb[215]+' L '+nx[215]+' '+bt[85]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[242]=paper.setFinish(); 
lineNodes[242]=[215,85] ; 

paper.setStart(); 
s1='M '+nx[216]+' '+bb[216]+' L '+nx[216]+' '+bt[81]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[243]=paper.setFinish(); 
lineNodes[243]=[216,81] ; 

paper.setStart(); 
mid=bb[217]+(bt[1]-bb[217])/2; 
hleft = nx[1]; 
hright = nx[217]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[217]+' '+bb[217]+' L '+nx[217]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[1]+' '+mid+' L '+nx[1]+' '+bt[1];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[244]=paper.setFinish(); 
lineNodes[244]=[217,1]; 

paper.setStart(); 
mid=bb[217]+(bt[1]-bb[217])/2; 
hleft = nx[31]; 
hright = nx[217]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[31]+' '+mid+' L '+nx[31]+' '+bt[31];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[245]=paper.setFinish(); 
lineNodes[245]=[217,31]; 

paper.setStart(); 
mid=bb[218]+(bt[200]-bb[218])/2; 
hleft = nx[156]; 
hright = nx[218]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[218]+' '+bb[218]+' L '+nx[218]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[156]+' '+mid+' L '+nx[156]+' '+bt[156];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[246]=paper.setFinish(); 
lineNodes[246]=[218,156]; 

paper.setStart(); 
mid=bb[218]+(bt[200]-bb[218])/2; 
hleft = nx[200]; 
hright = nx[218]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[200]+' '+mid+' L '+nx[200]+' '+bt[200];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[247]=paper.setFinish(); 
lineNodes[247]=[218,200]; 

paper.setStart(); 
mid=bb[219]+(bt[76]-bb[219])/2; 
hleft = nx[101]; 
hright = nx[219]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[219]+' '+bb[219]+' L '+nx[219]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[101]+' '+mid+' L '+nx[101]+' '+bt[101];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[248]=paper.setFinish(); 
lineNodes[248]=[219,101]; 

paper.setStart(); 
mid=bb[219]+(bt[76]-bb[219])/2; 
hleft = nx[76]; 
hright = nx[219]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[76]+' '+mid+' L '+nx[76]+' '+bt[76];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[249]=paper.setFinish(); 
lineNodes[249]=[219,76]; 

paper.setStart(); 
s1='M '+nx[220]+' '+bb[220]+' L '+nx[220]+' '+bt[88]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[250]=paper.setFinish(); 
lineNodes[250]=[220,88] ; 

paper.setStart(); 
mid=bb[221]+(bt[97]-bb[221])/2; 
hleft = nx[97]; 
hright = nx[221]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[221]+' '+bb[221]+' L '+nx[221]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[97]+' '+mid+' L '+nx[97]+' '+bt[97];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[251]=paper.setFinish(); 
lineNodes[251]=[221,97]; 

paper.setStart(); 
mid=bb[221]+(bt[97]-bb[221])/2; 
hleft = nx[47]; 
hright = nx[221]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[47]+' '+mid+' L '+nx[47]+' '+bt[47];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[252]=paper.setFinish(); 
lineNodes[252]=[221,47]; 

paper.setStart(); 
s1='M '+nx[222]+' '+bb[222]+' L '+nx[222]+' '+bt[148]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[253]=paper.setFinish(); 
lineNodes[253]=[222,148] ; 

paper.setStart(); 
mid=bb[223]+(bt[137]-bb[223])/2; 
hleft = nx[72]; 
hright = nx[223]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[223]+' '+bb[223]+' L '+nx[223]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[72]+' '+mid+' L '+nx[72]+' '+bt[72];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[254]=paper.setFinish(); 
lineNodes[254]=[223,72]; 

paper.setStart(); 
mid=bb[223]+(bt[137]-bb[223])/2; 
hleft = nx[44]; 
hright = nx[223]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[44]+' '+mid+' L '+nx[44]+' '+bt[44];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[255]=paper.setFinish(); 
lineNodes[255]=[223,44]; 

paper.setStart(); 
mid=bb[223]+(bt[137]-bb[223])/2; 
s3='M '+nx[137]+' '+mid+' L '+nx[137]+' '+bt[137];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[256]=paper.setFinish(); 
lineNodes[256]=[223,137]; 

paper.setStart(); 
s1='M '+nx[224]+' '+bb[224]+' L '+nx[224]+' '+bt[10]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[257]=paper.setFinish(); 
lineNodes[257]=[224,10] ; 

paper.setStart(); 
s1='M '+nx[225]+' '+bb[225]+' L '+nx[225]+' '+bt[45]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[258]=paper.setFinish(); 
lineNodes[258]=[225,45] ; 

paper.setStart(); 
mid=bb[226]+(bt[67]-bb[226])/2; 
hleft = nx[67]; 
hright = nx[226]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[226]+' '+bb[226]+' L '+nx[226]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[67]+' '+mid+' L '+nx[67]+' '+bt[67];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[259]=paper.setFinish(); 
lineNodes[259]=[226,67]; 

paper.setStart(); 
mid=bb[226]+(bt[67]-bb[226])/2; 
hleft = nx[87]; 
hright = nx[226]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[87]+' '+mid+' L '+nx[87]+' '+bt[87];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[260]=paper.setFinish(); 
lineNodes[260]=[226,87]; 

nlines = 261;
}