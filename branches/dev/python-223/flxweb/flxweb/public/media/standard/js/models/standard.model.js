define(['backbone', 'common/utils/utils'], function (Backbone, util) {
    'use strict';
    var standardModule = {};

    /**
     * Standards model to hold the sets objects
     */
    standardModule.setsModel = Backbone.Model.extend({
        initialize: function () {}
    });

    /**
     * Collection of standards for the current type
     */
    standardModule.setsCollection = Backbone.Collection.extend({
        model: standardModule.setsModel,
        //    	url: '/media/standard/js/models/info.json'
        url: util.getApiUrl('flx/get/standards') // if need to remove dependancy on util, add / in beginning to url
    });

    /**
     * Standards model to hold the sets objects
     */
    standardModule.nodesModel = Backbone.Model.extend({
        initialize: function () {}
    });

    /**
     * Collection of standards for the current type
     */
    standardModule.nodesCollection = Backbone.Collection.extend({
        model: standardModule.nodesModel,
        //    	url: '/media/standard/js/models/children.json'
        url: util.getApiUrl('flx/get/standards') // if need to remove dependancy on util, add / in beginning to url
    });

    //return the module
    return standardModule;
});
