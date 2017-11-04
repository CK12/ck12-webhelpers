ALTER TABLE `Members` ADD COLUMN `stateID` SMALLINT(6) NOT NULL COMMENT 'The state of this member.' AFTER `id`;
UPDATE `Members` fm INNER JOIN auth.`Members` am ON fm.id = am.id SET fm.stateID = am.stateID;
