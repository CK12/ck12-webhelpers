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
 * $Id: $Id$ $Revision$ $Author$ $
 */
 var StandardCoorelationsDialog = Backbone.View.extend({
    initialize: function() {
        //exit if the element does not exist
        if ($(this.el).length == 0 ||
            $(this.options.target).length == 0) {
            return;
        }

        var self = this;
        self.dialog = $.flxweb.createDialog($(self.el),
                {
                    'title':$(self.el).data('title'),
                    'height':600,
                    'width':900
                });

		$(this.options.target).each(function() {
            $(this).click(function(){
                $.flxweb.showLoading();
                self.loadCorrelatedArtifactStandardsDialog($(this).data('std_brd_id'), $(this).attr("href"),$(this).attr("title"));
                return false;
           });
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
		$('#js_view_standards_dialog').html(data);
		$('#std_board_name').html(std_board_name);
		this.loadStandardBoardDropDown(std_brd_id);
		$.flxweb.hideLoading();
		this.show();
	},
	
	loadStandardBoardDropDown: function(selectedId) {
		if( window.standardBoards.length > 1 ) {
			var self=this;
			var url = '/ajax/standards/correlated/';
			var $std_drop_down = $('<select>',{id:'std_drop_down'}).appendTo("#std_drop_down_wrapper");

			$std_drop_down.change(function(){
									$.flxweb.showLoading();
									var my_url = url+ $(this).val() +"/" + window.artifactID;
									self.loadCorrelatedArtifactStandardsDialog($("#"+this.id+" option:selected").val(), 
																				my_url, 
																				$("#"+this.id+" option:selected").text());
								});

			for (var i=0; i<window.standardBoards.length; i++) {
				var std_brd = standardBoards[i];
				$option = $('<option>',{text:std_brd.name,value:std_brd.id});
				if( selectedId == std_brd.id ) {
					$option.attr('selected','selected');
				}
				$std_drop_down.append($option);
			}
		}
	}

});

(function($) {
    function domReady(){
    	new StandardCoorelationsDialog({el:$('#js_view_standards_dialog'),target: $('#standardBoardLinks a.std_links')});
    }
    $(document).ready(domReady);
})(jQuery);


