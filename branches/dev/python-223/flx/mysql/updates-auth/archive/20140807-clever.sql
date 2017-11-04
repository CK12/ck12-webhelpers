INSERT INTO `MemberAuthTypes` (`id`, `name`, `description`) VALUES
    (11, 'canvas', 'Canvas Authentication.'),
    (12, 'canvas-ck12', 'Canvas CK-12 Authentication.'),
    (13, 'canvas-ccsd', 'Canvas CCSD Authentication.'),
    (14, 'schoology', 'Schoology Authentication.'),
    (15, 'clever', 'Clever Authentication.');

--
-- Member, school, district associations.
--

DROP TABLE IF EXISTS `PartnerSchools`;
DROP TABLE IF EXISTS `PartnerSchoolDistricts`;
DROP TABLE IF EXISTS `PartnerSchoolHasMembers`;
DROP TABLE IF EXISTS `DistrictHasSchools`;
DROP TABLE IF EXISTS `SchoolDistricts`;

CREATE TABLE `SchoolDistricts` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated school district id.',
    `name` varchar(255) NOT NULL COMMENT 'The district name.',
    PRIMARY KEY (`id`),
    UNIQUE INDEX (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `DistrictHasSchools` (
    `districtID` int(11) NOT NULL COMMENT 'The school district id.',
    `schoolID` int(11) NOT NULL COMMENT 'The school id.',
    PRIMARY KEY (`districtID`, `schoolID`),
    CONSTRAINT `DistrictHasSchools_ibfk_1` FOREIGN KEY (`districtID`) REFERENCES `SchoolDistricts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `DistrictHasSchools_ibfk_2` FOREIGN KEY (`schoolID`) REFERENCES `USSchoolsMaster` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `PartnerSchoolHasMembers` (
    `memberID` int(11) NOT NULL COMMENT 'The member id.',
    `roleID` int(11) NOT NULL COMMENT 'The role id of this member.',
    `siteID` smallint(6) NOT NULL COMMENT 'The auth type id.',
    `partnerSysID` varchar(63) NULL COMMENT 'The systemwide id used by partners.',
    `partnerMemberID` varchar(63) NOT NULL COMMENT 'The member id used by partners.',
    `partnerSchoolID` varchar(63) NOT NULL COMMENT 'The school id used by partners.',
    PRIMARY KEY (`memberID`, `roleID`, `siteID`, `partnerSchoolID`),
    CONSTRAINT `PartnerSchoolHasMembers_memberID_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `PartnerSchoolHasMembers_roleID_ibfk_2` FOREIGN KEY (`roleID`) REFERENCES `MemberRoles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `PartnerSchoolHasMembers_siteID_ibfk_3` FOREIGN KEY (`siteID`) REFERENCES `MemberAuthTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `PartnerSchoolDistricts` (
    `siteID` smallint(6) NOT NULL COMMENT 'The auth type id.',
    `partnerDistrictID` varchar(63) NOT NULL COMMENT 'The district id used by partners.',
    `tokenID` varchar(63) NULL COMMENT 'The district OAuth Token.',
    `districtID` int(11) NULL COMMENT 'The district id.',
    PRIMARY KEY (`siteID`, `partnerDistrictID`),
    CONSTRAINT `PartnerSchoolDistricts_siteID_ibfk_1` FOREIGN KEY (`siteID`) REFERENCES `MemberAuthTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `PartnerSchoolDistricts_ibfk_2` FOREIGN KEY (`districtID`) REFERENCES `SchoolDistricts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `PartnerSchools` (
    `siteID` smallint(6) NOT NULL COMMENT 'The auth type id.',
    `partnerSchoolID` varchar(63) NOT NULL COMMENT 'The school id used by partners.',
    `partnerDistrictID` varchar(63) NOT NULL COMMENT 'The district id used by partners.',
    `schoolID` int(11) NULL COMMENT 'The school id.',
    PRIMARY KEY (`siteID`, `partnerSchoolID`),
    CONSTRAINT `PartnerSchools_siteID_ibfk_1` FOREIGN KEY (`siteID`) REFERENCES `MemberAuthTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `PartnerSchools_ibfk_2` FOREIGN KEY (`schoolID`) REFERENCES `USSchoolsMaster` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
