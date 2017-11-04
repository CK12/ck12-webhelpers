insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`,`handle`, `creatorID`, `ancestorID`, `creationTime`) values (177,1,'21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','The 21st Century Physics FlexBook is a collaborative effort of the Secretaries of Education and Technology and the Department of Education that seeks to elevate the quality of physics instruction across the Commonwealth of Virginia.','21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3, NULL, '2010-09-01T05:36:00');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (177, 177, 1, 0, '2010-09-01T05:36:00', '2010-01-01T12:12:27Z');
INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (265,2,'book_cover_image','Cover page image for the book','21stC_Physics_Book.png','21stC_Physics_Book.png',MD5(CONCAT('21stC_Physics_Book.png', 'cover page', 'admin')), 1,1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (265,265,1,'2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (177, 265);

INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (266,2,'chapter_cover_image','Cover page image for the chapter','chapter_cover_21stCPB.png','chapter_cover_21stCPB.png', MD5(CONCAT('chapter_cover_21stCPB.png', 'cover page', 'admin')), 1,1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (266,266,1,'2010-01-01T12:12:27Z');
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (267,1,'VA Introduction','','267.xhtml','267.xhtml', MD5(CONCAT('267.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (267,267,1,'2010-09-01T05:36:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (178,2,'VA Introduction-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','','VA-Introduction-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (178, 178, 1, 0, '2010-09-01T05:36:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (178, 267);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 178, 1);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 178,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (178, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'VA Introduction' ,'VA Introduction',''  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 178, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (268,1,'Toward Understanding Gravitation.','This chapter addresses our changing understanding of gravitation and introduces the student to a few interesting areas of astronomy and cosmology including dark matter and dark energy.','268.xhtml','268.xhtml', MD5(CONCAT('268.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (268,268,1,'2010-09-01T05:36:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (179,2,'Toward Understanding Gravitation.-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','This chapter addresses our changing understanding of gravitation and introduces the student to a few interesting areas of astronomy and cosmology including dark matter and dark energy.','Toward-Understanding-Gravitation-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (179, 179, 1, 0, '2010-09-01T05:36:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (179, 268);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 179, 2);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='Newton\'s Law of Universal Gravitation' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.40.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='Universal Gravitation' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.10.50.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='Newton\'s Third Law' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.10.40.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='Newton\'s Second Law' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.10.30.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='Newton\'s First Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='Kinematics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='Mechanics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 179,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (179, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Toward Understanding Gravitation.' ,'Toward Understanding Gravitation.','This chapter addresses our changing understanding of gravitation and introduces the student to a few interesting areas of astronomy and cosmology including dark matter and dark energy.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 179, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (269,1,'Nuclear Energy','This chapter is a short non-mathematical course introducing high school physics students and interested non-scientists to the physics of the atomic nucleus and to phenomena associated with nuclear fission.','269.xhtml','269.xhtml', MD5(CONCAT('269.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (269,269,1,'2010-09-01T05:36:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (180,2,'Nuclear Energy-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','This chapter is a short non-mathematical course introducing high school physics students and interested non-scientists to the physics of the atomic nucleus and to phenomena associated with nuclear fission.','Nuclear-Energy-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (180, 180, 1, 0, '2010-09-01T05:36:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (180, 269);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 180, 3);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where encodedID = 'CKT.S.PHY.60.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where encodedID = 'CKT.S.PHY.60.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where encodedID = 'CKT.S.PHY.60.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where encodedID = 'CKT.S.PHY.60.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where encodedID = 'CKT.S.PHY.60.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where encodedID = 'CKT.S.PHY.60.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='Atomic and Nuclear Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 180,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (180, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Nuclear Energy' ,'Nuclear Energy','This chapter is a short non-mathematical course introducing high school physics students and interested non-scientists to the physics of the atomic nucleus and to phenomena associated with nuclear fission.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 180, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (270,1,'The Standard Model of Particle Physics','The first part of this chapter helps explain a couple of the remaining fundamental questions of physics: What are the building blocks of matter and what are the forces that hold these particles together?','270.xhtml','270.xhtml', MD5(CONCAT('270.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (270,270,1,'2010-09-01T05:36:02');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (181,2,'The Standard Model of Particle Physics-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','The first part of this chapter helps explain a couple of the remaining fundamental questions of physics: What are the building blocks of matter and what are the forces that hold these particles together?','The-Standard-Model-of-Particle-Physics-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:02');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (181, 181, 1, 0, '2010-09-01T05:36:02', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (181, 270);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 181, 4);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where encodedID = 'CKT.S.PHY.20.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where encodedID = 'CKT.S.PHY.20.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where encodedID = 'CKT.S.PHY.20.10.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where encodedID = 'CKT.S.PHY.20.10.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='Atoms' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='The Atomic Nature of Matter' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='Properties of Matter' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 181,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (181, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'The Standard Model of Particle Physics' ,'The Standard Model of Particle Physics','The first part of this chapter helps explain a couple of the remaining fundamental questions of physics: What are the building blocks of matter and what are the forces that hold these particles together?'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 181, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (271,1,'The Standard Model and Beyond','This chapter explains current experiments in particle physics, the large particle colliders, and other equipment and instrumentation used in attempts to tease data to validate or reject several emerging theories.','271.xhtml','271.xhtml', MD5(CONCAT('271.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (271,271,1,'2010-09-01T05:36:02');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`,`creatorID`, `ancestorID`, `creationTime`)  values (182,2,'The Standard Model and Beyond-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','This chapter explains current experiments in particle physics, the large particle colliders, and other equipment and instrumentation used in attempts to tease data to validate or reject several emerging theories.','The-Standard-Model-and-Beyond-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:02');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (182, 182, 1, 0, '2010-09-01T05:36:02', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (182, 271);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 182, 5);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='Special Relativity' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='Kinetic Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='Mechanics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 182,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (182, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'The Standard Model and Beyond' ,'The Standard Model and Beyond','This chapter explains current experiments in particle physics, the large particle colliders, and other equipment and instrumentation used in attempts to tease data to validate or reject several emerging theories.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 182, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (272,1,'A Brief Synopsis of Modern Physics','This chapter has been cast into a series of 11 major questions in an effort to lead the student through an understanding of how modern physics came about, some of its components, some lingering problems in its theories, and some of its implications.','272.xhtml','272.xhtml', MD5(CONCAT('272.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (272,272,1,'2010-09-01T05:36:02');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (183,2,'A Brief Synopsis of Modern Physics-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','This chapter has been cast into a series of 11 major questions in an effort to lead the student through an understanding of how modern physics came about, some of its components, some lingering problems in its theories, and some of its implications.','A-Brief-Synopsis-of-Modern-Physics-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:02');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (183, 183, 1, 0, '2010-09-01T05:36:02', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (183, 272);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 183, 6);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='Vibrations and Waves' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='Sound and Light' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='Space-Time' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='Special Relativity' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='Quantum' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='Atomic and Nuclear Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 183,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (183, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'A Brief Synopsis of Modern Physics' ,'A Brief Synopsis of Modern Physics','This chapter has been cast into a series of 11 major questions in an effort to lead the student through an understanding of how modern physics came about, some of its components, some lingering problems in its theories, and some of its implications.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 183, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (273,1,'Nanoscience','The chapter explores nanoscience, the discovery and study of novel phenomena at the molecular scale (between 10 and 100nm) and the creation of new concepts to describe them.','273.xhtml','273.xhtml', MD5(CONCAT('273.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (273,273,1,'2010-09-01T05:36:02');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (184,2,'Nanoscience-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','The chapter explores nanoscience, the discovery and study of novel phenomena at the molecular scale (between 10 and 100nm) and the creation of new concepts to describe them.','Nanoscience-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:02');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (184, 184, 1, 0, '2010-09-01T05:36:02', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (184, 273);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 184, 7);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='Molecules' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='Elements' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='Electrons' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='Compounds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='Atoms' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='The Atomic Nature of Matter' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='Properties of Matter' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='Quantum' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='Atomic and Nuclear Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 184,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (184, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Nanoscience' ,'Nanoscience','The chapter explores nanoscience, the discovery and study of novel phenomena at the molecular scale (between 10 and 100nm) and the creation of new concepts to describe them.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 184, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (274,1,'Biophysics (Medical Imaging)','This chapter addresses major medical imaging technologies and their foundations in physics, specifically ultrasound. Today we have access to incredibly advanced non-invasive imaging technology for the analysis of our health.','274.xhtml','274.xhtml', MD5(CONCAT('274.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (274,274,1,'2010-09-01T05:36:02');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (185,2,'Biophysics (Medical Imaging)-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','This chapter addresses major medical imaging technologies and their foundations in physics, specifically ultrasound. Today we have access to incredibly advanced non-invasive imaging technology for the analysis of our health.','Biophysics-(Medical-Imaging)-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:02');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (185, 185, 1, 0, '2010-09-01T05:36:02', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (185, 274);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 185, 8);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where encodedID = 'CKT.S.PHY.40.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='Light' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='Sound and Light' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='Properties of Matter' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 185,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (185, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Biophysics (Medical Imaging)' ,'Biophysics (Medical Imaging)','This chapter addresses major medical imaging technologies and their foundations in physics, specifically ultrasound. Today we have access to incredibly advanced non-invasive imaging technology for the analysis of our health.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 185, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (275,1,'Kinematics: Motion, Work, and Energy','In this chapter we identify the terms used to characterize motion and study the work done by one or more forces on one or more bodies in order to determine the types of energy involved.','275.xhtml','275.xhtml', MD5(CONCAT('275.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (275,275,1,'2010-09-01T05:36:03');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (186,2,'Kinematics: Motion, Work, and Energy-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','In this chapter we identify the terms used to characterize motion and study the work done by one or more forces on one or more bodies in order to determine the types of energy involved.','Kinematics:-Motion,-Work,-and-Energy-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:03');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (186, 186, 1, 0, '2010-09-01T05:36:03', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (186, 275);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 186, 9);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='Velocity' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='Speed' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.10.10.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='Acceleration' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='Linear Motion' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='Kinematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.20.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.20.60';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='Potential Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='Mechanical Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='Mechanics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 186,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (186, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Kinematics: Motion, Work, and Energy' ,'Kinematics: Motion, Work, and Energy','In this chapter we identify the terms used to characterize motion and study the work done by one or more forces on one or more bodies in order to determine the types of energy involved.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 186, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (276,1,'Laboratory Activities','This chapter presents 15 physics experiments that utilize 21st century technology to conduct investigations that can be used in the high school classroom. The PASCO Xplorer GLX handheld interface is highlighted with downloadable labs hyperlinked throughout the chapter.','276.xhtml','276.xhtml', MD5(CONCAT('276.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (276,276,1,'2010-09-01T05:36:03');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (187,2,'Laboratory Activities-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','This chapter presents 15 physics experiments that utilize 21st century technology to conduct investigations that can be used in the high school classroom. The PASCO Xplorer GLX handheld interface is highlighted with downloadable labs hyperlinked throughout the chapter.','Laboratory-Activities-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:03');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (187, 187, 1, 0, '2010-09-01T05:36:03', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (187, 276);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 187, 10);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Newton\'s Third Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Newton\'s Second Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Newton\'s First Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Momentum' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Kinematics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Potential Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Mechanical Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Kinetic Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Mechanics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 187,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (187, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Laboratory Activities' ,'Laboratory Activities','This chapter presents 15 physics experiments that utilize 21st century technology to conduct investigations that can be used in the high school classroom. The PASCO Xplorer GLX handheld interface is highlighted with downloadable labs hyperlinked throughout the chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 187, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (277,1,'Statitical Physics and Random Walks','','277.xhtml','277.xhtml', MD5(CONCAT('277.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (277,277,1,'2010-09-01T05:36:03');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (188,2,'Statitical Physics and Random Walks-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','','Statitical-Physics-and-Random-Walks-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:03');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (188, 188, 1, 0, '2010-09-01T05:36:03', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (188, 277);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 188, 11);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 188,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (188, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Statitical Physics and Random Walks' ,'Statitical Physics and Random Walks',''  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 188, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (278,1,'Modeling and Simulation in the Physics Classroom','This chapter presents several examples of how physics content can be taught using modeling and simulation. Modeling and simulation have been used for design, test, evaluation, and training in the industry for several decades.','278.xhtml','278.xhtml', MD5(CONCAT('278.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (278,278,1,'2010-09-01T05:36:03');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (189,2,'Modeling and Simulation in the Physics Classroom-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','This chapter presents several examples of how physics content can be taught using modeling and simulation. Modeling and simulation have been used for design, test, evaluation, and training in the industry for several decades.','Modeling-and-Simulation-in-the-Physics-Classroom-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:03');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (189, 189, 1, 0, '2010-09-01T05:36:03', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (189, 278);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 189, 12);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='Newton\'s Second Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='Physics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 189,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (189, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Modeling and Simulation in the Physics Classroom' ,'Modeling and Simulation in the Physics Classroom','This chapter presents several examples of how physics content can be taught using modeling and simulation. Modeling and simulation have been used for design, test, evaluation, and training in the industry for several decades.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 189, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (279,1,'Modeling and Simulating NASA\'s Launch Abort System','It is valuable to model and simulate complex systems to better understand how they work and improve their design. Physical laws and assumptions are applied using a computer program to simulate the motion of NASA’s Launch Abort System.','279.xhtml','279.xhtml', MD5(CONCAT('279.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (279,279,1,'2010-09-01T05:36:03');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (190,2,'Modeling and Simulating NASA\'s Launch Abort System-::of::-21st Century Physics Flexbook: A Compilation of Contemporary and Emerging Technologies','It is valuable to model and simulate complex systems to better understand how they work and improve their design. Physical laws and assumptions are applied using a computer program to simulate the motion of NASA’s Launch Abort System.','Modeling-and-Simulating-NASA\'s-Launch-Abort-System-::of::-21st-Century-Physics-Flexbook:-A-Compilation-of-Contemporary-and-Emerging-Technologies',3,NULL, '2010-09-01T05:36:03');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (190, 190, 1, 0, '2010-09-01T05:36:03', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (190, 279);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (177, 190, 13);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Newton\'s Law of Universal Gravitation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Universal Gravitation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Momentum' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Projectile Motion' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Force and Acceleration' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Newton\'s Second Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Inertia' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Newton\'s First Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Velocity' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Speed' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Free Fall' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Acceleration' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Kinematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.50';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Mechanics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='Physics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 190,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (190, 266);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Modeling and Simulating NASA\'s Launch Abort System' ,'Modeling and Simulating NASA\'s Launch Abort System','It is valuable to model and simulate complex systems to better understand how they work and improve their design. Physical laws and assumptions are applied using a computer program to simulate the motion of NASA’s Launch Abort System.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 190, max(id) from `Standards`;
