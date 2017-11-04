define([
    'softRegistration/SoftRegistrationADS',
    'softRegistration/utils'
], function(SoftRegistrationADS, utils) {



    //Registration Methods ;
    var extSignInParamsObject = {
        // provider
        // requestor
        // returnTo
        //
    };
    var DEFAULT_PROTOCOL = 'https://';


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
                        var eventType = window.apiCaller == 'SIGN_UP' ? 'FBS_SIGNUPS' : 'FBS_SIGNINS';
                        SoftRegistrationADS.logADS(eventType, {
                            referrer: utils.getReferrer(),
                            authType: window.provider
                        });
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

    function signin_click(provider, rurl, requestor, returnTo, role, apiCaller) {
        'use strict';

        window.removeEventListener('message', receiveMessage, false);
        window.removeEventListener('message', receiveMessage, false);
        window.addEventListener('message', receiveMessage, false);
        window.provider = provider;
        window.returnTo = returnTo;
        window.requestor = requestor;
        window.role = role;
        window.apiCaller = apiCaller;

        var url = DEFAULT_PROTOCOL + document.location.hostname + '/auth/login/member/' + provider;
        if (role) {
            url = url + '?role=' + role + '&url=' + encodeURIComponent(rurl);
        } else {
            url = url + '?url=' + encodeURIComponent(rurl);
        }

        if (!window.isWebView()) {
            window.open(url, provider + '_window', 'location=no, menubar=no, resizable=yes status=no, scrollbars=no, width=880, height=400');
        } else {
            url = url + '&popup=false' + '&returnTo=' + encodeURIComponent(returnTo) + '&requestor=' + encodeURIComponent(requestor);
            window.location.href = url;
        }
        return false;
    }

    // Method to  invoke API for internal Sign up
    var handleInternalSignUp = function(data) {
        return $.ajax({
            type: "POST",
            xhrFields: {
                withCredentials: true
            },
            url: DEFAULT_PROTOCOL + document.location.hostname + "/auth/create/member",
            data: data,
            async: true,
            dataType: "json"
        });
    };

    // Method to invoke the external Login
    var handleExternalLogin = function(provider, apiCaller, role) {
        var url = DEFAULT_PROTOCOL + document.location.hostname + '/auth/verify/member/' + provider;
        var returnTo = document.location.href;
        // BUG 51964
        if (document.location.pathname == '/features') {
            var hashPartial = location.hash.replace('#', '');
            hashPartial = (hashPartial == 'group') ? 'groups' : hashPartial; // spl case for groups has hash is group and partial should be groups
            returnTo = '/my/' + hashPartial;
        }

        var requestor = document.location.protocol + '//' + document.location.hostname;
        signin_click(provider, url, requestor, returnTo, role, apiCaller);
    };

    // Method to invoke the internal signIn
    var handleInternalSignIn = function(data) {
        return $.ajax({
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            url: DEFAULT_PROTOCOL + document.location.hostname + "/auth/login/member",
            data: {
                login: data.user,
                token: data.token,
                authType: 'ck-12',
                remember: 'true'
            },
            dataType: 'json'
        });
    };

    var handleEmailCheck = function(val) {
        return $.ajax({
            type: "POST",
            url: DEFAULT_PROTOCOL + document.location.hostname + "/auth/validate/member/email",
            data: {
                email: val
            },
            async: true,
            dataType: "json"
        });
    };

    var handleBirthdayCheck = function(req) {
        return $.ajax({
            type: "POST",
            url: DEFAULT_PROTOCOL + document.location.hostname + "/auth/validate/member/birthday",
            data: req,
            async: true,
            dataType: "json"
        });
    };

    var handleUnderAgeSignUp = function(req) {
        return $.ajax({
            type: "POST",
            url: DEFAULT_PROTOCOL + document.location.hostname + "/auth/request/u13/signup",
            data: req,
            async: true,
            dataType: "json"
        });
    };

    return {
        handleInternalSignUp: handleInternalSignUp,
        handleExternalLogin: handleExternalLogin,
        handleInternalSignIn: handleInternalSignIn,
        handleEmailCheck: handleEmailCheck,
        handleBirthdayCheck: handleBirthdayCheck,
        handleUnderAgeSignUp: handleUnderAgeSignUp
    };
});
