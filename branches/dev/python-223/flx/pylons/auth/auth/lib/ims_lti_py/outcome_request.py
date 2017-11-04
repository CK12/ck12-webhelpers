from collections import defaultdict
from lxml import etree, objectify
from pylons import config

import oauth2
import logging

log = logging.getLogger(__name__)

from outcome_response import OutcomeResponse
from utils import InvalidLTIConfigError, InvalidLTIRequestError

REPLACE_REQUEST = 'replaceResult'
DELETE_REQUEST = 'deleteResult'
READ_REQUEST = 'readResult'

accessors = [
    'operation',
    'score',
    'result_data',
    'outcome_response',
    'message_identifier',
    'lis_outcome_service_url',
    'lis_result_sourcedid',
    'consumer_key',
    'consumer_secret',
    'post_request'
]

class OutcomeRequest():
    '''
    Class for consuming & generating LTI Outcome Requests.

    Outcome Request documentation: http://www.imsglobal.org/lti/v1p1pd/ltiIMGv1p1pd.html#_Toc309649691

    This class can be used both by Tool Providers and Tool Consumers, though
    they each use it differently. The TP will use it to POST an OAuth-signed
    request to the TC. A TC will use it to parse such a request from a TP.
    '''
    def __init__(self, opts = defaultdict(lambda: None)):
        # Initialize all our accessors to None
        for accessor in accessors:
            setattr(self, accessor, None)

        # Store specified options in our accessors
        for (key, val) in opts.iteritems():
            setattr(self, key, val)

    @staticmethod
    def from_post_request(post_request):
        '''
        Convenience method for creating a new OutcomeRequest from a request
        object.

        post_request is assumed to be a Django HttpRequest object
        '''
        request = OutcomeRequest()
        request.post_request = post_request
        request.process_xml(post_request.data)
        return request

    def post_replace_result(self, score, result_data=None):
        '''
        POSTs the given score to the Tool Consumer with a replaceResult.

        OPTIONAL:
            result_data must be a dictionary
            Note: ONLY ONE of these values can be in the dict at a time,
            due to the Canvas specification.

            'text' : str text
            'url' : str url
        '''
        self.operation = REPLACE_REQUEST
        self.score = score
        if result_data:
	    log.info('post_replace_result: result_data[%s]' % result_data)
            self.result_data = result_data
        return self.post_outcome_request()

    def post_delete_result(self):
        '''
        POSTs a deleteRequest to the Tool Consumer.
        '''
        self.operation = DELETE_REQUEST
        return self.post_outcome_request()

    def post_read_result(self):
        '''
        POSTS a readResult to the Tool Consumer.
        '''
        self.operation = READ_REQUEST
        return self.post_outcome_request()

    def is_replace_request(self):
        '''
        Check whether this request is a replaceResult request.
        '''
        return self.operation == REPLACE_REQUEST

    def is_delete_request(self):
        '''
        Check whether this request is a deleteResult request.
        '''
        return self.operation == DELETE_REQUEST

    def is_read_request(self):
        '''
        Check whether this request is a readResult request.
        '''
        return self.operation == READ_REQUEST

    def was_outcome_post_successful(self):
        return self.outcome_response and\
                self.outcome_response.is_success()

    def post_outcome_request(self):
        '''
        POST an OAuth signed request to the Tool Consumer.
        '''
        if not self.has_required_attributes():
            raise InvalidLTIConfigError('OutcomeRequest does not have all required attributes')

        consumer = oauth2.Consumer(key = self.consumer_key,
                secret =  self.consumer_secret)

        client = oauth2.Client(consumer)
        # Bug #46089 ssl3 certificate verification error
        client.ca_certs = config.get('lti_outcome_request_cert')

        response = None
        content = None
        try:
            response, content = client.request(
                    self.lis_outcome_service_url,
                    'POST',
                    body = self.generate_request_xml(),
                    headers = { 'Content-Type': 'application/xml' })
        except Exception, e:
            log.debug("Hostname mismatch exception: %s"%e)
            log.debug("Exception name %s" %type(e).__name__)
            # This is a patch for bug #53668 until we upgrade python to 2.7.9 or greater
            # See this url https://github.com/onjin/ejpiaj/issues/1 for the issue
            # within python
            if type(e).__name__ == "CertificateHostnameMismatch" and self.lis_outcome_service_url.find("schoology.com") !=-1:
                import requests
                from requests_oauthlib import OAuth1
                oauth = OAuth1(self.consumer_key, client_secret=self.consumer_secret)
                r = requests.post(
                        url=self.lis_outcome_service_url,
                        auth=oauth,
                        data=self.generate_request_xml(),
                        headers = { 'Content-Type': 'application/xml' },
                        verify=False)
                log.debug("Request returned [%s]" %r.raw)
                if r.ok:
                    class objectview(object):
                       def __init__(self, d):
                           self.__dict__ = d
                    _headers = objectview(r.headers.__dict__)
                    _headers.status = r.status_code
                    response = _headers
                    content = r.text
                else:
                    raise e
            else:
                raise e

        self.outcome_response = OutcomeResponse.from_post_response(response,
                content)
        log.debug("post_outcome_request - Response: [%s]  content: [%s]" %( response, content))
        log.debug("post_outcome_request - Request xml: [%s]" %( self.generate_request_xml()))
        return self.outcome_response

    def process_xml(self, xml):
        '''
        Parse Outcome Request data from XML.
        '''
        root = objectify.fromstring(xml)
        self.message_identifier = str(root.imsx_POXHeader.\
                imsx_POXRequestHeaderInfo.imsx_messageIdentifier)
        try:
            result = root.imsx_POXBody.replaceResultRequest
            self.operation = REPLACE_REQUEST
            # Get result sourced id from resultRecord
            self.lis_result_sourcedid = result.resultRecord.\
                    sourcedGUID.sourcedId
            self.score = str(result.resultRecord.result.\
                    resultScore.textString)
        except:
            pass

        try:
            result = root.imsx_POXBody.deleteResultRequest
            self.operation = DELETE_REQUEST
            # Get result sourced id from resultRecord
            self.lis_result_sourcedid = result.resultRecord.\
                    sourcedGUID.sourcedId
        except:
            pass

        try:
            result = root.imsx_POXBody.readResultRequest
            self.operation = READ_REQUEST
            # Get result sourced id from resultRecord
            self.lis_result_sourcedid = result.resultRecord.\
                    sourcedGUID.sourcedId
        except:
            pass

    def has_required_attributes(self):
        return self.consumer_key != None\
                and self.consumer_secret != None\
                and self.lis_outcome_service_url != None\
                and self.lis_result_sourcedid != None\
                and self.operation != None

    def generate_request_xml(self):
        root = etree.Element('imsx_POXEnvelopeRequest', xmlns =
                'http://www.imsglobal.org/lis/oms1p0/pox')

        header = etree.SubElement(root, 'imsx_POXHeader')
        header_info = etree.SubElement(header, 'imsx_POXRequestHeaderInfo')
        version = etree.SubElement(header_info, 'imsx_version')
        version.text = 'V1.0'
        message_identifier = etree.SubElement(header_info,
                'imsx_messageIdentifier')
        message_identifier.text = self.message_identifier
        body = etree.SubElement(root, 'imsx_POXBody')
        request = etree.SubElement(body, '%s%s' %(self.operation,
            'Request'))
        record = etree.SubElement(request, 'resultRecord')

        guid = etree.SubElement(record, 'sourcedGUID')

        sourcedid = etree.SubElement(guid, 'sourcedId')
        sourcedid.text = self.lis_result_sourcedid

        if self.score:
            result = etree.SubElement(record, 'result')
            result_score = etree.SubElement(result, 'resultScore')
            language = etree.SubElement(result_score, 'language')
            language.text = 'en'
            text_string = etree.SubElement(result_score, 'textString')
            text_string.text = self.score.__str__()

            if self.result_data:
                resultData = etree.SubElement(result, 'resultData')
                if 'text' in self.result_data:
                    resultDataText = etree.SubElement(resultData, 'text')
                    resultDataText.text = self.result_data['text']
                elif 'url' in self.result_data:
                    resultDataURL = etree.SubElement(resultData, 'url')
                    resultDataURL.text = self.result_data['url']

	xml = etree.tostring(root, xml_declaration = True, encoding = 'utf-8')
	log.info('post_outcome_request: xml[%s]' % xml)
	return xml
