function initMap() { 

// Set size parameters 
mapWidth = 12010; 
mapHeight = 3535; 
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
rootx = 6976; 
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

nnodes = 278; 
njunc = 9; 

nx[0]=1422;
ny[0]=2180;
nx[1]=11717;
ny[1]=3435;
nx[2]=1349;
ny[2]=2487;
nx[3]=1098;
ny[3]=1829;
nx[4]=9299;
ny[4]=1864;
nx[5]=4115;
ny[5]=1848;
nx[6]=7553;
ny[6]=1850;
nx[7]=5052;
ny[7]=1852;
nx[8]=6324;
ny[8]=770;
nx[9]=1644;
ny[9]=2483;
nx[10]=8166;
ny[10]=2919;
nx[11]=3349;
ny[11]=1845;
nx[12]=2110;
ny[12]=1834;
nx[13]=6793;
ny[13]=811;
nx[14]=7912;
ny[14]=1272;
nx[15]=1494;
ny[15]=2979;
nx[16]=8117;
ny[16]=535;
nx[17]=6516;
ny[17]=1850;
nx[18]=7272;
ny[18]=1849;
nx[19]=5619;
ny[19]=666;
nx[20]=10574;
ny[20]=2278;
nx[21]=7553;
ny[21]=2173;
nx[22]=7945;
ny[22]=721;
nx[23]=7320;
ny[23]=520;
nx[24]=8651;
ny[24]=3050;
nx[25]=6994;
ny[25]=1992;
nx[26]=5344;
ny[26]=1854;
nx[27]=9229;
ny[27]=3054;
nx[28]=10857;
ny[28]=3300;
nx[29]=8102;
ny[29]=3052;
nx[30]=7553;
ny[30]=2069;
nx[31]=5442;
ny[31]=512;
nx[32]=8934;
ny[32]=3054;
nx[33]=9561;
ny[33]=1958;
nx[34]=876;
ny[34]=2166;
nx[35]=1176;
ny[35]=2871;
nx[36]=10443;
ny[36]=2278;
nx[37]=1145;
ny[37]=2359;
nx[38]=3924;
ny[38]=1710;
nx[39]=9371;
ny[39]=3052;
nx[40]=6649;
ny[40]=810;
nx[41]=5532;
ny[41]=1857;
nx[42]=1915;
ny[42]=2478;
nx[43]=566;
ny[43]=2468;
nx[44]=3077;
ny[44]=1711;
nx[45]=566;
ny[45]=2550;
nx[46]=395;
ny[46]=3108;
nx[47]=11272;
ny[47]=3303;
nx[48]=2110;
ny[48]=1534;
nx[49]=8172;
ny[49]=1521;
nx[50]=11080;
ny[50]=3310;
nx[51]=6021;
ny[51]=655;
nx[52]=2050;
ny[52]=2488;
nx[53]=7779;
ny[53]=1853;
nx[54]=5847;
ny[54]=1973;
nx[55]=4244;
ny[55]=1849;
nx[56]=4774;
ny[56]=1850;
nx[57]=4908;
ny[57]=1851;
nx[58]=11374;
ny[58]=2764;
nx[59]=200;
ny[59]=2975;
nx[60]=10666;
ny[60]=3017;
nx[61]=6294;
ny[61]=2150;
nx[62]=4503;
ny[62]=1849;
nx[63]=11078;
ny[63]=3178;
nx[64]=1497;
ny[64]=3242;
nx[65]=8903;
ny[65]=1850;
nx[66]=9511;
ny[66]=2924;
nx[67]=816;
ny[67]=1942;
nx[68]=9839;
ny[68]=2271;
nx[69]=1765;
ny[69]=2992;
nx[70]=6292;
ny[70]=516;
nx[71]=10553;
ny[71]=2757;
nx[72]=1921;
ny[72]=2994;
nx[73]=1782;
ny[73]=2485;
nx[74]=6705;
ny[74]=1854;
nx[75]=10574;
ny[75]=2137;
nx[76]=10158;
ny[76]=2746;
nx[77]=5865;
ny[77]=987;
nx[78]=9488;
ny[78]=2067;
nx[79]=3604;
ny[79]=1845;
nx[80]=3477;
ny[80]=1845;
nx[81]=1644;
ny[81]=2364;
nx[82]=5846;
ny[82]=754;
nx[83]=11810;
ny[83]=3302;
nx[84]=9078;
ny[84]=3054;
nx[85]=9654;
ny[85]=3058;
nx[86]=6518;
ny[86]=2048;
nx[87]=7966;
ny[87]=1855;
nx[88]=5258;
ny[88]=653;
nx[89]=9915;
ny[89]=2427;
nx[90]=4181;
ny[90]=1711;
nx[91]=8395;
ny[91]=3050;
nx[92]=3863;
ny[92]=1847;
nx[93]=5933;
ny[93]=1846;
nx[94]=9638;
ny[94]=2068;
nx[95]=7529;
ny[95]=756;
nx[96]=1615;
ny[96]=1698;
nx[97]=6288;
ny[97]=1849;
nx[98]=2411;
ny[98]=1833;
nx[99]=9083;
ny[99]=2736;
nx[100]=10244;
ny[100]=1553;
nx[101]=780;
ny[101]=2978;
nx[102]=741;
ny[102]=3117;
nx[103]=11620;
ny[103]=3302;
nx[104]=10129;
ny[104]=2272;
nx[105]=1305;
ny[105]=3140;
nx[106]=9172;
ny[106]=1857;
nx[107]=7699;
ny[107]=527;
nx[108]=201;
ny[108]=3106;
nx[109]=11711;
ny[109]=3188;
nx[110]=6976;
ny[110]=100;
nx[111]=1540;
ny[111]=1833;
nx[112]=3987;
ny[112]=1847;
nx[113]=8056;
ny[113]=837;
nx[114]=9045;
ny[114]=1859;
nx[115]=1633;
ny[115]=3252;
nx[116]=7778;
ny[116]=1700;
nx[117]=1260;
ny[117]=2972;
nx[118]=5708;
ny[118]=1856;
nx[119]=6227;
ny[119]=657;
nx[120]=951;
ny[120]=2470;
nx[121]=1098;
ny[121]=1695;
nx[122]=7777;
ny[122]=1135;
nx[123]=6705;
ny[123]=1956;
nx[124]=5628;
ny[124]=1710;
nx[125]=4774;
ny[125]=1711;
nx[126]=8387;
ny[126]=1848;
nx[127]=816;
ny[127]=1826;
nx[128]=8150;
ny[128]=1039;
nx[129]=10449;
ny[129]=3018;
nx[130]=2837;
ny[130]=1834;
nx[131]=1826;
ny[131]=1827;
nx[132]=11465;
ny[132]=3303;
nx[133]=10555;
ny[133]=3168;
nx[134]=10574;
ny[134]=1910;
nx[135]=8642;
ny[135]=1848;
nx[136]=689;
ny[136]=2467;
nx[137]=2180;
ny[137]=2367;
nx[138]=6718;
ny[138]=670;
nx[139]=3728;
ny[139]=1846;
nx[140]=9689;
ny[140]=2561;
nx[141]=11236;
ny[141]=2928;
nx[142]=6867;
ny[142]=1991;
nx[143]=612;
ny[143]=2166;
nx[144]=6517;
ny[144]=1953;
nx[145]=7323;
ny[145]=754;
nx[146]=3538;
ny[146]=1710;
nx[147]=747;
ny[147]=2166;
nx[148]=9419;
ny[148]=1858;
nx[149]=394;
ny[149]=2862;
nx[150]=11510;
ny[150]=2923;
nx[151]=10223;
ny[151]=2564;
nx[152]=821;
ny[152]=2467;
nx[153]=6938;
ny[153]=811;
nx[154]=9997;
ny[154]=2889;
nx[155]=11374;
ny[155]=3426;
nx[156]=1114;
ny[156]=2970;
nx[157]=7776;
ny[157]=1029;
nx[158]=1507;
ny[158]=2482;
nx[159]=8517;
ny[159]=1847;
nx[160]=4437;
ny[160]=1710;
nx[161]=8934;
ny[161]=2913;
nx[162]=865;
ny[162]=2864;
nx[163]=9299;
ny[163]=1712;
nx[164]=6290;
ny[164]=1953;
nx[165]=9797;
ny[165]=3057;
nx[166]=7781;
ny[166]=2057;
nx[167]=10734;
ny[167]=2278;
nx[168]=2990;
ny[168]=1842;
nx[169]=8180;
ny[169]=1845;
nx[170]=1893;
ny[170]=1698;
nx[171]=6505;
ny[171]=810;
nx[172]=4437;
ny[172]=1534;
nx[173]=5187;
ny[173]=1854;
nx[174]=1244;
ny[174]=1833;
nx[175]=1081;
ny[175]=2471;
nx[176]=6291;
ny[176]=2048;
nx[177]=7247;
ny[177]=1993;
nx[178]=7118;
ny[178]=1849;
nx[179]=8309;
ny[179]=389;
nx[180]=1495;
ny[180]=3135;
nx[181]=1917;
ny[181]=2590;
nx[182]=7553;
ny[182]=1966;
nx[183]=2690;
ny[183]=1841;
nx[184]=1206;
ny[184]=2471;
nx[185]=6286;
ny[185]=1688;
nx[186]=8309;
ny[186]=541;
nx[187]=6095;
ny[187]=1846;
nx[188]=6147;
ny[188]=768;
nx[189]=6410;
ny[189]=657;
nx[190]=8642;
ny[190]=1713;
nx[191]=7118;
ny[191]=1993;
nx[192]=9229;
ny[192]=2914;
nx[193]=1006;
ny[193]=2168;
nx[194]=2126;
ny[194]=2983;
nx[195]=10553;
ny[195]=2886;
nx[196]=8061;
ny[196]=1178;
nx[197]=10244;
ny[197]=1705;
nx[198]=9905;
ny[198]=2017;
nx[199]=2337;
ny[199]=1700;
nx[200]=4638;
ny[200]=1850;
nx[201]=8498;
ny[201]=536;
nx[202]=8528;
ny[202]=3051;
nx[203]=8121;
ny[203]=2002;
nx[204]=1016;
ny[204]=2703;
nx[205]=10856;
ny[205]=3176;
nx[206]=9559;
ny[206]=1864;
nx[207]=1769;
ny[207]=3252;
nx[208]=953;
ny[208]=2976;
nx[209]=3161;
ny[209]=1843;
nx[210]=4115;
ny[210]=1965;
nx[211]=11236;
ny[211]=3035;
nx[212]=959;
ny[212]=1834;
nx[213]=2690;
ny[213]=1708;
nx[214]=820;
ny[214]=2354;
nx[215]=5996;
ny[215]=986;
nx[216]=5187;
ny[216]=1712;
nx[217]=6976;
ny[217]=192;
nx[218]=7647;
ny[218]=1270;
nx[219]=2266;
ny[219]=1838;
nx[220]=9905;
ny[220]=1908;
nx[221]=10158;
ny[221]=2887;
nx[222]=9905;
ny[222]=2129;
nx[223]=2547;
ny[223]=1834;
nx[224]=2110;
ny[224]=1699;
nx[225]=7168;
ny[225]=754;
nx[226]=8796;
ny[226]=3057;
nx[227]=7966;
ny[227]=1968;
nx[228]=4373;
ny[228]=1849;
nx[229]=6706;
ny[229]=2052;
nx[230]=9701;
ny[230]=2270;
nx[231]=5760;
ny[231]=872;
nx[232]=8234;
ny[232]=1288;
nx[233]=7379;
ny[233]=1994;
nx[234]=1700;
ny[234]=3137;
nx[235]=7488;
ny[235]=379;
nx[236]=11370;
ny[236]=3188;
nx[237]=8232;
ny[237]=1179;
nx[238]=8771;
ny[238]=1849;
nx[239]=5915;
ny[239]=369;
nx[240]=10038;
ny[240]=2569;
nx[241]=7781;
ny[241]=1960;
nx[242]=1860;
ny[242]=2861;
nx[243]=5443;
ny[243]=657;
nx[244]=633;
ny[244]=2360;
nx[245]=8528;
ny[245]=2923;
nx[246]=10244;
ny[246]=1908;
nx[247]=9842;
ny[247]=2565;
nx[248]=1914;
ny[248]=2370;
nx[249]=9511;
ny[249]=3059;
nx[250]=2180;
ny[250]=2481;
nx[251]=7323;
ny[251]=640;
nx[252]=2310;
ny[252]=2490;
nx[253]=8229;
ny[253]=3053;
nx[254]=816;
ny[254]=2043;
nx[255]=8253;
ny[255]=2002;
nx[256]=569;
ny[256]=2986;
nx[257]=1681;
ny[257]=1833;
nx[258]=7843;
ny[258]=837;
nx[259]=10316;
ny[259]=2888;
nx[260]=11603;
ny[260]=3037;
nx[261]=9981;
ny[261]=2271;
nx[262]=569;
ny[262]=3115;
nx[263]=9797;
ny[263]=2918;
nx[264]=7777;
ny[264]=1277;
nx[265]=1964;
ny[265]=1827;
nx[266]=6008;
ny[266]=1976;
nx[267]=11424;
ny[267]=3036;
nx[268]=5930;
ny[268]=872;
nx[269]=7956;
ny[269]=907;
nx[270]=10330;
ny[270]=2069;
nx[271]=10555;
ny[271]=3087;
nx[272]=5865;
ny[272]=1059;
nx[273]=11372;
ny[273]=3355;
nx[274]=11716;
ny[274]=3357;
nx[275]=1015;
ny[275]=2617;
nx[276]=7948;
ny[276]=643;
nx[277]=9915;
ny[277]=2353;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[3, 212, 37, 137, 174, 81, 244, 214, 248, 121, 127]; 
members[1]=[274]; 
members[2]=[37, 175, 184, 275, 120]; 
members[3]=[0, 174, 212, 121, 127]; 
members[4]=[163, 106, 206, 114, 148]; 
members[5]=[210, 55, 90]; 
members[6]=[169, 178, 18, 116, 53, 182, 87]; 
members[7]=[216, 26, 173]; 
members[8]=[188, 119]; 
members[9]=[81, 73, 158]; 
members[10]=[192, 161, 66, 99, 263, 29, 245, 253]; 
members[11]=[80, 146, 139, 79]; 
members[12]=[224]; 
members[13]=[40, 153, 138, 171]; 
members[14]=[264, 122, 218]; 
members[15]=[194, 69, 72, 105, 234, 242, 180]; 
members[16]=[201, 186, 179, 276]; 
members[17]=[97, 74, 144, 185, 187, 93]; 
members[18]=[6, 169, 178, 116, 53, 87]; 
members[19]=[88, 82, 243, 31]; 
members[20]=[75, 36, 167]; 
members[21]=[30]; 
members[22]=[113, 258, 276]; 
members[23]=[107, 251, 235]; 
members[24]=[202, 91, 245]; 
members[25]=[233, 142, 177, 178, 191]; 
members[26]=[216, 173, 7]; 
members[27]=[192]; 
members[28]=[205]; 
members[29]=[10, 253]; 
members[30]=[21, 182]; 
members[31]=[70, 243, 239, 82, 19, 88]; 
members[32]=[161, 226, 84]; 
members[33]=[206, 94, 78]; 
members[34]=[193, 147, 254, 143]; 
members[35]=[162, 204, 242, 117, 156, 149]; 
members[36]=[20, 75, 167]; 
members[37]=[0, 2, 81, 137, 175, 184, 244, 214, 120, 248]; 
members[38]=[160, 124, 172, 112, 146, 216, 90, 92, 125]; 
members[39]=[249, 66, 85]; 
members[40]=[153, 138, 171, 13]; 
members[41]=[124, 118]; 
members[42]=[248, 181]; 
members[43]=[136, 244, 45]; 
members[44]=[96, 224, 199, 168, 170, 48, 209, 213, 121]; 
members[45]=[43, 275]; 
members[46]=[256, 102, 262]; 
members[47]=[273, 132, 236]; 
members[48]=[96, 224, 100, 199, 172, 170, 44, 272, 49, 213, 121]; 
members[49]=[48, 163, 100, 172, 272, 116, 185, 190]; 
members[50]=[63]; 
members[51]=[70, 138, 82, 119, 189]; 
members[52]=[137, 250, 252]; 
members[53]=[6, 169, 178, 241, 18, 116, 87]; 
members[54]=[266, 93]; 
members[55]=[90, 5]; 
members[56]=[200, 57, 125]; 
members[57]=[200, 125, 56]; 
members[58]=[99, 71, 76, 141, 270, 150]; 
members[59]=[256, 108, 149]; 
members[60]=[129, 195, 271]; 
members[61]=[176]; 
members[62]=[160, 228]; 
members[63]=[236, 205, 109, 50, 211]; 
members[64]=[180]; 
members[65]=[135, 238, 190, 126, 159]; 
members[66]=[192, 161, 99, 39, 10, 263, 245, 249, 85]; 
members[67]=[254, 127]; 
members[68]=[261, 230, 104, 277, 222]; 
members[69]=[72, 242, 194, 15]; 
members[70]=[138, 239, 82, 51, 119, 189, 31]; 
members[71]=[99, 76, 270, 195, 58]; 
members[72]=[242, 194, 69, 15]; 
members[73]=[81, 158, 9]; 
members[74]=[97, 187, 17, 185, 123, 93]; 
members[75]=[36, 134, 167, 270, 20]; 
members[76]=[259, 71, 270, 221, 99, 58, 154]; 
members[77]=[272, 268, 215]; 
members[78]=[33, 94]; 
members[79]=[80, 11, 146, 139]; 
members[80]=[11, 146, 139, 79]; 
members[81]=[0, 37, 9, 244, 214, 73, 248, 137, 158]; 
members[82]=[51, 243, 70, 231, 138, 268, 19, 119, 88, 189, 31]; 
members[83]=[274, 109, 103]; 
members[84]=[32, 161, 226]; 
members[85]=[249, 66, 39]; 
members[86]=[144]; 
members[87]=[227, 6, 169, 178, 18, 116, 53]; 
members[88]=[82, 19, 243, 31]; 
members[89]=[151, 140, 240, 277, 247]; 
members[90]=[160, 5, 38, 172, 146, 55, 216, 124, 125]; 
members[91]=[24, 202, 245]; 
members[92]=[112, 38]; 
members[93]=[97, 266, 17, 54, 185, 187, 74]; 
members[94]=[33, 78]; 
members[95]=[145, 225, 251]; 
members[96]=[257, 199, 170, 44, 224, 111, 48, 213, 121]; 
members[97]=[164, 74, 17, 185, 187, 93]; 
members[98]=[219, 199]; 
members[99]=[192, 161, 66, 263, 10, 71, 76, 270, 245, 58]; 
members[100]=[48, 197, 172, 272, 49]; 
members[101]=[208, 162]; 
members[102]=[256, 46, 262]; 
members[103]=[274, 83, 109]; 
members[104]=[68, 261, 230, 277, 222]; 
members[105]=[234, 180, 15]; 
members[106]=[163, 4, 206, 114, 148]; 
members[107]=[235, 276, 23]; 
members[108]=[59]; 
members[109]=[211, 103, 236, 205, 83, 63]; 
members[110]=[217]; 
members[111]=[96, 257]; 
members[112]=[92, 38]; 
members[113]=[258, 269, 22]; 
members[114]=[163, 4, 106, 206, 148]; 
members[115]=[234, 207]; 
members[116]=[163, 6, 169, 178, 49, 18, 53, 87, 185, 190]; 
members[117]=[35, 156]; 
members[118]=[41, 124]; 
members[119]=[70, 8, 138, 82, 51, 188, 189]; 
members[120]=[2, 37, 175, 184, 275]; 
members[121]=[0, 96, 3, 199, 170, 44, 224, 174, 48, 212, 213, 127]; 
members[122]=[264, 218, 157, 14]; 
members[123]=[74, 229]; 
members[124]=[160, 38, 41, 172, 146, 118, 216, 90, 125]; 
members[125]=[160, 38, 200, 172, 216, 146, 56, 57, 90, 124]; 
members[126]=[65, 135, 238, 190, 159]; 
members[127]=[0, 3, 174, 67, 212, 121]; 
members[128]=[157, 196, 237, 269]; 
members[129]=[195, 60, 271]; 
members[130]=[183, 213, 223]; 
members[131]=[265, 170]; 
members[132]=[273, 236, 47]; 
members[133]=[271]; 
members[134]=[197, 75, 270, 246, 220]; 
members[135]=[65, 238, 190, 126, 159]; 
members[136]=[43, 275, 244]; 
members[137]=[0, 37, 81, 52, 214, 248, 244, 250, 252]; 
members[138]=[70, 40, 171, 13, 82, 51, 119, 153, 189]; 
members[139]=[80, 11, 146, 79]; 
members[140]=[240, 89, 247, 151]; 
members[141]=[58, 211, 150]; 
members[142]=[233, 177, 178, 25, 191]; 
members[143]=[193, 34, 147, 254]; 
members[144]=[17, 86]; 
members[145]=[225, 251, 95]; 
members[146]=[160, 139, 38, 11, 172, 79, 80, 216, 90, 124, 125]; 
members[147]=[193, 34, 254, 143]; 
members[148]=[163, 4, 106, 206, 114]; 
members[149]=[256, 162, 35, 204, 242, 59]; 
members[150]=[58, 267, 260, 141]; 
members[151]=[240, 89, 247, 140]; 
members[152]=[275, 214]; 
members[153]=[40, 138, 171, 13]; 
members[154]=[259, 76, 221]; 
members[155]=[273]; 
members[156]=[35, 117]; 
members[157]=[128, 122, 269]; 
members[158]=[81, 275, 73, 9]; 
members[159]=[65, 135, 238, 190, 126]; 
members[160]=[228, 38, 172, 146, 216, 90, 124, 125, 62]; 
members[161]=[32, 226, 99, 263, 10, 192, 66, 84, 245]; 
members[162]=[35, 101, 204, 208, 242, 149]; 
members[163]=[4, 106, 206, 49, 114, 148, 185, 116, 190]; 
members[164]=[176, 97]; 
members[165]=[263]; 
members[166]=[241]; 
members[167]=[20, 75, 36]; 
members[168]=[209, 44]; 
members[169]=[6, 203, 178, 18, 116, 53, 87, 255]; 
members[170]=[96, 224, 131, 199, 265, 44, 48, 213, 121]; 
members[171]=[40, 153, 138, 13]; 
members[172]=[160, 48, 100, 38, 272, 49, 146, 216, 90, 124, 125]; 
members[173]=[216, 26, 7]; 
members[174]=[0, 3, 212, 121, 127]; 
members[175]=[2, 37, 184, 275, 120]; 
members[176]=[164, 61]; 
members[177]=[233, 142, 178, 25, 191]; 
members[178]=[6, 233, 142, 177, 18, 116, 53, 87, 25, 169, 191]; 
members[179]=[201, 235, 239, 16, 217, 186]; 
members[180]=[64, 105, 234, 15]; 
members[181]=[42]; 
members[182]=[6, 30]; 
members[183]=[130, 213, 223]; 
members[184]=[2, 37, 175, 275, 120]; 
members[185]=[97, 163, 17, 74, 49, 116, 187, 93, 190]; 
members[186]=[16, 201, 179, 276]; 
members[187]=[97, 74, 17, 185, 93]; 
members[188]=[8, 119]; 
members[189]=[70, 138, 82, 51, 119]; 
members[190]=[65, 163, 135, 238, 49, 116, 185, 126, 159]; 
members[191]=[233, 142, 177, 178, 25]; 
members[192]=[161, 66, 99, 263, 10, 245, 27]; 
members[193]=[34, 147, 254, 143]; 
members[194]=[72, 242, 69, 15]; 
members[195]=[129, 60, 71]; 
members[196]=[128, 237]; 
members[197]=[100, 220, 246, 134]; 
members[198]=[220, 270, 222]; 
members[199]=[96, 224, 98, 170, 44, 48, 213, 121, 219]; 
members[200]=[57, 125, 56]; 
members[201]=[16, 186, 179, 276]; 
members[202]=[24, 91, 245]; 
members[203]=[169, 255]; 
members[204]=[162, 35, 242, 275, 149]; 
members[205]=[236, 109, 211, 28, 63]; 
members[206]=[33, 163, 4, 106, 114, 148]; 
members[207]=[234, 115]; 
members[208]=[162, 101]; 
members[209]=[168, 44]; 
members[210]=[5]; 
members[211]=[236, 141, 205, 109, 63]; 
members[212]=[0, 3, 174, 121, 127]; 
members[213]=[96, 224, 130, 199, 170, 44, 48, 183, 121, 223]; 
members[214]=[0, 37, 81, 137, 248, 244, 152]; 
members[215]=[272, 268, 77]; 
members[216]=[160, 38, 7, 172, 173, 146, 90, 26, 124, 125]; 
members[217]=[235, 179, 110, 239]; 
members[218]=[264, 122, 14]; 
members[219]=[98, 199]; 
members[220]=[246, 197, 198, 134]; 
members[221]=[154, 259, 76]; 
members[222]=[230, 68, 261, 198, 104, 270]; 
members[223]=[130, 183, 213]; 
members[224]=[96, 199, 12, 170, 44, 48, 213, 121]; 
members[225]=[145, 251, 95]; 
members[226]=[32, 161, 84]; 
members[227]=[87]; 
members[228]=[160, 62]; 
members[229]=[123]; 
members[230]=[68, 261, 104, 277, 222]; 
members[231]=[272, 82, 268]; 
members[232]=[237]; 
members[233]=[142, 177, 178, 25, 191]; 
members[234]=[105, 15, 115, 180, 207]; 
members[235]=[107, 239, 179, 23, 217]; 
members[236]=[132, 109, 47, 205, 211, 63]; 
members[237]=[232, 128, 196]; 
members[238]=[65, 135, 190, 126, 159]; 
members[239]=[70, 235, 179, 217, 31]; 
members[240]=[89, 247, 140, 151]; 
members[241]=[53, 166]; 
members[242]=[194, 35, 69, 72, 204, 162, 15, 149]; 
members[243]=[88, 82, 19, 31]; 
members[244]=[0, 37, 136, 137, 43, 81, 214, 248]; 
members[245]=[192, 161, 66, 99, 263, 202, 24, 91, 10]; 
members[246]=[220, 197, 134]; 
members[247]=[240, 89, 140, 151]; 
members[248]=[0, 37, 137, 42, 81, 244, 214]; 
members[249]=[66, 85, 39]; 
members[250]=[137, 252, 52]; 
members[251]=[145, 225, 23, 95]; 
members[252]=[137, 250, 52]; 
members[253]=[10, 29]; 
members[254]=[193, 34, 67, 143, 147]; 
members[255]=[169, 203]; 
members[256]=[262, 102, 46, 149, 59]; 
members[257]=[96, 111]; 
members[258]=[113, 269, 22]; 
members[259]=[154, 76, 221]; 
members[260]=[267, 150]; 
members[261]=[68, 230, 104, 277, 222]; 
members[262]=[256, 102, 46]; 
members[263]=[192, 161, 66, 99, 165, 10, 245]; 
members[264]=[122, 218, 14]; 
members[265]=[170, 131]; 
members[266]=[93, 54]; 
members[267]=[260, 150]; 
members[268]=[82, 231, 77, 215]; 
members[269]=[128, 113, 258, 157]; 
members[270]=[99, 198, 134, 71, 75, 76, 58, 222]; 
members[271]=[129, 60, 133]; 
members[272]=[100, 231, 172, 77, 48, 49, 215]; 
members[273]=[155, 132, 47]; 
members[274]=[1, 83, 103]; 
members[275]=[2, 136, 204, 45, 175, 152, 120, 184, 158]; 
members[276]=[201, 107, 16, 22, 186]; 
members[277]=[68, 261, 230, 104, 89]; 

return members[i]; 
} 

