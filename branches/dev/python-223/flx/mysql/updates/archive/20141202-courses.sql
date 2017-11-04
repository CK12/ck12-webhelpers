--
-- Table structure for table `Courses`
--
DROP TABLE IF EXISTS `Courses`;

CREATE TABLE `Courses` (
  `handle` varchar(50) NOT NULL COMMENT 'The course handle for url.',
  `shortname` varchar(10) NOT NULL COMMENT 'Uniquely identifies a Course',
  `title` varchar(50) NOT NULL COMMENT 'The course title',
  `description` varchar(1023) DEFAULT NULL COMMENT 'The description for the course' ,
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
  `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time.',
  PRIMARY KEY (`shortname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Course Information'; 
