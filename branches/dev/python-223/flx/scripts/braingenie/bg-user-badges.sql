SELECT
    'student_id','prestige_level','count'
UNION ALL
SELECT
    sbr.student_id, b.prestige, count(*) as count
INTO OUTFILE '/tmp/bg-user-badges.csv'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
FROM
    student_badge_records sbr,
    badges b,
    users u
WHERE
    sbr.student_id = u.id AND
    u.registered = 1 AND                                                                                                                                                                                       
    sbr.badge_id = b.id
GROUP BY
    sbr.student_id, b.prestige
;
