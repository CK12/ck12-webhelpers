BEGIN;
    UPDATE
        Groups g 
        JOIN
        (SELECT gm1.groupID, gm2.memberID
            FROM
                GroupHasMembers gm2,
                (SELECT gm.groupID, g.creatorID
                    FROM Groups g, GroupHasMembers gm
                    WHERE g.id = gm.groupID AND g.creatorID = gm.memberID AND gm.roleID = 14
                ) AS gm1
            WHERE gm1.groupID = gm2.groupID AND gm2.roleID = 15
        ) AS t
        ON g.id = t.groupID
        SET g.creatorID = t.memberID;
COMMIT;
