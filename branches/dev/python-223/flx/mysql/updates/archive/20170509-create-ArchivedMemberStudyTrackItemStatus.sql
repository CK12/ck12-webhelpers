USE flx2;

BEGIN;

/*
 * Statements in this section runs in a transaction.
 * Put data changes here
 */


COMMIT;

/*
 * Statements below will run in AUTOCOMMIT mode. 
 * Put structural changes in this section, e.g. any ALTER TABLE, CREATE TABLE, CREATE INDEX.
 */

CREATE TABLE IF NOT EXISTS `ArchivedMemberStudyTrackItemStatus` (
  `artifactTypeID` smallint(6) NOT NULL COMMENT 'The artifact type id.',
  `assignmentName` varchar(255) NOT NULL COMMENT 'The name or title of the artifact.',
  `assignmentDescription` varchar(4095) DEFAULT NULL COMMENT 'The description of this artifact.',
  `assignmentCreatorID` int(11) NOT NULL COMMENT 'The creator of this artifact.',
  `assignmentID` int(11) NOT NULL COMMENT 'The artifact id of this assignment.',
  `groupID` int(11) DEFAULT NULL COMMENT 'The id of the group getting this assignment.',
  `assignmentType` enum('assignment','self-assignment','self-study') NOT NULL DEFAULT 'assignment' COMMENT 'The type of this study track. The self-study type is created automatically when the student just randomly practicing without an assignment.',
  `origin` enum('ck-12','lms') NOT NULL DEFAULT 'ck-12' COMMENT 'The origin of this assignment.',
  `due` timestamp NULL DEFAULT NULL COMMENT 'The study track due time.',
  `memberID` int(11) NOT NULL COMMENT 'The member id.',
  `studyTrackItemID` int(11) NOT NULL COMMENT 'The id of the study track item for member identified by memberID.',
  `status` enum('completed','skipped','incomplete') DEFAULT 'incomplete' COMMENT 'The status of this item.',
  `score` smallint(6) DEFAULT NULL COMMENT 'The score in the form of percentage x 100, e.g., 6180 is 61.8%. For items with no practice, this field will be NULL.',
  `lastAccess` timestamp NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The most recent access time. The value NULL means not yet access.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
  `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time.',
  PRIMARY KEY (`memberID`,`assignmentID`,`studyTrackItemID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*
 * Update the following with the right file name of the patch
 */
call update_dbpatch('20170509-create-ArchivedMemberStudyTrackItemStatus');
