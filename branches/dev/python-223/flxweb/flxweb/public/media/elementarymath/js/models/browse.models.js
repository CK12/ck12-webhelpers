define(['backbone', 'common/utils/utils'], function (Backbone, util) {
    'use strict';
    var browseModule = {};

    /**
     * Browse model to hold the browseTerms
     */
    browseModule.browse = Backbone.Model.extend({});

    /**
     * Collection of browseTerms for the grade.
     */
    browseModule.browseTerm = Backbone.Collection.extend({
        model: browseModule.browse,
        url: function () {
            return util.getApiUrl('taxonomy/collection/collectionHandle=elementary-math-grade-' +
               this.grade +
               '&collectionCreatorID=3?includeRelations=true&includeTaxonomyComposistionsInfo=false&maxRelationDepth=4');
            //return util.getApiUrl('taxonomy/get/info/descendants/concepts/' + this.eID + '/3');
        },
        fetch: function () {
            util.ajaxStart(true);
            return Backbone.Collection.prototype.fetch.apply(this, arguments);
        },
        parse: function (result) {
            if (result.hasOwnProperty('response')) {
                result = result.response;
                if (result.hasOwnProperty('message')) {
                    result = false;
                } else if (result.hasOwnProperty('collection') && result.collection.hasOwnProperty('contains')) {
                    result = result.collection.contains;
                //    } else if (result.hasOwnProperty('branch') && result.branch.hasOwnProperty('children')) {
                //      result = result.branch.children;
                    if (!(result && result instanceof Array && 0 !== result.length)) {
                        result = false;
                    }
                } else {
                    result = false;
                }
            } else {
                result = false;
            }
            util.ajaxStop(true);
            return result;
        }
    });

    //return the module
    return browseModule;
});
