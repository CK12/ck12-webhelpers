USE flx2;

ALTER TABLE `RelatedArtifacts`
CHANGE `courseHandle` `collectionHandle` VARCHAR(50) NOT NULL DEFAULT '';

call update_dbpatch('20170311-rename-courseHandle-to-collectionHandle-RelatedArtifacts.sql');
