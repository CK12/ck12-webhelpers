ALTER TABLE `BrowseTerms` ADD `handle` varchar(255) DEFAULT NULL COMMENT 'The term handle.';
ALTER TABLE `BrowseTerms` ADD UNIQUE KEY `handle` (`handle`, `termTypeID`);
