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
 * $Id: flx.global.js 14261 2011-12-21 05:44:52Z hana $
 */

(function($) {

    // Global FLX object
    $.flx = {};

    function signin_click(provider, url) {
        // url = '/login/member/' + provider + '?url=/verify/member/' + provider
        url = '/auth/login/member/' + provider + '?url=' + escape(url)
        window.open(url, provider + '_window', 'location=no, menubar=no, resizable=yes status=no, scrollbars=no, width=880, height=400');
        return false
    }

    function fb_signin_click(event) {
        url = event.data.url
        return signin_click('facebook', url)
    }

    function twitter_signin_click(event) {
        url = event.data.url
        return signin_click('twitter', url)
    }

    function google_signin_click(event) {
        url = event.data.url
        return signin_click('google', url)
    }

    function ck12_signin_click(event) {
        url = event.data.url
        return signin_click('ck12', url)
    }


    // Global Page-Load Initializations
    function documentReady(){
        $('#js_ck12fbsignin').live('click', { 'url': $('#js_ck12fbsignin').attr('value') }, fb_signin_click);
        $('#js_ck12twittersignin').live('click', { 'url': $('#js_ck12twittersignin').attr('value') }, twitter_signin_click);
        $('#js_ck12googlesignin').live('click', { 'url': $('#js_ck12googlesignin').attr('value') }, google_signin_click);
        $('#js_ck12signin').live('click', { 'url': $('#js_ck12signin').attr('value') }, ck12_signin_click);
        $.extend(true, $.flx, {
        });
    }

    $(document).ready(documentReady);
})(jQuery);
