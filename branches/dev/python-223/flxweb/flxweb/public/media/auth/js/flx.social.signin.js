/**
 * Copyright 2007-2014 CK-12 Foundation
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
 * $Id: $
 */
function receiveMessage(event) {
    'use strict';

    try {
        if (event.data) {
            var event_data = JSON.parse(event.data),
                returnTo = window.returnTo;
            if (event_data.hasOwnProperty('auth') || event_data.hasOwnProperty('auth_new')) {
                if (0 === parseInt(event_data.auth, 10) || 0 === parseInt(event_data.auth_new, 10)) { //Success
                    if (!returnTo) {
                        returnTo = '/';
                    }
                    if (event_data.hasOwnProperty('auth_new')) {
                        window.location.href = '/auth/signup/complete?returnTo=' + encodeURIComponent(returnTo || window.location.href) + (window.requestor ? '&requestor=' + window.requestor : '');
                    } else {
                        window.location.href = '/account/signin-complete/' + window.provider + '/?redirect=' + encodeURIComponent(returnTo || window.location.href);
                    }
                } else {
                    console.log('Could not recognize the auth status');
                }
            }
        }
        window.removeEventListener('message', receiveMessage, false);

        if ('https://api.twitter.com' === event.origin) {
            window.addEventListener('message', receiveMessage, false);
        }
    } catch (e) {
        console.log(e);
    }
}

window.signin_click = function (provider, rurl, role) {
    'use strict';

    window.removeEventListener('message', receiveMessage, false);
    window.removeEventListener('message', receiveMessage, false);
    window.addEventListener('message', receiveMessage, false);
    window.provider = provider;

    var url = '/auth/login/member/' + provider;
    if (role) {
        url = url + '?role=' + role + '&url=' + encodeURIComponent(rurl);
    } else {
        url = url + '?url=' + encodeURIComponent(rurl);
    }
    if (!window.isWebView()) {
        window.open(url, provider + '_window', 'location=no, menubar=no, resizable=yes status=no, scrollbars=no, width=880, height=400');
    } else {
        url = url + '&popup=false' + '&returnTo=' + encodeURIComponent(window.returnTo) + '&requestor=' + encodeURIComponent(window.requestor);
        window.location.href = url;
    }
    return false;
};
