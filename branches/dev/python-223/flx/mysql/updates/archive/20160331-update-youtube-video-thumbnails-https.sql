update EmbeddedObjects set thumbnail = replace(thumbnail, 'http://', 'https://') where providerID = 1 and thumbnail like 'http://img.youtube.com/%';
update EmbeddedObjects set thumbnail = replace(thumbnail, 'http://', 'https://') where providerID = 1 and thumbnail like 'http://%.ytimg.com/%';
