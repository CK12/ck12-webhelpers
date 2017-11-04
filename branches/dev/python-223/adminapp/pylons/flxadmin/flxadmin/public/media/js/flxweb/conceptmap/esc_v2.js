function initMap() { 

// Set size parameters 
mapWidth = 20671; 
mapHeight = 3444; 
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
rootx = 11511; 
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

nnodes = 444; 
njunc = 27; 

nx[0]=12962;
ny[0]=1863;
nx[1]=17750;
ny[1]=1118;
nx[2]=9997;
ny[2]=1210;
nx[3]=12323;
ny[3]=1009;
nx[4]=16938;
ny[4]=682;
nx[5]=6953;
ny[5]=1259;
nx[6]=17740;
ny[6]=682;
nx[7]=11165;
ny[7]=1085;
nx[8]=11727;
ny[8]=1273;
nx[9]=6214;
ny[9]=2822;
nx[10]=16131;
ny[10]=1138;
nx[11]=4870;
ny[11]=1316;
nx[12]=1291;
ny[12]=525;
nx[13]=16010;
ny[13]=1243;
nx[14]=20166;
ny[14]=1648;
nx[15]=18232;
ny[15]=995;
nx[16]=13833;
ny[16]=1009;
nx[17]=3809;
ny[17]=720;
nx[18]=15311;
ny[18]=1308;
nx[19]=16255;
ny[19]=1242;
nx[20]=11795;
ny[20]=1121;
nx[21]=12324;
ny[21]=1237;
nx[22]=20106;
ny[22]=2329;
nx[23]=15759;
ny[23]=1170;
nx[24]=16673;
ny[24]=1043;
nx[25]=6732;
ny[25]=3069;
nx[26]=16322;
ny[26]=2553;
nx[27]=18697;
ny[27]=794;
nx[28]=18710;
ny[28]=1990;
nx[29]=13060;
ny[29]=1600;
nx[30]=828;
ny[30]=733;
nx[31]=15760;
ny[31]=861;
nx[32]=2352;
ny[32]=834;
nx[33]=1623;
ny[33]=771;
nx[34]=4311;
ny[34]=1315;
nx[35]=2352;
ny[35]=950;
nx[36]=6859;
ny[36]=1145;
nx[37]=9598;
ny[37]=1093;
nx[38]=7717;
ny[38]=3114;
nx[39]=11511;
ny[39]=100;
nx[40]=16754;
ny[40]=920;
nx[41]=4218;
ny[41]=936;
nx[42]=3999;
ny[42]=1316;
nx[43]=17204;
ny[43]=1024;
nx[44]=14963;
ny[44]=1295;
nx[45]=16286;
ny[45]=880;
nx[46]=13662;
ny[46]=526;
nx[47]=6472;
ny[47]=624;
nx[48]=15759;
ny[48]=1372;
nx[49]=5023;
ny[49]=950;
nx[50]=2192;
ny[50]=949;
nx[51]=13187;
ny[51]=1865;
nx[52]=2525;
ny[52]=951;
nx[53]=3330;
ny[53]=941;
nx[54]=18131;
ny[54]=880;
nx[55]=14910;
ny[55]=890;
nx[56]=7970;
ny[56]=1161;
nx[57]=6011;
ny[57]=2699;
nx[58]=5872;
ny[58]=2698;
nx[59]=12123;
ny[59]=1127;
nx[60]=12765;
ny[60]=1007;
nx[61]=3593;
ny[61]=933;
nx[62]=17742;
ny[62]=794;
nx[63]=315;
ny[63]=1404;
nx[64]=4898;
ny[64]=829;
nx[65]=16063;
ny[65]=995;
nx[66]=12901;
ny[66]=1599;
nx[67]=13760;
ny[67]=1243;
nx[68]=15945;
ny[68]=523;
nx[69]=8218;
ny[69]=1161;
nx[70]=6836;
ny[70]=2941;
nx[71]=5193;
ny[71]=839;
nx[72]=16121;
ny[72]=661;
nx[73]=3862;
ny[73]=1562;
nx[74]=11000;
ny[74]=1206;
nx[75]=16193;
ny[75]=995;
nx[76]=6718;
ny[76]=2706;
nx[77]=3212;
ny[77]=1109;
nx[78]=2755;
ny[78]=939;
nx[79]=14339;
ny[79]=1291;
nx[80]=15233;
ny[80]=1449;
nx[81]=7049;
ny[81]=3155;
nx[82]=18844;
ny[82]=1750;
nx[83]=6623;
ny[83]=3213;
nx[84]=6276;
ny[84]=1839;
nx[85]=18234;
ny[85]=1197;
nx[86]=7128;
ny[86]=794;
nx[87]=16845;
ny[87]=1051;
nx[88]=1480;
ny[88]=1108;
nx[89]=13134;
ny[89]=1339;
nx[90]=2350;
ny[90]=638;
nx[91]=5751;
ny[91]=735;
nx[92]=7921;
ny[92]=3237;
nx[93]=4217;
ny[93]=730;
nx[94]=7043;
ny[94]=2831;
nx[95]=3219;
ny[95]=823;
nx[96]=16009;
ny[96]=1995;
nx[97]=18294;
ny[97]=1989;
nx[98]=1891;
ny[98]=838;
nx[99]=595;
ny[99]=630;
nx[100]=3563;
ny[100]=1417;
nx[101]=9245;
ny[101]=1090;
nx[102]=15093;
ny[102]=1295;
nx[103]=5896;
ny[103]=737;
nx[104]=11727;
ny[104]=1385;
nx[105]=19407;
ny[105]=793;
nx[106]=3719;
ny[106]=1313;
nx[107]=16235;
ny[107]=2216;
nx[108]=1624;
ny[108]=890;
nx[109]=7806;
ny[109]=2861;
nx[110]=6928;
ny[110]=1844;
nx[111]=18039;
ny[111]=1202;
nx[112]=6482;
ny[112]=882;
nx[113]=12428;
ny[113]=1342;
nx[114]=12983;
ny[114]=1338;
nx[115]=17400;
ny[115]=1021;
nx[116]=3873;
ny[116]=624;
nx[117]=6918;
ny[117]=889;
nx[118]=10156;
ny[118]=1210;
nx[119]=7907;
ny[119]=1054;
nx[120]=12514;
ny[120]=1128;
nx[121]=8555;
ny[121]=1158;
nx[122]=4590;
ny[122]=1316;
nx[123]=15310;
ny[123]=1187;
nx[124]=8467;
ny[124]=1046;
nx[125]=3860;
ny[125]=1186;
nx[126]=11937;
ny[126]=1122;
nx[127]=19407;
ny[127]=1160;
nx[128]=12767;
ny[128]=1349;
nx[129]=10016;
ny[129]=698;
nx[130]=17747;
ny[130]=1006;
nx[131]=318;
ny[131]=733;
nx[132]=19105;
ny[132]=794;
nx[133]=11168;
ny[133]=1328;
nx[134]=19417;
ny[134]=1996;
nx[135]=9426;
ny[135]=831;
nx[136]=9388;
ny[136]=1211;
nx[137]=9338;
ny[137]=1385;
nx[138]=10608;
ny[138]=947;
nx[139]=6056;
ny[139]=623;
nx[140]=7049;
ny[140]=3047;
nx[141]=6557;
ny[141]=1039;
nx[142]=19407;
ny[142]=1047;
nx[143]=6266;
ny[143]=756;
nx[144]=19410;
ny[144]=1361;
nx[145]=6716;
ny[145]=2388;
nx[146]=10609;
ny[146]=1091;
nx[147]=16940;
ny[147]=916;
nx[148]=6013;
ny[148]=2942;
nx[149]=7219;
ny[149]=944;
nx[150]=7217;
ny[150]=695;
nx[151]=18233;
ny[151]=1096;
nx[152]=18130;
ny[152]=777;
nx[153]=15576;
ny[153]=1582;
nx[154]=7906;
ny[154]=947;
nx[155]=594;
ny[155]=533;
nx[156]=14494;
ny[156]=1292;
nx[157]=16011;
ny[157]=2551;
nx[158]=6630;
ny[158]=2829;
nx[159]=3136;
ny[159]=940;
nx[160]=15023;
ny[160]=1057;
nx[161]=4732;
ny[161]=1316;
nx[162]=5733;
ny[162]=2697;
nx[163]=14642;
ny[163]=1299;
nx[164]=314;
ny[164]=1304;
nx[165]=20310;
ny[165]=1865;
nx[166]=5671;
ny[166]=625;
nx[167]=6768;
ny[167]=880;
nx[168]=12766;
ny[168]=1243;
nx[169]=13662;
ny[169]=878;
nx[170]=6560;
ny[170]=1256;
nx[171]=2850;
ny[171]=824;
nx[172]=9604;
ny[172]=1669;
nx[173]=3563;
ny[173]=1313;
nx[174]=16255;
ny[174]=1534;
nx[175]=18824;
ny[175]=793;
nx[176]=3218;
ny[176]=626;
nx[177]=678;
ny[177]=731;
nx[178]=4897;
ny[178]=725;
nx[179]=16146;
ny[179]=1797;
nx[180]=13056;
ny[180]=1237;
nx[181]=9427;
ny[181]=951;
nx[182]=16164;
ny[182]=2551;
nx[183]=13665;
ny[183]=986;
nx[184]=19603;
ny[184]=792;
nx[185]=19126;
ny[185]=1994;
nx[186]=20167;
ny[186]=1865;
nx[187]=4795;
ny[187]=948;
nx[188]=6713;
ny[188]=1598;
nx[189]=18431;
ny[189]=1990;
nx[190]=1383;
ny[190]=655;
nx[191]=8663;
ny[191]=1052;
nx[192]=20024;
ny[192]=1865;
nx[193]=9341;
ny[193]=1495;
nx[194]=7746;
ny[194]=3241;
nx[195]=16165;
ny[195]=2440;
nx[196]=18988;
ny[196]=1993;
nx[197]=15409;
ny[197]=1449;
nx[198]=16163;
ny[198]=2343;
nx[199]=13491;
ny[199]=1094;
nx[200]=1065;
ny[200]=652;
nx[201]=7603;
ny[201]=946;
nx[202]=6856;
ny[202]=1406;
nx[203]=11329;
ny[203]=1207;
nx[204]=7382;
ny[204]=2852;
nx[205]=7601;
ny[205]=2619;
nx[206]=3592;
ny[206]=732;
nx[207]=6517;
ny[207]=2199;
nx[208]=16152;
ny[208]=2118;
nx[209]=19273;
ny[209]=793;
nx[210]=9165;
ny[210]=1384;
nx[211]=8168;
ny[211]=948;
nx[212]=501;
ny[212]=733;
nx[213]=6057;
ny[213]=736;
nx[214]=18965;
ny[214]=794;
nx[215]=11888;
ny[215]=1386;
nx[216]=18038;
ny[216]=1097;
nx[217]=7457;
ny[217]=2960;
nx[218]=4926;
ny[218]=1189;
nx[219]=10312;
ny[219]=1088;
nx[220]=9601;
ny[220]=1201;
nx[221]=2052;
ny[221]=838;
nx[222]=20254;
ny[222]=2329;
nx[223]=12838;
ny[223]=1114;
nx[224]=7962;
ny[224]=2964;
nx[225]=8382;
ny[225]=1158;
nx[226]=16090;
ny[226]=2216;
nx[227]=13974;
ny[227]=1009;
nx[228]=18292;
ny[228]=1876;
nx[229]=6703;
ny[229]=747;
nx[230]=1222;
ny[230]=648;
nx[231]=7296;
ny[231]=2959;
nx[232]=19407;
ny[232]=686;
nx[233]=16125;
ny[233]=879;
nx[234]=6714;
ny[234]=1702;
nx[235]=14722;
ny[235]=1177;
nx[236]=6558;
ny[236]=1145;
nx[237]=8096;
ny[237]=1161;
nx[238]=7769;
ny[238]=948;
nx[239]=15118;
ny[239]=897;
nx[240]=15011;
ny[240]=749;
nx[241]=6215;
ny[241]=2941;
nx[242]=16939;
ny[242]=789;
nx[243]=7101;
ny[243]=1851;
nx[244]=11166;
ny[244]=1206;
nx[245]=16255;
ny[245]=1340;
nx[246]=16846;
ny[246]=1176;
nx[247]=18035;
ny[247]=996;
nx[248]=8552;
ny[248]=947;
nx[249]=6524;
ny[249]=3068;
nx[250]=2353;
ny[250]=734;
nx[251]=19413;
ny[251]=1467;
nx[252]=12531;
ny[252]=745;
nx[253]=3576;
ny[253]=518;
nx[254]=3861;
ny[254]=1314;
nx[255]=4453;
ny[255]=1315;
nx[256]=8940;
ny[256]=1050;
nx[257]=6715;
ny[257]=1847;
nx[258]=7921;
ny[258]=3114;
nx[259]=6043;
ny[259]=2078;
nx[260]=10608;
ny[260]=841;
nx[261]=16012;
ny[261]=1349;
nx[262]=8116;
ny[262]=787;
nx[263]=4142;
ny[263]=1316;
nx[264]=318;
ny[264]=1051;
nx[265]=15758;
ny[265]=765;
nx[266]=318;
ny[266]=840;
nx[267]=6515;
ny[267]=1955;
nx[268]=10754;
ny[268]=1092;
nx[269]=11511;
ny[269]=192;
nx[270]=9533;
ny[270]=1304;
nx[271]=9994;
ny[271]=969;
nx[272]=19557;
ny[272]=1996;
nx[273]=18235;
ny[273]=1415;
nx[274]=200;
ny[274]=1173;
nx[275]=14814;
ny[275]=1293;
nx[276]=19124;
ny[276]=527;
nx[277]=10832;
ny[277]=1202;
nx[278]=4590;
ny[278]=1189;
nx[279]=4896;
ny[279]=623;
nx[280]=18128;
ny[280]=674;
nx[281]=15247;
ny[281]=1587;
nx[282]=7962;
ny[282]=787;
nx[283]=16255;
ny[283]=1641;
nx[284]=6043;
ny[284]=1954;
nx[285]=8942;
ny[285]=1263;
nx[286]=14253;
ny[286]=1008;
nx[287]=9997;
ny[287]=1080;
nx[288]=12531;
ny[288]=864;
nx[289]=15333;
ny[289]=893;
nx[290]=13056;
ny[290]=1123;
nx[291]=19273;
ny[291]=1997;
nx[292]=13422;
ny[292]=885;
nx[293]=7639;
ny[293]=2963;
nx[294]=1967;
ny[294]=741;
nx[295]=19478;
ny[295]=1877;
nx[296]=1621;
ny[296]=656;
nx[297]=19960;
ny[297]=2330;
nx[298]=16148;
ny[298]=1889;
nx[299]=18824;
ny[299]=675;
nx[300]=10478;
ny[300]=1090;
nx[301]=13423;
ny[301]=996;
nx[302]=18848;
ny[302]=1990;
nx[303]=13056;
ny[303]=1014;
nx[304]=16289;
ny[304]=1994;
nx[305]=17139;
ny[305]=917;
nx[306]=20171;
ny[306]=2215;
nx[307]=6411;
ny[307]=2937;
nx[308]=15759;
ny[308]=1484;
nx[309]=16254;
ny[309]=1433;
nx[310]=13672;
ny[310]=1459;
nx[311]=20471;
ny[311]=1865;
nx[312]=8091;
ny[312]=3238;
nx[313]=13220;
ny[313]=1595;
nx[314]=2850;
ny[314]=723;
nx[315]=11575;
ny[315]=1384;
nx[316]=9864;
ny[316]=1209;
nx[317]=1967;
ny[317]=644;
nx[318]=7844;
ny[318]=1163;
nx[319]=15757;
ny[319]=661;
nx[320]=10680;
ny[320]=1211;
nx[321]=8033;
ny[321]=690;
nx[322]=17740;
ny[322]=523;
nx[323]=15759;
ny[323]=1275;
nx[324]=19883;
ny[324]=1863;
nx[325]=6858;
ny[325]=1042;
nx[326]=5872;
ny[326]=2592;
nx[327]=13862;
ny[327]=1461;
nx[328]=13350;
ny[328]=1092;
nx[329]=20170;
ny[329]=2113;
nx[330]=14112;
ny[330]=883;
nx[331]=18575;
ny[331]=793;
nx[332]=5819;
ny[332]=626;
nx[333]=9603;
ny[333]=1452;
nx[334]=4214;
ny[334]=623;
nx[335]=1553;
ny[335]=1007;
nx[336]=318;
ny[336]=945;
nx[337]=3592;
ny[337]=836;
nx[338]=5193;
ny[338]=729;
nx[339]=4217;
ny[339]=837;
nx[340]=17276;
ny[340]=1127;
nx[341]=11655;
ny[341]=1120;
nx[342]=7602;
ny[342]=2726;
nx[343]=6757;
ny[343]=1256;
nx[344]=17070;
ny[344]=1022;
nx[345]=3218;
ny[345]=722;
nx[346]=6717;
ny[346]=2488;
nx[347]=7715;
ny[347]=1164;
nx[348]=15759;
ny[348]=958;
nx[349]=20439;
ny[349]=2330;
nx[350]=7304;
ny[350]=794;
nx[351]=18840;
ny[351]=1649;
nx[352]=6717;
ny[352]=2603;
nx[353]=13062;
ny[353]=1756;
nx[354]=16124;
ny[354]=768;
nx[355]=5143;
ny[355]=1191;
nx[356]=7046;
ny[356]=2941;
nx[357]=9102;
ny[357]=1209;
nx[358]=8940;
ny[358]=948;
nx[359]=8092;
ny[359]=3344;
nx[360]=13760;
ny[360]=1343;
nx[361]=5190;
ny[361]=623;
nx[362]=17529;
ny[362]=1128;
nx[363]=5026;
ny[363]=1076;
nx[364]=17745;
ny[364]=896;
nx[365]=9246;
ny[365]=1210;
nx[366]=19698;
ny[366]=1995;
nx[367]=6629;
ny[367]=2946;
nx[368]=12241;
ny[368]=1341;
nx[369]=15971;
ny[369]=880;
nx[370]=11519;
ny[370]=1119;
nx[371]=6561;
ny[371]=1364;
nx[372]=17399;
ny[372]=918;
nx[373]=3959;
ny[373]=728;
nx[374]=11724;
ny[374]=1010;
nx[375]=18155;
ny[375]=1989;
nx[376]=8475;
ny[376]=513;
nx[377]=5932;
ny[377]=504;
nx[378]=6516;
ny[378]=2076;
nx[379]=5872;
ny[379]=2832;
nx[380]=15409;
ny[380]=1587;
nx[381]=20169;
ny[381]=2016;
nx[382]=9684;
ny[382]=1305;
nx[383]=14113;
ny[383]=1008;
nx[384]=16567;
ny[384]=915;
nx[385]=438;
ny[385]=1176;
nx[386]=19554;
ny[386]=898;
nx[387]=18234;
ny[387]=1303;
nx[388]=19411;
ny[388]=1255;
nx[389]=2958;
ny[389]=939;
nx[390]=13059;
ny[390]=1476;
nx[391]=7585;
ny[391]=1164;
nx[392]=5520;
ny[392]=624;
nx[393]=13662;
ny[393]=748;
nx[394]=6835;
ny[394]=2828;
nx[395]=1633;
ny[395]=1109;
nx[396]=12323;
ny[396]=1128;
nx[397]=14734;
ny[397]=891;
nx[398]=4218;
ny[398]=1031;
nx[399]=18845;
ny[399]=1879;
nx[400]=15759;
ny[400]=1059;
nx[401]=6627;
ny[401]=881;
nx[402]=7439;
ny[402]=946;
nx[403]=20166;
ny[403]=1754;
nx[404]=6266;
ny[404]=881;
nx[405]=14397;
ny[405]=1009;
nx[406]=9603;
ny[406]=1556;
nx[407]=12696;
ny[407]=1113;
nx[408]=17400;
ny[408]=1128;
nx[409]=18572;
ny[409]=1990;
nx[410]=10156;
ny[410]=1317;
nx[411]=6276;
ny[411]=1949;
nx[412]=7806;
ny[412]=2963;
nx[413]=19706;
ny[413]=898;
nx[414]=8941;
ny[414]=1143;
nx[415]=1706;
ny[415]=1006;
nx[416]=16149;
ny[416]=1993;
nx[417]=20166;
ny[417]=1934;
nx[418]=16145;
ny[418]=1724;
nx[419]=6703;
ny[419]=944;
nx[420]=13060;
ny[420]=1683;
nx[421]=16161;
ny[421]=2267;
nx[422]=7806;
ny[422]=3023;
nx[423]=16130;
ny[423]=1061;
nx[424]=6713;
ny[424]=1503;
nx[425]=11166;
ny[425]=1255;
nx[426]=13059;
ny[426]=1389;
nx[427]=314;
ny[427]=1227;
nx[428]=9246;
ny[428]=1295;
nx[429]=11726;
ny[429]=1178;
nx[430]=3861;
ny[430]=1470;
nx[431]=6854;
ny[431]=1329;
nx[432]=19406;
ny[432]=965;
nx[433]=6715;
ny[433]=2286;
nx[434]=12766;
ny[434]=1160;
nx[435]=5872;
ny[435]=2753;
nx[436]=16148;
ny[436]=2041;
nx[437]=15022;
ny[437]=980;
nx[438]=13760;
ny[438]=1152;
nx[439]=8036;
ny[439]=850;
nx[440]=3211;
ny[440]=1020;
nx[441]=9602;
ny[441]=1367;
nx[442]=6622;
ny[442]=3141;
nx[443]=7218;
ny[443]=854;

// snapGrid(); 
} 

function family(i) { 

var members = new Array(); 

members[0]=[353, 51]; 
members[1]=[130]; 
members[2]=[316, 118, 287]; 
members[3]=[288, 396, 303, 374, 120, 59, 60]; 
members[4]=[280, 242, 322, 6]; 
members[5]=[343, 36, 431]; 
members[6]=[280, 322, 4, 62]; 
members[7]=[268, 74, 203, 300, 146, 244, 219, 138]; 
members[8]=[104, 315, 429, 215]; 
members[9]=[394, 76, 241, 307, 148, 158, 94]; 
members[10]=[19, 13, 423]; 
members[11]=[161, 34, 278, 122, 255]; 
members[12]=[322, 68, 230, 200, 269, 46, 296, 276, 376, 377, 155, 253, 190]; 
members[13]=[10, 19, 261]; 
members[14]=[351, 403, 251]; 
members[15]=[247, 54, 151]; 
members[16]=[227, 330, 405, 438, 286, 383]; 
members[17]=[116, 373]; 
members[18]=[80, 123, 197]; 
members[19]=[10, 245, 13]; 
members[20]=[429, 370, 341, 374, 126]; 
members[21]=[368, 113, 396]; 
members[22]=[297, 306, 349, 222]; 
members[23]=[400, 323]; 
members[24]=[40, 87]; 
members[25]=[249, 442, 367]; 
members[26]=[195, 157, 182]; 
members[27]=[299, 132, 331, 175, 214]; 
members[28]=[196, 302, 399, 185, 409]; 
members[29]=[313, 66, 420, 390]; 
members[30]=[177, 99, 212, 131]; 
members[31]=[265, 348]; 
members[32]=[50, 35, 52, 250]; 
members[33]=[296, 108]; 
members[34]=[161, 11, 278, 122, 255]; 
members[35]=[32, 50, 52]; 
members[36]=[5, 325, 343]; 
members[37]=[220, 181, 101]; 
members[38]=[258, 422]; 
members[39]=[269]; 
members[40]=[384, 305, 242, 147, 372, 87, 24]; 
members[41]=[339, 398]; 
members[42]=[263, 106, 173, 430, 125, 254]; 
members[43]=[344, 305]; 
members[44]=[163, 102, 235, 79, 275, 156]; 
members[45]=[233, 354, 369]; 
members[46]=[322, 68, 393, 12, 269, 240, 276, 376, 377, 155, 252, 253]; 
members[47]=[229, 166, 392, 139, 332, 377, 143]; 
members[48]=[323, 308]; 
members[49]=[64, 363, 187]; 
members[50]=[32, 35, 52]; 
members[51]=[0, 353]; 
members[52]=[32, 50, 35]; 
members[53]=[440, 159, 95]; 
members[54]=[152, 247, 15]; 
members[55]=[289, 397, 239, 240, 437]; 
members[56]=[69, 391, 237, 119, 347, 318]; 
members[57]=[162, 435, 58, 326]; 
members[58]=[57, 162, 435, 326]; 
members[59]=[120, 3, 396]; 
members[60]=[288, 3, 303, 374, 407, 223]; 
members[61]=[440, 337]; 
members[62]=[364, 6]; 
members[63]=[164]; 
members[64]=[49, 178, 187]; 
members[65]=[233, 75, 423]; 
members[66]=[313, 420, 29, 390]; 
members[67]=[360, 438]; 
members[68]=[322, 72, 12, 269, 46, 276, 376, 377, 155, 253, 319]; 
members[69]=[391, 237, 119, 56, 347, 318]; 
members[70]=[394]; 
members[71]=[338]; 
members[72]=[354, 68, 319]; 
members[73]=[430]; 
members[74]=[425, 203, 244, 7]; 
members[75]=[233, 65, 423]; 
members[76]=[352, 9, 394, 94, 158]; 
members[77]=[440]; 
members[78]=[440, 171, 389]; 
members[79]=[163, 102, 235, 44, 275, 156]; 
members[80]=[18, 197]; 
members[81]=[140]; 
members[82]=[351, 295, 228, 399]; 
members[83]=[442]; 
members[84]=[257, 234, 267, 110, 243, 411, 284]; 
members[85]=[387, 151]; 
members[86]=[443, 350, 150]; 
members[87]=[40, 24, 246]; 
members[88]=[395, 335]; 
members[89]=[426, 180, 114]; 
members[90]=[361, 334, 253, 176, 116, 317, 279, 250]; 
members[91]=[332, 103]; 
members[92]=[312, 258, 194]; 
members[93]=[339, 334]; 
members[94]=[356, 9, 394, 76, 158]; 
members[95]=[345, 53, 159]; 
members[96]=[416, 304, 298, 436]; 
members[97]=[228, 189, 375]; 
members[98]=[221, 294]; 
members[99]=[177, 131, 212, 155, 30]; 
members[100]=[173, 430]; 
members[101]=[37, 357, 136, 365, 181]; 
members[102]=[163, 235, 44, 79, 275, 156]; 
members[103]=[91, 332]; 
members[104]=[8, 315, 215]; 
members[105]=[432, 232, 184, 209]; 
members[106]=[263, 173, 430, 125, 42, 254]; 
members[107]=[208, 226, 421]; 
members[108]=[33, 335, 415]; 
members[109]=[224, 293, 204, 342, 412]; 
members[110]=[257, 234, 433, 243, 84]; 
members[111]=[216]; 
members[112]=[419, 229, 167, 401, 117]; 
members[113]=[368, 21]; 
members[114]=[89, 426, 180]; 
members[115]=[408, 372, 362, 340]; 
members[116]=[361, 334, 317, 176, 17, 373, 279, 90, 253]; 
members[117]=[419, 229, 167, 112, 401]; 
members[118]=[410, 316, 2, 287]; 
members[119]=[69, 391, 237, 56, 154, 347, 318]; 
members[120]=[59, 3, 396]; 
members[121]=[225, 124]; 
members[122]=[161, 34, 11, 278, 255]; 
members[123]=[160, 18, 235]; 
members[124]=[248, 225, 191, 121]; 
members[125]=[263, 106, 173, 398, 278, 42, 254]; 
members[126]=[429, 370, 20, 341, 374]; 
members[127]=[388, 142]; 
members[128]=[168]; 
members[129]=[260, 321, 135, 150, 376]; 
members[130]=[1, 364]; 
members[131]=[99, 266, 177, 212, 30]; 
members[132]=[299, 331, 175, 214, 27]; 
members[133]=[425]; 
members[134]=[272, 291, 366, 295]; 
members[135]=[129, 260, 358, 271, 181]; 
members[136]=[365, 428, 101, 357]; 
members[137]=[193, 210, 428]; 
members[138]=[260, 7, 300, 268, 146, 219]; 
members[139]=[166, 392, 332, 47, 213, 377]; 
members[140]=[81, 356]; 
members[141]=[419, 236, 325]; 
members[142]=[432, 127]; 
members[143]=[404, 229, 47]; 
members[144]=[251, 388]; 
members[145]=[433, 346]; 
members[146]=[7, 300, 138, 268, 219]; 
members[147]=[384, 40, 305, 242, 372]; 
members[148]=[9, 307, 241]; 
members[149]=[443]; 
members[150]=[129, 86, 321, 376, 350]; 
members[151]=[85, 15]; 
members[152]=[280, 54]; 
members[153]=[281, 380, 197]; 
members[154]=[201, 119, 238, 402, 211, 439, 248]; 
members[155]=[322, 99, 68, 12, 269, 46, 276, 376, 377, 253]; 
members[156]=[163, 102, 235, 44, 79, 275]; 
members[157]=[26, 195, 182]; 
members[158]=[9, 394, 76, 367, 94]; 
members[159]=[440, 53, 95]; 
members[160]=[123, 437, 235]; 
members[161]=[34, 11, 278, 122, 255]; 
members[162]=[57, 435, 58, 326]; 
members[163]=[102, 235, 44, 79, 275, 156]; 
members[164]=[427, 63]; 
members[165]=[192, 417, 324, 403, 311, 186]; 
members[166]=[392, 139, 332, 47, 377]; 
members[167]=[419, 229, 112, 401, 117]; 
members[168]=[128, 434]; 
members[169]=[393, 330, 292, 183]; 
members[170]=[371, 236]; 
members[171]=[314, 389, 78]; 
members[172]=[406]; 
members[173]=[100, 263, 106, 125, 42, 254]; 
members[174]=[283, 309]; 
members[175]=[299, 132, 331, 214, 27]; 
members[176]=[361, 317, 206, 253, 116, 334, 279, 345, 314, 90]; 
members[177]=[99, 212, 131, 30]; 
members[178]=[64, 279]; 
members[179]=[298, 418]; 
members[180]=[89, 114, 290]; 
members[181]=[101, 358, 135, 271, 37]; 
members[182]=[26, 195, 157]; 
members[183]=[169, 438]; 
members[184]=[386, 232, 105, 209, 413]; 
members[185]=[196, 302, 399, 409, 28]; 
members[186]=[192, 417, 324, 165, 403, 311]; 
members[187]=[64, 49]; 
members[188]=[424, 234]; 
members[189]=[97, 228, 375]; 
members[190]=[200, 296, 12, 230]; 
members[191]=[248, 124]; 
members[192]=[417, 324, 165, 403, 311, 186]; 
members[193]=[137]; 
members[194]=[312, 258, 92]; 
members[195]=[198, 26, 157, 182]; 
members[196]=[302, 399, 185, 409, 28]; 
members[197]=[80, 18, 153, 281, 380]; 
members[198]=[195, 421]; 
members[199]=[328, 301, 438]; 
members[200]=[296, 12, 230, 190]; 
members[201]=[238, 402, 211, 439, 248, 154]; 
members[202]=[424, 431]; 
members[203]=[425, 74, 244, 7]; 
members[204]=[217, 109, 342, 231]; 
members[205]=[352, 346, 326, 342]; 
members[206]=[176, 337, 314, 345]; 
members[207]=[433, 378]; 
members[208]=[226, 107, 436]; 
members[209]=[432, 232, 184, 105]; 
members[210]=[137, 428]; 
members[211]=[201, 238, 402, 439, 248, 154]; 
members[212]=[177, 99, 131, 30]; 
members[213]=[139]; 
members[214]=[299, 132, 331, 175, 27]; 
members[215]=[8, 104, 315]; 
members[216]=[247, 111]; 
members[217]=[204, 231]; 
members[218]=[355, 363]; 
members[219]=[7, 300, 138, 268, 146]; 
members[220]=[270, 382, 37]; 
members[221]=[98, 294]; 
members[222]=[297, 306, 22, 349]; 
members[223]=[434, 407, 60]; 
members[224]=[412, 109, 422, 293]; 
members[225]=[124, 121]; 
members[226]=[208, 107, 421]; 
members[227]=[330, 16, 405, 438, 286, 383]; 
members[228]=[97, 295, 399, 82, 375, 189]; 
members[229]=[167, 47, 112, 401, 117, 143]; 
members[230]=[200, 296, 12, 190]; 
members[231]=[217, 204]; 
members[232]=[105, 299, 209, 276, 184]; 
members[233]=[65, 354, 75, 45, 369]; 
members[234]=[257, 110, 243, 84, 188]; 
members[235]=[160, 163, 102, 44, 79, 275, 123, 156]; 
members[236]=[170, 141]; 
members[237]=[69, 391, 119, 56, 347, 318]; 
members[238]=[201, 402, 211, 439, 248, 154]; 
members[239]=[289, 397, 240, 437, 55]; 
members[240]=[289, 393, 397, 46, 239, 55, 252]; 
members[241]=[9, 307, 148]; 
members[242]=[384, 4, 40, 305, 147, 372]; 
members[243]=[257, 234, 110, 433, 84]; 
members[244]=[425, 74, 203, 7]; 
members[245]=[19, 309]; 
members[246]=[87]; 
members[247]=[216, 54, 15]; 
members[248]=[201, 238, 402, 211, 439, 154, 124, 191]; 
members[249]=[442, 25, 367]; 
members[250]=[32, 90]; 
members[251]=[144, 14, 351]; 
members[252]=[288, 393, 240, 46]; 
members[253]=[322, 68, 276, 361, 12, 269, 334, 176, 116, 46, 279, 376, 377, 90, 155, 317]; 
members[254]=[263, 106, 173, 430, 125, 42]; 
members[255]=[161, 34, 11, 278, 122]; 
members[256]=[358, 414]; 
members[257]=[234, 110, 433, 243, 84]; 
members[258]=[194, 422, 38, 312, 92]; 
members[259]=[433, 284]; 
members[260]=[129, 138, 135]; 
members[261]=[418, 13]; 
members[262]=[321, 282, 439]; 
members[263]=[106, 173, 430, 125, 42, 254]; 
members[264]=[336, 385, 274]; 
members[265]=[319, 31]; 
members[266]=[336, 131]; 
members[267]=[284, 378, 84, 411]; 
members[268]=[320, 7, 138, 300, 146, 277, 219]; 
members[269]=[322, 68, 39, 12, 46, 276, 376, 377, 155, 253]; 
members[270]=[441, 220, 382]; 
members[271]=[135, 181, 358, 287]; 
members[272]=[291, 366, 134, 295]; 
members[273]=[387]; 
members[274]=[264, 385, 427]; 
members[275]=[163, 102, 235, 44, 79, 156]; 
members[276]=[322, 68, 232, 299, 12, 269, 46, 376, 377, 155, 253]; 
members[277]=[320, 268]; 
members[278]=[161, 34, 11, 398, 122, 125, 255]; 
members[279]=[361, 334, 317, 176, 178, 116, 90, 253]; 
members[280]=[152, 322, 4, 6]; 
members[281]=[380, 197, 153]; 
members[282]=[321, 262, 439]; 
members[283]=[418, 174]; 
members[284]=[267, 259, 84, 411]; 
members[285]=[414]; 
members[286]=[227, 330, 16, 405, 438, 383]; 
members[287]=[2, 316, 118, 271]; 
members[288]=[3, 60, 303, 374, 252]; 
members[289]=[397, 239, 240, 437, 55]; 
members[290]=[180, 303]; 
members[291]=[272, 366, 134, 295]; 
members[292]=[393, 330, 301, 169]; 
members[293]=[224, 412, 109, 422]; 
members[294]=[98, 221, 317]; 
members[295]=[291, 228, 134, 366, 399, 272, 82]; 
members[296]=[33, 230, 200, 12, 190]; 
members[297]=[306, 22, 349, 222]; 
members[298]=[416, 304, 179, 96]; 
members[299]=[132, 232, 331, 175, 276, 214, 27]; 
members[300]=[7, 138, 268, 146, 219]; 
members[301]=[328, 292, 199]; 
members[302]=[196, 399, 185, 409, 28]; 
members[303]=[288, 290, 3, 374, 60]; 
members[304]=[416, 298, 436, 96]; 
members[305]=[384, 40, 43, 242, 147, 372, 344]; 
members[306]=[297, 22, 329, 349, 222]; 
members[307]=[9, 148, 241]; 
members[308]=[48]; 
members[309]=[245, 174]; 
members[310]=[360, 327]; 
members[311]=[192, 417, 324, 165, 403, 186]; 
members[312]=[258, 92, 194, 359]; 
members[313]=[66, 420, 29, 390]; 
members[314]=[176, 345, 171, 206]; 
members[315]=[8, 104, 215]; 
members[316]=[2, 118, 287]; 
members[317]=[294, 361, 334, 176, 116, 279, 90, 253]; 
members[318]=[69, 391, 237, 119, 56, 347]; 
members[319]=[72, 265, 68]; 
members[320]=[268, 277]; 
members[321]=[129, 262, 150, 376, 282]; 
members[322]=[68, 4, 6, 12, 269, 46, 376, 276, 280, 377, 155, 253]; 
members[323]=[48, 23]; 
members[324]=[192, 417, 165, 403, 311, 186]; 
members[325]=[419, 36, 141]; 
members[326]=[352, 162, 205, 57, 346, 58]; 
members[327]=[360, 310]; 
members[328]=[301, 438, 199]; 
members[329]=[306, 381]; 
members[330]=[227, 292, 393, 16, 405, 169, 286, 383]; 
members[331]=[299, 132, 175, 214, 27]; 
members[332]=[166, 103, 392, 139, 47, 377, 91]; 
members[333]=[441, 406]; 
members[334]=[361, 253, 176, 116, 317, 279, 90, 93]; 
members[335]=[88, 395, 108, 415]; 
members[336]=[264, 266]; 
members[337]=[61, 206]; 
members[338]=[361, 71]; 
members[339]=[41, 93]; 
members[340]=[408, 362, 115]; 
members[341]=[429, 370, 20, 374, 126]; 
members[342]=[204, 109, 205]; 
members[343]=[36, 5, 431]; 
members[344]=[305, 43]; 
members[345]=[176, 314, 206, 95]; 
members[346]=[352, 145, 205, 326]; 
members[347]=[69, 391, 237, 119, 56, 318]; 
members[348]=[400, 31]; 
members[349]=[297, 306, 22, 222]; 
members[350]=[443, 86, 150]; 
members[351]=[82, 251, 14]; 
members[352]=[346, 76, 205, 326]; 
members[353]=[0, 51, 420]; 
members[354]=[72, 233, 45, 369]; 
members[355]=[218, 363]; 
members[356]=[140, 94]; 
members[357]=[136, 365, 428, 101]; 
members[358]=[256, 271, 181, 135]; 
members[359]=[312]; 
members[360]=[67, 310, 327]; 
members[361]=[334, 317, 176, 338, 116, 279, 90, 253]; 
members[362]=[408, 115, 340]; 
members[363]=[49, 218, 355]; 
members[364]=[130, 62]; 
members[365]=[136, 428, 101, 357]; 
members[366]=[272, 291, 134, 295]; 
members[367]=[249, 158, 25]; 
members[368]=[113, 21]; 
members[369]=[233, 354, 45]; 
members[370]=[429, 20, 341, 374, 126]; 
members[371]=[424, 170]; 
members[372]=[384, 147, 40, 305, 242, 115]; 
members[373]=[17, 116]; 
members[374]=[288, 3, 303, 370, 20, 341, 60, 126]; 
members[375]=[97, 228, 189]; 
members[376]=[129, 322, 68, 321, 12, 269, 46, 276, 150, 377, 155, 253]; 
members[377]=[322, 68, 166, 392, 12, 139, 332, 269, 46, 47, 276, 376, 155, 253]; 
members[378]=[267, 207]; 
members[379]=[435]; 
members[380]=[281, 197, 153]; 
members[381]=[329, 417]; 
members[382]=[441, 220, 270]; 
members[383]=[227, 330, 16, 405, 438, 286]; 
members[384]=[40, 305, 242, 147, 372]; 
members[385]=[264, 274, 427]; 
members[386]=[432, 184, 413]; 
members[387]=[273, 85]; 
members[388]=[144, 127]; 
members[389]=[440, 171, 78]; 
members[390]=[313, 66, 29, 426]; 
members[391]=[69, 237, 119, 56, 347, 318]; 
members[392]=[166, 139, 332, 47, 377]; 
members[393]=[292, 169, 330, 46, 240, 252]; 
members[394]=[70, 9, 76, 158, 94]; 
members[395]=[88, 335]; 
members[396]=[120, 59, 3, 21]; 
members[397]=[289, 239, 240, 437, 55]; 
members[398]=[41, 125, 278]; 
members[399]=[196, 228, 295, 302, 82, 409, 185, 28]; 
members[400]=[348, 23]; 
members[401]=[419, 229, 167, 112, 117]; 
members[402]=[201, 238, 211, 439, 248, 154]; 
members[403]=[192, 324, 165, 14, 311, 186]; 
members[404]=[143]; 
members[405]=[227, 330, 16, 438, 286, 383]; 
members[406]=[172, 333]; 
members[407]=[434, 60, 223]; 
members[408]=[362, 115, 340]; 
members[409]=[196, 302, 399, 185, 28]; 
members[410]=[118]; 
members[411]=[284, 267, 84]; 
members[412]=[224, 109, 422, 293]; 
members[413]=[432, 184, 386]; 
members[414]=[256, 285]; 
members[415]=[335, 108]; 
members[416]=[304, 298, 436, 96]; 
members[417]=[192, 324, 165, 311, 186, 381]; 
members[418]=[283, 179, 261]; 
members[419]=[325, 167, 141, 112, 401, 117]; 
members[420]=[353, 66, 29, 313]; 
members[421]=[226, 107, 198]; 
members[422]=[224, 258, 38, 412, 293]; 
members[423]=[65, 10, 75]; 
members[424]=[202, 371, 188]; 
members[425]=[74, 203, 244, 133]; 
members[426]=[89, 114, 390]; 
members[427]=[385, 274, 164]; 
members[428]=[357, 136, 137, 365, 210]; 
members[429]=[8, 370, 20, 341, 126]; 
members[430]=[100, 263, 73, 42, 106, 254]; 
members[431]=[202, 343, 5]; 
members[432]=[386, 105, 142, 209, 413]; 
members[433]=[257, 259, 110, 207, 145, 243]; 
members[434]=[168, 407, 223]; 
members[435]=[57, 58, 379, 162]; 
members[436]=[208, 96, 416, 304]; 
members[437]=[160, 289, 397, 239, 55]; 
members[438]=[67, 199, 328, 16, 227, 405, 183, 286, 383]; 
members[439]=[262, 201, 238, 402, 211, 248, 154, 282]; 
members[440]=[389, 77, 78, 53, 61, 159]; 
members[441]=[382, 333, 270]; 
members[442]=[25, 83, 249]; 
members[443]=[350, 149, 86]; 

return members[i]; 
} 

function drawMap(sfac) { 

var rect; 
var tbox; 

paper.clear(); 

t[0]=paper.text(nx[0],ny[0]-10,'Reducing Ozone Destruction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[0]});
t[0].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reducing-Ozone-Destruction/#Reducing Ozone Destruction", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Reducing-Ozone-Destruction/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Reducing-Ozone-Destruction/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[0], bt[0], br[0]-bl[0], bb[0]-bt[0], 10*sfac[0]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[0]=paper.setFinish(); 
t[0].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[1]=paper.text(nx[1],ny[1],'Modern Biodiversity').attr({fill:"#666666","font-size": 14*sfac[1]});
tBox=t[1].getBBox(); 
bt[1]=ny[1]-(tBox.height/2+10*sfac[1]);
bb[1]=ny[1]+(tBox.height/2+10*sfac[1]);
bl[1]=nx[1]-(tBox.width/2+10*sfac[1]);
br[1]=nx[1]+(tBox.width/2+10*sfac[1]);
paper.setStart(); 
rect=paper.rect(bl[1], bt[1], br[1]-bl[1], bb[1]-bt[1], 10*sfac[1]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[1]=paper.setFinish(); 

t[2]=paper.text(nx[2],ny[2]-10,'Water Pollution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[2]});
t[2].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Water-Pollution/#Water Pollution", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Water-Pollution/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Water-Pollution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[2], bt[2], br[2]-bl[2], bb[2]-bt[2], 10*sfac[2]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[2]=paper.setFinish(); 
t[2].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[3]=paper.text(nx[3],ny[3],'Energy in the Atmosphere').attr({fill:"#666666","font-size": 14*sfac[3]});
tBox=t[3].getBBox(); 
bt[3]=ny[3]-(tBox.height/2+10*sfac[3]);
bb[3]=ny[3]+(tBox.height/2+10*sfac[3]);
bl[3]=nx[3]-(tBox.width/2+10*sfac[3]);
br[3]=nx[3]+(tBox.width/2+10*sfac[3]);
paper.setStart(); 
rect=paper.rect(bl[3], bt[3], br[3]-bl[3], bb[3]-bt[3], 10*sfac[3]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[3]=paper.setFinish(); 

t[4]=paper.text(nx[4],ny[4],'Ecosystems').attr({fill:"#666666","font-size": 14*sfac[4]});
tBox=t[4].getBBox(); 
bt[4]=ny[4]-(tBox.height/2+10*sfac[4]);
bb[4]=ny[4]+(tBox.height/2+10*sfac[4]);
bl[4]=nx[4]-(tBox.width/2+10*sfac[4]);
br[4]=nx[4]+(tBox.width/2+10*sfac[4]);
paper.setStart(); 
rect=paper.rect(bl[4], bt[4], br[4]-bl[4], bb[4]-bt[4], 10*sfac[4]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[4]=paper.setFinish(); 

t[5]=paper.text(nx[5],ny[5]-10,'Evidence from Seafloor\nMagnetism').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[5]});
t[5].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Seafloor-Magnetic-Evidence-for-Seafloor-Spreading/#Evidence from Seafloor Magnetism", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Seafloor-Magnetic-Evidence-for-Seafloor-Spreading/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Seafloor-Magnetic-Evidence-for-Seafloor-Spreading/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[5], bt[5], br[5]-bl[5], bb[5]-bt[5], 10*sfac[5]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[5]=paper.setFinish(); 
t[5].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[6]=paper.text(nx[6],ny[6],"History of Earth's Complex Life\nForms").attr({fill:"#666666","font-size": 14*sfac[6]});
tBox=t[6].getBBox(); 
bt[6]=ny[6]-(tBox.height/2+10*sfac[6]);
bb[6]=ny[6]+(tBox.height/2+10*sfac[6]);
bl[6]=nx[6]-(tBox.width/2+10*sfac[6]);
br[6]=nx[6]+(tBox.width/2+10*sfac[6]);
paper.setStart(); 
rect=paper.rect(bl[6], bt[6], br[6]-bl[6], bb[6]-bt[6], 10*sfac[6]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[6]=paper.setFinish(); 

t[7]=paper.text(nx[7],ny[7],'Ocean Pollution').attr({fill:"#666666","font-size": 14*sfac[7]});
tBox=t[7].getBBox(); 
bt[7]=ny[7]-(tBox.height/2+10*sfac[7]);
bb[7]=ny[7]+(tBox.height/2+10*sfac[7]);
bl[7]=nx[7]-(tBox.width/2+10*sfac[7]);
br[7]=nx[7]+(tBox.width/2+10*sfac[7]);
paper.setStart(); 
rect=paper.rect(bl[7], bt[7], br[7]-bl[7], bb[7]-bt[7], 10*sfac[7]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[7]=paper.setFinish(); 

t[8]=paper.text(nx[8],ny[8],'The Atmosphere Composition,\nPressure, and Density').attr({fill:"#666666","font-size": 14*sfac[8]});
tBox=t[8].getBBox(); 
bt[8]=ny[8]-(tBox.height/2+10*sfac[8]);
bb[8]=ny[8]+(tBox.height/2+10*sfac[8]);
bl[8]=nx[8]-(tBox.width/2+10*sfac[8]);
br[8]=nx[8]+(tBox.width/2+10*sfac[8]);
paper.setStart(); 
rect=paper.rect(bl[8], bt[8], br[8]-bl[8], bb[8]-bt[8], 10*sfac[8]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[8]=paper.setFinish(); 

t[9]=paper.text(nx[9],ny[9]-10,'Earthquake Zones').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[9]});
t[9].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Earthquake-Zones/#Earthquake Zones", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Earthquake-Zones/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Earthquake-Zones/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[9], bt[9], br[9]-bl[9], bb[9]-bt[9], 10*sfac[9]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[9]=paper.setFinish(); 
t[9].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[10]=paper.text(nx[10],ny[10],'The Precambrian').attr({fill:"#666666","font-size": 14*sfac[10]});
tBox=t[10].getBBox(); 
bt[10]=ny[10]-(tBox.height/2+10*sfac[10]);
bb[10]=ny[10]+(tBox.height/2+10*sfac[10]);
bl[10]=nx[10]-(tBox.width/2+10*sfac[10]);
br[10]=nx[10]+(tBox.width/2+10*sfac[10]);
paper.setStart(); 
rect=paper.rect(bl[10], bt[10], br[10]-bl[10], bb[10]-bt[10], 10*sfac[10]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[10]=paper.setFinish(); 

t[11]=paper.text(nx[11],ny[11]-10,'Biomass\nEnergy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[11]});
t[11].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Energy-from-Biomass/#Biomass Energy", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Energy-from-Biomass/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Energy-from-Biomass/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[11], bt[11], br[11]-bl[11], bb[11]-bt[11], 10*sfac[11]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[11]=paper.setFinish(); 
t[11].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[12]=paper.text(nx[12],ny[12],'Principles of Earth\nScience').attr({fill:"#666666","font-size": 14*sfac[12]});
tBox=t[12].getBBox(); 
bt[12]=ny[12]-(tBox.height/2+10*sfac[12]);
bb[12]=ny[12]+(tBox.height/2+10*sfac[12]);
bl[12]=nx[12]-(tBox.width/2+10*sfac[12]);
br[12]=nx[12]+(tBox.width/2+10*sfac[12]);
paper.setStart(); 
rect=paper.rect(bl[12], bt[12], br[12]-bl[12], bb[12]-bt[12], 10*sfac[12]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[12]=paper.setFinish(); 

t[13]=paper.text(nx[13],ny[13]-10,'Early Continents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[13]});
t[13].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Precambrian-Continents/#Early Continents", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Precambrian-Continents/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Precambrian-Continents/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[13], bt[13], br[13]-bl[13], bb[13]-bt[13], 10*sfac[13]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[13]=paper.setFinish(); 
t[13].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[14]=paper.text(nx[14],ny[14],'Beyond the Solar System').attr({fill:"#666666","font-size": 14*sfac[14]});
tBox=t[14].getBBox(); 
bt[14]=ny[14]-(tBox.height/2+10*sfac[14]);
bb[14]=ny[14]+(tBox.height/2+10*sfac[14]);
bl[14]=nx[14]-(tBox.width/2+10*sfac[14]);
br[14]=nx[14]+(tBox.width/2+10*sfac[14]);
paper.setStart(); 
rect=paper.rect(bl[14], bt[14], br[14]-bl[14], bb[14]-bt[14], 10*sfac[14]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[14]=paper.setFinish(); 

t[15]=paper.text(nx[15],ny[15],'Human Populations').attr({fill:"#666666","font-size": 14*sfac[15]});
tBox=t[15].getBBox(); 
bt[15]=ny[15]-(tBox.height/2+10*sfac[15]);
bb[15]=ny[15]+(tBox.height/2+10*sfac[15]);
bl[15]=nx[15]-(tBox.width/2+10*sfac[15]);
br[15]=nx[15]+(tBox.width/2+10*sfac[15]);
paper.setStart(); 
rect=paper.rect(bl[15], bt[15], br[15]-bl[15], bb[15]-bt[15], 10*sfac[15]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[15]=paper.setFinish(); 

t[16]=paper.text(nx[16],ny[16]-10,'Thunderstorms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[16]});
t[16].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Thunderstorms/#Thunderstorms", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Thunderstorms/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Thunderstorms/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Thunderstorms/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[16], bt[16], br[16]-bl[16], bb[16]-bt[16], 10*sfac[16]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[16]=paper.setFinish(); 
t[16].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[17]=paper.text(nx[17],ny[17],'Fossilization').attr({fill:"#666666","font-size": 14*sfac[17]});
tBox=t[17].getBBox(); 
bt[17]=ny[17]-(tBox.height/2+10*sfac[17]);
bb[17]=ny[17]+(tBox.height/2+10*sfac[17]);
bl[17]=nx[17]-(tBox.width/2+10*sfac[17]);
br[17]=nx[17]+(tBox.width/2+10*sfac[17]);
paper.setStart(); 
rect=paper.rect(bl[17], bt[17], br[17]-bl[17], bb[17]-bt[17], 10*sfac[17]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[17]=paper.setFinish(); 

t[18]=paper.text(nx[18],ny[18]-10,'Climate Change in\nEarth History').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[18]});
t[18].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Climate-Change-in-Earth-History/#Climate Change in Earth History", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Climate-Change-in-Earth-History/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[18], bt[18], br[18]-bl[18], bb[18]-bt[18], 10*sfac[18]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[18]=paper.setFinish(); 
t[18].toFront(); 
exicon.toFront(); 

t[19]=paper.text(nx[19],ny[19],'The Origin of Life').attr({fill:"#666666","font-size": 14*sfac[19]});
tBox=t[19].getBBox(); 
bt[19]=ny[19]-(tBox.height/2+10*sfac[19]);
bb[19]=ny[19]+(tBox.height/2+10*sfac[19]);
bl[19]=nx[19]-(tBox.width/2+10*sfac[19]);
br[19]=nx[19]+(tBox.width/2+10*sfac[19]);
paper.setStart(); 
rect=paper.rect(bl[19], bt[19], br[19]-bl[19], bb[19]-bt[19], 10*sfac[19]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[19]=paper.setFinish(); 

t[20]=paper.text(nx[20],ny[20]-10,'Mesosphere').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[20]});
t[20].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Mesosphere/#Mesosphere", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Mesosphere/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Mesosphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Mesosphere/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[20], bt[20], br[20]-bl[20], bb[20]-bt[20], 10*sfac[20]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[20]=paper.setFinish(); 
t[20].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[21]=paper.text(nx[21],ny[21]-10,'Heat Transfer in the Atmosphere').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[21]});
t[21].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Heat-Transfer-in-the-Atmosphere/#Heat Transfer in the Atmosphere", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Heat-Transfer-in-the-Atmosphere/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Heat-Transfer-in-the-Atmosphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[21], bt[21], br[21]-bl[21], bb[21]-bt[21], 10*sfac[21]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[21]=paper.setFinish(); 
t[21].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[22]=paper.text(nx[22],ny[22]-10,'Expansion\nof the Universe').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[22]});
t[22].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Expansion-of-the-Universe/#Expansion of the Universe", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Expansion-of-the-Universe/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Expansion-of-the-Universe/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[22], bt[22], br[22]-bl[22], bb[22]-bt[22], 10*sfac[22]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[22]=paper.setFinish(); 
t[22].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[23]=paper.text(nx[23],ny[23]-10,'Correlation\nof Relative Dating').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[23]});
t[23].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Correlation-Using-Relative-Ages/#Correlation of Relative Dating", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Correlation-Using-Relative-Ages/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Correlation-Using-Relative-Ages/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[23], bt[23], br[23]-bl[23], bb[23]-bt[23], 10*sfac[23]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[23]=paper.setFinish(); 
t[23].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[24]=paper.text(nx[24],ny[24],'Food Webs').attr({fill:"#666666","font-size": 14*sfac[24]});
tBox=t[24].getBBox(); 
bt[24]=ny[24]-(tBox.height/2+10*sfac[24]);
bb[24]=ny[24]+(tBox.height/2+10*sfac[24]);
bl[24]=nx[24]-(tBox.width/2+10*sfac[24]);
br[24]=nx[24]+(tBox.width/2+10*sfac[24]);
paper.setStart(); 
rect=paper.rect(bl[24], bt[24], br[24]-bl[24], bb[24]-bt[24], 10*sfac[24]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[24]=paper.setFinish(); 

t[25]=paper.text(nx[25],ny[25]-10,'Measures of Earthquake\nIntensity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[25]});
t[25].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Scales-that-Represent-Earthquake-Magnitude/#Measures of Earthquake Intensity", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Scales-that-Represent-Earthquake-Magnitude/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Scales-that-Represent-Earthquake-Magnitude/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[25], bt[25], br[25]-bl[25], bb[25]-bt[25], 10*sfac[25]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[25]=paper.setFinish(); 
t[25].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[26]=paper.text(nx[26],ny[26]-10,'Cenozoic Geologic\nHistory').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[26]});
t[26].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cenozoic-Plate-Tectonics/#Cenozoic Geologic History", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Cenozoic-Plate-Tectonics/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[26], bt[26], br[26]-bl[26], bb[26]-bt[26], 10*sfac[26]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[26]=paper.setFinish(); 
t[26].toFront(); 
exicon.toFront(); 

t[27]=paper.text(nx[27],ny[27],'Satellites').attr({fill:"#666666","font-size": 14*sfac[27]});
tBox=t[27].getBBox(); 
bt[27]=ny[27]-(tBox.height/2+10*sfac[27]);
bb[27]=ny[27]+(tBox.height/2+10*sfac[27]);
bl[27]=nx[27]-(tBox.width/2+10*sfac[27]);
br[27]=nx[27]+(tBox.width/2+10*sfac[27]);
paper.setStart(); 
rect=paper.rect(bl[27], bt[27], br[27]-bl[27], bb[27]-bt[27], 10*sfac[27]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[27]=paper.setFinish(); 

t[28]=paper.text(nx[28],ny[28]-10,'Saturn').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[28]});
t[28].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Saturn/#Saturn", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Saturn/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Saturn/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[28], bt[28], br[28]-bl[28], bb[28]-bt[28], 10*sfac[28]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[28]=paper.setFinish(); 
t[28].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[29]=paper.text(nx[29],ny[29]-10,'Effects of Smog on\nHuman Health').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[29]});
t[29].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Effects-of-Air-Pollution-on-Human-Health/#Effects of Smog on Human Health", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Effects-of-Air-Pollution-on-Human-Health/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Effects-of-Air-Pollution-on-Human-Health/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Effects-of-Air-Pollution-on-Human-Health/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[29], bt[29], br[29]-bl[29], bb[29]-bt[29], 10*sfac[29]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[29]=paper.setFinish(); 
t[29].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[30]=paper.text(nx[30],ny[30],'Safety in Science').attr({fill:"#666666","font-size": 14*sfac[30]});
tBox=t[30].getBBox(); 
bt[30]=ny[30]-(tBox.height/2+10*sfac[30]);
bb[30]=ny[30]+(tBox.height/2+10*sfac[30]);
bl[30]=nx[30]-(tBox.width/2+10*sfac[30]);
br[30]=nx[30]+(tBox.width/2+10*sfac[30]);
paper.setStart(); 
rect=paper.rect(bl[30], bt[30], br[30]-bl[30], bb[30]-bt[30], 10*sfac[30]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[30]=paper.setFinish(); 

t[31]=paper.text(nx[31],ny[31]-10,'Fossilization').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[31]});
t[31].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/How-Fossilization-Creates-Fossils/#Fossilization", target: "_top",title:"Click to jump to concept"});
}); 
t[31].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[31].getBBox(); 
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
yicon = bb[31]-25; 
xicon2 = nx[31]+-40; 
xicon3 = nx[31]+-10; 
xicon4 = nx[31]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/How-Fossilization-Creates-Fossils/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[31], bt[31], br[31]-bl[31], bb[31]-bt[31], 10*sfac[31]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[31]=paper.setFinish(); 
t[31].toFront(); 
vidicon.toFront(); 

t[32]=paper.text(nx[32],ny[32]-10,'Mineral Groups').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[32]});
t[32].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mineral-Groups/#Mineral Groups", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Mineral-Groups/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mineral-Groups/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[32], bt[32], br[32]-bl[32], bb[32]-bt[32], 10*sfac[32]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[32]=paper.setFinish(); 
t[32].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[33]=paper.text(nx[33],ny[33]-10,"Modeling Earth's Surface:\nGlobes and Maps").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[33]});
t[33].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Maps/#Modeling Earth's Surface: Globes and Maps", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Maps/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Maps/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[33], bt[33], br[33]-bl[33], bb[33]-bt[33], 10*sfac[33]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[33]=paper.setFinish(); 
t[33].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[34]=paper.text(nx[34],ny[34]-10,'Solar\nEnergy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[34]});
t[34].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Solar-Power/#Solar Energy", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Solar-Power/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[34], bt[34], br[34]-bl[34], bb[34]-bt[34], 10*sfac[34]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[34]=paper.setFinish(); 
t[34].toFront(); 
exicon.toFront(); 

t[35]=paper.text(nx[35],ny[35]-10,'Mineral Formation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[35]});
t[35].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mineral-Formation/#Mineral Formation", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mineral-Formation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[35], bt[35], br[35]-bl[35], bb[35]-bt[35], 10*sfac[35]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[35]=paper.setFinish(); 
t[35].toFront(); 
exicon.toFront(); 

t[36]=paper.text(nx[36],ny[36],'Seafloor Bathymetry and\nFeatures').attr({fill:"#666666","font-size": 14*sfac[36]});
tBox=t[36].getBBox(); 
bt[36]=ny[36]-(tBox.height/2+10*sfac[36]);
bb[36]=ny[36]+(tBox.height/2+10*sfac[36]);
bl[36]=nx[36]-(tBox.width/2+10*sfac[36]);
br[36]=nx[36]+(tBox.width/2+10*sfac[36]);
paper.setStart(); 
rect=paper.rect(bl[36], bt[36], br[36]-bl[36], bb[36]-bt[36], 10*sfac[36]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[36]=paper.setFinish(); 

t[37]=paper.text(nx[37],ny[37],'Groundwater').attr({fill:"#666666","font-size": 14*sfac[37]});
tBox=t[37].getBBox(); 
bt[37]=ny[37]-(tBox.height/2+10*sfac[37]);
bb[37]=ny[37]+(tBox.height/2+10*sfac[37]);
bl[37]=nx[37]-(tBox.width/2+10*sfac[37]);
br[37]=nx[37]+(tBox.width/2+10*sfac[37]);
paper.setStart(); 
rect=paper.rect(bl[37], bt[37], br[37]-bl[37], bb[37]-bt[37], 10*sfac[37]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[37]=paper.setFinish(); 

t[38]=paper.text(nx[38],ny[38]-10,'Volcanic Eruption Prediction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[38]});
t[38].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Predicting-Volcanic-Eruptions/#Volcanic Eruption Prediction", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Predicting-Volcanic-Eruptions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[38], bt[38], br[38]-bl[38], bb[38]-bt[38], 10*sfac[38]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[38]=paper.setFinish(); 
t[38].toFront(); 
exicon.toFront(); 

t[39]=paper.text(nx[39],ny[39],'Earth Science').attr({fill:"#000000","font-size": 24*sfac[39]});
tBox=t[39].getBBox(); 
bt[39]=ny[39]-(tBox.height/2+10*sfac[39]);
bb[39]=ny[39]+(tBox.height/2+10*sfac[39]);
bl[39]=nx[39]-(tBox.width/2+10*sfac[39]);
br[39]=nx[39]+(tBox.width/2+10*sfac[39]);
paper.setStart(); 
rect=paper.rect(bl[39], bt[39], br[39]-bl[39], bb[39]-bt[39], 10*sfac[39]).attr({stroke:"#7cbf00","stroke-width": "4",fill:"black","fill-opacity":"0"});
b[39]=paper.setFinish(); 

t[40]=paper.text(nx[40],ny[40]-10,'The Flow of Energy in\nEcosystems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[40]});
t[40].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Flow-of-Energy-in-Ecosystems/#The Flow of Energy in Ecosystems", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Flow-of-Energy-in-Ecosystems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Flow-of-Energy-in-Ecosystems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[40], bt[40], br[40]-bl[40], bb[40]-bt[40], 10*sfac[40]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[40]=paper.setFinish(); 
t[40].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[41]=paper.text(nx[41],ny[41]-10,'Energy Conservation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[41]});
t[41].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Conserving-Energy-Resources/#Energy Conservation", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Conserving-Energy-Resources/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[41], bt[41], br[41]-bl[41], bb[41]-bt[41], 10*sfac[41]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[41]=paper.setFinish(); 
t[41].toFront(); 
vidicon.toFront(); 

t[42]=paper.text(nx[42],ny[42]-10,'Energy from\nNatural Gas').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[42]});
t[42].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Natural-Gas-Power/#Energy from Natural Gas", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Natural-Gas-Power/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Natural-Gas-Power/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[42], bt[42], br[42]-bl[42], bb[42]-bt[42], 10*sfac[42]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[42]=paper.setFinish(); 
t[42].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[43]=paper.text(nx[43],ny[43],'Wetlands\nEcosystems').attr({fill:"#666666","font-size": 14*sfac[43]});
tBox=t[43].getBBox(); 
bt[43]=ny[43]-(tBox.height/2+10*sfac[43]);
bb[43]=ny[43]+(tBox.height/2+10*sfac[43]);
bl[43]=nx[43]-(tBox.width/2+10*sfac[43]);
br[43]=nx[43]+(tBox.width/2+10*sfac[43]);
paper.setStart(); 
rect=paper.rect(bl[43], bt[43], br[43]-bl[43], bb[43]-bt[43], 10*sfac[43]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[43]=paper.setFinish(); 

t[44]=paper.text(nx[44],ny[44],'Polar Climates').attr({fill:"#666666","font-size": 14*sfac[44]});
tBox=t[44].getBBox(); 
bt[44]=ny[44]-(tBox.height/2+10*sfac[44]);
bb[44]=ny[44]+(tBox.height/2+10*sfac[44]);
bl[44]=nx[44]-(tBox.width/2+10*sfac[44]);
br[44]=nx[44]+(tBox.width/2+10*sfac[44]);
paper.setStart(); 
rect=paper.rect(bl[44], bt[44], br[44]-bl[44], bb[44]-bt[44], 10*sfac[44]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[44]=paper.setFinish(); 

t[45]=paper.text(nx[45],ny[45]-10,'Formation of Moon').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[45]});
t[45].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Formation-of-the-Moon/#Formation of Moon", target: "_top",title:"Click to jump to concept"});
}); 
t[45].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[45].getBBox(); 
bt[45]=ny[45]-10-(tBox.height/2+10*sfac[45]);
bb[45]=ny[45]-10+(tBox.height/2+10*sfac[45]);
bl[45]=nx[45]-(tBox.width/2+10*sfac[45]);
br[45]=nx[45]+(tBox.width/2+10*sfac[45]);
var nwidth = br[45]-bl[45]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[45] = bl[45] - delta; 
    br[45] = br[45] + delta; 
} 
bb[45] = bb[45]+20; 
yicon = bb[45]-25; 
xicon2 = nx[45]+-40; 
xicon3 = nx[45]+-10; 
xicon4 = nx[45]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Formation-of-the-Moon/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[45], bt[45], br[45]-bl[45], bb[45]-bt[45], 10*sfac[45]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[45]=paper.setFinish(); 
t[45].toFront(); 
exicon.toFront(); 

t[46]=paper.text(nx[46],ny[46],'Atmosphere, Weather, and Climate').attr({fill:"#666666","font-size": 14*sfac[46]});
tBox=t[46].getBBox(); 
bt[46]=ny[46]-(tBox.height/2+10*sfac[46]);
bb[46]=ny[46]+(tBox.height/2+10*sfac[46]);
bl[46]=nx[46]-(tBox.width/2+10*sfac[46]);
br[46]=nx[46]+(tBox.width/2+10*sfac[46]);
paper.setStart(); 
rect=paper.rect(bl[46], bt[46], br[46]-bl[46], bb[46]-bt[46], 10*sfac[46]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[46]=paper.setFinish(); 

t[47]=paper.text(nx[47],ny[47],"Earth's Interior").attr({fill:"#666666","font-size": 14*sfac[47]});
tBox=t[47].getBBox(); 
bt[47]=ny[47]-(tBox.height/2+10*sfac[47]);
bb[47]=ny[47]+(tBox.height/2+10*sfac[47]);
bl[47]=nx[47]-(tBox.width/2+10*sfac[47]);
br[47]=nx[47]+(tBox.width/2+10*sfac[47]);
paper.setStart(); 
rect=paper.rect(bl[47], bt[47], br[47]-bl[47], bb[47]-bt[47], 10*sfac[47]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[47]=paper.setFinish(); 

t[48]=paper.text(nx[48],ny[48],'Absolute Ages of Rocks').attr({fill:"#666666","font-size": 14*sfac[48]});
tBox=t[48].getBBox(); 
bt[48]=ny[48]-(tBox.height/2+10*sfac[48]);
bb[48]=ny[48]+(tBox.height/2+10*sfac[48]);
bl[48]=nx[48]-(tBox.width/2+10*sfac[48]);
br[48]=nx[48]+(tBox.width/2+10*sfac[48]);
paper.setStart(); 
rect=paper.rect(bl[48], bt[48], br[48]-bl[48], bb[48]-bt[48], 10*sfac[48]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[48]=paper.setFinish(); 

t[49]=paper.text(nx[49],ny[49]-10,'Natural Resource\nAvailability').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[49]});
t[49].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Availability-of-Natural-Resources/#Natural Resource Availability", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Availability-of-Natural-Resources/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[49], bt[49], br[49]-bl[49], bb[49]-bt[49], 10*sfac[49]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[49]=paper.setFinish(); 
t[49].toFront(); 
vidicon.toFront(); 

t[50]=paper.text(nx[50],ny[50]-10,'Mineral Identification').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[50]});
t[50].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mineral-Identification/#Mineral Identification", target: "_top",title:"Click to jump to concept"});
}); 
t[50].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[50].getBBox(); 
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
yicon = bb[50]-25; 
xicon2 = nx[50]+-40; 
xicon3 = nx[50]+-10; 
xicon4 = nx[50]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mineral-Identification/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mineral-Identification/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[50], bt[50], br[50]-bl[50], bb[50]-bt[50], 10*sfac[50]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[50]=paper.setFinish(); 
t[50].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[51]=paper.text(nx[51],ny[51],'Reducing Greenhouse Gases').attr({fill:"#666666","font-size": 14*sfac[51]});
tBox=t[51].getBBox(); 
bt[51]=ny[51]-(tBox.height/2+10*sfac[51]);
bb[51]=ny[51]+(tBox.height/2+10*sfac[51]);
bl[51]=nx[51]-(tBox.width/2+10*sfac[51]);
br[51]=nx[51]+(tBox.width/2+10*sfac[51]);
paper.setStart(); 
rect=paper.rect(bl[51], bt[51], br[51]-bl[51], bb[51]-bt[51], 10*sfac[51]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[51]=paper.setFinish(); 

t[52]=paper.text(nx[52],ny[52],'Mining and Mineral Use').attr({fill:"#666666","font-size": 14*sfac[52]});
tBox=t[52].getBBox(); 
bt[52]=ny[52]-(tBox.height/2+10*sfac[52]);
bb[52]=ny[52]+(tBox.height/2+10*sfac[52]);
bl[52]=nx[52]-(tBox.width/2+10*sfac[52]);
br[52]=nx[52]+(tBox.width/2+10*sfac[52]);
paper.setStart(); 
rect=paper.rect(bl[52], bt[52], br[52]-bl[52], bb[52]-bt[52], 10*sfac[52]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[52]=paper.setFinish(); 

t[53]=paper.text(nx[53],ny[53]-10,'Sedimentary Rock Classification').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[53]});
t[53].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Sedimentary-Rocks-Classification/#Sedimentary Rock Classification", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Sedimentary-Rocks-Classification/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Sedimentary-Rocks-Classification/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[53], bt[53], br[53]-bl[53], bb[53]-bt[53], 10*sfac[53]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[53]=paper.setFinish(); 
t[53].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[54]=paper.text(nx[54],ny[54]-10,'Biological Population\nSize').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[54]});
t[54].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Population-Size/#Biological Population Size", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Population-Size/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[54], bt[54], br[54]-bl[54], bb[54]-bt[54], 10*sfac[54]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[54]=paper.setFinish(); 
t[54].toFront(); 
exicon.toFront(); 

t[55]=paper.text(nx[55],ny[55]-10,'Atmospheric\nCirculation Cells').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[55]});
t[55].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Effect-of-Atmospheric-Circulation-on-Climate/#Atmospheric Circulation Cells", target: "_top",title:"Click to jump to concept"});
}); 
t[55].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[55].getBBox(); 
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
yicon = bb[55]-25; 
xicon2 = nx[55]+-40; 
xicon3 = nx[55]+-10; 
xicon4 = nx[55]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Effect-of-Atmospheric-Circulation-on-Climate/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[55], bt[55], br[55]-bl[55], bb[55]-bt[55], 10*sfac[55]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[55]=paper.setFinish(); 
t[55].toFront(); 
exicon.toFront(); 

t[56]=paper.text(nx[56],ny[56]-10,'Erosion by\nWind').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[56]});
t[56].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Landforms-from-Wind-Erosion-and-Deposition/#Erosion by Wind", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Landforms-from-Wind-Erosion-and-Deposition/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Landforms-from-Wind-Erosion-and-Deposition/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[56], bt[56], br[56]-bl[56], bb[56]-bt[56], 10*sfac[56]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[56]=paper.setFinish(); 
t[56].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[57]=paper.text(nx[57],ny[57]-10,'Geologic\nFaults').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[57]});
t[57].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Faults/#Geologic Faults", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Faults/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[57], bt[57], br[57]-bl[57], bb[57]-bt[57], 10*sfac[57]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[57]=paper.setFinish(); 
t[57].toFront(); 
exicon.toFront(); 

t[58]=paper.text(nx[58],ny[58]-10,'Geologic\nFolds').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[58]});
t[58].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Folds/#Geologic Folds", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Folds/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Folds/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[58], bt[58], br[58]-bl[58], bb[58]-bt[58], 10*sfac[58]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[58]=paper.setFinish(); 
t[58].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[59]=paper.text(nx[59],ny[59]-10,'Electromagnetic Energy\nin the Atmosphere').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[59]});
t[59].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Electromagnetic-Energy-in-the-Atmosphere/#Electromagnetic Energy in the Atmosphere", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Electromagnetic-Energy-in-the-Atmosphere/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Electromagnetic-Energy-in-the-Atmosphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Electromagnetic-Energy-in-the-Atmosphere/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[59], bt[59], br[59]-bl[59], bb[59]-bt[59], 10*sfac[59]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[59]=paper.setFinish(); 
t[59].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[60]=paper.text(nx[60],ny[60],'Atmospheric Motions').attr({fill:"#666666","font-size": 14*sfac[60]});
tBox=t[60].getBBox(); 
bt[60]=ny[60]-(tBox.height/2+10*sfac[60]);
bb[60]=ny[60]+(tBox.height/2+10*sfac[60]);
bl[60]=nx[60]-(tBox.width/2+10*sfac[60]);
br[60]=nx[60]+(tBox.width/2+10*sfac[60]);
paper.setStart(); 
rect=paper.rect(bl[60], bt[60], br[60]-bl[60], bb[60]-bt[60], 10*sfac[60]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[60]=paper.setFinish(); 

t[61]=paper.text(nx[61],ny[61]-10,'Metamorphic Rock Classification').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[61]});
t[61].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Metamorphic-Rocks-Classification/#Metamorphic Rock Classification", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Metamorphic-Rocks-Classification/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Metamorphic-Rocks-Classification/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[61], bt[61], br[61]-bl[61], bb[61]-bt[61], 10*sfac[61]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[61]=paper.setFinish(); 
t[61].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[62]=paper.text(nx[62],ny[62],'Adaptation and Evolution').attr({fill:"#666666","font-size": 14*sfac[62]});
tBox=t[62].getBBox(); 
bt[62]=ny[62]-(tBox.height/2+10*sfac[62]);
bb[62]=ny[62]+(tBox.height/2+10*sfac[62]);
bl[62]=nx[62]-(tBox.width/2+10*sfac[62]);
br[62]=nx[62]+(tBox.width/2+10*sfac[62]);
paper.setStart(); 
rect=paper.rect(bl[62], bt[62], br[62]-bl[62], bb[62]-bt[62], 10*sfac[62]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[62]=paper.setFinish(); 

t[63]=paper.text(nx[63],ny[63]-10,'Essential Earth Science\nTheories').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[63]});
t[63].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Three-Essential-Theories-in-Earth-Science/#Essential Earth Science Theories", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Three-Essential-Theories-in-Earth-Science/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Three-Essential-Theories-in-Earth-Science/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[63], bt[63], br[63]-bl[63], bb[63]-bt[63], 10*sfac[63]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[63]=paper.setFinish(); 
t[63].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[64]=paper.text(nx[64],ny[64]-10,'Finding, Minding, and Extracting Ores').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[64]});
t[64].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Finding-and-Mining-Ores/#Finding, Minding, and Extracting Ores", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Finding-and-Mining-Ores/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[64], bt[64], br[64]-bl[64], bb[64]-bt[64], 10*sfac[64]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[64]=paper.setFinish(); 
t[64].toFront(); 
vidicon.toFront(); 

t[65]=paper.text(nx[65],ny[65]-10,'Early\nEarth Atmosphere').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[65]});
t[65].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Early-Atmosphere-and-Oceans/#Early Earth Atmosphere", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Early-Atmosphere-and-Oceans/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[65], bt[65], br[65]-bl[65], bb[65]-bt[65], 10*sfac[65]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[65]=paper.setFinish(); 
t[65].toFront(); 
exicon.toFront(); 

t[66]=paper.text(nx[66],ny[66]-10,'Effects of Smog on\nthe Environment').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[66]});
t[66].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Effects-of-Air-Pollution-on-the-Environment/#Effects of Smog on the Environment", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Effects-of-Air-Pollution-on-the-Environment/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Effects-of-Air-Pollution-on-the-Environment/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[66], bt[66], br[66]-bl[66], bb[66]-bt[66], 10*sfac[66]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[66]=paper.setFinish(); 
t[66].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[67]=paper.text(nx[67],ny[67],'Weather Forecasting').attr({fill:"#666666","font-size": 14*sfac[67]});
tBox=t[67].getBBox(); 
bt[67]=ny[67]-(tBox.height/2+10*sfac[67]);
bb[67]=ny[67]+(tBox.height/2+10*sfac[67]);
bl[67]=nx[67]-(tBox.width/2+10*sfac[67]);
br[67]=nx[67]+(tBox.width/2+10*sfac[67]);
paper.setStart(); 
rect=paper.rect(bl[67], bt[67], br[67]-bl[67], bb[67]-bt[67], 10*sfac[67]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[67]=paper.setFinish(); 

t[68]=paper.text(nx[68],ny[68],'Earth History').attr({fill:"#666666","font-size": 14*sfac[68]});
tBox=t[68].getBBox(); 
bt[68]=ny[68]-(tBox.height/2+10*sfac[68]);
bb[68]=ny[68]+(tBox.height/2+10*sfac[68]);
bl[68]=nx[68]-(tBox.width/2+10*sfac[68]);
br[68]=nx[68]+(tBox.width/2+10*sfac[68]);
paper.setStart(); 
rect=paper.rect(bl[68], bt[68], br[68]-bl[68], bb[68]-bt[68], 10*sfac[68]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[68]=paper.setFinish(); 

t[69]=paper.text(nx[69],ny[69]-10,'Erosion by\nGravity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[69]});
t[69].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Landforms-from-Erosion-and-Deposition-by-Gravity/#Erosion by Gravity", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Landforms-from-Erosion-and-Deposition-by-Gravity/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Landforms-from-Erosion-and-Deposition-by-Gravity/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[69], bt[69], br[69]-bl[69], bb[69]-bt[69], 10*sfac[69]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[69]=paper.setFinish(); 
t[69].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[70]=paper.text(nx[70],ny[70]-10,'21st Century Tsunami').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[70]});
t[70].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/21st-Century-Tsunami/#21st Century Tsunami", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/21st-Century-Tsunami/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[70], bt[70], br[70]-bl[70], bb[70]-bt[70], 10*sfac[70]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[70]=paper.setFinish(); 
t[70].toFront(); 
exicon.toFront(); 

t[71]=paper.text(nx[71],ny[71],'Prevention of\nHazardous Waste\nPollution').attr({fill:"#666666","font-size": 14*sfac[71]});
tBox=t[71].getBBox(); 
bt[71]=ny[71]-(tBox.height/2+10*sfac[71]);
bb[71]=ny[71]+(tBox.height/2+10*sfac[71]);
bl[71]=nx[71]-(tBox.width/2+10*sfac[71]);
br[71]=nx[71]+(tBox.width/2+10*sfac[71]);
paper.setStart(); 
rect=paper.rect(bl[71], bt[71], br[71]-bl[71], bb[71]-bt[71], 10*sfac[71]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[71]=paper.setFinish(); 

t[72]=paper.text(nx[72],ny[72],'Early Earth').attr({fill:"#666666","font-size": 14*sfac[72]});
tBox=t[72].getBBox(); 
bt[72]=ny[72]-(tBox.height/2+10*sfac[72]);
bb[72]=ny[72]+(tBox.height/2+10*sfac[72]);
bl[72]=nx[72]-(tBox.width/2+10*sfac[72]);
br[72]=nx[72]+(tBox.width/2+10*sfac[72]);
paper.setStart(); 
rect=paper.rect(bl[72], bt[72], br[72]-bl[72], bb[72]-bt[72], 10*sfac[72]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[72]=paper.setFinish(); 

t[73]=paper.text(nx[73],ny[73],'Conserving Energy\nResources').attr({fill:"#666666","font-size": 14*sfac[73]});
tBox=t[73].getBBox(); 
bt[73]=ny[73]-(tBox.height/2+10*sfac[73]);
bb[73]=ny[73]+(tBox.height/2+10*sfac[73]);
bl[73]=nx[73]-(tBox.width/2+10*sfac[73]);
br[73]=nx[73]+(tBox.width/2+10*sfac[73]);
paper.setStart(); 
rect=paper.rect(bl[73], bt[73], br[73]-bl[73], bb[73]-bt[73], 10*sfac[73]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[73]=paper.setFinish(); 

t[74]=paper.text(nx[74],ny[74]-10,'Coastal Pollution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[74]});
t[74].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Coastal-Pollution/#Coastal Pollution", target: "_top",title:"Click to jump to concept"});
}); 
t[74].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[74].getBBox(); 
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
yicon = bb[74]-25; 
xicon2 = nx[74]+-40; 
xicon3 = nx[74]+-10; 
xicon4 = nx[74]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Coastal-Pollution/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Coastal-Pollution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Coastal-Pollution/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[74], bt[74], br[74]-bl[74], bb[74]-bt[74], 10*sfac[74]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[74]=paper.setFinish(); 
t[74].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[75]=paper.text(nx[75],ny[75],'Early\nEarth Oceans').attr({fill:"#666666","font-size": 14*sfac[75]});
tBox=t[75].getBBox(); 
bt[75]=ny[75]-(tBox.height/2+10*sfac[75]);
bb[75]=ny[75]+(tBox.height/2+10*sfac[75]);
bl[75]=nx[75]-(tBox.width/2+10*sfac[75]);
br[75]=nx[75]+(tBox.width/2+10*sfac[75]);
paper.setStart(); 
rect=paper.rect(bl[75], bt[75], br[75]-bl[75], bb[75]-bt[75], 10*sfac[75]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[75]=paper.setFinish(); 

t[76]=paper.text(nx[76],ny[76]-10,'Definition of Earthquakes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[76]});
t[76].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Introduction-to-Earthquakes/#Definition of Earthquakes", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-Earthquakes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[76], bt[76], br[76]-bl[76], bb[76]-bt[76], 10*sfac[76]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[76]=paper.setFinish(); 
t[76].toFront(); 
exicon.toFront(); 

t[77]=paper.text(nx[77],ny[77],'The Rock Cycle').attr({fill:"#666666","font-size": 14*sfac[77]});
tBox=t[77].getBBox(); 
bt[77]=ny[77]-(tBox.height/2+10*sfac[77]);
bb[77]=ny[77]+(tBox.height/2+10*sfac[77]);
bl[77]=nx[77]-(tBox.width/2+10*sfac[77]);
br[77]=nx[77]+(tBox.width/2+10*sfac[77]);
paper.setStart(); 
rect=paper.rect(bl[77], bt[77], br[77]-bl[77], bb[77]-bt[77], 10*sfac[77]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[77]=paper.setFinish(); 

t[78]=paper.text(nx[78],ny[78]-10,'Intrusive and Extrusive\nIgneous Rocks').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[78]});
t[78].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Intrusive-and-Extrusive-Igneous-Rocks/#Intrusive and Extrusive Igneous Rocks", target: "_top",title:"Click to jump to concept"});
}); 
t[78].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[78].getBBox(); 
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
yicon = bb[78]-25; 
xicon2 = nx[78]+-40; 
xicon3 = nx[78]+-10; 
xicon4 = nx[78]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Intrusive-and-Extrusive-Igneous-Rocks/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[78], bt[78], br[78]-bl[78], bb[78]-bt[78], 10*sfac[78]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[78]=paper.setFinish(); 
t[78].toFront(); 
exicon.toFront(); 

t[79]=paper.text(nx[79],ny[79],'Tropical Moist Climates').attr({fill:"#666666","font-size": 14*sfac[79]});
tBox=t[79].getBBox(); 
bt[79]=ny[79]-(tBox.height/2+10*sfac[79]);
bb[79]=ny[79]+(tBox.height/2+10*sfac[79]);
bl[79]=nx[79]-(tBox.width/2+10*sfac[79]);
br[79]=nx[79]+(tBox.width/2+10*sfac[79]);
paper.setStart(); 
rect=paper.rect(bl[79], bt[79], br[79]-bl[79], bb[79]-bt[79], 10*sfac[79]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[79]=paper.setFinish(); 

t[80]=paper.text(nx[80],ny[80]-10,'Short-Term Climate\nChanges; El Nino').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[80]});
t[80].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Short-Term-Climate-Change/#Short-Term Climate Changes; El Nino", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Short-Term-Climate-Change/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Short-Term-Climate-Change/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[80], bt[80], br[80]-bl[80], bb[80]-bt[80], 10*sfac[80]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[80]=paper.setFinish(); 
t[80].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[81]=paper.text(nx[81],ny[81]-10,'Earthquake Safety\nActions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[81]});
t[81].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Staying-Safe-in-an-Earthquake/#Earthquake Safety Actions", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Staying-Safe-in-an-Earthquake/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Staying-Safe-in-an-Earthquake/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[81], bt[81], br[81]-bl[81], bb[81]-bt[81], 10*sfac[81]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[81]=paper.setFinish(); 
t[81].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[82]=paper.text(nx[82],ny[82]-10,'Planet Orbits').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[82]});
t[82].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Planet-Orbits-in-the-Solar-System/#Planet Orbits", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Planet-Orbits-in-the-Solar-System/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Planet-Orbits-in-the-Solar-System/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[82], bt[82], br[82]-bl[82], bb[82]-bt[82], 10*sfac[82]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[82]=paper.setFinish(); 
t[82].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[83]=paper.text(nx[83],ny[83]-10,'Earthquake Prediction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[83]});
t[83].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Predicting-Earthquakes/#Earthquake Prediction", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Predicting-Earthquakes/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Predicting-Earthquakes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[83], bt[83], br[83]-bl[83], bb[83]-bt[83], 10*sfac[83]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[83]=paper.setFinish(); 
t[83].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[84]=paper.text(nx[84],ny[84],'Plate Boundary Interactions').attr({fill:"#666666","font-size": 14*sfac[84]});
tBox=t[84].getBBox(); 
bt[84]=ny[84]-(tBox.height/2+10*sfac[84]);
bb[84]=ny[84]+(tBox.height/2+10*sfac[84]);
bl[84]=nx[84]-(tBox.width/2+10*sfac[84]);
br[84]=nx[84]+(tBox.width/2+10*sfac[84]);
paper.setStart(); 
rect=paper.rect(bl[84], bt[84], br[84]-bl[84], bb[84]-bt[84], 10*sfac[84]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[84]=paper.setFinish(); 

t[85]=paper.text(nx[85],ny[85]-10,'Human Population\nCarrying Capacity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[85]});
t[85].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Agriculture-and-Human-Population-Growth/#Human Population Carrying Capacity", target: "_top",title:"Click to jump to concept"});
}); 
t[85].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[85].getBBox(); 
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
yicon = bb[85]-25; 
xicon2 = nx[85]+-40; 
xicon3 = nx[85]+-10; 
xicon4 = nx[85]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Agriculture-and-Human-Population-Growth/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Agriculture-and-Human-Population-Growth/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[85], bt[85], br[85]-bl[85], bb[85]-bt[85], 10*sfac[85]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[85]=paper.setFinish(); 
t[85].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[86]=paper.text(nx[86],ny[86]-10,'Mechanical Weathering').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[86]});
t[86].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mechanical-Weathering/#Mechanical Weathering", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mechanical-Weathering/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mechanical-Weathering/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[86], bt[86], br[86]-bl[86], bb[86]-bt[86], 10*sfac[86]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[86]=paper.setFinish(); 
t[86].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[87]=paper.text(nx[87],ny[87]-10,'The Flow of Matter in\nEcosystems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[87]});
t[87].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Flow-of-Matter-in-Ecosystems/#The Flow of Matter in Ecosystems", target: "_top",title:"Click to jump to concept"});
}); 
t[87].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[87].getBBox(); 
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
yicon = bb[87]-25; 
xicon2 = nx[87]+-40; 
xicon3 = nx[87]+-10; 
xicon4 = nx[87]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Flow-of-Matter-in-Ecosystems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[87], bt[87], br[87]-bl[87], bb[87]-bt[87], 10*sfac[87]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[87]=paper.setFinish(); 
t[87].toFront(); 
exicon.toFront(); 

t[88]=paper.text(nx[88],ny[88]-10,'Telescopes for\nSpace Science').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[88]});
t[88].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Studying-Space-Using-Telescopes/#Telescopes for Space Science", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Studying-Space-Using-Telescopes/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Studying-Space-Using-Telescopes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[88], bt[88], br[88]-bl[88], bb[88]-bt[88], 10*sfac[88]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[88]=paper.setFinish(); 
t[88].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[89]=paper.text(nx[89],ny[89]-10,'Acid Rain').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[89]});
t[89].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Acid-Rain/#Acid Rain", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Acid-Rain/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Acid-Rain/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[89], bt[89], br[89]-bl[89], bb[89]-bt[89], 10*sfac[89]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[89]=paper.setFinish(); 
t[89].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[90]=paper.text(nx[90],ny[90],'Minerals').attr({fill:"#666666","font-size": 14*sfac[90]});
tBox=t[90].getBBox(); 
bt[90]=ny[90]-(tBox.height/2+10*sfac[90]);
bb[90]=ny[90]+(tBox.height/2+10*sfac[90]);
bl[90]=nx[90]-(tBox.width/2+10*sfac[90]);
br[90]=nx[90]+(tBox.width/2+10*sfac[90]);
paper.setStart(); 
rect=paper.rect(bl[90], bt[90], br[90]-bl[90], bb[90]-bt[90], 10*sfac[90]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[90]=paper.setFinish(); 

t[91]=paper.text(nx[91],ny[91]-10,"Earth's\nSeasons").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[91]});
t[91].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Seasons/#Earth's Seasons", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Seasons/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Seasons/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Seasons/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[91], bt[91], br[91]-bl[91], bb[91]-bt[91], 10*sfac[91]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[91]=paper.setFinish(); 
t[91].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[92]=paper.text(nx[92],ny[92]-10,'Supervolcanoes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[92]});
t[92].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Supervolcanoes/#Supervolcanoes", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Supervolcanoes/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Supervolcanoes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[92], bt[92], br[92]-bl[92], bb[92]-bt[92], 10*sfac[92]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[92]=paper.setFinish(); 
t[92].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[93]=paper.text(nx[93],ny[93]-10,'Definition and Types of Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[93]});
t[93].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Introduction-to-Energy-Resources/#Definition and Types of Energy", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-Energy-Resources/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-Energy-Resources/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[93], bt[93], br[93]-bl[93], bb[93]-bt[93], 10*sfac[93]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[93]=paper.setFinish(); 
t[93].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[94]=paper.text(nx[94],ny[94],'Earthquake Safety').attr({fill:"#666666","font-size": 14*sfac[94]});
tBox=t[94].getBBox(); 
bt[94]=ny[94]-(tBox.height/2+10*sfac[94]);
bb[94]=ny[94]+(tBox.height/2+10*sfac[94]);
bl[94]=nx[94]-(tBox.width/2+10*sfac[94]);
br[94]=nx[94]+(tBox.width/2+10*sfac[94]);
paper.setStart(); 
rect=paper.rect(bl[94], bt[94], br[94]-bl[94], bb[94]-bt[94], 10*sfac[94]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[94]=paper.setFinish(); 

t[95]=paper.text(nx[95],ny[95]-10,'Sedimentary Rock Starting Materials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[95]});
t[95].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Starting-Materials-of-Sedimentary-Rocks/#Sedimentary Rock Starting Materials", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Starting-Materials-of-Sedimentary-Rocks/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[95], bt[95], br[95]-bl[95], bb[95]-bt[95], 10*sfac[95]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[95]=paper.setFinish(); 
t[95].toFront(); 
exicon.toFront(); 

t[96]=paper.text(nx[96],ny[96]-10,'Paleozoic\nLife').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[96]});
t[96].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-History-of-Paleozoic-Life/#Paleozoic Life", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-History-of-Paleozoic-Life/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-History-of-Paleozoic-Life/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[96], bt[96], br[96]-bl[96], bb[96]-bt[96], 10*sfac[96]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[96]=paper.setFinish(); 
t[96].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[97]=paper.text(nx[97],ny[97]-10,'Venus').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[97]});
t[97].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Venus/#Venus", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Venus/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Venus/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[97], bt[97], br[97]-bl[97], bb[97]-bt[97], 10*sfac[97]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[97]=paper.setFinish(); 
t[97].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[98]=paper.text(nx[98],ny[98],'Ions and Molecules').attr({fill:"#666666","font-size": 14*sfac[98]});
tBox=t[98].getBBox(); 
bt[98]=ny[98]-(tBox.height/2+10*sfac[98]);
bb[98]=ny[98]+(tBox.height/2+10*sfac[98]);
bl[98]=nx[98]-(tBox.width/2+10*sfac[98]);
br[98]=nx[98]+(tBox.width/2+10*sfac[98]);
paper.setStart(); 
rect=paper.rect(bl[98], bt[98], br[98]-bl[98], bb[98]-bt[98], 10*sfac[98]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[98]=paper.setFinish(); 

t[99]=paper.text(nx[99],ny[99],'The Goal of Science').attr({fill:"#666666","font-size": 14*sfac[99]});
tBox=t[99].getBBox(); 
bt[99]=ny[99]-(tBox.height/2+10*sfac[99]);
bb[99]=ny[99]+(tBox.height/2+10*sfac[99]);
bl[99]=nx[99]-(tBox.width/2+10*sfac[99]);
br[99]=nx[99]+(tBox.width/2+10*sfac[99]);
paper.setStart(); 
rect=paper.rect(bl[99], bt[99], br[99]-bl[99], bb[99]-bt[99], 10*sfac[99]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[99]=paper.setFinish(); 

t[100]=paper.text(nx[100],ny[100]-10,'Fossil Fuel Reserves').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[100]});
t[100].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Fossil-Fuel-Reserves/#Fossil Fuel Reserves", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Fossil-Fuel-Reserves/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Fossil-Fuel-Reserves/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[100], bt[100], br[100]-bl[100], bb[100]-bt[100], 10*sfac[100]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[100]=paper.setFinish(); 
t[100].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[101]=paper.text(nx[101],ny[101]-10,'Surface Water').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[101]});
t[101].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Glaciers/#Surface Water", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Glaciers/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Glaciers/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[101], bt[101], br[101]-bl[101], bb[101]-bt[101], 10*sfac[101]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[101]=paper.setFinish(); 
t[101].toFront(); 
vidicon.toFront(); 
atticon.toFront(); 

t[102]=paper.text(nx[102],ny[102],'Polar\nClimates').attr({fill:"#666666","font-size": 14*sfac[102]});
tBox=t[102].getBBox(); 
bt[102]=ny[102]-(tBox.height/2+10*sfac[102]);
bb[102]=ny[102]+(tBox.height/2+10*sfac[102]);
bl[102]=nx[102]-(tBox.width/2+10*sfac[102]);
br[102]=nx[102]+(tBox.width/2+10*sfac[102]);
paper.setStart(); 
rect=paper.rect(bl[102], bt[102], br[102]-bl[102], bb[102]-bt[102], 10*sfac[102]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[102]=paper.setFinish(); 

t[103]=paper.text(nx[103],ny[103]-10,'Eclipses').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[103]});
t[103].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Eclipses/#Eclipses", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Eclipses/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Eclipses/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[103], bt[103], br[103]-bl[103], bb[103]-bt[103], 10*sfac[103]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[103]=paper.setFinish(); 
t[103].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[104]=paper.text(nx[104],ny[104]-10,'Atmospheric Pressure\nand Density').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[104]});
t[104].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Pressure-and-Density-of-the-Atmosphere/#Atmospheric Pressure and Density", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Pressure-and-Density-of-the-Atmosphere/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Pressure-and-Density-of-the-Atmosphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Pressure-and-Density-of-the-Atmosphere/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[104], bt[104], br[104]-bl[104], bb[104]-bt[104], 10*sfac[104]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[104]=paper.setFinish(); 
t[104].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[105]=paper.text(nx[105],ny[105]-10,'Moon').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[105]});
t[105].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Moon/#Moon", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Moon/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Moon/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Moon/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[105], bt[105], br[105]-bl[105], bb[105]-bt[105], 10*sfac[105]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[105]=paper.setFinish(); 
t[105].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[106]=paper.text(nx[106],ny[106]-10,'Energy\nfrom Coal').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[106]});
t[106].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Coal-Power/#Energy from Coal", target: "_top",title:"Click to jump to concept"});
}); 
t[106].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[106].getBBox(); 
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
yicon = bb[106]-25; 
xicon2 = nx[106]+-40; 
xicon3 = nx[106]+-10; 
xicon4 = nx[106]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Coal-Power/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Coal-Power/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[106], bt[106], br[106]-bl[106], bb[106]-bt[106], 10*sfac[106]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[106]=paper.setFinish(); 
t[106].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[107]=paper.text(nx[107],ny[107]-10,'Mesozoic Plate\nTectonics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[107]});
t[107].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mesozoic-Plate-Tectonics/#Mesozoic Plate Tectonics", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Mesozoic-Plate-Tectonics/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mesozoic-Plate-Tectonics/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[107], bt[107], br[107]-bl[107], bb[107]-bt[107], 10*sfac[107]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[107]=paper.setFinish(); 
t[107].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[108]=paper.text(nx[108],ny[108]-10,'Topographic, Bathymetric and\nGeologic Maps').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[108]});
t[108].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Studying-the-Seafloor/#Topographic, Bathymetric and Geologic Maps", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Studying-the-Seafloor/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Studying-the-Seafloor/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[108], bt[108], br[108]-bl[108], bb[108]-bt[108], 10*sfac[108]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[108]=paper.setFinish(); 
t[108].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[109]=paper.text(nx[109],ny[109],'Types of Volcanic Eruptions').attr({fill:"#666666","font-size": 14*sfac[109]});
tBox=t[109].getBBox(); 
bt[109]=ny[109]-(tBox.height/2+10*sfac[109]);
bb[109]=ny[109]+(tBox.height/2+10*sfac[109]);
bl[109]=nx[109]-(tBox.width/2+10*sfac[109]);
br[109]=nx[109]+(tBox.width/2+10*sfac[109]);
paper.setStart(); 
rect=paper.rect(bl[109], bt[109], br[109]-bl[109], bb[109]-bt[109], 10*sfac[109]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[109]=paper.setFinish(); 

t[110]=paper.text(nx[110],ny[110]-10,'Intraplate Activity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[110]});
t[110].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Intraplate-Activity/#Intraplate Activity", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Intraplate-Activity/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[110], bt[110], br[110]-bl[110], bb[110]-bt[110], 10*sfac[110]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[110]=paper.setFinish(); 
t[110].toFront(); 
vidicon.toFront(); 

t[111]=paper.text(nx[111],ny[111]-10,'Extinction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[111]});
t[111].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Extinction-and-Radiation-of-Life/#Extinction", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Extinction-and-Radiation-of-Life/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Extinction-and-Radiation-of-Life/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[111], bt[111], br[111]-bl[111], bb[111]-bt[111], 10*sfac[111]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[111]=paper.setFinish(); 
t[111].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[112]=paper.text(nx[112],ny[112]-10,"Earth's\nCrust").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[112]});
t[112].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Crust/#Earth's Crust", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Crust/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[112], bt[112], br[112]-bl[112], bb[112]-bt[112], 10*sfac[112]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[112]=paper.setFinish(); 
t[112].toFront(); 
exicon.toFront(); 

t[113]=paper.text(nx[113],ny[113]-10,'The Greenhouse Effect').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[113]});
t[113].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Greenhouse-Effect/#The Greenhouse Effect", target: "_top",title:"Click to jump to concept"});
}); 
t[113].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[113].getBBox(); 
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
yicon = bb[113]-25; 
xicon2 = nx[113]+-40; 
xicon3 = nx[113]+-10; 
xicon4 = nx[113]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Greenhouse-Effect/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Greenhouse-Effect/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Greenhouse-Effect/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[113], bt[113], br[113]-bl[113], bb[113]-bt[113], 10*sfac[113]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[113]=paper.setFinish(); 
t[113].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[114]=paper.text(nx[114],ny[114]-10,'Mercury Pollution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[114]});
t[114].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mercury-Pollution/#Mercury Pollution", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Mercury-Pollution/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mercury-Pollution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[114], bt[114], br[114]-bl[114], bb[114]-bt[114], 10*sfac[114]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[114]=paper.setFinish(); 
t[114].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[115]=paper.text(nx[115],ny[115]-10,'Types of Marine Organisms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[115]});
t[115].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Types-of-Marine-Organisms/#Types of Marine Organisms", target: "_top",title:"Click to jump to concept"});
}); 
t[115].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[115].getBBox(); 
bt[115]=ny[115]-10-(tBox.height/2+10*sfac[115]);
bb[115]=ny[115]-10+(tBox.height/2+10*sfac[115]);
bl[115]=nx[115]-(tBox.width/2+10*sfac[115]);
br[115]=nx[115]+(tBox.width/2+10*sfac[115]);
var nwidth = br[115]-bl[115]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[115] = bl[115] - delta; 
    br[115] = br[115] + delta; 
} 
bb[115] = bb[115]+20; 
yicon = bb[115]-25; 
xicon2 = nx[115]+-40; 
xicon3 = nx[115]+-10; 
xicon4 = nx[115]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Marine-Organisms/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Marine-Organisms/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[115], bt[115], br[115]-bl[115], bb[115]-bt[115], 10*sfac[115]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[115]=paper.setFinish(); 
t[115].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[116]=paper.text(nx[116],ny[116],'Fossils').attr({fill:"#666666","font-size": 14*sfac[116]});
tBox=t[116].getBBox(); 
bt[116]=ny[116]-(tBox.height/2+10*sfac[116]);
bb[116]=ny[116]+(tBox.height/2+10*sfac[116]);
bl[116]=nx[116]-(tBox.width/2+10*sfac[116]);
br[116]=nx[116]+(tBox.width/2+10*sfac[116]);
paper.setStart(); 
rect=paper.rect(bl[116], bt[116], br[116]-bl[116], bb[116]-bt[116], 10*sfac[116]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[116]=paper.setFinish(); 

t[117]=paper.text(nx[117],ny[117]-10,'Lithosphere and\nAsthenosphere').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[117]});
t[117].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Lithosphere-and-Asthenosphere/#Lithosphere and Asthenosphere", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Lithosphere-and-Asthenosphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[117], bt[117], br[117]-bl[117], bb[117]-bt[117], 10*sfac[117]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[117]=paper.setFinish(); 
t[117].toFront(); 
exicon.toFront(); 

t[118]=paper.text(nx[118],ny[118]-10,'Water Conservation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[118]});
t[118].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Protecting-Water-From-Pollution/#Water Conservation", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Protecting-Water-From-Pollution/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Protecting-Water-From-Pollution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[118], bt[118], br[118]-bl[118], bb[118]-bt[118], 10*sfac[118]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[118]=paper.setFinish(); 
t[118].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[119]=paper.text(nx[119],ny[119],'Erosion and Deposition').attr({fill:"#666666","font-size": 14*sfac[119]});
tBox=t[119].getBBox(); 
bt[119]=ny[119]-(tBox.height/2+10*sfac[119]);
bb[119]=ny[119]+(tBox.height/2+10*sfac[119]);
bl[119]=nx[119]-(tBox.width/2+10*sfac[119]);
br[119]=nx[119]+(tBox.width/2+10*sfac[119]);
paper.setStart(); 
rect=paper.rect(bl[119], bt[119], br[119]-bl[119], bb[119]-bt[119], 10*sfac[119]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[119]=paper.setFinish(); 

t[120]=paper.text(nx[120],ny[120]-10,'Solar Energy on Earth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[120]});
t[120].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Solar-Energy-on-Earth/#Solar Energy on Earth", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Solar-Energy-on-Earth/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Solar-Energy-on-Earth/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Solar-Energy-on-Earth/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[120], bt[120], br[120]-bl[120], bb[120]-bt[120], 10*sfac[120]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[120]=paper.setFinish(); 
t[120].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[121]=paper.text(nx[121],ny[121]-10,'Hazardous Waste\nPrevention').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[121]});
t[121].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Preventing-Hazardous-Waste-Problems/#Hazardous Waste Prevention", target: "_top",title:"Click to jump to concept"});
}); 
t[121].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[121].getBBox(); 
bt[121]=ny[121]-10-(tBox.height/2+10*sfac[121]);
bb[121]=ny[121]-10+(tBox.height/2+10*sfac[121]);
bl[121]=nx[121]-(tBox.width/2+10*sfac[121]);
br[121]=nx[121]+(tBox.width/2+10*sfac[121]);
var nwidth = br[121]-bl[121]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[121] = bl[121] - delta; 
    br[121] = br[121] + delta; 
} 
bb[121] = bb[121]+20; 
yicon = bb[121]-25; 
xicon2 = nx[121]+-40; 
xicon3 = nx[121]+-10; 
xicon4 = nx[121]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Preventing-Hazardous-Waste-Problems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Preventing-Hazardous-Waste-Problems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[121], bt[121], br[121]-bl[121], bb[121]-bt[121], 10*sfac[121]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[121]=paper.setFinish(); 
t[121].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[122]=paper.text(nx[122],ny[122]-10,'Wind\nEnergy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[122]});
t[122].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Wind-Power/#Wind Energy", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Wind-Power/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[122], bt[122], br[122]-bl[122], bb[122]-bt[122], 10*sfac[122]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[122]=paper.setFinish(); 
t[122].toFront(); 
exicon.toFront(); 

t[123]=paper.text(nx[123],ny[123]-10,'Climate Change').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[123]});
t[123].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reducing-Greenhouse-Gas-Pollution/#Climate Change", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Reducing-Greenhouse-Gas-Pollution/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Reducing-Greenhouse-Gas-Pollution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Reducing-Greenhouse-Gas-Pollution/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[123], bt[123], br[123]-bl[123], bb[123]-bt[123], 10*sfac[123]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[123]=paper.setFinish(); 
t[123].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[124]=paper.text(nx[124],ny[124]-10,'Hazardous Waste\nin Soil').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[124]});
t[124].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Hazardous-Waste/#Hazardous Waste in Soil", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Hazardous-Waste/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[124], bt[124], br[124]-bl[124], bb[124]-bt[124], 10*sfac[124]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[124]=paper.setFinish(); 
t[124].toFront(); 
exicon.toFront(); 

t[125]=paper.text(nx[125],ny[125],'Non-Renewable Energy\nResources').attr({fill:"#666666","font-size": 14*sfac[125]});
tBox=t[125].getBBox(); 
bt[125]=ny[125]-(tBox.height/2+10*sfac[125]);
bb[125]=ny[125]+(tBox.height/2+10*sfac[125]);
bl[125]=nx[125]-(tBox.width/2+10*sfac[125]);
br[125]=nx[125]+(tBox.width/2+10*sfac[125]);
paper.setStart(); 
rect=paper.rect(bl[125], bt[125], br[125]-bl[125], bb[125]-bt[125], 10*sfac[125]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[125]=paper.setFinish(); 

t[126]=paper.text(nx[126],ny[126]-10,'Thermosphere').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[126]});
t[126].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Thermosphere-and-Beyond/#Thermosphere", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Thermosphere-and-Beyond/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Thermosphere-and-Beyond/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Thermosphere-and-Beyond/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[126], bt[126], br[126]-bl[126], bb[126]-bt[126], 10*sfac[126]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[126]=paper.setFinish(); 
t[126].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[127]=paper.text(nx[127],ny[127],'The Solar System').attr({fill:"#666666","font-size": 14*sfac[127]});
tBox=t[127].getBBox(); 
bt[127]=ny[127]-(tBox.height/2+10*sfac[127]);
bb[127]=ny[127]+(tBox.height/2+10*sfac[127]);
bl[127]=nx[127]-(tBox.width/2+10*sfac[127]);
br[127]=nx[127]+(tBox.width/2+10*sfac[127]);
paper.setStart(); 
rect=paper.rect(bl[127], bt[127], br[127]-bl[127], bb[127]-bt[127], 10*sfac[127]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[127]=paper.setFinish(); 

t[128]=paper.text(nx[128],ny[128]-10,'Global Wind Belts').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[128]});
t[128].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Global-Wind-Belts/#Global Wind Belts", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Global-Wind-Belts/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Global-Wind-Belts/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[128], bt[128], br[128]-bl[128], bb[128]-bt[128], 10*sfac[128]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[128]=paper.setFinish(); 
t[128].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[129]=paper.text(nx[129],ny[129],'Water on Earth').attr({fill:"#666666","font-size": 14*sfac[129]});
tBox=t[129].getBBox(); 
bt[129]=ny[129]-(tBox.height/2+10*sfac[129]);
bb[129]=ny[129]+(tBox.height/2+10*sfac[129]);
bl[129]=nx[129]-(tBox.width/2+10*sfac[129]);
br[129]=nx[129]+(tBox.width/2+10*sfac[129]);
paper.setStart(); 
rect=paper.rect(bl[129], bt[129], br[129]-bl[129], bb[129]-bt[129], 10*sfac[129]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[129]=paper.setFinish(); 

t[130]=paper.text(nx[130],ny[130],'Life in the Phanerozoic').attr({fill:"#666666","font-size": 14*sfac[130]});
tBox=t[130].getBBox(); 
bt[130]=ny[130]-(tBox.height/2+10*sfac[130]);
bb[130]=ny[130]+(tBox.height/2+10*sfac[130]);
bl[130]=nx[130]-(tBox.width/2+10*sfac[130]);
br[130]=nx[130]+(tBox.width/2+10*sfac[130]);
paper.setStart(); 
rect=paper.rect(bl[130], bt[130], br[130]-bl[130], bb[130]-bt[130], 10*sfac[130]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[130]=paper.setFinish(); 

t[131]=paper.text(nx[131],ny[131],'Scientific Method').attr({fill:"#666666","font-size": 14*sfac[131]});
tBox=t[131].getBBox(); 
bt[131]=ny[131]-(tBox.height/2+10*sfac[131]);
bb[131]=ny[131]+(tBox.height/2+10*sfac[131]);
bl[131]=nx[131]-(tBox.width/2+10*sfac[131]);
br[131]=nx[131]+(tBox.width/2+10*sfac[131]);
paper.setStart(); 
rect=paper.rect(bl[131], bt[131], br[131]-bl[131], bb[131]-bt[131], 10*sfac[131]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[131]=paper.setFinish(); 

t[132]=paper.text(nx[132],ny[132],'Space Stations').attr({fill:"#666666","font-size": 14*sfac[132]});
tBox=t[132].getBBox(); 
bt[132]=ny[132]-(tBox.height/2+10*sfac[132]);
bb[132]=ny[132]+(tBox.height/2+10*sfac[132]);
bl[132]=nx[132]-(tBox.width/2+10*sfac[132]);
br[132]=nx[132]+(tBox.width/2+10*sfac[132]);
paper.setStart(); 
rect=paper.rect(bl[132], bt[132], br[132]-bl[132], bb[132]-bt[132], 10*sfac[132]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[132]=paper.setFinish(); 

t[133]=paper.text(nx[133],ny[133],'Controlling Ocean Pollution').attr({fill:"#666666","font-size": 14*sfac[133]});
tBox=t[133].getBBox(); 
bt[133]=ny[133]-(tBox.height/2+10*sfac[133]);
bb[133]=ny[133]+(tBox.height/2+10*sfac[133]);
bl[133]=nx[133]-(tBox.width/2+10*sfac[133]);
br[133]=nx[133]+(tBox.width/2+10*sfac[133]);
paper.setStart(); 
rect=paper.rect(bl[133], bt[133], br[133]-bl[133], bb[133]-bt[133], 10*sfac[133]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[133]=paper.setFinish(); 

t[134]=paper.text(nx[134],ny[134]-10,'Comets').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[134]});
t[134].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Comets/#Comets", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Comets/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[134], bt[134], br[134]-bl[134], bb[134]-bt[134], 10*sfac[134]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[134]=paper.setFinish(); 
t[134].toFront(); 
exicon.toFront(); 

t[135]=paper.text(nx[135],ny[135],'Fresh Water').attr({fill:"#666666","font-size": 14*sfac[135]});
tBox=t[135].getBBox(); 
bt[135]=ny[135]-(tBox.height/2+10*sfac[135]);
bb[135]=ny[135]+(tBox.height/2+10*sfac[135]);
bl[135]=nx[135]-(tBox.width/2+10*sfac[135]);
br[135]=nx[135]+(tBox.width/2+10*sfac[135]);
paper.setStart(); 
rect=paper.rect(bl[135], bt[135], br[135]-bl[135], bb[135]-bt[135], 10*sfac[135]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[135]=paper.setFinish(); 

t[136]=paper.text(nx[136],ny[136],'Wetlands').attr({fill:"#666666","font-size": 14*sfac[136]});
tBox=t[136].getBBox(); 
bt[136]=ny[136]-(tBox.height/2+10*sfac[136]);
bb[136]=ny[136]+(tBox.height/2+10*sfac[136]);
bl[136]=nx[136]-(tBox.width/2+10*sfac[136]);
br[136]=nx[136]+(tBox.width/2+10*sfac[136]);
paper.setStart(); 
rect=paper.rect(bl[136], bt[136], br[136]-bl[136], bb[136]-bt[136], 10*sfac[136]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[136]=paper.setFinish(); 

t[137]=paper.text(nx[137],ny[137],'Surface Water Pollution').attr({fill:"#666666","font-size": 14*sfac[137]});
tBox=t[137].getBBox(); 
bt[137]=ny[137]-(tBox.height/2+10*sfac[137]);
bb[137]=ny[137]+(tBox.height/2+10*sfac[137]);
bl[137]=nx[137]-(tBox.width/2+10*sfac[137]);
br[137]=nx[137]+(tBox.width/2+10*sfac[137]);
paper.setStart(); 
rect=paper.rect(bl[137], bt[137], br[137]-bl[137], bb[137]-bt[137], 10*sfac[137]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[137]=paper.setFinish(); 

t[138]=paper.text(nx[138],ny[138]-10,'Effects of the Oceans\non Planet Earth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[138]});
t[138].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Importance-of-the-Oceans/#Effects of the Oceans on Planet Earth", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Importance-of-the-Oceans/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[138], bt[138], br[138]-bl[138], bb[138]-bt[138], 10*sfac[138]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[138]=paper.setFinish(); 
t[138].toFront(); 
exicon.toFront(); 

t[139]=paper.text(nx[139],ny[139]-10,"Earth's\nRotation").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[139]});
t[139].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Rotation-of-Earth/#Earth's Rotation", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Rotation-of-Earth/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Rotation-of-Earth/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[139], bt[139], br[139]-bl[139], bb[139]-bt[139], 10*sfac[139]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[139]=paper.setFinish(); 
t[139].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[140]=paper.text(nx[140],ny[140]-10,'Earthquake-Safe Structures').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[140]});
t[140].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Earthquake-Safe-Structures/#Earthquake-Safe Structures", target: "_top",title:"Click to jump to concept"});
}); 
t[140].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[140].getBBox(); 
bt[140]=ny[140]-10-(tBox.height/2+10*sfac[140]);
bb[140]=ny[140]-10+(tBox.height/2+10*sfac[140]);
bl[140]=nx[140]-(tBox.width/2+10*sfac[140]);
br[140]=nx[140]+(tBox.width/2+10*sfac[140]);
var nwidth = br[140]-bl[140]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[140] = bl[140] - delta; 
    br[140] = br[140] + delta; 
} 
bb[140] = bb[140]+20; 
yicon = bb[140]-25; 
xicon2 = nx[140]+-40; 
xicon3 = nx[140]+-10; 
xicon4 = nx[140]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Earthquake-Safe-Structures/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Earthquake-Safe-Structures/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[140], bt[140], br[140]-bl[140], bb[140]-bt[140], 10*sfac[140]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[140]=paper.setFinish(); 
t[140].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[141]=paper.text(nx[141],ny[141]-10,'Continental Drift').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[141]});
t[141].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Evidence-for-Continental-Drift/#Continental Drift", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Evidence-for-Continental-Drift/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Evidence-for-Continental-Drift/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[141], bt[141], br[141]-bl[141], bb[141]-bt[141], 10*sfac[141]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[141]=paper.setFinish(); 
t[141].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[142]=paper.text(nx[142],ny[142],'Relationship of the Sun and\nthe Earth-Moon System').attr({fill:"#666666","font-size": 14*sfac[142]});
tBox=t[142].getBBox(); 
bt[142]=ny[142]-(tBox.height/2+10*sfac[142]);
bb[142]=ny[142]+(tBox.height/2+10*sfac[142]);
bl[142]=nx[142]-(tBox.width/2+10*sfac[142]);
br[142]=nx[142]+(tBox.width/2+10*sfac[142]);
paper.setStart(); 
rect=paper.rect(bl[142], bt[142], br[142]-bl[142], bb[142]-bt[142], 10*sfac[142]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[142]=paper.setFinish(); 

t[143]=paper.text(nx[143],ny[143]-10,"Earth's Interior Revealed Through\nSeismic Waves").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[143]});
t[143].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Using-Seismic-Waves-to-Understand-the-Interior/#Earth's Interior Revealed Through Seismic Waves", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Using-Seismic-Waves-to-Understand-the-Interior/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Using-Seismic-Waves-to-Understand-the-Interior/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[143], bt[143], br[143]-bl[143], bb[143]-bt[143], 10*sfac[143]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[143]=paper.setFinish(); 
t[143].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[144]=paper.text(nx[144],ny[144]-10,'Inner versus Outer Planets').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[144]});
t[144].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Inner-versus-Outer-Planets/#Inner versus Outer Planets", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Inner-versus-Outer-Planets/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[144], bt[144], br[144]-bl[144], bb[144]-bt[144], 10*sfac[144]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[144]=paper.setFinish(); 
t[144].toFront(); 
exicon.toFront(); 

t[145]=paper.text(nx[145],ny[145],"Stress in Earth's Crust").attr({fill:"#666666","font-size": 14*sfac[145]});
tBox=t[145].getBBox(); 
bt[145]=ny[145]-(tBox.height/2+10*sfac[145]);
bb[145]=ny[145]+(tBox.height/2+10*sfac[145]);
bl[145]=nx[145]-(tBox.width/2+10*sfac[145]);
br[145]=nx[145]+(tBox.width/2+10*sfac[145]);
paper.setStart(); 
rect=paper.rect(bl[145], bt[145], br[145]-bl[145], bb[145]-bt[145], 10*sfac[145]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[145]=paper.setFinish(); 

t[146]=paper.text(nx[146],ny[146]-10,'Ocean\nTides').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[146]});
t[146].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Tides/#Ocean Tides", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Tides/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tides/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[146], bt[146], br[146]-bl[146], bb[146]-bt[146], 10*sfac[146]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[146]=paper.setFinish(); 
t[146].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[147]=paper.text(nx[147],ny[147],'Species Relationships').attr({fill:"#666666","font-size": 14*sfac[147]});
tBox=t[147].getBBox(); 
bt[147]=ny[147]-(tBox.height/2+10*sfac[147]);
bb[147]=ny[147]+(tBox.height/2+10*sfac[147]);
bl[147]=nx[147]-(tBox.width/2+10*sfac[147]);
br[147]=nx[147]+(tBox.width/2+10*sfac[147]);
paper.setStart(); 
rect=paper.rect(bl[147], bt[147], br[147]-bl[147], bb[147]-bt[147], 10*sfac[147]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[147]=paper.setFinish(); 

t[148]=paper.text(nx[148],ny[148]-10,'Earthquakes at Transform\nPlate Boundaries').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[148]});
t[148].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Earthquakes-at-Transform-Plate-Boundaries/#Earthquakes at Transform Plate Boundaries", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Earthquakes-at-Transform-Plate-Boundaries/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Earthquakes-at-Transform-Plate-Boundaries/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[148], bt[148], br[148]-bl[148], bb[148]-bt[148], 10*sfac[148]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[148]=paper.setFinish(); 
t[148].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[149]=paper.text(nx[149],ny[149]-10,'Influence of Parent Material and\nClimate on Weathering').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[149]});
t[149].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Influences-on-Weathering/#Influence of Parent Material and Climate on Weathering", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Influences-on-Weathering/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Influences-on-Weathering/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[149], bt[149], br[149]-bl[149], bb[149]-bt[149], 10*sfac[149]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[149]=paper.setFinish(); 
t[149].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[150]=paper.text(nx[150],ny[150]-10,'Weathering').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[150]});
t[150].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Introduction-to-Weathering/#Weathering", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-Weathering/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-Weathering/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[150], bt[150], br[150]-bl[150], bb[150]-bt[150], 10*sfac[150]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[150]=paper.setFinish(); 
t[150].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[151]=paper.text(nx[151],ny[151]-10,'Human\nPopulation Growth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[151]});
t[151].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Growth-of-Human-Populations/#Human Population Growth", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Growth-of-Human-Populations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Growth-of-Human-Populations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[151], bt[151], br[151]-bl[151], bb[151]-bt[151], 10*sfac[151]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[151]=paper.setFinish(); 
t[151].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[152]=paper.text(nx[152],ny[152]-10,'Adaptation and Evolution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[152]});
t[152].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Adaptation-and-Evolution-of-Populations/#Adaptation and Evolution", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Adaptation-and-Evolution-of-Populations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Adaptation-and-Evolution-of-Populations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[152], bt[152], br[152]-bl[152], bb[152]-bt[152], 10*sfac[152]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[152]=paper.setFinish(); 
t[152].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[153]=paper.text(nx[153],ny[153]-10,'The Carbon Cycle').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[153]});
t[153].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Carbon-Cycle-and-Climate/#The Carbon Cycle", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Carbon-Cycle-and-Climate/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Carbon-Cycle-and-Climate/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[153], bt[153], br[153]-bl[153], bb[153]-bt[153], 10*sfac[153]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[153]=paper.setFinish(); 
t[153].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[154]=paper.text(nx[154],ny[154],'Soil Erosion').attr({fill:"#666666","font-size": 14*sfac[154]});
tBox=t[154].getBBox(); 
bt[154]=ny[154]-(tBox.height/2+10*sfac[154]);
bb[154]=ny[154]+(tBox.height/2+10*sfac[154]);
bl[154]=nx[154]-(tBox.width/2+10*sfac[154]);
br[154]=nx[154]+(tBox.width/2+10*sfac[154]);
paper.setStart(); 
rect=paper.rect(bl[154], bt[154], br[154]-bl[154], bb[154]-bt[154], 10*sfac[154]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[154]=paper.setFinish(); 

t[155]=paper.text(nx[155],ny[155]-10,'The Nature of Science').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[155]});
t[155].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Sciences-Basis-on-Fact/#The Nature of Science", target: "_top",title:"Click to jump to concept"});
}); 
t[155].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[155].getBBox(); 
bt[155]=ny[155]-10-(tBox.height/2+10*sfac[155]);
bb[155]=ny[155]-10+(tBox.height/2+10*sfac[155]);
bl[155]=nx[155]-(tBox.width/2+10*sfac[155]);
br[155]=nx[155]+(tBox.width/2+10*sfac[155]);
var nwidth = br[155]-bl[155]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[155] = bl[155] - delta; 
    br[155] = br[155] + delta; 
} 
bb[155] = bb[155]+20; 
yicon = bb[155]-25; 
xicon2 = nx[155]+-40; 
xicon3 = nx[155]+-10; 
xicon4 = nx[155]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Sciences-Basis-on-Fact/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Sciences-Basis-on-Fact/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[155], bt[155], br[155]-bl[155], bb[155]-bt[155], 10*sfac[155]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[155]=paper.setFinish(); 
t[155].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[156]=paper.text(nx[156],ny[156],'Dry Climates').attr({fill:"#666666","font-size": 14*sfac[156]});
tBox=t[156].getBBox(); 
bt[156]=ny[156]-(tBox.height/2+10*sfac[156]);
bb[156]=ny[156]+(tBox.height/2+10*sfac[156]);
bl[156]=nx[156]-(tBox.width/2+10*sfac[156]);
br[156]=nx[156]+(tBox.width/2+10*sfac[156]);
paper.setStart(); 
rect=paper.rect(bl[156], bt[156], br[156]-bl[156], bb[156]-bt[156], 10*sfac[156]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[156]=paper.setFinish(); 

t[157]=paper.text(nx[157],ny[157]-10,'Human Evolution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[157]});
t[157].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Human-Evolution/#Human Evolution", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Human-Evolution/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Human-Evolution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[157], bt[157], br[157]-bl[157], bb[157]-bt[157], 10*sfac[157]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[157]=paper.setFinish(); 
t[157].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[158]=paper.text(nx[158],ny[158],'Seismic Waves').attr({fill:"#666666","font-size": 14*sfac[158]});
tBox=t[158].getBBox(); 
bt[158]=ny[158]-(tBox.height/2+10*sfac[158]);
bb[158]=ny[158]+(tBox.height/2+10*sfac[158]);
bl[158]=nx[158]-(tBox.width/2+10*sfac[158]);
br[158]=nx[158]+(tBox.width/2+10*sfac[158]);
paper.setStart(); 
rect=paper.rect(bl[158], bt[158], br[158]-bl[158], bb[158]-bt[158], 10*sfac[158]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[158]=paper.setFinish(); 

t[159]=paper.text(nx[159],ny[159]-10,'Lithification').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[159]});
t[159].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Lithification-of-Sedimentary-Rocks/#Lithification", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Lithification-of-Sedimentary-Rocks/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Lithification-of-Sedimentary-Rocks/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[159], bt[159], br[159]-bl[159], bb[159]-bt[159], 10*sfac[159]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[159]=paper.setFinish(); 
t[159].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[160]=paper.text(nx[160],ny[160],'World Climates').attr({fill:"#666666","font-size": 14*sfac[160]});
tBox=t[160].getBBox(); 
bt[160]=ny[160]-(tBox.height/2+10*sfac[160]);
bb[160]=ny[160]+(tBox.height/2+10*sfac[160]);
bl[160]=nx[160]-(tBox.width/2+10*sfac[160]);
br[160]=nx[160]+(tBox.width/2+10*sfac[160]);
paper.setStart(); 
rect=paper.rect(bl[160], bt[160], br[160]-bl[160], bb[160]-bt[160], 10*sfac[160]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[160]=paper.setFinish(); 

t[161]=paper.text(nx[161],ny[161]-10,'Geothermal\nEnergy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[161]});
t[161].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Geothermal-Power/#Geothermal Energy", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Geothermal-Power/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Geothermal-Power/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[161], bt[161], br[161]-bl[161], bb[161]-bt[161], 10*sfac[161]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[161]=paper.setFinish(); 
t[161].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[162]=paper.text(nx[162],ny[162]-10,'Geologic\nHorizontality').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[162]});
t[162].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Principle-of-Horizontality/#Geologic Horizontality", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Principle-of-Horizontality/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Principle-of-Horizontality/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[162], bt[162], br[162]-bl[162], bb[162]-bt[162], 10*sfac[162]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[162]=paper.setFinish(); 
t[162].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[163]=paper.text(nx[163],ny[163],'Moist Subtropical\nMid-latitude Climates').attr({fill:"#666666","font-size": 14*sfac[163]});
tBox=t[163].getBBox(); 
bt[163]=ny[163]-(tBox.height/2+10*sfac[163]);
bb[163]=ny[163]+(tBox.height/2+10*sfac[163]);
bl[163]=nx[163]-(tBox.width/2+10*sfac[163]);
br[163]=nx[163]+(tBox.width/2+10*sfac[163]);
paper.setStart(); 
rect=paper.rect(bl[163], bt[163], br[163]-bl[163], bb[163]-bt[163], 10*sfac[163]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[163]=paper.setFinish(); 

t[164]=paper.text(nx[164],ny[164]-10,'Theories').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[164]});
t[164].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Development-of-Theories/#Theories", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Development-of-Theories/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Development-of-Theories/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[164], bt[164], br[164]-bl[164], bb[164]-bt[164], 10*sfac[164]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[164]=paper.setFinish(); 
t[164].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[165]=paper.text(nx[165],ny[165]-10,"Stars' Lives").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[165]});
t[165].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Lives-of-Stars/#Stars' Lives", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Lives-of-Stars/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Lives-of-Stars/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[165], bt[165], br[165]-bl[165], bb[165]-bt[165], 10*sfac[165]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[165]=paper.setFinish(); 
t[165].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[166]=paper.text(nx[166],ny[166]-10,"Earth's Magnetic\nField").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[166]});
t[166].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Magnetic-Field/#Earth's Magnetic Field", target: "_top",title:"Click to jump to concept"});
}); 
t[166].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[166].getBBox(); 
bt[166]=ny[166]-10-(tBox.height/2+10*sfac[166]);
bb[166]=ny[166]-10+(tBox.height/2+10*sfac[166]);
bl[166]=nx[166]-(tBox.width/2+10*sfac[166]);
br[166]=nx[166]+(tBox.width/2+10*sfac[166]);
var nwidth = br[166]-bl[166]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[166] = bl[166] - delta; 
    br[166] = br[166] + delta; 
} 
bb[166] = bb[166]+20; 
yicon = bb[166]-25; 
xicon2 = nx[166]+-40; 
xicon3 = nx[166]+-10; 
xicon4 = nx[166]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Magnetic-Field/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[166], bt[166], br[166]-bl[166], bb[166]-bt[166], 10*sfac[166]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[166]=paper.setFinish(); 
t[166].toFront(); 
exicon.toFront(); 

t[167]=paper.text(nx[167],ny[167]-10,"Earth's\nCore").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[167]});
t[167].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Core/#Earth's Core", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Core/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Core/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[167], bt[167], br[167]-bl[167], bb[167]-bt[167], 10*sfac[167]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[167]=paper.setFinish(); 
t[167].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[168]=paper.text(nx[168],ny[168],'Atmospheric Circulation').attr({fill:"#666666","font-size": 14*sfac[168]});
tBox=t[168].getBBox(); 
bt[168]=ny[168]-(tBox.height/2+10*sfac[168]);
bb[168]=ny[168]+(tBox.height/2+10*sfac[168]);
bl[168]=nx[168]-(tBox.width/2+10*sfac[168]);
br[168]=nx[168]+(tBox.width/2+10*sfac[168]);
paper.setStart(); 
rect=paper.rect(bl[168], bt[168], br[168]-bl[168], bb[168]-bt[168], 10*sfac[168]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[168]=paper.setFinish(); 

t[169]=paper.text(nx[169],ny[169]-10,'Air Masses').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[169]});
t[169].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Air-Masses/#Air Masses", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Air-Masses/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[169], bt[169], br[169]-bl[169], bb[169]-bt[169], 10*sfac[169]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[169]=paper.setFinish(); 
t[169].toFront(); 
exicon.toFront(); 

t[170]=paper.text(nx[170],ny[170],"Wegener's Evidence for\nContinental Drift").attr({fill:"#666666","font-size": 14*sfac[170]});
tBox=t[170].getBBox(); 
bt[170]=ny[170]-(tBox.height/2+10*sfac[170]);
bb[170]=ny[170]+(tBox.height/2+10*sfac[170]);
bl[170]=nx[170]-(tBox.width/2+10*sfac[170]);
br[170]=nx[170]+(tBox.width/2+10*sfac[170]);
paper.setStart(); 
rect=paper.rect(bl[170], bt[170], br[170]-bl[170], bb[170]-bt[170], 10*sfac[170]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[170]=paper.setFinish(); 

t[171]=paper.text(nx[171],ny[171]-10,'Igneous Rock Starting Materials').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[171]});
t[171].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Starting-Materials-of-Igneous-Rocks/#Igneous Rock Starting Materials", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Starting-Materials-of-Igneous-Rocks/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Starting-Materials-of-Igneous-Rocks/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[171], bt[171], br[171]-bl[171], bb[171]-bt[171], 10*sfac[171]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[171]=paper.setFinish(); 
t[171].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[172]=paper.text(nx[172],ny[172]-10,'Protecting Groundwater').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[172]});
t[172].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Cleaning-Up-Groundwater/#Protecting Groundwater", target: "_top",title:"Click to jump to concept"});
}); 
t[172].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[172].getBBox(); 
bt[172]=ny[172]-10-(tBox.height/2+10*sfac[172]);
bb[172]=ny[172]-10+(tBox.height/2+10*sfac[172]);
bl[172]=nx[172]-(tBox.width/2+10*sfac[172]);
br[172]=nx[172]+(tBox.width/2+10*sfac[172]);
var nwidth = br[172]-bl[172]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[172] = bl[172] - delta; 
    br[172] = br[172] + delta; 
} 
bb[172] = bb[172]+20; 
yicon = bb[172]-25; 
xicon2 = nx[172]+-40; 
xicon3 = nx[172]+-10; 
xicon4 = nx[172]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Cleaning-Up-Groundwater/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[172], bt[172], br[172]-bl[172], bb[172]-bt[172], 10*sfac[172]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[172]=paper.setFinish(); 
t[172].toFront(); 
vidicon.toFront(); 

t[173]=paper.text(nx[173],ny[173]-10,'Fossil Fuel Formation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[173]});
t[173].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Fossil-Fuel-Formation/#Fossil Fuel Formation", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Fossil-Fuel-Formation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Fossil-Fuel-Formation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[173], bt[173], br[173]-bl[173], bb[173]-bt[173], 10*sfac[173]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[173]=paper.setFinish(); 
t[173].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[174]=paper.text(nx[174],ny[174]-10,'Evolution of Simple Cells').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[174]});
t[174].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Evolution-of-Simple-Cells/#Evolution of Simple Cells", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Evolution-of-Simple-Cells/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Evolution-of-Simple-Cells/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[174], bt[174], br[174]-bl[174], bb[174]-bt[174], 10*sfac[174]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[174]=paper.setFinish(); 
t[174].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[175]=paper.text(nx[175],ny[175],'Space Shuttles').attr({fill:"#666666","font-size": 14*sfac[175]});
tBox=t[175].getBBox(); 
bt[175]=ny[175]-(tBox.height/2+10*sfac[175]);
bb[175]=ny[175]+(tBox.height/2+10*sfac[175]);
bl[175]=nx[175]-(tBox.width/2+10*sfac[175]);
br[175]=nx[175]+(tBox.width/2+10*sfac[175]);
paper.setStart(); 
rect=paper.rect(bl[175], bt[175], br[175]-bl[175], bb[175]-bt[175], 10*sfac[175]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[175]=paper.setFinish(); 

t[176]=paper.text(nx[176],ny[176],'Rocks').attr({fill:"#666666","font-size": 14*sfac[176]});
tBox=t[176].getBBox(); 
bt[176]=ny[176]-(tBox.height/2+10*sfac[176]);
bb[176]=ny[176]+(tBox.height/2+10*sfac[176]);
bl[176]=nx[176]-(tBox.width/2+10*sfac[176]);
br[176]=nx[176]+(tBox.width/2+10*sfac[176]);
paper.setStart(); 
rect=paper.rect(bl[176], bt[176], br[176]-bl[176], bb[176]-bt[176], 10*sfac[176]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[176]=paper.setFinish(); 

t[177]=paper.text(nx[177],ny[177]-10,'Scientific Models').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[177]});
t[177].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Scientific-Models/#Scientific Models", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Scientific-Models/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Scientific-Models/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[177], bt[177], br[177]-bl[177], bb[177]-bt[177], 10*sfac[177]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[177]=paper.setFinish(); 
t[177].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[178]=paper.text(nx[178],ny[178]-10,'Materials Used from\nthe Earth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[178]});
t[178].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Materials-We-Use/#Materials Used from the Earth", target: "_top",title:"Click to jump to concept"});
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
paper.setStart(); 
rect=paper.rect(bl[178], bt[178], br[178]-bl[178], bb[178]-bt[178], 10*sfac[178]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[178]=paper.setFinish(); 
t[178].toFront(); 

t[179]=paper.text(nx[179],ny[179],'The Phanerozoic').attr({fill:"#666666","font-size": 14*sfac[179]});
tBox=t[179].getBBox(); 
bt[179]=ny[179]-(tBox.height/2+10*sfac[179]);
bb[179]=ny[179]+(tBox.height/2+10*sfac[179]);
bl[179]=nx[179]-(tBox.width/2+10*sfac[179]);
br[179]=nx[179]+(tBox.width/2+10*sfac[179]);
paper.setStart(); 
rect=paper.rect(bl[179], bt[179], br[179]-bl[179], bb[179]-bt[179], 10*sfac[179]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[179]=paper.setFinish(); 

t[180]=paper.text(nx[180],ny[180]-10,'Types of Air Pollution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[180]});
t[180].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Types-of-Air-Pollution/#Types of Air Pollution", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Air-Pollution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Air-Pollution/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[180], bt[180], br[180]-bl[180], bb[180]-bt[180], 10*sfac[180]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[180]=paper.setFinish(); 
t[180].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[181]=paper.text(nx[181],ny[181]-10,'Distribution of Water').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[181]});
t[181].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Water-Distribution/#Distribution of Water", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Water-Distribution/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Water-Distribution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[181], bt[181], br[181]-bl[181], bb[181]-bt[181], 10*sfac[181]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[181]=paper.setFinish(); 
t[181].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[182]=paper.text(nx[182],ny[182]-10,'Modern Biodiversity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[182]});
t[182].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Modern-Biodiversity/#Modern Biodiversity", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Modern-Biodiversity/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Modern-Biodiversity/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[182], bt[182], br[182]-bl[182], bb[182]-bt[182], 10*sfac[182]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[182]=paper.setFinish(); 
t[182].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[183]=paper.text(nx[183],ny[183]-10,'Weather\nFronts').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[183]});
t[183].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Weather-Fronts/#Weather Fronts", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Weather-Fronts/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Weather-Fronts/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Weather-Fronts/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[183], bt[183], br[183]-bl[183], bb[183]-bt[183], 10*sfac[183]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[183]=paper.setFinish(); 
t[183].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[184]=paper.text(nx[184],ny[184],'Sun').attr({fill:"#666666","font-size": 14*sfac[184]});
tBox=t[184].getBBox(); 
bt[184]=ny[184]-(tBox.height/2+10*sfac[184]);
bb[184]=ny[184]+(tBox.height/2+10*sfac[184]);
bl[184]=nx[184]-(tBox.width/2+10*sfac[184]);
br[184]=nx[184]+(tBox.width/2+10*sfac[184]);
paper.setStart(); 
rect=paper.rect(bl[184], bt[184], br[184]-bl[184], bb[184]-bt[184], 10*sfac[184]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[184]=paper.setFinish(); 

t[185]=paper.text(nx[185],ny[185]-10,'Exoplanets').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[185]});
t[185].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Exoplanets/#Exoplanets", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Exoplanets/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Exoplanets/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[185], bt[185], br[185]-bl[185], bb[185]-bt[185], 10*sfac[185]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[185]=paper.setFinish(); 
t[185].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[186]=paper.text(nx[186],ny[186]-10,'Star\nClassification').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[186]});
t[186].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Classification-of-Stars/#Star Classification", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Classification-of-Stars/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[186], bt[186], br[186]-bl[186], bb[186]-bt[186], 10*sfac[186]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[186]=paper.setFinish(); 
t[186].toFront(); 
exicon.toFront(); 

t[187]=paper.text(nx[187],ny[187]-10,'Environmental Impacts of Mining').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[187]});
t[187].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Conserving-Natural-Resources/#Environmental Impacts of Mining", target: "_top",title:"Click to jump to concept"});
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
paper.setStart(); 
rect=paper.rect(bl[187], bt[187], br[187]-bl[187], bb[187]-bt[187], 10*sfac[187]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[187]=paper.setFinish(); 
t[187].toFront(); 

t[188]=paper.text(nx[188],ny[188]-10,'The Theory of Plate Tectonics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[188]});
t[188].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Plate-Tectonics-through-Earth-History/#The Theory of Plate Tectonics", target: "_top",title:"Click to jump to concept"});
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
paper.setStart(); 
rect=paper.rect(bl[188], bt[188], br[188]-bl[188], bb[188]-bt[188], 10*sfac[188]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[188]=paper.setFinish(); 
t[188].toFront(); 

t[189]=paper.text(nx[189],ny[189]-10,'Mars').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[189]});
t[189].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mars/#Mars", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Mars/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mars/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[189], bt[189], br[189]-bl[189], bb[189]-bt[189], 10*sfac[189]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[189]=paper.setFinish(); 
t[189].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[190]=paper.text(nx[190],ny[190]-10,'Uniformitarianism').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[190]});
t[190].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Present-is-the-Key-to-the-Past/#Uniformitarianism", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Present-is-the-Key-to-the-Past/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Present-is-the-Key-to-the-Past/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[190], bt[190], br[190]-bl[190], bb[190]-bt[190], 10*sfac[190]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[190]=paper.setFinish(); 
t[190].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[191]=paper.text(nx[191],ny[191]-10,'Environmental Impacts\nof Mining').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[191]});
t[191].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Environmental-Impacts-of-Mining/#Environmental Impacts of Mining", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Environmental-Impacts-of-Mining/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[191], bt[191], br[191]-bl[191], bb[191]-bt[191], 10*sfac[191]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[191]=paper.setFinish(); 
t[191].toFront(); 
vidicon.toFront(); 

t[192]=paper.text(nx[192],ny[192]-10,'Power\nSources of Stars').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[192]});
t[192].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Star-Power/#Power Sources of Stars", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Star-Power/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Star-Power/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[192], bt[192], br[192]-bl[192], bb[192]-bt[192], 10*sfac[192]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[192]=paper.setFinish(); 
t[192].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[193]=paper.text(nx[193],ny[193],'Protecting Surface Waters').attr({fill:"#666666","font-size": 14*sfac[193]});
tBox=t[193].getBBox(); 
bt[193]=ny[193]-(tBox.height/2+10*sfac[193]);
bb[193]=ny[193]+(tBox.height/2+10*sfac[193]);
bl[193]=nx[193]-(tBox.width/2+10*sfac[193]);
br[193]=nx[193]+(tBox.width/2+10*sfac[193]);
paper.setStart(); 
rect=paper.rect(bl[193], bt[193], br[193]-bl[193], bb[193]-bt[193], 10*sfac[193]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[193]=paper.setFinish(); 

t[194]=paper.text(nx[194],ny[194]-10,'Composite, Shield and\nCinder Cones').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[194]});
t[194].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Types-of-Volcanoes/#Composite, Shield and Cinder Cones", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Types-of-Volcanoes/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Volcanoes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Volcanoes/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[194], bt[194], br[194]-bl[194], bb[194]-bt[194], 10*sfac[194]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[194]=paper.setFinish(); 
t[194].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[195]=paper.text(nx[195],ny[195]-10,'Cenozoic\nLife').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[195]});
t[195].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-History-of-Cenozoic-Life/#Cenozoic Life", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-History-of-Cenozoic-Life/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-History-of-Cenozoic-Life/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[195], bt[195], br[195]-bl[195], bb[195]-bt[195], 10*sfac[195]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[195]=paper.setFinish(); 
t[195].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[196]=paper.text(nx[196],ny[196]-10,'Neptune').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[196]});
t[196].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Neptune/#Neptune", target: "_top",title:"Click to jump to concept"});
}); 
t[196].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[196].getBBox(); 
bt[196]=ny[196]-10-(tBox.height/2+10*sfac[196]);
bb[196]=ny[196]-10+(tBox.height/2+10*sfac[196]);
bl[196]=nx[196]-(tBox.width/2+10*sfac[196]);
br[196]=nx[196]+(tBox.width/2+10*sfac[196]);
var nwidth = br[196]-bl[196]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[196] = bl[196] - delta; 
    br[196] = br[196] + delta; 
} 
bb[196] = bb[196]+20; 
yicon = bb[196]-25; 
xicon2 = nx[196]+-40; 
xicon3 = nx[196]+-10; 
xicon4 = nx[196]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Neptune/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Neptune/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[196], bt[196], br[196]-bl[196], bb[196]-bt[196], 10*sfac[196]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[196]=paper.setFinish(); 
t[196].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[197]=paper.text(nx[197],ny[197]-10,'Long-Term Climate\nChanges').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[197]});
t[197].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Long-Term-Climate-Change/#Long-Term Climate Changes", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Long-Term-Climate-Change/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Long-Term-Climate-Change/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[197], bt[197], br[197]-bl[197], bb[197]-bt[197], 10*sfac[197]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[197]=paper.setFinish(); 
t[197].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[198]=paper.text(nx[198],ny[198],'Cenozoic').attr({fill:"#666666","font-size": 14*sfac[198]});
tBox=t[198].getBBox(); 
bt[198]=ny[198]-(tBox.height/2+10*sfac[198]);
bb[198]=ny[198]+(tBox.height/2+10*sfac[198]);
bl[198]=nx[198]-(tBox.width/2+10*sfac[198]);
br[198]=nx[198]+(tBox.width/2+10*sfac[198]);
paper.setStart(); 
rect=paper.rect(bl[198], bt[198], br[198]-bl[198], bb[198]-bt[198], 10*sfac[198]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[198]=paper.setFinish(); 

t[199]=paper.text(nx[199],ny[199]-10,'Precipitation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[199]});
t[199].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Precipitation/#Precipitation", target: "_top",title:"Click to jump to concept"});
}); 
t[199].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[199].getBBox(); 
bt[199]=ny[199]-10-(tBox.height/2+10*sfac[199]);
bb[199]=ny[199]-10+(tBox.height/2+10*sfac[199]);
bl[199]=nx[199]-(tBox.width/2+10*sfac[199]);
br[199]=nx[199]+(tBox.width/2+10*sfac[199]);
var nwidth = br[199]-bl[199]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[199] = bl[199] - delta; 
    br[199] = br[199] + delta; 
} 
bb[199] = bb[199]+20; 
yicon = bb[199]-25; 
xicon2 = nx[199]+-40; 
xicon3 = nx[199]+-10; 
xicon4 = nx[199]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Precipitation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Precipitation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Precipitation/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[199], bt[199], br[199]-bl[199], bb[199]-bt[199], 10*sfac[199]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[199]=paper.setFinish(); 
t[199].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[200]=paper.text(nx[200],ny[200]-10,'The Branches of Earth\nScience').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[200]});
t[200].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Branches-of-Earth-Science/#The Branches of Earth Science", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Branches-of-Earth-Science/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Branches-of-Earth-Science/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[200], bt[200], br[200]-bl[200], bb[200]-bt[200], 10*sfac[200]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[200]=paper.setFinish(); 
t[200].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[201]=paper.text(nx[201],ny[201]-10,'Soil Horizons and Profiles').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[201]});
t[201].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Soil-Horizons-and-Profiles/#Soil Horizons and Profiles", target: "_top",title:"Click to jump to concept"});
}); 
t[201].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[201].getBBox(); 
bt[201]=ny[201]-10-(tBox.height/2+10*sfac[201]);
bb[201]=ny[201]-10+(tBox.height/2+10*sfac[201]);
bl[201]=nx[201]-(tBox.width/2+10*sfac[201]);
br[201]=nx[201]+(tBox.width/2+10*sfac[201]);
var nwidth = br[201]-bl[201]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[201] = bl[201] - delta; 
    br[201] = br[201] + delta; 
} 
bb[201] = bb[201]+20; 
yicon = bb[201]-25; 
xicon2 = nx[201]+-40; 
xicon3 = nx[201]+-10; 
xicon4 = nx[201]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Soil-Horizons-and-Profiles/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[201], bt[201], br[201]-bl[201], bb[201]-bt[201], 10*sfac[201]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[201]=paper.setFinish(); 
t[201].toFront(); 
exicon.toFront(); 

t[202]=paper.text(nx[202],ny[202]-10,'The Seafloor Spreading Hypothesis').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[202]});
t[202].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Seafloor-Spreading-Hypothesis/#The Seafloor Spreading Hypothesis", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Seafloor-Spreading-Hypothesis/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Seafloor-Spreading-Hypothesis/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[202], bt[202], br[202]-bl[202], bb[202]-bt[202], 10*sfac[202]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[202]=paper.setFinish(); 
t[202].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[203]=paper.text(nx[203],ny[203]-10,'Oil Spills').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[203]});
t[203].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Oil-Spills/#Oil Spills", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Oil-Spills/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Oil-Spills/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[203], bt[203], br[203]-bl[203], bb[203]-bt[203], 10*sfac[203]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[203]=paper.setFinish(); 
t[203].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[204]=paper.text(nx[204],ny[204],'Volcano Location').attr({fill:"#666666","font-size": 14*sfac[204]});
tBox=t[204].getBBox(); 
bt[204]=ny[204]-(tBox.height/2+10*sfac[204]);
bb[204]=ny[204]+(tBox.height/2+10*sfac[204]);
bl[204]=nx[204]-(tBox.width/2+10*sfac[204]);
br[204]=nx[204]+(tBox.width/2+10*sfac[204]);
paper.setStart(); 
rect=paper.rect(bl[204], bt[204], br[204]-bl[204], bb[204]-bt[204], 10*sfac[204]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[204]=paper.setFinish(); 

t[205]=paper.text(nx[205],ny[205],'Volcanoes').attr({fill:"#666666","font-size": 14*sfac[205]});
tBox=t[205].getBBox(); 
bt[205]=ny[205]-(tBox.height/2+10*sfac[205]);
bb[205]=ny[205]+(tBox.height/2+10*sfac[205]);
bl[205]=nx[205]-(tBox.width/2+10*sfac[205]);
br[205]=nx[205]+(tBox.width/2+10*sfac[205]);
paper.setStart(); 
rect=paper.rect(bl[205], bt[205], br[205]-bl[205], bb[205]-bt[205], 10*sfac[205]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[205]=paper.setFinish(); 

t[206]=paper.text(nx[206],ny[206],'Metamorphic Rocks').attr({fill:"#666666","font-size": 14*sfac[206]});
tBox=t[206].getBBox(); 
bt[206]=ny[206]-(tBox.height/2+10*sfac[206]);
bb[206]=ny[206]+(tBox.height/2+10*sfac[206]);
bl[206]=nx[206]-(tBox.width/2+10*sfac[206]);
br[206]=nx[206]+(tBox.width/2+10*sfac[206]);
paper.setStart(); 
rect=paper.rect(bl[206], bt[206], br[206]-bl[206], bb[206]-bt[206], 10*sfac[206]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[206]=paper.setFinish(); 

t[207]=paper.text(nx[207],ny[207]-10,'Convergent Plate Boundaries:\nContinent-Continent').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[207]});
t[207].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Continent-Continent-Convergent-Plate-Boundaries/#Convergent Plate Boundaries: Continent-Continent", target: "_top",title:"Click to jump to concept"});
}); 
t[207].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[207].getBBox(); 
bt[207]=ny[207]-10-(tBox.height/2+10*sfac[207]);
bb[207]=ny[207]-10+(tBox.height/2+10*sfac[207]);
bl[207]=nx[207]-(tBox.width/2+10*sfac[207]);
br[207]=nx[207]+(tBox.width/2+10*sfac[207]);
var nwidth = br[207]-bl[207]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[207] = bl[207] - delta; 
    br[207] = br[207] + delta; 
} 
bb[207] = bb[207]+20; 
yicon = bb[207]-25; 
xicon2 = nx[207]+-40; 
xicon3 = nx[207]+-10; 
xicon4 = nx[207]+20; 
paper.setStart(); 
rect=paper.rect(bl[207], bt[207], br[207]-bl[207], bb[207]-bt[207], 10*sfac[207]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[207]=paper.setFinish(); 
t[207].toFront(); 

t[208]=paper.text(nx[208],ny[208],'Mesozoic').attr({fill:"#666666","font-size": 14*sfac[208]});
tBox=t[208].getBBox(); 
bt[208]=ny[208]-(tBox.height/2+10*sfac[208]);
bb[208]=ny[208]+(tBox.height/2+10*sfac[208]);
bl[208]=nx[208]-(tBox.width/2+10*sfac[208]);
br[208]=nx[208]+(tBox.width/2+10*sfac[208]);
paper.setStart(); 
rect=paper.rect(bl[208], bt[208], br[208]-bl[208], bb[208]-bt[208], 10*sfac[208]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[208]=paper.setFinish(); 

t[209]=paper.text(nx[209],ny[209],'Earth').attr({fill:"#666666","font-size": 14*sfac[209]});
tBox=t[209].getBBox(); 
bt[209]=ny[209]-(tBox.height/2+10*sfac[209]);
bb[209]=ny[209]+(tBox.height/2+10*sfac[209]);
bl[209]=nx[209]-(tBox.width/2+10*sfac[209]);
br[209]=nx[209]+(tBox.width/2+10*sfac[209]);
paper.setStart(); 
rect=paper.rect(bl[209], bt[209], br[209]-bl[209], bb[209]-bt[209], 10*sfac[209]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[209]=paper.setFinish(); 

t[210]=paper.text(nx[210],ny[210]-10,'Flooding').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[210]});
t[210].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Flooding/#Flooding", target: "_top",title:"Click to jump to concept"});
}); 
t[210].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[210].getBBox(); 
bt[210]=ny[210]-10-(tBox.height/2+10*sfac[210]);
bb[210]=ny[210]-10+(tBox.height/2+10*sfac[210]);
bl[210]=nx[210]-(tBox.width/2+10*sfac[210]);
br[210]=nx[210]+(tBox.width/2+10*sfac[210]);
var nwidth = br[210]-bl[210]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[210] = bl[210] - delta; 
    br[210] = br[210] + delta; 
} 
bb[210] = bb[210]+20; 
yicon = bb[210]-25; 
xicon2 = nx[210]+-40; 
xicon3 = nx[210]+-10; 
xicon4 = nx[210]+20; 
paper.setStart(); 
rect=paper.rect(bl[210], bt[210], br[210]-bl[210], bb[210]-bt[210], 10*sfac[210]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[210]=paper.setFinish(); 
t[210].toFront(); 

t[211]=paper.text(nx[211],ny[211]-10,'Soil Conservation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[211]});
t[211].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Avoiding-Soil-Loss/#Soil Conservation", target: "_top",title:"Click to jump to concept"});
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
paper.setStart(); 
rect=paper.rect(bl[211], bt[211], br[211]-bl[211], bb[211]-bt[211], 10*sfac[211]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[211]=paper.setFinish(); 
t[211].toFront(); 

t[212]=paper.text(nx[212],ny[212]-10,'Scientific Community').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[212]});
t[212].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Role-of-Scientific-Community/#Scientific Community", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/The-Role-of-Scientific-Community/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Role-of-Scientific-Community/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[212], bt[212], br[212]-bl[212], bb[212]-bt[212], 10*sfac[212]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[212]=paper.setFinish(); 
t[212].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[213]=paper.text(nx[213],ny[213]-10,'Coriolis Effect').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[213]});
t[213].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Coriolis-Effect/#Coriolis Effect", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Coriolis-Effect/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Coriolis-Effect/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[213], bt[213], br[213]-bl[213], bb[213]-bt[213], 10*sfac[213]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[213]=paper.setFinish(); 
t[213].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[214]=paper.text(nx[214],ny[214],'Space Telescopes').attr({fill:"#666666","font-size": 14*sfac[214]});
tBox=t[214].getBBox(); 
bt[214]=ny[214]-(tBox.height/2+10*sfac[214]);
bb[214]=ny[214]+(tBox.height/2+10*sfac[214]);
bl[214]=nx[214]-(tBox.width/2+10*sfac[214]);
br[214]=nx[214]+(tBox.width/2+10*sfac[214]);
paper.setStart(); 
rect=paper.rect(bl[214], bt[214], br[214]-bl[214], bb[214]-bt[214], 10*sfac[214]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[214]=paper.setFinish(); 

t[215]=paper.text(nx[215],ny[215]-10,'Atmospheric\nTemperature').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[215]});
t[215].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Temperature-of-the-Atmosphere/#Atmospheric Temperature", target: "_top",title:"Click to jump to concept"});
}); 
t[215].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[215].getBBox(); 
bt[215]=ny[215]-10-(tBox.height/2+10*sfac[215]);
bb[215]=ny[215]-10+(tBox.height/2+10*sfac[215]);
bl[215]=nx[215]-(tBox.width/2+10*sfac[215]);
br[215]=nx[215]+(tBox.width/2+10*sfac[215]);
var nwidth = br[215]-bl[215]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[215] = bl[215] - delta; 
    br[215] = br[215] + delta; 
} 
bb[215] = bb[215]+20; 
yicon = bb[215]-25; 
xicon2 = nx[215]+-40; 
xicon3 = nx[215]+-10; 
xicon4 = nx[215]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Temperature-of-the-Atmosphere/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Temperature-of-the-Atmosphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[215], bt[215], br[215]-bl[215], bb[215]-bt[215], 10*sfac[215]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[215]=paper.setFinish(); 
t[215].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[216]=paper.text(nx[216],ny[216],'Population Limiting\nFactors').attr({fill:"#666666","font-size": 14*sfac[216]});
tBox=t[216].getBBox(); 
bt[216]=ny[216]-(tBox.height/2+10*sfac[216]);
bb[216]=ny[216]+(tBox.height/2+10*sfac[216]);
bl[216]=nx[216]-(tBox.width/2+10*sfac[216]);
br[216]=nx[216]+(tBox.width/2+10*sfac[216]);
paper.setStart(); 
rect=paper.rect(bl[216], bt[216], br[216]-bl[216], bb[216]-bt[216], 10*sfac[216]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[216]=paper.setFinish(); 

t[217]=paper.text(nx[217],ny[217]-10,'Volcano Hot\nSpots').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[217]});
t[217].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Volcanoes-at-Hotspots/#Volcano Hot Spots", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Volcanoes-at-Hotspots/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Volcanoes-at-Hotspots/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[217], bt[217], br[217]-bl[217], bb[217]-bt[217], 10*sfac[217]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[217]=paper.setFinish(); 
t[217].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[218]=paper.text(nx[218],ny[218],'Conserving Natural Resources').attr({fill:"#666666","font-size": 14*sfac[218]});
tBox=t[218].getBBox(); 
bt[218]=ny[218]-(tBox.height/2+10*sfac[218]);
bb[218]=ny[218]+(tBox.height/2+10*sfac[218]);
bl[218]=nx[218]-(tBox.width/2+10*sfac[218]);
br[218]=nx[218]+(tBox.width/2+10*sfac[218]);
paper.setStart(); 
rect=paper.rect(bl[218], bt[218], br[218]-bl[218], bb[218]-bt[218], 10*sfac[218]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[218]=paper.setFinish(); 

t[219]=paper.text(nx[219],ny[219]-10,'Seawater Composition').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[219]});
t[219].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Seawater-Chemistry/#Seawater Composition", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Seawater-Chemistry/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Seawater-Chemistry/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Seawater-Chemistry/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[219], bt[219], br[219]-bl[219], bb[219]-bt[219], 10*sfac[219]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[219]=paper.setFinish(); 
t[219].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[220]=paper.text(nx[220],ny[220]-10,'Groundwater Features').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[220]});
t[220].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Introduction-to-Groundwater/#Groundwater Features", target: "_top",title:"Click to jump to concept"});
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
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-Groundwater/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[220], bt[220], br[220]-bl[220], bb[220]-bt[220], 10*sfac[220]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[220]=paper.setFinish(); 
t[220].toFront(); 
exicon.toFront(); 

t[221]=paper.text(nx[221],ny[221]-10,'Chemical Bonding').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[221]});
t[221].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Chemical-Bonding/#Chemical Bonding", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Chemical-Bonding/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Chemical-Bonding/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[221], bt[221], br[221]-bl[221], bb[221]-bt[221], 10*sfac[221]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[221]=paper.setFinish(); 
t[221].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[222]=paper.text(nx[222],ny[222]-10,'The Big Bang').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[222]});
t[222].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Big-Bang/#The Big Bang", target: "_top",title:"Click to jump to concept"});
}); 
t[222].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[222].getBBox(); 
bt[222]=ny[222]-10-(tBox.height/2+10*sfac[222]);
bb[222]=ny[222]-10+(tBox.height/2+10*sfac[222]);
bl[222]=nx[222]-(tBox.width/2+10*sfac[222]);
br[222]=nx[222]+(tBox.width/2+10*sfac[222]);
var nwidth = br[222]-bl[222]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[222] = bl[222] - delta; 
    br[222] = br[222] + delta; 
} 
bb[222] = bb[222]+20; 
yicon = bb[222]-25; 
xicon2 = nx[222]+-40; 
xicon3 = nx[222]+-10; 
xicon4 = nx[222]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Big-Bang/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Big-Bang/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[222], bt[222], br[222]-bl[222], bb[222]-bt[222], 10*sfac[222]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[222]=paper.setFinish(); 
t[222].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[223]=paper.text(nx[223],ny[223]-10,'Local Winds').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[223]});
t[223].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Local-Winds/#Local Winds", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Local-Winds/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Local-Winds/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[223], bt[223], br[223]-bl[223], bb[223]-bt[223], 10*sfac[223]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[223]=paper.setFinish(); 
t[223].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[224]=paper.text(nx[224],ny[224]-10,'Effusive Volcanic\nEruptions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[224]});
t[224].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Effusive-Eruptions/#Effusive Volcanic Eruptions", target: "_top",title:"Click to jump to concept"});
}); 
t[224].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[224].getBBox(); 
bt[224]=ny[224]-10-(tBox.height/2+10*sfac[224]);
bb[224]=ny[224]-10+(tBox.height/2+10*sfac[224]);
bl[224]=nx[224]-(tBox.width/2+10*sfac[224]);
br[224]=nx[224]+(tBox.width/2+10*sfac[224]);
var nwidth = br[224]-bl[224]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[224] = bl[224] - delta; 
    br[224] = br[224] + delta; 
} 
bb[224] = bb[224]+20; 
yicon = bb[224]-25; 
xicon2 = nx[224]+-40; 
xicon3 = nx[224]+-10; 
xicon4 = nx[224]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Effusive-Eruptions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Effusive-Eruptions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[224], bt[224], br[224]-bl[224], bb[224]-bt[224], 10*sfac[224]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[224]=paper.setFinish(); 
t[224].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[225]=paper.text(nx[225],ny[225]-10,'Impacts of Hazardous\nWaste').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[225]});
t[225].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Impacts-of-Hazardous-Waste/#Impacts of Hazardous Waste", target: "_top",title:"Click to jump to concept"});
}); 
t[225].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[225].getBBox(); 
bt[225]=ny[225]-10-(tBox.height/2+10*sfac[225]);
bb[225]=ny[225]-10+(tBox.height/2+10*sfac[225]);
bl[225]=nx[225]-(tBox.width/2+10*sfac[225]);
br[225]=nx[225]+(tBox.width/2+10*sfac[225]);
var nwidth = br[225]-bl[225]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[225] = bl[225] - delta; 
    br[225] = br[225] + delta; 
} 
bb[225] = bb[225]+20; 
yicon = bb[225]-25; 
xicon2 = nx[225]+-40; 
xicon3 = nx[225]+-10; 
xicon4 = nx[225]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Impacts-of-Hazardous-Waste/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[225], bt[225], br[225]-bl[225], bb[225]-bt[225], 10*sfac[225]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[225]=paper.setFinish(); 
t[225].toFront(); 
vidicon.toFront(); 

t[226]=paper.text(nx[226],ny[226]-10,'Mesozoic\nLife').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[226]});
t[226].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-History-of-Mesozoic-Life/#Mesozoic Life", target: "_top",title:"Click to jump to concept"});
}); 
t[226].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[226].getBBox(); 
bt[226]=ny[226]-10-(tBox.height/2+10*sfac[226]);
bb[226]=ny[226]-10+(tBox.height/2+10*sfac[226]);
bl[226]=nx[226]-(tBox.width/2+10*sfac[226]);
br[226]=nx[226]+(tBox.width/2+10*sfac[226]);
var nwidth = br[226]-bl[226]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[226] = bl[226] - delta; 
    br[226] = br[226] + delta; 
} 
bb[226] = bb[226]+20; 
yicon = bb[226]-25; 
xicon2 = nx[226]+-40; 
xicon3 = nx[226]+-10; 
xicon4 = nx[226]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-History-of-Mesozoic-Life/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-History-of-Mesozoic-Life/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[226], bt[226], br[226]-bl[226], bb[226]-bt[226], 10*sfac[226]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[226]=paper.setFinish(); 
t[226].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[227]=paper.text(nx[227],ny[227]-10,'Tornadoes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[227]});
t[227].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Tornadoes/#Tornadoes", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tornadoes/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tornadoes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[227], bt[227], br[227]-bl[227], bb[227]-bt[227], 10*sfac[227]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[227]=paper.setFinish(); 
t[227].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[228]=paper.text(nx[228],ny[228],'The Inner Planets').attr({fill:"#666666","font-size": 14*sfac[228]});
tBox=t[228].getBBox(); 
bt[228]=ny[228]-(tBox.height/2+10*sfac[228]);
bb[228]=ny[228]+(tBox.height/2+10*sfac[228]);
bl[228]=nx[228]-(tBox.width/2+10*sfac[228]);
br[228]=nx[228]+(tBox.width/2+10*sfac[228]);
paper.setStart(); 
rect=paper.rect(bl[228], bt[228], br[228]-bl[228], bb[228]-bt[228], 10*sfac[228]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[228]=paper.setFinish(); 

t[229]=paper.text(nx[229],ny[229]-10,"Earth's Layers").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[229]});
t[229].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Layers-of-Earth/#Earth's Layers", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Layers-of-Earth/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[229], bt[229], br[229]-bl[229], bb[229]-bt[229], 10*sfac[229]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[229]=paper.setFinish(); 
t[229].toFront(); 
exicon.toFront(); 

t[230]=paper.text(nx[230],ny[230]-10,'Earth Science\nField Trips').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[230]});
t[230].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Field-Trips/#Earth Science Field Trips", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Field-Trips/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[230], bt[230], br[230]-bl[230], bb[230]-bt[230], 10*sfac[230]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[230]=paper.setFinish(); 
t[230].toFront(); 
vidicon.toFront(); 

t[231]=paper.text(nx[231],ny[231]-10,'Volcanoes at\nPlate Boundaries').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[231]});
t[231].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Volcanoes-at-Plate-Boundaries/#Volcanoes at Plate Boundaries", target: "_top",title:"Click to jump to concept"});
}); 
t[231].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[231].getBBox(); 
bt[231]=ny[231]-10-(tBox.height/2+10*sfac[231]);
bb[231]=ny[231]-10+(tBox.height/2+10*sfac[231]);
bl[231]=nx[231]-(tBox.width/2+10*sfac[231]);
br[231]=nx[231]+(tBox.width/2+10*sfac[231]);
var nwidth = br[231]-bl[231]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[231] = bl[231] - delta; 
    br[231] = br[231] + delta; 
} 
bb[231] = bb[231]+20; 
yicon = bb[231]-25; 
xicon2 = nx[231]+-40; 
xicon3 = nx[231]+-10; 
xicon4 = nx[231]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Volcanoes-at-Plate-Boundaries/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Volcanoes-at-Plate-Boundaries/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[231], bt[231], br[231]-bl[231], bb[231]-bt[231], 10*sfac[231]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[231]=paper.setFinish(); 
t[231].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[232]=paper.text(nx[232],ny[232],'Earth, Moon, Sun').attr({fill:"#666666","font-size": 14*sfac[232]});
tBox=t[232].getBBox(); 
bt[232]=ny[232]-(tBox.height/2+10*sfac[232]);
bb[232]=ny[232]+(tBox.height/2+10*sfac[232]);
bl[232]=nx[232]-(tBox.width/2+10*sfac[232]);
br[232]=nx[232]+(tBox.width/2+10*sfac[232]);
paper.setStart(); 
rect=paper.rect(bl[232], bt[232], br[232]-bl[232], bb[232]-bt[232], 10*sfac[232]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[232]=paper.setFinish(); 

t[233]=paper.text(nx[233],ny[233]-10,'Formation of Earth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[233]});
t[233].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Formation-of-Earth/#Formation of Earth", target: "_top",title:"Click to jump to concept"});
}); 
t[233].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[233].getBBox(); 
bt[233]=ny[233]-10-(tBox.height/2+10*sfac[233]);
bb[233]=ny[233]-10+(tBox.height/2+10*sfac[233]);
bl[233]=nx[233]-(tBox.width/2+10*sfac[233]);
br[233]=nx[233]+(tBox.width/2+10*sfac[233]);
var nwidth = br[233]-bl[233]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[233] = bl[233] - delta; 
    br[233] = br[233] + delta; 
} 
bb[233] = bb[233]+20; 
yicon = bb[233]-25; 
xicon2 = nx[233]+-40; 
xicon3 = nx[233]+-10; 
xicon4 = nx[233]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Formation-of-Earth/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Formation-of-Earth/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[233], bt[233], br[233]-bl[233], bb[233]-bt[233], 10*sfac[233]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[233]=paper.setFinish(); 
t[233].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[234]=paper.text(nx[234],ny[234]-10,"Earth's Tectonic Plates").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[234]});
t[234].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Earths-Tectonic-Plates/#Earth's Tectonic Plates", target: "_top",title:"Click to jump to concept"});
}); 
t[234].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[234].getBBox(); 
bt[234]=ny[234]-10-(tBox.height/2+10*sfac[234]);
bb[234]=ny[234]-10+(tBox.height/2+10*sfac[234]);
bl[234]=nx[234]-(tBox.width/2+10*sfac[234]);
br[234]=nx[234]+(tBox.width/2+10*sfac[234]);
var nwidth = br[234]-bl[234]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[234] = bl[234] - delta; 
    br[234] = br[234] + delta; 
} 
bb[234] = bb[234]+20; 
yicon = bb[234]-25; 
xicon2 = nx[234]+-40; 
xicon3 = nx[234]+-10; 
xicon4 = nx[234]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Earths-Tectonic-Plates/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[234], bt[234], br[234]-bl[234], bb[234]-bt[234], 10*sfac[234]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[234]=paper.setFinish(); 
t[234].toFront(); 
exicon.toFront(); 

t[235]=paper.text(nx[235],ny[235]-10,'Climate Zones and Biomes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[235]});
t[235].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Climate-Zones-and-Biomes/#Climate Zones and Biomes", target: "_top",title:"Click to jump to concept"});
}); 
t[235].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[235].getBBox(); 
bt[235]=ny[235]-10-(tBox.height/2+10*sfac[235]);
bb[235]=ny[235]-10+(tBox.height/2+10*sfac[235]);
bl[235]=nx[235]-(tBox.width/2+10*sfac[235]);
br[235]=nx[235]+(tBox.width/2+10*sfac[235]);
var nwidth = br[235]-bl[235]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[235] = bl[235] - delta; 
    br[235] = br[235] + delta; 
} 
bb[235] = bb[235]+20; 
yicon = bb[235]-25; 
xicon2 = nx[235]+-40; 
xicon3 = nx[235]+-10; 
xicon4 = nx[235]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Climate-Zones-and-Biomes/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Climate-Zones-and-Biomes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[235], bt[235], br[235]-bl[235], bb[235]-bt[235], 10*sfac[235]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[235]=paper.setFinish(); 
t[235].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[236]=paper.text(nx[236],ny[236]-10,"Wegener's Continental\nDrift Idea").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[236]});
t[236].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Alfred-Wegener-and-the-Continental-Drift-Hypothesis/#Wegener's Continental Drift Idea", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Alfred-Wegener-and-the-Continental-Drift-Hypothesis/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Alfred-Wegener-and-the-Continental-Drift-Hypothesis/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[236], bt[236], br[236]-bl[236], bb[236]-bt[236], 10*sfac[236]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[236]=paper.setFinish(); 
t[236].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[237]=paper.text(nx[237],ny[237]-10,'Erosion by\nGlaciers').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[237]});
t[237].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Landforms-from-Glacial-Erosion-and-Deposition/#Erosion by Glaciers", target: "_top",title:"Click to jump to concept"});
}); 
t[237].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[237].getBBox(); 
bt[237]=ny[237]-10-(tBox.height/2+10*sfac[237]);
bb[237]=ny[237]-10+(tBox.height/2+10*sfac[237]);
bl[237]=nx[237]-(tBox.width/2+10*sfac[237]);
br[237]=nx[237]+(tBox.width/2+10*sfac[237]);
var nwidth = br[237]-bl[237]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[237] = bl[237] - delta; 
    br[237] = br[237] + delta; 
} 
bb[237] = bb[237]+20; 
yicon = bb[237]-25; 
xicon2 = nx[237]+-40; 
xicon3 = nx[237]+-10; 
xicon4 = nx[237]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Landforms-from-Glacial-Erosion-and-Deposition/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Landforms-from-Glacial-Erosion-and-Deposition/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[237], bt[237], br[237]-bl[237], bb[237]-bt[237], 10*sfac[237]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[237]=paper.setFinish(); 
t[237].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[238]=paper.text(nx[238],ny[238]-10,'Types of Soils').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[238]});
t[238].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Types-of-Soils/#Types of Soils", target: "_top",title:"Click to jump to concept"});
}); 
t[238].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[238].getBBox(); 
bt[238]=ny[238]-10-(tBox.height/2+10*sfac[238]);
bb[238]=ny[238]-10+(tBox.height/2+10*sfac[238]);
bl[238]=nx[238]-(tBox.width/2+10*sfac[238]);
br[238]=nx[238]+(tBox.width/2+10*sfac[238]);
var nwidth = br[238]-bl[238]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[238] = bl[238] - delta; 
    br[238] = br[238] + delta; 
} 
bb[238] = bb[238]+20; 
yicon = bb[238]-25; 
xicon2 = nx[238]+-40; 
xicon3 = nx[238]+-10; 
xicon4 = nx[238]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Soils/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[238], bt[238], br[238]-bl[238], bb[238]-bt[238], 10*sfac[238]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[238]=paper.setFinish(); 
t[238].toFront(); 
exicon.toFront(); 

t[239]=paper.text(nx[239],ny[239]-10,"Continental Position and\nCurrents' Influence\non Climate").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[239]});
t[239].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Effect-of-Continental-Position-on-Climate/#Continental Position and Currents' Influence on Climate", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Effect-of-Continental-Position-on-Climate/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Effect-of-Continental-Position-on-Climate/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[239], bt[239], br[239]-bl[239], bb[239]-bt[239], 10*sfac[239]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[239]=paper.setFinish(); 
t[239].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[240]=paper.text(nx[240],ny[240],'Factors that Influence Climate in a Region').attr({fill:"#666666","font-size": 14*sfac[240]});
tBox=t[240].getBBox(); 
bt[240]=ny[240]-(tBox.height/2+10*sfac[240]);
bb[240]=ny[240]+(tBox.height/2+10*sfac[240]);
bl[240]=nx[240]-(tBox.width/2+10*sfac[240]);
br[240]=nx[240]+(tBox.width/2+10*sfac[240]);
paper.setStart(); 
rect=paper.rect(bl[240], bt[240], br[240]-bl[240], bb[240]-bt[240], 10*sfac[240]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[240]=paper.setFinish(); 

t[241]=paper.text(nx[241],ny[241]-10,'Earthquakes at Convergent\nPlate Boundaries').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[241]});
t[241].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Earthquakes-at-Convergent-Plate-Boundaries/#Earthquakes at Convergent Plate Boundaries", target: "_top",title:"Click to jump to concept"});
}); 
t[241].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[241].getBBox(); 
bt[241]=ny[241]-10-(tBox.height/2+10*sfac[241]);
bb[241]=ny[241]-10+(tBox.height/2+10*sfac[241]);
bl[241]=nx[241]-(tBox.width/2+10*sfac[241]);
br[241]=nx[241]+(tBox.width/2+10*sfac[241]);
var nwidth = br[241]-bl[241]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[241] = bl[241] - delta; 
    br[241] = br[241] + delta; 
} 
bb[241] = bb[241]+20; 
yicon = bb[241]-25; 
xicon2 = nx[241]+-40; 
xicon3 = nx[241]+-10; 
xicon4 = nx[241]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Earthquakes-at-Convergent-Plate-Boundaries/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Earthquakes-at-Convergent-Plate-Boundaries/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[241], bt[241], br[241]-bl[241], bb[241]-bt[241], 10*sfac[241]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[241]=paper.setFinish(); 
t[241].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[242]=paper.text(nx[242],ny[242]-10,'Biological Communities').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[242]});
t[242].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Biological-Communities/#Biological Communities", target: "_top",title:"Click to jump to concept"});
}); 
t[242].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[242].getBBox(); 
bt[242]=ny[242]-10-(tBox.height/2+10*sfac[242]);
bb[242]=ny[242]-10+(tBox.height/2+10*sfac[242]);
bl[242]=nx[242]-(tBox.width/2+10*sfac[242]);
br[242]=nx[242]+(tBox.width/2+10*sfac[242]);
var nwidth = br[242]-bl[242]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[242] = bl[242] - delta; 
    br[242] = br[242] + delta; 
} 
bb[242] = bb[242]+20; 
yicon = bb[242]-25; 
xicon2 = nx[242]+-40; 
xicon3 = nx[242]+-10; 
xicon4 = nx[242]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Biological-Communities/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Biological-Communities/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[242], bt[242], br[242]-bl[242], bb[242]-bt[242], 10*sfac[242]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[242]=paper.setFinish(); 
t[242].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[243]=paper.text(nx[243],ny[243],'Mantle Convection and\nPlate Movements').attr({fill:"#666666","font-size": 14*sfac[243]});
tBox=t[243].getBBox(); 
bt[243]=ny[243]-(tBox.height/2+10*sfac[243]);
bb[243]=ny[243]+(tBox.height/2+10*sfac[243]);
bl[243]=nx[243]-(tBox.width/2+10*sfac[243]);
br[243]=nx[243]+(tBox.width/2+10*sfac[243]);
paper.setStart(); 
rect=paper.rect(bl[243], bt[243], br[243]-bl[243], bb[243]-bt[243], 10*sfac[243]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[243]=paper.setFinish(); 

t[244]=paper.text(nx[244],ny[244]-10,'Ocean Garbage Patch').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[244]});
t[244].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Ocean-Garbage-Patch/#Ocean Garbage Patch", target: "_top",title:"Click to jump to concept"});
}); 
t[244].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[244].getBBox(); 
bt[244]=ny[244]-10-(tBox.height/2+10*sfac[244]);
bb[244]=ny[244]-10+(tBox.height/2+10*sfac[244]);
bl[244]=nx[244]-(tBox.width/2+10*sfac[244]);
br[244]=nx[244]+(tBox.width/2+10*sfac[244]);
var nwidth = br[244]-bl[244]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[244] = bl[244] - delta; 
    br[244] = br[244] + delta; 
} 
bb[244] = bb[244]+20; 
yicon = bb[244]-25; 
xicon2 = nx[244]+-40; 
xicon3 = nx[244]+-10; 
xicon4 = nx[244]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Ocean-Garbage-Patch/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[244], bt[244], br[244]-bl[244], bb[244]-bt[244], 10*sfac[244]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[244]=paper.setFinish(); 
t[244].toFront(); 
vidicon.toFront(); 

t[245]=paper.text(nx[245],ny[245]-10,'What is Life?').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[245]});
t[245].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/An-Introduction-to-Life/#What is Life?", target: "_top",title:"Click to jump to concept"});
}); 
t[245].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[245].getBBox(); 
bt[245]=ny[245]-10-(tBox.height/2+10*sfac[245]);
bb[245]=ny[245]-10+(tBox.height/2+10*sfac[245]);
bl[245]=nx[245]-(tBox.width/2+10*sfac[245]);
br[245]=nx[245]+(tBox.width/2+10*sfac[245]);
var nwidth = br[245]-bl[245]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[245] = bl[245] - delta; 
    br[245] = br[245] + delta; 
} 
bb[245] = bb[245]+20; 
yicon = bb[245]-25; 
xicon2 = nx[245]+-40; 
xicon3 = nx[245]+-10; 
xicon4 = nx[245]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/An-Introduction-to-Life/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/An-Introduction-to-Life/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[245], bt[245], br[245]-bl[245], bb[245]-bt[245], 10*sfac[245]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[245]=paper.setFinish(); 
t[245].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[246]=paper.text(nx[246],ny[246]-10,'The Nitrogen Cycle').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[246]});
t[246].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Nitrogen-Cycle-in-Ecosystems/#The Nitrogen Cycle", target: "_top",title:"Click to jump to concept"});
}); 
t[246].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[246].getBBox(); 
bt[246]=ny[246]-10-(tBox.height/2+10*sfac[246]);
bb[246]=ny[246]-10+(tBox.height/2+10*sfac[246]);
bl[246]=nx[246]-(tBox.width/2+10*sfac[246]);
br[246]=nx[246]+(tBox.width/2+10*sfac[246]);
var nwidth = br[246]-bl[246]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[246] = bl[246] - delta; 
    br[246] = br[246] + delta; 
} 
bb[246] = bb[246]+20; 
yicon = bb[246]-25; 
xicon2 = nx[246]+-40; 
xicon3 = nx[246]+-10; 
xicon4 = nx[246]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Nitrogen-Cycle-in-Ecosystems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Nitrogen-Cycle-in-Ecosystems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[246], bt[246], br[246]-bl[246], bb[246]-bt[246], 10*sfac[246]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[246]=paper.setFinish(); 
t[246].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[247]=paper.text(nx[247],ny[247],'Population Carrying\nCapacity').attr({fill:"#666666","font-size": 14*sfac[247]});
tBox=t[247].getBBox(); 
bt[247]=ny[247]-(tBox.height/2+10*sfac[247]);
bb[247]=ny[247]+(tBox.height/2+10*sfac[247]);
bl[247]=nx[247]-(tBox.width/2+10*sfac[247]);
br[247]=nx[247]+(tBox.width/2+10*sfac[247]);
paper.setStart(); 
rect=paper.rect(bl[247], bt[247], br[247]-bl[247], bb[247]-bt[247], 10*sfac[247]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[247]=paper.setFinish(); 

t[248]=paper.text(nx[248],ny[248]-10,'Soil Pollution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[248]});
t[248].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Soils/#Soil Pollution", target: "_top",title:"Click to jump to concept"});
}); 
t[248].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[248].getBBox(); 
bt[248]=ny[248]-10-(tBox.height/2+10*sfac[248]);
bb[248]=ny[248]-10+(tBox.height/2+10*sfac[248]);
bl[248]=nx[248]-(tBox.width/2+10*sfac[248]);
br[248]=nx[248]+(tBox.width/2+10*sfac[248]);
var nwidth = br[248]-bl[248]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[248] = bl[248] - delta; 
    br[248] = br[248] + delta; 
} 
bb[248] = bb[248]+20; 
yicon = bb[248]-25; 
xicon2 = nx[248]+-40; 
xicon3 = nx[248]+-10; 
xicon4 = nx[248]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Soils/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[248], bt[248], br[248]-bl[248], bb[248]-bt[248], 10*sfac[248]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[248]=paper.setFinish(); 
t[248].toFront(); 
exicon.toFront(); 

t[249]=paper.text(nx[249],ny[249]-10,'Locating an Earthquake\nEpicenter').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[249]});
t[249].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Locating-Earthquake-Epicenters/#Locating an Earthquake Epicenter", target: "_top",title:"Click to jump to concept"});
}); 
t[249].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[249].getBBox(); 
bt[249]=ny[249]-10-(tBox.height/2+10*sfac[249]);
bb[249]=ny[249]-10+(tBox.height/2+10*sfac[249]);
bl[249]=nx[249]-(tBox.width/2+10*sfac[249]);
br[249]=nx[249]+(tBox.width/2+10*sfac[249]);
var nwidth = br[249]-bl[249]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[249] = bl[249] - delta; 
    br[249] = br[249] + delta; 
} 
bb[249] = bb[249]+20; 
yicon = bb[249]-25; 
xicon2 = nx[249]+-40; 
xicon3 = nx[249]+-10; 
xicon4 = nx[249]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Locating-Earthquake-Epicenters/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[249], bt[249], br[249]-bl[249], bb[249]-bt[249], 10*sfac[249]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[249]=paper.setFinish(); 
t[249].toFront(); 
exicon.toFront(); 

t[250]=paper.text(nx[250],ny[250]-10,'Definition of Mineral').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[250]});
t[250].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Introduction-to-Minerals/#Definition of Mineral", target: "_top",title:"Click to jump to concept"});
}); 
t[250].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[250].getBBox(); 
bt[250]=ny[250]-10-(tBox.height/2+10*sfac[250]);
bb[250]=ny[250]-10+(tBox.height/2+10*sfac[250]);
bl[250]=nx[250]-(tBox.width/2+10*sfac[250]);
br[250]=nx[250]+(tBox.width/2+10*sfac[250]);
var nwidth = br[250]-bl[250]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[250] = bl[250] - delta; 
    br[250] = br[250] + delta; 
} 
bb[250] = bb[250]+20; 
yicon = bb[250]-25; 
xicon2 = nx[250]+-40; 
xicon3 = nx[250]+-10; 
xicon4 = nx[250]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-Minerals/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[250], bt[250], br[250]-bl[250], bb[250]-bt[250], 10*sfac[250]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[250]=paper.setFinish(); 
t[250].toFront(); 
exicon.toFront(); 

t[251]=paper.text(nx[251],ny[251],'Geocentrism and Heliocentrism').attr({fill:"#666666","font-size": 14*sfac[251]});
tBox=t[251].getBBox(); 
bt[251]=ny[251]-(tBox.height/2+10*sfac[251]);
bb[251]=ny[251]+(tBox.height/2+10*sfac[251]);
bl[251]=nx[251]-(tBox.width/2+10*sfac[251]);
br[251]=nx[251]+(tBox.width/2+10*sfac[251]);
paper.setStart(); 
rect=paper.rect(bl[251], bt[251], br[251]-bl[251], bb[251]-bt[251], 10*sfac[251]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[251]=paper.setFinish(); 

t[252]=paper.text(nx[252],ny[252],'The Atmosphere').attr({fill:"#666666","font-size": 14*sfac[252]});
tBox=t[252].getBBox(); 
bt[252]=ny[252]-(tBox.height/2+10*sfac[252]);
bb[252]=ny[252]+(tBox.height/2+10*sfac[252]);
bl[252]=nx[252]-(tBox.width/2+10*sfac[252]);
br[252]=nx[252]+(tBox.width/2+10*sfac[252]);
paper.setStart(); 
rect=paper.rect(bl[252], bt[252], br[252]-bl[252], bb[252]-bt[252], 10*sfac[252]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[252]=paper.setFinish(); 

t[253]=paper.text(nx[253],ny[253],'Earth Materials').attr({fill:"#666666","font-size": 14*sfac[253]});
tBox=t[253].getBBox(); 
bt[253]=ny[253]-(tBox.height/2+10*sfac[253]);
bb[253]=ny[253]+(tBox.height/2+10*sfac[253]);
bl[253]=nx[253]-(tBox.width/2+10*sfac[253]);
br[253]=nx[253]+(tBox.width/2+10*sfac[253]);
paper.setStart(); 
rect=paper.rect(bl[253], bt[253], br[253]-bl[253], bb[253]-bt[253], 10*sfac[253]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[253]=paper.setFinish(); 

t[254]=paper.text(nx[254],ny[254]-10,'Energy\nfrom Petroleum').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[254]});
t[254].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Petroleum-Power/#Energy from Petroleum", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Petroleum-Power/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Petroleum-Power/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[254], bt[254], br[254]-bl[254], bb[254]-bt[254], 10*sfac[254]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[254]=paper.setFinish(); 
t[254].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[255]=paper.text(nx[255],ny[255]-10,'Hydroelectric\nEnergy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[255]});
t[255].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Hydroelectric-Power/#Hydroelectric Energy", target: "_top",title:"Click to jump to concept"});
}); 
t[255].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[255].getBBox(); 
bt[255]=ny[255]-10-(tBox.height/2+10*sfac[255]);
bb[255]=ny[255]-10+(tBox.height/2+10*sfac[255]);
bl[255]=nx[255]-(tBox.width/2+10*sfac[255]);
br[255]=nx[255]+(tBox.width/2+10*sfac[255]);
var nwidth = br[255]-bl[255]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[255] = bl[255] - delta; 
    br[255] = br[255] + delta; 
} 
bb[255] = bb[255]+20; 
yicon = bb[255]-25; 
xicon2 = nx[255]+-40; 
xicon3 = nx[255]+-10; 
xicon4 = nx[255]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Hydroelectric-Power/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Hydroelectric-Power/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[255], bt[255], br[255]-bl[255], bb[255]-bt[255], 10*sfac[255]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[255]=paper.setFinish(); 
t[255].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[256]=paper.text(nx[256],ny[256]-10,"Distribution of Earth's Water").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[256]});
t[256].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Distribution-of-Water-on-Earth/#Distribution of Earth's Water", target: "_top",title:"Click to jump to concept"});
}); 
t[256].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[256].getBBox(); 
bt[256]=ny[256]-10-(tBox.height/2+10*sfac[256]);
bb[256]=ny[256]-10+(tBox.height/2+10*sfac[256]);
bl[256]=nx[256]-(tBox.width/2+10*sfac[256]);
br[256]=nx[256]+(tBox.width/2+10*sfac[256]);
var nwidth = br[256]-bl[256]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[256] = bl[256] - delta; 
    br[256] = br[256] + delta; 
} 
bb[256] = bb[256]+20; 
yicon = bb[256]-25; 
xicon2 = nx[256]+-40; 
xicon3 = nx[256]+-10; 
xicon4 = nx[256]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Distribution-of-Water-on-Earth/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Distribution-of-Water-on-Earth/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[256], bt[256], br[256]-bl[256], bb[256]-bt[256], 10*sfac[256]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[256]=paper.setFinish(); 
t[256].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[257]=paper.text(nx[257],ny[257],'The Supercontinent Cycle').attr({fill:"#666666","font-size": 14*sfac[257]});
tBox=t[257].getBBox(); 
bt[257]=ny[257]-(tBox.height/2+10*sfac[257]);
bb[257]=ny[257]+(tBox.height/2+10*sfac[257]);
bl[257]=nx[257]-(tBox.width/2+10*sfac[257]);
br[257]=nx[257]+(tBox.width/2+10*sfac[257]);
paper.setStart(); 
rect=paper.rect(bl[257], bt[257], br[257]-bl[257], bb[257]-bt[257], 10*sfac[257]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[257]=paper.setFinish(); 

t[258]=paper.text(nx[258],ny[258],'Types of Volcanoes').attr({fill:"#666666","font-size": 14*sfac[258]});
tBox=t[258].getBBox(); 
bt[258]=ny[258]-(tBox.height/2+10*sfac[258]);
bb[258]=ny[258]+(tBox.height/2+10*sfac[258]);
bl[258]=nx[258]-(tBox.width/2+10*sfac[258]);
br[258]=nx[258]+(tBox.width/2+10*sfac[258]);
paper.setStart(); 
rect=paper.rect(bl[258], bt[258], br[258]-bl[258], bb[258]-bt[258], 10*sfac[258]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[258]=paper.setFinish(); 

t[259]=paper.text(nx[259],ny[259]-10,'Divergent Plate Boundaries\nwithin Continents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[259]});
t[259].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Divergent-Plate-Boundaries-within-Continents/#Divergent Plate Boundaries within Continents", target: "_top",title:"Click to jump to concept"});
}); 
t[259].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[259].getBBox(); 
bt[259]=ny[259]-10-(tBox.height/2+10*sfac[259]);
bb[259]=ny[259]-10+(tBox.height/2+10*sfac[259]);
bl[259]=nx[259]-(tBox.width/2+10*sfac[259]);
br[259]=nx[259]+(tBox.width/2+10*sfac[259]);
var nwidth = br[259]-bl[259]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[259] = bl[259] - delta; 
    br[259] = br[259] + delta; 
} 
bb[259] = bb[259]+20; 
yicon = bb[259]-25; 
xicon2 = nx[259]+-40; 
xicon3 = nx[259]+-10; 
xicon4 = nx[259]+20; 
paper.setStart(); 
rect=paper.rect(bl[259], bt[259], br[259]-bl[259], bb[259]-bt[259], 10*sfac[259]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[259]=paper.setFinish(); 
t[259].toFront(); 

t[260]=paper.text(nx[260],ny[260]-10,'Oceans').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[260]});
t[260].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ocean-Zones/#Oceans", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Ocean-Zones/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Ocean-Zones/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[260], bt[260], br[260]-bl[260], bb[260]-bt[260], 10*sfac[260]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[260]=paper.setFinish(); 
t[260].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[261]=paper.text(nx[261],ny[261]-10,'Early Plate Tectonics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[261]});
t[261].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Precambrian-Plate-Tectonics/#Early Plate Tectonics", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Precambrian-Plate-Tectonics/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Precambrian-Plate-Tectonics/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[261], bt[261], br[261]-bl[261], bb[261]-bt[261], 10*sfac[261]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[261]=paper.setFinish(); 
t[261].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[262]=paper.text(nx[262],ny[262]-10,'Soil Formation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[262]});
t[262].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Soil-Formation/#Soil Formation", target: "_top",title:"Click to jump to concept"});
}); 
t[262].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[262].getBBox(); 
bt[262]=ny[262]-10-(tBox.height/2+10*sfac[262]);
bb[262]=ny[262]-10+(tBox.height/2+10*sfac[262]);
bl[262]=nx[262]-(tBox.width/2+10*sfac[262]);
br[262]=nx[262]+(tBox.width/2+10*sfac[262]);
var nwidth = br[262]-bl[262]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[262] = bl[262] - delta; 
    br[262] = br[262] + delta; 
} 
bb[262] = bb[262]+20; 
yicon = bb[262]-25; 
xicon2 = nx[262]+-40; 
xicon3 = nx[262]+-10; 
xicon4 = nx[262]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Soil-Formation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Soil-Formation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[262], bt[262], br[262]-bl[262], bb[262]-bt[262], 10*sfac[262]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[262]=paper.setFinish(); 
t[262].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[263]=paper.text(nx[263],ny[263]-10,'Energy\nfrom Nuclear Power').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[263]});
t[263].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Nuclear-Power/#Energy from Nuclear Power", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Nuclear-Power/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Nuclear-Power/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[263], bt[263], br[263]-bl[263], bb[263]-bt[263], 10*sfac[263]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[263]=paper.setFinish(); 
t[263].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[264]=paper.text(nx[264],ny[264]-10,'Testing Hypotheses').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[264]});
t[264].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Testing-Hypotheses/#Testing Hypotheses", target: "_top",title:"Click to jump to concept"});
}); 
t[264].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[264].getBBox(); 
bt[264]=ny[264]-10-(tBox.height/2+10*sfac[264]);
bb[264]=ny[264]-10+(tBox.height/2+10*sfac[264]);
bl[264]=nx[264]-(tBox.width/2+10*sfac[264]);
br[264]=nx[264]+(tBox.width/2+10*sfac[264]);
var nwidth = br[264]-bl[264]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[264] = bl[264] - delta; 
    br[264] = br[264] + delta; 
} 
bb[264] = bb[264]+20; 
yicon = bb[264]-25; 
xicon2 = nx[264]+-40; 
xicon3 = nx[264]+-10; 
xicon4 = nx[264]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Testing-Hypotheses/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Testing-Hypotheses/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[264], bt[264], br[264]-bl[264], bb[264]-bt[264], 10*sfac[264]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[264]=paper.setFinish(); 
t[264].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[265]=paper.text(nx[265],ny[265],'Fossils').attr({fill:"#666666","font-size": 14*sfac[265]});
tBox=t[265].getBBox(); 
bt[265]=ny[265]-(tBox.height/2+10*sfac[265]);
bb[265]=ny[265]+(tBox.height/2+10*sfac[265]);
bl[265]=nx[265]-(tBox.width/2+10*sfac[265]);
br[265]=nx[265]+(tBox.width/2+10*sfac[265]);
paper.setStart(); 
rect=paper.rect(bl[265], bt[265], br[265]-bl[265], bb[265]-bt[265], 10*sfac[265]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[265]=paper.setFinish(); 

t[266]=paper.text(nx[266],ny[266]-10,'Scientific Method in Practice').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[266]});
t[266].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Uses-the-Scientific-Method-to-Answer-Questions/#Scientific Method in Practice", target: "_top",title:"Click to jump to concept"});
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
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Uses-the-Scientific-Method-to-Answer-Questions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Uses-the-Scientific-Method-to-Answer-Questions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Uses-the-Scientific-Method-to-Answer-Questions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[266], bt[266], br[266]-bl[266], bb[266]-bt[266], 10*sfac[266]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[266]=paper.setFinish(); 
t[266].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[267]=paper.text(nx[267],ny[267]-10,'Convergent Plate Boundaries:\nOcean-Continent').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[267]});
t[267].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ocean-Continent-Convergent-Plate-Boundaries/#Convergent Plate Boundaries: Ocean-Continent", target: "_top",title:"Click to jump to concept"});
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
     this.attr({cursor: "pointer", href: "/concept/Ocean-Continent-Convergent-Plate-Boundaries/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[267], bt[267], br[267]-bl[267], bb[267]-bt[267], 10*sfac[267]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[267]=paper.setFinish(); 
t[267].toFront(); 
vidicon.toFront(); 

t[268]=paper.text(nx[268],ny[268]-10,'Ocean Surface\nCurrents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[268]});
t[268].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Surface-Ocean-Currents/#Ocean Surface Currents", target: "_top",title:"Click to jump to concept"});
}); 
t[268].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[268].getBBox(); 
bt[268]=ny[268]-10-(tBox.height/2+10*sfac[268]);
bb[268]=ny[268]-10+(tBox.height/2+10*sfac[268]);
bl[268]=nx[268]-(tBox.width/2+10*sfac[268]);
br[268]=nx[268]+(tBox.width/2+10*sfac[268]);
var nwidth = br[268]-bl[268]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[268] = bl[268] - delta; 
    br[268] = br[268] + delta; 
} 
bb[268] = bb[268]+20; 
yicon = bb[268]-25; 
xicon2 = nx[268]+-40; 
xicon3 = nx[268]+-10; 
xicon4 = nx[268]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Surface-Ocean-Currents/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Surface-Ocean-Currents/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Surface-Ocean-Currents/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[268], bt[268], br[268]-bl[268], bb[268]-bt[268], 10*sfac[268]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[268]=paper.setFinish(); 
t[268].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[269]=paper.text(nx[269],ny[269],'Introduction to Earth Science').attr({fill:"#666666","font-size": 14*sfac[269]});
tBox=t[269].getBBox(); 
bt[269]=ny[269]-(tBox.height/2+10*sfac[269]);
bb[269]=ny[269]+(tBox.height/2+10*sfac[269]);
bl[269]=nx[269]-(tBox.width/2+10*sfac[269]);
br[269]=nx[269]+(tBox.width/2+10*sfac[269]);
paper.setStart(); 
rect=paper.rect(bl[269], bt[269], br[269]-bl[269], bb[269]-bt[269], 10*sfac[269]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[269]=paper.setFinish(); 

t[270]=paper.text(nx[270],ny[270]-10,'Aquifers').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[270]});
t[270].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Groundwater-Aquifers/#Aquifers", target: "_top",title:"Click to jump to concept"});
}); 
t[270].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[270].getBBox(); 
bt[270]=ny[270]-10-(tBox.height/2+10*sfac[270]);
bb[270]=ny[270]-10+(tBox.height/2+10*sfac[270]);
bl[270]=nx[270]-(tBox.width/2+10*sfac[270]);
br[270]=nx[270]+(tBox.width/2+10*sfac[270]);
var nwidth = br[270]-bl[270]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[270] = bl[270] - delta; 
    br[270] = br[270] + delta; 
} 
bb[270] = bb[270]+20; 
yicon = bb[270]-25; 
xicon2 = nx[270]+-40; 
xicon3 = nx[270]+-10; 
xicon4 = nx[270]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Groundwater-Aquifers/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Groundwater-Aquifers/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[270], bt[270], br[270]-bl[270], bb[270]-bt[270], 10*sfac[270]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[270]=paper.setFinish(); 
t[270].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[271]=paper.text(nx[271],ny[271]-10,'Human Uses of Water').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[271]});
t[271].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Uses-of-Water/#Human Uses of Water", target: "_top",title:"Click to jump to concept"});
}); 
t[271].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[271].getBBox(); 
bt[271]=ny[271]-10-(tBox.height/2+10*sfac[271]);
bb[271]=ny[271]-10+(tBox.height/2+10*sfac[271]);
bl[271]=nx[271]-(tBox.width/2+10*sfac[271]);
br[271]=nx[271]+(tBox.width/2+10*sfac[271]);
var nwidth = br[271]-bl[271]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[271] = bl[271] - delta; 
    br[271] = br[271] + delta; 
} 
bb[271] = bb[271]+20; 
yicon = bb[271]-25; 
xicon2 = nx[271]+-40; 
xicon3 = nx[271]+-10; 
xicon4 = nx[271]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Uses-of-Water/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[271], bt[271], br[271]-bl[271], bb[271]-bt[271], 10*sfac[271]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[271]=paper.setFinish(); 
t[271].toFront(); 
exicon.toFront(); 

t[272]=paper.text(nx[272],ny[272]-10,'Meteors').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[272]});
t[272].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Meteors/#Meteors", target: "_top",title:"Click to jump to concept"});
}); 
t[272].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[272].getBBox(); 
bt[272]=ny[272]-10-(tBox.height/2+10*sfac[272]);
bb[272]=ny[272]-10+(tBox.height/2+10*sfac[272]);
bl[272]=nx[272]-(tBox.width/2+10*sfac[272]);
br[272]=nx[272]+(tBox.width/2+10*sfac[272]);
var nwidth = br[272]-bl[272]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[272] = bl[272] - delta; 
    br[272] = br[272] + delta; 
} 
bb[272] = bb[272]+20; 
yicon = bb[272]-25; 
xicon2 = nx[272]+-40; 
xicon3 = nx[272]+-10; 
xicon4 = nx[272]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Meteors/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[272], bt[272], br[272]-bl[272], bb[272]-bt[272], 10*sfac[272]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[272]=paper.setFinish(); 
t[272].toFront(); 
exicon.toFront(); 

t[273]=paper.text(nx[273],ny[273]-10,'Sustainable Development').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[273]});
t[273].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Sustainable-Development/#Sustainable Development", target: "_top",title:"Click to jump to concept"});
}); 
t[273].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[273].getBBox(); 
bt[273]=ny[273]-10-(tBox.height/2+10*sfac[273]);
bb[273]=ny[273]-10+(tBox.height/2+10*sfac[273]);
bl[273]=nx[273]-(tBox.width/2+10*sfac[273]);
br[273]=nx[273]+(tBox.width/2+10*sfac[273]);
var nwidth = br[273]-bl[273]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[273] = bl[273] - delta; 
    br[273] = br[273] + delta; 
} 
bb[273] = bb[273]+20; 
yicon = bb[273]-25; 
xicon2 = nx[273]+-40; 
xicon3 = nx[273]+-10; 
xicon4 = nx[273]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Sustainable-Development/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Sustainable-Development/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[273], bt[273], br[273]-bl[273], bb[273]-bt[273], 10*sfac[273]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[273]=paper.setFinish(); 
t[273].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[274]=paper.text(nx[274],ny[274]-10,'Correlation and Causation').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[274]});
t[274].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Correlation-and-Causation/#Correlation and Causation", target: "_top",title:"Click to jump to concept"});
}); 
t[274].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[274].getBBox(); 
bt[274]=ny[274]-10-(tBox.height/2+10*sfac[274]);
bb[274]=ny[274]-10+(tBox.height/2+10*sfac[274]);
bl[274]=nx[274]-(tBox.width/2+10*sfac[274]);
br[274]=nx[274]+(tBox.width/2+10*sfac[274]);
var nwidth = br[274]-bl[274]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[274] = bl[274] - delta; 
    br[274] = br[274] + delta; 
} 
bb[274] = bb[274]+20; 
yicon = bb[274]-25; 
xicon2 = nx[274]+-40; 
xicon3 = nx[274]+-10; 
xicon4 = nx[274]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Correlation-and-Causation/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Correlation-and-Causation/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[274], bt[274], br[274]-bl[274], bb[274]-bt[274], 10*sfac[274]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[274]=paper.setFinish(); 
t[274].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[275]=paper.text(nx[275],ny[275],'Continental Climates').attr({fill:"#666666","font-size": 14*sfac[275]});
tBox=t[275].getBBox(); 
bt[275]=ny[275]-(tBox.height/2+10*sfac[275]);
bb[275]=ny[275]+(tBox.height/2+10*sfac[275]);
bl[275]=nx[275]-(tBox.width/2+10*sfac[275]);
br[275]=nx[275]+(tBox.width/2+10*sfac[275]);
paper.setStart(); 
rect=paper.rect(bl[275], bt[275], br[275]-bl[275], bb[275]-bt[275], 10*sfac[275]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[275]=paper.setFinish(); 

t[276]=paper.text(nx[276],ny[276],'Earth in Space').attr({fill:"#666666","font-size": 14*sfac[276]});
tBox=t[276].getBBox(); 
bt[276]=ny[276]-(tBox.height/2+10*sfac[276]);
bb[276]=ny[276]+(tBox.height/2+10*sfac[276]);
bl[276]=nx[276]-(tBox.width/2+10*sfac[276]);
br[276]=nx[276]+(tBox.width/2+10*sfac[276]);
paper.setStart(); 
rect=paper.rect(bl[276], bt[276], br[276]-bl[276], bb[276]-bt[276], 10*sfac[276]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[276]=paper.setFinish(); 

t[277]=paper.text(nx[277],ny[277]-10,'Deep Currents').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[277]});
t[277].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Deep-Ocean-Currents/#Deep Currents", target: "_top",title:"Click to jump to concept"});
}); 
t[277].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[277].getBBox(); 
bt[277]=ny[277]-10-(tBox.height/2+10*sfac[277]);
bb[277]=ny[277]-10+(tBox.height/2+10*sfac[277]);
bl[277]=nx[277]-(tBox.width/2+10*sfac[277]);
br[277]=nx[277]+(tBox.width/2+10*sfac[277]);
var nwidth = br[277]-bl[277]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[277] = bl[277] - delta; 
    br[277] = br[277] + delta; 
} 
bb[277] = bb[277]+20; 
yicon = bb[277]-25; 
xicon2 = nx[277]+-40; 
xicon3 = nx[277]+-10; 
xicon4 = nx[277]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Deep-Ocean-Currents/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Deep-Ocean-Currents/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Deep-Ocean-Currents/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[277], bt[277], br[277]-bl[277], bb[277]-bt[277], 10*sfac[277]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[277]=paper.setFinish(); 
t[277].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[278]=paper.text(nx[278],ny[278],'Renewable Energy\nResources').attr({fill:"#666666","font-size": 14*sfac[278]});
tBox=t[278].getBBox(); 
bt[278]=ny[278]-(tBox.height/2+10*sfac[278]);
bb[278]=ny[278]+(tBox.height/2+10*sfac[278]);
bl[278]=nx[278]-(tBox.width/2+10*sfac[278]);
br[278]=nx[278]+(tBox.width/2+10*sfac[278]);
paper.setStart(); 
rect=paper.rect(bl[278], bt[278], br[278]-bl[278], bb[278]-bt[278], 10*sfac[278]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[278]=paper.setFinish(); 

t[279]=paper.text(nx[279],ny[279],'Natural Resources (non-energy)').attr({fill:"#666666","font-size": 14*sfac[279]});
tBox=t[279].getBBox(); 
bt[279]=ny[279]-(tBox.height/2+10*sfac[279]);
bb[279]=ny[279]+(tBox.height/2+10*sfac[279]);
bl[279]=nx[279]-(tBox.width/2+10*sfac[279]);
br[279]=nx[279]+(tBox.width/2+10*sfac[279]);
paper.setStart(); 
rect=paper.rect(bl[279], bt[279], br[279]-bl[279], bb[279]-bt[279], 10*sfac[279]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[279]=paper.setFinish(); 

t[280]=paper.text(nx[280],ny[280],'Biological Populations').attr({fill:"#666666","font-size": 14*sfac[280]});
tBox=t[280].getBBox(); 
bt[280]=ny[280]-(tBox.height/2+10*sfac[280]);
bb[280]=ny[280]+(tBox.height/2+10*sfac[280]);
bl[280]=nx[280]-(tBox.width/2+10*sfac[280]);
br[280]=nx[280]+(tBox.width/2+10*sfac[280]);
paper.setStart(); 
rect=paper.rect(bl[280], bt[280], br[280]-bl[280], bb[280]-bt[280], 10*sfac[280]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[280]=paper.setFinish(); 

t[281]=paper.text(nx[281],ny[281]-10,'Human Impacts\non Climate').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[281]});
t[281].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Global-Warming/#Human Impacts on Climate", target: "_top",title:"Click to jump to concept"});
}); 
t[281].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[281].getBBox(); 
bt[281]=ny[281]-10-(tBox.height/2+10*sfac[281]);
bb[281]=ny[281]-10+(tBox.height/2+10*sfac[281]);
bl[281]=nx[281]-(tBox.width/2+10*sfac[281]);
br[281]=nx[281]+(tBox.width/2+10*sfac[281]);
var nwidth = br[281]-bl[281]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[281] = bl[281] - delta; 
    br[281] = br[281] + delta; 
} 
bb[281] = bb[281]+20; 
yicon = bb[281]-25; 
xicon2 = nx[281]+-40; 
xicon3 = nx[281]+-10; 
xicon4 = nx[281]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Global-Warming/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Global-Warming/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[281], bt[281], br[281]-bl[281], bb[281]-bt[281], 10*sfac[281]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[281]=paper.setFinish(); 
t[281].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[282]=paper.text(nx[282],ny[282]-10,'Soil Characteristics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[282]});
t[282].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Introduction-to-Soils/#Soil Characteristics", target: "_top",title:"Click to jump to concept"});
}); 
t[282].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[282].getBBox(); 
bt[282]=ny[282]-10-(tBox.height/2+10*sfac[282]);
bb[282]=ny[282]-10+(tBox.height/2+10*sfac[282]);
bl[282]=nx[282]-(tBox.width/2+10*sfac[282]);
br[282]=nx[282]+(tBox.width/2+10*sfac[282]);
var nwidth = br[282]-bl[282]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[282] = bl[282] - delta; 
    br[282] = br[282] + delta; 
} 
bb[282] = bb[282]+20; 
yicon = bb[282]-25; 
xicon2 = nx[282]+-40; 
xicon3 = nx[282]+-10; 
xicon4 = nx[282]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-Soils/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-Soils/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[282], bt[282], br[282]-bl[282], bb[282]-bt[282], 10*sfac[282]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[282]=paper.setFinish(); 
t[282].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[283]=paper.text(nx[283],ny[283]-10,'Eukaryotes to Multicellular Life').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[283]});
t[283].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Evolution-of-Eukaryotes-to-Multicellular-Life/#Eukaryotes to Multicellular Life", target: "_top",title:"Click to jump to concept"});
}); 
t[283].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[283].getBBox(); 
bt[283]=ny[283]-10-(tBox.height/2+10*sfac[283]);
bb[283]=ny[283]-10+(tBox.height/2+10*sfac[283]);
bl[283]=nx[283]-(tBox.width/2+10*sfac[283]);
br[283]=nx[283]+(tBox.width/2+10*sfac[283]);
var nwidth = br[283]-bl[283]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[283] = bl[283] - delta; 
    br[283] = br[283] + delta; 
} 
bb[283] = bb[283]+20; 
yicon = bb[283]-25; 
xicon2 = nx[283]+-40; 
xicon3 = nx[283]+-10; 
xicon4 = nx[283]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Evolution-of-Eukaryotes-to-Multicellular-Life/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Evolution-of-Eukaryotes-to-Multicellular-Life/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[283], bt[283], br[283]-bl[283], bb[283]-bt[283], 10*sfac[283]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[283]=paper.setFinish(); 
t[283].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[284]=paper.text(nx[284],ny[284]-10,'Divergent Plate Boundaries\nin the Oceans').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[284]});
t[284].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Divergent-Plate-Boundaries-in-the-Oceans/#Divergent Plate Boundaries in the Oceans", target: "_top",title:"Click to jump to concept"});
}); 
t[284].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[284].getBBox(); 
bt[284]=ny[284]-10-(tBox.height/2+10*sfac[284]);
bb[284]=ny[284]-10+(tBox.height/2+10*sfac[284]);
bl[284]=nx[284]-(tBox.width/2+10*sfac[284]);
br[284]=nx[284]+(tBox.width/2+10*sfac[284]);
var nwidth = br[284]-bl[284]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[284] = bl[284] - delta; 
    br[284] = br[284] + delta; 
} 
bb[284] = bb[284]+20; 
yicon = bb[284]-25; 
xicon2 = nx[284]+-40; 
xicon3 = nx[284]+-10; 
xicon4 = nx[284]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Divergent-Plate-Boundaries-in-the-Oceans/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[284], bt[284], br[284]-bl[284], bb[284]-bt[284], 10*sfac[284]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[284]=paper.setFinish(); 
t[284].toFront(); 
vidicon.toFront(); 

t[285]=paper.text(nx[285],ny[285]-10,'Processes of the\nWater Cycle').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[285]});
t[285].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Processes-of-the-Water-Cycle/#Processes of the Water Cycle", target: "_top",title:"Click to jump to concept"});
}); 
t[285].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[285].getBBox(); 
bt[285]=ny[285]-10-(tBox.height/2+10*sfac[285]);
bb[285]=ny[285]-10+(tBox.height/2+10*sfac[285]);
bl[285]=nx[285]-(tBox.width/2+10*sfac[285]);
br[285]=nx[285]+(tBox.width/2+10*sfac[285]);
var nwidth = br[285]-bl[285]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[285] = bl[285] - delta; 
    br[285] = br[285] + delta; 
} 
bb[285] = bb[285]+20; 
yicon = bb[285]-25; 
xicon2 = nx[285]+-40; 
xicon3 = nx[285]+-10; 
xicon4 = nx[285]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Processes-of-the-Water-Cycle/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Processes-of-the-Water-Cycle/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Processes-of-the-Water-Cycle/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[285], bt[285], br[285]-bl[285], bb[285]-bt[285], 10*sfac[285]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[285]=paper.setFinish(); 
t[285].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[286]=paper.text(nx[286],ny[286]-10,'Hurricanes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[286]});
t[286].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Hurricanes/#Hurricanes", target: "_top",title:"Click to jump to concept"});
}); 
t[286].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[286].getBBox(); 
bt[286]=ny[286]-10-(tBox.height/2+10*sfac[286]);
bb[286]=ny[286]-10+(tBox.height/2+10*sfac[286]);
bl[286]=nx[286]-(tBox.width/2+10*sfac[286]);
br[286]=nx[286]+(tBox.width/2+10*sfac[286]);
var nwidth = br[286]-bl[286]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[286] = bl[286] - delta; 
    br[286] = br[286] + delta; 
} 
bb[286] = bb[286]+20; 
yicon = bb[286]-25; 
xicon2 = nx[286]+-40; 
xicon3 = nx[286]+-10; 
xicon4 = nx[286]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Hurricanes/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Hurricanes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Hurricanes/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[286], bt[286], br[286]-bl[286], bb[286]-bt[286], 10*sfac[286]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[286]=paper.setFinish(); 
t[286].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[287]=paper.text(nx[287],ny[287],'Problems with Water Distribution\nAmong Human Populations').attr({fill:"#666666","font-size": 14*sfac[287]});
tBox=t[287].getBBox(); 
bt[287]=ny[287]-(tBox.height/2+10*sfac[287]);
bb[287]=ny[287]+(tBox.height/2+10*sfac[287]);
bl[287]=nx[287]-(tBox.width/2+10*sfac[287]);
br[287]=nx[287]+(tBox.width/2+10*sfac[287]);
paper.setStart(); 
rect=paper.rect(bl[287], bt[287], br[287]-bl[287], bb[287]-bt[287], 10*sfac[287]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[287]=paper.setFinish(); 

t[288]=paper.text(nx[288],ny[288]-10,'Importance of the Atmosphere').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[288]});
t[288].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Importance-of-the-Atmosphere/#Importance of the Atmosphere", target: "_top",title:"Click to jump to concept"});
}); 
t[288].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[288].getBBox(); 
bt[288]=ny[288]-10-(tBox.height/2+10*sfac[288]);
bb[288]=ny[288]-10+(tBox.height/2+10*sfac[288]);
bl[288]=nx[288]-(tBox.width/2+10*sfac[288]);
br[288]=nx[288]+(tBox.width/2+10*sfac[288]);
var nwidth = br[288]-bl[288]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[288] = bl[288] - delta; 
    br[288] = br[288] + delta; 
} 
bb[288] = bb[288]+20; 
yicon = bb[288]-25; 
xicon2 = nx[288]+-40; 
xicon3 = nx[288]+-10; 
xicon4 = nx[288]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Importance-of-the-Atmosphere/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Importance-of-the-Atmosphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[288], bt[288], br[288]-bl[288], bb[288]-bt[288], 10*sfac[288]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[288]=paper.setFinish(); 
t[288].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[289]=paper.text(nx[289],ny[289]-10,"Altitude and Mountain Ranges'\nInfluence on Climate").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[289]});
t[289].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Effect-of-Altitude-and-Mountain-Ranges-on-Climate/#Altitude and Mountain Ranges' Influence on Climate", target: "_top",title:"Click to jump to concept"});
}); 
t[289].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[289].getBBox(); 
bt[289]=ny[289]-10-(tBox.height/2+10*sfac[289]);
bb[289]=ny[289]-10+(tBox.height/2+10*sfac[289]);
bl[289]=nx[289]-(tBox.width/2+10*sfac[289]);
br[289]=nx[289]+(tBox.width/2+10*sfac[289]);
var nwidth = br[289]-bl[289]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[289] = bl[289] - delta; 
    br[289] = br[289] + delta; 
} 
bb[289] = bb[289]+20; 
yicon = bb[289]-25; 
xicon2 = nx[289]+-40; 
xicon3 = nx[289]+-10; 
xicon4 = nx[289]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Effect-of-Altitude-and-Mountain-Ranges-on-Climate/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Effect-of-Altitude-and-Mountain-Ranges-on-Climate/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[289], bt[289], br[289]-bl[289], bb[289]-bt[289], 10*sfac[289]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[289]=paper.setFinish(); 
t[289].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[290]=paper.text(nx[290],ny[290]-10,'Air Quality').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[290]});
t[290].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Air-Quality/#Air Quality", target: "_top",title:"Click to jump to concept"});
}); 
t[290].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[290].getBBox(); 
bt[290]=ny[290]-10-(tBox.height/2+10*sfac[290]);
bb[290]=ny[290]-10+(tBox.height/2+10*sfac[290]);
bl[290]=nx[290]-(tBox.width/2+10*sfac[290]);
br[290]=nx[290]+(tBox.width/2+10*sfac[290]);
var nwidth = br[290]-bl[290]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[290] = bl[290] - delta; 
    br[290] = br[290] + delta; 
} 
bb[290] = bb[290]+20; 
yicon = bb[290]-25; 
xicon2 = nx[290]+-40; 
xicon3 = nx[290]+-10; 
xicon4 = nx[290]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Air-Quality/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Air-Quality/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Air-Quality/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[290], bt[290], br[290]-bl[290], bb[290]-bt[290], 10*sfac[290]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[290]=paper.setFinish(); 
t[290].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[291]=paper.text(nx[291],ny[291]-10,'Asteroids').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[291]});
t[291].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Asteroids/#Asteroids", target: "_top",title:"Click to jump to concept"});
}); 
t[291].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[291].getBBox(); 
bt[291]=ny[291]-10-(tBox.height/2+10*sfac[291]);
bb[291]=ny[291]-10+(tBox.height/2+10*sfac[291]);
bl[291]=nx[291]-(tBox.width/2+10*sfac[291]);
br[291]=nx[291]+(tBox.width/2+10*sfac[291]);
var nwidth = br[291]-bl[291]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[291] = bl[291] - delta; 
    br[291] = br[291] + delta; 
} 
bb[291] = bb[291]+20; 
yicon = bb[291]-25; 
xicon2 = nx[291]+-40; 
xicon3 = nx[291]+-10; 
xicon4 = nx[291]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Asteroids/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Asteroids/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[291], bt[291], br[291]-bl[291], bb[291]-bt[291], 10*sfac[291]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[291]=paper.setFinish(); 
t[291].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[292]=paper.text(nx[292],ny[292],'Humidity, Clouds, Fog, Precipitation').attr({fill:"#666666","font-size": 14*sfac[292]});
tBox=t[292].getBBox(); 
bt[292]=ny[292]-(tBox.height/2+10*sfac[292]);
bb[292]=ny[292]+(tBox.height/2+10*sfac[292]);
bl[292]=nx[292]-(tBox.width/2+10*sfac[292]);
br[292]=nx[292]+(tBox.width/2+10*sfac[292]);
paper.setStart(); 
rect=paper.rect(bl[292], bt[292], br[292]-bl[292], bb[292]-bt[292], 10*sfac[292]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[292]=paper.setFinish(); 

t[293]=paper.text(nx[293],ny[293]-10,'Magma Composition').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[293]});
t[293].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Magma-Composition-at-Volcanoes/#Magma Composition", target: "_top",title:"Click to jump to concept"});
}); 
t[293].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[293].getBBox(); 
bt[293]=ny[293]-10-(tBox.height/2+10*sfac[293]);
bb[293]=ny[293]-10+(tBox.height/2+10*sfac[293]);
bl[293]=nx[293]-(tBox.width/2+10*sfac[293]);
br[293]=nx[293]+(tBox.width/2+10*sfac[293]);
var nwidth = br[293]-bl[293]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[293] = bl[293] - delta; 
    br[293] = br[293] + delta; 
} 
bb[293] = bb[293]+20; 
yicon = bb[293]-25; 
xicon2 = nx[293]+-40; 
xicon3 = nx[293]+-10; 
xicon4 = nx[293]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Magma-Composition-at-Volcanoes/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Magma-Composition-at-Volcanoes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Magma-Composition-at-Volcanoes/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[293], bt[293], br[293]-bl[293], bb[293]-bt[293], 10*sfac[293]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[293]=paper.setFinish(); 
t[293].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[294]=paper.text(nx[294],ny[294]-10,'Atoms and Isotopes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[294]});
t[294].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Atoms-to-Molecules/#Atoms and Isotopes", target: "_top",title:"Click to jump to concept"});
}); 
t[294].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[294].getBBox(); 
bt[294]=ny[294]-10-(tBox.height/2+10*sfac[294]);
bb[294]=ny[294]-10+(tBox.height/2+10*sfac[294]);
bl[294]=nx[294]-(tBox.width/2+10*sfac[294]);
br[294]=nx[294]+(tBox.width/2+10*sfac[294]);
var nwidth = br[294]-bl[294]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[294] = bl[294] - delta; 
    br[294] = br[294] + delta; 
} 
bb[294] = bb[294]+20; 
yicon = bb[294]-25; 
xicon2 = nx[294]+-40; 
xicon3 = nx[294]+-10; 
xicon4 = nx[294]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Atoms-to-Molecules/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[294], bt[294], br[294]-bl[294], bb[294]-bt[294], 10*sfac[294]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[294]=paper.setFinish(); 
t[294].toFront(); 
exicon.toFront(); 

t[295]=paper.text(nx[295],ny[295],'Other Solar System Objects: Asteroids,\nComets, Dwarf Planets').attr({fill:"#666666","font-size": 14*sfac[295]});
tBox=t[295].getBBox(); 
bt[295]=ny[295]-(tBox.height/2+10*sfac[295]);
bb[295]=ny[295]+(tBox.height/2+10*sfac[295]);
bl[295]=nx[295]-(tBox.width/2+10*sfac[295]);
br[295]=nx[295]+(tBox.width/2+10*sfac[295]);
paper.setStart(); 
rect=paper.rect(bl[295], bt[295], br[295]-bl[295], bb[295]-bt[295], 10*sfac[295]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[295]=paper.setFinish(); 

t[296]=paper.text(nx[296],ny[296]-10,'Latitude, Longitude, and\nDirection').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[296]});
t[296].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Location-and-Direction/#Latitude, Longitude, and Direction", target: "_top",title:"Click to jump to concept"});
}); 
t[296].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[296].getBBox(); 
bt[296]=ny[296]-10-(tBox.height/2+10*sfac[296]);
bb[296]=ny[296]-10+(tBox.height/2+10*sfac[296]);
bl[296]=nx[296]-(tBox.width/2+10*sfac[296]);
br[296]=nx[296]+(tBox.width/2+10*sfac[296]);
var nwidth = br[296]-bl[296]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[296] = bl[296] - delta; 
    br[296] = br[296] + delta; 
} 
bb[296] = bb[296]+20; 
yicon = bb[296]-25; 
xicon2 = nx[296]+-40; 
xicon3 = nx[296]+-10; 
xicon4 = nx[296]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Location-and-Direction/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Location-and-Direction/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[296], bt[296], br[296]-bl[296], bb[296]-bt[296], 10*sfac[296]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[296]=paper.setFinish(); 
t[296].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[297]=paper.text(nx[297],ny[297]-10,'Why a Universe?').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[297]});
t[297].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Introduction-to-the-Universe/#Why a Universe?", target: "_top",title:"Click to jump to concept"});
}); 
t[297].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[297].getBBox(); 
bt[297]=ny[297]-10-(tBox.height/2+10*sfac[297]);
bb[297]=ny[297]-10+(tBox.height/2+10*sfac[297]);
bl[297]=nx[297]-(tBox.width/2+10*sfac[297]);
br[297]=nx[297]+(tBox.width/2+10*sfac[297]);
var nwidth = br[297]-bl[297]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[297] = bl[297] - delta; 
    br[297] = br[297] + delta; 
} 
bb[297] = bb[297]+20; 
yicon = bb[297]-25; 
xicon2 = nx[297]+-40; 
xicon3 = nx[297]+-10; 
xicon4 = nx[297]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-the-Universe/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[297], bt[297], br[297]-bl[297], bb[297]-bt[297], 10*sfac[297]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[297]=paper.setFinish(); 
t[297].toFront(); 
exicon.toFront(); 

t[298]=paper.text(nx[298],ny[298],'Paleozoic').attr({fill:"#666666","font-size": 14*sfac[298]});
tBox=t[298].getBBox(); 
bt[298]=ny[298]-(tBox.height/2+10*sfac[298]);
bb[298]=ny[298]+(tBox.height/2+10*sfac[298]);
bl[298]=nx[298]-(tBox.width/2+10*sfac[298]);
br[298]=nx[298]+(tBox.width/2+10*sfac[298]);
paper.setStart(); 
rect=paper.rect(bl[298], bt[298], br[298]-bl[298], bb[298]-bt[298], 10*sfac[298]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[298]=paper.setFinish(); 

t[299]=paper.text(nx[299],ny[299],'Tools for Space Science').attr({fill:"#666666","font-size": 14*sfac[299]});
tBox=t[299].getBBox(); 
bt[299]=ny[299]-(tBox.height/2+10*sfac[299]);
bb[299]=ny[299]+(tBox.height/2+10*sfac[299]);
bl[299]=nx[299]-(tBox.width/2+10*sfac[299]);
br[299]=nx[299]+(tBox.width/2+10*sfac[299]);
paper.setStart(); 
rect=paper.rect(bl[299], bt[299], br[299]-bl[299], bb[299]-bt[299], 10*sfac[299]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[299]=paper.setFinish(); 

t[300]=paper.text(nx[300],ny[300]-10,'Ocean\nWaves').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[300]});
t[300].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Wind-Waves/#Ocean Waves", target: "_top",title:"Click to jump to concept"});
}); 
t[300].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[300].getBBox(); 
bt[300]=ny[300]-10-(tBox.height/2+10*sfac[300]);
bb[300]=ny[300]-10+(tBox.height/2+10*sfac[300]);
bl[300]=nx[300]-(tBox.width/2+10*sfac[300]);
br[300]=nx[300]+(tBox.width/2+10*sfac[300]);
var nwidth = br[300]-bl[300]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[300] = bl[300] - delta; 
    br[300] = br[300] + delta; 
} 
bb[300] = bb[300]+20; 
yicon = bb[300]-25; 
xicon2 = nx[300]+-40; 
xicon3 = nx[300]+-10; 
xicon4 = nx[300]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Wind-Waves/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Wind-Waves/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[300], bt[300], br[300]-bl[300], bb[300]-bt[300], 10*sfac[300]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[300]=paper.setFinish(); 
t[300].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[301]=paper.text(nx[301],ny[301]-10,'Weather vs. Climate').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[301]});
t[301].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Weather-versus-Climate/#Weather vs. Climate", target: "_top",title:"Click to jump to concept"});
}); 
t[301].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[301].getBBox(); 
bt[301]=ny[301]-10-(tBox.height/2+10*sfac[301]);
bb[301]=ny[301]-10+(tBox.height/2+10*sfac[301]);
bl[301]=nx[301]-(tBox.width/2+10*sfac[301]);
br[301]=nx[301]+(tBox.width/2+10*sfac[301]);
var nwidth = br[301]-bl[301]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[301] = bl[301] - delta; 
    br[301] = br[301] + delta; 
} 
bb[301] = bb[301]+20; 
yicon = bb[301]-25; 
xicon2 = nx[301]+-40; 
xicon3 = nx[301]+-10; 
xicon4 = nx[301]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Weather-versus-Climate/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Weather-versus-Climate/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Weather-versus-Climate/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[301], bt[301], br[301]-bl[301], bb[301]-bt[301], 10*sfac[301]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[301]=paper.setFinish(); 
t[301].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[302]=paper.text(nx[302],ny[302]-10,'Uranus').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[302]});
t[302].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Uranus/#Uranus", target: "_top",title:"Click to jump to concept"});
}); 
t[302].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[302].getBBox(); 
bt[302]=ny[302]-10-(tBox.height/2+10*sfac[302]);
bb[302]=ny[302]-10+(tBox.height/2+10*sfac[302]);
bl[302]=nx[302]-(tBox.width/2+10*sfac[302]);
br[302]=nx[302]+(tBox.width/2+10*sfac[302]);
var nwidth = br[302]-bl[302]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[302] = bl[302] - delta; 
    br[302] = br[302] + delta; 
} 
bb[302] = bb[302]+20; 
yicon = bb[302]-25; 
xicon2 = nx[302]+-40; 
xicon3 = nx[302]+-10; 
xicon4 = nx[302]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Uranus/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Uranus/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[302], bt[302], br[302]-bl[302], bb[302]-bt[302], 10*sfac[302]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[302]=paper.setFinish(); 
t[302].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[303]=paper.text(nx[303],ny[303],'Air Pollution').attr({fill:"#666666","font-size": 14*sfac[303]});
tBox=t[303].getBBox(); 
bt[303]=ny[303]-(tBox.height/2+10*sfac[303]);
bb[303]=ny[303]+(tBox.height/2+10*sfac[303]);
bl[303]=nx[303]-(tBox.width/2+10*sfac[303]);
br[303]=nx[303]+(tBox.width/2+10*sfac[303]);
paper.setStart(); 
rect=paper.rect(bl[303], bt[303], br[303]-bl[303], bb[303]-bt[303], 10*sfac[303]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[303]=paper.setFinish(); 

t[304]=paper.text(nx[304],ny[304]-10,'Paleozoic\nSeas').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[304]});
t[304].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Paleozoic-and-Mesozoic-Seas/#Paleozoic Seas", target: "_top",title:"Click to jump to concept"});
}); 
t[304].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[304].getBBox(); 
bt[304]=ny[304]-10-(tBox.height/2+10*sfac[304]);
bb[304]=ny[304]-10+(tBox.height/2+10*sfac[304]);
bl[304]=nx[304]-(tBox.width/2+10*sfac[304]);
br[304]=nx[304]+(tBox.width/2+10*sfac[304]);
var nwidth = br[304]-bl[304]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[304] = bl[304] - delta; 
    br[304] = br[304] + delta; 
} 
bb[304] = bb[304]+20; 
yicon = bb[304]-25; 
xicon2 = nx[304]+-40; 
xicon3 = nx[304]+-10; 
xicon4 = nx[304]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Paleozoic-and-Mesozoic-Seas/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[304], bt[304], br[304]-bl[304], bb[304]-bt[304], 10*sfac[304]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[304]=paper.setFinish(); 
t[304].toFront(); 
exicon.toFront(); 

t[305]=paper.text(nx[305],ny[305]-10,'Fresh Water Ecosystems').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[305]});
t[305].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Fresh-Water-Ecosystems/#Fresh Water Ecosystems", target: "_top",title:"Click to jump to concept"});
}); 
t[305].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[305].getBBox(); 
bt[305]=ny[305]-10-(tBox.height/2+10*sfac[305]);
bb[305]=ny[305]-10+(tBox.height/2+10*sfac[305]);
bl[305]=nx[305]-(tBox.width/2+10*sfac[305]);
br[305]=nx[305]+(tBox.width/2+10*sfac[305]);
var nwidth = br[305]-bl[305]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[305] = bl[305] - delta; 
    br[305] = br[305] + delta; 
} 
bb[305] = bb[305]+20; 
yicon = bb[305]-25; 
xicon2 = nx[305]+-40; 
xicon3 = nx[305]+-10; 
xicon4 = nx[305]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Fresh-Water-Ecosystems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[305], bt[305], br[305]-bl[305], bb[305]-bt[305], 10*sfac[305]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[305]=paper.setFinish(); 
t[305].toFront(); 
exicon.toFront(); 

t[306]=paper.text(nx[306],ny[306],'Formation of the Universe').attr({fill:"#666666","font-size": 14*sfac[306]});
tBox=t[306].getBBox(); 
bt[306]=ny[306]-(tBox.height/2+10*sfac[306]);
bb[306]=ny[306]+(tBox.height/2+10*sfac[306]);
bl[306]=nx[306]-(tBox.width/2+10*sfac[306]);
br[306]=nx[306]+(tBox.width/2+10*sfac[306]);
paper.setStart(); 
rect=paper.rect(bl[306], bt[306], br[306]-bl[306], bb[306]-bt[306], 10*sfac[306]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[306]=paper.setFinish(); 

t[307]=paper.text(nx[307],ny[307]-10,'Intraplate Earthquakes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[307]});
t[307].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Intraplate-Earthquakes/#Intraplate Earthquakes", target: "_top",title:"Click to jump to concept"});
}); 
t[307].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[307].getBBox(); 
bt[307]=ny[307]-10-(tBox.height/2+10*sfac[307]);
bb[307]=ny[307]-10+(tBox.height/2+10*sfac[307]);
bl[307]=nx[307]-(tBox.width/2+10*sfac[307]);
br[307]=nx[307]+(tBox.width/2+10*sfac[307]);
var nwidth = br[307]-bl[307]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[307] = bl[307] - delta; 
    br[307] = br[307] + delta; 
} 
bb[307] = bb[307]+20; 
yicon = bb[307]-25; 
xicon2 = nx[307]+-40; 
xicon3 = nx[307]+-10; 
xicon4 = nx[307]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Intraplate-Earthquakes/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Intraplate-Earthquakes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[307], bt[307], br[307]-bl[307], bb[307]-bt[307], 10*sfac[307]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[307]=paper.setFinish(); 
t[307].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[308]=paper.text(nx[308],ny[308]-10,'Age of Earth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[308]});
t[308].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Age-of-Earth/#Age of Earth", target: "_top",title:"Click to jump to concept"});
}); 
t[308].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[308].getBBox(); 
bt[308]=ny[308]-10-(tBox.height/2+10*sfac[308]);
bb[308]=ny[308]-10+(tBox.height/2+10*sfac[308]);
bl[308]=nx[308]-(tBox.width/2+10*sfac[308]);
br[308]=nx[308]+(tBox.width/2+10*sfac[308]);
var nwidth = br[308]-bl[308]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[308] = bl[308] - delta; 
    br[308] = br[308] + delta; 
} 
bb[308] = bb[308]+20; 
yicon = bb[308]-25; 
xicon2 = nx[308]+-40; 
xicon3 = nx[308]+-10; 
xicon4 = nx[308]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Age-of-Earth/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Age-of-Earth/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[308], bt[308], br[308]-bl[308], bb[308]-bt[308], 10*sfac[308]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[308]=paper.setFinish(); 
t[308].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[309]=paper.text(nx[309],ny[309]-10,'Metabolism and Replication').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[309]});
t[309].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Metabolism-and-Replication/#Metabolism and Replication", target: "_top",title:"Click to jump to concept"});
}); 
t[309].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[309].getBBox(); 
bt[309]=ny[309]-10-(tBox.height/2+10*sfac[309]);
bb[309]=ny[309]-10+(tBox.height/2+10*sfac[309]);
bl[309]=nx[309]-(tBox.width/2+10*sfac[309]);
br[309]=nx[309]+(tBox.width/2+10*sfac[309]);
var nwidth = br[309]-bl[309]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[309] = bl[309] - delta; 
    br[309] = br[309] + delta; 
} 
bb[309] = bb[309]+20; 
yicon = bb[309]-25; 
xicon2 = nx[309]+-40; 
xicon3 = nx[309]+-10; 
xicon4 = nx[309]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Metabolism-and-Replication/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[309], bt[309], br[309]-bl[309], bb[309]-bt[309], 10*sfac[309]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[309]=paper.setFinish(); 
t[309].toFront(); 
exicon.toFront(); 

t[310]=paper.text(nx[310],ny[310]-10,'Numerical Weather Prediction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[310]});
t[310].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Predicting-Weather/#Numerical Weather Prediction", target: "_top",title:"Click to jump to concept"});
}); 
t[310].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[310].getBBox(); 
bt[310]=ny[310]-10-(tBox.height/2+10*sfac[310]);
bb[310]=ny[310]-10+(tBox.height/2+10*sfac[310]);
bl[310]=nx[310]-(tBox.width/2+10*sfac[310]);
br[310]=nx[310]+(tBox.width/2+10*sfac[310]);
var nwidth = br[310]-bl[310]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[310] = bl[310] - delta; 
    br[310] = br[310] + delta; 
} 
bb[310] = bb[310]+20; 
yicon = bb[310]-25; 
xicon2 = nx[310]+-40; 
xicon3 = nx[310]+-10; 
xicon4 = nx[310]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Predicting-Weather/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Predicting-Weather/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[310], bt[310], br[310]-bl[310], bb[310]-bt[310], 10*sfac[310]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[310]=paper.setFinish(); 
t[310].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[311]=paper.text(nx[311],ny[311]-10,'Measuring Distances\nto Stars').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[311]});
t[311].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Distance-Between-Stars/#Measuring Distances to Stars", target: "_top",title:"Click to jump to concept"});
}); 
t[311].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[311].getBBox(); 
bt[311]=ny[311]-10-(tBox.height/2+10*sfac[311]);
bb[311]=ny[311]-10+(tBox.height/2+10*sfac[311]);
bl[311]=nx[311]-(tBox.width/2+10*sfac[311]);
br[311]=nx[311]+(tBox.width/2+10*sfac[311]);
var nwidth = br[311]-bl[311]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[311] = bl[311] - delta; 
    br[311] = br[311] + delta; 
} 
bb[311] = bb[311]+20; 
yicon = bb[311]-25; 
xicon2 = nx[311]+-40; 
xicon3 = nx[311]+-10; 
xicon4 = nx[311]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distance-Between-Stars/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Distance-Between-Stars/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[311], bt[311], br[311]-bl[311], bb[311]-bt[311], 10*sfac[311]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[311]=paper.setFinish(); 
t[311].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[312]=paper.text(nx[312],ny[312]-10,'Volcanic Landforms').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[312]});
t[312].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Volcanic-Landforms/#Volcanic Landforms", target: "_top",title:"Click to jump to concept"});
}); 
t[312].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[312].getBBox(); 
bt[312]=ny[312]-10-(tBox.height/2+10*sfac[312]);
bb[312]=ny[312]-10+(tBox.height/2+10*sfac[312]);
bl[312]=nx[312]-(tBox.width/2+10*sfac[312]);
br[312]=nx[312]+(tBox.width/2+10*sfac[312]);
var nwidth = br[312]-bl[312]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[312] = bl[312] - delta; 
    br[312] = br[312] + delta; 
} 
bb[312] = bb[312]+20; 
yicon = bb[312]-25; 
xicon2 = nx[312]+-40; 
xicon3 = nx[312]+-10; 
xicon4 = nx[312]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Volcanic-Landforms/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Volcanic-Landforms/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[312], bt[312], br[312]-bl[312], bb[312]-bt[312], 10*sfac[312]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[312]=paper.setFinish(); 
t[312].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[313]=paper.text(nx[313],ny[313]-10,'Ozone Depletion').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[313]});
t[313].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ozone-Depletion/#Ozone Depletion", target: "_top",title:"Click to jump to concept"});
}); 
t[313].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[313].getBBox(); 
bt[313]=ny[313]-10-(tBox.height/2+10*sfac[313]);
bb[313]=ny[313]-10+(tBox.height/2+10*sfac[313]);
bl[313]=nx[313]-(tBox.width/2+10*sfac[313]);
br[313]=nx[313]+(tBox.width/2+10*sfac[313]);
var nwidth = br[313]-bl[313]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[313] = bl[313] - delta; 
    br[313] = br[313] + delta; 
} 
bb[313] = bb[313]+20; 
yicon = bb[313]-25; 
xicon2 = nx[313]+-40; 
xicon3 = nx[313]+-10; 
xicon4 = nx[313]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Ozone-Depletion/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Ozone-Depletion/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[313], bt[313], br[313]-bl[313], bb[313]-bt[313], 10*sfac[313]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[313]=paper.setFinish(); 
t[313].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[314]=paper.text(nx[314],ny[314],'Igneous Rocks').attr({fill:"#666666","font-size": 14*sfac[314]});
tBox=t[314].getBBox(); 
bt[314]=ny[314]-(tBox.height/2+10*sfac[314]);
bb[314]=ny[314]+(tBox.height/2+10*sfac[314]);
bl[314]=nx[314]-(tBox.width/2+10*sfac[314]);
br[314]=nx[314]+(tBox.width/2+10*sfac[314]);
paper.setStart(); 
rect=paper.rect(bl[314], bt[314], br[314]-bl[314], bb[314]-bt[314], 10*sfac[314]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[314]=paper.setFinish(); 

t[315]=paper.text(nx[315],ny[315]-10,'Atmospheric\nComposition').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[315]});
t[315].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Composition-of-the-Atmosphere/#Atmospheric Composition", target: "_top",title:"Click to jump to concept"});
}); 
t[315].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[315].getBBox(); 
bt[315]=ny[315]-10-(tBox.height/2+10*sfac[315]);
bb[315]=ny[315]-10+(tBox.height/2+10*sfac[315]);
bl[315]=nx[315]-(tBox.width/2+10*sfac[315]);
br[315]=nx[315]+(tBox.width/2+10*sfac[315]);
var nwidth = br[315]-bl[315]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[315] = bl[315] - delta; 
    br[315] = br[315] + delta; 
} 
bb[315] = bb[315]+20; 
yicon = bb[315]-25; 
xicon2 = nx[315]+-40; 
xicon3 = nx[315]+-10; 
xicon4 = nx[315]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Composition-of-the-Atmosphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Composition-of-the-Atmosphere/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[315], bt[315], br[315]-bl[315], bb[315]-bt[315], 10*sfac[315]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[315]=paper.setFinish(); 
t[315].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[316]=paper.text(nx[316],ny[316]-10,'Water Safety').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[316]});
t[316].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Safety-of-Water/#Water Safety", target: "_top",title:"Click to jump to concept"});
}); 
t[316].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[316].getBBox(); 
bt[316]=ny[316]-10-(tBox.height/2+10*sfac[316]);
bb[316]=ny[316]-10+(tBox.height/2+10*sfac[316]);
bl[316]=nx[316]-(tBox.width/2+10*sfac[316]);
br[316]=nx[316]+(tBox.width/2+10*sfac[316]);
var nwidth = br[316]-bl[316]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[316] = bl[316] - delta; 
    br[316] = br[316] + delta; 
} 
bb[316] = bb[316]+20; 
yicon = bb[316]-25; 
xicon2 = nx[316]+-40; 
xicon3 = nx[316]+-10; 
xicon4 = nx[316]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Safety-of-Water/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Safety-of-Water/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[316], bt[316], br[316]-bl[316], bb[316]-bt[316], 10*sfac[316]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[316]=paper.setFinish(); 
t[316].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[317]=paper.text(nx[317],ny[317],'Matter').attr({fill:"#666666","font-size": 14*sfac[317]});
tBox=t[317].getBBox(); 
bt[317]=ny[317]-(tBox.height/2+10*sfac[317]);
bb[317]=ny[317]+(tBox.height/2+10*sfac[317]);
bl[317]=nx[317]-(tBox.width/2+10*sfac[317]);
br[317]=nx[317]+(tBox.width/2+10*sfac[317]);
paper.setStart(); 
rect=paper.rect(bl[317], bt[317], br[317]-bl[317], bb[317]-bt[317], 10*sfac[317]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[317]=paper.setFinish(); 

t[318]=paper.text(nx[318],ny[318]-10,'Erosion by\nWaves').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[318]});
t[318].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Landforms-from-Wave-Erosion-and-Deposition/#Erosion by Waves", target: "_top",title:"Click to jump to concept"});
}); 
t[318].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[318].getBBox(); 
bt[318]=ny[318]-10-(tBox.height/2+10*sfac[318]);
bb[318]=ny[318]-10+(tBox.height/2+10*sfac[318]);
bl[318]=nx[318]-(tBox.width/2+10*sfac[318]);
br[318]=nx[318]+(tBox.width/2+10*sfac[318]);
var nwidth = br[318]-bl[318]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[318] = bl[318] - delta; 
    br[318] = br[318] + delta; 
} 
bb[318] = bb[318]+20; 
yicon = bb[318]-25; 
xicon2 = nx[318]+-40; 
xicon3 = nx[318]+-10; 
xicon4 = nx[318]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Landforms-from-Wave-Erosion-and-Deposition/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Landforms-from-Wave-Erosion-and-Deposition/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[318], bt[318], br[318]-bl[318], bb[318]-bt[318], 10*sfac[318]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[318]=paper.setFinish(); 
t[318].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[319]=paper.text(nx[319],ny[319],"Evidence of Earth's Past").attr({fill:"#666666","font-size": 14*sfac[319]});
tBox=t[319].getBBox(); 
bt[319]=ny[319]-(tBox.height/2+10*sfac[319]);
bb[319]=ny[319]+(tBox.height/2+10*sfac[319]);
bl[319]=nx[319]-(tBox.width/2+10*sfac[319]);
br[319]=nx[319]+(tBox.width/2+10*sfac[319]);
paper.setStart(); 
rect=paper.rect(bl[319], bt[319], br[319]-bl[319], bb[319]-bt[319], 10*sfac[319]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[319]=paper.setFinish(); 

t[320]=paper.text(nx[320],ny[320]-10,"Ocean Currents'\nModeration\nof Climate").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[320]});
t[320].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/How-Ocean-Currents-Moderate-Climate/#Ocean Currents' Moderation of Climate", target: "_top",title:"Click to jump to concept"});
}); 
t[320].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[320].getBBox(); 
bt[320]=ny[320]-10-(tBox.height/2+10*sfac[320]);
bb[320]=ny[320]-10+(tBox.height/2+10*sfac[320]);
bl[320]=nx[320]-(tBox.width/2+10*sfac[320]);
br[320]=nx[320]+(tBox.width/2+10*sfac[320]);
var nwidth = br[320]-bl[320]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[320] = bl[320] - delta; 
    br[320] = br[320] + delta; 
} 
bb[320] = bb[320]+20; 
yicon = bb[320]-25; 
xicon2 = nx[320]+-40; 
xicon3 = nx[320]+-10; 
xicon4 = nx[320]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/How-Ocean-Currents-Moderate-Climate/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/How-Ocean-Currents-Moderate-Climate/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[320], bt[320], br[320]-bl[320], bb[320]-bt[320], 10*sfac[320]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[320]=paper.setFinish(); 
t[320].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[321]=paper.text(nx[321],ny[321],'Soils').attr({fill:"#666666","font-size": 14*sfac[321]});
tBox=t[321].getBBox(); 
bt[321]=ny[321]-(tBox.height/2+10*sfac[321]);
bb[321]=ny[321]+(tBox.height/2+10*sfac[321]);
bl[321]=nx[321]-(tBox.width/2+10*sfac[321]);
br[321]=nx[321]+(tBox.width/2+10*sfac[321]);
paper.setStart(); 
rect=paper.rect(bl[321], bt[321], br[321]-bl[321], bb[321]-bt[321], 10*sfac[321]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[321]=paper.setFinish(); 

t[322]=paper.text(nx[322],ny[322],'Life on Earth').attr({fill:"#666666","font-size": 14*sfac[322]});
tBox=t[322].getBBox(); 
bt[322]=ny[322]-(tBox.height/2+10*sfac[322]);
bb[322]=ny[322]+(tBox.height/2+10*sfac[322]);
bl[322]=nx[322]-(tBox.width/2+10*sfac[322]);
br[322]=nx[322]+(tBox.width/2+10*sfac[322]);
paper.setStart(); 
rect=paper.rect(bl[322], bt[322], br[322]-bl[322], bb[322]-bt[322], 10*sfac[322]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[322]=paper.setFinish(); 

t[323]=paper.text(nx[323],ny[323]-10,'The Geologic Time Scale').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[323]});
t[323].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Geologic-Time-Scale/#The Geologic Time Scale", target: "_top",title:"Click to jump to concept"});
}); 
t[323].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[323].getBBox(); 
bt[323]=ny[323]-10-(tBox.height/2+10*sfac[323]);
bb[323]=ny[323]-10+(tBox.height/2+10*sfac[323]);
bl[323]=nx[323]-(tBox.width/2+10*sfac[323]);
br[323]=nx[323]+(tBox.width/2+10*sfac[323]);
var nwidth = br[323]-bl[323]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[323] = bl[323] - delta; 
    br[323] = br[323] + delta; 
} 
bb[323] = bb[323]+20; 
yicon = bb[323]-25; 
xicon2 = nx[323]+-40; 
xicon3 = nx[323]+-10; 
xicon4 = nx[323]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Geologic-Time-Scale/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Geologic-Time-Scale/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[323], bt[323], br[323]-bl[323], bb[323]-bt[323], 10*sfac[323]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[323]=paper.setFinish(); 
t[323].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[324]=paper.text(nx[324],ny[324]-10,'Constellations').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[324]});
t[324].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Star-Constellations/#Constellations", target: "_top",title:"Click to jump to concept"});
}); 
t[324].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[324].getBBox(); 
bt[324]=ny[324]-10-(tBox.height/2+10*sfac[324]);
bb[324]=ny[324]-10+(tBox.height/2+10*sfac[324]);
bl[324]=nx[324]-(tBox.width/2+10*sfac[324]);
br[324]=nx[324]+(tBox.width/2+10*sfac[324]);
var nwidth = br[324]-bl[324]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[324] = bl[324] - delta; 
    br[324] = br[324] + delta; 
} 
bb[324] = bb[324]+20; 
yicon = bb[324]-25; 
xicon2 = nx[324]+-40; 
xicon3 = nx[324]+-10; 
xicon4 = nx[324]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Star-Constellations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Star-Constellations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Star-Constellations/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[324], bt[324], br[324]-bl[324], bb[324]-bt[324], 10*sfac[324]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[324]=paper.setFinish(); 
t[324].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[325]=paper.text(nx[325],ny[325],'Seafloor Spreading').attr({fill:"#666666","font-size": 14*sfac[325]});
tBox=t[325].getBBox(); 
bt[325]=ny[325]-(tBox.height/2+10*sfac[325]);
bb[325]=ny[325]+(tBox.height/2+10*sfac[325]);
bl[325]=nx[325]-(tBox.width/2+10*sfac[325]);
br[325]=nx[325]+(tBox.width/2+10*sfac[325]);
paper.setStart(); 
rect=paper.rect(bl[325], bt[325], br[325]-bl[325], bb[325]-bt[325], 10*sfac[325]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[325]=paper.setFinish(); 

t[326]=paper.text(nx[326],ny[326],'Geologic Structures').attr({fill:"#666666","font-size": 14*sfac[326]});
tBox=t[326].getBBox(); 
bt[326]=ny[326]-(tBox.height/2+10*sfac[326]);
bb[326]=ny[326]+(tBox.height/2+10*sfac[326]);
bl[326]=nx[326]-(tBox.width/2+10*sfac[326]);
br[326]=nx[326]+(tBox.width/2+10*sfac[326]);
paper.setStart(); 
rect=paper.rect(bl[326], bt[326], br[326]-bl[326], bb[326]-bt[326], 10*sfac[326]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[326]=paper.setFinish(); 

t[327]=paper.text(nx[327],ny[327]-10,'Numerical Weather\nPrediction').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[327]});
t[327].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Predicting-Weather/#Numerical Weather Prediction", target: "_top",title:"Click to jump to concept"});
}); 
t[327].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[327].getBBox(); 
bt[327]=ny[327]-10-(tBox.height/2+10*sfac[327]);
bb[327]=ny[327]-10+(tBox.height/2+10*sfac[327]);
bl[327]=nx[327]-(tBox.width/2+10*sfac[327]);
br[327]=nx[327]+(tBox.width/2+10*sfac[327]);
var nwidth = br[327]-bl[327]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[327] = bl[327] - delta; 
    br[327] = br[327] + delta; 
} 
bb[327] = bb[327]+20; 
yicon = bb[327]-25; 
xicon2 = nx[327]+-40; 
xicon3 = nx[327]+-10; 
xicon4 = nx[327]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Predicting-Weather/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Predicting-Weather/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[327], bt[327], br[327]-bl[327], bb[327]-bt[327], 10*sfac[327]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[327]=paper.setFinish(); 
t[327].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[328]=paper.text(nx[328],ny[328]-10,'Clouds').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[328]});
t[328].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Clouds/#Clouds", target: "_top",title:"Click to jump to concept"});
}); 
t[328].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[328].getBBox(); 
bt[328]=ny[328]-10-(tBox.height/2+10*sfac[328]);
bb[328]=ny[328]-10+(tBox.height/2+10*sfac[328]);
bl[328]=nx[328]-(tBox.width/2+10*sfac[328]);
br[328]=nx[328]+(tBox.width/2+10*sfac[328]);
var nwidth = br[328]-bl[328]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[328] = bl[328] - delta; 
    br[328] = br[328] + delta; 
} 
bb[328] = bb[328]+20; 
yicon = bb[328]-25; 
xicon2 = nx[328]+-40; 
xicon3 = nx[328]+-10; 
xicon4 = nx[328]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Clouds/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Clouds/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Clouds/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[328], bt[328], br[328]-bl[328], bb[328]-bt[328], 10*sfac[328]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[328]=paper.setFinish(); 
t[328].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[329]=paper.text(nx[329],ny[329]-10,'The Milky Way').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[329]});
t[329].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Milky-Way/#The Milky Way", target: "_top",title:"Click to jump to concept"});
}); 
t[329].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[329].getBBox(); 
bt[329]=ny[329]-10-(tBox.height/2+10*sfac[329]);
bb[329]=ny[329]-10+(tBox.height/2+10*sfac[329]);
bl[329]=nx[329]-(tBox.width/2+10*sfac[329]);
br[329]=nx[329]+(tBox.width/2+10*sfac[329]);
var nwidth = br[329]-bl[329]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[329] = bl[329] - delta; 
    br[329] = br[329] + delta; 
} 
bb[329] = bb[329]+20; 
yicon = bb[329]-25; 
xicon2 = nx[329]+-40; 
xicon3 = nx[329]+-10; 
xicon4 = nx[329]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Milky-Way/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Milky-Way/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[329], bt[329], br[329]-bl[329], bb[329]-bt[329], 10*sfac[329]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[329]=paper.setFinish(); 
t[329].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[330]=paper.text(nx[330],ny[330],'Storms: Thunderstorms, Tornadoes,\nCyclones, Blizzards').attr({fill:"#666666","font-size": 14*sfac[330]});
tBox=t[330].getBBox(); 
bt[330]=ny[330]-(tBox.height/2+10*sfac[330]);
bb[330]=ny[330]+(tBox.height/2+10*sfac[330]);
bl[330]=nx[330]-(tBox.width/2+10*sfac[330]);
br[330]=nx[330]+(tBox.width/2+10*sfac[330]);
paper.setStart(); 
rect=paper.rect(bl[330], bt[330], br[330]-bl[330], bb[330]-bt[330], 10*sfac[330]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[330]=paper.setFinish(); 

t[331]=paper.text(nx[331],ny[331],'Telescopes').attr({fill:"#666666","font-size": 14*sfac[331]});
tBox=t[331].getBBox(); 
bt[331]=ny[331]-(tBox.height/2+10*sfac[331]);
bb[331]=ny[331]+(tBox.height/2+10*sfac[331]);
bl[331]=nx[331]-(tBox.width/2+10*sfac[331]);
br[331]=nx[331]+(tBox.width/2+10*sfac[331]);
paper.setStart(); 
rect=paper.rect(bl[331], bt[331], br[331]-bl[331], bb[331]-bt[331], 10*sfac[331]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[331]=paper.setFinish(); 

t[332]=paper.text(nx[332],ny[332]-10,"Earth's\nRevolution").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[332]});
t[332].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Revolutions-of-Earth/#Earth's Revolution", target: "_top",title:"Click to jump to concept"});
}); 
t[332].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[332].getBBox(); 
bt[332]=ny[332]-10-(tBox.height/2+10*sfac[332]);
bb[332]=ny[332]-10+(tBox.height/2+10*sfac[332]);
bl[332]=nx[332]-(tBox.width/2+10*sfac[332]);
br[332]=nx[332]+(tBox.width/2+10*sfac[332]);
var nwidth = br[332]-bl[332]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[332] = bl[332] - delta; 
    br[332] = br[332] + delta; 
} 
bb[332] = bb[332]+20; 
yicon = bb[332]-25; 
xicon2 = nx[332]+-40; 
xicon3 = nx[332]+-10; 
xicon4 = nx[332]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Revolutions-of-Earth/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[332], bt[332], br[332]-bl[332], bb[332]-bt[332], 10*sfac[332]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[332]=paper.setFinish(); 
t[332].toFront(); 
exicon.toFront(); 

t[333]=paper.text(nx[333],ny[333]-10,'Use of Groundwater').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[333]});
t[333].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Groundwater-Depletion/#Use of Groundwater", target: "_top",title:"Click to jump to concept"});
}); 
t[333].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[333].getBBox(); 
bt[333]=ny[333]-10-(tBox.height/2+10*sfac[333]);
bb[333]=ny[333]-10+(tBox.height/2+10*sfac[333]);
bl[333]=nx[333]-(tBox.width/2+10*sfac[333]);
br[333]=nx[333]+(tBox.width/2+10*sfac[333]);
var nwidth = br[333]-bl[333]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[333] = bl[333] - delta; 
    br[333] = br[333] + delta; 
} 
bb[333] = bb[333]+20; 
yicon = bb[333]-25; 
xicon2 = nx[333]+-40; 
xicon3 = nx[333]+-10; 
xicon4 = nx[333]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Groundwater-Depletion/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Groundwater-Depletion/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[333], bt[333], br[333]-bl[333], bb[333]-bt[333], 10*sfac[333]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[333]=paper.setFinish(); 
t[333].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[334]=paper.text(nx[334],ny[334],'Energy').attr({fill:"#666666","font-size": 14*sfac[334]});
tBox=t[334].getBBox(); 
bt[334]=ny[334]-(tBox.height/2+10*sfac[334]);
bb[334]=ny[334]+(tBox.height/2+10*sfac[334]);
bl[334]=nx[334]-(tBox.width/2+10*sfac[334]);
br[334]=nx[334]+(tBox.width/2+10*sfac[334]);
paper.setStart(); 
rect=paper.rect(bl[334], bt[334], br[334]-bl[334], bb[334]-bt[334], 10*sfac[334]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[334]=paper.setFinish(); 

t[335]=paper.text(nx[335],ny[335],'Tools for\nSpace Science').attr({fill:"#666666","font-size": 14*sfac[335]});
tBox=t[335].getBBox(); 
bt[335]=ny[335]-(tBox.height/2+10*sfac[335]);
bb[335]=ny[335]+(tBox.height/2+10*sfac[335]);
bl[335]=nx[335]-(tBox.width/2+10*sfac[335]);
br[335]=nx[335]+(tBox.width/2+10*sfac[335]);
paper.setStart(); 
rect=paper.rect(bl[335], bt[335], br[335]-bl[335], bb[335]-bt[335], 10*sfac[335]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[335]=paper.setFinish(); 

t[336]=paper.text(nx[336],ny[336]-10,'Developing Hypotheses').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[336]});
t[336].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Development-of-Hypotheses/#Developing Hypotheses", target: "_top",title:"Click to jump to concept"});
}); 
t[336].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[336].getBBox(); 
bt[336]=ny[336]-10-(tBox.height/2+10*sfac[336]);
bb[336]=ny[336]-10+(tBox.height/2+10*sfac[336]);
bl[336]=nx[336]-(tBox.width/2+10*sfac[336]);
br[336]=nx[336]+(tBox.width/2+10*sfac[336]);
var nwidth = br[336]-bl[336]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[336] = bl[336] - delta; 
    br[336] = br[336] + delta; 
} 
bb[336] = bb[336]+20; 
yicon = bb[336]-25; 
xicon2 = nx[336]+-40; 
xicon3 = nx[336]+-10; 
xicon4 = nx[336]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Development-of-Hypotheses/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Development-of-Hypotheses/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[336], bt[336], br[336]-bl[336], bb[336]-bt[336], 10*sfac[336]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[336]=paper.setFinish(); 
t[336].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[337]=paper.text(nx[337],ny[337]-10,'Rock\nMetamorphism').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[337]});
t[337].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Metamorphism/#Rock Metamorphism", target: "_top",title:"Click to jump to concept"});
}); 
t[337].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[337].getBBox(); 
bt[337]=ny[337]-10-(tBox.height/2+10*sfac[337]);
bb[337]=ny[337]-10+(tBox.height/2+10*sfac[337]);
bl[337]=nx[337]-(tBox.width/2+10*sfac[337]);
br[337]=nx[337]+(tBox.width/2+10*sfac[337]);
var nwidth = br[337]-bl[337]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[337] = bl[337] - delta; 
    br[337] = br[337] + delta; 
} 
bb[337] = bb[337]+20; 
yicon = bb[337]-25; 
xicon2 = nx[337]+-40; 
xicon3 = nx[337]+-10; 
xicon4 = nx[337]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Metamorphism/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[337], bt[337], br[337]-bl[337], bb[337]-bt[337], 10*sfac[337]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[337]=paper.setFinish(); 
t[337].toFront(); 
exicon.toFront(); 

t[338]=paper.text(nx[338],ny[338],'Hazardous Waste').attr({fill:"#666666","font-size": 14*sfac[338]});
tBox=t[338].getBBox(); 
bt[338]=ny[338]-(tBox.height/2+10*sfac[338]);
bb[338]=ny[338]+(tBox.height/2+10*sfac[338]);
bl[338]=nx[338]-(tBox.width/2+10*sfac[338]);
br[338]=nx[338]+(tBox.width/2+10*sfac[338]);
paper.setStart(); 
rect=paper.rect(bl[338], bt[338], br[338]-bl[338], bb[338]-bt[338], 10*sfac[338]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[338]=paper.setFinish(); 

t[339]=paper.text(nx[339],ny[339]-10,'Sources of\nEnergy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[339]});
t[339].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Obtaining-Energy-Resources/#Sources of Energy", target: "_top",title:"Click to jump to concept"});
}); 
t[339].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[339].getBBox(); 
bt[339]=ny[339]-10-(tBox.height/2+10*sfac[339]);
bb[339]=ny[339]-10+(tBox.height/2+10*sfac[339]);
bl[339]=nx[339]-(tBox.width/2+10*sfac[339]);
br[339]=nx[339]+(tBox.width/2+10*sfac[339]);
var nwidth = br[339]-bl[339]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[339] = bl[339] - delta; 
    br[339] = br[339] + delta; 
} 
bb[339] = bb[339]+20; 
yicon = bb[339]-25; 
xicon2 = nx[339]+-40; 
xicon3 = nx[339]+-10; 
xicon4 = nx[339]+20; 
paper.setStart(); 
rect=paper.rect(bl[339], bt[339], br[339]-bl[339], bb[339]-bt[339], 10*sfac[339]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[339]=paper.setFinish(); 
t[339].toFront(); 

t[340]=paper.text(nx[340],ny[340],'Intertidal Life').attr({fill:"#666666","font-size": 14*sfac[340]});
tBox=t[340].getBBox(); 
bt[340]=ny[340]-(tBox.height/2+10*sfac[340]);
bb[340]=ny[340]+(tBox.height/2+10*sfac[340]);
bl[340]=nx[340]-(tBox.width/2+10*sfac[340]);
br[340]=nx[340]+(tBox.width/2+10*sfac[340]);
paper.setStart(); 
rect=paper.rect(bl[340], bt[340], br[340]-bl[340], bb[340]-bt[340], 10*sfac[340]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[340]=paper.setFinish(); 

t[341]=paper.text(nx[341],ny[341]-10,'Stratosphere').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[341]});
t[341].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Stratosphere/#Stratosphere", target: "_top",title:"Click to jump to concept"});
}); 
t[341].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[341].getBBox(); 
bt[341]=ny[341]-10-(tBox.height/2+10*sfac[341]);
bb[341]=ny[341]-10+(tBox.height/2+10*sfac[341]);
bl[341]=nx[341]-(tBox.width/2+10*sfac[341]);
br[341]=nx[341]+(tBox.width/2+10*sfac[341]);
var nwidth = br[341]-bl[341]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[341] = bl[341] - delta; 
    br[341] = br[341] + delta; 
} 
bb[341] = bb[341]+20; 
yicon = bb[341]-25; 
xicon2 = nx[341]+-40; 
xicon3 = nx[341]+-10; 
xicon4 = nx[341]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Stratosphere/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Stratosphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[341], bt[341], br[341]-bl[341], bb[341]-bt[341], 10*sfac[341]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[341]=paper.setFinish(); 
t[341].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[342]=paper.text(nx[342],ny[342]-10,'What is a Volcano?').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[342]});
t[342].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Introduction-to-Volcanoes/#What is a Volcano?", target: "_top",title:"Click to jump to concept"});
}); 
t[342].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[342].getBBox(); 
bt[342]=ny[342]-10-(tBox.height/2+10*sfac[342]);
bb[342]=ny[342]-10+(tBox.height/2+10*sfac[342]);
bl[342]=nx[342]-(tBox.width/2+10*sfac[342]);
br[342]=nx[342]+(tBox.width/2+10*sfac[342]);
var nwidth = br[342]-bl[342]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[342] = bl[342] - delta; 
    br[342] = br[342] + delta; 
} 
bb[342] = bb[342]+20; 
yicon = bb[342]-25; 
xicon2 = nx[342]+-40; 
xicon3 = nx[342]+-10; 
xicon4 = nx[342]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-Volcanoes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Introduction-to-Volcanoes/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[342], bt[342], br[342]-bl[342], bb[342]-bt[342], 10*sfac[342]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[342]=paper.setFinish(); 
t[342].toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[343]=paper.text(nx[343],ny[343]-10,'Evidence from Seafloor\nBathymetry').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[343]});
t[343].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Bathymetric-Evidence-for-Seafloor-Spreading/#Evidence from Seafloor Bathymetry", target: "_top",title:"Click to jump to concept"});
}); 
t[343].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[343].getBBox(); 
bt[343]=ny[343]-10-(tBox.height/2+10*sfac[343]);
bb[343]=ny[343]-10+(tBox.height/2+10*sfac[343]);
bl[343]=nx[343]-(tBox.width/2+10*sfac[343]);
br[343]=nx[343]+(tBox.width/2+10*sfac[343]);
var nwidth = br[343]-bl[343]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[343] = bl[343] - delta; 
    br[343] = br[343] + delta; 
} 
bb[343] = bb[343]+20; 
yicon = bb[343]-25; 
xicon2 = nx[343]+-40; 
xicon3 = nx[343]+-10; 
xicon4 = nx[343]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Bathymetric-Evidence-for-Seafloor-Spreading/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Bathymetric-Evidence-for-Seafloor-Spreading/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[343], bt[343], br[343]-bl[343], bb[343]-bt[343], 10*sfac[343]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[343]=paper.setFinish(); 
t[343].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[344]=paper.text(nx[344],ny[344],'Pond and Lake\nEcosystems').attr({fill:"#666666","font-size": 14*sfac[344]});
tBox=t[344].getBBox(); 
bt[344]=ny[344]-(tBox.height/2+10*sfac[344]);
bb[344]=ny[344]+(tBox.height/2+10*sfac[344]);
bl[344]=nx[344]-(tBox.width/2+10*sfac[344]);
br[344]=nx[344]+(tBox.width/2+10*sfac[344]);
paper.setStart(); 
rect=paper.rect(bl[344], bt[344], br[344]-bl[344], bb[344]-bt[344], 10*sfac[344]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[344]=paper.setFinish(); 

t[345]=paper.text(nx[345],ny[345],'Sedimentary Rocks').attr({fill:"#666666","font-size": 14*sfac[345]});
tBox=t[345].getBBox(); 
bt[345]=ny[345]-(tBox.height/2+10*sfac[345]);
bb[345]=ny[345]+(tBox.height/2+10*sfac[345]);
bl[345]=nx[345]-(tBox.width/2+10*sfac[345]);
br[345]=nx[345]+(tBox.width/2+10*sfac[345]);
paper.setStart(); 
rect=paper.rect(bl[345], bt[345], br[345]-bl[345], bb[345]-bt[345], 10*sfac[345]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[345]=paper.setFinish(); 

t[346]=paper.text(nx[346],ny[346]-10,"Types of Stress\nin Earth's Crust").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[346]});
t[346].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Geological-Stresses/#Types of Stress in Earth's Crust", target: "_top",title:"Click to jump to concept"});
}); 
t[346].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[346].getBBox(); 
bt[346]=ny[346]-10-(tBox.height/2+10*sfac[346]);
bb[346]=ny[346]-10+(tBox.height/2+10*sfac[346]);
bl[346]=nx[346]-(tBox.width/2+10*sfac[346]);
br[346]=nx[346]+(tBox.width/2+10*sfac[346]);
var nwidth = br[346]-bl[346]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[346] = bl[346] - delta; 
    br[346] = br[346] + delta; 
} 
bb[346] = bb[346]+20; 
yicon = bb[346]-25; 
xicon2 = nx[346]+-40; 
xicon3 = nx[346]+-10; 
xicon4 = nx[346]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Geological-Stresses/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[346], bt[346], br[346]-bl[346], bb[346]-bt[346], 10*sfac[346]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[346]=paper.setFinish(); 
t[346].toFront(); 
exicon.toFront(); 

t[347]=paper.text(nx[347],ny[347]-10,'Erosion by\nStreams').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[347]});
t[347].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Landforms-from-Stream-Erosion-and-Deposition/#Erosion by Streams", target: "_top",title:"Click to jump to concept"});
}); 
t[347].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[347].getBBox(); 
bt[347]=ny[347]-10-(tBox.height/2+10*sfac[347]);
bb[347]=ny[347]-10+(tBox.height/2+10*sfac[347]);
bl[347]=nx[347]-(tBox.width/2+10*sfac[347]);
br[347]=nx[347]+(tBox.width/2+10*sfac[347]);
var nwidth = br[347]-bl[347]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[347] = bl[347] - delta; 
    br[347] = br[347] + delta; 
} 
bb[347] = bb[347]+20; 
yicon = bb[347]-25; 
xicon2 = nx[347]+-40; 
xicon3 = nx[347]+-10; 
xicon4 = nx[347]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Landforms-from-Stream-Erosion-and-Deposition/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[347], bt[347], br[347]-bl[347], bb[347]-bt[347], 10*sfac[347]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[347]=paper.setFinish(); 
t[347].toFront(); 
vidicon.toFront(); 

t[348]=paper.text(nx[348],ny[348]-10,'Types of Fossilization').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[348]});
t[348].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Types-of-Fossilization/#Types of Fossilization", target: "_top",title:"Click to jump to concept"});
}); 
t[348].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[348].getBBox(); 
bt[348]=ny[348]-10-(tBox.height/2+10*sfac[348]);
bb[348]=ny[348]-10+(tBox.height/2+10*sfac[348]);
bl[348]=nx[348]-(tBox.width/2+10*sfac[348]);
br[348]=nx[348]+(tBox.width/2+10*sfac[348]);
var nwidth = br[348]-bl[348]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[348] = bl[348] - delta; 
    br[348] = br[348] + delta; 
} 
bb[348] = bb[348]+20; 
yicon = bb[348]-25; 
xicon2 = nx[348]+-40; 
xicon3 = nx[348]+-10; 
xicon4 = nx[348]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Types-of-Fossilization/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[348], bt[348], br[348]-bl[348], bb[348]-bt[348], 10*sfac[348]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[348]=paper.setFinish(); 
t[348].toFront(); 
vidicon.toFront(); 

t[349]=paper.text(nx[349],ny[349]-10,'Dark Matter and Dark Energy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[349]});
t[349].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Dark-Matter/#Dark Matter and Dark Energy", target: "_top",title:"Click to jump to concept"});
}); 
t[349].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[349].getBBox(); 
bt[349]=ny[349]-10-(tBox.height/2+10*sfac[349]);
bb[349]=ny[349]-10+(tBox.height/2+10*sfac[349]);
bl[349]=nx[349]-(tBox.width/2+10*sfac[349]);
br[349]=nx[349]+(tBox.width/2+10*sfac[349]);
var nwidth = br[349]-bl[349]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[349] = bl[349] - delta; 
    br[349] = br[349] + delta; 
} 
bb[349] = bb[349]+20; 
yicon = bb[349]-25; 
xicon2 = nx[349]+-40; 
xicon3 = nx[349]+-10; 
xicon4 = nx[349]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Dark-Matter/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Dark-Matter/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Dark-Matter/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[349], bt[349], br[349]-bl[349], bb[349]-bt[349], 10*sfac[349]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[349]=paper.setFinish(); 
t[349].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[350]=paper.text(nx[350],ny[350]-10,'Chemical Weathering').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[350]});
t[350].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Chemical-Weathering/#Chemical Weathering", target: "_top",title:"Click to jump to concept"});
}); 
t[350].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[350].getBBox(); 
bt[350]=ny[350]-10-(tBox.height/2+10*sfac[350]);
bb[350]=ny[350]-10+(tBox.height/2+10*sfac[350]);
bl[350]=nx[350]-(tBox.width/2+10*sfac[350]);
br[350]=nx[350]+(tBox.width/2+10*sfac[350]);
var nwidth = br[350]-bl[350]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[350] = bl[350] - delta; 
    br[350] = br[350] + delta; 
} 
bb[350] = bb[350]+20; 
yicon = bb[350]-25; 
xicon2 = nx[350]+-40; 
xicon3 = nx[350]+-10; 
xicon4 = nx[350]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Chemical-Weathering/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Chemical-Weathering/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[350], bt[350], br[350]-bl[350], bb[350]-bt[350], 10*sfac[350]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[350]=paper.setFinish(); 
t[350].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[351]=paper.text(nx[351],ny[351]-10,'The\nPlanets').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[351]});
t[351].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Planets-of-the-Solar-System/#The Planets", target: "_top",title:"Click to jump to concept"});
}); 
t[351].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[351].getBBox(); 
bt[351]=ny[351]-10-(tBox.height/2+10*sfac[351]);
bb[351]=ny[351]-10+(tBox.height/2+10*sfac[351]);
bl[351]=nx[351]-(tBox.width/2+10*sfac[351]);
br[351]=nx[351]+(tBox.width/2+10*sfac[351]);
var nwidth = br[351]-bl[351]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[351] = bl[351] - delta; 
    br[351] = br[351] + delta; 
} 
bb[351] = bb[351]+20; 
yicon = bb[351]-25; 
xicon2 = nx[351]+-40; 
xicon3 = nx[351]+-10; 
xicon4 = nx[351]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Planets-of-the-Solar-System/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Planets-of-the-Solar-System/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[351], bt[351], br[351]-bl[351], bb[351]-bt[351], 10*sfac[351]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[351]=paper.setFinish(); 
t[351].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[352]=paper.text(nx[352],ny[352],'Earthquakes').attr({fill:"#666666","font-size": 14*sfac[352]});
tBox=t[352].getBBox(); 
bt[352]=ny[352]-(tBox.height/2+10*sfac[352]);
bb[352]=ny[352]+(tBox.height/2+10*sfac[352]);
bl[352]=nx[352]-(tBox.width/2+10*sfac[352]);
br[352]=nx[352]+(tBox.width/2+10*sfac[352]);
paper.setStart(); 
rect=paper.rect(bl[352], bt[352], br[352]-bl[352], bb[352]-bt[352], 10*sfac[352]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[352]=paper.setFinish(); 

t[353]=paper.text(nx[353],ny[353]-10,'Reducing Air Pollution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[353]});
t[353].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Reducing-Air-Pollution/#Reducing Air Pollution", target: "_top",title:"Click to jump to concept"});
}); 
t[353].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[353].getBBox(); 
bt[353]=ny[353]-10-(tBox.height/2+10*sfac[353]);
bb[353]=ny[353]-10+(tBox.height/2+10*sfac[353]);
bl[353]=nx[353]-(tBox.width/2+10*sfac[353]);
br[353]=nx[353]+(tBox.width/2+10*sfac[353]);
var nwidth = br[353]-bl[353]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[353] = bl[353] - delta; 
    br[353] = br[353] + delta; 
} 
bb[353] = bb[353]+20; 
yicon = bb[353]-25; 
xicon2 = nx[353]+-40; 
xicon3 = nx[353]+-10; 
xicon4 = nx[353]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Reducing-Air-Pollution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[353], bt[353], br[353]-bl[353], bb[353]-bt[353], 10*sfac[353]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[353]=paper.setFinish(); 
t[353].toFront(); 
exicon.toFront(); 

t[354]=paper.text(nx[354],ny[354],'Formation of Earth').attr({fill:"#666666","font-size": 14*sfac[354]});
tBox=t[354].getBBox(); 
bt[354]=ny[354]-(tBox.height/2+10*sfac[354]);
bb[354]=ny[354]+(tBox.height/2+10*sfac[354]);
bl[354]=nx[354]-(tBox.width/2+10*sfac[354]);
br[354]=nx[354]+(tBox.width/2+10*sfac[354]);
paper.setStart(); 
rect=paper.rect(bl[354], bt[354], br[354]-bl[354], bb[354]-bt[354], 10*sfac[354]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[354]=paper.setFinish(); 

t[355]=paper.text(nx[355],ny[355],'Ocean Resources').attr({fill:"#666666","font-size": 14*sfac[355]});
tBox=t[355].getBBox(); 
bt[355]=ny[355]-(tBox.height/2+10*sfac[355]);
bb[355]=ny[355]+(tBox.height/2+10*sfac[355]);
bl[355]=nx[355]-(tBox.width/2+10*sfac[355]);
br[355]=nx[355]+(tBox.width/2+10*sfac[355]);
paper.setStart(); 
rect=paper.rect(bl[355], bt[355], br[355]-bl[355], bb[355]-bt[355], 10*sfac[355]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[355]=paper.setFinish(); 

t[356]=paper.text(nx[356],ny[356]-10,'Damage from Earthquakes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[356]});
t[356].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Earthquake-Damage/#Damage from Earthquakes", target: "_top",title:"Click to jump to concept"});
}); 
t[356].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[356].getBBox(); 
bt[356]=ny[356]-10-(tBox.height/2+10*sfac[356]);
bb[356]=ny[356]-10+(tBox.height/2+10*sfac[356]);
bl[356]=nx[356]-(tBox.width/2+10*sfac[356]);
br[356]=nx[356]+(tBox.width/2+10*sfac[356]);
var nwidth = br[356]-bl[356]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[356] = bl[356] - delta; 
    br[356] = br[356] + delta; 
} 
bb[356] = bb[356]+20; 
yicon = bb[356]-25; 
xicon2 = nx[356]+-40; 
xicon3 = nx[356]+-10; 
xicon4 = nx[356]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Earthquake-Damage/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[356], bt[356], br[356]-bl[356], bb[356]-bt[356], 10*sfac[356]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[356]=paper.setFinish(); 
t[356].toFront(); 
exicon.toFront(); 

t[357]=paper.text(nx[357],ny[357]-10,'Streams').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[357]});
t[357].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Streams-and-Rivers/#Streams", target: "_top",title:"Click to jump to concept"});
}); 
t[357].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[357].getBBox(); 
bt[357]=ny[357]-10-(tBox.height/2+10*sfac[357]);
bb[357]=ny[357]-10+(tBox.height/2+10*sfac[357]);
bl[357]=nx[357]-(tBox.width/2+10*sfac[357]);
br[357]=nx[357]+(tBox.width/2+10*sfac[357]);
var nwidth = br[357]-bl[357]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[357] = bl[357] - delta; 
    br[357] = br[357] + delta; 
} 
bb[357] = bb[357]+20; 
yicon = bb[357]-25; 
xicon2 = nx[357]+-40; 
xicon3 = nx[357]+-10; 
xicon4 = nx[357]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Streams-and-Rivers/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Streams-and-Rivers/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[357], bt[357], br[357]-bl[357], bb[357]-bt[357], 10*sfac[357]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[357]=paper.setFinish(); 
t[357].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[358]=paper.text(nx[358],ny[358],'The Hydrologic Cycle').attr({fill:"#666666","font-size": 14*sfac[358]});
tBox=t[358].getBBox(); 
bt[358]=ny[358]-(tBox.height/2+10*sfac[358]);
bb[358]=ny[358]+(tBox.height/2+10*sfac[358]);
bl[358]=nx[358]-(tBox.width/2+10*sfac[358]);
br[358]=nx[358]+(tBox.width/2+10*sfac[358]);
paper.setStart(); 
rect=paper.rect(bl[358], bt[358], br[358]-bl[358], bb[358]-bt[358], 10*sfac[358]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[358]=paper.setFinish(); 

t[359]=paper.text(nx[359],ny[359]-10,'Hot Springs and Geysers').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[359]});
t[359].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Hot-Springs-and-Geysers/#Hot Springs and Geysers", target: "_top",title:"Click to jump to concept"});
}); 
t[359].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[359].getBBox(); 
bt[359]=ny[359]-10-(tBox.height/2+10*sfac[359]);
bb[359]=ny[359]-10+(tBox.height/2+10*sfac[359]);
bl[359]=nx[359]-(tBox.width/2+10*sfac[359]);
br[359]=nx[359]+(tBox.width/2+10*sfac[359]);
var nwidth = br[359]-bl[359]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[359] = bl[359] - delta; 
    br[359] = br[359] + delta; 
} 
bb[359] = bb[359]+20; 
yicon = bb[359]-25; 
xicon2 = nx[359]+-40; 
xicon3 = nx[359]+-10; 
xicon4 = nx[359]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Hot-Springs-and-Geysers/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[359], bt[359], br[359]-bl[359], bb[359]-bt[359], 10*sfac[359]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[359]=paper.setFinish(); 
t[359].toFront(); 
exicon.toFront(); 

t[360]=paper.text(nx[360],ny[360]-10,'Collecting Weather Data').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[360]});
t[360].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Collecting-Weather-Data/#Collecting Weather Data", target: "_top",title:"Click to jump to concept"});
}); 
t[360].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[360].getBBox(); 
bt[360]=ny[360]-10-(tBox.height/2+10*sfac[360]);
bb[360]=ny[360]-10+(tBox.height/2+10*sfac[360]);
bl[360]=nx[360]-(tBox.width/2+10*sfac[360]);
br[360]=nx[360]+(tBox.width/2+10*sfac[360]);
var nwidth = br[360]-bl[360]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[360] = bl[360] - delta; 
    br[360] = br[360] + delta; 
} 
bb[360] = bb[360]+20; 
yicon = bb[360]-25; 
xicon2 = nx[360]+-40; 
xicon3 = nx[360]+-10; 
xicon4 = nx[360]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Collecting-Weather-Data/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Collecting-Weather-Data/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[360], bt[360], br[360]-bl[360], bb[360]-bt[360], 10*sfac[360]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[360]=paper.setFinish(); 
t[360].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[361]=paper.text(nx[361],ny[361],'Pollution of the Land').attr({fill:"#666666","font-size": 14*sfac[361]});
tBox=t[361].getBBox(); 
bt[361]=ny[361]-(tBox.height/2+10*sfac[361]);
bb[361]=ny[361]+(tBox.height/2+10*sfac[361]);
bl[361]=nx[361]-(tBox.width/2+10*sfac[361]);
br[361]=nx[361]+(tBox.width/2+10*sfac[361]);
paper.setStart(); 
rect=paper.rect(bl[361], bt[361], br[361]-bl[361], bb[361]-bt[361], 10*sfac[361]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[361]=paper.setFinish(); 

t[362]=paper.text(nx[362],ny[362],'Reefs').attr({fill:"#666666","font-size": 14*sfac[362]});
tBox=t[362].getBBox(); 
bt[362]=ny[362]-(tBox.height/2+10*sfac[362]);
bb[362]=ny[362]+(tBox.height/2+10*sfac[362]);
bl[362]=nx[362]-(tBox.width/2+10*sfac[362]);
br[362]=nx[362]+(tBox.width/2+10*sfac[362]);
paper.setStart(); 
rect=paper.rect(bl[362], bt[362], br[362]-bl[362], bb[362]-bt[362], 10*sfac[362]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[362]=paper.setFinish(); 

t[363]=paper.text(nx[363],ny[363],'Renewable Versus Non-Renewable\nResources').attr({fill:"#666666","font-size": 14*sfac[363]});
tBox=t[363].getBBox(); 
bt[363]=ny[363]-(tBox.height/2+10*sfac[363]);
bb[363]=ny[363]+(tBox.height/2+10*sfac[363]);
bl[363]=nx[363]-(tBox.width/2+10*sfac[363]);
br[363]=nx[363]+(tBox.width/2+10*sfac[363]);
paper.setStart(); 
rect=paper.rect(bl[363], bt[363], br[363]-bl[363], bb[363]-bt[363], 10*sfac[363]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[363]=paper.setFinish(); 

t[364]=paper.text(nx[364],ny[364],'Life in the Precambrian').attr({fill:"#666666","font-size": 14*sfac[364]});
tBox=t[364].getBBox(); 
bt[364]=ny[364]-(tBox.height/2+10*sfac[364]);
bb[364]=ny[364]+(tBox.height/2+10*sfac[364]);
bl[364]=nx[364]-(tBox.width/2+10*sfac[364]);
br[364]=nx[364]+(tBox.width/2+10*sfac[364]);
paper.setStart(); 
rect=paper.rect(bl[364], bt[364], br[364]-bl[364], bb[364]-bt[364], 10*sfac[364]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[364]=paper.setFinish(); 

t[365]=paper.text(nx[365],ny[365]-10,'Ponds and Lakes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[365]});
t[365].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ponds-and-Lakes/#Ponds and Lakes", target: "_top",title:"Click to jump to concept"});
}); 
t[365].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[365].getBBox(); 
bt[365]=ny[365]-10-(tBox.height/2+10*sfac[365]);
bb[365]=ny[365]-10+(tBox.height/2+10*sfac[365]);
bl[365]=nx[365]-(tBox.width/2+10*sfac[365]);
br[365]=nx[365]+(tBox.width/2+10*sfac[365]);
var nwidth = br[365]-bl[365]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[365] = bl[365] - delta; 
    br[365] = br[365] + delta; 
} 
bb[365] = bb[365]+20; 
yicon = bb[365]-25; 
xicon2 = nx[365]+-40; 
xicon3 = nx[365]+-10; 
xicon4 = nx[365]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Ponds-and-Lakes/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[365], bt[365], br[365]-bl[365], bb[365]-bt[365], 10*sfac[365]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[365]=paper.setFinish(); 
t[365].toFront(); 
exicon.toFront(); 

t[366]=paper.text(nx[366],ny[366]-10,'Dwarf Planets').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[366]});
t[366].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Dwarf-Planets/#Dwarf Planets", target: "_top",title:"Click to jump to concept"});
}); 
t[366].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[366].getBBox(); 
bt[366]=ny[366]-10-(tBox.height/2+10*sfac[366]);
bb[366]=ny[366]-10+(tBox.height/2+10*sfac[366]);
bl[366]=nx[366]-(tBox.width/2+10*sfac[366]);
br[366]=nx[366]+(tBox.width/2+10*sfac[366]);
var nwidth = br[366]-bl[366]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[366] = bl[366] - delta; 
    br[366] = br[366] + delta; 
} 
bb[366] = bb[366]+20; 
yicon = bb[366]-25; 
xicon2 = nx[366]+-40; 
xicon3 = nx[366]+-10; 
xicon4 = nx[366]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Dwarf-Planets/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Dwarf-Planets/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[366], bt[366], br[366]-bl[366], bb[366]-bt[366], 10*sfac[366]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[366]=paper.setFinish(); 
t[366].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[367]=paper.text(nx[367],ny[367]-10,'Seismograph Measures\nof Earthquakes').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[367]});
t[367].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Measuring-Earthquake-Magnitude/#Seismograph Measures of Earthquakes", target: "_top",title:"Click to jump to concept"});
}); 
t[367].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[367].getBBox(); 
bt[367]=ny[367]-10-(tBox.height/2+10*sfac[367]);
bb[367]=ny[367]-10+(tBox.height/2+10*sfac[367]);
bl[367]=nx[367]-(tBox.width/2+10*sfac[367]);
br[367]=nx[367]+(tBox.width/2+10*sfac[367]);
var nwidth = br[367]-bl[367]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[367] = bl[367] - delta; 
    br[367] = br[367] + delta; 
} 
bb[367] = bb[367]+20; 
yicon = bb[367]-25; 
xicon2 = nx[367]+-40; 
xicon3 = nx[367]+-10; 
xicon4 = nx[367]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Measuring-Earthquake-Magnitude/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[367], bt[367], br[367]-bl[367], bb[367]-bt[367], 10*sfac[367]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[367]=paper.setFinish(); 
t[367].toFront(); 
exicon.toFront(); 

t[368]=paper.text(nx[368],ny[368]-10,"Earth's Heat Budget").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[368]});
t[368].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Heat-Budget-of-Planet-Earth/#Earth's Heat Budget", target: "_top",title:"Click to jump to concept"});
}); 
t[368].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[368].getBBox(); 
bt[368]=ny[368]-10-(tBox.height/2+10*sfac[368]);
bb[368]=ny[368]-10+(tBox.height/2+10*sfac[368]);
bl[368]=nx[368]-(tBox.width/2+10*sfac[368]);
br[368]=nx[368]+(tBox.width/2+10*sfac[368]);
var nwidth = br[368]-bl[368]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[368] = bl[368] - delta; 
    br[368] = br[368] + delta; 
} 
bb[368] = bb[368]+20; 
yicon = bb[368]-25; 
xicon2 = nx[368]+-40; 
xicon3 = nx[368]+-10; 
xicon4 = nx[368]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Heat-Budget-of-Planet-Earth/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Heat-Budget-of-Planet-Earth/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Heat-Budget-of-Planet-Earth/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[368], bt[368], br[368]-bl[368], bb[368]-bt[368], 10*sfac[368]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[368]=paper.setFinish(); 
t[368].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[369]=paper.text(nx[369],ny[369]-10,'The Solar Nebula').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[369]});
t[369].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Formation-of-the-Sun-and-Planets/#The Solar Nebula", target: "_top",title:"Click to jump to concept"});
}); 
t[369].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[369].getBBox(); 
bt[369]=ny[369]-10-(tBox.height/2+10*sfac[369]);
bb[369]=ny[369]-10+(tBox.height/2+10*sfac[369]);
bl[369]=nx[369]-(tBox.width/2+10*sfac[369]);
br[369]=nx[369]+(tBox.width/2+10*sfac[369]);
var nwidth = br[369]-bl[369]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[369] = bl[369] - delta; 
    br[369] = br[369] + delta; 
} 
bb[369] = bb[369]+20; 
yicon = bb[369]-25; 
xicon2 = nx[369]+-40; 
xicon3 = nx[369]+-10; 
xicon4 = nx[369]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Formation-of-the-Sun-and-Planets/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Formation-of-the-Sun-and-Planets/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[369], bt[369], br[369]-bl[369], bb[369]-bt[369], 10*sfac[369]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[369]=paper.setFinish(); 
t[369].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[370]=paper.text(nx[370],ny[370]-10,'Troposphere').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[370]});
t[370].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Troposphere/#Troposphere", target: "_top",title:"Click to jump to concept"});
}); 
t[370].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[370].getBBox(); 
bt[370]=ny[370]-10-(tBox.height/2+10*sfac[370]);
bb[370]=ny[370]-10+(tBox.height/2+10*sfac[370]);
bl[370]=nx[370]-(tBox.width/2+10*sfac[370]);
br[370]=nx[370]+(tBox.width/2+10*sfac[370]);
var nwidth = br[370]-bl[370]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[370] = bl[370] - delta; 
    br[370] = br[370] + delta; 
} 
bb[370] = bb[370]+20; 
yicon = bb[370]-25; 
xicon2 = nx[370]+-40; 
xicon3 = nx[370]+-10; 
xicon4 = nx[370]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Troposphere/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Troposphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[370], bt[370], br[370]-bl[370], bb[370]-bt[370], 10*sfac[370]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[370]=paper.setFinish(); 
t[370].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[371]=paper.text(nx[371],ny[371]-10,'Magnetic Evidence of\nContinental Drift').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[371]});
t[371].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Magnetic-Polarity-Evidence-for-Continental-Drift/#Magnetic Evidence of Continental Drift", target: "_top",title:"Click to jump to concept"});
}); 
t[371].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[371].getBBox(); 
bt[371]=ny[371]-10-(tBox.height/2+10*sfac[371]);
bb[371]=ny[371]-10+(tBox.height/2+10*sfac[371]);
bl[371]=nx[371]-(tBox.width/2+10*sfac[371]);
br[371]=nx[371]+(tBox.width/2+10*sfac[371]);
var nwidth = br[371]-bl[371]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[371] = bl[371] - delta; 
    br[371] = br[371] + delta; 
} 
bb[371] = bb[371]+20; 
yicon = bb[371]-25; 
xicon2 = nx[371]+-40; 
xicon3 = nx[371]+-10; 
xicon4 = nx[371]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Magnetic-Polarity-Evidence-for-Continental-Drift/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[371], bt[371], br[371]-bl[371], bb[371]-bt[371], 10*sfac[371]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[371]=paper.setFinish(); 
t[371].toFront(); 
exicon.toFront(); 

t[372]=paper.text(nx[372],ny[372]-10,'Ocean Life').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[372]});
t[372].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ocean-Ecosystems/#Ocean Life", target: "_top",title:"Click to jump to concept"});
}); 
t[372].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[372].getBBox(); 
bt[372]=ny[372]-10-(tBox.height/2+10*sfac[372]);
bb[372]=ny[372]-10+(tBox.height/2+10*sfac[372]);
bl[372]=nx[372]-(tBox.width/2+10*sfac[372]);
br[372]=nx[372]+(tBox.width/2+10*sfac[372]);
var nwidth = br[372]-bl[372]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[372] = bl[372] - delta; 
    br[372] = br[372] + delta; 
} 
bb[372] = bb[372]+20; 
yicon = bb[372]-25; 
xicon2 = nx[372]+-40; 
xicon3 = nx[372]+-10; 
xicon4 = nx[372]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Ocean-Ecosystems/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Ocean-Ecosystems/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[372], bt[372], br[372]-bl[372], bb[372]-bt[372], 10*sfac[372]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[372]=paper.setFinish(); 
t[372].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[373]=paper.text(nx[373],ny[373],'Clues about Earth\nfrom Fossils').attr({fill:"#666666","font-size": 14*sfac[373]});
tBox=t[373].getBBox(); 
bt[373]=ny[373]-(tBox.height/2+10*sfac[373]);
bb[373]=ny[373]+(tBox.height/2+10*sfac[373]);
bl[373]=nx[373]-(tBox.width/2+10*sfac[373]);
br[373]=nx[373]+(tBox.width/2+10*sfac[373]);
paper.setStart(); 
rect=paper.rect(bl[373], bt[373], br[373]-bl[373], bb[373]-bt[373], 10*sfac[373]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[373]=paper.setFinish(); 

t[374]=paper.text(nx[374],ny[374],'Layers of the Atmosphere').attr({fill:"#666666","font-size": 14*sfac[374]});
tBox=t[374].getBBox(); 
bt[374]=ny[374]-(tBox.height/2+10*sfac[374]);
bb[374]=ny[374]+(tBox.height/2+10*sfac[374]);
bl[374]=nx[374]-(tBox.width/2+10*sfac[374]);
br[374]=nx[374]+(tBox.width/2+10*sfac[374]);
paper.setStart(); 
rect=paper.rect(bl[374], bt[374], br[374]-bl[374], bb[374]-bt[374], 10*sfac[374]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[374]=paper.setFinish(); 

t[375]=paper.text(nx[375],ny[375]-10,'Mercury').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[375]});
t[375].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mercury/#Mercury", target: "_top",title:"Click to jump to concept"});
}); 
t[375].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[375].getBBox(); 
bt[375]=ny[375]-10-(tBox.height/2+10*sfac[375]);
bb[375]=ny[375]-10+(tBox.height/2+10*sfac[375]);
bl[375]=nx[375]-(tBox.width/2+10*sfac[375]);
br[375]=nx[375]+(tBox.width/2+10*sfac[375]);
var nwidth = br[375]-bl[375]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[375] = bl[375] - delta; 
    br[375] = br[375] + delta; 
} 
bb[375] = bb[375]+20; 
yicon = bb[375]-25; 
xicon2 = nx[375]+-40; 
xicon3 = nx[375]+-10; 
xicon4 = nx[375]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mercury/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mercury/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[375], bt[375], br[375]-bl[375], bb[375]-bt[375], 10*sfac[375]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[375]=paper.setFinish(); 
t[375].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[376]=paper.text(nx[376],ny[376],"Earth's Surface Processes").attr({fill:"#666666","font-size": 14*sfac[376]});
tBox=t[376].getBBox(); 
bt[376]=ny[376]-(tBox.height/2+10*sfac[376]);
bb[376]=ny[376]+(tBox.height/2+10*sfac[376]);
bl[376]=nx[376]-(tBox.width/2+10*sfac[376]);
br[376]=nx[376]+(tBox.width/2+10*sfac[376]);
paper.setStart(); 
rect=paper.rect(bl[376], bt[376], br[376]-bl[376], bb[376]-bt[376], 10*sfac[376]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[376]=paper.setFinish(); 

t[377]=paper.text(nx[377],ny[377],'Earth as a Planet').attr({fill:"#666666","font-size": 14*sfac[377]});
tBox=t[377].getBBox(); 
bt[377]=ny[377]-(tBox.height/2+10*sfac[377]);
bb[377]=ny[377]+(tBox.height/2+10*sfac[377]);
bl[377]=nx[377]-(tBox.width/2+10*sfac[377]);
br[377]=nx[377]+(tBox.width/2+10*sfac[377]);
paper.setStart(); 
rect=paper.rect(bl[377], bt[377], br[377]-bl[377], bb[377]-bt[377], 10*sfac[377]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[377]=paper.setFinish(); 

t[378]=paper.text(nx[378],ny[378]-10,'Convergent Plate Boundaries:\nOcean-Ocean').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[378]});
t[378].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Ocean-Ocean-Convergent-Plate-Boundaries/#Convergent Plate Boundaries: Ocean-Ocean", target: "_top",title:"Click to jump to concept"});
}); 
t[378].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[378].getBBox(); 
bt[378]=ny[378]-10-(tBox.height/2+10*sfac[378]);
bb[378]=ny[378]-10+(tBox.height/2+10*sfac[378]);
bl[378]=nx[378]-(tBox.width/2+10*sfac[378]);
br[378]=nx[378]+(tBox.width/2+10*sfac[378]);
var nwidth = br[378]-bl[378]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[378] = bl[378] - delta; 
    br[378] = br[378] + delta; 
} 
bb[378] = bb[378]+20; 
yicon = bb[378]-25; 
xicon2 = nx[378]+-40; 
xicon3 = nx[378]+-10; 
xicon4 = nx[378]+20; 
paper.setStart(); 
rect=paper.rect(bl[378], bt[378], br[378]-bl[378], bb[378]-bt[378], 10*sfac[378]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[378]=paper.setFinish(); 
t[378].toFront(); 

t[379]=paper.text(nx[379],ny[379]-10,'Mountain Building').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[379]});
t[379].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mountain-Building/#Mountain Building", target: "_top",title:"Click to jump to concept"});
}); 
t[379].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[379].getBBox(); 
bt[379]=ny[379]-10-(tBox.height/2+10*sfac[379]);
bb[379]=ny[379]-10+(tBox.height/2+10*sfac[379]);
bl[379]=nx[379]-(tBox.width/2+10*sfac[379]);
br[379]=nx[379]+(tBox.width/2+10*sfac[379]);
var nwidth = br[379]-bl[379]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[379] = bl[379] - delta; 
    br[379] = br[379] + delta; 
} 
bb[379] = bb[379]+20; 
yicon = bb[379]-25; 
xicon2 = nx[379]+-40; 
xicon3 = nx[379]+-10; 
xicon4 = nx[379]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mountain-Building/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mountain-Building/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[379], bt[379], br[379]-bl[379], bb[379]-bt[379], 10*sfac[379]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[379]=paper.setFinish(); 
t[379].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[380]=paper.text(nx[380],ny[380]-10,'Predictions of Future\nClimate').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[380]});
t[380].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Future-Warming/#Predictions of Future Climate", target: "_top",title:"Click to jump to concept"});
}); 
t[380].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[380].getBBox(); 
bt[380]=ny[380]-10-(tBox.height/2+10*sfac[380]);
bb[380]=ny[380]-10+(tBox.height/2+10*sfac[380]);
bl[380]=nx[380]-(tBox.width/2+10*sfac[380]);
br[380]=nx[380]+(tBox.width/2+10*sfac[380]);
var nwidth = br[380]-bl[380]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[380] = bl[380] - delta; 
    br[380] = br[380] + delta; 
} 
bb[380] = bb[380]+20; 
yicon = bb[380]-25; 
xicon2 = nx[380]+-40; 
xicon3 = nx[380]+-10; 
xicon4 = nx[380]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Future-Warming/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Future-Warming/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[380], bt[380], br[380]-bl[380], bb[380]-bt[380], 10*sfac[380]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[380]=paper.setFinish(); 
t[380].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[381]=paper.text(nx[381],ny[381]-10,'Galaxies').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[381]});
t[381].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Galaxies/#Galaxies", target: "_top",title:"Click to jump to concept"});
}); 
t[381].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[381].getBBox(); 
bt[381]=ny[381]-10-(tBox.height/2+10*sfac[381]);
bb[381]=ny[381]-10+(tBox.height/2+10*sfac[381]);
bl[381]=nx[381]-(tBox.width/2+10*sfac[381]);
br[381]=nx[381]+(tBox.width/2+10*sfac[381]);
var nwidth = br[381]-bl[381]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[381] = bl[381] - delta; 
    br[381] = br[381] + delta; 
} 
bb[381] = bb[381]+20; 
yicon = bb[381]-25; 
xicon2 = nx[381]+-40; 
xicon3 = nx[381]+-10; 
xicon4 = nx[381]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Galaxies/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Galaxies/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[381], bt[381], br[381]-bl[381], bb[381]-bt[381], 10*sfac[381]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[381]=paper.setFinish(); 
t[381].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[382]=paper.text(nx[382],ny[382],'Springs and Geysers').attr({fill:"#666666","font-size": 14*sfac[382]});
tBox=t[382].getBBox(); 
bt[382]=ny[382]-(tBox.height/2+10*sfac[382]);
bb[382]=ny[382]+(tBox.height/2+10*sfac[382]);
bl[382]=nx[382]-(tBox.width/2+10*sfac[382]);
br[382]=nx[382]+(tBox.width/2+10*sfac[382]);
paper.setStart(); 
rect=paper.rect(bl[382], bt[382], br[382]-bl[382], bb[382]-bt[382], 10*sfac[382]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[382]=paper.setFinish(); 

t[383]=paper.text(nx[383],ny[383]-10,'Cyclones').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[383]});
t[383].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Mid-Latitude-Cyclones/#Cyclones", target: "_top",title:"Click to jump to concept"});
}); 
t[383].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[383].getBBox(); 
bt[383]=ny[383]-10-(tBox.height/2+10*sfac[383]);
bb[383]=ny[383]-10+(tBox.height/2+10*sfac[383]);
bl[383]=nx[383]-(tBox.width/2+10*sfac[383]);
br[383]=nx[383]+(tBox.width/2+10*sfac[383]);
var nwidth = br[383]-bl[383]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[383] = bl[383] - delta; 
    br[383] = br[383] + delta; 
} 
bb[383] = bb[383]+20; 
yicon = bb[383]-25; 
xicon2 = nx[383]+-40; 
xicon3 = nx[383]+-10; 
xicon4 = nx[383]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mid-Latitude-Cyclones/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Mid-Latitude-Cyclones/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[383], bt[383], br[383]-bl[383], bb[383]-bt[383], 10*sfac[383]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[383]=paper.setFinish(); 
t[383].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[384]=paper.text(nx[384],ny[384]-10,'Roles in an Ecosystem').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[384]});
t[384].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Roles-in-an-Ecosystem/#Roles in an Ecosystem", target: "_top",title:"Click to jump to concept"});
}); 
t[384].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[384].getBBox(); 
bt[384]=ny[384]-10-(tBox.height/2+10*sfac[384]);
bb[384]=ny[384]-10+(tBox.height/2+10*sfac[384]);
bl[384]=nx[384]-(tBox.width/2+10*sfac[384]);
br[384]=nx[384]+(tBox.width/2+10*sfac[384]);
var nwidth = br[384]-bl[384]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[384] = bl[384] - delta; 
    br[384] = br[384] + delta; 
} 
bb[384] = bb[384]+20; 
yicon = bb[384]-25; 
xicon2 = nx[384]+-40; 
xicon3 = nx[384]+-10; 
xicon4 = nx[384]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Roles-in-an-Ecosystem/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Roles-in-an-Ecosystem/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[384], bt[384], br[384]-bl[384], bb[384]-bt[384], 10*sfac[384]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[384]=paper.setFinish(); 
t[384].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[385]=paper.text(nx[385],ny[385]-10,'Observations and Experiments').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[385]});
t[385].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Uses-Observations-and-Experiments/#Observations and Experiments", target: "_top",title:"Click to jump to concept"});
}); 
t[385].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[385].getBBox(); 
bt[385]=ny[385]-10-(tBox.height/2+10*sfac[385]);
bb[385]=ny[385]-10+(tBox.height/2+10*sfac[385]);
bl[385]=nx[385]-(tBox.width/2+10*sfac[385]);
br[385]=nx[385]+(tBox.width/2+10*sfac[385]);
var nwidth = br[385]-bl[385]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[385] = bl[385] - delta; 
    br[385] = br[385] + delta; 
} 
bb[385] = bb[385]+20; 
yicon = bb[385]-25; 
xicon2 = nx[385]+-40; 
xicon3 = nx[385]+-10; 
xicon4 = nx[385]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Uses-Observations-and-Experiments/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Uses-Observations-and-Experiments/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[385], bt[385], br[385]-bl[385], bb[385]-bt[385], 10*sfac[385]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[385]=paper.setFinish(); 
t[385].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[386]=paper.text(nx[386],ny[386]-10,"The\nSun's Interior").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[386]});
t[386].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Interior-of-the-Sun/#The Sun's Interior", target: "_top",title:"Click to jump to concept"});
}); 
t[386].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[386].getBBox(); 
bt[386]=ny[386]-10-(tBox.height/2+10*sfac[386]);
bb[386]=ny[386]-10+(tBox.height/2+10*sfac[386]);
bl[386]=nx[386]-(tBox.width/2+10*sfac[386]);
br[386]=nx[386]+(tBox.width/2+10*sfac[386]);
var nwidth = br[386]-bl[386]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[386] = bl[386] - delta; 
    br[386] = br[386] + delta; 
} 
bb[386] = bb[386]+20; 
yicon = bb[386]-25; 
xicon2 = nx[386]+-40; 
xicon3 = nx[386]+-10; 
xicon4 = nx[386]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Interior-of-the-Sun/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Interior-of-the-Sun/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[386], bt[386], br[386]-bl[386], bb[386]-bt[386], 10*sfac[386]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[386]=paper.setFinish(); 
t[386].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[387]=paper.text(nx[387],ny[387]-10,'Human Effects on\nEarth').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[387]});
t[387].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Overpopulation-and-Over-Consumption/#Human Effects on Earth", target: "_top",title:"Click to jump to concept"});
}); 
t[387].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[387].getBBox(); 
bt[387]=ny[387]-10-(tBox.height/2+10*sfac[387]);
bb[387]=ny[387]-10+(tBox.height/2+10*sfac[387]);
bl[387]=nx[387]-(tBox.width/2+10*sfac[387]);
br[387]=nx[387]+(tBox.width/2+10*sfac[387]);
var nwidth = br[387]-bl[387]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[387] = bl[387] - delta; 
    br[387] = br[387] + delta; 
} 
bb[387] = bb[387]+20; 
yicon = bb[387]-25; 
xicon2 = nx[387]+-40; 
xicon3 = nx[387]+-10; 
xicon4 = nx[387]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Overpopulation-and-Over-Consumption/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[387], bt[387], br[387]-bl[387], bb[387]-bt[387], 10*sfac[387]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[387]=paper.setFinish(); 
t[387].toFront(); 
exicon.toFront(); 

t[388]=paper.text(nx[388],ny[388]-10,'Solar\nSystem Gravity').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[388]});
t[388].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Gravity-in-the-Solar-System/#Solar System Gravity", target: "_top",title:"Click to jump to concept"});
}); 
t[388].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[388].getBBox(); 
bt[388]=ny[388]-10-(tBox.height/2+10*sfac[388]);
bb[388]=ny[388]-10+(tBox.height/2+10*sfac[388]);
bl[388]=nx[388]-(tBox.width/2+10*sfac[388]);
br[388]=nx[388]+(tBox.width/2+10*sfac[388]);
var nwidth = br[388]-bl[388]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[388] = bl[388] - delta; 
    br[388] = br[388] + delta; 
} 
bb[388] = bb[388]+20; 
yicon = bb[388]-25; 
xicon2 = nx[388]+-40; 
xicon3 = nx[388]+-10; 
xicon4 = nx[388]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Gravity-in-the-Solar-System/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Gravity-in-the-Solar-System/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[388], bt[388], br[388]-bl[388], bb[388]-bt[388], 10*sfac[388]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[388]=paper.setFinish(); 
t[388].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[389]=paper.text(nx[389],ny[389]-10,'Igneous Rock Classification').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[389]});
t[389].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Igneous-Rocks-Classification/#Igneous Rock Classification", target: "_top",title:"Click to jump to concept"});
}); 
t[389].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[389].getBBox(); 
bt[389]=ny[389]-10-(tBox.height/2+10*sfac[389]);
bb[389]=ny[389]-10+(tBox.height/2+10*sfac[389]);
bl[389]=nx[389]-(tBox.width/2+10*sfac[389]);
br[389]=nx[389]+(tBox.width/2+10*sfac[389]);
var nwidth = br[389]-bl[389]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[389] = bl[389] - delta; 
    br[389] = br[389] + delta; 
} 
bb[389] = bb[389]+20; 
yicon = bb[389]-25; 
xicon2 = nx[389]+-40; 
xicon3 = nx[389]+-10; 
xicon4 = nx[389]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Igneous-Rocks-Classification/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Igneous-Rocks-Classification/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[389], bt[389], br[389]-bl[389], bb[389]-bt[389], 10*sfac[389]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[389]=paper.setFinish(); 
t[389].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[390]=paper.text(nx[390],ny[390]-10,'Causes of Air Pollution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[390]});
t[390].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Causes-Of-Air-Pollution/#Causes of Air Pollution", target: "_top",title:"Click to jump to concept"});
}); 
t[390].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[390].getBBox(); 
bt[390]=ny[390]-10-(tBox.height/2+10*sfac[390]);
bb[390]=ny[390]-10+(tBox.height/2+10*sfac[390]);
bl[390]=nx[390]-(tBox.width/2+10*sfac[390]);
br[390]=nx[390]+(tBox.width/2+10*sfac[390]);
var nwidth = br[390]-bl[390]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[390] = bl[390] - delta; 
    br[390] = br[390] + delta; 
} 
bb[390] = bb[390]+20; 
yicon = bb[390]-25; 
xicon2 = nx[390]+-40; 
xicon3 = nx[390]+-10; 
xicon4 = nx[390]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Causes-Of-Air-Pollution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[390], bt[390], br[390]-bl[390], bb[390]-bt[390], 10*sfac[390]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[390]=paper.setFinish(); 
t[390].toFront(); 
exicon.toFront(); 

t[391]=paper.text(nx[391],ny[391]-10,'Erosion by\nGroundwater').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[391]});
t[391].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Landforms-from-Groundwater-Erosion-and-Deposition/#Erosion by Groundwater", target: "_top",title:"Click to jump to concept"});
}); 
t[391].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[391].getBBox(); 
bt[391]=ny[391]-10-(tBox.height/2+10*sfac[391]);
bb[391]=ny[391]-10+(tBox.height/2+10*sfac[391]);
bl[391]=nx[391]-(tBox.width/2+10*sfac[391]);
br[391]=nx[391]+(tBox.width/2+10*sfac[391]);
var nwidth = br[391]-bl[391]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[391] = bl[391] - delta; 
    br[391] = br[391] + delta; 
} 
bb[391] = bb[391]+20; 
yicon = bb[391]-25; 
xicon2 = nx[391]+-40; 
xicon3 = nx[391]+-10; 
xicon4 = nx[391]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Landforms-from-Groundwater-Erosion-and-Deposition/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Landforms-from-Groundwater-Erosion-and-Deposition/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[391], bt[391], br[391]-bl[391], bb[391]-bt[391], 10*sfac[391]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[391]=paper.setFinish(); 
t[391].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[392]=paper.text(nx[392],ny[392]-10,"Earth's\nShape").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[392]});
t[392].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Shape-of-Earth/#Earth's Shape", target: "_top",title:"Click to jump to concept"});
}); 
t[392].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[392].getBBox(); 
bt[392]=ny[392]-10-(tBox.height/2+10*sfac[392]);
bb[392]=ny[392]-10+(tBox.height/2+10*sfac[392]);
bl[392]=nx[392]-(tBox.width/2+10*sfac[392]);
br[392]=nx[392]+(tBox.width/2+10*sfac[392]);
var nwidth = br[392]-bl[392]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[392] = bl[392] - delta; 
    br[392] = br[392] + delta; 
} 
bb[392] = bb[392]+20; 
yicon = bb[392]-25; 
xicon2 = nx[392]+-40; 
xicon3 = nx[392]+-10; 
xicon4 = nx[392]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Shape-of-Earth/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Shape-of-Earth/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[392], bt[392], br[392]-bl[392], bb[392]-bt[392], 10*sfac[392]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[392]=paper.setFinish(); 
t[392].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[393]=paper.text(nx[393],ny[393]-10,'Weather').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[393]});
t[393].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Heat-Waves-and-Droughts/#Weather", target: "_top",title:"Click to jump to concept"});
}); 
t[393].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[393].getBBox(); 
bt[393]=ny[393]-10-(tBox.height/2+10*sfac[393]);
bb[393]=ny[393]-10+(tBox.height/2+10*sfac[393]);
bl[393]=nx[393]-(tBox.width/2+10*sfac[393]);
br[393]=nx[393]+(tBox.width/2+10*sfac[393]);
var nwidth = br[393]-bl[393]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[393] = bl[393] - delta; 
    br[393] = br[393] + delta; 
} 
bb[393] = bb[393]+20; 
yicon = bb[393]-25; 
xicon2 = nx[393]+-40; 
xicon3 = nx[393]+-10; 
xicon4 = nx[393]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Heat-Waves-and-Droughts/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Heat-Waves-and-Droughts/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[393], bt[393], br[393]-bl[393], bb[393]-bt[393], 10*sfac[393]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[393]=paper.setFinish(); 
t[393].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[394]=paper.text(nx[394],ny[394]-10,'Tsunami').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[394]});
t[394].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Tsunami/#Tsunami", target: "_top",title:"Click to jump to concept"});
}); 
t[394].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[394].getBBox(); 
bt[394]=ny[394]-10-(tBox.height/2+10*sfac[394]);
bb[394]=ny[394]-10+(tBox.height/2+10*sfac[394]);
bl[394]=nx[394]-(tBox.width/2+10*sfac[394]);
br[394]=nx[394]+(tBox.width/2+10*sfac[394]);
var nwidth = br[394]-bl[394]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[394] = bl[394] - delta; 
    br[394] = br[394] + delta; 
} 
bb[394] = bb[394]+20; 
yicon = bb[394]-25; 
xicon2 = nx[394]+-40; 
xicon3 = nx[394]+-10; 
xicon4 = nx[394]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tsunami/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Tsunami/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[394], bt[394], br[394]-bl[394], bb[394]-bt[394], 10*sfac[394]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[394]=paper.setFinish(); 
t[394].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[395]=paper.text(nx[395],ny[395]-10,'Satellites for\nSpace Science').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[395]});
t[395].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Studying-Space-Using-Satellites-Shuttles-and-Space-Stations/#Satellites for Space Science", target: "_top",title:"Click to jump to concept"});
}); 
t[395].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[395].getBBox(); 
bt[395]=ny[395]-10-(tBox.height/2+10*sfac[395]);
bb[395]=ny[395]-10+(tBox.height/2+10*sfac[395]);
bl[395]=nx[395]-(tBox.width/2+10*sfac[395]);
br[395]=nx[395]+(tBox.width/2+10*sfac[395]);
var nwidth = br[395]-bl[395]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[395] = bl[395] - delta; 
    br[395] = br[395] + delta; 
} 
bb[395] = bb[395]+20; 
yicon = bb[395]-25; 
xicon2 = nx[395]+-40; 
xicon3 = nx[395]+-10; 
xicon4 = nx[395]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Studying-Space-Using-Satellites-Shuttles-and-Space-Stations/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Studying-Space-Using-Satellites-Shuttles-and-Space-Stations/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[395], bt[395], br[395]-bl[395], bb[395]-bt[395], 10*sfac[395]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[395]=paper.setFinish(); 
t[395].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[396]=paper.text(nx[396],ny[396]-10,'Temperature and Heat\nin the Atmosphere').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[396]});
t[396].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Temperature-and-Heat-in-the-Atmosphere/#Temperature and Heat in the Atmosphere", target: "_top",title:"Click to jump to concept"});
}); 
t[396].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[396].getBBox(); 
bt[396]=ny[396]-10-(tBox.height/2+10*sfac[396]);
bb[396]=ny[396]-10+(tBox.height/2+10*sfac[396]);
bl[396]=nx[396]-(tBox.width/2+10*sfac[396]);
br[396]=nx[396]+(tBox.width/2+10*sfac[396]);
var nwidth = br[396]-bl[396]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[396] = bl[396] - delta; 
    br[396] = br[396] + delta; 
} 
bb[396] = bb[396]+20; 
yicon = bb[396]-25; 
xicon2 = nx[396]+-40; 
xicon3 = nx[396]+-10; 
xicon4 = nx[396]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Temperature-and-Heat-in-the-Atmosphere/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Temperature-and-Heat-in-the-Atmosphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[396], bt[396], br[396]-bl[396], bb[396]-bt[396], 10*sfac[396]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[396]=paper.setFinish(); 
t[396].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[397]=paper.text(nx[397],ny[397]-10,"Latitude's\nInfluence on Climate").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[397]});
t[397].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Effect-of-Latitude-on-Climate/#Latitude's Influence on Climate", target: "_top",title:"Click to jump to concept"});
}); 
t[397].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[397].getBBox(); 
bt[397]=ny[397]-10-(tBox.height/2+10*sfac[397]);
bb[397]=ny[397]-10+(tBox.height/2+10*sfac[397]);
bl[397]=nx[397]-(tBox.width/2+10*sfac[397]);
br[397]=nx[397]+(tBox.width/2+10*sfac[397]);
var nwidth = br[397]-bl[397]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[397] = bl[397] - delta; 
    br[397] = br[397] + delta; 
} 
bb[397] = bb[397]+20; 
yicon = bb[397]-25; 
xicon2 = nx[397]+-40; 
xicon3 = nx[397]+-10; 
xicon4 = nx[397]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Effect-of-Latitude-on-Climate/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Effect-of-Latitude-on-Climate/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Effect-of-Latitude-on-Climate/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[397], bt[397], br[397]-bl[397], bb[397]-bt[397], 10*sfac[397]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[397]=paper.setFinish(); 
t[397].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[398]=paper.text(nx[398],ny[398]-10,'Renewable vs. Non-Renewable\nEnergy').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[398]});
t[398].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Renewable-vs-Non-Renewable-Energy-Resources/#Renewable vs. Non-Renewable Energy", target: "_top",title:"Click to jump to concept"});
}); 
t[398].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[398].getBBox(); 
bt[398]=ny[398]-10-(tBox.height/2+10*sfac[398]);
bb[398]=ny[398]-10+(tBox.height/2+10*sfac[398]);
bl[398]=nx[398]-(tBox.width/2+10*sfac[398]);
br[398]=nx[398]+(tBox.width/2+10*sfac[398]);
var nwidth = br[398]-bl[398]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[398] = bl[398] - delta; 
    br[398] = br[398] + delta; 
} 
bb[398] = bb[398]+20; 
yicon = bb[398]-25; 
xicon2 = nx[398]+-40; 
xicon3 = nx[398]+-10; 
xicon4 = nx[398]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Renewable-vs-Non-Renewable-Energy-Resources/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[398], bt[398], br[398]-bl[398], bb[398]-bt[398], 10*sfac[398]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[398]=paper.setFinish(); 
t[398].toFront(); 
vidicon.toFront(); 

t[399]=paper.text(nx[399],ny[399],'The Outer Planets').attr({fill:"#666666","font-size": 14*sfac[399]});
tBox=t[399].getBBox(); 
bt[399]=ny[399]-(tBox.height/2+10*sfac[399]);
bb[399]=ny[399]+(tBox.height/2+10*sfac[399]);
bl[399]=nx[399]-(tBox.width/2+10*sfac[399]);
br[399]=nx[399]+(tBox.width/2+10*sfac[399]);
paper.setStart(); 
rect=paper.rect(bl[399], bt[399], br[399]-bl[399], bb[399]-bt[399], 10*sfac[399]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[399]=paper.setFinish(); 

t[400]=paper.text(nx[400],ny[400]-10,'Clues from Fossils').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[400]});
t[400].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Earth-History-and-Clues-from-Fossils/#Clues from Fossils", target: "_top",title:"Click to jump to concept"});
}); 
t[400].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[400].getBBox(); 
bt[400]=ny[400]-10-(tBox.height/2+10*sfac[400]);
bb[400]=ny[400]-10+(tBox.height/2+10*sfac[400]);
bl[400]=nx[400]-(tBox.width/2+10*sfac[400]);
br[400]=nx[400]+(tBox.width/2+10*sfac[400]);
var nwidth = br[400]-bl[400]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[400] = bl[400] - delta; 
    br[400] = br[400] + delta; 
} 
bb[400] = bb[400]+20; 
yicon = bb[400]-25; 
xicon2 = nx[400]+-40; 
xicon3 = nx[400]+-10; 
xicon4 = nx[400]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Earth-History-and-Clues-from-Fossils/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[400], bt[400], br[400]-bl[400], bb[400]-bt[400], 10*sfac[400]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[400]=paper.setFinish(); 
t[400].toFront(); 
vidicon.toFront(); 

t[401]=paper.text(nx[401],ny[401]-10,"Earth's\nMantle").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[401]});
t[401].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Mantle/#Earth's Mantle", target: "_top",title:"Click to jump to concept"});
}); 
t[401].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[401].getBBox(); 
bt[401]=ny[401]-10-(tBox.height/2+10*sfac[401]);
bb[401]=ny[401]-10+(tBox.height/2+10*sfac[401]);
bl[401]=nx[401]-(tBox.width/2+10*sfac[401]);
br[401]=nx[401]+(tBox.width/2+10*sfac[401]);
var nwidth = br[401]-bl[401]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[401] = bl[401] - delta; 
    br[401] = br[401] + delta; 
} 
bb[401] = bb[401]+20; 
yicon = bb[401]-25; 
xicon2 = nx[401]+-40; 
xicon3 = nx[401]+-10; 
xicon4 = nx[401]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Mantle/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Mantle/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[401], bt[401], br[401]-bl[401], bb[401]-bt[401], 10*sfac[401]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[401]=paper.setFinish(); 
t[401].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[402]=paper.text(nx[402],ny[402],'Soil Texture').attr({fill:"#666666","font-size": 14*sfac[402]});
tBox=t[402].getBBox(); 
bt[402]=ny[402]-(tBox.height/2+10*sfac[402]);
bb[402]=ny[402]+(tBox.height/2+10*sfac[402]);
bl[402]=nx[402]-(tBox.width/2+10*sfac[402]);
br[402]=nx[402]+(tBox.width/2+10*sfac[402]);
paper.setStart(); 
rect=paper.rect(bl[402], bt[402], br[402]-bl[402], bb[402]-bt[402], 10*sfac[402]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[402]=paper.setFinish(); 

t[403]=paper.text(nx[403],ny[403],'Stars').attr({fill:"#666666","font-size": 14*sfac[403]});
tBox=t[403].getBBox(); 
bt[403]=ny[403]-(tBox.height/2+10*sfac[403]);
bb[403]=ny[403]+(tBox.height/2+10*sfac[403]);
bl[403]=nx[403]-(tBox.width/2+10*sfac[403]);
br[403]=nx[403]+(tBox.width/2+10*sfac[403]);
paper.setStart(); 
rect=paper.rect(bl[403], bt[403], br[403]-bl[403], bb[403]-bt[403], 10*sfac[403]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[403]=paper.setFinish(); 

t[404]=paper.text(nx[404],ny[404]-10,"Material Evidence of Earth's\nInterior").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[404]});
t[404].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/More-Clues-to-Understanding-the-Interior/#Material Evidence of Earth's Interior", target: "_top",title:"Click to jump to concept"});
}); 
t[404].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[404].getBBox(); 
bt[404]=ny[404]-10-(tBox.height/2+10*sfac[404]);
bb[404]=ny[404]-10+(tBox.height/2+10*sfac[404]);
bl[404]=nx[404]-(tBox.width/2+10*sfac[404]);
br[404]=nx[404]+(tBox.width/2+10*sfac[404]);
var nwidth = br[404]-bl[404]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[404] = bl[404] - delta; 
    br[404] = br[404] + delta; 
} 
bb[404] = bb[404]+20; 
yicon = bb[404]-25; 
xicon2 = nx[404]+-40; 
xicon3 = nx[404]+-10; 
xicon4 = nx[404]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/More-Clues-to-Understanding-the-Interior/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[404], bt[404], br[404]-bl[404], bb[404]-bt[404], 10*sfac[404]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[404]=paper.setFinish(); 
t[404].toFront(); 
vidicon.toFront(); 

t[405]=paper.text(nx[405],ny[405]-10,'Blizzards').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[405]});
t[405].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Blizzards/#Blizzards", target: "_top",title:"Click to jump to concept"});
}); 
t[405].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[405].getBBox(); 
bt[405]=ny[405]-10-(tBox.height/2+10*sfac[405]);
bb[405]=ny[405]-10+(tBox.height/2+10*sfac[405]);
bl[405]=nx[405]-(tBox.width/2+10*sfac[405]);
br[405]=nx[405]+(tBox.width/2+10*sfac[405]);
var nwidth = br[405]-bl[405]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[405] = bl[405] - delta; 
    br[405] = br[405] + delta; 
} 
bb[405] = bb[405]+20; 
yicon = bb[405]-25; 
xicon2 = nx[405]+-40; 
xicon3 = nx[405]+-10; 
xicon4 = nx[405]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Blizzards/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Blizzards/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[405], bt[405], br[405]-bl[405], bb[405]-bt[405], 10*sfac[405]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[405]=paper.setFinish(); 
t[405].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[406]=paper.text(nx[406],ny[406]-10,'Groundwater Pollution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[406]});
t[406].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Groundwater-Pollution/#Groundwater Pollution", target: "_top",title:"Click to jump to concept"});
}); 
t[406].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[406].getBBox(); 
bt[406]=ny[406]-10-(tBox.height/2+10*sfac[406]);
bb[406]=ny[406]-10+(tBox.height/2+10*sfac[406]);
bl[406]=nx[406]-(tBox.width/2+10*sfac[406]);
br[406]=nx[406]+(tBox.width/2+10*sfac[406]);
var nwidth = br[406]-bl[406]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[406] = bl[406] - delta; 
    br[406] = br[406] + delta; 
} 
bb[406] = bb[406]+20; 
yicon = bb[406]-25; 
xicon2 = nx[406]+-40; 
xicon3 = nx[406]+-10; 
xicon4 = nx[406]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Groundwater-Pollution/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Groundwater-Pollution/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[406], bt[406], br[406]-bl[406], bb[406]-bt[406], 10*sfac[406]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[406]=paper.setFinish(); 
t[406].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[407]=paper.text(nx[407],ny[407]-10,'Air Pressure').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[407]});
t[407].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Circulation-in-the-Atmosphere/#Air Pressure", target: "_top",title:"Click to jump to concept"});
}); 
t[407].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[407].getBBox(); 
bt[407]=ny[407]-10-(tBox.height/2+10*sfac[407]);
bb[407]=ny[407]-10+(tBox.height/2+10*sfac[407]);
bl[407]=nx[407]-(tBox.width/2+10*sfac[407]);
br[407]=nx[407]+(tBox.width/2+10*sfac[407]);
var nwidth = br[407]-bl[407]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[407] = bl[407] - delta; 
    br[407] = br[407] + delta; 
} 
bb[407] = bb[407]+20; 
yicon = bb[407]-25; 
xicon2 = nx[407]+-40; 
xicon3 = nx[407]+-10; 
xicon4 = nx[407]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Circulation-in-the-Atmosphere/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Circulation-in-the-Atmosphere/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Circulation-in-the-Atmosphere/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[407], bt[407], br[407]-bl[407], bb[407]-bt[407], 10*sfac[407]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[407]=paper.setFinish(); 
t[407].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[408]=paper.text(nx[408],ny[408],'Reefs').attr({fill:"#666666","font-size": 14*sfac[408]});
tBox=t[408].getBBox(); 
bt[408]=ny[408]-(tBox.height/2+10*sfac[408]);
bb[408]=ny[408]+(tBox.height/2+10*sfac[408]);
bl[408]=nx[408]-(tBox.width/2+10*sfac[408]);
br[408]=nx[408]+(tBox.width/2+10*sfac[408]);
paper.setStart(); 
rect=paper.rect(bl[408], bt[408], br[408]-bl[408], bb[408]-bt[408], 10*sfac[408]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[408]=paper.setFinish(); 

t[409]=paper.text(nx[409],ny[409]-10,'Jupiter').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[409]});
t[409].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Jupiter/#Jupiter", target: "_top",title:"Click to jump to concept"});
}); 
t[409].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[409].getBBox(); 
bt[409]=ny[409]-10-(tBox.height/2+10*sfac[409]);
bb[409]=ny[409]-10+(tBox.height/2+10*sfac[409]);
bl[409]=nx[409]-(tBox.width/2+10*sfac[409]);
br[409]=nx[409]+(tBox.width/2+10*sfac[409]);
var nwidth = br[409]-bl[409]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[409] = bl[409] - delta; 
    br[409] = br[409] + delta; 
} 
bb[409] = bb[409]+20; 
yicon = bb[409]-25; 
xicon2 = nx[409]+-40; 
xicon3 = nx[409]+-10; 
xicon4 = nx[409]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Jupiter/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Jupiter/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[409], bt[409], br[409]-bl[409], bb[409]-bt[409], 10*sfac[409]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[409]=paper.setFinish(); 
t[409].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[410]=paper.text(nx[410],ny[410]-10,'Protecting Water from Pollution').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[410]});
t[410].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Conserving-Water/#Protecting Water from Pollution", target: "_top",title:"Click to jump to concept"});
}); 
t[410].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[410].getBBox(); 
bt[410]=ny[410]-10-(tBox.height/2+10*sfac[410]);
bb[410]=ny[410]-10+(tBox.height/2+10*sfac[410]);
bl[410]=nx[410]-(tBox.width/2+10*sfac[410]);
br[410]=nx[410]+(tBox.width/2+10*sfac[410]);
var nwidth = br[410]-bl[410]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[410] = bl[410] - delta; 
    br[410] = br[410] + delta; 
} 
bb[410] = bb[410]+20; 
yicon = bb[410]-25; 
xicon2 = nx[410]+-40; 
xicon3 = nx[410]+-10; 
xicon4 = nx[410]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Conserving-Water/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Conserving-Water/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[410], bt[410], br[410]-bl[410], bb[410]-bt[410], 10*sfac[410]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[410]=paper.setFinish(); 
t[410].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[411]=paper.text(nx[411],ny[411]-10,'Transform Plate Boundaries').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[411]});
t[411].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Transform-Plate-Boundaries/#Transform Plate Boundaries", target: "_top",title:"Click to jump to concept"});
}); 
t[411].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[411].getBBox(); 
bt[411]=ny[411]-10-(tBox.height/2+10*sfac[411]);
bb[411]=ny[411]-10+(tBox.height/2+10*sfac[411]);
bl[411]=nx[411]-(tBox.width/2+10*sfac[411]);
br[411]=nx[411]+(tBox.width/2+10*sfac[411]);
var nwidth = br[411]-bl[411]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[411] = bl[411] - delta; 
    br[411] = br[411] + delta; 
} 
bb[411] = bb[411]+20; 
yicon = bb[411]-25; 
xicon2 = nx[411]+-40; 
xicon3 = nx[411]+-10; 
xicon4 = nx[411]+20; 
paper.setStart(); 
rect=paper.rect(bl[411], bt[411], br[411]-bl[411], bb[411]-bt[411], 10*sfac[411]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[411]=paper.setFinish(); 
t[411].toFront(); 

t[412]=paper.text(nx[412],ny[412]-10,'Explosive Volcanic\nEruptions').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[412]});
t[412].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Explosive-Eruptions/#Explosive Volcanic Eruptions", target: "_top",title:"Click to jump to concept"});
}); 
t[412].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[412].getBBox(); 
bt[412]=ny[412]-10-(tBox.height/2+10*sfac[412]);
bb[412]=ny[412]-10+(tBox.height/2+10*sfac[412]);
bl[412]=nx[412]-(tBox.width/2+10*sfac[412]);
br[412]=nx[412]+(tBox.width/2+10*sfac[412]);
var nwidth = br[412]-bl[412]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[412] = bl[412] - delta; 
    br[412] = br[412] + delta; 
} 
bb[412] = bb[412]+20; 
yicon = bb[412]-25; 
xicon2 = nx[412]+-40; 
xicon3 = nx[412]+-10; 
xicon4 = nx[412]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Explosive-Eruptions/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Explosive-Eruptions/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Explosive-Eruptions/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[412], bt[412], br[412]-bl[412], bb[412]-bt[412], 10*sfac[412]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[412]=paper.setFinish(); 
t[412].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[413]=paper.text(nx[413],ny[413]-10,"The Sun's\nSurface Features").attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[413]});
t[413].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/The-Surface-Features-of-the-Sun/#The Sun's Surface Features", target: "_top",title:"Click to jump to concept"});
}); 
t[413].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[413].getBBox(); 
bt[413]=ny[413]-10-(tBox.height/2+10*sfac[413]);
bb[413]=ny[413]-10+(tBox.height/2+10*sfac[413]);
bl[413]=nx[413]-(tBox.width/2+10*sfac[413]);
br[413]=nx[413]+(tBox.width/2+10*sfac[413]);
var nwidth = br[413]-bl[413]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[413] = bl[413] - delta; 
    br[413] = br[413] + delta; 
} 
bb[413] = bb[413]+20; 
yicon = bb[413]-25; 
xicon2 = nx[413]+-40; 
xicon3 = nx[413]+-10; 
xicon4 = nx[413]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Surface-Features-of-the-Sun/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/The-Surface-Features-of-the-Sun/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[413], bt[413], br[413]-bl[413], bb[413]-bt[413], 10*sfac[413]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[413]=paper.setFinish(); 
t[413].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 

t[414]=paper.text(nx[414],ny[414]-10,'States of Water').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[414]});
t[414].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/States-of-Water/#States of Water", target: "_top",title:"Click to jump to concept"});
}); 
t[414].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[414].getBBox(); 
bt[414]=ny[414]-10-(tBox.height/2+10*sfac[414]);
bb[414]=ny[414]-10+(tBox.height/2+10*sfac[414]);
bl[414]=nx[414]-(tBox.width/2+10*sfac[414]);
br[414]=nx[414]+(tBox.width/2+10*sfac[414]);
var nwidth = br[414]-bl[414]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[414] = bl[414] - delta; 
    br[414] = br[414] + delta; 
} 
bb[414] = bb[414]+20; 
yicon = bb[414]-25; 
xicon2 = nx[414]+-40; 
xicon3 = nx[414]+-10; 
xicon4 = nx[414]+20; 
vidicon = paper.image('/media/images/icon_video_20x20.png',xicon2,yicon,20,20); 
vidicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/States-of-Water/#view_videos", target: "_top",title:"Click to jump to concept video"}); 
}); 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/States-of-Water/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
atticon = paper.image('/media/images/icon_attach_20x20.png',xicon4,yicon,20,20); 
atticon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/States-of-Water/#view_attachments", target: "_top",title:"Click to jump to concept attachments"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[414], bt[414], br[414]-bl[414], bb[414]-bt[414], 10*sfac[414]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[414]=paper.setFinish(); 
t[414].toFront(); 
vidicon.toFront(); 
exicon.toFront(); 
atticon.toFront(); 

t[415]=paper.text(nx[415],ny[415],'Computers for\nEarth Science').attr({fill:"#666666","font-size": 14*sfac[415]});
tBox=t[415].getBBox(); 
bt[415]=ny[415]-(tBox.height/2+10*sfac[415]);
bb[415]=ny[415]+(tBox.height/2+10*sfac[415]);
bl[415]=nx[415]-(tBox.width/2+10*sfac[415]);
br[415]=nx[415]+(tBox.width/2+10*sfac[415]);
paper.setStart(); 
rect=paper.rect(bl[415], bt[415], br[415]-bl[415], bb[415]-bt[415], 10*sfac[415]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[415]=paper.setFinish(); 

t[416]=paper.text(nx[416],ny[416]-10,'Paleozoic Plate\nTectonics').attr({fill:"#000000", cursor: "pointer", "font-size": 14*sfac[416]});
t[416].mouseover(function (event) { 
    this.attr({fill: "#bf5600", cursor: "pointer", href: "/concept/Paleozoic-Plate-Tectonics/#Paleozoic Plate Tectonics", target: "_top",title:"Click to jump to concept"});
}); 
t[416].mouseout(function (event) { 
    this.attr({cursor: "pointer", fill: "#000000"}); 
}); 
tBox=t[416].getBBox(); 
bt[416]=ny[416]-10-(tBox.height/2+10*sfac[416]);
bb[416]=ny[416]-10+(tBox.height/2+10*sfac[416]);
bl[416]=nx[416]-(tBox.width/2+10*sfac[416]);
br[416]=nx[416]+(tBox.width/2+10*sfac[416]);
var nwidth = br[416]-bl[416]; 
if (nwidth < 100) { 
    var delta = (100-nwidth)/2; 
    bl[416] = bl[416] - delta; 
    br[416] = br[416] + delta; 
} 
bb[416] = bb[416]+20; 
yicon = bb[416]-25; 
xicon2 = nx[416]+-40; 
xicon3 = nx[416]+-10; 
xicon4 = nx[416]+20; 
exicon = paper.image('/media/images/icon_interactive_object_20x20.png',xicon3,yicon,20,20); 
exicon.mouseover(function (event) { 
     this.attr({cursor: "pointer", href: "/concept/Paleozoic-Plate-Tectonics/#view_exercises", target: "_top",title:"Click to jump to concept exercise"}); 
}); 
paper.setStart(); 
rect=paper.rect(bl[416], bt[416], br[416]-bl[416], bb[416]-bt[416], 10*sfac[416]).attr({stroke:"#bf5600","stroke-width": "3", fill:"black","fill-opacity":"0"});
b[416]=paper.setFinish(); 
t[416].toFront(); 
exicon.toFront(); 

bb[417]= ny[417]; 
bt[417]= ny[417]; 
bl[417]= nx[417]; 
br[417]= nx[417]; 

bb[418]= ny[418]; 
bt[418]= ny[418]; 
bl[418]= nx[418]; 
br[418]= nx[418]; 

bb[419]= ny[419]; 
bt[419]= ny[419]; 
bl[419]= nx[419]; 
br[419]= nx[419]; 

bb[420]= ny[420]; 
bt[420]= ny[420]; 
bl[420]= nx[420]; 
br[420]= nx[420]; 

bb[421]= ny[421]; 
bt[421]= ny[421]; 
bl[421]= nx[421]; 
br[421]= nx[421]; 

bb[422]= ny[422]; 
bt[422]= ny[422]; 
bl[422]= nx[422]; 
br[422]= nx[422]; 

bb[423]= ny[423]; 
bt[423]= ny[423]; 
bl[423]= nx[423]; 
br[423]= nx[423]; 

bb[424]= ny[424]; 
bt[424]= ny[424]; 
bl[424]= nx[424]; 
br[424]= nx[424]; 

bb[425]= ny[425]; 
bt[425]= ny[425]; 
bl[425]= nx[425]; 
br[425]= nx[425]; 

bb[426]= ny[426]; 
bt[426]= ny[426]; 
bl[426]= nx[426]; 
br[426]= nx[426]; 

bb[427]= ny[427]; 
bt[427]= ny[427]; 
bl[427]= nx[427]; 
br[427]= nx[427]; 

bb[428]= ny[428]; 
bt[428]= ny[428]; 
bl[428]= nx[428]; 
br[428]= nx[428]; 

bb[429]= ny[429]; 
bt[429]= ny[429]; 
bl[429]= nx[429]; 
br[429]= nx[429]; 

bb[430]= ny[430]; 
bt[430]= ny[430]; 
bl[430]= nx[430]; 
br[430]= nx[430]; 

bb[431]= ny[431]; 
bt[431]= ny[431]; 
bl[431]= nx[431]; 
br[431]= nx[431]; 

bb[432]= ny[432]; 
bt[432]= ny[432]; 
bl[432]= nx[432]; 
br[432]= nx[432]; 

bb[433]= ny[433]; 
bt[433]= ny[433]; 
bl[433]= nx[433]; 
br[433]= nx[433]; 

bb[434]= ny[434]; 
bt[434]= ny[434]; 
bl[434]= nx[434]; 
br[434]= nx[434]; 

bb[435]= ny[435]; 
bt[435]= ny[435]; 
bl[435]= nx[435]; 
br[435]= nx[435]; 

bb[436]= ny[436]; 
bt[436]= ny[436]; 
bl[436]= nx[436]; 
br[436]= nx[436]; 

bb[437]= ny[437]; 
bt[437]= ny[437]; 
bl[437]= nx[437]; 
br[437]= nx[437]; 

bb[438]= ny[438]; 
bt[438]= ny[438]; 
bl[438]= nx[438]; 
br[438]= nx[438]; 

bb[439]= ny[439]; 
bt[439]= ny[439]; 
bl[439]= nx[439]; 
br[439]= nx[439]; 

bb[440]= ny[440]; 
bt[440]= ny[440]; 
bl[440]= nx[440]; 
br[440]= nx[440]; 

bb[441]= ny[441]; 
bt[441]= ny[441]; 
bl[441]= nx[441]; 
br[441]= nx[441]; 

bb[442]= ny[442]; 
bt[442]= ny[442]; 
bl[442]= nx[442]; 
br[442]= nx[442]; 

bb[443]= ny[443]; 
bt[443]= ny[443]; 
bl[443]= nx[443]; 
br[443]= nx[443]; 

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
b[269].click(function() {recenter(269);}); 
b[270].click(function() {recenter(270);}); 
b[271].click(function() {recenter(271);}); 
b[272].click(function() {recenter(272);}); 
b[273].click(function() {recenter(273);}); 
b[274].click(function() {recenter(274);}); 
b[275].click(function() {recenter(275);}); 
b[276].click(function() {recenter(276);}); 
b[277].click(function() {recenter(277);}); 
b[278].click(function() {recenter(278);}); 
b[279].click(function() {recenter(279);}); 
b[280].click(function() {recenter(280);}); 
b[281].click(function() {recenter(281);}); 
b[282].click(function() {recenter(282);}); 
b[283].click(function() {recenter(283);}); 
b[284].click(function() {recenter(284);}); 
b[285].click(function() {recenter(285);}); 
b[286].click(function() {recenter(286);}); 
b[287].click(function() {recenter(287);}); 
b[288].click(function() {recenter(288);}); 
b[289].click(function() {recenter(289);}); 
b[290].click(function() {recenter(290);}); 
b[291].click(function() {recenter(291);}); 
b[292].click(function() {recenter(292);}); 
b[293].click(function() {recenter(293);}); 
b[294].click(function() {recenter(294);}); 
b[295].click(function() {recenter(295);}); 
b[296].click(function() {recenter(296);}); 
b[297].click(function() {recenter(297);}); 
b[298].click(function() {recenter(298);}); 
b[299].click(function() {recenter(299);}); 
b[300].click(function() {recenter(300);}); 
b[301].click(function() {recenter(301);}); 
b[302].click(function() {recenter(302);}); 
b[303].click(function() {recenter(303);}); 
b[304].click(function() {recenter(304);}); 
b[305].click(function() {recenter(305);}); 
b[306].click(function() {recenter(306);}); 
b[307].click(function() {recenter(307);}); 
b[308].click(function() {recenter(308);}); 
b[309].click(function() {recenter(309);}); 
b[310].click(function() {recenter(310);}); 
b[311].click(function() {recenter(311);}); 
b[312].click(function() {recenter(312);}); 
b[313].click(function() {recenter(313);}); 
b[314].click(function() {recenter(314);}); 
b[315].click(function() {recenter(315);}); 
b[316].click(function() {recenter(316);}); 
b[317].click(function() {recenter(317);}); 
b[318].click(function() {recenter(318);}); 
b[319].click(function() {recenter(319);}); 
b[320].click(function() {recenter(320);}); 
b[321].click(function() {recenter(321);}); 
b[322].click(function() {recenter(322);}); 
b[323].click(function() {recenter(323);}); 
b[324].click(function() {recenter(324);}); 
b[325].click(function() {recenter(325);}); 
b[326].click(function() {recenter(326);}); 
b[327].click(function() {recenter(327);}); 
b[328].click(function() {recenter(328);}); 
b[329].click(function() {recenter(329);}); 
b[330].click(function() {recenter(330);}); 
b[331].click(function() {recenter(331);}); 
b[332].click(function() {recenter(332);}); 
b[333].click(function() {recenter(333);}); 
b[334].click(function() {recenter(334);}); 
b[335].click(function() {recenter(335);}); 
b[336].click(function() {recenter(336);}); 
b[337].click(function() {recenter(337);}); 
b[338].click(function() {recenter(338);}); 
b[339].click(function() {recenter(339);}); 
b[340].click(function() {recenter(340);}); 
b[341].click(function() {recenter(341);}); 
b[342].click(function() {recenter(342);}); 
b[343].click(function() {recenter(343);}); 
b[344].click(function() {recenter(344);}); 
b[345].click(function() {recenter(345);}); 
b[346].click(function() {recenter(346);}); 
b[347].click(function() {recenter(347);}); 
b[348].click(function() {recenter(348);}); 
b[349].click(function() {recenter(349);}); 
b[350].click(function() {recenter(350);}); 
b[351].click(function() {recenter(351);}); 
b[352].click(function() {recenter(352);}); 
b[353].click(function() {recenter(353);}); 
b[354].click(function() {recenter(354);}); 
b[355].click(function() {recenter(355);}); 
b[356].click(function() {recenter(356);}); 
b[357].click(function() {recenter(357);}); 
b[358].click(function() {recenter(358);}); 
b[359].click(function() {recenter(359);}); 
b[360].click(function() {recenter(360);}); 
b[361].click(function() {recenter(361);}); 
b[362].click(function() {recenter(362);}); 
b[363].click(function() {recenter(363);}); 
b[364].click(function() {recenter(364);}); 
b[365].click(function() {recenter(365);}); 
b[366].click(function() {recenter(366);}); 
b[367].click(function() {recenter(367);}); 
b[368].click(function() {recenter(368);}); 
b[369].click(function() {recenter(369);}); 
b[370].click(function() {recenter(370);}); 
b[371].click(function() {recenter(371);}); 
b[372].click(function() {recenter(372);}); 
b[373].click(function() {recenter(373);}); 
b[374].click(function() {recenter(374);}); 
b[375].click(function() {recenter(375);}); 
b[376].click(function() {recenter(376);}); 
b[377].click(function() {recenter(377);}); 
b[378].click(function() {recenter(378);}); 
b[379].click(function() {recenter(379);}); 
b[380].click(function() {recenter(380);}); 
b[381].click(function() {recenter(381);}); 
b[382].click(function() {recenter(382);}); 
b[383].click(function() {recenter(383);}); 
b[384].click(function() {recenter(384);}); 
b[385].click(function() {recenter(385);}); 
b[386].click(function() {recenter(386);}); 
b[387].click(function() {recenter(387);}); 
b[388].click(function() {recenter(388);}); 
b[389].click(function() {recenter(389);}); 
b[390].click(function() {recenter(390);}); 
b[391].click(function() {recenter(391);}); 
b[392].click(function() {recenter(392);}); 
b[393].click(function() {recenter(393);}); 
b[394].click(function() {recenter(394);}); 
b[395].click(function() {recenter(395);}); 
b[396].click(function() {recenter(396);}); 
b[397].click(function() {recenter(397);}); 
b[398].click(function() {recenter(398);}); 
b[399].click(function() {recenter(399);}); 
b[400].click(function() {recenter(400);}); 
b[401].click(function() {recenter(401);}); 
b[402].click(function() {recenter(402);}); 
b[403].click(function() {recenter(403);}); 
b[404].click(function() {recenter(404);}); 
b[405].click(function() {recenter(405);}); 
b[406].click(function() {recenter(406);}); 
b[407].click(function() {recenter(407);}); 
b[408].click(function() {recenter(408);}); 
b[409].click(function() {recenter(409);}); 
b[410].click(function() {recenter(410);}); 
b[411].click(function() {recenter(411);}); 
b[412].click(function() {recenter(412);}); 
b[413].click(function() {recenter(413);}); 
b[414].click(function() {recenter(414);}); 
b[415].click(function() {recenter(415);}); 
b[416].click(function() {recenter(416);}); 
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
b[269].hover(function() {nodeHover(269);}, function() {nodeUnhover(269);}); 
b[270].hover(function() {nodeHover(270);}, function() {nodeUnhover(270);}); 
b[271].hover(function() {nodeHover(271);}, function() {nodeUnhover(271);}); 
b[272].hover(function() {nodeHover(272);}, function() {nodeUnhover(272);}); 
b[273].hover(function() {nodeHover(273);}, function() {nodeUnhover(273);}); 
b[274].hover(function() {nodeHover(274);}, function() {nodeUnhover(274);}); 
b[275].hover(function() {nodeHover(275);}, function() {nodeUnhover(275);}); 
b[276].hover(function() {nodeHover(276);}, function() {nodeUnhover(276);}); 
b[277].hover(function() {nodeHover(277);}, function() {nodeUnhover(277);}); 
b[278].hover(function() {nodeHover(278);}, function() {nodeUnhover(278);}); 
b[279].hover(function() {nodeHover(279);}, function() {nodeUnhover(279);}); 
b[280].hover(function() {nodeHover(280);}, function() {nodeUnhover(280);}); 
b[281].hover(function() {nodeHover(281);}, function() {nodeUnhover(281);}); 
b[282].hover(function() {nodeHover(282);}, function() {nodeUnhover(282);}); 
b[283].hover(function() {nodeHover(283);}, function() {nodeUnhover(283);}); 
b[284].hover(function() {nodeHover(284);}, function() {nodeUnhover(284);}); 
b[285].hover(function() {nodeHover(285);}, function() {nodeUnhover(285);}); 
b[286].hover(function() {nodeHover(286);}, function() {nodeUnhover(286);}); 
b[287].hover(function() {nodeHover(287);}, function() {nodeUnhover(287);}); 
b[288].hover(function() {nodeHover(288);}, function() {nodeUnhover(288);}); 
b[289].hover(function() {nodeHover(289);}, function() {nodeUnhover(289);}); 
b[290].hover(function() {nodeHover(290);}, function() {nodeUnhover(290);}); 
b[291].hover(function() {nodeHover(291);}, function() {nodeUnhover(291);}); 
b[292].hover(function() {nodeHover(292);}, function() {nodeUnhover(292);}); 
b[293].hover(function() {nodeHover(293);}, function() {nodeUnhover(293);}); 
b[294].hover(function() {nodeHover(294);}, function() {nodeUnhover(294);}); 
b[295].hover(function() {nodeHover(295);}, function() {nodeUnhover(295);}); 
b[296].hover(function() {nodeHover(296);}, function() {nodeUnhover(296);}); 
b[297].hover(function() {nodeHover(297);}, function() {nodeUnhover(297);}); 
b[298].hover(function() {nodeHover(298);}, function() {nodeUnhover(298);}); 
b[299].hover(function() {nodeHover(299);}, function() {nodeUnhover(299);}); 
b[300].hover(function() {nodeHover(300);}, function() {nodeUnhover(300);}); 
b[301].hover(function() {nodeHover(301);}, function() {nodeUnhover(301);}); 
b[302].hover(function() {nodeHover(302);}, function() {nodeUnhover(302);}); 
b[303].hover(function() {nodeHover(303);}, function() {nodeUnhover(303);}); 
b[304].hover(function() {nodeHover(304);}, function() {nodeUnhover(304);}); 
b[305].hover(function() {nodeHover(305);}, function() {nodeUnhover(305);}); 
b[306].hover(function() {nodeHover(306);}, function() {nodeUnhover(306);}); 
b[307].hover(function() {nodeHover(307);}, function() {nodeUnhover(307);}); 
b[308].hover(function() {nodeHover(308);}, function() {nodeUnhover(308);}); 
b[309].hover(function() {nodeHover(309);}, function() {nodeUnhover(309);}); 
b[310].hover(function() {nodeHover(310);}, function() {nodeUnhover(310);}); 
b[311].hover(function() {nodeHover(311);}, function() {nodeUnhover(311);}); 
b[312].hover(function() {nodeHover(312);}, function() {nodeUnhover(312);}); 
b[313].hover(function() {nodeHover(313);}, function() {nodeUnhover(313);}); 
b[314].hover(function() {nodeHover(314);}, function() {nodeUnhover(314);}); 
b[315].hover(function() {nodeHover(315);}, function() {nodeUnhover(315);}); 
b[316].hover(function() {nodeHover(316);}, function() {nodeUnhover(316);}); 
b[317].hover(function() {nodeHover(317);}, function() {nodeUnhover(317);}); 
b[318].hover(function() {nodeHover(318);}, function() {nodeUnhover(318);}); 
b[319].hover(function() {nodeHover(319);}, function() {nodeUnhover(319);}); 
b[320].hover(function() {nodeHover(320);}, function() {nodeUnhover(320);}); 
b[321].hover(function() {nodeHover(321);}, function() {nodeUnhover(321);}); 
b[322].hover(function() {nodeHover(322);}, function() {nodeUnhover(322);}); 
b[323].hover(function() {nodeHover(323);}, function() {nodeUnhover(323);}); 
b[324].hover(function() {nodeHover(324);}, function() {nodeUnhover(324);}); 
b[325].hover(function() {nodeHover(325);}, function() {nodeUnhover(325);}); 
b[326].hover(function() {nodeHover(326);}, function() {nodeUnhover(326);}); 
b[327].hover(function() {nodeHover(327);}, function() {nodeUnhover(327);}); 
b[328].hover(function() {nodeHover(328);}, function() {nodeUnhover(328);}); 
b[329].hover(function() {nodeHover(329);}, function() {nodeUnhover(329);}); 
b[330].hover(function() {nodeHover(330);}, function() {nodeUnhover(330);}); 
b[331].hover(function() {nodeHover(331);}, function() {nodeUnhover(331);}); 
b[332].hover(function() {nodeHover(332);}, function() {nodeUnhover(332);}); 
b[333].hover(function() {nodeHover(333);}, function() {nodeUnhover(333);}); 
b[334].hover(function() {nodeHover(334);}, function() {nodeUnhover(334);}); 
b[335].hover(function() {nodeHover(335);}, function() {nodeUnhover(335);}); 
b[336].hover(function() {nodeHover(336);}, function() {nodeUnhover(336);}); 
b[337].hover(function() {nodeHover(337);}, function() {nodeUnhover(337);}); 
b[338].hover(function() {nodeHover(338);}, function() {nodeUnhover(338);}); 
b[339].hover(function() {nodeHover(339);}, function() {nodeUnhover(339);}); 
b[340].hover(function() {nodeHover(340);}, function() {nodeUnhover(340);}); 
b[341].hover(function() {nodeHover(341);}, function() {nodeUnhover(341);}); 
b[342].hover(function() {nodeHover(342);}, function() {nodeUnhover(342);}); 
b[343].hover(function() {nodeHover(343);}, function() {nodeUnhover(343);}); 
b[344].hover(function() {nodeHover(344);}, function() {nodeUnhover(344);}); 
b[345].hover(function() {nodeHover(345);}, function() {nodeUnhover(345);}); 
b[346].hover(function() {nodeHover(346);}, function() {nodeUnhover(346);}); 
b[347].hover(function() {nodeHover(347);}, function() {nodeUnhover(347);}); 
b[348].hover(function() {nodeHover(348);}, function() {nodeUnhover(348);}); 
b[349].hover(function() {nodeHover(349);}, function() {nodeUnhover(349);}); 
b[350].hover(function() {nodeHover(350);}, function() {nodeUnhover(350);}); 
b[351].hover(function() {nodeHover(351);}, function() {nodeUnhover(351);}); 
b[352].hover(function() {nodeHover(352);}, function() {nodeUnhover(352);}); 
b[353].hover(function() {nodeHover(353);}, function() {nodeUnhover(353);}); 
b[354].hover(function() {nodeHover(354);}, function() {nodeUnhover(354);}); 
b[355].hover(function() {nodeHover(355);}, function() {nodeUnhover(355);}); 
b[356].hover(function() {nodeHover(356);}, function() {nodeUnhover(356);}); 
b[357].hover(function() {nodeHover(357);}, function() {nodeUnhover(357);}); 
b[358].hover(function() {nodeHover(358);}, function() {nodeUnhover(358);}); 
b[359].hover(function() {nodeHover(359);}, function() {nodeUnhover(359);}); 
b[360].hover(function() {nodeHover(360);}, function() {nodeUnhover(360);}); 
b[361].hover(function() {nodeHover(361);}, function() {nodeUnhover(361);}); 
b[362].hover(function() {nodeHover(362);}, function() {nodeUnhover(362);}); 
b[363].hover(function() {nodeHover(363);}, function() {nodeUnhover(363);}); 
b[364].hover(function() {nodeHover(364);}, function() {nodeUnhover(364);}); 
b[365].hover(function() {nodeHover(365);}, function() {nodeUnhover(365);}); 
b[366].hover(function() {nodeHover(366);}, function() {nodeUnhover(366);}); 
b[367].hover(function() {nodeHover(367);}, function() {nodeUnhover(367);}); 
b[368].hover(function() {nodeHover(368);}, function() {nodeUnhover(368);}); 
b[369].hover(function() {nodeHover(369);}, function() {nodeUnhover(369);}); 
b[370].hover(function() {nodeHover(370);}, function() {nodeUnhover(370);}); 
b[371].hover(function() {nodeHover(371);}, function() {nodeUnhover(371);}); 
b[372].hover(function() {nodeHover(372);}, function() {nodeUnhover(372);}); 
b[373].hover(function() {nodeHover(373);}, function() {nodeUnhover(373);}); 
b[374].hover(function() {nodeHover(374);}, function() {nodeUnhover(374);}); 
b[375].hover(function() {nodeHover(375);}, function() {nodeUnhover(375);}); 
b[376].hover(function() {nodeHover(376);}, function() {nodeUnhover(376);}); 
b[377].hover(function() {nodeHover(377);}, function() {nodeUnhover(377);}); 
b[378].hover(function() {nodeHover(378);}, function() {nodeUnhover(378);}); 
b[379].hover(function() {nodeHover(379);}, function() {nodeUnhover(379);}); 
b[380].hover(function() {nodeHover(380);}, function() {nodeUnhover(380);}); 
b[381].hover(function() {nodeHover(381);}, function() {nodeUnhover(381);}); 
b[382].hover(function() {nodeHover(382);}, function() {nodeUnhover(382);}); 
b[383].hover(function() {nodeHover(383);}, function() {nodeUnhover(383);}); 
b[384].hover(function() {nodeHover(384);}, function() {nodeUnhover(384);}); 
b[385].hover(function() {nodeHover(385);}, function() {nodeUnhover(385);}); 
b[386].hover(function() {nodeHover(386);}, function() {nodeUnhover(386);}); 
b[387].hover(function() {nodeHover(387);}, function() {nodeUnhover(387);}); 
b[388].hover(function() {nodeHover(388);}, function() {nodeUnhover(388);}); 
b[389].hover(function() {nodeHover(389);}, function() {nodeUnhover(389);}); 
b[390].hover(function() {nodeHover(390);}, function() {nodeUnhover(390);}); 
b[391].hover(function() {nodeHover(391);}, function() {nodeUnhover(391);}); 
b[392].hover(function() {nodeHover(392);}, function() {nodeUnhover(392);}); 
b[393].hover(function() {nodeHover(393);}, function() {nodeUnhover(393);}); 
b[394].hover(function() {nodeHover(394);}, function() {nodeUnhover(394);}); 
b[395].hover(function() {nodeHover(395);}, function() {nodeUnhover(395);}); 
b[396].hover(function() {nodeHover(396);}, function() {nodeUnhover(396);}); 
b[397].hover(function() {nodeHover(397);}, function() {nodeUnhover(397);}); 
b[398].hover(function() {nodeHover(398);}, function() {nodeUnhover(398);}); 
b[399].hover(function() {nodeHover(399);}, function() {nodeUnhover(399);}); 
b[400].hover(function() {nodeHover(400);}, function() {nodeUnhover(400);}); 
b[401].hover(function() {nodeHover(401);}, function() {nodeUnhover(401);}); 
b[402].hover(function() {nodeHover(402);}, function() {nodeUnhover(402);}); 
b[403].hover(function() {nodeHover(403);}, function() {nodeUnhover(403);}); 
b[404].hover(function() {nodeHover(404);}, function() {nodeUnhover(404);}); 
b[405].hover(function() {nodeHover(405);}, function() {nodeUnhover(405);}); 
b[406].hover(function() {nodeHover(406);}, function() {nodeUnhover(406);}); 
b[407].hover(function() {nodeHover(407);}, function() {nodeUnhover(407);}); 
b[408].hover(function() {nodeHover(408);}, function() {nodeUnhover(408);}); 
b[409].hover(function() {nodeHover(409);}, function() {nodeUnhover(409);}); 
b[410].hover(function() {nodeHover(410);}, function() {nodeUnhover(410);}); 
b[411].hover(function() {nodeHover(411);}, function() {nodeUnhover(411);}); 
b[412].hover(function() {nodeHover(412);}, function() {nodeUnhover(412);}); 
b[413].hover(function() {nodeHover(413);}, function() {nodeUnhover(413);}); 
b[414].hover(function() {nodeHover(414);}, function() {nodeUnhover(414);}); 
b[415].hover(function() {nodeHover(415);}, function() {nodeUnhover(415);}); 
b[416].hover(function() {nodeHover(416);}, function() {nodeUnhover(416);}); 
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
mid=bb[3]+(bt[59]-bb[3])/2; 
s2='M '+nx[3]+' '+bb[3]+' L '+nx[3]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[396]+' '+mid+' L '+nx[396]+' '+bt[396];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[0]=paper.setFinish(); 
lineNodes[0]=[3,396]; 

paper.setStart(); 
mid=bb[3]+(bt[59]-bb[3])/2; 
hleft = nx[120]; 
hright = nx[3]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[120]+' '+mid+' L '+nx[120]+' '+bt[120];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[1]=paper.setFinish(); 
lineNodes[1]=[3,120]; 

paper.setStart(); 
mid=bb[3]+(bt[59]-bb[3])/2; 
hleft = nx[59]; 
hright = nx[3]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[59]+' '+mid+' L '+nx[59]+' '+bt[59];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[2]=paper.setFinish(); 
lineNodes[2]=[3,59]; 

paper.setStart(); 
s1='M '+nx[4]+' '+bb[4]+' L '+nx[4]+' '+bt[242]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[3]=paper.setFinish(); 
lineNodes[3]=[4,242] ; 

paper.setStart(); 
s1='M '+nx[5]+' '+bb[5]+' L '+nx[5]+' '+ny[431]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[4]=paper.setFinish(); 
lineNodes[4]=[5,431]; 

paper.setStart(); 
s1='M '+nx[6]+' '+bb[6]+' L '+nx[6]+' '+bt[62]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[5]=paper.setFinish(); 
lineNodes[5]=[6,62] ; 

paper.setStart(); 
mid=bb[7]+(bt[244]-bb[7])/2; 
hleft = nx[203]; 
hright = nx[7]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[7]+' '+bb[7]+' L '+nx[7]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[203]+' '+mid+' L '+nx[203]+' '+bt[203];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[6]=paper.setFinish(); 
lineNodes[6]=[7,203]; 

paper.setStart(); 
mid=bb[7]+(bt[244]-bb[7])/2; 
hleft = nx[74]; 
hright = nx[7]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[74]+' '+mid+' L '+nx[74]+' '+bt[74];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[7]=paper.setFinish(); 
lineNodes[7]=[7,74]; 

paper.setStart(); 
mid=bb[7]+(bt[244]-bb[7])/2; 
s3='M '+nx[244]+' '+mid+' L '+nx[244]+' '+bt[244];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[8]=paper.setFinish(); 
lineNodes[8]=[7,244]; 

paper.setStart(); 
mid=bb[8]+(bt[315]-bb[8])/2; 
hleft = nx[315]; 
hright = nx[8]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[8]+' '+bb[8]+' L '+nx[8]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[315]+' '+mid+' L '+nx[315]+' '+bt[315];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[9]=paper.setFinish(); 
lineNodes[9]=[8,315]; 

paper.setStart(); 
mid=bb[8]+(bt[315]-bb[8])/2; 
hleft = nx[215]; 
hright = nx[8]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[215]+' '+mid+' L '+nx[215]+' '+bt[215];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[10]=paper.setFinish(); 
lineNodes[10]=[8,215]; 

paper.setStart(); 
mid=bb[8]+(bt[315]-bb[8])/2; 
s3='M '+nx[104]+' '+mid+' L '+nx[104]+' '+bt[104];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[11]=paper.setFinish(); 
lineNodes[11]=[8,104]; 

paper.setStart(); 
mid=bb[9]+(bt[307]-bb[9])/2; 
s2='M '+nx[9]+' '+bb[9]+' L '+nx[9]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[241]+' '+mid+' L '+nx[241]+' '+bt[241];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[12]=paper.setFinish(); 
lineNodes[12]=[9,241]; 

paper.setStart(); 
mid=bb[9]+(bt[307]-bb[9])/2; 
hleft = nx[307]; 
hright = nx[9]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[307]+' '+mid+' L '+nx[307]+' '+bt[307];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[13]=paper.setFinish(); 
lineNodes[13]=[9,307]; 

paper.setStart(); 
mid=bb[9]+(bt[307]-bb[9])/2; 
hleft = nx[148]; 
hright = nx[9]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[148]+' '+mid+' L '+nx[148]+' '+bt[148];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[14]=paper.setFinish(); 
lineNodes[14]=[9,148]; 

paper.setStart(); 
mid=bb[10]+(bt[19]-bb[10])/2; 
hleft = nx[13]; 
hright = nx[10]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[10]+' '+bb[10]+' L '+nx[10]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[13]+' '+mid+' L '+nx[13]+' '+bt[13];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[15]=paper.setFinish(); 
lineNodes[15]=[10,13]; 

paper.setStart(); 
mid=bb[10]+(bt[19]-bb[10])/2; 
hleft = nx[19]; 
hright = nx[10]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[19]+' '+mid+' L '+nx[19]+' '+bt[19];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[16]=paper.setFinish(); 
lineNodes[16]=[10,19]; 

paper.setStart(); 
mid=bb[12]+(bt[230]-bb[12])/2; 
s2='M '+nx[12]+' '+bb[12]+' L '+nx[12]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[190]+' '+mid+' L '+nx[190]+' '+bt[190];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[17]=paper.setFinish(); 
lineNodes[17]=[12,190]; 

paper.setStart(); 
mid=bb[12]+(bt[230]-bb[12])/2; 
hleft = nx[200]; 
hright = nx[12]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[200]+' '+mid+' L '+nx[200]+' '+bt[200];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[18]=paper.setFinish(); 
lineNodes[18]=[12,200]; 

paper.setStart(); 
mid=bb[12]+(bt[230]-bb[12])/2; 
hleft = nx[296]; 
hright = nx[12]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[296]+' '+mid+' L '+nx[296]+' '+bt[296];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[19]=paper.setFinish(); 
lineNodes[19]=[12,296]; 

paper.setStart(); 
mid=bb[12]+(bt[230]-bb[12])/2; 
s3='M '+nx[230]+' '+mid+' L '+nx[230]+' '+bt[230];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[20]=paper.setFinish(); 
lineNodes[20]=[12,230]; 

paper.setStart(); 
s1='M '+nx[13]+' '+bb[13]+' L '+nx[13]+' '+bt[261]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[21]=paper.setFinish(); 
lineNodes[21]=[13,261] ; 

paper.setStart(); 
s1='M '+nx[14]+' '+bb[14]+' L '+nx[14]+' '+bt[403]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[22]=paper.setFinish(); 
lineNodes[22]=[14,403] ; 

paper.setStart(); 
s1='M '+nx[15]+' '+bb[15]+' L '+nx[15]+' '+bt[151]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[23]=paper.setFinish(); 
lineNodes[23]=[15,151] ; 

paper.setStart(); 
s1='M '+nx[16]+' '+bb[16]+' L '+nx[16]+' '+ny[438]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[24]=paper.setFinish(); 
lineNodes[24]=[16,438]; 

paper.setStart(); 
mid=bb[18]+(bt[80]-bb[18])/2; 
hleft = nx[197]; 
hright = nx[18]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[18]+' '+bb[18]+' L '+nx[18]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[197]+' '+mid+' L '+nx[197]+' '+bt[197];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[25]=paper.setFinish(); 
lineNodes[25]=[18,197]; 

paper.setStart(); 
mid=bb[18]+(bt[80]-bb[18])/2; 
hleft = nx[80]; 
hright = nx[18]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[80]+' '+mid+' L '+nx[80]+' '+bt[80];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[26]=paper.setFinish(); 
lineNodes[26]=[18,80]; 

paper.setStart(); 
s1='M '+nx[19]+' '+bb[19]+' L '+nx[19]+' '+bt[245]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[27]=paper.setFinish(); 
lineNodes[27]=[19,245] ; 

paper.setStart(); 
s1='M '+nx[20]+' '+bb[20]+' L '+nx[20]+' '+ny[429]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[28]=paper.setFinish(); 
lineNodes[28]=[20,429]; 

paper.setStart(); 
mid=bb[21]+(bt[368]-bb[21])/2; 
hleft = nx[368]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[21]+' '+bb[21]+' L '+nx[21]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[368]+' '+mid+' L '+nx[368]+' '+bt[368];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[29]=paper.setFinish(); 
lineNodes[29]=[21,368]; 

paper.setStart(); 
mid=bb[21]+(bt[368]-bb[21])/2; 
hleft = nx[113]; 
hright = nx[21]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[113]+' '+mid+' L '+nx[113]+' '+bt[113];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[30]=paper.setFinish(); 
lineNodes[30]=[21,113]; 

paper.setStart(); 
s1='M '+nx[23]+' '+bb[23]+' L '+nx[23]+' '+bt[323]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[31]=paper.setFinish(); 
lineNodes[31]=[23,323] ; 

paper.setStart(); 
s1='M '+nx[25]+' '+bb[25]+' L '+nx[25]+' '+ny[442]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[32]=paper.setFinish(); 
lineNodes[32]=[25,442]; 

paper.setStart(); 
s1='M '+nx[29]+' '+bb[29]+' L '+nx[29]+' '+ny[420]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[33]=paper.setFinish(); 
lineNodes[33]=[29,420]; 

paper.setStart(); 
s1='M '+nx[31]+' '+bb[31]+' L '+nx[31]+' '+bt[348]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[34]=paper.setFinish(); 
lineNodes[34]=[31,348] ; 

paper.setStart(); 
mid=bb[32]+(bt[50]-bb[32])/2; 
hleft = nx[50]; 
hright = nx[32]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[32]+' '+bb[32]+' L '+nx[32]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[50]+' '+mid+' L '+nx[50]+' '+bt[50];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[35]=paper.setFinish(); 
lineNodes[35]=[32,50]; 

paper.setStart(); 
mid=bb[32]+(bt[50]-bb[32])/2; 
hleft = nx[52]; 
hright = nx[32]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[52]+' '+mid+' L '+nx[52]+' '+bt[52];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[36]=paper.setFinish(); 
lineNodes[36]=[32,52]; 

paper.setStart(); 
mid=bb[32]+(bt[50]-bb[32])/2; 
s3='M '+nx[35]+' '+mid+' L '+nx[35]+' '+bt[35];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[37]=paper.setFinish(); 
lineNodes[37]=[32,35]; 

paper.setStart(); 
s1='M '+nx[33]+' '+bb[33]+' L '+nx[33]+' '+bt[108]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[38]=paper.setFinish(); 
lineNodes[38]=[33,108] ; 

paper.setStart(); 
mid=bb[36]+(bt[343]-bb[36])/2; 
hleft = nx[343]; 
hright = nx[36]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[36]+' '+bb[36]+' L '+nx[36]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[343]+' '+mid+' L '+nx[343]+' '+bt[343];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[39]=paper.setFinish(); 
lineNodes[39]=[36,343]; 

paper.setStart(); 
mid=bb[36]+(bt[343]-bb[36])/2; 
hleft = nx[5]; 
hright = nx[36]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[5]+' '+mid+' L '+nx[5]+' '+bt[5];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[40]=paper.setFinish(); 
lineNodes[40]=[36,5]; 

paper.setStart(); 
s1='M '+nx[37]+' '+bb[37]+' L '+nx[37]+' '+bt[220]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[41]=paper.setFinish(); 
lineNodes[41]=[37,220] ; 

paper.setStart(); 
s1='M '+nx[39]+' '+bb[39]+' L '+nx[39]+' '+bt[269]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[42]=paper.setFinish(); 
lineNodes[42]=[39,269] ; 

paper.setStart(); 
mid=bb[40]+(bt[24]-bb[40])/2; 
hleft = nx[87]; 
hright = nx[40]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[40]+' '+bb[40]+' L '+nx[40]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[87]+' '+mid+' L '+nx[87]+' '+bt[87];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[43]=paper.setFinish(); 
lineNodes[43]=[40,87]; 

paper.setStart(); 
mid=bb[40]+(bt[24]-bb[40])/2; 
hleft = nx[24]; 
hright = nx[40]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[24]+' '+mid+' L '+nx[24]+' '+bt[24];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[44]=paper.setFinish(); 
lineNodes[44]=[40,24]; 

paper.setStart(); 
s1='M '+nx[41]+' '+bb[41]+' L '+nx[41]+' '+bt[398]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[45]=paper.setFinish(); 
lineNodes[45]=[41,398] ; 

paper.setStart(); 
s1='M '+nx[42]+' '+bb[42]+' L '+nx[42]+' '+ny[430]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[46]=paper.setFinish(); 
lineNodes[46]=[42,430]; 

paper.setStart(); 
mid=bb[46]+(bt[252]-bb[46])/2; 
s2='M '+nx[46]+' '+bb[46]+' L '+nx[46]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[393]+' '+mid+' L '+nx[393]+' '+bt[393];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[47]=paper.setFinish(); 
lineNodes[47]=[46,393]; 

paper.setStart(); 
mid=bb[46]+(bt[252]-bb[46])/2; 
hleft = nx[240]; 
hright = nx[46]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[240]+' '+mid+' L '+nx[240]+' '+bt[240];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[48]=paper.setFinish(); 
lineNodes[48]=[46,240]; 

paper.setStart(); 
mid=bb[46]+(bt[252]-bb[46])/2; 
hleft = nx[252]; 
hright = nx[46]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[252]+' '+mid+' L '+nx[252]+' '+bt[252];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[49]=paper.setFinish(); 
lineNodes[49]=[46,252]; 

paper.setStart(); 
mid=bb[47]+(bt[229]-bb[47])/2; 
hleft = nx[229]; 
hright = nx[47]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[47]+' '+bb[47]+' L '+nx[47]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[229]+' '+mid+' L '+nx[229]+' '+bt[229];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[50]=paper.setFinish(); 
lineNodes[50]=[47,229]; 

paper.setStart(); 
mid=bb[47]+(bt[229]-bb[47])/2; 
hleft = nx[143]; 
hright = nx[47]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[143]+' '+mid+' L '+nx[143]+' '+bt[143];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[51]=paper.setFinish(); 
lineNodes[51]=[47,143]; 

paper.setStart(); 
s1='M '+nx[48]+' '+bb[48]+' L '+nx[48]+' '+bt[308]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[52]=paper.setFinish(); 
lineNodes[52]=[48,308] ; 

paper.setStart(); 
s1='M '+nx[49]+' '+bb[49]+' L '+nx[49]+' '+bt[363]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[53]=paper.setFinish(); 
lineNodes[53]=[49,363] ; 

paper.setStart(); 
s1='M '+nx[53]+' '+bb[53]+' L '+nx[53]+' '+ny[440]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[54]=paper.setFinish(); 
lineNodes[54]=[53,440]; 

paper.setStart(); 
mid=bb[54]+(bt[15]-bb[54])/2; 
hleft = nx[15]; 
hright = nx[54]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[54]+' '+bb[54]+' L '+nx[54]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[15]+' '+mid+' L '+nx[15]+' '+bt[15];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[55]=paper.setFinish(); 
lineNodes[55]=[54,15]; 

paper.setStart(); 
mid=bb[54]+(bt[15]-bb[54])/2; 
hleft = nx[247]; 
hright = nx[54]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[247]+' '+mid+' L '+nx[247]+' '+bt[247];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[56]=paper.setFinish(); 
lineNodes[56]=[54,247]; 

paper.setStart(); 
s1='M '+nx[55]+' '+bb[55]+' L '+nx[55]+' '+ny[437]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[57]=paper.setFinish(); 
lineNodes[57]=[55,437]; 

paper.setStart(); 
s1='M '+nx[57]+' '+bb[57]+' L '+nx[57]+' '+ny[435]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[58]=paper.setFinish(); 
lineNodes[58]=[57,435]; 

paper.setStart(); 
s1='M '+nx[58]+' '+bb[58]+' L '+nx[58]+' '+ny[435]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[59]=paper.setFinish(); 
lineNodes[59]=[58,435]; 

paper.setStart(); 
mid=bb[60]+(bt[407]-bb[60])/2; 
hleft = nx[223]; 
hright = nx[60]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[60]+' '+bb[60]+' L '+nx[60]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[223]+' '+mid+' L '+nx[223]+' '+bt[223];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[60]=paper.setFinish(); 
lineNodes[60]=[60,223]; 

paper.setStart(); 
mid=bb[60]+(bt[407]-bb[60])/2; 
hleft = nx[407]; 
hright = nx[60]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[407]+' '+mid+' L '+nx[407]+' '+bt[407];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[61]=paper.setFinish(); 
lineNodes[61]=[60,407]; 

paper.setStart(); 
s1='M '+nx[61]+' '+bb[61]+' L '+nx[61]+' '+ny[440]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[62]=paper.setFinish(); 
lineNodes[62]=[61,440]; 

paper.setStart(); 
s1='M '+nx[62]+' '+bb[62]+' L '+nx[62]+' '+bt[364]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[63]=paper.setFinish(); 
lineNodes[63]=[62,364] ; 

paper.setStart(); 
mid=bb[64]+(bt[187]-bb[64])/2; 
hleft = nx[49]; 
hright = nx[64]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[64]+' '+bb[64]+' L '+nx[64]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[49]+' '+mid+' L '+nx[49]+' '+bt[49];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[64]=paper.setFinish(); 
lineNodes[64]=[64,49]; 

paper.setStart(); 
mid=bb[64]+(bt[187]-bb[64])/2; 
hleft = nx[187]; 
hright = nx[64]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[187]+' '+mid+' L '+nx[187]+' '+bt[187];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[65]=paper.setFinish(); 
lineNodes[65]=[64,187]; 

paper.setStart(); 
s1='M '+nx[65]+' '+bb[65]+' L '+nx[65]+' '+ny[423]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[65]+' '+ny[423]+' L '+nx[75]+' '+ny[423]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[66]=paper.setFinish(); 
lineNodes[66]=[65,423]; 

paper.setStart(); 
s1='M '+nx[66]+' '+bb[66]+' L '+nx[66]+' '+ny[420]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[66]+' '+ny[420]+' L '+nx[313]+' '+ny[420]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[67]=paper.setFinish(); 
lineNodes[67]=[66,420]; 

paper.setStart(); 
s1='M '+nx[67]+' '+bb[67]+' L '+nx[67]+' '+bt[360]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[68]=paper.setFinish(); 
lineNodes[68]=[67,360] ; 

paper.setStart(); 
mid=bb[68]+(bt[72]-bb[68])/2; 
hleft = nx[319]; 
hright = nx[68]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[68]+' '+bb[68]+' L '+nx[68]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[319]+' '+mid+' L '+nx[319]+' '+bt[319];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[69]=paper.setFinish(); 
lineNodes[69]=[68,319]; 

paper.setStart(); 
mid=bb[68]+(bt[72]-bb[68])/2; 
hleft = nx[72]; 
hright = nx[68]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[72]+' '+mid+' L '+nx[72]+' '+bt[72];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[70]=paper.setFinish(); 
lineNodes[70]=[68,72]; 

paper.setStart(); 
s1='M '+nx[72]+' '+bb[72]+' L '+nx[72]+' '+bt[354]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[71]=paper.setFinish(); 
lineNodes[71]=[72,354] ; 

paper.setStart(); 
s1='M '+nx[74]+' '+bb[74]+' L '+nx[74]+' '+ny[425]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[74]+' '+ny[425]+' L '+nx[203]+' '+ny[425]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[72]=paper.setFinish(); 
lineNodes[72]=[74,425]; 

paper.setStart(); 
s1='M '+nx[75]+' '+bb[75]+' L '+nx[75]+' '+ny[423]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[73]=paper.setFinish(); 
lineNodes[73]=[75,423]; 

paper.setStart(); 
mid=bb[76]+(bt[9]-bb[76])/2; 
hleft = nx[94]; 
hright = nx[76]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[76]+' '+bb[76]+' L '+nx[76]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[94]+' '+mid+' L '+nx[94]+' '+bt[94];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[74]=paper.setFinish(); 
lineNodes[74]=[76,94]; 

paper.setStart(); 
mid=bb[76]+(bt[9]-bb[76])/2; 
s3='M '+nx[394]+' '+mid+' L '+nx[394]+' '+bt[394];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[75]=paper.setFinish(); 
lineNodes[75]=[76,394]; 

paper.setStart(); 
mid=bb[76]+(bt[9]-bb[76])/2; 
hleft = nx[9]; 
hright = nx[76]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[9]+' '+mid+' L '+nx[9]+' '+bt[9];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[76]=paper.setFinish(); 
lineNodes[76]=[76,9]; 

paper.setStart(); 
mid=bb[76]+(bt[9]-bb[76])/2; 
s3='M '+nx[158]+' '+mid+' L '+nx[158]+' '+bt[158];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[77]=paper.setFinish(); 
lineNodes[77]=[76,158]; 

paper.setStart(); 
s1='M '+nx[78]+' '+bb[78]+' L '+nx[78]+' '+ny[440]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[78]+' '+ny[440]+' L '+nx[61]+' '+ny[440]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[78]=paper.setFinish(); 
lineNodes[78]=[78,440]; 

paper.setStart(); 
mid=bb[82]+(bt[228]-bb[82])/2; 
s2='M '+nx[82]+' '+bb[82]+' L '+nx[82]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[399]+' '+mid+' L '+nx[399]+' '+bt[399];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[79]=paper.setFinish(); 
lineNodes[79]=[82,399]; 

paper.setStart(); 
mid=bb[82]+(bt[228]-bb[82])/2; 
hleft = nx[295]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[295]+' '+mid+' L '+nx[295]+' '+bt[295];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[80]=paper.setFinish(); 
lineNodes[80]=[82,295]; 

paper.setStart(); 
mid=bb[82]+(bt[228]-bb[82])/2; 
hleft = nx[228]; 
hright = nx[82]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[228]+' '+mid+' L '+nx[228]+' '+bt[228];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[81]=paper.setFinish(); 
lineNodes[81]=[82,228]; 

paper.setStart(); 
mid=bb[84]+(bt[411]-bb[84])/2; 
hleft = nx[267]; 
hright = nx[84]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[84]+' '+bb[84]+' L '+nx[84]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[267]+' '+mid+' L '+nx[267]+' '+bt[267];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[82]=paper.setFinish(); 
lineNodes[82]=[84,267]; 

paper.setStart(); 
mid=bb[84]+(bt[411]-bb[84])/2; 
s3='M '+nx[411]+' '+mid+' L '+nx[411]+' '+bt[411];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[83]=paper.setFinish(); 
lineNodes[83]=[84,411]; 

paper.setStart(); 
mid=bb[84]+(bt[411]-bb[84])/2; 
hleft = nx[284]; 
hright = nx[84]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[284]+' '+mid+' L '+nx[284]+' '+bt[284];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[84]=paper.setFinish(); 
lineNodes[84]=[84,284]; 

paper.setStart(); 
s1='M '+nx[85]+' '+bb[85]+' L '+nx[85]+' '+bt[387]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[85]=paper.setFinish(); 
lineNodes[85]=[85,387] ; 

paper.setStart(); 
s1='M '+nx[86]+' '+bb[86]+' L '+nx[86]+' '+ny[443]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[86]+' '+ny[443]+' L '+nx[350]+' '+ny[443]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[86]=paper.setFinish(); 
lineNodes[86]=[86,443]; 

paper.setStart(); 
s1='M '+nx[87]+' '+bb[87]+' L '+nx[87]+' '+bt[246]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[87]=paper.setFinish(); 
lineNodes[87]=[87,246] ; 

paper.setStart(); 
s1='M '+nx[89]+' '+bb[89]+' L '+nx[89]+' '+ny[426]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[88]=paper.setFinish(); 
lineNodes[88]=[89,426]; 

paper.setStart(); 
s1='M '+nx[90]+' '+bb[90]+' L '+nx[90]+' '+bt[250]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[89]=paper.setFinish(); 
lineNodes[89]=[90,250] ; 

paper.setStart(); 
s1='M '+nx[93]+' '+bb[93]+' L '+nx[93]+' '+bt[339]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[90]=paper.setFinish(); 
lineNodes[90]=[93,339] ; 

paper.setStart(); 
s1='M '+nx[94]+' '+bb[94]+' L '+nx[94]+' '+bt[356]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[91]=paper.setFinish(); 
lineNodes[91]=[94,356] ; 

paper.setStart(); 
mid=bb[95]+(bt[159]-bb[95])/2; 
hleft = nx[53]; 
hright = nx[95]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[95]+' '+bb[95]+' L '+nx[95]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[53]+' '+mid+' L '+nx[53]+' '+bt[53];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[92]=paper.setFinish(); 
lineNodes[92]=[95,53]; 

paper.setStart(); 
mid=bb[95]+(bt[159]-bb[95])/2; 
hleft = nx[159]; 
hright = nx[95]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[159]+' '+mid+' L '+nx[159]+' '+bt[159];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[93]=paper.setFinish(); 
lineNodes[93]=[95,159]; 

paper.setStart(); 
s1='M '+nx[96]+' '+bb[96]+' L '+nx[96]+' '+ny[436]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[96]+' '+ny[436]+' L '+nx[304]+' '+ny[436]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[94]=paper.setFinish(); 
lineNodes[94]=[96,436]; 

paper.setStart(); 
mid=bb[99]+(bt[177]-bb[99])/2; 
s2='M '+nx[99]+' '+bb[99]+' L '+nx[99]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[177]+' '+mid+' L '+nx[177]+' '+bt[177];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[95]=paper.setFinish(); 
lineNodes[95]=[99,177]; 

paper.setStart(); 
mid=bb[99]+(bt[177]-bb[99])/2; 
hleft = nx[30]; 
hright = nx[99]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[30]+' '+mid+' L '+nx[30]+' '+bt[30];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[96]=paper.setFinish(); 
lineNodes[96]=[99,30]; 

paper.setStart(); 
mid=bb[99]+(bt[177]-bb[99])/2; 
s3='M '+nx[212]+' '+mid+' L '+nx[212]+' '+bt[212];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[97]=paper.setFinish(); 
lineNodes[97]=[99,212]; 

paper.setStart(); 
mid=bb[99]+(bt[177]-bb[99])/2; 
hleft = nx[131]; 
hright = nx[99]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[131]+' '+mid+' L '+nx[131]+' '+bt[131];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[98]=paper.setFinish(); 
lineNodes[98]=[99,131]; 

paper.setStart(); 
s1='M '+nx[100]+' '+bb[100]+' L '+nx[100]+' '+ny[430]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[100]+' '+ny[430]+' L '+nx[263]+' '+ny[430]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[99]=paper.setFinish(); 
lineNodes[99]=[100,430]; 

paper.setStart(); 
mid=bb[101]+(bt[357]-bb[101])/2; 
hleft = nx[136]; 
hright = nx[101]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[101]+' '+bb[101]+' L '+nx[101]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[136]+' '+mid+' L '+nx[136]+' '+bt[136];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[100]=paper.setFinish(); 
lineNodes[100]=[101,136]; 

paper.setStart(); 
mid=bb[101]+(bt[357]-bb[101])/2; 
hleft = nx[357]; 
hright = nx[101]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[357]+' '+mid+' L '+nx[357]+' '+bt[357];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[101]=paper.setFinish(); 
lineNodes[101]=[101,357]; 

paper.setStart(); 
mid=bb[101]+(bt[357]-bb[101])/2; 
s3='M '+nx[365]+' '+mid+' L '+nx[365]+' '+bt[365];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[102]=paper.setFinish(); 
lineNodes[102]=[101,365]; 

paper.setStart(); 
s1='M '+nx[105]+' '+bb[105]+' L '+nx[105]+' '+ny[432]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[103]=paper.setFinish(); 
lineNodes[103]=[105,432]; 

paper.setStart(); 
s1='M '+nx[106]+' '+bb[106]+' L '+nx[106]+' '+ny[430]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[104]=paper.setFinish(); 
lineNodes[104]=[106,430]; 

paper.setStart(); 
s1='M '+nx[107]+' '+bb[107]+' L '+nx[107]+' '+ny[421]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[105]=paper.setFinish(); 
lineNodes[105]=[107,421]; 

paper.setStart(); 
mid=bb[108]+(bt[415]-bb[108])/2; 
hleft = nx[415]; 
hright = nx[108]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[108]+' '+bb[108]+' L '+nx[108]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[415]+' '+mid+' L '+nx[415]+' '+bt[415];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[106]=paper.setFinish(); 
lineNodes[106]=[108,415]; 

paper.setStart(); 
mid=bb[108]+(bt[415]-bb[108])/2; 
hleft = nx[335]; 
hright = nx[108]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[335]+' '+mid+' L '+nx[335]+' '+bt[335];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[107]=paper.setFinish(); 
lineNodes[107]=[108,335]; 

paper.setStart(); 
mid=bb[109]+(bt[412]-bb[109])/2; 
hleft = nx[224]; 
hright = nx[109]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[109]+' '+bb[109]+' L '+nx[109]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[224]+' '+mid+' L '+nx[224]+' '+bt[224];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[108]=paper.setFinish(); 
lineNodes[108]=[109,224]; 

paper.setStart(); 
mid=bb[109]+(bt[412]-bb[109])/2; 
hleft = nx[293]; 
hright = nx[109]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[293]+' '+mid+' L '+nx[293]+' '+bt[293];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[109]=paper.setFinish(); 
lineNodes[109]=[109,293]; 

paper.setStart(); 
mid=bb[109]+(bt[412]-bb[109])/2; 
s3='M '+nx[412]+' '+mid+' L '+nx[412]+' '+bt[412];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[110]=paper.setFinish(); 
lineNodes[110]=[109,412]; 

paper.setStart(); 
s1='M '+nx[110]+' '+bb[110]+' L '+nx[110]+' '+ny[433]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[111]=paper.setFinish(); 
lineNodes[111]=[110,433]; 

paper.setStart(); 
s1='M '+nx[112]+' '+bb[112]+' L '+nx[112]+' '+ny[419]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[112]+' '+ny[419]+' L '+nx[117]+' '+ny[419]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[112]=paper.setFinish(); 
lineNodes[112]=[112,419]; 

paper.setStart(); 
s1='M '+nx[114]+' '+bb[114]+' L '+nx[114]+' '+ny[426]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[114]+' '+ny[426]+' L '+nx[89]+' '+ny[426]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[113]=paper.setFinish(); 
lineNodes[113]=[114,426]; 

paper.setStart(); 
mid=bb[115]+(bt[340]-bb[115])/2; 
s2='M '+nx[115]+' '+bb[115]+' L '+nx[115]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[408]+' '+mid+' L '+nx[408]+' '+bt[408];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[114]=paper.setFinish(); 
lineNodes[114]=[115,408]; 

paper.setStart(); 
mid=bb[115]+(bt[340]-bb[115])/2; 
hleft = nx[362]; 
hright = nx[115]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[362]+' '+mid+' L '+nx[362]+' '+bt[362];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[115]=paper.setFinish(); 
lineNodes[115]=[115,362]; 

paper.setStart(); 
mid=bb[115]+(bt[340]-bb[115])/2; 
hleft = nx[340]; 
hright = nx[115]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[340]+' '+mid+' L '+nx[340]+' '+bt[340];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[116]=paper.setFinish(); 
lineNodes[116]=[115,340]; 

paper.setStart(); 
mid=bb[116]+(bt[17]-bb[116])/2; 
hleft = nx[17]; 
hright = nx[116]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[116]+' '+bb[116]+' L '+nx[116]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[17]+' '+mid+' L '+nx[17]+' '+bt[17];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[117]=paper.setFinish(); 
lineNodes[117]=[116,17]; 

paper.setStart(); 
mid=bb[116]+(bt[17]-bb[116])/2; 
hleft = nx[373]; 
hright = nx[116]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[373]+' '+mid+' L '+nx[373]+' '+bt[373];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[118]=paper.setFinish(); 
lineNodes[118]=[116,373]; 

paper.setStart(); 
s1='M '+nx[117]+' '+bb[117]+' L '+nx[117]+' '+ny[419]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[119]=paper.setFinish(); 
lineNodes[119]=[117,419]; 

paper.setStart(); 
s1='M '+nx[118]+' '+bb[118]+' L '+nx[118]+' '+bt[410]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[120]=paper.setFinish(); 
lineNodes[120]=[118,410] ; 

paper.setStart(); 
mid=bb[119]+(bt[56]-bb[119])/2; 
s2='M '+nx[119]+' '+bb[119]+' L '+nx[119]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[318]+' '+mid+' L '+nx[318]+' '+bt[318];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[121]=paper.setFinish(); 
lineNodes[121]=[119,318]; 

paper.setStart(); 
mid=bb[119]+(bt[56]-bb[119])/2; 
s3='M '+nx[237]+' '+mid+' L '+nx[237]+' '+bt[237];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[122]=paper.setFinish(); 
lineNodes[122]=[119,237]; 

paper.setStart(); 
mid=bb[119]+(bt[56]-bb[119])/2; 
hleft = nx[69]; 
hright = nx[119]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[69]+' '+mid+' L '+nx[69]+' '+bt[69];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[123]=paper.setFinish(); 
lineNodes[123]=[119,69]; 

paper.setStart(); 
mid=bb[119]+(bt[56]-bb[119])/2; 
s3='M '+nx[56]+' '+mid+' L '+nx[56]+' '+bt[56];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[124]=paper.setFinish(); 
lineNodes[124]=[119,56]; 

paper.setStart(); 
mid=bb[119]+(bt[56]-bb[119])/2; 
s3='M '+nx[347]+' '+mid+' L '+nx[347]+' '+bt[347];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[125]=paper.setFinish(); 
lineNodes[125]=[119,347]; 

paper.setStart(); 
mid=bb[119]+(bt[56]-bb[119])/2; 
hleft = nx[391]; 
hright = nx[119]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[391]+' '+mid+' L '+nx[391]+' '+bt[391];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[126]=paper.setFinish(); 
lineNodes[126]=[119,391]; 

paper.setStart(); 
s1='M '+nx[123]+' '+bb[123]+' L '+nx[123]+' '+bt[18]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[127]=paper.setFinish(); 
lineNodes[127]=[123,18] ; 

paper.setStart(); 
mid=bb[124]+(bt[121]-bb[124])/2; 
hleft = nx[225]; 
hright = nx[124]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[124]+' '+bb[124]+' L '+nx[124]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[225]+' '+mid+' L '+nx[225]+' '+bt[225];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[128]=paper.setFinish(); 
lineNodes[128]=[124,225]; 

paper.setStart(); 
mid=bb[124]+(bt[121]-bb[124])/2; 
hleft = nx[121]; 
hright = nx[124]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[121]+' '+mid+' L '+nx[121]+' '+bt[121];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[129]=paper.setFinish(); 
lineNodes[129]=[124,121]; 

paper.setStart(); 
mid=bb[125]+(bt[173]-bb[125])/2; 
hleft = nx[263]; 
hright = nx[125]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[125]+' '+bb[125]+' L '+nx[125]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[263]+' '+mid+' L '+nx[263]+' '+bt[263];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[130]=paper.setFinish(); 
lineNodes[130]=[125,263]; 

paper.setStart(); 
mid=bb[125]+(bt[173]-bb[125])/2; 
s3='M '+nx[106]+' '+mid+' L '+nx[106]+' '+bt[106];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[131]=paper.setFinish(); 
lineNodes[131]=[125,106]; 

paper.setStart(); 
mid=bb[125]+(bt[173]-bb[125])/2; 
s3='M '+nx[42]+' '+mid+' L '+nx[42]+' '+bt[42];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[132]=paper.setFinish(); 
lineNodes[132]=[125,42]; 

paper.setStart(); 
mid=bb[125]+(bt[173]-bb[125])/2; 
s3='M '+nx[254]+' '+mid+' L '+nx[254]+' '+bt[254];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[133]=paper.setFinish(); 
lineNodes[133]=[125,254]; 

paper.setStart(); 
mid=bb[125]+(bt[173]-bb[125])/2; 
hleft = nx[173]; 
hright = nx[125]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[173]+' '+mid+' L '+nx[173]+' '+bt[173];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[134]=paper.setFinish(); 
lineNodes[134]=[125,173]; 

paper.setStart(); 
s1='M '+nx[126]+' '+bb[126]+' L '+nx[126]+' '+ny[429]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[135]=paper.setFinish(); 
lineNodes[135]=[126,429]; 

paper.setStart(); 
s1='M '+nx[127]+' '+bb[127]+' L '+nx[127]+' '+bt[388]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[136]=paper.setFinish(); 
lineNodes[136]=[127,388] ; 

paper.setStart(); 
mid=bb[129]+(bt[135]-bb[129])/2; 
hleft = nx[135]; 
hright = nx[129]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[129]+' '+bb[129]+' L '+nx[129]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[135]+' '+mid+' L '+nx[135]+' '+bt[135];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[137]=paper.setFinish(); 
lineNodes[137]=[129,135]; 

paper.setStart(); 
mid=bb[129]+(bt[135]-bb[129])/2; 
hleft = nx[260]; 
hright = nx[129]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[260]+' '+mid+' L '+nx[260]+' '+bt[260];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[138]=paper.setFinish(); 
lineNodes[138]=[129,260]; 

paper.setStart(); 
s1='M '+nx[130]+' '+bb[130]+' L '+nx[130]+' '+bt[1]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[139]=paper.setFinish(); 
lineNodes[139]=[130,1] ; 

paper.setStart(); 
s1='M '+nx[131]+' '+bb[131]+' L '+nx[131]+' '+bt[266]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[140]=paper.setFinish(); 
lineNodes[140]=[131,266] ; 

paper.setStart(); 
mid=bb[135]+(bt[358]-bb[135])/2; 
s2='M '+nx[135]+' '+bb[135]+' L '+nx[135]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[181]+' '+mid+' L '+nx[181]+' '+bt[181];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[141]=paper.setFinish(); 
lineNodes[141]=[135,181]; 

paper.setStart(); 
mid=bb[135]+(bt[358]-bb[135])/2; 
hleft = nx[358]; 
hright = nx[135]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[358]+' '+mid+' L '+nx[358]+' '+bt[358];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[142]=paper.setFinish(); 
lineNodes[142]=[135,358]; 

paper.setStart(); 
mid=bb[135]+(bt[358]-bb[135])/2; 
hleft = nx[271]; 
hright = nx[135]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[271]+' '+mid+' L '+nx[271]+' '+bt[271];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[143]=paper.setFinish(); 
lineNodes[143]=[135,271]; 

paper.setStart(); 
s1='M '+nx[136]+' '+bb[136]+' L '+nx[136]+' '+ny[428]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[144]=paper.setFinish(); 
lineNodes[144]=[136,428]; 

paper.setStart(); 
s1='M '+nx[137]+' '+bb[137]+' L '+nx[137]+' '+bt[193]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[145]=paper.setFinish(); 
lineNodes[145]=[137,193] ; 

paper.setStart(); 
mid=bb[138]+(bt[7]-bb[138])/2; 
hleft = nx[219]; 
hright = nx[138]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[138]+' '+bb[138]+' L '+nx[138]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[219]+' '+mid+' L '+nx[219]+' '+bt[219];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[146]=paper.setFinish(); 
lineNodes[146]=[138,219]; 

paper.setStart(); 
mid=bb[138]+(bt[7]-bb[138])/2; 
s3='M '+nx[146]+' '+mid+' L '+nx[146]+' '+bt[146];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[147]=paper.setFinish(); 
lineNodes[147]=[138,146]; 

paper.setStart(); 
mid=bb[138]+(bt[7]-bb[138])/2; 
s3='M '+nx[300]+' '+mid+' L '+nx[300]+' '+bt[300];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[148]=paper.setFinish(); 
lineNodes[148]=[138,300]; 

paper.setStart(); 
mid=bb[138]+(bt[7]-bb[138])/2; 
s3='M '+nx[268]+' '+mid+' L '+nx[268]+' '+bt[268];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[149]=paper.setFinish(); 
lineNodes[149]=[138,268]; 

paper.setStart(); 
mid=bb[138]+(bt[7]-bb[138])/2; 
hleft = nx[7]; 
hright = nx[138]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[7]+' '+mid+' L '+nx[7]+' '+bt[7];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[150]=paper.setFinish(); 
lineNodes[150]=[138,7]; 

paper.setStart(); 
s1='M '+nx[139]+' '+bb[139]+' L '+nx[139]+' '+bt[213]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[151]=paper.setFinish(); 
lineNodes[151]=[139,213] ; 

paper.setStart(); 
s1='M '+nx[140]+' '+bb[140]+' L '+nx[140]+' '+bt[81]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[152]=paper.setFinish(); 
lineNodes[152]=[140,81] ; 

paper.setStart(); 
s1='M '+nx[141]+' '+bb[141]+' L '+nx[141]+' '+bt[236]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[153]=paper.setFinish(); 
lineNodes[153]=[141,236] ; 

paper.setStart(); 
s1='M '+nx[142]+' '+bb[142]+' L '+nx[142]+' '+bt[127]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[154]=paper.setFinish(); 
lineNodes[154]=[142,127] ; 

paper.setStart(); 
s1='M '+nx[143]+' '+bb[143]+' L '+nx[143]+' '+bt[404]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[155]=paper.setFinish(); 
lineNodes[155]=[143,404] ; 

paper.setStart(); 
s1='M '+nx[144]+' '+bb[144]+' L '+nx[144]+' '+bt[251]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[156]=paper.setFinish(); 
lineNodes[156]=[144,251] ; 

paper.setStart(); 
s1='M '+nx[145]+' '+bb[145]+' L '+nx[145]+' '+bt[346]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[157]=paper.setFinish(); 
lineNodes[157]=[145,346] ; 

paper.setStart(); 
mid=bb[150]+(bt[350]-bb[150])/2; 
hleft = nx[86]; 
hright = nx[150]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[150]+' '+bb[150]+' L '+nx[150]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[86]+' '+mid+' L '+nx[86]+' '+bt[86];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[158]=paper.setFinish(); 
lineNodes[158]=[150,86]; 

paper.setStart(); 
mid=bb[150]+(bt[350]-bb[150])/2; 
hleft = nx[350]; 
hright = nx[150]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[350]+' '+mid+' L '+nx[350]+' '+bt[350];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[159]=paper.setFinish(); 
lineNodes[159]=[150,350]; 

paper.setStart(); 
s1='M '+nx[151]+' '+bb[151]+' L '+nx[151]+' '+bt[85]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[160]=paper.setFinish(); 
lineNodes[160]=[151,85] ; 

paper.setStart(); 
s1='M '+nx[152]+' '+bb[152]+' L '+nx[152]+' '+bt[54]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[161]=paper.setFinish(); 
lineNodes[161]=[152,54] ; 

paper.setStart(); 
s1='M '+nx[154]+' '+bb[154]+' L '+nx[154]+' '+bt[119]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[162]=paper.setFinish(); 
lineNodes[162]=[154,119] ; 

paper.setStart(); 
s1='M '+nx[155]+' '+bb[155]+' L '+nx[155]+' '+bt[99]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[163]=paper.setFinish(); 
lineNodes[163]=[155,99] ; 

paper.setStart(); 
s1='M '+nx[158]+' '+bb[158]+' L '+nx[158]+' '+bt[367]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[164]=paper.setFinish(); 
lineNodes[164]=[158,367] ; 

paper.setStart(); 
s1='M '+nx[159]+' '+bb[159]+' L '+nx[159]+' '+ny[440]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[165]=paper.setFinish(); 
lineNodes[165]=[159,440]; 

paper.setStart(); 
mid=bb[160]+(bt[235]-bb[160])/2; 
hleft = nx[123]; 
hright = nx[160]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[160]+' '+bb[160]+' L '+nx[160]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[123]+' '+mid+' L '+nx[123]+' '+bt[123];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[166]=paper.setFinish(); 
lineNodes[166]=[160,123]; 

paper.setStart(); 
mid=bb[160]+(bt[235]-bb[160])/2; 
hleft = nx[235]; 
hright = nx[160]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[235]+' '+mid+' L '+nx[235]+' '+bt[235];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[167]=paper.setFinish(); 
lineNodes[167]=[160,235]; 

paper.setStart(); 
s1='M '+nx[162]+' '+bb[162]+' L '+nx[162]+' '+ny[435]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[162]+' '+ny[435]+' L '+nx[57]+' '+ny[435]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[168]=paper.setFinish(); 
lineNodes[168]=[162,435]; 

paper.setStart(); 
s1='M '+nx[164]+' '+bb[164]+' L '+nx[164]+' '+bt[63]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[169]=paper.setFinish(); 
lineNodes[169]=[164,63] ; 

paper.setStart(); 
s1='M '+nx[165]+' '+bb[165]+' L '+nx[165]+' '+ny[417]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[170]=paper.setFinish(); 
lineNodes[170]=[165,417]; 

paper.setStart(); 
s1='M '+nx[167]+' '+bb[167]+' L '+nx[167]+' '+ny[419]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[171]=paper.setFinish(); 
lineNodes[171]=[167,419]; 

paper.setStart(); 
s1='M '+nx[168]+' '+bb[168]+' L '+nx[168]+' '+bt[128]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[172]=paper.setFinish(); 
lineNodes[172]=[168,128] ; 

paper.setStart(); 
s1='M '+nx[169]+' '+bb[169]+' L '+nx[169]+' '+bt[183]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[173]=paper.setFinish(); 
lineNodes[173]=[169,183] ; 

paper.setStart(); 
s1='M '+nx[170]+' '+bb[170]+' L '+nx[170]+' '+bt[371]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[174]=paper.setFinish(); 
lineNodes[174]=[170,371] ; 

paper.setStart(); 
mid=bb[171]+(bt[389]-bb[171])/2; 
hleft = nx[78]; 
hright = nx[171]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[171]+' '+bb[171]+' L '+nx[171]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[78]+' '+mid+' L '+nx[78]+' '+bt[78];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[175]=paper.setFinish(); 
lineNodes[175]=[171,78]; 

paper.setStart(); 
mid=bb[171]+(bt[389]-bb[171])/2; 
hleft = nx[389]; 
hright = nx[171]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[389]+' '+mid+' L '+nx[389]+' '+bt[389];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[176]=paper.setFinish(); 
lineNodes[176]=[171,389]; 

paper.setStart(); 
s1='M '+nx[173]+' '+bb[173]+' L '+nx[173]+' '+bt[100]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[177]=paper.setFinish(); 
lineNodes[177]=[173,100] ; 

paper.setStart(); 
s1='M '+nx[174]+' '+bb[174]+' L '+nx[174]+' '+bt[283]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[178]=paper.setFinish(); 
lineNodes[178]=[174,283] ; 

paper.setStart(); 
mid=bb[176]+(bt[345]-bb[176])/2; 
hleft = nx[206]; 
hright = nx[176]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[176]+' '+bb[176]+' L '+nx[176]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[206]+' '+mid+' L '+nx[206]+' '+bt[206];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[179]=paper.setFinish(); 
lineNodes[179]=[176,206]; 

paper.setStart(); 
mid=bb[176]+(bt[345]-bb[176])/2; 
hleft = nx[314]; 
hright = nx[176]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[314]+' '+mid+' L '+nx[314]+' '+bt[314];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[180]=paper.setFinish(); 
lineNodes[180]=[176,314]; 

paper.setStart(); 
mid=bb[176]+(bt[345]-bb[176])/2; 
s3='M '+nx[345]+' '+mid+' L '+nx[345]+' '+bt[345];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[181]=paper.setFinish(); 
lineNodes[181]=[176,345]; 

paper.setStart(); 
s1='M '+nx[178]+' '+bb[178]+' L '+nx[178]+' '+bt[64]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[182]=paper.setFinish(); 
lineNodes[182]=[178,64] ; 

paper.setStart(); 
s1='M '+nx[179]+' '+bb[179]+' L '+nx[179]+' '+bt[298]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[183]=paper.setFinish(); 
lineNodes[183]=[179,298] ; 

paper.setStart(); 
mid=bb[180]+(bt[114]-bb[180])/2; 
hleft = nx[89]; 
hright = nx[180]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[180]+' '+bb[180]+' L '+nx[180]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[89]+' '+mid+' L '+nx[89]+' '+bt[89];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[184]=paper.setFinish(); 
lineNodes[184]=[180,89]; 

paper.setStart(); 
mid=bb[180]+(bt[114]-bb[180])/2; 
hleft = nx[114]; 
hright = nx[180]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[114]+' '+mid+' L '+nx[114]+' '+bt[114];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[185]=paper.setFinish(); 
lineNodes[185]=[180,114]; 

paper.setStart(); 
mid=bb[181]+(bt[101]-bb[181])/2; 
hleft = nx[101]; 
hright = nx[181]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[181]+' '+bb[181]+' L '+nx[181]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[101]+' '+mid+' L '+nx[101]+' '+bt[101];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[186]=paper.setFinish(); 
lineNodes[186]=[181,101]; 

paper.setStart(); 
mid=bb[181]+(bt[101]-bb[181])/2; 
hleft = nx[37]; 
hright = nx[181]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[37]+' '+mid+' L '+nx[37]+' '+bt[37];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[187]=paper.setFinish(); 
lineNodes[187]=[181,37]; 

paper.setStart(); 
s1='M '+nx[183]+' '+bb[183]+' L '+nx[183]+' '+ny[438]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[188]=paper.setFinish(); 
lineNodes[188]=[183,438]; 

paper.setStart(); 
mid=bb[184]+(bt[413]-bb[184])/2; 
hleft = nx[386]; 
hright = nx[184]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[184]+' '+bb[184]+' L '+nx[184]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[386]+' '+mid+' L '+nx[386]+' '+bt[386];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[189]=paper.setFinish(); 
lineNodes[189]=[184,386]; 

paper.setStart(); 
mid=bb[184]+(bt[413]-bb[184])/2; 
hleft = nx[413]; 
hright = nx[184]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[413]+' '+mid+' L '+nx[413]+' '+bt[413];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[190]=paper.setFinish(); 
lineNodes[190]=[184,413]; 

paper.setStart(); 
s1='M '+nx[186]+' '+bb[186]+' L '+nx[186]+' '+ny[417]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[191]=paper.setFinish(); 
lineNodes[191]=[186,417]; 

paper.setStart(); 
s1='M '+nx[188]+' '+bb[188]+' L '+nx[188]+' '+bt[234]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[192]=paper.setFinish(); 
lineNodes[192]=[188,234] ; 

paper.setStart(); 
s1='M '+nx[192]+' '+bb[192]+' L '+nx[192]+' '+ny[417]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[193]=paper.setFinish(); 
lineNodes[193]=[192,417]; 

paper.setStart(); 
mid=bb[195]+(bt[182]-bb[195])/2; 
hleft = nx[157]; 
hright = nx[195]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[195]+' '+bb[195]+' L '+nx[195]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[157]+' '+mid+' L '+nx[157]+' '+bt[157];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[194]=paper.setFinish(); 
lineNodes[194]=[195,157]; 

paper.setStart(); 
mid=bb[195]+(bt[182]-bb[195])/2; 
hleft = nx[26]; 
hright = nx[195]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[26]+' '+mid+' L '+nx[26]+' '+bt[26];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[195]=paper.setFinish(); 
lineNodes[195]=[195,26]; 

paper.setStart(); 
mid=bb[195]+(bt[182]-bb[195])/2; 
s3='M '+nx[182]+' '+mid+' L '+nx[182]+' '+bt[182];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[196]=paper.setFinish(); 
lineNodes[196]=[195,182]; 

paper.setStart(); 
mid=bb[197]+(bt[153]-bb[197])/2; 
s2='M '+nx[197]+' '+bb[197]+' L '+nx[197]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[380]+' '+mid+' L '+nx[380]+' '+bt[380];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[197]=paper.setFinish(); 
lineNodes[197]=[197,380]; 

paper.setStart(); 
mid=bb[197]+(bt[153]-bb[197])/2; 
hleft = nx[281]; 
hright = nx[197]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[281]+' '+mid+' L '+nx[281]+' '+bt[281];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[198]=paper.setFinish(); 
lineNodes[198]=[197,281]; 

paper.setStart(); 
mid=bb[197]+(bt[153]-bb[197])/2; 
hleft = nx[153]; 
hright = nx[197]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[153]+' '+mid+' L '+nx[153]+' '+bt[153];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[199]=paper.setFinish(); 
lineNodes[199]=[197,153]; 

paper.setStart(); 
s1='M '+nx[198]+' '+bb[198]+' L '+nx[198]+' '+bt[195]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[200]=paper.setFinish(); 
lineNodes[200]=[198,195] ; 

paper.setStart(); 
s1='M '+nx[199]+' '+bb[199]+' L '+nx[199]+' '+ny[438]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[201]=paper.setFinish(); 
lineNodes[201]=[199,438]; 

paper.setStart(); 
s1='M '+nx[202]+' '+bb[202]+' L '+nx[202]+' '+ny[424]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[202]=paper.setFinish(); 
lineNodes[202]=[202,424]; 

paper.setStart(); 
s1='M '+nx[203]+' '+bb[203]+' L '+nx[203]+' '+ny[425]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[203]=paper.setFinish(); 
lineNodes[203]=[203,425]; 

paper.setStart(); 
mid=bb[204]+(bt[231]-bb[204])/2; 
hleft = nx[231]; 
hright = nx[204]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[204]+' '+bb[204]+' L '+nx[204]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[231]+' '+mid+' L '+nx[231]+' '+bt[231];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[204]=paper.setFinish(); 
lineNodes[204]=[204,231]; 

paper.setStart(); 
mid=bb[204]+(bt[231]-bb[204])/2; 
hleft = nx[217]; 
hright = nx[204]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[217]+' '+mid+' L '+nx[217]+' '+bt[217];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[205]=paper.setFinish(); 
lineNodes[205]=[204,217]; 

paper.setStart(); 
s1='M '+nx[205]+' '+bb[205]+' L '+nx[205]+' '+bt[342]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[206]=paper.setFinish(); 
lineNodes[206]=[205,342] ; 

paper.setStart(); 
s1='M '+nx[206]+' '+bb[206]+' L '+nx[206]+' '+bt[337]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[207]=paper.setFinish(); 
lineNodes[207]=[206,337] ; 

paper.setStart(); 
s1='M '+nx[207]+' '+bb[207]+' L '+nx[207]+' '+ny[433]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[208]=paper.setFinish(); 
lineNodes[208]=[207,433]; 

paper.setStart(); 
mid=bb[208]+(bt[226]-bb[208])/2; 
hleft = nx[107]; 
hright = nx[208]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[208]+' '+bb[208]+' L '+nx[208]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[107]+' '+mid+' L '+nx[107]+' '+bt[107];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[209]=paper.setFinish(); 
lineNodes[209]=[208,107]; 

paper.setStart(); 
mid=bb[208]+(bt[226]-bb[208])/2; 
hleft = nx[226]; 
hright = nx[208]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[226]+' '+mid+' L '+nx[226]+' '+bt[226];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[210]=paper.setFinish(); 
lineNodes[210]=[208,226]; 

paper.setStart(); 
s1='M '+nx[209]+' '+bb[209]+' L '+nx[209]+' '+ny[432]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[209]+' '+ny[432]+' L '+nx[413]+' '+ny[432]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[211]=paper.setFinish(); 
lineNodes[211]=[209,432]; 

paper.setStart(); 
s1='M '+nx[216]+' '+bb[216]+' L '+nx[216]+' '+bt[111]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[212]=paper.setFinish(); 
lineNodes[212]=[216,111] ; 

paper.setStart(); 
mid=bb[220]+(bt[270]-bb[220])/2; 
hleft = nx[382]; 
hright = nx[220]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[220]+' '+bb[220]+' L '+nx[220]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[382]+' '+mid+' L '+nx[382]+' '+bt[382];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[213]=paper.setFinish(); 
lineNodes[213]=[220,382]; 

paper.setStart(); 
mid=bb[220]+(bt[270]-bb[220])/2; 
hleft = nx[270]; 
hright = nx[220]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[270]+' '+mid+' L '+nx[270]+' '+bt[270];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[214]=paper.setFinish(); 
lineNodes[214]=[220,270]; 

paper.setStart(); 
s1='M '+nx[223]+' '+bb[223]+' L '+nx[223]+' '+ny[434]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[215]=paper.setFinish(); 
lineNodes[215]=[223,434]; 

paper.setStart(); 
s1='M '+nx[224]+' '+bb[224]+' L '+nx[224]+' '+ny[422]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[216]=paper.setFinish(); 
lineNodes[216]=[224,422]; 

paper.setStart(); 
s1='M '+nx[226]+' '+bb[226]+' L '+nx[226]+' '+ny[421]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[226]+' '+ny[421]+' L '+nx[107]+' '+ny[421]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[217]=paper.setFinish(); 
lineNodes[217]=[226,421]; 

paper.setStart(); 
s1='M '+nx[227]+' '+bb[227]+' L '+nx[227]+' '+ny[438]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[218]=paper.setFinish(); 
lineNodes[218]=[227,438]; 

paper.setStart(); 
mid=bb[228]+(bt[375]-bb[228])/2; 
s2='M '+nx[228]+' '+bb[228]+' L '+nx[228]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[97]+' '+mid+' L '+nx[97]+' '+bt[97];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[219]=paper.setFinish(); 
lineNodes[219]=[228,97]; 

paper.setStart(); 
mid=bb[228]+(bt[375]-bb[228])/2; 
hleft = nx[189]; 
hright = nx[228]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[189]+' '+mid+' L '+nx[189]+' '+bt[189];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[220]=paper.setFinish(); 
lineNodes[220]=[228,189]; 

paper.setStart(); 
mid=bb[228]+(bt[375]-bb[228])/2; 
hleft = nx[375]; 
hright = nx[228]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[375]+' '+mid+' L '+nx[375]+' '+bt[375];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[221]=paper.setFinish(); 
lineNodes[221]=[228,375]; 

paper.setStart(); 
mid=bb[229]+(bt[167]-bb[229])/2; 
s2='M '+nx[229]+' '+bb[229]+' L '+nx[229]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[401]+' '+mid+' L '+nx[401]+' '+bt[401];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[222]=paper.setFinish(); 
lineNodes[222]=[229,401]; 

paper.setStart(); 
mid=bb[229]+(bt[167]-bb[229])/2; 
hleft = nx[112]; 
hright = nx[229]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[112]+' '+mid+' L '+nx[112]+' '+bt[112];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[223]=paper.setFinish(); 
lineNodes[223]=[229,112]; 

paper.setStart(); 
mid=bb[229]+(bt[167]-bb[229])/2; 
s3='M '+nx[167]+' '+mid+' L '+nx[167]+' '+bt[167];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[224]=paper.setFinish(); 
lineNodes[224]=[229,167]; 

paper.setStart(); 
mid=bb[229]+(bt[167]-bb[229])/2; 
hleft = nx[117]; 
hright = nx[229]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[117]+' '+mid+' L '+nx[117]+' '+bt[117];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[225]=paper.setFinish(); 
lineNodes[225]=[229,117]; 

paper.setStart(); 
mid=bb[232]+(bt[184]-bb[232])/2; 
hleft = nx[209]; 
hright = nx[232]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[232]+' '+bb[232]+' L '+nx[232]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[209]+' '+mid+' L '+nx[209]+' '+bt[209];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[226]=paper.setFinish(); 
lineNodes[226]=[232,209]; 

paper.setStart(); 
mid=bb[232]+(bt[184]-bb[232])/2; 
hleft = nx[184]; 
hright = nx[232]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[184]+' '+mid+' L '+nx[184]+' '+bt[184];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[227]=paper.setFinish(); 
lineNodes[227]=[232,184]; 

paper.setStart(); 
mid=bb[232]+(bt[184]-bb[232])/2; 
s3='M '+nx[105]+' '+mid+' L '+nx[105]+' '+bt[105];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[228]=paper.setFinish(); 
lineNodes[228]=[232,105]; 

paper.setStart(); 
mid=bb[233]+(bt[75]-bb[233])/2; 
hleft = nx[65]; 
hright = nx[233]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[233]+' '+bb[233]+' L '+nx[233]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[65]+' '+mid+' L '+nx[65]+' '+bt[65];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[229]=paper.setFinish(); 
lineNodes[229]=[233,65]; 

paper.setStart(); 
mid=bb[233]+(bt[75]-bb[233])/2; 
hleft = nx[75]; 
hright = nx[233]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[75]+' '+mid+' L '+nx[75]+' '+bt[75];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[230]=paper.setFinish(); 
lineNodes[230]=[233,75]; 

paper.setStart(); 
mid=bb[234]+(bt[84]-bb[234])/2; 
hleft = nx[84]; 
hright = nx[234]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[234]+' '+bb[234]+' L '+nx[234]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[84]+' '+mid+' L '+nx[84]+' '+bt[84];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[231]=paper.setFinish(); 
lineNodes[231]=[234,84]; 

paper.setStart(); 
mid=bb[234]+(bt[84]-bb[234])/2; 
s3='M '+nx[110]+' '+mid+' L '+nx[110]+' '+bt[110];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[232]=paper.setFinish(); 
lineNodes[232]=[234,110]; 

paper.setStart(); 
mid=bb[234]+(bt[84]-bb[234])/2; 
s3='M '+nx[257]+' '+mid+' L '+nx[257]+' '+bt[257];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[233]=paper.setFinish(); 
lineNodes[233]=[234,257]; 

paper.setStart(); 
mid=bb[234]+(bt[84]-bb[234])/2; 
hleft = nx[243]; 
hright = nx[234]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[243]+' '+mid+' L '+nx[243]+' '+bt[243];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[234]=paper.setFinish(); 
lineNodes[234]=[234,243]; 

paper.setStart(); 
mid=bb[235]+(bt[79]-bb[235])/2; 
s2='M '+nx[235]+' '+bb[235]+' L '+nx[235]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[163]+' '+mid+' L '+nx[163]+' '+bt[163];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[235]=paper.setFinish(); 
lineNodes[235]=[235,163]; 

paper.setStart(); 
mid=bb[235]+(bt[79]-bb[235])/2; 
s3='M '+nx[44]+' '+mid+' L '+nx[44]+' '+bt[44];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[236]=paper.setFinish(); 
lineNodes[236]=[235,44]; 

paper.setStart(); 
mid=bb[235]+(bt[79]-bb[235])/2; 
hleft = nx[79]; 
hright = nx[235]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[79]+' '+mid+' L '+nx[79]+' '+bt[79];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[237]=paper.setFinish(); 
lineNodes[237]=[235,79]; 

paper.setStart(); 
mid=bb[235]+(bt[79]-bb[235])/2; 
s3='M '+nx[156]+' '+mid+' L '+nx[156]+' '+bt[156];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[238]=paper.setFinish(); 
lineNodes[238]=[235,156]; 

paper.setStart(); 
mid=bb[235]+(bt[79]-bb[235])/2; 
s3='M '+nx[275]+' '+mid+' L '+nx[275]+' '+bt[275];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[239]=paper.setFinish(); 
lineNodes[239]=[235,275]; 

paper.setStart(); 
mid=bb[235]+(bt[79]-bb[235])/2; 
hleft = nx[102]; 
hright = nx[235]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[102]+' '+mid+' L '+nx[102]+' '+bt[102];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[240]=paper.setFinish(); 
lineNodes[240]=[235,102]; 

paper.setStart(); 
s1='M '+nx[236]+' '+bb[236]+' L '+nx[236]+' '+bt[170]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[241]=paper.setFinish(); 
lineNodes[241]=[236,170] ; 

paper.setStart(); 
s1='M '+nx[239]+' '+bb[239]+' L '+nx[239]+' '+ny[437]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[242]=paper.setFinish(); 
lineNodes[242]=[239,437]; 

paper.setStart(); 
mid=bb[240]+(bt[55]-bb[240])/2; 
hleft = nx[397]; 
hright = nx[240]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[240]+' '+bb[240]+' L '+nx[240]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[397]+' '+mid+' L '+nx[397]+' '+bt[397];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[243]=paper.setFinish(); 
lineNodes[243]=[240,397]; 

paper.setStart(); 
mid=bb[240]+(bt[55]-bb[240])/2; 
s3='M '+nx[55]+' '+mid+' L '+nx[55]+' '+bt[55];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[244]=paper.setFinish(); 
lineNodes[244]=[240,55]; 

paper.setStart(); 
mid=bb[240]+(bt[55]-bb[240])/2; 
hleft = nx[289]; 
hright = nx[240]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[289]+' '+mid+' L '+nx[289]+' '+bt[289];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[245]=paper.setFinish(); 
lineNodes[245]=[240,289]; 

paper.setStart(); 
mid=bb[240]+(bt[55]-bb[240])/2; 
s3='M '+nx[239]+' '+mid+' L '+nx[239]+' '+bt[239];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[246]=paper.setFinish(); 
lineNodes[246]=[240,239]; 

paper.setStart(); 
mid=bb[242]+(bt[384]-bb[242])/2; 
hleft = nx[384]; 
hright = nx[242]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[242]+' '+bb[242]+' L '+nx[242]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[384]+' '+mid+' L '+nx[384]+' '+bt[384];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[247]=paper.setFinish(); 
lineNodes[247]=[242,384]; 

paper.setStart(); 
mid=bb[242]+(bt[384]-bb[242])/2; 
s3='M '+nx[147]+' '+mid+' L '+nx[147]+' '+bt[147];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[248]=paper.setFinish(); 
lineNodes[248]=[242,147]; 

paper.setStart(); 
mid=bb[242]+(bt[384]-bb[242])/2; 
s3='M '+nx[305]+' '+mid+' L '+nx[305]+' '+bt[305];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[249]=paper.setFinish(); 
lineNodes[249]=[242,305]; 

paper.setStart(); 
mid=bb[242]+(bt[384]-bb[242])/2; 
s3='M '+nx[40]+' '+mid+' L '+nx[40]+' '+bt[40];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[250]=paper.setFinish(); 
lineNodes[250]=[242,40]; 

paper.setStart(); 
mid=bb[242]+(bt[384]-bb[242])/2; 
hleft = nx[372]; 
hright = nx[242]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[372]+' '+mid+' L '+nx[372]+' '+bt[372];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[251]=paper.setFinish(); 
lineNodes[251]=[242,372]; 

paper.setStart(); 
s1='M '+nx[243]+' '+bb[243]+' L '+nx[243]+' '+ny[433]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[252]=paper.setFinish(); 
lineNodes[252]=[243,433]; 

paper.setStart(); 
s1='M '+nx[244]+' '+bb[244]+' L '+nx[244]+' '+ny[425]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[253]=paper.setFinish(); 
lineNodes[253]=[244,425]; 

paper.setStart(); 
s1='M '+nx[245]+' '+bb[245]+' L '+nx[245]+' '+bt[309]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[254]=paper.setFinish(); 
lineNodes[254]=[245,309] ; 

paper.setStart(); 
s1='M '+nx[247]+' '+bb[247]+' L '+nx[247]+' '+bt[216]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[255]=paper.setFinish(); 
lineNodes[255]=[247,216] ; 

paper.setStart(); 
mid=bb[248]+(bt[124]-bb[248])/2; 
hleft = nx[191]; 
hright = nx[248]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[248]+' '+bb[248]+' L '+nx[248]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[191]+' '+mid+' L '+nx[191]+' '+bt[191];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[256]=paper.setFinish(); 
lineNodes[256]=[248,191]; 

paper.setStart(); 
mid=bb[248]+(bt[124]-bb[248])/2; 
hleft = nx[124]; 
hright = nx[248]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[124]+' '+mid+' L '+nx[124]+' '+bt[124];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[257]=paper.setFinish(); 
lineNodes[257]=[248,124]; 

paper.setStart(); 
s1='M '+nx[249]+' '+bb[249]+' L '+nx[249]+' '+ny[442]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[249]+' '+ny[442]+' L '+nx[25]+' '+ny[442]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[258]=paper.setFinish(); 
lineNodes[258]=[249,442]; 

paper.setStart(); 
s1='M '+nx[250]+' '+bb[250]+' L '+nx[250]+' '+bt[32]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[259]=paper.setFinish(); 
lineNodes[259]=[250,32] ; 

paper.setStart(); 
mid=bb[251]+(bt[14]-bb[251])/2; 
hleft = nx[351]; 
hright = nx[251]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[251]+' '+bb[251]+' L '+nx[251]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[351]+' '+mid+' L '+nx[351]+' '+bt[351];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[260]=paper.setFinish(); 
lineNodes[260]=[251,351]; 

paper.setStart(); 
mid=bb[251]+(bt[14]-bb[251])/2; 
hleft = nx[14]; 
hright = nx[251]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[14]+' '+mid+' L '+nx[14]+' '+bt[14];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[261]=paper.setFinish(); 
lineNodes[261]=[251,14]; 

paper.setStart(); 
s1='M '+nx[252]+' '+bb[252]+' L '+nx[252]+' '+bt[288]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[262]=paper.setFinish(); 
lineNodes[262]=[252,288] ; 

paper.setStart(); 
mid=bb[253]+(bt[361]-bb[253])/2; 
s2='M '+nx[253]+' '+bb[253]+' L '+nx[253]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[90]+' '+mid+' L '+nx[90]+' '+bt[90];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[263]=paper.setFinish(); 
lineNodes[263]=[253,90]; 

paper.setStart(); 
mid=bb[253]+(bt[361]-bb[253])/2; 
s3='M '+nx[116]+' '+mid+' L '+nx[116]+' '+bt[116];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[264]=paper.setFinish(); 
lineNodes[264]=[253,116]; 

paper.setStart(); 
mid=bb[253]+(bt[361]-bb[253])/2; 
s3='M '+nx[334]+' '+mid+' L '+nx[334]+' '+bt[334];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[265]=paper.setFinish(); 
lineNodes[265]=[253,334]; 

paper.setStart(); 
mid=bb[253]+(bt[361]-bb[253])/2; 
s3='M '+nx[279]+' '+mid+' L '+nx[279]+' '+bt[279];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[266]=paper.setFinish(); 
lineNodes[266]=[253,279]; 

paper.setStart(); 
mid=bb[253]+(bt[361]-bb[253])/2; 
s3='M '+nx[176]+' '+mid+' L '+nx[176]+' '+bt[176];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[267]=paper.setFinish(); 
lineNodes[267]=[253,176]; 

paper.setStart(); 
mid=bb[253]+(bt[361]-bb[253])/2; 
hleft = nx[361]; 
hright = nx[253]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[361]+' '+mid+' L '+nx[361]+' '+bt[361];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[268]=paper.setFinish(); 
lineNodes[268]=[253,361]; 

paper.setStart(); 
mid=bb[253]+(bt[361]-bb[253])/2; 
hleft = nx[317]; 
hright = nx[253]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[317]+' '+mid+' L '+nx[317]+' '+bt[317];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[269]=paper.setFinish(); 
lineNodes[269]=[253,317]; 

paper.setStart(); 
s1='M '+nx[254]+' '+bb[254]+' L '+nx[254]+' '+ny[430]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[270]=paper.setFinish(); 
lineNodes[270]=[254,430]; 

paper.setStart(); 
s1='M '+nx[256]+' '+bb[256]+' L '+nx[256]+' '+bt[414]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[271]=paper.setFinish(); 
lineNodes[271]=[256,414] ; 

paper.setStart(); 
s1='M '+nx[257]+' '+bb[257]+' L '+nx[257]+' '+ny[433]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[272]=paper.setFinish(); 
lineNodes[272]=[257,433]; 

paper.setStart(); 
mid=bb[258]+(bt[92]-bb[258])/2; 
hleft = nx[194]; 
hright = nx[258]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[258]+' '+bb[258]+' L '+nx[258]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[194]+' '+mid+' L '+nx[194]+' '+bt[194];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[273]=paper.setFinish(); 
lineNodes[273]=[258,194]; 

paper.setStart(); 
mid=bb[258]+(bt[92]-bb[258])/2; 
hleft = nx[312]; 
hright = nx[258]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[312]+' '+mid+' L '+nx[312]+' '+bt[312];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[274]=paper.setFinish(); 
lineNodes[274]=[258,312]; 

paper.setStart(); 
mid=bb[258]+(bt[92]-bb[258])/2; 
s3='M '+nx[92]+' '+mid+' L '+nx[92]+' '+bt[92];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[275]=paper.setFinish(); 
lineNodes[275]=[258,92]; 

paper.setStart(); 
s1='M '+nx[259]+' '+bb[259]+' L '+nx[259]+' '+ny[433]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[259]+' '+ny[433]+' L '+nx[243]+' '+ny[433]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[276]=paper.setFinish(); 
lineNodes[276]=[259,433]; 

paper.setStart(); 
s1='M '+nx[260]+' '+bb[260]+' L '+nx[260]+' '+bt[138]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[277]=paper.setFinish(); 
lineNodes[277]=[260,138] ; 

paper.setStart(); 
s1='M '+nx[261]+' '+bb[261]+' L '+nx[261]+' '+ny[418]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[261]+' '+ny[418]+' L '+nx[283]+' '+ny[418]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[278]=paper.setFinish(); 
lineNodes[278]=[261,418]; 

paper.setStart(); 
s1='M '+nx[262]+' '+bb[262]+' L '+nx[262]+' '+ny[439]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[279]=paper.setFinish(); 
lineNodes[279]=[262,439]; 

paper.setStart(); 
s1='M '+nx[263]+' '+bb[263]+' L '+nx[263]+' '+ny[430]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[280]=paper.setFinish(); 
lineNodes[280]=[263,430]; 

paper.setStart(); 
mid=bb[264]+(bt[274]-bb[264])/2; 
hleft = nx[274]; 
hright = nx[264]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[264]+' '+bb[264]+' L '+nx[264]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[274]+' '+mid+' L '+nx[274]+' '+bt[274];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[281]=paper.setFinish(); 
lineNodes[281]=[264,274]; 

paper.setStart(); 
mid=bb[264]+(bt[274]-bb[264])/2; 
hleft = nx[385]; 
hright = nx[264]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[385]+' '+mid+' L '+nx[385]+' '+bt[385];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[282]=paper.setFinish(); 
lineNodes[282]=[264,385]; 

paper.setStart(); 
s1='M '+nx[265]+' '+bb[265]+' L '+nx[265]+' '+bt[31]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[283]=paper.setFinish(); 
lineNodes[283]=[265,31] ; 

paper.setStart(); 
s1='M '+nx[266]+' '+bb[266]+' L '+nx[266]+' '+bt[336]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[284]=paper.setFinish(); 
lineNodes[284]=[266,336] ; 

paper.setStart(); 
s1='M '+nx[267]+' '+bb[267]+' L '+nx[267]+' '+bt[378]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[285]=paper.setFinish(); 
lineNodes[285]=[267,378] ; 

paper.setStart(); 
mid=bb[268]+(bt[277]-bb[268])/2; 
hleft = nx[277]; 
hright = nx[268]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[268]+' '+bb[268]+' L '+nx[268]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[277]+' '+mid+' L '+nx[277]+' '+bt[277];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[286]=paper.setFinish(); 
lineNodes[286]=[268,277]; 

paper.setStart(); 
mid=bb[268]+(bt[277]-bb[268])/2; 
hleft = nx[320]; 
hright = nx[268]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[320]+' '+mid+' L '+nx[320]+' '+bt[320];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[287]=paper.setFinish(); 
lineNodes[287]=[268,320]; 

paper.setStart(); 
mid=bb[269]+(bt[377]-bb[269])/2; 
hleft = nx[155]; 
hright = nx[269]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[269]+' '+bb[269]+' L '+nx[269]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[155]+' '+mid+' L '+nx[155]+' '+bt[155];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[288]=paper.setFinish(); 
lineNodes[288]=[269,155]; 

paper.setStart(); 
mid=bb[269]+(bt[377]-bb[269])/2; 
s3='M '+nx[376]+' '+mid+' L '+nx[376]+' '+bt[376];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[289]=paper.setFinish(); 
lineNodes[289]=[269,376]; 

paper.setStart(); 
mid=bb[269]+(bt[377]-bb[269])/2; 
s3='M '+nx[377]+' '+mid+' L '+nx[377]+' '+bt[377];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[290]=paper.setFinish(); 
lineNodes[290]=[269,377]; 

paper.setStart(); 
mid=bb[269]+(bt[377]-bb[269])/2; 
s3='M '+nx[12]+' '+mid+' L '+nx[12]+' '+bt[12];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[291]=paper.setFinish(); 
lineNodes[291]=[269,12]; 

paper.setStart(); 
mid=bb[269]+(bt[377]-bb[269])/2; 
hleft = nx[276]; 
hright = nx[269]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[276]+' '+mid+' L '+nx[276]+' '+bt[276];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[292]=paper.setFinish(); 
lineNodes[292]=[269,276]; 

paper.setStart(); 
mid=bb[269]+(bt[377]-bb[269])/2; 
s3='M '+nx[46]+' '+mid+' L '+nx[46]+' '+bt[46];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[293]=paper.setFinish(); 
lineNodes[293]=[269,46]; 

paper.setStart(); 
mid=bb[269]+(bt[377]-bb[269])/2; 
s3='M '+nx[322]+' '+mid+' L '+nx[322]+' '+bt[322];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[294]=paper.setFinish(); 
lineNodes[294]=[269,322]; 

paper.setStart(); 
mid=bb[269]+(bt[377]-bb[269])/2; 
s3='M '+nx[253]+' '+mid+' L '+nx[253]+' '+bt[253];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[295]=paper.setFinish(); 
lineNodes[295]=[269,253]; 

paper.setStart(); 
mid=bb[269]+(bt[377]-bb[269])/2; 
s3='M '+nx[68]+' '+mid+' L '+nx[68]+' '+bt[68];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[296]=paper.setFinish(); 
lineNodes[296]=[269,68]; 

paper.setStart(); 
s1='M '+nx[270]+' '+bb[270]+' L '+nx[270]+' '+ny[441]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[270]+' '+ny[441]+' L '+nx[382]+' '+ny[441]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[297]=paper.setFinish(); 
lineNodes[297]=[270,441]; 

paper.setStart(); 
s1='M '+nx[271]+' '+bb[271]+' L '+nx[271]+' '+bt[287]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[298]=paper.setFinish(); 
lineNodes[298]=[271,287] ; 

paper.setStart(); 
s1='M '+nx[274]+' '+bb[274]+' L '+nx[274]+' '+ny[427]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[274]+' '+ny[427]+' L '+nx[385]+' '+ny[427]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[299]=paper.setFinish(); 
lineNodes[299]=[274,427]; 

paper.setStart(); 
mid=bb[276]+(bt[299]-bb[276])/2; 
hleft = nx[299]; 
hright = nx[276]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[276]+' '+bb[276]+' L '+nx[276]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[299]+' '+mid+' L '+nx[299]+' '+bt[299];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[300]=paper.setFinish(); 
lineNodes[300]=[276,299]; 

paper.setStart(); 
mid=bb[276]+(bt[299]-bb[276])/2; 
hleft = nx[232]; 
hright = nx[276]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[232]+' '+mid+' L '+nx[232]+' '+bt[232];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[301]=paper.setFinish(); 
lineNodes[301]=[276,232]; 

paper.setStart(); 
mid=bb[278]+(bt[255]-bb[278])/2; 
hleft = nx[34]; 
hright = nx[278]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[278]+' '+bb[278]+' L '+nx[278]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[34]+' '+mid+' L '+nx[34]+' '+bt[34];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[302]=paper.setFinish(); 
lineNodes[302]=[278,34]; 

paper.setStart(); 
mid=bb[278]+(bt[255]-bb[278])/2; 
hleft = nx[11]; 
hright = nx[278]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[11]+' '+mid+' L '+nx[11]+' '+bt[11];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[303]=paper.setFinish(); 
lineNodes[303]=[278,11]; 

paper.setStart(); 
mid=bb[278]+(bt[255]-bb[278])/2; 
s3='M '+nx[255]+' '+mid+' L '+nx[255]+' '+bt[255];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[304]=paper.setFinish(); 
lineNodes[304]=[278,255]; 

paper.setStart(); 
mid=bb[278]+(bt[255]-bb[278])/2; 
s3='M '+nx[161]+' '+mid+' L '+nx[161]+' '+bt[161];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[305]=paper.setFinish(); 
lineNodes[305]=[278,161]; 

paper.setStart(); 
mid=bb[278]+(bt[255]-bb[278])/2; 
s3='M '+nx[122]+' '+mid+' L '+nx[122]+' '+bt[122];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[306]=paper.setFinish(); 
lineNodes[306]=[278,122]; 

paper.setStart(); 
s1='M '+nx[279]+' '+bb[279]+' L '+nx[279]+' '+bt[178]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[307]=paper.setFinish(); 
lineNodes[307]=[279,178] ; 

paper.setStart(); 
s1='M '+nx[280]+' '+bb[280]+' L '+nx[280]+' '+bt[152]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[308]=paper.setFinish(); 
lineNodes[308]=[280,152] ; 

paper.setStart(); 
s1='M '+nx[282]+' '+bb[282]+' L '+nx[282]+' '+ny[439]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[282]+' '+ny[439]+' L '+nx[262]+' '+ny[439]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[309]=paper.setFinish(); 
lineNodes[309]=[282,439]; 

paper.setStart(); 
s1='M '+nx[283]+' '+bb[283]+' L '+nx[283]+' '+ny[418]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[310]=paper.setFinish(); 
lineNodes[310]=[283,418]; 

paper.setStart(); 
s1='M '+nx[284]+' '+bb[284]+' L '+nx[284]+' '+bt[259]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[311]=paper.setFinish(); 
lineNodes[311]=[284,259] ; 

paper.setStart(); 
s1='M '+nx[286]+' '+bb[286]+' L '+nx[286]+' '+ny[438]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[312]=paper.setFinish(); 
lineNodes[312]=[286,438]; 

paper.setStart(); 
mid=bb[287]+(bt[316]-bb[287])/2; 
s2='M '+nx[287]+' '+bb[287]+' L '+nx[287]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[2]+' '+mid+' L '+nx[2]+' '+bt[2];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[313]=paper.setFinish(); 
lineNodes[313]=[287,2]; 

paper.setStart(); 
mid=bb[287]+(bt[316]-bb[287])/2; 
hleft = nx[316]; 
hright = nx[287]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[316]+' '+mid+' L '+nx[316]+' '+bt[316];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[314]=paper.setFinish(); 
lineNodes[314]=[287,316]; 

paper.setStart(); 
mid=bb[287]+(bt[316]-bb[287])/2; 
hleft = nx[118]; 
hright = nx[287]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[118]+' '+mid+' L '+nx[118]+' '+bt[118];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[315]=paper.setFinish(); 
lineNodes[315]=[287,118]; 

paper.setStart(); 
mid=bb[288]+(bt[60]-bb[288])/2; 
s2='M '+nx[288]+' '+bb[288]+' L '+nx[288]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[3]+' '+mid+' L '+nx[3]+' '+bt[3];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[316]=paper.setFinish(); 
lineNodes[316]=[288,3]; 

paper.setStart(); 
mid=bb[288]+(bt[60]-bb[288])/2; 
hleft = nx[303]; 
hright = nx[288]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[303]+' '+mid+' L '+nx[303]+' '+bt[303];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[317]=paper.setFinish(); 
lineNodes[317]=[288,303]; 

paper.setStart(); 
mid=bb[288]+(bt[60]-bb[288])/2; 
hleft = nx[374]; 
hright = nx[288]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[374]+' '+mid+' L '+nx[374]+' '+bt[374];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[318]=paper.setFinish(); 
lineNodes[318]=[288,374]; 

paper.setStart(); 
mid=bb[288]+(bt[60]-bb[288])/2; 
s3='M '+nx[60]+' '+mid+' L '+nx[60]+' '+bt[60];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[319]=paper.setFinish(); 
lineNodes[319]=[288,60]; 

paper.setStart(); 
s1='M '+nx[289]+' '+bb[289]+' L '+nx[289]+' '+ny[437]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[320]=paper.setFinish(); 
lineNodes[320]=[289,437]; 

paper.setStart(); 
s1='M '+nx[290]+' '+bb[290]+' L '+nx[290]+' '+bt[180]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[321]=paper.setFinish(); 
lineNodes[321]=[290,180] ; 

paper.setStart(); 
s1='M '+nx[292]+' '+bb[292]+' L '+nx[292]+' '+bt[301]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[322]=paper.setFinish(); 
lineNodes[322]=[292,301] ; 

paper.setStart(); 
s1='M '+nx[293]+' '+bb[293]+' L '+nx[293]+' '+ny[422]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[293]+' '+ny[422]+' L '+nx[224]+' '+ny[422]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[323]=paper.setFinish(); 
lineNodes[323]=[293,422]; 

paper.setStart(); 
mid=bb[294]+(bt[98]-bb[294])/2; 
hleft = nx[221]; 
hright = nx[294]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[294]+' '+bb[294]+' L '+nx[294]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[221]+' '+mid+' L '+nx[221]+' '+bt[221];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[324]=paper.setFinish(); 
lineNodes[324]=[294,221]; 

paper.setStart(); 
mid=bb[294]+(bt[98]-bb[294])/2; 
hleft = nx[98]; 
hright = nx[294]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[98]+' '+mid+' L '+nx[98]+' '+bt[98];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[325]=paper.setFinish(); 
lineNodes[325]=[294,98]; 

paper.setStart(); 
mid=bb[295]+(bt[366]-bb[295])/2; 
s2='M '+nx[295]+' '+bb[295]+' L '+nx[295]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[134]+' '+mid+' L '+nx[134]+' '+bt[134];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[326]=paper.setFinish(); 
lineNodes[326]=[295,134]; 

paper.setStart(); 
mid=bb[295]+(bt[366]-bb[295])/2; 
hleft = nx[366]; 
hright = nx[295]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[366]+' '+mid+' L '+nx[366]+' '+bt[366];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[327]=paper.setFinish(); 
lineNodes[327]=[295,366]; 

paper.setStart(); 
mid=bb[295]+(bt[366]-bb[295])/2; 
hleft = nx[291]; 
hright = nx[295]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[291]+' '+mid+' L '+nx[291]+' '+bt[291];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[328]=paper.setFinish(); 
lineNodes[328]=[295,291]; 

paper.setStart(); 
mid=bb[295]+(bt[366]-bb[295])/2; 
s3='M '+nx[272]+' '+mid+' L '+nx[272]+' '+bt[272];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[329]=paper.setFinish(); 
lineNodes[329]=[295,272]; 

paper.setStart(); 
s1='M '+nx[296]+' '+bb[296]+' L '+nx[296]+' '+bt[33]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[330]=paper.setFinish(); 
lineNodes[330]=[296,33] ; 

paper.setStart(); 
mid=bb[298]+(bt[416]-bb[298])/2; 
s2='M '+nx[298]+' '+bb[298]+' L '+nx[298]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[416]+' '+mid+' L '+nx[416]+' '+bt[416];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[331]=paper.setFinish(); 
lineNodes[331]=[298,416]; 

paper.setStart(); 
mid=bb[298]+(bt[416]-bb[298])/2; 
hleft = nx[304]; 
hright = nx[298]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[304]+' '+mid+' L '+nx[304]+' '+bt[304];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[332]=paper.setFinish(); 
lineNodes[332]=[298,304]; 

paper.setStart(); 
mid=bb[298]+(bt[416]-bb[298])/2; 
hleft = nx[96]; 
hright = nx[298]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[96]+' '+mid+' L '+nx[96]+' '+bt[96];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[333]=paper.setFinish(); 
lineNodes[333]=[298,96]; 

paper.setStart(); 
mid=bb[299]+(bt[175]-bb[299])/2; 
hleft = nx[132]; 
hright = nx[299]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[299]+' '+bb[299]+' L '+nx[299]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[132]+' '+mid+' L '+nx[132]+' '+bt[132];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[334]=paper.setFinish(); 
lineNodes[334]=[299,132]; 

paper.setStart(); 
mid=bb[299]+(bt[175]-bb[299])/2; 
hleft = nx[331]; 
hright = nx[299]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[331]+' '+mid+' L '+nx[331]+' '+bt[331];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[335]=paper.setFinish(); 
lineNodes[335]=[299,331]; 

paper.setStart(); 
mid=bb[299]+(bt[175]-bb[299])/2; 
s3='M '+nx[214]+' '+mid+' L '+nx[214]+' '+bt[214];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[336]=paper.setFinish(); 
lineNodes[336]=[299,214]; 

paper.setStart(); 
mid=bb[299]+(bt[175]-bb[299])/2; 
s3='M '+nx[27]+' '+mid+' L '+nx[27]+' '+bt[27];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[337]=paper.setFinish(); 
lineNodes[337]=[299,27]; 

paper.setStart(); 
mid=bb[299]+(bt[175]-bb[299])/2; 
s3='M '+nx[175]+' '+mid+' L '+nx[175]+' '+bt[175];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[338]=paper.setFinish(); 
lineNodes[338]=[299,175]; 

paper.setStart(); 
mid=bb[301]+(bt[328]-bb[301])/2; 
hleft = nx[199]; 
hright = nx[301]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[301]+' '+bb[301]+' L '+nx[301]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[199]+' '+mid+' L '+nx[199]+' '+bt[199];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[339]=paper.setFinish(); 
lineNodes[339]=[301,199]; 

paper.setStart(); 
mid=bb[301]+(bt[328]-bb[301])/2; 
hleft = nx[328]; 
hright = nx[301]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[328]+' '+mid+' L '+nx[328]+' '+bt[328];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[340]=paper.setFinish(); 
lineNodes[340]=[301,328]; 

paper.setStart(); 
s1='M '+nx[303]+' '+bb[303]+' L '+nx[303]+' '+bt[290]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[341]=paper.setFinish(); 
lineNodes[341]=[303,290] ; 

paper.setStart(); 
s1='M '+nx[304]+' '+bb[304]+' L '+nx[304]+' '+ny[436]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[342]=paper.setFinish(); 
lineNodes[342]=[304,436]; 

paper.setStart(); 
mid=bb[305]+(bt[344]-bb[305])/2; 
hleft = nx[344]; 
hright = nx[305]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[305]+' '+bb[305]+' L '+nx[305]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[344]+' '+mid+' L '+nx[344]+' '+bt[344];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[343]=paper.setFinish(); 
lineNodes[343]=[305,344]; 

paper.setStart(); 
mid=bb[305]+(bt[344]-bb[305])/2; 
hleft = nx[43]; 
hright = nx[305]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[43]+' '+mid+' L '+nx[43]+' '+bt[43];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[344]=paper.setFinish(); 
lineNodes[344]=[305,43]; 

paper.setStart(); 
mid=bb[306]+(bt[22]-bb[306])/2; 
s2='M '+nx[306]+' '+bb[306]+' L '+nx[306]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[222]+' '+mid+' L '+nx[222]+' '+bt[222];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[345]=paper.setFinish(); 
lineNodes[345]=[306,222]; 

paper.setStart(); 
mid=bb[306]+(bt[22]-bb[306])/2; 
hleft = nx[349]; 
hright = nx[306]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[349]+' '+mid+' L '+nx[349]+' '+bt[349];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[346]=paper.setFinish(); 
lineNodes[346]=[306,349]; 

paper.setStart(); 
mid=bb[306]+(bt[22]-bb[306])/2; 
hleft = nx[297]; 
hright = nx[306]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[297]+' '+mid+' L '+nx[297]+' '+bt[297];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[347]=paper.setFinish(); 
lineNodes[347]=[306,297]; 

paper.setStart(); 
mid=bb[306]+(bt[22]-bb[306])/2; 
s3='M '+nx[22]+' '+mid+' L '+nx[22]+' '+bt[22];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[348]=paper.setFinish(); 
lineNodes[348]=[306,22]; 

paper.setStart(); 
s1='M '+nx[309]+' '+bb[309]+' L '+nx[309]+' '+bt[174]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[349]=paper.setFinish(); 
lineNodes[349]=[309,174] ; 

paper.setStart(); 
s1='M '+nx[311]+' '+bb[311]+' L '+nx[311]+' '+ny[417]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[350]=paper.setFinish(); 
lineNodes[350]=[311,417]; 

paper.setStart(); 
s1='M '+nx[312]+' '+bb[312]+' L '+nx[312]+' '+bt[359]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[351]=paper.setFinish(); 
lineNodes[351]=[312,359] ; 

paper.setStart(); 
s1='M '+nx[313]+' '+bb[313]+' L '+nx[313]+' '+ny[420]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[352]=paper.setFinish(); 
lineNodes[352]=[313,420]; 

paper.setStart(); 
s1='M '+nx[314]+' '+bb[314]+' L '+nx[314]+' '+bt[171]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[353]=paper.setFinish(); 
lineNodes[353]=[314,171] ; 

paper.setStart(); 
s1='M '+nx[317]+' '+bb[317]+' L '+nx[317]+' '+bt[294]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[354]=paper.setFinish(); 
lineNodes[354]=[317,294] ; 

paper.setStart(); 
s1='M '+nx[319]+' '+bb[319]+' L '+nx[319]+' '+bt[265]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[355]=paper.setFinish(); 
lineNodes[355]=[319,265] ; 

paper.setStart(); 
mid=bb[321]+(bt[262]-bb[321])/2; 
hleft = nx[282]; 
hright = nx[321]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[321]+' '+bb[321]+' L '+nx[321]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[282]+' '+mid+' L '+nx[282]+' '+bt[282];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[356]=paper.setFinish(); 
lineNodes[356]=[321,282]; 

paper.setStart(); 
mid=bb[321]+(bt[262]-bb[321])/2; 
hleft = nx[262]; 
hright = nx[321]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[262]+' '+mid+' L '+nx[262]+' '+bt[262];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[357]=paper.setFinish(); 
lineNodes[357]=[321,262]; 

paper.setStart(); 
mid=bb[322]+(bt[280]-bb[322])/2; 
hleft = nx[280]; 
hright = nx[322]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[322]+' '+bb[322]+' L '+nx[322]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[280]+' '+mid+' L '+nx[280]+' '+bt[280];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[358]=paper.setFinish(); 
lineNodes[358]=[322,280]; 

paper.setStart(); 
mid=bb[322]+(bt[280]-bb[322])/2; 
hleft = nx[4]; 
hright = nx[322]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[4]+' '+mid+' L '+nx[4]+' '+bt[4];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[359]=paper.setFinish(); 
lineNodes[359]=[322,4]; 

paper.setStart(); 
mid=bb[322]+(bt[280]-bb[322])/2; 
s3='M '+nx[6]+' '+mid+' L '+nx[6]+' '+bt[6];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[360]=paper.setFinish(); 
lineNodes[360]=[322,6]; 

paper.setStart(); 
s1='M '+nx[323]+' '+bb[323]+' L '+nx[323]+' '+bt[48]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[361]=paper.setFinish(); 
lineNodes[361]=[323,48] ; 

paper.setStart(); 
s1='M '+nx[324]+' '+bb[324]+' L '+nx[324]+' '+ny[417]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[324]+' '+ny[417]+' L '+nx[311]+' '+ny[417]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[362]=paper.setFinish(); 
lineNodes[362]=[324,417]; 

paper.setStart(); 
s1='M '+nx[325]+' '+bb[325]+' L '+nx[325]+' '+bt[36]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[363]=paper.setFinish(); 
lineNodes[363]=[325,36] ; 

paper.setStart(); 
mid=bb[326]+(bt[162]-bb[326])/2; 
hleft = nx[57]; 
hright = nx[326]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[326]+' '+bb[326]+' L '+nx[326]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[57]+' '+mid+' L '+nx[57]+' '+bt[57];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[364]=paper.setFinish(); 
lineNodes[364]=[326,57]; 

paper.setStart(); 
mid=bb[326]+(bt[162]-bb[326])/2; 
hleft = nx[162]; 
hright = nx[326]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[162]+' '+mid+' L '+nx[162]+' '+bt[162];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[365]=paper.setFinish(); 
lineNodes[365]=[326,162]; 

paper.setStart(); 
mid=bb[326]+(bt[162]-bb[326])/2; 
s3='M '+nx[58]+' '+mid+' L '+nx[58]+' '+bt[58];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[366]=paper.setFinish(); 
lineNodes[366]=[326,58]; 

paper.setStart(); 
s1='M '+nx[328]+' '+bb[328]+' L '+nx[328]+' '+ny[438]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[328]+' '+ny[438]+' L '+nx[405]+' '+ny[438]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[367]=paper.setFinish(); 
lineNodes[367]=[328,438]; 

paper.setStart(); 
s1='M '+nx[329]+' '+bb[329]+' L '+nx[329]+' '+bt[306]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[368]=paper.setFinish(); 
lineNodes[368]=[329,306] ; 

paper.setStart(); 
mid=bb[330]+(bt[286]-bb[330])/2; 
s2='M '+nx[330]+' '+bb[330]+' L '+nx[330]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[227]+' '+mid+' L '+nx[227]+' '+bt[227];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[369]=paper.setFinish(); 
lineNodes[369]=[330,227]; 

paper.setStart(); 
mid=bb[330]+(bt[286]-bb[330])/2; 
hleft = nx[16]; 
hright = nx[330]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[16]+' '+mid+' L '+nx[16]+' '+bt[16];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[370]=paper.setFinish(); 
lineNodes[370]=[330,16]; 

paper.setStart(); 
mid=bb[330]+(bt[286]-bb[330])/2; 
hleft = nx[405]; 
hright = nx[330]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[405]+' '+mid+' L '+nx[405]+' '+bt[405];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[371]=paper.setFinish(); 
lineNodes[371]=[330,405]; 

paper.setStart(); 
mid=bb[330]+(bt[286]-bb[330])/2; 
s3='M '+nx[383]+' '+mid+' L '+nx[383]+' '+bt[383];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[372]=paper.setFinish(); 
lineNodes[372]=[330,383]; 

paper.setStart(); 
mid=bb[330]+(bt[286]-bb[330])/2; 
s3='M '+nx[286]+' '+mid+' L '+nx[286]+' '+bt[286];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[373]=paper.setFinish(); 
lineNodes[373]=[330,286]; 

paper.setStart(); 
mid=bb[332]+(bt[91]-bb[332])/2; 
hleft = nx[91]; 
hright = nx[332]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[332]+' '+bb[332]+' L '+nx[332]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[91]+' '+mid+' L '+nx[91]+' '+bt[91];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[374]=paper.setFinish(); 
lineNodes[374]=[332,91]; 

paper.setStart(); 
mid=bb[332]+(bt[91]-bb[332])/2; 
hleft = nx[103]; 
hright = nx[332]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[103]+' '+mid+' L '+nx[103]+' '+bt[103];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[375]=paper.setFinish(); 
lineNodes[375]=[332,103]; 

paper.setStart(); 
s1='M '+nx[333]+' '+bb[333]+' L '+nx[333]+' '+bt[406]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[376]=paper.setFinish(); 
lineNodes[376]=[333,406] ; 

paper.setStart(); 
s1='M '+nx[334]+' '+bb[334]+' L '+nx[334]+' '+bt[93]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[377]=paper.setFinish(); 
lineNodes[377]=[334,93] ; 

paper.setStart(); 
mid=bb[335]+(bt[88]-bb[335])/2; 
hleft = nx[395]; 
hright = nx[335]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[335]+' '+bb[335]+' L '+nx[335]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[395]+' '+mid+' L '+nx[395]+' '+bt[395];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[378]=paper.setFinish(); 
lineNodes[378]=[335,395]; 

paper.setStart(); 
mid=bb[335]+(bt[88]-bb[335])/2; 
hleft = nx[88]; 
hright = nx[335]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[88]+' '+mid+' L '+nx[88]+' '+bt[88];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[379]=paper.setFinish(); 
lineNodes[379]=[335,88]; 

paper.setStart(); 
s1='M '+nx[336]+' '+bb[336]+' L '+nx[336]+' '+bt[264]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[380]=paper.setFinish(); 
lineNodes[380]=[336,264] ; 

paper.setStart(); 
s1='M '+nx[337]+' '+bb[337]+' L '+nx[337]+' '+bt[61]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[381]=paper.setFinish(); 
lineNodes[381]=[337,61] ; 

paper.setStart(); 
s1='M '+nx[338]+' '+bb[338]+' L '+nx[338]+' '+bt[71]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[382]=paper.setFinish(); 
lineNodes[382]=[338,71] ; 

paper.setStart(); 
s1='M '+nx[339]+' '+bb[339]+' L '+nx[339]+' '+bt[41]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[383]=paper.setFinish(); 
lineNodes[383]=[339,41] ; 

paper.setStart(); 
s1='M '+nx[341]+' '+bb[341]+' L '+nx[341]+' '+ny[429]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[384]=paper.setFinish(); 
lineNodes[384]=[341,429]; 

paper.setStart(); 
mid=bb[342]+(bt[204]-bb[342])/2; 
hleft = nx[109]; 
hright = nx[342]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[342]+' '+bb[342]+' L '+nx[342]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[109]+' '+mid+' L '+nx[109]+' '+bt[109];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[385]=paper.setFinish(); 
lineNodes[385]=[342,109]; 

paper.setStart(); 
mid=bb[342]+(bt[204]-bb[342])/2; 
hleft = nx[204]; 
hright = nx[342]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[204]+' '+mid+' L '+nx[204]+' '+bt[204];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[386]=paper.setFinish(); 
lineNodes[386]=[342,204]; 

paper.setStart(); 
s1='M '+nx[343]+' '+bb[343]+' L '+nx[343]+' '+ny[431]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[343]+' '+ny[431]+' L '+nx[5]+' '+ny[431]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[387]=paper.setFinish(); 
lineNodes[387]=[343,431]; 

paper.setStart(); 
s1='M '+nx[345]+' '+bb[345]+' L '+nx[345]+' '+bt[95]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[388]=paper.setFinish(); 
lineNodes[388]=[345,95] ; 

paper.setStart(); 
mid=bb[346]+(bt[326]-bb[346])/2; 
hleft = nx[326]; 
hright = nx[346]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[346]+' '+bb[346]+' L '+nx[346]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[326]+' '+mid+' L '+nx[326]+' '+bt[326];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[389]=paper.setFinish(); 
lineNodes[389]=[346,326]; 

paper.setStart(); 
mid=bb[346]+(bt[326]-bb[346])/2; 
hleft = nx[205]; 
hright = nx[346]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[205]+' '+mid+' L '+nx[205]+' '+bt[205];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[390]=paper.setFinish(); 
lineNodes[390]=[346,205]; 

paper.setStart(); 
mid=bb[346]+(bt[326]-bb[346])/2; 
s3='M '+nx[352]+' '+mid+' L '+nx[352]+' '+bt[352];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[391]=paper.setFinish(); 
lineNodes[391]=[346,352]; 

paper.setStart(); 
s1='M '+nx[348]+' '+bb[348]+' L '+nx[348]+' '+bt[400]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[392]=paper.setFinish(); 
lineNodes[392]=[348,400] ; 

paper.setStart(); 
s1='M '+nx[350]+' '+bb[350]+' L '+nx[350]+' '+ny[443]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[393]=paper.setFinish(); 
lineNodes[393]=[350,443]; 

paper.setStart(); 
s1='M '+nx[351]+' '+bb[351]+' L '+nx[351]+' '+bt[82]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[394]=paper.setFinish(); 
lineNodes[394]=[351,82] ; 

paper.setStart(); 
s1='M '+nx[352]+' '+bb[352]+' L '+nx[352]+' '+bt[76]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[395]=paper.setFinish(); 
lineNodes[395]=[352,76] ; 

paper.setStart(); 
mid=bb[353]+(bt[0]-bb[353])/2; 
hleft = nx[0]; 
hright = nx[353]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[353]+' '+bb[353]+' L '+nx[353]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[0]+' '+mid+' L '+nx[0]+' '+bt[0];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[396]=paper.setFinish(); 
lineNodes[396]=[353,0]; 

paper.setStart(); 
mid=bb[353]+(bt[0]-bb[353])/2; 
hleft = nx[51]; 
hright = nx[353]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[51]+' '+mid+' L '+nx[51]+' '+bt[51];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[397]=paper.setFinish(); 
lineNodes[397]=[353,51]; 

paper.setStart(); 
mid=bb[354]+(bt[233]-bb[354])/2; 
s2='M '+nx[354]+' '+bb[354]+' L '+nx[354]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[233]+' '+mid+' L '+nx[233]+' '+bt[233];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[398]=paper.setFinish(); 
lineNodes[398]=[354,233]; 

paper.setStart(); 
mid=bb[354]+(bt[233]-bb[354])/2; 
hleft = nx[369]; 
hright = nx[354]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[369]+' '+mid+' L '+nx[369]+' '+bt[369];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[399]=paper.setFinish(); 
lineNodes[399]=[354,369]; 

paper.setStart(); 
mid=bb[354]+(bt[233]-bb[354])/2; 
hleft = nx[45]; 
hright = nx[354]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[45]+' '+mid+' L '+nx[45]+' '+bt[45];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[400]=paper.setFinish(); 
lineNodes[400]=[354,45]; 

paper.setStart(); 
s1='M '+nx[356]+' '+bb[356]+' L '+nx[356]+' '+bt[140]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[401]=paper.setFinish(); 
lineNodes[401]=[356,140] ; 

paper.setStart(); 
s1='M '+nx[357]+' '+bb[357]+' L '+nx[357]+' '+ny[428]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[357]+' '+ny[428]+' L '+nx[136]+' '+ny[428]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[402]=paper.setFinish(); 
lineNodes[402]=[357,428]; 

paper.setStart(); 
s1='M '+nx[358]+' '+bb[358]+' L '+nx[358]+' '+bt[256]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[403]=paper.setFinish(); 
lineNodes[403]=[358,256] ; 

paper.setStart(); 
mid=bb[360]+(bt[310]-bb[360])/2; 
hleft = nx[327]; 
hright = nx[360]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[360]+' '+bb[360]+' L '+nx[360]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[327]+' '+mid+' L '+nx[327]+' '+bt[327];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[404]=paper.setFinish(); 
lineNodes[404]=[360,327]; 

paper.setStart(); 
mid=bb[360]+(bt[310]-bb[360])/2; 
hleft = nx[310]; 
hright = nx[360]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[310]+' '+mid+' L '+nx[310]+' '+bt[310];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[405]=paper.setFinish(); 
lineNodes[405]=[360,310]; 

paper.setStart(); 
s1='M '+nx[361]+' '+bb[361]+' L '+nx[361]+' '+bt[338]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[406]=paper.setFinish(); 
lineNodes[406]=[361,338] ; 

paper.setStart(); 
mid=bb[363]+(bt[218]-bb[363])/2; 
hleft = nx[355]; 
hright = nx[363]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[363]+' '+bb[363]+' L '+nx[363]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[355]+' '+mid+' L '+nx[355]+' '+bt[355];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[407]=paper.setFinish(); 
lineNodes[407]=[363,355]; 

paper.setStart(); 
mid=bb[363]+(bt[218]-bb[363])/2; 
hleft = nx[218]; 
hright = nx[363]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[218]+' '+mid+' L '+nx[218]+' '+bt[218];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[408]=paper.setFinish(); 
lineNodes[408]=[363,218]; 

paper.setStart(); 
s1='M '+nx[364]+' '+bb[364]+' L '+nx[364]+' '+bt[130]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[409]=paper.setFinish(); 
lineNodes[409]=[364,130] ; 

paper.setStart(); 
s1='M '+nx[365]+' '+bb[365]+' L '+nx[365]+' '+ny[428]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[410]=paper.setFinish(); 
lineNodes[410]=[365,428]; 

paper.setStart(); 
mid=bb[367]+(bt[249]-bb[367])/2; 
hleft = nx[249]; 
hright = nx[367]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[367]+' '+bb[367]+' L '+nx[367]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[249]+' '+mid+' L '+nx[249]+' '+bt[249];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[411]=paper.setFinish(); 
lineNodes[411]=[367,249]; 

paper.setStart(); 
mid=bb[367]+(bt[249]-bb[367])/2; 
hleft = nx[25]; 
hright = nx[367]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[25]+' '+mid+' L '+nx[25]+' '+bt[25];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[412]=paper.setFinish(); 
lineNodes[412]=[367,25]; 

paper.setStart(); 
s1='M '+nx[370]+' '+bb[370]+' L '+nx[370]+' '+ny[429]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[370]+' '+ny[429]+' L '+nx[126]+' '+ny[429]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[413]=paper.setFinish(); 
lineNodes[413]=[370,429]; 

paper.setStart(); 
s1='M '+nx[371]+' '+bb[371]+' L '+nx[371]+' '+ny[424]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[371]+' '+ny[424]+' L '+nx[202]+' '+ny[424]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[414]=paper.setFinish(); 
lineNodes[414]=[371,424]; 

paper.setStart(); 
s1='M '+nx[372]+' '+bb[372]+' L '+nx[372]+' '+bt[115]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[415]=paper.setFinish(); 
lineNodes[415]=[372,115] ; 

paper.setStart(); 
mid=bb[374]+(bt[370]-bb[374])/2; 
hleft = nx[126]; 
hright = nx[374]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[374]+' '+bb[374]+' L '+nx[374]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[126]+' '+mid+' L '+nx[126]+' '+bt[126];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[416]=paper.setFinish(); 
lineNodes[416]=[374,126]; 

paper.setStart(); 
mid=bb[374]+(bt[370]-bb[374])/2; 
s3='M '+nx[341]+' '+mid+' L '+nx[341]+' '+bt[341];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[417]=paper.setFinish(); 
lineNodes[417]=[374,341]; 

paper.setStart(); 
mid=bb[374]+(bt[370]-bb[374])/2; 
s3='M '+nx[20]+' '+mid+' L '+nx[20]+' '+bt[20];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[418]=paper.setFinish(); 
lineNodes[418]=[374,20]; 

paper.setStart(); 
mid=bb[374]+(bt[370]-bb[374])/2; 
hleft = nx[370]; 
hright = nx[374]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[370]+' '+mid+' L '+nx[370]+' '+bt[370];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[419]=paper.setFinish(); 
lineNodes[419]=[374,370]; 

paper.setStart(); 
mid=bb[376]+(bt[321]-bb[376])/2; 
hleft = nx[129]; 
hright = nx[376]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[376]+' '+bb[376]+' L '+nx[376]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[129]+' '+mid+' L '+nx[129]+' '+bt[129];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[420]=paper.setFinish(); 
lineNodes[420]=[376,129]; 

paper.setStart(); 
mid=bb[376]+(bt[321]-bb[376])/2; 
s3='M '+nx[321]+' '+mid+' L '+nx[321]+' '+bt[321];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[421]=paper.setFinish(); 
lineNodes[421]=[376,321]; 

paper.setStart(); 
mid=bb[376]+(bt[321]-bb[376])/2; 
hleft = nx[150]; 
hright = nx[376]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[150]+' '+mid+' L '+nx[150]+' '+bt[150];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[422]=paper.setFinish(); 
lineNodes[422]=[376,150]; 

paper.setStart(); 
mid=bb[377]+(bt[139]-bb[377])/2; 
s2='M '+nx[377]+' '+bb[377]+' L '+nx[377]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[332]+' '+mid+' L '+nx[332]+' '+bt[332];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[423]=paper.setFinish(); 
lineNodes[423]=[377,332]; 

paper.setStart(); 
mid=bb[377]+(bt[139]-bb[377])/2; 
s3='M '+nx[166]+' '+mid+' L '+nx[166]+' '+bt[166];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[424]=paper.setFinish(); 
lineNodes[424]=[377,166]; 

paper.setStart(); 
mid=bb[377]+(bt[139]-bb[377])/2; 
hleft = nx[47]; 
hright = nx[377]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[47]+' '+mid+' L '+nx[47]+' '+bt[47];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[425]=paper.setFinish(); 
lineNodes[425]=[377,47]; 

paper.setStart(); 
mid=bb[377]+(bt[139]-bb[377])/2; 
s3='M '+nx[139]+' '+mid+' L '+nx[139]+' '+bt[139];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[426]=paper.setFinish(); 
lineNodes[426]=[377,139]; 

paper.setStart(); 
mid=bb[377]+(bt[139]-bb[377])/2; 
hleft = nx[392]; 
hright = nx[377]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[392]+' '+mid+' L '+nx[392]+' '+bt[392];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[427]=paper.setFinish(); 
lineNodes[427]=[377,392]; 

paper.setStart(); 
s1='M '+nx[378]+' '+bb[378]+' L '+nx[378]+' '+bt[207]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[428]=paper.setFinish(); 
lineNodes[428]=[378,207] ; 

paper.setStart(); 
s1='M '+nx[381]+' '+bb[381]+' L '+nx[381]+' '+bt[329]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[429]=paper.setFinish(); 
lineNodes[429]=[381,329] ; 

paper.setStart(); 
s1='M '+nx[382]+' '+bb[382]+' L '+nx[382]+' '+ny[441]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[430]=paper.setFinish(); 
lineNodes[430]=[382,441]; 

paper.setStart(); 
s1='M '+nx[383]+' '+bb[383]+' L '+nx[383]+' '+ny[438]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[431]=paper.setFinish(); 
lineNodes[431]=[383,438]; 

paper.setStart(); 
s1='M '+nx[385]+' '+bb[385]+' L '+nx[385]+' '+ny[427]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[432]=paper.setFinish(); 
lineNodes[432]=[385,427]; 

paper.setStart(); 
s1='M '+nx[386]+' '+bb[386]+' L '+nx[386]+' '+ny[432]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[433]=paper.setFinish(); 
lineNodes[433]=[386,432]; 

paper.setStart(); 
s1='M '+nx[387]+' '+bb[387]+' L '+nx[387]+' '+bt[273]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[434]=paper.setFinish(); 
lineNodes[434]=[387,273] ; 

paper.setStart(); 
s1='M '+nx[388]+' '+bb[388]+' L '+nx[388]+' '+bt[144]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[435]=paper.setFinish(); 
lineNodes[435]=[388,144] ; 

paper.setStart(); 
s1='M '+nx[389]+' '+bb[389]+' L '+nx[389]+' '+ny[440]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[436]=paper.setFinish(); 
lineNodes[436]=[389,440]; 

paper.setStart(); 
mid=bb[390]+(bt[313]-bb[390])/2; 
hleft = nx[313]; 
hright = nx[390]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[390]+' '+bb[390]+' L '+nx[390]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[313]+' '+mid+' L '+nx[313]+' '+bt[313];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[437]=paper.setFinish(); 
lineNodes[437]=[390,313]; 

paper.setStart(); 
mid=bb[390]+(bt[313]-bb[390])/2; 
s3='M '+nx[29]+' '+mid+' L '+nx[29]+' '+bt[29];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[438]=paper.setFinish(); 
lineNodes[438]=[390,29]; 

paper.setStart(); 
mid=bb[390]+(bt[313]-bb[390])/2; 
hleft = nx[66]; 
hright = nx[390]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[66]+' '+mid+' L '+nx[66]+' '+bt[66];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[439]=paper.setFinish(); 
lineNodes[439]=[390,66]; 

paper.setStart(); 
mid=bb[393]+(bt[169]-bb[393])/2; 
s2='M '+nx[393]+' '+bb[393]+' L '+nx[393]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[169]+' '+mid+' L '+nx[169]+' '+bt[169];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[440]=paper.setFinish(); 
lineNodes[440]=[393,169]; 

paper.setStart(); 
mid=bb[393]+(bt[169]-bb[393])/2; 
hleft = nx[330]; 
hright = nx[393]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[330]+' '+mid+' L '+nx[330]+' '+bt[330];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[441]=paper.setFinish(); 
lineNodes[441]=[393,330]; 

paper.setStart(); 
mid=bb[393]+(bt[169]-bb[393])/2; 
hleft = nx[292]; 
hright = nx[393]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[292]+' '+mid+' L '+nx[292]+' '+bt[292];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[442]=paper.setFinish(); 
lineNodes[442]=[393,292]; 

paper.setStart(); 
s1='M '+nx[394]+' '+bb[394]+' L '+nx[394]+' '+bt[70]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[443]=paper.setFinish(); 
lineNodes[443]=[394,70] ; 

paper.setStart(); 
s1='M '+nx[396]+' '+bb[396]+' L '+nx[396]+' '+bt[21]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[444]=paper.setFinish(); 
lineNodes[444]=[396,21] ; 

paper.setStart(); 
s1='M '+nx[397]+' '+bb[397]+' L '+nx[397]+' '+ny[437]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[397]+' '+ny[437]+' L '+nx[289]+' '+ny[437]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[445]=paper.setFinish(); 
lineNodes[445]=[397,437]; 

paper.setStart(); 
mid=bb[398]+(bt[125]-bb[398])/2; 
hleft = nx[278]; 
hright = nx[398]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[398]+' '+bb[398]+' L '+nx[398]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[278]+' '+mid+' L '+nx[278]+' '+bt[278];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[446]=paper.setFinish(); 
lineNodes[446]=[398,278]; 

paper.setStart(); 
mid=bb[398]+(bt[125]-bb[398])/2; 
hleft = nx[125]; 
hright = nx[398]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[125]+' '+mid+' L '+nx[125]+' '+bt[125];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[447]=paper.setFinish(); 
lineNodes[447]=[398,125]; 

paper.setStart(); 
mid=bb[399]+(bt[409]-bb[399])/2; 
s2='M '+nx[399]+' '+bb[399]+' L '+nx[399]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[302]+' '+mid+' L '+nx[302]+' '+bt[302];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[448]=paper.setFinish(); 
lineNodes[448]=[399,302]; 

paper.setStart(); 
mid=bb[399]+(bt[409]-bb[399])/2; 
s3='M '+nx[28]+' '+mid+' L '+nx[28]+' '+bt[28];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[449]=paper.setFinish(); 
lineNodes[449]=[399,28]; 

paper.setStart(); 
mid=bb[399]+(bt[409]-bb[399])/2; 
hleft = nx[185]; 
hright = nx[399]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[185]+' '+mid+' L '+nx[185]+' '+bt[185];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[450]=paper.setFinish(); 
lineNodes[450]=[399,185]; 

paper.setStart(); 
mid=bb[399]+(bt[409]-bb[399])/2; 
hleft = nx[409]; 
hright = nx[399]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[409]+' '+mid+' L '+nx[409]+' '+bt[409];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[451]=paper.setFinish(); 
lineNodes[451]=[399,409]; 

paper.setStart(); 
mid=bb[399]+(bt[409]-bb[399])/2; 
s3='M '+nx[196]+' '+mid+' L '+nx[196]+' '+bt[196];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[452]=paper.setFinish(); 
lineNodes[452]=[399,196]; 

paper.setStart(); 
s1='M '+nx[400]+' '+bb[400]+' L '+nx[400]+' '+bt[23]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[453]=paper.setFinish(); 
lineNodes[453]=[400,23] ; 

paper.setStart(); 
s1='M '+nx[401]+' '+bb[401]+' L '+nx[401]+' '+ny[419]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[454]=paper.setFinish(); 
lineNodes[454]=[401,419]; 

paper.setStart(); 
mid=bb[403]+(bt[324]-bb[403])/2; 
s2='M '+nx[403]+' '+bb[403]+' L '+nx[403]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[165]+' '+mid+' L '+nx[165]+' '+bt[165];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[455]=paper.setFinish(); 
lineNodes[455]=[403,165]; 

paper.setStart(); 
mid=bb[403]+(bt[324]-bb[403])/2; 
s3='M '+nx[186]+' '+mid+' L '+nx[186]+' '+bt[186];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[456]=paper.setFinish(); 
lineNodes[456]=[403,186]; 

paper.setStart(); 
mid=bb[403]+(bt[324]-bb[403])/2; 
s3='M '+nx[192]+' '+mid+' L '+nx[192]+' '+bt[192];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[457]=paper.setFinish(); 
lineNodes[457]=[403,192]; 

paper.setStart(); 
mid=bb[403]+(bt[324]-bb[403])/2; 
hleft = nx[311]; 
hright = nx[403]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[311]+' '+mid+' L '+nx[311]+' '+bt[311];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[458]=paper.setFinish(); 
lineNodes[458]=[403,311]; 

paper.setStart(); 
mid=bb[403]+(bt[324]-bb[403])/2; 
hleft = nx[324]; 
hright = nx[403]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[324]+' '+mid+' L '+nx[324]+' '+bt[324];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[459]=paper.setFinish(); 
lineNodes[459]=[403,324]; 

paper.setStart(); 
s1='M '+nx[405]+' '+bb[405]+' L '+nx[405]+' '+ny[438]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[460]=paper.setFinish(); 
lineNodes[460]=[405,438]; 

paper.setStart(); 
s1='M '+nx[406]+' '+bb[406]+' L '+nx[406]+' '+bt[172]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[461]=paper.setFinish(); 
lineNodes[461]=[406,172] ; 

paper.setStart(); 
s1='M '+nx[407]+' '+bb[407]+' L '+nx[407]+' '+ny[434]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[407]+' '+ny[434]+' L '+nx[223]+' '+ny[434]; 
h=paper.path(s2); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[462]=paper.setFinish(); 
lineNodes[462]=[407,434]; 

paper.setStart(); 
s1='M '+nx[412]+' '+bb[412]+' L '+nx[412]+' '+ny[422]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[463]=paper.setFinish(); 
lineNodes[463]=[412,422]; 

paper.setStart(); 
s1='M '+nx[413]+' '+bb[413]+' L '+nx[413]+' '+ny[432]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[464]=paper.setFinish(); 
lineNodes[464]=[413,432]; 

paper.setStart(); 
s1='M '+nx[414]+' '+bb[414]+' L '+nx[414]+' '+bt[285]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[465]=paper.setFinish(); 
lineNodes[465]=[414,285] ; 

paper.setStart(); 
s1='M '+nx[416]+' '+bb[416]+' L '+nx[416]+' '+ny[436]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[466]=paper.setFinish(); 
lineNodes[466]=[416,436]; 

paper.setStart(); 
s1='M '+nx[417]+' '+bb[417]+' L '+nx[417]+' '+bt[381]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[467]=paper.setFinish(); 
lineNodes[467]=[417,381] ; 

paper.setStart(); 
s1='M '+nx[418]+' '+bb[418]+' L '+nx[418]+' '+bt[179]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[468]=paper.setFinish(); 
lineNodes[468]=[418,179] ; 

paper.setStart(); 
mid=bb[419]+(bt[141]-bb[419])/2; 
hleft = nx[141]; 
hright = nx[419]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[419]+' '+bb[419]+' L '+nx[419]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[141]+' '+mid+' L '+nx[141]+' '+bt[141];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[469]=paper.setFinish(); 
lineNodes[469]=[419,141]; 

paper.setStart(); 
mid=bb[419]+(bt[141]-bb[419])/2; 
hleft = nx[325]; 
hright = nx[419]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[325]+' '+mid+' L '+nx[325]+' '+bt[325];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[470]=paper.setFinish(); 
lineNodes[470]=[419,325]; 

paper.setStart(); 
s1='M '+nx[420]+' '+bb[420]+' L '+nx[420]+' '+bt[353]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[471]=paper.setFinish(); 
lineNodes[471]=[420,353] ; 

paper.setStart(); 
s1='M '+nx[421]+' '+bb[421]+' L '+nx[421]+' '+bt[198]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[472]=paper.setFinish(); 
lineNodes[472]=[421,198] ; 

paper.setStart(); 
mid=bb[422]+(bt[38]-bb[422])/2; 
hleft = nx[258]; 
hright = nx[422]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[422]+' '+bb[422]+' L '+nx[422]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[258]+' '+mid+' L '+nx[258]+' '+bt[258];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[473]=paper.setFinish(); 
lineNodes[473]=[422,258]; 

paper.setStart(); 
mid=bb[422]+(bt[38]-bb[422])/2; 
hleft = nx[38]; 
hright = nx[422]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[38]+' '+mid+' L '+nx[38]+' '+bt[38];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[474]=paper.setFinish(); 
lineNodes[474]=[422,38]; 

paper.setStart(); 
s1='M '+nx[423]+' '+bb[423]+' L '+nx[423]+' '+bt[10]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[475]=paper.setFinish(); 
lineNodes[475]=[423,10] ; 

paper.setStart(); 
s1='M '+nx[424]+' '+bb[424]+' L '+nx[424]+' '+bt[188]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[476]=paper.setFinish(); 
lineNodes[476]=[424,188] ; 

paper.setStart(); 
s1='M '+nx[425]+' '+bb[425]+' L '+nx[425]+' '+bt[133]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[477]=paper.setFinish(); 
lineNodes[477]=[425,133] ; 

paper.setStart(); 
s1='M '+nx[426]+' '+bb[426]+' L '+nx[426]+' '+bt[390]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[478]=paper.setFinish(); 
lineNodes[478]=[426,390] ; 

paper.setStart(); 
s1='M '+nx[427]+' '+bb[427]+' L '+nx[427]+' '+bt[164]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[479]=paper.setFinish(); 
lineNodes[479]=[427,164] ; 

paper.setStart(); 
mid=bb[428]+(bt[210]-bb[428])/2; 
hleft = nx[210]; 
hright = nx[428]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s2='M '+nx[428]+' '+bb[428]+' L '+nx[428]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[210]+' '+mid+' L '+nx[210]+' '+bt[210];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[480]=paper.setFinish(); 
lineNodes[480]=[428,210]; 

paper.setStart(); 
mid=bb[428]+(bt[210]-bb[428])/2; 
hleft = nx[137]; 
hright = nx[428]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[137]+' '+mid+' L '+nx[137]+' '+bt[137];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[481]=paper.setFinish(); 
lineNodes[481]=[428,137]; 

paper.setStart(); 
s1='M '+nx[429]+' '+bb[429]+' L '+nx[429]+' '+bt[8]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[482]=paper.setFinish(); 
lineNodes[482]=[429,8] ; 

paper.setStart(); 
s1='M '+nx[430]+' '+bb[430]+' L '+nx[430]+' '+bt[73]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[483]=paper.setFinish(); 
lineNodes[483]=[430,73] ; 

paper.setStart(); 
s1='M '+nx[431]+' '+bb[431]+' L '+nx[431]+' '+bt[202]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[484]=paper.setFinish(); 
lineNodes[484]=[431,202] ; 

paper.setStart(); 
s1='M '+nx[432]+' '+bb[432]+' L '+nx[432]+' '+bt[142]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[485]=paper.setFinish(); 
lineNodes[485]=[432,142] ; 

paper.setStart(); 
s1='M '+nx[433]+' '+bb[433]+' L '+nx[433]+' '+bt[145]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[486]=paper.setFinish(); 
lineNodes[486]=[433,145] ; 

paper.setStart(); 
s1='M '+nx[434]+' '+bb[434]+' L '+nx[434]+' '+bt[168]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[487]=paper.setFinish(); 
lineNodes[487]=[434,168] ; 

paper.setStart(); 
s1='M '+nx[435]+' '+bb[435]+' L '+nx[435]+' '+bt[379]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[488]=paper.setFinish(); 
lineNodes[488]=[435,379] ; 

paper.setStart(); 
s1='M '+nx[436]+' '+bb[436]+' L '+nx[436]+' '+bt[208]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[489]=paper.setFinish(); 
lineNodes[489]=[436,208] ; 

paper.setStart(); 
s1='M '+nx[437]+' '+bb[437]+' L '+nx[437]+' '+bt[160]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[490]=paper.setFinish(); 
lineNodes[490]=[437,160] ; 

paper.setStart(); 
s1='M '+nx[438]+' '+bb[438]+' L '+nx[438]+' '+bt[67]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[491]=paper.setFinish(); 
lineNodes[491]=[438,67] ; 

paper.setStart(); 
mid=bb[439]+(bt[402]-bb[439])/2; 
s2='M '+nx[439]+' '+bb[439]+' L '+nx[439]+' '+mid; 
v1=paper.path(s2); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[201]+' '+mid+' L '+nx[201]+' '+bt[201];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[492]=paper.setFinish(); 
lineNodes[492]=[439,201]; 

paper.setStart(); 
mid=bb[439]+(bt[402]-bb[439])/2; 
s3='M '+nx[238]+' '+mid+' L '+nx[238]+' '+bt[238];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[493]=paper.setFinish(); 
lineNodes[493]=[439,238]; 

paper.setStart(); 
mid=bb[439]+(bt[402]-bb[439])/2; 
s3='M '+nx[211]+' '+mid+' L '+nx[211]+' '+bt[211];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[494]=paper.setFinish(); 
lineNodes[494]=[439,211]; 

paper.setStart(); 
mid=bb[439]+(bt[402]-bb[439])/2; 
hleft = nx[402]; 
hright = nx[439]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[402]+' '+mid+' L '+nx[402]+' '+bt[402];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[495]=paper.setFinish(); 
lineNodes[495]=[439,402]; 

paper.setStart(); 
mid=bb[439]+(bt[402]-bb[439])/2; 
hleft = nx[248]; 
hright = nx[439]; 
s1='M '+hleft+' '+mid+' L '+hright+' '+mid; 
h=paper.path(s1); 
h.attr({stroke:"#333333", "stroke-width": "3"}); 
s3='M '+nx[248]+' '+mid+' L '+nx[248]+' '+bt[248];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[496]=paper.setFinish(); 
lineNodes[496]=[439,248]; 

paper.setStart(); 
mid=bb[439]+(bt[402]-bb[439])/2; 
s3='M '+nx[154]+' '+mid+' L '+nx[154]+' '+bt[154];
v2=paper.path(s3); 
v2.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[497]=paper.setFinish(); 
lineNodes[497]=[439,154]; 

paper.setStart(); 
s1='M '+nx[440]+' '+bb[440]+' L '+nx[440]+' '+bt[77]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[498]=paper.setFinish(); 
lineNodes[498]=[440,77] ; 

paper.setStart(); 
s1='M '+nx[441]+' '+bb[441]+' L '+nx[441]+' '+bt[333]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[499]=paper.setFinish(); 
lineNodes[499]=[441,333] ; 

paper.setStart(); 
s1='M '+nx[442]+' '+bb[442]+' L '+nx[442]+' '+bt[83]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[500]=paper.setFinish(); 
lineNodes[500]=[442,83] ; 

paper.setStart(); 
s1='M '+nx[443]+' '+bb[443]+' L '+nx[443]+' '+bt[149]; 
v1=paper.path(s1); 
v1.attr({stroke:"#333333", "stroke-width": "3"}); 
lines[501]=paper.setFinish(); 
lineNodes[501]=[443,149] ; 

nlines = 502;
}