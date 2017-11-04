define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates'
], function($, _, Backbone, Mn, TMPL){
    var ModalCreateForumView = Mn.ItemView.extend({
        template: _.template(TMPL.ModalCreateForum),
        events:{
            'click #create-forum-final': 'createForum',
            'click #create-forum-cancel': 'cancel'
        },
        createForum: function(){
            var $name = $('#forum-name').val();
            var $description = $('#group-description').val();
            var data = {};
            data.name = $name;
            data.description = $description;
            data.id = '3';
            data.last_comment = '';
            data.threads = '0';
            data.comments = '0';
            data.following = 'true';

            this.collection.add(data);
            $('#createForumModal').foundation('reveal', 'close');
            this.resetModal();
        },
        cancel: function(){
            $('#createForumModal').foundation('reveal', 'close');
            this.resetModal();
        },
        resetModal: function(){
            $('#forum-name').val('');
            $('#group-description').val('');
        }
    });
    return ModalCreateForumView;
});