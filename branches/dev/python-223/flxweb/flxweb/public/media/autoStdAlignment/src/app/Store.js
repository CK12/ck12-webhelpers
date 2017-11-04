import { createStore, compose } from 'redux';

import Middlewares from './appMiddlewares';

import Reducers from './appReducers';


let configureStore = (instances,history, initialState = {})=> {
  return compose(Middlewares(history))(createStore)(Reducers(instances), initialState );
};

export default configureStore;
