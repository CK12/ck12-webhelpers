DROP TABLE IF EXISTS ads.X_new_revisions;

CREATE TABLE ads.X_new_revisions (
	childID	INT,
	parentID INT
);

DROP TRIGGER IF EXISTS ads.T_books;

DELIMITER | 

CREATE TRIGGER ads.T_books AFTER INSERT ON ads.B_revisions
FOR EACH ROW BEGIN
    --
	-- Defer update of book dimension to scheduled update_books_dim (see below).
	-- This is because Percona XtraDB will grab S locks for tables accessed in
	-- select statement in trigger. This will cause deadlock with transactions
	-- trying to update ArtifactRevisions.downloads (the update is done from
	-- parent revisions down to all descendant revisions).
	--
	INSERT INTO ads.X_new_revisions (childID, parentID) values (NEW.childID, NEW.parentID);
END
|

DELIMITER ;

DROP EVENT IF EXISTS ads.update_books_dim;

DELIMITER | 

CREATE EVENT ads.update_books_dim
ON SCHEDULE EVERY 5 MINUTE STARTS CURRENT_TIMESTAMP DO
BEGIN
	DECLARE done INT DEFAULT 0;
	DECLARE _tag, _branch, _book, _concept VARCHAR(1024);
	DECLARE _branchID, _bookID, _conceptID INT;			
	DECLARE c CURSOR FOR 
		SELECT distinct d.tag, tb.id, tb.name, r2.artifactID, substring_index(a2.name, '-::of::-', 1), r.artifactID, substring_index(a.name, '-::of::-', 1)
			FROM X_new_revisions nr, flx2.ArtifactRevisions r, B_revisions b, D_artifacts d, flx2.ArtifactRevisions r2, flx2.Artifacts a2, flx2.ArtifactTypes t2, flx2.Artifacts a
			LEFT JOIN taxonomy.Branches tb ON tb.shortname=substring_index(substring_index(a.encodedID, '.', 2), '.', -1) 
			WHERE r.artifactID=a.id AND r.id=b.childID AND b.parentID=r2.id AND r2.artifactID=a2.id AND a2.artifactTypeID=t2.id AND t2.name='book' AND a.id=d.artifactID AND r.id=nr.childID AND r2.id=nr.parentID;

	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

	START TRANSACTION;
	OPEN c;

	REPEAT
		FETCH c INTO _tag, _branchID, _branch, _bookID, _book, _conceptID, _concept;
		IF not done AND _conceptID IS NOT NULL THEN
			INSERT INTO ads.D_books (tag, branchID, branch, bookID, book, conceptID, concept) values (_tag, _branchID, _branch, _bookID, _book, _conceptID, _concept);
		END IF;
		DELETE FROM X_new_revisions WHERE childID=_conceptID AND parentID=_bookID;
	UNTIL done END REPEAT;
	
	CLOSE c;
	COMMIT;
END
|

DELIMITER ;

