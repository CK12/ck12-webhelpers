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
 * $Id$
 */
define('flxweb.standards.boards',['backbone','jquery','jquery-ui','flxweb.global'],
function(Backbone,$) {
var StandardCorrelationsDialog = Backbone.View.extend({
    initialize: function() {
        //exit if the element does not exist
        if ($(this.el).length == 0) {
            return;
        }

        var self = this;
        self.dialog = $.flxweb.createDialog($(self.el),
                {
                    'title':$(self.el).data('title'),
                    'height':600,
                    'width':'70%',
                    'dialogClass': 'js_ck12_dialog_common standards_dialog'
                });
        $(this.options.target).live('click',function() {
            $.flxweb.showLoading();
            self.loadCorrelatedArtifactStandardsDialog($(this).data('std_brd_id'), $(this).data("std_corr_href"),$(this).attr("title"));
            return false;
        });
        
    },
    show: function() {
        var self=this;
        this.dialog.open();
    },
    hide: function() {
        this.dialog.close();
    },
    
    loadCorrelatedArtifactStandardsDialog: function(std_brd_id, link, title) {
        var self=this;
        $.ajax({
            url: link,
            success: function(data) {
                self.onStandardsLoadSuccess(std_brd_id, data, title);
                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error(textStatus);
            },
            dataType:'html'
        });
        
    },

    onStandardsLoadSuccess: function (std_brd_id, data, std_board_name) {
        $(".std_drop_down_wrapper").remove();
        $('#js_view_standards_dialog').html(data);
        $('#std_board_name').html(std_board_name);
        this.loadStandardBoardDropDown(std_brd_id);
        $.flxweb.hideLoading();
        this.show();
    },
    
    loadStandardBoardDropDown: function(selectedId) {
        if( window.standardBoards.length > 1 ) {
            var self=this;
            var std_drop_down_wrapper = $('<div>',{'class': 'std_drop_down_wrapper'});
            std_drop_down_wrapper.html($(".js_std_select_container .std_drop_down_wrapper_dummy").html());
            var $std_drop_down = $('<select>',{id:'std_drop_down'}).appendTo(std_drop_down_wrapper);
            var js_std_select_container = $(".js_std_select_container");

            for (var i=0; i<window.standardBoards.length; i++) {
                var std_brd = standardBoards[i];
                $option = $('<option>',{text:std_brd.name,value:std_brd.id});
                if( selectedId == std_brd.id ) {
                    $option.attr('selected','selected');
                }
                $std_drop_down.append($option);
            }
            $('#js_view_standards_dialog').before(std_drop_down_wrapper);
            
        } else {
            $(".std_drop_down_wrapper").hide();
        }
    },
    
    onDropDownChange: function(){
        var url = '/ajax/standards/correlated/';
        $.flxweb.showLoading();
        var my_url = url+ $(this).val() +"/" + window.artifactID;
        window.standardCorrelationsDialog.loadCorrelatedArtifactStandardsDialog($("#"+this.id+" option:selected").val(), 
                                                    my_url, 
                                                    $("#"+this.id+" option:selected").text());
    }

});

    function domReady(){
        window.standardCorrelationsDialog = new StandardCorrelationsDialog({el:$('#js_view_standards_dialog'),target: $('#standardBoardLinks a.std_links')});
        $('.std_drop_down_wrapper #std_drop_down').live('change',window.standardCorrelationsDialog.onDropDownChange);
    }
    $(document).ready(domReady);
});


