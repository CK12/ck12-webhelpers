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
 * This file originally written by Ravi Gidwani
 *
 * $Id$
 */

(function($) {

    // Global FLXWEB object
    $.flxweb = {};
    $.extend(true,$.flxweb, {
        'dialog':{}
    });

    // Global Search
    function submitSearch() {
        var search_term = $('#search_term').val();
        //search only if:
        //1) we have a search term
        //2) if the form has not been already submitted (avoid double submits)
        if(search_term && !$(this).data('submitted')) {
            $(this).data('submitted', true);
        } else {
            // prevent form submit
            return false;
        }
    }

    // facebook share handler
    function fbshare_click() {
        var shareURL = $(this).attr('href');
        var fbwin = window.open(shareURL, "blank", "location=no, menubar=no, resizable=no status=no, scrollbars=no, width=500, height=300");
        return false;
    }

    function alertToSignin() {
        showDialog( $('#js_signin_message').html(),
                    {
                        'buttons': {
                           'OK': function() {
                                $.flxweb.showSigninDialog();
                            }
                        }
                    });
    }

    // signin link handler
    function showSigninDialog(options) {
        options = $.extend({
            width:800,
            buttons: null,
            title: 'Sign In'
        }, options);
        var authUrl = $('#js_signindialog').data('url') +'&requestor=' + document.location;
        $.flxweb.showDialog('<iframe id="authiframe" '+
                                    'frameborder="0" '+
                                    'scrolling="no" ' +
                                    'src="'+authUrl+'" ' +
                                    'width="780"' + 
                                    'height="250"' +
                                    '/>', options);

        //Setup a callback to handle the dispatched MessageEvent event. In cases where
        //window.postMessage is supported, the passed event will have .data, .origin and
        // .source properties. Otherwise, this will only have the .data property.
        $.receiveMessage(function(e){
           // Get the height from the passed data.
           var h = Number( e.data.replace( /.*if_height=(\d+)(?:&|$)/, '$1' ) );
            
           if ( !isNaN( h ) && h > 0 ) {
                // Height has changed, update the iframe.
                $('#authiframe').height(h);
                //$('#js_dialog_basic').dialog( "option", "height", h+20 );
           }
        });
        return false;
    }

    function TaskProcessor(options) {
        /**
         * Creates a poller that polls for task status at a defined interval
         * @param options <Object>:
         *      url     : url to poll. if unspecified, task_id will be used to poll /task/status/<task_id>/
         *      task_id : task id to poll (this option is ignored if url is specified.)
         *      interval: polling interval in milliseconds
         * @returns a promise object
         */
        var url = '';
        var interval = 5000;
        var _deferred = $.Deferred();
        var _promise = _deferred.promise();

        if(options.url) {
            url = options.url;
        } else {
            if(options.task_id) {
                url = $.flxweb.settings.webroot_url + 'task/status/' + options.task_id + '/';
            } else {
                return false;
            }
        }
        
        if (options.interval){
            interval = options.interval;
        }

        function statusCheckSuccess(json_status) {
            if(json_status.status == "SUCCESS") {
                _deferred.resolve(json_status);
            } else if(json_status.status == "FAILURE") {
                _deferred.reject(json_status);
            } else if(json_status.status == "PENDING" || json_status.status == "IN PROGRESS") {
                window.setTimeout(checkStatus, interval);
            }
        }

        function statusCheckError(xhr, text_status, errorThrown) {
            var error_info = {
                'status' : text_status,
                'error' : errorThrown
            };
            _deferred.reject(error_info);
        }

        function checkStatus() {
            $.ajax({
                'url': url,
                'success': statusCheckSuccess,
                'error' : statusCheckError
            });
        }

        checkStatus();
        return _promise;
    }

    function RenderTaskProcessor(task_type, artifact_id, revision_id, render_template, nocache) {
        /**
         * Task processor handles creation and track its progress
         * @param task_type: type of task
         * @param artifact_id: artifact ID
         * @param revision_id: id of ArtifactRevision
         * @param render_template: onecolumn or twocolumn template (only valid for pdf tasks)
         * @param nocache: if true, will force regenerate the resource
         * @return a jQuery promise object
         */
        var _deferred = $.Deferred();
        var _promise = _deferred.promise();
        var _nocache = nocache;
        function statusCheckSuccess(json_status) {
            /**
             * Success callback for ajax task queries
             * @param json_status: JSON response
             */
            if(json_status.status == "SUCCESS") {
                var task_success = $.Event('RENDER_TASK_SUCCESS');
                $.extend(task_success, {
                    task_type : task_type,
                    artifactID : artifact_id,
                    revisionID : revision_id,
                    render_template : render_template,
                    task_status : json_status
                });
                $(window).trigger(task_success);
                _deferred.resolve(task_success);
            } else if(json_status.status == "FAILURE") {
                var task_error = $.Event('RENDER_TASK_ERROR');
                $.extend(task_error, {
                    task_type : task_type,
                    artifactID : artifact_id,
                    revisionID : revision_id,
                    error_info : json_status,
                    render_template : render_template
                });
                $(window).trigger(task_error);
                _deferred.reject(task_error);

            } else if(json_status.status == "PENDING" || json_status.status == "IN PROGRESS") {
                if(_nocache) {
                    _nocache = false;
                }
                window.setTimeout(taskStatusCheck, 15000);
            }
        }

        function statusCheckError(xhr, text_status, errorThrown) {
            var task_error = $.Event('RENDER_TASK_ERROR');
            $.extend(task_error, {
                task_type : task_type,
                artifactID : artifact_id,
                revisionID : revision_id,
                render_template : render_template,
                error_info : {
                    'status' : text_status,
                    'error' : errorThrown
                }
            });
            $(window).trigger(task_error);
            _deferred.reject(task_error);
        }

        function taskStatusCheck() {
            var render_url = webroot_url + 'render/' + task_type + '/status/' + artifact_id + '/' + revision_id + '/';
            if(_nocache) {
                render_url += 'nocache/';
            }
            if(render_template) {
                render_url += render_template + '/';
            }
            $.ajax({
                url : render_url,
                success : statusCheckSuccess,
                error : statusCheckError,
                cache : false,
                dataType : 'json'
            });
        }

        taskStatusCheck();
        return _promise;
    }

    function createDialog(elm, options) {
        elm = $(elm);
        var dlg_title = elm.data('dialogtitle');
        var dlg_url = elm.data('dialogurl');
        var dlg_nocache = elm.data('dialognocache') || false;
        var dlg_content_cache = null;
        options = $.extend({
            'width' : '400px',
            'modal' : true,
            'autoOpen' : false,
            'title' : dlg_title,
            'dialogClass' : 'js_ck12_dialog_common'
        }, options);
        elm.dialog(options);

        function dialogLoadSuccess(data) {
            if(!dlg_nocache) {
                dlg_content_cache = data;
            }
            elm.html(data);
            elm.dialog('open');
            $.flxweb.events.triggerEvent(elm, "flxweb.dialog.open");
        }
        
        function applyOptions(options){
            $.each(options, function(k, v) {
                $(elm).dialog('option', k, v);
            });
        }

        function openDialog(options) {
            if(dlg_url) {
                if(dlg_content_cache) {
                    elm.html(dlg_content_cache);
                    elm.dialog('open');
                    $.flxweb.events.triggerEvent(elm, "flxweb.dialog.open");
                } else {
                    $.ajax(dlg_url, {
                        success : dialogLoadSuccess
                    });
                }
            } else {
                elm.dialog('open');
                $.flxweb.events.triggerEvent(elm, "flxweb.dialog.open");
            }
            if (options){
                applyOptions(options)
            }
            return elm;
        }

        function closeDialog() {
            $.flxweb.events.triggerEvent(elm, "flxweb.dialog.close");
            return elm.dialog('close');
        }

        elm = $.extend({
            'open' : openDialog,
            'close' : closeDialog
        }, elm);
        return elm;
    }

    var _ck12_dialog = null;
    function showDialog(msg, options) {
        if(!_ck12_dialog) {
            _ck12_dialog = createDialog($("#js_dialog_basic"));
        }
        options = $.extend({
            'title' : 'FlexBook System',
            'buttons' : {
                'OK' : function() {
                    $(this).dialog('close');
                }
            },
            'loading':false,
            'width' : '400px',
            'maxHeight': '600px',
            'modal' : true,
            'autoOpen' : false,
            'dialogClass' : 'js_ck12_dialog_common',
            'position': 'center'
        }, options);
        var _loading = $( _ck12_dialog).find('.dialog_loading');
        if(options.loading) {
            _loading.removeClass('hide');
        } else {
            _loading.addClass('hide');
        }
        if (!msg) {
           msg=''; 
        }        
        $( _ck12_dialog).find('.dialog_msg').html(msg);
        _ck12_dialog.open(options);
    }

    function showLoading(msg, options) {
        options = $.extend({
            'close' : false,
            'modal' : true,
            'buttons' : null,
            'loading' : true
        }, options);
        showDialog(msg, options);
    }

    function closeDialog() {
        _ck12_dialog.close();
    }

    /**
     * CK12 Events Namespace
     * Provides functions to deal with events e.g. triggerEvent
     */
    function Events() {
        /**
         * Triggers the event on the specified element
         * @param element: jquery Element to trigger the event on
         * @param eventName: Name of the Event
         * @param eventData: The data to be made available to binder
         *                   e.g event.data.something
         */
        return {
            triggerEvent : function triggerEvent(element, eventName, eventData) {
                var evt = $.Event(eventName);
                $(element).trigger(evt, eventData);
            }
        }
    }
    
    function Template(){
        var _template_cache = {};
        //underscore js template settings
        
        function renderTemplate(template_selector, data){
            /**
             * render a template by replacing the placeholders
             * with respective attributes from data
             * @param template_selector: jQuery selector for template container
             * @param data: javascript object which has all the keys present in the template.
             * @return renderred jQuery object
             * 
             * for more info, read : http://documentcloud.github.com/underscore/#template 
             */
            var compiled_template = _template_cache[template_selector];
            if (!compiled_template){
                var template_text = $(template_selector).html();
                compiled_template = _.template(template_text);
                _template_cache[template_selector] = compiled_template;
            }
            var rendered_template = compiled_template(data);
            return $(rendered_template);
        }
        
        return {
            'render': renderTemplate
        };
    }

    function notify(message) {
        // Set the message using text method and chain fadeIn with it
        // apply simple setTimeout to fadeOut the message
        noty(
        {"text":message,
        "theme":"noty_theme_twitter",
        "layout":"top",
        "type":"success",
        "animateOpen":{"height":"toggle"},
        "animateClose":{"height":"toggle"},
        "speed":500,
        "timeout":3000,
        "closeButton":true,
        "closeOnSelfClick":false,
        "closeOnSelfOver":false});
        /*
$('#notification_msg').text(message);
        $('#notification_div').fadeIn(1000).delay(5000).fadeOut(1000);
*/
    }

    function logADS(g,e, v, d, a) {
        if (adsEnabled) {
            if (window._ck12){
                _ck12.logEvent(g,e,v,d,a);
            }
        }
    }
    
    function gettext(str, args){
        /**
         * Function to enable internationalization of messages in flxweb JS
         * @param: str
         *      string to get translation for. If no translation is found, 
         *      original str is returned.
         *      str can contain _.template placeholders.
         *      
         * @param: args
         *      If args parameter is specified, _.template placeholders will be replaced 
         *      with respective values
         * usage:
         *      $.flxweb.gettext("Hello")
         *      $.flxweb.gettext("Hello, <%=name%>", {'name': 'World'})
         * 
         */
        var str_out = str;
        if (window.i18n){
            if (window.i18n[str]){
                str_out =  window.i18n[str];
            }
        }
        if (args){
            str_out = _.template(str_out, args);
        }
        return str_out;
    }

    // Global Page-Load Initializations
    function documentReady() {

        //ajax default caching being turned off
        $.ajaxSetup( {  'cache': false });
        
        //add a hollow console if console/firebug is not present
        if (!window.console)
        {
            var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
            "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
        
            window.console = {};
            for (var i = 0; i < names.length; ++i)
                window.console[names[i]] = function() {}
        }

        // Add autocomplete=off to search_term field. This is needed
        // as the inFieldLabels plugin has issues if autocomplete is ON.
        $('search_term').attr('autocomplete', 'off');
        $('.search_term_label').inFieldLabels({
            fadeOpacity : 0.0,
            fadeDuration : 0,
            hideClass : "hide"
        });

        $('#search_form').submit(submitSearch);
        $("a.fbshare").click(fbshare_click);
        $('#js_ck12signin').click(showSigninDialog);
        $("#message_dialog").dialog({
            autoOpen : false
        });
        $('.drop-menu').ck12_dropDownMenu();

        $('.js_loadlater').each(function() {
            var url = $(this).data('loadurl');
            $(this).hide();
            $(this).load(url, function() {
                $(this).trigger('flxweb.loadlater.loadcomplete');
                $(this).show(800);
            });
        });
        $.extend(true, $.flxweb, {
            'RenderTaskProcessor' : RenderTaskProcessor,
            'showSigninDialog' : showSigninDialog,
            'createDialog' : createDialog,
            'showDialog' : showDialog,
            'showLoading' : showLoading,
            'hideLoading' : closeDialog,
            'alertToSignin' : alertToSignin,
            'events' : Events(),
            'TaskProcessor' : TaskProcessor,
            'template': Template(),
            'notify': notify,
            'logADS': logADS,
            'gettext': gettext
        });

        $('.js_tobeimplemented').click(function(){
            $.flxweb.showDialog('This feature is not yet implemented');
            return false;
        });
        
        $('.js_signinrequired').live('click',function(){
            alertToSignin();
            return false;
        });

        $('#notification_dismiss').click(function() {
            $('#notification_div').hide();
        });
        
        $('.js_disableContextmenu').live("contextmenu", function(e) {
            e.preventDefault();
            return false;
        });

    }


    $(document).ready(documentReady);
})(jQuery);
