import urllib
import json
import logging
import logging.handlers
from flx.model import api as model_api
from flx.lib.unicode_util import UnicodeWriter
from flx.lib.unicode_util import UnicodeDictReader
#from unicode_util import UnicodeWriter
#from unicode_util import UnicodeDictReader


# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()
hdlr = logging.handlers.RotatingFileHandler('/tmp/ck12_artifacts.log', maxBytes=100*1024*1024, backupCount=500)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

branch_api = "http://www.ck12.org/taxonomy/get/info/branches?pageSize=100"
concept_api = "http://www.ck12.org/taxonomy/get/info/concepts/%s/%s?pageSize=1000"

csv_headers_1 = ['EID', 'conceptName','subject' ,'branch']
output_csv_path_1 = '/tmp/data/ck12_eids.csv'

csv_headers_2 = ['EID', 'artifactID', 'artifactType', 'level', 'owner', 'subject', 'branch']
output_csv_path_2 = '/tmp/data/ck12_artifacts.csv'

intern_accounts_csv = '/tmp/data/intern_accounts.csv'

sub_br_map = dict()
artifact_types = dict()

def run():
    """
    """
    build_artifact_types()
    build_subject_branch_mapping()
    # csv file for EID information
    fd1 = open(output_csv_path_1, 'w')
    csv_writer_1 = UnicodeWriter(fd1)
    csv_writer_1.writerow(csv_headers_1)

    # csv file for artifact information
    fd2 = open(output_csv_path_2, 'w')
    csv_writer_2 = UnicodeWriter(fd2)
    csv_writer_2.writerow(csv_headers_2)

    # Process artifacts owned by CK-12 Intern Users
    rows = UnicodeDictReader(open(intern_accounts_csv, 'rb'))
    member_ids = []
    for row in rows:
        member_id =  str(row['ID']).strip()
        if member_id:
           member_ids.append(member_id)
    members = model_api.getMembers(idList=member_ids)
    log.info("Total CK-12 Intern Users to process:%s" % len(members))
    for member in members:
        log.info("Processing MemberID :%s" % member.id)
        artifacts = model_api.getArtifactsByOwner(member)
        log.info("Member artifacts count :%s" % len(artifacts))
        for artifact in artifacts:
            eid = artifact.encodedID
            if not eid:
                arft  = model_api.getArtifactByID(id=artifact.id)
                artifact_dict = arft.asDict()
                if artifact_dict.has_key('domain') and artifact_dict['domain']: # artifact is associated with a concept. 
                    eid = artifact_dict['domain'].get('encodedID')

            level = artifact.getLevel()
            level = level if level else "None"
            # Process only published and eid having level
            if not (artifact.revisions[0].publishTime and eid):
                continue
            # get the subject and branch from artifact encodedID
            eid_parts = eid.split('.')
            subject = sub_br_map.get(eid_parts[0])
            branch = sub_br_map.get(eid_parts[1])
            row = [eid, artifact.id, artifact.type.name, level, 'CK-12 Intern', subject, branch]
            csv_writer_2.writerow(row)

    # Process artifacts owned by CK-12 Users
    ud1 = urllib.urlopen(branch_api)
    data = json.loads(ud1.read())
    branches = data['response']['branches']
    subject_branches = map(lambda x:(x['subject']['name'], x['subject']['shortname'], x['name'], x['shortname']), branches)
    subject_branches.sort()
    # Process all the concepts under the respective subject/branch
    for subject_branch in subject_branches:
        log.info("Processing subject branch :%s" % str(subject_branch))
        subject, sub, branch, br = subject_branch
        api = concept_api % (sub, br)
        ud2 = urllib.urlopen(api)
        response = json.loads(ud2.read())
        concepts = response['response']['conceptNodes']
        for concept in concepts:
            concept_name = concept['name']
            eid = concept['encodedID']
            row = [eid, concept_name, subject, branch]
            csv_writer_1.writerow(row)
            log.info("Processing concept encodedID:%s" % eid)
            browse_term = model_api.getBrowseTermByEncodedID(eid)
            artifacts = model_api.getRelatedArtifactsForDomains([browse_term.id], ownedBy='ck12')
            log.info("encodedID artifacts count :%s" % len(artifacts))
            for artifact in artifacts:
                level = artifact.level
                level = level if level else "None"
                type_name = artifact_types.get(artifact.artifactTypeID)
                # Process only published and eid having level
                if not artifact.publishTime:
                    continue
                row = [eid, artifact.id, type_name, level, 'CK-12', subject, branch]
                csv_writer_2.writerow(row)

def build_subject_branch_mapping():
    """Build the state and subject mapping for shortname to full name.
       Eg.  MAT ==> Mathematics
    """
    global sub_br_map
    ud1 = urllib.urlopen(branch_api)
    data = json.loads(ud1.read())
    branches = data['response']['branches']
    subjects = map(lambda x:(x['subject']['shortname'], x['subject']['name']), branches)
    branches = map(lambda x:(x['shortname'], x['name']), branches)
    subjects.extend(branches)
    sub_br_map = dict(subjects)

def build_artifact_types():
    """
    """
    global artifact_types
    arft_types = model_api.getArtifactTypes()
    for arft_type in arft_types:
        artifact_types[arft_type.id] = arft_type.name

if __name__ == "__main__":
    run()
