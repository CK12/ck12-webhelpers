SELECT
    'problem_id','skill_id','topic_id','unit_id','subject_id','course_id'
UNION ALL
SELECT
    id, skill_id, topic_id, unit_id, subject_id, course_id                                                                                                                                                     
INTO OUTFILE '/tmp/bg-problems.csv'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
FROM
    problems
;
