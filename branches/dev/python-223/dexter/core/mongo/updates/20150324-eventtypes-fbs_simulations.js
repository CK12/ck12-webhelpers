db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_BROWSE_FILTER",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "filterType"
        },

    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_FILTER_STANDARD",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "sid"
        },

    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_TILE_TAB",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "tabType"
        },

    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_QCREATE",
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
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_QSOURCE_TOGGLE",
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
            "name" : "tab"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_QCREATE_Q",
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
            "name" : "button"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_QCREATE_A",
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
            "name" : "tab"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_QEDITOR_TOGGLE",
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
            "name" : "tab"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_Q",
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
            "name" : "tab"
        },
	{
            "mandatory" : true,
            "name" : "questionID"
        },
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_SIMULATION_Q_A",
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
            "name" : "tab"
        },
	{
            "mandatory" : true,
            "name" : "questionID"
        },
    ]
}
);


