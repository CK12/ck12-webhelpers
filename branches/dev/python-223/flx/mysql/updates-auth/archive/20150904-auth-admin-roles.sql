BEGIN;
INSERT INTO MemberRoles(name, description) VALUES('content-de-author-admin', 'admin role for Content DE authors'),('content-contractor-admin','admin role for Content Contractor'), ('content-support-admin', 'admin role for Content Support');

ALTER TABLE `MemberRoles` ADD COLUMN `is_admin_role` tinyint(1) COMMENT 'role has admin permissions or not' NOT NULL DEFAULT 0 AFTER `description`;

UPDATE MemberRoles SET is_admin_role = 1 WHERE name IN ('admin', 'support-admin', 'content-admin', 'content-de-author-admin', 'content-contractor-admin', 'content-support-admin');

COMMIT;
