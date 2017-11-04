--
-- Initial data set.
--

--
-- Dumping data for table `ActionTypes`
--

LOCK TABLES `ActionTypes` WRITE;
/*!40000 ALTER TABLE `ActionTypes` DISABLE KEYS */;
INSERT INTO `ActionTypes` (`id`, `name`, `description`) VALUES
(1, 'browse', 'Browse artifacts'),
(2, 'search', 'Search artifacts'),
(3, 'get', 'Get artifacts'),
(4, 'create', 'Create artifacts'),
(5, 'update', 'Update artifacts'),
(6, 'delete', 'Delete artifacts'),
(7, 'publish', 'Publish artifacts');
/*!40000 ALTER TABLE `ActionTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `InteractiveEntryTypes`
--

LOCK TABLES `InteractiveEntryTypes` WRITE;
/*!40000 ALTER TABLE `InteractiveEntryTypes` DISABLE KEYS */;
INSERT INTO `InteractiveEntryTypes` (`id`, `name`, `description`) VALUES
(1, 'annotation', 'Annotations'),
(2, 'comment', 'Comments'),
(3, 'feedback', 'Feedbacks'),
(4, 'online quiz', 'Online Quizzes'),
(5, 'online help', 'Online Help'),
(6, 'recommendation', 'Recommendations');
/*!40000 ALTER TABLE `InteractiveEntryTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Members`
--

LOCK TABLES `Members` WRITE;
/*!40000 ALTER TABLE `Members` DISABLE KEYS */;
INSERT INTO `Members` (`id`, `defaultLogin`, `login`, `email`, `givenName`, `surname`, `stateID`) VALUES
(1, 'admin', 'admin', 'admin@ck12.org', 'CK12', 'Administrator', 2),
(2, 'guest', 'guest', 'guest@ck12.org', 'Guest', '', 2),
(3, 'ck12editor', 'ck12editor', 'editor@ck12.org', 'CK-12', '', 2),
(4, 'ck12efex', 'ck12eflex', 'eflex@ck12.org', 'CK12', 'eFlex', 2);
/*!40000 ALTER TABLE `Members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Groups`
--

LOCK TABLES `Groups` WRITE;
/*!40000 ALTER TABLE `Groups` DISABLE KEYS */;
INSERT INTO `Groups` (`id`, `parentID`, `name`, `handle`, `description`, `creatorID`) VALUES
(1, 1, 'CK-12 Foundation Group', 'CK-12-Foundation-Group', 'The parent of all groups', 3),
(2, 1, 'CK-12 Foundation Teacher Group', 'CK-12-Foundation-Teacher-Group', 'The group for teachers', 3);
/*!40000 ALTER TABLE `Groups` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `GroupMemberStates` WRITE;
/*!40000 ALTER TABLE `GroupMemberStates` DISABLE KEYS */;
INSERT INTO GroupMemberStates VALUES(1, 'pending', 'The member has not joined the group yet');
INSERT INTO GroupMemberStates VALUES(2, 'active', 'The member has joined the group');
INSERT INTO GroupMemberStates VALUES(3, 'declined', 'The member has declined to join the group');
INSERT INTO GroupMemberStates VALUES(4, 'disabled', 'The member has been disabled in the group');
/*!40000 ALTER TABLE `GroupMemberStates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `MemberRoles`
--

LOCK TABLES `MemberRoles` WRITE;
/*!40000 ALTER TABLE `MemberRoles` DISABLE KEYS */;
INSERT INTO `MemberRoles` (`id`, `name`, `description`, `is_admin_role`) VALUES
(1, 'admin', 'Administrator', 1),
(2, 'guest', 'Non member', 0),
(3, 'author', 'Author', 0),
(4, 'coauthor', 'Co-author', 0),
(5, 'teacher', 'Teacher', 0),
(6, 'parent', 'Parent of student(s)', 0),
(7, 'student', 'Student', 0),
(8, 'staff', 'Staff', 0),
(9, 'contributor', 'Contributor', 0),
(10, 'editor', 'Editor', 0),
(11, 'source', 'Source', 0),
(12, 'translator', 'Translator', 0),
(13, 'member', 'Member', 0),
(14, 'groupmember', 'Member of a User Created Group', 0),
(15, 'groupadmin', 'Admin of a User Created Group', 0),
(16, 'mentor', 'Student Mentor', 0),
(17, 'representative', 'School Representative', 0),
(18, 'reviewer', 'Reviewer', 0),
(19, 'technicalreviewer', 'Technical Reviewer', 0),
(20, 'support-admin', 'admin role for support team', 1),
(21, 'content-admin', 'admin role for content team', 1),
(22, 'content-de-author-admin', 'admin role for Content DE authors', 1),
(23, 'content-contractor-admin', 'admin role for Content Contractor', 1),
(24, 'content-support-admin', 'admin role for Content Support', 1);
/*!40000 ALTER TABLE `MemberRoles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `AccessControls`
--

LOCK TABLES `AccessControls` WRITE;
/*!40000 ALTER TABLE `AccessControls` DISABLE KEYS */;
INSERT INTO `AccessControls` (`roleID`, `actionTypeID`, `isAllowed`) VALUES
(1, 1, 1),
(1, 2, 1),
(1, 3, 1),
(1, 4, 1),
(1, 5, 1),
(1, 6, 1),
(1, 7, 1),
(2, 1, 1),
(2, 2, 1),
(2, 3, 1),
(2, 4, 0),
(2, 5, 0),
(2, 6, 0),
(2, 7, 0),
(3, 1, 1),
(3, 2, 1),
(3, 3, 1),
(3, 4, 1),
(3, 5, 1),
(3, 6, 1),
(3, 7, 1),
(4, 1, 1),
(4, 2, 1),
(4, 3, 1),
(4, 4, 1),
(4, 5, 1),
(4, 6, 1),
(4, 7, 1),
(5, 1, 1),
(5, 2, 1),
(5, 3, 1),
(5, 4, 1),
(5, 5, 1),
(5, 6, 1),
(5, 7, 1),
(6, 1, 1),
(6, 2, 1),
(6, 3, 1),
(6, 4, 0),
(6, 5, 0),
(6, 6, 0),
(6, 7, 0),
(7, 1, 1),
(7, 2, 1),
(7, 3, 1),
(7, 4, 1),
(7, 5, 1),
(7, 6, 1),
(7, 7, 1),
(8, 1, 1),
(8, 2, 1),
(8, 3, 1),
(8, 4, 0),
(8, 5, 0),
(8, 6, 0),
(8, 7, 0);
/*!40000 ALTER TABLE `AccessControls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Licenses`
--

LOCK TABLES `Licenses` WRITE;
/*!40000 ALTER TABLE `Licenses` DISABLE KEYS */;
INSERT INTO `Licenses` (`id`, `name`, `description`) VALUES
(1, 'CC BY NC SA', 'Creative Commons License Non-commercial Share-alike'),
(2, 'CC BY SA', 'Creative Commons License Share-alike'),
(3, 'GNU FDL', 'GNU Free Documentation License'),
(4, 'Public Domain', 'The creative work is in public domain free for any use.');
/*!40000 ALTER TABLE `Licenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ArtifactTypes`
--

LOCK TABLES `ArtifactTypes` WRITE;
/*!40000 ALTER TABLE `ArtifactTypes` DISABLE KEYS */;
INSERT INTO `ArtifactTypes` (`id`, `name`, `extensionType`, `description`, `modality`) VALUES
(1, 'book', 'FB', 'The book artifact (student or default edition)', 0),
(2, 'chapter', 'CH', 'The chapter artifact', 0),
(3, 'lesson', 'L', 'The lesson artifact', 1),
(4, 'concept', 'C', 'The concept artifact', 1),
(5, 'exercise', 'X', 'The exercise artifact', 1),
(6, 'teaching-material', 'TM', 'The teaching material artifact', 0),
(7, 'folder', 'F', 'The folder artifact', 0),
(8, 'section', 'S', 'The section artifact', 0),
(9, 'tebook', 'TE', 'The teacher edition book artifact', 0),
(10, 'workbook', 'WB', 'The work book artifact', 0),
(11, 'studyguide', 'SG', 'The study guide artifact', 1),
(12, 'labkit', 'LK', 'The lab kit artifact', 0),
(13, 'rwa', 'RWA', 'The real-world application artifact', 1),
(14, 'rwaans', 'RWAA', 'The real-world application with answer keys artifact', 1),
(15, 'lecture', 'LEC', 'The lecture artifact', 1),
(16, 'enrichment', 'EN', 'The enrichment artifact', 1),
(17, 'simulation', 'SIM', 'The simulation artifact', 1),
(18, 'audio', 'AU', 'The audio artifact', 1),
(19, 'lab', 'LAB', 'The lab artifact', 1),
(20, 'labans', 'LABA', 'The lab artifact with answer keys', 1),
(21, 'worksheet', 'WS', 'The worksheet artifact', 1),
(22, 'worksheetans', 'WSA', 'The worksheet artifact with answer keys', 1),
(23, 'activity', 'ACT', 'The activity artifact', 1),
(24, 'activityans', 'ACTA', 'The activity artifact with answer keys', 1),
(25, 'preread', 'PRER', 'The pre-read artifact', 1),
(26, 'prereadans', 'PRERA', 'The pre-read artifact with answer keys', 1),
(27, 'postread', 'POSTR', 'The post-read artifact', 1),
(28, 'postreadans', 'POSTRA', 'The post-read artifact with answer keys', 1),
(29, 'whileread', 'WR', 'The while-read artifact', 1),
(30, 'whilereadans', 'WRA', 'The while-read artifact with answer keys', 1),
(31, 'prepostread', 'PPR', 'The pre/post-read artifact', 1),
(32, 'prepostreadans', 'PPRA', 'The pre/post-read artifact with answer keys', 1),
(33, 'flashcard', 'FC', 'The flash card artifact', 1),
(34, 'web', 'W', 'The web resource artifact', 1),
(35, 'handout', 'HO', 'The hand out artifact', 1),
(36, 'rubric', 'R', 'The rubric artifact', 1),
(37, 'lessonplanx', 'LPX', 'The external lesson plan artifact', 1),
(38, 'lessonplanxans', 'LPXA', 'The external lesson plan artifact with answer keys', 1),
(39, 'lessonplan', 'LP', 'The lesson plan artifact (CK-12)', 1),
(40, 'lessonplanans', 'LPA', 'The lesson plan artifact (CK-12) with answer keys', 1),
(41, 'presentation', 'PRES', 'The presentation artifact', 1),
(42, 'interactive', 'I', 'The interactive artifact', 1),
(43, 'image', 'IMG', 'The image artifact', 1),
(44, 'conceptmap', 'CMAP', 'The concept map artifact', 1),
(45, 'quiz', 'Q', 'The quiz artifact', 1),
(46, 'quizans', 'QA', 'The quiz artifact with answer keys', 1),
(47, 'quizdemo', 'QD', 'The quiz demonstration artifact', 1),
(48, 'cthink', 'CTH', 'The critical thinking artifact', 1),
(49, 'attachment', 'ATT', 'The attachment type artifact', 1),
(50, 'exerciseint', 'XINT', 'The interactive exercise type artifact', 1),
(51, 'asmtquiz', 'AQ', 'The assessment quiz type artifact', 1),
(52, 'asmttest', 'AT', 'The assessment test type artifact', 1),
(53, 'asmtpractice', 'AP', 'The assessment practice type artifact', 1),
(54, 'domain', 'D', 'The concept node artifact', 0),
(55, 'study-track', 'ST', 'The study track artifact', 0),
(56, 'assignment', 'ASGN', 'The assignment artifact', 0),
(57, 'quizbook', 'QB', 'The quiz edition book artifact', 0),
(58, 'testbook', 'TB', 'The test edition book artifact', 0),
(59, 'asmtpracticeint', 'APINT', 'The interactive assessment practice type artifact', 1),
(60, 'simulationint', 'SIMINT', 'The next generation simulation artifact', 1),
(61, 'asmtpracticeg', 'APGUID', 'The guided assessment practice type artifact', 1),
(62, 'plix', 'PLIX', 'PLIX Interactive ILO type artifact', 1);
/*!40000 ALTER TABLE `ArtifactTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Countries`
--

LOCK TABLES `Countries` WRITE;
/*!40000 ALTER TABLE `Countries` DISABLE KEYS */;
INSERT INTO `Countries` (`id`, `name`, `code2Letter`, `code3Letter`, `codeNumeric`, `image`, `updateTime`, `creationTime`) VALUES
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
-- Dumping data for table `USStates`
--

