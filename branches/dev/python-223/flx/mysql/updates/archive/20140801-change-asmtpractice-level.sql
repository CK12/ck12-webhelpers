BEGIN;

    update ArtifactHasBrowseTerms set browseTermID = (select id from BrowseTerms where name='at grade' and termTypeID=7) where browseTermID = (select id from BrowseTerms where name = 'basic' and termTypeID = 7) and artifactID in (select id from Artifacts where artifactTypeID=53 and creatorID=3);

COMMIT;
