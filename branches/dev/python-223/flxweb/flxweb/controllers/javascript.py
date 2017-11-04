import logging
import simplejson
import codecs
import os
import re

from pylons import config, request, response, tmpl_context as c

from flxweb.lib.base import BaseController, render
from flxweb.lib.helpers import url
from pylons.controllers.util import etag_cache
from flxweb.lib.ck12.context_functions import version_info
from pylons.templating import render_jinja2
from flxweb.model.browseTerm import BrowseManager

log = logging.getLogger(__name__)

class JavascriptController(BaseController):

    def settings(self, anything):
        #TODO: add cache expiry headers
        etag_cache('ck12-js-settings-%s' % version_info(c))
        tinymce_use_gzip = config.get('tinymce_use_gzip','false') == 'true'
        if tinymce_use_gzip:
            tinymce_script_url = url('tinymce_gzip')
            tinymce4_script_url = url('tinymce4_gzip')
            tinymce_ck12_plugins = config.get('tinymce_ck12_plugins')
            tinymce4_ck12_plugins = config.get('tinymce4_ck12_plugins')
            tinymce_create_exercise_plugins = config.get('tinymce_create_exercise_plugins')
        else:
            url_lib = config.get('url_lib','/media/lib/')
            tinymce_script_url = '%s/tinymce/jscripts/tiny_mce/tiny_mce.js' % url_lib
            tinymce4_script_url = '%s/tinymce4/js/tinymce/tinymce.min.js' % url_lib
            tinymce_ck12_plugins = ', '.join([ '-%s'%plugin.strip() for plugin in config.get('tinymce_ck12_plugins').split(',') ])
            tinymce4_ck12_plugins = ', '.join([ '-%s'%plugin.strip() for plugin in config.get('tinymce4_ck12_plugins').split(',') ])
            tinymce_create_exercise_plugins = ', '.join([ '-%s'%plugin.strip() for plugin in config.get('tinymce_create_exercise_plugins').split(',') ])
        c.tinymce_use_gzip =  simplejson.dumps( tinymce_use_gzip )

        c.tinymce_script_url = tinymce_script_url
        c.tinymce4_script_url = tinymce4_script_url

        c.tinymce_default_plugins = config.get('tinymce_default_plugins')
        c.tinymce4_default_plugins = config.get('tinymce4_default_plugins')

        c.tinymce_ck12_plugins = tinymce_ck12_plugins
        c.tinymce4_ck12_plugins = tinymce4_ck12_plugins

        c.tinymce_create_exercise_plugins = tinymce_create_exercise_plugins
        c.tinymce_ck12_plugins_url = config.get('tinymce_ck12_plugins_url')
        c.tinymce4_ck12_plugins_url = config.get('tinymce4_ck12_plugins_url')
        c.edit_allowed_roles = config.get('edit_allowed_roles')
        response.headers['Content-Type'] = 'application/x-javascript; charset=utf-8'
        if anything == 'purejs':
            return render('flxweb.settings.purejs.js')
        return render('flxweb.settings.js')

    def theme(self):  	
    	if config['hosts'] == 'www.ck12.org':
    		browseTerm = BrowseManager.getConceptGrid()
	    	subjects = []
	    	if browseTerm:
		    	for subject in browseTerm['children']:
		            subjects.append(subject)
	        c.subjects = subjects
        	return render_jinja2('errors/404.html')
        c.icon_classes = []
        rIcon = re.compile('^\.(.*):')
        _file = codecs.open( os.path.join(config['here'], 'flxweb/public/media/common/css/fontck12.css'), 'r', encoding='utf-8' )
        lines = _file.readlines()
        _file.close();
        match = None
        for line in lines:
            match = rIcon.search(line)
            if match:
                c.icon_classes.append(match.group(1))

        c.theme = request.params.get('theme','uikit')
        return render_jinja2('uikit/index.html')
