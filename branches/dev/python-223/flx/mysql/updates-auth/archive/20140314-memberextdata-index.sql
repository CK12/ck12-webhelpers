ALTER TABLE `MemberExtData` ADD COLUMN `externalID` varchar(255) DEFAULT NULL AFTER `token`;
ALTER TABLE `MemberExtData` ADD UNIQUE INDEX `MemberExtData_authType_external`(`authTypeID`, `externalID`);
