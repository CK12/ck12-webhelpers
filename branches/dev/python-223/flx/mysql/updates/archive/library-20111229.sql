--
-- Table structure for table `MemberLibraryObjects`
--

DROP TABLE IF EXISTS `MemberLibraryObjectHasLabels`;
DROP TABLE IF EXISTS `MemberLibraryObjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberLibraryObjects` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `objectID` int(11) NOT NULL COMMENT 'The id of the object in Member Library',
    `objectType` enum('artifactRevision', 'resourceRevision') NOT NULL COMMENT 'The type of the object',
    `parentID` int(11) NOT NULL COMMENT 'The parent id of the object',
    `memberID` int(11) NOT NULL COMMENT 'The member id who owns this library entry',
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The time when object was added to the library',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`objectID`, `objectType`, `memberID`),
    UNIQUE KEY (`objectID`, `objectType`, `memberID`, `parentID`),
    CONSTRAINT `MemberLibraryObjects_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='MemberLibraryObjects';
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `MemberLabels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberLabels` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `memberID` int(11) NULL COMMENT 'The id of the member who owns this label',
    `label` varchar(255) NOT NULL COMMENT 'The label',
    `systemLabel` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Is system generated',
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The time of label creation.',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`memberID`, `label`),
    CONSTRAINT `MemberLabels_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='MemberLabels';
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberLibraryObjectHasLabels` (
    `libraryObjectID` int(11) NOT NULL COMMENT 'The id of the library object',
    `labelID` int(11) NOT NULL COMMENT 'The label ID',
    PRIMARY KEY (`libraryObjectID`, `labelID`),
    CONSTRAINT `MemberLibraryObjectHasLabels_ibfk_1` FOREIGN KEY (`libraryObjectID`) REFERENCES `MemberLibraryObjects`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `MemberLibraryObjectHasLabels_ibfk_2` FOREIGN KEY (`labelID`) REFERENCES `MemberLabels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='MemberLibraryObjectHasLabels';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Views
--

drop view if exists MemberLibraryArtifactRevisions;
create view MemberLibraryArtifactRevisions as select m.id, m.memberID, m.objectID as artifactRevisionID, m.objectType, m.created, ar.artifactID, a.artifactTypeID, a.name, a.updateTime, a.creationTime, a.creatorID from MemberLibraryObjects as m, ArtifactRevisions as ar, Artifacts as a where m.objectType='artifactRevision' and m.objectID = ar.id and ar.artifactID = a.id;

drop view if exists MemberLibraryArtifactRevisionsAndBrowseTerms;
create view MemberLibraryArtifactRevisionsAndBrowseTerms as select m.id, m.memberID, m.objectID as artifactRevisionID, m.objectType, m.created, ar.artifactID, a.artifactTypeID, a.name, a.updateTime, a.creationTime, a.creatorID, b.browseTermID, b.name as term, b.termTypeID, b.encodedID, b.parentID from MemberLibraryObjects as m, ArtifactRevisions as ar, Artifacts as a, ArtifactsAndBrowseTerms as b where m.objectType='artifactRevision' and m.objectID = ar.id and ar.artifactID = a.id and a.id = b.id;

drop view if exists MemberLibraryResourceRevisions;
create view MemberLibraryResourceRevisions as select m.id, m.memberID, m.objectID as resourceRevisionID, m.objectType, m.created, ar.resourceID, a.resourceTypeID, a.name, a.uri, a.creationTime, a.ownerID from MemberLibraryObjects as m, ResourceRevisions as ar, Resources as a where m.objectType='resourceRevision' and m.objectID = ar.id and ar.resourceID = a.id;

drop view if exists MemberLibraryArtifactRevisionHasLabels;
create view MemberLibraryArtifactRevisionHasLabels as select m.labelID, ml.memberID, ml.systemLabel, m.libraryObjectID, mar.artifactRevisionID, mar.objectType, ar.artifactID, a.artifactTypeID, a.name, a.updateTime, a.creationTime, a.creatorID from MemberLibraryObjectHasLabels as m, MemberLibraryArtifactRevisions as mar, MemberLabels as ml, ArtifactRevisions as ar, Artifacts as a where m.libraryObjectID = mar.id and mar.objectType = 'artifactRevision' and m.labelID = ml.id and mar.artifactRevisionID = ar.id and ar.artifactID = a.id;

drop view if exists MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms;
create view MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms as select m.labelID, ml.memberID, ml.systemLabel, m.libraryObjectID, mar.artifactRevisionID, mar.objectType, ar.artifactID, a.artifactTypeID, a.name, a.updateTime, a.creationTime, a.creatorID, b.browseTermID, b.name as term, b.termTypeID, b.parentID, b.encodedID from MemberLibraryObjectHasLabels as m, MemberLibraryArtifactRevisions as mar, MemberLabels as ml, ArtifactRevisions as ar, Artifacts as a, ArtifactsAndBrowseTerms as b where m.libraryObjectID = mar.id and mar.objectType = 'artifactRevision' and m.labelID = ml.id and mar.artifactRevisionID = ar.id and ar.artifactID = a.id and a.id = b.id;

drop view if exists MemberLibraryResourceRevisionHasLabels;
create view MemberLibraryResourceRevisionHasLabels as select m.labelID, ml.memberID, ml.systemLabel, m.libraryObjectID, mar.resourceRevisionID, mar.objectType, ar.resourceID, a.resourceTypeID, a.name, a.uri, a.creationTime, a.ownerID from MemberLibraryObjectHasLabels as m, MemberLibraryResourceRevisions as mar, MemberLabels as ml, ResourceRevisions as ar, Resources as a where m.libraryObjectID = mar.id and mar.objectType = 'resourceRevision' and m.labelID = ml.id and mar.resourceRevisionID = ar.id and ar.resourceID = a.id;

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

