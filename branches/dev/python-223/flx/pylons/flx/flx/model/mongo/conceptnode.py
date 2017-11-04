import logging
from datetime import datetime
from flx.model import model
from flx.model.mongo.validationwrapper import ValidationWrapper

log = logging.getLogger(__name__)

class ConceptNode(ValidationWrapper):
    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = [
            'name', 'handle', 'description', 'previewImageUrl',
            'encodedID', 'rank', 'descendants', 'parentID', 'branch',
            'subject', 'ck12ModalityCount', 'communityModalityCount',
            'status', 'redirectedReferences', 'oldHandles'
        ]
        self.required_subject_branch_fields = ['name', 'shortname']
        self.field_dependencies = { }

    def create(self, **kwargs):
        if not kwargs.has_key('descendants'):
            kwargs['descendants'] = []
        if not kwargs.has_key('rank'):
            kwargs['rank'] = None

        for key in kwargs.keys():
            if key not in self.required_fields:
                del kwargs[key]
            # Add branch and subject info with 'name', 'shortname' and 'handle' fields
            if key=='branch' or key=='subject':
                for reqKey in kwargs[key].keys():
                    if reqKey not in self.required_subject_branch_fields:
                        kwargs[key].pop(reqKey, None)
                kwargs[key]['handle'] = model.title2Handle(kwargs[key]['name'])
                
        self.before_insert(**kwargs)
        kwargs['created'] = datetime.now()
        id = self.db.ConceptNodes.insert(kwargs)
        return self.getByID(id)

    def deleteAll(self, subjectShortname=None, branchShortname=None):
        query = {}
        if subjectShortname:
            query['subject.shortname'] = subjectShortname
        if branchShortname:
            query['branch.shortname'] = branchShortname
        self.db.ConceptNodes.remove(query)

    def getByID(self, id):
        return self.db.ConceptNodes.find_one(id)

    def getByEncodedID(self, eID):
        return self.db.ConceptNodes.find_one({'encodedID': eID})

    def getByEncodedIDs(self, eIDs):
        query = {'encodedID': {'$in': eIDs }}
        return self.db.ConceptNodes.find(query)

    def getByRedirectedReferences(self, redirectedReferences):
        query = {'redirectedReferences': {'$in': redirectedReferences }}
        return self.db.ConceptNodes.find(query)

    def getConceptsForBranch(self, subject, branch=None, includeMdodalityCounts=False):
        query = { 'subject.shortname': subject.upper()}
        if branch:
            query['branch.shortname'] = branch.upper()
        proj = None
        if not includeMdodalityCounts:
            proj = {'ck12ModalityCount': False, 'communityModalityCount': False}
        log.debug("includeMdodalityCounts: %s projection: %s" % (includeMdodalityCounts, proj))
        return self.db.ConceptNodes.find(query, proj).sort([('rank', 1)])

    def getConceptsByBranch(self, subject, branch, count, includeMdodalityCounts=False):
        query = {'subject.shortname': subject.upper(), 'branch.shortname': branch.upper(),
                 'previewImageUrl':{"$exists":True, "$nin": [None]}}
        proj = None
        if not includeMdodalityCounts:
            proj = {'ck12ModalityCount': False, 'communityModalityCount': False}
        log.debug("includeMdodalityCounts: %s projection: %s" % (includeMdodalityCounts, proj))
        return self.db.ConceptNodes.find(query, proj).limit(count).sort([('rank', 1)])

    def asDict(self, concept):
        if not concept:
            return concept
        concept['handle'] = concept.get('handle', '').lower()
        if concept.get('branch'):
            concept['branch']['handle'] = concept['branch'].get('handle', '').lower()
        if concept.get('subject'):
            concept['subject']['handle'] = concept['subject'].get('handle', '').lower()
        return concept
