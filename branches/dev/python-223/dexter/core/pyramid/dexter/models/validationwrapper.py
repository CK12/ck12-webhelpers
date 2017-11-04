"""

You can use this wrapper for mongoDB data validation while before insert or update.

Currently this wrapper has following methods

* before_insert:
    It will validate the required fields, field data, and field dependencies

* before_update:
    It will validate the field data, and field dependencies

* validate_fields:
    Its an empty interface. If you want to validate the fields or do anything before insert, You can override it in your subclass

* validate_fields_structure:
    Its job is ensure if the received data follows the same structure as expected.  Expected format should be stored in required_fields_structure.
    We can also specify multiple types in the format of 'type1 or type2 or NoneType'.  To allow None, it must have the type 'NoneType'.

    Syntax sample:
        self.required_fields_structure = {
                                           'field1': type,
                                           'fields2': 'type1 or type2 or type3 or NoneType',
                                           'field3': [{
                                                      'subfield1' : type
                                                      }]
                                        }

    Example:
        self.required_fields_structure = {
                            'clientID':'long or int', 
                            'eventType':'str or unicode', 
                            'parameters':[
                                {'name':'str or unicode', 
                                 'api':'str or unicode or NoneType', 
                                 'mandatory': bool, 
                                 'type': 'str or unicode'
                                }
                            ]}
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

from dexter.models import model
from bson.objectid import ObjectId
from dexter.lib import helpers as h

import re
import logging

log = logging.getLogger(__name__)

class ValidationWrapper(object):

    dc = False
    required_fields = []
    field_dependencies = {}
    required_fields_structure = {}
    error_msg = ''
    breadcrumb = ''

    def before_insert(self, **kwargs):
        #model.checkAttributes(self.required_fields, **kwargs)
        self.validate_fields(**kwargs)
        self.validate_fields_structure(**kwargs)
        self.validate_dependencies(**kwargs)

    def before_update(self, **kwargs):
        self.validate_fields(**kwargs)
        self.validate_fields_structure(**kwargs)
        self.validate_dependencies(**kwargs)

    def before_delete(self, **kwargs):
        self.validate_fields(**kwargs)
        self.validate_fields_structure(**kwargs)
        self.validate_dependencies(**kwargs)

    def compare_list(self,list1,list2):
        for each in list2:
            if type(each) == list:
                self.breadcrumb = self.breadcrumb + " -> " + str(list2.index(each))
                if not self.compare_list(list1[0],each):
                    return False
                else:
                    self.remove_last_crumb()
            elif type(each) == dict:
                self.breadcrumb = self.breadcrumb + " -> " + str(list2.index(each))

                if not self.compare_dict(list1[0],each):
                    return False
                else:
                    self.remove_last_crumb()
            elif not self.compare_type(list1[0],each) :
                #if not self.is_type_compatible(type(each),type(list1[0])):
                    self.breadcrumb = self.breadcrumb + " -> " + each
                    req_type = type(list1[0]) if type(list1[0]) in [list,dict,tuple] else list1[0]
                    self.error_msg = "Type of the key:%s in the payload is invalid, Expected:(%s), received:(%s), traceback:%s"%(each, req_type, type(each),self.breadcrumb)
                    return False
        return True

    def compare_type(self, element_type, element):
        is_equal = False
        if type(element_type) == type:
            is_equal = type(element_type) == element
            try:
                if not is_equal and element_type in [int, float, long]:
                    is_convertible = element_type(element)
                    is_equal = True
            except Exception as e:
                is_equal = False
        elif type(element_type) in [str, unicode]:
            try:
                types = re.sub('\s*', '', element_type).split('or')
                is_equal = types.__contains__(re.sub('.*?\'(.*?)\'.*','\\1',str(type(element))))
                if not is_equal:
                    is_convertible = None
                    for each_type in types:
                        try:
                            if each_type == 'int':
                                is_convertible = int(element)
                            elif each_type == 'float':
                                is_convertible = float(element)
                            elif each_type == 'long':
                                is_convertible = long(element)
                        except Exception as e:
                            pass
                    is_equal = is_convertible != None
            except Exception as e:
                is_equal = False
        else:
            is_equal = type(element_type) == type(element)
        return is_equal

    def remove_last_crumb(self):
        k = self.breadcrumb.split('->')
        tmp = k.pop()
        self.breadcrumb = '->'.join(k)

    def compare_dict(self,dict1,dict2):
        dict1_keys = dict1.keys()
        dict2_keys = dict2.keys()
        if not dict1_keys:
            return True
        for each_val in dict1_keys:
            if not dict2_keys.__contains__(each_val):
                self.error_msg = "key:%s is missing in the payload, traceback:%s"%(each_val,self.breadcrumb)
                return False
            if type(dict2.get(each_val)) == type(None) and dict1.get(each_val).__contains__('None'):
                continue
            if dict1.get(each_val) == bool or dict1.get(each_val).__contains__('bool'):
                dict2[each_val] = h.toBool(dict2[each_val])
                continue
            if not self.compare_type(dict1.get(each_val), dict2.get(each_val)):
                #if not self.is_type_compatible(type(dict1.get(each_val)),type(dict2.get(each_val))):
                    self.breadcrumb = self.breadcrumb + " -> " + each_val
                    req_type = type(dict1.get(each_val)) if type(dict1.get(each_val)) in [list,dict,tuple] else dict1.get(each_val)
                    self.error_msg = "Type of the key:%s in the payload is invalid, Expected:(%s), received:(%s), traceback:%s"%(each_val, req_type,type(dict2.get(each_val)),self.breadcrumb)
                    return False
            elif type(dict1.get(each_val)) == dict:
                self.breadcrumb = self.breadcrumb + " -> " + each_val
                if not self.compare_dict(dict1.get(each_val), dict2.get(each_val)):
                    return False
                else:
                    self.remove_last_crumb()
            elif type(dict1.get(each_val)) == list:
                self.breadcrumb = self.breadcrumb + " -> " + each_val
                if not self.compare_list(dict1.get(each_val), dict2.get(each_val)):
                    return False
                else:
                    self.remove_last_crumb()
        return True

    def validate_fields_structure(self, **kwargs):
        self.error_msg = ''
        self.breadcrumb = ''
        if self.required_fields_structure and not self.compare_dict(self.required_fields_structure, kwargs):
            raise Exception(self.error_msg)

    def validate_fields(self, **kwargs):
        missing_fields = []
        for k in self.required_fields:
            if k not in kwargs and k not in missing_fields:
                missing_fields.append(k)
        if missing_fields:
            raise Exception('Missing required fields: %s'%(missing_fields))

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
