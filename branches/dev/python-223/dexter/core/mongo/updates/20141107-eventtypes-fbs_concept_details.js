db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_MODALITY_SOURCE",
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
            "name" : "modalitySource"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_MODALITY_FILTER",
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
            "name" : "referrer"
        },
        {
            "mandatory" : true,
            "name" : "modalityGroup"
        },

    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_MODALITY_LEVEL",
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
            "name" : "level"
        },
    ]
}
);
