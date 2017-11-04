import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createReducer from '../reducers/reducers';


export const configureStore = (initialState) => {
  let reducer = createReducer();
  let middlwares = [thunk];
  return createStore(reducer, initialState,
    compose(applyMiddleware(...middlwares),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ));
};

export default configureStore;
