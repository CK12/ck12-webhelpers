insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`) values (117,1,'CK-12 Earth Science','CK-12 Earth Science covers the study of Earth - its minerals and energy resources, processes inside and on its surface, its past, water, weather and climate, the environment and human actions, and astronomy.','CK-12-Earth-Science',1, NULL, '2010-09-01T04:43:48');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (117, 117, 1, 0, '2010-09-01T04:43:48', '2010-01-01T12:12:27Z');
INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (203,2,'book_cover_image','Cover page image for the book','CK12_Earth_Science.png','CK12_Earth_Science.png', MD5(CONCAT('CK12_Earth_Science.png', 'cover page', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (203,203,1,'2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (117, 203);

INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (204,2,'chapter_cover_image','Cover page image for the chapter','chapter_cover_earth.png','chapter_cover_earth.png', MD5(CONCAT('chapter_cover_earth.png', 'cover page', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (204,204,1,'2010-01-01T12:12:27Z');
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (205,1,'What is Earth Science?','This chapter covers the scientific method and the various branches of Earth Science.','205.xhtml','205.xhtml', MD5(CONCAT('205.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (205,205,1,'2010-09-01T04:43:54');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (118,2,'What is Earth Science?-::of::-CK-12 Earth Science','This chapter covers the scientific method and the various branches of Earth Science.','What-is-Earth-Science?-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:43:54');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (118, 118, 1, 0, '2010-09-01T04:43:54', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (118, 205);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 118, 1);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where encodedID = 'CKT.S.ES.10.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where encodedID = 'CKT.S.ES.10.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='Nature of Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where encodedID = 'CKT.S.ES.10.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where encodedID = 'CKT.S.ES.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where encodedID = 'CKT.S.ES.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where encodedID = 'CKT.S.ES.130';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where encodedID = 'CKT.S.ES.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where encodedID = 'CKT.S.ES';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 118,id from BrowseTerms where name='eight' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (118, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'What is Earth Science?' ,'What is Earth Science?','This chapter covers the scientific method and the various branches of Earth Science.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 118, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (206,1,'Studying Earth\'s Surface','This chapter informs students about different types of landforms on Earth, map projections, and the use of computers and satellites to study and understand Earth\'s surface.','206.xhtml','206.xhtml', MD5(CONCAT('206.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (206,206,1,'2010-09-01T04:43:56');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (119,2,'Studying Earth\'s Surface-::of::-CK-12 Earth Science','This chapter informs students about different types of landforms on Earth, map projections, and the use of computers and satellites to study and understand Earth\'s surface.','Studying-Earth\'s-Surface-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:43:56');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (119, 119, 1, 0, '2010-09-01T04:43:56', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (119, 206);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 119, 2);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where encodedID = 'CKT.S.ES.20.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where encodedID = 'CKT.S.ES.20.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where encodedID = 'CKT.S.ES.20.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='Earth\'s Surface' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where encodedID = 'CKT.S.PS.210.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where encodedID = 'CKT.S.ES.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 119,id from BrowseTerms where name='seven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (119, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Studying Earth\'s Surface' ,'Studying Earth’s Surface','This chapter informs students about different types of landforms on Earth, map projections, and the use of computers and satellites to study and understand Earth\'s surface.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 119, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (207,1,'Earth\'s Minerals','This chapter covers types of minerals and how they form, how to identify minerals using their physical properties as well as the various ways minerals form and are used as resources.','207.xhtml','207.xhtml', MD5(CONCAT('207.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (207,207,1,'2010-09-01T04:43:57');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (120,2,'Earth\'s Minerals-::of::-CK-12 Earth Science','This chapter covers types of minerals and how they form, how to identify minerals using their physical properties as well as the various ways minerals form and are used as resources.','Earth\'s-Minerals-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:43:57');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (120, 120, 1, 0, '2010-09-01T04:43:57', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (120, 207);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 120, 3);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where encodedID = 'CKT.S.ES.20.60.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where encodedID = 'CKT.S.ES.20.60.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='Characteristics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where encodedID = 'CKT.S.ES.20.60';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 120,id from BrowseTerms where name='eight' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (120, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Earth\'s Minerals' ,'Earth\'s Minerals','This chapter covers types of minerals and how they form, how to identify minerals using their physical properties as well as the various ways minerals form and are used as resources.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 120, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (208,1,'Rocks','This chapter discusses the rock cycle and each of the three major types of rocks that form on Earth. Separate sections cover igneous, sedimentary, and metamorphic rocks individually.','208.xhtml','208.xhtml', MD5(CONCAT('208.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (208,208,1,'2010-09-01T04:43:57');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (121,2,'Rocks-::of::-CK-12 Earth Science','This chapter discusses the rock cycle and each of the three major types of rocks that form on Earth. Separate sections cover igneous, sedimentary, and metamorphic rocks individually.','Rocks-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:43:57');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (121, 121, 1, 0, '2010-09-01T04:43:57', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (121, 208);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 121, 4);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where encodedID = 'CKT.S.ES.20.70.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where encodedID = 'CKT.S.ES.20.70.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where encodedID = 'CKT.S.ES.20.70.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where encodedID = 'CKT.S.ES.20.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 121,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (121, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Rocks' ,'Rocks','This chapter discusses the rock cycle and each of the three major types of rocks that form on Earth. Separate sections cover igneous, sedimentary, and metamorphic rocks individually.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 121, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (209,1,'Earth\'s Energy','This chapter discusses available nonrenewable and renewable resources, including resources such as fossil fuels, nuclear energy and solar, wind and water power.','209.xhtml','209.xhtml', MD5(CONCAT('209.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (209,209,1,'2010-09-01T04:43:58');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (122,2,'Earth\'s Energy-::of::-CK-12 Earth Science','This chapter discusses available nonrenewable and renewable resources, including resources such as fossil fuels, nuclear energy and solar, wind and water power.','Earth\'s-Energy-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:43:58');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (122, 122, 1, 0, '2010-09-01T04:43:58', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (122, 209);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 122, 5);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where encodedID = 'CKT.S.ES.20.80.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where encodedID = 'CKT.S.ES.20.80.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where encodedID = 'CKT.S.ES.20.80.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where encodedID = 'CKT.S.PHY.10.70.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 122,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (122, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Earth\'s Energy' ,'Earth\'s Energy','This chapter discusses available nonrenewable and renewable resources, including resources such as fossil fuels, nuclear energy and solar, wind and water power.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 122, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (210,1,'Plate Tectonics','This chapter covers properties of Earth\'s interior, continental drift, seafloor spreading, theories of plate tectonic movement, plate boundaries, and landforms.','210.xhtml','210.xhtml', MD5(CONCAT('210.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (210,210,1,'2010-09-01T04:43:58');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (123,2,'Plate Tectonics-::of::-CK-12 Earth Science','This chapter covers properties of Earth\'s interior, continental drift, seafloor spreading, theories of plate tectonic movement, plate boundaries, and landforms.','Plate-Tectonics-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:43:58');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (123, 123, 1, 0, '2010-09-01T04:43:58', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (123, 210);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 123, 6);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where encodedID = 'CKT.S.ES.20.90.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where encodedID = 'CKT.S.ES.20.90.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='Earth\'s Interior' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where encodedID = 'CKT.S.ES.20.90.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where encodedID = 'CKT.S.ES.90.20.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='Earth' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 123,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (123, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Plate Tectonics' ,'Plate Tectonics','This chapter covers properties of Earth\'s interior, continental drift, seafloor spreading, theories of plate tectonic movement, plate boundaries, and landforms.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 123, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (211,1,'Earthquakes','The chapter begins with discussion of stresses on rocks and mountain building. Understanding the causes of earthquakes, seismic waves, tsunami and ways to predict earthquakes are followed by information about staying safe during an earthquake.','211.xhtml','211.xhtml', MD5(CONCAT('211.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (211,211,1,'2010-09-01T04:43:58');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (124,2,'Earthquakes-::of::-CK-12 Earth Science','The chapter begins with discussion of stresses on rocks and mountain building. Understanding the causes of earthquakes, seismic waves, tsunami and ways to predict earthquakes are followed by information about staying safe during an earthquake.','Earthquakes-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:43:58');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (124, 124, 1, 0, '2010-09-01T04:43:58', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (124, 211);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 124, 7);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where encodedID = 'CKT.S.ES.20.100';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='Earth' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 124,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (124, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Earthquakes' ,'Earthquakes','The chapter begins with discussion of stresses on rocks and mountain building. Understanding the causes of earthquakes, seismic waves, tsunami and ways to predict earthquakes are followed by information about staying safe during an earthquake.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 124, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (212,1,'Volcanoes','The chapter considers how and where volcanoes form, types of magma and consequent types of eruptions, as well as different volcanic landforms associated with each.','212.xhtml','212.xhtml', MD5(CONCAT('212.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (212,212,1,'2010-09-01T04:43:59');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (125,2,'Volcanoes-::of::-CK-12 Earth Science','The chapter considers how and where volcanoes form, types of magma and consequent types of eruptions, as well as different volcanic landforms associated with each.','Volcanoes-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:43:59');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (125, 125, 1, 0, '2010-09-01T04:43:59', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (125, 212);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 125, 8);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where encodedID = 'CKT.S.ES.20.110';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='Earth' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 125,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (125, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Volcanoes' ,'Volcanoes','The chapter considers how and where volcanoes form, types of magma and consequent types of eruptions, as well as different volcanic landforms associated with each.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 125, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (213,1,'Weathering and Formation of Soil','This chapter begins with a discussion of mechanical and chemical weathering of rock. These concepts are applied to the formation of soil, soil horizons, and different climates related soils.','213.xhtml','213.xhtml', MD5(CONCAT('213.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (213,213,1,'2010-09-01T04:43:59');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (126,2,'Weathering and Formation of Soil-::of::-CK-12 Earth Science','This chapter begins with a discussion of mechanical and chemical weathering of rock. These concepts are applied to the formation of soil, soil horizons, and different climates related soils.','Weathering-and-Formation-of-Soil-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:43:59');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (126, 126, 1, 0, '2010-09-01T04:43:59', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (126, 213);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 126, 9);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where encodedID = 'CKT.S.ES.20.120';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where encodedID = 'CKT.S.ES.20.130';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='Earth' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 126,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (126, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Weathering and Formation of Soil' ,'Weathering and Formation of Soil','This chapter begins with a discussion of mechanical and chemical weathering of rock. These concepts are applied to the formation of soil, soil horizons, and different climates related soils.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 126, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (214,1,'Erosion and Deposition','Erosion and Deposition considers how these processes shape Earth\'s surface through the actions of rivers, streams, groundwater, wind, waves, glaciers, and gravity.','214.xhtml','214.xhtml', MD5(CONCAT('214.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (214,214,1,'2010-09-01T04:43:59');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (127,2,'Erosion and Deposition-::of::-CK-12 Earth Science','Erosion and Deposition considers how these processes shape Earth\'s surface through the actions of rivers, streams, groundwater, wind, waves, glaciers, and gravity.','Erosion-and-Deposition-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:43:59');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (127, 127, 1, 0, '2010-09-01T04:43:59', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (127, 214);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 127, 10);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where encodedID = 'CKT.S.ES.20.140.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where encodedID = 'CKT.S.ES.20.140.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where encodedID = 'CKT.S.ES.20.140.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where encodedID = 'CKT.S.ES.20.140.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where encodedID = 'CKT.S.ES.20.140.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where encodedID = 'CKT.S.ES.20.140';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 127,id from BrowseTerms where name='eight' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (127, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Erosion and Deposition' ,'Erosion and Deposition','Erosion and Deposition considers how these processes shape Earth\'s surface through the actions of rivers, streams, groundwater, wind, waves, glaciers, and gravity.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 127, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (215,1,'Evidence About Earth\'s Past','This chapter discusses different modes of fossilization, correlation of rock units using relative age dating methods, and absolute age dating of rocks.','215.xhtml','215.xhtml', MD5(CONCAT('215.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (215,215,1,'2010-09-01T04:44:00');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (128,2,'Evidence About Earth\'s Past-::of::-CK-12 Earth Science','This chapter discusses different modes of fossilization, correlation of rock units using relative age dating methods, and absolute age dating of rocks.','Evidence-About-Earth\'s-Past-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:00');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (128, 128, 1, 0, '2010-09-01T04:44:00', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (128, 215);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 128, 11);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where encodedID = 'CKT.S.ES.30.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where encodedID = 'CKT.S.ES.30.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where encodedID = 'CKT.S.ES.30.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='Earth\'s Past' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 128,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (128, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Evidence About Earth\'s Past' ,'Evidence About Earth\'s Past','This chapter discusses different modes of fossilization, correlation of rock units using relative age dating methods, and absolute age dating of rocks.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 128, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (216,1,'Earth\'s History','This chapter discusses the geologic time scale, the development of Earth from early in its history through today, and the evolution of life on Earth.','216.xhtml','216.xhtml', MD5(CONCAT('216.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (216,216,1,'2010-09-01T04:44:00');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (129,2,'Earth\'s History-::of::-CK-12 Earth Science','This chapter discusses the geologic time scale, the development of Earth from early in its history through today, and the evolution of life on Earth.','Earth\'s-History-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:00');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (129, 129, 1, 0, '2010-09-01T04:44:00', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (129, 216);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 129, 12);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where encodedID = 'CKT.S.ES.40.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='Geologic Time Scale' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where encodedID = 'CKT.S.ES.40.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='Earth\'s History' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 129,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (129, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Earth\'s History' ,'Earth\'s History','This chapter discusses the geologic time scale, the development of Earth from early in its history through today, and the evolution of life on Earth.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 129, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (217,1,'Earth\'s Fresh Water','This chapter considers the water cycle and develops student understanding of our lakes, rivers, streams, and groundwater.','217.xhtml','217.xhtml', MD5(CONCAT('217.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (217,217,1,'2010-09-01T04:44:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (130,2,'Earth\'s Fresh Water-::of::-CK-12 Earth Science','This chapter considers the water cycle and develops student understanding of our lakes, rivers, streams, and groundwater.','Earth\'s-Fresh-Water-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (130, 130, 1, 0, '2010-09-01T04:44:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (130, 217);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 130, 13);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where encodedID = 'CKT.S.ES.50.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where encodedID = 'CKT.S.ES.50.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where encodedID = 'CKT.S.ES.50.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='Water' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 130,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (130, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Earth\'s Fresh Water' ,'Earth\'s Fresh Water','This chapter considers the water cycle and develops student understanding of our lakes, rivers, streams, and groundwater.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 130, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (218,1,'Earth\'s Oceans','This chapter discusses how Earth\'s oceans were formed, the composition of ocean water, as well as the action of waves and tides. Discussion continues with descriptions of the various areas of the seafloor and types of ocean life.','218.xhtml','218.xhtml', MD5(CONCAT('218.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (218,218,1,'2010-09-01T04:44:03');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (131,2,'Earth\'s Oceans-::of::-CK-12 Earth Science','This chapter discusses how Earth\'s oceans were formed, the composition of ocean water, as well as the action of waves and tides. Discussion continues with descriptions of the various areas of the seafloor and types of ocean life.','Earth\'s-Oceans-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:03');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (131, 131, 1, 0, '2010-09-01T04:44:03', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (131, 218);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 131, 14);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where encodedID = 'CKT.S.ES.60.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where encodedID = 'CKT.S.ES.60.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where encodedID = 'CKT.S.ES.60.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where encodedID = 'CKT.S.ES.60.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where encodedID = 'CKT.S.ES.60.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where encodedID = 'CKT.S.ES.60';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 131,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (131, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Earth\'s Oceans' ,'Earth\'s Oceans','This chapter discusses how Earth\'s oceans were formed, the composition of ocean water, as well as the action of waves and tides. Discussion continues with descriptions of the various areas of the seafloor and types of ocean life.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 131, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (219,1,'Earth\'s Atmosphere','This chapter covers the properties, significance, and layers of the Earth’s atmosphere, how energy transfers within our atmosphere, and movement of air throughout our atmosphere and over the Earth’s surface.','219.xhtml','219.xhtml', MD5(CONCAT('219.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (219,219,1,'2010-09-01T04:44:04');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (132,2,'Earth\'s Atmosphere-::of::-CK-12 Earth Science','This chapter covers the properties, significance, and layers of the Earth’s atmosphere, how energy transfers within our atmosphere, and movement of air throughout our atmosphere and over the Earth’s surface.','Earth\'s-Atmosphere-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:04');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (132, 132, 1, 0, '2010-09-01T04:44:04', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (132, 219);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 132, 15);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='Energy' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where encodedID = 'CKT.S.ES.70.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where encodedID = 'CKT.S.ES.70.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where encodedID = 'CKT.S.ES.70.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where encodedID = 'CKT.S.PHY.20.40.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 132,id from BrowseTerms where name='eight' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (132, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Earth\'s Atmosphere' ,'Earth\'s Atmosphere','This chapter covers the properties, significance, and layers of the Earth’s atmosphere, how energy transfers within our atmosphere, and movement of air throughout our atmosphere and over the Earth’s surface.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 132, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (220,1,'Weather','This chapter considers various factors of weather, cloud types, movement of air masses, and the development of different types of storms. Discussion concludes with weather forecasting using various tools, maps, and models.','220.xhtml','220.xhtml', MD5(CONCAT('220.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (220,220,1,'2010-09-01T04:44:04');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (133,2,'Weather-::of::-CK-12 Earth Science','This chapter considers various factors of weather, cloud types, movement of air masses, and the development of different types of storms. Discussion concludes with weather forecasting using various tools, maps, and models.','Weather-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:04');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (133, 133, 1, 0, '2010-09-01T04:44:04', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (133, 220);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 133, 16);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.20.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.20.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.20.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.20.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.20.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.20.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.ES.80.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where encodedID = 'CKT.S.PS.260.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 133,id from BrowseTerms where name='eight' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (133, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Weather' ,'Weather','This chapter considers various factors of weather, cloud types, movement of air masses, and the development of different types of storms. Discussion concludes with weather forecasting using various tools, maps, and models.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 133, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (221,1,'Climate','The chapter considers how the different factors of Earth\'s dynamic surface affect climate, the different climates found worldwide, and the causes and impacts of climate change.','221.xhtml','221.xhtml', MD5(CONCAT('221.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (221,221,1,'2010-09-01T04:44:05');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (134,2,'Climate-::of::-CK-12 Earth Science','The chapter considers how the different factors of Earth\'s dynamic surface affect climate, the different climates found worldwide, and the causes and impacts of climate change.','Climate-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:05');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (134, 134, 1, 0, '2010-09-01T04:44:05', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (134, 221);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 134, 17);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where encodedID = 'CKT.S.ES.90.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='Plate Tectonics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where encodedID = 'CKT.S.ES.90.20.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where encodedID = 'CKT.S.ES.90.20.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where encodedID = 'CKT.S.ES.90.20.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where encodedID = 'CKT.S.ES.90.20.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='Climate Change' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where encodedID = 'CKT.S.PS.260.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 134,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (134, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Climate' ,'Climate','The chapter considers how the different factors of Earth\'s dynamic surface affect climate, the different climates found worldwide, and the causes and impacts of climate change.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 134, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (222,1,'Ecosystems and Human Populations','This chapter considers the role of ecosystems, including how matter and energy flow through ecosystems, the carbon cycle and how our human population growth affects our global ecosystem.','222.xhtml','222.xhtml', MD5(CONCAT('222.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (222,222,1,'2010-09-01T04:44:05');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (135,2,'Ecosystems and Human Populations-::of::-CK-12 Earth Science','This chapter considers the role of ecosystems, including how matter and energy flow through ecosystems, the carbon cycle and how our human population growth affects our global ecosystem.','Ecosystems-and-Human-Populations-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:05');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (135, 135, 1, 0, '2010-09-01T04:44:05', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (135, 222);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 135, 18);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where encodedID = 'CKT.S.ES.110';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='Ecosystems' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 135,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (135, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Ecosystems and Human Populations' ,'Ecosystems and Human Populations','This chapter considers the role of ecosystems, including how matter and energy flow through ecosystems, the carbon cycle and how our human population growth affects our global ecosystem.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 135, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (223,1,'Human Actions and the Land','This chapter discusses causes and prevention of soil erosion, as well as ways that humans have polluted our land surface with hazardous materials, and what can be done to prevent this type of pollution.','223.xhtml','223.xhtml', MD5(CONCAT('223.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (223,223,1,'2010-09-01T04:44:06');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (136,2,'Human Actions and the Land-::of::-CK-12 Earth Science','This chapter discusses causes and prevention of soil erosion, as well as ways that humans have polluted our land surface with hazardous materials, and what can be done to prevent this type of pollution.','Human-Actions-and-the-Land-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:06');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (136, 136, 1, 0, '2010-09-01T04:44:06', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (136, 223);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 136, 19);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where encodedID = 'CKT.S.ES.120.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='Human Actions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 136,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (136, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Human Actions and the Land' ,'Human Actions and the Land','This chapter discusses causes and prevention of soil erosion, as well as ways that humans have polluted our land surface with hazardous materials, and what can be done to prevent this type of pollution.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 136, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (224,1,'Human Actions and Earth\'s Resources','This chapter considers human use of renewable and nonrenewable resources, availability and conservation of resources, as well as ways to conserve energy and use energy more efficiently.','224.xhtml','224.xhtml', MD5(CONCAT('224.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (224,224,1,'2010-09-01T04:44:06');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (137,2,'Human Actions and Earth\'s Resources-::of::-CK-12 Earth Science','This chapter considers human use of renewable and nonrenewable resources, availability and conservation of resources, as well as ways to conserve energy and use energy more efficiently.','Human-Actions-and-Earth\'s-Resources-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:06');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (137, 137, 1, 0, '2010-09-01T04:44:06', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (137, 224);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 137, 20);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='Earth\'s Resources' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='Human Actions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 137,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (137, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Human Actions and Earth\'s Resources' ,'Human Actions and Earth\'s Resources','This chapter considers human use of renewable and nonrenewable resources, availability and conservation of resources, as well as ways to conserve energy and use energy more efficiently.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 137, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (225,1,'Human Actions and Earth\'s Waters','This chapter discusses many ways that water is used, the distribution of water on Earth, as well as types and sources of water pollution, and ways to protect our precious water supplies.','225.xhtml','225.xhtml', MD5(CONCAT('225.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (225,225,1,'2010-09-01T04:44:06');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (138,2,'Human Actions and Earth\'s Waters-::of::-CK-12 Earth Science','This chapter discusses many ways that water is used, the distribution of water on Earth, as well as types and sources of water pollution, and ways to protect our precious water supplies.','Human-Actions-and-Earth\'s-Waters-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:06');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (138, 138, 1, 0, '2010-09-01T04:44:06', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (138, 225);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 138, 21);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='Earth\'s Waters' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='Human Actions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 138,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (138, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Human Actions and Earth\'s Waters' ,'Human Actions and Earth\'s Waters','This chapter discusses many ways that water is used, the distribution of water on Earth, as well as types and sources of water pollution, and ways to protect our precious water supplies.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 138, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (226,1,'Human Actions and the Atmosphere','This chapter discusses types of air pollution and their causes, the effects of air pollution, and ways to reduce air pollution.','226.xhtml','226.xhtml', MD5(CONCAT('226.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (226,226,1,'2010-09-01T04:44:06');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (139,2,'Human Actions and the Atmosphere-::of::-CK-12 Earth Science','This chapter discusses types of air pollution and their causes, the effects of air pollution, and ways to reduce air pollution.','Human-Actions-and-the-Atmosphere-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:06');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (139, 139, 1, 0, '2010-09-01T04:44:06', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (139, 226);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 139, 22);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where encodedID = 'CKT.S.ES.120.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='Human Actions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 139,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (139, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Human Actions and the Atmosphere' ,'Human Actions and the Atmosphere','This chapter discusses types of air pollution and their causes, the effects of air pollution, and ways to reduce air pollution.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 139, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (227,1,'Observing and Exploring Space','This chapter begins with a discussion of electromagnetic radiation, types of telescopes, and ways of gathering information from our universe. Information about recent and current space exploration concludes this chapter.','227.xhtml','227.xhtml', MD5(CONCAT('227.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (227,227,1,'2010-09-01T04:44:07');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (140,2,'Observing and Exploring Space-::of::-CK-12 Earth Science','This chapter begins with a discussion of electromagnetic radiation, types of telescopes, and ways of gathering information from our universe. Information about recent and current space exploration concludes this chapter.','Observing-and-Exploring-Space-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:07');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (140, 140, 1, 0, '2010-09-01T04:44:07', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (140, 227);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 140, 23);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where encodedID = 'CKT.S.ES.130.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='Astronomy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 140,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (140, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Observing and Exploring Space' ,'Observing and Exploring Space','This chapter begins with a discussion of electromagnetic radiation, types of telescopes, and ways of gathering information from our universe. Information about recent and current space exploration concludes this chapter.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 140, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (228,1,'Earth, Moon, and Sun','This chapter discusses the basic properties and motions of the Earth, Moon, and Sun, including information about tides and eclipses. Discussion includes information about the Sun\'s layers and solar activity.','228.xhtml','228.xhtml', MD5(CONCAT('228.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (228,228,1,'2010-09-01T04:44:07');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (141,2,'Earth, Moon, and Sun-::of::-CK-12 Earth Science','This chapter discusses the basic properties and motions of the Earth, Moon, and Sun, including information about tides and eclipses. Discussion includes information about the Sun\'s layers and solar activity.','Earth,-Moon,-and-Sun-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:07');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (141, 141, 1, 0, '2010-09-01T04:44:07', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (141, 228);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 141, 24);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where encodedID = 'CKT.S.ES.130.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where encodedID = 'CKT.S.ES.130.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where encodedID = 'CKT.S.ES.130.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='Astronomy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 141,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (141, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Earth, Moon, and Sun' ,'Earth, Moon, and Sun','This chapter discusses the basic properties and motions of the Earth, Moon, and Sun, including information about tides and eclipses. Discussion includes information about the Sun\'s layers and solar activity.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 141, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (229,1,'The Solar System','This chapter covers the motion of the planets, formation of our solar system, plus characteristics and properties of the inner and outer planets, as well as dwarf planets, meteors, asteroids, and comets.','229.xhtml','229.xhtml', MD5(CONCAT('229.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (229,229,1,'2010-09-01T04:44:08');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (142,2,'The Solar System-::of::-CK-12 Earth Science','This chapter covers the motion of the planets, formation of our solar system, plus characteristics and properties of the inner and outer planets, as well as dwarf planets, meteors, asteroids, and comets.','The-Solar-System-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:08');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (142, 142, 1, 0, '2010-09-01T04:44:08', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (142, 229);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 142, 25);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where encodedID = 'CKT.S.ES.130.50';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='Astronomy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='six' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 142,id from BrowseTerms where name='seven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (142, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'The Solar System' ,'The Solar System','This chapter covers the motion of the planets, formation of our solar system, plus characteristics and properties of the inner and outer planets, as well as dwarf planets, meteors, asteroids, and comets.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 142, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (230,1,'Stars, Galaxies, and the Universe','This chapter covers constellations, how stars produce light and energy, classification of stars, and stellar evolution. Groupings of stars, types of galaxies, dark matter, dark energy, and the Big Bang Theory are also included.','230.xhtml','230.xhtml', MD5(CONCAT('230.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (230,230,1,'2010-09-01T04:44:08');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (143,2,'Stars, Galaxies, and the Universe-::of::-CK-12 Earth Science','This chapter covers constellations, how stars produce light and energy, classification of stars, and stellar evolution. Groupings of stars, types of galaxies, dark matter, dark energy, and the Big Bang Theory are also included.','Stars,-Galaxies,-and-the-Universe-::of::-CK-12-Earth-Science',1,NULL, '2010-09-01T04:44:08');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (143, 143, 1, 0, '2010-09-01T04:44:08', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (143, 230);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (117, 143, 26);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where encodedID = 'CKT.S.PS.260.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where encodedID = 'CKT.S.ES.130.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where encodedID = 'CKT.S.ES.130.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='Astronomy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='Earth Science' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='science' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='8' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='viii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='eight' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='7' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='vii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='seven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='6' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='vi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 143,id from BrowseTerms where name='six' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (143, 204);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 7 , 'Stars, Galaxies, and the Universe' ,'Stars, Galaxies, and the Universe','This chapter covers constellations, how stars produce light and energy, classification of stars, and stellar evolution. Groupings of stars, types of galaxies, dark matter, dark energy, and the Big Bang Theory are also included.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 9 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 8 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 7 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 143, max(id) from `Standards`;
