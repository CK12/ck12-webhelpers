from bson.objectid import ObjectId
import logging
from datetime import datetime

from dexter.models.validationwrapper import ValidationWrapper
from dexter.models import page as p
from dexter.lib import helpers as h

log = logging.getLogger(__name__)

class EventParameter(ValidationWrapper):
    """Class for EventParameter.
    """

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = ['event_type']
        self.required_field_structure = {'name': 'str or unicode'}

    def get_event_parameters(self, event_type):
        """Get the event parameters for the event_type.
        """
        parameters = []
        event = self.db.EventParameters.find_one({'eventType': event_type})
        if event:
            parameters = event['parameters']
        return parameters

    def get_all_event_parameters(self):
        """Get the event parameters for all the  event_types.
        """
        colls = self.db.collection_names()
        resolved_colls = filter(lambda x:x.startswith('Resolved'), colls)
        event_colls = map(lambda x:x.replace('Resolved_', ''), resolved_colls)
        parameters = self.db.EventParameters.find({'eventType':{'$in':event_colls}})

        results = []
        existing_event_types = set()
        for parameter in parameters:
            event_type = parameter['eventType']
            if event_type in event_colls:
                results.append({'eventType':event_type, 'parameters':parameter['parameters']})
                existing_event_types.add(event_type)
        empty_event_types = set(event_colls) - existing_event_types
        empty_results = [{'eventType':event_type, 'parameters':[]} for event_type in empty_event_types]
        results.extend(empty_results)

        return results

    def add_event_parameters(self, **kwargs):
        """Add the event parameters for the event_type.
        """
        event_type = kwargs['event_type']
        parameters = kwargs['parameters']
        # Lowercase the parameter types
        for param_dict in parameters:
            name = param_dict.keys()[0]
            param_dict[name] = [item.lower() for item in param_dict[name]]

        event = self.db.EventParameters.find_one({'eventType': event_type})
        if event:
            raise Exception("Event Type:%s, already exists." % event_type) 
        self.db.EventParameters.insert({'eventType':event_type, 'parameters':parameters})

    def update_event_parameters(self, **kwargs):
        """Update the event parameters.
        """
        event_type = kwargs['event_type']
        parameters = kwargs['parameters']

        event = self.db.EventParameters.find_one({'eventType': event_type})
        if not event:
            raise Exception("Event Type:%s, does not exists." % event_type)
        # Lowercase the parameter types
        for param_dict in parameters:
            name = param_dict.keys()[0]
            param_dict[name] = [item.lower() for item in param_dict[name]]
        self.db.EventParameters.update({'eventType':event_type},{ '$set': {'parameters':parameters}})
