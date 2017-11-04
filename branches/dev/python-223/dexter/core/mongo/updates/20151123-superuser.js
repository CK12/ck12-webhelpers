//Create a role superuser and assign it to the user adsadmin, so that adsadmin can execute eval command.

//Create a superuser role.
db.createRole({
    role: 'superuser',
    privileges:[{
        resource: {anyResource: true},
        actions: ['anyAction']
    }],
    roles: []
})
//Change to dexter db
db = db.getSiblingDB('dexter')
//Grant superuser role to adsadmin
db.grantRolesToUser(
   "adsadmin",
   [ {role: "superuser", db:"admin"} ]
)
