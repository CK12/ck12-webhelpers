DROP TABLE IF EXISTS `Tasks`;
DROP TABLE IF EXISTS `ResourceRevisions`;
DROP TABLE IF EXISTS `Resources`;
DROP TABLE IF EXISTS `ResourceTypes`;
DROP TABLE IF EXISTS `Members`;
DROP TABLE IF EXISTS `Languages`;

--
--  Table structure for table `Languages`.
--

CREATE TABLE `Languages` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated identifier.',
  `code` char(2) NOT NULL COMMENT 'The ISO 639-1 language code.',
  `name` varchar(63) NOT NULL COMMENT 'The name of this resource type.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB CHARSET=utf8 COMMENT='The different languages.';

--
--  Table structure for table `Members`.
--

CREATE TABLE `Members` (
  `id` int(11) NOT NULL COMMENT 'The member id from auth.',
  `stateID` smallint(6) NOT NULL COMMENT 'The state of this member.',
  `login` varchar(512) DEFAULT NULL,
  `email` varchar(512) DEFAULT NULL,
  `givenName` varchar(256) DEFAULT NULL,
  `surname` varchar(256) DEFAULT NULL,
  `defaultLogin` varchar(255) NOT NULL DEFAULT '' COMMENT 'The auto-generated login name.',
  `timezone` varchar(52) DEFAULT 'US/Pacific',
  PRIMARY KEY (`id`),
  UNIQUE KEY `defaultLogin` (`defaultLogin`),
  UNIQUE KEY `login` (`login`(255)),
  UNIQUE KEY `email` (`email`(255))
) ENGINE=InnoDB CHARSET=utf8 COMMENT='The metadata of members';

--
--  Table structure for table `ResourceTypes`.
--

CREATE TABLE `ResourceTypes` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated identifier.',
  `name` varchar(63) NOT NULL COMMENT 'The name of this resource type.',
  `description` varchar(4095) DEFAULT NULL COMMENT 'The description of this resource type.',
  `versionable` tinyint(1) DEFAULT '0' COMMENT 'Is this resource type versionable?',
  `streamable` tinyint(1) DEFAULT '0' COMMENT 'Is this resource type streamable?',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB CHARSET=utf8 COMMENT='The types of resources.';

--
--  Table structure for table `Resources`.
--

CREATE TABLE `Resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated identifier.',
  `resourceTypeID` int(11) NOT NULL COMMENT 'The type of this resource.',
  `name` varchar(255) NOT NULL COMMENT 'The name or title of this resource.',
  `handle` varchar(255) NOT NULL COMMENT 'The handle of the resource. Used for perma URL',
  `description` varchar(4095) DEFAULT NULL COMMENT 'The description of this resource.',
  `authors` varchar(1024) DEFAULT NULL COMMENT 'The original author for Image and Embedded Objects resource.',
  `license` varchar(1024) DEFAULT NULL COMMENT 'License for Image and Embedded Objects resource',
  `uri` varchar(255) NOT NULL COMMENT 'The location of this resource.',
  `refHash` varchar(64) NOT NULL COMMENT 'The unique reference hash for this resource. Referred in Image Repository ids.',
  `ownerID` int(11) NOT NULL COMMENT 'The owner of this revision.',
  `languageID` smallint(6) DEFAULT NULL COMMENT 'The language of this resource.',
  `isExternal` tinyint(1) DEFAULT '0' COMMENT '1 if it is external resource; 0 otherwise.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of this resource.',
  `isAttachment` tinyint(1) DEFAULT '0' COMMENT '1 if it is attachment resource; 0 otherwise.',
  `checksum` varchar(255) DEFAULT NULL COMMENT 'The checksum for this resource.',
  `satelliteUrl` varchar(1024) DEFAULT NULL COMMENT 'The satellite location of this resource.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Idx_uri` (`uri`,`ownerID`),
  UNIQUE KEY `Idx_refHash` (`refHash`),
  UNIQUE KEY `handle` (`handle`,`ownerID`,`resourceTypeID`),
  KEY `Resources_ibfk_3` (`ownerID`),
  KEY `Resources_ibfk_2` (`languageID`),
  KEY `Resources_ibfk_1` (`resourceTypeID`),
  KEY `Resources_checksum` (`checksum`),
  KEY `Resources_checksum_ownerID` (`checksum`,`ownerID`),
  KEY `Idx_Resources_satelliteUrl` (`satelliteUrl`(255)),
  CONSTRAINT `Resources_ibfk_1` FOREIGN KEY (`resourceTypeID`) REFERENCES `ResourceTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Resources_ibfk_2` FOREIGN KEY (`languageID`) REFERENCES `Languages` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Resources_ibfk_3` FOREIGN KEY (`ownerID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB CHARSET=utf8 COMMENT='The metadata of resources.';

--
--  Table structure for table `ResourceRevisions`.
--

CREATE TABLE `ResourceRevisions` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated identifier.',
  `resourceID` int(11) NOT NULL COMMENT 'The resource identifier.',
  `revision` varchar(255) NOT NULL COMMENT 'The revision number.',
  `hash` varchar(256) DEFAULT NULL COMMENT 'The md5 hash.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
  `filesize` int(11) DEFAULT '0' COMMENT 'The size of the resource file.',
  `publishTime` timestamp NULL DEFAULT NULL COMMENT 'The publish time of this resource revision.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `resourceID` (`resourceID`,`revision`),
  KEY `ResourceRevisions_publishTime` (`publishTime`),
  CONSTRAINT `ResourceRevisions_ibfk_1` FOREIGN KEY (`resourceID`) REFERENCES `Resources` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB CHARSET=utf8 COMMENT='The revisions of a resource.';

--
--  Table structure for table `Tasks`.
--

CREATE TABLE `Tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The task id',
  `name` varchar(255) NOT NULL COMMENT 'The name of the task',
  `taskID` varchar(255) NOT NULL COMMENT 'RabbitMQ task id',
  `status` varchar(255) NOT NULL COMMENT 'Task status',
  `ownerID` int(11) DEFAULT NULL COMMENT 'The owner of this task',
  `message` text,
  `userdata` mediumtext,
  `artifactKey` varchar(255) DEFAULT NULL COMMENT 'To add other artifact related data',
  `started` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The time of enqueuing the task.',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The task end time.',
  `hostname` varchar(100) DEFAULT NULL COMMENT 'Host name where the task is running',
  PRIMARY KEY (`id`),
  UNIQUE KEY `taskID` (`taskID`),
  KEY `Tasks_idx_name_ownderID_artifactKey` (`name`,`ownerID`,`artifactKey`),
  KEY `Tasks_ibfk_1` (`ownerID`),
  KEY `Idx_Tasks_2` (`updated`),
  KEY `Idx_Tasks_3` (`name`,`status`),
  KEY `Idx_Tasks_4` (`name`),
  CONSTRAINT `Tasks_ibfk_1` FOREIGN KEY (`ownerID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Tasks.';
