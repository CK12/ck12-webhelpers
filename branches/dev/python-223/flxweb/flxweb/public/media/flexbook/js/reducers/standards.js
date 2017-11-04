import * as ActionTypes from '../actions/actionTypes';
import {combineReducers} from 'redux';


export const showStandards = (state = false, action) => {
  if(action.type == ActionTypes.SHOW_STANDARD)
    return true;
  return state;
};

export const standardsLoaded = (state = false, action) => {
  if(action.type == ActionTypes.FETCH_STANDARDS_SUCCESS)
    return true;
  return state;
};

export const standardsReducer = (state = [], action) => {
  if ( action.type === ActionTypes.FETCH_STANDARDS_SUCCESS ){
    let {artifactID, response} = action.payload;
    let newState = {...state};
      newState[artifactID] = response;
    return newState;
  }
  return state;
};

export const selectedStandard = (state = '', action) => {
  if ( action.type == ActionTypes.FETCH_STANDARD_SUCCESS ){
    return action.payload;
  }
  if (action.type == ActionTypes.CLEAR_STANDARD ){
    return '';
  }
  return state;
};

export const standards = combineReducers({
  standards: standardsReducer,
  selectedStandard,
  standardsLoaded,
  showStandards
});
