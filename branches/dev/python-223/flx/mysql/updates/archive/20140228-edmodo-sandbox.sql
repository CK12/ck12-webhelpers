INSERT INTO `LMSProviders` (`id`, `name`, `description`) VALUES (1, 'Edmodo', 'Edmodo')
    ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), name=VALUES(name), description=VALUES(description);
INSERT INTO `LMSProviderApps` (`providerID`, `appID`, `appName`, `policy`) VALUES
    (1, 'bf74be5b0a8cb13476c3bff2e4da1c4e7f80b384', 'EdmPracticeMath', '{ "api_key": "bf74be5b0a8cb13476c3bff2e4da1c4e7f80b384", "url": "https://appsapi.edmodobox.com/v1.1/", "getUserGroups": "groupsForUser", "getGroups": "groups", "createAssignment": "createAssignment", "turnInAssignment": "turnInAssignment", "setGrade": "setGrade" }'),
    (1, 'cba8966adddbf8cf7beebac5232870cbd741159a', 'EdmPracticeScience', '{ "api_key": "cba8966adddbf8cf7beebac5232870cbd741159a", "url": "https://appsapi.edmodobox.com/v1.1/", "getUserGroups": "groupsForUser", "getGroups": "groups", "createAssignment": "createAssignment", "turnInAssignment": "turnInAssignment", "setGrade": "setGrade" }')
    ON DUPLICATE KEY UPDATE appName=values(appName), policy=values(policy);
