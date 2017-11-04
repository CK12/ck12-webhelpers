/**
* Copyright 2007-2011 CK-12 Foundation
*
* All rights reserved
*
*
* Unless required by applicable law or agreed to in writing, software
* distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
* WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
* License for the specific language governing permissions and limitations.
*
* This file originally written by Nachiket Karve
*
* $Id$
*/

function configureFlxwebSettings(window){
    var webroot_url = window.location.protocol + '//' + window.location.hostname + '/';
    var API_PREFIX = '__API_PREFIX__';
    var CDN_HOSTNAME = '__CDN_HOSTNAME__';
    var CDN_ENABLED = '__CDN_ENABLED__';
    var MEDIA_PATH = '__MEDIA_PATH__';
    var AUTH_COOKIE = '__AUTH_COOKIE__';
    var TAXONOMY_SERVER = '__TAXONOMY_SERVER__';
    var CDN_API_CACHE = '__CDN_API_CACHE__';
    var CDN_API_VERSION = '__CDN_API_VERSION__';

    //if values above are not configured, pick the defaults
    if (API_PREFIX === '__API_PREFIX__'){ API_PREFIX = '/'; }
    if (CDN_HOSTNAME === '__CDN_HOSTNAME__'){ CDN_HOSTNAME = ''; }
    if (MEDIA_PATH === '__MEDIA_PATH__'){ MEDIA_PATH = '/media'; }
    CDN_ENABLED = (CDN_ENABLED.toLowerCase() === 'true');
    if (AUTH_COOKIE === '__AUTH_COOKIE__'){
        if (API_PREFIX === '/'){
            //if api prefix is /, it's safe to assume that the backend is on same
            AUTH_COOKIE = 'auth-' + window.location.host.split('.')[0];
        } else {
            AUTH_COOKIE = 'auth-' + /(http[s]?:\/\/)?(.*?)\.ck12\.org/.exec(API_PREFIX)[2];
        }
    }
    if (TAXONOMY_SERVER === '__TAXONOMY_SERVER__'){
        TAXONOMY_SERVER = 'http://chaplin.ck12.org/taxonomy';
    }
    if (CDN_API_CACHE === '__CDN_API_CACHE__') {
        CDN_API_CACHE = window.location.host;
    }

    if (CDN_API_VERSION === '__CDN_API_VERSION__') {
        CDN_API_VERSION = 1;
    }

    var AUTH_PREFIX = API_PREFIX + '/auth';
    var URL_MEDIA = ''; //finally, construct url_media
    if (CDN_ENABLED && CDN_HOSTNAME){
        URL_MEDIA += window.location.protocol + '//' + CDN_HOSTNAME;
    }
    URL_MEDIA += MEDIA_PATH;

    window.toggleForOldAPI =    window.toggleForOldAPI || (localStorage.getItem('toggleForOldAPI') == "true"); // ADDED BY @Pratyush: THIS IS FOR TOGGLE FLAG  BETWEEN OLD API AND NEW SAVE API.

    var __settings__ = {
        'webroot_url': webroot_url,
        //Max size 25 MB = 25*1024*1024
        'attachment_max_upload_size': '26214400',
        'webroot_url_relative': '/',
        'url_media': URL_MEDIA,
        'artifact_data_endpoint': '/ajax/data/artifact/',
        'artifact_save_api_endpoint':'/flx/artifact/save',
        'math_endpoint': '/flx/math/',
        'math_preview_endpoint': '/preview/math/',
        'resource_upload_endpoint': '/ajax/resource/upload/',
        'embedded_object_create_endpoint': '/ajax/create/embeddedobject/',
        'embedded_object_get_endpoint': '/ajax/get/embeddedobject/',
        'render_resource_perma_endpoint': '/flx/show',
        'ck12_login_cookie': AUTH_COOKIE,
        // TODO: move tinyMCE config out of this file
        'tinymce': {
            'use_gzip': 'true',
            'script_url': '/compressor/tinymce_gzip/',
            'script4_url': '/compressor/tinymce4_gzip/',
            'default_plugins': 'pagebreak, xhtmlxtras, autolink, save, inlinepopups, lists, advlist, advimage, advlink, paste, contextmenu, fullscreen',
            'default_plugins4': 'code, fullpage, hr, insertdatetime, nonbreaking, lists, paste, preview, save, searchreplace, tabfocus, visualblocks, visualchars, wordcount',
            'ck12_plugins': "matheditor, ck12image, ck12rosetta, ck12paste, ck12embed, elementbox, ck12autoresize, ck12table, ck12indent, ck12definitionlist, ck12link, ck12validator, ck12spellchecker",
            'ck12_plugins4': "autolink, ck12image, ck12advlist, ck12contextmenu, ck12charmap, ck12fullscreen, matheditor, ck12rosetta, ck12pagebreak, ck12paste, ck12embed, elementbox, ck12autoresize, ck12table, ck12color, ck12definitionlist, ck12link, ck12validator, ck12indent, ck12spellchecker, ck12alignment, ck12eventmanager",
            'create_exercise_plugins': "mathimage, matheditor, ck12image, ck12rosetta, ck12paste, ck12embed, ck12autoresize, ck12table, ck12indent, ck12spellchecker",
            'ck12_plugins_url': '/media/lib/ck12-tinymce-plugins/',
            'ck12_plugins4_url': '/media/lib/ck12-tinymce4-plugins/',
        },
        'edit_allowed_roles': 'author,admin,content-admin,support-admin,content-de-author-admin',
        'jstree_stylesheet_directory': '/media/lib/jquery-plugins/themes/default/style.css',
        'taxonomy_api_server': TAXONOMY_SERVER,
        'flx_core_api_server': API_PREFIX + '/flx',
        'auth_root_url':  API_PREFIX + '',
        'auth_login_provider_verification_urls': {
            'twitter' : AUTH_PREFIX + 'verify/member/twitter',
            'facebook' : AUTH_PREFIX + 'verify/member/facebook',
            'google' : AUTH_PREFIX + 'verify/member/google',
            'live' : AUTH_PREFIX + 'verify/member/live'
        },
        'auth_login_url': AUTH_PREFIX + 'login/member/',
        'ads_logging_api': '/dexter/record/event',
        'fbs_client_id': '24839961',
        'cdn_api_cache': CDN_API_CACHE,
        'cdn_api_version' : CDN_API_VERSION
    };

    return __settings__;
}

function extend(target, x) {
    for(var key in x){
        if(x.hasOwnProperty(key)){
            target[key] = x[key];
        }
    }
}

(function (root, factory) {
    var settings = factory(root);
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'],function ($) {
            // create $.flxweb.settings for use in flxweb
            $.flxweb = $.flxweb || {};
            $.extend(true, $.flxweb, {
                'settings': settings
            });
            return settings;
        });
    } else {
        // Create browser global flxweb_settings for use in assessment
        if(!window.flxweb_settings){
            window.flxweb_settings = {};
            extend(window.flxweb_settings, settings);
        }
    }
}(this, configureFlxwebSettings));
