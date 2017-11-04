LOCK TABLES `Tasks` WRITE;
INSERT INTO `Tasks` (`name`, `taskID`, `status`, `userdata`, `started`, `updated`) 
VALUES ('CompressImagesTask', 'compressimages-randomtaskid-1', 'SUCCESS', '{"last_resourceid":736646}',now(), now()); 
UNLOCK TABLES;
