update Artifacts set name = CONCAT(name, ' (Being Reviewed)') where artifactTypeID in (1,9) and creatorID = 3 and name not like '%Concept%' and name not like '%reviewed%';