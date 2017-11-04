update Artifacts set handle = REPLACE(handle, ':', '')  where creatorID = 3 and handle like '%:%' and artifactTypeID in (3,4);
