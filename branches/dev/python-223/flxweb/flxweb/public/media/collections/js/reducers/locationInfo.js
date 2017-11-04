export const locationInfo = (state = {
  locationFound: false,
  location:{}
}, action) => {
  if (action.type === 'LOCATION_FETCH_SUCCESS'){
    let newState = {
      ...state,
      locationFound: true
    };
    newState.location = action.payload.ip_info;
    return newState;
  }
  if (action.type === 'LOCATION_FETCH_ERROR'){
    let newState = {
      ...state,
      locationFound: true
    };
    newState.location = {};
    return newState;
  }
  return state;
};