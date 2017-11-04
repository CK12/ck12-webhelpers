LOCK TABLES `EmbeddedObjectProviders` WRITE, `EmbeddedObjects` WRITE;
/*!40000 ALTER TABLE `EmbeddedObjectProviders` DISABLE KEYS */;
INSERT INTO `EmbeddedObjectProviders` VALUES 
(52, 'DMDEntertainment', '*.dmdentertainment.com', 0, 0, NOW(), NULL),
(53, 'Colorado', '*.colorado.edu', 0, 0, NOW(), NULL);
/*!40000 ALTER TABLE `EmbeddedObjectProviders` ENABLE KEYS */;
UNLOCK TABLES;
