
alter table `Members` add `emailVerified` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'If the email address has been verified';
update `Members` set `emailVerified` = 1;
