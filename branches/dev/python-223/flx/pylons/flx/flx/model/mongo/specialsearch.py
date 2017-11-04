import logging
import re
from bson.objectid import ObjectId
from datetime import datetime

from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model.mongo import page as p

log = logging.getLogger(__name__)

class SpecialSearchEntry(ValidationWrapper):

    def __init__(self, db, dc=True):
        self.db = db
        self.dc = dc
        self.required_fields = ['term']
        self.field_dependecies = { 
                                    'term':{'type': str},
                                 }

    def create(self, **kwargs):
        try:
            self.before_insert(**kwargs)

            log.info('kwargs: [%s]' %(kwargs))
            now = datetime.now()
            # Check collection to see if document already exists, update if true
            obj = self.db.SpecialSearchEntries.find_one({'term': kwargs['term']})
            if obj:
                raise Exception("Cannot save SpecialSearchEntry. Duplicate term: %s" % kwargs['term'])
            kwargs['termTxt'] = kwargs['term']
            kwargs['created'] = now
            kwargs['updated'] = now
            objectID = self.db.SpecialSearchEntries.insert(kwargs)
            return self.db.SpecialSearchEntries.find_one({'_id': objectID})
        except Exception as e:
            log.error('Cannot create SpecialSearchEntry: %s' %(str(e)), exc_info=e)
            raise e

    def update(self, id, **kwargs):
        self.before_update(**kwargs)
        obj = self.get(id)
        if not obj:
            raise Exception("No such SpecialSearchEntry: %s" % id)
        if kwargs.has_key('term'):
            kwargs['term'] = kwargs['term']
            kwargs['termTxt'] = kwargs['term']
        kwargs['updated'] = datetime.now()
        self.db.SpecialSearchEntries.update({'_id': ObjectId(str(id))}, { '$set': kwargs })
        return self.get(id)

    def delete(self, term):
        obj = self.db.SpecialSearchEntries.find_one({'term': term})
        if not obj:
            raise Exception('No such SpecialSearchEntry: %s' % term)
        self.db.SpecialSearchEntries.remove({'term': obj['term']})
        return True

    def get(self, id):
        return self.db.SpecialSearchEntries.find_one({'_id': ObjectId(str(id))})

    def getSpecialSearchEntry(self, term):
        try:
            return self.db.SpecialSearchEntries.find_one({'term': term})
        except Exception, e:
            log.error("Error getting SpecialSearchEntry: %s" % str(e), exc_info=e)
            raise e

    def getSpecialSearchEntries(self, termLike=None, pageNum=1, pageSize=10):
        query = {}
        if termLike:
            query['term'] = re.compile('.*%s.*' % termLike, re.I)
        return p.Page(self.db.SpecialSearchEntries, query, pageNum, pageSize)

    def lookupSpecialSearchTerm(self, term, limit=1):
        results = []
        version = '2.6'
        if version == '2.4':
            ## Old version
            obj = self.db.command('text', 'SpecialSearchEntries', search=term, limit=limit)
            for r in obj.get('results'):
                result = r.get('obj')
                result['score'] = r.get('score')
                results.append(result)
        else:
            objs = self.db.SpecialSearchEntries.find({'$text': { '$search': term } }, { 'score': { '$meta': 'textScore' } }).limit(limit)
            objs.sort([('score', {'$meta': 'textScore'})])
            for obj in objs:
                results.append(obj)
        return results



