db = db.getSiblingDB('cache')
db.createUser( {user: 'cacheadmin', pwd: 'D-coD43', roles: ['readWrite', 'dbAdmin', 'userAdmin']})
db = db.getSiblingDB('sessions')
db.createUser( {user: 'sessionsadmin', pwd: 'D-coD43', roles: ['readWrite', 'dbAdmin', 'userAdmin']})
