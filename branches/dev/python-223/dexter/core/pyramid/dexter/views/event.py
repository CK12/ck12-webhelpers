from pyramid.view import view_config
from pyramid.response import Response
from pyramid.renderers import render_to_response
from dexter.lib import helpers as h

from dexter.views.decorators import jsonify
from dexter.models import event
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
#from dexter.lib.remoteapi import RemoteAPI as remotecall
import simplejson
import logging
import ast
from datetime import datetime
from zipfile import ZipFile
log = logging.getLogger(__name__)

class EventView(BaseView):
    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.working_dir = '/tmp/dexter'
        self.config = h.load_config()
        self.timezone = "America/Los_Angeles"
        self.timeformat = "%Y-%m-%d %H:%M:%S %f"

    """
        Event related APIs

    """

    @view_config(route_name='record_event')
    @jsonify
    @h.trace
    def record_event(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            params = {}
            reqParams = request.params
            for key in reqParams:
                params[key] = reqParams[key]

            h.trimParameters(params)
            kwargs = params

            if kwargs.has_key('payload'):
                # Get the decrypted payload
                kwargs['payload'] = self._getDecryptedPayload(kwargs['payload'])
                kwargs['payload']['user_agent'] = request.user_agent
                if request.client_addr:
                    kwargs['payload']['client_ip'] = request.client_addr

            #Record the event in Redis Queue 
            status = event.Event(request.db).record(**kwargs)
            #result['response']['status'] = status
            content = 'GIF89a\x01\x00\x01\x00\x80\xff\x00\xff\xff\xff\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
            response = Response(body=content, content_type='image/gif')
            return response
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_RECORD_EVENT
            log.error('record_event: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='get_event')
    @jsonify
    @h.trace
    def get_event(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            params = {}
            reqParams = request.params
            for key in reqParams:
                params[key] = reqParams[key]
            h.trimParameters(params)
            kwargs = params
            event_record = event.Event(request.db).getEvent(**kwargs)
            result['response']['event'] = event_record
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_RECORD_EVENT
            log.error('get_event: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='get_resolved_event')
    @jsonify
    @h.trace
    def get_resolved_event(self):
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            params = {}
            reqParams = request.params
            for key in reqParams:
                params[key] = reqParams[key]
            h.trimParameters(params)
            if not (params.has_key('eventType') and params['eventType']):
                raise Exception('EventType is mandetory.')
            if not (params.has_key('eventID') and params['eventID']):
                raise Exception('eventID is mandetory.')
            kwargs = params
            resolved_event = event.Event(request.db).getResolvedEvent(**kwargs)
            result['response']['resolved_event'] = resolved_event
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_RECORD_EVENT
            log.error('get_event: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='record_event_bulk')
    @jsonify
    @h.trace
    def record_event_bulk(self):
        """Record the bulk events.
        """
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            params = {}
            reqParams = request.params
            for key in reqParams:
                params[key] = reqParams[key]

            h.trimParameters(params)
            kwargs = params
            log.info('kwargs in record_event views: %s' % kwargs)
            clientID = kwargs['clientID']
            events = kwargs['events']
            # Record the event from list of events.
            for eventParams in events:
                eventParams['clientID'] = clientID
                log.info('Processing Event: %s' % eventParams)                
                if eventParams.has_key('payload'):
                    payload = eventParams['payload']
                    if isinstance(payload, basestring):
                        eventParams['payload'] = ast.literal_eval(payload)
                    eventParams['payload']['user_agent'] = request.user_agent
                    if request.client_addr:
                        eventParams['payload']['client_ip'] = request.client_addr                
                    payload = eventParams['payload']
                    if payload.has_key('timestamp'):
                        tstamp = payload['timestamp']
                        log.info("Converting timestamp: [%s] to Local(PST)" % (tstamp))
                        iso_date = h.convert_to_local_timezone_from_iso(tstamp, format=self.timeformat)
                        log.info("Timestamp in out internal format: [%s]" % iso_date)
                        eventParams['payload']['timestamp'] = iso_date
                #Record the event in Redis Queue 
                status = event.Event(request.db).record(**eventParams)
            
            #result['response']['status'] = status
            content = 'GIF89a\x01\x00\x01\x00\x80\xff\x00\xff\xff\xff\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
            response = Response(body=content, content_type='image/gif')
            return response
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_RECORD_EVENT
            log.error('record_event: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='record_event_bulk_zip')
    @jsonify
    @h.trace
    def record_event_bulk_zip(self):
        """Record the bulk events from zip file.
        """
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)
            kwargs = {}
            params = {}
            reqParams = request.params
            for key in reqParams:
                params[key] = reqParams[key]

            h.trimParameters(params)
            kwargs = params
            clientID = kwargs['clientID']
            log.info('kwargs in record_event views: %s' % kwargs)
            # Get the zipfile from request and extract the events from json file containing inside zipfile.
            zipFilePath = h.saveUploadedFile(request, 'events')
            log.info("Got zip file:%s" % zipFilePath)
            # Verify if the file is already processed.
            currentTimestamp = h.toTimestamp(datetime.now(), format=self.timeformat)
            fileMD5 = h.genMD5Hash(zipFilePath)
            if request.db.BulkHash.find_one({'md5':fileMD5, 'clientID':clientID}):
                raise Exception("The zipfile already processed.")                

            # Get the events from zip file and record.
            events = self._getEventsFromZipFile(zipFilePath)
            log.info("Events from zipfile :%s" % events)
            for eventParams in events:
                eventParams['clientID'] = clientID
                log.info('Processing Event: %s' % eventParams)                
                if eventParams.has_key('payload'):
                    payload = eventParams['payload']
                    if isinstance(payload, basestring):
                        eventParams['payload'] = ast.literal_eval(payload)
                    eventParams['payload']['user_agent'] = request.user_agent
                    if request.client_addr:
                        eventParams['payload']['client_ip'] = request.client_addr                
                    payload = eventParams['payload']
                    if payload.has_key('timestamp'):
                        tstamp = payload['timestamp']
                        log.info("Converting timestamp:%s to Local(PST)" % (tstamp))
                        iso_date = h.convert_to_local_timezone_from_iso(tstamp, format=self.timeformat)
                        log.info("Got iso_date:%s" % iso_date)
                        eventParams['payload']['timestamp'] = iso_date

                #Record the event in Redis Queue 
                status = event.Event(request.db).record(**eventParams)
            request.db.BulkHash.insert({'clientID':clientID, 'md5':fileMD5, 'timestamp':currentTimestamp})
            content = 'GIF89a\x01\x00\x01\x00\x80\xff\x00\xff\xff\xff\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
            response = Response(body=content, content_type='image/gif')
            return response
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_RECORD_EVENT
            log.error('record_event: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    def _getEventsFromZipFile(self, zipFilePath):
        """Get the events from zip file.
        """
        z = ZipFile(zipFilePath, 'r')
        for file in z.namelist():
            fp = z.open(file, 'r')
            data = fp.read()
            fp.close()
            break
        jsonData = simplejson.loads(data)
        return jsonData

    @view_config(route_name='get_bulk_zip_test_form')
    @jsonify
    @h.trace
    def get_bulk_zip_test_form(self):
        return render_to_response('dexter/record_bulk_zip_test.jinja2', {})

    def _getDecryptedPayload(self, payload):
        """Decrypt the encrypted values from payload.
        """
        for field in payload.get('encrypted', []):
            if payload.has_key(field):
                encrypted_value = payload[field]
                decrypted_value = h.decrypt(encrypted_value, self.config)
                payload[field] = decrypted_value

        return payload
