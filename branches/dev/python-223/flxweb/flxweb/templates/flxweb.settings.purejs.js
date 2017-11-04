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

    (function(window){
        var __settings__ = {
                'webroot_url': "{{h.url('/',qualified='True')}}",
                //Max size 25 MB = 25*1024*1024
                'attachment_max_upload_size': "26214400",
                'webroot_url_relative': "{{config.webroot_url}}",
                'url_media': "{{config.url_media}}",
                'artifact_data_endpoint': "{{config.webroot_url}}ajax/data/artifact/",
                'cdn_cache_endpoint': "{{config.cdn_cache_endpoint}}",
                'math_endpoint': "/flx/math/",
                'math_preview_endpoint': "{{config.webroot_url}}preview/math/",
                'resource_upload_endpoint': "{{config.webroot_url}}ajax/resource/upload/",
                'embedded_object_create_endpoint': "{{config.webroot_url}}ajax/create/embeddedobject/",
                'embedded_object_get_endpoint': "{{config.webroot_url}}ajax/get/embeddedobject/",
                'render_resource_perma_endpoint': "/flx/show",
                'ck12_login_cookie': "{{ config.ck12_login_cookie}}",
                'tinymce': {
                    'use_gzip': '{{ c.tinymce_use_gzip }}' === 'true',
                    'script_url': '{{ c.tinymce_script_url }}',
                    'ck12_plugins': "{{ c.tinymce_ck12_plugins }}",
                    'create_exercise_plugins': "{{ c.tinymce_create_exercise_plugins }}",
                    'ck12_plugins_url': '{{ c.tinymce_ck12_plugins_url }}'
                },
                'edit_allowed_roles': "{{ c.edit_allowed_roles }}",
                'jstree_stylesheet_directory': "{{ h.url_lib('jquery-plugins') }}/themes/default/style.css",
                'taxonomy_api_server': "{{ config.taxonomy_api_server }}",
                'flx_core_api_server': "{{ config.flx_core_api_server }}",
                'getreal_contribution_enabled': "{{ config.getreal_contribution_enabled }}",
                'auth_root_url':  "{{config.flx_auth_api_server|replace('/auth','', 1) }}",
                'auth_login_provider_verification_urls': {
                    "twitter" : "{{config.flx_auth_api_server}}/verify/member/twitter",
                    "facebook" : "{{config.flx_auth_api_server}}/verify/member/facebook",
                    "google" : "{{config.flx_auth_api_server}}/verify/member/google",
                    "live" : "{{config.flx_auth_api_server}}/verify/member/live",
                    "azure" : "{{config.flx_auth_api_server}}/verify/member/azure"
                },
                'auth_login_url': "{{config.flx_auth_api_server}}/login/member/",
                'ads_logging_api': "{{config.ads_logging_api}}",
                'fbs_client_id': "{{config.fbs_client_id}}"
        };
    	function extend(target, x) {
    	       for(var key in x){
    	    	   if(x.hasOwnProperty(key)){
    	    		   target[key] = x[key];
    	    	   }
    	       }
    	}
    	
    	if(!window.flxweb_settings){
    		window.flxweb_settings = {};
    		extend(window.flxweb_settings, __settings__);
    	}
    }(window));
