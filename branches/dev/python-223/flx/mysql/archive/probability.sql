insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`) values (84,1,'Probability and Statistics (Advanced Placement)','CK-12 Foundation’s Probability and Statistics (Advanced Placement) FlexBook introduces students to basic topics in statistics and probability but finishes with the rigorous topics an advanced placement course requires.','Probability-and-Statistics-(Advanced-Placement)',1, NULL, '2010-09-01T02:04:56');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (84, 84, 1, 0, '2010-09-01T02:04:56', '2010-01-01T12:12:27Z');
INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (167,2,'book_cover_image','Cover page image for the book','CK12_Prob_and_Stat_ADVANCED.png','CK12_Prob_and_Stat_ADVANCED.png', MD5(CONCAT('CK12_Prob_and_Stat_ADVANCED.png', 'cover page', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (167,167,1,'2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (84, 167);

INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (168,2,'chapter_cover_image','Cover page image for the chapter','chapter_cover_prob_ad.png','chapter_cover_prob_ad.png', MD5(CONCAT('chapter_cover_prob_ad.png', 'cover page', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (168,168,1,'2010-01-01T12:12:27Z');
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (169,1,'An Introduction to Analyzing Statistical Data','Students learn definitions of statistical terminology, and review data, measures of center, and measures of spread.','169.xhtml','169.xhtml', MD5(CONCAT('169.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (169,169,1,'2010-09-01T02:04:57');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (85,2,'An Introduction to Analyzing Statistical Data-::of::-Probability and Statistics (Advanced Placement)','Students learn definitions of statistical terminology, and review data, measures of center, and measures of spread.','An-Introduction-to-Analyzing-Statistical-Data-::of::-Probability-and-Statistics-(Advanced-Placement)',1,NULL, '2010-09-01T02:04:57');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (85, 85, 1, 0, '2010-09-01T02:04:57', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (85, 169);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 85, 1);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 85,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (85, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'An Introduction to Analyzing Statistical Data' ,'An Introduction to Analyzing Statistical Data','Students learn definitions of statistical terminology, and review data, measures of center, and measures of spread.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 85, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (170,1,'Visualizations of Data','Students explore and learn about histograms and frequency distributions, common graphs and data plots, and box-and-whisker plots.','170.xhtml','170.xhtml', MD5(CONCAT('170.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (170,170,1,'2010-09-01T02:04:58');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (86,2,'Visualizations of Data-::of::-Probability and Statistics (Advanced Placement)','Students explore and learn about histograms and frequency distributions, common graphs and data plots, and box-and-whisker plots.','Visualizations-of-Data-::of::-Probability-and-Statistics-(Advanced-Placement)',1,NULL, '2010-09-01T02:04:58');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (86, 86, 1, 0, '2010-09-01T02:04:58', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (86, 170);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 86, 2);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='Data Summary and Presentation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 86,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (86, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Visualizations of Data' ,'Visualizations of Data','Students explore and learn about histograms and frequency distributions, common graphs and data plots, and box-and-whisker plots.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 86, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (171,1,'An Introduction to Probability','Students explore and learn about events, sample spaces, probability, compound events, the complement of an event, conditional probability, and basic counting rules.','171.xhtml','171.xhtml', MD5(CONCAT('171.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (171,171,1,'2010-09-01T02:04:59');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (87,2,'An Introduction to Probability-::of::-Probability and Statistics (Advanced Placement)','Students explore and learn about events, sample spaces, probability, compound events, the complement of an event, conditional probability, and basic counting rules.','An-Introduction-to-Probability-::of::-Probability-and-Statistics-(Advanced-Placement)',1,NULL, '2010-09-01T02:04:59');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (87, 87, 1, 0, '2010-09-01T02:04:59', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (87, 171);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 87, 3);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 87,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (87, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'An Introduction to Probability' ,'An Introduction to Probability','Students explore and learn about events, sample spaces, probability, compound events, the complement of an event, conditional probability, and basic counting rules.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 87, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (172,1,'Discrete Probability Distribution','Students explore and learn about two types of random variables, probability distribution for a discrete random variable, mean and standard deviation of discrete random variables and the Binomial Probability Distribution.','172.xhtml','172.xhtml', MD5(CONCAT('172.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (172,172,1,'2010-09-01T02:04:59');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (88,2,'Discrete Probability Distribution-::of::-Probability and Statistics (Advanced Placement)','Students explore and learn about two types of random variables, probability distribution for a discrete random variable, mean and standard deviation of discrete random variables and the Binomial Probability Distribution-::of::-Probability-and-Statistics-(Advanced-Placement).','Discrete-Probability-Distribution',1,NULL, '2010-09-01T02:04:59');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (88, 88, 1, 0, '2010-09-01T02:04:59', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (88, 172);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 88, 4);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='Measures of Spread' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='Summary Statistics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='Data Summary and Presentation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 88,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (88, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Discrete Probability Distribution' ,'Discrete Probability Distribution','Students explore and learn about two types of random variables, probability distribution for a discrete random variable, mean and standard deviation of discrete random variables and the Binomial Probability Distribution.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 88, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (173,1,'Normal Distribution','Students explore and learn about the standard normal probability distribution, the density curve of the normal distribution, and applications of the normal distribution.','173.xhtml','173.xhtml', MD5(CONCAT('173.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (173,173,1,'2010-09-01T02:05:00');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (89,2,'Normal Distribution-::of::-Probability and Statistics (Advanced Placement)','Students explore and learn about the standard normal probability distribution, the density curve of the normal distribution, and applications of the normal distribution.','Normal-Distribution-::of::-Probability-and-Statistics-(Advanced-Placement)',1,NULL, '2010-09-01T02:05:00');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (89, 89, 1, 0, '2010-09-01T02:05:00', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (89, 173);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 89, 5);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='Measures of Spread' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='Measures of Central Tendency' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='Summary Statistics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='Graphs and Plots' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='Data Representation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='Data Summary and Presentation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 89,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (89, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Normal Distribution' ,'Normal Distribution','Students explore and learn about the standard normal probability distribution, the density curve of the normal distribution, and applications of the normal distribution.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 89, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (174,1,'Planning and Conducting an Experiment or Study','Students explore and learn about surveys, sampling and experimental design.','174.xhtml','174.xhtml', MD5(CONCAT('174.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (174,174,1,'2010-09-01T02:05:00');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (90,2,'Planning and Conducting an Experiment or Study-::of::-Probability and Statistics (Advanced Placement)','Students explore and learn about surveys, sampling and experimental design.','Planning-and-Conducting-an-Experiment-or-Study-::of::-Probability-and-Statistics-(Advanced-Placement)',1,NULL, '2010-09-01T02:05:00');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (90, 90, 1, 0, '2010-09-01T02:05:00', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (90, 174);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 90, 6);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='Data Representation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='Data Summary and Presentation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='Data and Measurement Issues' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='Data Collection' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 90,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (90, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Planning and Conducting an Experiment or Study' ,'Planning and Conducting an Experiment or Study','Students explore and learn about surveys, sampling and experimental design.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 90, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (175,1,'Sampling Distributions and Estimations','This chapter covers sampling distributions and the Central Limit Theorem.','175.xhtml','175.xhtml', MD5(CONCAT('175.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (175,175,1,'2010-09-01T02:05:00');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (91,2,'Sampling Distributions and Estimations-::of::-Probability and Statistics (Advanced Placement)','This chapter covers sampling distributions and the Central Limit Theorem.','Sampling-Distributions-and-Estimations-::of::-Probability-and-Statistics-(Advanced-Placement)',1,NULL, '2010-09-01T02:05:00');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (91, 91, 1, 0, '2010-09-01T02:05:00', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (91, 175);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 91, 7);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='Discrete Distributions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='Univariate Distributions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 91,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (91, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Sampling Distributions and Estimations' ,'Sampling Distributions and Estimations','This chapter covers sampling distributions and the Central Limit Theorem.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 91, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (176,1,'Hypothesis Testing','Students explore and learn about hypothesis testing and the P-value, testing a proportion hypothesis, testing a mean hypothesis, and testing a hypothesis for dependent and independent samples.','176.xhtml','176.xhtml', MD5(CONCAT('176.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (176,176,1,'2010-09-01T02:05:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (92,2,'Hypothesis Testing-::of::-Probability and Statistics (Advanced Placement)','Students explore and learn about hypothesis testing and the P-value, testing a proportion hypothesis, testing a mean hypothesis, and testing a hypothesis for dependent and independent samples.','Hypothesis-Testing-::of::-Probability-and-Statistics-(Advanced-Placement)',1,NULL, '2010-09-01T02:05:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (92, 92, 1, 0, '2010-09-01T02:05:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (92, 176);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 92, 8);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Confidence Intervals' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Statistical Inference and Techniques' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Discrete Distributions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Univariate Distributions' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Sample Space and Events' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Elementary Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Measures of Spread' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Measures of Central Tendency' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Summary Statistics' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Data Summary and Presentation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Sampling and Surveys' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Data Collection' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 92,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (92, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Hypothesis Testing' ,'Hypothesis Testing','Students explore and learn about hypothesis testing and the P-value, testing a proportion hypothesis, testing a mean hypothesis, and testing a hypothesis for dependent and independent samples.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 92, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (177,1,'Regression and Correlation','Students explore and learn about scatterplots and linear correlation, Least-Squares regression, inferences about regression, and an introduction to multiple regression.','177.xhtml','177.xhtml', MD5(CONCAT('177.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (177,177,1,'2010-09-01T02:05:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (93,2,'Regression and Correlation-::of::-Probability and Statistics (Advanced Placement)','Students explore and learn about scatterplots and linear correlation, Least-Squares regression, inferences about regression, and an introduction to multiple regression.','Regression-and-Correlation-::of::-Probability-and-Statistics-(Advanced-Placement)',1,NULL, '2010-09-01T02:05:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (93, 93, 1, 0, '2010-09-01T02:05:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (93, 177);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 93, 9);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='Hypothesis Tests' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='Confidence Intervals' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='Statistical Inference and Techniques' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='Graphs and Plots' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='Data Representation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='Data Summary and Presentation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 93,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (93, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Regression and Correlation' ,'Regression and Correlation','Students explore and learn about scatterplots and linear correlation, Least-Squares regression, inferences about regression, and an introduction to multiple regression.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 93, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (178,1,'Chi-Square','Students explore and learn about the Goodness-of-Fit test, test of independence, and testing one variance.','178.xhtml','178.xhtml', MD5(CONCAT('178.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (178,178,1,'2010-09-01T02:05:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (94,2,'Chi-Square-::of::-Probability and Statistics (Advanced Placement)','Students explore and learn about the Goodness-of-Fit test, test of independence, and testing one variance.','Chi-Square-::of::-Probability-and-Statistics-(Advanced-Placement)',1,NULL, '2010-09-01T02:05:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (94, 94, 1, 0, '2010-09-01T02:05:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (94, 178);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 94, 10);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='Hypothesis Tests' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='Confidence Intervals' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='Statistical Inference and Techniques' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 94,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (94, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Chi-Square' ,'Chi-Square','Students explore and learn about the Goodness-of-Fit test, test of independence, and testing one variance.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 94, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (179,1,'Analysis of Variance and the F-Distribution','Students explore and learn about the F-Distribution and testing two variances, the One-Way ANOVA test, and the Two-Way ANOVA test.','179.xhtml','179.xhtml', MD5(CONCAT('179.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (179,179,1,'2010-09-01T02:05:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (95,2,'Analysis of Variance and the F-Distribution-::of::-Probability and Statistics (Advanced Placement)','Students explore and learn about the F-Distribution and testing two variances, the One-Way ANOVA test, and the Two-Way ANOVA test.','Analysis-of-Variance-and-the-F-Distribution-::of::-Probability-and-Statistics-(Advanced-Placement)',1,NULL, '2010-09-01T02:05:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (95, 95, 1, 0, '2010-09-01T02:05:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (95, 179);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 95, 11);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='Hypothesis Tests' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='Statistical Inference and Techniques' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='Data Representation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='Data Summary and Presentation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='twelve' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 95,id from BrowseTerms where name='ten' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (95, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Analysis of Variance and the F-Distribution' ,'Analysis of Variance and the F-Distribution','Students explore and learn about the F-Distribution and testing two variances, the One-Way ANOVA test, and the Two-Way ANOVA test.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 95, max(id) from `Standards`;
insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `handle`, `refHash`, `ownerID`, `languageID`) VALUES (180,1,'Non-Parametric Statistics','Students explore nonparametric statistics, the rank sum test and rank Correlation, and the Kruskal-Wallis test.','180.xhtml','180.xhtml', MD5(CONCAT('180.xhtml', 'contents', 'admin')), 1, 1);
insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (180,180,1,'2010-09-01T02:05:01');
insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `handle`, `creatorID`, `ancestorID`, `creationTime`)  values (96,2,'Non-Parametric Statistics-::of::-Probability and Statistics (Advanced Placement)','Students explore nonparametric statistics, the rank sum test and rank Correlation, and the Kruskal-Wallis test.','Non-Parametric-Statistics-::of::-Probability-and-Statistics-(Advanced-Placement)',1,NULL, '2010-09-01T02:05:01');
insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (96, 96, 1, 0, '2010-09-01T02:05:01', '2010-01-01T12:12:27Z');
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (96, 180);
insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (84, 96, 12);


INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='Regression and Correlation' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='Hypothesis Tests' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='Statistical Inference and Techniques' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='Statistics and Probability' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='Mathematics' and termTypeID =4 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='mathematics' and termTypeID = 3 ;
INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='ca' and termTypeID = 1 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='10' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='x' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='ten' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='11' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='xi' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='eleven' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='12' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='xii' and termTypeID =4 ;

INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select 96,id from BrowseTerms where name='twelve' and termTypeID =4 ;
insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (96, 168);

INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , 7 , 3 , 'Non-Parametric Statistics' ,'Non-Parametric Statistics','Students explore nonparametric statistics, the rank sum test and rank Correlation, and the Kruskal-Wallis test.'  from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 11 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 12 from `Standards`;
INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), 13 from `Standards`;
INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select 96, max(id) from `Standards`;
