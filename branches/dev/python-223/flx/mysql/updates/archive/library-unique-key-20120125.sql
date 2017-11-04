alter table `MemberLibraryObjects` drop index `objectID_2`;
delete from `MemberLibraryObjects`;
alter table `MemberLibraryObjects` add constraint UNIQUE (`objectType`, `parentID`, `memberID`);
