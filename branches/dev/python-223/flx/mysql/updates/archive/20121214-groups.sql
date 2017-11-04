ALTER TABLE `Groups` CHANGE `accessCode` `accessCode` varchar(5) UNIQUE NULL DEFAULT NULL COMMENT 'The access code to join the Group';
