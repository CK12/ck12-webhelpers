DROP TRIGGER IF EXISTS flexmath.T_groups;

DELIMITER | 
CREATE TRIGGER flexmath.T_groups AFTER INSERT ON flexmath.Groups
FOR EACH ROW BEGIN
    INSERT INTO ads.D_groups (groupID, `group`) select g.id, g.name from flexmath.Groups g where g.id=NEW.id;
END
|

DELIMITER ;

DROP TRIGGER IF EXISTS flexmath.T_groups_delete;

DELIMITER | 
CREATE TRIGGER flexmath.T_groups_delete AFTER DELETE ON flexmath.Groups
FOR EACH ROW BEGIN
    DELETE FROM ads.D_groups WHERE groupID=OLD.id;
END
|

DELIMITER ;

