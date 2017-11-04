import { createStore, compose } from 'redux';

import Middlewares from './appMiddlewares';

import Reducers from './appReducers';


let configureStore = (instances, initialState = {})=> {
  return compose(Middlewares())(createStore)(Reducers(instances), initialState );
};

export default configureStore;
