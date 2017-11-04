DROP TRIGGER IF EXISTS flx2.T_artifacts;

DELIMITER | 
CREATE TRIGGER flx2.T_artifacts AFTER INSERT ON flx2.Artifacts
FOR EACH ROW BEGIN
    INSERT INTO ads.D_artifacts (tag, artifactID, artifact) select ifnull(s.name, 'Misc'), a.id, substring_index(a.name, '-::of::-', 1) from flx2.Artifacts a left outer join taxonomy.Subjects s on s.shortname=substring_index(substring_index(trim(leading 'CK.' from a.encodedID), '.', 1), '.', -1) where a.id=NEW.id;   
END
|

DELIMITER ;

