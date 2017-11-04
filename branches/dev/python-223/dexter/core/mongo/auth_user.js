db = db.getSiblingDB('dexter')
db.addUser( {user: 'adsadmin', pwd: 'D-coD43', roles: ['readWrite', 'dbAdmin', 'userAdmin']})
