import {ActionTypes as Actions} from '../actions/';

/**
* Reducer Structure
* {
  isLoginLoading : Boolean ,
  isSingedIn : Boolean ,
  isStdAdmin : Boolean,
}
*
*
*/


const isLoginLoading = ( state = true, action)=>{
  const type = action.type;
  switch( type ){

  case Actions.SIGN_IN_PAGE_NOT_LOGGED_IN :
  case Actions.SIGN_IN_PAGE_ACCESS_FORBIDDEN :
  case Actions.SIGN_IN_PAGE_ACCESS_PROVIDED :
    return false;
    break;
  default:
    return state;
  }
};

const isSingedIn = ( state = false, action)=>{
  const type = action.type;
  switch( type ){
  case Actions.SIGN_IN_PAGE_ACCESS_FORBIDDEN :
  case Actions.SIGN_IN_PAGE_ACCESS_PROVIDED :
    return true;
    break;
  default:
    return state;
  }
};


const isStdAdmin = ( state = false, action)=>{
  const type = action.type;
  switch( type ){
  case Actions.SIGN_IN_PAGE_ACCESS_PROVIDED :
    return true;
    break;
  default:
    return state;
  }
};


export default {
  isSingedIn,
  isStdAdmin,
  isLoginLoading
};
