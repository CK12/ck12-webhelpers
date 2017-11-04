update Artifacts set handle=substring_index(handle, '-::rev::-', 1) where handle like '%-::rev::-%' and handle not like '%-::of::-%' and creatorID = 3 and artifactTypeID in (3, 4, 8);
