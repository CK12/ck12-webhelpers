insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`) values (97,1,'Trigonometry','CK-12 Foundation’s Trigonometry FlexBook is an introduction to trigonometry for the high school student. Topics include: Trigonometric Identities & Equations, Circular Functions, and Polar Equations & Complex Numbers.','Trigonometry',1, NULL, '2010-09-01T02:09:02');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (97, 97, 1, 0, '2010-09-01T02:09:02', '2010-01-01T12:12:27Z');
INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (181,2,'book_cover_image','Cover page image for the book','CK12_Trigonometry.png','CK12_Trigonometry.png', MD5(CONCAT('CK12_Trigonometry.png', 'cover page', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (181,181,1,'2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (97, 181);

INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (182,2,'chapter_cover_image','Cover page image for the chapter','chapter_cover_trig.png','chapter_cover_trig.png', MD5(CONCAT('chapter_cover_trig.png', 'cover page', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (182,182,1,'2010-01-01T12:12:27Z');
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (183,1,'Trigonometry and Right Angles','This chapter is an introduction to the trigonometric functions.','183.xhtml','183.xhtml', MD5(CONCAT('183.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (183,183,1,'2010-09-01T02:09:05');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (98,2,'Trigonometry and Right Angles-::of::-Trigonometry','This chapter is an introduction to the trigonometric functions.','Trigonometry-and-Right-Angles-::of::-Trigonometry',1,NULL, '2010-09-01T02:09:05');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (98, 98, 1, 0, '2010-09-01T02:09:05', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (98, 183);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (97, 98, 1);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 98,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (98, 182);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Trigonometry and Right Angles' ,'Trigonometry and Right Angles','This chapter is an introduction to the trigonometric functions.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 98, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (184,1,'Circular Functions','This chapter is an introduction to radian measure, circular functions and periodic functions.','184.xhtml','184.xhtml', MD5(CONCAT('184.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (184,184,1,'2010-09-01T02:09:07');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (99,2,'Circular Functions-::of::-Trigonometry','This chapter is an introduction to radian measure, circular functions and periodic functions.','Circular-Functions-::of::-Trigonometry',1,NULL, '2010-09-01T02:09:07');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (99, 99, 1, 0, '2010-09-01T02:09:07', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (99, 184);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (97, 99, 2);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='Trigonometric Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='Trigonometry' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 99,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (99, 182);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Circular Functions' ,'Circular Functions','This chapter is an introduction to radian measure, circular functions and periodic functions.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 99, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (185,1,'Trigonometric Identities','In this chapter, students learn to confirm, verify and derive various trigonometric identities.','185.xhtml','185.xhtml', MD5(CONCAT('185.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (185,185,1,'2010-09-01T02:09:07');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (100,2,'Trigonometric Identities-::of::-Trigonometry','In this chapter, students learn to confirm, verify and derive various trigonometric identities.','Trigonometric-Identities-::of::-Trigonometry',1,NULL, '2010-09-01T02:09:07');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (100, 100, 1, 0, '2010-09-01T02:09:07', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (100, 185);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (97, 100, 3);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='Trigonometric Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='Trigonometric Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='Trigonometry' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 100,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (100, 182);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Trigonometric Identities' ,'Trigonometric Identities','In this chapter, students learn to confirm, verify and derive various trigonometric identities.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 100, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (186,1,'Inverse Functions and Trigonometric Equations','In this chapter, students will relate their knowledge of inverse functions to trigonometric functions, and will apply the domain, range and quadrants of the six inverse trigonometric functions to evaluate expressions.','186.xhtml','186.xhtml', MD5(CONCAT('186.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (186,186,1,'2010-09-01T02:09:08');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (101,2,'Inverse Functions and Trigonometric Equations-::of::-Trigonometry','In this chapter, students will relate their knowledge of inverse functions to trigonometric functions, and will apply the domain, range and quadrants of the six inverse trigonometric functions to evaluate expressions.','Inverse-Functions-and-Trigonometric-Equations-::of::-Trigonometry',1,NULL, '2010-09-01T02:09:08');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (101, 101, 1, 0, '2010-09-01T02:09:08', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (101, 186);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (97, 101, 4);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='Trigonometric Identities' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='Trigonometric Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='Trigonometric Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='Trigonometry' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 101,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (101, 182);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Inverse Functions and Trigonometric Equations' ,'Inverse Functions and Trigonometric Equations','In this chapter, students will relate their knowledge of inverse functions to trigonometric functions, and will apply the domain, range and quadrants of the six inverse trigonometric functions to evaluate expressions.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 101, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (187,1,'Triangles and Vectors','This chapter is an introduction to vectors and vector applications.','187.xhtml','187.xhtml', MD5(CONCAT('187.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (187,187,1,'2010-09-01T02:09:10');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (102,2,'Triangles and Vectors-::of::-Trigonometry','This chapter is an introduction to vectors and vector applications.','Triangles-and-Vectors-::of::-Trigonometry',1,NULL, '2010-09-01T02:09:10');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (102, 102, 1, 0, '2010-09-01T02:09:10', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (102, 187);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (97, 102, 5);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='Trigonometric Identities' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='Trigonometric Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='Trigonometry' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 102,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (102, 182);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Triangles and Vectors' ,'Triangles and Vectors','This chapter is an introduction to vectors and vector applications.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 102, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (188,1,'Polar Equations and Complex Numbers.','In this chapter, students will plot points in a polar coordinate system, graph and recognize limaçons and cardiods, and work with real-world applications involving polar coordinates and polar equations.','188.xhtml','188.xhtml', MD5(CONCAT('188.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (188,188,1,'2010-09-01T02:09:11');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (103,2,'Polar Equations and Complex Numbers-::of::-Trigonometry.','In this chapter, students will plot points in a polar coordinate system, graph and recognize limaçons and cardiods, and work with real-world applications involving polar coordinates and polar equations.','Polar-Equations-and-Complex-Numbers-::of::-Trigonometry.',1,NULL, '2010-09-01T02:09:11');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (103, 103, 1, 0, '2010-09-01T02:09:11', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (103, 188);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (97, 103, 6);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='Trigonometric Identities' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='Spherical Trigonometry' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='Trigonometry' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 103,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (103, 182);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Polar Equations and Complex Numbers.' ,'Polar Equations and Complex Numbers.','In this chapter, students will plot points in a polar coordinate system, graph and recognize limaçons and cardiods, and work with real-world applications involving polar coordinates and polar equations.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 103, max(id) from `Standards`;
