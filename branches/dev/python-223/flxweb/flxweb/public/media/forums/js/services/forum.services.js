define(['common/utils/utils',
        'common/utils/user'
        ], function (utils, user) {
    'use strict';
    var APIS ={
            'createForum': utils.getApiUrl('flx/create/group'),
            'getForums': utils.getApiUrl('flx/forums/all'),
            'forumInfo': utils.getApiUrl('flx/group/info'),
            'updateForum': utils.getApiUrl('flx/update/group'),
            'forumMembers': utils.getApiUrl('flx/group/members'),
            'updateNotifications': utils.getApiUrl('flx/set/member/notifications'),
            'getNotifications': utils.getApiUrl('flx/get/member/notifications'),
            'getAnonymous': utils.getApiUrl('flx/group/info'),
            'updateAnonymous': utils.getApiUrl('flx/group/set/qastatus'),
            'follow': utils.getApiUrl('flx/group/add/member'),
            'unfollow': utils.getApiUrl('flx/group/delete/member'),
            'deleteForum': utils.getApiUrl('flx/delete/group'),
            'peerHelpInfo': utils.getApiUrl('peerhelp/api/get/latest/post/'),
            'share': utils.getApiUrl('flx/send/email'),
            'invite': utils.getApiUrl('auth/invite'),
            'uploadImage': utils.getApiUrl('flx/create/resource'),
            'postsCounts': utils.getApiUrl('peerhelp/api/get/postType/counts'),
            'memberCounts': utils.getApiUrl('flx/group/member/counts')
        },
        _df = utils.deferredFunction,
        // getUserInfo = user.getUser(),
        forumServices = {
            getForums: _df(function(_d, data){
                utils.ajax({
                    url: APIS.getForums,
                    data: data,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: function(data){
                        _d.resolve(data);
                    },
                    error: function(){
                        _d.reject('Get forums failed! Please refresh the page or try it later');
                    }

                });

            }),
            getForumMembers: _df(function(_d, data){
                utils.ajax({
                    url: APIS.forumMembers,
                    data: data,
                    cache: false,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Get Members failed! Please refresh the page or try it later');
                    }
                });
            }),
            getNotifications: _df(function(_d){
                utils.ajax({
                    url: APIS.getNotifications,
                    cache: false,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Get notification failed! Please refresh the page or try it later');
                    }
                });
            }),
            updateNotifications: _df(function(_d, data){
                utils.ajax({
                    url: APIS.updateNotifications,
                    data: data,
                    isPageDisable: true,
                    isShowLoading: true,
                    method: 'post',
                    success: function (data) {
                        _d.resolve(data.response);
                    },
                    error: function () {
                        _d.reject('Update Notification failed! Please refresh the page or try it later');
                    }
                });
            }),
            getAnonymous: _df(function(_d, data){
                utils.ajax({
                    url: APIS.getAnonymous,
                    isPageDisable: true,
                    isShowLoading: true,
                    data: data,
                    success: function (data) {
                        _d.resolve(data.response);
                    },
                    error: function () {
                        _d.reject('Failed to fetch groups');
                    }
                });
            }),
            updateAnonymous: _df(function(_d, data){
                utils.ajax({
                    url: APIS.updateAnonymous,
                    data: data,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: function (data) {
                        _d.resolve(data.response);
                    },
                    error: function () {
                        _d.reject('Failed to fetch groups');
                    }
                });
            }),
            createForum: _df(function(_d, data){
                utils.ajax({
                    url: APIS.createForum,
                    data: data,
                    isPageDisable: true,
                    isShowLoading: true,
                    method: 'post',
                    contentType: false,
                    processData: false,
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Create forums failed! Please refresh the page or try it later');
                    }
                });
            }),
            uploadImage: _df(function(_d, data){
                utils.ajax({
                    url: APIS.uploadImage,
                    data: data,
                    isPageDisable: true,
                    isShowLoading: true,
                    method: 'post',
                    contentType: false,
                    processData: false,
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Upload image failed! Please refresh the page or try it later');
                    }
                });
            }),
            getForumInfo: _df(function(_d, data){
                utils.ajax({
                    url: APIS.forumInfo,
                    data: data,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Get the forum failed! Please refresh the page or try it later');
                    }
                });
            }),
            deleteForum: _df(function(_d, data){
                utils.ajax({
                    url: APIS.deleteForum,
                    data: data,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Failed to fetch groups');
                    }
                });
            }),
            follow: _df(function(_d, data){
                utils.ajax({
                    url: APIS.follow,
                    data: data,
                    isPageDisable: true,
                    isShowLoading: true,
                    method: 'post',
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Follow the forum failed! Please refresh the page or try it later');
                    }
                });
            }),
            unfollow: _df(function(_d, data){
                // getUserInfo.done(function(userData){

                    // data.memberID = userData.userInfoDetail.id;

                utils.ajax({
                    url: APIS.unfollow,
                    isPageDisable: true,
                    isShowLoading: true,
                    data: data,
                    method: 'post',
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Unfollow the forum failed! Please refresh the page or try it later');
                    }
                });
                // });
            }),
            getPeerHelpInfo: _df(function(_d, data){
                utils.ajax({
                    url: APIS.peerHelpInfo,
                    data: data,
                    cache: false,
                    isPageDisable: false,
                    isShowLoading: false,
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Get PeerHelp failed! Please refresh the page or try it later');
                    }
                });
            }),
            getAllPostsCounts: _df(function(_d, data){
                utils.ajax({
                    url: APIS.postsCounts,
                    useCDN: true,
                    cdnExpirationAge: 'daily',
                    data: data,
                    cache: false,
                    isPageDisable: false,
                    isShowLoading: false,
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Get posts counts failed! Please refresh the page or try it later');
                    }
                });
            }),
            getMemberCounts: _df(function(_d, data){
                utils.ajax({
                    url: APIS.memberCounts,
                    data: data,
                    cache: false,
                    isPageDisable: false,
                    isShowLoading: false,
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Get posts counts failed! Please refresh the page or try it later');
                    }
                });
            }),
            share: _df(function(_d, data){

                utils.ajax({
                    url: APIS.share,
                    isPageDisable: true,
                    isShowLoading: true,
                    data: data,
                    method: 'post',
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Share failed! Please refresh the page or try it later');
                    }
                });
            }),
            inviteMember: _df(function(_d, data){
                utils.ajax({
                    url: APIS.invite,
                    data: data,
                    isPageDisable: true,
                    isShowLoading: true,
                    method: 'post',
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Invite a member failed! Please refresh the page or try it later');
                    }
                });
            }),
            updateForum: _df(function(_d, data){

                utils.ajax({
                    url: APIS.updateForum,
                    isPageDisable: true,
                    isShowLoading: true,
                    contentType: false,
                    processData: false,
                    data: data,
                    method: 'post',
                    success: function (data) {
                        _d.resolve(data);
                    },
                    error: function () {
                        _d.reject('Update the forum failed! Please refresh the page or try it later');
                    }
                });
            }),
            validStatus: function(data){
                if(data && data.responseHeader && typeof data.responseHeader.status && data.responseHeader.status === 0){
                    if(data.response){
                        return true;
                    }
                }
                return false;
            },
            hasMore: function(pageNum, pageSize, total){
                if(pageNum && pageNum >= 0 && pageSize && pageSize >=0 && total && total >=0){
                    if(pageNum * pageSize < total){
                        return true;
                    }
                }
                return false;
            }
        };

    return forumServices;

});
