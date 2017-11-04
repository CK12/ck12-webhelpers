BEGIN;
UPDATE MemberAuthTypes SET name = 'google-openid', description='Google openid authentication' WHERE id = 4;
INSERT INTO MemberAuthTypes (id, name, description) VALUES (8, 'google', 'Google oAuth2 authentication');
COMMIT;
