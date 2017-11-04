update ArtifactAuthors set name = 'CK-12 Foundation' where name like '%annamaria%' and name like '%farbizio%';

update ArtifactAuthors set name = 'CK-12 Foundation' where name like '%joy%' and name like '%sheng%';

update ArtifactAuthors set name = 'CK-12 Foundation' where name like '%juli%' and name like '%weiss%';

update ArtifactAttributers set givenName='CK-12 Foundation', surName=NULL where givenName like '%annamaria%' and givenName  like '%farbizio%';

update ArtifactAttributers set givenName='CK-12 Foundation', surName=NULL where givenName like '%joy%' and givenName like '%sheng%';

update ArtifactAttributers set givenName='CK-12 Foundation', surName=NULL where givenName like '%juli%' and givenName like '%weiss%';
