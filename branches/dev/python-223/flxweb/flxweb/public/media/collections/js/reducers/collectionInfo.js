export const collectionInfo = (state = {
  loaded: false,
  error: false
}, action) => {
  if (action.type === 'COLLECTION_FETCH_SUCCESS'){
    let newState = {
      ...state,
      loaded: true
    };
    newState.collection = action.payload.collection;
    return newState;
  }
  if (action.type === 'COLLECTION_FETCH_ERROR'){
    let newState = {
      ...state,
      loaded: true,
      error:true
    };
    newState.collection = {};
    return newState;
  }
  return state;
};
