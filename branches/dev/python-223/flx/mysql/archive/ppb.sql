INSERT INTO `Members` (`id`, `defaultLogin`, `login`, `email`, `givenName`, `surname`) VALUES(80, 'byron', 'byron', 'byron@nowhere.com', 'Byron', 'Philhour');
INSERT INTO `GroupHasMembers` (`groupID`, `memberID`, `roleID`, `statusID`) VALUES
(1, 80, 3, 2);
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`) values (144,1,'People\'s Physics Book Version 2','The People\'s Physics Book Version 2 is intended to be used as one small part of a multifaceted strategy to teach physics conceptually and mathematically.','People\'s-Physics-Book-Version-2',80, NULL, '2010-09-01T02:07:21');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (144, 144, 1, 0, '2010-09-01T02:07:21', '2010-01-01T12:12:27Z');
INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (231,2,'book_cover_image','Cover page image for the book','Peoples_Physics_Book.png','Peoples_Physics_Book.png', MD5(CONCAT('Peoples_Physics_Book.png', 'cover page', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (231,231,1,'2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (144, 231);

INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (232,2,'chapter_cover_image','Cover page image for the chapter','chapter_cover_ppb.png','chapter_cover_ppb.png', MD5(CONCAT('chapter_cover_ppb.png', 'cover page', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (232,232,1,'2010-01-01T12:12:27Z');
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (233,1,'Units, Scalars, Vectors Version 2','Students explore and understand the importance of units, which identify what a specific number represents. Examples of types of measurements, commonly used symbols, fundamental units, and unit conversions are given in this chapter.','233.xhtml','233.xhtml', MD5(CONCAT('233.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (233,233,1,'2010-09-01T02:07:22');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (145,2,'Units, Scalars, Vectors Version 2-::of::-People\'s Physics Book Version 2','Students explore and understand the importance of units, which identify what a specific number represents. Examples of types of measurements, commonly used symbols, fundamental units, and unit conversions are given in this chapter.','Units,-Scalars,-Vectors-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:22');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (145, 145, 1, 0, '2010-09-01T02:07:22', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (145, 233);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 145, 1);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 145,id from BrowseTerms where name='Measurement' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 145,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 145,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (145, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Units, Scalars, Vectors Version 2' ,'Units, Scalars, Vectors Version 2','Students explore and understand the importance of units, which identify what a specific number represents. Examples of types of measurements, commonly used symbols, fundamental units, and unit conversions are given in this chapter.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 145, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (234,1,'Energy Conservation Version 2','Students are introduced to energy conservation and the conservation laws that govern our universe. Physicists have identified five conservation laws, which are discussed in this chapter.','234.xhtml','234.xhtml', MD5(CONCAT('234.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (234,234,1,'2010-09-01T02:07:22');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (146,2,'Energy Conservation Version 2-::of::-People\'s Physics Book Version 2','Students are introduced to energy conservation and the conservation laws that govern our universe. Physicists have identified five conservation laws, which are discussed in this chapter.','Energy-Conservation-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:22');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (146, 146, 1, 0, '2010-09-01T02:07:22', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (146, 234);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 146, 2);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 146,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.20.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 146,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.20.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 146,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.20.50';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 146,id from BrowseTerms where name='Energy' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 146,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 146,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (146, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Energy Conservation Version 2' ,'Energy Conservation Version 2','Students are introduced to energy conservation and the conservation laws that govern our universe. Physicists have identified five conservation laws, which are discussed in this chapter.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 146, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (235,1,'Energy Conservation Appendix','Students are introduced to energy conservation and the conservation laws that govern our universe. Physicists have identified five conservation laws, which are discussed in this chapter.','235.xhtml','235.xhtml', MD5(CONCAT('235.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (235,235,1,'2010-09-01T02:07:22');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (147,2,'Energy Conservation Appendix-::of::-People\'s Physics Book Version 2','Students are introduced to energy conservation and the conservation laws that govern our universe. Physicists have identified five conservation laws, which are discussed in this chapter.','Energy-Conservation-Appendix-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:22');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (147, 147, 1, 0, '2010-09-01T02:07:22', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (147, 235);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 147, 3);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='Potential Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='Mechanical Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='Kinetic Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='Energy' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 147,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (147, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Energy Conservation Appendix' ,'Energy Conservation Appendix','Students are introduced to energy conservation and the conservation laws that govern our universe. Physicists have identified five conservation laws, which are discussed in this chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 147, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (236,1,'One-Dimensional Motion Version 2','This chapter covers one-dimensional motion, velocity, acceleration, and deceleration.','236.xhtml','236.xhtml', MD5(CONCAT('236.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (236,236,1,'2010-09-01T02:07:23');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (148,2,'One-Dimensional Motion Version 2-::of::-People\'s Physics Book Version 2','This chapter covers one-dimensional motion, velocity, acceleration, and deceleration.','One-Dimensional-Motion-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:23');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (148, 148, 1, 0, '2010-09-01T02:07:23', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (148, 236);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 148, 4);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 148,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.10.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 148,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.10.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 148,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.10.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 148,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 148,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 148,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (148, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'One-Dimensional Motion Version 2' ,'One-Dimensional Motion Version 2','This chapter covers one-dimensional motion, velocity, acceleration, and deceleration.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 148, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (237,1,'Two-Dimensional and Projectile Motion Version 2','This chapter discusses parabolic and projectile motion, acceleration, and velocity.','237.xhtml','237.xhtml', MD5(CONCAT('237.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (237,237,1,'2010-09-01T02:07:23');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (149,2,'Two-Dimensional and Projectile Motion Version 2-::of::-People\'s Physics Book Version 2','This chapter discusses parabolic and projectile motion, acceleration, and velocity.','Two-Dimensional-and-Projectile-Motion-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:23');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (149, 149, 1, 0, '2010-09-01T02:07:23', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (149, 237);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 149, 5);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 149,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 149,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 149,id from BrowseTerms where encodedID = 'CKT.S.PHY.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 149,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 149,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (149, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Two-Dimensional and Projectile Motion Version 2' ,'Two-Dimensional and Projectile Motion Version 2','This chapter discusses parabolic and projectile motion, acceleration, and velocity.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 149, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (238,1,'Newton’s Laws Version 2','Students learn about Newton’s Law\'s through the study of motion, acceleration, and force.','238.xhtml','238.xhtml', MD5(CONCAT('238.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (238,238,1,'2010-09-01T02:07:23');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (150,2,'Newton’s Laws Version 2-::of::-People\'s Physics Book Version 2','Students learn about Newton’s Law\'s through the study of motion, acceleration, and force.','Newton\'s-Laws-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:23');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (150, 150, 1, 0, '2010-09-01T02:07:23', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (150, 238);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 150, 6);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 150,id from BrowseTerms where name='Newton\'s Third Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 150,id from BrowseTerms where name='Newton\'s Second Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 150,id from BrowseTerms where name='Newton\'s First Law' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 150,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 150,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (150, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Newton\'s Laws Version 2' ,'Newton\'s Laws Version 2','Students learn about Newton\'s Law\'s through the study of motion, acceleration, and force.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 150, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (239,1,'Centripetal Forces Version 2','Centripetal force is introduced through the study of force, velocity changes, net-forces, applied forces, and acceleration.','239.xhtml','239.xhtml', MD5(CONCAT('239.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (239,239,1,'2010-09-01T02:07:23');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (151,2,'Centripetal Forces Version 2-::of::-People\'s Physics Book Version 2','Centripetal force is introduced through the study of force, velocity changes, net-forces, applied forces, and acceleration.','Centripetal-Forces-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:23');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (151, 151, 1, 0, '2010-09-01T02:07:23', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (151, 239);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 151, 7);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 151,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.30.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 151,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.30.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 151,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 151,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 151,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (151, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Centripetal Forces Version 2' ,'Centripetal Forces Version 2','Centripetal force is introduced through the study of force, velocity changes, net-forces, applied forces, and acceleration.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 151, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (240,1,'Momentum Conservation Version 2','This chapter introduces momentum conservation through the study of motion, mass, velocity, force of gravity, and collision.','240.xhtml','240.xhtml', MD5(CONCAT('240.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (240,240,1,'2010-09-01T02:07:23');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (152,2,'Momentum Conservation Version 2-::of::-People\'s Physics Book Version 2','This chapter introduces momentum conservation through the study of motion, mass, velocity, force of gravity, and collision.','Momentum-Conservation-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:23');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (152, 152, 1, 0, '2010-09-01T02:07:23', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (152, 240);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 152, 8);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 152,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.10.60.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 152,id from BrowseTerms where name='Momentum' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 152,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 152,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (152, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Momentum Conservation Version 2' ,'Momentum Conservation Version 2','This chapter introduces momentum conservation through the study of motion, mass, velocity, force of gravity, and collision.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 152, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (241,1,'Energy and Force Version 2','The law of conservation of energy and the law of conservation of momentum is introduced through the study of energy and force.','241.xhtml','241.xhtml', MD5(CONCAT('241.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (241,241,1,'2010-09-01T02:07:23');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (153,2,'Energy and Force Version 2-::of::-People\'s Physics Book Version 2','The law of conservation of energy and the law of conservation of momentum is introduced through the study of energy and force.','Energy-and-Force-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:23');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (153, 153, 1, 0, '2010-09-01T02:07:23', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (153, 241);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 153, 9);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 153,id from BrowseTerms where name='Newton\'s Second Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 153,id from BrowseTerms where name='Kinematics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 153,id from BrowseTerms where name='Energy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 153,id from BrowseTerms where name='Mechanics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 153,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 153,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (153, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Energy and Force Version 2' ,'Energy and Force Version 2','The law of conservation of energy and the law of conservation of momentum is introduced through the study of energy and force.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 153, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (242,1,'Rotational Motion Version 2','The third conservation law is conservation of angular momentum. Conservation of angular momentum is explored through the concepts of rotational velocity, rotational inertia, angular momentum, torque, linear, and rotational motion.','242.xhtml','242.xhtml', MD5(CONCAT('242.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (242,242,1,'2010-09-01T02:07:23');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (154,2,'Rotational Motion Version 2-::of::-People\'s Physics Book Version 2','The third conservation law is conservation of angular momentum. Conservation of angular momentum is explored through the concepts of rotational velocity, rotational inertia, angular momentum, torque, linear, and rotational motion.','Rotational-Motion-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:23');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (154, 154, 1, 0, '2010-09-01T02:07:23', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (154, 242);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 154, 10);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 154,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.30.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 154,id from BrowseTerms where name='Circular Motion' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 154,id from BrowseTerms where name='Mechanics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 154,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 154,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (154, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Rotational Motion Version 2' ,'Rotational Motion Version 2','The third conservation law is conservation of angular momentum. Conservation of angular momentum is explored through the concepts of rotational velocity, rotational inertia, angular momentum, torque, linear, and rotational motion.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 154, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (243,1,'Simple Harmonic Motion Version 2','Simple harmonic motion (SHM) concepts are presented in this chapter through the study of periodic motion, oscillation, restorative force, frequency, amplitude, and kinetic energy.','243.xhtml','243.xhtml', MD5(CONCAT('243.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (243,243,1,'2010-09-01T02:07:23');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (155,2,'Simple Harmonic Motion Version 2-::of::-People\'s Physics Book Version 2','Simple harmonic motion (SHM) concepts are presented in this chapter through the study of periodic motion, oscillation, restorative force, frequency, amplitude, and kinetic energy.','Simple-Harmonic-Motion-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:23');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (155, 155, 1, 0, '2010-09-01T02:07:23', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (155, 243);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 155, 11);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 155,id from BrowseTerms where encodedID = 'CKT.S.PHY.40.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 155,id from BrowseTerms where encodedID = 'CKT.S.PHY.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 155,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 155,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (155, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Simple Harmonic Motion Version 2' ,'Simple Harmonic Motion Version 2','Simple harmonic motion (SHM) concepts are presented in this chapter through the study of periodic motion, oscillation, restorative force, frequency, amplitude, and kinetic energy.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 155, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (244,1,'Wave Motion and Sound Version 2','Wave motion and sound is presented through harmonic motion, longitudinal and transverse waves, constructive and destructive interference, sound and water waves.','244.xhtml','244.xhtml', MD5(CONCAT('244.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (244,244,1,'2010-09-01T02:07:24');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (156,2,'Wave Motion and Sound Version 2-::of::-People\'s Physics Book Version 2','Wave motion and sound is presented through harmonic motion, longitudinal and transverse waves, constructive and destructive interference, sound and water waves.','Wave-Motion-and-Sound-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:24');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (156, 156, 1, 0, '2010-09-01T02:07:24', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (156, 244);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 156, 12);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 156,id from BrowseTerms where name='Vibrations and Waves' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 156,id from BrowseTerms where name='Sound and Light' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 156,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 156,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (156, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Wave Motion and Sound Version 2' ,'Wave Motion and Sound Version 2','Wave motion and sound is presented through harmonic motion, longitudinal and transverse waves, constructive and destructive interference, sound and water waves.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 156, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (245,1,'Electricity Version 2','Students are introduced to electricity through the study of the conservation of charge. Other concepts such as electromagnetism, the Coulomb electric force, the law of gravity, charged objects, electric force, and potential energy are presented.','245.xhtml','245.xhtml', MD5(CONCAT('245.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (245,245,1,'2010-09-01T02:07:24');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (157,2,'Electricity Version 2-::of::-People\'s Physics Book Version 2','Students are introduced to electricity through the study of the conservation of charge. Other concepts such as electromagnetism, the Coulomb electric force, the law of gravity, charged objects, electric force, and potential energy are presented.','Electricity-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:24');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (157, 157, 1, 0, '2010-09-01T02:07:24', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (157, 245);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 157, 13);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 157,id from BrowseTerms where encodedID = 'CKT.S.PHY.50.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 157,id from BrowseTerms where encodedID = 'CKT.S.PHY.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 157,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 157,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (157, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Electricity Version 2' ,'Electricity Version 2','Students are introduced to electricity through the study of the conservation of charge. Other concepts such as electromagnetism, the Coulomb electric force, the law of gravity, charged objects, electric force, and potential energy are presented.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 157, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (246,1,'Electric Circuits Version 2','Electric circuits - batteries and resistors are presented through the study of Ohm\'s Law, electric currents, electric fields, voltage, current, resistance, AC and DC power.','246.xhtml','246.xhtml', MD5(CONCAT('246.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (246,246,1,'2010-09-01T02:07:24');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (158,2,'Electric Circuits Version 2-::of::-People\'s Physics Book Version 2','Electric circuits - batteries and resistors are presented through the study of Ohm\'s Law, electric currents, electric fields, voltage, current, resistance, AC and DC power.','Electric-Circuits-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:24');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (158, 158, 1, 0, '2010-09-01T02:07:24', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (158, 246);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 158, 14);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 158,id from BrowseTerms where encodedID = 'CKT.S.PHY.50.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 158,id from BrowseTerms where name='Electricity and Magnetism' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 158,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 158,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (158, 232);
INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Electric Circuits Version 2' ,'Electric Circuits Version 2','Electric circuits - batteries and resistors are presented through the study of Ohm\'s Law, electric currents, electric fields, voltage, current, resistance, AC and DC power.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 158, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (248,1,'Magnetism Version 2','Magnetism is studied through the concepts of electromagnetic force, the Coulomb electric force, electric current, magnetic fields, electricity, the right and left hand rules.','248.xhtml','248.xhtml', MD5(CONCAT('248.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (248,248,1,'2010-09-01T02:07:24');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (160,2,'Magnetism Version 2-::of::-People\'s Physics Book Version 2','Magnetism is studied through the concepts of electromagnetic force, the Coulomb electric force, electric current, magnetic fields, electricity, the right and left hand rules.','Magnetism-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:24');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (160, 160, 1, 0, '2010-09-01T02:07:24', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (160, 248);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 160, 16);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 160,id from BrowseTerms where name='Electricity and Magnetism' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 160,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 160,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (160, 232);
INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Magnetism Version 2' ,'Magnetism Version 2','Magnetism is studied through the concepts of electromagnetic force, the Coulomb electric force, electric current, magnetic fields, electricity, the right and left hand rules.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 160, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (249,1,'Electric Circuits: Advanced Topics','Students study advanced topics in electric circuits through the study of modern circuitry including diodes, inductors, transistors, operational amplifiers, and other chips.','249.xhtml','249.xhtml', MD5(CONCAT('249.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (249,249,1,'2010-09-01T02:07:24');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (161,2,'Electric Circuits: Advanced Topics-::of::-People\'s Physics Book Version 2','Students study advanced topics in electric circuits through the study of modern circuitry including diodes, inductors, transistors, operational amplifiers, and other chips.','Electric-Circuits:-Advanced-Topics-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:24');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (161, 161, 1, 0, '2010-09-01T02:07:24', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (161, 249);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 161, 17);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 161,id from BrowseTerms where name='Electric Circuits' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 161,id from BrowseTerms where name='Electricity and Magnetism' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 161,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 161,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (161, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Electric Circuits: Advanced Topics' ,'Electric Circuits: Advanced Topics','Students study advanced topics in electric circuits through the study of modern circuitry including diodes, inductors, transistors, operational amplifiers, and other chips.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 161, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (250,1,'Light Version 2','Light is studied through the concepts of light waves, electromagnetic radiation and fields, electrons, photons, Fermat’s Principle, refraction, diffraction, scattering and color absorption, and dispersion.','250.xhtml','250.xhtml', MD5(CONCAT('250.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (250,250,1,'2010-09-01T02:07:24');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (162,2,'Light Version 2-::of::-People\'s Physics Book Version 2','Light is studied through the concepts of light waves, electromagnetic radiation and fields, electrons, photons, Fermat’s Principle, refraction, diffraction, scattering and color absorption, and dispersion.','Light-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:24');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (162, 162, 1, 0, '2010-09-01T02:07:24', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (162, 250);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 162, 18);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 162,id from BrowseTerms where name='Sound and Light' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 162,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 162,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (162, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Light Version 2' ,'Light Version 2','Light is studied through the concepts of light waves, electromagnetic radiation and fields, electrons, photons, Fermat’s Principle, refraction, diffraction, scattering and color absorption, and dispersion.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 162, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (251,1,'Fluids Version 2','We study fluids and apply the concepts of force, momentum, and energy. The concept of conservation of energy density in place of conservation of energy is presented as well as Archimedes’ Principle, Pascal’s Principle, Bernoulli’s Principle.','251.xhtml','251.xhtml', MD5(CONCAT('251.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (251,251,1,'2010-09-01T02:07:24');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (163,2,'Fluids Version 2-::of::-People\'s Physics Book Version 2','We study fluids and apply the concepts of force, momentum, and energy. The concept of conservation of energy density in place of conservation of energy is presented as well as Archimedes’ Principle, Pascal’s Principle, Bernoulli’s Principle.','Fluids-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:24');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (163, 163, 1, 0, '2010-09-01T02:07:24', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (163, 251);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 163, 19);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 163,id from BrowseTerms where encodedID = 'CKT.S.PHY.20.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 163,id from BrowseTerms where encodedID = 'CKT.S.PHY.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 163,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 163,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (163, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Fluids Version 2' ,'Fluids Version 2','We study fluids and apply the concepts of force, momentum, and energy. The concept of conservation of energy density in place of conservation of energy is presented as well as Archimedes’ Principle, Pascal’s Principle, Bernoulli’s Principle.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 163, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (252,1,'Thermodynamics and Heat Engines Version 2','Thermodynamics and heat engine concepts are presented through the study of heat, molecular kinetic energy, energy transfer, laws of thermodynamics, temperature of a gas, Adiabatic process, entropy, and the first and second laws of thermodynamics.','252.xhtml','252.xhtml', MD5(CONCAT('252.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (252,252,1,'2010-09-01T02:07:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (164,2,'Thermodynamics and Heat Engines Version 2-::of::-People\'s Physics Book Version 2','Thermodynamics and heat engine concepts are presented through the study of heat, molecular kinetic energy, energy transfer, laws of thermodynamics, temperature of a gas, Adiabatic process, entropy, and the first and second laws of thermodynamics.','Thermodynamics-and-Heat-Engines-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (164, 164, 1, 0, '2010-09-01T02:07:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (164, 252);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 164, 20);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where encodedID = 'CKT.S.PHY.30.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where encodedID = 'CKT.S.PHY.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 164,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (164, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Thermodynamics and Heat Engines Version 2' ,'Thermodynamics and Heat Engines Version 2','Thermodynamics and heat engine concepts are presented through the study of heat, molecular kinetic energy, energy transfer, laws of thermodynamics, temperature of a gas, Adiabatic process, entropy, and the first and second laws of thermodynamics.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 164, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (253,1,'Gas Laws','','253.xhtml','253.xhtml', MD5(CONCAT('253.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (253,253,1,'2010-09-01T02:07:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (165,2,'Gas Laws-::of::-People\'s Physics Book Version 2','','Gas-Laws-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (165, 165, 1, 0, '2010-09-01T02:07:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (165, 253);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 165, 21);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 165,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 165,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (165, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Gas Laws' ,'Gas Laws',''  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 165, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (254,1,'Heat Engines and The Laws of Thermodynamics','','254.xhtml','254.xhtml', MD5(CONCAT('254.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (254,254,1,'2010-09-01T02:07:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (166,2,'Heat Engines and The Laws of Thermodynamics-::of::-People\'s Physics Book Version 2','','Heat-Engines-and-The-Laws-of-Thermodynamics-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (166, 166, 1, 0, '2010-09-01T02:07:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (166, 254);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 166, 22);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 166,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 166,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (166, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Heat Engines and The Laws of Thermodynamics' ,'Heat Engines and The Laws of Thermodynamics',''  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 166, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (255,1,'BCTherm','','255.xhtml','255.xhtml', MD5(CONCAT('255.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (255,255,1,'2010-09-01T02:07:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (167,2,'BCTherm-::of::-People\'s Physics Book Version 2','','BCTherm-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (167, 167, 1, 0, '2010-09-01T02:07:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (167, 255);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 167, 23);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 167,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 167,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (167, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'BCTherm' ,'BCTherm',''  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 167, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (256,1,'Special and General Relativity Version 2','Students are introduced to special and general relativity through Einstein\'s Theory of Relativity and concepts such as Lorentz time dilation and length contraction, the speed of light, curvature of spacetime, black holes, and event horizons.','256.xhtml','256.xhtml', MD5(CONCAT('256.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (256,256,1,'2010-09-01T02:07:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (168,2,'Special and General Relativity Version 2-::of::-People\'s Physics Book Version 2','Students are introduced to special and general relativity through Einstein\'s Theory of Relativity and concepts such as Lorentz time dilation and length contraction, the speed of light, curvature of spacetime, black holes, and event horizons.','Special-and-General-Relativity-Version-2-::of::-People\'s Physics Book Version 2',80,NULL, '2010-09-01T02:07:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (168, 168, 1, 0, '2010-09-01T02:07:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (168, 256);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 168, 24);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 168,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 168,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 168,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 168,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (168, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Special and General Relativity Version 2' ,'Special and General Relativity Version 2','Students are introduced to special and general relativity through Einstein\'s Theory of Relativity and concepts such as Lorentz time dilation and length contraction, the speed of light, curvature of spacetime, black holes, and event horizons.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 168, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (257,1,'Radioactivity and Nuclear Physics Version 2','Radioactivity and nuclear physics are introduced through the study of fission and fusion, alpha, beta, and gamma radiation, and radioactive decay.','257.xhtml','257.xhtml', MD5(CONCAT('257.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (257,257,1,'2010-09-01T02:07:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (169,2,'Radioactivity and Nuclear Physics Version 2-::of::-People\'s Physics Book Version 2','Radioactivity and nuclear physics are introduced through the study of fission and fusion, alpha, beta, and gamma radiation, and radioactive decay.','Radioactivity-and-Nuclear-Physics-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (169, 169, 1, 0, '2010-09-01T02:07:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (169, 257);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 169, 25);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 169,id from BrowseTerms where encodedID = 'CKT.S.PHY.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 169,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 169,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (169, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Radioactivity and Nuclear Physics Version 2' ,'Radioactivity and Nuclear Physics Version 2','Radioactivity and nuclear physics are introduced through the study of fission and fusion, alpha, beta, and gamma radiation, and radioactive decay.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 169, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (258,1,'Standard Model of Particle Physics Version 2','Particle physics is introduced through the concepts of matter, particles, subatomic particles, the Standard Model, CPT symmetry, fermions, bosons, leptons, quarks, and four fundamental forces in nature.','258.xhtml','258.xhtml', MD5(CONCAT('258.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (258,258,1,'2010-09-01T02:07:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (170,2,'Standard Model of Particle Physics Version 2-::of::-People\'s Physics Book Version 2','Particle physics is introduced through the concepts of matter, particles, subatomic particles, the Standard Model, CPT symmetry, fermions, bosons, leptons, quarks, and four fundamental forces in nature.','Standard-Model-of-Particle-Physics-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (170, 170, 1, 0, '2010-09-01T02:07:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (170, 258);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 170, 26);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 170,id from BrowseTerms where encodedID = 'CKT.S.PHY.20.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 170,id from BrowseTerms where name='Atomic and Nuclear Physics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 170,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 170,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (170, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Standard Model of Particle Physics Version 2' ,'Standard Model of Particle Physics Version 2','Particle physics is introduced through the concepts of matter, particles, subatomic particles, the Standard Model, CPT symmetry, fermions, bosons, leptons, quarks, and four fundamental forces in nature.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 170, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (259,1,'Feynman Diagrams Version 2','Feynman diagrams are used to calculate the probability of collisions, annihilations, or decays of particles. Drawing Feynman diagrams is the first step in visualizing and predicting the subatomic world.','259.xhtml','259.xhtml', MD5(CONCAT('259.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (259,259,1,'2010-09-01T02:07:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (171,2,'Feynman Diagrams Version 2-::of::-People\'s Physics Book Version 2','Feynman diagrams are used to calculate the probability of collisions, annihilations, or decays of particles. Drawing Feynman diagrams is the first step in visualizing and predicting the subatomic world.','Feynman-Diagrams-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (171, 171, 1, 0, '2010-09-01T02:07:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (171, 259);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 171, 27);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 171,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.70.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 171,id from BrowseTerms where name='Atomic and Nuclear Physics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 171,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 171,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (171, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Feynman Diagrams Version 2' ,'Feynman Diagrams Version 2','Feynman diagrams are used to calculate the probability of collisions, annihilations, or decays of particles. Drawing Feynman diagrams is the first step in visualizing and predicting the subatomic world.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 171, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (260,1,'Quantum Mechanics Version 2','This chapter introduces quantum mechanics, the description of how the universe works on the very small scale. The foundation of quantum mechanics was developed on the observation of wave-particle duality.','260.xhtml','260.xhtml', MD5(CONCAT('260.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (260,260,1,'2010-09-01T02:07:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (172,2,'Quantum Mechanics Version 2-::of::-People\'s Physics Book Version 2','This chapter introduces quantum mechanics, the description of how the universe works on the very small scale. The foundation of quantum mechanics was developed on the observation of wave-particle duality.','Quantum-Mechanics-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (172, 172, 1, 0, '2010-09-01T02:07:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (172, 260);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 172, 28);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 172,id from BrowseTerms where name='The Atomic Nature of Matter' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 172,id from BrowseTerms where name='Atomic and Nuclear Physics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 172,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 172,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (172, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Quantum Mechanics Version 2' ,'Quantum Mechanics Version 2','This chapter introduces quantum mechanics, the description of how the universe works on the very small scale. The foundation of quantum mechanics was developed on the observation of wave-particle duality.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 172, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (261,1,'The Physics of Global Warming Version 2','This chapter discusses the physics of global warming as a manifestation of the second law of thermodynamics, as well as solar radiation, terrestrial radiation, and global surface temperature.','261.xhtml','261.xhtml', MD5(CONCAT('261.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (261,261,1,'2010-09-01T02:07:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (173,2,'The Physics of Global Warming Version 2-::of::-People\'s Physics Book Version 2','This chapter discusses the physics of global warming as a manifestation of the second law of thermodynamics, as well as solar radiation, terrestrial radiation, and global surface temperature.','The-Physics-of-Global-Warming-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (173, 173, 1, 0, '2010-09-01T02:07:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (173, 261);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 173, 29);

INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, 'Temperature, Heat, and Expansion', 4,44 from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 173,max(id) from BrowseTerms;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 173,id from BrowseTerms where name='Heat' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 173,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 173,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (173, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'The Physics of Global Warming Version 2' ,'The Physics of Global Warming Version 2','This chapter discusses the physics of global warming as a manifestation of the second law of thermodynamics, as well as solar radiation, terrestrial radiation, and global surface temperature.'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 173, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (262,1,'Answers to Selected Problems Version 2','Supplemental materials','262.xhtml','262.xhtml', MD5(CONCAT('262.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (262,262,1,'2010-09-01T02:07:26');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (174,2,'Answers to Selected Problems Version 2-::of::-People\'s Physics Book Version 2','Supplemental materials','Answers-to-Selected-Problems-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:26');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (174, 174, 1, 0, '2010-09-01T02:07:26', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (174, 262);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 174, 30);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 174,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 174,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (174, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Answers to Selected Problems Version 2' ,'Answers to Selected Problems Version 2','Supplemental materials'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 174, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (263,1,'Equations and Fundamental Concepts Version 2','Supplemental materials','263.xhtml','263.xhtml', MD5(CONCAT('263.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (263,263,1,'2010-09-01T02:07:26');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (175,2,'Equations and Fundamental Concepts Version 2-::of::-People\'s Physics Book Version 2','Supplemental materials','Equations-and-Fundamental-Concepts-Version-2-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:26');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (175, 175, 1, 0, '2010-09-01T02:07:26', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (175, 263);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 175, 31);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 175,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 175,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (175, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Equations and Fundamental Concepts Version 2' ,'Equations and Fundamental Concepts Version 2','Supplemental materials'  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 175, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (264,1,'Random Walks 1','','264.xhtml','264.xhtml', MD5(CONCAT('264.xhtml', 'contents', 'Byron')), 80, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (264,264,1,'2010-09-01T02:07:26');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (176,2,'Random Walks 1-::of::-People\'s Physics Book Version 2','','Random-Walks-1-::of::-People\'s-Physics-Book-Version-2',80,NULL, '2010-09-01T02:07:26');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (176, 176, 1, 0, '2010-09-01T02:07:26', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (176, 264);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (144, 176, 32);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 176,id from BrowseTerms where name='physics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 176,id from BrowseTerms where name='ca' and termTypeID = 1 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (176, 232);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 6 , 'Random Walks 1' ,'Random Walks 1',''  from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 176, max(id) from `Standards`;
