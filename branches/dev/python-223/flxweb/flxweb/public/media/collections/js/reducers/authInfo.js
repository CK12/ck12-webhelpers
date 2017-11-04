export const authInfo = (state = {
  authFound: false,
  error:false,
  auth:{}
}, action) => {
  if (action.type === 'AUTH_FETCH_SUCCESS'){
    let newState = {
      ...state,
      authFound: true
    };
    newState.auth = action.payload;
    return newState;
  }
  if (action.type === 'AUTH_FETCH_ERROR'){
    let newState = {
      ...state,
      authFound: true,
      error: true
    };
    newState.auth = {};
    return newState;
  }
  return state;
};