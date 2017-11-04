"""
[Story #110042886] Provide a script to delete a test user from DB
"""
import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)
            
from flx.model import api, meta, model

import flx.lib.helpers as h
from sqlalchemy.sql import and_, or_

import logging

LOG_FILENAME = "/tmp/delete_users_flx.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
handler.setFormatter(formatter)
log.addHandler(handler)

flx_delete_id = 'flx_delete_id.txt'

#---functions dealing with flx2
def getResourcesByOwner(session, ownerID):
    query = session.query(model.Resource)
    query = query.filter(model.Resource.ownerID == ownerID)
    query = query.order_by(model.Resource.id)
    return query.all()


def delete_other_member_data(session, memberID):
    query = session.query(model.ArtifactFeedbackHelpful).filter(or_(model.ArtifactFeedbackHelpful.memberID == memberID,
                                                  model.ArtifactFeedbackHelpful.reviewersMemberID == memberID))
    query.delete()

    query = session.query(model.ArtifactFeedbackReview).filter_by(reviewersMemberID=memberID)
    query.delete()

    query = session.query(model.ArtifactFeedback).filter_by(memberID=memberID)
    query.delete()

    query = session.query(model.ArtifactFeedbackAbuseReport).filter(or_(model.ArtifactFeedbackAbuseReport.memberID == memberID,
                                                  model.ArtifactFeedbackAbuseReport.reporterMemberID == memberID))
    query.delete()

    query = session.query(model.AbuseReport).filter(or_(model.AbuseReport.reporterID == memberID,
                                                  model.AbuseReport.reviewerID == memberID))
    query.delete()

    query = session.query(model.MemberSelfStudyItemStatus).filter_by(memberID=memberID)
    query.delete()

    query = session.query(model.MemberViewedArtifact).filter_by(memberID=memberID)
    query.delete()

    query = session.query(model.Notification).filter_by(subscriberID=memberID)
    query.delete()

    query = session.query(model.GroupActivity).filter_by(ownerID=memberID)
    query.delete()

    query = session.query(model.Task).filter_by(ownerID=memberID)
    query.delete()

    query = session.query(model.Event).filter(or_(model.Event.ownerID == memberID,
                                                  model.Event.subscriberID == memberID))
    query.delete()

    query = session.query(model.LMSProviderGroupMember).filter_by(memberID=memberID)
    query.delete()

    query = session.query(model.TeacherStudentRelation).filter(or_(model.TeacherStudentRelation.studentID == memberID,
                                                                   model.TeacherStudentRelation.teacherID == memberID))
    query.delete()

    query = session.query(model.ArtifactHandle).filter_by(creatorID=memberID)
    query.delete()


def delete_notification_for_group(session, groupID):
    query = session.query(model.Notification).filter_by(groupID=groupID)
    query.delete()


def delete_artifacts_for_member(session, member):
    artifacts = api._getArtifactsByOwner(session, owner=member)
    if artifacts:
        for a in artifacts:
            try:
                log.info("Deleting artifact: %d, %s, %s" % (a.id, a.name, a.type.name))
                api._deleteArtifactAttributersByArtifactID(session, artifactID=a.id)
                api._deleteArtifact(session, artifact=a, recursive=True)
            except Exception as ae:
                log.warn("Error deleting artifact: %d, %s" % (a.id, str(ae)), exc_info=ae)
                raise Exception('Error deleting artifact id: %d' % a.id)


def delete_resources_for_member(session, member):
    resources = getResourcesByOwner(session, ownerID = member.id)
    for r in resources:
        try:
            api._deleteResource(session, resource=r)
            log.info("Deleted resource id: %d" % r.id)
        except Exception as ae:
            log.warn("Error deleting resource id: %d, %s" %(r.id, str(ae)), exc_info=ae)
            raise Exception('Error deleting resource id: %d' % r.id)


def delete_groups_for_member(session, member):
    groups = api._getGroupsByCreatorID(session, creatorID = member.id, onlyActive=False)
    for group in groups:
        try:
            log.info("Deleting group id: %d" % group.id)
            delete_notification_for_group(session=session, groupID=group.id)
            api._deleteGroup(session, group=group, memberID=member.id)
        except Exception as ge:
            log.warn("Error deleting group: %s" % str(ge), exc_info=ge)
            raise Exception('Error deleting group id: %d' % group.id)


