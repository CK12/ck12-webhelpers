DROP TRIGGER IF EXISTS flexmath.T_subjects;

DELIMITER | 
CREATE TRIGGER flexmath.T_subjects AFTER INSERT ON flexmath.Components
FOR EACH ROW BEGIN
    INSERT INTO ads.D_subjects (subjectID, subject, unitID, unit, lessonID, lesson, componentID, component) select s.id, s.title, u.id, u.code, l.id, l.code, c.id, c.title from flexmath.Components c, flexmath.Lessons l, flexmath.Units u, flexmath.Subjects s where c.lessonID=l.id and l.unitID=u.id and u.subjectID=s.id and c.id=NEW.id;
END
|

DELIMITER ;

DROP TRIGGER IF EXISTS flexmath.T_subjects_delete;

DELIMITER | 
CREATE TRIGGER flexmath.T_subjects_delete AFTER DELETE ON flexmath.Components
FOR EACH ROW BEGIN
    DELETE FROM ads.D_subjects WHERE componentID=OLD.id;
END
|

DELIMITER ;

