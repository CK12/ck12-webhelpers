import {SET_LOCATION, SET_CURRENT_SECTION, BOOK_FETCH_WO_CACHE_SUCCESS} from '../actions/actionTypes';
import {parseBookPath} from '../utils/utils.js';

export const location = (state = '', action) => {
  if ( action.type === SET_LOCATION ){
    return action.payload.location;
  }
  return state;
};

export const locationInfo = (state = {}, action) =>{
  if ( action.type === SET_LOCATION){
    let info = parseBookPath(action.payload.location);
    let {updatedTime, revision, isLatest} = state;
    revision = revision || info.revision;
    if (info.realm){
      info.artifactCreator = info.realm.split(':')[1];
    }
    return {...info, updatedTime, revision, isLatest};
  }
  if(action.type === BOOK_FETCH_WO_CACHE_SUCCESS){
    let {updatedTime, revision, revisionInfo} = action.payload.locationInfo;
    state = {
      ...state,
      updatedTime,
      revision: revisionInfo.no,
      isLatest: revisionInfo.isLatest
    }
  }
  return state;
};


export const currentTOCSection = (state = '0.0', action) => {
  if ( action.type === SET_LOCATION ){
    let info = parseBookPath(action.payload.location);
    let { chapterPos, sectionPos } = info;
    let currentSection = '0.0';
    if ( chapterPos && sectionPos ){
      currentSection = chapterPos + '.' + sectionPos;
    }
    return currentSection;
  } else if (action.type === SET_CURRENT_SECTION){
    return action.payload.section;
  }
  return state;
};
