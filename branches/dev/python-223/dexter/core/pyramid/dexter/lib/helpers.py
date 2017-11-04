from decorator import decorator as python_decorator
from tempfile import NamedTemporaryFile
import shutil, os, stat
import pytz
import hashlib
import logging
import Cookie
import random
from bson.objectid import ObjectId
from datetime import datetime, timedelta

from dexter.lib.cryptor import Cryptor
import binascii

from urllib import unquote
from dexter.lib.remoteapi import RemoteAPI as remotecall
from dexter.models.auth.user import UserManager as um
try:
    from webob.multidict import UnicodeMultiDict as MultiDict
except:
    from webob.multidict import MultiDict
import json
import re
import ast
from decimal import Decimal

log = logging.getLogger(__name__)

# Global values
question_levels = ["easy","normal","hard"]
testTypeExtenstions = {'X':'practice', 'Q':'quiz', 'TST':'test'}
default_question_level = "normal"
grades = [0,1,2,3,4,5,6,7,8,9,10,11,12]
renderers = ['json','html']
CREATE_RESOURCE_URL = 'create/resource'
CONCEPT_NODES_URL = 'taxonomy/get/info/descendants/concepts/'

def createTmpFile(fileName, content, ext, delete=True):
    file = NamedTemporaryFile(prefix=fileName, suffix=ext, delete=delete)
    content = content.encode('utf-8')
    file.write(content)
    return file.name

def save(payload, path, file_name):
    source = open(path +"/"+ file_name, 'wb+')
    source.write(payload.encode('utf-8'))
    source.close();
    return path+'/'+file_name

def mkdirs(path):
    if not os.path.exists(path):
        os.makedirs(path)
        return path
    else:
        return path

def toBool(string):
  if isinstance(string, bool):
      return string
  if isinstance(string,str) or isinstance(string,unicode):
      return string.lower() == 'true'
  return False

def fixDecimalValues(dict_obj):
    if type(dict_obj) != dict:
        return dict_obj
    for each_key,each_val in dict_obj.items():
        if type(each_val) == Decimal:
            dict_obj[each_key] = str(each_val)
    return dict_obj

def toInt(string):
  if isinstance(string, int):
      return string
  try:
      return int(string.strip())
  except:
      return 0

def isNumber(string):
    isNum = True
    try:
        int(float(string.strip()))
    except:
        isNum = False
    return isNum

def isBool(string):
    isBool = True
    try:
        bool(string)
    except:
        isBool = False
    return isBool

def trimParameters(params):
    for key in params.keys():
        try:
            try:
                params[key] = re.sub('(\d+?)L(\s*[,|}])','\\1\\2',params[key])
            except Exception as e:
                pass
            try:
                params[key] = re.sub(':\s*?None(\s*[,|}])',': null\\1',params[key])
            except Exception as e:
                pass
            try:
                params[key] = params[key].replace("'",'"')
                if type(json.loads(params[key])) != int:
                    params[key] = json.loads(params[key])
            except Exception as e:
                params[key] = params[key].replace('"',"'")
                if type(json.loads(params[key])) != int:
                    params[key] = json.loads(params[key])
        except Exception:
            pass
        if isinstance(params[key],str) or isinstance(params[key],unicode):
            params[key] = params[key].strip()

def toObjectId(data):
    if isinstance(data,list):
        objectIDs = []
        for id in data:
            objectIDs.append(ObjectId(str(id)))
        return objectIDs
    else:
        return ObjectId(str(data))

def isValidObjectId(string):
    try:
       ObjectId(string)
       return True
    except:
       return False

def get_policy_value(policies,policyName):
    policy = filter(lambda x: x['name']==policyName , policies)
    if policy:
        value = policy[0]['value']
        return value

def stringToDataType(string, toAny=['int','bool','str','dict','list', 'float']):
    if string in toAny:
       return eval(string)
    else:
       raise Exception('%s is not an allowed native data type' % string)

def toDatetime(timestamp, format="%Y-%m-%d %H:%M"):
    dt = None
    if isinstance(timestamp, datetime):
        dt = timestamp
    elif isinstance(timestamp, str) or isinstance(timestamp, unicode):
        try:
            dt = datetime.strptime(timestamp, format)
        except Exception:
            raise Exception('Unable to convert the timestamp to datetime. Valid format is %s' % format)
    else:
        raise Exception(u'Timestamp must be a string or datetime')
    return dt

