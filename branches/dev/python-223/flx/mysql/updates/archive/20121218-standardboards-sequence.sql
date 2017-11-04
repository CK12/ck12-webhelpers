ALTER TABLE `StandardBoards` ADD `sequence` int(11) DEFAULT NULL COMMENT 'The ordering of standard boards';

UPDATE `StandardBoards` SET sequence = 10 WHERE name = 'CC';
UPDATE `StandardBoards` SET sequence = 20 WHERE name = 'NSES';
UPDATE `StandardBoards` SET sequence = 30 WHERE name = 'AP';
UPDATE `StandardBoards` SET sequence = 40 WHERE name = 'NCERT';

UPDATE `StandardBoards` SET longname = 'CCSS' where name = 'CC';
UPDATE `StandardBoards` SET longname = 'NSES' where name = 'NSES';
UPDATE `StandardBoards` SET longname = 'AP' where name = 'AP';
UPDATE `StandardBoards` SET longname = 'NCERT' where name = 'NCERT';

DELETE FROM `StandardBoards` WHERE name in ('AS', 'FM', 'GU', 'MH', 'MP', 'PW', 'VI', 'AAAS', 'MCR', 'NGSS');

UPDATE `StandardBoards` SET sequence = 1000 WHERE sequence IS NULL;
