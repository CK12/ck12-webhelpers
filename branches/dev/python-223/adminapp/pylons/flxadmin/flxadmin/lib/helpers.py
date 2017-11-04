"""Helper functions

Consists of functions to typically be used within templates, but also
available to Controllers. This module is available to templates as 'h'.
"""
# Import helpers as desired, or define your own, ie:
import os
import re
import random
import shutil
import tempfile
import stat 
import time
from datetime import datetime as dtdt

from pylons import config, url as _url, tmpl_context as c
from paste.deploy.converters import asbool
from webhelpers import paginate
from webhelpers.html import HTML, tags, builder
from webhelpers.util import html_escape
from jinja2.filters import FILTERS
import formencode

from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.lib.ck12.url_helpers import url_cdn, url_css, url_images, url_js, url_lib #for use by other files
from flxadmin.lib.ck12.exceptions import *
from flxadmin.model.artifact import ArtifactManager as Manager
from flxadmin.model.group import GroupManager
from flxadmin.model.session import SessionManager
from flxadmin.forms import options
from urllib import quote
from tempfile import NamedTemporaryFile
import json
import cgi
import hashlib
import dateutil.parser

import logging
LOG = logging.getLogger( __name__ )

html_escape_table = {
    "&": "&amp;",
     ">": "&gt;",
     "<": "&lt;",
    '"': "&#34;",
    "'": "&#39;",
}

def api_server_root():
    if asbool(config['use_apiproxy']):
        return url('apiproxy', qualified=True)
    else:
        return config['api_server_root']

def img_server_root():
    return config['api_server_root']

def flxweb_server_root():
    return config['flxweb_host_url']

def is_debug():
    return asbool(config.get('debug'))

def url(*args, **kwargs):
    """ Copied from flxweb's lib/helpers.py
    """
    if args and len(args) > 0:
        return unicode(_url(args[0].encode('utf-8'), **kwargs), 'utf-8')
    else:
        return _url(*args, **kwargs)

def url_(*args, **kwargs):
    """ Sets qualified=True so /flxadmin can be mapped on live server
    """
    if not kwargs.has_key('qualified'):
        kwargs['qualified'] = True
    return url(*args, **kwargs)

def to_list(list_or_obj):
    """ If list_or_obj evals to False ('', None, False, {}, []), return [], else
    Wrap it in a list if it isn't a list or tuple already
    """
    if list_or_obj:
        lsobj = list_or_obj
        return lsobj if isinstance(lsobj, (list, tuple)) else [lsobj]
    else:
        return []

def to_dict(list_of_tuple):
    """ If list_or_tuple evals to False ('', None, False, {}, []), return [], else
    Wrap it in a list if it isn't a list or tuple already
    """
    if list_of_tuple and isinstance(list_of_tuple, (list, tuple)):
        d = {}
        for ls in list_of_tuple:
            if len(ls) > 1:
                d[ls[0]] = ls[1]
        return d
    else:
        return list_of_tuple

def modify_page_attrs(params, pageSize=25):
    """ Rename 'page' attr to 'pageNum' since doing so in paginator.pager() errored
    Sets 'pageSize' to pageSize,
    Returns 'page' value that was in params or 1
    NOTE: Any calls to paginate.PageURL() must be made before params is modified
    """
    pageNum = params.pop('page', 1)
    pageNum = pageNum[0] if isinstance(pageNum, list) else pageNum
    params['pageNum'] = pageNum
    params['pageSize'] = pageSize
    return pageNum

def page_get(api_path, params, result_attr, total_attr='total'):
    """ Returns result, total tuple from calling api_path
    """
    data = api(api_path, params)
    resp = data.get('response') or {}
    result = resp.get(result_attr) or []
    total  = resp.get(total_attr) or len(result)
    return result, total

def rename_attrs(dict_, rename_mapping):
    """ Returns a new dict with attrs renamed from rename_mapping dict
    """
    d = dict(dict_)
    for key, mapped_key in rename_mapping.items():
        if d.has_key(key):
            d[mapped_key] = d.pop(key)
    return d

def remove_attrs(dict_, to_remove):
    """ Returns a new dict, with attrs removed if found in to_remove, 
    which may be a str of key to remove, a list/tuple of keys.
    """
    d = dict(dict_)
    to_remove = to_list(to_remove)
    for key in to_remove:
        d.pop(key, None)
    return d

def join_attrs(dict_, to_, from_, sep=';', remove_from=True):
    """ Joins 2 attrs (to_, from_) in dict_ into a single attr. 
    Assumes dict_[from_] and dict_[to_] are strs or empty strs.
    Returns new dict with dict_[to_] = dict_[from_] + sep + dict_[to_]. 
    Removes dict_[from_] if remove_from=True.
    """
    d = dict(dict_)
    if dict_.get(from_):
        d[to_] = d[to_]+sep+d[from_] if d.get(to_) else d[from_]
    if remove_from:
        d.pop(from_, None)
    return d

def keep_only(dict_, to_keep):
    """ Opposite of remove_attrs, Returns a new dict of attrs found in to_keep,
     which may be a str of key to remove, a list/tuple/dict of keys.
    If to_keep is a dict, it is expected to be a mapping of attr renames, so 
     this fn will do both "keep only" and renaming at once.  If the mapped val 
     is empty, no renaming will occur.
    """
    d = {}
    if isinstance(to_keep, (str, list, tuple)):
        to_keep = to_list(to_keep)
        for key in to_keep:
            if dict_.has_key(key):
                d[key] = dict_[key]
    elif isinstance(to_keep, dict):
        for keep, rename_to in to_keep.items():
            if dict_.has_key(keep):
                rename = rename_to or keep
                d[rename] = dict_[keep]
    return d

def remove_from(obj, to_remove):
    """ Calls remove_attrs() and returns a dict if obj is a dict, else
    Returns a new list of items removed from obj if item or item[0] in
    obj equals to_remove or items in to_remove.
    """
    if isinstance(obj, dict):
        return remove_attrs(obj, to_remove)
    if not isinstance(obj, (list, tuple)):
        return obj
    l = []
    for o in obj:
        tocmp = o[0] if isinstance(o, (list, tuple)) and len(o)>0 else o
        remove_list = to_list(to_remove)
        if tocmp not in remove_list:
            l.append(o)
    return l

def unescape(s_or_dict):
    """ Returns a new dict or str of values unescaped
    """
    # not sure if builder or urllib2.unquote() is better..
    # for escaping, can use  from webhelpers.util import html_escape
    if isinstance(s_or_dict, (str, unicode)):
        return builder.literal(s_or_dict).unescape() 
    else:
        d = dict(s_or_dict)
        for k,v in d.items():
            d[k] = builder.literal(v).unescape() 
        return d

def titlize(s):
    """ Replaces '_' with space and title() it, a helper for linkslistgen
    """
    return s.replace('_', ' ').title()
     
def fix_link(url):
    """ Replace link in url with current server's path
    """ 
    return re.sub('^/flx/', config['flx_core_api_server']+'/', url)

def fix_links(content):
    """ Replace links in content with current server's path, 2 passes to catch 
    both types of quotes (including quotes in match to replace only those
    quoted, eg src="/flx/...")
    """ 
    content = re.sub('\'/flx/', '\''+config['flx_core_api_server']+'/', content)
    return re.sub('\"/flx/', '\"'+config['flx_core_api_server']+'/', content)

def linkslistgen(spec_list):
    """ Returns a (url, title) list from spec_list, which is expected to be a
    list of strs, which is expected to be a named route and to be used for titlization,
    Or a list or (named route, title) tuple
    """
    linkslist = []
    for spec in spec_list:
        if isinstance(spec, (list, tuple)) and len(spec) == 2:
            title = titlize(spec[1])
            href = url(spec[0])
        elif isinstance(spec, str):
            title = titlize(spec)
            href = url(spec)
        else:
            raise InvalidArguments()
        linkslist.append( (href, title) )
    return linkslist


# Controller helpers        
def set_error(errmsg, ExceptionClass=None):
    if hasattr(c, 'errors'):
        c.errors.append(errmsg)
    if ExceptionClass:
        raise ExceptionClass(errmsg)

def boolstr(obj, boolstrs=''):
    """ Prints True/False for str or int obj. 
    @str boolstrs:  Space separated str for bool value printing, eg. passing
    'Yes No' prints Yes/No instead of default True/False
    """
    s = str(obj)
    if s=='1' or s.upper().startswith('T'):
        return boolstrs.split()[0] if boolstrs else 'True'
    elif s=='0' or s.upper().startswith('F'):
        return boolstrs.split()[1] if boolstrs else 'False'
    return obj

