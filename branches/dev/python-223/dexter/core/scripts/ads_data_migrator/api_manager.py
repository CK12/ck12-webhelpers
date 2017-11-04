import settings
import urllib, urllib2
import jsonlib

client_reg_api = '/register/client'
event_type_reg_api = '/register/event'
event_record_api = '/record/event'
parameter_reg_api = '/register/parameter'

class APIManager(object):
    def __init__(self):
        self.source_host = settings.DEXTER_HOST

    def register_client(self, client_name):
        try:
            endpoint = 'http://%s%s?name=%s'%(self.source_host, client_reg_api, client_name)
            res = urllib2.urlopen(endpoint).read()
            json_res = jsonlib.read(res)
            if json_res.__contains__('response') and json_res['response'].__contains__('message'):
                raise Exception(json_res['response']['message'])
            else:
                return json_res.get('response')
        except Exception as e:
            print e

    def register_parameter(self, params):
        try:
            endpoint = 'http://%s%s'%(self.source_host, parameter_reg_api)
            params = urllib.urlencode(params)
            res = urllib2.urlopen(endpoint, params).read()
            json_res = jsonlib.read(res)
            if json_res.__contains__('response') and json_res['response'].__contains__('message'):
                raise Exception(json_res['response']['message'])
            else:
                return json_res.get('response')
        except Exception as e:
            print e

    def register_event_type(self, client_id, event_type, parameters):
        try:
            endpoint = 'http://%s%s'%(self.source_host, event_type_reg_api)
            params = {}
            params['clientID'] = client_id
            params['eventType'] = event_type
            params['parameters'] = parameters
            params = urllib.urlencode(params)
            res = urllib2.urlopen(endpoint, params).read()
            json_res = jsonlib.read(res)
            if json_res.__contains__('response') and json_res['response'].__contains__('message'):
                raise Exception(json_res['response']['message'])
            else:
                return json_res.get('response')
        except Exception as e:
            print e

    def record_events(self, *args):
        client_id = args[0][0]
        event_type = args[0][1]
        multiple_payload = args[0][2]
        for each_payload in multiple_payload:
            self.record_event(client_id, event_type, each_payload)
        print '\nDone with migrating (%s) events to (%s)'%(len(multiple_payload), event_type)


    def record_event(self, client_id, event_type, payload):
        try:
            endpoint = 'http://%s%s'%(self.source_host, event_record_api)
            params = {}
            params['clientID'] = client_id
            params['eventType'] = event_type
            params['payload'] = payload
            params = urllib.urlencode(params)
            res = urllib2.urlopen(endpoint, params).read()
            return res
        except Exception as e:
            print e
