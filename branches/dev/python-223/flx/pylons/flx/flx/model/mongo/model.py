import logging,re,ast
from flx.lib import helpers as h
from bson.objectid import ObjectId


log = logging.getLogger(__name__)

"""
    Errors.
"""
class MissingAttributeError(Exception):
    def __init__(self, value):
        Exception.__init__(self, value)
        self.value = value

    def __repr__(self):
        return self.value

def checkAttributes(expectedList, **kwargs):
    """
        Validate the existence of required parameters.
    """
    missingList = []
    for expected in expectedList:
        if not kwargs.has_key(expected):
            missingList.append(expected)
    if len(missingList) > 0:
        raise MissingAttributeError('Missing required attributes: %s' % str(missingList))

def queryFilters(query, filters, filterableFields=['_id']):
    log.debug("Filters parameter: %s, : filterableFields: %s" % (filters, str(filterableFields)))
    filterDict = {}
    if filters:
        for filterFld, filterValue in filters:
            if filterFld not in filterableFields:
                raise Exception(u'Unsupported filter field: %(filterFld)s' % {"filterFld":filterFld})
            if filterFld:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                if type(filterValue) in [str,unicode]:
                    if h.isValidObjectId(filterValue):
                        filterValue = ObjectId(str(filterValue))
                    elif h.isNumber(filterValue):
                        filterValue = ast.literal_eval(filterValue)
                    elif h.isBool(filterValue):
                        filterValue = h.toBool(filterValue)

                filterDict[filterFld].append(filterValue)
    if filterDict:
        q = _queryFilters(filterDict) 
        if q:
           query.update(q) 
    return query

def _queryFilters(filterDict):
    query = {}
    for filterFld in filterDict.keys():
        filterData = filterDict[filterFld]
        log.info(u"Filter fld: %(filterFld)s, terms: %(filter)s" % {"filterFld":filterFld, "filter":filter})
        q = { filterFld: {'$in': filterData}}
        query.update(q) 
    return query

def querySearch(query, searchFld, term, searchableFields=[],conceptEids=[]):
    log.debug("Search Field: %s,  term: %s, searchableFields: %s" % (searchFld, term, str(searchableFields)))
    q = {}
    qOr = []
    if searchFld and searchFld != 'searchAll' and searchFld not in searchableFields:
        raise Exception(u'Unsupported search field: %(searchFld)s' % {"searchFld":searchFld})

    if searchFld == 'searchAll' and term:
        # Assume weighted high 
        for fld in searchableFields:
            qOr.append({fld:re.compile('.*'+ term +'.*', re.IGNORECASE)})
        if conceptEids and len(conceptEids)>0:
            qOr.append({'encodedIDs':{ '$in': conceptEids}})
        # Assume weighted low
        #splitTerms = term.split(' ')  
        #if len(splitTerms) > 1: 
        #    for fld in searchableFields:
        #        for t in splitTerms:
        #            qOr.append({fld:re.compile('.*'+ t +'.*', re.IGNORECASE)})
    else:
        q = { searchFld: re.compile('.*'+ term +'.*', re.IGNORECASE)} 
        qOr.append(q)
        #splitTerms = term.split(' ')  
        #if len(splitTerms) > 1: 
        #    for t in splitTerms:
        #        qOr.append({searchFld:re.compile('.*'+ t +'.*', re.IGNORECASE)})
        #else:
        #    query.update(q) 

    if qOr:
        # IF already has $or, make it as '$and' with two '$or's
        if query.has_key('$or'):
            query['$and'] = [ { '$or': query.pop('$or')}, { '$or': qOr } ]
        else:
            query['$or'] = qOr
    return query

def queryEmptyFields(query, fieldsToCheck, emptyCheckFields=[]):
    qOr=[]
    for fieldToCheck in fieldsToCheck:
        if fieldToCheck not in emptyCheckFields:
            raise Exception(u'Unsupported field for empty check: %s' % fieldToCheck)
        qOr.extend([{fieldToCheck:{'$in':[[],'',re.compile('^[\s\R]+$')]}},{fieldToCheck:{'$exists':0}}])
    
    if qOr:
        # IF already has $or, make it as '$and' with two '$or's
        if query.has_key('$or'):
            query['$and'] = [ { '$or': query.pop('$or')}, { '$or': qOr } ]
        else:
            query['$or'] = qOr
    return query
    

def queryTimeline(query, field, startTime, endTime):
    # Make sure the start is less than end time
    if startTime or endTime: 
        if startTime and endTime and startTime > endTime:
            tmpStart = startTime
            startTime = endTime
            endTime = tmpStart
        timeline = {}
        if startTime:
            timeline['$gte'] = startTime
        if endTime:
            timeline['$lt'] = endTime
        if not query.has_key(field):
            query.update({field: timeline})
        else:
            query.update({ "$and": [ {field: query.pop(field)}, {field: timeline} ] })
    return query
