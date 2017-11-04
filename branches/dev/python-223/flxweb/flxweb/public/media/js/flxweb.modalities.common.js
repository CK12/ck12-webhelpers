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
 * iThis file originally written by Akshay Valsa
 *
 * $id$
 */
define('flxweb.modalities.common', ['jquery', 'common/utils/utils','jquery.appdownload'], function ($, Util,smartbanner) {
    'use strict';

    $(document).ready(function () {
        window.title = $('.artifact-title-details', '#artifact_title').text().trim() || $('.modalitylabel div').text().trim();
        // if ( !(/(iPhone).*OS [9,10].*AppleWebKit.*Version.*Mobile.*Safari/.test(navigator.userAgent)) ) {
        //	addSmartBanner();
        // }
        addSmartBanner();
        $('.pdf, .mobi, .epub, .html, .turquoise.download').off('click.ads_download').on('click.ads_download', function (event) {
            var cls = $(event.currentTarget).attr('class'),
                other_dwnld = false,
                ext = 'unknown',
                payload = {};
            // Get the extention from href.
            if (cls.indexOf('turquoise download') > 0) {
                other_dwnld = true;
                var href = $(event.currentTarget).attr('href'),
                    name = href.split('/').splice(-1, 1);
                if (name && name[0].indexOf('.') > 0) {
                    ext = name[0].split('.').splice(-1, 1)[0];
                }
            }
            payload.artifactID = window.artifactID;
            payload.memberID = ads_userid;
            if (other_dwnld) {
                payload.format = ext;
            } else {
                payload.format = $(event.currentTarget).attr('data-rendertype');
            }
            $.flxweb.logADS('fbs_download', payload);

        });

        $(document).off('click.ADS_CROSS_LINKS').on('click.ADS_CROSS_LINKS', '.x-ck12-crossref', function (event) {
            var goTo = this.getAttribute('href'); // store anchor href
            try {
                event.preventDefault(); // prevent default anchor behavior
                var payload = {};
                payload.artifactID = window.artifactID;
                payload.memberID = ads_userid;
                payload.context_eid = window.js_modality_data.domain.encodedID;
                payload.word = $(event.currentTarget).text();
                payload.clickedLink = $(event.currentTarget).attr('href');
                $.flxweb.logADS('FBS_CROSS_LINKS', payload);
            } catch (e) {
                console.log('ADS event for linked concept not fired.');
            } finally {
                setTimeout(function () {
                    window.location = goTo;
                }, 1000);
            }
        });
        function addSmartBanner(){
   	     if($.smartbanner){
    		    $.smartbanner({
			    title: 'CK-12',
			    author : "CK-12 Foundation",
			    daysHidden: 2,
			    daysReminder : 2,
			    icon : "/media/images/logo_120.png",
			    appendToSelector: $('.content-wrap')
		     	 });
             }
        }
        function getSearchTerm(name, url){
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

        function modalitiesADS(){
            var payload, searchTerm = getSearchTerm('referrer', window.location.href);
            if (searchTerm) {
                payload = {
                        'referrer': searchTerm,
                        'artifactID': artifactID,
                        'context_eid': window.js_modality_data.domain.encodedID,
                        'modality_type':  window.js_modality_data.artifact.artifactType,
                        'user_role': flxweb_role
                };
                if (window.js_collection_data && window.js_collection_data.collection && window.js_collection_data.collection.descendantCollection) {
                    payload.collectionHandle = window.js_collection_data.collection.handle;
                    payload.conceptCollectionAbsoluteHandle = window.js_collection_data.collection.descendantCollection.absoluteHandle;
                    payload.collectionCreatorID = window.js_collection_data.collection.creatorID;
                }
                if (window._ck12) {
                    window._ck12.logEvent('FBS_MODALITY', payload);
                }
            }
        }

        function getSimilarArtifact(handle) {
            var _d = $.Deferred();
            Util.ajax({
                'url': Util.getApiUrl('flx/get/canonical/') + artifactID,
                'dataType': 'json',
                'isShowLoading': true,
                'success': function (data) {
                    _d.resolve(data.response);
                },
                'error': function () {
                    _d.reject('Failed to load similar artifact');
                }
            });
            return _d.promise();
        }

        function addCanonicalTag() {
            var creator, published, similarArtifact, href, bookTypes = ['book', 'tebook', 'workbook', 'studyguide', 'labkit', 'quizbook'];
            if (typeof artifact_json_encoded !== 'undefined') {
                creator = artifact_json_encoded.creator;
                published = artifact_json_encoded.published;
            } else if (typeof js_modality_data !== 'undefined') {
                creator = js_modality_data.artifact.creator;
                published = js_modality_data.artifact.published;
            }
            if ((creator !== 'CK-12') && published) {
                getSimilarArtifact().done(function(data) {
                    if (data && data.artifact) {
                        similarArtifact = data.artifact;
                        if ($.inArray(similarArtifact.artifactType, bookTypes) !== -1) {
                            href = 'https://www.ck12.org/' + similarArtifact.artifactType + '/' + similarArtifact.handle + '/section/' + data.sequence + '/';
                            $('link[rel="canonical"]').attr('href', href);
                        } else if (similarArtifact.artifactType === 'section') {
                            href = 'https://www.ck12.org/section/' + similarArtifact.handle + '/';
                            $('link[rel="canonical"]').attr('href', href);
                        } else if (similarArtifact.artifactType === 'lesson') {
                            href = 'https://www.ck12.org/' + similarArtifact.domain.branchInfo.handle.toLowerCase() + '/' + similarArtifact.domain.handle + '/lesson/' + similarArtifact.handle;
                            $('link[rel="canonical"]').attr('href', href);
                        }
                    }
                });
            }
        }
        if (window.pageSubType === 'Read') {
            addCanonicalTag();
        }
        //modalitiesADS();
    });
});
