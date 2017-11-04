DROP TABLE IF EXISTS `RelatedArtifactsBackup_2_7_2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RelatedArtifactsBackup_2_7_2` (
  `domainID` int(11) NOT NULL COMMENT 'The domain term EID',
  `sequence` int(11) NOT NULL COMMENT 'The sequence number for EID',
  `artifactID` int(11) NOT NULL COMMENT 'The artifactID',
  `conceptCollectionHandle` varchar(128) NOT NULL DEFAULT '' COMMENT 'The conceptCollectionHandle for the EID.',
  `collectionCreatorID` int(11) NOT NULL DEFAULT 0 COMMENT 'The cK-12 member id.',
  PRIMARY KEY (`domainID`,`sequence`,`artifactID`, `conceptCollectionHandle`, `collectionCreatorID`),
  KEY `RelatedArtifactsBackup_2_7_2_cc` (`collectionCreatorID`),
  KEY `RelatedArtifactsBackup_2_7_2_cch` (`conceptCollectionHandle`),
  KEY `RelatedArtifactsBackup_2_7_2_ibfk_2` (`artifactID`),
  KEY `RelatedArtifactsBackup_2_7_2_cc_cch` (`collectionCreatorID`, `conceptCollectionHandle`),
  KEY `RelatedArtifactsBackup_2_7_2_cch_cc` (`conceptCollectionHandle`, `collectionCreatorID`),
  CONSTRAINT `RelatedArtifactsBackup_2_7_2_ibfk_1` FOREIGN KEY (`domainID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `RelatedArtifactsBackup_2_7_2_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='RelatedArtifactsBackup_2_7_2s';
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `RelatedArtifactsBackup_2_7_2` SELECT `domainID`, `sequence`, `artifactID`, `conceptCollectionHandle`, `collectionCreatorID` FROM `RelatedArtifacts`;

call update_dbpatch('20170829-backup-RelatedArtifacts_2_7_2.sql');