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
 * This file originally written by Shanmuga Bala
 *
 * $Id$
 */
define('flxweb.vocabulary', ['jquery', 'jquery-ui', 'flxweb.models.artifact', 'jquery.qtip'],
    function ($) {
        'use strict';

        var vocab = {};
        // This function is should probably be moved into a common lib
        // This was taken from flxweb.details.concept.js and modfied
        // to render x-ck12-math images
        // Bug 55721
        function renderMathJax() {
            window.vocab_mathjax = 0;
            var $this, cnt = 0;
            $('section.vocabulary_content').find('.x-ck12-mathEditor, .x-ck12-math, .x-ck12-hwpmath, .x-ck12-block-math').each(function () {
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
                        $this.html(mathLatex).removeAttr('data-tex-mathjax').closest('p').css('overflow-y','hidden');
                        cnt++;
                    } else if( $this.hasClass('x-ck12-math') && $this.attr('alt') !== undefined){
                        $this.attr('alt',$this.attr('alt').replace("<", "\\lt ").replace(">", "\\gt "));
                        //decodedTex = decodeURIComponent($this.attr('data-tex'));
                        decodedTex = $this.attr('alt');
                        if ($this.data('mathmethod') === 'block' && decodedTex.indexOf('\\begin{align') === -1) {
                            mathLatex = '\\begin{align*}' + decodedTex + '\\end{align*}';
                        } else {
                            mathLatex = decodedTex;
                        }
                        mathLatex = ('@$' + mathLatex + '@$').replace(/</g, '&lt;');
                        $this.before('<span>'+mathLatex+'</span>');
                        $this.remove();
                        cnt++;
                    } else {
                        if($this.attr('alt') !== undefined){
                            $this.attr('alt',$this.attr('alt').replace("<", "\\lt ").replace(">", "\\gt "));
                        }
                        if(!$this.data('tex')){
                                $this.remove();
                        }
                    }
                } catch (merr) {
                    console.log('[vocabulary] Error rendering mathjax: ' + merr);
                }
            });
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'vocabularygrid']);
            console.log('Vocaulary has ' + cnt + ' math expressions');
            window.vocab_mathjax = cnt;
        }

        function language_selected_click() {
            if ($(this).hasClass('item_header')) {
                return false;
            }
            if ($(this).hasClass('selected')) {
                return;
            }
            $(this).unbind('click');
            var language_code = $(this).data('language-code'),
                language_name = $(this).data('language-name'),
                url = $('section.vocabulary_content').data('loadurl');
            if (language_code) {
                url = url + '?code=' + language_code;
            }
            $('#selected_language').html(language_name);
            $('section.vocabulary_content').load(url, function () {
                $(this).trigger('flxweb.loadlater.loadcomplete');
                $(this).show(800);
            });
        }

        function prepare_definition_tips() {
            var child, definition, pos = $(window).width() < 768 ? 'top right' : 'top center';
            $('.vocabularygrid').children().each(
                function () {
                    child = $(this);
                    definition = $('.context', child);
                    child.qtip({
                        content: definition.html(),
                        position: {
                            my: 'bottom center',
                            at: pos,
                            adjust: {
                                y: -10,
                                x: 5
                            },
                            viewport: $(window)
                        },
                        style: {
                            classes: 'ui-tooltip-vocabulary',
                            tip: false
                        },

                        show: {
                            delay: 400
                        }
                    });
                }
            );
        }

        function load_complete() {
            $('.vocabulary_wrap .drop-menu').ck12_dropDownMenu();
            $('.item_language').unbind('click');
            $('.item_language').click(language_selected_click);
            prepare_definition_tips();

        }

        function qtipPositioning() {
            $('.vocab_term').qtip({
                content: {
                    text: function () {
                        return vocab[$(this).text().toLowerCase().trim()];
                    },
                    title: {
                        text: function () {
                            return $(this).text().toLowerCase().trim();
                        }
                    }
                },
                position: {
                    my: 'bottom center',
                    at: 'top center',
                    adjust: {
                        y: -10,
                        x: 5
                    },
                    viewport: $(window)
                },
                style: {
                    classes: 'ui-tooltip-vocabulary',
                    tip: false
                }

            });
        }

        function getVocabElementsInText() {
            var i, newVocabKeys, vocabList, containerContent,
                pattern = /['H'][0-9]/,
                vocabTags = ['DIV', 'SECTION', 'UL', 'OL', 'P', 'TABLE'];
            for (i = 0; i < window.vocab_data.length; i++) {
                vocab[window.vocab_data[i].term] = window.vocab_data[i].definition;
            }
            newVocabKeys = _.keys(vocab).sort(function (a, b) {
                return b.length - a.length;
            });
            for (i = 0; i < newVocabKeys.length; i++) {
                $(window.vocabContainer).each(function () {
                    containerContent = $(this).html().trim();
                    if (vocabTags.indexOf($(this)[0].nodeName) !== -1) {
                        if (!pattern.test(this.nodeName)) {
                            vocabList = containerContent.match(new RegExp('(\\b' + newVocabKeys[i] + '\\b)(?![^<]*>)', 'ig'));
                            if (vocabList !== null) {
                                containerContent = containerContent.replace(new RegExp('(\\b' + vocabList[0] + '\\b)(?![^<]*>)'), '_@_' + vocabList[0] + '_@@_');
                                $(this).html(containerContent);
                            }
                        }
                    }
                });
                if (newVocabKeys[i] !== newVocabKeys[i].toLowerCase()) {
                    vocab[newVocabKeys[i].toLowerCase()] = vocab[newVocabKeys[i]];
                    delete vocab[newVocabKeys[i]];
                }
            }
            $(window.vocabContainer).each(function () {
                $(this).html($(this).html().trim().replace(/_@_/g, '<span class = "vocab_term">').replace(/_@@_/g, '</span>'));
            });
            qtipPositioning();
            if(window.vocab_data.length === 0){
                $('a[href=#vocabulary]').parent().addClass('hide');
            }
            $(document).trigger('flxweb.vocabulary.done');
            window.isFlxwebVocabularyDoneTriggered = true;
        }

        function domReady() {
            var vocabulary_content =$('section.vocabulary_content');
            $(document).bind('flxweb.loadlater.loadcomplete', load_complete);
            vocabulary_content.hide();
            //TODO: Change from using flxweb ajax vocabulary and call
            // flx api directly. Will need to move template and add logic to render -FN
            vocabulary_content.load(vocabulary_content.data('loadurl'), function () {
                vocabulary_content.trigger('flxweb.loadlater.loadcomplete');
                vocabulary_content.show(800);
                window.setTimeout(renderMathJax, 3000);
            });
            $(document).bind('flxweb.load.showvocabtooltips', function () {
                if (window.vocab_data) {
                    getVocabElementsInText();
                } else {
                    setTimeout(function () {
                        $(document).trigger('flxweb.load.showvocabtooltips');
                    }, 2000);
                }
            });
        }

        $(document).ready(domReady);

    });
