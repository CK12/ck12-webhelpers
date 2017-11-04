LOCK TABLES `ArtifactTypes` WRITE;
/*!40000 ALTER TABLE `ArtifactTypes` DISABLE KEYS */;
ALTER TABLE `ArtifactTypes` ADD `modality` tinyint(1) DEFAULT 0 COMMENT 'Is this artifact type a modality?';

UPDATE `ArtifactTypes` SET `modality` = 1 WHERE `extensionType` NOT IN ('FB', 'CH', 'TM', 'F', 'S', 'TE', 'WB', 'LK');
/*!40000 ALTER TABLE `ArtifactTypes` ENABLE KEYS */;
UNLOCK TABLES;

INSERT INTO `BrowseTermTypes` (`id`, `name`) VALUES (9, 'contributor');
INSERT INTO `BrowseTermTypes` (`id`, `name`) VALUES (10, 'pseudodomain');
INSERT INTO `BrowseTerms` (`name`, `termTypeID`) VALUES ('teacher', 9), ('student', 9), ('community', 9);
