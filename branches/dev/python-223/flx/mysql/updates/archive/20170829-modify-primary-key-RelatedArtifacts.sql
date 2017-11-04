USE flx2;

ALTER TABLE `RelatedArtifacts`
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (`domainID`, `artifactID`, `conceptCollectionHandle`, `collectionCreatorID`);

call update_dbpatch('20170829-modify-primary-key-RelatedArtifacts.sql');