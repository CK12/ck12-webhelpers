--
-- Dumping data for table `ConceptKeywords`
--

LOCK TABLE `ConceptKeywords` WRITE;
/*!40000 ALTER TABLE `ConceptKeywords` DISABLE KEYS */;
INSERT INTO `ConceptKeywords` (`name`) VALUES
('addition'),
('subtraction'),
('multiplication'),
('division');
/*!40000 ALTER TABLE `ConceptKeywords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ConceptNodeHasKeywords`
-- 

SELECT `id` INTO @keywordID FROM `ConceptKeywords` WHERE `name` = 'addition';
INSERT INTO `ConceptNodeHasKeywords` (`conceptNodeID`, `keywordID`) select id, @keywordID from `ConceptNodes` WHERE `name` like '%addition%';
SELECT `id` INTO @keywordID FROM `ConceptKeywords` WHERE `name` = 'subtraction';
INSERT INTO `ConceptNodeHasKeywords` (`conceptNodeID`, `keywordID`) select id, @keywordID from `ConceptNodes` WHERE `name` like '%subtraction%';
SELECT `id` INTO @keywordID FROM `ConceptKeywords` WHERE `name` = 'multiplication';
INSERT INTO `ConceptNodeHasKeywords` (`conceptNodeID`, `keywordID`) select id, @keywordID from `ConceptNodes` WHERE `name` like '%multiplication%';
SELECT `id` INTO @keywordID FROM `ConceptKeywords` WHERE `name` = 'division';
INSERT INTO `ConceptNodeHasKeywords` (`conceptNodeID`, `keywordID`) select id, @keywordID from `ConceptNodes` WHERE `name` like '%division%';
