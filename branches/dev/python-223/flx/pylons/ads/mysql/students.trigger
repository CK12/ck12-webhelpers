DROP TRIGGER IF EXISTS flexmath.T_students;

DELIMITER | 
CREATE TRIGGER flexmath.T_students AFTER INSERT ON flexmath.Members
FOR EACH ROW BEGIN
    INSERT INTO ads.D_students (studentID, student) select m.id, if(concat(ifnull(m.firstName, ''), ' ', ifnull(m.lastName, '')) = ' ', m.email, concat(ifnull(m.firstName, ''), ' ', ifnull(m.lastName, ''))) from flexmath.Members m, flexmath.MemberRoles mr where m.roleID=mr.id and mr.name='Student' and m.id=NEW.id;   
END
|

DELIMITER ;

DROP TRIGGER IF EXISTS flexmath.T_students_update;

DELIMITER | 
CREATE TRIGGER flexmath.T_students_update AFTER UPDATE ON flexmath.Members
FOR EACH ROW BEGIN
    SELECT 1 INTO @existing FROM ads.D_students WHERE studentID=OLD.id; 
    IF @existing THEN
        UPDATE ads.D_students SET student = (select if(concat(ifnull(m.firstName, ''), ' ', ifnull(m.lastName, '')) = ' ', m.email, concat(ifnull(m.firstName, ''), ' ', ifnull(m.lastName, ''))) from flexmath.Members m, flexmath.MemberRoles mr where m.roleID=mr.id and m.id=OLD.id) WHERE studentID=OLD.id;   
    ELSE
        INSERT INTO ads.D_students (studentID, student) select m.id, if(concat(ifnull(m.firstName, ''), ' ', ifnull(m.lastName, '')) = ' ', m.email, concat(ifnull(m.firstName, ''), ' ', ifnull(m.lastName, ''))) from flexmath.Members m, flexmath.MemberRoles mr where m.roleID=mr.id and mr.name='Student' and m.id=OLD.id;   
    END IF;
END
|

DELIMITER ;

DROP TRIGGER IF EXISTS flexmath.T_students_delete;

DELIMITER | 
CREATE TRIGGER flexmath.T_students_delete AFTER DELETE ON flexmath.Members
FOR EACH ROW BEGIN
    DELETE FROM ads.D_students WHERE studentID=OLD.id;   
END
|

DELIMITER ;
