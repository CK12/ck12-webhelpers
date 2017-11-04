db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_PEERHELP_POST",
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
	{
            "mandatory" : true,
            "name" : "timestamp"
        },

    ]
}
);


db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_PEERHELP_ANSWERED",
    "parameters" : [
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
    "eventType" : "FBS_PEERHELP_HELP",
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

