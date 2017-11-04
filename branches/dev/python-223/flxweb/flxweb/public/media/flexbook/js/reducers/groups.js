import {GROUP_FETCH_SUCCESS } from '../actions/actionTypes';
import {combineReducers} from 'redux';


export const groupsLoaded = (state=false, action) => {
  if (action.type === GROUP_FETCH_SUCCESS) {
    return true;
  }
  return state;
};

export const groupsReducer = (state = [], action) => {
  if ( action.type === GROUP_FETCH_SUCCESS ){
    let {groups} = action.payload;
    return Object.keys(groups).map((key)=>groups[key]);
  }
  return state;
};

//TODO: create classReducer
//TODO: create assigned Class reducer


export const groups = combineReducers({
  groups: groupsReducer,
  groupsLoaded
});
