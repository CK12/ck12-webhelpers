define([
        'underscore',
        'forums/models/models',
        'forums/tests/testData',
        'forums/views/forums-list/forum.item.view',
        'forums/views/forums-list/forum.list.layout.view',
        'forums/views/home/forum.home.header.view',
        'forums/services/forum.services',
        'common/utils/utils',
        'common/utils/user',
        'common/views/login.popup.view',
        'sinon'
], function(_, Models, Data, ForumItemView, ForumsLayoutView, ForumHomeHeaderView, Services, utils, User, loginPopup){
     _df = utils.deferredFunction;
    describe('Forum Views',function(){
        describe('Forum Item View', function(){
            afterEach(function(){
                $('.reveal-modal,.reveal-modal-bg,.modal-uikit-wrapper,.modal-uikit-overlay').add().add().remove()
            });

            var forumModel = new Models.Forum(Data.forumUnit);
            var forumItemView = new ForumItemView({model:forumModel});
            it('process peerhelp response(data with status 0)', function(){
                var responseData = forumItemView.processPeerHelpResponse(Data.peerHelpLatestComment);
                responseData.should.exist;
            });
            it('process peerhelp response(data without status 0)', function(){

                Data.peerHelpLatestComment.responseHeader.status = 100;
                var responseData = forumItemView.processPeerHelpResponse(Data.peerHelpLatestComment);
                responseData.should.equals(false);

            });
            it('process peerhelp response(data is empty)', function(){
                var responseData = forumItemView.processPeerHelpResponse();
                responseData.should.equals(false);
            });
            it('process follow response(status 0)', function(){
                var result = forumItemView.processFollowResponse(Data.status0);
                result.should.equals(true);
                forumItemView.model.attributes.isMember.should.equals(true);
            });
            it('process follow response(status 100)', function(){
                var forumModel = new Models.Forum(Data.forum.response);
                var forumItemView = new ForumItemView({model:forumModel});
                var result = forumItemView.processFollowResponse(Data.status100);
                result.should.equals(false);
                forumItemView.model.attributes.isMember.should.equals(false);
            });
            it('process follow response(data is empty)', function(){
                var forumModel = new Models.Forum(Data.forum.response);
                var forumItemView = new ForumItemView({model:forumModel});

                var result = forumItemView.processFollowResponse();
                result.should.equals(false);
                forumItemView.model.attributes.isMember.should.equals(false);
            });
            it('process unfollow response(status 0)', function(){
                var result = forumItemView.processUnfollowResponse(Data.status0);
                result.should.equals(true);
                forumItemView.model.attributes.isMember.should.equals(false);
            });
            it('process unfollow response(status 100)', function(){
                var forumModel = new Models.Forum(Data.forum.response);
                var forumItemView = new ForumItemView({model:forumModel});
                var result = forumItemView.processUnfollowResponse(Data.status100);
                result.should.equals(false);
            });
            it('process unfollow response(data is empty)', function(){
                var forumModel = new Models.Forum(Data.forum.response);
                var forumItemView = new ForumItemView({model:forumModel});
                var result = forumItemView.processUnfollowResponse();
                result.should.equals(false);
            });
            // it('follow function in View(positive: status is 0)', function(done){
            //     this.timeout(15000);
            //     setTimeout(done, 15000);
            //     User.getUser = _df(function(_d){
            //          _d.resolve({
            //             isLoggedIn: function(){
            //                 return true;
            //             }
            //         });
            //     });
            //     Services.follow = _df(function(_d, data){
            //         _d.resolve({
            //             responseHeader:{
            //                 status: 0
            //             },
            //             response: {

            //             }
            //         });
            //     });

            //     var forumModel = new Models.Forum(Data.forum);
            //     var options = _.extend({model: forumModel}, {user: User.getUser()});

            //     var forumItemView = new ForumItemView(options);
            //     forumItemView.follow();
            //     forumItemView.model.attributes.isMember.should.equals(true);
            //     forumItemView.$el.find('.tip').css('opacity').should.equals('1');
            //     setTimeout(function(){
            //         forumItemView.$el.find('.tip').css('opacity').should.equals('0');
            //         done();
            //     },10000);

            // });
            it('follow (unauthenticated user)', function(done){
                User.getUser = _df(function(_d){
                     _d.resolve({
                        isLoggedIn: function(){
                            return false;
                        }
                    });
                });
                Services.follow = _df(function(_d, data){
                    _d.resolve({
                        responseHeader:{
                            status: 0
                        },
                        response: {

                        }
                    });
                });

                sinon.spy(loginPopup, 'showLoginDialogue');
                var forumModel = new Models.Forum(Data.forum.response);
                var options = _.extend({model: forumModel}, {user: User.getUser()});

                var forumItemView = new ForumItemView(options);
                forumItemView.follow();
                window.setTimeout(function(){
                    chai.expect(loginPopup.showLoginDialogue.callCount).equals(1);
                    done();
                }, 20);
                

            });
            it('follow function in the view(negative: status is non-zero)', function(){
                User.getUser = _df(function(_d){
                     _d.resolve({
                        isLoggedIn: function(){
                            return true;
                        }
                    });
                });
                Services.follow = _df(function(_d, data){
                    _d.resolve({
                        responseHeader:{
                            status: 100
                        },
                        response: {

                        }
                    });
                });

                var forumModel = new Models.Forum(Data.forum.response);
                var options = _.extend({model: forumModel}, {user: User.getUser()});

                var forumItemView = new ForumItemView(options);
                forumItemView.follow();
                forumItemView.model.attributes.isMember.should.equals(false);

            });
            it('unfollow function in the view(positive)', function(){
                User.getUser = _df(function(_d){
                     _d.resolve({
                        isLoggedIn: function(){
                            return true;
                        },
                        userInfoDetail: {
                            id: 1
                        }
                    });
                });
                Services.unfollow = _df(function(_d, data){
                    _d.resolve({
                        responseHeader:{
                            status: 0
                        },
                        response: {

                        }
                    });
                });
                Data.forum.isMember = true;
                var forumModel = new Models.Forum(Data.forum.response.group);
                var options = _.extend({model: forumModel}, {user: User.getUser()});
                var forumItemView = new ForumItemView(options);
                forumItemView.unfollow();
                forumItemView.model.attributes.isMember.should.equals(false);

            });
            it('unfollow function in the view(negative: creator tries to unfollow)', function(){
                User.getUser = _df(function(_d){
                     _d.resolve({
                        isLoggedIn: function(){
                            return true;
                        },
                        userInfoDetail: {
                            id: 1
                        }
                    });
                });
                Services.unfollow = _df(function(_d, data){
                    _d.resolve({
                        responseHeader:{
                            status: 0
                        },
                        response: {

                        }
                    });
                });
                Data.forum.response.group.creator.authID = 1;
                var forumModel = new Models.Forum(Data.forumUnit);
                var options = _.extend({model: forumModel}, {user: User.getUser()});
                var forumItemView = new ForumItemView(options);
                forumItemView.unfollow();
                forumItemView.model.attributes.isMember.should.equals(false);

            });
        });
        describe('Forum List Layout View', function(){
            User.getUser = _df(function(_d){
                 _d.resolve({
                    isLoggedIn: function(){
                        return true;
                    },
                    userInfoDetail: {
                        id: 1
                    }
                });
            });
            Services.getForums = _df(function(_d, data){
                _d.resolve(Data.forums);
            });
            var forumsLayoutView = new ForumsLayoutView({user: User.getUser()});

            it('process forum response', function(){
                var result = forumsLayoutView.processForumsResponse(Data.forums);
                result.hasMore.should.equals(true);
                result.addData.should.equals(true);
            });
            it('process forum response (total is small)', function(){
                Data.forums.response.total = 2;
                var result = forumsLayoutView.processForumsResponse(Data.forums);
                result.hasMore.should.equals(false);
                result.addData.should.equals(true);
            });
            it('load more (positive)', function(){

                Data.forums.response.total = 10;
                
                Services.getForums = _df(function(_d, data){
                    _d.resolve(Data.moreForums);
                });

            
                forumsLayoutView.loadMore();
                // console.log('after: ', forumsLayoutView.collection);
                forumsLayoutView.collection.length.should.equals(10);
            });
        });
    });
});