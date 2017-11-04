db = db.getSiblingDB('flx2')
db.createUser( {user: 'flx2admin', pwd: 'D-coD43', roles: ['readWrite', 'dbAdmin', 'userAdmin']})