def pprint(obj, use_nbsp=True, boolstrs=''):
    """ Pretty prints a list, dict, or str. 
    @bool use_nbsp: Uses &nbsp; for more spacing in between pairs
    @str boolstrs:  See boolstr()
    """
    sep = ',&nbsp; ' if use_nbsp else ', '
    if isinstance(obj, dict):
        return sep.join(['%s: %s' % (k, v) for k, v in obj.items()])
    elif isinstance(obj, (list, tuple)):
        return sep.join([unicode(o) for o in obj])
    elif isinstance(obj, (str, unicode, int)):
        return boolstr(obj, boolstrs)
    return obj

def dict_to_valkey_str(obj, add_colon=False, use_nbsp=True):
    """ Like pprint, but in reversed "val1 key1, val2 key2" form.
    @bool add_colon: Adds ':' after val or not
    @bool use_nbsp: Uses &nbsp; for more spacing in between pairs
    """
    sep = ',&nbsp; ' if use_nbsp else ', '
    format = '%s: %s' if add_colon else '%s %s'
    if isinstance(obj, dict):
        return sep.join([format % (str(v), k) for k, v in obj.items()])
    return obj

def isEmpty(obj):
    return False if obj == 0 else not obj

def equals(v1, v2):
    try:
        return str(v1) == str(v2)
    except:
        return False

def val_for(params, attr, key, sep=';', kvsep=','):
    """ Returns value for key in attr in params.  Returns '' if no value but key
    found.  Returns None if key not found
    @dict params: a dict or multidict, like request.params
    @str  attr: attr to look for in params
    @str  key: attr to look for in attr
    @str  sep: separator used between key/val pairs
    @str  kvsep: separator separating key and val
    """
    for kv_pairs in params.get(attr, '').split(sep):
        kv_pair = kv_pairs.split(kvsep)
        if len(kv_pair) > 0 and kv_pair[0] == key:
            return kv_pair[1] if len(kv_pair) > 1 else ''
    return None

def traverse(dict_, attrs, errormsg='Unexpected API Response'):
    """ Returns val found by traversing dict_ on attrs path (list or single attr 
    string).  Sets c.error to errormsg and return None if error
    """
    d = dict_
    for attr in to_list(attrs):
        try:
            d = d[attr]
        except Exception, e:
            set_error(errormsg)
            return {}
    return d

class Flash(object):
    """ http://wiki.pylonshq.com/display/pylonscookbook/Site+Template
    see http://pylonshq.com/snippets/advanced_flash for more advanced flashing
    """
    def __call__(self, message):
        session = self._get_session()
        session["flash"] = message
        session.save()

    def pop_message(self):
        session = self._get_session()
        message = session.pop("flash", None)
        if not message:
            return None
        session.save()
        return message

    def _get_session(self):
        from pylons import session
        return session
flash = Flash()

def prepend_slash(s):
    return s if s.startswith('/') else '/'+s

def append_slash(s):
    return s if s.endswith('/') else s+'/'

def add_slashes(s):
    return prepend_slash(append_slash(s))

def remove_starting_slash(s):
    return s[1:] if s.startswith('/') else s

def validate(params, form):
    """ Validates form and           
    Sets c.form_result and returns True if form is valid,
    Sets c.form_errors and returns False o/w
    """
    LOG.info("params: %s" % params)
    try:
        c.form_result = form.to_python(dict(params))
    except formencode.Invalid, e:
        c.form_result = e.value
        c.form_errors = e.error_dict or {}
        LOG.debug('Form Errors:')
        LOG.debug(e)
        return False
    return True

def validate_integer(params, form):
    """ Validates form and           
    Sets c.form_result and returns True if form is valid,
    Sets c.form_errors and returns False o/w
    """
    try:
        err_alpha = [k for k, v in params.items() if not v.isdigit()]
        [int(x) for x in params.values()]
        c.form_result = params
    except Exception, e:
        c.form_result = params
        error_dict = {}
        if err_alpha:
            for error in err_alpha:
                error_dict.update({error : 'Please enter an integer value.'})
        c.form_errors = error_dict
        LOG.debug('Form Errors:')
        LOG.debug(e)
        return False
    return True

def validate_new_stat_type(params, form, stats_dict):
    if not params :
        c.form_errors = {'downloadStatType' : 'Please enter the name of source type.'}
        return False
    elif stats_dict.__contains__(params) :
        c.form_errors = {'downloadStatType' : 'Source type already exists.'}
        return False
    return True
    

# API helpers 
def makeCall(apiPath, params={}, multipart=False, raw=False, check_status=True):
    """ Helper to make the right api call based on apiPath
    """
    apiPath = remove_starting_slash(apiPath)
    if apiPath.startswith('peerhelp/'):
        apiPath = apiPath[9:]
        return RemoteAPI.makePeerhelpCall(apiPath, params, multipart=multipart, raw_response=raw)
    elif apiPath.startswith('assessment/'):
        apiPath = apiPath[11:]
        return RemoteAPI.makeAssessmentCall(apiPath, params, multipart=multipart, raw_response=raw)
    elif apiPath.startswith('hwp/'):
        apiPath = apiPath[4:]
        return RemoteAPI.makeHwpCall(apiPath, params, multipart=multipart, raw_response=raw)
    elif apiPath.startswith('auth/'):
        apiPath = apiPath[5:]
        return RemoteAPI.makeAuthServiceCall(apiPath, params, multipart=multipart, raw_response=raw, check_status=check_status)
    elif apiPath.startswith('flxweb/'):
        apiPath = apiPath[7:]
        return RemoteAPI.makeFlxwebCall(apiPath, params, multipart=multipart)
    elif apiPath.startswith('ads/'):
        apiPath = apiPath[4:]
        return RemoteAPI.makeADSCall(apiPath, params, multipart=multipart)
    elif apiPath.startswith('taxonomy/'):
        apiPath = apiPath[9:]
        return RemoteAPI.makeTaxonomyCall(apiPath, params)
    elif apiPath.startswith('flx/'):
        apiPath = apiPath[4:]
    return RemoteAPI.makeCall(apiPath, params, multipart=multipart, raw_response=raw, check_status=check_status)

def makeGetCall(apiPath, params={}, check_status=True, raw=False,timeOut=None):
    """ Helper to make the right api call based on apiPath
    """
    apiPath = remove_starting_slash(apiPath)
    if apiPath.startswith('peerhelp/'):
        apiPath = apiPath[9:]
        return RemoteAPI.makePeerhelpGetCall(apiPath, params, check_status=check_status)
    elif apiPath.startswith('assessment/'):
        apiPath = apiPath[11:]
        return RemoteAPI.makeAssessmentGetCall(apiPath, params, check_status=check_status)
    elif apiPath.startswith('hwp/'):
        apiPath = apiPath[4:]
        return RemoteAPI.makeHwpGetCall(apiPath, params, check_status=check_status)
    elif apiPath.startswith('auth/'):
        apiPath = apiPath[5:]
        return RemoteAPI.makeAuthServiceGetCall(apiPath, params, check_status=check_status,timeOut=timeOut)
    elif apiPath.startswith('flxweb/'):
        apiPath = apiPath[7:]
        return RemoteAPI.makeFlxwebGetCall(apiPath, params)
    elif apiPath.startswith('ads/'):
        apiPath = apiPath[4:]
        return RemoteAPI.makeADSGetCall(apiPath, params, check_status=check_status)
    elif apiPath.startswith('taxonomy/'):
        apiPath = apiPath[9:]
        return RemoteAPI.makeTaxonomyGetCall(apiPath, params)
    elif apiPath.startswith('dexter/'):
        apiPath = apiPath[7:]
        return RemoteAPI.makeDexterGetCall(apiPath, params)
    elif apiPath.startswith('flx/'):
        apiPath = apiPath[4:]
    return RemoteAPI.makeGetCall(apiPath, params, check_status=check_status, raw_response=raw)

