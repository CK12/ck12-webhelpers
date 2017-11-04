--
-- Dumping data for table `ResourceTypes`
--

LOCK TABLES `ResourceTypes` WRITE;
/*!40000 ALTER TABLE `ResourceTypes` DISABLE KEYS */;
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (1, 'contents', 'The contents resource', 1, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (2, 'cover page', 'The cover page image resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (3, 'cover page icon', 'The cover page icon resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (4, 'image', 'The image resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (5, 'expression', 'The expression resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (6, 'audio', 'The audio resource', 0, 1);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (7, 'video', 'The video resource', 0, 1);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (8, 'equation', 'The equation images, generated via latex', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (9, 'cover video', 'The first video in a concept, to be used as cover', 0, 1);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (10, 'attachment', 'Any opaque object to be attached to an artifact', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (11, 'pdf', 'The PDF resource - PDF manifestation of the content', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (12, 'epub', 'The ePub resource - ePub manifestation of the content', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (13, 'html', 'The html resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (14, 'mobi', 'The mobi resource - mobi manifestation of the content', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (15, 'interactive', 'Interactive object resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (16, 'studyguide', 'The Study Guide resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (17, 'lessonplan', 'The Lesson Plan resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (18, 'epubk', 'The ePub resource for kindle - ePub manifestation of the content', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (19, 'activity', 'The activity type resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (20, 'assessment', 'The assessment type resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (21, 'worksheet', 'The worksheet type resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (22, 'quiz', 'The test/quiz type resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (23, 'classwork', 'The classwork type resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (24, 'homework', 'The homework type resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (25, 'handout', 'The handout type resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (26, 'rubric', 'The rubric type resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (27, 'notes', 'The notes type resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (28, 'project', 'The project/lab type resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (29, 'starter', 'The starter/do now type resource', 0, 0);
INSERT IGNORE INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES (30, 'syllabus', 'The syllabus type resource', 0, 0);
/*!40000 ALTER TABLE `ResourceTypes` ENABLE KEYS */;
UNLOCK TABLES;



