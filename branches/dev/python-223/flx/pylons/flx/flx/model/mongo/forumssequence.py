import logging
from datetime import datetime

from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model.mongo import page as p

log = logging.getLogger(__name__)


class ForumsSequence(ValidationWrapper):

    def __init__(self, db, dc=True):
        self.db = db
        self.dc = dc
        self.required_fields = ['forum_id', 'sequence']
        self.field_dependecies = {
                                    'forum_id': {'type': int},
                                    'sequence': {'type': int},
                                 }

    def update(self, forums_sequence):
        # as sequence has unique index, first remove existing sequence
        self.db.ForumsSequence.remove({}, safe=True)
        for each_item in forums_sequence:
            self.before_update(**each_item)
            seq = {}
            seq['updated'] = datetime.now()
            seq['sequence'] = int(each_item.get("sequence"))
            self.db.ForumsSequence.update(
                {'forum_id': int(each_item.get("forum_id"))},
                {'$set': seq},
                upsert=True
                )
        return self.getForumsSequence()

    def getForumsSequence(self):
        results = []
        objs = self.db.ForumsSequence.find({})
        for obj in objs:
            obj['forum_id'] = int(obj['forum_id'])
            obj['sequence'] = int(obj['sequence'])
            results.append(obj)
        return results
