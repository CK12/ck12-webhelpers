update Resources set handle = SUBSTRING_INDEX(uri, '/', -1), uri = satelliteUrl, satelliteUrl = null, checksum = null where handle = 'cover_lesson_generic.png' and resourceTypeID = 2 and isExternal = 1 and uri like 'http://%.ck12.org%' ;
