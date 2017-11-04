ALTER TABLE From1xChapters ADD COLUMN `memberID` int(11) NOT NULL;
UPDATE From1xChapters SET memberID = ( SELECT a.creatorID FROM Artifacts a WHERE a.id = artifactID );
ALTER TABLE From1xChapters DROP PRIMARY KEY;
ALTER TABLE From1xChapters ADD PRIMARY KEY (`cid`, `memberID`);
ALTER TABLE From1xChapters ADD CONSTRAINT `From1xChapters_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `From1xBookMembers`(`memberID`) ON DELETE CASCADE ON UPDATE NO ACTION;
