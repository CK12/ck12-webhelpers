ALTER TABLE `EmailSharings`
    DROP PRIMARY KEY,
    ADD COLUMN `emailType` enum('share', 'summer') NOT NULL DEFAULT 'share' AFTER `receiverID`,
    ADD PRIMARY KEY(senderID, receiverID, emailType);
