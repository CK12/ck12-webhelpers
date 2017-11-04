import {ActionTypes as Actions} from '../actions/';

const currentQuery = ( state = '', action)=>{
  const type = action.type;
  switch( type ){
    case Actions.QUERY_SELECT :
      return action.payload;    
    default:
      return state;
  }
};

const inputQuery = (state = '', action) => {
  const type = action.type;
  switch( type ){   
    case Actions.QUERY_SELECT : 
    case Actions.QUERY_CHANGE :
      return action.payload;
    default:
      return state;
  }
};

const modalitiesByQuery = (state ={}, action) => {
  const type = action.type;
  switch(type) {
    case Actions.QUERY_FETCH:
    case Actions.QUERY_FETCH_SUCCESS:
    case Actions.QUERY_FETCH_FAILURE:
      return Object.assign({}, state, {
        [action.payload.currentQuery]: queryDetails(state[action.payload.currentQuery], action)
      })
    default:
      return state
  }  
};

const queryDetails = (state ={isFetching: false, items: []}, action) => {
  switch (action.type) {    
    case Actions.QUERY_FETCH:
      return Object.assign({}, state, {
        isFetching: true
      })
    case Actions.QUERY_FETCH_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        items: action.payload.items,
      })
    case Actions.QUERY_FETCH_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.payload.error
      })
    default:
      return state
  }

}

export default {
  currentQuery,
  inputQuery,
  modalitiesByQuery
};