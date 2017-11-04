USE flx2;

BEGIN;

UPDATE MemberLibraryObjects MLO, Artifacts A SET MLO.objectID = (select max(AR1.id) FROM ArtifactRevisions AR1 WHERE AR1.artifactID = MLO.parentID), MLO.created = NOW() WHERE MLO.parentID = A.id AND MLO.memberID = A.creatorID and MLO.objectType = 'artifactRevision' AND MLO.objectID != (select max(AR.id) FROM ArtifactRevisions AR WHERE AR.artifactID = MLO.parentID);

COMMIT;

call update_dbpatch('20170905-fix-old-artifactRevisions-in-MemberLibraryObjects.sql');

