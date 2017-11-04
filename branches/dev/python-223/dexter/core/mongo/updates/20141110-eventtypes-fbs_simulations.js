db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_SEARCH",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "searchTerm"
        },

    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_FONT",
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
            "name" : "artifactID"
        },
        {
            "mandatory" : true,
            "name" : "action"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_FILTER",
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

