db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_MEMBER_ROLE_CHANGE",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
	{
            "mandatory" : true,
            "name" : "from_role"
        },
	{
            "mandatory" : true,
            "name" : "to_role"
        },
    ]
}
);
