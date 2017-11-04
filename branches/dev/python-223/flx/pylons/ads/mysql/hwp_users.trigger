DROP TRIGGER IF EXISTS homeworkpedia.T_users;

DELIMITER | 
CREATE TRIGGER homeworkpedia.T_users AFTER INSERT ON homeworkpedia.Users
FOR EACH ROW BEGIN
    INSERT INTO ads.D_hwp_users (userID, user) select u.id, u.email from homeworkpedia.Users u where u.id=NEW.id;
END
|

DELIMITER ;

