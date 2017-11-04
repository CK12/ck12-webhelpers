INSERT IGNORE INTO `RelatedArtifacts` (`domainID`, `sequence`, `artifactID`) SELECT bt.id, SUBSTRING_INDEX(a.encodedID, '.', -1), a.id FROM Artifacts a, BrowseTerms bt, ArtifactHasBrowseTerms ab WHERE a.creatorID = 3 AND a.artifactTypeID = 3 AND a.id = ab.artifactID and ab.browseTermID = bt.id AND bt.termTypeID = 4 AND a.encodedID is not null;

