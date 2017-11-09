--
-- Initial data set.
--

--
-- Dumping data for table `Countries`
--

LOCK TABLES `Countries` WRITE;
/*!40000 ALTER TABLE `Countries` DISABLE KEYS */;
INSERT INTO `Countries` (`id`, `name`, `code2Letter`, `code3Letter`, `codeNumeric`, `image`, `updated`, `created`) VALUES
(1,'United States','US','USA',840,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(2,'Afghanistan','AF','AFG',4,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(3,'Aland Islands','AX','ALA',248,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(4,'Albania','AL','ALB',8,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(5,'Algeria','DZ','DZA',12,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(6,'American Samoa','AS','ASM',16,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(7,'Andorra','AD','AND',20,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(8,'Angola','AO','AGO',24,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(9,'Anguilla','AI','AIA',660,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(10,'Antarctica','AQ','ATA',10,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(11,'Antigua and Barbuda','AG','ATG',28,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(12,'Argentina','AR','ARG',32,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(13,'Armenia','AM','ARM',51,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(14,'Aruba','AW','ABW',533,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(15,'Australia','AU','AUS',36,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(16,'Austria','AT','AUT',40,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(17,'Azerbaijan','AZ','AZE',31,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(18,'Bahamas','BS','BHS',44,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(19,'Bahrain','BH','BHR',48,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(20,'Bangladesh','BD','BGD',50,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(21,'Barbados','BB','BRB',52,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(22,'Belarus','BY','BLR',112,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(23,'Belgium','BE','BEL',56,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(24,'Belize','BZ','BLZ',84,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(25,'Benin','BJ','BEN',204,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(26,'Bermuda','BM','BMU',60,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(27,'Bhutan','BT','BTN',64,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(28,'Bolivia','BO','BOL',68,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(29,'Bosnia and Herzegovina','BA','BIH',70,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(30,'Botswana','BW','BWA',72,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(31,'Bouvet Island','BV','BVT',74,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(32,'Brazil','BR','BRA',76,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(33,'British Indian Ocean Territory','IO','IOT',86,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(34,'Brunei Darussalam','BN','BRN',96,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(35,'Bulgaria','BG','BGR',100,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(36,'Burkina Faso','BF','BFA',854,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(37,'Burundi','BI','BDI',108,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(38,'Cambodia','KH','KHM',116,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(39,'Cameroon','CM','CMR',120,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(40,'Canada','CA','CAN',124,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(41,'Cape Verde','CV','CPV',132,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(42,'Cayman Islands','KY','CYM',136,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(43,'Central African Republic','CF','CAF',140,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(44,'Chad','TD','TCD',148,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(45,'Chile','CL','CHL',152,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(46,'China','CN','CHN',156,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(47,'Christmas Island','CX','CXR',162,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(48,'Cocos (Keeling) Islands','CC','CCK',166,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(49,'Colombia','CO','COL',170,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(50,'Comoros','KM','COM',174,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(51,'Congo','CG','COG',178,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(52,'Congo, The Democratic Republic of the','CD','COD',180,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(53,'Cook Islands','CK','COK',184,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(54,'Costa Rica','CR','CRI',188,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(55,'Cote D\'Ivoire','CI','CIV',384,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(56,'Croatia','HR','HRV',191,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(57,'Cuba','CU','CUB',192,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(58,'Cyprus','CY','CYP',196,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(59,'Czech Republic','CZ','CZE',203,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(60,'Denmark','DK','DNK',208,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(61,'Djibouti','DJ','DJI',262,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(62,'Dominica','DM','DMA',212,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(63,'Dominican Republic','DO','DOM',214,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(64,'Ecuador','EC','ECU',218,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(65,'Egypt','EG','EGY',818,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(66,'El Salvador','SV','SLV',222,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(67,'Equatorial Guinea','GQ','GNQ',226,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(68,'Eritrea','ER','ERI',232,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(69,'Estonia','EE','EST',233,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(70,'Ethiopia','ET','ETH',231,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(71,'Falkland Islands (Malvinas)','FK','FLK',238,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(72,'Faroe Islands','FO','FRO',234,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(73,'Fiji','FJ','FJI',242,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(74,'Finland','FI','FIN',246,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(75,'France','FR','FRA',250,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(76,'French Guiana','GF','GUF',254,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(77,'French Polynesia','PF','PYF',258,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(78,'French Southern Territories','TF','ATF',260,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(79,'Gabon','GA','GAB',266,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(80,'Gambia','GM','GMB',270,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(81,'Georgia','GE','GEO',268,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(82,'Germany','DE','DEU',276,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(83,'Ghana','GH','GHA',288,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(84,'Gibraltar','GI','GIB',292,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(85,'Greece','GR','GRC',300,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(86,'Greenland','GL','GRL',304,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(87,'Grenada','GD','GRD',308,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(88,'Guadeloupe','GP','GLP',312,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(89,'Guam','GU','GUM',316,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(90,'Guatemala','GT','GTM',320,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(91,'Guernsey','GG','GGY',831,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(92,'Guinea','GN','GIN',324,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(93,'Guinea-Bissau','GW','GNB',624,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(94,'Guyana','GY','GUY',328,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(95,'Haiti','HT','HTI',332,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(96,'Heard Island and McDonald Islands','HM','HMD',334,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(97,'Honduras','HN','HND',340,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(98,'Hong Kong','HK','HKG',344,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(99,'Hungary','HU','HUN',348,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(100,'Iceland','IS','ISL',352,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(101,'India','IN','IND',356,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(102,'Indonesia','ID','IDN',360,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(103,'Iran (Islamic Republic of)','IR','IRN',364,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(104,'Iraq','IQ','IRQ',368,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(105,'Ireland','IE','IRL',372,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(106,'Isle of Man','IM','IMM',833,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(107,'Israel','IL','ISR',376,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(108,'Italy','IT','ITA',380,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(109,'Jamaica','JM','JAM',388,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(110,'Japan','JP','JPN',392,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(111,'Jersey','JE','JEY',832,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(112,'Jordan','JO','JOR',400,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(113,'Kazakhstan','KZ','KAZ',398,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(114,'Kenya','KE','KEN',404,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(115,'Kiribati','KI','KIR',296,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(116,'Korea, Democratic People\'s Republic of','KP','PRK',408,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(117,'Korea, Republic of','KR','KOR',410,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(118,'Kuwait','KW','KWT',414,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(119,'Kyrgyzstan','KG','KGZ',417,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(120,'Lao People\'s Democratic Republic','LA','LAO',418,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(121,'Latvia','LV','LVA',428,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(122,'Lebanon','LB','LBN',422,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(123,'Lesotho','LS','LSO',426,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(124,'Liberia','LR','LBR',430,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(125,'Libyan Arab Jamahiriya','LY','LBY',434,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(126,'Liechtenstein','LI','LIE',438,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(127,'Lithuania','LT','LTU',440,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(128,'Luxembourg','LU','LUX',442,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(129,'Macao','MO','MAC',446,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(130,'Macedonia, The Former Yugoslav Republic of','MK','MKD',807,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(131,'Madagascar','MG','MDG',450,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(132,'Malawi','MW','MWI',454,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(133,'Malaysia','MY','MYS',458,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(134,'Maldives','MV','MDV',462,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(135,'Mali','ML','MLI',466,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(136,'Malta','MT','MLT',470,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(137,'Marshall Islands','MH','MHL',584,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(138,'Martinique','MQ','MTQ',474,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(139,'Mauritania','MR','MRT',478,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(140,'Mauritius','MU','MUS',480,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(141,'Mayotte','YT','MYT',175,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(142,'Mexico','MX','MEX',484,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(143,'Micronesia, Federated States of','FM','FSM',583,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(144,'Moldova, Republic of','MD','MDA',498,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(145,'Monaco','MC','MCO',492,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(146,'Mongolia','MN','MNG',496,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(147,'Montenegro','ME','MNE',499,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(148,'Montserrat','MS','MSR',500,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(149,'Morocco','MA','MAR',504,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(150,'Mozambique','MZ','MOZ',508,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(151,'Myanmar','MM','MMR',104,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(152,'Namibia','NA','NAM',516,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(153,'Nauru','NR','NRU',520,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(154,'Nepal','NP','NPL',524,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(155,'Netherlands','NL','NLD',528,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(156,'Netherlands Antilles','AN','ANT',530,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(157,'New Caledonia','NC','NCL',540,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(158,'New Zealand','NZ','NZL',554,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(159,'Nicaragua','NI','NIC',558,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(160,'Niger','NE','NER',562,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(161,'Nigeria','NG','NGA',566,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(162,'Niue','NU','NIU',570,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(163,'Norfolk Island','NF','NFK',574,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(164,'Northern Mariana Islands','MP','MNP',580,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(165,'Norway','NO','NOR',578,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(166,'Oman','OM','OMN',512,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(167,'Pakistan','PK','PAK',586,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(168,'Palau','PW','PLW',585,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(169,'Palestinian Territory, Occupied','PS','PSE',275,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(170,'Panama','PA','PAN',591,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(171,'Papua New Guinea','PG','PNG',598,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(172,'Paraguay','PY','PRY',600,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(173,'Peru','PE','PER',604,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(174,'Philippines','PH','PHL',608,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(175,'Pitcairn','PN','PCN',612,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(176,'Poland','PL','POL',616,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(177,'Portugal','PT','PRT',620,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(178,'Puerto Rico','PR','PRI',630,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(179,'Qatar','QA','QAT',634,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(180,'Reunion','RE','REU',638,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(181,'Romania','RO','ROU',642,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(182,'Russian Federation','RU','RUS',643,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(183,'Rwanda','RW','RWA',646,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(184,'Saint Barthelemy','BL','BLM',652,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(185,'Saint Helena','SH','SHN',654,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(186,'Saint Kitts and Nevis','KN','KNA',659,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(187,'Saint Lucia','LC','LCA',662,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(189,'Saint Pierre and Miquelon','PM','SPM',666,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(190,'Saint Vincent and the Grenadines','VC','VCT',670,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(191,'Samoa','WS','WSM',882,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(192,'San Marino','SM','SMR',674,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(193,'Sao Tome and Principe','ST','STP',678,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(194,'Saudi Arabia','SA','SAU',682,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(195,'Senegal','SN','SEN',686,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(196,'Serbia','RS','SRB',688,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(197,'Seychelles','SC','SYC',690,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(198,'Sierra Leone','SL','SLE',694,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(199,'Singapore','SG','SGP',702,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(200,'Slovakia','SK','SVK',703,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(201,'Slovenia','SI','SVN',705,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(202,'Solomon Islands','SB','SLB',90,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(203,'Somalia','SO','SOM',706,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(204,'South Africa','ZA','ZAF',710,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(205,'South Georgia and the South Sandwich Islands','GS','SGS',239,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(206,'Spain','ES','ESP',724,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(207,'Sri Lanka','LK','LKA',144,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(208,'Sudan','SD','SDN',736,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(209,'Suriname','SR','SUR',740,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(210,'Svalbard and Jan Mayen','SJ','SJM',744,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(211,'Swaziland','SZ','SWZ',748,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(212,'Sweden','SE','SWE',752,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(213,'Switzerland','CH','CHE',756,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(214,'Syrian Arab Republic','SY','SYR',760,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(215,'Taiwan, Province of China','TW','TWN',158,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(216,'Tajikistan','TJ','TJK',762,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(217,'Tanzania, United Republic of','TZ','TZA',834,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(218,'Thailand','TH','THA',764,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(219,'Timor-Leste','TL','TLS',626,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(220,'Togo','TG','TGO',768,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(221,'Tokelau','TK','TKL',772,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(222,'Tonga','TO','TON',776,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(223,'Trinidad and Tobago','TT','TTO',780,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(224,'Tunisia','TN','TUN',788,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(225,'Turkey','TR','TUR',792,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(226,'Turkmenistan','TM','TKM',795,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(227,'Turks and Caicos Islands','TC','TCA',796,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(228,'Tuvalu','TV','TUV',798,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(229,'Uganda','UG','UGA',800,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(230,'Ukraine','UA','UKR',804,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(231,'United Arab Emirates','AE','ARE',784,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(232,'United Kingdom','GB','GBR',826,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(233,'United States Minor Outlying Islands','UM','UMI',581,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(234,'Uruguay','UY','URY',858,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(235,'Uzbekistan','UZ','UZB',860,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(236,'Vanuatu','VU','VUT',548,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(237,'Vatican City State','VA','VAT',336,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(238,'Venezuela','VE','VEN',862,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(239,'Viet Nam','VN','VNM',704,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(240,'Virgin Islands (British)','VG','VGB',92,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(241,'Virgin Islands (U.S.)','VI','VIR',850,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(242,'Wallis And Futuna','WF','WLF',876,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(243,'Western Sahara','EH','ESH',732,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(244,'Yemen','YE','YEM',887,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(245,'Yugoslavia','YU','YUG',891,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(246,'Zambia','ZM','ZMB',894,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14'),
(247,'Zimbabwe','ZW','ZWE',716,NULL,'2010-04-15 19:27:14','2010-04-15 19:27:14');
/*!40000 ALTER TABLE `Countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Languages`
--

LOCK TABLES `Languages` WRITE;
/*!40000 ALTER TABLE `Languages` DISABLE KEYS */;
INSERT INTO `Languages` (`id`, `code`, `name`) VALUES
(1, 'en', 'English');
/*!40000 ALTER TABLE `Languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Subjects`
--

LOCK TABLES `Subjects` WRITE;
/*!40000 ALTER TABLE `Subjects` DISABLE KEYS */;
INSERT INTO `Subjects` (`id`,  `name`, `shortname`, `created`) VALUES
(1, 'Mathematics', 'MAT', NOW()),
(2, 'Engineering', 'ENG', NOW()),
(3, 'Science', 'SCI', NOW()),
(4, 'Technology', 'TEC', NOW()),
(5, 'Social Science', 'SOC', NOW());
/*!40000 ALTER TABLE `Subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Branches`
--

LOCK TABLES `Branches` WRITE;
/*!40000 ALTER TABLE `Branches` DISABLE KEYS */;
INSERT INTO `Branches` (`id`,  `name`, `shortname`, `bisac`, `subjectID`, `created`) VALUES
(1, 'Biology', 'BIO', 'SCI008000', 3, NOW()),
(2, 'Chemistry', 'CHE', 'SCI013000', 3, NOW()),
(3, 'History', 'HIS', 'HIS000000', 5, NOW()),
(4, 'Physics', 'PHY', 'SCI055000', 3, NOW()),
(5, 'Earth Science', 'ESC', 'SCI019000', 3, NOW()),
(10, 'Life Science', 'LSC', 'SCI086000', 3, NOW()),
(11, 'Algebra', 'ALG', 'MAT002000', 1, NOW()),
(12, 'Geometry', 'GEO', 'MAT012000', 1, NOW()),
(13, 'Calculus', 'CAL', 'MAT005000', 1, NOW()),
(14, 'Trigonometry', 'TRG', 'MAT032000', 1, NOW()),
(15, 'Arithmetic', 'ARI', 'MAT004000', 1, NOW()),
(16, 'Measurement', 'MEA', 'MAT020000', 1, NOW()),
(17, 'Statistics', 'STA', 'MAT029000', 1, NOW()),
(18, 'Probability', 'PRB', 'MAT029000', 1, NOW()),
(19, 'Analysis', 'ALY', 'MAT034000', 1, NOW()),
(20, 'Physical Science', 'PSC', 'SCI013050', 3, NOW()),
(21, 'Software Testing', 'TST', 'COM051330', 2, NOW());

/*!40000 ALTER TABLE `Branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ArtifactExtensionTypes`
--

LOCK TABLE `ArtifactExtensionTypes` WRITE;
/*!40000 ALTER TABLE `ArtifactExtensionTypes` DISABLE KEYS */;
INSERT INTO `ArtifactExtensionTypes` (`id`, `typeName`, `description`, `shortname`, `status`, `created`) VALUES
(1, 'concept', 'Concept artifact', 'C', 'published', NOW()),
(2, 'lesson', 'Lesson artifact', 'L', 'published', NOW()),
(3, 'chapter', 'Chapter artifact', 'CH', 'published', NOW()),
(4, 'book', 'Book artifact', 'B', 'published', NOW()),
(5, 'video', 'Video artifact', 'V', 'published', NOW());
/*!40000 ALTER TABLE `ArtifactExtensionTypes` ENABLE KEYS */;
UNLOCK TABLES;
