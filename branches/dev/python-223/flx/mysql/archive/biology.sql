INSERT INTO `Members` (`id`, `defaultLogin`, `login`, `email`, `givenName`, `surname`) VALUES(31, 'Douglas', 'Douglas', 'douglas@nowhere.com', 'Douglas', 'Wilkin');
INSERT INTO `GroupHasMembers` (`groupID`, `memberID`, `roleID`, `statusID`) VALUES
(1, 31, 3, 2);
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`) values (21,1,'CK-12 Biology I','CK-12 Biology I is a textbook for high school students covering cell biology, genetics, evolution, ecology, and physiology.','CK-12-Biology-I',31, NULL, '2010-06-10T01:06:06');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (21, 21, 1, 0, '2010-06-10T01:06:06', '2010-01-01T12:12:27Z');
INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (101,2,'book_cover_image','Cover page image for the book','CK12_Biology.png','CK12_Biology.png', MD5(CONCAT('CK12_Biology.png', 'cover page', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (101,101,1,'2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (21, 101);

INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (102,2,'chapter_cover_image','Cover page image for the chapter','chapter_cover.png','chapter_cover.png', MD5(CONCAT('chapter_cover.png', 'cover page', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (102,102,1,'2010-01-01T12:12:27Z');
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (103,1,'Foundations of Life Science','This chapter provides an introduction to scientific investigations, methods, observations, and communication.','103.xhtml','103.xhtml', MD5(CONCAT('103.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (103,103,1,'2010-06-19T01:25:23');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (22,2,'Foundations of Life Science-::of::-CK-12 Biology I','This chapter provides an introduction to scientific investigations, methods, observations, and communication.','Foundations-of-Life-Science-::of::-CK-12-Biology-I',31,NULL, '2010-06-19T01:25:23');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (22, 22, 1, 0, '2010-06-19T01:25:23', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (22, 103);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 22, 1);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='Biology' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.LS.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.30.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.PS.10.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.30.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.LS.170';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.LS.130.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.30.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.30.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.10.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.LS.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.20.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where encodedID = 'CKT.S.BIO.20.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 22,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (22, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 1 ,'Foundations of Life Science','This chapter provides an introduction to scientific investigations, methods, observations, and communication.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 22, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (104,1,'Chemical Basis of Life','This chapter covers matter, the significance of carbon, lipids, proteins, nucleic acids, amino acids, biochemical, and chemical properties and reactions.','104.xhtml','104.xhtml', MD5(CONCAT('104.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (104,104,1,'2010-06-10T01:06:12');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (23,2,'Chemical Basis of Life-::of::-CK-12 Biology I','This chapter covers matter, the significance of carbon, lipids, proteins, nucleic acids, amino acids, biochemical, and chemical properties and reactions.','Chemical-Basis-of-Life-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:12');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (23, 23, 1, 0, '2010-06-10T01:06:12', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (23, 104);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 23, 2);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.ES.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.BIO.40.20.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.BIO.40.20.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.BIO.40.20.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.BIO.40.20.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.BIO.40.20.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.LS.20.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.PS.90.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.BIO.40.30.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.PS.140';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.BIO.40.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where encodedID = 'CKT.S.BIO.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 23,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (23, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 2 ,'Chemical Basis of Life','This chapter covers matter, the significance of carbon, lipids, proteins, nucleic acids, amino acids, biochemical, and chemical properties and reactions.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 23, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (105,1,'Cell Structure and Function','This chapter introduces cell structure and function, features of prokaryotic, eukaryotic, plant, and animal cells. General structures and functions of DNA, RNA, protein, cell transport, and homeostasis.','105.xhtml','105.xhtml', MD5(CONCAT('105.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (105,105,1,'2010-06-24T00:36:02');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (24,2,'Cell Structure and Function-::of::-CK-12 Biology I','This chapter introduces cell structure and function, features of prokaryotic, eukaryotic, plant, and animal cells. General structures and functions of DNA, RNA, protein, cell transport, and homeostasis.','Cell-Structure-and-Function-::of::-CK-12-Biology-I',31,NULL, '2010-06-24T00:36:02');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (24, 24, 1, 0, '2010-06-24T00:36:02', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (24, 105);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 24, 3);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='Biological Principles' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='Biology' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='Cell Structure and Function' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='Cell Theory' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='Characteristics of Living Things' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.10.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.20.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.10.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.10.50.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.10.50.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.10.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.20.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 24,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (24, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 3 ,'Cell Structure and Function','This chapter introduces cell structure and function, features of prokaryotic, eukaryotic, plant, and animal cells. General structures and functions of DNA, RNA, protein, cell transport, and homeostasis.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 24, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (106,1,'Photosynthesis','This chapter covers the water, carbon, and nitrogen cycle between abiotic resources and organic matter in the ecosystem, and how oxygen cycles through photosynthesis and respiration.','106.xhtml','106.xhtml', MD5(CONCAT('106.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (106,106,1,'2010-06-10T01:06:15');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (25,2,'Photosynthesis-::of::-CK-12 Biology I','This chapter covers the water, carbon, and nitrogen cycle between abiotic resources and organic matter in the ecosystem, and how oxygen cycles through photosynthesis and respiration.','Photosynthesis-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:15');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (25, 25, 1, 0, '2010-06-10T01:06:15', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (25, 106);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 25, 4);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where encodedID = 'CKT.S.LS.110';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where encodedID = 'CKT.S.BIO.80.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Ecology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Carbohydrates' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Organic Compounds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Chemical Reactions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Chemical Basis of Life' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.30.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.30.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.30.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Function of Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Plant-cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Organelles' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Eurkaryote Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Cell Structure and Function' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 25,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (25, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 4 ,'Photosynthesis','This chapter covers the water, carbon, and nitrogen cycle between abiotic resources and organic matter in the ecosystem, and how oxygen cycles through photosynthesis and respiration.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 25, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (107,1,'Cellular Respiration','This chapter introduces cellular respiration and its relationship to glycolysis, the Krebs Cycle, and the electron transport chain.','107.xhtml','107.xhtml', MD5(CONCAT('107.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (107,107,1,'2010-06-10T01:06:16');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (26,2,'Cellular Respiration-::of::-CK-12 Biology I','This chapter introduces cellular respiration and its relationship to glycolysis, the Krebs Cycle, and the electron transport chain.','Cellular-Respiration-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:16');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (26, 26, 1, 0, '2010-06-10T01:06:16', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (26, 107);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 26, 5);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Carbohydrates' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Organic Compounds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Chemical Reactions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Chemical Basis of Life' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Krebs Cycle' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Glycolysis' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Fermentation' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.40.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Cellular Respiration' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Function of Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Plant-cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Organelles' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Cell Structure and Function' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 26,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (26, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 5 ,'Cellular Respiration','This chapter introduces cellular respiration and its relationship to glycolysis, the Krebs Cycle, and the electron transport chain.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 26, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (108,1,'Cell Division and Reproduction','This chapter covers cell division, the process of producing new cells, and sexual and asexual reproduction.','108.xhtml','108.xhtml', MD5(CONCAT('108.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (108,108,1,'2010-06-24T01:46:36');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (27,2,'Cell Division and Reproduction-::of::-CK-12 Biology I','This chapter covers cell division, the process of producing new cells, and sexual and asexual reproduction.','Cell-Division-and-Reproduction-::of::-CK-12-Biology-I',31,NULL, '2010-06-24T01:46:36');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (27, 27, 1, 0, '2010-06-24T01:46:36', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (27, 108);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 27, 6);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.60.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='Biology' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.30.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.50.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='Chemical Basis of Life' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.50.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.60.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.60.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.50.50';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='Nucleic Acids' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='Organic Compounds' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.50.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.60';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where encodedID = 'CKT.S.BIO.50.60.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 27,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (27, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 6 ,'Cell Division and Reproduction','This chapter covers cell division, the process of producing new cells, and sexual and asexual reproduction.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 27, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (109,1,'Mendelian Genetics','This chapter covers Mendelian genetics, inheritance, probability, dominant, recessive, and sex-linked traits.','109.xhtml','109.xhtml', MD5(CONCAT('109.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (109,109,1,'2010-06-10T01:06:19');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (28,2,'Mendelian Genetics-::of::-CK-12 Biology I','This chapter covers Mendelian genetics, inheritance, probability, dominant, recessive, and sex-linked traits.','Mendelian-Genetics-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:19');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (28, 28, 1, 0, '2010-06-10T01:06:19', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (28, 109);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 28, 7);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.10.50.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.10.50.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.10.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where encodedID = 'CKT.S.BIO.60';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 28,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (28, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 7 ,'Mendelian Genetics','This chapter covers Mendelian genetics, inheritance, probability, dominant, recessive, and sex-linked traits.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 28, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (110,1,'Molecular Genetics','This chapter covers DNA, RNA, protein synthesis, mutation, and regulation of gene expression.','110.xhtml','110.xhtml', MD5(CONCAT('110.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (110,110,1,'2010-06-10T01:06:19');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (29,2,'Molecular Genetics-::of::-CK-12 Biology I','This chapter covers DNA, RNA, protein synthesis, mutation, and regulation of gene expression.','Molecular-Genetics-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:19');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (29, 29, 1, 0, '2010-06-10T01:06:19', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (29, 110);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 29, 8);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.40.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.40.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.40.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.20.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.20.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.20.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.30.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.30.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.30.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='Cancer' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.10.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.10.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.10.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.10.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='Chromosomes' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='Genetics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='Nucleic Acids' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='Organic Compounds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='Chemical Basis of Life' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='Function of Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='Cell Structure and Function' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 29,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (29, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 8 ,'Molecular Genetics','This chapter covers DNA, RNA, protein synthesis, mutation, and regulation of gene expression.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 29, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (111,1,'Human Genetics','This chapter covers the human genome and genetic diseases/disorders, including autosomal vs. sex-linked inheritance patterns.','111.xhtml','111.xhtml', MD5(CONCAT('111.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (111,111,1,'2010-06-10T01:06:20');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (30,2,'Human Genetics-::of::-CK-12 Biology I','This chapter covers the human genome and genetic diseases/disorders, including autosomal vs. sex-linked inheritance patterns.','Human-Genetics-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:20');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (30, 30, 1, 0, '2010-06-10T01:06:20', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (30, 111);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 30, 9);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.40.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.40.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.40.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.40.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.40.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.30.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.30.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.30.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.30.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.50.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.50.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.50.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.50.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='Genetics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='Nucleic Acids' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='Organic Compounds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='Chemical Basis of Life' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='Chromosomes' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='Cell Division' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 30,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (30, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 9 ,'Human Genetics','This chapter covers the human genome and genetic diseases/disorders, including autosomal vs. sex-linked inheritance patterns.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 30, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (112,1,'Biotechnology','This chapter covers DNA technology, The Human Genome Project, and gene cloning.','112.xhtml','112.xhtml', MD5(CONCAT('112.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (112,112,1,'2010-06-10T01:06:21');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (31,2,'Biotechnology-::of::-CK-12 Biology I','This chapter covers DNA technology, The Human Genome Project, and gene cloning.','Biotechnology-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:21');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (31, 31, 1, 0, '2010-06-10T01:06:21', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (31, 112);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 31, 10);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='Human Genome' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='Human Genetics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='Genetic Disorders' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='Diagnosis and Treatment' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.60.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.60.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.60.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.60.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.60.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.60.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.60.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.60.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where encodedID = 'CKT.S.BIO.60.60.50';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='Genetics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='Nucleic Acids' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='Organic Compounds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='Chemical Basis of Life' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 31,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (31, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 10 ,'Biotechnology','This chapter covers DNA technology, The Human Genome Project, and gene cloning.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 31, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (113,1,'History of Life','This chapter introduces the Evolution of Life, macroevolution, mass extinctions, episodic speciation, and responses to environmental and geographic changes.','113.xhtml','113.xhtml', MD5(CONCAT('113.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (113,113,1,'2010-06-10T01:06:22');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (32,2,'History of Life-::of::-CK-12 Biology I','This chapter introduces the Evolution of Life, macroevolution, mass extinctions, episodic speciation, and responses to environmental and geographic changes.','History-of-Life-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:22');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (32, 32, 1, 0, '2010-06-10T01:06:22', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (32, 113);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 32, 11);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.70.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.70.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where encodedID = 'CKT.S.ES.40.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.70.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 32,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (32, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 11 ,'History of Life','This chapter introduces the Evolution of Life, macroevolution, mass extinctions, episodic speciation, and responses to environmental and geographic changes.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 32, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (114,1,'Evolutionary Theory','This chapter covers Darwin\'s Theory of Evolution, the common ancestry of all life and natural selection, including fossils, comparative anatomy and embryology, molecular biology, and biogeography.','114.xhtml','114.xhtml', MD5(CONCAT('114.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (114,114,1,'2010-06-10T01:06:23');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (33,2,'Evolutionary Theory-::of::-CK-12 Biology I','This chapter covers Darwin\'s Theory of Evolution, the common ancestry of all life and natural selection, including fossils, comparative anatomy and embryology, molecular biology, and biogeography.','Evolutionary-Theory-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:23');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (33, 33, 1, 0, '2010-06-10T01:06:23', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (33, 114);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 33, 12);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.10.40';
INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'Darwin\'s Theory of Evolution', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,max(id) from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='Evolution' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 33,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (33, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 12 ,'Evolutionary Theory','This chapter covers Darwin\'s Theory of Evolution, the common ancestry of all life and natural selection, including fossils, comparative anatomy and embryology, molecular biology, and biogeography.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 33, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (115,1,'Evolution in Populations','This chapter covers the genetics of populations, genetic diseases in populations, mutations, and natural selection.','115.xhtml','115.xhtml', MD5(CONCAT('115.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (115,115,1,'2010-06-10T01:06:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (34,2,'Evolution in Populations-::of::-CK-12 Biology I','This chapter covers the genetics of populations, genetic diseases in populations, mutations, and natural selection.','Evolution-in-Populations-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (34, 34, 1, 0, '2010-06-10T01:06:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (34, 115);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 34, 13);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.40.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.40.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.40.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.40.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.40.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='Evolution' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 34,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (34, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 13 ,'Evolution in Populations','This chapter covers the genetics of populations, genetic diseases in populations, mutations, and natural selection.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 34, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (116,1,'Classification','This chapter covers taxonomy, the scientific classification of organisms, from classification based on form and function to modern classifications based on molecular analysis.','116.xhtml','116.xhtml', MD5(CONCAT('116.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (116,116,1,'2010-06-10T01:06:28');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (35,2,'Classification-::of::-CK-12 Biology I','This chapter covers taxonomy, the scientific classification of organisms, from classification based on form and function to modern classifications based on molecular analysis.','Classification-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:28');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (35, 35, 1, 0, '2010-06-10T01:06:28', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (35, 116);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 35, 14);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.100.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where encodedID = 'CKT.S.BIO.70.100.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where encodedID = 'CKT.S.LS.130.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 35,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (35, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 14 ,'Classification','This chapter covers taxonomy, the scientific classification of organisms, from classification based on form and function to modern classifications based on molecular analysis.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 35, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (117,1,'Principles of Ecology','This chapter covers ecology and its relationship to energy, ecosystems, and the water, carbon, and nitrogen cycles.','117.xhtml','117.xhtml', MD5(CONCAT('117.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (117,117,1,'2010-06-10T01:06:29');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (36,2,'Principles of Ecology-::of::-CK-12 Biology I','This chapter covers ecology and its relationship to energy, ecosystems, and the water, carbon, and nitrogen cycles.','Principles-of-Ecology-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:29');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (36, 36, 1, 0, '2010-06-10T01:06:29', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (36, 117);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 36, 15);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where encodedID = 'CKT.S.BIO.80.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='Flow of Energy in Ecosystems' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where encodedID = 'CKT.S.BIO.80.40.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where encodedID = 'CKT.S.BIO.80.40.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where encodedID = 'CKT.S.BIO.80.40.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where encodedID = 'CKT.S.BIO.80.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='Ecology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 36,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (36, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 15 ,'Principles of Ecology','This chapter covers ecology and its relationship to energy, ecosystems, and the water, carbon, and nitrogen cycles.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 36, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (118,1,'Biomes, Ecosystems, and Communities','This chapter covers both terrestrial and aquatic biomes as well as community interactions such as predation, competition, and symbiosis. Ecological succession is also discussed.','118.xhtml','118.xhtml', MD5(CONCAT('118.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (118,118,1,'2010-06-10T01:06:34');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (37,2,'Biomes, Ecosystems, and Communities-::of::-CK-12 Biology I','This chapter covers both terrestrial and aquatic biomes as well as community interactions such as predation, competition, and symbiosis. Ecological succession is also discussed.','Biomes,-Ecosystems,-and-Communities-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:34');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (37, 37, 1, 0, '2010-06-10T01:06:34', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (37, 118);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 37, 16);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 37,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (37, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 16 ,'Biomes, Ecosystems, and Communities','This chapter covers both terrestrial and aquatic biomes as well as community interactions such as predation, competition, and symbiosis. Ecological succession is also discussed.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 37, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (119,1,'Populations','This chapter covers the biology of natural populations as related to human populations and analyzes dynamics such as growth rates, geometric and logistic growth patterns, and limits to population growth.','119.xhtml','119.xhtml', MD5(CONCAT('119.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (119,119,1,'2010-06-10T01:06:34');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (38,2,'Populations-::of::-CK-12 Biology I','This chapter covers the biology of natural populations as related to human populations and analyzes dynamics such as growth rates, geometric and logistic growth patterns, and limits to population growth.','Populations-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:34');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (38, 38, 1, 0, '2010-06-10T01:06:34', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (38, 119);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 38, 17);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where encodedID = 'CKT.S.BIO.80.90';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where encodedID = 'CKT.S.BIO.80.100';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where encodedID = 'CKT.S.BIO.80.80';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 38,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (38, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 17 ,'Populations','This chapter covers the biology of natural populations as related to human populations and analyzes dynamics such as growth rates, geometric and logistic growth patterns, and limits to population growth.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 38, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (120,1,'Ecology and Human Actions','This chapter covers the delicate balance between humans and the earth; addressing natural resources, ecosystems, biodiversity, soils, land, water, and the atmosphere.','120.xhtml','120.xhtml', MD5(CONCAT('120.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (120,120,1,'2010-06-10T01:06:36');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (39,2,'Ecology and Human Actions-::of::-CK-12 Biology I','This chapter covers the delicate balance between humans and the earth; addressing natural resources, ecosystems, biodiversity, soils, land, water, and the atmosphere.','Ecology-and-Human-Actions-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:36');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (39, 39, 1, 0, '2010-06-10T01:06:36', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (39, 120);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 39, 18);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where encodedID = 'CKT.S.LS.170.60.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where encodedID = 'CKT.S.ES.120';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where encodedID = 'CKT.S.ES.90.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where encodedID = 'CKT.S.LS.170.60.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='Ecology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 39,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (39, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 18 ,'Ecology and Human Actions','This chapter covers the delicate balance between humans and the earth; addressing natural resources, ecosystems, biodiversity, soils, land, water, and the atmosphere.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 39, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (121,1,'The Human Body','This chapter covers the human body and its systems, including cells, tissues, and organs.','121.xhtml','121.xhtml', MD5(CONCAT('121.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (121,121,1,'2010-06-10T01:06:36');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (40,2,'The Human Body-::of::-CK-12 Biology I','This chapter covers the human body and its systems, including cells, tissues, and organs.','The-Human-Body-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:36');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (40, 40, 1, 0, '2010-06-10T01:06:36', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (40, 121);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 40, 19);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where encodedID = 'CKT.S.LS.150';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where encodedID = 'CKT.S.BIO.130';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 40,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (40, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 19 ,'The Human Body','This chapter covers the human body and its systems, including cells, tissues, and organs.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 40, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (122,1,'Nervous and Endocrine Systems','This chapter covers the structures and functions of the nervous and endocrine systems. Consequences of homeostatic imbalance in these systems is also addressed.','122.xhtml','122.xhtml', MD5(CONCAT('122.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (122,122,1,'2010-06-10T01:06:37');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (41,2,'Nervous and Endocrine Systems-::of::-CK-12 Biology I','This chapter covers the structures and functions of the nervous and endocrine systems. Consequences of homeostatic imbalance in these systems is also addressed.','Nervous-and-Endocrine-Systems-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:37');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (41, 41, 1, 0, '2010-06-10T01:06:37', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (41, 122);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 41, 20);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where encodedID = 'CKT.S.BIO.130.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where encodedID = 'CKT.S.LS.150.110';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='Human Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 41,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (41, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 20 ,'Nervous and Endocrine Systems','This chapter covers the structures and functions of the nervous and endocrine systems. Consequences of homeostatic imbalance in these systems is also addressed.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 41, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (123,1,'Skeletal, Muscular, and Integumentary Systems','This chapter covers the structures and functions of the skeletal, muscular, integumentary systems, and the consequences of homeostatic imbalance in these systems.','123.xhtml','123.xhtml', MD5(CONCAT('123.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (123,123,1,'2010-06-10T01:06:38');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (42,2,'Skeletal, Muscular, and Integumentary Systems-::of::-CK-12 Biology I','This chapter covers the structures and functions of the skeletal, muscular, integumentary systems, and the consequences of homeostatic imbalance in these systems.','Skeletal,-Muscular,-and-Integumentary-Systems-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:38');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (42, 42, 1, 0, '2010-06-10T01:06:38', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (42, 123);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 42, 21);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where encodedID = 'CKT.S.LS.150.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where encodedID = 'CKT.S.BIO.130.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where encodedID = 'CKT.S.BIO.130.60';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='Human Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 42,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (42, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 21 ,'Skeletal, Muscular, and Integumentary Systems','This chapter covers the structures and functions of the skeletal, muscular, integumentary systems, and the consequences of homeostatic imbalance in these systems.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 42, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (124,1,'Circulatory and Respiratory Systems','This chapter covers the structures and functions of the circulatory and respiratory systems, and the consequences of homeostatic imbalance in these systems.','124.xhtml','124.xhtml', MD5(CONCAT('124.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (124,124,1,'2010-06-10T01:06:38');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (43,2,'Circulatory and Respiratory Systems-::of::-CK-12 Biology I','This chapter covers the structures and functions of the circulatory and respiratory systems, and the consequences of homeostatic imbalance in these systems.','Circulatory-and-Respiratory-Systems-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:38');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (43, 43, 1, 0, '2010-06-10T01:06:38', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (43, 124);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 43, 22);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where encodedID = 'CKT.S.LS.150.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where encodedID = 'CKT.S.BIO.130.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='Human Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 43,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (43, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 22 ,'Circulatory and Respiratory Systems','This chapter covers the structures and functions of the circulatory and respiratory systems, and the consequences of homeostatic imbalance in these systems.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 43, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (125,1,'Digestive and Excretory Systems','This chapter covers the food pyramid and the digestive and excretory systems.','125.xhtml','125.xhtml', MD5(CONCAT('125.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (125,125,1,'2010-06-10T01:06:39');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (44,2,'Digestive and Excretory Systems-::of::-CK-12 Biology I','This chapter covers the food pyramid and the digestive and excretory systems.','Digestive-and-Excretory-Systems-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:39');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (44, 44, 1, 0, '2010-06-10T01:06:39', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (44, 125);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 44, 23);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where encodedID = 'CKT.S.BIO.130.100';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where encodedID = 'CKT.S.LS.150.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='Human Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 44,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (44, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 23 ,'Digestive and Excretory Systems','This chapter covers the food pyramid and the digestive and excretory systems.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 44, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (126,1,'Immune System and Disease','This chapter covers how the body fights diseases. The body\'s immune system, inflammatory response, and defenses against pathogens.','126.xhtml','126.xhtml', MD5(CONCAT('126.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (126,126,1,'2010-06-10T01:06:39');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (45,2,'Immune System and Disease-::of::-CK-12 Biology I','This chapter covers how the body fights diseases. The body\'s immune system, inflammatory response, and defenses against pathogens.','Immune-System-and-Disease-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:39');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (45, 45, 1, 0, '2010-06-10T01:06:39', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (45, 126);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 45, 24);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where encodedID = 'CKT.S.BIO.130.110';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where encodedID = 'CKT.S.BIO.130.120';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='Human Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 45,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (45, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 24 ,'Immune System and Disease','This chapter covers how the body fights diseases. The body\'s immune system, inflammatory response, and defenses against pathogens.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 45, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (127,1,'Reproductive System and Human Development','This chapter covers the male and female reproductive systems, the reproductive lifecycle, and sexually transmitted diseases.','127.xhtml','127.xhtml', MD5(CONCAT('127.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (127,127,1,'2010-06-10T01:06:39');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (46,2,'Reproductive System and Human Development-::of::-CK-12 Biology I','This chapter covers the male and female reproductive systems, the reproductive lifecycle, and sexually transmitted diseases.','Reproductive-System-and-Human-Development-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:39');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (46, 46, 1, 0, '2010-06-10T01:06:39', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (46, 127);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 46, 25);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where encodedID = 'CKT.S.BIO.150.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where encodedID = 'CKT.S.LS.160.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where encodedID = 'CKT.S.LS.160.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where encodedID = 'CKT.S.BIO.150';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 46,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (46, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 25 ,'Reproductive System and Human Development','This chapter covers the male and female reproductive systems, the reproductive lifecycle, and sexually transmitted diseases.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 46, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (128,1,'Appendix: Biology I','','128.xhtml','128.xhtml', MD5(CONCAT('128.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (128,128,1,'2010-06-10T01:06:40');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (47,2,'Appendix: Biology I-::of::-CK-12 Biology I','','Appendix:-Biology-I-::of::-CK-12-Biology-I',31,NULL, '2010-06-10T01:06:40');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (47, 47, 1, 0, '2010-06-10T01:06:40', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (47, 128);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (21, 47, 26);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='Sexually Transmitted Diseases' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='Male Reproductive System' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='Female Reproductive System' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='Reproductive System and Human Development' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='Biology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 47,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (47, 102);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 26 ,'Appendix: Biology I',''  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 47, max(id) from `Standards`;
