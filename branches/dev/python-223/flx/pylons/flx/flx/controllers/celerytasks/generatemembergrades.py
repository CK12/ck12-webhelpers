import logging
import MySQLdb as mdb

from flx.lib.unicode_util import UnicodeWriter
from flx.controllers.celerytasks.generictask import GenericTask

# Database configurations.
HOST = "mysql.master"
USER = "dbadmin"
PASSWORD = "D-coD#43"
DB = "flx2"

log = logging.getLogger(__name__)

class MemberGradesTask(GenericTask):
    """Class to generate Grades recommendations for members who have and updated Grades information.
    """
    recordToDB = False

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"        
        self.csv_headers = ['Member ID', 'Grade IDs', 'Deduce']
        self.output_file = "/tmp/member_grades.csv"
        # Groups that have too many members will be excluded.
        self.exclude_group_ids = [1, 2, 3, 4]
        # Get database connection.
        conn = mdb.connect(host=HOST, user=USER, passwd=PASSWORD, db=DB, use_unicode=True)
        self.cur = conn.cursor()

    def get_member_groups(self, member_ids):
        """Get list of groups for provided member_ids.
        """
        member_ids = ','.join(map(str, member_ids))
        member_groups = dict()
        groups = []
        #qry = "SELECT DISTINCT (memberID, groupID) FROM flx2.GroupHasMembers WHERE memberID in (%s) % " % memberIDs
        qry = "SELECT gm.memberID, g.id from flx2.GroupHasMembers gm, flx2.Groups g WHERE gm.groupID = g.id AND g.groupType='class' AND gm.memberID in (%s)" % member_ids
        self.cur.execute(qry)
        results = self.cur.fetchall()
        for result in results:
            member_id, group_id = result
            member_groups.setdefault(member_id, []).append(group_id)
            groups.append(group_id)
        # Remove the duplicate group ids.
        groups = list(set(groups))
        return (member_groups, groups)

    def get_group_members(self, group_ids):
        """Get list of members for provided group_ids.
        """
        # Get all the members of every group, excluding specific groups.
        group_ids = set(group_ids) - set(self.exclude_group_ids)
        group_ids = ','.join(map(str, group_ids))
        group_members = dict()
        qry = "SELECT groupID, memberID FROM flx2.GroupHasMembers WHERE groupID in (%s)" % group_ids
        self.cur.execute(qry)
        results = self.cur.fetchall()
        for result in results:
            group_id, member_id = result
            group_members.setdefault(group_id, []).append(member_id)
        return group_members

    def run(self):
        """Prepares CSV file for Grades recommendations for members who have and updated Grades information.
        """
        members = dict()

        fd = open(self.output_file, 'w')
        csv_writer = UnicodeWriter(fd)
        # Add CSV Headers
        csv_writer.writerow(self.csv_headers)

        #Get all the exisitng memebrs who has updated there grades.  
        qry = "SELECT DISTINCT memberID,gradeID FROM flx2.MemberHasGrades ORDER BY memberID, gradeID"
        self.cur.execute(qry)
        results = self.cur.fetchall()

        for result in results:
            member_id, grade_id = result
            members.setdefault(member_id, []).append(grade_id)
        for member_id in members:
            grade_ids = ','.join(map(str, members[member_id]))
            csv_writer.writerow([member_id, grade_ids, 'true'])
        log.info("Fetched all the existing members who has updated there grades. Count: %s" % len(members))

        # Get all the groups of the users who has updated there grades.
        member_ids = members.keys()
        member_groups, group_ids = self.get_member_groups(member_ids)
        # Get all the members of every group.
        group_members = self.get_group_members(group_ids)

        # For every member get all the members in his groups and update there grades information.
        member_count = 0
        for member_id in members:
            log.info("Processing member %s:%s" % (member_id, str(members[member_id])))
            grade_ids = ','.join(map(str, members[member_id]))
            # Get the member Groups
            group_ids = member_groups.get(member_id, [])
            for group_id in group_ids:
                # Get the members of the group
                group_member_ids = group_members.get(group_id, [])
                for group_member_id in group_member_ids:
                    # Do not add the user if it already has grades information.
                    if not members.get(group_member_id):
                        csv_writer.writerow([group_member_id, grade_ids, 'false'])
                        member_count += 1
        fd.close()
        log.info("Completed collecting all the Members grade data.")
        log.info("Members having grade information: %s" % len(members))
        log.info("Members recommended for grade information: %s" % member_count)
