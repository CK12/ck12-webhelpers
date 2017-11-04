define([
    'forums/services/forum.services',
    'forums/tests/testData',
    'common/utils/user',
    'forums/tests/fakeServer',
    'sinon'
    ], function(Services, Data, User){
    describe('Forum Services', function() {
        describe('Get Forums', function(){
            var forumsRecord;
            var newForum;
            it('Get Forums without passing any param', function(done){
                Services.getForums().then(function(data){
                    data.should.exist;
                    data.responseHeader.status.should.equals(0);
                    data.response.group.forEach(function(group){
                        group.accessCode.should.exist;
                        group.description.should.exist;
                        group.id.should.exist;
                        group.name.should.exist;
                    });
                    done();
                }, function(){
                    throw "connection error!";
                });
            });

            it('Get Forums with pageNum=1, pageSize=5 and sort=\'updateTime, desc\'', function(done){
                var data = {
                    pageNum: 1,
                    pageSize: 5,
                    sort: 'updateTime, desc'
                }
                Services.getForums(data).then(function(data){
                    data.should.exist;
                    data.responseHeader.status.should.equals(0);
                    data.response.group.length.should.equals(5);
                    data.response.group.forEach(function(group){
                        group.accessCode.should.exist;
                        group.description.should.exist;
                        group.id.should.exist;
                        group.name.should.exist;
                    });
                    forumsRecord = data.response.group;
                    done();
                });
            });

            it('Get Forum Members', function(done){
                if(forumsRecord.length > 0){
                    var data = {
                        groupID: forumsRecord[0].id,
                        pageNum: 1,
                        pageSize:2
                    };
                    Services.getForumMembers(data).then(function(data){
                        data.should.exist;
                        data.responseHeader.status.should.equals(0);
                        data.response.should.exist;
                        data.response.limit.should.equals(10);
                        data.response.members.forEach(function(member){
                            member.name.should.exist;
                            member.status.should.exist;
                        });
                        done();
                    });
                }
            });

            it('Get Notification', function(done){
                Services.getNotifications().then(function(data){
                    data.responseHeader.status.should.equals(0);
                    done();
                });
            });

            it('Create a forum', function(done){
                var data = {
                    groupName: 'API TEST',
                    groupDescription:'This forum is created by forum Unit test',
                    groupScope:'closed',
                    groupType:'public-forum'
                }
                Services.createForum(data).then(function(data){
                    data.responseHeader.status.should.equals(0);
                    newForum = data.response.group;
                    data.responseHeader.status.should.equals(0);
                    done();
                });
            });
            it('follow', function(done){
                var data = {
                    groupID: 1,
                    accessCode: 'ASFJKL'
                }
                Services.follow(data).then(function(data){
                    data.responseHeader.status.should.equals(0);
                    done();
                });
            });

            it('unfollow', function(done){
                User.getUser().done(function(userData){
                    var data = {
                        groupID: 1,
                        memberID: 1
                    };
                    Services.unfollow(data).then(function(data){
                        data.responseHeader.status.should.equals(0);
                        done();
                    });
                });
            });
            it('update forum', function(done){
                var data = {
                    groupID: 1,
                    newGroupName:'API TEST updated',
                    newGroupDesc: 'update successfully',
                    groupType:'public-forum'
                };
                Services.updateForum(data).then(function(data){
                    data.responseHeader.status.should.equals(0);
                    data.response.group.name.should.equals('API TEST updated');
                    data.response.group.description.should.equals('update successfully');
                    done();
                });
            });
            it('delete a forum', function(done){
                var data = {
                    groupID: 64889
                };
                Services.deleteForum(data).then(function(data){
                    done();
                });
            });
 
            it('peehelp info(lastest comment)', function(done){
                var data = {
                    'clientID':24839961,
                    'groupType': 'public-forum',
                    'groupID': forumsRecord[0].id,
                    'getLatestPost':true
                };
                Services.getPeerHelpInfo(data).then(function(data){
                    data.responseHeader.status.should.equals(0);
                    data.response.threadsCount.should.exist;
                    data.response.commentsCount.should.exist;
                    data.response.posts[0].should.exist;
                    done();
                });
            });
            // it('Valid Status( data with status 0)', function(){
            //     var result = Services.validStatus(Data.status0);
            //     result.should.equals(true);
            // });
            // it('Valid Status( data with status 100)', function(){
            //     var result = Services.validStatus(Data.status100);
            //     result.should.equals(false);
            // });
            // it('Valid Status( data is empty)', function(){
            //     var result = Services.validStatus();
            //     result.should.equals(false);
            // });
            // it('hasMore (total is large)', function(){
            //     var result = Services.hasMore(1,1,50);
            //     result.should.equals(true);
            // });
            // it('hasMore (total is small)', function(){
            //     var result = Services.hasMore(1,10,5);
            //     result.should.equals(false);
            // });
            // it('hasMore (contain empty parameters)', function(){
            //     var result = Services.hasMore();
            //     result.should.equals(false);
            // });
        });
    });
});