function drawMap(sfac) { 

var rect; 
var tbox; 

paper.clear(); 

t[0]=paper.text(nx[0],ny[0],'Similarity').attr({fill:"#666666","font-size": 14*sfac[0]});
tBox=t[0].getBBox(); 
bt[0]=ny[0]-(tBox.height/2+10*sfac[0]);
bb[0]=ny[0]+(tBox.height/2+10*sfac[0]);
bl[0]=nx[0]-(tBox.width/2+10*sfac[0]);
br[0]=nx[0]+(tBox.width/2+10*sfac[0]);
paper.setStart(); 
rect=paper.rect(bl[0], bt[0], br[0]-bl[0], bb[0]-bt[0], 10*sfac[0]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[0]=paper.setFinish(); 

t[1]=paper.text(nx[1],ny[1],'Kites and Trapezoids\nin the Coordinate Plane').attr({fill:"#666666","font-size": 14*sfac[1]});
tBox=t[1].getBBox(); 
bt[1]=ny[1]-(tBox.height/2+10*sfac[1]);
bb[1]=ny[1]+(tBox.height/2+10*sfac[1]);
bl[1]=nx[1]-(tBox.width/2+10*sfac[1]);
br[1]=nx[1]+(tBox.width/2+10*sfac[1]);
paper.setStart(); 
rect=paper.rect(bl[1], bt[1], br[1]-bl[1], bb[1]-bt[1], 10*sfac[1]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[1]=paper.setFinish(); 

t[2]=paper.text(nx[2],ny[2]-10,'Indirect Measurement\nusing\nSimilar Triangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[2]});
t[2].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Indirect-Measurement/#Indirect Measurement using Similar Triangles", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Indirect-Measurement/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Indirect-Measurement/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[2], bt[2], br[2]-bl[2], bb[2]-bt[2], 10*sfac[2]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[2]=paper.setFinish(); 
t[2].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[3]=paper.text(nx[3],ny[3]-10,'The Third\nAngle Theorem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[3]});
t[3].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Third-Angle-Theorem/#The Third Angle Theorem", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Third-Angle-Theorem/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Third-Angle-Theorem/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[3], bt[3], br[3]-bl[3], bb[3]-bt[3], 10*sfac[3]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[3]=paper.setFinish(); 
t[3].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[4]=paper.text(nx[4],ny[4],'Regular\nPolyhedra').attr({fill:"#666666","font-size": 14*sfac[4]});
tBox=t[4].getBBox(); 
bt[4]=ny[4]-(tBox.height/2+10*sfac[4]);
bb[4]=ny[4]+(tBox.height/2+10*sfac[4]);
bl[4]=nx[4]-(tBox.width/2+10*sfac[4]);
br[4]=nx[4]+(tBox.width/2+10*sfac[4]);
paper.setStart(); 
rect=paper.rect(bl[4], bt[4], br[4]-bl[4], bb[4]-bt[4], 10*sfac[4]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[4]=paper.setFinish(); 

t[5]=paper.text(nx[5],ny[5],'Congruent\nChords').attr({fill:"#666666","font-size": 14*sfac[5]});
tBox=t[5].getBBox(); 
bt[5]=ny[5]-(tBox.height/2+10*sfac[5]);
bb[5]=ny[5]+(tBox.height/2+10*sfac[5]);
bl[5]=nx[5]-(tBox.width/2+10*sfac[5]);
br[5]=nx[5]+(tBox.width/2+10*sfac[5]);
paper.setStart(); 
rect=paper.rect(bl[5], bt[5], br[5]-bl[5], bb[5]-bt[5], 10*sfac[5]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[5]=paper.setFinish(); 

t[6]=paper.text(nx[6],ny[6],'Area of\nRectangles, Squares, Parallelograms').attr({fill:"#666666","font-size": 14*sfac[6]});
tBox=t[6].getBBox(); 
bt[6]=ny[6]-(tBox.height/2+10*sfac[6]);
bb[6]=ny[6]+(tBox.height/2+10*sfac[6]);
bl[6]=nx[6]-(tBox.width/2+10*sfac[6]);
br[6]=nx[6]+(tBox.width/2+10*sfac[6]);
paper.setStart(); 
rect=paper.rect(bl[6], bt[6], br[6]-bl[6], bb[6]-bt[6], 10*sfac[6]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[6]=paper.setFinish(); 

t[7]=paper.text(nx[7],ny[7]-10,'Segments from\nChords').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[7]});
t[7].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Segments-from-Chords/#Segments from Chords", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Segments-from-Chords/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Segments-from-Chords/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[7], bt[7], br[7]-bl[7], bb[7]-bt[7], 10*sfac[7]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[7]=paper.setFinish(); 
t[7].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[8]=paper.text(nx[8],ny[8]-10,'Protractor Use').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[8]});
t[8].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angle-Measurement/#Protractor Use", target: "_top",title:"Click to jump to concept"});
}); 
t[8].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[8].getBBox(); 
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
yicon = bb[8]-25; 
xicon2 = nx[8]+-40; 
xicon3 = nx[8]+-10; 
xicon4 = nx[8]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angle-Measurement/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angle-Measurement/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angle-Measurement/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[8], bt[8], br[8]-bl[8], bb[8]-bt[8], 10*sfac[8]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[8]=paper.setFinish(); 
t[8].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[9]=paper.text(nx[9],ny[9]-10,'Parallel Lines\nand Transversals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[9]});
t[9].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Parallel-Lines-and-Transversals/#Parallel Lines and Transversals", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parallel-Lines-and-Transversals/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parallel-Lines-and-Transversals/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[9], bt[9], br[9]-bl[9], bb[9]-bt[9], 10*sfac[9]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[9]=paper.setFinish(); 
t[9].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[10]=paper.text(nx[10],ny[10],'Exploring\nSymmetry').attr({fill:"#666666","font-size": 14*sfac[10]});
tBox=t[10].getBBox(); 
bt[10]=ny[10]-(tBox.height/2+10*sfac[10]);
bb[10]=ny[10]+(tBox.height/2+10*sfac[10]);
bl[10]=nx[10]-(tBox.width/2+10*sfac[10]);
br[10]=nx[10]+(tBox.width/2+10*sfac[10]);
paper.setStart(); 
rect=paper.rect(bl[10], bt[10], br[10]-bl[10], bb[10]-bt[10], 10*sfac[10]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[10]=paper.setFinish(); 

t[11]=paper.text(nx[11],ny[11],'Coplanar\nCircles').attr({fill:"#666666","font-size": 14*sfac[11]});
tBox=t[11].getBBox(); 
bt[11]=ny[11]-(tBox.height/2+10*sfac[11]);
bb[11]=ny[11]+(tBox.height/2+10*sfac[11]);
bl[11]=nx[11]-(tBox.width/2+10*sfac[11]);
br[11]=nx[11]+(tBox.width/2+10*sfac[11]);
paper.setStart(); 
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[11]=paper.setFinish(); 

t[12]=paper.text(nx[12],ny[12]-10,'Midsegment\nTheorem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[12]});
t[12].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Midsegment-Theorem/#Midsegment Theorem", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Midsegment-Theorem/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Midsegment-Theorem/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Midsegment-Theorem/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[12], bt[12], br[12]-bl[12], bb[12]-bt[12], 10*sfac[12]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[12]=paper.setFinish(); 
t[12].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[13]=paper.text(nx[13],ny[13]-10,'Linear\nAngle Pairs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[13]});
t[13].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Linear-Pairs/#Linear Angle Pairs", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Pairs/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Linear-Pairs/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[13], bt[13], br[13]-bl[13], bb[13]-bt[13], 10*sfac[13]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[13]=paper.setFinish(); 
t[13].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[14]=paper.text(nx[14],ny[14],'Vertical\nAngles Theorem').attr({fill:"#666666","font-size": 14*sfac[14]});
tBox=t[14].getBBox(); 
bt[14]=ny[14]-(tBox.height/2+10*sfac[14]);
bb[14]=ny[14]+(tBox.height/2+10*sfac[14]);
bl[14]=nx[14]-(tBox.width/2+10*sfac[14]);
br[14]=nx[14]+(tBox.width/2+10*sfac[14]);
paper.setStart(); 
rect=paper.rect(bl[14], bt[14], br[14]-bl[14], bb[14]-bt[14], 10*sfac[14]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[14]=paper.setFinish(); 

t[15]=paper.text(nx[15],ny[15]-10,'Sine, Cosine and\nTangent').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[15]});
t[15].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Trigonometric-Ratios/#Sine, Cosine and Tangent", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Trigonometric-Ratios/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Trigonometric-Ratios/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Trigonometric-Ratios/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[15], bt[15], br[15]-bl[15], bb[15]-bt[15], 10*sfac[15]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[15]=paper.setFinish(); 
t[15].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[16]=paper.text(nx[16],ny[16]-10,'If-Then\nStatement').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[16]});
t[16].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/If-Then-Statements/#If-Then Statement", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/If-Then-Statements/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/If-Then-Statements/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/If-Then-Statements/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[16], bt[16], br[16]-bl[16], bb[16]-bt[16], 10*sfac[16]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[16]=paper.setFinish(); 
t[16].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[17]=paper.text(nx[17],ny[17],'Comparing Trapezoids,\nRhombi, and\nKites').attr({fill:"#666666","font-size": 14*sfac[17]});
tBox=t[17].getBBox(); 
bt[17]=ny[17]-(tBox.height/2+10*sfac[17]);
bb[17]=ny[17]+(tBox.height/2+10*sfac[17]);
bl[17]=nx[17]-(tBox.width/2+10*sfac[17]);
br[17]=nx[17]+(tBox.width/2+10*sfac[17]);
paper.setStart(); 
rect=paper.rect(bl[17], bt[17], br[17]-bl[17], bb[17]-bt[17], 10*sfac[17]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[17]=paper.setFinish(); 

t[18]=paper.text(nx[18],ny[18],'Triangle\nArea').attr({fill:"#666666","font-size": 14*sfac[18]});
tBox=t[18].getBBox(); 
bt[18]=ny[18]-(tBox.height/2+10*sfac[18]);
bb[18]=ny[18]+(tBox.height/2+10*sfac[18]);
bl[18]=nx[18]-(tBox.width/2+10*sfac[18]);
br[18]=nx[18]+(tBox.width/2+10*sfac[18]);
paper.setStart(); 
rect=paper.rect(bl[18], bt[18], br[18]-bl[18], bb[18]-bt[18], 10*sfac[18]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[18]=paper.setFinish(); 

t[19]=paper.text(nx[19],ny[19],'Ruler Postulate and\nSegment Addition\nPostulate').attr({fill:"#666666","font-size": 14*sfac[19]});
tBox=t[19].getBBox(); 
bt[19]=ny[19]-(tBox.height/2+10*sfac[19]);
bb[19]=ny[19]+(tBox.height/2+10*sfac[19]);
bl[19]=nx[19]-(tBox.width/2+10*sfac[19]);
br[19]=nx[19]+(tBox.width/2+10*sfac[19]);
paper.setStart(); 
rect=paper.rect(bl[19], bt[19], br[19]-bl[19], bb[19]-bt[19], 10*sfac[19]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[19]=paper.setFinish(); 

t[20]=paper.text(nx[20],ny[20],'Perpendicular\nTransversals').attr({fill:"#666666","font-size": 14*sfac[20]});
tBox=t[20].getBBox(); 
bt[20]=ny[20]-(tBox.height/2+10*sfac[20]);
bb[20]=ny[20]+(tBox.height/2+10*sfac[20]);
bl[20]=nx[20]-(tBox.width/2+10*sfac[20]);
br[20]=nx[20]+(tBox.width/2+10*sfac[20]);
paper.setStart(); 
rect=paper.rect(bl[20], bt[20], br[20]-bl[20], bb[20]-bt[20], 10*sfac[20]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[20]=paper.setFinish(); 

t[21]=paper.text(nx[21],ny[21],'Area\nof Squares').attr({fill:"#666666","font-size": 14*sfac[21]});
tBox=t[21].getBBox(); 
bt[21]=ny[21]-(tBox.height/2+10*sfac[21]);
bb[21]=ny[21]+(tBox.height/2+10*sfac[21]);
bl[21]=nx[21]-(tBox.width/2+10*sfac[21]);
br[21]=nx[21]+(tBox.width/2+10*sfac[21]);
paper.setStart(); 
rect=paper.rect(bl[21], bt[21], br[21]-bl[21], bb[21]-bt[21], 10*sfac[21]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[21]=paper.setFinish(); 

t[22]=paper.text(nx[22],ny[22]-10,'Indirect\nProof').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[22]});
t[22].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Indirect-Proof-in-Algebra-and-Geometry/#Indirect Proof", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Indirect-Proof-in-Algebra-and-Geometry/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Indirect-Proof-in-Algebra-and-Geometry/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Indirect-Proof-in-Algebra-and-Geometry/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[22], bt[22], br[22]-bl[22], bb[22]-bt[22], 10*sfac[22]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[22]=paper.setFinish(); 
t[22].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[23]=paper.text(nx[23],ny[23],'Inductive Reasoning').attr({fill:"#666666","font-size": 14*sfac[23]});
tBox=t[23].getBBox(); 
bt[23]=ny[23]-(tBox.height/2+10*sfac[23]);
bb[23]=ny[23]+(tBox.height/2+10*sfac[23]);
bl[23]=nx[23]-(tBox.width/2+10*sfac[23]);
br[23]=nx[23]+(tBox.width/2+10*sfac[23]);
paper.setStart(); 
rect=paper.rect(bl[23], bt[23], br[23]-bl[23], bb[23]-bt[23], 10*sfac[23]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[23]=paper.setFinish(); 

t[24]=paper.text(nx[24],ny[24],'Vectors').attr({fill:"#666666","font-size": 14*sfac[24]});
tBox=t[24].getBBox(); 
bt[24]=ny[24]-(tBox.height/2+10*sfac[24]);
bb[24]=ny[24]+(tBox.height/2+10*sfac[24]);
bl[24]=nx[24]-(tBox.width/2+10*sfac[24]);
br[24]=nx[24]+(tBox.width/2+10*sfac[24]);
paper.setStart(); 
rect=paper.rect(bl[24], bt[24], br[24]-bl[24], bb[24]-bt[24], 10*sfac[24]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[24]=paper.setFinish(); 

t[25]=paper.text(nx[25],ny[25]-10,'Surface Area\nof Cylinders').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[25]});
t[25].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cylinders/#Surface Area of Cylinders", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Cylinders/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Cylinders/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[25], bt[25], br[25]-bl[25], bb[25]-bt[25], 10*sfac[25]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[25]=paper.setFinish(); 
t[25].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[26]=paper.text(nx[26],ny[26]-10,'Segments from\nSecants and Tangents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[26]});
t[26].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Segments-from-Secants-and-Tangents/#Segments from Secants and Tangents", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Segments-from-Secants-and-Tangents/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Segments-from-Secants-and-Tangents/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[26], bt[26], br[26]-bl[26], bb[26]-bt[26], 10*sfac[26]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[26]=paper.setFinish(); 
t[26].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[27]=paper.text(nx[27],ny[27],'Defining\nRotations').attr({fill:"#666666","font-size": 14*sfac[27]});
tBox=t[27].getBBox(); 
bt[27]=ny[27]-(tBox.height/2+10*sfac[27]);
bb[27]=ny[27]+(tBox.height/2+10*sfac[27]);
bl[27]=nx[27]-(tBox.width/2+10*sfac[27]);
br[27]=nx[27]+(tBox.width/2+10*sfac[27]);
paper.setStart(); 
rect=paper.rect(bl[27], bt[27], br[27]-bl[27], bb[27]-bt[27], 10*sfac[27]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[27]=paper.setFinish(); 

t[28]=paper.text(nx[28],ny[28],'Diagonals in\nSpecial Parallelograms').attr({fill:"#666666","font-size": 14*sfac[28]});
tBox=t[28].getBBox(); 
bt[28]=ny[28]-(tBox.height/2+10*sfac[28]);
bb[28]=ny[28]+(tBox.height/2+10*sfac[28]);
bl[28]=nx[28]-(tBox.width/2+10*sfac[28]);
br[28]=nx[28]+(tBox.width/2+10*sfac[28]);
paper.setStart(); 
rect=paper.rect(bl[28], bt[28], br[28]-bl[28], bb[28]-bt[28], 10*sfac[28]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[28]=paper.setFinish(); 

t[29]=paper.text(nx[29],ny[29]-10,'Lines of\nSymmetry').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[29]});
t[29].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reflection-Symmetry/#Lines of Symmetry", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Reflection-Symmetry/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Reflection-Symmetry/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[29], bt[29], br[29]-bl[29], bb[29]-bt[29], 10*sfac[29]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[29]=paper.setFinish(); 
t[29].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[30]=paper.text(nx[30],ny[30],'Area\nof Rectangles').attr({fill:"#666666","font-size": 14*sfac[30]});
tBox=t[30].getBBox(); 
bt[30]=ny[30]-(tBox.height/2+10*sfac[30]);
bb[30]=ny[30]+(tBox.height/2+10*sfac[30]);
bl[30]=nx[30]-(tBox.width/2+10*sfac[30]);
br[30]=nx[30]+(tBox.width/2+10*sfac[30]);
paper.setStart(); 
rect=paper.rect(bl[30], bt[30], br[30]-bl[30], bb[30]-bt[30], 10*sfac[30]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[30]=paper.setFinish(); 

t[31]=paper.text(nx[31],ny[31],'Segments and\nDistance').attr({fill:"#666666","font-size": 14*sfac[31]});
tBox=t[31].getBBox(); 
bt[31]=ny[31]-(tBox.height/2+10*sfac[31]);
bb[31]=ny[31]+(tBox.height/2+10*sfac[31]);
bl[31]=nx[31]-(tBox.width/2+10*sfac[31]);
br[31]=nx[31]+(tBox.width/2+10*sfac[31]);
paper.setStart(); 
rect=paper.rect(bl[31], bt[31], br[31]-bl[31], bb[31]-bt[31], 10*sfac[31]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[31]=paper.setFinish(); 

t[32]=paper.text(nx[32],ny[32],'Reflection Over\nHorizontal Lines').attr({fill:"#666666","font-size": 14*sfac[32]});
tBox=t[32].getBBox(); 
bt[32]=ny[32]-(tBox.height/2+10*sfac[32]);
bb[32]=ny[32]+(tBox.height/2+10*sfac[32]);
bl[32]=nx[32]-(tBox.width/2+10*sfac[32]);
br[32]=nx[32]+(tBox.width/2+10*sfac[32]);
paper.setStart(); 
rect=paper.rect(bl[32], bt[32], br[32]-bl[32], bb[32]-bt[32], 10*sfac[32]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[32]=paper.setFinish(); 

t[33]=paper.text(nx[33],ny[33],'Similar\nSolids').attr({fill:"#666666","font-size": 14*sfac[33]});
tBox=t[33].getBBox(); 
bt[33]=ny[33]-(tBox.height/2+10*sfac[33]);
bb[33]=ny[33]+(tBox.height/2+10*sfac[33]);
bl[33]=nx[33]-(tBox.width/2+10*sfac[33]);
br[33]=nx[33]+(tBox.width/2+10*sfac[33]);
paper.setStart(); 
rect=paper.rect(bl[33], bt[33], br[33]-bl[33], bb[33]-bt[33], 10*sfac[33]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[33]=paper.setFinish(); 

t[34]=paper.text(nx[34],ny[34]-10,'ASA and AAS\nTriangle Congruence').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[34]});
t[34].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/ASA-and-AAS-Triangle-Congruence/#ASA and AAS Triangle Congruence", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/ASA-and-AAS-Triangle-Congruence/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/ASA-and-AAS-Triangle-Congruence/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/ASA-and-AAS-Triangle-Congruence/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[34], bt[34], br[34]-bl[34], bb[34]-bt[34], 10*sfac[34]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[34]=paper.setFinish(); 
t[34].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[35]=paper.text(nx[35],ny[35],'Special Right\nTriangles').attr({fill:"#666666","font-size": 14*sfac[35]});
tBox=t[35].getBBox(); 
bt[35]=ny[35]-(tBox.height/2+10*sfac[35]);
bb[35]=ny[35]+(tBox.height/2+10*sfac[35]);
bl[35]=nx[35]-(tBox.width/2+10*sfac[35]);
br[35]=nx[35]+(tBox.width/2+10*sfac[35]);
paper.setStart(); 
rect=paper.rect(bl[35], bt[35], br[35]-bl[35], bb[35]-bt[35], 10*sfac[35]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[35]=paper.setFinish(); 

t[36]=paper.text(nx[36],ny[36],'Congruent\nLinear Pairs').attr({fill:"#666666","font-size": 14*sfac[36]});
tBox=t[36].getBBox(); 
bt[36]=ny[36]-(tBox.height/2+10*sfac[36]);
bb[36]=ny[36]+(tBox.height/2+10*sfac[36]);
bl[36]=nx[36]-(tBox.width/2+10*sfac[36]);
br[36]=nx[36]+(tBox.width/2+10*sfac[36]);
paper.setStart(); 
rect=paper.rect(bl[36], bt[36], br[36]-bl[36], bb[36]-bt[36], 10*sfac[36]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[36]=paper.setFinish(); 

t[37]=paper.text(nx[37],ny[37],'Similarity by\nAA, SSS, SAS').attr({fill:"#666666","font-size": 14*sfac[37]});
tBox=t[37].getBBox(); 
bt[37]=ny[37]-(tBox.height/2+10*sfac[37]);
bb[37]=ny[37]+(tBox.height/2+10*sfac[37]);
bl[37]=nx[37]-(tBox.width/2+10*sfac[37]);
br[37]=nx[37]+(tBox.width/2+10*sfac[37]);
paper.setStart(); 
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[37]=paper.setFinish(); 

t[38]=paper.text(nx[38],ny[38]-10,'Properties of\nArcs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[38]});
t[38].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Arcs-in-Circles/#Properties of Arcs", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Arcs-in-Circles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Arcs-in-Circles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[38], bt[38], br[38]-bl[38], bb[38]-bt[38], 10*sfac[38]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[38]=paper.setFinish(); 
t[38].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[39]=paper.text(nx[39],ny[39],'Glide Reflections').attr({fill:"#666666","font-size": 14*sfac[39]});
tBox=t[39].getBBox(); 
bt[39]=ny[39]-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
paper.setStart(); 
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 

t[40]=paper.text(nx[40],ny[40]-10,'Supplementary\nAngle Pairs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[40]});
t[40].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Supplementary-Angles/#Supplementary Angle Pairs", target: "_top",title:"Click to jump to concept"});
}); 
t[40].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[40].getBBox(); 
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
yicon = bb[40]-25; 
xicon2 = nx[40]+-40; 
xicon3 = nx[40]+-10; 
xicon4 = nx[40]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Supplementary-Angles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Supplementary-Angles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Supplementary-Angles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[40], bt[40], br[40]-bl[40], bb[40]-bt[40], 10*sfac[40]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[40]=paper.setFinish(); 
t[40].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[41]=paper.text(nx[41],ny[41],'Graphing a Circle in\nthe Coordinate Plane').attr({fill:"#666666","font-size": 14*sfac[41]});
tBox=t[41].getBBox(); 
bt[41]=ny[41]-(tBox.height/2+10*sfac[41]);
bb[41]=ny[41]+(tBox.height/2+10*sfac[41]);
bl[41]=nx[41]-(tBox.width/2+10*sfac[41]);
br[41]=nx[41]+(tBox.width/2+10*sfac[41]);
paper.setStart(); 
rect=paper.rect(bl[41], bt[41], br[41]-bl[41], bb[41]-bt[41], 10*sfac[41]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[41]=paper.setFinish(); 

t[42]=paper.text(nx[42],ny[42]-10,'Dilation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[42]});
t[42].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Dilation/#Dilation", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Dilation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Dilation/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[42], bt[42], br[42]-bl[42], bb[42]-bt[42], 10*sfac[42]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[42]=paper.setFinish(); 
t[42].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[43]=paper.text(nx[43],ny[43]-10,'Proportions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[43]});
t[43].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Proportion-Properties/#Proportions", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Proportion-Properties/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Proportion-Properties/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Proportion-Properties/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[43], bt[43], br[43]-bl[43], bb[43]-bt[43], 10*sfac[43]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[43]=paper.setFinish(); 
t[43].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[44]=paper.text(nx[44],ny[44],'Inequalities\nin Triangles').attr({fill:"#666666","font-size": 14*sfac[44]});
tBox=t[44].getBBox(); 
bt[44]=ny[44]-(tBox.height/2+10*sfac[44]);
bb[44]=ny[44]+(tBox.height/2+10*sfac[44]);
bl[44]=nx[44]-(tBox.width/2+10*sfac[44]);
br[44]=nx[44]+(tBox.width/2+10*sfac[44]);
paper.setStart(); 
rect=paper.rect(bl[44], bt[44], br[44]-bl[44], bb[44]-bt[44], 10*sfac[44]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[44]=paper.setFinish(); 

t[45]=paper.text(nx[45],ny[45],'Properties of\nProportions').attr({fill:"#666666","font-size": 14*sfac[45]});
tBox=t[45].getBBox(); 
bt[45]=ny[45]-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
paper.setStart(); 
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[45]=paper.setFinish(); 

t[46]=paper.text(nx[46],ny[46],'Pythagorean Triples').attr({fill:"#666666","font-size": 14*sfac[46]});
tBox=t[46].getBBox(); 
bt[46]=ny[46]-(tBox.height/2+10*sfac[46]);
bb[46]=ny[46]+(tBox.height/2+10*sfac[46]);
bl[46]=nx[46]-(tBox.width/2+10*sfac[46]);
br[46]=nx[46]+(tBox.width/2+10*sfac[46]);
paper.setStart(); 
rect=paper.rect(bl[46], bt[46], br[46]-bl[46], bb[46]-bt[46], 10*sfac[46]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[46]=paper.setFinish(); 

t[47]=paper.text(nx[47],ny[47],'Rectangles').attr({fill:"#666666","font-size": 14*sfac[47]});
tBox=t[47].getBBox(); 
bt[47]=ny[47]-(tBox.height/2+10*sfac[47]);
bb[47]=ny[47]+(tBox.height/2+10*sfac[47]);
bl[47]=nx[47]-(tBox.width/2+10*sfac[47]);
br[47]=nx[47]+(tBox.width/2+10*sfac[47]);
paper.setStart(); 
rect=paper.rect(bl[47], bt[47], br[47]-bl[47], bb[47]-bt[47], 10*sfac[47]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[47]=paper.setFinish(); 

t[48]=paper.text(nx[48],ny[48],'Triangle\nRelationships').attr({fill:"#666666","font-size": 14*sfac[48]});
tBox=t[48].getBBox(); 
bt[48]=ny[48]-(tBox.height/2+10*sfac[48]);
bb[48]=ny[48]+(tBox.height/2+10*sfac[48]);
bl[48]=nx[48]-(tBox.width/2+10*sfac[48]);
br[48]=nx[48]+(tBox.width/2+10*sfac[48]);
paper.setStart(); 
rect=paper.rect(bl[48], bt[48], br[48]-bl[48], bb[48]-bt[48], 10*sfac[48]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[48]=paper.setFinish(); 

t[49]=paper.text(nx[49],ny[49],'Perimeter, Circumference, Area,\nSurface Area, Volume').attr({fill:"#666666","font-size": 14*sfac[49]});
tBox=t[49].getBBox(); 
bt[49]=ny[49]-(tBox.height/2+10*sfac[49]);
bb[49]=ny[49]+(tBox.height/2+10*sfac[49]);
bl[49]=nx[49]-(tBox.width/2+10*sfac[49]);
br[49]=nx[49]+(tBox.width/2+10*sfac[49]);
paper.setStart(); 
rect=paper.rect(bl[49], bt[49], br[49]-bl[49], bb[49]-bt[49], 10*sfac[49]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[49]=paper.setFinish(); 

t[50]=paper.text(nx[50],ny[50],'Parallelograms in the Coordinate\nPlane').attr({fill:"#666666","font-size": 14*sfac[50]});
tBox=t[50].getBBox(); 
bt[50]=ny[50]-(tBox.height/2+10*sfac[50]);
bb[50]=ny[50]+(tBox.height/2+10*sfac[50]);
bl[50]=nx[50]-(tBox.width/2+10*sfac[50]);
br[50]=nx[50]+(tBox.width/2+10*sfac[50]);
paper.setStart(); 
rect=paper.rect(bl[50], bt[50], br[50]-bl[50], bb[50]-bt[50], 10*sfac[50]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[50]=paper.setFinish(); 

t[51]=paper.text(nx[51],ny[51]-10,'Classifying\nAngles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[51]});
t[51].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angle-Classification/#Classifying Angles", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Angle-Classification/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angle-Classification/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angle-Classification/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[51], bt[51], br[51]-bl[51], bb[51]-bt[51], 10*sfac[51]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[51]=paper.setFinish(); 
t[51].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[52]=paper.text(nx[52],ny[52],'Sierpinski\nTriangle').attr({fill:"#666666","font-size": 14*sfac[52]});
tBox=t[52].getBBox(); 
bt[52]=ny[52]-(tBox.height/2+10*sfac[52]);
bb[52]=ny[52]+(tBox.height/2+10*sfac[52]);
bl[52]=nx[52]-(tBox.width/2+10*sfac[52]);
br[52]=nx[52]+(tBox.width/2+10*sfac[52]);
paper.setStart(); 
rect=paper.rect(bl[52], bt[52], br[52]-bl[52], bb[52]-bt[52], 10*sfac[52]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[52]=paper.setFinish(); 

t[53]=paper.text(nx[53],ny[53],'Area of\nTrapezoids, Rhombi,\nand Kites').attr({fill:"#666666","font-size": 14*sfac[53]});
tBox=t[53].getBBox(); 
bt[53]=ny[53]-(tBox.height/2+10*sfac[53]);
bb[53]=ny[53]+(tBox.height/2+10*sfac[53]);
bl[53]=nx[53]-(tBox.width/2+10*sfac[53]);
br[53]=nx[53]+(tBox.width/2+10*sfac[53]);
paper.setStart(); 
rect=paper.rect(bl[53], bt[53], br[53]-bl[53], bb[53]-bt[53], 10*sfac[53]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[53]=paper.setFinish(); 

t[54]=paper.text(nx[54],ny[54],'Circle\nCircumference').attr({fill:"#666666","font-size": 14*sfac[54]});
tBox=t[54].getBBox(); 
bt[54]=ny[54]-(tBox.height/2+10*sfac[54]);
bb[54]=ny[54]+(tBox.height/2+10*sfac[54]);
bl[54]=nx[54]-(tBox.width/2+10*sfac[54]);
br[54]=nx[54]+(tBox.width/2+10*sfac[54]);
paper.setStart(); 
rect=paper.rect(bl[54], bt[54], br[54]-bl[54], bb[54]-bt[54], 10*sfac[54]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[54]=paper.setFinish(); 

t[55]=paper.text(nx[55],ny[55],'Congruent\nArcs').attr({fill:"#666666","font-size": 14*sfac[55]});
tBox=t[55].getBBox(); 
bt[55]=ny[55]-(tBox.height/2+10*sfac[55]);
bb[55]=ny[55]+(tBox.height/2+10*sfac[55]);
bl[55]=nx[55]-(tBox.width/2+10*sfac[55]);
br[55]=nx[55]+(tBox.width/2+10*sfac[55]);
paper.setStart(); 
rect=paper.rect(bl[55], bt[55], br[55]-bl[55], bb[55]-bt[55], 10*sfac[55]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[55]=paper.setFinish(); 

t[56]=paper.text(nx[56],ny[56],'Angles Inside\na Circle').attr({fill:"#666666","font-size": 14*sfac[56]});
tBox=t[56].getBBox(); 
bt[56]=ny[56]-(tBox.height/2+10*sfac[56]);
bb[56]=ny[56]+(tBox.height/2+10*sfac[56]);
bl[56]=nx[56]-(tBox.width/2+10*sfac[56]);
br[56]=nx[56]+(tBox.width/2+10*sfac[56]);
paper.setStart(); 
rect=paper.rect(bl[56], bt[56], br[56]-bl[56], bb[56]-bt[56], 10*sfac[56]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[56]=paper.setFinish(); 

t[57]=paper.text(nx[57],ny[57]-10,'Angles Outside\na Circle').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[57]});
t[57].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angles-Outside-a-Circle/#Angles Outside a Circle", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angles-Outside-a-Circle/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angles-Outside-a-Circle/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[57], bt[57], br[57]-bl[57], bb[57]-bt[57], 10*sfac[57]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[57]=paper.setFinish(); 
t[57].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[58]=paper.text(nx[58],ny[58]-10,'Polygons and\nQuadrilaterals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[58]});
t[58].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Quadrilateral-Classification/#Polygons and Quadrilaterals", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Quadrilateral-Classification/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Quadrilateral-Classification/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[58], bt[58], br[58]-bl[58], bb[58]-bt[58], 10*sfac[58]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[58]=paper.setFinish(); 
t[58].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[59]=paper.text(nx[59],ny[59],'Converse of the\nPythagorean Theorem').attr({fill:"#666666","font-size": 14*sfac[59]});
tBox=t[59].getBBox(); 
bt[59]=ny[59]-(tBox.height/2+10*sfac[59]);
bb[59]=ny[59]+(tBox.height/2+10*sfac[59]);
bl[59]=nx[59]-(tBox.width/2+10*sfac[59]);
br[59]=nx[59]+(tBox.width/2+10*sfac[59]);
paper.setStart(); 
rect=paper.rect(bl[59], bt[59], br[59]-bl[59], bb[59]-bt[59], 10*sfac[59]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[59]=paper.setFinish(); 

t[60]=paper.text(nx[60],ny[60]-10,'Slopes of\nPerpendicular Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[60]});
t[60].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Perpendicular-Lines-in-the-Coordinate-Plane/#Slopes of Perpendicular Lines", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Perpendicular-Lines-in-the-Coordinate-Plane/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Perpendicular-Lines-in-the-Coordinate-Plane/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[60], bt[60], br[60]-bl[60], bb[60]-bt[60], 10*sfac[60]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[60]=paper.setFinish(); 
t[60].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[61]=paper.text(nx[61],ny[61],'Squares').attr({fill:"#666666","font-size": 14*sfac[61]});
tBox=t[61].getBBox(); 
bt[61]=ny[61]-(tBox.height/2+10*sfac[61]);
bb[61]=ny[61]+(tBox.height/2+10*sfac[61]);
bl[61]=nx[61]-(tBox.width/2+10*sfac[61]);
br[61]=nx[61]+(tBox.width/2+10*sfac[61]);
paper.setStart(); 
rect=paper.rect(bl[61], bt[61], br[61]-bl[61], bb[61]-bt[61], 10*sfac[61]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[61]=paper.setFinish(); 

t[62]=paper.text(nx[62],ny[62]-10,'Inscribed\nQuadrilaterals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[62]});
t[62].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inscribed-Quadrilaterals-in-Circles/#Inscribed Quadrilaterals", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Inscribed-Quadrilaterals-in-Circles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inscribed-Quadrilaterals-in-Circles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[62], bt[62], br[62]-bl[62], bb[62]-bt[62], 10*sfac[62]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[62]=paper.setFinish(); 
t[62].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[63]=paper.text(nx[63],ny[63]-10,'Proof that\na Quadrilateral\nis a Parallelogram').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[63]});
t[63].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Quadrilaterals-that-are-Parallelograms/#Proof that a Quadrilateral is a Parallelogram", target: "_top",title:"Click to jump to concept"});
}); 
t[63].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[63].getBBox(); 
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
yicon = bb[63]-25; 
xicon2 = nx[63]+-40; 
xicon3 = nx[63]+-10; 
xicon4 = nx[63]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Quadrilaterals-that-are-Parallelograms/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Quadrilaterals-that-are-Parallelograms/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[63], bt[63], br[63]-bl[63], bb[63]-bt[63], 10*sfac[63]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[63]=paper.setFinish(); 
t[63].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[64]=paper.text(nx[64],ny[64],'Solving\nTriangles').attr({fill:"#666666","font-size": 14*sfac[64]});
tBox=t[64].getBBox(); 
bt[64]=ny[64]-(tBox.height/2+10*sfac[64]);
bb[64]=ny[64]+(tBox.height/2+10*sfac[64]);
bl[64]=nx[64]-(tBox.width/2+10*sfac[64]);
br[64]=nx[64]+(tBox.width/2+10*sfac[64]);
paper.setStart(); 
rect=paper.rect(bl[64], bt[64], br[64]-bl[64], bb[64]-bt[64], 10*sfac[64]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[64]=paper.setFinish(); 

t[65]=paper.text(nx[65],ny[65],'Volume\nof Sphere').attr({fill:"#666666","font-size": 14*sfac[65]});
tBox=t[65].getBBox(); 
bt[65]=ny[65]-(tBox.height/2+10*sfac[65]);
bb[65]=ny[65]+(tBox.height/2+10*sfac[65]);
bl[65]=nx[65]-(tBox.width/2+10*sfac[65]);
br[65]=nx[65]+(tBox.width/2+10*sfac[65]);
paper.setStart(); 
rect=paper.rect(bl[65], bt[65], br[65]-bl[65], bb[65]-bt[65], 10*sfac[65]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[65]=paper.setFinish(); 

t[66]=paper.text(nx[66],ny[66]-10,'Composition of\nTransformations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[66]});
t[66].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Composition-of-Transformations/#Composition of Transformations", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Composition-of-Transformations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Composition-of-Transformations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[66], bt[66], br[66]-bl[66], bb[66]-bt[66], 10*sfac[66]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[66]=paper.setFinish(); 
t[66].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[67]=paper.text(nx[67],ny[67],'Triangle\nCongruence').attr({fill:"#666666","font-size": 14*sfac[67]});
tBox=t[67].getBBox(); 
bt[67]=ny[67]-(tBox.height/2+10*sfac[67]);
bb[67]=ny[67]+(tBox.height/2+10*sfac[67]);
bl[67]=nx[67]-(tBox.width/2+10*sfac[67]);
br[67]=nx[67]+(tBox.width/2+10*sfac[67]);
paper.setStart(); 
rect=paper.rect(bl[67], bt[67], br[67]-bl[67], bb[67]-bt[67], 10*sfac[67]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[67]=paper.setFinish(); 

t[68]=paper.text(nx[68],ny[68]-10,'Alternate Interior\nAngles Theorem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[68]});
t[68].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Alternate-Interior-Angles/#Alternate Interior Angles Theorem", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Alternate-Interior-Angles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Alternate-Interior-Angles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Alternate-Interior-Angles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[68], bt[68], br[68]-bl[68], bb[68]-bt[68], 10*sfac[68]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[68]=paper.setFinish(); 
t[68].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[69]=paper.text(nx[69],ny[69],'Finding the Sides\nof a Triangle Using\nTrigonometric Ratios').attr({fill:"#666666","font-size": 14*sfac[69]});
tBox=t[69].getBBox(); 
bt[69]=ny[69]-(tBox.height/2+10*sfac[69]);
bb[69]=ny[69]+(tBox.height/2+10*sfac[69]);
bl[69]=nx[69]-(tBox.width/2+10*sfac[69]);
br[69]=nx[69]+(tBox.width/2+10*sfac[69]);
paper.setStart(); 
rect=paper.rect(bl[69], bt[69], br[69]-bl[69], bb[69]-bt[69], 10*sfac[69]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[69]=paper.setFinish(); 

t[70]=paper.text(nx[70],ny[70],'Angles').attr({fill:"#666666","font-size": 14*sfac[70]});
tBox=t[70].getBBox(); 
bt[70]=ny[70]-(tBox.height/2+10*sfac[70]);
bb[70]=ny[70]+(tBox.height/2+10*sfac[70]);
bl[70]=nx[70]-(tBox.width/2+10*sfac[70]);
br[70]=nx[70]+(tBox.width/2+10*sfac[70]);
paper.setStart(); 
rect=paper.rect(bl[70], bt[70], br[70]-bl[70], bb[70]-bt[70], 10*sfac[70]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[70]=paper.setFinish(); 

t[71]=paper.text(nx[71],ny[71],'Parallel &\nPerpendicular Lines\nin the Coordinate Plane').attr({fill:"#666666","font-size": 14*sfac[71]});
tBox=t[71].getBBox(); 
bt[71]=ny[71]-(tBox.height/2+10*sfac[71]);
bb[71]=ny[71]+(tBox.height/2+10*sfac[71]);
bl[71]=nx[71]-(tBox.width/2+10*sfac[71]);
br[71]=nx[71]+(tBox.width/2+10*sfac[71]);
paper.setStart(); 
rect=paper.rect(bl[71], bt[71], br[71]-bl[71], bb[71]-bt[71], 10*sfac[71]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[71]=paper.setFinish(); 

t[72]=paper.text(nx[72],ny[72],'Angles of\nElevation and\nDepression').attr({fill:"#666666","font-size": 14*sfac[72]});
tBox=t[72].getBBox(); 
bt[72]=ny[72]-(tBox.height/2+10*sfac[72]);
bb[72]=ny[72]+(tBox.height/2+10*sfac[72]);
bl[72]=nx[72]-(tBox.width/2+10*sfac[72]);
br[72]=nx[72]+(tBox.width/2+10*sfac[72]);
paper.setStart(); 
rect=paper.rect(bl[72], bt[72], br[72]-bl[72], bb[72]-bt[72], 10*sfac[72]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[72]=paper.setFinish(); 

t[73]=paper.text(nx[73],ny[73]-10,'Proportions with\nAngle Bisectors').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[73]});
t[73].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Proportions-with-Angle-Bisectors/#Proportions with Angle Bisectors", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Proportions-with-Angle-Bisectors/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Proportions-with-Angle-Bisectors/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Proportions-with-Angle-Bisectors/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[73], bt[73], br[73]-bl[73], bb[73]-bt[73], 10*sfac[73]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[73]=paper.setFinish(); 
t[73].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[74]=paper.text(nx[74],ny[74],'Regular\nPolygons').attr({fill:"#666666","font-size": 14*sfac[74]});
tBox=t[74].getBBox(); 
bt[74]=ny[74]-(tBox.height/2+10*sfac[74]);
bb[74]=ny[74]+(tBox.height/2+10*sfac[74]);
bl[74]=nx[74]-(tBox.width/2+10*sfac[74]);
br[74]=nx[74]+(tBox.width/2+10*sfac[74]);
paper.setStart(); 
rect=paper.rect(bl[74], bt[74], br[74]-bl[74], bb[74]-bt[74], 10*sfac[74]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[74]=paper.setFinish(); 

t[75]=paper.text(nx[75],ny[75]-10,'Properties of\nPerpendicular Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[75]});
t[75].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Perpendicular-Lines/#Properties of Perpendicular Lines", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Perpendicular-Lines/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Perpendicular-Lines/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Perpendicular-Lines/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[75], bt[75], br[75]-bl[75], bb[75]-bt[75], 10*sfac[75]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[75]=paper.setFinish(); 
t[75].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[76]=paper.text(nx[76],ny[76]-10,'The Distance\nFormula').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[76]});
t[76].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Distance-Formula-in-the-Coordinate-Plane/#The Distance Formula", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distance-Formula-in-the-Coordinate-Plane/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distance-Formula-in-the-Coordinate-Plane/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distance-Formula-in-the-Coordinate-Plane/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[76], bt[76], br[76]-bl[76], bb[76]-bt[76], 10*sfac[76]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[76]=paper.setFinish(); 
t[76].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[77]=paper.text(nx[77],ny[77],'Convex\nPolygons').attr({fill:"#666666","font-size": 14*sfac[77]});
tBox=t[77].getBBox(); 
bt[77]=ny[77]-(tBox.height/2+10*sfac[77]);
bb[77]=ny[77]+(tBox.height/2+10*sfac[77]);
bl[77]=nx[77]-(tBox.width/2+10*sfac[77]);
br[77]=nx[77]+(tBox.width/2+10*sfac[77]);
paper.setStart(); 
rect=paper.rect(bl[77], bt[77], br[77]-bl[77], bb[77]-bt[77], 10*sfac[77]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[77]=paper.setFinish(); 

t[78]=paper.text(nx[78],ny[78],'Surface Area\nof Similar Solids').attr({fill:"#666666","font-size": 14*sfac[78]});
tBox=t[78].getBBox(); 
bt[78]=ny[78]-(tBox.height/2+10*sfac[78]);
bb[78]=ny[78]+(tBox.height/2+10*sfac[78]);
bl[78]=nx[78]-(tBox.width/2+10*sfac[78]);
br[78]=nx[78]+(tBox.width/2+10*sfac[78]);
paper.setStart(); 
rect=paper.rect(bl[78], bt[78], br[78]-bl[78], bb[78]-bt[78], 10*sfac[78]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[78]=paper.setFinish(); 

t[79]=paper.text(nx[79],ny[79],'Tangents\nand Radii').attr({fill:"#666666","font-size": 14*sfac[79]});
tBox=t[79].getBBox(); 
bt[79]=ny[79]-(tBox.height/2+10*sfac[79]);
bb[79]=ny[79]+(tBox.height/2+10*sfac[79]);
bl[79]=nx[79]-(tBox.width/2+10*sfac[79]);
br[79]=nx[79]+(tBox.width/2+10*sfac[79]);
paper.setStart(); 
rect=paper.rect(bl[79], bt[79], br[79]-bl[79], bb[79]-bt[79], 10*sfac[79]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[79]=paper.setFinish(); 

t[80]=paper.text(nx[80],ny[80]-10,'Tangent\nLines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[80]});
t[80].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Tangent-Lines/#Tangent Lines", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Tangent-Lines/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tangent-Lines/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tangent-Lines/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[80], bt[80], br[80]-bl[80], bb[80]-bt[80], 10*sfac[80]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[80]=paper.setFinish(); 
t[80].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[81]=paper.text(nx[81],ny[81],'Proportionality\nRelationships').attr({fill:"#666666","font-size": 14*sfac[81]});
tBox=t[81].getBBox(); 
bt[81]=ny[81]-(tBox.height/2+10*sfac[81]);
bb[81]=ny[81]+(tBox.height/2+10*sfac[81]);
bl[81]=nx[81]-(tBox.width/2+10*sfac[81]);
br[81]=nx[81]+(tBox.width/2+10*sfac[81]);
paper.setStart(); 
rect=paper.rect(bl[81], bt[81], br[81]-bl[81], bb[81]-bt[81], 10*sfac[81]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[81]=paper.setFinish(); 

t[82]=paper.text(nx[82],ny[82]-10,'Classifying\nPolygons').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[82]});
t[82].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Polygon-Classification/#Classifying Polygons", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Polygon-Classification/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Polygon-Classification/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Polygon-Classification/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[82], bt[82], br[82]-bl[82], bb[82]-bt[82], 10*sfac[82]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[82]=paper.setFinish(); 
t[82].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[83]=paper.text(nx[83],ny[83]-10,'Kites').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[83]});
t[83].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Kites/#Kites", target: "_top",title:"Click to jump to concept"});
}); 
t[83].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[83].getBBox(); 
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
yicon = bb[83]-25; 
xicon2 = nx[83]+-40; 
xicon3 = nx[83]+-10; 
xicon4 = nx[83]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Kites/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Kites/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[83], bt[83], br[83]-bl[83], bb[83]-bt[83], 10*sfac[83]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[83]=paper.setFinish(); 
t[83].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[84]=paper.text(nx[84],ny[84],'Reflection Over\nVertical Lines').attr({fill:"#666666","font-size": 14*sfac[84]});
tBox=t[84].getBBox(); 
bt[84]=ny[84]-(tBox.height/2+10*sfac[84]);
bb[84]=ny[84]+(tBox.height/2+10*sfac[84]);
bl[84]=nx[84]-(tBox.width/2+10*sfac[84]);
br[84]=nx[84]+(tBox.width/2+10*sfac[84]);
paper.setStart(); 
rect=paper.rect(bl[84], bt[84], br[84]-bl[84], bb[84]-bt[84], 10*sfac[84]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[84]=paper.setFinish(); 

t[85]=paper.text(nx[85],ny[85],'Reflections Over\nIntersecting Lines').attr({fill:"#666666","font-size": 14*sfac[85]});
tBox=t[85].getBBox(); 
bt[85]=ny[85]-(tBox.height/2+10*sfac[85]);
bb[85]=ny[85]+(tBox.height/2+10*sfac[85]);
bl[85]=nx[85]-(tBox.width/2+10*sfac[85]);
br[85]=nx[85]+(tBox.width/2+10*sfac[85]);
paper.setStart(); 
rect=paper.rect(bl[85], bt[85], br[85]-bl[85], bb[85]-bt[85], 10*sfac[85]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[85]=paper.setFinish(); 

t[86]=paper.text(nx[86],ny[86]-10,'Rhombi and Kites').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[86]});
t[86].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Rhombuses-and-Kites/#Rhombi and Kites", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Rhombuses-and-Kites/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Rhombuses-and-Kites/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[86], bt[86], br[86]-bl[86], bb[86]-bt[86], 10*sfac[86]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[86]=paper.setFinish(); 
t[86].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[87]=paper.text(nx[87],ny[87],'Regular\nPolygons').attr({fill:"#666666","font-size": 14*sfac[87]});
tBox=t[87].getBBox(); 
bt[87]=ny[87]-(tBox.height/2+10*sfac[87]);
bb[87]=ny[87]+(tBox.height/2+10*sfac[87]);
bl[87]=nx[87]-(tBox.width/2+10*sfac[87]);
br[87]=nx[87]+(tBox.width/2+10*sfac[87]);
paper.setStart(); 
rect=paper.rect(bl[87], bt[87], br[87]-bl[87], bb[87]-bt[87], 10*sfac[87]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[87]=paper.setFinish(); 

t[88]=paper.text(nx[88],ny[88]-10,'Midpoints and\nSegment Bisectors').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[88]});
t[88].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Midpoints-and-Segment-Bisectors/#Midpoints and Segment Bisectors", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Midpoints-and-Segment-Bisectors/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Midpoints-and-Segment-Bisectors/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Midpoints-and-Segment-Bisectors/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[88], bt[88], br[88]-bl[88], bb[88]-bt[88], 10*sfac[88]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[88]=paper.setFinish(); 
t[88].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[89]=paper.text(nx[89],ny[89],'Proving Lines are\nParallel').attr({fill:"#666666","font-size": 14*sfac[89]});
tBox=t[89].getBBox(); 
bt[89]=ny[89]-(tBox.height/2+10*sfac[89]);
bb[89]=ny[89]+(tBox.height/2+10*sfac[89]);
bl[89]=nx[89]-(tBox.width/2+10*sfac[89]);
br[89]=nx[89]+(tBox.width/2+10*sfac[89]);
paper.setStart(); 
rect=paper.rect(bl[89], bt[89], br[89]-bl[89], bb[89]-bt[89], 10*sfac[89]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[89]=paper.setFinish(); 

t[90]=paper.text(nx[90],ny[90]-10,'Properties of\nChords').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[90]});
t[90].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Chords-in-Circles/#Properties of Chords", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Chords-in-Circles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Chords-in-Circles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[90], bt[90], br[90]-bl[90], bb[90]-bt[90], 10*sfac[90]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[90]=paper.setFinish(); 
t[90].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[91]=paper.text(nx[91],ny[91],'Transformations').attr({fill:"#666666","font-size": 14*sfac[91]});
tBox=t[91].getBBox(); 
bt[91]=ny[91]-(tBox.height/2+10*sfac[91]);
bb[91]=ny[91]+(tBox.height/2+10*sfac[91]);
bl[91]=nx[91]-(tBox.width/2+10*sfac[91]);
br[91]=nx[91]+(tBox.width/2+10*sfac[91]);
paper.setStart(); 
rect=paper.rect(bl[91], bt[91], br[91]-bl[91], bb[91]-bt[91], 10*sfac[91]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[91]=paper.setFinish(); 

t[92]=paper.text(nx[92],ny[92],'Central Angles\nand Arcs').attr({fill:"#666666","font-size": 14*sfac[92]});
tBox=t[92].getBBox(); 
bt[92]=ny[92]-(tBox.height/2+10*sfac[92]);
bb[92]=ny[92]+(tBox.height/2+10*sfac[92]);
bl[92]=nx[92]-(tBox.width/2+10*sfac[92]);
br[92]=nx[92]+(tBox.width/2+10*sfac[92]);
paper.setStart(); 
rect=paper.rect(bl[92], bt[92], br[92]-bl[92], bb[92]-bt[92], 10*sfac[92]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[92]=paper.setFinish(); 

t[93]=paper.text(nx[93],ny[93]-10,'Circumference').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[93]});
t[93].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Circumference/#Circumference", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Circumference/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Circumference/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[93], bt[93], br[93]-bl[93], bb[93]-bt[93], 10*sfac[93]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[93]=paper.setFinish(); 
t[93].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[94]=paper.text(nx[94],ny[94],'Volume of\nSimilar Solids').attr({fill:"#666666","font-size": 14*sfac[94]});
tBox=t[94].getBBox(); 
bt[94]=ny[94]-(tBox.height/2+10*sfac[94]);
bb[94]=ny[94]+(tBox.height/2+10*sfac[94]);
bl[94]=nx[94]-(tBox.width/2+10*sfac[94]);
br[94]=nx[94]+(tBox.width/2+10*sfac[94]);
paper.setStart(); 
rect=paper.rect(bl[94], bt[94], br[94]-bl[94], bb[94]-bt[94], 10*sfac[94]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[94]=paper.setFinish(); 

t[95]=paper.text(nx[95],ny[95]-10,'Conjectures and Counterexamples').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[95]});
t[95].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Conjectures-and-Counterexamples/#Conjectures and Counterexamples", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Conjectures-and-Counterexamples/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Conjectures-and-Counterexamples/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Conjectures-and-Counterexamples/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[95], bt[95], br[95]-bl[95], bb[95]-bt[95], 10*sfac[95]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[95]=paper.setFinish(); 
t[95].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[96]=paper.text(nx[96],ny[96],'Triangle\nSums').attr({fill:"#666666","font-size": 14*sfac[96]});
tBox=t[96].getBBox(); 
bt[96]=ny[96]-(tBox.height/2+10*sfac[96]);
bb[96]=ny[96]+(tBox.height/2+10*sfac[96]);
bl[96]=nx[96]-(tBox.width/2+10*sfac[96]);
br[96]=nx[96]+(tBox.width/2+10*sfac[96]);
paper.setStart(); 
rect=paper.rect(bl[96], bt[96], br[96]-bl[96], bb[96]-bt[96], 10*sfac[96]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[96]=paper.setFinish(); 

t[97]=paper.text(nx[97],ny[97],'Comparing Rectangles,\nSquares, Parallelograms').attr({fill:"#666666","font-size": 14*sfac[97]});
tBox=t[97].getBBox(); 
bt[97]=ny[97]-(tBox.height/2+10*sfac[97]);
bb[97]=ny[97]+(tBox.height/2+10*sfac[97]);
bl[97]=nx[97]-(tBox.width/2+10*sfac[97]);
br[97]=nx[97]+(tBox.width/2+10*sfac[97]);
paper.setStart(); 
rect=paper.rect(bl[97], bt[97], br[97]-bl[97], bb[97]-bt[97], 10*sfac[97]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[97]=paper.setFinish(); 

t[98]=paper.text(nx[98],ny[98]-10,'Angle Bisectors').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[98]});
t[98].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angle-Bisectors/#Angle Bisectors", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Angle-Bisectors/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angle-Bisectors/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angle-Bisectors/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[98], bt[98], br[98]-bl[98], bb[98]-bt[98], 10*sfac[98]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[98]=paper.setFinish(); 
t[98].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[99]=paper.text(nx[99],ny[99],'Rigid\nTransformations').attr({fill:"#666666","font-size": 14*sfac[99]});
tBox=t[99].getBBox(); 
bt[99]=ny[99]-(tBox.height/2+10*sfac[99]);
bb[99]=ny[99]+(tBox.height/2+10*sfac[99]);
bl[99]=nx[99]-(tBox.width/2+10*sfac[99]);
br[99]=nx[99]+(tBox.width/2+10*sfac[99]);
paper.setStart(); 
rect=paper.rect(bl[99], bt[99], br[99]-bl[99], bb[99]-bt[99], 10*sfac[99]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[99]=paper.setFinish(); 

t[100]=paper.text(nx[100],ny[100],'Parallel and\nPerpendicular Lines').attr({fill:"#666666","font-size": 14*sfac[100]});
tBox=t[100].getBBox(); 
bt[100]=ny[100]-(tBox.height/2+10*sfac[100]);
bb[100]=ny[100]+(tBox.height/2+10*sfac[100]);
bl[100]=nx[100]-(tBox.width/2+10*sfac[100]);
br[100]=nx[100]+(tBox.width/2+10*sfac[100]);
paper.setStart(); 
rect=paper.rect(bl[100], bt[100], br[100]-bl[100], bb[100]-bt[100], 10*sfac[100]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[100]=paper.setFinish(); 

t[101]=paper.text(nx[101],ny[101]-10,'Inscribed Similar\nTriangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[101]});
t[101].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inscribed-Similar-Triangles/#Inscribed Similar Triangles", target: "_top",title:"Click to jump to concept"});
}); 
t[101].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[101].getBBox(); 
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
yicon = bb[101]-25; 
xicon2 = nx[101]+-40; 
xicon3 = nx[101]+-10; 
xicon4 = nx[101]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inscribed-Similar-Triangles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inscribed-Similar-Triangles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[101], bt[101], br[101]-bl[101], bb[101]-bt[101], 10*sfac[101]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[101]=paper.setFinish(); 
t[101].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[102]=paper.text(nx[102],ny[102],'The Distance\nFormula').attr({fill:"#666666","font-size": 14*sfac[102]});
tBox=t[102].getBBox(); 
bt[102]=ny[102]-(tBox.height/2+10*sfac[102]);
bb[102]=ny[102]+(tBox.height/2+10*sfac[102]);
bl[102]=nx[102]-(tBox.width/2+10*sfac[102]);
br[102]=nx[102]+(tBox.width/2+10*sfac[102]);
paper.setStart(); 
rect=paper.rect(bl[102], bt[102], br[102]-bl[102], bb[102]-bt[102], 10*sfac[102]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[102]=paper.setFinish(); 

t[103]=paper.text(nx[103],ny[103]-10,'Trapezoids').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[103]});
t[103].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Trapezoids/#Trapezoids", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Trapezoids/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Trapezoids/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[103], bt[103], br[103]-bl[103], bb[103]-bt[103], 10*sfac[103]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[103]=paper.setFinish(); 
t[103].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[104]=paper.text(nx[104],ny[104]-10,'Same Side Interior\nAngles Theorem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[104]});
t[104].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Same-Side-Interior-Angles/#Same Side Interior Angles Theorem", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Same-Side-Interior-Angles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Same-Side-Interior-Angles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Same-Side-Interior-Angles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[104], bt[104], br[104]-bl[104], bb[104]-bt[104], 10*sfac[104]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[104]=paper.setFinish(); 
t[104].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[105]=paper.text(nx[105],ny[105]-10,'Sine, Cosine and\nTangent with a\nCalculator').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[105]});
t[105].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Trigonometric-Ratios-with-a-Calculator/#Sine, Cosine and Tangent with a Calculator", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Trigonometric-Ratios-with-a-Calculator/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Trigonometric-Ratios-with-a-Calculator/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[105], bt[105], br[105]-bl[105], bb[105]-bt[105], 10*sfac[105]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[105]=paper.setFinish(); 
t[105].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[106]=paper.text(nx[106],ny[106],"Euler's Theorem").attr({fill:"#666666","font-size": 14*sfac[106]});
tBox=t[106].getBBox(); 
bt[106]=ny[106]-(tBox.height/2+10*sfac[106]);
bb[106]=ny[106]+(tBox.height/2+10*sfac[106]);
bl[106]=nx[106]-(tBox.width/2+10*sfac[106]);
br[106]=nx[106]+(tBox.width/2+10*sfac[106]);
paper.setStart(); 
rect=paper.rect(bl[106], bt[106], br[106]-bl[106], bb[106]-bt[106], 10*sfac[106]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[106]=paper.setFinish(); 

t[107]=paper.text(nx[107],ny[107]-10,'Deductive Reasoning').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[107]});
t[107].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Deductive-Reasoning/#Deductive Reasoning", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Deductive-Reasoning/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Deductive-Reasoning/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Deductive-Reasoning/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[107], bt[107], br[107]-bl[107], bb[107]-bt[107], 10*sfac[107]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[107]=paper.setFinish(); 
t[107].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[108]=paper.text(nx[108],ny[108],'Identifying Acute\nand Obtuse Angles').attr({fill:"#666666","font-size": 14*sfac[108]});
tBox=t[108].getBBox(); 
bt[108]=ny[108]-(tBox.height/2+10*sfac[108]);
bb[108]=ny[108]+(tBox.height/2+10*sfac[108]);
bl[108]=nx[108]-(tBox.width/2+10*sfac[108]);
br[108]=nx[108]+(tBox.width/2+10*sfac[108]);
paper.setStart(); 
rect=paper.rect(bl[108], bt[108], br[108]-bl[108], bb[108]-bt[108], 10*sfac[108]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[108]=paper.setFinish(); 

t[109]=paper.text(nx[109],ny[109],'Quadrilaterals that\nare not Parallelograms').attr({fill:"#666666","font-size": 14*sfac[109]});
tBox=t[109].getBBox(); 
bt[109]=ny[109]-(tBox.height/2+10*sfac[109]);
bb[109]=ny[109]+(tBox.height/2+10*sfac[109]);
bl[109]=nx[109]-(tBox.width/2+10*sfac[109]);
br[109]=nx[109]+(tBox.width/2+10*sfac[109]);
paper.setStart(); 
rect=paper.rect(bl[109], bt[109], br[109]-bl[109], bb[109]-bt[109], 10*sfac[109]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[109]=paper.setFinish(); 

t[110]=paper.text(nx[110],ny[110],'Geometry').attr({fill:"#000000","font-size": 24*sfac[110]});
tBox=t[110].getBBox(); 
bt[110]=ny[110]-(tBox.height/2+10*sfac[110]);
bb[110]=ny[110]+(tBox.height/2+10*sfac[110]);
bl[110]=nx[110]-(tBox.width/2+10*sfac[110]);
br[110]=nx[110]+(tBox.width/2+10*sfac[110]);
paper.setStart(); 
rect=paper.rect(bl[110], bt[110], br[110]-bl[110], bb[110]-bt[110], 10*sfac[110]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[110]=paper.setFinish(); 

t[111]=paper.text(nx[111],ny[111]-10,'Triangle\nSum Theorem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[111]});
t[111].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Triangle-Sum-Theorem/#Triangle Sum Theorem", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Triangle-Sum-Theorem/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Triangle-Sum-Theorem/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Triangle-Sum-Theorem/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[111], bt[111], br[111]-bl[111], bb[111]-bt[111], 10*sfac[111]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[111]=paper.setFinish(); 
t[111].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[112]=paper.text(nx[112],ny[112]-10,'Inscribed\nQuadrilaterals').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[112]});
t[112].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inscribed-Quadrilaterals-in-Circles/#Inscribed Quadrilaterals", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inscribed-Quadrilaterals-in-Circles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inscribed-Quadrilaterals-in-Circles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[112], bt[112], br[112]-bl[112], bb[112]-bt[112], 10*sfac[112]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[112]=paper.setFinish(); 
t[112].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[113]=paper.text(nx[113],ny[113],'Indirect Proof\nin Algebra').attr({fill:"#666666","font-size": 14*sfac[113]});
tBox=t[113].getBBox(); 
bt[113]=ny[113]-(tBox.height/2+10*sfac[113]);
bb[113]=ny[113]+(tBox.height/2+10*sfac[113]);
bl[113]=nx[113]-(tBox.width/2+10*sfac[113]);
br[113]=nx[113]+(tBox.width/2+10*sfac[113]);
paper.setStart(); 
rect=paper.rect(bl[113], bt[113], br[113]-bl[113], bb[113]-bt[113], 10*sfac[113]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[113]=paper.setFinish(); 

t[114]=paper.text(nx[114],ny[114]-10,'Polyhedrons').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[114]});
t[114].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Polyhedrons/#Polyhedrons", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Polyhedrons/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Polyhedrons/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[114], bt[114], br[114]-bl[114], bb[114]-bt[114], 10*sfac[114]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[114]=paper.setFinish(); 
t[114].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[115]=paper.text(nx[115],ny[115],'Law of Sines').attr({fill:"#666666","font-size": 14*sfac[115]});
tBox=t[115].getBBox(); 
bt[115]=ny[115]-(tBox.height/2+10*sfac[115]);
bb[115]=ny[115]+(tBox.height/2+10*sfac[115]);
bl[115]=nx[115]-(tBox.width/2+10*sfac[115]);
br[115]=nx[115]+(tBox.width/2+10*sfac[115]);
paper.setStart(); 
rect=paper.rect(bl[115], bt[115], br[115]-bl[115], bb[115]-bt[115], 10*sfac[115]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[115]=paper.setFinish(); 

t[116]=paper.text(nx[116],ny[116],'Area').attr({fill:"#666666","font-size": 14*sfac[116]});
tBox=t[116].getBBox(); 
bt[116]=ny[116]-(tBox.height/2+10*sfac[116]);
bb[116]=ny[116]+(tBox.height/2+10*sfac[116]);
bl[116]=nx[116]-(tBox.width/2+10*sfac[116]);
br[116]=nx[116]+(tBox.width/2+10*sfac[116]);
paper.setStart(); 
rect=paper.rect(bl[116], bt[116], br[116]-bl[116], bb[116]-bt[116], 10*sfac[116]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[116]=paper.setFinish(); 

t[117]=paper.text(nx[117],ny[117]-10,'30-60-90\nTriangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[117]});
t[117].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/30-60-90-Right-Triangles/#30-60-90 Triangles", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/30-60-90-Right-Triangles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/30-60-90-Right-Triangles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[117], bt[117], br[117]-bl[117], bb[117]-bt[117], 10*sfac[117]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[117]=paper.setFinish(); 
t[117].toFront(); 
vidicon.toFront(); 
atticon.toFront(); 

t[118]=paper.text(nx[118],ny[118],'Finding the Equation\nof a Circle').attr({fill:"#666666","font-size": 14*sfac[118]});
tBox=t[118].getBBox(); 
bt[118]=ny[118]-(tBox.height/2+10*sfac[118]);
bb[118]=ny[118]+(tBox.height/2+10*sfac[118]);
bl[118]=nx[118]-(tBox.width/2+10*sfac[118]);
br[118]=nx[118]+(tBox.width/2+10*sfac[118]);
paper.setStart(); 
rect=paper.rect(bl[118], bt[118], br[118]-bl[118], bb[118]-bt[118], 10*sfac[118]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[118]=paper.setFinish(); 

t[119]=paper.text(nx[119],ny[119],'Angles and\nMeasurement').attr({fill:"#666666","font-size": 14*sfac[119]});
tBox=t[119].getBBox(); 
bt[119]=ny[119]-(tBox.height/2+10*sfac[119]);
bb[119]=ny[119]+(tBox.height/2+10*sfac[119]);
bl[119]=nx[119]-(tBox.width/2+10*sfac[119]);
br[119]=nx[119]+(tBox.width/2+10*sfac[119]);
paper.setStart(); 
rect=paper.rect(bl[119], bt[119], br[119]-bl[119], bb[119]-bt[119], 10*sfac[119]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[119]=paper.setFinish(); 

t[120]=paper.text(nx[120],ny[120]-10,'AA\nSimilarity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[120]});
t[120].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/AA-Similarity/#AA Similarity", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/AA-Similarity/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/AA-Similarity/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[120], bt[120], br[120]-bl[120], bb[120]-bt[120], 10*sfac[120]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[120]=paper.setFinish(); 
t[120].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[121]=paper.text(nx[121],ny[121],'Congruent\nFigures').attr({fill:"#666666","font-size": 14*sfac[121]});
tBox=t[121].getBBox(); 
bt[121]=ny[121]-(tBox.height/2+10*sfac[121]);
bb[121]=ny[121]+(tBox.height/2+10*sfac[121]);
bl[121]=nx[121]-(tBox.width/2+10*sfac[121]);
br[121]=nx[121]+(tBox.width/2+10*sfac[121]);
paper.setStart(); 
rect=paper.rect(bl[121], bt[121], br[121]-bl[121], bb[121]-bt[121], 10*sfac[121]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[121]=paper.setFinish(); 

t[122]=paper.text(nx[122],ny[122],'Proofs: Angle\nPairs and Segments').attr({fill:"#666666","font-size": 14*sfac[122]});
tBox=t[122].getBBox(); 
bt[122]=ny[122]-(tBox.height/2+10*sfac[122]);
bb[122]=ny[122]+(tBox.height/2+10*sfac[122]);
bl[122]=nx[122]-(tBox.width/2+10*sfac[122]);
br[122]=nx[122]+(tBox.width/2+10*sfac[122]);
paper.setStart(); 
rect=paper.rect(bl[122], bt[122], br[122]-bl[122], bb[122]-bt[122], 10*sfac[122]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[122]=paper.setFinish(); 

t[123]=paper.text(nx[123],ny[123],'Similar Polygons').attr({fill:"#666666","font-size": 14*sfac[123]});
tBox=t[123].getBBox(); 
bt[123]=ny[123]-(tBox.height/2+10*sfac[123]);
bb[123]=ny[123]+(tBox.height/2+10*sfac[123]);
bl[123]=nx[123]-(tBox.width/2+10*sfac[123]);
br[123]=nx[123]+(tBox.width/2+10*sfac[123]);
paper.setStart(); 
rect=paper.rect(bl[123], bt[123], br[123]-bl[123], bb[123]-bt[123], 10*sfac[123]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[123]=paper.setFinish(); 

t[124]=paper.text(nx[124],ny[124]-10,'Writing and Graphing\nthe Equations of Circles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[124]});
t[124].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Circles-in-the-Coordinate-Plane/#Writing and Graphing the Equations of Circles", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Circles-in-the-Coordinate-Plane/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Circles-in-the-Coordinate-Plane/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Circles-in-the-Coordinate-Plane/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[124], bt[124], br[124]-bl[124], bb[124]-bt[124], 10*sfac[124]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[124]=paper.setFinish(); 
t[124].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[125]=paper.text(nx[125],ny[125]-10,'Angles of Chords,\nSecants, and Tangents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[125]});
t[125].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Angles-On-and-Inside-a-Circle/#Angles of Chords, Secants, and Tangents", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angles-On-and-Inside-a-Circle/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Angles-On-and-Inside-a-Circle/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[125], bt[125], br[125]-bl[125], bb[125]-bt[125], 10*sfac[125]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[125]=paper.setFinish(); 
t[125].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[126]=paper.text(nx[126],ny[126],'Volume\nof Prisms').attr({fill:"#666666","font-size": 14*sfac[126]});
tBox=t[126].getBBox(); 
bt[126]=ny[126]-(tBox.height/2+10*sfac[126]);
bb[126]=ny[126]+(tBox.height/2+10*sfac[126]);
bl[126]=nx[126]-(tBox.width/2+10*sfac[126]);
br[126]=nx[126]+(tBox.width/2+10*sfac[126]);
paper.setStart(); 
rect=paper.rect(bl[126], bt[126], br[126]-bl[126], bb[126]-bt[126], 10*sfac[126]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[126]=paper.setFinish(); 

t[127]=paper.text(nx[127],ny[127]-10,'Congruent\nTriangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[127]});
t[127].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Congruent-Triangles/#Congruent Triangles", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Congruent-Triangles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Congruent-Triangles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Congruent-Triangles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[127], bt[127], br[127]-bl[127], bb[127]-bt[127], 10*sfac[127]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[127]=paper.setFinish(); 
t[127].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[128]=paper.text(nx[128],ny[128]-10,'Algebraic and\nCongruence\nProperties').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[128]});
t[128].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Properties-of-Equality-and-Congruence/#Algebraic and Congruence Properties", target: "_top",title:"Click to jump to concept"});
}); 
t[128].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[128].getBBox(); 
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
yicon = bb[128]-25; 
xicon2 = nx[128]+-40; 
xicon3 = nx[128]+-10; 
xicon4 = nx[128]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Properties-of-Equality-and-Congruence/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Properties-of-Equality-and-Congruence/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Properties-of-Equality-and-Congruence/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[128], bt[128], br[128]-bl[128], bb[128]-bt[128], 10*sfac[128]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[128]=paper.setFinish(); 
t[128].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[129]=paper.text(nx[129],ny[129]-10,'Slopes of\nParallel Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[129]});
t[129].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Parallel-Lines/#Slopes of Parallel Lines", target: "_top",title:"Click to jump to concept"});
}); 
t[129].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[129].getBBox(); 
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
yicon = bb[129]-25; 
xicon2 = nx[129]+-40; 
xicon3 = nx[129]+-10; 
xicon4 = nx[129]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parallel-Lines/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parallel-Lines/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[129], bt[129], br[129]-bl[129], bb[129]-bt[129], 10*sfac[129]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[129]=paper.setFinish(); 
t[129].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[130]=paper.text(nx[130],ny[130]-10,'Triangle\nAltitudes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[130]});
t[130].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Altitudes/#Triangle Altitudes", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Altitudes/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Altitudes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Altitudes/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[130], bt[130], br[130]-bl[130], bb[130]-bt[130], 10*sfac[130]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[130]=paper.setFinish(); 
t[130].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[131]=paper.text(nx[131],ny[131]-10,'SAS Triangle\nCongruence').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[131]});
t[131].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/SAS-Triangle-Congruence/#SAS Triangle Congruence", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/SAS-Triangle-Congruence/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/SAS-Triangle-Congruence/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/SAS-Triangle-Congruence/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[131], bt[131], br[131]-bl[131], bb[131]-bt[131], 10*sfac[131]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[131]=paper.setFinish(); 
t[131].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[132]=paper.text(nx[132],ny[132],'Rhombuses').attr({fill:"#666666","font-size": 14*sfac[132]});
tBox=t[132].getBBox(); 
bt[132]=ny[132]-(tBox.height/2+10*sfac[132]);
bb[132]=ny[132]+(tBox.height/2+10*sfac[132]);
bl[132]=nx[132]-(tBox.width/2+10*sfac[132]);
br[132]=nx[132]+(tBox.width/2+10*sfac[132]);
paper.setStart(); 
rect=paper.rect(bl[132], bt[132], br[132]-bl[132], bb[132]-bt[132], 10*sfac[132]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[132]=paper.setFinish(); 

t[133]=paper.text(nx[133],ny[133],'Graphing Parallel\nand Perpendicular Lines').attr({fill:"#666666","font-size": 14*sfac[133]});
tBox=t[133].getBBox(); 
bt[133]=ny[133]-(tBox.height/2+10*sfac[133]);
bb[133]=ny[133]+(tBox.height/2+10*sfac[133]);
bl[133]=nx[133]-(tBox.width/2+10*sfac[133]);
br[133]=nx[133]+(tBox.width/2+10*sfac[133]);
paper.setStart(); 
rect=paper.rect(bl[133], bt[133], br[133]-bl[133], bb[133]-bt[133], 10*sfac[133]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[133]=paper.setFinish(); 

t[134]=paper.text(nx[134],ny[134],'Perpendicular Line\nPostulate').attr({fill:"#666666","font-size": 14*sfac[134]});
tBox=t[134].getBBox(); 
bt[134]=ny[134]-(tBox.height/2+10*sfac[134]);
bb[134]=ny[134]+(tBox.height/2+10*sfac[134]);
bl[134]=nx[134]-(tBox.width/2+10*sfac[134]);
br[134]=nx[134]+(tBox.width/2+10*sfac[134]);
paper.setStart(); 
rect=paper.rect(bl[134], bt[134], br[134]-bl[134], bb[134]-bt[134], 10*sfac[134]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[134]=paper.setFinish(); 

t[135]=paper.text(nx[135],ny[135],'Volume\nof Pyramids').attr({fill:"#666666","font-size": 14*sfac[135]});
tBox=t[135].getBBox(); 
bt[135]=ny[135]-(tBox.height/2+10*sfac[135]);
bb[135]=ny[135]+(tBox.height/2+10*sfac[135]);
bl[135]=nx[135]-(tBox.width/2+10*sfac[135]);
br[135]=nx[135]+(tBox.width/2+10*sfac[135]);
paper.setStart(); 
rect=paper.rect(bl[135], bt[135], br[135]-bl[135], bb[135]-bt[135], 10*sfac[135]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[135]=paper.setFinish(); 

t[136]=paper.text(nx[136],ny[136]-10,'Using Ratios').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[136]});
t[136].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Forms-of-Ratios/#Using Ratios", target: "_top",title:"Click to jump to concept"});
}); 
t[136].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[136].getBBox(); 
bt[136]=ny[136]-10-(tBox.height/2+10*sfac[136]);
bb[136]=ny[136]-10+(tBox.height/2+10*sfac[136]);
bl[136]=nx[136]-(tBox.width/2+10*sfac[136]);
br[136]=nx[136]+(tBox.width/2+10*sfac[136]);
var nwidth = br[136]-bl[136]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[136] = bl[136] - delta; 
    br[136] = br[136] + delta; 
} 
bb[136] = bb[136]+20; 
yicon = bb[136]-25; 
xicon2 = nx[136]+-40; 
xicon3 = nx[136]+-10; 
xicon4 = nx[136]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Forms-of-Ratios/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Forms-of-Ratios/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Forms-of-Ratios/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[136], bt[136], br[136]-bl[136], bb[136]-bt[136], 10*sfac[136]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[136]=paper.setFinish(); 
t[136].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[137]=paper.text(nx[137],ny[137]-10,'Self-Similarity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[137]});
t[137].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Self-Similarity/#Self-Similarity", target: "_top",title:"Click to jump to concept"});
}); 
t[137].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[137].getBBox(); 
bt[137]=ny[137]-10-(tBox.height/2+10*sfac[137]);
bb[137]=ny[137]-10+(tBox.height/2+10*sfac[137]);
bl[137]=nx[137]-(tBox.width/2+10*sfac[137]);
br[137]=nx[137]+(tBox.width/2+10*sfac[137]);
var nwidth = br[137]-bl[137]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[137] = bl[137] - delta; 
    br[137] = br[137] + delta; 
} 
bb[137] = bb[137]+20; 
yicon = bb[137]-25; 
xicon2 = nx[137]+-40; 
xicon3 = nx[137]+-10; 
xicon4 = nx[137]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Self-Similarity/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Self-Similarity/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[137], bt[137], br[137]-bl[137], bb[137]-bt[137], 10*sfac[137]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[137]=paper.setFinish(); 
t[137].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[138]=paper.text(nx[138],ny[138],'Angle Pairs').attr({fill:"#666666","font-size": 14*sfac[138]});
tBox=t[138].getBBox(); 
bt[138]=ny[138]-(tBox.height/2+10*sfac[138]);
bb[138]=ny[138]+(tBox.height/2+10*sfac[138]);
bl[138]=nx[138]-(tBox.width/2+10*sfac[138]);
br[138]=nx[138]+(tBox.width/2+10*sfac[138]);
paper.setStart(); 
rect=paper.rect(bl[138], bt[138], br[138]-bl[138], bb[138]-bt[138], 10*sfac[138]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[138]=paper.setFinish(); 

t[139]=paper.text(nx[139],ny[139],'Tangent\nSegments').attr({fill:"#666666","font-size": 14*sfac[139]});
tBox=t[139].getBBox(); 
bt[139]=ny[139]-(tBox.height/2+10*sfac[139]);
bb[139]=ny[139]+(tBox.height/2+10*sfac[139]);
bl[139]=nx[139]-(tBox.width/2+10*sfac[139]);
br[139]=nx[139]+(tBox.width/2+10*sfac[139]);
paper.setStart(); 
rect=paper.rect(bl[139], bt[139], br[139]-bl[139], bb[139]-bt[139], 10*sfac[139]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[139]=paper.setFinish(); 

t[140]=paper.text(nx[140],ny[140],'Corresponding\nAngles Converse').attr({fill:"#666666","font-size": 14*sfac[140]});
tBox=t[140].getBBox(); 
bt[140]=ny[140]-(tBox.height/2+10*sfac[140]);
bb[140]=ny[140]+(tBox.height/2+10*sfac[140]);
bl[140]=nx[140]-(tBox.width/2+10*sfac[140]);
br[140]=nx[140]+(tBox.width/2+10*sfac[140]);
paper.setStart(); 
rect=paper.rect(bl[140], bt[140], br[140]-bl[140], bb[140]-bt[140], 10*sfac[140]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[140]=paper.setFinish(); 

t[141]=paper.text(nx[141],ny[141]-10,'Properties of\nParallelograms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[141]});
t[141].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Parallelograms/#Properties of Parallelograms", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Parallelograms/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parallelograms/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[141], bt[141], br[141]-bl[141], bb[141]-bt[141], 10*sfac[141]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[141]=paper.setFinish(); 
t[141].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[142]=paper.text(nx[142],ny[142]-10,'Surface Area\nof Prisms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[142]});
t[142].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Prisms/#Surface Area of Prisms", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Prisms/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Prisms/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[142], bt[142], br[142]-bl[142], bb[142]-bt[142], 10*sfac[142]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[142]=paper.setFinish(); 
t[142].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[143]=paper.text(nx[143],ny[143]-10,'SSS Triangle\nCongruence').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[143]});
t[143].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/SSS-Triangle-Congruence/#SSS Triangle Congruence", target: "_top",title:"Click to jump to concept"});
}); 
t[143].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[143].getBBox(); 
bt[143]=ny[143]-10-(tBox.height/2+10*sfac[143]);
bb[143]=ny[143]-10+(tBox.height/2+10*sfac[143]);
bl[143]=nx[143]-(tBox.width/2+10*sfac[143]);
br[143]=nx[143]+(tBox.width/2+10*sfac[143]);
var nwidth = br[143]-bl[143]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[143] = bl[143] - delta; 
    br[143] = br[143] + delta; 
} 
bb[143] = bb[143]+20; 
yicon = bb[143]-25; 
xicon2 = nx[143]+-40; 
xicon3 = nx[143]+-10; 
xicon4 = nx[143]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/SSS-Triangle-Congruence/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/SSS-Triangle-Congruence/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/SSS-Triangle-Congruence/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[143], bt[143], br[143]-bl[143], bb[143]-bt[143], 10*sfac[143]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[143]=paper.setFinish(); 
t[143].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[144]=paper.text(nx[144],ny[144]-10,'Trapezoids').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[144]});
t[144].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Trapezoids/#Trapezoids", target: "_top",title:"Click to jump to concept"});
}); 
t[144].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[144].getBBox(); 
bt[144]=ny[144]-10-(tBox.height/2+10*sfac[144]);
bb[144]=ny[144]-10+(tBox.height/2+10*sfac[144]);
bl[144]=nx[144]-(tBox.width/2+10*sfac[144]);
br[144]=nx[144]+(tBox.width/2+10*sfac[144]);
var nwidth = br[144]-bl[144]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[144] = bl[144] - delta; 
    br[144] = br[144] + delta; 
} 
bb[144] = bb[144]+20; 
yicon = bb[144]-25; 
xicon2 = nx[144]+-40; 
xicon3 = nx[144]+-10; 
xicon4 = nx[144]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Trapezoids/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Trapezoids/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[144], bt[144], br[144]-bl[144], bb[144]-bt[144], 10*sfac[144]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[144]=paper.setFinish(); 
t[144].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[145]=paper.text(nx[145],ny[145],'Number Patterns').attr({fill:"#666666","font-size": 14*sfac[145]});
tBox=t[145].getBBox(); 
bt[145]=ny[145]-(tBox.height/2+10*sfac[145]);
bb[145]=ny[145]+(tBox.height/2+10*sfac[145]);
bl[145]=nx[145]-(tBox.width/2+10*sfac[145]);
br[145]=nx[145]+(tBox.width/2+10*sfac[145]);
paper.setStart(); 
rect=paper.rect(bl[145], bt[145], br[145]-bl[145], bb[145]-bt[145], 10*sfac[145]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[145]=paper.setFinish(); 

t[146]=paper.text(nx[146],ny[146]-10,'Parts of Circles\nand Tangent Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[146]});
t[146].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Parts-of-Circles/#Parts of Circles and Tangent Lines", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Parts-of-Circles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parts-of-Circles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parts-of-Circles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[146], bt[146], br[146]-bl[146], bb[146]-bt[146], 10*sfac[146]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[146]=paper.setFinish(); 
t[146].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[147]=paper.text(nx[147],ny[147]-10,'SAS Triangle\nCongruence').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[147]});
t[147].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/SAS-Triangle-Congruence/#SAS Triangle Congruence", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/SAS-Triangle-Congruence/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/SAS-Triangle-Congruence/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/SAS-Triangle-Congruence/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[147], bt[147], br[147]-bl[147], bb[147]-bt[147], 10*sfac[147]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[147]=paper.setFinish(); 
t[147].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[148]=paper.text(nx[148],ny[148]-10,'Cross Sections\nof Solids').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[148]});
t[148].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cross-Sections-and-Nets/#Cross Sections of Solids", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Cross-Sections-and-Nets/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Cross-Sections-and-Nets/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[148], bt[148], br[148]-bl[148], bb[148]-bt[148], 10*sfac[148]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[148]=paper.setFinish(); 
t[148].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[149]=paper.text(nx[149],ny[149]-10,'Pythagorean\nTheorem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[149]});
t[149].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Applications-of-the-Pythagorean-Theorem/#Pythagorean Theorem", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Applications-of-the-Pythagorean-Theorem/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-of-the-Pythagorean-Theorem/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Applications-of-the-Pythagorean-Theorem/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[149], bt[149], br[149]-bl[149], bb[149]-bt[149], 10*sfac[149]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[149]=paper.setFinish(); 
t[149].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[150]=paper.text(nx[150],ny[150],'Angles in Polygons').attr({fill:"#666666","font-size": 14*sfac[150]});
tBox=t[150].getBBox(); 
bt[150]=ny[150]-(tBox.height/2+10*sfac[150]);
bb[150]=ny[150]+(tBox.height/2+10*sfac[150]);
bl[150]=nx[150]-(tBox.width/2+10*sfac[150]);
br[150]=nx[150]+(tBox.width/2+10*sfac[150]);
paper.setStart(); 
rect=paper.rect(bl[150], bt[150], br[150]-bl[150], bb[150]-bt[150], 10*sfac[150]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[150]=paper.setFinish(); 

t[151]=paper.text(nx[151],ny[151],'Parallel Lines\nProperty').attr({fill:"#666666","font-size": 14*sfac[151]});
tBox=t[151].getBBox(); 
bt[151]=ny[151]-(tBox.height/2+10*sfac[151]);
bb[151]=ny[151]+(tBox.height/2+10*sfac[151]);
bl[151]=nx[151]-(tBox.width/2+10*sfac[151]);
br[151]=nx[151]+(tBox.width/2+10*sfac[151]);
paper.setStart(); 
rect=paper.rect(bl[151], bt[151], br[151]-bl[151], bb[151]-bt[151], 10*sfac[151]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[151]=paper.setFinish(); 

t[152]=paper.text(nx[152],ny[152],'Scale Factor\nof Similar Polygons').attr({fill:"#666666","font-size": 14*sfac[152]});
tBox=t[152].getBBox(); 
bt[152]=ny[152]-(tBox.height/2+10*sfac[152]);
bb[152]=ny[152]+(tBox.height/2+10*sfac[152]);
bl[152]=nx[152]-(tBox.width/2+10*sfac[152]);
br[152]=nx[152]+(tBox.width/2+10*sfac[152]);
paper.setStart(); 
rect=paper.rect(bl[152], bt[152], br[152]-bl[152], bb[152]-bt[152], 10*sfac[152]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[152]=paper.setFinish(); 

t[153]=paper.text(nx[153],ny[153]-10,'Vertical\nAngle Pairs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[153]});
t[153].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Vertical-Angles/#Vertical Angle Pairs", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Vertical-Angles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Vertical-Angles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Vertical-Angles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[153], bt[153], br[153]-bl[153], bb[153]-bt[153], 10*sfac[153]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[153]=paper.setFinish(); 
t[153].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[154]=paper.text(nx[154],ny[154],'Shortest\nDistance Between\na Point and a Line').attr({fill:"#666666","font-size": 14*sfac[154]});
tBox=t[154].getBBox(); 
bt[154]=ny[154]-(tBox.height/2+10*sfac[154]);
bb[154]=ny[154]+(tBox.height/2+10*sfac[154]);
bl[154]=nx[154]-(tBox.width/2+10*sfac[154]);
br[154]=nx[154]+(tBox.width/2+10*sfac[154]);
paper.setStart(); 
rect=paper.rect(bl[154], bt[154], br[154]-bl[154], bb[154]-bt[154], 10*sfac[154]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[154]=paper.setFinish(); 

t[155]=paper.text(nx[155],ny[155],'Squares').attr({fill:"#666666","font-size": 14*sfac[155]});
tBox=t[155].getBBox(); 
bt[155]=ny[155]-(tBox.height/2+10*sfac[155]);
bb[155]=ny[155]+(tBox.height/2+10*sfac[155]);
bl[155]=nx[155]-(tBox.width/2+10*sfac[155]);
br[155]=nx[155]+(tBox.width/2+10*sfac[155]);
paper.setStart(); 
rect=paper.rect(bl[155], bt[155], br[155]-bl[155], bb[155]-bt[155], 10*sfac[155]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[155]=paper.setFinish(); 

t[156]=paper.text(nx[156],ny[156]-10,'45-45-90\nTriangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[156]});
t[156].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/45-45-90-Right-Triangles/#45-45-90 Triangles", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/45-45-90-Right-Triangles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/45-45-90-Right-Triangles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[156], bt[156], br[156]-bl[156], bb[156]-bt[156], 10*sfac[156]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[156]=paper.setFinish(); 
t[156].toFront(); 
vidicon.toFront(); 
atticon.toFront(); 

t[157]=paper.text(nx[157],ny[157]-10,'Introduction to\nTwo-Column Proofs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[157]});
t[157].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Two-Column-Proofs/#Introduction to Two-Column Proofs", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Two-Column-Proofs/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Two-Column-Proofs/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[157], bt[157], br[157]-bl[157], bb[157]-bt[157], 10*sfac[157]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[157]=paper.setFinish(); 
t[157].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[158]=paper.text(nx[158],ny[158]-10,'Triangle\nProportionality').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[158]});
t[158].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Triangle-Proportionality/#Triangle Proportionality", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Triangle-Proportionality/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Triangle-Proportionality/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Triangle-Proportionality/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[158], bt[158], br[158]-bl[158], bb[158]-bt[158], 10*sfac[158]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[158]=paper.setFinish(); 
t[158].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[159]=paper.text(nx[159],ny[159],'Volume\nof Cylinders').attr({fill:"#666666","font-size": 14*sfac[159]});
tBox=t[159].getBBox(); 
bt[159]=ny[159]-(tBox.height/2+10*sfac[159]);
bb[159]=ny[159]+(tBox.height/2+10*sfac[159]);
bl[159]=nx[159]-(tBox.width/2+10*sfac[159]);
br[159]=nx[159]+(tBox.width/2+10*sfac[159]);
paper.setStart(); 
rect=paper.rect(bl[159], bt[159], br[159]-bl[159], bb[159]-bt[159], 10*sfac[159]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[159]=paper.setFinish(); 

t[160]=paper.text(nx[160],ny[160],'Inscribed in\nCircles').attr({fill:"#666666","font-size": 14*sfac[160]});
tBox=t[160].getBBox(); 
bt[160]=ny[160]-(tBox.height/2+10*sfac[160]);
bb[160]=ny[160]+(tBox.height/2+10*sfac[160]);
bl[160]=nx[160]-(tBox.width/2+10*sfac[160]);
br[160]=nx[160]+(tBox.width/2+10*sfac[160]);
paper.setStart(); 
rect=paper.rect(bl[160], bt[160], br[160]-bl[160], bb[160]-bt[160], 10*sfac[160]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[160]=paper.setFinish(); 

t[161]=paper.text(nx[161],ny[161]-10,'Reflections').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[161]});
t[161].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reflections/#Reflections", target: "_top",title:"Click to jump to concept"});
}); 
t[161].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[161].getBBox(); 
bt[161]=ny[161]-10-(tBox.height/2+10*sfac[161]);
bb[161]=ny[161]-10+(tBox.height/2+10*sfac[161]);
bl[161]=nx[161]-(tBox.width/2+10*sfac[161]);
br[161]=nx[161]+(tBox.width/2+10*sfac[161]);
var nwidth = br[161]-bl[161]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[161] = bl[161] - delta; 
    br[161] = br[161] + delta; 
} 
bb[161] = bb[161]+20; 
yicon = bb[161]-25; 
xicon2 = nx[161]+-40; 
xicon3 = nx[161]+-10; 
xicon4 = nx[161]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Reflections/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Reflections/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[161], bt[161], br[161]-bl[161], bb[161]-bt[161], 10*sfac[161]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[161]=paper.setFinish(); 
t[161].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[162]=paper.text(nx[162],ny[162],'Using Similar Right\nTriangles').attr({fill:"#666666","font-size": 14*sfac[162]});
tBox=t[162].getBBox(); 
bt[162]=ny[162]-(tBox.height/2+10*sfac[162]);
bb[162]=ny[162]+(tBox.height/2+10*sfac[162]);
bl[162]=nx[162]-(tBox.width/2+10*sfac[162]);
br[162]=nx[162]+(tBox.width/2+10*sfac[162]);
paper.setStart(); 
rect=paper.rect(bl[162], bt[162], br[162]-bl[162], bb[162]-bt[162], 10*sfac[162]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[162]=paper.setFinish(); 

t[163]=paper.text(nx[163],ny[163]-10,'Exploring Solids').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[163]});
t[163].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Composite-Solids/#Exploring Solids", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Composite-Solids/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Composite-Solids/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[163], bt[163], br[163]-bl[163], bb[163]-bt[163], 10*sfac[163]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[163]=paper.setFinish(); 
t[163].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[164]=paper.text(nx[164],ny[164],'Parallelograms').attr({fill:"#666666","font-size": 14*sfac[164]});
tBox=t[164].getBBox(); 
bt[164]=ny[164]-(tBox.height/2+10*sfac[164]);
bb[164]=ny[164]+(tBox.height/2+10*sfac[164]);
bl[164]=nx[164]-(tBox.width/2+10*sfac[164]);
br[164]=nx[164]+(tBox.width/2+10*sfac[164]);
paper.setStart(); 
rect=paper.rect(bl[164], bt[164], br[164]-bl[164], bb[164]-bt[164], 10*sfac[164]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[164]=paper.setFinish(); 

t[165]=paper.text(nx[165],ny[165],'Definition of\nTessellations').attr({fill:"#666666","font-size": 14*sfac[165]});
tBox=t[165].getBBox(); 
bt[165]=ny[165]-(tBox.height/2+10*sfac[165]);
bb[165]=ny[165]+(tBox.height/2+10*sfac[165]);
bl[165]=nx[165]-(tBox.width/2+10*sfac[165]);
br[165]=nx[165]+(tBox.width/2+10*sfac[165]);
paper.setStart(); 
rect=paper.rect(bl[165], bt[165], br[165]-bl[165], bb[165]-bt[165], 10*sfac[165]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[165]=paper.setFinish(); 

t[166]=paper.text(nx[166],ny[166],'Area of Rhombi\nand Kites').attr({fill:"#666666","font-size": 14*sfac[166]});
tBox=t[166].getBBox(); 
bt[166]=ny[166]-(tBox.height/2+10*sfac[166]);
bb[166]=ny[166]+(tBox.height/2+10*sfac[166]);
bl[166]=nx[166]-(tBox.width/2+10*sfac[166]);
br[166]=nx[166]+(tBox.width/2+10*sfac[166]);
paper.setStart(); 
rect=paper.rect(bl[166], bt[166], br[166]-bl[166], bb[166]-bt[166], 10*sfac[166]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[166]=paper.setFinish(); 

t[167]=paper.text(nx[167],ny[167],'Adjacent Complementary\nAngles').attr({fill:"#666666","font-size": 14*sfac[167]});
tBox=t[167].getBBox(); 
bt[167]=ny[167]-(tBox.height/2+10*sfac[167]);
bb[167]=ny[167]+(tBox.height/2+10*sfac[167]);
bl[167]=nx[167]-(tBox.width/2+10*sfac[167]);
br[167]=nx[167]+(tBox.width/2+10*sfac[167]);
paper.setStart(); 
rect=paper.rect(bl[167], bt[167], br[167]-bl[167], bb[167]-bt[167], 10*sfac[167]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[167]=paper.setFinish(); 

t[168]=paper.text(nx[168],ny[168],'Comparing\nAngles & Sides\nin Triangles').attr({fill:"#666666","font-size": 14*sfac[168]});
tBox=t[168].getBBox(); 
bt[168]=ny[168]-(tBox.height/2+10*sfac[168]);
bb[168]=ny[168]+(tBox.height/2+10*sfac[168]);
bl[168]=nx[168]-(tBox.width/2+10*sfac[168]);
br[168]=nx[168]+(tBox.width/2+10*sfac[168]);
paper.setStart(); 
rect=paper.rect(bl[168], bt[168], br[168]-bl[168], bb[168]-bt[168], 10*sfac[168]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[168]=paper.setFinish(); 

t[169]=paper.text(nx[169],ny[169]-10,'Area of Circles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[169]});
t[169].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-of-a-Circle/#Area of Circles", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-of-a-Circle/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-of-a-Circle/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[169], bt[169], br[169]-bl[169], bb[169]-bt[169], 10*sfac[169]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[169]=paper.setFinish(); 
t[169].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[170]=paper.text(nx[170],ny[170]-10,'Classifying\nTriangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[170]});
t[170].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Triangle-Classification/#Classifying Triangles", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Triangle-Classification/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Triangle-Classification/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Triangle-Classification/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[170], bt[170], br[170]-bl[170], bb[170]-bt[170], 10*sfac[170]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[170]=paper.setFinish(); 
t[170].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[171]=paper.text(nx[171],ny[171]-10,'Complementary\nAngle Pairs').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[171]});
t[171].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Complementary-Angles/#Complementary Angle Pairs", target: "_top",title:"Click to jump to concept"});
}); 
t[171].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[171].getBBox(); 
bt[171]=ny[171]-10-(tBox.height/2+10*sfac[171]);
bb[171]=ny[171]-10+(tBox.height/2+10*sfac[171]);
bl[171]=nx[171]-(tBox.width/2+10*sfac[171]);
br[171]=nx[171]+(tBox.width/2+10*sfac[171]);
var nwidth = br[171]-bl[171]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[171] = bl[171] - delta; 
    br[171] = br[171] + delta; 
} 
bb[171] = bb[171]+20; 
yicon = bb[171]-25; 
xicon2 = nx[171]+-40; 
xicon3 = nx[171]+-10; 
xicon4 = nx[171]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Complementary-Angles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Complementary-Angles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Complementary-Angles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[171], bt[171], br[171]-bl[171], bb[171]-bt[171], 10*sfac[171]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[171]=paper.setFinish(); 
t[171].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[172]=paper.text(nx[172],ny[172],'Circles').attr({fill:"#666666","font-size": 14*sfac[172]});
tBox=t[172].getBBox(); 
bt[172]=ny[172]-(tBox.height/2+10*sfac[172]);
bb[172]=ny[172]+(tBox.height/2+10*sfac[172]);
bl[172]=nx[172]-(tBox.width/2+10*sfac[172]);
br[172]=nx[172]+(tBox.width/2+10*sfac[172]);
paper.setStart(); 
rect=paper.rect(bl[172], bt[172], br[172]-bl[172], bb[172]-bt[172], 10*sfac[172]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[172]=paper.setFinish(); 

t[173]=paper.text(nx[173],ny[173]-10,'Segments from\nSecants').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[173]});
t[173].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Segments-from-Secants/#Segments from Secants", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Segments-from-Secants/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Segments-from-Secants/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[173], bt[173], br[173]-bl[173], bb[173]-bt[173], 10*sfac[173]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[173]=paper.setFinish(); 
t[173].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[174]=paper.text(nx[174],ny[174],'Congruence\nProperties').attr({fill:"#666666","font-size": 14*sfac[174]});
tBox=t[174].getBBox(); 
bt[174]=ny[174]-(tBox.height/2+10*sfac[174]);
bb[174]=ny[174]+(tBox.height/2+10*sfac[174]);
bl[174]=nx[174]-(tBox.width/2+10*sfac[174]);
br[174]=nx[174]+(tBox.width/2+10*sfac[174]);
paper.setStart(); 
rect=paper.rect(bl[174], bt[174], br[174]-bl[174], bb[174]-bt[174], 10*sfac[174]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[174]=paper.setFinish(); 

t[175]=paper.text(nx[175],ny[175]-10,'SSS\nSimilarity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[175]});
t[175].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/SSS-Similarity/#SSS Similarity", target: "_top",title:"Click to jump to concept"});
}); 
t[175].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[175].getBBox(); 
bt[175]=ny[175]-10-(tBox.height/2+10*sfac[175]);
bb[175]=ny[175]-10+(tBox.height/2+10*sfac[175]);
bl[175]=nx[175]-(tBox.width/2+10*sfac[175]);
br[175]=nx[175]+(tBox.width/2+10*sfac[175]);
var nwidth = br[175]-bl[175]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[175] = bl[175] - delta; 
    br[175] = br[175] + delta; 
} 
bb[175] = bb[175]+20; 
yicon = bb[175]-25; 
xicon2 = nx[175]+-40; 
xicon3 = nx[175]+-10; 
xicon4 = nx[175]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/SSS-Similarity/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/SSS-Similarity/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[175], bt[175], br[175]-bl[175], bb[175]-bt[175], 10*sfac[175]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[175]=paper.setFinish(); 
t[175].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[176]=paper.text(nx[176],ny[176]-10,'Rectangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[176]});
t[176].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Rectangles/#Rectangles", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Rectangles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Rectangles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[176], bt[176], br[176]-bl[176], bb[176]-bt[176], 10*sfac[176]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[176]=paper.setFinish(); 
t[176].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[177]=paper.text(nx[177],ny[177]-10,'Surface Area\nof Cones').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[177]});
t[177].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cones/#Surface Area of Cones", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Cones/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Cones/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[177], bt[177], br[177]-bl[177], bb[177]-bt[177], 10*sfac[177]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[177]=paper.setFinish(); 
t[177].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[178]=paper.text(nx[178],ny[178],'Surface Area').attr({fill:"#666666","font-size": 14*sfac[178]});
tBox=t[178].getBBox(); 
bt[178]=ny[178]-(tBox.height/2+10*sfac[178]);
bb[178]=ny[178]+(tBox.height/2+10*sfac[178]);
bl[178]=nx[178]-(tBox.width/2+10*sfac[178]);
br[178]=nx[178]+(tBox.width/2+10*sfac[178]);
paper.setStart(); 
rect=paper.rect(bl[178], bt[178], br[178]-bl[178], bb[178]-bt[178], 10*sfac[178]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[178]=paper.setFinish(); 

t[179]=paper.text(nx[179],ny[179],'Conditional\nStatements').attr({fill:"#666666","font-size": 14*sfac[179]});
tBox=t[179].getBBox(); 
bt[179]=ny[179]-(tBox.height/2+10*sfac[179]);
bb[179]=ny[179]+(tBox.height/2+10*sfac[179]);
bl[179]=nx[179]-(tBox.width/2+10*sfac[179]);
br[179]=nx[179]+(tBox.width/2+10*sfac[179]);
paper.setStart(); 
rect=paper.rect(bl[179], bt[179], br[179]-bl[179], bb[179]-bt[179], 10*sfac[179]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[179]=paper.setFinish(); 

t[180]=paper.text(nx[180],ny[180]-10,'Inverse Trigonometric\nRatios').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[180]});
t[180].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inverse-Trigonometric-Ratios/#Inverse Trigonometric Ratios", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Inverse-Trigonometric-Ratios/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inverse-Trigonometric-Ratios/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inverse-Trigonometric-Ratios/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[180], bt[180], br[180]-bl[180], bb[180]-bt[180], 10*sfac[180]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[180]=paper.setFinish(); 
t[180].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[181]=paper.text(nx[181],ny[181]-10,'Dilation in the\nCoordinate Plane').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[181]});
t[181].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Dilation-in-the-Coordinate-Plane/#Dilation in the Coordinate Plane", target: "_top",title:"Click to jump to concept"});
}); 
t[181].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[181].getBBox(); 
bt[181]=ny[181]-10-(tBox.height/2+10*sfac[181]);
bb[181]=ny[181]-10+(tBox.height/2+10*sfac[181]);
bl[181]=nx[181]-(tBox.width/2+10*sfac[181]);
br[181]=nx[181]+(tBox.width/2+10*sfac[181]);
var nwidth = br[181]-bl[181]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[181] = bl[181] - delta; 
    br[181] = br[181] + delta; 
} 
bb[181] = bb[181]+20; 
yicon = bb[181]-25; 
xicon2 = nx[181]+-40; 
xicon3 = nx[181]+-10; 
xicon4 = nx[181]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Dilation-in-the-Coordinate-Plane/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Dilation-in-the-Coordinate-Plane/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[181], bt[181], br[181]-bl[181], bb[181]-bt[181], 10*sfac[181]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[181]=paper.setFinish(); 
t[181].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[182]=paper.text(nx[182],ny[182]-10,'Area\nof Parallelograms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[182]});
t[182].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-of-a-Parallelogram/#Area of Parallelograms", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-of-a-Parallelogram/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-of-a-Parallelogram/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[182], bt[182], br[182]-bl[182], bb[182]-bt[182], 10*sfac[182]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[182]=paper.setFinish(); 
t[182].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[183]=paper.text(nx[183],ny[183],'Point of Concurrency\nfor Medians').attr({fill:"#666666","font-size": 14*sfac[183]});
tBox=t[183].getBBox(); 
bt[183]=ny[183]-(tBox.height/2+10*sfac[183]);
bb[183]=ny[183]+(tBox.height/2+10*sfac[183]);
bl[183]=nx[183]-(tBox.width/2+10*sfac[183]);
br[183]=nx[183]+(tBox.width/2+10*sfac[183]);
paper.setStart(); 
rect=paper.rect(bl[183], bt[183], br[183]-bl[183], bb[183]-bt[183], 10*sfac[183]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[183]=paper.setFinish(); 

t[184]=paper.text(nx[184],ny[184]-10,'SAS\nSimilarity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[184]});
t[184].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/SAS-Similarity/#SAS Similarity", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/SAS-Similarity/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/SAS-Similarity/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[184], bt[184], br[184]-bl[184], bb[184]-bt[184], 10*sfac[184]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[184]=paper.setFinish(); 
t[184].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[185]=paper.text(nx[185],ny[185],'Perimeter').attr({fill:"#666666","font-size": 14*sfac[185]});
tBox=t[185].getBBox(); 
bt[185]=ny[185]-(tBox.height/2+10*sfac[185]);
bb[185]=ny[185]+(tBox.height/2+10*sfac[185]);
bl[185]=nx[185]-(tBox.width/2+10*sfac[185]);
br[185]=nx[185]+(tBox.width/2+10*sfac[185]);
paper.setStart(); 
rect=paper.rect(bl[185], bt[185], br[185]-bl[185], bb[185]-bt[185], 10*sfac[185]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[185]=paper.setFinish(); 

t[186]=paper.text(nx[186],ny[186]-10,'Converse, Inverse and\nContrapositive of a Conditional\nStatement').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[186]});
t[186].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Converse-Inverse-and-Contrapositive/#Converse, Inverse and Contrapositive of a Conditional Statement", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Converse-Inverse-and-Contrapositive/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Converse-Inverse-and-Contrapositive/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Converse-Inverse-and-Contrapositive/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[186], bt[186], br[186]-bl[186], bb[186]-bt[186], 10*sfac[186]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[186]=paper.setFinish(); 
t[186].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[187]=paper.text(nx[187],ny[187]-10,'Triangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[187]});
t[187].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Triangles/#Triangles", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Triangles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Triangles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[187], bt[187], br[187]-bl[187], bb[187]-bt[187], 10*sfac[187]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[187]=paper.setFinish(); 
t[187].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[188]=paper.text(nx[188],ny[188]-10,'Congruent Angle Identification').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[188]});
t[188].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Congruent-Angles-and-Angle-Bisectors/#Congruent Angle Identification", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Congruent-Angles-and-Angle-Bisectors/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Congruent-Angles-and-Angle-Bisectors/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Congruent-Angles-and-Angle-Bisectors/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[188], bt[188], br[188]-bl[188], bb[188]-bt[188], 10*sfac[188]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[188]=paper.setFinish(); 
t[188].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[189]=paper.text(nx[189],ny[189],'Angle\nBisectors').attr({fill:"#666666","font-size": 14*sfac[189]});
tBox=t[189].getBBox(); 
bt[189]=ny[189]-(tBox.height/2+10*sfac[189]);
bb[189]=ny[189]+(tBox.height/2+10*sfac[189]);
bl[189]=nx[189]-(tBox.width/2+10*sfac[189]);
br[189]=nx[189]+(tBox.width/2+10*sfac[189]);
paper.setStart(); 
rect=paper.rect(bl[189], bt[189], br[189]-bl[189], bb[189]-bt[189], 10*sfac[189]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[189]=paper.setFinish(); 

t[190]=paper.text(nx[190],ny[190],'Volume').attr({fill:"#666666","font-size": 14*sfac[190]});
tBox=t[190].getBBox(); 
bt[190]=ny[190]-(tBox.height/2+10*sfac[190]);
bb[190]=ny[190]+(tBox.height/2+10*sfac[190]);
bl[190]=nx[190]-(tBox.width/2+10*sfac[190]);
br[190]=nx[190]+(tBox.width/2+10*sfac[190]);
paper.setStart(); 
rect=paper.rect(bl[190], bt[190], br[190]-bl[190], bb[190]-bt[190], 10*sfac[190]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[190]=paper.setFinish(); 

t[191]=paper.text(nx[191],ny[191]-10,'Surface Area\nof Pyramids').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[191]});
t[191].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Pyramids/#Surface Area of Pyramids", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Pyramids/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Pyramids/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[191], bt[191], br[191]-bl[191], bb[191]-bt[191], 10*sfac[191]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[191]=paper.setFinish(); 
t[191].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[192]=paper.text(nx[192],ny[192]-10,'Rotations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[192]});
t[192].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Rotations/#Rotations", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Rotations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Rotations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[192], bt[192], br[192]-bl[192], bb[192]-bt[192], 10*sfac[192]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[192]=paper.setFinish(); 
t[192].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[193]=paper.text(nx[193],ny[193]-10,'HL Triangle\nCongruence').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[193]});
t[193].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/HL-Triangle-Congruence/#HL Triangle Congruence", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/HL-Triangle-Congruence/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/HL-Triangle-Congruence/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/HL-Triangle-Congruence/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[193], bt[193], br[193]-bl[193], bb[193]-bt[193], 10*sfac[193]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[193]=paper.setFinish(); 
t[193].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[194]=paper.text(nx[194],ny[194]-10,'Trigonometry Word Problems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[194]});
t[194].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Trigonometry-Word-Problems/#Trigonometry Word Problems", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Trigonometry-Word-Problems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Trigonometry-Word-Problems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[194], bt[194], br[194]-bl[194], bb[194]-bt[194], 10*sfac[194]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[194]=paper.setFinish(); 
t[194].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[195]=paper.text(nx[195],ny[195]-10,'Slope in the\nCoordinate Plane').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[195]});
t[195].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Slope-in-the-Coordinate-Plane/#Slope in the Coordinate Plane", target: "_top",title:"Click to jump to concept"});
}); 
t[195].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[195].getBBox(); 
bt[195]=ny[195]-10-(tBox.height/2+10*sfac[195]);
bb[195]=ny[195]-10+(tBox.height/2+10*sfac[195]);
bl[195]=nx[195]-(tBox.width/2+10*sfac[195]);
br[195]=nx[195]+(tBox.width/2+10*sfac[195]);
var nwidth = br[195]-bl[195]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[195] = bl[195] - delta; 
    br[195] = br[195] + delta; 
} 
bb[195] = bb[195]+20; 
yicon = bb[195]-25; 
xicon2 = nx[195]+-40; 
xicon3 = nx[195]+-10; 
xicon4 = nx[195]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Slope-in-the-Coordinate-Plane/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Slope-in-the-Coordinate-Plane/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[195], bt[195], br[195]-bl[195], bb[195]-bt[195], 10*sfac[195]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[195]=paper.setFinish(); 
t[195].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[196]=paper.text(nx[196],ny[196],'Properties of\nCongruence').attr({fill:"#666666","font-size": 14*sfac[196]});
tBox=t[196].getBBox(); 
bt[196]=ny[196]-(tBox.height/2+10*sfac[196]);
bb[196]=ny[196]+(tBox.height/2+10*sfac[196]);
bl[196]=nx[196]-(tBox.width/2+10*sfac[196]);
br[196]=nx[196]+(tBox.width/2+10*sfac[196]);
paper.setStart(); 
rect=paper.rect(bl[196], bt[196], br[196]-bl[196], bb[196]-bt[196], 10*sfac[196]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[196]=paper.setFinish(); 

t[197]=paper.text(nx[197],ny[197],'Lines and\nAngles').attr({fill:"#666666","font-size": 14*sfac[197]});
tBox=t[197].getBBox(); 
bt[197]=ny[197]-(tBox.height/2+10*sfac[197]);
bb[197]=ny[197]+(tBox.height/2+10*sfac[197]);
bl[197]=nx[197]-(tBox.width/2+10*sfac[197]);
br[197]=nx[197]+(tBox.width/2+10*sfac[197]);
paper.setStart(); 
rect=paper.rect(bl[197], bt[197], br[197]-bl[197], bb[197]-bt[197], 10*sfac[197]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[197]=paper.setFinish(); 

t[198]=paper.text(nx[198],ny[198],'Parallel Line\nPostulate').attr({fill:"#666666","font-size": 14*sfac[198]});
tBox=t[198].getBBox(); 
bt[198]=ny[198]-(tBox.height/2+10*sfac[198]);
bb[198]=ny[198]+(tBox.height/2+10*sfac[198]);
bl[198]=nx[198]-(tBox.width/2+10*sfac[198]);
br[198]=nx[198]+(tBox.width/2+10*sfac[198]);
paper.setStart(); 
rect=paper.rect(bl[198], bt[198], br[198]-bl[198], bb[198]-bt[198], 10*sfac[198]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[198]=paper.setFinish(); 

t[199]=paper.text(nx[199],ny[199],'Bisectors in\nTriangles').attr({fill:"#666666","font-size": 14*sfac[199]});
tBox=t[199].getBBox(); 
bt[199]=ny[199]-(tBox.height/2+10*sfac[199]);
bb[199]=ny[199]+(tBox.height/2+10*sfac[199]);
bl[199]=nx[199]-(tBox.width/2+10*sfac[199]);
br[199]=nx[199]+(tBox.width/2+10*sfac[199]);
paper.setStart(); 
rect=paper.rect(bl[199], bt[199], br[199]-bl[199], bb[199]-bt[199], 10*sfac[199]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[199]=paper.setFinish(); 

t[200]=paper.text(nx[200],ny[200],'Angle on\na Circle').attr({fill:"#666666","font-size": 14*sfac[200]});
tBox=t[200].getBBox(); 
bt[200]=ny[200]-(tBox.height/2+10*sfac[200]);
bb[200]=ny[200]+(tBox.height/2+10*sfac[200]);
bl[200]=nx[200]-(tBox.width/2+10*sfac[200]);
br[200]=nx[200]+(tBox.width/2+10*sfac[200]);
paper.setStart(); 
rect=paper.rect(bl[200], bt[200], br[200]-bl[200], bb[200]-bt[200], 10*sfac[200]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[200]=paper.setFinish(); 

t[201]=paper.text(nx[201],ny[201],'Biconditional\nStatement').attr({fill:"#666666","font-size": 14*sfac[201]});
tBox=t[201].getBBox(); 
bt[201]=ny[201]-(tBox.height/2+10*sfac[201]);
bb[201]=ny[201]+(tBox.height/2+10*sfac[201]);
bl[201]=nx[201]-(tBox.width/2+10*sfac[201]);
br[201]=nx[201]+(tBox.width/2+10*sfac[201]);
paper.setStart(); 
rect=paper.rect(bl[201], bt[201], br[201]-bl[201], bb[201]-bt[201], 10*sfac[201]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[201]=paper.setFinish(); 

t[202]=paper.text(nx[202],ny[202]-10,'Translations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[202]});
t[202].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Translations/#Translations", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Translations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Translations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[202], bt[202], br[202]-bl[202], bb[202]-bt[202], 10*sfac[202]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[202]=paper.setFinish(); 
t[202].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[203]=paper.text(nx[203],ny[203]-10,'Area of\nSectors').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[203]});
t[203].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-of-Sectors-and-Segments/#Area of Sectors", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Area-of-Sectors-and-Segments/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-of-Sectors-and-Segments/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[203], bt[203], br[203]-bl[203], bb[203]-bt[203], 10*sfac[203]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[203]=paper.setFinish(); 
t[203].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[204]=paper.text(nx[204],ny[204]-10,'Right Triangle\nTrigonometry').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[204]});
t[204].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Pythagorean-Theorem-and-Pythagorean-Triples/#Right Triangle Trigonometry", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Pythagorean-Theorem-and-Pythagorean-Triples/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Pythagorean-Theorem-and-Pythagorean-Triples/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Pythagorean-Theorem-and-Pythagorean-Triples/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[204], bt[204], br[204]-bl[204], bb[204]-bt[204], 10*sfac[204]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[204]=paper.setFinish(); 
t[204].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[205]=paper.text(nx[205],ny[205],'Diagonals of a\nParallelogram').attr({fill:"#666666","font-size": 14*sfac[205]});
tBox=t[205].getBBox(); 
bt[205]=ny[205]-(tBox.height/2+10*sfac[205]);
bb[205]=ny[205]+(tBox.height/2+10*sfac[205]);
bl[205]=nx[205]-(tBox.width/2+10*sfac[205]);
br[205]=nx[205]+(tBox.width/2+10*sfac[205]);
paper.setStart(); 
rect=paper.rect(bl[205], bt[205], br[205]-bl[205], bb[205]-bt[205], 10*sfac[205]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[205]=paper.setFinish(); 

t[206]=paper.text(nx[206],ny[206]-10,'Exploring Similar\nSolids').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[206]});
t[206].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Similar-Solids/#Exploring Similar Solids", target: "_top",title:"Click to jump to concept"});
}); 
t[206].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[206].getBBox(); 
bt[206]=ny[206]-10-(tBox.height/2+10*sfac[206]);
bb[206]=ny[206]-10+(tBox.height/2+10*sfac[206]);
bl[206]=nx[206]-(tBox.width/2+10*sfac[206]);
br[206]=nx[206]+(tBox.width/2+10*sfac[206]);
var nwidth = br[206]-bl[206]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[206] = bl[206] - delta; 
    br[206] = br[206] + delta; 
} 
bb[206] = bb[206]+20; 
yicon = bb[206]-25; 
xicon2 = nx[206]+-40; 
xicon3 = nx[206]+-10; 
xicon4 = nx[206]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Similar-Solids/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[206], bt[206], br[206]-bl[206], bb[206]-bt[206], 10*sfac[206]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[206]=paper.setFinish(); 
t[206].toFront(); 
exicon.toFront(); 

t[207]=paper.text(nx[207],ny[207],'Law of Cosines').attr({fill:"#666666","font-size": 14*sfac[207]});
tBox=t[207].getBBox(); 
bt[207]=ny[207]-(tBox.height/2+10*sfac[207]);
bb[207]=ny[207]+(tBox.height/2+10*sfac[207]);
bl[207]=nx[207]-(tBox.width/2+10*sfac[207]);
br[207]=nx[207]+(tBox.width/2+10*sfac[207]);
paper.setStart(); 
rect=paper.rect(bl[207], bt[207], br[207]-bl[207], bb[207]-bt[207], 10*sfac[207]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[207]=paper.setFinish(); 

t[208]=paper.text(nx[208],ny[208],'The Geometric\nMean').attr({fill:"#666666","font-size": 14*sfac[208]});
tBox=t[208].getBBox(); 
bt[208]=ny[208]-(tBox.height/2+10*sfac[208]);
bb[208]=ny[208]+(tBox.height/2+10*sfac[208]);
bl[208]=nx[208]-(tBox.width/2+10*sfac[208]);
br[208]=nx[208]+(tBox.width/2+10*sfac[208]);
paper.setStart(); 
rect=paper.rect(bl[208], bt[208], br[208]-bl[208], bb[208]-bt[208], 10*sfac[208]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[208]=paper.setFinish(); 

t[209]=paper.text(nx[209],ny[209]-10,'Triangle\nInequality Theorem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[209]});
t[209].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Triangle-Inequality-Theorem/#Triangle Inequality Theorem", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Triangle-Inequality-Theorem/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Triangle-Inequality-Theorem/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Triangle-Inequality-Theorem/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[209], bt[209], br[209]-bl[209], bb[209]-bt[209], 10*sfac[209]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[209]=paper.setFinish(); 
t[209].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[210]=paper.text(nx[210],ny[210],'Equidistant\nCongruent Chords').attr({fill:"#666666","font-size": 14*sfac[210]});
tBox=t[210].getBBox(); 
bt[210]=ny[210]-(tBox.height/2+10*sfac[210]);
bb[210]=ny[210]+(tBox.height/2+10*sfac[210]);
bl[210]=nx[210]-(tBox.width/2+10*sfac[210]);
br[210]=nx[210]+(tBox.width/2+10*sfac[210]);
paper.setStart(); 
rect=paper.rect(bl[210], bt[210], br[210]-bl[210], bb[210]-bt[210], 10*sfac[210]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[210]=paper.setFinish(); 

t[211]=paper.text(nx[211],ny[211],'Definition of Parallelogram').attr({fill:"#666666","font-size": 14*sfac[211]});
tBox=t[211].getBBox(); 
bt[211]=ny[211]-(tBox.height/2+10*sfac[211]);
bb[211]=ny[211]+(tBox.height/2+10*sfac[211]);
bl[211]=nx[211]-(tBox.width/2+10*sfac[211]);
br[211]=nx[211]+(tBox.width/2+10*sfac[211]);
paper.setStart(); 
rect=paper.rect(bl[211], bt[211], br[211]-bl[211], bb[211]-bt[211], 10*sfac[211]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[211]=paper.setFinish(); 

t[212]=paper.text(nx[212],ny[212]-10,'Creating\nCongruence\nStatements').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[212]});
t[212].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Congruence-Statements/#Creating Congruence Statements", target: "_top",title:"Click to jump to concept"});
}); 
t[212].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[212].getBBox(); 
bt[212]=ny[212]-10-(tBox.height/2+10*sfac[212]);
bb[212]=ny[212]-10+(tBox.height/2+10*sfac[212]);
bl[212]=nx[212]-(tBox.width/2+10*sfac[212]);
br[212]=nx[212]+(tBox.width/2+10*sfac[212]);
var nwidth = br[212]-bl[212]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[212] = bl[212] - delta; 
    br[212] = br[212] + delta; 
} 
bb[212] = bb[212]+20; 
yicon = bb[212]-25; 
xicon2 = nx[212]+-40; 
xicon3 = nx[212]+-10; 
xicon4 = nx[212]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Congruence-Statements/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Congruence-Statements/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Congruence-Statements/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[212], bt[212], br[212]-bl[212], bb[212]-bt[212], 10*sfac[212]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[212]=paper.setFinish(); 
t[212].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[213]=paper.text(nx[213],ny[213],'Medians and\nAltitudes in\nTriangles').attr({fill:"#666666","font-size": 14*sfac[213]});
tBox=t[213].getBBox(); 
bt[213]=ny[213]-(tBox.height/2+10*sfac[213]);
bb[213]=ny[213]+(tBox.height/2+10*sfac[213]);
bl[213]=nx[213]-(tBox.width/2+10*sfac[213]);
br[213]=nx[213]+(tBox.width/2+10*sfac[213]);
paper.setStart(); 
rect=paper.rect(bl[213], bt[213], br[213]-bl[213], bb[213]-bt[213], 10*sfac[213]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[213]=paper.setFinish(); 

t[214]=paper.text(nx[214],ny[214]-10,'Similar Polygons').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[214]});
t[214].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Similar-Polygons-and-Scale-Factors/#Similar Polygons", target: "_top",title:"Click to jump to concept"});
}); 
t[214].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[214].getBBox(); 
bt[214]=ny[214]-10-(tBox.height/2+10*sfac[214]);
bb[214]=ny[214]-10+(tBox.height/2+10*sfac[214]);
bl[214]=nx[214]-(tBox.width/2+10*sfac[214]);
br[214]=nx[214]+(tBox.width/2+10*sfac[214]);
var nwidth = br[214]-bl[214]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[214] = bl[214] - delta; 
    br[214] = br[214] + delta; 
} 
bb[214] = bb[214]+20; 
yicon = bb[214]-25; 
xicon2 = nx[214]+-40; 
xicon3 = nx[214]+-10; 
xicon4 = nx[214]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Similar-Polygons-and-Scale-Factors/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Similar-Polygons-and-Scale-Factors/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[214], bt[214], br[214]-bl[214], bb[214]-bt[214], 10*sfac[214]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[214]=paper.setFinish(); 
t[214].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[215]=paper.text(nx[215],ny[215],'Concave\nPolygons').attr({fill:"#666666","font-size": 14*sfac[215]});
tBox=t[215].getBBox(); 
bt[215]=ny[215]-(tBox.height/2+10*sfac[215]);
bb[215]=ny[215]+(tBox.height/2+10*sfac[215]);
bl[215]=nx[215]-(tBox.width/2+10*sfac[215]);
br[215]=nx[215]+(tBox.width/2+10*sfac[215]);
paper.setStart(); 
rect=paper.rect(bl[215], bt[215], br[215]-bl[215], bb[215]-bt[215], 10*sfac[215]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[215]=paper.setFinish(); 

t[216]=paper.text(nx[216],ny[216],'Segments of Chords,\nSecants, and Tangents').attr({fill:"#666666","font-size": 14*sfac[216]});
tBox=t[216].getBBox(); 
bt[216]=ny[216]-(tBox.height/2+10*sfac[216]);
bb[216]=ny[216]+(tBox.height/2+10*sfac[216]);
bl[216]=nx[216]-(tBox.width/2+10*sfac[216]);
br[216]=nx[216]+(tBox.width/2+10*sfac[216]);
paper.setStart(); 
rect=paper.rect(bl[216], bt[216], br[216]-bl[216], bb[216]-bt[216], 10*sfac[216]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[216]=paper.setFinish(); 

t[217]=paper.text(nx[217],ny[217],'Definitions and\nIntroduction to Proof').attr({fill:"#666666","font-size": 14*sfac[217]});
tBox=t[217].getBBox(); 
bt[217]=ny[217]-(tBox.height/2+10*sfac[217]);
bb[217]=ny[217]+(tBox.height/2+10*sfac[217]);
bl[217]=nx[217]-(tBox.width/2+10*sfac[217]);
br[217]=nx[217]+(tBox.width/2+10*sfac[217]);
paper.setStart(); 
rect=paper.rect(bl[217], bt[217], br[217]-bl[217], bb[217]-bt[217], 10*sfac[217]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[217]=paper.setFinish(); 

t[218]=paper.text(nx[218],ny[218],'Right Angle\nTheorem').attr({fill:"#666666","font-size": 14*sfac[218]});
tBox=t[218].getBBox(); 
bt[218]=ny[218]-(tBox.height/2+10*sfac[218]);
bb[218]=ny[218]+(tBox.height/2+10*sfac[218]);
bl[218]=nx[218]-(tBox.width/2+10*sfac[218]);
br[218]=nx[218]+(tBox.width/2+10*sfac[218]);
paper.setStart(); 
rect=paper.rect(bl[218], bt[218], br[218]-bl[218], bb[218]-bt[218], 10*sfac[218]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[218]=paper.setFinish(); 

t[219]=paper.text(nx[219],ny[219]-10,'Perpendicular\nBisectors').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[219]});
t[219].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Perpendicular-Bisectors/#Perpendicular Bisectors", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Perpendicular-Bisectors/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Perpendicular-Bisectors/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Perpendicular-Bisectors/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[219], bt[219], br[219]-bl[219], bb[219]-bt[219], 10*sfac[219]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[219]=paper.setFinish(); 
t[219].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[220]=paper.text(nx[220],ny[220]-10,'Defining Parallel\nand Skew').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[220]});
t[220].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Parallel-and-Skew-Lines/#Defining Parallel and Skew", target: "_top",title:"Click to jump to concept"});
}); 
t[220].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[220].getBBox(); 
bt[220]=ny[220]-10-(tBox.height/2+10*sfac[220]);
bb[220]=ny[220]-10+(tBox.height/2+10*sfac[220]);
bl[220]=nx[220]-(tBox.width/2+10*sfac[220]);
br[220]=nx[220]+(tBox.width/2+10*sfac[220]);
var nwidth = br[220]-bl[220]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[220] = bl[220] - delta; 
    br[220] = br[220] + delta; 
} 
bb[220] = bb[220]+20; 
yicon = bb[220]-25; 
xicon2 = nx[220]+-40; 
xicon3 = nx[220]+-10; 
xicon4 = nx[220]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parallel-and-Skew-Lines/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parallel-and-Skew-Lines/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parallel-and-Skew-Lines/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[220], bt[220], br[220]-bl[220], bb[220]-bt[220], 10*sfac[220]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[220]=paper.setFinish(); 
t[220].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[221]=paper.text(nx[221],ny[221]-10,'Shortest\nDistance Between\nTwo Parallel Lines').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[221]});
t[221].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Distance-Between-Parallel-Lines/#Shortest Distance Between Two Parallel Lines", target: "_top",title:"Click to jump to concept"});
}); 
t[221].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[221].getBBox(); 
bt[221]=ny[221]-10-(tBox.height/2+10*sfac[221]);
bb[221]=ny[221]-10+(tBox.height/2+10*sfac[221]);
bl[221]=nx[221]-(tBox.width/2+10*sfac[221]);
br[221]=nx[221]+(tBox.width/2+10*sfac[221]);
var nwidth = br[221]-bl[221]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[221] = bl[221] - delta; 
    br[221] = br[221] + delta; 
} 
bb[221] = bb[221]+20; 
yicon = bb[221]-25; 
xicon2 = nx[221]+-40; 
xicon3 = nx[221]+-10; 
xicon4 = nx[221]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distance-Between-Parallel-Lines/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distance-Between-Parallel-Lines/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distance-Between-Parallel-Lines/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[221], bt[221], br[221]-bl[221], bb[221]-bt[221], 10*sfac[221]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[221]=paper.setFinish(); 
t[221].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[222]=paper.text(nx[222],ny[222],'Properties of\nParallel Lines').attr({fill:"#666666","font-size": 14*sfac[222]});
tBox=t[222].getBBox(); 
bt[222]=ny[222]-(tBox.height/2+10*sfac[222]);
bb[222]=ny[222]+(tBox.height/2+10*sfac[222]);
bl[222]=nx[222]-(tBox.width/2+10*sfac[222]);
br[222]=nx[222]+(tBox.width/2+10*sfac[222]);
paper.setStart(); 
rect=paper.rect(bl[222], bt[222], br[222]-bl[222], bb[222]-bt[222], 10*sfac[222]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[222]=paper.setFinish(); 

t[223]=paper.text(nx[223],ny[223]-10,'Triangle\nMedians').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[223]});
t[223].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Medians/#Triangle Medians", target: "_top",title:"Click to jump to concept"});
}); 
t[223].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[223].getBBox(); 
bt[223]=ny[223]-10-(tBox.height/2+10*sfac[223]);
bb[223]=ny[223]-10+(tBox.height/2+10*sfac[223]);
bl[223]=nx[223]-(tBox.width/2+10*sfac[223]);
br[223]=nx[223]+(tBox.width/2+10*sfac[223]);
var nwidth = br[223]-bl[223]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[223] = bl[223] - delta; 
    br[223] = br[223] + delta; 
} 
bb[223] = bb[223]+20; 
yicon = bb[223]-25; 
xicon2 = nx[223]+-40; 
xicon3 = nx[223]+-10; 
xicon4 = nx[223]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Medians/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Medians/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Medians/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[223], bt[223], br[223]-bl[223], bb[223]-bt[223], 10*sfac[223]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[223]=paper.setFinish(); 
t[223].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[224]=paper.text(nx[224],ny[224],'Midsegments\nof a Triangle').attr({fill:"#666666","font-size": 14*sfac[224]});
tBox=t[224].getBBox(); 
bt[224]=ny[224]-(tBox.height/2+10*sfac[224]);
bb[224]=ny[224]+(tBox.height/2+10*sfac[224]);
bl[224]=nx[224]-(tBox.width/2+10*sfac[224]);
br[224]=nx[224]+(tBox.width/2+10*sfac[224]);
paper.setStart(); 
rect=paper.rect(bl[224], bt[224], br[224]-bl[224], bb[224]-bt[224], 10*sfac[224]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[224]=paper.setFinish(); 

t[225]=paper.text(nx[225],ny[225],'Visual Pattterns').attr({fill:"#666666","font-size": 14*sfac[225]});
tBox=t[225].getBBox(); 
bt[225]=ny[225]-(tBox.height/2+10*sfac[225]);
bb[225]=ny[225]+(tBox.height/2+10*sfac[225]);
bl[225]=nx[225]-(tBox.width/2+10*sfac[225]);
br[225]=nx[225]+(tBox.width/2+10*sfac[225]);
paper.setStart(); 
rect=paper.rect(bl[225], bt[225], br[225]-bl[225], bb[225]-bt[225], 10*sfac[225]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[225]=paper.setFinish(); 

t[226]=paper.text(nx[226],ny[226],'Reflection\nOver an Axis').attr({fill:"#666666","font-size": 14*sfac[226]});
tBox=t[226].getBBox(); 
bt[226]=ny[226]-(tBox.height/2+10*sfac[226]);
bb[226]=ny[226]+(tBox.height/2+10*sfac[226]);
bl[226]=nx[226]-(tBox.width/2+10*sfac[226]);
br[226]=nx[226]+(tBox.width/2+10*sfac[226]);
paper.setStart(); 
rect=paper.rect(bl[226], bt[226], br[226]-bl[226], bb[226]-bt[226], 10*sfac[226]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[226]=paper.setFinish(); 

t[227]=paper.text(nx[227],ny[227]-10,'Composite Shapes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[227]});
t[227].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-of-Composite-Shapes/#Composite Shapes", target: "_top",title:"Click to jump to concept"});
}); 
t[227].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[227].getBBox(); 
bt[227]=ny[227]-10-(tBox.height/2+10*sfac[227]);
bb[227]=ny[227]-10+(tBox.height/2+10*sfac[227]);
bl[227]=nx[227]-(tBox.width/2+10*sfac[227]);
br[227]=nx[227]+(tBox.width/2+10*sfac[227]);
var nwidth = br[227]-bl[227]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[227] = bl[227] - delta; 
    br[227] = br[227] + delta; 
} 
bb[227] = bb[227]+20; 
yicon = bb[227]-25; 
xicon2 = nx[227]+-40; 
xicon3 = nx[227]+-10; 
xicon4 = nx[227]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-of-Composite-Shapes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-of-Composite-Shapes/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[227], bt[227], br[227]-bl[227], bb[227]-bt[227], 10*sfac[227]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[227]=paper.setFinish(); 
t[227].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[228]=paper.text(nx[228],ny[228]-10,'Inscribed\nAngles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[228]});
t[228].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inscribed-Angles-in-Circles/#Inscribed Angles", target: "_top",title:"Click to jump to concept"});
}); 
t[228].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[228].getBBox(); 
bt[228]=ny[228]-10-(tBox.height/2+10*sfac[228]);
bb[228]=ny[228]-10+(tBox.height/2+10*sfac[228]);
bl[228]=nx[228]-(tBox.width/2+10*sfac[228]);
br[228]=nx[228]+(tBox.width/2+10*sfac[228]);
var nwidth = br[228]-bl[228]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[228] = bl[228] - delta; 
    br[228] = br[228] + delta; 
} 
bb[228] = bb[228]+20; 
yicon = bb[228]-25; 
xicon2 = nx[228]+-40; 
xicon3 = nx[228]+-10; 
xicon4 = nx[228]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inscribed-Angles-in-Circles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inscribed-Angles-in-Circles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[228], bt[228], br[228]-bl[228], bb[228]-bt[228], 10*sfac[228]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[228]=paper.setFinish(); 
t[228].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[229]=paper.text(nx[229],ny[229]-10,'Scale Factor').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[229]});
t[229].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Similar-Polygons/#Scale Factor", target: "_top",title:"Click to jump to concept"});
}); 
t[229].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[229].getBBox(); 
bt[229]=ny[229]-10-(tBox.height/2+10*sfac[229]);
bb[229]=ny[229]-10+(tBox.height/2+10*sfac[229]);
bl[229]=nx[229]-(tBox.width/2+10*sfac[229]);
br[229]=nx[229]+(tBox.width/2+10*sfac[229]);
var nwidth = br[229]-bl[229]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[229] = bl[229] - delta; 
    br[229] = br[229] + delta; 
} 
bb[229] = bb[229]+20; 
yicon = bb[229]-25; 
xicon2 = nx[229]+-40; 
xicon3 = nx[229]+-10; 
xicon4 = nx[229]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Similar-Polygons/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Area-and-Perimeter-of-Similar-Polygons/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[229], bt[229], br[229]-bl[229], bb[229]-bt[229], 10*sfac[229]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[229]=paper.setFinish(); 
t[229].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[230]=paper.text(nx[230],ny[230]-10,'Corresponding\nAngles Postulate').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[230]});
t[230].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Corresponding-Angles/#Corresponding Angles Postulate", target: "_top",title:"Click to jump to concept"});
}); 
t[230].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[230].getBBox(); 
bt[230]=ny[230]-10-(tBox.height/2+10*sfac[230]);
bb[230]=ny[230]-10+(tBox.height/2+10*sfac[230]);
bl[230]=nx[230]-(tBox.width/2+10*sfac[230]);
br[230]=nx[230]+(tBox.width/2+10*sfac[230]);
var nwidth = br[230]-bl[230]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[230] = bl[230] - delta; 
    br[230] = br[230] + delta; 
} 
bb[230] = bb[230]+20; 
yicon = bb[230]-25; 
xicon2 = nx[230]+-40; 
xicon3 = nx[230]+-10; 
xicon4 = nx[230]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Corresponding-Angles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Corresponding-Angles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Corresponding-Angles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[230], bt[230], br[230]-bl[230], bb[230]-bt[230], 10*sfac[230]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[230]=paper.setFinish(); 
t[230].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[231]=paper.text(nx[231],ny[231],'Classifying Polygons\nby\nSides').attr({fill:"#666666","font-size": 14*sfac[231]});
tBox=t[231].getBBox(); 
bt[231]=ny[231]-(tBox.height/2+10*sfac[231]);
bb[231]=ny[231]+(tBox.height/2+10*sfac[231]);
bl[231]=nx[231]-(tBox.width/2+10*sfac[231]);
br[231]=nx[231]+(tBox.width/2+10*sfac[231]);
paper.setStart(); 
rect=paper.rect(bl[231], bt[231], br[231]-bl[231], bb[231]-bt[231], 10*sfac[231]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[231]=paper.setFinish(); 

t[232]=paper.text(nx[232],ny[232],'Using Properties\nof Equality with\nEquations').attr({fill:"#666666","font-size": 14*sfac[232]});
tBox=t[232].getBBox(); 
bt[232]=ny[232]-(tBox.height/2+10*sfac[232]);
bb[232]=ny[232]+(tBox.height/2+10*sfac[232]);
bl[232]=nx[232]-(tBox.width/2+10*sfac[232]);
br[232]=nx[232]+(tBox.width/2+10*sfac[232]);
paper.setStart(); 
rect=paper.rect(bl[232], bt[232], br[232]-bl[232], bb[232]-bt[232], 10*sfac[232]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[232]=paper.setFinish(); 

t[233]=paper.text(nx[233],ny[233],'Surface Area\nof Spheres').attr({fill:"#666666","font-size": 14*sfac[233]});
tBox=t[233].getBBox(); 
bt[233]=ny[233]-(tBox.height/2+10*sfac[233]);
bb[233]=ny[233]+(tBox.height/2+10*sfac[233]);
bl[233]=nx[233]-(tBox.width/2+10*sfac[233]);
br[233]=nx[233]+(tBox.width/2+10*sfac[233]);
paper.setStart(); 
rect=paper.rect(bl[233], bt[233], br[233]-bl[233], bb[233]-bt[233], 10*sfac[233]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[233]=paper.setFinish(); 

t[234]=paper.text(nx[234],ny[234],'Laws of Sines and\nCosines').attr({fill:"#666666","font-size": 14*sfac[234]});
tBox=t[234].getBBox(); 
bt[234]=ny[234]-(tBox.height/2+10*sfac[234]);
bb[234]=ny[234]+(tBox.height/2+10*sfac[234]);
bl[234]=nx[234]-(tBox.width/2+10*sfac[234]);
br[234]=nx[234]+(tBox.width/2+10*sfac[234]);
paper.setStart(); 
rect=paper.rect(bl[234], bt[234], br[234]-bl[234], bb[234]-bt[234], 10*sfac[234]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[234]=paper.setFinish(); 

t[235]=paper.text(nx[235],ny[235],'Types of\nReasoning').attr({fill:"#666666","font-size": 14*sfac[235]});
tBox=t[235].getBBox(); 
bt[235]=ny[235]-(tBox.height/2+10*sfac[235]);
bb[235]=ny[235]+(tBox.height/2+10*sfac[235]);
bl[235]=nx[235]-(tBox.width/2+10*sfac[235]);
br[235]=nx[235]+(tBox.width/2+10*sfac[235]);
paper.setStart(); 
rect=paper.rect(bl[235], bt[235], br[235]-bl[235], bb[235]-bt[235], 10*sfac[235]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[235]=paper.setFinish(); 

t[236]=paper.text(nx[236],ny[236]-10,'Quadrilaterals\nthat are\nParallelograms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[236]});
t[236].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Parallelogram-Classification/#Quadrilaterals that are Parallelograms", target: "_top",title:"Click to jump to concept"});
}); 
t[236].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[236].getBBox(); 
bt[236]=ny[236]-10-(tBox.height/2+10*sfac[236]);
bb[236]=ny[236]-10+(tBox.height/2+10*sfac[236]);
bl[236]=nx[236]-(tBox.width/2+10*sfac[236]);
br[236]=nx[236]+(tBox.width/2+10*sfac[236]);
var nwidth = br[236]-bl[236]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[236] = bl[236] - delta; 
    br[236] = br[236] + delta; 
} 
bb[236] = bb[236]+20; 
yicon = bb[236]-25; 
xicon2 = nx[236]+-40; 
xicon3 = nx[236]+-10; 
xicon4 = nx[236]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parallelogram-Classification/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Parallelogram-Classification/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[236], bt[236], br[236]-bl[236], bb[236]-bt[236], 10*sfac[236]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[236]=paper.setFinish(); 
t[236].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[237]=paper.text(nx[237],ny[237],'Properties of\nEquality').attr({fill:"#666666","font-size": 14*sfac[237]});
tBox=t[237].getBBox(); 
bt[237]=ny[237]-(tBox.height/2+10*sfac[237]);
bb[237]=ny[237]+(tBox.height/2+10*sfac[237]);
bl[237]=nx[237]-(tBox.width/2+10*sfac[237]);
br[237]=nx[237]+(tBox.width/2+10*sfac[237]);
paper.setStart(); 
rect=paper.rect(bl[237], bt[237], br[237]-bl[237], bb[237]-bt[237], 10*sfac[237]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[237]=paper.setFinish(); 

t[238]=paper.text(nx[238],ny[238],'Volume\nof Cones').attr({fill:"#666666","font-size": 14*sfac[238]});
tBox=t[238].getBBox(); 
bt[238]=ny[238]-(tBox.height/2+10*sfac[238]);
bb[238]=ny[238]+(tBox.height/2+10*sfac[238]);
bl[238]=nx[238]-(tBox.width/2+10*sfac[238]);
br[238]=nx[238]+(tBox.width/2+10*sfac[238]);
paper.setStart(); 
rect=paper.rect(bl[238], bt[238], br[238]-bl[238], bb[238]-bt[238], 10*sfac[238]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[238]=paper.setFinish(); 

t[239]=paper.text(nx[239],ny[239]-10,'Basic Definitions:\nPoints, Lines and\nPlanes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[239]});
t[239].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Basic-Geometric-Definitions/#Basic Definitions: Points, Lines and Planes", target: "_top",title:"Click to jump to concept"});
}); 
t[239].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[239].getBBox(); 
bt[239]=ny[239]-10-(tBox.height/2+10*sfac[239]);
bb[239]=ny[239]-10+(tBox.height/2+10*sfac[239]);
bl[239]=nx[239]-(tBox.width/2+10*sfac[239]);
br[239]=nx[239]+(tBox.width/2+10*sfac[239]);
var nwidth = br[239]-bl[239]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[239] = bl[239] - delta; 
    br[239] = br[239] + delta; 
} 
bb[239] = bb[239]+20; 
yicon = bb[239]-25; 
xicon2 = nx[239]+-40; 
xicon3 = nx[239]+-10; 
xicon4 = nx[239]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Basic-Geometric-Definitions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Basic-Geometric-Definitions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Basic-Geometric-Definitions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[239], bt[239], br[239]-bl[239], bb[239]-bt[239], 10*sfac[239]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[239]=paper.setFinish(); 
t[239].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[240]=paper.text(nx[240],ny[240],'Converse of Alternate Exterior\nAngles and Consecutive\nInterior Angles').attr({fill:"#666666","font-size": 14*sfac[240]});
tBox=t[240].getBBox(); 
bt[240]=ny[240]-(tBox.height/2+10*sfac[240]);
bb[240]=ny[240]+(tBox.height/2+10*sfac[240]);
bl[240]=nx[240]-(tBox.width/2+10*sfac[240]);
br[240]=nx[240]+(tBox.width/2+10*sfac[240]);
paper.setStart(); 
rect=paper.rect(bl[240], bt[240], br[240]-bl[240], bb[240]-bt[240], 10*sfac[240]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[240]=paper.setFinish(); 

t[241]=paper.text(nx[241],ny[241],'Area\nof Trapezoids').attr({fill:"#666666","font-size": 14*sfac[241]});
tBox=t[241].getBBox(); 
bt[241]=ny[241]-(tBox.height/2+10*sfac[241]);
bb[241]=ny[241]+(tBox.height/2+10*sfac[241]);
bl[241]=nx[241]-(tBox.width/2+10*sfac[241]);
br[241]=nx[241]+(tBox.width/2+10*sfac[241]);
paper.setStart(); 
rect=paper.rect(bl[241], bt[241], br[241]-bl[241], bb[241]-bt[241], 10*sfac[241]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[241]=paper.setFinish(); 

t[242]=paper.text(nx[242],ny[242],'Trigonometric Ratios').attr({fill:"#666666","font-size": 14*sfac[242]});
tBox=t[242].getBBox(); 
bt[242]=ny[242]-(tBox.height/2+10*sfac[242]);
bb[242]=ny[242]+(tBox.height/2+10*sfac[242]);
bl[242]=nx[242]-(tBox.width/2+10*sfac[242]);
br[242]=nx[242]+(tBox.width/2+10*sfac[242]);
paper.setStart(); 
rect=paper.rect(bl[242], bt[242], br[242]-bl[242], bb[242]-bt[242], 10*sfac[242]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[242]=paper.setFinish(); 

t[243]=paper.text(nx[243],ny[243]-10,'Measuring\nDistances').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[243]});
t[243].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Distance-Between-Two-Points/#Measuring Distances", target: "_top",title:"Click to jump to concept"});
}); 
t[243].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[243].getBBox(); 
bt[243]=ny[243]-10-(tBox.height/2+10*sfac[243]);
bb[243]=ny[243]-10+(tBox.height/2+10*sfac[243]);
bl[243]=nx[243]-(tBox.width/2+10*sfac[243]);
br[243]=nx[243]+(tBox.width/2+10*sfac[243]);
var nwidth = br[243]-bl[243]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[243] = bl[243] - delta; 
    br[243] = br[243] + delta; 
} 
bb[243] = bb[243]+20; 
yicon = bb[243]-25; 
xicon2 = nx[243]+-40; 
xicon3 = nx[243]+-10; 
xicon4 = nx[243]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distance-Between-Two-Points/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distance-Between-Two-Points/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distance-Between-Two-Points/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[243], bt[243], br[243]-bl[243], bb[243]-bt[243], 10*sfac[243]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[243]=paper.setFinish(); 
t[243].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[244]=paper.text(nx[244],ny[244],'Ratios and\nProportions').attr({fill:"#666666","font-size": 14*sfac[244]});
tBox=t[244].getBBox(); 
bt[244]=ny[244]-(tBox.height/2+10*sfac[244]);
bb[244]=ny[244]+(tBox.height/2+10*sfac[244]);
bl[244]=nx[244]-(tBox.width/2+10*sfac[244]);
br[244]=nx[244]+(tBox.width/2+10*sfac[244]);
paper.setStart(); 
rect=paper.rect(bl[244], bt[244], br[244]-bl[244], bb[244]-bt[244], 10*sfac[244]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[244]=paper.setFinish(); 

t[245]=paper.text(nx[245],ny[245],'Translations and\nVectors').attr({fill:"#666666","font-size": 14*sfac[245]});
tBox=t[245].getBBox(); 
bt[245]=ny[245]-(tBox.height/2+10*sfac[245]);
bb[245]=ny[245]+(tBox.height/2+10*sfac[245]);
bl[245]=nx[245]-(tBox.width/2+10*sfac[245]);
br[245]=nx[245]+(tBox.width/2+10*sfac[245]);
paper.setStart(); 
rect=paper.rect(bl[245], bt[245], br[245]-bl[245], bb[245]-bt[245], 10*sfac[245]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[245]=paper.setFinish(); 

t[246]=paper.text(nx[246],ny[246],'Angles and\nTransversals').attr({fill:"#666666","font-size": 14*sfac[246]});
tBox=t[246].getBBox(); 
bt[246]=ny[246]-(tBox.height/2+10*sfac[246]);
bb[246]=ny[246]+(tBox.height/2+10*sfac[246]);
bl[246]=nx[246]-(tBox.width/2+10*sfac[246]);
br[246]=nx[246]+(tBox.width/2+10*sfac[246]);
paper.setStart(); 
rect=paper.rect(bl[246], bt[246], br[246]-bl[246], bb[246]-bt[246], 10*sfac[246]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[246]=paper.setFinish(); 

t[247]=paper.text(nx[247],ny[247],'Alternate Interior\nAngles Converse').attr({fill:"#666666","font-size": 14*sfac[247]});
tBox=t[247].getBBox(); 
bt[247]=ny[247]-(tBox.height/2+10*sfac[247]);
bb[247]=ny[247]+(tBox.height/2+10*sfac[247]);
bl[247]=nx[247]-(tBox.width/2+10*sfac[247]);
br[247]=nx[247]+(tBox.width/2+10*sfac[247]);
paper.setStart(); 
rect=paper.rect(bl[247], bt[247], br[247]-bl[247], bb[247]-bt[247], 10*sfac[247]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[247]=paper.setFinish(); 

t[248]=paper.text(nx[248],ny[248],'Similarity\nTransformations').attr({fill:"#666666","font-size": 14*sfac[248]});
tBox=t[248].getBBox(); 
bt[248]=ny[248]-(tBox.height/2+10*sfac[248]);
bb[248]=ny[248]+(tBox.height/2+10*sfac[248]);
bl[248]=nx[248]-(tBox.width/2+10*sfac[248]);
br[248]=nx[248]+(tBox.width/2+10*sfac[248]);
paper.setStart(); 
rect=paper.rect(bl[248], bt[248], br[248]-bl[248], bb[248]-bt[248], 10*sfac[248]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[248]=paper.setFinish(); 

t[249]=paper.text(nx[249],ny[249],'Reflections Over\nParallel Lines').attr({fill:"#666666","font-size": 14*sfac[249]});
tBox=t[249].getBBox(); 
bt[249]=ny[249]-(tBox.height/2+10*sfac[249]);
bb[249]=ny[249]+(tBox.height/2+10*sfac[249]);
bl[249]=nx[249]-(tBox.width/2+10*sfac[249]);
br[249]=nx[249]+(tBox.width/2+10*sfac[249]);
paper.setStart(); 
rect=paper.rect(bl[249], bt[249], br[249]-bl[249], bb[249]-bt[249], 10*sfac[249]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[249]=paper.setFinish(); 

t[250]=paper.text(nx[250],ny[250],'Fractals').attr({fill:"#666666","font-size": 14*sfac[250]});
tBox=t[250].getBBox(); 
bt[250]=ny[250]-(tBox.height/2+10*sfac[250]);
bb[250]=ny[250]+(tBox.height/2+10*sfac[250]);
bl[250]=nx[250]-(tBox.width/2+10*sfac[250]);
br[250]=nx[250]+(tBox.width/2+10*sfac[250]);
paper.setStart(); 
rect=paper.rect(bl[250], bt[250], br[250]-bl[250], bb[250]-bt[250], 10*sfac[250]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[250]=paper.setFinish(); 

t[251]=paper.text(nx[251],ny[251]-10,'Use of Inductive Reasoning').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[251]});
t[251].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inductive-Reasoning/#Use of Inductive Reasoning", target: "_top",title:"Click to jump to concept"});
}); 
t[251].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[251].getBBox(); 
bt[251]=ny[251]-10-(tBox.height/2+10*sfac[251]);
bb[251]=ny[251]-10+(tBox.height/2+10*sfac[251]);
bl[251]=nx[251]-(tBox.width/2+10*sfac[251]);
br[251]=nx[251]+(tBox.width/2+10*sfac[251]);
var nwidth = br[251]-bl[251]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[251] = bl[251] - delta; 
    br[251] = br[251] + delta; 
} 
bb[251] = bb[251]+20; 
yicon = bb[251]-25; 
xicon2 = nx[251]+-40; 
xicon3 = nx[251]+-10; 
xicon4 = nx[251]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inductive-Reasoning/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inductive-Reasoning/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Inductive-Reasoning/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[251], bt[251], br[251]-bl[251], bb[251]-bt[251], 10*sfac[251]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[251]=paper.setFinish(); 
t[251].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[252]=paper.text(nx[252],ny[252],'The Cantor\nSet').attr({fill:"#666666","font-size": 14*sfac[252]});
tBox=t[252].getBBox(); 
bt[252]=ny[252]-(tBox.height/2+10*sfac[252]);
bb[252]=ny[252]+(tBox.height/2+10*sfac[252]);
bl[252]=nx[252]-(tBox.width/2+10*sfac[252]);
br[252]=nx[252]+(tBox.width/2+10*sfac[252]);
paper.setStart(); 
rect=paper.rect(bl[252], bt[252], br[252]-bl[252], bb[252]-bt[252], 10*sfac[252]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[252]=paper.setFinish(); 

t[253]=paper.text(nx[253],ny[253]-10,'Rotational\nSymmetry').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[253]});
t[253].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Rotation-Symmetry/#Rotational Symmetry", target: "_top",title:"Click to jump to concept"});
}); 
t[253].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[253].getBBox(); 
bt[253]=ny[253]-10-(tBox.height/2+10*sfac[253]);
bb[253]=ny[253]-10+(tBox.height/2+10*sfac[253]);
bl[253]=nx[253]-(tBox.width/2+10*sfac[253]);
br[253]=nx[253]+(tBox.width/2+10*sfac[253]);
var nwidth = br[253]-bl[253]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[253] = bl[253] - delta; 
    br[253] = br[253] + delta; 
} 
bb[253] = bb[253]+20; 
yicon = bb[253]-25; 
xicon2 = nx[253]+-40; 
xicon3 = nx[253]+-10; 
xicon4 = nx[253]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Rotation-Symmetry/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Rotation-Symmetry/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[253], bt[253], br[253]-bl[253], bb[253]-bt[253], 10*sfac[253]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[253]=paper.setFinish(); 
t[253].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[254]=paper.text(nx[254],ny[254]-10,'Comparing Sides and Angles in Triangles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[254]});
t[254].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Comparing-Angles-and-Sides-in-Triangles/#Comparing Sides and Angles in Triangles", target: "_top",title:"Click to jump to concept"});
}); 
t[254].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[254].getBBox(); 
bt[254]=ny[254]-10-(tBox.height/2+10*sfac[254]);
bb[254]=ny[254]-10+(tBox.height/2+10*sfac[254]);
bl[254]=nx[254]-(tBox.width/2+10*sfac[254]);
br[254]=nx[254]+(tBox.width/2+10*sfac[254]);
var nwidth = br[254]-bl[254]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[254] = bl[254] - delta; 
    br[254] = br[254] + delta; 
} 
bb[254] = bb[254]+20; 
yicon = bb[254]-25; 
xicon2 = nx[254]+-40; 
xicon3 = nx[254]+-10; 
xicon4 = nx[254]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Comparing-Angles-and-Sides-in-Triangles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Comparing-Angles-and-Sides-in-Triangles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Comparing-Angles-and-Sides-in-Triangles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[254], bt[254], br[254]-bl[254], bb[254]-bt[254], 10*sfac[254]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[254]=paper.setFinish(); 
t[254].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[255]=paper.text(nx[255],ny[255],'Segments of\na Circle').attr({fill:"#666666","font-size": 14*sfac[255]});
tBox=t[255].getBBox(); 
bt[255]=ny[255]-(tBox.height/2+10*sfac[255]);
bb[255]=ny[255]+(tBox.height/2+10*sfac[255]);
bl[255]=nx[255]-(tBox.width/2+10*sfac[255]);
br[255]=nx[255]+(tBox.width/2+10*sfac[255]);
paper.setStart(); 
rect=paper.rect(bl[255], bt[255], br[255]-bl[255], bb[255]-bt[255], 10*sfac[255]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[255]=paper.setFinish(); 

t[256]=paper.text(nx[256],ny[256],'Proofs and Use of\nthe Pythagorean Theorem').attr({fill:"#666666","font-size": 14*sfac[256]});
tBox=t[256].getBBox(); 
bt[256]=ny[256]-(tBox.height/2+10*sfac[256]);
bb[256]=ny[256]+(tBox.height/2+10*sfac[256]);
bl[256]=nx[256]-(tBox.width/2+10*sfac[256]);
br[256]=nx[256]+(tBox.width/2+10*sfac[256]);
paper.setStart(); 
rect=paper.rect(bl[256], bt[256], br[256]-bl[256], bb[256]-bt[256], 10*sfac[256]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[256]=paper.setFinish(); 

t[257]=paper.text(nx[257],ny[257]-10,'Exterior Angles\nTheorem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[257]});
t[257].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exterior-Angles-Theorems/#Exterior Angles Theorem", target: "_top",title:"Click to jump to concept"});
}); 
t[257].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[257].getBBox(); 
bt[257]=ny[257]-10-(tBox.height/2+10*sfac[257]);
bb[257]=ny[257]-10+(tBox.height/2+10*sfac[257]);
bl[257]=nx[257]-(tBox.width/2+10*sfac[257]);
br[257]=nx[257]+(tBox.width/2+10*sfac[257]);
var nwidth = br[257]-bl[257]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[257] = bl[257] - delta; 
    br[257] = br[257] + delta; 
} 
bb[257] = bb[257]+20; 
yicon = bb[257]-25; 
xicon2 = nx[257]+-40; 
xicon3 = nx[257]+-10; 
xicon4 = nx[257]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exterior-Angles-Theorems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exterior-Angles-Theorems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exterior-Angles-Theorems/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[257], bt[257], br[257]-bl[257], bb[257]-bt[257], 10*sfac[257]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[257]=paper.setFinish(); 
t[257].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[258]=paper.text(nx[258],ny[258],'Indirect Proof\nin Geometry').attr({fill:"#666666","font-size": 14*sfac[258]});
tBox=t[258].getBBox(); 
bt[258]=ny[258]-(tBox.height/2+10*sfac[258]);
bb[258]=ny[258]+(tBox.height/2+10*sfac[258]);
bl[258]=nx[258]-(tBox.width/2+10*sfac[258]);
br[258]=nx[258]+(tBox.width/2+10*sfac[258]);
paper.setStart(); 
rect=paper.rect(bl[258], bt[258], br[258]-bl[258], bb[258]-bt[258], 10*sfac[258]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[258]=paper.setFinish(); 

t[259]=paper.text(nx[259],ny[259],'Perpendicular\nBisectors in the\nCoordinate Plane').attr({fill:"#666666","font-size": 14*sfac[259]});
tBox=t[259].getBBox(); 
bt[259]=ny[259]-(tBox.height/2+10*sfac[259]);
bb[259]=ny[259]+(tBox.height/2+10*sfac[259]);
bl[259]=nx[259]-(tBox.width/2+10*sfac[259]);
br[259]=nx[259]+(tBox.width/2+10*sfac[259]);
paper.setStart(); 
rect=paper.rect(bl[259], bt[259], br[259]-bl[259], bb[259]-bt[259], 10*sfac[259]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[259]=paper.setFinish(); 

t[260]=paper.text(nx[260],ny[260]-10,'Exterior Angles\nin Convex Polygons').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[260]});
t[260].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exterior-Angles-in-Convex-Polygons/#Exterior Angles in Convex Polygons", target: "_top",title:"Click to jump to concept"});
}); 
t[260].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[260].getBBox(); 
bt[260]=ny[260]-10-(tBox.height/2+10*sfac[260]);
bb[260]=ny[260]-10+(tBox.height/2+10*sfac[260]);
bl[260]=nx[260]-(tBox.width/2+10*sfac[260]);
br[260]=nx[260]+(tBox.width/2+10*sfac[260]);
var nwidth = br[260]-bl[260]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[260] = bl[260] - delta; 
    br[260] = br[260] + delta; 
} 
bb[260] = bb[260]+20; 
yicon = bb[260]-25; 
xicon2 = nx[260]+-40; 
xicon3 = nx[260]+-10; 
xicon4 = nx[260]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exterior-Angles-in-Convex-Polygons/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exterior-Angles-in-Convex-Polygons/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exterior-Angles-in-Convex-Polygons/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[260], bt[260], br[260]-bl[260], bb[260]-bt[260], 10*sfac[260]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[260]=paper.setFinish(); 
t[260].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[261]=paper.text(nx[261],ny[261]-10,'Alternate Exterior\nAngles Theorem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[261]});
t[261].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Alternate-Exterior-Angles/#Alternate Exterior Angles Theorem", target: "_top",title:"Click to jump to concept"});
}); 
t[261].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[261].getBBox(); 
bt[261]=ny[261]-10-(tBox.height/2+10*sfac[261]);
bb[261]=ny[261]-10+(tBox.height/2+10*sfac[261]);
bl[261]=nx[261]-(tBox.width/2+10*sfac[261]);
br[261]=nx[261]+(tBox.width/2+10*sfac[261]);
var nwidth = br[261]-bl[261]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[261] = bl[261] - delta; 
    br[261] = br[261] + delta; 
} 
bb[261] = bb[261]+20; 
yicon = bb[261]-25; 
xicon2 = nx[261]+-40; 
xicon3 = nx[261]+-10; 
xicon4 = nx[261]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Alternate-Exterior-Angles/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Alternate-Exterior-Angles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Alternate-Exterior-Angles/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[261], bt[261], br[261]-bl[261], bb[261]-bt[261], 10*sfac[261]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[261]=paper.setFinish(); 
t[261].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[262]=paper.text(nx[262],ny[262],'Area of an\nIsosceles Triangle').attr({fill:"#666666","font-size": 14*sfac[262]});
tBox=t[262].getBBox(); 
bt[262]=ny[262]-(tBox.height/2+10*sfac[262]);
bb[262]=ny[262]+(tBox.height/2+10*sfac[262]);
bl[262]=nx[262]-(tBox.width/2+10*sfac[262]);
br[262]=nx[262]+(tBox.width/2+10*sfac[262]);
paper.setStart(); 
rect=paper.rect(bl[262], bt[262], br[262]-bl[262], bb[262]-bt[262], 10*sfac[262]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[262]=paper.setFinish(); 

t[263]=paper.text(nx[263],ny[263]-10,'Tessellations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[263]});
t[263].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Tessellations/#Tessellations", target: "_top",title:"Click to jump to concept"});
}); 
t[263].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[263].getBBox(); 
bt[263]=ny[263]-10-(tBox.height/2+10*sfac[263]);
bb[263]=ny[263]-10+(tBox.height/2+10*sfac[263]);
bl[263]=nx[263]-(tBox.width/2+10*sfac[263]);
br[263]=nx[263]+(tBox.width/2+10*sfac[263]);
var nwidth = br[263]-bl[263]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[263] = bl[263] - delta; 
    br[263] = br[263] + delta; 
} 
bb[263] = bb[263]+20; 
yicon = bb[263]-25; 
xicon2 = nx[263]+-40; 
xicon3 = nx[263]+-10; 
xicon4 = nx[263]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tessellations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tessellations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[263], bt[263], br[263]-bl[263], bb[263]-bt[263], 10*sfac[263]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[263]=paper.setFinish(); 
t[263].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[264]=paper.text(nx[264],ny[264],'Same Angles\nSupplements\nTheorem').attr({fill:"#666666","font-size": 14*sfac[264]});
tBox=t[264].getBBox(); 
bt[264]=ny[264]-(tBox.height/2+10*sfac[264]);
bb[264]=ny[264]+(tBox.height/2+10*sfac[264]);
bl[264]=nx[264]-(tBox.width/2+10*sfac[264]);
br[264]=nx[264]+(tBox.width/2+10*sfac[264]);
paper.setStart(); 
rect=paper.rect(bl[264], bt[264], br[264]-bl[264], bb[264]-bt[264], 10*sfac[264]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[264]=paper.setFinish(); 

t[265]=paper.text(nx[265],ny[265]-10,'ASA and AAS\nTriangle Congruence').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[265]});
t[265].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/ASA-and-AAS-Triangle-Congruence/#ASA and AAS Triangle Congruence", target: "_top",title:"Click to jump to concept"});
}); 
t[265].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[265].getBBox(); 
bt[265]=ny[265]-10-(tBox.height/2+10*sfac[265]);
bb[265]=ny[265]-10+(tBox.height/2+10*sfac[265]);
bl[265]=nx[265]-(tBox.width/2+10*sfac[265]);
br[265]=nx[265]+(tBox.width/2+10*sfac[265]);
var nwidth = br[265]-bl[265]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[265] = bl[265] - delta; 
    br[265] = br[265] + delta; 
} 
bb[265] = bb[265]+20; 
yicon = bb[265]-25; 
xicon2 = nx[265]+-40; 
xicon3 = nx[265]+-10; 
xicon4 = nx[265]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/ASA-and-AAS-Triangle-Congruence/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/ASA-and-AAS-Triangle-Congruence/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/ASA-and-AAS-Triangle-Congruence/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[265], bt[265], br[265]-bl[265], bb[265]-bt[265], 10*sfac[265]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[265]=paper.setFinish(); 
t[265].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[266]=paper.text(nx[266],ny[266]-10,'Circumference and\nArc Length').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[266]});
t[266].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Arc-Length/#Circumference and Arc Length", target: "_top",title:"Click to jump to concept"});
}); 
t[266].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[266].getBBox(); 
bt[266]=ny[266]-10-(tBox.height/2+10*sfac[266]);
bb[266]=ny[266]-10+(tBox.height/2+10*sfac[266]);
bl[266]=nx[266]-(tBox.width/2+10*sfac[266]);
br[266]=nx[266]+(tBox.width/2+10*sfac[266]);
var nwidth = br[266]-bl[266]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[266] = bl[266] - delta; 
    br[266] = br[266] + delta; 
} 
bb[266] = bb[266]+20; 
yicon = bb[266]-25; 
xicon2 = nx[266]+-40; 
xicon3 = nx[266]+-10; 
xicon4 = nx[266]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Arc-Length/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Arc-Length/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[266], bt[266], br[266]-bl[266], bb[266]-bt[266], 10*sfac[266]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[266]=paper.setFinish(); 
t[266].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[267]=paper.text(nx[267],ny[267]-10,'Interior Angles\nin Convex Polygons').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[267]});
t[267].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Interior-Angles-in-Convex-Polygons/#Interior Angles in Convex Polygons", target: "_top",title:"Click to jump to concept"});
}); 
t[267].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[267].getBBox(); 
bt[267]=ny[267]-10-(tBox.height/2+10*sfac[267]);
bb[267]=ny[267]-10+(tBox.height/2+10*sfac[267]);
bl[267]=nx[267]-(tBox.width/2+10*sfac[267]);
br[267]=nx[267]+(tBox.width/2+10*sfac[267]);
var nwidth = br[267]-bl[267]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[267] = bl[267] - delta; 
    br[267] = br[267] + delta; 
} 
bb[267] = bb[267]+20; 
yicon = bb[267]-25; 
xicon2 = nx[267]+-40; 
xicon3 = nx[267]+-10; 
xicon4 = nx[267]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Interior-Angles-in-Convex-Polygons/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Interior-Angles-in-Convex-Polygons/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Interior-Angles-in-Convex-Polygons/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[267], bt[267], br[267]-bl[267], bb[267]-bt[267], 10*sfac[267]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[267]=paper.setFinish(); 
t[267].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[268]=paper.text(nx[268],ny[268],'Classifying Polygons\nby\nAngles').attr({fill:"#666666","font-size": 14*sfac[268]});
tBox=t[268].getBBox(); 
bt[268]=ny[268]-(tBox.height/2+10*sfac[268]);
bb[268]=ny[268]+(tBox.height/2+10*sfac[268]);
bl[268]=nx[268]-(tBox.width/2+10*sfac[268]);
br[268]=nx[268]+(tBox.width/2+10*sfac[268]);
paper.setStart(); 
rect=paper.rect(bl[268], bt[268], br[268]-bl[268], bb[268]-bt[268], 10*sfac[268]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[268]=paper.setFinish(); 

bb[269]= ny[269]; 
bt[269]= ny[269]; 
bl[269]= nx[269]; 
br[269]= nx[269]; 

bb[270]= ny[270]; 
bt[270]= ny[270]; 
bl[270]= nx[270]; 
br[270]= nx[270]; 

bb[271]= ny[271]; 
bt[271]= ny[271]; 
bl[271]= nx[271]; 
br[271]= nx[271]; 

bb[272]= ny[272]; 
bt[272]= ny[272]; 
bl[272]= nx[272]; 
br[272]= nx[272]; 

bb[273]= ny[273]; 
bt[273]= ny[273]; 
bl[273]= nx[273]; 
br[273]= nx[273]; 

bb[274]= ny[274]; 
bt[274]= ny[274]; 
bl[274]= nx[274]; 
br[274]= nx[274]; 

bb[275]= ny[275]; 
bt[275]= ny[275]; 
bl[275]= nx[275]; 
br[275]= nx[275]; 

bb[276]= ny[276]; 
bt[276]= ny[276]; 
bl[276]= nx[276]; 
br[276]= nx[276]; 

bb[277]= ny[277]; 
bt[277]= ny[277]; 
bl[277]= nx[277]; 
br[277]= nx[277]; 

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
b[228].click(function() {recenter(228);}); 
b[229].click(function() {recenter(229);}); 
b[230].click(function() {recenter(230);}); 
b[231].click(function() {recenter(231);}); 
b[232].click(function() {recenter(232);}); 
b[233].click(function() {recenter(233);}); 
b[234].click(function() {recenter(234);}); 
b[235].click(function() {recenter(235);}); 
b[236].click(function() {recenter(236);}); 
b[237].click(function() {recenter(237);}); 
b[238].click(function() {recenter(238);}); 
b[239].click(function() {recenter(239);}); 
b[240].click(function() {recenter(240);}); 
b[241].click(function() {recenter(241);}); 
b[242].click(function() {recenter(242);}); 
b[243].click(function() {recenter(243);}); 
b[244].click(function() {recenter(244);}); 
b[245].click(function() {recenter(245);}); 
b[246].click(function() {recenter(246);}); 
b[247].click(function() {recenter(247);}); 
b[248].click(function() {recenter(248);}); 
b[249].click(function() {recenter(249);}); 
b[250].click(function() {recenter(250);}); 
b[251].click(function() {recenter(251);}); 
b[252].click(function() {recenter(252);}); 
b[253].click(function() {recenter(253);}); 
b[254].click(function() {recenter(254);}); 
b[255].click(function() {recenter(255);}); 
b[256].click(function() {recenter(256);}); 
b[257].click(function() {recenter(257);}); 
b[258].click(function() {recenter(258);}); 
b[259].click(function() {recenter(259);}); 
b[260].click(function() {recenter(260);}); 
b[261].click(function() {recenter(261);}); 
b[262].click(function() {recenter(262);}); 
b[263].click(function() {recenter(263);}); 
b[264].click(function() {recenter(264);}); 
b[265].click(function() {recenter(265);}); 
b[266].click(function() {recenter(266);}); 
b[267].click(function() {recenter(267);}); 
b[268].click(function() {recenter(268);}); 
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
b[228].hover(function() {nodeHover(228);}, function() {nodeUnhover(228);}); 
b[229].hover(function() {nodeHover(229);}, function() {nodeUnhover(229);}); 
b[230].hover(function() {nodeHover(230);}, function() {nodeUnhover(230);}); 
b[231].hover(function() {nodeHover(231);}, function() {nodeUnhover(231);}); 
b[232].hover(function() {nodeHover(232);}, function() {nodeUnhover(232);}); 
b[233].hover(function() {nodeHover(233);}, function() {nodeUnhover(233);}); 
b[234].hover(function() {nodeHover(234);}, function() {nodeUnhover(234);}); 
b[235].hover(function() {nodeHover(235);}, function() {nodeUnhover(235);}); 
b[236].hover(function() {nodeHover(236);}, function() {nodeUnhover(236);}); 
b[237].hover(function() {nodeHover(237);}, function() {nodeUnhover(237);}); 
b[238].hover(function() {nodeHover(238);}, function() {nodeUnhover(238);}); 
b[239].hover(function() {nodeHover(239);}, function() {nodeUnhover(239);}); 
b[240].hover(function() {nodeHover(240);}, function() {nodeUnhover(240);}); 
b[241].hover(function() {nodeHover(241);}, function() {nodeUnhover(241);}); 
b[242].hover(function() {nodeHover(242);}, function() {nodeUnhover(242);}); 
b[243].hover(function() {nodeHover(243);}, function() {nodeUnhover(243);}); 
b[244].hover(function() {nodeHover(244);}, function() {nodeUnhover(244);}); 
b[245].hover(function() {nodeHover(245);}, function() {nodeUnhover(245);}); 
b[246].hover(function() {nodeHover(246);}, function() {nodeUnhover(246);}); 
b[247].hover(function() {nodeHover(247);}, function() {nodeUnhover(247);}); 
b[248].hover(function() {nodeHover(248);}, function() {nodeUnhover(248);}); 
b[249].hover(function() {nodeHover(249);}, function() {nodeUnhover(249);}); 
b[250].hover(function() {nodeHover(250);}, function() {nodeUnhover(250);}); 
b[251].hover(function() {nodeHover(251);}, function() {nodeUnhover(251);}); 
b[252].hover(function() {nodeHover(252);}, function() {nodeUnhover(252);}); 
b[253].hover(function() {nodeHover(253);}, function() {nodeUnhover(253);}); 
b[254].hover(function() {nodeHover(254);}, function() {nodeUnhover(254);}); 
b[255].hover(function() {nodeHover(255);}, function() {nodeUnhover(255);}); 
b[256].hover(function() {nodeHover(256);}, function() {nodeUnhover(256);}); 
b[257].hover(function() {nodeHover(257);}, function() {nodeUnhover(257);}); 
b[258].hover(function() {nodeHover(258);}, function() {nodeUnhover(258);}); 
b[259].hover(function() {nodeHover(259);}, function() {nodeUnhover(259);}); 
b[260].hover(function() {nodeHover(260);}, function() {nodeUnhover(260);}); 
b[261].hover(function() {nodeHover(261);}, function() {nodeUnhover(261);}); 
b[262].hover(function() {nodeHover(262);}, function() {nodeUnhover(262);}); 
b[263].hover(function() {nodeHover(263);}, function() {nodeUnhover(263);}); 
b[264].hover(function() {nodeHover(264);}, function() {nodeUnhover(264);}); 
b[265].hover(function() {nodeHover(265);}, function() {nodeUnhover(265);}); 
b[266].hover(function() {nodeHover(266);}, function() {nodeUnhover(266);}); 
b[267].hover(function() {nodeHover(267);}, function() {nodeUnhover(267);}); 
b[268].hover(function() {nodeHover(268);}, function() {nodeUnhover(268);}); 
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
mid=bb[0]+(bt[214]-bb[0])/2; 
s2='M '+nx[0]+' '+bb[0]+' L '+nx[0]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[37]+' '+mid+' L '+nx[37]+' '+bt[37];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[0,37]; 

paper.setStart(); 
mid=bb[0]+(bt[214]-bb[0])/2; 
s3='M '+nx[248]+' '+mid+' L '+nx[248]+' '+bt[248];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[0,248]; 

paper.setStart(); 
mid=bb[0]+(bt[214]-bb[0])/2; 
hleft = nx[244]; 
hright = nx[0]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[244]+' '+mid+' L '+nx[244]+' '+bt[244];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[0,244]; 

paper.setStart(); 
mid=bb[0]+(bt[214]-bb[0])/2; 
hleft = nx[137]; 
hright = nx[0]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[137]+' '+mid+' L '+nx[137]+' '+bt[137];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[0,137]; 

paper.setStart(); 
mid=bb[0]+(bt[214]-bb[0])/2; 
s3='M '+nx[214]+' '+mid+' L '+nx[214]+' '+bt[214];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[0,214]; 

paper.setStart(); 
mid=bb[0]+(bt[214]-bb[0])/2; 
s3='M '+nx[81]+' '+mid+' L '+nx[81]+' '+bt[81];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[0,81]; 

paper.setStart(); 
s1='M '+nx[2]+' '+bb[2]+' L '+nx[2]+' '+ny[275]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[2,275]; 

paper.setStart(); 
s1='M '+nx[5]+' '+bb[5]+' L '+nx[5]+' '+bt[210]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[5,210] ; 

paper.setStart(); 
s1='M '+nx[6]+' '+bb[6]+' L '+nx[6]+' '+bt[182]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[6,182] ; 

paper.setStart(); 
mid=bb[10]+(bt[29]-bb[10])/2; 
hleft = nx[253]; 
hright = nx[10]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[10]+' '+bb[10]+' L '+nx[10]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[253]+' '+mid+' L '+nx[253]+' '+bt[253];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[10,253]; 

paper.setStart(); 
mid=bb[10]+(bt[29]-bb[10])/2; 
hleft = nx[29]; 
hright = nx[10]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[29]+' '+mid+' L '+nx[29]+' '+bt[29];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[10,29]; 

paper.setStart(); 
mid=bb[15]+(bt[180]-bb[15])/2; 
hleft = nx[105]; 
hright = nx[15]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[15]+' '+bb[15]+' L '+nx[15]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[105]+' '+mid+' L '+nx[105]+' '+bt[105];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[15,105]; 

paper.setStart(); 
mid=bb[15]+(bt[180]-bb[15])/2; 
hleft = nx[234]; 
hright = nx[15]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[234]+' '+mid+' L '+nx[234]+' '+bt[234];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[15,234]; 

paper.setStart(); 
mid=bb[15]+(bt[180]-bb[15])/2; 
s3='M '+nx[180]+' '+mid+' L '+nx[180]+' '+bt[180];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[15,180]; 

paper.setStart(); 
s1='M '+nx[16]+' '+bb[16]+' L '+nx[16]+' '+ny[276]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[16,276]; 

paper.setStart(); 
s1='M '+nx[17]+' '+bb[17]+' L '+nx[17]+' '+bt[144]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[17,144] ; 

paper.setStart(); 
mid=bb[22]+(bt[258]-bb[22])/2; 
hleft = nx[113]; 
hright = nx[22]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[22]+' '+bb[22]+' L '+nx[22]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[113]+' '+mid+' L '+nx[113]+' '+bt[113];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[22,113]; 

paper.setStart(); 
mid=bb[22]+(bt[258]-bb[22])/2; 
hleft = nx[258]; 
hright = nx[22]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[258]+' '+mid+' L '+nx[258]+' '+bt[258];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[22,258]; 

paper.setStart(); 
s1='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+bt[251]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[23,251] ; 

paper.setStart(); 
s1='M '+nx[30]+' '+bb[30]+' L '+nx[30]+' '+bt[21]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[30,21] ; 

paper.setStart(); 
mid=bb[31]+(bt[88]-bb[31])/2; 
hleft = nx[82]; 
hright = nx[31]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[31]+' '+bb[31]+' L '+nx[31]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[82]+' '+mid+' L '+nx[82]+' '+bt[82];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[31,82]; 

paper.setStart(); 
mid=bb[31]+(bt[88]-bb[31])/2; 
hleft = nx[88]; 
hright = nx[31]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[88]+' '+mid+' L '+nx[88]+' '+bt[88];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[31,88]; 

paper.setStart(); 
mid=bb[31]+(bt[88]-bb[31])/2; 
s3='M '+nx[19]+' '+mid+' L '+nx[19]+' '+bt[19];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[31,19]; 

paper.setStart(); 
mid=bb[31]+(bt[88]-bb[31])/2; 
s3='M '+nx[243]+' '+mid+' L '+nx[243]+' '+bt[243];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[31,243]; 

paper.setStart(); 
mid=bb[33]+(bt[78]-bb[33])/2; 
hleft = nx[78]; 
hright = nx[33]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[33]+' '+bb[33]+' L '+nx[33]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[78]+' '+mid+' L '+nx[78]+' '+bt[78];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[33,78]; 

paper.setStart(); 
mid=bb[33]+(bt[78]-bb[33])/2; 
hleft = nx[94]; 
hright = nx[33]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[94]+' '+mid+' L '+nx[94]+' '+bt[94];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[33,94]; 

paper.setStart(); 
mid=bb[35]+(bt[156]-bb[35])/2; 
hleft = nx[117]; 
hright = nx[35]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[35]+' '+bb[35]+' L '+nx[35]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[117]+' '+mid+' L '+nx[117]+' '+bt[117];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[35,117]; 

paper.setStart(); 
mid=bb[35]+(bt[156]-bb[35])/2; 
hleft = nx[156]; 
hright = nx[35]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[156]+' '+mid+' L '+nx[156]+' '+bt[156];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[35,156]; 

paper.setStart(); 
mid=bb[37]+(bt[120]-bb[37])/2; 
hleft = nx[120]; 
hright = nx[37]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[37]+' '+bb[37]+' L '+nx[37]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[120]+' '+mid+' L '+nx[120]+' '+bt[120];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[37,120]; 

paper.setStart(); 
mid=bb[37]+(bt[120]-bb[37])/2; 
s3='M '+nx[184]+' '+mid+' L '+nx[184]+' '+bt[184];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[37,184]; 

paper.setStart(); 
mid=bb[37]+(bt[120]-bb[37])/2; 
s3='M '+nx[175]+' '+mid+' L '+nx[175]+' '+bt[175];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[37,175]; 

paper.setStart(); 
mid=bb[37]+(bt[120]-bb[37])/2; 
hleft = nx[2]; 
hright = nx[37]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[2]+' '+mid+' L '+nx[2]+' '+bt[2];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[37,2]; 

paper.setStart(); 
mid=bb[38]+(bt[112]-bb[38])/2; 
hleft = nx[92]; 
hright = nx[38]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[38]+' '+bb[38]+' L '+nx[38]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[92]+' '+mid+' L '+nx[92]+' '+bt[92];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[38,92]; 

paper.setStart(); 
mid=bb[38]+(bt[112]-bb[38])/2; 
hleft = nx[112]; 
hright = nx[38]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[112]+' '+mid+' L '+nx[112]+' '+bt[112];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[38,112]; 

paper.setStart(); 
s1='M '+nx[42]+' '+bb[42]+' L '+nx[42]+' '+bt[181]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[42,181] ; 

paper.setStart(); 
s1='M '+nx[43]+' '+bb[43]+' L '+nx[43]+' '+bt[45]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[43,45] ; 

paper.setStart(); 
mid=bb[44]+(bt[168]-bb[44])/2; 
hleft = nx[209]; 
hright = nx[44]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[44]+' '+bb[44]+' L '+nx[44]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[209]+' '+mid+' L '+nx[209]+' '+bt[209];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[44,209]; 

paper.setStart(); 
mid=bb[44]+(bt[168]-bb[44])/2; 
hleft = nx[168]; 
hright = nx[44]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[168]+' '+mid+' L '+nx[168]+' '+bt[168];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[44,168]; 

paper.setStart(); 
s1='M '+nx[45]+' '+bb[45]+' L '+nx[45]+' '+ny[275]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[45]+' '+ny[275]+' L '+nx[158]+' '+ny[275]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[45,275]; 

paper.setStart(); 
s1='M '+nx[47]+' '+bb[47]+' L '+nx[47]+' '+ny[273]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[47]+' '+ny[273]+' L '+nx[132]+' '+ny[273]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[47,273]; 

paper.setStart(); 
mid=bb[48]+(bt[121]-bb[48])/2; 
hleft = nx[44]; 
hright = nx[48]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[48]+' '+bb[48]+' L '+nx[48]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[44]+' '+mid+' L '+nx[44]+' '+bt[44];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[48,44]; 

paper.setStart(); 
mid=bb[48]+(bt[121]-bb[48])/2; 
hleft = nx[121]; 
hright = nx[48]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[121]+' '+mid+' L '+nx[121]+' '+bt[121];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[48,121]; 

paper.setStart(); 
mid=bb[48]+(bt[121]-bb[48])/2; 
s3='M '+nx[96]+' '+mid+' L '+nx[96]+' '+bt[96];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[48,96]; 

paper.setStart(); 
mid=bb[48]+(bt[121]-bb[48])/2; 
s3='M '+nx[224]+' '+mid+' L '+nx[224]+' '+bt[224];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[48,224]; 

paper.setStart(); 
mid=bb[48]+(bt[121]-bb[48])/2; 
s3='M '+nx[213]+' '+mid+' L '+nx[213]+' '+bt[213];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[48,213]; 

paper.setStart(); 
mid=bb[48]+(bt[121]-bb[48])/2; 
s3='M '+nx[170]+' '+mid+' L '+nx[170]+' '+bt[170];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[48,170]; 

paper.setStart(); 
mid=bb[48]+(bt[121]-bb[48])/2; 
s3='M '+nx[199]+' '+mid+' L '+nx[199]+' '+bt[199];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[48,199]; 

paper.setStart(); 
mid=bb[49]+(bt[185]-bb[49])/2; 
hleft = nx[163]; 
hright = nx[49]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[49]+' '+bb[49]+' L '+nx[49]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[163]+' '+mid+' L '+nx[163]+' '+bt[163];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[49,163]; 

paper.setStart(); 
mid=bb[49]+(bt[185]-bb[49])/2; 
s3='M '+nx[190]+' '+mid+' L '+nx[190]+' '+bt[190];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[49,190]; 

paper.setStart(); 
mid=bb[49]+(bt[185]-bb[49])/2; 
s3='M '+nx[116]+' '+mid+' L '+nx[116]+' '+bt[116];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[49]=paper.setFinish(); 
lineNodes[49]=[49,116]; 

paper.setStart(); 
mid=bb[49]+(bt[185]-bb[49])/2; 
hleft = nx[185]; 
hright = nx[49]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[185]+' '+mid+' L '+nx[185]+' '+bt[185];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[49,185]; 

paper.setStart(); 
s1='M '+nx[53]+' '+bb[53]+' L '+nx[53]+' '+bt[241]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[53,241] ; 

paper.setStart(); 
mid=bb[58]+(bt[150]-bb[58])/2; 
hleft = nx[141]; 
hright = nx[58]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[58]+' '+bb[58]+' L '+nx[58]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[141]+' '+mid+' L '+nx[141]+' '+bt[141];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[58,141]; 

paper.setStart(); 
mid=bb[58]+(bt[150]-bb[58])/2; 
hleft = nx[150]; 
hright = nx[58]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[150]+' '+mid+' L '+nx[150]+' '+bt[150];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[58,150]; 

paper.setStart(); 
s1='M '+nx[59]+' '+bb[59]+' L '+nx[59]+' '+bt[108]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[59,108] ; 

paper.setStart(); 
s1='M '+nx[60]+' '+bb[60]+' L '+nx[60]+' '+ny[271]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[60,271]; 

paper.setStart(); 
s1='M '+nx[63]+' '+bb[63]+' L '+nx[63]+' '+bt[50]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[63,50] ; 

paper.setStart(); 
mid=bb[66]+(bt[39]-bb[66])/2; 
s2='M '+nx[66]+' '+bb[66]+' L '+nx[66]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[249]+' '+mid+' L '+nx[249]+' '+bt[249];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[66,249]; 

paper.setStart(); 
mid=bb[66]+(bt[39]-bb[66])/2; 
hleft = nx[39]; 
hright = nx[66]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[39]+' '+mid+' L '+nx[39]+' '+bt[39];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[66,39]; 

paper.setStart(); 
mid=bb[66]+(bt[39]-bb[66])/2; 
hleft = nx[85]; 
hright = nx[66]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[85]+' '+mid+' L '+nx[85]+' '+bt[85];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[66,85]; 

paper.setStart(); 
s1='M '+nx[67]+' '+bb[67]+' L '+nx[67]+' '+bt[254]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[67,254] ; 

paper.setStart(); 
s1='M '+nx[68]+' '+bb[68]+' L '+nx[68]+' '+ny[277]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[68,277]; 

paper.setStart(); 
mid=bb[70]+(bt[51]-bb[70])/2; 
s2='M '+nx[70]+' '+bb[70]+' L '+nx[70]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[119]+' '+mid+' L '+nx[119]+' '+bt[119];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[70,119]; 

paper.setStart(); 
mid=bb[70]+(bt[51]-bb[70])/2; 
hleft = nx[82]; 
hright = nx[70]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[82]+' '+mid+' L '+nx[82]+' '+bt[82];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[70,82]; 

paper.setStart(); 
mid=bb[70]+(bt[51]-bb[70])/2; 
s3='M '+nx[189]+' '+mid+' L '+nx[189]+' '+bt[189];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[70,189]; 

paper.setStart(); 
mid=bb[70]+(bt[51]-bb[70])/2; 
s3='M '+nx[51]+' '+mid+' L '+nx[51]+' '+bt[51];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[70,51]; 

paper.setStart(); 
mid=bb[70]+(bt[51]-bb[70])/2; 
hleft = nx[138]; 
hright = nx[70]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[138]+' '+mid+' L '+nx[138]+' '+bt[138];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[70,138]; 

paper.setStart(); 
s1='M '+nx[71]+' '+bb[71]+' L '+nx[71]+' '+bt[195]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[71,195] ; 

paper.setStart(); 
s1='M '+nx[74]+' '+bb[74]+' L '+nx[74]+' '+bt[123]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[74,123] ; 

paper.setStart(); 
mid=bb[75]+(bt[20]-bb[75])/2; 
hleft = nx[36]; 
hright = nx[75]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[75]+' '+bb[75]+' L '+nx[75]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[36]+' '+mid+' L '+nx[36]+' '+bt[36];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[69]=paper.setFinish(); 
lineNodes[69]=[75,36]; 

paper.setStart(); 
mid=bb[75]+(bt[20]-bb[75])/2; 
hleft = nx[167]; 
hright = nx[75]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[167]+' '+mid+' L '+nx[167]+' '+bt[167];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[70]=paper.setFinish(); 
lineNodes[70]=[75,167]; 

paper.setStart(); 
mid=bb[75]+(bt[20]-bb[75])/2; 
s3='M '+nx[20]+' '+mid+' L '+nx[20]+' '+bt[20];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[71]=paper.setFinish(); 
lineNodes[71]=[75,20]; 

paper.setStart(); 
mid=bb[76]+(bt[221]-bb[76])/2; 
s2='M '+nx[76]+' '+bb[76]+' L '+nx[76]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[221]+' '+mid+' L '+nx[221]+' '+bt[221];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[72]=paper.setFinish(); 
lineNodes[72]=[76,221]; 

paper.setStart(); 
mid=bb[76]+(bt[221]-bb[76])/2; 
hleft = nx[154]; 
hright = nx[76]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[154]+' '+mid+' L '+nx[154]+' '+bt[154];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[73]=paper.setFinish(); 
lineNodes[73]=[76,154]; 

paper.setStart(); 
mid=bb[76]+(bt[221]-bb[76])/2; 
hleft = nx[259]; 
hright = nx[76]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[259]+' '+mid+' L '+nx[259]+' '+bt[259];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[74]=paper.setFinish(); 
lineNodes[74]=[76,259]; 

paper.setStart(); 
s1='M '+nx[77]+' '+bb[77]+' L '+nx[77]+' '+ny[272]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[75]=paper.setFinish(); 
lineNodes[75]=[77,272]; 

paper.setStart(); 
mid=bb[81]+(bt[158]-bb[81])/2; 
hleft = nx[158]; 
hright = nx[81]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[81]+' '+bb[81]+' L '+nx[81]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[158]+' '+mid+' L '+nx[158]+' '+bt[158];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[76]=paper.setFinish(); 
lineNodes[76]=[81,158]; 

paper.setStart(); 
mid=bb[81]+(bt[158]-bb[81])/2; 
s3='M '+nx[9]+' '+mid+' L '+nx[9]+' '+bt[9];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[77]=paper.setFinish(); 
lineNodes[77]=[81,9]; 

paper.setStart(); 
mid=bb[81]+(bt[158]-bb[81])/2; 
hleft = nx[73]; 
hright = nx[81]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[73]+' '+mid+' L '+nx[73]+' '+bt[73];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[78]=paper.setFinish(); 
lineNodes[78]=[81,73]; 

paper.setStart(); 
mid=bb[82]+(bt[268]-bb[82])/2; 
hleft = nx[231]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[82]+' '+bb[82]+' L '+nx[82]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[231]+' '+mid+' L '+nx[231]+' '+bt[231];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[79]=paper.setFinish(); 
lineNodes[79]=[82,231]; 

paper.setStart(); 
mid=bb[82]+(bt[268]-bb[82])/2; 
hleft = nx[268]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[268]+' '+mid+' L '+nx[268]+' '+bt[268];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[80]=paper.setFinish(); 
lineNodes[80]=[82,268]; 

paper.setStart(); 
s1='M '+nx[83]+' '+bb[83]+' L '+nx[83]+' '+ny[274]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[81]=paper.setFinish(); 
lineNodes[81]=[83,274]; 

paper.setStart(); 
s1='M '+nx[87]+' '+bb[87]+' L '+nx[87]+' '+bt[227]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[82]=paper.setFinish(); 
lineNodes[82]=[87,227] ; 

paper.setStart(); 
mid=bb[89]+(bt[140]-bb[89])/2; 
hleft = nx[151]; 
hright = nx[89]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[89]+' '+bb[89]+' L '+nx[89]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[151]+' '+mid+' L '+nx[151]+' '+bt[151];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[83]=paper.setFinish(); 
lineNodes[83]=[89,151]; 

paper.setStart(); 
mid=bb[89]+(bt[140]-bb[89])/2; 
s3='M '+nx[247]+' '+mid+' L '+nx[247]+' '+bt[247];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[84]=paper.setFinish(); 
lineNodes[84]=[89,247]; 

paper.setStart(); 
mid=bb[89]+(bt[140]-bb[89])/2; 
s3='M '+nx[240]+' '+mid+' L '+nx[240]+' '+bt[240];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[85]=paper.setFinish(); 
lineNodes[85]=[89,240]; 

paper.setStart(); 
mid=bb[89]+(bt[140]-bb[89])/2; 
hleft = nx[140]; 
hright = nx[89]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[140]+' '+mid+' L '+nx[140]+' '+bt[140];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[86]=paper.setFinish(); 
lineNodes[86]=[89,140]; 

paper.setStart(); 
mid=bb[90]+(bt[5]-bb[90])/2; 
hleft = nx[5]; 
hright = nx[90]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[90]+' '+bb[90]+' L '+nx[90]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[5]+' '+mid+' L '+nx[5]+' '+bt[5];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[87]=paper.setFinish(); 
lineNodes[87]=[90,5]; 

paper.setStart(); 
mid=bb[90]+(bt[5]-bb[90])/2; 
hleft = nx[55]; 
hright = nx[90]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[55]+' '+mid+' L '+nx[55]+' '+bt[55];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[88]=paper.setFinish(); 
lineNodes[88]=[90,55]; 

paper.setStart(); 
mid=bb[93]+(bt[54]-bb[93])/2; 
hleft = nx[266]; 
hright = nx[93]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[93]+' '+bb[93]+' L '+nx[93]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[266]+' '+mid+' L '+nx[266]+' '+bt[266];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[89]=paper.setFinish(); 
lineNodes[89]=[93,266]; 

paper.setStart(); 
mid=bb[93]+(bt[54]-bb[93])/2; 
hleft = nx[54]; 
hright = nx[93]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[54]+' '+mid+' L '+nx[54]+' '+bt[54];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[90]=paper.setFinish(); 
lineNodes[90]=[93,54]; 

paper.setStart(); 
mid=bb[96]+(bt[111]-bb[96])/2; 
hleft = nx[257]; 
hright = nx[96]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[96]+' '+bb[96]+' L '+nx[96]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[257]+' '+mid+' L '+nx[257]+' '+bt[257];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[91]=paper.setFinish(); 
lineNodes[91]=[96,257]; 

paper.setStart(); 
mid=bb[96]+(bt[111]-bb[96])/2; 
hleft = nx[111]; 
hright = nx[96]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[111]+' '+mid+' L '+nx[111]+' '+bt[111];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[92]=paper.setFinish(); 
lineNodes[92]=[96,111]; 

paper.setStart(); 
s1='M '+nx[97]+' '+bb[97]+' L '+nx[97]+' '+bt[164]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[93]=paper.setFinish(); 
lineNodes[93]=[97,164] ; 

paper.setStart(); 
mid=bb[99]+(bt[161]-bb[99])/2; 
hleft = nx[10]; 
hright = nx[99]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[99]+' '+bb[99]+' L '+nx[99]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[10]+' '+mid+' L '+nx[10]+' '+bt[10];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[94]=paper.setFinish(); 
lineNodes[94]=[99,10]; 

paper.setStart(); 
mid=bb[99]+(bt[161]-bb[99])/2; 
s3='M '+nx[245]+' '+mid+' L '+nx[245]+' '+bt[245];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[95]=paper.setFinish(); 
lineNodes[95]=[99,245]; 

paper.setStart(); 
mid=bb[99]+(bt[161]-bb[99])/2; 
s3='M '+nx[66]+' '+mid+' L '+nx[66]+' '+bt[66];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[96]=paper.setFinish(); 
lineNodes[96]=[99,66]; 

paper.setStart(); 
mid=bb[99]+(bt[161]-bb[99])/2; 
hleft = nx[263]; 
hright = nx[99]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[263]+' '+mid+' L '+nx[263]+' '+bt[263];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[97]=paper.setFinish(); 
lineNodes[97]=[99,263]; 

paper.setStart(); 
mid=bb[99]+(bt[161]-bb[99])/2; 
s3='M '+nx[161]+' '+mid+' L '+nx[161]+' '+bt[161];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[98]=paper.setFinish(); 
lineNodes[98]=[99,161]; 

paper.setStart(); 
mid=bb[99]+(bt[161]-bb[99])/2; 
s3='M '+nx[192]+' '+mid+' L '+nx[192]+' '+bt[192];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[99]=paper.setFinish(); 
lineNodes[99]=[99,192]; 

paper.setStart(); 
s1='M '+nx[100]+' '+bb[100]+' L '+nx[100]+' '+bt[197]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[100]=paper.setFinish(); 
lineNodes[100]=[100,197] ; 

paper.setStart(); 
s1='M '+nx[103]+' '+bb[103]+' L '+nx[103]+' '+ny[274]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[103]+' '+ny[274]+' L '+nx[83]+' '+ny[274]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[101]=paper.setFinish(); 
lineNodes[101]=[103,274]; 

paper.setStart(); 
s1='M '+nx[104]+' '+bb[104]+' L '+nx[104]+' '+ny[277]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[102]=paper.setFinish(); 
lineNodes[102]=[104,277]; 

paper.setStart(); 
s1='M '+nx[107]+' '+bb[107]+' L '+nx[107]+' '+ny[276]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[107]+' '+ny[276]+' L '+nx[201]+' '+ny[276]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[103]=paper.setFinish(); 
lineNodes[103]=[107,276]; 

paper.setStart(); 
mid=bb[109]+(bt[83]-bb[109])/2; 
hleft = nx[103]; 
hright = nx[109]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[109]+' '+bb[109]+' L '+nx[109]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[103]+' '+mid+' L '+nx[103]+' '+bt[103];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[104]=paper.setFinish(); 
lineNodes[104]=[109,103]; 

paper.setStart(); 
mid=bb[109]+(bt[83]-bb[109])/2; 
hleft = nx[83]; 
hright = nx[109]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[83]+' '+mid+' L '+nx[83]+' '+bt[83];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[105]=paper.setFinish(); 
lineNodes[105]=[109,83]; 

paper.setStart(); 
s1='M '+nx[110]+' '+bb[110]+' L '+nx[110]+' '+bt[217]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[106]=paper.setFinish(); 
lineNodes[106]=[110,217] ; 

paper.setStart(); 
s1='M '+nx[113]+' '+bb[113]+' L '+nx[113]+' '+ny[269]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[107]=paper.setFinish(); 
lineNodes[107]=[113,269]; 

paper.setStart(); 
mid=bb[116]+(bt[169]-bb[116])/2; 
s2='M '+nx[116]+' '+bb[116]+' L '+nx[116]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[18]+' '+mid+' L '+nx[18]+' '+bt[18];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[108]=paper.setFinish(); 
lineNodes[108]=[116,18]; 

paper.setStart(); 
mid=bb[116]+(bt[169]-bb[116])/2; 
s3='M '+nx[87]+' '+mid+' L '+nx[87]+' '+bt[87];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[109]=paper.setFinish(); 
lineNodes[109]=[116,87]; 

paper.setStart(); 
mid=bb[116]+(bt[169]-bb[116])/2; 
hleft = nx[178]; 
hright = nx[116]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[178]+' '+mid+' L '+nx[178]+' '+bt[178];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[110]=paper.setFinish(); 
lineNodes[110]=[116,178]; 

paper.setStart(); 
mid=bb[116]+(bt[169]-bb[116])/2; 
s3='M '+nx[53]+' '+mid+' L '+nx[53]+' '+bt[53];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[111]=paper.setFinish(); 
lineNodes[111]=[116,53]; 

paper.setStart(); 
mid=bb[116]+(bt[169]-bb[116])/2; 
hleft = nx[169]; 
hright = nx[116]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[169]+' '+mid+' L '+nx[169]+' '+bt[169];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[112]=paper.setFinish(); 
lineNodes[112]=[116,169]; 

paper.setStart(); 
mid=bb[116]+(bt[169]-bb[116])/2; 
s3='M '+nx[6]+' '+mid+' L '+nx[6]+' '+bt[6];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[113]=paper.setFinish(); 
lineNodes[113]=[116,6]; 

paper.setStart(); 
mid=bb[119]+(bt[188]-bb[119])/2; 
hleft = nx[8]; 
hright = nx[119]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[119]+' '+bb[119]+' L '+nx[119]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[8]+' '+mid+' L '+nx[8]+' '+bt[8];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[114]=paper.setFinish(); 
lineNodes[114]=[119,8]; 

paper.setStart(); 
mid=bb[119]+(bt[188]-bb[119])/2; 
hleft = nx[188]; 
hright = nx[119]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[188]+' '+mid+' L '+nx[188]+' '+bt[188];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[115]=paper.setFinish(); 
lineNodes[115]=[119,188]; 

paper.setStart(); 
s1='M '+nx[120]+' '+bb[120]+' L '+nx[120]+' '+ny[275]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[116]=paper.setFinish(); 
lineNodes[116]=[120,275]; 

paper.setStart(); 
mid=bb[121]+(bt[127]-bb[121])/2; 
hleft = nx[127]; 
hright = nx[121]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[121]+' '+bb[121]+' L '+nx[121]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[127]+' '+mid+' L '+nx[127]+' '+bt[127];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[117]=paper.setFinish(); 
lineNodes[117]=[121,127]; 

paper.setStart(); 
mid=bb[121]+(bt[127]-bb[121])/2; 
s3='M '+nx[174]+' '+mid+' L '+nx[174]+' '+bt[174];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[118]=paper.setFinish(); 
lineNodes[118]=[121,174]; 

paper.setStart(); 
mid=bb[121]+(bt[127]-bb[121])/2; 
s3='M '+nx[3]+' '+mid+' L '+nx[3]+' '+bt[3];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[119]=paper.setFinish(); 
lineNodes[119]=[121,3]; 

paper.setStart(); 
mid=bb[121]+(bt[127]-bb[121])/2; 
s3='M '+nx[212]+' '+mid+' L '+nx[212]+' '+bt[212];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[120]=paper.setFinish(); 
lineNodes[120]=[121,212]; 

paper.setStart(); 
mid=bb[121]+(bt[127]-bb[121])/2; 
hleft = nx[0]; 
hright = nx[121]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[0]+' '+mid+' L '+nx[0]+' '+bt[0];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[121]=paper.setFinish(); 
lineNodes[121]=[121,0]; 

paper.setStart(); 
mid=bb[122]+(bt[218]-bb[122])/2; 
s2='M '+nx[122]+' '+bb[122]+' L '+nx[122]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[264]+' '+mid+' L '+nx[264]+' '+bt[264];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[122]=paper.setFinish(); 
lineNodes[122]=[122,264]; 

paper.setStart(); 
mid=bb[122]+(bt[218]-bb[122])/2; 
hleft = nx[14]; 
hright = nx[122]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[14]+' '+mid+' L '+nx[14]+' '+bt[14];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[123]=paper.setFinish(); 
lineNodes[123]=[122,14]; 

paper.setStart(); 
mid=bb[122]+(bt[218]-bb[122])/2; 
hleft = nx[218]; 
hright = nx[122]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[218]+' '+mid+' L '+nx[218]+' '+bt[218];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[124]=paper.setFinish(); 
lineNodes[124]=[122,218]; 

paper.setStart(); 
s1='M '+nx[123]+' '+bb[123]+' L '+nx[123]+' '+bt[229]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[125]=paper.setFinish(); 
lineNodes[125]=[123,229] ; 

paper.setStart(); 
mid=bb[124]+(bt[118]-bb[124])/2; 
hleft = nx[118]; 
hright = nx[124]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[124]+' '+bb[124]+' L '+nx[124]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[118]+' '+mid+' L '+nx[118]+' '+bt[118];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[126]=paper.setFinish(); 
lineNodes[126]=[124,118]; 

paper.setStart(); 
mid=bb[124]+(bt[118]-bb[124])/2; 
hleft = nx[41]; 
hright = nx[124]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[41]+' '+mid+' L '+nx[41]+' '+bt[41];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[127]=paper.setFinish(); 
lineNodes[127]=[124,41]; 

paper.setStart(); 
mid=bb[125]+(bt[56]-bb[125])/2; 
hleft = nx[57]; 
hright = nx[125]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[125]+' '+bb[125]+' L '+nx[125]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[57]+' '+mid+' L '+nx[57]+' '+bt[57];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[128]=paper.setFinish(); 
lineNodes[128]=[125,57]; 

paper.setStart(); 
mid=bb[125]+(bt[56]-bb[125])/2; 
hleft = nx[200]; 
hright = nx[125]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[200]+' '+mid+' L '+nx[200]+' '+bt[200];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[129]=paper.setFinish(); 
lineNodes[129]=[125,200]; 

paper.setStart(); 
mid=bb[125]+(bt[56]-bb[125])/2; 
s3='M '+nx[56]+' '+mid+' L '+nx[56]+' '+bt[56];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[130]=paper.setFinish(); 
lineNodes[130]=[125,56]; 

paper.setStart(); 
s1='M '+nx[127]+' '+bb[127]+' L '+nx[127]+' '+bt[67]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[131]=paper.setFinish(); 
lineNodes[131]=[127,67] ; 

paper.setStart(); 
mid=bb[128]+(bt[196]-bb[128])/2; 
hleft = nx[196]; 
hright = nx[128]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[128]+' '+bb[128]+' L '+nx[128]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[196]+' '+mid+' L '+nx[196]+' '+bt[196];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[132]=paper.setFinish(); 
lineNodes[132]=[128,196]; 

paper.setStart(); 
mid=bb[128]+(bt[196]-bb[128])/2; 
hleft = nx[237]; 
hright = nx[128]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[237]+' '+mid+' L '+nx[237]+' '+bt[237];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[133]=paper.setFinish(); 
lineNodes[133]=[128,237]; 

paper.setStart(); 
s1='M '+nx[129]+' '+bb[129]+' L '+nx[129]+' '+ny[271]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[129]+' '+ny[271]+' L '+nx[60]+' '+ny[271]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[134]=paper.setFinish(); 
lineNodes[134]=[129,271]; 

paper.setStart(); 
s1='M '+nx[132]+' '+bb[132]+' L '+nx[132]+' '+ny[273]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[135]=paper.setFinish(); 
lineNodes[135]=[132,273]; 

paper.setStart(); 
s1='M '+nx[134]+' '+bb[134]+' L '+nx[134]+' '+bt[75]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[136]=paper.setFinish(); 
lineNodes[136]=[134,75] ; 

paper.setStart(); 
s1='M '+nx[134]+' '+bb[134]+' L '+nx[134]+' '+ny[270]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[137]=paper.setFinish(); 
lineNodes[137]=[134,270]; 

paper.setStart(); 
s1='M '+nx[136]+' '+bb[136]+' L '+nx[136]+' '+ny[275]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[138]=paper.setFinish(); 
lineNodes[138]=[136,275]; 

paper.setStart(); 
mid=bb[137]+(bt[250]-bb[137])/2; 
hleft = nx[252]; 
hright = nx[137]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[137]+' '+bb[137]+' L '+nx[137]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[252]+' '+mid+' L '+nx[252]+' '+bt[252];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[139]=paper.setFinish(); 
lineNodes[139]=[137,252]; 

paper.setStart(); 
mid=bb[137]+(bt[250]-bb[137])/2; 
s3='M '+nx[250]+' '+mid+' L '+nx[250]+' '+bt[250];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[140]=paper.setFinish(); 
lineNodes[140]=[137,250]; 

paper.setStart(); 
mid=bb[137]+(bt[250]-bb[137])/2; 
hleft = nx[52]; 
hright = nx[137]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[52]+' '+mid+' L '+nx[52]+' '+bt[52];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[141]=paper.setFinish(); 
lineNodes[141]=[137,52]; 

paper.setStart(); 
mid=bb[138]+(bt[171]-bb[138])/2; 
hleft = nx[153]; 
hright = nx[138]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[138]+' '+bb[138]+' L '+nx[138]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[153]+' '+mid+' L '+nx[153]+' '+bt[153];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[142]=paper.setFinish(); 
lineNodes[142]=[138,153]; 

paper.setStart(); 
mid=bb[138]+(bt[171]-bb[138])/2; 
s3='M '+nx[40]+' '+mid+' L '+nx[40]+' '+bt[40];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[143]=paper.setFinish(); 
lineNodes[143]=[138,40]; 

paper.setStart(); 
mid=bb[138]+(bt[171]-bb[138])/2; 
s3='M '+nx[13]+' '+mid+' L '+nx[13]+' '+bt[13];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[144]=paper.setFinish(); 
lineNodes[144]=[138,13]; 

paper.setStart(); 
mid=bb[138]+(bt[171]-bb[138])/2; 
hleft = nx[171]; 
hright = nx[138]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[171]+' '+mid+' L '+nx[171]+' '+bt[171];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[145]=paper.setFinish(); 
lineNodes[145]=[138,171]; 

paper.setStart(); 
s1='M '+nx[141]+' '+bb[141]+' L '+nx[141]+' '+bt[211]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[146]=paper.setFinish(); 
lineNodes[146]=[141,211] ; 

paper.setStart(); 
s1='M '+nx[144]+' '+bb[144]+' L '+nx[144]+' '+bt[86]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[147]=paper.setFinish(); 
lineNodes[147]=[144,86] ; 

paper.setStart(); 
mid=bb[146]+(bt[11]-bb[146])/2; 
s2='M '+nx[146]+' '+bb[146]+' L '+nx[146]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[79]+' '+mid+' L '+nx[79]+' '+bt[79];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[148]=paper.setFinish(); 
lineNodes[148]=[146,79]; 

paper.setStart(); 
mid=bb[146]+(bt[11]-bb[146])/2; 
s3='M '+nx[80]+' '+mid+' L '+nx[80]+' '+bt[80];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[149]=paper.setFinish(); 
lineNodes[149]=[146,80]; 

paper.setStart(); 
mid=bb[146]+(bt[11]-bb[146])/2; 
hleft = nx[139]; 
hright = nx[146]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[139]+' '+mid+' L '+nx[139]+' '+bt[139];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[150]=paper.setFinish(); 
lineNodes[150]=[146,139]; 

paper.setStart(); 
mid=bb[146]+(bt[11]-bb[146])/2; 
hleft = nx[11]; 
hright = nx[146]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[11]+' '+mid+' L '+nx[11]+' '+bt[11];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[151]=paper.setFinish(); 
lineNodes[151]=[146,11]; 

paper.setStart(); 
mid=bb[149]+(bt[59]-bb[149])/2; 
hleft = nx[59]; 
hright = nx[149]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[149]+' '+bb[149]+' L '+nx[149]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[59]+' '+mid+' L '+nx[59]+' '+bt[59];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[152]=paper.setFinish(); 
lineNodes[152]=[149,59]; 

paper.setStart(); 
mid=bb[149]+(bt[59]-bb[149])/2; 
hleft = nx[256]; 
hright = nx[149]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[256]+' '+mid+' L '+nx[256]+' '+bt[256];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[153]=paper.setFinish(); 
lineNodes[153]=[149,256]; 

paper.setStart(); 
mid=bb[150]+(bt[267]-bb[150])/2; 
hleft = nx[260]; 
hright = nx[150]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[150]+' '+bb[150]+' L '+nx[150]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[260]+' '+mid+' L '+nx[260]+' '+bt[260];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[154]=paper.setFinish(); 
lineNodes[154]=[150,260]; 

paper.setStart(); 
mid=bb[150]+(bt[267]-bb[150])/2; 
hleft = nx[267]; 
hright = nx[150]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[267]+' '+mid+' L '+nx[267]+' '+bt[267];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[155]=paper.setFinish(); 
lineNodes[155]=[150,267]; 

paper.setStart(); 
s1='M '+nx[152]+' '+bb[152]+' L '+nx[152]+' '+ny[275]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[156]=paper.setFinish(); 
lineNodes[156]=[152,275]; 

paper.setStart(); 
s1='M '+nx[157]+' '+bb[157]+' L '+nx[157]+' '+bt[122]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[157]=paper.setFinish(); 
lineNodes[157]=[157,122] ; 

paper.setStart(); 
s1='M '+nx[158]+' '+bb[158]+' L '+nx[158]+' '+ny[275]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[158]=paper.setFinish(); 
lineNodes[158]=[158,275]; 

paper.setStart(); 
mid=bb[160]+(bt[228]-bb[160])/2; 
hleft = nx[62]; 
hright = nx[160]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[160]+' '+bb[160]+' L '+nx[160]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[62]+' '+mid+' L '+nx[62]+' '+bt[62];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[159]=paper.setFinish(); 
lineNodes[159]=[160,62]; 

paper.setStart(); 
mid=bb[160]+(bt[228]-bb[160])/2; 
hleft = nx[228]; 
hright = nx[160]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[228]+' '+mid+' L '+nx[228]+' '+bt[228];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[160]=paper.setFinish(); 
lineNodes[160]=[160,228]; 

paper.setStart(); 
mid=bb[161]+(bt[84]-bb[161])/2; 
hleft = nx[226]; 
hright = nx[161]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[161]+' '+bb[161]+' L '+nx[161]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[226]+' '+mid+' L '+nx[226]+' '+bt[226];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[161]=paper.setFinish(); 
lineNodes[161]=[161,226]; 

paper.setStart(); 
mid=bb[161]+(bt[84]-bb[161])/2; 
s3='M '+nx[32]+' '+mid+' L '+nx[32]+' '+bt[32];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[162]=paper.setFinish(); 
lineNodes[162]=[161,32]; 

paper.setStart(); 
mid=bb[161]+(bt[84]-bb[161])/2; 
hleft = nx[84]; 
hright = nx[161]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[84]+' '+mid+' L '+nx[84]+' '+bt[84];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[163]=paper.setFinish(); 
lineNodes[163]=[161,84]; 

paper.setStart(); 
mid=bb[162]+(bt[208]-bb[162])/2; 
hleft = nx[101]; 
hright = nx[162]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[162]+' '+bb[162]+' L '+nx[162]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[101]+' '+mid+' L '+nx[101]+' '+bt[101];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[164]=paper.setFinish(); 
lineNodes[164]=[162,101]; 

paper.setStart(); 
mid=bb[162]+(bt[208]-bb[162])/2; 
hleft = nx[208]; 
hright = nx[162]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[208]+' '+mid+' L '+nx[208]+' '+bt[208];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[165]=paper.setFinish(); 
lineNodes[165]=[162,208]; 

paper.setStart(); 
mid=bb[163]+(bt[106]-bb[163])/2; 
hleft = nx[206]; 
hright = nx[163]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[163]+' '+bb[163]+' L '+nx[163]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[206]+' '+mid+' L '+nx[206]+' '+bt[206];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[166]=paper.setFinish(); 
lineNodes[166]=[163,206]; 

paper.setStart(); 
mid=bb[163]+(bt[106]-bb[163])/2; 
s3='M '+nx[4]+' '+mid+' L '+nx[4]+' '+bt[4];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[167]=paper.setFinish(); 
lineNodes[167]=[163,4]; 

paper.setStart(); 
mid=bb[163]+(bt[106]-bb[163])/2; 
s3='M '+nx[148]+' '+mid+' L '+nx[148]+' '+bt[148];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[168]=paper.setFinish(); 
lineNodes[168]=[163,148]; 

paper.setStart(); 
mid=bb[163]+(bt[106]-bb[163])/2; 
s3='M '+nx[106]+' '+mid+' L '+nx[106]+' '+bt[106];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[169]=paper.setFinish(); 
lineNodes[169]=[163,106]; 

paper.setStart(); 
mid=bb[163]+(bt[106]-bb[163])/2; 
hleft = nx[114]; 
hright = nx[163]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[114]+' '+mid+' L '+nx[114]+' '+bt[114];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[170]=paper.setFinish(); 
lineNodes[170]=[163,114]; 

paper.setStart(); 
s1='M '+nx[164]+' '+bb[164]+' L '+nx[164]+' '+bt[176]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[171]=paper.setFinish(); 
lineNodes[171]=[164,176] ; 

paper.setStart(); 
mid=bb[169]+(bt[203]-bb[169])/2; 
hleft = nx[255]; 
hright = nx[169]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[169]+' '+bb[169]+' L '+nx[169]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[255]+' '+mid+' L '+nx[255]+' '+bt[255];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[172]=paper.setFinish(); 
lineNodes[172]=[169,255]; 

paper.setStart(); 
mid=bb[169]+(bt[203]-bb[169])/2; 
hleft = nx[203]; 
hright = nx[169]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[203]+' '+mid+' L '+nx[203]+' '+bt[203];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[173]=paper.setFinish(); 
lineNodes[173]=[169,203]; 

paper.setStart(); 
mid=bb[170]+(bt[131]-bb[170])/2; 
hleft = nx[265]; 
hright = nx[170]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[170]+' '+bb[170]+' L '+nx[170]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[265]+' '+mid+' L '+nx[265]+' '+bt[265];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[174]=paper.setFinish(); 
lineNodes[174]=[170,265]; 

paper.setStart(); 
mid=bb[170]+(bt[131]-bb[170])/2; 
hleft = nx[131]; 
hright = nx[170]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[131]+' '+mid+' L '+nx[131]+' '+bt[131];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[175]=paper.setFinish(); 
lineNodes[175]=[170,131]; 

paper.setStart(); 
mid=bb[172]+(bt[160]-bb[172])/2; 
s2='M '+nx[172]+' '+bb[172]+' L '+nx[172]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[90]+' '+mid+' L '+nx[90]+' '+bt[90];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[176]=paper.setFinish(); 
lineNodes[176]=[172,90]; 

paper.setStart(); 
mid=bb[172]+(bt[160]-bb[172])/2; 
s3='M '+nx[125]+' '+mid+' L '+nx[125]+' '+bt[125];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[177]=paper.setFinish(); 
lineNodes[177]=[172,125]; 

paper.setStart(); 
mid=bb[172]+(bt[160]-bb[172])/2; 
hleft = nx[124]; 
hright = nx[172]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[124]+' '+mid+' L '+nx[124]+' '+bt[124];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[178]=paper.setFinish(); 
lineNodes[178]=[172,124]; 

paper.setStart(); 
mid=bb[172]+(bt[160]-bb[172])/2; 
s3='M '+nx[38]+' '+mid+' L '+nx[38]+' '+bt[38];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[179]=paper.setFinish(); 
lineNodes[179]=[172,38]; 

paper.setStart(); 
mid=bb[172]+(bt[160]-bb[172])/2; 
hleft = nx[146]; 
hright = nx[172]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[146]+' '+mid+' L '+nx[146]+' '+bt[146];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[180]=paper.setFinish(); 
lineNodes[180]=[172,146]; 

paper.setStart(); 
mid=bb[172]+(bt[160]-bb[172])/2; 
s3='M '+nx[160]+' '+mid+' L '+nx[160]+' '+bt[160];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[181]=paper.setFinish(); 
lineNodes[181]=[172,160]; 

paper.setStart(); 
mid=bb[172]+(bt[160]-bb[172])/2; 
s3='M '+nx[216]+' '+mid+' L '+nx[216]+' '+bt[216];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[182]=paper.setFinish(); 
lineNodes[182]=[172,216]; 

paper.setStart(); 
s1='M '+nx[175]+' '+bb[175]+' L '+nx[175]+' '+ny[275]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[183]=paper.setFinish(); 
lineNodes[183]=[175,275]; 

paper.setStart(); 
s1='M '+nx[176]+' '+bb[176]+' L '+nx[176]+' '+bt[61]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[184]=paper.setFinish(); 
lineNodes[184]=[176,61] ; 

paper.setStart(); 
mid=bb[178]+(bt[142]-bb[178])/2; 
s2='M '+nx[178]+' '+bb[178]+' L '+nx[178]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[25]+' '+mid+' L '+nx[25]+' '+bt[25];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[185]=paper.setFinish(); 
lineNodes[185]=[178,25]; 

paper.setStart(); 
mid=bb[178]+(bt[142]-bb[178])/2; 
s3='M '+nx[191]+' '+mid+' L '+nx[191]+' '+bt[191];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[186]=paper.setFinish(); 
lineNodes[186]=[178,191]; 

paper.setStart(); 
mid=bb[178]+(bt[142]-bb[178])/2; 
hleft = nx[142]; 
hright = nx[178]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[142]+' '+mid+' L '+nx[142]+' '+bt[142];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[187]=paper.setFinish(); 
lineNodes[187]=[178,142]; 

paper.setStart(); 
mid=bb[178]+(bt[142]-bb[178])/2; 
hleft = nx[233]; 
hright = nx[178]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[233]+' '+mid+' L '+nx[233]+' '+bt[233];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[188]=paper.setFinish(); 
lineNodes[188]=[178,233]; 

paper.setStart(); 
mid=bb[178]+(bt[142]-bb[178])/2; 
s3='M '+nx[177]+' '+mid+' L '+nx[177]+' '+bt[177];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[189]=paper.setFinish(); 
lineNodes[189]=[178,177]; 

paper.setStart(); 
mid=bb[179]+(bt[16]-bb[179])/2; 
s2='M '+nx[179]+' '+bb[179]+' L '+nx[179]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[186]+' '+mid+' L '+nx[186]+' '+bt[186];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[190]=paper.setFinish(); 
lineNodes[190]=[179,186]; 

paper.setStart(); 
mid=bb[179]+(bt[16]-bb[179])/2; 
hleft = nx[201]; 
hright = nx[179]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[201]+' '+mid+' L '+nx[201]+' '+bt[201];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[191]=paper.setFinish(); 
lineNodes[191]=[179,201]; 

paper.setStart(); 
mid=bb[179]+(bt[16]-bb[179])/2; 
hleft = nx[16]; 
hright = nx[179]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[16]+' '+mid+' L '+nx[16]+' '+bt[16];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[192]=paper.setFinish(); 
lineNodes[192]=[179,16]; 

paper.setStart(); 
s1='M '+nx[180]+' '+bb[180]+' L '+nx[180]+' '+bt[64]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[193]=paper.setFinish(); 
lineNodes[193]=[180,64] ; 

paper.setStart(); 
s1='M '+nx[182]+' '+bb[182]+' L '+nx[182]+' '+bt[30]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[194]=paper.setFinish(); 
lineNodes[194]=[182,30] ; 

paper.setStart(); 
s1='M '+nx[184]+' '+bb[184]+' L '+nx[184]+' '+ny[275]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[195]=paper.setFinish(); 
lineNodes[195]=[184,275]; 

paper.setStart(); 
mid=bb[185]+(bt[93]-bb[185])/2; 
s2='M '+nx[185]+' '+bb[185]+' L '+nx[185]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[187]+' '+mid+' L '+nx[187]+' '+bt[187];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[196]=paper.setFinish(); 
lineNodes[196]=[185,187]; 

paper.setStart(); 
mid=bb[185]+(bt[93]-bb[185])/2; 
s3='M '+nx[17]+' '+mid+' L '+nx[17]+' '+bt[17];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[197]=paper.setFinish(); 
lineNodes[197]=[185,17]; 

paper.setStart(); 
mid=bb[185]+(bt[93]-bb[185])/2; 
hleft = nx[74]; 
hright = nx[185]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[74]+' '+mid+' L '+nx[74]+' '+bt[74];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[198]=paper.setFinish(); 
lineNodes[198]=[185,74]; 

paper.setStart(); 
mid=bb[185]+(bt[93]-bb[185])/2; 
hleft = nx[93]; 
hright = nx[185]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[93]+' '+mid+' L '+nx[93]+' '+bt[93];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[199]=paper.setFinish(); 
lineNodes[199]=[185,93]; 

paper.setStart(); 
mid=bb[185]+(bt[93]-bb[185])/2; 
s3='M '+nx[97]+' '+mid+' L '+nx[97]+' '+bt[97];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[200]=paper.setFinish(); 
lineNodes[200]=[185,97]; 

paper.setStart(); 
s1='M '+nx[186]+' '+bb[186]+' L '+nx[186]+' '+ny[276]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[201]=paper.setFinish(); 
lineNodes[201]=[186,276]; 

paper.setStart(); 
mid=bb[190]+(bt[159]-bb[190])/2; 
s2='M '+nx[190]+' '+bb[190]+' L '+nx[190]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[135]+' '+mid+' L '+nx[135]+' '+bt[135];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[202]=paper.setFinish(); 
lineNodes[202]=[190,135]; 

paper.setStart(); 
mid=bb[190]+(bt[159]-bb[190])/2; 
s3='M '+nx[159]+' '+mid+' L '+nx[159]+' '+bt[159];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[203]=paper.setFinish(); 
lineNodes[203]=[190,159]; 

paper.setStart(); 
mid=bb[190]+(bt[159]-bb[190])/2; 
hleft = nx[65]; 
hright = nx[190]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[65]+' '+mid+' L '+nx[65]+' '+bt[65];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[204]=paper.setFinish(); 
lineNodes[204]=[190,65]; 

paper.setStart(); 
mid=bb[190]+(bt[159]-bb[190])/2; 
hleft = nx[126]; 
hright = nx[190]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[126]+' '+mid+' L '+nx[126]+' '+bt[126];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[205]=paper.setFinish(); 
lineNodes[205]=[190,126]; 

paper.setStart(); 
mid=bb[190]+(bt[159]-bb[190])/2; 
s3='M '+nx[238]+' '+mid+' L '+nx[238]+' '+bt[238];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[206]=paper.setFinish(); 
lineNodes[206]=[190,238]; 

paper.setStart(); 
s1='M '+nx[192]+' '+bb[192]+' L '+nx[192]+' '+bt[27]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[207]=paper.setFinish(); 
lineNodes[207]=[192,27] ; 

paper.setStart(); 
mid=bb[195]+(bt[60]-bb[195])/2; 
hleft = nx[60]; 
hright = nx[195]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[195]+' '+bb[195]+' L '+nx[195]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[60]+' '+mid+' L '+nx[60]+' '+bt[60];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[208]=paper.setFinish(); 
lineNodes[208]=[195,60]; 

paper.setStart(); 
mid=bb[195]+(bt[60]-bb[195])/2; 
hleft = nx[129]; 
hright = nx[195]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[129]+' '+mid+' L '+nx[129]+' '+bt[129];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[209]=paper.setFinish(); 
lineNodes[209]=[195,129]; 

paper.setStart(); 
mid=bb[197]+(bt[246]-bb[197])/2; 
hleft = nx[220]; 
hright = nx[197]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[197]+' '+bb[197]+' L '+nx[197]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[220]+' '+mid+' L '+nx[220]+' '+bt[220];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[210]=paper.setFinish(); 
lineNodes[210]=[197,220]; 

paper.setStart(); 
mid=bb[197]+(bt[246]-bb[197])/2; 
hleft = nx[134]; 
hright = nx[197]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[134]+' '+mid+' L '+nx[134]+' '+bt[134];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[211]=paper.setFinish(); 
lineNodes[211]=[197,134]; 

paper.setStart(); 
mid=bb[197]+(bt[246]-bb[197])/2; 
s3='M '+nx[246]+' '+mid+' L '+nx[246]+' '+bt[246];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[212]=paper.setFinish(); 
lineNodes[212]=[197,246]; 

paper.setStart(); 
s1='M '+nx[198]+' '+bb[198]+' L '+nx[198]+' '+bt[222]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[213]=paper.setFinish(); 
lineNodes[213]=[198,222] ; 

paper.setStart(); 
s1='M '+nx[198]+' '+bb[198]+' L '+nx[198]+' '+ny[270]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[198]+' '+ny[270]+' L '+nx[134]+' '+ny[270]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[214]=paper.setFinish(); 
lineNodes[214]=[198,270]; 

paper.setStart(); 
mid=bb[199]+(bt[98]-bb[199])/2; 
hleft = nx[98]; 
hright = nx[199]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[199]+' '+bb[199]+' L '+nx[199]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[98]+' '+mid+' L '+nx[98]+' '+bt[98];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[215]=paper.setFinish(); 
lineNodes[215]=[199,98]; 

paper.setStart(); 
mid=bb[199]+(bt[98]-bb[199])/2; 
hleft = nx[219]; 
hright = nx[199]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[219]+' '+mid+' L '+nx[219]+' '+bt[219];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[216]=paper.setFinish(); 
lineNodes[216]=[199,219]; 

paper.setStart(); 
s1='M '+nx[201]+' '+bb[201]+' L '+nx[201]+' '+ny[276]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[217]=paper.setFinish(); 
lineNodes[217]=[201,276]; 

paper.setStart(); 
mid=bb[204]+(bt[242]-bb[204])/2; 
hleft = nx[242]; 
hright = nx[204]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[204]+' '+bb[204]+' L '+nx[204]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[242]+' '+mid+' L '+nx[242]+' '+bt[242];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[218]=paper.setFinish(); 
lineNodes[218]=[204,242]; 

paper.setStart(); 
mid=bb[204]+(bt[242]-bb[204])/2; 
hleft = nx[149]; 
hright = nx[204]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[149]+' '+mid+' L '+nx[149]+' '+bt[149];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[219]=paper.setFinish(); 
lineNodes[219]=[204,149]; 

paper.setStart(); 
mid=bb[204]+(bt[242]-bb[204])/2; 
s3='M '+nx[35]+' '+mid+' L '+nx[35]+' '+bt[35];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[220]=paper.setFinish(); 
lineNodes[220]=[204,35]; 

paper.setStart(); 
mid=bb[204]+(bt[242]-bb[204])/2; 
s3='M '+nx[162]+' '+mid+' L '+nx[162]+' '+bt[162];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[221]=paper.setFinish(); 
lineNodes[221]=[204,162]; 

paper.setStart(); 
s1='M '+nx[205]+' '+bb[205]+' L '+nx[205]+' '+bt[28]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[222]=paper.setFinish(); 
lineNodes[222]=[205,28] ; 

paper.setStart(); 
s1='M '+nx[206]+' '+bb[206]+' L '+nx[206]+' '+bt[33]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[223]=paper.setFinish(); 
lineNodes[223]=[206,33] ; 

paper.setStart(); 
mid=bb[260]+(bt[205]-bb[260])/2; 
s2='M '+nx[211]+' '+bb[211]+' L '+nx[211]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[63]+' '+mid+' L '+nx[63]+' '+bt[63];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[224]=paper.setFinish(); 
lineNodes[224]=[211,63]; 

paper.setStart(); 
mid=bb[260]+(bt[205]-bb[260])/2; 
s3='M '+nx[236]+' '+mid+' L '+nx[236]+' '+bt[236];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[225]=paper.setFinish(); 
lineNodes[225]=[211,236]; 

paper.setStart(); 
mid=bb[260]+(bt[205]-bb[260])/2; 
hleft = nx[109]; 
hright = nx[211]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[109]+' '+mid+' L '+nx[109]+' '+bt[109];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[226]=paper.setFinish(); 
lineNodes[226]=[211,109]; 

paper.setStart(); 
mid=bb[260]+(bt[205]-bb[260])/2; 
hleft = nx[205]; 
hright = nx[211]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[205]+' '+mid+' L '+nx[205]+' '+bt[205];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[227]=paper.setFinish(); 
lineNodes[227]=[211,205]; 

paper.setStart(); 
mid=bb[213]+(bt[130]-bb[213])/2; 
hleft = nx[223]; 
hright = nx[213]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[213]+' '+bb[213]+' L '+nx[213]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[223]+' '+mid+' L '+nx[223]+' '+bt[223];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[228]=paper.setFinish(); 
lineNodes[228]=[213,223]; 

paper.setStart(); 
mid=bb[213]+(bt[130]-bb[213])/2; 
s3='M '+nx[183]+' '+mid+' L '+nx[183]+' '+bt[183];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[229]=paper.setFinish(); 
lineNodes[229]=[213,183]; 

paper.setStart(); 
mid=bb[213]+(bt[130]-bb[213])/2; 
hleft = nx[130]; 
hright = nx[213]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[130]+' '+mid+' L '+nx[130]+' '+bt[130];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[230]=paper.setFinish(); 
lineNodes[230]=[213,130]; 

paper.setStart(); 
s1='M '+nx[214]+' '+bb[214]+' L '+nx[214]+' '+bt[152]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[231]=paper.setFinish(); 
lineNodes[231]=[214,152] ; 

paper.setStart(); 
s1='M '+nx[215]+' '+bb[215]+' L '+nx[215]+' '+ny[272]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[232]=paper.setFinish(); 
lineNodes[232]=[215,272]; 

paper.setStart(); 
mid=bb[216]+(bt[7]-bb[216])/2; 
hleft = nx[7]; 
hright = nx[216]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[216]+' '+bb[216]+' L '+nx[216]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[7]+' '+mid+' L '+nx[7]+' '+bt[7];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[233]=paper.setFinish(); 
lineNodes[233]=[216,7]; 

paper.setStart(); 
mid=bb[216]+(bt[7]-bb[216])/2; 
s3='M '+nx[173]+' '+mid+' L '+nx[173]+' '+bt[173];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[234]=paper.setFinish(); 
lineNodes[234]=[216,173]; 

paper.setStart(); 
mid=bb[216]+(bt[7]-bb[216])/2; 
hleft = nx[26]; 
hright = nx[216]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[26]+' '+mid+' L '+nx[26]+' '+bt[26];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[235]=paper.setFinish(); 
lineNodes[235]=[216,26]; 

paper.setStart(); 
mid=bb[217]+(bt[239]-bb[217])/2; 
hleft = nx[239]; 
hright = nx[217]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[217]+' '+bb[217]+' L '+nx[217]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[239]+' '+mid+' L '+nx[239]+' '+bt[239];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[236]=paper.setFinish(); 
lineNodes[236]=[217,239]; 

paper.setStart(); 
mid=bb[217]+(bt[239]-bb[217])/2; 
s3='M '+nx[235]+' '+mid+' L '+nx[235]+' '+bt[235];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[237]=paper.setFinish(); 
lineNodes[237]=[217,235]; 

paper.setStart(); 
mid=bb[217]+(bt[239]-bb[217])/2; 
hleft = nx[179]; 
hright = nx[217]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[179]+' '+mid+' L '+nx[179]+' '+bt[179];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[238]=paper.setFinish(); 
lineNodes[238]=[217,179]; 

paper.setStart(); 
s1='M '+nx[220]+' '+bb[220]+' L '+nx[220]+' '+bt[198]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[239]=paper.setFinish(); 
lineNodes[239]=[220,198] ; 

paper.setStart(); 
mid=bb[222]+(bt[230]-bb[222])/2; 
hleft = nx[230]; 
hright = nx[222]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[222]+' '+bb[222]+' L '+nx[222]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[230]+' '+mid+' L '+nx[230]+' '+bt[230];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[240]=paper.setFinish(); 
lineNodes[240]=[222,230]; 

paper.setStart(); 
mid=bb[222]+(bt[230]-bb[222])/2; 
s3='M '+nx[261]+' '+mid+' L '+nx[261]+' '+bt[261];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[241]=paper.setFinish(); 
lineNodes[241]=[222,261]; 

paper.setStart(); 
mid=bb[222]+(bt[230]-bb[222])/2; 
s3='M '+nx[68]+' '+mid+' L '+nx[68]+' '+bt[68];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[242]=paper.setFinish(); 
lineNodes[242]=[222,68]; 

paper.setStart(); 
mid=bb[222]+(bt[230]-bb[222])/2; 
hleft = nx[104]; 
hright = nx[222]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[104]+' '+mid+' L '+nx[104]+' '+bt[104];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[243]=paper.setFinish(); 
lineNodes[243]=[222,104]; 

paper.setStart(); 
s1='M '+nx[224]+' '+bb[224]+' L '+nx[224]+' '+bt[12]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[244]=paper.setFinish(); 
lineNodes[244]=[224,12] ; 

paper.setStart(); 
s1='M '+nx[230]+' '+bb[230]+' L '+nx[230]+' '+ny[277]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[230]+' '+ny[277]+' L '+nx[104]+' '+ny[277]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[245]=paper.setFinish(); 
lineNodes[245]=[230,277]; 

paper.setStart(); 
s1='M '+nx[231]+' '+bb[231]+' L '+nx[231]+' '+ny[272]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[231]+' '+ny[272]+' L '+nx[215]+' '+ny[272]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[246]=paper.setFinish(); 
lineNodes[246]=[231,272]; 

paper.setStart(); 
mid=bb[234]+(bt[115]-bb[234])/2; 
hleft = nx[207]; 
hright = nx[234]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[234]+' '+bb[234]+' L '+nx[234]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[207]+' '+mid+' L '+nx[207]+' '+bt[207];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[247]=paper.setFinish(); 
lineNodes[247]=[234,207]; 

paper.setStart(); 
mid=bb[234]+(bt[115]-bb[234])/2; 
hleft = nx[115]; 
hright = nx[234]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[115]+' '+mid+' L '+nx[115]+' '+bt[115];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[248]=paper.setFinish(); 
lineNodes[248]=[234,115]; 

paper.setStart(); 
mid=bb[235]+(bt[23]-bb[235])/2; 
hleft = nx[23]; 
hright = nx[235]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[235]+' '+bb[235]+' L '+nx[235]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[23]+' '+mid+' L '+nx[23]+' '+bt[23];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[249]=paper.setFinish(); 
lineNodes[249]=[235,23]; 

paper.setStart(); 
mid=bb[235]+(bt[23]-bb[235])/2; 
hleft = nx[107]; 
hright = nx[235]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[107]+' '+mid+' L '+nx[107]+' '+bt[107];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[250]=paper.setFinish(); 
lineNodes[250]=[235,107]; 

paper.setStart(); 
mid=bb[236]+(bt[132]-bb[236])/2; 
hleft = nx[47]; 
hright = nx[236]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[236]+' '+bb[236]+' L '+nx[236]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[47]+' '+mid+' L '+nx[47]+' '+bt[47];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[251]=paper.setFinish(); 
lineNodes[251]=[236,47]; 

paper.setStart(); 
mid=bb[236]+(bt[132]-bb[236])/2; 
hleft = nx[132]; 
hright = nx[236]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[132]+' '+mid+' L '+nx[132]+' '+bt[132];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[252]=paper.setFinish(); 
lineNodes[252]=[236,132]; 

paper.setStart(); 
s1='M '+nx[237]+' '+bb[237]+' L '+nx[237]+' '+bt[232]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[253]=paper.setFinish(); 
lineNodes[253]=[237,232] ; 

paper.setStart(); 
mid=bb[239]+(bt[31]-bb[239])/2; 
hleft = nx[70]; 
hright = nx[239]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[239]+' '+bb[239]+' L '+nx[239]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[70]+' '+mid+' L '+nx[70]+' '+bt[70];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[254]=paper.setFinish(); 
lineNodes[254]=[239,70]; 

paper.setStart(); 
mid=bb[239]+(bt[31]-bb[239])/2; 
hleft = nx[31]; 
hright = nx[239]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[31]+' '+mid+' L '+nx[31]+' '+bt[31];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[255]=paper.setFinish(); 
lineNodes[255]=[239,31]; 

paper.setStart(); 
s1='M '+nx[241]+' '+bb[241]+' L '+nx[241]+' '+bt[166]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[256]=paper.setFinish(); 
lineNodes[256]=[241,166] ; 

paper.setStart(); 
mid=bb[242]+(bt[15]-bb[242])/2; 
hleft = nx[194]; 
hright = nx[242]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[242]+' '+bb[242]+' L '+nx[242]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[194]+' '+mid+' L '+nx[194]+' '+bt[194];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[257]=paper.setFinish(); 
lineNodes[257]=[242,194]; 

paper.setStart(); 
mid=bb[242]+(bt[15]-bb[242])/2; 
hleft = nx[15]; 
hright = nx[242]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[15]+' '+mid+' L '+nx[15]+' '+bt[15];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[258]=paper.setFinish(); 
lineNodes[258]=[242,15]; 

paper.setStart(); 
mid=bb[242]+(bt[15]-bb[242])/2; 
s3='M '+nx[69]+' '+mid+' L '+nx[69]+' '+bt[69];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[259]=paper.setFinish(); 
lineNodes[259]=[242,69]; 

paper.setStart(); 
mid=bb[242]+(bt[15]-bb[242])/2; 
s3='M '+nx[72]+' '+mid+' L '+nx[72]+' '+bt[72];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[260]=paper.setFinish(); 
lineNodes[260]=[242,72]; 

paper.setStart(); 
mid=bb[244]+(bt[136]-bb[244])/2; 
hleft = nx[136]; 
hright = nx[244]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[244]+' '+bb[244]+' L '+nx[244]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[136]+' '+mid+' L '+nx[136]+' '+bt[136];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[261]=paper.setFinish(); 
lineNodes[261]=[244,136]; 

paper.setStart(); 
mid=bb[244]+(bt[136]-bb[244])/2; 
hleft = nx[43]; 
hright = nx[244]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[43]+' '+mid+' L '+nx[43]+' '+bt[43];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[262]=paper.setFinish(); 
lineNodes[262]=[244,43]; 

paper.setStart(); 
mid=bb[245]+(bt[24]-bb[245])/2; 
hleft = nx[91]; 
hright = nx[245]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[245]+' '+bb[245]+' L '+nx[245]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[91]+' '+mid+' L '+nx[91]+' '+bt[91];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[263]=paper.setFinish(); 
lineNodes[263]=[245,91]; 

paper.setStart(); 
mid=bb[245]+(bt[24]-bb[245])/2; 
s3='M '+nx[202]+' '+mid+' L '+nx[202]+' '+bt[202];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[264]=paper.setFinish(); 
lineNodes[264]=[245,202]; 

paper.setStart(); 
mid=bb[245]+(bt[24]-bb[245])/2; 
hleft = nx[24]; 
hright = nx[245]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[24]+' '+mid+' L '+nx[24]+' '+bt[24];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[265]=paper.setFinish(); 
lineNodes[265]=[245,24]; 

paper.setStart(); 
s1='M '+nx[248]+' '+bb[248]+' L '+nx[248]+' '+bt[42]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[266]=paper.setFinish(); 
lineNodes[266]=[248,42] ; 

paper.setStart(); 
mid=bb[251]+(bt[145]-bb[251])/2; 
hleft = nx[95]; 
hright = nx[251]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[251]+' '+bb[251]+' L '+nx[251]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[95]+' '+mid+' L '+nx[95]+' '+bt[95];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[267]=paper.setFinish(); 
lineNodes[267]=[251,95]; 

paper.setStart(); 
mid=bb[251]+(bt[145]-bb[251])/2; 
hleft = nx[225]; 
hright = nx[251]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[225]+' '+mid+' L '+nx[225]+' '+bt[225];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[268]=paper.setFinish(); 
lineNodes[268]=[251,225]; 

paper.setStart(); 
mid=bb[251]+(bt[145]-bb[251])/2; 
s3='M '+nx[145]+' '+mid+' L '+nx[145]+' '+bt[145];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[269]=paper.setFinish(); 
lineNodes[269]=[251,145]; 

paper.setStart(); 
mid=bb[254]+(bt[34]-bb[254])/2; 
hleft = nx[143]; 
hright = nx[254]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[254]+' '+bb[254]+' L '+nx[254]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[143]+' '+mid+' L '+nx[143]+' '+bt[143];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[270]=paper.setFinish(); 
lineNodes[270]=[254,143]; 

paper.setStart(); 
mid=bb[254]+(bt[34]-bb[254])/2; 
hleft = nx[193]; 
hright = nx[254]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[193]+' '+mid+' L '+nx[193]+' '+bt[193];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[271]=paper.setFinish(); 
lineNodes[271]=[254,193]; 

paper.setStart(); 
mid=bb[254]+(bt[34]-bb[254])/2; 
s3='M '+nx[147]+' '+mid+' L '+nx[147]+' '+bt[147];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[272]=paper.setFinish(); 
lineNodes[272]=[254,147]; 

paper.setStart(); 
mid=bb[254]+(bt[34]-bb[254])/2; 
s3='M '+nx[34]+' '+mid+' L '+nx[34]+' '+bt[34];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[273]=paper.setFinish(); 
lineNodes[273]=[254,34]; 

paper.setStart(); 
mid=bb[256]+(bt[46]-bb[256])/2; 
s2='M '+nx[256]+' '+bb[256]+' L '+nx[256]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[262]+' '+mid+' L '+nx[262]+' '+bt[262];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[274]=paper.setFinish(); 
lineNodes[274]=[256,262]; 

paper.setStart(); 
mid=bb[256]+(bt[46]-bb[256])/2; 
hleft = nx[46]; 
hright = nx[256]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[46]+' '+mid+' L '+nx[46]+' '+bt[46];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[275]=paper.setFinish(); 
lineNodes[275]=[256,46]; 

paper.setStart(); 
mid=bb[256]+(bt[46]-bb[256])/2; 
hleft = nx[102]; 
hright = nx[256]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[102]+' '+mid+' L '+nx[102]+' '+bt[102];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[276]=paper.setFinish(); 
lineNodes[276]=[256,102]; 

paper.setStart(); 
s1='M '+nx[258]+' '+bb[258]+' L '+nx[258]+' '+ny[269]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[258]+' '+ny[269]+' L '+nx[113]+' '+ny[269]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[277]=paper.setFinish(); 
lineNodes[277]=[258,269]; 

paper.setStart(); 
s1='M '+nx[261]+' '+bb[261]+' L '+nx[261]+' '+ny[277]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[278]=paper.setFinish(); 
lineNodes[278]=[261,277]; 

paper.setStart(); 
s1='M '+nx[263]+' '+bb[263]+' L '+nx[263]+' '+bt[165]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[279]=paper.setFinish(); 
lineNodes[279]=[263,165] ; 

paper.setStart(); 
mid=bb[268]+(bt[215]-bb[268])/2; 
hleft = nx[77]; 
hright = nx[268]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[268]+' '+bb[268]+' L '+nx[268]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[77]+' '+mid+' L '+nx[77]+' '+bt[77];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[280]=paper.setFinish(); 
lineNodes[280]=[268,77]; 

paper.setStart(); 
mid=bb[268]+(bt[215]-bb[268])/2; 
hleft = nx[215]; 
hright = nx[268]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[215]+' '+mid+' L '+nx[215]+' '+bt[215];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[281]=paper.setFinish(); 
lineNodes[281]=[268,215]; 

paper.setStart(); 
mid=bb[269]+(bt[157]-bb[269])/2; 
hleft = nx[128]; 
hright = nx[269]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[269]+' '+bb[269]+' L '+nx[269]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[128]+' '+mid+' L '+nx[128]+' '+bt[128];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[282]=paper.setFinish(); 
lineNodes[282]=[269,128]; 

paper.setStart(); 
mid=bb[269]+(bt[157]-bb[269])/2; 
hleft = nx[157]; 
hright = nx[269]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[157]+' '+mid+' L '+nx[157]+' '+bt[157];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[283]=paper.setFinish(); 
lineNodes[283]=[269,157]; 

paper.setStart(); 
mid=bb[240]+(bt[99]-bb[240])/2; 
hleft = nx[58]; 
hright = nx[270]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[270]+' '+bb[270]+' L '+nx[270]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[58]+' '+mid+' L '+nx[58]+' '+bt[58];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[284]=paper.setFinish(); 
lineNodes[284]=[270,58]; 

paper.setStart(); 
mid=bb[240]+(bt[99]-bb[240])/2; 
s3='M '+nx[71]+' '+mid+' L '+nx[71]+' '+bt[71];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[285]=paper.setFinish(); 
lineNodes[285]=[270,71]; 

paper.setStart(); 
mid=bb[240]+(bt[99]-bb[240])/2; 
s3='M '+nx[76]+' '+mid+' L '+nx[76]+' '+bt[76];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[286]=paper.setFinish(); 
lineNodes[286]=[270,76]; 

paper.setStart(); 
mid=bb[240]+(bt[99]-bb[240])/2; 
hleft = nx[99]; 
hright = nx[270]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[99]+' '+mid+' L '+nx[99]+' '+bt[99];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[287]=paper.setFinish(); 
lineNodes[287]=[270,99]; 

paper.setStart(); 
s1='M '+nx[271]+' '+bb[271]+' L '+nx[271]+' '+bt[133]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[288]=paper.setFinish(); 
lineNodes[288]=[271,133] ; 

paper.setStart(); 
mid=bb[232]+(bt[49]-bb[232])/2; 
s2='M '+nx[272]+' '+bb[272]+' L '+nx[272]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[49]+' '+mid+' L '+nx[49]+' '+bt[49];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[289]=paper.setFinish(); 
lineNodes[289]=[272,49]; 

paper.setStart(); 
mid=bb[232]+(bt[49]-bb[232])/2; 
s3='M '+nx[172]+' '+mid+' L '+nx[172]+' '+bt[172];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[290]=paper.setFinish(); 
lineNodes[290]=[272,172]; 

paper.setStart(); 
mid=bb[232]+(bt[49]-bb[232])/2; 
hleft = nx[48]; 
hright = nx[272]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[48]+' '+mid+' L '+nx[48]+' '+bt[48];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[291]=paper.setFinish(); 
lineNodes[291]=[272,48]; 

paper.setStart(); 
mid=bb[232]+(bt[49]-bb[232])/2; 
hleft = nx[100]; 
hright = nx[272]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[100]+' '+mid+' L '+nx[100]+' '+bt[100];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[292]=paper.setFinish(); 
lineNodes[292]=[272,100]; 

paper.setStart(); 
s1='M '+nx[273]+' '+bb[273]+' L '+nx[273]+' '+bt[155]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[293]=paper.setFinish(); 
lineNodes[293]=[273,155] ; 

paper.setStart(); 
s1='M '+nx[274]+' '+bb[274]+' L '+nx[274]+' '+bt[1]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[294]=paper.setFinish(); 
lineNodes[294]=[274,1] ; 

paper.setStart(); 
s1='M '+nx[275]+' '+bb[275]+' L '+nx[275]+' '+bt[204]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[295]=paper.setFinish(); 
lineNodes[295]=[275,204] ; 

paper.setStart(); 
s1='M '+nx[276]+' '+bb[276]+' L '+nx[276]+' '+bt[22]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[296]=paper.setFinish(); 
lineNodes[296]=[276,22] ; 

paper.setStart(); 
s1='M '+nx[277]+' '+bb[277]+' L '+nx[277]+' '+bt[89]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[297]=paper.setFinish(); 
lineNodes[297]=[277,89] ; 

nlines = 298;
}