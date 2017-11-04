drop view if exists ArtifactsAndBrowseTerms;
create view ArtifactsAndBrowseTerms as select a.id, a.artifactTypeID, a.creatorID, b.id as browseTermID, b.name, b.handle, b.termTypeID, b.parentID , b.encodedID from Artifacts a, BrowseTerms b, ArtifactHasBrowseTerms c where a.id = c.artifactID and b.id = c.browseTermID;

DROP VIEW IF EXISTS ArtifactsAndTagTerms;
CREATE VIEW ArtifactsAndTagTerms AS
    SELECT
        a.id AS id, a.artifactTypeID AS artifactTypeID, a.creatorID AS creatorID,
        t.id AS tagTermID, t.name AS name
    FROM ((Artifacts a join TagTerms t) join ArtifactHasTagTerms at)
    WHERE ((a.id = at.artifactID) AND (t.id = at.tagTermID));

DROP VIEW IF EXISTS ArtifactsAndSearchTerms;
CREATE VIEW ArtifactsAndSearchTerms AS
    SELECT
        a.id AS id, a.artifactTypeID AS artifactTypeID, a.creatorID AS creatorID,
        t.id AS searchTermID, t.name AS name
    FROM ((Artifacts a join SearchTerms t) join ArtifactHasSearchTerms at)
    WHERE ((a.id = at.artifactID) AND (t.id = at.searchTermID));

DROP VIEW IF EXISTS PublishedArtifacts;
CREATE VIEW PublishedArtifacts as 
    SELECT a.*, ar.id as artifactRevisionID, ar.revision, ar.publishTime
    FROM Artifacts a, ArtifactRevisions ar
    WHERE a.id = ar.artifactID AND ar.publishTime IS NOT NULL AND ar.id = ( SELECT MAX(id) FROM ArtifactRevisions WHERE artifactID = a.id);

drop view if exists ArtifactAndChildren;
create view ArtifactAndChildren as select a.id, a.artifactTypeID, c.artifactID as childID, rr.sequence from Artifacts a, ArtifactRevisions r, ArtifactRevisionRelations rr, ArtifactRevisions c where a.id = r.artifactID and r.id = rr.artifactRevisionID and rr.hasArtifactRevisionID = c.id;

DROP VIEW IF EXISTS ArtifactAndRevisions;
CREATE VIEW ArtifactAndRevisions AS
    SELECT a.*, at.name as typeName, ar.id as artifactRevisionID, ar.revision, ar.downloads, ar.favorites, ar.creationTime as revCreationTime, ar.publishTime,
           m.login
    FROM Artifacts a, ArtifactRevisions ar, ArtifactTypes at, Members m
    WHERE a.id = ar.artifactID AND a.artifactTypeID = at.id AND a.creatorID = m.id;

drop view if exists ArtifactAndResources;
create view ArtifactAndResources as select r.artifactID, a.artifactTypeID, c.* from Artifacts a, ArtifactRevisions r, Resources c, ResourceRevisions d, ArtifactRevisionHasResources rr where a.id = r.artifactID and r.id = rr.artifactRevisionID and rr.resourceRevisionID = d.id and d.resourceID = c.id;

DROP VIEW IF EXISTS RevisionAndStandards;
CREATE VIEW RevisionAndStandards AS 
    SELECT r.artifactRevisionID as rid, a.artifactID, s.id as standardID, s.section, s.title, s.description, sb.id as boardID, sb.name as boardName, sb.countryID, sub.id as subjectID, sub.name as subjectName 
    FROM ArtifactRevisionHasStandards as r, ArtifactRevisions as a, Standards as s, StandardBoards as sb, Subjects as sub 
    WHERE r.artifactRevisionID = a.id and r.standardID = s.id and s.standardBoardID = sb.id and s.subjectID = sub.id order by rid, s.id;

DROP VIEW IF EXISTS ArtifactsStandardsGradesAndBrowseTerms;
CREATE VIEW ArtifactsStandardsGradesAndBrowseTerms AS 
    SELECT ar.artifactID as artifactID, s.id, s.section, s.title, sb.id as boardID, sb.name as boardName, sb.longname as boardLongName, sb.sequence, sb.countryID, b.id as termID, b.termTypeID, b.name as termName, b.parentID, b.encodedID, g.id as gradeID, g.name as gradeName 
    FROM ArtifactRevisionHasStandards as r, Standards as s, StandardBoards as sb, ArtifactRevisions as ar, ArtifactHasBrowseTerms as ab, BrowseTerms as b, StandardHasGrades as sg, Grades as g 
    WHERE b.termTypeID = 3 and r.artifactRevisionID = ar.id and r.standardID = s.id and s.standardBoardID = sb.id and ar.artifactID = ab.artifactID and ab.browseTermID = b.id and s.id = sg.standardID and sg.gradeID = g.id; 

