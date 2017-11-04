LOCK TABLES `ArtifactTypes` WRITE;
/*!40000 ALTER TABLE `ArtifactTypes` DISABLE KEYS */;
ALTER TABLE `ArtifactTypes` ADD `extensionType` varchar(31) NOT NULL COMMENT 'The artifact type extension type';

UPDATE `ArtifactTypes` set `extensionType` = 'FB' where name = 'book';
UPDATE `ArtifactTypes` set `extensionType` = 'CH' where name = 'chapter';
UPDATE `ArtifactTypes` set `extensionType` = 'L' where name = 'lesson';
UPDATE `ArtifactTypes` set `extensionType` = 'C' where name = 'concept';
UPDATE `ArtifactTypes` set `extensionType` = 'X' where name = 'exercise';
UPDATE `ArtifactTypes` set `extensionType` = 'TM' where name = 'teaching-material';
UPDATE `ArtifactTypes` set `extensionType` = 'F' where name = 'folder';
UPDATE `ArtifactTypes` set `extensionType` = 'S' where name = 'section';
UPDATE `ArtifactTypes` set `extensionType` = 'TE' where name = 'tebook';
UPDATE `ArtifactTypes` set `extensionType` = 'WB' where name = 'workbook';
UPDATE `ArtifactTypes` set `extensionType` = 'SG' where name = 'studyguide';
UPDATE `ArtifactTypes` set `extensionType` = 'LK' where name = 'labkit';

INSERT INTO `ArtifactTypes` (`id`, `name`, `extensionType`, `description`) VALUES
(13, 'rwa', 'RWA', 'The real-world application artifact'),
(14, 'rwaans', 'RWAA', 'The real-world application with answer keys artifact'),
(15, 'lecture', 'LEC', 'The lecture artifact'),
(16, 'enrichment', 'EN', 'The enrichment artifact'),
(17, 'simulation', 'SIM', 'The simulation artifact'),
(18, 'audio', 'AU', 'The audio artifact'),
(19, 'lab', 'LAB', 'The lab artifact'),
(20, 'labans', 'LABA', 'The lab artifact with answer keys'),
(21, 'worksheet', 'WS', 'The worksheet artifact'),
(22, 'worksheetans', 'WSA', 'The worksheet artifact with answer keys'),
(23, 'activity', 'ACT', 'The activity artifact'),
(24, 'activityans', 'ACTA', 'The activity artifact with answer keys'),
(25, 'preread', 'PRER', 'The pre-read artifact'),
(26, 'prereadans', 'PRERA', 'The pre-read artifact with answer keys'),
(27, 'postread', 'POSTR', 'The post-read artifact'),
(28, 'postreadans', 'POSTRA', 'The post-read artifact with answer keys'),
(29, 'whileread', 'WR', 'The while-read artifact'),
(30, 'whilereadans', 'WRA', 'The while-read artifact with answer keys'),
(31, 'prepostread', 'PPR', 'The pre/post-read artifact'),
(32, 'prepostreadans', 'PPRA', 'The pre/post-read artifact with answer keys'),
(33, 'flashcard', 'FC', 'The flash card artifact'),
(34, 'web', 'W', 'The web resource artifact'),
(35, 'handout', 'HO', 'The hand out artifact'),
(36, 'rubric', 'R', 'The rubric artifact'),
(37, 'lessonplanx', 'LPX', 'The external lesson plan artifact'),
(38, 'lessonplanxans', 'LPXA', 'The external lesson plan artifact with answer keys'),
(39, 'lessonplan', 'LP', 'The lesson plan artifact (CK-12)'),
(40, 'lessonplanans', 'LPA', 'The lesson plan artifact (CK-12) with answer keys'),
(41, 'presentation', 'PRES', 'The presentation artifact'),
(42, 'interactive', 'I', 'The interactive artifact'),
(43, 'image', 'IMG', 'The image artifact'),
(44, 'conceptmap', 'CMAP', 'The concept map artifact'),
(45, 'quiz', 'Q', 'The quiz artifact'),
(46, 'quizans', 'QA', 'The quiz artifact with answer keys'),
(47, 'quizdemo', 'QD', 'The quiz demonstration artifact'),
(48, 'cthink', 'CTH', 'The critical thinking artifact'),
(49, 'attachment', 'ATT', 'The attachment type artifact');

ALTER TABLE `ArtifactTypes` ADD UNIQUE (`extensionType`);
/*!40000 ALTER TABLE `ArtifactTypes` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `RelatedArtifacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RelatedArtifacts` (
    `domainID` int(11) NOT NULL  COMMENT 'The domain term EID',
    `sequence` int(11) NOT NULL COMMENT 'The sequence number for EID',
    `artifactID` int(11) NOT NULL COMMENT 'The artifactID',
    PRIMARY KEY (`domainID`, `sequence`, `artifactID`),
    CONSTRAINT `RelatedArtifacts_ibfk_1` FOREIGN KEY (`domainID`) REFERENCES `BrowseTerms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `RelatedArtifacts_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='RelatedArtifacts';
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `ResourceTypes` WRITE;
/*!40000 ALTER TABLE `ResourceTypes` DISABLE KEYS */;
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES
(31, 'web', 'The web resource', 0, 0),
(32, 'reading', 'The reading resource', 0, 0),
(33, 'presentation', 'The presentation resource', 0, 0),
(34, 'lab', 'The lab resource', 0, 0),
(35, 'cthink', 'The critical thinking resource', 0, 0);
/*!40000 ALTER TABLE `ResourceTypes` ENABLE KEYS */;
UNLOCK TABLES;

