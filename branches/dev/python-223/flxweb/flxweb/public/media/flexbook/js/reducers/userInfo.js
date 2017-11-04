import {USER_FETCH_SUCCESS} from '../actions/actionTypes';

export const userInfo = (state = {
  authID: 2,
  loggedIn: false
}, action) => {
  if ( action.type === USER_FETCH_SUCCESS ){
    let {userInfo} = action.payload;
    return {...userInfo, loggedIn: true};
  }
  return state;
};
