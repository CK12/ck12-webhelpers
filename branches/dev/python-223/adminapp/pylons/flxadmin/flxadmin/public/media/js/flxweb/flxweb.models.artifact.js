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

var Artifact = Backbone.Model.extend({
    initialize : function(artifact_json) {
        if(!artifact_json) {
            throw "InvalidConstructorArgs";
        }
        this.bind("change",function(){
            this.dirty = true;
            //this.set({'dirty':true},{'silent':true});
        });
        if (artifact_json.__dirty){
            this.dirty = true;
        }
    },
    urlRoot : $.flxweb.settings.artifact_data_endpoint,
    dirty: false,
    url : function() {
        /**
         * Artifact.url
         * returns REST endpoint URL.
         * Used internally by backbone .
         */
        var url = this.urlRoot;
        if(this.has('id')) {
            url += this.get('id') + '/';
        } else if(this.has('perma')) {
            url += this.get('perma');
        }
        return url;
    },
    hasChildren : function() {
        if(this.has('children')) {
            if(this.get('children').length > 0) {
                return true;
            }
        }
        return false;
    },
    getChildren : function() {
        var children_list = [];
        if(this.hasChildren()) {
            var children = this.get('children');
            for (var i = 0; i < children.length; i++){
                var child = children[i];
                if ("object" == typeof child){
                    var child_obj = new Artifact(child);
                    children_list.push(child_obj);
                }
            }
        }
        return children_list;
    },
    getChildById : function(id){
        if (this.hasChildren()){
            var children = this.getChildren();
            for (var i = 0; i<children.length; i++){
                if (children[i].get('id') == id){
                    return children[i];
                }
            }
        }
    },
    setChildren: function(children) {
        var children_list = [];
        for (var i = 0; i<children.length; i++){
            var child_json = children[i].toJSON();
            if (children[i].dirty){
                child_json.__dirty = true;
            }
            children_list.push( child_json );
        }
        this.set({'children':children_list});
    },
    replaceChild:function(id, new_obj){
        var _children = this.getChildren();
        for (var i = 0;i<_children.length;i++){
            if ( _children[i].get('id') == id ){
                _children[i] = new_obj;
                break;
            }
        }
        this.setChildren(_children);
    },
    isDirty:function(){
        return !(!( this.dirty ));
    },
    _modify_metadata: function(value, type, action){
        if (!value || !type || !action){
            return false;
        }
        //marks a metadata value of a specific type for addition/deletion
        var _m, _a, _ma, _mat, _matl, _matv, i;
        //get existing metadata
        _m = this.get('changed_metadata') || {};
        _a = action;
        
        //if same value is present for reverse action
        _a = (_a == 'add')?'remove':'add';
        _ma = _m[_a];
        if (_ma){
            _mat = _ma[type];
            if (_mat){
                _matl = _mat.length;
                for (i=0;i<_matl;i++){
                    _matv = _mat[i];
                    if(_matv == value){
                        _mat.splice(i,1); //remove it
                        break;
                    }
                }
            }
        }
        
        
        if (i < _matl){ 
            this.set({'changed_metadata':_m});
            return true;
        }
        
        _a = (_a == 'add')?'remove':'add';
        //pick appropriate array to update < metadata[action][type] >
        _ma = _m[_a];
        if (!_ma){
            _ma = _m[_a] = {};
        }
        _mat = _ma[type];
        if (!_mat){
            _mat = _ma[type] = [];
        }
        //push value to the array only if it's not already there
        _matl = _mat.length;
        for (i = 0; i<_matl; i++){
            _matv = _mat[i];
            if (_matv == value){
                break;
            }
        }
        if (i == _matl){
            _mat.push(value);
            this.set({'changed_metadata':_m});
            return true;
        }
        
        return false;
    },
    _has_new_metadata: function(meta_type, action, meta_value){
        var a, l, i, v;
        a = this.get('changed_metadata');
        if (a){
            a = (action == 'remove')? a.remove : a.add;
            if (a){
                a = a[meta_type];
                if (a){
                    l = a.length;
                    for (i = 0; i < l ; i++){
                        v = ''+a[i];
                        if (v.toString().toLowerCase() == meta_value.toString().toLowerCase()){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    },
    _metadata_in_grid: function(grid, meta_value){
        var i, l, a, v;
        meta_value = ''+meta_value;
        a = this.get(grid);
        if (!a){
            return false;
        }
        l = a.length;
        for (i=0;i<l;i++){
            v = a[i];
            if (  (''+v[1]).toLowerCase() == meta_value.toLowerCase() ){
                return true;
            }
        }
        return false;
    },
    addTag: function(tag){
        if (this.hasTag(tag)){
            return false;
        }
        return this._modify_metadata(tag, 'tag', 'add');
    },
    removeTag: function(tag){
        return this._modify_metadata(tag, 'tag', 'remove');
    },
    hasTag: function(tag){
        return (this._metadata_in_grid('tagGrid', tag) || this._has_new_metadata('tag', 'add', tag)) && !this._has_new_metadata('tag', 'remove', tag);
    },
    setLevel: function(level){
        var current_level = this.getLevel();
        this._modify_metadata(current_level, 'level', 'remove');
        this._modify_metadata(level, 'level', 'add');
        this.set({'level': level});
    },
    getLevel: function(){
        return this.get('level');
    },
    addGrade: function(grade){
        if (this.hasGrade(grade)){
            return false;
        }
        return this._modify_metadata(grade, 'grade level', 'add');
    },
    removeGrade: function(grade){
        this._modify_metadata(grade, 'grade level', 'remove');
    },
    hasGrade: function(grade){
        return (this._metadata_in_grid('gradeGrid', grade) || this._has_new_metadata('grade level', 'add', grade)) && !this._has_new_metadata('grade level', 'remove', grade);
    },
    hasState: function(statecode){
        return (this._metadata_in_grid('stateGrid', statecode) || this._has_new_metadata('state', 'add', statecode)) && !this._has_new_metadata('state', 'remove', statecode);
    },
    addState: function(statecode){
        if (this.hasState(statecode)){
            return false;
        }
        return this._modify_metadata(statecode, 'state', 'add');
    },
    removeState: function(statecode){
        return this._modify_metadata(statecode, 'state', 'remove');
    },
    hasSubject: function(subject){
        return (this._metadata_in_grid('subjectGrid', subject) || this._has_new_metadata('subject', 'add', subject)) && !this._has_new_metadata('subject', 'remove', subject);
    },
    addSubject: function(subject){
        if (this.hasSubject(subject)){
            return false;
        }
        return this._modify_metadata(subject, 'subject', 'add');
    },
    removeSubject: function(subject){
        return this._modify_metadata(subject, 'subject', 'remove');
    },
    hasAttribution: function(name, role){
        var _attr, l, i, a;
        _attr = this.get('authors') || [];
        l = _attr.length;
        for (i=0;i<l;i++){
            a = _attr[i];
            if (a.name == name && a.role == role){
                return true;
            }
        }
        return false;
    },
    addAttribution: function(name, role){
        if (this.hasAttribution(name, role)){
            return false;
        }
        var _attr = this.get('authors') || [];
        _attr.push({
            'name': name,
            'role': role
        });
        this.set({'authors': _attr});
        return true;
    },
    removeAttribution: function(name, role){
        var _attr, l, i, a;
        _attr = this.get('authors') || [];
        l = _attr.length;
        for (i = 0; i<l; i++){
            a = _attr[i];
            if (a.name == name && a.role == role){
                _attr.splice(i,1);
                break;
            }
        }
        if (i<l){
            this.set({'authors': _attr});
            return true;
        }
        return false;
    }
}, {
    //Static properties/methods for Artifact model
    
    BOOK_TYPES : ['book','tebook','workbook','studyguide','labkit'],
    isBookType : function( artifactType ){
        /**
         * Artifact.isBookType( artifactType )
         * returns true if artifactType is present in Artifact.BOOK_TYPES
         */
        var i = Artifact.BOOK_TYPES.length;
        while (i--){
            if ( artifactType ==  Artifact.BOOK_TYPES[i] ){
                return true;
            }
        }
        return false;
    }
});
var FlexBook = Artifact.extend({

});
var Chapter = Artifact.extend({});
var Lesson = Artifact.extend({});
var Section = Artifact.extend({});
var Concept = Artifact.extend({});

function toArtifact(obj){
    var type = obj['artifactType']; 
    if (type){
        switch(type){
            case 'book':
            case 'tebook': 
            case 'workbook':
            case 'studyguide':
            case 'labkit':
                return new FlexBook(obj);
            case 'chapter' : 
                return new Chapter(obj);
            case 'lesson'  : 
                return new Lesson(obj);
            case 'section' : 
                return new Section(obj);
            case 'concept' : 
                return new Concept(obj);
            default: return new Artifact(obj);
        }
    }
}
