DROP TABLE IF EXISTS `ConceptNodeRelations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ConceptNodeRelations` (
    `conceptID` int(11) NOT NULL COMMENT 'The concept ID',
    `relatedConceptID` int(11) NOT NULL COMMENT 'The concept ID of the related concept',
    `relationType` varchar(255) NOT NULL COMMENT 'The relation type between the conceptID and relatedConceptID',
    `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The timestamp this node was created',
    `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The update time',
    PRIMARY KEY (`conceptID`, `relatedConceptID`, `relationType`),
    CONSTRAINT `ConceptNodeRelations_ibfk_1` FOREIGN KEY (`conceptID`) REFERENCES `ConceptNodes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `ConceptNodeRelations_ibfk_2` FOREIGN KEY (`relatedConceptID`) REFERENCES `ConceptNodes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='ConceptNodeRelations';
/*!40101 SET character_set_client = @saved_cs_client */;
