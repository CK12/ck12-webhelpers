import {  
  FETCH_COLLOBORATION_DETAILS_START,
  FETCH_COLLOBORATION_DETAILS_SUCCESS,
  FETCH_SECTION_ASSIGNEE_DETAILS_START,
  FETCH_SECTION_ASSIGNEE_DETAILS_SUCCESS
} from '../actions/actionTypes';
import {combineReducers} from 'redux';
import includes from 'lodash/includes';

export const isColloborater = (state={}, action) => {
  if (action.type === FETCH_COLLOBORATION_DETAILS_SUCCESS) {
    let {group, userID} = action.payload;
    if(group)
    {
      if(!group.members)
      {
        return false;
      }
    	let {members} = group;
    	let isPresent = false;
    	for(let index in members)
    	{
    		if(members[index].id==userID)
    		{
    			isPresent = true;
    		}	
    	}
      return isPresent;
    }
  }
  return state;
};

export const isColloborated = (state=false, action) => {
  if (action.type === FETCH_COLLOBORATION_DETAILS_SUCCESS) {
    let {group, userID} = action.payload; 
    if(group && group.members)
    {
      return true
    }
  }
  return state;
};

export const loading = (state={},action) => {
  let {fetchingColloboration, fetchingAssign} = state;
  if (action.type === FETCH_COLLOBORATION_DETAILS_START) {
    fetchingColloboration = true;
  }
  if (action.type === FETCH_COLLOBORATION_DETAILS_SUCCESS) {
    fetchingColloboration = false;
  }
  if (action.type === FETCH_SECTION_ASSIGNEE_DETAILS_START) {
    fetchingAssign = true;
  }
  if (action.type === FETCH_SECTION_ASSIGNEE_DETAILS_SUCCESS) {
    fetchingAssign = false;
  }

  state = {
      ...state,
      fetchingColloboration,
      fetchingAssign
  };

  return state;
}

export const isAssignee =(state={},action) => {
  if (action.type === FETCH_SECTION_ASSIGNEE_DETAILS_SUCCESS){
    let response = action.payload;
    return (response && response.toString().indexOf('authorized')>=0);
  }
  return state;
}

export const isAssigned =(state=false,action) => {
  if (action.type === FETCH_SECTION_ASSIGNEE_DETAILS_SUCCESS){
    let response = action.payload;
    if (response && response.message)
        return response.message.toString().indexOf('is being edited by others')>0 ;
  }
  return state;
}

export const groupEditingDetails = combineReducers({
  isColloborater,
  isColloborated,
  loading,
  isAssignee,
  isAssigned
});