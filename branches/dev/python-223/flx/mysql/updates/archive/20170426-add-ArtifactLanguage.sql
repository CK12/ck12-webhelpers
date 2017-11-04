USE flx2;

ALTER TABLE `Artifacts` 
    ADD COLUMN `languageID` smallint(6) NOT NULL DEFAULT 1 COMMENT 'The language for this artifact' AFTER `licenseID`,
    ADD CONSTRAINT `Artifacts_ibfk_5` FOREIGN KEY (`languageID`) REFERENCES `Languages` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

BEGIN;

UPDATE IGNORE `Artifacts` a, `ArtifactRevisions` ar, `ArtifactRevisionHasResources` arrr, `ResourceRevisions` rr, `Resources` r 
    SET a.languageID = r.languageID 
    WHERE a.id = ar.artifactID and ar.id = arrr.artifactRevisionID and arrr.resourceRevisionID = rr.id and rr.resourceID = r.id and r.languageID != 1 and a.languageID = 1;

COMMIT;

call update_dbpatch('20170426-add-ArtifactLanguage');
