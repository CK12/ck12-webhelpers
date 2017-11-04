insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`) values (222,1,'Algebra I','CK-12 Foundation\'s Algebra FlexBook is an introduction to algebraic concepts for the high school student. Topics include: Equations & Functions, Real Numbers, Equations of Lines, Solving Systems of Equations & Quadratic Equations.','Algebra-I',3, NULL, '2010-08-05T22:58:57');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (222, 222, 1, 0, '2010-08-05T22:58:57', '2010-01-01T12:12:27Z');
INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (312,2,'book_cover_image','Cover page image for the book','CK12_Algebra_I.png','CK12_Algebra_I.png', MD5(CONCAT('CK12_Algebra_I.png', 'cover page', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (312,312,1,'2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (222, 312);

INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (313,2,'chapter_cover_image','Cover page image for the chapter','chapter_cover_algebra.png','chapter_cover_algebra.png', MD5(CONCAT('chapter_cover_algebra.png', 'cover page', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (313,313,1,'2010-01-01T12:12:27Z');
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (314,1,'Equations and Functions','This chapter covers evaluating algebraic expressions, order of operations, using verbal models to write equations, solving problems using equations, inequalities, identifying the domain and range of a function, and graphs of functions.','314.xhtml','314.xhtml', MD5(CONCAT('314.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (314,314,1,'2010-08-05T22:59:03');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (223,2,'Equations and Functions-::of::-Algebra I','This chapter covers evaluating algebraic expressions, order of operations, using verbal models to write equations, solving problems using equations, inequalities, identifying the domain and range of a function, and graphs of functions.','Equations-and-Functions-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:03');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (223, 223, 1, 0, '2010-08-05T22:59:03', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (223, 314);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 223, 1);
INSERT INTO `BrowseTerms` (`id`, `name`, `termTypeID`, `parentID`) select max(id)+1, 'US.CA.9.MATHEMATICS.20_3', 5, NULL from BrowseTerms;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 223,max(id) from BrowseTerms;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 223,id from BrowseTerms where name='Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 223,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 223,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 223,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 223,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 223,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 223,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 223,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 223,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 223,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (223, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Equations and Functions' ,'Equations and Functions','This chapter covers evaluating algebraic expressions, order of operations, using verbal models to write equations, solving problems using equations, inequalities, identifying the domain and range of a function, and graphs of functions.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 223, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (315,1,'Real Numbers','This chapter covers graphing and comparing integers, finding absolute values, ordering rational numbers, performing basic operations with rational numbers, and applying the commutative, associative, and distributive properties.','315.xhtml','315.xhtml', MD5(CONCAT('315.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (315,315,1,'2010-08-05T22:59:04');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (224,2,'Real Numbers-::of::-Algebra I','This chapter covers graphing and comparing integers, finding absolute values, ordering rational numbers, performing basic operations with rational numbers, and applying the commutative, associative, and distributive properties.','Real-Numbers-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:04');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (224, 224, 1, 0, '2010-08-05T22:59:04', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (224, 315);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 224, 2);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='Linear' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='Algebraic Manipulation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='Algebra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 224,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (224, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Real Numbers' ,'Real Numbers','This chapter covers graphing and comparing integers, finding absolute values, ordering rational numbers, performing basic operations with rational numbers, and applying the commutative, associative, and distributive properties.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 224, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (316,1,'Equations of Lines','This chapter covers solving one-step equations, solving two-step and multi-step equations, using ratios and proportions, solving problems using scale drawings, using similar figures to measure, and finding the percent of a number.','316.xhtml','316.xhtml', MD5(CONCAT('316.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (316,316,1,'2010-08-05T22:59:08');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `encodedID`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (225,2,'Equations of Lines-::of::-Algebra I','MAT.ARI.310.CH.1', 'This chapter covers solving one-step equations, solving two-step and multi-step equations, using ratios and proportions, solving problems using scale drawings, using similar figures to measure, and finding the percent of a number.','Equations-of-Lines-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:08');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (225, 225, 1, 0, '2010-08-05T22:59:08', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (225, 316);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 225, 3);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where encodedID='MAT.ARI.310';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='Inequalities' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='Rational' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='Linear' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='Algebraic Manipulation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='Algebra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 225,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (225, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Equations of Lines' ,'Equations of Lines','This chapter covers solving one-step equations, solving two-step and multi-step equations, using ratios and proportions, solving problems using scale drawings, using similar figures to measure, and finding the percent of a number.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 225, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (317,1,'Graphs of Equations and Functions','This chapter covers plotting points in a coordinate plane, graphing functions given a table or rule, graphing linear equations, graphing using intercepts and slope-intercept form, and solving real-world problems using direct variation.','317.xhtml','317.xhtml', MD5(CONCAT('317.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (317,317,1,'2010-08-05T22:59:11');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (226,2,'Graphs of Equations and Functions-::of::-Algebra I','This chapter covers plotting points in a coordinate plane, graphing functions given a table or rule, graphing linear equations, graphing using intercepts and slope-intercept form, and solving real-world problems using direct variation.','Graphs-of-Equations-and-Functions-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:11');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (226, 226, 1, 0, '2010-08-05T22:59:11', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (226, 317);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 226, 4);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where encodedID='MAT.ARI.320';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='Graphing Techniques' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='Rational' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='Linear' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='Algebra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 226,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (226, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Graphs of Equations and Functions' ,'Graphs of Equations and Functions','This chapter covers plotting points in a coordinate plane, graphing functions given a table or rule, graphing linear equations, graphing using intercepts and slope-intercept form, and solving real-world problems using direct variation.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 226, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (318,1,'Writing Linear Equations','This chapter covers linear equations in slope-intercept form and point-slope form, standard form for linear equations, equations of parallel and perpendicular lines, and problem solving using linear models.','318.xhtml','318.xhtml', MD5(CONCAT('318.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (318,318,1,'2010-08-05T22:59:12');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (227,2,'Writing Linear Equations-::of::-Algebra I','This chapter covers linear equations in slope-intercept form and point-slope form, standard form for linear equations, equations of parallel and perpendicular lines, and problem solving using linear models.','Writing-Linear-Equations-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:12');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (227, 227, 1, 0, '2010-08-05T22:59:12', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (227, 318);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 227, 5);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='Graphing Techniques' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='Rational' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='Linear' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='Algebra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 227,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (227, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Writing Linear Equations' ,'Writing Linear Equations','This chapter covers linear equations in slope-intercept form and point-slope form, standard form for linear equations, equations of parallel and perpendicular lines, and problem solving using linear models.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 227, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (319,1,'Graphing Linear Inequalities; Introduction to Probability','This chapter covers solving and graphing linear inequalities, identifying the number of solutions of an inequality, solving compound inequalities, and solving absolute value equations & inequalities.','319.xhtml','319.xhtml', MD5(CONCAT('319.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (319,319,1,'2010-08-05T22:59:13');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (228,2,'Graphing Linear Inequalities; Introduction to Probability-::of::-Algebra I','This chapter covers solving and graphing linear inequalities, identifying the number of solutions of an inequality, solving compound inequalities, and solving absolute value equations & inequalities.','Graphing-Linear-Inequalities;-Introduction-to-Probability-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:13');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (228, 228, 1, 0, '2010-08-05T22:59:13', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (228, 319);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 228, 6);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where encodedID='MAT.ARI.500';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='Inequalities' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='Graphing Techniques' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='Linear' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='Algebraic Manipulation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='Algebra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 228,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (228, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Graphing Linear Inequalities; Introduction to Probability' ,'Graphing Linear Inequalities; Introduction to Probability','This chapter covers solving and graphing linear inequalities, identifying the number of solutions of an inequality, solving compound inequalities, and solving absolute value equations & inequalities.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 228, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (320,1,'Solving Systems of Equations and Inequalities','This chapter covers solving systems of equations graphically, solving systems of equations using substitution or elimination, solving systems of equations using multiplication, and solving systems of inequalities.','320.xhtml','320.xhtml', MD5(CONCAT('320.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (320,320,1,'2010-08-05T22:59:14');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (229,2,'Solving Systems of Equations and Inequalities-::of::-Algebra I','This chapter covers solving systems of equations graphically, solving systems of equations using substitution or elimination, solving systems of equations using multiplication, and solving systems of inequalities.','Solving-Systems-of-Equations-and-Inequalities-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:14');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (229, 229, 1, 0, '2010-08-05T22:59:14', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (229, 320);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 229, 7);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where encodedID = 'MAT.ARI.510';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='Inequalities' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='Graphing Techniques' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='Algebraic Manipulation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='Algebra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 229,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (229, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Solving Systems of Equations and Inequalities' ,'Solving Systems of Equations and Inequalities','This chapter covers solving systems of equations graphically, solving systems of equations using substitution or elimination, solving systems of equations using multiplication, and solving systems of inequalities.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 229, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (321,1,'Exponential Functions','This chapter covers exponent properties involving products and quotients, expressions with zero, negative & fractional exponents, scientific notation, and geometric sequences.','321.xhtml','321.xhtml', MD5(CONCAT('321.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (321,321,1,'2010-08-05T22:59:16');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (230,2,'Exponential Functions-::of::-Algebra I','This chapter covers exponent properties involving products and quotients, expressions with zero, negative & fractional exponents, scientific notation, and geometric sequences.','Exponential-Functions-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:16');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (230, 230, 1, 0, '2010-08-05T22:59:16', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (230, 321);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 230, 8);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='Graphing Techniques' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='Rational' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='Algebraic Manipulation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='Algebra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 230,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (230, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Exponential Functions' ,'Exponential Functions','This chapter covers exponent properties involving products and quotients, expressions with zero, negative & fractional exponents, scientific notation, and geometric sequences.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 230, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (322,1,'Factoring Polynomials; More on Probability','This chapter covers addition & subtraction of polynomials, multiplication of polynomials, special products of polynomials, solving simple polynomial equations by factoring, and factoring quadratic expressions.','322.xhtml','322.xhtml', MD5(CONCAT('322.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (322,322,1,'2010-08-05T22:59:17');
insert into `Artifacts` (`id`, `artifactTypeID`, `encodedID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (231,2,'MAT.ARI.300.C.1', 'Factoring Polynomials; More on Probability-::of::-Algebra I','This chapter covers addition & subtraction of polynomials, multiplication of polynomials, special products of polynomials, solving simple polynomial equations by factoring, and factoring quadratic expressions.','Factoring_Polynomials;_More_on_Probability-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:17');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (231, 231, 1, 0, '2010-08-05T22:59:17', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (231, 322);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 231, 9);
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where encodedID = 'MAT.ARI.300';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='Algebraic Manipulation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='Algebra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 231,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (231, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Factoring Polynomials; More on Probability' ,'Factoring Polynomials; More on Probability','This chapter covers addition & subtraction of polynomials, multiplication of polynomials, special products of polynomials, solving simple polynomial equations by factoring, and factoring quadratic expressions.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 231, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (323,1,'Quadratic Equations and Quadratic Functions','This chapter covers graphing quadratic functions, identifying the number of solutions of quadratic equations, solving quadratic equations using the quadratic formula, and finding the discriminant of a quadratic equation.','323.xhtml','323.xhtml', MD5(CONCAT('323.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (323,323,1,'2010-08-05T22:59:19');
insert into `Artifacts` (`id`, `artifactTypeID`, `encodedID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (232,2,'MAT.ARI.500.C.1', 'Quadratic Equations and Quadratic Functions-::of::-Algebra I','This chapter covers graphing quadratic functions, identifying the number of solutions of quadratic equations, solving quadratic equations using the quadratic formula, and finding the discriminant of a quadratic equation.','Quadratic_Equations_and_Quadratic_Functions-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:19');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (232, 232, 1, 0, '2010-08-05T22:59:19', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (232, 323);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 232, 10);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where encodedID='MAT.ARI.500';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Linear' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Rational' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Quadratic' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Algebraic Manipulation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Algebra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Graphs and Plots' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Data Representation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Data Summary and Presentation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Pythagorean Theorem' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Triangles' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Plane Geometry' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='Geometry' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 232,id from BrowseTerms where name='nine' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (232, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Quadratic Equations and Quadratic Functions' ,'Quadratic Equations and Quadratic Functions','This chapter covers graphing quadratic functions, identifying the number of solutions of quadratic equations, solving quadratic equations using the quadratic formula, and finding the discriminant of a quadratic equation.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 232, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (324,1,'Algebra and Geometry Connections; Working with Data','This chapter covers graphing and comparing square root functions, solving radical equations, using the Pythagorean theorem and its converse, using the distance formula, and making & interpreting stem-and-leaf plots & histograms.','324.xhtml','324.xhtml', MD5(CONCAT('324.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (324,324,1,'2010-08-05T22:59:23');
insert into `Artifacts` (`id`, `artifactTypeID`, `encodedID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (233,2,'MAT.ARI.700.C.1', 'Algebra and Geometry Connections; Working with Data-::of::-Algebra I','This chapter covers graphing and comparing square root functions, solving radical equations, using the Pythagorean theorem and its converse, using the distance formula, and making & interpreting stem-and-leaf plots & histograms.','Algebra_and_Geometry_Connections;_Working_with_Data-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:23');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (233, 233, 1, 0, '2010-08-05T22:59:23', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (233, 324);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 233, 11);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where encodedID='MAT.ARI.700';

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Measures of Central Tendency' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Summary Statistics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Graphs and Plots' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Data Summary and Presentation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Measures of Spread' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Pythagorean Theorem' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Triangles' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Plane Geometry' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Rational' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Linear' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Algebraic Manipulation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Algebra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='Functions' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 233,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (233, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Algebra and Geometry Connections; Working with Data' ,'Algebra and Geometry Connections; Working with Data','This chapter covers graphing and comparing square root functions, solving radical equations, using the Pythagorean theorem and its converse, using the distance formula, and making & interpreting stem-and-leaf plots & histograms.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 233, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (325,1,'Rational Equations and Functions; Topics in Statistics','This chapter covers inverse variation models, graphing rational functions, division of polynomials, multiplication, division, addition & subtraction of rational expressions, solving rational equations, and designing & conducting a survey.','325.xhtml','325.xhtml', MD5(CONCAT('325.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (325,325,1,'2010-08-05T22:59:25');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (234,2,'Rational Equations and Functions; Topics in Statistics-::of::-Algebra I','This chapter covers inverse variation models, graphing rational functions, division of polynomials, multiplication, division, addition & subtraction of rational expressions, solving rational equations, and designing & conducting a survey.','Rational-Equations-and-Functions;-Topics-in-Statistics-::of::-Algebra-I',3,NULL, '2010-08-05T22:59:25');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (234, 234, 1, 0, '2010-08-05T22:59:25', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (234, 325);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (222, 234, 12);

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='Sampling and Surveys' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='Data Collection' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='Rational' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='Polynomial' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='Functions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='Equations' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='Algebraic Manipulation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='Algebra' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='9' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='ix' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='nine' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 234,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (234, 313);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Rational Equations and Functions; Topics in Statistics' ,'Rational Equations and Functions; Topics in Statistics','This chapter covers inverse variation models, graphing rational functions, division of polynomials, multiplication, division, addition & subtraction of rational expressions, solving rational equations, and designing & conducting a survey.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 10 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 234, max(id) from `Standards`;
