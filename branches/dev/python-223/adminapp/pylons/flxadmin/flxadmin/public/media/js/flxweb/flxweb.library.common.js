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

var LABEL_SELECTED = 1;
var LABEL_UNSELECTED = 0;
var LABEL_PARTIALLY_SELECTED = 2;

var LibraryLabel = Backbone.Model.extend({
    urlRoot: '/ajax/mylibrary/label/'
});

var LibraryLabelsList = Backbone.Collection.extend({
    model: LibraryLabel
});

var LibraryItem = Backbone.Model.extend( {
    urlRoot: '/ajax/mylibrary/',
    url: function(){
        var url = this.urlRoot;
        var action = this.get('action');
        if (action != undefined) { 
            url += action + '/';
        }
        if (this.get('artifactRevisionID')){
            url += 'content/'+this.get('artifactRevisionID');
        }
        if (this.get('resourceRevisionID')){
            url += 'files/'+this.get('resourceRevisionID');
        }
        return url;
    },
    initialize: function() {
        // copy the artifactRevisionID as the 'id' 
        // of this model instance
        if ( this.get('artifactRevisionID') ){
            this.set('id',this.get('artifactRevisionID'));
            this.set('object_type','artifact');
        }
        if ( this.get('resourceRevisionID') ){
            this.set('id',this.get('resourceRevisionID'));
            this.set('object_type','resource');
        }
    }
});

var LibraryItemsList = Backbone.Collection.extend({
    model: LibraryItem
});

var LibraryItemView = Backbone.View.extend( {
    initialize: function() {
        $(this.el).find(':checkbox').prop("checked",this.model.get('selected'));
        this.model.on('labelApplied',this.onLabelApplied,this);
        this.model.on('destroy',this.onDestroy,this);
    },
    events: {
        "change :checkbox" : "checked",
        "click .js_archive" : "onTrashClick",
        "click .js_remove_starred": "onRemoveClick"
    },
    checked: function(event) {
        var isSelected = $(event.target).is(':checked');
        if (isSelected) {
            $(this.el).addClass('selected');
        } else {
            $(this.el).removeClass('selected');
        }
        this.model.set({'selected':isSelected});
    },
    onLabelApplied: function(model) {
        var systemLabels = model.get('systemLabels');
        var myLabels = model.get('myLabels');
        var appLabels = ['All items','Owned by me'];
        //if the newly applied labels do not include
        //the label we are currently displaying,
        //then remove the item from the listing (RHS)
        //currently being displayed
        var regex = new RegExp('^(' + systemLabels.join('|')
                                    + '|'
                                    + myLabels.join('|')
                                    + '|'
                                    + appLabels.join('|')
                                    + ')$');
        if (!regex.test(selected_label) && selected_label != 'All') {
            this.remove();
            return;
        }
        var template = _.template($('#tmpl_library_row_label').html());
        //remove existing labels
        this.$('.js_artifact_labels').html('');
        var allLabels = [];
        //then loop through labels and display them
        for (var i=0;i<systemLabels.length;i++) {
            var label = systemLabels[i];
            var el = template({label:label});
            this.$('.js_artifact_labels').append(el);
            allLabels.push(label);
        }
        for (var i=0;i<myLabels.length;i++) {
            var label = myLabels[i];
            var el = template({label:label});
            this.$('.js_artifact_labels').append(el);
            allLabels.push(label);
        }
        // assign the new labels to the model object
        this.model.set({'labels':allLabels},{silent:true});
        return this;
    },
    onTrashClick: function() {
        var self = this;
        var title = '';
        if (self.model.get('object_type') == 'artifact'){
            title = self.model.get('title');
        }
        if (self.model.get('object_type') == 'resource'){
            title = self.model.get('name');
        }
        
/*
        $.flxweb.showDialog('Are you sure you want to trash "'+ title +'" ?',
                           {'title' : 'Trash',
                            'buttons' : {
                                'OK' : function() {
                                    //set action=archive,to archive/trash item from library
                                    self.model.set({'action':'archive'});
                                    self.model.destroy(null);
                                    $.flxweb.notify('"'+ title +'" moved to Trash');
                                    $(this).dialog('close');
                                },
                                'Cancel': function() {
                                    $(this).dialog('close');
                                }
                            }
                          });
*/
        //mike trying to figure out how to remove items without a dialogue
        self.model.set({'action':'archive'});
        self.model.destroy(null);
        $.flxweb.notify('"'+ title +'" moved to Trash');
        return false;
    },
    onRemoveClick: function() {
        var self = this;
        var title = '';
        if (self.model.get('object_type') == 'artifact'){
            title = self.model.get('title');
        }
        if (self.model.get('object_type') == 'resource'){
            title = self.model.get('name');
        }
        $.flxweb.showDialog('Are you sure you want to remove "'+ title +'" from your starred items ?',
                           {'title' : 'Remove from Starred',
                            'buttons' : {
                                'OK' : function() {
                                    //set action=remove,to remove starred items 
                                    self.model.set({'action':'remove'});
                                    self.model.destroy(null);
                                    $.flxweb.notify('"'+ title +'" removed from starred');
                                    $(this).dialog('close');
                                },
                                'Cancel': function() {
                                    $(this).dialog('close');
                                }
                            }
                          });
        return false;
    },
    onDestroy: function() {
        this.remove();
    },
    remove: function() {
        $(this.el).remove();
        //check if there are other items, else show empty message
        if( $('#mylib_items > ul').length == 0) {
            $('#mylib_empty_message').removeClass('hide');
        } else{
            $('#mylib_empty_message').addClass('hide');
        }
    }
});

