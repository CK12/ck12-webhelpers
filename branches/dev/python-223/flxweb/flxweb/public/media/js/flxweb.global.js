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
define('flxweb.global', ['jquery', 'common/views/login.popup.view', 'jquery-ui', 'jquery.cookie', 'flxweb.jquery.plugins',
    'flxweb.settings'
], function ($, signin) {
    'use strict';
    // Global FLXWEB object
    $.flxweb = $.flxweb || {};
    $.extend(true, $.flxweb, {
        'dialog': {}
    });

    //ajax default caching being turned off
    $.ajaxSetup({
        'cache': false
    });

    //add a hollow console if console/firebug is not present
    if (!window.console) {
        var i, hollow = function () {},
            names = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml',
                'group', 'groupEnd', 'time', 'timeEnd', 'count', 'trace', 'profile',
                'profileEnd'
            ];

        window.console = {};
        for (i = 0; i < names.length; ++i) {
            window.console[names[i]] = hollow;
        }
    }

    var _ck12_dialog = null;

    function createDialog(elm, options) {
        elm = $(elm);
        var dlg_title = elm.data('dialogtitle'),
            dlg_url = elm.data('dialogurl'),
            dlg_nocache = elm.data('dialognocache') || false,
            dlg_parentclass = elm.data('dialogueparentclass') || 'js_ck12_dialog_common',
            dlg_content_cache = null;
        options = $.extend({
            'width': '400px',
            'modal': true,
            'autoOpen': false,
            'title': dlg_title,
            'dialogClass': dlg_parentclass
        }, options);
        elm.dialog(options);

        function dialogLoadSuccess(data) {
            if (!dlg_nocache) {
                dlg_content_cache = data;
            }
            elm.html(data);
            elm.dialog('open');
            $.flxweb.events.triggerEvent(elm, 'flxweb.dialog.open');
        }

        function applyOptions(options) {
            $.each(options, function (k, v) {
                $(elm).dialog('option', k, v);
            });
        }

        function openDialog(options) {
            if (dlg_url) {
                if (dlg_content_cache) {
                    elm.html(dlg_content_cache);
                    elm.dialog('open');
                    $.flxweb.events.triggerEvent(elm, 'flxweb.dialog.open');
                } else {
                    $.ajax(dlg_url, {
                        success: dialogLoadSuccess
                    });
                }
            } else {
                elm.dialog('open');
                $.flxweb.events.triggerEvent(elm, 'flxweb.dialog.open');
            }
            if (options) {
                applyOptions(options);
            }
            return elm;
        }

        function closeDialog() {
            $.flxweb.events.triggerEvent(elm, 'flxweb.dialog.close');
            return elm.dialog('close');
        }

        function showOrHideIframe() {
            if ($('.ui-widget-overlay').length === 0) {
                $('#artifact_content iframe').css('visibility', 'visible');
            } else {
                $('#artifact_content iframe').css('visibility', 'hidden');
            }
        }

        elm = $.extend({
            'open': openDialog,
            'close': closeDialog
        }, elm);

        //This event is triggered when dialog is closed.
        elm.off('dialogclose.dialog').on('dialogclose.dialog', showOrHideIframe);
        // This event is triggered when dialog is opened
        elm.off('dialogopen.dialog').on('dialogopen.dialog', showOrHideIframe);
        return elm;
    }

    function setDefaultFocus() {
        $(_ck12_dialog).parent('div').find('.ui-dialog-buttonpane').find('button').first().focus();
    }

    function showDialog(msg, options) {
        if (!_ck12_dialog) {
            _ck12_dialog = createDialog($('#js_dialog_basic'));
        }
        options = $.extend({
            'title': 'CK-12 FlexBook&#174; Textbooks',
            'buttons': {
                'OK': function () {
                    $(this).dialog('close');
                }
            },
            'loading': false,
            'width': '400px',
            'minWidth': '400px',
            'height': 'auto',
            'maxHeight': '600px',
            'maxWidth': '800px',
            'modal': true,
            'autoOpen': false,
            'dialogClass': 'js_ck12_dialog_common',
            'position': 'center',
            'close': function () {
                $(_ck12_dialog).find('.dialog_msg').html('');
            }
        }, options);
        if ($(window).width() < 768) {
            options.width = 350;
        }
        var _loading = $(_ck12_dialog).find('.dialog_loading');
        if (options.loading) {
            _loading.removeClass('hide');
        } else {
            _loading.addClass('hide');
        }
        $(_ck12_dialog).find('.dialog_msg').html(msg || '');
        _ck12_dialog.open(options);
        setDefaultFocus();
    }

    // facebook share handler
    function fbshare_click() {
        var shareURL = $(this).attr('href');
        window.open(shareURL, 'blank', 'location=no, menubar=no, resizable=no status=no, scrollbars=no, width=500, height=300');
        return false;
    }

    // signin link handler
    function showSigninDialog(options) {
        options = $.extend({
            width: 800,
            buttons: null,
            title: 'Sign In'
        }, options);
        var authUrl = $('#js_signindialog').data('url'),
            iframewidth = 780,
            iframeheight = 325;
        if ($(window).width() < 768) {
            options.width = 350;
            iframewidth = 330;
            iframeheight = 550;
        }
        $.flxweb.showDialog('<iframe id="authiframe" ' +
            'frameborder="0" ' +
            'scrolling="no" ' +
            'src="' + authUrl + '" ' +
            'width="' + iframewidth + '"' +
            'height="' + iframeheight + '"' +
            '/>', options);

        //Setup a callback to handle the dispatched MessageEvent event. In cases where
        //window.postMessage is supported, the passed event will have .data, .origin and
        // .source properties. Otherwise, this will only have the .data property.
        $.receiveMessage(function (e) {
            // Get the height from the passed data.
            var h = Number(e.data.replace(/.*if_height=(\d+)(?:&|$)/, '$1'));

            if (!isNaN(h) && h > 0) {
                // Height has changed, update the iframe.
                $('#authiframe').height(h);
                //$('#js_dialog_basic').dialog( 'option', 'height', h+20 );
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
        var url = '',
            interval = 5000,
            _deferred = $.Deferred(),
            _promise = _deferred.promise();

        if (options.url) {
            url = options.url;
        } else {
            if (options.task_id) {
                url = $.flxweb.settings.webroot_url + 'task/status/' + options.task_id + '/';
            } else {
                return false;
            }
        }

        if (options.interval) {
            interval = options.interval;
        }

        function statusCheckSuccess(json_status) {
            if (json_status.status === 'SUCCESS') {
                _deferred.resolve(json_status);
            } else if (json_status.status === 'FAILURE') {
                _deferred.reject(json_status);
            } else if (json_status.status === 'PENDING' || json_status.status === 'IN PROGRESS') {
                window.setTimeout(checkStatus, interval);
            }
        }

        function statusCheckError(xhr, text_status, errorThrown) {
            var error_info = {
                'status': text_status,
                'error': errorThrown
            };
            _deferred.reject(error_info);
        }

        function checkStatus() {
            $.ajax({
                'url': url,
                'success': statusCheckSuccess,
                'error': statusCheckError
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
        var _deferred = $.Deferred(),
            _promise = _deferred.promise(),
            _nocache = nocache;

        function taskStatusCheckSuccess(json_status) {
            /**
             * Success callback for ajax task queries
             * @param json_status: JSON response
             */
            var task_status;
            if (json_status.status === 'SUCCESS') {
                task_status = $.Event('RENDER_TASK_SUCCESS');
                $.extend(task_status, {
                    task_type: task_type,
                    artifactID: artifact_id,
                    revisionID: revision_id,
                    render_template: render_template,
                    task_status: json_status
                });
                $(window).trigger(task_status);
                _deferred.resolve(task_status);
            } else if (json_status.status === 'FAILURE') {
                task_status = $.Event('RENDER_TASK_ERROR');
                $.extend(task_status, {
                    task_type: task_type,
                    artifactID: artifact_id,
                    revisionID: revision_id,
                    error_info: json_status,
                    render_template: render_template
                });
                $(window).trigger(task_status);
                _deferred.reject(task_status);

            } else if (json_status.status === 'PENDING' || json_status.status === 'IN PROGRESS') {
                if (_nocache) {
                    _nocache = false;
                }
                window.setTimeout(taskStatusCheck, 15000);
            }
        }

        function taskStatusCheckError(xhr, text_status, errorThrown) {
            var task_error = $.Event('RENDER_TASK_ERROR');
            $.extend(task_error, {
                task_type: task_type,
                artifactID: artifact_id,
                revisionID: revision_id,
                render_template: render_template,
                error_info: {
                    'status': text_status,
                    'error': errorThrown
                }
            });
            $(window).trigger(task_error);
            _deferred.reject(task_error);
        }

        function taskStatusCheck() {
            var render_url = webroot_url + 'render/' + task_type + '/status/' + artifact_id + '/' + revision_id + '/';
            if (_nocache) {
                render_url += 'nocache/';
            }
            if (render_template) {
                render_url += render_template + '/';
            }
            $.ajax({
                url: render_url,
                success: taskStatusCheckSuccess,
                error: taskStatusCheckError,
                cache: false,
                dataType: 'json'
            });
        }

        taskStatusCheck();
        return _promise;
    }

    function showLoading(msg, options) {
        options = $.extend({
            'close': false,
            'modal': true,
            'buttons': null,
            'loading': true
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
            triggerEvent: function triggerEvent(element, eventName, eventData) {
                var evt = $.Event(eventName);
                $(element).trigger(evt, eventData);
            }
        };
    }

    function Template() {
        var _template_cache = {};
        //underscore js template settings

        function renderTemplate(template_selector, data) {
            /**
             * render a template by replacing the placeholders
             * with respective attributes from data
             * @param template_selector: jQuery selector for template container
             * @param data: javascript object which has all the keys present in the template.
             * @return renderred jQuery object
             *
             * for more info, read : http://documentcloud.github.com/underscore/#template
             */
            var rendered_template,
                compiled_template = _template_cache[template_selector];
            if (!compiled_template) {
                compiled_template = _.template($(template_selector).html());
                _template_cache[template_selector] = compiled_template;
            }
            rendered_template = compiled_template(data);
            return $(rendered_template);
        }

        return {
            'render': renderTemplate
        };
    }

    function notify(message, notification_type, duration) {
        // Set the message using text method and chain fadeIn with it
        // apply simple setTimeout to fadeOut the message
        notification_type = notification_type || 'success'; //type of notification, default : 'success'
        duration = duration || 3; //duration in seconds, default : 3

        noty({
            'text': message,
            'theme': 'noty_theme_twitter',
            'layout': 'top',
            'type': notification_type,
            'animateOpen': {
                'height': 'toggle'
            },
            'animateClose': {
                'height': 'toggle'
            },
            'speed': 500,
            'timeout': 1000 * duration,
            'closeButton': true,
            'closeOnSelfClick': false,
            'closeOnSelfOver': false
        });
    }

    function logADS(g, e, v, d, a) {
        if (window._ck12) {
            _ck12.logEvent(g, e, v, d, a);
        }
    }

    function gettext(str, args) {
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
         *      $.flxweb.gettext('Hello')
         *      $.flxweb.gettext('Hello, <%=name%>', {'name': 'World'})
         *
         */
        var str_out = str;
        if (window.i18n) {
            if (window.i18n[str]) {
                str_out = window.i18n[str];
            }
        }
        if (args) {
            str_out = _.template(str_out, args);
        }
        return str_out;
    }

    function truncate(someString, maxLength) {
        //truncate the string using the underscore truncate 
        // Keeping it here, makes it easy to switch to any 
        // other truncating function
        return _.escape(_(someString).truncate(maxLength));
    }

    function tooltip(target, content) {
        //init qtip tooltips support
        var tooltip_options = {
            position: {
                at: 'right center',
                my: 'left center'
            },
            style: {
                tip: {
                    corner: 'leftMiddle',
                    width: 8,
                    height: 14
                },
                classes: 'gentooltip'
            },
            show: {
                delay: 10,
                solo: true,
                ready: false
            },
            hide: {
                event: 'unfocus'
            },
            width: 400
        };
        $(target).qtip($.extend(tooltip_options, {
            content: content
        }));
    }

    /**
     * Returns true/false if the user is signed in.
     * NOTE: This method should NOT be used to make any
     * security decisions. Use it with caution.
     */
    function isUserSignedIn() {
        return window.ck12_signed_in;
    }

    function fixBrokenImages(specifiers, alternative_image_url) {
        $(specifiers).each(function (i, o) {
            $(o).bind('error', function () {
                this.src = alternative_image_url;
            });
        });
    }

    /**
     * Returns the value of query string parameter
     */
    function queryParam(name) {
        name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
        var regexS = '[\\?&]' + name + '=([^&#]*)',
            regex = new RegExp(regexS),
            results = regex.exec(window.location.search);
        if (results) {
            return decodeURIComponent(results[1].replace(/\+/g, ' '));
        }
        return '';
    }

    $.extend(true, $.flxweb, {
        'RenderTaskProcessor': RenderTaskProcessor,
        'showSigninDialog': showSigninDialog,
        'createDialog': createDialog,
        'showDialog': showDialog,
        'showLoading': showLoading,
        'hideLoading': closeDialog,
        'fixBrokenImages': fixBrokenImages,
        'events': Events(),
        'alertToSignin': signin.showLoginDialogue,
        'TaskProcessor': TaskProcessor,
        'template': Template(),
        'notify': notify,
        'logADS': logADS,
        'gettext': gettext,
        'truncate': truncate,
        'tooltip': tooltip,
        'isUserSignedIn': isUserSignedIn,
        'queryParam': queryParam
    });

    function ajaxloadlater() {
        var $el = $(this);
        $el.html('Loading...');
        $el.load($el.data('loadurl'), function () {
            $el.trigger('flxweb.loadlater.loadcomplete');
            $el.show(800);
        });
    }

    // Global Page-Load Initializations
    function documentReady() {
        var lazyloadQueue = [];
        $('a.fbshare').click(fbshare_click);
        $('#js_ck12signin').click(showSigninDialog);
        $('#message_dialog').dialog({
            autoOpen: false
        });
        $('.drop-menu').ck12_dropDownMenu();
        // elements to be loaded when visible
        $('.js_loadlater[data-lazyload="1"]').each(function () {
            var $el = $(this);
            lazyloadQueue.push($el);
            // bind event for elements using loadurl
            if ($el.data('loadurl')) {
                $el.on('flxweb.loadlater.ajaxload', ajaxloadlater);
            }
        });
        // elements to be loaded on document ready
        $('.js_loadlater[data-lazyload!="1"]').each(function () {
            var $el = $(this);
            $el.hide();
            $el.load($el.data('loadurl'), function () {
                $el.trigger('flxweb.loadlater.loadcomplete');
                $el.show(800);
            });
        });
        $(window).on('scroll.lazyload touchmove.lazyload', function () {
            var index, elTop, elems = [],
                scrolltop = document.documentElement.scrollTop || document.body.scrollTop,
                height = $(window).height();
            for (index = lazyloadQueue.length - 1; index >= 0; index--) {
                elTop = lazyloadQueue[index].offset().top;
                if ((scrolltop + height) > elTop && elTop > scrolltop) {
                    elems.push({
                        'index': index
                    });
                }
            }
            if (elems) {
                var $el;
                for (index = 0; index < elems.length; index++) {
                    $el = lazyloadQueue.splice(elems[index].index, 1)[0];
                    if ($el.data('loadurl')) {
                        $el.trigger('flxweb.loadlater.ajaxload');
                        // delay the unbind on safer side.
                        setTimeout(function () {
                            $el.off('flxweb.loadlater.ajaxload');
                        }, 500);
                    } else {
                        // element to be loaded with native function calls
                        // function is triggered as event from data attr.
                        $el.trigger($el.data('native'));
                        // delay the unbind on safer side.
                        setTimeout(function () {
                            $el.off($el.data('native'));
                        }, 500);
                    }
                }
            }
            if (lazyloadQueue.length === 0) {
                //lazy loader scroll turned off forever
                $(window).off('scroll.lazyload touchmove.lazyload');
            }
        });

        $('.js_tobeimplemented').click(function () {
            $.flxweb.showDialog('This feature is not yet implemented');
            return false;
        });

        var temp = 0;
        $('.js_signinrequired').live('click', function () {
            $.flxweb.alertToSignin();
            return false;
        });

        $('#notification_dismiss').click(function () {
            $('#notification_div').hide();
        });

        $('.js_disableContextmenu').live('contextmenu', function (e) {
            e.preventDefault();
            return false;
        });

        $('#back_to_top_page').click(function () {
            $(document).scrollTop(0);
            return false;
        });

        //maxlength for textarea
        $('textarea[maxlength]').live('keyup', function () {
            //get the limit from maxlength attribute
            var limit = parseInt($(this).attr('maxlength'), 10),
                //get the current text inside the textarea
                text = $(this).val(),
                //count the number of characters in the text
                chars = text.length,
                counter = $(this).data('counter-id');

            $('#' + counter).html(chars + '/' + limit);

            //check if there are more characters than allowed
            if (chars > limit) {
                //and if there are use substr to get the text before the limit
                //and change the current text with the new text
                $(this).val(text.substr(0, limit));
            }
        });

        //BUG: 9751
        //regularly check for cookies to make sure the user is still
        //signed in. If not, alert the user and explicitly signout
        if ($.cookie($.flxweb.settings.ck12_login_cookie) && window.ck12_signed_in) {
            window.signInInterval = window.setInterval(function () {
                var authCookie = $.cookie($.flxweb.settings.ck12_login_cookie);
                if (!authCookie) {
                    //clear the previous timer
                    window.clearInterval(window.signInInterval);
                    $.flxweb.showDialog(
                        $.flxweb.gettext('Your session has expired. Please sign in again'), {
                            'buttons': [{
                                'text': $.flxweb.gettext('OK'),
                                'click': function () {
                                    window.location = '/account/signout/';
                                }
                            }]
                        });
                    //delete the localStorage keys with pattern *collabBooks*
                    Object.keys(localStorage).forEach(function(key){
                        if (/collabBooks/.test(key)) {
                            localStorage.removeItem(key);
                        }
                    });
                }
            }, 60000);
        }
        $.fn.exists = function () {
            return this.length > 0;
        };

        function resizeResourceContainer() {
            if ($('#resources_container').height() === 0) {
                //alert('sixty three');
                $('#browseLink span').html(' &#9650;');
                $('#resources_container').css('height', ($('#resources_container').height() + $('#resources').height() + 50));
            } else {
                //alert('not sixty three');
                $('#browseLink span').html(' &#9660;');
                $('#resources_container').css('height', 0);
            }
        }

        //$('#resources li:nth-child(2n+1)').addClass('marginBonus');
        $('#browseLink').click(function () {

            if ($('#resources_container').hasClass('empty')) {
                $('#subjectsLoading').removeClass('hide');
                $.ajax({
                    'url': $.flxweb.settings.webroot_url + 'ajax/subjects-header',
                    'success': function (subjectsResponse) {
                        $('#resources_container.empty').html(subjectsResponse);
                        $('#resources_container').removeClass('empty');
                        //$('#resources_container #resources li:nth-child(2n+1)').addClass('marginBonus');
                        $('#subjectsLoading').addClass('hide');
                        resizeResourceContainer();
                    },
                    'error': function () {
                        $('#subjectsLoading').addClass('hide');
                    }
                });
            } else {
                resizeResourceContainer();
            }

        });

        $('#actionLink').click(function () {
            $('#sideNav').toggleClass('sideNavOpen');
            return false;
        });

    }
    $(document).ready(documentReady);
});

window.htmlSafe = function (unsafe) {
    'use strict';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};