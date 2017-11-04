USE flx2;

ALTER TABLE `StudyTrackItemContexts`
    DROP PRIMARY KEY,
    ADD COLUMN `conceptCollectionHandle` VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN `collectionCreatorID` int(11) NOT NULL DEFAULT 0 COMMENT 'The cK-12 member id.',
    MODIFY `contextUrl` VARCHAR(1024) NOT NULL DEFAULT '',
    ADD PRIMARY KEY (`studyTrackID`, `studyTrackItemID`, `conceptCollectionHandle`, `collectionCreatorID`);

call update_dbpatch('20170405-add-conceptCollectionHandle-and-collectionCreatorID-StudyTrackItemContexts.sql');
