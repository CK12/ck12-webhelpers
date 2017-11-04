"""
This script will generate the Refresh Token, steps as below:

1) Set the respective config values, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
2) Run the script (Calls the generate_refresh_token method from main).
3) Copy the URL from console and run in the browser, URL will redirect to provided REDIRECT_URI
4) Copy the code parameter seen in browser REDIRECT_URI
5) The refresh token will be printed on the screen.


"""
import logging
import json
import requests
import httplib2
from apiclient.discovery import build
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.client import AccessTokenCredentials

CLIENT_ID = '344819841245-vd9g6plhpub027rvjoio9mkq0audlqsc.apps.googleusercontent.com'
CLIENT_SECRET = '9yUHwRzv_KSx0BZuVuY0lFBP'
OAUTH_SCOPE = 'https://www.googleapis.com/auth/drive'
REDIRECT_URI = 'http://gamma.ck12.org' # This URI should be added in Google Console Project's
REFRESH_TOKEN_URL = 'https://www.googleapis.com/oauth2/v3/token'
# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()  # Prints on console
#hdlr = logging.FileHandler('/tmp/add_artifact_creatorID.log') # Use for smaller logs
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

def generate_refresh_token():
    """Generates Refresh Token
    """
    flow = OAuth2WebServerFlow(CLIENT_ID, CLIENT_SECRET, OAUTH_SCOPE, REDIRECT_URI, approval_prompt='force')
    authorize_url = flow.step1_get_authorize_url()
    print 'Go to the following link in your browser: ' + authorize_url
    code = raw_input('Enter verification code: ').strip()

    credentials = flow.step2_exchange(code) 
    print "Refresh Token:%s" % credentials.refresh_token
    return credentials.refresh_token

def _get_oauth_credentials(refresh_token):
    
    data = {'client_id':CLIENT_ID, 'client_secret':CLIENT_SECRET, 
            'refresh_token':refresh_token, 'grant_type':'refresh_token'}
    response = requests.post(REFRESH_TOKEN_URL, data)
    response_json = json.loads(response.text)
    if not response_json.has_key('access_token'):
        raise Exception("Unable to get Access Token Error:%s" % str(response_json))
    access_token = response_json['access_token']
    credentials = AccessTokenCredentials(access_token, 'ck12-user-agent/1.0')
    
    if credentials.invalid or credentials.access_token_expired:
        log.info("Google Auth Credentials/Token expired. Access Token: %s" % access_token)
        credentials.refresh(http = httplib2.Http())
        log.info("Google Auth Token after refresh. Access Token: %s" % credentials.access_token)
    return credentials

def list_files(refresh_token):
    """
    """
    # Get credentials from refresh token
    credentials = _get_oauth_credentials(refresh_token)
    http = httplib2.Http()
    http = credentials.authorize(http)
    service = build('drive', 'v2', http=http)    
    query = "title = 'NG Simulations'"
    #param = {"q":query, 'fields'}
    #param = {}
    files = service.files().list(q=query, fields='items(id,title)').execute()
    print "Total %s Google Documents exists." % len(files['items'])

def main():
    # Generate refresh token
    refresh_token = generate_refresh_token()
    #refresh_token = '1/ZSL_xFOI8OhJtWBNiZmWAKV8czgZipQ_n19Eglp8jRZIgOrJDtdun6zK6XiATCKT'
    # Test by calling list files
    list_files(refresh_token)

if __name__ == "__main__":
    main()

    # Account akshay.valsa@ck12.org    
    #CLIENT_ID = '1039000837333-8mjfgf4u28o0hbeh9ahl9lh1v5f6d032.apps.googleusercontent.com'
    #CLIENT_SECRET = 'vD2CitXJqmD7iJd5NGuh5cLg'
    #OAUTH_SCOPE = 'https://www.googleapis.com/auth/drive'
    #REDIRECT_URI = 'http://akshayv.ck12.org:8000/' # This URI should be added in Google Console Project's
    #REFRESH_TOKEN_URL = 'https://www.googleapis.com/oauth2/v3/token'
    # Refresh Token : 1/qfQ3nXPiaKIUFk-DimmH_1U5CaId2BIPgAsKgdVxH7Q

    # Account gdt@ck12.org    
    #CLIENT_ID = '344819841245-vd9g6plhpub027rvjoio9mkq0audlqsc.apps.googleusercontent.com'
    #CLIENT_SECRET = '9yUHwRzv_KSx0BZuVuY0lFBP'
    #OAUTH_SCOPE = 'https://www.googleapis.com/auth/drive'
    #REDIRECT_URI = 'http://gamma.ck12.org' # This URI should be added in Google Console Project's
    #REFRESH_TOKEN_URL = 'https://www.googleapis.com/oauth2/v3/token'
    # Refresh Token : 1/ZSL_xFOI8OhJtWBNiZmWAKV8czgZipQ_n19Eglp8jRZIgOrJDtdun6zK6XiATCKT
