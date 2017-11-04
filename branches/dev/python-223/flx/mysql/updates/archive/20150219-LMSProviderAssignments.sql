alter table LMSProviderAssignments modify column providerAssignmentID varchar(127) NOT NULL COMMENT 'The provider assignment ID.';
alter table LMSProviderAssignmentScores modify column providerAssignmentID varchar(127) NOT NULL COMMENT 'The provider assignment ID.';
