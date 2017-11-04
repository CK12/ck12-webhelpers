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
 * This file originally written by Ravi Gidwani
 *
 * $id$
 */
define('flxweb.groups.models', ['backbone'], function(Backbone) {
    'use strict';
    var GroupsModule = {};

    /**
     * Group model to hold the group objects
     */
    GroupsModule.Group = Backbone.Model.extend({
        initialize: function() {}
    });

    /**
     * Collection of groups user belongs to.
     */
    GroupsModule.MyGroups = Backbone.Collection.extend({
        model: GroupsModule.Group,
        url: function() {
            return '/flx/group/my?filters=permission,share&pageSize=5&pageNum=' + this.pageNum;
        }
    });

    //return the module
    return GroupsModule;
});
