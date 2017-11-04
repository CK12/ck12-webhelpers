alter table ArtifactRevisions add comment varchar(1024) DEFAULT NULL comment 'An optional log note about the revision.' after revision;
