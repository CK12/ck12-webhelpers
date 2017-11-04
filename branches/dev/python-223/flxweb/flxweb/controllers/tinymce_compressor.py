"""
Based on "TinyMCE Compressor PHP" from MoxieCode.

http://tinymce.moxiecode.com/

Copyright (c) 2008 Jason Davies
Licensed under the terms of the MIT License (see LICENSE.txt)
"""

import logging
from datetime import datetime
import os
import gzip
import StringIO
from pylons import config, request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect, etag_cache
from flxweb.lib.ck12.context_functions import version_info

from flxweb.lib.base import BaseController, render

log = logging.getLogger(__name__)

class TinymceCompressorController(BaseController):

    def gzip_compressor(self):
        etag_cache("ck12-tinymce-gzip-%s" % version_info(c))
        server_name = request.host_url
        media_url_lib = config.get('url_lib')
        JS_URL = '%s%stinymce/jscripts/tiny_mce/tiny_mce.js' % (server_name,config.get('url_lib'))
        JS_BASE_URL = JS_URL[:JS_URL.rfind('/')]

        tiny_mce_path = config.get('tinymce_path')
        ck12_tiny_mce_plugin_path =  config.get('tinymce_ck12_plugin_path')

        # TinyMCE settings
        plugins = self.split_commas(request.GET.get("plugins", ""))
        languages = self.split_commas(request.GET.get("languages", ""))
        themes = self.split_commas(request.GET.get("themes", ""))
        isJS = request.GET.get("js", "") == "true"
        compress = request.GET.get("compress", "true") == "true"
        suffix = request.GET.get("suffix", "") == "_src" and "_src" or ""

        # Add ck12 plugins here
        ck12plugins = [ plugin.strip() for plugin in config.get('tinymce_ck12_plugins').split(',') ]

        content = []
        response.headers['Content-type'] = "text/javascript"
        now = datetime.utcnow()
        response.headers['Date'] = now.strftime('%a, %d %b %Y %H:%M:%S GMT')

        # Add core, with baseURL added
        content.append( self.get_file_contents("%stiny_mce%s.js" % (tiny_mce_path,suffix)) )

        # Patch loading functions
        content.append("tinyMCE_GZ.start();")

        # Add core languages
        for lang in languages:
            content.append(self.get_file_contents("%slangs/%s.js" % (tiny_mce_path,lang)))

        # Add themes
        for theme in themes:
            content.append(self.get_file_contents("%sthemes/%s/editor_template%s.js"
                    % (tiny_mce_path, theme, suffix)))

            for lang in languages:
                content.append(self.get_file_contents("%sthemes/%s/langs/%s.js"
                        % (tiny_mce_path, theme, lang)))

        # Add plugins
        for plugin in plugins:
            if not plugin.strip() in ck12plugins:
                content.append(self.get_file_contents("%splugins/%s/editor_plugin%s.js"
                        % (tiny_mce_path, plugin.strip(), suffix)))

            for lang in languages:
                content.append(self.get_file_contents("%splugins/%s/langs/%s.js"
                        % (tiny_mce_path, plugin.strip(), lang)))

        # Add ck12 plugins
        for plugin in ck12plugins:
            log.debug("Compressing plugin %s" % plugin)
            content.append(self.get_file_contents("%s%s/editor_plugin%s.js"
                    % (ck12_tiny_mce_plugin_path, plugin, suffix)))

            for lang in languages:
                content.append(self.get_file_contents("%s%s/langs/%s.js"
                    % (ck12_tiny_mce_plugin_path, plugin, lang)))

        # Restore loading functions
        content.append("tinyMCE_GZ.end();")

        content = self.compress_string(''.join(content))
        response.headers['Content-Encoding'] = 'gzip'
        response.headers['Content-Length'] = str(len(content))
        timeout = 3600 * 24 * 10
        response.age = timeout
        return content

    def gzip_compressor4(self):
        etag_cache("ck12-tinymce-gzip-%s" % version_info(c))
        server_name = request.host_url
        media_url_lib = config.get('url_lib')
        JS_URL = '%s%stinymce4/js/tinymce/tinymce.min.js' % (server_name,config.get('url_lib'))
        JS_BASE_URL = JS_URL[:JS_URL.rfind('/')]
        tiny_mce_path = config.get('tinymce4_path')
        ck12_tiny_mce_plugin_path = config.get('tinymce4_ck12_plugin_path')

        # TinyMCE settings
        plugins = self.split_commas(request.GET.get("plugins", ""))
        languages = self.split_commas(request.GET.get("languages", ""))
        themes = self.split_commas(request.GET.get("themes", ""))
        isJS = request.GET.get("js", "") == "true"
        compress = request.GET.get("compress", "true") == "true"
        suffix = request.GET.get("suffix", "") == ".min" and ".min" or ""

        # Add default plugins here
        defaultPlugins = [ plugin.strip() for plugin in config.get('tinymce4_default_plugins').split(',') ]

        # Add ck12 plugins here
        ck12plugins = [ plugin.strip() for plugin in config.get('tinymce4_ck12_plugins').split(',') ]

        content = []
        response.headers['Content-type'] = "text/javascript"
        now = datetime.utcnow()
        response.headers['Date'] = now.strftime('%a, %d %b %Y %H:%M:%S GMT')

        # Add core, with baseURL added
        content.append( self.get_file_contents("%stinymce%s.js" % (tiny_mce_path, suffix)) )
        # Patch loading functions
        content.append("tinyMCE_GZ.start();")

        # Add core languages
        for lang in languages:
            content.append(self.get_file_contents("%slangs/%s.js" % (tiny_mce_path,lang)))

        # Add themes
        for theme in themes:
            content.append(self.get_file_contents("%sthemes/%s/theme%s.js"
                    % (tiny_mce_path, theme, suffix)))

            for lang in languages:
                content.append(self.get_file_contents("%sthemes/%s/langs/%s.js"
                        % (tiny_mce_path, theme, lang)))

        # Add plugins
        for plugin in plugins:
            if plugin.strip() in defaultPlugins and not plugin.strip() in ck12plugins:
                content.append(self.get_file_contents("%splugins/%s/plugin%s.js"
                        % (tiny_mce_path, plugin.strip(), suffix)))

            for lang in languages:
                content.append(self.get_file_contents("%splugins/%s/langs/%s.js"
                        % (tiny_mce_path, plugin.strip(), lang)))

        # Add ck12 plugins
        for plugin in ck12plugins:
            content.append(self.get_file_contents("%s%s/plugin%s.js"
                    % (ck12_tiny_mce_plugin_path, plugin, suffix)))

            for lang in languages:
                content.append(self.get_file_contents("%s%s/langs/%s.js"
                    % (ck12_tiny_mce_plugin_path, plugin, lang)))

        # Restore loading functions
        content.append("tinyMCE_GZ.end();")

        content = self.compress_string(''.join(content))
        response.headers['Content-Encoding'] = 'gzip'
        response.headers['Content-Length'] = str(len(content))
        timeout = 3600 * 24 * 10
        response.age = timeout
        return content

    def compress_string(self, content):
        buffer = StringIO.StringIO()
        output = gzip.GzipFile(
            mode='wb',
            compresslevel=9,
            fileobj=buffer
        )
        output.write(content)
        output.close()
        result = buffer.getvalue()
        return result

    def get_file_contents(self, filepath):
        try:
            if os.path.exists(filepath):
                f = open(filepath)
                content = f.read()
                #content = content.replace('\n','')
                return content
            else:
                return ""
        except Exception as e:
            return ""

    def split_commas(self, str):
        if str == '':
            return []
        return str.split(",")