drop view if exists StandardAndGrades;
create view StandardAndGrades as select s.standardID as sid, g.id, g.name from StandardHasGrades as s, Grades as g where s.gradeID = g.id order by sid;

DROP VIEW IF EXISTS StandardsBoardsSubjectsAndGrades;
CREATE VIEW StandardsBoardsSubjectsAndGrades AS 
    SELECT s.*, sb.name as boardName, sb.longname as boardLongName, sb.countryID, sb.sequence, g.id as gradeID, g.name as gradeName, 
    sub.name as subjectName
    FROM Standards as s, StandardBoards as sb, Grades as g, StandardHasGrades as sg, Subjects as sub
    WHERE s.standardBoardID = sb.id AND s.id = sg.standardID AND sg.gradeID = g.id AND s.subjectID = sub.id;

drop view if exists RevisionAndResources;
create view RevisionAndResources as select rev.artifactRevisionID as revID, res.* from ArtifactRevisionHasResources as rev, ResourceRevisions as res where rev.resourceRevisionID = res.id order by revID, res.id;

drop view if exists TypedFeaturedArtifacts;
create view TypedFeaturedArtifacts as select f.artifactID as id, f.listOrder, f.comments, t.name as typeName from FeaturedArtifacts as f, Artifacts as a, ArtifactTypes as t where f.artifactID = a.id and a.artifactTypeID = t.id order by listOrder;

drop view if exists TypedMemberViewedArtifacts;
create view TypedMemberViewedArtifacts as select m.memberID, m.artifactID, t.name as typeName, m.lastViewTime from MemberViewedArtifacts as m, Artifacts as a, ArtifactTypes as t where m.artifactID = a.id and a.artifactTypeID = t.id order by memberID, typeName, lastViewTime desc;

drop view if exists TypedArtifactFavorites;
create view TypedArtifactFavorites as select distinct f.memberID, a.id as artifactID, t.name as typeName from ArtifactRevisionFavorites as f, Artifacts as a, ArtifactRevisions as r, ArtifactTypes as t where f.artifactRevisionID = r.id and r.artifactID = a.id and a.artifactTypeID = t.id order by memberID, typeName, artifactID;

drop view if exists EncodedIDNeighbors;
create view EncodedIDNeighbors as select d.domainID, b.encodedID as encodedID, d.requiredDomainID, c.encodedID as requiredEncodedID from DomainNeighbors as d, BrowseTerms as b, BrowseTerms as c where d.domainID=b.id and d.requiredDomainID=c.id;

drop view if exists MemberLibraryArtifactRevisions;
create view MemberLibraryArtifactRevisions as select m.id, m.memberID, m.objectID as artifactRevisionID, m.objectType, m.domainID, m.created as added, ar.artifactID, a.artifactTypeID, a.name, a.updateTime, a.creationTime, a.creatorID from MemberLibraryObjects as m, ArtifactRevisions as ar, Artifacts as a where m.objectType='artifactRevision' and m.objectID = ar.id and ar.artifactID = a.id;

drop view if exists MemberLibraryArtifactRevisionsAndBrowseTerms;
create view MemberLibraryArtifactRevisionsAndBrowseTerms as select m.id, m.memberID, m.objectID as artifactRevisionID, m.objectType, m.domainID, m.created as added, ar.artifactID, a.artifactTypeID, a.name, a.updateTime, a.creationTime, a.creatorID, b.browseTermID, b.name as term, b.termTypeID, b.encodedID, b.parentID from MemberLibraryObjects as m, ArtifactRevisions as ar, Artifacts as a, ArtifactsAndBrowseTerms as b where m.objectType='artifactRevision' and m.objectID = ar.id and ar.artifactID = a.id and a.id = b.id;

drop view if exists MemberLibraryResourceRevisions;
create view MemberLibraryResourceRevisions as select m.id, m.memberID, m.objectID as resourceRevisionID, m.objectType, m.domainID, m.created as added, ar.resourceID, a.resourceTypeID, a.name, a.uri, a.creationTime, a.ownerID from MemberLibraryObjects as m, ResourceRevisions as ar, Resources as a where m.objectType='resourceRevision' and m.objectID = ar.id and ar.resourceID = a.id;

