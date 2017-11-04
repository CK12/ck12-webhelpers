INSERT IGNORE INTO Subjects (`name`) VALUES ('health-and-wellness');
INSERT IGNORE INTO BrowseTerms (`name`, `termTypeID`, `handle`, `description`) SELECT 'health-and-wellness', id, 'health-and-wellness', 'Health and Wellness related content' FROM `BrowseTermTypes` WHERE `name` = 'subject';
