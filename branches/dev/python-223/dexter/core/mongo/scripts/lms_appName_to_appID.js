var edmPracticeScienceAssessment = db.Resolved_FBS_ASSESSMENT.update({"appContext": "edmPracticeScience"}, { $set : {"appID" : "2109d83b62c97630049219d0020f014365fb2107"}}, { multi: true });

print("completed edmPracticeScience Resolved_FBS_ASSESSMENT Update : " + edmPracticeScienceAssessment);

var edmPracticeMathAssessment = db.Resolved_FBS_ASSESSMENT.update({"appContext": "edmPracticeMath"}, { $set : {"appID" : "65f2ee41c12c04866cb5cf184b7edeb5f630e938"}}, { multi: true });

print("completed edmPracticeMath Resolved_FBS_ASSESSMENT Update : " + edmPracticeMathAssessment);

var edmPracticeScienceLMSInstallation = db.Resolved_FBS_LMS_INSTALL.update({"appName": "edmPracticeScience"}, { $set : {"appID" : "2109d83b62c97630049219d0020f014365fb2107"}}, { multi: true });

print("completed edmPracticeScience Resolved_FBS_LMS_INSTALL Update : " + edmPracticeScienceLMSInstallation);

var edmPracticeMathLMSInstallation = db.Resolved_FBS_LMS_INSTALL.update({"appName": "edmPracticeMath"}, { $set : {"appID" : "65f2ee41c12c04866cb5cf184b7edeb5f630e938"}}, { multi: true });

print("completed edmPracticeMath Resolved_FBS_LMS_INSTALL Update : " + edmPracticeMathLMSInstallation);

print("Done....");