DROP VIEW IF EXISTS MemberLibraryArtifactRevisionHasLabels;
CREATE VIEW MemberLibraryArtifactRevisionHasLabels AS
    SELECT
        mlo.labelID, mar.memberID, ml.label as labelName, ml.systemLabel, ml.memberID as labelOwnerID, mar.id as libraryObjectID, mar.artifactRevisionID, mar.objectType, mar.domainID, mar.added, ar.artifactID, a.artifactTypeID, a.name, a.updateTime, a.creationTime, a.creatorID, a.handle, ar.revision, m.login
    FROM
        MemberLibraryArtifactRevisions AS mar
    LEFT OUTER JOIN MemberLibraryObjectHasLabels AS mlo ON mar.id = mlo.libraryObjectID
    LEFT OUTER JOIN MemberLabels AS ml ON mlo.labelID = ml.id
    LEFT JOIN ArtifactRevisions AS ar ON ar.id = mar.artifactRevisionID
    LEFT JOIN Artifacts AS a ON a.id = ar.artifactID
    LEFT JOIN Members AS m ON m.id = a.creatorID
    WHERE mar.objectType IN ('artifactRevision', 'domain');

DROP VIEW IF EXISTS MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms;
CREATE VIEW MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms AS
    SELECT
        mlo.labelID, mar.memberID, ml.label as labelName, ml.systemLabel, ml.memberID as labelOwnerID, mlo.libraryObjectID, mar.artifactRevisionID, mar.objectType, mar.domainID, mar.added, ar.artifactID, a.artifactTypeID, a.name, a.updateTime, a.creationTime, a.creatorID, a.handle, ar.revision, m.login,
        b.browseTermID, b.name as term, b.termTypeID, b.parentID, b.encodedID
    FROM
        MemberLibraryArtifactRevisions AS mar
    LEFT OUTER JOIN MemberLibraryObjectHasLabels AS mlo on mar.id = mlo.libraryObjectID
    LEFT OUTER JOIN MemberLabels AS ml on mlo.labelID = ml.id
    LEFT JOIN ArtifactRevisions AS ar ON ar.id = mar.artifactRevisionID
    LEFT JOIN Artifacts AS a ON a.id = ar.artifactID
    LEFT JOIN Members AS m ON m.id = a.creatorID
    LEFT JOIN ArtifactsAndBrowseTerms AS b ON b.id = a.id
    WHERE mar.objectType = 'artifactRevision';

DROP VIEW IF EXISTS MemberLibraryResourceRevisionHasLabels;
CREATE VIEW MemberLibraryResourceRevisionHasLabels AS
    SELECT m.labelID, mar.memberID, ml.label as labelName, ml.systemLabel, ml.memberID as labelOwnerID, mar.id as libraryObjectID, mar.resourceRevisionID, mar.objectType, mar.domainID, mar.added, ar.resourceID, a.resourceTypeID, a.name, a.uri, a.isAttachment, a.creationTime, a.ownerID 
    FROM MemberLibraryResourceRevisions AS mar LEFT OUTER JOIN MemberLibraryObjectHasLabels AS m ON mar.id = m.libraryObjectID LEFT OUTER JOIN MemberLabels AS ml ON m.labelID = ml.id, 
    ResourceRevisions AS ar, Resources AS a WHERE mar.objectType = 'resourceRevision' AND mar.resourceRevisionID = ar.id AND ar.resourceID = a.id;

DROP VIEW IF EXISTS `ArtifactDomainAndStandards`;
CREATE VIEW `ArtifactDomainAndStandards` AS 
    SELECT a.artifactID, b.id as browseTermID, b.encodedID, b.name as termName, s.id as standardID, s.section, s.title, s.description, sb.id as boardID, sb.name as boardName, sb.countryID, sub.id as subjectID, sub.name as subjectName 
    FROM ArtifactHasBrowseTerms as a, BrowseTerms as b, DomainHasStandards as d, Standards as s, StandardBoards as sb, Subjects as sub 
    WHERE d.domainID = b.id and d.standardID = s.id and d.domainID = a.browseTermID and s.standardBoardID = sb.id and s.subjectID = sub.id order by artifactID, standardID;

DROP VIEW IF EXISTS `ArtifactDomainsStandardsGradesAndBrowseTerms`;
CREATE VIEW `ArtifactDomainsStandardsGradesAndBrowseTerms` AS
    SELECT ab.artifactID, s.id as standardID, s.section, s.title, sb.id as boardID, sb.name as boardName, sb.longname as boardLongName, sb.sequence, sb.countryID, b.id as termID, b.termTypeID, b.name as termName, b.parentID, b.encodedID, substring_index(b.encodedID, '.', 2) as subject, g.id as gradeID, g.name as gradeName 
    FROM DomainHasStandards as d, Standards as s, StandardBoards as sb, ArtifactHasBrowseTerms as ab, BrowseTerms as b, StandardHasGrades as sg, Grades as g 
    WHERE d.domainID = b.id and d.standardID = s.id and s.standardBoardID = sb.id and ab.browseTermID = b.id and s.id = sg.standardID and sg.gradeID = g.id 
    ORDER BY artifactID, standardID;

