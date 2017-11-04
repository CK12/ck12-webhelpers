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
 * $Id: flxweb.collection.js 12873 2011-09-28 22:03:15Z ravi $
 *
*/


var CK12WorkspaceItemModel = Backbone.Model.extend({
    url: function() {
        return '/ajax/workspace/' + this.get('artifactType')
                                  + "/" +
                                  + this.get('artifactRevisionID');
    }
});

var WorkspaceModel = Backbone.Model.extend( {
    url: '/ajax/workspace/count/',
    bindFlexbookEditorEvents: function() {
        var self = this;
        $(document).bind(
            'flxweb.editor.flexbook.row_removed',
            function(event,data) {
                if (data.artifactRevisionID != undefined) {
                    self.removeFromBook(data.artifactRevisionID,
                                        data.artifactType);
                }
        });
        $(document).bind(
            'flxweb.editor.flexbook.row_moved',
            function(event,data) {
                if (data.artifactRevisionID != undefined) {
                    self.moveInBook(data.artifactRevisionID,
                                    data.artifactType,
                                    data.artifactID,
                                    data.newIndex);
                }
            }
        );
    },
    addToBook: function(artifactRevisionID,artifactType,artifactID,title,perma,callback) {
        var artifact = new CK12WorkspaceItemModel({'artifactRevisionID':artifactRevisionID});
        artifact.set({
            'artifactType': artifactType,
            'artifactID': artifactID,
            'title': title,
            'perma': perma 
        });
        var self = this;
        artifact.save(null,{
            success: function(model,resp) {
                self.trigger('ck12_workspace_item_added', model);
                if (callback != undefined) {
                    callback(model);
                }
            }
        });
        return false;
    },
    removeFromBook: function(artifactRevisionID,artifactType,callback) {
        var artifact = new CK12WorkspaceItemModel({'artifactRevisionID':artifactRevisionID});
        artifact.set({
            'id' : 'dummy',
            'artifactType': artifactType
        });
        var self = this;
        artifact.destroy({
            success: function(model,resp) {
                self.trigger('ck12_workspace_item_removed', model);
                if (callback != undefined) {
                    callback(model);
                }
            }
        });
        return false;
    },
    moveInBook: function(artifactRevisionID,artifactType,artifactID,newIndex,callback) {
        var artifact = new CK12WorkspaceItemModel({'artifactRevisionID':artifactRevisionID});
        artifact.set({
            'artifactType': artifactType,
            'artifactID': artifactID,
            'newIndex': newIndex
        });
        var self = this;
        artifact.save(null,{
            success: function(model,resp) {
                self.trigger('ck12_workspace_item_moved', model);
                if (callback != undefined) {
                    callback(model);
                }
            }
        });
        return false;
    },
});


var AddToWorkspaceView = Backbone.View.extend( {
    initialize: function() {
        this.render();
    },
    events: {
        "click"     : "handleClick",
    },
    handleClick: function() {
        if ( $(this.el).hasClass('js_remove_link') ) {
            this.remove();
        } else {
            this.add();
        } 
    },
    add : function() {
        var self = this;
        $.flxweb.showLoading(); 
        this.model.addToBook($(this.el).data('artifactrevisionid'),
                $(this.el).data('artifacttype'),
                $(this.el).data('artifactid'),
                $(this.el).data('title'),
                $(this.el).data('perma'),
                function(artifact) {
                    $(self.el).addClass('js_remove_link');
                    self.render();
                    $.flxweb.hideLoading(); 
                });
        return false;
    },
    remove : function() {
        var self = this;
        $.flxweb.showLoading(); 
        this.model.removeFromBook($(this.el).data('artifactrevisionid'),
                $(this.el).data('artifacttype'),
                function(artifact) {
                    $(self.el).removeClass('js_remove_link');
                    self.render();
                    $.flxweb.hideLoading(); 
                });
        return false;
    },
    render: function() {
        if ($(this.el).hasClass('js_remove_link')) {
            $(this.el).html($(this.el).data('removelabel'));
        } else {
            $(this.el).html($(this.el).data('addlabel'));
        }
    }
});


var WorkspaceCounterView = Backbone.View.extend( {
    el: $('#workspace'),
    initialize: function() {
        var self = this;
        this.model.bind('ck12_workspace_item_added', function(item) {
            self.model.fetch({
                success: function(model,response) {
                    self.render();
                    $(self.el).parent().effect("pulsate");
                }
            });
        });
        this.model.bind('ck12_workspace_item_removed', function(item) {
            self.model.fetch({
                success: function(model,response) {
                    self.render(); 
                    $(self.el).parent().effect("pulsate");
                }
            });
        });
        this.model.fetch({
            success: function(model,response) {
                self.render(); 
            }
        });
    },
    render: function() {
        $(this.el).html("( "+ this.model.get('itemsInBook')+" )");
    }
});

//Global objects
var workspaceModel = new WorkspaceModel();
var workspaceCounterView = new WorkspaceCounterView({model:workspaceModel});

//Jquery for handling the page actions
(function($) {
    function initLinkHandlers() {
        $('.js_add_to_workspace_link').each(function(index) { 
            new AddToWorkspaceView({el:$(this),model:workspaceModel});        
        });
    }

    function documentReady() {
        initLinkHandlers();
    }

    $(document).ready(documentReady);
})(jQuery);


