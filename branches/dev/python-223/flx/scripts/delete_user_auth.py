"""
[Story #110042886] Provide a script to delete a test user from DB
"""
import sys

cmdFolder = '/opt/2.0/flx/pylons/auth'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import auth.lib.helpers as h
from auth.model import api, meta, model
import logging, logging.handlers
from sqlalchemy.sql import and_

LOG_FILENAME = "/tmp/delete_users_auth.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
handler.setFormatter(formatter)
log.addHandler(handler)


#---functions dealing with auth
def deleteMemberFromAuth(session, memberID):
    #from auth.flx.model import model

    query1 = session.query(model.Address)
    query1 = query1.filter_by(memberID = memberID)
    query1.delete()

    query2 = session.query(model.MemberLocation)
    query2 = query2.filter_by(memberID = memberID)
    query2.delete()

    query3 = session.query(model.MemberExtData)
    query3 = query3.filter_by(memberID = memberID)
    query3.delete()

    #query4 = session.query(model.MinorExtData)
    #query4 = query4.filter_by(guardianID = memberID)
    #query4.delete()

    query5 = session.query(model.CampaignMember)
    query5 = query5.filter_by(memberID = memberID)
    query5.delete()

    query6 = session.query(model.OAuthClient)
    query6 = query6.filter_by(memberID = memberID)
    query6.delete()

    query7 = session.query(model.OAuthToken)
    query7 = query7.filter_by(memberID = memberID)
    query7.delete()

    query8 = session.query(model.UnderageEmailToken)
    query8 = query8.filter_by(studentID = memberID)
    query8.delete()

    query9 = session.query(model.UnderageMemberParent)
    query9 = query9.filter_by(memberID = memberID)
    query9.delete()
    
    query10 = session.query(model.MemberSchool)
    query10 = query10.filter_by(memberID = memberID)
    query10.delete()

    query11 = session.query(model.PartnerSchoolHasMember)
    query11 = query11.filter_by(memberID = memberID)
    query11.delete()

    query12 = session.query(model.Task)
    query12 = query12.filter_by(ownerID = memberID)
    query12.delete()


def get_test_users(session):
    test_users = session.query(model.Member).filter(and_(model.Member.givenName == 'Test',
                                                                  model.Member.surname == 'User'))
    test_user_ids = []
    for tu in test_users:
        if tu.email.endswith('testuser@ck12.org'):
            test_user_ids.append(tu.id)
    return test_user_ids


