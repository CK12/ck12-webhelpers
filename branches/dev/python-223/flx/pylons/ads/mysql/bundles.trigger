DROP TRIGGER IF EXISTS homeworkpedia.T_bundles;

DELIMITER | 
CREATE TRIGGER homeworkpedia.T_bundles AFTER INSERT ON homeworkpedia.ExerciseBundle
FOR EACH ROW BEGIN
    INSERT INTO ads.D_bundles (bundleID, bundle) select b.id, b.title from homeworkpedia.ExerciseBundle b WHERE b.id=NEW.id;
END
|

DELIMITER ;