def toTimestamp(dt, format="%Y-%m-%d %H:%M"):
    if isinstance(dt, datetime):
        timestamp = dt.strftime(format)
        return timestamp
    else:
        raise Exception(u'Given object is not a datetime object')

def convert_to_timezone(dt, src_tz, dst_tz):
    return pytz.timezone(src_tz).localize(dt).astimezone(pytz.timezone(dst_tz))

def convert_to_local_timezone_from_iso(iso_str, format="%Y-%m-%d %H:%M"):
    from dateutil.parser import parse
    from dateutil.tz import tzlocal
    #iso_str = "2014-05-30T14:29:26.711033+05:30"
    src_dt = parse(iso_str)
    dst_dt = src_dt.astimezone(tzlocal())
    dt_str = dst_dt.strftime(format)
    return dt_str

def convert_to_utc_from_timestamp(dt):
    pst = pytz.timezone("America/Los_Angeles")
    utc_offset = pst.utcoffset(dt, is_dst=True).total_seconds()
    utc_dt = dt + timedelta(seconds=utc_offset)
    return utc_dt 

def saveUploadedFile(request, fileParam, dir=None, allowedExtenstions=None):
    uploadedFile = request.POST[fileParam]
    log.info((u'File %(uploadedFile.filename)s [%(len(uploadedFile.value))d bytes]') % {"uploadedFile.filename":uploadedFile.filename, "len(uploadedFile.value)":len(uploadedFile.value)})
    if allowedExtenstions:
        fn = uploadedFile.filename.lower()
        matched = False
        for ext in allowedExtenstions:
            if fn.endswith(ext):
                matched = True
                break
        if not matched:
            raise Exception((u'Invalid file name extension. Allowed extensions are: %(allowedExtenstions)s') % {"allowedExtenstions":','.join(allowedExtenstions)})
    try:
        ## save the file to temp location
        tfile = NamedTemporaryFile(suffix=os.path.basename(uploadedFile.filename), delete=False, dir=dir)
        shutil.copyfileobj(uploadedFile.file, tfile)
        uploadedFile.file.close()
        tfile.close()
        os.chmod(tfile.name, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP | stat.S_IROTH | stat.S_IWOTH)
        return tfile.name
    except Exception, e:
        log.error((u'Error saving uploaded file to disk: Exception[%(str(e))s]') % {"str(e)":str(e)})
        raise e

def safe_encode(s):
    if s and type(s).__name__ == 'unicode':
        return s.encode('utf-8')
    return s

def safe_decode(s):
    if s and type(s).__name__ == 'str':
        return s.decode('utf-8')
    return s

def getConceptNodeEIDFromEID(encodedID):
    if encodedID:
        parts = encodedID.split('.')
        if len(parts) == 6:
            encodedID = '.'.join(parts[:-2])
        elif len(parts) == 5:
            if parts[-1].isalpha():
                encodedID = '.'.join(parts[:-1])
            else:
                encodedID = '.'.join(parts[:-2])
        elif len(parts) == 4:
            if parts[-1].isalpha():
                encodedID = '.'.join(parts[:-1])
    return encodedID

def getElapsedSeconds(d1, d2):
    td = d2 - d1
    if hasattr(td, 'total_seconds'):
        return td.total_seconds()
    return (td.microseconds + (td.seconds + td.days * 24 * 3600) * 10**6) / 10**6

def title2Handle(title):
    if title:
        t = title
        while True:
            title = unquote(t)
            if title == t:
                break
            t = title
        ## Replace more than one consecutive periods to a single period.
        title = re.sub(r'\.(\.+)', '.', title)
        return title.replace(' ', '-').replace('/', '').replace('?', '')
    return title

@python_decorator
def trace(func, *args, **kwargs):
    name = func.__name__
    start = datetime.now()
    log.debug('>>> Entering %s' % name)
    log.debug('>>>          %s' % str(args))
    if kwargs:
        log.debug('>>>          %s' % str(kwargs))
    try:
        return func(*args, **kwargs)
    finally:
        end = datetime.now()
        time = end - start
        log.debug('<<< Exiting  %s, took %s' % (name, time))

