db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SCRATCHPAD_TIMESPENT",
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
            "name" : "timespent"
        },
	{
            "mandatory" : true,
            "name" : "questionInstanceID"
        },
	{
            "mandatory" : true,
            "name" : "testType"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SCRATCHPAD_TOOL_PICK",
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
            "name" : "tool"
        },
	{
            "mandatory" : true,
            "name" : "questionInstanceID"
        },
	{
            "mandatory" : true,
            "name" : "testType"
        },
    ]
}
);
