SELECT
    'user_id','first_name','last_name','email','role','registration_time','grade','gender','avatar','genie_gold_points'
UNION ALL
SELECT
    id, IFNULL(first_name, ''), IFNULL(last_name, ''), IFNULL(email, ''), type, created_at, IFNULL(grade, ''), IFNULL(gender, ''), IFNULL(avatar, ''), genie_gold                                              
INTO OUTFILE '/tmp/bg-users.csv'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
FROM
    users
WHERE
    registered = 1
;
