import logging
#import simplejson

#from pylons import config
#from pylons import tmpl_context as c
from pylons import response

from auth.lib.base import BaseController, render
#from auth.lib.helpers import url, url_lib

log = logging.getLogger(__name__)

class JavascriptController(BaseController):

    def settings(self):
        """
        #TODO: add cache expiry headers
        tinymce_use_gzip = config.get('tinymce_use_gzip','false') == 'true'
        if tinymce_use_gzip:
            tinymce_script_url = url('tinymce_gzip')
            tinymce_ck12_plugins = config.get('tinymce_ck12_plugins')
            tinymce_create_exercise_plugins = config.get('tinymce_create_exercise_plugins')
        else:
            tinymce_script_url = url_lib('tinymce/jscripts/tiny_mce/tiny_mce.js')
            tinymce_ck12_plugins = ', '.join([ '-%s'%plugin.strip() for plugin in config.get('tinymce_ck12_plugins').split(',') ])
            tinymce_create_exercise_plugins = ', '.join([ '-%s'%plugin.strip() for plugin in config.get('tinymce_create_exercise_plugins').split(',') ])        
        c.tinymce_use_gzip =  simplejson.dumps( tinymce_use_gzip )
        c.tinymce_script_url = tinymce_script_url
        c.tinymce_ck12_plugins = tinymce_ck12_plugins
        c.tinymce_create_exercise_plugins = tinymce_create_exercise_plugins
        c.tinymce_ck12_plugins_url = url_lib('ck12-tinymce-plugins/')
        """
        
        response.headers['Content-Type'] = 'application/x-javascript; charset=utf-8'
        return render('flx.settings.js')
