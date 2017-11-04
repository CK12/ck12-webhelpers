INSERT INTO Notifications (eventTypeID, type, frequency, groupID)
    SELECT t1.eventTypeID, 'web', 'ondemand', t2.groupID
        FROM (SELECT id AS eventTypeID FROM EventTypes WHERE name = 'GROUP_MEMBER_JOINED_WEB') AS t1, (SELECT id as groupID FROM Groups WHERE id != 1) AS t2;
