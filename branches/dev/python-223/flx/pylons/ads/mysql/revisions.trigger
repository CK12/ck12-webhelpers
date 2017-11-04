DROP TRIGGER IF EXISTS flx2.T_revisions;

DELIMITER | 
CREATE TRIGGER flx2.T_revisions AFTER INSERT ON flx2.ArtifactRevisions
FOR EACH ROW BEGIN
    INSERT INTO ads.D_revisions (revisionID, revision) select id, revision from flx2.ArtifactRevisions where id=NEW.id;   
END
|

DELIMITER ;

