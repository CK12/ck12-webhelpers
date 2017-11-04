/**
 * Copyright 2007-2011 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Kenneth M. Sternberg
 *
 * $ID$
 */

define('flxweb.concept_models', 
       ['jquery', 'underscore', 'backbone', 'flxweb.global', 'flxweb.settings'],

function ($, _, Backbone, Global){
    
    var Concept, ConceptMap;

    Concept = Backbone.Model.extend({
        get_children: function() {
            var _this = this;
            return _.map(this.get('children'), function(c) {
                return _this.collection.get(c);
            });
        }
    });

    ConceptCollection = Backbone.Collection.extend({
        model: Concept,

        comparator: false,

        initialize: function(models, options) {
            this.eid = options.eid;
            this.url = '/ajax/browse/' + this.eid;
            this.label = options.label;
            this.status = null;
            this.bind('error', this.errorHandler);
        },

        errorHandler: function(obj, xhr) {
            return this.status = xhr.status;
        },

        fetch: function() {
            this.trigger('fetching');
            return Backbone.Collection.prototype.fetch.apply(this, arguments);
        },

        getRoot: function() {
            return this.find(function(c) {
                return c.get('root');
            });
        },

        parse: function(resp, xhr) {
            this.status = xhr.status;
            this.name = resp.name;
            this.handle = resp.handle;
            this.image_src = resp.previewImageUrl;
            return resp.children;
        }
    });

    return {
        ConceptCollection: ConceptCollection,
        Concept: Concept
    };

});
