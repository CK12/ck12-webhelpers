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
 * This file originally written by Chetan Padhye
 *
 * $Id$
 */
define('flxweb.details.image_attribution', [
        'jquery',
        'underscore',
        'jquery.qtip', 'jquery.scrollTo'
    ],
    function ($, _) {

        'use strict';

        /** parse xhtml and show the image attributions.
         * We currently show the image attributions two
         * ways: one as a hover tip and the other as a
         * image attribution section at the end of the html
         */
        function tooltipPositioning(context) {
            $('body > .watermark').css({
                'top': $(context).offset().top - 13,
                'left': $(context).offset().left + $(context).width() + 15
            });
        }

        function loadTooltip(thisElement) {
            var template = '';
            require(['text!templates/image.attribution.tooltip.html'], function (tooltipTemplate) {
                $('#mobileTooltip').remove();
                template = tooltipTemplate.replace(/@@imageIndex@@/g, $(thisElement).attr('data-index'));
                if ($(thisElement).attr('data-author')) {
                    template = template.replace(/@@credit@@/g, $(thisElement).attr('data-author')).replace(/@@hideCredit@@/g, '');
                } else {
                    template = template.replace(/@@credit@@/g, '').replace(/@@hideCredit@@/g, 'hide-important');
                }
                if ($(thisElement).attr('data-source')) {
                    template = template.replace(/@@source@@/g, $(thisElement).attr('data-source')).replace(/@@hideSource@@/g, '');
                } else {
                    template = template.replace(/@@source@@/g, '').replace(/@@hideSource@@/g, 'hide-important');
                }
                template = template.replace(/@@licence@@/g, $(thisElement).attr('data-license')).replace(/@@refID@@/g, $(thisElement).attr('data-refID'));
                $('body').append(template);
                $('.close-tooltip').off('click.close').on('click.close', function () {
                    $('#mobileTooltip').remove();
                });
            });
        }

        function bindTooltip() {
            $('.figure-index').off('mouseenter.tooltip').on('mouseenter.tooltip', function () {
                if ($(window).width() > 1023) {
                    $('body > .watermark').remove();
                    if ($(this).hasClass('inline-image')) {
                        $('body').append($(this).parent().siblings('.watermark').clone().removeClass('hide'));
                        tooltipPositioning(this);
                    } else {
                        $('body').append($(this).parents('.block-image').find('.watermark').clone().removeClass('hide'));
                        tooltipPositioning(this);
                    }
                }
            });

            $('.figure-index').off('mouseleave.tooltip').on('mouseleave.tooltip', function () {
                if ($(window).width() > 1023) {
                    $('body > .watermark').remove();
                }
            });
            $('.figure-index').off('click.tooltip').on('click.tooltip', function () {
                if ($(window).width() > 767 && $(window).width() < 1024) {
                    $('body > .watermark').remove();
                    if ($(this).hasClass('inline-image')) {
                        $('body').append($(this).parent().siblings('.watermark').clone().removeClass('hide'));
                    } else {
                        $('body').append($(this).parents('.block-image').find('.watermark').clone().removeClass('hide'));
                    }
                    tooltipPositioning(this);
                } else if ($(window).width() < 768) {
                    loadTooltip(this);
                }
            });

            $('body').off('click.tooltip').on('click.tooltip', function (ev) {
                if (!$(ev.target).hasClass('figure-index')) {
                    $('body > .watermark').remove();
                }
            });

            $(window).off('resize.tooltip').on('resize.tooltip', function () {
                if ($(window).width() > 767) {
                    $('#mobileTooltip').remove();
                } else {
                    $('body > .watermark').remove();
                }
            });
        }

        function displayImageAttributes() {
            var content_images = $('#contentwrap img, #artifact_content img').filter(function () {
                    return !($(this).parents('figure.book').length);
                }),
                re_a = /<!-- @@author="(.*?)" -->/,
                re_u = /<!-- @@url="(.*?)" -->/,
                /*re_l = /<!-- @@license="(.*?)" -->/,*/
                counter = 0;
            content_images.each(function () {

                var _a, _u, info, image, figureIndex, parent, html, image_src, realm, img_attributions, existingHtml, refID, img,
                    lihtml = '',
                    author = '',
                    url = '',
                    license = '';
                image = $(this);
                figureIndex = image.parents().next('.figure-index');
                if (!figureIndex.length) {
                    figureIndex = image.parents().next().find('.figure-index');
                }

                if (!image.hasClass('x-ck12-math')) {

                    image_src = image_src = $(image).attr('src');
                    if ($(image).data('flx-url')) {
                        image_src = $(image).data('flx-url');
                    }

                    // if this is user contributed image, default the license
                    // to CC-BY-NC . Ck12 images do not show attributions.
                    if (image_src.indexOf('user%3A') !== -1 || image_src.indexOf('user:') !== -1) {
                        license = 'CC BY-NC 3.0';
                    } else {
                        return;
                    }
                    // realm taken as flx-url substring starting from user: till first '/'
                    realm = image_src.substring(image_src.indexOf('user%3A')).split('/')[0];

                    // src is either empty or ck12editor do not show attributions.
                    if (realm && (realm === 'user%3Ack12editor' || realm === '')) {
                        return;
                    }

                    parent = image.parent();
                    //  inline image have comments in parent span with class 'x-ck12-img-inline'
                    //  figure type of images has comments in parents (p tag) parent div
                    if (!parent.hasClass('x-ck12-img-inline')) {
                        parent = parent.parent();
                    }

                    html = parent.html();
                    _a = re_a.exec(html);
                    _u = re_u.exec(html);
                    // _l = re_l.exec(html);
                    license = 'CC BY-NC 3.0';

                    if (_a) {
                        author = (_a[1] || '').trim();
                    }
                    if (_u) {
                        url = (_u[1] || '').trim();
                    }

                    //add it to the image attributions section
                    if (url || author || license) {

                        img_attributions = $('#img_attributions');
                        existingHtml = $(img_attributions).html();
                        info = '';
                        refID = image.attr('id');
                        counter++;
                        // if this is user contributed image, default the license
                        // to CC BY-A
                        /* if ($(image).attr('src').indexOf('/image/user%3Ack12editor/') == -1) {
		                license = 'CC BY-A';
		            } else {
		                license = 'CC BY-NC-SA';
		            }
		          */
                        if (!refID) {
                            //if the refID is missing,create one and add it to the image tag
                            refID = 'img-ref-' + counter;
                            image.attr('id', refID);
                        }

                        lihtml += '<b>[' + counter + ']</b>';

                        if (refID) {
                            lihtml += '<b><a class="js_scroll" data-href="#' + refID + '">^</a></b>';
                            figureIndex.attr('data-refID', refID);
                        }
                        if (author) {
                            lihtml += ' Credit: ' + author + (url || license ? ';' : '');
                            info += '<div class="img_credit"> <strong>Credit</strong>: ' + author + '</div>';
                            figureIndex.attr('data-author', author);
                        }

                        if (url) {
                            info += '<div class="img_source"> <strong>Source</strong>: ' + url + '</div>';

                            //if it is http://<url> making it anchor with target _blank.
                            if (/^(https?):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(url)) {
                                url = '<a target="_blank" href="' + url + '">' + url + '</a>';
                            }

                            lihtml += ' Source: ' + url + (license ? ';' : '');
                            figureIndex.attr('data-source', url);

                        }

                        if (license) {
                            lihtml += ' License: <a target="_blank" href="http://creativecommons.org/licenses/by-nc/3.0/">' + license + '</a>';
                            info += '<div class="img_license"> <strong>License</strong>: ' + license + '</div>';
                            figureIndex.attr('data-license', license);
                        }
                        figureIndex.attr('data-index', counter);
                        $(img_attributions).html(existingHtml + '<li id="img-attr-' + counter + '">' + lihtml + '</li>');
                        /*if (parent.hasClass('x-ck12-img-inline')) {
                            $(image).after('&nbsp;<a class="js_scroll" data-href="#img-attr-' + counter + '"><sup>[' + counter + ']</sup></a>&nbsp;');
                        } else {
                            $(image).parent().append('<a class="js_scroll" data-href="#img-attr-' + counter + '"><sup>[' + counter + ']</sup></a>');
                        }*/

                        img = $(this);
                        img.after('<div class="watermark hide"> ' + info + ' </div>');
                        // adding qtips for images.
                        /*img.qtip({
		                content: $('.watermark', img.parent()).html(),
		                position: {
		                    my: 'top right',
	                    	at: 'left bottom',
		                    viewport: $(window),
                            adjust: {screen:true, resize:true},
                            container: $('p.img')
		                },
		                style: {
		                    classes: 'ui-tooltip-img-attribute',
		                    tip: true
		                },
		                show: {
		                    delay: 400
		                }
		            });*/
                        if (image.parent().hasClass('x-ck12-img-inline')) {
                            $(image).after('<div><a class="figure-index inline-image js_scroll" data-href="#img-attr-' + counter + '">[Figure' + counter + ']</a></div>');
                        } else {
                            if (img.parent().parent().hasClass('modality_content') || $(this).parent().parent()[0].id === 'artifact_content') {
                                $(image).parent().append('<div><a class="figure-index inline-image js_scroll" data-href="#img-attr-' + counter + '">[Figure' + counter + ']</a></div>');
                            } else {
                                if (img.parent().parent().children(':nth-child(2)').length) {
                                    img.parent().parent().children(':nth-child(2)').append('<a class="figure-index figure-index-with-caption js_scroll" data-href="#img-attr-' + counter + '">[Figure' + counter + ']</a>');
                                    img.parent().parent().addClass('image-with-caption block-image');
                                } else if (img.parent().parent()[0].nodeName === 'DIV') {
                                    img.parent().parent().append('<a class="figure-index js_scroll" data-href="#img-attr-' + counter + '">[Figure' + counter + ']</a>');
                                    img.parent().parent().addClass('block-image');
                                }
                            }
                        }

                        figureIndex = image.parents().next('.figure-index');
                        if (!figureIndex.length) {
                            figureIndex = image.parents().next().find('.figure-index');
                        }
                        if (!figureIndex.length) {
                            figureIndex = image.siblings().find('.figure-index');
                        }

                        if (refID) {
                            figureIndex.attr('data-refID', _.escape(refID));
                        }
                        if (author) {
                            figureIndex.attr('data-author', _.escape(author));
                        }

                        if (url) {
                            figureIndex.attr('data-source', _.escape(url));
                        }

                        if (license) {
                            figureIndex.attr('data-license', _.escape(license));
                        }
                        figureIndex.attr('data-index', counter);
                    }
                }
            });
            bindTooltip();

            //hide the attributions section if there are no image attributions
            if (counter === 0) {
                $('#img_attributions_wrapper').addClass('hide');
            }
        }


        $(document).ready(function () {
            $(document).bind('flxweb.load.ImageAttributes', displayImageAttributes);
            $(document).on('click', '.js_scroll', function (e) {
                if ($(window).width() > 1023 || $(this).parents('ol').length || $(this).parents('.image-attribution-tooltip').length) {
                    var scrollToID = $(e.currentTarget).data('href');
                    //safe guard against ids with dots e.g x-ck12-R2VvLTA2LTAzLTAxLmpwZw..
                    scrollToID = scrollToID.replace(/\./g, '\\.');
                    $(document).scrollTo($(scrollToID), {
                        offset: -150
                    });
                    return false;
                }
            });
        });
    });
