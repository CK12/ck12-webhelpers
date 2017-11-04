INSERT IGNORE INTO BrowseTerms (name, termTypeID, handle, description) SELECT 'plix-onboarding', id, 'plix-onboarding', 'PLIX For on-boarding' FROM `BrowseTermTypes` WHERE `name` = 'internal-tag';
