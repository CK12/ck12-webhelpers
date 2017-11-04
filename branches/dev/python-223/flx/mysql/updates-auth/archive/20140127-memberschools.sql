BEGIN;
    CREATE TABLE `OtherSchools` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `name` varchar(256) DEFAULT NULL,
          PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    CREATE TABLE MemberSchools (
        memberID int(11) NOT NULL,
        schoolID int(11) NOT NULL,
        fromMaster int(11) NOT NULL DEFAULT 1,
        PRIMARY KEY (memberID),
        CONSTRAINT MemberSchools_ibfk_1 FOREIGN KEY (memberID) REFERENCES Members (id) ON DELETE CASCADE ON UPDATE NO ACTION
    );
COMMIT;
