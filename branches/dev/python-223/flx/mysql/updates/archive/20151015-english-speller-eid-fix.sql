update Artifacts set encodedID = 'CK.ENG.ENG.TE.1.Basic-Speller-Orig' where encodedID = 'CK.ENG.ENG.TE.1.Basic-Speller' and creatorID = 3 and id < 10000;
update Artifacts set encodedID = 'CK.ENG.ENG.SE.1.Basic-Speller-Orig' where encodedID = 'CK.ENG.ENG.SE.1.Basic-Speller' and creatorID = 3 and id < 10000;
update Artifacts set encodedID = 'CK.ENG.ENG.TE.1.Basic-Speller' where handle = 'Basic-Speller-Teacher-Materials' and creatorID = 3 and encodedID is null;
update Artifacts set encodedID = 'CK.ENG.ENG.SE.1.Basic-Speller' where handle = 'Basic-Speller-Student-Materials' and creatorID = 3 and encodedID is null;

select @term := id from BrowseTerms where name = 'spelling' and termTypeID = 3;
INSERT IGNORE INTO ArtifactHasBrowseTerms (artifactID, browseTermID) SELECT id, @term from Artifacts where encodedID = 'CK.ENG.ENG.SE.1.Basic-Speller' and creatorID = 3;
INSERT IGNORE INTO ArtifactHasBrowseTerms (artifactID, browseTermID) SELECT id, @term from Artifacts where encodedID = 'CK.ENG.ENG.TE.1.Basic-Speller' and creatorID = 3;

DELETE FROM ArtifactHasBrowseTerms WHERE browseTermID = @term AND artifactID = (SELECT id from Artifacts where handle = 'The-Glyfada-Method' and creatorID = 3 and artifactTypeID = 1);
DELETE FROM ArtifactHasBrowseTerms WHERE browseTermID = @term AND artifactID = (SELECT id from Artifacts where handle = 'Commonsense-Composition' and creatorID = 3 and artifactTypeID = 1);
DELETE FROM ArtifactHasBrowseTerms WHERE browseTermID = @term AND artifactID = (SELECT id from Artifacts where handle = 'Journalism-101' and creatorID = 3 and artifactTypeID = 1);

select @term := id from BrowseTerms where name = 'writing' and termTypeID = 3;
INSERT IGNORE INTO ArtifactHasBrowseTerms (artifactID, browseTermID) SELECT id, @term from Artifacts where handle = 'The-Glyfada-Method' and creatorID = 3 and artifactTypeID = 1;
INSERT IGNORE INTO ArtifactHasBrowseTerms (artifactID, browseTermID) SELECT id, @term from Artifacts where handle = 'Commonsense-Composition' and creatorID = 3 and artifactTypeID = 1;
INSERT IGNORE INTO ArtifactHasBrowseTerms (artifactID, browseTermID) SELECT id, @term from Artifacts where handle = 'Journalism-101' and creatorID = 3 and artifactTypeID = 1;

