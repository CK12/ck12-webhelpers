USE auth;

CREATE TABLE `DbPatch` (
    `version` varchar(50) NOT NULL UNIQUE,
    `updated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- -------------------------------------------------------------------------------------------
-- Create or update DbPatch record for a given patch
--
-- Changes:
--   - [20170427] Initial Version
--
-- Parameters:
--   patch_name	VARCHAR(50)		DB patch name
--
-- Attention: Default mysqldump does not include store procs!!
-- -------------------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `update_dbpatch`;
DELIMITER //
CREATE PROCEDURE `update_dbpatch`(IN patch_name varchar(50))
    COMMENT 'Revision: 20170427'
BEGIN

    IF patch_name IS NOT NULL THEN
        REPLACE INTO DbPatch
        (version, updated) VALUES (patch_name, now());
    END IF;
    
COMMIT;
END
//
DELIMITER ;

call update_dbpatch('20170427-dbpatch');
