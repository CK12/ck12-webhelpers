define(['common/utils/utils', 'flxwebSaveAdaptor'], function( Util, flxwebSaveAdaptor ){

  function sendPostRequest(body, url, successCb, errorCb){
    return Util.ajax({
              type: 'POST',
              dataType:'json',
              data : JSON.stringify(body) ,
              url: url,
              accept:'application/json',
              contentType: 'application/json; charset=utf-8',
              success: successCb,
              error: errorCb
            })
  };

  function requestSaveAPI( artifact, method, successCb, errorCb , body){
        //TODO remove method from all the references
        body =  body || artifact.formSaveAPIRequest();
        return sendPostRequest(
                body,
                $.flxweb.settings.artifact_save_api_endpoint,
                function (res, status, jqxhr) {
                    formResponseObject( res, artifact, successCb, errorCb, body );
                },
                function (jqXHR, status, error) {
                    errorCb.call(null, artifact,error);
                });
  }


  function requestUpdateAPI ( url, artifact, successCb, errorCb, body){

          body =  body || artifact.formSaveAPIRequest();

          return sendPostRequest(
                  body,
                  url,
                  function (res, status, jqxhr) {
                      var response  =  res.response && res.response.artifact ? res.response.artifact : {};
                      formResponseObject( res, artifact, successCb, errorCb , body);
                  },
                  function (jqXHR, status, error) {
                      errorCb.call(null, artifact,error);
                  });
  }

  function sendPayloadForTracking( payload ){
    if ( window.trackJs){
      window.trackJs.track(payload)
    }
  }

  function getDomainDetails(domain, collections, isModality, artifactRevisionID){

      if(!domain){
        if(!isModality){
          return ;
        }
        console.warn('domain not defined');
        sendPayloadForTracking({
          error : 'domain not defined for modality artifact',
          domain : domain,
          artifactRevisionID : artifactRevisionID
        })

        return{
          branch :'UBR',
          handle : 'User-Generated-Content',
          encodedID : 'UGC.UBR.xxx'
        }
      }
      var firstCollection =  collections && collections.length > 0 ? collections[0] : null;

      var handle =  domain.handle;
      
      if( firstCollection ){
          domain.branchInfo.handle = firstCollection.collectionHandle;
          handle =  firstCollection.conceptCollectionAbsoluteHandle;
      }

      return {
        branchInfo : domain.branchInfo,
        branch :  domain.branch,
        handle :  handle,
        encodedID : domain.encodedID,
        name : domain.name
      }
  }

  function formResponseObject(response, artifact, successCb, errorCb, body){

      var responseData  = response.response.artifact;

      if(responseData){
        try{
          // setting variables like old read API
           responseData.artifactType =  responseData.type.name;

            if( !responseData.collections  && artifact ){
              responseData.collections = artifact.get('collections');
            }

            responseData.domain =  getDomainDetails( responseData.domain, responseData.collections, responseData.isModality, responseData.artifactRevisionID);


           if(responseData.context) {
             responseData.context.perma =  encodeURI(getPermaUrl( responseData.context ));
           };


           artifact_url  = getArtifactUrl(responseData); // expects domain to be set alaredy
           responseData.artifact_url =  encodeURI(artifact_url);

           responseData.perma =  encodeURI(getPermaUrl( responseData));

           if(artifact){
             var deltaResponse  = flxwebSaveAdaptor.reverseSaveAdaptor(responseData);
             // merge the deltaResponse with artifact json
             var existingObject = artifact.toJSON();
             merge( existingObject, deltaResponse);
             successCb.call(null, artifact, existingObject); // sending artifact because to cover the existing fns
           }else{
             successCb.call(null, artifact, responseData);
           }

        } catch(e){
          var adaptorErrorMessage =  'Exception at Adaptor while artifact save response with error message :'+e.message;
          sendPayloadForTracking({
            error :  adaptorErrorMessage,
            request : body,
            response :  response
          })
          errorCb( null, artifact, { statusText: 'UI Exception', status:response.responseHeader.status});
        }

      }else{
          var apiErrorMessage = 'API error while artifact save with error message :'+response.response.message+ ' status : '+ 
          response.responseHeader.status;

          console.error(
            apiErrorMessage
          );

          sendPayloadForTracking({
            error :  apiErrorMessage,
            request : body,
            response :  response
          })
          
          errorCb.call( null, artifact,{statusText: response.response.message, status:response.responseHeader.status} )
      }

    }

  function getUpdateModalityURL(artifact){
    // THERE are two cases where there can be modality gets updated in a context
    // if you are creating a new modality in a book i.e. Write a Modality
    // If you are editing an existing modality
    // Case I.
    // https://pratyush.ck12.org/new/concept/?context=user:chjhdhl1c2gua3vtyxjay2sxmi5vcmc./book/Title-track0/r1/
    //
    // Case II.
    // http://pratyush.ck12.org/editor/user%3Achjhdhl1c2gua3vtyxjay2sxmi5vcmc./book/CK-12-Middle-School-Math-Concepts-Grade-8-abc/r1/section/1.1/Interpret-Given-Bar-Graphs-MSM8/

      var location = decodeURIComponent(window.location.pathname);
      var searchQueryParam = decodeURIComponent(window.location.search);

      var canItBeContextualNewModality =  /^\/new\/concept/.test(location) && /^\?context\=/.test(searchQueryParam);
      var canItBeContexualExistingModality =  /^\/editor/.test(location);
      var componentData = [],
          initIdx = 0,
          artifactCreator,
          parentArtifactType,
          parentArtifacthandle,
          revision,
          artifactType,
          order,
          artifacthandle;

      if( canItBeContextualNewModality ){

        componentData =  searchQueryParam.replace('?context=','')
                                  .split('/')
                                  .filter(function(val){
                                    return val
                                  });
        if( componentData[initIdx] == 'c'){
          initIdx += 1;
        };

        if(/^user\:/.test(componentData[initIdx])){
            artifactCreator = componentData[initIdx].replace(/^user\:/,'');
            initIdx += 1;
        }else if( typeof artifact.creatorLogin != 'undefined' ){
          artifactCreator = artifact.creatorLogin
        }else if( artifact.context ){
          artifactCreator = artifact.context.creatorLogin
        }
        parentArtifactType =  componentData[initIdx];
        parentArtifacthandle =  componentData[ initIdx+1];
        revision  =  componentData[ initIdx+2 ] ;
        order = artifact.position;
        if( parentArtifactType && parentArtifacthandle && revision){
          return '/flx/artifact/update/artifactType='+parentArtifactType+'&artifactHandle='+parentArtifacthandle+'&artifactCreator='+artifactCreator + '/descendant/'+order;;
        }


      }else if( canItBeContexualExistingModality){

        // /editor/user%3Achjhdhl1c2gua3vtyxjay2sxmi5vcmc./book/CK-12-Middle-School-Math-Concepts-Grade-8-abc/r1/section/1.1/Interpret-Given-Bar-Graphs-MSM8/
        componentData =  location.replace('/editor/','')
                                  .split('/')
                                  .filter(function(val){
                                    return val
                                  });

        // ["user:chjhdhl1c2gua3vtyxjay2sxmi5vcmc.", "book", "CK-12-Middle-School-Math-Concepts-Grade-8-abc", "r1", "section", "1.1", "Interpret-Given-Bar-Graphs-MSM8", ""]
        //check if componentData[0] has realm or not
        if( componentData[initIdx] == 'c'){
          initIdx += 1;
        }

        if(/^user\:/.test(componentData[initIdx])){
            artifactCreator = componentData[initIdx].replace(/^user\:/,'');
            initIdx += 1;
          }else if( typeof artifact.creatorLogin != 'undefined'){
            artifactCreator = artifact.creatorLogin
          }else if( artifact.context ){
            artifactCreator = artifact.context.creatorLogin
          }
          parentArtifactType =  componentData[initIdx];
          parentArtifacthandle =  componentData[ initIdx+1];
          revision  =  componentData[ initIdx+2 ] ;
          artifactType = componentData[ initIdx + 3 ];
          order =  componentData[ initIdx+4 ];
          artifacthandle =  componentData[ initIdx+ 4];


        //flx/artifact/update/artifactType=book&artifactHandle=Metric-Units&artifactCreator=ck12editor/descendant/3.1
        if(artifacthandle){
          return '/flx/artifact/update/artifactType='+parentArtifactType+'&artifactHandle='+parentArtifacthandle+'&artifactCreator='+artifactCreator+'/descendant/'+order;
        }
      }
  }

// encodedID, domain->encodedID
function getBranchEID(artifact){
    var eid_branch;
    var eid = artifact.encodedID;

    if( !eid && artifact.domain ){
        eid =  artifact.domain.encodedID;
    }
    if(eid){
      eid_branch = eid.split('.').slice(0,2).join('.');
    }
    return eid_branch;
}

function getVersionNumer( artifact ){
    return artifact.revision;
};

function isBranchInvalid( branch ){
  if(branch && ['science','mathematics'].indexOf(branch) > -1){
      return true
  }
  return false
};


// https://gist.github.com/mathewbyrne/1280286
function slugify(text){

 if(!text || typeof text != 'string'){
   return '';
 };

 return text.toString().toLowerCase()
   .replace(/\s+/g, '-')           // Replace spaces with -
   .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
   .replace(/\-\-+/g, '-')         // Replace multiple - with single -
   .replace(/^-+/, '')             // Trim - from start of text
   .replace(/-+$/, '');            // Trim - from end of text
};

// requires domain, realm, artifactType, handle, isModality
function getArtifactUrl(artifact){
   artifact.domain  = artifact.domain || {};

    var href,
        realm = artifact.realm,
        artifactType =  artifact.artifactType,
        artifactHandle =  artifact.handle,
        revision  = getVersionNumer( artifact ),
        branch,
        domain  = artifact.domain,
        collections = artifact.collections,
        hasCollections =  (collections && collections.length > 0 ),
        branchEncodedId =  getBranchEID( artifact );
        //  "UGC.UBR.255.1339"
        if( hasCollections ){
          branch =  slugify( collections[0].collectionHandle )
        }

    if( artifact.isModality == 1){

        if( branchEncodedId && !/^UGC/.test(branchEncodedId)){
          if(!branch){
            branch  = slugify( domain.branchInfo.handle );
          }
        };
        var extRev ;
        if( revision ){
          extRev =  'r'+revision;
        }
        var domainHandle =  domain.handle;

        /**
        * mType : artifactType
        * handle : domainHandle,
        * mhandle : artifactHandle,
        * ext : extRev
        */
        // /{branch}/{handle}/{mtype}/{realm}/{mhandle}/*ext/

        if( Object.keys(domain).length == 0 || isBranchInvalid( branch )){
              // '/{realm}/{artifact_type}/{artifact_title}/*ext/'

              href =  [
                        hasCollections ? '/c':'',
                        realm,
                        artifactType,
                        artifactHandle,
                        ( extRev ? extRev : undefined )
                      ]
                      .filter(function(val){
                        return val != undefined;
                      })
                      .join('/');

        }else{
          // `/${branch}/${handle}/${mtype}/${realm}/${mhandle}/${ext}/`
              href =   [
                          hasCollections ? '/c':'',
                          (branch ? branch : 'na'), //branch
                           domainHandle, // handle
                           artifactType, // mtype
                           ( realm ? realm : undefined ), // realm
                           artifactHandle, // mhandle
                           ( extRev ? extRev : undefined ) // ext
                        ].filter(function(val){
                            return val != undefined;
                        }).join('/');
        }
        return href;

    }else{
        return '/'+getPermaUrl( artifact );
    }
}

  function getPermaUrl(artifact){
    if(!artifact){
      return '';
    }
    var artifact_handle = artifact['handle'],
        artifact_type = artifact['artifactType'],
        artifact_realm = artifact['realm'],
        revision  = artifact['revision']||
                    artifact['latestRevision'],
        hasCollections =  artifact.collections && artifact.collections.length > 0;

     if(artifact_type == 'lesson'){
        artifact_type = 'concept'
     }

     var perma = '';

     if(artifact_handle){
        perma = ''+ artifact_type+'/'+artifact_handle+'/';
     }

     if(artifact_realm)
         perma = artifact_realm + '/'+ perma;

     if(hasCollections)
         perma =  'c/'+ perma
     perma = perma.replace('%2F','%252F')
     perma = perma.replace('%5C','%255C')
     return  perma
  };


  function merge( destination, source ){
    Object.keys(source).forEach( function(key){
      if( typeof source[ key ] != 'undefined'){
          if( typeof source[key] == 'object'
              && source[key] != null
              && typeof destination[key] != 'undefined'
              && destination[key] != null
            ){
              merge( destination[key], source[key]);
            }else{
              destination[key] = source[key];
          }
      }
    })
  }

  return {
      requestSaveAPI : requestSaveAPI,
      getUpdateModalityURL : getUpdateModalityURL,
      requestUpdateAPI : requestUpdateAPI

  }
})
