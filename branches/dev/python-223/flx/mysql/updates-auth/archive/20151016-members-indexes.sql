ALTER TABLE `Members` ADD UNIQUE `login` (`login`(255));                                                                                                                                                       
ALTER TABLE `Members` ADD UNIQUE `email` (`email`(255));
ALTER TABLE `Members` ADD INDEX  `Members_givenName` (`givenName`(255));
ALTER TABLE `Members` ADD INDEX  `Members_surname` (`surname`(255));