def load_config(test_mode=False):
    """
        Loads some parts of pyramid configuration for modules outside pyramid
    """
    import os
    ## Get the production.ini file path
    mydir = os.path.dirname(os.path.abspath(__file__))
    for i in range(1, 3):
        mydir = os.path.dirname(mydir)
    CONFIG_FILE = os.path.join(mydir, "production.ini")

    import ConfigParser

    cfg = ConfigParser.ConfigParser()
    DEV_CONFIG_FILE = CONFIG_FILE.replace('production.ini', 'development.ini')
    if os.path.exists(CONFIG_FILE):
        cfg.read(CONFIG_FILE)
    elif os.path.exists(DEV_CONFIG_FILE):
        cfg.read(DEV_CONFIG_FILE)
    else:
        raise Exception("Cannot find %s or %s"  % (CONFIG_FILE, DEV_CONFIG_FILE))

    TEST_CONFIG_FILE = None
    configs = [cfg]
    if test_mode:
        test_cfg = ConfigParser.ConfigParser()
        if os.path.exists(CONFIG_FILE):
            TEST_CONFIG_FILE = CONFIG_FILE.replace('production.ini', 'test.ini')
        if TEST_CONFIG_FILE and os.path.exists(TEST_CONFIG_FILE):
            test_cfg.read(TEST_CONFIG_FILE)
            configs.append(test_cfg)


    config = {}
    for cfg in configs:
        sections = ['DEFAULT', 'app:main', 'server:main']
        for section in sections:
            for name, value in cfg.items(section):
                config[name] = value
    return config

def create_timestamp():
    return datetime.now().strftime("%Y%m%d%H%M%S%f")

def create_resource(settings, resource_path, user_id=None, resource_type='image', resource_name='resource', resource_desc='resource', auth_pass=None):
    log.info("post resource payload: "+ resource_path)
    log.info("resource handler url: "+ CREATE_RESOURCE_URL)
    try:
        if resource_path.startswith('http'):
            params = {"resourceUri" : resource_path }
        else:
            new_resource_path = os.path.dirname(resource_path) + '/' + 'workbook-%s_%s.%s' %(create_timestamp(), resource_name.replace('/', '_').replace('"', ''), resource_type)
            new_resource_path = new_resource_path.encode('utf-8')
            os.rename(resource_path, new_resource_path)
            params = {"resourcePath" : open(new_resource_path, "rb") }
        params['resourceType'] = resource_type
        params['resourceName'] = resource_name
        params['resourceDesc'] = resource_desc

        log.info("Params: "+ str(params))
        core_server   = settings.get('resource_upload_server_url')
        internal_auth = settings.get('internal_auth', 'false').lower()

        if internal_auth == 'true':
            resource_upload_response = remotecall.makeRemoteCallWithAuth(CREATE_RESOURCE_URL, core_server, params_dict=params, multipart=True)
        else:
            resource_upload_response = remotecall.makeRemoteCall(CREATE_RESOURCE_URL, core_server, auth_pass=auth_pass, params_dict=params, multipart=True)

        log.info("Response from handler: "+  str(resource_upload_response))
        resourceID = None
        resourceUri = resource_path

        try:
            resourceID = resource_upload_response["response"]["id"]
            resourceUri = resource_upload_response["response"]["uri"]
            if not resourceUri.startswith('http'):
                resourceUri = resourceUri.replace('/flx', core_server)
        except Exception as e:
            log.error("Error: "+ str(e))
            resourceID = None

        if resourceID == None:
            return (resource_path, None)
        else:
            return (resourceUri, resourceID)
    except Exception as e:
        log.error("Error: "+ str(e))
        return (resource_path,None)

# Copied from http://www.velvetcache.org/2012/03/13/addressing-nested-dictionaries-in-python
class DotAccessibleDict (object):
  def __init__ ( self, data ):
    self._data = data

  def __getitem__ ( self, name ):
    val = self._data
    for key in name.split( '.' ):
      val = val[key]
    return val

def renameKeyWithDot(aDict):
    for key in aDict.keys():
        new_key = key.replace('.', '_')
        if new_key != key:
            aDict[new_key] = aDict[key]
            del aDict[key]
            if isinstance(aDict[new_key], dict):
                renameKeyWithDot(aDict[new_key])
        elif isinstance(aDict[key], dict):
            renameKeyWithDot(aDict[key])


def getTimeBucket(timestamp):
    timeBucketFormats = ['%Y-year', '%Y-%m-month', '%Y-%W-week', '%Y-%m-%d-day', '%Y-%m-%d %H-hour']
    return [timestamp.strftime(x) for x in timeBucketFormats]

