alter table Branches drop index shortname;
alter table Branches add constraint UNIQUE(`shortname`, `subjectID`);
