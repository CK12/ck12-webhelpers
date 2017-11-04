SELECT
    'student_id','game_id','score','time_spent','completed_at'
UNION ALL
SELECT
    gsa.student_id, g.id, gsa.score, gsa.time_spent, g.completed_at
INTO OUTFILE '/tmp/bg-user-game-winners.csv'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
FROM
    game_student_associations gsa,
    games g,
    users u
WHERE
    gsa.student_id = u.id AND
    u.registered = 1 AND                                                                                                                                                                                       
    gsa.student_id = g.winner_id AND
    gsa.score > 0 AND
    gsa.time_spent > 0
;
