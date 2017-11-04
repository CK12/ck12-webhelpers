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
 * $Id: flx.collection.js 12873 2011-09-28 22:03:15Z ravi $
 *
 * EVENTS:
 * ck12_shelf_added 
 * ck12_shelf_removed
 * ck12_shelf_loaded
 * 
 * TODO:
 * RG: make the events available throught flx jquery namespace
*/

var CK12ShelfItem = Backbone.Model.extend({
    urlRoot: '/ajax/shelf/'
});


var CK12Shelf = Backbone.Collection.extend({
    model: CK12ShelfItem,
    url : '/ajax/shelf/',
    initialize: function() {

        this.bind('add',function(item) {
            this.trigger('ck12_shelf_added', item);
        });
        
        this.bind('remove',function(item) {
            this.trigger('ck12_shelf_removed', item);
        });
        
    },
    parse: function(response) {
        return response.results;
    }
});

var AddToShelfView = Backbone.View.extend( {
    initialize: function() {
        var id = $(this.el).data('id');
        this.model = new CK12ShelfItem({'id':id});
        this.model.set({
            'artifactType': $(this.el).data('artifacttype'),
            'revision_id':$(this.el).data('revision_id'),
            'title': $(this.el).data('title'),
            'perma':  $(this.el).data('perma'),
            'selected': false
        });
        var self = this;
        this.collection.bind('reset',function() { self.render(); });
        this.render();
    },
    events: {
        "click .js_add_link"     : "add",
        "click .js_remove_link"  : "remove"
    },
    add : function() {
        var self = this;
        this.model.save(this.model, {
            success:function(model,resp) {
                self.collection.add(self.model);
                self.render();
            }
        });
        return false;
    },
    remove : function() {
        var self = this;
        this.model.destroy( {
            success:function(model,resp) {
                self.collection.remove(self.model);
                self.render();
            }
        });
        return false;
    },
    render: function() {
        var inCollection = this.collection.get(this.model.get('id'));
        if (inCollection!=null) {
            this.$(".js_remove_link").removeClass("hide");
            this.$(".js_add_link").addClass("hide");
        }else {
            this.$(".js_add_link").removeClass("hide");
            this.$(".js_remove_link").addClass("hide");
        }
    }
});

var ShelfView = Backbone.View.extend( {
    el: $('#shelf'),
    initialize: function() {
        var self = this;
        this.collection.bind("add",function() { 
            self.render(); 
        });
        this.collection.bind("remove",function() { 
            self.render(); 
        });
        this.collection.bind("reset",function() { 
            self.render(); 
        });
        this.collection.bind("destroy",function() { 
            self.render(); 
        });
        this.collection.fetch({
            success: function(collection,response) {
                self.trigger('ck12_shelf_loaded', collection);
            }
        });
    },
    render: function() {
        $(this.el).html(this.collection.length);
    },
});

var ShelfRow = Backbone.View.extend( {
    initialize: function() {
        this.id = $(this.el).data('id');
        this.model = this.collection.get(this.id);
        var self=this;
        this.collection.bind("reset",function() { 
            self.render(); 
        });
    },
    events: {
        "click .js_shelf_remove_action"  : "remove",
        "click .js_shelf_select_action" : "select"
    },
    remove : function() {
        var self = this;
        this.model = this.collection.get(this.id);
        this.model.destroy( {
            success:function(model,resp) {
                self.collection.remove(self.model);
                self.render();
            }
        });
        return false;
    },
    select : function() {
        this.model = this.collection.get(this.id);
        var selected = this.$('.js_shelf_select_action').attr('checked');
        this.model.set({'selected':selected});
        this.model.save();
    },
    render: function() {
        var inCollection = this.collection.get(this.id);
        this.model = this.collection.get(this.id);
        if (inCollection==null) {
            $(this.el).remove();
        } else {
            var selected = this.model.get('selected');
            this.$('.js_shelf_select_action').attr('checked',selected);
        }
    }
});

//Global objects
var shelf = new CK12Shelf();
var shelfView = new ShelfView({collection:shelf});


//Jquery for handling the page actions
(function($) {

    function save_shelf_as_new_flexbook_click() {
        //RG: TODO, need a common dialog routine
         $('#js_shelf_new_flexbook_error').addClass('hide');
         $('#js_shelf_new_flexbook_dialog').dialog({
            title:'Save as a new FlexBook',
            autoOpen: true,
            height: 300,
            width: 450,
            modal: true,
            buttons: [
                {
                    id:"js_shelf_new_flexbook_save_button",
                    text:"Save",
                    click: function() {
                        var new_flexbook_form = $('#js_shelf_new_flexbook_form');
                        $('#js_shelf_new_flexbook_message').removeClass('hide');
                        $('#js_shelf_new_flexbook_error').addClass('hide');
                        $('#js_shelf_new_flexbook_save_button').attr('disabled',true);
                        $.post($(new_flexbook_form).attr('action'),
                               $(new_flexbook_form).serialize(),
                               function(data, textStatus, jqXHR) {
                                   if (data.success) {
                                       document.location.href=data.redirect_url;
                                   } else {
                                       $('#js_shelf_new_flexbook_message').addClass('hide');
                                       $('#js_shelf_new_flexbook_save_button').attr('disabled',false);
                                       $('#js_shelf_new_flexbook_error').html(data.error);
                                       $('#js_shelf_new_flexbook_error').removeClass('hide');
                                   } 
                               },
                               'json' 
                        );
                    }
                },
                {
                    id:"js_shelf_new_flexbook_cancel_button",
                    text:"Cancel",
                    click: function() {
                        $( this ).dialog( "close" );
                    }
                }
            ],
            close: function() {
                $('#js_shelf_new_flexbook_dialog').dialog("destroy");
            }
        });

        return false;
    } 

    function init_link_handlers() {
        $('.js_add_to_shelf_widget').each(function(index) { 
            new AddToShelfView({el:$(this),collection:shelf});        
        });

        $('.js_shelf_row').each(function(index) { 
            new ShelfRow({el:$(this),collection:shelf});        
        });

        $('#save_shelf_as_new_flexbook').click(save_shelf_as_new_flexbook_click);
    }

    function documentReady() {
        init_link_handlers();                
    }

    $(document).ready(documentReady);
})(jQuery);
