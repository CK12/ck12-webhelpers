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
 * $Id$
 */

 /* global artifact_json, context_json */

define('flxweb.details.concept', [
    'jquery',
    'underscore',
    'flxweb.models.artifact',
    'flxweb.details.common',
    'flxweb.summary',
    'common/utils/utils',
    'common/views/modal.view',
    'common/utils/modality',
    'text!templates/related.modality.html',
    'common/utils/user',
    '../modality/js/utils/plix.dressing',
    'jquery-ui'
    /*,
    'flxweb.retrolation.widget'
     */
], function ($, _, Artifact, artifactDetailsCommon, ArtifactSummaryView, Util, modalView, modalityUtil, relatedModalityTemplate, User, PlixDressing) {

    'use strict';

    var lastScrollPosition = 0;
    var minimized_container_height = 35;
    var expanded_container_height = 174;
    var related_mod_state = {'expand': expandRelatedModalities, 'minimize' : minimizeRelatedModalities, 'state': 'expand', 'trigger':'js'};
    var toggle_related_modality_html = '<div class="close-parent" title="Expand / Minimize Pop Up"><div class="right pointer toggle-mod-cont"><i class="icon-arrow_down"></i></div></div>';
    var bottom_scroll_trigger_padding = 650;
    var showRelatedBottom = true;
    var adaptive = true;
    var memoryBoost = "";
    var _encodedID = "";
    relatedModalityTemplate = _.template(relatedModalityTemplate, null, {
        'variable': 'data'
    });
    var showNextConcept = /book/.test(window.location.pathname) ? "&nextPractice=false" : "";
    var isTeacher =  window.flxweb_roles ? window.flxweb_roles.indexOf("teacher") !== -1 : $.cookie("flxweb_role") === "teacher";
    function imageDialog_show() {
        var src, img, width, $this = $(this);

        if (!($this.hasClass('x-ck12-math') ||
                $this.hasClass('x-ck12-block-math') ||
                $this.hasClass('x-ck12-hwpmath') ||
                $this.hasClass('x-ck12-img-nopopup'))) {
            $.blockUI({
                message: $('#js_imgdialog'),
                css: {
                    top: ($(window).height() - 500) / 2 + 'px',
                    left: ($(window).width() - 530) / 2 + 'px',
                    width: '530px',
                    padding: '0 10px 10px 10px',
                    height: '500px',
                    cursor: 'default'
                }
            });
            src = $this.attr('src');
            if (src.indexOf('THUMB_POSTCARD') === -1) {
                src = src.replace('/default/', '/THUMB_POSTCARD/');
            }
            img = $('<img id="js_imgdialogimage" src="' + src + '" />');
            $('#js_imgdialogcontent').html(img).css({
                'overflow': 'auto',
                'height': '450px'
            });

            width = parseInt($this.width(), 10);
            if (width < 500) {
                $('#js_imgdialognav .actions').hide();
                $('#js_imgdialognav .msg').show();
            } else {
                $('#js_imgdialognav .actions').show();
                $('#js_imgdialognav .msg').hide();
            }
        }
    }

    function getScrollPercent() {
        var h = document.documentElement,
            b = document.body,
            st = 'scrollTop',
            sh = 'scrollHeight';
        return h[st]||b[st] / ((h[sh]||b[sh]) - h.clientHeight) * 100;
    }

    function imageDialog_hide() {
        $.unblockUI();
        return false;
    }

    function imageDialog_fitsize() {
        var src, img = $('#js_imgdialogcontent img');
        src = img.attr('src');
        if (src.indexOf('IMAGE_THUMB') === -1) {
            img.attr('src', src.replace('/default/', '/THUMB_POSTCARD/'));
        }
        return false;
    }

    function imageDialog_fullsize() {
        var src, img = $('#js_imgdialogcontent img');
        src = img.attr('src');
        if (src.indexOf('THUMB_POSTCARD') !== -1) {
            img.attr('src', src.replace('/THUMB_POSTCARD/', '/default/'));
        } else if (src.indexOf('image_thumb') !== -1) {
            img.attr('src', src.replace('/thumb_postcard/', '/default/'));
        }
        return false;
    }

    function embedbox_click() {
        $(this).select();
        return false;
    }


    function show_embed_block() {
        $('#embed_section').show();
    }

    function hide_embed_block() {
        $('#embed_section').hide();
    }

    function updateEmbedCode() {
        var iframeCode,
            $embedBox = $('#embed_box'),
            width = $('#embed_width').val(),
            height = $('#embed_height').val();

        if (!width) {
            width = 500;
        }
        if (!height) {
            height = 400;
        }

        iframeCode = $embedBox.val();
        iframeCode = iframeCode.replace(/width="\w+"/, 'width="' + width + '"');
        iframeCode = iframeCode.replace(/height="\w+"/, 'height="' + height + '"');
        $embedBox.val(iframeCode);
    }

    function embedSizeChange(event) {
        var key = event.charCode || event.keyCode || 0;
        if (!(key >= 48 && key <= 57) && !(key >= 96 && key <= 105)) { //not a number
            if (!(key === 8 || key === 9 || key === 46 || key === 37 || key === 39)) { //not a backspace, tab, delete, left or right
                event.preventDefault();
                return false;
            }
        } else {
            if (event.shiftKey || event.ctrlKey) {
                return false;
            }
        }
    }

    function artifact_click() {
        window.location.href = $(this).find('a').attr('href');
    }

    function backtotop_click() {
        $('html,body').animate({
            'scrollTop': 0
        }, 200);
        return false;
    }

    //Bug 7651 : adding target _blank for external links.
    function artifact_link_assign_target() {
        var rMailto = /^mailto\:/;
        $('#view_content').find('a').each(function () {
            if (!rMailto.test(this.href) && this.hostname !== window.location.hostname) {
                $(this).attr('target', '_blank');
            }
        });
    }

    function showConceptUpdateError(concept_title, book_title) {
        $.flxweb.showDialog($.flxweb.gettext('Failed to update concept <%= concept_title %> in FlexBook&#174; textbook <%= book_title %>', {
            'concept_title': concept_title,
            'book_title': book_title
        }));
    }

    //Update link handler
    function updateLinkClick() {
        var rev_id,
            context = new Artifact(context_json),
            current_artifact = new Artifact(artifact_json);

        rev_id = current_artifact.get('artifactRevisionID');
        $.flxweb.showLoading($.flxweb.gettext('Updating concept <%= concept_title %> in FlexBook&#174; textbook <%= book_title %>', {
            'concept_title': current_artifact.get('title'),
            'book_title': context.get('title')
        }));
        context.fetch({
            'success': function () {
                current_artifact.fetch({
                    'success': function () {
                        var i, j,
                            children = context.getChildren(),
                            child = null,
                            grandchildren = null,
                            grandchild = null,
                            position = '';

                        if (children && children.length) {
                            for (i = 0; i < children.length; i++) {
                                child = children[i];
                                if (child.get('artifactID') === current_artifact.get('artifactID')) {
                                    //ids match, replace the artifact
                                    children[i] = current_artifact;
                                    position += (i + 1) + '.0';
                                    break;
                                }
                                grandchildren = child.get('revisions')[0].children;
                                if (grandchildren && grandchildren.length) {
                                    for (j = 0; j < grandchildren.length; j++) {
                                        grandchild = grandchildren[j];
                                        if (!isNaN(grandchild)) {
                                            if (grandchild === rev_id) {
                                                grandchildren[j] = current_artifact.get('latestRevisionID');
                                                position += (i + 1) + '.' + (j + 1);
                                                break;
                                            }
                                        }
                                    }
                                    child.get('revisions')[0].children = grandchildren;
                                }
                                if (position) {
                                    break;
                                }
                            }
                            context.setChildren(children);
                            context.save(null, {
                                'success': function (model) {
                                    var updated_url = $.flxweb.settings.webroot_url + model.get('perma') + 'r' + model.get('latestRevision') + '/section/' + position + '/' + current_artifact.get('handle') + '/';
                                    window.location.href = updated_url;
                                },
                                'error': function () {
                                    showConceptUpdateError(current_artifact.get('title'), context.get('title'));
                                }
                            });
                        }
                    },
                    'error': function () {
                        showConceptUpdateError(current_artifact.get('title'), context.get('title'));
                    }
                });
            },
            'error': function () {
                showConceptUpdateError(current_artifact.get('title'), context.get('title'));
            }
        });
        return false;
    }

    function processXHTML(ixhtml) {
        var _content, $tc, $dataObjectives, _objectives, $dataVocabulary, _vocabulary, _xhtml = '', _contentWrap,
            xhtml_re = /<!-- Begin inserted XHTML \[CONCEPT: \d*\] -->([\s\S]*)<!-- End inserted XHTML \[CONCEPT: \d*\] -->/gm;

        _content = xhtml_re.exec(ixhtml);

        if (_content) {
            _xhtml = _content[1];
            _xhtml = _xhtml.replace('<h2 id="x-ck12-Q29uY2VwdA.."> Concept </h2>', '');
        } else {
            /*xhtml_re = new RegExp(/<div class="x-ck12-data-concept">([\s\S]*)<\/div>/gmi);
            //xhtml_re = new RegExp(/<div class="x-ck12-data-concept">(.*?)<\/div>/gmi);
            _content = xhtml_re.exec(ixhtml);*/

            _contentWrap = $('<div>'+ixhtml.replace(/body/g,"bodytagincontent")+'<div>');
            _content = $('<div>').append(_contentWrap.find('.x-ck12-data-concept').clone()).html();

            if (_content) {
                //_xhtml = _content[1];
                _xhtml = _content;
            } else {
                // SEO change: Remove the <title> element from the DOM
                // We just want one <title> element on the page.
                try {
                    _xhtml = ixhtml.replace(/<title>.*<\/title>/g,'');
                } catch(e) {
                    console.error(e);
                    _xhtml = ixhtml;
                }
            }
        }
        $tc = $('#temp_artifact_xhtml_content');
        $tc.html(ixhtml);
        $dataObjectives = $tc.find('.x-ck12-data-objectives');
        if ($dataObjectives.size() > 0) {
            _objectives = $dataObjectives.first().html();
            if (_objectives.trim()) {
                $('.js_metadata_objectives_container div.objectives_content').html(_objectives).parent().removeClass('hide');
            }
        }
        $dataVocabulary = $tc.find('.x-ck12-data-vocabulary');
        if ($dataVocabulary.size() > 0) {
            _vocabulary = $dataVocabulary.first().html();
            if (_vocabulary.trim()) {
                $('.js_metadata_vocabulary_container div.vocabulary_content').html(_vocabulary).parent().removeClass('hide');
            }
        }
        $tc.html('');
        return _xhtml;
    }

    function renderMathJax() {
        var $this, cnt = 0;
        $('.x-ck12-mathEditor, .x-ck12-math, .x-ck12-hwpmath, .x-ck12-block-math', '#artifact_content, #view_details').each(function () {
            try {
                var mathLatex,
                    $this = $(this),
                    decodedTex;
                if ($this.hasClass('x-ck12-mathEditor') && $this.data('tex')) {
                    decodedTex = decodeURIComponent($this.attr('data-tex'));
                    if (decodedTex.indexOf('\\begin{align') === -1) {
                        mathLatex = '\\begin{align*}' + decodedTex + '\\end{align*}';
                    } else {
                        mathLatex = decodedTex;
                    }
                    mathLatex = ('@$' + mathLatex + '@$').replace(/</g, '&lt;');
                    /*if ($this.data('math-class') === 'x-ck12-block-math') {
                        mathLatex = '@$$' + mathLatex + '@$$';
                    } else {
                        mathLatex = '@$' + mathLatex + '@$';
                    }
                    mathLatex = mathLatex.replace(/</g, '&lt;');*/
                    $this.html(mathLatex).removeAttr('data-tex-mathjax').closest('p').css('overflow-y','hidden');
                    // MathJax.Hub.Queue(['Typeset', MathJax.Hub, $(this)[0]]);
                    cnt++;
                } else {
                    if ($this.attr('alt') !== undefined) {
                        $this.attr('alt', $this.attr('alt').replace("<", "\\lt ").replace(">", "\\gt "));
                    }
                    if(!$this.data('tex')){
                        $this.remove();
                    }
                }
            } catch (merr) {
                console.log('Error rendering math: ' + merr);
            }
        });
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'artifact_content']);
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'view_details']);
        console.log('Queued ' + cnt + ' math expressions');
        // In the event the content has no mathjax, but the vocabulary does.
        if ( cnt === 0 && window.vocab_mathjax > 0){
            cnt = window.vocab_mathjax;
        }
        $(document).trigger('beginMathJaxRenderQueue',{count:cnt});
        PlixDressing.init();
    }

    function bookContentLoadCallback(event, data) {
        if ($('#artifact_content').data('loadurl').indexOf('/artifactdraft/') !== -1) {
            $('#draft-label').removeClass('hide');
        }
        if (event && !data) {
            data = event;
        }
        if ((!data.xhtml) || (!data.hasXhtml)) {
            $('#artifact_content').html("No content to show");
        } else {
            $('#artifact_content').html(processXHTML(data.xhtml));
            $('p').each(function(){
                if($.trim($(this).text()) == '' && $(this).children().length == 0){
                    $(this).hide();
                }
            });
            $('#artifact_content').find('iframe').not('iframe[src*="tuvalabs.com"]').wrap('<div class="flex-video"></div>').each(function () {
                if (this.src && this.src.indexOf('/assessment/ui/') !== -1) {
                    $(this).parent().after('<div class="show-for-small"><a target="_blank" href="' + $(this).attr('src') + '" title="View Interactive">Click to view Interactive</a></div>');
                    $(this).parent().addClass('geo-ilo-embed hide-for-small').removeClass('flex-video');
                }
                //$(this).parent().css('padding-bottom', $(this).height() * 0.75 + 'px');
            });
            $('a', '#artifact_content').each(function() {
                var href = $(this).attr('href');
                if (href) {
                    if (!(href.match('ck12.org') || href.indexOf('#') === 0)) {
                        $(this).attr('target', '_blank');
                    }
                }
            });
            // renderMathJax();
        }
    }

    function getArtifactDraft(artifactRevisionID) {
        if (!artifactRevisionID) {
            return $.Deferred().reject({
                'error': 'Invalid error Object.'
            });
        }
        return Util.ajax({
            url: Util.getApiUrl('flx/artifactdraft/artifactDraftArtifactRevisionID=' + artifactRevisionID),
            contentType: 'application/json'
        });
    }

    function getFeatured (handle) {
        var _d = $.Deferred();
        Util.ajax({
            'url': Util.getApiUrl('flx/get/featured/modalities/lecture,asmtpractice,enrichment,simulationint,simulation,PLIX/') + handle,
            'dataType': 'json',
            'isShowLoading': true,
            'success': function (data) {
                _d.resolve(data.response);
            },
            'error': function () {
                _d.reject('Failed to load featured content');
            }
        });
        return _d.promise();
    }

    function navigateLeft() {
        var size, index, count = $('.js-individual-modality-wrapper').length;
        index = $('.show-first').index();
        size = 3;
        if (index > 0) {
            $('.js-related-modalities-wrapper').css('left', -(100/size)*(index - 1) + '%');
            $('.show-first').removeClass('show-first');
            // Remove from hidden stack
            $('.js-individual-modality-wrapper:nth-child(' + index +')').removeClass('hide').addClass('show-first');
            $('.js-navigate-right').removeClass('disabled');
            if (index === 1) {
                $('.js-navigate-left').addClass('disabled');
            }
        }
    }

    function navigateRight() {
        var size, index, maxLimit, count = $('.js-individual-modality-wrapper').length;
        index = $('.show-first').index();
        size = 3;
        maxLimit = count - 3;
        if (index < maxLimit) {
            $('.js-related-modalities-wrapper').css('left', -(100/size)*(index+1) + '%');
            // Push to hidden stack
            $('.show-first').removeClass('show-first').addClass('hide');
            $('.js-individual-modality-wrapper:nth-child(' + (index + 2) + ')').addClass('show-first');
            $('.js-navigate-left').removeClass('disabled');
            if ((index + 1) === (maxLimit)) {
                $('.js-navigate-right').addClass('disabled');
            }
        }
    }

    function bindPracticeEvents(practiceModality, score, testType, scoreOffset, isLogin, questionCount) {
        $('.js-practice_button, .js-practice_button_small').off('click.practice').on('click.practice', function (e) {
        	var collectionParams = "",
    		collectionData = "";
    	e.stopPropagation();
        e.preventDefault();
        if(window.js_collection_data && window.js_collection_data.collection){
        	collectionData = window.js_collection_data.collection;
        }
        if(collectionData && collectionData.handle){
        	collectionParams += "&collectionHandle=" + collectionData.handle;
        }
        if(collectionData && collectionData.creatorID){
        	collectionParams += "&collectionCreatorID=" + collectionData.creatorID;
        }
        if(collectionData && collectionData.descendantCollection && collectionData.descendantCollection.handle){
        	collectionParams += "&conceptCollectionHandle=" + collectionData.descendantCollection.handle;
        }
        testType  = testType || practiceModality.artifactType;
        if(testType === "asmtpractice"){
            testType = "practice";
        }
        try {
            if (!isLogin) {
                if (score.match('trial attempt reached')) { // Maximum allowed trial attempt reached
                    window.location.href = '/assessment/ui/?test/view/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle   + escape('&' + (memoryBoost) +showNextConcept+ '&referrer=featured_content&ep=' + window.location.href);
                } else { // User not logged in
                    coverSheet.init({
                        'handle': practiceModality.domain.handle,
                        'encodedId': practiceModality.domain.encodedId || practiceModality.domain.encodedID,
                        'conceptTitle': practiceModality.domain.name,
                        'callback': $.noop,
                        'referrer': 'featured_content',
                        'defaultPracticeModality': practiceModality
                    });
                }
            } else if (questionCount) {
                var tmpl = [];
                tmpl.push('<div id="restartAlert" class="restart-modal">');
                tmpl.push('<div class="message-body">Your progress will be reset. Are you sure you want to restart?</div>');
                tmpl.push('<div class="btn-cont"><input type="button" value="Cancel" class="button small dusty-grey closeModal">');
                tmpl.push('<input type="button" value="Yes" class="button small turquoise restartActivity"></div></div>');
                tmpl = tmpl.join('');
                $('body').append(tmpl);
                $('body').append('<div class="window-page-disable" id ="pageOverlay"></div>');
                $('.closeModal').off('click.remove').on('click.remove', function () {
                    $('#restartAlert').add('#pageOverlay').remove();
                });
                $('.restartActivity').off('click.restart').on('click.restart', function () {
                    window.location.href = '/assessment/ui/?test/view/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle  + collectionParams + escape('&' + showNextConcept + '&restartPractice=true' + '&referrer=featured_content&ep=' + window.location.href);
                });
            } else {
                if($(this).hasClass("memory-spaced-practice")){
                    memoryBoost = "&spractice=true&seid="+practiceModality.domain.encodedID;
                }
                if (84.9 < score) {
                    if (adaptive) {
                        window.location.href = '/assessment/ui/?test/view/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle   + collectionParams + escape('&' +(memoryBoost)+ showNextConcept +'&referrer=featured_content&ep=' + window.location.href);
                    } else if (scoreOffset > 0) {
                        window.location.href = '/assessment/ui/?test/detail/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle  + collectionParams + escape('&scoreOffset=' + scoreOffset + showNextConcept +'&mode=tunnel&referrer=featured_content&ep=' + window.location.href);
                    } else {
                        window.location.href = '/assessment/ui/?test/detail/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle  + collectionParams + escape('&mode=tunnel'+showNextConcept+'&referrer=featured_content&ep=' + window.location.href);
                    }
                } else {
                    window.location.href = '/assessment/ui/?test/view/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle   + collectionParams + escape('&' + (memoryBoost) +showNextConcept+ '&referrer=featured_content&ep=' + window.location.href);
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

        $(".tooltip-icon",".individual-modality-wrapper").off("click").on("click", function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            $(".tooltip-info",".individual-modality-wrapper").toggleClass("hide");
        });
    }

    function practiceButtonHandler(practiceModality, score) {
        var answerToComplete, correctAnswer, questionCount, completeQuestionsCount,
            context = $(this),
            memoryBoostSection = $('.memory-boost-section', '.individual-modality-wrapper'),
            practice_score = $('.js-practice_score'),
            practice_button = $('.js-practice_button,.js-practice_button_small'),
            spacedSchedule = "",
            memoryBoostMsg = "",
            use_small_button_txt = $('.js-related-modalities-container:visible').hasClass('movable-mod-cont');

        if(score && score.spacedSchedule){
            spacedSchedule = score.spacedSchedule;
        }
        if (!isTeacher && score.hasOwnProperty('test') && score.test.hasOwnProperty('userLogin')) {
            if (score.test.hasOwnProperty('pointsAndAwards')) {
                $(".practice-badge-container").addClass("border-cont");
                answerToComplete = score.test.pointsAndAwards.answersToComplete || 0;
                correctAnswer = score.test.pointsAndAwards.correctAnswers || 0;
                questionCount = 0 === score.test.availableQuestionsCount;
                completeQuestionsCount = score.test.pointsAndAwards.goal || score.test.questionsCount || 1;
                score = Math.round((correctAnswer / completeQuestionsCount) * 100);
                practice_score.text(score + '%');
                // We do this check because small button does not have
                // the real estate to account for more text.
                if (!use_small_button_txt){
                    _encodedID = practiceModality.domain.encodedID;
                    memoryBoostMsg = checkMemoryBoost({
                        "spacedSchedule" : spacedSchedule,
                        "context" : $('.individual-modality-wrapper'),
                        "isRestart" : questionCount === 0
                    });
                    if(memoryBoostMsg && typeof memoryBoostMsg === "object"){
                        // anchor tag hrefs removed in case of memory boost
                        $(".individual-modality",".individual-modality-wrapper.asmtpractice").removeAttr("href");
                        spacedPracticeEventHandler();

                        memoryBoostSection.removeClass("hide");
                        memoryBoostSection.find(".boost-icon").addClass(memoryBoostMsg['icon']);
                        memoryBoostSection.find(".boost-message").addClass(memoryBoostMsg['class']).text(memoryBoostMsg['due-msg']);
                        practice_button.find('span').text(memoryBoostMsg['btn-msg']);
                        practice_button.find('.icon-arrow3_right').addClass("hide");
                        practice_button.addClass("memory-boost-btn");
                        if(memoryBoostMsg['class']!=='boost-strong'){
                            practice_button.addClass("memory-spaced-practice");
                        }
                        $(".practice-btn-section",".modality_info_wrapper").addClass("small-6");
                    }else{
                        if (questionCount) {
                            practice_button.find('span').text('Restart');
                        } else if (100 <= score) {
                            practice_button.find('span').text('Keep Going');
                        } else {
                            practice_button.find('span').text('Get ' + answerToComplete + ' more correct');
                        }
                    }
                } else {
                    practice_button.find('span').text('Practice');
                }
                bindPracticeEvents.call(context, practiceModality, score, 'practice', 0, true, questionCount);
            } else {
                practice_score.text('0%');
                if (isTeacher) {
                    practice_button.find('span').text('Preview');
                    practice_button.removeClass("hide");
                }
                bindPracticeEvents.call(context, practiceModality, '', 'practice', 0, true);
            }
        } else if (score.hasOwnProperty('test') && score.test.hasOwnProperty('freeAttempts')) {
            practice_score.text('0%');
            if (isTeacher) {
                practice_button.find('span').text('Preview');
                practice_button.removeClass("hide");
            }
            bindPracticeEvents.call(context, practiceModality, 'Maximum allowed trial attempt reached', 'practice', 0);
        } else {
            practice_score.text('0%');
            if (isTeacher) {
                practice_button.find('span').text('Preview');
                practice_button.removeClass("hide");
            }
            bindPracticeEvents.call(context, practiceModality, '', 'practice', 0, true);
        }
    }

    function spacedPracticeEventHandler(){
        $(".practice-summary",".individual-modality-wrapper").off("click").on("click", function(evt){
            $('.js-practice_button','.individual-modality').trigger("click");
        })
    }

    function checkMemoryBoost(testObj){
        var _memoryBoost = "",
            difference="",
            _spScheduleData = testObj && testObj.spacedSchedule;
        if(_spScheduleData){
            var today = new Date(),
            dueDate = new Date(_spScheduleData.nextTime);
            //difference = (today - dueDate)/(24*60*60*1000);
            today.setHours(0,0,0,0);
            dueDate.setHours(0,0,0,0);
            difference = (today - dueDate)/(24*60*60*1000);

            if(difference < 0){
                //_memoryBoost = "strong";
                if(testObj && testObj.isRestart){
                    _memoryBoost = {
                            "due-msg" : "Strong",
                            "btn-msg" : "Restart",
                            "icon" : "icon-boost-strong",
                            "class" : "boost-strong"
                        }
                }else{
                    _memoryBoost = {
                            "due-msg" : "Strong",
                            "btn-msg" : "Keep practicing",
                            "icon" : "icon-boost-strong",
                            "class" : "boost-strong"
                        }
                }
            }else if(0 <= difference && difference <= 1){
                //_memoryBoost = "due_for_review";
                _memoryBoost = {
                        "due-msg" : "Due for review",
                        "btn-msg" : "Boost your memory",
                        "icon" : "icon-boost-due",
                        "class" : "boost-due"
                }
                logMemoryBoostADS();
            }else if(1 < difference){
                //_memoryBoost = "overdue";
                _memoryBoost = {
                        "due-msg" : "Review overdue",
                        "btn-msg" : "Boost your memory",
                        "icon" : "icon-boost-overdue",
                        "class" : "boost-overdue"
                }
                logMemoryBoostADS();
            }
        }
        return _memoryBoost
    }

    function logMemoryBoostADS(referrer) {
        if (window._ck12) {
            window._ck12.logEvent('FBS_MEMORY_BOOST ', {
                'memberID': window.ads_userid,
                'context_eid': _encodedID,
                'referrer': referrer || 'modality_details'
            });
        }
    }

    function getAdaptiveScores (perma) {
        var _d = $.Deferred();
        Util.ajax({
            'url': '/assessment/api/get/info/test/' + perma + "?spacedSchedule=True",
            'dataType': 'json',
            'cache': false,
            'data': {
                'adaptive': true,
                'checkUserLogin': true,
                'checkFreeAttempts': true
            },
            'success': function (data) {
                _d.resolve(data.response);
            },
            'error': function () {
                _d.reject('Failed to load featured content');
            }
        });
        return _d.promise();
    }

    function handleModalities(count) {
        var size;
        $('.js-navigate-left').addClass('disabled');
        $('.js-navigate-right').addClass('disabled');
        size = 3;
        if (count > 3) {
            $('.js-navigate-right').removeClass('disabled');
        }
        $('.js-related-modalities-wrapper').css('left', '0%');
        $('.js-navigate-related-modalities').removeClass('hide');
        $('.js-related-modalities-wrapper').css('width', (100/size) * count + '%');
        $('.js-individual-modality-wrapper').css('width', (100/count) + '%');
        $('.js-individual-modality-wrapper').removeClass('show-first');
        $('.js-individual-modality-wrapper:first-child').addClass('show-first');

        if(count >= 4){
            $('.js-individual-modality-wrapper').addClass("small-tooltip-width");
        }
    }

    function imageResize() {
        var width, height;
        $('img', '.individual-modality').load(function() {
            height = $(this)[0].naturalHeight;
            width = $(this)[0].naturalWidth;
            if ((width/height) >= 1.5) {
                $(this).css({
                    'height': '80px',
                    'width': 'auto'
                });
            } else {
                $(this).css({
                    'height': 'auto',
                    'width': '120px'
                });
            }
        });
    }

    function displayRelatedModalities(modalities) {
        var template = '', index, count, currentModality, modality_url, user_realm, practiceModality;
        count = modalities.length;
        for (index = 0; index < count; index++) {
            currentModality = modalities[index];
            modality_url = '/';
            modality_url += currentModality.domain.branchInfo.handle.toLowerCase() + '/' + currentModality.domain.handle + '/' + currentModality.artifactType + '/';
            if (currentModality.realm) {
                user_realm = /:(.*)/.exec(currentModality.realm);
                if (user_realm.length >= 2) {
                    currentModality.realm = currentModality.realm.replace(user_realm[1], escape(user_realm[1]));
                }
                modality_url += modality.realm + '/';
            }
            modality_url += encodeURIComponent(currentModality.handle) + '/?referrer=recommended_modalities';
            currentModality.details_url = modality_url;

            currentModality.modalityType = modalityUtil.getModalityType(currentModality.artifactType);
            currentModality.modalityIcon = modalityUtil.getModalityIcon(currentModality.modalityType.toLowerCase());
            if (!('asmtpractice' === currentModality.artifactType)) {
                if (currentModality.coverImageSatelliteUrl) {
                    currentModality.thumbnail_img = currentModality.coverImageSatelliteUrl.replace(/COVER_PAGE/g, 'COVER_PAGE_THUMB_POSTCARD_TINY').replace(/IMAGE/g, 'IMAGE_THUMB_POSTCARD_TINY');
                } else if (currentModality.coverImage) {
                    currentModality.thumbnail_img = currentModality.coverImage.replace('/flx/show/', '/flx/show/THUMB_POSTCARD/');
                } else {
                    currentModality.thumbnail_img = '';
                }
            }
            //template += relatedModalityTemplate(currentModality);
            $('.js-related-modalities-wrapper').append(relatedModalityTemplate(currentModality));
            if ('asmtpractice' === currentModality.artifactType) {
                practiceModality = currentModality;
                $('.js-related-modalities-wrapper .individual-modality-wrapper:last-child').addClass('asmtpractice');
                isTeacher ? $('.asmtpractice').removeClass('hide-badge') : $('.asmtpractice').addClass('hide-badge');
            }
            if (window.innerWidth < 768) {
                imageResize();
            }
        }
        if (count) {
            if ($('.animate-scroll').size() > 0){
                $('.related-modalities-container').addClass('show-for-medium-down').clone().insertAfter('#sharePlaneWrapper');
                $('#sharePlaneWrapper').next('.related-modalities-container')
                    .removeClass('show-for-medium-down')
                    .addClass('show-for-large-up movable-mod-cont')
                    .prepend(toggle_related_modality_html);
                $('.js-related-modalities-container').removeClass('hide');
                $('.related-text-movable-mod').removeClass('hide');
                // Add event handler for hover on related modalites container
                $('.related-modalities-container').on('mouseenter', onRelatedModalitiesHover);
                $('#sharePlaneWrapper').next('.related-modalities-container').find('.toggle-mod-cont').bind('click',toggleRelatedModalities);
                $('.related-text').offset({left:parseFloat($('.movable-mod-cont .individual-modality-wrapper:first').position().left)});
            } else {
                $('.related-modalities-container').removeClass('hide');
            }
            if (practiceModality) {
                getAdaptiveScores(practiceModality.perma.replace('asmtpractice', 'practice').replace(/^(\/)/, '')).done(function (score) {
                    practiceButtonHandler.call(modalities[0], practiceModality, score);
                });
            }

            if (count > 3) {
            	handleModalities(count);
                $('.js-navigate-right').off('click.navigate').on('click.navigate', function() {
                    navigateRight();
                });
                $('.js-navigate-left').off('click.navigate').on('click.navigate', function() {
                    navigateLeft();
                });
            }

            if(count === 4 && practiceModality && !isTeacher){
            	$('.js-navigate-related-modalities').addClass("hide-for-desktop");
            }

            if (count === 1 && $('.related-modalities-container .individual-modality-wrapper').hasClass('asmtpractice')) {
            	$('.js-related-modalities-container').addClass('hide');
            }
        }
    }

    function getRelatedModalities() {
        if (artifact_json.domain && artifact_json.domain.handle) {
            getFeatured(artifact_json.domain.handle).done(function(modalities) {
                displayRelatedModalities(modalities.Artifacts || '');
            });
        }
    }

    function closeRelatedModalities(){
        $('.close-mod-cont').off('click.closeModCont').on('click.closeModCont', function () {
            $(this).closest('.movable-mod-cont').fadeOut(1000, function () {
                $('.js-share-plane').css('bottom', '5px');
                $(this).closest('.movable-mod-cont').addClass('hide-movable-mod-cont');
            });
        });
    }

    /*
     * Minimize the related modalites container
     * - Changes the height to the value set for
     *   minimized_container_height
     * - Sets the state to minimize
     */
    function minimizeRelatedModalities(userclick){
        $('.js-related-modalities-container').css('height', minimized_container_height + 'px');
        $('i:.icon-arrow_down').attr('class','icon-arrow_up');
        $('.js-share-plane').css('bottom','60px');
        $('.related-modalities-content').css('padding-top','12px');
        $('.js-related-icons-wrapper').fadeIn('fast');
        related_mod_state.state = 'minimize';
        if (userclick){
            related_mod_state.trigger = 'min';
        } else {
            related_mod_state.trigger = 'js';
        }
    }

    /*
     * Expand the related modalites container
     * - Changes the height to the value set for
     *   expanded_container_height
     * - Sets the state to expand
     */
    function expandRelatedModalities(userclick){
        $('.js-related-modalities-container').css('height', expanded_container_height + 'px');
        $('.related-modalities-content').css('padding-top','14px');
        $('i:.icon-arrow_up').attr('class','icon-arrow_down');
        $('.js-share-plane').css('bottom','220px');
        $('.js-related-icons-wrapper').fadeOut('fast');
        related_mod_state.state = 'expand';
        if (userclick){
            related_mod_state.trigger = 'exp';
        }
    }

    function isRelatedModMinimized(){
        return $('.js-related-modalities-container').height() === minimized_container_height;
    }
    function toggleRelatedModalities(){
        var minimized = isRelatedModMinimized();

        if (minimized === false){
            minimizeRelatedModalities(true);
        } else {
            expandRelatedModalities(true);
        }
    }

    function onRelatedModalitiesHover(){
        if (isRelatedModMinimized() === true){
            expandRelatedModalities(true);
        }
    }

    function clearForStaticRelatedModalites(){
        $('.related-modalities-container').css('height','initial');
        $('.related-modalities-container .individual-modality .image-wrapper').removeClass('left');
    }

    function rePositionLearnMore(){
        var $relModCont = $('.related-modalities-container.movable-mod-cont'),
        contentHeight = $('#view_content').height(),
        scrollHeight = $(window).scrollTop(),
        documentHeight = $(document).height(),
        pos = documentHeight - ($(window).height() + $('footer').outerHeight()),
                rockBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight,
                scrollPercentage = getScrollPercent(),
                $imageWrapper = $('.related-modalities-container .individual-modality .image-wrapper');
                var bottomTriggerPoint = ($('#nav_artifact').position().top - bottom_scroll_trigger_padding);

                if (window.innerWidth > 768){
                    if (!$imageWrapper.hasClass('left')){
                        $imageWrapper.addClass('left');
                    }
                    // User scrolls past bottom trigger point, expand unless the user clicked on toggle buttom keep their state
                    if ( scrollHeight >= bottomTriggerPoint && rockBottom === false ){
                        if (related_mod_state.trigger !== 'min'){
                            expandRelatedModalities()
                        }
                    }
                    // If user scrolls up we want to minimize
                    else if ( scrollHeight > 10 && scrollHeight < lastScrollPosition && !$relModCont.hasClass('hide-movable-mod-cont') && scrollHeight <= bottomTriggerPoint){
                        minimizeRelatedModalities();
                    }
            //if(scrollHeight + 400 > contentHeight && !$relModCont.hasClass('hide-movable-mod-cont')){
            else if( scrollPercentage >= $relModCont.data('scrollCheck') && !$relModCont.hasClass('hide-movable-mod-cont')){

                related_mod_state[related_mod_state.state](related_mod_state.trigger === 'min');
                // Scroll to bottom of page
                if (showRelatedBottom === false && rockBottom === true) {
                    $relModCont.css('height', '0px');
                    $('.js-share-plane').css('bottom', '5px');
                }
            }
            // Scroll to top of page
            else {
                $relModCont.css('height', '0px');
                $('.js-share-plane').css('bottom', '5px');
            }
            lastScrollPosition = scrollHeight;
        } else {
            clearForStaticRelatedModalites();
        }
    }

    function addToTable(annotations){
        var anno_html = '';
        annotations.forEach(function(annotation){
            anno_html += '<tr data-annoId="'+annotation.id+'">'+
                            '<td><span class="circle '+annotation.highlightColor+'"></span></td>'+
                            '<td>'+ _.escape(annotation.quote)+'</td><td>'+ _.escape(annotation.text||'')+'</td>'+
                            '<td><span class="delete-btn-container"><i class="icon-delete_cc delete-annotation-btn" data-annoId="'+annotation.id+'"></i></span></td>'+
                          '</tr>';
        });
        $('#notes-pagination').parent().before(anno_html);
    }
    function practiceWidgetsettings(){
    	var isCreator = true;
    	if(artifact_breadcrumbs){
    		for(var i =0; i < artifact_breadcrumbs.length; i++){
    			if(artifact_breadcrumbs[i].realm){
    				isCreator = false;
    			}
    		}
    	}
    	if(!isTeacher && (artifact_json.artifactType === "lesson" || artifact_json.artifactType === "section") && isCreator){
    		$("#content-area").addClass("student-view-section");
    		if($(".practice-badge-wrapper").length !==0){
    			$("#leftsecondary").css("width","50px").addClass("student-view");
    			$("#content").removeClass("large-10").addClass("large-12");
    			$("#details_tabs").removeClass("large-10").addClass("large-8 animate-width change-width");
    			$("#nav_artifact").parent().addClass("change-width");
    		}else{
    			$("#details_tabs").removeClass("large-10").addClass("large-11");
    			$("#content-area").addClass("old-section");
    			$(".coverimage div").removeClass("hide-for-student");
    		}

    		$("#practiceWidget").removeClass("hide");
    		$(".practice-badge-wrapper").addClass("hide");
    		$("a[data-ga-tab-name = 'exercises']").addClass("hide");
    		window.isWidgetAvailable = true;
    	}else if(isTeacher && (artifact_json.artifactType === "lesson" || artifact_json.artifactType === "section") && isCreator){
    		$("a[data-ga-tab-name = 'exercises']").addClass("hide");
    		$("#details_tabs").removeClass("large-10").addClass("large-12");
    		$(".practice-badge-wrapper").removeClass("hide");
    		$("#content-area").addClass("teacher-view-section");
    		$(".coverimage div").removeClass("hide-for-student");
    	}else{
    		$("#details_tabs").removeClass("large-10").addClass("large-12");
    		$(".practice-badge-wrapper").removeClass("hide");
    		$("#content-area").addClass("teacher-view-section");
    		$(".coverimage div").removeClass("hide-for-student");
    	}
    	$("#sideNav2").removeClass("hide-for-sidenav2");

    }

    function relatedConceptsSettings(){
        function loadRelatedConcept() {
    	    if ($('.ab_concept_list li').length) {
    	        $('#related-concept-root').removeClass('hide');
                $("#content").removeClass("large-10");
                $("#content").addClass("large-8 small-12");
                $(".ck12-annotation-toolbar-container").css({"z-index":2});
                $("#ab_concept_container").css({"margin-top": 109 + "px"});
                $(window).scroll(function(){
                  var pageHeight = document.body.scrollHeight;
                  //Scroll the widget as page scrolls up or down, but with some margin
                  var scrollTop = Math.max($(window).scrollTop(), 109);
                  if (pageHeight - scrollTop > 1000) {
                    $("#ab_concept_container").css({"margin-top": scrollTop + "px"});
                  }
                });
    	    } else {
    	        $('#content').removeClass('large-10').addClass("large-12");
    	    }
            //cleanup redundant spacers between hidden items
            $('li.divider.spacetop').each(function(item){
                //If previous element is hidden, then hide this spacer
                if (! $(this.previousElementSibling).is(":visible")) {
                    $(this).addClass('hide');
                }
            });
        }

    	if (modality_type === "section") {
    	    $('.content-wrap').append('<div><div id="related-concept-root" class="hide"></div></div>');
    	    $("#details_tabs").removeClass("large-10").addClass("large-12");
    	    $('#view_content').css("padding", "60px 20px 60px 20px");
    	    RelatedConcept.init(artifactID, 3);
    	    $("#leftsecondary").css("width","50px").addClass("student-view");
            $("#assign-tooltip").addClass('new-icon-view');
    	    if ($(window).width() > 1024) {
              $('.old-icon-view').hide();
    	      $(".coverimage div").addClass("hide-for-student");
    	    }
    	    $(window).resize(function() {
                if ($(window).width() > 1024) {
                  $('.old-icon-view').hide();
                  $(".coverimage div").addClass("hide-for-student");
                } else {
                  $('.old-icon-view').show();
                  $(".coverimage div").removeClass("hide-for-student");
                }
    	    });
    	    $('.assign-info-img').hide();
    	    window.setTimeout(loadRelatedConcept, 2000);
        }



    }

    function checkAuthority() {
        var _d = $.Deferred();
        Util.ajax({
            url: Util.getApiUrl('flx/check/editing/authority/for/' + artifactID),
            cache: false,
            isPageDisable: true,
            isShowLoading: true,
            success: function (data) {
                _d.resolve(data.response);
            },
            error: function() {
                _d.reject('Failed');
            }
        });
        return _d.promise();
    }

    function checkForCollaborator() {
        var bookID, bookInCollaboration, _d = $.Deferred();
        if (artifact_json.revisions[0].hasOwnProperty('ancestors')) {
            bookID = artifact_json.revisions[0].ancestors['0.0'].artifactID;
            Artifact.checkIfbookInCollaborationLibrary(bookID).done(function(data){
                if (data){
                    Util.ajax({
                        url: Util.getApiUrl('flx/get/editing/group/' + bookID),
                        cache: false,
                        isPageDisable: true,
                        isShowLoading: true,
                        success: function (data) {
                            _d.resolve(data.response);
                        },
                        error: function() {
                            _d.reject('Failed');
                        }
                    });
                } else {
                    _d.reject(null);
                }
            });
        } else {
            return _d.resolve(null);
        }
        return _d.promise();
    }

    function getDraftResources(artifactDraftResources) {
        var idx,
            artifactDraftResource,
            artifactDraftResourcePublic,
            draftResourcesHtml = '';

        for (idx=0; idx<artifactDraftResources.length; idx++) {
            artifactDraftResource = artifactDraftResources[idx],
            artifactDraftResourcePublic = artifactDraftResource.resourceIsPublic ? "" : "hide" ;
            draftResourcesHtml = draftResourcesHtml + '<div class="resource_row js_resource_row"' +
                                     'data-resource-id="'+ artifactDraftResource.resourceId +'" ' +
                                     'data-resource-name="'+ artifactDraftResource.resourceName +'" ' +
                                     'data-resource-type="'+ artifactDraftResource.resourceType +'" ' +
                                     'data-resource-external="0"' +
                                     'data-resource-uri="/flx/show/attachment/'+ artifact_json.realm +'/'+ artifactDraftResource.resourceName +'">' +
                                     '<div class="js_row_info info">' +
                                         '<div class="resourceicons">' +
                                             '<span class="attachment_icon imgwrap type_'+ artifactDraftResource.resourceType +'"></span>' +
                                             '<span class="noimage js_noimage  '+ artifactDraftResourcePublic +' "></span>' +
                                             '<span class="js_publishstate_icon " title="Private" ></span>' +
                                         '</div>' +
                                         '<div class="resourcename">' +
                                             '<div class="resourcenamelinkwrap">' +
                                                 '<a target="_blank" title="'+ artifactDraftResource.resourceName +'" alt="'+ artifactDraftResource.resourceName +'" class="break-word js_resource_link" href="/flx/show/attachment/'+ artifact_json.realm +'/'+ artifactDraftResource.resourceName +'">'+ artifactDraftResource.resourceName +'</a>' +
                                             '</div>' +
                                         '</div>' +
                                         '<div class="clear"></div>' +
                                     '</div>' +
                                     '<div class="clear"></div>' +
                                     '<div class="divider spacetop"></div>' +
                                 '</div>';
        }
        draftResourcesHtml = '<div class="artifact_attachment_container js_resource_container">'+ draftResourcesHtml +'</div>';
        $('#view_attachments .resources_container').removeAttr('data-loadurl').html(draftResourcesHtml);
    }

    function artifactContentLoadSuccess() {
        var artifactLoadurl;
        $('#artifact_content').data('loader').done(function (data) {
            $('#artifact_content').trigger('flxweb.artifact.content.load.success', data);
            window.setTimeout(renderMathJax, 3000);
            $('iframe', '#artifact_content').each(function() {
                if ($(this).attr('src').match('ck12.org/embed')) {
                    $(this).addClass('ck12-embed-iframe');
                }
            });
            $('a', '#details_tabs').off('click.hash').on('click.hash', function(e) {
                var scrollElement, href;
                href = $(this).attr('href');
                if(href === '#view_content'){
                  $('.quick-tips li i').removeClass('hide');
                //fixed for Bug #55321
                  if(window && window.isPracticeWidgetView && !isTeacher){
                	  $('.quick-tips li > i').css("opacity",1)
                  }
                }else{
                  if(!$('.quick-tips li i').hasClass('hide') && !(window && window.isPracticeWidgetView && !isTeacher)){
                    $('.quick-tips li i').addClass('hide');
                  }else if(window && window.isPracticeWidgetView && !isTeacher){
                	  $('.quick-tips li > i').css("opacity",0)
                  }
                }
                if ((href[0] === '#') && (href !== '#')) {
                    e.preventDefault();
                    href = href.substring(1, href.length);
                    scrollElement = $(document.getElementById(href));
                    if(!scrollElement.is(':visible') && scrollElement.closest('[itemprop=video]').length){
                        scrollElement = scrollElement.closest('[itemprop=video]');
                    }
                    $('body').scrollTo(scrollElement.offset().top - $('header').height());
                }
            });
        }).fail(function() {
            artifactLoadurl = '/flx/get/info/revisions/' + artifactRevisionID + '?format=json';
            $('#artifact_content').data('loadurl', artifactLoadurl);
            artifactDetailsCommon.artifactXhtml(false);
            artifactContentLoadSuccess();
        });
    }

    function checkSectionCollaboration() {
        var members, index = 0, collaborator = false, userID, artifactLoadurl;
        userID = $('header').data('user'); //TODO: need a better way to check for logged-in user.
        checkForCollaborator().done(function(data) {
            if ($('#artifact_content').data('loadurl').indexOf('/artifactdraft/') === -1 && data && data.group && data.group.id) {
                artifactLoadurl = '/flx/artifactdraft/artifactDraftArtifactRevisionID=' + artifactRevisionID + '?format=json&collaborationGroupID=' + data.group.id;
                $('#artifact_content').data('loadurl', artifactLoadurl);
            }
            artifactDetailsCommon.artifactXhtml();
            artifactContentLoadSuccess();
            if (data && data.group && data.group.members) {
                members = data.group.members;
                for (index = 0; index < members.length; index++) {
                    if (members[index].id === userID) {
                        collaborator = true;
                        break;
                    }
                }
                if(collaborator){
                    if(artifact_json.draftResources && artifact_json.draftResources.length !== 0) {
                        getDraftResources(artifact_json.draftResources);
                    }
                    $($('.js-shareGroupLink')[0]).attr('title','Section is a part of Collaboration Editing').addClass('already_in_library').siblings('.groups_share_dialog').remove();
                    $('#add_to_book').attr('title','Section is a part of Collaboration Editing').addClass('already_in_library');
                    checkAuthority().done(function(data) {
                        $('#add_to_library').attr('title','Section is a part of Collaboration Editing').addClass('already_in_library');
                        if (data === 'authorized'){
                            if(artifact_json.creatorID != userID) {
                                $('#personalize_link').attr({
                                    title: 'Edit this Concept',
                                    href: $('#personalize_link').attr('hrefcoll')+'/'+artifact_json.title
                                }).html('Edit').siblings('span.customize-help-wrapper').remove();
                                $('#view_attachments .cannot_add_resources').remove();
                            }
                            if(data.finalization){
                                $('#personalize_link').attr('href','javascript:;').addClass('already_in_library');
                            }
                        }
                        else {
                            if (!(artifact_json.revisions[0].ancestors['0.0'].creatorID === userID && artifact_json.creatorID !== userID)) {
                                $('#personalize_link').attr({title:'Edit this Concept', href:'javascript:;'}).html('Edit').addClass('already_in_library').siblings('span.customize-help-wrapper').remove();
                            }
                            $('#view_attachments .cannot_add_resources').remove();
                        }
                    }).fail(function(){
                        modalView.alert("There was an error while verifying collaboration permissions.");
                    });
                }
            }
            $('#sideNav2').animate({opacity: 1}, 1000);
        }).fail(function(){
            artifactDetailsCommon.artifactXhtml();
            artifactContentLoadSuccess();
            console.log("Could not determine collaboration status.");
            $('#sideNav2').animate({opacity: 1}, 1000);
        });
    }

    function enableSummaryLink(){
        if(artifact_json.creatorID == 3){
            var self = this;
            Util.ajax({
                url: Util.getApiUrl('flx/get/artifactsummary/' + artifactID),
                contentType: 'application/json'
            }).done(function(data){
                if(data.response && data.response.artifactID == artifactID && data.response.summaries.length > 0){
                    $('.artifact_summary_dialog').parent().removeClass('hide');
                    window.artifactSummaryView = new ArtifactSummaryView({
                        target: $('.artifact_summary_dialog'),
                        model: new Backbone.Model({title: artifact_json.title, summaries : data.response.summaries})
                    });
                }
            });
        }
    }

    function loadSummaryDialog() {
        window.artifactSummaryView.render();
        return false;
    }

    function domReady() {
        var bookInCollaboration;
        enableSummaryLink();
        if(window && window.isPracticeWidgetView){
        	practiceWidgetsettings();
        }
        checkSectionCollaboration();
        if (!$('.js-related-modalities-container').hasClass('hide-modalities')) {
            getRelatedModalities();
        }
        relatedConceptsSettings();
        bookInCollaboration = Util.getQueryParam('collaboration', window.location.href);
        if (bookInCollaboration === 'true') {
            $('a', '#nav_artifact').add('a', '#navartifacttopsmall').each(function() {
                $(this).attr('href', $(this).attr('href') + '?collaboration=true');
            });
        }
        $('.js_detailbody').find('img').click(imageDialog_show);
        $('#js_imgdialogfullsize').click(imageDialog_fullsize);
        $('#js_imgdialogfitsize').click(imageDialog_fitsize);
        $('#js_imgdialogclose').click(imageDialog_hide);
        $('#concept_embed').toggle(show_embed_block, hide_embed_block);
        // select text in embed code box on click.
        $('#embed_box').click(embedbox_click);
        $('#embed_width').add('#embed_height').keydown(embedSizeChange).keyup(updateEmbedCode);
        // image optimization
        $('.x-ck12-img-postcard img').add($('.x-ck12-img-thumbnail img')).add($('.x-ck12-img-fullpage img')).removeAttr('width');

        // anchor behavior for artifact images
        $('.js_thumbsmallimgframe').click(artifact_click);
        $('.backtotop a').click(backtotop_click);
        $('.js_update_link').click(updateLinkClick);
        artifact_link_assign_target();
        //commenting because we are no longer loading HWP exercise
        //ExerciseModule.initExercise();
        if ($('.ui-widget-overlay').length === 0) {
            $('#artifact_content iframe').css('visibility', 'visible');
        }

        $('#artifact_content').bind('flxweb.artifact.content.load.success', bookContentLoadCallback);
        if (artifact_json.hasDraft) {
            getArtifactDraft(artifact_json.artifactRevisionID).done(function (response) {
                if (response.hasOwnProperty('response')) {
                    response = response.response;
                    if (response.hasOwnProperty('artifactDraft') && !($.isEmptyObject(response.artifactDraft))) {
                        $('#draft-label').removeClass('hide');
                    }
                }
            });
        }

        $('.js-related-help-wrapper').off('click.tooltip').on('click.tooltip', function(event) {
            $('.js-modality-tooltip').toggleClass('open');
            event.stopPropagation();
        });
        $('body').off('click.tip').on('click.tip', function(event) {
            if (!$(event.target).parents().hasClass('js-related-help-wrapper')) {
                $('.js-modality-tooltip').removeClass('open');
            }
        });
        $('.js-collapse-details').off('click.expand').on('click.expand', function(event) {
            $('#view_details').toggleClass('show');
            $('.show', '.js-collapse-details').toggleClass('hide');
            $('.tip', '.js-collapse-details').toggleClass('up');
        });
        // Class "animate-scroll" is the flag to disable animation for related modalities
        if ( $('.related-modalities-container').hasClass('animate-scroll')){
            $(window).off('resize.learnMoreContent').on('resize.learnMoreContent', rePositionLearnMore);
            $(window).off('scroll.learnMoreContent').on('scroll.learnMoreContent', rePositionLearnMore);
        }

        $('.artifact_summary_dialog').on('click', loadSummaryDialog);

        //CK12 Annotation
        $('.quick-tips a').on('click', function(e){
            e.preventDefault();
            var $targetLink = $(e.currentTarget),
                name = $targetLink.attr('name');
                $('.js_detailstabs').tabs('select',0);
                $('.quick-tips li i').removeClass('hide');
                //fixed for Bug #55321
                if(window && window.isPracticeWidgetView && !isTeacher){
              	  $('.quick-tips li > i').css("opacity",1)
                }
            if(name === 'vocabulary'){
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_ACTION', {
                        action_type: 'link',
                        action_name: 'qt_vocabulary',
                        screen_name: 'flexbook',
                        additional_params1: window.artifactID
                    });
                }
                window.scrollTo(0, $('.vocabulary_content').offset().top-100);
            }else if(name === 'myAnnotations'){
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_ACTION', {
                        action_type: 'link',
                        action_name: 'qt_annotations',
                        screen_name: 'flexbook',
                        additional_params1: window.artifactID
                    });
                }
                window.scrollTo(0, $('.myAnnotations').offset().top -100);
            }
        });
        if(!window.artifact_json.hasDraft){
            if(window.isFlxwebVocabularyDoneTriggered){
                vocabularyDoneCallBack();
            }else{
                $(document).bind('flxweb.vocabulary.done', vocabularyDoneCallBack);
            }
        }
    }
    function vocabularyDoneCallBack(){
        var user = User.getUser();
        $(window).scroll(function(){
            var stopPos = $('#view_content').height() + $('#view_content').offset().top;
            var $quickTip = $('.quick-tips').parent();

            if($(window).scrollTop() > stopPos){
                if(!$quickTip.hasClass('quick-tips-stop')){
                    $quickTip.addClass('quick-tips-stop');
                }
            }else{
                if($quickTip.hasClass('quick-tips-stop')){
                    $quickTip.removeClass('quick-tips-stop');
                }
            }
        });
        require(['ck12annotator/ck12annotator'], function(CK12Annotator){
            var containerSelector = '#artifact_content';
            var ck12Annotator = new CK12Annotator(containerSelector, window.artifactID, window.artifactRevisionID, user);
            ck12Annotator.create();
            var $tableSection = $('.myAnnotations-container');
            if(user.done(function(userInfo){
                if(!userInfo.isLoggedIn()){
                    var nonsignin_html = '<tr><td><span class="circle disable-circle"></span></td><td colspan="2">Please <a href="#" class="signin-link">Sign In</a> to create your own Highlights / Notes</td></tr>';
                    var $nonsignin = $(nonsignin_html);
                    $('#notes-pagination').parent().before($nonsignin);
                    $nonsignin.on('click', 'a', function(e){
                        if (window.dexterjs){
                            window.dexterjs.logEvent('FBS_SIGNIN_CTA', {
                                feature: 'annotations',
                                source : 'my_notes',
                                additional_params1: window.artifactID,
                                additional_params2: window.artifactRevisionID
                            });
                        }
                        e.preventDefault();
                        require(['common/views/login.popup.view'], function(loginPopup){
                            loginPopup.showLoginDialogue();
                        });
                    });
                }
            }))
            ck12Annotator.annotationsPromise.done(function(annotations){
                var newAnnotations = [];
                annotations = annotations.filter(function(anno){    //Hide buggy annotations
                    if(anno.migrated && anno.quote.trim().length < 3 && (!anno.text|| anno.text.length === 0)){
                        return false;
                    }
                    return true;
                });
                var page = 0;
                var itemsPerPage = 5;
                var totalPage = Math.ceil(annotations.length/itemsPerPage)-1;
                var showAnnotations = annotations.slice(0, itemsPerPage);
                if(user.done(function(userInfo){
                    if(userInfo.isLoggedIn()){
                        $('.report-link').removeClass('hide');
                        var email = 'support@ck12.org',
                            subject = 'Having trouble with annotations',
                            emailBody = '<Please provide some details about the issue you are experiencing with annotations>%0D%0A%0D%0A' +
                                        '--- Technical Details ---%0D%0A' +
                                        'Page:' + window.location.href + '%0D%0A' +
                                        'ID:' + userInfo.userInfoDetail.id+'%0D%0A'+
                                        'Browser:' + window.navigator.userAgent+'%0D%0A%0D%0A';
                        $('.report-link a').attr('href', 'mailto:' + email + '?subject=' + subject + '&body=' +   emailBody);
                        $('.report-link').off('click','a').on('click','a', function(e){
                            if (window.dexterjs){
                                window.dexterjs.logEvent('FBS_ACTION', {
                                    action_type: 'mailto_link',
                                    action_name: 'report_an_issue',
                                    screen_name: 'annotations',
                                    additional_params1: window.artifactID
                                    // additional_params2: window.context_json.encodedID
                                });
                            }
                        });
                        if(annotations.length === 0){
                            var noAnnoMessage = '<tr class="no-annotation-message"><td><span class="circle disable-circle"></span></td><td colspan="3">Highlight or Annotate any text from above, and it will appear here.</td></tr>';
                            var $noAnnoMessage = $(noAnnoMessage);
                            $('#notes-pagination').parent().before($noAnnoMessage);
                            return;
                        }
                        addToTable(showAnnotations);
                        $('#notes-pagination').parent().removeClass('hide');
                        if(page >= totalPage){
                            $('#notes-pagination').parent().hide();
                        }
                    }
                }))
                $('.myAnnotations-container').off('click','.delete-annotation-btn').on('click','.delete-annotation-btn', function(){
                    var annoID = $(this).attr('data-annoId');
                    var targetAnno = annotations.filter(function(anno) {
                      return anno.id === annoID;
                    });
                    if(targetAnno.length === 0){
                      targetAnno = newAnnotations.filter(function (anno) {
                        return anno.id === annoID;
                      })
                      var index = newAnnotations.indexOf(targetAnno[0]);
                      if(index !== -1){
                        targetAnno = newAnnotations.splice(index,1);
                      }
                    }
                    $(containerSelector).data('annotator').deleteAnnotation(targetAnno[0]);

                });

                $('#notes-pagination').on('click', function(){
                    if (window.dexterjs){
                        window.dexterjs.logEvent('FBS_ACTION', {
                            action_type: 'button',
                            action_name: 'show_more',
                            screen_name: 'my_notes',
                            additional_params1: window.artifactID
                        });
                    }
                    page++;
                    if(page >= totalPage){
                        $(this).parent().hide();
                    }
                    showAnnotations = annotations.slice(page*itemsPerPage, page*itemsPerPage+itemsPerPage);
                    addToTable(showAnnotations);
                });
                $(document).off('createdNewAnnotation').on('createdNewAnnotation', function(e, annotation){
                    $('.no-annotation-message').remove();
                    var newAnno = '<tr data-annoId="'+annotation.id+'">'+
                                      '<td><span class="circle '+annotation.highlightColor+'"></span></td>'+
                                      '<td>'+ _.escape(annotation.quote)+'</td><td>'+ _.escape(annotation.text||'')+'</td>'+
                                      '<td><span class="delete-btn-container"><i class="icon-delete_cc delete-annotation-btn" data-annoId="'+annotation.id+'"></i><span></td>'+
                                    '</tr>';
                    $('.myAnnotations-container tbody').prepend(newAnno);
                    newAnnotations.push(annotation);
                });
                $(document).off('updateAnnotation').on('updateAnnotation', function(e, annotation){
                    var $targetRow = $tableSection.find('tr[data-annoId='+annotation.id+']');
                    $targetRow.find('td:nth-child(1) .circle').attr('class', 'circle '+annotation.highlightColor);
                    $targetRow.find('td:nth-child(3)').html(_.escape(annotation.text || ''));
                });
                $(document).off('deletedAnnotation').on('deletedAnnotation', function(e,annotation){
                    $tableSection.find('tr[data-annoId='+annotation.id+']').remove();
                    if($tableSection.find('tr').length === 2){ //no annotation in the table. 2 is table header and hidden 'show more' button.
                      var noAnnoMessage = '<tr class="no-annotation-message"><td><span class="circle disable-circle"></span></td><td colspan="3">Highlight or Annotate any text from above, and it will appear here.</td></tr>';
                      var $noAnnoMessage = $(noAnnoMessage);
                      $('#notes-pagination').parent().before($noAnnoMessage);
                    }
                });

            });
        });
    }

    $(document).ready(domReady);
});
