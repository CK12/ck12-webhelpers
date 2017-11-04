--
-- Loading data for table `Members`
--

LOCK TABLES `Members` WRITE;
/*!40000 ALTER TABLE `Members` DISABLE KEYS */;
INSERT INTO `Members` (`id`, `defaultLogin`, `login`, `email`, `givenName`, `surname`) VALUES
(104, 'tom', 'tom', 'tom@nowhere.com', 'Tom', 'Sawyer'),
(105, 'grace', 'grace', 'grace@nowhere.com', 'Grace', 'Smith'),
(106, 'mary', 'mary', 'mary@nowhere.com', 'Mary', 'Doe'),
(107, 'barbara', 'barbara', 'barbara@nowhere.com', 'Barbara', 'Akre'),
(108, 'niamh', 'niamh', 'niamh@nowhere.com', 'Niamh', 'Grap-Wilson'),
(109, 'james', 'james', 'james@nowhere.com', 'James', 'Dann');
/*!40000 ALTER TABLE `Members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Loading data for table `GroupHasMembers`
--

LOCK TABLES `GroupHasMembers` WRITE;
/*!40000 ALTER TABLE `GroupHasMembers` DISABLE KEYS */;
INSERT INTO `GroupHasMembers` (`groupID`, `memberID`, `roleID`, `statusID`) VALUES
(1, 104, 4, 2),
(1, 105, 5, 2),
(1, 106, 6, 2),
(1, 107, 3, 2),
(1, 108, 3, 2),
(1, 109, 3, 2);
/*!40000 ALTER TABLE `GroupHasMembers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Resources`
--

LOCK TABLES `Resources` WRITE;
/*!40000 ALTER TABLE `Resources` DISABLE KEYS */;
INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES
(1, 1, 'Newton\'s Laws', 'Students learn about Newton\'s Law\'s through the study of motion, acceleration, and force.', '1.xhtml', '1.xhtml', MD5(CONCAT('1.xhtml', 'contents', 'tom')), 104, 1),
(2, 1, 'Energy and Force', 'The law of conservation of energy and the law of conservation of momentum is introduced through the study of energy and force.', '2.xhtml', '2.xhtml', MD5(CONCAT('2.xhtml', 'contents', 'tom')), 104, 1),
(3, 1, 'Electricity', 'Students are introduced to electricity through the study of the conservation of charge. Other concepts such as electromagnetism, the Coulomb electric force, the law of gravity, charged objects, electric force, and potential energy are presented.', '3.xhtml', '3.xhtml', MD5(CONCAT('3.xhtml', 'contents', 'tom')), 104, 1),
(4, 1, 'Magnetism', 'Magnetism is studied through the concepts of electromagnetic force, the Coulomb electric force, electric current, magnetic fields, electricity, the right and left hand rules.', '4.xhtml', '4.xhtml', MD5(CONCAT('4.xhtml', 'contents', 'tom')), 104, 1),
(5, 1, 'Light', 'Light is studied through the concepts of light waves, electromagnetic radiation and fields, electrons, photons, Fermat\'s Principle, refraction, diffraction, scattering and color absorption, and dispersion.', '5.xhtml', '5.xhtml', MD5(CONCAT('5.xhtml', 'contents', 'tom')), 104, 1),
(6, 2, 'Physics', 'Cover page image for the Physics book', 'cover_physics_generic.png', 'cover_physics_generic.png', MD5(CONCAT('cover_physics_generic.png', 'cover page', 'tom')), 104, 1),
(7, 2, 'Physics Chapter', 'Cover page image for the Physics chapter', 'cover_physics_generic_chapter.png', 'cover_physics_generic_chapter.png', MD5(CONCAT('cover_physics_generic_chapter.png', 'cover page', 'tom')), 104, 1),
(8, 1, 'The Human Body', 'The human body and its systems.', '8.xhtml', '8.xhtml', MD5(CONCAT('8.xhtml', 'contents', 'ck12editor')), 3, 1),
(9, 1, 'Cellular Respiration', 'Cellular respiration and its relationship to glycolysis, the Krebs Cycle, and the electron transport chain.', '9.xhtml', '9.xhtml', MD5(CONCAT('9.xhtml', 'contents', 'ck12editor')), 3, 1),
(10, 1, 'Foundations of Life Science', 'This chapter provides an introduction to scientific investigations, methods, observations, and communication.', '10.xhtml', '10.xhtml', MD5(CONCAT('10.xhtml', 'contents', 'ck12editor')), 3, 1);
/*!40000 ALTER TABLE `Resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ResourceRevisions`
--

LOCK TABLES `ResourceRevisions` WRITE;
/*!40000 ALTER TABLE `ResourceRevisions` DISABLE KEYS */;
INSERT INTO `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) VALUES
(1, 1, '1', '2010-01-01T12:12:27Z'),
(2, 2, '1', '2010-01-01T12:12:27Z'),
(3, 3, '1', '2010-01-01T12:12:27Z'),
(4, 4, '1', '2010-01-01T12:12:27Z'),
(5, 5, '1', '2010-01-01T12:12:27Z'),
(6, 6, '1', '2010-01-01T12:12:27Z'),
(7, 7, '1', '2010-01-01T12:12:27Z'),
(8, 8, '1', '2010-01-01T12:12:27Z'),
(9, 9, '1', '2010-01-01T12:12:27Z'),
(10, 10, '1', '2010-01-01T12:12:27Z');
/*!40000 ALTER TABLE `ResourceRevisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Artifacts`
--

LOCK TABLES `Artifacts` WRITE;
/*!40000 ALTER TABLE `Artifacts` DISABLE KEYS */;
INSERT INTO `Artifacts` (`id`, `artifactTypeID`, `name`, `description`,`handle`, `creatorID`, `ancestorID`, `creationTime`) VALUES
(1, 1, 'Physics', 'The physics text book for grade 9.','Physics', 104, NULL, '2010-01-01T12:12:27Z'),
(2, 2, 'Newton\'s Laws-::of::-Physics', 'Students learn about Newton\'s Law\'s through the study of motion, acceleration, and force.','Newton\'s-Laws-::of::-Physics',104, NULL, '2010-01-01T12:12:27Z'),
(3, 2, 'Energy and Force-::of::-Physics', 'The law of conservation of energy and the law of conservation of momentum is introduced through the study of energy and force.','Energy-and-Force-::of::-Physics',104, NULL, '2010-02-10T16:30:55Z'),
(4, 2, 'Electricity-::of::-Physics', 'Students are introduced to electricity through the study of the conservation of charge. Other concepts such as electromagnetism, the Coulomb electric force, the law of gravity, charged objects, electric force, and potential energy are presented.','Electricity-::of::-Physics', 104, NULL, '2010-03-10T16:30:55Z'),
(5, 2, 'Magnetism-::of::-Physics', 'Magnetism is studied through the concepts of electromagnetic force, the Coulomb electric force, electric current, magnetic fields, electricity, the right and left hand rules.','Magnetism-::of::-Physics', 104, NULL, '2010-04-10T16:30:55Z'),
(6, 2, 'Light-::of::-Physics', 'Light is studied through the concepts of light waves, electromagnetic radiation and fields, electrons, photons, Fermat\'s Principle, refraction, diffraction, scattering and color absorption, and dispersion.','Light-::of::-Physics' ,104, NULL, '2010-05-01T12:12:27Z'),
(7, 1, 'Biology 1', 'Sample chapters from CA Biology 10 Grade.','Biology-1', 3, NULL, '2010-08-01T12:12:27Z'),
(8, 2, 'The Human Body-::of::-Biology 1', 'This chapter covers the human body and its systems, including cells, tissues, and organs.','The-Human-Body-::of::-Biology 1', 3, NULL, '2010-08-01T12:12:27Z'),
(9, 2, 'Cellular Respiration-::of::-Biology 1', 'This chapter introduces cellular respiration and its relationship to glycolysis, the Krebs Cycle, and the electron transport chain.','Cellular-Respiration-::of::-Biology-1', 3, NULL, '2010-08-01T12:12:27Z'),
(10, 2, 'Foundations of Life Science-::of::-Biology 1', 'This chapter provides an introduction to scientific investigations, methods, observations, and communication.','Foundations-of-Life-Science-::of::-Biology-1', 3, NULL, '2010-08-01T12:12:27Z');
/*!40000 ALTER TABLE `Artifacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ArtifactAuthors`
--

LOCK TABLES `ArtifactAuthors` WRITE;
/*!40000 ALTER TABLE `ArtifactAuthors` DISABLE KEYS */;
INSERT INTO `ArtifactAuthors` (`artifactID`, `name`, `roleID`) VALUES
(1, 'Tom Sawyer', 3),
(2, 'Tom Sawyer', 3),
(3, 'Tom Sawyer', 3),
(4, 'Tom Sawyer', 3),
(5, 'Tom Sawyer', 3),
(6, 'Tom Sawyer', 3),
(7, 'James Dann', 3),
(8, 'James Dann', 3),
(9, 'James Dann', 3),
(10, 'James Dann', 3);
/*!40000 ALTER TABLE `ArtifactAuthors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ArtifactRevisions`
--

LOCK TABLES `ArtifactRevisions` WRITE;
/*!40000 ALTER TABLE `ArtifactRevisions` DISABLE KEYS */;
INSERT INTO `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`) VALUES
(1, 1, '1', 338, '2010-01-01T12:12:27Z', '2010-01-01T12:12:27Z'),
(2, 2, '1', 368, '2010-01-01T12:12:27Z', '2010-01-01T12:12:27Z'),
(3, 3, '1', 388, '2010-01-01T12:12:27Z', '2010-01-01T12:12:27Z'),
(4, 4, '1', 668, '2010-01-01T12:12:27Z', '2010-01-01T12:12:27Z'),
(5, 5, '1', 688, '2010-01-01T12:12:27Z', '2010-01-01T12:12:27Z'),
(6, 6, '1', 888, '2010-01-01T12:12:27Z', '2010-01-01T12:12:27Z'),
(7, 7, '1', 0, '2010-08-01T12:12:27Z', '2010-01-01T12:12:27Z'),
(8, 8, '1', 0, '2010-08-01T12:12:27Z', '2010-01-01T12:12:27Z'),
(9, 9, '1', 0, '2010-08-01T12:12:27Z', '2010-01-01T12:12:27Z'),
(10, 10, '1', 0, '2010-08-01T12:12:27Z', '2010-01-01T12:12:27Z');
/*!40000 ALTER TABLE `ArtifactRevisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ArtifactRevisionHasResources`
--

LOCK TABLES `ArtifactRevisionHasResources` WRITE;
/*!40000 ALTER TABLE `ArtifactRevisionHasResources` DISABLE KEYS */;
INSERT INTO `ArtifactRevisionHasResources` (`artifactRevisionID`, `resourceRevisionID`) VALUES
(1, 6),
(2, 1),
(2, 7),
(3, 2),
(3, 7),
(4, 3),
(4, 7),
(5, 4),
(5, 7),
(6, 5),
(6, 7),
(7, 6),
(8, 7),
(8, 8),
(9, 7),
(9, 9),
(10, 7),
(10, 10);
/*!40000 ALTER TABLE `ArtifactRevisionHasResources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ArtifactRevisionRelations`
--

LOCK TABLES `ArtifactRevisionRelations` WRITE;
/*!40000 ALTER TABLE `ArtifactRevisionRelations` DISABLE KEYS */;
INSERT INTO `ArtifactRevisionRelations` (`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) VALUES
(1, 2, 1),
(1, 3, 2),
(1, 4, 3),
(1, 5, 4),
(1, 6, 5),
(7, 8, 1),
(7, 9, 2),
(7, 10, 3);
/*!40000 ALTER TABLE `ArtifactRevisionRelations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Resources`
--

LOCK TABLES `BrowseTerms` WRITE;
/*!40000 ALTER TABLE `BrowseTerms` DISABLE KEYS */;
INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) VALUES
(1, 'ca', 1, null),
(2, 'k', 2, null),
(3, '1', 2, null),
(4, 'i', 2, null),
(5, 'one', 2, null),
(6, '2', 2, null),
(7, 'ii', 2, null),
(8, 'two', 2, null),
(9, '3', 2, null),
(10, 'iii', 2, null),
(11, 'three', 2, null),
(12, '4', 2, null),
(13, 'iv', 2, null),
(14, 'four', 2, null),
(15, '5', 2, null),
(16, 'v', 2, null),
(17, 'five', 2, null),
(18, '6', 2, null),
(19, 'vi', 2, null),
(20, 'six', 2, null),
(21, '7', 2, null),
(22, 'vii', 2, null),
(23, 'seven', 2, null),
(24, '8', 2, null),
(25, 'viii', 2, null),
(26, 'eight', 2, null),
(27, '9', 2, null),
(28, 'ix', 2, null),
(29, 'nine', 2, null),
(30, '10', 2, null),
(31, 'x', 2, null),
(32, 'ten', 2, null),
(33, '11', 2, null),
(34, 'xi', 2, null),
(35, 'eleven', 2, null),
(36, '12', 2, null),
(37, 'xii', 2, null),
(38, 'twelve', 2, null),
(39, 'biology', 3, null),
(40, 'chemistry', 3, null),
(41, 'mathematics', 3, null),
(42, 'engineering', 3, null),
(43, 'history', 3, null),
(44, 'physics', 3, null),
(45, 'science', 3, null),
(46, 'technology', 3, null),
(1006, 'Newton', 4, 44),
(1007, 'pairs', 4, 44),
(1008, 'earth gravitational force', 4, 44),
(1009, 'unbalanced force', 4, 44),
(1010, 'force acts', 4, 44),
(1011, 'constant velocity', 4, 44),
(1012, 'vector', 4, 44),
(1013, 'magnitude', 4, 44),
(1014, 'state of motion', 4, 44),
(1015, 'accelerate', 4, 44),
(1016, 'force of gravity', 4, 44),
(1017, 's2', 4, 44),
(1018, 'acceleration due to gravity', 4, 44),
(1020, 'gained energy', 4, 44),
(1021, 'graph', 4, 44),
(1022, 'impulse', 4, 44),
(1023, 'area under the curve', 4, 44),
(1024, 'momentum', 4, 44),
(1025, 'period of time', 4, 44),
(1026, 'electric potential energy', 4, 44),
(1027, 'ions', 4, 44),
(1028, 'repulsive force', 4, 44),
(1029, 'attractive force', 4, 44),
(1030, 'positive charge', 4, 44),
(1031, 'stripped', 4, 44),
(1032, 'protons', 4, 44),
(1033, 'orbits', 4, 44),
(1034, 'atoms', 4, 44),
(1036, 'free electrons', 4, 44),
(1037, 'volts', 4, 44),
(1038, 'coulomb electric force', 4, 44),
(1040, 'negative charge', 4, 44),
(1041, 'positively', 4, 44),
(1042, 'electromagnetism', 4, 44),
(1044, 'charged particles', 4, 44),
(1045, 'circles', 4, 44),
(1046, 'electric power generators', 4, 44),
(1047, 'magnetic', 4, 44),
(1048, 'electron spin', 4, 44),
(1049, 'magnetic field', 4, 44),
(1050, 'electric current', 4, 44),
(1052, 'magnetic forces', 4, 44),
(1053, 'magnets', 4, 44),
(1056, 'currents', 4, 44),
(1058, 'visible colors', 4, 44),
(1059, 'cones', 4, 44),
(1060, 'brightness', 4, 44),
(1061, 'wavelength', 4, 44),
(1062, 'cells work', 4, 44),
(1063, 'refraction', 4, 44),
(1064, 'absence of light', 4, 44),
(1065, 'transparent materials', 4, 44),
(1066, 'light travels', 4, 44),
(1067, 'sensitive cells', 4, 44),
(1068, 'principle', 4, 44),
(1069, 'electromagnetic radiation', 4, 44),
(1070, 'violet', 4, 44),
(1071, 'fermat', 4, 44),
(1073, 'law of reflection', 4, 44),
(1074, 'light', 4, 44),
(1075, 'optics', 4, 44),
(1076, 'light wave', 4, 44),
(1077, 'electron', 4, 44),
(1078, 'photon', 4, 44),
(1079, 'diffraction', 4, 44),
(1080, 'scattering', 4, 44),
(1081, 'color absorption', 4, 44),
(1082, 'color dispersion', 4, 44),
(1083, 'cell', 4, 39),
(1084, 'differentiated', 4, 39),
(1085, 'differentiated cell', 4, 39),
(1086, 'zygote', 4, 39),
(1087, 'stem cell', 4, 39),
(1088, 'embryonic stem cell', 4, 39),
(1089, 'adult stem cell', 4, 39),
(1090, 'cord-blood stem cell', 4, 39),
(1091, 'tissue', 4, 39),
(1092, 'organ', 4, 39),
(1093, 'organ system', 4, 39),
(1094, 'homeostasis', 4, 39),
(1095, 'dynamic equilibrium', 4, 39),
(1096, 'feedback regulation', 4, 39),
(1097, 'negative feedback', 4, 39),
(1098, 'positive feedback', 4, 39),
(1099, 'aerobes', 4, 39),
(1100, 'anaerobes', 4, 39),
(1101, 'aerobic', 4, 39),
(1102, 'anaerobic', 4, 39),
(1103, 'respiration', 4, 39),
(1104, 'alcoholic fermentation', 4, 39),
(1105, 'fermentation', 4, 39),
(1106, 'atp', 4, 39),
(1107, 'carbon-oxygen', 4, 39),
(1108, 'carbon', 4, 39),
(1109, 'oxygen', 4, 39),
(1110, 'cellular respiration', 4, 39),
(1111, 'chemical equation', 4, 39),
(1112, 'chemiosmosis', 4, 39),
(1113, 'electron transport chain', 4, 39),
(1114, 'etc', 4, 39),
(1115, 'eutrophication', 4, 39),
(1116, 'glycolysis', 4, 39),
(1117, 'krebs cycle', 4, 39),
(1118, 'lactic acid fermentation', 4, 39),
(1119, 'mitochondrion', 4, 39);
/*!40000 ALTER TABLE `BrowseTerms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `BrowseTermHasSynonyms`
--

LOCK TABLES `BrowseTermHasSynonyms` WRITE;
/*!40000 ALTER TABLE `BrowseTermHasSynonyms` DISABLE KEYS */;
INSERT INTO `BrowseTermHasSynonyms` (`termID`,  `synonymTermID`) VALUES
(15, 16),
(15, 17),
(17, 15),
(17, 16),
(12, 13);
/*!40000 ALTER TABLE `BrowseTermHasSynonyms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ArtifactHasBrowseTerms`
--

LOCK TABLES `ArtifactHasBrowseTerms` WRITE;
/*!40000 ALTER TABLE `ArtifactHasBrowseTerms` DISABLE KEYS */;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) VALUES
(2, 1),
(2, 27),
(2, 28),
(2, 29),
(2, 44),
(3, 1),
(3, 27),
(3, 28),
(3, 29),
(3, 44),
(4, 1),
(4, 27),
(4, 28),
(4, 29),
(4, 44),
(5, 1),
(5, 27),
(5, 28),
(5, 29),
(5, 44),
(6, 1),
(6, 27),
(6, 28),
(6, 29),
(6, 44),
(8, 1),
(8, 27),
(8, 28),
(8, 29),
(8, 30),
(8, 31),
(8, 32),
(8, 33),
(8, 34),
(8, 35),
(8, 36),
(8, 37),
(8, 38),
(9, 1),
(9, 27),
(9, 28),
(9, 29),
(9, 30),
(9, 31),
(9, 32),
(9, 33),
(9, 34),
(9, 35),
(9, 36),
(9, 37),
(9, 38),
(8, 39),
(9, 39),
(2, 1006),
(2, 1007),
(2, 1008),
(2, 1009),
(2, 1010),
(2, 1011),
(2, 1012),
(2, 1013),
(2, 1014),
(2, 1015),
(2, 1016),
(2, 1017),
(2, 1018),
(3, 1020),
(3, 1021),
(3, 1022),
(3, 1023),
(3, 1024),
(3, 1025),
(4, 1026),
(4, 1027),
(4, 1028),
(4, 1029),
(4, 1030),
(4, 1031),
(4, 1032),
(4, 1033),
(4, 1034),
(4, 1013),
(4, 1036),
(4, 1037),
(4, 1038),
(4, 1040),
(4, 1041),
(4, 1042),
(5, 1044),
(5, 1045),
(5, 1046),
(5, 1047),
(5, 1048),
(5, 1049),
(5, 1050),
(5, 1034),
(5, 1052),
(5, 1053),
(5, 1040),
(5, 1056),
(6, 1058),
(6, 1059),
(6, 1060),
(6, 1061),
(6, 1062),
(6, 1063),
(6, 1064),
(6, 1065),
(6, 1066),
(6, 1067),
(6, 1068),
(6, 1069),
(6, 1070),
(6, 1071),
(6, 1049),
(6, 1073),
(6, 1074),
(6, 1075),
(6, 1076),
(6, 1077),
(6, 1078),
(6, 1079),
(6, 1080),
(6, 1081),
(6, 1082),
(8, 1083),
(8, 1084),
(8, 1085),
(8, 1086),
(8, 1087),
(8, 1088),
(8, 1089),
(8, 1090),
(8, 1091),
(8, 1092),
(8, 1093),
(8, 1094),
(8, 1095),
(8, 1096),
(8, 1097),
(8, 1098),
(9, 1099),
(9, 1100),
(9, 1101),
(9, 1102),
(9, 1103),
(9, 1104),
(9, 1105),
(9, 1106),
(9, 1107),
(9, 1108),
(9, 1109),
(9, 1110),
(9, 1111),
(9, 1112),
(9, 1113),
(9, 1114),
(9, 1115),
(9, 1116),
(9, 1117),
(9, 1118),
(9, 1119);
/*!40000 ALTER TABLE `ArtifactHasBrowseTerms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Standards`
--

LOCK TABLES `Standards` WRITE;
/*!40000 ALTER TABLE `Standards` DISABLE KEYS */;
INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) VALUES
(1,7,6,'1','Motion and Forces','Newton\'s laws predict the motion of most objects. As a basis for understanding this concept:\r\n\r\na. Students know how to solve problems that involve constant speed and average speed.\r\nb. Students know that when forces are balanced, no acceleration occurs; thus an object continues to move at a constant speed or stays at rest (Newton\'s first law).\r\nc. Students know how to apply the law F=ma to solve one-dimensional motion problems that involve constant forces (Newton\'s second law).\r\nd. Students know that when one object exerts a force on a second object, the second object always exerts a force of equal magnitude and in the opposite direction (Newton\'s third law).\r\ne. Students know the relationship between the universal law of gravitation and the effect of gravity on an object at the surface of Earth.\r\nf. Students know applying a force to an object perpendicular to the direction of its motion causes the object to change direction but not speed (e.g., Earth\'s gravitational force causes a satellite in a circular orbit to change direction but not speed).\r\ng. Students know circular motion requires the application of a constant force directed toward the center of the circle.\r\nh.* Students know Newton\'s laws are not exact but provide very good approximations unless an object is moving close to the speed of light or is small enough that quantum effects are important.\r\ni.* Students know how to solve two-dimensional trajectory problems.\r\nj.* Students know how to resolve two-dimensional vectors into their components and calculate the magnitude and direction of a vector from its components.\r\nk.* Students know how to solve two-dimensional problems involving balanced forces (statics).\r\nl.* Students know how to solve problems in circular motion by using the formula for centripetal acceleration in the following form: a=v2/r.\r\nm.* Students know how to solve problems involving the forces between two electric charges at a distance (Coulomb\'s law) or the forces between two masses at a distance (universal gravitation).'),
(2,7,6,'2','Conservation of Energy and Momentum','The laws of conservation of energy and momentum provide a way to predict and describe the movement of objects. As a basis for understanding this concept:\r\n\r\na. Students know how to calculate kinetic energy by using the formula E= (1/2)mv2.\r\nb. Students know how to calculate changes in gravitational potential energy near Earth by using the formula (change in potential energy) =mgh (h is the change in the elevation).\r\nc. Students know how to solve problems involving conservation of energy in simple systems, such as falling objects.\r\nd. Students know how to calculate momentum as the product mv.\r\ne. Students know momentum is a separately conserved quantity different from energy.\r\nf. Students know an unbalanced force on an object produces a change in its momentum.\r\ng. Students know how to solve problems involving elastic and inelastic collisions in one dimension by using the principles of conservation of momentum and energy.\r\nh.* Students know how to solve problems involving conservation of energy in simple systems with various sources of potential energy, such as capacitors and springs.'),
(3,7,6,'3','Heat and Thermodynamics','Energy cannot be created or destroyed, although in many processes energy is trans­ferred to the environment as heat. As a basis for understanding this concept:\r\n\r\na. Students know heat flow and work are two forms of energy transfer between systems.\r\nb. Students know that the work done by a heat engine that is working in a cycle is the difference between the heat flow into the engine at high temperature and the heat flow out at a lower temperature (first law of thermodynamics) and that this is an example of the law of conservation of energy.\r\nc. Students know the internal energy of an object includes the energy of random motion of the object\'s atoms and molecules, often referred to as thermal energy. The greater the temperature of the object, the greater the energy of motion of the atoms and molecules that make up the object.\r\nd. Students know that most processes tend to decrease the order of a system over time and that energy levels are eventually distributed uniformly.\r\ne. Students know that entropy is a quantity that measures the order or disorder of a system and that this quantity is larger for a more disordered system.\r\nf.* Students know the statement \"Entropy tends to increase\" is a law of statistical probability that governs all closed systems (second law of thermodynamics).\r\ng.* Students know how to solve problems involving heat flow, work, and efficiency in a heat engine and know that all real engines lose some heat to their surround­ings.'),
(4,7,6,'4','Waves','Waves have characteristic properties that do not depend on the type of wave. As a basis for understanding this concept:\r\n\r\na. Students know waves carry energy from one place to another.\r\nb. Students know how to identify transverse and longitudinal waves in mechanical media, such as springs and ropes, and on the earth (seismic waves).\r\nc. Students know how to solve problems involving wavelength, frequency, and wave speed.\r\nd. Students know sound is a longitudinal wave whose speed depends on the proper­ties of the medium in which it propagates.\r\ne. Students know radio waves, light, and X-rays are different wavelength bands in the spectrum of electromagnetic waves whose speed in a vacuum is approxi­mately 3 8 m/s (186,000 miles/second).\r\nf. Students know how to identify the characteristic properties of waves: interference (beats), diffraction, refraction, Doppler effect, and polarization.'),
(5,7,6,'5','Electric and Magnetic Phenomena','Electric and magnetic phenomena are related and have many practical applications. As a basis for understanding this concept:\r\n\r\na. Students know how to predict the voltage or current in simple direct current (DC) electric circuits constructed from batteries, wires, resistors, and capacitors.\r\nb. Students know how to solve problems involving Ohm\'s law.\r\nc. Students know any resistive element in a DC circuit dissipates energy, which heats the resistor. Students can calculate the power (rate of energy dissipation) in any resistive circuit element by using the formula Power = IR (potential difference) × I (current) = I2R.\r\nd. Students know the properties of transistors and the role of transistors in electric circuits.\r\ne. Students know charged particles are sources of electric fields and are subject to the forces of the electric fields from other charges.\r\nf. Students know magnetic materials and electric currents (moving electric charges) are sources of magnetic fields and are subject to forces arising from the magnetic fields of other sources.\r\ng. Students know how to determine the direction of a magnetic field produced by a current flowing in a straight wire or in a coil.\r\nh. Students know changing magnetic fields produce electric fields, thereby inducing currents in nearby conductors.\r\ni. Students know plasmas, the fourth state of matter, contain ions or free electrons or both and conduct electricity.\r\nj.* Students know electric and magnetic fields contain energy and act as vector force fields.\r\nk.* Students know the force on a charged particle in an electric field is qE, where E is the electric field at the position of the particle and q is the charge of the particle.\r\nl.* Students know how to calculate the electric field resulting from a point charge.\r\nm.* Students know static electric fields have as their source some arrangement of electric charges.\r\nn.* Students know the magnitude of the force on a moving particle (with charge q) in a magnetic field is qvB sin(a), where a is the angle between v and B (v and B are the magnitudes of vectors v and B, respectively), and students use the right-hand rule to find the direction of this force.\r\no.* Students know how to apply the concepts of electrical and gravitational potential energy to solve problems involving conservation of energy.');
/*!40000 ALTER TABLE `Standards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `StandardHasGrades`
--

LOCK TABLES `StandardHasGrades` WRITE;
/*!40000 ALTER TABLE `StandardHasGrades` DISABLE KEYS */;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`) VALUES
(1,10),
(2,10),
(3,10),
(4,10),
(5,10),
(1,11),
(2,11),
(3,11),
(4,11),
(5,11),
(1,12),
(2,12),
(3,12),
(4,12),
(5,12),
(1,13),
(2,13),
(3,13),
(4,13),
(5,13);
/*!40000 ALTER TABLE `StandardHasGrades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ArtifactRevisionHasStandards`
--

LOCK TABLES `ArtifactRevisionHasStandards` WRITE;
/*!40000 ALTER TABLE `ArtifactRevisionHasStandards` DISABLE KEYS */;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) VALUES
(2,1),
(3,2),
(6,4),
(4,5),
(5,5);
/*!40000 ALTER TABLE `ArtifactRevisionHasStandards` ENABLE KEYS */;
UNLOCK TABLES;
