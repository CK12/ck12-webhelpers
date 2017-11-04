DROP VIEW IF EXISTS PublishedArtifacts;
CREATE VIEW PublishedArtifacts as 
    SELECT a.*, ar.id as artifactRevisionID, ar.revision, ar.publishTime
    FROM Artifacts a, ArtifactRevisions ar
    WHERE a.id = ar.artifactID AND ar.publishTime IS NOT NULL AND ar.id = ( SELECT MAX(id) FROM ArtifactRevisions WHERE artifactID = a.id);