class DeleteMember:

    def __init__(self, url, verbose=False, commit=False, force=False, confirm=True):
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=True,
                                  autocommit=True,
                                  bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.commit = commit
        self.session = meta.Session()
        self.config = h.load_pylons_config()
        self.verbose = verbose
        self.force = force
        self.confirm = confirm

    def delete_member(self, memberDO):
        log.info("Deleting user with id: [%d]" % memberDO.id)
        deleteMemberFromAuth(self.session, memberID = memberDO.id)
        api._deleteMemberRoles(self.session, memberID = memberDO.id)
        api._deleteMember(self.session, memberDO)

    def delete_highIDs2(self, idLimit=0, preserveEmails=[]):
        if not idLimit:
            print "Nothing to delete. Please enter a max user id limit"
            return

        if idLimit <3:
           print "User id limit too low, it includes ck12editor (id=3)"
           return

        pageSize = 512
        pageNum = (idLimit / pageSize) + 1
        while True:
            try:
                #members = api._getMembers(self.session, sorting='id,asc', pageNum=pageNum, pageSize=pageSize)
                #log.debug("PageNum: %s, members.len: %s" % (pageNum, len(members)))
                #if not members:
                #    break
                maxID = 2628206
                #self.session.begin()
                #for member in members:
                for member_id in xrange(idLimit, maxID):
                    log.debug("Member id: %s" % member_id)
                    member = api._getMemberByID(self.session, member_id)
                    if member:
                        if member.id > idLimit and not any([member.email.endswith(p) for p in preserveEmails]):  
                            log.debug("Deleting user: %s, id: %s" % (member.email, member.id))
                            try:
                                #with self.session.begin_nested():
                                self.delete_member(member)
                            except Exception, e:
                                log.warn("Skipped member id: %d email: %s" %(member.id, member.email))
                                log.error("[%s]" % str(e), exc_info=e)                            
                        else:
                            log.debug("Skipping user: %s, id: %s" % (member.email, member.id))

                if self.commit:
                    log.info("Committing changes...")
                    #self.session.commit()
                    #self.session.expire_all()
                else:
                    log.info("Rolling back changes...")
                    #self.session.rollback()
                self.session.close()                        
            except Exception as e:
                log.exception ('Error deleting member with id limit:%s, e: %s' %(idLimit, e))
            pageNum +=1
    
    def delete_highIDs(self, idLimit=0, preserveEmails=[]):
        if not idLimit:
            print "Nothing to delete. Please enter a max user id limit"
            return

        if idLimit <3:
           print "User id limit too low, it includes ck12editor (id=3)"
           return

        pageSize = 512
        pageNum = (idLimit / pageSize) + 1
        while True:
            try:
                members = api._getMembers(self.session, sorting='id,asc', pageNum=pageNum, pageSize=pageSize)
                log.debug("PageNum: %s, members.len: %s" % (pageNum, len(members)))
                if not members:
                    break
                
                self.session.begin()
                for member in members:
                    if member:
                        if member.id > idLimit and not any([member.email.endswith(p) for p in preserveEmails]):  
                            log.debug("Deleting user: %s, id: %s" % (member.email, member.id))
                            try:
                                with self.session.begin_nested():
                                    self.delete_member(member)
                            except Exception, e:
                                log.warn("Skipped member id: %d email: %s" %(member.id, member.email))
                                log.error("[%s]" % str(e), exc_info=e)                            
                        else:
                            log.debug("Skipping user: %s, id: %s" % (member.email, member.id))

                if self.commit:
                    log.info("Committing changes...")
                    self.session.commit()
                    self.session.expire_all()
                else:
                    log.info("Rolling back changes...")
                    self.session.rollback()
                self.session.close()                        
            except Exception as e:
                log.exception ('Error deleting member with id limit:%s, e: %s' %(idLimit, e))
            pageNum +=1
    
    def delete_members_auth(self, emails=[], preserveEmails=[]):
        self.session.begin()
        if emails:
            for email in emails:
                if preserveEmails and any([email.endswith(p) for p in preserveEmails]):
                    log.info("Ignoring email: %s as it matches one of the patterns to preserve.")
                    continue
                elif not self.force and not email.endswith('testuser@ck12.org'):
                    log.info("Ignoring email: %s as it doesn't match required pattern" %email)
                    continue
                member = api._getMemberByEmail(self.session, email=email)
                if not member:
                    log.warn("Email id : %s not found in flx2" %email)
                    continue
                try:
                    with self.session.begin_nested():
                        self.delete_member(member)
                    log.info("Deleted member id: %d email: %s from auth" % (member.id, member.email))
                except Exception, e:
                    log.warn("Skipped member id: %d email: %s" %(member.id, member.email))
                    log.error("[%s]" % str(e), exc_info=e)
        elif preserveEmails:
            ## If only preserveEmails is given, we delete all users that do not match one of the email patterns in the preserveEmails list
            membersToDelete = []
            for preserveEmail in preserveEmails:
                pageNum = 1
                pageSize = 512
                while True:
                    try:
                        members = api._getAllMembers(self.session, pageNum=pageNum, pageSize=pageSize)
                        if not members:
                            break
                        for member in members:
                            if not any([member.email.endswith(p) for p in preserveEmails]):
                                log.debug("Adding [%d] email [%s] to delete list." % (member.id, member.email))
                                membersToDelete.append(member.id)
                            else:
                                log.debug("Skipping [%d] email [%s]" % (member.id, member.email))
                    except Exception, e:
                        log.warn("Error processing members. %s" % str(e), exc_info=e)
                    pageNum += 1
                    log.info("[Page: %d] Found deletion candidate so far: %d" % (pageNum, len(membersToDelete)))
            if membersToDelete:
                print "%d users will be deleted." % len(membersToDelete)
                if self.confirm:
                    check = raw_input("Are you sure you want to proceed? (y/n)\n")
                else:
                    check = 'y'
                if check == 'y':
                    total = len(membersToDelete)
                    cnt = 1
                    for memberID in membersToDelete:
                        log.info("[%d/%d] Deleting memberID [%d]" % (cnt, total, memberID))
                        try:
                            member = api._getMemberByID(self.session, id=memberID)
                            if member:
                                with self.session.begin_nested():
                                    self.delete_member(member)
                        except Exception, e:
                            log.warn("Error processing member: %d. [%s]" % (memberID, str(e)), exc_info=e)
                        cnt += 1

        if self.commit:
            log.info("Committing changes...")
            self.session.commit()
            self.session.expire_all()
        else:
            log.info("Rolling back changes...")
            self.session.rollback()
        self.session.close()

    def delete_all_test_users(self):
        self.session.begin()
        userids_to_be_deleted = get_test_users(self.session)
        self.session.close()
        print "%d test users will be deleted" % len(userids_to_be_deleted)
        if self.confirm:
            check = raw_input("Are you sure you want to proceed? (y/n)\n")
        else:
            check = 'y'
        count = 0
        if check == 'y':
            for member_id in userids_to_be_deleted:
                count += 1
                #if count == 10:
                #    break
                try:
                    self.session.begin()
                    member = api._getMemberByID(self.session, member_id)
                    member_email = member.email
                    log.info("Count %d, Member ID: %d, Email: %s" % (count, member_id, member_email))
                    self.delete_member(member)
                    if self.commit:
                        log.info("Committing changes...")
                        self.session.commit()
                    else:
                        log.info("Rolling back changes...")
                        self.session.rollback()
                    log.info("**Deleted member id: %d email: %s from auth" % (member_id, member_email))
                except Exception, e:
                    self.session.rollback()
                    log.warn("Skipped member id: %d" % member_id)
                    log.error("[%s]" % str(e), exc_info=e)
                finally:
                    self.session.expire_all()
                    self.session.close()

        log.info("DONE!!!")
        self.session.begin()
        log.info("No. of Test users in the DB: %d" % len(get_test_users(self.session)))
        if self.commit:
            log.info("Committing changes...")
            self.session.commit()
            self.session.expire_all()
        else:
            log.info("Rolling back changes...")
            self.session.rollback()
        self.session.close()

