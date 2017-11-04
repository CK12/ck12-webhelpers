DROP TABLE IF EXISTS `StudyTrackItemContextsBackup_2_7_2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StudyTrackItemContextsBackup_2_7_2` (
  `studyTrackID` int(11) NOT NULL COMMENT 'The study track id.',
  `studyTrackItemID` int(11) NOT NULL COMMENT 'The id of the study track item.',
  `contextUrl` varchar(1024) NOT NULL DEFAULT '' COMMENT 'The context url for study track item.',
  `conceptCollectionHandle` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'The conceptCollectionHandle for the studyTrackID',
  `collectionCreatorID` int(11) NOT NULL DEFAULT 0 COMMENT 'The cK-12 member id.',
  PRIMARY KEY (`studyTrackID`, `studyTrackItemID`, `conceptCollectionHandle`, `collectionCreatorID`),
  CONSTRAINT `StudyTrackItemContextsBackup_2_7_2_ibfk_1` FOREIGN KEY (`studyTrackID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `StudyTrackItemContextsBackup_2_7_2_ibfk_2` FOREIGN KEY (`studyTrackItemID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `StudyTrackItemContextsBackup_2_7_2` SELECT `studyTrackID`, `studyTrackItemID`, `contextUrl`, `conceptCollectionHandle`, `collectionCreatorID` FROM `StudyTrackItemContexts`;

call update_dbpatch('20170828-backup-StudyTrackItemContexts.sql');