LOCK TABLES `ResourceTypes` WRITE;
/*!40000 ALTER TABLE `ResourceTypes` DISABLE KEYS */;
INSERT INTO `ResourceTypes` (`id`, `name`, `description`, `versionable`, `streamable`) VALUES
(31, 'web', 'The web resource', 0, 0),
(32, 'reading', 'The reading resource', 0, 0),
(33, 'presentation', 'The presentation resource', 0, 0),
(34, 'lab', 'The lab resource', 0, 0),
(35, 'cthink', 'The critical thinking resource', 0, 0);
/*!40000 ALTER TABLE `ResourceTypes` ENABLE KEYS */;
UNLOCK TABLES;

