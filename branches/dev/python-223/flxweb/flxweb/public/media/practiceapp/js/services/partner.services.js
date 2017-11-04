define(['jquery', 'underscore', 'common/utils/utils'], function ($, _, utils) {

    'use strict';

    var _df = utils.deferredFunction; //deferred function utility

    var PartnerServices = function (config) {

        var FLX_API_PREFIX = config.flx_api_path,
            AUTH_API_PREFIX = config.auth_api_path,
            FLX_APP_NAME = config.app_name;
        
        /**
         * Get user details
         *
         * Fetch details for logged in user
         *
         */
        this.getMyInfo = _df(function (_d) {
            var api = FLX_API_PREFIX + 'get/info/my';
            utils.ajax({
                url: api,
                isPageDisable: true,
                cache: false
            }).done(function (data) {
                if( data.responseHeader.status!==0){
                    return _d.reject(data);
                }
                _d.resolve(data);
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
                });
            });
        });

        /**
         * PartnerAppServices.getAssignment
         *
         * Get assignemnt by assignmentID for a logged in user
         * @Param
         *  assignmentID : the ID of the assignment
         *
         */
        this.getAssignment = _df(function (_d, assignmentID) {
            var api = FLX_API_PREFIX + 'get/assignment/'+ assignmentID;
            utils.ajax({
                url: api,
                isPageDisable: true,
                isShowLoading: true,
                cache: false
            }).done(function (data) {
                if( data.responseHeader.status!==0){
                    return _d.reject(data);
                }
                _d.resolve(data.response.assignment);
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
                });
            });
        });

        /**
         * PartnerAppServices.getGroupMembers
         *
         * Fetch groups for logged in user
         *
         * @param
         *  groupID: ID of the group
         *  pageSize: Results per page
         *  providerAppName: Name of the partner app
         *  filters:
         *      filters.providerMemberID (filter for member of the group by providerMemberID)
         */
        this.getGroupMembers = _df(function (_d, groupID, partnerAppName, filters) {
            var params = {
                'pageSize': 100,
            };

            params.groupID = groupID;
            params.partnerAppName = partnerAppName;

            if (filters && 'object' === typeof filters) {
                var str_filters = '';
                _(filters).each(function (val, key) {
                    str_filters += key + ',' + val + ';';
                });
                params.filters = str_filters;
            }

            utils.ajax({
                url: FLX_API_PREFIX + 'group/members',
                data: params,
                isPageDisable: true,
                isShowLoading: true,
                cache: false
            }).done(function (data) {
                if (data.response && data.response.message) {
                    _d.reject();
                }
                _d.resolve(data.response.members);
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
                });
            });
        });


        /**
         * PartnerAppServices.submitModalityScore
         *
         * For modality assignments submit a score of 100%
         * @Params:
         *  assignmentID : the ID of the assignment
         *  score : the score for the assignment
         *  artifactID : the ID of the artifact
         *
         */
        this.submitModalityScore = _df(function( _d, assignmentID, score, artifactID){
            var api = FLX_API_PREFIX + 'update/my/assignment/status';
            var postData = {
                assignmentID: assignmentID,
                score: score,
                artifactID: artifactID,
                nonPractice: true
            };

            utils.ajax({
                url: api,
                data : postData,
                type: "POST"
            }).done(function(data){
                _d.resolve(data);
            }).fail(function(){
                _d.reject();
            });
        });
    };
    return PartnerServices;
});