def int_in_search(params, apiPath,responsePaths=[], searchAttr='searchAll', 
                  queryAttr='', queryKey='id', altSearchPath=None, pageSize=1, altSearchKey=None, pageNum=1, pageUrlKey=''): 
    """ Returns True and sets c.paginator if int is found in params[searchAttr],
    False o/w.
    @str  apiPath:       flx GET API path assumed, code needs to be modified if not
                         id parsed from the params will be appended to apiPath,
                         '/' is appended before the id if it isn't there already.
    @list responsePaths: list of attrs or attr str to drill down further past
                         'response' attr of response data to get desired data
    @str searchAttr:     Attr key to look for int in params
    @str queryAttr:      Defaults to call API w/o any params, o/w set str to 
                         attr desired for param to pass to API, i.e.:
                         {queryAttr: queryKey+','+idSearched}   e.g., set to 
                         'search' or 'filters' if API is a listing API.
    @str queryKey:       Use with queryAttr (see above), defaults to 'id'
    @int altSearchPath : required to search int values as title in artifact/users/groups
    @int pageNum    :    required to maintain pagination if total number of records in altSearchPath api is more than available supported page size.
    """
    
    idSearched = params.get(searchAttr, 'Not an int')
    try:
        id = int(idSearched)
        if queryAttr:
            data = makeGetCall(apiPath, {queryAttr: '%s,%d'%(queryKey,id)})
        else:
            apiPath = append_slash(apiPath)
            try:
                data = makeGetCall('%s%d' % (apiPath, id))
            except Exception as e:
                LOG.info(e)
                data = {}
                if not (altSearchPath and altSearchKey) :
                    raise RemoteAPIStatusException(e.status_code,e.api_message)
        resp = data.get('response') or {}
            
        for path in to_list(responsePaths):
            resp = resp.get(path, {})
        total = 1 if resp else 0
        if altSearchPath and altSearchKey:
            result_all = []
            if resp:
                result_all.append(resp)
                #as 1 record for int search is already present, get only n-1 records
                if params.has_key('pageSize'):
                    params['pageSize'] = int(params['pageSize']) -1 
            result, total_number = page_get(altSearchPath, params, altSearchKey)
            if result :
                if type(result) == dict:
                    result_all.append(result)
                    total = total + 1
                else :
                    resultant = [each_result for each_result in result if  each_result['id'] != id]
                    result_all.extend(resultant)
                    total += total_number
            #again restore original page size
            if resp:
                params['pageSize'] = int(params['pageSize']) -1
            pageUrl = paginate.PageURL(url_(pageUrlKey), dict(params))
            modify_page_attrs(params, pageSize)
            page_args = (result_all, pageNum, pageSize,total, pageUrl, True)
        else :
            page_args = (resp, 1, 1, total) if queryAttr else ([resp], 1, 1, total)
        c.paginator = paginate.Page(*page_args)
        return True
    except RemoteAPIStatusException:
        c.paginator = paginate.Page([], 1 , 1, 0) 
        return True
    except ValueError:
        return False

def api(apiPath, params={}, success_msg=''):
    """ Calls apiPath with GET, flashes success_msg if avail.
    Returns api's data returned if success,
    Sets c.error and returns None o/w.
    @str apiPath: Assumed to be flx path, need to modify code if non-flx api needed
    """
    try:
        data = makeGetCall(apiPath, params)
    except Exception, e:
        LOG.exception(e)
        set_error(e)
        return {}
    if success_msg:
        flash(success_msg)
    return data

def api_post(apiPath, params, success_msg='', multipart=False, check_status=True):
    """ Like api(), but with POST.
    """    
    try:
        data = makeCall(apiPath, params, multipart=multipart, check_status=check_status)
    except Exception, e:
        LOG.exception(e)
        set_error(e)
        return {}
    if success_msg:
        flash(success_msg)
    return data

def api_raw(apiPath, params={},timeOut=None):
    """ Like api(), but returns error msg instead of setting c.error if Exception
    """
    try:
        return makeGetCall(apiPath, params, check_status=False,timeOut=timeOut)
    except Exception, e:
        LOG.exception(e)
        return e

def api_post_raw(apiPath, params, success_msg='', multipart=False):
    """ Like api_post(), but don't catch Exception nor set c.error
    """
    return makeCall(apiPath, params, multipart=multipart, check_status=False)

def get_sel(apiPath=None, responsePlus=[], ids=[], sortby=None, prependStr='', 
            prependTuple=('', 'None')):
    """ Returns list of 2-tuples (eg. for html selects) by calling apiPath and
    drilling down on response['response'][responsePlus], which is expected to be
    a list or dict.
    @str apiPath: flx path or full API path
    @list responsePlus: paths beyond 'response' to drill down to get actual data
    @list ids:   attrs to get from the response dicts to produce result tuples
    @sortby:     attr of response dicts to sort by
    @prependStr: str to prepend to each tuples[0], including the prependTuple
    @prependTuple: tuple to prepend to the resulting list of tuples
    """
    data = api(apiPath, {'pageSize': 99})
    responsePaths = ['response']
    responsePaths.extend(to_list(responsePlus))
    respObj = traverse(data, responsePaths)
    if isinstance(respObj, dict):
        list_ = [(prependStr+str(k), v) for k,v in respObj.items()]
    else: # list or tuple of dicts
        dicts = respObj 
        if sortby != None:
            dicts = sorted(dicts, key=lambda d: d.get(sortby))

        list_ = [(prependStr+str(d.get(ids[0])), d.get(ids[1])) for d in dicts]
    if prependTuple:
        list_.insert(0, (prependStr+prependTuple[0], prependTuple[1]))
    return list_


# Artifacts specific:
def type_title(artifact):
    """ Returns "Artifact's Type - Artifact's Title" string
    """
    if not artifact:
        return '(No Artifact)' 
    type_ = artifact.get('artifactType') or ''
    title = artifact.get('title') or '(No title)'
    return '%s - %s' % (type_.capitalize(), title)

def formats_urls(artifact, isRevision=False):
    """ Returns dict of pdf, epub, mobi urls ({} if no artifact)
    @param artifact: artifact dict or dict-like artifact object using toArtifact()
    @bool  isRevision: artifact arg is from a revision dict/obj
    """
    if not artifact:
        return {}
    revision = artifact.get('revisions', [None])[0]
    fromobj = revision if isRevision else artifact
    prefix = '' if isRevision else 'url_'

    # currently only pdf is a list, turning all to list for consistency
    return {
        'epub': to_list(fromobj.get(prefix+'epub')),
        'mobi': to_list(fromobj.get(prefix+'mobi')),
        'pdf':  to_list(fromobj.get(prefix+'pdf')),
    }

def has_format(format, artifact, isRevision=False):
    """ Returns tuple of bool for if pdf, epub, mobi urls exists
    @str format: format name, eg. pdf, epub, mobi, or 
                 all: has all formats,
                 as_list: list of avail formats, eg: ['pdf', 'epub']
    @param artifact: artifact dict or dict-like artifact object using toArtifact()
    @bool  isRevision: artifact arg is from a revision dict/obj
    """
    urls = formats_urls(artifact, isRevision)
    if format.lower() == 'all':
        return reduce(lambda a,b: a and b, urls.values())
    elif format.lower() == 'as_list':
        return [k for k, v in urls.items() if v]
    else:
        return len(urls[format.lower()]) > 0

def formats_str(artifact, isRevision=False):
    """ Returns nicely labeled string of artifact formats
    @param artifact: artifact dict or dict-like artifact object using toArtifact()
    @bool  isRevision: artifact arg is from a revision dict/obj
    """
    na = 'N/A'
    urls = formats_urls(artifact, isRevision)
    return ',&nbsp; '.join([
     'epub: %s'% (', '.join([htmla_api(s, '[%d]'%(i+1)) for i,s in enumerate(urls['epub'])]) or na),
     'mobi: %s'% (', '.join([htmla_api(s, '[%d]'%(i+1)) for i,s in enumerate(urls['mobi'])]) or na), 
     'pdf: %s' % (', '.join([htmla_api(s, '[%d]'%(i+1)) for i,s in enumerate(urls['pdf'] )]) or na), 
    ])

def get_group(id):
    """ Retrieves and returns group or None, Sets c.error if not found.
    @param id: str or int, will be converted to str needed.
    @bool details: get detailed group or not
    """ 
    group = GroupManager.getGroupByID(str(id))
    if not group:
        set_error('NO SUCH GROUP OR BAD DATA')
    return group
    

def get_assignment_artifact_concepts(id):
    """ Retrieves and returns concepts for artifactID.
    @param id: str or int, will be converted to str needed.
    """    
    concepts = Manager.getConceptsForAssignmentArtifact(str(id))
    return concepts

