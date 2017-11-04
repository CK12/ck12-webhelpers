define([
    'jquery',
    'underscore',
    'marionette',
    'forums/templates/templates',
    'forums/services/forum.services',
    'forums/models/models',
    'common/views/modal.view'

], function($, _, Mn, TMPL, ForumServices, Models, ModalView){
    var ForumsSideNavView = Mn.ItemView.extend({
        template: _.template(TMPL.FORUMSIDENAV),
        initialize: function(options){
            this.id = options.forum_id;
            this.selected_nav = options.selected_nav;
            var self = this;
            var memberCountsData = {
                groupIDs: this.id,
                clientID: '24839961',
                groupType: 'public-forum',
                totalMembers: 5,
                publicForums: true
            };
            this.model = new Models.MemberSideNav();
            ForumServices.getMemberCounts(memberCountsData).done(function(data){
                if(data.responseHeader.status === 0){
                    self.model.set({
                        isMember:options.isMember,
                        isQuestionDetailsView: self.selected_nav === 'questionDetailsView',
                        total: data.response.groups[self.id].total,
                        members: data.response.groups[self.id].members
                    });
                }
            }).fail(function(errorMessage){
                ModalView.alert(errorMessage);
            });
        },
        ui:{
            home: '#nav-home',
            member: '#nav-member',
            setting: '#nav-setting'
        },
        onRender: function(){
            if (this.ui[this.selected_nav]){
                this.ui[this.selected_nav].addClass('active');
            }
        },
        modelEvents: {
            'change': 'fieldChanged'
        },
        fieldChanged: function(){
            this.render();
        }
    });
    return ForumsSideNavView;
});
