update Notifications set objectID = groupID where objectType = 'group' and objectID = null  and groupID is not null and frequency = 'instant';
update Notifications set objectID = id, objectType = '--patch--' where frequency = 'instant' and objectID is null and lastSent is not null;
