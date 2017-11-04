DROP TRIGGER IF EXISTS flx2.T_fbs_groups;

DELIMITER | 
CREATE TRIGGER flx2.T_fbs_groups AFTER INSERT ON flx2.Groups
FOR EACH ROW BEGIN
    INSERT INTO ads.D_fbs_groups (groupID, `group`) select g.id, g.name from flx2.Groups g where g.id=NEW.id;
END
|

DELIMITER ;

DROP TRIGGER IF EXISTS flx2.T_fbs_groups_delete;

DELIMITER | 
CREATE TRIGGER flx2.T_fbs_groups_delete AFTER DELETE ON flx2.Groups
FOR EACH ROW BEGIN
    DELETE FROM ads.D_fbs_groups WHERE groupID=OLD.id;
END
|

DELIMITER ;

