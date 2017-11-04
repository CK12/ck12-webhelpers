USE flx2;

ALTER TABLE `RelatedArtifacts`
    DROP PRIMARY KEY,
    CHANGE `collectionHandle` `conceptCollectionHandle` VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN `collectionCreatorID` int(11) NOT NULL DEFAULT 0 COMMENT 'The cK-12 member id.',
    ADD PRIMARY KEY (`domainID`, `sequence`, `artifactID`, `conceptCollectionHandle`, `collectionCreatorID`),
    ADD INDEX `RelatedArtifacts_collectionCreatorID` (`collectionCreatorID`),
    ADD INDEX `RelatedArtifacts_conceptCollectionHandle` (`conceptCollectionHandle`),
    ADD INDEX `RelatedArtifacts_collectionCreatorID_conceptCollectionHandle` (`collectionCreatorID`, `conceptCollectionHandle`),
    ADD INDEX `RelatedArtifacts_conceptCollectionHandle_collectionCreatorID` (`conceptCollectionHandle`, `collectionCreatorID`);


call update_dbpatch('20170311-rename-collectionHandle-to-conceptCollectionHandle-and-add-collectionCreatorID-RelatedArtifacts.sql');
