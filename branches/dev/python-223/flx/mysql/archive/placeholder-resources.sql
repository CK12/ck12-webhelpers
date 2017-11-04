-- MySQL dump 10.13  Distrib 5.1.41, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: flx2
-- ------------------------------------------------------
-- Server version	5.1.41-3ubuntu12.10

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `Resources`
--
-- WHERE:  id >= 326

LOCK TABLES `Resources` WRITE;
/*!40000 ALTER TABLE `Resources` DISABLE KEYS */;
INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `handle`, `description`, `authors`, `license`, `uri`, `refHash`, `checksum`, `satelliteUrl`, `ownerID`, `languageID`, `isExternal`, `isAttachment`, `creationTime`) VALUES (326,4,'emb_video_copyright.png','emb_video_copyright.png','',NULL,NULL,'emb_video_copyright.png','5428993a63fc3df1cb3d358169ae5e1e',NULL,NULL,1,1,0,0,'2012-04-26 18:38:29'),(327,4,'emb_video_inapp.png','emb_video_inapp.png','',NULL,NULL,'emb_video_inapp.png','d02102f4bb9b4569d7feefb98b83d318',NULL,NULL,1,1,0,0,'2012-04-26 18:38:29'),(328,4,'emb_video_malcontent.png','emb_video_malcontent.png','',NULL,NULL,'emb_video_malcontent.png','7f8cfc6dcf3fa31ac00b65e02586a6d1',NULL,NULL,1,1,0,0,'2012-04-26 18:38:30'),(329,4,'emb_video_na.png','emb_video_na.png','',NULL,NULL,'emb_video_na.png','ac2aebd2191113be13585487c9704432',NULL,NULL,1,1,0,0,'2012-04-26 18:38:30'),(330,4,'imgdisabled_copyright.jpg','imgdisabled_copyright.jpg','',NULL,NULL,'imgdisabled_copyright.jpg','647f3b75e30c4ccbda2a308102490e85',NULL,NULL,1,1,0,0,'2012-04-26 18:38:31'),(331,4,'imgdisabled_disable.jpg','imgdisabled_disable.jpg','',NULL,NULL,'imgdisabled_disable.jpg','a49730bbefd74bd0483237d92dc75808',NULL,NULL,1,1,0,0,'2012-04-26 18:38:31'),(332,4,'imgdisabled_inappropriate.jpg','imgdisabled_inappropriate.jpg','',NULL,NULL,'imgdisabled_inappropriate.jpg','a4207b02072702e9f3054c2f06b6269b',NULL,NULL,1,1,0,0,'2012-04-26 18:38:32');
/*!40000 ALTER TABLE `Resources` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2012-04-26 11:40:25
-- MySQL dump 10.13  Distrib 5.1.41, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: flx2
-- ------------------------------------------------------
-- Server version	5.1.41-3ubuntu12.10

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `ResourceRevisions`
--
-- WHERE:  resourceID >= 326

LOCK TABLES `ResourceRevisions` WRITE;
/*!40000 ALTER TABLE `ResourceRevisions` DISABLE KEYS */;
INSERT INTO `ResourceRevisions` (`id`, `resourceID`, `revision`, `hash`, `filesize`, `creationTime`, `publishTime`) VALUES (326,326,'1','fb69b2f23e03995f1417d748aa7c4976',4557,'2012-04-26 18:38:29',NULL),(327,327,'1','c2f0990b7652516f83073ad54d67c7d1',4506,'2012-04-26 18:38:29',NULL),(328,328,'1','7a966df41b7742426fb7e31f81ee5693',4398,'2012-04-26 18:38:30',NULL),(329,329,'1','7f436969e24f1ced5396acb7afe4153a',4965,'2012-04-26 18:38:30',NULL),(330,330,'1','0f18442754070e6a9cbd8ffe08ac6626',14215,'2012-04-26 18:38:31',NULL),(331,331,'1','ba1f73b9ad351e7085fced339ca61610',13956,'2012-04-26 18:38:31',NULL),(332,332,'1','f3664dcd1bb887cdb3d12b0b275d904f',14053,'2012-04-26 18:38:32',NULL);
/*!40000 ALTER TABLE `ResourceRevisions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2012-04-26 11:40:41
