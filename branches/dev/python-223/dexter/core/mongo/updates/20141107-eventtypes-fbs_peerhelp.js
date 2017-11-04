db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_PEER_HELP_POST",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "postID"
        },
        {
            "mandatory" : true,
            "name" : "groupID"
        },
	{
            "mandatory" : true,
            "name" : "postType"
        },
	{
            "mandatory" : true,
            "name" : "isAnonymous"
        },
	{
            "mandatory" : true,
            "name" : "hasImage"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_PEER_HELP_ANSWERED",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "postID"
        },
        {
            "mandatory" : true,
            "name" : "groupID"
        },
	{
            "mandatory" : true,
            "name" : "created"
        },
	{
            "mandatory" : true,
            "name" : "answered"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_PEER_HELP_HELP",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "groupID"
        },
    ]
}
);