def get_artifact(id, details=False):
    """ Retrieves and returns artifact or None, Sets c.error if not found.
    @param id: str or int, will be converted to str needed.
    @bool details: get detailed artifact or not
    """ 
    artifact = Manager.getArtifactById(str(id), details=details)
    if not artifact:
        set_error('NO SUCH ARTIFACT OR BAD DATA')
    return artifact

def get_revision(id, for_update=False):
    """ Retrieves and returns revision['response'][<artifactType>] or None, 
    Sets c.error if not found
    """ 
    params = {}
    params['forUpdate'] = for_update
    data = api('get/detail/revision/%s' % id, params)
    if not data:
        return None  # api() calls set_error() already

    response = data.get('response')
    if not response:
        set_error('NO response IN REVISION DATA', UnexpectedResponseData)
        return None

    # response is expected to be {<artifactType>: <artifactDict>}
    try:
        artifactType = response.iterkeys().next()
    except StopIteration:
        set_error('NO artifactType IN REVISION RESPONSE', UnexpectedResponseData)
        return None

    if not artifactType in options.artifactTypes:
        set_error('ArtifactType %s is not expected' % artifactType, UnexpectedResponseData)
        return None
    return response[artifactType]

def genTermDict(action, browseTerm, browseTermType, id, encodedID=''):
    """ Returns a browseTerm dict that load/browseTerms api expects.
    """
    d ={'artifactID': id,
        'browseTerm': browseTerm,
        'browseTermType': browseTermType,
        'action': action,
    }
    if encodedID:
        d['encodedID'] = encodedID
    return d

def browseTerms(newTerms, oldTerms, id):
    """ Returns a list of browseTerm dict that load/browseTerms api expects.
    @dict newTerms: a simple dict of eg: {'level': val, 'conceptNode': val}
    @dict oldTerms: same format as newTerms
    """
    terms = []
    for type_, term in newTerms.items():
        oldTerm = oldTerms.get(type_)
        newTerm = term.strip() if isinstance(term, (str, unicode)) else term 
        oldEncodedID, newEncodedID = '', '' # encodedIDs should be empty except for domains
        if newTerm != oldTerm:
            if type_ == 'domain': # need to get the real terms via api if type is domain
                if oldTerm:
                    data = api('get/info/browseTerm/'+oldTerm, {})
                    oldEncodedID = oldTerm
                    oldTerm = traverse(data, ['response', 'name'])
                if newTerm:
                    data = api('get/info/browseTerm/'+newTerm, {})
                    newEncodedID = newTerm 
                    newTerm = traverse(data, ['response', 'name'])
            if oldTerm: 
                terms.append(genTermDict('remove', oldTerm, type_, id, oldEncodedID))
            if newTerm: 
                terms.append(genTermDict('add', newTerm, type_, id, newEncodedID))
    return terms

def getNewModalityURLForArtifacts(artifactList):
    """
        1. Get List of distinct domain ecodedID's
        2. Get brach name for each encode ID,
        3. Consturct new modality url
        4. Return the list of artifacts with a new key-value - newModalityURL-new url
    """
    allEIDS = ['.'.join( artifact['domain']['encodedID'].split('.')[:2] ) for artifact in artifactList if artifact['domain']]
    allEIDS = list(set(allEIDS)) # Get the distinct encodedID's from the ecodeedID list
    try:
        eid_branch_dict = getBranchHandlesByEIDs(allEIDS)
    except Exception, e:
        LOG.error('Error in getting browse Term for %s : Exception[%s]' % (allEIDS,str(e)))
    for artifact in artifactList:
        if artifact['domain'] :
            browse_term_short = '.'.join( artifact['domain']['encodedID'].split('.')[:2])
            browseTerm = {}
            browseTerm[browse_term_short] = eid_branch_dict[browse_term_short]
            modality_url = getNewModalityURLForArtifact(browseTerm,artifact)
            if modality_url:
                artifact['newModalityURL'] = modality_url
                artifact['branch'] = eid_branch_dict['.'.join( artifact['domain']['encodedID'].split('.')[:2] )]
        else:
            artifact['newModalityURL'] = 'http://%s/%s'%(flxweb_server_root(),artifact.get('perma',''))
            artifact['branch'] = ''
    return artifactList
    
def getNewModalityURLForArtifact(browseTerm,artifact):
    """ Get New Modality url in for following format 
        http://<host>/<branch>/<concept-handle>/<modality-type>/<realm>/<modality-handle>"""
    if not browseTerm:
        return None
    if browseTerm.keys()[0].startswith('UGC'):
        branch = 'na'
    else:
        branch = browseTerm[browseTerm.keys()[0]]
    if branch is None:
        branch = ''    
    if artifact['artifactType'] in ['book','section', 'tebook', 'studyguide', 'labkit' ] :
        return "http://%s/%s" % (flxweb_server_root(), artifact['perma'])
    else:
        if artifact.get('realm',None):
            return "http://%s/%s/%s/%s/%s/%s" % (flxweb_server_root(), branch.lower(), artifact['domain']['handle']\
                                        , artifact['artifactType'], artifact['realm'], quote(safe_encode(artifact['handle']),'').replace('/', '%2F'))
        else:
            return "http://%s/%s/%s/%s/%s" % (flxweb_server_root(), branch.lower(), artifact['domain']['handle']\
                                        , artifact['artifactType'], quote(safe_encode(artifact['handle']),'').replace('/', '%2F'))
    
def getBranchNamesByEIDs(eids=None):
    """
        Make flx API call to get the branch name from encodedID
    """
    if not eids:
        return None
    eids = json.dumps(eids)
    
    data = api_post('get/info/browseTerms',{'EIDList':eids})
    result = {}
    if data and data['response']:
        for resp in data['response']:
            result[resp['encodedID']] = resp['name']
    return result

def getBranchHandlesByEIDs(eids=None):
    """
        Make flx API call to get the branch name from encodedID
    """
    if not eids:
        return None
    eids = json.dumps(eids)
    
    data = api_post('get/info/browseTerms',{'EIDList':eids})
    result = {}
    if data and data['response']:
        for resp in data['response']:
            LOG.info('RESPi %s' % resp)
            result[resp['encodedID']] = resp['handle']
    return result

    
# Exercise Related:
def question_type(id):
    """ Returns string representation for question type id
    """
    for tup in options.question_type_choices:
        if tup[0] == str(id):
            return tup[1]
    return id

def answer_for(q):
    """ Returns the displayText for question q's option whose 'isCorrect' is 'T'
    """
    opts = q.get('options')
    if not isinstance(opts, (list, tuple)):
        return ''
    for o in opts:
        if o.get('isCorrect').upper().startswith('T'):
            return o.get('displayText')
    return ''

def name(s, id=None, suffix='_text'):
    """ Returns a readable name (for html input name attr) so *_defaults() is
    is guaranteed to be filling in inputs correctly for *_widgets().
    """
    return '%s%s%s' % (s, str(id) if id else '', suffix)

def quote_html_escape(text):
    try:
        return "".join(html_escape_table.get(c,c) for c in text)
    except Exception, e:
        LOG.error('Error in escaping charachters: Exception[%s]' % str(e))
        return text

def answer_defaults(q, isGenerative, answer='answer', distractor='distractor'):
    """ Returns the default inputs dict for htmlfill() to fill in answer_widget inputs
    @attr answer & distractor: Used for html input name attr generation 
    """
    typeID = q.get('questionTypeID')
    opts = q.get('options') or []
    val = 'algebraicText' if isGenerative else 'displayText'
    d = {}

    if isGenerative:
        d.update({answer: q.get(val)})
        if typeID == 2:  # T/F
            d.update({name(distractor, '', ''): opts[0].get(val)})
            d.update({name(answer): q.get('answerDisplayText') or 'True'})
        if typeID == 3:  # multiple choice
            d.update({name(answer): q.get('answerDisplayText')})
            for i, o in enumerate(opts):
                d.update({name(distractor, i+1, ''): o.get(val)})
                d.update({name(distractor, i+1): o.get('displayText')})
        return d 
    else: # Declaratvie:
        if typeID == 1:  # short answer
            return {answer: opts[0].get(val) if opts != [] else ""}
        elif typeID == 2: # T/F
            for o in opts:
                if o.get('isCorrect', '').upper().startswith('T'):
                    return {answer: o.get(val)}
        elif typeID == 3:  # multiple choice
            d = {answer: quote_html_escape(answer_for(q))}
            for o in opts:
                d.update({name(answer, o.get('displayOrder')): o.get(val)})
        return d 

