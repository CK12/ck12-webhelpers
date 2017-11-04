define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates'
], function($, _, Backbone, Mn, TMPL){
    var CreateDiscussion = Mn.ItemView.extend({
        template: _.template(TMPL.ForumCreateDiscussion),
        radio:  Backbone.Wreqr.radio.channel('global'),
        events:{
            'click #create-forum-cancel': 'cancel',
            'keyup #forum-name': 'removeErrorMessage'
        },
        removeErrorMessage: function(){
            if(this.$el.find('.create-error-message').html().length !== 0){
                this.$el.find('.create-error-message').html('');
            }
        },
        cancel: function(){
            this.radio.vent.trigger('hideCreateDialog');
        }
    });
    return CreateDiscussion;
});
