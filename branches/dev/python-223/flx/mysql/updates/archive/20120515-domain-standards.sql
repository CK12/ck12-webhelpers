--
-- Dumping data for table `From1xChapters`
--
DROP TABLE IF EXISTS `DomainHasStandards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DomainHasStandards` (
    `domainID` int(11) NOT NULL COMMENT 'The domain term id.',
    `standardID` int(11) NOT NULL COMMENT 'The standard id.',
    PRIMARY KEY (`domainID`, `standardID`),
    CONSTRAINT `DomainHasStandards_ibfk_1` FOREIGN KEY (`domainID`) REFERENCES `BrowseTerms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `DomainHasStandards_ibfk_2` FOREIGN KEY (`standardID`) REFERENCES `Standards`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='DomainHasStandards';
/*!40101 SET character_set_client = @saved_cs_client */;

DROP VIEW IF EXISTS `ArtifactDomainAndStandards`;
CREATE VIEW `ArtifactDomainAndStandards` AS 
    SELECT a.artifactID, b.id as browseTermID, b.encodedID, b.name as termName, s.id as standardID, s.section, s.title, s.description, sb.id as boardID, sb.name as boardName, sb.countryID, sub.id as subjectID, sub.name as subjectName 
    FROM ArtifactHasBrowseTerms as a, BrowseTerms as b, DomainHasStandards as d, Standards as s, StandardBoards as sb, Subjects as sub 
    WHERE d.domainID = b.id and d.standardID = s.id and d.domainID = a.browseTermID and s.standardBoardID = sb.id and s.subjectID = sub.id order by artifactID, standardID;

DROP VIEW IF EXISTS `ArtifactDomainsStandardsGradesAndBrowseTerms`;
CREATE VIEW `ArtifactDomainsStandardsGradesAndBrowseTerms` AS
    SELECT ab.artifactID, s.id as standardID, s.section, s.title, sb.id as boardID, sb.name as boardName, sb.longname as boardLongName, sb.countryID, b.id as termID, b.termTypeID, b.name as termName, b.parentID, b.encodedID, g.id as gradeID, g.name as gradeName 
    FROM DomainHasStandards as d, Standards as s, StandardBoards as sb, ArtifactHasBrowseTerms as ab, BrowseTerms as b, StandardHasGrades as sg, Grades as g 
    WHERE d.domainID = b.id and d.standardID = s.id and s.standardBoardID = sb.id and ab.browseTermID = b.id and s.id = sg.standardID and sg.gradeID = g.id 
    ORDER BY artifactID, standardID;

DROP VIEW IF EXISTS RevisionAndStandards;
CREATE VIEW RevisionAndStandards AS 
    SELECT r.artifactRevisionID as rid, a.artifactID, s.id as standardID, s.section, s.title, s.description, sb.id as boardID, sb.name as boardName, sb.countryID, sub.id as subjectID, sub.name as subjectName 
    FROM ArtifactRevisionHasStandards as r, ArtifactRevisions as a, Standards as s, StandardBoards as sb, Subjects as sub 
    WHERE r.artifactRevisionID = a.id and r.standardID = s.id and s.standardBoardID = sb.id and s.subjectID = sub.id order by rid, s.id;

DROP VIEW IF EXISTS ArtifactsStandardsGradesAndBrowseTerms;
CREATE VIEW ArtifactsStandardsGradesAndBrowseTerms AS 
    SELECT ar.artifactID as artifactID, s.id, s.section, s.title, sb.id as boardID, sb.name as boardName, sb.longname as boardLongName, sb.countryID, b.id as termID, b.termTypeID, b.name as termName, b.parentID, b.encodedID, g.id as gradeID, g.name as gradeName 
    FROM ArtifactRevisionHasStandards as r, Standards as s, StandardBoards as sb, ArtifactRevisions as ar, ArtifactHasBrowseTerms as ab, BrowseTerms as b, StandardHasGrades as sg, Grades as g 
    WHERE r.artifactRevisionID = ar.id and r.standardID = s.id and s.standardBoardID = sb.id and ar.artifactID = ab.artifactID and ab.browseTermID = b.id and s.id = sg.standardID and sg.gradeID = g.id 
    ORDER BY artifactID, s.id;