def answer_widget(q, isGenerative, answer='answer', distractor='distractor'): 
    """ Returns html rendering of answer editing widget based on question q's type.
    @attr answer & distractor: Used for html input name attr generation 
    """
    typeID = q.get('questionTypeID')
    opts = q.get('options') or []
    val = 'algebraicText' if isGenerative else 'displayText'
    css = 'xlong' 
    e = []

    if isGenerative:
        e.append(labelinput('Answer', answer, css))
        if typeID == 2:  # T/F
            e.append(labelinput('Distractor', name(distractor, '', ''), css))
            e.append(htmlinput(name(answer), 'hide'))
        if typeID == 3:  # multiple choice
            e.append(labelinput('Answer Display', name(answer), css))
            e.append('<hr class="formDataCol %s">'%css)
            for i, o in enumerate(opts):
                e.append(labelinput('Distractor %d'%(i+1), 
                    name(distractor, i+1, ''), css))
                e.append(labelinput('Distractor %d Display'%(i+1), 
                    name(distractor, i+1), css))
    else: # Declaratvie:
        e.append(htmllabel('Answer'))
        if typeID == 1:  # short answer
            e.append(htmlinput(answer, css))
        elif typeID == 2 or typeID == 3:
            for o in sorted(opts, key=lambda opt: opt.get('displayOrder')):
                e.append('<div class="formDataColBtmPadded">')
                encodedVal = o.get(val)
                if(' ' in encodedVal):
                    encodedVal = (encodedVal)
                e.append(HTML.tag('input', name=answer, type_='radio', value=encodedVal))
                if typeID == 2:
                    e.append(HTML.tag('label', c=o.get(val)))
                else:
                    e.append(htmlinput(name(answer, o.get('displayOrder')), css))
                e.append('</div>')
    return '\n'.join(e)

def app_verion_branch_widget(branch, input_type='readonly'): 
    """ Returns html rendering of application branch. 
    """
    branches = branch or {}
    css = 'xlong' 
    e = []
    i = 0
    for branch in branches:
        e.append("<div class='tr'> <div class='td _short'> <input type='text' value='' placeholder='' name='branch%s' id='branch%s' class='med branchid_field'> </div>" % ((i+1), (i+1)))
        e.append("<div class='td med'> <input type='text' value='' placeholder='' name='update%s' id='update%s' class='xmed update_time_field'> </div>" % ((i+1), (i+1)))
        e.append("<div class='td short'><span class='linklike delete_branch' data-branch_id='%s' >[Delete]</span>" % (i+1) + "</div> </div>")
        i += 1
    return '\n'.join(e)

def app_verion_branch_defaults(branch):
    """ Returns the default inputs dict for htmlfill() to fill in application branch information
    """
    branches = branch or {}
    d = {}
    i = 0
    for branch in branches:
        d.update({name('branch', i + 1, ''): branch['branch']})
        d.update({name('update', i + 1, ''): branch['update_time']})
        i += 1
    return d

def special_search_entry_widget(entry, input_type='readonly', entryType=''): 
    """ Returns html rendering of special search entry widget based key and values. 
    """
    entries = entry or {}
    css = 'xlong' 
    e = []
    entryType = entryType.replace(' ', '-')
    for i, o in enumerate(entries.keys()):
        e.append("<div class='tr %s %s'> <div class='td _short'> <input type='text' value='' placeholder='' name='key%s' id='key%s' class='med'> </div>" % (entryType, o, (i+1), (i+1)))
        if o.lower() == 'thumbnailurl':
            e.append("<div class='td med'> <input type='text' value='' placeholder='' name='value%s' id='value%s' class='xmed 124'/> \
                        <br/>OR Upload Image\
                        <input type='file' name='cover-image'> \
                        </div>" % ((i+1), (i+1)))
        else:
            e.append("<div class='td med'> <input type='text' value='' placeholder='' name='value%s' id='value%s' class='xmed'> </div>" % ((i+1), (i+1)))
        e.append("<div class='td short'><span class='linklike delete_entry' data-entry_id='%s' >[Delete]</span>" % (i+1) + "</div> </div>")
    return '\n'.join(e)

def special_search_entry_defaults(entry):
    """ Returns the default inputs dict for htmlfill() to fill in special search entry widget inputs
    """
    entries = entry or {}
    d = {}
    for i, key in enumerate(entries.keys()):
        d.update({name('key', i + 1, ''): key})
        d.update({name('value', i + 1, ''): entries[key]})
    return d

def ae_answer_widget(q, isGenerative, answer='answer', distractor='distractor', input_type='readonly'): 
    """ Returns html rendering of answer editing widget based on question q's type.
    @attr answer & distractor: Used for html input name attr generation 
    """
    typeID = q.get('questionTypeID')
    opts = q.get('options') or []
    css = 'xlong' 
    e = []
    distractor_e = []
    index = 1
    ans_index = 1
    e.append(labelinput('Solution', name('solution', '', ''), css, type_=input_type))
    e.append('<hr class="formDataCol %s">'%css)

    for i, o in enumerate(opts):
        if o.get('isCorrect') == 'T':
            if typeID in [1, 4, 5, 9, 10]:
                # Don't show the number for 'short-answer' questions
                if typeID == 1:
                    indexNum = ''
                else:
                    indexNum = ans_index
                e.append(labelinput('Answer %s'%(indexNum), name(answer, ans_index, ''), css, type_=input_type))
                e.append(labelinput('Answer %s Feedback'%(indexNum), name('ansFeedback', ans_index, ''), css, type_=input_type))
                if o.get('feedbackWrong', None) != None:
                    e.append(labelinput('Wrong Answer %s Feedback'%(indexNum), name('ansFeedbackWrong', ans_index, ''), css, type_=input_type))
                if o.get('variations', None):
                    e.append(labelinput('Answer Variation(s) %s'%(indexNum), name('ansVariations', ans_index, ''), css, type_=input_type))
            else:
                e.append(labelinput('Answer', name(answer, ans_index, ''), css, type_=input_type))
                e.append(labelinput('Answer Feedback', name('ansFeedback', ans_index, ''), css, type_=input_type))
                if o.get('feedbackWrong', None) != None:
                    e.append(labelinput('Wrong Answer Feedback', name('ansFeedbackWrong', ans_index, ''), css, type_=input_type))
            if typeID == 3:
                e.append('<hr class="formDataCol %s">'%css)
            ans_index += 1
        else:
            if typeID in [3, 4]:
                distractor_e.append(labelinput('Distractor %d'%(index), 
                    name(distractor, index, ''), css, type_=input_type))
                distractor_e.append(labelinput('Distractor %d Feedback'%(index), 
                    name('distFeedback', index, ''), css, type_=input_type))
            else:
                distractor_e.append(labelinput('Distractor', 
                    name(distractor, index, ''), css, type_=input_type))
                distractor_e.append(labelinput('Distractor Feedback', 
                    name('distFeedback', index, ''), css, type_=input_type))
            index += 1
    e.extend(distractor_e)
    return '\n'.join(e)

def ae_answer_defaults(q, isGenerative, answer='answer', distractor='distractor'):
    """ Returns the default inputs dict for htmlfill() to fill in answer_widget inputs
    @attr answer & distractor: Used for html input name attr generation 
    """
    opts = q.get('options') or []
    typeID = q.get('questionTypeID')
    d = {}

    index = 1
    ans_index = 1

    d.update({name('solution', '' , ''): q.get('solution','')})

    for i, o in enumerate(opts):
        if o.get('isCorrect') == 'T':
            if typeID in [1, 4, 5, 9, 10]:
                d.update({name(answer, ans_index, ''): o.get('displayText')})
                d.update({name('ansFeedback', ans_index , ''): o.get('feedback')})
                if o.get('feedbackWrong', None) != None:
                    d.update({name('ansFeedbackWrong', ans_index , ''): o.get('feedbackWrong')})
                if o.get('variations', None):
                    variations = ', '.join(o['variations'])
                    d.update({name('ansVariations', ans_index , ''): variations})
                ans_index +=1
            else:
                d.update({name(answer, ans_index, ''): o.get('displayText')})
                d.update({name('ansFeedback', ans_index , ''): o.get('feedback')})
                if o.get('feedbackWrong', None) != None:
                    d.update({name('ansFeedbackWrong', ans_index , ''): o.get('feedbackWrong')})
        else :
            d.update({name(distractor, index, ''): o.get('displayText')})
            d.update({name('distFeedback', index, ''): o.get('feedback')})
            index += 1
    return d 

