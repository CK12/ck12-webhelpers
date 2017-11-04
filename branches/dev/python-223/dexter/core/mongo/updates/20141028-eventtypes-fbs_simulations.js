db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION",
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
            "name" : "referrer"
        },

    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_BROWSE",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "referrer"
        },

    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_TIMESPENT",
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
            "name" : "referrer"
        },
        {
            "mandatory" : true,
            "name" : "timespent"
        },
        {
            "mandatory" : true,
            "name" : "pageType"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_WIDGET",
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
            "name" : "widgetType"
        },
        {
            "mandatory" : true,
            "name" : "widgetName"
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

