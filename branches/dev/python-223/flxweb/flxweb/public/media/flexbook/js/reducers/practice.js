import {
  RECOMMENDED_MODALITIES_FETCH_SUCCESS,
  RECOMMENDED_MODALITIES_FETCH,
  ASSESSMENT_FETCH_SUCCESS,
  ASSESSMENT_FETCH_ERROR,
  TOGGLE_PRACTICE_WIDGET_SUCCESS,
  FETCH_PRACTICE_URL_START,
  FETCH_PRACTICE_URL_SUCCESS,
  SET_CURRENT_SECTION,
  STOP_PRACTICE_LOADING,
  UPDATE_PRACTICE_INFO
 } from '../actions/actionTypes';
import {combineReducers} from 'redux';

export const id = (state='', action) => {
  if (action.type === UPDATE_PRACTICE_INFO) {
    let {modality: practiceModality} = action.payload;
    return (practiceModality && practiceModality.id) || state;
  }
  return state;
}

export const handle = (state= '', action) => {
  if (action.type === SET_CURRENT_SECTION) {
    return '';
  }
  else if (action.type === UPDATE_PRACTICE_INFO) {
    let {modality: practiceModality} = action.payload;
    return (practiceModality && practiceModality.handle) || state;
  }
  return state;
};

export const score = (state={}, action) => {
  if(action.type === SET_CURRENT_SECTION)
  {
    return [];
  }
  if(action.type === ASSESSMENT_FETCH_SUCCESS){
    let {artifacts} = action.payload;
    return {...artifacts};
  }
  return state;
};

export const loading = (state=true, action) => {
  if(action.type === SET_CURRENT_SECTION)
  {
    return true;
  }

  if(action.type === UPDATE_PRACTICE_INFO){
    let {modality: practiceModality} = action.payload;
    return (!!practiceModality && !!practiceModality.handle);
  }
  else if(action.type === STOP_PRACTICE_LOADING){
    return false;
  }
  return state;
};

export const toggle = (state=false, action) => {
  if(action.type === TOGGLE_PRACTICE_WIDGET_SUCCESS)
  { 
    let {value} = action.payload;
    return value;
  }
  else if(action.type === SET_CURRENT_SECTION)
  {
    return false;
  }
  return state;
};

export const url = (state='', action) => {
  if( action.type === FETCH_PRACTICE_URL_START || 
      action.type === SET_CURRENT_SECTION)
  {
    return '';
  }
  else if(action.type === FETCH_PRACTICE_URL_SUCCESS)
  {
    let {url} = action.payload;
    return url;
  }
  return state;
}

export const practice = combineReducers({
  id,  
  handle,
  score,
  loading,
  toggle,
  url
});