# Resource and Uploads Related:

def resource_tag(resource):
    """ Returns html tag to present the resource or '' if resource evals to False.
    @dict resource: resource dict with type and description attrs
    """
    if not resource:
        return ''
    type_ = resource.get('type') or ''
    perma = resource.get('permaUri')
    link = fix_link('/flx/render/perma/resource'+perma)

    if type_ in options.image_types:
        return tags.image(link, 'Image')
    elif 'video' in type_:
        return resource.get('description')
    elif type_ == 'contents':
        return '<iframe class="render" src='+link+'></iframe>'
    elif type_ in options.download_types:
        return htmla(link, '[Download (or open) %s]' % type_.capitalize())
    elif not type_:
        return "No resource type!"
    # else: expression, audio, html, interactive
    return "Rendering of this resource type is not supported yet, please let Engineering team know about this!"

def resource_is(resource):
    """ Returns dict of resource abilities
    """
    type_ = resource.get('type') if resource else ''
    class is_:
        downloadable = type_ in options.download_types
        updatable    = type_ in options.updatable_types
        image        = type_ in options.image_types
        update_via_upload_only = type_ in options.update_via_upload_only_types
    return is_

def get_upload_dir():
    ''' configuration setting for resource upload directory, defaults to /tmp/
    '''
    resource_upload_dir = config.get('resource_upload_dir', tempfile.gettempdir())
    if not os.path.exists(resource_upload_dir):
        os.makedirs(resource_upload_dir)
    return resource_upload_dir

def get_upload_file_prefix():
    ''' Returns a str of timestamp and a random number. This prefix should be 
    used with filenames while persisting file-like objects during uploads
    '''
    timestamp = '%s' % time.time()
    timestamp = timestamp.replace('.', '-')
    randomnum = '%s' % random.randint(1, 100)
    user = SessionManager.getCurrentUser()
    userid = '%s' % str(user.get('id')) if user else '0'
    prefix = '%s-%s-%s' % (userid, timestamp, randomnum)
    return prefix

def savefile(f):
    """ Saves (persist) file-like object f and returns file saved.
    Caller is expected to call closefile() to close the files opened.
    @param f: file-like object with filename and file attrs. 
    """
    dash_filename = '%s-%s' % (get_upload_file_prefix(), f.filename)
    store_filename = os.path.join(get_upload_dir(), dash_filename)
    store_file = open(store_filename, 'w')
    shutil.copyfileobj(f.file, store_file)
    f.file.close()
    store_file.close()
    store_file = open(store_filename, 'r')
    return store_file, store_filename

def closefile(f, filename):
    """ Closes f, and os.remove(filename), used by update_resource()
    """
    f.close()
    os.remove(filename)

def create_or_update_resource(params, success_msg='', raw_call=False):
    """ Replace or create resource by uploading resource in tmp file and calls api.
    If id is in params, calls api to update. If no id, calls create api.
    Returns data returned from api, Sets c.errors if any errors

    @dict params: Expects the following attrs:
     id           - required if want to replace a resource instead creating a new one
     resourcePath - required for resource uploads, overrides URL resources
                    (resourceUri param).  Value is overridden to None if it does not
                    have 'file' attr (not a <input type='file'>) & resourceUri exits
     resourceUri  - for resource from URL, overridden to None if resourcePath exists
     resourceHandle - optional, API generates it if not given, except for attachement
                    types, which Nimish says it must be set to resourceName
                    (why API doesn't do this instead is not given).
     type         - eg. 'image', 'attachement', 'cover page', not needed if has id param
     description  - eg. 'image', not needed if has id param
     authors      - optional
     license      - optional
     impersonateMemberID - required to update, seems optional for create
     isAttachment - optional, defaults to 'false' by API, 'false' even for 
      'attachement' types, only flxweb's resource.py attachement_upload() sets it 'true'
     isPublic     - optional, defaults to 'false' by API. 
    """ 
    api = 'update/resource' if params.get('id') else 'create/resource'
    api_fn = api_post_raw if raw_call else api_post
    params = rename_attrs(params, {
        'type': 'resourceType',
        'description': 'resourceDesc',
        'authors': 'resourceAuthors',
        'license': 'resourceLicense',
    })
    if params.get('impersonateMemberID'):
        params['impersonateMemberID'] = str(params['impersonateMemberID'])

    f = params.get('resourcePath')
    if hasattr(f, 'file'):
        store_file, store_filename = savefile(f)
        params = remove_attrs(params, 'resourceUri')
        params['resourcePath'] = store_file 
        params['resourceName'] = f.filename 
        if params['resourceType'] == 'attachment':
            params['resourceHandle'] = f.filename 
        data = api_fn(api, params, success_msg, True)
        closefile(store_file, store_filename)
    else:
        if params.get('resourceUri'):
            params = remove_attrs(params, 'resourcePath')
            params['resourceName'] = os.path.basename(params['resourceUri'])
        data = api_fn(api, params, success_msg, check_status=api.startswith('update'))

    if data and success_msg:
        flash(success_msg)
    return data

def api_load(params, success_msg='',api=None):
    """ Calls one of the the /load APIs (which to call depends on key in params)
    @dict params: Expects at least one of the key:value pairs to be:
     key: value for /load/<what>, eg. browseTerms calls /load/browseTerms
     val: file-like upload object
    """ 
    params_ok = False
    for key in params.keys():
        if hasattr(params[key], 'file'):
            params_ok = True
            if api is None:
                api = 'load/'+key
            else:
                key = api.split('/')[2]
            break
    if not params_ok:
        raise Exception('No file-like object found in params')
    
    store_file, store_filename = savefile(params[key])
    params = {'file': store_file}
    data = api_post(api, params, success_msg, True)
    closefile(store_file, store_filename)

    if data and success_msg:
        flash(success_msg)
        return data

def upload(params):
    """ Uploads file specified in params
    @dict params: Expects at least one of the key:value pairs to be:
     key: value for /load/<what>, eg. browseTerms calls /load/browseTerms
     val: file-like upload object
    """ 
    params_ok = False
    for key in params.keys():
        if hasattr(params[key], 'file'):
            params_ok = True
            break
    if not params_ok:
        raise Exception('No file-like object found in params')

    store_file, store_filename = savefile(params[key])
    params = {'file': store_file}
    closefile(store_file, store_filename)

    if data and success_msg:
        flash(success_msg)
        return data

def saveUploadedFile(request, fileParam, dir=None, allowedExtenstions=None):
    uploadedFile = request.POST['file']
    LOG.info('File %s [%d bytes]' % (uploadedFile.filename, len(uploadedFile.value)))
    if allowedExtenstions:
        fn = uploadedFile.filename.lower()
        matched = False
        for ext in allowedExtenstions:
            if fn.endswith(ext):
                matched = True
                break
        if not matched:
            raise Exception('Invalid file name extension. Allowed extensions are: %s' % ','.join(allowedExtenstions))
    try:
        ## save the file to temp location
        tfile = NamedTemporaryFile(suffix=os.path.basename(uploadedFile.filename), delete=False, dir=dir)
        shutil.copyfileobj(uploadedFile.file, tfile)
        uploadedFile.file.close()
        tfile.close()
        os.chmod(tfile.name, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP | stat.S_IROTH | stat.S_IWOTH)
        return tfile.name
    except Exception, e:
        LOG.error('Error saving uploaded file to disk: Exception[%s]' % str(e))
        raise e

        
# Template Filters
FILTERS['boolstr'] = boolstr 

def isToday(datetimeObj):
    d = datetimeObj
    n = dtdt.now()
    if d.year==n.year and d.month==n.month and d.day==n.day:
        return True
    return False

def parseISODate(datetimeStr, format="%Y-%m-%d %H:%M:%S"):
    """ Returns just time str only if datetimeStr is today, else just the date
    """ 
    try:
        dt = dateutil.parser.parse(datetimeStr)
        return dt.strftime(format)
    except:
        return datetimeStr
FILTERS['parseISODate'] = parseISODate

def compact(datetimeStr, format='%H:%M / %d-%m-%Y', onlyTimeStampForToday=True):
    """ Returns just time str only if datetimeStr is today, else just the date
    """ 
    try:
        dt = dtdt.strptime(datetimeStr, "%Y-%m-%d %H:%M:%S")
        if isToday(dt) and onlyTimeStampForToday:
            return dtdt.strftime(dt, '%I:%M:%S%p')
        else:
            return dtdt.strftime(dt, '%Y-%m-%d')
    except:
        return datetimeStr
