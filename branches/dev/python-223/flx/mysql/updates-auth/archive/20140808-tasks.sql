DROP TABLE IF EXISTS `Tasks`;
CREATE TABLE `Tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The category id',
  `name` varchar(255) NOT NULL COMMENT 'The name of the task',
  `taskID` varchar(255) NOT NULL COMMENT 'RabbitMQ task id',
  `status` varchar(255) NOT NULL COMMENT 'Task status',
  `ownerID` int(11) DEFAULT NULL COMMENT 'The owner of this task',
  `message` text,
  `userdata` mediumtext,
  `hostname` varchar(100) DEFAULT NULL COMMENT 'Host name where the task is running',
  `started` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The time of enqueuing the task.',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The task end time.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `taskID` (`taskID`),
  KEY `Tasks_ibfk_1` (`ownerID`),
  CONSTRAINT `Tasks_ibfk_1` FOREIGN KEY (`ownerID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;