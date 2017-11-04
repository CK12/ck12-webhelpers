import * as ActionTypes from '../actions/actionTypes';
import {combineReducers} from 'redux';


export const loaded = (state = false, action) => {
  if (action.type === ActionTypes.RECOMMENDED_MODALITIES_FETCH_SUCCESS) {
    return true;
  }
  return state;
};

export const recommendedModalities = (state={}, action) => {
  if(action.type === ActionTypes.RECOMMENDED_MODALITIES_FETCH_SUCCESS){
    let {conceptName, artifacts} = action.payload;
    let newState = {...state};
    newState[conceptName] = {loaded: true, artifacts};
    return newState;
  }
  return state;
};