LOCK TABLES `USStates` WRITE;
/*!40000 ALTER TABLE `USStates` DISABLE KEYS */;
INSERT INTO `USStates` (`abbreviation`, `name`) VALUES
('A', 'Armed Forces Americas'),
('AE', 'Armed Forces Africa, Canada, Europe, Middle East'),
('AK', 'Alaska'),
('AL', 'Alabama'),
('AP', 'Armed Forces Pacific'),
('AR', 'Arkansas'),
('AS', 'American Samoa'),
('AZ', 'Arizona'),
('CA', 'California'),
('CO', 'Colorado'),
('CT', 'Connecticut'),
('DC', 'District of Columbia'),
('DE', 'Delaware'),
('FL', 'Florida'),
('FM', 'Federated States of Micronesia'),
('GA', 'Georgia'),
('GU', 'Guam'),
('HI', 'Hawaii'),
('IA', 'Iowa'),
('ID', 'Idaho'),
('IL', 'Illinois'),
('IN', 'Indiana'),
('KS', 'Kansas'),
('KY', 'Kentucky'),
('LA', 'Louisiana'),
('MA', 'Massachusetts'),
('MD', 'Maryland'),
('ME', 'Maine'),
('MH', 'Marshall Islands'),
('MI', 'Michigan'),
('MN', 'Minnesota'),
('MO', 'Missouri'),
('MP', 'Northern Mariana Islands'),
('MS', 'Mississippi'),
('MT', 'Montana'),
('NC', 'North Carolina'),
('ND', 'North Dakota'),
('NE', 'Nebraska'),
('NH', 'New Hampshire'),
('NJ', 'New Jersey'),
('NM', 'New Mexico'),
('NV', 'Nevada'),
('NY', 'New York'),
('OH', 'Ohio'),
('OK', 'Oklahoma'),
('OR', 'Oregon'),
('PA', 'Pennsylvania'),
('PR', 'Puerto Rico'),
('PW', 'Palau'),
('RI', 'Rhode Island'),
('SC', 'South Carolina'),
('SD', 'South Dakota'),
('TN', 'Tennessee'),
('TX', 'Texas'),
('UT', 'Utah'),
('VA', 'Virginia'),
('VI', 'Virgin Islands'),
('VT', 'Vermont'),
('WA', 'Washington'),
('WI', 'Wisconsin'),
('WV', 'West Virginia'),
('WY', 'Wyoming');
/*!40000 ALTER TABLE `USStates` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Dumping data for table `Languages`
--

LOCK TABLES `Languages` WRITE;
/*!40000 ALTER TABLE `Languages` DISABLE KEYS */;
INSERT INTO `Languages` (`id`, `code`, `name`) VALUES
(1, 'en', 'English'),
(2, 'es', 'Spanish'),
(3, 'pt', 'Portuguese'),
(4, 'ko', 'Korean'),
(5, 'fr', 'French'),
(6, 'de', 'German'),
(7, 'hi', 'Hindi');
/*!40000 ALTER TABLE `Languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ResourceTypes`
--

LOCK TABLES `ResourceTypes` WRITE;
/*!40000 ALTER TABLE `ResourceTypes` DISABLE KEYS */;
INSERT INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES
(1, 'contents', 'The contents resource', 1, 0),
(2, 'cover page', 'The cover page image resource', 0, 0),
(3, 'cover page icon', 'The cover page icon resource', 0, 0),
(4, 'image', 'The image resource', 0, 0),
(5, 'expression', 'The expression resource', 0, 0),
(6, 'audio', 'The audio resource', 0, 1),
(7, 'video', 'The video resource', 0, 1),
(8, 'equation', 'The equation images, generated via latex', 0, 0),
(9, 'cover video', 'The first video in a concept, to be used as cover', 0, 1),
(10, 'attachment', 'Any opaque object to be attached to an artifact', 0, 0),
(11, 'pdf', 'The PDF resource - PDF manifestation of the content', 0, 0),
(12, 'epub', 'The ePub resource - ePub manifestation of the content', 0, 0),
(13, 'html', 'The html resource', 0, 0),
(14, 'mobi', 'The mobi resource - mobi manifestation of the content', 0, 0),
(15, 'interactive', 'Interactive object resource', 0, 0),
(16, 'studyguide', 'The Study Guide resource', 0, 0),
(17, 'lessonplan', 'The Lesson Plan resource', 0, 0),
(18, 'epubk', 'The ePub resource for kindle - ePub manifestation of the content', 0, 0),
(19, 'activity', 'The activity type resource', 0, 0),
(20, 'assessment', 'The assessment type resource', 0, 0),
(21, 'worksheet', 'The worksheet type resource', 0, 0),
(22, 'quiz', 'The test/quiz type resource', 0, 0),
(23, 'classwork', 'The classwork type resource', 0, 0),
(24, 'homework', 'The homework type resource', 0, 0),
(25, 'handout', 'The handout type resource', 0, 0),
(26, 'rubric', 'The rubric type resource', 0, 0),
(27, 'notes', 'The notes type resource', 0, 0),
(28, 'project', 'The project/lab type resource', 0, 0),
(29, 'starter', 'The starter/do now type resource', 0, 0),
(30, 'syllabus', 'The syllabus type resource', 0, 0),
(31, 'web', 'The web resource', 0, 0),
(32, 'reading', 'The reading resource', 0, 0),
(33, 'presentation', 'The presentation resource', 0, 0),
(34, 'lab', 'The lab resource', 0, 0),
(35, 'cthink', 'The critical thinking resource', 0, 0),
(36, 'answer key', 'Answer sheet key for Quiz', 0, 0),
(37, 'answer demo', 'Answer demo for Quiz', 0, 0),
(38, 'group system image', 'The system provided image for groups', 0, 0),
(39, 'group user image', 'The user uploaded image for groups', 0, 0),
(40, 'assessment bundle', 'Zip archive conaining assessment data', 0, 0),
(41, 'inlineworksheet', 'Inline worksheets', 0, 0);
/*!40000 ALTER TABLE `ResourceTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `BrowseTermTypes`
--

LOCK TABLES `BrowseTermTypes` WRITE;
/*!40000 ALTER TABLE `BrowseTermTypes` DISABLE KEYS */;
INSERT INTO `BrowseTermTypes` (`id`,  `name`) VALUES
(1, 'state'),
(2, 'grade level'),
(3, 'subject'),
(4, 'domain'),
(5, 'standard'),
(6, 'tag'),
(7, 'level'),
(8, 'search'),
(9, 'contributor'),
(10, 'pseudodomain'),
(11, 'internal-tag');
/*!40000 ALTER TABLE `BrowseTermTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Subjects`
--

LOCK TABLES `Subjects` WRITE;
/*!40000 ALTER TABLE `Subjects` DISABLE KEYS */;
INSERT INTO `Subjects` (`id`,  `name`) VALUES
(1, 'biology'),
(2, 'chemistry'),
(3, 'mathematics'),
(4, 'engineering'),
(5, 'history'),
(6, 'physics'),
(7, 'science'),
(8, 'technology'),
(9, 'earth science'),
(10, 'life science'),
(11, 'algebra'),
(12, 'geometry'),
(13, 'calculus'),
(14, 'trigonometry'),
(15, 'probability and statistics'),
(16, 'probability'),
(17, 'statistics'),
(18, 'physical science');
/*!40000 ALTER TABLE `Subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `StandardBoards`
--

LOCK TABLES `StandardBoards` WRITE;
/*!40000 ALTER TABLE `StandardBoards` DISABLE KEYS */;
INSERT INTO `StandardBoards` (`id`,  `name`, `longname`, `countryID`) VALUES
(1, 'AK', 'Alaska', 1),
(2, 'AL', 'Alabama', 1),
(3, 'AP', 'Advanced Placement', 1),
(4, 'AR', 'Arkansas', 1),
(5, 'AS', 'AS', 1),
(6, 'AZ', 'Arizona', 1),
(7, 'CA', 'California', 1),
(8, 'CO', 'Colorado', 1),
(9, 'CT', 'Connecticut', 1),
(10, 'DC', 'District of Columbia', 1),
(11, 'DE', 'Delaware', 1),
(12, 'FL', 'Florida', 1),
(13, 'FM', 'Federated State of Micronesia', 1),
(14, 'GA', 'Georgia', 1),
(15, 'GU', 'Guam', 1),
(16, 'HI', 'Hawaii', 1),
(17, 'IA', 'Iowa', 1),
(18, 'ID', 'Idaho', 1),
(19, 'IL', 'Illinois', 1),
(20, 'IN', 'Indiana', 1),
(21, 'KS', 'Kansas', 1),
(22, 'KY', 'Kentucky', 1),
(23, 'LA', 'Louisiana', 1),
(24, 'MA', 'Massachusetts', 1),
(25, 'MD', 'Maryland', 1),
(26, 'ME', 'Maine', 1),
(27, 'MH', 'Marshall Islands', 1),
(28, 'MI', 'Michigan', 1),
(29, 'MN', 'Minnesota', 1),
(30, 'MO', 'Missouri', 1),
(31, 'MP', 'MP', 1),
(32, 'MS', 'Mississippi', 1),
(33, 'MT', 'Montana', 1),
(34, 'NC', 'North Carolina', 1),
(35, 'ND', 'North Dakota', 1),
(36, 'NE', 'Nebraska', 1),
(37, 'NH', 'New Hampshire', 1),
(38, 'NJ', 'New Jersey', 1),
(39, 'NM', 'New Mexico', 1),
(40, 'NV', 'Nevada', 1),
(41, 'NY', 'New York', 1),
(42, 'OH', 'Ohio', 1),
(43, 'OK', 'Oklahoma', 1),
(44, 'OR', 'Oregon', 1),
(45, 'PA', 'Pennsylvania', 1),
(46, 'PR', 'Puerto Rico', 1),
(47, 'PW', 'Palau', 1),
(48, 'RI', 'Rhode Island', 1),
(49, 'SC', 'South Carolina', 1),
(50, 'SD', 'South Dakota', 1),
(51, 'TN', 'Tennessee', 1),
(52, 'TX', 'Texas', 1),
(53, 'UT', 'Utah', 1),
(54, 'VA', 'Virginia', 1),
(55, 'VI', 'Virgin Islands', 1),
(56, 'VT', 'Vermont', 1),
(57, 'WA', 'Washington', 1),
(58, 'WI', 'Wisconsin', 1),
(59, 'WV', 'West Virginia', 1),
(60, 'WY', 'Wyoming', 1),
(61, 'CCSS', 'Common Core', 1),
(62, 'NSES', 'National Science Education Standards', 1),
(63, 'NCERT', 'National Council of Education Research and Training', 101);
/*!40000 ALTER TABLE `StandardBoards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Grades`
--

LOCK TABLES `Grades` WRITE;
/*!40000 ALTER TABLE `Grades` DISABLE KEYS */;
INSERT INTO `Grades` (`id`,  `name`) VALUES
(1, 'k'),
(2, '1'),
(3, '2'),
(4, '3'),
(5, '4'),
(6, '5'),
(7, '6'),
(8, '7'),
(9, '8'),
(10, '9'),
(11, '10'),
(12, '11'),
(13, '12');
/*!40000 ALTER TABLE `Grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `GroupHasMembers`
--

LOCK TABLES `GroupHasMembers` WRITE;
/*!40000 ALTER TABLE `GroupHasMembers` DISABLE KEYS */;
INSERT INTO `GroupHasMembers` (`groupID`, `memberID`, `roleID`, `statusID`, `memberEmail`, `updateTime`, `disableNotification`) VALUES
(1, 1, 1, 2, NULL, NULL, 0),
(1, 2, 2, 2, NULL, NULL, 0),
(1, 3, 3, 2, NULL, NULL, 0),
(1, 4, 13, 2, NULL, NULL, 0);
/*!40000 ALTER TABLE `GroupHasMembers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `EmbeddedObjectProviders`
--

LOCK TABLES `EmbeddedObjectProviders` WRITE;
/*!40000 ALTER TABLE `EmbeddedObjectProviders` DISABLE KEYS */;
INSERT INTO `EmbeddedObjectProviders` VALUES 
(1,'YouTube','*.youtube.com',0,1, NOW(), NULL),
(2,'Schooltube','*.schooltube.com',0,1, NOW(), NULL),
(3,'TeacherTube','*.teachertube.com',0,1, NOW(), NULL),
(4,'CK-12','*.ck12.org',0,0, NOW(), NULL),
(5,'Scribd','*.scribd.com',0,1, NOW(), NULL),
(6,'Scribd','*.scribdassets.com',0,1, NOW(), NULL),
(7,'Slideshare','*.slideshare.net',0,1, NOW(), NULL),
(8,'Slideshare','*.slidesharecdn.com',0,1, NOW(), NULL),
(9,'FlexMath','www.flexmath.com',0,0, NOW(), NULL),
(10,'LAUSD','www.lausd.net',0,0, NOW(), NULL),
(11,'UCCP Open Access','uccpbank.k12hsn.org',0,0, NOW(), NULL),
(12,'archive.org','*.archive.org',0,0, NOW(), NULL),
(13,'Screencast','*.screencast.com',0,1, NOW(), NULL),
(14,'Phet','*.phet.colorado.edu',0,0, NOW(), NULL),
(15,'KQED','*.kqed.org',0,0, NOW(), NULL),
(16,'SimInsights','*.siminsights.com',0,0, NOW(), NULL),
(17,'YouTube - tiny url','youtu.be',0,1, NOW(), NULL),
(18,'Khan Academy','www.khanacademy.org',0,0, NOW(), NULL),
(19,'VoiceThread','*.voicethread.com',0,0, NOW(), NULL),
(20,'Google eBooks','*.google.com',0,0, NOW(), NULL),
(21,'VuuTV','*.vuutv.info',0,0, NOW(), NULL),
(22,'GoAnimate','*.goanimate.com',0,0, NOW(), NULL),
(23,'Quia','*.quia.com',0,0, NOW(), NULL),
(24,'Britannica','*.britannica.com',0,0, NOW(), NULL),
(25,'Voki','vhss-d.oddcast.com',0,0, NOW(), NULL),
(26,'PBS','*.pbs.org',0,1, NOW(), NULL),
(27,'Gapminder','*.gapminder.org',0,0, NOW(), NULL),
(29,'VOISE Academy','*.voiseacademy.org',0,0, NOW(), NULL),
(30,'Vimeo','*.vimeo.com',0,1, NOW(), NULL),
(31,'authorSTREAM','*.authorstream.com',0,0, NOW(), NULL),
(32,'Bio. True Story','*.biography.com',0,0, NOW(), NULL),
(33,'National  Geographic','*.nationalgeographic.com',0,0, NOW(), NULL),
(34,'Prezi','*.prezi.com',0,1, NOW(), NULL),
(35,'FlexMath','*.flexmath.com',0,0, NOW(), NULL),
(36,'National Library of Virtual Manipulatives','*.nlvm.usu.edu',0,0, NOW(), NULL),
(37,'brightstorm','*.brightstorm.com',0,0, NOW(), NULL),
(38,'brightstorm','*.brightcove.com',0,0, NOW(), NULL),
(39,'LearningApps','*.learningapps.org',0,0, NOW(), NULL),
(40,'Math Open Reference','*.mathopenref.com',0,0, NOW(), NULL),
(41,'SAS Curriculum Pathways','*.sascurriculumpathways.com',0,0, NOW(), NULL),
(42,'Cool Math','*.coolmath.com',0,0, NOW(), NULL),
(43,'Qwiki','*.qwiki.com',0,0, NOW(), NULL),
(44,'HippoCampus','*.hippocampus.org',0,0, NOW(), NULL),
(45,'CIA','*.cia.gov',0,0, NOW(), NULL),
(46,'NotePub','*.notepub.com',0,0, NOW(), NULL),
(47,'MP3','bananaphone.org',0,0, NOW(), NULL),
(48,'MOV','www.fluorescenthill.com',0,0, NOW(), NULL),
(49,'MP4','msstudios.vo.llnwd.net',0,0, NOW(), NULL),
(50,'Applet','www.ibdprince.com',0,0, NOW(), NULL),
(51, 'Wolfram Mathematica', '*.wolfram.com', 0, 0, NOW(), NULL),
(52, 'DMDEntertainment', '*.dmdentertainment.com', 0, 0, NOW(), NULL),
(53, 'Colorado', '*.colorado.edu', 0, 0, NOW(), NULL),
(54, 'Discovery Media', '*.discoverymedia.com', 0, 0, NOW(), NULL);
/*!40000 ALTER TABLE `EmbeddedObjectProviders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `DownloadStats`
--

LOCK TABLES `DownloadStats` WRITE;
/*!40000 ALTER TABLE `DownloadStats` DISABLE KEYS */;
INSERT INTO `DownloadStats` (`id`, `downloadType`, `count`) VALUES
(null, 'GA Total Stats', 0),
(null, 'Apple AppStore', 0),
(null, 'Amazon Kindle Store', 0),
(null, 'GA INAP Total Stats', 0),
(null, 'GA BrainGenie Total Stats', 0),
(null, 'GA BrainGenie-Old Total Stats', 2166403);
/*!40000 ALTER TABLE `DownloadStats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `AbuseReasons`
--

LOCK TABLES `AbuseReasons` WRITE;
/*!40000 ALTER TABLE `AbuseReasons` DISABLE KEYS */;
INSERT INTO `AbuseReasons` (`id`, `name`, `description`) VALUES
(1, 'Copyrighted', 'The content or image is copyrighted'),
(2, 'Inappropriate', 'The content or image is inappropriate'),
(3, 'Malicious', 'It has malicious content'),
(4, 'Disable', 'No reason was specified'),
(5, 'Incorrect Content', 'The content described is incorrect'),
(6, 'Feedback', 'User feedback on the content');
/*!40000 ALTER TABLE `AbuseReasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `EventTypes`
--

LOCK TABLES `EventTypes` WRITE;
/*!40000 ALTER TABLE `EventTypes` DISABLE KEYS */;
INSERT INTO `EventTypes` (`id`, `name`, `description`) VALUES
(1, 'ARTIFACT_IMPORTED', 'An artifact was successfully imported into the FlexBook system'),
(2, 'ARTIFACT_IMPORT_FAILED', 'An artifact import task failed'),
(3, 'ARTIFACT_PUBLISHED', 'An artifact was published'),
(4, 'ARTIFACT_REVISION_CREATED', 'A new artifact revision was created successfully'),
(5, 'ARTIFACT_UNPUBLISHED', 'An artifact was unpublished'),
(6, 'ARTIFACT_DELETED', 'An artifact was deleted'),
(7, 'ARTIFACT_RELATED_MATERIAL_ADDED', 'Some related material was added to an artifact'),
(8, 'SEARCH_INDEX_SYNCED', 'Search index sync task finished successfully'),
(9, 'SEARCH_INDEX_SYNC_FAILED', 'Search index sync task failed'),
(10, 'SEARCH_INDEX_CREATED', 'Search index was created successfully'),
(11, 'SEARCH_INDEX_CREATE_FAILED', 'Search index creation failed'),
(12, 'EMBEDDED_OBJECT_CREATE_FAILED', 'Embedded Object creation failed'),
(13, 'NOTIFICATION_SEND_FAILED', 'Sending notification failed'),
(14, 'PASSWORD_RESET_REQUESTED', 'An user requested to reset password'),
(15, 'ARTIFACT_CREATED', 'A new artifact created'),
(16, 'NEWSLETTER_PUBLISHED', 'New newsletter has been published'),
(17, 'MEMBER_CREATED', 'New member signed up'),
(18, 'MEMBER_PROFILE_UPDATED', 'Member information changed'),
(19, 'MEMBER_PASSWORD_UPDATED', 'Member password updated'),
(20, 'MEMBER_FROM_TWITTER', 'Member logged in via Twitter'),
(21, 'PUBLISH_REQUEST', 'Request to publish'),
(22, 'PRINT_GENERATION_SUCCESSFUL', 'The print resource was successfully generated'),
(23, 'PRINT_GENERATION_FAILED', 'The print resource generation failed'),
(24, 'QUESTION_APPROVED', 'A question was approved'),
(25, 'QUESTIONS_CONTRIBUTED', 'Some questions were contributed by users'),
(26, 'REPORT_QUESTION_ERROR', 'An error was reported for a question'),
(27, 'GROUP_SHARE', 'Event when something is shared within a group'),
(28, 'PASSWORD_RESET_FOR_ACTIVATION', 'An user requested to reset password on account activation'),
(29, 'GROUP_MEMBER_JOINED', 'Event when an user joins a group'),
(30, 'GROUP_MEMBER_ACTIVATED', 'Event when a group member is activated'),
(31, 'GROUP_MEMBER_DECLINED', 'Event when a group member is declined'),
(32, 'INVITE_MEMBER', 'Invite member to use CK-12.'),
(33, 'ARTIFACT_COPIED', 'Artifact copying successful'),
(34, 'ARTIFACT_COPY_FAILED', 'Artifact copying failed'),
(35, 'GET_REAL_SUBMISSION', 'Event when an RWA for GetReal Competition is submitted'),
(36, 'ARTIFACT_PUBLISHED_INFORMATION', 'An artifact revision is published by admin user'),
(37, 'UNDERAGE_REGISTRATION_NOTIFICATION_PARENT', 'Event to send email to underage students parent/guardian'),
(38, 'ASMT_REPORT_QUESTION_ERROR', 'An error was reported for a question'),
(39, 'GROUP_CREATE', 'A group was created'),
(40, 'ASSIGNMENT_ASSIGNED', 'An assignment has been assigned to a group.'),
(41, 'ASSIGNMENT_UNASSIGNED', 'An assignment has been unassigned from a group.'),
(42, 'ASSIGNMENT_UPDATED', 'An assignment has been updated.'),
(43, 'ASSIGNMENT_DELETED', 'An assignment has been deleted.'),
(44, 'ASMT_CONTRIBUTED_QUESTIONS', 'Questions contributed by users'),
(45, 'ASMT_PAST_CONTRIBUTED_QUESTIONS', 'Questions contributed by users in the past'),
(46, 'ASMT_REJECTED_QUESTIONS', 'Questions rejected by admin'),
(47, 'ASMT_PUBLISHED_QUESTIONS', 'Questions published by admin'),
(48, 'GROUP_SHARE_WEB', 'Event when something is shared within a group (WEB)'),
(49, 'GROUP_PH_POST_WEB', 'Event to store inapp notification for group when a post was added.'),
(50, 'PH_POST', 'Event to send email to thread participants when a post was added.'),
(51, 'ASSIGNMENT_ASSIGNED_WEB', 'An assignment has been assigned to a group. (WEB)'),
(52, 'ASSIGNMENT_DELETED_WEB', 'An assignment has been deleted. (WEB)'),
(53, 'PRINT_GENERATION_SUCCESSFUL_PDF', 'The PDF print resource was successfully generated.'),
(54, 'PRINT_GENERATION_FAILED_PDF', 'The PDF print resource generation failed.'),
(55, 'PRINT_GENERATION_SUCCESSFUL_EPUB', 'The ePub print resource was successfully generated.'),
(56, 'PRINT_GENERATION_FAILED_EPUB', 'The ePub print resource generation failed.'),
(57, 'PRINT_GENERATION_SUCCESSFUL_MOBI', 'The Kindle Book print resource was successfully generated.'),
(58, 'PRINT_GENERATION_FAILED_MOBI', 'The Kindle Book print resource generation failed.'),
(59, 'VERIFY_MEMBER', 'For user to verify his/her email.'),
(60, 'SIGNUP_UNDERAGE', 'For user to signup for underage students.'),
(61, 'ARTIFACT_NEW_REVISION_AVAILABLE_WEB', 'Event for web notfication when artifact new revision is available from admin or book author'),
(62, 'SEND_EMAIL','For users to send email via CK-12.'),
(63, 'CONCEPT_PRACTICE_INCOMPLETE_WEB','Event to get notification when a concept is not completed by user'),
(64, 'GROUP_QA_STATUS','To enable/disable groups Question & Answer section.'),
(65, 'GROUP_QA_ANONYMOUS_PERMISSION','Allow/Deny user to hide identity while asking questions in group Q&A section.'),
(66, 'PRINT_GENERATION_SUCCESSFUL_WEB','Event for web notification when artifact print generation is successful'),
(67, 'PRINT_GENERATION_FAILED_WEB','Event for web notification when artifact print resource generation fails'),
(68, 'ARTIFACT_FEEDBACK_COMMENTS','Event for email notification for artifact feedback comments by user'),
(69, 'ARTIFACT_FEEDBACK_COMMENTS_WEB','Event for web notification for artifact feedback comments by user'),
(70, 'ASMT_DELETE_QUESTION_REQUEST','Request to delete a question, created by user'),
(71, 'ASMT_SUMMER_CHALLENGE_CONCEPTS_REMINDER','Email to remind student and his coach to practice a concept during summer challenge'),
(73, 'SEND_EMAIL_FEEDBACK', 'For users to send feedback.'),
(75,'ARTIFACT_CONTENT_INVALID_URL','Invalid urls in artifact contents'),
(76,'ASMT_WEEKLY_SUMMER_CHALLENGE_REPORT','Email to send weekly report to student and his coach during summer challenge'),
(77,'ARTIFACT_FEEDBACK_COMMENTS_ABUSE','Event for email notification for artifact feedback comments marked as abused by user'),
(78,'ASMT_SC_COACH_INVITATION','Invitation email to the coach sent by student, during summer challenge program'),
(79,'ASMT_SC_STUDENT_COACH_CONFIRMATION','Notification email to the student when a coach accepts his/her request during summer challenge program'),
(80, 'PREVIEW_EMAIL', 'Event to try out different email notifications for internal usage');


