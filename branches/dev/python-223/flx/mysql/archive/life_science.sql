insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`) values (48,1,'CK-12 Life Science','CK-12 Life Science covers seven units: Understanding Living Things; Cells: The Building Blocks of Life; Genetics and Evolution; Prokaryotes, Protists, Fungi, and Plants; The Animal Kingdom; The Human Body; and Ecology.','CK-12-Life-Science',31, NULL, '2010-06-10T23:11:36');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (48, 48, 1, 0, '2010-06-10T23:11:36', '2010-01-01T12:12:27Z');
INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (129,2,'book_cover_image','Cover page image for the book','CK12_Life_Science.png','CK12_Life_Science.png', MD5(CONCAT('CK12_Life_Science.png', 'cover page', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (129,129,1,'2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (48, 129);

INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (130,2,'chapter_cover_image','Cover page image for the chapter','chapter_cover_2.png','chapter_cover_2.png', MD5(CONCAT('chapter_cover_2.png', 'cover page', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (130,130,1,'2010-01-01T12:12:27Z');
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (131,1,'Studying Life','This chapter serves as an introduction to life science for the middle school student. This chapter covers the nature of science, including the scientific method and the tools used in science, as well as safety in scientific research.','131.xhtml','131.xhtml', MD5(CONCAT('131.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (131,131,1,'2010-06-10T23:41:34');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (49,2,'Studying Life-::of::-CK-12 Life Science','This chapter serves as an introduction to life science for the middle school student. This chapter covers the nature of science, including the scientific method and the tools used in science, as well as safety in scientific research.','Studying-Life-::of::-CK-12-Life-Science',31,NULL, '2010-06-10T23:41:34');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (49, 49, 1, 0, '2010-06-10T23:41:34', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (49, 131);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 49, 1);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='Evolution' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='Genetics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where encodedID = 'CKT.S.LS';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where encodedID = 'CKT.S.LS.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where encodedID = 'CKT.S.LS.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where encodedID = 'CKT.S.LS.10.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='Scientific Method' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where encodedID = 'CKT.S.LS.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where encodedID = 'CKT.S.LS.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 49,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (49, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Studying Life' ,'Studying Life','This chapter serves as an introduction to life science for the middle school student. This chapter covers the nature of science, including the scientific method and the tools used in science, as well as safety in scientific research.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 49, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (132,1,'Introduction to Living Organisms','This chapter is a general introduction to living things: what they are, what they are made of, and how they are classified. Carbohydrates, lipids, proteins, and nucleic acids are introduced in this chapter.','132.xhtml','132.xhtml', MD5(CONCAT('132.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (132,132,1,'2010-06-10T23:51:28');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (50,2,'Introduction to Living Organisms-::of::-CK-12 Life Science','This chapter is a general introduction to living things: what they are, what they are made of, and how they are classified. Carbohydrates, lipids, proteins, and nucleic acids are introduced in this chapter.','Introduction-to-Living-Organisms-::of::-CK-12-Life-Science',31,NULL, '2010-06-10T23:51:28');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (50, 50, 1, 0, '2010-06-10T23:51:28', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (50, 132);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 50, 2);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='Cells' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where encodedID = 'CKT.S.LS.20.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where encodedID = 'CKT.S.LS.20.20';
INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'DNA', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,max(id) from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where encodedID = 'CKT.S.LS.20.10.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='Living Things' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='Organic Compounds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 50,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (50, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Introduction to Living Organisms' ,'Introduction to Living Organisms','This chapter is a general introduction to living things: what they are, what they are made of, and how they are classified. Carbohydrates, lipids, proteins, and nucleic acids are introduced in this chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 50, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (133,1,'Cells and Their Structures','This chapter discusses cells, what they are and what they are made of. Eukaryotic and prokaryotic cells are discussed, as are the major organelles of eukaryotic cells.','133.xhtml','133.xhtml', MD5(CONCAT('133.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (133,133,1,'2010-06-11T00:23:26');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (51,2,'Cells and Their Structures-::of::-CK-12 Life Science','This chapter discusses cells, what they are and what they are made of. Eukaryotic and prokaryotic cells are discussed, as are the major organelles of eukaryotic cells.','Cells-and-Their-Structures-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T00:23:26');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (51, 51, 1, 0, '2010-06-11T00:23:26', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (51, 133);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 51, 3);

INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'Cell Structure', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,max(id) from BrowseTerms;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 51,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (51, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Cells and Their Structures' ,'Cells and Their Structures','This chapter discusses cells, what they are and what they are made of. Eukaryotic and prokaryotic cells are discussed, as are the major organelles of eukaryotic cells.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 51, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (134,1,'Cell Functions','Cell functions, including active transport, passive transport, photosynthesis, and cellular respiration are discussed in this chapter.','134.xhtml','134.xhtml', MD5(CONCAT('134.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (134,134,1,'2010-06-11T00:15:16');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (52,2,'Cell Functions-::of::-CK-12 Life Science','Cell functions, including active transport, passive transport, photosynthesis, and cellular respiration are discussed in this chapter.','Cell-Functions-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T00:15:16');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (52, 52, 1, 0, '2010-06-11T00:15:16', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (52, 134);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 52, 4);

INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'Cell Function', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,max(id) from BrowseTerms;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='Cellular Respiration' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='Chemicals of Life' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='Organic Compounds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='Photosynthesis' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 52,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (52, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Cell Functions' ,'Cell Functions','Cell functions, including active transport, passive transport, photosynthesis, and cellular respiration are discussed in this chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 52, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (135,1,'Cell Division, Reproduction, and DNA','Cell division and reproduction – including mitosis and meiosis – are discussed in this chapter, as is the relationship between DNA, RNA, and protein synthesis.','135.xhtml','135.xhtml', MD5(CONCAT('135.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (135,135,1,'2010-06-11T00:27:03');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (53,2,'Cell Division, Reproduction, and DNA-::of::-CK-12 Life Science','Cell division and reproduction – including mitosis and meiosis – are discussed in this chapter, as is the relationship between DNA, RNA, and protein synthesis.','Cell-Division,-Reproduction,-and-DNA-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T00:27:03');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (53, 53, 1, 0, '2010-06-11T00:27:03', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (53, 135);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 53, 5);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='Cell Division' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='Cell Function' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='Cell Structure' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='Cells' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='DNA' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='Reproduction' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 53,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (53, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Cell Division, Reproduction, and DNA' ,'Cell Division, Reproduction, and DNA','Cell division and reproduction – including mitosis and meiosis – are discussed in this chapter, as is the relationship between DNA, RNA, and protein synthesis.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 53, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (136,1,'Genetics','Genetics – from Gregor Mendel and his pea plants to modern advances, including the Human Genome Project and gene therapy – are presented in this chapter.','136.xhtml','136.xhtml', MD5(CONCAT('136.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (136,136,1,'2010-06-11T00:18:22');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (54,2,'Genetics-::of::-CK-12 Life Science','Genetics – from Gregor Mendel and his pea plants to modern advances, including the Human Genome Project and gene therapy – are presented in this chapter.','Genetics-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T00:18:22');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (54, 54, 1, 0, '2010-06-11T00:18:22', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (54, 136);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 54, 6);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='DNA' and termTypeID =4 ;
INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'Genetic Advances', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,max(id) from BrowseTerms;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='Genetics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='Human Genetics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='Life Science' and termTypeID =4 ;
INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'Mendel', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,max(id) from BrowseTerms;
INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'Modern Genetics', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,max(id) from BrowseTerms;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 54,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (54, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Genetics' ,'Genetics','Genetics – from Gregor Mendel and his pea plants to modern advances, including the Human Genome Project and gene therapy – are presented in this chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 54, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (137,1,'Evolution','The findings of Charles Darwin leading to the theory of evolution by natural selection, the history of life on Earth, and the evidence of evolution are discussed in this chapter.','137.xhtml','137.xhtml', MD5(CONCAT('137.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (137,137,1,'2010-06-11T02:08:41');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (55,2,'Evolution-::of::-CK-12 Life Science','The findings of Charles Darwin leading to the theory of evolution by natural selection, the history of life on Earth, and the evidence of evolution are discussed in this chapter.','Evolution-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T02:08:41');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (55, 55, 1, 0, '2010-06-11T02:08:41', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (55, 137);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 55, 7);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='Darwin\'s Theory of Evolution' and termTypeID =4 ;
INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'Evidence of Evolution', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,max(id) from BrowseTerms;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='Evolution' and termTypeID =4 ;
INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'History of Life on Earth', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,max(id) from BrowseTerms;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='Life Science' and termTypeID =4 ;
INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'Macroevolution', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,max(id) from BrowseTerms;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 55,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (55, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Evolution' ,'Evolution','The findings of Charles Darwin leading to the theory of evolution by natural selection, the history of life on Earth, and the evidence of evolution are discussed in this chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 55, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (138,1,'Prokaryotes','Bacteria and Archaea make up prokaryotic organisms. The properties and characteristics of prokaryotes are presented in this chapter.','138.xhtml','138.xhtml', MD5(CONCAT('138.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (138,138,1,'2010-06-11T00:31:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (56,2,'Prokaryotes-::of::-CK-12 Life Science','Bacteria and Archaea make up prokaryotic organisms. The properties and characteristics of prokaryotes are presented in this chapter.','Prokaryotes-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T00:31:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (56, 56, 1, 0, '2010-06-11T00:31:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (56, 138);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 56, 8);

INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'Archea', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,max(id) from BrowseTerms;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='Life Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where encodedID = 'CKT.S.BIO.90.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 56,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (56, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Prokaryotes' ,'Prokaryotes','Bacteria and Archaea make up prokaryotic organisms. The properties and characteristics of prokaryotes are presented in this chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 56, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (139,1,'Protists and Fungi','The properties and characteristics of protists and fungi, from how they obtain food to how they reproduce, are discussed in this chapter.','139.xhtml','139.xhtml', MD5(CONCAT('139.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (139,139,1,'2010-06-11T00:33:07');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (57,2,'Protists and Fungi-::of::-CK-12 Life Science','The properties and characteristics of protists and fungi, from how they obtain food to how they reproduce, are discussed in this chapter.','Protists-and-Fungi-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T00:33:07');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (57, 57, 1, 0, '2010-06-11T00:33:07', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (57, 139);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 57, 9);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 57,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (57, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Protists and Fungi' ,'Protists and Fungi','The properties and characteristics of protists and fungi, from how they obtain food to how they reproduce, are discussed in this chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 57, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (140,1,'Plants','This chapter introduces plants, from nonvascular plants to vascular plants to gymnosperms and angiosperms. Plant responses, including hormones and tropisms, are also presented.','140.xhtml','140.xhtml', MD5(CONCAT('140.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (140,140,1,'2010-06-11T00:41:58');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (58,2,'Plants-::of::-CK-12 Life Science','This chapter introduces plants, from nonvascular plants to vascular plants to gymnosperms and angiosperms. Plant responses, including hormones and tropisms, are also presented.','Plants-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T00:41:58');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (58, 58, 1, 0, '2010-06-11T00:41:58', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (58, 140);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 58, 10);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='Life Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where encodedID = 'CKT.S.LS.110.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='Plants' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where encodedID = 'CKT.S.LS.110.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where encodedID = 'CKT.S.LS.110.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 58,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (58, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Plants' ,'Plants','This chapter introduces plants, from nonvascular plants to vascular plants to gymnosperms and angiosperms. Plant responses, including hormones and tropisms, are also presented.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 58, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (141,1,'Introduction to Invertebrates','This chapter gives an overview of animals and further discusses sponges, cnidarians, and worms, including flatworms, roundworms, and segmented worms.','141.xhtml','141.xhtml', MD5(CONCAT('141.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (141,141,1,'2010-06-11T09:49:48');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (59,2,'Introduction to Invertebrates-::of::-CK-12 Life Science','This chapter gives an overview of animals and further discusses sponges, cnidarians, and worms, including flatworms, roundworms, and segmented worms.','Introduction-to-Invertebrates-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T09:49:48');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (59, 59, 1, 0, '2010-06-11T09:49:48', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (59, 141);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 59, 11);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where encodedID = 'CKT.S.LS.130.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='Classification' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where encodedID = 'CKT.S.LS.120.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where encodedID = 'CKT.S.LS.120';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where encodedID = 'CKT.S.LS.120.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where encodedID = 'CKT.S.LS.120.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 59,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (59, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Introduction to Invertebrates' ,'Introduction to Invertebrates','This chapter gives an overview of animals and further discusses sponges, cnidarians, and worms, including flatworms, roundworms, and segmented worms.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 59, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (142,1,'Other Invertebrates','This chapter discusses additional animals without backbones: the mollusks, echinoderms, arthropods, and insects.','142.xhtml','142.xhtml', MD5(CONCAT('142.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (142,142,1,'2010-06-11T02:16:49');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (60,2,'Other Invertebrates-::of::-CK-12 Life Science','This chapter discusses additional animals without backbones: the mollusks, echinoderms, arthropods, and insects.','Other-Invertebrates-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T02:16:49');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (60, 60, 1, 0, '2010-06-11T02:16:49', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (60, 142);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 60, 12);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where encodedID = 'CKT.S.LS.120.90';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='Characteristics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where encodedID = 'CKT.S.LS.120.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where encodedID = 'CKT.S.LS.120.100';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='Invertebrates' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='Life Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where encodedID = 'CKT.S.LS.120.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 60,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (60, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Other Invertebrates' ,'Other Invertebrates','This chapter discusses additional animals without backbones: the mollusks, echinoderms, arthropods, and insects.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 60, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (143,1,'Fishes, Amphibians, and Reptiles','This chapter introduces vertebrates, animals with backbones - fishes, amphibians, and reptiles – from jawless fish to amphibians that must live near water to reptiles that can live anywhere.','143.xhtml','143.xhtml', MD5(CONCAT('143.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (143,143,1,'2010-06-11T09:55:39');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (61,2,'Fishes, Amphibians, and Reptiles-::of::-CK-12 Life Science','This chapter introduces vertebrates, animals with backbones - fishes, amphibians, and reptiles – from jawless fish to amphibians that must live near water to reptiles that can live anywhere.','Fishes,-Amphibians,-and-Reptiles-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T09:55:39');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (61, 61, 1, 0, '2010-06-11T09:55:39', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (61, 143);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 61, 13);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where encodedID = 'CKT.S.LS.130.50';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='Characteristics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='Classification' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='Evolution' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where encodedID = 'CKT.S.LS.130.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='Life Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where encodedID = 'CKT.S.LS.130.60';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where encodedID = 'CKT.S.LS.130';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 61,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (61, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Fishes, Amphibians, and Reptiles' ,'Fishes, Amphibians, and Reptiles','This chapter introduces vertebrates, animals with backbones - fishes, amphibians, and reptiles – from jawless fish to amphibians that must live near water to reptiles that can live anywhere.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 61, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (144,1,'Birds and Mammals','Characteristics and properties of birds and mammals are discussed in this chapter. The tremendous diversity of birds and the significance of mammals are highlighted.','144.xhtml','144.xhtml', MD5(CONCAT('144.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (144,144,1,'2010-06-11T00:59:53');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (62,2,'Birds and Mammals-::of::-CK-12 Life Science','Characteristics and properties of birds and mammals are discussed in this chapter. The tremendous diversity of birds and the significance of mammals are highlighted.','Birds-and-Mammals-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T00:59:53');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (62, 62, 1, 0, '2010-06-11T00:59:53', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (62, 144);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 62, 14);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where encodedID = 'CKT.S.LS.130.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='Characteristics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='Classification' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='Evolution' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where encodedID = 'CKT.S.LS.130.100';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='Life Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where encodedID = 'CKT.S.LS.130.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where encodedID = 'CKT.S.LS.130.90';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='Vertebrates' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 62,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (62, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Birds and Mammals' ,'Birds and Mammals','Characteristics and properties of birds and mammals are discussed in this chapter. The tremendous diversity of birds and the significance of mammals are highlighted.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 62, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (145,1,'Behavior of Animals','Types of animal behaviors, including communication, cooperation, mating and raising young, and daily and yearly cycles are presented in this chapter.','145.xhtml','145.xhtml', MD5(CONCAT('145.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (145,145,1,'2010-06-11T01:07:07');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (63,2,'Behavior of Animals-::of::-CK-12 Life Science','Types of animal behaviors, including communication, cooperation, mating and raising young, and daily and yearly cycles are presented in this chapter.','Behavior-of-Animals-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T01:07:07');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (63, 63, 1, 0, '2010-06-11T01:07:07', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (63, 145);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 63, 15);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where encodedID = 'CKT.S.LS.140';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 63,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (63, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Behavior of Animals' ,'Behavior of Animals','Types of animal behaviors, including communication, cooperation, mating and raising young, and daily and yearly cycles are presented in this chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 63, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (146,1,'Skin, Bones, and Muscles','This chapter introduces the human body and its organization. The skeletal, muscular, and integumentary (skin) systems are presented.','146.xhtml','146.xhtml', MD5(CONCAT('146.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (146,146,1,'2010-06-11T03:37:38');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (64,2,'Skin, Bones, and Muscles-::of::-CK-12 Life Science','This chapter introduces the human body and its organization. The skeletal, muscular, and integumentary (skin) systems are presented.','Skin,-Bones,-and-Muscles-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T03:37:38');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (64, 64, 1, 0, '2010-06-11T03:37:38', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (64, 146);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 64, 16);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='Humans' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='Living Things' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='Skeletal System' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where encodedID = 'CKT.S.LS.150.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='The Human Body' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where encodedID = 'CKT.S.LS.150.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 64,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (64, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Skin, Bones, and Muscles' ,'Skin, Bones, and Muscles','This chapter introduces the human body and its organization. The skeletal, muscular, and integumentary (skin) systems are presented.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 64, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (147,1,'Food and the Digestive System','In this chapter, food (and nutrients) and how to choose healthy food are discussed, as is the digestive system. The MyPyramid diagram is presented.','147.xhtml','147.xhtml', MD5(CONCAT('147.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (147,147,1,'2010-06-11T03:26:12');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (65,2,'Food and the Digestive System-::of::-CK-12 Life Science','In this chapter, food (and nutrients) and how to choose healthy food are discussed, as is the digestive system. The MyPyramid diagram is presented.','Food-and-the-Digestive-System-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T03:26:12');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (65, 65, 1, 0, '2010-06-11T03:26:12', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (65, 147);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 65, 17);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='Chemicals of Life' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='Digestive System' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='Humans' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='Organic Compounds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='The Human Body' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='Vertebrates' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 65,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (65, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Food and the Digestive System' ,'Food and the Digestive System','In this chapter, food (and nutrients) and how to choose healthy food are discussed, as is the digestive system. The MyPyramid diagram is presented.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 65, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (148,1,'Cardiovascular System','This chapter introduces the heart, blood, and blood vessels, as well as discusses cardiovascular disease and health.','148.xhtml','148.xhtml', MD5(CONCAT('148.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (148,148,1,'2010-06-11T03:27:46');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (66,2,'Cardiovascular System-::of::-CK-12 Life Science','This chapter introduces the heart, blood, and blood vessels, as well as discusses cardiovascular disease and health.','Cardiovascular-System-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T03:27:46');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (66, 66, 1, 0, '2010-06-11T03:27:46', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (66, 148);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 66, 18);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where encodedID = 'CKT.S.LS.150.50';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='Humans' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='The Human Body' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='Vertebrates' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 66,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (66, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Cardiovascular System' ,'Cardiovascular System','This chapter introduces the heart, blood, and blood vessels, as well as discusses cardiovascular disease and health.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 66, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (149,1,'Respiratory and Excretory Systems','Presented in this chapter are how we breathe (the respiratory system) and how we get rid of waste (the excretory system).','149.xhtml','149.xhtml', MD5(CONCAT('149.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (149,149,1,'2010-06-11T03:38:22');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (67,2,'Respiratory and Excretory Systems-::of::-CK-12 Life Science','Presented in this chapter are how we breathe (the respiratory system) and how we get rid of waste (the excretory system).','Respiratory-and-Excretory-Systems-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T03:38:22');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (67, 67, 1, 0, '2010-06-11T03:38:22', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (67, 149);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 67, 19);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where encodedID = 'CKT.S.LS.150.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='Humans' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='Living Things' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='Respiratory System' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='The Human Body' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='Vertebrates' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 67,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (67, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Respiratory and Excretory Systems' ,'Respiratory and Excretory Systems','Presented in this chapter are how we breathe (the respiratory system) and how we get rid of waste (the excretory system).'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 67, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (150,1,'Controlling the Body','In this chapter, the nervous system and the health of this system are discussed. The senses – vision, hearing, touch, smell, and taste are also presented.','150.xhtml','150.xhtml', MD5(CONCAT('150.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (150,150,1,'2010-06-11T03:07:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (68,2,'Controlling the Body-::of::-CK-12 Life Science','In this chapter, the nervous system and the health of this system are discussed. The senses – vision, hearing, touch, smell, and taste are also presented.','Controlling-the-Body-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T03:07:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (68, 68, 1, 0, '2010-06-11T03:07:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (68, 150);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 68, 20);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='Cell Function' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='Cells' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where encodedID = 'CKT.S.LS.150.90';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='Humans' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='Living Things' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='The Human Body' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where encodedID = 'CKT.S.LS.150.80';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='Vertebrates' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 68,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (68, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Controlling the Body' ,'Controlling the Body','In this chapter, the nervous system and the health of this system are discussed. The senses – vision, hearing, touch, smell, and taste are also presented.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 68, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (151,1,'Diseases and the Body\'s Defenses','How the body protects itself is discussed in this chapter. Infectious and noninfectious diseases, the first two lines of nonspecific defenses, and the specific immune response are presented.','151.xhtml','151.xhtml', MD5(CONCAT('151.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (151,151,1,'2010-06-11T03:01:59');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (69,2,'Diseases and the Body\'s Defenses-::of::-CK-12 Life Science','How the body protects itself is discussed in this chapter. Infectious and noninfectious diseases, the first two lines of nonspecific defenses, and the specific immune response are presented.','Diseases-and-the-Body\'s-Defenses-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T03:01:59');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (69, 69, 1, 0, '2010-06-11T03:01:59', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (69, 151);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 69, 21);

INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'Diseases and the Body\'s Defenses', 4,39 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,max(id) from BrowseTerms;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='Humans' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='Living Things' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='The Human Body' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where encodedID = 'CKT.S.LS.150.130';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='Vertebrates' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 69,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (69, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Diseases and the Body\'s Defenses' ,'Diseases and the Body\'s Defenses','How the body protects itself is discussed in this chapter. Infectious and noninfectious diseases, the first two lines of nonspecific defenses, and the specific immune response are presented.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 69, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (152,1,'Reproductive Systems and Life Stages','The male and female reproductive systems and maintaining the health of these systems – including STDs - is presented in this chapter. Reproduction, fertilization, and various stages of development and life are also presented.','152.xhtml','152.xhtml', MD5(CONCAT('152.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (152,152,1,'2010-06-11T03:02:02');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (70,2,'Reproductive Systems and Life Stages-::of::-CK-12 Life Science','The male and female reproductive systems and maintaining the health of these systems – including STDs - is presented in this chapter. Reproduction, fertilization, and various stages of development and life are also presented.','Reproductive-Systems-and-Life-Stages-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T03:02:02');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (70, 70, 1, 0, '2010-06-11T03:02:02', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (70, 152);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 70, 22);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='Female Reproductive System' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='Humans' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='Living Things' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='Male Reproductive System' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where encodedID = 'CKT.S.LS.160.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where encodedID = 'CKT.S.LS.160.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where encodedID = 'CKT.S.LS.160';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='The Human Body' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='Vertebrates' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 70,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (70, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Reproductive Systems and Life Stages' ,'Reproductive Systems and Life Stages','The male and female reproductive systems and maintaining the health of these systems – including STDs - is presented in this chapter. Reproduction, fertilization, and various stages of development and life are also presented.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 70, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (153,1,'From Populations to the Biosphere','This chapter introduces ecology and discusses the ecosystem beginning with the population. Communities, ecosystems, biotic and abiotic factors, and biomes are also presented.','153.xhtml','153.xhtml', MD5(CONCAT('153.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (153,153,1,'2010-06-11T02:41:29');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (71,2,'From Populations to the Biosphere-::of::-CK-12 Life Science','This chapter introduces ecology and discusses the ecosystem beginning with the population. Communities, ecosystems, biotic and abiotic factors, and biomes are also presented.','From-Populations-to-the-Biosphere-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T02:41:29');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (71, 71, 1, 0, '2010-06-11T02:41:29', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (71, 153);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 71, 23);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where encodedID = 'CKT.S.LS.170.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where encodedID = 'CKT.S.LS.170.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='Ecology' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where encodedID = 'CKT.S.LS.170.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where encodedID = 'CKT.S.LS.170.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='Living Things' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where encodedID = 'CKT.S.LS.170.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 71,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (71, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'From Populations to the Biosphere' ,'From Populations to the Biosphere','This chapter introduces ecology and discusses the ecosystem beginning with the population. Communities, ecosystems, biotic and abiotic factors, and biomes are also presented.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 71, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (154,1,'Ecosystem Dynamics','How energy flows through an ecosystem, how matter recycles through ecosystems, and how ecosystems change over time make up this chapter.','154.xhtml','154.xhtml', MD5(CONCAT('154.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (154,154,1,'2010-06-11T02:41:02');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (72,2,'Ecosystem Dynamics-::of::-CK-12 Life Science','How energy flows through an ecosystem, how matter recycles through ecosystems, and how ecosystems change over time make up this chapter.','Ecosystem-Dynamics-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T02:41:02');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (72, 72, 1, 0, '2010-06-11T02:41:02', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (72, 154);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 72, 24);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='Chemicals of Life' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='Ecology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='Ecosystem Dynamics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='Ecosystems' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='Elements and Compounds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='Living Things' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 72,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (72, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Ecosystem Dynamics' ,'Ecosystem Dynamics','How energy flows through an ecosystem, how matter recycles through ecosystems, and how ecosystems change over time make up this chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 72, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (155,1,'Environmental Problems','Air pollution, water pollution, renewable and nonrenewable resources, habitat destruction and extinction, and the importance of biodiversity are discussed in this chapter.','155.xhtml','155.xhtml', MD5(CONCAT('155.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (155,155,1,'2010-06-11T02:40:42');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (73,2,'Environmental Problems-::of::-CK-12 Life Science','Air pollution, water pollution, renewable and nonrenewable resources, habitat destruction and extinction, and the importance of biodiversity are discussed in this chapter.','Environmental-Problems-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T02:40:42');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (73, 73, 1, 0, '2010-06-11T02:40:42', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (73, 155);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 73, 25);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='Air Pollution' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='Biomes and the Biosphere' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='Ecology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='Ecosystems' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where encodedID = 'CKT.S.LS.170.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where encodedID = 'CKT.S.LS.170.60.50';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='Natural Resources' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where encodedID = 'CKT.S.LS.170.60.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where encodedID = 'CKT.S.LS.170.60.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 73,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (73, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Environmental Problems' ,'Environmental Problems','Air pollution, water pollution, renewable and nonrenewable resources, habitat destruction and extinction, and the importance of biodiversity are discussed in this chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 73, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (156,1,'Appendix: Life Science','Investigation and Experimentation ActivitiesThe following activities are based on information provided within this FlexBook or taken directly from the Teacher Edition','156.xhtml','156.xhtml', MD5(CONCAT('156.xhtml', 'contents', 'Douglas')), 31, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (156,156,1,'2010-06-11T02:50:37');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (74,2,'Appendix: Life Science-::of::-CK-12 Life Science','Investigation and Experimentation ActivitiesThe following activities are based on information provided within this FlexBook or taken directly from the Teacher Edition','Appendix:-Life-Science-::of::-CK-12-Life-Science',31,NULL, '2010-06-11T02:50:37');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (74, 74, 1, 0, '2010-06-11T02:50:37', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (74, 156);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (48, 74, 26);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='Air Pollution' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='Biomes and the Biosphere' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='Ecology' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='Ecosystems' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='Environmental Problems' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='Habitat Destruction and Extinction' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='Life Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='Natural Resources' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='Waste' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='Water Pollution' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='biology' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 74,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (74, 130);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 1 , 'Appendix: Life Science' ,'Appendix: Life Science','Investigation and Experimentation ActivitiesThe following activities are based on information provided within this FlexBook or taken directly from the Teacher Edition'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 74, max(id) from `Standards`;
