UPDATE IGNORE auth.MemberExtData SET externalID = REPLACE(externalID, '@ck12-', '@') WHERE externalID IS NOT NULL AND externalID LIKE '%@ck12-%' AND authTypeID NOT IN (SELECT id FROM auth.MemberAuthTypes WHERE name IN ('ck12', 'ck-12'));
UPDATE IGNORE auth.MemberExtData SET externalID = REPLACE(externalID, '--ck12', '') WHERE externalID IS NOT NULL AND externalID NOT LIKE '%@%' AND externalID LIKE '%--ck12' AND authTypeID NOT IN (SELECT id FROM auth.MemberAuthTypes WHERE name IN ('ck12', 'ck-12'));
UPDATE IGNORE flx2.Notifications SET address = REPLACE(address, '@ck12-', '@') WHERE address is not null and address != '' and address like '%@ck12-%' and address not like '%@ck12.org';
UPDATE IGNORE homeworkpedia.Users SET email = REPLACE(email, '@ck12-', '@') WHERE email like '%@ck12-%' and email not like '%@ck12.org';
UPDATE IGNORE homeworkpedia.Users SET login = REPLACE(login, '@ck12-', '@') WHERE login like '%@ck12-%' and login not like '%@ck12.org';
