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
 * This file originally written by Nachiket Karve
 *
 * $Id$
 */
define('flxweb.models.artifact', ['underscore', 'backbone', 'jquery', 'common/utils/utils', 'flxwebSaveAdaptor', 'jquery-ui', 'flxweb.global'],
    function (_, Backbone, $, Utils, flxwebSaveAdaptor) {
        'use strict';

        var NOSYNC_ATTRIBUTES = ['artifactXHTML', 'exerciseCount', 'extendedArtifacts', 'extendedArtifactsCount', 'feedbacks', 'modality',
                                 'modality_display_label', 'modality_group', 'resourceCounts', 'revisionInLibrary', 'xhtml_prime'];


        var ArtifactSync = function(method, model, options) {
            options.beforeSend = function (xhr) {
                if (this.type === 'PUT' || this.type === 'POST') {
                    this.data = Utils.b64EncodeUnicode(this.data);
                    this.contentType = 'text/plain';
                    xhr.setRequestHeader( 'Content-type', 'text/plain' );
                }
            };
            return Backbone.sync(method, model, options);
        };

        var Artifact = Backbone.Model.extend({
                initialize: function (artifact_json) {
                    if (!artifact_json) {
                        throw 'InvalidConstructorArgs';
                    }
                    this.bind('change', function () {
                        this.dirty = true;
                        //this.set({'dirty':true},{'silent':true});
                    });
                    if (artifact_json.__dirty) {
                        this.dirty = true;
                    }
                    if( !this.get('collections')){
                      this.set('collections', [])
                    }
                    this.getDomains();
                },
                urlRoot: $.flxweb.settings.artifact_data_endpoint,
                dirty: false,
                sync: ArtifactSync,
                url: function () {
                    /**
                     * Artifact.url
                     * returns REST endpoint URL.
                     * Used internally by backbone .
                     */
                    var url = this.urlRoot;
                    if (this.has('id')) {
                        url += this.get('id') + '/';
                    } else if (this.has('perma')) {
                        url += this.get('perma');
                    }
                    return url;
                },
                toJSON: function () {
                    // [Bug 39263] remove certain repeating or unnecessary keys before save
                    var keys, json = Backbone.Model.prototype.toJSON.call(this);
                    keys = _.keys(json);
                    keys = _.filter(keys, function (k) {
                        return !_.contains(NOSYNC_ATTRIBUTES, k);
                    });

                    return _.pick(json, keys);
                },
                formSaveAPIRequest : function(){
                  var json = Backbone.Model.prototype.toJSON.call(this);
                  return flxwebSaveAdaptor.saveAdaptor(json);
                },
                hasChildren: function () {
                    if (this.has('children')) {
                        if (this.get('children').length > 0) {
                            return true;
                        }
                    }
                    return false;
                },

                getChildren: function () {
                    if (this.hasChildren()) {
                        var i, child, children_list = [],
                            children = this.get('children');
                        for (i = 0; i < children.length; i++) {
                            child = children[i];
                            if ('object' === typeof child) {
                                children_list.push(new Artifact(child));
                            }
                        }
                        return children_list;
                    }
                    return [];
                },
                getChildById: function (id) {
                    if (this.hasChildren()) {
                        var i, children = this.getChildren();
                        for (i = 0; i < children.length; i++) {
                            if (children[i].get('id').toString() === id.toString()) {
                                return children[i];
                            }
                        }
                    }
                },
                setChildren: function (children) {
                    var i, child_json, children_list = [];
                    for (i = 0; i < children.length; i++) {
                        child_json = children[i].toJSON();
                        if (children[i].dirty) {
                            child_json.__dirty = true;
                        }
                        children_list.push(child_json);
                    }
                    this.set({
                        'children': children_list
                    });
                },
                replaceChild: function (id, new_obj) {
                    var i, _children = this.getChildren();
                    for (i = 0; i < _children.length; i++) {
                        if (_children[i].get('id').toString() === id.toString()) {
                            _children[i] = new_obj;
                            break;
                        }
                    }
                    this.setChildren(_children);
                },
                isDirty: function () {
                    return !!this.dirty;
                },
                _modify_metadata: function (value, type, action, noClone) {
                    if (!value || !type || !action) {
                        return false;
                    }
                    // ADDED BY @Pratyush : forChangeFields added as a meta data for new API to understand what all fields changed
                    var forChangeFields  =  this.get('forChangeFields') || {};
                    forChangeFields[type] = true;
                    this.set({'forChangeFields': forChangeFields}, { silent:true});

                    //marks a metadata value of a specific type for addition/deletion
                    var _m, _a, _ma, _mat, _matl, _matv, i;
                    //get existing metadata

                    if (!noClone) {
                        // clone to ensure "change" is fired on the model
                        _m = JSON.parse(JSON.stringify(this.get('changed_metadata') || {}));
                    } else {
                        _m = this.get('changed_metadata') || {};
                    }
                    _a = action;

                    //if same value is present for reverse action
                    _a = (_a === 'add') ? 'remove' : 'add';
                    _ma = _m[_a];
                    if (_ma) {
                        _mat = _ma[type];
                        if (_mat) {
                            _matl = _mat.length;
                            for (i = 0; i < _matl; i++) {
                                _matv = _mat[i];
                                if (_matv === value) {
                                    _mat.splice(i, 1); //remove it
                                    break;
                                }
                            }
                        }
                    }


                    if (i < _matl) {
                        this.set({
                            'changed_metadata': _m
                        });
                        return true;
                    }

                    _a = (_a === 'add') ? 'remove' : 'add';
                    //pick appropriate array to update < metadata[action][type] >
                    _ma = _m[_a];
                    if (!_ma) {
                        _ma = _m[_a] = {};
                    }
                    _mat = _ma[type];
                    if (!_mat) {
                        _mat = _ma[type] = [];
                    }
                    //push value to the array only if it's not already there
                    _matl = _mat.length;
                    for (i = 0; i < _matl; i++) {
                        _matv = _mat[i];
                        if (_matv === value) {
                            break;
                        }
                    }
                    if (i === _matl) {
                        _mat.push(value);
                        this.set({
                            'changed_metadata': _m
                        });
                        return true;
                    }

                    return false;
                },
                _has_new_metadata: function (meta_type, action, meta_value) {
                    var a, l, i, v;
                    a = this.get('changed_metadata');
                    if (a) {
                        a = (action === 'remove') ? a.remove : a.add;
                        if (a) {
                            a = a[meta_type];
                            if (a) {
                                l = a.length;
                                for (i = 0; i < l; i++) {
                                    v = a[i].toString();
                                    if (v.toString().toLowerCase() === meta_value.toString().toLowerCase()) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    return false;
                },
                _metadata_in_grid: function (grid, meta_value) {
                    var i, l, a, v;
                    a = this.get(grid);
                    if (!a) {
                        return false;
                    }
                    l = a.length;
                    for (i = 0; i < l; i++) {
                        v = a[i];
                        if (v[1].toString().toLowerCase() === meta_value.toString().toLowerCase()) {
                            return true;
                        }
                    }
                    return false;
                },
                _get_metadata: function (grid, meta_type, meta_value) {
                    var i, l, a, v;
                    a = this.get(grid);
                    if (a) {
                        l = a.length;
                        for (i = 0; i < l; i++) {
                            v = a[i];
                            if (v[1].toString().toLowerCase() === meta_value.toString().toLowerCase()) {
                                return v[1].toString();
                            }
                        }
                    }
                    a = this.get('changed_metadata');
                    if (a) {
                        a = a.add;
                        if (a) {
                            a = a[meta_type];
                            if (a) {
                                l = a.length;
                                for (i = 0; i < l; i++) {
                                    v = a[i].toString();
                                    if (v.toString().toLowerCase() === meta_value.toString().toLowerCase()) {
                                        return v.toString();
                                    }
                                }
                            }
                        }
                    }
                    return '';
                },
                addTag: function (tag) {
                    if (this.hasTag(tag)) {
                        return false;
                    }
                    return this._modify_metadata(tag, 'tag', 'add');
                },
                removeTag: function (tag) {
                    return this._modify_metadata(tag, 'tag', 'remove');
                },
                hasTag: function (tag) {
                    return (this._metadata_in_grid('tagGrid', tag) || this._has_new_metadata('tag', 'add', tag)) && !this._has_new_metadata('tag', 'remove', tag);
                },
                getTag: function (tag) {
                    return this._get_metadata('tagGrid', 'tag', tag);
                },
                addSearchKeyword: function (keyword) {
                    if (this.hasSearchKeyword(keyword)) {
                        return false;
                    }
                    return this._modify_metadata(keyword, 'search', 'add');
                },
                removeSearchKeyword: function (keyword) {
                    return this._modify_metadata(keyword, 'search', 'remove');
                },
                hasSearchKeyword: function (keyword) {
                    return (this._metadata_in_grid('searchGrid', keyword) || this._has_new_metadata('search', 'add', keyword)) && !this._has_new_metadata('search', 'remove', keyword);
                },
                getSearchKeyword: function (keyword) {
                    return this._get_metadata('searchGrid', 'search', keyword);
                },
                setLevel: function (level) {
                    var current_level = this.getLevel();
                    this._modify_metadata(current_level, 'level', 'remove', true);
                    this._modify_metadata(level, 'level', 'add', true);
                    this.set({
                        'level': level
                    });
                },
                getLevel: function () {
                    return this.get('level');
                },
                addGrade: function (grade) {
                    if (this.hasGrade(grade)) {
                        return false;
                    }
                    return this._modify_metadata(grade, 'grade level', 'add');
                },
                removeGrade: function (grade) {
                    this._modify_metadata(grade, 'grade level', 'remove');
                },
                hasGrade: function (grade) {
                    return (this._metadata_in_grid('gradeGrid', grade) || this._has_new_metadata('grade level', 'add', grade)) && !this._has_new_metadata('grade level', 'remove', grade);
                },
                hasState: function (statecode) {
                    return (this._metadata_in_grid('stateGrid', statecode) || this._has_new_metadata('state', 'add', statecode)) && !this._has_new_metadata('state', 'remove', statecode);
                },
                addState: function (statecode) {
                    if (this.hasState(statecode)) {
                        return false;
                    }
                    return this._modify_metadata(statecode, 'state', 'add');
                },
                removeState: function (statecode) {
                    return this._modify_metadata(statecode, 'state', 'remove');
                },
                hasSubject: function (subject) {
                    return (this._metadata_in_grid('subjectGrid', subject) || this._has_new_metadata('subject', 'add', subject)) && !this._has_new_metadata('subject', 'remove', subject);
                },
                addSubject: function (subject) {
                    if (this.hasSubject(subject)) {
                        return false;
                    }
                    return this._modify_metadata(subject, 'subject', 'add');
                },
                removeSubject: function (subject) {
                    return this._modify_metadata(subject, 'subject', 'remove');
                },
                hasAttribution: function (name, role) {
                    var _attr, l, i, a;
                    _attr = this.get('authors') || [];
                    l = _attr.length;
                    for (i = 0; i < l; i++) {
                        a = _attr[i];
                        if (a.name.toLowerCase() === name.toLowerCase() && a.role === role) {
                            return true;
                        }
                    }
                    return false;
                },
                addAttribution: function (name, role) {
                    if (this.hasAttribution(name, role)) {
                        return false;
                    }
                    var _attr = _.clone(this.get('authors') || []);
                    _attr.push({
                        'name': name,
                        'role': role
                    });
                    // ADDED BY @Pratyush : forChangeFields added as a meta data for new API to understand what all fields changed
                    var forChangeFields  =  this.get('forChangeFields') || {};
                    forChangeFields['authors'] = true;

                    this.set({
                        'authors': _attr,
                        forChangeFields : forChangeFields
                    });
                    return true;
                },
                removeAttribution: function (name, role) {
                    var _attr, l, i, a;
                    _attr = this.get('authors') || [];
                    l = _attr.length;
                    for (i = 0; i < l; i++) {
                        a = _attr[i];
                        if (a.name === name && a.role === role) {
                            _attr.splice(i, 1);
                            break;
                        }
                    }
                    if (i < l) {
                        // ADDED BY @Pratyush : forChangeFields added as a meta data for new API to understand what all fields changed
                        var forChangeFields  =  this.get('forChangeFields') || {};
                        forChangeFields['authors'] = true;

                        this.set({
                            'authors': _attr,
                            forChangeFields : forChangeFields
                        });
                        return true;
                    }
                    return false;
                },
                isCollectionDuplicate : function( collectionObj ){

                    if( !collectionObj) return !collectionObj;

                    if( !collectionObj.collectionCreatorID ||
                        !(( collectionObj.collectionHandle &&
                          collectionObj.conceptCollectionAbsoluteHandle
                        ) ||
                          collectionObj.conceptCollectionHandle
                        )
                     ){
                       return true;
                     }

                    var currentCollection = this.get('collections');
                    var self = this;
                    return currentCollection.filter(function( collection ){
                        return self.isSameCollection(collection, collectionObj )
                    }).length > 0;
                },
                isSameCollection : function( collection1, collection2 ){

                  if( (collection1.collectionCreatorID != collection2.collectionCreatorID)  &&
                      ( typeof collection1.collectionCreatorID !=  'undefined' && typeof collection2.collectionCreatorID !=  'undefined'  )
                  ){
                    return false;
                  }

                    this.getConceptCollectionHandle( collection1);
                    this.getConceptCollectionHandle( collection2);

                    if( collection1.conceptCollectionHandle && collection2.conceptCollectionHandle ){
                        return collection1.conceptCollectionHandle == collection2.conceptCollectionHandle;
                    }

                    if( (collection1.encodedID == collection2.encodedID ) &&
                        (typeof collection1.encodedID != 'undefined')  ){
                      return true;
                    }

                    return false;
                },
                getConceptCollectionHandle : function( collection ){

                  if( collection.conceptCollectionHandle){
                      collection.conceptCollectionHandle = collection.conceptCollectionHandle.toLowerCase()
                  }else if( collection.collectionHandle &&
                      collection.conceptCollectionAbsoluteHandle){
                      collection.conceptCollectionHandle  =  (collection.collectionHandle).toLowerCase() + "-::-"+ (collection.conceptCollectionAbsoluteHandle).toLowerCase();
                  }

                },
                addCollection : function( collectionObj ){
                    // TODO integration with search api
                    if( !this.isCollectionDuplicate( collectionObj )){
                      var forChangeFields  =  this.get('forChangeFields') || {};
                      forChangeFields['collections'] = true;

                      var currentCollection = this.get('collections');

                      this.getConceptCollectionHandle( collectionObj );

                      var deltaCollection = {
                        collectionCreatorID : collectionObj.collectionCreatorID,
                        conceptCollectionHandle : collectionObj.conceptCollectionHandle,
                        conceptCollectionTitle : collectionObj.conceptCollectionTitle,
                        collectionTitle : collectionObj.collectionTitle,
                        encodedID : collectionObj.encodedID,
                        conceptCollectionAbsoluteHandle : collectionObj.conceptCollectionAbsoluteHandle,
                        collectionHandle : collectionObj.collectionHandle
                      }
                      var newCollection =  currentCollection.concat([deltaCollection]);
                      this.set({
                        collections : newCollection,
                        forChangeFields : forChangeFields
                      })
                    }
                },
                replaceCollection : function( collectionCreatorID, conceptCollectionHandle, encodedID ){
                    if( !collectionCreatorID  || !conceptCollectionHandle ){
                        return ;
                    }

                   var forChangeFields  =  this.get('forChangeFields') || {};
                   forChangeFields['collections'] = true;

                  //override existing collections list if it is
                  // 1. customization of modality
                  // 2. Creation of new Modality
                  var currentCollection =  this.get('collections');
                  var self =  this;
                  var replacedCollection  =  currentCollection.filter(function(collection){
                        return self.isSameCollection( collection ,
                          {
                            collectionCreatorID: collectionCreatorID,
                            conceptCollectionHandle: conceptCollectionHandle,
                            encodedID : encodedID
                          })
                  })
                  if( replacedCollection.length == 0 ){
                    replacedCollection.push({
                                      collectionCreatorID : collectionCreatorID,
                                      conceptCollectionHandle : conceptCollectionHandle,
                                      encodedID : encodedID
                                    })
                  }else{
                    replacedCollection = replacedCollection.map(function(collection){
                      return {
                        collectionCreatorID : collection.collectionCreatorID,
                        conceptCollectionHandle : collection.conceptCollectionHandle || (collection.collectionHandle + "-::-"+ collection.conceptCollectionAbsoluteHandle),
                        conceptCollectionTitle : collection.conceptCollectionTitle,
                        collectionTitle : collection.collectionTitle,
                        encodedID : collection.encodedID,
                        conceptCollectionAbsoluteHandle : collection.conceptCollectionAbsoluteHandle,
                        collectionHandle : collection.collectionHandle
                      }
                    })
                  }

                  this.set({
                      collections : replacedCollection,
                      forChangeFields : forChangeFields
                  });
                },

                removeCollection : function( collectionObj ){
                  if( this.get('collections').length > 1 ){
                    var forChangeFields  =  this.get('forChangeFields') || {};
                    forChangeFields['collections'] = true;

                    var currentCollection = this.get('collections');

                    this.getConceptCollectionHandle( collectionObj )
                    var self = this;
                    currentCollection =  currentCollection.filter(
                                          function( collection ){
                                            return !self.isSameCollection( collection, collectionObj)
                                          })
                    this.set({
                      collections : currentCollection,
                      forChangeFields : forChangeFields
                    })
                  }
                },
                addDomain: function (domain) {
                    var _domains = _.clone(this.getDomains() || []);
                    /*l = _domains.length;
                    for(i=0; i<l; i++) {
                        d = _domains[i];
                        d['action'] = 'remove';
                    }*/
                    _domains.push(domain);
                    // ADDED BY @Pratyush : forChangeFields added as a meta data for new API to understand what all fields changed
                    var forChangeFields  =  this.get('forChangeFields') || {};
                    forChangeFields['domains'] = true;

                    this.set({
                        'domains': _domains,
                        forChangeFields : forChangeFields
                    });
                    return true;
                },
                getDomains: function () {
                    if (this.get('domains')) {
                        return this.get('domains');
                    }
                    var l, i, d, foundationGrid, _domains = [];
                    foundationGrid = this.get('foundationGrid');
                    if (foundationGrid) {
                        l = foundationGrid.length;
                        for (i = 0; i < l; i++) {
                            d = foundationGrid[i];
                            _domains.push({
                                'encodedid': d[2],
                                'browseTerm': d[1],
                                'action': 'add'
                            });
                        }
                        this.set({
                            'domains': _domains
                        }, {
                            'silent': true
                        });
                        return this.get('domains');
                    }
                    return null;
                },
                removeDomain: function (domain) {
                    try {
                        var _domains, i, d;
                        _domains = _.clone(this.getDomains() || []);
                        // ADDED BY @Pratyush : forChangeFields added as a meta data for new API to understand what all fields changed
                        var forChangeFields  =  this.get('forChangeFields') || {};
                        forChangeFields['domains'] = true;
                        this.set({forChangeFields:forChangeFields});

                        for (i = 0; i < _domains.length; i++) {
                            d = _domains[i];
                            if (domain.encodedid === d.encodedid) {
                                d.action = 'remove';
                                _domains.splice(i, 1);
                                i--;
                            }
                        }
                    } catch (e) {
                        console.log(e + ' remove domain error');
                    }
                },

                isDomainDuplicate: function (domain) {
                    var _domains, l, i, d;
                    _domains = this.getDomains() || [];
                    l = _domains.length;
                    for (i = 0; i < l; i++) {
                        d = _domains[i];
                        if (domain.encodedid === d.encodedid && d.action !== 'remove') {
                            return true;
                        }
                    }

                    return false;
                },

                isLastNode: function () {
                    var _domains, l, i, d, c;
                    _domains = this.getDomains() || [];
                    l = _domains.length;
                    c = 0;
                    for (i = 0; i < l; i++) {
                        d = _domains[i];
                        if (d.action === 'add') {
                            c++;
                        }
                    }
                    if (c <= 1) {
                        return true;
                    }
                    return false;
                }

            },


            {
                //Static properties/methods for Artifact model

                BOOK_TYPES: ['book', 'tebook', 'workbook', 'studyguide', 'labkit', 'quizbook'],
                isBookType: function (artifactType) {
                    /**
                     * Artifact.isBookType( artifactType )
                     * returns true if artifactType is present in Artifact.BOOK_TYPES
                     */
                    var i = Artifact.BOOK_TYPES.length;
                    while (i--) {
                        if (artifactType === Artifact.BOOK_TYPES[i]) {
                            return true;
                        }
                    }
                    return false;
                },

                htmlEscapArtifactTitle: function (artifactTitle) {
                    artifactTitle = artifactTitle.replace(/(\r\n|\n|\r)/gm, ' ');
                    var display_title = artifactTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return {
                        'artifact_title': artifactTitle,
                        'display_title': display_title
                    };
                },

                is_new: function (self) {
                    // Returns true if the artifact is a new i.e a non persisted artifact
                    var str, regexp, isNew;
                    if (self.id) {
                        str = 'new';
                        regexp = new RegExp('^' + str, 'gi');
                        isNew = regexp.test(self.id);
                        return isNew;
                    }
                    return true;
                },

                getRevisions: function (self) {

                    var revision, revisions_list = [];
                    if (self.revisions) {
                        for (revision = 0; revision < self.revisions.length; revision++) {
                            revisions_list.push(self.revisions[revision]);
                        }
                        return revisions_list;
                    }
                },

                getVersionNumber: function (self) {

                    var version = self.revision;
                    if (!version && this.getRevisions(self)) {
                        version = this.getRevisions(self)[0].revision;
                    }
                    return version;
                },

                getRevision: function (self) {
                    var current_revision, revision;
                    current_revision = this.getVersionNumber(self);
                    if (current_revision > 0 && this.getRevisions(self)) {
                        for (revision in this.getRevisions(self)) {
                            if (this.getRevisions(self).hasOwnProperty(revision)) {
                                if (revision.revision === current_revision) {
                                    return revision;
                                }
                            }
                        }
                    } else {
                        return null;
                    }
                },

                getLatestVersionNumber: function (self) {

                    var revision;
                    if (self.latestRevision) {
                        return self.latestRevision;
                    }
                    revision = this.getRevision(self);
                    if (revision && revision.latestRevision) {
                        return revision.latestRevision;
                    }
                },

                is_latest: function (self) {
                    var rev, current_version, latest_version;
                    try {
                        current_version = parseInt(this.getVersionNumber(self), 10);
                        latest_version = parseInt(this.getLatestVersionNumber(self), 10);
                        return current_version === latest_version;
                    } catch (err) {
                        rev = this.getRevision(self);
                        if (rev && rev.isLatest) {
                            return rev.isLatest;
                        }
                    }
                },
                get_authors_by_role: function (self) {
                    var i, author, author_role,
                        authors_by_role = {},
                        authors = self.get('authors');
                    if (authors) {
                        for (i = 0; i < authors.length; i++) {
                            author = authors[i];
                            author_role = author.role;
                            if (!(authors_by_role.hasOwnProperty(author_role))) {
                                authors_by_role[author_role] = [];
                            }
                            authors_by_role[author_role].push(author.name);
                        }
                    }
                    return authors_by_role;
                },
                getMyCollaborativeFlexBookIDs: function(){
                    var _d = $.Deferred();
                    Utils.ajax({
                        url: Utils.getApiUrl('flx/get/mylib/info/book,tebook,workbook,labkit,quizbook/collaboration'),
                        data: {
                            ownership:'all',
                            pageSize:100
                        },
                        localCache: {
                            ttl: 15,
                            namespace:'collabBooks'
                        }
                    }).done(function(data){
                        if (data && data.response && data.response.artifacts){
                            _d.resolve(data.response.artifacts.map(function(a){ return a.artifactID; }));
                        } else {
                            _d.resolve([]);
                        }
                    }).fail(function(){
                        _d.resolve([]);
                    });
                    return _d.promise();
                },
                checkIfbookInCollaborationLibrary: function(bookID){
                    var _d = $.Deferred();
                    if(Utils.getQueryParam('collaboration', window.location.href) === 'true'){
                        _d.resolve(true);
                    } else {
                        Artifact.getMyCollaborativeFlexBookIDs().done(function(artifactIDs){
                            if (artifactIDs.length){
                                _d.resolve(_.contains(artifactIDs, bookID));
                            } else {
                                _d.resolve(false);
                            }
                        }).fail(function(){_d.resolve(false);});
                    }
                    return _d.promise();
                }
            });

        return Artifact;

    });
