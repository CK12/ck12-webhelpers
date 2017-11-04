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
 * $id$
 */
define('flxweb.details.common', ['jquery',
        'flxweb.library.common',
        'flxweb.tooltip.view',
        'flxweb.bookbuilder',
        'common/views/assignment.quick.notification.view',
        'common/models/assignment.quick.notification.model',
        'modalityAssign/modality.assign.lib',
        'flxweb.utils.base64',
        'flxweb.utils.url',
        'flxweb.reviews',
        'flxweb.share.views',
        'common/views/modal.view',
        'cache/cdn_cache',
        'common/views/footer.view',
        'common/views/breadcrumb.view',
        'reader/reader.dialog',
        'common/services/email.services',
        'common/utils/lms',
        'ltiBridge',
        'flxweb.details.downloadPDF.dialog',
        'flxweb.details.image_attribution',
        'jquery-ui',
        'flxweb.global',
        'flxweb.edit.resource',
        'flxweb.vocabulary'
    ],
    function ($, Library, AssignTooltip, Bookbuilder, QuickAssignmentView, QuickAssignmentModel, modalityLib, Base64, Url, ReviewsModule, ShareViews, ModalView, CDNCache, FooterView, Breadcrumb, ReaderDialog, EmailServices, lmsUtil, ltiBridge, downloadPDFDialog) {
        'use strict';
        //        var adsVisitTime = new Date().getTime();

        /*function renderSuccess(evt) {
            var download_url, render_link_id, task_type, download_link, artifact_id, payload;
            download_url = evt.task_status.userdata.downloadUri;
            render_link_id = evt.task_type + (evt.render_template || '') + 'download';
            $('#' + render_link_id).show().next().addClass('hide');
            task_type = evt.task_type;
            download_link = $('#' + task_type + 'download');
            download_link.attr('href', download_url).attr('target', '_blank').unbind('click');
            artifact_id = evt.artifact_id;
            //ADS log download event
            payload = {};
            payload.artifactID = artifact_id;
            payload.memberID = ads_userid;
            payload.format_2 = task_type;
            $.flxweb.logADS('fbs_download', payload);
            //$.flxweb.logADS('fbs_download', 'downloaded', 1, [artifact_id, revision_id, ads_userid], [task_type]);
            window.open(download_url, 'downloadwindow');
        }

        function renderError(evt) {
            var render_link_id = evt.task_type + (evt.render_template || '') + 'download';
            $('#' + render_link_id).show().next().addClass('hide');
            if (evt.error_info.error === 'Unauthorized') {
                $.flxweb.showDialog('You need to be signed in to perform this action.', {
                    'title': 'Authentication Required',
                    'buttons': {
                        'Sign In': function () {
                            $(this).dialog('close');
                            $.flxweb.showSigninDialog();
                        },
                        'Cancel': function () {
                            $(this).dialog('close');
                        }
                    }
                });
            } else {
                $.flxweb.showDialog('Error generating ' + evt.task_type, {
                    'title': 'Error generating ' + evt.task_type
                });
            }
        }*/
	if (window.lmsContext === "lti-app"){
	    var LTIBridge = new ltiBridge();
	    var assignTooltip = new AssignTooltip({
		parent: $('.assign-to-lms')
	    });
	} else {
	    var assignTooltip = new AssignTooltip({
		parent: $('.assign-to-class')
	    });
	}
        function addArtifactUserNotification(objectID) {
            //Artifact Revision Available Notifications for doesn't exists, create new one
            var update_user_artifact_notification_url = webroot_url + 'flx/update/artifact/usernotification/' + objectID,
                data = {};
            data.sendEmailNotification = false;
            data.subscriberID = ads_userid;
            data.artifact_url = window.location.href.replace(window.location.hash, '');
            $.ajax({
                url: update_user_artifact_notification_url,
                cache: false,
                dataType: 'json',
                data: data
            });
        }

        function checkArtifactUserNotificationByFrequency(options) {
            $.ajax({
                url: options.notification_url,
                cache: false,
                dataType: 'json',
                data: options.data,
                success: function (status) {
                    if (status && status.hasOwnProperty('responseHeader') && 0 !== status.responseHeader.status) {
                        if ('off' !== options.frequency) {
                            options.successCallback(options.objectID);
                        } else {
                            options.failureCallback(options.context, 'ondemand');
                        }
                    }
                }
            });
        }

        function updateArtifactUserNotification(context, frequency) {
            //Check for both notifications with event type 'ARTIFACT_NEW_REVISION_AVAILABLE_WEB', frequencies off and ondemand
            var options = {};
            options.successCallback = addArtifactUserNotification;
            options.failureCallback = updateArtifactUserNotification;
            options.objectID = $(context).data('artifactid');
            options.context = context;
            options.data = {
                'objectID': options.objectID,
                'objectType': 'artifact',
                'notificationType': 'web'
            };
            if (!frequency) {
                frequency = 'off';
            }
            options.frequency = frequency;
            options.notification_url = webroot_url + 'flx/get/info/notification/ARTIFACT_NEW_REVISION_AVAILABLE_WEB/' + frequency;
            checkArtifactUserNotificationByFrequency(options);
        }

        /*function loadModalityAssign(){
            modalityLib.init();
        }*/
        var downloadPDFDialogConfig = {
            enable: false
        }
        var url = webroot_url + 'flx/get/pdf/download/info';
        $.ajax({
            url: url,
            cache: false,
            dataType: 'json',
            data:{
                artifactID: window.artifactID
            },
            success: function(data){
                if(data.responseHeader.status === 0 && data.response.pdfDownlaodInfo.length === 0){
                    downloadPDFDialogConfig.enable = true;
                }else{
                    downloadPDFDialogConfig.enable = false;
                }
            },
            error: function(){
                downloadPDFDialogConfig.enable = false;
            }
        })
        function requestDownloadPDF(){
            if ($(this).attr('href') === '#') {
                var task_type, artifact_id, revision_id, render_template, nocache, render_url, task_type_display_name;
                task_type = $(this).data('rendertype');
                artifact_id = $(this).data('artifactid');
                revision_id = $(this).data('artifactrevisionid');
                render_template = $(this).data('rendertemplatetype');
                nocache = $(this).data('rendercache') === 'nocache';
                render_url = webroot_url + 'render/' + task_type + '/status/' + artifact_id + '/' + revision_id + '/';

                if (task_type === 'mobi') {
                    task_type_display_name = 'Kindle Book';
                } else if (task_type === 'pdf') {
                    task_type_display_name = 'PDF';
                } else {
                    task_type_display_name = 'ePub';
                }

                if (nocache) {
                    render_url += 'nocache/';
                }
                if (render_template) {
                    render_url += render_template + '/';
                }
                render_url += '?artifacturl=' + window.location.href;
                $.ajax({
                    url: render_url,
                    cache: false,
                    dataType: 'json',
                    success: function (json_status) {
                        if (json_status.status === 'SUCCESS') {
                            window.open(json_status.userdata.downloadUri, 'downloadwindow');
                        } else {
                            $.flxweb.showDialog('Thank you! The ' + task_type_display_name + ' you requested is being generated. We will email you when it is available for download.', {
                                'title': task_type_display_name + ' Notification'
                            });
                        }
                    },
                    error: function () {
                        $.flxweb.showDialog('Error generating ' + task_type_display_name, {
                            'title': 'Error generating ' + task_type_display_name
                        });
                    }
                });
                updateArtifactUserNotification(this);
                return false;
            }
            //Wait for default download action
            var context = this;
            setTimeout(function () {
                updateArtifactUserNotification(context);
            }, 500);
        }

        function startRenderTask(event) {
            if(downloadPDFDialogConfig.enable && window.artifact_json.artifactType === 'book'){
                event.preventDefault();
                downloadPDFDialog.open($(this).attr('href'), downloadPDFDialogConfig, requestDownloadPDF.bind(this));
            }else{
                requestDownloadPDF.call(this);
            }
        }

        function toggleCollapsible() {
            var container = $(this).parent();
            container.find('.js_arrow').toggleClass('arrow').toggleClass('arrow_right');
            container.find('.js_collapsible_content').toggleClass('hide');
        }

        function showMoreMeta() {
            $(this).hide();
            $('.js_more_keywords', $(this).parent()).removeClass('hide');
            return false;
        }

        function shareLinkTxtClick() {
            $(this).select();
        }

        function openReader() {
            window.location.href = $('#readerlink').attr('data-readerurl');
            return false;
        }

        function addToLibrary() {
            if (!$(this).hasClass('already_in_library')) {
                if (window.ck12_signed_in) {
                    var params = {
                        'objectID': window.artifactRevisionID || 1,
                        'objectType': 'artifactRevision'
                    };
                    $.ajax({
                        url: '/flx/add/mylib/object',
                        data: params,
                        cache: false,
                        dataType: 'json',
                        success: function (response) {
                            if (response.responseHeader.status === 0) {
                                $('#add_to_library').add('#add_to_library_mob').addClass('already_in_library');
                                $(".library-tp").attr('title', 'Already in Library');
                                $(".library-st").html("Already in Library");
                                $(".library-st").siblings(".icon-backpack").addClass("disabled");
                                ModalView.alert('This resource has been added to your Library.');
                            } else {
                                ModalView.alert('This resource is not added to your Library. Please try again later');
                            }
                        },
                        error: function () {
                            ModalView.alert('This resource is not added to your Library. Please try again later');
                        }
                    });
                } else {
                    $.flxweb.alertToSignin();
                }
            }
        }

        function showAddToLibrary() {
            var currentArtifact, selectedLabels, label, i;
            //Create LibraryItem from current artifact in the details page
            currentArtifact = new LibraryItem({
                artifactRevisionID: artifactRevisionID
            });
            //loop through current library labels associated with the artifact
            //and set the selectedLabels dictionary. Note, 1 mean selected
            selectedLabels = {};
            for (i = 0; i < artifactLabels.length; i++) {
                label = artifactLabels[i];
                selectedLabels[label] = 1;
            }
            window.labelsChooser.open([currentArtifact], selectedLabels);
            return false;
        }

        function onAddedToLibrary(event, data) {
            if (data && data.artifactRevisionID === artifactRevisionID) {

                $('#addtolibrary').addClass('hide');
                $('#addtolibraryaction').addClass('hide');
                $('#addedtolibrary').removeClass('hide');
                //Log with ADS
                $.flxweb.logADS('fbs_bookmark', 'bookmarked', 1, [data.artifactID, data.artifactRevisionID, ads_userid], []);
            }
        }

        function onRemovedFromLibrary(event, data) {
            if (data && data.artifactRevisionID === artifactRevisionID) {
                $('#addtolibrary').removeClass('hide');
                $('#addtolibraryaction').removeClass('hide');
                $('#addedtolibrary').addClass('hide');
            }
        }

        function navigateToSection() {
            var hash, section, anchor;
            hash = window.location.hash;
            section = null;
            if (hash !== '') {
                hash = Url.decode(hash);
                anchor = Base64.jqSafe(Base64.encode(hash.substring(1)));
                section = $('#x-ck12-' + anchor);
                if (!section.size()) {
                    section = $('#' + anchor);
                    if (!section.size()) {
                        if (hash === '#view_videos') {
                            section = $('iframe').first();
                        } else {
                            section = $(hash);
                        }
                    }
                }
                if (section.size()) {
                    if (section.hasClass('js_viewtab')) {
                        $(document).scrollTop(0);
                    } else {
                        $(document).scrollTo(section);
                    }
                }
            }
        }

        function editLinkClick() {
            window.location = $('#personalize_link').attr('href');
            return false;
        }

        function removeAttachment(e, data) {
            //remove the row
            var resource_row = null;
            $('.js_resource_row').each(function () {
                if ($(this).data('resource-id') === data.resource_id) {
                    resource_row = $(this);
                    return false;
                }
            });
            if (resource_row && resource_row.size()) {
                resource_row.hide(500, function () {
                    $(this).remove();
                });
            }
        }

        function showAnswerKeysDialog() {
            var options = {
                width: 800,
                height: 500,
                buttons: null,
                title: $.flxweb.gettext('Request Solutions')
            };

            $.flxweb.showDialog('<iframe ' +
                'frameborder="0" marginheight="0" marginwidth="0" ' +
                'src="' + $(this).data('src') + '" ' +
                'width="' + (options.width - 50) + '" ' +
                'height="' + (options.height - 100) + '" ' +
                '/>', options);
            return false;
        }

        function initReviewList() {
            if (window.artifactID) {
                new ReviewsModule.ReviewsListView({
                    el: $('#reviews'),
                    artifactID: window.artifactID,
                    myReviewView: window.myReview
                });
            }
        }

        function loadAddToFlexbookDialog() {
            if(!$('#add_to_book').hasClass('already_in_library')){
                $('#add_to_book').bind('flxweb.bookbuilder.showonload', function () {
                    window.bookbuilderAppView.show();
                });
                window.bookbuilderAppView = new Bookbuilder.BookbuilderView({
                    target: $('#add_to_book')
                });
                return false;
            }
        }

        function showReaderDialog() {
            require(['reader/reader.dialog'], function (rd) {
                var revID, artifactType;
                var bookTypes = ['book', 'tebook','workbook','quizbook'];
                if (window.artifact_json) {
                    artifactType = window.artifact_json.artifactType;
                }
                if (bookTypes.indexOf(artifactType) === -1) {
                    if (window.context_json && bookTypes.indexOf(window.context_json.artifactType) !== -1) {
                        revID = window.context_json.artifactRevisionID;
                    }
                } else {
                    revID = window.artifactRevisionID;
                }
                if (revID) {
                    rd.init({
                        'artifactRevisionID': revID
                    });
                }
            });
        }

        function toogleReaderTooltip() {
            $('.offline-reader-tooltip').toggleClass('hide');
        }

        function camelCase(str) {
            str = str.replace(/(?:^|\s)\w/g, function(match){
                    return match.toUpperCase();
            });
            return str;
        }

        function createBreadcrumb() {
            var breadcrumbObject = {
                    'Home': '/',
                },
                i,
                artifactTitle,
                is_owner,
                by_ck12,
                bookcrumbs = {},
                subjectGrid = window.context_json ? window.context_json.subjectGrid.slice(0,2) : window.artifact_json.subjectGrid.slice(0,2);
	    // Overide home for LTI context Bug #56116
	    if (window.lmsContext === 'lti-app'){
		breadcrumbObject['Home'] = '/browse/';
	    }
            for(i = 0;i < artifact_breadcrumbs.length; i++) {
                if(!artifact_breadcrumbs[i].hasOwnProperty('is_subject')) {
                    if(artifact_breadcrumbs[i].type === 'chapter'){
                        artifactTitle = 'Ch' + artifact_breadcrumbs[i].position.split('.')[0];
                    } else if(artifact_breadcrumbs[i].type === 'book'|| artifact_breadcrumbs[i].type === 'tebook'){
                        artifactTitle = artifact_breadcrumbs[i].title;
                        is_owner = artifact_breadcrumbs[i].owner;
                        by_ck12 = artifact_breadcrumbs[i].realm ? false : true;
                    } else {
                        artifactTitle = (artifact_breadcrumbs[i].position ? ((artifact_breadcrumbs[i].position.match(/\.0$/) ? artifact_breadcrumbs[i].position.split('.')[0] : artifact_breadcrumbs[i].position.split('.')[1]) +'. ') : '') + artifact_breadcrumbs[i].title;
                    }
                    bookcrumbs['_' + artifactTitle] = artifact_breadcrumbs[i].perma;
                }
            }
            if(is_owner) {
                breadcrumbObject['Library'] = '/my/library';
            } else if(by_ck12) {
                for(i = 0;i < subjectGrid.length; i++) {
                    if(subjectGrid[i][1].match(/mathematics|science/g)) {
                        breadcrumbObject['_' + camelCase(subjectGrid[i][1])] = '/browse';
                    } else {
                        if(subjectGrid[i][1].toLocaleLowerCase().match(/preparation/)){
                            breadcrumbObject['_SAT Exam Prep'] = '/browse/sat-exam-prep';
                            breadcrumbObject['FlexBooks'] = '/browse/sat-exam-prep#view_books';
                        } else {
                            breadcrumbObject['_' + camelCase(subjectGrid[i][1])] = '/browse/' + subjectGrid[i][1].toLocaleLowerCase().replace(/\s/g, '-');
                            breadcrumbObject['FlexBooks'] = '/browse/' + subjectGrid[i][1].toLocaleLowerCase().replace(/\s/g, '-') + '#view_books';
                        }
                        if(i === 0){
                            break;
                        }
                    }
                }
            }
            $.each(bookcrumbs, function(key, val){
                breadcrumbObject[key] = val;
            });
            Breadcrumb.init(breadcrumbObject);
        }

        function initializeShare() {
            var regx = /http[s]{0,1}:\/\//g,
                shareImageUrl = window.artifact_json.coverImage || '/media/images/thumb_dflt_flexbook_lg.png',
                shareContext,
                payload = {
                        artifactID : window.artifact_json.artifactID,
                        memberID : ads_userid,
                        page : 'modality_details'
                };
            if(!regx.test(shareImageUrl)) {
                shareImageUrl = window.location.protocol + '//' + window.location.host + shareImageUrl;
            }
            if(window.artifact_json.artifactType === 'book') {
                shareContext = 'Share this FlexBook® Textbook';
            } else {
                shareContext = 'Share this Resource';
            }
            FooterView.initShare({
                'shareImage': shareImageUrl,
                'shareUrl': window.location.href,
                'shareTitle': window.artifact_json.title,
                'context': shareContext,
                'payload': payload,
                '_ck12': true
            });
        }
        function validateEmail(email) {
            var isValid = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(email);
            return isValid;
        }
        function getArtifactXhtml(showBreadcrumb, isCollaborator) {
            var artifact_content = $('#artifact_content');
            if (artifact_content.size() > 0) {
                var loader = $.Deferred();
                // $.ajax({
                var ajaxOptions = {
                    url: artifact_content.data('loadurl'),
                    success: function (data) {
                        if (data && data.hasOwnProperty('response')) {
                            if (data.response.hasOwnProperty('artifacts')) {
                                loader.resolve(data.response.artifacts[0]);
                            } else if (data.response.hasOwnProperty('artifactDraft') && data.response.artifactDraft.hasOwnProperty('draft')) {
                                loader.resolve(data.response.artifactDraft.draft);
                            }
                        } else {
                            artifact_content.html('');
                            loader.resolve('');
                        }
                        $(window).scroll();
                        // show attributes for image in xhtml
                        $(document).trigger('flxweb.load.ImageAttributes');
                        window.vocabContainer = $('#artifact_content');
                        console.log('trigger');
                        $(document).trigger('flxweb.load.showvocabtooltips');
                        if (window.location.hash) {
                            window.location.hash = window.location.hash; // bug 33428, jump to hash after content is loaded
                        }
                    },
                    error: function (jqXHR, textStatus) {
                        loader.reject(textStatus);
                    },
                    dataType: 'json'
                };

                //if we are loading drafts, or if user is accessing a flexbook or chapter owned by herself don't use the CDN Cache
                if ((ajaxOptions.url.indexOf('/artifactdraft/') !== -1) || ($('header').data('user') === artifact_json.creatorID) || isCollaborator) {
                    $.ajax(ajaxOptions);
                } else {
                    var cdnCache = new CDNCache(ajaxOptions);
                    cdnCache
                        .setExpirationAge('daily')
                        .fetch();
                }

                artifact_content.data('loader', loader.promise());
            }
            if (showBreadcrumb !== false) {
                createBreadcrumb();
            }
        }

        function practiceWidgetsettings() {
        	var bookTypes, isTeacher =  window.flxweb_roles ? window.flxweb_roles.indexOf("teacher") !== -1 : $.cookie("flxweb_role") === "teacher";
        	bookTypes = ['book', 'tebook','workbook','quizbook'];

        	if(bookTypes.indexOf(artifact_json.artifactType) != -1 || artifact_json.artifactType === "chapter"){
        		!isTeacher ? $("#content-area").addClass("old-section") : $("#content-area").addClass("teacher-view-section");
        	}
        }

        function handleCanonicalTag() {
            var realm, bookTypes = ['book', 'tebook','workbook','quizbook'];
            if (bookTypes.indexOf(artifact_json.artifactType) === -1) {
                if (artifact_json.revisions[0].ancestors && artifact_json.revisions[0].ancestors['0.0'] && artifact_json.revisions[0].ancestors['0.0'].realm) {
                    $('link[rel="canonical"]').remove();
                }
            } else {
                if (artifact_json.creator !== 'CK-12') {
                    $('link[rel="canonical"]').remove();
                }
            }
        }

        function domReady() {
            var payload, artifact_breadcrumbs = window.artifact_breadcrumbs;
            //            adsVisitTime = new Date().getTime();
            if (!artifact_json) {
                if (window.artifact_json_encoded) {
                    artifact_json = window.artifact_json_encoded;
                }
            }
            if (!window.context_json) {
                if (window.context_json_encoded) {
                    // IMPORTANT: context_json needs to be global
                    window.context_json = window.context_json_encoded;
                }
            }
            handleCanonicalTag();
            practiceWidgetsettings();

            //show the FlexBook App deeplink if user is on android/iOS
            if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ) {
                 $('.flexbook_deeplink_container').removeClass('hide');
            } else {
                //show the offline reader link on desktops
                $('.offline-reader-link-wrapper').removeClass('hide');
            }

            if(window.location.hash.substring(1) === 'showDialog'){
                ReaderDialog.init({
                    artifactRevisionID: window.artifactRevisionID,
                    artifactID: window.artifactID
                });
            }
            $('#readerDialogModal').on('closed', function(){
                window.location.hash = '';
            })
            $('.looking-for-pdf-link').off('click').on('click', function(){
                ReaderDialog.init({
                    artifactRevisionID: window.artifactRevisionID,
                    artifactID: window.artifactID
                });
            });
            $('.emailpanel-email-input').off('focus').on('focus', function(){
                if(!$('.emailpanel-email .icon-notification').hasClass('hide')){
                    $('.emailpanel-email .icon-notification').addClass('hide');
                }
                if(!$('.emailpanel-email .tooltip-right').hasClass('hide')){
                    $('.emailpanel-email .tooltip-right').addClass('hide');
                }
            });
            $('.sendlink').off('click').on('click', function(){
                var email = $('.emailpanel .emailpanel-email-input').val().trim();
                var isValidEmail = validateEmail(email);
                if (isValidEmail) {
                    EmailServices.sendTemplateEmail(email, 'app_link:fb').done(function () {
                        $('.successpanel').removeClass('hide');
                        $('.emailpanel').addClass('hide');
                    }).fail(function () {
                        alert('Sorry, sending the email failed. Please try again.');
                    });
                }else{
                    $('.emailpanel-email .icon-notification').removeClass('hide');
                    $('.emailpanel-email .tooltip-right').removeClass('hide');
                }
            });
            //answer keys link handler. Show the dialog and form
            //$('#answer_keys_link').off('click.answer').on('click.answer', showAnswerKeysDialog);
            //$('.modality-info').off('click').on('click', loadModalityAssign);    //This change is for READ MODALITY from flexbook
	    if ( window.lmsContext === 'lti-app'){
		$('.assign_to_lms').off('click').on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
		    console.log("This is LTI context");
		    var data = lmsUtil.getAssignmentDetails();
		    console.log(data);
		    LTIBridge.onAssignAction(data);
		});
	    }
            $('.assign_to_class').off('click').on('click', function () { //This change is for READ MODALITY from flexbook
                if (window.ck12_signed_in) {
                    /*type of modality to be identified and sent*/
                    /*change for read and video modality*/
                    modalityLib.init({"title" : window.artifact_json.title, "artifactID" : window.artifact_json.artifactID});
                }else{
                    $.flxweb.alertToSignin();
                }
            });

            this.flexbook_assign_notification = new QuickAssignmentView({
               model: new QuickAssignmentModel(window.artifact_json.artifactID, window.artifact_json.conceptNode),
               referrer: "FLEXBOOKS"
            });

            $('.assign-info-img').off('click').on('click', function (e) {
                assignTooltip.open(e);
            });
            handleMenuRole();
            $('.js_downloadlink').off('click.link').on('click.link', startRenderTask);
            $('.js_lnk_show_meta').off('click.meta').on('click.meta', showMoreMeta);
            $('.js_detailstabs').tabs({
                'create': function () {
                    $('.js_detailstabs').find('ul').removeClass('hide');
                    $('.js_viewtab').removeClass('hide');
                }
            }).end().off('tabsshow.tabs').on('tabsshow.tabs', function (event, ui) {
                switch (ui.panel.id) {
                case 'view_details':
                    $('.js_standardboards_container').trigger('flxweb.modality.standardboards.load');
                    break;
                case 'view_attachments':
                    $('.resources_container').trigger('flxweb.modality.resource.load');
                    break;
                }
            });
            $(window).off('hashchange.hash').on('hashchange.hash', navigateToSection);
            $('.js_collapsible_toggle').off('click.collapsible').on('click.collapsible', toggleCollapsible);
            $('.js_txt_sharelink').off('click.share').on('click.share', shareLinkTxtClick);
            $('.js-shareGroupLink').each(function () {
                new ShareViews.GroupsShareView({
                    link: $(this),
                    objectID: parseInt(window.artifactID, 10)
                });
            });

            window.labelsChooser = new Library.LabelsChooser({
                parent: $('#addtolibrary').parent()
            });
            // handler for bookmark actions
            $('#addtolibraryaction').off('click.add').on('click.add', function () {
                var currentArtifact = new Library.LibraryItem({
                    artifactRevisionID: artifactRevisionID
                });
                window.labelsChooser.addToLibrary([currentArtifact]);
                return false;
            });
            // handler for un-starring
            $('#addedtolibrary').off('click.added').on('click.added', function () {
                var currentArtifact = new Library.LibraryItem({
                    artifactRevisionID: artifactRevisionID
                });
                window.labelsChooser.removeFromLibrary([currentArtifact]);
                return false;
            });

            $('#addtolibrary').off('click.add').on('click.add', showAddToLibrary); // this is for "Bookmark" as in 2.3.16
            $('#add_to_library').add('#add_to_library_mob').off('click.add').on('click.add', addToLibrary); // this is for "library" as in 2.3.16
            $('#readerlink').off('click.reader').on('click.reader', openReader);
            //Bookmark listeners
            $(document).off('flxweb.library.label.applied').on('flxweb.library.label.applied', onAddedToLibrary);
            $(document).off('flxweb.library.item.added').on('flxweb.library.item.added', onAddedToLibrary);
            $(document).off('flxweb.library.item.removed').on('flxweb.library.item.removed', onRemovedFromLibrary);

            //ADS logging
            //$.flxweb.logADS('fbs_visit', 'visited', 1 , [artifactID,artifactRevisionID,ads_userid], ['details']);

            // ADS tracks visit to a modality details page
            payload = {};
            payload.artifactID = artifactID;
            payload.memberID = ads_userid;
            payload.context_eid = eid;
            payload.modality_type = modality_type;
            payload.user_role = flxweb_role;
            $.flxweb.logADS('fbs_modality', payload);

            navigateToSection();
            $('.js_editlink').off('click.editlink').on('click.editlink', editLinkClick);
            $(document).off('flxweb.editor.attachments.remove_attachment').on('flxweb.editor.attachments.remove_attachment', removeAttachment);
            initializeShare();

            $('a[href*="/external?url"]').off('click.external').on('click.external', function () {
                //set the target to open in new window
                $(this).attr('target', '_blank');
            });

            window.editResourceDialog.off('flxweb.resource.update.onsuccess').on('flxweb.resource.update.onsuccess', window.editResourceDialog.updateDetailsOrEditorResourceRow);
            window.editResourceDialog.off('flxweb.resource.make.public.required').on('flxweb.resource.make.public.required', window.editResourceDialog.interEditResourceClick);

            //Bug 11777 Empty green box appearing above concept title
            if ($.trim($('#js_old_fb_notification').text()).length !== 0) {
                $('.notificationwrap').removeClass('hide');
            } else {
                $('.notificationwrap').addClass('hide');
            }

            //Reviews
            if (artifactID) {
                window.myReview = new ReviewsModule.MyReviewView({
                    el: $('#myreview'),
                    artifactID: artifactID
                });
            }
            $('#review_list_container').off('flxweb.modality.read.initreviewlist').on('flxweb.modality.read.initreviewlist', initReviewList);
            $('#add_to_book').one('click.add', loadAddToFlexbookDialog);
            $('.offline-reader-link').off('click.reader.link').on('click.reader.link', showReaderDialog);
            $('.offline-reader-help-img').one('hover.reader.tooltip', toogleReaderTooltip);
            if (window.page_type !== 'section details' && window.page_type !== 'chapter details') {
                getArtifactXhtml();
            }

        }

        $(document).ready(domReady);

        function showAssignTooltip(){
               var userId = $('header').attr("data-user");
               $(".assign-to-class-wrap").find("#assign-tooltip").remove();
            if(userId && localStorage.getItem("assignTooltip-"+userId)){
                $('#reveal-overlay').remove();
            }else{
            	//handling case for non-sign-in user
            	if(localStorage.getItem("assignTooltip-"+userId)){
        			$('#reveal-overlay').remove();
        			return;
        		}
                assignTooltip.open();
                $('#reveal-overlay').show();
                try {
                    localStorage.setItem("assignTooltip-"+userId ,"true");
                } catch (err) {
                    console.log("Not allowed to access localStorage.");
                }
            }
        }
        function handleMenuRole(){
            var isTeacher = window.flxweb_roles ? window.flxweb_roles.indexOf("teacher") !== -1 : $.cookie("flxweb_role") === "teacher";
               if(!isTeacher){
                   $('#reveal-overlay').remove();
            }else{
                $(".assign-to-class").removeClass("hide");
                $("#first_devider").removeClass("hide");
		if (assignTooltip){
                    showAssignTooltip();
		}
            }
        }
        function onStandardBoardsSuccess(data) {
            var $el = $('.js_standardboards_container');
            $el.removeClass('hide');
            $el.html(data);
            $('.js_lnk_show_meta').click(showMoreMeta);
            eval($(data).find('script').text());
            $el.show(800);
        }

        $('.js_standardboards_container').one('flxweb.modality.standardboards.load', function () {
            var $el = $(this);
            $.ajax({
                url: $el.data('loadurl'),
                success: function (data) {
                    if (data && data.indexOf('NO_STANARD_BOARDS') === -1) {
                        onStandardBoardsSuccess(data);
                    }
                },
                error: function (jqXHR, textStatus) {
                    console.error(textStatus);
                },
                dataType: 'html'
            });
        });
        $('.resources_container').one('flxweb.modality.resource.load', function () {
            var $el = $(this);
            if($el.data('loadurl')){
                $el.html('Loading...');
                $el.load($el.data('loadurl'), function () {
                    $el.show(800);
                });
            }
        });

        var artifactDetailsCommon = {
            artifactXhtml : function(showBreadcrumb, isCollaborator) {
                getArtifactXhtml(showBreadcrumb, isCollaborator);
            }
        };

        return artifactDetailsCommon;
    });
