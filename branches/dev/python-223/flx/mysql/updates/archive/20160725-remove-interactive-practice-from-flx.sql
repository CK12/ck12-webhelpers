update ArtifactTypes set modality = 0 where name = 'asmtpracticeint';
delete from RelatedArtifacts where artifactID in (select id from Artifacts where artifactTypeID = (select id from ArtifactTypes where name = 'asmtpracticeint'));
