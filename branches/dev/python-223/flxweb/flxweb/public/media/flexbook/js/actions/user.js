import * as ActionTypes from './actionTypes.js';
import * as Services from '../services/services.js';

export const fetchUserSuccess = (userInfo) => {
  return {
    type: ActionTypes.USER_FETCH_SUCCESS,
    payload: {userInfo}
  };
};

export const fetchUserError = (error) => {
  return {
    type: ActionTypes.USER_FETCH_ERROR,
    payload: {error},
    error: true
  };
};

export const fetchUser = () => {
  return (dispatch) => {
    Services.getLoggedInUser().then( (userInfo)=> {
      dispatch(fetchUserSuccess(userInfo));
    }, (err) => {
      dispatch(fetchUserError(err));
    });
  };
};
