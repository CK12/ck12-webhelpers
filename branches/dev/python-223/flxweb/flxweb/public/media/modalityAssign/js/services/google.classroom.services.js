define([
    'jquery',
    'underscore',
    'common/utils/utils'
], function ($, _, util) {
    'use strict';

    var rejectReponseStatus = function(response){
        if (response && response.responseHeader && response.responseHeader.status
            && response.responseHeader.status !==0){
            return true;
        }
        return false;
    }

    var _dfd = util.deferredFunction,
        ck12ajax = util.ck12ajax,
        api_classroom_auth_status = util.getApiUrl('flx/get/status/googleclassroom/auth'),
        api_classroom_auth_url = util.getApiUrl('flx/get/authURL/googleclassroom'),
        api_classroom_list_courses_url = util.getApiUrl('flx/get/courses/googleclassroom'),
        api_fetch_artifact = util.getApiUrl('flx/get/detail'),
        api_assign_assignment = util.getApiUrl('flx/assign/assignment/');

    var GoogleClassroomService = {
        googleClassroomAuthStatus: _dfd(function (_d) {
            return util.ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_classroom_auth_status
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        getGoogleAuthURL: _dfd(function (_d) {
            return util.ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_classroom_auth_url
            }).done(function (data) {
                if(rejectReponseStatus(data)){
                    _d.reject(data);
                }
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        loadGoogleClassroomCourses: _dfd(function (_d, options, docList) {
            return util.ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_classroom_list_courses_url,
                data: options
            }).done(function (data) {
                if (data.response.message) {
                    _d.reject(data);
                } else {
                    _d.resolve(data.response);
                }
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        assignAssignment: _dfd(function (_d, options) {
            return util.ajax({
                url: api_assign_assignment + options['lmsGroupID'],
                type: 'POST',
                data: options
            }).done(function (data) {
		if (data.responseHeader.status !==0){
		    return _d.reject(data);
		}
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        })
    };

    return GoogleClassroomService;

});
