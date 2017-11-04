ALTER TABLE `ArtifactRevisions` ADD COLUMN `messageToUsers` varchar(1024) DEFAULT NULL AFTER `comment`;
UPDATE `ArtifactRevisions` as ar, `Artifacts` as a INNER JOIN ( select max(r.id) as id, r.artifactID from `ArtifactRevisions` as r group by artifactID ) as m set ar.`messageToUsers` = a.`messageToUsers` where a.`messageToUsers` is not NULL and a.`messageToUsers` != '' and a.`messageToUsers` != 'None' and a.`id` = ar.`artifactID` and ar.`id` = m.`id`;
ALTER TABLE `Artifacts` DROP COLUMN `messageToUsers`;
