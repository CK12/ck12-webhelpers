insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`) values (191,1,'CK-12 Chemistry','CK-12 Chemistry covers Matter, Atomic Structure; The Elements and Their Properties; Stoichiometry; Chemical Kinetics; Physical States of Matter; Thermodynamics; Nuclear Chemistry; and Organic Chemistry.','CK-12-Chemistry',3, NULL, '2010-09-01T02:07:50');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (191, 191, 1, 0, '2010-09-01T02:07:50', '2010-01-01T12:12:27Z');
INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (280,2,'book_cover_image','Cover page image for the book','CK12_Chemistry.png','CK12_Chemistry.png', MD5(CONCAT('CK12_Chemistry.png', 'cover page', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (280,280,1,'2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (191, 280);

INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (281,2,'chapter_cover_image','Cover page image for the chapter','chapter_cover_chemistry.png','chapter_cover_chemistry.png', MD5(CONCAT('chapter_cover_chemistry.png', 'cover page', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (281,281,1,'2010-01-01T12:12:27Z');
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (282,1,'The Science of Chemistry','This chapter details the scientific method while the core of the chapter gives a brief history of chemistry and introduces the concepts of matter and energy.','282.xhtml','282.xhtml', MD5(CONCAT('282.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (282,282,1,'2010-09-01T02:07:53');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (192,2,'The Science of Chemistry-::of::-CK-12 Chemistry','This chapter details the scientific method while the core of the chapter gives a brief history of chemistry and introduces the concepts of matter and energy.','The-Science-of-Chemistry-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:53');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (192, 192, 1, 0, '2010-09-01T02:07:53', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (192, 282);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 192, 1);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where encodedID = 'CKT.S.CHEM.10.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where encodedID = 'CKT.S.CHEM.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where encodedID = 'CKT.S.CHEM.10.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where encodedID = 'CKT.S.CHEM.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where encodedID = 'CKT.S.CHEM.10.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='Scientific Method' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='Science' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 192,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (192, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'The Science of Chemistry' ,'The Science of Chemistry','This chapter details the scientific method while the core of the chapter gives a brief history of chemistry and introduces the concepts of matter and energy.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 192, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (283,1,'Chemistry - A Physical Science','This chapter covers measurement and the mathematics of measurement and formulas.','283.xhtml','283.xhtml', MD5(CONCAT('283.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (283,283,1,'2010-09-01T02:07:54');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (193,2,'Chemistry - A Physical Science-::of::-CK-12 Chemistry','This chapter covers measurement and the mathematics of measurement and formulas.','Chemistry---A-Physical-Science-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:54');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (193, 193, 1, 0, '2010-09-01T02:07:54', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (193, 283);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 193, 2);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where encodedID = 'CKT.S.CHEM.20.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where encodedID = 'CKT.S.CHEM.20.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where encodedID = 'CKT.S.CHEM.20.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where encodedID = 'CKT.S.CHEM.20.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where encodedID = 'CKT.S.CHEM.20.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='Measurement' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 193,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (193, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Chemistry - A Physical Science' ,'Chemistry - A Physical Science','This chapter covers measurement and the mathematics of measurement and formulas.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 193, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (284,1,'Chemistry in the Laboratory','This chapter covers qualitative versus quantitative observation and data handling techniques.','284.xhtml','284.xhtml', MD5(CONCAT('284.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (284,284,1,'2010-09-01T02:07:54');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (194,2,'Chemistry in the Laboratory-::of::-CK-12 Chemistry','This chapter covers qualitative versus quantitative observation and data handling techniques.','Chemistry-in-the-Laboratory-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:54');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (194, 194, 1, 0, '2010-09-01T02:07:54', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (194, 284);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 194, 3);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where encodedID = 'CKT.S.CHEM.210.90';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where encodedID = 'CKT.S.CHEM.20.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where encodedID = 'CKT.S.PS.10.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='Accuracy and precision' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='Measurement' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 194,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (194, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Chemistry in the Laboratory' ,'Chemistry in the Laboratory','This chapter covers qualitative versus quantitative observation and data handling techniques.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 194, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (285,1,'Atomic Theory','The various models of the atom are developed from Dalton through Rutherford. This chapter also covers basic atomic structure and sub-atomic particles.','285.xhtml','285.xhtml', MD5(CONCAT('285.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (285,285,1,'2010-09-01T02:07:54');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (195,2,'Atomic Theory-::of::-CK-12 Chemistry','The various models of the atom are developed from Dalton through Rutherford. This chapter also covers basic atomic structure and sub-atomic particles.','Atomic-Theory-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:54');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (195, 195, 1, 0, '2010-09-01T02:07:54', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (195, 285);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 195, 4);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.20.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.20.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.20.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.20.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.20.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.30.10.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.30.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.30.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.30.10.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='Elements' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.30.10.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='Compounds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='Matter' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.30.20.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.30.20.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.30.20.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.30.20.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='Heat' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.CHEM.30.20.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='Energy' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where encodedID = 'CKT.S.PS.110.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 195,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (195, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Atomic Theory' ,'Atomic Theory','The various models of the atom are developed from Dalton through Rutherford. This chapter also covers basic atomic structure and sub-atomic particles.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 195, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (286,1,'The Bohr Model','This chapter introduces electromagnetic radiation, atomic spectra, and their roles in the development of the Bohr model of the atom.','286.xhtml','286.xhtml', MD5(CONCAT('286.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (286,286,1,'2010-09-01T02:07:55');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (196,2,'The Bohr Model-::of::-CK-12 Chemistry','This chapter introduces electromagnetic radiation, atomic spectra, and their roles in the development of the Bohr model of the atom.','The-Bohr-Model-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:55');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (196, 196, 1, 0, '2010-09-01T02:07:55', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (196, 286);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 196, 5);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.10.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='History' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.30.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='Electromagnetic Radiation' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.30.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 196,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (196, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'The Bohr Model' ,'The Bohr Model','This chapter introduces electromagnetic radiation, atomic spectra, and their roles in the development of the Bohr model of the atom.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 196, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (287,1,'Quantum Mechanics Model of the Atom','This chapter covers the quantum mechanical model of the atom, energy waves, standing waves, Heisenberg’s uncertainty principle, and Schrödinger’s equation. Quantum numbers, energy levels, energy sub-levels, and orbital shapes are introduced.','287.xhtml','287.xhtml', MD5(CONCAT('287.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (287,287,1,'2010-09-01T02:07:55');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (197,2,'Quantum Mechanics Model of the Atom-::of::-CK-12 Chemistry','This chapter covers the quantum mechanical model of the atom, energy waves, standing waves, Heisenberg’s uncertainty principle, and Schrödinger’s equation. Quantum numbers, energy levels, energy sub-levels, and orbital shapes are introduced.','Quantum-Mechanics-Model-of-the-Atom-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:55');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (197, 197, 1, 0, '2010-09-01T02:07:55', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (197, 287);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 197, 6);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.10.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.10.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.10.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.10.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.10.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where encodedID = 'CKT.S.CHEM.50';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='Energy Levels' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='Electromagnetic Radiation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='Atomic Spectra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='Atomic Theory' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 197,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (197, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Quantum Mechanics Model of the Atom' ,'Quantum Mechanics Model of the Atom','This chapter covers the quantum mechanical model of the atom, energy waves, standing waves, Heisenberg’s uncertainty principle, and Schrödinger’s equation. Quantum numbers, energy levels, energy sub-levels, and orbital shapes are introduced.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 197, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (288,1,'Electron Configurations for Atoms','This chapter covers electron spin, the Aufbau principle, and several methods for indicating electron configuration.','288.xhtml','288.xhtml', MD5(CONCAT('288.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (288,288,1,'2010-09-01T02:07:55');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (198,2,'Electron Configurations for Atoms-::of::-CK-12 Chemistry','This chapter covers electron spin, the Aufbau principle, and several methods for indicating electron configuration.','Electron-Configurations-for-Atoms-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:55');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (198, 198, 1, 0, '2010-09-01T02:07:55', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (198, 288);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 198, 7);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='Quantum Numbers' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='Probability Patterns' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='Orbitals' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='Electron Configuration' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='Aufbau Rule' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='Atomic Orbitals' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='Modern Atomic Structure' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 198,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (198, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Electron Configurations for Atoms' ,'Electron Configurations for Atoms','This chapter covers electron spin, the Aufbau principle, and several methods for indicating electron configuration.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 198, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (289,1,'Electron Configurations and the Periodic Table','This chapter develops the relationship between the electron configuration of atoms and their positions on the periodic table.','289.xhtml','289.xhtml', MD5(CONCAT('289.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (289,289,1,'2010-09-01T02:07:55');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (199,2,'Electron Configurations and the Periodic Table-::of::-CK-12 Chemistry','This chapter develops the relationship between the electron configuration of atoms and their positions on the periodic table.','Electron-Configurations-and-the-Periodic-Table-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:55');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (199, 199, 1, 0, '2010-09-01T02:07:55', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (199, 289);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 199, 8);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='Orbitals' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='Electron Configuration' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='Modern Atomic Structure' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 199,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (199, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Electron Configurations and the Periodic Table' ,'Electron Configurations and the Periodic Table','This chapter develops the relationship between the electron configuration of atoms and their positions on the periodic table.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 199, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (290,1,'Relationships Between the Elements','This chapter introduces the chemical families caused by electron configuration, the concept of valence electrons, and Lewis electron dot formulas.','290.xhtml','290.xhtml', MD5(CONCAT('290.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (290,290,1,'2010-09-01T02:07:56');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (200,2,'Relationships Between the Elements-::of::-CK-12 Chemistry','This chapter introduces the chemical families caused by electron configuration, the concept of valence electrons, and Lewis electron dot formulas.','Relationships-Between-the-Elements-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:56');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (200, 200, 1, 0, '2010-09-01T02:07:56', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (200, 290);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 200, 9);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='Periods' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='Periodic Table' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='Mendeleev Chemical Behavior' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='Families' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='Electron Configuration' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where encodedID = 'CKT.S.CHEM.40.20.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 200,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (200, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Relationships Between the Elements' ,'Relationships Between the Elements','This chapter introduces the chemical families caused by electron configuration, the concept of valence electrons, and Lewis electron dot formulas.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 200, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (291,1,'Trends on the Periodic Table','This chapter explains the periodic change in atomic size and its relationship to the periodic trends for ionization energy and electron affinity.','291.xhtml','291.xhtml', MD5(CONCAT('291.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (291,291,1,'2010-09-01T02:07:56');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (201,2,'Trends on the Periodic Table-::of::-CK-12 Chemistry','This chapter explains the periodic change in atomic size and its relationship to the periodic trends for ionization energy and electron affinity.','Trends-on-the-Periodic-Table-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:56');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (201, 201, 1, 0, '2010-09-01T02:07:56', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (201, 291);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 201, 10);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='Periods' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.40.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.40.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.40.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.40.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='Periodic Table' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.90';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='Mendeleev Chemical Behavior' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='Families' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where encodedID = 'CKT.S.CHEM.60';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 201,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (201, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Trends on the Periodic Table' ,'Trends on the Periodic Table','This chapter explains the periodic change in atomic size and its relationship to the periodic trends for ionization energy and electron affinity.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 201, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (292,1,'Ions and the Compounds They Form','This chapter explains the reasons for ionization, ionic bonding, and the properties of ionic compounds.','292.xhtml','292.xhtml', MD5(CONCAT('292.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (292,292,1,'2010-09-01T02:07:56');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (202,2,'Ions and the Compounds They Form-::of::-CK-12 Chemistry','This chapter explains the reasons for ionization, ionic bonding, and the properties of ionic compounds.','Ions-and-the-Compounds-They-Form-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:56');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (202, 202, 1, 0, '2010-09-01T02:07:56', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (202, 292);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 202, 11);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where encodedID = 'CKT.S.CHEM.70.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where encodedID = 'CKT.S.CHEM.70.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where encodedID = 'CKT.S.CHEM.70.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 202,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (202, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Ions and the Compounds They Form' ,'Ions and the Compounds They Form','This chapter explains the reasons for ionization, ionic bonding, and the properties of ionic compounds.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 202, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (293,1,'Writing and Naming Ionic Formulas','This chapter develops the skills involved in predicting ionic charge, writing ionic formulas, and naming ionic compounds.','293.xhtml','293.xhtml', MD5(CONCAT('293.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (293,293,1,'2010-09-01T02:07:56');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (203,2,'Writing and Naming Ionic Formulas-::of::-CK-12 Chemistry','This chapter develops the skills involved in predicting ionic charge, writing ionic formulas, and naming ionic compounds.','Writing-and-Naming-Ionic-Formulas-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:56');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (203, 203, 1, 0, '2010-09-01T02:07:56', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (203, 293);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 203, 12);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='Nomenclature' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='Ionic Bonding' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 203,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (203, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Writing and Naming Ionic Formulas' ,'Writing and Naming Ionic Formulas','This chapter develops the skills involved in predicting ionic charge, writing ionic formulas, and naming ionic compounds.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 203, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (294,1,'Covalent Bonding','This chapter explains the nature of the covalent bond, which atoms form covalent bonds, and the nomenclature rules for covalent compounds.','294.xhtml','294.xhtml', MD5(CONCAT('294.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (294,294,1,'2010-09-01T02:07:56');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (204,2,'Covalent Bonding-::of::-CK-12 Chemistry','This chapter explains the nature of the covalent bond, which atoms form covalent bonds, and the nomenclature rules for covalent compounds.','Covalent-Bonding-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:56');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (204, 204, 1, 0, '2010-09-01T02:07:56', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (204, 294);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 204, 13);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where encodedID = 'CKT.S.CHEM.80.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where encodedID = 'CKT.S.CHEM.80.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where encodedID = 'CKT.S.CHEM.80.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where encodedID = 'CKT.S.CHEM.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where encodedID = 'CKT.S.CHEM.80.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where encodedID = 'CKT.S.CHEM.80.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where encodedID = 'CKT.S.CHEM.80.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 204,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (204, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Covalent Bonding' ,'Covalent Bonding','This chapter explains the nature of the covalent bond, which atoms form covalent bonds, and the nomenclature rules for covalent compounds.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 204, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (295,1,'Molecular Architecture','This chapter covers the electronic and molecular geometries of covalent molecules including those that break the octet rule and the theories involved in explaining them. The chapter also develops the concept of polar molecules.','295.xhtml','295.xhtml', MD5(CONCAT('295.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (295,295,1,'2010-09-01T02:07:56');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (205,2,'Molecular Architecture-::of::-CK-12 Chemistry','This chapter covers the electronic and molecular geometries of covalent molecules including those that break the octet rule and the theories involved in explaining them. The chapter also develops the concept of polar molecules.','Molecular-Architecture-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:56');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (205, 205, 1, 0, '2010-09-01T02:07:56', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (205, 295);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 205, 14);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where encodedID = 'CKT.S.CHEM.110.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where encodedID = 'CKT.S.CHEM.110.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where encodedID = 'CKT.S.CHEM.110.90';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='Multiple bonds' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where encodedID = 'CKT.S.CHEM.110.80';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='Lewis structures' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where encodedID = 'CKT.S.CHEM.110.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where encodedID = 'CKT.S.CHEM.110.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where encodedID = 'CKT.S.CHEM.110.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where encodedID = 'CKT.S.CHEM.110';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 205,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (205, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Molecular Architecture' ,'Molecular Architecture','This chapter covers the electronic and molecular geometries of covalent molecules including those that break the octet rule and the theories involved in explaining them. The chapter also develops the concept of polar molecules.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 205, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (296,1,'The Mathematics of Compounds','This chapter develops the skills involved in formula stoichiometry.','296.xhtml','296.xhtml', MD5(CONCAT('296.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (296,296,1,'2010-09-01T02:07:56');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (206,2,'The Mathematics of Compounds-::of::-CK-12 Chemistry','This chapter develops the skills involved in formula stoichiometry.','The-Mathematics-of-Compounds-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:56');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (206, 206, 1, 0, '2010-09-01T02:07:56', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (206, 296);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 206, 15);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where encodedID = 'CKT.S.CHEM.90.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where encodedID = 'CKT.S.CHEM.90.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where encodedID = 'CKT.S.CHEM.90.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where encodedID = 'CKT.S.CHEM.90.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where encodedID = 'CKT.S.CHEM.90.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where encodedID = 'CKT.S.CHEM.90';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 206,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (206, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'The Mathematics of Compounds' ,'The Mathematics of Compounds','This chapter develops the skills involved in formula stoichiometry.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 206, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (297,1,'Reactions','This chapter develops the skills involved in mass and molecule to mole calculations and the determination of reaction types.','297.xhtml','297.xhtml', MD5(CONCAT('297.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (297,297,1,'2010-09-01T02:07:57');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (207,2,'Reactions-::of::-CK-12 Chemistry','This chapter develops the skills involved in mass and molecule to mole calculations and the determination of reaction types.','Reactions-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:57');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (207, 207, 1, 0, '2010-09-01T02:07:57', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (207, 297);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 207, 16);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where encodedID = 'CKT.S.CHEM.100.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='Moles' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='Molecules' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where encodedID = 'CKT.S.CHEM.100.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='Classification' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where encodedID = 'CKT.S.CHEM.100.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where encodedID = 'CKT.S.PS.140.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 207,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (207, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Reactions' ,'Reactions','This chapter develops the skills involved in mass and molecule to mole calculations and the determination of reaction types.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 207, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (298,1,'Mathematics and Chemical Equations','This chapter develops the skills involved in equation stoichiometry including limiting reactant equations, yields, and introduces heat of reaction.','298.xhtml','298.xhtml', MD5(CONCAT('298.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (298,298,1,'2010-09-01T02:07:57');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (208,2,'Mathematics and Chemical Equations-::of::-CK-12 Chemistry','This chapter develops the skills involved in equation stoichiometry including limiting reactant equations, yields, and introduces heat of reaction.','Mathematics-and-Chemical-Equations-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:57');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (208, 208, 1, 0, '2010-09-01T02:07:57', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (208, 298);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 208, 17);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where encodedID = 'CKT.S.CHEM.90.60';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='Balance' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 208,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (208, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Mathematics and Chemical Equations' ,'Mathematics and Chemical Equations','This chapter develops the skills involved in equation stoichiometry including limiting reactant equations, yields, and introduces heat of reaction.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 208, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (299,1,'The Kinetic-Molecular Theory','This chapter describes the molecular structure and properties of gases and develops both the combined gas law and the universal gas law. The stoichiometry of reactions involving gases is also covered.','299.xhtml','299.xhtml', MD5(CONCAT('299.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (299,299,1,'2010-09-01T02:07:57');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (209,2,'The Kinetic-Molecular Theory-::of::-CK-12 Chemistry','This chapter describes the molecular structure and properties of gases and develops both the combined gas law and the universal gas law. The stoichiometry of reactions involving gases is also covered.','The-Kinetic-Molecular-Theory-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:57');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (209, 209, 1, 0, '2010-09-01T02:07:57', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (209, 299);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 209, 18);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where encodedID = 'CKT.S.CHEM.120.40.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where encodedID = 'CKT.S.PHY.20.20.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where encodedID = 'CKT.S.CHEM.120.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where encodedID = 'CKT.S.CHEM.120.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where encodedID = 'CKT.S.CHEM.120.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where encodedID = 'CKT.S.CHEM.120.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='Temperature' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where encodedID = 'CKT.S.PHY.20.30.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where encodedID = 'CKT.S.CHEM.120.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='Gay-Lussac\'s Law' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where encodedID = 'CKT.S.CHEM.120.20.50';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='Charles\'s Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='Boyle\'s Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='Avogadro\'s Law' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where encodedID = 'CKT.S.CHEM.120.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='Graham\'s Law of Diffusion' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='Dalton\'s Law of Partial Pressure' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where encodedID = 'CKT.S.PHY.20.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 209,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (209, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'The Kinetic-Molecular Theory' ,'The Kinetic-Molecular Theory','This chapter describes the molecular structure and properties of gases and develops both the combined gas law and the universal gas law. The stoichiometry of reactions involving gases is also covered.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 209, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (300,1,'The Liquid State','This chapter covers the causes of the liquid condensed phases and the properties of liquids. It includes a section on the energy involved in liquid to gas phase changes and a section introducing colligative properties.','300.xhtml','300.xhtml', MD5(CONCAT('300.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (300,300,1,'2010-09-01T02:07:57');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (210,2,'The Liquid State-::of::-CK-12 Chemistry','This chapter covers the causes of the liquid condensed phases and the properties of liquids. It includes a section on the energy involved in liquid to gas phase changes and a section introducing colligative properties.','The-Liquid-State-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:57');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (210, 210, 1, 0, '2010-09-01T02:07:57', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (210, 300);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 210, 19);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.110';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.120';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 210,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (210, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'The Liquid State' ,'The Liquid State','This chapter covers the causes of the liquid condensed phases and the properties of liquids. It includes a section on the energy involved in liquid to gas phase changes and a section introducing colligative properties.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 210, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (301,1,'The Solid State','The various intermolecular forces of attraction are discussed in this chapter and the properties of solids produced by each type of intermolecular force of attraction are pointed out.','301.xhtml','301.xhtml', MD5(CONCAT('301.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (301,301,1,'2010-09-01T02:07:57');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (211,2,'The Solid State-::of::-CK-12 Chemistry','The various intermolecular forces of attraction are discussed in this chapter and the properties of solids produced by each type of intermolecular force of attraction are pointed out.','The-Solid-State-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:57');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (211, 211, 1, 0, '2010-09-01T02:07:57', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (211, 301);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 211, 20);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='Properties' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.130';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.90';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='Metallic Solids and Liquids' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='London Dispersion Forces (Van der Waals Forces)' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='Ionic Solids and Liquids' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='Intermolecular Forces' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='Hydrogen Bonds' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='Heats of Fusion and Vaporization' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='Heating and Cooling Curves' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='Dipole Attractions' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where encodedID = 'CKT.S.CHEM.130.100';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 211,id from BrowseTerms where name='eleven' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (211, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'The Solid State' ,'The Solid State','The various intermolecular forces of attraction are discussed in this chapter and the properties of solids produced by each type of intermolecular force of attraction are pointed out.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 211, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (302,1,'The Solution Process','This chapter covers solvation, concentration calculations, solubility, and colligative properties of solutions.','302.xhtml','302.xhtml', MD5(CONCAT('302.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (302,302,1,'2010-09-01T02:07:58');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (212,2,'The Solution Process-::of::-CK-12 Chemistry','This chapter covers solvation, concentration calculations, solubility, and colligative properties of solutions.','The-Solution-Process-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:58');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (212, 212, 1, 0, '2010-09-01T02:07:58', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (212, 302);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 212, 21);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.140.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.140.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.140.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.140.100';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.140.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.140.90';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.190.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.140.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.140.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.140.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.150.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.150.40.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.150.40.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.150.40.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='Mixtures' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.150.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.150.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where encodedID = 'CKT.S.CHEM.150';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 212,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (212, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'The Solution Process' ,'The Solution Process','This chapter covers solvation, concentration calculations, solubility, and colligative properties of solutions.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 212, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (303,1,'Ions in Solution','This chapter covers dissociation, electrolytes and non-electrolytes, reactions between ions in solution, and ionic and net-ionic equations.','303.xhtml','303.xhtml', MD5(CONCAT('303.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (303,303,1,'2010-09-01T02:07:58');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (213,2,'Ions in Solution-::of::-CK-12 Chemistry','This chapter covers dissociation, electrolytes and non-electrolytes, reactions between ions in solution, and ionic and net-ionic equations.','Ions-in-Solution-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:58');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (213, 213, 1, 0, '2010-09-01T02:07:58', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (213, 303);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 213, 22);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='Solubilities' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='Dissolving Equilibrium' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='Phases' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 213,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (213, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Ions in Solution' ,'Ions in Solution','This chapter covers dissociation, electrolytes and non-electrolytes, reactions between ions in solution, and ionic and net-ionic equations.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 213, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (304,1,'Chemical Kinetics','This chapter covers reaction rates and the factors that affect reaction rates.','304.xhtml','304.xhtml', MD5(CONCAT('304.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (304,304,1,'2010-09-01T02:07:59');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (214,2,'Chemical Kinetics-::of::-CK-12 Chemistry','This chapter covers reaction rates and the factors that affect reaction rates.','Chemical-Kinetics-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:07:59');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (214, 214, 1, 0, '2010-09-01T02:07:59', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (214, 304);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 214, 23);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='Temperature' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where encodedID = 'CKT.S.CHEM.160.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where encodedID = 'CKT.S.CHEM.160.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where encodedID = 'CKT.S.CHEM.160.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where encodedID = 'CKT.S.CHEM.160.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='Pressure' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='Potential Energy' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where encodedID = 'CKT.S.CHEM.160.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where encodedID = 'CKT.S.CHEM.160.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where encodedID = 'CKT.S.CHEM.160';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 214,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (214, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Chemical Kinetics' ,'Chemical Kinetics','This chapter covers reaction rates and the factors that affect reaction rates.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 214, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (305,1,'Chemical Equilibrium','This chapter covers relationships between forward and reverse reaction rates, the concept of chemical equilibrium, the mathematics of the equilibrium constant, Le Chatelier’s principle, and solubility product constant calculations.','305.xhtml','305.xhtml', MD5(CONCAT('305.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (305,305,1,'2010-09-01T02:08:00');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (215,2,'Chemical Equilibrium-::of::-CK-12 Chemistry','This chapter covers relationships between forward and reverse reaction rates, the concept of chemical equilibrium, the mathematics of the equilibrium constant, Le Chatelier’s principle, and solubility product constant calculations.','Chemical-Equilibrium-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:08:00');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (215, 215, 1, 0, '2010-09-01T02:08:00', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (215, 305);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 215, 24);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where encodedID = 'CKT.S.CHEM.170.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where encodedID = 'CKT.S.CHEM.170.10';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='Le Chatelier\'s Principle' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where encodedID = 'CKT.S.CHEM.170.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where encodedID = 'CKT.S.CHEM.170.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='Dynamic Equilibrium' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where encodedID = 'CKT.S.CHEM.170';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 215,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (215, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Chemical Equilibrium' ,'Chemical Equilibrium','This chapter covers relationships between forward and reverse reaction rates, the concept of chemical equilibrium, the mathematics of the equilibrium constant, Le Chatelier’s principle, and solubility product constant calculations.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 215, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (306,1,'Acids and Bases','This chapter includes the definitions of acids and bases, the causes of strong and weak acids and bases, the hydrolysis of salts, and an introduction to pH.','306.xhtml','306.xhtml', MD5(CONCAT('306.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (306,306,1,'2010-09-01T02:08:00');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (216,2,'Acids and Bases-::of::-CK-12 Chemistry','This chapter includes the definitions of acids and bases, the causes of strong and weak acids and bases, the hydrolysis of salts, and an introduction to pH.','Acids-and-Bases-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:08:00');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (216, 216, 1, 0, '2010-09-01T02:08:00', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (216, 306);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 216, 25);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.70';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='Properties' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.100';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.120';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where encodedID = 'CKT.S.PS.150.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 216,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (216, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Acids and Bases' ,'Acids and Bases','This chapter includes the definitions of acids and bases, the causes of strong and weak acids and bases, the hydrolysis of salts, and an introduction to pH.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 216, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (307,1,'Water, pH and Titration','This chapter covers the mathematics of the dissociation of water, acid-base indicators, acid-base titration, buffers.','307.xhtml','307.xhtml', MD5(CONCAT('307.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (307,307,1,'2010-09-01T02:08:00');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (217,2,'Water, pH and Titration-::of::-CK-12 Chemistry','This chapter covers the mathematics of the dissociation of water, acid-base indicators, acid-base titration, buffers.','Water,-pH-and-Titration-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:08:00');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (217, 217, 1, 0, '2010-09-01T02:08:00', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (217, 307);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 217, 26);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.140';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.110';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='Acid-Base Indicators' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where encodedID = 'CKT.S.CHEM.180.130';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 217,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (217, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Water, pH and Titration' ,'Water, pH and Titration','This chapter covers the mathematics of the dissociation of water, acid-base indicators, acid-base titration, buffers.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 217, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (308,1,'Thermodynamics','This chapter covers the energy involved in bond breaking and bond formation, the heat of reaction, the heat of formation, Hess\' law, entropy, and Gibb’s free energy.','308.xhtml','308.xhtml', MD5(CONCAT('308.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (308,308,1,'2010-09-01T02:08:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (218,2,'Thermodynamics-::of::-CK-12 Chemistry','This chapter covers the energy involved in bond breaking and bond formation, the heat of reaction, the heat of formation, Hess\' law, entropy, and Gibb’s free energy.','Thermodynamics-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:08:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (218, 218, 1, 0, '2010-09-01T02:08:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (218, 308);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 218, 27);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where encodedID = 'CKT.S.CHEM.190.50';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='Hess\'s Law' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='Gibb\'s Free Energy' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where encodedID = 'CKT.S.PHY.30.40.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='Enthalpy' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='Thermodynamics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 218,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (218, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Thermodynamics' ,'Thermodynamics','This chapter covers the energy involved in bond breaking and bond formation, the heat of reaction, the heat of formation, Hess\' law, entropy, and Gibb’s free energy.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 218, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (309,1,'Electrochemical Cells','This chapter covers oxidation-reduction and electrochemical cells.','309.xhtml','309.xhtml', MD5(CONCAT('309.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (309,309,1,'2010-09-01T02:08:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (219,2,'Electrochemical Cells-::of::-CK-12 Chemistry','This chapter covers oxidation-reduction and electrochemical cells.','Electrochemical-Cells-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:08:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (219, 219, 1, 0, '2010-09-01T02:08:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (219, 309);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 219, 28);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.200.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.200.20';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='Oxidation Numbers' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.200.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.200';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.210.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.210.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.210.60';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='Quantitative' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.210.100';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.210.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.210.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.210.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='Electric Current' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.210.110';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.CHEM.210.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where encodedID = 'CKT.S.PS.190.40';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 219,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (219, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Electrochemical Cells' ,'Electrochemical Cells','This chapter covers oxidation-reduction and electrochemical cells.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 219, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (310,1,'Radioactivity and the Nucleus','This chapter is an introduction to radioactivity, nuclear equations, and nuclear energy.','310.xhtml','310.xhtml', MD5(CONCAT('310.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (310,310,1,'2010-09-01T02:08:02');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (220,2,'Radioactivity and the Nucleus-::of::-CK-12 Chemistry','This chapter is an introduction to radioactivity, nuclear equations, and nuclear energy.','Radioactivity-and-the-Nucleus-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:08:02');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (220, 220, 1, 0, '2010-09-01T02:08:02', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (220, 310);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 220, 29);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='Radioactivity' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.150';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.180';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.170';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.200';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.120';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.160';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.130';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.140';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.110';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.190';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.100';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.80';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.90';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.CHEM.220.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where encodedID = 'CKT.S.PS.170';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 220,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (220, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'Radioactivity and the Nucleus' ,'Radioactivity and the Nucleus','This chapter is an introduction to radioactivity, nuclear equations, and nuclear energy.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 220, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (311,1,'The Chemistry of Carbon','This chapter introduces the structure and nomenclature of straight chain hydrocarbons, aromatic hydrocarbons, and the functional groups of hydrocarbons.','311.xhtml','311.xhtml', MD5(CONCAT('311.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (311,311,1,'2010-09-01T02:08:04');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (221,2,'The Chemistry of Carbon-::of::-CK-12 Chemistry','This chapter introduces the structure and nomenclature of straight chain hydrocarbons, aromatic hydrocarbons, and the functional groups of hydrocarbons.','The-Chemistry-of-Carbon-::of::-CK-12-Chemistry',3,NULL, '2010-09-01T02:08:04');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (221, 221, 1, 0, '2010-09-01T02:08:04', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (221, 311);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (191, 221, 30);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.100';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.90.30';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.110';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.80';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='Organic compounds' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.70';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.90.60';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.90.40';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.90.50';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.90.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.90.10';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.90';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.30';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='Chemistry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where encodedID = 'CKT.S.CHEM.230.20';
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='chemistry' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 221,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (221, 281);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 2 , 'The Chemistry of Carbon' ,'The Chemistry of Carbon','This chapter introduces the structure and nomenclature of straight chain hydrocarbons, aromatic hydrocarbons, and the functional groups of hydrocarbons.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 221, max(id) from `Standards`;
