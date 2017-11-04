define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates'
], function($, _, Backbone, Mn, TMPL){
    var ForumsMobileNavView = Mn.ItemView.extend({
        template: _.template(TMPL.ForumMobileNav),
        // initialize: function(){
        //     var self = this;
        //     var data = {
        //         groupID: this.model.id,
        //         pageSize: 10
        //     };
        //     this.total = this.model.toJSON().total;
        //     ForumServices.getForumMembers(data).done(function(data){
        //         self.total = data.response.total;
        //         data.response.isMember = self.model.toJSON().isMember;
        //         // self.model.set(data.response);
        //     });
        // },
        modelEvents: {
            'change': 'fieldChanged'
        },
        fieldChanged: function(){
            this.render();
        }

    });
    return ForumsMobileNavView;
});
