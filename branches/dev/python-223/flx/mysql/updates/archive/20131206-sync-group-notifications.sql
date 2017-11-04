BEGIN;
DELETE FROM Notifications WHERE eventTypeID IN (SELECT id FROM EventTypes WHERE name IN ('ASSIGNMENT_ASSIGNED', 'ASSIGNMENT_DELETED'));
INSERT INTO Notifications (eventTypeID, type, subscriberID, groupID, frequency)
    SELECT t1.eventTypeID, t2.type, t2.subscriberID, t2.groupID, t2.frequency
        FROM
            (SELECT id AS eventTypeID FROM EventTypes WHERE name = 'ASSIGNMENT_ASSIGNED') AS t1,
            (SELECT type, subscriberID, groupID, frequency FROM Notifications WHERE eventTypeID = (SELECT id FROM EventTypes WHERE name = 'GROUP_SHARE')) AS t2;
INSERT INTO Notifications (eventTypeID, type, subscriberID, groupID, frequency)
    SELECT t1.eventTypeID, t2.type, t2.subscriberID, t2.groupID, t2.frequency
        FROM
            (SELECT id AS eventTypeID FROM EventTypes WHERE name = 'ASSIGNMENT_DELETED') AS t1,
            (SELECT type, subscriberID, groupID, frequency FROM Notifications WHERE eventTypeID = (SELECT id FROM EventTypes WHERE name = 'GROUP_SHARE')) AS t2;
DELETE FROM Notifications WHERE groupID IN (
        SELECT groupID FROM GroupHasMembers WHERE roleID = 15 AND groupID IN (SELECT id FROM Groups WHERE isActive = 1 AND id NOT IN (1,2))
    ) AND eventTypeID = (SELECT id FROM EventTypes WHERE name = 'GROUP_MEMBER_JOINED');
INSERT INTO Notifications (eventTypeID, type, subscriberID, groupID, frequency)
    SELECT t1.eventTypeID, t2.type, t2.subscriberID, t2.groupID, t2.frequency
        FROM
            (SELECT id AS eventTypeID FROM EventTypes WHERE name = 'GROUP_MEMBER_JOINED') AS t1,
            (SELECT t3.type, t3.subscriberID, t3.groupID, t3.frequency
                FROM Notifications AS t3 JOIN (
                    SELECT groupID, memberID FROM GroupHasMembers AS gm WHERE gm.roleID = 15 AND gm.groupID IN (
                        SELECT id FROM Groups WHERE isActive = 1 AND id NOT IN (1,2)
                    )
                ) AS t4
                ON t3.groupID = t4.groupID AND t3.subscriberID = t4.memberID WHERE t3.eventTypeID = (
                    SELECT id FROM EventTypes WHERE name = 'GROUP_SHARE'
                )
            ) AS t2;
COMMIT;
