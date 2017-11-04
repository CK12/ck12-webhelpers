from flx.model import api

def run(memberIDs=[]):
    print 'id, "First Name", "Last Name", "Email"'
    for memberID in memberIDs:
        m = api.getMemberByID(id=memberID)
        print '%s, "%s", "%s", "%s"' % (m.id, m.givenName, m.surname, m.email)
