# mongodb password for flx,dexter dbs(gamma, production machines). 
# Do not pass this value if there is no password to access the  dbs(eg:tesla,qa-tesla)
PWD="$1"

############## TASK 1: Copying the ModalityAggregate Collection in dexter db to flx2 ################3


# STEP1: Dumping the ModalityAggregate collection

if [ ! -z "$PWD" -a "$PWD" != " " ]; then
    # For gamma or prod
    mongoexport -d dexter --host rs0/localhost -u adsadmin -p $PWD  -c ModalityAggregate --out /tmp/ModalityAggregate.json
else 
    # For dev machines
    mongoexport -d dexter -c ModalityAggregate --out /tmp/ModalityAggregate.json
fi


# STEP 2: Restoring the ModalityAggregate in flx2 db.

if [ ! -z "$PWD" -a "$PWD" != " " ]; then
    # For gamma or prod
    mongoimport -d flx2 --host rs0/localhost -u flx2admin -p $PWD -c ModalityAggregate --file /tmp/ModalityAggregate.json
else 
    # For dev machines
    mongoimport -d flx2 -c ModalityAggregate --file /tmp/ModalityAggregate.json
fi

############## TASK 2: Copying the IP2Location Collection in dexter db to flx2 ################3


# STEP1: Dumping the IP2Location collection

if [ ! -z "$PWD" -a "$PWD" != " " ]; then
    # For gamma or prod
    mongoexport -d dexter --host rs0/localhost -u adsadmin -p $PWD  -c IP2Location --out /tmp/IP2Location.json
else 
    # For dev machines
    mongoexport -d dexter -c IP2Location --out /tmp/IP2Location.json
fi


# STEP 2: Restoring the ModalityAggregate in flx2 db.

if [ ! -z "$PWD" -a "$PWD" != " " ]; then
    # For gamma or prod
    mongoimport -d flx2 --host rs0/localhost -u flx2admin -p $PWD -c IP2Location --file /tmp/IP2Location.json
else 
    # For dev machines
    mongoimport -d flx2 -c IP2Location --file /tmp/IP2Location.json
fi
