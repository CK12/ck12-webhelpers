define([], function(){

  //key is essentially the old API attribute and value is

  var mapping = {}

  /**

  9 | contributor  |
  |  4 | domain       |
  |  2 | grade level  |
  | 11 | internal-tag |
  |  7 | level        |
  | 10 | pseudodomain |
  |  8 | search       |
  |  5 | standard     |
  |  1 | state        |
  |  3 | subject      |
  |  6 | tag

  domain, grade level, level, standard, state, subject

  */
  var _saveMapping = function(data){
    if(!data || (typeof data != 'object' &&
    ( data.constructor.name !='Object' ||
      Object.prototype.toString.call(data)  != "[object Object]"
    ))){
      return data;
    };

    return {
       "id": getID( data, 'id'),
       "revisionID": getRevisionID( data, 'artifactRevisionID'),
       "type":getType( data, 'type'),
       "authors":getAuthors( data, 'authors'),
       "handle":data.handle,
       "creator": getCreatorId( data, 'creator'),
       "description": getDescription(data, 'description'),
       "encodedID": data.encodedID || data.encodeID,
       "license":getLicence( data, 'licence'),
       "language": getLanguage( data, 'language'),
       "title": data.title,
       tagTerms : getTagTerms( data, 'tagTerms'),
       "searchTerms":getSearchTerms( data, 'searchTerms') ,
       "browseTerms":getBrowseTerms( data, 'browseTerms'),
       "forUpdate": getForUpdate( data, 'forUpdate'),
       "resources": getResources( data, 'resources'),
       "collections": getCollections( data, 'collections'),
       "revisions":[
          {
             "children": getChildren( data, 'children'), // it has to have same fields as the parent , so structure needs to recursively follow
             "contentRevision":{
                "xhtml": getXHTML( data, 'xhtml')
             },
             "comment": getRevisionComments(data),
             "messageToUsers": getMessageToUsers(data)
          }
       ]
    };
  };


var getXHTML = function( data, fieldName){
  if( data.artifactType == 'lesson'){
    if( typeof data.xhtml == 'undefined' &&
        typeof data.lesson_objectives == 'undefined' &&
        typeof data.lesson_vocabulary == 'undefined' &&
        typeof data.objectives == 'undefined' &&
        typeof data.vocabulary == 'undefined'
    ){
      return
    }
      var concept_xhtml = _getTruncatedXHTML(data.xhtml);

      var objectives_xhtml = filterMetaData(data['lesson_objectives'] || '') ;

      var existing_objectives_xhtml = filterContent( concept_xhtml,'x-ck12-data-objectives')[0] ;

      var vocabulary_xhtml  = filterMetaData(data['lesson_vocabulary'] || '') ;

      var existing_vocabulary_xhtml =  filterContent( concept_xhtml,'x-ck12-data-vocabulary').slice(-1).pop();

      var filtered_concept_xhtml  =  getFilteredContent( concept_xhtml );

      return  '<body>\
                <div class="x-ck12-data-objectives">'+ (objectives_xhtml || existing_objectives_xhtml || '')+'</div>\
                <div class="x-ck12-data-concept">'+ filtered_concept_xhtml+'</div>\
                <div class="x-ck12-data-vocabulary">'+ ( vocabulary_xhtml || existing_vocabulary_xhtml  || '')+'</div>\
              </body>';

  }else if( data.artifactType == 'chapter'){
    if( typeof data.xhtml == 'undefined' &&
        typeof data.chapterIntroduction == 'undefined' &&
        typeof data.chapterSummary == 'undefined'
    ){
      return
    }

    var concept_xhtml = _getTruncatedXHTML(data.xhtml),
        chapterIntroduction = filterMetaData(data['chapterIntroduction'] || '') ||
                              filterContent(concept_xhtml, 'x-ck12-data')[0] ||
                              '',

        chapterSummary = filterMetaData(data['chapterSummary'] || '') ||
                          filterContent(concept_xhtml, 'x-ck12-data')[1] ||
                          '';
        chapterIntroduction =  typeof chapterIntroduction == 'string' ? chapterIntroduction.trim() : chapterIntroduction;
        chapterSummary =  typeof chapterSummary == 'string' ? chapterSummary.trim() : chapterSummary;

    concept_xhtml =  filterContent( concept_xhtml,'x-ck12-data-lesson')[0] || '<!-- <lessons /> -->';

    return '<body>\
              <div class="x-ck12-data">'+chapterIntroduction+'</div>\
              <div class="x-ck12-data-lesson">'+concept_xhtml+'</div>\
              <div class="x-ck12-data">'+chapterSummary+'</div>\
            </body>';


  }else{
    if( data && data.revisions && Array.isArray(data.revisions) && // MAY BE THIS IF STATEMENT IS NOT REQUIRED AT ALL TODO
              data.revisions[0] && data.revisions[0].contentRevision){
        return data.revisions[0].contentRevision.xhtml;
    }else{
        return data.xhtml;
    }
  }
};


var getFilteredContent = function ( xhtml ){
  if( xhtml ){
    var _xhtml = xhtml;

    var regex = new RegExp('<!-- Begin inserted XHTML \\[CONCEPT: \\d*\\] -->([^]*?)<!-- End inserted XHTML \\[CONCEPT: \\d*\\] -->', 'm');
    var search =  regex.exec(xhtml);
      if( search && search.length > 0 ){
          _xhtml =  search[1];
          _xhtml =  _xhtml.replace( '<h2 id="x-ck12-Q29uY2VwdA.."> Concept </h2>','' );
      }else{
         search = new RegExp('<div class="x-ck12-data-concept">([^]*?)</div>', 'm').exec( xhtml );
         if( search  && search.length > 0 ){
           _xhtml =  search[1];
         }
      }
      _xhtml = _xhtml.replace('<!--    <concept /> -->','');
      _xhtml = _xhtml.replace('<!-- %LOS% -->','');
      _xhtml = _xhtml.replace('<!-- %LVS% -->','');
  }
  return _xhtml;
}

var filterMetaData =  function(xhtml){
  if( xhtml == '<p></p>'){
    xhtml  = '';
  }
  return xhtml;
};

var getRevisionComments = function( data){
    return data['revisionComment'];
};
var getMessageToUsers = function(data){
    return data['messageToUsers'];
}

//deprecated
var filterConceptArea = function(xhtml, tagId){
    // find
    var regexp =  new RegExp("\\<div\\s*class\=\""+tagId+"\"\>");
    var match =  xhtml.match(regexp);
    if( match ){
      var idx  = xhtml.indexOf(match[0]) + match[0].length;
      xhtml  = xhtml.slice(idx);
      var endMatch =  xhtml.search('</div>');
      if(endMatch == -1 ){
          console.error('div tag is not closed in xhtml')
      }else{
          xhtml  = xhtml.slice(0, endMatch);
      }

    }
    //Bug 56066
    //Comments are important for author attribution.
    //Don't strip out xhtml comments.
    //xhtml =  xhtml.replace(/<!--[\s\S]*?-->/g, '');
    return xhtml;
}

var filterContent =  function( xhtml, tag ){

    var tempDiv =  document.createElement('div');
    tempDiv.innerHTML =  xhtml;
    var contentArray  = tempDiv.getElementsByClassName(tag);
    return Array.prototype.slice.call(contentArray).map(function( partialxhtml ){
        return partialxhtml.innerHTML;
    })
};

var _getTruncatedXHTML =  function(xhtml){
    if(!xhtml) return '';

    var startIdx = xhtml.indexOf('<body>'),
        endIdx = xhtml.indexOf('</body>');
        if (startIdx > 0 && endIdx > 0){
          xhtml = xhtml.slice(startIdx+6, endIdx);
        }
      return xhtml;
}

var getCreatorId =  function( data, fieldName ){
      if( data && typeof data.creator =='object' && typeof data.creator.id !='undefined'){
          return data.creator;
      }
      return { id : data.creatorID };
};

var getCollections = function( data, fieldName ){
  if( !data.forChangeFields || !data.forChangeFields['collections']){
    return
  }
  var collections =  data.collections || [];
  return collections.map( function( val ){
        if ( !val.conceptCollectionHandle ){
          val.conceptCollectionHandle =  val.collectionHandle + "-::-" + val.conceptCollectionAbsoluteHandle
        }
        return {
          collectionCreatorID : Number(val.collectionCreatorID),
          conceptCollectionHandle : val.conceptCollectionHandle
        }
  })
};
var getForUpdate =  function( data, fieldName){
    if( data.artifactType == 'chapter'){
      return data.isDirty;
    }
    return data && data.__dirty;
};

var getResources =  function( data, fieldName){

  if( !data.forChangeFields || !data.forChangeFields['resources']){
    return
  }
  var resources  = [];

  if( data.coverRevision ){
      resources.push({ id : data.coverRevision.resourceID});
  }else if( data.coverImageResourceID){
      resources.push({ id : data.coverImageResourceID });
  }
  if( data && data.attachments && Array.isArray(data.attachments)){
      resources =  resources.concat(
              data.attachments.map(function(val){
                return {
                  id : val.id,
                  creator: {
                    id : val.ownerID
                  },
                  handle: val.handle,
                  type: {
                    id: val.type,
                    name: val.type.name
                  }
                }
              })
            );

  }else if( data && data.resourceRevisionIDs && Array.isArray(data.resourceRevisionIDs)){
      resources =  resources.concat(
                    data.resourceRevisionIDs.map(function(val){
                      return {
                          revisionID : val
                        }
                      })
                    );

  }else if( data && Array.isArray( data.revisions) && typeof data.revisions[0] == 'object'
            && data.revisions[0].attachments){
      resources  = resources.concat(
                    data.revisions[0].attachments.map(function(attachment){
                      return {
                        revisionID : attachment.resourceRevisionID
                      }
                    })
                  );
  }
  return resources;
}

var getDescription =  function( data, fieldName){
    if( data[fieldName]){
      return data[fieldName] || '';
    }
    return data.summary || '';
}

var getLicence =  function( data, fieldName){
      if( data){
        var licenseObjType = typeof data.license;

        if( licenseObjType == 'object' && data.license != null) return data.license;

        if( licenseObjType == 'string'){
            return {
              "description":data.license,
              "id": data.licenceId, // read does not have it
              "name":data.license
            }
        }
        return {};

      }else{
        return {};
      }
};

var getLanguage = function( data, fieldName){
  if( data){
    return {
      name : data['language']
    }
  }
  return {};
};

var getID =  function( data, fieldName){
   if(!data){
     return ;
   }
   if(data.id == 'new' || /new/.test(data.id)){
      return ;
   }
   return data[fieldName]|| data.id;
};

var getRevisionID =  function( data, fieldName){
    if(!data){
      return ;
    }
    if( data['artifactRevisionID']){
      if(data['artifactRevisionID'] == 'new' || /new/.test(data['artifactRevisionID'])){
         return ;
      }
      // if( data['artifactRevisionID'] != data['latestRevisionID'] && typeof data['latestRevisionID'] != 'undefined' ){
      //    return data['latestRevisionID'];
      // }
      return data['artifactRevisionID'];
    }
     if( !data.revisions || !Array.isArray(data.revisions) || typeof data.revisions[0] != 'object'){
        return ;
     };
     return  data.revisions[0].id;
};

var getType =  function( data, fieldName){
      /**
        {
          name,
          id
        }
      */
      if(!data || !data.type){
        if( data.artifactType){ // for new artifacts
          return {
            name : data.artifactType
          }
        }else{
           return ;
        }
      }
      return {
        name : data.type.name,
        id : data.type.id
      }
};

var getAuthors =  function( data, fieldName){

  if( !data.forChangeFields || !data.forChangeFields['authors'] ){
    return
  }

  if( !data.authors || !Array.isArray(data.authors)){
    return [];
  }

  return data.authors.map( function( val){
           return {
                   name : val.name,
                   role:{
                           id: val.roleID ,
                           name: val.role,
                           description: val.description
                         },
                   sequence:val.sequence
                 }
  })
};


var getSearchTerms  = function( data, fieldName){

    if( !data.forChangeFields || !data.forChangeFields['search'] ){
      return
    }

    if(
      (!data.searchGrid || !Array.isArray(data.searchGrid)) &&
      !(data.changed_metadata && data.changed_metadata.add && data.changed_metadata.add.search )
    ){
      return ;
    }

    var searchGrid =  data.searchGrid || [];
    var addedSearchArr  =  [],
        removedSearchArr = [];
        //
    if( data.changed_metadata && data.changed_metadata.remove && data.changed_metadata.remove.search ){
        removedSearchArr = data.changed_metadata.remove.search;
    };
    if( data.changed_metadata && data.changed_metadata.add && data.changed_metadata.add.search ){
        addedSearchArr = data.changed_metadata.add.search.map( function(val){ return { name:val}});
    };

    var searchGridList  = searchGrid.map( function( val){
                          return { id : val[0], name:val[1]}
                        });

    /**
    * If we remove a search, then removedSearchArr contains array of names
    * If we remove a search, and add another search with same name, then the tag gets restored and removedSearchArr will be empty ARRAY
    *
    */
    if( removedSearchArr.length  > 0 ){
      searchGridList =  searchGridList.filter(function( val ){ return  removedSearchArr.indexOf(val.name) == -1 });
    }

    return searchGridList.concat(addedSearchArr);
};


var getTagTerms  = function( data, fieldName){

    if( !data.forChangeFields || !data.forChangeFields['tag'] ){
      return
    }

    if(
      (!data.tagGrid || !Array.isArray(data.tagGrid)) &&
      !(data.changed_metadata && data.changed_metadata.add && data.changed_metadata.add.tag )
      ){
      return ;
    }

    var tagGrid =  data.tagGrid || [];
    // changed_metadata has all the details of
    // grade level
    // level
    // search
    // subject
    // tag
    // changed_metadata.add.tag  -- add to the list
    // changed_metadata.remove.tag -- remove from the list
    var addedTagArr  =  [],
        removedTagArr = [];
        //
    if( data.changed_metadata && data.changed_metadata.remove && data.changed_metadata.remove.tag ){
        removedTagArr = data.changed_metadata.remove.tag;  // THIS IS AN ARRAY OF TAG NAMES
    };
    if( data.changed_metadata && data.changed_metadata.add && data.changed_metadata.add.tag ){
        addedTagArr = data.changed_metadata.add.tag.map( function(val){ return { name:val}});
    };

    var tagGridList  = tagGrid.map( function( val){
                      return { id : val[0], name:val[1]}
                  });
    /**
    * If we remove a tag, then removedTagArr contains array of names
    * If we remove a tag, and add another tag with same name, then the tag gets restored and removedTagArr will be empty ARRAY
    *
    */
    if( removedTagArr.length  > 0 ){
      tagGridList =  tagGridList.filter(function( val ){ return  removedTagArr.indexOf(val.name) == -1 });
    }

    return tagGridList.concat(addedTagArr);
};

var getBrowseTerms  = function( data, fieldName){
    if( !data.forChangeFields || ( !data.forChangeFields['subject'] &&
      !data.forChangeFields['grade level'] && !data.forChangeFields['domains']
      && !data.forChangeFields['level']
    )){
      return
    }
    //   domain, grade level, level, standard, state, subject

    //
    var returnedData =  [];

    // subject
    returnedData =  returnedData.concat(getSubjectTerms(data));

    // grade level
    returnedData =  returnedData.concat( getGradeLevelTerms(data));

    // domain
    returnedData =  returnedData.concat( getDomainTerms( data ) );


    // level
    if( data.level ){
      returnedData =  returnedData.concat([ { name : data.level, typeName:'level'} ]);
    }else if( data.changed_metadata && data.changed_metadata.add && data.changed_metadata.add.level ){
      returnedData =  returnedData.concat([ { name : data.changed_metadata.add.level, typeName:'level'} ]);
    }

      // state

      // standard

      return returnedData;
};

var getSubjectTerms = function( data ){

  var addedSubjectArr  =  [],
      removedSubjectArr = [];
      //
  if( data.changed_metadata && data.changed_metadata.remove && data.changed_metadata.remove.subject ){
      removedSubjectArr = data.changed_metadata.remove.subject;  // THIS IS AN ARRAY OF SUBJECT NAMES
  };
  if( data.changed_metadata && data.changed_metadata.add && data.changed_metadata.add.subject ){
      addedSubjectArr = data.changed_metadata.add.subject.map( function(val){ return { name:val , typeName :'subject'}});
  };

  var subjectGrid  = data.subjectGrid || [];

  subjectGrid = subjectGrid.map( function( val){
                return { id : val[0], name:val[1], typeName: 'subject'}
              })


  if( removedSubjectArr.length  > 0 && subjectGrid.length > 0 ){
      subjectGrid =  subjectGrid.filter(function( val ){ return  removedSubjectArr.indexOf(val.name) == -1 });
  };

  return subjectGrid.concat(addedSubjectArr);

};

var getGradeLevelTerms = function( data ){
  var addedGradeLevelArr  =  [],
      removedGradeLevelArr = [];
      //
  if( data.changed_metadata && data.changed_metadata.remove && data.changed_metadata.remove['grade level'] ){
      removedGradeLevelArr = data.changed_metadata.remove['grade level'];  // THIS IS AN ARRAY OF Grade Level NAMES
  };
  if( data.changed_metadata && data.changed_metadata.add && data.changed_metadata.add['grade level'] ){
      addedGradeLevelArr = data.changed_metadata.add['grade level'].map( function(val){ return { name: String(val) , typeName:'grade level'}});
  };

  var gradeGrid   = data.gradeGrid || [];

  gradeGrid = gradeGrid.map( function( val){
      return { id : val[0], name: String(val[1]), typeName: 'grade level'}
  });


  if( removedGradeLevelArr.length  > 0 && gradeGrid.length > 0 ){
      gradeGrid =  gradeGrid.filter(function( val ){
         return  removedGradeLevelArr.indexOf(parseInt(val.name)) == -1
       });
  };

  return gradeGrid.concat(addedGradeLevelArr);
};

var getDomainTerms =  function( data ){
  var domain = data.domain || {};
  var deltaDomain  = data.domains || [];

  var addedDomainTerms =  [],
      removedDomainTerms =  [];
  deltaDomain.forEach( function( val ){

      if( val.action  == 'add'){
        addedDomainTerms.push(val);
      }else if( val.action == 'remove'){
        removedDomainTerms.push(val);
      }

  });
  var returnedArr = [], found = false;

  if( removedDomainTerms.length > 0 ){
        for( var i =0; i < removedDomainTerms.length ; i++){
            var removedDomainTerm =  removedDomainTerms[i];
            if( removedDomainTerm.encodedid == domain.encodedID){
              found = true;
              break;
            }
        }
  }

  returnedArr =  addedDomainTerms
                  .map(function(val){
                    return {
                      id : val.id,
                      name : val.browseTerm,
                      encodedID : val.encodedid,
                      typeName : /^UGC/.test(val.encodedid) ? 'pseudodomain': 'domain' //by default is will always be domain, DUH!
                    }
                  })
                  .filter(function(val){
                    // if current domain is found in removed domain list and it is found in added domain, we keep it
                    return ( found   ||
                            (( domain.encodedID && val.encodedID != domain.encodedID ) ||  !domain.encodedID)
                          );
                  });

  if(!found && domain.encodedID){

    if( /^UGC/.test(domain.encodedID)){

        if( returnedArr.length ==  0 ){
          returnedArr.push({
              id : domain.id,
              name : domain.name,
              encodedID : domain.encodedID,
              // typeName : /^UGC/.test(domain.encodedID) ? 'pseudodomain': 'domain'
              typeName : 'pseudodomain'
          })
        }else{

        }

    }else{

      returnedArr.push({
          id : domain.id,
          name : domain.name,
          encodedID : domain.encodedID,
          // typeName : /^UGC/.test(domain.encodedID) ? 'pseudodomain': 'domain'
          typeName : 'domain'
      })

    }

  }

  return returnedArr;
};

var getChildren =  function( data, fieldName){

  if( data && data.children &&
    ( data.children.constructor.name == 'Array' ||
      Object.prototype.toString.call(data.children)  == "[object Array]"
    )){
     return data.children.map(function( val){
       if( typeof val == 'number'){
          return {revisionID : val}; // ASSUMPTION: THAT READ API HAS CHILDREN WITH ONLY ID ARE THE REVISIONID
       };
        return _saveMapping(val)
      });
  }else if( data && data.revisions && Array.isArray(data.revisions) && typeof data.revisions[0] == 'object'
          && data.revisions[0].children && Array.isArray(data.revisions[0].children)){

       return data.revisions[0].children.map(function(val){
           if( typeof val == 'number'){
              return {revisionID : val}; // ASSUMPTION: THAT READ API HAS CHILDREN WITH ONLY ID ARE THE REVISIONID
           }
          return _saveMapping(val)
        })
        .filter(function(child){ return child});

    }else{
        return [];
    }
}


/**  Reverse Save Adaptor */
var _reverseSaveMapping = function( successResponseObj, responseStatusObject ){

  if(!successResponseObj || (typeof successResponseObj != 'object' &&
  ( successResponseObj.constructor.name !='Object' ||
    Object.prototype.toString.call(successResponseObj)  != "[object Object]"
  ) )) return successResponseObj;


  /**
  {
    "response": {
      "artifact": {
        perma : ,
        artifactID : ,
        artifactRevisionID : ,
        context : {
          artifactType,
          handle,
          latestRevision
        },
        position:,
        domain : { encodedID, }
        realm
        artifactType
        handle
        isModality
        encodedID
        revision : ,
        type : {
          name :
        }
      }
    },
    "responseHeader": {
      "source": "dn-lbqn.px12.bet",
      "status": 0,
      "time": "0:00:00.363810"
    }
  }


  */

  return  {
            perma : successResponseObj['perma'] ,
            artifactID : successResponseObj['artifactID'] ,
            id : successResponseObj['artifactID'],
            artifactRevisionID : successResponseObj['artifactRevisionID'],
            creatorID : successResponseObj['creatorID'],
            // revisions: successResponseObj['revisions'],
            artifact_url : successResponseObj['artifact_url'],
            revisionID : successResponseObj['artifactRevisionID'],
            context : successResponseObj['context'],
            position: successResponseObj['position'],
            domain : successResponseObj['domain'],
            realm : successResponseObj['realm'],
            artifactType : successResponseObj['artifactType'],
            handle : successResponseObj['handle'],
            isModality : successResponseObj['isModality'],
            encodedID : successResponseObj['encodedID'],
            revision : successResponseObj['revision'],
            level : successResponseObj['level'],
            latestRevision : successResponseObj['latestRevision'] || successResponseObj['revision'],
            permaUrl : successResponseObj['permaUrl'],
            type : {
              "modality": successResponseObj['isModality'],
          		"name": successResponseObj['type'].name,
          		"id": successResponseObj['type'].id
            },
            coverImage : successResponseObj['coverImage']
          };

}


/** */
  var _saveAdaptor =  function(data){
      return window.btoa( unescape( encodeURIComponent(JSON.stringify(_saveMapping(data)))));
  };

  return {
    saveAdaptor : _saveAdaptor,
    reverseSaveAdaptor : _reverseSaveMapping
  }
})
