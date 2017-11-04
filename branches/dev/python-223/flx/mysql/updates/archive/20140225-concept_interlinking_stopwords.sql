CREATE TABLE `StopWords` (
	  `word` varchar(255) NOT NULL COMMENT 'The group id.',
	  PRIMARY KEY (`word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO StopWords values('and');
