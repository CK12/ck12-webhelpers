import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import flexbookNavigationMiddleware from '../middlewares/flexbookNavigation';
import createReducer from '../reducers/reducers';


export const configureStore = (initialState) => {
  let reducer = createReducer();
  let middlwares = [thunk,flexbookNavigationMiddleware];
  return createStore(reducer, initialState,
    compose(applyMiddleware(...middlwares),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ));
};

export default configureStore;
