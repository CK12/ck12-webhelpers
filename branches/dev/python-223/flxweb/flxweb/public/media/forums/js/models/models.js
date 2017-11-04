define([
    'underscore',
    'backbone1x',
    'forums/services/forum.services',
    'common/views/modal.view'
],function(_, Backbone,ForumServices, ModalView){
    var Forum = Backbone.Model.extend({
        sync: function(method, model, options){
            if(this.id === 1 || this.id === 2){
                ModalView.alert("We can't find the question you're looking for.  You can continue browsing other questions.", function(){
                    location.href = '/forums/';
                }, true);
            }
            var _dfd = ForumServices.getForumInfo({groupID: this.id});
            _dfd.done(function(data){
                if(data.responseHeader.status === 0){
                    if(data.response.group.groupType === 'public-forum'){
                        options.success(data.response);
                    }else{
                        ModalView.alert("We can't find the question you're looking for.  You can continue browsing other questions.", function(){
                            location.href = '/forums/';
                        }, true);
                    }
                }else if(data.responseHeader.status === 5004 || data.responseHeader.status === 1009){
                    ModalView.alert("We can't find the question you're looking for.  You can continue browsing other questions.", function(){
                        location.href = '/forums/';
                    }, true);
                }
            }).fail(function(data){
                ModalView.alert(data);
            });
            return _dfd;
        },
        defaults:{
            name: '',
            description:'',
            peerHelpInfo:{
                threadsCount: 0,
                posts:[{
                    content: ''
                }],
                commentsCount: 0
            },
            membersData:{
                total: 0,
                members:[]
            }
        }
    });
    var ForumCollection = Backbone.Collection.extend({
        model: Forum,
        getFilteredForums: function(creatorId, owner, member){
            var forums = this.filter(function(forum){
                var result = false;
                if(owner){
                    if(forum.attributes.creator.id === creatorId){
                        result = true;
                    }

                }
                if(member){
                    if(forum.attributes.creator.id !== creatorId){
                        result = true;
                    }
                }
                return result;

            });
            return new ForumCollection(forums);
        }
    });
    var Member = Backbone.Model.extend({
        defaults:{
            firstName: '',
            lastName: ''
        }
    });
    var MemberSideNav = Backbone.Model.extend({
        defaults:{
            total: 0,
            members:[],
            isMember: false,
            forumName: '',
            isQuestionDetailsView: false
        }
    });
    var ForumHeaderModel = Backbone.Model.extend({
        defaults:{
            group: {},
            peerHelpInfo: {commentsCount : 0,
                           threadsCount : 0,
                           posts : []
                           },
            isMember: false,
            membersData:{
                total: 0,
                members:[]
            }
        }
    });
    var MemberCollection = Backbone.Collection.extend({
        model: Member,
        getMembers: function(){
            var members = this.filter(function(member){
                return member.get('groupMemberRole') === 'groupmember';
            });
            return new MemberCollection(members);
        },
        getMemberLeaders: function(){
            var leaders = this.filter(function(member){
                return member.get('groupMemberRole') === 'groupadmin';
            });
            return new MemberCollection(leaders);
        }
    });

    var Setting = Backbone.Model.extend({
        defaults:{
            notificationSwitch: false,
            turnOnLink: true,
            modifyButton: false,
            notificationOptions: false,
            closeLink: false,
            frequency: 'off'
        }
    });
    return {
        Forum: Forum,
        ForumCollection: ForumCollection,
        Member: Member,
        MemberCollection: MemberCollection,
        MemberSideNav: MemberSideNav,
        Setting: Setting,
        ForumHeaderModel: ForumHeaderModel
    };

});
