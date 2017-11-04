create table dupl_level_artifacts select distinct(id) from ArtifactsAndBrowseTerms where termTypeID = 7 group by id having count(browseTermID) > 1 order by id;
delete from ArtifactHasBrowseTerms where artifactID in (select id from dupl_level_artifacts) and browseTermID = (select id from BrowseTerms where termTypeID=7 and name='At Grade');
drop table dupl_level_artifacts;

update ArtifactHasBrowseTerms set browseTermID = (select id from BrowseTerms where name = 'at grade' and termTypeID = 7) where browseTermID = (select id from BrowseTerms where name = 'null' and termTypeID = 7);
delete from BrowseTerms where name = 'null' and termTypeID = 7;

update ArtifactHasBrowseTerms set browseTermID = (select id from BrowseTerms where name = 'at grade' and termTypeID = 7) where browseTermID = (select id from BrowseTerms where name = 'Intermediate' and termTypeID = 7);
delete from BrowseTerms where name = 'Intermediate' and termTypeID = 7;

update ArtifactHasBrowseTerms set browseTermID = (select id from BrowseTerms where name = 'at grade' and termTypeID = 7) where browseTermID = (select id from BrowseTerms where name = 'selected' and termTypeID = 7);
delete from BrowseTerms where name = 'selected' and termTypeID = 7;

update ArtifactHasBrowseTerms set browseTermID = (select id from BrowseTerms where name = 'basic' and termTypeID = 7) where browseTermID = (select id from BrowseTerms where name = 'Beginner' and termTypeID = 7);
delete from BrowseTerms where name = 'Beginner' and termTypeID = 7;


