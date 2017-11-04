db.EventTypes.insert(
{
	"clientID" : 24839961,
	"eventType" : "FBS_CROSS_LINKS",
	"parameters" : [
		{
			"mandatory" : true,
			"name" : "artifactID"
		},
		{
			"mandatory" : true,
			"name" : "context_eid"
		},
		{
			"mandatory" : true,
			"name" : "word"
		},
		{
			"mandatory" : true,
			"name" : "clickedLink"
		}
	]
}
);


db.EventTypes.insert(
{
	"clientID" : 24839961,
	"eventType" : "FBS_TIMESPENT",
	"parameters" : [
		{
			"mandatory" : true,
			"name" : "memberID"
		},
		{
			"mandatory" : true,
			"name" : "pageType"
		},
		{
			"mandatory" : true,
			"name" : "URL"
		},
		{
			"mandatory" : true,
			"name" : "sessionID"
		},
		{
			"mandatory" : true,
			"name" : "visitorID"
		},
		{
			"mandatory" : true,
			"name" : "duration"
		}
	]
}
);
