import {
  BOOK_FETCH_SUCCESS,
  BOOK_FETCH_ERROR,
  DETAILS_FETCH_START,
  DETAILS_FETCH_SUCCESS,
  DETAILS_FETCH_ERROR,
  SHARE_TO_GROUPS_SUCCESS,
  RESET_SHARE_INFO,
  PUBLISH_SUCCESS,
  PUBLISH_START,
  ADD_TO_LIBRARY_SUCCESS,
  SET_CURRENT_SECTION,
  FETCH_SUMMARY_SUCCESS,
  FETCH_SUMMARY_ERROR
} from '../actions/actionTypes.js';
import {combineReducers} from 'redux';


export const shareInfo = (state = {}, action) => {
  if(action.type === SHARE_TO_GROUPS_SUCCESS){
    let {result} = action.payload;
    let groups = Object.values(result).map((g)=>{
      let activity =  JSON.parse(g.activityData);
      return {
        id: activity.groupID,
        name: activity.group_name
      };
    });
    return {
      shared: true,
      sharedGroups: groups
    };
  } else if(action.type === RESET_SHARE_INFO){
    return {
      shared: false
    };
  }
  return state;
};

export const messageToUsers = (state = '', action) => {
  if(action.type === BOOK_FETCH_SUCCESS){
    let {artifact: {revisions}} = action.payload;
    let {messageToUsers} = revisions[0];
    return messageToUsers || state;
  }
  return state;
};

export const flexbookLoadedReducer = (state=false, action) => {
  if (action.type === BOOK_FETCH_SUCCESS) {
    return true;
  }
  return state;
};


export const flexbookLoadErrorInfoReducer = (state='', action) => {
  if(action.type === BOOK_FETCH_ERROR){
    return action.payload.error;
  }
  return state;
};

export const tocReducer = (state={}, action) => {
  if (action.type === BOOK_FETCH_SUCCESS) {
    let { revisions: revisions, ...artifact} = action.payload.artifact;
    let children = revisions[0].children;
    let bookRevisionID = '' + artifact.id;
    let newTOC = {
      '0.0' :  bookRevisionID
    };
    for (let i = 0, il = children.length; i < il; i++){
      let child = children[i],
        childRevisionID = '' + child.revisionID,
        grandchildren, grandchild;
      let {sequenceNO: chapter} = child;
      newTOC[ chapter + '.0' ] = childRevisionID;
      grandchildren = child.children;
      for(let j = 0, jl = grandchildren.length; j < jl; j++){
        grandchild = grandchildren[j];
        let {sequenceNO: section} = grandchild;
        if(child.handle!==grandchild.handle)    //Filter out the older revisions of each artifact
        {
          newTOC[`${chapter}.${section}`] = '' + grandchild.revisionID; //TODO: shouldn't we be using sequenceNO instead?
        }
      }
    }
    return {...newTOC, ...state};
  }
  return state;
};

export const revisionsReducer = (state = {}, action) => {
  if (action.type === BOOK_FETCH_SUCCESS) {
    let {artifact} = action.payload;
    let { revisions } = artifact;
    let children = revisions[0].children;
    let bookRevisionID = '' + artifact.id;

    let newRevisions = {...state};
    newRevisions[bookRevisionID] = {
      loaded: true,
      artifact
    };
    for (let i = 0, il = children.length; i < il; i++){
      let child = children[i],
        childRevisionID = '' + child.revisionID,
        grandchildren, grandchild;
      let {...childArtifact } = child;
      newRevisions[ childRevisionID ] = {
        loaded: true,
        artifact: childArtifact
      };
      grandchildren = child.children;
      for(let j = 0, jl = grandchildren.length; j < jl; j++){
        grandchild = grandchildren[j];
        let oldRev = state[grandchild.revisionID] || {};
        newRevisions[grandchild.revisionID] = { ...oldRev, loaded:false, artifact:grandchild };
      }
    }
    return newRevisions;
  } else if ( action.type === DETAILS_FETCH_START ){
    return {
      ...state,
      loading:true
    };
  } else if ( action.type === DETAILS_FETCH_SUCCESS ){
    let artifact = action.payload;
    let newRevObj = {};
    let {artifactID:revisionID} = artifact;
    let {contentRevision: {processedContents}, children} = artifact.revisions[0];
    if(state[revisionID]){
      let oldRevArtifact = state[revisionID].artifact;
      if(artifact.revisions && oldRevArtifact.revisions)
      {
        let libraryInfos = oldRevArtifact.revisions[0].libraryInfos;
          artifact.revisions[0].libraryInfos = libraryInfos;
      }
      artifact = {...oldRevArtifact, ...artifact};
    }else{
      artifact = {...artifact};
    }
    newRevObj[revisionID] = {loaded: true, artifact, processedContents};
    for (let i = 0, il = children.length; i < il; i++){
      let childRevisionID = '' + children[i].revisionID;
      let {...childArtifact } = children[i];
      newRevObj[ childRevisionID ] = {
        loaded: false,
        artifact: childArtifact
      };
    }
    return {
      ...state,
      loading:false,
      ...newRevObj
    };

  } else if ( action.type === DETAILS_FETCH_ERROR ){
    let {revisionID, error} = action.payload;
    let oldRevObj = state[revisionID];
    let newRevObj = {};
    newRevObj[revisionID] ={
      ...oldRevObj,
      error: true,
      errorInfo: error
    };
    return {
      ...state,
      loading:false,
      ...newRevObj
    };
  } else if (action.type === ADD_TO_LIBRARY_SUCCESS) {
    let {artifact} = action.payload;
    let {id, artifactRevisionID} = artifact;
    let newRevisions = {...state};
    let revisionID = newRevisions[id]?id:artifactRevisionID;
    let currentArtifact = newRevisions[revisionID].artifact;
    currentArtifact.revisions[0].libraryInfos = [{revisionID: artifactRevisionID}];
    newRevisions[revisionID].artifact = currentArtifact;
    return {
      ...state,
      ...newRevisions
    };
  }
  return state;
};

export const publishReducer = (state=false,action='') =>{
  if(action.type === SET_CURRENT_SECTION)
  {
    return false; 
  }
  else if(action.type === PUBLISH_SUCCESS)
  {
    return true
  }
  return state;
}

export const summaries  = (state='', action) =>{
  if(action.type === FETCH_SUMMARY_ERROR)
  {
    return '';
  }
  else if(action.type === FETCH_SUMMARY_SUCCESS)
  {
    let {data} = action.payload;
    return (data && data.summaries) || state;
  }
  return state;
}

export const flexbookTOC = combineReducers({
  revisions: revisionsReducer,
  loaded: flexbookLoadedReducer,
  errorInfo: flexbookLoadErrorInfoReducer,
  toc: tocReducer,
  shareInfo,
  messageToUsers,
  publishStatus: publishReducer,
  summaries 
});
 