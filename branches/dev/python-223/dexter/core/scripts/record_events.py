import urllib
import urllib2
import json

api_endpoint = 'http://chaplin.ck12.org/dexter/record/event'

params = {"eventType" : "FBS_HIT",
          "payload" : [
              {     "artifactID" : "12345"},
              {     "memberID" : "100"}    ],
          "clientID" : '24166850' }

req = urllib2.urlopen(api_endpoint,urllib.urlencode(params))
print req.read()
