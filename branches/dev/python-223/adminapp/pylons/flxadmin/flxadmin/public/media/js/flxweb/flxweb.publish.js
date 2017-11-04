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
 * This file originally written by Ravi Gidwani 
 *
 * $Id$
 */

var PublishArtifactView = Backbone.View.extend({
    initialize: function() {
        //exit if the element does not exist
        if ($(this.el).length == 0 ||
            $(this.options.target).length == 0) {
            return;
        }
        var self = this;
        this.url = $(this.el).data('url');
        $(this.el).load(this.url,function() {
            //initialize the dialog
            self.dialog = $.flxweb.createDialog($(self.el),
                {
                    'title':$(self.el).data('title'),
                    'height':370,
                    'width':450,
                    'buttons':{ 
                        'Submit Request': function() {
                            self.trigger('flxweb.publishartifact.sendrequest');
                        },
                        'Cancel':function() {
                            $(this).dialog('close');
                        }
                    }
                });
        });
        //add event listeners
        $(this.options.target).click(function(){
                                        self.show();
                                        return false;
                                    });
        this.bind('flxweb.publishartifact.sendrequest',this.onSendRequest);
    },
    show: function() {
        var self=this;
        this.dialog.open();
        $('#publish_request_reason').val('');
    },
    hide: function() {
        this.dialog.close();
    },
    onSendRequest: function() {
        var self=this;
        var revisionId = $(this.options.target).data('artifactrevisionid');
        var url = '/ajax/publish/artifact/' + revisionId+"/";
        console.log($('#publish_request_form').serialize());
        var comment = $('#publish_request_reason').val();
        if(comment && $.trim(comment)) {
	        $.flxweb.showLoading();
	        $.ajax({
	              type: 'POST',
	              url: url,
	              data: {
	                        'comments': comment,
	                        'website': window.location.hostname
	              },
	              success: function(response) {
	                $.flxweb.hideLoading();
	                if (response.status == 'ok') {
	                    self.hide();
	                    $.flxweb.notify('Your request has been sent');
	                } else {
	                    $.flxweb.showDialog(response.message);
	                }
	              },
	              error: function() {
	                $.flxweb.hideLoading();
	                if (response.error) {
	                    $.flxweb.showDialog(response.error);
	                } else {
	                    $.flxweb.showDialog('There was an error sending your request. Please try again later');
	                }
	              }
	        });
        }
    }
});

(function($) {
    function domReady(){
        window.publishArtifactAppView = new PublishArtifactView({
                                                                el:$('#js_publish_artifact_dialog'), 
                                                                target: $('#js_publish_artifact_link')});
    }

    $(document).ready(domReady);
})(jQuery);