if __name__ == "__main__":
    import optparse

    auth_url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/auth?charset=utf8'
    #auth_url = 'mysql://dbadmin:D-coD#43@localhost:3306/auth?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--dbauth', dest='auth_url', default=auth_url,
        help='The URL for connecting to the auth database. Defaults to %s' % auth_url
    )
    parser.add_option(
        '-e', '--emails', type='string', action='store', dest='emails', default='',
        help='The list of email ids (<username>+testuser@ck12.org) of the members to be deleted. '
    )
    parser.add_option(
        '-k', '--deleteEmailsExcept', type='string', action='store', dest='keepEmails', default='',
        help='The list of email suffix (eg: ck12.org) of members to keep. This is used for data reload.'
    )
    parser.add_option(
        '-H', '--deleteIDLimit', type='int', action='store', dest='deleteHighIDs', default=False,
        help='Delete users with id matching and above this number (e.g. 200000). This is used for data reload'
    )
    parser.add_option(
        '-t', '--deleteAllTestUsers', action='store_true', dest='delete_all', default=False,
        help='Delete all test users with name:Test, surname:User and email suffix:testuser@ck12.org'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    parser.add_option(
        '-f', '--force', action='store_true', dest='force', default=False,
        help='Force deletion - ignore checks for email pattern'
    )
    parser.add_option(
        '-r', '--forReal', dest='commit', action='store_true', default=False,
        help='Delete the users for real.'
    )
    parser.add_option(
        '-y', '--answerYes', dest='answerYes', action='store_true', default=False,
        help='Do not ask for confirmation before deletion.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    auth_url = options.auth_url
    verbose = options.verbose
    delete_all = options.delete_all
    if options.emails:
        options.emails = options.emails.split(',')
    if options.keepEmails:
        options.keepEmails = options.keepEmails.split(',')
    if not delete_all and not options.emails and not options.keepEmails:
        parser.print_help()
        sys.exit(1)

    d = DeleteMember(auth_url, verbose, commit=options.commit, force=options.force, confirm=not options.answerYes)
    if delete_all:
        print "Deleting all test users ..."
        d.delete_all_test_users()
    elif len(options.emails):
        d.delete_members_auth(emails=options.emails)
    elif options.deleteHighIDs:
        d.delete_highIDs2(idLimit = options.deleteHighIDs, preserveEmails=options.keepEmails)
    elif len(options.keepEmails):
        print "Deleting all users except %s" % options.keepEmails
        d.delete_members_auth(preserveEmails=options.keepEmails)
