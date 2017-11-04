db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_RECOMMENDATION",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "product"
        },
        {
            "mandatory" : true,
            "name" : "feature"
        },
        {
            "mandatory" : true,
            "name" : "recs"
        }
    ]
}
);

db.EventTypes.insert(
{
    "clientID" : 24839961,
    "eventType" : "FBS_RECOMMENDATION_ACTION",
    "parameters" : [
        {
            "mandatory" : true,
            "name" : "memberID"
        },
        {
            "mandatory" : true,
            "name" : "product"
        },
        {
            "mandatory" : true,
            "name" : "feature"
        },
        {
            "mandatory" : true,
            "name" : "recsSelected"
        }
    ]
}
);
