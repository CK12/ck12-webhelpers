--
-- Table structure for table `ArtifactHandles`
--

DROP TABLE IF EXISTS `ArtifactHandles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactHandles` (
    `artifactID` int(11) NOT NULL COMMENT 'The artifact id.',
    `handle` varchar(255) NOT NULL COMMENT 'The old handle of the artifact.',
    PRIMARY KEY (`artifactID`, `handle`),
    CONSTRAINT `ArtifactHandles_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The previously used handles.';
/*!40101 SET character_set_client = @saved_cs_client */;