FILTERS['compact'] = compact

def shorten(s, count):
    """ like jinja's truncate filter, but works at the char count level
    """
    try:
        return s[:count-3]+'...' if 3 < count < len(s) else s
    except:
        return s
FILTERS['shorten'] = shorten

def linebreaks(s):
    try:
        return s.replace('\n', '<br>')
    except:
        return s
FILTERS['linebreaks'] = linebreaks 

def mapto(s, mapping):
    """ Maps s to value found in mapping (dict or list of tuples) 
    """
    iter_ = mapping.items() if isinstance(mapping, dict) else mapping
    try:
        for k,v in iter_:
            if str(s) == str(k):
                return v
        return s
    except:
        return s
FILTERS['mapto'] = mapto

# html generators
def htmlalist(spec_list):
    """ Returns list of <a>'s 
    """
    return [htmla(*l) for l in linkslistgen(spec_list)]

def htmla(path, txt=None, id=None, class_=None, title=None, target=None):
    path = path if '/' in path else url_(path)
    txt = txt or path
    return HTML.tag('a', href=path, c=txt, id=id, class_=class_, title=title, target=target)

def htmla_proxy(path, txt=None, id=None, class_=None, title=None):
    """ like htmla, but appends path to admin's proxy route
    """
    href = api_server_root()+'?path='+prepend_slash(path)
    return HTML.tag('a', href=href, c=txt, id=id, class_=class_, title=title)

def htmla_(path, txt=None, id=None, class_=None, unescape=False):
    """ like htmla, but forces url_(), and allows path to be url path or
    a tuple of (path, txt).
    """
    if isinstance(path, (list, tuple)):
        if len(path) == 3:
            class_ = path[2]
        path, txt = path[0], path[1]
    txt = txt or path.capitalize()
    path = url_(path)
    if unescape:
        return HTML.tag('a', href=path, c=txt, id=id, class_=class_).unescape()
    return HTML.tag('a', href=path, c=txt, id=id, class_=class_)

def htmla_api(path, txt=None, id=None, class_=None):
    """ like htmla, but calls fix_link() to modify the api link
    """
    path = fix_link(path)
    txt = txt or path
    return HTML.tag('a', href=path, c=txt, id=id, class_=class_)

def htmldiv(txt=None, id=None, class_=None):
    return HTML.tag('div', c=txt, id=id, class_=class_)

def htmllabel(label, name_id='', class_='', labelWrapClass='label'):
    label = HTML.tag('label', for_=name_id, c=label, class_=class_)
    return label if labelWrapClass is None else HTML.tag('div', class_=labelWrapClass, c=label)

def htmlradio(label, name_id, val, class_=''):
    """ single <input type=radio> with <label>
    """
    elms=[HTML.tag('input', type_='radio', name=name_id, value=val, class_=class_)]
    elms.append(HTML.tag('label', for_=name_id, c=label))
    return '\n'.join(elms)

def htmlselect(name_id, vals=[], class_='', wrapClass=None, selected=None, **kwargs):
    """ <select> generator, wrapped in div if wrapClass is given
    @param vals: a dict/list of (value, label) pairs or list of values
    """
    if isinstance(vals, dict):
        vals = [(k,v) for k,v in vals.items()]
    s = tags.select(name_id, selected, vals, id=name_id, class_=class_, **kwargs)
    return s if wrapClass is None else HTML.tag('div', class_=wrapClass, c=s)

def htmlinput(name_id, class_='', wrapClass=None, val='', type_='text', placeholder=''):
    """ set readonly='readonly' if type_=text (retains type='text')
    """
    if type_ == 'readonly':
        txtinput = tags.text(name=name_id, id=name_id, class_=class_, value=val, readonly='readonly')
    else:
        txtinput = HTML.tag('input', type_=type_, name=name_id, id=name_id, class_=class_, value=val, placeholder=placeholder)
    return txtinput if wrapClass is None else HTML.tag('div', class_=wrapClass, c=txtinput)

def htmlfile(name_id, class_='', wrapClass=None, val=''):
    return htmlinput(name_id, class_, wrapClass, val, type_='file')

def htmltextarea(name_id='', rows=8, cols=80, class_='', val=''):
    return tags.textarea(name=name_id, id=name_id, content=val, class_=class_, cols=cols, rows=rows)

def readonlyarea(name_id, rows=8, cols=80, class_='', val=''):
    return tags.textarea(name=name_id, id=name_id, content=val, class_=class_, cols=cols, rows=rows, readonly='readonly')

def username(dict_, namekey='login', idkey='id', nulltext='N/A', truncate=0):
    """ Returns dict_[namekey] if dict_[idkey] exists, 
    returns '<auto-generated>' if dict_['defaultLogin'] == dict_[namekey],
    else return 'N/A'
    """
    d = dict_
    if not d:
        return nulltext
    if namekey == 'email':
        email = unicode(d.get(namekey))
        isAutoGen = not (d.get(namekey, None) and d.get(idkey))
        email = shorten(email, truncate)
        name = '%s (%s)' %(email,d.get(idkey))
    else:
        name = unicode(d.get(namekey))
        defaultName = d.get('defaultLogin')
        isAutoGen = defaultName and defaultName == name
        name = shorten(name, truncate)
    if d and d.get(idkey):
        # 14374 - Convert the characters "&", "<" and ">" in name to HTML-safe sequences
        # flag quote is true, to translate double-quote character ('"')
        return '&lt;auto&#8209;generated&gt;' if isAutoGen else cgi.escape(name, True) or nulltext
    return nulltext

def icon_for(what):
    if what.startswith('full'):
        return ' <span class="nowrap">&nbsp;<img src="%s" class="opennew">&nbsp;</span>' % url_images('transparent.gif')
    elif what.startswith('pane'):
        return ' <span class="nowrap">&nbsp;<img src="%s" class="openpane" data-viewmode="pane">&nbsp;</span>' % url_images('icon_openpane.png')
    else:
        return ''

comma_sp = re.compile(',\s*')
def userlink(dict_, namekey='login', idkey='id', nulltext='N/A', viewmode='full', 
    icon='', truncate=0):
    """ Returns htmla_() for user's profile link using username().
    @str namekey: key to get text to display on link eg. dict_[namekey],
    @str idkey:   key to get id eg. dict_[idkey]
    """
    d = dict_
    if not d:
        return nulltext
    id = d.get(idkey)
    paramStr = '' if viewmode=='full' else '?viewmode='+viewmode
    href = '/user/profile/'+str(id)+paramStr
    disp = icon_for(icon) or username(d, namekey, idkey, nulltext, truncate)
    cls = 'paneview' if viewmode=='pane' else ''
    return htmla_(href, disp, class_=cls, unescape=True) if id else nulltext

def userlink2(dict_, namekey='login', idkey='id', nulltext='N/A', 
    viewmodes=[], truncate=0):
    """ Returns 2 userlinks.  
    viewmodes: list or comma separated str of link1 & 2's viewmodes to override
    link_viewmodes_order defined in options.py
    """
    viewmodes = viewmodes or options.link_viewmodes_order
    if isinstance(viewmodes, str):
        viewmodes = comma_sp.split(viewmodes)
    viewmode0 = viewmodes[0] if len(viewmodes) > 0 else '' 
    viewmode1 = viewmodes[1] if len(viewmodes) > 1 else '' 
    return '%s %s' % (userlink(dict_, namekey, idkey, nulltext, viewmode0, '', truncate),
     userlink(dict_, namekey, idkey, nulltext, viewmode1, viewmode1, truncate))

def idlink(path, dict_, textkey='', idkey='id', alttext='', class_='', 
    nulltext='N/A', viewmode='full', icon='', addslash=True):
    """ Like userlink(), but more generic, allowing path to be specified.
    @str path: link path, starting and ending slash will be added if not included.
    @str textkey: key to get text to display on link eg. dict_[textkey],
                  ignored or can leave empty if want to use only alttext
    @str idkey:   key to get id(or unique identifier) eg. dict_[idkey]
    @str alttext: alternative text to display instead of text from textkey
    """
    d = dict_
    paramStr = '' if viewmode=='full' else '?viewmode='+viewmode
    cls = ' paneview' if viewmode=='pane' else ''
    if d and d.get(idkey):
        text = alttext or (unicode(d.get(textkey) or nulltext) if textkey else nulltext)
        disp = icon_for(icon) or html_escape(text)
        if addslash:
            path = add_slashes(path)
        return htmla_(path+str(d.get(idkey))+paramStr, disp, class_=class_+cls, unescape=True)
    return nulltext

