INSERT IGNORE INTO BrowseTerms (name, encodedID, termTypeID, parentID, handle) SELECT 'Life Science', 'SCI.LSC', 4, id, 'Life-Science' FROM BrowseTerms WHERE encodedID = 'SCI';
INSERT IGNORE INTO BrowseTerms (name, encodedID, termTypeID, parentID, handle) SELECT 'Physical Science', 'SCI.PSC', 4, id, 'Physical-Science' FROM BrowseTerms WHERE encodedID = 'SCI';
