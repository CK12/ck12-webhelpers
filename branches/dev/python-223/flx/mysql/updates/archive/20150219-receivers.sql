BEGIN;
    DROP TABLE if exists EmailReceivers;
    DROP TABLE if exists EmailSenders;
    DROP TABLE if exists EmailSharings;

    CREATE TABLE EmailReceivers (
        `id`        int(11) NOT NULL AUTO_INCREMENT,
        `email`     VARCHAR(255) NOT NULL,
        `status`    ENUM('active', 'unsubscribed') NOT NULL DEFAULT 'active',
        PRIMARY KEY (`id`),
        UNIQUE KEY (`email`)
    ) DEFAULT CHARSET=utf8;

    CREATE TABLE EmailSenders (
        `id`        int(11) NOT NULL AUTO_INCREMENT,
        `email`     VARCHAR(255) NOT NULL,
        `name`      VARCHAR(127) NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY (`email`)
    ) DEFAULT CHARSET=utf8;

    CREATE TABLE EmailSharings (
        `senderID`      int(11) NOT NULL,
        `receiverID`    int(11) NOT NULL,
        `count`         int(11) NOT NULL DEFAULT 0,
        PRIMARY KEY (`senderID`, `receiverID`),
        CONSTRAINT `EmailSharings_senderID` FOREIGN KEY (`senderID`) REFERENCES `EmailSenders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT `EmailSharings_receiverID` FOREIGN KEY (`receiverID`) REFERENCES `EmailReceivers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
    ) DEFAULT CHARSET=utf8;
COMMIT;
