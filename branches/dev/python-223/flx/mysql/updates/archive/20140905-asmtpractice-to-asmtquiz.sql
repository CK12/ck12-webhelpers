BEGIN;

    update Artifacts set artifactTypeID = (select id from ArtifactTypes where name = 'asmtquiz') where artifactTypeID=(select id from ArtifactTypes where name = 'asmtpractice') and creatorID != 3;

COMMIT;
