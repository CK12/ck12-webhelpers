/**
 * Copyright 2007-2012 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Amit Kumar Garg
 */
define('flxweb.summary', ['backbone', 'jquery', 'common/views/modal.view', 'common/utils/utils', 'jquery-ui'],
    function (Backbone, $, ModalView, util) {
        'use strict';

        var ArtifactSummaryView = Backbone.View.extend({
            initialize: function(){
                //exit if the element does not exist
                if ($(this.options.target).length === 0) {
                    return;
                }
                var self = this;
                $(self.el).attr('data-dialogueparentclass', 'js_ck12_dialog_common artifact-summary-wrapper');
                this.dialog = $.flxweb.createDialog($(self.el), {
                    'title': $.flxweb.gettext('Summary: ' + self.model.get('title')),
                    'width': '90%'
                });
            },
            
            render: function () {
                var content = this.model.get('summaries').reduce(function(acc, item){
                    return acc + '<li>'+item+'</li>';
                },'<ul>') + '</ul>';
                this.dialog.open();
                $('.artifact-summary-wrapper .ui-dialog-content').html('<div id="summary_wrapper">' + content +
                        '<div class="review-wrapper hide">' + 
                            '<div class="review-vote">' +         
                                '<span class="washelpful_js  show "><span>Was this helpful?</span></span>' +            
                                '<a id="review_up" class="dxtrack-user-action artifactfeedbackaction artifactfeedbackaction_js" title="Helpful" data-dx-desc="summary_review" data-dx-artifactID="'+artifactID+'" data-dx-review="thumbs_up">' +
                                    '<span class="icon-like voting-icon  yes  artifactfeedbackaction"></span>' +
                                    '<span> Yes </span>' +
                                '</a>' +
                                '<a id="review_down" class="dxtrack-user-action artifactfeedbackaction artifactfeedbackaction_js" title="Not helpful"  data-dx-desc="summary_review" data-dx-artifactID="'+artifactID+'" data-dx-review="thumbs_down">' +
                                    '<span class="icon-unlike voting-icon  no   artifactfeedbackaction"></span>' +
                                    '<span> No </span>' +
                                '</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>');
            },
            destroy: function () {
                $(this.el).remove();
            }
        });

        return ArtifactSummaryView;

    }
);
