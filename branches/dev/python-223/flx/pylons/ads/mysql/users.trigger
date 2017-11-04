DROP TRIGGER IF EXISTS flx2.T_users;

DELIMITER | 
CREATE TRIGGER flx2.T_users AFTER INSERT ON flx2.Members
FOR EACH ROW BEGIN
    INSERT INTO ads.D_users (userID, user) select id, email from flx2.Members m where m.id=NEW.id;   
END
|

DELIMITER ;

