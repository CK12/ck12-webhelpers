ALTER TABLE `Events` MODIFY COLUMN `objectType` ENUM('artifact', 'artifactRevision', 'resource', 'resourceRevision', 'notification', 'member');
ALTER TABLE `GroupActivities` MODIFY COLUMN `objectType` ENUM('artifact', 'artifactRevision', 'resource', 'resourceRevision', 'notification', 'member');

ALTER TABLE `Members`
    DROP FOREIGN KEY `Members_ibfk_1`,
    DROP KEY `defaultLogin`;

ALTER TABLE `Members`
    DROP COLUMN `stateID`,
    DROP COLUMN `gender`,
    DROP COLUMN `defaultLogin`,
    DROP COLUMN `suffix`,
    DROP COLUMN `title`,
    DROP COLUMN `phone`,
    DROP COLUMN `fax`,
    DROP COLUMN `website`,
    DROP COLUMN `emailVerified`,
    DROP COLUMN `creationTime`,
    DROP COLUMN `updateTime`,
    DROP COLUMN `loginTime`,
    ADD COLUMN `authID` int(11) NOT NULL COMMENT 'The member id at the authentication server.';

UPDATE `Members` set `authID` = `id`;

DROP TABLE IF EXISTS `MemberExtData`;
DROP TABLE IF EXISTS `MemberStates`;
DROP TABLE IF EXISTS `Addresses`;
DROP TABLE IF EXISTS `MemberLocations`;
DROP TABLE IF EXISTS `WorldAddresses`;
DROP TABLE IF EXISTS `USAddresses`;
DROP TABLE IF EXISTS `USZipCodes`;

INSERT INTO `MemberRoles` (`id`, `groupID`, `name`, `description`) VALUES
    (16, 1, 'mentor', 'Student Mentor'),
    (17, 1, 'representative', 'School Representative');
