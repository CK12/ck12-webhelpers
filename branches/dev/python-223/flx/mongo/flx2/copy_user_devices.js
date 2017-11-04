print("Copying the userDevices..");
db.UserDevices.find().forEach( function(dev){
        var userID = dev.loggedInUserID;
        print(userID); 
        if(userID) {
             var member = db.Members.findOne({"_id": userID});
             if(member && member.uID ) {
                 userID = member.uID;
                 dev.loggedInUserID = NumberInt(userID);
                 print(dev.loggedInUserID);
             } else {
                 dev.loggedInUserID = null;
             } 
             dev.appCode = 'ck12app';
        }
        db.UserDevicesCopy.save(dev); 
});


function objectIdWithTimestamp(timestamp) {
    // Convert string date to Date object (otherwise assume timestamp is a date)
    if (typeof(timestamp) == 'string') {
        timestamp = new Date(timestamp);
    }
    // Convert date object to hex seconds since Unix epoch
    var hexSeconds = Math.floor(timestamp/1000).toString(16);

    // Create an ObjectId with that hex timestamp
    var constructedObjectId = ObjectId(hexSeconds + "0000000000000000");

    return constructedObjectId
}


print("Copying the inAppNotification settings..");
db.Members.find({"inAppNotification": {$exists:1}}).forEach( function(member){
             if(member && member.uID ) {
                 userID = member.uID;
                 var now = new Date();
                 var kwargs = {};
                 var targetTime = member.created || member.updated;
                 if(targetTime) { 
                 kwargs['_id'] = objectIdWithTimestamp(targetTime);
                 kwargs['userdata'] = {'inAppNotification': member.inAppNotification };
                 kwargs['updateTime'] = now;
                 kwargs['creationTime'] = now;
                 kwargs['memberID'] = NumberInt(userID);
                 kwargs['appName'] = 'ck12app';
                 //printjson(kwargs);
                 db.NotificationsCopy.save(kwargs); 
                 }
             }
});
print("Done");

