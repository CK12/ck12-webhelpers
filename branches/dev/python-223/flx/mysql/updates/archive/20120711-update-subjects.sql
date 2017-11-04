INSERT IGNORE INTO Subjects (name) VALUES ('probability');
INSERT IGNORE INTO Subjects (name) VALUES ('statistics');
UPDATE Subjects set name = 'probability and statistics' WHERE name = 'statistics and probability';
