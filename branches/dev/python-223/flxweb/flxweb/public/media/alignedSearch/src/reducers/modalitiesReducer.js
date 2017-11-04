import {ActionTypes as Actions} from '../actions/';

const modalities = (state ={}, action) => {
  const type = action.type;
  switch(type) {
    case Actions.MODALITY_FETCH:
    case Actions.MODALITY_FETCH_SUCCESS:
    case Actions.MODALITY_FETCH_FAILURE:
      return Object.assign({}, state, {
        [action.payload.modalityId]: modality(state[action.payload.modalityId], action)
      })
    default:
      return state
  }  
};

const modality = (state ={isFetching: false, xhtml: ''}, action) => {
  switch (action.type) {    
    case Actions.MODALITY_FETCH:
      return Object.assign({}, state, {
        isFetching: true
      })
    case Actions.MODALITY_FETCH_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        id: action.payload.modalityId,
        xhtml: action.payload.xhtml,
      })
    case Actions.MODALITY_FETCH_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.payload.error
      })
    default:
      return state
  }

}

export default {
  modalities
};