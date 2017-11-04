"""

You can use this wrapper for mongoDB data validation while before insert or update.

Currently this wrapper has four interfaces

* before_insert:
    It will validate the required fields, field data, and field dependencies

* before_update:
    It will validate the field data, and field dependencies

* validate_fields:
    Its an empty interface. If you want to validate the fields or do anything before insert, You can override it in your subclass

* validate_dependencies:
    Its an interface which has in-build codes to check the data dependencies( just like the data integrity checker in mysql)

    For this, Only thing you need to do is, write dependency rules inside your subclass in the name of 'self.field_dependencies'

    The rules should be in dictionary format.
    
    Syntax:
        self.field_dependencies = { 
                                    'fieldName': <rule>,
                                    'fieldName': <rule>,
                                  }

    Currently this wrapper will support four different dependency rules:


    1. If the field value is an object of another collection:

       Example: 

           sample = { 'questionTypeID': '50ec7038706cfc1953994ca8', .... } 

           Rule:

           self.field_dependencies = {
                           'questionTypeID':{
                               'collection':self.db.QuestionTypes,
                               'field':'_id',
                           }
                         }

           The above will check the 'questionTypeID' existance in 'QuestionTypes' collection in the field '_id'

    2. If the field value is a list of objects of another collection:

       Example: 

           sample = { 'questionInstanceIDs': ['50ec7038706cfc1953994ca8', '50f7948506cafd0db766a180'], .... } 

           Rule:

           self.field_dependencies = { 
                           'questionInstanceIDs':{
                                   'type': list,
                                   'collection':self.db.QuestionInstances,
                                   'field':'_id',
                                   },
                           }, 

           The above will check the existance all the ids in 'questionInstanceIDs' array in the 'QuestionInstances' collection field '_id'
 
    3. If the field is a list of dictionaries and you want to specifically check the dependency of the dictionary's field:

       Example: 
           
           sample = { 'questionData': [  
                                        { 'questionID': '50ec7038706cfc1953994ca8' },
                                        { 'questionID': '50f7948506cafd0db766a180' },
                                      ], .... }
                                       
           Rule:
         
           self.field_dependencies = { 
                           'questionData':{
                                   'type': list,
                                   'fields':{  
                                       'questionID': {
                                             'collection':self.db.Questions,
                                             'field':'_id',
                                       },   
                                   },
                           },

           The above will check the dependency of all the questionID field in all the dict in 'questionData' array.

    4. If the field is a list of dictionary and you want to specifically check the dependency of the dictionary field only if the dictionary has some required values:

      Sample = { "objectIDs": [
                        {
                           "objectID": "50f7948506cafd0db766a1c1",
                           "type": "question"
                        },
                        {
                           "objectID": "50f7948506cafd0db766a1c1",
                           "type": "questionPool"
                        },
                        ],
               .... } 

      Rule:
           self.field_dependencies = {
                           'objectIDs':{
                                   'type': list,
                                   'fields':{
                                       'objectID': [
                                           { 'if':{'key':'type','value':'question'},
                                             'collection':self.db.Questions,
                                             'field':'_id',
                                           },
                                           { 'if':{'key':'type','value':'questionInstance'},
                                             'collection':self.db.QuestionInstances,
                                             'field':'_id',
                                           },
                                           { 'if':{'key':'type','value':'questionPool'},
                                             'collection':self.db.QuestionPools,
                                             'field':'_id',
                                           },
                                       ]
                                   },
                           }
                      }

           The above will check the dependency of all the objectID field in all the dict in 'questionData' array. But, the dependency check is only depends upon the 'if' condition. It will check the dependecy only if the dict has {'type':question | questionInstance | questionPool}  

Lastly Edited at 01/17/2013 - Shanmuga Bala 

"""

from assessment.models import model
from assessment.lib.localtime import Local
from assessment.lib.helpers import load_config
from bson.objectid import ObjectId
from datetime import datetime

import logging

log = logging.getLogger(__name__)