/*!40000 ALTER TABLE `EventTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `NotificationRules`
--

LOCK TABLES `NotificationRules` WRITE;
/*!40000 ALTER TABLE `NotificationRules` DISABLE KEYS */;
INSERT INTO `NotificationRules` (`id`, `name`, `description`) VALUES
(1, 'EXISTS_IN_LIBRARY', 'An object exists in the users library');
/*!40000 ALTER TABLE `NotificationRules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Notifications`
--

LOCK TABLES `Notifications` WRITE;
/*!40000 ALTER TABLE `Notifications` DISABLE KEYS */;
INSERT INTO `Notifications` (`id`, `eventTypeID`, `objectID`, `objectType`, `type`, `ruleID`, `address`, `subscriberID`, `frequency`, `lastSent`, `created`, `updated`) VALUES 
(1,1,NULL,NULL,'email',NULL,'nobody@ck12.org',1,'instant',NULL,now(), now()),
(2,2,NULL,NULL,'email',NULL,'nobody@ck12.org',1,'instant',NULL,now(), now()),
(3,8,NULL,NULL,'email',NULL,'nobody@ck12.org',1,'daily',NULL,now(), now()),
(4,9,NULL,NULL,'email',NULL,'nobody@ck12.org',1,'instant',NULL,now(), now()),
(5,10,NULL,NULL,'email',NULL,'nobody@ck12.org',1,'weekly',NULL,now(), now()),
(6,11,NULL,NULL,'email',NULL,'nobody@ck12.org',1,'instant',NULL,now(), now()),
(7,12,NULL,NULL,'email',NULL,'nobody@ck12.org',1,'instant',NULL,now(), now()),
(8,13,NULL,NULL,'email',NULL,'nobody@ck12.org',1,'daily',NULL,now(), now()),
(9,14,NULL,NULL,'email',NULL,'nobody@ck12.org',1,'daily',NULL,now(), now()),
(10,4,NULL,NULL,'email',NULL,'nobody@ck12.org',1,'daily',NULL,now(), now()),
(11,4,NULL,NULL,'email',1,'nobody@ck12.org',3,'daily',NULL,now(), now());
/*!40000 ALTER TABLE `Notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `MemberLabels`
--

LOCK TABLES `MemberLabels` WRITE;
/*!40000 ALTER TABLE `MemberLabels` DISABLE KEYS */;
INSERT INTO `MemberLabels` (`id`, `memberID`, `label`, `systemLabel`, `created`) VALUES
(1, NULL, 'Mathematics', 1, NOW()),
(2, NULL, 'Science', 1, NOW()),
(3, NULL, 'Others', 1, NOW());
/*!40000 ALTER TABLE `MemberLabels` ENABLE KEYS */;
UNLOCK TABLES;
