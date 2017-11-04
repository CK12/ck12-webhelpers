import operator
import logging
from datetime import datetime
from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model.mongo.conceptnode import ConceptNode
from flx.lib import helpers as h

log = logging.getLogger(__name__)


class Standard(ValidationWrapper):
    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = ['label', 'sid', 'standardSet', 'grades']
        self.field_dependencies = { }

    def create(self, **kwargs):
        self.before_insert(**kwargs)
        kwargs['created'] = datetime.now()
        id = self.db.Standards.insert(kwargs)
        return self.getByID(id)

    def updateBySID(self, sid, **kwargs):
        self.before_update(**kwargs)
        kwargs['updated'] = datetime.now()
        return self.db.Standards.update(
            {'sid': sid},
            {'$set': kwargs}
        )

    def getByID(self, id):
        return self.db.Standards.find_one(id)

    def getBySID(self, sid):
        return self.db.Standards.find_one({'sid': sid}, {'conceptEidsOld': False})

    def getByLabel(self, label, setName=None, country=None):
        if setName:
            if not country and '.' in setName:
                 country, setName = setName.split('.', 1)
        query = {'label': label}
        if setName and country:
            query['standardSet'] = { 'name': setName.upper(), 'country': country.upper() }
        return self.db.Standards.find_one(query)

    def getByEncodedID(self, country, setName, eid):
        return list(self.db.Standards.find({
            'standardSet': {'country': country.upper(), 'name': setName.upper()},
            'conceptEids': eid
        },
        {'conceptEidsOld': False}))

    def getMaxDepth(self):
        objs = list(self.db.Standards.find({}, {'depth': 1}).sort('depth', -1).limit(1))
        if objs:
            obj = objs[0]
            if 'depth' in obj:
                return obj['depth']

        return 0

    def _sortTreeList(self, lst):
        #lst = sorted(lst, key=lambda k: k['sequence'])
        lst.sort(key=operator.itemgetter('sequence'))

        for l in lst:
            if 'children' in l:
                self._sortTreeList(l['children'])

    def _generateTree(self, standardsList, rootStandard=None):
        standardsTreeList = []
        nodes = {}

        pending = []

        rootAncestorSIDs = []
        if rootStandard:
            if 'ancestorSIDs' in rootStandard:
                rootAncestorSIDs = rootStandard['ancestorSIDs']

        for st in standardsList:
            nodes[st['sid']] = st
            if 'ancestorSIDs' not in st:
                standardsTreeList.append(st)
            else:
                ancestorSIDs = st['ancestorSIDs']
                if rootAncestorSIDs:
                    l = len(rootAncestorSIDs)
                    _ancestorSIDs = ancestorSIDs[:l]
                    if _ancestorSIDs == ancestorSIDs:
                        ancestorSIDs = ancestorSIDs[l:]
                if ancestorSIDs:
                    pst = nodes[ancestorSIDs[-1]]
                    if not pst:
                        pending.append(st)
                    else:
                        if 'children' not in pst:
                            pst['children'] = []

                        pst['children'].append(st)
                else:
                    standardsTreeList.append(st)

        # all nodes are now available in nodes dict.
        # if there are any pending nodes, handle them
        for st in pending:
            pst = nodes[ancestorSIDs[-1]]
            if 'children' not in pst:
                pst['children'] = []

            pst['children'].append(st)

        self._sortTreeList(standardsTreeList)

        return standardsTreeList

    def getTree(self, country, setName, sid=None, depth=1, getConcepts=False):
        depth = int(depth)
        _depth = depth
        standardsList = []
        rootStandard = None

        if sid is None:
            standards = self.db.Standards.find({
                'standardSet': {'country': country, 'name': setName},
                'ancestorSIDs': {'$exists': False}
            }).sort('sequence', 1)

            standardsList = list(standards)
        else:
            rootStandard = self.getBySID(sid)

            if 'ancestorSIDs' in rootStandard:
                _depth += len(rootStandard['ancestorSIDs'])

            standardsList = [rootStandard, ]

        if depth > 1:
            
            standardIDs = []
            for st in standardsList:
                standardIDs.append(st['sid'])

            if standardIDs:
                #self.db.Standards.find({'ancestorSIDs.%s' % str(depth - 1) : {'$exists': False}}) 
                childStandards = self.db.Standards.find({
                    'ancestorSIDs': {'$in': standardIDs},
                    '$where': 'this.ancestorSIDs.length < %s' % str(_depth)
                    },
                    {'conceptEidsOld': False}).sort('sequence', 1)

                standardsList += list(childStandards)

            if getConcepts:
                cndb = ConceptNode(self.db)
                for st in standardsList:
                    if 'conceptEids' in st:
                        concepts = []
                        conceptEids = st['conceptEids']
                        for eid in conceptEids:
                            c = cndb.getByEncodedID(eid)
                            if c:
                                concepts.append(cndb.asDict(c))
                            else:
                                log.error('Could not find concept for conceptEID: %s' % eid)
                        if concepts:
                            del st['conceptEids']
                            st['concepts'] = concepts

        return self._generateTree(standardsList, rootStandard=rootStandard)

    def getAllStandardsForConcepts(self, encodedIDs):
        if not encodedIDs:
            return []

        query = { 'conceptEids': { '$in': encodedIDs }}
        proj = { 'label': True, 'sid': True}
        standards = list(self.db.Standards.find(query, proj).sort([('sequence', 1)]))
        return standards

    def getStandardsForConcept(self, encodedID, setName, country='US'):
        if not encodedID:
            raise Exception("No such encodedID: %s" % str(encodedID))

        query = {'standardSet.name': setName, 'standardSet.country': country, 'conceptEids': { '$in': [ encodedID ] }}
        proj = {'conceptEids': False, 'conceptEidsOld': False}
        standards = list(self.db.Standards.find(query, proj).sort([('sequence', 1)]))
        sidDict = {}
        for s in standards:
            ancestors = []
            for asid in s.get('ancestorSIDs'):
                if not sidDict.get(asid):
                    asDoc = self.db.Standards.find_one({'sid': asid}, {'conceptEids': False, 'conceptEidsOld': False});
                    sidDict[asid] = asDoc
                ancestors.append(sidDict.get(asid))
            s['ancestors'] = ancestors
                
        return standards

