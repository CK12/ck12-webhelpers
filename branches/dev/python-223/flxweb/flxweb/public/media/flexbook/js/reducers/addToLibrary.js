import {
  ADDTOFLEXBOOK_FETCH_SUCCESS
} from '../actions/actionTypes';

export const addToLibrary = (state={}, action) => {
  if(action.type === ADDTOFLEXBOOK_FETCH_SUCCESS){
    let {data} = action.payload;
    return {...data};
  }
  return state;
};
