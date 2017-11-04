SELECT
    'unit_quiz_id','problem_id','display_order','skill_id','student_id'
UNION ALL
SELECT
    uqpa.unit_quiz_id, uqpa.problem_id, uqpa.display_order, p.skill_id, uq.student_id
INTO OUTFILE '/tmp/bg-unit-quiz-problems.csv'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
FROM
    unit_quiz_problem_associations uqpa,
    unit_quizzes uq,
    problems p,
    users u
WHERE
    uqpa.unit_quiz_id = uq.id AND
    uqpa.problem_id = p.id AND                                                                                                                                                                                 
    uq.student_id = u.id AND
    u.registered = 1
;
