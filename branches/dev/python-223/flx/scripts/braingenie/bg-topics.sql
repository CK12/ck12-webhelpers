SELECT
    'topic_id','name','unit_id','ck12_eid','ck12_url'
UNION ALL
SELECT
    id, REPLACE(name, ',', '\\,'), unit_id, IFNULL(ck12_eid, ''), IFNULL(ck12_url, '')                                                                                                                         
INTO OUTFILE '/tmp/bg-topics.csv'
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
FROM
    topics
;
