
/* global gapi */
define(['jquery'], function($) {
    'use strict';


    var Base64 = {

        // private property
        _keyStr : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

        // public method for encoding
        encode : function (input) {
            var output = '';
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

            }

            return output;
        },

        // public method for decoding
        decode : function (input) {
            var output = '';
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\-_\.]/g, '');

            while (i < input.length) {

                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            }

            output = Base64._utf8_decode(output);

            return output;

        },

        // private method for UTF-8 encoding
        _utf8_encode : function (string) {
            string = string.replace(/\r\n/g,'\n');
            var utftext = '';

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode : function (utftext) {
            var string = '';
            var i = 0;
            var c = 0, c2 = 0, c3 = 0;

            while ( i < utftext.length ) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        },

        jqSafe : function(str) {
            str = str.replace(/\./g, '\\.');
            return str.replace(/:/g, '\\:');
        }

    };

    function initializeModal() {
        var options = {},
            closeTimeout,
            openTimeout,
            hostPath;

        //load the google classroom JS
        //Keeping it here, to reduce dependency on <script> tag in other files.
        if(!document.getElementById('googleClassroomScript')) {
            window.___gcfg = {
                parsetags: 'explicit'
            };

            var gcScript = document.createElement('SCRIPT');
            gcScript.id = 'googleClassroomScript';
            gcScript.setAttribute('type', 'text/javascript');
            gcScript.setAttribute('src', 'https://apis.google.com/js/platform.js');
            document.head.appendChild(gcScript);
        }


        function open(dataOptions) {
            hostPath = dataOptions._ck12 ? '' : window.shareRootPath;
            if(!document.getElementById('shareEmailCss')) {
                var link = document.createElement('LINK');
                link.id = 'shareEmailCss';
                link.setAttribute('type', 'text/css');
                link.setAttribute('href', hostPath + '/media/common/css/share.via.email.css');
                link.setAttribute('rel', 'stylesheet');
                document.head.appendChild(link);
            }

            if(dataOptions) {
                options.shareImage = dataOptions.shareImage || '';
                options.shareTitle = dataOptions.shareTitle || '';
                options.resourceType = dataOptions.resourceType || 'resource';
                options.shareUrl = dataOptions.shareUrl || '';
                options.shareBody = dataOptions.shareBody || '';
                options.userSignedIn = dataOptions.userSignedIn || false;
                options.shareContext =  dataOptions.context || 'Share this Resource';
                options.sharePayload = dataOptions.payload || {};
                options.purpose = dataOptions.purpose || 'share';
                options.userEmail = dataOptions.userEmail;
                options.eventType = dataOptions.eventType || 'fbs_share';
                options.shareType = dataOptions.shareType || 'shareoplane';
                options.disableSocialShare = dataOptions.disableSocialShare || false;
                options.disableShareLink = dataOptions.disableShareLink || false;
            }
            logShareAds(options.eventType, options.shareType);
            if(link) {
                link.onload = function(){
                    buildOut();
                };
            } else {
                buildOut();
            }
        }
        function close() {
            clearTimeout(openTimeout);
            options.modal.classList.remove('share-open');
            options.modal.style.top = '-1000px';
            options.overlay.classList.remove('share-open');
            closeTimeout = setTimeout(function(){
                options.overlay.classList.add('hide');
            }, 800);
            var e = document.createEvent('Events');
            e.initEvent('shareClose', true, true);
            document.dispatchEvent(e);
        }
        function buildOut() {
            if(document.getElementById('shareViaEmailModal')) {
                clearTimeout(closeTimeout);
                options.modal.classList.add('share-open');
                openTimeout = setTimeout(function(){
                    options.overlay.classList.add('share-open');
                }, 200);
                options.overlay.classList.remove('hide');
                options.modal.style.top = (window.scrollY || window.pageYOffset) + 100 + 'px';
                document.getElementById('email-box-container').classList.remove('hide');
                document.getElementById('email-sent-thanks').classList.add('hide');
                renderPopUp();
            } else {
              //Get the html for share email modal.
                var xmlhttp;
                xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && !document.getElementById('shareViaEmailModal')) {
                        createPopup(xmlhttp.responseText);
                        initializeEvents.call();
                        renderPopUp();
                        options.modal.className = options.modal.className + ' share-open';
                        options.overlay.className = options.overlay.className + ' share-open';
                        options.modal.style.top = (window.scrollY || window.pageYOffset) + 100 + 'px';
                    }
                };
                xmlhttp.open('GET', hostPath + '/media/common/js/templates/share.via.email.html', true);
                xmlhttp.send();
            }
        }
        function createPopup(content) {
            var docFrag;
            docFrag = document.createDocumentFragment();

            // Create modal element
            options.modal = document.createElement('div');
            options.modal.className = 'share-via-email-modal';
            options.modal.id = 'shareViaEmailModal';
            options.modal.style.top = '-1000px';

            options.overlay = document.createElement('div');
            options.overlay.className = 'share-overlay';
            docFrag.appendChild(options.overlay);

            options.modal.innerHTML = content;
            options.closeButton = document.getElementsByClassName('js-close-share');

            docFrag.appendChild(options.modal);

            document.body.insertBefore(docFrag, document.body.firstChild);

        }

        function getUtmUrl(someUrl,medium,source,content) {
            //remove any existing utm params
            someUrl = removeParamFromUrl('utm_source',someUrl);
            someUrl = removeParamFromUrl('utm_medium',someUrl);
            someUrl = removeParamFromUrl('utm_campaign',someUrl);
            someUrl = removeParamFromUrl('utm_content',someUrl);
            var utmParams = (medium) ? 'utm_medium=' + encodeURIComponent(medium) : '';
            utmParams += (source) ? '&utm_source=' + encodeURIComponent(source) : '';
            utmParams += (content) ? '&utm_content=' + encodeURIComponent(content) : '';
            utmParams += '&utm_campaign=product';

            if (someUrl.indexOf('?') !== -1) {
                someUrl = someUrl + '&' + utmParams;
            } else {
                someUrl = someUrl + '?' + utmParams;
            }
            return someUrl;
        }

        function renderPopUp() {
            var artifactLink = options.modal.getElementsByClassName('share-artifact-url'),
                shareImageElem = options.modal.getElementsByClassName('artifact-email-image'),
                shareTitleElem = options.modal.getElementsByClassName('share-artifact-title'),
                unregisteredUserRows = options.modal.getElementsByClassName('unregistered-user-row'),
                shareDetailsContainer = options.modal.getElementsByClassName('share-email-artifact-container'),
                ShareBodyElem = options.modal.getElementsByClassName('share-email-body'),
                inputElems = options.modal.getElementsByClassName('input-header'),
                facebookLink = options.modal.getElementsByClassName('share-facebook-link')[0],
                twitterLink = options.modal.getElementsByClassName('share-twitter-link')[0],
                pinterestLink = options.modal.getElementsByClassName('share-pinterest-link')[0],
                googleClassroomLink = options.modal.getElementsByClassName('share-google-classroom-link')[0],
                shareContextText = options.modal.getElementsByClassName('share-context')[0],
                index = 0,
                //shareContext is the only param that shows what type of share this is.
                //Use it for utm_content and replace any spaces with hyphens
                context= options.shareContext.replace(/\s+/g,'-').trim().toLowerCase();

            if(artifactLink.length) {
                var aLink = getUtmUrl(options.shareUrl, 'email','share-content-' + context);
                for(index = 0; index < artifactLink.length; index++) {
                    artifactLink[index].innerHTML = aLink;
                    artifactLink[index].setAttribute('href', aLink);
                }
            }
            if(shareImageElem.length) {
                for(index = 0; index < shareImageElem.length; index++) {
                    shareImageElem[index].setAttribute('src', options.shareImage);
                }
            }
            if(shareTitleElem.length) {
                for(index = 0; index < shareTitleElem.length; index++) {
                    shareTitleElem[index].textContent = options.shareTitle;
                }
            }
            if(ShareBodyElem.length) {
                for(index = 0; index < ShareBodyElem.length; index++) {
                    if(options.shareBody) {
                        shareDetailsContainer[index].style.display = 'none';
                        ShareBodyElem[index].innerHTML = options.shareBody;
                    } else {
                        shareDetailsContainer[index].style.display = 'inline-block';
                        if(options.resourceType === 'questionDiscussion'){
                            ShareBodyElem[index].innerHTML = 'Hi! There\'s an interesting discussion happening here.<br/>Join the conversation' ;
                        }else if(options.resourceType === 'Discussion'){
                            ShareBodyElem[index].innerHTML = 'Hi! I\'d like to invite you to join this discussion at the CK-12 Cafe:';
                        }else{
                            ShareBodyElem[index].innerHTML = 'Hi! I have found this great resource at CK-12...';
                        }
                    }
                }
            }
            for(index = 0; index < inputElems.length; index++) {
                inputElems[index].value = '';
            }
            hideErrorelements( options.modal.getElementsByClassName('recepient-box')[0]);
            hideErrorelements(options.modal.getElementsByClassName('fullname-box')[0]);
            hideErrorelements(options.modal.getElementsByClassName('user-email-box')[0]);
            if(options.userSignedIn) {
                for(index = 0; index < unregisteredUserRows.length; index++) {
                    unregisteredUserRows[index].classList.add('hide');
                }
            }
            var socialLink = getUtmUrl(options.shareUrl, 'social','share-content-' + context);
            facebookLink.href = 'https://www.facebook.com/sharer.php?u=' + encodeURIComponent(socialLink + '&utm_content=facebook');
            twitterLink.href = 'http://twitter.com?status=Check%20out%20this%20awesome%20resource%20I%20found%20via%20%40ck12foundation%3A' + encodeURIComponent(socialLink + '&utm_content=twitter');
            pinterestLink.href = 'https://www.pinterest.com/pin/create/button/?url=' + encodeURIComponent(socialLink + '&utm_content=pinterest');
            if(options.shareContext.match(/brainflex/gi)) {
                pinterestLink.href += '&media=' + window.location.protocol + '//' + window.location.host + '/assessment/ui/public/lib/summer/brainflex_fb_preview.png&description=' + options.shareTitle;
            } else {
                pinterestLink.href += '&media=' + options.shareImage + '&description=' + options.shareTitle;
            }

            if(googleClassroomLink) {
                googleClassroomLink.setAttribute('data-url', getUtmUrl(options.shareUrl, 'lms','share-content-' + context,'google_classroom'));
            }
            if (typeof (gapi) !== 'undefined' && typeof (gapi.sharetoclassroom) !== 'undefined') {
                // NOTE: onsharestart not support on I.E browser
                // https://developers.google.com/classroom/guides/sharebutton#what_web_browsers_are_supported_hide-from-toc
                gapi.sharetoclassroom.render('googleClassroomContainer', {'onsharestart': logGoogleClassromShare, 'url': options.shareUrl});
            }
            shareContextText.textContent = options.shareContext;
            if (options.disableSocialShare) {
                $(options.modal).addClass('disable-social-share');
            }
            if (options.disableShareLink) {
                $(options.modal).find('.share-artifact-url').addClass('disable-share-link');
            }
        }

        function logGoogleClassromShare() {
            logShareAds('fbs_share','google_classroom');
        }

        function parseEmail(email) {
            var regx = /(^<).+(>$)/gi;
            email =  email.replace(regx,function(match, patt1, patt2){return match.replace(patt1, '').replace(patt2, '');});
            return email;
        }

        function initializeEvents() {
            var sendShareMailElem = document.getElementById('sendShareEmail'),
                recepientListElem = document.getElementById('recepients-list'),
                emptyErrorMsg = options.modal.getElementsByClassName('empty-error-msg')[0],
                errorIcon = options.modal.getElementsByClassName('error-icon')[0],
                invalidMsg = options.modal.getElementsByClassName('invalid-email-msg')[0],
                emailBoxContainer = document.getElementById('email-box-container'),
                emailSentThanks = document.getElementById('email-sent-thanks'),
                loadingElem = document.getElementById('share-mail-loading-icon'),
                pageDisableElem = document.getElementById('share-email-page-disable'),
                userFullname = document.getElementById('share-sender-name'),
                fullnameErrorMsg = document.getElementById('fullname-error-msg'),
                senderEmail = document.getElementById('share-sender-mail'),
                senderEmailErrorMsg = document.getElementById('sender-email-error-msg'),
                senderEmailInvalidMsg = document.getElementById('sender-email-invalid-msg'),
                socialShareLinks = options.modal.getElementsByClassName('socialshare'),
                i;

            recepientListElem.addEventListener('keyup', function() {
                hideErrorelements(recepientListElem);
            });
            recepientListElem.addEventListener('paste', function() {
                hideErrorelements(recepientListElem);
            });
            userFullname.addEventListener('keyup', function() {
                hideErrorelements(userFullname);
            });
            senderEmail.addEventListener('keyup', function() {
                hideErrorelements(senderEmail);
            });
            sendShareMailElem.addEventListener('click', function() {
                var recipientEmailList = recepientListElem.value,
                    emailList = recipientEmailList.split(','),
                    nameValid = true,
                    emailValid = true,
                    senderEmailValid = true,
                    senderEmailValue = senderEmail.value,
                    i;
                if(!userFullname.parentElement.classList.contains('hide') && userFullname.value.trim() === '') {
                    fullnameErrorMsg.classList.remove('hide');
                    userFullname.classList.add('input-required');
                    nameValid = false;
                }

                if(!senderEmail.parentElement.classList.contains('hide')) {
                    if(senderEmailValue.trim() === '') {
                        senderEmailErrorMsg.classList.remove('hide');
                        senderEmail.classList.add('input-required');
                        senderEmailValid = false;
                    } else {
                        senderEmailValue = parseEmail(senderEmailValue);
                        if(!validateEmail(senderEmailValue.trim())) {
                            senderEmail.classList.add('input-required');
                            senderEmailInvalidMsg.classList.remove('hide');
                            senderEmailValid = false;
                        }
                    }
                }

                if(recepientListElem.value.trim() === '') {
                    recepientListElem.classList.add('input-required');
                    emptyErrorMsg.classList.remove('hide');
                    errorIcon.classList.remove('hide');
                    emailValid = false;
                } else {
                    for(i=0; i<emailList.length; i++) {
                        emailList[i] = parseEmail(emailList[i]);
                        if(!validateEmail(emailList[i])) {
                            recepientListElem.classList.add('input-required');
                            invalidMsg.classList.remove('hide');
                            errorIcon.classList.remove('hide');
                            emailValid = false;
                        } else {
                            emailValid = true;
                        }
                    }
                    recipientEmailList = emailList.join();
                }
                if(nameValid && emailValid && senderEmailValid) {
                    loadingElem.classList.remove('hide');
                    pageDisableElem.classList.remove('hide');
                    var xmlhttp, emailData, emailResponse, emailBody = document.getElementById('share-email-template').cloneNode(true);
                    if(options.shareBody) {
                        emailBody.removeChild(emailBody.getElementsByClassName('share-email-artifact-container')[0]);
                    }
                    xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function() {
                        if(xmlhttp.readyState == 4) {
                            if (xmlhttp.status == 200) {
                                // emailResponse = JSON.parse(xmlhttp.response);
                                emailResponse = xmlhttp.response;
                                if(emailResponse.response.hasOwnProperty('message')) {
                                    if (emailResponse.responseHeader.status === 10001) {
                                        //log email quota to ADS
                                        logShareAds('fbs_share_email_quota_exceeded','email');
                                    }
                                    alert(emailResponse.response.message);
                                } else {
                                    emailBoxContainer.classList.add('hide');
                                    emailSentThanks.classList.remove('hide');
                                    if (window.innerWidth < 768) {
                                        window.scrollTo(0,0);
                                    }
                                }
                            } else {
                                alert('Sorry, We couldn\'t perform this action. Please try again after sometime.');
                            }
                            loadingElem.classList.add('hide');
                            pageDisableElem.classList.add('hide');
                        }
                    };
                    xmlhttp.open('POST', hostPath + '/flx/send/email', true);
                    xmlhttp.setRequestHeader('Accept','*/*');
                    xmlhttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
                    xmlhttp.withCredentials=true;
                    xmlhttp.responseType = 'json';
                    var emailDataJSON = {
                        'receivers': recipientEmailList,
                        'subject': options.shareTitle,
                        'body': emailBody.innerHTML,
                        // Safely encode to support unicode strings in names
                        'senderName' : window.btoa(encodeURIComponent(document.getElementById('share-sender-name').value)),
                        'senderEmail': senderEmailValue,
                        'purpose': options.purpose
                    };
                    console.log(emailDataJSON);
                    var encodedData = Base64.encode(JSON.stringify(emailDataJSON));
                    emailData = ('data='+encodeURIComponent( encodedData )).replace(/%20/g, '+');
                    xmlhttp.send(emailData);
                    logShareAds('fbs_share_complete');
                }
            });

            for(i = 0; i < socialShareLinks.length; i++) {
                socialShareLinks[i].addEventListener('click', function() {
                    logShareAds('fbs_share', this.dataset.sharetype);
                });
            }

            for(i = 0; i < options.closeButton.length; i++) {
                options.closeButton[i].addEventListener('click', close);
            }
            options.overlay.addEventListener('click', close);
        }

        // function transitionSelect() {
        //     var el = document.createElement('div');
        //     if (el.style.WebkitTransition) return 'webkitTransitionEnd';
        //     if (el.style.OTransition) return 'oTransitionEnd';
        //     return 'transitionend';
        // }

        function validateEmail(value) {
            return (/(^[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+)*|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-011\013\014\016-\177])*")@(?:[A-Z0-9]+(?:-*[A-Z0-9]+)*\.)+[A-Z]{2,6}$/i).test(value.trim());
        }

        function hideErrorelements(temp) {
            temp.classList.remove('input-required');
            while(temp.previousElementSibling) {
                temp.previousElementSibling.classList.add('hide');
                temp = temp.previousElementSibling;
            }
            $('.to-label,.user-label,.from-label').removeClass('hide');
        }

        function logShareAds(eventType, shareType) {
            var dataLayer;
            if(eventType === 'fbs_share_complete') {
                options.sharePayload['from_email'] = options.userEmail || document.getElementById('share-sender-mail').value || '';
                options.sharePayload['to_email'] = document.getElementById('recepients-list').value;
            }
            options.sharePayload['url'] = options.shareUrl;
            options.sharePayload['social_network'] = shareType || '';
            if(options.sharePayload.hasOwnProperty('timestamp')) {
                delete options.sharePayload['timestamp'];
            }
            if(window.dexterjs) {
                var payload = JSON.parse(JSON.stringify(options.sharePayload));
                window.dexterjs.logEvent(eventType, payload);
            }
            //log to GA as well
            dataLayer = window.dataLayer || [];
            var gtmPayload = {};
            gtmPayload['event'] = eventType;
            for (var property in options.sharePayload) {
                gtmPayload[property] = options.sharePayload[property];
            }
            dataLayer.push(gtmPayload);
        }

        function removeParamFromUrl(parameter, url) {
            return url
                .replace(new RegExp('[?&]' + parameter + '=[^&#]*(#.*)?$'), '$1')
                .replace(new RegExp('([?&])' + parameter + '=[^&]*&'), '$1');
        }
        this.open = open;
    }
    return new initializeModal();
});
