db.FlxadminUserRoleAcl.insert({
	"user_role" : "content-contractor-admin",
	"updated" : new Date(),
	"allowed_routes" : [
		{
			"url" : "/assessment/tests",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/tests_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/test/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions/published/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/mismatchedLevel/questions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list/{asOverlay}/{mismatchedLevel}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list/{asOverlay}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/question/{Qid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/update/test/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/delete/question/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/delete/{Type}/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/test/{Action}/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/create/test/{Action}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/hints",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/hints_list",
			"permission" : NumberInt(1)
		}
	]
});
db.FlxadminUserRoleAcl.insert({
	"user_role" : "content-support-admin",
	"updated" : new Date(),
	"allowed_routes" : [
		{
			"url" : "/apiproxy",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/apiproxy/{raw}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifacts",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assignments",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assignment/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifacts_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifacts/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifact/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifact/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/tests",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/tests_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/test/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions/published/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/mismatchedLevel/questions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list/{asOverlay}/{mismatchedLevel}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list/{asOverlay}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/question/{Qid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/update/test/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/upload/questions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/delete/question/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/delete/{Type}/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/test/{Action}/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/create/test/{Action}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/tasks",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment_tasks_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/task/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/assessment_errors",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/errors_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/error/{Qid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/synonyms",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/synonyms_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/synonym/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/hints",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/hints_list",
			"permission" : NumberInt(1)
		}
	]
});
db.FlxadminUserRoleAcl.insert({
	"user_role" : "content-admin",
	"updated" : new Date(),
	"allowed_routes" : [
		{
			"url" : "/apiproxy",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/apiproxy/{raw}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/specialsearchentries",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/specialsearchentries_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/specialsearchentry/{term}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/specialsearchentry/{term}/{entry}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/specialsearchentry",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/tryspecialsearch",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/tryspecialsearch_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifacts",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifactfeedbackreview",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifactfeedbackreview_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/feedback/abuse/report",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/feedback/abuse/report_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assignments",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assignment/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifacts_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifacts/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifact/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifact/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/content/{artifactOrRevision}/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/content/{artifactOrRevision}/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/newcover/{artifactOrRevision}/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/review/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/feedback_list/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/json/feedback/reply/{artifactID}/{memberID}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/json/feedback/delete",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/json/feedback/update",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/json/review/delete",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifact/notifyusers/{revisionID:[0-9]+}/{artifactID:[0-9]+}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifact/notifyusers/{revisionID:[0-9]+}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/ugc_artifacts",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/manage/modalities",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/modalities_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/concepts",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/concepts_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/concept/{eid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/rwes",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/rwes_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/rwe/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/tests",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/tests_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/test/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions/published/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/mismatchedLevel/questions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list/{asOverlay}/{mismatchedLevel}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list/{asOverlay}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/question/{Qid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/update/test/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/upload/questions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/delete/question/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/delete/{Type}/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/test/{Action}/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/create/test/{Action}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/tasks",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment_tasks_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/task/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/assessment_errors",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/errors_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/error/{Qid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/practice/usage",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/synonyms",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/synonyms_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/synonym/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/hints",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/hints_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/revisions_list/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/revision/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/revision/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/issues",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/abusereports_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/abusereports/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/abusereport/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/issue/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/abusereport/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/reportabuse/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/tasks",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/tasks_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/tasks/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/task/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/task/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/get-real-contributions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/get-real-contributions-list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/partner_api",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/api_partner_applications_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/apipaths/",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/json/{path}/delete/{ID}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/json/update/application/{ID}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/json/new/application/",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/json/new/path/",
			"permission" : NumberInt(1)
		}
	]
});
db.FlxadminUserRoleAcl.insert({
	"user_role" : "support-admin",
	"updated" : new Date(),
	"allowed_routes" : [
		{
			"url" : "/apiproxy",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/apiproxy/{raw}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/user/profiles",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/user/profiles_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/user/profiles/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/user/profile/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/user/profile/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/member_groups_list/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifacts",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifacts_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifacts/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifact/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/artifact/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/content/{artifactOrRevision}/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/content/{artifactOrRevision}/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/newcover/{artifactOrRevision}/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/review/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/feedback_list/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/json/feedback/reply/{artifactID}/{memberID}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/json/feedback/delete",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/json/review/delete",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/rebuild_cache",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/wikiimport",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/wiki_imports",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/gdoc_imports",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/gdocimport/{doctype}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/gdocimport/{doctype}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/gdocs_list/{doctype}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/exercises",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/exercises/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/exercises/{Qclass}/{Qid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/exercises_list/{Qclass}/{Qid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/exercises_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/exercise/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/exercise/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/associate/{Qclass}/{Qid}/{Eid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/deassociate/{Qclass}/{Qid}/{Eid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions/published/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/mismatchedLevel/questions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list/{asOverlay}/{mismatchedLevel}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/questions_list/{asOverlay}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/question/{Qid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/update/test/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/upload/questions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/delete/question/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/delete/{Type}/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/test/{Action}/{Tid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/create/test/{Action}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/tasks",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment_tasks_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/task/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/assessment_errors",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/errors_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/assessment/error/{Qid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/upload/docs/exercises",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/upload/exercises/form",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/questions/{Qclass}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/questions/{Qclass}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/questions/{Qclass}/{Eid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/questions_list/{Qclass}/{Eid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/questions_list/{Qclass}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/question/{Qclass}/{Qid}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/question/{Qclass}/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/hwerrors",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/hwerrors_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/hwerrors/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/hwerror/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/hwerror/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/events",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/events_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/events/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/notifications",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/notifications_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/notification/create",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/maintenance/notification/create",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/maintenance/notification_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/notification/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/notification/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/notifications/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/revisions_list/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/revision/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/revision/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/abusereports",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/issues",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/abusereports_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/abusereports/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/abusereport/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/issue/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/abusereport/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/reportabuse/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/tasks",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/tasks_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/tasks/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/task/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/task/{id}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/reindex/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/reindex/",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/reindex",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/format/{id}/{revisionID}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/format/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/formatsinfo/{id}/{revisionID}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/formatsinfo/{id}/",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/formatsinfo/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/dlg-switchuser",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/ajax/switchuser/list/",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/account/federated/authorized/switch/",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/groups",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/groups_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/group/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/group_members_list/{id}",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/posts",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/posts_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/forums/sequence",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/forums_list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/get-real-contributions",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/get-real-contributions-list",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/lms/provider/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/lms/provider/apps/{providerID}/raw",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/get/lms/providerapp/users",
			"permission" : NumberInt(1)
		},
		{
			"url" : "/apps/mobile",
			"permission" : NumberInt(1)
		}
	]
}
);