class ValidationWrapper(object):

    dc = False
    required_fields = []
    field_dependencies = {}
    datetime_fields = []
    config = load_config()

    def before_insert(self, **kwargs):
        model.checkAttributes(self.required_fields, **kwargs)
        self.validate_fields(**kwargs)
        self.validate_dependencies(**kwargs)

    def before_update(self, **kwargs):
        self.validate_fields(**kwargs)
        self.validate_dependencies(**kwargs)

    def validate_fields(self, **kwargs):
        pass  

    def validate_dependencies(self, **kwargs):
        if self.dc:
            for key in self.field_dependencies:
                if kwargs.has_key(key):
                    keyData = self.field_dependencies[key]

                    # If the given value is a field of another collection
                    if not keyData.has_key('type'):
                        condition = keyData
                        collection = condition['collection']
                        collection_field = condition['field']
                        field_value = kwargs[key]
                        if collection_field == '_id' and not isinstance(field_value,ObjectId):
                            field_value = ObjectId(str(field_value))
                        doc = collection.find_one({collection_field:field_value})
                        if not doc:
                            raise Exception('Dependency Error: No such %s document. %s(%s):%s' %(collection.name, collection_field, key, field_value))

                    # If the given value is a list and each data in the list is a field of another collection
                    elif keyData['type'] == list and keyData.has_key('collection') and keyData.has_key('field'):
                        condition = keyData
                        collection = condition['collection']
                        collection_field = condition['field']
                        field_values = kwargs[key]
                        for field_value in field_values:
                            if collection_field == '_id' and not isinstance(field_value,ObjectId):
                                field_value = ObjectId(str(field_value))
                            doc = collection.find_one({collection_field:field_value})
                            if not doc:
                                raise Exception('Dependency Error: No such %s document. %s(%s):%s' %(collection.name, collection_field, key, field_value))

                    # If the given value is a list and each data in it is a dict which contains field data of another collection.
                    elif keyData['type'] == list and keyData.has_key('fields'):
                        dependent_fields = keyData['fields']
                        for field in dependent_fields:
                            field_condition = dependent_fields[field]
                            if isinstance(field_condition, dict):    
                                condition = field_condition
                                collection = condition['collection']
                                collection_field = condition['field']
                                field_value_array = kwargs[key]
                                for field_value_dict in field_value_array:
                                    field_value = field_value_dict[field] 
                                    if collection_field == '_id' and not isinstance(field_value,ObjectId):
                                        field_value = ObjectId(str(field_value))
                                    doc = collection.find_one({collection_field:field_value})
                                    if not doc:
                                        raise Exception('Dependency Error: No such %s document. %s(%s):%s' %(collection.name, collection_field, field, field_value))

                            elif isinstance(field_condition, list):
                                field_value_array = kwargs[key]
                                for field_value_dict in field_value_array:
                                    selected_condition = None
                                    for condition in field_condition:
                                        ifcase = condition['if'] 
                                        if field_value_dict.has_key(ifcase['key']) and field_value_dict[ifcase['key']] == ifcase['value']:
                                            selected_condition = condition
                                            break  
                                    if selected_condition:
                                        condition = selected_condition
                                        collection = condition['collection']
                                        collection_field = condition['field']
                                        field_value = field_value_dict[field]
                                        if collection_field == '_id' and not isinstance(field_value,ObjectId):
                                            field_value = ObjectId(str(field_value))
                                        doc = collection.find_one({collection_field:field_value})
                                        if not doc:
                                            raise Exception('Dependency Error: No such %s document. %s(%s):%s' %(collection.name, collection_field, field, field_value))

    def validateSort(self, sort, sortableFields=[]):
        log.debug("Sort parameter: %s, sortableFields: %s" % (sort, str(sortableFields)))
        sortList = []
        if not sort:
            return sortList

        if ';' in sort:
            sort = sort.split(';')
        else:
            sort = [sort]
        for s in sort:
            if ',' in s:
                fld,dir = s.split(',', 1)
            else:
                fld = s
                dir = 'asc'
            if fld not in sortableFields:
                raise Exception('Unsupported field: %s' % fld)
            if dir not in ['asc', 'desc']:
                raise Exception('Unsupported sort direction: %s' % dir)
            sortList.append((fld, 1 if dir == 'asc' else -1))
        log.debug("Returning sort: %s" % str(sortList))
        return sortList

    def localizeObject(self, obj):
        if obj and type(obj).__name__ == 'dict':
            for key in self.datetime_fields:
                if obj.has_key(key) and obj.get(key):
                    dt = obj[key]
                    if type(dt) == datetime:
                        obj[key] = dt.replace(tzinfo=Local)
        return obj

    def localizeObjects(self, objs):
        for o in objs:
            o = self.localizeObject(o)
        return objs
