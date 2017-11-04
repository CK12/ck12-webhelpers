define([
    'jquery',
    'underscore',
    'backbone',
    'library/services/ck12.library',
], function($, _, Backbone, LibraryService){
    "use strict";
    var WordDocsModel = Backbone.Model.extend({
    	old_txt_title: null,
    	old_filename: null,
    	xdt_data: null,
        initialize: function() {
        	
        },
        statusCheckSuccess: function(json_status, _deferred, options) {
        	var self = this;
            if (json_status.status === 'SUCCESS') {
                _deferred.resolve(json_status);
            } else if (json_status.status === 'FAILURE') {
                _deferred.reject(json_status);
            } else if (json_status.status === 'PENDING' || json_status.status === 'IN PROGRESS') {
                window.setTimeout(function() {
                	self.checkTaskStatus(_deferred, options);
                }, options.interval);
            }
        },
        statusCheckError: function(xhr, text_status, errorThrown, _deferred) {
            var error_info = {
                'status': text_status,
                'error': errorThrown
            };
            _deferred.reject(error_info);
        },
        checkTaskStatus: function(_deferred, options) {
        	var self = this;
        	return LibraryService.checkTaskStatus(options)
	        .done(function(json_status) {
	            self.statusCheckSuccess(json_status, _deferred, options);
	        })
	        .fail(function(xhr, text_status, errorThrown) {
	        	self.statusCheckError(xhr, text_status, errorThrown, _deferred);
	        });
        },
        taskProcessor: function(options) {

            /**
             * Creates a poller that polls for task status at a defined interval
             * @param options <Object>:
             *      url     : url to poll. if unspecified, task_id will be used to poll /task/status/<task_id>/
             *      task_id : task id to poll (this option is ignored if url is specified.)
             *      interval: polling interval in milliseconds
             * @returns a promise object
             */
            var url = '',
                interval = 5000,
                _deferred = $.Deferred(),
                _promise = _deferred.promise();

            if (options.url) {
                url = options.url;
            } else if (!options.task_id) {
            	return false;
            }

            if (options.interval) {
                interval = options.interval;
            } else {
            	options.interval = interval;
            }
            this.checkTaskStatus(_deferred, options);
            return _promise;
        }
    });
    return WordDocsModel;
});