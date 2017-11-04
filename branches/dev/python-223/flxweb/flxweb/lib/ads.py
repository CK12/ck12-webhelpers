import logging
import urllib2, urllib
from urlparse import urlparse
from pylons import config

log = logging.getLogger()

def ads_log_response(event_name, parameters):
	"""
	"""
	try:

		if not (event_name and parameters):
			raise Exception("EventName/Parameters not provided.")

		ads_api_server = config.get('ads_api_server', '').strip()
		ads_logging_api = config.get('ads_logging_api', '').strip()
		client_id = config.get('fbs_client_id', '').strip()
		#client_id = '24839961'
		if not (ads_api_server and ads_logging_api and client_id):
			raise Exception("Dexter API server not configured.")		
		url_obj = urlparse(ads_api_server)
		api = '%s://%s/%s' % (url_obj.scheme, url_obj.netloc, ads_logging_api)
		# api = 'http://chaplin.ck12.org/dexter/record/event'
		params = dict()
		params['eventType'] = event_name
		params['clientID'] = client_id
		params['payload'] = parameters
		response = urllib2.urlopen(api, urllib.urlencode(params))
	except Exception as e:
		log.info("Exception in ads_log_response, Error:%s" % str(e))		

#ads_log_response('API_RESPONSE', {'response_time':35})
