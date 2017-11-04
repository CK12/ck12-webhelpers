DROP TABLE IF EXISTS `application_path`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_path` (
  `application_id` int(11) DEFAULT NULL,
  `path_id` int(11) DEFAULT NULL,
  KEY `application_id` (`application_id`),
  KEY `path_id` (`path_id`),
  CONSTRAINT `application_path_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`),
  CONSTRAINT `application_path_ibfk_2` FOREIGN KEY (`path_id`) REFERENCES `path` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO application_path(application_id,path_id) (SELECT app.id, path.id FROM application AS app, path AS path WHERE app.path_id=path.id);

ALTER TABLE application DROP FOREIGN KEY application_ibfk_1;
ALTER TABLE application DROP COLUMN path_id;

ALTER TABLE application MODIFY hash VARCHAR(255);

ALTER TABLE application ADD UNIQUE (hash);

