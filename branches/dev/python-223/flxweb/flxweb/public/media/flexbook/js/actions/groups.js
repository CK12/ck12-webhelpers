import * as ActionTypes from './actionTypes.js';
import * as Services from '../services/services.js';

export const fetchGroupsSuccess = (groups) => {
  return {
    type: ActionTypes.GROUP_FETCH_SUCCESS,
    payload: groups
  };
};

export const fetchGroupsError = (error) => {
  return {
    type: ActionTypes.GROUP_FETCH_ERROR,
    payload: {error},
    error: true
  };
};

export const shareToGroupsSuccess = (data) => {
  return {
    type: ActionTypes.SHARE_TO_GROUPS_SUCCESS,
    payload: data
  };
};

export const shareToGroupsError = (error) => {
  return {
    type: ActionTypes.SHARE_TO_GROUPS_ERROR,
    payload: {error},
    error: true
  };
};

export const resetShareInfo = () => {
  return {
    type: ActionTypes.RESET_SHARE_INFO
  };
};

export const fetchGroups = () => {
  return (dispatch) => {
    Services.fetchGroups().then( (groups)=> {
      dispatch(fetchGroupsSuccess(groups));
    }, (err) => {
      dispatch(fetchGroupsError(err));
    });
  };
};

export const shareToGroups = (data) => {
  return (dispatch) => {
    Services.shareToGroups(data)
    .then((response) => {
      if(!response.message)
        dispatch(shareToGroupsSuccess(response));
    }, (err) => {
      dispatch(shareToGroupsError(err));
    });
  };
};
