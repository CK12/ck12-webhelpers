
# mongodb password for flx,assessment dbs(gamma, production machines). 
# Do not pass this value if there is no password to access the  dbs(eg:tesla,qa-tesla)
PWD="$1"

############## TASK 1: Copying the UserDevices Collection in assessment db to flx2 ################3

# STEP 1: Copy the UserDevices collection and change the loggedInUserID to uID and save as new collection(UserDevicesCopy)

if [ ! -z "$PWD" -a "$PWD" != " " ]; then
    # For gamma or prod
    mongo assessment --host rs0/localhost -u asmtadmin -p $PWD < copy_user_devices.js
else 
    # For dev machines
    mongo assessment < copy_user_devices.js
fi


# STEP2: Dumping the userDevicesCopy collection

if [ ! -z "$PWD" -a "$PWD" != " " ]; then
    # For gamma or prod
    mongoexport -d assessment --host rs0/localhost -u asmtadmin -p $PWD  -c UserDevicesCopy --out /tmp/UserDevicesCopy.json
else 
    # For dev machines
    mongoexport -d assessment -c UserDevicesCopy --out /tmp/UserDevicesCopy.json
fi


# STEP 3: Restoring the userDevicesCopy to UserDevices in flx2 db.

if [ ! -z "$PWD" -a "$PWD" != " " ]; then
    # For gamma or prod
    mongoimport -d flx2 --host rs0/localhost -u flx2admin -p $PWD -c UserDevices --upsert --file /tmp/UserDevicesCopy.json
else 
    # For dev machines
    mongoimport -d flx2 -c UserDevices --upsert --file /tmp/UserDevicesCopy.json
fi


# STEP 4: Adding indexes for the new collection

if [ ! -z "$PWD" -a "$PWD" != " " ]; then
    # For gamma or prod
    mongo flx2 --host rs0/localhost -u flx2admin -p $PWD < flx2_schema.js
else 
    # For dev machines
    mongo flx2 < flx2_schema.js
fi



############## TASK 2: Copying the inAppNotification settings in asmt db(members) to flx2 db(AppUserData) ################3

# STEP1: Dumping the NotificationsCopy collection(created by copy_user_devices.js)

if [ ! -z "$PWD" -a "$PWD" != " " ]; then
    # For gamma or prod
    mongodump -d assessment --host rs0/localhost -u asmtadmin -p $PWD -c NotificationsCopy --out /tmp
else 
    # For dev machines
    mongodump -d assessment -c NotificationsCopy --out /tmp
fi


# STEP 2: Restoring the NotificationsCopy to NotificationsCopy in flx2 db.

if [ ! -z "$PWD" -a "$PWD" != " " ]; then
    # For gamma or prod
    mongorestore -d flx2 --host rs0/localhost -u flx2admin -p $PWD -c AppUserData /tmp/assessment/NotificationsCopy.bson
else 
    # For dev machines
    mongorestore -d flx2 -c AppUserData /tmp/assessment/NotificationsCopy.bson
fi
