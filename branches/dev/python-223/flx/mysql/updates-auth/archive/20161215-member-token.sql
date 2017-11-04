ALTER TABLE MemberExtData MODIFY `token` VARCHAR(255) DEFAULT NULL COMMENT 'The authentication token.';
CREATE INDEX `MemberExtData_token` ON `MemberExtData` (`token`);
