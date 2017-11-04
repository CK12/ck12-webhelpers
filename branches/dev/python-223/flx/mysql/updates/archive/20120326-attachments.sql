ALTER TABLE `Resources` ADD `isAttachment` tinyint(1) DEFAULT 0 COMMENT '1 if it is attachment resource; 0 otherwise.';

ALTER TABLE `ResourceRevisions` ADD `filesize` int(11) NULL DEFAULT 0 COMMENT 'The size of the resource file.';
ALTER TABLE `ResourceRevisions` ADD `publishTime` timestamp NULL DEFAULT NULL COMMENT 'The publish time of this resource revision.';

UPDATE `Resources` SET `isAttachment` = 1 WHERE `resourceTypeID` in (10, 16, 17);
UPDATE `ResourceRevisions` SET `publishTime` = NOW() WHERE `resourceID` in (SELECT `id` FROM `Resources` WHERE `resourceTypeID` in (16, 17));
