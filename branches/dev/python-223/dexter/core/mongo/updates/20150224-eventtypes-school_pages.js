db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "HERO_BANNER_CLICK",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "banner"
        },
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
    "eventType" : "SCHOOL_STATE_SELECTED",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "state"
        },
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "autoSelect"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "SCHOOL_FLEXBOOK_CLICK",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "state"
        },
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "artifactID"
        },
        {
            "mandatory" : true,
            "name" : "schoolName"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "SCHOOL_CLICK",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "state"
        },
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
        {
            "mandatory" : true,
            "name" : "schoolName"
        },
    ]
}
);
