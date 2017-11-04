define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates',
    'forums/services/forum.services',
    'forums/models/models'
], function($, _, Backbone, Mn, TMPL, ForumServices, Models){
    var ForumsHomeHeaderView = Mn.ItemView.extend({
        template: _.template(TMPL.ForumHomeHeader),
        initialize: function(options){
            this.type = options.type;
            var data = {
                'clientID':24839961,
                'groupType': 'public-forum',
                'groupIDs': '['+options.group.id+']'
            };
            this.user = options.user;
            this.model = new Models.ForumHeaderModel({group: options.group, isMember: options.isMember});
            var self = this;
            ForumServices.getAllPostsCounts(data).done(function(data){
                if(ForumServices.validStatus(data)){
                    self.model.set({'peerHelpInfo': data.response.counts[options.group.id]});
                }
            });
            this.showMembers();
        },
        showMembers: function(){
            var groupId = this.model.get('group').id;
            var self = this;
            var memberCountsData = {
                groupIDs: groupId,
                clientID: '24839961',
                groupType: 'public-forum',
                totalMembers: 5,
                publicForums: true
            };
            ForumServices.getMemberCounts(memberCountsData).done(function(data){
                if(data.responseHeader.status === 0){
                    self.model.set('membersData', {
                        total: data.response.groups[groupId].total,
                        members: data.response.groups[groupId].members
                    });
                }
            });
        },
        onRender: function(){
            var self = this;
            this.user.done(function(userData){
                var roles = userData.userInfoDetail.roles;
                if(roles){
                    var isContentAdmin = roles.some(function(role){
                        if(role.name === 'content-admin' && role.is_admin_role){
                            return true;
                        }
                        return false;
                    });
                    var isAuthor = self.model.toJSON().group.creator.authID === userData.userInfoDetail.id ? true: false;
                    if((isContentAdmin || isAuthor)&& self.type === 'setting'){
                        self.$el.find('.forum-pencil-size').removeClass('hide');
                    }
                }
            });
        },
        modelEvents: {
            'change': 'fieldsChanged'
        },
        fieldsChanged: function(){
            this.render();
        }
    });
    return ForumsHomeHeaderView;
});