var LibraryLabelView = Backbone.View.extend( {
    tagName: 'div',
    events: {
        "click .label_delete" : "onLabelDelete"
    },
    initialize: function() {
        this.model.on('destroy',this.onDestroy,this);
    },
    render: function() {
        var template = _.template($('#tmpl_library_label').html());
        var element = template(this.model.toJSON());
        this.setElement(element,true);
        return this;
    },
    onLabelDelete: function() {
        var self = this;
        var label = self.model.get('label');
        $.flxweb.showDialog('Are you sure you want to delete label "'+ label +'" ?',
                           {'title' : 'Delete label',
                            'buttons' : {
                                'OK' : function() {
                                    self.model.destroy(null);
                                    $(this).dialog('close');
                                    $.flxweb.notify('Label "'+ label +'" deleted');
                                },
                                'Cancel': function() {
                                    $(this).dialog('close');
                                }
                            }
                          });
        return false;
       
    },
    onDestroy: function() {
        $(this.el).remove();
    }
});

var LabelsChooserLabelView = Backbone.View.extend( {
    initialize: function() {
        this.model.bind('change:selected',this.updateCheckbox,this);
        this.updateCheckbox();
    },
    events: {
        "change :checkbox" : "checked"
    },
    checked: function(event) {
        this.model.set({'selected':$(event.target).is(':checked')});
    },
    updateCheckbox: function() {
       this.$(':checkbox').prop("checked",this.model.get('selected'));
    },
    render: function() {
        var template = _.template($('#tmpl_chooser_new_label').html());
        var element = template(this.model.toJSON());
        this.setElement(element,true);
        this.updateCheckbox();
        return this;
    }
});


