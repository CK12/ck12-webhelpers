from flx.lib import helpers as h
from flx.model import exceptions as ex
from flx.model.mongo.oauth2accesstoken import Oauth2AcessToken
from pylons import config
import datetime
import logging
from pylons.i18n.translation import _
log = logging.getLogger(__name__)

session_cookie_domain = config.get("beaker.session.cookie_domain")
########################################################################

def getAccessTokenFromMongoDB(**kwargs):
    try:
	memberID = kwargs.get('memberID', None)
	access_token = None
	if memberID:
	    access_token = Oauth2AcessToken().getAccessTokenByMemberID(memberID)
            log.debug('getAccessTokenFromMongoDB: getAccessTokenByMemberID returned [%s]'%(access_token))
	    if not access_token or "refreshToken" not in access_token:
		log.error('getAccessTokenFromMongoDB: Could not find asscess token [%s] for member: [%s]'%(access_token, memberID))
		return None
	    # Check to see if the token is expired
	    import pytz
	    import dateutil.parser
	    tokenExpired = dateutil.parser.parse(access_token['expires']) < pytz.utc.localize(datetime.datetime.utcnow())
	    # Token is expired and we need to refresh it
	    if tokenExpired:
		new_token = h.refreshAccessToken( 'https://api.edmodo.com/oauth/token',
						  config.get('edmodo_client_id'),
						  config.get('edmodo_client_secret'),
						  config.get('edmodo_redirect_uri'),
						  access_token['refreshToken'],
						  grant_type="refresh_token")
		if not new_token or "accessToken" not in new_token:
		    log.error("getAccessTokenFromMongoDB: Could not refresh expired access token: [%s]"%new_token)
		else:
		    access_token = new_token
	    else:
                log.debug('getAccessTokenFromMongoDB: returning [%s]'%(access_token))
		return access_token['accessToken']
    except Exception, e:
        log.error("getAccessTokenFromMongoDB: Exception [%s]"%str(e), exc_info=e)
	raise Exception(e)
