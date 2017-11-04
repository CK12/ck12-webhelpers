db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_CMAP_NODE",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
	{
            "mandatory" : true,
            "name" : "context_eid"
        },

    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_CMAP_NODE_INFO",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
	{
            "mandatory" : true,
            "name" : "context_eid"
        },

    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_CMAP_SEARCH",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
	{
            "mandatory" : true,
            "name" : "context_eid"
        },

    ]
}
);
