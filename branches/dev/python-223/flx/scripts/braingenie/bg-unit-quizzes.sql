SELECT
    'unit_quiz_id','student_id','unit_id','passed_at','failed_at','updated_at','difficulty','time_spent','attempted','correct','incorrect','total'
UNION ALL
SELECT
    uq.id, uq.student_id, uq.unit_id, IFNULL(uq.passed_at, ''), IFNULL(uq.failed_at, ''), uq.updated_at, IFNULL(ut.difficulty, ''), uq.time_spent, uq.attempted, uq.correct, uq.incorrect, uq.total
INTO OUTFILE '/tmp/bg-unit-quizzes.csv'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
FROM
    unit_quizzes uq,
    units ut,
    users u
WHERE
    uq.student_id = u.id AND
    uq.unit_id = ut.id AND
    u.registered = 1
;
