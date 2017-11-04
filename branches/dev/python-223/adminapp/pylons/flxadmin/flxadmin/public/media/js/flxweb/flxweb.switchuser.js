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

var SwitchuserView = Backbone.View.extend({
    events: {
        'submit #sw_form' : 'onSwitch',
    },
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
                    'height':330,
                    'width':600,
                    'buttons':{ 
                        'Switch User': function() {
                            self.trigger('flxweb.switchuser.switch');
                        },
                        'Cancel':function() {
                            $(this).dialog('close');
                        }
                    }
                });

            //add autocomplete support
            $( "#sw_search_text" ).autocomplete({
                source: function(request,response) {
                    $.getJSON($(self.el).data('listurl'),
                                {term:request.term }, 
                                function(data) {
                                    response(data.users); 
                                });
                },
                minLength: 3,
                delay: 500,
                focus: function( event, ui ) {
                    $( "#sw_search_text" ).val( ui.item.firstName + " " +
                                                ui.item.lastName + " (" +
                                                ui.item.email + ")"
                                              );
                    return false;
                },
                select: function( event, ui ) {
                    $( "#sw_search_text" ).val( ui.item.firstName + " " +
                                                ui.item.lastName + " (" +
                                                ui.item.email + ")"
                                              );
                    $("#sw_selected_id").val(ui.item.id);
                    return false;
                }
            }).data( "autocomplete" )._renderItem = function( ul, item ) {
                return $( "<li></li>" )
                    .data( "item.autocomplete", item )
                    .append( "<a>" + item.firstName +" " + item.lastName + "<br>" 
                    + "<span style='font-size:10px'><b>Email:</b> " + item.email + " | "
                    + "<b>Username:</b> " + item.login  +"</span>" + "</a>" )
                    .appendTo( ul );
            };

        });
        //add event listeners
        $(this.options.target).click(function(){
                                        self.show();
                                        return false;
                                    });
        this.bind('flxweb.switchuser.switch',this.onSwitch);
    },
    show: function() {
        var self=this;
        this.dialog.open();
    },
    hide: function() {
        this.dialog.close();
    },
    onSwitch: function() {
        var self=this;
        var selectedUser = $("#sw_selected_id").val();
        if (!selectedUser || $.trim(selectedUser) == '') {
            $.flxweb.showDialog('Please select a user');
            return false;
        }
        window.location = $('#sw_auth_url').val() + selectedUser +
                          "?returnTo=" + $('#sw_returnto').val();
        return false;
    }
});

(function($) {
    function domReady(){
        window.switchuserAppView = new SwitchuserView({el:$('#js_switchuser_dialog'), target: $('#js_switchuser_link')});
    }

    $(document).ready(domReady);
})(jQuery);

