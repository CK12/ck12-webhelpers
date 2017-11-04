DROP VIEW IF EXISTS `RelatedArtifactsAndLevels`;
CREATE VIEW `RelatedArtifactsAndLevels` AS
    SELECT a.*, ar.id as artifactRevisionID, ar.publishTime, lvl.id as levelID, lvl.name as `level`, ra.domainID, ra.sequence, d.name as domainTerm, d.handle as domainHandle, d.encodedID as domainEID, d.parentID, 0 as likeCount
    FROM Artifacts AS a LEFT OUTER JOIN ArtifactsAndBrowseTerms AS lvl ON a.id = lvl.id AND lvl.termTypeID = 7, 
    ArtifactRevisions as ar, RelatedArtifacts as ra, BrowseTerms as d, ArtifactTypes as at
			WHERE ra.artifactID = a.id AND ra.domainID = d.id AND d.termTypeID in (4, 10) AND ar.artifactID = a.id AND ar.id = (SELECT MAX(id) FROM ArtifactRevisions WHERE artifactID = a.id) AND a.artifactTypeID = at.id and at.modality = 1 ;
