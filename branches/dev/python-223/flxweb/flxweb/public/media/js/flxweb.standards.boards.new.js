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
 * This file originally written by Javed Attar
 *
 * $Id: flxweb.standards.boards.js 21082 2012-08-13 22:10:54Z ravi $
 */
define('flxweb.standards.boards.new', ['backbone', 'jquery', 'jquery-ui', 'flxweb.global'],
    function (Backbone, $) {
        'use strict';
        window.StandardCorrelationsDialog_1 = Backbone.View.extend({
            initialize: function () {
                //exit if the element does not exist
                if ($(this.el).length === 0 ||
                    $(this.options.target).length === 0) {
                    return;
                }

                var self = this;
                self.dialog = $.flxweb.createDialog($(self.el), {
                    'title': $(self.el).data('title'),
                    'height': 600,
                    'width': '70%',
                    'dialogClass': 'js_ck12_dialog_common standards_dialog'
                });
            $(this.options.target).bind('click',function(){
                $.flxweb.showLoading();
                self.loadCorrelatedArtifactStandardsDialog($(this).data('std_brd_id'), $(this).data("std_corr_href"),$(this).attr("title"));
                return false;
            });
            },
            show: function () {
                this.dialog.open();
            },
            hide: function () {
                this.dialog.close();
            },

            loadCorrelatedArtifactStandardsDialog: function (std_brd_id, link, title) {
                var self = this;
                $.ajax({
                    url: link,
                    success: function (data) {
                        self.onStandardsLoadSuccess(std_brd_id, data, title);
                    },
                    error: function (jqXHR, textStatus) {
                        console.error(textStatus);
                    },
                    dataType: 'html'
                });

            },

            onStandardsLoadSuccess: function (std_brd_id, data, std_board_name) {
                $('#js_view_standards_dialog').html(data);
                var std_drop_down_wrapper, dropDownHTML;
                dropDownHTML = $('#js_view_standards_dialog .std_drop_down_wrapper').html();
                $('.std_drop_down_wrapper').remove();
                std_drop_down_wrapper = $('<div>', {
                    'class': 'std_drop_down_wrapper'
                }).html(dropDownHTML);
                $('#js_view_standards_dialog').before(std_drop_down_wrapper);
                $('.std_drop_down_wrapper #std_drop_down').bind('change', this.onDropDownChange);
                $('#std_board_name').html(std_board_name);
                $('#std_drop_down').val(std_brd_id);

                $.flxweb.hideLoading();
                this.show();
            },

            onDropDownChange: function () {
                $.flxweb.showLoading();
                var my_url = '/ajax/boards/standards/correlated/' + $(this).val() + '/' + $(this).data('artifactid');
                window.standardCorrelationsDialog.loadCorrelatedArtifactStandardsDialog($('#' + this.id + ' option:selected').val(),
                    my_url,
                    $('#' + this.id + ' option:selected').text());
            }

        });

    });