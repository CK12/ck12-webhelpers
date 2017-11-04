BEGIN;
CREATE TABLE RelatedArtifactsBackup LIKE RelatedArtifacts;
INSERT INTO RelatedArtifactsBackup SELECT * FROM RelatedArtifacts;
create temporary table NonModalityArtifactIDsTemp as (select ra.artifactID from RelatedArtifacts ra, Artifacts a, ArtifactTypes at where ra.artifactID = a.id and a.artifactTypeID = at.id and at.modality = 0);
delete from RelatedArtifacts where artifactID in (select artifactID from NonModalityArtifactIDsTemp);
COMMIT;