var LabelsChooser = Backbone.View.extend( {
    events: {
        'click #applyLabels':'applyLabels',
        'click #createLabel':'createLabel'
    },
    initialize: function() {
        //exit if the element does not exist
        if ($(this.el).length == 0 || 
            $(this.options.parent).length == 0) {
            return;
        }
       
        var self = this;
        // initialize only 1 instance of this View
        if($('#labelChooser').length == 0) {
            $(this.el).attr('id','labelChooser');
            if (!this.collection) {
                this.collection = new LibraryLabelsList();
            }
            //close when clicked anywhere else on page 
            $('body').click(function() {
                self.close();
            });
            //but dont close when clicked on the labelChooser
            $(this.el).click(function(event) {
                event.stopPropagation();
            });
            
            //list of collection changes
            this.collection.bind('add',this.onLabelAdded,this);
            var url = $('#js_add_to_library').data('dialogurl');
            $.get(url,function(data) {
                $(self.el).append(data);
                $(self.options.parent).append($(self.el));
                //reset the collection only if there is no previous data
                if (self.collection.length == 0) {
                    self.collection.reset(labels_json);
                }
                $('.js_label',$('#lblchooser')).each(function(index,ele) {
                    var labelModel = self.collection.at(index);
                    //reset the previous "selected" attribute of all models
                    labelModel.set({'selected':false});
                    var lblView = new LabelsChooserLabelView({el:ele,model:labelModel});
                });
             });
            
        } else {
            this.el = $('#labelChooser');
            this.destroy();
        }
        //closed initially
        this.close();
    },
    createLabel: function() {
        var label = $.trim($('#newLabel').val());
        if (!label || label == '') {
            $.flxweb.showDialog('Label cannot be empty');
            return false;
        }
        
        if (label.toLowerCase() == 'archived') {
            $.flxweb.showDialog('Sorry, you can\'t create a label named "archived". '); 
            return false;
        }

        if (label.toLowerCase() == 'trash') {
            $.flxweb.showDialog('Sorry, you can\'t create a label named "trash". ' +
                                'If you need to trash items, please use the \'Trash\' link.');
            return false;
        }



        var exists = this.collection.find(function(item){ return item.get('label')===label;});
        if (exists != undefined) {
            $.flxweb.showDialog('This label already exists');
            return false;
        }
        var newLbl = new LibraryLabel({'label':label,
                                       'systemLabel':0,
                                       'action':'create',
                                       'selected':true});
        
        newLbl.save();
        this.collection.add(newLbl);
        $('#newLabel').val('');
    },
    onLabelAdded: function(newLabelModel) {
        var newLabelView = new LabelsChooserLabelView({model:newLabelModel});
        $('#lblchooser_labels').append(newLabelView.render().el);
        $(newLabelView.el).find(':checkbox').focus();
        $.flxweb.notify('New label "'+ newLabelModel.get('label') +'" created');
    },
    applyLabels: function() {
        $.flxweb.showLoading('');
        var newSystemLabels = new LibraryLabelsList(this.collection.filter(function(label) {
            return label.get('selected') === true && label.get('systemLabel')== 1;
        }));

        var newMyLabels = new LibraryLabelsList(this.collection.filter(function(label) {
            return label.get('selected') === true && label.get('systemLabel')== 0;
        }));

        var systemLabels = newSystemLabels.pluck('label');
        var myLabels = newMyLabels.pluck('label');
       
        var savedCount = 0;
        var tobeSavedCount = this.options.selectedArtifacts.length;  
        for (var i=0;i<this.options.selectedArtifacts.length;i++) {
            var item = this.options.selectedArtifacts[i];
            item.set({'systemLabels':systemLabels});
            item.set({'myLabels':myLabels});
            item.save(null,{ success: function(model, response){
                savedCount++;
                //trigger backbone event
                model.trigger('labelApplied',model);
                //trigger jquery event for non backbone listeners
                $.flxweb.events.triggerEvent(
                    $(document),
                    'flxweb.library.label.applied',
                    {
                        'model' : model,
                        'artifactID' : model.get('artifactID'),
                        'artifactRevisionID':model.get('artifactRevisionID'),
                        'resourceRevisionID':model.get('resourceRevisionID'),
                        'systemLabels':systemLabels,
                        'myLabels': myLabels
                    });
                if (savedCount >= tobeSavedCount) {
                    $.flxweb.hideLoading();
                    $.flxweb.notify('Label changes have been applied');
                } 
            }});
        }

        this.close();  
    },
    addToLibrary: function(items,systemLabels,myLabels) {
        $.flxweb.showLoading('');
        var savedCount = 0;
        var tobeSavedCount = items.length;  
        for (var i=0;i<items.length;i++) {
            var item = items[i];
            item.set({'systemLabels':systemLabels});
            item.set({'myLabels':myLabels});
            item.save(null,{ success: function(model, response){
                savedCount++;
                //trigger backbone event
                model.trigger('labelApplied',model);
                //trigger jquery event for non backbone listeners
                $.flxweb.events.triggerEvent(
                    $(document),
                    'flxweb.library.item.added',
                    {
                        'model' : model,
                        'artifactID' : model.get('artifactID'),
                        'artifactRevisionID':model.get('artifactRevisionID'),
                        'resourceRevisionID':model.get('resourceRevisionID'),
                        'systemLabels':systemLabels,
                        'myLabels': myLabels
                    });
                if (savedCount >= tobeSavedCount) {
                    $.flxweb.hideLoading();
                    $.flxweb.notify('Added to your starred items');
                } 
            }});
        }
    },
    removeFromLibrary: function(items) {
        $.flxweb.showLoading('');
        var removeCount = 0;
        var toBeRemovedCount = items.length;  
        for (var i=0;i<items.length;i++) {
            var item = items[i];
            //set action=remove,to remove item from library
            item.set({'action':'remove'});
            item.destroy({ 
                success: function(model, response){
                    removeCount++;
                    //trigger jquery event for non backbone listeners
                    $.flxweb.events.triggerEvent(
                        $(document),
                        'flxweb.library.item.removed',
                        {
                            'model' : model,
                            'artifactID' : model.get('artifactID'),
                            'artifactRevisionID':model.get('artifactRevisionID'),
                            'resourceRevisionID':model.get('resourceRevisionID')
                    });
                    if (removeCount >= toBeRemovedCount) {
                        $.flxweb.hideLoading();
                        $.flxweb.notify('Removed from your starred items');
                    } 
                },
                error: function(model,response) {
                    $.flxweb.showDialog('Something went wrong. Please try again');
                }
            });
        }
    },
    open: function(selectedArtifacts,selectedLabels) {
        if (selectedArtifacts.length == 0){
            $.flxweb.showDialog('Please select items for changing labels');
            this.close();
            return false; 
        }
        this.options.selectedArtifacts = selectedArtifacts;
        for (var i=0;i < this.collection.length;i++) {
            var labelModel = this.collection.at(i);
            // check if the label is to be shown as selected
            if (labelModel.get('label') in selectedLabels) {
                labelModel.set({'selected':true});
            } else {
                labelModel.set({'selected':false});
            }
        }
        $(this.el).show();
    },
    close: function() {
        $(this.el).hide();
    },
    destroy: function() {
        //clean up
        this.remove();
        this.unbind();
    }
});

