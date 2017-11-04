ALTER TABLE `ArtifactHandles` ADD COLUMN `creatorID` int(11);
ALTER TABLE `ArtifactHandles` ADD COLUMN `artifactTypeID` smallint(6);
UPDATE `ArtifactHandles` ah LEFT JOIN `Artifacts` a  on ah.artifactID = a.id SET ah.creatorID = a.creatorID, ah.artifactTypeID = a.artifactTypeID;
ALTER TABLE `ArtifactHandles` DROP PRIMARY KEY, ADD PRIMARY KEY (`artifactID`, `handle`, `artifactTypeID`, `creatorID`);
ALTER TABLE `ArtifactHandles` ADD CONSTRAINT `ArtifactHandles_ibfk_2` FOREIGN KEY (`creatorID`) REFERENCES `Members`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `ArtifactHandles` ADD CONSTRAINT `ArtifactHandles_ibfk_3` FOREIGN KEY (`artifactTypeID`) REFERENCES `ArtifactTypes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `ArtifactHandles` MODIFY `creatorID` int(11) NOT NULL;
ALTER TABLE `ArtifactHandles` MODIFY `artifactTypeID` smallint(6) NOT NULL;

