/* vim: set expandtab: */
/* Title: graph-tool
 * accepts an object with the fallowing properties
 * {
 * 		background-color:
 * 		color:
 * 		recentConcept: {
 * 							encodedID:
 * 							name:
 * 							score:
 * 							color:
 * 							handle:
 * 		}
 * 		concepts: [
 * 						encodedID:
 * 						name:
 * 						score:
 * 						handle:
 * 					]
 * }
 *  */
define(['jquery'],
    function ($) {
        'use strict';
        $.fn.graph = function (options) {
            var element = $(this);

            function Graph() {
                var container,
                    vgridWidth,
                    maxheight,
                    itemHeight = 0,
                    items = [];


                function getVgridMarkup() {
                    var graphMarkup =
                        '<div class="vgrid" style="width: @@vgridWidth@@px;float: left;height: 100%;">' +
                        '<div class="leftpad" style="background-color: transparent;float: left;height: 100%;width: 25%;"></div>' +
                        '<div class="plotContainer concept" data-assignmentid="@@assignmentID@@" data-contextName="@@contextName@@" data-contextUrl="@@data-contextUrl@@" data-encodedid="@@encodedID@@" data-branch="@@branch@@" data-mtype=@@mtype@@  data-login="@@Login@@" data-handle="@@Handle@@" data-collection-handle="@@collectionHandle@@" data-concept-collection-absolute-handle="@@conceptCollectionAbsoluteHandle@@" data-concept-collection-handle="@@conceptCollectionHandle@@" data-collection-creator-ID="@@collectionCreatorID@@" style="float: left;height: 100%;width: 50%;position: relative;cursor: pointer;">' +
                        '<div class="plot @@ploted@@" style="background-color:@@plotColor@@;height: 0px;transition:height 3s ease;-webkit-transition: height 3s ease;width: 100%;position: absolute;bottom: 20px;" data-conceptName="@@conceptName@@"  data-conceptScore="@@conceptScore@@" data-status="@@status@@" data-height="@@itemHeight@@"></div>' +
                        '<div class="recent-arrow-container" style="width: 100%;height: 20px;padding-top: 5px;position: absolute;bottom: 0px;">' +
                        '<div class="recent-arrow @@hide@@" style="border-color: transparent transparent #FFFFFF;border-style: solid;border-width: 0 6px 12px;top: 67px;width: 12px;"></div></div></div>' +
                        '<div class="rightpad" style="background-color: transparent;float: left;height: 100%;width: 25%;"></div></div>';

                    return graphMarkup;
                }

                function loadTooltip() {
                    var tooltip =
                        '<div class="bar-graph-tooltip hide" id="tooltipContainer" style="background-color: #56544D;color: #FFFFFF;font-size: 0.9em;line-height: 1.1;padding: 5px;position: absolute;width: 150px; margin-left:14px; z-index: 99;">' +
                        '<div style="background: none repeat scroll 0 0 transparent; border-color: transparent #56544D transparent transparent; border-style: solid; border-width: 9px 14px 9px 0; left: -14px; top:50%; margin-top:-9px; position: absolute;"></div>' +
                        '<div class="tooltip-concept" style="color: #FFFFFF;">@@concept@@</div>' +
                        '<div class="tooltip-score-container" style="color: #FFFFFF;margin-top: 6px;">' +
                        /*'<span class="test" style="color:#B5B1A8; font-weight:bold;">SCORE: </span>' +
							'<span class="tooltip-score">@@score@@</span>' +*/
                        '</div></div>';

                    if (!$('#tooltipContainer').length) {
                        $('body').append(tooltip);
                    }
                }

                function getConceptCompleteMarkup() {

                    return '<span class="icon-checkmark" style="font-size: 0.65em;margin-right: 3px;"></span><span class="sub-header3" style="color:#B5B1A8; font-weight:bold;">DONE</span>';
                }

                function getConceptScoreMarkup() {

                    return '<span class="sub-header3" style="color:#B5B1A8; font-weight:bold;">SCORE: </span><span class="tooltip-score"></span>';
                }

                function showAnimation() {
                    $('.plot').each(function () {
                        $(this).css('height', $(this).attr('data-height'));
                    });
                }

                function getGraphMarkup() {

                    return '<div class="graph" style="height: 100%;width: 278px;"></div>';
                }

                function buildGraph() {
                    var barWidth, barWidthDefault, itemMarkup, i;

                    container.append(getGraphMarkup());
                    vgridWidth = container.find('.graph').width() / items.concepts.length;
                    vgridWidth = Math.floor(vgridWidth);

                    maxheight = container.height() - 20;
                    itemHeight = 0;

                    if (vgridWidth < 2) {
                        vgridWidth = 2;
                        container.addClass('more-concepts');
                    }

                    for (i = 0; i < items.concepts.length; i++) {
                        itemMarkup = getVgridMarkup();
                        itemMarkup = itemMarkup.replace('@@vgridWidth@@', vgridWidth);
                        // Do not overwrite actualScore [Bug #36565]
                        // items.concepts[i].actualScore = items.concepts[i].score;
                        if (items.concepts[i].score > 100) {
                            items.concepts[i].score = 100;
                        }
                        if ((items.concepts[i].score === '' || items.concepts[i].score === null) && items.concepts[i].status === 'completed') {
                            itemHeight = maxheight;
                        } else {
                            itemHeight = items.concepts[i].score * (maxheight / 100);
                        }
                        if (!itemHeight) {
                            itemHeight = 1;
                        }
                        itemMarkup = itemMarkup.replace('@@itemHeight@@', itemHeight);
                        itemMarkup = itemMarkup.replace('@@assignmentID@@', items.assignmentID || '');
                        itemMarkup = itemMarkup.replace('@@Login@@', items.concepts[i].login || '');
                        itemMarkup = itemMarkup.replace('@@Handle@@', items.concepts[i].handle || '');
                        if (items.concepts[i].type === 'asmtquiz' || items.concepts[i].type === 'quiz') {
                            itemMarkup = itemMarkup.replace('@@mtype@@', items.concepts[i].type);
                        }
                        if(items.concepts[i].contextUrl){
                        	if(items.concepts[i].domains){
                                itemMarkup = itemMarkup.replace(/@@contextName@@/g,  (items.concepts[i].domains[0] && items.concepts[i].domains[0].handle) || '');
                        		itemMarkup = itemMarkup.replace('@@encodedID@@', (items.concepts[i].domains[0] && items.concepts[i].domains[0].encodedID) || items.concepts[i].encodedID || '');
                                itemMarkup = itemMarkup.replace('@@branch@@', (items.concepts[i].domains[0]  && items.concepts[i].domains[0].branchInfo.handle) || '');
                        	}
                            itemMarkup = itemMarkup.replace('@@mtype@@', items.concepts[i].type || '');
                            itemMarkup = itemMarkup.replace('@@data-contextUrl@@', items.concepts[i].contextUrl || '');
                        }else{
                        	  itemMarkup = itemMarkup.replace('@@encodedID@@', items.concepts[i].encodedID  || (items.concepts[i].domains &&items.concepts[i].domains[0] && items.concepts[i].domains[0].encodedID) || '');
                              itemMarkup = itemMarkup.replace('@@mtype@@',  'assignFlow');
                              itemMarkup = itemMarkup.replace('@@data-contextUrl@@', '');
                        }
                      
                        itemMarkup = itemMarkup.replace(/@@conceptName@@/g, (
                            items.concepts[i].type === 'domain' ? (items.concepts[i].conceptCollectionTitle ||
                            items.concepts[i].name || '') : (items.concepts[i].name || '')
                        ));
                        if (items.concepts[i].conceptCollectionHandle) {
                            itemMarkup = itemMarkup.replace(/@@collectionHandle@@/g, items.concepts[i].collectionHandle || '');
                            itemMarkup = itemMarkup.replace(/@@conceptCollectionAbsoluteHandle@@/g, items.concepts[i].conceptCollectionAbsoluteHandle || '');
                            itemMarkup = itemMarkup.replace(/@@collectionCreatorID@@/g, items.concepts[i].collectionCreatorID || '');
                            itemMarkup = itemMarkup.replace(/@@conceptCollectionHandle@@/g, items.concepts[i].conceptCollectionHandle || '');
                        } else {
                            itemMarkup = itemMarkup.replace(/@@collectionHandle@@/g, '');
                            itemMarkup = itemMarkup.replace(/@@conceptCollectionAbsoluteHandle@@/g, '');
                            itemMarkup = itemMarkup.replace(/@@collectionCreatorID@@/g, '');
                            itemMarkup = itemMarkup.replace(/@@conceptCollectionHandle@@/g, '');
                        }
                        itemMarkup = itemMarkup.replace(/@@conceptScore@@/g, items.concepts[i].actualScore || '');
                        itemMarkup = itemMarkup.replace(/@@status@@/g, items.concepts[i].status || '');

                        if (itemHeight > 1) {
                            itemMarkup = itemMarkup.replace(/@@ploted@@/g, 'ploted');
                        } else {
                            itemMarkup = itemMarkup.replace(/@@ploted@@/g, '');
                        }

                        if (items.concepts[i].handle === items.recentConcept.handle) {
                            itemMarkup = itemMarkup.replace('@@plotColor@@', items.recentConcept.color || '#FFFFFF');
                            itemMarkup = itemMarkup.replace('@@hide@@', '');
                        } else {
                            itemMarkup = itemMarkup.replace('@@plotColor@@', items.color);
                            itemMarkup = itemMarkup.replace('@@hide@@', 'hide');
                        }

                        $('.graph', container).append(itemMarkup);
                    }

                    barWidth = items.concepts.length * vgridWidth;
                    if (vgridWidth === 2) {
                        $('.graph', container).css({
                            'width': barWidth
                        });
                    } else {
                        barWidthDefault = $('.graph', container).width();
                        $('.graph', container).css({
                            'padding-left': (barWidthDefault - barWidth) / 2,
                            'padding-right': (barWidthDefault - barWidth) / 2
                        });
                    }

                    $(container).find('.recent-arrow').each(function () {
                        var margin = ($(this).parent().width() - $(this).outerWidth()) / 2;
                        $(this).css('margin-left', margin);
                    });
                }

                function bindEvents() {
                    container.find('.plotContainer').off('mouseenter.tooltip').on('mouseenter.tooltip', function () {
                        if (window.innerWidth > 767) {
                            var $tooltipContainer = $('#tooltipContainer'),
                                $plot = $(this).find('.plot');
    
                            $tooltipContainer.find('.tooltip-concept').text($plot.attr('data-conceptname'));
                            if ($plot.attr('data-status') === 'completed' && $plot.attr('data-conceptscore') === '') {
                                $tooltipContainer.find('.tooltip-score-container').html(getConceptCompleteMarkup());
                                $('.tooltip-score-container').removeClass('hide');
                            } else {
                                $tooltipContainer.find('.tooltip-score-container').html(getConceptScoreMarkup());
                                if ($plot.attr('data-status') === 'completed') {
                                    $tooltipContainer.find('.tooltip-score').text($plot.attr('data-conceptscore') + '%');
                                    $('.tooltip-score-container').removeClass('hide');
                                } else {
                                    $('.tooltip-score-container').addClass('hide');
                                }
                            }
                            $tooltipContainer.css({
                                left: $plot.offset().left + $plot.width(),
                                top: $plot.offset().top - ($('#tooltipContainer').innerHeight() / 2)
                            });
                            $tooltipContainer.removeClass('hide');
                        }
                    });
                    container.find('.plotContainer').off('mouseleave.tooltip').on('mouseleave.tooltip', function () {
                        if (window.innerWidth > 767) {
                            $('#tooltipContainer').addClass('hide');
                        }
                    });
                }

                function init(options) {
                    container = $(element);
                    items = (options && options.items) ? options.items : [];

                    loadTooltip();
                    buildGraph();
                    bindEvents();
                    showAnimation();
                }

                init(options);
            }

            new Graph();
        };
    });
