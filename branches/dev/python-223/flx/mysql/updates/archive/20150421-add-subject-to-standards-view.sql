DROP VIEW IF EXISTS `ArtifactDomainsStandardsGradesAndBrowseTerms`;
CREATE VIEW `ArtifactDomainsStandardsGradesAndBrowseTerms` AS
    SELECT ab.artifactID, s.id as standardID, s.section, s.title, sb.id as boardID, sb.name as boardName, sb.longname as boardLongName, sb.sequence, sb.countryID, b.id as termID, b.termTypeID, b.name as termName, b.parentID, b.encodedID, substring_index(b.encodedID, '.', 2) as subject, g.id as gradeID, g.name as gradeName 
    FROM DomainHasStandards as d, Standards as s, StandardBoards as sb, ArtifactHasBrowseTerms as ab, BrowseTerms as b, StandardHasGrades as sg, Grades as g 
    WHERE d.domainID = b.id and d.standardID = s.id and s.standardBoardID = sb.id and ab.browseTermID = b.id and s.id = sg.standardID and sg.gradeID = g.id 
    ORDER BY artifactID, standardID;


