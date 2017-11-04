/**
 * Copyright 2007-2013 CK-12 Foundation
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
define([
        'jquery',
        'underscore',
        'modality/services/services',
        'embed/utils/modality.utils',
        'embed/templates/embed.templates',
        'common/utils/url',
        'common/utils/modality',
        'common/views/assignment.quick.notification.view',
        'common/models/assignment.quick.notification.model',
        'modality/utils/plix.dressing'
    ],
    function ($, _, ES, MU, TMPL, URL, modalityUtil, QuickAssignmentNotificationView, QuickAssignmentNotificationModel, PlixDressing) {
        'use strict';
        var detailsTemplate = _.template(TMPL.MODALITY_DETAILS, null, {
            variable: 'data'
        });

        var ModalityEmbedView = function ( /*params, loader*/ ) {

            var mtype = '',
                mhandle = '',
                concept = '',
                branch = '',
                realm = '',
                referrer = '',
                hideConceptLink = '',
                appContext = '',
                fullViewArtifacts = ['asmtpracticeint', 'plix', 'simulationint'],
                noAssignmentNotificationAppContexts = ['lti'],
                collectionHandle = '',
                conceptCollectionAbsoluteHandle = '';
            

            function renderAssignmentNotification(modality){
                if ( appContext && noAssignmentNotificationAppContexts.indexOf(appContext) !== -1){
                    return;
                }
                var notificationView = new QuickAssignmentNotificationView({
                   model: new QuickAssignmentNotificationModel(modality.artifactID),
                   referrer: "EMBED_VIEW"
                });
            }

            function renderModalitycontents(modality) {
                var rt = MU.getRenderType(modality), eid;
                modality.resource = MU.getModalityResource(modality);
                //console.log(rt);
                switch (rt) {
                    case 'ilo':
                        $('#modality_content').html(_.template(TMPL.MODALITY_DETAILS_ILO, modality, {
                            variable: 'modality'
                        }));
                        $('#modality_content iframe').width('100%').height(600);

                        break;
                    case 'exercise':
                        $('#modality_content').html('THIS IS AN exercise MODALITY!!');
                        break;
                    case 'asmtpractice':
                        var asmt_iframe_url = '/assessment/ui/embed.html?headless=true&hash=test/detail/practice/' + modality.handle;
                        $('#modality_content').html($('<iframe width="100%" height="500" frameborder="0" />').attr('src', asmt_iframe_url));

                        break;
                    case 'asmtquiz':
                        ES.getQuizInfo(modality.perma).done(function(data){
                            var asmtquiz_iframe_url ='/assessment/ui/embed.html?test/detail/quiz/'+ data.test._id;
                            $('#modality_content').html($('<iframe width="100%" height="500" frameborder="0" />').attr('src', asmtquiz_iframe_url));

                        });
                        break;
                    case 'read':
                        ES.getModalityXHTML(modality.artifactType, modality.handle, modality.realm, modality.domain ? modality.domain.encodedID : 'UGC.UBR', modality.latestRevision)
                            .done(function (data) {
                                if ( fullViewArtifacts.indexOf(modality.artifactType) === -1){
                                    var href;
                                    $('#modality_content').html(data).find('iframe').not('iframe[src*="tuvalabs.com"]').wrap('<div class="flex-video"></div>');
                                    // Do not use crosslinking for apps with inappbrowser
                                    // [Bug 43148] Remove this block when embed view works with inappbrowser
                                    if (/_app$/.test(referrer)) {
                                        // Remove the hyperlink
                                        $('#modality_content a.x-ck12-crossref').contents().unwrap();
                                        $('#modality_content a').each(function () {
                                            if (!$(this).hasClass('x-ck12-crossref')) {
                                                $(this).attr('target', '_blank');
                                                if ($(this).attr('href').indexOf('http:') === 0) {
                                                    $(this).attr('href', $(this).attr('href').replace('http:', 'https:'));
                                                }
                                            }
                                        });
                                    } else {
                                        $('#modality_content a').removeAttr('target').filter(function () {
                                            return $(this).hasClass('x-ck12-crossref');
                                        }).each(function () {
                                            href = this.getAttribute('href').split('/');
                                            href = '/embed/#module=concept&handle=' + href[2].replace('?', '&') + '&branch=' + href[1].replace('?', '&') + '&nochrome=true&view_mode=embed';
                                            this.setAttribute('href', href);
                                        });
                                    }
                                    // [Bug 44165] All externals urls should open in new window.
                                    $('#modality_content a').each(function () {
                                        if (!$(this).hasClass('x-ck12-crossref')) {
                                            $(this).attr('target', '_blank');
                                        }
                                    });
                                }
                                window.setTimeout(renderMathJax, 3000);
                            });
                        break;
                    case 'quiz':
                    case 'download':
                        $('#modality_content').html(_.template(TMPL.MODALITY_DETAILS_DOWNLOAD, modality, {
                            variable: 'modality'
                        }));
                        $('#modality_content a').attr('target', '_blank');
                        break;
                    case 'link':
                        $('#modality_content').html(_.template(TMPL.MODALITY_DETAILS_LINK, modality, {
                            variable: 'modality'
                        }));
                        break;
                    case 'embed':
                        $('#modality_content').html(_.template(TMPL.MODALITY_DETAILS_EMBED, modality, {
                            variable: 'modality'
                        }));
                        break;
                    default:
                        $('#modality_content').html('Unsupported modality type: ' + modality.artifactType);
                        break;
                }
                if (rt !== 'download') {
                    $('#modality_content a').removeAttr('target');
                }
		// LMS embed view terms of use update
                if (appContext === 'lti'){
                    $('#lms_banner_alert').removeClass('hide');
                    $('#lms_banner_alert').css({top:'-18px'});
                }
            }
            
            function logADSEvent (event, payload) {
                if (window.dexterjs) {
                    window.dexterjs.logEvent(event, payload);
                }
            }

            function getQueryParam(name, url){
                var regexS = "[\\?&]"+name+"=([^&#]*)";
                var regex = new RegExp( regexS );
                var tmpURL = (url === undefined) ? window.location.href : url;
                var results = regex.exec( tmpURL );
                if( results === null ) {
                  return "";
                } else {
                  return results[1];
                }
            }

            function renderModality(modality) {
                var concept_url, 
                    referrer,
                    collectionHandle,
                    conceptCollectionAbsoluteHandle,
                    collectionCreatorID,
                    payload = {};
                if ( fullViewArtifacts.indexOf(modality.artifactType)!== -1 ){
                    window.location.href = $('#lnk_ext').attr('href');
                } else {
                    concept_url = new URL();
                    concept_url.updateHashParams({
                        'module': 'concept',
                        'handle': concept,
                        'branch': branch,
                        'mtype': null,
                        'mhandle': null,
                        'context': null,
                        'referrer': referrer,
                        'selectedFilter': modalityUtil.getModalityClassName(modality.artifactType)
                    });
                    modality.concept_url = concept_url.url();
                    modality.hideConceptLink = hideConceptLink;
                    $('#embed_container').html(detailsTemplate(modality));
                    renderModalitycontents(modality);
                    appContext = concept_url.hash_params.app_context;
                    renderAssignmentNotification(modality);

                    //ADS logging
                    payload.artifactID = modality.artifactID;
                    payload.memberID = window.ads_userid;
                    if (modality.domain) {
                        payload.context_eid = modality.domain.encodedID;
                    }
                    payload.modality_type = modality.artifactType;
                    payload.user_role = flxweb_role;
                    referrer = getQueryParam('referrer', window.location.href);
                    collectionHandle = getQueryParam('collectionHandle', window.location.href);
                    conceptCollectionAbsoluteHandle = getQueryParam('conceptCollectionAbsoluteHandle', window.location.href);
                    collectionCreatorID = getQueryParam('collectionCreatorID', window.location.href);
                    if (referrer) {
                        payload.referrer = referrer;
                    }
                    if (collectionHandle && conceptCollectionAbsoluteHandle) {
                        payload.collectionHandle = collectionHandle;
                        payload.conceptCollectionAbsoluteHandle = conceptCollectionAbsoluteHandle;
                        if (collectionCreatorID) {
                            payload.collectionCreatorID = collectionCreatorID;
                       }
                    }
                    logADSEvent('fbs_modality', payload);	
                }
            }

            function loadModality() {
                var extenal_url;
                if (collectionHandle && conceptCollectionAbsoluteHandle) {
                    extenal_url = '/' + ['c', collectionHandle, conceptCollectionAbsoluteHandle, mtype].join('/') + '/';
                } else if (branch) {
                    extenal_url = '/' + [branch, concept, mtype].join('/') + '/';
                } else {
                    extenal_url = '/' + mtype + '/';
                }

                if (realm) {
                    extenal_url += realm + '/';
                }
                extenal_url += mhandle + '/';
                if (referrer) {
                    extenal_url += '?referrer=' + referrer;
                }
                $('#lnk_ext').attr('href', extenal_url);
                ES.getModality(mtype, mhandle, concept, realm, null).done(renderModality);
            }
            
            function renderMathJax() {
                var cnt = 0;
                $('.x-ck12-mathEditor, .x-ck12-math, .x-ck12-hwpmath, .x-ck12-block-math', '#modality_content').each(function() {
                    try {
                        var mathLatex,
                    		$this = $(this),
                    		decodedTex;
                        if($this.hasClass('x-ck12-mathEditor') && $this.data('tex')){
                        	decodedTex = decodeURIComponent($this.attr('data-tex'));
                        	if (decodedTex.indexOf('\\begin{align') === -1) {
                        		mathLatex = '\\begin{align*}' + decodedTex + '\\end{align*}';
                        	} else {
                        		mathLatex = decodedTex;
                        	}
                        	mathLatex = ('@$' + mathLatex + '@$').replace(/</g, '&lt;');
                        	/*if($this.data("math-class")=="x-ck12-block-math"){
                            	mathLatex = "@$$"+mathLatex+"@$$";
                        	}
	                        else {
    	                        mathLatex = "@$"+mathLatex+"@$";
	                        }
    	                    mathLatex = mathLatex.replace(/</g, "&lt;");*/
        	                $this.html(mathLatex).removeAttr('data-tex-mathjax').closest('p').css('overflow-y','hidden');
            	            // MathJax.Hub.Queue(['Typeset', MathJax.Hub, $(this)[0]]);
                	        cnt ++;
                        }
                        else {
                        	if($this.attr('alt') !== undefined){
                        		$this.attr('alt',$this.attr('alt').replace("<", "\\lt ").replace(">", "\\gt "));
                        	}
                        	if(!$this.data('tex')){
                        		$this.remove();
                        	}
                        }
                    } catch (merr) {
                        console.log("Error rendering math: " + merr);
                    }
                });
                MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'modality_content']);
                PlixDressing.init();
                console.log("Queued " + cnt + " math expressions");
            }

            this.init = function (params) {
                mtype = params.mtype;
                mhandle = params.handle;
                concept = params.context;
                branch = params.branch;
                realm = params.realm;
                referrer = params.referrer;
                appContext = params.app_context || appContext;
                collectionHandle = params.collectionHandle;
                if (collectionHandle) {
                    if (params.conceptCollectionAbsoluteHandle) {
                        conceptCollectionAbsoluteHandle = params.conceptCollectionAbsoluteHandle;
                    } else if (params.conceptCollectionHandle) {
                        conceptCollectionAbsoluteHandle = params.conceptCollectionHandle.split('-::-')[1];
                    }
                }
                hideConceptLink = ('true' === params.hideConceptLink) ||  localStorage.getItem("calledFromWebPracticeApp") || sessionStorage.getItem("calledFromWebPracticeApp");
                if(localStorage.getItem("calledFromWebPracticeApp")){
                    sessionStorage.setItem("calledFromWebPracticeApp",localStorage.removeItem("calledFromWebPracticeApp"));
                    localStorage.removeItem("calledFromWebPracticeApp");
                };

                //branch = branch ? branch.toLowerCase() : 'na';
                //branch = branch.match(/user-generated-content/gi) ? 'na' : branch;
                //concept = concept || mhandle + '-1';
                loadModality();
            };

            this.hashchange = function () {
                //console.log('Modality view changed.');
            };

            this.destroy = function () {
                //console.log('Destroying Modality view');
            };
        };

        return ModalityEmbedView;
    });
