from bson.objectid import ObjectId
import logging
from datetime import datetime
import hashlib
import re
import pdb

from dexter.models.validationwrapper import ValidationWrapper
from dexter.models import page as p
from dexter.lib import helpers as h

log = logging.getLogger(__name__)

class Client(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = ['name']
        self.required_fields_structure = {'name':'str or unicode'}

    def __get_hash(self,name='',chunk_size=8):
        if not name:
            return None
        m = hashlib.sha224()
        m.update(name)
        hash_msg = m.hexdigest()
        final_hash = 0
        for each in range(0,len(hash_msg)/chunk_size):
            tmp_slice = hash_msg[each:len(hash_msg):len(hash_msg)/chunk_size]
            tmp_slice = int(tmp_slice,16)
            final_hash = str(final_hash + tmp_slice)
            if len(final_hash) > chunk_size:
                final_hash = final_hash[len(final_hash)-chunk_size:len(final_hash)]
            final_hash = int(final_hash)
        return final_hash

    """
        Register a client
    """
    @h.trace
    def register(self, **kwargs):
        self.before_insert(**kwargs)

        existing = self.getUnique(name = kwargs['name'])
        if existing:
            raise Exception('Client with given name already exists: %s' % kwargs['name'])
        unique_hash = self.__get_hash(name=kwargs['name'])
        existing = self.getClientByClientID(clientID = unique_hash)
        new_name = kwargs['name']
        rand_num = 1
        while existing:
            if rand_num >= 100:
                raise Exception('Couldn\'t create a client: %s' % kwargs['name'])
            new_name = "%s%s"%(new_name,rand_num)
            rand_num += 1
            unique_hash = self.__get_hash(name=new_name)
            existing = self.getClientByClientID(clientID = unique_hash)
        kwargs['clientID'] = unique_hash
        kwargs['created'] = datetime.now()
        kwargs['updated'] = datetime.now()
        id = self.db.Clients.insert(kwargs)
        return self.db.Clients.find_one(id)

    """
        Update a Client
    """
    @h.trace
    def update(self, **kwargs):
        self.required_fields = ['name','clientID']
        self.required_fields_structure = {'name':'str or unicode','clientID':'int'}
        self.before_update(**kwargs)
        clientID = kwargs['clientID']
        del kwargs['clientID']
        kwargs['updated'] = datetime.now()
        existing = self.getUnique(name = kwargs['name'])
        if existing and not existing.get('clientID') == clientID:
            raise Exception('Client with given name already exists: %s' % kwargs['name'])
        result = self.db.Clients.update(
                            { 'clientID': clientID },
                            { '$set': kwargs },
                            )
        return result

    """
        Unregister the client
    """
    @h.trace
    def unregister(self, **kwargs):
        self.required_fields = ['clientID']
        self.required_fields_structure = {'clientID':'int'}
        self.before_delete(**kwargs)
        result = self.db.Clients.remove({'clientID': kwargs['clientID']}, safe=True)
        return result

    """
        Get Client
    """
    @h.trace
    def getByID(self, id):
        log.info("Getting client for id: %s" % id)
        client = self.db.Clients.find_one(ObjectId(str(id)))
        self.asDict(client)
        log.info("Client: %s" % client)
        return client

    def getClientByClientID(self, clientID):
        client = self.db.Clients.find_one({'clientID': clientID})
        return client

    def getUnique(self, name):
        client = self.db.Clients.find_one({'name': re.compile(name, re.IGNORECASE)})
        return client

    def asDict(self, client):
        if client:
            return client

    def validate(self, clientID, name=None):
        if name:
            client = self.getUnique(name=name)
        else:
            client = self.getClientByClientID(clientID=clientID)
        client = self.asDict(client)
        if client and client['clientID'] == clientID:
            return True
        else:
            return False

    """
        Get all Clients
    """
    @h.trace
    def getAll(self, pageNum=0, pageSize=0):
        clients = p.Page(self.db.Clients, None, pageNum, pageSize)
        return clients