var LibraryView = Backbone.View.extend({
    events: {
        'click #changeLabels': 'onChangeLabelsClick',
        'change #selectall' : 'onSelectAll',
        'click #restore' : 'onRestoreItemsClick' 
    },
    initialize: function() {
        //exit if the element does not exist
        if ($(this.el).length == 0) {
            return;
        }
        //initialize artifacts,labels models & collections
        this.items = new LibraryItemsList();
        this.items.reset(items_json);
        this.labels = new LibraryLabelsList();
        this.labels.reset(labels_json);
        //initialize artifact views i.e rows
        for (var i=0;i<this.items.length;i++) {
            var itemModel = this.items.at(i);
            var row_id = itemModel.get('artifactRevisionID');
            if (!row_id){
                row_id = itemModel.get('resourceRevisionID');
            }
            var elId = '#item_'+row_id;
            var itemView = new LibraryItemView({el:$(elId),model:itemModel});
        }
        //initialize labels views i.e labels on LHS 
        for (var i=0;i<this.labels.length;i++) {
            var labelModel = this.labels.at(i);
            var elSelector = '[data-label="' + labelModel.get('label')+'"]'; 
            var labelView = new LibraryLabelView({el:$(elSelector),model:labelModel});
        }
        //initialize labelsChooser
        this.labelsChooser = new LabelsChooser({ collection: this.labels,
                                            parent:$('#changeLabels').parent()});
        //add model/collection listeners
        this.labels.bind('add',this.onLabelAdded,this);
    },
    onRestoreItemsClick: function() {
        var selectedArtifacts = this.items.filter(function(item) {
            return item.get('selected') === true;
        });
        if (selectedArtifacts.length == 0){
            $.flxweb.showDialog('Please select items to restore');
            return false; 
        }
        $.flxweb.showLoading('');
        //for restore the labels will be empty
        var systemLabels = [];
        var myLabels = [];
       
        var savedCount = 0;
        var tobeSavedCount = selectedArtifacts.length;  
        for (var i=0;i<selectedArtifacts.length;i++) {
            var item = selectedArtifacts[i];
            item.set({'systemLabels':systemLabels});
            item.set({'myLabels':myLabels});
            item.save(null,{ success: function(model, response){
                savedCount++;
                //trigger backbone event
                model.trigger('labelApplied',model);
                //trigger jquery event for non backbone listeners
                $.flxweb.events.triggerEvent(
                    $(document),
                    'flxweb.library.label.applied',
                    {
                        'model' : model,
                        'artifactID' : model.get('artifactID'),
                        'artifactRevisionID':model.get('artifactRevisionID'),
                        'resourceRevisionID':model.get('resourceRevisionID'),
                        'systemLabels':systemLabels,
                        'myLabels': myLabels
                    });
                if (savedCount >= tobeSavedCount) {
                    $.flxweb.hideLoading();
                    $.flxweb.notify('Items have been restored');
                } 
            }});
        }
        return false;
    },
    onChangeLabelsClick: function() {
        var selectedItems = this.items.filter(function(item) {
            return item.get('selected') === true;
        });
        //loop through current library labels associated with the selected 
        //artifact and set the selectedLabels dictionary. 
        var selectedLabels = {};
        for (var a=0; a < selectedItems.length;a++) {
            var itemLabels = selectedItems[a].get('labels');
            for (var i = 0; i < itemLabels.length; i++) {
                var label = itemLabels[i];
                selectedLabels[label]=1;
            }
        }

        this.labelsChooser.open(selectedItems,selectedLabels);
        return false;
    },
    onLabelAdded: function(newLabelModel) {
        var newLabelView = new LibraryLabelView({model:newLabelModel});
        $('#library_labels').append(newLabelView.render().el);
    },
    onSelectAll: function() {
        this.$('.js_row_check').prop("checked",$('#selectall').prop("checked")).change();
    }

});

