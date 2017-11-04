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

(function($){
    var settings = {
        'webroot_url' : "{{h.url('/',qualified='True')}}",
        'webroot_url_relative' : "{{config.web_prefix_url}}",
        'artifact_data_endpoint' : "{{config.web_prefix_url}}ajax/data/artifact/",
        'math_endpoint' : "/flx/math/",
        'math_preview_endpoint' : "{{config.web_prefix_url}}preview/math/",
        'resource_upload_endpoint' : "{{config.web_prefix_url}}resource/upload/",
        'render_resource_perma_endpoint' : "/flx/render/perma/resource",
        'tinymce':{
            'use_gzip' : '{{ c.tinymce_use_gzip }}' === 'true',
            'script_url':'{{ c.tinymce_script_url }}',
            'ck12_plugins': "{{ c.tinymce_ck12_plugins }}",
            'create_exercise_plugins': "{{ c.tinymce_create_exercise_plugins }}",
            'ck12_plugins_url':'{{ c.tinymce_ck12_plugins_url }}'
        }
    };
    $.extend(true, $.flx, {'settings':settings});
})(jQuery);
