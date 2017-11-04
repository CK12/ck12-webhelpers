db = db.getSiblingDB('admin');
db.createUser({user: 'dbadmin', pwd: 'D-coD43', roles: ['userAdminAnyDatabase', 'dbAdminAnyDatabase', 'readWriteAnyDatabase', 'clusterAdmin']})
