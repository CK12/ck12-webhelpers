import {
  ActionTypes as Actions
} from '../actions/';

import {subjectsConfig} from '../app/Config';

/**
* Reducer Structure
* {
  selectedSubjects : []
}
*
*
*/


const selectedSubjects = ( state = [], action)=>{
  const type = action.type;
  switch( type ){
  case Actions.SUB_SELECTION_SUB_SELECTION_CHANGED :
        // change the hashmap with the true or false;
    const code = action.payload.branch;
    let newState = Object.assign([], state);
    let isSubjSelected =  newState.includes(code);
    if( isSubjSelected ){
        newState =  newState.filter(val=>val!=code);
    }else{
        newState.push(code);
    }
    return newState;
    break;
  default:
    return state;
  }
};

export default {
  selectedSubjects
};
