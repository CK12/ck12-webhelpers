UPDATE auth.MemberExtData SET token = 'sha256:ebd8f:8ea4439ab341abfe3bb9e8eb67fa340de1175f8a5df17732a5a9311d467d3387' WHERE memberID = 1 AND authTypeID = 1;
UPDATE auth.MemberExtData SET token = 'sha256:ebd8f:8ea4439ab341abfe3bb9e8eb67fa340de1175f8a5df17732a5a9311d467d3387' WHERE memberID = 3 AND authTypeID = 1;

-- Prevent old accounts from logging in
-- UPDATE IGNORE auth.MemberExtData SET externalID = REPLACE(externalID, '@', '@ck12-') WHERE externalID IS NOT NULL AND externalID LIKE '%@%' AND externalID NOT LIKE '%@ck12-%' AND authTypeID NOT IN (SELECT id FROM auth.MemberAuthTypes WHERE name IN ('ck12', 'ck-12'));
-- UPDATE IGNORE auth.MemberExtData SET externalID = CONCAT(externalID, '--ck12') WHERE externalID IS NOT NULL AND externalID NOT LIKE '%@%' AND externalID NOT LIKE '%--ck12' AND authTypeID NOT IN (SELECT id FROM auth.MemberAuthTypes WHERE name IN ('ck12', 'ck-12'));

-- Fix the encrypted values for admin and ck12editor
UPDATE auth.Members SET email = '0834cdd865c076178ed38cfbfa76da87', givenName='CK-12', surname='Admin', login='5ad5fc805e27188440729cc1f9c9af59' WHERE id = 1;
UPDATE auth.Members SET email = '4a88177f6a61f392c3ac634691e39421', givenName='guest', surname='', login='230c816b81fc97b3565d904c62ecf1f1' WHERE id = 2;
UPDATE auth.Members SET email = 'aa0c41875f52b26f1eaa31ce3b0f188e', givenName='CK-12', surname='', login='fb56291700538156e2205709e3f265d3' WHERE id = 3;
UPDATE flx2.Members SET email = '0834cdd865c076178ed38cfbfa76da87', givenName='CK-12', surname='Admin', login='5ad5fc805e27188440729cc1f9c9af59' WHERE id = 1;
UPDATE flx2.Members SET email = '4a88177f6a61f392c3ac634691e39421', givenName='guest', surname='', login='230c816b81fc97b3565d904c62ecf1f1' WHERE id = 2;
UPDATE flx2.Members SET email = 'aa0c41875f52b26f1eaa31ce3b0f188e', givenName='CK-12', surname='', login='fb56291700538156e2205709e3f265d3' WHERE id = 3;

-- UPDATE IGNORE flx2.Notifications SET address = REPLACE(address, '@', '@ck12-') WHERE address is not null and address != '' and address not like '%@ck12.org' and address not like '%@ck12-%';
-- UPDATE IGNORE homeworkpedia.Users SET email = REPLACE(email, '@', '@ck12-') WHERE email not like '%@ck12.org' and email not like '%@ck12-%';
-- UPDATE IGNORE homeworkpedia.Users SET login = REPLACE(login, '@', '@ck12-') WHERE login not like '%@ck12.org' and login not like '%@ck12-%';
