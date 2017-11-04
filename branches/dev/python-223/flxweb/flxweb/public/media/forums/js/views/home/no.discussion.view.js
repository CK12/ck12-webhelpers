define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates'
], function($, _, Backbone, Mn, TMPL){
    var ForumsHomeHeaderView = Mn.ItemView.extend({
        template: _.template(TMPL.NoDiscussion),
        initialize: function(options){
            this.groupID = options.groupID;
            this.render();
        },
        events: {
            'click #browse-discussion-button' : 'browseDiscussions'
        },
        browseDiscussions: function(){
            location.href = '/forum/' + this.groupID + '/home';
        }
    });
    return ForumsHomeHeaderView;
});
