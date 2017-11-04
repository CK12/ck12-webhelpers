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
* This file originally written by Shivprasad
*
* $Id$
*/

define( ['jquery','common/views/login.popup.view'],
function($, signin) {
    'use strict';

    function assessmentFrameListener(){
        var LISTENER_APIS = [],
            requestedApis = [],
            DEFAULT_APIS = ['resize'],
            listenerObject,
            _ck12_dialog = null,
            signinInstance,
            container = null,
            eventsObj = $({}); //a dummy jQuery object for event binding

        function init(options){
            requestedApis = (options && options.apis && options.apis.length !== 0)? options.apis: DEFAULT_APIS;
            container = (options && options.container && options.container.length) ? options.container : $('#assessmentFrame');
            initListener();
            exposeApis();
            bindEvents();
            return window.assessmentFrameListener;
        }

        function initListener(){
            listenerObject = {
                'resize': resize,
                'showSigninDialog': showSigninDialog,
                'loadQuiz': loadQuiz,
                'getParentURL' : getParentURL,
                'loadTestDetailsPage': loadTestDetailsPage,
                'shareTest': shareTest,
                'loadTestDetails': loadTestDetails,
                'setParentURL': setParentURL,
                'loadMyTests': loadMyTests,
                'contributeQuestionForConcept': contributeQuestionForConcept
            };

            LISTENER_APIS = [];

            for(var key in listenerObject){
                LISTENER_APIS.push(key);
            }
        }

        function exposeApis(){
            window.assessmentFrameListener = {
                on: eventsObj.on.bind(eventsObj),
                off: eventsObj.off.bind(eventsObj),
                trigger: eventsObj.trigger.bind(eventsObj)
            };

            for(var i=0;i<requestedApis.length;i++){
                if($.inArray(requestedApis[i],LISTENER_APIS) !== -1){
                    window.assessmentFrameListener[requestedApis[i]] = listenerObject[requestedApis[i]];
                }
                else{
                    //console.log("No such API available.");
                }
            }
        }

        function resize(options){
            var height = (options && options.height)? options.height: 350;

            if(options && options.noPadding){
                height = height;
            }else{
                height = height + 50;
            }


            height = height + 50;

            if(container){
                container.css('height', height);
            }else{
                $('#assessmentFrame').css('height', height);
            }
            //console.log("Frame resized. height: "+ height + "px");
        }

        function showSigninDialog(options){
            var $coversheet = $('.concept-coversheet');
            if(options && options.hashUrl){
                $.cookie('assessmentFrameUrlConfig', options.hashUrl);
            }

            if($coversheet.length > 0 && $coversheet.hasClass('open')){
                $coversheet.addClass('coversheet-open');
            }
            //_showSigninDialog();
            signinInstance = signin.showLoginDialogue(options);
        }

        function loadQuiz(){
            var permaUrl = $('#permaUrl').val(),
                handle = permaUrl.split('/')[1],
                url = window.location.href,
                redirectUrl;

            handle = handle.split('-');
            handle[handle.length-1] = 'Exercise';
            redirectUrl = 'quiz/' + handle.join('-');

            window.location.href = url.replace(permaUrl,redirectUrl);
        }

        function getParentURL(){
            return window.location.href;
        }

        function setParentURL(url){
            $.removeCookie('assessmentFrameUrlConfig');
            window.location.href = url;
        }

        function loadTestDetailsPage(){
            if($('#testDetailsUrl').length !== 0){
                window.location.href = $('#testDetailsUrl').attr('href');
            }
        }

        function loadTestDetails(options){
            var mtype,
                URL_CONSTANTS = {},
                mode = (options && options.mode) ? options.mode.toLowerCase(): null;

            if(options && options.handle && options.encodedId && options.type){
                mtype = options.type.toLowerCase();

                URL_CONSTANTS.TEST_DETAILS = '/'+ mtype +'/'+ options.encodedId +'/'+ options.handle;
                URL_CONSTANTS.EDIT_TEST = '/editor/test/'+ mtype +'/'+ options.encodedId +'/'+ options.handle ;

                window.location.href = (mode === 'edit')? URL_CONSTANTS.EDIT_TEST : URL_CONSTANTS.TEST_DETAILS;
            }
            else if(options && options.mode && options.mode === 'create'){
                URL_CONSTANTS.CREATE_TEST = '/create/exercise/test/';

                window.location.href = URL_CONSTANTS.CREATE_TEST;
            }
        }


        //This could be entirely hosted by assessment itself
        function shareTest(options){
            var mtype_map = {
                    'practice':'asmtpractice',
                    'interactive practice':'asmtpracticeint',
                    'quiz':'asmtquiz'
                },
                mhandle = null,
                realm = null,
                mtype = mtype_map[options.type.toLowerCase()],
                testDetailsUrl = null,
                //errorMessage = "some of the required values for sharing test are missing!",
                share_map = {
                    'twitter': 'http://twitter.com?status=Reading%20@@page_url@@',
                    'facebook': 'https://www.facebook.com/sharer.php?u=@@page_url@@',
                    'mail': 'mailto:?&subject=@@artifact_title@@&body=@@artifact_title@@ : @@page_url@@'
                },
                shareURL = null,
                webroot_url = null,
                artifactTitle = '';

            if(window.location.origin){
                webroot_url = window.location.origin;
            }
            else{
                var pathArray = window.location.href.split( '/' );
                var protocol = pathArray[0];
                var host = pathArray[2];
                webroot_url = protocol + '//' + host;
            }

            if(!(options && options.handle && options.encodedId && options.shareVia && options.concepthandle && options.branchhandle)){
                //console.log(errorMessage);
                return;
            }

            mhandle = options.handle.split('/')[0];
            realm = options.handle.split('/')[1];

            if(realm && mhandle && mtype && webroot_url){
                testDetailsUrl = webroot_url + '/' + options.branchhandle.toLowerCase() + '/' + options.concepthandle + '/' + mtype + '/' + realm + '/' + mhandle +'/';
            }
            else if(mhandle && mtype && webroot_url){
                testDetailsUrl = webroot_url + '/' + options.branchhandle.toLowerCase() + '/' + options.concepthandle + '/' + mtype + '/' + mhandle + '/';
            }
            else{
                //console.log(errorMessage);
                return;
            }

            artifactTitle = mhandle.replace(/\-/g,' ');

            shareURL = share_map[options.shareVia];
            testDetailsUrl = escape(encodeURI(testDetailsUrl));
            shareURL = shareURL.replace('@@page_url@@', testDetailsUrl);
            shareURL = shareURL.replace(/@@artifact_title@@/g, escape(artifactTitle));

            window.open(shareURL);
        }

        function loadMyTests(){
            window.location.href = '/my/tests/';
        }

        function contributeQuestionForConcept(options){
            var title = $('#createworkbookwrapper> h1> a').html(),
                ep = (title !== '')? $('#createworkbookwrapper> h1> a').attr('href'): '',
                url = '/exercise/add/question/ae/';

            if(options){

                url = (ep && title)? url + '?title='+ title +'&ep='+ ep: url;

                window.location.href = url;
            }
        }

        function bindEvents(){
            var ua = navigator.userAgent,
                isAndroid = ua.match(/Android/i),
                supportsOrientationChange,
                orientationEvent;

            if(isAndroid || true){
                // Detect whether device supports orientationchange event
                supportsOrientationChange = 'onorientationchange' in window;
                orientationEvent = supportsOrientationChange ? 'orientationchange' : '';

                orientationEvent && window.addEventListener(orientationEvent, function() {
                    if(!/\/summer\//.test(window.top.location.pathname)){
                        $('#assessmentFrame')[0].contentDocument.location.reload();
                    }
                }, false);
            }
        }

        function _showSigninDialog(options) {
            // For webviews we don't use the dialog version of login, as they can't support window.open
            if (!window.isWebView()) {
                options = $.extend({
                    width:800,
                    buttons: null,
                    title: 'Sign In'
                }, options);
                var authUrl = $('#js_signindialog').data('url');
                var iframewidth = 780, iframeheight = 325;
                if ($(window).width() < 768 ){
                    options.width = 350;
                    iframewidth = 330;
                    iframeheight = 550;
                }
                showDialog('<iframe id="authiframe" '+
                'frameborder="0" '+
                'scrolling="no" ' +
                'src="'+authUrl+'" ' +
                'width="'+ iframewidth +'"' +
                'height="'+ iframeheight +'"' +
                '/>', options);

                //Setup a callback to handle the dispatched MessageEvent event. In cases where
                //window.postMessage is supported, the passed event will have .data, .origin and
                // .source properties. Otherwise, this will only have the .data property.
                $.receiveMessage && $.receiveMessage(function(e){
                    // Get the height from the passed data.
                    var h = Number( e.data.replace( /.*if_height=(\d+)(?:&|$)/, '$1' ) );

                    if ( !isNaN( h ) && h > 0 ) {
                        // Height has changed, update the iframe.
                        $('#authiframe').height(h);
                        //$('#js_dialog_basic').dialog( "option", "height", h+20 );
                    }
                });
            } else {
                $.flxweb.alertToSignin();
            }
            return false;
        }

        function showDialog(msg, options) {
            if(!_ck12_dialog) {
                _ck12_dialog = createDialog($('#js_dialog_basic'));
            }
            options = $.extend({
                'title' : 'FlexBook&#174; Textbook System',
                'buttons' : {
                    'OK' : function() {
                        $(this).dialog('close');
                    }
                },
                'loading':false,
                'width' : '400px',
                'minWidth':'400px',
                'height': 'auto',
                'maxHeight': '600px',
                'maxWidth': '800px',
                'modal' : true,
                'autoOpen' : false,
                'dialogClass' : 'js_ck12_dialog_common',
                'position': 'center',
                'close': function() { $(_ck12_dialog).find('.dialog_msg').html(''); }
            }, options);
            if ($(window).width() < 768 ){
                options.width = 350;
            }
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
            setDefaultFocus();
        }

        function setDefaultFocus() {
            $(_ck12_dialog).parent('div').find('.ui-dialog-buttonpane').find('button').first().focus();
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
                ////$.flxweb.events.triggerEvent(elm, "flxweb.dialog.open");
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
                        //$.flxweb.events.triggerEvent(elm, "flxweb.dialog.open");
                    } else {
                        $.ajax(dlg_url, {
                            dataType : 'json',
                            success : dialogLoadSuccess
                        });
                    }
                } else {
                    elm.dialog('open');
                    //$.flxweb.events.triggerEvent(elm, "flxweb.dialog.open");
                }
                if (options){
                    applyOptions(options);
                }
                return elm;
            }

            function closeDialog() {
                ////$.flxweb.events.triggerEvent(elm, "flxweb.dialog.close");
                return elm.dialog('close');
            }

            function showOrHideIframe() {
                if ($('.ui-widget-overlay').length === 0) {
                    $('#artifact_content iframe').css('visibility','visible');
                } else {
                    $('#artifact_content iframe').css('visibility','hidden');
                }
            }

            elm = $.extend({
                'open' : openDialog,
                'close' : closeDialog
            }, elm);

            //This event is triggered when dialog is closed.
            elm.bind( 'dialogclose', function() {
                showOrHideIframe();
            });
            // This event is triggered when dialog is opened
            elm.bind( 'dialogopen', function() {
                showOrHideIframe();
            });
            return elm;
        }

        this.init = init;
    }

    return new assessmentFrameListener();
}
);
