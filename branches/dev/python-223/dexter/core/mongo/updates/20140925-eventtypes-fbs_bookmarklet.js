db.EventTypes.insert(
{
	"clientID" : 24839961,
	"eventType" : "FBS_BKMKLT_LAUNCH",
	"parameters" : [
		{
			"mandatory" : true,
			"name" : "memberID"
		},
	]
}
);

db.EventTypes.insert(
{
	"clientID" : 24839961,
	"eventType" : "FBS_BKMKLT_CREATE",
	"parameters" : [
		{
			"mandatory" : true,
			"name" : "memberID"
		},
		{
			"mandatory" : true,
			"name" : "context_eid"
		},
		{
			"mandatory" : true,
			"name" : "url"
		},

	]
}
);