def idlink2(path, dict_, textkey='', idkey='id', alttext='', class_='', 
    nulltext='N/A', viewmodes=[], addslash=True):
    """ Returns 2 idlinks.
    viewmodes: list or comma separated str of link1 & 2's viewmodes to override
    link_viewmodes_order defined in options.py
    """
    viewmodes = viewmodes or options.link_viewmodes_order
    if isinstance(viewmodes, str):
        viewmodes = comma_sp.split(viewmodes)
    viewmode0 = viewmodes[0] if len(viewmodes) > 0 else '' 
    viewmode1 = viewmodes[1] if len(viewmodes) > 1 else '' 
    return '%s %s' % (
     idlink(path, dict_, textkey, idkey, alttext, class_, nulltext, viewmode0, addslash=addslash),
     idlink(path, dict_, textkey, idkey, alttext, class_, nulltext, viewmode1, viewmode1, addslash=addslash) )

def id_in_parens(dict_, idkey='id', label='User ID:', nulltext=''):
    """ Like idlink(), but returns '( <label> id(in str) )' instead
    """
    d = dict_
    if d and d.get(idkey):
        return ' ( %s %s )' % (label, str(d.get(idkey)))
    return nulltext

# labeled html generators, all should have starting signature of:
#  (label, name_id, values, class_ or wrapClass) OR
#  (label, name_id, class_, value) depending on usage

def labelselect(label, name_id, label_vals=[], class_='', wrapClass=None,
                selected=None, labelWrapClass='label', **kwargs):
    elms = [htmllabel(label, name_id, labelWrapClass)]
    elms.append( htmlselect(name_id, label_vals, class_, wrapClass, selected, **kwargs))
    return '\n'.join(elms)

def labelinput(label, name_id, class_='', wrapClass=None, val='', labelWrapClass='label', type_='text', placeholder=''):
    """ labeled <input>, set readonly='readonly' if type_=text (retains type='text')
    """
    label = htmllabel(label, name_id, labelWrapClass)
    txtinput = htmlinput(name_id, class_, wrapClass, val, type_, placeholder)
    return '\n'.join([label, txtinput])

def labelfile(label, name_id, class_='', wrapClass=None, val='', labelWrapClass='label'):
    """ labeled <input>, type_=file
    """
    return labelinput(label, name_id, class_, wrapClass, val, labelWrapClass, 'file')

def labeltextarea(label, name_id, rows=8, cols=80, class_='', val='', labelWrapClass='label', readonly=False):
    label = htmllabel(label, name_id, labelWrapClass)
    if readonly:
        txtarea = tags.textarea(name=name_id, id=name_id, content=val, class_=class_, cols=cols, rows=rows, readonly='readonly')
    else:
        txtarea = tags.textarea(name=name_id, id=name_id, content=val, class_=class_, cols=cols, rows=rows)
    return '\n'.join([label, txtarea])

def labelreadonlyarea(label, name_id, rows=8, cols=80, class_='', val='', labelWrapClass='label'):
    return labeltextarea(label, name_id, rows, cols, class_, val, labelWrapClass, True)

def labelradio(label, name_id, vals=[], wrapClass='', class_='', labelWrapClass='label'):
    """ labeled <radio>, wrapped in fieldset if wrapClass is not None
    @param vals: a list of values or (value, label) pairs
    """
    elms = [htmllabel(label, name_id, labelWrapClass)]
    if wrapClass is not None:
        elms.append('<fieldset id="%s" class="%s">' % (name_id, wrapClass))
    for val in vals:
        if isinstance(val, (list, tuple)):
            elms.append(htmlradio(val[1], name_id, val[0], class_))
        else:
            elms.append(htmlradio(unicode(val).title(), name_id, val, class_))
    if wrapClass is not None:
        elms.append('</fieldset>')
    return '\n'.join(elms)

def labelcheckbox(label, name_id, checked=False, val='true', eid=None):
    """ Returns <input type='checkbox'><label>label</label>
    """
    if checked:
        if eid:
            ckbox = HTML.tag('input', type_='checkbox', name=name_id, id=name_id, checked='checked', value=val, eid=eid)
        else:
            ckbox = HTML.tag('input', type_='checkbox', name=name_id, id=name_id, checked='checked', value=val)
    else:
        if eid:
            ckbox = HTML.tag('input', type_='checkbox', name=name_id, id=name_id, value=val, eid=eid)
        else:
            ckbox = HTML.tag('input', type_='checkbox', name=name_id, id=name_id, value=val)
    label = HTML.tag('label', for_=name_id, c=label)
    return ckbox+label 

def labelcheckboxes(label, checkboxes_spec, fieldsetClass='', labelWrapClass='label'):
    """ Returns labeled set of checkboxes 
    @list checkboxes_spec: list of params to pass to labelcheckbox()
    """
    elms = [htmllabel(label, '', labelWrapClass)]
    elms.append('<fieldset class="%s">' % fieldsetClass)
    if len(checkboxes_spec) > 0 and isinstance(checkboxes_spec[0], (list, tuple)):
        for spec in checkboxes_spec:
            elms.append(labelcheckbox(*spec))
    else: # single list
        elms.append(labelcheckbox(*checkboxes_spec))
    elms.append('</fieldset>')
    return '\n'.join(elms)

def labelreadonly(label, name_id, class_='', val='', wrapClass=None, labelWrapClass='label'):
    """ wrapper for labelinput(), setting readonly='readonly'
    """
    return labelinput(label, name_id, class_, wrapClass, val, labelWrapClass, type_='readonly')

def labeldiv(label, val='', class_='', name_id='', wrapClass=None, labelWrapClass='label'):
    """ unescape() is needed to include &nbsp; and links in div content, which
    will render <> strings to be emtpy.  Will either need to pass a
    'safe' param to bypass unescape() or need to escape input if possible
    """
    label = htmllabel(label, name_id, labelWrapClass)
    div = HTML.tag('div', name=name_id, id=name_id, class_=class_, c=val).unescape()
    div = div if not wrapClass else HTML.tag('div', class_=wrapClass, c=div)
    return '\n'.join([label, div])

def submitbutton(label, class_='', id='', name=''):
    class_ += ' btn primaryaction floatright'
    return HTML.tag('input', value=label, class_=class_, id=id, name=name, type_='submit')

def cancelbutton(url='', class_=''):
    class_ += ' btn cancelbtn floatright'
    url = "location.href='%s'" % url if url else ''
    return HTML.tag('input', value='Cancel', class_=class_, type_='button', onclick=url)

def deletebutton(label, class_='', id='delete'):
    class_ += ' btn deletebtn floatright'
    return HTML.tag('input', value=label, class_=class_, id=id, type_='button')

def hide_if_full(s):
    return 'hide' if not s or s=='full' else ''

def hide_if_pane(s):
    return 'hide' if s=='pane' else ''

def _generateHash(name):
    m = hashlib.sha224()
    m.update(name)
    m.update(str(int(time.time() * 1000)))
    new_hash = m.hexdigest()
    return new_hash

def getGoogleAuthURL():
    """
    Get the Google autherization URL.
    """
    try:
        params = {'isAdmin': '1'}
        status = makeGetCall('get/authURL/google', params=params)
    except Exception, e:
        LOG.info(e)
        return ''
    if status and 'response' in status:
        return status['response']['googleAuthURL']

def safe_encode(s):
    if s and type(s).__name__ == 'unicode':
        return s.encode('utf-8')
    return s

def safe_decode(s):
    if s and type(s).__name__ == 'str':
        return s.decode('utf-8')
    return s


def getSchoolStates():
    """
    Get the School states.
    """
    states = []
    try:
        response = makeGetCall('flx/get/school/counts', {})
        responseHeader = response['responseHeader']
        if responseHeader and responseHeader['status'] != 0:
            raise Exception("Exception:%s" % response['response']['message'])
        school_counts = response['response']['schoolCounts']
        tmp_states = [school_info['_id'] for school_info in school_counts]
        tmp_states = filter(None, tmp_states)
        tmp_states.sort()
        states = [(state.lower().replace(' ', '_'), state.title()) for state in tmp_states]
    except RemoteAPIStatusException, e:
        LOG.exception(e)
        set_error(e)
    except Exception, e:
        LOG.exception(e)
        set_error(e)
    return states

class objectview(object):
    def __init__(self, d):
        self.__dict__ = d
