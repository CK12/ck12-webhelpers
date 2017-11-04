# -- coding: utf-8 --
#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Ravi Gidwani
#
# $Id$

from decorator import decorator
from pylons import session,  request,app_globals as g, tmpl_context as c
from pylons.controllers.util import redirect, abort
from flxweb.lib.helpers import auth_signin_url
from pylons.templating import render_jinja2
import logging
from datetime import datetime

log = logging.getLogger(__name__)

def login_required ():
    def wrapper( func, self, *args, **kwargs ):
        user = session.get( 'user' )
        if user is None:
            # get the auth_signin_url
            c.login_url = auth_signin_url(hash=True)
            if c.login_url:
                return render_jinja2 ("/account/auth_redirect.html")
            else:
                abort( 401 )
        return func( self, *args, **kwargs )
    return decorator( wrapper )

def ajax_login_required ():
    def wrapper( func, self, *args, **kwargs ):
        user = session.get( 'user' )
        if user is None:
            abort( 401 )
        return func( self, *args, **kwargs )
    return decorator( wrapper )


def ck12_add_nocache():
    def wrapper( func, self, *args, **kwargs ):
        #TODO: Only admin users will be able to clean the cache
        if 'nocache' in request.params:
            if '_arg_namespace' in func.func_dict:
                log.debug('Invalidating the cache region for')
                log.debug('%s%s' % (func.func_dict['_arg_namespace'],args))
            g.cache.region_invalidate(func,None,*args,**kwargs)
        return func( self, *args, **kwargs )
    return decorator( wrapper )

def admin_required ():
    def wrapper( func, self, *args, **kwargs ):
        user = session.get( 'user' )
        # get the auth_signin_url
        login_url = auth_signin_url(hash=True) 

        if user is None:
            if login_url:
                redirect( login_url, code=302 )
                return
            else:
                abort( 401 )
        elif not user.isAdmin():
            abort(401)

        return func( self, *args, **kwargs )
    return decorator( wrapper )


def ck12_cache_region(region,*deco_args,**deco_kwargs):
    """
    Modified version of the beaker cache_region decorator.
    We add a support for nocache parameter which will fetch
    the latest data and replace it in the cache.
    Return a caching function decorator.
    """
    import beaker.util as util
    from beaker.exceptions import BeakerException
    from beaker.cache import cache_regions,Cache
    from beaker.crypto.util import sha1
    cache = [None]

    def decorate(func):
        namespace = util.func_namespace(func)
        skip_self = util.has_self_arg(func)
        def cached(*args):
            if not cache[0]:
                if region is not None:
                    if region not in cache_regions:
                        raise BeakerException(
                            'Cache region not configured: %s' % region)
                    reg = cache_regions[region]
                    if not reg.get('enabled', True):
                        return func(*args)
                    cache[0] = Cache._get_cache(namespace, reg)
                else:
                    raise Exception("'manager + kwargs' or 'region' "
                                    "argument is required")

            if skip_self:
                try:
                    cache_key = " ".join(map(str, deco_args + args[1:]))
                except UnicodeEncodeError:
                    cache_key = " ".join(map(unicode, deco_args + args[1:]))
            else:
                try:
                    cache_key = " ".join(map(str, deco_args + args))
                except UnicodeEncodeError:
                    cache_key = " ".join(map(unicode, deco_args + args))
            if region:
                key_length = cache_regions[region]['key_length']
            else:
                key_length =  250
            if len(cache_key) + len(namespace) > key_length:
                cache_key = sha1(cache_key).hexdigest()
            def go():
                return func(*args)

            invalidation_key = None
            if 'invalidation_key' in deco_kwargs:
                invalidation_key = deco_kwargs['invalidation_key']
            if 'nocache' in request.params\
                and ( (not invalidation_key) or \
                ('key' in request.params and invalidation_key == request.params.get('key') )):
                data = go()
                cache[0].set_value(cache_key,data)
                return data
            else:
                return cache[0].get_value(cache_key, createfunc=go)
        cached._arg_namespace = namespace
        if region is not None:
            cached._arg_region = region
        return cached
    return decorate

@decorator
def trace(func, *args, **kwargs):
    name = func.__name__
    start = datetime.now()
    log.debug('>>> Entering %s' % name)
    try:
        return func(*args, **kwargs)
    finally:
        end = datetime.now()
        time = end - start
        log.debug('<<< Exiting  %s, took %s' % (name, time))