def get_test_users(session):
    users = session.query(model.Member).filter(and_(model.Member.givenName == 'Test',
                                                         model.Member.surname == 'User'))
    test_user_ids = []
    for u in users:
        if u.email.endswith('testuser@ck12.org'):
            test_user_ids.append(u.id)
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

    def delete_member(self, member):

        log.info("Deleting user with id: [%d]" % member.id)
        delete_other_member_data(self.session, memberID=member.id)
        delete_artifacts_for_member(self.session, member)
        delete_resources_for_member(self.session, member)
        delete_groups_for_member(self.session, member)

        #Finally delete the member
        api._deleteMember(self.session, member)
        self.session.flush()

    def deleteFromListFile (self, listFile=''):
        print "ListFile: %s" % listFile
        if listFile == '':
            print "Please include a list id file"
            return
            
        with open(listFile, 'r') as lf:
            cnt = 1
            for memberID in lf:
                log.info("[%d] Deleting memberID [%s]" % (cnt, memberID))
                try:
                    member = api._getMemberByID(self.session, id=memberID)
                    if member:
                        self.delete_member(member)
                except Exception, e:
                    log.warn("Error processing member: %s. [%s]" % (memberID, str(e)), exc_info=e)
                cnt += 1                
        
    def sanitizeFromListFile (self, listFile=''):
        print "ListFile: %s" % listFile
        if listFile == '':
            print "Please include a list id file"
            return
            
        with open(listFile, 'r') as lf:
            cnt = 1
            for memberID in lf:
                log.info("[%d] Deleting memberID [%s]" % (cnt, memberID))
                try:
                    member = api._getMemberByID(self.session, id=memberID)
                    if member:
                        member.defaultLogin = member.defaultLogin[:-4] + ".jnk"
                        member.surname = member.surname[:-4] + ".jnk"
                        member.givenName = member.givenName[:-4] + ".jnk"
                        member.email = member.email[:-4] + ".jnk"
                        member.login = member.login[:-4] + ".jnk"
                        api._updateMember(self.session, member)
                        self.session.flush()
                except Exception, e:
                    log.warn("Error processing member: %s. [%s]" % (memberID, str(e)), exc_info=e)
                cnt += 1                
        
    def delete_highIDs(self, idLimit=0, preserveEmails=[]):
        if not idLimit:
            print "Nothing to delete. Please enter a max user id limit"
            return

        if idLimit <3:
           print "User id limit too low, it includes ck12editor (id=3)"
           return

        pageSize = 500
        pageNum = (idLimit / pageSize) + 1
        while True:
            try:
                members = api._getMembers(self.session, sorting='id,asc', pageNum=pageNum, pageSize=pageSize)
                log.debug("PageNum: %s, members.len: %s" % (pageNum, len(members)))
                if not members:
                    break
                
                #self.session.begin()
                for member in members:
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
    
    def delete_members_by_email(self, emails=[], preserveEmails=[]):
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
                        members = api._getMembers(self.session, sorting='id,asc', pageNum=pageNum, pageSize=pageSize)
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
        users_to_be_deleted = get_test_users(self.session)
        self.session.commit()
        print "%d test users will be deleted" % len(users_to_be_deleted)
        if self.confirm:
            check = raw_input("Are you sure you want to proceed? (y/n)\n")
        else:
            check = 'y'
        count = 0
        if check == 'y':
            for member_id in users_to_be_deleted:
                count += 1
                #if count == 10:
                #    break
                try:
                    self.session.begin()
                    member = api._getMemberByID(self.session, member_id)
                    member_email = member.email
                    log.info("Count %d, MemberID: %d, Email: %s" % (count, member_id, member_email))
                    self.delete_member(member=member)
                    if self.commit:
                        log.info("Committing changes...")
                        self.session.commit()
                    else:
                        log.info("Rolling back changes...")
                        self.session.rollback()
                    log.info("**Deleted member id: %d email: %s from flx2" % (member_id, member_email))
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

    flx2_url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    #flx2_url = 'mysql://dbadmin:D-coD#43@localhost:3306/flx2?charset=utf8'
    
    parser = optparse.OptionParser('%prog [options]')
    
    parser.add_option(
        '-d', '--db', dest='flx2_url', default=flx2_url,
        help='The URL for connecting to the flx2 database. Defaults to %s' % flx2_url
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
        '-l', '--deleteFromListFile', action='store', dest='deleteFromListFile', default='',
        help="Delete members with ids from a list file."
    )
    parser.add_option(
        '-s', '--sanitizeFromListFile', action='store', dest='sanitizeFromListFile', default='',
        help="Cleanup PII of members with ids from a list file."
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

    flx2_url = options.flx2_url
    verbose = options.verbose
    delete_all = options.delete_all
    if options.emails:
        options.emails = options.emails.split(',')
    if options.keepEmails:
        options.keepEmails = options.keepEmails.split(',')
    if not delete_all and not options.emails and not options.keepEmails and not options.deleteHighIDs \
       and not options.deleteFromListFile and not options.sanitizeFromListFile:
        parser.print_help()
        sys.exit(1)

    d = DeleteMember(flx2_url, verbose, commit=options.commit, force=options.force, confirm=not options.answerYes)
    if delete_all:
        print "Deleting all test users ..."
        d.delete_all_test_users()
    elif len(options.emails):
        d.delete_members_by_email(emails=options.emails)
    elif options.deleteHighIDs:
        d.delete_highIDs(idLimit = options.deleteHighIDs, preserveEmails=options.keepEmails)
    elif options.deleteFromListFile:
        print "ListFile: %s" % options.deleteFromListFile
        d.deleteFromListFile(listFile = options.deleteFromListFile)
    elif options.sanitizeFromListFile:
        print "ListFile: %s" % options.sanitizeFromListFile
        d.sanitizeFromListFile(listFile = options.sanitizeFromListFile)
    elif len(options.keepEmails):
        print "Deleting all users except %s" % options.keepEmails
        d.delete_members_by_email(preserveEmails=options.keepEmails)
