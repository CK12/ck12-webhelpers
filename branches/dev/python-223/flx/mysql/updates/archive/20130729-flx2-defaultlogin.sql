ALTER TABLE Members ADD `defaultLogin` varchar(255) NOT NULL DEFAULT '' COMMENT 'The auto-generated login name.';
UPDATE flx2.Members as m1 LEFT JOIN auth.Members as m2 on m1.id = m2.id set m1.defaultLogin = m2.defaultLogin;
ALTER TABLE Members ADD UNIQUE KEY `defaultLogin` (`defaultLogin`);