DROP VIEW IF EXISTS `From1xBookMemberInfo`;
CREATE VIEW `From1xBookMemberInfo` AS
    SELECT f.*, m.email from From1xBookMembers f, Members m where f.memberID=m.id;

DROP VIEW IF EXISTS `RelatedArtifactsAndLevels`;
CREATE VIEW `RelatedArtifactsAndLevels` AS
    SELECT `a`.`id` AS `id`, `a`.`artifactTypeID` AS `artifactTypeID`, `a`.`encodedID` AS `encodedID`, `a`.`name` AS `name`, `a`.`description` AS `description`, `a`.`handle` AS `handle`, `a`.`creatorID` AS `creatorID`, `a`.`ancestorID` AS `ancestorID`, `a`.`licenseID` AS `licenseID`, `a`.`creationTime` AS `creationTime`, `a`.`updateTime` AS `updateTime`, `ar`.`id` AS `artifactRevisionID`, `ar`.`publishTime` AS `publishTime`, `lvl`.`id` AS `levelID`, `lvl`.`name` AS `level`, `ra`.`domainID` AS `domainID`, `ra`.`conceptcollectionHandle` AS `conceptCollectionHandle`,  `ra`.`collectionCreatorID` AS `collectionCreatorID`, `ra`.`sequence` AS `sequence`, `d`.`name` AS `domainTerm`, `d`.`handle` AS `domainHandle`, `d`.`encodedID` AS `domainEID`, `d`.`parentID` AS `parentID`
    FROM (((((`Artifacts` `a` left join `ArtifactsAndBrowseTerms` `lvl` on(((`a`.`id` = `lvl`.`id`) and (`lvl`.`termTypeID` = 7)))) join `ArtifactRevisions` `ar`) join `RelatedArtifacts` `ra`) join `BrowseTerms` `d`) join `ArtifactTypes` `at`)
    WHERE ((`ra`.`artifactID` = `a`.`id`) and (`ra`.`domainID` = `d`.`id`) and (`d`.`termTypeID` in (4,10)) and (`ar`.`artifactID` = `a`.`id`) and (`ar`.`id` = (select max(`ArtifactRevisions`.`id`) from `ArtifactRevisions` where (`ArtifactRevisions`.`artifactID` = `a`.`id`))) and (`a`.`artifactTypeID` = `at`.`id`) and (`at`.`modality` = 1));

DROP VIEW IF EXISTS `ArtifactFeedbackAndCount`;
CREATE VIEW ArtifactFeedbackAndCount AS
    select artifactID, type, score, count(*) as count from ArtifactFeedbacks  group by artifactID, score, type;

drop view if exists ArtifactsAndVocabularies;
create view ArtifactsAndVocabularies as select a.id, a.artifactTypeID, a.encodedID, v.id as vocabularyID, v.term, v.definition, av.sequence, l.code as languageCode, l.name as languageName from Artifacts a, Vocabularies v, ArtifactHasVocabularies av, Languages l where a.id = av.artifactID and v.id = av.vocabularyID and l.id = v.languageID;

DROP VIEW IF EXISTS `RwaVotes`;
CREATE VIEW `RwaVotes` AS ( select a.id, a.updatetime, a.creatorID, 0 as votes from Artifacts as a, ArtifactHasBrowseTerms as ab, BrowseTerms as b where a.artifactTypeID = 13 and a.id = ab.artifactID and ab.browseTermID = b.id and b.termTypeID = 11 and b.handle = 'GetReal-Competition-Fall-2013' and a.id not in ( select distinct artifactID from ArtifactFeedbacks where type = 'relevance' or type = 'creativity' or type = 'clarity' or type = 'impactful' ) ) union ( select a.id, a.updatetime, a.creatorID, count(*) as votes from Artifacts as a join ArtifactHasBrowseTerms as ab on a.id = ab.artifactID join BrowseTerms as b on ab.browseTermID = b.id and b.termTypeID = 11 and b.handle = 'GetReal-Competition-Fall-2013' left outer join ArtifactFeedbacks as af on a.id = af.artifactID where a.artifactTypeID = 13 and af.type = 'relevance' or type = 'creativity' or type = 'clarity' or type = 'impactful' group by af.artifactID ) order by votes;
