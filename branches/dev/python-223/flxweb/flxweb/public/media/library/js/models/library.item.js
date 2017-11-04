define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    "use strict";
    var LibraryItem = Backbone.Model.extend({
        initialize: function() {
        },
        getDetailsURL: function() {
            var url = "/",
                realm = this.get('realm'),
                artifactType = this.get('artifactType'),
                handle = this.get('handle'),
                revision = this.get('revision'),
                domain = this.get('domain'),
                currentUser = this.get('currentUser'),
                hasDomainCollectionContext =  this.get('domainCollectionContexts') && this.get('domainCollectionContexts').length > 0,
                collaboration = false,
                index, labels;

            if ( _(LibraryItem.book_types).contains(this.get('artifactType')) || this.get('artifactType') === 'section' || !domain || !domain.branch ){
                if (realm) {
                    url += realm + "/";
                }
                url += artifactType + "/" + handle;
            } else {
                if (domain.branch === "UBR"){
                    url += 'na/';
                } else {
                    url += domain.branchInfo.handle.toLowerCase() + '/';
                }
                url += domain.handle + '/';
                url += artifactType + '/';
                if (realm){
                    url += realm + "/";
                }
                url += handle;
            }
            labels = this.getLabels();
            for (var index = 0; index < labels.length; index++) {
                if (labels[index].label === 'Collaboration') {
                    collaboration = true;
                    break;
                }
            }
            if ((currentUser.id !== this.get('creator').id)  && !collaboration) {
                url+= "/r" + revision;
            }
            if( hasDomainCollectionContext ){
                var domainCollectionContexts = this.get('domainCollectionContexts');
                if(domainCollectionContexts){
                    var collections = domainCollectionContexts.filter(function(domainCollectionContext){
                        return domainCollectionContext.collectionContext;
                    });
                    var owner = this.get('creator');
                    if(collections.length > 0){
                        var collection = collections[0],
                        collectionHandle = collection.collectionContext.collectionHandle,
                        conceptCollectionAbsoluteHandle = collection.collectionContext.conceptCollectionAbsoluteHandle,
                        modalityType = artifactType,
                        url = '/c/' + collectionHandle + '/' + conceptCollectionAbsoluteHandle + '/' + modalityType + '/' + (owner.id === 3? '': 'user:'+owner.login) + '/' + handle;

                    }else{
                        var domains = domainCollectionContexts.filter(function(domainCollectionContext){
                            return domainCollectionContext.domain;
                        });
                        if(domains.length > 0){
                            var domainInCollection = domains[0].domain;
                            if(domainInCollection.type && domainInCollection.type.name === 'pseudodomain'){
                                url = '/na/' + domainInCollection.handle + '/' + artifactType + '/' + (owner.id === 3? '': 'user:'+owner.login) + '/' + handle;
                            }else if(domainInCollection.branch && domainInCollection.branch.handle && domainInCollection.handle){
                                url = '/' + domainInCollection.branch.handle + '/' + domainInCollection.handle + '/' + artifactType + '/' + (owner.id === 3? '': 'user:'+owner.login) + '/' + handle;
                            }
                        }
                    }
                }
            }
            return url;
        },
        getEditorURL: function() {
            var artifactType = this.get('artifactType'),
                editor_url = '/editor/',
                handle = this.get('handle'),
                realm = encodeURIComponent(this.get('realm') || ''),
                revision = this.get('revision'),
                currentUser = this.get('currentUser'),
                domainCollectionContexts = this.get('domainCollectionContexts'),
                hasDomainCollectionContexts =  domainCollectionContexts && domainCollectionContexts.length > 0,
                collaboration = false,
                domain, eid, index, labels, domains;
            if(hasDomainCollectionContexts){
                domains = domainCollectionContexts.filter(function(domainCollectionContext){
                    return domainCollectionContext.domain;
                });
            }
            if(domains && domains.length > 0){
                domain = domains[0].domain;
            }
            if (artifactType === "asmtpractice" || artifactType === "asmtquiz"){
                // domain = this.get('domain');
                if (!domain || (domain && !domain.encodedID)){
                    console.log("Could not find domain for this artifact, editor link not available.");
                    return '#';
                }
                eid = domain.encodedID;
                editor_url += "/test/" + artifactType.replace(/asmt/, '') + "/" + eid + "/" +  handle + "/" + realm;
                editor_url += "?referrer=my_content";
            } else {
                if( hasDomainCollectionContexts ){ // will modify this later
                  editor_url += 'c/';
                }
                if (realm) {
                    editor_url += realm + "/";
                }
                editor_url += artifactType + "/" + handle;


            }
            labels = this.getLabels();
            for (index = 0; index < labels.length; index++) {
                if (labels[index].label === 'Collaboration') {
                    collaboration = true;
                    break;
                }
            }
            if ((currentUser.id !== this.get('creator').id) && !collaboration) {
                editor_url+= "/r" + revision;
            }
            return editor_url;
        },
        getRevision: function(){
            return this.get('revisions')[0];
        },
        getLabels: function(){
            var labels = [], revision = this.getRevision();
            if(revision.labels){
                labels = revision.labels;
            }
            return labels;
        },
        getSubject: function(){
            var subjects = this.get('subjects');
            if(subjects && subjects.length > 0){
                return subjects.map(function(subject){ return subject.name}).join(', ');
            }
            return '';
        },
        getGrades : function(){
            var grades = [],
                gradeGrid = this.get('gradeGrid'),
                numGrades = gradeGrid.length;
            if (numGrades !== 0){
                for (var i = 0; i<numGrades; i++){
                    grades.push(gradeGrid[i][1]);
                }
            }
            return grades.join(", ");
        },
        getThumbnail: function(){
            var thumbnail = this.get('coverImageSatelliteUrl');
            if (!thumbnail) {
                if ( _(LibraryItem.book_types).contains(this.get('artifactType')) ){
                    thumbnail = "/media/images/thumb_dflt_flexbook_sm.png";
                } else {
                    thumbnail = "/media/images/" + this.get('modalityGroupInfo').default_thumb;
                }
            }
            return thumbnail;
        },
        toJSON: function() {
            var json = Backbone.Model.prototype.toJSON.apply(this);
            return $.extend(json, {
                details_url : this.getDetailsURL(),
                editor_url : this.getEditorURL(),
                labels : this.getLabels(),
                subject: this.getSubject(),
                grades: this.getGrades(),
                thumbnail : this.getThumbnail()
            });
        },
    },{
        fromJSON: function(obj){
            var item;
            if ( obj.artifactID ){
                item = new LibraryItem(obj);
            } else {
                item = new LibraryFileItem(obj);
            }
            return item;
        },
        book_types : ['book', 'tebook', 'workbook', 'labkit', 'quizbook'] //TODO: find a way to use Artifact model from old JS
    });
    var LibraryFileItem = LibraryItem.extend({
        getDetailsURL : function(){
            var realm = encodeURIComponent(this.get('realm')),
                handle = this.get('handle'),
                type = this.get('type');
            return  '/' + realm + '/resource/' + type + '/' + handle;
        },
        isPublic : function(){
            var published = false,
                revision = this.get('revisions')[0];
            if (revision && revision.isPublic){
                published = true;
            }
            return published;
        },
        toJSON: function(){
            var json = Backbone.Model.prototype.toJSON.apply(this);
            return $.extend(json, {
                title : this.get('name'),
                labels: this.getLabels(),
                details_url : this.getDetailsURL(),
                isPublic: this.isPublic()
            });
        }
    });
    return LibraryItem;
});