def _to_python(val): 
    try:
        val = str(val)
        # Convert to python objects : strings, numbers, tuples, lists, dicts, booleans, and None.
        val = ast.literal_eval(val)
    except:
        pass
    return val

def to_python(params):
    if isinstance(params, list) or isinstance(params, tuple):
        newParams = list()
        for param in params:
            newParams.append(_to_python(param))
        return newParams

    if isinstance(params, dict) or isinstance(params, MultiDict):
        if isinstance(params, dict):
            newParamsDict = dict()
        else:
            newParamsDict = MultiDict()
        for key in params:
            newParamsDict[key] = _to_python(params[key])
        return newParamsDict
    return params

def getLoginCookieObject():
    from pylons import config
    if not config or not config.get('ck12_login_cookie'):
        config = load_config()
    ck12_login_cookie = config.get('ck12_login_cookie')
    auth_cookies = um.login('admin','notck12')
    cookies = Cookie.SimpleCookie()
    cookies[ck12_login_cookie] = auth_cookies
    return cookies

def getLoginCookie():
    from pylons import config
    if not config or not config.get('ck12_login_cookie'):
        config = load_config()
    user = config.get('ck12_ads_user')
    key = config.get('ck12_ads_key')
    auth_cookies = um.login(user, key)
    
    return auth_cookies

def genMD5Hash(path):
    f = open(path, 'rb')
    m = hashlib.md5()
    try:
        bufSize = 4096
        c = f.read(bufSize)
        while len(c) > 0:
            m.update(c)
            c = f.read(bufSize)
    finally:
        f.close()
    return m.hexdigest()

def getRandomString(noOfChars):
    import string
    allChars = [x for x in string.lowercase] + [x for x in string.lowercase] + [x for x in string.digits]
    random.shuffle(allChars)
    return "".join(allChars[:noOfChars])

def getEventID(params_dict):
    keys = params_dict.keys()
    keys.sort()
    params_list = []
    for key in keys:
        params_list.append('%s:%s' %(key, params_dict.get(key)))
    params_list.append('%s:%s' %('rand', getRandomString(5)))
    event_id = ';'.join(params_list)
    event_id = hashlib.md5(event_id).hexdigest()
    return event_id

def encrypt(string, settings):
    if not (isinstance(string,str) or isinstance(string,unicode)):
        string = json.dumps(string)
    string = safe_encode(string)
    key = settings.get('aes_secret_key','0000000000') 
    block_size = toInt(settings.get('aes_block_size', 16))
    cryptor = Cryptor(key,block_size=block_size) 
    iv, encrypted = cryptor.encrypt(string, in_key=key)
    log.info('IV: %s \nencryped: %s' % (iv, binascii.b2a_base64(encrypted).rstrip()))
    #encrypted = binascii.b2a_base64(iv + encrypted).rstrip()
    encrypted = binascii.b2a_base64(iv).rstrip()+binascii.b2a_base64(encrypted).rstrip()
    return encrypted

def decrypt(cipher, settings):
    key = settings.get('aes_secret_key','0000000000')
    block_size = toInt(settings.get('aes_block_size', 16))
    #key = aes_secret_key
    #block_size = 16
    # The cipher has both IV, and encrypted data seperated with "="
    splits = cipher.split("=",1)
    iv=splits[0]+"="
    iv = binascii.a2b_base64(iv)
    log.info("IV %s" % iv)
    encrypted=splits[1]
    cryptor = Cryptor(key,block_size=block_size)
    string = cryptor.decrypt(encrypted, in_key=key, in_iv=iv)
    log.info('Decrypted string %s' % string)
    return string

def get_signin_url(return_to=None):
    """
    """
    from pylons import config
    if not config or not config.get('ck12_auth_prefix'):
        config = load_config()
    prefix = config.get('ck12_auth_prefix')
    if return_to:
       login_url = '%s/signin?returnTo=%s' % (prefix, return_to)
    else:
       login_url = '%s/signin' % (prefix)
    return login_url

def getDBAndCollectionFromUrl(url):
    collection = None
    dbname = None
    if '/' in url:
        url, dbname = url.rsplit('/', 1)
    if '.' in dbname:
        dbname, collection = dbname.rsplit('.', 1)
    if dbname:
        url = '%s/%s' % (url, dbname)
    return url, dbname, collection

